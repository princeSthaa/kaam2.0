(function () {
    "use strict";

    const table = document.getElementById("stockTable");
    const searchInput = document.getElementById("stockSearch");
    const typeFilter = document.getElementById("stockTypeFilter");

    if (!table) {
        return;
    }

    const tbody = table.querySelector("tbody");
    let stockItems = [];

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function statusClass(status) {
        if (status === "Low Stock") return "warning";
        if (status === "Available") return "success";
        return "secondary";
    }

    function render() {
        const query = (searchInput?.value || "").toLowerCase();
        const type = typeFilter?.value || "all";

        const rows = stockItems.filter((item) => {
            const matchesType = type === "all" || item.type === type;
            const haystack = `${item.sku} ${item.name} ${item.type} ${item.location} ${item.status}`.toLowerCase();
            return matchesType && haystack.includes(query);
        });

        tbody.innerHTML = rows.length
            ? rows.map((item) => `
                <tr>
                    <td>${escapeHtml(item.sku)}</td>
                    <td>${escapeHtml(item.name)}</td>
                    <td>${escapeHtml(item.type)}</td>
                    <td>${escapeHtml(item.available)} ${escapeHtml(item.uom)}</td>
                    <td>${escapeHtml(item.location)}</td>
                    <td><span class="badge text-bg-${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
                </tr>
            `).join("")
            : `<tr><td colspan="6" class="text-center text-secondary py-4">No stock records found.</td></tr>`;
    }

    const legacyItems = window.legacyPageModelData?.stockItems;

    if (Array.isArray(legacyItems) && legacyItems.length) {
        stockItems = legacyItems;
        render();
    } else {
        import("/js/warehouse/data.js")
            .then((module) => {
                stockItems = module.warehouseData?.stockItems || [];
                render();
            })
            .catch(() => {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Stock data could not be loaded.</td></tr>`;
            });
    }

    searchInput?.addEventListener("input", render);
    typeFilter?.addEventListener("change", render);
})();
