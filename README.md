# Perfume Shop - MERN Stack

Một ứng dụng e-commerce đơn giản về nước hoa với giao diện hiện đại (Tailwind) và backend MongoDB/Express. Phù hợp để học và trình diễn dự án cá nhân.

## 🚀 Live Demo
- (Sắp có) – có thể deploy lên Vercel/Netlify (frontend) và Render/Railway (backend).

## ✨ Chức năng
- Danh sách và chi tiết sản phẩm, responsive UI.
- Tìm kiếm (search) theo tên/mô tả sản phẩm.
- Giỏ hàng, đặt hàng COD (lưu đơn hàng vào DB).
- Đăng ký / Đăng nhập với JWT (access token) – thay thế cơ chế localStorage demo cũ.
- Admin: thêm/sửa/xóa sản phẩm (bảo vệ bằng role + JWT), quản lý đơn hàng & cập nhật trạng thái.

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

## 🔐 Xác thực & Tài khoản mẫu
Hệ thống đã chuyển sang JWT.

Flow cơ bản:
1. Đăng ký: `POST /api/auth/register` body `{ username, password }`.
2. Đăng nhập: `POST /api/auth/login` trả về `{ token, user: { username, role } }`.
3. Lưu `token` ở frontend (hiện bản demo dùng localStorage: `auth_token`).
4. Gọi API admin/protected thêm header:
	 `Authorization: Bearer <token>`

Các route bảo vệ (yêu cầu admin + JWT):
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/orders`
- `PUT /api/orders/:id`

Ví dụ fetch cập nhật sản phẩm:
```
fetch('/api/products/123', {
	method: 'PUT',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
	},
	body: JSON.stringify({ name: 'New', price: 100 })
})
```

Tài khoản mẫu (nếu đã seed / tạo sẵn):
- Admin: tự tạo bằng cách đăng ký rồi sửa role trong DB (`users` collection) thành `admin`.

Lưu ý bảo mật (kế hoạch nâng cấp):
- Access token hiện exp ngắn (ví dụ 15m) – chưa có refresh token.
- Có thể chuyển từ localStorage sang httpOnly cookie để tránh XSS.
- Bổ sung rate limiting & password reset sau.

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

---
## 🔭 Roadmap
Chi tiết lộ trình phát triển nâng cao (kiến trúc, JWT, pagination, stock, testing, deploy) xem tại: [docs/ROADMAP.md](./docs/ROADMAP.md)

Ghi chú: Đã nâng cấp lên JWT. Tham khảo chi tiết roadmap để xem các bước bảo mật tiếp theo (refresh token, CSRF, rate limiting...).

---
## 🎁 Loyalty & Bundle
Quy tắc tích điểm (1 điểm mỗi 10.000₫ sau giảm) và ưu đãi combo mini (3 chai mini -10%) xem chi tiết tại: [docs/LOYALTY.md](./docs/LOYALTY.md)
