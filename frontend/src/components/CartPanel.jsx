function CartPanel({ sale, onRemoveItem, onUpdateQuantity, onCheckout, onCancelSale, isProcessing }) {
  const items = sale?.items || []
  const total = sale?.total_amount || 0
  const isCompleted = sale?.status === "completed"
  const receiptUrl = sale ? "https://blueswitch-pos-api.onrender.com/sales/" + sale.id + "/receipt" : "#"

  return (
    <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-ink">Current sale</h2>
          <p className="text-xs text-muted">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
        {!isCompleted && items.length > 0 && (
          <button
            onClick={onCancelSale}
            className="text-xs text-muted hover:text-red-500"
          >
            Cancel sale
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted text-center mt-8">Cart is empty</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink truncate">{item.product_name || "Item #" + item.product_id}</p>
                  <p className="text-xs text-muted tabular-nums">
                    KES {Number(item.unit_price).toLocaleString()} each
                  </p>
                </div>
                {!isCompleted && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium text-ink"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="text-sm tabular-nums w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium text-ink"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                )}
                {isCompleted && (
                  <span className="text-sm tabular-nums shrink-0">{item.quantity}x</span>
                )}
                <span className="text-sm font-medium tabular-nums shrink-0 w-20 text-right">
                  KES {Number(item.line_total).toLocaleString()}
                </span>
                {!isCompleted && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-muted hover:text-red-500 text-xs px-1 shrink-0"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-primary-light">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-sm font-medium text-ink">Total</span>
          <span className="text-2xl font-bold text-primary tabular-nums">
            KES {Number(total).toLocaleString()}
          </span>
        </div>
        {isCompleted ? (
          <a href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition"
          >
            Download receipt
          </a>
        ) : (
          <button
            onClick={onCheckout}
            disabled={items.length === 0 || isProcessing}
            className="w-full bg-accent hover:bg-accent-dark text-white font-medium py-3 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Checkout"}
          </button>
        )}
      </div>
    </div>
  )
}

export default CartPanel
