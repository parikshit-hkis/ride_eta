# Ride ETA Predictor - Project Structure & Directory Reference

This document provides a comprehensive overview of the **Ride ETA Predictor** codebase structure, describing the organization of modules across Machine Learning (ML), Backend (FastAPI), and Frontend (Next.js) layers.

---

## 🏗️ Architectural Overview

```
                          ┌─────────────────────────┐
                          │   Next.js 15 Frontend   │
                          │   (TailwindCSS / App)   │
                          └────────────┬────────────┘
                                       │ HTTP / WebSocket
                                       ▼
                          ┌─────────────────────────┐
                          │     FastAPI Backend     │
                          │   (REST APIs & WS Hub)  │
                          └────────────┬────────────┘
                                       │ Real-time Ingestion / Inferencing
                                       ▼
                          ┌─────────────────────────┐
                          │     PyTorch ML Engine   │
                          │  (ETA / Price / Dynamic)│
                          └─────────────────────────┘
```

---

## 📁 Directory Tree

```text
Ride_ETA/
├── backend/                             # FastAPI Backend Service
│   ├── models/                          # SQLAlchemy ORM Database Models
│   │   ├── __init__.py                  # Model exports
│   │   ├── driver.py                    # Driver profiles & operational state
│   │   ├── engineered_ride_order.py     # Processed feature-engineered ride records
│   │   ├── prediction.py                # Prediction request & response history log
│   │   ├── raw_ride_order.py            # Ingested raw ride order telemetry data
│   │   ├── training_epoch.py            # Per-epoch training metrics tracking
│   │   ├── training_run.py              # ML training job execution history
│   │   └── user.py                      # User authentication & role management
│   ├── routers/                         # FastAPI Route Controllers (API Endpoints)
│   │   ├── __init__.py
│   │   ├── admin.py                     # System stats, data generation & DB seeding endpoints
│   │   ├── auth.py                      # User registration, login & JWT authentication
│   │   ├── drivers.py                   # Live driver management & location tracking
│   │   ├── model_metrics.py             # Saved ML model metadata & evaluation metrics API
│   │   ├── predictions.py               # Real-time ETA prediction endpoints
│   │   ├── training.py                  # Background ML training trigger & status endpoints
│   │   └── websocket.py                 # Live WebSocket connection handlers & broadcast hubs
│   ├── schemas/                         # Pydantic Schemas (Request/Response Validation)
│   │   ├── __init__.py
│   │   ├── admin.py                     # Request/response validation for admin tasks
│   │   ├── auth.py                      # Login payload & token schemas
│   │   ├── driver.py                    # Driver creation/update validation
│   │   ├── prediction.py                # Prediction request & output format validation
│   │   └── training.py                  # Training trigger parameters & metrics payload
│   ├── services/                        # Business Logic & Service Layers
│   │   ├── __init__.py
│   │   ├── auth_service.py              # Password hashing, JWT generation, user verification
│   │   ├── data_service.py              # Data access layer for raw/engineered rides & drivers
│   │   ├── driver_service.py            # Driver CRUD and spatial proximity services
│   │   ├── feature_engineering_service.py # Dynamic feature calculation pipeline for raw rides
│   │   ├── prediction_service.py        # ML Model invocation wrapper for real-time inference
│   │   └── training_service.py          # Asynchronous ML model training orchestration
│   ├── config.py                        # Backend application configuration & settings
│   ├── database.py                      # SQLAlchemy Database engine setup & session maker
│   ├── main.py                          # FastAPI application entry point & CORS configuration
│   └── seed_data.py                     # Script to seed database with initial drivers/rides
│
├── frontend/                            # Next.js 15 Web Dashboard Application
│   ├── public/                          # Static assets (images, icons, favicons)
│   ├── src/                             # Application Source Code
│   │   ├── app/                         # App Router Pages & Routes
│   │   │   ├── admin/                   # Admin dashboard (data gen, DB seed, controls)
│   │   │   ├── dashboard/               # Main analytics dashboard & overview metrics
│   │   │   ├── drivers/                 # Live driver tracking & management page
│   │   │   ├── login/                   # User authentication page
│   │   │   ├── predictions/             # Interactive ride ETA calculator interface
│   │   │   ├── training/                # Training control panel & live epoch progress charts
│   │   │   ├── globals.css              # Global styles & Tailwind utilities
│   │   │   ├── layout.js                # Main application layout wrapper & providers
│   │   │   └── page.js                  # Root page redirect handler
│   │   ├── components/                  # Reusable UI Components
│   │   │   └── Sidebar.js               # Responsive navigation sidebar
│   │   ├── context/                     # React Context Providers
│   │   │   ├── AuthContext.js           # Authentication state management (JWT / User session)
│   │   │   └── ThemeContext.js          # Dark/Light UI theme state management
│   │   └── lib/                         # Utilities & API Integration
│   │       └── api.js                   # Axios HTTP client configuration & WebSocket connection
│   ├── eslint.config.mjs                # ESLint configuration
│   ├── jsconfig.json                    # Path aliases configuration (@/*)
│   ├── next.config.mjs                  # Next.js build & runtime options
│   ├── package.json                     # Frontend dependencies & scripts
│   ├── postcss.config.mjs               # PostCSS & Tailwind processing config
│   └── README.md                        # Frontend development guide
│
├── ml/                                  # PyTorch Machine Learning Pipeline
│   ├── callbacks/                       # Training Loop Callbacks
│   │   ├── checkpoint.py                # Model checkpoint saver (best epoch / final state)
│   │   └── early_stopping.py            # Early stopping based on validation loss/metrics
│   ├── configs/                         # Model & Pipeline Configuration
│   │   └── config.py                    # Hyperparameters, feature schema definitions & paths
│   ├── datasets/                        # Custom Dataset Wrappers
│   │   ├── dataloader.py                # PyTorch DataLoader creation utilities
│   │   └── ride_dataset.py              # PyTorch Dataset implementation for ride features
│   ├── losses/                          # Loss Functions
│   │   └── losses.py                    # Multi-task loss functions (Huber, MSE, MAE, CrossEntropy)
│   ├── metrics/                         # Performance Metrics Calculations
│   │   ├── classification_metrics.py    # Accuracy, Precision, Recall, F1 score metrics
│   │   └── regression_metrics.py        # MAE, RMSE, MAPE, R2 score metrics
│   ├── models/                          # Neural Network Architectures
│   │   └── ride_eta_network.py          # PyTorch Multi-Task Deep Neural Network (ETA + Fare)
│   ├── predictor/                       # Inference Engine
│   │   └── predictor.py                 # Single/Batch prediction helper loading saved checkpoints
│   ├── preprocessing/                   # Data Transformation & Preprocessing
│   │   ├── encoder.py                   # Categorical feature encoders (One-Hot, Label Encoding)
│   │   ├── pipeline.py                  # Full preprocessing pipeline composer
│   │   ├── scaler.py                    # Numerical feature scalers (StandardScaler / MinMax)
│   │   └── validator.py                 # Data integrity & anomaly detection validator
│   ├── saved_models/                    # Trained Model Checkpoints & Preprocessor Scalers
│   ├── trainer/                         # Training Loop Orchestration
│   │   └── trainer.py                   # Model trainer managing training/validation epochs
│   ├── utils/                           # Helper Utilities
│   │   └── model_metadata.py            # Model serialization & metadata tracking utilities
│   ├── evaluate.py                      # Model evaluation script against test dataset
│   ├── feature_engineering.py           # Spatial, temporal & weather feature engineering pipeline
│   ├── generate_synthetic_data_ahmedabad_v2.py # Synthetic ride data generator (Ahmedabad region)
│   ├── predict.py                       # CLI interface for running predictions
│   ├── run_pipeline.py                  # End-to-end ML pipeline orchestration script
│   └── train.py                         # ML training execution entry script
│
├── .env.example                         # Environment variable template
├── .gitignore                           # Git exclusion rules
├── PROJECT_DOCUMENTATION.md             # In-depth technical architecture documentation
├── PROJECT_GUIDE.md                     # Step-by-step developer setup & execution guide
├── PROJECT_STRUCTURE.md                 # Project structure & file index (this file)
├── generate_summary.md                  # Automatic summary generation documentation
├── project_audit_complete.md            # System audit report & verification checklist
└── requirements.txt                     # Python dependencies (Backend & ML)
```

