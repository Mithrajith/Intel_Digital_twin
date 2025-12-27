import React from 'react';
import { Sidebar } from './Sidebar';

export function MainLayout({ children }) {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-background">
                <div className="container mx-auto p-6 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
