import React, { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { Zap, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface LoanApplication {
  no_of_dependents: number
  education: string
  self_employed: string
  income_annum: number
  loan_amount: number
  loan_term: number
  cibil_score: number
  residential_assets_value: number
  commercial_assets_value: number
  luxury_assets_value: number
  bank_asset_value: number
}

interface PredictionResult {
  risk_score: number
  status: 'Approved' | 'Risky' | 'Review'
  recommendation: string
}

export const PredictionPage: React.FC = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState<LoanApplication>({
    no_of_dependents: 0,
    education: 'Graduate',
    self_employed: 'No',
    income_annum: 0,
    loan_amount: 0,
    loan_term: 0,
    cibil_score: 750,
    residential_assets_value: 0,
    commercial_assets_value: 0,
    luxury_assets_value: 0,
    bank_asset_value: 0,
  })

  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Prefill from NextStep recommendation if available
  useEffect(() => {
    const stored = localStorage.getItem('prefillPredictionInput')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setFormData(prev => ({
          ...prev,
          ...parsed,
        }))
      } catch {
        // ignore parse errors
      }
      localStorage.removeItem('prefillPredictionInput')
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call the actual backend API with API key
      const response = await fetch('/.netlify/functions/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([formData]), // Backend expects array of applications
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Prediction failed')
      }

      const predictions = await response.json()
      const backendResult = predictions[0] // Get first result

      // Convert backend response to frontend format
      const approvalProb = backendResult.approval_probability || 0
      const riskScore = Math.round((1 - approvalProb) * 100) // Convert to risk percentage

      let status: 'Approved' | 'Risky' | 'Review'
      let recommendation: string

      if (riskScore < 30) {
        status = 'Approved'
        recommendation =
          'This application is suitable for loan approval. Customer has strong financial profile.'
      } else if (riskScore > 70) {
        status = 'Risky'
        recommendation =
          'This application shows high risk. Recommend rejecting or requesting additional documentation.'
      } else {
        status = 'Review'
        recommendation =
          'This application requires manual review. Consider asking for additional information.'
      }

      const prediction: PredictionResult = {
        risk_score: riskScore,
        status,
        recommendation,
      }

      setResult(prediction)

      // Save to user-specific history (now with input as well)
      const userPredictionsKey = `predictions_${user?.id}`
      const existing = JSON.parse(localStorage.getItem(userPredictionsKey) || '[]')

      const newEntry = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString(),
        riskScore: prediction.risk_score,
        status: prediction.status,
        input: formData,
        // you can also store a mock approval_probability if you want later
      }

      existing.push(newEntry)
      localStorage.setItem(userPredictionsKey, JSON.stringify(existing))

      toast.success('Prediction completed successfully!')
    } catch (error) {
      toast.error('Failed to make prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Loan Risk Prediction</h1>
          <p className="text-gray-400">
            Enter loan application details to get an instant risk assessment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-bold text-white mb-6">Applicant Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Dependents
                    </label>
                    <input
                      type="number"
                      name="no_of_dependents"
                      value={formData.no_of_dependents}
                      onChange={handleChange}
                      className="input"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Education Level
                    </label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="input"
                      disabled={loading}
                    >
                      <option>Graduate</option>
                      <option>Not Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Self Employed
                    </label>
                    <select
                      name="self_employed"
                      value={formData.self_employed}
                      onChange={handleChange}
                      className="input"
                      disabled={loading}
                    >
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Annual Income ($)
                    </label>
                    <input
                      type="number"
                      name="income_annum"
                      value={formData.income_annum}
                      onChange={handleChange}
                      className="input"
                      min="0"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-bold text-white mb-6">Loan Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Loan Amount ($)
                    </label>
                    <input
                      type="number"
                      name="loan_amount"
                      value={formData.loan_amount}
                      onChange={handleChange}
                      className="input"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Loan Term (months)
                    </label>
                    <input
                      type="number"
                      name="loan_term"
                      value={formData.loan_term}
                      onChange={handleChange}
                      className="input"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CIBIL Score (300-900)
                    </label>
                    <input
                      type="number"
                      name="cibil_score"
                      value={formData.cibil_score}
                      onChange={handleChange}
                      className="input"
                      min="300"
                      max="900"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-bold text-white mb-6">Asset Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Residential Assets ($)
                    </label>
                    <input
                      type="number"
                      name="residential_assets_value"
                      value={formData.residential_assets_value}
                      onChange={handleChange}
                      className="input"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Commercial Assets ($)
                    </label>
                    <input
                      type="number"
                      name="commercial_assets_value"
                      value={formData.commercial_assets_value}
                      onChange={handleChange}
                      className="input"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Luxury Assets ($)
                    </label>
                    <input
                      type="number"
                      name="luxury_assets_value"
                      value={formData.luxury_assets_value}
                      onChange={handleChange}
                      className="input"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bank Assets ($)
                    </label>
                    <input
                      type="number"
                      name="bank_asset_value"
                      value={formData.bank_asset_value}
                      onChange={handleChange}
                      className="input"
                      min="0"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full group disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Get Prediction
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div>
            {result && (
              <div className="card bg-gradient-to-br from-dark-800 to-dark-700 border border-primary-500/30 animate-slide-up">
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                      result.status === 'Approved'
                        ? 'bg-success-500/20'
                        : result.status === 'Risky'
                        ? 'bg-danger-500/20'
                        : 'bg-warning-500/20'
                    }`}
                  >
                    {result.status === 'Approved' ? (
                      <Check className="text-success-500" size={40} />
                    ) : (
                      <AlertCircle
                        className={
                          result.status === 'Risky'
                            ? 'text-danger-500'
                            : 'text-warning-500'
                        }
                        size={40}
                      />
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{result.status}</h3>
                  <p className="text-gray-400">Loan Application Status</p>
                </div>

                <div className="bg-dark-800/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Risk Score</span>
                    <span className="text-3xl font-bold text-white">
                      {result.risk_score}%
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.risk_score < 30
                          ? 'bg-success-500'
                          : result.risk_score > 70
                          ? 'bg-danger-500'
                          : 'bg-warning-500'
                      }`}
                      style={{ width: `${result.risk_score}%` }}
                    />
                  </div>
                </div>

                <div className="bg-dark-800/30 border border-dark-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Recommendation</p>
                  <p className="text-gray-200">{result.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
