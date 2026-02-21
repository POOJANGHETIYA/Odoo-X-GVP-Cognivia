import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen min-h-screen font-sans bg-[#f4f6f8] text-slate-900 overflow-hidden">
      {/* Top Navigation */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar className="flex-none hidden md:block" />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-6 lg:p-10 relative">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
