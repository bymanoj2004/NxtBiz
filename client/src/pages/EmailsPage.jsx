import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/http";
import { SectionHeader } from "../components/ProtectedLayout.jsx";

export function EmailsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    sender: "customer@example.com",
    subject: "Urgent support issue",
    body: "We have an urgent issue and need help immediately."
  });
  const { data = [], isLoading } = useQuery({
    queryKey: ["emails"],
    queryFn: async () => (await api.get("/emails")).data
  });
  const processEmail = useMutation({
    mutationFn: async () => (await api.post("/emails/process", form)).data,
    onSuccess: () => {
      toast.success("Email processed and agents ran");
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Email processing failed")
  });

  return (
    <>
      <SectionHeader
        title="Email Dashboard"
        action={
          <button onClick={() => processEmail.mutate()} className="inline-flex items-center gap-2 rounded-md bg-signal px-3 py-2 text-sm font-medium text-white">
            <Send size={16} />
            Process
          </button>
        }
      />
      <div className="mb-4 grid gap-3 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <input className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700" placeholder="Sender" value={form.sender} onChange={(e) => setForm({ ...form, sender: e.target.value })} />
        <input className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <textarea className="min-h-24 rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700" placeholder="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      </div>
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="p-4 text-sm text-gray-500">Loading emails...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-950">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Sentiment</th>
                <th className="px-4 py-3">Intent</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Processed</th>
              </tr>
            </thead>
            <tbody>
              {data.map((email) => (
                <tr key={email._id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="px-4 py-3">{email.subject}</td>
                  <td className="px-4 py-3">{email.sentiment}</td>
                  <td className="px-4 py-3">{email.intent}</td>
                  <td className="px-4 py-3">{email.urgency}</td>
                  <td className="px-4 py-3">{email.processed ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
