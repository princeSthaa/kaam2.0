import { ActionButton } from "../legacy-ui/ActionButton";
import { TableShell } from "../legacy-ui/TableShell";

type DemandKind = "customer" | "outlet";

const bulkHeaders = [
  "Material Code",
  "Material Name",
  "Material Type",
  "Required Qty",
  "Available Qty",
  "Shortage Qty",
  "Unit",
  "Status",
];

const measurementHeaders = ["Size", "Chest", "Shoulder", "Sleeve", "Length", "Unit"];

const config = {
  customer: {
    pageId: "customerOrderPlanPage",
    pageClass: "customer-order-page",
    selectedDataAttr: { "data-selected-customer-id": "" },
    title: "Create Customer Order Plan",
    headerTextId: "customerOrderHeaderText",
    headerText: "Browse ready customer orders, check materials in bulk, and add selected items to a production plan.",
    actions: [
      ["/Production/Customer/Customers", "Choose Customer"],
      ["/Production/Create", "Change Demand Type"],
      ["/Production/Plan/PlansDetails", "Back to Plans"],
    ],
    selectedCardId: "selectedCustomerCard",
    selectedAvatarId: "selectedCustomerAvatar",
    selectedTitleId: "selectedCustomerName",
    selectedMetaId: "selectedCustomerMeta",
    selectedEyebrow: "Selected Customer",
    selectedTitle: "Customer",
    selectedMeta: "Order items for the selected customer.",
    selectedStats: [
      ["Phone", "selectedCustomerPhone"],
      ["Location", "selectedCustomerAddress"],
      ["Open Orders", "selectedCustomerOrders"],
      ["Total Qty", "selectedCustomerQty"],
      ["Earliest Delivery", "selectedCustomerDelivery"],
    ],
    warningId: "customerSelectionWarning",
    warning: "Choose a customer from the customer catalog to view only that customer's order items.",
    formId: "productionPlanForm",
    demandType: "Customer Order",
    draftJsonId: "selectedDraftJson",
    catalogEyebrow: "Customer Order Catalog",
    catalogTitleId: "customerOrderCatalogTitle",
    catalogTitle: "Ready Orders for Production Planning",
    catalogText: "",
    heroStats: [
      ["Selected Items", "selectedItemCount"],
      ["Total Quantity", "selectedTotalQty"],
      ["Earliest Delivery", "selectedEarliestDelivery"],
    ],
    itemTitleId: "customerOrderItemsTitle",
    itemTitle: "Customer Order Items",
    itemTextId: "customerOrderItemsText",
    itemText: "Click View Details to inspect size chart, measurements, and material requirements.",
    gridId: "customerOrderCatalogGrid",
    gridClass: "customer-order-catalog-grid",
    gridLoading: "Loading customer orders...",
    basketTitle: "Production Plan Basket",
    basketText: "Selected items to convert into production plan.",
    basketItemsId: "planBasketItems",
    basketEmpty: "No items added yet.",
    basketStats: [
      ["Total Items", "basketTotalItems"],
      ["Total Qty", "basketTotalQty"],
      ["Earliest Delivery", "basketEarliestDelivery"],
      ["Material Status", "basketMaterialStatus"],
    ],
    createButtonId: "createProductionPlanBtn",
    checkButtonId: "checkBulkMaterialBtn",
    clearButtonId: "clearBasketBtn",
    bulkBodyId: "bulkMaterialBody",
    bulkEmpty: "Add items to production plan basket, then click Check Materials in Bulk.",
    modalId: "orderDetailModal",
    modalTitleId: "detailProductName",
    modalTitle: "Order Detail",
    modalSubtitleId: "detailOrderSubtitle",
    modalSubtitle: "View customer order, size chart, measurements, and production information.",
    imageId: "detailProductImage",
    topInfo: [
      ["Customer", "detailCustomerName"],
      ["Order No", "detailOrderNo"],
    ],
    badges: ["detailCustomerType", "detailPriority", "detailDeliveryBadge"],
    itemNameId: "detailItemName",
    infoGrid: [
      ["Quantity", "detailQuantity"],
      ["Delivery Date", "detailDeliveryDate"],
      ["Color / Variant", "detailVariant", "detailVariantPalettePreview"],
      ["Delivery Location", "detailDeliveryLocation"],
    ],
    noteLabel: "Production Notes",
    noteId: "detailProductionNotes",
    addDetailButtonId: "addDetailToPlanBtn",
    detailSections: [
      {
        title: "Size Breakdown",
        text: "Quantity required per size and color variant.",
        bodyId: "detailSizeBreakdownBody",
        headers: ["Size", "Palette / Variant", "Quantity"],
        colSpan: 3,
        empty: "No size data.",
        className: "size-breakdown-wrapper",
        tableClassName: "pp-table compact-table size-breakdown-table",
      },
      {
        title: "Measurement Chart",
        text: "Specification used by production team.",
        bodyId: "detailMeasurementBody",
        headers: measurementHeaders,
        colSpan: 6,
        empty: "No measurement data.",
        tableClassName: "pp-table compact-table",
      },
      {
        title: "Material Requirement Preview",
        text: "Calculated only for this order item.",
        bodyId: "detailMaterialBody",
        headers: ["Material", "Required", "Available", "Shortage", "Status"],
        colSpan: 5,
        empty: "No material data.",
        full: true,
        tableClassName: "pp-table compact-table",
      },
    ],
    product3dSubtitle: "Product preview for the selected customer order item.",
    product3dDescription: "Front and back mockup image for the selected order item.",
    product3dSecondLabel: "Customer",
  },
  outlet: {
    pageId: "outletDemandPlanPage",
    pageClass: "outlet-demand-page",
    selectedDataAttr: { "data-selected-outlet-id": "" },
    title: "Create Outlet Production Plan",
    headerTextId: "outletDemandHeaderText",
    headerText: "Browse outlet stock demand, add replenishment items to plan, and check materials in bulk.",
    actions: [
      ["/Production/Outlet/Outlets", "Choose Outlet"],
      ["/Production/Create", "Change Demand Type"],
      ["/Production/Plan/PlansDetails", "Back to Plans"],
    ],
    selectedCardId: "selectedOutletCard",
    selectedAvatarId: "selectedOutletAvatar",
    selectedTitleId: "selectedOutletName",
    selectedMetaId: "selectedOutletMeta",
    selectedEyebrow: "Selected Outlet",
    selectedTitle: "Outlet",
    selectedMeta: "Demand items for the selected outlet.",
    selectedStats: [
      ["Manager", "selectedOutletManager"],
      ["Location", "selectedOutletLocation"],
      ["Demand Items", "selectedOutletDemandCount"],
      ["Total Qty", "selectedOutletQty"],
      ["Earliest Required", "selectedOutletRequired"],
    ],
    warningId: "outletSelectionWarning",
    warning: "Choose an outlet from the outlet catalog to view only that outlet's demand items.",
    formId: "outletProductionPlanForm",
    demandType: "Outlet Demand",
    draftJsonId: "selectedOutletDraftJson",
    catalogEyebrow: "Outlet Demand Catalog",
    catalogTitleId: "outletDemandCatalogTitle",
    catalogTitle: "Outlet Replenishment Planning",
    catalogText: "Select products that need production for outlet stock replenishment. Review stock gap, sales velocity, suggested quantity, and material availability.",
    heroStats: [
      ["Selected Items", "outletSelectedItemCount"],
      ["Total Suggested Qty", "outletSelectedTotalQty"],
      ["Earliest Required", "outletSelectedEarliestDate"],
    ],
    itemTitleId: "outletDemandItemsTitle",
    itemTitle: "Outlet Demand Items",
    itemTextId: "outletDemandItemsText",
    itemText: "Choose products that need production based on outlet stock gap and sales movement.",
    gridId: "outletDemandCatalogGrid",
    gridClass: "customer-order-catalog-grid outlet-demand-catalog-grid",
    gridLoading: "Loading outlet demand...",
    basketTitle: "Plan Basket",
    basketText: "Review selected outlet demand items before creating the production plan.",
    basketItemsId: "outletPlanBasketItems",
    basketEmpty: "No outlet demand items added yet.",
    basketStats: [
      ["Total Items", "outletBasketTotalItems"],
      ["Total Qty", "outletBasketTotalQty"],
      ["Earliest Required", "outletBasketEarliestDate"],
      ["Material Status", "outletBasketMaterialStatus"],
    ],
    createButtonId: "createOutletProductionPlanBtn",
    checkButtonId: "checkOutletBulkMaterialBtn",
    clearButtonId: "clearOutletBasketBtn",
    bulkBodyId: "outletBulkMaterialBody",
    bulkEmpty: "Add outlet demand items to plan basket, then click Check Materials in Bulk.",
    modalId: "outletDetailModal",
    modalTitleId: "outletDetailProductName",
    modalTitle: "Outlet Demand Detail",
    modalSubtitleId: "outletDetailSubtitle",
    modalSubtitle: "Review outlet stock gap, size-wise demand, and material requirement.",
    imageId: "outletDetailProductImage",
    topInfo: [
      ["Outlet", "outletDetailOutletName"],
      ["Demand No", "outletDetailDemandNo"],
    ],
    badges: ["outletDetailStockStatus", "outletDetailVelocity", "outletDetailRequiredBadge"],
    itemNameId: "outletDetailItemName",
    infoGrid: [
      ["Current Stock", "outletDetailCurrentStock"],
      ["Reorder Level", "outletDetailReorderLevel"],
      ["Suggested Qty", "outletDetailSuggestedQty"],
      ["Required Date", "outletDetailRequiredDate"],
      ["Last 30 Days Sales", "outletDetailLast30Sales"],
      ["Outlet Location", "outletDetailLocation"],
    ],
    noteLabel: "Planning Notes",
    noteId: "outletDetailNotes",
    addDetailButtonId: "addOutletDetailToPlanBtn",
    detailSections: [
      {
        title: "Size-wise Stock Gap",
        text: "Suggested quantity per size and color variant.",
        bodyId: "outletDetailSizeGapBody",
        headers: ["Size", "Palette / Variant", "Current", "Reorder", "Plan Qty"],
        colSpan: 5,
        empty: "No size gap data.",
        full: true,
        className: "outlet-size-gap-wrapper",
        tableClassName: "pp-table compact-table outlet-size-gap-table",
      },
      {
        title: "Measurement Chart",
        text: "Specification used by production team.",
        bodyId: "outletDetailMeasurementBody",
        headers: measurementHeaders,
        colSpan: 6,
        empty: "No measurement data.",
        tableClassName: "pp-table compact-table",
      },
      {
        title: "Material Requirement Preview",
        text: "Calculated only for this outlet demand item.",
        bodyId: "outletDetailMaterialBody",
        headers: ["Material", "Required", "Available", "Shortage", "Status"],
        colSpan: 5,
        empty: "No material data.",
        full: true,
        tableClassName: "pp-table compact-table",
      },
    ],
    product3dSubtitle: "Product preview for the selected outlet demand item.",
    product3dDescription: "Front and back mockup image for the selected outlet demand item.",
    product3dSecondLabel: "Outlet",
  },
} satisfies Record<DemandKind, Record<string, any>>;

