import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../../utils/constants";
import { isValidEmail } from "../../utils/helpers";
import "./SalesAgents.css";

const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

const AddAgentModal = ({ show, onHide, onAgentCreated }) => {
  const { addAgent } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.email) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      addAgent(formData);
      setFormData({ name: "", email: "" });
      setLoading(false);
      if (onAgentCreated) onAgentCreated();
      onHide();
    }, 1000);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">✨ Add New Agent</h2>
          <button className="modal-close-btn" onClick={onHide}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">⚠️ {error}</div>}

          <form>
            <div className="form-group">
              <label className="form-label">👤 Agent Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter agent name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">📧 Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter agent email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={onHide}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-submit-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Creating...
                  </>
                ) : (
                  <>✨ Add Agent</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SalesAgents = () => {
  const { leads, agents, deleteAgent, deleteMultipleAgents } = useApp();

  const [displayAgents, setDisplayAgents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [stats, setStats] = useState({
    activeAgents: 0,
    totalLeads: 0,
    avgLeadsPerAgent: 0,
    topPerformer: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("nameAsc");
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [selectedAgentForLeads, setSelectedAgentForLeads] = useState(null);
  const [agentStatusFilter, setAgentStatusFilter] = useState("All");
  const [agentPriorityFilter, setAgentPriorityFilter] = useState("All");
  const [agentSortBy, setAgentSortBy] = useState("timeAsc");

  useEffect(() => {
    const agentsWithLeads = agents.map((agent) => ({
      ...agent,
      _id: agent._id || agent.id,
      totalLeads: leads.filter((l) => l.salesAgent?.name === agent.name).length,
      email:
        agent.email ||
        `${agent.name.toLowerCase().replace(" ", ".")}@pipelinehq.com`,
      createdAt: agent.createdAt || new Date().toISOString(),
      status: "Active",
    }));

    setDisplayAgents(agentsWithLeads);

    const totalLeads = leads.length;
    const activeAgents = agentsWithLeads.length;
    const avgLeadsPerAgent =
      activeAgents > 0 ? Math.round(totalLeads / activeAgents) : 0;
    const topPerformer = agentsWithLeads.reduce(
      (top, agent) => (agent.totalLeads > (top?.totalLeads || 0) ? agent : top),
      agentsWithLeads[0]
    );

    setStats({
      activeAgents,
      totalLeads,
      avgLeadsPerAgent,
      topPerformer,
    });
  }, [agents, leads]);

  const handleDelete = (agent) => {
    if (window.confirm(`Are you sure you want to delete ${agent.name}?`)) {
      deleteAgent(agent._id || agent.id);
      setSelectedAgents((prev) =>
        prev.filter((id) => id !== agent._id && id !== agent.id)
      );
    }
  };

  const handleSelectAgent = (agentId, checked) => {
    if (checked) {
      setSelectedAgents((prev) => [...prev, agentId]);
    } else {
      setSelectedAgents((prev) => prev.filter((id) => id !== agentId));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedAgents.length} selected agent(s)?`)) {
      deleteMultipleAgents(selectedAgents);
      setSelectedAgents([]);
      setSelectAll(false);
    }
  };

  const sortAgents = (list, option) => {
    const sorted = [...list];
    switch (option) {
      case "nameAsc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameDesc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "leadsHigh":
        sorted.sort((a, b) => b.totalLeads - a.totalLeads);
        break;
      case "leadsLow":
        sorted.sort((a, b) => a.totalLeads - b.totalLeads);
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }
    return sorted;
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredAgents = displayAgents.filter((agent) => {
    if (!normalizedSearch) return true;
    return (
      agent.name.toLowerCase().includes(normalizedSearch) ||
      agent.email.toLowerCase().includes(normalizedSearch)
    );
  });
  const finalAgents = sortAgents(filteredAgents, sortOption);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedAgents(finalAgents.map((agent) => agent._id));
    } else {
      setSelectedAgents([]);
    }
    setSelectAll(checked);
  };

  useEffect(() => {
    const selectedCount = selectedAgents.length;
    const filteredCount = finalAgents.length;
    setSelectAll(selectedCount === filteredCount && filteredCount > 0);
  }, [selectedAgents, finalAgents]);

  const handleViewLeads = (agent) => {
    setSelectedAgentForLeads(agent);
    setAgentStatusFilter("All");
    setAgentPriorityFilter("All");
    setAgentSortBy("timeAsc");
  };

  const handleBackToAgents = () => {
    setSelectedAgentForLeads(null);
  };

  const agentLeads = selectedAgentForLeads
    ? leads
        .filter((l) => l.salesAgent?.name === selectedAgentForLeads.name)
        .map((lead) => ({
          _id: lead._id,
          title: lead.name,
          status: lead.status,
          priority: lead.priority,
          timeToCloseDays: lead.timeToClose,
        }))
    : [];

  const filteredAgentLeads = agentLeads.filter((lead) => {
    const statusOk =
      agentStatusFilter === "All" ? true : lead.status === agentStatusFilter;
    const priorityOk =
      agentPriorityFilter === "All"
        ? true
        : lead.priority === agentPriorityFilter;
    return statusOk && priorityOk;
  });

  const sortedAgentLeads = [...filteredAgentLeads].sort((a, b) => {
    switch (agentSortBy) {
      case "statusAsc":
        return a.status.localeCompare(b.status);
      case "priorityAsc":
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      case "timeAsc":
        return a.timeToCloseDays - b.timeToCloseDays;
      case "timeDesc":
        return b.timeToCloseDays - a.timeToCloseDays;
      default:
        return 0;
    }
  });

  const groupedLeadsByStatus = STATUS_OPTIONS.filter((s) => s !== "All")
    .map((status) => ({
      status,
      leads: sortedAgentLeads.filter((l) => l.status === status),
    }))
    .filter((group) => group.leads.length > 0);

  const StatCard = ({ icon, value, label, gradient }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: gradient }}>
        <span>{icon}</span>
      </div>
      <h3 className="stat-value">{value}</h3>
      <p className="stat-label">{label}</p>
    </div>
  );

  const AgentRow = ({ agent }) => {
    const isSelected = selectedAgents.includes(agent._id);

    return (
      <div
        className={`agent-row ${isSelected ? "selected" : ""}`}
        onMouseEnter={() => setHoveredAgent(agent._id)}
        onMouseLeave={() => setHoveredAgent(null)}
      >
        <div className="agent-checkbox-cell">
          <input
            type="checkbox"
            className="agent-checkbox"
            checked={selectedAgents.includes(agent._id)}
            onChange={(e) => handleSelectAgent(agent._id, e.target.checked)}
          />
        </div>

        <div className="agent-details">
          <div className="agent-avatar">{agent.name.charAt(0)}</div>
          <div className="agent-info">
            <div className="agent-name">{agent.name}</div>
            <div className="agent-member-since">
              Member since {new Date(agent.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="agent-contact">
          <span>📧</span>
          <span className="agent-email">{agent.email}</span>
        </div>

        <div className="agent-performance">
          <span>📈</span>
          <span className="agent-leads-count">{agent.totalLeads}</span>
          <span className="agent-leads-label">leads</span>
        </div>

        <div>
          <span className="agent-status-badge">
            <span className="status-dot" />
            Active
          </span>
        </div>

        <div className="agent-actions">
          <button
            className="view-leads-btn"
            onClick={() => handleViewLeads(agent)}
          >
            👁️ View Leads
          </button>
          <button
            className="delete-agent-btn"
            onClick={() => handleDelete(agent)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="sales-agents-container">
      <div className="sales-agents-wrapper">
        <div className="sales-agents-header">
          <div className="header-content">
            <div>
              <h1 className="header-title">👥 Sales Agents</h1>
              <p className="header-subtitle">
                Empower your sales team while keeping performance in check.
              </p>
            </div>
            <button
              className="add-agent-btn"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Add New Agent
            </button>
          </div>
        </div>

        <div className="stats-section">
          <h5 className="stats-title">Team Overview</h5>
          <div className="stats-grid">
            <StatCard
              icon="👥"
              value={stats.activeAgents}
              label="Active Agents"
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            <StatCard
              icon="📊"
              value={stats.totalLeads}
              label="Total Leads"
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            />
            <StatCard
              icon="📈"
              value={stats.avgLeadsPerAgent}
              label="Avg per Agent"
              gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            />
            <StatCard
              icon="🏆"
              value={stats.topPerformer?.name || "N/A"}
              label="Top Performer"
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            />
          </div>
        </div>

        {!selectedAgentForLeads ? (
          <div className="agents-table-container">
            <div className="table-header">
              <div className="table-header-content">
                <div className="table-header-left">
                  <h6 className="table-title">
                    📋 All Sales Agents ({finalAgents.length})
                  </h6>

                  {selectedAgents.length > 0 && (
                    <div className="bulk-actions">
                      <span>{selectedAgents.length} selected</span>
                      <button
                        className="bulk-delete-btn"
                        onClick={handleBulkDelete}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="table-controls">
                  {finalAgents.length > 0 && (
                    <label className="select-all-label">
                      <input
                        type="checkbox"
                        className="select-all-checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      Select All
                    </label>
                  )}

                  <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or email"
                    />
                  </div>

                  <select
                    className="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="nameAsc">Name A → Z</option>
                    <option value="nameDesc">Name Z → A</option>
                    <option value="leadsHigh">Leads High → Low</option>
                    <option value="leadsLow">Leads Low → High</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {finalAgents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h6 className="empty-state-title">No sales agents found</h6>
                <p className="empty-state-text">
                  Start by adding your first sales agent to get started.
                </p>
                <button
                  className="add-agent-btn"
                  onClick={() => setShowAddModal(true)}
                >
                  ➕ Add New Agent
                </button>
              </div>
            ) : (
              <div>
                <div className="table-column-headers">
                  <div />
                  <div className="column-header">AGENT DETAILS</div>
                  <div className="column-header">CONTACT</div>
                  <div className="column-header">PERFORMANCE</div>
                  <div className="column-header">STATUS</div>
                  <div className="column-header column-header-right">
                    ACTIONS
                  </div>
                </div>

                {finalAgents.map((agent) => (
                  <AgentRow key={agent._id} agent={agent} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="leads-by-agent-container">
            <aside className="leads-sidebar">
              <button className="back-btn" onClick={handleBackToAgents}>
                ← Back to Agents
              </button>

              <h3 className="sidebar-agent-name">
                {selectedAgentForLeads.name}
              </h3>
              <p className="sidebar-agent-email">
                {selectedAgentForLeads.email}
              </p>
              <p className="sidebar-agent-leads">
                Leads assigned: <strong>{agentLeads.length}</strong>
              </p>

              <hr className="sidebar-divider" />

              <h4 className="sidebar-filters-title">Filters</h4>

              <label className="filter-label">Status</label>
              <select
                className="filter-select"
                value={agentStatusFilter}
                onChange={(e) => setAgentStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.filter((s) => s !== "All").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <label className="filter-label">Priority</label>
              <select
                className="filter-select"
                value={agentPriorityFilter}
                onChange={(e) => setAgentPriorityFilter(e.target.value)}
              >
                <option value="All">All Priorities</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <label className="filter-label">Sort by</label>
              <select
                className="filter-select"
                value={agentSortBy}
                onChange={(e) => setAgentSortBy(e.target.value)}
              >
                <option value="statusAsc">Status A → Z</option>
                <option value="priorityAsc">Priority High → Low</option>
                <option value="timeAsc">Time to Close ↑</option>
                <option value="timeDesc">Time to Close ↓</option>
              </select>
            </aside>

            <section className="leads-main-section">
              <h3 className="leads-section-title">Leads by Status</h3>
              <p className="leads-section-subtitle">
                Display of leads grouped by their assigned sales agent, with
                filters for status and priority and sorting by time to close.
              </p>

              {groupedLeadsByStatus.length === 0 ? (
                <div className="leads-empty-state">
                  <div className="leads-empty-icon">📭</div>
                  <div className="leads-empty-title">
                    No leads match the selected filters.
                  </div>
                  <div className="leads-empty-text">
                    Try changing status, priority, or sort options in the
                    sidebar.
                  </div>
                </div>
              ) : (
                <div className="leads-groups-container">
                  {groupedLeadsByStatus.map((group) => (
                    <div key={group.status} className="lead-group">
                      <div className="lead-group-header">
                        <div
                          className={`lead-group-badge lead-group-status-${
                            group.status === "New"
                              ? "new"
                              : group.status === "Qualified"
                              ? "qualified"
                              : group.status === "Contacted"
                              ? "contacted"
                              : "default"
                          }`}
                        >
                          <span className="lead-group-dot" />
                          <span className="lead-group-status-text">
                            {group.status}
                          </span>
                        </div>
                        <span className="lead-group-count">
                          {group.leads.length} lead
                          {group.leads.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="lead-group-leads">
                        {group.leads.map((lead) => (
                          <div key={lead._id} className="lead-item">
                            <div className="lead-item-info">
                              <div className="lead-item-title">
                                {lead.title}
                              </div>
                              <div className="lead-item-time">
                                Time to close:{" "}
                                <span className="lead-item-time-value">
                                  {lead.timeToCloseDays} days
                                </span>
                              </div>
                            </div>

                            <div className="lead-item-actions">
                              <span
                                className={`lead-priority-badge lead-priority-${lead.priority.toLowerCase()}`}
                              >
                                {lead.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <AddAgentModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAgentCreated={() => {
          console.log("Agent created successfully!");
        }}
      />
    </div>
  );
};

export default SalesAgents;
