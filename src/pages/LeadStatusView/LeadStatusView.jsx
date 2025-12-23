import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../../utils/constants";
import { getStatusColor, getPriorityColor } from "../../utils/helpers";
import "./LeadStatusView.css";

const LeadStatusView = () => {
  const navigate = useNavigate();
  const { leads, agents } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    salesAgent: searchParams.get("salesAgent") || "",
    priority: searchParams.get("priority") || "",
  });

  const [sortBy, setSortBy] = useState("timeAsc");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.salesAgent) params.set("salesAgent", filters.salesAgent);
    if (filters.priority) params.set("priority", filters.priority);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ salesAgent: "", priority: "" });
    setSortBy("timeAsc");
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesAgent =
      !filters.salesAgent || lead.salesAgent?.name === filters.salesAgent;
    const matchesPriority =
      !filters.priority || lead.priority === filters.priority;
    return matchesAgent && matchesPriority;
  });

  const sortLeads = (leadsArray) => {
    const sorted = [...leadsArray];
    switch (sortBy) {
      case "timeAsc":
        sorted.sort((a, b) => a.timeToClose - b.timeToClose);
        break;
      case "timeDesc":
        sorted.sort((a, b) => b.timeToClose - a.timeToClose);
        break;
      default:
        break;
    }
    return sorted;
  };

  const groupedLeads = STATUS_OPTIONS.filter((s) => s !== "All")
    .map((status) => ({
      status,
      leads: sortLeads(filteredLeads.filter((l) => l.status === status)),
    }))
    .filter((group) => group.leads.length > 0);

  const hasActiveFilters = filters.salesAgent || filters.priority;

  return (
    <div className="lead-status-view-container">
      <div className="lead-status-view-wrapper">
        {/* Header */}
        <div className="status-view-header">
          <div className="status-view-header-content">
            <div>
              <h1 className="status-view-title">📊 Lead Status View</h1>
              <p className="status-view-subtitle">
                Leads organized by their current status ({filteredLeads.length}{" "}
                total)
              </p>
            </div>
            <button
              className="status-view-back-btn"
              onClick={() => navigate("/")}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className="status-view-filters-card">
          <div className="status-view-filters-header">
            <h5 className="status-view-filters-title">🔍 Filter Options</h5>
            {hasActiveFilters && (
              <button className="status-view-clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          <div className="status-view-filters-grid">
            <div className="status-view-filter-group">
              <label className="status-view-filter-label">Sales Agent</label>
              <select
                className="status-view-filter-select"
                value={filters.salesAgent}
                onChange={(e) =>
                  handleFilterChange("salesAgent", e.target.value)
                }
              >
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.name}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="status-view-filter-group">
              <label className="status-view-filter-label">Priority</label>
              <select
                className="status-view-filter-select"
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
              >
                <option value="">All Priorities</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="status-view-filter-group">
              <label className="status-view-filter-label">
                Sort by Time to Close
              </label>
              <select
                className="status-view-filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="timeAsc">Shortest First</option>
                <option value="timeDesc">Longest First</option>
              </select>
            </div>
          </div>
        </div>

        {groupedLeads.length === 0 ? (
          <div className="status-view-empty">
            <div className="status-view-empty-icon">📭</div>
            <h6 className="status-view-empty-title">No leads found</h6>
            <p className="status-view-empty-text">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "No leads available"}
            </p>
          </div>
        ) : (
          <div className="status-view-groups">
            {groupedLeads.map((group) => (
              <div key={group.status} className="status-view-group">
                <div className="status-view-group-header">
                  <div
                    className="status-view-group-badge"
                    style={{ background: getStatusColor(group.status) }}
                  >
                    <span className="status-view-group-dot" />
                    <span className="status-view-group-status">
                      {group.status}
                    </span>
                  </div>
                  <span className="status-view-group-count">
                    {group.leads.length} lead
                    {group.leads.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="status-view-group-leads">
                  {group.leads.map((lead) => (
                    <div
                      key={lead._id}
                      className="status-view-lead-card"
                      onClick={() => navigate(`/leads/${lead._id}`)}
                    >
                      <div className="status-view-lead-header">
                        <h4 className="status-view-lead-name">{lead.name}</h4>
                        <span
                          className="status-view-lead-priority"
                          style={{
                            background: `${getPriorityColor(lead.priority)}20`,
                            color: getPriorityColor(lead.priority),
                          }}
                        >
                          🚩 {lead.priority}
                        </span>
                      </div>

                      <div className="status-view-lead-details">
                        <div className="status-view-lead-detail">
                          <span className="status-view-lead-icon">👤</span>
                          <span className="status-view-lead-text">
                            {lead.salesAgent?.name || "Unassigned"}
                          </span>
                        </div>

                        <div className="status-view-lead-detail">
                          <span className="status-view-lead-icon">⏱️</span>
                          <span className="status-view-lead-text">
                            {lead.timeToClose} days to close
                          </span>
                        </div>

                        <div className="status-view-lead-detail">
                          <span className="status-view-lead-icon">🌐</span>
                          <span className="status-view-lead-text">
                            {lead.source}
                          </span>
                        </div>

                        <div className="status-view-lead-detail">
                          <span className="status-view-lead-icon">📅</span>
                          <span className="status-view-lead-text">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {lead.tags && lead.tags.length > 0 && (
                        <div className="status-view-lead-tags">
                          {lead.tags.map((tag, idx) => (
                            <span key={idx} className="status-view-lead-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadStatusView;
