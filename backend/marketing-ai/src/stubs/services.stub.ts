/**
 * Temporary stubs for Sofia AI services
 * TODO: Replace with proper imports when cross-workspace typing is resolved
 */

export class LangChainServiceStub {
  async getStatus() {
    return { status: 'ready' };
  }

  async processIntention(intention: any, _context?: any): Promise<any> {
    const intentionStr = typeof intention === 'string' ? intention : JSON.stringify(intention);
    return {
      result: `Processed: ${intentionStr}`,
      probability: 0.8,
      action: 'default_action',
      title: 'Generated Title',
      content: 'Generated content based on AI analysis',
      predictedWinner: 'variant_a',
    };
  }
}

export class LangfuseServiceStub {
  async logDecision(_decision: any) {
    // Decision logged (stub implementation)
  }
}

export class QdrantServiceStub {
  async search(_query: string) {
    return { results: [] };
  }
}
