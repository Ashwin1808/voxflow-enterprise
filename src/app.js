import React, { useState } from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
import htm from 'https://esm.sh/htm@3.1.1';

import { useCampaigns } from './hooks/useCampaigns.js';
import { useWorkflow } from './hooks/useWorkflow.js';
import { useSessions } from './hooks/useSessions.js';
import { useProviders } from './hooks/useProviders.js';
import { useMetrics } from './hooks/useMetrics.js';
import { useEvents } from './hooks/useEvents.js';
import { setToken } from './api/apiClient.js';
import { CampaignService } from './services/CampaignService.js';
import { FraudService } from './services/FraudService.js';

const html = htm.bind(React.createElement);

// Icon Helper Component
function Icon({ name, className = "" }) {
  const icons = {
    dashboard: html`<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    campaigns: html`<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M6 21h12"/><path d="M12 17v4"/>`,
    workflow: html`<path d="M6 4v6h6"/><path d="M18 20v-6h-6"/><path d="M6 10a8 8 0 0 1 12 4"/><path d="M18 14a8 8 0 0 1-12-4"/>`,
    sessions: html`<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.91.33 1.8.62 2.65a2 2 0 0 1-.45 2.11L8 9.71a16 16 0 0 0 6.29 6.29l1.23-1.23a2 2 0 0 1 2.11-.45c.85.29 1.74.5 2.65.62A2 2 0 0 1 22 16.92z"/>`,
    ivr: html`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    providers: html`<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>`,
    analytics: html`<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
    operations: html`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
    settings: html`<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
    arrow: html`<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
    database: html`<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>`,
    activity: html`<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
    network: html`<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>`
  };
  return html`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=${className}>
      ${icons[name] || null}
    </svg>
  `;
}

// Reusable Metric Card Component
function MetricCard({ title, value, desc, iconName }) {
  return html`
    <div className="metric-card">
      <div className="metric-card-header">
        <span>${title}</span>
        <${Icon} name=${iconName} className="text-muted" />
      </div>
      <div className="metric-card-value">${value}</div>
      <div className="metric-card-desc">${desc}</div>
    </div>
  `;
}

// Reusable Status Badge Component
function StatusBadge({ status }) {
  const norm = (status || "").toLowerCase();
  let badgeClass = "badge-info";
  if (norm === "live" || norm === "running" || norm === "healthy" || norm === "completed" || norm === "ready" || norm === "online" || norm === "active") {
    badgeClass = "badge-success";
  } else if (norm === "scheduled" || norm === "paused" || norm === "watch" || norm === "standby") {
    badgeClass = "badge-warning";
  } else if (norm === "degraded" || norm === "failed" || norm === "blocked" || norm === "error" || norm === "offline") {
    badgeClass = "badge-danger";
  }
  return html`<span className="badge ${badgeClass}">${status}</span>`;
}

// Loading Indicator Panel
function LoadingState() {
  return html`
    <div style=${{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
      <div style=${{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div style=${{ border: "4px solid rgba(0, 0, 0, 0.1)", borderLeftColor: "var(--primary)", width: "36px", height: "36px", borderRadius: "50%", animation: "spin 1s infinite linear" }}></div>
        <p style=${{ color: "var(--text-secondary)", fontWeight: "500" }}>Querying active cluster...</p>
      </div>
    </div>
  `;
}

// Error Indicator Panel
function ErrorState({ message }) {
  return html`
    <div style=${{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", padding: "16px", borderRadius: "6px", color: "var(--danger)", margin: "16px 0" }}>
      <strong style=${{ fontSize: "14px" }}>Operational Connection Error</strong>
      <p style=${{ fontSize: "12px", marginTop: "4px" }}>${message || "The cluster ports could not be reached. Ensure the backend services are running."}</p>
    </div>
  `;
}

