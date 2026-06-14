import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "admin@nxtbiz.local", password: "Admin12345", role: "Admin" });
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      if (isRegister) await register(form);
      else await login(form.email, form.password);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-field p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">NxtBiz</h1>
        <p className="mt-1 text-sm text-gray-500">{isRegister ? "Create an operations account." : "Sign in to the operations console."}</p>
        <div className="mt-6 space-y-3">
          {isRegister && (
            <input className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          )}
          <input className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {isRegister && (
            <select className="w-full rounded-md border border-gray-300 px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option>Admin</option>
              <option>Manager</option>
              <option>Employee</option>
              <option>Viewer</option>
            </select>
          )}
        </div>
        <button disabled={loading} className="mt-5 w-full rounded-md bg-signal px-4 py-2 font-medium text-white disabled:opacity-60">
          {loading ? "Working..." : isRegister ? "Register" : "Login"}
        </button>
        <Link className="mt-4 block text-center text-sm text-signal" to={isRegister ? "/login" : "/register"}>
          {isRegister ? "Use an existing account" : "Create an account"}
        </Link>
      </form>
    </main>
  );
}
