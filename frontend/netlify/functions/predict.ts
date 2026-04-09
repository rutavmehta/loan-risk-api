import type { Handler } from '@netlify/functions'

const API_BASE_URL = 'http://54.173.200.169:8000'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'mysecretapikey123', // SAME as backend
      },
      body: event.body ?? '',
    })

    const data = await res.text()

    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    }
  } catch (error) {
    console.error('PREDICT ERROR:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Prediction failed' }),
    }
  }
}