// Empty State Panel
function EmptyState({ title, message }) {
  return html`
    <div style=${{ textAlign: "center", padding: "40px 20px", border: "1px dashed var(--border-color)", borderRadius: "6px", background: "var(--bg-surface)" }}>
      <h3 style=${{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>${title || "No data available"}</h3>
      <p style=${{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>${message || "There are currently no active entities configured."}</p>
    </div>
  `;
}

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Hook-based API state management
  const campaigns = useCampaigns();
  const workflow = useWorkflow();
  const sessions = useSessions();
  const providers = useProviders();
  const metrics = useMetrics();
  const events = useEvents();

  return html`
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">VF</span>
          <span className="brand-text">VoxFlow Operations</span>
        </div>
        
        <nav>
          ${["Dashboard", "Campaigns", "Workflow Engine", "Live Sessions", "Providers", "Simulator", "Customer Web", "Operations"].map(tab => html`
            <button 
              key=${tab}
              className=${activeTab === tab ? "active" : ""}
              onClick=${() => { setActiveTab(tab); setSelectedCampaign(null); setSelectedSession(null); }}
            >
              <${Icon} name=${["Simulator", "Customer Web"].includes(tab) ? "activity" : tab.toLowerCase().replace(" ", "")} />
              ${tab}
            </button>
          `)}
        </nav>
        
        <div className="sidebar-panel">
          <small>Active Realm</small>
          <strong>voxflow-realm</strong>
          <span>Admin Operator Gateway</span>
        </div>
      </aside>
      
      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <p>Production cluster diagnostics</p>
            <h1>${activeTab}</h1>
          </div>
        </header>
        
        <div className="content-wrapper">
          ${renderTabContent()}
        </div>
      </main>
    </div>
  `;

  function renderTabContent() {
    switch (activeTab) {
      case "Dashboard":
        return renderDashboard();
      case "Campaigns":
        return renderCampaigns();
      case "Workflow Engine":
        return renderWorkflowEngine();
      case "Live Sessions":
        return renderLiveSessions();
      case "Providers":
        return renderProviders();
      case "Simulator":
        return renderSimulator();
      case "Customer Web":
        return renderCustomerWeb();
      case "Operations":
      default:
        return renderOperations();
    }
  }

  function renderDashboard() {
    if (campaigns.loading || sessions.loading || metrics.loading) {
      return html`<${LoadingState} />`;
    }
    if (campaigns.error || sessions.error) {
      return html`<${ErrorState} message=${campaigns.error || sessions.error} />`;
    }

    return html`
      <div>
        <div className="metrics-grid">
          <${MetricCard} title="Active Campaigns" value=${campaigns.data.length} desc="Active service lanes" iconName="campaigns" />
          <${MetricCard} title="Active Calls" value=${sessions.data.length} desc="telephony channels bridged" iconName="sessions" />
          <${MetricCard} title="Provider Health" value="100%" desc="Voice, SMS, Payment SLA" iconName="providers" />
          <${MetricCard} title="Workflow Success" value="99.9%" desc="JSON steps run cleanly" iconName="workflow" />
        </div>
        
        <div className="panel-split">
          <div className="card">
            <div className="card-header">
              <h2>Recent Active Campaigns</h2>
            </div>
            ${campaigns.data.length === 0 
              ? html`<${EmptyState} title="No campaigns loaded" message="No campaigns have been triggered on this realm." />`
              : html`
                <table className="ent-table">
                  <thead>
                    <tr>
                      <th>Campaign ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${campaigns.data.slice(0, 3).map(c => html`
                      <tr key=${c.id}>
                        <td className="font-mono">${c.id.substring(0, 8)}</td>
                        <td><strong>${c.name}</strong></td>
                        <td>${c.serviceType}</td>
                        <td><${StatusBadge} status=${c.status} /></td>
                      </tr>
                    `)}
                  </tbody>
                </table>
              `
            }
          </div>
          
          <div className="side-panel">
            <h3 style=${{ fontSize: "13px", fontWeight: "600" }}>Live RabbitMQ Event Log</h3>
            ${events.events.length === 0 
              ? html`<div style=${{ padding: "10px", color: "var(--text-secondary)" }}>Waiting for AMQP exchange pulses...</div>`
              : html`
                <div className="timeline" style=${{ marginTop: "12px" }}>
                  ${events.events.slice(0, 4).map((e, idx) => html`
                    <div className="timeline-item" key=${idx}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-time">${e.time}</div>
                      <div className="timeline-content">
                        <span className="font-mono text-primary" style=${{ fontWeight: "600" }}>${e.type}</span>
                        <p style=${{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>${e.message}</p>
                      </div>
                    </div>
                  `)}
                </div>
              `
            }
          </div>
        </div>
      </div>
    `;
  }

  function renderCampaigns() {
    if (campaigns.loading) return html`<${LoadingState} />`;
    if (campaigns.error) return html`<${ErrorState} message=${campaigns.error} />`;
    if (campaigns.data.length === 0) {
      return html`
        <div>
          <button className="btn btn-primary" onClick=${async () => {
            const name = prompt("Campaign Name:", "Q3 Fraud Alerts");
            if (!name) return;
            try {
              await CampaignService.createFraudCampaign({ name, workflowName: "fraud_verification:2.0" });
              campaigns.refetch();
            } catch(e) { alert(e.message); }
          }} style=${{ marginBottom: "16px" }}>+ New Fraud Campaign</button>
          <${EmptyState} title="No Campaigns configured" />
        </div>
      `;
    }

    if (selectedCampaign) {
      return renderCampaignDetails(selectedCampaign);
    }

    return html`
      <div>
        <button className="btn btn-primary" onClick=${async () => {
          const name = prompt("Campaign Name:", "Q3 Fraud Alerts");
          if (!name) return;
          try {
            await CampaignService.createFraudCampaign({ name, workflowName: "fraud_verification:2.0" });
            campaigns.refetch();
          } catch(e) { alert(e.message); }
        }} style=${{ marginBottom: "16px" }}>+ New Fraud Campaign</button>

        <div className="card">
          <div className="card-header">
            <h2>Active Outbound Campaigns</h2>
          </div>
        <table className="ent-table">
          <thead>
            <tr>
              <th>Campaign ID</th>
              <th>Name</th>
              <th>Workflow</th>
              <th>Target Contacts</th>
              <th>Status</th>
              <th>Service</th>
            </tr>
          </thead>
          <tbody>
            ${campaigns.data.map(c => html`
              <tr key=${c.id} className="clickable" onClick=${() => setSelectedCampaign(c)}>
                <td className="font-mono">${c.id.substring(0, 8)}</td>
                <td><strong>${c.name}</strong></td>
                <td className="font-mono">${c.workflowName}</td>
                <td className="font-mono">${c.totalContacts}</td>
                <td><${StatusBadge} status=${c.status} /></td>
                <td><span className="badge badge-info">${c.serviceType}</span></td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderCampaignDetails(campaign) {
    return html`
      <div>
        <button className="btn" onClick=${() => setSelectedCampaign(null)} style=${{ marginBottom: "16px" }}>
          ← Back to Campaigns
        </button>
        
        <div className="panel-split">
          <div className="card" style=${{ padding: "20px" }}>
            <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h2 style=${{ fontSize: "18px", fontWeight: "700" }}>${campaign.name}</h2>
                <p className="font-mono" style=${{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>ID: ${campaign.id}</p>
              </div>
              <${StatusBadge} status=${campaign.status} />
            </div>
            
            <div style=${{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "16px" }}>
              <div>
                <span style=${{ fontSize: "11px", color: "var(--text-muted)" }}>Workflow Used</span>
                <strong className="font-mono" style=${{ display: "block", marginTop: "4px" }}>${campaign.workflowName}</strong>
              </div>
              <div>
                <span style=${{ fontSize: "11px", color: "var(--text-muted)" }}>Target Contacts</span>
                <strong className="font-mono" style=${{ display: "block", marginTop: "4px" }}>${campaign.totalContacts}</strong>
              </div>
              <div>
                <span style=${{ fontSize: "11px", color: "var(--text-muted)" }}>Service Gateway</span>
                <strong style=${{ display: "block", marginTop: "4px" }}>${campaign.serviceType} Service</strong>
              </div>
            </div>
          </div>
          
          <div className="side-panel">
            <h3 style=${{ fontSize: "12px", fontWeight: "600" }}>Campaign Controls</h3>
            <button className="btn btn-primary" onClick=${async () => {
              try {
                await CampaignService.startCampaign(campaign.serviceType, campaign.id);
                campaigns.refetch();
              } catch(e) { alert(e.message); }
            }} style=${{ width: "100%", justifyContent: "center", marginBottom: "10px" }}>Start Campaign</button>
            <button className="btn" onClick=${async () => {
              try {
                await CampaignService.pauseCampaign(campaign.serviceType, campaign.id);
                campaigns.refetch();
              } catch(e) { alert(e.message); }
            }} style=${{ width: "100%", justifyContent: "center", marginBottom: "20px" }}>Pause</button>

            <h3 style=${{ fontSize: "12px", fontWeight: "600", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>Session Management</h3>
            <button className="btn" onClick=${async () => {
              const phone = prompt("Customer Phone Number:", "+1555010203");
              if (!phone) return;
              try {
                await CampaignService.addContact(campaign.serviceType, campaign.id, {
                  customerPhone: phone,
                  cardLastFour: "4242",
                  merchant: "Apple Store",
                  amount: 1500.00
                });
                campaigns.refetch();
                alert("Contact added! A session was created.");
              } catch(e) { alert(e.message); }
            }} style=${{ width: "100%", justifyContent: "center" }}>+ Add Contact</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderWorkflowEngine() {
    if (workflow.loading) return html`<${LoadingState} />`;
    if (workflow.error) return html`<${ErrorState} message=${workflow.error} />`;
    if (workflow.definitions.length === 0) {
      return html`<${EmptyState} title="No Workflow definitions found" message="Seeded campaign workflows will automatically display here." />`;
    }

    const steps = [
      { id: "s1", type: "START", desc: "Start execution session" },
      { id: "s2", type: "PLAY_PROMPT", desc: "Play voice prompts to customer" },
      { id: "s3", type: "COLLECT_INPUT", desc: "Wait for DTMF keypress digits" },
      { id: "s4", type: "END", desc: "Complete execution state" }
    ];
    
    const node = selectedNode || steps[1];

    return html`
      <div className="panel-split">
        <div className="card node-grid-bg" style=${{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", height: "400px" }}>
          <div style=${{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            ${steps.map((step, idx) => html`
              <React.Fragment key=${step.id}>
                <div 
                  className=${`workflow-node ${node.id === step.id ? "selected" : ""}`}
                  onClick=${() => setSelectedNode(step)}
                >
                  <span className="font-mono" style=${{ fontSize: "9px", color: "var(--primary)" }}>${step.id}</span>
                  <div style=${{ fontWeight: "600" }}>${step.type}</div>
                </div>
                ${idx < steps.length - 1 && html`
                  <div style=${{ textAlign: "center", color: "var(--text-muted)" }}>↓</div>
                `}
              </React.Fragment>
            `)}
          </div>
        </div>
        
        <div className="side-panel">
          <h3 style=${{ fontSize: "12px", fontWeight: "600" }}>Node Details</h3>
          <div>
            <span style=${{ color: "var(--text-muted)", display: "block" }}>Node Type</span>
            <strong style=${{ fontSize: "14px" }}>${node.type}</strong>
          </div>
          <div>
            <span style=${{ color: "var(--text-muted)", display: "block" }}>Description</span>
            <p style=${{ color: "var(--text-secondary)" }}>${node.desc}</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderLiveSessions() {
    if (sessions.loading) return html`<${LoadingState} />`;
    if (sessions.error) return html`<${ErrorState} message=${sessions.error} />`;
    if (sessions.data.length === 0) return html`<${EmptyState} title="No Active sessions" message="Telemetry channels are currently empty." />`;

    return html`
      <div className="panel-split">
        <div className="card">
          <div className="card-header">
            <h2>Active SIP Telephony Sessions</h2>
          </div>
          <table className="ent-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Card Status</th>
              </tr>
            </thead>
            <tbody>
              ${sessions.data.map(s => html`
                <tr key=${s.id} className="clickable" onClick=${() => setSelectedSession(s)}>
                  <td className="font-mono">${s.id.substring(0, 8)}</td>
                  <td className="font-mono">${s.customerPhone}</td>
                  <td><${StatusBadge} status=${s.status} /></td>
                  <td><span className="badge badge-info">${s.cardStatus}</span></td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
        
        <div className="side-panel">
          <h3 style=${{ fontSize: "12px", fontWeight: "600" }}>Session Metadata</h3>
          ${selectedSession ? html`
            <div style=${{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <span style=${{ color: "var(--text-muted)", display: "block" }}>Merchant</span>
                <strong>${selectedSession.merchant}</strong>
              </div>
              <div>
                <span style=${{ color: "var(--text-muted)", display: "block" }}>Amount</span>
                <strong>Rs ${selectedSession.amount}</strong>
              </div>
              <div>
                <span style=${{ color: "var(--text-muted)", display: "block" }}>Customer Phone</span>
                <strong className="font-mono">${selectedSession.customerPhone}</strong>
              </div>
            </div>
          ` : html`
            <p style=${{ color: "var(--text-muted)" }}>Select a live session row from the table to view metrics.</p>
          `}
        </div>
      </div>
    `;
  }

  function renderProviders() {
    if (providers.loading) return html`<${LoadingState} />`;
    if (providers.error) return html`<${ErrorState} message=${providers.error} />`;
    if (providers.data.length === 0) return html`<${EmptyState} title="No active adapters configured" />`;

    return html`
      <div className="metrics-grid">
        ${providers.data.map(p => html`
          <div className="metric-card" key=${p.name}>
            <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <strong style=${{ fontSize: "13px", fontWeight: "700" }}>${p.name}</strong>
              </div>
              <${StatusBadge} status=${p.status} />
            </div>
          </div>
        `)}
      </div>
    `;
  }

  function renderSimulator() {
    return html`
      <div className="panel-split">
        <div className="card">
          <div className="card-header">
            <h2>Telephony Simulator</h2>
          </div>
          <div style=${{ padding: "20px" }}>
            <p style=${{ marginBottom: "20px", color: "var(--text-secondary)" }}>Simulate a customer receiving a call from VoxFlow.</p>
            ${sessions.data.filter(s => s.status !== 'COMPLETED').map(s => html`
              <div key=${s.id} style=${{ border: "1px solid var(--border-color)", padding: "16px", borderRadius: "6px", marginBottom: "16px" }}>
                <div style=${{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <strong>Incoming Call: ${s.customerPhone}</strong>
                  <${StatusBadge} status=${s.status} />
                </div>
                <div style=${{ display: "flex", gap: "10px" }}>
                  <button className="btn btn-primary" onClick=${() => alert("Call answered! Ready for DTMF.")}>Answer</button>
                  <button className="btn" onClick=${() => alert("Call Rejected")}>Reject</button>
                  <button className="btn" onClick=${async () => {
                    await FraudService.submitDecision(s.id, { decision: "APPROVE", reason: "DTMF 1 Pressed" });
                    sessions.refetch();
                  }}>Press DTMF 1 (Approve)</button>
                  <button className="btn" onClick=${() => {
                    window.open(`#customer-web?session=${s.id}`, "_blank");
                  }}>Generate Visual IVR Link</button>
                </div>
              </div>
            `)}
            ${sessions.data.filter(s => s.status !== 'COMPLETED').length === 0 && html`
              <${EmptyState} title="No incoming calls" message="Start a campaign to simulate calls." />
            `}
          </div>
        </div>
      </div>
    `;
  }

  function renderCustomerWeb() {
    const hash = window.location.hash || "";
    const sessionId = hash.includes("session=") ? hash.split("session=")[1] : null;

    return html`
      <div className="card" style=${{ padding: "40px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style=${{ fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}>Fraud Verification Required</h2>
        <p style=${{ color: "var(--text-secondary)", marginBottom: "30px" }}>Did you recently attempt a transaction for Rs 5,000 at MERCHANT X?</p>
        
        <div style=${{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <button className="btn btn-primary" style=${{ padding: "12px 30px", fontSize: "16px" }} onClick=${async () => {
            if (sessionId) {
              await FraudService.submitDecision(sessionId, { decision: "APPROVE", reason: "Visual IVR Web" });
              alert("Transaction Approved! Workflow completed.");
            } else { alert("No session ID found in URL"); }
          }}>Yes, I approve</button>
          <button className="btn" style=${{ padding: "12px 30px", fontSize: "16px", background: "var(--danger)", color: "white" }} onClick=${async () => {
            if (sessionId) {
              await FraudService.submitDecision(sessionId, { decision: "DECLINE", reason: "Visual IVR Web" });
              alert("Transaction Declined! Agent alerted.");
            } else { alert("No session ID found in URL"); }
          }}>No, this was not me</button>
        </div>
      </div>
    `;
  }

  function renderOperations() {
    return html`
      <div className="panel-split">
        <div className="card">
          <div className="card-header">
            <h2>Microservice Diagnostic Metadata</h2>
          </div>
          <div style=${{ padding: "20px" }}>
            <div style=${{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              <div>
                <span style=${{ fontSize: "11px", color: "var(--text-muted)" }}>Auth Service Port</span>
                <strong className="font-mono" style=${{ display: "block" }}>8081</strong>
              </div>
              <div>
                <span style=${{ fontSize: "11px", color: "var(--text-muted)" }}>Fraud Service Port</span>
                <strong className="font-mono" style=${{ display: "block" }}>8082</strong>
              </div>
              <div>
                <span style=${{ fontSize: "11px", color: "var(--text-muted)" }}>Insurance Service Port</span>
                <strong className="font-mono" style=${{ display: "block" }}>8083</strong>
              </div>
              <div>
                <span style=${{ fontSize: "11px", color: "var(--text-muted)" }}>Inbound Service Port</span>
                <strong className="font-mono" style=${{ display: "block" }}>8084</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div className="side-panel">
          <h3 style=${{ fontSize: "12px", fontWeight: "600" }}>Cluster Status</h3>
          <div style=${{ background: "var(--success-bg)", padding: "10px", borderRadius: "6px", border: "1px solid var(--success-border)", display: "flex", gap: "8px", alignItems: "center" }}>
            <div style=${{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }}></div>
            <strong style=${{ color: "var(--success)" }}>Flyway Database Schema Ready</strong>
          </div>
        </div>
      </div>
    `;
  }
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('client_id', 'voxflow-ui');
      params.append('username', username);
      params.append('password', password);
      params.append('grant_type', 'password');

      const response = await fetch("http://localhost:8089/realms/voxflow-realm/protocol/openid-connect/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      });
      if (!response.ok) throw new Error("Invalid credentials");
      const data = await response.json();
      onLogin(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return html`
    <div style=${{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-base)' }}>
      <form onSubmit=${handleSubmit} className="card" style=${{ padding: '40px', width: '320px' }}>
        <h2 style=${{ marginBottom: '20px', textAlign: 'center' }}>VoxFlow Login</h2>
        ${error && html`<div style=${{ color: 'var(--danger)', marginBottom: '10px' }}>${error}</div>`}
        <div style=${{ marginBottom: '16px' }}>
          <label style=${{ display: 'block', marginBottom: '8px' }}>Username</label>
          <input type="text" value=${username} onChange=${e => setUsername(e.target.value)} className="form-control" style=${{ width: '100%', boxSizing: 'border-box', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div style=${{ marginBottom: '24px' }}>
          <label style=${{ display: 'block', marginBottom: '8px' }}>Password</label>
          <input type="password" value=${password} onChange=${e => setPassword(e.target.value)} className="form-control" style=${{ width: '100%', boxSizing: 'border-box', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <button type="submit" disabled=${loading} className="btn btn-primary" style=${{ width: '100%', justifyContent: 'center' }}>
          ${loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  `;
}

function Main() {
  const [token, setTokenState] = useState(null);

  React.useEffect(() => {
    const handleUnauthorized = () => setTokenState(null);
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  if (!token) {
    return html`<${Login} onLogin=${t => {
      setToken(t);
      setTokenState(t);
    }} />`;
  }
  return html`<${App} />`;
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(React.createElement(Main));
