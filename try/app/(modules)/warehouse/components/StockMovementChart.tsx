"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockMovementChartProps {
  timeframe?: "Mon-Sun" | "14-Days";
}

export function StockMovementChart({ timeframe = "Mon-Sun" }: StockMovementChartProps) {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Inbound Flow",
        data: [120, 150, 180, 140, 210, 90, 80],
        borderColor: "#000000",
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: "#000000",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: "Outbound Flow",
        data: [100, 130, 200, 110, 190, 120, 90],
        borderColor: "#515f74",
        backgroundColor: "rgba(81, 95, 116, 0.04)",
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        borderDash: [5, 4],
        pointRadius: 4,
        pointBackgroundColor: "#515f74",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // We have a custom legend in the component header
      },
      tooltip: {
        backgroundColor: "#191c1e",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        titleFont: { family: "'IBM Plex Sans', sans-serif", size: 12, weight: "bold" },
        bodyFont: { family: "'IBM Plex Sans', sans-serif", size: 12 },
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: "'IBM Plex Sans', sans-serif", size: 11 },
          color: "#76777d",
        },
      },
      y: {
        grid: {
          color: "rgba(198, 198, 205, 0.3)",
        },
        ticks: {
          font: { family: "'IBM Plex Sans', sans-serif", size: 11 },
          color: "#76777d",
          padding: 8,
        },
      },
    },
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "240px" }}>
      <Line data={data} options={options} />
    </div>
  );
}
