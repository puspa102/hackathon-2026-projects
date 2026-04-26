import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BillUploader from '../components/BillUploader'
import InsuranceSelector from '../components/InsuranceSelector'
import { analyzeBill, getInsuranceProviders } from '../api/client'

export default function Home() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [provider, setProvider] = useState('BlueCross')
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getInsuranceProviders()
      .then(setProviders)
      .catch(() => setProviders([]))
  }, [])

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeBill(file, provider)
      navigate('/results', { state: { result, provider } })
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Analysis failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[900px] mx-auto py-20 pb-[60px] px-10">
      {/* Hero */}
      <div className="text-center mb-16 fade-up">
        <div className="inline-flex items-center gap-[7px] bg-teal-bg border border-teal/20 text-teal text-xs font-semibold uppercase tracking-[0.08em] px-3 py-[5px] rounded-[20px] mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-dot" />
          Medical Bill Intelligence
        </div>
        <h1 className="font-serif text-[clamp(36px,5vw,58px)] font-bold leading-[1.18] text-navy mb-5 tracking-tight">
          Know exactly what<br />
          <em className="text-teal not-italic">you're paying for</em>
        </h1>
        <p className="text-[17px] text-slate max-w-[560px] mx-auto mb-14 font-normal leading-relaxed">
          Upload your medical bill and get a plain-English breakdown. Every overcharge flagged. Every vague item explained. Full FHIR output for interoperability.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-line border border-line rounded-xl overflow-hidden mb-12">
          <div className="bg-white py-6 px-5 text-center">
            <div className="font-serif text-[30px] font-bold text-navy leading-none mb-1.5">1 in 5</div>
            <div className="text-[13px] text-slate-light font-medium">Bills contain errors</div>
          </div>
          <div className="bg-white py-6 px-5 text-center">
            <div className="font-serif text-[30px] font-bold text-navy leading-none mb-1.5">$210B+</div>
            <div className="text-[13px] text-slate-light font-medium">Annual billing waste</div>
          </div>
          <div className="bg-white py-6 px-5 text-center">
            <div className="font-serif text-[30px] font-bold text-navy leading-none mb-1.5">&lt;30s</div>
            <div className="text-[13px] text-slate-light font-medium">Analysis time</div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-[#0f172a] border border-white/[0.08] rounded-2xl p-8 mb-6 fade-up shadow-xl" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.05] flex items-center justify-center text-teal-light text-sm font-bold">1</span>
          Upload Your Medical Bill
        </h2>
        <BillUploader file={file} onFileSelect={setFile} />
      </div>

      {/* Insurance */}
      <div className="glass-card p-8 mb-8 fade-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center text-sm font-bold">2</span>
          Select Insurance Provider
        </h2>
        <InsuranceSelector
          providers={providers}
          selected={provider}
          onSelect={setProvider}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-bg border border-red/20 text-red text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Analyze Button */}
      <div className="text-center fade-up" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="btn-primary w-full md:w-auto text-lg px-10 py-4 inline-flex items-center justify-center gap-3 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: 'white', border: 'none' }}
          id="analyze-btn"
        >
          {loading ? (
            <>
              <div className="spinner !w-5 !h-5 !border-2" />
              Analyzing Bill...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Analyze Bill
            </>
          )}
        </button>
        {!file && (
          <p className="text-slate-light text-sm mt-3">Upload a PDF to get started</p>
        )}
      </div>

      {/* Pipeline */}
      <div className="mt-16 glass-card p-8 fade-up shadow-sm border border-line" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-xs font-bold text-slate uppercase tracking-[0.12em] mb-8 text-center">How It Works</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          <div className="absolute top-7 left-[12.5%] right-[12.5%] h-[1.5px] bg-line hidden md:block"></div>
          {[
            { icon: '📄', title: 'Extract', desc: 'PyMuPDF + OCR' },
            { icon: '🔬', title: 'Identify', desc: 'Medical NER' },
            { icon: '🏛️', title: 'Validate', desc: 'RxNorm + FDA' },
            { icon: '📊', title: 'Analyze', desc: 'CMS Benchmark' },
          ].map((step, i) => (
            <div key={i} className="text-center p-4 relative z-10 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-line flex items-center justify-center text-xl shadow-sm relative">
                {step.icon}
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">{i + 1}</div>
              </div>
              <div>
                <div className="font-bold text-navy text-sm">{step.title}</div>
                <div className="text-xs text-slate-light mt-1 font-mono">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
