import AlipaySdk from 'alipay-sdk';
import { createOrder, generateOrderNo } from './_store.js';

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
 * 创建支付宝预下单 + 存储订单
 * POST /api/pay  body: { price, title }
 *
 * price 和 title 由前端传入，服务器生成唯一订单号并存储，防止篡改。
 * 返回二维码链接 + 订单号，前端用订单号轮询支付状态。
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { price, title } = req.body;

  if (!price || !title) {
    return res.status(400).json({ ok: false, msg: '缺少 price 或 title 参数' });
  }

  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({ ok: false, msg: '金额不合法' });
  }

  // 转换为整数分存储（避免浮点精度问题）
  const priceInCent = Math.round(numPrice * 100);

  // 服务端生成唯一订单号
  const orderNo = generateOrderNo();

  try {
    // 先存储订单记录（金额以分存储）
    createOrder(orderNo, priceInCent, title);

    // 调支付宝预下单
    const result = await alipay.exec('alipay.trade.precreate', {
      notify_url: 'https://starot.xyz/api/notify',
      out_trade_no: orderNo,
      total_amount: numPrice.toFixed(2),
      subject: title,
    });

    const qrCode = result.alipay_trade_precreate_response.qr_code;

    res.json({
      ok: true,
      qrCode,
      orderNo,
      price: numPrice,
    });
  } catch (err) {
    console.error('[pay] 创建订单失败:', err.message);
    res.json({ ok: false, msg: err.message });
  }
}
