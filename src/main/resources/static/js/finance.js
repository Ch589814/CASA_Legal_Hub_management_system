let editingId = null;

function sanitize(str) {
    const d = document.createElement('div');
    d.textContent = str ?? '';
    return d.innerHTML;
}

function showSuccess(msg) {
    const el = document.getElementById("successMsg");
    el.textContent = "✅ " + msg; el.style.display = "block";
    setTimeout(() => el.style.display = "none", 4000);
}
function showError(msg) {
    document.getElementById("errorMsg").textContent = "❌ " + msg;
    document.getElementById("errorMsg").style.display = "block";
    setTimeout(() => document.getElementById("errorMsg").style.display = "none", 5000);
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

function makeStatusBadge(status) {
    const map = {
        Approved: "badge-paid",
        Pending:  "badge-pending",
        Overdue:  "badge-overdue",
        Partial:  "badge-warning",
        Refunded: "badge-inactive"
    };
    const span = document.createElement("span");
    span.className = "badge " + (map[status] || "");
    span.textContent = status || "-";
    return span;
}

function makeCell(text) {
    const td = document.createElement("td");
    td.textContent = text ?? "-";
    return td;
}

function formatRWF(amount) {
    if (!amount && amount !== 0) return "-";
    return "RWF " + Number(amount).toLocaleString();
}

function renderTable(data) {
    const tbody = document.getElementById("financeTableBody");
    tbody.innerHTML = "";
    if (!data.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 10; td.style.textAlign = "center"; td.style.color = "#999";
        td.textContent = "No finance records found.";
        tr.appendChild(td); tbody.appendChild(tr);
        return;
    }
    data.forEach((f, i) => {
        const isApproved = f.status === "Approved";
        const isRefunded = f.status === "Refunded";
        const tr = document.createElement("tr");

        if (isApproved) tr.style.background = "#f0fff4";
        if (isRefunded) tr.style.background = "#fdf2f8";

        tr.appendChild(makeCell(i + 1));
        tr.appendChild(makeCell(f.client ? f.client.fullName : "-"));
        tr.appendChild(makeCell(f.description));
        tr.appendChild(makeCell(f.serviceType || "-"));
        tr.appendChild(makeCell(formatRWF(f.amount)));
        tr.appendChild(makeCell(formatRWF(f.amountPaid)));
        const balance = (f.amount || 0) - (f.amountPaid || 0);
        const balTd = document.createElement("td");
        balTd.textContent = formatRWF(balance);
        balTd.style.color = balance > 0 ? "#e74c3c" : "#27ae60";
        balTd.style.fontWeight = "bold";
        tr.appendChild(balTd);
        tr.appendChild(makeCell(f.paymentMethod || "-"));
        tr.appendChild(makeCell(f.type));

        const statusTd = document.createElement("td");
        statusTd.appendChild(makeStatusBadge(f.status));
        tr.appendChild(statusTd);

        tr.appendChild(makeCell(f.date));

        const actionTd = document.createElement("td");
        actionTd.style.whiteSpace = "nowrap";

        if (IS_ADMIN) {
            // ── ADMIN actions ──────────────────────────────────────
            if (!isApproved && !isRefunded) {
                // Approve button — for Pending/Overdue/Partial records
                const approveBtn = document.createElement("button");
                approveBtn.className = "btn-view";
                approveBtn.textContent = "✅ Approve";
                approveBtn.style.background = "#27ae60";
                approveBtn.onclick = () => approveFinance(f.id, f.description);
                actionTd.appendChild(approveBtn);

                // Edit button
                const editBtn = document.createElement("button");
                editBtn.className = "btn-warning";
                editBtn.textContent = "✏️ Edit";
                editBtn.onclick = () => editFinance(f);
                actionTd.appendChild(editBtn);

                // Delete button
                const delBtn = document.createElement("button");
                delBtn.className = "btn-delete";
                delBtn.textContent = "🗑 Delete";
                delBtn.onclick = () => deleteFinance(f.id);
                actionTd.appendChild(delBtn);

            } else if (isApproved) {
                // Unlock button — revert Approved back to Pending
                const unlockBtn = document.createElement("button");
                unlockBtn.className = "btn-warning";
                unlockBtn.textContent = "🔓 Unlock";
                unlockBtn.onclick = () => unlockFinance(f.id, f.description);
                actionTd.appendChild(unlockBtn);

                // Refund button — only on Approved records
                if (f.type !== "Refund") {
                    const refundBtn = document.createElement("button");
                    refundBtn.className = "btn-delete";
                    refundBtn.textContent = "↩️ Refund";
                    refundBtn.style.background = "#8e44ad";
                    refundBtn.onclick = () => refundFinance(f.id, f.description);
                    actionTd.appendChild(refundBtn);
                }

            } else if (isRefunded) {
                const refundedSpan = document.createElement("span");
                refundedSpan.textContent = "↩️ Refunded";
                refundedSpan.style.cssText = "color:#8e44ad; font-size:12px; font-weight:bold;";
                actionTd.appendChild(refundedSpan);
            }

        } else {
            // ── STAFF actions ──────────────────────────────────────
            if (isApproved) {
                const lockSpan = document.createElement("span");
                lockSpan.textContent = "🔒 Locked";
                lockSpan.style.cssText = "color:#27ae60; font-size:12px; font-weight:bold;";
                actionTd.appendChild(lockSpan);
            } else if (isRefunded) {
                const refundedSpan = document.createElement("span");
                refundedSpan.textContent = "↩️ Refunded";
                refundedSpan.style.cssText = "color:#8e44ad; font-size:12px; font-weight:bold;";
                actionTd.appendChild(refundedSpan);
            } else {
                const editBtn = document.createElement("button");
                editBtn.className = "btn-warning";
                editBtn.textContent = "✏️ Edit";
                editBtn.onclick = () => editFinance(f);
                actionTd.appendChild(editBtn);

                const delBtn = document.createElement("button");
                delBtn.className = "btn-delete";
                delBtn.textContent = "🗑 Delete";
                delBtn.onclick = () => deleteFinance(f.id);
                actionTd.appendChild(delBtn);
            }
        }

        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

function loadFinance() {
    fetch("/api/finance")
        .then(r => { if (!r.ok) { showError("Failed to load finance records."); return []; } return r.json(); })
        .then(data => { if (data) renderTable(data); });
}

// ── APPROVE ───────────────────────────────────────────────────────
function approveFinance(id, description) {
    showConfirm(`Approve payment: "${description}"? This will lock the record.`, () => {
        fetch(`/api/finance/${id}/approve`, { method: "PUT" })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(() => { loadFinance(); showSuccess("Record approved and locked!"); })
            .catch(() => showError("Failed to approve record."));
    });
}

// ── UNLOCK ────────────────────────────────────────────────────────
function unlockFinance(id, description) {
    showConfirm(`Unlock "${description}"? This will set it back to Pending.`, () => {
        fetch(`/api/finance/${id}/unlock`, { method: "PUT" })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(() => { loadFinance(); showSuccess("Record unlocked and set to Pending."); })
            .catch(() => showError("Failed to unlock record."));
    });
}

// ── REFUND ────────────────────────────────────────────────────────
function refundFinance(id, description) {
    showConfirm(`Process refund for "${description}"? This action will be logged.`, () => {
        fetch(`/api/finance/${id}/refund`, { method: "PUT" })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(() => { loadFinance(); showSuccess("Refund processed successfully!"); })
            .catch(() => showError("Failed to process refund."));
    });
}

// ── FORM SUBMIT ───────────────────────────────────────────────────
document.getElementById("financeForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const clientId = document.getElementById("clientId").value;
    if (!clientId) { showError("Please select a client."); return; }
    const description = document.getElementById("financeDescription").value.trim();
    if (!description) { showError("Description is required."); return; }

    const payload = {
        description:   description,
        amount:        document.getElementById("financeAmount").value || 0,
        amountPaid:    document.getElementById("financeAmountPaid").value || 0,
        serviceType:   document.getElementById("financeServiceType").value,
        paymentMethod: document.getElementById("paymentMethod").value,
        type:          document.getElementById("financeType").value,
        status:        document.getElementById("financeStatus").value,
        date:          document.getElementById("financeDate").value || null,
        client: { id: clientId }
    };

    const url    = editingId ? `/api/finance/${editingId}` : "/api/finance";
    const method = editingId ? "PUT" : "POST";

    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(r => { if (!r.ok) { showError("Failed to save record."); throw new Error(); } return r.json(); })
        .then(() => {
            loadFinance();
            document.getElementById("financeForm").reset();
            document.getElementById("formTitle").textContent = "💰 Add Finance Record";
            showSuccess(editingId ? "Record updated!" : "Record saved!");
            editingId = null;
        })
        .catch(() => {});
});

function editFinance(f) {
    if (f.status === "Approved") { showError("This record is Approved. Use Unlock first."); return; }
    editingId = f.id;
    document.getElementById("financeDescription").value  = f.description   || "";
    document.getElementById("financeAmount").value       = f.amount        || "";
    document.getElementById("financeAmountPaid").value   = f.amountPaid    || "";
    document.getElementById("financeServiceType").value  = f.serviceType   || "";
    document.getElementById("paymentMethod").value       = f.paymentMethod || "";
    document.getElementById("financeType").value         = f.type          || "";
    document.getElementById("financeStatus").value       = f.status        || "Pending";
    document.getElementById("financeDate").value         = (f.date && f.date !== "null") ? f.date : "";
    if (f.client) document.getElementById("clientId").value = f.client.id;
    document.getElementById("formTitle").textContent = "✏️ Edit Finance Record";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
    editingId = null;
    document.getElementById("financeForm").reset();
    document.getElementById("formTitle").textContent = "💰 Add Finance Record";
}

function deleteFinance(id) {
    showConfirm("Delete this finance record? This cannot be undone.", () => {
        fetch(`/api/finance/${id}`, { method: "DELETE" })
            .then(() => { loadFinance(); showSuccess("Record deleted!"); });
    });
}

loadFinance();
