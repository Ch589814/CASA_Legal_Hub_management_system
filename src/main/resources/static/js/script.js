// script.js

let editingId = null;

// Load clients
function loadClients() {
    fetch("/api/clients")
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById("clientList");
            list.innerHTML = "";

            data.forEach(client => {
                const li = document.createElement("li");

                li.innerHTML = `
                    <strong>${client.fullName}</strong><br>
                    Email: ${client.email} <br>
                    Phone: ${client.phone} <br>
                    Address: ${client.address} <br><br>

                    <button onclick="editClient(${client.id}, '${client.fullName}', '${client.email}', '${client.phone}', '${client.address}')">
                        Edit
                    </button>

                    <button onclick="deleteClient(${client.id})" style="background:red;">
                        Delete
                    </button>
                `;
                list.appendChild(li);
            });
        });
}

// Add OR Update client
document.getElementById("clientForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const client = {
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value
    };

    let url = "/api/clients";
    let method = "POST";

    if (editingId !== null) {
        url = `/api/clients/${editingId}`;
        method = "PUT";
    }

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(client)
    }).then(() => {
        loadClients();
        document.getElementById("clientForm").reset();
        editingId = null;
    });
});

// Delete client
function deleteClient(id) {
    if (confirm("Are you sure you want to delete this client?")) {
        fetch(`/api/clients/${id}`, { method: "DELETE" })
            .then(() => loadClients());
    }
}

// Edit client
function editClient(id, fullName, email, phone, address) {
    document.getElementById("fullName").value = fullName;
    document.getElementById("email").value = email;
    document.getElementById("phone").value = phone;
    document.getElementById("address").value = address;

    editingId = id;
}

function cancelEdit() {
    document.getElementById("clientForm").reset();
    editingId = null;
}

// Search clients
function searchClients() {
    const keyword = document.getElementById("searchInput").value;

    if (keyword === "") {
        loadClients();
        return;
    }

    fetch(`/api/clients/search?keyword=${keyword}`)
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById("clientList");
            list.innerHTML = "";

            data.forEach(client => {
                const li = document.createElement("li");

                li.innerHTML = `
                    <strong>${client.fullName}</strong><br>
                    Email: ${client.email} <br>
                    Phone: ${client.phone} <br>
                    Address: ${client.address} <br><br>

                    <button onclick="editClient(${client.id}, '${client.fullName}', '${client.email}', '${client.phone}', '${client.address}')">
                        Edit
                    </button>

                    <button onclick="deleteClient(${client.id})" style="background:red;">
                        Delete
                    </button>
                `;
                list.appendChild(li);
            });
        });
}

// Load clients on start
loadClients();