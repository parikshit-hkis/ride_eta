"use client";

import { useState, useEffect } from "react";
import { getLatestMetrics, getTrainingHistory } from "@/lib/api";
import {
  BarChart3,
  Award,
  Target,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
} from "lucide-react";

export default function DashboardPage() {
  const [latestRun, setLatestRun] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [latest, hist] = await Promise.all([
          getLatestMetrics(),
          getTrainingHistory(),
        ]);
        setLatestRun(latest);
        setHistory(hist || []);
      } catch (err) {
        setError(err.message || "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 rounded w-64" style={{ background: "var(--bg-card)" }}></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-28 rounded-xl" style={{ background: "var(--bg-card)" }}></div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback default metrics if no run completed yet
  const cm = latestRun?.confusion_matrix || [[0, 0], [0, 0]];
  const tn = cm[0]?.[0] || 0;
  const fp = cm[0]?.[1] || 0;
  const fn = cm[1]?.[0] || 0;
  const tp = cm[1]?.[1] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Model Performance Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Evaluation metrics computed on separate test dataset (`ride_orders_test_v24.csv`)
          </p>
        </div>
        {latestRun && (
          <div className="badge-info">
            Active Run #{latestRun.id} | Threshold: {latestRun.threshold ?? 0.3}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 badge-danger rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Regression Metrics (ETA Prediction) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center space-x-2" style={{ color: "var(--accent-indigo)" }}>
          <Zap className="w-4 h-4" />
          <span>ETA Prediction Metrics (Regression)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="enterprise-card p-6 border-t-2" style={{ borderTopColor: "var(--accent-indigo)" }}>
            <div className="flex items-center justify-between" style={{ color: "var(--text-secondary)" }}>
              <span className="text-xs font-semibold uppercase tracking-wider">MAE (Mean Absolute Error)</span>
              <Target className="w-4 h-4" style={{ color: "var(--accent-indigo)" }} />
            </div>
            <p className="text-3xl font-extrabold mt-2" style={{ color: "var(--text-primary)" }}>
              {latestRun?.test_mae != null ? `${latestRun.test_mae.toFixed(2)} min` : "—"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Average ETA difference per ride</p>
          </div>

          <div className="enterprise-card p-6 border-t-2" style={{ borderTopColor: "var(--accent-blue)" }}>
            <div className="flex items-center justify-between" style={{ color: "var(--text-secondary)" }}>
              <span className="text-xs font-semibold uppercase tracking-wider">RMSE (Root Mean Square)</span>
              <BarChart3 className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
            </div>
            <p className="text-3xl font-extrabold mt-2" style={{ color: "var(--text-primary)" }}>
              {latestRun?.test_rmse != null ? `${latestRun.test_rmse.toFixed(2)} min` : "—"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Penalizes large prediction outliers</p>
          </div>

          <div className="enterprise-card p-6 border-t-2" style={{ borderTopColor: "var(--accent-emerald)" }}>
            <div className="flex items-center justify-between" style={{ color: "var(--text-secondary)" }}>
              <span className="text-xs font-semibold uppercase tracking-wider">R² Score (Variance Explained)</span>
              <Award className="w-4 h-4" style={{ color: "var(--accent-emerald)" }} />
            </div>
            <p className="text-3xl font-extrabold mt-2" style={{ color: "var(--accent-emerald)" }}>
              {latestRun?.test_r2 != null ? `${(latestRun.test_r2 * 100).toFixed(1)}%` : "—"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>100% represents a perfect fit</p>
          </div>
        </div>
      </div>

      {/* Classification Metrics (Delay Prediction) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center space-x-2" style={{ color: "var(--text-secondary)" }}>
          <Activity className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
          <span>Delay Classification Metrics (Binary Classification)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="enterprise-card p-5">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Accuracy</span>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>
              {latestRun?.test_accuracy != null ? `${(latestRun.test_accuracy * 100).toFixed(1)}%` : "—"}
            </p>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Correct classifications</span>
          </div>

          <div className="enterprise-card p-5">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Precision</span>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent-indigo)" }}>
              {latestRun?.test_precision != null ? `${(latestRun.test_precision * 100).toFixed(1)}%` : "—"}
            </p>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>True delayed / predicted delayed</span>
          </div>

          <div className="enterprise-card p-5">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Recall</span>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent-amber)" }}>
              {latestRun?.test_recall != null ? `${(latestRun.test_recall * 100).toFixed(1)}%` : "—"}
            </p>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Caught delays / actual delays</span>
          </div>

          <div className="enterprise-card p-5">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>F1 Score</span>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent-blue)" }}>
              {latestRun?.test_f1 != null ? `${(latestRun.test_f1 * 100).toFixed(1)}%` : "—"}
            </p>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Harmonic mean precision &amp; recall</span>
          </div>

          <div className="enterprise-card p-5">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>ROC-AUC</span>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent-emerald)" }}>
              {latestRun?.test_roc_auc != null ? latestRun.test_roc_auc.toFixed(3) : "—"}
            </p>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Probability ranking power</span>
          </div>
        </div>
      </div>

      {/* Confusion Matrix Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="enterprise-card p-6">
          <h3 className="text-sm font-bold mb-4 flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
            <BarChart3 className="w-4 h-4" style={{ color: "var(--accent-indigo)" }} />
            <span>Confusion Matrix (Threshold = {latestRun?.threshold ?? 0.3})</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* True Negative */}
            <div className="p-4 rounded-xl text-center" style={{ background: "var(--bg-success-muted)", border: "1px solid var(--border-success)" }}>
              <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-success)" }}>True Negative (TN)</span>
              <p className="text-2xl font-extrabold mt-1" style={{ color: "var(--text-primary)" }}>{tn.toLocaleString()}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>Correctly predicted On-Time</p>
            </div>

            {/* False Positive */}
            <div className="p-4 rounded-xl text-center" style={{ background: "var(--bg-danger-muted)", border: "1px solid var(--border-danger)" }}>
              <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-danger)" }}>False Positive (FP)</span>
              <p className="text-2xl font-extrabold mt-1" style={{ color: "var(--text-primary)" }}>{fp.toLocaleString()}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>False Alarms (Predicted Delay)</p>
            </div>

            {/* False Negative */}
            <div className="p-4 rounded-xl text-center" style={{ background: "var(--bg-warning-muted)", border: "1px solid var(--border-warning)" }}>
              <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-warning)" }}>False Negative (FN)</span>
              <p className="text-2xl font-extrabold mt-1" style={{ color: "var(--text-primary)" }}>{fn.toLocaleString()}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>Missed Delays (Predicted On-Time)</p>
            </div>

            {/* True Positive */}
            <div className="p-4 rounded-xl text-center" style={{ background: "var(--bg-info-muted)", border: "1px solid var(--border-info)" }}>
              <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-info)" }}>True Positive (TP)</span>
              <p className="text-2xl font-extrabold mt-1" style={{ color: "var(--text-primary)" }}>{tp.toLocaleString()}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>Correctly caught Delays</p>
            </div>
          </div>
        </div>

        {/* Training Run Insights */}
        <div className="enterprise-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: "var(--accent-emerald)" }} />
              <span>Model Performance Insights</span>
            </h3>
            <ul className="space-y-3 text-xs" style={{ color: "var(--text-secondary)" }}>
              <li className="flex items-start space-x-2">
                <span className="font-bold" style={{ color: "var(--accent-emerald)" }}>•</span>
                <span>
                  <strong style={{ color: "var(--text-primary)" }}>ETA Accuracy:</strong>{" "}
                  {latestRun?.test_r2 != null
                    ? `R² of ${(latestRun.test_r2 * 100).toFixed(1)}% indicates the multi-task backbone predicts ride duration with high accuracy (MAE ~${latestRun.test_mae?.toFixed(1)} min).`
                    : "Run training to see ETA prediction accuracy."}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold" style={{ color: "var(--accent-amber)" }}>•</span>
                <span>
                  <strong style={{ color: "var(--text-primary)" }}>Class Imbalance:</strong> Adjusting `DELAY_THRESHOLD` in Admin Panel tunes precision vs recall tradeoff.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold" style={{ color: "var(--accent-indigo)" }}>•</span>
                <span>
                  <strong style={{ color: "var(--text-primary)" }}>Softplus Output:</strong> The model includes Softplus activation on the ETA head ensuring predictions are always positive.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-4 p-3 rounded-xl text-[11px]" style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)", color: "var(--text-secondary)" }}>
            {latestRun ? `Evaluated on ${latestRun.val_samples?.toLocaleString() ?? "—"} validation samples • Run #${latestRun.id}` : "No completed training run yet"}
          </div>
        </div>
      </div>

      {/* Historical Runs Table */}
      <div className="enterprise-card overflow-hidden">
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-main)" }}>
          <h3 className="text-sm font-bold flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
            <History className="w-4 h-4" style={{ color: "var(--accent-indigo)" }} />
            <span>Training Run History</span>
          </h3>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{history.length} runs recorded</span>
        </div>

        <div className="max-h-80 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="px-4 py-3">Run ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Epochs</th>
                <th className="px-4 py-3">Best Val Loss</th>
                <th className="px-4 py-3">Test MAE</th>
                <th className="px-4 py-3">Test F1</th>
                <th className="px-4 py-3">Threshold</th>
                <th className="px-4 py-3">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono" style={{ borderColor: "var(--border-main)" }}>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 font-sans" style={{ color: "var(--text-muted)" }}>
                    No historical runs found. Trigger training from Training Monitor or Admin Panel.
                  </td>
                </tr>
              ) : (
                history.map((run) => (
                  <tr key={run.id}>
                    <td className="px-4 py-3 font-bold" style={{ color: "var(--text-primary)" }}>#{run.id}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className={
                        run.status === "completed"
                          ? "badge-success"
                          : run.status === "running"
                          ? "badge-info"
                          : "badge-danger"
                      }>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{run.completed_epochs} / {run.total_epochs}</td>
                    <td className="px-4 py-3">{run.best_val_loss?.toFixed(4) || "-"}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: "var(--text-primary)" }}>{run.test_mae != null ? `${run.test_mae.toFixed(2)} min` : "—"}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: "var(--text-primary)" }}>
                      {run.test_f1 != null ? `${(run.test_f1 * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-3">{run.threshold ?? 0.3}</td>
                    <td className="px-4 py-3 font-sans" style={{ color: "var(--text-secondary)" }}>
                      {run.created_at ? new Date(run.created_at).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
