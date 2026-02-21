import {
  LayoutDashboard,
  Truck,
  Users,
  ClipboardList,
  Wrench,
  Receipt,
  Map,
  BarChart3,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../features/auth/AuthContext";

const MENU_ITEMS = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/", roles: ["admin", "dispatcher", "finance", "maintenance"] },
  { name: "Vehicles", icon: Truck, href: "/vehicles", roles: ["admin", "dispatcher", "maintenance"] },
  { name: "Trips", icon: ClipboardList, href: "/trips", roles: ["admin", "dispatcher"] },
  { name: "Maintenance", icon: Wrench, href: "/maintenance", roles: ["admin", "maintenance"] },
  { name: "Drivers", icon: Users, href: "/drivers", roles: ["admin", "dispatcher"] },
  { name: "Financials", icon: Receipt, href: "/financials/expenses", roles: ["admin", "finance"] },
  { name: "Analytics", icon: BarChart3, href: "/reports", roles: ["admin", "finance"] },
  { name: "Live Map", icon: Map, href: "/map", roles: ["admin", "dispatcher", "maintenance"] },
];

export function Sidebar({ className = "" }: { className?: string }) {
  const { user } = useAuth();

  const filteredItems = MENU_ITEMS.filter(item =>
    item.roles.includes(user?.role?.toLowerCase() || "")
  );

  return (
    <aside
      className={`w-[84px] bg-zinc-50 border-r border-zinc-200 flex flex-col shrink-0 overflow-y-auto overflow-x-hidden ${className}`}
    >
      <div className="flex-1 w-full flex flex-col items-center py-6 space-y-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="group relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              activeProps={{
                className: "!bg-white !text-indigo-600 border border-zinc-200 shadow-sm",
              }}
              activeOptions={{ exact: item.href === "/" }}
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  />
                  <span
                    className={`text-[9px] font-bold mt-2 transition-colors uppercase tracking-tighter ${isActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-700"}`}
                  >
                    {item.name}
                  </span>

                  {/* Tooltip text */}
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-zinc-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-zinc-800">
                    {item.name}
                  </div>

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-600 rounded-r-full animate-in slide-in-from-left-2 duration-300" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-200 flex flex-col items-center">
        <div className="w-9 h-9 rounded-xl bg-indigo-600/5 flex items-center justify-center text-indigo-600 font-black text-[10px] border border-indigo-200/50 shadow-inner">
          {user?.name.split(' ').map(n => n[0]).join('') || 'FF'}
        </div>
      </div>
    </aside>
  );
}
