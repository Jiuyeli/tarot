import crypto from 'crypto';
import { createOrder, generateOrderNo } from '../lib/store.js';

// 易支付配置
const PAY_CONFIG = {
  pid: '3995',
  key: 'eMuHaThDYh3vGDRSsLgQyw5Oq32IcOBg',
  submit_url: 'https://www.ezfpy.cn/submit.php',
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

function md5(str) {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

/**
 * 创建跳转支付订单
 * POST /api/pay  body: { price, title, type }
 *
 * type: 'alipay' | 'wxpay'
 * 返回签名好的参数，前端自行构建表单 POST 到 submit.php
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, msg: 'Method not allowed' });
  }

  const { price, title, type } = req.body;
  if (!price || !title || !type) {
    return res.status(400).json({ ok: false, msg: '缺少 price、title 或 type 参数' });
  }

  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({ ok: false, msg: '金额不合法' });
  }

  const priceInCent = Math.round(numPrice * 100);
  const orderNo = generateOrderNo();

  try {
    createOrder(orderNo, priceInCent, title);

    // 支付成功后跳回站点，附上 orderNo 供前端检测
    const action = (title === '塔罗牌打赏') ? 'donate' : 'pay';
    const returnUrl = `https://www.starot.xyz/?action=${action}&orderNo=${orderNo}`;

    const payParams = {
      pid: PAY_CONFIG.pid,
      type,
      out_trade_no: orderNo,
      notify_url: PAY_CONFIG.notify_url,
      return_url: returnUrl,
      name: title,
      money: numPrice.toFixed(2),
    };

    const signStr = getSignString(payParams);
    payParams.sign = md5(signStr + PAY_CONFIG.key);
    payParams.sign_type = 'MD5';

    res.json({
      ok: true,
      submitUrl: PAY_CONFIG.submit_url,
      params: payParams,
      orderNo,
      price: numPrice,
    });
  } catch (err) {
    console.error('[pay] 异常:', err.message);
    res.status(500).json({ ok: false, msg: err.message });
  }
}
