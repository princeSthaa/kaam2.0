"use client";

import React, { useState, useEffect } from "react";
import { Customer } from "../dto/customer.dto";
import { updateCustomer } from "../api/constant";

export interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSaved: (updatedCustomer: Customer) => void;
}

const CUSTOMER_TYPE_OPTIONS = [
  { value: "Retail", label: "Retail Client" },
  { value: "Wholesale", label: "Wholesale Buyer" },
  { value: "Distributor", label: "Distributor / Partner" },
  { value: "Export", label: "Export Client" },
  { value: "Corporate", label: "Corporate / Institutional" },
];

export function EditCustomerModal({
  isOpen,
  onClose,
  customer,
  onSaved,
}: EditCustomerModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    type: string;
    company: string;
    panVat: string;
  }>({
    name: "",
    email: "",
    phone: "",
    address: "",
    type: "Retail",
    company: "",
    panVat: "",
  });

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        type: customer.type || "Retail",
        company: customer.company || "",
        panVat: customer.panVat || "",
      });
      setErrorMessage(null);
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.id) return;

    if (!formData.name.trim()) {
      setErrorMessage("Customer full name is required.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Phone number is required.");
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage("Address is required.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const payload: Partial<Customer> = {
        id: customer.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        type: formData.type,
        company: formData.company.trim(),
        panVat: formData.panVat.trim(),
        updatedAt: new Date().toISOString(),
      };

      const updated = await updateCustomer(customer.id, payload);
      onSaved(updated);
      onClose();
    } catch (err: any) {
      console.error("Failed to update customer:", err);
      setErrorMessage(err?.message || "Failed to update customer information.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-slate-800 animate-scaleUp">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">person_edit</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Edit Customer Details
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                ID: <span className="font-bold text-slate-700">{customer.id}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700 block">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ram Shrestha"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. contact@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 98XXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Customer Type */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Customer Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer transition-all"
              >
                {CUSTOMER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* PAN / VAT Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                PAN / VAT Number
              </label>
              <input
                type="text"
                name="panVat"
                value={formData.panVat}
                onChange={handleChange}
                placeholder="e.g. 600123456"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
              />
            </div>

            {/* Company / Business Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700 block">
                Company / Business Name
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Himalayan Apparel Enterprises Pvt. Ltd."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
              />
            </div>

            {/* Full Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700 block">
                Full Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, City, District, Province..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
