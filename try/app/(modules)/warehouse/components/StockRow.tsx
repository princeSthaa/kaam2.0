import React from "react";

export interface StockRowProps {
  sku: string;
  item: string;
  type: string;
  quantity: string | number;
  location: string;
  status: string;
  image?: string;
}

/** Renders a single row in the stock inventory table with status badge. */
export function StockRow({ sku, item, type, quantity, location, status, image }: StockRowProps) {
  const badgeClass = status === "In Stock"
    ? "bg-success"
    : status === "Low Stock"
    ? "bg-warning"
    : "bg-secondary";

  return (
    <tr>
      <td>{sku}</td>
      <td className="fw-medium">
        <div className="flex items-center gap-3">
          {image && (
            <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
              <img src={image} alt={item} className="w-full h-full object-cover" />
            </div>
          )}
          <span>{item}</span>
        </div>
      </td>
      <td>{type}</td>
      <td>{quantity}</td>
      <td>{location}</td>
      <td>
        <span className={`badge ${badgeClass}`}>{status}</span>
      </td>
    </tr>
  );
}
