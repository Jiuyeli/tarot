# ✨ Tarot Divination

在线塔罗牌占卜应用，支持多种牌阵、扇形选牌、DeepSeek AI 解读。

## 文件结构

```
tarot/
├── index.html              # HTML 骨架
├── styles.css              # 全局样式
├── tarot-data.js           # 塔罗牌数据 & 牌阵定义
├── starry-background.js    # 星空背景特效
├── app.js                  # 应用主逻辑
├── graph/                  # 卡牌图片资源目录
│   ├── 0-愚人.jpg ... 21-世界.jpg    # 22 张大阿尔卡纳
│   ├── 权杖1.jpg ... 权杖国王.jpg     # 14 张权杖牌
│   ├── 圣杯1.jpg ... 圣杯国王.jpg     # 14 张圣杯牌
│   ├── 宝剑1.jpg ... 宝剑国王.jpg     # 14 张宝剑牌
│   ├── 星币1.jpg ... 星币国王.jpg     # 14 张星币牌
│   ├── 背面牌.jpg                    # 卡牌背面
├── sound_effect/                     # 音效目录
│   ├── confirm.wav                   # 确认牌阵音效
│   └── cardturn.wav                  # 翻牌/扇动音效
└── first_light_particles_0.wav       # 背景音乐
```

## 各文件功能

### index.html — HTML 骨架

应用的 DOM 结构，按顺序引用 4 个外部资源：

| 资源 | 加载方式 | 说明 |
|---|---|---|
| `styles.css` | `<link>` | 全局样式表 |
| `tarot-data.js` | `<script>` | 先加载数据，后续 JS 依赖它 |
| `starry-background.js` | `<script>` | 星空特效脚本 |
| `app.js` | `<script>` | 最后加载，初始化整个应用 |

**主要 DOM 节点：**
- `#starCanvas` — 星空画布
- `#mysticSymbols` — 神秘符号浮动层
- `#preloadScreen` — 预加载界面（进度条 + 入场按钮）
- `#app` — 主应用容器
  - `#settingsPanel` — 设置面板（音量/粒子/音效）
  - `#musicBtn` — 背景音乐开关
  - `#bgMusic` — 背景音乐 `<audio>` 元素
  - `#screen-spread` — 牌阵选择界面
  - `#screen-meditation` — 冥想 & 提问界面
  - `#screen-draw` — 扇形抽牌界面 (`#fan-container` + `#spread-layout`)
  - `#screen-result` — AI 解读结果界面

---

### styles.css — 全局样式表

所有 CSS 样式，包含：

| 区域 | 内容 |
|---|---|
| `:root` | 色彩系统变量（深紫底色 / 烫金 / 玻璃态 / 发光参数） |
| `body` | 径向渐变背景 |
| `.glass-panel` | 玻璃拟态面板（毛玻璃 + 内阴影） |
| `.btn` | 按钮（渐变边框 + hover 扫描光效） |
| `.fan-card` | 扇形卡牌（阴影 / 圆角 / hover 过渡） |
| `.fan-card-back` | 卡牌背面（烫金纹理叠层） |
| `.drawn-card-final` | 最终卡牌（浮雕效果 + 烫金边框） |
| `.screen` | 页面切换动画（下沉→上浮 + 缩放） |
| `.keyword-tag` | DeepSeek 返回结果中的关键词标签 |
| `@keyframes` | 各种动画定义（fadeIn / scan / popIn / bounce / shake 等） |
| `@media` | 移动端适配（≤768px） |

---

### tarot-data.js — 塔罗牌数据 & 牌阵定义

> **这是你扩展牌阵时主要修改的文件。**

包含三个全局数据：

**`TAROT_DECK`** — 78 张牌的完整数组（22 大 + 56 小）

每张牌的结构：
```js
{
  id,              // 0-77
  type,            // 'major' | 'minor'
  name,            // 中文名，如 "愚者" "权杖ACE"
  nameEn,          // 英文名
  imgName,         // 对应 graph/ 下的文件名
  suit / suitName, // 小牌的花色（大牌为 null）
  element,         // 元素属性（大牌为 null）
  keywords,        // 关键词数组
  meaning_upright, // 正位含义
  meaning_reversed,// 逆位含义
  description      // 画面描述
}
```

**`SPREADS`** — 5 种牌阵定义

