/**
 * Anthropic Claude Client
 * Wrapper for Claude API calls
 */

import Anthropic from '@anthropic-ai/sdk'

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeCompletionOptions {
  system: string
  messages: ClaudeMessage[]
  temperature?: number
  max_tokens?: number
  model?: string
}

export class AnthropicClient {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey
    })
  }

  async complete(options: ClaudeCompletionOptions): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: options.model || 'claude-sonnet-4-20250514',
        system: options.system,
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1024
      })

      const content = response.content[0]
      return content.type === 'text' ? content.text : ''
    } catch (error) {
      console.error('Claude API error:', error)
      throw error
    }
  }
}
