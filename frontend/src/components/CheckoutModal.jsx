import { useState } from "react"

function CheckoutModal({ sale, onClose, onCashPaid, onMpesaCheckout, onConfirmMpesa }) {
  const [method, setMethod] = useState(null)
  const [mpesaRef, setMpesaRef] = useState("")
  const [step, setStep] = useState("choose") // choose -> mpesa-pending -> done
  const [error, setError] = useState("")

  const total = sale?.total_amount || 0

  const handleCash = async () => {
    try {
      await onCashPaid()
      setStep("done")
    } catch (e) {
      setError(e.message)
    }
  }

  const handleMpesaStart = async () => {
    try {
      await onMpesaCheckout()
      setStep("mpesa-pending")
    } catch (e) {
      setError(e.message)
    }
  }

  const handleMpesaConfirm = async () => {
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
              <button
                onClick={handleCash}
                className="w-full py-3 rounded-lg border border-gray-200 hover:border-primary font-medium text-ink"
              >
                Cash
              </button>
              <button
                onClick={handleMpesaStart}
                className="w-full py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark"
              >
                M-Pesa
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
            <button onClick={onClose} className="w-full text-muted text-sm mt-4">
              Cancel
            </button>
          </>
        )}

        {step === "mpesa-pending" && (
          <>
            <h2 className="text-lg font-semibold text-ink mb-1">Waiting for M-Pesa</h2>
            <p className="text-sm text-muted mb-4">
              Confirm once you see the payment SMS. Enter the M-Pesa code if visible.
            </p>
            <input
              type="text"
              placeholder="M-Pesa code (optional)"
              value={mpesaRef}
              onChange={(e) => setMpesaRef(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm mb-3 focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleMpesaConfirm}
              className="w-full py-3 rounded-lg bg-success text-white font-medium"
            >
              Mark as paid
            </button>
            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          </>
        )}

        {step === "done" && (
          <>
            <div className="text-center py-4">
              <p className="text-success text-4xl mb-2">✓</p>
              <h2 className="text-lg font-semibold text-ink">Sale completed</h2>
            </div>
            <a href={sale ? "http://localhost:8000/sales/" + sale.id + "/receipt" : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-lg border border-gray-200 hover:border-primary font-medium text-ink mt-2"
            >
              Download receipt
            </a>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg bg-primary text-white font-medium mt-2"
            >
              New sale
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CheckoutModal
