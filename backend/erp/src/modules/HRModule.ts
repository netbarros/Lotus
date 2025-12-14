
import { Pool } from 'pg';
import { Employee } from '../ERPCore';

export class HRModule {
    constructor(private db: Pool, private tenantId: string) { }

    async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
        const result = await this.db.query(
            `INSERT INTO erp_employees (tenant_id, employee_number, first_name, last_name, email, position, department, hire_date, salary, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
            [
                this.tenantId,
                employee.employeeNumber,
                employee.firstName,
                employee.lastName,
                employee.email,
                employee.position,
                employee.department,
                employee.hireDate,
                employee.salary,
                employee.status,
                JSON.stringify(employee.metadata || {}),
            ]
        );

        return this.mapEmployee(result.rows[0]);
    }

    async getPayrollSummary(month: number, year: number) {
        const result = await this.db.query(
            `SELECT
        department,
        COUNT(*) as employees,
        SUM(salary) as total_salary,
        AVG(salary) as average_salary
       FROM erp_employees
       WHERE tenant_id = $1 AND status = 'active'
       GROUP BY department
       ORDER BY total_salary DESC`,
            [this.tenantId]
        );

        return {
            month,
            year,
            departments: result.rows,
            totalPayroll: result.rows.reduce((sum, dept) => sum + parseFloat(dept.total_salary), 0),
        };
    }

    async updateEmployeeSalary(employeeId: string, newSalary: number): Promise<void> {
        await this.db.query(
            `UPDATE erp_employees
       SET salary = $1, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3`,
            [newSalary, employeeId, this.tenantId]
        );
    }

    async getTotalPayroll(): Promise<number> {
        const result = await this.db.query(
            `SELECT SUM(salary) as total
       FROM erp_employees
       WHERE tenant_id = $1 AND status = 'active'`,
            [this.tenantId]
        );
        return parseFloat(result.rows[0].total || 0);
    }

    async trackAttendance(
        employeeId: string,
        date: Date,
        status: 'present' | 'absent' | 'leave'
    ): Promise<void> {
        await this.db.query(
            `INSERT INTO erp_attendance (tenant_id, employee_id, date, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tenant_id, employee_id, date) DO UPDATE SET status = $4`,
            [this.tenantId, employeeId, date, status]
        );
    }

    private mapEmployee(row: any): Employee {
        return {
            id: row.id,
            employeeNumber: row.employee_number,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            position: row.position,
            department: row.department,
            hireDate: new Date(row.hire_date),
            salary: parseFloat(row.salary),
            status: row.status,
            metadata: row.metadata,
        };
    }
}
