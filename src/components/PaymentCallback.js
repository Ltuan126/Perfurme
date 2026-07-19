import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config/api';

export default function PaymentCallback() {
  const [status, setStatus] = useState('processing'); // processing | success | failed
  const [message, setMessage] = useState('Đang xử lý thanh toán...');
  const [orderId, setOrderId] = useState(null);
  const searchParams = useSearchParams()[0];
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // VNPay redirect về với vnp_TxnRef (= orderId); Momo/khác dùng orderId
        let ordId = searchParams.get('orderId') || searchParams.get('vnp_TxnRef');

        if (!ordId) {
          setStatus('failed');
          setMessage('Không tìm thấy thông tin đơn hàng');
          return;
        }

        setOrderId(ordId);

        // Redirect từ VNPay mang theo chữ ký → chuyển tiếp cho backend verify
        // và cập nhật trạng thái đơn (sandbox thường không có IPN server-to-server)
        if (searchParams.get('vnp_SecureHash')) {
          await fetch(`${API_BASE_URL}/api/payment/callback?method=vnpay&${searchParams.toString()}`)
            .catch(() => {});
        }

        // Check payment status
        const res = await fetch(`${API_BASE_URL}/api/payment/status/${ordId}`);
        const payload = await res.json();

        if (!res.ok || !payload.success) {
          setStatus('failed');
          setMessage('Không thể kiểm tra trạng thái thanh toán');
          return;
        }

        const paymentData = payload.data;

        if (paymentData.paymentStatus === 'paid') {
          setStatus('success');
          setMessage('Thanh toán thành công! Đơn hàng của bạn đã được khởi tạo.');

          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else if (paymentData.paymentStatus === 'failed') {
          setStatus('failed');
          setMessage('Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức khác.');
        } else {
          // Still pending
          setStatus('processing');
          setMessage('Đang chờ xác nhận thanh toán...');

          // Retry check after 3 seconds
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      } catch (err) {
        setStatus('failed');
        setMessage(`Lỗi: ${err.message}`);
      }
    };

    checkPaymentStatus();
  }, [searchParams, navigate]);

  return (
    <section className="section flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full border border-hairline p-10 text-center">
        <div className="eyebrow mb-6">Xác nhận thanh toán</div>

        {status === 'processing' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-10 h-10 border border-hairline rounded-full animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
            <p className="text-muted font-light">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="font-mono uppercase text-[11px] tracking-wider" style={{ color: 'var(--accent)' }}>✓ Thành công</div>
            <p className="font-serif text-xl text-ink">{message}</p>
            <p className="text-sm text-muted font-light">Đang chuyển hướng về trang chủ...</p>
            {orderId && (
              <p className="text-xs text-label font-mono">
                Mã đơn hàng: <span className="text-ink">{orderId.slice(-6).toUpperCase()}</span>
              </p>
            )}
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center gap-4">
            <div className="font-mono uppercase text-[11px] tracking-wider text-red-700">Thất bại</div>
            <p className="font-serif text-xl text-ink">{message}</p>
            <div className="flex gap-3 mt-2">
              <button onClick={() => navigate('/cart')} className="btn-outline">Quay lại giỏ hàng</button>
              {orderId && (
                <Link to={`/track?order=${orderId}`} className="btn-primary">Tra cứu đơn hàng</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
