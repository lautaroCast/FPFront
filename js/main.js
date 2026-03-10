let allProducts = [];
let filteredProducts = [];
let searchText = "";
let selectedCategories = [];
let onlyWithStock = false;
let minPrice = 0;
let maxPrice = Infinity;
let cart = [];


// ===============================
// Imports
// ===============================

import { initUI, renderProducts, renderCart, updateAuthUI, closeModal, setAddToCartHandler, setCartHandlers } from "./ui.js";
import { registerAuth, loginAuth, logoutAuth, isLoggedIn, setClientId, getClientId } from "./auth.js";
import { createOrder, createOrderDetail, updateProduct, getAddresses, createAddress, getProducts, getClients } from "./api.js";
import { renderProfile } from "./perfil.js";


// ===============================
// App Init
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

  initUI();
  updateAuthUI(isLoggedIn());

  initAuthEvents();
  initProductEvents();
  initHeaderSearch();
  initSidebarSearch();
  initStockFilter();
  initCategoryFilters();
  initCartUI();

  document.addEventListener("click", async (e) => {
    if (e.target.id === "checkout-btn") {
      await handleCheckout();
    }
  });

  const productCards = document.getElementById("product-cards");

  if (productCards) {
    try {

      const products = await getProducts();
      allProducts = products;

      initPriceFilter(products);
      aplicarFiltros();

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  setAddToCartHandler(productId => {

    const product = allProducts.find(p => p.id_key === productId);
    if (!product) return;

    addToCart(product);

  });

  setCartHandlers(
    increaseQuantity,
    decreaseQuantity
  );

  const profileBtn = document.getElementById("profileBtn");

  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      window.location.href = "perfil.html";
    });
  }

  const profileRoot = document.getElementById("profileRoot");

  if (profileRoot) {
    loadProfile();
  }

});


// ===============================
// Checkout
// ===============================

async function handleCheckout() {

  try {

    if (!isLoggedIn()) {
      alert("Debes iniciar sesión para finalizar la compra");
      return;
    }

    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    const clientId = getClientId();

    if (!clientId) {
      alert("No se encontró el cliente");
      return;
    }

    const freshProducts = await getProducts();

    for (const item of cart) {

      const product = freshProducts.find(p => p.id_key === item.id);

      if (!product) {
        alert(`Producto no encontrado: ${item.name}`);
        return;
      }

      if (item.quantity > product.stock) {
        alert(`Stock insuficiente para ${item.name}`);
        return;
      }

    }

    const allAddresses = await getAddresses();
    let clientAddresses = allAddresses.filter(a => a.client_id == clientId);

    let address;

    if (clientAddresses.length > 0) {

      address = clientAddresses[0];

    } else {

      const street = prompt("Ingrese su calle:");
      const city = prompt("Ingrese su ciudad:");
      const zip = prompt("Ingrese su código postal:");

      if (!street || !city || !zip) {
        alert("Dirección incompleta");
        return;
      }

      address = await createAddress({
        client_id: Number(clientId),
        street,
        city,
        zip_code: zip
      });

    }

    const total = calculateTotal();

    const order = await createOrder({
      total: total,
      delivery_method: 1,
      status: 1,
      client_id: Number(clientId)
    });

    for (const item of cart) {

      await createOrderDetail({
        order_id: order.id_key,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      });

    }

    cart = [];
    renderCart(cart, 0);

    allProducts = await getProducts();
    aplicarFiltros();

    alert("Compra realizada con éxito 🎉");

  } catch (error) {

    console.error(error);
    alert("Error al procesar la compra");

  }

}


// ===============================
// Auth Events
// ===============================

function initAuthEvents() {

  initSignup();
  initLogin();
  initLogout();

}


function initSignup() {

  const signupForm = document.getElementById("signupForm");
  if (!signupForm) return;

  signupForm.addEventListener("submit", async e => {

    e.preventDefault();

    const userData = {
      name: document.getElementById("firstName").value,
      lastname: document.getElementById("lastName").value,
      email: document.getElementById("signupEmail").value,
      telephone: document.getElementById("phone").value,
      password: document.getElementById("signupPassword").value
    };

    try {

      registerAuth(userData.email, userData.password);
      await createClient(userData);

      alert("Registro exitoso");
      closeModal("signup");
      updateAuthUI(true);

    } catch (error) {

      alert(error.message);

    }

  });

}
function initLogin() {

  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async e => {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {

      loginAuth(email, password);

      const clients = await getClients();
      const client = clients.find(c => c.email === email);

      if (!client) {
        throw new Error("Cliente no encontrado en la base de datos");
      }

      setClientId(client.id_key);

      // 🔹 NUEVO: guardar usuario para perfil
      localStorage.setItem("user", JSON.stringify(client));

      alert("Login exitoso");
      closeModal("login");
      updateAuthUI(true);

    } catch (error) {

      alert(error.message);

    }

  });

}


