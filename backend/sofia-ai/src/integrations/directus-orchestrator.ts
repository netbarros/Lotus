/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIRECTUS ORCHESTRATOR - Auto-Collection Creation from Intent
 * Sofia Builder Integration for Cognitive Mesh OS Layer 11
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This service receives schema definitions from the IntentionEngine and
 * automatically creates Directus collections, fields, and relationships.
 * 
 * It acts as the bridge between Sofia's AI-generated schemas and the
 * actual database structure in Directus.
 */

import {
    createDirectus,
    rest,
    staticToken,
    type DirectusClient,
    type RestClient,
    type StaticTokenClient,
} from '@directus/sdk';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

// Directus SDK v11 composed client type
type MagicDirectusClient = DirectusClient<object> & RestClient<object> & StaticTokenClient<object>;

export interface FieldDefinition {
    name: string;
    type: 'string' | 'text' | 'integer' | 'float' | 'boolean' | 'datetime' | 'date' | 'time' | 'json' | 'uuid' | 'csv';
    required?: boolean;
    unique?: boolean;
    default?: unknown;
    validation?: {
        pattern?: string;
        min?: number;
        max?: number;
        choices?: string[];
    };
    meta?: {
        interface?: string;
        display?: string;
        hidden?: boolean;
        readonly?: boolean;
        note?: string;
        translations?: Record<string, string>;
    };
}

export interface RelationDefinition {
    field: string;
    related_collection: string;
    type: 'one-to-many' | 'many-to-one' | 'many-to-many';
    junction_collection?: string;
    cascade_delete?: boolean;
}

export interface CollectionSchema {
    name: string;
    icon?: string;
    color?: string;
    note?: string;
    singleton?: boolean;
    hidden?: boolean;
    translations?: Record<string, string>;
    fields: FieldDefinition[];
    relations?: RelationDefinition[];
    permissions?: {
        role: string;
        actions: ('create' | 'read' | 'update' | 'delete')[];
        filter?: Record<string, unknown>;
    }[];
}

export interface IntentSchema {
    collections: CollectionSchema[];
    flows?: {
        name: string;
        trigger: string;
        operations: unknown[];
    }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// DIRECTUS ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class DirectusOrchestrator {
    private client: MagicDirectusClient;
    private adminToken: string;
    private baseUrl: string;

