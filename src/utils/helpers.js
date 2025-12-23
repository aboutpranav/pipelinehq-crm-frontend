export const getStatusColor = (status) => {
  const colors = {
    New: "#10b981",
    Contacted: "#f59e0b",
    Qualified: "#3b82f6",
    "Proposal Sent": "#8b5cf6",
    Closed: "#6b7280",
  };
  return colors[status] || "#6b7280";
};

export const getPriorityColor = (priority) => {
  const colors = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#10b981",
  };
  return colors[priority] || "#6b7280";
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString();
};

export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const calculateLeadStats = (leads) => {
  return {
    totalLeads: leads.length,
    newLeads: leads.filter((l) => l.status === "New").length,
    contactedLeads: leads.filter((l) => l.status === "Contacted").length,
    qualifiedLeads: leads.filter((l) => l.status === "Qualified").length,
    proposalSent: leads.filter((l) => l.status === "Proposal Sent").length,
    closedLeads: leads.filter((l) => l.status === "Closed").length,
  };
};

export const getPriorityRank = (priority) => {
  const ranks = { High: 3, Medium: 2, Low: 1 };
  return ranks[priority] || 0;
};

export const sortLeads = (leads, sortBy, direction = "asc") => {
  const sorted = [...leads];
  const multiplier = direction === "asc" ? 1 : -1;

  switch (sortBy) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name) * multiplier);
      break;
    case "status":
      sorted.sort((a, b) => a.status.localeCompare(b.status) * multiplier);
      break;
    case "priority":
      sorted.sort(
        (a, b) =>
          (getPriorityRank(a.priority) - getPriorityRank(b.priority)) *
          multiplier
      );
      break;
    case "timeToClose":
      sorted.sort((a, b) => (a.timeToClose - b.timeToClose) * multiplier);
      break;
    case "createdAt":
      sorted.sort(
        (a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * multiplier
      );
      break;
    default:
      break;
  }

  return sorted;
};

export const filterLeads = (leads, filters) => {
  return leads.filter((lead) => {
    // Status filter
    if (filters.status && lead.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && lead.priority !== filters.priority) {
      return false;
    }

    // Source filter
    if (filters.source && lead.source !== filters.source) {
      return false;
    }

    // Sales Agent filter
    if (filters.salesAgent && lead.salesAgent?.name !== filters.salesAgent) {
      return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        lead.name.toLowerCase().includes(searchLower) ||
        lead.salesAgent?.name.toLowerCase().includes(searchLower) ||
        lead.source.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const calculateAgentStats = (agents, leads) => {
  const totalLeads = leads.length;
  const activeAgents = agents.length;
  const avgLeadsPerAgent =
    activeAgents > 0 ? Math.round(totalLeads / activeAgents) : 0;

  const topPerformer = agents.reduce((top, agent) => {
    const agentLeads = leads.filter(
      (l) => l.salesAgent?.name === agent.name
    ).length;
    const topLeads = top
      ? leads.filter((l) => l.salesAgent?.name === top.name).length
      : 0;
    return agentLeads > topLeads ? agent : top;
  }, agents[0]);

  return {
    activeAgents,
    totalLeads,
    avgLeadsPerAgent,
    topPerformer,
  };
};