---

## 🔍 Module Responsibilities

### 1. Machine Learning Engine (`ml/`)
- **Data Generation**: `generate_synthetic_data_ahmedabad_v2.py` generates realistic ride request & trajectory data tailored for Ahmedabad geospatial bounds.
- **Feature Engineering**: `feature_engineering.py` extracts Haversine distance, speed estimates, rush-hour indicators, weather features, and temporal cyclic features.
- **Preprocessing**: Encoders and Scalers normalize data and fit transformers, saved alongside trained models.
- **Neural Network Architecture**: `ride_eta_network.py` defines a PyTorch multi-task network predicting ETA (duration in minutes) alongside dynamic fare pricing recommendations.
- **Training & Evaluation**: Modular `trainer`, custom `callbacks` (Early Stopping, Checkpointing), and evaluation scripts ensure reliable model convergence.

### 2. Backend Service (`backend/`)
- **FastAPI Framework**: Asynchronous REST endpoints and WebSockets for real-time interaction.
- **Authentication**: JWT-based security via `auth_service.py` and `auth` router.
- **Database & Models**: SQLAlchemy ORM mapping SQLite/PostgreSQL tables for users, drivers, raw ride telemetry, engineered records, and training logs.
- **Inference & Training Services**: Bridges API requests directly with PyTorch models loaded via `ml/predictor/predictor.py` and runs background training jobs via `training_service.py`.

