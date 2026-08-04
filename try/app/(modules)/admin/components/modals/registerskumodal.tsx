"use client";

import React, { useState, useEffect, useRef } from "react";

export interface MaterialBreakdownSizeRow {
  size: string;
  requiredQty: string;
}

export interface MaterialCompositionItem {
  id: string;
  code: string;
  description: string;
  qty: string;
  isExpanded?: boolean;
  sizeBreakdown?: MaterialBreakdownSizeRow[];
}

export interface PipelineStageItem {
  id: string;
  stageName: string;
  team: string;
  durationMinutes: number;
  priority: "High" | "Medium" | "Low";
}

export interface RegisterSkuFormData {
  productName: string;
  baseSku: string;
  category: string;
  uom: string;
  lifecycleStatus: string;
  gender: string;
  selectedSizes: string[];
  materials: MaterialCompositionItem[];
  pipelineStages: PipelineStageItem[];
  thumbnailUrl?: string;
  adminNotes: string;
}

interface RegisterSkuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: RegisterSkuFormData) => void;
}

// Preset Garment Materials for searchable dropdown + fetched materials
const PRESET_GARMENT_MATERIALS = [
  { code: "MAT-FAB-001", name: "Fabric - 100% Cotton Denim (14oz Indigo)" },
  { code: "MAT-THR-042", name: "Thread - Indigo Polyester Topstitch Thread" },
  { code: "MAT-ACC-088", name: "Zipper - YKK 8 inch Heavy Brass" },
  { code: "MAT-BTN-017", name: "Buttons - Antiqued Brass Shank Buttons (17mm)" },
  { code: "MAT-LBL-005", name: "Label - Genuine Leather Back Patch Label" },
  { code: "MAT-LIN-012", name: "Lining - Heavyweight Cotton Pocketing Twill" },
  { code: "MAT-RVT-009", name: "Rivets - Copper Reinforced Pocket Rivets" },
  { code: "MAT-DYE-002", name: "Dye - Organic Vat Indigo Liquid Dye Concentrate" },
];

const MANUFACTURING_STAGE_OPTIONS = [
  "Cutting",
  "Stitching",
  "Embroidery",
  "Printing",
  "Washing",
  "Dyeing",
  "Button Holing",
  "Trimming",
  "Quality Control (QC)",
  "Ironing & Pressing",
  "Packaging",
  "Final Audit",
];

const STAGE_TEAM_MAP: Record<string, string[]> = {
  Cutting: [
    "Cutting Team Alpha",
    "Cutting Team Beta (Automatic Spreader)",
    "Pattern & Fabric Prep Team",
    "Cutting Line 1",
    "Cutting Line 2",
    "Unassigned / Auto-Route",
  ],
  Stitching: [
    "Stitching Unit 1 - Main Assembly",
    "Stitching Unit 2 - Pocket & Collar",
    "Heavy Duty Sewing Team",
    "Overlock & Hemming Team",
    "Stitching Line A",
    "Stitching Line B",
    "Unassigned / Auto-Route",
  ],
  Embroidery: [
    "Embroidery Department - Multi-Head Machine",
    "Patch & Applique Team",
    "Specialty Stitching Unit",
    "Unassigned / Auto-Route",
  ],
  Printing: [
    "Screen Printing Workshop",
    "Heat Transfer & Sublimation Team",
    "Digital Garment Printing (DTG)",
    "Unassigned / Auto-Route",
  ],
  Washing: [
    "Industrial Wash House - Denim Indigo",
    "Enzyme & Stone Wash Unit",
    "Garment Softening & Rinsing",
    "Unassigned / Auto-Route",
  ],
  Dyeing: [
    "Garment Dyeing Lab",
    "Tie-Dye & Dip Dye Specialists",
    "Color Matching & Vat Dyeing",
    "Unassigned / Auto-Route",
  ],
  "Button Holing": [
    "Button Hole & Hardware Attaching Unit",
    "Rivet & Snap Fastener Team",
    "Unassigned / Auto-Route",
  ],
  Trimming: [
    "Thread Trimming & Cleaning Team",
    "Finishing Prep Line",
    "Unassigned / Auto-Route",
  ],
  "Quality Control (QC)": [
    "AQL 2.5 Inspection Team Alpha",
    "AQL 1.5 Senior QC Audit Unit",
    "Measurement & Defect Checker Team",
    "Unassigned / Auto-Route",
  ],
  "Ironing & Pressing": [
    "Steam Pressing & Ironing Line 1",
    "Tunnel Finisher & Form Pressing",
    "Unassigned / Auto-Route",
  ],
  Packaging: [
    "Polybagging & Hangtag Team",
    "Master Carton & Barcode Packing Unit",
    "Unassigned / Auto-Route",
  ],
  "Final Audit": [
    "Final Warehouse Audit Team",
    "Compliance & Export Dispatch Unit",
    "Unassigned / Auto-Route",
  ],
};

