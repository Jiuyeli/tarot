// 共享订单存储 — 模块级 Map + /tmp/orders.json 备份
// Vercel Serverless 中同一实例复用期间 Map 不丢，冷启动时从文件恢复
// 金额统一使用整数分存储，避免浮点精度问题

import { readFileSync, writeFile, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const STORE_PATH = join(tmpdir(), 'tarot_orders.json');
const ORDER_TTL_MS = 30 * 60 * 1000; // 30 分钟自动清理

/** @type {Map<string, object>} */
let store;

function loadStore() {
    if (store) return;
    try {
        if (existsSync(STORE_PATH)) {
            const raw = readFileSync(STORE_PATH, 'utf-8');
            const entries = JSON.parse(raw);
            store = new Map(entries);
            // 清理过期订单
            const now = Date.now();
            let cleaned = 0;
            for (const [key, val] of store) {
                if (now - val.createdAt > ORDER_TTL_MS) {
                    store.delete(key);
                    cleaned++;
                }
            }
            if (cleaned > 0) persistStore();
        } else {
            store = new Map();
        }
    } catch {
        store = new Map();
    }
}

/**
 * 异步持久化到 /tmp/orders.json，不阻塞主逻辑
 */
function persistStore() {
    try {
        const entries = Array.from(store.entries());
        writeFile(STORE_PATH, JSON.stringify(entries), 'utf-8', (err) => {
            if (err) console.error('[_store] 异步写入文件失败:', err.message);
        });
    } catch {
        // 序列化失败时静默忽略
    }
}

/**
 * 创建新订单
 * @param {string} orderNo
 * @param {number} priceInCent - 单位：分（整数）
 * @param {string} title
 */
export function createOrder(orderNo, priceInCent, title) {
    loadStore();
    const order = {
        orderNo,
        priceInCent: Math.round(priceInCent), // 确保整数
        title,
        status: 'pending',
        createdAt: Date.now(),
        paidAt: null,
    };
    store.set(orderNo, order);
    persistStore();
    return order;
}

/**
 * 获取订单
 * @param {string} orderNo
 * @returns {object|null}
 */
export function getOrder(orderNo) {
    loadStore();
    const order = store.get(orderNo);
    if (!order) {
        console.warn(`[_store] 订单未找到: ${orderNo}（可能因实例冷启动/多实例导致数据丢失）`);
        return null;
    }
    // 过期清理
    if (Date.now() - order.createdAt > ORDER_TTL_MS) {
        store.delete(orderNo);
        persistStore();
        console.log(`[_store] 订单过期已清除: ${orderNo}`);
        return null;
    }
    return order;
}

/**
 * 标记订单为已支付（幂等）
 * @param {string} orderNo
 * @returns {{ success: boolean, alreadyPaid: boolean, order: object|null }}
 */
export function markOrderPaid(orderNo) {
    loadStore();
    const order = store.get(orderNo);
    if (!order) return { success: false, alreadyPaid: false, order: null };

    if (order.status === 'paid') {
        return { success: true, alreadyPaid: true, order };
    }

    order.status = 'paid';
    order.paidAt = Date.now();
    persistStore();
    return { success: true, alreadyPaid: false, order };
}

/**
 * 生成唯一订单号
 */
export function generateOrderNo() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TAROT_${ts}_${rand}`;
}
