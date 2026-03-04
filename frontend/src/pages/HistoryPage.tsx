import React, { useState, useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { Search, Download, Filter, Trash2 } from 'lucide-react'

interface PredictionHistory {
  id: string
  date: string
  riskScore: number
  status: 'Approved' | 'Risky' | 'Review'
}

export const HistoryPage: React.FC = () => {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState<PredictionHistory[]>([])
  const [filteredPredictions, setFilteredPredictions] = useState<PredictionHistory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Approved' | 'Risky' | 'Review'>('All')

  useEffect(() => {
    const userPredictionsKey = `predictions_${user?.id}`
    const storedPredictions = localStorage.getItem(userPredictionsKey)
    if (storedPredictions) {
      const data = JSON.parse(storedPredictions)
      setPredictions(data)
      setFilteredPredictions(data)
    }
  }, [user?.id])

  useEffect(() => {
    let filtered = predictions

    if (filterStatus !== 'All') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        p =>
          p.id.includes(searchTerm) ||
          p.date.includes(searchTerm) ||
          p.riskScore.toString().includes(searchTerm)
      )
    }

    setFilteredPredictions(filtered)
  }, [searchTerm, filterStatus, predictions])

  const handleDelete = (id: string) => {
    const updated = predictions.filter(p => p.id !== id)
    setPredictions(updated)
    const userPredictionsKey = `predictions_${user?.id}`
    localStorage.setItem(userPredictionsKey, JSON.stringify(updated))
  }

  const handleDownload = () => {
    const csv = [
      ['ID', 'Date', 'Risk Score', 'Status'],
      ...filteredPredictions.map(p => [p.id, p.date, p.riskScore, p.status]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `predictions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Prediction History</h1>
          <p className="text-gray-400">View and manage all your past predictions</p>
        </div>

        {/* Controls */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search by ID or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="input flex-1"
              >
                <option>All</option>
                <option>Approved</option>
                <option>Risky</option>
                <option>Review</option>
              </select>
            </div>

            {/* Export */}
            <button
              onClick={handleDownload}
              disabled={filteredPredictions.length === 0}
              className="btn btn-secondary w-full justify-center disabled:opacity-50"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-dark-700/50 rounded-lg">
              <p className="text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{predictions.length}</p>
            </div>
            <div className="p-3 bg-success-500/10 rounded-lg border border-success-500/20">
              <p className="text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-success-500">
                {predictions.filter(p => p.status === 'Approved').length}
              </p>
            </div>
            <div className="p-3 bg-warning-500/10 rounded-lg border border-warning-500/20">
              <p className="text-gray-400">Review</p>
              <p className="text-2xl font-bold text-warning-500">
                {predictions.filter(p => p.status === 'Review').length}
              </p>
            </div>
            <div className="p-3 bg-danger-500/10 rounded-lg border border-danger-500/20">
              <p className="text-gray-400">Risky</p>
              <p className="text-2xl font-bold text-danger-500">
                {predictions.filter(p => p.status === 'Risky').length}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {filteredPredictions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Risk Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPredictions.map((prediction, idx) => (
                    <tr
                      key={prediction.id}
                      className={`border-b border-dark-700 hover:bg-dark-700/30 transition-colors ${
                        idx % 2 === 0 ? 'bg-dark-800/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-300 font-mono">{prediction.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{prediction.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-dark-700 rounded-full h-2">
                            <div
                              className={`h-full rounded-full ${
                                prediction.riskScore < 30
                                  ? 'bg-success-500'
                                  : prediction.riskScore > 70
                                  ? 'bg-danger-500'
                                  : 'bg-warning-500'
                              }`}
                              style={{ width: `${prediction.riskScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-white w-10 text-right">
                            {prediction.riskScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            prediction.status === 'Approved'
                              ? 'badge-success'
                              : prediction.status === 'Risky'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {prediction.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(prediction.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-danger-500 hover:bg-danger-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No predictions found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
