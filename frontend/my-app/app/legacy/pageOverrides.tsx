import type { ReactNode } from "react";

import { CrmCreateCustomerPage } from "../components/legacy-pages/CrmCreateCustomerPage";
import { CrmCustomerFilterPage } from "../components/legacy-pages/CrmCustomerFilterPage";
import { CrmIndexPage } from "../components/legacy-pages/CrmIndexPage";
import { CrmAuditPage } from "../components/legacy-pages/CrmAuditPage";
import { ErrorPage, HomePage, PrivacyPage } from "../components/legacy-pages/DefaultPages";
import { CrmCreateOrderPage } from "../components/legacy-pages/CrmCreateOrderPage";
import { ManualCreatePlanPage } from "../components/legacy-pages/ManualCreatePlanPage";
import { ProductionCreatePage } from "../components/legacy-pages/ProductionCreatePage";
import { ProductionCatalogPage } from "../components/legacy-pages/ProductionCatalogPage";
import { ProductionDemandPlanPage } from "../components/legacy-pages/ProductionDemandPlanPage";
import { ProductionFolderPage } from "../components/legacy-pages/ProductionFolderPage";
import { ProductionInHouseCreatePage } from "../components/legacy-pages/ProductionInHouseCreatePage";
import { ProductionPlanDetailsPage } from "../components/legacy-pages/ProductionPlanDetailsPage";
import { ProductionPlanEditPage } from "../components/legacy-pages/ProductionPlanEditPage";
import { ProductionOverviewPage } from "../components/legacy-pages/ProductionOverviewPage";
import { ProductionPlansListPage } from "../components/legacy-pages/ProductionPlansListPage";
import { ProductionStageUpdatePage } from "../components/legacy-pages/ProductionStageUpdatePage";
import { WarehouseIndexPage } from "../components/legacy-pages/WarehouseIndexPage";
import { WarehouseStockPage } from "../components/legacy-pages/WarehouseStockPage";
import { WarehouseVisualizationPage } from "../components/legacy-pages/WarehouseVisualizationPage";

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
  "/Production/InProgress": () => <ProductionFolderPage folder="in-progress" />,
  "/Production/Completed": () => <ProductionFolderPage folder="completed" />,
  "/Production/Plan/Details": () => <ProductionPlanDetailsPage />,
  "/Production/Plan/Edit": () => <ProductionPlanEditPage />,
  "/Production/Plan/PlansDetails": () => <ProductionPlansListPage />,
  "/Production/Plan/StageUpdate": () => <ProductionStageUpdatePage />,
  "/Warehouse/Index": () => <WarehouseIndexPage />,
  "/Warehouse/Stock": () => <WarehouseStockPage />,
  "/Warehouse/Visualization": () => <WarehouseVisualizationPage />,
};

export function renderPageOverride(route: string) {
  return pageOverrides[route]?.();
}
