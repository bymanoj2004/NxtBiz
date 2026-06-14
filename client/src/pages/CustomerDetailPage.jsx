import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../api/http";
import { SectionHeader } from "../components/ProtectedLayout.jsx";

export function CustomerDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => (await api.get(`/customers/${id}`)).data
  });

  if (isLoading) return <div className="text-sm text-gray-500">Loading customer...</div>;
  const customer = data?.customer;

  return (
    <>
      <SectionHeader title={customer?.name || "Customer 360"} />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold">Profile</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-gray-500">Company</dt><dd>{customer?.company}</dd></div>
            <div><dt className="text-gray-500">Email</dt><dd>{customer?.email}</dd></div>
            <div><dt className="text-gray-500">Phone</dt><dd>{customer?.phone}</dd></div>
            <div><dt className="text-gray-500">Health</dt><dd>{customer?.healthScore}</dd></div>
          </dl>
        </section>
        {["activities", "emails", "tickets", "invoices", "meetings"].map((key) => (
          <section key={key} className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-semibold capitalize">{key}</h2>
            <div className="mt-3 space-y-2 text-sm">
              {(data?.[key] || []).slice(0, 5).map((item) => (
                <div key={item._id} className="rounded-md bg-gray-50 p-2 dark:bg-gray-950">
                  {item.title || item.subject || item.issue || item.status || item.type}
                </div>
              ))}
              {(data?.[key] || []).length === 0 && <div className="text-gray-500">No records yet.</div>}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
