import { MaterialIcon } from "../../ui/MaterialIcon";
import { ActionButton } from "../../legacy-ui/ActionButton";
import { EmptyState } from "../../legacy-ui/EmptyState";
import { FolderSearch } from "../../legacy-ui/FolderSearch";
import { LegacyCard } from "../../legacy-ui/LegacyCard";
import { PageHeader } from "../../legacy-ui/PageHeader";

type ProductionFolderConfig = {
  folder: "drafts" | "in-progress" | "completed";
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  searchLabel: string;
  primarySummaryLabel: string;
  emptyText: string;
  selectable?: boolean;
  actions: Array<{
    href: string;
    label: string;
    variant: "primary" | "light";
  }>;
};

const folderConfigs: Record<string, ProductionFolderConfig> = {
  drafts: {
    folder: "drafts",
    title: "Production Drafts",
    subtitle: "Unconfirmed production plans waiting for review.",
    searchPlaceholder: "Search drafts",
    searchLabel: "Search drafts",
    primarySummaryLabel: "Draft Plans",
    emptyText: "Loading drafts...",
    selectable: true,
    actions: [
      { href: "/Production/Create", label: "Create Production Plan", variant: "primary" },
      { href: "/Production/Index", label: "Overview", variant: "light" },
    ],
  },
  "in-progress": {
    folder: "in-progress",
    title: "Production In Progress",
    subtitle: "Plans currently moving through production stages.",
    searchPlaceholder: "Search in progress",
    searchLabel: "Search in progress",
    primarySummaryLabel: "In Progress",
    emptyText: "Loading in-progress plans...",
    actions: [
      { href: "/Production/Plan/PlansDetails", label: "View All Plans", variant: "light" },
      { href: "/Production/Index", label: "Overview", variant: "light" },
    ],
  },
  completed: {
    folder: "completed",
    title: "Completed Production",
    subtitle: "Finished plans ready for the next business step.",
    searchPlaceholder: "Search completed",
    searchLabel: "Search completed",
    primarySummaryLabel: "Completed Plans",
    emptyText: "Loading completed plans...",
    actions: [
      { href: "/Production/Plan/PlansDetails", label: "View All Plans", variant: "light" },
      { href: "/Production/Index", label: "Overview", variant: "light" },
    ],
  },
};

export function ProductionFolderPage({ folder }: { folder: keyof typeof folderConfigs }) {
  const config = folderConfigs[folder];

  return (
    <div className="pp-page production-folder-page" data-production-folder={config.folder}>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        actions={config.actions.map((action) => (
          <ActionButton key={action.href} href={action.href} variant={action.variant}>
            {action.label}
          </ActionButton>
        ))}
      />

      <LegacyCard className="production-folder-card">
        <div className="folder-page-toolbar">
          <FolderSearch placeholder={config.searchPlaceholder} ariaLabel={config.searchLabel} />
          {config.selectable ? (
            <div className="folder-actions">
              <ActionButton id="deleteSelectedBtn" variant="danger-light" hidden>
                <MaterialIcon name="delete" />
                Delete Selected
              </ActionButton>
              <button type="button" className="icon-text-btn" id="clearDraftsBtn">
                <MaterialIcon name="delete_sweep" />
                Clear Local Drafts
              </button>
            </div>
          ) : null}
        </div>

        <div className="folder-summary-strip">
          <div>
            <span>{config.primarySummaryLabel}</span>
            <strong id="folderPlanCount">0</strong>
          </div>
          <div>
            <span>Total Qty</span>
            <strong id="folderTotalQty">0</strong>
          </div>
          <div>
            <span>Demand Sources</span>
            <strong id="folderDemandCount">0</strong>
          </div>
        </div>

        <div className={config.selectable ? "folder-list-header" : "folder-list-header no-selection"}>
          {config.selectable ? (
            <div className="header-checkbox">
              <input type="checkbox" id="selectAllDrafts" aria-label="Select all drafts" />
            </div>
          ) : null}
          <div className="header-icon"></div>
          <div className="header-info">Plan Details</div>
          <div className="header-date">Last Edited</div>
          <div className="header-actions">Actions</div>
        </div>

        <div id="folderPlanList" className="folder-plan-list">
          <EmptyState>{config.emptyText}</EmptyState>
        </div>
      </LegacyCard>
    </div>
  );
}
