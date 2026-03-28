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
function clearErrors() {
    ["fullName", "email", "password"].forEach(f => {
        const input = document.getElementById(f);
        const err   = document.getElementById("err-" + f);
        if (input) input.classList.remove("error-field");
        if (err)   err.textContent = "";
    });
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

function makeBadge(text, cssClass) {
    const span = document.createElement("span");
    span.className = "badge " + cssClass;
    span.textContent = text;
    return span;
}

function makeCell(text) {
    const td = document.createElement("td");
    td.textContent = text ?? "-";
    return td;
}

function renderTable(data) {
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";
    if (!data.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 7; td.style.textAlign = "center"; td.style.color = "#999";
        td.textContent = "No users found.";
        tr.appendChild(td); tbody.appendChild(tr);
        return;
    }
    data.forEach((u, i) => {
        const tr = document.createElement("tr");
        tr.appendChild(makeCell(i + 1));

        const nameTd = document.createElement("td");
        const strong = document.createElement("strong");
        strong.textContent = u.fullName;
        nameTd.appendChild(strong);
        tr.appendChild(nameTd);

        tr.appendChild(makeCell(u.email));

        const roleTd = document.createElement("td");
        roleTd.appendChild(makeBadge(u.role, u.role === "ADMIN" ? "badge-admin" : "badge-staff"));
        tr.appendChild(roleTd);

        const statusTd = document.createElement("td");
        statusTd.appendChild(makeBadge(u.status, u.status === "Active" ? "badge-active" : "badge-inactive"));
        tr.appendChild(statusTd);

        tr.appendChild(makeCell(u.createdAt));

        const actionTd = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.className = "btn-warning";
        editBtn.textContent = "✏️ Edit";
        editBtn.onclick = () => editUser(u.id, u.fullName, u.email, u.role, u.status);

        const delBtn = document.createElement("button");
        delBtn.className = "btn-delete";
        delBtn.textContent = "🗑 Delete";
        delBtn.onclick = () => deleteUser(u.id);

        actionTd.appendChild(editBtn);
        actionTd.appendChild(delBtn);
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

function loadUsers() {
    fetch("/api/users")
        .then(r => { if (!r.ok) { showError("Failed to load users."); return []; } return r.json(); })
        .then(data => { if (data) renderTable(data); });
}

document.getElementById("userForm").addEventListener("submit", function(e) {
    e.preventDefault();
    clearErrors();
    const user = {
        fullName: document.getElementById("fullName").value,
        email:    document.getElementById("email").value,
        password: document.getElementById("password").value,
        role:     document.getElementById("role").value,
        status:   document.getElementById("status").value
    };
    const url    = editingId ? `/api/users/${editingId}` : "/api/users";
    const method = editingId ? "PUT" : "POST";
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(user) })
        .then(r => {
            if (!r.ok) return r.json().then(body => {
                (body.errors || []).forEach(err => {
                    const [field] = err.split(":");
                    const f     = field.trim();
                    const input = document.getElementById(f);
                    const span  = document.getElementById("err-" + f);
                    if (input) input.classList.add("error-field");
                    if (span)  span.textContent = err.split(":")[1].trim();
                });
                throw new Error("validation");
            });
            return r.json();
        })
        .then(() => {
            loadUsers();
            document.getElementById("userForm").reset();
            document.getElementById("formTitle").textContent = "Add Staff / Admin User";
            showSuccess(editingId ? "User updated!" : "User saved!");
            editingId = null;
        })
        .catch(err => { if (err.message !== "validation") showError("Something went wrong."); });
});

function editUser(id, fullName, email, role, status) {
    editingId = id;
    document.getElementById("fullName").value = fullName || "";
    document.getElementById("email").value    = email    || "";
    document.getElementById("password").value = "";
    document.getElementById("role").value     = role     || "STAFF";
    document.getElementById("status").value   = status   || "Active";
    document.getElementById("formTitle").textContent = "Edit User";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
    editingId = null;
    document.getElementById("userForm").reset();
    document.getElementById("formTitle").textContent = "Add Staff / Admin User";
    clearErrors();
}

function deleteUser(id) {
    showConfirm("Delete this user? This cannot be undone.", () => {
        fetch(`/api/users/${id}`, { method: "DELETE" })
            .then(() => { loadUsers(); showSuccess("User deleted!"); });
    });
}

loadUsers();
