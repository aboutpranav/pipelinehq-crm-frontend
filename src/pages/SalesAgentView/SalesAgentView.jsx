import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../../utils/constants";
import { getPriorityColor } from "../../utils/helpers";
import "./SalesAgentView.css";

const SalesAgentView = () => {
  const navigate = useNavigate();
  const { leads, agents } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
  });

  const [sortBy, setSortBy] = useState("timeAsc");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: "", priority: "" });
    setSortBy("timeAsc");
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = !filters.status || lead.status === filters.status;
    const matchesPriority =
      !filters.priority || lead.priority === filters.priority;
    return matchesStatus && matchesPriority;
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

  const groupedLeads = agents
    .map((agent) => ({
      agent,
      leads: sortLeads(
        filteredLeads.filter((l) => l.salesAgent?.name === agent.name)
      ),
    }))
    .filter((group) => group.leads.length > 0);

  const hasActiveFilters = filters.status || filters.priority;

  return (
    <div className="agent-view-container">
      <div className="agent-view-wrapper">
        <div className="agent-view-header">
          <div className="agent-view-header-content">
            <div>
              <h1 className="agent-view-title">👥 Sales Agent View</h1>
              <p className="agent-view-subtitle">
                Leads grouped by sales agent ({filteredLeads.length} total)
              </p>
            </div>
            <button
              className="agent-view-back-btn"
              onClick={() => navigate("/")}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className="agent-view-filters-card">
          <div className="agent-view-filters-header">
            <h5 className="agent-view-filters-title">🔍 Filter Options</h5>
            {hasActiveFilters && (
              <button className="agent-view-clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          <div className="agent-view-filters-grid">
            <div className="agent-view-filter-group">
              <label className="agent-view-filter-label">Status</label>
              <select
                className="agent-view-filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.filter((s) => s !== "All").map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="agent-view-filter-group">
              <label className="agent-view-filter-label">Priority</label>
              <select
                className="agent-view-filter-select"
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

            <div className="agent-view-filter-group">
              <label className="agent-view-filter-label">
                Sort by Time to Close
              </label>
              <select
                className="agent-view-filter-select"
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
          <div className="agent-view-empty">
            <div className="agent-view-empty-icon">📭</div>
            <h6 className="agent-view-empty-title">No leads found</h6>
            <p className="agent-view-empty-text">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "No leads available"}
            </p>
          </div>
        ) : (
          <div className="agent-view-groups">
            {groupedLeads.map((group) => (
              <div key={group.agent.id} className="agent-view-group">
                <div className="agent-view-group-header">
                  <div className="agent-view-group-agent">
                    <div className="agent-view-group-avatar">
                      {group.agent.name.charAt(0)}
                    </div>
                    <div className="agent-view-group-info">
                      <h3 className="agent-view-group-name">
                        {group.agent.name}
                      </h3>
                      <p className="agent-view-group-email">
                        {group.agent.email ||
                          `${group.agent.name
                            .toLowerCase()
                            .replace(" ", ".")}@pipelinehq.com`}
                      </p>
                    </div>
                  </div>
                  <span className="agent-view-group-count">
                    {group.leads.length} lead
                    {group.leads.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="agent-view-group-leads">
                  {group.leads.map((lead) => (
                    <div
                      key={lead._id}
                      className="agent-view-lead-card"
                      onClick={() => navigate(`/leads/${lead._id}`)}
                    >
                      <div className="agent-view-lead-header">
                        <h4 className="agent-view-lead-name">{lead.name}</h4>
                        <span
                          className="agent-view-lead-priority"
                          style={{
                            background: `${getPriorityColor(lead.priority)}20`,
                            color: getPriorityColor(lead.priority),
                          }}
                        >
                          🚩 {lead.priority}
                        </span>
                      </div>

                      <div className="agent-view-lead-details">
                        <div className="agent-view-lead-detail">
                          <span className="agent-view-lead-icon">📊</span>
                          <span className="agent-view-lead-status">
                            {lead.status}
                          </span>
                        </div>

                        <div className="agent-view-lead-detail">
                          <span className="agent-view-lead-icon">⏱️</span>
                          <span className="agent-view-lead-text">
                            {lead.timeToClose} days to close
                          </span>
                        </div>

                        <div className="agent-view-lead-detail">
                          <span className="agent-view-lead-icon">🌐</span>
                          <span className="agent-view-lead-text">
                            {lead.source}
                          </span>
                        </div>

                        <div className="agent-view-lead-detail">
                          <span className="agent-view-lead-icon">📅</span>
                          <span className="agent-view-lead-text">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {lead.tags && lead.tags.length > 0 && (
                        <div className="agent-view-lead-tags">
                          {lead.tags.map((tag, idx) => (
                            <span key={idx} className="agent-view-lead-tag">
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

export default SalesAgentView;
