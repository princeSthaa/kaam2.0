import React, { useState, useEffect } from 'react';
import { API_MAIN_URL } from "@/app/(modules)/api/constant";

interface CreateRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    // You can define a stricter type for the data later based on your API
    onSubmit: (data: any) => void;
}

export default function CreateRequestModal({ isOpen, onClose, onSubmit }: CreateRequestModalProps) {
    const [materials, setMaterials] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        material: '',
        quantity: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetch(`${API_MAIN_URL}/material`)
                .then(res => res.json())
                .then(data => setMaterials(data))
                .catch(err => console.error("Failed to fetch materials:", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        // Reset form after submission
        setFormData({ material: '', quantity: '', notes: '' });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">

                {/* Modal Header */}
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Create Material Request</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">

                    <div>
                        <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                            Requested Material
                        </label>
                        <select
                            id="material"
                            name="material"
                            value={formData.material}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            required
                        >
                            <option value="" disabled>Select a Material</option>
                            {materials.map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.materialCode})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            min="1"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="e.g., 500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={2}
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Add any specific instructions..."
                        />
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
