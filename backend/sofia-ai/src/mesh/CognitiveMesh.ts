import { Redis } from 'ioredis'
import { logger } from '../utils/logger'
import type { Agent } from '../types'

export class CognitiveMesh {
  private redis: Redis
  private agents: Map<string, Agent>

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 11, // Cognitive Mesh database
    })
    this.agents = new Map()
  }

  async initialize(): Promise<void> {
    await this.redis.ping()
    logger.info('🕸️  Cognitive Mesh: Connected to System 11')
  }

  async registerAgent(agent: Agent): Promise<void> {
    this.agents.set(agent.id, agent)
    await this.redis.hset('mesh:agents', agent.id, JSON.stringify(agent))
    logger.info(`🕸️  Registered agent: ${agent.id} (Layer ${agent.layer})`)
  }

  async publish(event: string, data: any): Promise<void> {
    await this.redis.publish(`mesh:${event}`, JSON.stringify(data))
  }

  async shutdown(): Promise<void> {
    await this.redis.quit()
    logger.info('🕸️  Cognitive Mesh: Disconnected')
  }
}
