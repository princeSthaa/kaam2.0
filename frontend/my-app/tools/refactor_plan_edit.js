const fs = require('fs');

const inhousePath = 'app/components/legacy-pages/production/ProductionInHouseCreatePage.tsx';
const editPath = 'app/components/legacy-pages/production/ProductionPlanEditPage.tsx';

const inhouse = fs.readFileSync(inhousePath, 'utf8');

const mockDataMatch = inhouse.match(/(\/\* ─── Mock Data ─────────────────────────────────────────────────── \*\/(?:.|\n)*?)\/\* ─── Inline styles ─────────────────────────────────────────────── \*\//);
const stylesMatch = inhouse.match(/(\/\* ─── Inline styles ─────────────────────────────────────────────── \*\/(?:.|\n)*?)\/\* ─── Component ─────────────────────────────────────────────────── \*\//);

if (!mockDataMatch || !stylesMatch) {
  console.log('Failed to match sections in InHouse file');
  process.exit(1);
}

const newComponent = `\"use client\";

import { useState, useEffect, useMemo } from \"react\";
import { useSearchParams, useRouter } from \"next/navigation\";
import Link from \"next/link\";

${mockDataMatch[1]}

const mockCustomers = [
  { id: \"CUST-001\", code: \"CUST-001\", name: \"Everest Trekking Co\", phone: \"9801234567\", address: \"Thamel, Kathmandu\", terms: \"Net 30\", location: \"Thamel HQ\" },
  { id: \"CUST-002\", code: \"CUST-002\", name: \"Himalayan Schools\", phone: \"9841122334\", address: \"Patan, Lalitpur\", terms: \"Prepaid\", location: \"Patan Campus\" },
];

${stylesMatch[1]}

/* ─── Component ─────────────────────────────────────────────────── */
export function ProductionPlanEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get(\"planNo\") || searchParams.get(\"planId\") || searchParams.get(\"id\") || \"PP-20260529-001\";

  const [planDate, setPlanDate] = useState(new Date().toISOString().split(\"T\")[0]);
  const [demandType, setDemandType] = useState(\"Customer Order\");
  const [priority, setPriority] = useState(\"Normal\");
  const [outputDestination, setOutputDestination] = useState(\"Customer Dispatch\");
  const [customerId, setCustomerId] = useState(\"CUST-001\");

  const [selectedProducts, setSelectedProducts] = useState([
    {
      productId: \"PRD-001\", productCode: \"PRD-001\", productName: \"School Uniform Set\", productImage: \"\",
      plannedStartDate: planDate, plannedCompletionDate: planDate, requiredDate: planDate,
      variants: [{ id: \"var-1\", fabricId: \"RM-FAB-COT-NAVY\", fabricName: \"Dyed Cotton (Navy Blue)\", swatchColor: \"#1e3a8a\", sizes: { XS: 10, S: 20, M: 40, L: 30, XL: 10, XXL: 0 } }],
      stages: [
        { id: \"01\", name: \"Material Check\", workCenter: \"QC Station 1\", leadHours: \"4\",  date: planDate },
        { id: \"02\", name: \"Cutting\",         workCenter: \"Cutter Auto-B\",  leadHours: \"12\", date: planDate },
        { id: \"03\", name: \"Stitching\",       workCenter: \"Line 4A\",        leadHours: \"48\", date: planDate },
      ],
      productionNotes: \"\",
    },
    {
      productId: \"PRD-002\", productCode: \"PRD-002\", productName: \"School Tracksuit Set\", productImage: \"\",
      plannedStartDate: planDate, plannedCompletionDate: planDate, requiredDate: planDate,
      variants: [{ id: \"var-2\", fabricId: \"RM-FAB-FLEECE-NAVY\", fabricName: \"Fleece Knit (Navy)\", swatchColor: \"#1e3a8a\", sizes: { XS: 0, S: 15, M: 25, L: 15, XL: 0, XXL: 0 } }],
      stages: [
        { id: \"01\", name: \"Cutting\",         workCenter: \"Cutter Auto-B\",  leadHours: \"8\", date: planDate },
        { id: \"02\", name: \"Stitching\",       workCenter: \"Line 4A\",        leadHours: \"24\", date: planDate },
      ],
      productionNotes: \"\",
    }
  ]);
  
  const [activeProductId, setActiveProductId] = useState(selectedProducts[0]?.productId || \"\");

  const activeProduct = selectedProducts.find(p => p.productId === activeProductId) || selectedProducts[0];

  const [fabricModal, setFabricModal] = useState({ show: false, productId: null, variantId: null, category: \"Cotton\", search: \"\" });
  
  // Calculate BOM & Cost
  const materialsRequirements = useMemo(() => {
    const reqs: Record<string, MatReq> = {};
    selectedProducts.forEach(prod => {
      const totalQty = prod.variants.reduce((s, v) => s + Object.values(v.sizes).reduce((a, b) => a + b, 0), 0);
      mockBoms.filter(b => b.productId === prod.productId).forEach(bom => {
        const mat = mockMaterials.find(m => m.id === bom.materialId);
        if (!mat) return;
        const need = totalQty * bom.qtyPerUnit * (1 + bom.wastagePercent / 100);
        if (reqs[mat.materialCode]) { reqs[mat.materialCode].requiredQty += need; }
        else { reqs[mat.materialCode] = { materialCode: mat.materialCode, materialName: mat.name, materialType: mat.type, requiredQty: need, availableQty: mat.availableQty, shortageQty: 0, unit: mat.unit, cost: mat.costPerUnit }; }
      });
    });
    return Object.values(reqs).map(r => ({ ...r, shortageQty: Math.max(r.requiredQty - r.availableQty, 0) }));
  }, [selectedProducts]);

  const estimatedCost = useMemo(() => materialsRequirements.reduce((s, r) => s + r.requiredQty * r.cost, 0), [materialsRequirements]);
  const totalUnits = useMemo(() => selectedProducts.reduce((s, p) => s + p.variants.reduce((a, v) => a + Object.values(v.sizes).reduce((x, y) => x + y, 0), 0), 0), [selectedProducts]);

  // Handlers for Right-Side Editor
  const updateProductField = (field: string, value: string) => {
    if (!activeProductId) return;
    setSelectedProducts(prev => prev.map(p => p.productId === activeProductId ? { ...p, [field]: value } : p));
  };

  const addVariant = () => {
    if (!activeProductId) return;
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, variants: p.variants.concat({ id: \`var-\${Date.now()}\`, fabricId: \"RM-FAB-COT-RED\", fabricName: \"Dyed Cotton (Scarlet Red)\", swatchColor: \"#b91c1c\", sizes: { XS: 0, S: 10, M: 20, L: 20, XL: 10, XXL: 0 } }),
    }));
  };

  const removeVariant = (variantId: string) => {
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : { ...p, variants: p.variants.filter(v => v.id !== variantId) }));
  };

  const updateSize = (variantId: string, size: string, value: number) => {
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, variants: p.variants.map(v => v.id !== variantId ? v : { ...v, sizes: { ...v.sizes, [size]: Math.max(0, value) } }),
    }));
  };

  const addStage = () => {
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, stages: p.stages.concat({ id: String(p.stages.length + 1).padStart(2, \"0\"), name: \"Quality Check\", workCenter: \"QC Table\", leadHours: \"8\", date: planDate }),
    }));
  };
  
  const updateStage = (idx: number, field: string, value: string) => {
    setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : {
      ...p, stages: p.stages.map((s, i) => i !== idx ? s : { ...s, [field]: value }),
    }));
  };

  const applyPreset = (preset: string) => {
    const presets: Record<string, Stage[]> = {
      standard: [
        { id: \"01\", name: \"Material Check\", workCenter: \"QC Station 1\", leadHours: \"4\",  date: planDate },
        { id: \"02\", name: \"Cutting\",         workCenter: \"Cutter Auto-B\",  leadHours: \"12\", date: planDate },
        { id: \"03\", name: \"Stitching\",       workCenter: \"Line 4A\",        leadHours: \"48\", date: planDate },
      ],
      expedited: [
        { id: \"01\", name: \"Material Check\", workCenter: \"QC Station 1\", leadHours: \"2\",  date: planDate },
        { id: \"02\", name: \"Cutting\",         workCenter: \"Cutter Auto-B\",  leadHours: \"6\",  date: planDate },
        { id: \"03\", name: \"Stitching\",       workCenter: \"Line 4A\",        leadHours: \"24\", date: planDate },
        { id: \"04\", name: \"Finishing\",       workCenter: \"QC Table\",       leadHours: \"8\",  date: planDate },
      ],
    };
    if (presets[preset]) {
      setSelectedProducts(prev => prev.map(p => p.productId !== activeProductId ? p : { ...p, stages: presets[preset] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(\"Production Plan updated!\");
    router.push(\"/Production/Plan/PlansDetails\");
  };

  const steps = [
    { icon: \"settings\", label: \"Configuration\", sub: \"Plan details & order\" },
    { icon: \"apparel\",  label: \"Products Workspace\", sub: \"Variants, sizes, routing\" },
    { icon: \"inventory\", label: \"BOM & Budget\", sub: \"Material cost estimator\" },
  ];

  const demandTypesList = [\"Customer Order\", \"Outlet Replenishment\", \"In-house Stock\"];
  const prioritiesList = [\"Normal\", \"Urgent\", \"Seasonal\"];
  const destinationsList = [\"Finished Goods Warehouse\", \"Customer Dispatch\", \"Outlet Transfer\"];

  const selectedCustomer = mockCustomers.find(c => c.id === customerId);

  return (
    <div style={S.page}>
      {/* ── HERO HEADER ──────────────────────────────────────────── */}
      <div style={{...S.hero, background: \"linear-gradient(135deg, #0f172a 0%, #0369a1 55%, #0284c7 100%)\"}}>
        <div style={S.heroBlobA} />
        <div style={S.heroBlobB} />
        <div style={{ zIndex: 1 }}>
          <div style={S.heroLabel}>
            <span className=\"material-symbols-outlined\" style={{ fontSize: 13 }}>edit_note</span>
            PLANNING EDITOR
          </div>
          <h1 style={S.heroTitle}>Edit Production Plan</h1>
          <p style={S.heroSub}>Review and update draft customer order production plans.</p>
          <div style={{ display: \"flex\", gap: 12, marginTop: 16, flexWrap: \"wrap\" }}>
            <div style={S.heroBadge}>
              <span className=\"material-symbols-outlined\" style={{ fontSize: 14, color: \"#7dd3fc\" }}>tag</span>
              {planId}
            </div>
            <div style={S.heroBadge}>
              <span className=\"material-symbols-outlined\" style={{ fontSize: 14, color: \"#7dd3fc\" }}>person</span>
              {selectedCustomer?.name || \"—\"}
            </div>
          </div>
        </div>
        <div style={S.heroActions}>
          <Link href={\`/Production/Plan/Details?id=\${planId}\`} style={S.btnOutlineWhite}>
            <span className=\"material-symbols-outlined\" style={{ fontSize: 16 }}>visibility</span>
            View Details
          </Link>
          <Link href=\"/Production/Index\" style={S.btnSolidWhite}>
            <span className=\"material-symbols-outlined\" style={{ fontSize: 16 }}>arrow_back</span>
            Back to Plans
          </Link>
        </div>
      </div>

      {/* ── STEP INDICATOR ───────────────────────────────────────── */}
      <div style={{ ...S.stepRow, borderRadius: 14, overflow: \"hidden\", border: \"1.5px solid #e5e7eb\", boxShadow: \"0 2px 8px rgba(0,0,0,0.04)\" }}>
        {steps.map((step, i) => (
          <div key={i} style={{ ...S.stepItem(true), borderLeft: i === 0 ? \"none\" : \"1px solid #e5e7eb\", borderRight: \"none\" }}>
            <div style={S.stepNumBubble(true)}>
              <span className=\"material-symbols-outlined\" style={{ fontSize: 14 }}>check</span>
            </div>
            <div>
              <div style={S.stepLabel(true)}>{step.label}</div>
              <div style={S.stepSub}>{step.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: \"flex\", flexDirection: \"column\", gap: 24 }}>
        
        {/* ── SECTION 1: GENERAL CONFIGURATION ────────────────────── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <div style={S.cardIconBox(\"#0284c7\", \"#f0f9ff\")}>
                <span className=\"material-symbols-outlined\" style={{ fontSize: 20 }}>settings</span>
              </div>
              <div>
                <div style={S.cardTitle}>General Configuration</div>
                <div style={S.cardSub}>Plan metadata, demand type & customer order details</div>
              </div>
            </div>
            <span style={S.badgeNeutral}><span className=\"material-symbols-outlined\" style={{ fontSize: 14 }}>edit_note</span>Step 1</span>
          </div>
          <div style={S.cardBody}>
            <div style={S.grid2}>
              <div>
                <label style={S.fieldLabel}>Plan No</label>
                <input style={{...S.input, background: \"#f1f5f9\", color: \"#64748b\"}} type=\"text\" value={planId} readOnly />
              </div>
              <div>
                <label style={S.fieldLabel}>Plan Date</label>
                <input style={{...S.input, background: \"#f1f5f9\", color: \"#64748b\"}} type=\"date\" value={planDate} readOnly />
              </div>
              <div style={{ gridColumn: \"1 / -1\" }}>
                <label style={S.fieldLabel}>Demand Type</label>
                <select style={S.select} value={demandType} onChange={e => setDemandType(e.target.value)}>
                  {demandTypesList.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={S.fieldLabel}>Priority</label>
                <select style={S.select} value={priority} onChange={e => setPriority(e.target.value)}>
                  {prioritiesList.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={S.fieldLabel}>Output Destination</label>
                <select style={S.select} value={outputDestination} onChange={e => setOutputDestination(e.target.value)}>
                  {destinationsList.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Customer Details Block (Hybrid Design) */}
            <div style={{ marginTop: 24, padding: 20, background: \"#f8fafc\", border: \"1.5px solid #e2e8f0\", borderRadius: 12 }}>
              <div style={{ display: \"flex\", justifyContent: \"space-between\", alignItems: \"center\", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: \"#0f172a\" }}>Customer Order Details</div>
                  <div style={{ fontSize: 12, color: \"#64748b\" }}>Linked customer master data for this demand.</div>
                </div>
                <button type=\"button\" style={S.btnGhost}>Change Customer</button>
              </div>
              {selectedCustomer && (
                <div style={{ display: \"grid\", gridTemplateColumns: \"repeat(auto-fit, minmax(150px, 1fr))\", gap: 16 }}>
                  {[
                    [\"Customer Code\", selectedCustomer.code],
                    [\"Customer Name\", selectedCustomer.name],
                    [\"Phone\", selectedCustomer.phone],
                    [\"Address\", selectedCustomer.address],
                    [\"Payment Terms\", selectedCustomer.terms],
                    [\"Delivery Location\", selectedCustomer.location],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: \"#94a3b8\", textTransform: \"uppercase\", letterSpacing: \"0.06em\", fontFamily: \"JetBrains Mono, monospace\" }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: \"#0f172a\", marginTop: 4 }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 2: PRODUCTS WORKSPACE (SPLIT-SCREEN) ────────── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <div style={S.cardIconBox(\"#7c3aed\", \"#f5f3ff\")}>
                <span className=\"material-symbols-outlined\" style={{ fontSize: 20 }}>view_sidebar</span>
              </div>
              <div>
                <div style={S.cardTitle}>Products Workspace (Split-Screen)</div>
                <div style={S.cardSub}>Select a product on the left, and edit its sizes and routing stages on the right.</div>
              </div>
            </div>
            <span style={S.badgeNeutral}><span className=\"material-symbols-outlined\" style={{ fontSize: 14 }}>edit_note</span>Step 2</span>
          </div>

          <div style={{ ...S.cardBody, display: \"flex\", gap: 24, alignItems: \"stretch\", minHeight: 600 }}>
            {/* LEFT PANEL: Scrollable Product List */}
            <div style={{ width: 320, flexShrink: 0, display: \"flex\", flexDirection: \"column\", gap: 12, background: \"#f8fafc\", padding: 16, borderRadius: 12, border: \"1.5px solid #e2e8f0\", overflowY: \"auto\" }}>
               <div style={{ fontSize: 12, fontWeight: 700, color: \"#64748b\", textTransform: \"uppercase\", letterSpacing: \"0.05em\", marginBottom: 4 }}>Order Products ({selectedProducts.length})</div>
               {selectedProducts.map(prod => {
                 const isActive = activeProductId === prod.productId;
                 return (
                   <div key={prod.productId} 
                        onClick={() => setActiveProductId(prod.productId)}
                        style={{ 
                          padding: \"14px 16px\", 
                          background: isActive ? \"#fff\" : \"transparent\",
                          border: \`1.5px solid \${isActive ? \"#2563eb\" : \"transparent\"}\`,
                          borderRadius: 12,
                          cursor: \"pointer\",
                          boxShadow: isActive ? \"0 4px 12px rgba(37,99,235,0.1)\" : \"none\",
                          transition: \"all 0.2s\"
                        }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? \"#1d4ed8\" : \"#334155\" }}>{prod.productName}</div>
                      <div style={{ fontSize: 11, color: \"#64748b\", marginTop: 4, fontFamily: \"JetBrains Mono, monospace\" }}>
                        {prod.productCode} • {prod.variants.reduce((a,v) => a + Object.values(v.sizes).reduce((x,y)=>x+y,0), 0)} pcs
                      </div>
                   </div>
                 );
               })}
               <button type=\"button\" style={{ ...S.btnGhost, marginTop: \"auto\" }}>
                 <span className=\"material-symbols-outlined\" style={{ fontSize: 16 }}>add</span> Add Product
               </button>
            </div>

            {/* RIGHT PANEL: Active Editor */}
            <div style={{ flex: 1, display: \"flex\", flexDirection: \"column\", gap: 24, overflowY: \"auto\" }}>
               {activeProduct ? (
                 <>
                   {/* Editor Header */}
                   <div style={{ display: \"flex\", alignItems: \"center\", justifyContent: \"space-between\", borderBottom: \"1.5px solid #e2e8f0\", paddingBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: \"#0f172a\" }}>{activeProduct.productName}</div>
                        <div style={{ fontSize: 13, color: \"#64748b\", marginTop: 2 }}>{activeProduct.productCode}</div>
                      </div>
                      <div style={S.badgeNeutral}>{activeProduct.variants.reduce((a,v) => a + Object.values(v.sizes).reduce((x,y)=>x+y,0), 0)} Total Pcs</div>
                   </div>

                   {/* Production Timeline */}
                   <div style={S.variantCard}>
                      <div style={S.variantHeader}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: \"#0f172a\", display: \"flex\", alignItems: \"center\", gap: 6 }}>
                          <span className=\"material-symbols-outlined\" style={{ fontSize: 16, color: \"#64748b\" }}>calendar_month</span> Production Timeline
                        </div>
                      </div>
                      <div style={{ ...S.grid3, padding: 16 }}>
                        <div>
                          <label style={S.fieldLabel}>Planned Start</label>
                          <input style={{ ...S.input, height: 38 }} type=\"date\" value={activeProduct.plannedStartDate} onChange={e => updateProductField(\"plannedStartDate\", e.target.value)} />
                        </div>
                        <div>
                          <label style={S.fieldLabel}>Planned End</label>
                          <input style={{ ...S.input, height: 38 }} type=\"date\" value={activeProduct.plannedCompletionDate} onChange={e => updateProductField(\"plannedCompletionDate\", e.target.value)} />
                        </div>
                        <div>
                          <label style={S.fieldLabel}>Required By</label>
                          <input style={{ ...S.input, height: 38 }} type=\"date\" value={activeProduct.requiredDate} onChange={e => updateProductField(\"requiredDate\", e.target.value)} />
                        </div>
                      </div>
                   </div>

                   {/* Variants & Sizes */}
                   <div>
                     <div style={{ ...S.flexBetween, marginBottom: 12 }}>
                       <div style={{ fontSize: 13, fontWeight: 700, color: \"#0f172a\", display: \"flex\", alignItems: \"center\", gap: 6 }}>
                         <span className=\"material-symbols-outlined\" style={{ fontSize: 16, color: \"#64748b\" }}>palette</span> Fabric Variants & Sizes
                       </div>
                       <button type=\"button\" onClick={addVariant} style={S.btnAddVariant}>
                         <span className=\"material-symbols-outlined\" style={{ fontSize: 15 }}>add</span> Add Variant
                       </button>
                     </div>
                     <div style={{ display: \"flex\", flexDirection: \"column\", gap: 12 }}>
                        {activeProduct.variants.map((v, vi) => (
                          <div key={v.id} style={S.variantCard}>
                            <div style={S.variantHeader}>
                              <div style={{ display: \"flex\", alignItems: \"center\", gap: 10 }}>
                                <div style={S.swatch(v.swatchColor, v.swatchColor === \"#e2e8f0\")} />
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: \"#0f172a\" }}>{v.fabricName}</div>
                                  <div style={{ fontSize: 11, color: \"#94a3b8\", marginTop: 1, fontFamily: \"JetBrains Mono, monospace\" }}>Variant {vi + 1}</div>
                                </div>
                              </div>
                              <div style={{ display: \"flex\", alignItems: \"center\", gap: 8 }}>
                                <button type=\"button\" style={{ ...S.btnGhost, padding: \"6px 14px\" }}>Change</button>
                                {activeProduct.variants.length > 1 && (
                                  <button type=\"button\" onClick={() => removeVariant(v.id)} style={{ ...S.btnDanger, padding: 5 }}>
                                    <span className=\"material-symbols-outlined\" style={{ fontSize: 17 }}>close</span>
                                  </button>
                                )}
                              </div>
                            </div>
                            <div style={S.sizesGrid}>
                              {SIZES.map(size => (
                                <div key={size} style={S.sizeCell}>
                                  <span style={S.sizeLabel}>{size}</span>
                                  <input type=\"number\" min={0} style={S.sizeInput} value={v.sizes[size] || 0} onChange={e => updateSize(v.id, size, parseInt(e.target.value)||0)} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                     </div>
                   </div>

                   {/* Routing Stages */}
                   <div>
                     <div style={{ ...S.flexBetween, marginBottom: 12 }}>
                       <div style={{ fontSize: 13, fontWeight: 700, color: \"#0f172a\", display: \"flex\", alignItems: \"center\", gap: 6 }}>
                         <span className=\"material-symbols-outlined\" style={{ fontSize: 16, color: \"#64748b\" }}>timeline</span> Production Stages & Routing
                       </div>
                       <div style={{ display: \"flex\", alignItems: \"center\", gap: 12 }}>
                         <select style={{ ...S.select, width: \"auto\", height: 32, padding: \"4px 10px\", fontSize: 12 }} defaultValue=\"\" onChange={e => e.target.value && applyPreset(e.target.value)}>
                           <option value=\"\" disabled>Apply Preset...</option>
                           <option value=\"standard\">Standard 3-Step</option>
                           <option value=\"expedited\">Expedited 4-Step</option>
                         </select>
                         <button type=\"button\" onClick={addStage} style={S.btnAddStage}>
                           <span className=\"material-symbols-outlined\" style={{ fontSize: 15 }}>add</span> Add Stage
                         </button>
                       </div>
                     </div>
                     <div style={{ display: \"flex\", flexDirection: \"column\", gap: 8 }}>
                       {activeProduct.stages.map((stage, si) => (
                         <div key={stage.id} style={S.stageRow}>
                           <span className=\"material-symbols-outlined\" style={{ fontSize: 16, color: \"#cbd5e1\", cursor: \"grab\" }}>drag_indicator</span>
                           <div style={S.stageIndex}>{stage.id}</div>
                           <div style={S.stageInputs}>
                             <input style={S.stageThinInput} type=\"text\" value={stage.name} placeholder=\"Stage name\" onChange={e => updateStage(si, \"name\", e.target.value)} />
                             <input style={S.stageThinInput} type=\"text\" value={stage.workCenter} placeholder=\"Work Center\" onChange={e => updateStage(si, \"workCenter\", e.target.value)} />
                             <input style={S.stageThinInput} type=\"number\" value={stage.leadHours} placeholder=\"Hours\" onChange={e => updateStage(si, \"leadHours\", e.target.value)} />
                             <input style={S.stageThinInput} type=\"date\" value={stage.date} onChange={e => updateStage(si, \"date\", e.target.value)} />
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                 </>
               ) : (
                 <div style={S.emptyState}>
                   <div style={S.emptyIcon}><span className=\"material-symbols-outlined\">apparel</span></div>
                   <div style={{ fontSize: 15, fontWeight: 700, color: \"#374151\" }}>No product selected</div>
                   <div style={{ fontSize: 13, color: \"#94a3b8\" }}>Select a product from the left to edit its routing and sizes.</div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* ── SECTION 3: BOM & BUDGET (COMPLETELY REPLACED) ────────── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <div style={S.cardIconBox(\"#059669\", \"#dcfce7\")}>
                <span className=\"material-symbols-outlined\" style={{ fontSize: 20 }}>inventory_2</span>
              </div>
              <div>
                <div style={S.cardTitle}>Bill of Materials & Stock Estimator</div>
                <div style={S.cardSub}>Dynamic material requirement generated from the products and variants above</div>
              </div>
            </div>
            <span style={S.badgeNeutral}><span className=\"material-symbols-outlined\" style={{ fontSize: 14 }}>edit_note</span>Step 3</span>
          </div>
          <div style={{ padding: 0 }}>
            {materialsRequirements.length === 0 ? (
              <div style={S.emptyState}>
                <div style={S.emptyIcon}><span className=\"material-symbols-outlined\">receipt_long</span></div>
                <div style={{ fontSize: 15, fontWeight: 700, color: \"#374151\" }}>No materials required</div>
                <div style={{ fontSize: 13, color: \"#94a3b8\", textAlign: \"center\" }}>Add products and quantities to generate the BOM.</div>
              </div>
            ) : (
              <div style={{ overflowX: \"auto\" }}>
                <table style={S.matTable}>
                  <thead>
                    <tr>
                      <th style={S.matTh}>Material Name</th>
                      <th style={S.matTh}>Type</th>
                      <th style={S.matTh}>Required</th>
                      <th style={S.matTh}>Available</th>
                      <th style={S.matTh}>Shortage</th>
                      <th style={S.matTh}>Unit Cost</th>
                      <th style={S.matTh}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialsRequirements.map(mat => (
                      <tr key={mat.materialCode}>
                        <td style={{ ...S.matTd, fontWeight: 600 }}>{mat.materialName} <span style={{ fontSize: 10, color: \"#94a3b8\", display: \"block\", fontFamily: \"JetBrains Mono, monospace\", fontWeight: 400 }}>{mat.materialCode}</span></td>
                        <td style={S.matTd}>{mat.materialType}</td>
                        <td style={{ ...S.matTd, fontWeight: 700, color: \"#0f172a\" }}>{mat.requiredQty.toLocaleString(undefined,{maximumFractionDigits:2})} {mat.unit}</td>
                        <td style={S.matTd}>{mat.availableQty.toLocaleString()} {mat.unit}</td>
                        <td style={{ ...S.matTd, color: mat.shortageQty > 0 ? \"#dc2626\" : \"#10b981\", fontWeight: 600 }}>{mat.shortageQty.toLocaleString(undefined,{maximumFractionDigits:2})} {mat.unit}</td>
                        <td style={S.matTd}>Rs. {mat.cost.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                        <td style={S.matTd}>
                          {mat.shortageQty > 0 ? (
                            <span style={S.badgeError}><span className=\"material-symbols-outlined\" style={{ fontSize: 12 }}>warning</span>Shortage</span>
                          ) : (
                            <span style={S.badgeSuccess}><span className=\"material-symbols-outlined\" style={{ fontSize: 12 }}>check_circle</span>In Stock</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div style={{ padding: 24, background: \"#fafbff\", borderTop: \"1px solid #f1f5f9\" }}>
            <div style={S.summaryBar}>
              <div style={S.summaryItem}>
                <div style={S.summaryVal}>{totalUnits.toLocaleString()}</div>
                <div style={S.summaryLbl}>Total Garments</div>
              </div>
              <div style={S.summaryDivider} />
              <div style={S.summaryItem}>
                <div style={S.summaryVal}>{materialsRequirements.length}</div>
                <div style={S.summaryLbl}>Unique Materials</div>
              </div>
              <div style={S.summaryDivider} />
              <div style={S.summaryItem}>
                <div style={S.summaryVal}>{materialsRequirements.filter(m => m.shortageQty > 0).length}</div>
                <div style={S.summaryLbl}>Shortages Found</div>
              </div>
              <div style={S.summaryDivider} />
              <div style={{ ...S.summaryItem, alignItems: \"flex-end\", flex: 1 }}>
                <div style={{ ...S.summaryVal, color: \"#60a5fa\" }}>Rs. {estimatedCost.toLocaleString(\"en-US\", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div style={S.summaryLbl}>Estimated Material Budget</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FORM ACTIONS ───────────────────────────────────────────── */}
        <div style={{ ...S.card, padding: 24, display: \"flex\", justifyContent: \"flex-end\", gap: 16 }}>
          <Link href={\`/Production/Plan/Details?id=\${planId}\`} style={S.btnSecondary}>Cancel Edits</Link>
          <button type=\"submit\" style={S.btnPrimary}>
            <span className=\"material-symbols-outlined\" style={{ fontSize: 18 }}>save</span>
            Save Changes to Draft
          </button>
        </div>
      </form>
    </div>
  );
}
`;

fs.writeFileSync(editPath, newComponent);
console.log('Successfully wrote ProductionPlanEditPage.tsx');
