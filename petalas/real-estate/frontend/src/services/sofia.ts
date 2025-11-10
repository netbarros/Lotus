import { api } from './api';

export interface SofiaIntention {
  intention: string;
  context?: {
    user_id?: string;
    session_id?: string;
    current_property?: string;
    search_criteria?: any;
  };
}

export interface SofiaResponse {
  success: boolean;
  message: string;
  data?: any;
  suggestions?: string[];
  reasoning?: string;
  confidence?: number;
}

export interface ScrapeRequest {
  url: string;
  dataType?: 'neighborhood' | 'schools' | 'crime' | 'market' | 'general';
}

/**
 * Sofia AI Integration Service for Real Estate
 *
 * Provides natural language processing, web scraping, and AI-powered features
 * for the Real Estate pétala.
 */
class SofiaService {
  /**
   * Process user intention using Sofia AI IntentionEngine
   *
   * Examples:
   * - "Find me a 3 bedroom house under $500k in Miami"
   * - "Schedule a viewing for this property tomorrow at 2pm"
   * - "Calculate monthly mortgage for $450,000 with 20% down"
   * - "Show me properties with pools near good schools"
   *
   * @param intention - Natural language user request
   * @param context - Additional context (current property, search criteria, etc.)
   * @returns Sofia AI response with parsed intent and action
   */
  async processIntention(intention: string, context?: SofiaIntention['context']): Promise<SofiaResponse> {
    try {
      const response = await api.post('/sofia/intention', {
        intention,
        context,
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Sofia intention processing error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to process intention',
        suggestions: [
          'Try searching for properties',
          'Schedule a property viewing',
          'Calculate mortgage payments',
        ],
      };
    }
  }

  /**
   * Anonymous web scraping for market data
   *
   * Uses Sofia's anonymous scraping capabilities with:
   * - Rotating proxies
   * - User-agent rotation
   * - Rate limiting
   * - Respect for robots.txt
   *
   * Use cases:
   * - Scrape Zillow/Realtor.com for market comps
   * - Get school ratings from GreatSchools.org
   * - Fetch crime statistics from local police data
   * - Get neighborhood demographics
   * - Scrape mortgage rates from lender websites
   *
   * @param request - Scraping request with URL and data type
   * @returns Scraped data
   */
  async scrapeData(request: ScrapeRequest): Promise<any> {
    try {
      const response = await api.post('/sofia/scrape', request);
      return response.data.data;
    } catch (error: any) {
      console.error('Sofia scraping error:', error);
      throw new Error(error.response?.data?.error || 'Failed to scrape data');
    }
  }

  /**
   * Enrich property data using web scraping
   *
   * Automatically scrapes public sources to add:
   * - Neighborhood information (walkability, transit score)
   * - School ratings and distances
   * - Crime statistics
   * - Market trends
   * - Nearby amenities
   *
   * @param propertyId - Property ID to enrich
   * @returns Enriched property data
   */
  async enrichProperty(propertyId: string): Promise<any> {
    try {
      const response = await api.post(`/sofia/enrich/${propertyId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Sofia enrichment error:', error);
      throw new Error(error.response?.data?.error || 'Failed to enrich property data');
    }
  }

  /**
   * Get AI-powered property recommendations
   *
   * Based on:
   * - User search history
   * - Saved/favorited properties
   * - Price range and preferences
   * - Similar users' behavior (collaborative filtering)
   * - Market trends and predictions
   *
   * @param preferences - User preferences
   * @param history - Search/viewing history
   * @returns Recommended properties with reasoning
   */
  async getRecommendations(preferences?: any, history?: any): Promise<SofiaResponse> {
    try {
      const response = await api.post('/sofia/recommendations', {
        preferences,
        history,
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Sofia recommendations error:', error);
      throw new Error(error.response?.data?.error || 'Failed to get recommendations');
    }
  }

  /**
   * Natural language property search
   *
   * Converts natural language queries into structured search parameters
   *
   * Examples:
   * - "3 bed 2 bath house in Miami under 500k"
   * - "Luxury condos with ocean view in South Beach"
   * - "Family homes near good schools in suburbs"
   *
   * @param query - Natural language search query
   * @returns Search parameters and results
   */
  async searchByVoice(query: string): Promise<any> {
    const response = await this.processIntention(query, {
      search_criteria: { natural_language: true },
    });

    return response;
  }

  /**
   * Calculate mortgage with Sofia AI
   *
   * @param price - Property price
   * @param downPayment - Down payment amount
   * @param interestRate - Annual interest rate (default 6.5%)
   * @param years - Loan term in years (default 30)
   * @returns Mortgage calculation with breakdown
   */
  async calculateMortgage(
    price: number,
    downPayment: number,
    interestRate: number = 6.5,
    years: number = 30
  ): Promise<any> {
    const intention = `Calculate monthly mortgage payment for $${price} with $${downPayment} down, ${interestRate}% interest over ${years} years`;

    const response = await this.processIntention(intention);
    return response.data;
  }

  /**
   * Compare multiple properties using AI
   *
   * @param propertyIds - Array of property IDs to compare
   * @returns Comparison matrix with AI insights
   */
  async compareProperties(propertyIds: string[]): Promise<any> {
    const intention = `Compare properties: ${propertyIds.join(', ')}`;

    const response = await this.processIntention(intention, {
      search_criteria: { property_ids: propertyIds },
    });

    return response.data;
  }

  /**
   * Get neighborhood insights using web scraping
   *
   * @param address - Property address or coordinates
   * @returns Neighborhood data from multiple sources
   */
  async getNeighborhoodInsights(address: any): Promise<any> {
    try {
      // Scrape multiple sources for comprehensive neighborhood data
      const tasks = [
        this.scrapeData({ url: `https://walkscore.com/${address.city}/${address.state}`, dataType: 'neighborhood' }),
        this.scrapeData({ url: `https://greatschools.org/search?zip=${address.zipcode}`, dataType: 'schools' }),
        this.scrapeData({ url: `https://crimegrade.org/${address.city}-${address.state}`, dataType: 'crime' }),
      ];

      const [walkability, schools, crime] = await Promise.allSettled(tasks);

      return {
        walkability: walkability.status === 'fulfilled' ? walkability.value : null,
        schools: schools.status === 'fulfilled' ? schools.value : null,
        crime: crime.status === 'fulfilled' ? crime.value : null,
      };
    } catch (error) {
      console.error('Error fetching neighborhood insights:', error);
      return null;
    }
  }

  /**
   * Get market analytics using AI and scraping
   *
   * @param city - City name
   * @param state - State code
   * @param propertyType - Property type
   * @returns Market trends and analytics
   */
  async getMarketAnalytics(city: string, state: string, propertyType?: string): Promise<any> {
    try {
      const response = await this.scrapeData({
        url: `https://zillow.com/home-values/${city}-${state}`,
        dataType: 'market',
      });

      return response;
    } catch (error) {
      console.error('Error fetching market analytics:', error);
      return null;
    }
  }

  /**
   * Voice-to-text search (future feature)
   *
   * @param audioBlob - Audio recording blob
   * @returns Transcribed text and search results
   */
  async voiceSearch(audioBlob: Blob): Promise<any> {
    // Future implementation: integrate with Web Speech API or cloud speech service
    throw new Error('Voice search not yet implemented');
  }

  /**
   * Image-based property search (future feature)
   *
   * Upload a photo of a property or neighborhood and find similar listings
   *
   * @param imageFile - Image file
   * @returns Similar properties based on visual features
   */
  async imageSearch(imageFile: File): Promise<any> {
    // Future implementation: integrate with computer vision API
    throw new Error('Image search not yet implemented');
  }
}

export const sofiaService = new SofiaService();
