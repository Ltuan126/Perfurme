const express = require('express');
const mongoose = require('./db');
const Product = require('./models/Product');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ...existing product API code...

// Đơn hàng COD
const orders = [];

// Tạo đơn hàng COD
app.post('/api/orders', (req, res) => {
  const { name, address, phone, cart } = req.body;
  if (!name || !address || !phone || !cart || !cart.length) {
    return res.status(400).json({ message: 'Thiếu thông tin đơn hàng!' });
  }
  const order = {
    id: Date.now().toString(),
    name,
    address,
    phone,
    cart,
    status: 'Chờ xác nhận',
    createdAt: new Date(),
  };
  orders.push(order);
  res.status(201).json(order);
});

// Lấy danh sách đơn hàng (admin)
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Cập nhật trạng thái đơn hàng (admin)
app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  order.status = status;
  res.json(order);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));
