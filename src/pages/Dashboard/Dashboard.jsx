import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  SOURCE_OPTIONS,
  TAG_OPTIONS,
} from "../../utils/constants";
import {
  getStatusColor,
  getPriorityColor,
  calculateLeadStats,
} from "../../utils/helpers";
import "./Dashboard.css";

const AddLeadModal = ({
  show,
  onHide,
  formData,
  setFormData,
  handleAddLead,
  agents,
}) => {
  if (!show) return null;

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Lead</h2>
          <button onClick={onHide} className="modal-close-btn">
            ×
          </button>
        </div>

        <div className="modal-form">
          {/* Lead Name */}
          <div className="form-group">
            <label className="form-label">Lead Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter lead name"
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="form-select"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="form-select"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sales Agent *</label>
            <select
              value={formData.salesAgent}
              onChange={(e) =>
                setFormData({ ...formData, salesAgent: e.target.value })
              }
              className="form-select"
            >
              <option value="">Select an agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Source</label>
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                className="form-select"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Days to Close</label>
              <input
                type="number"
                value={formData.timeToClose}
                onChange={(e) =>
                  setFormData({ ...formData, timeToClose: e.target.value })
                }
                min="1"
                max="365"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div
              className="tag-selector"
              style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
            >
              {TAG_OPTIONS.map((tag) => {
                const isActive = formData.tags.includes(tag);
                return (
                  <span
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      transition: "all 0.2s",
                      backgroundColor: isActive ? "#3b82f6" : "#f3f4f6",
                      color: isActive ? "#ffffff" : "#374151",
                      border: isActive
                        ? "2px solid #3b82f6"
                        : "2px solid #e5e7eb",
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
            {formData.tags.length > 0 && (
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}
              >
                Selected: {formData.tags.join(", ")}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button onClick={onHide} className="form-btn form-btn-cancel">
              Cancel
            </button>
            <button
              onClick={handleAddLead}
              className="form-btn form-btn-submit"
            >
              Add Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { leads, agents, addLead } = useApp();

  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    proposalSent: 0,
    closedLeads: 0,
  });
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    status: "New",
    priority: "Medium",
    salesAgent: "",
    source: "Website",
    timeToClose: 14,
    tags: [],
  });

  useEffect(() => {
    const calculatedStats = calculateLeadStats(leads);
    setStats(calculatedStats);
    filterLeads(activeFilter);
  }, [leads, activeFilter]);

  const filterLeads = (filter) => {
    let filtered = [...leads];
    if (filter !== "all") {
      filtered = leads.filter(
        (lead) => lead.status.toLowerCase() === filter.toLowerCase()
      );
    }
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredLeads(filtered);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    filterLeads(filter);
  };

  const handleAddLead = () => {
    if (!formData.name.trim()) return alert("Please enter a lead name");
    if (!formData.salesAgent) return alert("Please select a sales agent");

    const leadData = {
      name: formData.name,
      status: formData.status,
      priority: formData.priority,
      salesAgent: { name: formData.salesAgent },
      source: formData.source,
      timeToClose: parseInt(formData.timeToClose),
      tags: formData.tags,
    };

    addLead(leadData);

    setFormData({
      name: "",
      status: "New",
      priority: "Medium",
      salesAgent: "",
      source: "Website",
      timeToClose: 14,
      tags: [],
    });
    setShowAddModal(false);
  };

  const StatCard = ({ icon, value, label, gradient }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: gradient }}>
        <span className="stat-icon-text">{icon}</span>
      </div>
      <h3 className="stat-value">{value}</h3>
      <p className="stat-label">{label}</p>
    </div>
  );

  const FilterButton = ({ active, onClick, icon, label }) => (
    <button
      onClick={onClick}
      className={`filter-btn ${
        active ? "filter-btn-active" : "filter-btn-inactive"
      }`}
    >
      <span className="filter-icon">{icon}</span>
      {label}
    </button>
  );

  const LeadCard = ({ lead }) => {
    return (
      <div
        className="lead-card"
        onClick={() => navigate(`/leads/${lead._id}`)}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHoveredCard(lead._id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="lead-card-header">
          <div className="lead-card-info">
            <h6 className="lead-card-name">{lead.name}</h6>
            <small className="lead-card-agent">
              👤 {lead.salesAgent?.name || "Unassigned"}
            </small>
            <small className="lead-card-date">
              📅 {new Date(lead.createdAt).toLocaleDateString()}
            </small>
          </div>
          <span
            className="lead-status-badge"
            style={{ background: getStatusColor(lead.status) }}
          >
            {lead.status}
          </span>
        </div>
        <div className="lead-badges">
          <span
            className="lead-priority-badge"
            style={{
              background: `${getPriorityColor(lead.priority)}20`,
              color: getPriorityColor(lead.priority),
            }}
          >
            🚩 {lead.priority}
          </span>
          <span className="lead-source-badge">🌐 {lead.source}</span>
        </div>
        <div className="lead-time-badge">
          <span className="lead-time-text">
            ⏱️ {lead.timeToClose} days to close
          </span>
        </div>
      </div>
    );
  };

  const LeadRow = ({ lead }) => (
    <div
      className="table-row"
      onClick={() => navigate(`/leads/${lead._id}`)}
      style={{ cursor: "pointer" }}
      onMouseEnter={() => setHoveredCard(lead._id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div>
        <div className="table-cell-name">{lead.name}</div>
        <div className="table-cell-date">
          {new Date(lead.createdAt).toLocaleDateString()}
        </div>
      </div>
      <span
        className="table-badge table-badge-status"
        style={{ background: getStatusColor(lead.status) }}
      >
        {lead.status}
      </span>
      <span
        className="table-badge lead-priority-badge"
        style={{
          background: `${getPriorityColor(lead.priority)}20`,
          color: getPriorityColor(lead.priority),
        }}
      >
        {lead.priority}
      </span>
      <div className="table-cell-text">👤 {lead.salesAgent?.name}</div>
      <div className="table-cell-text">🌐 {lead.source}</div>
      <span className="table-badge table-badge-time">
        {lead.timeToClose} days
      </span>
    </div>
  );

  if (currentView === "allLeads") {
    return (
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
          <div className="dashboard-header">
            <div className="header-content">
              <div>
                <h1 className="header-title">All Leads</h1>
                <p className="header-subtitle">
                  Complete list of all {leads.length} leads
                </p>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="back-btn"
                >
                  ← Back to Dashboard
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="add-lead-btn"
                >
                  ➕ Add New Lead
                </button>
              </div>
            </div>
          </div>

          <div className="table-container">
            <div className="table-header">
              <div className="table-header-cell">Lead Name</div>
              <div className="table-header-cell">Status</div>
              <div className="table-header-cell">Priority</div>
              <div className="table-header-cell">Assigned To</div>
              <div className="table-header-cell">Source</div>
              <div className="table-header-cell">Time to Close</div>
            </div>
            {[...leads]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((lead) => (
                <LeadRow key={lead._id} lead={lead} />
              ))}
          </div>
        </div>
        <AddLeadModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          formData={formData}
          setFormData={setFormData}
          handleAddLead={handleAddLead}
          agents={agents}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <div className="header-content">
            <div>
              <h1 className="header-title">PipeLineHQ Dashboard</h1>
              <p className="header-subtitle">
                Glad you're back! Here's a quick overview of your leads.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="add-lead-btn"
            >
              ➕ Add New Lead
            </button>
          </div>
        </div>

        <div className="stats-section">
          <h5 className="section-title">Lead Status Overview</h5>
          <div className="stats-grid">
            <StatCard
              icon="👤"
              value={stats.newLeads}
              label="New Leads"
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            />
            <StatCard
              icon="📞"
              value={stats.contactedLeads}
              label="Contacted"
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            />
            <StatCard
              icon="✅"
              value={stats.qualifiedLeads}
              label="Qualified"
              gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            />
            <StatCard
              icon="📄"
              value={stats.proposalSent}
              label="Proposal Sent"
              gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            />
            <StatCard
              icon="🎯"
              value={stats.closedLeads}
              label="Closed"
              gradient="linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
            />
            <StatCard
              icon="🏆"
              value={stats.totalLeads}
              label="Total Leads"
              gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-container">
            <FilterButton
              active={activeFilter === "all"}
              onClick={() => handleFilterClick("all")}
              icon="📋"
              label="All"
            />
            <FilterButton
              active={activeFilter === "new"}
              onClick={() => handleFilterClick("new")}
              icon="➕"
              label="New"
            />
            <FilterButton
              active={activeFilter === "contacted"}
              onClick={() => handleFilterClick("contacted")}
              icon="📞"
              label="Contacted"
            />
            <FilterButton
              active={activeFilter === "qualified"}
              onClick={() => handleFilterClick("qualified")}
              icon="✅"
              label="Qualified"
            />
            <FilterButton
              active={activeFilter === "proposal sent"}
              onClick={() => handleFilterClick("proposal sent")}
              icon="📄"
              label="Proposal"
            />
            <FilterButton
              active={activeFilter === "closed"}
              onClick={() => handleFilterClick("closed")}
              icon="🎯"
              label="Closed"
            />
          </div>
        </div>

        <div>
          <div className="leads-header">
            <h5 className="leads-title">
              {activeFilter === "all"
                ? "Recent Leads"
                : `${
                    activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)
                  } Leads`}{" "}
              ({filteredLeads.length})
            </h5>
            <button
              onClick={() => setCurrentView("allLeads")}
              className="view-all-btn"
            >
              View All →
            </button>
          </div>
          {filteredLeads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h6 className="empty-title">
                {activeFilter === "all"
                  ? "No leads found"
                  : `No ${activeFilter} leads found`}
              </h6>
              <p className="empty-subtitle">
                {activeFilter === "all"
                  ? "Start by adding your first lead."
                  : "Try a different filter or add new leads."}
              </p>
            </div>
          ) : (
            <div className="leads-grid">
              {filteredLeads.slice(0, 6).map((lead) => (
                <LeadCard key={lead._id} lead={lead} />
              ))}
            </div>
          )}
        </div>
      </div>
      <AddLeadModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        formData={formData}
        setFormData={setFormData}
        handleAddLead={handleAddLead}
        agents={agents}
      />
    </div>
  );
};

export default Dashboard;
