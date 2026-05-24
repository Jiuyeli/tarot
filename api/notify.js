import AlipaySdk from 'alipay-sdk';
import { getOrder, markOrderPaid } from '../lib/store.js';

const alipay = new AlipaySdk({
  appId: '2021006156661454',
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDcRNgsHo+KzzIykGhg5TUs5Hsum33MimWzH3bFbkXERWWciEN0z3O9De71meVck4C10zHE3HN8YEpUtIPoN7lpFOTKalY2/exnFKcpn9zvF1jplEC3S2CXng5QW4RejOeKc8ThcwknpY4P+PK9Fhkllr6gSSa+7fDTV9wN7yz8ucRGntDp9dMYAFP2I/UehZ1M5zuhcOY/NMd0D5115SLaCpw0c+DnkdUN4ecYy2E5VotKklzaP1Ox/9Fvsa26WMNytyiigQdflo7HeR/0N/ym+p+8fi+GzeCMbLUdC8r58/bF0br7+lZ12YZ28CiPo/uvej7Si98prfyHQnp1CaWDAgMBAAECggEAee0tz/Y2tLqOacjfzkryDWCIAzuU/gTZ2LYg85Zfzg4v+d6/oEg5I7wzuwWuHXmUtJEsKnFxB7bxTkQCBCfcXRtwrc8A3D3gfwrCoVrZXAuLbvhefleeJy8Zc0fFVOUgQdZlc/pOZgDRS2wdSaeS0ejIqkbzyJpDRWmL6LatK1LN28yjzHb+E04mzr/avM8n+p8LbSRjyh6naPFE+qaLvdXN2RQiERcCVoNQhQfBlKQtumXWI4xDowGWNxfR3UodUbeD+lUdF0DPOp5tE2NvAjoorTvqr+x4DLqHLzWNM1cpAqdiPN+Zz9dDT7VLumr28jAd4PivntxuZdbNGeEZUQKBgQD6dom7O8/LTKmZaHesV9Q2qO61EEQqf35OF/ay3egZTh0Xh1dQwaHOumETXuelZUJEDdMqQ/lFzAxEQHQcsq7GcVy8bvqjn27K+SfFxRLM9ctDRQFCGzXxXFCQX1PqqTQYYF5f2VxZG9bNyMTiLn3yLxf0TAYKNVjWMYZUPHN6CwKBgQDhI21GybMn5MUagW6KcTGBN9FjYzcLO7R1ia32wM7yTHuzf75TS7SC94xg+twWPM3T1xi3b5QLfW5sVIyzsTYN/9DlA9WZcXyXZsS/WEo5hlBNlpVLjy4N2S/lakQpq/hpmazgeM2arE6A4eCIe5B8j89Ienc786lvOtjbWbslaQKBgEQq8Q+ZltOhOOO88B1jBioeTmHPXI4ohwrgMM+738jLXtWhi106Zjyqs3MfOHLmnWOCU7/EIlshzxDgbfnFlBYEkpXiqqrP4Mqzh2SnX5eTKlBTvqTsXQEk+/RfTaqnhLtBt03lDeJe1lbJ1vQsbTD2KlHeQyKSJGyfrAzPKyrDAoGBAJlMty75Tp1+f9vhgDSSiOP07wXe2+8xM1rJagRYG1IPVDfQZvdu2DZJe3PZvR0DQB/cGf9l4YfFW/g1xizhIO59X29hogM+rFinaJbl9nyfAXUjcPsnPnO9jIiJSGqbp6W4N2gNuep1I2tM4sfsY2D9x2YRxbiz3I5ZoqoRuoXpAoGBAM/l0pT9BLy/Q7t8dROCDdjkDjQdsmLCdSR6GQNS096BH0puz2T3OHV4xchb6Qs43qm5kZxkr4J2G3GNWuD49zYLLyAVc5ClG/Iexe7bKPYrPsesR0AH4kj+PRNW0k5y/aJEtyGaEFWnKmNK0C7l3tW8O24I7jnp1q3kYRR5Y6Te
-----END PRIVATE KEY-----`,

  alipayPublicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv3ZmU/1m1JYV2tNn79PagX6LfBHvrgaziMrOQWk0Gs/00hl/NZ3enTD0nJXYVNRydsdeQh3umEyyVHe7EM5QhQ+lvQowG3amEea3tvAvHRs8dglrBJKW/R7OhTRZMVFeILlDoOVJj7ymAC9la8RghwN1GVQQuNVC0mMmnPCBWjgWrFdp56MXeAIMtP6nlV+Y2JPOf6t6KydpTBB/1mrGT4W38coalyKEUhJqmmzdsZq4kbMfzk1LTvcr6qcVuTde7E7FPcZ5xFvGI13pbd6z1s0oJrzSW4S/e/AQcTKG+fDvOl9ojRTnWWr0wAKeKR4Ni4LdC6tQ0CjsOBrXhWuCAwIDAQAB
-----END PUBLIC KEY-----`,

  gateway: 'https://openapi.alipay.com/gateway.do',
});

