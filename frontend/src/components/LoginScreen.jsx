import { useState } from "react"
import * as api from "../api"

function LoginScreen({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const data = await api.login(username, password)
      onLoginSuccess(data.access_token)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="Blueswitch logo" className="h-8 w-8 object-contain" />
          <h2 className="text-lg font-semibold text-ink">Admin login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-muted text-sm"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginScreen
