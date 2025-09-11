const products = require('./data/products').products;
const mongoose = require('./db');
const Product = require('./models/Product');

async function importProducts() {
  try {
    await Product.deleteMany({}); // Xóa hết dữ liệu cũ nếu có
    await Product.insertMany(products.map(p => ({
      name: p.name,
      price: p.price,
      description: p.description,
      image: p.image,
    })));
    console.log('Đã import dữ liệu sản phẩm vào MongoDB!');
  } catch (err) {
    console.error('Lỗi import:', err);
  } finally {
    mongoose.connection.close();
  }
}

importProducts();
