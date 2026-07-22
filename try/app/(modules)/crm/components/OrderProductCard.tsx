import React from "react";
import { Product, resolveMediaUrl } from "../api/catalog.api";

export interface OrderProductCardProps {
  product: Product;
  selected?: boolean;
  onSelect?: (product: Product) => void;
}

/** Renders a selectable product card with image and selection state. */
export function OrderProductCard({ product, selected = false, onSelect }: OrderProductCardProps) {
  const imageUrl = resolveMediaUrl(product.imagePath, "product");

  return (
    <div
      onClick={() => onSelect && onSelect(product)}
      className={`border rounded-xl p-4 cursor-pointer transition-all ${
        selected ? "border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20" : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
      }`}
    >
      <div className="w-full h-36 bg-slate-100 rounded-lg overflow-hidden mb-3 relative flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-slate-300 text-4xl">inventory_2</span>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{product.name}</h4>
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
        {product.sizes?.length ? `Sizes: ${product.sizes.join(", ")}` : "Standard garment item"}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-400">ID: {product.id}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
          {selected ? "Selected" : "Select"}
        </span>
      </div>
    </div>
  );
}
