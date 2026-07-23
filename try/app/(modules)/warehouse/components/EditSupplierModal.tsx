"use client";

import React, { useState, useEffect } from "react";
import "../styles/warehouse-supplier.css";

export type EditSupplierModalProps = {
  isOpen: boolean;
  onClose: () => void;
  supplier?: {
    id?: string;
    name?: string;
    code?: string;
    contactPerson?: string;
    status?: "Active" | "Pending" | "Suspended";
    categories?: string[];
    notes?: string;
  } | null;
  onSave?: (updatedData: any) => void;
};

export function EditSupplierModal({
  isOpen,
  onClose,
  supplier,
  onSave,
}: EditSupplierModalProps) {
  const [contactPerson, setContactPerson] = useState("Sarah Jenkins");
  const [status, setStatus] = useState<"Active" | "Pending" | "Suspended">("Active");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Raw Cotton",
    "Synthetic Blends",
  ]);
  const [notes, setNotes] = useState(
    "Reliable delivery schedule. Negotiate new rates for raw cotton starting Q3."
  );

  const availableCategories = [
    "Raw Cotton",
    "Synthetic Blends",
    "Dyes & Chemicals",
    "Packaging Materials",
  ];

  useEffect(() => {
    if (supplier) {
      if (supplier.contactPerson) setContactPerson(supplier.contactPerson);
      if (supplier.status) setStatus(supplier.status);
      if (supplier.categories) setSelectedCategories(supplier.categories);
    }
  }, [supplier]);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        id: supplier?.id || "sup-1",
        contactPerson,
        status,
        categories: selectedCategories,
        notes,
      });
    }
    onClose();
  };

  return (
    <div className="wh-esmd-overlay">
      
      {/* ── STITCH DESIGN: EDIT SUPPLIER DETAILS MODAL CONTAINER ── */}
      <div className="wh-esmd-container">
        
        {/* Modal Header */}
        <div className="wh-esmd-header">
          <div>
            <h2 className="font-extrabold text-slate-900 text-xl m-0">Edit Supplier Details</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1 m-0">
              {supplier?.name || "Global Textiles Ltd."} •{" "}
              <span className="font-mono font-bold text-slate-700">
                {supplier?.code || "SUP-9204"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors p-1 text-xl font-bold cursor-pointer"
            title="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="wh-esmd-form">
          <div className="wh-esmd-body">
            
            {/* Section 1: Primary Info (Grid 2 Cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Contact Person */}
              <div className="flex flex-col">
                <label className="wh-esmd-field-label" htmlFor="edit-contact-person">
                  Contact Person
                </label>
                <div className="wh-esmd-input-wrapper">
                  <div className="wh-esmd-accent-bar"></div>
                  <input
                    id="edit-contact-person"
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="wh-esmd-input pl-4 pr-9"
                    required
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-[18px] pointer-events-none">
                    person
                  </span>
                </div>
              </div>

              {/* Status Select */}
              <div className="flex flex-col">
                <label className="wh-esmd-field-label" htmlFor="edit-status">
                  Status
                </label>
                <div className="wh-esmd-input-wrapper">
                  <select
                    id="edit-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="wh-esmd-select pr-9"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-[18px] pointer-events-none">
                    arrow_drop_down
                  </span>
                </div>
              </div>

            </div>

            <hr className="border-slate-200 my-1" />

            {/* Section 2: Categorization */}
            <div className="flex flex-col gap-2">
              <label className="wh-esmd-field-label">
                Product Categories
              </label>
              <div className="flex flex-wrap gap-2 items-center pt-1">
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`wh-esmd-category-pill ${
                        isSelected ? "selected" : "unselected"
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                      <span>{cat}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="wh-esmd-btn-add-category"
                  onClick={() => {
                    const newCat = prompt("Enter new category:");
                    if (newCat && newCat.trim()) {
                      setSelectedCategories((prev) => [...prev, newCat.trim()]);
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-200 my-1" />

            {/* Section 3: Internal Notes */}
            <div className="flex flex-col gap-2">
              <label className="wh-esmd-field-label" htmlFor="edit-notes">
                Internal Notes
              </label>
              <textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="wh-esmd-textarea"
                rows={3}
              ></textarea>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="wh-esmd-footer">
            <button
              type="button"
              onClick={onClose}
              className="wh-esmd-btn-cancel"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="wh-esmd-btn-save"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
