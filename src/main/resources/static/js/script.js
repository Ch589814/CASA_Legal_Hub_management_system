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
    const el = document.getElementById("errorMsg");
    el.textContent = "❌ " + msg; el.style.display = "block";
}

const FIELDS = ["fullName", "idNumber", "email", "phone", "province", "district", "sector", "cell", "village"];

function clearFieldErrors() {
    FIELDS.forEach(f => {
        const input = document.getElementById(f);
        const err   = document.getElementById("err-" + f);
        if (input) input.classList.remove("error-field");
        if (err)   err.textContent = "";
    });
}

function setFieldError(field, msg) {
    const input = document.getElementById(field);
    const err   = document.getElementById("err-" + field);
    if (input) input.classList.add("error-field");
    if (err)   err.textContent = msg;
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

// Block non-digit input on ID and phone fields as user types
document.addEventListener("DOMContentLoaded", function() {
    ["idNumber", "phone"].forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (!input) return;
        const counterId = fieldId === "idNumber" ? "idCount" : "phoneCount";
        const maxLen    = fieldId === "idNumber" ? 16 : 10;
        input.addEventListener("input", function() {
            this.value = this.value.replace(/\D/g, "");
            const counter = document.getElementById(counterId);
            if (counter) {
                counter.textContent = this.value.length;
                counter.style.color = this.value.length === maxLen ? "#27ae60" : "#e74c3c";
            }
        });
        input.addEventListener("keypress", function(e) {
            if (!/\d/.test(e.key)) e.preventDefault();
        });
    });
});

