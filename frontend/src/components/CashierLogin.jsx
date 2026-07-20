import { useState, useEffect } from "react"
import * as api from "../api"

function CashierLogin({ onLoginSuccess }) {
  const [cashiers, setCashiers] = useState([])
  const [selected, setSelected] = useState(null)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCashiers()
      .then(setCashiers)
      .catch(() => setError("Could not load cashier list."))
      .finally(() => setLoading(false))
  }, [])

  const handleDigit = (digit) => {
    if (pin.length >= 6) return
    setPin(pin + digit)
    setError("")
  }

  const handleBackspace = () => setPin(pin.slice(0, -1))

  const handleSubmit = async () => {
    try {
      const cashier = await api.cashierLogin(selected.id, pin)
      onLoginSuccess(cashier)
    } catch (e) {
      setError(e.message)
      setPin("")
    }
  }

  if (loading) {
    return <div className="fixed inset-0 bg-white flex items-center justify-center" />
  }

  if (!selected) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6">
        <img src="./logo.png" alt="Blueswitch logo" className="h-14 w-14 object-contain mb-4" />
        <h1 className="text-lg font-semibold text-ink mb-1">Who's working?</h1>
        <p className="text-sm text-muted mb-6">Select your name to start your shift</p>
        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {cashiers.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="bg-white border border-gray-200 hover:border-primary rounded-xl py-4 text-center font-medium text-ink"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6">
      <p className="text-sm text-muted mb-1">Hi, {selected.name}</p>
      <h1 className="text-lg font-semibold text-ink mb-6">Enter your PIN</h1>

      <div className="flex gap-3 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full ${i < pin.length ? "bg-primary" : "bg-gray-200"}`}
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleDigit(String(n))}
            className="bg-gray-50 hover:bg-gray-100 rounded-xl py-4 text-lg font-medium text-ink"
          >
            {n}
          </button>
        ))}
        <button onClick={() => setSelected(null)} className="text-sm text-muted">
          Back
        </button>
        <button
          onClick={() => handleDigit("0")}
          className="bg-gray-50 hover:bg-gray-100 rounded-xl py-4 text-lg font-medium text-ink"
        >
          0
        </button>
        <button onClick={handleBackspace} className="text-sm text-muted">
          ⌫
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={pin.length < 4}
        className="w-full max-w-xs mt-6 bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg disabled:opacity-40"
      >
        Confirm
      </button>
    </div>
  )
}

export default CashierLogin
