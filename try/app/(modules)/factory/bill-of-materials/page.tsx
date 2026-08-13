"use client";

import React, { useState, useEffect } from 'react';
import { fetchProducts, ProductDto } from "../api/product.api";

export default function BillOfMaterialsPage() {
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const data = await fetchProducts();
            // Filter products that have material requirements to show only those with BOMs
            // or we can show all products. Let's show all for now.
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (productId: string) => {
        if (expandedProductId === productId) {
            setExpandedProductId(null);
        } else {
            setExpandedProductId(productId);
        }
    };

    // Helper to map size enums/values if needed
    const getSizeLabel = (size: number | string) => {
        const sizes: Record<number, string> = {
            0: "XS", 1: "S", 2: "M", 3: "L", 4: "XL", 5: "XXL"
        };
        if (typeof size === "number" && sizes[size]) {
            return sizes[size];
        }
        return size;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bill of Materials (BOM)</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage material requirements for products.
                    </p>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 border-b border-gray-200 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">SKU</th>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">BOM Items</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <React.Fragment key={product.id}>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{product.sku || "N/A"}</td>
                                            <td className="px-6 py-4">{product.name}</td>
                                            <td className="px-6 py-4">{product.productCategory?.name || "N/A"}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {product.materialRequirements?.length || 0} Items
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                    onClick={() => toggleExpand(product.id)}
                                                >
                                                    {expandedProductId === product.id ? "Hide BOM" : "View BOM"}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expanded Row for BOM Details */}
                                        {expandedProductId === product.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="bg-white border border-gray-200 rounded-md p-4">
                                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Material Requirements</h3>
                                                        {(!product.materialRequirements || product.materialRequirements.length === 0) ? (
                                                            <p className="text-sm text-gray-500">No materials required for this product.</p>
                                                        ) : (
                                                            <table className="w-full text-left text-sm text-gray-600">
                                                                <thead className="bg-gray-100 text-gray-900 border-b border-gray-200 text-xs font-semibold">
                                                                    <tr>
                                                                        <th className="px-4 py-2">Material Type</th>
                                                                        <th className="px-4 py-2">Product Size</th>
                                                                        <th className="px-4 py-2">Quantity</th>
                                                                        <th className="px-4 py-2">Unit</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {product.materialRequirements.map((req, idx) => (
                                                                        <tr key={req.id || idx}>
                                                                            <td className="px-4 py-2">{req.materialType?.name || req.materialTypeId}</td>
                                                                            <td className="px-4 py-2">{getSizeLabel(req.productSize)}</td>
                                                                            <td className="px-4 py-2">{req.quantity}</td>
                                                                            <td className="px-4 py-2">{req.materialType?.unit || "N/A"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
