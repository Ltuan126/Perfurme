// Kết nối MongoDB bằng Mongoose
const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/perfume'; // Kết nối tới database Perfume

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Kết nối MongoDB thành công!'))
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err));

module.exports = mongoose;
