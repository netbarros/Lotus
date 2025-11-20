/**
 * Temporary stubs for Sofia AI services
 * TODO: Replace with proper imports when cross-workspace typing is resolved
 */
export declare class LangChainServiceStub {
  getStatus(): Promise<{
    status: string;
  }>;
  processIntention(intention: any, _context?: any): Promise<any>;
}
export declare class LangfuseServiceStub {
  logDecision(_decision: any): Promise<void>;
}
export declare class QdrantServiceStub {
  search(_query: string): Promise<{
    results: any[];
  }>;
}
//# sourceMappingURL=services.stub.d.ts.map
