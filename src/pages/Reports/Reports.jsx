import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { getStatusColor } from "../../utils/helpers";
import Chart from "chart.js/auto";
import "./Reports.css";

const Reports = () => {
  const { leads } = useApp();

  const [reports, setReports] = useState({
    closedLastWeek: [],
    pipelineLeads: [],
    closedByAgent: [],
    statusDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  const closedLastWeekChartRef = useRef(null);
  const pipelineChartRef = useRef(null);
  const closedByAgentChartRef = useRef(null);
  const statusDistributionChartRef = useRef(null);

  const chartsRef = useRef({});

  useEffect(() => {
    setTimeout(() => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const closedLastWeek = leads.filter((lead) => {
        if (lead.status !== "Closed") return false;
        const leadDate = new Date(lead.createdAt);
        return leadDate >= oneWeekAgo;
      });

      const pipelineLeads = leads.filter((lead) => lead.status !== "Closed");

      const agentCounts = {};
      leads
        .filter((lead) => lead.status === "Closed")
        .forEach((lead) => {
          const agentName = lead.salesAgent?.name || "Unassigned";
          agentCounts[agentName] = (agentCounts[agentName] || 0) + 1;
        });

      const closedByAgent = Object.entries(agentCounts).map(
        ([agentName, totalClosed]) => ({ agentName, totalClosed })
      );

      const statusCounts = {};
      leads.forEach((lead) => {
        statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
      });

      const statusDistribution = Object.entries(statusCounts).map(
        ([status, count]) => ({ status, count })
      );

      setReports({
        closedLastWeek,
        pipelineLeads,
        closedByAgent,
        statusDistribution,
      });
      setLoading(false);
    }, 500);
  }, [leads]);

  useEffect(() => {
    if (!loading) {
      createCharts();
    }

    return () => {
      Object.values(chartsRef.current).forEach((chart) => {
        if (chart) chart.destroy();
      });
      chartsRef.current = {};
    };
  }, [loading, reports]);

  const createCharts = () => {
    Object.values(chartsRef.current).forEach((chart) => {
      if (chart) chart.destroy();
    });
    chartsRef.current = {};

    if (closedLastWeekChartRef.current && reports.closedLastWeek.length > 0) {
      const ctx = closedLastWeekChartRef.current.getContext("2d");
      chartsRef.current.closedLastWeek = new Chart(ctx, {
        type: "bar",
        data: {
          labels: reports.closedLastWeek.map((lead) => lead.name),
          datasets: [
            {
              label: "Closed Last Week",
              data: reports.closedLastWeek.map(() => 1),
              backgroundColor: "#10b981",
              borderColor: "#059669",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: `Leads Closed in Last 7 Days (${reports.closedLastWeek.length})`,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    }

    if (pipelineChartRef.current && reports.pipelineLeads.length > 0) {
      const pipelineByStatus = {};
      reports.pipelineLeads.forEach((lead) => {
        pipelineByStatus[lead.status] =
          (pipelineByStatus[lead.status] || 0) + 1;
      });

      const ctx = pipelineChartRef.current.getContext("2d");
      chartsRef.current.pipeline = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(pipelineByStatus),
          datasets: [
            {
              label: "Leads in Pipeline",
              data: Object.values(pipelineByStatus),
              backgroundColor: [
                "#10b981", // New
                "#f59e0b", // Contacted
                "#3b82f6", // Qualified
                "#8b5cf6", // Proposal Sent
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: `Total Leads in Pipeline: ${reports.pipelineLeads.length}`,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    }

    if (closedByAgentChartRef.current && reports.closedByAgent.length > 0) {
      const ctx = closedByAgentChartRef.current.getContext("2d");
      chartsRef.current.closedByAgent = new Chart(ctx, {
        type: "bar",
        data: {
          labels: reports.closedByAgent.map((agent) => agent.agentName),
          datasets: [
            {
              label: "Closed Leads",
              data: reports.closedByAgent.map((agent) => agent.totalClosed),
              backgroundColor: "#3b82f6",
              borderColor: "#2563eb",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y", // Horizontal bars
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Leads Closed by Sales Agent",
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    }

    if (
      statusDistributionChartRef.current &&
      reports.statusDistribution.length > 0
    ) {
      const ctx = statusDistributionChartRef.current.getContext("2d");
      chartsRef.current.statusDistribution = new Chart(ctx, {
        type: "pie",
        data: {
          labels: reports.statusDistribution.map((item) => item.status),
          datasets: [
            {
              data: reports.statusDistribution.map((item) => item.count),
              backgroundColor: reports.statusDistribution.map((item) =>
                getStatusColor(item.status)
              ),
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            title: {
              display: true,
              text: "Lead Status Distribution",
            },
          },
        },
      });
    }
  };

  const totalLeads = leads.length;
  const totalClosed = leads.filter((l) => l.status === "Closed").length;
  const totalInPipeline = leads.filter((l) => l.status !== "Closed").length;
  const conversionRate =
    totalLeads > 0 ? Math.round((totalClosed / totalLeads) * 100) : 0;
  const activeAgents = [
    ...new Set(leads.map((l) => l.salesAgent?.name).filter(Boolean)),
  ].length;

  const StatCard = ({ icon, value, label, gradient }) => (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ background: gradient }}>
        <span className="stat-icon">{icon}</span>
      </div>
      <h3 className="stat-value">{value}</h3>
      <p className="stat-label">{label}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-content">
        {/* Header */}
        <div className="reports-header-card">
          <div className="reports-header-content">
            <div>
              <h1 className="reports-title">📊 PipeLineHQ CRM Reports</h1>
              <p className="reports-subtitle">
                Detailed reports and insights to track your sales team's
                performance.
              </p>
            </div>
            <div className="reports-date-badge">
              📅 {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="reports-section">
          <h5 className="reports-section-title">Key Performance Metrics</h5>
          <div className="reports-stats-grid">
            <StatCard
              icon="📊"
              value={totalLeads}
              label="Total Leads"
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            <StatCard
              icon="✅"
              value={totalClosed}
              label="Closed Deals"
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            />
            <StatCard
              icon="📈"
              value={totalInPipeline}
              label="Leads in Pipeline"
              gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            />
            <StatCard
              icon="🎯"
              value={`${conversionRate}%`}
              label="Conversion Rate"
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            />
            <StatCard
              icon="👥"
              value={activeAgents}
              label="Active Agents"
              gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
            />
            <StatCard
              icon="📅"
              value={reports.closedLastWeek.length}
              label="Closed Last Week"
              gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            />
          </div>
        </div>

        <div className="reports-section">
          <h5 className="reports-section-title">Report Overview</h5>

          <div className="reports-charts-grid">
            <div className="reports-card">
              <div className="reports-card-header">
                <h5 className="reports-card-title">
                  📅 Leads Closed Last Week
                </h5>
                <p className="reports-card-subtitle">
                  Leads closed in the past 7 days
                </p>
              </div>
              <div className="chart-container">
                {reports.closedLastWeek.length > 0 ? (
                  <canvas ref={closedLastWeekChartRef}></canvas>
                ) : (
                  <div className="reports-empty-state">
                    <div className="reports-empty-icon">📭</div>
                    <p className="reports-empty-text">
                      No leads closed in the last week
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="reports-card">
              <div className="reports-card-header">
                <h5 className="reports-card-title">
                  🎯 Total Leads in Pipeline
                </h5>
                <p className="reports-card-subtitle">
                  Active leads by status (excluding closed)
                </p>
              </div>
              <div className="chart-container">
                {reports.pipelineLeads.length > 0 ? (
                  <canvas ref={pipelineChartRef}></canvas>
                ) : (
                  <div className="reports-empty-state">
                    <div className="reports-empty-icon">📊</div>
                    <p className="reports-empty-text">No leads in pipeline</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="reports-charts-grid">
            <div className="reports-card">
              <div className="reports-card-header">
                <h5 className="reports-card-title">
                  👥 Leads Closed by Sales Agent
                </h5>
                <p className="reports-card-subtitle">
                  Performance comparison of sales agents
                </p>
              </div>
              <div className="chart-container">
                {reports.closedByAgent.length > 0 ? (
                  <canvas ref={closedByAgentChartRef}></canvas>
                ) : (
                  <div className="reports-empty-state">
                    <div className="reports-empty-icon">📊</div>
                    <p className="reports-empty-text">
                      No closed leads data available
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="reports-card">
              <div className="reports-card-header">
                <h5 className="reports-card-title">
                  🥧 Lead Status Distribution
                </h5>
                <p className="reports-card-subtitle">
                  Distribution across all stages (New, Contacted, etc.)
                </p>
              </div>
              <div className="chart-container">
                {reports.statusDistribution.length > 0 ? (
                  <canvas ref={statusDistributionChartRef}></canvas>
                ) : (
                  <div className="reports-empty-state">
                    <div className="reports-empty-icon">📊</div>
                    <p className="reports-empty-text">
                      No status data available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="reports-recent-leads">
          <div className="reports-recent-leads-header">
            <h6 className="reports-recent-leads-title">
              ⏰ Recent Closed Leads
            </h6>
            <span className="reports-recent-leads-badge">
              {totalClosed} Total Closed
            </span>
          </div>
          {totalClosed > 0 ? (
            <div>
              {leads
                .filter((lead) => lead.status === "Closed")
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((lead) => (
                  <div key={lead._id} className="reports-recent-lead-item">
                    <div>
                      <div className="reports-recent-lead-name">
                        {lead.name}
                      </div>
                      <div className="reports-recent-lead-info">
                        <span>👤 {lead.salesAgent?.name || "Unassigned"}</span>
                        <span>•</span>
                        <span>
                          📅 {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="reports-recent-lead-status">✓ Closed</span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="reports-empty-state">
              <div className="reports-empty-icon-large">📭</div>
              <h6 className="reports-empty-heading">No closed leads yet</h6>
              <p className="reports-empty-subtext">
                Closed deals will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