export const getTeamsForStage = (stageName: string): string[] => {
  return STAGE_TEAM_MAP[stageName] || [
    "Team Alpha",
    "Team Beta",
    "Team Gamma",
    "Unassigned / Auto-Route",
  ];
};

// Searchable Dropdown for Manufacturing Stages
function SearchableStageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = MANUFACTURING_STAGE_OPTIONS.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded font-mono text-xs cursor-pointer flex items-center justify-between shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-slate-900 truncate">{value || "Select Stage"}</span>
        <span className="material-symbols-outlined text-slate-400 text-sm">arrow_drop_down</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 flex flex-col overflow-hidden text-xs">
          <div className="p-1.5 border-b border-slate-100 bg-slate-50 sticky top-0">
            <input
              type="text"
              placeholder="Search stage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-slate-900"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto p-1 divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="p-2 text-slate-400 text-center font-mono">No stage found</div>
            ) : (
              filtered.map((stage) => (
                <div
                  key={stage}
                  className="px-2.5 py-1.5 hover:bg-slate-100 rounded cursor-pointer font-semibold text-slate-800 transition-colors flex items-center justify-between"
                  onClick={() => {
                    onChange(stage);
                    setIsOpen(false);
                  }}
                >
                  <span>{stage}</span>
                  {value === stage && (
                    <span className="material-symbols-outlined text-xs font-bold text-slate-900">check</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function RegisterSkuModal({
  isOpen,
  onClose,
  onSave,
}: RegisterSkuModalProps) {
  const [formData, setFormData] = useState<RegisterSkuFormData>({
    productName: "Premium Denim Jacket - Indigo Series",
    baseSku: "JKT-DNM-IND-001",
    category: "jackets",
    uom: "pcs",
    lifecycleStatus: "active",
    gender: "unisex",
    selectedSizes: ["s", "m", "l", "xl"],
    materials: [],
    pipelineStages: [
      {
        id: "1",
        stageName: "Cutting",
        team: "Cutting Team Alpha",
        durationMinutes: 15,
        priority: "Medium",
      },
      {
        id: "2",
        stageName: "Stitching",
        team: "Stitching Unit 1 - Main Assembly",
        durationMinutes: 45,
        priority: "High",
      },
    ],
    adminNotes: "",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Searchable Material Dropdown state
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<{ code: string; name: string } | null>(null);
  const [materialQty, setMaterialQty] = useState("");
  const [availableMaterials, setAvailableMaterials] = useState<{ code: string; name: string }[]>(PRESET_GARMENT_MATERIALS);
  const materialDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch materials from API if available
  useEffect(() => {
    fetch("http://localhost:5083/api/material-type")
      .then((res) => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiMaterials = data.map((item, idx) => ({
            code: item.code || `MAT-API-${idx + 100}`,
            name: item.name || item.Name || "Material Item",
          }));
          setAvailableMaterials((prev) => {
            const map = new Map();
            [...prev, ...apiMaterials].forEach((m) => map.set(m.code, m));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  // Handle click outside for material dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (materialDropdownRef.current && !materialDropdownRef.current.contains(e.target as Node)) {
        setIsMaterialDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

const ALL_SIZE_ORDER = ["xs", "s", "m", "l", "xl", "xxl"];

const calculateTotalQtyString = (sizeBreakdown?: MaterialBreakdownSizeRow[]): string => {
  if (!sizeBreakdown || sizeBreakdown.length === 0) return "0";

  let sum = 0;
  let unit = "";
  let hasValidNumber = false;

  sizeBreakdown.forEach((row) => {
    if (!row.requiredQty) return;
    const trimmed = row.requiredQty.trim();
    const match = trimmed.match(/^([\d.]+)\s*(.*)$/);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val)) {
        sum += val;
        hasValidNumber = true;
      }
      if (match[2] && !unit) {
        unit = match[2];
      }
    } else {
      const val = parseFloat(trimmed);
      if (!isNaN(val)) {
        sum += val;
        hasValidNumber = true;
      }
    }
  });

  if (!hasValidNumber) return "0";
  const formattedSum = sum % 1 === 0 ? sum.toString() : sum.toFixed(2);
  return unit ? `${formattedSum} ${unit}` : `${formattedSum}`;
};

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => {
      const exists = prev.selectedSizes.includes(size);
      const rawSizes = exists
        ? prev.selectedSizes.filter((s) => s !== size)
        : [...prev.selectedSizes, size];
      const updatedSizes = ALL_SIZE_ORDER.filter((s) => rawSizes.includes(s));

      const updatedMaterials = prev.materials.map((mat) => {
        const existingMap = new Map(
          (mat.sizeBreakdown || []).map((row) => [row.size.toLowerCase(), row.requiredQty])
        );
        const newBreakdown = updatedSizes.map((sz) => ({
          size: sz.toUpperCase(),
          requiredQty: existingMap.has(sz.toLowerCase()) ? existingMap.get(sz.toLowerCase())! : "",
        }));
        return { ...mat, sizeBreakdown: newBreakdown };
      });

      return { ...prev, selectedSizes: updatedSizes, materials: updatedMaterials };
    });
  };

  const handleRemoveMaterial = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
  };

  const handleToggleExpandMaterial = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => (m.id === id ? { ...m, isExpanded: !m.isExpanded } : m)),
    }));
  };

  const handleUpdateSizeRequiredQty = (
    materialId: string,
    size: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => {
        if (m.id === materialId && m.sizeBreakdown) {
          return {
            ...m,
            sizeBreakdown: m.sizeBreakdown.map((row) =>
              row.size === size ? { ...row, requiredQty: value } : row
            ),
          };
        }
        return m;
      }),
    }));
  };

  const handleAddMaterialSubmit = () => {
    if (!selectedMaterial) return;
    const rawSizes = formData.selectedSizes.length > 0 ? formData.selectedSizes : ["s", "m", "l", "xl"];
    const activeSizes = ALL_SIZE_ORDER.filter((s) => rawSizes.includes(s));

    const newItem: MaterialCompositionItem = {
      id: Date.now().toString(),
      code: selectedMaterial.code,
      description: selectedMaterial.name,
      qty: "",
      isExpanded: true,
      sizeBreakdown: activeSizes.map((sz) => ({
        size: sz.toUpperCase(),
        requiredQty: "",
      })),
    };
    setFormData((prev) => ({
      ...prev,
      materials: [...prev.materials, newItem],
    }));
    setSelectedMaterial(null);
    setMaterialSearchQuery("");
    setIsAddingMaterial(false);
  };

  // Stage Handlers
  const handleAddStage = () => {
    const existingCount = formData.pipelineStages.length;
    const nextStageName = MANUFACTURING_STAGE_OPTIONS[existingCount % MANUFACTURING_STAGE_OPTIONS.length];
    const availableTeams = getTeamsForStage(nextStageName);

    const newStage: PipelineStageItem = {
      id: Date.now().toString(),
      stageName: nextStageName,
      team: availableTeams[0],
      durationMinutes: 30,
      priority: "Medium",
    };
    setFormData((prev) => ({
      ...prev,
      pipelineStages: [...prev.pipelineStages, newStage],
    }));
  };

  const handleRemoveStage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      pipelineStages: prev.pipelineStages.filter((s) => s.id !== id),
    }));
  };

  const handleUpdateStage = (id: string, key: keyof PipelineStageItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      pipelineStages: prev.pipelineStages.map((s) => {
        if (s.id === id) {
          if (key === "stageName") {
            const availableTeams = getTeamsForStage(value);
            return {
              ...s,
              stageName: value,
              team: availableTeams[0], // Automatically update team assignment for selected stage
            };
          }
          return { ...s, [key]: value };
        }
        return s;
      }),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
      setFormData((prev) => ({ ...prev, thumbnailUrl: url }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.baseSku.trim()) return;
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  const filteredAvailableMaterials = availableMaterials.filter(
    (m) =>
      m.name.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(materialSearchQuery.toLowerCase())
  );

  const isBomComplete = formData.materials.length > 0;
  const isSkuValid = formData.baseSku.trim().length >= 3;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-900">barcode_scanner</span>
              Register Product SKU
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Define master data, categorization, material links, and manufacturing pipeline for a new production unit.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body (Scrollable Bento Grid) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Core Details, Sizing, BOM, Manufacturing Pipeline (8 cols) */}
            <div className="md:col-span-8 space-y-6 flex flex-col">
              {/* Core Identification Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="material-symbols-outlined text-slate-900 text-lg">inventory_2</span>
                  <h3 className="font-bold text-slate-900 text-sm">Core Identification</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block" htmlFor="productName">
                      Product Name *
                    </label>
                    <input
                      id="productName"
                      type="text"
                      required
                      placeholder="e.g. Premium Denim Jacket - Indigo Series"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block" htmlFor="baseSku">
                      Base SKU Code *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <span className="material-symbols-outlined text-sm">barcode</span>
                      </span>
                      <input
                        id="baseSku"
                        type="text"
                        required
                        placeholder="JKT-DNM-IND-001"
                        value={formData.baseSku}
                        onChange={(e) => setFormData({ ...formData, baseSku: e.target.value.toUpperCase() })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs uppercase focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block" htmlFor="category">
                      Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="jackets">Jackets & Outerwear</option>
                      <option value="denim">Denim & Trousers</option>
                      <option value="tops">Shirts & Tops</option>
                      <option value="knitwear">Knitwear & Hoodies</option>
                      <option value="trims">Trims & Accessories</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block" htmlFor="uom">
                      Default UoM
                    </label>
                    <select
                      id="uom"
                      value={formData.uom}
                      onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="m">Meters (m)</option>
                      <option value="kg">Kilograms (kg)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block" htmlFor="lifecycle">
                      Lifecycle Status
                    </label>
                    <select
                      id="lifecycle"
                      value={formData.lifecycleStatus}
                      onChange={(e) => setFormData({ ...formData, lifecycleStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="active">Active (Production)</option>
                      <option value="proto">Prototype</option>
                      <option value="eol">End of Life</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block" htmlFor="gender">
                      Gender / Variant
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="unisex">Unisex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sizing Configuration Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="material-symbols-outlined text-slate-900 text-lg">straighten</span>
                  <h3 className="font-bold text-slate-900 text-sm">Sizing Configuration</h3>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Available Sizes
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {["xs", "s", "m", "l", "xl", "xxl"].map((sz) => {
                      const isChecked = formData.selectedSizes.includes(sz);
                      return (
                        <label
                          key={sz}
                          className={`flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer font-mono font-bold text-xs transition-all ${
                            isChecked
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSizeToggle(sz)}
                            className="sr-only"
                          />
                          <span>{sz.toUpperCase()}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Material Composition Card (With Searchable Material Dropdown Menu) */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900 text-lg">inventory_2</span>
                    <h3 className="font-bold text-slate-900 text-sm">Material Composition (BOM)</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                    className="flex items-center gap-1 text-slate-900 hover:bg-slate-100 px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] border border-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isAddingMaterial ? "remove" : "add"}
                    </span>
                    {isAddingMaterial ? "Cancel" : "Add Material"}
                  </button>
                </div>

                {/* Searchable Material Select Form */}
                {isAddingMaterial && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-fadeIn">
                    <div className="relative" ref={materialDropdownRef}>
                      <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        SEARCH & SELECT MATERIAL *
                      </label>
                      <div
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                        onClick={() => setIsMaterialDropdownOpen(!isMaterialDropdownOpen)}
                      >
                        <span className={selectedMaterial ? "font-semibold text-slate-900" : "text-slate-400"}>
                          {selectedMaterial ? `${selectedMaterial.code} - ${selectedMaterial.name}` : "Search material..."}
                        </span>
                        <span className="material-symbols-outlined text-slate-400 text-sm">arrow_drop_down</span>
                      </div>

                      {/* Searchable Options Menu */}
                      {isMaterialDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 flex flex-col overflow-hidden">
                          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                            <input
                              type="text"
                              placeholder="Type to search fabric, thread, trim..."
                              value={materialSearchQuery}
                              onChange={(e) => setMaterialSearchQuery(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-900"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="overflow-y-auto p-1 divide-y divide-slate-50">
                            {filteredAvailableMaterials.length === 0 ? (
                              <div className="p-3 text-slate-400 text-center font-mono">No matching materials found</div>
                            ) : (
                              filteredAvailableMaterials.map((mat) => (
                                <div
                                  key={mat.code}
                                  className="px-3 py-2 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                                  onClick={() => {
                                    setSelectedMaterial(mat);
                                    setIsMaterialDropdownOpen(false);
                                  }}
                                >
                                  <div>
                                    <div className="font-bold text-slate-900">{mat.name}</div>
                                    <div className="text-[10px] font-mono text-slate-400">{mat.code}</div>
                                  </div>
                                  {selectedMaterial?.code === mat.code && (
                                    <span className="material-symbols-outlined text-sm font-bold text-slate-900">check</span>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddMaterialSubmit}
                        disabled={!selectedMaterial}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg font-mono font-bold text-xs hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add to BOM
                      </button>
                    </div>
                  </div>
                )}

                {/* Multi-Material Accordions / Precision Matrix (Stitch 9f8bd0aaaadd446ea129a1abb67faea8) */}
                <div className="space-y-3">
                  {formData.materials.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 font-mono border border-dashed border-slate-200 rounded-lg">
                      No materials linked in BOM yet. Click &quot;Add Material&quot; to configure.
                    </div>
                  ) : (
                    formData.materials.map((mat) => {
                      const calculatedTotalStr = calculateTotalQtyString(mat.sizeBreakdown);
                      return (
                        <div
                          key={mat.id}
                          className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all"
                        >
                          {/* Accordion Header Bar */}
                          <div className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 transition-colors border-b border-slate-200/60">
                            <button
                              type="button"
                              onClick={() => handleToggleExpandMaterial(mat.id)}
                              className="flex items-center gap-3 text-left flex-1"
                            >
                              <span className="material-symbols-outlined text-slate-500 text-lg transition-transform">
                                {mat.isExpanded ? "expand_more" : "chevron_right"}
                              </span>
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {mat.description}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-slate-600 px-2 py-0.5 bg-slate-200/80 rounded">
                                {mat.code}
                              </span>
                            </button>

                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                Total: {calculatedTotalStr}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMaterial(mat.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                                title="Remove Material"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Size Breakdown Table (Expanded View) */}
                          {mat.isExpanded && mat.sizeBreakdown && mat.sizeBreakdown.length > 0 && (
                            <div className="p-3 bg-slate-50 border-t border-slate-200/60 space-y-3">
                              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                                    <tr>
                                      <th className="py-2.5 px-4 font-bold text-slate-700">Size Variant</th>
                                      <th className="py-2.5 px-4 text-right font-bold text-slate-700">Required Quantity</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-mono">
                                    {mat.sizeBreakdown.map((row) => (
                                      <tr key={row.size} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px]">
                                            {row.size}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-slate-700 text-right">
                                          <input
                                            type="text"
                                            placeholder="e.g. 1.5 m"
                                            value={row.requiredQty}
                                            onChange={(e) =>
                                              handleUpdateSizeRequiredQty(mat.id, row.size, e.target.value)
                                            }
                                            className="w-32 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-right font-mono text-xs focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm"
                                          />
                                        </td>
                                      </tr>
                                    ))}

                                    {/* Live Updated TOTAL Summary Row */}
                                    <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-200">
                                      <td className="py-3 px-4 font-mono text-xs text-slate-900 uppercase tracking-wider">
                                        TOTAL REQUIRED MATERIAL
                                      </td>
                                      <td className="py-3 px-4 text-slate-900 text-right font-mono text-sm">
                                        {calculatedTotalStr}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* Save & Done Action */}
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleExpandMaterial(mat.id)}
                                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-mono font-bold text-xs hover:bg-slate-800 transition-all shadow flex items-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
                                  Save & Done
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Manufacturing Pipeline Card (With Searchable Stage & Dropdown Team Assignment) */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900 text-lg">account_tree</span>
                    <h3 className="font-bold text-slate-900 text-sm">Manufacturing Pipeline</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStage}
                    className="flex items-center gap-1 text-slate-900 hover:bg-slate-100 px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] border border-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Add New Stage
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.pipelineStages.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 font-mono border border-dashed border-slate-200 rounded-lg">
                      No manufacturing stages added yet. Click &quot;Add New Stage&quot; to configure.
                    </div>
                  ) : (
                    formData.pipelineStages.map((stage) => (
                      <div
                        key={stage.id}
                        className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg bg-slate-50 border border-slate-200 relative group text-xs"
                      >
                        {/* Searchable Stage Selection (3 cols) */}
                        <div className="col-span-3">
                          <label className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Stage *
                          </label>
                          <SearchableStageSelect
                            value={stage.stageName}
                            onChange={(newStage) => handleUpdateStage(stage.id, "stageName", newStage)}
                          />
                        </div>

                        {/* Team Assignment Dropdown (3 cols - synced to stage) */}
                        <div className="col-span-3">
                          <label className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Team Assignment
                          </label>
                          <select
                            value={stage.team}
                            onChange={(e) => handleUpdateStage(stage.id, "team", e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded font-mono text-xs focus:outline-none cursor-pointer"
                          >
                            {getTeamsForStage(stage.stageName).map((teamOpt) => (
                              <option key={teamOpt} value={teamOpt}>
                                {teamOpt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Duration (m)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={stage.durationMinutes}
                            onChange={(e) => handleUpdateStage(stage.id, "durationMinutes", parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded font-mono text-xs focus:outline-none text-center"
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Priority
                          </label>
                          <select
                            value={stage.priority}
                            onChange={(e) => handleUpdateStage(stage.id, "priority", e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded font-mono text-xs focus:outline-none cursor-pointer"
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>

                        <div className="col-span-1 flex justify-end pb-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveStage(stage.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Thumbnail & Validation (4 cols) */}
            <div className="md:col-span-4 space-y-6">
              {/* Product Thumbnail Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="material-symbols-outlined text-slate-900 text-lg">image</span>
                  <h3 className="font-bold text-slate-900 text-sm">Product Thumbnail</h3>
                </div>

                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer min-h-[160px] text-center group overflow-hidden">
                  {thumbnailPreview ? (
                    <div className="relative w-full h-36 flex items-center justify-center">
                      <img
                        src={thumbnailPreview}
                        alt="SKU Preview"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono text-[11px] font-bold">
                        Change Image
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-lg">upload_file</span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs">Drop image here</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">JPEG, PNG up to 2MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              {/* Validation & Metadata Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="material-symbols-outlined text-slate-900 text-lg">fact_check</span>
                  <h3 className="font-bold text-slate-900 text-sm">Validation</h3>
                </div>

                <div className="space-y-3 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">SKU Uniqueness</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                        isSkuValid
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSkuValid ? "bg-emerald-600" : "bg-amber-600"
                        }`}
                      ></span>
                      {isSkuValid ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">BOM Status</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                        isBomComplete
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isBomComplete ? "bg-emerald-600" : "bg-amber-600"
                        }`}
                      ></span>
                      {isBomComplete ? "COMPLETE" : "INCOMPLETE"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1 font-sans">
                    <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block" htmlFor="notes">
                      Admin Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="Internal notes for this SKU registration..."
                      value={formData.adminNotes}
                      onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-mono text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg transition-colors border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">save</span>
              Register SKU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterSkuModal;
