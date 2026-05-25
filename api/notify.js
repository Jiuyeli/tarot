import AlipaySdk from 'alipay-sdk';
import { getOrder, markOrderPaid } from '../lib/store.js';

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
