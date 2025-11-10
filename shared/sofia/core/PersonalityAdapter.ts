/**
 * Personality Adapter
 * Adapts Sofia's responses based on personality setting
 */

export type Personality = 'professional' | 'friendly' | 'casual'

export class PersonalityAdapter {
  private personality: Personality

  constructor(personality: Personality = 'friendly') {
    this.personality = personality
  }

  adapt(message: string): string {
    switch (this.personality) {
      case 'professional':
        return this.makeProfessional(message)

      case 'friendly':
        return this.makeFriendly(message)

      case 'casual':
        return this.makeCasual(message)

      default:
        return message
    }
  }

  private makeProfessional(message: string): string {
    // Add professional tone
    const greetings = {
      'oi': 'Olá',
      'opa': 'Olá',
      'e aí': 'Olá'
    }

    let adapted = message

    Object.entries(greetings).forEach(([casual, professional]) => {
      adapted = adapted.replace(new RegExp(`\\b${casual}\\b`, 'gi'), professional)
    })

    return adapted
  }

  private makeFriendly(message: string): string {
    // Add friendly emojis and warmth
    if (!message.includes('😊') && !message.includes('👋') && !message.includes('✨')) {
      if (message.toLowerCase().startsWith('olá') || message.toLowerCase().startsWith('oi')) {
        message = message + ' 👋'
      }
    }

    return message
  }

  private makeCasual(message: string): string {
    // Make more casual
    const formal = {
      'Olá': 'Oi',
      'Bom dia': 'E aí',
      'Por favor': 'Por favor',
      'Muito obrigado': 'Valeu'
    }

    let adapted = message

    Object.entries(formal).forEach(([formalWord, casualWord]) => {
      adapted = adapted.replace(new RegExp(`\\b${formalWord}\\b`, 'g'), casualWord)
    })

    return adapted
  }

  setPersonality(personality: Personality): void {
    this.personality = personality
  }

  getPersonality(): Personality {
    return this.personality
  }
}
