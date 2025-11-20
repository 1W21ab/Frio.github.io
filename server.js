// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
// allow cross-origin requests (for GitHub Pages frontend). In production restrict origins.
app.use(cors());

// --------------------------
// In-memory data (resets on restart)
// --------------------------
let PRODUCTS = [
  { id: 1, title: "Blue T-Shirt", description: "Comfortable cotton t-shirt", price: 19.99, stock: 20, image: "https://via.placeholder.com/400x300?text=Blue+Tshirt" },
  { id: 2, title: "Sneakers",    description: "Stylish running shoes",         price: 59.99, stock: 10, image: "https://via.placeholder.com/400x300?text=Sneakers" },
  { id: 3, title: "Coffee Mug",   description: "Ceramic 350ml mug",             price: 9.5,   stock: 40, image: "https://via.placeholder.com/400x300?text=Mug" }
];
let ORDERS = [];
let NEXT_PRODUCT_ID = 4;

// --------------------------
// API endpoints
// --------------------------
app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Admin add product (unprotected — for demo only)
app.post('/api/admin/products', (req, res) => {
  const { title, description = '', price = 0, stock = 0, image = '' } = req.body;
  if (!title || price == null) return res.status(400).json({ error: 'title and price required' });
  const product = { id: NEXT_PRODUCT_ID++, title, description, price: Number(price), stock: Number(stock), image };
  PRODUCTS.push(product);
  res.json({ success: true, product });
});

// Mock checkout
app.post('/api/checkout', (req, res) => {
  const { cart = [], customer = {} } = req.body;
  if (!Array.isArray(cart) || cart.length === 0) return res.status(400).json({ error: 'Cart empty' });

  // validate stock & compute total
  let total = 0;
  for (const item of cart) {
    const p = PRODUCTS.find(x => x.id === item.id);
    if (!p) return res.status(404).json({ error: `Product ${item.id} not found` });
    if (p.stock < item.qty) return res.status(400).json({ error: `${p.title} out of stock` });
    total += p.price * item.qty;
  }

  // reduce stock
  for (const item of cart) {
    const p = PRODUCTS.find(x => x.id === item.id);
    p.stock -= item.qty;
  }

  const order = { id: ORDERS.length + 1, cart, total, customer, created_at: new Date().toISOString() };
  ORDERS.push(order);

  res.json({ success: true, order });
});

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// Listen
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
