"use client";

import React, { useState } from "react";
import { EditTeamModal, TeamItem } from "../components/modals/editteammodal";

interface TeamMember {
  id: string;
  name: string;
  employeeId: string;
  role: "Lead" | "Operator" | "Technician" | "Inspector";
  certification: string;
  avatar: string;
}

interface Team {
  id: string;
  name: string;
  status: "ACTIVE" | "STANDBY" | "UNDER REVIEW";
  primaryStage: string;
  primaryStageIcon: string;
  currentBatch: string;
  efficiency: number;
  specializations: string[];
  assignedCount: number;
  members: TeamMember[];
  selectedStage: string;
  outputTrend: number[];
  qualityRate: number;
}

const INITIAL_TEAMS: Team[] = [
  {
    id: "team-alpha",
    name: "Team Alpha",
    status: "ACTIVE",
    primaryStage: "Cutting",
    primaryStageIcon: "content_cut",
    currentBatch: "#PRD-2024",
    efficiency: 94,
    specializations: ["Denim", "Heavy Outerwear", "Wovens"],
    assignedCount: 7,
    selectedStage: "Cutting",
    outputTrend: [40, 55, 30, 75, 95],
    qualityRate: 99.2,
    members: [
      {
        id: "emp-902",
        name: "Rajesh Kumar",
        employeeId: "EMP-902",
        role: "Lead",
        certification: "L3 Certified",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
      {
        id: "emp-441",
        name: "Sunita Devi",
        employeeId: "EMP-441",
        role: "Operator",
        certification: "L2 Certified",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      },
      {
        id: "emp-318",
        name: "Aarav Sharma",
        employeeId: "EMP-318",
        role: "Technician",
        certification: "L2 Certified",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      },
      {
        id: "emp-109",
        name: "Pooja Patel",
        employeeId: "EMP-109",
        role: "Inspector",
        certification: "L3 Certified",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "team-bravo",
    name: "Bravo Stitching",
    status: "ACTIVE",
    primaryStage: "Sewing",
    primaryStageIcon: "styler",
    currentBatch: "#PRD-2025",
    efficiency: 88,
    specializations: ["Light Cotton T-Shirts", "Polos", "Knits"],
    assignedCount: 10,
    selectedStage: "Sewing",
    outputTrend: [50, 60, 45, 80, 88],
    qualityRate: 97.8,
    members: [
      {
        id: "emp-204",
        name: "Vikram Singh",
        employeeId: "EMP-204",
        role: "Lead",
        certification: "L3 Certified",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
      },
      {
        id: "emp-512",
        name: "Ananya Roy",
        employeeId: "EMP-512",
        role: "Operator",
        certification: "L2 Certified",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "team-charlie",
    name: "Charlie Finishing",
    status: "UNDER REVIEW",
    primaryStage: "QC & Finishing",
    primaryStageIcon: "local_laundry_service",
    currentBatch: "#PRD-2019",
    efficiency: 91,
    specializations: ["Outerwear Washing", "Packaging"],
    assignedCount: 5,
    selectedStage: "Washing",
    outputTrend: [30, 40, 50, 65, 91],
    qualityRate: 98.5,
    members: [
      {
        id: "emp-112",
        name: "Karan Mehta",
        employeeId: "EMP-112",
        role: "Lead",
        certification: "L3 Certified",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
];

const AVAILABLE_STAGES = [
  { id: "Cutting", name: "Cutting", icon: "content_cut" },
  { id: "Printing", name: "Printing", icon: "print" },
  { id: "Sewing", name: "Sewing", icon: "styler" },
  { id: "Washing", name: "Washing", icon: "local_laundry_service" },
  { id: "QC Inspection", name: "QC Inspection", icon: "verified" },
  { id: "Packaging", name: "Packaging", icon: "inventory_2" },
];

export default function AdminWorkforcePage() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("team-alpha");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamStage, setNewTeamStage] = useState("Cutting");

  // New Member Form State
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<TeamMember["role"]>("Operator");
  const [newMemberCert, setNewMemberCert] = useState("L2 Certified");

  const activeTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handleSelectTeam = (id: string) => {
    setSelectedTeamId(id);
  };

  const handleStageSelect = (stageName: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === selectedTeamId ? { ...t, selectedStage: stageName, primaryStage: stageName } : t
      )
    );
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === selectedTeamId
          ? { ...t, specializations: t.specializations.filter((tag) => tag !== tagToRemove) }
          : t
      )
    );
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    setTeams((prev) =>
      prev.map((t) =>
        t.id === selectedTeamId
          ? { ...t, specializations: [...t.specializations, newTagInput.trim()] }
          : t
      )
    );
    setNewTagInput("");
    setIsAddingTag(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === selectedTeamId
          ? {
              ...t,
              members: t.members.filter((m) => m.id !== memberId),
              assignedCount: Math.max(0, t.assignedCount - 1),
            }
          : t
      )
    );
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const createdTeam: Team = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      status: "ACTIVE",
      primaryStage: newTeamStage,
      primaryStageIcon: AVAILABLE_STAGES.find((s) => s.name === newTeamStage)?.icon || "groups",
      currentBatch: "#PRD-AUTO",
      efficiency: 90,
      specializations: ["General Assembly"],
      assignedCount: 1,
      selectedStage: newTeamStage,
      outputTrend: [40, 50, 60, 80, 90],
      qualityRate: 98.0,
      members: [
        {
          id: `emp-${Date.now()}`,
          name: "Team Lead",
          employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
          role: "Lead",
          certification: "L3 Certified",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        },
      ],
    };

    setTeams([createdTeam, ...teams]);
    setSelectedTeamId(createdTeam.id);
    setIsAddTeamModalOpen(false);
    setNewTeamName("");
  };

  const handleSaveEditedTeam = (updatedTeam: TeamItem) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === updatedTeam.id ? (updatedTeam as any) : t))
    );
    setIsEditTeamModalOpen(false);
    setEditingTeam(null);
  };

  const handleDuplicateTeam = (teamToDuplicate: TeamItem) => {
    const duplicated: Team = {
      ...(teamToDuplicate as any),
      id: `team-${Date.now()}`,
      name: `${teamToDuplicate.name} (Copy)`,
      currentBatch: "#PRD-DUPLICATE",
    };
    setTeams((prev) => [duplicated, ...prev]);
    setSelectedTeamId(duplicated.id);
  };

  const handleDeactivateTeam = (teamId: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status: "STANDBY" } : t))
    );
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: TeamMember = {
      id: `emp-${Date.now()}`,
      name: newMemberName,
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      role: newMemberRole,
      certification: newMemberCert,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    };

    setTeams((prev) =>
      prev.map((t) =>
        t.id === selectedTeamId
          ? {
              ...t,
              members: [...t.members, newMember],
              assignedCount: t.assignedCount + 1,
            }
          : t
      )
    );

    setIsAddMemberModalOpen(false);
    setNewMemberName("");
  };

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.primaryStage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span>Workforce</span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 font-bold">Team & Process Configuration</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure active manufacturing teams and assign production stages.
          </p>
        </div>
        <button
          onClick={() => setIsAddTeamModalOpen(true)}
          className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg shadow hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>New Team</span>
        </button>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Panel: Active Teams (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Active Teams</h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                search
              </span>
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none w-36"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredTeams.map((team) => {
              const isSelected = team.id === selectedTeamId;
              return (
                <div
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  className={`p-4 rounded-xl border cursor-pointer relative group transition-all ${
                    isSelected
                      ? "border-slate-900 bg-slate-900/5 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">{team.name}</h4>
                        {team.status === "ACTIVE" && (
                          <span className="bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            ACTIVE
                          </span>
                        )}
                        {team.status === "UNDER REVIEW" && (
                          <span className="bg-amber-50 text-amber-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            UNDER REVIEW
                          </span>
                        )}
                        {team.status === "STANDBY" && (
                          <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300 inline-flex items-center gap-1">
                            STANDBY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">{team.primaryStageIcon}</span>
                        <span>Primary Stage: {team.primaryStage}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTeam({ ...team });
                        setIsEditTeamModalOpen(true);
                      }}
                      className="p-1 text-slate-400 opacity-80 group-hover:opacity-100 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-all shrink-0 ml-2"
                      title="Edit Team"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 font-mono uppercase">CURRENT BATCH</p>
                      <p className="font-mono text-xs font-bold text-slate-900">{team.currentBatch}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 font-mono uppercase">EFFICIENCY</p>
                      <p className="font-mono text-xs font-bold text-emerald-600">{team.efficiency}%</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {team.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 3).map((m, idx) => (
                        <div
                          key={m.id}
                          className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden"
                          style={{ zIndex: 30 - idx * 10 }}
                        >
                          <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {team.assignedCount > 3 && (
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center font-mono text-[10px] font-bold text-slate-600">
                          +{team.assignedCount - 3}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      {team.assignedCount} Assigned
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Detail Configuration (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{activeTeam.name} Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage production stages, specialization, and workforce allocation.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTeams(INITIAL_TEAMS)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => alert(`Changes saved for ${activeTeam.name}`)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Production Routing Assignment */}
            <section className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-900 text-lg">account_tree</span>
                  <span>Production Routing Assignment</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Select the primary manufacturing stage this team is responsible for.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_STAGES.map((stg) => {
                  const isSelected = activeTeam.selectedStage === stg.name;
                  return (
                    <div
                      key={stg.id}
                      onClick={() => handleStageSelect(stg.name)}
                      className={`rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer relative transition-all ${
                        isSelected
                          ? "border-2 border-slate-900 bg-slate-900/5 shadow-xs"
                          : "border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-slate-900">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                        </div>
                      )}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">{stg.icon}</span>
                      </div>
                      <span className="font-semibold text-xs text-slate-900 text-center">{stg.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Specializations Tags */}
              <div className="pt-2">
                <h5 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  PRIMARY SPECIALIZATIONS
                </h5>
                <div className="flex flex-wrap gap-2 items-center">
                  {activeTeam.specializations.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full border border-slate-900 bg-slate-900/5 text-slate-900 font-semibold text-xs flex items-center gap-1.5"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600 text-slate-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </span>
                  ))}

                  {isAddingTag ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Tag name..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        className="px-3 py-1 text-xs border border-slate-300 rounded-full focus:ring-1 focus:ring-slate-900 focus:outline-none w-28"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-slate-800"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingTag(true)}
                      className="px-3 py-1.5 rounded-full border border-dashed border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1 hover:border-slate-900 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span>Add Tag</span>
                    </button>
                  )}
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Staff Roster Allocation */}
            <section className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900 text-lg">groups</span>
                    <span>Staff Allocation</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">Manage personnel assigned to this team.</p>
                </div>
                <button
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="text-slate-900 font-bold text-xs hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Add Personnel</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 w-10"></th>
                      <th className="p-3">Employee</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Certification</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeTeam.members.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{member.name}</p>
                          <p className="font-mono text-[11px] text-slate-400">ID: {member.employeeId}</p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold font-mono ${
                              member.role === "Lead"
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            {member.certification}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Remove member"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Performance History */}
            <section className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-900 text-lg">monitoring</span>
                  <span>Recent Performance History</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">Weekly output and quality metrics for {activeTeam.name}.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">OUTPUT TREND</span>
                    <span className="text-emerald-600 text-xs font-mono font-bold flex items-center gap-0.5">
                      +12% <span className="material-symbols-outlined text-sm">trending_up</span>
                    </span>
                  </div>
                  <div className="h-16 flex items-end gap-1.5">
                    {activeTeam.outputTrend.map((val, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t transition-all ${
                          idx === activeTeam.outputTrend.length - 1 ? "bg-slate-900" : "bg-slate-300"
                        }`}
                        style={{ height: `${val}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">QUALITY RATE</span>
                    <span className="text-slate-900 font-mono text-sm font-bold">{activeTeam.qualityRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${activeTeam.qualityRate}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {(100 - activeTeam.qualityRate).toFixed(1)}% Rejection rate (Below threshold)
                  </p>
                </div>
              </div>
            </section>

            {/* Informational Banner */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-700">
              <span className="material-symbols-outlined text-slate-900 shrink-0">info</span>
              <p className="leading-relaxed">
                Workload distribution for this team is calculated based on historical output data. Ensure the correct product specialization is set to maintain accurate efficiency metrics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Team Modal */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Create New Manufacturing Team</h3>
              <button
                onClick={() => setIsAddTeamModalOpen(false)}
                className="text-slate-400 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Echo Assembly"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Primary Stage *</label>
                <select
                  value={newTeamStage}
                  onChange={(e) => setNewTeamStage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  {AVAILABLE_STAGES.map((stg) => (
                    <option key={stg.id} value={stg.name}>
                      {stg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddTeamModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg shadow hover:bg-slate-800 active:scale-95"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Personnel Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Personnel to {activeTeam.name}</h3>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-slate-400 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Role</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="Operator">Operator</option>
                    <option value="Lead">Lead</option>
                    <option value="Technician">Technician</option>
                    <option value="Inspector">Inspector</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Certification</label>
                  <select
                    value={newMemberCert}
                    onChange={(e) => setNewMemberCert(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="L3 Certified">L3 Certified</option>
                    <option value="L2 Certified">L2 Certified</option>
                    <option value="L1 Certified">L1 Certified</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg shadow hover:bg-slate-800 active:scale-95"
                >
                  Assign Personnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Action & Details Modal */}
      <EditTeamModal
        isOpen={isEditTeamModalOpen}
        team={editingTeam as any}
        onClose={() => {
          setIsEditTeamModalOpen(false);
          setEditingTeam(null);
        }}
        onSave={handleSaveEditedTeam}
        onDuplicate={handleDuplicateTeam}
        onDeactivate={handleDeactivateTeam}
        onManageRoster={(team) => {
          setSelectedTeamId(team.id);
          setIsAddMemberModalOpen(true);
        }}
      />
    </div>
  );
}
