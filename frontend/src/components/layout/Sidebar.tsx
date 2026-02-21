import {
  Command,
  Car,
  Users,
  ArrowRightLeft,
  ClipboardList,
  Wrench,
  Receipt,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

const MENU_ITEMS = [
  { name: "Command Center", icon: Command, href: "/" },

  { name: "Cars", icon: Car, href: "/vehicles" },
  { name: "Trips", icon: ClipboardList, href: "/trips" },
  { name: "Service", icon: Wrench, href: "/maintenance" },
  { name: "Drivers", icon: Users, href: "/drivers" },
  { name: "Transactions", icon: ArrowRightLeft, href: "/financials" },
  { name: "Expenses", icon: Receipt, href: "/financials/expenses" },
];

export function Sidebar({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`w-[88px] bg-[#1a1d2e] text-slate-300 flex flex-col shrink-0 overflow-y-auto ${className}`}
    >
      <div className="flex-1 w-full space-y-1 py-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center justify-center py-4 w-full transition-colors group relative hover:bg-[#23273e] hover:text-white"
              activeProps={{
                className: "bg-[#23273e] text-white",
              }}
              activeOptions={{ exact: item.href === '/' }}
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#3bb273] rounded-r" />
                  )}
                  <Icon
                    className={`w-6 h-6 mb-2 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                  />
                  <span
                    className={`text-[10px] font-medium leading-tight text-center px-1 break-words ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
