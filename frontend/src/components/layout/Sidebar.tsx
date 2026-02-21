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

const MENU_ITEMS = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Vehicles", icon: Truck, href: "/vehicles" },
  { name: "Trips", icon: ClipboardList, href: "/trips" },
  { name: "Maintenance", icon: Wrench, href: "/maintenance" },
  { name: "Drivers", icon: Users, href: "/drivers" },
  { name: "Financials", icon: Receipt, href: "/financials/expenses" },
  { name: "Analytics", icon: BarChart3, href: "/reports" },
  { name: "Live Map", icon: Map, href: "/map" },
];

export function Sidebar({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`w-[80px] bg-zinc-50 border-r border-zinc-200 flex flex-col shrink-0 overflow-y-auto ${className}`}
    >
      <div className="flex-1 w-full flex flex-col items-center py-6 space-y-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="group relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              activeProps={{
                className: "!bg-white !text-indigo-600 border border-zinc-200 shadow-sm",
              }}
              activeOptions={{ exact: true }}
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  />
                  <span
                    className={`text-[9px] font-semibold mt-1.5 transition-colors ${isActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-700"}`}
                  >
                    {item.name}
                  </span>

                  {/* Tooltip text (optional but good for accessibility) */}
                  <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-white text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.name}
                  </div>
                </>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-200 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200">
          FF
        </div>
      </div>
    </aside>
  );
}
