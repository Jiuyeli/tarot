import { getOrder } from './_store.js';

/**
 * 前端轮询接口 — 检查订单支付状态
 * GET /api/check-order?orderNo=TAROT_xxx
 *
 * 极轻量，只读查询，不写任何数据。Vercel 免费版 10 秒超时内必定完成。
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderNo } = req.query;

  if (!orderNo) {
    return res.status(400).json({ ok: false, error: '缺少 orderNo 参数' });
  }

  const order = getOrder(orderNo);

  if (!order) {
    console.warn(`[check-order] 订单未找到: ${orderNo}（可能因实例冷启动/多实例导致数据丢失）`);
    return res.json({ ok: true, paid: false, status: 'not_found' });
  }

  return res.json({
    ok: true,
    paid: order.status === 'paid',
    status: order.status,
    priceInCent: order.priceInCent,
  });
}
