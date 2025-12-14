
import React from 'react';

function Layout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900">MagicSaaS Restaurant</h1>
                    <nav className="flex space-x-4">
                        <a href="#" className="text-slate-600 hover:text-slate-900">Dashboard</a>
                        <a href="#" className="text-slate-600 hover:text-slate-900">Orders</a>
                        <a href="#" className="text-slate-600 hover:text-slate-900">Reservations</a>
                    </nav>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                    <h2 className="text-2xl font-bold mb-4">Welcome to MagicSaaS Restaurant</h2>
                    <p className="text-slate-600">The reference implementation for Petalas.</p>
                </div>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <React.StrictMode>
            <div className="app-shell">
                <Layout />
            </div>
        </React.StrictMode>
    );
}
