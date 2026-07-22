"use client";

import React, { useState } from "react";

export interface ProductSelectProps {
  value: string;
  onChange: (productId: string) => void;
  products: { productId: string; name: string; imagePath: string }[];
}

/** Custom dropdown for selecting a product with image preview. */
export function ProductSelect({ value, onChange, products }: ProductSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedProduct = products.find(p => p.productId === value);

  return (
    <div className="product-select-dropdown">
      <button
        type="button"
        className="product-select-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedProduct ? (
          <div className="d-flex align-items-center gap-2">
            <img src={selectedProduct.imagePath} alt={selectedProduct.name} style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
            <span>{selectedProduct.name}</span>
          </div>
        ) : (
          <span className="text-muted">-- Select Product --</span>
        )}
        <span className="text-muted">&#9662;</span>
      </button>

      {isOpen && (
        <div className="product-select-menu">
          {products.map(p => (
            <button
              key={p.productId}
              type="button"
              className="product-select-item"
              onClick={() => { onChange(p.productId); setIsOpen(false); }}
            >
              <img src={p.imagePath} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
