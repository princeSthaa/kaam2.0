(function () {
    "use strict";

    const root = document.querySelector("[data-production-folder]");
    if (!root) return;

    const folderType = root.getAttribute("data-production-folder") || "drafts";
    const searchInput = document.getElementById("folderSearchInput");
    const planList = document.getElementById("folderPlanList");
    const clearDraftsBtn = document.getElementById("clearDraftsBtn");
    const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
    const selectAllCheckbox = document.getElementById("selectAllDrafts");

    let plans = [];
    let localDrafts = [];
    let selectedPlanIds = new Set();

    document.addEventListener("DOMContentLoaded", init);

    async function init() {
        await refreshPlans();
        attachEvents();
        render();
    }

    function attachEvents() {
        if (searchInput) {
            searchInput.addEventListener("input", function () {
                selectedPlanIds.clear();
                updateSelectAllState();
                render();
            });
        }

        document.addEventListener("click", async function(event) {
            const clearBtn = event.target.closest("#clearDraftsBtn");
            if (clearBtn) {
                if (!confirm("Clear all production drafts (local and server)?")) return;

                if (window.ProductionDraftStore) {
                    window.ProductionDraftStore.clearDrafts();
                }

                const draftPlans = plans.filter(p => String(p.status || "").toLowerCase() === "draft");
                for (const plan of draftPlans) {
                    const id = plan.planNo || plan.planId || plan.id;
                    if (id) {
                        try {
                            await fetch(`http://localhost:5083/api/production-plans/${id}`, { method: "DELETE" });
                        } catch (e) {
                            console.error("Failed to delete from API:", e);
                        }
                        plans = plans.filter(p => String(p.planNo || p.planId || p.id) !== String(id));
                    }
                }

                selectedPlanIds.clear();
                updateSelectAllState();
                render();
                return;
            }

            const deleteBtn = event.target.closest("#deleteSelectedBtn");
            if (deleteBtn) {
                if (!selectedPlanIds.size) return;
                if (!confirm(`Delete ${selectedPlanIds.size} selected plan(s)?`)) return;

                const ids = Array.from(selectedPlanIds);
                
                if (window.ProductionDraftStore) {
                    window.ProductionDraftStore.deleteDrafts(ids);
                }

                for (const id of ids) {
                    try {
                        await fetch(`http://localhost:5083/api/production-plans/${id}`, { method: "DELETE" });
                    } catch (e) {
                        console.error("Failed to delete from API:", e);
                    }
                    plans = plans.filter(p => String(p.planNo || p.planId || p.id) !== String(id));
                }

                selectedPlanIds.clear();
                updateSelectAllState();
                render();
                return;
            }
        });

        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener("change", function () {
                const filtered = getFilteredPlans();
                if (selectAllCheckbox.checked) {
                    filtered.forEach(function (plan) {
                        const id = plan.planNo || plan.planId || plan.id;
                        selectedPlanIds.add(String(id));
                    });
                } else {
                    selectedPlanIds.clear();
                }
                render();
            });
        }
    }

    function updateSelectAllState() {
        const currentSelectAllCheckbox = document.getElementById("selectAllDrafts");
        if (!currentSelectAllCheckbox) return;

        const filtered = getFilteredPlans();
        if (!filtered.length) {
            currentSelectAllCheckbox.checked = false;
            currentSelectAllCheckbox.disabled = true;
            return;
        }

        currentSelectAllCheckbox.disabled = false;
        currentSelectAllCheckbox.checked = filtered.every(function (plan) {
            const id = plan.planNo || plan.planId || plan.id;
            return selectedPlanIds.has(String(id));
        });
    }

    async function refreshPlans() {
        let basePlans = [];
        try {
            const res = await fetch("http://localhost:5083/api/production-plans");
            if (res.ok) {
                basePlans = await res.json();
            } else {
                basePlans = App.getData("mockProductionPlans", "productionPlans", "plans");
            }
        } catch (e) {
            basePlans = App.getData("mockProductionPlans", "productionPlans", "plans");
        }

        localDrafts = window.ProductionDraftStore && typeof window.ProductionDraftStore.getDrafts === "function"
            ? window.ProductionDraftStore.getDrafts()
            : [];

        plans = mergePlans(basePlans, localDrafts);
    }

    function render() {
        const filteredPlans = getFilteredPlans();
        renderSummary(filteredPlans);
        renderPlanList(filteredPlans);
        updateSelectAllState();

        const currentClearBtn = document.getElementById("clearDraftsBtn");
        const currentDeleteBtn = document.getElementById("deleteSelectedBtn");

        if (currentClearBtn) {
            currentClearBtn.disabled = !localDrafts.length;
        }

        if (currentDeleteBtn) {
            if (selectedPlanIds.size > 0) {
                currentDeleteBtn.classList.remove("hidden");
                currentDeleteBtn.disabled = false;
            } else {
                currentDeleteBtn.classList.add("hidden");
                currentDeleteBtn.disabled = true;
            }
        }
    }

    function getFilteredPlans() {
        let filtered = plans.filter(function (plan) {
            const status = String(plan.status || "").toLowerCase();

            if (folderType === "drafts") {
                return status === "draft";
            }

            if (folderType === "completed") {
                return status === "completed";
            }

            return status !== "draft" && status !== "completed" && status !== "cancelled";
        });

        const searchValue = String(searchInput?.value || "").trim().toLowerCase();
        if (searchValue) {
            filtered = filtered.filter(function (plan) {
                return [
                    plan.planNo,
                    plan.planId,
                    plan.id,
                    plan.demandType,
                    plan.sourceName,
                    plan.status,
                    getProductSummary(plan)
                ].join(" ").toLowerCase().includes(searchValue);
            });
        }

        return filtered.sort(sortPlans);
    }

    function renderSummary(filteredPlans) {
        App.setText("#folderPlanCount", filteredPlans.length);
        App.setText("#folderTotalQty", formatNumber(filteredPlans.reduce(function (sum, plan) {
            return sum + getPlanQuantity(plan);
        }, 0)));

        const demandTypes = filteredPlans.map(function (plan) {
            return plan.demandType || "Unassigned";
        }).filter(function (value, index, list) {
            return list.indexOf(value) === index;
        });

        App.setText("#folderDemandCount", demandTypes.length);
    }

    function renderPlanList(filteredPlans) {
        if (!planList) return;

        if (!filteredPlans.length) {
            planList.innerHTML = `
                <div class="draft-empty-state">
                    <span class="material-symbols-outlined">${getEmptyIcon()}</span>
                    <strong>${App.escapeHtml(getEmptyTitle())}</strong>
                    <p>${App.escapeHtml(getEmptyText())}</p>
                </div>
            `;
            return;
        }

        planList.innerHTML = filteredPlans.map(function (plan) {
            const planNo = plan.planNo || plan.planId || plan.id || "Production Plan";
            const isLocal = isLocalDraft(planNo);
            const status = plan.status || "Draft";
            const productSummary = getProductSummary(plan);
            const rowDate = plan.lastEditedAt || plan.draftSavedAt || plan.plannedStartDate || plan.planDate || plan.requiredDate;
            const encodedPlanNo = encodeURIComponent(planNo);
            const detailsUrl = `/Production/Plan/Details?planNo=${encodedPlanNo}`;
            const editUrl = `/Production/Plan/Edit?planNo=${encodedPlanNo}`;
            const primaryUrl = folderType === "drafts" ? editUrl : detailsUrl;
            const primaryText = folderType === "drafts" ? "Resume" : "Details";
            const isSelected = selectedPlanIds.has(String(planNo));

            return `
                <article class="folder-plan-row ${isLocal ? "local-draft" : ""} ${isSelected ? "selected" : ""} ${!selectAllCheckbox ? "no-selection" : ""}">
                    ${selectAllCheckbox ? `
                    <div class="folder-plan-checkbox">
                        <input type="checkbox"
                               class="plan-row-checkbox"
                               data-plan-id="${App.escapeHtml(planNo)}"
                               ${isSelected ? "checked" : ""} />
                    </div>
                    ` : ""}

                    <span class="material-symbols-outlined folder-plan-icon">${getPlanIcon(plan)}</span>

                    <div class="folder-plan-main">
                        <div class="folder-plan-subject">
                            <strong>${App.escapeHtml(planNo)}</strong>
                            <span class="status-badge ${App.statusClass(status)}">${App.escapeHtml(status)}</span>
                            <em>${App.escapeHtml(plan.demandType || "Production")}</em>
                        </div>

                        <p>
                            <span>${App.escapeHtml(plan.sourceName || "Production Source")}</span>
                            ${App.escapeHtml(productSummary)} - ${formatNumber(getPlanQuantity(plan))} pcs
                        </p>
                    </div>

                    <time class="folder-plan-date">${App.escapeHtml(formatFolderDate(rowDate))}</time>

                    <div class="folder-plan-actions">
                        <a class="btn btn-light btn-sm" href="${App.escapeHtml(primaryUrl)}">${primaryText}</a>
                        <a class="btn btn-primary btn-sm" href="${App.escapeHtml(detailsUrl)}">Details</a>
                        ${folderType === "drafts" ? `
                            <a class="btn btn-light btn-sm" href="${App.escapeHtml(editUrl)}">Edit</a>
                            <button type="button" class="btn btn-success btn-sm font-bold" data-activate-plan="${App.escapeHtml(planNo)}">Activate</button>
                        ` : ""}
                        ${isLocal ? `
                            <button type="button"
                                    class="icon-only-btn"
                                    data-delete-draft="${App.escapeHtml(planNo)}"
                                    aria-label="Delete ${App.escapeHtml(planNo)}">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        ` : ""}
                    </div>
                </article>
            `;
        }).join("");

        planList.querySelectorAll(".plan-row-checkbox").forEach(function (checkbox) {
            checkbox.addEventListener("change", function () {
                const id = checkbox.getAttribute("data-plan-id");
                if (checkbox.checked) {
                    selectedPlanIds.add(String(id));
                } else {
                    selectedPlanIds.delete(String(id));
                }
                render();
            });
        });

        planList.querySelectorAll("[data-delete-draft]").forEach(function (button) {
            button.addEventListener("click", async function () {
                const planNo = button.getAttribute("data-delete-draft");
                if (!planNo) return;

                if (!confirm(`Delete draft ${planNo}?`)) return;

                if (window.ProductionDraftStore) {
                    window.ProductionDraftStore.deleteDraft(planNo);
                }
                
                try {
                    await fetch(`http://localhost:5083/api/production-plans/${planNo}`, { method: "DELETE" });
                } catch (e) {
                    console.error("Failed to delete from API:", e);
                }

                plans = plans.filter(p => String(p.planNo || p.planId || p.id) !== String(planNo));
                selectedPlanIds.delete(String(planNo));
                render();
            });
        });

        planList.querySelectorAll("[data-activate-plan]").forEach(function (button) {
            button.addEventListener("click", async function () {
                const planNo = button.getAttribute("data-activate-plan");
                if (!planNo) return;

                if (!confirm(`Activate plan ${planNo} and release to production?`)) return;

                const plan = plans.find(p => String(p.planNo || p.planId || p.id) === String(planNo));
                if (!plan) return;

                if (!plan.batchId) {
                    plan.batchId = "BCH-" + Math.floor(10000 + Math.random() * 90000);
                }
                plan.status = "Active";

                try {
                    const res = await fetch(`http://localhost:5083/api/production-plans/${plan.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(plan)
                    });
                    if (res.ok) {
                        App.toast(`Plan ${planNo} successfully activated!`, "success");
                    } else {
                        throw new Error();
                    }
                } catch (e) {
                    console.error("Failed to activate plan via API:", e);
                    App.toast("Error saving plan status to server.", "danger");
                }

                await refreshPlans();
                render();
            });
        });
    }

    function mergePlans(basePlans, draftPlans) {
        const map = {};

        (Array.isArray(basePlans) ? basePlans : []).concat(Array.isArray(draftPlans) ? draftPlans : []).forEach(function (plan) {
            const key = plan.planNo || plan.planId || plan.id;
            if (!key) return;

            map[key] = plan;
        });

        return Object.values(map);
    }

    function isLocalDraft(planNo) {
        return localDrafts.some(function (draft) {
            return String(draft.planNo || draft.planId || draft.id) === String(planNo);
        });
    }

    function sortPlans(left, right) {
        const leftDate = new Date(left.lastEditedAt || left.draftSavedAt || left.plannedStartDate || left.planDate || 0);
        const rightDate = new Date(right.lastEditedAt || right.draftSavedAt || right.plannedStartDate || right.planDate || 0);

        return rightDate - leftDate;
    }

    function getPlanQuantity(plan) {
        if (plan.totalQuantity || plan.quantity) {
            return Number(plan.totalQuantity || plan.quantity || 0);
        }

        const products = Array.isArray(plan.products) ? plan.products : [];
        return products.reduce(function (sum, product) {
            return sum + Number(product.quantity || product.suggestedQty || product.qty || 0);
        }, 0);
    }

    function getProductSummary(plan) {
        const products = Array.isArray(plan.products) && plan.products.length
            ? plan.products
            : [plan];

        const names = products.map(function (product) {
            return product.productName || product.product || plan.productName || "Product";
        }).filter(Boolean);

        const uniqueNames = names.filter(function (name, index, list) {
            return list.indexOf(name) === index;
        });

        if (!uniqueNames.length) {
            return plan.productName || "Production items";
        }

        return uniqueNames.length > 2
            ? `${uniqueNames.slice(0, 2).join(", ")} +${uniqueNames.length - 2} more`
            : uniqueNames.join(", ");
    }

    function getPlanIcon(plan) {
        const status = String(plan.status || "").toLowerCase();
        const demandType = String(plan.demandType || "").toLowerCase();

        if (status === "draft") return "edit_note";
        if (status === "completed") return "task_alt";
        if (demandType.includes("customer")) return "person";
        if (demandType.includes("outlet")) return "storefront";
        if (demandType.includes("house") || demandType.includes("stock")) return "inventory_2";

        return "precision_manufacturing";
    }

    function getEmptyIcon() {
        if (folderType === "completed") return "task_alt";
        if (folderType === "in-progress") return "precision_manufacturing";
        return "edit_note";
    }

    function getEmptyTitle() {
        if (folderType === "completed") return "No completed plans";
        if (folderType === "in-progress") return "No in-progress plans";
        return "No drafts found";
    }

    function getEmptyText() {
        if (folderType === "completed") return "Completed production plans will appear here.";
        if (folderType === "in-progress") return "Plans that have left Draft status will appear here.";
        return "Plans added from Customer, Outlet, or In-house create screens will appear here.";
    }

    function formatFolderDate(value) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit"
            });
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("en-US", {
            maximumFractionDigits: 2
        });
    }
})();
