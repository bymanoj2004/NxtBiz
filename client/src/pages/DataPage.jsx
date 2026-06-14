import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { api } from "../api/http";
import { SectionHeader } from "../components/ProtectedLayout.jsx";

const createDefaults = {
  customer: { name: "", email: "", phone: "", company: "", notes: "" },
  meeting: { title: "", attendees: [], startTime: "", endTime: "", notes: "" },
  invoice: { customerId: "", amount: 0, dueDate: "", status: "draft", lineItems: [] },
  ticket: { customerId: "", priority: "medium", issue: "", status: "open" }
};

function displayValue(value) {
  if (value == null) return "";
  if (typeof value === "object") return value.name || value.email || value._id || JSON.stringify(value);
  return String(value);
}

export function DataPage({ title, endpoint, createKind }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(createKind ? createDefaults[createKind] : null);
  const { data = [], isLoading, error } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => (await api.get(endpoint)).data
  });

  const createMutation = useMutation({
    mutationFn: async () => (await api.post(endpoint, form)).data,
    onSuccess: () => {
      toast.success(`${title} updated`);
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setForm(createDefaults[createKind]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Create failed")
  });

  const rows = Array.isArray(data) ? data : [];
  const columns = rows[0] ? Object.keys(rows[0]).filter((key) => !["__v", "passwordHash", "refreshTokenHash"].includes(key)).slice(0, 6) : [];

  return (
    <>
      <SectionHeader
        title={title}
        action={
          createKind && (
            <button onClick={() => createMutation.mutate()} className="inline-flex items-center gap-2 rounded-md bg-signal px-3 py-2 text-sm font-medium text-white">
              <Plus size={16} />
              Create
            </button>
          )
        }
      />
      {createKind && (
        <div className="mb-4 grid gap-3 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-2">
          {Object.keys(createDefaults[createKind]).map((key) => (
            <input
              key={key}
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
              placeholder={key}
              value={Array.isArray(form[key]) ? form[key].join(", ") : form[key]}
              onChange={(event) => {
                const value = key === "amount" ? Number(event.target.value) : event.target.value;
                setForm({ ...form, [key]: value });
              }}
            />
          ))}
        </div>
      )}
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading && <div className="p-4 text-sm text-gray-500">Loading...</div>}
        {error && <div className="p-4 text-sm text-red-600">Failed to load {title.toLowerCase()}.</div>}
        {!isLoading && rows.length === 0 && <div className="p-4 text-sm text-gray-500">No records yet.</div>}
        {rows.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-950">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  {columns.map((column) => (
                    <td key={column} className="max-w-xs truncate px-4 py-3">
                      {column === "name" && endpoint === "/customers" ? (
                        <Link className="text-signal" to={`/customers/${row._id}`}>{row.name}</Link>
                      ) : (
                        displayValue(row[column])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
