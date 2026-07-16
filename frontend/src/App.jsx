import { useState, useEffect } from "react"
import Header from "./components/Header"
import ProductGrid from "./components/ProductGrid"
import CartPanel from "./components/CartPanel"
import CheckoutModal from "./components/CheckoutModal"
import * as api from "./api"

function App() {
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
    const newSale = await api.createSale({ sale_type: "till", cashier_name: "Kelly" })
    setSale(newSale)
    return newSale
  }

  const handleAddProduct = async (product) => {
    try {
      const currentSale = await ensureSale()
      const updated = await api.addItem(currentSale.id, { product_id: product.id, quantity: 1 })
      setSale(withProductNames(updated, products))
    } catch (e) {
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

  return (
    <div className="h-screen flex flex-col">
      <Header cashierName="Kelly" />
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
          onMpesaCheckout={handleMpesaCheckout}
          onConfirmMpesa={handleConfirmMpesa}
        />
      )}
    </div>
  )
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
