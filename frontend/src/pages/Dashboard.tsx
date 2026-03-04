import React, { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, Activity, Clock, Target } from 'lucide-react'
import { NextStepPanel } from '../components/NextStepPanel'
import type { PredictionRecord } from '../components/nextStep'

interface StatCard {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

interface PredictionHistory {
  id: string
  date: string
  riskScore: number
  status: 'Approved' | 'Risky' | 'Review'
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState<PredictionHistory[]>([])
  const [stats, setStats] = useState({
    totalPredictions: 0,
    averageRisk: 0,
    approvalsToday: 0,
    riskFlags: 0,
  })

  useEffect(() => {
    const userPredictionsKey = `predictions_${user?.id}`
    const storedPredictions = localStorage.getItem(userPredictionsKey)
    if (storedPredictions) {
      const predictions: PredictionHistory[] = JSON.parse(storedPredictions)
      const sliced = predictions.slice(-5).reverse() // latest first
      setPredictions(sliced)

      const avgRisk =
        predictions.length > 0
          ? Math.round(
              predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.length
            )
          : 0

      setStats({
        totalPredictions: predictions.length,
        averageRisk: avgRisk,
        approvalsToday: predictions.filter(p => p.status === 'Approved').length,
        riskFlags: predictions.filter(p => p.status === 'Risky').length,
      })
    } else {
      setPredictions([])
      setStats({
        totalPredictions: 0,
        averageRisk: 0,
        approvalsToday: 0,
        riskFlags: 0,
      })
    }
  }, [user?.id])

  const statCards: StatCard[] = [
    {
      label: 'Total Predictions',
      value: stats.totalPredictions,
      icon: <Activity className="text-primary-500" size={24} />,
      color: 'from-primary-500/20 to-primary-600/20',
    },
    {
      label: 'Average Risk Score',
      value: `${stats.averageRisk}%`,
      icon: <TrendingUp className="text-warning-500" size={24} />,
      color: 'from-warning-500/20 to-warning-600/20',
    },
    {
      label: 'Approved Today',
      value: stats.approvalsToday,
      icon: <Target className="text-success-500" size={24} />,
      color: 'from-success-500/20 to-success-600/20',
    },
    {
      label: 'Risk Flags',
      value: stats.riskFlags,
      icon: <Clock className="text-danger-500" size={24} />,
      color: 'from-danger-500/20 to-danger-600/20',
    },
  ]

  // Build a lastPrediction object compatible with PredictionRecord type
  const lastPrediction: PredictionRecord | null =
    predictions.length > 0
      ? {
          ...predictions[0],
          // we don’t yet store input / approval_probability in history,
          // so these remain undefined for now (generic suggestion).
          input: undefined,
          approval_probability: undefined,
        }
      : null

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your loan prediction overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`card bg-gradient-to-br ${stat.color} border border-dark-700 hover:border-primary-500/30 transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-dark-700/50 rounded-lg">
                  {stat.icon}
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Predictions + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Predictions</h2>
                <a href="/history" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                  View All →
                </a>
              </div>

              {predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.id}
                      className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-white">{prediction.date}</p>
                        <p className="text-sm text-gray-400">Prediction ID: {prediction.id}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-white">{prediction.riskScore}%</p>
                          <p className="text-sm text-gray-400">Risk Score</p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            prediction.status === 'Approved'
                              ? 'badge-success'
                              : prediction.status === 'Risky'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {prediction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No predictions yet. Start by making your first prediction!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/predict"
                  className="block w-full p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-center transition-colors"
                >
                  New Prediction
                </a>
                <a
                  href="/history"
                  className="block w-full p-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium text-center transition-colors border border-dark-600"
                >
                  View History
                </a>
              </div>
            </div>

            {/* Next Step Recommendation */}
            <NextStepPanel lastPrediction={lastPrediction} />

            {/* Info Card */}
            <div className="card bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20">
              <h3 className="text-lg font-bold text-white mb-3">💡 Pro Tip</h3>
              <p className="text-gray-400 text-sm">
                Accurate predictions depend on complete and accurate loan application data. Always double-check your inputs before submitting.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
