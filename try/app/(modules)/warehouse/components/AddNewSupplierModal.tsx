"use client";

import React, { useState } from "react";
import "../styles/warehouse-supplier.css";

export type AddNewSupplierModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (supplierData: any) => void;
};

export function AddNewSupplierModal({
  isOpen,
  onClose,
  onSuccess,
}: AddNewSupplierModalProps) {
  const [supplierName, setSupplierName] = useState("");
  const [legalEntity, setLegalEntity] = useState("");
  const [location, setLocation] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [status, setStatus] = useState<"Active" | "Pending" | "Inactive">("Pending");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [categories, setCategories] = useState<string[]>(["Fabric"]);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const availableCategories = ["Fabric", "Trims", "Dyes", "Packaging"];

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSuccess) {
      onSuccess({
        name: supplierName || "New Textile Supplier",
        code: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
        legalEntity,
        location: location || "Shenzhen, CN",
        contactPerson: contactName || "Primary Contact",
        contactEmail,
        contactPhone,
        status,
        paymentTerms,
        categories: categories.length ? categories : ["Fabric"],
        notes,
      });
    }
    onClose();
  };

  return (
    <div className="wh-ans-modal-overlay">
      
      {/* ── STITCH DESIGN: ADD NEW SUPPLIER MODAL CONTAINER ── */}
      <div className="wh-ans-modal-container">
        
        {/* Header */}
        <div className="wh-ans-modal-header">
          <div>
            <h2 className="font-extrabold text-slate-900 text-xl m-0">Add New Supplier</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors p-1 text-xl font-bold cursor-pointer"
            title="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Body (Scrollable Form) */}
        <form onSubmit={handleSubmit} className="wh-ans-modal-form">
          <div className="wh-ans-modal-body">
            
            {/* Section 1: Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Supplier Name */}
              <div className="flex flex-col gap-1">
                <label className="wh-ans-modal-label" htmlFor="ans-name">
                  SUPPLIER NAME <span className="text-red-600 ml-0.5">*</span>
                </label>
                <div className="wh-ans-modal-input-wrapper">
                  <div className="wh-ans-modal-accent-bar"></div>
                  <input
                    id="ans-name"
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Enter supplier name"
                    className="wh-ans-modal-input pl-4"
                    required
                  />
                </div>
              </div>

              {/* Legal Entity / Tax ID */}
              <div className="flex flex-col gap-1">
                <label className="wh-ans-modal-label" htmlFor="ans-legal">
                  LEGAL ENTITY / TAX ID
                </label>
                <input
                  id="ans-legal"
                  type="text"
                  value={legalEntity}
                  onChange={(e) => setLegalEntity(e.target.value)}
                  placeholder="e.g. 12-3456789"
                  className="wh-ans-modal-input"
                />
              </div>

            </div>

            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="wh-ans-modal-label" htmlFor="ans-location">
                LOCATION (CITY, COUNTRY)
              </label>
              <input
                id="ans-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Shenzhen, China"
                className="wh-ans-modal-input"
              />
            </div>

            <hr className="border-slate-200 my-1" />

            {/* Section 2: Contact Info */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-900 m-0">Primary Contact Person</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Contact Name */}
                <div className="flex flex-col gap-1">
                  <label className="wh-ans-modal-label" htmlFor="ans-cname">
                    NAME
                  </label>
                  <input
                    id="ans-cname"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full name"
                    className="wh-ans-modal-input"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="wh-ans-modal-label" htmlFor="ans-cemail">
                    EMAIL
                  </label>
                  <input
                    id="ans-cemail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="wh-ans-modal-input"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <label className="wh-ans-modal-label" htmlFor="ans-cphone">
                    PHONE
                  </label>
                  <input
                    id="ans-cphone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="wh-ans-modal-input"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-200 my-1" />

            {/* Section 3: Operational Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Status Select */}
              <div className="flex flex-col gap-1">
                <label className="wh-ans-modal-label" htmlFor="ans-status">
                  STATUS <span className="text-red-600 ml-0.5">*</span>
                </label>
                <div className="wh-ans-modal-input-wrapper">
                  <div className="wh-ans-modal-accent-bar"></div>
                  <select
                    id="ans-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="wh-ans-modal-select pl-4 pr-8"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="flex flex-col gap-1">
                <label className="wh-ans-modal-label" htmlFor="ans-terms">
                  PAYMENT TERMS
                </label>
                <div className="wh-ans-modal-input-wrapper">
                  <select
                    id="ans-terms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="wh-ans-modal-select pr-8"
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="COD">COD</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

            </div>

            {/* Product Categories */}
            <div className="flex flex-col gap-2">
              <label className="wh-ans-modal-label">
                PRODUCT CATEGORIES
              </label>
              <div className="flex flex-wrap gap-4 items-center pt-1">
                {availableCategories.map((cat) => (
                  <label key={cat} className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 4: Internal Notes */}
            <div className="flex flex-col gap-1">
              <label className="wh-ans-modal-label" htmlFor="ans-notes">
                INTERNAL NOTES
              </label>
              <textarea
                id="ans-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant internal notes..."
                className="wh-ans-modal-textarea"
                rows={3}
              ></textarea>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="wh-ans-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="wh-ans-modal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="wh-ans-modal-btn-submit"
            >
              Add Supplier
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
