import React from "react";

export interface StockRowProps {
  sku: string;
  item: string;
  type: string;
  quantity: string | number;
  location: string;
  status: string;
}

/** Renders a single row in the stock inventory table with status badge. */
export function StockRow({ sku, item, type, quantity, location, status }: StockRowProps) {
  const badgeClass = status === "In Stock"
    ? "bg-success"
    : status === "Low Stock"
    ? "bg-warning"
    : "bg-secondary";

  return (
    <tr>
      <td>{sku}</td>
      <td className="fw-medium">{item}</td>
      <td>{type}</td>
      <td>{quantity}</td>
      <td>{location}</td>
      <td>
        <span className={`badge ${badgeClass}`}>{status}</span>
      </td>
    </tr>
  );
}
