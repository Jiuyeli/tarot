import crypto from 'crypto';
import { createOrder, generateOrderNo } from '../lib/store.js';

// 易支付配置
const PAY_CONFIG = {
  pid: '3995',
  key: 'eMuHaThDYh3vGDRSsLgQyw5Oq32IcOBg',
  gateway: 'https://www.ezfpy.cn/mapi.php',
  notify_url: 'https://www.starot.xyz/api/notify',
};

/**
 * 按 ASCII 升序排序参数，拼接签名源串
 */
function getSignString(params) {
  const filtered = {};
  for (const key in params) {
    const val = params[key];
    if (val !== '' && val !== null && val !== undefined && key !== 'sign' && key !== 'sign_type') {
      filtered[key] = val;
    }
  }
  return Object.keys(filtered).sort().map(k => `${k}=${filtered[k]}`).join('&');
}

/**
 * MD5 签名
 */
function md5(str) {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

/**
 * 创建支付订单
 * POST /api/pay  body: { price, title }
 *
 * 协议不变：{ ok: true, qrCode, orderNo, price } | { ok: false, msg }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, msg: 'Method not allowed' });
  }

  const { price, title } = req.body;
  if (!price || !title) {
    return res.status(400).json({ ok: false, msg: '缺少 price 或 title 参数' });
  }

  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({ ok: false, msg: '金额不合法' });
  }

  const priceInCent = Math.round(numPrice * 100);
  const orderNo = generateOrderNo();

  try {
    // 存储订单
    createOrder(orderNo, priceInCent, title);

    // 构造支付参数
    const payParams = {
      pid: PAY_CONFIG.pid,
      type: 'alipay',
      out_trade_no: orderNo,
      notify_url: PAY_CONFIG.notify_url,
      return_url: 'https://www.starot.xyz',
      name: title,
      money: numPrice.toFixed(2),
    };

    // MD5 签名
    const signStr = getSignString(payParams);
    payParams.sign = md5(signStr + PAY_CONFIG.key);
    payParams.sign_type = 'MD5';

    // POST to 易支付
    const bodyParams = new URLSearchParams(payParams).toString();
    const resp = await fetch(PAY_CONFIG.gateway, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams,
    });

    const result = await resp.json();

    // 调试日志：打印完整响应
    console.log('[pay] 易支付响应:', JSON.stringify(result));

    // 易支付成功标志可能是 code===200 或 status==='SUCCESS' 等，需根据实际文档调整
    if (result.code === 200 || result.status === 'SUCCESS' || (result.code_url || result.qrcode)) {
      res.json({
        ok: true,
        qrCode: result.code_url || result.qrcode,
        orderNo,
        price: numPrice,
      });
    } else {
      console.error('[pay] 易支付下单失败:', result.code, result.msg);
      // 如果 msg 包含"成功"但 code 不对，可能是接口返回格式问题
      const errorMsg = result.msg || `下单失败 (${result.code})`;
      res.json({ ok: false, msg: errorMsg });
    }
  } catch (err) {
    console.error('[pay] 异常:', err.message);
    res.json({ ok: false, msg: err.message });
  }
}
