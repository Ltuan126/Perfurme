const express = require('express');
const mongoose = require('./db');
const Product = require('./models/Product');
const User = require('./models/User');
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

// Loyalty helpers
function calcEarnedPoints(amount) {
  // 1 point per $10 equivalent
  return Math.floor((amount || 0) / 10);
}

function nextTier(points) {
  if (points >= 2000) return 'VIP';
  if (points >= 1000) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'None';
}

function isMini(productName = '') {
  // simple check: contains "mini" (case-insensitive)
  return /mini/i.test(productName);
}

// Tạo đơn COD (cộng điểm + bundle discount)
app.post('/api/orders', async (req, res) => {
  try {
    const body = req.body || {};
    const cart = Array.isArray(body.cart) ? body.cart : [];
    let subtotal = cart.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);

    // Bundle discount: chọn 3 chai mini -> giảm 10% trên 3 chai mini
    const miniCount = cart.reduce((n,i)=> n + (isMini(i.name) ? (Number(i.quantity)||1) : 0), 0);
    let discount = 0;
    if (miniCount >= 3) {
      const minisTotal = cart.filter(i=>isMini(i.name)).reduce((s,i)=> s + (Number(i.price)||0) * (Number(i.quantity)||1), 0);
      discount += Math.round(minisTotal * 0.10 * 100) / 100; // 10%
    }
    const total = Math.max(0, subtotal - discount);

    const order = await Order.create({ ...body, cart, subtotal, discount, total });

    // Cộng điểm nếu có user (yêu cầu gửi kèm username trong body demo)
    if (body.username) {
      const user = await User.findOne({ username: body.username });
      if (user) {
        const earned = calcEarnedPoints(total);
        const newPoints = (user.points || 0) + earned;
        const tier = nextTier(newPoints);
        user.points = newPoints;
        user.tier = tier;
        await user.save();
      }
    }
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: 'Không tạo được đơn hàng' });
  }
});

// Lấy thông tin tài khoản hiện tại (điểm + tier)
app.get('/api/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select('username role points tier');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi lấy thông tin người dùng' });
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
