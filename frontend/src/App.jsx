import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Cpu, Zap, Play, BarChart2, Info, Activity, Database, AlertTriangle, Clock, Hash, RefreshCw, Layers, Shield, ArrowRight, Settings, MousePointer2, Move, HelpCircle, Search, Gauge, Globe, FastForward, Sliders, Server, Target, HardDrive, Bookmark, TrendingUp, Trophy, Compass
} from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:8000';

const App = () => {
  // Application State
  const [liveModels, setLiveModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelSpecs, setModelSpecs] = useState(null);
  const [systemStats, setSystemStats] = useState({ cpu_usage: 0, ram_usage_mb: 0, cores: 0 });
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [benchmarks, setBenchmarks] = useState(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [health, setHealth] = useState('Checking...');

  // Hyper-Parameters
  const [hyperParams, setHyperParams] = useState({
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    initApp();
    const statInterval = setInterval(fetchStats, 2000);
    return () => clearInterval(statInterval);
  }, []);

  useEffect(() => {
    if (selectedModel) fetchSpecs(selectedModel);
  }, [selectedModel]);

  const initApp = async () => {
    try {
      const hRes = await axios.get(`${API_BASE}/health`);
      setHealth(hRes.data.ollama_ready);
      const mRes = await axios.get(`${API_BASE}/models`);
      setLiveModels(mRes.data.models);
      if (mRes.data.models.length > 0) setSelectedModel(mRes.data.models[0].name);
    } catch { setHealth('Offline'); }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`);
      setSystemStats(res.data);
    } catch { /* Silent fail */ }
  };

  const fetchSpecs = async (name) => {
    try {
      const res = await axios.get(`${API_BASE}/models/details/${encodeURIComponent(name)}`);
      setModelSpecs(res.data);
    } catch { setModelSpecs(null); }
  };

  const runInference = async () => {
    if (!prompt.trim() || !selectedModel) return;
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await axios.post(`${API_BASE}/generate`, {
        prompt,
        model: selectedModel,
        ...hyperParams
      });
      setResponse(res.data);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) {
      setResponse({ error: e.response?.data?.detail || "Inference failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const syncMetrics = async () => {
    setIsBenchmarking(true);
    setBenchmarks(null);
    try {
      const res = await axios.post(`${API_BASE}/benchmark`);
      setBenchmarks(res.data);
    } catch (e) {
      alert("Metrics sync failed. Verify local engine weights.");
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <div className="edgemind-app">
      <nav className="app-nav">
        <div className="app-brand">
          <span>EdgeMind <span style={{ opacity: 0.3, fontWeight: 300 }}></span></span>
        </div>
        <div className="badge-rack" style={{ display: 'flex', gap: '1rem' }}>
          <div className={`status-pill ${health === 'Online' ? 'active' : ''}`} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={12} color={health === 'Online' ? 'var(--success)' : 'var(--danger)'} /> <span>Local Node:</span> <strong>{health}</strong>
          </div>
          <div className="status-pill active" style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={12} color="var(--primary)" /> <span>Cluster:</span> <strong>CPU-Accelerated</strong>
          </div>
        </div>
      </nav>

      <div className="app-hub">
        {/* Left Column: Diagnostics & Neural Architecture */}
        <aside className="pillar">
          <section className="saas-card">
            <h3 className="card-title"><Activity size={14} color="var(--primary)" /> Diagnostic Telemetry</h3>
            <div className="telemetry-node">
              <div className="node-header"><span>CPU Pressure</span><span>{systemStats.cpu_usage.toFixed(1)}%</span></div>
              <div className="node-progress-bg"><div className="node-progress-fill fill-blue" style={{ width: `${systemStats.cpu_usage}%` }}></div></div>
            </div>
            <div className="telemetry-node">
              <div className="node-header"><span>Memory Cache</span><span>{systemStats.ram_usage_mb.toFixed(0)} MB</span></div>
              <div className="node-progress-bg"><div className="node-progress-fill fill-purple" style={{ width: `${Math.min((systemStats.ram_usage_mb / 8192) * 100, 100)}%` }}></div></div>
            </div>
          </section>

          <section className="saas-card" style={{ flex: 1, overflowY: 'auto' }}>
            <h3 className="card-title"><Settings size={14} color="var(--accent-orange)" /> Neural Capability</h3>
            {modelSpecs ? (
              <div className="intelligence-matrix" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="matrix-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}><Server size={10} /> ARCHITECTURE</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{modelSpecs.architecture || '...'}</div>
                </div>
                <div className="matrix-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}><Target size={10} /> DENSITY / QUANT</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{modelSpecs.parameter_count || '...'} <span style={{ opacity: 0.4 }}>| {modelSpecs.quantization || '...'}</span></div>
                </div>
                <div className="matrix-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}><Shield size={10} /> STABILITY RATING</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: (modelSpecs.inference_stability || '').includes('High') ? 'var(--success)' : 'var(--warning)' }}>{modelSpecs.inference_stability || '...'}</div>
                </div>
                <div className="matrix-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}><Bookmark size={10} /> OPTIMAL USE CASE</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--primary)', opacity: 0.9 }}>{modelSpecs.recommended_use || '...'}</div>
                </div>
              </div>
            ) : <div className="loader-placeholder" style={{ textAlign: 'center', padding: '2rem', opacity: 0.3 }}>Initializing Neural Matrix...</div>}
          </section>
        </aside>

        {/* Center Column: Prompting Space */}
        <main className="pillar playground-space">
          <section className="saas-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-title"><Zap size={14} color="var(--primary)" /> Neural Workbench</h3>

            <div className="well-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <select className="model-orbit" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                {liveModels.map(m => <option key={m.name} value={m.name}>{m.name.toUpperCase()}</option>)}
                <option value="mistral">MISTRAL (STABILITY WARNING)</option>
              </select>

              {selectedModel === 'mistral' && (
                <div style={{ fontSize: '0.75rem', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.05)', padding: '1rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <AlertTriangle size={12} style={{ marginRight: '0.5rem' }} />
                  Mistral 7B exceeds 8GB hardware threshold. Restricted to offline benchmarking cluster.
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
                <div className="slider-control" style={{ flex: 1 }}>
                  <div className="slider-info"><span>Temperature</span><span>{hyperParams.temperature}</span></div>
                  <input type="range" className="slider-input" min="0" max="1.5" step="0.1" value={hyperParams.temperature} onChange={e => setHyperParams({ ...hyperParams, temperature: parseFloat(e.target.value) })} />
                </div>
                <div className="slider-control" style={{ flex: 1 }}>
                  <div className="slider-info"><span>Logic Window (Top-P)</span><span>{hyperParams.top_p}</span></div>
                  <input type="range" className="slider-input" min="0" max="1" step="0.05" value={hyperParams.top_p} onChange={e => setHyperParams({ ...hyperParams, top_p: parseFloat(e.target.value) })} />
                </div>
              </div>

              <textarea
                className="prompt-chamber"
                placeholder="Enter neural prompt sequence for native validation..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                disabled={isLoading}
              />

              <button className="launch-btn" onClick={runInference} disabled={isLoading || !prompt.trim()}>
                {isLoading ? <RefreshCw className="spin-anim" size={20} /> : <Play size={18} fill="currentColor" />}
                <span>{isLoading ? 'Processing Neural Pipeline...' : 'Launch Local Inference'}</span>
              </button>

              <div className="result-hologram" ref={scrollRef}>
                {response ? (
                  response.error ? <div className="metric-pill" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>{response.error}</div> : (
                    <div className="response-payload">
                      <div className="metric-pill-box">
                        <div className="metric-pill"><Clock size={12} /> <span>LATENCY:</span> <span>{response.latency.toFixed(2)}s</span></div>
                        <div className="metric-pill"><FastForward size={12} /> <span>THROUGHPUT:</span> <span>{response.tokens_per_second.toFixed(1)} t/s</span></div>
                        <div className="metric-pill"><Hash size={12} /> <span>POOL:</span> <span>{response.eval_count} tokens</span></div>
                      </div>
                      <div style={{ lineHeight: 1.8, color: '#e2e8f0', fontSize: '1.05rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        {response.response}
                      </div>

                      <div className="metrics-detail-grid" style={{ marginTop: '1.5rem' }}>
                        <div className="metric-box"><span className="m-label">Disk to RAM (I/O)</span><span className="m-value">{response.load_duration.toFixed(3)}s</span></div>
                        <div className="metric-box"><span className="m-label">Inference Logic</span><span className="m-value">{response.eval_duration.toFixed(3)}s</span></div>
                      </div>
                    </div>
                  )
                ) : (
                  <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.1 }}>
                    <Compass size={50} style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '0.9rem' }}>Awaiting prompt injection sequence.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* Right Column: Analytics Hub */}
        <aside className="pillar analytics-pillar">
          <section className="saas-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}><BarChart2 size={14} color="var(--success)" /> Analytics Hub</h3>
              <button className="launch-btn" style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.7rem', borderRadius: '10px' }} onClick={syncMetrics} disabled={isBenchmarking}>
                {isBenchmarking ? <RefreshCw className="spin-anim" size={12} /> : 'SYNC METRICS'}
              </button>
            </div>

            <div className="analytics-stream">
              {benchmarks ? (
                <>
                  {Object.keys(benchmarks.results).map(m => {
                    const results = benchmarks.results[m];
                    const avgTps = results.reduce((a, b) => a + b.tokens_per_second, 0) / (results.length || 1);
                    const width = Math.min((avgTps / 25) * 100, 100);
                    return (
                      <div className="interactive-bar-row" key={m}>
                        <div className="bar-meta">
                          <span>{m.toUpperCase()} NODE</span>
                          <span style={{ color: m.includes('mistral') ? '#fb7185' : m.includes('phi') ? '#60a5fa' : '#34d399' }}>{avgTps.toFixed(1)} t/s</span>
                        </div>
                        <div className="bar-strip-bg">
                          <div className={`bar-strip-fill ${m.includes('mistral') ? 'fill-mistral' : m.includes('phi') ? 'fill-phi' : 'fill-tiny'}`} style={{ width: `${width}%` }}></div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="analytics-insights">
                    <div className="insight-card">
                      <span className="insight-label">Throughput Champion</span>
                      <div className="insight-value"><Trophy size={14} color="gold" /> {benchmarks.analysis.fastest_model.toUpperCase()} Cluster</div>
                    </div>
                    <div className="insight-card">
                      <span className="insight-label">Logic-to-Resource Leader</span>
                      <div className="insight-value"><TrendingUp size={14} color="var(--primary)" /> {benchmarks.analysis.best_balance_model.toUpperCase()} Architecture</div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '10rem', opacity: 0.15 }}>
                  <Gauge size={50} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '0.8rem' }}>Execute SYNC for dynamic performance deltas across the local cluster.</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.65rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={12} /> <span>Verified native execution context.</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default App;
