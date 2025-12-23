import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { API_BASE_URL } from "../utils/constants";
import { generateId } from "../utils/helpers";
import { toast } from "react-toastify";

// Create Context
const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const agentsResponse = await fetch(`${API_BASE_URL}/agents`);
        if (!agentsResponse.ok) throw new Error("Failed to fetch agents");
        const agentsData = await agentsResponse.json();

        const leadsResponse = await fetch(`${API_BASE_URL}/leads`);
        if (!leadsResponse.ok) throw new Error("Failed to fetch leads");
        const leadsData = await leadsResponse.json();

        const transformedAgents = agentsData.map((agent) => ({
          id: agent.id,
          _id: agent.id,
          name: agent.name,
          email: agent.email,
          createdAt: agent.createdAt || new Date().toISOString(),
          status: "Active",
          totalLeads: 0,
        }));

        const transformedLeads = leadsData.map((lead) => ({
          _id: lead.id,
          name: lead.name,
          status: lead.status,
          priority: lead.priority,
          salesAgent: { name: lead.salesAgent.name },
          source: lead.source,
          timeToClose: lead.timeToClose,
          createdAt: lead.createdAt,
          tags: lead.tags || [],
        }));

        setAgents(transformedAgents);
        setLeads(transformedLeads);
        setError(null);

        toast.success(
          `✅ Loaded ${transformedLeads.length} leads and ${transformedAgents.length} agents`
        );
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err.message);

        toast.error(`❌ Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // LEAD OPERATIONS

  // Add a new lead
  const addLead = useCallback(
    async (leadData) => {
      try {
        const agent = agents.find((a) => a.name === leadData.salesAgent.name);
        if (!agent) {
          throw new Error("Sales agent not found");
        }

        const requestBody = {
          name: leadData.name,
          source: leadData.source,
          salesAgent: agent._id,
          status: leadData.status,
          tags: leadData.tags || [],
          timeToClose: leadData.timeToClose,
          priority: leadData.priority,
        };

        const response = await fetch(`${API_BASE_URL}/leads`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error("Failed to create lead");

        const savedLead = await response.json();

        const newLead = {
          _id: savedLead.id,
          name: savedLead.name,
          status: savedLead.status,
          priority: savedLead.priority,
          salesAgent: { name: savedLead.salesAgent.name },
          source: savedLead.source,
          timeToClose: savedLead.timeToClose,
          createdAt: savedLead.createdAt,
          tags: savedLead.tags || [],
        };

        setLeads((prev) => [newLead, ...prev]);

        toast.success(`🎉 Lead "${newLead.name}" created successfully!`);

        return newLead;
      } catch (error) {
        console.error("Error adding lead:", error);

        toast.error(`❌ Failed to create lead: ${error.message}`);
        throw error;
      }
    },
    [agents]
  );

  // Update an existing lead
  const updateLead = useCallback(
    async (leadId, updatedData) => {
      try {
        let requestBody = { ...updatedData };
        if (updatedData.salesAgent?.name) {
          const agent = agents.find(
            (a) => a.name === updatedData.salesAgent.name
          );
          if (agent) {
            requestBody.salesAgent = agent._id;
          }
        }

        const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error("Failed to update lead");

        const updatedLead = await response.json();

        setLeads((prev) =>
          prev.map((lead) =>
            lead._id === leadId
              ? {
                  ...lead,
                  ...updatedData,
                  salesAgent: updatedData.salesAgent || lead.salesAgent,
                }
              : lead
          )
        );

        toast.success(`✅ Lead updated successfully!`);
      } catch (error) {
        console.error("Error updating lead:", error);

        toast.error(`❌ Failed to update lead: ${error.message}`);
        throw error;
      }
    },
    [agents]
  );

  // Delete a lead
  const deleteLead = useCallback(
    async (leadId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete lead");

        const leadName = leads.find((l) => l._id === leadId)?.name || "Lead";

        setLeads((prev) => prev.filter((lead) => lead._id !== leadId));

        toast.success(`🗑️ "${leadName}" deleted successfully!`);
      } catch (error) {
        console.error("Error deleting lead:", error);

        toast.error(`❌ Failed to delete lead: ${error.message}`);
        throw error;
      }
    },
    [leads]
  );

  // Get a single lead by ID
  const getLeadById = useCallback(
    (leadId) => {
      return leads.find((lead) => lead._id === leadId);
    },
    [leads]
  );

  // Get leads by status
  const getLeadsByStatus = useCallback(
    (status) => {
      return leads.filter((lead) => lead.status === status);
    },
    [leads]
  );

  // Get leads by agent
  const getLeadsByAgent = useCallback(
    (agentName) => {
      return leads.filter((lead) => lead.salesAgent?.name === agentName);
    },
    [leads]
  );

  // AGENT OPERATIONS

  // Add a new agent
  const addAgent = useCallback(async (agentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create agent");
      }

      const savedAgent = await response.json();

      const newAgent = {
        id: savedAgent.id,
        _id: savedAgent.id,
        name: savedAgent.name,
        email: savedAgent.email,
        createdAt: savedAgent.createdAt,
        status: "Active",
        totalLeads: 0,
      };

      setAgents((prev) => [...prev, newAgent]);

      toast.success(`🎉 Agent "${newAgent.name}" added successfully!`);

      return newAgent;
    } catch (error) {
      console.error("Error adding agent:", error);

      toast.error(`❌ ${error.message}`);
      throw error;
    }
  }, []);

  // Update an agent
  const updateAgent = useCallback(async (agentId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update agent");

      setAgents((prev) =>
        prev.map((agent) =>
          agent._id === agentId || agent.id === agentId
            ? { ...agent, ...updatedData }
            : agent
        )
      );

      toast.success(`✅ Agent updated successfully!`);
    } catch (error) {
      console.error("Error updating agent:", error);

      toast.error(`❌ Failed to update agent: ${error.message}`);
      throw error;
    }
  }, []);

  // Delete an agent
  const deleteAgent = useCallback(
    async (agentId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete agent");

        const agentName =
          agents.find((a) => a._id === agentId || a.id === agentId)?.name ||
          "Agent";

        setAgents((prev) =>
          prev.filter((agent) => agent._id !== agentId && agent.id !== agentId)
        );

        toast.success(`🗑️ "${agentName}" deleted successfully!`);
      } catch (error) {
        console.error("Error deleting agent:", error);

        toast.error(`❌ Failed to delete agent: ${error.message}`);
        throw error;
      }
    },
    [agents]
  );

  // Get agent by ID
  const getAgentById = useCallback(
    (agentId) => {
      return agents.find(
        (agent) => agent._id === agentId || agent.id === agentId
      );
    },
    [agents]
  );

  // Get agent by name
  const getAgentByName = useCallback(
    (agentName) => {
      return agents.find((agent) => agent.name === agentName);
    },
    [agents]
  );

  // BULK OPERATIONS

  // Delete multiple leads
  const deleteMutlipleLeads = useCallback(async (leadIds) => {
    try {
      await Promise.all(
        leadIds.map((id) =>
          fetch(`${API_BASE_URL}/leads/${id}`, { method: "DELETE" })
        )
      );

      setLeads((prev) => prev.filter((lead) => !leadIds.includes(lead._id)));

      toast.success(`🗑️ ${leadIds.length} leads deleted successfully!`);
    } catch (error) {
      console.error("Error deleting multiple leads:", error);

      toast.error(`❌ Failed to delete leads: ${error.message}`);
      throw error;
    }
  }, []);

  // Delete multiple agents
  const deleteMultipleAgents = useCallback(async (agentIds) => {
    try {
      await Promise.all(
        agentIds.map((id) =>
          fetch(`${API_BASE_URL}/agents/${id}`, { method: "DELETE" })
        )
      );

      setAgents((prev) =>
        prev.filter(
          (agent) =>
            !agentIds.includes(agent._id) && !agentIds.includes(agent.id)
        )
      );

      toast.success(`🗑️ ${agentIds.length} agents deleted successfully!`);
    } catch (error) {
      console.error("Error deleting multiple agents:", error);

      toast.error(`❌ Failed to delete agents: ${error.message}`);
      throw error;
    }
  }, []);

  // Context value
  const value = {
    leads,
    agents,
    loading,
    error,

    addLead,
    updateLead,
    deleteLead,
    getLeadById,
    getLeadsByStatus,
    getLeadsByAgent,
    deleteMutlipleLeads,

    addAgent,
    updateAgent,
    deleteAgent,
    getAgentById,
    getAgentByName,
    deleteMultipleAgents,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
