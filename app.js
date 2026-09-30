// --- Initial Shared Mock Data Layer ---
const DEFAULT_APPLICATIONS = [
  {
    id: "APP-REV-101",
    citizenId: "IN-8921-X",
    citizenName: "Ramesh Sharma",
    scheme: "Agricultural Land Tax Exemption",
    dept: "Revenue",
    income: 180000,
    landRecord: "Survey #402 (2.4 Acres - Verified)",
    status: "Pending Verification",
    academicRecord: "N/A",
    dbtStatus: "Awaiting Clearance"
  },
  {
    id: "APP-SCH-204",
    citizenId: "IN-8921-X",
    citizenName: "Ramesh Sharma (Child: Aarav S.)",
    scheme: "Higher Education Merit Grant Scheme",
    dept: "Scholarship",
    income: 180000,
    landRecord: "Verified via Revenue Bus",
    status: "Pending Income Clearance",
    academicRecord: "CGPA 9.2 (DigiLocker Verified)",
    dbtStatus: "Staged for Direct Transfer"
  },
  {
    id: "APP-REV-099",
    citizenId: "IN-4412-K",
    citizenName: "Sunita Verma",
    scheme: "Agricultural Land Tax Exemption",
    dept: "Revenue",
    income: 240000,
    landRecord: "Survey #119 (Disputed Ownership)",
    status: "Pending Verification",
    academicRecord: "N/A",
    dbtStatus: "N/A"
  }
];

function getApps() {
  const data = localStorage.getItem("integrax_apps");
  return data ? JSON.parse(data) : DEFAULT_APPLICATIONS;
}

function saveApps(apps) {
  localStorage.setItem("integrax_apps", JSON.stringify(apps));
}

function updateAudit(text) {
  document.getElementById("audit-latest").textContent = `${new Date().toLocaleTimeString()} → ${text}`;
}

// Desk Switcher Navigation
document.querySelectorAll(".desk-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".desk-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".desk-panel").forEach(p => p.classList.remove("active"));

    tab.classList.add("active");
    const targetDesk = tab.getAttribute("data-desk");
    document.getElementById(`desk-${targetDesk}`).classList.add("active");
  });
});

// Render Citizen Portal
function renderCitizenPortal() {
  const apps = getApps().filter(a => a.citizenId === "IN-8921-X");
  const container = document.getElementById("citizen-apps-list");
  
  if (apps.length === 0) {
    container.innerHTML = `<p class="text-muted">No active applications filed.</p>`;
    return;
  }

  container.innerHTML = apps.map(app => `
    <div class="app-item">
      <div class="app-item-top">
        <h4>${app.scheme}</h4>
        <span class="status-badge ${app.status.includes('Approved') ? 'approved' : 'pending'}">${app.status}</span>
      </div>
      <p class="app-meta">Application ID: <strong>${app.id}</strong> • Handled by: <strong>${app.dept} Desk</strong></p>
      <p class="app-meta" style="margin-top:4px;">Cross-Verification: Income ₹${app.income.toLocaleString()} (${app.landRecord})</p>
    </div>
  `).join("");
}

// Render Revenue Desk
function renderRevenueDesk() {
  const apps = getApps();
  const tbody = document.getElementById("revenue-table-body");
  const revApps = apps.filter(a => a.dept === "Revenue" || a.scheme.includes("Land") || a.scheme.includes("Tax"));

  document.getElementById("rev-count").textContent = `${revApps.length} Applications Total`;

  tbody.innerHTML = revApps.map(app => `
    <tr>
      <td><strong>${app.id}</strong></td>
      <td>${app.citizenName} <br><small class="text-muted">${app.citizenId}</small></td>
      <td>${app.scheme}</td>
      <td><code>${app.landRecord}</code></td>
      <td>₹${app.income.toLocaleString()}</td>
      <td><span class="status-badge ${app.status.includes('Approved') ? 'approved' : 'pending'}">${app.status}</span></td>
      <td>
        ${app.status.includes('Approved') ? 
          `<span style="color:var(--green); font-size:0.8rem;"><i class="fa-solid fa-check-double"></i> Verified</span>` : 
          `<button class="btn btn-success" onclick="approveRevenue('${app.id}')"><i class="fa-solid fa-stamp"></i> Verify & Sign</button>`
        }
      </td>
    </tr>
  `).join("");
}

