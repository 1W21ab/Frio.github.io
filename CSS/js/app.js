// js/app.js
const API_BASE = "https://YOUR_BACKEND.onrender.com"; // <-- REPLACE this after backend deploy

const productsEl = document.getElementById("products");
const tpl = document.getElementById("product-tpl");
const cartEl = document.getElementById("cart");
const cartToggle = document.getElementById("cart-toggle");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const cartCountEl = document.getElementById("cart-count");
const checkoutBtn = document.getElementById("checkout-btn");

let PRODUCTS = [];
let CART = [];

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error('Failed to load products: ' + res.status);
    PRODUCTS = await res.json();
    renderProducts();
  } catch (err) {
    productsEl.innerHTML = `<p style="color:red">Cannot load products: ${err.message}</p>`;
    console.error(err);
  }
}

function renderProducts() {
  productsEl.innerHTML = "";
  PRODUCTS.forEach(p => {
    const node = tpl.content.cloneNode(true);
    node.querySelector(".product-img").src = p.image || "https://via.placeholder.com/400x300";
    node.querySelector(".product-title").textContent = p.title;
    node.querySelector(".product-desc").textContent = p.description || "";
    node.querySelector(".product-price").textContent = Number(p.price).toFixed(2);
    node.querySelector(".add-btn").addEventListener("click", () => addToCart(p));
    productsEl.appendChild(node);
  });
}

function addToCart(product) {
  const item = CART.find(i => i.id === product.id);
  if (item) item.qty++;
  else CART.push({ id: product.id, qty: 1, price: product.price, title: product.title });
  updateCart();
}

function updateCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;
  CART.forEach(item => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.textContent = `${item.title} x${item.qty} — $${(item.price*item.qty).toFixed(2)}`;
    const minus = document.createElement("button");
    minus.textContent = "-";
    minus.style.marginLeft = "8px";
    minus.className = "secondary";
    minus.onclick = () => {
      item.qty--;
      if (item.qty <= 0) CART = CART.filter(i => i.id !== item.id);
      updateCart();
    };
    li.appendChild(minus);
    cartItemsEl.appendChild(li);
  });
  cartTotalEl.textContent = total.toFixed(2);
  cartCountEl.textContent = CART.reduce((s,i) => s + i.qty, 0);
}

cartToggle.onclick = () => cartEl.classList.toggle("hidden");

checkoutBtn.onclick = async () => {
  if (CART.length === 0) return alert("Cart empty!");
  try {
    const res = await fetch(`${API_BASE}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: CART })
    });
    const data = await res.json();
    if (!res.ok) return alert('Checkout failed: ' + (data.error || JSON.stringify(data)));
    alert('Order placed! Order ID: ' + data.order.id + ' — total: $' + data.order.total.toFixed(2));
    CART = [];
    updateCart();
  } catch (err) {
    alert('Checkout error: ' + err.message);
  }
};

loadProducts();
 