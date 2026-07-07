(function () {
    "use strict";

    function formatCurrency(amount) {
        return "Rs. " + amount.toLocaleString("en-NP", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function initCreatePlanCalculator() {
        const inputQty = document.getElementById("inputQty");
        const bomTableBody = document.getElementById("bomTableBody");
        const bomEmptyState = document.getElementById("bomEmptyState");
        const btnAddMaterial = document.getElementById("btnAddMaterial");
        const totalRunCostDisplay = document.getElementById("totalRunCost");
        const createPlanForm = document.getElementById("createPlanForm");

        if (!inputQty || !bomTableBody || !bomEmptyState || !btnAddMaterial || !totalRunCostDisplay || !createPlanForm) return;
        if (createPlanForm.dataset.createPlanBound) return;
        createPlanForm.dataset.createPlanBound = "true";

        function updateGrandTotal() {
            let grandTotal = 0;
            document.querySelectorAll(".material-row-total").forEach(function (element) {
                grandTotal += parseFloat(element.dataset.value || 0);
            });

            totalRunCostDisplay.innerText = formatCurrency(grandTotal);
        }

        function recalculateRow(rowElement) {
            const targetQty = parseFloat(inputQty.value) || 0;
            const qtyPerUnit = parseFloat(rowElement.querySelector(".input-qty").value) || 0;
            const costPerUnit = parseFloat(rowElement.querySelector(".input-cost").value) || 0;
            const totalInput = rowElement.querySelector(".material-row-total");

            if (targetQty === 0) {
                totalInput.value = "Set Target Qty";
                totalInput.dataset.value = 0;
            } else {
                const rowTotal = targetQty * qtyPerUnit * costPerUnit;
                totalInput.value = rowTotal.toLocaleString("en-NP", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                totalInput.dataset.value = rowTotal;
            }

            updateGrandTotal();
        }

        function removeRow(buttonElement) {
            buttonElement.closest("tr").remove();

            if (document.querySelectorAll(".bom-manual-row").length === 0) {
                bomEmptyState.style.display = "table-row";
            }

            updateGrandTotal();
        }

        window.removeRow = removeRow;

        inputQty.addEventListener("input", function () {
            document.querySelectorAll(".bom-manual-row").forEach(function (row) {
                recalculateRow(row);
            });
        });

        btnAddMaterial.addEventListener("click", function () {
            bomEmptyState.style.display = "none";

            const row = document.createElement("tr");
            row.className = "bom-manual-row border-bottom bg-white";
            row.innerHTML = `
                <td class="py-3 ps-2 align-middle">
                    <input type="text" class="form-control form-control-sm" placeholder="e.g. Raw Denim" required>
                </td>
                <td class="py-3 align-middle">
                    <input type="number" step="any" class="form-control form-control-sm input-qty" placeholder="e.g. 2" required>
                </td>
                <td class="py-3 align-middle">
                    <input type="number" step="any" class="form-control form-control-sm input-cost" placeholder="e.g. 1250" required>
                </td>
                <td class="py-3 text-end pe-4 align-middle">
                    <div class="d-flex align-items-center justify-content-end gap-2">
                        <div class="input-group input-group-sm flex-grow-1">
                            <span class="input-group-text bg-light text-muted border-end-0">Rs.</span>
                            <input type="text" class="form-control material-row-total text-end fw-bold text-primary border-start-0 bg-white" placeholder="0.00" readonly data-value="0">
                        </div>
                        <button type="button" class="btn btn-sm text-danger" onclick="removeRow(this)" title="Remove">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            row.querySelector(".input-qty").addEventListener("input", function () {
                recalculateRow(row);
            });
            row.querySelector(".input-cost").addEventListener("input", function () {
                recalculateRow(row);
            });

            bomTableBody.appendChild(row);
            recalculateRow(row);
        });

        createPlanForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const planBasis = document.querySelector('input[name="planBasis"]:checked').value;
            const planName = document.getElementById("inputPlanName").value;
            const startDate = document.getElementById("inputStartDate").value;
            const endDate = document.getElementById("inputEndDate").value;
            const qty = document.getElementById("inputQty").value;
            const uom = document.getElementById("inputUOM").value;
            const existingPlans = JSON.parse(localStorage.getItem("productionPlans") || "[]");

            existingPlans.push({
                id: Date.now(),
                name: planName,
                basis: planBasis,
                targetQty: `${qty} ${uom.split(" ")[0]}`,
                timeline: `${startDate} to ${endDate}`,
                status: "Draft"
            });

            localStorage.setItem("productionPlans", JSON.stringify(existingPlans));
            window.location.href = "/Production/Index";
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCreatePlanCalculator);
    } else {
        initCreatePlanCalculator();
    }
})();
