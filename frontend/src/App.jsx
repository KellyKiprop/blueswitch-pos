import { useState, useEffect } from "react"
import Header from "./components/Header"
import ProductGrid from "./components/ProductGrid"
import CartPanel from "./components/CartPanel"
import CheckoutModal from "./components/CheckoutModal"
import LoginScreen from "./components/LoginScreen"
import SplashScreen from "./components/SplashScreen"
import CashierLogin from "./components/CashierLogin"
import AdminPanel from "./components/AdminPanel"
import * as api from "./api"

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashFadingOut, setSplashFadingOut] = useState(false)
  const [activeCashier, setActiveCashier] = useState(null)
  const [view, setView] = useState("till") // "till" | "login" | "admin"
  const [adminToken, setAdminToken] = useState(null)

  const [products, setProducts] = useState([])
  const [sale, setSale] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [actionError, setActionError] = useState("")

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFadingOut(true), 4600)
    const hideTimer = setTimeout(() => setShowSplash(false), 5000)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  useEffect(() => {
    if (!actionError) return
    const timer = setTimeout(() => setActionError(""), 4000)
    return () => clearTimeout(timer)
  }, [actionError])

  const loadProducts = async () => {
    try {
      const data = await api.getProducts()
      setProducts(data)
      setLoadError("")
    } catch (e) {
      setLoadError("Could not load products. Is the backend running?")
    }
  }

  const ensureSale = async () => {
    if (sale) return sale
    const newSale = await api.createSale({ sale_type: "till", cashier_name: activeCashier?.name || "Unknown" })
    setSale(newSale)
    return newSale
  }

  const handleAddProduct = async (product) => {
    // Optimistic update: show the item in the cart immediately, using data we
    // already have locally, before the network round trip to Aiven completes.
    const previousSale = sale

    const optimisticSale = buildOptimisticSale(sale, product)
    setSale(optimisticSale)

    try {
      const currentSale = await ensureSale()
      const updated = await api.addItem(currentSale.id, { product_id: product.id, quantity: 1 })
      setSale(withProductNames(updated, products))
    } catch (e) {
      setSale(previousSale) // roll back to the last confirmed state
      setActionError(e.message)
    }
  }

  const handleRemoveItem = async (itemId) => {
    if (!sale) return
    try {
      const updated = await api.removeItem(sale.id, itemId)
      setSale(withProductNames(updated, products))
    } catch (e) {
      setActionError(e.message)
    }
  }

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (!sale) return
    try {
      const updated = await api.updateItemQuantity(sale.id, itemId, quantity)
      setSale(withProductNames(updated, products))
    } catch (e) {
      setActionError(e.message)
    }
  }

  const handleCashPaid = async () => {
    setIsProcessing(true)
    try {
      const updated = await api.checkout(sale.id, { method: "cash", amount: sale.total_amount })
      setSale(withProductNames(updated, products))
      await loadProducts()
    } catch (e) {
      setActionError(e.message)
      throw e
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMpesaCheckout = async () => {
    setIsProcessing(true)
    try {
      const updated = await api.checkout(sale.id, { method: "mpesa", amount: sale.total_amount })
      setSale(withProductNames(updated, products))
    } catch (e) {
      setActionError(e.message)
      throw e
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmMpesa = async (mpesaRef) => {
    setIsProcessing(true)
    try {
      const updated = await api.confirmPayment(sale.id, mpesaRef)
      setSale(withProductNames(updated, products))
      await loadProducts()
    } catch (e) {
      setActionError(e.message)
      throw e
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseModal = () => {
    setShowCheckout(false)
    setSale(null)
  }

  const handleCancelSale = async () => {
    if (!sale) return
    if (!confirm("Cancel this sale?")) return
    try {
      await api.cancelSale(sale.id)
      setSale(null)
    } catch (e) {
      setActionError(e.message)
    }
  }

  const handleLoginSuccess = (token) => {
    setAdminToken(token)
    setView("admin")
  }

  const handleLogout = () => {
    setAdminToken(null)
    setView("till")
  }

  const handleCloseAdmin = () => {
    setView("till")
    loadProducts() // refresh in case prices/stock changed
  }

  if (view === "admin" && adminToken) {
    return <AdminPanel token={adminToken} onLogout={handleLogout} onClose={handleCloseAdmin} />
  }

  if (!showSplash && !activeCashier) {
    return <CashierLogin onLoginSuccess={setActiveCashier} />
  }

  return (
    <>
      {showSplash && <SplashScreen fadingOut={splashFadingOut} />}
    <div className="h-screen flex flex-col">
      <Header cashierName={activeCashier?.name} onAdminClick={() => setView("login")} onEndShift={() => setActiveCashier(null)} />
      {actionError && (
        <div className="bg-red-50 border-b border-red-200 text-red-600 text-sm px-4 py-2 text-center">
          {actionError}
        </div>
      )}
      <div className="flex-1 flex overflow-hidden">
        {loadError ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500 text-sm">{loadError}</p>
          </div>
        ) : (
          <ProductGrid products={products} onAdd={handleAddProduct} />
        )}
        <CartPanel
          sale={sale}
          onRemoveItem={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckout={() => setShowCheckout(true)}
          onCancelSale={handleCancelSale}
          isProcessing={isProcessing}
        />
      </div>
      {showCheckout && (
        <CheckoutModal
          sale={sale}
          onClose={handleCloseModal}
          onCashPaid={handleCashPaid}
          onConfirmMpesa={handleConfirmMpesa}
        />
      )}
      {view === "login" && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} onCancel={() => setView("till")} />
      )}
    </div>
    </>
  )
}

function buildOptimisticSale(sale, product) {
  const base = sale || {
    id: null,
    sale_type: "till",
    status: "open",
    total_amount: 0,
    amount_paid: 0,
    items: [],
  }
  const existing = base.items.find((item) => item.product_id === product.id)
  let items
  if (existing) {
    items = base.items.map((item) =>
      item.product_id === product.id
        ? { ...item, quantity: item.quantity + 1, line_total: Number(item.unit_price) * (item.quantity + 1) }
        : item
    )
  } else {
    items = [
      ...base.items,
      {
        id: `optimistic-${product.id}-${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.sell_price,
        line_total: product.sell_price,
      },
    ]
  }
  const total_amount = items.reduce((sum, item) => sum + Number(item.line_total), 0)
  return { ...base, items, total_amount }
}

function withProductNames(sale, products) {
  return {
    ...sale,
    items: sale.items.map((item) => ({
      ...item,
      product_name: products.find((p) => p.id === item.product_id)?.name,
    })),
  }
}

export default App
