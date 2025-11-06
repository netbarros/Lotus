/**
 * Context Manager
 * Manages conversation and user context
 */

export class ContextManager {
  private context: Record<string, any> = {}

  update(newContext: Record<string, any>): void {
    this.context = {
      ...this.context,
      ...newContext,
      updated_at: new Date()
    }
  }

  get(): Record<string, any> {
    return this.context
  }

  set(key: string, value: any): void {
    this.context[key] = value
  }

  remove(key: string): void {
    delete this.context[key]
  }

  clear(): void {
    this.context = {}
  }

  has(key: string): boolean {
    return key in this.context
  }
}
