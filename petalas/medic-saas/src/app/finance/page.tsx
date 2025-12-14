
'use client';

// import { type Invoice } from "@magicsaas/erp-bridge"; // Uncomment when strict type export is verified
import { Card, CardHeader, CardTitle, CardContent, Button } from "@magicsaas/ui-kit";
import { useState } from 'react';

// MOCK ERP DATA (Conforming to expected Interface)
const MOCK_INVOICES = [
    { id: 'INV-001', customer: 'Patient #582', amount: 450.00, status: 'PENDING', date: '2025-10-24' },
    { id: 'INV-002', customer: 'Unimed Seguros', amount: 1250.00, status: 'PAID', date: '2025-10-23' },
    { id: 'INV-003', customer: 'Patient #491', amount: 200.00, status: 'OVERDUE', date: '2025-10-15' },
    { id: 'INV-004', customer: 'Bradesco Saúde', amount: 3500.00, status: 'PENDING', date: '2025-10-24' },
];

export default function FinancePage() {
    const [invoices, setInvoices] = useState(MOCK_INVOICES);

    const handlePay = (id: string) => {
        console.log(`[ERP Bridge] Processing payment for invoice ${id}...`);
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'PAID' } : inv));
    };

    return (
        <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle className="text-sm">Revenue (Today)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">R$ 5.950,00</div></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-yellow-600">R$ 3.950,00</div></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm">Overdue</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">R$ 200,00</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices (ERP Connected)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Invoice</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{invoice.id}</td>
                                        <td className="p-4 align-middle">{invoice.customer}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                    invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">R$ {invoice.amount.toFixed(2)}</td>
                                        <td className="p-4 align-middle text-right">
                                            {invoice.status !== 'PAID' && (
                                                <Button size="sm" onClick={() => handlePay(invoice.id)}>
                                                    Pay Now
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
