import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      <Navigation toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className="main-content" onClick={closeSidebar}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
