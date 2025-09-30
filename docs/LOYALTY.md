# Loyalty Program

Mục tiêu: tăng giữ chân khách và tăng giá trị đơn hàng trung bình (AOV) bằng tích điểm và ưu đãi combo.

## Quy tắc tích điểm
- Tính theo VND: 1 điểm cho mỗi 10.000₫ đã chi (sau chiết khấu).
- Trên FE (demo), giỏ hàng đang hiển thị giá USD. Để ước tính điểm, hệ thống quy đổi tạm: 1 USD ≈ 25.000₫.
- Điểm được cộng khi tạo đơn COD thành công.

## Hạng thành viên (Tier)
- None: < 500 điểm
- Silver: ≥ 500 điểm
- Gold: ≥ 1.000 điểm
- VIP: ≥ 2.000 điểm

Hạng được tính lại sau mỗi lần cộng điểm.

## Ưu đãi combo Mini
- Khi giỏ có từ 3 chai "mini" trở lên, giảm 10% trên tổng tiền các sản phẩm mini.
- Cách nhận diện mini (demo): tên sản phẩm chứa "mini" (không phân biệt hoa thường).

## UI/UX hiện có
- Navbar: hiển thị Tier và Points (lấy từ API `/api/me` nếu có, nếu không thì fallback localStorage theo người dùng đang đăng nhập FE).
- Checkout: hiển thị Tạm tính, Giảm combo, Thành tiền và ước tính điểm nhận được.

## Lưu trữ demo (FE-only)
- Điểm và tier được lưu localStorage theo khóa `loyalty_points_<username>`.
- Khi có backend đầy đủ, nên chuyển sang cập nhật điểm/tier trên server và đọc từ `/api/me`.

## Hướng phát triển
- Hiển thị tiến độ lên hạng kế tiếp và ưu đãi theo từng hạng.
- Cho phép đổi điểm lấy mã giảm giá.
- Gắn cờ `isMini` trong data sản phẩm thay vì dò theo tên.
- Khi tích hợp backend: dùng user từ JWT, cộng điểm trên POST /api/orders, đồng bộ `/api/me`.
