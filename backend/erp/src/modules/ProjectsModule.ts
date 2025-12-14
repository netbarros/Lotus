
import { Pool } from 'pg';
import { Project } from '../ERPCore';

export class ProjectsModule {
    constructor(private db: Pool, private tenantId: string) { }

    async createProject(project: Omit<Project, 'id' | 'spent'>): Promise<Project> {
        const result = await this.db.query(
            `INSERT INTO erp_projects (tenant_id, name, description, status, start_date, end_date, budget, spent, customer_id, team_members)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9)
       RETURNING *`,
            [
                this.tenantId,
                project.name,
                project.description,
                project.status,
                project.startDate,
                project.endDate,
                project.budget,
                project.customerId,
                JSON.stringify(project.teamMembers),
            ]
        );

        return this.mapProject(result.rows[0]);
    }

    async trackProjectExpense(projectId: string, amount: number, description: string): Promise<void> {
        await this.db.query(
            `UPDATE erp_projects
       SET spent = spent + $1
       WHERE id = $2 AND tenant_id = $3`,
            [amount, projectId, this.tenantId]
        );

        await this.db.query(
            `INSERT INTO erp_project_expenses (tenant_id, project_id, amount, description, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
            [this.tenantId, projectId, amount, description]
        );
    }

    async getProjectProgress(projectId: string) {
        const project = await this.getProject(projectId);
        const budgetUsed = (project.spent / project.budget) * 100;
        const now = new Date();
        const totalDays = project.endDate
            ? (project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)
            : 0;
        const daysElapsed = (now.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24);
        const timeProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;

        return {
            project,
            budgetUsed: Math.min(budgetUsed, 100),
            timeProgress: Math.min(timeProgress, 100),
            isOverBudget: project.spent > project.budget,
            isOverdue: project.endDate ? now > project.endDate : false,
        };
    }

    private async getProject(id: string): Promise<Project> {
        const result = await this.db.query(
            `SELECT * FROM erp_projects WHERE id = $1 AND tenant_id = $2`,
            [id, this.tenantId]
        );
        if (result.rows.length === 0) throw new Error('Project not found');
        return this.mapProject(result.rows[0]);
    }

    private mapProject(row: any): Project {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            status: row.status,
            startDate: new Date(row.start_date),
            endDate: row.end_date ? new Date(row.end_date) : undefined,
            budget: parseFloat(row.budget),
            spent: parseFloat(row.spent),
            customerId: row.customer_id,
            teamMembers: JSON.parse(row.team_members || '[]'),
        };
    }
}
