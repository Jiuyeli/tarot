// 订单存储 — Upstash Redis（跨实例共享，解决 Vercel 多实例数据丢失）
// 金额统一使用整数分存储，避免浮点精度问题

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://charmed-moose-135952.upstash.io',
  token: 'gQAAAAAAAhMQAAIgcDJhMWVjODg2ZWYyYjA0YmRjYTBhZmVkMmI4NDRlMmFkYw',
});

const ORDER_TTL_SECONDS = 30 * 60; // 30 分钟

/**
 * 解析 Redis hash 返回值
 */
function parseOrder(data) {
  if (!data || Object.keys(data).length === 0) return null;
  return {
    orderNo: data.orderNo,
    priceInCent: parseInt(data.priceInCent, 10),
    title: data.title,
    status: data.status,
    createdAt: parseInt(data.createdAt, 10),
    paidAt: data.paidAt ? parseInt(data.paidAt, 10) : null,
  };
}

/**
 * 创建新订单
 */
export async function createOrder(orderNo, priceInCent, title) {
  await redis.hset(orderNo, {
    orderNo,
    priceInCent: String(Math.round(priceInCent)),
    title,
    status: 'pending',
    createdAt: String(Date.now()),
  });
  await redis.expire(orderNo, ORDER_TTL_SECONDS);
}

/**
 * 获取订单
 */
export async function getOrder(orderNo) {
  const data = await redis.hgetall(orderNo);
  return parseOrder(data);
}

/**
 * 标记订单为已支付（幂等）
 */
export async function markOrderPaid(orderNo) {
  const data = await redis.hgetall(orderNo);
  const order = parseOrder(data);
  if (!order) return { success: false, alreadyPaid: false, order: null };
  if (order.status === 'paid') return { success: true, alreadyPaid: true, order };

  await redis.hset(orderNo, {
    status: 'paid',
    paidAt: String(Date.now()),
  });
  return { success: true, alreadyPaid: false, order: { ...order, status: 'paid' } };
}

/**
 * 生成唯一订单号
 */
export function generateOrderNo() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TAROT_${ts}_${rand}`;
}
