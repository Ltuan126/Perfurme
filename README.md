# Perfume Shop - MERN Stack

Một ứng dụng e-commerce đơn giản về nước hoa với giao diện hiện đại (Tailwind) và backend MongoDB/Express. Phù hợp để học và trình diễn dự án cá nhân.

## 🚀 Live Demo
- (Sắp có) – có thể deploy lên Vercel/Netlify (frontend) và Render/Railway (backend).

## ✨ Chức năng
- Danh sách và chi tiết sản phẩm, responsive UI.
- Tìm kiếm (search) theo tên/mô tả sản phẩm.
- Giỏ hàng, đặt hàng COD (lưu đơn hàng vào DB).
- Đăng ký/Đăng nhập user (localStorage demo).
- Admin: thêm/sửa/xóa sản phẩm.

## 🛠️ Tech Stack
- Frontend: React, React Router, Tailwind CSS.
- Backend: Node.js, Express.
- Database: MongoDB, Mongoose.

## 📦 Yêu cầu môi trường
- Node.js >= 16
- MongoDB (Local hoặc Atlas)

## ⚙️ Cài đặt & Chạy
1) Cài dependencies
```
npm install
```

2) Cấu hình DB
- Mặc định URI: `mongodb://localhost:27017/perfume`
- Có thể chỉnh trong `src/db.js` để trỏ tới MongoDB Atlas.

3) Khởi chạy MongoDB
- Đảm bảo mongod đang chạy (Compass kết nối OK).

4) Import dữ liệu mẫu (tùy chọn)
```
node src/importProducts.js
```

5) Chạy backend
```
node src/server.js
```

6) Chạy frontend
```
npm start
```

Ghi chú:
- `package.json` đã cấu hình proxy tới backend tại `http://localhost:5000` để gọi `/api/*` từ frontend trong dev.

## 🔐 Tài khoản mẫu
- Admin: `admin` / `admin`
- User: tự đăng ký trên giao diện

## 📂 Cấu trúc chính
- `src/server.js`: REST API (products, orders)
- `src/db.js`: Kết nối MongoDB
- `src/models/`: Schema (Product, Order)
- `src/importProducts.js`: Seed dữ liệu sản phẩm mẫu
- `src/components/`: UI React (Home, Products, About, Contact, Cart, Admin, …)
- `src/index.css`: Tailwind + helper classes (btn-primary, glass, …)

## 📝 Ghi chú Git
Nếu gặp lỗi push non-fast-forward:
```
git fetch origin
git rebase origin/main
# Nếu conflict: sửa file rồi
git add <file>
git rebase --continue
git push origin main
```

## 📧 Liên hệ
- Tác giả: Ltuan126
- Email: (bổ sung nếu cần)
