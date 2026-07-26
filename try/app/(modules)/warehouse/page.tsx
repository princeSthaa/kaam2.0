"use client";

import React from "react";
import Link from "next/link";
import { StockMovementChart } from "./components/StockMovementChart";
import { CategoryVolumeChart } from "./components/CategoryVolumeChart";
import "./styles/warehouse-command-center.css";

export default function WarehouseIndexPage() {
  return (
    <div className="wh-advanced-command-canvas">

      {/* ── 1. HEADER (Main Content Title) ── */}
      <div className="wh-cmd-header">
        <div className="wh-cmd-title-group">
          <h2>Command Center</h2>
          <p>Real-time pulse of warehouse logistics &amp; demand.</p>
        </div>
        <div className="wh-live-status-tag">
          <span className="wh-pulse-green" />
          <span>Live Status</span>
        </div>
      </div>

      {/* ── 2. SUMMARY CARDS (4 Bento Glass Cards) ── */}
      <div className="wh-summary-grid">

        {/* Card 1: Total Stock Value */}
        <div className="wh-glass-card wh-sum-card-inner">
          <div className="wh-sum-card-top">
            <span className="wh-sum-card-label">Total Stock Value</span>
            <div className="wh-sum-icon-box">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <div>
            <div className="wh-sum-card-val">Rs 14.2M</div>
            <div className="wh-trend-up-green">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +2.4% vs last week
            </div>
          </div>
        </div>

        {/* Card 2: Warehouse Capacity */}
        <div className="wh-glass-card wh-sum-card-inner">
          <div className="wh-sum-card-top">
            <span className="wh-sum-card-label">Warehouse Capacity</span>
            <div className="wh-sum-icon-box">
              <span className="material-symbols-outlined text-[20px]">warehouse</span>
            </div>
          </div>
          <div>
            <div className="wh-sum-card-val">78%</div>
            <div className="wh-progress-container">
              <div className="wh-progress-bar-fill" style={{ width: "78%" }} />
            </div>
            <div className="text-xs text-[#45464d] mt-2 font-medium">Optimal range</div>
          </div>
        </div>

        {/* Card 3: Pending Dispatches (Alert Box) */}
        <div className="wh-glass-card wh-sum-card-inner wh-pending-card">
          <div className="wh-pending-corner-bg" />
          <div className="wh-sum-card-top relative z-10">
            <span className="wh-sum-card-label" style={{ color: "#191c1e" }}>Pending Dispatches</span>
            <div className="wh-sum-icon-box error">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="wh-sum-card-val error">342</div>
            <div className="wh-trend-error">
              <span className="material-symbols-outlined text-[14px]">error</span>
              120 due today
            </div>
          </div>
        </div>

        {/* Card 4: Incoming Finished Goods */}
        <div className="wh-glass-card wh-sum-card-inner">
          <div className="wh-sum-card-top">
            <span className="wh-sum-card-label">Incoming Finished Goods</span>
            <div className="wh-sum-icon-box">
              <span className="material-symbols-outlined text-[20px]">inventory</span>
            </div>
          </div>
          <div>
            <div className="wh-sum-card-val">12</div>
            <div className="text-xs text-[#45464d] mt-1 font-medium">Expected today from Factory</div>
          </div>
        </div>

      </div>

      {/* ── 3. CHARTS SECTION (Stock Movement & Volume Distribution) ── */}
      <div className="wh-charts-grid">

        {/* Line Chart Card: Stock Movement Trends (Chart.js) */}
        <div className="wh-glass-card wh-chart-line-card">
          <div className="wh-chart-header">
            <div>
              <h3 className="wh-chart-title">Stock Movement Trends</h3>
              <p className="wh-chart-sub">Inbound vs. Outbound flow</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#000000]" />
                <span className="text-[#45464d]">Inbound Flow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#515f74]" />
                <span className="text-[#45464d]">Outbound Flow</span>
              </div>
            </div>
          </div>

          {/* Dynamic Responsive Chart.js Line Graph */}
          <StockMovementChart />
        </div>

        {/* Doughnut Chart Card: Volume Distribution (Chart.js) */}
        <div className="wh-glass-card wh-chart-doughnut-card">
          <h3 className="wh-chart-title">Volume Distribution</h3>
          <p className="wh-chart-sub" style={{ marginBottom: "16px" }}>Category Breakdown</p>

          <div className="flex-1 flex flex-col justify-center items-center">
            {/* Dynamic Responsive Chart.js Doughnut Graph */}
            <CategoryVolumeChart />

            {/* Category Breakdown Legend List */}
            <div className="wh-doughnut-legend-list">
              <div className="wh-legend-row">
                <div className="wh-legend-label-group">
                  <span className="wh-legend-dot black" />
                  <span>Cotton Shirts</span>
                </div>
                <span className="wh-legend-pct">45%</span>
              </div>

              <div className="wh-legend-row">
                <div className="wh-legend-label-group">
                  <span className="wh-legend-dot grey" />
                  <span>Denim Jackets</span>
                </div>
                <span className="wh-legend-pct">30%</span>
              </div>

              <div className="wh-legend-row">
                <div className="wh-legend-label-group">
                  <span className="wh-legend-dot light" />
                  <span>Knitwear</span>
                </div>
                <span className="wh-legend-pct">25%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── 4. LISTS & TABLES (Material Traceability & Logistics Queue) ── */}
      <div className="wh-tables-grid">

        {/* Material Traceability */}
        <div className="wh-glass-card wh-table-card">
          <div className="wh-table-card-header">
            <h3>Material Traceability</h3>
            <Link href="/warehouse/stock" className="text-decoration-none">
              <button type="button" className="wh-view-all-btn">View All</button>
            </Link>
          </div>

          <div className="wh-trace-list">
            {/* Item 1 */}
            <div className="wh-trace-item">
              <div className="wh-trace-left">
                <div className="wh-trace-thumb">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtov2kcresB8knlAYV_AcsdfnQWp9_JTyjbhByzwkxHbV5N-By3kg-94gOHZYDySBPUtKHWMni2u4GCqoc8arHJc7OGYlTsKumIL910cqa1i0f4Gm9H8fpk_-QDFDzHT8dhWiAflggZ2a8jHiL6-67k7VNqlqbS3AeftLyimn0OFcmrMvmJlLElcHnJlmPHNqxbzW8a95EOR19VsQsOxFmCECO0OBTSQRMennrEC0_E7-1Rw0fI1-WvtvLbgkuev9TEZGLY4MILE8"
                    alt="100% Navy Twill"
                  />
                </div>
                <div>
                  <div className="wh-trace-name">100% Navy Twill (Raw)</div>
                  <div className="wh-trace-sub">500m allocated to Factory A</div>
                </div>
              </div>
              <span className="wh-badge-low-stock">
                <span className="wh-pulse-red-small" /> Low Stock
              </span>
            </div>

            {/* Item 2 */}
            <div className="wh-trace-item">
              <div className="wh-trace-left">
                <div className="wh-trace-thumb">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDicQAO0i8YsBATlqxVPjYwQqNGtpwxE7rJSBOekUtnTKbzV_Go2ZdkAWI6r18OK9xsi3By256nDSOGdLUN86MTm215I7HVTLjnsQ1n3iQ1hRdO9zrLEaIDkQlCbma3uaUX8BWVATtUWn5saZx9uZl7TOhGVg5PZx4xNjjaGqErKiF5y5zB84aSyN3j7fg9uo2sHXyCmATa6t9R5YYjcREu9-Cno6eLDyH-G3WZjkdrvULMuhPoCfGuzfuUndojHbzx06a1CFANX6Q"
                    alt="White Oxford Shirt"
                  />
                </div>
                <div>
                  <div className="wh-trace-name">White Oxford Shirt (Finished)</div>
                  <div className="wh-trace-sub">350 units ready for Dispatch</div>
                </div>
              </div>
              <span className="wh-badge-instock">
                <span className="wh-dot-green-small" /> In Stock
              </span>
            </div>

            {/* Item 3 */}
            <div className="wh-trace-item">
              <div className="wh-trace-left">
                <div className="wh-trace-thumb">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAg1IOdePtBNmEnXOECsFCxGx8STO-Ag9-FJ4g5HDKbKUv68t7-KJwQhus7E7vdNJUwQNp2bp1JcsqFse8a8MNQtZP8ZQ4D2s1tZVEgcSvQHyyA2dtZtOJNnjnmPto0mspgmR9A40lD6biISbM_WQ2l2u7kIspbdOf9CsXmlv5uxhLf0lE9YoJzS7n2Ajizoolp_9I1hLicB0f44bblve0UpX6TfQY2uydXnDP9m230xnfxDjCNX5vfezRHa0xDAnjqJArQVmbb8M"
                    alt="Black Denim 12oz"
                  />
                </div>
                <div>
                  <div className="wh-trace-name">Black Denim 12oz (Raw)</div>
                  <div className="wh-trace-sub">200m pending Reconciliation</div>
                </div>
              </div>
              <span className="wh-badge-reserved">
                <span className="wh-dot-grey-small" /> Reserved
              </span>
            </div>
          </div>
        </div>

        {/* Logistics Queue */}
        <div className="wh-glass-card wh-table-card">
          <div className="wh-table-card-header">
            <h3>Logistics Queue</h3>
            <Link href="/warehouse/factoryrequest" className="text-decoration-none">
              <button type="button" className="wh-view-all-btn">View All</button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="wh-queue-table">
              <thead>
                <tr>
                  <th>Queue Type</th>
                  <th style={{ textAlign: "right" }}>Items</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="wh-queue-icon-circle">
                        <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                      </div>
                      <div>
                        <div className="font-bold text-[#191c1e] text-[13px]">Returns to Supplier</div>
                        <div className="text-[12px] text-[#45464d] font-medium mt-0.5">Defective Materials</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }} className="font-medium text-[13px] text-[#191c1e]">
                    45 units
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="wh-badge-pending">Pending</span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="wh-queue-icon-circle">
                        <span className="material-symbols-outlined text-[16px]">keyboard_return</span>
                      </div>
                      <div>
                        <div className="font-bold text-[#191c1e] text-[13px]">Returns from Customer</div>
                        <div className="text-[12px] text-[#45464d] font-medium mt-0.5">Processing QC</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }} className="font-medium text-[13px] text-[#191c1e]">
                    12 units
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="wh-badge-instock">Receiving</span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="wh-queue-icon-circle">
                        <span className="material-symbols-outlined text-[16px]">check_box</span>
                      </div>
                      <div>
                        <div className="font-bold text-[#191c1e] text-[13px]">Upcoming Finished Goods</div>
                        <div className="text-[12px] text-[#45464d] font-medium mt-0.5">Factory Drop-off</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }} className="font-medium text-[13px] text-[#191c1e]">
                    850 units
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="wh-badge-reserved">Scheduled</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
