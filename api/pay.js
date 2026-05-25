import AlipaySdk from 'alipay-sdk';
import { createOrder, generateOrderNo } from '../lib/store.js';

const alipay = new AlipaySdk({
  appId: '2021006156661454',
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA3ETYLB6Pis8yMpBoYOU1LOR7Lpt9zIplsx92xW5FxEVlnIhD
dM9zvQ3u9ZnlXJOAtdMxxNxzfGBKVLSD6De5aRTkympWNv3sZxSnKZ/c7xdY6ZRA
t0tgl54OUFuEXozninPE4XMJJ6WOD/jyvRYZJZa+oEkmvu3w01fcDe8s/LnERp7Q
6fXTGABT9iP1HoWdTOc7oXDmPzTHdA+ddeUi2gqcNHPg55HVDeHnGMthOVaLSpJc
2j9Tsf/Rb7GtuljDcrcoooEHX5aOx3kf9Df8pvqfvH4vhs3gjGy1HQvK+fP2xdG6
+/pWddmGdvAoj6P7r3o+0ovfKa38h0J6dQmlgwIDAQABAoIBAHntLc/2NrS6jmnI
385K8g1giAM7lP4E2di2IPOWX84OL/nev6BIOSO8M7sFrh15lLSRLCpxcQe28U5E
AgQn3F0bcK3PANw94H8KwqFa2VwLi274Xn5XnicvGXNHxVTlIEHWZXP6TmYA0Uts
HUmnktHoyKpG88iaQ0Vpi+i2rStSzdvMo8x2/hNOJs6/2rzPJ/qfC20kY8oep2jx
RPqmi73VzdkUIhEXAlaDUIUHwZSkLbpl1iOMQ6MBljcX0d1KHVG3g/pVHRdAzzqe
bRNjbwI6KK076q/seAy6hy81jTNXKQKnYjzfmc/XQ0+1S7pq9vIwHeD4r57cbmXW
zRnhGVECgYEA+naJuzvPy0ypmWh3rFfUNqjutRBEKn9+Thf2st3oGU4dF4dXUMGh
zrphE17npWVCRA3TKkP5RcwMREB0HLKuxnFcvG76o59uyvknxcUSzPXLQ0UBQhs1
8VxQkF9T6qk0GGBeX9lcWRvWzcjE4i598i8X9EwGCjVY1jGGVDxzegsCgYEA4SNt
RsmzJ+TFGoFuinExgTfRY2M3Czu0dYmt9sDO8kx7s3++U0u0gveMYPrcFjzN09cY
t2+UC31ubFSMs7E2Df/Q5QPVmXF8l2bEv1hKOYZQTZaVS48uDdkv5WpEKav4aZms
4HjNmqxOgOHgiHuQfI/PSHp3O/OpbzrY21m7JWkCgYBEKvEPmZbToTjjvPAdYwYq
Hk5hz1yOKIcK4DDPu9/Iy17VoYtdOmY8qrNzHzhy5p1jglO/xCJbIc8Q4G35xZQW
BJKV4qqqz+DKs4dkp1+XkypQU76k7F0BJPv0X02qp4S7QbdN5Q3iXtZWydb0LG0w
9ipR3kMikiRsn6wMzysqwwKBgQCZTLcu+U6dfn/b4YA0kojj9O8F3tvvMTNayWoE
WBtSD1Q30Gb3btg2SXtz2b0dA0Af3Bn/ZeGHxVv4NcYs4SDufV9vYaIDPqxYp2iW
5fZ8nwF1I3D7Jz5zvYyIiUhqm6eluDdoDbnqdSNrTOLH7GNg/cdmEcW4s9yOWaKq
EbqF6QKBgQDP5dKU/QS8v0O7fHUTgg3Y5A40HbJiwnUkehkDUtPegR9Kbs9k9zh1
eMXIW+kLON6puZGcZK+CdhtxjVrg+Pc2Cy8gFXOQpRvyHsXu2yj2Kz7HrEdAB+JI
/j0TVtJOcv2iRLchmhBVpypjStAu5d7VvDtuCO456dat5GEUeWOk3g==
-----END RSA PRIVATE KEY-----`,

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

    // 检查支付宝是否返回了业务错误
    const bizResp = result.alipay_trade_precreate_response;
    if (!bizResp) {
      const errResp = result.error_response;
      // 临时调试：输出原始返回的关键字段
      const keys = Object.keys(result || {});
      const debug = keys.length ? ('[key:' + keys.join(',') + ']') : '[empty]';
      console.error('[pay] 支付宝返回解析失败:', debug, JSON.stringify(result).substring(0, 500));
      return res.json({ ok: false, msg: (errResp && (errResp.sub_msg || errResp.msg)) || ('支付宝返回异常 ' + debug) });
    }

    if (bizResp.code !== '10000') {
      console.error('[pay] 支付宝业务错误:', bizResp.code, bizResp.sub_msg || bizResp.msg);
      return res.json({ ok: false, msg: bizResp.sub_msg || bizResp.msg || bizResp.code });
    }

    const qrCode = bizResp.qr_code;

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
