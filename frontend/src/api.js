const BASE_URL = "http://localhost:8000"

export async function getProducts(productType) {
  const url = productType
    ? `${BASE_URL}/products/?product_type=${productType}`
    : `${BASE_URL}/products/`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

export async function createSale(payload) {
  const res = await fetch(`${BASE_URL}/sales/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to create sale")
  return res.json()
}

export async function addItem(saleId, payload) {
  const res = await fetch(`${BASE_URL}/sales/${saleId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to add item")
  }
  return res.json()
}

export async function removeItem(saleId, itemId) {
  const res = await fetch(`${BASE_URL}/sales/${saleId}/items/${itemId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to remove item")
  return res.json()
}

export async function checkout(saleId, payload) {
  const res = await fetch(`${BASE_URL}/sales/${saleId}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Checkout failed")
  }
  return res.json()
}

export async function confirmPayment(saleId, mpesaRef) {
  const url = mpesaRef
    ? `${BASE_URL}/sales/${saleId}/confirm-payment?mpesa_ref=${mpesaRef}`
    : `${BASE_URL}/sales/${saleId}/confirm-payment`
  const res = await fetch(url, { method: "POST" })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Confirmation failed")
  }
  return res.json()
}

export async function updateItemQuantity(saleId, itemId, quantity) {
  const res = await fetch(`${BASE_URL}/sales/${saleId}/items/${itemId}?quantity=${quantity}`, {
    method: "PATCH",
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to update quantity")
  }
  return res.json()
}

export async function cancelSale(saleId) {
  const res = await fetch(`${BASE_URL}/sales/${saleId}/cancel`, { method: "POST" })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to cancel sale")
  }
  return res.json()
}
