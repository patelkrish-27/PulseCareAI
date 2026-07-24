"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden w-full max-w-full">
        <Header />
        <main className="flex-1 overflow-y-auto bg-surface p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1200px] h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
