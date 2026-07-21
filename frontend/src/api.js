const BASE_URL = "https://blueswitch-pos-api.onrender.com"
const TIMEOUT_MS = 15000

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Request timed out. Check your connection and try again.")
    }
    throw e
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function getProducts(productType) {
  const url = productType
    ? `${BASE_URL}/products/?product_type=${productType}`
    : `${BASE_URL}/products/`
  const res = await fetchWithTimeout(url)
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

export async function getAllProductsIncludingInactive() {
  const res = await fetchWithTimeout(`${BASE_URL}/products/?active_only=false`)
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

export async function createSale(payload) {
  const res = await fetchWithTimeout(`${BASE_URL}/sales/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to create sale")
  return res.json()
}

export async function addItem(saleId, payload) {
  const res = await fetchWithTimeout(`${BASE_URL}/sales/${saleId}/items`, {
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
  const res = await fetchWithTimeout(`${BASE_URL}/sales/${saleId}/items/${itemId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to remove item")
  return res.json()
}

export async function updateItemQuantity(saleId, itemId, quantity) {
  const res = await fetchWithTimeout(`${BASE_URL}/sales/${saleId}/items/${itemId}?quantity=${quantity}`, {
    method: "PATCH",
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to update quantity")
  }
  return res.json()
}

export async function checkout(saleId, payload) {
  const res = await fetchWithTimeout(`${BASE_URL}/sales/${saleId}/checkout`, {
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
  const res = await fetchWithTimeout(url, { method: "POST" })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Confirmation failed")
  }
  return res.json()
}

export async function cancelSale(saleId) {
  const res = await fetchWithTimeout(`${BASE_URL}/sales/${saleId}/cancel`, { method: "POST" })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to cancel sale")
  }
  return res.json()
}

export async function login(username, password) {
  const res = await fetchWithTimeout(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Login failed")
  }
  return res.json()
}

export async function createProduct(payload, token) {
  const res = await fetchWithTimeout(`${BASE_URL}/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to create product")
  }
  return res.json()
}

export async function updateProduct(productId, payload, token) {
  const res = await fetchWithTimeout(`${BASE_URL}/products/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to update product")
  }
  return res.json()
}

export async function deactivateProduct(productId, token) {
  const res = await fetchWithTimeout(`${BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to deactivate product")
  return true
}

export async function initiateStkPush(saleId, phoneNumber) {
  const res = await fetchWithTimeout(`${BASE_URL}/sales/${saleId}/mpesa/stk-push`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to send M-Pesa prompt")
  }
  return res.json()
}

export async function getSale(saleId) {
  const res = await fetchWithTimeout(`${BASE_URL}/sales/${saleId}`)
  if (!res.ok) throw new Error("Failed to fetch sale")
  return res.json()
}

export async function getCashiers() {
  const res = await fetchWithTimeout(`${BASE_URL}/cashiers/`)
  if (!res.ok) throw new Error("Failed to fetch cashiers")
  return res.json()
}

export async function cashierLogin(cashierId, pin) {
  const res = await fetchWithTimeout(`${BASE_URL}/cashiers/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cashier_id: cashierId, pin }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Incorrect PIN")
  }
  return res.json()
}

export async function getAllCashiers(token) {
  const res = await fetchWithTimeout(`${BASE_URL}/cashiers/all`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch cashiers")
  return res.json()
}

export async function createCashier(name, pin, token) {
  const res = await fetchWithTimeout(`${BASE_URL}/cashiers/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, pin }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to create cashier")
  }
  return res.json()
}

export async function deactivateCashier(cashierId, token) {
  const res = await fetchWithTimeout(`${BASE_URL}/cashiers/${cashierId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to deactivate cashier")
  return true
}
