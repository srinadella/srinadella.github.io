"use client";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function LineChart({ labels, data }: { labels: string[]; data: number[] }) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Metric",
            data,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.3,
          },
        ],
      }}
    />
  );
}
