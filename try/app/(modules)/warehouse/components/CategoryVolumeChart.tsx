"use client";

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export function CategoryVolumeChart() {
  const data = {
    labels: ["Cotton Shirts", "Denim Jackets", "Knitwear"],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: ["#000000", "#515f74", "#c6c6cd"],
        hoverBackgroundColor: ["#1e293b", "#3a485b", "#9ea0a8"],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#191c1e",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        titleFont: { family: "'IBM Plex Sans', sans-serif", size: 12, weight: "bold" },
        bodyFont: { family: "'IBM Plex Sans', sans-serif", size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.parsed}%`,
        },
      },
    },
  };

  return (
    <div style={{ position: "relative", width: "160px", height: "160px", margin: "0 auto" }}>
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "monospace", color: "#000000" }}>
          100%
        </div>
        <div style={{ fontSize: "10px", color: "#45464d", fontFamily: "monospace", textTransform: "uppercase" }}>
          Volume
        </div>
      </div>
    </div>
  );
}
