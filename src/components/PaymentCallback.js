import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
        // Get order ID from URL or stored
        let ordId = searchParams.get('orderId') || localStorage.getItem('pending_order_id');
        
        if (!ordId) {
          setStatus('failed');
          setMessage('Không tìm thấy thông tin đơn hàng');
          return;
        }

        setOrderId(ordId);

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
          setMessage(`✅ Thanh toán thành công! Đơn hàng của bạn đã được khởi tạo.`);
          localStorage.removeItem('pending_order_id');
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else if (paymentData.paymentStatus === 'failed') {
          setStatus('failed');
          setMessage('❌ Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức khác.');
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
    <section className="section">
      <div className="max-w-lg mx-auto glass p-8 rounded-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Xác nhận thanh toán</h1>
        
        {status === 'processing' && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full" />
            <p className="text-slate-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 text-emerald-700">
            <div className="text-5xl">✅</div>
            <p className="text-lg font-semibold">{message}</p>
            <p className="text-sm text-slate-600">Đang chuyển hướng về trang chủ...</p>
            {orderId && (
              <p className="text-xs text-slate-500">
                Mã đơn hàng: <span className="font-mono font-semibold">{orderId.slice(-6).toUpperCase()}</span>
              </p>
            )}
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center gap-4 text-red-600">
            <div className="text-5xl">❌</div>
            <p className="text-lg font-semibold">{message}</p>
            <button
              onClick={() => navigate('/cart')}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
            >
              Quay lại giỏ hàng
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
