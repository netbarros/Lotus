
import { Card, CardHeader, CardTitle, CardContent, Button } from "@magicsaas/ui-kit";

// Mock data simulating backend/Sofia responses
const STATS = [
    { label: "Active Patients", value: "142", change: "+12%" },
    { label: "Waiting Room", value: "8", change: "Avg 14min" },
    { label: "Daily Revenue", value: "$4,250", change: "+5%" },
];

const RECENT_ALERTS = [
    { id: 1, type: "IoT", message: "Room 3 Temperature > 26°C", time: "2m ago" },
    { id: 2, type: "ERP", message: "Low stock: Tylenol (500mg)", time: "15m ago" },
    { id: 3, type: "Sofia", message: "Patient #582 flagged for follow-up", time: "1h ago" },
];

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Clinic Dashboard</h2>
                <div className="flex gap-2">
                    <Button variant="outline">Refresh Data</Button>
                    <Button>Ask Sofia AI</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {STATS.map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart / Activity (Mock Placeholder) */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-md">
                            [Simulated Revenue Chart Component]
                        </div>
                    </CardContent>
                </Card>

                {/* System Alerts */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>System-11 Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {RECENT_ALERTS.map(alert => (
                                <div key={alert.id} className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${alert.type === 'IoT' ? 'bg-red-500' : alert.type === 'Sofia' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{alert.message}</p>
                                        <p className="text-xs text-muted-foreground">{alert.type} • {alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
