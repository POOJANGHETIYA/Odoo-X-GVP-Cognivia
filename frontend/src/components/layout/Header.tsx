import { ChevronDown, User, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-[72px] bg-[#1a1d2e] border-b border-slate-700/50 flex items-center justify-between px-6 shrink-0 transition-all duration-300 shadow-sm z-10 sticky top-0">
      <div className="flex items-center space-x-8">
        {/* Logo Area */}
        <div className="flex items-center">
          <span className="text-white text-2xl font-bold tracking-tight">
            FleetFlow
          </span>
          <span className="ml-1 text-[10px] font-semibold bg-white/10 text-slate-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
            CRM
          </span>
        </div>

        {/* Fleet Selection/Dropdown (For single fleet, this is minimal) */}
        <button className="hidden md:flex items-center space-x-3 bg-white/5 hover:bg-white/10 transition-colors px-4 py-2 rounded-lg text-slate-200">
          <span className="font-medium text-sm">Dubai DEMO #1</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center space-x-4">
        <button className="text-slate-400 hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <button className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-full">
          <div className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:inline-block text-sm text-slate-200 font-medium mr-1">
            {user?.name || 'Dispatcher Admin'}
          </span>
        </button>

        <button
          onClick={() => logout()}
          className="text-slate-400 hover:text-red-400 transition-colors ml-4 flex items-center"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
