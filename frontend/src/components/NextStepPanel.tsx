// src/components/NextStepPanel.tsx

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getNextStepFromPrediction, PredictionRecord } from './nextStep'

interface Props {
  lastPrediction: PredictionRecord | null
}

export const NextStepPanel: React.FC<Props> = ({ lastPrediction }) => {
  const navigate = useNavigate()
  const nextStep = getNextStepFromPrediction(lastPrediction)

  if (!nextStep) return null

  const handleReRun = () => {
    if (lastPrediction && lastPrediction.input) {
      const baseInput = lastPrediction.input
      const updatedInput = { ...baseInput, ...nextStep.suggestedChanges }
      localStorage.setItem('prefillPredictionInput', JSON.stringify(updatedInput))
    }
    navigate('/predict')
  }

  return (
    <div className="card bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20">
      <h3 className="text-lg font-bold text-white mb-2">Next Step Recommendation</h3>
      <p className="text-gray-300 text-sm mb-4">
        {nextStep.message}
      </p>
      <button
        onClick={handleReRun}
        className="btn btn-primary inline-flex items-center gap-2"
      >
        <span>{nextStep.buttonLabel}</span>
        <ArrowRight size={16} />
      </button>
    </div>
  )
}
