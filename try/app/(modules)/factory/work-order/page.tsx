"use client";

import React, { useState } from 'react';
import CreateWorkOrderModal from '../components/modals/CreateWorkModal';

// Mock data to visualize the Work Orders. 
// You will replace this with your actual API fetch later.

const MOCK_WORK_ORDERS = [
    {
        id: "WO-5022",
        product: "Mens Blue Oxford Shirt (SKU-SHIRT-01)",
        quantity: 500,
        startDate: "2026-08-12",
        deadline: "2026-08-18",
        priority: "High",
        status: "In Progress",
    },
    {
        id: "WO-5023",
        product: "Womens Red Jacket (SKU-JACK-05)",
        quantity: 200,
        startDate: "2026-08-15",
        deadline: "2026-08-25",
        priority: "Medium",
        status: "Pending",
    },
    {
        id: "WO-5024",
        product: "White Cotton T-Shirt (SKU-TSHIRT-02)",
        quantity: 1000,
        startDate: "2026-08-01",
        deadline: "2026-08-08",
        priority: "Low",
        status: "Completed",
    }
];

export default function WorkOrderPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewWorkOrder, setViewWorkOrder] = useState<any | null>(null);
    const [editWorkOrder, setEditWorkOrder] = useState<any | null>(null);
    
    // Ready for when you build your CreateWorkOrderModal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Helper function to color-code priorities
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-700 bg-red-100';
            case 'Medium': return 'text-yellow-800 bg-yellow-100';
            case 'Low': return 'text-gray-700 bg-gray-100';
            default: return 'text-gray-700 bg-gray-100';
        }
    };

    // Helper function to color-code statuses
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-green-800 bg-green-100';
            case 'In Progress': return 'text-blue-800 bg-blue-100';
            case 'Pending': return 'text-orange-800 bg-orange-100';
            default: return 'text-gray-800 bg-gray-100';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage and track active manufacturing tasks on the factory floor.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    + Create Work Order
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 border-b border-gray-200 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Work Order ID</th>
                                <th className="px-6 py-4">Product / SKU</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Timeline</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {MOCK_WORK_ORDERS.map((wo) => (
                                <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{wo.id}</td>
                                    <td className="px-6 py-4">{wo.product}</td>
                                    <td className="px-6 py-4 font-semibold">{wo.quantity}</td>
                                    <td className="px-6 py-4 text-xs">
                                        <div><span className="text-gray-400">Start:</span> {wo.startDate}</div>
                                        <div><span className="text-gray-400">Due:</span> {wo.deadline}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(wo.priority)}`}>
                                            {wo.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(wo.status)}`}>
                                            {wo.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                            View
                                        </button>
                                        <button className="text-gray-500 hover:text-gray-700 font-medium text-sm">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {MOCK_WORK_ORDERS.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No active work orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateWorkOrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(data) => {
                    console.log('Work Order Created:', data);
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}