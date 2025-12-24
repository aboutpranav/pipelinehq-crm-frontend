import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: "📊", label: "Dashboard" },
    { path: "/leads", icon: "📋", label: "Leads" },
    { path: "/lead-status-view", icon: "📑", label: "Lead Status View" },
    { path: "/agents", icon: "👥", label: "Sales Agents" },
    { path: "/sales-agent-view", icon: "👔", label: "Sales Agent View" },
    { path: "/reports", icon: "📈", label: "Reports" },
    { path: "/settings", icon: "⚙️", label: "Settings" },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? "show" : ""}`}>
        <button className="sidebar-close" onClick={onClose}>
          ×
        </button>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
