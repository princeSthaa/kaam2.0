"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Make sure this import path matches exactly where you saved the modal file
import CreateRequestModal from '../components/modals/CreateRequestModal';

import { adToBs } from '../../../components/ui/NepaliDatePicker';
import { getMaterialRequests, createMaterialRequest, MaterialRequestDto, CreateMaterialRequestDto } from "../api/constant";
import { API_MAIN_URL } from "@/app/(modules)/api/constant";

export default function MaterialRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<MaterialRequestDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setIsLoading(true);
            const [data, materialsRes] = await Promise.all([
                getMaterialRequests(),
                fetch(`${API_MAIN_URL}/material`)
            ]);
            
            const materials = await materialsRes.json();
            
            const enrichedData = data.map(req => ({
                ...req,
                items: req.items?.map(i => {
                    const mat = materials.find((m: any) => m.id === i.materialId);
                    return {
                        ...i,
                        material: i.material || mat
                    };
                }) || []
            }));
            
            setRequests(enrichedData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRequest = async (data: any) => {
        try {
            // The modal provides workOrder, material, quantity, notes.
            // We map this to the CreateMaterialRequestDto
            const payload: CreateMaterialRequestDto = {
                requiredDate: new Date().toISOString(),
                notes: data.notes,
                requestedBy: "Factory User", // Placeholder user
                items: [
                    {
                        materialId: data.material,
                        requestedQuantity: Number(data.quantity)
                    }
                ]
            };

            await createMaterialRequest(payload);
            await loadRequests();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to create request:", err);
            alert("Failed to create material request.");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Material Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage factory requests for raw materials from the warehouse.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    + Create Request
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 border-b border-gray-200 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Request ID</th>
                                <th className="px-6 py-4">Material</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No material requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{req.requestNumber || "N/A"}</td>
                                        <td className="px-6 py-4">
                                            {req.items?.length > 0 
                                                ? req.items.map(i => i.material?.name || i.material?.materialCode || i.materialId).join(", ")
                                                : "No items"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.items?.length > 0
                                                ? req.items.map(i => i.requestedQuantity).join(", ")
                                                : "0"}
                                        </td>
                                        <td className="px-6 py-4">{adToBs(req.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    req.status === 'Pending' || req.status === 'Draft'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : req.status === 'Rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}
                                            >
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                onClick={() => router.push(`/factory/material-requests/${req.id}`)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Render the Modal */}
            <CreateRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateRequest}
            />
        </div>
    );
}
