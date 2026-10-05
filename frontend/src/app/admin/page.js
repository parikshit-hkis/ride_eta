"use client";

import { useState, useEffect } from "react";
import {
  getPipelineStatus,
  getConfig,
  updateConfig,
  uploadCsv,
  runFeatureEngineering,
  runPrediction,
} from "@/lib/api";
import {
  UploadCloud,
  Cpu,
  PlayCircle,
  Save,
  Database,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function AdminPage() {
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [config, setConfigData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // File Upload states
  const [rawFile, setRawFile] = useState(null);
  const [testFile, setTestFile] = useState(null);
  const [uploadingRaw, setUploadingRaw] = useState(false);
  const [runningFE, setRunningFE] = useState(false);
  const [runningPred, setRunningPred] = useState(false);

  // Editable hyperparams
  const [delayThreshold, setDelayThreshold] = useState(0.3);
  const [learningRate, setLearningRate] = useState(0.001);
  const [epochs, setEpochs] = useState(100);
  const [batchSize, setBatchSize] = useState(256);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [statusData, configData] = await Promise.all([
        getPipelineStatus(),
        getConfig(),
      ]);
      setPipelineStatus(statusData);
      setConfigData(configData);
      if (configData) {
        setDelayThreshold(configData.delay_threshold);
        setLearningRate(configData.learning_rate);
        setEpochs(configData.epochs);
        setBatchSize(configData.batch_size);
      }
    } catch (err) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  const handleUploadRawCsv = async () => {
    if (!rawFile) return;
    setUploadingRaw(true);
    setMessage(null);
    setError(null);
    try {
      const res = await uploadCsv(rawFile);
      setMessage(`✅ ${res.message} (${res.rows_inserted} rows added)`);
      setRawFile(null);
      loadAdminData();
    } catch (err) {
      setError(err.message || "CSV upload failed");
    } finally {
      setUploadingRaw(false);
    }
  };

  const handleRunFeatureEngineering = async () => {
    setRunningFE(true);
    setMessage(null);
    setError(null);
    try {
      const res = await runFeatureEngineering();
      setMessage(`✅ ${res.message} (${res.rows_processed} orders engineered)`);
      loadAdminData();
    } catch (err) {
      setError(err.message || "Feature engineering failed");
    } finally {
      setRunningFE(false);
    }
  };

  const handleRunPrediction = async () => {
    if (!testFile) return;
    setRunningPred(true);
    setMessage(null);
    setError(null);
    try {
      const res = await runPrediction(testFile);
      setMessage(`✅ ${res.message}`);
      setTestFile(null);
      loadAdminData();
    } catch (err) {
      setError(err.message || "Prediction execution failed");
    } finally {
      setRunningPred(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setMessage(null);
    setError(null);
    try {
      await updateConfig({
        delay_threshold: Number(delayThreshold),
        learning_rate: Number(learningRate),
        epochs: Number(epochs),
        batch_size: Number(batchSize),
      });
      setMessage("✅ Configuration updated successfully");
      loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to update configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 rounded w-64" style={{ background: "var(--bg-card)" }}></div>
        <div className="h-48 rounded-xl" style={{ background: "var(--bg-card)" }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Admin &amp; Data Pipeline Control
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Upload raw data, trigger feature engineering, run test predictions, and tune model hyperparameters
        </p>
      </div>

      {message && (
        <div className="p-4 badge-success rounded-xl text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 badge-danger rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Pipeline Status Cards */}
      {pipelineStatus && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="enterprise-card p-4">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Raw Orders</span>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{pipelineStatus.total_raw_orders.toLocaleString()}</p>
          </div>
          <div className="enterprise-card p-4">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Engineered</span>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--accent-indigo)" }}>{pipelineStatus.engineered_orders.toLocaleString()}</p>
          </div>
          <div className="enterprise-card p-4">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Unprocessed</span>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--accent-amber)" }}>{pipelineStatus.unprocessed_orders.toLocaleString()}</p>
          </div>
          <div className="enterprise-card p-4">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Predictions</span>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--accent-blue)" }}>{pipelineStatus.total_predictions.toLocaleString()}</p>
          </div>
          <div className="enterprise-card p-4">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Training Runs</span>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--accent-emerald)" }}>{pipelineStatus.total_training_runs}</p>
          </div>
          <div className="enterprise-card p-4">
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Drivers</span>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{pipelineStatus.total_drivers.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Pipeline Control Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Upload Raw CSV */}
        <div className="enterprise-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3" style={{ color: "var(--accent-indigo)" }}>
              <UploadCloud className="w-5 h-5" />
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>1. Upload Raw Ride Orders</h3>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Upload production CSV file. Rows are saved into `raw_ride_orders` in PostgreSQL.
            </p>

            <div
              className="border-2 border-dashed rounded-xl p-4 text-center transition-colors hover:border-[var(--accent-indigo)]"
              style={{ borderColor: "var(--border-main)", background: "var(--bg-main)" }}
            >
              <input
                type="file"
                accept=".csv"
                id="raw-csv"
                onChange={(e) => setRawFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="raw-csv" className="cursor-pointer block">
                <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-semibold block" style={{ color: "var(--text-primary)" }}>
                  {rawFile ? rawFile.name : "Choose CSV file"}
                </span>
                <span className="text-[11px] block mt-1" style={{ color: "var(--text-muted)" }}>Click to browse</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleUploadRawCsv}
            disabled={!rawFile || uploadingRaw}
            className="mt-4 w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
          >
            {uploadingRaw ? "Uploading..." : "Upload to Database"}
          </button>
        </div>

        {/* Step 2: Feature Engineering */}
        <div className="enterprise-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3" style={{ color: "var(--accent-blue)" }}>
              <Cpu className="w-5 h-5" />
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>2. Run Feature Engineering</h3>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Processes unprocessed orders in `raw_ride_orders` using `feature_engineering.py` and stores in `engineered_ride_orders`.
            </p>

            <div className="p-4 rounded-xl text-xs space-y-2" style={{ background: "var(--bg-main)", border: "1px solid var(--border-main)", color: "var(--text-secondary)" }}>
              <div className="flex justify-between">
                <span>Unprocessed Queue:</span>
                <span className="font-bold" style={{ color: "var(--accent-amber)" }}>{pipelineStatus?.unprocessed_orders || 0} orders</span>
              </div>
              <div className="flex justify-between">
                <span>Engineered Total:</span>
                <span className="font-bold" style={{ color: "var(--accent-indigo)" }}>{pipelineStatus?.engineered_orders || 0} orders</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunFeatureEngineering}
            disabled={runningFE || pipelineStatus?.unprocessed_orders === 0}
            className="mt-4 w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
          >
            {runningFE ? "Engineering Features..." : "Run Feature Engineering"}
          </button>
        </div>

        {/* Step 3: Run Predictions on Test CSV */}
        <div className="enterprise-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3" style={{ color: "var(--accent-emerald)" }}>
              <PlayCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>3. Run Predictions on Test CSV</h3>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Upload a test CSV. Runs PyTorch predictor and saves predicted ETA + delay probability into `predictions`.
            </p>

            <div
              className="border-2 border-dashed rounded-xl p-4 text-center transition-colors hover:border-[var(--accent-emerald)]"
              style={{ borderColor: "var(--border-main)", background: "var(--bg-main)" }}
            >
              <input
                type="file"
                accept=".csv"
                id="test-csv"
                onChange={(e) => setTestFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="test-csv" className="cursor-pointer block">
                <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-semibold block" style={{ color: "var(--text-primary)" }}>
                  {testFile ? testFile.name : "Choose Test CSV file"}
                </span>
                <span className="text-[11px] block mt-1" style={{ color: "var(--text-muted)" }}>Option B: Upload test dataset</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleRunPrediction}
            disabled={!testFile || runningPred}
            className="mt-4 w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
          >
            {runningPred ? "Running Predictor..." : "Execute Model Prediction"}
          </button>
        </div>
      </div>

      {/* Hyperparameter Config Editor */}
      <div className="enterprise-card p-6">
        <div className="flex items-center space-x-2 mb-4" style={{ color: "var(--accent-indigo)" }}>
          <Sliders className="w-5 h-5" />
          <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Model Hyperparameter Configuration</h3>
        </div>

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Delay Threshold (0.0 - 1.0)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="0.9"
              value={delayThreshold}
              onChange={(e) => setDelayThreshold(e.target.value)}
              className="w-full px-3 py-2 text-sm"
            />
            <span className="text-[11px] mt-1 block" style={{ color: "var(--text-muted)" }}>Decision boundary for delay flag</span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Learning Rate
            </label>
            <input
              type="number"
              step="0.0001"
              value={learningRate}
              onChange={(e) => setLearningRate(e.target.value)}
              className="w-full px-3 py-2 text-sm"
            />
            <span className="text-[11px] mt-1 block" style={{ color: "var(--text-muted)" }}>Optimizer learning rate (Adam)</span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Epochs
            </label>
            <input
              type="number"
              value={epochs}
              onChange={(e) => setEpochs(e.target.value)}
              className="w-full px-3 py-2 text-sm"
            />
            <span className="text-[11px] mt-1 block" style={{ color: "var(--text-muted)" }}>Maximum training epochs</span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Batch Size
            </label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value)}
              className="w-full px-3 py-2 text-sm"
            />
            <span className="text-[11px] mt-1 block" style={{ color: "var(--text-muted)" }}>DataLoader batch size</span>
          </div>

          <div className="lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className="btn-primary disabled:opacity-40 text-xs font-bold flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? "Saving..." : "Save Configuration"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
