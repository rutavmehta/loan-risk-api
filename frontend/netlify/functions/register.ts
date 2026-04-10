import type { Handler } from '@netlify/functions'

const API_BASE_URL = 'http://34.234.23.223:8000'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.body ?? '',
    })

    const bodyText = await res.text()

    return {
      statusCode: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/json',
      },
      body: bodyText,
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ detail: 'Register proxy failed' }),
    }
  }
}
    