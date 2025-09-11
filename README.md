# Perfume Shop - MERN Stack Project

## Mô tả
Đây là ứng dụng web bán nước hoa với các chức năng:
- Đăng ký/Đăng nhập người dùng
- Đăng nhập admin (admin/admin)
- CRUD sản phẩm (chỉ admin)
- Giỏ hàng, xem chi tiết sản phẩm
- Kết nối MongoDB local hoặc Atlas

## Cài đặt
1. **Clone repo & cài dependencies**
   ```
   npm install
   ```
2. **Cài đặt MongoDB**
   - Cài MongoDB Community hoặc dùng MongoDB Atlas
   - Đảm bảo MongoDB đang chạy (Compass kết nối được)

3. **Cấu hình kết nối database**
   - Mặc định kết nối: `mongodb://localhost:27017/perfume`
   - Sửa file `src/db.js` nếu muốn đổi URI

4. **Import dữ liệu mẫu**
   ```
   node src/importProducts.js
   ```

5. **Chạy backend**
   ```
   node src/server.js
   ```

6. **Chạy frontend**
   ```
   npm start
   ```

7. **Truy cập ứng dụng**
   - Mặc định: http://localhost:3000

## Tài khoản mẫu
- **Admin:**
  - Username: `admin`
  - Password: `admin`
- **User:**
  - Đăng ký mới trên giao diện

## Thư mục chính
- `src/server.js`: API backend
- `src/db.js`: Kết nối MongoDB
- `src/importProducts.js`: Import dữ liệu mẫu
- `src/components/`: Giao diện React

## Liên hệ
- Tác giả: Ltuan126
- Email: (bổ sung nếu cần)