function SelectedSourceCard({ kind }: { kind: DemandKind }) {
  const c = config[kind];

  return (
    <section className="pp-card selected-customer-card hidden" id={c.selectedCardId}>
      <div className="selected-customer-main">
        <div className="selected-customer-avatar" id={c.selectedAvatarId}>{kind === "customer" ? "CU" : "OU"}</div>
        <div>
          <span className="catalog-eyebrow">{c.selectedEyebrow}</span>
          <h2 id={c.selectedTitleId}>{c.selectedTitle}</h2>
          <p id={c.selectedMetaId}>{c.selectedMeta}</p>
        </div>
      </div>

      <div className="selected-customer-stats">
        {c.selectedStats.map(([label, id]: string[]) => (
          <div key={id}>
            <span>{label}</span>
            <strong id={id}>{label.includes("Qty") || label.includes("Orders") || label.includes("Items") ? "0" : "-"}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function BasketPanel({ kind }: { kind: DemandKind }) {
  const c = config[kind];

  return (
    <aside className="plan-basket-panel">
      <div className="plan-basket-header">
        <div>
          <h2>{c.basketTitle}</h2>
          <p>{c.basketText}</p>
        </div>
      </div>

      <div id={c.basketItemsId} className="plan-basket-items">
        <div className="basket-empty-state">{c.basketEmpty}</div>
      </div>

      <div className="plan-basket-summary">
        {c.basketStats.map(([label, id]: string[]) => (
          <div key={id}>
            <span>{label}</span>
            <strong id={id}>{label === "Material Status" ? "Not checked" : label.includes("Date") || label.includes("Delivery") || label.includes("Required") ? "-" : "0"}</strong>
          </div>
        ))}
      </div>

      <div className="basket-actions">
        <button type="submit" name="ActionType" value="Create" className="btn btn-primary full-width" id={c.createButtonId}>
          Create Production Plan
        </button>
        <button type="button" className="btn btn-outline full-width" id={c.checkButtonId}>
          Check Materials in Bulk
        </button>
        <button type="button" className="btn btn-danger-light full-width" id={c.clearButtonId}>
          Clear Basket
        </button>
      </div>
    </aside>
  );
}

function DetailModal({ kind }: { kind: DemandKind }) {
  const c = config[kind];

  return (
    <div className="pp-modal hidden" id={c.modalId}>
      <div className="pp-modal-backdrop" data-close-modal={c.modalId} />
      <div className="pp-modal-panel large order-detail-modal-panel">
        <div className="pp-modal-header">
          <div>
            <h2 id={c.modalTitleId}>{c.modalTitle}</h2>
            <p id={c.modalSubtitleId}>{c.modalSubtitle}</p>
          </div>
          <button type="button" className="modal-close-btn" data-close-modal={c.modalId}>x</button>
        </div>

        <div className="pp-modal-body">
          <div className="order-detail-layout">
            <div className="order-detail-media">
              <img id={c.imageId} src="/images/products/place-holder.png" alt="Product image" />
              <div className="order-detail-thumbnail-row">
                {c.topInfo.map(([label, id]: string[]) => (
                  <div key={id}>
                    <span>{label}</span>
                    <strong id={id}>-</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-detail-info">
              <div className="detail-badge-row">
                {c.badges.map((id: string) => (
                  <span id={id} className="priority-badge" key={id}>-</span>
                ))}
              </div>
              <h3 id={c.itemNameId}>-</h3>
              <div className="detail-info-grid">
                {c.infoGrid.map(([label, id, paletteId]: string[]) => (
                  <div key={id}>
                    <span>{label}</span>
                    <strong id={id}>-</strong>
                    {paletteId ? <div id={paletteId} className="palette-preview-host" hidden /> : null}
                  </div>
                ))}
              </div>
              {kind === "outlet" ? (
                <div className="detail-info-grid mt-10">
                  <div><span>Last 7 Days Sales</span><strong id="outletDetailLast7Sales">-</strong></div>
                  <div><span>30 Days Sales</span><strong id="outletDetailSales30Box">-</strong></div>
                  <div><span>Avg Daily Sales</span><strong id="outletDetailAvgDailySales">-</strong></div>
                </div>
              ) : null}
              <div className="detail-note-box">
                <span>{c.noteLabel}</span>
                <p id={c.noteId}>-</p>
              </div>
              <div className="detail-action-stack">
                <button type="button" className="btn btn-outline full-width product-3d-preview-btn" id="openProduct3dPreviewBtn">
                  <span className="material-symbols-outlined">view_in_ar</span>
                  3D Product Preview
                </button>
                <button type="button" className="btn btn-primary full-width" id={c.addDetailButtonId}>
                  Add to Production Plan
                </button>
              </div>
            </div>
          </div>

          <div className="order-detail-tabs">
            {c.detailSections.map((section: any) => (
              <section className={`detail-section ${section.full ? "full-detail-section" : ""}`} key={section.bodyId}>
                <div className="detail-section-header">
                  <h3>{section.title}</h3>
                  <p>{section.text}</p>
                </div>
                <TableShell
                  bodyId={section.bodyId}
                  headers={section.headers}
                  wrapperClassName={`pp-table-wrapper ${section.className || ""}`}
                  tableClassName={section.tableClassName}
                >
                  <tr>
                    <td colSpan={section.colSpan} className="empty-cell">{section.empty}</td>
                  </tr>
                </TableShell>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Product3dModal({ kind }: { kind: DemandKind }) {
  const c = config[kind];

  return (
    <div className="pp-modal product-3d-modal hidden" id="product3dPreviewModal">
      <div className="pp-modal-backdrop" data-close-modal="product3dPreviewModal" />
      <div className="pp-modal-panel large product-3d-modal-panel">
        <div className="pp-modal-header">
          <div>
            <h2 id="product3dPreviewTitle">3D Product Preview</h2>
            <p id="product3dPreviewSubtitle">{c.product3dSubtitle}</p>
          </div>
          <div className="product-3d-header-actions">
            <button type="button" className="btn btn-light btn-sm" id="saveProduct3dImageBtn">
              <span className="material-symbols-outlined">download</span>
              Save Image
            </button>
            <button type="button" className="modal-close-btn" data-close-modal="product3dPreviewModal">x</button>
          </div>
        </div>

        <div className="pp-modal-body product-3d-modal-body">
          <div className="product-3d-layout">
            <section className="product-3d-viewer-card">
              <div className="product-3d-viewer-head">
                <div className="product-3d-segmented">
                  <button className="product-3d-view-btn active" id="product3dFrontBtn" type="button">Front</button>
                  <button className="product-3d-view-btn" id="product3dBackBtn" type="button">Back</button>
                </div>
                <div className="product-3d-hint">Click Front / Back to flip the shirt</div>
              </div>
              <div className="product-3d-stage">
                <div className="product-3d-view-pill" id="product3dViewPill">FRONT VIEW</div>
                <div className="product-3d-flip-card" id="product3dFlipCard">
                  <div className="product-3d-shirt-side product-3d-front-side">
                    <img className="product-3d-shirt-img" id="product3dFrontImage" src="/images/mockup3dimages/whiteshirtfront.png" alt="White shirt front" />
                  </div>
                  <div className="product-3d-shirt-side product-3d-back-side">
                    <img className="product-3d-shirt-img" id="product3dBackImage" src="/images/mockup3dimages/whiteshirtback.png" alt="White shirt back" />
                  </div>
                </div>
              </div>
              <div className="product-3d-thumbs" id="product3dThumbs" />
            </section>

            <aside className="product-3d-details-card">
              <div>
                <span className="catalog-eyebrow">Mockup Preview</span>
                <h3 id="product3dProductName">Product Preview</h3>
                <p id="product3dDescription">{c.product3dDescription}</p>
              </div>
              <div className="product-3d-option-block">
                <div className="product-3d-option-title">Product's Default Palette</div>
                <div className="product-3d-selection-summary">
                  <strong id="product3dAvailablePalette">-</strong>
                  <div id="product3dAvailablePalettePreview" className="palette-preview-host mt-5" />
                </div>
              </div>
              <div className="product-3d-option-block">
                <div className="product-3d-option-title">Customer's Ordered Palette</div>
                <div className="product-3d-selection-summary">
                  <strong id="product3dCustomerPalette">-</strong>
                  <div id="product3dCustomerPalettePreview" className="palette-preview-host mt-5" />
                </div>
              </div>
              <div className="product-3d-option-block">
                <div className="product-3d-option-title">Size <span id="product3dSizeLabel">M</span></div>
                <div className="product-3d-size-row" id="product3dSizeButtons" />
              </div>
              <div className="product-3d-selection-summary" id="product3dSummary">Selected: White / M / Front view</div>
              <div className="product-3d-meta-grid">
                <div><span>{kind === "customer" ? "Order No" : "Demand No"}</span><strong id="product3dOrderNo">-</strong></div>
                <div><span>{c.product3dSecondLabel}</span><strong id="product3dCustomerName">-</strong></div>
                <div><span>Quantity</span><strong id="product3dQuantity">-</strong></div>
                <div>
                  <span>Variant</span>
                  <strong id="product3dVariant">-</strong>
                  <div id="product3dVariantPalettePreview" className="palette-preview-host" hidden />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductionDemandPlanPage({ kind }: { kind: DemandKind }) {
  const c = config[kind];

  return (
    <>
      <div className={`pp-page ${c.pageClass}`} id={c.pageId} {...c.selectedDataAttr}>
        <div className="pp-page-header">
          <div>
            <h1>{c.title}</h1>
            <p id={c.headerTextId}>{c.headerText}</p>
          </div>
          <div className="pp-header-actions">
            {c.actions.map(([href, label]: string[]) => (
              <ActionButton href={href} key={href}>{label}</ActionButton>
            ))}
          </div>
        </div>

        <SelectedSourceCard kind={kind} />
        <div className="alert alert-warning hidden" id={c.warningId}>{c.warning}</div>

        <form method="post" id={c.formId}>
          <input name="DemandType" type="hidden" value={c.demandType} />
          <input name="SelectedDraftJson" type="hidden" id={c.draftJsonId} />

          <section className="pp-card catalog-hero-card">
            <div className="catalog-hero-content">
              <div>
                <span className="catalog-eyebrow">{c.catalogEyebrow}</span>
                <h2 id={c.catalogTitleId}>{c.catalogTitle}</h2>
                {c.catalogText ? <p>{c.catalogText}</p> : null}
              </div>
              <div className="catalog-hero-stats">
                {c.heroStats.map(([label, id]: string[]) => (
                  <div key={id}>
                    <span>{label}</span>
                    <strong id={id}>{label.includes("Date") || label.includes("Delivery") || label.includes("Required") ? "-" : "0"}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="catalog-layout">
            <main className="catalog-main">
              <div className="catalog-section-header">
                <div>
                  <h2 id={c.itemTitleId}>{c.itemTitle}</h2>
                  <p id={c.itemTextId}>{c.itemText}</p>
                </div>
              </div>
              <div id={c.gridId} className={c.gridClass}>
                <div className="empty-cell">{c.gridLoading}</div>
              </div>
            </main>
            <BasketPanel kind={kind} />
          </div>

          <section className="pp-card bulk-material-card">
            <div className="pp-card-header">
              <div>
                <h2>Bulk Material Requirement</h2>
                <p>Material requirement is calculated from all selected production plan items.</p>
              </div>
            </div>
            <TableShell bodyId={c.bulkBodyId} headers={bulkHeaders}>
              <tr>
                <td colSpan={8} className="empty-cell">{c.bulkEmpty}</td>
              </tr>
            </TableShell>
          </section>
        </form>
      </div>

      <DetailModal kind={kind} />
      <Product3dModal kind={kind} />
    </>
  );
}
