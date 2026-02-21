import {
  Command,
  Car,
  BarChart3,
  Activity,
  Network,
  ArrowRightLeft,
  ClipboardList,
  Wallet,
  FileText,
  BookOpen,
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Command Center", icon: Command, href: "#" },
  { name: "Cars", icon: Car, href: "#" },
  { name: "Statistics", icon: BarChart3, href: "#" },
  { name: "Fleets efficiency", icon: Activity, href: "#" },
  { name: "Directory", icon: Network, href: "#" },
  { name: "Transactions", icon: ArrowRightLeft, href: "#" },
  { name: "Requests", icon: ClipboardList, href: "#" },
  { name: "Cashboxes", icon: Wallet, href: "#" },
  { name: "Reports", icon: FileText, href: "#" },
  { name: "Registers", icon: BookOpen, href: "#" },
];

export function Sidebar({ className = "" }: { className?: string }) {
  // Let's assume "Cars" is active for demonstration
  const activeItem = "Cars";

  return (
    <aside
      className={`w-[88px] bg-[#1a1d2e] text-slate-300 flex flex-col shrink-0 overflow-y-auto ${className}`}
    >
      <div className="flex-1 w-full space-y-1 py-4">
        {MENU_ITEMS.map((item) => {
          const isActive = item.name === activeItem;
          const Icon = item.icon;

          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-4 w-full transition-colors group relative ${
                isActive
                  ? "bg-[#23273e] text-white"
                  : "hover:bg-[#23273e] hover:text-white"
              }`}
            >
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
            </a>
          );
        })}
      </div>
    </aside>
  );
}
