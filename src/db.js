// Kết nối MongoDB bằng Mongoose
require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/perfume';

mongoose.connect(mongoURI)
  .then(() => console.log(`✅ Kết nối MongoDB thành công! (${mongoURI.includes('localhost') ? 'local' : 'cloud'})`))
  .catch((err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    process.exit(1); // Exit if DB connection fails
  });

module.exports = mongoose;
