function ProductCard({ product, onAdd }) {
  const isOutOfStock = product.product_type === "stocked" && product.stock_qty <= 0
  const isLowStock = product.product_type === "stocked" && product.stock_qty > 0 && product.stock_qty <= product.reorder_threshold

  return (
    <button
      onClick={() => onAdd(product)}
      disabled={isOutOfStock}
      className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-primary hover:shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <p className="font-medium text-ink text-sm leading-snug">{product.name}</p>
      <p className="text-xs text-muted mt-1">{product.category}</p>
      <div className="flex items-baseline justify-between mt-3">
        <span className="text-primary font-semibold tabular-nums">
          KES {Number(product.sell_price).toLocaleString()}
        </span>
        {product.product_type === "stocked" ? (
          <span className={`text-xs tabular-nums ${isOutOfStock ? "text-red-500" : isLowStock ? "text-warning" : "text-muted"}`}>
            {isOutOfStock ? "Out of stock" : `${product.stock_qty} left`}
          </span>
        ) : (
          <span className="text-xs text-accent-dark">
            {product.lead_time_days ? `${product.lead_time_days}d lead time` : "Order"}
          </span>
        )}
      </div>
    </button>
  )
}

export default ProductCard
