/**
 * SOFIA ENGINE - THE BRAIN
 *
 * Universal AI engine that powers all Pétalas in MagicSaaS System-∞
 *
 * Sofia is the central intelligence that:
 * - Understands user intent across all verticals
 * - Provides contextual recommendations
 * - Manages conversations and interactions
 * - Learns from user behavior
 * - Adapts UI/UX dynamically
 *
 * This is the CORE that ALL Pétalas inherit from.
 * Maximum reusability, minimal code duplication.
 */

import { AnthropicClient } from './AnthropicClient';
import { IntentClassifier } from './IntentClassifier';
import { ContextManager } from './ContextManager';
import { PersonalityAdapter } from './PersonalityAdapter';

export interface SofiaConfig {
  petala: string; // 'fashion', 'restaurant', 'healthcare', etc.
  tenant_id: string;
  user_id?: string;
  language?: string;
  personality?: 'professional' | 'friendly' | 'casual';
  features?: {
    voice?: boolean;
    chat?: boolean;
    recommendations?: boolean;
    proactive?: boolean;
  };
}

export interface SofiaMessage {
  id: string;
  role: 'user' | 'sofia' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    actions?: Array<{
      type: string;
      payload: any;
    }>;
    suggestions?: string[];
  };
}

export interface SofiaIntent {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  context: Record<string, any>;
}

export interface SofiaResponse {
  message: string;
  intent: SofiaIntent;
  actions?: Array<{
    type: string;
    payload: any;
  }>;
  suggestions?: string[];
  ui_updates?: Array<{
    component: string;
    action: string;
    data: any;
  }>;
}

/**
 * Sofia Engine - Universal AI Brain
 */
export class SofiaEngine {
  private config: SofiaConfig;
  private anthropic: AnthropicClient;
  private intentClassifier: IntentClassifier;
  private contextManager: ContextManager;
  private personalityAdapter: PersonalityAdapter;
  private conversationHistory: SofiaMessage[] = [];

  constructor(config: SofiaConfig) {
    this.config = config;
    this.anthropic = new AnthropicClient(process.env.ANTHROPIC_API_KEY!);
    this.intentClassifier = new IntentClassifier(config.petala);
    this.contextManager = new ContextManager();
    this.personalityAdapter = new PersonalityAdapter(config.personality || 'friendly');
  }

  /**
   * Process user message and return Sofia's response
   * This is the MAIN entry point for all Pétalas
   */
  async processMessage(userMessage: string, context?: Record<string, any>): Promise<SofiaResponse> {
    // 1. Add user message to history
    this.addMessage({
      id: this.generateId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // 2. Classify intent
    const intent = await this.intentClassifier.classify(userMessage, context);

    // 3. Update context
    this.contextManager.update({
      ...context,
      last_intent: intent.intent,
      timestamp: new Date(),
    });

    // 4. Generate response using Claude
    const response = await this.generateResponse(userMessage, intent, context);

    // 5. Add Sofia's response to history
    this.addMessage({
      id: this.generateId(),
      role: 'sofia',
      content: response.message,
      timestamp: new Date(),
      metadata: {
        intent: intent.intent,
        confidence: intent.confidence,
        actions: response.actions,
        suggestions: response.suggestions,
      },
    });

    return response;
  }

  /**
   * Generate response using Claude (Anthropic)
   */
  private async generateResponse(
    userMessage: string,
    intent: SofiaIntent,
    context?: Record<string, any>
  ): Promise<SofiaResponse> {
    const systemPrompt = this.buildSystemPrompt();
    const conversationContext = this.buildConversationContext();

    const claudeResponse = await this.anthropic.complete({
      system: systemPrompt,
      messages: [
        ...conversationContext,
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    // Parse Claude's response and extract actions
    const parsed = this.parseClaudeResponse(claudeResponse, intent);

    // Adapt personality
    const adaptedMessage = this.personalityAdapter.adapt(parsed.message);

    return {
      message: adaptedMessage,
      intent,
      actions: parsed.actions,
      suggestions: parsed.suggestions,
      ui_updates: parsed.ui_updates,
    };
  }

  /**
   * Build system prompt based on Pétala
   */
  private buildSystemPrompt(): string {
    const basePrompt = `You are Sofia, the AI assistant for MagicSaaS System-∞.
You are helpful, knowledgeable, and always focused on providing the best user experience.
You understand context, remember conversations, and proactively help users achieve their goals.`;

    const petalaPrompts: Record<string, string> = {
      fashion: `
You are Sofia, a fashion expert assistant. You help users:
- Find the perfect clothing and accessories
- Discover new trends and styles
- Try on items virtually with AR
- Build complete outfits
- Track orders and manage their wardrobe
- Earn loyalty rewards

You're knowledgeable about fashion trends, sizing, styling, and personal shopping.`,

      restaurant: `
You are Sofia, a culinary expert assistant. You help users:
- Discover great restaurants and dishes
- Make reservations easily
- Get personalized menu recommendations
- Order food for delivery or pickup
- Track their dietary preferences and allergies
- Find special deals and promotions

You're knowledgeable about cuisines, dietary restrictions, and dining experiences.`,

      healthcare: `
You are Sofia, a healthcare assistant. You help users:
- Schedule medical appointments
- Track medications and treatments
- Access health records securely
- Connect with healthcare providers
- Monitor vital signs and wellness
- Manage insurance and billing

You're knowledgeable, empathetic, and HIPAA-compliant.`,

      // Add more Pétalas as they're developed
    };

    return basePrompt + '\n\n' + (petalaPrompts[this.config.petala] || basePrompt);
  }

  /**
   * Build conversation context for Claude
   */
  private buildConversationContext(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.conversationHistory
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role === 'sofia' ? 'assistant' : 'user',
        content: msg.content,
      }));
  }

  /**
   * Parse Claude's response and extract structured data
   */
  private parseClaudeResponse(
    response: string,
    intent: SofiaIntent
  ): {
    message: string;
    actions?: any[];
    suggestions?: string[];
    ui_updates?: any[];
  } {
    // Try to parse JSON if present in response
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        return {
          message: response.replace(/```json\n[\s\S]*?\n```/, '').trim(),
          ...data,
        };
      } catch (e) {
        // If JSON parsing fails, return plain response
      }
    }

    // Generate actions based on intent
    const actions = this.generateActionsFromIntent(intent);

    return {
      message: response,
      actions,
      suggestions: this.generateSuggestions(intent),
    };
  }

