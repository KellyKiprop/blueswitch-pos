import { useState, useEffect } from "react"
import * as api from "../api"

const STATUS_LABELS = {
  deposit_paid: "Awaiting procurement",
  procuring: "Procuring",
  ready: "Ready for pickup",
  completed: "Completed",
}

const STATUS_COLORS = {
  deposit_paid: "bg-amber-50 text-amber-700 border-amber-200",
  procuring: "bg-blue-50 text-blue-700 border-blue-200",
  ready: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-gray-50 text-gray-500 border-gray-200",
}

function OrdersDashboard({ onClose, onNewOrder }) {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState("")
  const [completingId, setCompletingId] = useState(null)
  const [completeMethod, setCompleteMethod] = useState("cash")

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await api.listOrders()
      setOrders(data)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleAdvance = async (order) => {
    try {
      if (order.status === "deposit_paid") await api.markProcuring(order.id)
      else if (order.status === "procuring") await api.markReady(order.id)
      loadOrders()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleComplete = async (orderId) => {
    try {
      await api.completeOrder(orderId, completeMethod)
      setCompletingId(null)
      loadOrders()
    } catch (e) {
      setError(e.message)
    }
  }

  const activeOrders = orders.filter((o) => o.status !== "completed")
  const completedOrders = orders.filter((o) => o.status === "completed")

  return (
    <div className="fixed inset-0 bg-gray-50 z-40 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-primary">Orders</h1>
        <div className="flex items-center gap-3">
          <button onClick={onNewOrder} className="bg-accent hover:bg-accent-dark text-white text-sm font-medium px-4 py-2 rounded-lg">
            + New order
          </button>
          <button onClick={onClose} className="text-sm text-muted hover:text-ink">Back to till</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        <p className="text-sm text-muted mb-3">{activeOrders.length} active orders</p>
        <div className="space-y-3 mb-8">
          {activeOrders.length === 0 && (
            <p className="text-sm text-muted">No active orders. Start one with "+ New order".</p>
          )}
          {activeOrders.map((order) => {
            const balance = Number(order.total_amount) - Number(order.amount_paid)
            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink">{order.customer_name || "No name"}</p>
                    <p className="text-xs text-muted">{order.customer_phone}</p>
                    {order.items.map((item) => (
                      <p key={item.id} className="text-sm text-ink mt-1">{item.quantity}x {item.product_name || `Item #${item.product_id}`}</p>
                    ))}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-muted">
                    Paid <span className="tabular-nums text-ink font-medium">KES {Number(order.amount_paid).toLocaleString()}</span>
                    {" "}of <span className="tabular-nums">KES {Number(order.total_amount).toLocaleString()}</span>
                    {balance > 0 && <span className="text-warning ml-1">(KES {balance.toLocaleString()} balance)</span>}
                  </div>

                  {order.status === "deposit_paid" && (
                    <button onClick={() => handleAdvance(order)} className="text-primary text-xs font-medium">
                      Mark procuring →
                    </button>
                  )}
                  {order.status === "procuring" && (
                    <button onClick={() => handleAdvance(order)} className="text-primary text-xs font-medium">
                      Mark ready →
                    </button>
                  )}
                  {order.status === "ready" && completingId !== order.id && (
                    <button onClick={() => setCompletingId(order.id)} className="text-success text-xs font-medium">
                      Complete order →
                    </button>
                  )}
                </div>

                {completingId === order.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <select value={completeMethod} onChange={(e) => setCompleteMethod(e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-gray-200">
                      <option value="cash">Cash</option>
                      <option value="mpesa">M-Pesa (manual)</option>
                    </select>
                    <button onClick={() => handleComplete(order.id)} className="bg-success text-white text-xs font-medium px-3 py-1 rounded-lg">
                      Confirm balance paid
                    </button>
                    <button onClick={() => setCompletingId(null)} className="text-muted text-xs">Cancel</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {completedOrders.length > 0 && (
          <>
            <p className="text-sm text-muted mb-3">{completedOrders.length} completed</p>
            <div className="space-y-2">
              {completedOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between opacity-70">
                  <p className="text-sm text-ink">{order.customer_name} — {order.items.map((i) => i.product_name).join(", ")}</p>
                  <span className="text-xs text-muted">KES {Number(order.total_amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OrdersDashboard
