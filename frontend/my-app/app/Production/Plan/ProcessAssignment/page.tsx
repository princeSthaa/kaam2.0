"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AppHeader } from "@/app/components/AppHeader";
import { Sidebar } from "@/app/components/Sidebar";
import { PageShell } from "@/app/components/ui/PageShell";

interface Team {
  name: string;
  capacity: number;
  colorClass: string;
}

export default function ProcessAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const planId = searchParams.get("planId") || "BT-99042";

  const baseEffort = 1250;

  const [assignments, setAssignments] = useState<Record<string, Team[]>>({
    'fabric-prep': [],
    'cutting': [],
    'stitching': [],
    'qc': [],
    'packaging': []
  });

  const [planGuid, setPlanGuid] = useState<string>("");
  const [currentPlanObj, setCurrentPlanObj] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch("http://localhost:5083/api/production-plans")
        .then(res => res.json())
        .then(plans => {
          const currentPlan = plans.find((p: any) => p.planId === planId);
          if (currentPlan) {
            setPlanGuid(currentPlan.id);
            setCurrentPlanObj(currentPlan);
            if (currentPlan.stages) {
              const initialAssignments: Record<string, Team[]> = {
                'fabric-prep': [],
                'cutting': [],
                'stitching': [],
                'qc': [],
                'packaging': []
              };

              currentPlan.stages.forEach((st: any) => {
                if (!st.workCenter || st.workCenter === "Unassigned") return;
                
                const teamName = st.workCenter;
                let capacity = 4;
                let colorClass = 'bg-kaam-tertiary-fixed';
                
                if (teamName.toLowerCase().includes('cutter')) { colorClass = 'bg-kaam-secondary'; capacity = 6; }
                else if (teamName.toLowerCase().includes('qc')) { colorClass = 'bg-kaam-error'; capacity = 2; }
                
                const teamObj = { name: teamName, capacity, colorClass };
                
                const nameLower = (st.stageName || "").toLowerCase();
                if (nameLower.includes("material") || nameLower.includes("prep")) {
                  initialAssignments['fabric-prep'].push(teamObj);
                } else if (nameLower.includes("cut")) {
                  initialAssignments['cutting'].push(teamObj);
                } else if (nameLower.includes("stitch")) {
                  initialAssignments['stitching'].push(teamObj);
                } else if (nameLower.includes("check") || nameLower.includes("qc") || nameLower.includes("quality")) {
                  initialAssignments['qc'].push(teamObj);
                } else if (nameLower.includes("pack")) {
                  initialAssignments['packaging'].push(teamObj);
                }
              });
              
              const hasAssignments = Object.values(initialAssignments).some(arr => arr.length > 0);
              if (hasAssignments) {
                setAssignments(initialAssignments);
              }
            }
          }
        })
        .catch(err => console.error("Failed to fetch plan from API", err));

      fetch("http://localhost:5083/api/workcenters")
        .then(res => res.json())
        .then(wcs => {
          const mapped = wcs.map((wc: any) => ({
            name: wc.name,
            capacity: wc.type.includes('Machine') ? 6 : (wc.type.includes('QC') ? 2 : 4),
            colorClass: wc.type.includes('Machine') ? 'bg-kaam-secondary' : (wc.type.includes('QC') ? 'bg-kaam-error' : 'bg-kaam-tertiary-fixed')
          }));
          setAvailableTeams(mapped.length > 0 ? mapped : fallbackTeams);
        })
        .catch(err => console.error("Failed to fetch workcenters", err));
    }
  }, [planId]);

  const [draggedTeam, setDraggedTeam] = useState<Team | null>(null);

  const fallbackTeams = [
    { name: 'Line 4A', capacity: 4, colorClass: 'bg-kaam-tertiary-fixed' },
    { name: 'Line 1B', capacity: 3, colorClass: 'bg-kaam-tertiary-fixed' },
    { name: 'Auto-Cutter-2', capacity: 6, colorClass: 'bg-kaam-secondary' },
    { name: 'Team Alpha', capacity: 5, colorClass: 'bg-kaam-tertiary-fixed' },
    { name: 'QC Gamma', capacity: 2, colorClass: 'bg-kaam-error' },
    { name: 'Pack Unit 1', capacity: 4, colorClass: 'bg-kaam-tertiary-fixed' }
  ];
  
  const [availableTeams, setAvailableTeams] = useState<Team[]>(fallbackTeams);

  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");

  const filteredTeams = availableTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      teamFilter === "All" ? true :
      teamFilter === "Lines" ? team.name.includes("Line") || team.name.includes("Alpha") :
      teamFilter === "Cutters" ? team.name.includes("Cutter") :
      teamFilter === "QC" ? team.name.includes("QC") :
      teamFilter === "Pack" ? team.name.includes("Pack") : true;
    return matchesSearch && matchesFilter;
  });

  const handleDragStart = (e: React.DragEvent, team: Team) => {
    setDraggedTeam(team);
    e.dataTransfer.setData("teamName", team.name);
    e.dataTransfer.setData("capacity", team.capacity.toString());
  };

  const handleDrag = (e: React.DragEvent) => {
    // clientY is 0 when the drag operation ends or is invalid
    if (e.clientY === 0) return;

    const threshold = 150; 
    const scrollSpeed = 20;

    // Scroll up if near the top, down if near the bottom
    if (e.clientY < threshold) {
      window.scrollBy(0, -scrollSpeed);
    } else if (e.clientY > window.innerHeight - threshold) {
      window.scrollBy(0, scrollSpeed);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-kaam-surface-container-high', 'border-kaam-secondary-container');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-kaam-surface-container-high', 'border-kaam-secondary-container');
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-kaam-surface-container-high', 'border-kaam-secondary-container');
    
    if (!draggedTeam) return;
    if (assignments[stageId].some(t => t.name === draggedTeam.name)) return;

    setAssignments(prev => ({
      ...prev,
      [stageId]: [...prev[stageId], draggedTeam]
    }));
    setDraggedTeam(null);
  };

  const removeTeam = (stageId: string, teamName: string) => {
    setAssignments(prev => ({
      ...prev,
      [stageId]: prev[stageId].filter(t => t.name !== teamName)
    }));
  };

  const calculateHours = (stageId: string) => {
    const stageTeams = assignments[stageId];
    if (stageTeams.length === 0) return "--";
    const totalCap = stageTeams.reduce((sum, t) => sum + t.capacity, 0);
    return (baseEffort / totalCap / 10).toFixed(1) + "h";
  };

  const totalStages = Object.keys(assignments).length;
  const assignedStages = Object.values(assignments).filter(a => a.length > 0).length;
  const progress = Math.round((assignedStages / totalStages) * 100);

  const [batchId, setBatchId] = useState("");
  
  const finalizeAssignments = () => {
    const newBatchId = "BCH-" + Math.floor(10000 + Math.random() * 90000);
    setBatchId(newBatchId);
    
    if (planGuid && currentPlanObj) {
      // Map assignments back to stages
      const updatedStages = currentPlanObj.stages.map((st: any) => {
        const nameLower = (st.stageName || "").toLowerCase();
        let cat = "";
        if (nameLower.includes("material") || nameLower.includes("prep")) cat = "fabric-prep";
        else if (nameLower.includes("cut")) cat = "cutting";
        else if (nameLower.includes("stitch")) cat = "stitching";
        else if (nameLower.includes("check") || nameLower.includes("qc") || nameLower.includes("quality")) cat = "qc";
        else if (nameLower.includes("pack")) cat = "packaging";
        
        if (cat && assignments[cat].length > 0) {
          st.workCenter = assignments[cat].map(t => t.name).join(", ");
        }
        return st;
      });

      const updatedPlan = { ...currentPlanObj, stages: updatedStages, batchId: newBatchId };

      fetch(`http://localhost:5083/api/production-plans/${planGuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlan)
      }).then(() => {
        router.push(`/Production/Plan/FinalSummary?planId=${planId}&batchId=${newBatchId}`);
      }).catch(err => {
        console.error("Failed to update plan assignments", err);
        router.push(`/Production/Plan/FinalSummary?planId=${planId}&batchId=${newBatchId}`);
      });
    } else {
      router.push(`/Production/Plan/FinalSummary?planId=${planId}&batchId=${newBatchId}`);
    }
  };

  const stages = [
    { id: 'fabric-prep', name: 'Fabric Prep', stageCode: 'Stage 01', stageId: 'FP-01', icon: 'layers' },
    { id: 'cutting', name: 'Cutting', stageCode: 'Stage 02', stageId: 'CT-04', icon: 'content_cut' },
    { id: 'stitching', name: 'Stitching', stageCode: 'Stage 03', stageId: 'ST-09', icon: 'architecture' },
    { id: 'qc', name: 'Quality Check', stageCode: 'Stage 04', stageId: 'QC-02', icon: 'verified' },
    { id: 'packaging', name: 'Packaging', stageCode: 'Stage 05', stageId: 'PK-07', icon: 'inventory' },
  ];

  return (
    <>
      <style>{`
        .process-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .process-card:hover {
            transform: translateY(-2px);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 2px;
        }
      `}</style>
      <AppHeader pathname={pathname} />
      <PageShell
        sidebar={<Sidebar section="production" pathname={pathname} />}
        contentClassName="bg-kaam-background"
      >
        <div className="p-6 pb-32 flex-1 relative font-kaam-body-lg text-kaam-on-surface w-full max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
              <div className="flex flex-col gap-4">
                
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 border border-kaam-outline-variant rounded-kaam-DEFAULT text-kaam-on-surface-variant font-kaam-label-md hover:bg-kaam-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-kaam-outline-variant bg-kaam-surface rounded-kaam-DEFAULT text-kaam-on-surface font-kaam-label-md hover:bg-kaam-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    Print
                  </button>
                  <button onClick={() => alert('Plan saved to draft successfully.')} className="flex items-center gap-2 px-4 py-2 border border-kaam-outline-variant bg-kaam-surface-container rounded-kaam-DEFAULT text-kaam-on-surface font-kaam-label-md hover:bg-kaam-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save to Draft
                  </button>
                </div>
                
                <div>
                  <h2 className="font-kaam-headline-lg text-kaam-headline-lg text-kaam-on-surface">Process Assignment</h2>
                  <p className="text-kaam-on-surface-variant font-kaam-body-sm text-kaam-body-sm mt-1">Assign operational teams to manufacturing lifecycle stages.</p>
                </div>

              </div>

              <div className="bg-kaam-surface-container-high px-4 py-2 rounded-kaam-lg border border-kaam-outline-variant flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-kaam-on-surface-variant">Plan ID</span>
                  <span className="font-kaam-label-md text-kaam-label-md">#{planId}</span>
                </div>
                <div className="w-px h-8 bg-kaam-outline-variant"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-kaam-on-surface-variant">Priority</span>
                  <span className="font-kaam-label-md text-kaam-label-md text-kaam-error flex items-center gap-1">
                    <span className="w-2 h-2 bg-kaam-error rounded-kaam-full"></span> High
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid of Process Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {stages.map(stage => (
              <div 
                key={stage.id}
                className="process-card bg-kaam-surface-container-lowest border border-kaam-outline-variant rounded-kaam-xl p-5 flex flex-col gap-4 shadow-sm" 
                onDragLeave={handleDragLeave} 
                onDragOver={handleDragOver} 
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-kaam-DEFAULT bg-kaam-primary-container text-white flex items-center justify-center">
                      <span className="material-symbols-outlined">{stage.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-kaam-headline-md text-kaam-headline-md leading-tight">{stage.name}</h3>
                      
                    </div>
                  </div>
                  <span className="bg-kaam-surface-container px-2 py-1 rounded-kaam-DEFAULT font-kaam-label-md text-[10px] text-kaam-on-surface-variant">ID: {stage.stageId}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-kaam-surface-container-low p-3 rounded-kaam-lg border border-kaam-outline-variant/30">
                  <div>
                    <p className="text-[10px] text-kaam-on-surface-variant font-bold uppercase">Target Qty</p>
                    <p className="font-kaam-stats-lg text-[24px] text-kaam-primary">1,250 <span className="text-xs font-normal text-kaam-on-surface-variant">pcs</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-kaam-on-surface-variant font-bold uppercase">Est. Completion</p>
                    <p className="font-kaam-stats-lg text-[24px] text-kaam-secondary">{calculateHours(stage.id)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-kaam-on-surface-variant font-bold uppercase flex justify-between">
                    Assigned Teams 
                    <span className="text-kaam-secondary">{assignments[stage.id].length} Teams</span>
                  </label>
                  <div className="min-h-[80px] border-2 border-dashed border-kaam-outline-variant rounded-kaam-lg p-2 flex flex-wrap gap-2 items-start content-start bg-kaam-surface-container-low/20 transition-all">
                    {assignments[stage.id].length === 0 ? (
                      <div className="w-full text-center py-4 text-kaam-on-surface-variant opacity-40 italic text-xs pointer-events-none">Drop team here...</div>
                    ) : (
                      assignments[stage.id].map(team => (
                        <div key={team.name} className="flex items-center gap-2 bg-kaam-secondary-container text-kaam-on-secondary-container px-3 py-1.5 rounded-kaam-lg text-[12px] font-bold animate-in fade-in zoom-in duration-300 shadow-sm z-10">
                          <span>{team.name}</span>
                          <button onClick={() => removeTeam(stage.id, team.name)} className="hover:bg-white/20 rounded-kaam-DEFAULT ml-1 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Assignment Summary (Bento Completion) */}
            <div className="bg-kaam-primary-container text-white rounded-kaam-xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-kaam-headline-md text-kaam-headline-md mb-2">Total Utilization</h3>
                <p className="text-kaam-on-primary-container text-kaam-body-sm font-kaam-body-sm mb-6">Aggregate operational readiness for Plan #{planId}.</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[48px] font-kaam-stats-lg">{progress}%</span>
                  <span className="text-kaam-on-primary-container text-sm">Target Reached</span>
                </div>
                <div className="w-full bg-kaam-on-primary-container/20 h-2 rounded-kaam-full mb-8">
                  <div className="bg-kaam-tertiary-fixed h-full rounded-kaam-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <button onClick={finalizeAssignments} className="relative z-10 w-full py-4 bg-white text-kaam-primary font-bold rounded-kaam-lg hover:bg-kaam-surface-container-lowest transition-all active:scale-[0.98]">
                Finalize Production Plan
              </button>
              {/* Decorative element */}
              <div className="absolute -right-10 -top-10 opacity-10 transform rotate-12 transition-transform group-hover:rotate-45 duration-700">
                <span className="material-symbols-outlined text-[200px]">factory</span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Sticky Teams Dock */}
        <footer className="sticky bottom-0 -mx-6 px-6 mt-6 bg-kaam-surface-container-lowest/95 backdrop-blur-md border-t border-kaam-outline-variant py-5 z-40 shadow-[0_-12px_40px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-5 max-w-7xl mx-auto">
            {/* Header of Dock */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-kaam-full bg-kaam-primary-container text-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">group_work</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-kaam-headline-md text-kaam-headline-md text-kaam-on-surface leading-tight">Available Teams</span>
                  <span className="text-[11px] font-kaam-label-md text-kaam-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[12px]">touch_app</span> Drag to Assign
                  </span>
                </div>
              </div>
              
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto md:min-w-[400px]">
                 <div className="relative flex-1 w-full group">
                   <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-kaam-on-surface-variant text-[18px] group-focus-within:text-kaam-primary transition-colors">search</span>
                   <input type="text" placeholder="Search operational teams..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-kaam-surface-container-low hover:bg-kaam-surface-container-high border border-kaam-outline-variant rounded-kaam-full text-kaam-body-sm focus:outline-none focus:border-kaam-primary focus:ring-1 focus:ring-kaam-primary transition-all" />
                 </div>
                 <div className="relative w-full sm:w-auto">
                   <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="w-full sm:w-auto pl-4 pr-8 py-2 bg-kaam-surface-container-low hover:bg-kaam-surface-container-high border border-kaam-outline-variant rounded-kaam-full text-kaam-body-sm focus:outline-none focus:border-kaam-primary focus:ring-1 focus:ring-kaam-primary transition-all cursor-pointer appearance-none">
                      <option value="All">All Types</option>
                      <option value="Lines">Lines</option>
                      <option value="Cutters">Cutters</option>
                      <option value="QC">Quality Check</option>
                      <option value="Pack">Packaging</option>
                   </select>
                   <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-kaam-on-surface-variant text-[16px] pointer-events-none">expand_more</span>
                 </div>
              </div>
            </div>

            {/* Scrollable Teams Area */}
            <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[180px] custom-scrollbar p-1 content-start">
              {filteredTeams.map(team => (
                <div 
                  key={team.name}
                  draggable
                  onDragStart={(e) => handleDragStart(e, team)}
                  onDrag={handleDrag}
                  className="flex-none cursor-grab active:cursor-grabbing bg-kaam-surface-container-highest border border-kaam-outline-variant pl-2 pr-4 py-1.5 rounded-kaam-full flex items-center gap-2 hover:bg-white hover:border-kaam-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <span className="material-symbols-outlined text-kaam-on-surface-variant text-[14px] opacity-50 group-hover:opacity-100">drag_indicator</span>
                  <span className={`w-2 h-2 rounded-kaam-full ${team.colorClass} shadow-sm`}></span>
                  <span className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface whitespace-nowrap">{team.name}</span>
                  <span className="text-[10px] bg-kaam-surface-container-lowest px-1.5 py-0.5 rounded-kaam-DEFAULT border border-kaam-outline-variant/50 text-kaam-on-surface-variant font-bold ml-1">x{team.capacity}</span>
                </div>
              ))}
              {filteredTeams.length === 0 && (
                 <div className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-kaam-outline-variant/50 rounded-kaam-lg bg-kaam-surface-container-low/30">
                   <span className="material-symbols-outlined text-kaam-outline text-[32px] mb-2 opacity-50">search_off</span>
                   <p className="text-kaam-on-surface-variant text-kaam-body-sm font-medium">No teams match your filter criteria.</p>
                   <p className="text-[11px] text-kaam-outline">Try clearing your search or changing the type.</p>
                 </div>
              )}
            </div>
          </div>
        </footer>
      </PageShell>
    </>
  );
}
