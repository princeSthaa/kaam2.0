(function () {
    "use strict";

    const fallbackProductImage = "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=640&q=80";

    const state = {
        plans: [],
        products: [],
        customers: [],
        outlets: [],
        warehouses: [],
        materials: [],
        bom: [],
        stages: [],
        plan: null,
        planProducts: [],
        selectedProductIndex: 0
    };

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        state.plans = getAvailablePlans();
        state.products = App.getData("products", "mockProducts", "productData");
        state.customers = App.getData("customers", "mockCustomers", "customerData", "customerMasterData", "customerOrderCatalogData");
        state.outlets = App.getData("outlets", "mockOutlets", "outletData");
        state.warehouses = App.getData("warehouses", "mockWarehouses", "warehouseData");
        state.materials = App.getData("materials", "mockMaterials", "materialData");
        state.bom = App.getData("bomMasterData", "bomData", "boms", "bom", "mockBom", "billOfMaterials", "bomItems");
        state.stages = App.getData("productionStages", "mockProductionStages", "stages");

        bindTabs();
        loadPlan();
        renderDetails();
    }

    function bindTabs() {
        App.qsa(".pp-tab").forEach(function (tab) {
            tab.addEventListener("click", function () {
                const target = tab.getAttribute("data-tab");

                App.qsa(".pp-tab").forEach(function (item) {
                    item.classList.remove("active");
                });

                App.qsa(".pp-tab-panel").forEach(function (panel) {
                    panel.classList.remove("active");
                });

                tab.classList.add("active");
                const panel = document.getElementById(target);
                if (panel) panel.classList.add("active");
            });
        });
    }

    function loadPlan() {
        const id = getSelectedPlanId();
        state.plan = App.findById(state.plans, id) || state.plans[0] || null;
        state.planProducts = state.plan ? normalizePlanProducts(state.plan) : [];
    }

    function getAvailablePlans() {
        const basePlans = App.getData("mockProductionPlans", "productionPlans", "plans");

        if (window.ProductionDraftStore && typeof window.ProductionDraftStore.mergeWithPlans === "function") {
            return window.ProductionDraftStore.mergeWithPlans(basePlans);
        }

        return basePlans;
    }

    function getSelectedPlanId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("planNo") || params.get("planId") || params.get("id") || App.value("#selectedPlanId");
    }

    function renderDetails() {
        if (!state.plan) {
            App.setText("#detailsPlanNo", "Plan not found");
            App.setText("#detailsPlanSubtitle", "No matching mock production plan was found.");
            return;
        }

        renderSummary();
        renderOverview();
        renderSourceDetails();
        renderMaterials();
        renderStages();
        renderSizes();
        renderActivity();
    }

    function renderSummary() {
        const plan = state.plan;
        const products = state.planProducts;
        const productLabel = getProductSummaryLabel(products);

        App.setText("#detailsPlanNo", plan.planNo || plan.planId);
        App.setText("#detailsPlanSubtitle", `${getSourceName()} | ${plan.demandType || "-"}`);

        const badge = document.getElementById("detailsStatusBadge");
        if (badge) badge.outerHTML = App.badge(plan.status);

        App.setText("#summaryDemandType", plan.demandType);
        App.setText("#summarySourceName", getSourceName());
        App.setText("#summaryProduct", productLabel);
        App.setText("#summaryQuantity", formatNumber(getPlanQuantity()));
        App.setText("#summaryStartDate", App.formatDate(plan.plannedStartDate || getMinProductDate("plannedStartDate")));
        App.setText("#summaryCompletionDate", App.formatDate(plan.plannedCompletionDate || getMaxProductDate("plannedCompletionDate")));
        App.setText("#summaryRequiredDate", App.formatDate(plan.requiredDate || getMaxProductDate("requiredDate")));
        App.setText("#summaryPriority", plan.priority || "Normal");
    }

    function renderOverview() {
        const plan = state.plan;

        App.setText("#overviewPlanNo", plan.planNo || plan.planId);
        App.setText("#overviewPlanDate", App.formatDate(plan.planDate));
        App.setText("#overviewDemandType", plan.demandType);
        App.setText("#overviewSourceName", getSourceName());
        App.setText("#overviewOutputDestination", plan.outputDestination || "-");
        App.setText("#overviewStatus", plan.status);

        App.setText("#detailsProductCount", state.planProducts.length);
        App.setText("#detailsSizeProductCount", state.planProducts.length);

        renderProductSidebarList("detailsProductList");
        renderProductSidebarList("detailsSizeProductList");
        renderActiveProductDetail();
        renderProductSizeBreakdown();

        App.setText("#datePlanDate", App.formatDate(plan.planDate));
        App.setText("#dateStartDate", App.formatDate(plan.plannedStartDate || getMinProductDate("plannedStartDate")));
        App.setText("#dateCompletionDate", App.formatDate(plan.plannedCompletionDate || getMaxProductDate("plannedCompletionDate")));
        App.setText("#dateRequiredDate", App.formatDate(plan.requiredDate || getMaxProductDate("requiredDate")));
        App.setText("#dateBufferDays", `${Math.max(App.dateDiffDays(plan.plannedCompletionDate, plan.requiredDate), 0)} days`);
    }

    function renderProductSidebarList(elementId) {
        const list = document.getElementById(elementId);
        if (!list) return;

        if (!state.planProducts.length) {
            list.innerHTML = `<div class="empty-cell">No products found for this plan.</div>`;
            return;
        }

        list.innerHTML = state.planProducts.map(function (product, index) {
            const isActive = index === state.selectedProductIndex;
            const activeClass = isActive ? "active" : "";
            const paletteSummary = getProductPaletteSummary(product);
            const variantPreview = renderPalettePreviewHtml(paletteSummary, { compact: true, inline: true });
            const image = product.productImage || getCatalogProduct(product)?.productImage || getCatalogProduct(product)?.imagePath || fallbackProductImage;

            return `
                <button type="button" 
                        class="horizontal-product-card ${activeClass}" 
                        data-product-index="${index}"
                        role="option" 
                        aria-selected="${isActive}">
                    <span class="card-badge">${index + 1}</span>
                    <img src="${App.escapeHtml(image)}" alt="${App.escapeHtml(product.productName)}" onerror="this.src='${fallbackProductImage}'" />
                    <div class="card-content">
                        <strong class="card-title">${App.escapeHtml(product.productName)}</strong>
                        <span class="card-subtitle">${App.escapeHtml(product.productCode || product.productId || "-")}</span>
                        <div class="card-palette">
                            <span class="product-editor-list-variant" ${variantPreview ? "hidden" : ""}>
                                ${App.escapeHtml(paletteSummary)}
                            </span>
                            <span class="palette-preview-host product-editor-list-preview" ${variantPreview ? "" : "hidden"}>
                                ${variantPreview}
                            </span>
                        </div>
                        <div class="card-qty-row">
                            <strong class="card-qty">${formatNumber(product.quantity)} pcs</strong>
                            <em class="card-date">Req ${App.formatDate(product.requiredDate)}</em>
                        </div>
                    </div>
                </button>
            `;
        }).join("");

        list.querySelectorAll("[data-product-index]").forEach(function (button) {
            button.addEventListener("click", function () {
                const index = parseInt(this.getAttribute("data-product-index"), 10);
                selectProduct(index);
            });
        });
    }

    function selectProduct(index) {
        state.selectedProductIndex = index;
        renderProductSidebarList("detailsProductList");
        renderProductSidebarList("detailsSizeProductList");
        renderActiveProductDetail();
        renderProductSizeBreakdown();
    }

    function renderActiveProductDetail() {
        const detailHost = document.getElementById("activeProductDetail");
        if (!detailHost) return;

        const product = state.planProducts[state.selectedProductIndex];
        if (!product) {
            detailHost.innerHTML = `
                <div class="product-editor-empty detail">
                    Select a product from the list to view details.
                </div>
            `;
            return;
        }

        const image = product.productImage || getCatalogProduct(product)?.productImage || getCatalogProduct(product)?.imagePath || fallbackProductImage;
        const variantQuantitySummaryHtml = getVariantQuantitySummaryHtml(product);
        const paletteSummary = getProductPaletteSummary(product);
        const sizeRows = getSizeColorRows(product);
        const sizeTotal = sizeRows.reduce((sum, row) => sum + Number(row.quantity || 0), 0);

        const planStages = state.plan.stages && state.plan.stages.length
            ? state.plan.stages
            : state.stages;

        const activeStage = planStages.find(function (stage) {
            return stage.status === "In Progress" || stage.status === "On Hold";
        }) || planStages.find(function (stage) {
            return stage.status === state.plan.status;
        }) || planStages[0];

        const activeStageName = activeStage ? (activeStage.stageName || activeStage.name || "Material Check") : "Material Check";
        const activeStageWorkCenter = activeStage ? (activeStage.workCenter || activeStage.department || "Raw Material Store") : "Raw Material Store";
        const activeStageStatus = activeStage ? (activeStage.status || "Not Started") : "Not Started";
        const completedQty = activeStage ? (activeStage.completedQty || 0) : 0;
        const planTotalQty = getPlanQuantity();
        const percent = Math.min(100, Math.round((completedQty / Math.max(planTotalQty, 1)) * 100));

        detailHost.innerHTML = `
            <div class="product-editor-detail-head">
                <img src="${App.escapeHtml(image)}"
                     alt="${App.escapeHtml(product.productName)}"
                     onerror="this.src='${fallbackProductImage}'" />

                <div>
                    <span>Product ${state.selectedProductIndex + 1} of ${state.planProducts.length}</span>
                    <h4>${App.escapeHtml(product.productName)}</h4>
                    <p>${App.escapeHtml(product.productCode || product.productId || "-")} | ${App.escapeHtml(product.sourceName || getSourceName())}</p>
                </div>

                <div class="product-editor-nav">
                    <button type="button" class="icon-only-btn prev-product-btn" ${state.selectedProductIndex === 0 ? "disabled" : ""}>
                        <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button type="button" class="icon-only-btn next-product-btn" ${state.selectedProductIndex === state.planProducts.length - 1 ? "disabled" : ""}>
                        <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>

            <div class="product-editor-metrics">
                <div>
                    <span>Category</span>
                    <strong>${App.escapeHtml(product.category || "-")}</strong>
                </div>
                <div>
                    <span>Planned Quantity</span>
                    <strong>${formatNumber(product.quantity)} pcs</strong>
                </div>
                <div>
                    <span>Breakdown Total</span>
                    <strong>${formatNumber(sizeTotal)} pcs</strong>
                </div>
            </div>

            <div class="floor-progress-card mt-15 mb-15">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
                    <div>
                        <span style="display: block; font-size: 11px; font-weight: 800; color: var(--pp-muted); margin-bottom: 2px;">CURRENT STAGE</span>
                        <strong>${App.escapeHtml(activeStageName)}</strong>
                        <em style="display: block; font-size: 11px; color: var(--pp-muted); font-style: normal; margin-top: 2px;">
                            ${App.escapeHtml(activeStageWorkCenter)}
                        </em>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: block; font-size: 11px; font-weight: 800; color: var(--pp-muted); margin-bottom: 2px;">STAGE STATUS</span>
                        <span class="status-badge status-${activeStageStatus.toLowerCase().replaceAll(" ", "-")}">${App.escapeHtml(activeStageStatus)}</span>
                    </div>
                </div>
                <div class="floor-progress-track">
                    <span style="width: ${percent}%"></span>
                </div>
                <p class="floor-progress-text" style="margin: 8px 0 0; color: var(--pp-muted); font-size: 12px; font-weight: 800;">
                    ${percent}% completed in this stage (${formatNumber(completedQty)} / ${formatNumber(planTotalQty)} pcs)
                </p>
            </div>

            <div class="plan-product-meta-grid">
                <div>
                    <span>Variant / Palette</span>
                    <strong>${App.escapeHtml(paletteSummary)}</strong>
                    ${renderPalettePreviewHtml(paletteSummary)}
                </div>
                <div>
                    <span>Required Date</span>
                    <strong>${App.formatDate(product.requiredDate)}</strong>
                </div>
                <div>
                    <span>Planned Start</span>
                    <strong>${App.formatDate(product.plannedStartDate)}</strong>
                </div>
                <div>
                    <span>Planned Completion</span>
                    <strong>${App.formatDate(product.plannedCompletionDate)}</strong>
                </div>
                <div class="full-meta">
                    <span>Variant Quantities</span>
                    <div class="variant-qty-summary-list">
                        ${variantQuantitySummaryHtml}
                    </div>
                </div>
                <div class="full-meta">
                    <span>Production Notes</span>
                    <p class="mt-5">${App.escapeHtml(product.productionNotes || "No specific production notes for this item.")}</p>
                </div>
            </div>
        `;

        detailHost.querySelectorAll(".prev-product-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                if (state.selectedProductIndex > 0) selectProduct(state.selectedProductIndex - 1);
            });
        });

        detailHost.querySelectorAll(".next-product-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                if (state.selectedProductIndex < state.planProducts.length - 1) selectProduct(state.selectedProductIndex + 1);
            });
        });
    }

    function renderProductSizeBreakdown() {
        const detailHost = document.getElementById("activeSizeProductDetail");
        if (!detailHost) return;

        const product = state.planProducts[state.selectedProductIndex];
        if (!product) {
            detailHost.innerHTML = `
                <div class="product-editor-empty detail">
                    Select a product from the list to view its size breakdown.
                </div>
            `;
            return;
        }

        const paletteSummary = getProductPaletteSummary(product);
        const rows = getSizeColorRows(product);
        const total = rows.reduce(function (sum, row) {
            return sum + Number(row.quantity || 0);
        }, 0);
        const image = product.productImage || getCatalogProduct(product)?.productImage || getCatalogProduct(product)?.imagePath || fallbackProductImage;

        detailHost.innerHTML = `
            <div class="product-editor-detail-head">
                <img src="${App.escapeHtml(image)}"
                     alt="${App.escapeHtml(product.productName)}"
                     onerror="this.src='${fallbackProductImage}'" />

                <div>
                    <span>Product ${state.selectedProductIndex + 1} of ${state.planProducts.length}</span>
                    <h4>${App.escapeHtml(product.productName)}</h4>
                    <p>${App.escapeHtml(product.productCode || product.productId || "-")} | ${App.escapeHtml(paletteSummary)}</p>
                    ${renderPalettePreviewHtml(paletteSummary, { compact: true })}
                </div>

                <div class="product-editor-nav">
                    <button type="button" class="icon-only-btn prev-product-btn" ${state.selectedProductIndex === 0 ? "disabled" : ""}>
                        <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button type="button" class="icon-only-btn next-product-btn" ${state.selectedProductIndex === state.planProducts.length - 1 ? "disabled" : ""}>
                        <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>

            <div class="product-size-editor-panel">
                <div class="product-size-editor-head">
                    <h5>Size Breakdown</h5>
                    <strong>${formatNumber(total)} pcs</strong>
                </div>

                <div class="product-size-table-scroll">
                    <table class="variant-breakdown-table">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Palette / Variant</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map(function (row) {
                                return `
                                    <tr>
                                        <td>${App.escapeHtml(row.size)}</td>
                                        <td>${renderProductColorChip(product, row)}</td>
                                        <td>${formatNumber(row.quantity)}</td>
                                    </tr>
                                `;
                            }).join("") || `<tr><td colspan="3" class="empty-cell">No size/color variants.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        detailHost.querySelectorAll(".prev-product-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                if (state.selectedProductIndex > 0) selectProduct(state.selectedProductIndex - 1);
            });
        });

        detailHost.querySelectorAll(".next-product-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                if (state.selectedProductIndex < state.planProducts.length - 1) selectProduct(state.selectedProductIndex + 1);
            });
        });
    }

    function getSourceName() {
        const plan = state.plan;
        return plan.sourceName
            || plan.customerName
            || plan.outletName
            || plan.warehouseName
            || getSourceObject()?.name
            || getSourceObject()?.customerName
            || getSourceObject()?.outletName
            || getSourceObject()?.warehouseName
            || "-";
    }

    function getSourceObject() {
        const plan = state.plan;

        if (plan.demandType === "Customer Order") {
            return App.findById(state.customers, plan.customerId || plan.sourceId);
        }

        if (plan.demandType === "Outlet Replenishment") {
            return App.findById(state.outlets, plan.outletId || plan.sourceId);
        }

        if (plan.demandType === "In-house Stock") {
            return App.findById(state.warehouses, plan.warehouseId || plan.sourceId);
        }

        return null;
    }

    function renderSourceDetails() {
        const source = getSourceObject() || {};
        const plan = state.plan;

        if (plan.demandType === "Customer Order") {
            App.setText("#sourceDetailTitle", "Customer Details");
            App.setText("#sourceCode", source.customerCode || source.code || plan.sourceId);
            App.setText("#sourceDetailName", source.name || source.customerName || plan.sourceName);
            App.setText("#sourcePhone", source.phone);
            App.setText("#sourceLocation", source.deliveryLocation || source.address);
            App.setText("#sourceExtra", source.paymentTerms || "Payment terms not set");
            return;
        }

        if (plan.demandType === "Outlet Replenishment") {
            App.setText("#sourceDetailTitle", "Outlet Details");
            App.setText("#sourceCode", source.outletCode || source.code || plan.sourceId);
            App.setText("#sourceDetailName", source.name || source.outletName || plan.sourceName);
            App.setText("#sourcePhone", source.phone);
            App.setText("#sourceLocation", source.location);
            App.setText("#sourceExtra", source.manager ? `Manager: ${source.manager}` : "-");
            return;
        }

        App.setText("#sourceDetailTitle", "In-house Stock Details");
        App.setText("#sourceCode", source.warehouseCode || source.code || plan.warehouseId);
        App.setText("#sourceDetailName", source.name || source.warehouseName || plan.sourceName || "Internal Stock");
        App.setText("#sourcePhone", source.phone || "-");
        App.setText("#sourceLocation", source.location || "-");
        App.setText("#sourceExtra", plan.inHouseReason || plan.reason || "Stock Replenishment");
    }

    function renderMaterials() {
        const body = document.getElementById("detailsMaterialBody");
        if (!body) return;

        const rows = calculateMaterialRequirements(state.planProducts);

        if (!rows.length) {
            body.innerHTML = `<tr><td colspan="8" class="empty-cell">No BOM found for the products in this plan.</td></tr>`;
            return;
        }

        body.innerHTML = rows.map(function (row) {
            const status = row.shortageQty > 0 ? "Shortage" : "OK";

            return `
                <tr>
                    <td>${App.escapeHtml(row.materialCode)}</td>
                    <td><strong>${App.escapeHtml(row.materialName)}</strong></td>
                    <td>${App.escapeHtml(row.materialType)}</td>
                    <td>${row.requiredQty.toFixed(2)}</td>
                    <td>${row.availableQty.toFixed(2)}</td>
                    <td>${row.shortageQty.toFixed(2)}</td>
                    <td>${App.escapeHtml(row.unit)}</td>
                    <td>${App.badge(status)}</td>
                </tr>
            `;
        }).join("");
    }

    function renderStages() {
        const body = document.getElementById("detailsStagesBody");
        const strip = document.getElementById("stageProgressStrip");
        if (!body || !strip) return;

        const planStages = state.plan.stages && state.plan.stages.length
            ? state.plan.stages
            : state.stages;

        strip.innerHTML = planStages.map(function (stage) {
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
                <div class="stage-step" style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 12px; transition: all 0.2s; background: #ffffff; ${containerBorder}">
                    <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ${badgeBg}">
                        ${stepIcon}
                    </div>
                    <div style="min-width: 0; flex: 1; text-align: left;">
                        <span style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-family: monospace; margin-bottom: 2px;">
                            ${App.escapeHtml(status)}
                        </span>
                        <strong style="display: block; font-size: 13.5px; ${textStyle}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${App.escapeHtml(stage.stageName || stage.name)}
                        </strong>
                        <span style="display: block; font-size: 11px; color: #64748b; margin-top: 1px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${App.escapeHtml(stage.workCenter || stage.department || "-")}
                        </span>
                    </div>
                </div>
            `;
        }).join("");

        body.innerHTML = planStages.map(function (stage) {
            return `
                <tr>
                    <td><strong>${App.escapeHtml(stage.stageName || stage.name)}</strong></td>
                    <td>${App.escapeHtml(stage.workCenter || stage.department || "-")}</td>
                    <td>${App.formatDate(stage.plannedStartDate || state.plan.plannedStartDate)}</td>
                    <td>${App.formatDate(stage.plannedEndDate || state.plan.plannedCompletionDate)}</td>
                    <td>${App.formatDate(stage.actualStartDate)}</td>
                    <td>${App.formatDate(stage.actualEndDate)}</td>
                    <td>${formatNumber(stage.completedQty || 0)}</td>
                    <td>${formatNumber(stage.rejectedQty || 0)}</td>
                    <td>${App.badge(stage.status || "Not Started")}</td>
                </tr>
            `;
        }).join("");
    }

    function renderSizes() {
        const totalsBySize = {};
        let sizeTotal = 0;

        state.planProducts.forEach(function (product) {
            getSizeColorRows(product).forEach(function (row) {
                totalsBySize[row.size] = (totalsBySize[row.size] || 0) + Number(row.quantity || 0);
                sizeTotal += Number(row.quantity || 0);
            });
        });

        App.setText("#sizeXS", totalsBySize.XS || 0);
        App.setText("#sizeS", totalsBySize.S || 0);
        App.setText("#sizeM", totalsBySize.M || 0);
        App.setText("#sizeL", totalsBySize.L || 0);
        App.setText("#sizeXL", totalsBySize.XL || 0);
        App.setText("#sizeXXL", totalsBySize.XXL || 0);
        App.setText("#detailsSizeTotal", formatNumber(sizeTotal));
        App.setText("#detailsPlanQuantity", formatNumber(getPlanQuantity()));

        const msg = document.getElementById("detailsSizeMessage");
        if (msg) {
            msg.classList.remove("success", "warning", "danger");

            if (sizeTotal === getPlanQuantity()) {
                msg.textContent = "Size and color breakdown matches plan quantity.";
                msg.classList.add("success");
            } else {
                msg.textContent = `Size total does not match plan quantity. Difference: ${formatNumber(getPlanQuantity() - sizeTotal)}`;
                msg.classList.add("danger");
            }
        }

        renderProductSizeBreakdown();
    }

    function renderActivity() {
        const timeline = document.getElementById("activityTimeline");
        if (!timeline) return;

        const activities = state.plan.activities || [
            {
                title: "Plan created",
                text: `${state.plan.planNo || state.plan.planId} was created as a mock production plan.`
            },
            {
                title: "Material requirement calculated",
                text: "BOM and material master data were used for material preview."
            },
            {
                title: "Stage plan generated",
                text: "Default garment production stages were loaded for this plan."
            }
        ];

        timeline.innerHTML = activities.map(function (item) {
            return `
                <div class="activity-item">
                    <span class="activity-dot"></span>
                    <div>
                        <strong>${App.escapeHtml(item.title)}</strong>
                        <p>${App.escapeHtml(item.text || item.description || "")}</p>
                    </div>
                </div>
            `;
        }).join("");
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
                sourceName: product.sourceName || product.source || plan.sourceName || getSourceName(),
                requiredDate: product.requiredDate || plan.requiredDate || "",
                plannedStartDate: product.plannedStartDate || product.plannedStart || plan.plannedStartDate || "",
                plannedCompletionDate: product.plannedCompletionDate || product.plannedFinish || plan.plannedCompletionDate || "",
                status: product.status || plan.status || "Draft",
                priority: product.priority || plan.priority || "Normal",
                productImage: product.productImage || product.imagePath || product.image || catalogProduct.productImage || catalogProduct.imagePath || fallbackProductImage,
                productionNotes: product.productionNotes || plan.productionNotes || "",
                sizes: product.sizes || product.sizeBreakdown || plan.sizes || plan.sizeBreakdown || []
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

    function calculateMaterialRequirements(products) {
        const grouped = {};

        products.forEach(function (product) {
            const bomItems = getBomItemsForProduct(product);

            bomItems.forEach(function (bomItem) {
                const material = getMaterialById(bomItem.materialId);
                const baseQty = Number(product.quantity || 0) * Number(bomItem.qtyPerUnit || 0);
                const requiredQty = baseQty + (baseQty * Number(bomItem.wastagePercent || 0) / 100);
                const key = material.materialId || material.id || bomItem.materialId;

                if (!grouped[key]) {
                    grouped[key] = {
                        materialCode: material.materialCode || material.code || bomItem.materialId,
                        materialName: material.name || material.materialName || "Unknown Material",
                        materialType: material.type || material.materialType || "Material",
                        requiredQty: 0,
                        availableQty: Number(material.availableQty ?? material.availableStock ?? material.stock ?? 0),
                        shortageQty: 0,
                        unit: bomItem.unit || material.unit || "-"
                    };
                }

                grouped[key].requiredQty += requiredQty;
            });
        });

        return Object.values(grouped).map(function (row) {
            row.shortageQty = Math.max(row.requiredQty - row.availableQty, 0);
            return row;
        });
    }

    function getBomItemsForProduct(product) {
        const catalogProduct = getCatalogProduct(product) || {};
        const candidates = [
            product.productId,
            product.productCode,
            catalogProduct.id,
            catalogProduct.productId,
            catalogProduct.productCode
        ].filter(Boolean).map(String);

        return state.bom.filter(function (item) {
            return candidates.includes(String(item.productId))
                || candidates.includes(String(item.ProductId))
                || candidates.includes(String(item.productCode))
                || candidates.includes(String(item.ProductCode));
        });
    }

    function getMaterialById(materialId) {
        return state.materials.find(function (material) {
            return String(material.id) === String(materialId)
                || String(material.materialId) === String(materialId)
                || String(material.materialCode) === String(materialId)
                || String(material.code) === String(materialId);
        }) || {
            id: materialId,
            materialId: materialId,
            materialCode: materialId,
            name: "Unknown Material",
            materialName: "Unknown Material",
            type: "Material",
            materialType: "Material",
            unit: "pcs",
            availableQty: 0
        };
    }

    function getSizeColorRows(product) {
        const sizes = product.sizes || [];
        const aggregated = {};

        function add(size, palette, qty) {
            const key = `${size}|${palette}`;
            if (!aggregated[key]) {
                aggregated[key] = {
                    size: size,
                    palette: palette,
                    quantity: 0
                };
            }
            aggregated[key].quantity += Number(qty || 0);
        }

        if (!Array.isArray(sizes)) {
            Object.entries(sizes).forEach(function ([size, qty]) {
                add(size, product.variant || "-", qty);
            });
        } else {
            sizes.forEach(function (sizeRow) {
                const size = sizeRow.size || "-";
                const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];
                const productPalette = product.variant || "-";

                if (colorRows.length) {
                    colorRows.forEach(function (colorRow) {
                        const palette = colorRow.palette || colorRow.paletteName || colorRow.colorPalette || sizeRow.palette || sizeRow.paletteName || productPalette;
                        add(size, palette, colorRow.quantity || colorRow.qty || 0);
                    });
                } else {
                    const palette = sizeRow.palette || sizeRow.paletteName || sizeRow.colorPalette || productPalette;
                    add(size, palette, sizeRow.quantity || sizeRow.qty || 0);
                }
            });
        }

        return Object.values(aggregated);
    }

    function getVariantQuantitySummaryHtml(product) {
        const totalsByColor = {};

        getSizeColorRows(product).forEach(function (row) {
            const color = getEffectiveRowPalette(product, row) || "-";
            totalsByColor[color] = (totalsByColor[color] || 0) + Number(row.quantity || 0);
        });

        const entries = Object.entries(totalsByColor);

        if (!entries.length) {
            return `
                <div class="variant-qty-item">
                    ${renderPaletteChip(product.variant)}
                    <strong>: ${formatNumber(product.quantity)} pcs</strong>
                </div>
            `;
        }

        return entries.map(function ([color, quantity]) {
            return `
                <div class="variant-qty-item">
                    ${renderPaletteChip(color)}
                    <strong>: ${formatNumber(quantity)} pcs</strong>
                </div>
            `;
        }).join("");
    }

    function getProductPaletteSummary(product) {
        const palettes = getSizeColorRows(product).map(function (row) {
            return getEffectiveRowPalette(product, row);
        }).filter(Boolean);

        const uniquePalettes = Array.from(new Set(palettes));

        if (uniquePalettes.length > 1) return "Mixed palettes";
        if (uniquePalettes.length === 1) return uniquePalettes[0];

        return product.variant || "-";
    }

    const FABRIC_COLOR_MAP = {
        "dyed cotton (navy blue)": "#1e3a8a",
        "dyed cotton (scarlet red)": "#b91c1c",
        "dyed cotton (pure white)": "#f8fafc",
        "dyed cotton (forest green)": "#14532d",
        "pique knit (midnight black)": "#111827",
        "pique knit (navy blue)": "#1e3a8a",
        "pique knit (maroon)": "#7f1d1d",
        "fleece knit (heather grey)": "#94a3b8",
        "fleece knit (navy)": "#1e3a8a",
        "elegant and versatile fabric brand palette": "#c9b2bb",
        "vibrant summer collection": "#ff5733",
        "monochrome essentials": "#ffffff",
        "earthy tones": "#8b4513"
    };

    function getFabricColor(value) {
        if (!value) return null;
        const valLower = value.toLowerCase();

        if (FABRIC_COLOR_MAP[valLower]) return FABRIC_COLOR_MAP[valLower];

        if (valLower.includes("navy")) return "#1e3a8a";
        if (valLower.includes("royal blue")) return "#1d4ed8";
        if (valLower.includes("sky blue")) return "#7dd3fc";
        if (valLower.includes("blue")) return "#2563eb";
        if (valLower.includes("scarlet red") || valLower.includes("red")) return "#b91c1c";
        if (valLower.includes("white")) return "#f8fafc";
        if (valLower.includes("black")) return "#111827";
        if (valLower.includes("charcoal")) return "#45464d";
        if (valLower.includes("grey") || valLower.includes("gray")) return "#94a3b8";
        if (valLower.includes("cream")) return "#fef3c7";
        if (valLower.includes("brown")) return "#78350f";
        if (valLower.includes("green")) return "#14532d";
        if (valLower.includes("maroon")) return "#7f1d1d";

        const picker = window.ProductionPalettePicker;
        if (picker) {
            const colors = picker.getColors(value);
            if (colors && colors.length > 0) return colors[0];
        }

        return null;
    }

    function renderFabricSampleHtml(color, name) {
        const borderStyle = (color === "#ffffff" || color === "#f8fafc" || color === "#e2e8f0" || color.toLowerCase() === "#fff") ? "border: 1px solid #cbd5e1;" : "border: 1px solid rgba(0,0,0,0.15);";
        return `
            <span class="fabric-sample-preview" 
                  style="background-color: ${color}; ${borderStyle} display: inline-block; width: 18px; height: 18px; border-radius: 4px; vertical-align: middle; box-shadow: 0 1px 3px rgba(0,0,0,0.15); margin-right: 6px;" 
                  title="${App.escapeHtml(name || '')}">
            </span>
        `;
    }

    function renderPalettePreviewHtml(value, options) {
        const color = getFabricColor(value);
        if (color) {
            return renderFabricSampleHtml(color, value);
        }
        return "";
    }

    function renderPaletteChip(value) {
        const color = getFabricColor(value);
        if (color) {
            return `
                <span class="variant-chip" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 6px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 500; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                    ${renderFabricSampleHtml(color, value)}
                    <span>${App.escapeHtml(value || "-")}</span>
                </span>
            `;
        }
        return `<span class="variant-chip">${App.escapeHtml(value || "-")}</span>`;
    }

    function renderProductColorChip(product, row) {
        const value = getEffectiveRowPalette(product, row);
        return renderPaletteChip(value);
    }

    function getEffectiveRowPalette(product, row) {
        return row?.palette || product?.variant || "";
    }

    function getPlanQuantity() {
        return state.planProducts.reduce(function (sum, product) {
            return sum + Number(product.quantity || 0);
        }, 0) || Number(state.plan.quantity || state.plan.totalQuantity || 0);
    }

    function getProductSummaryLabel(products) {
        if (!products.length) return "-";
        if (products.length === 1) return products[0].productName;

        return `${products.length} products: ${products.slice(0, 2).map(function (product) {
            return product.productName;
        }).join(", ")}${products.length > 2 ? "..." : ""}`;
    }

    function getMinProductDate(field) {
        return state.planProducts.map(function (product) {
            return product[field];
        }).filter(Boolean).sort()[0] || "";
    }

    function getMaxProductDate(field) {
        const dates = state.planProducts.map(function (product) {
            return product[field];
        }).filter(Boolean).sort();

        return dates[dates.length - 1] || "";
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("en-US", {
            maximumFractionDigits: 2
        });
    }
})();
