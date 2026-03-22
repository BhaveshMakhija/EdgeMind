import requests
import time
import json
from typing import List, Dict, Optional, Any
from ..models.schemas import GenerateResponse, BenchmarkResult, BenchmarkAnalysis, ModelDetails
from ..utils.logger import logger

OLLAMA_BASE_URL = "http://localhost:11434"

# Optimized constraints for 8GB RAM CPU-only demo
LIVE_MODELS = ["tinyllama", "phi"]
MAX_LIVE_TOKENS = 100 

MODEL_MAPPING = {
    "tinyllama": ["tinyllama", "tinyllama:latest", "tinyllama:1.1b"],
    "phi": ["phi", "phi:latest", "phi:2.7b", "phi-2"],
    "mistral": ["mistral", "mistral:latest", "mistral:7b", "mistral:7b-instruct-v0.2-q4_K_M"]
}

# Advanced Intelligence Spec v4.0
MODEL_DETAILS_DATA = {
    "tinyllama": ModelDetails(
        name="TinyLlama 1.1B", size_category="ultra-light", parameter_count="1.1 Billion",
        quantization="Q4_K_M (4-bit)", context_window="2048 Tokens",
        architecture="Llama 2 (GQA)", recommended_use="Edge Inference / Chat",
        inference_stability="High (Verified)", ram_estimate="640 - 800 MB", status="Live"
    ),
    "phi": ModelDetails(
        name="Phi-2 2.7B", size_category="medium-light", parameter_count="2.7 Billion",
        quantization="Q4_K_M (4-bit)", context_window="2048 Tokens",
        architecture="Transformer-based (MSFT)", recommended_use="Logic / Summarization",
        inference_stability="High (CPU Optimized)", ram_estimate="1.8 - 2.2 GB", status="Live"
    ),
    "mistral": ModelDetails(
        name="Mistral 7B v0.2", size_category="full-dense", parameter_count="7.3 Billion",
        quantization="Q4_0 (4-bit)", context_window="32,768 Tokens",
        architecture="Mistral (Sliding Window)", recommended_use="Complex Reasoning / Coding",
        inference_stability="Medium (8GB Threshold)", ram_estimate="4.5 - 5.0 GB", status="Offline"
    )
}

class OllamaService:
    @staticmethod
    def _find_best_match(base_name: str, available_models: List[Dict]) -> Optional[str]:
        found_names = [m.get("name", "").lower() for m in available_models]
        candidates = MODEL_MAPPING.get(base_name, [base_name])
        for cand in candidates:
            if cand in found_names:
                return cand
        for name in found_names:
            if base_name in name:
                return name
        return None

    @staticmethod
    def check_connection():
        try:
            response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
            return response.status_code == 200
        except:
            return False

    @staticmethod
    def list_models():
        try:
            response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
            return response.json().get("models", []) if response.status_code == 200 else []
        except:
            return []

    @staticmethod
    def get_details(model_id: str) -> ModelDetails:
        # Check against base name
        base_id = model_id.lower().split(":")[0]
        for base, cands in MODEL_MAPPING.items():
            if base_id == base or any(cand in model_id.lower() for cand in cands):
                return MODEL_DETAILS_DATA[base]
        
        # Fallback for unknown
        return ModelDetails(
            name=model_id, size_category="unknown", parameter_count="unknown",
            quantization="unknown", context_window="unknown", architecture="unverified",
            recommended_use="experimental", inference_stability="untested",
            ram_estimate="variable", status="Live"
        )

    @staticmethod
    def generate(model: str, prompt: str, token_limit: int = MAX_LIVE_TOKENS, is_live: bool = True, options: Dict[str, Any] = None):
        if is_live:
            is_restricted = True
            for live_m in LIVE_MODELS:
                if live_m in model.lower():
                    is_restricted = False
                    break
            if is_restricted:
                raise Exception(f"Stability Block: '{model}' restricted to offline benchmarks (8GB limit).")

        start_time = time.time()
        
        ollama_options = {
            "num_predict": token_limit, "num_thread": 4, "temperature": 0.7,
            "top_p": 0.9, "top_k": 40, "repeat_penalty": 1.1
        }
        if options:
            ollama_options.update({k: v for k, v in options.items() if v is not None})

        try:
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False, "options": ollama_options},
                timeout=180
            )
            latency = time.time() - start_time
            if response.status_code == 200:
                res_data = response.json()
                t_count = res_data.get("eval_count", 0)
                eval_duration = res_data.get("eval_duration", 1) / 1e9
                return {
                    "response": res_data.get("response", ""),
                    "latency": latency,
                    "total_duration": res_data.get("total_duration", 0) / 1e9,
                    "load_duration": res_data.get("load_duration", 0) / 1e9,
                    "prompt_eval_count": res_data.get("prompt_eval_count", 0),
                    "prompt_eval_duration": res_data.get("prompt_eval_duration", 0) / 1e9,
                    "eval_count": t_count,
                    "eval_duration": eval_duration,
                    "tokens_per_second": t_count / eval_duration if eval_duration > 0 else 0,
                    "model": model
                }
            raise Exception(f"Ollama Error: {response.text}")
        except Exception as e:
            logger.error(f"Inference Failure: {e}")
            raise e

class BenchmarkService:
    @staticmethod
    def run_suite():
        available = OllamaService.list_models()
        targets = {
            "tinyllama": OllamaService._find_best_match("tinyllama", available),
            "phi": OllamaService._find_best_match("phi", available),
            "mistral": OllamaService._find_best_match("mistral", available)
        }
        
        all_results = {}
        prompts = [
            ("Logic", "Explain quantum computing in 10 words."),
            ("Coding", "Python function to add two numbers."),
            ("Summary", "Summarize the history of AI in 5 words.")
        ]
        
        for base_name, actual_name in targets.items():
            if not actual_name:
                continue
            res_list = []
            for p_type, p_text in prompts:
                try:
                    res = OllamaService.generate(actual_name, p_text, is_live=False)
                    res_list.append(BenchmarkResult(
                        prompt_type=p_type, latency=res["latency"],
                        response_length=len(res["response"]),
                        token_count=res["eval_count"], tokens_per_second=res["tokens_per_second"]
                    ))
                except Exception as e:
                    logger.error(f"Benchmark error for {base_name}: {e}")
                    res_list.append(BenchmarkResult(
                        prompt_type=p_type, latency=0, response_length=0, token_count=0, tokens_per_second=0
                    ))
            all_results[base_name] = res_list
        return all_results, BenchmarkService._analyze(all_results)

    @staticmethod
    def _analyze(results: Dict) -> BenchmarkAnalysis:
        models = [m for m in results.keys() if any(r.latency > 0 for r in results[m])]
        if not models:
            return BenchmarkAnalysis(fastest_model="N/A", longest_response_model="N/A", best_balance_model="N/A")
        fastest = min(models, key=lambda m: sum(r.latency for r in results[m])/len(results[m]) if any(r.latency > 0 for r in results[m]) else 999)
        return BenchmarkAnalysis(
            fastest_model=fastest or "N/A",
            longest_response_model=max(models, key=lambda m: sum(r.token_count for r in results[m])),
            best_balance_model="phi" if "phi" in models else models[0]
        )
