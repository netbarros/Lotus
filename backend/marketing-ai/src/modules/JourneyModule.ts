
import { Pool } from 'pg';
import { CustomerJourney, Lead } from '../types';
import { LangChainServiceStub as LangChainService } from '../stubs/services.stub';

export class JourneyModule {
    constructor(private db: Pool, private sofia: LangChainService) { }

    async mapCustomerJourney(leadId: string): Promise<CustomerJourney> {
        console.log(`🧠 Sofia AI: Mapping customer journey for lead ${leadId}...`);

        const leadResult = await this.db.query('SELECT * FROM marketing_leads WHERE id = $1', [leadId]);
        if (leadResult.rows.length === 0) throw new Error('Lead not found');
        const lead: Lead = leadResult.rows[0];

        // Sofia AI analyzes journey
        const journeyAnalysis = await this.sofia.processIntention({
            intention: 'Analyze and map customer journey based on interactions',
            context: {
                leadId,
                stage: lead.stage,
                interactions: lead.interactions
            },
        });

        const journey: CustomerJourney = {
            leadId,
            stages: journeyAnalysis.stages || [],
            currentStage: lead.stage,
            timeInStage: journeyAnalysis.timeInStage || 0,
            sofiaInsights: journeyAnalysis.insights || [],
            sofiaRecommendations: journeyAnalysis.recommendations || [],
            predictedPath: journeyAnalysis.predictedPath || [],
            riskScore: journeyAnalysis.riskScore || 0
        };

        // Store in DB
        await this.db.query(
            `INSERT INTO marketing_journeys (lead_id, stages, current_stage, time_in_stage, sofia_insights, sofia_recommendations, predicted_path, risk_score)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET current_stage = $3, updated_at = NOW()`,
            [
                journey.leadId,
                JSON.stringify(journey.stages),
                journey.currentStage,
                journey.timeInStage,
                JSON.stringify(journey.sofiaInsights),
                JSON.stringify(journey.sofiaRecommendations),
                JSON.stringify(journey.predictedPath),
                journey.riskScore
            ]
        );

        console.log(`✅ Sofia AI mapped journey for lead ${leadId}`);
        return journey;
    }
}
