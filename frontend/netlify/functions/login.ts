import type { Handler } from '@netlify/functions'

const API_BASE_URL = 'http://54.173.200.169:8000'

export const handler: Handler = async (event) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.body,
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
    console.error('ERROR:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Backend not reachable' }),
    }
  }
}