"use client";

import React, { useMemo, useState } from 'react';

export default function RequisitionDrawer({ tempData, onClose }: any) {
  const [requiredDate, setRequiredDate] = useState("2026-07-20");
  const [urgency, setUrgency] = useState("high");
  const [notes, setNotes] = useState("");

  const firstItemName = tempData?.basket?.[0]?.productName || "Garments";

  const shortages = useMemo(() => {
    if (!tempData || !tempData.basket) return [];

    let totalNavy = 0;
    let totalQty = 0;

    tempData.basket.forEach((item: any) => {
      const qty = Number(item.quantity) || 0;
      totalQty += qty;
      if (item.variant && item.variant.includes("Navy")) {
        totalNavy += qty;
      } else {
        totalNavy += qty;
      }
    });

    const fabricReq = Math.ceil(totalNavy * 1.8);
    const fabricShortage = Math.max(fabricReq - 120, 0);

    const threadReq = Math.ceil(totalQty * 0.03);
    const threadShortage = Math.max(threadReq - 8, 0);

    const list = [];
    if (fabricShortage > 0) {
      list.push({
        name: "Cotton-Blend Fabric",
        desc: "Navy Blue, 120gsm",
        shortage: `${fabricShortage}m`
      });
    }
    if (threadShortage > 0) {
      list.push({
        name: "Cotton Thread",
        desc: "White, Heavy Duty",
        shortage: `${threadShortage} spools`
      });
    }
    return list;
  }, [tempData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Purchase requisition submitted successfully!\nRequired By: ${requiredDate}\nUrgency: ${urgency}\n\nProduction status will be updated to 'On Hold - Awaiting Materials'.`);
    onClose();
  };

  return (
    <>
      {/*  Drawer Overlay  */}
      <div 
        aria-hidden="true" 
        onClick={onClose}
        className="fixed inset-0 drawer-overlay z-40 transition-opacity bg-black/30 backdrop-blur-xs"
      ></div>
      {/*  Slide-out Drawer  */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-kaam-surface-container-lowest border-l border-kaam-outline-variant shadow-2xl flex flex-col drawer-slide-in">
        {/*  Drawer Header  */}
        <div className="px-kaam-container-padding py-6 border-b border-kaam-outline-variant flex justify-between items-start bg-kaam-surface-bright">
          <div>
            <h2 className="font-kaam-headline-md text-kaam-headline-md text-kaam-on-surface mb-1">Create Purchase Requisition</h2>
            <p className="font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface-variant">
              Auto-generated for planning run:<br/>
              <span className="font-kaam-label-md text-kaam-label-md text-kaam-secondary font-bold">({firstItemName})</span>
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-kaam-on-surface-variant hover:text-on-surface transition-colors rounded-kaam-DEFAULT p-1 hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/*  Drawer Body  */}
        <div className="flex-1 overflow-y-auto p-kaam-container-padding space-y-8 bg-kaam-surface-bright">
          {/*  Shortage List Module  */}
          <section>
            <h3 className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase mb-4 tracking-wider">Identified Material Shortages</h3>
            <div className="border border-kaam-outline-variant rounded-kaam-DEFAULT overflow-hidden bg-kaam-surface-container-lowest shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-kaam-surface-container-low border-b border-kaam-outline-variant">
                  <tr>
                    <th className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface py-3 px-4 font-semibold">Material Item</th>
                    <th className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface py-3 px-4 font-semibold text-right">Shortage Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {shortages.length > 0 ? (
                    shortages.map((st, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface font-medium">{st.name}</div>
                          <div className="font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface-variant text-xs">{st.desc}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 bg-kaam-error-container text-kaam-on-error-container px-2 py-1 rounded-kaam-DEFAULT border border-kaam-error/20">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            <span className="font-kaam-label-md text-kaam-label-md">{st.shortage}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-muted font-kaam-body-sm">
                        No material shortages calculated.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/*  Procurement Form  */}
          <section>
            <h3 className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface-variant uppercase mb-4 tracking-wider">Requisition Details</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/*  Required By Date  */}
              <div>
                <label className="block font-kaam-label-md text-kaam-label-md text-kaam-on-surface mb-1.5" htmlFor="required-date">Required By Date <span className="text-kaam-error">*</span></label>
                <div className="relative">
                  <input 
                    className="block w-full border border-kaam-outline rounded-kaam-DEFAULT bg-kaam-surface-container-lowest py-2.5 px-3 font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-shadow" 
                    id="required-date" 
                    name="required-date" 
                    type="date" 
                    value={requiredDate}
                    onChange={e => setRequiredDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              {/*  Urgency Level  */}
              <div>
                <label className="block font-kaam-label-md text-kaam-label-md text-kaam-on-surface mb-1.5" htmlFor="urgency">Urgency Level <span className="text-kaam-error">*</span></label>
                <select 
                  className="block w-full border border-kaam-outline rounded-kaam-DEFAULT bg-kaam-surface-container-lowest py-2.5 px-3 font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-shadow h-11" 
                  id="urgency" 
                  name="urgency"
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                >
                  <option value="standard">Standard Procurement</option>
                  <option value="high">High Priority (Expedite)</option>
                  <option value="critical">Critical / Line-Down Risk</option>
                </select>
              </div>
              {/*  Notes  */}
              <div>
                <label className="block font-kaam-label-md text-kaam-label-md text-kaam-on-surface mb-1.5" htmlFor="notes">Notes for Purchasing Dept.</label>
                <textarea 
                  className="block w-full border border-kaam-outline rounded-kaam-DEFAULT bg-kaam-surface-container-lowest py-2 px-3 font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-shadow resize-none placeholder:text-on-surface-variant/50" 
                  id="notes" 
                  name="notes" 
                  placeholder="Enter any specific vendor requirements or shipping instructions..." 
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                ></textarea>
              </div>

              {/*  Drawer Footer (Sticky inside drawer)  */}
              <div className="pt-4 border-t border-kaam-outline-variant flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-5 py-2.5 border border-kaam-outline text-kaam-on-surface font-kaam-label-md text-kaam-label-md font-semibold rounded-kaam-DEFAULT hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-kaam-primary text-kaam-on-primary font-kaam-label-md text-kaam-label-md font-semibold rounded-kaam-DEFAULT hover:bg-inverse-surface transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Send Requisition
                </button>
              </div>
            </form>
          </section>
          
          {/*  Status Impact Alert  */}
          <section>
            <div className="bg-kaam-surface-container-low border border-kaam-outline-variant rounded-kaam-DEFAULT p-4 flex gap-3 items-start shadow-sm">
              <span className="material-symbols-outlined text-kaam-secondary mt-0.5">info</span>
              <div>
                <h4 className="font-kaam-label-md text-kaam-label-md text-kaam-on-surface font-semibold mb-1">Production Plan Status Impact</h4>
                <p className="font-kaam-body-sm text-kaam-body-sm text-kaam-on-surface-variant">
                  Submitting this request will automatically place the production plan into an <strong>'On Hold - Awaiting Materials'</strong> status until receiving confirms inventory intake.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
