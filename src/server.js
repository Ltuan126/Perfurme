const express = require('express');
const mongoose = require('./db');
const Product = require('./models/Product');
const authRoutes = require('./routes/auth');
const { authRequired, requireRole } = require('./middleware/auth');
const cors = require('cors');

// Đơn hàng (đơn giản, COD)
const orderSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  cart: [{ name: String, price: Number, quantity: { type: Number, default: 1 } }],
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', orderSchema);

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
const reviewRoutes = require('./routes/review');
app.use('/api/reviews', reviewRoutes);
const qaRoutes = require('./routes/qa');
app.use('/api/qas', qaRoutes);

// Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Lấy chi tiết sản phẩm
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'ID không hợp lệ' });
  }
});

// Thêm sản phẩm (admin)
app.post('/api/products', authRequired, requireRole('admin'), async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});

// Sửa sản phẩm (admin)
app.put('/api/products/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'ID không hợp lệ' });
  }
});

// Xóa sản phẩm (admin)
app.delete('/api/products/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (err) {
    res.status(400).json({ message: 'ID không hợp lệ' });
  }
});

// Tạo đơn COD
app.post('/api/orders', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: 'Không tạo được đơn hàng' });
  }
});

// Lấy danh sách đơn (admin)
app.get('/api/orders', authRequired, requireRole('admin'), async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// Cập nhật trạng thái đơn (admin)
app.put('/api/orders/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'ID không hợp lệ' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));
