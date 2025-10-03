import { POST } from '@/app/api/contact/route'
import { NextRequest } from 'next/server'

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log
beforeAll(() => {
  console.log = jest.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
})

describe('/api/contact', () => {
  it('should accept valid contact form data', async () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello, I would like to discuss a project.'
    }

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(validData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ ok: true })
  })

  it('should reject missing required fields', async () => {
    const invalidData = {
      name: 'John Doe',
      // missing email and message
    }

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('should reject invalid email format', async () => {
    const invalidData = {
      name: 'John Doe',
      email: 'invalid-email',
      message: 'Hello, I would like to discuss a project.'
    }

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email format')
  })

  it('should handle malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
