import { useState, useEffect } from "react"
import * as api from "../api"

function AdminPanel({ token, onLogout, onClose }) {
  const [products, setProducts] = useState([])
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})

  const [newProduct, setNewProduct] = useState({
    sku: "", name: "", category: "", product_type: "stocked",
    cost_price: "", sell_price: "", stock_qty: "", reorder_threshold: "5", lead_time_days: "",
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await api.getAllProductsIncludingInactive()
      setProducts(data)
    } catch (e) {
      setError(e.message)
    }
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setEditValues({ stock_qty: product.stock_qty, sell_price: product.sell_price })
  }

  const saveEdit = async (productId) => {
    try {
      await api.updateProduct(productId, {
        stock_qty: Number(editValues.stock_qty),
        sell_price: Number(editValues.sell_price),
      }, token)
      setEditingId(null)
      loadProducts()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDeactivate = async (productId) => {
    if (!confirm("Deactivate this product? It will stop showing in the till.")) return
    try {
      await api.deactivateProduct(productId, token)
      loadProducts()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...newProduct,
        cost_price: newProduct.cost_price ? Number(newProduct.cost_price) : null,
        sell_price: Number(newProduct.sell_price),
        stock_qty: newProduct.stock_qty ? Number(newProduct.stock_qty) : 0,
        reorder_threshold: Number(newProduct.reorder_threshold),
        lead_time_days: newProduct.lead_time_days ? Number(newProduct.lead_time_days) : null,
        sku: newProduct.sku || null,
      }
      await api.createProduct(payload, token)
      setNewProduct({
        sku: "", name: "", category: "", product_type: "stocked",
        cost_price: "", sell_price: "", stock_qty: "", reorder_threshold: "5", lead_time_days: "",
      })
      setShowAddForm(false)
      loadProducts()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="./logo.png" alt="Blueswitch logo" className="h-8 w-8 object-contain" />
          <h1 className="text-lg font-semibold text-primary">Product management</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-sm text-muted hover:text-ink">
            Back to till
          </button>
          <button onClick={onLogout} className="text-sm text-muted hover:text-red-500">
            Log out
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">{products.length} products</p>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-accent hover:bg-accent-dark text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {showAddForm ? "Cancel" : "+ Add product"}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddProduct} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Name" required value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            <input placeholder="Category" required value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            <select value={newProduct.product_type}
              onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
              <option value="stocked">Stocked</option>
              <option value="order_based">Order-based</option>
            </select>
            <input placeholder="SKU (optional)" value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            <input placeholder="Sell price" type="number" required value={newProduct.sell_price}
              onChange={(e) => setNewProduct({ ...newProduct, sell_price: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            <input placeholder="Cost price (optional)" type="number" value={newProduct.cost_price}
              onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            {newProduct.product_type === "stocked" ? (
              <>
                <input placeholder="Stock qty" type="number" value={newProduct.stock_qty}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_qty: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                <input placeholder="Reorder threshold" type="number" value={newProduct.reorder_threshold}
                  onChange={(e) => setNewProduct({ ...newProduct, reorder_threshold: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </>
            ) : (
              <input placeholder="Lead time (days)" type="number" value={newProduct.lead_time_days}
                onChange={(e) => setNewProduct({ ...newProduct, lead_time_days: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            )}
            <button type="submit" className="col-span-2 md:col-span-4 bg-primary hover:bg-primary-dark text-white text-sm font-medium py-2 rounded-lg">
              Save product
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-muted text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-right px-4 py-2">Stock</th>
                <th className="text-right px-4 py-2">Price</th>
                <th className="text-right px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2 text-muted">{p.category}</td>
                  <td className="px-4 py-2 text-muted">{p.product_type === "stocked" ? "Stocked" : "Order-based"}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {editingId === p.id ? (
                      <input type="number" value={editValues.stock_qty}
                        onChange={(e) => setEditValues({ ...editValues, stock_qty: e.target.value })}
                        className="w-16 px-1 py-0.5 border border-gray-200 rounded text-right" />
                    ) : (
                      p.product_type === "stocked" ? p.stock_qty : "—"
                    )}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {editingId === p.id ? (
                      <input type="number" value={editValues.sell_price}
                        onChange={(e) => setEditValues({ ...editValues, sell_price: e.target.value })}
                        className="w-20 px-1 py-0.5 border border-gray-200 rounded text-right" />
                    ) : (
                      "KES " + Number(p.sell_price).toLocaleString()
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={p.is_active ? "text-success" : "text-muted"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {editingId === p.id ? (
                      <button onClick={() => saveEdit(p.id)} className="text-primary text-xs font-medium mr-2">
                        Save
                      </button>
                    ) : (
                      <button onClick={() => startEdit(p)} className="text-primary text-xs font-medium mr-2">
                        Edit
                      </button>
                    )}
                    {p.is_active && (
                      <button onClick={() => handleDeactivate(p.id)} className="text-red-500 text-xs">
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
