let onIncrease = null;
let onDecrease = null;
let onAddToCart = null;

// ===============================
// UI – Modales
// ===============================

const signupModal = document.getElementById("signupModal");
const loginModal = document.getElementById("loginModal");

export function openModal(type) {
  if (type === "signup") signupModal.style.display = "flex";
  if (type === "login") loginModal.style.display = "flex";
}

export function closeModal(type) {
  if (type === "signup") signupModal.style.display = "none";
  if (type === "login") loginModal.style.display = "none";
}

// ===============================
// UI – Inicialización
// ===============================

export function initUI() {
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");

  if (signupBtn) signupBtn.onclick = () => openModal("signup");
  if (loginBtn) loginBtn.onclick = () => openModal("login");

  document.querySelectorAll(".close").forEach(btn => {
    btn.onclick = () => closeModal(btn.dataset.close);
  });

  window.onclick = e => {
    if (e.target === signupModal) closeModal("signup");
    if (e.target === loginModal) closeModal("login");
  };
}

// ===============================
// UI – Auth
// ===============================

export function updateAuthUI(isLoggedIn) {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const profileBtn = document.getElementById("profileBtn");

  if (!loginBtn || !signupBtn || !profileBtn) return;

  if (isLoggedIn) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    profileBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    profileBtn.style.display = "none";
  }
}

// ===============================
// UI – Productos
// ===============================

export function crearCardProducto(producto) {
  return `
    <div class="card">
      <img 
        src="https://via.placeholder.com/300x200?text=Producto" 
        alt="${producto.name}"
      >
      <h3>${producto.name}</h3>
      <p>Precio: $${producto.price}</p>
      <p>${producto.stock > 0 ? "Stock disponible" : "Sin stock"}</p>

      ${
        producto.stock > 0
          ? `<button 
              class="add-to-cart-btn" 
              data-id="${producto.id_key}">
              Agregar al carrito
            </button>`
          : `<p class="no-stock-label">Sin stock</p>`
      }
    </div>
  `;
}

export function setCartHandlers(increaseHandler, decreaseHandler) {
  onIncrease = increaseHandler;
  onDecrease = decreaseHandler;
}

export function setAddToCartHandler(handler) {
  onAddToCart = handler;
}

export function renderProducts(products) {
  const productList = document.getElementById("product-cards");
  if (!productList) return;

  if (products.length === 0) {
    productList.innerHTML = `
      <div class="no-results">
        <p>No hay productos que coincidan con los filtros</p>
      </div>
    `;
    return;
  }

  productList.innerHTML = products
    .map(producto => crearCardProducto(producto))
    .join("");

  const buttons = productList.querySelectorAll(".add-to-cart-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (!onAddToCart) return;
      const productId = Number(btn.dataset.id);
      onAddToCart(productId);
    });
  });
}

// ===============================
// UI – Carrito
// ===============================

export function renderCart(cart, total) {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const countEl = document.getElementById("cart-count");

  if (!container || !totalEl || !countEl) return;

  if (cart.length === 0) {
    container.innerHTML = "<p>El carrito está vacío</p>";
    totalEl.textContent = "0";
    countEl.textContent = "0";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <p>$${item.price}</p>
      </div>
      <div>
        <button class="decrease-btn" data-id="${item.id}">-</button>
        <span>${item.quantity}</span>
        <button class="increase-btn" data-id="${item.id}">+</button>
      </div>
    </div>
  `).join("");

  totalEl.textContent = total;
  countEl.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);

  container.querySelectorAll(".increase-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (onIncrease) onIncrease(id);
    });
  });

  container.querySelectorAll(".decrease-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (onDecrease) onDecrease(id);
    });
  });
}
