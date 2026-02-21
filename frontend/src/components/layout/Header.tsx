import { Search, HelpCircle, LogOut, User } from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 h-[64px] flex items-center justify-between px-6 shrink-0 transition-all duration-300">
      <div className="flex items-center space-x-8">
        {/* Logo Area */}
        <div className="flex items-center">
          <span className="text-zinc-900 text-xl font-bold tracking-tight">
            FleetFlow
          </span>
          <span className="ml-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-indigo-100">
            Enterprise
          </span>
        </div>

        {/* Global Search Mock */}
        <div className="hidden md:flex items-center relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
          <div className="w-[300px] bg-zinc-100/50 border border-zinc-200 rounded-md py-1.5 pl-10 pr-3 text-sm text-zinc-500 flex items-center justify-between group-hover:bg-zinc-100 transition-colors cursor-pointer">
            <span>Search anything...</span>
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white border border-zinc-300 rounded text-zinc-500 shadow-sm">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white border border-zinc-300 rounded text-zinc-500 shadow-sm">K</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center space-x-3">
        <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="h-6 w-[1px] bg-zinc-200 mx-2" />

        <div className="flex items-center space-x-3 pl-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-zinc-900">{user?.name || 'Dispatcher Admin'}</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Operations Chief'}
            </span>
          </div>

          <button className="h-8 w-8 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center shrink-0 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
            <User className="w-4 h-4 text-zinc-600 group-hover:text-indigo-600" />
          </button>
        </div>

        <button
          onClick={() => logout()}
          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all ml-1"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
