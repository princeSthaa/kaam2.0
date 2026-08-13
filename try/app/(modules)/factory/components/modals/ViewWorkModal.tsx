import React from 'react';

interface ViewWorkOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    workOrder: any | null; // Pass the selected row data here
}

export default function ViewWorkOrderModal({ isOpen, onClose, workOrder }: ViewWorkOrderModalProps) {
    if (!isOpen || !workOrder) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{workOrder.id} Details</h2>
                        <p className="text-sm text-gray-500">{workOrder.product}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="px-6 py-4 overflow-y-auto space-y-6">
                    {/* Top Stats */}
                    <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-lg border">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Status</p>
                            <p className="font-semibold text-gray-900">{workOrder.status}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Target Qty</p>
                            <p className="font-semibold text-gray-900">{workOrder.quantity}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Start Date</p>
                            <p className="font-semibold text-gray-900">{workOrder.startDate}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Deadline</p>
                            <p className="font-semibold text-gray-900">{workOrder.deadline}</p>
                        </div>
                    </div>

                    {/* Materials Section (The Workflow Bridge) */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-gray-900">Required Materials (BOM)</h3>
                            {workOrder.status === 'Pending' && (
                                <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-medium hover:bg-blue-200 transition">
                                    + Request Materials from Warehouse
                                </button>
                            )}
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-2 font-medium">Material</th>
                                        <th className="px-4 py-2 font-medium">Qty Required</th>
                                        <th className="px-4 py-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {/* Mock BOM Data based on the order */}
                                    <tr>
                                        <td className="px-4 py-2">Cotton Fabric (MAT-01)</td>
                                        <td className="px-4 py-2">{workOrder.quantity * 1.5} meters</td>
                                        <td className="px-4 py-2 text-yellow-600">Not Requested</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2">Buttons (MAT-05)</td>
                                        <td className="px-4 py-2">{workOrder.quantity * 5} units</td>
                                        <td className="px-4 py-2 text-green-600">Delivered to Floor</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Close View
                    </button>
                </div>
            </div>
        </div>
    );
}