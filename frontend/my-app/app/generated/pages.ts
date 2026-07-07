import type { LegacyPageDefinition, LegacyScript } from "./types";
import crmCustomerFilterIndex from "./page-data/crm-customer-filter-index";
import crmCustomerCreateCustomer from "./page-data/crm-customer-create-customer";
import crmIndex from "./page-data/crm-index";
import crmOrderCreateOrder from "./page-data/crm-order-create-order";
import createPlan from "./page-data/create-plan";
import error from "./page-data/error";
import home from "./page-data/home";
import privacy from "./page-data/privacy";
import productionCompleted from "./page-data/production-completed";
import productionCreate from "./page-data/production-create";
import productionCustomerCreateCustomer from "./page-data/production-customer-create-customer";
import productionCustomerCustomers from "./page-data/production-customer-customers";
import productionDrafts from "./page-data/production-drafts";
import productionInHouseCreateInHouse from "./page-data/production-in-house-create-in-house";
import productionInProgress from "./page-data/production-in-progress";
import productionIndex from "./page-data/production-index";
import productionOutletCreateOutlet from "./page-data/production-outlet-create-outlet";
import productionOutletOutlets from "./page-data/production-outlet-outlets";
import productionPlanDetails from "./page-data/production-plan-details";
import productionPlanEdit from "./page-data/production-plan-edit";
import productionPlanPlansDetails from "./page-data/production-plan-plans-details";
import productionPlanStageUpdate from "./page-data/production-plan-stage-update";
import warehouseIndex from "./page-data/warehouse-index";
import warehouseStock from "./page-data/warehouse-stock";
import warehouseVisualization from "./page-data/warehouse-visualization";
import crmAudit from "./page-data/crm-audit";

export type { LegacyPageDefinition, LegacyScript } from "./types";

export const pages: Record<string, LegacyPageDefinition> = {
  "/CRM/CustomerFilter/Index": crmCustomerFilterIndex,
  "/CRM/Customer/CreateCustomer": crmCustomerCreateCustomer,
  "/CRM/Index": crmIndex,
  "/CRM/Order/CreateOrder": crmOrderCreateOrder,
  "/CreatePlan": createPlan,
  "/Error": error,
  "/": home,
  "/Privacy": privacy,
  "/Production/Completed": productionCompleted,
  "/Production/Create": productionCreate,
  "/Production/Customer/CreateCustomer": productionCustomerCreateCustomer,
  "/Production/Customer/Customers": productionCustomerCustomers,
  "/Production/Drafts": productionDrafts,
  "/Production/InHouse/CreateInHouse": productionInHouseCreateInHouse,
  "/Production/InProgress": productionInProgress,
  "/Production/Index": productionIndex,
  "/Production/Outlet/CreateOutlet": productionOutletCreateOutlet,
  "/Production/Outlet/Outlets": productionOutletOutlets,
  "/Production/Plan/Details": productionPlanDetails,
  "/Production/Plan/Edit": productionPlanEdit,
  "/Production/Plan/PlansDetails": productionPlanPlansDetails,
  "/Production/Plan/StageUpdate": productionPlanStageUpdate,
  "/Warehouse/Index": warehouseIndex,
  "/Warehouse/Stock": warehouseStock,
  "/Warehouse/Visualization": warehouseVisualization,
  "/CRM/Audit": crmAudit,
};
