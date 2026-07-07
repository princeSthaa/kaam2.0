(function () {
    "use strict";

    function getFabrics() {
        const model = window.legacyPageModelData || {};
        return model.fabrics || window.fabrics || window.fabricMasterData || window.fabricData || [];
    }

    function placeholderImage() {
        return "/images/products/place-holder.png";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function getFabricCategories() {
        return getFabrics().reduce(function (groups, fabric) {
            const category = fabric.category || "Other";
            if (!groups[category]) groups[category] = [];
            groups[category].push(fabric);
            return groups;
        }, {});
    }

    function syncSelectedCustomerFromQuery() {
        const pageRoot = document.getElementById("customerOrderPlanPage");
        if (!pageRoot) return;

        const params = new URLSearchParams(window.location.search || "");
        const selectedCustomerId = params.get("customerId") || params.get("customerCode") || params.get("sourceId") || "";
        if (!selectedCustomerId || pageRoot.dataset.selectedCustomerId) return;

        pageRoot.dataset.selectedCustomerId = selectedCustomerId;
    }

    function syncSelectedOutletFromQuery() {
        const pageRoot = document.getElementById("outletDemandPlanPage");
        if (!pageRoot) return;

        const params = new URLSearchParams(window.location.search || "");
        const selectedOutletId = params.get("outletId") || params.get("outletCode") || params.get("sourceId") || "";
        if (!selectedOutletId || pageRoot.dataset.selectedOutletId) return;

        pageRoot.dataset.selectedOutletId = selectedOutletId;
    }

    function readJsonArray(value) {
        try {
            const parsed = JSON.parse(value || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function buildCustomerPlanDraft(items) {
        const now = new Date().toISOString();
        const planNo = "PLN-CUST-" + Date.now();
        const first = items[0] || {};
        const totalQuantity = items.reduce(function (sum, item) {
            return sum + Number(item.quantity || item.qty || 0);
        }, 0);
        const productNames = items.map(function (item) {
            return item.productName || item.product || item.itemName;
        }).filter(Boolean);

        return {
            planNo: planNo,
            planId: planNo,
            demandType: "Customer Order",
            sourceType: "Customer Order",
            sourceId: first.customerId || first.customerCode || "",
            customerId: first.customerId || "",
            customerCode: first.customerCode || "",
            customerName: first.customerName || "",
            planName: (first.customerName || "Customer") + " Production Plan",
            productName: productNames.length === 1 ? productNames[0] : productNames.length + " customer order products",
            totalQuantity: totalQuantity,
            quantity: totalQuantity,
            status: "Draft",
            priority: first.priority || "Normal",
            requiredDate: items.map(function (item) {
                return item.deliveryDate || item.requiredDate || "";
            }).filter(Boolean).sort()[0] || "",
            createdAt: now,
            draftSavedAt: now,
            products: items.map(function (item, index) {
                return {
                    lineId: planNo + "-" + (index + 1),
                    orderNo: item.orderNo || "",
                    productId: item.productId || item.productCode || "",
                    productCode: item.productCode || item.productId || "",
                    productName: item.productName || item.product || item.itemName || "",
                    category: item.category || "",
                    variant: item.variant || "",
                    quantity: Number(item.quantity || item.qty || 0),
                    sourceName: item.customerName || "",
                    customerId: item.customerId || "",
                    customerCode: item.customerCode || "",
                    customerName: item.customerName || "",
                    requiredDate: item.deliveryDate || item.requiredDate || "",
                    productImage: item.productImage || item.orderImage || "",
                    productionNotes: item.productionNotes || "",
                    sizes: item.sizes || [],
                    measurements: item.measurements || []
                };
            })
        };
    }

    function bindCustomerPlanSubmit() {
        const form = document.getElementById("productionPlanForm");
        const selectedDraftJson = document.getElementById("selectedDraftJson");
        const pageRoot = document.getElementById("customerOrderPlanPage");
        if (!form || !selectedDraftJson || !pageRoot || form.dataset.nextSubmitBound) return;

        form.dataset.nextSubmitBound = "true";
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            window.setTimeout(function () {
                const items = readJsonArray(selectedDraftJson.value);
                if (!items.length || !window.ProductionDraftStore) return;

                window.ProductionDraftStore.saveDraft(buildCustomerPlanDraft(items));
                window.location.href = "/Production/Drafts";
            }, 0);
        });
    }

    function normalizeCustomerOrderItem(item) {
        return {
            id: item.id || item.orderItemId || 0,
            orderNo: item.orderNo || "ORDER",
            customerId: item.customerId || 0,
            customerCode: item.customerCode || "",
            customerName: item.customerName || item.name || "",
            productId: item.productId || item.productCode || "",
            productCode: item.productCode || item.productId || "",
            productName: item.productName || item.orderItem || item.itemName || "",
            category: item.category || "",
            variant: item.variant || "",
            quantity: Number(item.quantity || item.orderQty || item.qty || 0),
            productImage: item.productImage || item.orderImage || "/images/products/place-holder.png",
            deliveryDate: item.deliveryDate || item.requiredDate || "",
            priority: item.priority || "Normal",
            productionNotes: item.productionNotes || "",
            sizes: item.sizes || [],
            measurements: item.measurements || []
        };
    }

    function findCustomerOrderItem(id) {
        const baseId = String(id || "").split("|")[0];
        const orders = window.customerOrderCatalogData || window.customerMasterData || [];
        return orders.map(normalizeCustomerOrderItem).find(function (item) {
            return String(item.id) === baseId;
        });
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("en-NP");
    }

    function formatDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString("en-NP", {
            year: "numeric",
            month: "short",
            day: "2-digit"
        });
    }

    function bindCustomerPlanBasketFallback() {
        const pageRoot = document.getElementById("customerOrderPlanPage");
        const basket = document.getElementById("planBasketItems");
        const selectedDraftJson = document.getElementById("selectedDraftJson");
        if (!pageRoot || !basket || pageRoot.dataset.nextBasketBound) return;

        pageRoot.dataset.nextBasketBound = "true";
        let selectedItems = [];

        function sync() {
            const totalQty = selectedItems.reduce(function (sum, item) {
                return sum + Number(item.quantity || 0);
            }, 0);
            const earliestDelivery = selectedItems.map(function (item) {
                return item.deliveryDate;
            }).filter(Boolean).sort()[0] || "";

            setText("selectedItemCount", selectedItems.length);
            setText("selectedTotalQty", formatNumber(totalQty));
            setText("selectedEarliestDelivery", earliestDelivery ? formatDate(earliestDelivery) : "-");
            setText("basketTotalItems", selectedItems.length);
            setText("basketTotalQty", formatNumber(totalQty));
            setText("basketEarliestDelivery", earliestDelivery ? formatDate(earliestDelivery) : "-");

            if (selectedDraftJson) selectedDraftJson.value = JSON.stringify(selectedItems);

            ["checkBulkMaterialBtn", "clearBasketBtn", "createProductionPlanBtn"].forEach(function (id) {
                const button = document.getElementById(id);
                if (button) button.disabled = selectedItems.length === 0;
            });

            document.querySelectorAll(".add-plan-btn").forEach(function (button) {
                const selected = selectedItems.some(function (item) {
                    return String(item.id) === String(button.getAttribute("data-id") || "").split("|")[0];
                });
                button.disabled = selected;
                button.textContent = selected ? "Added" : "Add to Plan";
            });
        }

        function renderBasket() {
            if (!selectedItems.length) {
                basket.innerHTML = '<div class="basket-empty-state">No items added yet.</div>';
            } else {
                basket.innerHTML = selectedItems.map(function (item) {
                    return `
                        <div class="basket-item">
                            <img src="${escapeHtml(item.productImage)}"
                                 alt="${escapeHtml(item.productName)}"
                                 onerror="this.src='/images/products/place-holder.png'" />
                            <div>
                                <strong>${escapeHtml(item.productName)}</strong>
                                <span>${escapeHtml(item.customerName)}</span>
                                <small>${formatNumber(item.quantity)} pcs • ${formatDate(item.deliveryDate)}</small>
                            </div>
                            <button type="button"
                                    class="basket-remove-btn"
                                    data-id="${escapeHtml(item.id)}"
                                    aria-label="Remove ${escapeHtml(item.productName)} from basket">
                                ×
                            </button>
                        </div>
                    `;
                }).join("");
            }

            sync();
        }

        pageRoot.addEventListener("click", function (event) {
            const addButton = event.target.closest(".add-plan-btn");
            if (addButton) {
                event.preventDefault();
                event.stopImmediatePropagation();

                const item = findCustomerOrderItem(addButton.getAttribute("data-id"));
                if (!item) return;

                if (!selectedItems.some(function (selected) {
                    return String(selected.id) === String(item.id);
                })) {
                    selectedItems.push(item);
                }

                renderBasket();
                return;
            }

            const removeButton = event.target.closest(".basket-remove-btn");
            if (removeButton) {
                event.preventDefault();
                event.stopImmediatePropagation();

                const id = removeButton.getAttribute("data-id");
                selectedItems = selectedItems.filter(function (item) {
                    return String(item.id) !== String(id);
                });
                renderBasket();
            }
        }, true);

        const clearButton = document.getElementById("clearBasketBtn");
        if (clearButton) {
            clearButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                selectedItems = [];
                renderBasket();
            }, true);
        }

        sync();
    }

    function repairCreateOrderFabricSelector(attempt) {
        attempt = attempt || 0;
        const modal = document.getElementById("fabricModal");
        const categoryGrid = document.getElementById("fabricCategoryGrid");
        const fabricGrid = document.getElementById("fabricGrid");
        if (!modal || !categoryGrid || !fabricGrid) return;

        const categories = getFabricCategories();
        if (!Object.keys(categories).length) {
            if (attempt < 10) {
                window.setTimeout(function () {
                    repairCreateOrderFabricSelector(attempt + 1);
                }, 100);
            }
            return;
        }

        function showCategories() {
            const title = document.getElementById("fabricModalTitle");
            const categoryView = document.getElementById("fabricCategoryView");
            const itemView = document.getElementById("fabricItemView");

            if (title) title.textContent = "Select Fabric Category";
            if (categoryView) categoryView.style.display = "block";
            if (itemView) itemView.style.display = "none";

            categoryGrid.innerHTML = Object.keys(categories).map(function (category) {
                const fabrics = categories[category];
                const images = fabrics.slice(0, 4).map(function (fabric) {
                    const image = fabric.imageUrl || fabric.image || placeholderImage();
                    return `<img src="${escapeHtml(image)}" onerror="this.src='${placeholderImage()}';" style="flex:1;height:100px;object-fit:cover;min-width:0;" />`;
                }).join("");

                return `
                    <div class="col-md-4 col-sm-6 mb-4 fabric-cat-col">
                        <button type="button" class="border rounded bg-white w-100 p-0 text-start legacy-fabric-category" data-fabric-category="${escapeHtml(category)}" style="cursor:pointer;overflow:hidden;">
                            <div class="d-flex" style="width:100%;background:#eee;">${images}</div>
                            <div class="p-3 text-center bg-white border-top">
                                <strong style="font-size:1.1em;color:#333;">${escapeHtml(category)}</strong><br />
                                <small class="text-muted">${fabrics.length} fabric options</small>
                            </div>
                        </button>
                    </div>
                `;
            }).join("");
        }

        function showFabricItems(category, onSelect) {
            const title = document.getElementById("fabricModalTitle");
            const categoryView = document.getElementById("fabricCategoryView");
            const itemView = document.getElementById("fabricItemView");

            if (title) title.textContent = "Select Fabric - " + category;
            if (categoryView) categoryView.style.display = "none";
            if (itemView) itemView.style.display = "block";

            fabricGrid.innerHTML = (categories[category] || []).map(function (fabric) {
                const image = fabric.imageUrl || fabric.image || placeholderImage();
                return `
                    <div class="col-md-4 col-sm-6 mb-3 fabric-col">
                        <button type="button" class="fabric-item w-100 bg-white legacy-fabric-item" data-fabric-id="${escapeHtml(fabric.id)}" data-fabric-name="${escapeHtml(fabric.name)}" data-fabric-image="${escapeHtml(image)}">
                            <img src="${escapeHtml(image)}" onerror="this.src='${placeholderImage()}';" />
                            <strong>${escapeHtml(fabric.name)}</strong><br />
                            <small class="text-muted">${escapeHtml(fabric.id)}</small>
                        </button>
                    </div>
                `;
            }).join("");

            fabricGrid.querySelectorAll(".legacy-fabric-item").forEach(function (button) {
                button.addEventListener("click", function () {
                    onSelect({
                        id: this.getAttribute("data-fabric-id"),
                        name: this.getAttribute("data-fabric-name"),
                        image: this.getAttribute("data-fabric-image")
                    });
                });
            });
        }

        window.showFabricCategories = showCategories;
        window.openFabricSelector = function (fid) {
            showCategories();

            categoryGrid.querySelectorAll(".legacy-fabric-category").forEach(function (button) {
                button.addEventListener("click", function () {
                    showFabricItems(this.getAttribute("data-fabric-category"), function (fabric) {
                        const imgEl = document.getElementById("img_" + fid);
                        const nameEl = document.getElementById("name_" + fid);
                        const hiddenEl = document.getElementById("hid_" + fid);
                        const sizesEl = document.getElementById("sizes_" + fid);

                        if (imgEl) {
                            imgEl.src = fabric.image;
                            imgEl.style.display = "block";
                        }
                        if (nameEl) nameEl.textContent = fabric.name;
                        if (hiddenEl) hiddenEl.value = fabric.id;
                        if (sizesEl) sizesEl.style.display = "block";
                        if (typeof window.recalculateGlobalTotals === "function") {
                            window.recalculateGlobalTotals();
                        }

                        const instance = window.bootstrap && window.bootstrap.Modal.getInstance(modal);
                        if (instance) instance.hide();
                    });
                });
            });

            if (window.bootstrap) {
                window.bootstrap.Modal.getOrCreateInstance(modal).show();
            }
        };

        if (!categoryGrid.children.length) showCategories();
    }

    document.addEventListener("DOMContentLoaded", function () {
        syncSelectedCustomerFromQuery();
        syncSelectedOutletFromQuery();
        window.setTimeout(bindCustomerPlanSubmit, 250);
        window.setTimeout(bindCustomerPlanBasketFallback, 250);
        window.setTimeout(function () {
            repairCreateOrderFabricSelector(0);
        }, 250);
    });

    syncSelectedCustomerFromQuery();
    syncSelectedOutletFromQuery();
})();