// Render Scholarship Desk
function renderScholarshipDesk() {
  const apps = getApps();
  const tbody = document.getElementById("scholarship-table-body");
  const schApps = apps.filter(a => a.dept === "Scholarship" || a.scheme.includes("Education") || a.scheme.includes("Grant"));

  document.getElementById("sch-count").textContent = `${schApps.length} Applications Total`;

  tbody.innerHTML = schApps.map(app => `
    <tr>
      <td><strong>${app.id}</strong></td>
      <td>${app.citizenName} <br><small class="text-muted">${app.citizenId}</small></td>
      <td>${app.scheme}</td>
      <td><span class="status-badge ${app.status.includes('Approved') ? 'approved' : 'pending'}">${app.status.includes('Approved') ? 'Verified by Revenue' : 'Awaiting Revenue Sync'}</span></td>
      <td><code>${app.academicRecord}</code></td>
      <td>${app.dbtStatus}</td>
      <td>
        ${app.status.includes('Sanctioned') || app.dbtStatus.includes('Disbursed') ? 
          `<span style="color:var(--green); font-size:0.8rem;"><i class="fa-solid fa-check"></i> Grant Disbursed</span>` : 
          `<button class="btn btn-success" onclick="sanctionScholarship('${app.id}')"><i class="fa-solid fa-coins"></i> Disburse DBT</button>`
        }
      </td>
    </tr>
  `).join("");
}

// Action Handlers
window.approveRevenue = function(id) {
  const apps = getApps();
  const target = apps.find(a => a.id === id);
  if (target) {
    target.status = "Approved by Revenue Officer";
    saveApps(apps);
    updateAudit(`Revenue Officer signed off on land verification for ${target.citizenId} (${target.id})`);
    renderAll();
  }
};

window.sanctionScholarship = function(id) {
  const apps = getApps();
  const target = apps.find(a => a.id === id);
  if (target) {
    target.status = "Grant Sanctioned & Approved";
    target.dbtStatus = "Disbursed via Aadhaar DBT Bridge";
    saveApps(apps);
    updateAudit(`Scholarship Desk triggered DBT payment for ${target.citizenId} (${target.id})`);
    renderAll();
  }
};

// Citizen Form Submit
document.getElementById("citizen-apply-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const apps = getApps();
  const scheme = document.getElementById("cit-scheme").value;
  const isRevenue = scheme.includes("Tax") || scheme.includes("Land");

  const newApp = {
    id: `APP-${isRevenue ? 'REV' : 'SCH'}-${Math.floor(300 + Math.random() * 600)}`,
    citizenId: document.getElementById("cit-id").value,
    citizenName: document.getElementById("cit-name").value,
    scheme: scheme,
    dept: isRevenue ? "Revenue" : "Scholarship",
    income: Number(document.getElementById("cit-income").value),
    landRecord: "Survey #402 (Federated Registry Confirmed)",
    status: "Pending Verification",
    academicRecord: "Class 12: 89.6% (Fetched via DigiLocker)",
    dbtStatus: "Pending Approval"
  };

  apps.unshift(newApp);
  saveApps(apps);
  updateAudit(`Citizen ${newApp.citizenId} submitted unified application ${newApp.id} for ${newApp.scheme}`);
  renderAll();
  alert(`Application ${newApp.id} successfully lodged into the federated interoperability bus!`);
});

function renderAll() {
  renderCitizenPortal();
  renderRevenueDesk();
  renderScholarshipDesk();
}

renderAll();
