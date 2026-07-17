"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/app/components/Sidebar';
import { PageShell } from '@/app/components/ui/PageShell';
import { AppHeader } from '@/app/components/AppHeader';

export default function BatchDrillDownPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = (params.batchId as string) || "ST-1002";
    
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchPlan = () => {
        setLoading(true);
        fetch(`http://localhost:5083/api/production-plans`)
            .then(r => r.json())
            .then(all => {
                if (Array.isArray(all)) {
                    const found = all.find((p: any) => p.planId === batchId || p.PlanId === batchId);
                    setPlan(found || null);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPlan();
    }, [batchId]);

    const totalUnits = useMemo(() => {
        if (!plan) return 0;
        const products = plan.products || plan.Products || [];
        return products.reduce((sum: number, p: any) => sum + (p.quantity || p.Quantity || 0), 0);
    }, [plan]);

    const uniqueProducts = useMemo(() => {
        if (!plan) return 0;
        return (plan.products || plan.Products || []).length;
    }, [plan]);

    const progressPct = useMemo(() => {
        if (!plan) return 0;
        const stages = plan.stages || plan.Stages || [];
        if (stages.length === 0) return 0;
        const done = stages.filter((s: any) => (s.status || s.Status) === 'Completed').length;
        return Math.round((done / stages.length) * 100);
    }, [plan]);

    const syncStatus = useMemo(() => {
        if (!plan) return { status: 'Loading...', icon: 'sync', color: 'text-on-surface-variant', milestone: '...' };
        const status = plan.status || plan.Status || 'Active';
        const stages = plan.stages || plan.Stages || [];
        const nextStage = stages.find((s: any) => (s.status || s.Status) !== 'Completed');
        
        let displayStatus = 'All on track';
        let icon = 'check_circle';
        let color = 'text-emerald-600';
        
        if (status === 'Delayed' || status === 'On Hold') {
            displayStatus = status === 'Delayed' ? 'Behind Schedule' : 'Production Paused';
            icon = 'warning';
            color = 'text-amber-600';
        } else if (progressPct === 100) {
            displayStatus = 'Completed';
            color = 'text-primary';
        }

        const milestone = nextStage ? `Next Milestone: ${nextStage.stageName || nextStage.name || 'Next Stage'}` : 'All Milestones Reached';
        return { status: displayStatus, icon, color, milestone };
    }, [plan, progressPct]);

    const liveFeed = useMemo(() => {
        if (!plan) return { line: 'Loading...', source: '...' };
        const line = plan.productionLine || plan.ProductionLine || 'Main Line';
        const source = plan.sourceName || plan.SourceName || 'Production System';
        return { line, source };
    }, [plan]);

    return (
        <>
            <AppHeader pathname={`/Production/Batch/${batchId}`} />
            <PageShell sidebar={<Sidebar section="production" pathname={`/Production/Batch/${batchId}`} />}>
            <main className="flex-1 p-container-padding" style={{ backgroundColor: '#f8f9ff', minHeight: '100vh' }}>
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 mt-4 md:mt-0">
                    <div className="flex items-start gap-4">
                        <button 
                            onClick={() => router.back()} 
                            className="mt-1 w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors shrink-0"
                            title="Go Back"
                        >
                            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
                        </button>
                        <div>
                            <nav className="flex items-center gap-2 mb-2 text-on-surface-variant">
                                <span className="font-label-md text-[11px] hover:text-primary cursor-pointer" onClick={() => router.back()}>Batches</span>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                <span className="font-label-md text-[11px] text-primary">{batchId}</span>
                            </nav>
                            <h1 className="font-headline-lg text-headline-lg text-primary break-all">Batch Details: {batchId}</h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant">Summer Collection '24 - Mixed Product Batch</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => alert(`Exporting Report for ${batchId}...`)}
                            className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-white border border-outline text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded shadow-sm hover:bg-surface-container transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export Report
                        </button>
                        <button 
                            onClick={fetchPlan}
                            className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-4 py-2 rounded shadow-sm hover:opacity-90 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}">sync</span>
                            {loading ? 'Syncing...' : 'Re-sync Batch'}
                        </button>
                    </div>
                </div>

                {/* Summary Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-outline-variant p-5 rounded flex flex-col justify-between hover:border-secondary transition-colors group">
                        <div className="flex justify-between items-start">
                            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Units</span>
                            <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">inventory_2</span>
                        </div>
                        <div>
                            <div className="font-stats-lg text-stats-lg text-primary">{totalUnits.toLocaleString()}</div>
                            <div className="flex items-center gap-1 text-on-tertiary-container font-label-md text-[11px]">
                                <span className="material-symbols-outlined text-sm">inventory_2</span>
                                Total items planned
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-outline-variant p-5 rounded flex flex-col justify-between hover:border-secondary transition-colors group">
                        <div className="flex justify-between items-start">
                            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Unique Products</span>
                            <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">category</span>
                        </div>
                        <div>
                            <div className="font-stats-lg text-stats-lg text-primary">{String(uniqueProducts).padStart(2, '0')}</div>
                            <div className="text-on-surface-variant font-label-md text-[11px]">Diversified assortment</div>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-outline-variant p-5 rounded flex flex-col justify-between hover:border-secondary transition-colors group">
                        <div className="flex justify-between items-start">
                            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Overall Progress</span>
                            <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">speed</span>
                        </div>
                        <div>
                            <div className="font-stats-lg text-stats-lg text-primary">{progressPct}%</div>
                            <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2">
                                <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-outline-variant p-5 rounded flex flex-col justify-between hover:border-secondary transition-colors group">
                        <div className="flex justify-between items-start">
                            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Sync Status</span>
                            <span className={`material-symbols-outlined ${syncStatus.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{syncStatus.icon}</span>
                        </div>
                        <div>
                            <div className="font-headline-md text-headline-md text-primary">{syncStatus.status}</div>
                            <div className="text-on-surface-variant font-label-md text-[11px]">{syncStatus.milestone}</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Product Progress Table/Grid */}
                    <div className="lg:col-span-8">
                        <div className="bg-white border border-outline-variant rounded overflow-hidden">
                            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
                                <h2 className="font-headline-md text-headline-md text-primary">Multi-Product Progress</h2>
                                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">filter_list</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface-container-low border-b border-outline-variant">
                                            <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Product Name</th>
                                            <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Qty</th>
                                            <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Assigned Line</th>
                                            <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                                                    Loading batch details...
                                                </td>
                                            </tr>
                                        ) : !plan || !plan.products ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                                                    No products found for this batch.
                                                </td>
                                            </tr>
                                        ) : (
                                            plan.products.map((p: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-surface-container-low transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center shrink-0">
                                                                <span className="material-symbols-outlined text-secondary">inventory</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-body-lg text-body-lg font-semibold text-primary line-clamp-1">{p.productName || p.ProductName || 'Unknown Product'}</div>
                                                                <div className="text-[12px] text-on-surface-variant">Color: {p.color || p.Color || 'N/A'}, Size: {p.size || p.Size || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-label-md text-label-md text-on-surface">{(p.quantity || p.Quantity || 0).toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-surface-container-highest rounded text-[11px] font-medium font-label-md border border-outline-variant">
                                                            {p.sku || p.SKU || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-secondary"></span>
                                                            <span className="font-label-md text-label-md text-on-surface">{plan.status || plan.Status || 'Active'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 bg-surface-container-highest h-2 rounded-full overflow-hidden">
                                                                <div className="bg-secondary h-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                                                            </div>
                                                            <span className="font-label-md text-label-md font-bold text-primary">{progressPct}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Gantt Side Panel */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        <div className="bg-white border border-outline-variant rounded p-6 flex-1">
                            <h3 className="font-headline-md text-headline-md text-primary mb-6">Product Staggering</h3>
                            <div className="relative space-y-8">
                                {/* Gantt Legend */}
                                <div className="flex justify-between text-[10px] font-label-md text-on-surface-variant border-b border-outline-variant pb-2">
                                    <span>WK 22</span>
                                    <span>WK 23</span>
                                    <span>WK 24</span>
                                    <span>WK 25</span>
                                </div>
                                
                                <div className="relative min-h-[12rem] pb-8" style={{ 
                                    backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px)',
                                    backgroundSize: '25% 100%' 
                                }}>
                                    {!plan || !plan.products ? (
                                        <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant font-label-md text-[11px]">Loading...</div>
                                    ) : (
                                        plan.products.slice(0, 5).map((p: any, idx: number) => {
                                            const colors = ['bg-secondary', 'bg-secondary-container', 'bg-on-tertiary-container', 'bg-primary', 'bg-tertiary'];
                                            const color = colors[idx % colors.length];
                                            const top = (idx * 3) + 1; // 1rem, 4rem, 7rem
                                            const ml = idx * 15;
                                            const width = 50; 
                                            
                                            return (
                                                <div key={idx} className="absolute left-0 w-full" style={{ top: `${top}rem` }}>
                                                    <div className="font-label-md text-[10px] text-on-surface-variant mb-1 line-clamp-1 truncate w-4/5">{p.productName || p.ProductName || `Product ${idx+1}`}</div>
                                                    <div className={`h-4 ${color} rounded-full transition-all duration-1000`} style={{ width: `${width}%`, marginLeft: `${ml}%` }}></div>
                                                </div>
                                            );
                                        })
                                    )}
                                    {/* Today Line */}
                                    <div className="absolute inset-y-0 left-[55%] border-l-2 border-error border-dashed z-10">
                                        <div className="bg-error text-white text-[9px] px-1 absolute -top-4 -left-3 rounded">Today</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-outline-variant">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-surface-container rounded">
                                        <span className="material-symbols-outlined text-secondary">info</span>
                                    </div>
                                    <div>
                                        <p className="font-label-md text-label-md text-primary font-bold">Optimization Suggestion</p>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">Moving 'Technical Windbreaker' prep ahead by 4h could reduce line idle time on Line 2D.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Insight Module */}
                        <div className="relative bg-white border border-outline-variant rounded overflow-hidden h-40">
                            <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                                <p className="font-label-md text-[10px] text-secondary uppercase tracking-[0.2em] mb-1 font-bold">Live Feed</p>
                                <h4 className="font-headline-md text-headline-md text-primary">{liveFeed.line}: Real-time Output</h4>
                                <div className="flex items-center gap-2 text-on-surface-variant text-[12px] mt-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Streaming telemetry from {liveFeed.source}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="mt-12 pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant font-label-md text-[12px]">
                    <div className="flex items-center gap-4">
                        <span>Batch Supervisor</span>
                        <span className="w-1 h-1 bg-outline rounded-full"></span>
                        <span>Last synchronized: 2 minutes ago</span>
                    </div>
                </div>
            </main>
        </PageShell>
        </>
    );
}
