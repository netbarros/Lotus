/**
 * Intent Classifier
 * Classifies user intent from natural language
 */

import { SofiaIntent } from './SofiaEngine';

export class IntentClassifier {
  private petala: string;

  constructor(petala: string) {
    this.petala = petala;
  }

  async classify(message: string, context?: Record<string, any>): Promise<SofiaIntent> {
    const lowerMessage = message.toLowerCase();

    // Fashion-specific intents
    if (this.petala === 'fashion') {
      if (
        this.matchesPattern(lowerMessage, ['buscar', 'procurar', 'encontrar', 'mostrar', 'ver'])
      ) {
        return {
          intent: 'search_products',
          confidence: 0.9,
          entities: this.extractSearchEntities(lowerMessage),
          context: context || {},
        };
      }

      if (this.matchesPattern(lowerMessage, ['adicionar', 'carrinho', 'comprar'])) {
        return {
          intent: 'add_to_cart',
          confidence: 0.85,
          entities: {},
          context: context || {},
        };
      }

      if (this.matchesPattern(lowerMessage, ['recomendar', 'sugerir', 'combinar'])) {
        return {
          intent: 'get_recommendations',
          confidence: 0.88,
          entities: {},
          context: context || {},
        };
      }

      if (this.matchesPattern(lowerMessage, ['pedido', 'entrega', 'rastrear'])) {
        return {
          intent: 'track_order',
          confidence: 0.92,
          entities: this.extractOrderEntities(lowerMessage),
          context: context || {},
        };
      }
    }

    // Restaurant-specific intents
    if (this.petala === 'restaurant') {
      if (this.matchesPattern(lowerMessage, ['reserva', 'mesa', 'agendar'])) {
        return {
          intent: 'make_reservation',
          confidence: 0.9,
          entities: this.extractReservationEntities(lowerMessage),
          context: context || {},
        };
      }

      if (this.matchesPattern(lowerMessage, ['cardápio', 'menu', 'prato'])) {
        return {
          intent: 'view_menu',
          confidence: 0.88,
          entities: {},
          context: context || {},
        };
      }

      if (this.matchesPattern(lowerMessage, ['pedir', 'delivery', 'entregar'])) {
        return {
          intent: 'place_order',
          confidence: 0.9,
          entities: {},
          context: context || {},
        };
      }
    }

    // Generic intents
    return {
      intent: 'general_inquiry',
      confidence: 0.5,
      entities: {},
      context: context || {},
    };
  }

  private matchesPattern(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }

  private extractSearchEntities(message: string): Record<string, any> {
    return {
      query: message,
      filters: {},
    };
  }

  private extractOrderEntities(message: string): Record<string, any> {
    const orderNumberMatch = message.match(/\b\d{6,}\b/);
    return {
      order_id: orderNumberMatch ? orderNumberMatch[0] : null,
    };
  }

  private extractReservationEntities(message: string): Record<string, any> {
    // Simple extraction - can be enhanced with NLP
    const entities: Record<string, any> = {};

    // Extract party size
    const partySizeMatch = message.match(/(\d+)\s*(pessoa|pessoas|people)/);
    if (partySizeMatch) {
      entities.party_size = parseInt(partySizeMatch[1]);
    }

    return entities;
  }
}
