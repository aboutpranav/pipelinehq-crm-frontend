import { Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Dashboard from "./pages/Dashboard/Dashboard";
import LeadDetail from "./pages/LeadDetail/LeadDetail";
import LeadList from "./pages/LeadList/LeadList";
import LeadStatusView from "./pages/LeadStatusView/LeadStatusView";
import SalesAgentView from "./pages/SalesAgentView/SalesAgentView";
import Reports from "./pages/Reports/Reports";
import SalesAgents from "./pages/SalesAgents/SalesAgents";
import Settings from "./pages/Settings/Settings";
import Layout from "./components/layout/Layout";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppContent = () => {
  const { loading, error } = useApp();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
        }}
      >
        Loading PipeLineHQ...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "1.2rem", color: "#ef4444" }}>
          Error loading data: {error}
        </div>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<LeadList />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="lead-status-view" element={<LeadStatusView />} />
          <Route path="sales-agent-view" element={<SalesAgentView />} />
          <Route path="reports" element={<Reports />} />
          <Route path="agents" element={<SalesAgents />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
