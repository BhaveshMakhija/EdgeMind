# EdgeMind: Professional Offline LLM Hub (Performance Optimized)

**EdgeMind** is a production-level, full-stack application for localized LLM evaluation. It is specifically engineered to run complex neural weights on **8GB RAM, CPU-only laptops** without system degradation.

---

## 🏛️Refined Architecture

This introduces a high-fidelity monitoring subsystem that tracks hardware overhead alongside neural metrics.

- **Neural Stability Layer**: Prevents memory exhaustion by restricting **Mistral 7B** to offline-only benchmarking while allowing **Phi-2** and **TinyLlama** for live playground interaction.
- **Hardware Telemetry**: Real-time polling of CPU utilization (%) and Memory Payload (MB) via the `psutil` integration in Python.
- **Benchmark Dashboard**: Standardized 3-prompt evaluation cycle that generates interactive comparison charts for throughput (Tokens/Sec).

---

## 🚀 Key Subsystems

### 1. Intelligence Spec Panel
Fetches model-specific metadata from the specialized `/models/details` endpoint. Displays:
- **Weight Class**: Size category (Tiny/Medium/Large).
- **Quantization**: Weights precision (e.g., Q4_K_M).
- **RAM Estimate**: Accurate memory footprint based on local testing.
- **Recommended Usage**: Status (Live/Offline) for stability.

### 2. System Performance Monitor
A high-frequency telemetry panel showing:
- **CPU Load**: Real-time core utilization percentage.
- **Memory Consumption**: Tracked in **Megabytes (MB)** to monitor paging/swapping thresholds.
- **Core Count**: Awareness of parallel execution capacity.

### 3. Analytics & Benchmarking (Interactive)
Standardized tests comparing **TinyLlama**, **Phi-2**, and **Mistral 7B**.
- **Charts**: Interactive CSS-based bars showing throughput.
- **Analysis**: Highlights the **Fastest Model** and the **Best Efficiency** leader.
- **Explanations**: Clear text mapping for Tokens/Sec and Latency metrics.

---

## 🛠️ Launch Protocol

### 1. Initialization
Ensure [Ollama](https://ollama.com/) is running and run the automated setup:
```bash
./setup.bat
```

### 2. Demo Execution

**Backend Engine (FastAPI):**
```bash
python -m backend.main
```

**Frontend Interface (React/Vite):**
```bash
cd frontend && npm start
```

---
