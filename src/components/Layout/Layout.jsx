import { Outlet } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <Navigation />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
