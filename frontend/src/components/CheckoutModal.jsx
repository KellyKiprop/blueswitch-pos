import { useState, useRef, useEffect } from "react"
import * as api from "../api"

function CheckoutModal({ sale, onClose, onCashPaid, onConfirmMpesa }) {
  const [step, setStep] = useState("choose") // choose -> phone -> waiting -> done -> failed
  const [phone, setPhone] = useState("")
  const [mpesaRef, setMpesaRef] = useState("")
  const [error, setError] = useState("")
  const pollRef = useRef(null)

  const total = sale?.total_amount || 0

  useEffect(() => {
    return () => clearInterval(pollRef.current)
  }, [])

  const handleCash = async () => {
    try {
      await onCashPaid()
      setStep("done")
    } catch (e) {
      setError(e.message)
    }
  }

  const normalizePhone = (raw) => {
    let digits = raw.replace(/\D/g, "")
    if (digits.startsWith("0")) digits = "254" + digits.slice(1)
    if (digits.startsWith("7") || digits.startsWith("1")) digits = "254" + digits
    return digits
  }

  const handleSendStkPush = async (e) => {
    e.preventDefault()
    setError("")
    const formattedPhone = normalizePhone(phone)
    if (formattedPhone.length !== 12) {
      setError("Enter a valid Safaricom number, e.g. 0712345678")
      return
    }
    try {
      await api.initiateStkPush(sale.id, formattedPhone)
      setStep("waiting")
      startPolling()
    } catch (e) {
      setError(e.message)
    }
  }

  const startPolling = () => {
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts += 1
      try {
        const updated = await api.getSale(sale.id)
        if (updated.status === "completed") {
          clearInterval(pollRef.current)
          setStep("done")
        } else if (updated.status === "open" && attempts > 2) {
          // reverted from "paid" back to "open" means the payment failed/was cancelled
          clearInterval(pollRef.current)
          setStep("failed")
        }
      } catch (e) {
        // ignore transient poll errors, keep trying
      }
      if (attempts >= 20) { // ~60s at 3s intervals
        clearInterval(pollRef.current)
        setStep("timeout")
      }
    }, 3000)
  }

  const handleManualConfirm = async () => {
    try {
      await onConfirmMpesa(mpesaRef)
      setStep("done")
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        {step === "choose" && (
          <>
            <h2 className="text-lg font-semibold text-ink mb-1">Checkout</h2>
            <p className="text-2xl font-bold text-primary tabular-nums mb-6">
              KES {Number(total).toLocaleString()}
            </p>
            <div className="space-y-2">
              <button onClick={handleCash}
                className="w-full py-3 rounded-lg border border-gray-200 hover:border-primary font-medium text-ink">
                Cash
              </button>
              <button onClick={() => setStep("phone")}
                className="w-full py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark">
                M-Pesa
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
            <button onClick={onClose} className="w-full text-muted text-sm mt-4">Cancel</button>
          </>
        )}

        {step === "phone" && (
          <form onSubmit={handleSendStkPush}>
            <h2 className="text-lg font-semibold text-ink mb-1">M-Pesa payment</h2>
            <p className="text-2xl font-bold text-primary tabular-nums mb-4">
              KES {Number(total).toLocaleString()}
            </p>
            <input type="tel" placeholder="Customer's phone, e.g. 0712345678"
              value={phone} onChange={(e) => setPhone(e.target.value)} autoFocus
              className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm mb-3 focus:outline-none focus:border-primary" />
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <button type="submit"
              className="w-full py-3 rounded-lg bg-accent hover:bg-accent-dark text-white font-medium">
              Send payment prompt
            </button>
            <button type="button" onClick={() => setStep("choose")} className="w-full text-muted text-sm mt-3">
              Back
            </button>
          </form>
        )}

        {step === "waiting" && (
          <>
            <h2 className="text-lg font-semibold text-ink mb-1">Waiting for customer</h2>
            <p className="text-sm text-muted mb-4">
              A payment prompt was sent to {phone}. Ask them to enter their M-Pesa PIN.
            </p>
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <button onClick={() => setStep("manual")} className="w-full text-muted text-xs mt-4">
              Taking too long? Confirm manually
            </button>
          </>
        )}

        {step === "manual" && (
          <>
            <h2 className="text-lg font-semibold text-ink mb-1">Manual confirmation</h2>
            <p className="text-sm text-muted mb-4">
              Confirm once you see the payment SMS. Enter the M-Pesa code if visible.
            </p>
            <input type="text" placeholder="M-Pesa code (optional)"
              value={mpesaRef} onChange={(e) => setMpesaRef(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm mb-3 focus:outline-none focus:border-primary" />
            <button onClick={handleManualConfirm}
              className="w-full py-3 rounded-lg bg-success text-white font-medium">
              Mark as paid
            </button>
            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          </>
        )}

        {step === "failed" && (
          <>
            <div className="text-center py-4">
              <p className="text-red-500 text-4xl mb-2">✕</p>
              <h2 className="text-lg font-semibold text-ink">Payment not completed</h2>
              <p className="text-sm text-muted mt-1">The customer may have cancelled or entered the wrong PIN.</p>
            </div>
            <button onClick={() => setStep("phone")}
              className="w-full py-3 rounded-lg bg-accent hover:bg-accent-dark text-white font-medium mt-2">
              Try again
            </button>
            <button onClick={handleCash} className="w-full py-3 rounded-lg border border-gray-200 font-medium text-ink mt-2">
              Switch to cash
            </button>
          </>
        )}

        {step === "timeout" && (
          <>
            <h2 className="text-lg font-semibold text-ink mb-1">No response yet</h2>
            <p className="text-sm text-muted mb-4">We haven't heard back. You can keep waiting, confirm manually, or switch to cash.</p>
            <button onClick={() => { setStep("waiting"); startPolling() }}
              className="w-full py-3 rounded-lg bg-primary text-white font-medium mb-2">
              Keep waiting
            </button>
            <button onClick={() => setStep("manual")} className="w-full py-3 rounded-lg border border-gray-200 font-medium text-ink mb-2">
              Confirm manually
            </button>
            <button onClick={handleCash} className="w-full text-muted text-sm">Switch to cash</button>
          </>
        )}

        {step === "done" && (
          <>
            <div className="text-center py-4">
              <p className="text-success text-4xl mb-2">✓</p>
              <h2 className="text-lg font-semibold text-ink">Sale completed</h2>
            </div>
            <a href={sale ? "https://blueswitch-pos-api.onrender.com/sales/" + sale.id + "/receipt" : "#"}
              target="_blank" rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-lg border border-gray-200 hover:border-primary font-medium text-ink mt-2">
              Download receipt
            </a>
            <button onClick={onClose} className="w-full py-3 rounded-lg bg-primary text-white font-medium mt-2">
              New sale
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CheckoutModal
