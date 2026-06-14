import { useQuery } from "@tanstack/react-query";
import { BarChart3, Building2, Inbox, Receipt, Ticket } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/http";
import { SectionHeader } from "../components/ProtectedLayout.jsx";

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon size={18} />
      </div>
      <div className="mt-3 text-2xl font-semibold">{value ?? "..."}</div>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: async () => (await api.get("/dashboard")).data });
  const chartData = data
    ? [
        { name: "Customers", value: data.customers },
        { name: "Emails", value: data.emails },
        { name: "Tickets", value: data.tickets },
        { name: "Meetings", value: data.meetings }
      ]
    : [];

  return (
    <>
      <SectionHeader title="Executive Dashboard" />
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">Dashboard failed to load.</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat icon={Building2} label="Customers" value={data?.customers} />
        <Stat icon={Inbox} label="Emails" value={data?.emails} />
        <Stat icon={Ticket} label="Tickets" value={data?.tickets} />
        <Stat icon={Receipt} label="Revenue" value={data ? `$${data.revenue}` : undefined} />
        <Stat icon={BarChart3} label="Health" value={data?.health?.score} />
      </div>
      <div className="mt-4 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold">Activity Mix</h2>
        <div className="h-72">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading dashboard...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}
