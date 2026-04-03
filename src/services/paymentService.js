/**
 * Payment Service Layer
 * Abstract payment gateway implementations for Momo, VNPay, COD
 * 
 * Usage:
 *   const paymentService = require('.../paymentService');
 *   const session = await paymentService.initiate('momo', { amount, orderId, ... });
 *   const verified = paymentService.verifyCallback('momo', webhookPayload);
 */

const crypto = require('crypto');

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
    const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/gw_payment/transactionProcessor';

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

    // Momo API call (mock for now, real call needs actual API)
    // const response = await fetch(endpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // }).then(r => r.json());

    // Return payment link (real implementation would get from Momo API)
    return {
      success: true,
      method: 'momo',
      orderId,
      amount,
      requestId,
      paymentLink: `${endpoint}?partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}`,
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
      orderInfo = 'Thanh toan don hang',
      ipAddress = '127.0.0.1',
      returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/callback'
    } = config;

    const tmnCode = process.env.VNPAY_TMN_CODE || 'TMNCODE0000';
    const hashSecret = process.env.VNPAY_HASH_SECRET || 'hash_secret_test';
    const vnpayEndpoint = process.env.VNPAY_ENDPOINT || 'https://sandbox.vnpayment.vn/paymentv2/Transaction/BillDetail';

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: Math.round(amount * 100), // VNPay expects in cents
      vnp_CurrCode: 'VND',
      vnp_TxnRef: String(orderId),
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)
    };

    // Build query string
    const vnp_ParamsSorted = Object.keys(vnp_Params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnp_Params[key];
        return acc;
      }, {});

    const queryString = Object.entries(vnp_ParamsSorted)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');
    const vnp_SecureHash = signed;

    const paymentUrl = `${vnpayEndpoint}?${queryString}&vnp_SecureHash=${vnp_SecureHash}`;

    return {
      success: true,
      method: 'vnpay',
      orderId,
      amount,
      paymentUrl,
      secureHash: vnp_SecureHash
    };
  },

  verifyCallback: (callbackParams) => {
    const hashSecret = process.env.VNPAY_HASH_SECRET || 'hash_secret_test';
    
    // Extract secure hash
    const vnp_SecureHash = callbackParams.vnp_SecureHash;
    
    // Remove secure hash from params and rebuild signature
    const params = { ...callbackParams };
    delete params.vnp_SecureHash;

    const vnp_ParamsSorted = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    const queryString = Object.entries(vnp_ParamsSorted)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

    if (signed !== vnp_SecureHash) {
      throw new Error('Invalid VNPay callback signature');
    }

    // vnp_ResponseCode = '00' means success
    const isSuccess = callbackParams.vnp_ResponseCode === '00';

    return {
      success: isSuccess,
      method: 'vnpay',
      orderId: callbackParams.vnp_TxnRef,
      transactionNo: callbackParams.vnp_TransactionNo,
      amount: Number(callbackParams.vnp_Amount) / 100,
      message: callbackParams.vnp_ResponseCode === '00' ? 'Thanh toán thành công' : 'Thanh toán thất bại',
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