### 3. Dashboard Frontend (`frontend/`)
- **Next.js 15 & React**: Server-side and client-side rendering with Tailwind CSS styling.
- **Interactive Dashboards**:
  - `/predictions`: Interactive form and live map representation to request ETA & fare estimates.
  - `/training`: Live monitoring of ongoing ML training runs with real-time loss/metric updates.
  - `/drivers`: Operational driver dashboard with real-time locations and availability toggle.
  - `/admin`: Control panel for synthetic data generation and system seeding.























To transition this project from a monolithic prototype into a Microservices Architecture, we need to break the system into decoupled, single-responsibility services that communicate over network protocols (HTTP/gRPC/Redis PubSub) rather than direct Python imports (import ml).

Here is the complete design, how it works, and the step-by-step plan to restructure the project in a new folder—without relying on Docker for now.

1. High-Level Microservices Architecture
Instead of having everything in one backend Python environment, we split the platform into 4 distinct backend microservices, 1 frontend application, and 2 shared infrastructure components (Database & Event/Artifact Storage).


                               ┌────────────────────────────────┐
                               │  Next.js 15 Web Dashboard UI   │
                               └───────────────┬────────────────┘
                                               │ HTTP / WS
                                               ▼
                               ┌────────────────────────────────┐
                               │   API Gateway (Entry Point)    │
                               └───────┬───────────────┬────────┘
                                       │               │
            ┌──────────────────────────┘               └──────────────────────────┐
            │ REST / gRPC                                                         │ REST / WS
            ▼                                                                     ▼
┌──────────────────────────┐   Async Queue    ┌──────────────────────────┐   ┌──────────────────────────┐
│  ML Inference Service    │ <──────────────> │  Redis Message Broker /  │   <─│   Auth & Core Driver     │
│  (Model in RAM / <10ms)  │ (PubSub/Events)  │      Event Bus           │   │         Service          │
└───────────┬──────────────┘                  └────────────┬─────────────┘   └────────────┬─────────────┘
            │                                              │                              │
            │ Reads Artifacts                              │ Triggers                     │ Reads/Writes
            ▼                                              ▼                              ▼
