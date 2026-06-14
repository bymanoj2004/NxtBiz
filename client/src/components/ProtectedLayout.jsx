import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Bot,
  Building2,
  CalendarDays,
  FileBarChart,
  Home,
  Inbox,
  LogOut,
  Moon,
  Receipt,
  Search,
  Settings,
  Shield,
  Ticket,
  Users,
  Workflow
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/users", label: "Users", icon: Users },
  { to: "/customers", label: "Customers", icon: Building2 },
  { to: "/emails", label: "Emails", icon: Inbox },
  { to: "/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/crm", label: "CRM", icon: Shield },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/ai-control", label: "AI Control", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function ProtectedLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dark, setDark] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      withCredentials: true
    });
    const events = ["new_email", "new_ticket", "invoice_created", "meeting_created", "agent_completed", "workflow_executed"];
    events.forEach((event) => {
      socket.on(event, () => {
        setUnread((value) => value + 1);
        toast.success(event.replaceAll("_", " "));
        queryClient.invalidateQueries();
      });
    });
    return () => socket.disconnect();
  }, [queryClient]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-field text-ink dark:bg-gray-950 dark:text-gray-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:block">
        <div className="flex h-16 items-center border-b border-gray-200 px-5 dark:border-gray-800">
          <div>
            <div className="text-lg font-semibold">NxtBiz</div>
            <div className="text-xs text-gray-500">Operations console</div>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                  isActive ? "bg-teal-50 text-signal dark:bg-teal-950" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <div className="text-sm font-semibold">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.role}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-md border border-gray-200 p-2 dark:border-gray-700" title="Unread alerts" onClick={() => setUnread(0)}>
              <Bell size={18} />
              {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-coral px-1.5 text-xs text-white">{unread}</span>}
            </button>
            <button className="rounded-md border border-gray-200 p-2 dark:border-gray-700" title="Toggle dark mode" onClick={() => setDark((value) => !value)}>
              <Moon size={18} />
            </button>
            <button className="rounded-md border border-gray-200 p-2 dark:border-gray-700" title="Logout" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function SectionHeader({ title, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {action}
    </div>
  );
}

export function SearchBox(props) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
      <Search size={16} />
      <input className="w-full bg-transparent outline-none" {...props} />
    </label>
  );
}
