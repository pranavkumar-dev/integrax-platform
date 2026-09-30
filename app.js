const INITIAL_DATA = {
  workflows: [
    { id: "TXN-8092", citizenId: "IN-8921-X", scheme: "Unified Social Welfare Pension", agencies: ["Revenue Dept", "PDS Portal", "Labour Registry"], status: "Resolved", sla: "100% On-Time" },
    { id: "TXN-8093", citizenId: "IN-4412-K", scheme: "Cross-Entity Land Transfer NOC", agencies: ["Registration Dept", "Municipal Corp", "Survey Org"], status: "In-Progress", sla: "1.2 Days Left" },
    { id: "TXN-8094", citizenId: "IN-1209-A", scheme: "Post-Metric Student Scholarship", agencies: ["Higher Ed Portal", "Caste Registry", "Direct Benefit Transfer"], status: "Resolved", sla: "100% On-Time" }
  ],
  connectors: [
    { name: "State Land Registry", type: "Legacy SOAP / WSDL", protocol: "XML to JSON-LD Transpiler", health: "99.9%", latency: "42ms" },
    { name: "Public Distribution System (PDS)", type: "Direct SQL Adapter", protocol: "CDC Replication Bridge", health: "99.4%", latency: "18ms" },
    { name: "Labour Beneficiary Database", type: "Modern REST / OpenAPI", protocol: "JWT Bearer Federated SSO", health: "100%", latency: "12ms" },
    { name: "Citizen Digi-Identity Master", type: "gRPC Microservice", protocol: "Consent Artifact Tokenizer", health: "100%", latency: "8ms" }
  ],
  citizenData: {
    "IN-8921-X": {
      name: "Ramesh Sharma",
      dob: "1982-08-14",
      verifiedRegistries: ["Revenue Registry", "UID Card Authority", "PDS Food Portal"],
      entitlements: [
        { name: "Farmer Fertiliser Grant", status: "Active / Disbursed", provider: "Agriculture Dept" },
        { name: "Subsidized Food Grain Card", status: "Active (Synced)", provider: "Food & Civil Supplies" },
        { name: "Rural Housing Assistance", status: "Under Inter-Agency Review", provider: "Rural Development" }
      ]
    }
  },
  auditLogs: [
    { timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), action: "CROSS_QUERY_VERIFICATION", actor: "Officer #8291 (Revenue)", schema: "LabourRegistry_v2", consent: "Valid (Artifact #991)", hash: "8f7a9d20c31e9a..." },
    { timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(), action: "SCHEMA_NORMALIZATION", actor: "System Adapter: PDS", schema: "XML_SOAP_Standard", consent: "N/A (Internal Sync)", hash: "b21c4598a72f01..." }
  ]
};

function getData(key) {
  const data = localStorage.getItem(`integrax_${key}`);
  return data ? JSON.parse(data) : INITIAL_DATA[key];
}

function setData(key, val) {
  localStorage.setItem(`integrax_${key}`, JSON.stringify(val));
}

document.querySelectorAll(".nav-links li").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".nav-links li").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
    
    tab.classList.add("active");
    const target = tab.getAttribute("data-view");
    document.getElementById(`view-${target}`).classList.add("active");
  });
});

function renderWorkflows() {
  const workflows = getData("workflows");
  const tbody = document.getElementById("workflow-tbody");
  tbody.innerHTML = workflows.map(wf => `
    <tr>
      <td><strong>${wf.id}</strong></td>
      <td>${wf.citizenId}</td>
      <td>${wf.scheme}</td>
      <td>${wf.agencies.map(a => `<span class="badge" style="background:#e2e8f0; padding:2px 6px; border-radius:4px; margin-right:4px;">${a}</span>`).join("")}</td>
      <td><span class="status-pill ${wf.status === "Resolved" ? "success" : "pending"}">${wf.status}</span></td>
      <td>${wf.sla}</td>
    </tr>
  `).join("");
}

function renderAdapters() {
  const connectors = getData("connectors");
  const grid = document.getElementById("adapter-grid");
  grid.innerHTML = connectors.map(c => `
    <div class="adapter-card">
      <div class="adapter-header">
        <h4>${c.name}</h4>
        <span class="badge online">${c.health}</span>
      </div>
      <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">Connector: <strong>${c.type}</strong></p>
      <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">Protocol: <strong>${c.protocol}</strong></p>
      <p style="font-size:0.8rem; color:var(--success);">Round-Trip Latency: <strong>${c.latency}</strong></p>
    </div>
  `).join("");
}

function renderAuditLogs() {
  const logs = getData("auditLogs");
  const tbody = document.getElementById("audit-tbody");
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td>${l.timestamp}</td>
      <td><code>${l.action}</code></td>
      <td>${l.actor}</td>
      <td>${l.schema}</td>
      <td><span class="status-pill success">${l.consent}</span></td>
      <td><small>${l.hash}</small></td>
    </tr>
  `).join("");
}

document.getElementById("btn-trigger-workflow").addEventListener("click", () => {
  const workflows = getData("workflows");
  const logs = getData("auditLogs");
  
  const newId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
  workflows.unshift({
    id: newId,
    citizenId: "IN-8921-X",
    scheme: "Unified Citizen Grant Assessment",
    agencies: ["Civil Registry", "Tax Board"],
    status: "Resolved",
    sla: "Completed Instantly"
  });

  logs.unshift({
    timestamp: new Date().toLocaleTimeString(),
    action: "FEDERATED_AUTO_APPROVAL",
    actor: "IntegraX Interop Engine",
    schema: "UnifiedBeneficiary_v1",
    consent: "Valid (Auto-Consent SSO)",
    hash: Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('') + "..."
  });

  setData("workflows", workflows);
  setData("auditLogs", logs);

  renderWorkflows();
  renderAuditLogs();
});

document.getElementById("btn-search-citizen").addEventListener("click", () => {
  const id = document.getElementById("citizen-search-input").value.trim();
  const records = INITIAL_DATA.citizenData[id];
  const container = document.getElementById("citizen-results-area");

  if (!records) {
    container.innerHTML = `<p style="color:var(--warning);">No federated master data record found for Identifier: ${id}</p>`;
    return;
  }

  container.innerHTML = `
    <h4>Consolidated Profile: ${records.name} (DOB: ${records.dob})</h4>
    <p style="font-size:0.85rem; color:var(--text-muted); margin:0.5rem 0 1rem;">
      Cross-Verified In: ${records.verifiedRegistries.join(" • ")}
    </p>
    <table class="data-table">
      <thead>
        <tr>
          <th>Application Scheme</th>
          <th>Provider Agency</th>
          <th>Interoperable Status</th>
        </tr>
      </thead>
      <tbody>
        ${records.entitlements.map(e => `
          <tr>
            <td><strong>${e.name}</strong></td>
            <td>${e.provider}</td>
            <td><span class="status-pill success">${e.status}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
});

document.getElementById("btn-clear-logs").addEventListener("click", () => {
  localStorage.removeItem("integrax_auditLogs");
  localStorage.removeItem("integrax_workflows");
  renderWorkflows();
  renderAuditLogs();
});

renderWorkflows();
renderAdapters();
renderAuditLogs();
document.getElementById("btn-search-citizen").click();
