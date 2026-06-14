import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/http";
import { SectionHeader } from "../components/ProtectedLayout.jsx";

export function WorkflowsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "Negative Email Escalation",
    trigger: "email_processed",
    condition: "negative",
    action: "create ticket and notify manager"
  });
  const { data = [] } = useQuery({ queryKey: ["workflows"], queryFn: async () => (await api.get("/workflows")).data });
  const createWorkflow = useMutation({
    mutationFn: async () => (await api.post("/workflows", form)).data,
    onSuccess: () => {
      toast.success("Workflow created");
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    }
  });
  const executeWorkflow = useMutation({
    mutationFn: async (id) => (await api.post(`/workflows/${id}/execute`, { sentiment: "negative", issue: "Workflow escalation" })).data,
    onSuccess: () => {
      toast.success("Workflow executed");
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    }
  });

  return (
    <>
      <SectionHeader
        title="Workflows"
        action={
          <button onClick={() => createWorkflow.mutate()} className="inline-flex items-center gap-2 rounded-md bg-signal px-3 py-2 text-sm font-medium text-white">
            <Plus size={16} />
            Create
          </button>
        }
      />
      <div className="mb-4 grid gap-3 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-2">
        {Object.keys(form).map((key) => (
          <input key={key} className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700" placeholder={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        ))}
      </div>
      <div className="space-y-3">
        {data.map((workflow) => (
          <div key={workflow._id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div>
              <div className="font-medium">{workflow.name}</div>
              <div className="text-sm text-gray-500">{workflow.trigger} / {workflow.condition || "no condition"} / {workflow.action}</div>
            </div>
            <button onClick={() => executeWorkflow.mutate(workflow._id)} className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
              <Play size={16} />
              Execute
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
