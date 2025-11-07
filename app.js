const apiBase = "http://localhost:5145/api";

// ======== LOAD MENUS ========
async function loadMenusAndRender(showAdminOptions = true) {
    const menuListDiv = document.getElementById("menuList");
    if (!menuListDiv) return;

    try {
        const response = await fetch(`${apiBase}/Menu`);
        if (!response.ok) throw new Error("Failed to fetch menu list");
        const menus = await response.json();
        menuListDiv.innerHTML = "";

        menus.forEach(menu => {
            const div = document.createElement("div");
            div.classList.add("menu-card");

            div.innerHTML = `
                <h3>${menu.name}</h3>
                <p>Price: RM${menu.price.toFixed(2)}</p>
                <p>Category: ${menu.category}</p>
                <p>Status: ${menu.available ? "✅ Available" : "❌ Unavailable"}</p>
                ${showAdminOptions
                    ? `<div class="admin-buttons">
                           <button onclick="editMenu(${menu.id}, '${menu.name}', ${menu.price}, '${menu.category}', ${menu.available})">Edit</button>
                           <button onclick="deleteMenu(${menu.id})">Delete</button>
                       </div>`
                    : `<button onclick="orderMenu(${menu.id}, '${menu.name}')">Order</button>`}
            `;
            menuListDiv.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading menus:", error);
        menuListDiv.innerHTML = `<p style="color:red;">⚠️ Failed to load menus.</p>`;
    }
}

// ======== ADD, EDIT, DELETE MENU ========
document.addEventListener("DOMContentLoaded", () => {
    const addMenuForm = document.getElementById("addMenuForm");
    if (addMenuForm) {
        addMenuForm.addEventListener("submit", async e => {
            e.preventDefault();
            const menuData = {
                name: document.getElementById("menuName").value,
                price: parseFloat(document.getElementById("menuPrice").value),
                category: document.getElementById("menuCategory").value,
                available: document.getElementById("menuAvailable").value === "true"
            };
            try {
                const res = await fetch(`${apiBase}/Menu`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(menuData)
                });
                if (res.ok) {
                    alert("✅ Menu added!");
                    addMenuForm.reset();
                    loadMenusAndRender(true);
                } else alert("❌ Failed to add menu!");
            } catch (err) { console.error(err); }
        });
    }

    // Auto load menu/report based on page
    const path = window.location.pathname;
    if (path.includes("student.html")) loadMenusAndRender(false);
    if (path.includes("admin.html")) loadMenusAndRender(true);
    if (path.includes("report.html")) {
        loadReport();
        document.getElementById("filterStatus")?.addEventListener("change", loadReport);
    }
});

async function editMenu(id, name, price, category, available) {
    const newName = prompt("Edit Name:", name); if (!newName) return;
    const newPrice = parseFloat(prompt("Edit Price:", price));
    const newCategory = prompt("Edit Category:", category);
    const newAvailable = confirm("Mark as available?");
    const updatedMenu = { id, name: newName, price: newPrice, category: newCategory, available: newAvailable };
    try {
        const res = await fetch(`${apiBase}/Menu/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedMenu)
        });
        if (res.ok) loadMenusAndRender(true);
    } catch (err) { console.error(err); }
}

async function deleteMenu(id) {
    if (!confirm("Delete this menu?")) return;
    try {
        const res = await fetch(`${apiBase}/Menu/${id}`, { method: "DELETE" });
        if (res.ok) loadMenusAndRender(true);
    } catch (err) { console.error(err); }
}

// ======== ORDER (STUDENT) ========
const orderModal = document.getElementById("orderModal");
const closeModalBtn = document.getElementById("closeModal");
const orderForm = document.getElementById("orderForm");

function orderMenu(menuId, menuName) {
    document.getElementById("orderMenuId").value = menuId;
    document.getElementById("orderMenuName").value = menuName;
    orderModal.style.display = "block";
}

if (closeModalBtn) closeModalBtn.addEventListener("click", () => orderModal.style.display = "none");
window.onclick = e => { if (e.target === orderModal) orderModal.style.display = "none"; }

if (orderForm) orderForm.addEventListener("submit", async e => {
    e.preventDefault();
    const menuId = parseInt(document.getElementById("orderMenuId").value);
    const menuName = document.getElementById("orderMenuName").value;
    const studentName = document.getElementById("orderStudentName").value;
    const pickupDate = document.getElementById("orderPickupDate").value;
    const pickupTime = document.getElementById("orderPickupTime").value;
    const pickupDateTime = `${pickupDate}T${pickupTime}:00`;
    const orderData = { MenuId: menuId, StudentName: studentName, PickupTime: pickupDateTime, Status: "Pending" };
    try {
        const res = await fetch(`${apiBase}/Orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });
        if (res.ok) { alert(`✅ Order placed for ${menuName}!`); orderModal.style.display = "none"; orderForm.reset(); }
        else { const txt = await res.text(); console.error(txt); alert("❌ Failed to place order!"); }
    } catch (err) { console.error(err); }
});

// ======== REPORT (ADMIN) ========
async function loadReport() {
    const tbody = document.querySelector("#reportTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    const filterStatus = document.getElementById("filterStatus")?.value || "";

    try {
        const res = await fetch(`${apiBase}/Orders`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const orders = await res.json();

        const uniqueOrders = [...new Map(orders.map(o => [o.id, o])).values()]; // remove duplicates

        uniqueOrders
            .filter(o => !filterStatus || o.status === filterStatus)
            .forEach(order => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.studentName}</td>
                    <td>${order.menu?.name || ""}</td>
                    <td>${new Date(order.pickupTime).toLocaleString()}</td>
                    <td>
                        <select onchange="updateOrderStatus(${order.id}, this.value)">
                            <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                            <option value="Ready" ${order.status === "Ready" ? "selected" : ""}>Ready</option>
                            <option value="Completed" ${order.status === "Completed" ? "selected" : ""}>Completed</option>
                        </select>
                    </td>
                    <td><button class="admin-delete-btn" onclick="deleteOrder(${order.id})">Delete</button></td>
                `;
                tbody.appendChild(tr);
            });
    } catch (err) { console.error(err); tbody.innerHTML = `<tr><td colspan="6" style="color:red;">Failed to load report.</td></tr>`; }
}

// ======== UPDATE ORDER STATUS (PATCH) ========
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${apiBase}/Orders/${orderId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(status)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Error updating order:", err);
            alert("❌ Failed to update order. Check console for details.");
        } else {
            console.log(`✅ Order ${orderId} updated to ${status}`);
        }
    } catch (error) {
        console.error("Error updating order:", error);
        alert("❌ Failed to update order. See console for details.");
    }
}