┌──────────────────────────┐                  ┌──────────────────────────┐   ┌──────────────────────────┐
│  Model Registry / S3     │ <────────────────│    ML Training Worker    │   │  PostgreSQL Database     │
│  (Saved Checkpoints/PKLs)│  Saves Checkpoint│    (Async Pipelines)     │   │  (Users, Rides, Drivers) │
└──────────────────────────┘                  └──────────────────────────┘   └──────────────────────────┘
2. Breakdown of Microservices & Their Responsibilities
Service 1: api_gateway (Routing & Authentication Proxy)
Responsibility: The single entry point for client requests. Routes incoming HTTP requests to the appropriate service, validates JWT tokens, and enforces rate-limiting.
Tech Stack: FastAPI / Nginx / Traefik.
Dependencies: Light weight. Zero PyTorch or DB dependencies.
Service 2: core_service (Auth, Users & Driver Management)
Responsibility: User registration/login, driver profile management, driver location updates, ride order telemetry persistence.
Database: PostgreSQL (User, Driver, RawRideOrder tables).
Communication: Listens for REST requests; emits driver.location_updated or ride.requested events to Redis.
Service 3: ml_inference_service (Real-Time ETA & Fare Prediction)
Responsibility: High-speed ETA prediction.
Behavior: Loads .pth PyTorch model weights and .pkl encoders into memory at server startup. Exposes a POST /predict endpoint.
Performance: <10ms response time per prediction.
Dependencies: PyTorch, NumPy, Pandas, Scikit-learn. No database connection needed.
Service 4: ml_training_worker (Asynchronous Training Pipeline)
Responsibility: Data generation, feature engineering pipeline, training neural networks, computing evaluation metrics.
Behavior: Runs asynchronously when triggered by an admin request or a scheduled cron job. When training finishes, it saves artifacts to model_registry and notifies the system via Redis.
Dependencies: PyTorch, Pandas, Scikit-learn, SQLAlchemy (reads historical rides).
Service 5: realtime_service (WebSocket Broadcast Hub)
Responsibility: Manages WebSocket client connections (driver map UI, training progress bar).
Behavior: Subscribes to Redis channels (training_epoch_completed, driver_location_changed) and broadcasts updates to connected frontend clients.
3. Step-by-Step Plan to Restructure the Project
Step 1: Create a Clean New Workspace Folder
Create a new directory (e.g., Ride_ETA_Microservices) outside the current folder to keep the old monolith intact for reference.

Step 2: Define Shared Data Contracts (shared/)
Before writing code, extract shared data models so services talk using the same schemas:

Create Pydantic data schemas for Requests & Responses (PredictionRequest, DriverLocationUpdate, TrainingConfig).
Define common event message formats for Redis PubSub (EpochProgressEvent, ModelDeployedEvent).
Step 3: Decouple the ML Pipeline
Split ml/ into two distinct packages:
ml_inference/: Contains only predict.py, loaded model network definition, scalar loaders, and pipeline transformer.
ml_training/: Contains dataset generators, feature engineering pipelines, loss functions, metrics, and training loop trainer.
Remove sys.path.insert() hack.
Step 4: Extract Database Access to Core Service
Remove database queries (db.query(...)) from ML code.
ml_training_worker will fetch dataset via a REST endpoint from core_service (or a dedicated read-replica DB query), avoiding mixed ORM code.
Step 5: Implement Inter-Service Communication
Synchronous (REST/HTTP): API Gateway -> core_service or ml_inference_service.
Asynchronous (Redis PubSub / Queue):
core_service publishes ride.requested -> ml_inference_service computes prediction.
ml_training_worker publishes epoch.completed -> realtime_service streams progress over WebSocket to Next.js dashboard.
4. Proposed New Directory Structure
Here is how the new project folder will look:

