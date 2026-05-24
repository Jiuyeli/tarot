// ========== 支付配置（全局复用，统一维护） ==========

// 牌张数 → 建议价格（分，整数存储避免浮点精度问题）
const CARD_PRICE_MAP = {
    1: 300,   // 3.00元
    2: 500,   // 5.00元
    3: 600,   // 6.00元
    4: 720,   // 7.20元
    5: 800,   // 8.00元
    6: 900,   // 9.00元
    7: 1050,  // 10.50元
    8: 1200,  // 12.00元
    9: 1350,  // 13.50元
    10: 1500  // 15.00元
};

/**
 * 根据牌张数获取建议价格（分）
 * @param {number} cardCount
 * @returns {number} 价格（分），未知牌数默认 300 分
 */
function getPriceInCent(cardCount) {
    const n = parseInt(cardCount, 10);
    return CARD_PRICE_MAP[n] || 300;
}

/**
 * 根据牌张数获取建议价格（元）
 * @param {number} cardCount
 * @returns {number} 价格（元），如 7.2
 */
function getPriceInYuan(cardCount) {
    return getPriceInCent(cardCount) / 100;
}

/**
 * 根据牌张数获取价格显示文本
 * @param {number} cardCount
 * @returns {string} 如 "3r"、"10.5r"、"??r"
 */
function getPriceText(cardCount) {
    const price = getPriceInYuan(cardCount);
    if (CARD_PRICE_MAP[cardCount]) {
        // 去掉多余小数位（如 7.20 → 7.2）
        const display = parseFloat(price.toFixed(2));
        return display + 'r';
    }
    return '??r';
}

// 轮询配置
const POLL_CONFIG = {
    INTERVAL: 2000,          // 基础间隔 2 秒
    MAX_COUNT: 450,          // 15 分钟 / 2 秒 = 450 次
    BACKOFF_BASE: 2000,      // 退避基础值 2 秒
    BACKOFF_MAX: 10000       // 退避上限 10 秒
};

// 订单配置
const ORDER_CONFIG = {
    TTL_MS: 30 * 60 * 1000, // 订单过期时间 30 分钟
    PREFIX: 'TAROT_'
};
