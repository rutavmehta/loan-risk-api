// src/components/nextStep.ts

export interface PredictionInput {
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

export interface PredictionRecord {
  id: string
  date: string
  riskScore: number
  status: 'Approved' | 'Risky' | 'Review'
  input?: PredictionInput // optional because existing history doesn’t store it yet
  approval_probability?: number
}

export interface NextStep {
  title: string
  message: string
  buttonLabel: string
  suggestedChanges: Partial<PredictionInput>
}

/**
 * Builds a simple Next Step suggestion.
 * If we don't have full input info, falls back to a generic suggestion.
 */
export function getNextStepFromPrediction(
  lastPrediction: PredictionRecord | null
): NextStep | null {
  if (!lastPrediction) return null

  const steps: NextStep[] = []

  // If we have detailed input, use smarter rules
  const input = lastPrediction.input
  const approvalProb = lastPrediction.approval_probability

  if (input) {
    // CIBIL rule
    if (input.cibil_score < 700) {
      steps.push({
        title: 'Improve your CIBIL score',
        message:
          `Your last prediction was high risk mainly due to a low CIBIL score (${input.cibil_score}). ` +
          'Aim to push it above 700 by paying EMIs on time and reducing credit card utilization, then try again.',
        buttonLabel: 'Re-run with higher CIBIL',
        suggestedChanges: {
          cibil_score: 700,
        },
      })
    }

    // Loan-to-income rule
    if (input.income_annum > 0 && input.loan_amount > 0) {
      const loanToIncome = input.loan_amount / input.income_annum
      if (loanToIncome > 4) {
        const newLoanAmount = Math.round(input.income_annum * 4)
        steps.push({
          title: 'Reduce your loan amount',
          message:
            `Your loan-to-income ratio is high (${loanToIncome.toFixed(
              1
            )}×). ` +
            'Try lowering the loan amount closer to 3–4× your annual income to reduce risk.',
          buttonLabel: 'Re-run with lower amount',
          suggestedChanges: {
            loan_amount: newLoanAmount,
          },
        })
      }
    }

    // Tenure rule
    if (input.loan_term > 0 && input.loan_term < 60) {
      steps.push({
        title: 'Increase your loan tenure',
        message:
          'A short tenure makes EMIs heavier and riskier. Increasing the tenure can make EMIs more affordable and improve approval chances.',
        buttonLabel: 'Re-run with higher tenure',
        suggestedChanges: {
          loan_term: input.loan_term + 12,
        },
      })
    }
  }

  // Fallback generic suggestions if no specific rule fired
  if (steps.length === 0) {
    if (approvalProb !== undefined) {
      if (approvalProb < 0.4) {
        steps.push({
          title: 'Profile is currently high risk',
          message:
            'Your last prediction shows high risk. Try reducing the loan amount, improving CIBIL, or increasing tenure, then run a new prediction.',
          buttonLabel: 'Adjust inputs & re-run',
          suggestedChanges: {},
        })
      } else if (approvalProb < 0.7) {
        steps.push({
          title: 'Borderline profile',
          message:
            'You are close to approval. Small improvements in CIBIL or a slightly lower loan amount could push you into a safer zone.',
          buttonLabel: 'Fine tune & re-run',
          suggestedChanges: {},
        })
      } else {
        steps.push({
          title: 'Strong profile',
          message:
            'Your profile looks strong. You can still explore slightly higher amount or shorter tenure, but ensure EMIs remain affordable.',
          buttonLabel: 'Experiment with scenarios',
          suggestedChanges: {},
        })
      }
    } else {
      steps.push({
        title: 'Try improving key factors',
        message:
          'To reduce risk, focus on a higher CIBIL score, lower loan-to-income ratio, and a slightly longer tenure. Then re-run a prediction.',
        buttonLabel: 'Go to prediction',
        suggestedChanges: {},
      })
    }
  }

  return steps[0]
}
