// ===============================
// API – Config
// ===============================

const API_BASE_URL = "http://localhost:8000";

// ===============================
// Helper interno para fetch
// ===============================

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Error en la comunicación con el servidor");
  }

  return data;
}

// ===============================
// API – Endpoints
// ===============================

export async function createClient(clientData) {
  return fetchJSON(`${API_BASE_URL}/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(clientData)
  });
}

export async function getClients() {
  return fetchJSON(`${API_BASE_URL}/clients`);
}

export async function getProducts() {
  return fetchJSON(`${API_BASE_URL}/products`);
}

// ===============================
// Addresses
// ===============================

export async function getAddresses() {
  return fetchJSON(`${API_BASE_URL}/addresses`);
}

export async function createAddress(addressData) {
  return fetchJSON(`${API_BASE_URL}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(addressData)
  });
}

// ===============================
// Orders
// ===============================

export async function createOrder(orderData) {
  return fetchJSON(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  });
}

// ===============================
// Order Details
// ===============================

export async function createOrderDetail(detailData) {
  return fetchJSON(`${API_BASE_URL}/order_details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(detailData)
  });
}

// ===============================
// Update Product Stock
// ===============================

export async function updateProduct(productId, productData) {
  return fetchJSON(`${API_BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData)
  });
}