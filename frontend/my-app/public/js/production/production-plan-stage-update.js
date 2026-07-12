(function () {
    "use strict";

    const state = {
        plans: [],
        products: [],
        customers: [],
        outlets: [],
        warehouses: [],
        stages: [],
        plan: null,
        selectedStage: null
    };

    document.addEventListener("DOMContentLoaded", init);

    const fallbackProductImage = "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=640&q=80";

    async function init() {
        state.products = App.getData("products", "mockProducts", "productData");
        state.customers = App.getData("customers", "mockCustomers", "customerData");
        state.outlets = App.getData("outlets", "mockOutlets", "outletData");
        state.warehouses = App.getData("warehouses", "mockWarehouses", "warehouseData");
        state.stages = App.getData("productionStages", "mockProductionStages", "stages");

        try {
            const res = await fetch("http://localhost:5083/api/production-plans");
            if(res.ok) {
                state.plans = await res.json();
            } else {
                state.plans = App.getData("mockProductionPlans", "productionPlans", "plans");
            }
        } catch (e) {
            state.plans = App.getData("mockProductionPlans", "productionPlans", "plans");
        }

        loadPlan();
        populateProductDropdown();
        bindEvents();
        renderPlanSummary();
        renderStageDropdown();
        renderStageProgress();
        renderStageTable();
    }

    function loadPlan() {
        const id = App.value("#selectedPlanId");
        state.plan = App.findById(state.plans, id) || state.plans[0] || null;
        state.planProducts = state.plan ? normalizePlanProducts(state.plan) : [];
    }

    function populateProductDropdown() {
        const dropdown = document.getElementById("productDropdown");
        if (!dropdown) return;

        if (!state.planProducts || !state.planProducts.length) {
            dropdown.innerHTML = `<option value="">No Products Found</option>`;
            return;
        }

        dropdown.innerHTML = state.planProducts.map(function (product) {
            const id = product.productId || product.productCode;
            const name = product.productName;
            return `<option value="${App.escapeHtml(id)}">${App.escapeHtml(name)}</option>`;
        }).join("");

        // Add event listener to refresh stages when product is changed!
        dropdown.addEventListener("change", function () {
            clearForm(false);
            renderStageDropdown();
            renderStageProgress();
            renderStageTable();
        });
    }

    function bindEvents() {
        const stageDropdown = document.getElementById("stageDropdown");
        if (stageDropdown) {
            stageDropdown.addEventListener("change", function () {
                selectStage(stageDropdown.value);
            });
        }

        ["actualStartDate", "actualEndDate"].forEach(function (id) {
            const input = document.getElementById(id);
            if (input) input.addEventListener("change", calculateActualDuration);
        });

        ["completedQty", "rejectedQty", "stageStatus"].forEach(function (id) {
            const input = document.getElementById(id);
            if (input) input.addEventListener("input", validateStageForm);
            if (input) input.addEventListener("change", validateStageForm);
        });

        const clearBtn = document.getElementById("clearStageFormBtn");
        if (clearBtn) {
            clearBtn.addEventListener("click", clearForm);
        }

        const form = document.getElementById("stageUpdateForm");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                if (!validateStageForm()) {
                    return;
                }

                // Retrieve form values
                const productId = App.value("#productDropdown");
                const stageId = App.value("#stageDropdown");
                const status = App.value("#stageStatus");
                const actualStartDate = App.value("#actualStartDate");
                const actualEndDate = App.value("#actualEndDate");
                const completedQty = App.number(App.value("#completedQty"));
                const rejectedQty = App.number(App.value("#rejectedQty"));
                const remarks = App.value("#remarks");

                // Find stage and update
                const planStages = getPlanStages();

                const stage = planStages.find(function (s, index) {
                    const id = s.stageId || s.id || `stage-${index + 1}`;
                    return String(id) === String(stageId);
                });

                if (!stage) {
                    App.toast("Selected stage not found.", "danger");
                    return;
                }

                // Update stage fields
                stage.status = status;
                stage.actualStartDate = actualStartDate;
                stage.actualEndDate = actualEndDate;
                stage.completedQty = completedQty;
                stage.rejectedQty = rejectedQty;
                stage.remarks = remarks;

                // Update product stages in plan
                const product = state.planProducts.find(p => String(p.productId || p.productCode) === String(productId));
                if (product) {
                    product.stages = planStages;
                }
                const planProduct = state.plan.products && state.plan.products.find(p => String(p.productId || p.productCode) === String(productId));
                if (planProduct) {
                    planProduct.stages = planStages;
                }

                // Update overall plan status based on stages
                const allCompleted = planStages.every(function (s) { return s.status === "Completed"; });
                const anyRunning = planStages.some(function (s) { return s.status === "Active" || s.status === "In Progress" || s.status === "Running" || s.status === "Completed"; });
                const anyHold = planStages.some(function (s) { return s.status === "On Hold"; });

                if (allCompleted) {
                    state.plan.status = "Completed";
                } else if (anyHold) {
                    state.plan.status = "On Hold";
                } else if (anyRunning) {
                    state.plan.status = "Running";
                }

                // Also update plan-level stages for compatibility
                state.plan.stages = planStages;

                fetch("http://localhost:5083/api/production-plans/" + state.plan.id, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(state.plan)
                }).then(function(res) {
                    if (!res.ok) throw new Error("Failed to save progress.");
                    App.toast("Stage progress saved successfully.", "success");
                    window.setTimeout(function () {
                        window.location.href = "/Production/Plan/Details?planNo=" + encodeURIComponent(state.plan.planNo || state.plan.id);
                    }, 400);
                }).catch(function(err) {
                    App.toast("Error saving progress to server.", "danger");
                    console.error(err);
                });
            });
        }
    }

    function getPlanStages() {
        if (!state.plan) return state.stages;

        const productId = App.value("#productDropdown");
        const product = state.planProducts && state.planProducts.find(p => String(p.productId || p.productCode) === String(productId));

        return product && product.stages && product.stages.length
            ? product.stages
            : (state.plan.stages && state.plan.stages.length ? state.plan.stages : state.stages);
    }

    function renderPlanSummary() {
        if (!state.plan) {
            App.setText("#stagePlanNo", "Plan not found");
            App.setText("#stagePlanSubtitle", "No matching mock production plan was found.");
            return;
        }

        const productNames = state.planProducts.map(p => p.productName).join(" • ");
        const quantity = state.planProducts.reduce((sum, p) => sum + p.quantity, 0);

        App.setText("#stagePlanNo", state.plan.planNo || state.plan.planId);
        App.setValue("#planNoInput", state.plan.planNo || state.plan.planId);
        App.setText("#stagePlanSubtitle", `${productNames} • ${state.plan.demandType || "-"}`);

        const badge = document.getElementById("stagePlanStatusBadge");
        if (badge) badge.outerHTML = App.badge(state.plan.status);

        App.setText("#stageDemandType", state.plan.demandType);
        App.setText("#stageSourceName", getSourceName());
        App.setText("#stageProductName", productNames);
        App.setText("#stageTotalQuantity", Number(quantity || state.plan.quantity || state.plan.totalQuantity || 0).toLocaleString());
        App.setText("#stagePlannedStart", App.formatDate(state.plan.plannedStartDate));
        App.setText("#stagePlannedCompletion", App.formatDate(state.plan.plannedCompletionDate));
        App.setText("#stageRequiredDate", App.formatDate(state.plan.requiredDate));
        App.setText("#stageCurrentStage", state.plan.status || "-");
    }

    function getSourceName() {
        const plan = state.plan;
        if (!plan) return "-";

        if (plan.sourceName) return plan.sourceName;

        if (plan.demandType === "Customer Order") {
            const customer = App.findById(state.customers, plan.customerId || plan.sourceId);
            return customer?.name || customer?.customerName || "-";
        }

        if (plan.demandType === "Outlet Replenishment") {
            const outlet = App.findById(state.outlets, plan.outletId || plan.sourceId);
            return outlet?.name || outlet?.outletName || "-";
        }

        const warehouse = App.findById(state.warehouses, plan.warehouseId || plan.sourceId);
        return warehouse?.name || warehouse?.warehouseName || "Internal Stock";
    }

    function renderStageDropdown() {
        const dropdown = document.getElementById("stageDropdown");
        if (!dropdown) return;

        const stages = getPlanStages();

        dropdown.innerHTML = `<option value="">Select Stage</option>` + stages.map(function (stage, index) {
            const id = stage.stageId || stage.id || `stage-${index + 1}`;
            const name = stage.stageName || stage.name;

            return `<option value="${App.escapeHtml(id)}">${App.escapeHtml(name)}</option>`;
        }).join("");
    }    function renderStageProgress() {
        const strip = document.getElementById("stageProgressStrip");
        if (!strip) return;

        if (!state.planProducts || state.planProducts.length === 0) {
            strip.innerHTML = "<div class='text-slate-400 text-sm'>No products to track.</div>";
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">';

        state.planProducts.forEach(product => {
            const stages = (product.stages && product.stages.length) ? product.stages : (state.plan.stages || state.stages);

            html += `
                <div style="background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.01);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-outlined" style="font-size: 16px; color: #64748b;">inventory_2</span>
                        <strong style="font-size: 13px; color: #334155; font-weight: 700;">${App.escapeHtml(product.productName)}</strong>
                        <span style="font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; font-weight: 700; padding: 2px 6px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px;">${App.escapeHtml(product.productId || product.productCode)}</span>
                    </div>
                    <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; padding-top: 2px; padding-left: 2px; padding-right: 2px;" class="scrollbar-thin">
            `;

            html += stages.map(function (stage) {
                const status = stage.status || "Not Started";
                
                let stepIcon = '<span class="material-symbols-outlined" style="font-size: 14px; color: #94a3b8;">radio_button_unchecked</span>';
                let badgeBg = "background: #f1f5f9; border: 1.5px solid #cbd5e1;";
                let textStyle = "color: #475569;";
                let containerBorder = "border: 1.5px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);";

                if (status === "Completed") {
                    stepIcon = '<span class="material-symbols-outlined" style="font-size: 14px; color: #15803d; font-weight: bold;">check</span>';
                    badgeBg = "background: #dcfce7; border: 1.5px solid #86efac;";
                    textStyle = "text-decoration: line-through; color: #94a3b8; font-weight: 500;";
                } else if (status === "Active" || status === "In Progress") {
                    stepIcon = '<span class="material-symbols-outlined" style="font-size: 14px; color: #1d4ed8; font-weight: bold; animation: spin 2s linear infinite;">sync</span>';
                    badgeBg = "background: #eff6ff; border: 1.5px solid #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15);";
                    textStyle = "color: #1e3a8a; font-weight: 700;";
                    containerBorder = "border: 1.5px solid #bfdbfe; box-shadow: 0 4px 12px rgba(37,99,235,0.06);";
                } else if (status === "On Hold") {
                    stepIcon = '<span class="material-symbols-outlined" style="font-size: 14px; color: #b91c1c; font-weight: bold;">warning</span>';
                    badgeBg = "background: #fef2f2; border: 1.5px solid #fca5a5;";
                    textStyle = "color: #991b1b; font-weight: 700;";
                }

                return `
                    <div class="stage-step flex-shrink-0" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; transition: all 0.2s; background: #ffffff; ${containerBorder}; min-width: 190px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ${badgeBg}">
                            ${stepIcon}
                        </div>
                        <div style="min-width: 0; flex: 1; text-align: left;">
                            <span style="display: block; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-family: monospace; margin-bottom: 2px;">
                                ${App.escapeHtml(status)}
                            </span>
                            <strong style="display: block; font-size: 13px; ${textStyle}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${App.escapeHtml(stage.stageName || stage.name)}
                            </strong>
                            <span style="display: block; font-size: 11px; color: #64748b; margin-top: 1px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${App.escapeHtml(stage.workCenter || stage.department || "-")}
                            </span>
                        </div>
                    </div>
                `;
            }).join("");

            html += `
                    </div>
                </div>
            `;
        });

        html += '</div>';

        strip.innerHTML = html;
        strip.className = "w-full stage-progress-strip"; 
    }

    function renderStageTable() {
        const body = document.getElementById("stageUpdateTableBody");
        if (!body) return;

        const stages = getPlanStages();

        if (!stages.length) {
            body.innerHTML = `<tr><td colspan="10" class="empty-cell">No production stages found.</td></tr>`;
            return;
        }

        body.innerHTML = stages.map(function (stage, index) {
            const id = stage.stageId || stage.id || `stage-${index + 1}`;

            return `
                <tr>
                    <td><strong>${App.escapeHtml(stage.stageName || stage.name)}</strong></td>
                    <td>${App.escapeHtml(stage.workCenter || stage.department || "-")}</td>
                    <td>${App.formatDate(stage.plannedStartDate || state.plan?.plannedStartDate)}</td>
                    <td>${App.formatDate(stage.plannedEndDate || state.plan?.plannedCompletionDate)}</td>
                    <td>${App.formatDate(stage.actualStartDate)}</td>
                    <td>${App.formatDate(stage.actualEndDate)}</td>
                    <td>${Number(stage.completedQty || 0).toLocaleString()}</td>
                    <td>${Number(stage.rejectedQty || 0).toLocaleString()}</td>
                    <td>${App.badge(stage.status || "Not Started")}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-primary" data-edit-stage="${App.escapeHtml(id)}">
                            Update
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        App.qsa("[data-edit-stage]", body).forEach(function (btn) {
            btn.addEventListener("click", function () {
                const id = btn.getAttribute("data-edit-stage");
                App.setValue("#stageDropdown", id);
                selectStage(id);
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    function selectStage(stageId) {
        const stages = getPlanStages();

        state.selectedStage = stages.find(function (stage, index) {
            const id = stage.stageId || stage.id || `stage-${index + 1}`;
            return String(id) === String(stageId);
        }) || null;

        if (!state.selectedStage) {
            clearForm(false);
            return;
        }

        App.setValue("#selectedStageNameInput", state.selectedStage.stageName || state.selectedStage.name);
        App.setValue("#stageStatus", state.selectedStage.status || "Not Started");
        App.setValue("#actualStartDate", App.toInputDate(state.selectedStage.actualStartDate));
        App.setValue("#actualEndDate", App.toInputDate(state.selectedStage.actualEndDate));
        App.setValue("#completedQty", state.selectedStage.completedQty || 0);
        App.setValue("#rejectedQty", state.selectedStage.rejectedQty || 0);
        App.setValue("#remarks", state.selectedStage.remarks || "");

        const plannedStart = state.selectedStage.plannedStartDate || state.plan?.plannedStartDate;
        const plannedEnd = state.selectedStage.plannedEndDate || state.plan?.plannedCompletionDate;

        App.setValue(
            "#stagePlannedDateRange",
            `${App.formatDate(plannedStart)} - ${App.formatDate(plannedEnd)}`
        );

        calculateActualDuration();
        validateStageForm();
    }

    function calculateActualDuration() {
        const start = App.value("#actualStartDate");
        const end = App.value("#actualEndDate");
        const days = Math.max(App.dateDiffDays(start, end), 0);

        App.setValue("#actualDuration", `${days} days`);
    }

    function validateStageForm() {
        const stageId = App.value("#stageDropdown");
        const status = App.value("#stageStatus");
        const actualStart = App.value("#actualStartDate");
        const actualEnd = App.value("#actualEndDate");
        const completedQty = App.number(App.value("#completedQty"));
        const rejectedQty = App.number(App.value("#rejectedQty"));
        const planQty = App.number(state.plan?.quantity || state.plan?.totalQuantity || 0);
        const totalProcessed = completedQty + rejectedQty;

        App.setValue("#totalProcessedQty", totalProcessed);

        const message = document.getElementById("stageValidationMessage");
        if (!message) return true;

        message.classList.remove("success", "warning", "danger");

        if (!stageId) {
            message.textContent = "Select a stage to update progress.";
            message.classList.add("warning");
            return false;
        }

        if (!status) {
            message.textContent = "Please select stage status.";
            message.classList.add("danger");
            return false;
        }

        if (actualStart && actualEnd && new Date(actualEnd) < new Date(actualStart)) {
            message.textContent = "Actual end date cannot be before actual start date.";
            message.classList.add("danger");
            return false;
        }

        if (status === "In Progress" && !actualStart) {
            message.textContent = "Actual start date is required when stage is in progress.";
            message.classList.add("danger");
            return false;
        }

        if (status === "Completed" && !actualEnd) {
            message.textContent = "Actual end date is required when stage is completed.";
            message.classList.add("danger");
            return false;
        }

        if (status === "Completed" && completedQty <= 0) {
            message.textContent = "Completed quantity must be greater than zero when stage is completed.";
            message.classList.add("danger");
            return false;
        }

        if (planQty > 0 && totalProcessed > planQty) {
            message.textContent = "Completed plus rejected quantity cannot exceed total plan quantity.";
            message.classList.add("danger");
            return false;
        }

        message.textContent = "Stage update looks valid.";
        message.classList.add("success");
        return true;
    }

    function clearForm(showToast) {
        App.setValue("#stageDropdown", "");
        App.setValue("#selectedStageNameInput", "");
        App.setValue("#stageStatus", "");
        App.setValue("#stagePlannedDateRange", "-");
        App.setValue("#actualStartDate", "");
        App.setValue("#actualEndDate", "");
        App.setValue("#actualDuration", "0 days");
        App.setValue("#completedQty", 0);
        App.setValue("#rejectedQty", 0);
        App.setValue("#totalProcessedQty", 0);
        App.setValue("#remarks", "");

        state.selectedStage = null;

        const message = document.getElementById("stageValidationMessage");
        if (message) {
            message.classList.remove("success", "danger");
            message.classList.add("warning");
            message.textContent = "Select a stage to update progress.";
        }

        if (showToast !== false) {
            App.toast("Stage form cleared.", "success");
        }
    }

    function normalizePlanProducts(plan) {
        const rawProducts = Array.isArray(plan.products) && plan.products.length
            ? plan.products
            : [plan];

        return rawProducts.map(function (product, index) {
            const catalogProduct = getCatalogProduct(product) || {};

            return {
                lineId: product.lineId || `${plan.planNo || plan.planId || "PLAN"}-${index + 1}`,
                productId: product.productId || plan.productId || catalogProduct.productId || catalogProduct.id || "",
                productCode: product.productCode || product.productId || plan.productId || catalogProduct.productCode || "",
                productName: product.productName || product.product || plan.productName || catalogProduct.productName || catalogProduct.name || "-",
                category: product.category || plan.category || catalogProduct.category || "-",
                variant: product.variant || product.color || plan.variant || plan.color || "-",
                quantity: Number(product.quantity || product.qty || plan.quantity || plan.totalQuantity || 0),
                sourceName: product.sourceName || product.source || plan.sourceName || "In-house Stock",
                requiredDate: product.requiredDate || plan.requiredDate || "",
                plannedStartDate: product.plannedStartDate || product.plannedStart || plan.plannedStartDate || "",
                plannedCompletionDate: product.plannedCompletionDate || product.plannedFinish || plan.plannedCompletionDate || "",
                status: product.status || plan.status || "Draft",
                priority: product.priority || plan.priority || "Normal",
                productImage: product.productImage || product.imagePath || product.image || catalogProduct.productImage || catalogProduct.imagePath || fallbackProductImage,
                productionNotes: product.productionNotes || plan.productionNotes || "",
                sizes: product.sizes || product.sizeBreakdown || plan.sizes || plan.sizeBreakdown || [],
                stages: product.stages || []
            };
        });
    }

    function getCatalogProduct(product) {
        const candidates = [
            product.productId,
            product.productCode,
            product.id,
            product.code
        ].filter(Boolean).map(String);

        return state.products.find(function (item) {
            return candidates.includes(String(item.id))
                || candidates.includes(String(item.productId))
                || candidates.includes(String(item.productCode))
                || candidates.includes(String(item.code));
        });
    }
})();