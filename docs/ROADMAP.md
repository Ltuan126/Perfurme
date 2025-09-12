# Perfume Shop Roadmap

Một lộ trình tối ưu để nâng cấp dự án thành sản phẩm cá nhân chuyên nghiệp phục vụ phỏng vấn.

---
## 1. Kiến trúc & Tổ chức Mã
Tách backend theo layers:
```
src/
  config/
  models/
  routes/
  controllers/
  services/
  middleware/
  utils/
```
Thêm: error handler tập trung, config loader (.env), chuẩn hóa response.

---
## 2. Xác thực & Phân quyền (JWT)
- User model: username (unique), passwordHash (bcrypt), role (user/admin).
- Đăng ký / đăng nhập trả về Access Token (15m) + Refresh Token (7d) (tùy chọn).
- Middleware: authRequired, requireRole('admin').
- Lưu Refresh token HttpOnly cookie, Access token ở memory.

---
## 3. Validation & Bảo mật
- Zod/Joi schemas cho body.
- Helmet, rate limiting (auth routes), input sanitize.
- Ẩn stack trace ở production.
- Chuẩn hoá lỗi (mã & message).

---
## 4. Pagination & Search Sản phẩm
Endpoint mẫu:
```
GET /api/products?page=1&limit=12&search=rose&minPrice=100000&maxPrice=500000&sort=price:asc
```
Response:
```json
{
  "data": [...],
  "meta": { "page":1, "limit":12, "total":124, "totalPages":11 }
}
```
Mongo Index:
```
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ price: 1 })
```

---
## 5. Stock & Order Flow
- Thêm field `stock` vào Product.
- Khi pending -> confirmed: trừ stock.
- Nếu stock < quantity: từ chối.
- Trạng thái chuẩn: pending → confirmed → shipped → completed | canceled.
- Transition guard middleware.

---
## 6. UI/UX Cải thiện
- Logout rõ ràng.
- Skeleton loading.
- Toast notifications (react-hot-toast).
- Format tiền: Intl.NumberFormat('vi-VN',{currency:'VND'}).
- Accessible focus states.
- Protected routes (admin / user).

---
## 7. Testing
- Jest + Supertest: auth, products CRUD, order status.
- React Testing Library: ProductList, Cart, Auth form.
- (Optional) Playwright: end-to-end flow.

---
## 8. Hiệu năng & Caching
- Compression (gzip/brotli).
- HTTP caching (ETag / Last-Modified) cho GET products.
- Redis (optional) cho: top products, search phổ biến.
- Debounce search client.

---
## 9. Logging & Observability
- Winston logger (dev: pretty, prod: json).
- Request ID (uuid) middleware.
- Error logger (message, path, userId, stack dev).
- (Optional) Sentry integration.

---
## 10. Triển khai & DevOps
- Dockerfile backend & frontend.
- docker-compose: api + mongo (+ redis optional).
- ENV phân tách: `.env.example`.
- Deploy: Render/Railway (API) + Vercel/Netlify (Frontend).
- GitHub Actions: lint → test → build → (docker push) → deploy.

---
## 11. Documentation Nâng cấp
- README mở rộng: kiến trúc, diagrams (Mermaid), bảng API, trade-offs.
- ROADMAP (file này) + CHANGELOG.
- Scripts tiện ích (`seed`, `create-demo-users`).

---
## 12. TypeScript (Tùy chọn)
- Bắt đầu backend (models, controllers).
- Dời dần React sang TSX (Product, Order, Auth types).
- Extend Request với `user` typing.

---
## 13. Demo Chuẩn Phỏng Vấn
- Script seed: tạo 10 sản phẩm + 2 user (admin/user) + vài đơn.
- Ảnh chụp màn hình (Home, Product Detail, Cart, Admin Orders).
- Video ngắn (Loom) walkthrough.
- Section README: "Pitch / Highlights" (Auth, Architecture, Pagination, Stock logic).

---
## 14. Lộ trình 7 Ngày Gợi ý
| Ngày | Việc |
|------|------|
| 1 | Refactor cấu trúc + error handler + logger |
| 2 | Auth + JWT + bcrypt |
| 3 | Pagination + search + indexes |
| 4 | Stock & order status rules |
| 5 | Frontend UX (logout, skeleton, toast, protected routes) |
| 6 | Tests (API + UI) + Docker |
| 7 | Deploy + README + demo assets |

---
## 15. Giá trị Khi Trình Bày
- Clean architecture → dễ mở rộng.
- JWT + proper layered design → hiểu bảo mật & scale.
- Pagination + indexing → tư duy dữ liệu.
- Stock flow logic → xử lý nghiệp vụ.
- Test + CI/CD → chuyên nghiệp.
- Tài liệu tốt → giao tiếp rõ ràng.

---
## 16. Next Optional Nice-To-Haves
- Real-time order updates (WebSocket/SSE).
- PWA (offline + installable).
- Recommendation (gợi ý theo lượt mua, cơ bản).
- i18n (vi/en) + Dark mode.

---
## Status
(Điền dần: DONE / IN PROGRESS / TODO) cho từng mục khi triển khai.

---
**Happy building!** ✨
