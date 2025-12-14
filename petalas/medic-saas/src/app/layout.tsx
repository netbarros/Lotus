
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MedicSaaS - MagicSaaS Pilot",
    description: "Reference Implementation for System-11",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="flex min-h-screen flex-col">
                    <header className="border-b">
                        <div className="flex h-16 items-center px-4 md:px-6">
                            <h1 className="text-xl font-bold">MedicSaaS</h1>
                        </div>
                    </header>
                    <main className="flex-1">
                        {children}
                    </main>
                    <footer className="border-t py-4 text-center text-sm text-gray-500">
                        Powered by MagicSaaS OS
                    </footer>
                </div>
            </body>
        </html>
    );
}
