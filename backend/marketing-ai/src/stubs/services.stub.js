'use strict';
/**
 * Temporary stubs for Sofia AI services
 * TODO: Replace with proper imports when cross-workspace typing is resolved
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.QdrantServiceStub = exports.LangfuseServiceStub = exports.LangChainServiceStub = void 0;
class LangChainServiceStub {
  async getStatus() {
    return { status: 'ready' };
  }
  async processIntention(intention, _context) {
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
exports.LangChainServiceStub = LangChainServiceStub;
class LangfuseServiceStub {
  async logDecision(_decision) {
    // Decision logged (stub implementation)
  }
}
exports.LangfuseServiceStub = LangfuseServiceStub;
class QdrantServiceStub {
  async search(_query) {
    return { results: [] };
  }
}
exports.QdrantServiceStub = QdrantServiceStub;
//# sourceMappingURL=services.stub.js.map
