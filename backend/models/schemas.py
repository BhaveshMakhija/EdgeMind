from pydantic import BaseModel
from typing import List, Optional, Dict

class GenerateRequest(BaseModel):
    prompt: str
    model: str
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    top_k: Optional[int] = 40
    repeat_penalty: Optional[float] = 1.1

class GenerateResponse(BaseModel):
    response: str
    latency: float
    total_duration: float
    load_duration: float
    prompt_eval_count: int
    prompt_eval_duration: float
    eval_count: int
    eval_duration: float
    tokens_per_second: float
    model: str

class BenchmarkResult(BaseModel):
    prompt_type: str
    latency: float
    response_length: int
    token_count: int
    tokens_per_second: float

class BenchmarkAnalysis(BaseModel):
    fastest_model: str
    longest_response_model: str
    best_balance_model: str

class BenchmarkResponse(BaseModel):
    results: Dict[str, List[BenchmarkResult]]
    analysis: BenchmarkAnalysis

class ModelDetails(BaseModel):
    name: str
    size_category: str
    parameter_count: str
    quantization: str
    context_window: str
    architecture: str
    recommended_use: str
    inference_stability: str # High / Medium / Low
    ram_estimate: str
    status: str # Live / Offline

class ModelInfo(BaseModel):
    name: str

class ModelsResponse(BaseModel):
    models: List[ModelInfo]

class SystemStats(BaseModel):
    cpu_usage: float
    ram_usage_mb: float
    cores: int
