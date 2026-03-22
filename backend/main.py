from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import psutil
import os
from .models.schemas import (
    GenerateRequest, GenerateResponse, ModelsResponse, ModelInfo, 
    BenchmarkResponse, SystemStats, ModelDetails
)
from .services.ollama import OllamaService, BenchmarkService, LIVE_MODELS
from .utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup check
    logger.info("Initializing EdgeMind Deep Analytics Hub v3.3...")
    if not OllamaService.check_connection():
        logger.error("Ollama Engine NOT detected. Real-time demos restricted.")
    yield
    logger.info("Closing Demo Environment...")

app = FastAPI(
    title="EdgeMind v3.3: Deep Analytics Hub",
    description="Engineered for detailed hardware and neural telemetry on 8GB laptops.",
    version="3.3.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    ollama_status = "Online" if OllamaService.check_connection() else "Offline"
    return {"status": "ok", "ollama_ready": ollama_status, "mode": "CPU-Optimized (8GB RAM)"}

@app.get("/stats", response_model=SystemStats)
async def get_system_stats():
    """Real-time hardware monitoring (CPU, RAM MB, Cores)."""
    mem = psutil.virtual_memory()
    return SystemStats(
        cpu_usage=psutil.cpu_percent(interval=None), 
        ram_usage_mb=mem.used / (1024**2), # Memory in MB
        cores=os.cpu_count() or 4
    )

@app.get("/models", response_model=ModelsResponse)
async def get_models():
    """Returns availability-vetted models for live/offline mapping."""
    models_raw = OllamaService.list_models()
    found_names = [m.get("name", "").lower() for m in models_raw]
    
    live_only = []
    # If a model exists in Ollama AND it's in our LIVE_MODELS list
    for live_m in LIVE_MODELS:
        # Check if any model in Ollama contains the live name
        if any(live_m in name for name in found_names):
            live_only.append(ModelInfo(name=live_m))
    
    if not live_only:
        live_only = [ModelInfo(name=m) for m in LIVE_MODELS]
        
    return ModelsResponse(models=live_only)

@app.get("/models/details/{model_name}", response_model=ModelDetails)
async def get_model_details(model_name: str):
    """Detailed metadata for UI model info cards."""
    details = OllamaService.get_details(model_name)
    if not details:
        raise HTTPException(status_code=404, detail="Model metadata not found.")
    return details

@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    """Deep analytics generation with neural hyper-parameters."""
    try:
        # Pass user hyperparameters to Ollama
        options = {
            "temperature": req.temperature,
            "top_p": req.top_p,
            "top_k": req.top_k,
            "repeat_penalty": req.repeat_penalty
        }
        result = OllamaService.generate(req.model, req.prompt, is_live=True, options=options)
        return GenerateResponse(**result)
    except Exception as e:
        logger.error(f"Inference Blocked: {str(e)}")
        raise HTTPException(status_code=403 if "Stability Block" in str(e) else 500, detail=str(e))

@app.post("/benchmark", response_model=BenchmarkResponse)
async def benchmark():
    """Full comparative stress test across target weights."""
    try:
        results, analysis = BenchmarkService.run_suite()
        return BenchmarkResponse(results=results, analysis=analysis)
    except Exception as e:
        logger.error(f"Benchmark Fail: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
