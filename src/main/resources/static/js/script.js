let editingId = null;

/* ===================== UTILITIES ===================== */

function sanitize(str) {
    const d = document.createElement("div");
    d.textContent = str ?? "";
    return d.innerHTML;
}

function showSuccess(msg) {
    const el = document.getElementById("successMsg");
    if (!el) return;

    el.textContent = "✅ " + msg;
    el.style.display = "block";

    const err = document.getElementById("errorMsg");
    if (err) err.style.display = "none";

    setTimeout(() => (el.style.display = "none"), 4000);
}

function showError(msg) {
    const el = document.getElementById("errorMsg");
    if (!el) return;

    el.textContent = "❌ " + msg;
    el.style.display = "block";
}

/* ===================== FIELD VALIDATION HELPERS ===================== */

const FIELDS = [
    "fullName", "idNumber", "email", "phone",
    "province", "district", "sector", "cell", "village"
];

function clearFieldErrors() {
    FIELDS.forEach(f => {
        const input = document.getElementById(f);
        const err = document.getElementById("err-" + f);

        if (input) input.classList.remove("error-field");
        if (err) err.textContent = "";
    });
}

function setFieldError(field, msg) {
    const input = document.getElementById(field);
    const err = document.getElementById("err-" + field);

    if (input) input.classList.add("error-field");
    if (err) err.textContent = msg;
}

/* ===================== CONFIRM (optional future use) ===================== */

function showConfirm(message, onConfirm) {
    const overlay = document.getElementById("confirmOverlay");
    if (!overlay) return onConfirm(); // fallback safe delete

    document.getElementById("confirmMessage").textContent = message;
    overlay.classList.add("show");

    document.getElementById("confirmYes").onclick = () => {
        overlay.classList.remove("show");
        onConfirm();
    };

    document.getElementById("confirmNo").onclick = () => {
        overlay.classList.remove("show");
    };
}

/* ===================== INPUT RESTRICTIONS ===================== */

document.addEventListener("DOMContentLoaded", function () {
    ["idNumber", "phone"].forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (!input) return;

        const counterId = fieldId === "idNumber" ? "idCount" : "phoneCount";
        const maxLen = fieldId === "idNumber" ? 16 : 10;

        input.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "");

            const counter = document.getElementById(counterId);
            if (counter) {
                counter.textContent = this.value.length;
                counter.style.color =
                    this.value.length === maxLen ? "#27ae60" : "#e74c3c";
            }
        });
    });
});

/* ===================== VALIDATION ===================== */

