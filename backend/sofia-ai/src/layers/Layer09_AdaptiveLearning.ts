/**
 * Layer 09 - Adaptive Learning
 * Continuous Improvement através de Machine Learning
 *
 * Sofia aprende com cada decisão e melhora continuamente
 * Usa feedback loops e histórico para otimizar análises
 */

import { Redis } from 'ioredis'
import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../utils/logger'

interface LearningExample {
  input: any
  output: any
  feedback: number // -1 to 1
  timestamp: Date
  metadata: any
}

interface Model {
  id: string
  version: number
  weights: Map<string, number>
  accuracy: number
  trainingExamples: number
  lastTrained: Date
}

export class Layer09_AdaptiveLearning {
  private redis: Redis
  private anthropic: Anthropic
  private models: Map<string, Model>
  private learningQueue: LearningExample[]
  private trainingInterval: NodeJS.Timeout | null = null

  constructor(redis: Redis) {
    this.redis = redis
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    })
    this.models = new Map()
    this.learningQueue = []

    this.initializeModels()
  }

  async initialize(): Promise<void> {
    logger.info('🧠 Layer 09: Adaptive Learning initializing...')

    // Load existing models
    await this.loadModels()

    // Start training loop
    this.startTrainingLoop()

    // Subscribe to feedback events
    await this.subscribeToFeedback()

    logger.info('✅ Layer 09: Adaptive Learning active - Continuous improvement enabled')
  }

  /**
   * Initialize base models
   */
  private initializeModels(): void {
    // Component Quality Predictor
    this.models.set('component-quality', {
      id: 'component-quality',
      version: 1,
      weights: new Map([
        ['typescript-usage', 0.3],
        ['react-patterns', 0.25],
        ['code-complexity', 0.2],
        ['performance-patterns', 0.15],
        ['maintainability', 0.1]
      ]),
      accuracy: 0.85,
      trainingExamples: 0,
      lastTrained: new Date()
    })

    // Component Performance Predictor
    this.models.set('component-performance', {
      id: 'component-performance',
      version: 1,
      weights: new Map([
        ['hooks-optimization', 0.35],
        ['re-render-count', 0.3],
        ['memory-usage', 0.2],
        ['bundle-size', 0.15]
      ]),
      accuracy: 0.82,
      trainingExamples: 0,
      lastTrained: new Date()
    })

    // Decision Confidence Predictor
    this.models.set('decision-confidence', {
      id: 'decision-confidence',
      version: 1,
      weights: new Map([
        ['score-difference', 0.4],
        ['sample-size', 0.3],
        ['historical-accuracy', 0.2],
        ['complexity-factor', 0.1]
      ]),
      accuracy: 0.88,
      trainingExamples: 0,
      lastTrained: new Date()
    })
  }

  /**
   * Record a learning example
   */
  async recordExample(
    modelId: string,
    input: any,
    output: any,
    feedback: number,
    metadata: any = {}
  ): Promise<void> {
    const example: LearningExample = {
      input,
      output,
      feedback,
      timestamp: new Date(),
      metadata
    }

    this.learningQueue.push(example)

    // Save to Redis immediately
    await this.redis.lpush(
      `learning:examples:${modelId}`,
      JSON.stringify(example)
    )

    // Train if queue is large enough
    if (this.learningQueue.length >= 100) {
      await this.trainModels()
    }

    logger.info(`📚 Learning: Recorded example for ${modelId} (feedback: ${feedback})`)
  }

  /**
   * Train models with accumulated examples
   */
  private async trainModels(): Promise<void> {
    if (this.learningQueue.length === 0) return

    logger.info(`🎓 Training models with ${this.learningQueue.length} examples...`)

    for (const [modelId, model] of this.models.entries()) {
      const examples = this.learningQueue.filter(e =>
        e.metadata.modelId === modelId
      )

      if (examples.length === 0) continue

      // Simple weight adjustment based on feedback
      for (const example of examples) {
        const adjustment = example.feedback * 0.01 // 1% adjustment

        // Adjust weights based on feedback
        for (const [feature, weight] of model.weights.entries()) {
          const featureValue = example.input[feature] || 0
          const newWeight = weight + (adjustment * featureValue)

          // Clamp between 0 and 1
          model.weights.set(feature, Math.max(0, Math.min(1, newWeight)))
        }
      }

      // Update model metadata
      model.trainingExamples += examples.length
      model.lastTrained = new Date()

      // Recalculate accuracy
      model.accuracy = this.calculateAccuracy(model, examples)

      // Increment version
      model.version++

      logger.info(`✅ Model ${modelId} trained: v${model.version}, accuracy: ${(model.accuracy * 100).toFixed(2)}%`)

      // Save updated model
      await this.saveModel(model)
    }

    // Clear queue
    this.learningQueue = []

    // Publish training event
    await this.redis.publish('mesh:layer09:training', JSON.stringify({
      timestamp: new Date(),
      modelsUpdated: this.models.size
    }))
  }

  /**
   * Calculate model accuracy from examples
   */
  private calculateAccuracy(model: Model, examples: LearningExample[]): number {
    if (examples.length === 0) return model.accuracy

    // Simple accuracy: average of positive feedback
    const positiveCount = examples.filter(e => e.feedback > 0).length
    const newAccuracy = positiveCount / examples.length

    // Weighted average with previous accuracy
    return model.accuracy * 0.7 + newAccuracy * 0.3
  }

  /**
   * Predict with a model
   */
  async predict(modelId: string, input: any): Promise<number> {
    const model = this.models.get(modelId)
    if (!model) {
      logger.warn(`⚠️  Model ${modelId} not found, using default`)
      return 0.5
    }

    let score = 0

    // Calculate weighted sum
    for (const [feature, weight] of model.weights.entries()) {
      const value = input[feature] || 0
      score += value * weight
    }

    // Normalize to 0-1
    return Math.max(0, Math.min(1, score))
  }

  /**
   * Use Claude AI for advanced analysis
   */
  async analyzeWithClaude(component: string, context: any): Promise<any> {
    try {
      const prompt = this.buildPrompt(component, context)

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const analysis = this.parseClaudeResponse(message.content[0])

      logger.info(`🤖 Claude AI: Analyzed ${component}`)

      return analysis
    } catch (error) {
      logger.error(`❌ Claude AI error:`, error)
      return null
    }
  }

  /**
   * Build prompt for Claude
   */
  private buildPrompt(component: string, context: any): string {
    return `Analyze this React TypeScript component and provide a detailed quality assessment:

Component: ${component}

Context:
- Lines of code: ${context.lines}
- Dependencies: ${context.dependencies?.length || 0}
- Has TypeScript types: ${context.hasTypes ? 'Yes' : 'No'}
- Uses React hooks: ${context.hasHooks ? 'Yes' : 'No'}

Code snippet:
\`\`\`typescript
${context.codeSnippet}
\`\`\`

Please analyze:
1. Code quality (0-100)
2. Performance optimization opportunities
3. Potential bugs or issues
4. Maintainability score (0-100)
5. Recommendations for improvement

Respond in JSON format:
{
  "quality": number,
  "performance": number,
  "maintainability": number,
  "issues": string[],
  "recommendations": string[]
}`
  }

  /**
   * Parse Claude response
   */
  private parseClaudeResponse(content: any): any {
    try {
      const text = content.type === 'text' ? content.text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return null
    } catch (error) {
      logger.error('❌ Failed to parse Claude response:', error)
      return null
    }
  }

  /**
   * Subscribe to feedback events
   */
  private async subscribeToFeedback(): Promise<void> {
    await this.redis.subscribe('mesh:feedback')

    this.redis.on('message', (channel, message) => {
      if (channel === 'mesh:feedback') {
        const feedback = JSON.parse(message)
        this.handleFeedback(feedback)
      }
    })
  }

  /**
   * Handle feedback event
   */
  private handleFeedback(feedback: any): void {
    this.recordExample(
      feedback.modelId,
      feedback.input,
      feedback.output,
      feedback.score,
      feedback.metadata
    )
  }

  /**
   * Start training loop
   */
  private startTrainingLoop(): void {
    this.trainingInterval = setInterval(async () => {
      if (this.learningQueue.length > 0) {
        await this.trainModels()
      }
    }, 300000) // Every 5 minutes

    logger.info('🔄 Adaptive Learning: Training loop started')
  }

  /**
   * Load models from Redis
   */
  private async loadModels(): Promise<void> {
    const keys = await this.redis.keys('learning:model:*')

    for (const key of keys) {
      const data = await this.redis.get(key)
      if (data) {
        const model = JSON.parse(data)
        model.weights = new Map(Object.entries(model.weights))
        this.models.set(model.id, model)
      }
    }

    logger.info(`📚 Loaded ${this.models.size} models`)
  }

  /**
   * Save model to Redis
   */
  private async saveModel(model: Model): Promise<void> {
    const data = {
      ...model,
      weights: Object.fromEntries(model.weights)
    }

    await this.redis.set(
      `learning:model:${model.id}`,
      JSON.stringify(data)
    )
  }

  /**
   * Get learning statistics
   */
  async getStats(): Promise<any> {
    return {
      models: Array.from(this.models.entries()).map(([id, model]) => ({
        id,
        version: model.version,
        accuracy: model.accuracy,
        trainingExamples: model.trainingExamples,
        lastTrained: model.lastTrained
      })),
      queueSize: this.learningQueue.length
    }
  }

  /**
   * Shutdown
   */
  async shutdown(): Promise<void> {
    if (this.trainingInterval) {
      clearInterval(this.trainingInterval)
    }

    // Train with remaining examples
    if (this.learningQueue.length > 0) {
      await this.trainModels()
    }

    logger.info('🛑 Layer 09: Adaptive Learning shutdown')
  }
}
