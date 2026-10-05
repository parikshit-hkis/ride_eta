"use client";

import { useState, useEffect, useRef } from "react";
import { startTraining, stopTraining, getTrainingStatus, getTrainingRuns } from "@/lib/api";
import {
  Play,
  Square,
  Activity,
  Zap,
  TrendingDown,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TrainingPage() {
  const [isTraining, setIsTraining] = useState(false);
  const [currentRun, setCurrentRun] = useState(null);
  const [epochs, setEpochs] = useState([]);
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const wsRef = useRef(null);

  // Connect WebSocket for live updates
  useEffect(() => {
    function connectWs() {
      const ws = new WebSocket("ws://localhost:8000/ws/training");
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "training_update") {
            setIsTraining(true);
            setCurrentRun({
              id: data.run_id,
              status: data.status,
              completed_epochs: data.completed_epochs,
              total_epochs: data.total_epochs,
              best_epoch: data.best_epoch,
              best_val_loss: data.best_val_loss,
            });
            setEpochs(data.epochs || []);
          } else if (data.type === "training_complete") {
            setIsTraining(false);
            loadRuns();
          } else if (data.type === "no_training") {
            setIsTraining(false);
          }
        } catch (err) {
          console.error("WS Parse Error:", err);
        }
      };

      ws.onclose = () => {
        // Reconnect after 3 seconds if closed
        setTimeout(connectWs, 3000);
      };
    }

    connectWs();
    loadRuns();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  async function loadRuns() {
    try {
      const data = await getTrainingRuns();
      setRuns(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  const handleStartTraining = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await startTraining();
      setIsTraining(true);
    } catch (err) {
      setError(err.message || "Failed to start training");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopTraining = async () => {
    setActionLoading(true);
    try {
      await stopTraining();
    } catch (err) {
      setError(err.message || "Failed to stop training");
    } finally {
      setActionLoading(false);
    }
  };

  // Restrained enterprise chart colors
  const epochLabels = epochs.map((e) => `Epoch ${e.epoch}`);
  const lossChartData = {
    labels: epochLabels,
    datasets: [
      {
        label: "Train Loss",
        data: epochs.map((e) => e.train_loss),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.2,
      },
      {
        label: "Validation Loss",
        data: epochs.map((e) => e.val_loss),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.2,
      },
    ],
  };

  const maeChartData = {
    labels: epochLabels,
    datasets: [
      {
        label: "Train MAE (min)",
        data: epochs.map((e) => e.train_mae),
        borderColor: "#10B981",
        tension: 0.2,
      },
      {
        label: "Validation MAE (min)",
        data: epochs.map((e) => e.val_mae),
        borderColor: "#F97316",
        tension: 0.2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#94a3b8", font: { size: 11, family: "Inter" } },
      },
    },
    scales: {
      x: { grid: { color: "rgba(148,163,184,0.08)" }, ticks: { color: "#64748b" } },
      y: { grid: { color: "rgba(148,163,184,0.08)" }, ticks: { color: "#64748b" } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Live Training Monitor
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Real-time WebSocket monitoring of PyTorch model training across epochs
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isTraining ? (
            <button
              onClick={handleStopTraining}
              disabled={actionLoading}
              className="btn-danger flex items-center space-x-2 text-xs font-semibold"
            >
              <Square className="w-4 h-4" />
              <span>Stop Training</span>
            </button>
          ) : (
            <button
              onClick={handleStartTraining}
              disabled={actionLoading}
              className="btn-primary flex items-center space-x-2 text-xs font-semibold"
            >
              <Play className="w-4 h-4" />
              <span>Start Training Run</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 badge-danger rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Live Run Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="enterprise-card p-5">
          <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Status</span>
          <div className="mt-2 flex items-center space-x-2">
            <span className={isTraining ? "badge-info" : "badge-success"}>
              {isTraining ? "TRAINING IN PROGRESS" : "IDLE"}
            </span>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            {currentRun ? `Run ID #${currentRun.id}` : "Ready to trigger"}
          </p>
        </div>

        <div className="enterprise-card p-5">
          <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Epoch Progress</span>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>
            {currentRun ? `${currentRun.completed_epochs} / ${currentRun.total_epochs}` : "0 / 0"}
          </p>
          <div className="w-full rounded-full h-1.5 mt-2 overflow-hidden" style={{ background: "var(--bg-main)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: currentRun ? `${(currentRun.completed_epochs / currentRun.total_epochs) * 100}%` : "0%",
                backgroundColor: "var(--accent-indigo)"
              }}
            ></div>
          </div>
        </div>

        <div className="enterprise-card p-5">
          <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Best Validation Loss</span>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent-indigo)" }}>
            {currentRun?.best_val_loss != null ? currentRun.best_val_loss.toFixed(4) : "—"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {currentRun?.best_epoch != null ? `Achieved at epoch ${currentRun.best_epoch}` : "No epoch logged"}
          </p>
        </div>

        <div className="enterprise-card p-5">
          <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Latest Validation MAE</span>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent-emerald)" }}>
            {epochs.length > 0 ? `${epochs[epochs.length - 1].val_mae.toFixed(2)} min` : "—"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Mean absolute error</p>
        </div>
      </div>

      {/* Live Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="enterprise-card p-6">
          <h3 className="text-sm font-bold mb-4 flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
            <TrendingDown className="w-4 h-4" style={{ color: "var(--accent-indigo)" }} />
            <span>Loss Curves (Train vs Val)</span>
          </h3>
          <div className="h-64">
            {epochs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                Start training to observe live loss curve descent...
              </div>
            ) : (
              <Line data={lossChartData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="enterprise-card p-6">
          <h3 className="text-sm font-bold mb-4 flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
            <Zap className="w-4 h-4" style={{ color: "var(--accent-emerald)" }} />
            <span>ETA Error Curves (MAE in minutes)</span>
          </h3>
          <div className="h-64">
            {epochs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                Start training to observe live ETA error progression...
              </div>
            ) : (
              <Line data={maeChartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Epochs Detail Log Table */}
      {epochs.length > 0 && (
        <div className="enterprise-card overflow-hidden">
          <div className="p-4" style={{ borderBottom: "1px solid var(--border-main)" }}>
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Epoch Progress Log</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr>
                  <th className="px-4 py-3">Epoch</th>
                  <th className="px-4 py-3">Train Loss</th>
                  <th className="px-4 py-3">Val Loss</th>
                  <th className="px-4 py-3">Train MAE</th>
                  <th className="px-4 py-3">Val MAE</th>
                  <th className="px-4 py-3">Train F1</th>
                  <th className="px-4 py-3">Val F!</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-main)" }}>
                {epochs.map((ep) => (
                  <tr key={ep.epoch}>
                    <td className="px-4 py-2.5 font-bold" style={{ color: "var(--text-primary)" }}>Epoch {ep.epoch}</td>
                    <td className="px-4 py-2.5">{ep.train_loss?.toFixed(4)}</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: "var(--accent-indigo)" }}>{ep.val_loss?.toFixed(4)}</td>
                    <td className="px-4 py-2.5">{ep.train_mae?.toFixed(2)} min</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: "var(--accent-emerald)" }}>{ep.val_mae?.toFixed(2)} min</td>
                    <td className="px-4 py-2.5">{(ep.train_f1 * 100)?.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: "var(--accent-blue)" }}>{(ep.val_f1 * 100)?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
