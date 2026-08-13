import React, { useState, useEffect } from 'react';

interface EditWorkOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    workOrder: any | null;
}

export default function EditWorkOrderModal({ isOpen, onClose, onSubmit, workOrder }: EditWorkOrderModalProps) {
    const [formData, setFormData] = useState({
        status: '', priority: '', startDate: '', deadline: ''
    });

    // Populate form when a work order is selected
    useEffect(() => {
        if (workOrder) {
            setFormData({
                status: workOrder.status,
                priority: workOrder.priority,
                startDate: workOrder.startDate,
                deadline: workOrder.deadline
            });
        }
    }, [workOrder]);

    if (!isOpen || !workOrder) return null;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...workOrder, ...formData });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Edit {workOrder.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Production Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                            <option value="Pending">Pending (Waiting for Materials)</option>
                            <option value="In Progress">In Progress (Manufacturing)</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}