```js
{
  single:    { cardCount: 1,  positions: ["当下指引"] },
  three:     { cardCount: 3,  positions: ["过去", "现在", "未来"] },
  elements:  { cardCount: 4,  positions: ["火·行动", "水·情感", "风·思维", "土·物质"] },
  hexagram:  { cardCount: 7,  positions: [...] },
  celtic:    { cardCount: 10, positions: [...] }
}
```

> **添加新牌阵**：在 `SPREADS` 对象中新增一个 key，定义 `name`、`cardCount`、`positions` 数组和 `description` 即可。`app.js` 中的牌位坐标和 DeepSeek prompt 会自动适配。

---

### starry-background.js — 星空背景特效

纯 Canvas 2D 渲染，零依赖。导出的函数和变量：

| 导出 | 类型 | 说明 |
|---|---|---|
| `canvas` / `ctx` | 变量 | 画布引用 |
| `particles` / `meteors` | 数组 | 粒子/流星实例 |
| `animationFrameId` | 变量 | rAF 句柄 |
| `resizeCanvas()` | 函数 | 响应窗口大小变化 |
| `initParticles()` | 函数 | 根据 `AppSettings.particles` 初始化粒子 |
| `initMysticSymbols()` | 函数 | 在 DOM 中生成神秘符号浮动元素 |
| `animateCanvas(time)` | 函数 | 主渲染循环（星云 → 粒子 → 连线 → 流星 → 符号） |
| `Particle` | 类 | 单个光点粒子（远近层 / 光晕 / 正弦透明度） |
| `Meteor` | 类 | 偶发流星（等待→坠落→重置） |

**注意**：此文件不自行启动渲染循环。`app.js` 在 `AppSettings` 就绪后调用 `resizeCanvas()` → `initParticles()` → `initMysticSymbols()` → `requestAnimationFrame(animateCanvas)`。

---

### app.js — 应用主逻辑

按流程顺序组织：

```
预加载资源
    ↓
AppSettings（音量 / 粒子密度 / 音效开关，localStorage 持久化）
    ↓
星空背景初始化
    ↓
音效系统（select / flip / confirm，支持静音）
    ↓
音乐播放器（first_light_particles_0.wav 循环）
    ↓
屏幕管理 switchScreen()
    ↓
Step 1: 牌阵选择（双击卡片确认）
    ↓
Step 2: 提问 & 冥想（可选问题 + 输入数字）
    ↓
Step 3: 洗牌 & 扇形抽牌（11 张卡片圆弧排列，滚轮/拖拽浏览）
    ↓
Step 4: 翻牌 & 飞入牌位（3D 透视翻转 + 动画飞行）
    ↓
Step 5: DeepSeek API 解读（流式→渲染 Markdown，关键词高亮）
    ↓
重新开始
```

**关键函数一览：**
- `switchScreen(screenId)` — 切换当前显示界面
- `initApp()` — 生成牌阵选择卡片
- `startQuestionStep()` — 冥想界面 + 数字输入验证
- `initFanDeck()` — 生成扇形卡牌并启动自动滚动
- `updateFanDeck()` — rAF 循环，计算每张卡牌在圆弧上的位置
- `processNextDraw()` — 自动滚动到目标牌
- `extractCenterCard()` — 翻牌动画（glow → rotateX + rotateY）
- `flyCardToLayout()` — 卡牌飞行到牌位
- `startResultStep()` — 调用 DeepSeek API 并渲染结果
- `playSfx(audio)` / `toggleSfx()` — 音效播放 & 静音切换

---

## 运行方式

直接用浏览器打开 `index.html` 即可，无需构建工具或本地服务器。

如需使用 AI 解读功能，请在 `app.js` 中修改 `DEEPSEEK_API_KEY` 为你的 DeepSeek API Key。

## 可选资源

以下文件为可选增强项，缺失不影响核心功能运行：

| 文件 | 用途 | 缺失时的影响 |
|---|---|---|
| `sound_effect/confirm.wav` | 确认牌阵音效 | 确认时静音，无报错 |
| `sound_effect/cardturn.wav` | 翻牌/扇形滚动音效 | 翻牌时静音，无报错 |
| `graph/gold-foil-texture.png` | 烫金纹理 | 卡牌背面仅显示渐变+牌背图 |
