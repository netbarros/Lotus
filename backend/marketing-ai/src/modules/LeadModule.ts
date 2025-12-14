
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { Lead } from '../types';
import { LangChainServiceStub as LangChainService } from '../stubs/services.stub';

export class LeadModule {
    constructor(private db: Pool, private redis: Redis, private sofia: LangChainService) { }

    async scoreLead(leadId: string): Promise<number> {
        console.log(`🧠 Sofia AI: Scoring lead ${leadId}...`);

        const lead = await this.getLead(leadId);
        if (!lead) throw new Error('Lead not found');

        // Sofia AI analyzes all lead data to calculate score
        const score = await this.sofia.processIntention({
            intention: 'Calculate lead score based on all available data',
            context: {
                lead,
                interactions: lead.interactions,
                stage: lead.stage,
                source: lead.source,
            },
        });

        const finalScore = Math.min(100, Math.max(0, score.score || 0));

        // Update lead score
        await this.db.query(
            'UPDATE marketing_leads SET score = $1, updated_at = NOW() WHERE id = $2',
            [finalScore, leadId]
        );

        // Update cache
        lead.score = finalScore;
        await this.redis.setex(`lead:${leadId}`, 3600, JSON.stringify(lead));

        console.log(`✅ Sofia AI scored lead: ${finalScore}/100`);
        return finalScore;
    }

    async predictLeadConversion(leadId: string): Promise<number> {
        console.log(`🧠 Sofia AI: Predicting conversion for lead ${leadId}...`);

        const lead = await this.getLead(leadId);
        if (!lead) throw new Error('Lead not found');

        // Sofia AI uses ML to predict conversion probability
        const prediction = await this.sofia.processIntention({
            intention: 'Predict probability of lead conversion to customer',
            context: {
                lead,
                historicalData: await this.getHistoricalConversionData(),
            },
        });

        const probability = Math.min(1, Math.max(0, prediction.probability || 0));

        // Update lead
        await this.db.query(
            'UPDATE marketing_leads SET predicted_conversion = $1, updated_at = NOW() WHERE id = $2',
            [probability, leadId]
        );

        console.log(`✅ Sofia AI predicted conversion: ${(probability * 100).toFixed(1)}%`);
        return probability;
    }

    async getNextBestAction(leadId: string): Promise<string> {
        console.log(`🧠 Sofia AI: Determining next best action for lead ${leadId}...`);

        const lead = await this.getLead(leadId);
        if (!lead) throw new Error('Lead not found');

        // Sofia AI recommends next action based on lead behavior
        const recommendation = await this.sofia.processIntention({
            intention: 'Recommend the next best action to nurture this lead',
            context: {
                lead,
                currentStage: lead.stage,
                lastInteraction: lead.lastInteraction,
                score: lead.score,
            },
        });

        const action = recommendation.action || 'Send personalized email with case study';

        // Update lead
        await this.db.query(
            'UPDATE marketing_leads SET next_best_action = $1, updated_at = NOW() WHERE id = $2',
            [action, leadId]
        );

        console.log(`✅ Sofia AI recommends: ${action}`);
        return action;
    }

    private async getLead(leadId: string): Promise<Lead | null> {
        // Check cache first
        const cached = await this.redis.get(`lead:${leadId}`);
        if (cached) return JSON.parse(cached);

        // Query database
        const result = await this.db.query('SELECT * FROM marketing_leads WHERE id = $1', [leadId]);

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        const lead: Lead = {
            id: row.id,
            email: row.email,
            name: row.name,
            company: row.company,
            role: row.role,
            source: row.source,
            score: row.score,
            stage: row.stage,
            lastInteraction: row.last_interaction,
            interactions: row.interactions || [],
            predictedConversion: row.predicted_conversion,
            nextBestAction: row.next_best_action,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };

        // Cache
        await this.redis.setex(`lead:${leadId}`, 3600, JSON.stringify(lead));

        return lead;
    }

    private async getHistoricalConversionData(): Promise<any> {
        const result = await this.db.query(`
      SELECT
        stage,
        AVG(CASE WHEN stage = 'customer' THEN 1 ELSE 0 END) as conversion_rate,
        COUNT(*) as total_leads
      FROM marketing_leads
      GROUP BY stage
    `);

        return result.rows;
    }
}