function initLogout() {

  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {

    if (!confirm("¿Cerrar sesión?")) return;

    logoutAuth();

    // 🔹 NUEVO: eliminar usuario guardado
    localStorage.removeItem("user");

    updateAuthUI(false);
    alert("Sesión cerrada 👋");

  });

}

// ===============================
// Products
// ===============================

function initProductEvents() {

  const productsBtn = document.getElementById("viewProductsBtn");
  if (!productsBtn) return;

  productsBtn.addEventListener("click", () => {
    window.location.href = "productos.html";
  });

}


// ===============================
// Filtros
// ===============================

function aplicarFiltros() {

  let filtrados = allProducts;

  if (searchText.trim() !== "") {
    filtrados = filtrados.filter(producto =>
      producto.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  if (selectedCategories.length > 0) {
    filtrados = filtrados.filter(producto =>
      selectedCategories.includes(producto.category_id)
    );
  }

  if (onlyWithStock) {
    filtrados = filtrados.filter(producto => producto.stock > 0);
  }

  filtrados = filtrados.filter(producto =>
    producto.price >= minPrice && producto.price <= maxPrice
  );

  renderProducts(filtrados);

}


function initSidebarSearch() {

  const sidebarInput = document.getElementById("searchInput");
  if (!sidebarInput) return;

  sidebarInput.addEventListener("input", e => {

    searchText = e.target.value;
    aplicarFiltros();

  });

}


function initHeaderSearch() {

  const headerInput = document.getElementById("query");
  if (!headerInput) return;

  headerInput.addEventListener("input", e => {

    searchText = e.target.value;
    aplicarFiltros();

  });

}


function initCategoryFilters() {

  const checkboxes = document.querySelectorAll(".category-checkbox");

  checkboxes.forEach(checkbox => {

    checkbox.addEventListener("change", () => {

      const categoryId = Number(checkbox.value);

      if (checkbox.checked) {

        if (!selectedCategories.includes(categoryId)) {
          selectedCategories.push(categoryId);
        }

      } else {

        selectedCategories = selectedCategories.filter(id => id !== categoryId);

      }

      aplicarFiltros();

    });

  });

}


function initStockFilter() {

  const stockCheckbox = document.getElementById("stockFilter");
  if (!stockCheckbox) return;

  stockCheckbox.addEventListener("change", () => {

    onlyWithStock = stockCheckbox.checked;
    aplicarFiltros();

  });

}


function initPriceFilter(products) {

  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");

  if (!priceRange || !priceValue) return;

  const maxProductPrice = Math.max(...products.map(p => p.price));

  priceRange.min = 0;
  priceRange.max = maxProductPrice;
  priceRange.value = maxProductPrice;

  maxPrice = maxProductPrice;

  priceValue.textContent = `$${maxProductPrice}`;

  priceRange.addEventListener("input", () => {

    maxPrice = Number(priceRange.value);
    priceValue.textContent = `$${maxPrice}`;

    aplicarFiltros();

  });

}


// ===============================
// Cart
// ===============================

function initCartUI() {

  const cartBtn = document.getElementById("cart-btn");
  const cartPanel = document.getElementById("cart-panel");

  if (!cartBtn || !cartPanel) return;

  cartBtn.addEventListener("click", () => {
    cartPanel.classList.toggle("cart-hidden");
  });

}


function calculateTotal() {

  return cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

}


function addToCart(product) {

  const existing = cart.find(item => item.id === product.id_key);

  if (existing) {

    if (existing.quantity >= product.stock) {
      alert("No hay más stock disponible para este producto");
      return;
    }

    existing.quantity++;

  } else {

    cart.push({
      id: product.id_key,
      name: product.name,
      price: product.price,
      quantity: 1
    });

  }

  renderCart(cart, calculateTotal());

}


function increaseQuantity(id) {

  const item = cart.find(p => p.id === id);
  if (!item) return;

  const product = allProducts.find(p => p.id_key === id);
  if (!product) return;

  if (item.quantity >= product.stock) {
    alert("No hay más stock disponible para este producto");
    return;
  }

  item.quantity++;

  renderCart(cart, calculateTotal());

}


function decreaseQuantity(id) {

  const item = cart.find(p => p.id === id);
  if (!item) return;

  item.quantity--;

  if (item.quantity <= 0) {
    cart = cart.filter(p => p.id !== id);
  }

  renderCart(cart, calculateTotal());

}


// ===============================
// Perfil
// ===============================

function loadProfile() {

  const app = document.getElementById("profileRoot");

  if (!app) return;

  app.innerHTML = "";
  app.appendChild(renderProfile());

}