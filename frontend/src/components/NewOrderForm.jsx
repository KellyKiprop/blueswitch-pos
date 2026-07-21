import { useState } from "react"
import * as api from "../api"

function NewOrderForm({ products, cashierName, onCreated, onCancel }) {
  const orderProducts = products.filter((p) => p.product_type === "order_based")

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [productId, setProductId] = useState(orderProducts[0]?.id || "")
  const [deposit, setDeposit] = useState("")
  const [method, setMethod] = useState("cash")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const selectedProduct = orderProducts.find((p) => p.id === Number(productId))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!productId) {
      setError("No order-based products available. Add one in Admin first.")
      return
    }
    const depositAmount = Number(deposit)
    if (!depositAmount || depositAmount <= 0) {
      setError("Enter a deposit amount")
      return
    }
    if (depositAmount > Number(selectedProduct.sell_price)) {
      setError("Deposit cannot exceed the item's price")
      return
    }

    setSubmitting(true)
    try {
      const sale = await api.createSale({
        sale_type: "order",
        customer_name: customerName,
        customer_phone: customerPhone,
        cashier_name: cashierName,
      })
      await api.addItem(sale.id, { product_id: Number(productId), quantity: 1 })
      await api.checkout(sale.id, { method, amount: depositAmount })
      onCreated()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-ink mb-4">New order</h2>

        <label className="text-xs text-muted block mb-1">Customer name</label>
        <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3" />

        <label className="text-xs text-muted block mb-1">Customer phone</label>
        <input required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="0712345678"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3" />

        <label className="text-xs text-muted block mb-1">Product</label>
        {orderProducts.length === 0 ? (
          <p className="text-sm text-red-500 mb-3">No order-based products yet. Add one in Admin → Products first.</p>
        ) : (
          <select value={productId} onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3">
            {orderProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — KES {Number(p.sell_price).toLocaleString()}
              </option>
            ))}
          </select>
        )}

        <label className="text-xs text-muted block mb-1">Deposit amount</label>
        <input required type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)}
          placeholder={selectedProduct ? `up to ${Number(selectedProduct.sell_price).toLocaleString()}` : ""}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3" />

        <label className="text-xs text-muted block mb-1">Payment method</label>
        <div className="flex gap-2 mb-4">
          <button type="button" onClick={() => setMethod("cash")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border ${method === "cash" ? "bg-primary text-white border-primary" : "border-gray-200 text-ink"}`}>
            Cash
          </button>
          <button type="button" onClick={() => setMethod("mpesa")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border ${method === "mpesa" ? "bg-primary text-white border-primary" : "border-gray-200 text-ink"}`}>
            M-Pesa (manual)
          </button>
        </div>

        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-lg border border-gray-200 text-ink font-medium">
            Cancel
          </button>
          <button type="submit" disabled={submitting || orderProducts.length === 0}
            className="flex-1 py-3 rounded-lg bg-accent hover:bg-accent-dark text-white font-medium disabled:opacity-40">
            {submitting ? "Creating..." : "Start order"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewOrderForm
