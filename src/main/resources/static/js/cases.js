let editingId = null;

function sanitize(str) {
    const d = document.createElement('div');
    d.textContent = str ?? '';
    return d.innerHTML;
}

function showSuccess(msg) {
    const el = document.getElementById("successMsg");
    el.textContent = "✅ " + msg; el.style.display = "block";
    document.getElementById("errorMsg").style.display = "none";
    setTimeout(() => el.style.display = "none", 4000);
}
function showError(msg) {
    document.getElementById("errorMsg").textContent = "❌ " + msg;
    document.getElementById("errorMsg").style.display = "block";
}

function showConfirm(message, onConfirm) {
    document.getElementById("confirmMessage").textContent = message;
    document.getElementById("confirmOverlay").classList.add("show");
    document.getElementById("confirmYes").onclick = () => {
        document.getElementById("confirmOverlay").classList.remove("show");
        onConfirm();
    };
    document.getElementById("confirmNo").onclick = () => {
        document.getElementById("confirmOverlay").classList.remove("show");
    };
}

function makeCell(text) {
    const td = document.createElement("td");
    td.textContent = text ?? "-";
    return td;
}

function makeStatusBadge(status) {
    const map = { Open: "badge-open", Closed: "badge-closed", Pending: "badge-pending", "In Progress": "badge-pending", Won: "badge-paid", Lost: "badge-overdue" };
    const span = document.createElement("span");
    span.className = "badge " + (map[status] || "");
    span.textContent = status || "-";
    return span;
}

function makePriorityBadge(p) {
    const colors = { Low: "#7f8c8d", Normal: "#3498db", High: "#f39c12", Urgent: "#e74c3c" };
    const span = document.createElement("span");
    span.className = "badge";
    span.style.background = colors[p] || "#7f8c8d";
    span.textContent = p || "Normal";
    return span;
}

function renderTable(data) {
    const tbody = document.getElementById("caseTableBody");
    tbody.innerHTML = "";
    if (!data.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 9; td.style.textAlign = "center"; td.style.color = "#999";
        td.textContent = "No cases found.";
        tr.appendChild(td); tbody.appendChild(tr);
        return;
    }
    data.forEach((c, i) => {
        const tr = document.createElement("tr");
        tr.appendChild(makeCell(i + 1));

        const numTd = document.createElement("td");
        const strong = document.createElement("strong");
        strong.textContent = c.caseNumber;
        numTd.appendChild(strong);
        tr.appendChild(numTd);

        tr.appendChild(makeCell(c.client ? c.client.fullName : "-"));
        tr.appendChild(makeCell(c.serviceType));
        tr.appendChild(makeCell(c.caseType));

        const prioTd = document.createElement("td");
        prioTd.appendChild(makePriorityBadge(c.priority));
        tr.appendChild(prioTd);

        const statusTd = document.createElement("td");
        statusTd.appendChild(makeStatusBadge(c.status));
        tr.appendChild(statusTd);

        tr.appendChild(makeCell(c.courtDate));

        const actionTd = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.className = "btn-warning";
        editBtn.textContent = "✏️ Edit";
        editBtn.onclick = () => editCase(c.id, c.caseNumber, c.serviceType, c.caseType, c.status, c.priority, c.courtDate, c.description, c.client ? c.client.id : null);

        const delBtn = document.createElement("button");
        delBtn.className = "btn-delete";
        delBtn.textContent = "🗑 Delete";
        delBtn.onclick = () => deleteCase(c.id);

        actionTd.appendChild(editBtn);
        actionTd.appendChild(delBtn);
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

function loadCases() {
    fetch("/api/cases")
        .then(r => { if (!r.ok) { showError("Failed to load cases."); return []; } return r.json(); })
        .then(data => { if (data) renderTable(data); });
}

document.getElementById("caseForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const clientId = document.getElementById("clientId").value;
    if (!clientId) { showError("Please select a client."); return; }
    const payload = {
        caseNumber:  document.getElementById("caseNumber").value,
        serviceType: document.getElementById("caseServiceType") ? document.getElementById("caseServiceType").value : "",
        caseType:    document.getElementById("caseType").value,
        status:      document.getElementById("caseStatus").value,
        priority:    document.getElementById("casePriority") ? document.getElementById("casePriority").value : "Normal",
        courtDate:   document.getElementById("courtDate").value || null,
        description: document.getElementById("caseDescription").value,
        client: { id: clientId }
    };
    const url    = editingId ? `/api/cases/${editingId}` : "/api/cases";
    const method = editingId ? "PUT" : "POST";
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(r => { if (!r.ok) { showError("Failed to save case."); throw new Error(); } return r.json(); })
        .then(() => {
            loadCases();
            document.getElementById("caseForm").reset();
            document.getElementById("formTitle").textContent = "Add New Case";
            showSuccess(editingId ? "Case updated!" : "Case saved!");
            editingId = null;
        })
        .catch(() => {});
});

function editCase(id, caseNumber, serviceType, caseType, status, priority, courtDate, description, clientId) {
    editingId = id;
    document.getElementById("caseNumber").value = caseNumber || "";
    if (document.getElementById("caseServiceType")) document.getElementById("caseServiceType").value = serviceType || "";
    document.getElementById("caseType").value    = caseType  || "";
    document.getElementById("caseStatus").value  = status    || "Open";
    if (document.getElementById("casePriority")) document.getElementById("casePriority").value = priority || "Normal";
    document.getElementById("courtDate").value   = (courtDate && courtDate !== "null") ? courtDate : "";
    document.getElementById("caseDescription").value = (description && description !== "null") ? description : "";
    if (clientId) document.getElementById("clientId").value = clientId;
    document.getElementById("formTitle").textContent = "Edit Case";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
    editingId = null;
    document.getElementById("caseForm").reset();
    document.getElementById("formTitle").textContent = "Add New Case";
}

function deleteCase(id) {
    showConfirm("Delete this case? This cannot be undone.", () => {
        fetch(`/api/cases/${id}`, { method: "DELETE" })
            .then(() => { loadCases(); showSuccess("Case deleted!"); });
    });
}

function searchCases() {
    const keyword = document.getElementById("searchInput").value;
    if (!keyword) { loadCases(); return; }
    fetch(`/api/cases/search?keyword=${encodeURIComponent(keyword)}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => { if (data) renderTable(data); });
}

loadCases();
