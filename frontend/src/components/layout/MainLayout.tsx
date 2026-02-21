import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen min-h-screen font-sans bg-zinc-50/50 text-zinc-900 overflow-hidden">
      {/* Top Navigation */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar className="flex-none hidden md:block" />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden relative">
          <div className="w-full h-full p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