/**
 * 支付宝异步通知处理
 * 支付宝在用户付款后会 POST 到此接口，包含 trade_status、out_trade_no、total_amount 等参数
 *
 * 安全要点：
 * 1. 验签 — 确认请求来自支付宝
 * 2. 金额校验 — 对比存储的订单金额和支付宝返回的 total_amount
 * 3. 幂等性 — 支付宝 24 小时内会重试 8 次，已处理的订单直接返回 success
 */
export default async function handler(req, res) {
  // 只接受 POST
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // ========== 1. 验签 ==========
  let signVerified = false;
  try {
    signVerified = alipay.checkNotifySign(req.body);
  } catch (err) {
    console.error('[notify] 验签异常:', err.message);
    return res.send('fail');
  }

  if (!signVerified) {
    console.error('[notify] 验签失败');
    return res.send('fail');
  }

  // ========== 2. 提取回调参数 ==========
  const {
    out_trade_no,     // 商户订单号
    total_amount,     // 交易金额（元）
    trade_status,     // 交易状态
    trade_no,         // 支付宝交易号
  } = req.body;

  // 只处理交易成功状态
  if (trade_status !== 'TRADE_SUCCESS') {
    console.log(`[notify] 非成功状态: ${trade_status}, orderNo=${out_trade_no}`);
    return res.send('success'); // 返回 success 避免支付宝重试
  }

  if (!out_trade_no || !total_amount) {
    console.error('[notify] 缺少关键参数');
    return res.send('fail');
  }

  // ========== 3. 查存储的订单 ==========
  const storedOrder = getOrder(out_trade_no);
  if (!storedOrder) {
    // 订单不在我们系统中 — 可能因 Vercel 冷启动/多实例导致数据丢失
    console.error(`[notify] 订单不存在: outTradeNo=${out_trade_no}, tradeNo=${trade_no}, amount=${total_amount}。可能原因：Vercel 实例冷启动导致临时存储丢失，或多实例部署数据不互通。`);
    return res.send('fail');
  }

  // ========== 4. 幂等性检查 ==========
  if (storedOrder.status === 'paid') {
    console.log(`[notify] 订单已处理(幂等): ${out_trade_no}`);
    return res.send('success');
  }

  // ========== 5. 金额校验（整数分比对，避免浮点精度） ==========
  const notifyAmountCent = Math.round(parseFloat(total_amount) * 100);
  if (storedOrder.priceInCent !== notifyAmountCent) {
    console.error(
      `[notify] 金额不一致! 订单=${out_trade_no}, ` +
      `存储=${storedOrder.priceInCent}分, 回调=${notifyAmountCent}分`
    );
    return res.send('fail');
  }

  // ========== 6. 标记已支付 ==========
  const result = markOrderPaid(out_trade_no);
  if (!result.success) {
    console.error(`[notify] 标记支付失败: ${out_trade_no}`);
    return res.send('fail');
  }

  console.log(`[notify] ✅ 支付成功! 订单=${out_trade_no}, 金额=${notifyAmount}, 支付宝交易号=${trade_no}`);
  return res.send('success');
}
