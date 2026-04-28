/**
 * Payment Service Layer
 * Abstract payment gateway implementations for Momo, VNPay, COD
 */

const crypto = require('crypto');
const qs = require('qs'); // dùng qs.stringify giống official VNPay NodeJS sample

// Helper: sắp xếp object theo key alphabet (VNPay yêu cầu)
function sortObject(obj) {
  const sorted = {};
  Object.keys(obj).sort().forEach(key => { sorted[key] = obj[key]; });
  return sorted;
}

// === COD (Cash on Delivery) ===
const codGateway = {
  name: 'cod',
  initiate: async (config) => {
    // COD không cần session – order được tạo ngay với paymentStatus = 'pending'
    // Khi admin xác nhận thanh toán, status chuyển sang 'paid'
    return {
      success: true,
      method: 'cod',
      message: 'Đơn hàng đã tạo. Vui lòng thanh toán khi nhận hàng.'
    };
  },
  verifyCallback: () => {
    // COD không có webhook
    throw new Error('COD không hỗ trợ callback verification');
  }
};

// === Momo Gateway (MCCv2 API) ===
const momoGateway = {
  name: 'momo',
  initiate: async (config) => {
    const {
      amount,
      orderId,
      orderInfo = 'Thanh toán đơn hàng',
      redirectUrl = process.env.MOMO_RETURN_URL || 'http://localhost:3000/payment/callback',
      ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payment/callback'
    } = config;

    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMOXXXXXX';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'access_key_test';
    const secretKey = process.env.MOMO_SECRET_KEY || 'secret_key_test';
    const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

    const requestId = `${Date.now()}`;
    const requestType = 'captureWallet';
    
    // Build signature (theo Momo API spec)
    const signatureData = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(signatureData)
      .digest('hex');

    const payload = {
      partnerCode,
      partnerName: 'Perfume Shop',
      partnerUserId: 'perfume_shop',
      accessKey,
      requestId,
      amount,
      orderId: String(orderId),
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData: '',
      requestType,
      signature,
      lang: 'vi'
    };

    // Gọi Momo Sandbox API (v2)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Momo API error ${response.status}: ${errText}`);
    }

    const momoRes = await response.json();

    // resultCode = 0 là thành công, Momo trả về payUrl
    if (momoRes.resultCode !== 0) {
      throw new Error(`Momo từ chối: [${momoRes.resultCode}] ${momoRes.message}`);
    }

    return {
      success: true,
      method: 'momo',
      orderId,
      amount,
      requestId,
      paymentLink: momoRes.payUrl,   // URL redirect sang Momo
      deeplink: momoRes.deeplink,    // mở app Momo (optional)
      qrCodeUrl: momoRes.qrCodeUrl,  // QR code image URL
      signature
    };
  },

  verifyCallback: (callbackPayload) => {
    const secretKey = process.env.MOMO_SECRET_KEY || 'secret_key_test';
    
    // Rebuild signature from callback
    const {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo = '',
      extraData = '',
      transId,
      resultCode,
      message,
      responseTime,
      payType,
      signature
    } = callbackPayload;

    const signatureData = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(signatureData)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid Momo callback signature');
    }

    // resultCode = 0 means success
    return {
      success: resultCode === 0 || resultCode === '0',
      method: 'momo',
      orderId,
      transId,
      amount,
      message,
      resultCode
    };
  }
};

// === VNPay Gateway ===
const vnpayGateway = {
  name: 'vnpay',
  initiate: async (config) => {
    const {
      amount,
      orderId,
      orderInfo = 'Thanh toan don hang', // KHÔNG dấu, KHÔNG ký tự đặc biệt theo yêu cầu VNPay
      ipAddress = '127.0.0.1',
      returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/callback'
    } = config;

    const tmnCode   = process.env.VNPAY_TMN_CODE    || 'TMNCODE0000';
    const hashSecret = process.env.VNPAY_HASH_SECRET || 'hash_secret_test';
    const vnpayEndpoint = process.env.VNPAY_ENDPOINT || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const ipnUrl = process.env.VNPAY_IPN_URL || '';

    // Tạo ngày theo timezone GMT+7 (VNPay yêu cầu)
    const now = new Date();
    const createDate = now.toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' })
      .replace(/[-: ]/g, '').slice(0, 14);

    let vnp_Params = {
      vnp_Version:   '2.1.0',
      vnp_Command:   'pay',
      vnp_TmnCode:   tmnCode,
      vnp_Locale:    'vn',
      vnp_CurrCode:  'VND',
      vnp_TxnRef:    String(orderId),
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount:    Math.round(amount * 100), // nhân 100 để bỏ phần thập phân
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr:    ipAddress,
      vnp_CreateDate: createDate,
    };
    // Lọc bỏ field null/undefined trước khi ký
    vnp_Params = Object.fromEntries(
      Object.entries(vnp_Params).filter(([_, v]) => v != null && v !== '')
    );

    // Sắp xếp tham số theo alphabet (bắt buộc của VNPay)
    vnp_Params = sortObject(vnp_Params);

    // Tính chữ ký: dùng URLSearchParams (encodes spaces=+, :/= %3A%2F)
    // → match với cách VNPay verify phía server (PHP urlencode style)
    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // 🔍 DEBUG
    console.log('\n=== VNPay DEBUG ===');
    console.log('SecretKey length:', hashSecret.length);
    console.log('SIGN DATA:', signData);
    console.log('HASH:', signed);
    console.log('===================\n');

    // Build URL với cùng encoding
    const urlParams = new URLSearchParams({ ...vnp_Params, vnp_SecureHash: signed });
    const paymentUrl = vnpayEndpoint + '?' + urlParams.toString();

    console.log('PAYMENT URL:', paymentUrl);

    return {
      success: true,
      method: 'vnpay',
      orderId,
      amount,
      paymentUrl,
      secureHash: signed
    };
  },

  verifyCallback: (callbackParams) => {
    const hashSecret = process.env.VNPAY_HASH_SECRET || 'hash_secret_test';

    const secureHash = callbackParams['vnp_SecureHash'];

    // Xoá vnp_SecureHash và vnp_SecureHashType trước khi tính lại
    let params = { ...callbackParams };
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    params = sortObject(params);

    // Tính lại chữ ký — dùng qs.stringify encode:false giống bên initiate
    const signData = qs.stringify(params, { encode: false });
    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (signed !== secureHash) {
      throw new Error('Invalid VNPay callback signature');
    }

    // vnp_ResponseCode === '00' là thành công
    const isSuccess = callbackParams.vnp_ResponseCode === '00';
    return {
      success: isSuccess,
      method: 'vnpay',
      orderId: callbackParams.vnp_TxnRef,
      transactionNo: callbackParams.vnp_TransactionNo,
      amount: Number(callbackParams.vnp_Amount) / 100,
      message: isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại',
      responseCode: callbackParams.vnp_ResponseCode
    };
  }
};

// === Gateway Router ===
const gateways = {
  cod: codGateway,
  momo: momoGateway,
  vnpay: vnpayGateway
};

module.exports = {
  async initiate(method, config) {
    const gateway = gateways[method];
    if (!gateway) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return gateway.initiate(config);
  },

  verifyCallback(method, payload) {
    const gateway = gateways[method];
    if (!gateway) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return gateway.verifyCallback(payload);
  },

  availableMethods: () => Object.keys(gateways)
};
