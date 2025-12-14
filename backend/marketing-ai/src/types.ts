
export interface Campaign {
    id: string;
    name: string;
    type: 'email' | 'social' | 'ads' | 'content' | 'webinar' | 'event';
    status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';
    objective: string;
    targetAudience: TargetAudience;
    budget?: number;
    startDate: Date;
    endDate?: Date;
    channels: Channel[];
    kpis: KPI[];
    sofiaGenerated?: boolean; // Sofia AI generated this campaign
    sofiaOptimized?: boolean; // Sofia AI optimized this campaign
    createdAt: Date;
    updatedAt: Date;
}

export interface TargetAudience {
    segments: string[];
    demographics?: {
        ageRange?: [number, number];
        locations?: string[];
        industries?: string[];
        roles?: string[];
    };
    behaviors?: {
        interests?: string[];
        purchaseHistory?: string[];
        engagementLevel?: 'high' | 'medium' | 'low';
    };
    customCriteria?: Record<string, any>;
}

export interface Channel {
    type:
    | 'linkedin'
    | 'twitter'
    | 'instagram'
    | 'facebook'
    | 'email'
    | 'youtube'
    | 'tiktok'
    | 'google-ads'
    | 'meta-ads';
    budget?: number;
    frequency?: string;
    content?: string[];
}

export interface KPI {
    metric: string;
    target: number;
    current: number;
    unit: string;
}

export interface Lead {
    id: string;
    email: string;
    name?: string;
    company?: string;
    role?: string;
    source: string;
    score: number; // 0-100, Sofia AI calculated
    stage: 'awareness' | 'consideration' | 'decision' | 'customer' | 'advocate';
    lastInteraction?: Date;
    interactions: Interaction[];
    predictedConversion?: number; // Sofia AI prediction
    nextBestAction?: string; // Sofia AI recommendation
    createdAt: Date;
    updatedAt: Date;
}

export interface Interaction {
    type:
    | 'email_open'
    | 'email_click'
    | 'website_visit'
    | 'content_download'
    | 'webinar_attend'
    | 'demo_request'
    | 'trial_start';
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface ContentPiece {
    id: string;
    type: 'blog' | 'video' | 'infographic' | 'ebook' | 'whitepaper' | 'case_study' | 'social_post';
    title: string;
    content: string;
    keywords: string[];
    targetAudience: string[];
    sofiaGenerated: boolean; // Sofia AI generated
    seoScore?: number; // Sofia AI calculated
    engagementPrediction?: number; // Sofia AI prediction
    status: 'draft' | 'review' | 'published' | 'archived';
    publishedAt?: Date;
    performance?: {
        views: number;
        engagement: number;
        conversions: number;
        shareRate: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomerJourney {
    leadId: string;
    stages: JourneyStage[];
    currentStage: string;
    timeInStage: number; // days
    sofiaInsights?: string[]; // Sofia AI insights
    sofiaRecommendations?: string[]; // Sofia AI next steps
    predictedPath?: string[]; // Sofia AI predicted journey
    riskScore?: number; // Sofia AI churn risk (0-100)
}

export interface JourneyStage {
    name: string;
    enteredAt: Date;
    exitedAt?: Date;
    actions: string[];
    content: string[];
    conversions: number;
}

export interface MarketingInsight {
    id: string;
    type: 'trend' | 'anomaly' | 'opportunity' | 'warning' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number; // 0-1, Sofia AI confidence
    data: Record<string, any>;
    actionable: boolean;
    suggestedActions?: string[]; // Sofia AI suggestions
    generatedAt: Date;
}

export interface ABTest {
    id: string;
    name: string;
    type: 'email' | 'landing_page' | 'ad_creative' | 'cta' | 'subject_line';
    variants: Variant[];
    status: 'draft' | 'running' | 'completed';
    winner?: string;
    sofiaRecommendation?: string; // Sofia AI recommended variant
    startedAt?: Date;
    completedAt?: Date;
}

export interface Variant {
    id: string;
    name: string;
    content: string;
    traffic: number; // percentage
    metrics: {
        impressions: number;
        clicks: number;
        conversions: number;
        ctr: number;
        conversionRate: number;
    };
}
