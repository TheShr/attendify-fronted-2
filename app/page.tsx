'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { apiJson } from '@/lib/api'

function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const justRegistered = search?.get('registered') === '1'

  const [role, setRole] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!role || !username || !password) {
      setError('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const res = await apiJson<{ role: string; user_id: number }>(
        '/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role }),
          credentials: 'include',
        }
      )

      // Save user in localStorage for later use
      localStorage.setItem('user', JSON.stringify(res))

      // Navigate based on backend role
      const userRole = res.role?.toUpperCase()
      if (userRole === 'STUDENT') router.push('/student')
      else if (userRole === 'TEACHER') router.push('/teacher')
      else if (userRole === 'ADMIN') router.push('/admin')
      else if (userRole === 'MGMT') router.push('/mgmt')
      else if (userRole === 'DEPT') router.push('/dept')
      else if (userRole === 'POLICYMAKER') router.push('/policymaker')
      else router.push('/')
    } catch (err: any) {
      console.error(err)
      setError(err?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4 space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-4xl font-bold">Attendify</h1>
        <p className="text-sm text-muted-foreground">
          AI-powered attendance management system
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md p-6">
        <form onSubmit={handleLogin} className="space-y-6">
          {justRegistered && (
            <div className="rounded-md bg-green-50 text-green-700 text-sm px-3 py-2 text-center">
              Admin registered successfully. Please log in.
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">User Type</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option value="">Select your role</option>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
              <option value="MGMT">Management</option>
              <option value="DEPT">Education Dept</option>
              <option value="POLICYMAKER">Policymaker</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-md py-2"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-xs text-center text-gray-500">
            Need public insights?{' '}
            <a href="/dept" className="underline">Education Dept</a> &middot;{' '}
            <a href="/policymaker" className="underline">Policymaker</a>
          </p>

          <p className="text-xs text-center text-gray-500">
            Need an account?{' '}
            <a href="/admin/register" className="underline text-blue-600">
              Register as Admin
            </a>
          </p>
        </form>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
