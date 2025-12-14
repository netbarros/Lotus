
import { Button } from "@magicsaas/ui-kit";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
            <h1 className="text-4xl font-bold">Welcome to MedicSaaS</h1>
            <p className="text-xl text-gray-600">The first System-11 Petala.</p>
            <div className="flex gap-4">
                <Button>Start Triage</Button>
                <Button variant="outline">Consult Dashboard</Button>
            </div>
        </div>
    );
}
