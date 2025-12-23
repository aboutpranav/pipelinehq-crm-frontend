import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  SOURCE_OPTIONS,
  TAG_OPTIONS,
} from "../../utils/constants";
import { getStatusColor, getPriorityColor } from "../../utils/helpers";
import "./LeadList.css";

const AddLeadModal = ({ show, onHide, onLeadCreated }) => {
  const { addLead, agents } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    source: "Website",
    salesAgent: "",
    status: "New",
    tags: [],
    timeToClose: 30,
    priority: "Medium",
  });

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a lead name");
      return;
    }
    if (!formData.salesAgent) {
      alert("Please select a sales agent");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const leadData = {
        ...formData,
        salesAgent: formData.salesAgent ? { name: formData.salesAgent } : null,
        timeToClose: parseInt(formData.timeToClose) || 30,
      };

      addLead(leadData);

      setFormData({
        name: "",
        source: "Website",
        salesAgent: "",
        status: "New",
        tags: [],
        timeToClose: 30,
        priority: "Medium",
      });
      setLoading(false);
      if (onLeadCreated) onLeadCreated();
      onHide();
    }, 1000);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">✨ Create New Lead</h2>
          <button className="modal-close-btn" onClick={onHide}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="modal-form-grid">
              <div>
                <label className="modal-form-label">🏢 Lead Name *</label>
                <input
                  type="text"
                  className="modal-form-input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter lead name"
                  required
                />
              </div>

              <div>
                <label className="modal-form-label">📊 Status</label>
                <select
                  className="modal-form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="modal-form-label">🚩 Priority</label>
                <select
                  className="modal-form-select"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="modal-form-label">👤 Sales Agent *</label>
                <select
                  className="modal-form-select"
                  value={formData.salesAgent}
                  onChange={(e) =>
                    setFormData({ ...formData, salesAgent: e.target.value })
                  }
                  required
                >
                  <option value="">Select agent</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="modal-form-label">🌐 Source</label>
                <select
                  className="modal-form-select"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                >
                  {SOURCE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="modal-form-label">⏱️ Days to Close</label>
                <input
                  type="number"
                  className="modal-form-input"
                  value={formData.timeToClose}
                  onChange={(e) =>
                    setFormData({ ...formData, timeToClose: e.target.value })
                  }
                  min="1"
                  max="365"
                />
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label className="modal-form-label">🏷️ Tags</label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                }}
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

            <div className="modal-form-actions">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={onHide}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="modal-btn-submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "✨ Create Lead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const LeadList = () => {
  const navigate = useNavigate();
  const { leads, agents } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filteredLeads, setFilteredLeads] = useState([]);
  const [hoveredLead, setHoveredLead] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    salesAgent: searchParams.get("salesAgent") || "",
    source: searchParams.get("source") || "",
    priority: searchParams.get("priority") || "",
    tags: searchParams.get("tags") || "", // ✅ NEW
  });

  const [sortTimeDirection, setSortTimeDirection] = useState(null);
  const [sortPriorityDirection, setSortPriorityDirection] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  useEffect(() => {
    let filtered = [...leads];

    if (filters.status)
      filtered = filtered.filter((lead) => lead.status === filters.status);
    if (filters.salesAgent)
      filtered = filtered.filter(
        (lead) => lead.salesAgent?.name === filters.salesAgent
      );
    if (filters.source)
      filtered = filtered.filter((lead) => lead.source === filters.source);
    if (filters.priority)
      filtered = filtered.filter((lead) => lead.priority === filters.priority);

    if (filters.tags)
      filtered = filtered.filter(
        (lead) => lead.tags && lead.tags.includes(filters.tags)
      );

    setFilteredLeads(filtered);
  }, [filters, leads]);

  const handleFilterChange = (field, value) =>
    setFilters({ ...filters, [field]: value });

  const clearFilters = () =>
    setFilters({
      status: "",
      salesAgent: "",
      source: "",
      priority: "",
      tags: "",
    });

  const getSortedLeads = () => {
    const leadsCopy = [...filteredLeads];

    leadsCopy.sort((a, b) => {
      if (sortTimeDirection) {
        const multiplier = sortTimeDirection === "asc" ? 1 : -1;
        const aVal = a.timeToClose ?? 999;
        const bVal = b.timeToClose ?? 999;
        return (aVal - bVal) * multiplier;
      }

      if (sortPriorityDirection) {
        const multiplier = sortPriorityDirection === "asc" ? 1 : -1;
        const priorityRank = { High: 3, Medium: 2, Low: 1 };
        const aRank = priorityRank[a.priority] ?? 0;
        const bRank = priorityRank[b.priority] ?? 0;
        return (aRank - bRank) * multiplier;
      }

      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return bDate - aDate;
    });

    return leadsCopy;
  };

  const toggleTimeSort = () => {
    setSortTimeDirection((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  const togglePrioritySort = () => {
    setSortPriorityDirection((prev) => {
      if (prev === null) return "desc";
      if (prev === "desc") return "asc";
      return null;
    });
  };

  const SortButton = ({ label, direction, onClick, isActive }) => (
    <button
      className={`sort-btn ${isActive ? "active" : ""}`}
      onClick={onClick}
      title={`${label}: ${!isActive ? "OFF" : direction.toUpperCase()}`}
    >
      <span className="sort-btn-text">{label}</span>
      <span className="sort-btn-icon">
        {!isActive ? "↕️" : direction === "asc" ? "⬆️" : "⬇️"}
      </span>
    </button>
  );

  const sortedLeads = getSortedLeads();
  const hasActiveFilters = Object.values(filters).some((f) => f);

  const CustomSelect = ({ label, value, onChange, options, placeholder }) => (
    <div className="filter-select-wrapper">
      <label className="filter-label">{label}</label>
      <select
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  const LeadRow = ({ lead }) => {
    const isHovered = hoveredLead === lead._id;
    return (
      <div
        className={`lead-row ${isHovered ? "hovered" : ""}`}
        onMouseEnter={() => setHoveredLead(lead._id)}
        onMouseLeave={() => setHoveredLead(null)}
      >
        <div>
          <div className="lead-name-cell">{lead.name}</div>
          <div className="lead-created-date">
            Created: {new Date(lead.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div>
          <span
            className="status-badge"
            style={{ background: getStatusColor(lead.status) }}
          >
            {lead.status}
          </span>
        </div>
        <div>
          <span
            className="priority-badge"
            style={{
              background: `${getPriorityColor(lead.priority)}20`,
              color: getPriorityColor(lead.priority),
            }}
          >
            {lead.priority}
          </span>
        </div>
        <div className="agent-cell">
          <span>👤</span>
          <span className="agent-text">
            {lead.salesAgent?.name || "Unassigned"}
          </span>
        </div>
        <div className="source-cell">
          <span>🌐</span>
          <span className="source-text">{lead.source}</span>
        </div>
        <div>
          <span className="time-badge">{lead.timeToClose} days</span>
        </div>
        <div className="actions-cell">
          <button
            className="btn-view"
            onClick={() => navigate(`/leads/${lead._id}`)}
          >
            👁️ View
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="leadlist-container">
      <div className="leadlist-wrapper">
        <div className="header-card">
          <div className="header-content">
            <div className="header-text-section">
              <h1 className="header-title">Leads Management</h1>
              <p className="header-subtitle">
                Manage and track all your leads in one place.
              </p>
            </div>
            <button
              className="btn-add-lead"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Add New Lead
            </button>
          </div>
        </div>

        <div className="filters-card">
          <div className="filters-header">
            <h5 className="filters-title">🔍 Filter Leads</h5>
            {hasActiveFilters && (
              <button className="btn-clear-filters" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
          <div className="filters-grid">
            <CustomSelect
              label="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
            <CustomSelect
              label="Sales Agent"
              value={filters.salesAgent}
              onChange={(value) => handleFilterChange("salesAgent", value)}
              options={agents.map((a) => a.name)}
              placeholder="All Agents"
            />
            <CustomSelect
              label="Source"
              value={filters.source}
              onChange={(value) => handleFilterChange("source", value)}
              options={SOURCE_OPTIONS}
              placeholder="All Sources"
            />
            <CustomSelect
              label="Priority"
              value={filters.priority}
              onChange={(value) => handleFilterChange("priority", value)}
              options={PRIORITY_OPTIONS}
              placeholder="All Priorities"
            />

            <CustomSelect
              label="Tags"
              value={filters.tags}
              onChange={(value) => handleFilterChange("tags", value)}
              options={TAG_OPTIONS}
              placeholder="All Tags"
            />
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div className="table-header-content">
              <h6 className="table-count">
                📋 All Leads ({sortedLeads.length})
              </h6>
              <div className="sort-controls">
                <span className="sort-label">🔄 Sort:</span>
                <SortButton
                  label="Close Time"
                  direction={sortTimeDirection}
                  isActive={!!sortTimeDirection}
                  onClick={toggleTimeSort}
                />
                <SortButton
                  label="Priority"
                  direction={sortPriorityDirection}
                  isActive={!!sortPriorityDirection}
                  onClick={togglePrioritySort}
                />
                {(sortTimeDirection || sortPriorityDirection) && (
                  <button
                    className="btn-clear-sort"
                    onClick={() => {
                      setSortTimeDirection(null);
                      setSortPriorityDirection(null);
                    }}
                    title="Clear sorting"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {sortedLeads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h6 className="empty-state-title">No leads found</h6>
              <p className="empty-state-subtitle">
                {hasActiveFilters
                  ? "Try adjusting filters"
                  : "Add your first lead"}
              </p>
              <button
                className="empty-state-btn"
                onClick={() => setShowAddModal(true)}
              >
                ➕ Add New Lead
              </button>
            </div>
          ) : (
            <div>
              <div className="table-column-headers">
                <div className="table-column-header">LEAD NAME</div>
                <div className="table-column-header">STATUS</div>
                <div className="table-column-header">PRIORITY</div>
                <div className="table-column-header">ASSIGNED</div>
                <div className="table-column-header">SOURCE</div>
                <div className="table-column-header">TIME TO CLOSE</div>
                <div className="table-column-header text-right">ACTIONS</div>
              </div>
              {sortedLeads.map((lead) => (
                <LeadRow key={lead._id} lead={lead} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddLeadModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onLeadCreated={() => {
          console.log("Lead created!");
        }}
      />
    </div>
  );
};

export default LeadList;
