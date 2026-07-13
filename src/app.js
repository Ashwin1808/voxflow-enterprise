const campaigns = [
  {
    id: "CMP-1048",
    name: "HDFC Fraud Verification",
    type: "Fraud Verification",
    status: "Live",
    workflow: "fraud_verification_v2",
    contacts: 128420,
    completed: 91204,
    retryRate: 7.8,
    collection: 0,
    provider: "Exotel",
    owner: "Risk Ops",
    nextRun: "14:45 IST"
  },
  {
    id: "CMP-1049",
    name: "SBI Life Renewal Nudge",
    type: "Insurance Renewal",
    status: "Scheduled",
    workflow: "renewal_visual_ivr",
    contacts: 42180,
    completed: 0,
    retryRate: 0,
    collection: 0,
    provider: "Twilio",
    owner: "Retention",
    nextRun: "18:30 IST"
  },
  {
    id: "CMP-1050",
    name: "Bajaj EMI Collection",
    type: "Payment Collection",
    status: "Degraded",
    workflow: "emi_collection_retry",
    contacts: 86400,
    completed: 63320,
    retryRate: 14.2,
    collection: 18420000,
    provider: "Simulator",
    owner: "Collections",
    nextRun: "Running"
  }
];

const workflowSteps = [
  { id: "s1", type: "PLAY_PROMPT", label: "Play transaction prompt", metric: "Avg 1.4s TTS" },
  { id: "s2", type: "COLLECT_INPUT", label: "Collect DTMF approval", metric: "10s timeout" },
  { id: "s3", type: "UPDATE_STATUS", label: "Approve transaction", metric: "45.1k today" },
  { id: "s4", type: "UPDATE_STATUS", label: "Block transaction", metric: "2.7k today" },
  { id: "s5", type: "SEND_VISUAL_IVR", label: "Send secure Visual IVR link", metric: "16.8k fallbacks" },
  { id: "s6", type: "SEND_NOTIFICATION", label: "Send resolution SMS", metric: "99.3% delivered" },
  { id: "end", type: "END", label: "Complete session", metric: "71% completion" }
];

const providers = [
  { name: "Exotel IVR", kind: "Voice", health: 99.91, latency: "238ms", mode: "Primary", status: "Healthy" },
  { name: "Twilio SMS", kind: "SMS/WhatsApp", health: 99.75, latency: "186ms", mode: "Primary", status: "Healthy" },
  { name: "Razorpay UPI", kind: "Payment", health: 97.82, latency: "612ms", mode: "Primary", status: "Watch" },
  { name: "Simulator", kind: "Fallback", health: 100, latency: "24ms", mode: "Hot standby", status: "Ready" }
];

const events = [
  ["14:41:22", "campaign.created", "CMP-1049 queued 42,180 contacts"],
  ["14:40:58", "payment.failed", "Retry scheduled for TXN-88421 after provider timeout"],
  ["14:40:31", "visual_ivr.requested", "Secure link generated for contact CON-72110"],
  ["14:39:49", "call.answered", "DTMF 2 received, transaction blocked"],
  ["14:38:17", "notification.sent", "Fraud resolution SMS delivered by Twilio"]
];

let selectedCampaign = campaigns[0].id;
let simulationStep = 0;

const $ = (selector) => document.querySelector(selector);
const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(value);
const formatMoney = (value) =>
  value ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value) : "NA";

