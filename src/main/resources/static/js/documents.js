let allDocuments = [];
let activeCategory = 'all';

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
    setTimeout(() => el.style.display = "none", 5000);
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

// Show/hide client field based on category
function handleCategoryChange() {
    const category = document.getElementById("docCategory").value;
    const clientSection = document.getElementById("clientSection");
    const clientRequired = document.getElementById("clientRequired");
    if (category === "Staff Resource") {
        clientSection.style.opacity = "0.4";
        clientSection.style.pointerEvents = "none";
        clientRequired.textContent = "(optional)";
        document.getElementById("docClientId").value = "";
    } else {
        clientSection.style.opacity = "1";
        clientSection.style.pointerEvents = "auto";
        clientRequired.textContent = "*";
    }
}

function makeCategoryBadge(category) {
    const td = document.createElement("td");
    const span = document.createElement("span");
    span.className = "category-badge";
    if (category === "Client Document") { span.classList.add("cat-client"); span.textContent = "📋 Client"; }
    else if (category === "Case Document") { span.classList.add("cat-case"); span.textContent = "📁 Case"; }
    else { span.classList.add("cat-staff"); span.textContent = "👤 Staff"; }
    td.appendChild(span);
    return td;
}

function makeCell(text) {
    const td = document.createElement("td");
    td.textContent = text ?? "-";
    return td;
}

function renderTable(data) {
    const tbody = document.getElementById("documentTableBody");
    tbody.innerHTML = "";
    if (!data.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 8; td.style.textAlign = "center"; td.style.color = "#999";
        td.textContent = "No documents found.";
        tr.appendChild(td); tbody.appendChild(tr);
        return;
    }
    data.forEach((d, i) => {
        const tr = document.createElement("tr");
        tr.appendChild(makeCell(i + 1));
        tr.appendChild(makeCategoryBadge(d.category));
        tr.appendChild(makeCell(d.fileName));
        tr.appendChild(makeCell(d.fileType));
        tr.appendChild(makeCell(d.client ? d.client.fullName : "-"));
        tr.appendChild(makeCell(d.description));
        tr.appendChild(makeCell(d.uploadDate));

        const actionTd = document.createElement("td");

        const viewBtn = document.createElement("a");
        viewBtn.href = `/api/documents/view/${d.id}`;
        viewBtn.target = "_blank";
        viewBtn.textContent = "👁 View";
        viewBtn.style.cssText = "background:#3498db; color:white; padding:5px 10px; border-radius:4px; text-decoration:none; font-size:12px; margin-right:6px;";
        actionTd.appendChild(viewBtn);

        const downloadBtn = document.createElement("a");
        downloadBtn.href = `/api/documents/download/${d.id}`;
        downloadBtn.textContent = "📥 Download";
        downloadBtn.style.cssText = "background:#27ae60; color:white; padding:5px 10px; border-radius:4px; text-decoration:none; font-size:12px; margin-right:6px;";
        actionTd.appendChild(downloadBtn);

        const delBtn = document.createElement("button");
        delBtn.className = "btn-delete";
        delBtn.textContent = "🗑 Delete";
        delBtn.onclick = () => deleteDocument(d.id);
        actionTd.appendChild(delBtn);
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

function filterTab(category, tabEl) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tabEl.classList.add("active");
    activeCategory = category;
    applyFilters();
}

function searchDocuments() {
    applyFilters();
}

function applyFilters() {
    const keyword = (document.getElementById("docSearch").value || "").toLowerCase().trim();
    let filtered = allDocuments;

    // Apply category filter
    if (activeCategory !== "all") {
        filtered = filtered.filter(d => d.category === activeCategory);
    }

    // Apply keyword search across fileName, fileType, description, client name
    if (keyword) {
        filtered = filtered.filter(d => {
            const name        = (d.fileName    || "").toLowerCase();
            const type        = (d.fileType    || "").toLowerCase();
            const desc        = (d.description || "").toLowerCase();
            const client      = (d.client ? d.client.fullName : "").toLowerCase();
            const category    = (d.category   || "").toLowerCase();
            return name.includes(keyword) || type.includes(keyword) ||
                   desc.includes(keyword) || client.includes(keyword) ||
                   category.includes(keyword);
        });
    }

    renderTable(filtered);
}

function loadDocuments() {
    fetch("/api/documents")
        .then(r => { if (!r.ok) { showError("Failed to load documents."); return []; } return r.json(); })
        .then(data => {
            if (data) {
                allDocuments = data;
                applyFilters();
            }
        });
}

document.getElementById("uploadForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const category = document.getElementById("docCategory").value;
    const clientId = document.getElementById("docClientId").value;
    const fileInput = document.getElementById("docFile");

    if (!fileInput.files || fileInput.files.length === 0) {
        showError("Please select a file to upload.");
        fileInput.classList.add("error-field");
        fileInput.focus();
        return;
    }
    fileInput.classList.remove("error-field");

    if (category !== "Staff Resource" && !clientId) {
        showError("Please select a client for this document type.");
        document.getElementById("docClientId").classList.add("error-field");
        return;
    }
    document.getElementById("docClientId").classList.remove("error-field");

    const formData = new FormData();
    formData.append("file",        fileInput.files[0]);
    formData.append("category",    category);
    formData.append("fileType",    document.getElementById("docFileType").value);
    formData.append("description", document.getElementById("docDescription").value.trim());
    if (clientId) formData.append("clientId", clientId);

    fetch("/api/documents", {
        method: "POST",
        body: formData
    })
        .then(r => { if (!r.ok) { showError("Failed to upload file. Please try again."); throw new Error(); } return r.json(); })
        .then(() => {
            loadDocuments();
            resetForm();
            showSuccess("Document uploaded successfully!");
        })
        .catch(() => {});
});

function resetForm() {
    document.getElementById("uploadForm").reset();
    handleCategoryChange();
}

function deleteDocument(id) {
    showConfirm("Delete this document? This cannot be undone.", () => {
        fetch(`/api/documents/${id}`, { method: "DELETE" })
            .then(() => { loadDocuments(); showSuccess("Document deleted!"); });
    });
}

// Init
handleCategoryChange();
loadDocuments();
