import type { ReactNode } from "react";

import { CrmCreateCustomerPage } from "../components/legacy-pages/crm/CrmCreateCustomerPage";
import { CrmCustomerFilterPage } from "../components/legacy-pages/crm/CrmCustomerFilterPage";
import { CrmIndexPage } from "../components/legacy-pages/crm/CrmIndexPage";
import { CrmAuditPage } from "../components/legacy-pages/crm/CrmAuditPage";
import { ErrorPage, HomePage, PrivacyPage } from "../components/legacy-pages/shared/DefaultPages";
import { CrmCreateOrderPage } from "../components/legacy-pages/crm/CrmCreateOrderPage";
import { ManualCreatePlanPage } from "../components/legacy-pages/production/ManualCreatePlanPage";
import { ProductionCreatePage } from "../components/legacy-pages/production/ProductionCreatePage";
import { ProductionCatalogPage } from "../components/legacy-pages/production/ProductionCatalogPage";
import { ProductionDemandPlanPage } from "../components/legacy-pages/production/ProductionDemandPlanPage";
import { ProductionFolderPage } from "../components/legacy-pages/production/ProductionFolderPage";
import { ProductionInHouseCreatePage } from "../components/legacy-pages/production/ProductionInHouseCreatePage";
import { ProductionInProgressVisualizationPage } from "../components/legacy-pages/production/ProductionInProgressVisualizationPage";
import { ProductionPlanDetailsPage } from "../components/legacy-pages/production/ProductionPlanDetailsPage";
import { ProductionPlanEditPage } from "../components/legacy-pages/production/ProductionPlanEditPage";
import { ProductionOverviewPage } from "../components/legacy-pages/production/ProductionOverviewPage";
import { ProductionPlansListPage } from "../components/legacy-pages/production/ProductionPlansListPage";
import { ProductionStageUpdatePage } from "../components/legacy-pages/production/ProductionStageUpdatePage";
import { ProductionPlanCreateDetailsPage } from "../components/legacy-pages/production/ProductionPlanCreateDetailsPage";
import { WarehouseIndexPage } from "../components/legacy-pages/warehouse/WarehouseIndexPage";
import { WarehouseStockPage } from "../components/legacy-pages/warehouse/WarehouseStockPage";
import { WarehouseVisualizationPage } from "../components/legacy-pages/warehouse/WarehouseVisualizationPage";

const pageOverrides: Record<string, () => ReactNode> = {
  "/": () => <HomePage />,
  "/Privacy": () => <PrivacyPage />,
  "/Error": () => <ErrorPage />,
  "/CreatePlan": () => <ManualCreatePlanPage />,
  "/CRM/Index": () => <CrmIndexPage />,
  "/CRM/Audit": () => <CrmAuditPage />,
  "/CRM/Order/CreateOrder": () => <CrmCreateOrderPage />,
  "/CRM/Customer/CreateCustomer": () => <CrmCreateCustomerPage />,
  "/CRM/CustomerFilter/Index": () => <CrmCustomerFilterPage />,
  "/Production/Index": () => <ProductionOverviewPage />,
  "/Production/Create": () => <ProductionCreatePage />,
  "/Production/Customer/CreateCustomer": () => <ProductionDemandPlanPage kind="customer" />,
  "/Production/Customer/Customers": () => <ProductionCatalogPage kind="customer" />,
  "/Production/Outlet/CreateOutlet": () => <ProductionDemandPlanPage kind="outlet" />,
  "/Production/Outlet/Outlets": () => <ProductionCatalogPage kind="outlet" />,
  "/Production/Drafts": () => <ProductionFolderPage folder="drafts" />,
  "/Production/InHouse/CreateInHouse": () => <ProductionInHouseCreatePage />,
  "/Production/InProgress": () => <ProductionInProgressVisualizationPage />,
  "/Production/Completed": () => <ProductionFolderPage folder="completed" />,
  "/Production/Plan/Details": () => <ProductionPlanDetailsPage />,
  "/Production/Plan/Edit": () => <ProductionPlanEditPage />,
  "/Production/Plan/PlansDetails": () => <ProductionPlansListPage />,
  "/Production/Plan/StageUpdate": () => <ProductionStageUpdatePage />,
  "/Production/Plan/CreateDetails": () => <ProductionPlanCreateDetailsPage />,
  "/Warehouse/Index": () => <WarehouseIndexPage />,
  "/Warehouse/Stock": () => <WarehouseStockPage />,
  "/Warehouse/Visualization": () => <WarehouseVisualizationPage />,
};

export function renderPageOverride(route: string) {
  return pageOverrides[route]?.();
}

export function isRouteOverridden(route: string): boolean {
  return route in pageOverrides;
}

export function shouldSkipLegacyScripts(route: string): boolean {
  const skipRoutes = [
    "/Production/Create",
    "/Production/Customer/CreateCustomer",
    "/Production/Outlet/CreateOutlet",
    "/Production/InHouse/CreateInHouse",
    "/Production/Plan/CreateDetails",
  ];
  return skipRoutes.includes(route);
}
