document.addEventListener("DOMContentLoaded", function() {
    const data = window.crmAuditLog || [];
    
    // Summary Cards
    const elTotal = document.getElementById("auditTotalTx");
    const elReceived = document.getElementById("auditTotalReceived");
    const elDiscounts = document.getElementById("auditTotalDiscounts");
    const elFlagged = document.getElementById("auditFlaggedTx");

    // Table
    const tableBody = document.getElementById("auditTableBody");

    // Filters
    const fDateFrom = document.getElementById("auditDateFrom");
    const fDateTo = document.getElementById("auditDateTo");
    const fEventType = document.getElementById("auditEventType");
    const fUser = document.getElementById("auditUserFilter");
    const fSeverity = document.getElementById("auditSeverityFilter");
    const resetBtn = document.getElementById("resetAuditFilters");

    // Modal
    const modal = document.getElementById("auditDetailModal");
    const modalBackdrop = document.getElementById("auditModalBackdrop");
    const modalClose = document.getElementById("auditModalClose");

    function formatCurrency(amount) {
        if (amount === 0) return "Rs. 0";
        const isNegative = amount < 0;
        const absAmount = Math.abs(amount);
        const formatted = "Rs. " + absAmount.toLocaleString('en-IN');
        return isNegative ? "-" + formatted : formatted;
    }

    function updateSummary(filteredData) {
        if (elTotal) elTotal.innerText = filteredData.length;
        
        if (elReceived) {
            const sumReceived = filteredData
                .filter(d => d.eventType === "Payment Received" && d.severity !== "critical")
                .reduce((acc, curr) => acc + curr.amount, 0);
            elReceived.innerText = formatCurrency(sumReceived);
        }

        if (elDiscounts) {
            const sumDiscounts = filteredData
                .filter(d => (d.eventType === "Discount Applied" || d.eventType === "Refund Processed") && d.severity !== "critical")
                .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
            elDiscounts.innerText = formatCurrency(sumDiscounts);
        }

        if (elFlagged) {
            elFlagged.innerText = filteredData.filter(d => d.severity === 'warning' || d.severity === 'critical').length;
        }
    }

    function formatDate(isoString) {
        const d = new Date(isoString);
        return d.toLocaleString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function getEventBadgeClass(type) {
        switch(type) {
            case "Payment Received": return "badge-success";
            case "Refund Processed": return "badge-danger";
            case "Payment Bounced": return "badge-danger";
            case "Discount Applied": return "badge-warning";
            case "Invoice Issued": return "badge-ready";
            case "Price Adjusted": return "badge-progress";
            default: return "badge-draft";
        }
    }

    function getSeverityIcon(severity) {
        switch(severity) {
            case "critical": return '<span class="material-symbols-outlined text-danger">error</span>';
            case "warning": return '<span class="material-symbols-outlined text-warning">warning</span>';
            default: return '<span class="material-symbols-outlined text-success">check_circle</span>';
        }
    }

    function renderTable(filteredData) {
        if (!tableBody) return;
        tableBody.innerHTML = "";

        if (filteredData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="empty-cell text-center" style="padding: 30px; color: var(--muted);">No financial transactions match your filters.</td></tr>`;
            return;
        }

        filteredData.forEach(event => {
            const row = document.createElement("tr");
            row.className = "audit-row";
            row.style.cursor = "pointer";
            row.onclick = () => openModal(event);

            // Amount styling
            let amountClass = "fw-bold";
            if (event.amount > 0 && event.eventType === "Payment Received") amountClass += " text-success";
            else if (event.amount < 0) amountClass += " text-danger";

            row.innerHTML = `
                <td style="white-space: nowrap;"><small class="text-muted">${formatDate(event.timestamp)}</small></td>
                <td><span class="badge ${getEventBadgeClass(event.eventType)} audit-event-badge">${event.eventType}</span></td>
                <td>${event.description}</td>
                <td class="${amountClass}">${formatCurrency(event.amount)}</td>
                <td><a href="#" class="audit-entity-link" onclick="event.stopPropagation()">${event.entityLabel}</a></td>
                <td>${event.user}</td>
                <td class="text-center">${getSeverityIcon(event.severity)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function applyFilters() {
        let filtered = data;

        if (fDateFrom && fDateFrom.value) {
            filtered = filtered.filter(d => new Date(d.timestamp) >= new Date(fDateFrom.value));
        }
        if (fDateTo && fDateTo.value) {
            const dateTo = new Date(fDateTo.value);
            dateTo.setHours(23, 59, 59, 999);
            filtered = filtered.filter(d => new Date(d.timestamp) <= dateTo);
        }
        if (fEventType && fEventType.value) {
            filtered = filtered.filter(d => d.eventType === fEventType.value);
        }
        if (fUser && fUser.value) {
            filtered = filtered.filter(d => d.user === fUser.value);
        }
        if (fSeverity && fSeverity.value) {
            filtered = filtered.filter(d => d.severity === fSeverity.value);
        }

        renderTable(filtered);
        updateSummary(filtered);
    }

    // Modal Logic
    function openModal(event) {
        document.getElementById("detailTimestamp").innerText = formatDate(event.timestamp);
        document.getElementById("detailEventType").innerText = event.eventType;
        document.getElementById("detailEntity").innerText = event.entityLabel;
        document.getElementById("detailUser").innerText = event.user;
        document.getElementById("detailDescription").innerText = event.description;
        document.getElementById("detailMethod").innerText = event.method || "N/A";
        
        const elAmount = document.getElementById("detailAmount");
        elAmount.innerText = formatCurrency(event.amount);
        if (event.amount > 0 && event.eventType === "Payment Received") elAmount.className = "p-2 border rounded fw-bold fs-5 bg-success-soft text-success";
        else if (event.amount < 0) elAmount.className = "p-2 border rounded fw-bold fs-5 bg-danger-soft text-danger";
        else elAmount.className = "p-2 bg-light border rounded fw-bold fs-5";

        let sevHtml = getSeverityIcon(event.severity);
        sevHtml += ' <span style="text-transform: capitalize; margin-left: 5px;">' + (event.severity === 'info' ? 'Cleared' : event.severity) + '</span>';
        document.getElementById("detailSeverity").innerHTML = sevHtml;

        const changesContainer = document.getElementById("detailChangesContainer");
        const changesBlock = document.getElementById("detailChanges");
        if (event.changes) {
            changesContainer.style.display = "block";
            let changesHtml = '<table class="table table-sm table-bordered mb-0"><thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead><tbody>';
            for (const key in event.changes.after) {
                const beforeVal = event.changes.before[key] || '-';
                const afterVal = event.changes.after[key] || '-';
                changesHtml += `<tr><td><strong>${key}</strong></td><td class="text-danger"><del>${beforeVal}</del></td><td class="text-success">${afterVal}</td></tr>`;
            }
            changesHtml += '</tbody></table>';
            changesBlock.innerHTML = changesHtml;
        } else {
            changesContainer.style.display = "none";
        }

        const notesContainer = document.getElementById("detailNotesContainer");
        const notesBlock = document.getElementById("detailNotes");
        if (event.notes) {
            notesContainer.style.display = "block";
            notesBlock.innerText = event.notes;
        } else {
            notesContainer.style.display = "none";
        }

        modal.classList.remove("hidden");
    }

    function closeModal() {
        modal.classList.add("hidden");
    }

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

    // Filter Listeners
    if (fDateFrom) fDateFrom.addEventListener("change", applyFilters);
    if (fDateTo) fDateTo.addEventListener("change", applyFilters);
    if (fEventType) fEventType.addEventListener("change", applyFilters);
    if (fUser) fUser.addEventListener("change", applyFilters);
    if (fSeverity) fSeverity.addEventListener("change", applyFilters);

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (fDateFrom) fDateFrom.value = "";
            if (fDateTo) fDateTo.value = "";
            if (fEventType) fEventType.value = "";
            if (fUser) fUser.value = "";
            if (fSeverity) fSeverity.value = "";
            applyFilters();
        });
    }

    // Init
    applyFilters();
});
