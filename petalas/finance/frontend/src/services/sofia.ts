import { api } from './api';

export interface SofiaIntention {
  intention: string;
  context?: any;
}

class SofiaService {
  async processIntention(intention: string, context?: any) {
    const response = await api.post('/sofia/intention', { intention, context });
    return response.data;
  }

  async scrapeData(request: any) {
    const response = await api.post('/sofia/scrape', request);
    return response.data;
  }
}

export const sofiaService = new SofiaService();
