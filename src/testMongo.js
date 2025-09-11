const Product = require('./models/Product');

// Thêm sản phẩm mới
async function addProduct() {
  const newProduct = new Product({
    name: 'Nước hoa mới',
    price: 1500000,
    description: 'Hương thơm quyến rũ',
    image: 'img/another-13.jpg',
  });
  await newProduct.save();
  console.log('Đã thêm sản phẩm:', newProduct);
}

// Lấy tất cả sản phẩm
async function getAllProducts() {
  const products = await Product.find();
  console.log('Danh sách sản phẩm:', products);
}

// Chạy thử
addProduct().then(getAllProducts).catch(console.error);
