"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMaterialRequestById, MaterialRequestDto } from "../../api/constant";
import { API_MAIN_URL } from "@/app/(modules)/api/constant";
import { adToBs } from '../../../../components/ui/NepaliDatePicker';

export default function MaterialRequestViewPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [request, setRequest] = useState<MaterialRequestDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [materials, setMaterials] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            loadRequest(id);
        }
    }, [id]);

    const loadRequest = async (requestId: string) => {
        try {
            setIsLoading(true);
            const [data, materialsRes] = await Promise.all([
                getMaterialRequestById(requestId),
                fetch(`${API_MAIN_URL}/material`)
            ]);
            
            const mats = await materialsRes.json();
            setMaterials(mats);
            
            // Enrich
            const enrichedRequest = {
                ...data,
                items: data.items?.map(i => {
                    const mat = mats.find((m: any) => m.id === i.materialId);
                    return {
                        ...i,
                        material: i.material || mat
                    };
                }) || []
            };
            
            setRequest(enrichedRequest);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto flex justify-center items-center h-64">
                <span className="text-gray-500 text-lg">Loading...</span>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="p-6 max-w-7xl mx-auto flex flex-col justify-center items-center h-64">
                <span className="text-gray-500 text-lg mb-4">Material Request not found.</span>
                <button 
                    onClick={() => router.push('/factory/material-requests')}
                    className="text-blue-600 hover:underline"
                >
                    &larr; Back to Requests
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => router.push('/factory/material-requests')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        {request.requestNumber || "N/A"}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            request.status === 'Pending' || request.status === 'Draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                            {request.status}
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Requested by {request.requestedBy} • Created on {adToBs(request.createdAt)}
                    </p>
                </div>
            </div>

            {/* Details Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Required Date</p>
                        <p className="font-medium text-gray-900">{adToBs(request.requiredDate)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Supplier</p>
                        <p className="font-medium text-gray-900">{request.supplier?.name || "No Specific Supplier"}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 mb-1">Notes</p>
                        <p className="font-medium text-gray-900">{request.notes || "N/A"}</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Requested Materials</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-white text-gray-500 border-b border-gray-200 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Item #</th>
                                <th className="px-6 py-4">Material Code</th>
                                <th className="px-6 py-4">Material Name</th>
                                <th className="px-6 py-4 text-right">Requested Quantity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {request.items && request.items.length > 0 ? (
                                request.items.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{(index + 1).toString().padStart(2, '0')}</td>
                                        <td className="px-6 py-4 text-gray-700 font-mono text-xs">
                                            {item.material?.materialCode || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {item.material?.name || item.materialId}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            {item.requestedQuantity}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No materials found for this request.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