  /**
   * Generate actions based on classified intent
   */
  private generateActionsFromIntent(intent: SofiaIntent): any[] {
    const actionMap: Record<string, any> = {
      search_products: [
        {
          type: 'SEARCH',
          payload: {
            query: intent.entities.query,
            filters: intent.entities.filters,
          },
        },
      ],
      add_to_cart: [
        {
          type: 'ADD_TO_CART',
          payload: {
            product_id: intent.entities.product_id,
            quantity: intent.entities.quantity || 1,
          },
        },
      ],
      make_reservation: [
        {
          type: 'OPEN_RESERVATION_FORM',
          payload: {
            date: intent.entities.date,
            time: intent.entities.time,
            party_size: intent.entities.party_size,
          },
        },
      ],
      track_order: [
        {
          type: 'SHOW_ORDER_TRACKING',
          payload: {
            order_id: intent.entities.order_id,
          },
        },
      ],
      // Add more intent->action mappings
    };

    return actionMap[intent.intent] || [];
  }

  /**
   * Generate contextual suggestions
   */
  private generateSuggestions(intent: SofiaIntent): string[] {
    const suggestionMap: Record<string, string[]> = {
      search_products: [
        'Show me trending items',
        'Filter by price',
        'Sort by popularity',
        'View my wishlist',
      ],
      make_reservation: [
        'Show available times',
        'View restaurant menu',
        'Add special requests',
        'Save as favorite restaurant',
      ],
      // Add more suggestions per intent
    };

    return (
      suggestionMap[intent.intent] || [
        'What can you help me with?',
        'Show me recommendations',
        'View my account',
      ]
    );
  }

  /**
   * Get conversation history
   */
  getHistory(): SofiaMessage[] {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
    this.contextManager.clear();
  }

  /**
   * Add message to history
   */
  private addMessage(message: SofiaMessage): void {
    this.conversationHistory.push(message);

    // Keep only last 20 messages to manage token limits
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current context
   */
  getContext(): Record<string, any> {
    return this.contextManager.get();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SofiaConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Sofia Engine Factory
 * Creates Sofia instances for specific Pétalas
 */
export class SofiaFactory {
  static create(config: SofiaConfig): SofiaEngine {
    return new SofiaEngine(config);
  }

  static createForFashion(tenant_id: string, user_id?: string): SofiaEngine {
    return new SofiaEngine({
      petala: 'fashion',
      tenant_id,
      user_id,
      personality: 'friendly',
      features: {
        voice: true,
        chat: true,
        recommendations: true,
        proactive: true,
      },
    });
  }

  static createForRestaurant(tenant_id: string, user_id?: string): SofiaEngine {
    return new SofiaEngine({
      petala: 'restaurant',
      tenant_id,
      user_id,
      personality: 'friendly',
      features: {
        voice: true,
        chat: true,
        recommendations: true,
        proactive: true,
      },
    });
  }

  static createForHealthcare(tenant_id: string, user_id?: string): SofiaEngine {
    return new SofiaEngine({
      petala: 'healthcare',
      tenant_id,
      user_id,
      personality: 'professional',
      features: {
        voice: true,
        chat: true,
        recommendations: false, // Healthcare is more sensitive
        proactive: true,
      },
    });
  }
}

export default SofiaEngine;