// Front-end validation before sending to backend
function validateForm() {
    let valid = true;
    let firstErrorField = null;
    clearFieldErrors();

    const fullName = document.getElementById("fullName").value.trim();
    if (!fullName) {
        setFieldError("fullName", "Full name is required.");
        if (!firstErrorField) firstErrorField = "fullName";
        valid = false;
    }

    const idNumber = document.getElementById("idNumber").value.trim();
    if (!idNumber) {
        setFieldError("idNumber", "National ID is required.");
        if (!firstErrorField) firstErrorField = "idNumber";
        valid = false;
    } else if (!/^\d{16}$/.test(idNumber)) {
        setFieldError("idNumber", "National ID must be exactly 16 digits (numbers only).");
        if (!firstErrorField) firstErrorField = "idNumber";
        valid = false;
    }

    const phone = document.getElementById("phone").value.trim();
    if (!phone) {
        setFieldError("phone", "Phone number is required.");
        if (!firstErrorField) firstErrorField = "phone";
        valid = false;
    } else if (!/^\d{10}$/.test(phone)) {
        setFieldError("phone", "Phone number must be exactly 10 digits (numbers only).");
        if (!firstErrorField) firstErrorField = "phone";
        valid = false;
    }

    const email = document.getElementById("email").value.trim();
    if (email && email !== "-" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError("email", "Please enter a valid email address.");
        if (!firstErrorField) firstErrorField = "email";
        valid = false;
    }

    if (!document.getElementById("province").value) {
        setFieldError("province", "Province is required.");
        if (!firstErrorField) firstErrorField = "province";
        valid = false;
    }
    if (!document.getElementById("district").value.trim()) {
        setFieldError("district", "District is required.");
        if (!firstErrorField) firstErrorField = "district";
        valid = false;
    }
    if (!document.getElementById("sector").value.trim()) {
        setFieldError("sector", "Sector is required.");
        if (!firstErrorField) firstErrorField = "sector";
        valid = false;
    }
    if (!document.getElementById("cell").value.trim()) {
        setFieldError("cell", "Cell is required.");
        if (!firstErrorField) firstErrorField = "cell";
        valid = false;
    }
    if (!document.getElementById("village").value.trim()) {
        setFieldError("village", "Village is required.");
        if (!firstErrorField) firstErrorField = "village";
        valid = false;
    }

    if (!valid && firstErrorField) {
        const el = document.getElementById(firstErrorField);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return valid;
}

function serviceBadgeColor(service) {
    const map = {
        "Notary Service":        "#8e44ad",
        "Mediation":             "#2980b9",
        "Legal Consultation":    "#27ae60",
        "Legal Representation":  "#e67e22"
    };
    return map[service] || "#7f8c8d";
}

function renderTable(data) {
    const tbody = document.getElementById("clientTableBody");
    tbody.innerHTML = "";
    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#999;">No clients found.</td></tr>`;
        return;
    }
    data.forEach((c, i) => {
        const statusBadge = c.status === "Active"
            ? `<span class="badge badge-active">Active</span>`
            : `<span class="badge badge-inactive">Inactive</span>`;
        const serviceBadge = c.serviceType
            ? `<span class="badge" style="background:${serviceBadgeColor(c.serviceType)}">${sanitize(c.serviceType)}</span>`
            : "-";
        const address = [c.province, c.district, c.sector, c.cell, c.village]
            .filter(Boolean).map(sanitize).join(", ");
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td><strong>${sanitize(c.fullName)}</strong></td>
            <td>${sanitize(c.idNumber) || "-"}</td>
            <td>${sanitize(c.phone)}</td>
            <td style="font-size:12px;">${address || "-"}</td>
            <td>${serviceBadge}</td>
            <td>${statusBadge}</td>
            <td>${sanitize(c.createdAt) || "-"}</td>
            <td>
                <a href="/clients/view/${c.id}"><button class="btn-view">👁 View</button></a>
                <button class="btn-warning">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteClient(${c.id})">🗑 Delete</button>
            </td>`;
        tr.querySelector('.btn-warning').onclick = () => editClient(c);
        tbody.appendChild(tr);
    });
}

function loadClients() {
    fetch("/api/clients")
        .then(r => { if (!r.ok) { showError("Failed to load clients."); return []; } return r.json(); })
        .then(data => { if (data) renderTable(data); });
}

document.getElementById("clientForm").addEventListener("submit", function(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const client = {
        fullName:    document.getElementById("fullName").value.trim(),
        idNumber:    document.getElementById("idNumber").value.trim(),
        email:       document.getElementById("email").value.trim() || "-",
        phone:       document.getElementById("phone").value.trim(),
        province:    document.getElementById("province").value,
        district:    document.getElementById("district").value.trim(),
        sector:      document.getElementById("sector").value.trim(),
        cell:        document.getElementById("cell").value.trim(),
        village:     document.getElementById("village").value.trim(),
        gender:      document.getElementById("gender").value,
        nationality: document.getElementById("nationality").value.trim(),
        serviceType: document.getElementById("serviceType").value,
        status:      document.getElementById("clientStatus").value,
        notes:       document.getElementById("notes").value.trim()
    };

    const url    = editingId ? `/api/clients/${editingId}` : "/api/clients";
    const method = editingId ? "PUT" : "POST";

    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(client) })
        .then(r => {
            if (!r.ok) return r.json().then(body => {
                (body.errors || []).forEach(err => {
                    const [field] = err.split(":");
                    setFieldError(field.trim(), err.split(":")[1].trim());
                });
                throw new Error("validation");
            });
            return r.json();
        })
        .then(() => {
            loadClients();
            document.getElementById("clientForm").reset();
            document.getElementById("formTitle").textContent = "➕ Register New Client";
            showSuccess(editingId ? "Client updated successfully!" : "Client registered successfully!");
            editingId = null;
        })
        .catch(err => { if (err.message !== "validation") showError("Something went wrong."); });
});

function deleteClient(id) {
    showConfirm("Delete this client? This cannot be undone.", () => {
        fetch(`/api/clients/${id}`, { method: "DELETE" })
            .then(() => { loadClients(); showSuccess("Client deleted successfully!"); });
    });
}

function editClient(c) {
    document.getElementById("fullName").value     = c.fullName    || "";
    document.getElementById("idNumber").value     = c.idNumber    || "";
    document.getElementById("email").value        = c.email       || "";
    document.getElementById("phone").value        = c.phone       || "";
    document.getElementById("province").value     = c.province    || "";
    document.getElementById("district").value     = c.district    || "";
    document.getElementById("sector").value       = c.sector      || "";
    document.getElementById("cell").value         = c.cell        || "";
    document.getElementById("village").value      = c.village     || "";
    document.getElementById("gender").value       = c.gender      || "";
    document.getElementById("nationality").value  = c.nationality || "";
    document.getElementById("serviceType").value  = c.serviceType || "";
    document.getElementById("clientStatus").value = c.status      || "Active";
    document.getElementById("notes").value        = c.notes       || "";
    document.getElementById("formTitle").textContent = "✏️ Edit Client";
    editingId = c.id;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
    document.getElementById("clientForm").reset();
    document.getElementById("formTitle").textContent = "➕ Register New Client";
    clearFieldErrors();
    editingId = null;
}

function searchClients() {
    const keyword = document.getElementById("searchInput").value;
    if (!keyword) { loadClients(); return; }
    fetch(`/api/clients/search?keyword=${keyword}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => { if (data) renderTable(data); });
}

loadClients();