function icon(name) {
  const icons = {
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    workflow: '<path d="M6 4v6h6"/><path d="M18 20v-6h-6"/><path d="M6 10a8 8 0 0 1 12 4"/><path d="M18 14a8 8 0 0 1-12-4"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.91.33 1.8.62 2.65a2 2 0 0 1-.45 2.11L8 9.71a16 16 0 0 0 6.29 6.29l1.23-1.23a2 2 0 0 1 2.11-.45c.85.29 1.74.5 2.65.62A2 2 0 0 1 22 16.92z"/>',
    wallet: '<path d="M20 7H5a3 3 0 0 0 0 6h15v6H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h15z"/><path d="M16 13h6v4h-6z"/>',
    radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2a6 6 0 0 1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.5"/><path d="M19.1 4.9c3.9 3.9 3.9 10.3 0 14.2"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
}

function statCards(active) {
  const totalContacts = campaigns.reduce((sum, item) => sum + item.contacts, 0);
  const completed = campaigns.reduce((sum, item) => sum + item.completed, 0);
  const payments = campaigns.reduce((sum, item) => sum + item.collection, 0);
  const successRate = Math.round((completed / totalContacts) * 1000) / 10;

  return [
    ["Active campaigns", campaigns.filter((item) => item.status !== "Scheduled").length, "2 live service lanes", "activity"],
    ["Contacts loaded", formatNumber(totalContacts), `${formatNumber(active.contacts)} in selected campaign`, "phone"],
    ["Completion rate", `${successRate}%`, "Across voice and Visual IVR", "workflow"],
    ["Payment collected", formatMoney(payments), "Simulator safe, no real money", "wallet"]
  ]
    .map(
      ([label, value, note, iconName]) => `
        <article class="metric-card">
          <div class="metric-icon">${icon(iconName)}</div>
          <p>${label}</p>
          <strong>${value}</strong>
          <span>${note}</span>
        </article>
      `
    )
    .join("");
}

function campaignRows() {
  return campaigns
    .map((campaign) => {
      const progress = campaign.contacts ? Math.round((campaign.completed / campaign.contacts) * 100) : 0;
      return `
        <button class="campaign-row ${campaign.id === selectedCampaign ? "selected" : ""}" data-campaign="${campaign.id}">
          <span>
            <strong>${campaign.name}</strong>
            <small>${campaign.id} · ${campaign.type} · ${campaign.owner}</small>
          </span>
          <span class="status ${campaign.status.toLowerCase()}">${campaign.status}</span>
          <span class="progress-shell"><i style="width:${progress}%"></i></span>
          <span class="row-number">${progress}%</span>
        </button>
      `;
    })
    .join("");
}

function workflowTimeline() {
  return workflowSteps
    .map(
      (step, index) => `
        <button class="workflow-step ${index === simulationStep ? "active" : ""}" data-step="${index}">
          <span class="step-index">${step.id}</span>
          <span>
            <strong>${step.type}</strong>
            <small>${step.label}</small>
          </span>
          <em>${step.metric}</em>
        </button>
      `
    )
    .join("");
}

function providerCards() {
  return providers
    .map(
      (provider) => `
        <article class="provider-card">
          <div>
            <strong>${provider.name}</strong>
            <small>${provider.kind} · ${provider.mode}</small>
          </div>
          <span class="status ${provider.status.toLowerCase()}">${provider.status}</span>
          <dl>
            <div><dt>SLO</dt><dd>${provider.health}%</dd></div>
            <div><dt>Latency</dt><dd>${provider.latency}</dd></div>
          </dl>
        </article>
      `
    )
    .join("");
}

function eventRows() {
  return events
    .map(
      ([time, name, text]) => `
        <li>
          <time>${time}</time>
          <strong>${name}</strong>
          <span>${text}</span>
        </li>
      `
    )
    .join("");
}

function render() {
  const active = campaigns.find((campaign) => campaign.id === selectedCampaign) || campaigns[0];
  const step = workflowSteps[simulationStep];

  $("#app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">VF</span>
          <div>
            <strong>VoxFlow</strong>
            <small>Omnichannel Ops</small>
          </div>
        </div>
        <nav>
          <a class="active">${icon("activity")}Command</a>
          <a>${icon("workflow")}Workflows</a>
          <a>${icon("shield")}Security</a>
          <a>${icon("radio")}Providers</a>
        </nav>
        <section class="sidebar-panel">
          <small>Realm</small>
          <strong>voxflow-realm</strong>
          <span>ADMIN · AGENT · CUSTOMER · DEVELOPER</span>
        </section>
      </aside>

      <main class="main">
        <header class="topbar">
          <div>
            <p>Production control plane</p>
            <h1>Enterprise communication journeys, live in one console.</h1>
          </div>
          <button class="primary-action" id="advanceSimulation">
            ${icon("arrow")} Advance workflow
          </button>
        </header>

        <section class="metrics-grid">${statCards(active)}</section>

        <section class="workspace-grid">
          <article class="panel campaign-panel">
            <div class="panel-header">
              <div>
                <p>Campaign Manager</p>
                <h2>Outbound campaigns</h2>
              </div>
              <span>${active.nextRun}</span>
            </div>
            <div class="campaign-list">${campaignRows()}</div>
          </article>

          <article class="panel detail-panel">
            <div class="panel-header">
              <div>
                <p>Selected campaign</p>
                <h2>${active.name}</h2>
              </div>
              <span class="status ${active.status.toLowerCase()}">${active.status}</span>
            </div>
            <div class="detail-grid">
              <div><small>Workflow</small><strong>${active.workflow}</strong></div>
              <div><small>Provider</small><strong>${active.provider}</strong></div>
              <div><small>Contacts</small><strong>${formatNumber(active.contacts)}</strong></div>
              <div><small>Retry rate</small><strong>${active.retryRate}%</strong></div>
            </div>
            <div class="visual-phone">
              <div class="phone-top"></div>
              <h3>Visual IVR</h3>
              <p>Secure payment and fraud confirmation link generated from workflow fallback.</p>
              <button>Pay or respond</button>
            </div>
          </article>
        </section>

        <section class="ops-grid">
          <article class="panel workflow-panel">
            <div class="panel-header">
              <div>
                <p>Workflow Engine</p>
                <h2>Generic JSON interpreter</h2>
              </div>
              <span>${step.id} · ${step.type}</span>
            </div>
            <div class="workflow-list">${workflowTimeline()}</div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <p>Provider Layer</p>
                <h2>Adapter health</h2>
              </div>
              <span>Env switch ready</span>
            </div>
            <div class="provider-grid">${providerCards()}</div>
          </article>

          <article class="panel event-panel">
            <div class="panel-header">
              <div>
                <p>RabbitMQ Topic Exchange</p>
                <h2>Event stream</h2>
              </div>
              <span>voxflow.topic</span>
            </div>
            <ul class="event-list">${eventRows()}</ul>
          </article>
        </section>
      </main>
    </div>
  `;

  document.querySelectorAll("[data-campaign]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCampaign = button.dataset.campaign;
      render();
    });
  });

  document.querySelectorAll("[data-step]").forEach((button) => {
    button.addEventListener("click", () => {
      simulationStep = Number(button.dataset.step);
      render();
    });
  });

  $("#advanceSimulation").addEventListener("click", () => {
    simulationStep = (simulationStep + 1) % workflowSteps.length;
    render();
  });
}

render();
