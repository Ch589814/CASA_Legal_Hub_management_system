let allDocuments = [];
let activeCategory = 'all';

document.addEventListener("DOMContentLoaded", function () {

    function sanitize(str) {
        const d = document.createElement('div');
        d.textContent = str ?? '';
        return d.innerHTML;
    }

    function showSuccess(msg) {
        const el = document.getElementById("successMsg");
        if (!el) return;

        el.textContent = "✅ " + msg;
        el.style.display = "block";

        const err = document.getElementById("errorMsg");
        if (err) err.style.display = "none";

        setTimeout(() => el.style.display = "none", 4000);
    }

    function showError(msg) {
        const el = document.getElementById("errorMsg");
        if (!el) return;

        el.textContent = "❌ " + msg;
        el.style.display = "block";

        setTimeout(() => el.style.display = "none", 5000);
    }

    function showConfirm(message, onConfirm) {
        const msgEl = document.getElementById("confirmMessage");
        const overlay = document.getElementById("confirmOverlay");
        const yesBtn = document.getElementById("confirmYes");
        const noBtn = document.getElementById("confirmNo");

        if (!msgEl || !overlay || !yesBtn || !noBtn) {
            console.error("Confirm modal elements missing in HTML");
            return;
        }

        msgEl.textContent = message;
        overlay.classList.add("show");

        yesBtn.onclick = () => {
            overlay.classList.remove("show");
            onConfirm();
        };

        noBtn.onclick = () => {
            overlay.classList.remove("show");
        };
    }

    function handleCategoryChange() {
        const category = document.getElementById("docCategory");
        const clientSection = document.getElementById("clientSection");
        const clientRequired = document.getElementById("clientRequired");
        const clientInput = document.getElementById("docClientId");

        if (!category || !clientSection || !clientRequired || !clientInput) return;

        if (category.value === "Staff Resource") {
            clientSection.style.opacity = "0.4";
            clientSection.style.pointerEvents = "none";
            clientRequired.textContent = "(optional)";
            clientInput.value = "";
        } else {
            clientSection.style.opacity = "1";
            clientSection.style.pointerEvents = "auto";
            clientRequired.textContent = "*";
        }
    }

    function clearErrors() {
        ["docFile", "docClientId"].forEach(f => {
            const el = document.getElementById(f);
            if (el) el.classList.remove("error-field");

            const err = document.getElementById("err-" + f);
            if (err) err.textContent = "";
        });

        const s = document.getElementById("successMsg");
        const e = document.getElementById("errorMsg");

        if (s) s.style.display = "none";
        if (e) e.style.display = "none";
    }

    function makeCategoryBadge(category) {
        const td = document.createElement("td");
        const span = document.createElement("span");
        span.className = "category-badge";

        if (category === "Client Document") {
            span.classList.add("cat-client");
            span.textContent = "📋 Client";
        } else if (category === "Case Document") {
            span.classList.add("cat-case");
            span.textContent = "📁 Case";
        } else {
            span.classList.add("cat-staff");
            span.textContent = "👤 Staff";
        }

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
        if (!tbody) return;

        tbody.innerHTML = "";

        if (!data.length) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 8;
            td.style.textAlign = "center";
            td.style.color = "#999";
            td.textContent = "No documents found.";
            tr.appendChild(td);
            tbody.appendChild(tr);
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

            const downloadBtn = document.createElement("a");
            downloadBtn.href = `/api/documents/download/${d.id}`;
            downloadBtn.textContent = "📥 Download";
            downloadBtn.style.cssText =
                "background:#27ae60;color:white;padding:5px 10px;border-radius:4px;text-decoration:none;font-size:12px;margin-right:6px;";
            actionTd.appendChild(downloadBtn);

            const delBtn = document.createElement("button");
            delBtn.className = "btn-delete";
            delBtn.textContent = "🗑 Delete";

            delBtn.onclick = () => {
                deleteDocument(d.id);
            };

            actionTd.appendChild(delBtn);
            tr.appendChild(actionTd);

            tbody.appendChild(tr);
        });
    }

    function applyFilters() {
        const keyword = (document.getElementById("docSearch")?.value || "").toLowerCase();

        let filtered = allDocuments;

        if (activeCategory !== "all") {
            filtered = filtered.filter(d => d.category === activeCategory);
        }

        if (keyword) {
            filtered = filtered.filter(d =>
                (d.fileName || "").toLowerCase().includes(keyword) ||
                (d.fileType || "").toLowerCase().includes(keyword) ||
                (d.description || "").toLowerCase().includes(keyword) ||
                (d.client?.fullName || "").toLowerCase().includes(keyword)
            );
        }

        renderTable(filtered);
    }

    function loadDocuments() {
        fetch("/api/documents")
            .then(r => r.json())
            .then(data => {
                allDocuments = data;
                applyFilters();
            })
            .catch(() => showError("Failed to load documents"));
    }

    function deleteDocument(id) {
        showConfirm("Are you sure you want to delete this document?", () => {
            fetch(`/api/documents/${id}`, { method: "DELETE" })
                .then(r => {
                    if (!r.ok) throw new Error();
                    showSuccess("Document deleted!");
                    loadDocuments();
                })
                .catch(() => showError("Failed to delete document"));
        });
    }

    // Expose functions globally (important for HTML onclick/tab usage)
    window.filterTab = function (category, tabEl) {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tabEl.classList.add("active");
        activeCategory = category;
        applyFilters();
    };

    window.searchDocuments = applyFilters;

    // Events
    const categoryEl = document.getElementById("docCategory");
    if (categoryEl) {
        categoryEl.addEventListener("change", handleCategoryChange);
    }

    const form = document.getElementById("uploadForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
        });
    }

    // Init
    handleCategoryChange();
    loadDocuments();
});