text
Ride_ETA_Microservices/
│
├── shared/                               # Shared Schemas & Constants across services
│   ├── __init__.py
│   ├── schemas/                          # Shared Pydantic DTOs
│   │   ├── prediction_dto.py             # Prediction input/output contracts
│   │   ├── driver_dto.py                 # Driver telemetry contracts
│   │   └── training_dto.py               # Training configuration schemas
│   └── events/                           # Event Message Definitions
│       └── redis_events.py               # PubSub payload structures
│
├── services/
│   ├── api_gateway/                      # 🚪 Entry Gateway
│   │   ├── main.py                       # Gateway routes & JWT validation middleware
│   │   ├── router.py                     # Reverse proxy routing logic
│   │   └── requirements.txt              # FastAPI, httpx, PyJWT
│   │
│   ├── core_service/                     # 👤 User, Driver & Telemetry Service
│   │   ├── db/                           # Database connection & migrations
│   │   ├── models/                       # SQLAlchemy ORM (User, Driver, Ride)
│   │   ├── routers/                      # /auth, /drivers, /rides API endpoints
│   │   ├── services/                     # Business logic (driver distance, auth logic)
│   │   ├── main.py                       # Core service startup
│   │   └── requirements.txt              # FastAPI, SQLAlchemy, psycopg2
│   │
│   ├── ml_inference_service/             # ⚡ Real-Time ETA Prediction Engine
│   │   ├── engine/
│   │   │   ├── model.py                  # PyTorch RideETANetwork architecture
│   │   │   ├── preprocessor.py           # Feature transformer & scalar applier
│   │   │   └── loader.py                 # Preloads model weights from registry at startup
│   │   ├── routers/                      # /predict endpoint
│   │   ├── main.py                       # Service startup & RAM preloading hook
│   │   └── requirements.txt              # FastAPI, PyTorch, numpy, pandas, scikit-learn
│   │
│   ├── ml_training_service/              # 🏋️ Background Training & Pipeline Worker
│   │   ├── pipeline/
│   │   │   ├── feature_engineering.py    # Spatial/temporal transformation
│   │   │   ├── data_generator.py         # Synthetic data generation
│   │   │   └── dataset.py                # PyTorch Dataset & DataLoader handlers
│   │   ├── trainer/
│   │   │   ├── trainer.py                # Epoch training loop
│   │   │   └── evaluator.py              # Regression & classification metric scoring
│   │   ├── worker.py                     # Background worker entry script listening for train triggers
│   │   └── requirements.txt              # PyTorch, pandas, scikit-learn, redis
│   │
│   └── realtime_service/                 # 📡 WebSocket Broadcast Hub
│       ├── websocket_manager.py          # Active WebSocket connections registry
│       ├── redis_listener.py             # Listens to Redis channels and broadcasts to WS
│       ├── main.py                       # WebSocket application startup
│       └── requirements.txt              # FastAPI, websockets, redis
│
├── model_registry/                       # 📦 Centralized Artifact Repository
│   ├── checkpoints/                      # Current active .pth checkpoints
│   ├── scalers/                          # Numerical scaler .pkl files
│   └── metadata/                         # Model metadata JSON files
│
├── frontend/                             # 🖥️ Next.js 15 Web Application
│   ├── src/                              # Dashboard UI pages and components
│   └── package.json
│
└── README.md                             # Microservices architecture setup guide
5. How End-to-End Workflows Function in this Design
Scenario A: A User Requests a Ride ETA Prediction
Client (Next.js) sends POST /api/v1/predict to api_gateway.
API Gateway verifies the user's JWT token and proxies the payload directly to ml_inference_service.
ml_inference_service passes inputs through its preloaded memory model (no disk loading, no DB calls).
Results (predicted_eta: 14.2 min) return to api_gateway -> Next.js UI in <10ms.
Scenario B: An Admin Triggers ML Model Retraining
Admin clicks "Start Retraining" on Next.js UI -> api_gateway -> ml_training_service.
ml_training_service spawns an isolated training job process.
As each epoch finishes, ml_training_service emits a message to Redis:
CHANNEL: training_events -> { "epoch": 5, "loss": 0.124 }.
realtime_service picks up the Redis message and streams it to the admin's open WebSocket connection on Next.js.
Upon completion, ml_training_service writes the new .pth file to model_registry/ and publishes a model.updated event.
ml_inference_service receives model.updated and hot-reloads the new weights into RAM without dropping incoming traffic.
💡 Summary Comparison
Metric	Monolith (Old)	Microservices Design (New)
Code Isolation	Tightly coupled imports (sys.path.insert)	Independent folders, HTTP/Event contracts
Model Preloading	Re-loaded on every HTTP hit	Loaded into memory ONCE at service start
Training Execution	Runs inside web server process	Runs in isolated background worker
Dependencies	1 bloated environment for everything	Small, isolated requirements.txt per service