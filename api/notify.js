import crypto from 'crypto';
import { getOrder, markOrderPaid } from '../lib/store.js';

// 易支付配置（与 pay.js 一致）
const PAY_CONFIG = {
  pid: 3995,
  key: 'eMuHaThDYh3vGDRSsLgQyw5Oq32IcOBg',
};

function md5(str) {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

/**
 * 易支付异步通知回调
 * POST /api/notify
 *
 * 验签 → 验证商户 → 验证状态 → 验证金额 → 标记已支付
 * 返回纯文本 'success' 或 'fail'（易支付要求）
 */
export default async function handler(req, res) {
  // 易支付回调是 form-urlencoded，Vercel 自动解析到 req.body
  const params = { ...req.body };

  try {
    // 1. 提取签名并验证
    const receivedSign = params.sign;
    if (!receivedSign) {
      return res.status(200).send('fail');
    }

    // 构建验签参数（排除 sign 和 sign_type）
    const signParams = {};
    for (const key in params) {
      if (key !== 'sign' && key !== 'sign_type' && params[key] !== '' && params[key] !== null) {
        signParams[key] = params[key];
      }
    }
    const signStr = Object.keys(signParams).sort().map(k => `${k}=${signParams[k]}`).join('&');
    const expectedSign = md5(signStr + PAY_CONFIG.key);

    if (expectedSign !== receivedSign) {
      console.error('[notify] 验签失败');
      return res.status(200).send('fail');
    }

    // 2. 验证商户 ID
    if (parseInt(params.pid) !== PAY_CONFIG.pid) {
      console.error('[notify] pid 不匹配:', params.pid);
      return res.status(200).send('fail');
    }

    // 3. 验证交易状态
    if (params.trade_status !== 'TRADE_SUCCESS') {
      // 非成功状态也返回 success，避免易支付重复通知
      return res.status(200).send('success');
    }

    // 4. 查询订单
    const outTradeNo = params.out_trade_no;
    const storedOrder = await getOrder(outTradeNo);
    if (!storedOrder) {
      console.error('[notify] 订单不存在:', outTradeNo);
      return res.status(200).send('fail');
    }

    // 5. 验证金额（整数分对比，避免浮点精度）
    const notifyAmountInCent = Math.round(parseFloat(params.money) * 100);
    if (notifyAmountInCent !== storedOrder.priceInCent) {
      console.error('[notify] 金额不匹配:',
        '通知=', notifyAmountInCent, '分', '订单=', storedOrder.priceInCent, '分');
      return res.status(200).send('fail');
    }

    // 6. 标记已支付（幂等）
    const result = await markOrderPaid(outTradeNo);
    if (!result.success) {
      console.error('[notify] 标记支付失败:', outTradeNo);
      return res.status(200).send('fail');
    }

    console.log('[notify] 支付成功:', outTradeNo);
    return res.status(200).send('success');
  } catch (err) {
    console.error('[notify] 异常:', err.message);
    return res.status(200).send('fail');
  }
}
