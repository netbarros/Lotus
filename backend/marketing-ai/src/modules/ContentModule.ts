
import { Pool } from 'pg';
import { ContentPiece } from '../types';
import { LangChainServiceStub as LangChainService } from '../stubs/services.stub';

export class ContentModule {
    constructor(private db: Pool, private sofia: LangChainService) { }

    async generateContent(request: {
        type: ContentPiece['type'];
        topic: string;
        keywords?: string[];
        targetAudience?: string[];
        length?: 'short' | 'medium' | 'long';
    }): Promise<ContentPiece> {
        console.log(`🧠 Sofia AI: Generating ${request.type} content about "${request.topic}"...`);

        // Sofia AI generates high-quality content
        const content = await this.sofia.processIntention({
            intention: `Generate ${request.type} content about: ${request.topic}`,
            context: {
                keywords: request.keywords,
                targetAudience: request.targetAudience,
                length: request.length || 'medium',
                type: request.type,
            },
        });

        // Sofia AI calculates SEO score
        const seoScore = await this.calculateSEOScore(content.content, request.keywords || []);

        // Sofia AI predicts engagement
        const engagementPrediction = await this.predictEngagement(content.content, request.type);

        const contentPiece: ContentPiece = {
            id: crypto.randomUUID(),
            type: request.type,
            title: content.title || request.topic,
            content: content.content || '',
            keywords: request.keywords || [],
            targetAudience: request.targetAudience || ['general'],
            sofiaGenerated: true,
            seoScore,
            engagementPrediction,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Store in database
        await this.db.query(
            `INSERT INTO marketing_content (id, type, title, content, keywords, target_audience, sofia_generated, seo_score, engagement_prediction, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                contentPiece.id,
                contentPiece.type,
                contentPiece.title,
                contentPiece.content,
                contentPiece.keywords,
                contentPiece.targetAudience,
                contentPiece.sofiaGenerated,
                contentPiece.seoScore,
                contentPiece.engagementPrediction,
                contentPiece.status,
            ]
        );

        console.log(`✅ Sofia AI generated ${request.type}: ${contentPiece.title}`);
        console.log(
            `   SEO Score: ${seoScore}/100 | Predicted Engagement: ${(engagementPrediction * 100).toFixed(1)}%`
        );

        return contentPiece;
    }

    private async calculateSEOScore(content: string, keywords: string[]): Promise<number> {
        // Sofia AI analyzes SEO quality
        let score = 50; // Base score

        // Keyword density
        keywords.forEach((keyword) => {
            const regex = new RegExp(keyword, 'gi');
            const matches = content.match(regex);
            if (matches) score += Math.min(10, matches.length * 2);
        });

        // Content length
        const wordCount = content.split(/\s+/).length;
        if (wordCount > 300) score += 10;
        if (wordCount > 800) score += 10;
        if (wordCount > 1500) score += 10;

        return Math.min(100, score);
    }

    private async predictEngagement(content: string, type: string): Promise<number> {
        // Sofia AI predicts engagement based on content analysis
        // Simplified prediction - in production, use ML model
        const wordCount = content.split(/\s+/).length;
        let prediction = 0.3; // Base 30%

        if (type === 'video') prediction += 0.2;
        if (type === 'infographic') prediction += 0.15;
        if (wordCount > 500 && wordCount < 1500) prediction += 0.1;

        return Math.min(1, prediction);
    }
}