    constructor(baseUrl: string, adminToken: string) {
        this.baseUrl = baseUrl;
        this.adminToken = adminToken;

        // Directus SDK v11 chained initialization
        this.client = createDirectus(baseUrl)
            .with(staticToken(adminToken))
            .with(rest()) as MagicDirectusClient;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SCHEMA CREATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Create collections from an IntentionEngine schema
     */
    async createFromIntent(schema: IntentSchema): Promise<{
        collections_created: string[];
        fields_created: number;
        relations_created: number;
        errors: string[];
    }> {
        const result = {
            collections_created: [] as string[],
            fields_created: 0,
            relations_created: 0,
            errors: [] as string[],
        };

        for (const collection of schema.collections) {
            try {
                await this.createCollection(collection);
                result.collections_created.push(collection.name);
                result.fields_created += collection.fields.length;
                result.relations_created += collection.relations?.length ?? 0;
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                result.errors.push(`Failed to create ${collection.name}: ${message}`);
            }
        }

        console.log(`[DirectusOrchestrator] Created ${result.collections_created.length} collections`);
        return result;
    }

    /**
     * Create a single collection with fields and relations
     */
    async createCollection(schema: CollectionSchema): Promise<void> {
        // 1. Create the collection via REST API
        const collectionPayload = {
            collection: schema.name,
            meta: {
                icon: schema.icon ?? 'database',
                color: schema.color,
                note: schema.note,
                singleton: schema.singleton ?? false,
                hidden: schema.hidden ?? false,
                translations: schema.translations ? [
                    ...Object.entries(schema.translations).map(([lang, label]) => ({
                        language: lang,
                        translation: label,
                    })),
                ] : undefined,
            },
        };

        await this.apiRequest('POST', '/collections', collectionPayload);
        console.log(`[DirectusOrchestrator] Created collection: ${schema.name}`);

        // 2. Create fields
        for (const field of schema.fields) {
            await this.createFieldFromDefinition(schema.name, field);
        }

        // 3. Create relations
        if (schema.relations) {
            for (const relation of schema.relations) {
                await this.createRelationFromDefinition(schema.name, relation);
            }
        }
    }

    /**
     * Create a field from definition
     */
    private async createFieldFromDefinition(
        collection: string,
        field: FieldDefinition
    ): Promise<void> {
        const directusType = this.mapFieldType(field.type);

        const fieldPayload = {
            field: field.name,
            type: directusType,
            schema: {
                is_nullable: !field.required,
                is_unique: field.unique ?? false,
                default_value: field.default,
            },
            meta: {
                interface: field.meta?.interface ?? this.getDefaultInterface(field.type),
                display: field.meta?.display ?? this.getDefaultDisplay(field.type),
                hidden: field.meta?.hidden ?? false,
                readonly: field.meta?.readonly ?? false,
                note: field.meta?.note,
                validation: field.validation ? {
                    _and: [
                        field.validation.pattern ? { _regex: field.validation.pattern } : null,
                        field.validation.min !== undefined ? { _gte: field.validation.min } : null,
                        field.validation.max !== undefined ? { _lte: field.validation.max } : null,
                        field.validation.choices ? { _in: field.validation.choices } : null,
                    ].filter(Boolean),
                } : undefined,
            },
        };

        await this.apiRequest('POST', `/fields/${collection}`, fieldPayload);
    }

    /**
     * Create a relation from definition
     */
    private async createRelationFromDefinition(
        collection: string,
        relation: RelationDefinition
    ): Promise<void> {
        switch (relation.type) {
            case 'many-to-one':
                await this.apiRequest('POST', '/relations', {
                    collection,
                    field: relation.field,
                    related_collection: relation.related_collection,
                    meta: {
                        one_field: null,
                        junction_field: null,
                    },
                    schema: {
                        on_delete: relation.cascade_delete ? 'CASCADE' : 'SET NULL',
                    },
                });
                break;

            case 'one-to-many':
                await this.apiRequest('POST', '/relations', {
                    collection: relation.related_collection,
                    field: `${collection}_id`,
                    related_collection: collection,
                    meta: {
                        one_field: relation.field,
                    },
                    schema: {
                        on_delete: relation.cascade_delete ? 'CASCADE' : 'SET NULL',
                    },
                });
                break;

            case 'many-to-many':
                const junctionCollection = relation.junction_collection ??
                    `${collection}_${relation.related_collection}`;

                // Create junction collection if needed
                await this.apiRequest('POST', '/collections', {
                    collection: junctionCollection,
                    meta: {
                        hidden: true,
                        icon: 'import_export',
                    },
                });

                // Create relations to junction
                await this.apiRequest('POST', '/relations', {
                    collection: junctionCollection,
                    field: `${collection}_id`,
                    related_collection: collection,
                });

                await this.apiRequest('POST', '/relations', {
                    collection: junctionCollection,
                    field: `${relation.related_collection}_id`,
                    related_collection: relation.related_collection,
                });
                break;
        }

        console.log(`[DirectusOrchestrator] Created relation: ${collection}.${relation.field} -> ${relation.related_collection}`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // API REQUEST HELPER
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Make a direct API request to Directus
     */
    private async apiRequest<T = unknown>(
        method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
        endpoint: string,
        body?: unknown
    ): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${this.adminToken}`,
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Directus API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        return response.json() as T;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TYPE MAPPINGS
    // ═══════════════════════════════════════════════════════════════════════════

    private mapFieldType(type: FieldDefinition['type']): string {
        const typeMap: Record<string, string> = {
            string: 'string',
            text: 'text',
            integer: 'integer',
            float: 'float',
            boolean: 'boolean',
            datetime: 'timestamp',
            date: 'date',
            time: 'time',
            json: 'json',
            uuid: 'uuid',
            csv: 'csv',
        };
        return typeMap[type] ?? 'string';
    }

    private getDefaultInterface(type: FieldDefinition['type']): string {
        const interfaceMap: Record<string, string> = {
            string: 'input',
            text: 'input-rich-text-html',
            integer: 'input',
            float: 'input',
            boolean: 'boolean',
            datetime: 'datetime',
            date: 'datetime',
            time: 'datetime',
            json: 'input-code',
            uuid: 'input',
            csv: 'tags',
        };
        return interfaceMap[type] ?? 'input';
    }

    private getDefaultDisplay(type: FieldDefinition['type']): string {
        const displayMap: Record<string, string> = {
            string: 'raw',
            text: 'formatted-value',
            integer: 'raw',
            float: 'raw',
            boolean: 'boolean',
            datetime: 'datetime',
            date: 'datetime',
            time: 'datetime',
            json: 'raw',
            uuid: 'raw',
            csv: 'labels',
        };
        return displayMap[type] ?? 'raw';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Check if a collection exists
     */
    async collectionExists(name: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/collections/${name}`, {
                headers: { Authorization: `Bearer ${this.adminToken}` },
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Delete a collection (use with caution!)
     */
    async deleteCollection(name: string): Promise<void> {
        await fetch(`${this.baseUrl}/collections/${name}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${this.adminToken}` },
        });
        console.log(`[DirectusOrchestrator] Deleted collection: ${name}`);
    }

    /**
     * Generate schema from natural language (via Sofia)
     */
    static generateMedicSaaSSchema(): IntentSchema {
        return {
            collections: [
                {
                    name: 'patients',
                    icon: 'face',
                    color: '#4CAF50',
                    note: 'Patient records',
                    fields: [
                        { name: 'full_name', type: 'string', required: true },
                        { name: 'cpf', type: 'string', required: true, unique: true },
                        { name: 'date_of_birth', type: 'date', required: true },
                        { name: 'gender', type: 'string', validation: { choices: ['M', 'F', 'O'] } },
                        { name: 'phone', type: 'string' },
                        { name: 'email', type: 'string' },
                        { name: 'address', type: 'json' },
                        { name: 'medical_history', type: 'json' },
                        { name: 'allergies', type: 'csv' },
                        { name: 'insurance_provider', type: 'string' },
                        { name: 'insurance_number', type: 'string' },
                    ],
                    relations: [
                        { field: 'appointments', related_collection: 'appointments', type: 'one-to-many' },
                        { field: 'medical_records', related_collection: 'medical_records', type: 'one-to-many' },
                    ],
                },
                {
                    name: 'appointments',
                    icon: 'event',
                    color: '#2196F3',
                    note: 'Scheduled appointments',
                    fields: [
                        { name: 'scheduled_at', type: 'datetime', required: true },
                        { name: 'duration_minutes', type: 'integer', default: 30 },
                        { name: 'type', type: 'string', validation: { choices: ['consultation', 'return', 'exam', 'procedure'] } },
                        { name: 'status', type: 'string', validation: { choices: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] } },
                        { name: 'notes', type: 'text' },
                        { name: 'room', type: 'string' },
                    ],
                    relations: [
                        { field: 'patient_id', related_collection: 'patients', type: 'many-to-one' },
                        { field: 'provider_id', related_collection: 'providers', type: 'many-to-one' },
                    ],
                },
                {
                    name: 'medical_records',
                    icon: 'description',
                    color: '#FF9800',
                    note: 'Electronic Health Records',
                    fields: [
                        { name: 'record_type', type: 'string', required: true, validation: { choices: ['soap_note', 'prescription', 'lab_result', 'imaging', 'procedure', 'referral'] } },
                        { name: 'created_at', type: 'datetime', required: true },
                        { name: 'content', type: 'text' },
                        { name: 'structured_data', type: 'json' },
                        { name: 'diagnosis_codes', type: 'csv' },
                        { name: 'is_signed', type: 'boolean', default: false },
                        { name: 'signed_at', type: 'datetime' },
                    ],
                    relations: [
                        { field: 'patient_id', related_collection: 'patients', type: 'many-to-one' },
                        { field: 'provider_id', related_collection: 'providers', type: 'many-to-one' },
                        { field: 'appointment_id', related_collection: 'appointments', type: 'many-to-one' },
                    ],
                },
                {
                    name: 'providers',
                    icon: 'medical_services',
                    color: '#9C27B0',
                    note: 'Healthcare providers (doctors, nurses, etc.)',
                    fields: [
                        { name: 'full_name', type: 'string', required: true },
                        { name: 'specialty', type: 'string' },
                        { name: 'crm', type: 'string', unique: true },
                        { name: 'email', type: 'string' },
                        { name: 'phone', type: 'string' },
                        { name: 'schedule_config', type: 'json' },
                    ],
                },
            ],
        };
    }
}