function validateForm() {
    let valid = true;
    let firstErrorField = null;

    clearFieldErrors();

    const fullName = document.getElementById("fullName").value.trim();
    if (!fullName) {
        setFieldError("fullName", "Full name is required.");
        firstErrorField ??= "fullName";
        valid = false;
    }

    const idNumber = document.getElementById("idNumber").value.trim();
    if (!/^\d{16}$/.test(idNumber)) {
        setFieldError("idNumber", "National ID must be exactly 16 digits.");
        firstErrorField ??= "idNumber";
        valid = false;
    }

    const phone = document.getElementById("phone").value.trim();
    if (!/^\d{10}$/.test(phone)) {
        setFieldError("phone", "Phone must be exactly 10 digits.");
        firstErrorField ??= "phone";
        valid = false;
    }

    const email = document.getElementById("email").value.trim();
    if (email && email !== "-" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError("email", "Invalid email format.");
        firstErrorField ??= "email";
        valid = false;
    }

    ["province","district","sector","cell","village"].forEach(f => {
        const el = document.getElementById(f);
        if (!el || !el.value.trim()) {
            setFieldError(f, "This field is required.");
            firstErrorField ??= f;
            valid = false;
        }
    });

    if (!valid && firstErrorField) {
        document.getElementById(firstErrorField)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return valid;
}

/* ===================== TABLE RENDER ===================== */

function serviceBadgeColor(service) {
    return {
        "Notary Service": "#8e44ad",
        "Mediation": "#2980b9",
        "Legal Consultation": "#27ae60",
        "Legal Representation": "#e67e22"
    }[service] || "#7f8c8d";
}

function renderTable(data) {
    const tbody = document.getElementById("clientTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML =
            `<tr><td colspan="9" style="text-align:center;color:#999;">No clients found.</td></tr>`;
        return;
    }

    data.forEach((c, i) => {
        const tr = document.createElement("tr");

        const statusBadge =
            c.status === "Active"
                ? `<span class="badge badge-active">Active</span>`
                : `<span class="badge badge-inactive">Inactive</span>`;

        const serviceBadge = c.serviceType
            ? `<span class="badge" style="background:${serviceBadgeColor(c.serviceType)}">${sanitize(c.serviceType)}</span>`
            : "-";

        const address = [c.province, c.district, c.sector, c.cell, c.village]
            .filter(Boolean).map(sanitize).join(", ");

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
                <a href="/clients/view/${c.id}">
                    <button class="btn-view">👁 View</button>
                </a>
                <button class="btn-warning">✏️ Edit</button>
                <button class="btn-delete">🗑 Delete</button>
            </td>
        `;

        tr.querySelector(".btn-warning").onclick = () => editClient(c);

        // SAFE DELETE (now with confirm fallback)
        tr.querySelector(".btn-delete").onclick = () => {
            if (confirm("Are you sure you want to delete this client?")) {
                deleteClient(c.id);
            }
        };

        tbody.appendChild(tr);
    });
}

/* ===================== API CALLS ===================== */

function loadClients() {
    fetch("/api/clients")
        .then(r => r.ok ? r.json() : [])
        .then(data => renderTable(data))
        .catch(err => console.error("Load error:", err));
}

document.getElementById("clientForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const client = {
        fullName: document.getElementById("fullName").value.trim(),
        idNumber: document.getElementById("idNumber").value.trim(),
        email: document.getElementById("email").value.trim() || "-",
        phone: document.getElementById("phone").value.trim(),
        province: document.getElementById("province").value,
        district: document.getElementById("district").value.trim(),
        sector: document.getElementById("sector").value.trim(),
        cell: document.getElementById("cell").value.trim(),
        village: document.getElementById("village").value.trim(),
        gender: document.getElementById("gender").value,
        nationality: document.getElementById("nationality").value.trim(),
        serviceType: document.getElementById("serviceType").value,
        status: document.getElementById("clientStatus").value
    };

    const url = editingId ? `/api/clients/${editingId}` : "/api/clients";
    const method = editingId ? "PUT" : "POST";

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client)
    })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(() => {
            loadClients();
            document.getElementById("clientForm").reset();
            document.getElementById("formTitle").textContent =
                "➕ Register New Client";

            showSuccess(editingId
                ? "Client updated successfully!"
                : "Client registered successfully!");

            editingId = null;
        })
        .catch(err => {
            console.error("Save error:", err);
            showError("Something went wrong.");
        });
});

/* ===================== DELETE ===================== */

function deleteClient(id) {
    fetch(`/api/clients/${id}`, { method: "DELETE" })
        .then(() => {
            loadClients();
            showSuccess("Client deleted successfully!");
        })
        .catch(err => {
            console.error("Delete error:", err);
            showError("Failed to delete client.");
        });
}

/* ===================== EDIT / CANCEL ===================== */

function editClient(c) {
    Object.keys(c).forEach(k => {
        const el = document.getElementById(k);
        if (el) el.value = c[k] || "";
    });

    document.getElementById("formTitle").textContent = "✏️ Edit Client";
    editingId = c.id;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
    document.getElementById("clientForm")?.reset();
    document.getElementById("formTitle").textContent =
        "➕ Register New Client";

    clearFieldErrors();
    editingId = null;
}

/* ===================== SEARCH ===================== */

function searchClients() {
    const keyword = document.getElementById("searchInput").value;

    if (!keyword) return loadClients();

    fetch(`/api/clients/search?keyword=${keyword}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => renderTable(data));
}

/* ===================== INIT ===================== */

loadClients();
