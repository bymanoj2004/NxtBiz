import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedLayout } from "../components/ProtectedLayout.jsx";
import { AuthPage } from "../pages/AuthPage.jsx";
import { CustomerDetailPage } from "../pages/CustomerDetailPage.jsx";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { DataPage } from "../pages/DataPage.jsx";
import { EmailsPage } from "../pages/EmailsPage.jsx";
import { WorkflowsPage } from "../pages/WorkflowsPage.jsx";
import { useAuthStore } from "../store/authStore";

function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  return user ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <AuthPage mode="login" /> },
  { path: "/register", element: <AuthPage mode="register" /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <DataPage title="Users" endpoint="/users" /> },
      { path: "customers", element: <DataPage title="Customers" endpoint="/customers" createKind="customer" /> },
      { path: "customers/:id", element: <CustomerDetailPage /> },
      { path: "emails", element: <EmailsPage /> },
      { path: "meetings", element: <DataPage title="Meetings" endpoint="/meetings" createKind="meeting" /> },
      { path: "invoices", element: <DataPage title="Invoices" endpoint="/invoices" createKind="invoice" /> },
      { path: "tickets", element: <DataPage title="Tickets" endpoint="/tickets" createKind="ticket" /> },
      { path: "reports", element: <DataPage title="Reports" endpoint="/reports" /> },
      { path: "crm", element: <DataPage title="CRM Timeline" endpoint="/crm" /> },
      { path: "workflows", element: <WorkflowsPage /> },
      { path: "ai-control", element: <DataPage title="AI Control Center" endpoint="/agents/executions" /> },
      { path: "settings", element: <DataPage title="Runtime Settings" endpoint="/notifications" /> }
    ]
  }
]);
