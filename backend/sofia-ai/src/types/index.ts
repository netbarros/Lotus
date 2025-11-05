/**
 * Sofia AI - Type Definitions
 */

export interface ComponentDecision {
  component: string
  selected: {
    demo: string
    path: string
    score: number
  }
  reason: string
  alternatives: Array<{
    demo: string
    score: number
  }>
  confidence: number
  timestamp: Date
}

export interface AnalysisResult {
  quality: number
  complexity: number
  performance: number
  maintainability: number
  lines: number
  dependencies: string[]
}

export interface Agent {
  id: string
  type: string
  layer: number
  capabilities: string[]
}

export interface ComponentInfo {
  name: string
  demo: string
  path: string
  content: string
  fullPath: string
}
