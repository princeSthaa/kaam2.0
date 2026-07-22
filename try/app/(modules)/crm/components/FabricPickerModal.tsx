"use client";

import React, { useState, useEffect } from "react";
import { Fabric, resolveMediaUrl } from "../api/catalog.api";

export interface FabricPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fabricId: string) => void;
  fabrics: Fabric[];
}

/** Modal dialog for browsing and selecting fabrics by category. */
export function FabricPickerModal({ isOpen, onClose, onSelect, fabrics }: FabricPickerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
      setSearch("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCat = (f: Fabric) => f.category || (f as any).type || "General";
  const categories = Array.from(new Set(fabrics.map(getCat)));

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setSearch("");
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSearch("");
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }} tabIndex={-1} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedCategory ? `Select Fabric - ${selectedCategory}` : "Select Fabric Category"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body fabric-modal-body" style={{ maxHeight: "500px", overflowY: "auto" }}>
              {!selectedCategory ? (
                <>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Search categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <div className="row">
                    {categories.filter(c => c.toLowerCase().includes(search.toLowerCase())).map(cat => {
                      const catFabrics = fabrics.filter(f => getCat(f) === cat);
                      return (
                        <div key={cat} className="col-md-4 col-sm-6 mb-4">
                          <div
                            className="border rounded fabric-cat-col text-center bg-white shadow-sm"
                            style={{ cursor: "pointer", transition: "transform 0.2s", overflow: "hidden" }}
                            onClick={() => handleCategoryClick(cat)}
                          >
                            <div className="d-flex" style={{ width: "100%", background: "#eee" }}>
                              {catFabrics.slice(0, 4).map(f => (
                                <img key={f.id} src={resolveMediaUrl(f.imagePath, "fabric")} alt={f.name} style={{ flex: 1, height: "100px", objectFit: "cover", minWidth: 0 }} />
                              ))}
                            </div>
                            <div className="p-3 border-top">
                              <strong style={{ fontSize: "1.1em", color: "#333" }}>{cat}</strong><br/>
                              <small className="text-muted">{catFabrics.length} fabric options</small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="d-flex mb-3 gap-2 align-items-center">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleBack}>
                      &larr; Back
                    </button>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search fabrics..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="row">
                    {fabrics
                      .filter(f => getCat(f) === selectedCategory)
                      .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
                      .map(f => (
                        <div key={f.id} className="col-md-4 col-sm-6 mb-3">
                          <div
                            className="fabric-item bg-white shadow-sm"
                            onClick={() => {
                              onSelect(f.id);
                              onClose();
                            }}
                          >
                            <img src={resolveMediaUrl(f.imagePath, "fabric")} alt={f.name} />
                            <strong>{f.name}</strong><br/>
                            <small className="text-muted">{f.id}</small>
                          </div>
                        </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
