/* ============================================
   MUSIC AROMA — 交互脚本
   ============================================ */

/* ---------- 预设主题(主色 + 背景) ---------- */
const THEMES = {
  cream:    { bg1: '#FAF6F0', bg2: '#F0E8DA', accent: '#B89B7A', deep: '#8E6E4F' },
  mist:     { bg1: '#F1F4F4', bg2: '#D7E0E0', accent: '#7FA8A8', deep: '#557A7A' },
  sage:     { bg1: '#F3F4EC', bg2: '#D9DEC9', accent: '#8A9A6B', deep: '#64744B' },
  blush:    { bg1: '#FBF1F0', bg2: '#EAD8D6', accent: '#C58E92', deep: '#955F63' },
  lavender: { bg1: '#F4F0F8', bg2: '#DCD4E8', accent: '#9F84C0', deep: '#735B94' },
  sand:     { bg1: '#F6F1E7', bg2: '#E2D4BE', accent: '#B89570', deep: '#86684A' },
};

/* ---------- 疗法配置(语音引导文案 + 时长) ---------- */
const PLANS = {
  sleep:   { name: '安眠夜曲', minutes: 8,
    cues: [
      [0,    '欢迎来到安眠夜曲,我们从一次长长的呼气开始。'],
      [60,   '将 2 滴精油抹在掌心,合拢双手,慢慢贴近鼻尖。'],
      [120,  '闻一闻香气,让肩膀随着呼气一点点松开。'],
      [240,  '现在,跟着光的圆一起吸气。'],
      [255,  '慢慢呼气,把今天的小事留在空气里。'],
      [360,  '双手轻抚颈侧,从耳后缓缓滑到锁骨。'],
      [420,  '指腹在眼下画圈,像在抚平一天的倦意。'],
      [480,  '呼气。吸气。呼气。让睡眠慢慢靠近。']
    ] },
  release: { name: '释怀微风', minutes: 10,
    cues: [
      [0,    '欢迎来到释怀微风,在这里,你不需要做任何事。'],
      [60,   '取 2 滴佛手柑精油,合在掌心揉暖。'],
      [90,   '闭眼,深深吸一口气,把香气带到身体里。'],
      [180,  '跟着圆一起吸气。'],
      [195,  '慢慢呼气,把紧绷一点点放下。'],
      [360,  '用中指轻点眼周的四个穴位。'],
      [420,  '从眉心向太阳穴方向轻轻推开。'],
      [540,  '指腹落在脸颊,向上提拉三秒,再松开。'],
      [600,  '最后深呼吸三次。让风带走今天的重。']
    ] },
  revive:  { name: '晨光苏醒', minutes: 5,
    cues: [
      [0,    '早安,这里是晨光苏醒。'],
      [30,   '取 1 滴葡萄柚精油,点在前臂内侧。'],
      [60,   '跟着圆吸气,让柑橘香唤醒每一个细胞。'],
      [75,   '呼气。睁开眼睛,看向窗外最远的地方。'],
      [180,  '掌心贴脸颊向上提拉,反复三次。'],
      [240,  '冷热敷交替,让肌肤苏醒。'],
      [300,  '最后伸一个大大的懒腰,新的一天开始啦。']
    ] },
  calm:    { name: '午后禅茶', minutes: 15,
    cues: [
      [0,    '欢迎来到午后禅茶。让心回到此刻。'],
      [60,   '取 1 滴沉香,抹在手腕内侧的脉搏处。'],
      [120,  '闭眼,感受尺八的呼吸。'],
      [240,  '吸气四秒。'],
      [255,  '屏息两秒。'],
      [270,  '呼气六秒。'],
      [480,  '双手交叠放在腹部,感受它的起伏。'],
      [720,  '指腹画小圈,转动手腕关节。'],
      [900,  '最后深呼吸三次,回到此刻的事。']
    ] },
};

/* ---------- 疗愈社区 · Supabase 云端配置 ---------- */
// 建好 Supabase 项目并跑完初始化 SQL 后, 把 Project URL 和 anon public key 填到这里。
// 留空时社区显示「还在准备中」, 不影响其他任何功能。
const COMMUNITY_CONF = {
  SUPABASE_URL: 'https://hswspqduylaypbuwchfv.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzd3NwcWR1eWxheXBidXdjaGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3ODI3MDYsImV4cCI6MjEwMzM1ODcwNn0.k_TvhhWrE6R145LmA6MJQJDGRDZTfmZdRNt1cy6z9dQ',
};

/* ---------- 状态 ---------- */
const state = {
  currentView: 'home',
  cart: {},          // { planKey: count }
  useMagic: false,   // v52: 本次结算是否用 100 魔力减 10
  prefs: {
    voice: true,
    voiceVol: 1.0,   // v586: 人声默认 100%(文件已+10dB 增益), 不调设置也能听清
    plan: 'release',
    theme: 'cream',
    customAccent: null,
    customBg: null,
  },
};

/* ============================================
   启动
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadPrefs();
  bindNav();
  bindPageNav();
  bindToc();
  bindShop();
  bindCheckout();
  bindHealing();
  bindSettings();
  bindLogo();
  bindGames();
  bindAsmr();
  bindAudioManager();
  bindAccount();
  bindCommunity();
  bindCommunityExtras();
  bindPets();         // v52: 疗愈小宠(选宠 / 命名 / 浇水 / 喂食 / 魔力值)
  bindMigration();    // v572: 数据搬家(换网址/换设备迁移账号数据)
  initDmUnread();     // v36.6: 恢复私聊未读红点 + 已注册设备静默订阅(全站可收提示)
  bindSupport();
  preloadCustomAudio();   // 空闲时把上传过的音频提前解码进内存
  preloadHealAudio();     // v597: 预加载疗愈音乐/人声 → Blob URL 本地播放(根治服务器无 Range 的跳回/重播)
  loadBowlAudio();        // 预载水晶钵 wav, 开头「注入灵感」变身音效(v49 保持不变)
  loadHarpAudio();        // v49: 预载竖琴 wav, 魔法卡片「点击开启」按钮用
  applyTheme(state.prefs.theme, state.prefs.customAccent, state.prefs.customBg);
  applyFonts();           // v35: 字体自定义
  captureBottleDefaults(); // v35: 魔法瓶渐变原色快照(必须在应用自定义色之前)
  restoreBottleColors();  // v35: 应用保存过的魔法瓶颜色
});


/* ============================================
   偏好持久化
   ============================================ */
function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem('musicAromaPrefs') || '{}');
    // v586: 人声默认提到 100% —— 一次性迁移, 覆盖此前 localStorage 里的旧偏小值(如 50%)
    if (!saved._v586) {
      saved.voiceVol = 1.0;
      saved._v586 = true;
      try { localStorage.setItem('musicAromaPrefs', JSON.stringify(saved)); } catch (e) {}
    }
    // v596+v597: 「自动循环」功能已按用户要求彻底删除(设置页开关+全部逻辑)。
    // loop 是废弃字段 —— 每次加载都 delete, 绝不让旧值进 state(否则 Object.assign
    // 会把旧版本 localStorage 残留的 loop:true 带进来, 播完自动重开)
    delete saved.loop;
    // v597: 首次加载时把清理后的 prefs 写回, 顺带清掉 localStorage 里残留的旧 loop 键
    if (!saved._v597) {
      saved._v597 = true;
      try { localStorage.setItem('musicAromaPrefs', JSON.stringify(saved)); } catch (e) {}
    }
    Object.assign(state.prefs, saved);
    // 同步到 UI
    queueMicrotask(() => {
      document.querySelectorAll('.theme-chip').forEach(c =>
        c.classList.toggle('active', c.dataset.theme === state.prefs.theme));
      const cv = document.getElementById('customColor');
      if (cv && state.prefs.customAccent) cv.value = state.prefs.customAccent;
      const cb = document.getElementById('customBg');
      if (cb && state.prefs.customBg) cb.value = state.prefs.customBg;
      document.getElementById('prefVoice').checked = state.prefs.voice;
      syncVoiceVolUI();
    });
  } catch (e) { /* 忽略 */ }
}
function savePrefs() {
  try { localStorage.setItem('musicAromaPrefs', JSON.stringify(state.prefs)); } catch(e) {}
}


/* ============================================
   v35: 字体自定义 —— 标题字体 / 正文字体(跟颜色自定义一样, 即选即用)
   存 localStorage(ma_font_brand / ma_font_body), 恢复默认 = 删 key
   ============================================ */
const FONT_BRAND_OPTIONS = {
  classic: '"Cormorant", "Times New Roman", "LXGW WenKai", serif',                          /* 第一版默认 */
  script:  '"Dancing Script", "LXGW WenKai", "Kaiti SC", "KaiTi", cursive',                 /* 手写花体 */
  kai:     '"LXGW WenKai", "LXGW WenKai Lite", "Kaiti SC", "STKaiti", "KaiTi", "楷体", serif',
  song:    '"Songti SC", "STSong", "SimSun", "宋体", serif',
  hei:     '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif',
};
const FONT_BODY_OPTIONS = {
  kai:  '"LXGW WenKai", "LXGW WenKai Lite", "Kaiti SC", "STKaiti", "KaiTi", "楷体", serif',
  song: '"Songti SC", "STSong", "SimSun", "宋体", serif',
  hei:  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif',
  fang: '"FangSong", "STFangsong", "仿宋", serif',
};
function applyFonts() {
  const root = document.documentElement.style;
  const brand = localStorage.getItem('ma_font_brand');
  const body = localStorage.getItem('ma_font_body');
  root.setProperty('--font-brand', FONT_BRAND_OPTIONS[brand] || FONT_BRAND_OPTIONS.classic);
  root.setProperty('--font-hand', FONT_BODY_OPTIONS[body] || FONT_BODY_OPTIONS.kai);
}

/* ============================================
   v35: 魔法瓶颜色自定义 —— 液体 / 烟雾
   原理: 页面加载时抓取 SVG 渐变 stop 的初始颜色做快照,
   选色时按基色生成明暗色阶写入渐变; null = 恢复快照
   ============================================ */
const BOTTLE_GRAD_IDS = {
  liquid: ['potion', 'surfaceG', 'liquidDepth', 'miniLiquid'],
  smoke:  ['smokeG', 'smokeG2', 'smokeG3', 'puffP', 'puffT', 'puffPk', 'puffC'],
};
let BOTTLE_DEFAULTS = null;
function captureBottleDefaults() {
  BOTTLE_DEFAULTS = {};
  Object.values(BOTTLE_GRAD_IDS).flat().forEach(id => {
    const g = document.getElementById(id);
    if (g) BOTTLE_DEFAULTS[id] = Array.from(g.querySelectorAll('stop')).map(s => s.getAttribute('stop-color'));
  });
}
function hexToRgbArr(hex) {
  let h = String(hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  if (isNaN(n)) return [160, 150, 200];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function mixWhite(hex, t) { const c = hexToRgbArr(hex); return rgbToHex(c[0] + (255 - c[0]) * t, c[1] + (255 - c[1]) * t, c[2] + (255 - c[2]) * t); }
function mixBlack(hex, t) { const c = hexToRgbArr(hex); return rgbToHex(c[0] * (1 - t), c[1] * (1 - t), c[2] * (1 - t)); }
function setGradStops(gradId, colors) {
  const g = document.getElementById(gradId);
  if (!g) return;
  const stops = g.querySelectorAll('stop');
  stops.forEach((s, i) => { if (colors[i] != null) s.setAttribute('stop-color', colors[i]); });
}
function applyBottleColors(liquidHex, smokeHex) {
  if (!BOTTLE_DEFAULTS) return;
  if (liquidHex) {
    const c = liquidHex;
    setGradStops('potion',      [mixWhite(c, 0.5), mixWhite(c, 0.2), c, mixBlack(c, 0.15)]);
    setGradStops('surfaceG',    [mixWhite(c, 0.68), mixWhite(c, 0.42)]);
    setGradStops('liquidDepth', [mixBlack(c, 0.15), mixBlack(c, 0.30)]);
    setGradStops('miniLiquid',  BOTTLE_DEFAULTS.miniLiquid && BOTTLE_DEFAULTS.miniLiquid.length > 1
      ? [mixWhite(c, 0.45), mixBlack(c, 0.1)]
      : [c]);
  } else {
    setGradStops('potion', BOTTLE_DEFAULTS.potion || []);
    setGradStops('surfaceG', BOTTLE_DEFAULTS.surfaceG || []);
    setGradStops('liquidDepth', BOTTLE_DEFAULTS.liquidDepth || []);
    setGradStops('miniLiquid', BOTTLE_DEFAULTS.miniLiquid || []);
  }
  if (smokeHex) {
    const s = smokeHex;
    setGradStops('smokeG',  [s, mixWhite(s, 0.28), mixWhite(s, 0.58)]);
    setGradStops('smokeG2', [mixWhite(s, 0.22), mixWhite(s, 0.48), mixWhite(s, 0.72)]);
    setGradStops('smokeG3', [s, mixWhite(s, 0.42), mixWhite(s, 0.75)]);
    setGradStops('puffP',   [s, s, s]);
    setGradStops('puffT',   [mixWhite(s, 0.30), mixWhite(s, 0.30), mixWhite(s, 0.30)]);
    setGradStops('puffPk',  [mixWhite(s, 0.55), mixWhite(s, 0.55), mixWhite(s, 0.55)]);
    setGradStops('puffC',   [mixWhite(s, 0.15), mixWhite(s, 0.15), mixWhite(s, 0.15)]);
  } else {
    ['smokeG', 'smokeG2', 'smokeG3', 'puffP', 'puffT', 'puffPk', 'puffC']
      .forEach(id => setGradStops(id, BOTTLE_DEFAULTS[id] || []));
  }
}
function restoreBottleColors() {
  const saved = loadJSON('ma_bottle', null);
  if (saved) applyBottleColors(saved.liquid || null, saved.smoke || null);
}


/* ============================================
   SPA 视图切换
   ============================================ */
function bindNav() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        e.preventDefault();
        showView(hash.slice(1));
        history.replaceState(null, '', hash);
      }
    });
  });
  // 导航栏头像圆钮 → 用户中心
  const avatarBtn = document.querySelector('.nav-avatar');
  if (avatarBtn) {
    avatarBtn.addEventListener('click', e => {
      e.preventDefault();
      showView('account');
      history.replaceState(null, '', '#account');
    });
  }

  // 页脚"关于这个网站"链接(手机端导航隐藏, 这里是主要入口)
  const footAbout = document.getElementById('footAbout');
  if (footAbout) {
    footAbout.addEventListener('click', e => {
      e.preventDefault();
      showView('about');
      history.replaceState(null, '', '#about');
    });
  }

  // 初始 hash 决定视图
  const initial = (location.hash || '#home').slice(1);
  showView(initial);
}

function showView(id) {
  const prev = state.currentView;
  state.currentView = id;
  document.querySelectorAll('.view').forEach(v =>
    v.classList.toggle('active', v.id === id));
  document.querySelectorAll('.nav-link').forEach(l =>
    l.classList.toggle('active', l.getAttribute('href') === '#' + id));
  // 滚到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // 疗愈社区: 进入时连云端, 离开时断开实时订阅
  if (id === 'community') enterCommunity();
  else if (prev === 'community') leaveCommunity();
  // v52.3: 进设置页时刷新群主工具显隐(登录状态可能在页面加载后才变化)
  if (id === 'settings') { try { bindAdminCleanup(); } catch (_) {} }
  // v47: 离开疗愈之旅页时, 停掉魔法瓶里的环境音
  if (prev === 'healing' && id !== 'healing') stopHealWeather(true);
}

/* ---------- 小目录 (v34: 悬浮左下角抽屉, 全站翻页入口) ---------- */
const PAGE_LABELS = {
  home: '首页', shop: '购买方案', healing: '疗愈之旅', games: '解压游戏',
  asmr: 'ASMR 助眠音', account: '用户中心', community: '疗愈社区',
  pets: '疗愈小宠', settings: '设置', about: '关于网站'
};

function tocOpen() {
  const list = document.getElementById('tocList');
  const overlay = document.getElementById('tocOverlay');
  const panel = document.getElementById('tocPanel');
  if (!list || !overlay || !panel) return;
  // 每次打开重建列表, 高亮当前页
  list.innerHTML = '';
  PAGE_ORDER.forEach(id => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toc-item' + (state.currentView === id ? ' current' : '');
    btn.innerHTML = '<span class="toc-dot"></span>' + (PAGE_LABELS[id] || id);
    btn.addEventListener('click', () => {
      tocClose();
      gotoPage(id);
    });
    list.appendChild(btn);
  });
  overlay.classList.add('show');
  panel.classList.add('show');
}

function tocClose() {
  const overlay = document.getElementById('tocOverlay');
  const panel = document.getElementById('tocPanel');
  if (overlay) overlay.classList.remove('show');
  if (panel) panel.classList.remove('show');
}

function bindToc() {
  const fab = document.getElementById('tocFab');
  const closeBtn = document.getElementById('tocClose');
  const overlay = document.getElementById('tocOverlay');
  if (fab) fab.addEventListener('click', tocOpen);
  if (closeBtn) closeBtn.addEventListener('click', tocClose);
  if (overlay) overlay.addEventListener('click', tocClose);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') tocClose();
  });
}


/* v572: pets(疗愈小宠) 加入线性翻页, 顺序与顶部导航一致 */
const PAGE_ORDER = ['home', 'shop', 'healing', 'games', 'asmr', 'account', 'community', 'pets', 'settings', 'about'];

/* v47: 这 4 个页面已有自己的「去下一页」CTA, 不再额外加下一页按钮
   home    → hint-arrow "购买疗愈方案"  跳 shop
   shop    → enterHealingCta            跳 healing
   healing → enterGamesCta              跳 games
   games   → enterAsmrCta               跳 asmr
   上一页按钮仍保留(无重复), 避免误伤从中间页回退的能力 */
const PAGE_NAV_SKIP_NEXT = new Set(['home', 'shop', 'healing', 'games']);

function gotoPage(id) {
  showView(id);
  history.replaceState(null, '', '#' + id);
}

function bindPageNav() {
  document.querySelectorAll('[data-page-nav]').forEach(wrap => {
    if (wrap.dataset.bound) return;
    wrap.dataset.bound = '1';
    const view = wrap.closest('.view');
    if (!view) return;
    const idx = PAGE_ORDER.indexOf(view.id);
    if (idx === -1) return;
    const prevId = PAGE_ORDER[idx - 1];
    const nextId = PAGE_ORDER[idx + 1];
    if (prevId) {
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'page-nav-btn page-prev';
      prevBtn.textContent = '← 上一页';
      prevBtn.addEventListener('click', () => gotoPage(prevId));
      wrap.appendChild(prevBtn);
    }
    if (nextId && !PAGE_NAV_SKIP_NEXT.has(view.id)) {
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'page-nav-btn page-next';
      nextBtn.textContent = '下一页 →';
      nextBtn.addEventListener('click', () => gotoPage(nextId));
      wrap.appendChild(nextBtn);
    }
  });
}


/* ============================================
   购买方案 + 购物车
   ============================================ */
function bindShop() {
  document.querySelectorAll('.add-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.plan-card');
      const key = card.dataset.plan;
      state.cart[key] = (state.cart[key] || 0) + 1;
      const planName = card.querySelector('.plan-name').textContent.trim();
      toast(`已加入「${planName}」`);
      renderCart();
    });
  });
  document.getElementById('resetCart').addEventListener('click', () => {
    if (!Object.keys(state.cart).length) { toast('购物车本来就是空的哦'); return; }
    state.cart = {}; renderCart(); toast('购物车已全部清空');
  });

  // 购物车内数量加减(事件委托)
  const cartItemsBox = document.getElementById('cartItems');
  cartItemsBox.addEventListener('click', e => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const item = btn.closest('.cart-item');
    if (!item) return;
    const key = item.dataset.plan;
    if (btn.classList.contains('plus')) {
      state.cart[key] = (state.cart[key] || 0) + 1;
    } else if (btn.classList.contains('minus')) {
      state.cart[key] = (state.cart[key] || 0) - 1;
      if (state.cart[key] <= 0) delete state.cart[key];
    }
    renderCart();
  });

  // 购买方案底部: 进入疗愈之旅
  const eh = document.getElementById('enterHealingCta');
  if (eh) {
    eh.addEventListener('click', e => {
      e.preventDefault();
      showView('healing');
      history.replaceState(null, '', '#healing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  renderCart();
  bindPlanDetail();
}

const PLAN_META = {
  sleep:   { name: '安眠夜曲', price: 48 },
  release: { name: '释怀微风', price: 58 },
  revive:  { name: '晨光苏醒', price: 38 },
  calm:    { name: '午后禅茶', price: 68 },
};

/* ============================================
   方案详情弹窗（v47：精油配方+过敏原 / 音乐 30 秒试听）
   ============================================ */
const PLAN_DETAILS = {
  sleep: {
    oils: [
      { name: '薰衣草', drops: '2 滴', role: '主调 · 舒缓安神，让思绪慢慢沉淀', al: '含芳樟醇*' },
      { name: '雪松',   drops: '1 滴', role: '中调 · 温暖木香，稳稳托住情绪' },
      { name: '岩兰草', drops: '1 滴', role: '尾调 · 泥土气息，像被大地轻轻抱住' },
    ],
    allergen: '* 过敏原标注：薰衣草天然含「芳樟醇」，敏感肌建议先在手腕内侧试用 24 小时；孕期与哺乳期请咨询医师后再使用。',
    oilColor: '#B9A0D8', oilDeep: '#8F72B8', tag: '· 助眠 · 深度放松 ·',
    music: { title: '432Hz 月光钢琴', len: '完整版 8 分钟', desc: '缓慢的琴音像月光洒在水面，一寸一寸把你送进睡眠。' },
    routine: '颈肩放松 + 面部抚触 · 睡前 3 分钟，跟着引导把今天轻轻放下。',
  },
  release: {
    oils: [
      { name: '佛手柑', drops: '2 滴', role: '主调 · 明亮果香，赶走心里的乌云', al: '含柠檬烯*' },
      { name: '依兰',   drops: '1 滴', role: '中调 · 柔美花香，松开紧绷的眉头', al: '含芳樟醇*' },
      { name: '甜橙',   drops: '1 滴', role: '尾调 · 甜甜的橙味，像一阵好脾气' },
    ],
    allergen: '* 过敏原标注：佛手柑、甜橙含「柠檬烯」，依兰含「芳樟醇」；佛手柑有光敏性，涂抹后 12 小时内请避开强烈日晒。',
    oilColor: '#F2C879', oilDeep: '#C99A3E', tag: '· 减压 · 焦虑舒缓 ·',
    music: { title: '环境白噪音 + 钢琴', len: '完整版 10 分钟', desc: '风声垫在琴音下面，像有人轻轻拍着你的背。' },
    routine: '眼周穴位 + 呼吸抚触 · 焦虑上来的那 3 分钟，用它按一下暂停键。',
  },
  revive: {
    oils: [
      { name: '葡萄柚', drops: '2 滴', role: '主调 · 清爽酸甜，一下子睁开眼', al: '含柠檬烯*' },
      { name: '迷迭香', drops: '1 滴', role: '中调 · 草本清香，把注意力叫醒', al: '含桉叶油素*' },
      { name: '柠檬',   drops: '1 滴', role: '尾调 · 明亮酸感，像清晨第一口空气', al: '含柠檬烯*' },
    ],
    allergen: '* 过敏原标注：葡萄柚、柠檬含「柠檬烯」，迷迭香含「桉叶油素」；柑橘类均有光敏性，晨间使用后请正常防晒即可。',
    oilColor: '#F6B26B', oilDeep: '#D98E32', tag: '· 焕活 · 提亮 · 元气 ·',
    music: { title: '轻快民谣', len: '完整版 5 分钟', desc: '木吉他般的拨弦，配一杯晨光，元气值慢慢回满。' },
    routine: '提拉按摩 + 冷热敷交替 · 洗完脸后 3 分钟，把脸和心情一起叫醒。',
  },
  calm: {
    oils: [
      { name: '沉香', drops: '1 滴', role: '主调 · 幽深木香，一呼一吸都变慢' },
      { name: '檀香', drops: '2 滴', role: '中调 · 奶感木质，把心放回原处' },
      { name: '茶树', drops: '1 滴', role: '尾调 · 微微清凉，安安静静的干净', al: '注意新鲜度*' },
    ],
    allergen: '* 过敏原标注：沉香、檀香无常见致敏成分；茶树精油性质活泼，开封后请在 6 个月内用完，氧化后易致敏。',
    oilColor: '#C9A878', oilDeep: '#9A7A4B', tag: '· 专注 · 心流 · 平复 ·',
    music: { title: '禅意尺八 + 水滴声', len: '完整版 15 分钟', desc: '偶尔一声尺八、一滴水，房间安静得能听见自己。' },
    routine: '手腕脉搏按摩 · 泡茶的间隙按一按，让下午的心流稳稳续杯。',
  },
};

/* 30 秒试听的音乐风格 */
const PREVIEW_STYLE = {
  sleep:   { scale: [0, 3, 7, 12, 14], base: 220,    rate: 432 / 440, step: 1.15, wave: 'sine',     vol: 0.15, drone: 110,    dur: 3.4, drip: 0 },
  release: { scale: [0, 2, 4, 7, 9, 12], base: 261.63, step: 0.9,  wave: 'sine',     vol: 0.13, drone: 130.81, dur: 2.8, drip: 0 },
  revive:  { scale: [0, 2, 4, 7, 9, 12], base: 293.66, step: 0.44, wave: 'triangle', vol: 0.15, drone: 146.83, dur: 1.0, drip: 0 },
  calm:    { scale: [0, 2, 5, 7, 9, 12], base: 196,    step: 1.7,  wave: 'triangle', vol: 0.14, drone: 98,     dur: 4.0, drip: 1 },
};

function pdNote(ctx, dest, freq, t, dur, wave, vol) {
  const o = ctx.createOscillator();
  o.type = wave; o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + dur + 0.05);
  return o;
}

let _pdPreview = null;   /* { nodes, timer, stop }  window._pdPreview 供测试 */
function stopPlanPreview() {
  if (!_pdPreview) return;
  clearTimeout(_pdPreview.timer);
  try { _pdPreview.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); } catch (e) {}
  try { _pdPreview.master.gain.cancelScheduledValues(_pdPreview.master.context.currentTime);
        _pdPreview.master.gain.setValueAtTime(0.0001, _pdPreview.master.context.currentTime); } catch (e) {}
  _pdPreview = null;
  window._pdPreview = null;
}

function startPlanPreview(kind) {
  stopPlanPreview();
  const ctx = ensureAudioCtx();
  if (!ctx) return null;
  const st = PREVIEW_STYLE[kind];
  if (!st) return null;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.4);
  master.gain.setValueAtTime(0.9, ctx.currentTime + 29);
  master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 30.2);
  master.connect(ctx.destination);

  const nodes = [];
  const t0 = ctx.currentTime + 0.12;
  const rate = st.rate || 1;

  /* 低音持续垫 */
  const drone = ctx.createOscillator(); drone.type = 'sine';
  drone.frequency.value = st.drone * rate;
  const dg = ctx.createGain(); dg.gain.value = 0.055;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
  const lg = ctx.createGain(); lg.gain.value = 0.025;
  lfo.connect(lg); lg.connect(dg.gain);
  drone.connect(dg); dg.connect(master);
  drone.start(t0); lfo.start(t0);
  drone.stop(t0 + 30.5); lfo.stop(t0 + 30.5);
  nodes.push(drone, lfo);

  /* 主旋律：沿音阶缓慢游走 */
  for (let t = t0; t < t0 + 28.2; t += st.step) {
    const i = Math.round((t - t0) / st.step);
    let deg = st.scale[(i * 3 + (i >> 2)) % st.scale.length];
    if (i % 8 >= 4) deg += 12;
    nodes.push(pdNote(ctx, master, st.base * rate * Math.pow(2, deg / 12), t, st.dur, st.wave, st.vol));
    if (i % 4 === 0)  /* 偶尔叠一个纯五度，听感更饱满 */
      nodes.push(pdNote(ctx, master, st.base * rate * Math.pow(2, (deg + 7) / 12), t, st.dur * 0.8, 'sine', st.vol * 0.4));
  }

  /* calm：禅意水滴 */
  if (st.drip) {
    let j = 0;
    for (let t = t0 + 1.2; t < t0 + 29; t += 2.15 + ((j++ * 37) % 90) / 100) {
      nodes.push(pdNote(ctx, master, 1180 * (1 + ((j * 13) % 5) / 40), t, 0.35, 'sine', 0.07));
    }
  }

  const timer = setTimeout(() => {
    stopPlanPreview();
    const btn = document.getElementById('pdPlay');
    if (btn) { btn.classList.remove('playing'); btn.textContent = '▶ 试听 30 秒'; }
    const prog = document.getElementById('pdProg');
    if (prog) { prog.style.transition = 'none'; prog.style.width = '0%'; }
  }, 30500);

  _pdPreview = { nodes, timer, master, kind };
  window._pdPreview = _pdPreview; /* 测试可见 */
  return _pdPreview;
}

/* 精油瓶小图（纯 SVG，无外部文件） */
function pdOilSvg(d) {
  const c = d.oilColor, deep = d.oilDeep;
  return (
    '<svg class="pd-oil-art" viewBox="0 0 130 160" aria-hidden="true">' +
      '<!-- 叶枝 -->' +
      '<path d="M 27 132 C 13 108 25 84 47 82 C 41 106 45 124 27 132 Z" fill="#9CC3A4" opacity="0.9"/>' +
      '<line x1="27" y1="132" x2="43" y2="86" stroke="#6E9C76" stroke-width="1.6"/>' +
      '<!-- 瓶盖 -->' +
      '<rect x="49" y="26" width="32" height="16" rx="5" fill="' + deep + '"/>' +
      '<rect x="49" y="26" width="32" height="7" rx="3.5" fill="#FFFFFF" opacity="0.22"/>' +
      '<!-- 瓶身 -->' +
      '<rect x="53" y="42" width="24" height="10" fill="#EFE8DC"/>' +
      '<rect x="38" y="52" width="54" height="92" rx="14" fill="#FBF7F0" stroke="#DCD2C2" stroke-width="2"/>' +
      '<!-- 液体 -->' +
      '<rect x="43" y="84" width="44" height="55" rx="10" fill="' + c + '" opacity="0.88"/>' +
      '<ellipse cx="65" cy="84" rx="22" ry="4" fill="' + c + '" opacity="0.7"/>' +
      '<!-- 高光 -->' +
      '<rect x="45" y="60" width="6" height="76" rx="3" fill="#FFFFFF" opacity="0.55"/>' +
      '<!-- 标签 -->' +
      '<rect x="47" y="96" width="36" height="26" rx="5" fill="#FFFFFF" opacity="0.85"/>' +
      '<text x="65" y="112" text-anchor="middle" font-size="8.5" letter-spacing="1.5" fill="' + deep + '" font-family="var(--font-hand, serif)">AROMA</text>' +
      '<!-- 滴管滴下的精油 -->' +
      '<ellipse cx="104" cy="66" rx="3.4" ry="4.6" fill="' + c + '"/>' +
      '<ellipse cx="106" cy="80" rx="2.4" ry="3.2" fill="' + c + '" opacity="0.7"/>' +
    '</svg>'
  );
}

function openPlanDetail(key) {
  const meta = PLAN_META[key], d = PLAN_DETAILS[key];
  if (!meta || !d) return;
  stopPlanPreview();

  const oils = d.oils.map(o =>
    '<li>' +
      '<span class="pd-oil-name"><b>' + o.name + '</b><i>' + o.drops + '</i>' +
        (o.al ? '<em class="pd-al">' + o.al + '</em>' : '') + '</span>' +
      '<span class="pd-oil-role">' + o.role + '</span>' +
    '</li>'
  ).join('');

  document.getElementById('pdBody').innerHTML =
    '<h3 class="pd-title">' + meta.name + '<span class="pd-price"><small>¥</small>' + meta.price + '</span></h3>' +
    '<p class="pd-tag">' + d.tag + '</p>' +
    '<div class="pd-section">' +
      '<p class="co-block-label">精油配方</p>' +
      '<div class="pd-oil">' + pdOilSvg(d) +
        '<ul class="pd-oils">' + oils + '</ul>' +
      '</div>' +
      '<p class="pd-allergen">' + d.allergen + '</p>' +
    '</div>' +
    '<div class="pd-section">' +
      '<p class="co-block-label">音乐内容</p>' +
      '<div class="pd-music">' +
        '<div class="pd-music-info"><b>' + d.music.title + '</b><span>' + d.music.len + '</span><span>' + d.music.desc + '</span></div>' +
        '<button class="btn btn-ghost pd-play" id="pdPlay" type="button">▶ 试听 30 秒</button>' +
      '</div>' +
      '<div class="pd-prog-track"><i class="pd-prog" id="pdProg"></i></div>' +
    '</div>' +
    '<div class="pd-section">' +
      '<p class="co-block-label">护肤操</p>' +
      '<p class="pd-routine">' + d.routine + '</p>' +
    '</div>' +
    '<button class="btn btn-solid pd-add" id="pdAdd" type="button">加入购物车 · ¥' + meta.price + '</button>';

  const playBtn = document.getElementById('pdPlay');
  playBtn.addEventListener('click', () => {
    if (_pdPreview) {
      stopPlanPreview();
      playBtn.classList.remove('playing');
      playBtn.textContent = '▶ 试听 30 秒';
      const prog = document.getElementById('pdProg');
      prog.style.transition = 'none'; prog.style.width = '0%';
      return;
    }
    startPlanPreview(key);
    playBtn.classList.add('playing');
    playBtn.textContent = '■ 停止试听';
    const prog = document.getElementById('pdProg');
    prog.style.transition = 'none'; prog.style.width = '0%';
    void prog.offsetWidth; /* 强制回流，重新开始 30s 动画 */
    prog.style.transition = 'width 30s linear';
    prog.style.width = '100%';
  });

  document.getElementById('pdAdd').addEventListener('click', () => {
    state.cart[key] = (state.cart[key] || 0) + 1;
    renderCart();
    toast('已加入「' + meta.name + '」');
    closePlanDetail();
  });

  document.getElementById('pdOverlay').classList.add('open');
  document.getElementById('pdOverlay').setAttribute('aria-hidden', 'false');
}

function closePlanDetail() {
  stopPlanPreview();
  const ov = document.getElementById('pdOverlay');
  ov.classList.remove('open');
  ov.setAttribute('aria-hidden', 'true');
}

function bindPlanDetail() {
  const ov = document.getElementById('pdOverlay');
  if (!ov || ov.dataset.bound) return;
  ov.dataset.bound = '1';
  document.getElementById('pdClose').addEventListener('click', closePlanDetail);
  ov.addEventListener('click', e => { if (e.target === ov) closePlanDetail(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ov.classList.contains('open')) closePlanDetail();
  });
  /* 点卡片开详情（加购按钮除外） */
  document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.add-cart')) return;
      openPlanDetail(card.dataset.plan);
    });
  });
}

/* 购物车汇总：件数、原价合计、满2件立减10、魔力值抵扣、应付金额 */
function cartSummary() {
  let count = 0, sum = 0;
  Object.entries(state.cart).forEach(([k, v]) => {
    const meta = PLAN_META[k];
    if (!meta || v <= 0) return;
    count += v;
    sum += meta.price * v;
  });
  const discount = count >= 2 ? 10 : 0;
  // v52: 魔力值抵扣 — 100 魔力可减 ¥10, 单次订单最多用 1 次(不可叠加)
  const pp = loadPet();
  const magicAvailable = pp.magic >= 100;
  const magic = (magicAvailable && state.useMagic) ? 10 : 0;
  return { count, sum, discount, magic, magicAvailable, total: sum - discount - magic };
}

function renderCart() {
  const box = document.getElementById('cartItems');
  const entries = Object.entries(state.cart).filter(([, v]) => v > 0);

  if (!entries.length) {
    box.innerHTML = '<p class="cart-empty">还没有选方案，去上面挑一款合心意的吧～</p>';
  } else {
    box.innerHTML = entries.map(([k, v]) => {
      const meta = PLAN_META[k] || { name: k, price: 0 };
      return (
        '<div class="cart-item" data-plan="' + k + '">' +
          '<span class="ci-name">' + meta.name + '</span>' +
          '<span class="ci-price">¥' + meta.price + '</span>' +
          '<div class="ci-qty">' +
            '<button class="qty-btn minus" aria-label="减少数量">−</button>' +
            '<span class="qty-num">' + v + '</span>' +
            '<button class="qty-btn plus" aria-label="增加数量">＋</button>' +
          '</div>' +
          '<span class="ci-subtotal">¥' + (meta.price * v) + '</span>' +
        '</div>'
      );
    }).join('');
  }

  const s = cartSummary();
  document.getElementById('cartCount').textContent = s.count;
  document.getElementById('cartSum').textContent = '¥' + s.total;
  const tip = document.getElementById('cartDiscount');
  if (tip) tip.hidden = s.discount === 0;
  const btn = document.getElementById('checkoutBtn');
  if (btn) btn.disabled = s.count === 0;
}

/* ============================================
   结算弹窗（演示支付）
   ============================================ */
function bindCheckout() {
  const overlay = document.getElementById('checkoutOverlay');
  if (!overlay) return;
  const closeBtn = document.getElementById('checkoutClose');
  const payBtn = document.getElementById('coPay');
  const nameEl = document.getElementById('coName');
  const phoneEl = document.getElementById('coPhone');
  const addrEl = document.getElementById('coAddr');

  function open() {
    const s = cartSummary();
    if (s.count === 0) { toast('购物车是空的，先去挑一款方案吧'); return; }
    // v34: 必须登录才能购买 —— 未登录先请去登录
    if (!currentUser()) {
      toast('请先登录，登录后才能下单付款哦');
      showView('account');
      history.replaceState(null, '', '#account');
      return;
    }

    // 重置表单态：每次开弹窗都像新订单
    nameEl.value = ''; phoneEl.value = ''; addrEl.value = '';
    nameEl.classList.remove('invalid');
    phoneEl.classList.remove('invalid');
    addrEl.classList.remove('invalid');

    const items = Object.entries(state.cart).filter(([, v]) => v > 0).map(([k, v]) => {
      const meta = PLAN_META[k] || { name: k, price: 0 };
      return (
        '<div class="co-item">' +
          '<span class="coi-name">' + meta.name + ' <em>×' + v + '</em></span>' +
          '<span class="coi-sub">¥' + (meta.price * v) + '</span>' +
        '</div>'
      );
    }).join('');
    document.getElementById('coItems').innerHTML = items;
    document.getElementById('coSubtotal').textContent = '¥' + s.sum;

    const dRow = document.getElementById('coDiscountRow');
    dRow.hidden = s.discount === 0;
    if (s.discount > 0) document.getElementById('coDiscount').textContent = '-¥' + s.discount;

    // v52: 魔力值抵扣行(仅 magicAvailable 时显示)
    const mChk = document.getElementById('coMagicChk');
    if (mChk) mChk.checked = state.useMagic;
    refreshMagicRow(s);
    document.getElementById('coTotal').textContent = '¥' + s.total;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => nameEl.focus(), 150);
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('checkoutBtn').addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });

  // 输入时清除错误态
  [nameEl, phoneEl, addrEl].forEach(el => {
    el.addEventListener('input', () => el.classList.remove('invalid'));
  });

  // v52: 魔力值抵扣勾选即时切换
  const mChk2 = document.getElementById('coMagicChk');
  if (mChk2) {
    mChk2.addEventListener('change', () => {
      const pp = loadPet();
      if (mChk2.checked && pp.magic < 100) {
        mChk2.checked = false;
        toast('魔力值不足 100，还差 ' + (100 - pp.magic));
        return;
      }
      state.useMagic = mChk2.checked;
      const s2 = cartSummary();
      document.getElementById('coTotal').textContent = '¥' + s2.total;
      refreshMagicRow(s2);
    });
  }

  // 演示付款：校验地址 → 短暂"付款中" → 自动完成、关闭、清空购物车
  // TODO 后续接入真实支付后，替换这里的 setTimeout 模拟流程
  payBtn.addEventListener('click', () => {
    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const addr = addrEl.value.trim();
    let ok = true;
    if (!name) { nameEl.classList.add('invalid'); ok = false; }
    if (!/^1\d{10}$/.test(phone)) { phoneEl.classList.add('invalid'); ok = false; }
    if (!addr) { addrEl.classList.add('invalid'); ok = false; }
    if (!ok) { toast('请先填写完整的收货信息'); return; }

    const paid = cartSummary().total;
    // 付款前快照订单(回调里购物车已清空)
    const orderSnapshot = Object.entries(state.cart).filter(([, v]) => v > 0).map(([k, v]) => {
      const meta = PLAN_META[k] || { name: k, price: 0 };
      return { key: k, name: meta.name, count: v, subtotal: meta.price * v };
    });
    payBtn.disabled = true;
    payBtn.textContent = '付款中…';
    setTimeout(() => {
      saveOrder({
        items: orderSnapshot,
        total: paid,
        name, phone, addr,
      });
      // v52: 若本单用了魔力抵扣, 实际扣 100
      if (state.useMagic) {
        const pp = loadPet();
        if (pp.magic >= 100) {
          pp.magic -= 100;
          savePet(pp);
          refreshPetGlobal();
          renderPetHome();
        }
      }
      state.useMagic = false;
      state.cart = {};
      renderCart();
      close();
      payBtn.disabled = false;
      payBtn.textContent = '立即付款';
      nameEl.value = ''; phoneEl.value = ''; addrEl.value = '';
      toast('🎉 支付成功 ¥' + paid + '，购物车已清空');
    }, 900);
  });
}


/* ============================================
   疗愈会话(呼吸动画 + 语音)
   ============================================ */
let healingState = { timer: null, idx: 0, paused: false, startedAt: 0, done: false, totalMs: 0 };

/* v597: 疗愈音乐真实时长(秒)。v597 用户钦定"音乐固定三分半(3:30), 播完 3:30 直接安静结束,
   没声音就没声音, 绝不循环"。文件 = 原文件《疗愈体验.wav》0-210s 精确裁切转码(3:30.02),
   仅做裁剪+格式转码, 无任何其他处理。
   iPhone Safari 流式播放时 <audio>.duration 常报 Infinity,
   不能依赖它 —— 时长/结束判断一律用此常量兜底, 元数据就绪后再校正 */
const HEAL_MUSIC_SEC = 210;

function bindHealing() {
  document.getElementById('watchGuide').addEventListener('click', () => openModal());
  document.getElementById('startHealing').addEventListener('click', () => startHealing());
  document.getElementById('pauseBtn').addEventListener('click', togglePause);
  document.getElementById('stopBtn').addEventListener('click', () => {
    // v577: 手动结束 → 雨声/森林/海浪也一起停(仅结束按钮, 开始新会话不清注入)
    stopHealWeather(true);
    stopHealing();
  });
  // 进入设置页的快捷按钮
  document.getElementById('enterShop').addEventListener('click', () => showView('shop'));
  document.getElementById('enterHeal').addEventListener('click', () => {
    showView('healing');
    setTimeout(() => startHealing(), 400);
  });
  // v47: 舞台里的「进入疗愈」按钮(提示语下方)
  const stageStart = document.getElementById('stageStartBtn');
  if (stageStart) stageStart.addEventListener('click', () => startHealing());
  initHealBottle();
}

/* ============================================
   v47: 疗愈之旅页魔法瓶 —— 主页瓶的克隆 + 注入环境音
   注入 → 雨声 / 森林 / 海滩 三选一(互斥), 瓶内随选择
   下雨 / 长出小森林 / 海浪涌动
   ============================================ */
const HEAL_WEATHER = {
  rain:   { label: '雨声', slot: 'asmr.rain',   toast: '雨声注入瓶中 ✦' },
  forest: { label: '森林', slot: 'asmr.forest', toast: '森林注入瓶中 ✦' },
  beach:  { label: '海滩', slot: 'asmr.wave',   toast: '海浪注入瓶中 ✦' },
};
let _healWeather = { kind: null, sound: null };
if (typeof window !== 'undefined') window._healWeather = _healWeather;  // 测试可见

function syncHealStopBtn() {
  const sb = document.getElementById('healStopBtn');
  if (sb) sb.hidden = !_healWeather.kind;
}

function stopHealWeather(silent) {
  if (_healWeather.sound) {
    try { smoothStop(_healWeather.sound); } catch (e) {}
    _healWeather.sound = null;
  }
  _healWeather.kind = null;
  syncHealStopBtn();
  document.querySelectorAll('.hw').forEach(g => g.classList.remove('on'));
  document.querySelectorAll('.heal-inject-menu button').forEach(b => b.classList.remove('active'));
  if (!silent) toast('瓶中恢复安静');
}

async function startHealWeather(kind) {
  const conf = HEAL_WEATHER[kind];
  if (!conf) return;
  // 互斥: 先停掉当前的(声音 + 动画), 不叠加
  if (_healWeather.sound) { try { smoothStop(_healWeather.sound); } catch (e) {} _healWeather.sound = null; }
  document.querySelectorAll('.hw').forEach(g => g.classList.remove('on'));
  _healWeather.kind = kind;
  syncHealStopBtn();

  const host = document.getElementById('healBottle');
  if (host) {
    // 加入动画: 液体升起(空瓶 → 满瓶) + 对应天气层浮现
    host.classList.remove('is-empty');
    host.classList.add('is-charged');
    const g = document.querySelector('.hw-' + kind);
    if (g) {
      // 重建天气层节点, 让 grow/fall 动画从头播放
      rebuildHealWeather(kind);
      g.classList.add('on');
    }
  }
  document.querySelectorAll('.heal-inject-menu button').forEach(b =>
    b.classList.toggle('active', b.dataset.weather === kind));
  toast(conf.toast);
  try {
    const nodes = await startLoopSound(conf.slot);
    if (_healWeather.kind === kind && nodes) _healWeather.sound = nodes;
    else if (nodes) smoothStop(nodes);   // 期间用户又切换了
  } catch (e) { /* 静默 */ }
}

/* 生成瓶内天气层的 SVG 内容(每次注入重建, 动画从头播) */
function rebuildHealWeather(kind) {
  const groups = { rain: 'hwRain', forest: 'hwForest', beach: 'hwBeach' };
  const host = document.getElementById(groups[kind]);
  if (!host) return;
  const SVGNS = 'http://www.w3.org/2000/svg';
  host.innerHTML = '';
  if (kind === 'rain') {
    // 液面(≈y394)往下落的雨丝
    for (let i = 0; i < 16; i++) {
      const x = 150 + Math.random() * 150;
      const len = 9 + Math.random() * 7;
      const l = document.createElementNS(SVGNS, 'line');
      l.setAttribute('x1', x); l.setAttribute('x2', x - 2.5);
      l.setAttribute('y1', 400); l.setAttribute('y2', 400 + len);
      l.setAttribute('stroke', '#A9D6F2');
      l.setAttribute('stroke-width', 2.2 + Math.random() * 1.4);
      l.setAttribute('class', 'hw-drop');
      l.style.animationDelay = (-Math.random() * 1.35).toFixed(2) + 's';
      l.style.animationDuration = (1.05 + Math.random() * 0.6).toFixed(2) + 's';
      host.appendChild(l);
    }
    // 液面涟漪
    [0, 1, 2].forEach(i => {
      const e = document.createElementNS(SVGNS, 'ellipse');
      e.setAttribute('cx', 220 + (i - 1) * 34);
      e.setAttribute('cy', 396);
      e.setAttribute('rx', 14); e.setAttribute('ry', 3.2);
      e.setAttribute('fill', 'none');
      e.setAttribute('stroke', 'rgba(169, 214, 242, 0.55)');
      e.setAttribute('stroke-width', 1.6);
      host.appendChild(e);
    });
  } else if (kind === 'forest') {
    // 液面上长出一小片森林
    const trees = [
      { x: 148, h: 52, s: 1.00 }, { x: 178, h: 68, s: 1.15 },
      { x: 212, h: 58, s: 0.95 }, { x: 246, h: 74, s: 1.25 },
      { x: 281, h: 50, s: 0.9 },  { x: 304, h: 62, s: 1.05 },
    ];
    trees.forEach((t, i) => {
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'hw-tree');
      g.style.animationDelay = (-i * 0.8).toFixed(2) + 's';
      const inner = document.createElementNS(SVGNS, 'g');
      inner.setAttribute('class', 'hw-tree-in');
      inner.style.animationDelay = (i * 0.14).toFixed(2) + 's';
      const h = t.h, w = h * 0.52, bx = t.x, by = 404;
      // 树干
      const trunk = document.createElementNS(SVGNS, 'rect');
      trunk.setAttribute('x', bx - 1.7); trunk.setAttribute('y', by - h * 0.34);
      trunk.setAttribute('width', 3.4); trunk.setAttribute('height', h * 0.34);
      trunk.setAttribute('rx', 1.4); trunk.setAttribute('fill', '#8A6647');
      inner.appendChild(trunk);
      // 三层针叶
      const greens = ['#4E8F6B', '#5FA776', '#74BC8C'];
      for (let k = 0; k < 3; k++) {
        const top = by - h + k * h * 0.26;
        const half = w * (0.42 + k * 0.29) * t.s;
        const p = document.createElementNS(SVGNS, 'path');
        p.setAttribute('d', `M ${bx} ${top} L ${bx + half} ${top + h * 0.42} L ${bx - half} ${top + h * 0.42} Z`);
        p.setAttribute('fill', greens[k]);
        inner.appendChild(p);
      }
      g.appendChild(inner);
      host.appendChild(g);
    });
  } else if (kind === 'beach') {
    // 液面海浪(两层) + 缓缓上升的气泡
    const wave = (y, color, width, op, cls) => {
      let d = `M 90 ${y}`;
      for (let x = 90; x < 350; x += 26) d += ` q 13 ${-8} 26 0`;
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', color);
      p.setAttribute('stroke-width', width);
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('opacity', op);
      p.setAttribute('class', cls);
      host.appendChild(p);
    };
    wave(390, '#8FD8D0', 3.2, 0.85, 'hw-wave');
    wave(399, '#BCEAE4', 2.4, 0.6, 'hw-wave wv2');
    for (let i = 0; i < 7; i++) {
      const c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', 150 + Math.random() * 150);
      c.setAttribute('cy', 540 + Math.random() * 30);
      c.setAttribute('r', 2 + Math.random() * 2.4);
      c.setAttribute('fill', 'rgba(188, 234, 228, 0.75)');
      c.setAttribute('class', 'hw-bubble');
      c.style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
      c.style.animationDuration = (2.4 + Math.random() * 1.6).toFixed(2) + 's';
      host.appendChild(c);
    }
  }
}

function initHealBottle() {
  const host = document.getElementById('healBottle');
  const btn = document.getElementById('healInjectBtn');
  const menu = document.getElementById('healInjectMenu');
  if (!host || !btn || !menu) return;

  // 克隆主页魔法瓶(复用整套质感 + 动画; SVG 渐变 id 引用会解析到主页 defs, 颜色联动)
  const srcSvg = document.querySelector('.logo-wrap .bottle-svg');
  if (srcSvg) {
    const clone = srcSvg.cloneNode(true);
    clone.removeAttribute('aria-label');
    host.insertBefore(clone, host.firstChild);
  }

  // 注入 → 展开/收起声音菜单
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = !menu.hidden;
    if (open) { menu.hidden = true; return; }
    // 同步当前激活项
    menu.querySelectorAll('button').forEach(b =>
      b.classList.toggle('active', b.dataset.weather === _healWeather.kind));
    menu.hidden = false;
  });
  menu.addEventListener('click', e => {
    const b = e.target.closest('button[data-weather]');
    if (!b) return;
    e.stopPropagation();
    const kind = b.dataset.weather;
    menu.hidden = true;
    if (_healWeather.kind === kind) {
      stopHealWeather();          // 再点同一个 = 关掉
      return;
    }
    btn.classList.remove('injecting');
    void btn.offsetWidth;         // 重置动画
    btn.classList.add('injecting');
    startHealWeather(kind);
  });
  // 点其它地方收起菜单
  document.addEventListener('click', () => { menu.hidden = true; });

  // v51: 停止按钮 —— 让瓶子里正在播放的声音停下来
  const stopBtn = document.getElementById('healStopBtn');
  if (stopBtn) {
    stopBtn.addEventListener('click', e => {
      e.stopPropagation();
      stopHealWeather();
    });
  }
  syncHealStopBtn();

  // 初始天气层内容(供 CSS 淡入)
  ['rain', 'forest', 'beach'].forEach(rebuildHealWeather);
}

/* v574+v597: 疗愈体验音频 —— 音乐轨(固定音量) + 人声轨(设置开关/音量, 播一遍)
   v597: 用户钦定"音乐固定三分半(3:30), 播完就安静结束, 不循环" —— 音乐=原文件
   《疗愈体验.wav》0-210s 精确裁切转码(3:30.02), 无其他处理; 人声=原文件《疗愈体验人声.wav》
   完整 3:21 零裁剪, 仅 +10dB 音量补偿(用户 v586 钦定的人声太小修正)。人声比音乐短约 9 秒,
   人声结束后是纯音乐收尾。两轨都用 Blob URL 本地播放, 不依赖服务器 seek */
let _healAudio = { music: null, voice: null };

/* v597: 预加载疗愈音乐/人声 → Blob URL 本地播放
   根治"3 分多就莫名拼接/跳回 0 重播"：CloudStudio 静态服务器不支持 Range 请求
   (Range 返回 200 非 206), 流式播放 seek 到缓冲边界会被服务器弹回 0。
   fetch 全文 + URL.createObjectURL 后, <audio> 读取的是本地 Blob, seek 不再依赖服务器。 */
let _healBlob = { music: null, voice: null };
function preloadHealAudio() {
  ['music', 'voice'].forEach(k => {
    const src = k === 'music' ? 'heal-music.mp3?v=597' : 'heal-voice.mp3?v=597';
    fetch(src)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(b => { _healBlob[k] = URL.createObjectURL(b); })
      .catch(() => { /* 预加载失败不阻塞 —— 播放时回退普通 URL */ });
  });
}
function healSrc(k) {
  return (_healBlob && _healBlob[k]) || (k === 'music' ? 'heal-music.mp3?v=597' : 'heal-voice.mp3?v=597');
}

function playHealAudio() {
  stopHealAudio();
  const m = new Audio(healSrc('music'));
  // v579: 音乐/人声完整播完一遍自然结束 —— 循环功能 v597 已彻底删除, 代码绝不自行 loop
  // (删掉 v576 的时长未知兜底 loop 与 error 兜底 loop, Safari duration=Infinity 会误触发)
  m.loop = false; m.volume = 0.9;
  m.addEventListener('loadedmetadata', () => {
    const d = m.duration;
    if (isFinite(d) && d > 0) {
      // 元数据就绪后(桌面端精确值)校正真实时长 —— 结束判断用
      healingState.totalMs = Math.round(d * 1000);
    }
    // v580: duration 未知(Safari 流式 Infinity)时保持 HEAL_MUSIC_SEC 常量兜底 —— 时长正确且不循环
  });
  // v577+v588: 音乐最后 6 秒 JS 音量渐隐到 0(不动音频文件), 结尾不再"咔"一下断。
  // v588: 原 isFinite(duration) 判断在 iPhone Safari 流式播放(duration=Infinity)下整段失效,
  // 改按固定总时长+currentTime 判断 —— 全平台结尾都平滑
  m.addEventListener('timeupdate', () => {
    const total = (healingState.totalMs / 1000) || HEAL_MUSIC_SEC;
    const ct = m.currentTime;
    if (!(ct >= 0) || isNaN(ct)) return;
    const remain = total - ct;
    const target = (remain > 0 && remain < 6) ? Math.max(0, remain / 6) * 0.9 : 0.9;
    if (Math.abs(m.volume - target) > 0.015) m.volume = target;
  });
  // v577: 音乐自然播完 → 雨声/森林/海浪一起渐隐 + 会话结束
  m.addEventListener('ended', () => {
    if (_healAudio.music !== m) return;
    finishHealSession();
  });
  m.play().catch(() => {});
  _healAudio.music = m;
  if (state.prefs.voice) startHealVoice();
}

/* v577+v597: 音乐结束的统一收尾 —— 天气音一起隐退, 会话结束(结束就结束, 绝不循环) */
function finishHealSession() {
  if (healingState.done) return;
  healingState.done = true;
  stopHealWeather(true);          // 雨声/森林/海浪一起渐弱隐退
  stopHealing(true);
  toast('疗愈完成 ✦  愿你被温柔以待');
  // v597: 「自动循环」已按用户要求彻底删除 —— 播完 3:30 就安静结束, 没声音就没声音, 不重开
}

function startHealVoice() {
  if (_healAudio.voice) return;
  const v = new Audio(healSrc('voice'));
  v.loop = false;
  v.volume = (state.prefs.voiceVol == null ? 1.0 : state.prefs.voiceVol);
  const music = _healAudio.music;
  // v575: 人声与音乐是同一首曲子的两个版本, 位置必须对齐 ——
  // 开启时从音乐当前播放位置续上, 绝不再从头开始
  const start = () => {
    const dur = v.duration || 0;
    let t = 0;
    if (music) {
      const mt = music.currentTime;
      if (isFinite(mt) && mt > 0) t = mt;
    }
    if (dur && t >= dur - 0.5) {
      // 音乐已经播到人声轨结束之后 → 人声段落已放完, 不再起播
      if (_healAudio.voice === v) _healAudio.voice = null;
      return;
    }
    if (t > 0 && dur) { try { v.currentTime = t; } catch (e) {} }
    v.play().catch(() => {});
    if (music && music.paused) v.pause();   // 会话暂停中开启人声 → 人声也保持暂停(位置已对齐)
  };
  if (v.readyState >= 1) start();
  else v.addEventListener('loadedmetadata', start, { once: true });
  // v575: 人声播完自动释放, 之后再次开启才能重新起播
  v.addEventListener('ended', () => {
    if (_healAudio.voice === v) _healAudio.voice = null;
  });
  _healAudio.voice = v;
}

function setHealVoice(on) {
  if (!_healAudio.music) return;   // 会话未在进行中, 不做事
  if (on) startHealVoice();
  else if (_healAudio.voice) {
    _healAudio.voice.pause();
    _healAudio.voice = null;
  }
}

function stopHealAudio() {
  if (_healAudio.music) { _healAudio.music.pause(); _healAudio.music = null; }
  if (_healAudio.voice) { _healAudio.voice.pause(); _healAudio.voice = null; }
}

/* 人声音量滑杆 UI 同步(轨道填充 + 百分比文字) */
function syncVoiceVolUI() {
  const v = Math.round((state.prefs.voiceVol == null ? 1.0 : state.prefs.voiceVol) * 100);
  const el = document.getElementById('prefVoiceVol');
  const lab = document.getElementById('prefVoiceVolVal');
  if (el) {
    el.value = v;
    el.style.background = 'linear-gradient(90deg, var(--accent) 0%, var(--accent) ' + v +
      '%, var(--ink-faint) ' + v + '%)';
  }
  if (lab) lab.textContent = v + '%';
}

function startHealing() {
  const planKey = state.prefs.plan || 'release';   // v575: 偏好方案已移除, 默认释怀微风
  const plan = PLANS[planKey];
  if (!plan) return;

  stopHealing(true);

  document.getElementById('stageIdle').hidden = true;
  document.getElementById('stageActive').hidden = false;
  // v594: 无进度条 —— 时长只用于内部结束判断, 不显示

  healingState.startedAt = Date.now();
  healingState.totalMs = HEAL_MUSIC_SEC * 1000;
  healingState.cues = plan.cues;
  healingState.paused = false;
  healingState.idx = 0;
  healingState.done = false;   // v577: 复位结束标志(音乐自然结束用)

  // v574: 启动疗愈音乐(固定音量) + 人声层(跟随设置)
  playHealAudio();

  // 启动间歇式语音(有真人声轨时自动跳过, 避免双声)
  speakIfAllowed(plan.cues[0][1]);

  // 主循环(1秒一次)
  tickHealing();
  healingState.timer = setInterval(tickHealing, 1000);
  // 监听 visibilitychange,页面切走时暂停语音提示但不暂停计时
}

function tickHealing() {
  const elapsed = Date.now() - healingState.startedAt;
  const remain = Math.max(0, healingState.totalMs - elapsed);
  const sec = Math.floor(remain / 1000);

  // 阶段提示 (v576: 按剩余比例, 适配音乐时长)
  const stage = document.getElementById('bcLabel');
  const ratio = healingState.totalMs ? sec / (healingState.totalMs / 1000) : 1;
  if (ratio < 0.2) stage.textContent = '即将结束...';
  else if (ratio < 0.6) stage.textContent = '收束,准备回到当下';
  else stage.textContent = '跟着圆一起呼吸';

  // 触发计划中的语音提示
  const elapsedSec = Math.floor(elapsed / 1000);
  const nextIdx = healingState.idx + 1;
  if (healingState.cues[nextIdx] && elapsedSec >= healingState.cues[nextIdx][0]) {
    healingState.idx = nextIdx;
    speakIfAllowed(healingState.cues[nextIdx][1]);
  }

  // 结束 (v588: 只认「音乐真实播完」。纯时钟判断在缓冲/卡顿/iOS 切后台时
  // 会跑在媒体前面 → 音乐没播完就被强制收尾(用户:"没播完就停了/又从头")。
  // 时钟到但媒体未到 → 把时钟拽回媒体位置继续等, 直到音乐真正播完)
  if (remain <= 0) {
    const mu = _healAudio.music;
    const pos = (mu && !isNaN(mu.currentTime) && isFinite(mu.currentTime))
      ? mu.currentTime : null;
    const totalSec = healingState.totalMs / 1000;
    const realDone = !mu || mu.ended || (pos !== null && pos >= totalSec - 2);
    if (realDone) {
      finishHealSession();
    } else {
      // 时钟到但音乐未到 → 把时钟拽回音乐真实位置继续等
      if (pos !== null) healingState.startedAt = Date.now() - Math.round(pos * 1000);
    }
  }
}

function togglePause() {
  const btn = document.getElementById('pauseBtn');
  if (healingState.paused) {
    // v575 修复: 暂停态(timer=null)时点"继续"必须生效
    btn.textContent = '暂停';
    healingState.paused = false;
    // v594: 无进度条 —— 暂停恢复从音乐真实位置续播(v588 铁律: 只认媒体真实位置)
    const _pm = _healAudio.music;
    const _pos = (_pm && !isNaN(_pm.currentTime) && isFinite(_pm.currentTime))
      ? _pm.currentTime : 0;
    healingState.startedAt = Date.now() - Math.round(_pos * 1000);
    healingState.timer = setInterval(tickHealing, 1000);
    // v589: iOS Safari 上暂停后再次 play() 可能因 user activation / 缓冲排队而失败,
    // 失败时回退 currentTime 微调重试一次(经典 workaround), 并保持 UI 状态正确
    const resumePlay = (a) => {
      if (!a) return;
      a.play().catch(() => {
        try { a.currentTime += 0.01; } catch (e) {}
        a.play().catch(() => {});
      });
    };
    resumePlay(_healAudio.music);
    resumePlay(_healAudio.voice);
    try { speakIfAllowed('我们继续。'); } catch (e) {}
  } else {
    if (!healingState.timer) return;   // 会话未在运行
    clearInterval(healingState.timer);
    healingState.timer = null;
    healingState.paused = true;
    btn.textContent = '继续';
    try { window.speechSynthesis?.cancel(); } catch (e) {}
    if (_healAudio.music) { try { _healAudio.music.pause(); } catch (e) {} }
    if (_healAudio.voice) { try { _healAudio.voice.pause(); } catch (e) {} }
  }
}

function stopHealing(silent) {
  if (healingState.timer) { clearInterval(healingState.timer); healingState.timer = null; }
  stopHealAudio();   // v574: 音乐 + 人声一起停
  window.speechSynthesis?.cancel();
  document.getElementById('stageIdle').hidden = false;
  document.getElementById('stageActive').hidden = true;
  document.getElementById('pauseBtn').textContent = '暂停';
  if (!silent) toast('已结束疗愈,可随时再开始');
}

function speakIfAllowed(text) {
  if (_healAudio.voice) return;   // v574: 真人声轨在播, 不用 TTS, 避免双声
  if (!state.prefs.voice || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.9;
    u.pitch = 1.0;
    u.volume = 0.8;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}


/* ============================================
   设置 — 主题 + 偏好
   ============================================ */
function bindSettings() {
  document.querySelectorAll('.theme-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const t = chip.dataset.theme;
      state.prefs.theme = t;
      state.prefs.customAccent = null;
      state.prefs.customBg = null;
      applyTheme(t);
      document.querySelectorAll('.theme-chip').forEach(c =>
        c.classList.toggle('active', c === chip));
      syncCustomInputs();
      savePrefs();
      toast('已切换到「' + chip.textContent.trim() + '」主题');
    });
  });

  // 两个圆圈取色器: 主色(accent) + 底色(背景), 均即选即用
  const customInput = document.getElementById('customColor');
  const bgInput = document.getElementById('customBg');

  function syncCustomInputs() {
    const t = THEMES[state.prefs.theme] || THEMES.cream;
    customInput.value = state.prefs.customAccent || t.accent;
    bgInput.value = state.prefs.customBg || t.bg1;
  }

  customInput.addEventListener('input', () => {
    state.prefs.customAccent = customInput.value;
    applyTheme(state.prefs.theme, customInput.value, state.prefs.customBg);
    document.querySelectorAll('.theme-chip').forEach(c => c.classList.remove('active'));
    savePrefs();
  });
  customInput.addEventListener('change', () => toast('主色已更新'));

  bgInput.addEventListener('input', () => {
    state.prefs.customBg = bgInput.value;
    applyTheme(state.prefs.theme, state.prefs.customAccent, bgInput.value);
    document.querySelectorAll('.theme-chip').forEach(c => c.classList.remove('active'));
    savePrefs();
  });
  bgInput.addEventListener('change', () => toast('底色已更新'));

  document.getElementById('resetColor').addEventListener('click', () => {
    state.prefs.customAccent = null;
    state.prefs.customBg = null;
    state.prefs.theme = 'cream';
    applyTheme('cream');
    document.querySelectorAll('.theme-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.theme === 'cream'));
    syncCustomInputs();
    savePrefs();
    toast('已恢复默认主题');
  });

  /* ---- v35: 自定义字体(标题 / 正文), 即选即用 ---- */
  const fontBrandSel = document.getElementById('fontBrand');
  const fontBodySel = document.getElementById('fontBody');
  if (fontBrandSel && fontBodySel) {
    fontBrandSel.value = localStorage.getItem('ma_font_brand') || 'classic';
    fontBodySel.value = localStorage.getItem('ma_font_body') || 'kai';
    fontBrandSel.addEventListener('change', () => {
      localStorage.setItem('ma_font_brand', fontBrandSel.value);
      applyFonts();
      toast('标题字体换好啦');
    });
    fontBodySel.addEventListener('change', () => {
      localStorage.setItem('ma_font_body', fontBodySel.value);
      applyFonts();
      toast('正文字体换好啦');
    });
    const resetFontsBtn = document.getElementById('resetFonts');
    if (resetFontsBtn) resetFontsBtn.addEventListener('click', () => {
      localStorage.removeItem('ma_font_brand');
      localStorage.removeItem('ma_font_body');
      fontBrandSel.value = 'classic';
      fontBodySel.value = 'kai';
      applyFonts();
      toast('字体恢复默认啦');
    });
  }

  /* ---- v35: 魔法瓶颜色(液体 / 烟雾), 即选即用 ---- */
  const bottleLiquidIn = document.getElementById('bottleLiquid');
  const bottleSmokeIn = document.getElementById('bottleSmoke');
  if (bottleLiquidIn && bottleSmokeIn) {
    const savedBottle = loadJSON('ma_bottle', null);
    if (savedBottle) {
      if (savedBottle.liquid) bottleLiquidIn.value = savedBottle.liquid;
      if (savedBottle.smoke) bottleSmokeIn.value = savedBottle.smoke;
    }
    const saveBottle = () => {
      saveJSON('ma_bottle', { liquid: bottleLiquidIn.value, smoke: bottleSmokeIn.value });
      applyBottleColors(bottleLiquidIn.value, bottleSmokeIn.value);
    };
    bottleLiquidIn.addEventListener('input', saveBottle);
    bottleSmokeIn.addEventListener('input', saveBottle);
    bottleLiquidIn.addEventListener('change', () => toast('魔法瓶液体颜色换好啦'));
    bottleSmokeIn.addEventListener('change', () => toast('魔法瓶烟雾颜色换好啦'));
    const resetBottleBtn = document.getElementById('resetBottle');
    if (resetBottleBtn) resetBottleBtn.addEventListener('click', () => {
      localStorage.removeItem('ma_bottle');
      bottleLiquidIn.value = '#9F86EC';
      bottleSmokeIn.value = '#B89AF0';
      applyBottleColors(null, null);
      toast('魔法瓶恢复默认颜色啦');
    });
  }

  /* ---- v35: 全部恢复默认(颜色 + 字体 + 魔法瓶, 不动账号和音频) ---- */
  const resetAllBtn = document.getElementById('resetAll');
  if (resetAllBtn) resetAllBtn.addEventListener('click', () => {
    // 颜色
    state.prefs.customAccent = null;
    state.prefs.customBg = null;
    state.prefs.theme = 'cream';
    applyTheme('cream');
    document.querySelectorAll('.theme-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.theme === 'cream'));
    syncCustomInputs();
    savePrefs();
    // 字体
    localStorage.removeItem('ma_font_brand');
    localStorage.removeItem('ma_font_body');
    if (fontBrandSel) fontBrandSel.value = 'classic';
    if (fontBodySel) fontBodySel.value = 'kai';
    applyFonts();
    // 魔法瓶
    localStorage.removeItem('ma_bottle');
    if (bottleLiquidIn) bottleLiquidIn.value = '#9F86EC';
    if (bottleSmokeIn) bottleSmokeIn.value = '#B89AF0';
    applyBottleColors(null, null);
    toast('🎨 全部恢复默认啦');
  });

  document.getElementById('prefVoice').addEventListener('change', e => {
    state.prefs.voice = e.target.checked; savePrefs();
    setHealVoice(e.target.checked);      // v574: 疗愈进行中实时开关人声层
    toast(e.target.checked ? '已开启语音引导' : '已关闭语音引导');
  });
  // v574: 人声音量滑杆 —— 只影响疗愈之旅的人声层, 音乐音量不变
  const volEl = document.getElementById('prefVoiceVol');
  if (volEl) {
    // v586: input + change 双绑 —— iOS Safari 拖动 range 时 input 可能不连续触发,
    // change(松手)兜底, 保证任何浏览器调节都实时生效
    const onVolInput = () => {
      state.prefs.voiceVol = Number(volEl.value) / 100;
      syncVoiceVolUI();
      savePrefs();
      if (_healAudio.voice) _healAudio.voice.volume = state.prefs.voiceVol;
    };
    volEl.addEventListener('input', onVolInput);
    volEl.addEventListener('change', onVolInput);
  }
  // v597: 「自动循环」开关与逻辑已彻底删除(用户钦定), 不再有 prefLoop 监听

  /* ---- v52: 群主专属 · 一键清场 (rosa only) ---- */
  bindAdminCleanup();
}

/* v52.3: 群主工具显隐 —— 正常登录的 ma_user 没有 id 字段, 改按昵称 rosa 识别; 每次进设置页都刷新 */
function bindAdminCleanup() {
  const adminCard = document.getElementById('adminCleanupCard');
  if (!adminCard) return;
  const u = currentUser();
  const isRosa = !!u && (u.name === 'rosa' || u.id === '064f4e84-6ca0-42ac-916e-3b9efcc84fc8');
  adminCard.hidden = !isRosa;
  if (!isRosa) return;
  if (!adminCard.dataset.bound) {
    adminCard.dataset.bound = '1';
    const statusEl = document.getElementById('adminStatus');
    const cleanupBtn = document.getElementById('adminCleanupBtn');
    const unhideBtn = document.getElementById('adminUnhideBtn');
    if (cleanupBtn) cleanupBtn.addEventListener('click', () => adminCleanup(statusEl));
    if (unhideBtn) unhideBtn.addEventListener('click', () => adminUnhide(statusEl));
  }
}

/* v52: 群主一键隐藏非真人账号 (调 Supabase RPC) */
async function adminCleanup(statusEl) {
  if (!window.supabase || !COMMUNITY_CONF || !COMMUNITY_CONF.SUPABASE_URL) {
    if (statusEl) statusEl.textContent = '❌ Supabase 未配置，无法清场';
    return;
  }
  if (!confirm('确认隐藏所有非真人账号？\n\n保留：rosa / Elio / wjw\n隐藏：测试号、bot、幽灵账号、新路人注册等\n\n可随时点"显示全部"撤回。')) return;
  try {
    if (statusEl) statusEl.textContent = '⏳ 清场中…';
    const sb = window.supabase.createClient(COMMUNITY_CONF.SUPABASE_URL, COMMUNITY_CONF.SUPABASE_ANON_KEY);
    const wl = [
      '064f4e84-6ca0-42ac-916e-3b9efcc84fc8',  // rosa
      '48a1694c-6ef2-421c-9d57-ae7f58e15620',  // Elio
      '2dc32b28-5b96-430d-9289-fcf1ff3652e2',  // wjw
    ];
    const { data, error } = await sb.rpc('admin_hide_non_real', { p_whitelist: wl });
    if (error) throw error;
    let total = 0;
    if (data) data.forEach(r => total += r.count);
    if (statusEl) statusEl.textContent = '✅ 已隐藏 ' + total + ' 条记录（资料 + 发言）';
    toast('✅ 清场完成，' + total + ' 条已隐藏');
    setTimeout(() => location.reload(), 1500);
  } catch (e) {
    if (statusEl) statusEl.textContent = '❌ ' + (e.message || e);
    toast('❌ 清场失败：' + (e.message || e));
  }
}

async function adminUnhide(statusEl) {
  if (!window.supabase || !COMMUNITY_CONF || !COMMUNITY_CONF.SUPABASE_URL) {
    if (statusEl) statusEl.textContent = '❌ Supabase 未配置';
    return;
  }
  if (!confirm('撤回隐藏，恢复显示所有账号？')) return;
  try {
    if (statusEl) statusEl.textContent = '⏳ 撤回中…';
    const sb = window.supabase.createClient(COMMUNITY_CONF.SUPABASE_URL, COMMUNITY_CONF.SUPABASE_ANON_KEY);
    const { data, error } = await sb.rpc('admin_unhide_all');
    if (error) throw error;
    if (statusEl) statusEl.textContent = '✅ 已恢复 ' + data + ' 个账号';
    toast('✅ 已恢复全部账号');
    setTimeout(() => location.reload(), 1500);
  } catch (e) {
    if (statusEl) statusEl.textContent = '❌ ' + (e.message || e);
    toast('❌ 撤回失败：' + (e.message || e));
  }
}

/* ============================================
   魔法变身: 空瓶 → 点击「注入灵感」 → 满瓶
   ============================================ */
function bindLogo() {
  const logoWrap = document.querySelector('.logo-wrap');
  const trigger  = document.querySelector('.logo-trigger');
  const hint     = document.querySelector('.hint-arrow');
  const card     = document.getElementById('magicCardOverlay');
  if (!logoWrap || !trigger) return;

  // 每次进入都是空瓶(HTML 已带 is-empty, 无需兜底)
  // logoWrap.classList.add('is-empty');  // 已由 HTML 默认设置

  const goShop = () => {
    showView('shop');
    history.replaceState(null, '', '#shop');
    document.querySelectorAll('.nav-link').forEach(l =>
      l.classList.toggle('active', l.getAttribute('href') === '#shop'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // v45: 注入灵感动画播完后弹「魔法刷子」卡片
  function showMagicCard() {
    if (!card || trigger.dataset.charged !== '1') return;
    card.classList.add('open');
    card.setAttribute('aria-hidden', 'false');
    const btn = card.querySelector('.mc-btn');
    if (btn) btn.focus({ preventScroll: true });
  }

  trigger.addEventListener('click', e => {
    e.preventDefault();
    if (logoWrap.classList.contains('is-empty')) {
      // v45: 注入灵感只能点一次 —— 触发魔法变身, 之后按钮永久失效(不跳转)
      logoWrap.classList.remove('is-empty');
      logoWrap.classList.add('is-charged');
      trigger.dataset.charged = '1';
      trigger.classList.add('is-used');
      // v49: 开头变身音效保持水晶钵(不换竖琴; 竖琴只给卡片「点击开启」按钮)
      playHealingChime();
      toast('灵感注入中 ✦ 见证魔法变身');
      // 变身时序: 液体 1.4s 延迟 + 2.2s 升起, 烟雾/星光/音符 ~4.6s 收尾 → 4.7s 弹卡片
      setTimeout(showMagicCard, 4700);
    }
    // 已注入过: 按钮不再有任何反应, 前往下一页请点下方「购买疗愈方案」
  });

  // v45: 卡片「点击开启」→ 卡片消失, 用户继续操作
  // v49: 点击开启按钮换成竖琴音效
  if (card) {
    const openBtn = card.querySelector('.mc-btn');
    if (openBtn) {
      openBtn.addEventListener('click', e => {
        e.stopPropagation();
        card.classList.add('closing');
        playHarpChime();
        setTimeout(() => {
          card.classList.remove('open', 'closing');
          card.setAttribute('aria-hidden', 'true');
        }, 460);
      });
    }
  }

  if (hint) {
    hint.addEventListener('click', e => { e.preventDefault(); goShop(); });
  }
}

/* 注入灵感音效 = 水晶钵 bowl.wav（用户钦定, 不许再动） */
const _bowl = { buf: null, fetching: null };
if (typeof window !== 'undefined') window._bowl = _bowl;  // 测试 / 调试可见
async function loadBowlAudio() {
  if (_bowl.buf) return _bowl.buf;
  if (_bowl.fetching) return _bowl.fetching;
  _bowl.fetching = (async () => {
    try {
      const ctx = ensureAudioCtx(); if (!ctx) { _bowl.fetching = null; return null; }
      const res = await fetch('bowl.wav', { cache: 'force-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const arr = await res.arrayBuffer();
      _bowl.buf = await ctx.decodeAudioData(arr);
      return _bowl.buf;
    } catch (e) {
      console.warn('bowl.wav 加载失败, 用合成钵声兜底', e);
      return null;
    } finally {
      _bowl.fetching = null;
    }
  })();
  return _bowl.fetching;
}

/* 点击「注入灵感」时, 播放水晶钵音效（bowl.wav） */
let _audioCtx;
function playHealingChime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_audioCtx) _audioCtx = new AC();
    const ctx = _audioCtx;
    if (ctx.state === 'suspended') ctx.resume();

    // 优先播放预载的水晶钵录音
    // v45: 完整播放整段音频 —— 不再截头去尾, 只留 30ms 防爆音包络
    if (_bowl.buf) {
      const t = ctx.currentTime + 0.02;
      const src = ctx.createBufferSource();
      src.buffer = _bowl.buf;
      const g = ctx.createGain();
      const dur = _bowl.buf.duration;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.85, t + 0.03);
      g.gain.setValueAtTime(0.85, t + Math.max(0.06, dur - 0.05));
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      src.connect(g); g.connect(ctx.destination);
      src.start(t);
      src.stop(t + dur + 0.05);
      // 顺手预热下一次
      loadBowlAudio();
      return;
    }
    // 启动后台加载(下次就有 wav 用了)
    loadBowlAudio();

    const t0 = ctx.currentTime + 0.02;

    // 总线: 低通滤掉毛刺感, 整体极缓淡入淡出
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.exponentialRampToValueAtTime(0.26, t0 + 1.1);   // 1.1s 缓起, 像钵被轻轻摩响
    master.gain.exponentialRampToValueAtTime(0.0001, t0 + 6.5);  // 长尾自然消散
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1500;
    lp.Q.value = 0.6;
    master.connect(lp); lp.connect(ctx.destination);

    // 一只水晶钵 = 基频双振荡微失谐(缓慢拍频"吟唱") + 两个极弱非谐泛音
    const bowl = (freq, start, peak, dur) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(peak, start + 0.9);    // 慢起音, 不敲击
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur); // 长衰减
      g.connect(master);
      // 基频: 两个正弦微失谐 → 水晶钵特有的呼吸感拍频(~1.4Hz)
      [0, 11].forEach(cents => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq;
        o.detune.value = cents;
        o.connect(g); o.start(start); o.stop(start + dur + 0.1);
      });
      // 非谐泛音(真实水晶钵 ~2.76f / ~5.4f, 非常弱, 只添"玻璃光泽")
      [[2.76, 0.07], [5.4, 0.03]].forEach(([ratio, vol]) => {
        const p = ctx.createOscillator();
        p.type = 'sine'; p.frequency.value = freq * ratio;
        const pg = ctx.createGain(); pg.gain.value = vol;
        p.connect(pg); pg.connect(g);
        p.start(start); p.stop(start + dur + 0.1);
      });
    };

    bowl(196, t0, 0.5, 6.0);            // 主钵 G3, 低沉安定
    bowl(293.66, t0 + 1.4, 0.26, 4.6);  // 1.4s 后五度轻和(D4), 像第二只钵被唤起
  } catch (e) { /* 静默失败 */ }
}

/* v49: 预载竖琴 wav —— 魔法卡片「点击开启」按钮的音效, 完整播放 */
const _harp = { buf: null, fetching: null };
if (typeof window !== 'undefined') window._harp = _harp;  // 测试 / 调试可见
async function loadHarpAudio() {
  if (_harp.buf) return _harp.buf;
  if (_harp.fetching) return _harp.fetching;
  _harp.fetching = (async () => {
    try {
      const ctx = ensureAudioCtx(); if (!ctx) { _harp.fetching = null; return null; }
      const res = await fetch('harp.wav', { cache: 'force-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const arr = await res.arrayBuffer();
      _harp.buf = await ctx.decodeAudioData(arr);
      return _harp.buf;
    } catch (e) {
      console.warn('竖琴.wav 加载失败, 用合成钵声兜底', e);
      return null;
    } finally {
      _harp.fetching = null;
    }
  })();
  return _harp.fetching;
}

/* 魔法卡片「点击开启」按钮: 播放整段竖琴 wav(完整, 不截断) */
function playHarpChime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_audioCtx) _audioCtx = new AC();
    const ctx = _audioCtx;
    if (ctx.state === 'suspended') ctx.resume();

    if (_harp.buf) {
      const t = ctx.currentTime + 0.02;
      const src = ctx.createBufferSource();
      src.buffer = _harp.buf;
      const g = ctx.createGain();
      const dur = _harp.buf.duration;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.9, t + 0.03);
      g.gain.setValueAtTime(0.9, t + Math.max(0.06, dur - 0.05));
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      src.connect(g); g.connect(ctx.destination);
      src.start(t);
      src.stop(t + dur + 0.05);
      loadHarpAudio();   // 顺手预热
      return;
    }
    // 还没加载好: 后台拉取 + 先用合成钵声兜底(下次就有竖琴了)
    loadHarpAudio();
    playHealingChime();
  } catch (e) { /* 静默失败 */ }
}

function applyTheme(themeKey, customAccent, customBg) {
  const accent = customAccent || (THEMES[themeKey] || THEMES.cream).accent;
  const t = THEMES[themeKey] || THEMES.cream;

  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--accent-soft', withAlpha(accent, 0.55));
  document.documentElement.style.setProperty('--accent-deep', withAlpha(accent, 0.85));

  // 底色: 自定义时 bg1 用所选色, bg2 按它加深一档(保持预设主题同样的层次感)
  if (customBg) {
    document.documentElement.style.setProperty('--bg-1', customBg);
    document.documentElement.style.setProperty('--bg-2', darken(customBg, 0.08));
  } else {
    document.documentElement.style.setProperty('--bg-1', t.bg1);
    document.documentElement.style.setProperty('--bg-2', t.bg2);
  }

  // 自定义主色时,把深色也做一个简易变暗
  if (customAccent) {
    document.documentElement.style.setProperty('--accent-deep', darken(customAccent, 0.25));
  }
}

// 简易颜色工具
function hexToRgb(hex) {
  const m = hex.replace('#','').match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return [0,0,0];
  return [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
}
function withAlpha(hex, a) {
  const [r,g,b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function darken(hex, ratio) {
  const [r,g,b] = hexToRgb(hex);
  const d = (v) => Math.max(0, Math.floor(v * (1 - ratio)));
  return '#' + [d(r),d(g),d(b)].map(x => x.toString(16).padStart(2,'0')).join('');
}


/* ============================================
   模态 + Toast
   ============================================ */
function openModal(title = '说明视频') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modal').hidden = false;
}
function closeModal() { document.getElementById('modal').hidden = true; }

document.addEventListener('click', e => {
  if (e.target.matches('[data-close]')) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2400);
}


/* ============================================
   解压游戏 + ASMR 助眠音
   ============================================ */

/* ---------- 共用音频 ---------- */
function ensureAudioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!_audioCtx) _audioCtx = new AC();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

let _sfxBuf = null;
function sfxNoise(ctx) {
  if (_sfxBuf && _sfxBuf.sampleRate === ctx.sampleRate) return _sfxBuf;
  const len = Math.floor(ctx.sampleRate * 0.12);
  const b = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  _sfxBuf = b;
  return b;
}

/* 噪声缓冲(white/pink/brown) —— ASMR 循环音源共用, 按类型+采样率+时长缓存 */
const _noiseCache = {};
function noiseBuffer(ctx, type, seconds) {
  const key = type + '@' + ctx.sampleRate + '@' + seconds;
  if (_noiseCache[key]) return _noiseCache[key];
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (type === 'pink') {
    // Paul Kellet 粉噪近似
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else if (type === 'brown') {
    // 布朗噪声: 积分白噪
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  } else {
    // 白噪
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  _noiseCache[key] = buf;
  return buf;
}

/* ============================================
   音频槽位系统 —— 全站每个声音一个槽位
   默认代码合成; 用户可在设置区上传音频文件
   替换(存 IndexedDB), 之后全站播放走替换文件
   ============================================ */
const _customBufs = {};   // slotId -> AudioBuffer(已解码, 内存缓存)
const _customMeta = {};   // slotId -> { name }
const _fileBufs = {};     // slotId -> AudioBuffer(内置高品质音源懒加载缓存, 如 amb-*.mp3)

const audioDB = {
  _db: null,
  open() {
    return new Promise(resolve => {
      if (this._db) return resolve(this._db);
      const req = indexedDB.open('musicAromaAudio', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('slots')) db.createObjectStore('slots', { keyPath: 'id' });
      };
      req.onsuccess = () => { this._db = req.result; resolve(this._db); };
      req.onerror = () => resolve(null);
    });
  },
  async get(id) {
    const db = await this.open(); if (!db) return null;
    return new Promise(resolve => {
      const r = db.transaction('slots', 'readonly').objectStore('slots').get(id);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => resolve(null);
    });
  },
  async set(id, file, name) {
    const db = await this.open(); if (!db) return false;
    return new Promise(resolve => {
      const tx = db.transaction('slots', 'readwrite');
      tx.objectStore('slots').put({ id, file, name });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  },
  async del(id) {
    const db = await this.open(); if (!db) return;
    return new Promise(resolve => {
      const tx = db.transaction('slots', 'readwrite');
      tx.objectStore('slots').delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  },
  async clear() {
    const db = await this.open(); if (!db) return false;
    return new Promise(resolve => {
      const tx = db.transaction('slots', 'readwrite');
      tx.objectStore('slots').clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  },
  /* v48: 清空全部但保留用户上传的助眠音(asmr.user*) */
  async clearUserSlotsExceptUploads() {
    const db = await this.open(); if (!db) return false;
    return new Promise(resolve => {
      const tx = db.transaction('slots', 'readwrite');
      const store = tx.objectStore('slots');
      const req = store.openCursor();
      req.onsuccess = () => {
        const cur = req.result;
        if (!cur) return;
        if (!String(cur.value && cur.value.id || '').startsWith('asmr.user')) cur.delete();
        cur.continue();
      };
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  },
};

/* 页面空闲时预载全部自定义音频, 播放时同步命中缓存 */
async function preloadCustomAudio() {
  try {
    const db = await audioDB.open(); if (!db) return;
    const keys = await new Promise(resolve => {
      const r = db.transaction('slots', 'readonly').objectStore('slots').getAllKeys();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => resolve([]);
    });
    const ctx = ensureAudioCtx(); if (!ctx) return;
    for (const id of keys) {
      try {
        const rec = await audioDB.get(id);
        if (!rec || !rec.file) continue;
        const buf = await ctx.decodeAudioData(await rec.file.arrayBuffer());
        _customBufs[id] = buf;
        _customMeta[id] = { name: rec.name || '自定义' };
      } catch (e) { /* 该文件解码失败就继续用合成 */ }
    }
  } catch (e) {}
}

function playFileBuffer(buf, volume, rate) {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = rate || 1;
  const g = ctx.createGain();
  // v551: 真实文件音效整体降 0.55, 防止个别采样过亮吓到用户; 传入 volume 仍可叠加
  const FILE_SFX_GAIN = 0.55;
  const vol = (volume != null ? volume : 0.8) * FILE_SFX_GAIN;
  const t0 = ctx.currentTime;
  const dur = buf.duration / (rate || 1);
  // v548: 首尾渐变 —— 12ms 渐入防爆点, 尾部 150ms 渐出消除"戛然而止"
  if (dur > 0.25) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.setValueAtTime(vol, t0 + Math.max(0.012, dur - 0.15));
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  } else {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + dur * 0.2);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  }
  src.connect(g); g.connect(ctx.destination);
  src.start();
}

/* v546: 音频文件统一缓存版本(内容更新后强制刷新) */
function slotFileUrl(slot) { return slot.file + (slot.file.indexOf('?') >= 0 ? '&' : '?') + 'v=601'; }

/* 短音效统一入口: 优先用户自定义文件, 其次内置真实采样懒加载, 最后合成兜底 */
function playSfx(slotId, opts) {
  const slot = AUDIO_SLOTS[slotId];
  if (!slot) return;
  const now = performance.now();
  if (slot.throttle && now - (slot._last || 0) < slot.throttle) return;
  slot._last = now;
  const buf = _customBufs[slotId];
  if (buf) {
    playFileBuffer(buf, opts && opts.volume, opts && opts.rate);
    return;
  }
  // v538: 内置真实采样懒加载(异步 fetch 一次, 失败回落合成; 播放过即缓存 _fileBufs)
  if (slot.file) {
    if (_fileBufs[slotId]) {
      playFileBuffer(_fileBufs[slotId], opts && opts.volume, opts && opts.rate);
      return;
    }
    if (!slot._loading) {
      slot._loading = true;
      fetch(slotFileUrl(slot))
        .then(r => { if (!r.ok) throw new Error('file ' + r.status); return r.arrayBuffer(); })
        .then(ab => {
          const ctx = ensureAudioCtx();
          if (!ctx) throw new Error('no ctx');
          return ctx.decodeAudioData(ab);
        })
        .then(b => {
          slot._loading = false;
          _fileBufs[slotId] = b;
          playFileBuffer(b, opts && opts.volume, opts && opts.rate);
        })
        .catch(() => {
          slot._loading = false;
          try { slot.synth(opts); } catch (e) {}
        });
    }
    return;
  }
  try { slot.synth(opts); } catch (e) {}
}

/* 循环音源(ASMR)统一入口: 返回 {ctx, master, stops} 供 smoothStop */
async function startLoopSound(slotId) {
  const ctx = ensureAudioCtx();
  if (!ctx) return null;
  const slot = AUDIO_SLOTS[slotId];
  if (!slot) return null;
  let buf = _customBufs[slotId];
  // v51: 内置高品质音源(amb-*.mp3)懒加载 —— 优先用户自定义, 其次内置文件, 最后合成兜底
  if (!buf && slot.file) {
    try {
      if (!_fileBufs[slotId]) {
        const res = await fetch(slotFileUrl(slot));
        if (!res.ok) throw new Error('file ' + res.status);
        _fileBufs[slotId] = await ctx.decodeAudioData(await res.arrayBuffer());
      }
      buf = _fileBufs[slotId];
    } catch (e) { buf = null; }
  }
  if (buf) {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.7);
    master.connect(ctx.destination);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(master);
    src.start();
    return { ctx, master, stops: [() => src.stop()] };
  }
  return slot.synth(ctx);
}

/* 平滑停止(startLoopSound 返回的 nodes, 或任何带 ctx/master/stops/stop 的对象)
 * v51 补: 之前缺失导致 stopHealWeather / asmr 卡片停止都"点了没反应"
 *  渐弱 master gain → 400ms 后调用 stops/stop 真正停源 → 500ms 后 disconnect
 *  静默吞错(多源安全, 单个节点失败不影响其他) */
function smoothStop(nodes) {
  if (!nodes) return;
  const ctx = (nodes && nodes.ctx) || (typeof ensureAudioCtx === 'function' ? ensureAudioCtx() : null);
  const t = (ctx && ctx.currentTime) || 0;
  // 1) 渐弱 master gain(0.35s 收到几乎 0, 耳朵无感)
  try {
    const g = nodes.master && nodes.master.gain;
    if (g && ctx) {
      const cur = (typeof g.value === 'number') ? g.value : 0.0001;
      g.cancelScheduledValues(t);
      g.setValueAtTime(cur, t);
      g.linearRampToValueAtTime(0.0001, t + 0.35);
    }
  } catch (e) {}
  // 2) 收集所有停止函数(支持 stops 数组 + 直接 stop 方法)
  const stops = [];
  if (Array.isArray(nodes.stops)) for (const fn of nodes.stops) if (typeof fn === 'function') stops.push(fn);
  if (typeof nodes.stop === 'function') stops.push(nodes.stop);
  // 3) 400ms 后真正 stop 源(留点时间让渐弱播完)
  if (stops.length) {
    setTimeout(() => { for (const fn of stops) { try { fn(); } catch (e) {} } }, 400);
  }
  // 4) 500ms 后 disconnect(防止残余)
  setTimeout(() => {
    try { if (nodes.master) nodes.master.disconnect(); } catch (e) {}
    try { if (nodes.src) nodes.src.disconnect(); } catch (e) {}
  }, 500);
}

/* ---- 新游戏音效(烤棉花糖 / 冰激凌机 / 木鱼 / 蒸馏 / 汽水 / 抽象球) ---- */

/* 炭火"滋滋"油爆: 高频窄带噪声 + 音量快速抖动 */
function sizzleSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const dur = 0.22 + Math.random() * 0.1;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'white', 0.4);
  src.playbackRate.value = 1.2 + Math.random() * 0.4;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.Q.value = 3.5;
  const f0 = 5200 + Math.random() * 1800;
  bp.frequency.setValueAtTime(f0, t);
  bp.frequency.linearRampToValueAtTime(f0 * 0.8, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.015);
  // 用 setValueCurve 模拟油爆抖动太麻烦, 手动两三个峰
  g.gain.linearRampToValueAtTime(0.02, t + dur * 0.4);
  g.gain.linearRampToValueAtTime(0.06, t + dur * 0.62);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.02);
}

/* 火苗"噼啪": 2-3 个极短高频脉冲 */
function flameSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const n = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < n; i++) {
    const at = t + Math.random() * 0.18;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 'white', 0.09);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2600 + Math.random() * 2500;
    const g = ctx.createGain();
    const peak = 0.02 + Math.random() * 0.03;
    g.gain.setValueAtTime(peak, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.05 + Math.random() * 0.03);
    src.connect(hp); hp.connect(g); g.connect(ctx.destination);
    src.start(at); src.stop(at + 0.1);
  }
}

/* 榨汁机"嗡嗡": 锯齿低频 + 颤音 + 电机质感 */
function blendSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const dur = 0.5;
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  const f0 = 96 + Math.random() * 18;
  o.frequency.setValueAtTime(f0 * 0.7, t);
  o.frequency.linearRampToValueAtTime(f0, t + 0.1);
  const vib = ctx.createOscillator();
  vib.type = 'sine'; vib.frequency.value = 13 + Math.random() * 4;
  const vg = ctx.createGain(); vg.gain.value = 7;
  vib.connect(vg); vg.connect(o.frequency);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.075, t + 0.06);
  g.gain.setValueAtTime(0.075, t + dur * 0.7);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(lp); lp.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + dur); vib.start(t); vib.stop(t + dur);
}

/* 雪糕落杯"噗叽": 低频噗 + 细末噪声 */
function splatSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(210 + Math.random() * 60, t);
  o.frequency.exponentialRampToValueAtTime(74, t + 0.14);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.11, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 0.18);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'pink', 0.12);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.Q.value = 1.4; bp.frequency.value = 1600;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.035, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  src.connect(bp); bp.connect(ng); ng.connect(ctx.destination);
  src.start(t); src.stop(t + 0.14);
}

/* 木鱼"叩": 空腔木质感, 高频瞬态 + 低频共鸣快速下坠 */
function takuSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(660 + Math.random() * 40, t);
  o.frequency.exponentialRampToValueAtTime(172, t + 0.085);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.24, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 0.26);
  const o2 = ctx.createOscillator();
  o2.type = 'triangle';
  o2.frequency.setValueAtTime(1080, t);
  o2.frequency.exponentialRampToValueAtTime(560, t + 0.05);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.06, t);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  o2.connect(g2); g2.connect(ctx.destination);
  o2.start(t); o2.stop(t + 0.08);
}

/* 开瓶"啵": 高频短爆 + 气流 */
function popcapSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'white', 0.08);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.Q.value = 1.1; bp.frequency.value = 2400;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.16, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + 0.1);
  const o = ctx.createOscillator();
  o.type = 'square';
  o.frequency.setValueAtTime(1350, t);
  o.frequency.exponentialRampToValueAtTime(480, t + 0.05);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.05, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  o.connect(og); og.connect(ctx.destination);
  o.start(t); o.stop(t + 0.07);
}

/* 汽水气泡"呲—": 高通白噪慢衰减 */
function fizzSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const dur = 0.55 + Math.random() * 0.25;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'white', 0.75);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 3400;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.055, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(hp); hp.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.03);
}

/* 喝汽水"咕嘟": 低频两连滑 */
function gulpSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  for (let i = 0; i < 2; i++) {
    const at = t + i * 0.17;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(300 + i * 60, at);
    o.frequency.exponentialRampToValueAtTime(92, at + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.13, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.14);
    o.connect(g); g.connect(ctx.destination);
    o.start(at); o.stop(at + 0.16);
  }
}

/* 精油滴落"嗒": 水滴双音(上挑) */
function dropSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(880, t);
  o.frequency.exponentialRampToValueAtTime(1720, t + 0.045);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 0.1);
}

/* 液态玻璃"噼啪"(炸耳版): 高频方波脉冲串, 高通滤波, 每次随机 3-5 连响 */
/* 玻璃噼啪"银铃脆响": 高频方波簇 + 泛音铃, 高通滤波(脆皮爆裂) */
function glassCrackSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const n = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const dt = i * (0.011 + Math.random() * 0.022);
    const o = ctx.createOscillator();
    o.type = 'square';
    const f = 2500 + Math.random() * 3300;
    o.frequency.setValueAtTime(f, t + dt);
    o.frequency.exponentialRampToValueAtTime(f * 0.55, t + dt + 0.016);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t + dt);
    g.gain.linearRampToValueAtTime(0.1 + Math.random() * 0.07, t + dt + 0.0015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.028);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1400 + Math.random() * 800;
    o.connect(g); g.connect(hp); hp.connect(ctx.destination);
    o.start(t + dt); o.stop(t + dt + 0.04);
  }
  // 银铃泛音(单点, 一组咔嚓结束时加一次清脆铃音)
  const bell = ctx.createOscillator();
  bell.type = 'sine';
  const bf = 5800 + Math.random() * 1400;
  bell.frequency.setValueAtTime(bf, t);
  bell.frequency.exponentialRampToValueAtTime(bf * 0.6, t + 0.18);
  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0.0001, t);
  bg.gain.linearRampToValueAtTime(0.04, t + 0.003);
  bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  const bhp = ctx.createBiquadFilter();
  bhp.type = 'highpass';
  bhp.frequency.value = 3500;
  bell.connect(bg); bg.connect(bhp); bhp.connect(ctx.destination);
  bell.start(t); bell.stop(t + 0.22);
}

/* 起泡胶拉伸"吱吱": 高 Q 带通噪声短扫频, 密集触发时像气泡撕裂 */
function stretchSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const dur = 0.05 + Math.random() * 0.055;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'white', 0.15);
  src.playbackRate.value = 1.4 + Math.random() * 0.7;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 6.5;
  const f = 1500 + Math.random() * 950;
  bp.frequency.setValueAtTime(f, t);
  bp.frequency.linearRampToValueAtTime(f * (0.68 + Math.random() * 0.75), t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.02);
}

/* 黄油泥"绵切": 低频正弦下滑 + 粉噪质感(低通噪声短爆), 软乎乎闷响带沙沙 */
function butterSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  // 主体: 低频正弦
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(150 + Math.random() * 60, t);
  o.frequency.exponentialRampToValueAtTime(62, t + 0.16);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 420;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.16, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(lp); lp.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 0.22);
  // 粉噪质感(短促沙沙)
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx, 'pink', 0.18);
  n.playbackRate.value = 0.6 + Math.random() * 0.3;
  const nlp = ctx.createBiquadFilter();
  nlp.type = 'lowpass';
  nlp.frequency.value = 900 + Math.random() * 400;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.linearRampToValueAtTime(0.04, t + 0.01);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  n.connect(nlp); nlp.connect(ng); ng.connect(ctx.destination);
  n.start(t); n.stop(t + 0.2);
}

/* 棉花泥"戳击 ASMR": 高频带通噪声短促戳击 + 中频"啵", 响亮清脆 7464Hz */
function cottonSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  // 高频戳击主体(带通噪声 7000Hz, Q=4, 12ms 衰减)
  const s = ctx.createBufferSource();
  s.buffer = noiseBuffer(ctx, 'white', 0.06);
  s.playbackRate.value = 1.2 + Math.random() * 0.5;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 4.5;
  bp.frequency.value = 6500 + Math.random() * 1800;
  const sg = ctx.createGain();
  sg.gain.setValueAtTime(0.0001, t);
  sg.gain.linearRampToValueAtTime(0.18 + Math.random() * 0.06, t + 0.001);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.015 + Math.random() * 0.012);
  s.connect(bp); bp.connect(sg); sg.connect(ctx.destination);
  s.start(t); s.stop(t + 0.04);
  // 中频"啵"(正弦下滑, 像戳破小泡)
  const o = ctx.createOscillator();
  o.type = 'sine';
  const f = 2000 + Math.random() * 800;
  o.frequency.setValueAtTime(f, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(400, f * 0.4), t + 0.06);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.linearRampToValueAtTime(0.07, t + 0.002);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  o.connect(og); og.connect(ctx.destination);
  o.start(t); o.stop(t + 0.08);
}

/* 脆皮冰山泥"咔嚓炸鞭炮": 一组 4-6 个中频带音调咔嚓(4000-5500Hz), 8-15ms 间隔 */
function iceCrackSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const n = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const dt = i * (0.008 + Math.random() * 0.007);
    // 中频咔嚓(正弦短促, 带音调)
    const o = ctx.createOscillator();
    o.type = 'sine';
    const f = 3800 + Math.random() * 1800;
    o.frequency.setValueAtTime(f, t + dt);
    o.frequency.exponentialRampToValueAtTime(f * 0.45, t + dt + 0.012);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t + dt);
    og.gain.linearRampToValueAtTime(0.13 + Math.random() * 0.06, t + dt + 0.001);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.02);
    o.connect(og); og.connect(ctx.destination);
    o.start(t + dt); o.stop(t + dt + 0.03);
    // 高频微泛音(更像"炸"而非"咔")
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    const f2 = 7000 + Math.random() * 2200;
    o2.frequency.setValueAtTime(f2, t + dt);
    o2.frequency.exponentialRampToValueAtTime(f2 * 0.5, t + dt + 0.01);
    const o2g = ctx.createGain();
    o2g.gain.setValueAtTime(0.0001, t + dt);
    o2g.gain.linearRampToValueAtTime(0.05, t + dt + 0.001);
    o2g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.012);
    o2.connect(o2g); o2g.connect(ctx.destination);
    o2.start(t + dt); o2.stop(t + dt + 0.02);
  }
}

/* 假水"液体涌动": 低频带通噪声滑音 + 低频正弦"啵"模拟气泡咕噜 */
function waterSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  // 低频液体涌动(带通 1500-3000Hz 噪声, 慢速扫频)
  const s = ctx.createBufferSource();
  s.buffer = noiseBuffer(ctx, 'pink', 0.32);
  s.playbackRate.value = 0.5 + Math.random() * 0.2;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 2.5;
  bp.frequency.setValueAtTime(2200, t);
  bp.frequency.exponentialRampToValueAtTime(900, t + 0.25);
  const sg = ctx.createGain();
  sg.gain.setValueAtTime(0.0001, t);
  sg.gain.linearRampToValueAtTime(0.09, t + 0.015);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  s.connect(bp); bp.connect(sg); sg.connect(ctx.destination);
  s.start(t); s.stop(t + 0.34);
  // 气泡咕噜(低频正弦快速下滑)
  const o = ctx.createOscillator();
  o.type = 'sine';
  const f = 700 + Math.random() * 300;
  o.frequency.setValueAtTime(f, t + 0.04);
  o.frequency.exponentialRampToValueAtTime(f * 0.35, t + 0.18);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, t + 0.04);
  og.gain.linearRampToValueAtTime(0.11, t + 0.05);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(og); og.connect(ctx.destination);
  o.start(t + 0.04); o.stop(t + 0.22);
}

/* ============================================
   音频槽位注册表 —— 全站所有声音的唯一清单
   设置区"音频替换"据此渲染; 上传后播放自动走文件
   ============================================ */
const AUDIO_SLOTS = {
  /* ---- 站点 ---- */
  'site.chime':    { label: '竖琴铃音',     group: 'site', synth: () => playHarpChime() },

  /* ---- 解压游戏: v538 全部内置真实采样(异步懒加载), 合成仅兜底 ---- */
  'game.ballSquish':    { label: '拽弹球捏挤', group: 'game', file: 'sfx-ball-squish.mp3', throttle: 200, synth: () => squishSound() },
  'game.jellySquish':   { label: '果冻捏压',   group: 'game', file: 'sfx-jelly-squish.mp3', throttle: 200, synth: () => squishSound() },
  'game.knead':         { label: '揉面',       group: 'game', file: 'sfx-knead.mp3',        throttle: 220, synth: () => squishSound() },
  'game.sauce':         { label: '抹番茄酱',   group: 'game', file: 'sfx-knead.mp3',         throttle: 180, synth: () => splatSound() },
  'game.sprinkle':      { label: '撒芝士',     group: 'game', file: 'sfx-sprinkle.mp3',     throttle: 120, synth: () => popSound() },
  'game.bake':          { label: '烤制滋滋',   group: 'game', file: 'sfx-bake.mp3',    throttle: 300, synth: () => sizzleSound() },
  'game.flame':         { label: '火苗噼啪',   group: 'game', file: 'sfx-flame.mp3',   throttle: 240, synth: () => flameSound() },
  'game.pzSlice':       { label: '切开披萨',   group: 'game', file: 'sfx-pz-slice.mp3',     throttle: 160, synth: () => sliceSound() },
  'game.pzBite':        { label: '吃披萨',     group: 'game', file: 'sfx-pz-bite.mp3',      throttle: 200, synth: () => gulpSound() },
  'game.pzBiteIce':     { label: '吃披萨·叠咬冰(旧版)', group: 'game', file: 'sfx-icecream-bite-old.mp3', throttle: 200, synth: () => gulpSound() },
  'game.pzPull':        { label: '芝士拉丝',   group: 'game', file: 'sfx-pz-pull.mp3',      throttle: 180, synth: () => stretchSound() },
  'game.slimePour':     { label: '倒胶水',     group: 'game', file: 'sfx-jelly-squish.mp3', throttle: 120, synth: () => jellyPinchSound() },
  'game.slimeStir':     { label: '搅拌史莱姆', group: 'game', file: 'sfx-jelly-squish.mp3', throttle: 120, synth: () => jellyPinchSound() },
  'game.slimeCotton':   { label: '棉花泥',     group: 'game', file: 'sfx-jelly-squish.mp3', throttle: 110, synth: () => jellyPinchSound() },
  'game.slimeGlass':    { label: '液态玻璃',   group: 'game', file: 'sfx-jelly-squish.mp3', throttle: 110, synth: () => jellyPinchSound() },
  'game.slimeFoam':     { label: '起泡胶',     group: 'game', file: 'sfx-jelly-squish.mp3', throttle: 110, synth: () => jellyPinchSound() },
  'game.slimeIce':      { label: '冰山泥',     group: 'game', file: 'sfx-jelly-squish.mp3', throttle: 110, synth: () => jellyPinchSound() },
  'game.slimeButter':   { label: '黄油泥',     group: 'game', file: 'sfx-jelly-squish.mp3', throttle: 110, synth: () => jellyPinchSound() },
  'game.slimeWater':    { label: '假水',       group: 'game', file: 'sfx-jelly-squish.mp3', throttle: 110, synth: () => jellyPinchSound() },
  'game.muyu':          { label: '木鱼敲击',   group: 'game', file: 'sfx-muyu.mp3',         throttle: 60,  synth: () => takuSound() },
  'game.icecreamMotor': { label: '冰激凌机运转', group: 'game', file: 'sfx-icecream-motor.mp3', throttle: 380, synth: () => blendSound() },
  'game.icecreamDrop':  { label: '打出冰激凌', group: 'game', file: 'sfx-icecream-drop.mp3', throttle: 200, synth: () => splatSound() },
  'game.icecreamBite':  { label: '咬冰激凌',   group: 'game', file: 'sfx-icecream-bite.mp3', throttle: 240, synth: () => gulpSound() },
  'game.blow':          { label: '吹泡泡(吹气)', group: 'game', loop: true, file: 'sfx-blow.mp3', synth: ctx => blowLoopSynth(ctx) },
  'game.bubblePop':     { label: '戳破泡泡',   group: 'game', file: 'sfx-bubble-pop.mp3', throttle: 90,  synth: () => popSound() },
  'game.bubbleWrap':    { label: '捏泡泡纸',   group: 'game', file: 'sfx-bubblewrap.mp3',   throttle: 110, synth: () => popSound() },
  'game.roastFire':     { label: '炭火环境',   group: 'game', loop: true, file: 'asmr-fire.mp3', synth: ctx => buildFire(ctx) },
  'game.soapSlice':     { label: '切肥皂',     group: 'game', file: 'sfx-soap-slice.mp3',   throttle: 150, synth: () => sliceSound() },
  'game.distillDrop':   { label: '精油滴落',   group: 'game', file: 'sfx-distill-drop.mp3', throttle: 80,  synth: () => dropSound() },
  'game.distillBoil':   { label: '蒸馏沸腾',   group: 'game', file: 'sfx-distill-boil.mp3', throttle: 300, synth: () => fizzSound() },
  'game.sodaOpen':      { label: '开瓶啵',     group: 'game', file: 'sfx-soda-open.mp3', throttle: 120, synth: () => popcapSound() },
  'game.sodaFizz':      { label: '汽水气泡',   group: 'game', file: 'sfx-soda-fizz.mp3',    throttle: 420, synth: () => fizzSound() },
  'game.drinkGulp':     { label: '咕嘟喝下',   group: 'game', file: 'sfx-drink-gulp.mp3',   throttle: 220, synth: () => gulpSound() },
  'game.taichiChime':   { label: '风铃提示',   group: 'game', file: 'sfx-taichi-chime.mp3', throttle: 260, synth: () => taichiChime() },

  /* ---- ASMR 长循环音源 ---- */
  // v577: 雨/森林/海浪改用全段长素材(335s/161s/120s, 首尾无缝循环), 消除短循环拼接接口
  'asmr.rain':     { label: '窗外落雨',     group: 'asmr', loop: true, file: 'amb-rain-loop.mp3',   synth: ctx => buildRain(ctx) },
  'asmr.forest':   { label: '森林鸟鸣',     group: 'asmr', loop: true, file: 'amb-forest-loop.mp3', synth: ctx => buildForest(ctx) },
  'asmr.wave':     { label: '海边的浪',     group: 'asmr', loop: true, file: 'amb-wave-loop.mp3',   synth: ctx => buildWave(ctx) },   // v598: 平静高清版海浪(实测录音, mean-23.9dB/峰值-2.8dB 无爆点, 120s 无缝循环)
  'asmr.fire':     { label: '炉中篝火',     group: 'asmr', loop: true, file: 'asmr-fire.mp3', synth: ctx => buildFire(ctx) },
  'asmr.wind':     { label: '穿过林间的风', group: 'asmr', loop: true, file: 'asmr-wind.mp3', synth: ctx => buildWind(ctx) },
  'asmr.chew':     { label: '轻咀嚼',       group: 'asmr', loop: true, file: 'asmr-chew.mp3', synth: ctx => buildChew(ctx) },
  'asmr.tap':      { label: '指尖敲击', group: 'asmr', loop: true, file: 'asmr-tap.mp3',   synth: ctx => buildTap(ctx) },
  'asmr.keys':     { label: '机械键盘',     group: 'asmr', loop: true, file: 'asmr-keys.mp3', synth: ctx => buildKeys(ctx) },
  'asmr.page':     { label: '翻书页',       group: 'asmr', loop: true, file: 'asmr-page.mp3', synth: ctx => buildPage(ctx) },
  'asmr.drip':     { label: '水滴声',       group: 'asmr', loop: true, file: 'asmr-drip.mp3', synth: ctx => buildDrip(ctx) },
};
if (typeof window !== 'undefined') window._audioSlots = AUDIO_SLOTS;   // v51 测试可见

/* v538: 吹气循环合成兜底(game.blow 无真实采样文件时用, 仿 buildBlow 原吹气) */
function blowLoopSynth(ctx) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.15);
  master.connect(ctx.destination);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'pink', 1.2);
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.7;
  src.connect(bp); bp.connect(master);
  src.start();
  return { ctx, master, stops: [() => src.stop()] };
}

/* ============================================
   音效合成(默认音色, 均可被上传文件替换)
   ============================================ */
/* 泡泡"啵": 正弦短促下滑 + 快衰减 */
function popSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'sine';
  const f = 380 + Math.random() * 480;
  o.frequency.setValueAtTime(f, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(95, f * 0.34), t + 0.09);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.2, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 0.13);
}

/* 切肥皂"沙沙"(甘油皂版): 湿润低频刮擦, 柔和不刺耳 */
function sliceSound(opts) {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const vol = opts && opts.volume != null ? opts.volume : 1;
  const t = ctx.currentTime;
  const dur = 0.2 + Math.random() * 0.08;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'white', 0.35);
  src.playbackRate.value = 0.75 + Math.random() * 0.2;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.72;
  bp.frequency.setValueAtTime(2600 + Math.random() * 700, t);
  bp.frequency.exponentialRampToValueAtTime(1250, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime((0.055 + Math.random() * 0.035) * vol, t + 0.02);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.03);

  // 刀刃离开肥皂的一下极轻"噗"(低频, 音量很小)
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t + dur * 0.7);
  o.frequency.exponentialRampToValueAtTime(88, t + dur * 0.7 + 0.07);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.035 * vol, t + dur * 0.7);
  og.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.7 + 0.09);
  o.connect(og); og.connect(ctx.destination);
  o.start(t + dur * 0.7); o.stop(t + dur * 0.7 + 0.1);
}

/* 果冻"duang"回弹: 低频正弦下坠 */
function boingSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(175, t);
  o.frequency.exponentialRampToValueAtTime(82, t + 0.3);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.13, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 0.34);
}

/* 史莱姆揉捏"咕叽": 带通噪声下滑 + 音量抖动, 湿润黏连感 */
function squishSound(intense) {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const dur = 0.16 + Math.random() * 0.08;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'pink', 0.35);
  src.playbackRate.value = 0.8 + Math.random() * 0.3;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 2.2;
  const f0 = 1050 + Math.random() * 450;
  bp.frequency.setValueAtTime(f0, t);
  bp.frequency.exponentialRampToValueAtTime(f0 * 0.32, t + dur);
  const g = ctx.createGain();
  const peak = (intense ? 0.09 : 0.055) + Math.random() * 0.03;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.03);
}

/* 果冻捏捏(v553: 史莱姆全部用此): 短正弦下滑 + 短粉噪湿润感, 比 squishSound 更"啵叽" */
function jellyPinchSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  // 主音: 正弦 750→260Hz 快速下滑
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(750, t);
  o.frequency.exponentialRampToValueAtTime(260, t + 0.12);
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(0.0001, t);
  g1.gain.linearRampToValueAtTime(0.10, t + 0.012);
  g1.gain.exponentialRampToValueAtTime(0.0008, t + 0.13);
  o.connect(g1); g1.connect(ctx.destination);
  o.start(t); o.stop(t + 0.16);
  // 副音: 高频带通粉噪 0.04s 湿润"啵"
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx, 'pink', 0.08);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.Q.value = 3.5;
  bp.frequency.setValueAtTime(1800, t);
  bp.frequency.exponentialRampToValueAtTime(900, t + 0.06);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.0001, t);
  g2.gain.linearRampToValueAtTime(0.045, t + 0.005);
  g2.gain.exponentialRampToValueAtTime(0.0008, t + 0.08);
  n.connect(bp); bp.connect(g2); g2.connect(ctx.destination);
  n.start(t); n.stop(t + 0.10);
}

/* 冰山泥碾碎"咔嚓咔嚓": 连续 3-4 个高频微爆, 颗粒感 */
function crunchSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const n = 3 + (Math.random() * 2 | 0);
  for (let i = 0; i < n; i++) {
    const t = ctx.currentTime + i * (0.028 + Math.random() * 0.03);
    const s = ctx.createBufferSource();
    s.buffer = sfxNoise(ctx);
    s.playbackRate.value = 1.2 + Math.random() * 0.8;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2200 + Math.random() * 2600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.028 + Math.random() * 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03 + Math.random() * 0.03);
    s.connect(hp); hp.connect(g); g.connect(ctx.destination);
    s.start(t); s.stop(t + 0.09);
  }
}

/* 起泡胶小气泡"啵": 又小又闷 */
function foamPopSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'sine';
  const f = 300 + Math.random() * 260;
  o.frequency.setValueAtTime(f, t);
  o.frequency.exponentialRampToValueAtTime(f * 0.4, t + 0.045);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.08, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 0.07);
}

/* 倒胶水: 稠厚液体声(低通噪声 0.8s, 缓起缓收) */
function pourSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const dur = 0.75;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'brown', 1);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(500, t);
  lp.frequency.linearRampToValueAtTime(900, t + dur * 0.6);
  lp.frequency.linearRampToValueAtTime(420, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.16, t + 0.15);
  g.gain.setValueAtTime(0.16, t + dur * 0.7);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  src.connect(lp); lp.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.05);
}

/* 玻璃敲击一声"叮": 高频正弦簇 + 瞬态, 用于 ASMR 敲击卡 */
function tapSound(when) {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = when || ctx.currentTime;
  const base = 1500 + Math.random() * 900;
  [[base, 0.09], [base * 1.52, 0.035], [base * 2.31, 0.018]].forEach(([f, v]) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.42);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.45);
  });
  // 指尖接触的"嗒"
  const s = ctx.createBufferSource();
  s.buffer = sfxNoise(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 3800;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.05, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
  s.connect(hp); hp.connect(g); g.connect(ctx.destination);
  s.start(t); s.stop(t + 0.02);
}

/* 一口脆嚼: 2-3 个连续爆裂(带通噪声 + 低频体感共振) */
function biteSound(master) {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const out = master || ctx.destination;
  const bites = 2 + (Math.random() * 2 | 0);
  for (let i = 0; i < bites; i++) {
    const t = ctx.currentTime + i * (0.055 + Math.random() * 0.05);
    const s = ctx.createBufferSource();
    s.buffer = sfxNoise(ctx);
    s.playbackRate.value = 0.9 + Math.random() * 0.7;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1300 + Math.random() * 2400;
    bp.Q.value = 1.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.1 + Math.random() * 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04 + Math.random() * 0.03);
    s.connect(bp); bp.connect(g); g.connect(out);
    s.start(t); s.stop(t + 0.09);
    // 低频体感
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(170 + Math.random() * 60, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.06);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.07, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(og); og.connect(out);
    o.start(t); o.stop(t + 0.08);
  }
}

/* 键盘一击: click + thock */
function keySound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const s = ctx.createBufferSource();
  s.buffer = sfxNoise(ctx);
  s.playbackRate.value = 1.4 + Math.random() * 0.6;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 2400;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.05 + Math.random() * 0.04, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
  s.connect(hp); hp.connect(g); g.connect(ctx.destination);
  s.start(t); s.stop(t + 0.025);
  const o = ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.setValueAtTime(210 + Math.random() * 70, t);
  o.frequency.exponentialRampToValueAtTime(110, t + 0.035);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.075, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.connect(og); og.connect(ctx.destination);
  o.start(t); o.stop(t + 0.06);
}

/* 翻一页书: 带通噪声扫频, 像纸张划过 */
function pageSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const dur = 0.42;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'white', 0.6);
  src.playbackRate.value = 1 + Math.random() * 0.2;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(900, t);
  bp.frequency.exponentialRampToValueAtTime(2900, t + dur * 0.55);
  bp.frequency.exponentialRampToValueAtTime(1300, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.085, t + 0.08);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.05);
}

/* 一滴水: 高频"叮"落入 + 水面"噗" */
function dripSound() {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'sine';
  const f = 1250 + Math.random() * 700;
  o.frequency.setValueAtTime(f, t);
  o.frequency.exponentialRampToValueAtTime(f * 0.42, t + 0.09);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.0008, t + 0.12);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 0.14);
  const s = ctx.createBufferSource();
  s.buffer = noiseBuffer(ctx, 'brown', 0.3);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 700;
  const sg = ctx.createGain();
  sg.gain.setValueAtTime(0.07, t + 0.02);
  sg.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  s.connect(lp); lp.connect(sg); sg.connect(ctx.destination);
  s.start(t); s.stop(t + 0.12);
}

/* ---------- 游戏弹窗调度 ---------- */
/* ---------- 游戏: 抽象球(1.0 纪念版 v51 回归: 带表情的小球, 戳一戳换颜色, 拽一拽冒星星) ---------- */
function buildAbstract(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const PALETTE = [
    ['#C8F5A8', '#7AC96C'],   // 原谅绿
    ['#FFD3E8', '#F06FA6'],   // 芭比粉
    ['#DEC6FF', '#9A6DF0'],   // 基佬紫
    ['#FFF6B8', '#EFC53A'],   // 荧光黄
  ];
  let ci = Math.floor(Math.random() * PALETTE.length);
  const soft = makeSoftBody({
    cx: 280, cy: 200, rx: 90, ry: 84, n: 18,
    gravity: 0, damping: 0.94,
    kRing: 0.58, kCross: 0.28, kCenter: 0.24,
    anchorPull: 0.02,
  });
  const ptr = { active: false, x: 280, y: 200 };
  let face = 'duh';       // duh 呆滞 | squeeze 被捏 | dizzy 晕 | joy 开心
  let faceT = 0;
  let flipT = 0;          // 翻白眼计时
  const stars = [];       // 拖太远时的眼冒金星
  let raf = 0;

  const onDown = e => {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    ptr.active = true; ptr.x = p.x; ptr.y = p.y;
    if (Math.hypot(p.x - soft.center().x, p.y - soft.center().y) < soft.avgR() + 26) {
      face = 'squeeze'; faceT = performance.now();
      playSfx('game.ballSquish');
    }
  };
  const onMove = e => {
    if (!ptr.active) return;
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    ptr.x = p.x; ptr.y = p.y;
    const c = soft.center();
    if (Math.hypot(ptr.x - c.x, ptr.y - c.y) > 150 && Math.random() < 0.2) {
      stars.push({ x: c.x + (Math.random() - 0.5) * 120, y: c.y - soft.avgR() - 10 + (Math.random() - 0.5) * 40, life: 1, s: 4 + Math.random() * 5 });
    }
  };
  const onUp = () => {
    if (ptr.active) {
      playSfx('game.ballSquish', { volume: 0.45 });
      face = 'dizzy'; faceT = performance.now(); flipT = performance.now();
    }
    ptr.active = false;
  };
  const onClick = () => {
    ci = (ci + 1 + Math.floor(Math.random() * (PALETTE.length - 1))) % PALETTE.length;
    face = 'joy'; faceT = performance.now();
    playSfx('game.ballSquish');
  };
  cv.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  cv.addEventListener('click', onClick);

  const status = document.createElement('span');
  status.className = 'game-status';
  status.textContent = '戳我换颜色 · 拽我冒星星 · 我不生气';
  stage.appendChild(status);

  function drawFace(c) {
    const now = performance.now();
    if (now - faceT > 1400 && !ptr.active) face = 'duh';
    ctx.save();
    ctx.translate(c.x, c.y);
    const r = soft.avgR();
    const s = r / 90;
    ctx.scale(s, s);
    // 眼睛
    const ey = -14, ex = 27;
    if (face === 'dizzy') {
      // 翻白眼(慢速回正)
      const k = Math.max(0, 1 - (now - flipT) / 1200);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(-ex, ey, 13, 15 * (1 - 0.4 * k), 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(ex, ey, 13, 15 * (1 - 0.4 * k), 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2E2A3B';
      ctx.beginPath(); ctx.arc(-ex, ey - 11 * k, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex, ey - 11 * k, 5.5, 0, Math.PI * 2); ctx.fill();
    } else if (face === 'squeeze') {
      // > < 皱眼
      ctx.strokeStyle = '#2E2A3B'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-ex - 9, ey - 8); ctx.lineTo(-ex + 7, ey); ctx.lineTo(-ex - 9, ey + 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + 9, ey - 8); ctx.lineTo(ex - 7, ey); ctx.lineTo(ex + 9, ey + 8); ctx.stroke();
    }
    if (face === 'duh') {
      // 呆滞不对称大眼
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(-ex, ey, 14, 16, -0.08, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(ex, ey, 12, 13, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2E2A3B';
      ctx.beginPath(); ctx.arc(-ex + 4, ey + 3, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex - 3, ey + 2, 5, 0, Math.PI * 2); ctx.fill();
    } else if (face === 'joy') {
      // ^ ^ 眯眯眼
      ctx.strokeStyle = '#2E2A3B'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(-ex, ey + 5, 11, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex, ey + 5, 11, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    }
    // 嘴
    ctx.strokeStyle = '#2E2A3B'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    if (face === 'duh') { ctx.moveTo(-13, 26); ctx.quadraticCurveTo(0, 34 + (Date.now() % 2000 < 1000 ? 2 : -2), 13, 26); }
    else if (face === 'joy') { ctx.arc(0, 22, 13, 0.15 * Math.PI, 0.85 * Math.PI); }
    else { ctx.moveTo(-10, 28); ctx.quadraticCurveTo(0, 22, 10, 28); }
    ctx.stroke();
    // 腮红
    ctx.fillStyle = 'rgba(255,120,140,0.25)';
    ctx.beginPath(); ctx.ellipse(-46, 14, 9, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(46, 14, 9, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function render() {
    soft.step(pts => {
      if (ptr.active) {
        const c = pts[18];
        c.x += (ptr.x - c.x) * 0.16;
        c.y += (ptr.y - c.y) * 0.16;
      }
    });
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    // 沙龙背景色块
    const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
    bg.addColorStop(0, 'rgba(255, 214, 240, 0.16)');
    bg.addColorStop(1, 'rgba(214, 226, 255, 0.2)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, GAME_W, GAME_H);
    const c = soft.center();
    // 影子
    ctx.fillStyle = 'rgba(90, 74, 120, 0.16)';
    ctx.beginPath(); ctx.ellipse(c.x, 330, soft.avgR() * 0.9, 10, 0, 0, Math.PI * 2); ctx.fill();
    // 身体(v565 卡片同款水彩叠染)
    const [hi, lo] = PALETTE[ci];
    wcWashPath(ctx, g2 => blobPath(g2, soft.pts, 18), c.x, c.y, soft.avgR(), hi, lo, {
      seed: ci * 7 + 3, haloA: 0.34, washA: 0.24, edgeA: 0.38, lw: 3,
    });
    drawFace(c);
    // 金星
    for (let i = stars.length - 1; i >= 0; i--) {
      const st = stars[i];
      st.life -= 0.016; st.y -= 0.5;
      if (st.life <= 0) { stars.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(st.x, st.y); ctx.rotate(st.life * 4);
      ctx.fillStyle = `rgba(255, 214, 64, ${st.life})`;
      ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = k / 5 * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * st.s, Math.sin(a) * st.s);
        const a2 = a + Math.PI / 5;
        ctx.lineTo(Math.cos(a2) * st.s * 0.45, Math.sin(a2) * st.s * 0.45);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(render);
  }
  render();

  // v51 测试钩子: 暴露表情状态
  window._abstract = {
    get face() { return face; },
    get stars() { return stars.length; },
    get center() { return soft.center(); },
    get avgR() { return soft.avgR(); },
  };

  return {
    destroy() {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', onDown);
      cv.removeEventListener('click', onClick);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (window._abstract) delete window._abstract;
    }
  };
}

/* ---------- 游戏: 拽拽弹力球(v48 软体果冻球 v51 独立成游戏) 柔软果冻质感, 捏我 拽我 把我甩飞 ---------- */
function buildTugBall(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const RING = 84;
  const CX = GAME_W / 2, CY = GAME_H / 2;
  const TAU = Math.PI * 2;

  // 果冻手感: 阻尼低(甩出去会 duangduang 抖很久), 无重力, 极弱回中(飘远了自己慢慢荡回来)
  const soft = makeSoftBody({
    cx: CX, cy: CY, rx: RING, ry: RING, n: 22,
    gravity: 0, damping: 0.985,
    kRing: 0.42, kCross: 0.20, kCenter: 0.16,
    anchorPull: 0.006,
  });
  const pts = soft.pts, N = soft.n;

  const ptr = { down: false, x: 0, y: 0 };
  let grab = null;            // 拽住的环点 index
  const sparkles = [];        // 甩飞时的拖尾星光
  let lastT = performance.now(), raf = 0;

  function onDown(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    ptr.down = true; ptr.x = p.x; ptr.y = p.y;
    const c = soft.center();
    if (Math.hypot(p.x - c.x, p.y - c.y) < RING * 1.7) {
      let best = 0, bd = 1e9;
      for (let i = 0; i < N; i++) {
        const d = Math.hypot(pts[i].x - p.x, pts[i].y - p.y);
        if (d < bd) { bd = d; best = i; }
      }
      grab = { idx: best };
      playSfx('game.ballSquish', { volume: 0.5 });   // v547: 抓住即捏挤(回弹音已删)
    }
  }
  function onMove(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    const mv = Math.hypot(p.x - ptr.x, p.y - ptr.y);
    ptr.x = p.x; ptr.y = p.y;
    // v547: 拽球时的捏挤音(拖得越快声音越大, 槽位 200ms 节流)
    if (grab && ptr.down && mv > 3.5) playSfx('game.ballSquish', { volume: Math.min(0.9, 0.4 + mv / 28) });
  }
  function onUp() { ptr.down = false; grab = null; }
  cv.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  function physics(dt) {
    soft.step(list => {
      // 拽: 抓住的点直接跟手(旧位置渐变 → 天然甩出速度)
      if (grab && ptr.down) {
        const g = list[grab.idx];
        g.px += (g.x - g.px) * 0.55;
        g.py += (g.y - g.py) * 0.55;
        g.x = ptr.x; g.y = ptr.y;
      }
      // 墙壁反弹(verlet 反射速度 + 阻尼)
      const M = RING * 0.5;
      let hit = 0;
      for (const p of list) {
        if (p.x < M) { const v = p.x - p.px; p.x = M; p.px = p.x + v * 0.55; hit = Math.max(hit, -v); }
        if (p.x > GAME_W - M) { const v = p.x - p.px; p.x = GAME_W - M; p.px = p.x + v * 0.55; hit = Math.max(hit, v); }
        if (p.y < M) { const v = p.y - p.py; p.y = M; p.py = p.y + v * 0.55; hit = Math.max(hit, -v); }
        if (p.y > GAME_H - M) { const v = p.y - p.py; p.y = GAME_H - M; p.py = p.y + v * 0.55; hit = Math.max(hit, v); }
      }
    });
    // 甩得快 → 拖尾星光
    const c = soft.center();
    let spx = 0, spy = 0;
    for (let i = 0; i < N; i++) { spx += pts[i].px; spy += pts[i].py; }
    const speed = Math.hypot(c.x - spx / N, c.y - spy / N);
    if (speed > 5.5 && sparkles.length < 60) {
      sparkles.push({
        x: c.x + (Math.random() - 0.5) * RING, y: c.y + (Math.random() - 0.5) * RING,
        life: 1, r: 1.2 + Math.random() * 2.4,
      });
    }
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.life -= dt * 1.8;
      if (s.life <= 0) sparkles.splice(i, 1);
    }
  }

  function render(t) {
    // 背景: 柔和渐变 + 光斑
    const bg = ctx.createRadialGradient(CX, CY - 70, 40, CX, CY, GAME_W * 0.8);
    bg.addColorStop(0, '#F6F1FC');
    bg.addColorStop(1, '#E3DCF5');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(GAME_W * 0.16, GAME_H * 0.2, 46, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(GAME_W * 0.85, GAME_H * 0.72, 62, 0, TAU); ctx.fill();

    const c = soft.center();
    // 影子
    const shadowK = 1 - Math.min(1, Math.abs(c.y - (GAME_H - 40)) / 220);
    ctx.fillStyle = `rgba(110,90,150,${0.10 + shadowK * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(c.x, GAME_H - 26, RING * (0.72 + shadowK * 0.2), 9, 0, 0, TAU);
    ctx.fill();

    // 球体: 流动渐变(色相随时间旋转 → 抽象梦幻)
    const hue = (t * 0.018) % 360;
    // v564 水彩外晕
    wcCirclePath(ctx, c.x, c.y, RING * 1.18, RING * 1.18, 7, 1.1);
    ctx.fillStyle = `hsla(${(hue + 260) % 360}, 80%, 88%, 0.35)`;
    ctx.fill();
    const grad = ctx.createLinearGradient(c.x - RING, c.y - RING, c.x + RING, c.y + RING);
    grad.addColorStop(0, `hsla(${(hue + 300) % 360}, 78%, 82%, 0.94)`);
    grad.addColorStop(0.5, `hsla(${(hue + 200) % 360}, 72%, 78%, 0.94)`);
    grad.addColorStop(1, `hsla(${(hue + 45) % 360}, 82%, 76%, 0.94)`);
    blobPath(ctx, pts, N);
    ctx.fillStyle = grad;
    ctx.fill();
    // v564 边缘积色(手绘深描)
    ctx.lineWidth = 3.2; ctx.strokeStyle = `hsla(${(hue + 280) % 360}, 35%, 32%, 0.32)`;
    wcCirclePath(ctx, c.x, c.y, RING * 1.02, RING * 1.02, 13, 1.0);
    ctx.stroke();
    // v565 二层叠染 + 散点白点(卡片同款)
    ctx.save();
    ctx.translate(c.x, c.y); ctx.scale(0.92, 0.92); ctx.translate(-c.x, -c.y);
    blobPath(ctx, pts, N);
    ctx.fillStyle = `hsla(${(hue + 250) % 360}, 85%, 93%, 0.32)`;
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(c.x - RING * 0.34, c.y - RING * 0.40, 2.6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(c.x + RING * 0.10, c.y - RING * 0.46, 2.0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(c.x + RING * 0.42, c.y + RING * 0.30, 1.6, 0, TAU); ctx.fill();

    // 内层: 向左上偏移的浅色高光层
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.beginPath();
    ctx.ellipse(c.x - RING * 0.28, c.y - RING * 0.30, RING * 0.86, RING * 0.74, 0.5, 0, TAU);
    ctx.fill();
    // 内部抽象圆环
    ctx.strokeStyle = `hsla(${(hue + 260) % 360}, 80%, 88%, 0.55)`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(c.x + 6, c.y + 4, RING * 0.52, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(c.x + 10, c.y + 8, RING * 0.30, 0, TAU); ctx.stroke();
    ctx.restore();

    // 轮廓
    blobPath(ctx, pts, N);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2.6;
    ctx.stroke();
    // 顶部高光月牙
    const hg = ctx.createRadialGradient(c.x - RING * 0.3, c.y - RING * 0.42, 2, c.x - RING * 0.3, c.y - RING * 0.4, RING * 0.5);
    hg.addColorStop(0, 'rgba(255,255,255,0.75)');
    hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    blobPath(ctx, pts, N); ctx.clip();
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(c.x - RING * 0.30, c.y - RING * 0.42, RING * 0.42, RING * 0.2, -0.35, 0, TAU);
    ctx.fill();
    ctx.restore();

    // 拖尾星光(十字闪)
    for (const s of sparkles) {
      const a = s.life;
      ctx.strokeStyle = `rgba(255,255,255,${a * 0.9})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s.x - s.r, s.y); ctx.lineTo(s.x + s.r, s.y);
      ctx.moveTo(s.x, s.y - s.r); ctx.lineTo(s.x, s.y + s.r);
      ctx.stroke();
    }

    // 底部小字提示
    ctx.font = '500 13px "Noto Sans SC", sans-serif';
    ctx.fillStyle = 'rgba(90,75,120,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('捏一捏 · 拽一拽 · 甩出去看看', CX, GAME_H - 10);
  }

  function loop() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    physics(dt * 60);
    render(now);
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(loop);
  }
  loop();

  // v51 测试钩子: 拽拽弹力球
  window._tug = {
    get center() { return soft.center(); },
    get avgR() { return soft.avgR(); },
    get restR() { return RING; },
    get grab() { return grab; },
    get bubbles() { return sparkles.length; },
    fling(vx, vy) {
      for (let i = 0; i < N; i++) { pts[i].px = pts[i].x - vx; pts[i].py = pts[i].y - vy; }
      pts[N].px = pts[N].x - vx; pts[N].py = pts[N].y - vy;
    },
  };

  return {
    destroy() {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (window._tug) delete window._tug;
    }
  };
}
/* ---------- 游戏: 吹泡泡(v48) 晶莹剔透 · duangduang · 一戳就破 ---------- */
function buildBlow(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const TAU = Math.PI * 2;
  const WAND_X = GAME_W / 2, WAND_Y = GAME_H - 64;

  const bubbles = [];   // 泡泡
  const pops = [];      // 破裂特效
  const dust = Array.from({ length: 16 }, () => ({   // 背景微尘(景深)
    x: Math.random() * GAME_W, y: Math.random() * GAME_H,
    r: 1 + Math.random() * 2.6, vy: -(2 + Math.random() * 5),
    a: 0.35 + Math.random() * 0.12,
  }));
  let blowing = false, blowAcc = 0, wandFilm = 0;
  let blowLoop = null, blowStopping = false;
  let lastT = performance.now(), raf = 0;

  /* ---- 声音 ---- */
  function popSound(r) {
    try {
      const actx = ensureAudioCtx(); if (!actx) return;
      const t = actx.currentTime;
      // 高频"啵"主体
      const o = actx.createOscillator();
      o.type = 'sine';
      const f = 700 + (1 - Math.min(1, r / 40)) * 900;
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.07);
      const g = actx.createGain();
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      o.connect(g); g.connect(actx.destination);
      o.start(t); o.stop(t + 0.1);
      // 破裂"咔"的质感
      const s = actx.createBufferSource();
      s.buffer = sfxNoise(actx);
      const bp = actx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 2;
      const sg = actx.createGain();
      sg.gain.setValueAtTime(0.10, t);
      sg.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      s.connect(bp); bp.connect(sg); sg.connect(actx.destination);
      s.start(t); s.stop(t + 0.06);
    } catch (e) {}
  }
  function blowSoundStart() {
    try {
      if (blowLoop || blowStopping) return;
      blowStopping = false;
      // v539: 真实吹气采样(sfx-blow.mp3), fetch 未完成时松手 → 竞态防护
      startLoopSound('game.blow').then(n => {
        if (!n) return;
        if (blowStopping) smoothStop(n);
        else blowLoop = n;
      }).catch(() => {});
    } catch (e) {}
  }
  function blowSoundStop() {
    try {
      blowStopping = true;
      if (blowLoop) { smoothStop(blowLoop); blowLoop = null; }
    } catch (e) {}
  }

  /* ---- 泡泡 ---- */
  function spawnBubble() {
    if (bubbles.length >= 46) bubbles.shift();   // 上限保护
    const targetR = 13 + Math.random() * 26;
    bubbles.push({
      x: WAND_X + (Math.random() - 0.5) * 26,
      y: WAND_Y - 30,
      r: 2, targetR,
      vy: -(26 + Math.random() * 26),           // px/s 向上
      swayA: 6 + Math.random() * 14,
      swayF: 0.6 + Math.random() * 1.2,
      swayP: Math.random() * TAU,
      wobF: 5 + Math.random() * 4,
      wobP: Math.random() * TAU,
      wobA: 0.05 + Math.random() * 0.05,
      hue: Math.floor(Math.random() * 360),
      inflate: 0,                                 // 0→1 充气(带 duangduang 过冲)
      born: performance.now(),
    });
  }
  function popBubble(i) {
    const b = bubbles[i];
    playSfx('game.bubblePop');   // v539: 真实戳破泡泡采样
    const drops = [];
    const nd = 5 + Math.floor(Math.random() * 3);
    for (let k = 0; k < nd; k++) {
      drops.push({ a: Math.random() * TAU, v: 40 + Math.random() * 70, r: 1 + Math.random() * 2 });
    }
    pops.push({ x: b.x, y: b.y, r: b.r, t: 0, drops, hue: b.hue });
    bubbles.splice(i, 1);
  }

  /* ---- 交互 ---- */
  function onDown(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    // 戳泡泡(从最上层找)
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (Math.hypot(p.x - b.x, p.y - b.y) < Math.max(10, b.r * 1.12)) { popBubble(i); return; }
    }
    // 没戳到 → 开始吹
    blowing = true;
    blowSoundStart();
    blowAcc = 0.16;   // 立刻出第一颗
  }
  function onUp() {
    blowing = false;
    blowSoundStop();
  }
  cv.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  /* ---- 绘制 ---- */
  function drawBubble(b, t) {
    const wob = Math.sin(t * 0.001 * b.wobF + b.wobP) * b.wobA
      + Math.sin((t - b.born) * 0.012) * 0.10 * Math.exp(-(t - b.born) / 500);   // 刚出生时弹两下
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(1 + wob, 1 - wob);
    const r = b.r;
    // v565 外晕(卡片同款)
    wcCirclePath(ctx, 0, 0, r * 1.15, r * 1.15, (b.x * 0.31 + b.y * 0.17) | 0, 1.2);
    ctx.fillStyle = `hsla(${b.hue}, 80%, 88%, 0.20)`;
    ctx.fill();
    // 1) 球体: 几乎透明, 越靠边越亮(薄膜)
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.08, 0, 0, r);
    g.addColorStop(0, 'rgba(255,255,255,0.02)');
    g.addColorStop(0.68, 'rgba(205,228,255,0.05)');
    g.addColorStop(0.90, `hsla(${b.hue}, 90%, 82%, 0.15)`);
    g.addColorStop(1, `hsla(${b.hue}, 90%, 90%, 0.32)`);
    ctx.fillStyle = g;
    wcCirclePath(ctx, 0, 0, r, r, (b.x * 0.31 + b.y * 0.17) | 0, 1.0);
    ctx.fill();
    // 2) 薄膜边缘(渐变亮边)
    const rim = ctx.createLinearGradient(-r, -r, r, r);
    rim.addColorStop(0, 'rgba(255,255,255,0.92)');
    rim.addColorStop(0.5, `hsla(${(b.hue + 40) % 360}, 85%, 86%, 0.45)`);
    rim.addColorStop(1, 'rgba(255,255,255,0.78)');
    ctx.strokeStyle = rim;
    ctx.lineWidth = Math.max(1, r * 0.05);
    wcCirclePath(ctx, 0, 0, r - ctx.lineWidth / 2, r - ctx.lineWidth / 2, (b.x * 0.31 + b.y * 0.17) | 0, 1.0);
    ctx.stroke();
    // 3) 虹彩干涉弧(两段, 叠加发光)
    ctx.globalCompositeOperation = 'lighter';
    for (const seg of [{ a0: -2.6, a1: -1.1, h: b.hue + 15 }, { a0: 0.5, a1: 2.0, h: b.hue + 150 }]) {
      ctx.strokeStyle = `hsla(${seg.h % 360}, 95%, 72%, 0.28)`;
      ctx.lineWidth = Math.max(1.2, r * 0.07);
      ctx.beginPath(); ctx.arc(0, 0, r * 0.96, seg.a0, seg.a1); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    // 4) 主高光(左上, 大而柔)
    const hl = ctx.createRadialGradient(-r * 0.38, -r * 0.42, 0, -r * 0.38, -r * 0.42, r * 0.3);
    hl.addColorStop(0, 'rgba(255,255,255,0.95)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl;
    ctx.beginPath();
    ctx.ellipse(-r * 0.36, -r * 0.42, r * 0.26, r * 0.15, -0.6, 0, TAU); ctx.fill();
    // 5) 副高光(右下小点)
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.arc(r * 0.36, r * 0.32, r * 0.06, 0, TAU); ctx.fill();
    // v565 散点白点(卡片同款)
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(-r * 0.44, -r * 0.30, r * 0.05, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.18, -r * 0.48, r * 0.04, 0, TAU); ctx.fill();
    // 6) 底部内反射弧(泡泡的"倒影感")
    ctx.strokeStyle = 'rgba(255,255,255,0.38)';
    ctx.lineWidth = Math.max(1, r * 0.045);
    ctx.beginPath(); ctx.arc(0, 0, r * 0.84, 1.95, 2.75); ctx.stroke();
    ctx.restore();
    // v564 边缘积色描边(手绘水彩)
    ctx.lineWidth = 1.6; ctx.strokeStyle = _wcRgba('#6E84B8', 0.35);
    wcCirclePath(ctx, b.x, b.y, b.r, b.r, (b.x * 0.13 + b.y * 0.17) | 0, 1.0);
    ctx.stroke();
  }

  function drawPop(p) {
    const k = p.t / 0.5;
    if (k >= 1) return;
    const a = 1 - k;
    ctx.save();
    // 破裂的三段弧(碎裂感)
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,255,255,${a * 0.85})`;
    ctx.lineWidth = 2.4 * a + 0.5;
    const rr = p.r * (0.55 + k * 1.6);
    for (const seg of [{ a0: -0.4, a1: 1.3 }, { a0: 1.8, a1: 3.3 }, { a0: 4.0, a1: 5.4 }]) {
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, seg.a0 + k * 0.8, seg.a1 + k * 0.8); ctx.stroke();
    }
    ctx.strokeStyle = `hsla(${p.hue}, 95%, 75%, ${a * 0.4})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(p.x, p.y, rr * 1.08, -1.2, 0.6); ctx.stroke();
    // 飞溅小水珠
    for (const d of p.drops) {
      const dx = p.x + Math.cos(d.a) * d.v * p.t;
      const dy = p.y + Math.sin(d.a) * d.v * p.t + 60 * p.t * p.t;
      ctx.fillStyle = `rgba(230,245,255,${a})`;
      ctx.beginPath(); ctx.arc(dx, dy, d.r * a + 0.4, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function drawWand(t) {
    ctx.save();
    // 手柄
    ctx.strokeStyle = '#B98A6A';
    ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(WAND_X + 46, GAME_H - 8);
    ctx.lineTo(WAND_X + 6, WAND_Y);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(WAND_X + 45, GAME_H - 12);
    ctx.lineTo(WAND_X + 7, WAND_Y - 2);
    ctx.stroke();
    // 泡泡圈(圆环)
    const wr = 26;
    const wg = ctx.createLinearGradient(WAND_X - wr, WAND_Y - wr, WAND_X + wr, WAND_Y + wr);
    wg.addColorStop(0, '#D8C3A8');
    wg.addColorStop(0.5, '#F2E4D0');
    wg.addColorStop(1, '#C9B094');
    ctx.strokeStyle = wg;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(WAND_X, WAND_Y - 10, wr, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(WAND_X, WAND_Y - 10, wr - 2.4, -2.4, -0.7); ctx.stroke();
    // 圈上的皂膜(吹气时鼓起 + 流光)
    if (wandFilm > 0.02) {
      const fr = wr * (0.5 + wandFilm * 0.4);
      const fg = ctx.createRadialGradient(WAND_X - fr * 0.3, WAND_Y - 14, 2, WAND_X, WAND_Y - 10, fr);
      const shimmer = (t * 0.0004) % 1;
      fg.addColorStop(0, 'rgba(255,255,255,0.10)');
      fg.addColorStop(0.6 + shimmer * 0.2, `hsla(${(shimmer * 360) % 360}, 90%, 80%, 0.18)`);
      fg.addColorStop(1, 'rgba(255,255,255,0.05)');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.arc(WAND_X, WAND_Y - 10, wr - 3, 0, TAU); ctx.fill();
      ctx.strokeStyle = `hsla(${(shimmer * 720) % 360}, 95%, 78%, 0.35)`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(WAND_X, WAND_Y - 10, fr, -2.2 + shimmer, 0.5 + shimmer); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---- 主循环 ---- */
  function loop() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    // 吹气
    if (blowing) {
      blowAcc += dt;
      wandFilm = Math.min(1, wandFilm + dt * 4);
      if (blowAcc >= 0.20) { blowAcc = 0; spawnBubble(); }
    } else {
      wandFilm = Math.max(0, wandFilm - dt * 2.2);
    }

    // 泡泡上升
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.inflate = Math.min(1, b.inflate + dt / 0.3);
      // duangduang 充气(过冲回弹)
      const over = 1 + 0.18 * Math.exp(-b.inflate * 5) * Math.sin(b.inflate * 14);
      b.r = b.targetR * (0.15 + 0.85 * (1 - Math.pow(1 - b.inflate, 3))) * over;
      b.y += b.vy * dt;
      b.x += Math.cos(now * 0.001 * b.swayF + b.swayP) * b.swayA * dt;
      if (b.y < -b.r - 8) bubbles.splice(i, 1);   // 飘出顶部
    }
    // 破裂特效推进
    for (let i = pops.length - 1; i >= 0; i--) {
      pops[i].t += dt;
      if (pops[i].t > 0.55) pops.splice(i, 1);
    }
    // 背景微尘
    for (const d of dust) {
      d.y += d.vy * dt;
      if (d.y < -4) { d.y = GAME_H + 4; d.x = Math.random() * GAME_W; }
    }

    // ---- 绘制 ----
    // 梦幻背景
    const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
    bg.addColorStop(0, '#EFE6FB');
    bg.addColorStop(0.55, '#E3EEFB');
    bg.addColorStop(1, '#FBEFDF');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    for (const d of dust) {
      ctx.fillStyle = `rgba(255,255,255,${d.a})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill();
    }
    drawWand(now);
    for (const b of bubbles) drawBubble(b, now);
    for (const p of pops) drawPop(p);

    // 底部小字
    ctx.font = '500 13px "Noto Sans SC", sans-serif';
    ctx.fillStyle = 'rgba(110,100,140,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('按住吹泡泡 · 戳一下 啵~', GAME_W / 2, GAME_H - 8);

    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(loop);
  }
  loop();

  // v48 测试钩子
  window._blow = {
    get count() { return bubbles.length; },
    get blowing() { return blowing; },
    add(n) { for (let i = 0; i < (n || 1); i++) spawnBubble(); },
    get bubblesRef() { return bubbles; },
    popAt(x, y) {
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if (Math.hypot(x - b.x, y - b.y) < Math.max(10, b.r * 1.12)) { popBubble(i); return true; }
      }
      return false;
    },
  };

  return {
    destroy() {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      blowSoundStop();
      if (window._blow) delete window._blow;
    }
  };
}

const GAMES = {
  abstract: { title: '抽象球',       tip: '1.0 版的它回来了: 戳我换颜色 · 拽我冒星星 · 我不生气', build: buildAbstract },
  tugball: { title: '拽拽弹力球',   tip: '果冻质感的小球: 捏我 拽我 把我甩飞, 我不生气', build: buildTugBall },
  jelly:  { title: '水感果冻捏捏', tip: '水感果冻块, 按下去凹陷回弹, 表面还有会滑的小水珠', build: buildJelly },
  bubble: { title: '泡泡纸',       tip: '点一下, 或按住滑过去一口气捏爆一整排', build: buildBubbleWrap },
  soap:   { title: '切肥皂',       tip: '握着刀随便划, 任意方向都能切, 圈个形状也能切下来', build: buildSoap },
  maker:  { title: 'DIY 史莱姆',   tip: '从一瓶胶水开始做, 第一视角开罐玩, 六种泥各有手感', build: buildMaker },
  roast:  { title: '炭火烤串',     tip: '长按把食材放到火上烤, 烤到金黄拿开, 一直放着会烤焦(纯凭颜色判断)', build: buildRoast },
  blend:  { title: '冰激凌机',   tip: '选配料倒进机器, 按住打出来, 渐变色的软雪糕丝滑又绵密', build: buildBlender },
  woodfish: { title: '敲木鱼',     tip: '点一下敲一下, 连着敲有功德暴击, 节奏随意', build: buildWoodfish },
  still:  { title: '精油蒸馏',     tip: '放花瓣, 点火, 看蒸汽爬过冷凝管, 一滴一滴接出精油', build: buildStill },
  soda:   { title: '开汽水',       tip: '按住瓶盖画圈拧开, 听那声"啵", 然后点瓶子喝掉', build: buildSoda },
  pizza:  { title: '做披萨',       tip: '揉面 → 抹酱 → 撒芝士 → 摆配菜 → 烤 → 切八份, 全程自己来', build: buildPizza },
  taichi: { title: '指尖小圆',     tip: '把手放到白圈里的小蓝点上, 缓慢移动, 看着它慢慢长大, 松手它会缩回消失', build: buildTaichi },
  blow:   { title: '吹泡泡',       tip: '按住泡泡圈吹出一串晶莹的泡泡, 再戳一下, 啵~ 就破啦', build: buildBlow },
};
if (typeof window !== 'undefined') window._games = GAMES;   // v51 测试可见

let activeGame = null;
let overlayOpenedAt = 0;   // v548: 游戏弹窗打开时间戳(防误触关闭)

function bindGames() {
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => openGame(card.dataset.game));
  });

  const overlay = document.getElementById('gameOverlay');
  document.getElementById('gameClose').addEventListener('click', closeGame);
  // v548: 防误触关闭 —— 修复可乐等游戏"第一次打开被弹出去":
  // 手机端冷启动时首次点卡片有延迟, 用户补点的第二下(或合成 click 余波)会落到
  // 刚打开的遮罩上直接关掉游戏。约束: 按下/抬起都在遮罩本身 + 打开满 500ms 才允许关闭
  let overlayDownOnBackdrop = false;
  overlay.addEventListener('pointerdown', e => { overlayDownOnBackdrop = e.target === overlay; });
  overlay.addEventListener('click', e => {
    if (e.target !== overlay) return;
    if (!overlayDownOnBackdrop) return;
    if (performance.now() - overlayOpenedAt < 500) return;
    closeGame();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeGame();
  });

  // 两个跳转按钮
  const gcta = document.getElementById('enterGamesCta');
  if (gcta) gcta.addEventListener('click', e => { e.preventDefault(); goView('games'); });
  const acta = document.getElementById('enterAsmrCta');
  if (acta) acta.addEventListener('click', e => { e.preventDefault(); goView('asmr'); });
}

function goView(id) {
  showView(id);
  history.replaceState(null, '', '#' + id);
}

function openGame(key) {
  const g = GAMES[key];
  if (!g) return;
  closeGame();
  const stage = document.getElementById('gameStage');
  stage.innerHTML = '';
  document.getElementById('gameTitle').textContent = g.title;
  document.getElementById('gameTip').textContent = g.tip;
  document.getElementById('gameOverlay').classList.add('open');
  overlayOpenedAt = performance.now();
  document.body.style.overflow = 'hidden';
  activeGame = g.build(stage) || null;
}

function closeGame() {
  if (activeGame && typeof activeGame.destroy === 'function') {
    try { activeGame.destroy(); } catch (e) {}
  }
  activeGame = null;
  document.getElementById('gameOverlay').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('gameStage').innerHTML = '';
}

/* ---------- canvas 小工具 ---------- */
const GAME_W = 560, GAME_H = 400;

function makeGameCanvas(stage, w, h) {
  const cv = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = w * dpr;
  cv.height = h * dpr;
  cv.style.touchAction = 'none';   // 手机玩 canvas 游戏时不触发页面滚动
  stage.appendChild(cv);
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  return { cv, ctx };
}


function canvasPos(cv, e, w, h) {
  const r = cv.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (w / r.width),
    y: (e.clientY - r.top) * (h / r.height),
  };
}

/* ---------- v564 手绘水彩画风工具包 (纯 canvas 2D, 全平台兼容) ----------
   与游戏卡片封面同款: 手绘抖边 + 多层透明叠染(湿叠) + 边缘积色 + 纸感颗粒
   原则: 只改视觉层, 不动判定/逻辑; 用确定 seed, 每帧不闪 */
const WC_TILE = (() => {  // 预生成 64x64 纸感颗粒贴图, 全局复用
  const t = document.createElement('canvas');
  t.width = t.height = 64;
  const x = t.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,0)'; x.fillRect(0, 0, 64, 64);
  let s = 20260829;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < 90; i++) {
    x.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.45)' : 'rgba(80,60,72,0.30)';
    x.fillRect(rnd() * 64, rnd() * 64, 1, 1);
  }
  return t;
})();

// 把 rgb 字符串转 r/g/b 三个数 (用于透明色)
function _wcRgb(c) {
  if (c.charCodeAt(0) === 35) {  // #rrggbb
    return [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
  }
  const m = c.match(/\d+/g); return m ? [+m[0],+m[1],+m[2]] : [0,0,0];
}
function _wcRgba(c, a) { const r = _wcRgb(c); return 'rgba(' + r[0] + ',' + r[1] + ',' + r[2] + ',' + a + ')'; }
// 色相加深(模拟边缘积色, 把 RGB 线性下压 22%)
function _wcDarken(c, f) {
  const r = _wcRgb(c);
  return 'rgb(' + Math.round(r[0]*(1-f)) + ',' + Math.round(r[1]*(1-f)) + ',' + Math.round(r[2]*(1-f)) + ')';
}

// 手绘抖动圆/椭圆路径: 沿圆周加低频扰动, 二次曲线平滑闭合
//  ctx  + x,y 中心  + rx,ry 半径  + seed  + wob 抖动强度(0~1.5)
function wcCirclePath(ctx, x, y, rx, ry, seed, wob) {
  wob = wob == null ? 1 : wob;
  const N = 16, pts = [];
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2;
    const w = 1 + Math.sin(a * 3 + seed) * 0.040 * wob
                + Math.sin(a * 7 + seed * 2.7) * 0.022 * wob
                + Math.sin(a * 11 + seed * 1.3) * 0.010 * wob;
    pts.push([x + Math.cos(a) * rx * w, y + Math.sin(a) * ry * w]);
  }
  ctx.beginPath();
  ctx.moveTo((pts[0][0] + pts[N-1][0]) / 2, (pts[0][1] + pts[N-1][1]) / 2);
  for (let i = 0; i < N; i++) {
    const p = pts[i], q = pts[(i + 1) % N];
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  ctx.closePath();
}

// 手绘圆角矩形(用正弦扰动四个圆角)
function wcRoundRect(ctx, x, y, w, h, r, seed, wob) {
  wob = wob == null ? 1 : wob;
  r = Math.min(r, Math.min(w, h) / 2);
  const N = 6, pts = [];
  // 4 段圆角每段 6 点, 直线段加点
  function addArc(cx, cy, rs, a0, a1) {
    for (let i = 0; i <= N; i++) {
      const a = a0 + (a1 - a0) * i / N;
      const wgt = 1 + Math.sin(a * 3 + seed + cx) * 0.04 * wob;
      pts.push([cx + Math.cos(a) * rs * wgt, cy + Math.sin(a) * rs * wgt]);
    }
  }
  addArc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  addArc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);
  addArc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
  addArc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

// 水彩球: 1)外晕(放大 8% 极淡)  2)主体渐变  3)高光  4)边缘积色描边
//  hi/lo 是两色 (hex / rgb 字符串)
function wcBall(ctx, x, y, r, hi, lo, seed) {
  seed = seed || 1;
  // 1) 外晕
  wcCirclePath(ctx, x, y, r * 1.08, r * 1.08, seed + 11, 1.0);
  ctx.fillStyle = _wcRgba(hi, 0.30);
  ctx.fill();
  // 2) 主体渐变(偏左上的径向光)
  const g = ctx.createRadialGradient(x - r * 0.32, y - r * 0.38, r * 0.10, x, y, r * 1.05);
  g.addColorStop(0, _wcRgba(hi, 0.95));
  g.addColorStop(0.65, _wcRgba(lo, 0.88));
  g.addColorStop(1, _wcRgba(lo, 1));
  wcCirclePath(ctx, x, y, r, r, seed, 1.0);
  ctx.fillStyle = g;
  ctx.fill();
  // 3) 边缘积色(深色低透明度描边)
  ctx.lineWidth = Math.max(1.2, r * 0.06);
  ctx.strokeStyle = _wcRgba(_wcDarken(lo, 0.45), 0.45);
  wcCirclePath(ctx, x, y, r * 0.98, r * 0.98, seed, 1.0);
  ctx.stroke();
  // 4) 油亮高光
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.ellipse(x - r * 0.32, y - r * 0.42, r * 0.32, r * 0.16, -0.5, 0, Math.PI * 2); ctx.fill();
  // 5) 微高光点
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.arc(x - r * 0.36, y - r * 0.45, r * 0.07, 0, Math.PI * 2); ctx.fill();
}

// 水彩椭圆(类似 wcBall, 但支持非圆)
function wcEllipse(ctx, x, y, rx, ry, hi, lo, seed) {
  seed = seed || 1;
  wcCirclePath(ctx, x, y, rx * 1.06, ry * 1.06, seed + 11, 1.0);
  ctx.fillStyle = _wcRgba(hi, 0.28);
  ctx.fill();
  const g = ctx.createRadialGradient(x - rx * 0.32, y - ry * 0.38, Math.min(rx, ry) * 0.10, x, y, Math.max(rx, ry) * 1.05);
  g.addColorStop(0, _wcRgba(hi, 0.95));
  g.addColorStop(0.7, _wcRgba(lo, 0.92));
  g.addColorStop(1, _wcRgba(lo, 1));
  wcCirclePath(ctx, x, y, rx, ry, seed, 1.0);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = Math.max(1.2, Math.min(rx, ry) * 0.06);
  ctx.strokeStyle = _wcRgba(_wcDarken(lo, 0.45), 0.42);
  wcCirclePath(ctx, x, y, rx * 0.98, ry * 0.98, seed, 1.0);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.ellipse(x - rx * 0.32, y - ry * 0.42, rx * 0.32, ry * 0.18, -0.5, 0, Math.PI * 2); ctx.fill();
}

// 水彩软色块(矩形/圆角矩形主体): 用于瓶子/砧板/机身/石头
//  fill 是 {hi, lo} 主色对; 可选 {hi2, lo2} 做局部第二色
function wcBlock(ctx, x, y, w, h, r, fill, seed) {
  seed = seed || 1;
  const rx = r || 0;
  // 1) 外晕(略大, 极淡)
  wcRoundRect(ctx, x - w * 0.03, y - h * 0.03, w * 1.06, h * 1.06, rx * 1.2, seed + 11, 1.0);
  ctx.fillStyle = _wcRgba(fill.hi, 0.22);
  ctx.fill();
  // 2) 主体: 上下渐变
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, fill.hi);
  g.addColorStop(1, fill.lo);
  wcRoundRect(ctx, x, y, w, h, rx, seed, 1.0);
  ctx.fillStyle = g;
  ctx.fill();
  // 3) 左上偏光
  const lg = ctx.createLinearGradient(x, y, x + w * 0.6, y + h * 0.6);
  lg.addColorStop(0, 'rgba(255,255,255,0.28)');
  lg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = lg;
  wcRoundRect(ctx, x, y, w, h, rx, seed, 1.0);
  ctx.fill();
  // 4) 边缘积色描边
  ctx.lineWidth = 2.0;
  ctx.strokeStyle = _wcRgba(_wcDarken(fill.lo, 0.40), 0.50);
  wcRoundRect(ctx, x, y, w, h, rx, seed, 1.0);
  ctx.stroke();
}

// 卡片风四角星 sparkle: 在 (x,y) 画 4 角星(带柔光晕)
function wcSparkle(ctx, x, y, r, color, alpha) {
  alpha = alpha == null ? 0.9 : alpha;
  color = color || '#F5D992';
  // 柔光晕
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4);
  g.addColorStop(0, _wcRgba(color, 0.35 * alpha));
  g.addColorStop(1, _wcRgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill();
  // 星形(4 角)
  ctx.fillStyle = _wcRgba(color, alpha);
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.2, y - r * 0.2, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.2, y + r * 0.2, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.2, y + r * 0.2, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.2, y - r * 0.2, x, y - r);
  ctx.closePath();
  ctx.fill();
  // 中心亮点
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, Math.PI * 2); ctx.fill();
}

// 纸感颗粒(整片区域, 低透明 multiply): 渲染时调一次
function wcPaper(ctx, x, y, w, h) {
  const pat = ctx.createPattern(WC_TILE, 'repeat');
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = pat;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}

// 阴影椭圆(投影, 软)
function wcShadow(ctx, x, y, rx, ry, alpha) {
  alpha = alpha == null ? 0.16 : alpha;
  const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
  g.addColorStop(0, 'rgba(50,40,60,' + alpha + ')');
  g.addColorStop(1, 'rgba(50,40,60,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}

// 抖动折线(手绘线): pts=[[x,y],...]
function wcPolyline(ctx, pts, seed, close) {
  if (pts.length < 2) return;
  ctx.beginPath();
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (i === 0) ctx.moveTo(a[0] + Math.sin(seed + i) * 0.6, a[1] + Math.cos(seed + i * 1.7) * 0.6);
    const midx = (a[0] + b[0]) / 2, midy = (a[1] + b[1]) / 2;
    ctx.quadraticCurveTo(a[0] + Math.sin(seed + i * 1.3) * 0.8, a[1] + Math.cos(seed + i) * 0.8, midx, midy);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last[0], last[1]);
  if (close) ctx.closePath();
}

// v565 色彩混合
function _wcMix(c1, c2, t) {
  const a = _wcRgb(c1), b = _wcRgb(c2);
  return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
}

// v565 卡片同款水彩叠染: 对任意 pathFn 闭合路径做卡片四件套
// (外晕 → 3段偏移径向渐变 → 二层叠染 → 边缘积色 → 层叠高光+散点白点)
function wcWashPath(ctx, pathFn, cx, cy, r, hi, lo, opt) {
  opt = opt || {};
  const mid = _wcMix(hi, lo, 0.5);
  // 1) 外晕(放大 7%)
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(1.07, 1.07); ctx.translate(-cx, -cy);
  pathFn(ctx);
  ctx.fillStyle = _wcRgba(hi, opt.haloA != null ? opt.haloA : 0.28);
  ctx.fill();
  ctx.restore();
  // 2) 主体: 3 段偏移径向渐变(卡片 gwgbBody 同款)
  const g = ctx.createRadialGradient(cx - r * 0.24, cy - r * 0.3, r * 0.1, cx, cy, r * 1.12);
  g.addColorStop(0, _wcRgba(hi, opt.hiA != null ? opt.hiA : 0.97));
  g.addColorStop(0.55, _wcRgba(mid, opt.midA != null ? opt.midA : 0.94));
  g.addColorStop(1, _wcRgba(lo, opt.loA != null ? opt.loA : 1));
  pathFn(ctx);
  ctx.fillStyle = g;
  ctx.fill();
  // 3) 二层叠染(缩 7%, 中间色低透明 → 水彩多层感)
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(0.93, 0.93); ctx.translate(-cx, -cy);
  pathFn(ctx);
  ctx.fillStyle = _wcRgba(opt.washCol || mid, opt.washA != null ? opt.washA : 0.18);
  ctx.fill();
  ctx.restore();
  // 4) 边缘积色描边
  ctx.lineWidth = opt.lw || 2.2;
  ctx.strokeStyle = _wcRgba(_wcDarken(lo, 0.42), opt.edgeA != null ? opt.edgeA : 0.36);
  pathFn(ctx);
  ctx.stroke();
  // 5) 层叠高光 + 散点白点(卡片同款)
  if (opt.hl !== false) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.ellipse(cx - r * 0.28, cy - r * 0.36, r * 0.24, r * 0.12, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.beginPath(); ctx.ellipse(cx + r * 0.12, cy - r * 0.2, r * 0.13, r * 0.07, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  if (opt.dots !== false) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(cx - r * 0.32, cy - r * 0.42, r * 0.045, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.06, cy - r * 0.48, r * 0.035, 0, Math.PI * 2); ctx.fill();
  }
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/* 质点围成的平滑闭合曲线(n 可省略, 用于排除中心质点) */
function blobPath(ctx, pts, n) {
  const count = n || pts.length;
  const list = n ? pts.slice(0, n) : pts;
  const len = list.length;
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const m0 = mid(list[len - 1], list[0]);
  ctx.beginPath();
  ctx.moveTo(m0.x, m0.y);
  for (let i = 0; i < len; i++) {
    const p = list[i];
    const m = mid(p, list[(i + 1) % len]);
    ctx.quadraticCurveTo(p.x, p.y, m.x, m.y);
  }
  ctx.closePath();
}

/* ---------- 软体(果冻球 / 史莱姆共用) ---------- */
function makeSoftBody(opt) {
  const n = opt.n;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = opt.cx + Math.cos(a) * opt.rx;
    const y = opt.cy + Math.sin(a) * opt.ry;
    pts.push({ x, y, px: x, py: y });
  }
  pts.push({ x: opt.cx, y: opt.cy, px: opt.cx, py: opt.cy }); // 中心质点, index = n

  const springs = [];
  for (let i = 0; i < n; i++) {
    springs.push({ a: i, b: (i + 1) % n, k: opt.kRing });
    springs.push({ a: i, b: (i + 2) % n, k: opt.kCross });
    springs.push({ a: i, b: n, k: opt.kCenter });
  }
  springs.forEach(s => {
    const dx = pts[s.b].x - pts[s.a].x, dy = pts[s.b].y - pts[s.a].y;
    s.rest = Math.hypot(dx, dy);
    s.rest0 = s.rest;              // v46: 基准弹簧长(起泡胶发泡整体结构放大用)
  });

  // v46: 结构性整体缩放(弹簧基准长 × f), 用于起泡胶"越揉越大"
  function setScale(f) {
    for (const s of springs) s.rest = s.rest0 * f;
  }

  function step(applyForces) {
    // verlet 积分
    for (const p of pts) {
      const vx = (p.x - p.px) * opt.damping;
      const vy = (p.y - p.py) * opt.damping;
      p.px = p.x; p.py = p.y;
      p.x += vx;
      p.y += vy + opt.gravity;
    }
    // 回位拉力(果冻球悬浮在画布中心)
    if (opt.anchorPull) {
      const c = pts[n];
      c.x += (opt.cx - c.x) * opt.anchorPull;
      c.y += (opt.cy - c.y) * opt.anchorPull;
    }
    // 外力(鼠标挤压 / 抓取)
    if (applyForces) applyForces(pts);
    // 弹簧约束(PBD, 多次迭代让果冻"紧实")
    for (let iter = 0; iter < 3; iter++) {
      for (const s of springs) {
        const pa = pts[s.a], pb = pts[s.b];
        let dx = pb.x - pa.x, dy = pb.y - pa.y;
        let d = Math.hypot(dx, dy) || 0.0001;
        const diff = ((d - s.rest) / d) * 0.5 * s.k;
        const ox = dx * diff, oy = dy * diff;
        pa.x += ox; pa.y += oy;
        pb.x -= ox; pb.y -= oy;
      }
      if (opt.floorY != null) {
        for (const p of pts) {
          if (p.y > opt.floorY) {
            p.y = opt.floorY;
            p.x = p.px + (p.x - p.px) * 0.45; // 地面摩擦
          }
        }
      }
    }
  }

  function center() {
    let cx = 0, cy = 0;
    for (let i = 0; i < n; i++) { cx += pts[i].x; cy += pts[i].y; }
    return { x: cx / n, y: cy / n };
  }
  function avgR() {
    const c = center();
    let r = 0;
    for (let i = 0; i < n; i++) r += Math.hypot(pts[i].x - c.x, pts[i].y - c.y);
    return r / n;
  }

  return { pts, step, center, avgR, n, ringRest: springs[0].rest, setScale };
}

/* ---------- 游戏 1: 水感果冻捏捏(v43: FUN CUBE 立方体, 半透果冻质感 + 表面水珠) ---------- */
const JELLY_CUBE_COLORS = [
  { name: '麦芽金', c1: 'rgba(255, 228, 164, 0.78)', c2: 'rgba(238, 172, 64, 0.88)',  rim: 'rgba(255, 244, 210, 0.95)' },
  { name: '樱花粉', c1: 'rgba(255, 216, 228, 0.78)', c2: 'rgba(242, 132, 166, 0.88)', rim: 'rgba(255, 236, 244, 0.95)' },
  { name: '薄荷绿', c1: 'rgba(212, 248, 226, 0.76)', c2: 'rgba(108, 208, 158, 0.88)', rim: 'rgba(232, 254, 240, 0.95)' },
  { name: '云朵蓝', c1: 'rgba(214, 236, 255, 0.76)', c2: 'rgba(110, 166, 232, 0.88)', rim: 'rgba(236, 248, 255, 0.95)' },
  { name: '香芋紫', c1: 'rgba(234, 220, 252, 0.76)', c2: 'rgba(162, 126, 218, 0.88)', rim: 'rgba(244, 236, 255, 0.95)' },
  { name: '白玉',   c1: 'rgba(250, 248, 244, 0.8)',  c2: 'rgba(210, 194, 178, 0.88)', rim: 'rgba(255, 253, 249, 0.95)' },
];

function buildJelly(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const RING = 92;                        // 软体物理环半径(静止基准)
  const S = RING;                         // 立方体边长的一半
  let colorIdx = 0;

  // 果冻手感: 慢回弹(模拟慢回弹减压球, 释放后约 2-3s 完全复原)
  // v53: 真·捏捏(市面慢回弹捏捏乐) —— 按下去凹陷, 松手后缓慢复原,
  //      不是弹力球"啵"地弹回。k 值整体调低 + damping 调高(更黏) + anchorPull 降至 1/3.75
  const soft = makeSoftBody({
    cx: 280, cy: 186, rx: RING, ry: RING, n: 24,
    gravity: 0, damping: 0.88,
    kRing: 0.13, kCross: 0.07, kCenter: 0.09,
    anchorPull: 0.012,
  });

  const ptr = { active: false, x: -999, y: -999 };
  let downAt = 0;             // 按住时长(果冻被按久了会慢慢塌)
  let lastSquish = 0;
  let raf = 0;

  // 表面水珠(FUN CUBE 招牌: 缓慢下滑, 越按越活跃)
  const drops = [];
  for (let i = 0; i < 5; i++) {
    drops.push({ rx: -0.5 + Math.random(), ry: -0.55 + Math.random() * 1.0, s: 4.5 + Math.random() * 4, v: 0.0011 + Math.random() * 0.0013, ph: Math.random() * Math.PI * 2 });
  }

  // 颜色选择
  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  const row = document.createElement('div');
  row.className = 'st-row';
  JELLY_CUBE_COLORS.forEach((jc, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'st-chip' + (i === colorIdx ? ' on' : '');
    chip.innerHTML = `<i class="st-dotc" style="--c:${jc.c2}"></i>${jc.name}`;
    chip.addEventListener('click', e => {
      e.stopPropagation();
      row.querySelectorAll('.st-chip').forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      colorIdx = i;
    });
    row.appendChild(chip);
  });
  tools.appendChild(row);
  stage.appendChild(tools);

  const onDown = e => { ptr.active = true; const p = canvasPos(cv, e, GAME_W, GAME_H); ptr.x = p.x; ptr.y = p.y; downAt = performance.now(); };
  const onMove = e => { if (!ptr.active) return; const p = canvasPos(cv, e, GAME_W, GAME_H); ptr.x = p.x; ptr.y = p.y; };
  const onUp = () => {
    // v53: 捏捏释放不是"duang"弹回, 是缓慢回弹的黏腻感 —— 用轻柔挤捏声代替 boing
    if (ptr.active) playSfx('game.jellySquish', { volume: 0.45 });
    ptr.active = false; downAt = 0;
  };
  stage.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  const status = document.createElement('span');
  status.className = 'game-status';
  status.textContent = '按住捏出凹陷, 松手后回弹, 表面的小水珠会滑哦';
  stage.appendChild(status);

  // 超椭圆因子: 方向 u → 圆角方形边界(p=4 的 squircle, FUN CUBE 造型)
  function squircleF(ux, uy) {
    return 1 / Math.pow(Math.pow(Math.abs(ux), 4) + Math.pow(Math.abs(uy), 4), 0.25);
  }

  // 软体环 → 立方体轮廓点: 把每个环点的形变(半径比例)映射到 squircle 边界
  function cubePath(g, c) {
    const pts = [];
    for (let i = 0; i < soft.n; i++) {
      const p = soft.pts[i];
      const dx = p.x - c.x, dy = p.y - c.y;
      const r = Math.max(0.001, Math.hypot(dx, dy));
      const ux = dx / r, uy = dy / r;
      const scale = r / RING;                       // 形变比例(静止=1)
      const f = squircleF(ux, uy);
      pts.push({ x: c.x + ux * f * S * scale, y: c.y + uy * f * S * scale });
    }
    blobPath(g, pts);
    return pts;
  }

  function render(time) {
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    const c = soft.center();
    const jc = JELLY_CUBE_COLORS[colorIdx];
    const press = ptr.active && Math.hypot(ptr.x - c.x, ptr.y - c.y) < S * 1.3;

    // 桌面柔光
    const bg = ctx.createRadialGradient(280, 170, 30, 280, 210, 320);
    bg.addColorStop(0, 'rgba(200, 214, 224, 0.16)');
    bg.addColorStop(1, 'rgba(200, 214, 224, 0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // 影子
    ctx.fillStyle = 'rgba(96, 126, 148, 0.2)';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y + S * 1.12, S * 1.04, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // —— 立方体主体 —— //
    const pts = cubePath(ctx, c);

    // v564 水彩外晕(放大一点的柔色层)
    const halo = ctx.createRadialGradient(c.x, c.y, S * 0.6, c.x, c.y, S * 1.6);
    halo.addColorStop(0, _wcRgba(jc.c1, 0.35));
    halo.addColorStop(1, _wcRgba(jc.c1, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(c.x - S * 1.7, c.y - S * 1.7, S * 3.4, S * 3.4);

    // 半透明糖果渐变(左上亮 → 右下饱和)
    const grad = ctx.createLinearGradient(c.x - S, c.y - S, c.x + S, c.y + S);
    grad.addColorStop(0, jc.c1);
    grad.addColorStop(1, jc.c2);
    ctx.fillStyle = grad;
    ctx.fill();
    // v564 边缘积色描边(手绘)
    ctx.lineWidth = 2.4; ctx.strokeStyle = _wcRgba(_wcDarken(jc.c2, 0.42), 0.42);
    ctx.stroke();
    // v565 二层叠染 + 散点白点(卡片同款)
    ctx.save();
    ctx.translate(c.x, c.y); ctx.scale(0.93, 0.93); ctx.translate(-c.x, -c.y);
    cubePath(ctx, c);
    ctx.fillStyle = _wcRgba(jc.c1, 0.30);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(c.x - S * 0.34, c.y - S * 0.42, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(c.x + S * 0.24, c.y - S * 0.52, 1.7, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    cubePath(ctx, c);
    ctx.clip();

    // 内部通透光斑 ×2
    [[-0.24, -0.3, 0.62, 0.2], [0.2, 0.24, 0.46, 0.13]].forEach(([ox, oy, rr, aa]) => {
      const g2 = ctx.createRadialGradient(c.x + S * ox, c.y + S * oy, 2, c.x + S * ox, c.y + S * oy, S * rr);
      g2.addColorStop(0, 'rgba(255,255,255,' + aa + ')');
      g2.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(c.x - S * 1.4, c.y - S * 1.4, S * 2.8, S * 2.8);
    });

    // 顶部大高光带(湿润糖面被光扫过)
    ctx.save();
    ctx.translate(c.x - S * 0.3, c.y - S * 0.44);
    ctx.rotate(-0.28);
    ctx.beginPath();
    ctx.ellipse(0, 0, S * 0.44, S * 0.19, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();

    // 锐利镜面高光点
    ctx.beginPath();
    ctx.arc(c.x + S * 0.3, c.y - S * 0.5, S * 0.055, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();

    // 底部贴地亮线
    ctx.beginPath();
    ctx.ellipse(c.x, c.y + S * 0.84, S * 0.52, S * 0.09, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();

    // 表面水珠(按压时滑得更快, 会被捏得晃动)
    const jig = soft.avgR() / RING - 1;      // 形变度(静止≈0)
    for (const d of drops) {
      d.ry += d.v * (press ? 2.6 : 1) * (1 + Math.abs(jig) * 3);
      if (d.ry > 0.74) { d.ry = -0.72; d.rx = -0.55 + Math.random() * 1.1; }
      const wob = Math.sin(time * 0.001 + d.ph) * 0.012 + jig * 0.5;
      const wx = c.x + (d.rx + wob) * S * 0.92;
      const wy = c.y + d.ry * S * 0.92;
      const dg = ctx.createRadialGradient(wx - d.s * 0.3, wy - d.s * 0.35, d.s * 0.1, wx, wy, d.s);
      dg.addColorStop(0, 'rgba(255,255,255,0.85)');
      dg.addColorStop(0.7, 'rgba(255,255,255,0.4)');
      dg.addColorStop(1, 'rgba(255,255,255,0.08)');
      ctx.fillStyle = dg;
      ctx.beginPath(); ctx.arc(wx, wy, d.s, 0, Math.PI * 2); ctx.fill();
      // 水珠底缘暗线(体积感)
      ctx.strokeStyle = 'rgba(120, 130, 150, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(wx, wy, d.s - 0.5, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
      // 水珠高光点
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath(); ctx.arc(wx - d.s * 0.3, wy - d.s * 0.35, d.s * 0.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // 边缘聚光 + 内圈厚度
    cubePath(ctx, c);
    ctx.strokeStyle = jc.rim;
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.save();
    cubePath(ctx, c);
    ctx.clip();
    cubePath(ctx, c);
    ctx.strokeStyle = 'rgba(120, 130, 150, 0.35)';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.restore();
  }

  function loop(time) {
    soft.step(pts => {
      if (!ptr.active) return;
      // 指压: 柔和的凹陷推力(慢回弹捏捏按感, 范围集中 → 局部深凹, 不刺穿)
      // v53: push 4.2 按得更深, 捏捏就该有明显指痕
      const GR = 60;
      for (const p of pts) {
        const dx = p.x - ptr.x, dy = p.y - ptr.y;
        const d = Math.hypot(dx, dy);
        if (d < GR && d > 0.5) {
          const push = (1 - d / GR) * 4.2;
          p.x += (dx / d) * push;
          p.y += (dy / d) * push;
        }
      }
      // 按住超过 1.2s, 果冻开始慢慢往下塌(黏流变, 慢回弹特色, 缓慢累积)
      if (downAt && performance.now() - downAt > 1200) {
        for (let i = 0; i < soft.n; i++) pts[i].y += 0.16;
      }
      // 揉动时偶发湿润黏连声
      const now = performance.now();
      if (now - lastSquish > 640) {
        const c = soft.center();
        if (Math.hypot(ptr.x - c.x, ptr.y - c.y) < soft.avgR() * 1.4) {
          playSfx('game.jellySquish', { volume: 0.7 });
          lastSquish = now;
        }
      }
    });
    render(time || 0);
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(loop);
  }
  loop();

  /* v47 测试钩子: 暴露 soft 状态用于度量形变恢复时间 */
  /* rest[]: 静止基准位置(每个 ring 点), 用于算任意方向的位移 */
  const rest = soft.pts.map(p => ({ x: p.x, y: p.y }));
  window._jelly = {
    get avgR() { return soft.avgR(); },
    get restR() { return RING; },
    /* 任意方向的总形变量(0=完美静止, 越大越变形) */
    get deformation() {
      const ps = soft.pts;
      let s = 0;
      for (let i = 0; i < soft.n; i++) {
        const dx = ps[i].x - rest[i].x, dy = ps[i].y - rest[i].y;
        s += Math.hypot(dx, dy);
      }
      return s / soft.n;
    },
    /* 单点最大位移(局部凹陷深度) */
    get maxDeform() {
      const ps = soft.pts;
      let m = 0;
      for (let i = 0; i < soft.n; i++) {
        m = Math.max(m, Math.hypot(ps[i].x - rest[i].x, ps[i].y - rest[i].y));
      }
      return m;
    },
    get ptr() { return ptr; },
  };

  return {
    destroy() {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (window._jelly) delete window._jelly;
    }
  };
}

/* ---------- 史莱姆材质库(按真实泥特性逐个调校) ----------
   foam   起泡胶: 揉拉裹气→蜂窝微孔→体积膨胀, 越拉越大, 撕裂吱吱声
   glass  液态玻璃: 高透挺实, 内部悬浮气泡珠, 捏压清脆炸耳噼啪
   ice    冰山泥: 半透磨砂碎冰, 按压碾碎咔嚓
   crystal 水晶泥: 全透Q弹, 拉丝如融化的玻璃
   water  假水: 稀薄如水, 缓缓流淌
   jelly  果冻泥: 半透微光, 全场 jiggle
   clay   粘土泥: 哑光厚实, 闷闷按压
   butter 黄油泥: 绵密奶油感, 软乎不弹, 切面平滑 */
/* v36.8: 史莱姆限定六种泥(用户明确指定)
   物理参数: 棉花泥/液态玻璃/起泡胶/脆皮冰山泥/黄油泥/假水 */
const SLIME_MATS = {
  cotton: { name: '棉花泥',   kRing: 0.78, kCross: 0.46, kCenter: 0.55, damping: 0.945, gravity: 0.18, cotton: true,  sfx: 'game.slimeCotton' },
  glass:  { name: '液态玻璃', kRing: 0.86, kCross: 0.55, kCenter: 0.5,  damping: 0.94,  gravity: 0.3,  glass: true,   sfx: 'game.slimeGlass' },
  foam:   { name: '起泡胶',   kRing: 0.34, kCross: 0.16, kCenter: 0.22, damping: 0.925, gravity: 0.2,  foam: true,    sfx: 'game.slimeFoam' },
  ice:    { name: '脆皮冰山泥', kRing: 0.82, kCross: 0.52, kCenter: 0.48, damping: 0.955, gravity: 0.26, ice: true,     sfx: 'game.slimeIce' },
  butter: { name: '黄油泥',   kRing: 0.5,  kCross: 0.3,  kCenter: 0.4,  damping: 0.86,  gravity: 0.34, butter: true,  sfx: 'game.slimeButter' },
  water:  { name: '假水',     kRing: 0.26, kCross: 0.09, kCenter: 0.1,  damping: 0.985, gravity: 0.5,  liquid: true,  sfx: 'game.slimeWater' },
};
const SLIME_COLORS = ['#A8E6CF', '#9FD8EF', '#F8C8DC', '#FAD9A0', '#C9B6F2', '#F5F0E8', '#F4A9A0', '#B8D98A'];

/* ---------- 游戏 2: DIY 史莱姆(制作 → 第一人称开罐玩, v36.8 六种泥) ---------- */
/* v36.8: 6 个泥类型按钮(step 3 "选泥"), 替代原 SLIME_ADDONS 多辅料 */
const SLIME_TYPES = [
  { key: 'cotton', name: '棉花泥',     desc: '超弹超柔软, 戳起来 ASMR 治愈',       chip: '#C5E8DA' },
  { key: 'glass',  name: '液态玻璃',   desc: '清脆炸耳的玻璃质感, 会拉银丝',       chip: '#D8F0FA' },
  { key: 'foam',   name: '起泡胶',     desc: '越揉越蓬松, 气泡噼里啪啦',           chip: '#F3EEE4' },
  { key: 'ice',    name: '脆皮冰山泥', desc: '外层酥脆咔嚓, 内部软弹',             chip: '#DCD0F0' },
  { key: 'butter', name: '黄油泥',     desc: '绵密丝滑, 沙沙闷响',                 chip: '#F6E7B8' },
  { key: 'water',  name: '假水',       desc: '完全透明液体感, 咕嘟咕嘟',           chip: '#CBE6F2' },
];

function buildMaker(stage) {
  const W = GAME_W, H = GAME_H;
  const { cv, ctx } = makeGameCanvas(stage, W, H);
  const BOWL = { x: 280, y: 216, rx: 104, ry: 92 };
  const FLOOR = 338;
  // v36.8: 罐子从侧视矩形改为俯视圆形(占满画布中心, 第一人称视角)
  const JAR = { cx: W / 2, cy: H / 2, R: Math.min(W, H) / 2 - 6, wall: 20 };

  /* ====== 全局状态 ====== */
  let mode = 'craft';            // craft: 制作 | play: 开罐玩
  let step = 1;                  // 制作 1 倒胶水 2 选颜色 3 选泥 4 搅拌 5 成型
  let pouring = false, pourStart = 0, pourT = 0;
  let color = SLIME_COLORS[0];
  let matKey = 'cotton';         // v36.8: 默认棉花泥(改自 jelly)
  let stir = 0, lastPtrAng = null, stirRingT = 0;
  let drops = [], formStart = 0, formed = 0;
  let raf = 0, lastT = 0, lastStirSfx = 0;

  /* play 状态 */
  let phase = 'closed';          // closed → opening → playing
  let lidT = 0;
  let soft = null;
  let grabIdx = -1;
  let releaseFx = null;        // 松手回弹时的丝尾 {x, y, t}
  let foam = 0;                  // 起泡胶发泡度 v46: 0~5.5(越揉越大, 最后溢出罐子)
  let overflowed = false;        // v46: 溢出庆祝只触发一次
  let foamDist = 0, stretchDist = 0, lastStretchSfx = 0, lastMatSfx = 0;
  let glassKnead = 0;             // v568: 液态玻璃揉捏累计距离(越揉越白)
  let bubbles = [], specks = [], glassBeads = [], cottonFibers = [];  // v36.8: 删 glitters(crystal), 加 cottonFibers
  let lastTime = 0;

  /* ====== 骨架(craft 面板) ====== */
  const wrap = document.createElement('div');
  wrap.className = 'maker';
  wrap.innerHTML =
    '<div class="mk-progress"><span class="mk-label" id="mkLabel">第 1 步 · 倒胶水</span>' +
    '<span class="mk-dots"><i class="on"></i><i></i><i></i><i></i><i></i></span></div>';
  stage.appendChild(wrap);
  wrap.appendChild(cv);
  const panel = document.createElement('div');
  panel.className = 'mk-panel';
  wrap.appendChild(panel);

  const labelEl = wrap.querySelector('.mk-label');
  const dots = wrap.querySelectorAll('.mk-dots i');
  const STEP_LABELS = ['第 1 步 · 倒胶水', '第 2 步 · 挑颜色', '第 3 步 · 选泥', '第 4 步 · 搅一搅', '第 5 步 · 成型'];

  /* ====== play 工具条 ====== */
  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.display = 'none';
  stage.appendChild(tools);

  // 史莱姆已用 mk-progress("第 1 步 · 倒胶水"+5个圆点)显示当前步骤, 不再叠加 .game-status 避免与 mk-label 在左上角重影

  function renderTools() {
    tools.innerHTML =
      '<div class="st-row st-mats">' +
        Object.entries(SLIME_MATS).map(([k, m]) =>
          '<button type="button" class="st-chip' + (k === matKey ? ' active' : '') + '" data-mat="' + k + '">' + m.name + '</button>').join('') +
      '</div>' +
      '<div class="st-row st-colors">' +
        SLIME_COLORS.map(c =>
          '<button type="button" class="st-dotc' + (c === color ? ' active' : '') + '" data-color="' + c + '" style="--c:' + c + '" aria-label="颜色 ' + c + '"></button>').join('') +
        '<span class="st-fill"></span>' +
        '<button type="button" class="st-make">再做一个 ↺</button>' +
      '</div>';
  }

  function refreshDecor() {
    const m = SLIME_MATS[matKey];
    specks = [];
    if (m.ice) {
      // v36.8: 脆皮冰山泥 - 颗粒更密更大(模拟冰晶碎屑)
      for (let i = 0; i < 110; i++) {
        specks.push({ ang: Math.random() * Math.PI * 2, rad: Math.sqrt(Math.random()) * 0.9, size: 0.9 + Math.random() * 2.0, white: Math.random() > 0.35, a: 0.42 + Math.random() * 0.4 });
      }
    } else if (m.butter) {
      for (let i = 0; i < 26; i++) {
        specks.push({ ang: Math.random() * Math.PI * 2, rad: Math.sqrt(Math.random()) * 0.9, size: 0.6 + Math.random() * 1.1, white: Math.random() > 0.4, a: 0.1 + Math.random() * 0.16 });
      }
    } else if (m.cotton) {
      // v36.8: 棉花泥 - 大颗均匀气泡孔(像海绵)
      for (let i = 0; i < 75; i++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.sqrt(Math.random()) * 0.88;
        specks.push({ ang, rad, size: 2.4 + Math.random() * 2.8, white: true, a: 0.42 + Math.random() * 0.32 });
      }
    }
    cottonFibers = [];
    if (m.cotton) {
      // 棉花泥: 大量细密纤维线(模拟棉絮拉丝)
      for (let i = 0; i < 60; i++) {
        cottonFibers.push({
          ang: Math.random() * Math.PI * 2,
          rad: Math.sqrt(Math.random()) * 0.85,
          len: 6 + Math.random() * 8,
          ph: Math.random() * Math.PI * 2,
        });
      }
    }
    glassBeads = [];
    if (m.glass) {
      for (let i = 0; i < 30; i++) {
        glassBeads.push({ ang: Math.random() * Math.PI * 2, rad: Math.sqrt(Math.random()) * 0.88, r: 2.2 + Math.random() * 3.6, ph: Math.random() * Math.PI * 2 });
      }
    }
    bubbles = [];
  }
  refreshDecor();

  function makeSoft(fromJar) {
    const m = SLIME_MATS[matKey];
    const prev = soft ? soft.center() : null;
    // v36.8: 俯视视角 - 泥平铺在罐底, 无重力下落; 轻微 anchorPull 让泥自然回中
    soft = makeSoftBody({
      cx: fromJar ? JAR.cx : (prev ? prev.x : JAR.cx),
      cy: fromJar ? JAR.cy : (prev ? prev.y : JAR.cy),
      rx: fromJar ? JAR.R * 0.34 : 66,
      ry: fromJar ? JAR.R * 0.34 : 54,
      n: 22,
      gravity: 0, damping: m.damping,
      kRing: m.kRing, kCross: m.kCross, kCenter: m.kCenter,
      anchorPull: 0.015,
    });
    for (let i = 0; i < soft.n; i++) {
      soft.pts[i].py += 1.6 + Math.random() * 2.2;
    }
  }

  /* ====== craft 面板(每步) ====== */
  function setStep(n) {
    step = n;
    if (n === 5) {
      formStart = performance.now();
      setTimeout(() => {
        if (mode === 'craft' && step === 5 && formed < 1) {
          formed = 1;
          drops = [];
          panel.dataset.done = '1';
          renderPanel();
          playSfx('game.slimeFoam');
          enterPlay();
        }
      }, 2300);
    }
    labelEl.textContent = STEP_LABELS[n - 1];
    dots.forEach((d, i) => d.classList.toggle('on', i < n));
    renderPanel();
  }

  function enterPlay() {
    mode = 'play';
    phase = 'closed';
    lidT = 0;
    soft = null;
    // 起泡胶在刚开罐时给一点初始发泡, 让用户立刻看到蜂窝效果
    foam = (matKey === 'foam') ? 0.42 : 0;
    overflowed = false;
    try {
      const list = JSON.parse(localStorage.getItem('musicAromaSlimes') || '[]');
      list.push({ name: 'DIY', color, mat: matKey, ts: Date.now() });
      while (list.length > 8) list.shift();
      localStorage.setItem('musicAromaSlimes', JSON.stringify(list));
    } catch (e) {}
    stage.insertBefore(cv, tools);   // canvas 移出 wrap, 避免随 wrap 一起隐藏
    wrap.style.display = 'none';
    tools.style.display = '';
    renderTools();
    status.textContent = '做好啦 ✦ 点一下罐子, 打开来玩';
    toast('装罐完成 ✦ 开盖玩吧');
  }

  function backToCraft() {
    mode = 'craft';
    step = 1;
    pouring = false; pourT = 0;
    color = SLIME_COLORS[0];
    matKey = 'cotton';          // v36.8: 默认棉花泥
    stir = 0; stirRingT = 0; lastPtrAng = null;
    drops = []; formed = 0;
    phase = 'closed'; lidT = 0; soft = null; grabIdx = -1;
    foam = 0; bubbles = [];
    tools.style.display = 'none';
    wrap.insertBefore(cv, panel);    // canvas 移回 wrap, 恢复制作布局
    wrap.style.display = '';
    delete panel.dataset.done;
    labelEl.textContent = STEP_LABELS[0];
    dots.forEach((d, i) => d.classList.toggle('on', i === 0));
    renderPanel();
    status.textContent = '点我倒胶水, 做一罐你自己的史莱姆';
  }

  function renderPanel() {
    if (mode !== 'craft') return;
    if (step === 1) {
      panel.innerHTML =
        '<button type="button" class="btn btn-solid mk-main" id="mkPour">' + (pourT >= 1 ? '下一步 · 挑颜色 →' : (pouring ? '倒着呢…' : '点我倒胶水')) + '</button>' +
        '<p class="mk-hint">把白胶挤进碗里, 这是史莱姆的身体</p>';
      panel.querySelector('#mkPour').addEventListener('click', () => {
        if (pouring) return;
        if (pourT >= 1) { setStep(2); return; }
        pouring = true;
        pourStart = performance.now();
        playSfx('game.slimePour');
      });
    } else if (step === 2) {
      panel.innerHTML =
        '<div class="mk-colors">' + SLIME_COLORS.map(c =>
          '<button type="button" class="st-dotc' + (c === color ? ' active' : '') + '" data-color="' + c + '" style="--c:' + c + '"></button>').join('') + '</div>' +
        '<button type="button" class="btn btn-solid mk-main" id="mkNext">下一步 · 选泥 →</button>' +
        '<p class="mk-hint">想要什么颜色的史莱姆?</p>';
      panel.querySelectorAll('.st-dotc').forEach(b => {
        b.addEventListener('click', () => {
          color = b.dataset.color;
          panel.querySelectorAll('.st-dotc').forEach(x => x.classList.toggle('active', x === b));
        });
      });
      panel.querySelector('#mkNext').addEventListener('click', () => setStep(3));
    } else if (step === 3) {
      // v36.8: 6 种泥类型二选一(棉花泥/液态玻璃/起泡胶/脆皮冰山泥/黄油泥/假水)
      panel.innerHTML =
        '<div class="mk-types">' + SLIME_TYPES.map(t =>
          '<button type="button" class="mk-type' + (matKey === t.key ? ' active' : '') + '" data-mat="' + t.key + '">' +
          '<span class="mk-type-chip" style="--c:' + t.chip + '"></span>' +
          '<b>' + t.name + '</b><small>' + t.desc + '</small></button>').join('') + '</div>' +
        '<button type="button" class="btn btn-solid mk-main" id="mkNext">下一步 · 搅一搅 →</button>';
      panel.querySelectorAll('.mk-type').forEach(b => {
        b.addEventListener('click', () => {
          matKey = b.dataset.mat;
          panel.querySelectorAll('.mk-type').forEach(x => x.classList.toggle('active', x === b));
          refreshDecor();
        });
      });
      panel.querySelector('#mkNext').addEventListener('click', () => setStep(4));
    } else if (step === 4) {
      panel.innerHTML =
        '<p class="mk-hint">按住碗里, 转圈搅拌 <b class="mk-stir-pct">' + Math.round(stir * 100) + '%</b></p>' +
        '<div class="mk-stirbar"><i id="mkStirFill"></i></div>';
    } else if (step === 5) {
      if (formed < 1) {
        panel.innerHTML = '<p class="mk-hint">滴入成型液, 等它凝固…</p>';
      } else {
        panel.innerHTML = '<p class="mk-hint">成型啦 ✦ 正在装罐…</p>';
      }
    }
  }
  renderPanel();

  function updStirPanel() {
    if (mode !== 'craft' || step !== 4) return;
    const pct = panel.querySelector('.mk-stir-pct');
    const fill = panel.querySelector('#mkStirFill');
    if (pct) pct.textContent = Math.round(stir * 100) + '%';
    if (fill) fill.style.width = (stir * 100) + '%';
    if (stir >= 1) setStep(5);
  }

  /* ====== 工具条事件(play) ====== */
  const onToolsClick = e => {
    const chip = e.target.closest('.st-chip');
    if (chip) {
      matKey = chip.dataset.mat;
      renderTools();
      bubbles = [];
      foam = (matKey === 'foam') ? 0.35 : 0;   // v46: 换泥重置发泡度(起泡胶给一点初始蓬松)
      overflowed = false;
      refreshDecor();
      if (phase === 'playing') makeSoft(false);
      toast('换成了「' + SLIME_MATS[matKey].name + '」');
      return;
    }
    const dot = e.target.closest('.st-dotc');
    if (dot) {
      color = dot.dataset.color;
      renderTools();
      return;
    }
    if (e.target.closest('.st-make')) backToCraft();
  };
  tools.addEventListener('click', onToolsClick);

  /* ====== 交互 ====== */
  const ptr = { active: false, x: -999, y: -999 };

  const onDown = e => {
    const p = canvasPos(cv, e, W, H);
    ptr.active = true; ptr.x = p.x; ptr.y = p.y;
    if (mode === 'craft') {
      if (step === 4 && e.target === cv) {
        lastPtrAng = Math.atan2(p.y - BOWL.y, p.x - BOWL.x);
      }
      return;
    }
    if (e.target !== cv) return;
    // v36.8: 第一人称俯视 - 罐内任意位置点一下开盖(不再要求点在罐子矩形上)
    if (phase === 'closed') {
      phase = 'opening';
      status.textContent = '提出来, 随便玩';
      return;
    }
    if (phase !== 'playing' || !soft) return;
    let best = -1, bd = 1e9;
    soft.pts.forEach((pt, i) => {
      const d = Math.hypot(pt.x - p.x, pt.y - p.y);
      if (d < bd) { bd = d; best = i; }
    });
    if (best >= 0 && bd < 150) {
      grabIdx = best;
      const m = SLIME_MATS[matKey];
      // v566: 起泡胶音效改回和其他泥一致(按下即捏挤声)
      playSfx(m.sfx, { volume: 0.85 });
      if (m.glass) playSfx('game.slimeGlass', { volume: 0.9 });
      if (m.butter) playSfx('game.slimeButter', { volume: 0.8 });
    }
  };

  const onMove = e => {
    if (!ptr.active) return;
    const p = canvasPos(cv, e, W, H);
    if (mode === 'craft') {
      if (step !== 4) { ptr.x = p.x; ptr.y = p.y; return; }
      const ang = Math.atan2(p.y - BOWL.y, p.x - BOWL.x);
      if (lastPtrAng != null) {
        let d = ang - lastPtrAng;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        stirRingT += d;
        if (Math.abs(stirRingT) >= Math.PI * 2) {
          stir = Math.min(1, stir + 0.6);
          stirRingT -= Math.sign(stirRingT) * Math.PI * 2;
        }
        if (Math.abs(d) > 0.1 && Math.abs(d) < 2) {
          stir = Math.min(1, stir + Math.abs(d) / (Math.PI * 4));
          const now = performance.now();
          if (now - lastStirSfx > 340) { playSfx('game.slimeStir', { volume: 0.55 }); lastStirSfx = now; }
        }
      }
      lastPtrAng = ang;
      updStirPanel();
      ptr.x = p.x; ptr.y = p.y;
      return;
    }
    // —— play 模式 —— //
    if (grabIdx >= 0 && soft) {
      const g = soft.pts[grabIdx];
      g.x = p.x; g.y = p.y;
      g.px = p.x - (p.x - g.px) * 0.4;
      g.py = p.y - (p.y - g.py) * 0.4;
    }
    const m = SLIME_MATS[matKey];
    if (soft && phase === 'playing') {
      const c = soft.center();
      const moved = Math.hypot(p.x - ptr.x, p.y - ptr.y);
      const inside = Math.hypot(ptr.x - c.x, ptr.y - c.y) < soft.avgR() * 1.25;
      // 起泡胶: 拉得越多 泡得越大(揉捏裹气, 体积持续膨胀) v555: 去掉拉伸吱吱声
      if (m.foam && inside) {
        foamDist += moved;
        if (foamDist > 30) {
          foamDist = 0;
          bubbles.push({ dx: ptr.x - c.x, dy: ptr.y - c.y, r: 3 + Math.random() * 6.5, age: 0, dur: 1.6 + Math.random() * 1.6 });
          foam = Math.min(5.5, foam + 0.16);   // v46: 上限提到 5.5 → 最终溢出罐子
        }
      }
      // 液态玻璃: 指尖快速划动时的连续噼啪 + 揉捏发白累计(v568 越揉越白)
      if (m.glass && inside) {
        stretchDist += moved;
        glassKnead += moved;
        if (stretchDist > 85) {
          stretchDist = 0;
          playSfx('game.slimeGlass', { volume: 0.7 });
        }
      }
      // 脆皮冰山泥: 拖动咔嚓声(v36.8: 改用 game.ice 替代 game.crunch, 更有"炸"感)
      if (m.ice && grabIdx >= 0) {
        const now = performance.now();
        if (now - lastMatSfx > 240) { playSfx('game.slimeIce', { volume: 0.6 }); lastMatSfx = now; }
      }
      // v36.8: 棉花泥 - 拖动触发密集 ASMR 戳击(11/秒频谱特征)
      if (m.cotton && inside) {
        stretchDist += moved;
        if (stretchDist > 22) {
          stretchDist = 0;
          playSfx('game.slimeCotton', { volume: 0.7 });
        }
      }
    }
    ptr.x = p.x; ptr.y = p.y;
  };

  const onUp = () => {
    if (mode === 'play' && grabIdx >= 0 && soft) {
      const g = soft.pts[grabIdx];
      const cc = soft.center();
      if (Math.hypot(g.x - cc.x, g.y - cc.y) > soft.ringRest * 1.2) {
        releaseFx = { x: g.x, y: g.y, t: 0 };
      }
      // v566: 起泡胶松手音效也和其他泥一致
      playSfx(SLIME_MATS[matKey].sfx, { volume: 0.9 });
    }
    ptr.active = false; grabIdx = -1; lastPtrAng = null;
  };
  stage.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  /* ====== play 渲染: 俯视圆罐(第一人称) ====== */
  function drawJar() {
    const { cx, cy, R, wall } = JAR;
    // 外环投影(罐子压出的影子)
    ctx.beginPath();
    ctx.ellipse(cx, cy + 5, R + 3, R + 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(70,90,105,0.16)';
    ctx.fill();
    // 罐壁(半透塑料环)
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(236,243,248,0.6)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 2.4;
    ctx.stroke();
    // 6 个卡口凸起(罐口螺纹, 均匀分布)
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.26;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (R - 5), cy + Math.sin(a) * (R - 5));
      ctx.lineTo(cx + Math.cos(a) * (R - 15), cy + Math.sin(a) * (R - 15));
      ctx.stroke();
    }
    // 内底(径向渐变, 中心亮)
    const g = ctx.createRadialGradient(cx, cy, R * 0.12, cx, cy, R - wall);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.75, 'rgba(255,255,255,0.16)');
    g.addColorStop(1, 'rgba(150,175,190,0.32)');
    ctx.beginPath();
    ctx.ellipse(cx, cy, R - wall, R - wall, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    // 左上白色反光带
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, R - wall, R - wall, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(cx - R * 0.38, cy - R * 0.42, R * 0.32, R * 0.48, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
    ctx.restore();
  }

  // 内壁暗环(压在泥边缘上, 让泥看起来在罐里)
  function drawJarRim() {
    const { cx, cy, R, wall } = JAR;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R - wall, R - wall, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(120,145,160,0.38)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function drawLid() {
    const { cx, cy, R, wall } = JAR;
    // 开盖动画: 上移 + 缩小 + 旋转 + 淡出
    const lift = -lidT * 90;
    const scale = 1 - lidT * 0.35;
    const rot = lidT * 0.6;
    ctx.save();
    ctx.globalAlpha = 1 - lidT * 0.85;
    ctx.translate(cx, cy + lift);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    // 盖面
    ctx.beginPath();
    ctx.ellipse(0, 0, R - 2, R - 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#C7D9E4';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    // 盖面立体渐变
    const g = ctx.createRadialGradient(-R * 0.25, -R * 0.3, R * 0.08, 0, 0, R);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(120,140,155,0.22)');
    ctx.beginPath();
    ctx.ellipse(0, 0, R - 4, R - 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    // 6 个卡口凹槽(与罐身螺纹咬合)
    ctx.strokeStyle = 'rgba(140,160,175,0.55)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.26;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (R - 7), Math.sin(a) * (R - 7));
      ctx.lineTo(Math.cos(a) * (R - 17), Math.sin(a) * (R - 17));
      ctx.stroke();
    }
    // 中心拉环
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 13, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#AEC5D4';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#94AFC0';
    ctx.fill();
    ctx.restore();
  }

  // 第一人称手指(指腹半透明 + 指尖小点, 越出罐壁不画)
  function drawFingerTip() {
    if (!ptr.active || mode !== 'play' || phase !== 'playing') return;
    const d = Math.hypot(ptr.x - JAR.cx, ptr.y - JAR.cy);
    if (d > JAR.R - 10) return;
    const g = ctx.createRadialGradient(ptr.x, ptr.y, 2, ptr.x, ptr.y, 27);
    g.addColorStop(0, 'rgba(252,216,192,0.52)');
    g.addColorStop(1, 'rgba(242,182,152,0.1)');
    ctx.beginPath();
    ctx.ellipse(ptr.x, ptr.y, 27, 27, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // 指尖
    ctx.beginPath();
    ctx.arc(ptr.x, ptr.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(242,192,172,0.9)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ptr.x, ptr.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(252,222,206,0.95)';
    ctx.fill();
  }

  /* ====== play 渲染: 泥(按真实材质逐个画) ====== */
  function matColor() {
    const m = SLIME_MATS[matKey];
    const [r, g, b] = hexToRgb(color);
    // 黄油泥: 颜色向奶油黄偏移
    if (m.butter) return [r * 0.55 + 236 | 0, g * 0.55 + 214 | 0, b * 0.55 + 150 | 0];
    // 起泡胶: 发泡度越高越白(气泡让颜色发白, v46 随大范围渐进)
    if (m.foam && foam > 0) {
      const w = Math.min(0.68, foam * 0.14);
      return [r + (250 - r) * w | 0, g + (250 - g) * w | 0, b + (248 - b) * w | 0];
    }
    // 液态玻璃: 越揉越白(揉捏让胶体雾化发白, v568)
    if (m.glass && glassKnead > 0) {
      const w = Math.min(0.82, glassKnead * 0.0018);
      return [r + (250 - r) * w | 0, g + (252 - g) * w | 0, b + (250 - b) * w | 0];
    }
    return [r, g, b];
  }

  function drawSlime(time) {
    const m = SLIME_MATS[matKey];
    const c = soft.center();
    const r = Math.max(30, soft.avgR());
    const [cr, cg, cb] = matColor();

    // 罐底投影(v36.8 俯视: 泥在罐底上的柔影)
    const shA = m.glass ? 0.1 : (m.liquid ? 0.12 : (m.butter ? 0.24 : 0.18));
    const sg = ctx.createRadialGradient(c.x, c.y, r * 0.3, c.x, c.y, r * 1.5);
    sg.addColorStop(0, 'rgba(80,105,120,' + shA + ')');
    sg.addColorStop(1, 'rgba(80,105,120,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, r * 1.5, r * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // —— 主体(v570 恢复 v566 卡片水彩四件套; 黄油泥保留旧版奶油质感) —— //
    ctx.save();
    if (m.butter) {
      // 黄油泥: 绵密奶油渐变, 光泽极低(旧版保留)
      blobPath(ctx, soft.pts, soft.n);
      const bgrad = ctx.createLinearGradient(0, c.y - r, 0, c.y + r);
      bgrad.addColorStop(0, 'rgba(' + Math.min(255, cr + 10) + ',' + Math.min(255, cg + 8) + ',' + Math.min(255, cb + 4) + ',0.96)');
      bgrad.addColorStop(1, 'rgba(' + (cr * 0.88 | 0) + ',' + (cg * 0.86 | 0) + ',' + (cb * 0.84 | 0) + ',0.96)');
      ctx.fillStyle = bgrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    } else {
      // v566 卡片同款水彩: 外晕→3段渐变→二层叠染→边缘积色→层叠高光
      blobPath(ctx, soft.pts, soft.n);
      let bodyAlpha = 0.97;
      if (m.glass) bodyAlpha = 0.42 + Math.min(0.5, glassKnead * 0.0011);
      else if (m.liquid) bodyAlpha = 0.62;
      else if (m.ice) bodyAlpha = 0.88;
      const hiC = 'rgb(' + Math.min(255, cr + 48) + ',' + Math.min(255, cg + 48) + ',' + Math.min(255, cb + 48) + ')';
      const loC = 'rgb(' + (cr * 0.6 | 0) + ',' + (cg * 0.6 | 0) + ',' + (cb * 0.6 | 0) + ')';
      const midC = _wcMix(hiC, loC, 0.5);
      // 1) 外晕(放大 9%)
      ctx.save();
      ctx.translate(c.x, c.y); ctx.scale(1.09, 1.09); ctx.translate(-c.x, -c.y);
      blobPath(ctx, soft.pts, soft.n);
      ctx.fillStyle = _wcRgba(hiC, m.glass ? 0.14 : 0.26);
      ctx.fill();
      ctx.restore();
      // 2) 主体: 3 段偏移径向渐变(卡片 gwgbBody 同款)
      blobPath(ctx, soft.pts, soft.n);
      const grad = ctx.createRadialGradient(c.x - r * 0.24, c.y - r * 0.3, r * 0.1, c.x, c.y, r * 1.12);
      grad.addColorStop(0, _wcRgba(hiC, bodyAlpha));
      grad.addColorStop(0.55, _wcRgba(midC, bodyAlpha));
      grad.addColorStop(1, _wcRgba(loC, Math.min(1, bodyAlpha + 0.03)));
      ctx.fillStyle = grad;
      ctx.fill();
      // 3) 二层叠染(缩 7%, 中间色低透明 → 水彩多层感)
      ctx.save();
      ctx.translate(c.x, c.y); ctx.scale(0.93, 0.93); ctx.translate(-c.x, -c.y);
      blobPath(ctx, soft.pts, soft.n);
      ctx.fillStyle = _wcRgba(midC, m.glass ? 0.12 : 0.18);
      ctx.fill();
      ctx.restore();
      // 4) 边缘积色(卡片手绘深色描边)
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = _wcRgba(_wcDarken(loC, 0.34), m.glass ? 0.3 : 0.42);
      blobPath(ctx, soft.pts, soft.n);
      ctx.stroke();
      // 5) 层叠高光 + 散点白点(卡片同款)
      ctx.fillStyle = 'rgba(255,255,255,' + (m.glass ? 0.58 : 0.48) + ')';
      ctx.beginPath(); ctx.ellipse(c.x - r * 0.28, c.y - r * 0.38, r * 0.26, r * 0.12, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.ellipse(c.x + r * 0.14, c.y - r * 0.22, r * 0.13, r * 0.07, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(c.x - r * 0.34, c.y - r * 0.44, r * 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c.x + r * 0.05, c.y - r * 0.5, r * 0.04, 0, Math.PI * 2); ctx.fill();
      // 6) 卡片四角星 sparkle
      wcSparkle(ctx, c.x + r * 0.55, c.y - r * 0.58, 5.5, '#F5D992', 0.7);
      wcSparkle(ctx, c.x - r * 0.62, c.y + r * 0.42, 4, '#F5D992', 0.5);
    }
    ctx.restore();

    // 起泡胶搓出的气泡(浮在表面)
    for (const b of bubbles) {
      const life = 1 - b.age / b.dur;
      ctx.beginPath();
      ctx.arc(c.x + b.dx, c.y + b.dy, b.r * (0.7 + life * 0.3), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 * life) + ')';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,' + (0.16 * life) + ')';
      ctx.fill();
    }

    // —— 内部质感(v41: 顶部柔光 + specks 白点) —— //
    ctx.save();
    blobPath(ctx, soft.pts, soft.n);
    ctx.clip();
    // 顶部柔光(单一小椭圆)
    ctx.beginPath();
    ctx.ellipse(c.x - r * 0.24, c.y - r * 0.36, r * 0.26, r * 0.1, -0.25, 0, Math.PI * 2);
    ctx.fillStyle = m.glass ? 'rgba(255,255,255,0.7)' : (m.liquid ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.28)');
    ctx.fill();
    // 液态玻璃额外一条冷色高光
    if (m.glass) {
      ctx.beginPath();
      ctx.ellipse(c.x + r * 0.18, c.y - r * 0.12, r * 0.06, r * 0.18, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,220,255,0.35)';
      ctx.fill();
    }
    // 假水额外画 1 圈柔波纹
    if (m.liquid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, r * 0.7, r * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 内部颗粒 specks
    for (const s of specks) {
      const sx = c.x + Math.cos(s.ang) * s.rad * r;
      const sy = c.y + Math.sin(s.ang) * s.rad * r;
      ctx.beginPath();
      ctx.arc(sx, sy, s.size * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = s.white ? 'rgba(255,255,255,' + (s.a * 0.55) + ')' : 'rgba(70,95,90,' + s.a * 0.35 + ')';
      ctx.fill();
    }
    ctx.restore();

    // —— 芝士拉丝: 拖拽时从手指到团体拉出渐细黏丝(跟随手指, 松手回弹消失) —— //
    if (grabIdx >= 0 && soft) {
      const g = soft.pts[grabIdx];
      const cc = soft.center();
      const dist = Math.hypot(g.x - cc.x, g.y - cc.y);
      if (dist > soft.ringRest * 1.2) {
        const ang = Math.atan2(g.y - cc.y, g.x - cc.x);
        const edgeX = cc.x + Math.cos(ang) * (r * 0.85);
        const edgeY = cc.y + Math.sin(ang) * (r * 0.85);
        const strCol = 'rgba(' + cr + ',' + cg + ',' + cb + ',';
        // 黏丝: 从手指处粗 → 团体处细, 微微下垂晃动
        const segs = 8;
        ctx.lineCap = 'round';
        for (let i = 0; i < segs; i++) {
          const t0 = i / segs, t1 = (i + 1) / segs;
          const wobA = Math.sin(time * 0.006 + i * 1.4) * 2.6 * t0;
          const wobB = Math.sin(time * 0.006 + i * 1.4 + 0.12) * 2.6 * t1;
          const x0 = edgeX + (g.x - edgeX) * t0 + wobA;
          const y0 = edgeY + (g.y - edgeY) * t0 + 3.2 * t0;
          const x1 = edgeX + (g.x - edgeX) * t1 + wobB;
          const y1 = edgeY + (g.y - edgeY) * t1 + 3.2 * t1;
          ctx.strokeStyle = strCol + (0.6 * (1 - t0 * 0.5)) + ')';
          ctx.lineWidth = Math.max(1.4, 13 * (1 - t0 * 0.84));
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
        // 高光丝(顶部一条白亮线, 更像真黏丝)
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(edgeX, edgeY);
        ctx.quadraticCurveTo((edgeX + g.x) / 2 + Math.sin(time * 0.006) * 4, (edgeY + g.y) / 2 - 7, g.x, g.y);
        ctx.stroke();
        // 丝上小液滴(断丝感)
        for (let k = 0; k < 3; k++) {
          const tk = 0.28 + k * 0.24;
          const dx = edgeX + (g.x - edgeX) * tk + Math.sin(time * 0.006 + k * 2) * 2;
          const dy = edgeY + (g.y - edgeY) * tk + 2;
          ctx.beginPath(); ctx.arc(dx, dy, 3.4 - k * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = strCol + '0.62)';
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.beginPath(); ctx.arc(dx - 0.8, dy - 0.8, 1, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    // —— 松手回缩丝尾(丝快速收回团体的残影) —— //
    if (releaseFx && soft) {
      const cc = soft.center();
      const rt = releaseFx.t / 0.42;
      const rx = releaseFx.x + (cc.x - releaseFx.x) * Math.min(1, rt * 1.6);
      const ry = releaseFx.y + (cc.y - releaseFx.y) * Math.min(1, rt * 1.6);
      const dist = Math.hypot(rx - cc.x, ry - cc.y);
      if (dist > r * 0.3) {
        const ang2 = Math.atan2(ry - cc.y, rx - cc.x);
        const edge2X = cc.x + Math.cos(ang2) * (r * 0.8);
        const edge2Y = cc.y + Math.sin(ang2) * (r * 0.8);
        const fade = 1 - rt;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (0.5 * fade) + ')';
        ctx.lineWidth = Math.max(1.2, 9 * fade);
        ctx.beginPath();
        ctx.moveTo(edge2X, edge2Y);
        ctx.quadraticCurveTo((edge2X + rx) / 2 + Math.sin(time * 0.01) * 3, (edge2Y + ry) / 2 - 5, rx, ry);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.3 * fade) + ')';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(edge2X, edge2Y);
        ctx.quadraticCurveTo((edge2X + rx) / 2 + Math.sin(time * 0.01) * 3, (edge2Y + ry) / 2 - 5, rx, ry);
        ctx.stroke();
      }
    }
  }

  /* ====== craft 渲染 ====== */
  function bowlPath(g) {
    g = g || ctx;
    g.beginPath();
    g.moveTo(BOWL.x - BOWL.rx, BOWL.y);
    g.bezierCurveTo(BOWL.x - BOWL.rx, BOWL.y + BOWL.ry * 1.25, BOWL.x + BOWL.rx, BOWL.y + BOWL.ry * 1.25, BOWL.x + BOWL.rx, BOWL.y);
    g.closePath();
  }

  function liquidColor() {
    const [r, g, b] = hexToRgb(color);
    let mix;
    if (step <= 2) mix = 0.65;
    else if (step === 3) mix = 0.5;
    else mix = Math.max(0, 0.5 - stir * 0.5 - formed * 0.15);
    const mr = r + (245 - r) * mix;
    const mg = g + (245 - g) * mix;
    const mb = b + (248 - b) * mix;
    const dark = formed > 0 ? 1 - formed * 0.25 : 1;
    return [mr * dark | 0, mg * dark | 0, mb * dark | 0];
  }

  function renderCraft(time) {
    // 倒胶水
    if (pouring) {
      pourT = Math.min(1, (performance.now() - pourStart) / 1100);
      if (pourT >= 1) {
        pouring = false;
        renderPanel();
      }
    }
    // 成型滴落
    if (step === 5 && formed < 1) {
      const ft = (performance.now() - formStart) / 1000;
      while (drops.length < 3 && ft >= 0.15 + drops.length * 0.55) {
        drops.push({ x: BOWL.x + (drops.length - 1) * 16 - 8, t0: ft, y: BOWL.y - 170 });
        playSfx('game.slimeFoam', { volume: 0.9 });
      }
      for (const d of drops) {
        const fall = ft - d.t0;
        d.y = BOWL.y - 170 + 280 * fall * fall;
      }
      drops = drops.filter(d => d.y < BOWL.y - 10);
      formed = Math.min(1, ft / 2.1);
      if (formed >= 1 && panel.dataset.done !== '1') {
        panel.dataset.done = '1';
        drops = [];
        renderPanel();
        playSfx('game.slimeFoam');
        enterPlay();
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(170, 150, 120, 0.1)';
    ctx.fillRect(0, 250, W, H - 250);

    // 碗(v568 卡片水彩: 暖白瓷碗 + 外晕 + 积色描边)
    wcShadow(ctx, BOWL.x, BOWL.y + BOWL.ry * 1.2, BOWL.rx * 0.96, 12, 0.16);
    wcWashPath(ctx, bowlPath, BOWL.x, BOWL.y + BOWL.ry * 0.55, BOWL.rx, '#FEFBF4', '#C4B79A', {
      seed: 5, haloA: 0.24, hiA: 0.9, midA: 0.84, loA: 0.92, washA: 0.12, lw: 2.6, edgeA: 0.4, hl: false, dots: false,
    });

    if (pourT > 0.02) {
      const top = BOWL.y + BOWL.ry * 1.05 - pourT * (BOWL.ry * 1.05 + 2);
      const [r, g, b] = liquidColor();
      const wob = formed >= 1 ? Math.sin(time * 0.004) * 2 : 0;
      const grad = ctx.createLinearGradient(0, top, 0, BOWL.y + BOWL.ry * 1.15);
      grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.92)');
      grad.addColorStop(1, 'rgba(' + (r * 0.8 | 0) + ',' + (g * 0.8 | 0) + ',' + (b * 0.8 | 0) + ',0.95)');
      ctx.save();
      bowlPath();
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(BOWL.x - BOWL.rx, top + wob);
      ctx.lineTo(BOWL.x + BOWL.rx, top + wob);
      ctx.lineTo(BOWL.x + BOWL.rx, BOWL.y + BOWL.ry * 1.2);
      ctx.lineTo(BOWL.x - BOWL.rx, BOWL.y + BOWL.ry * 1.2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(BOWL.x, top + wob, BOWL.rx, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
      if (step === 4 && stir > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const rr = (18 + i * 16) * (1 - stir * 0.3);
          ctx.beginPath();
          ctx.arc(BOWL.x, top + 14, rr, stirRingT * (2 - i * 0.4) + i, stirRingT * (2 - i * 0.4) + i + 2.4);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 碗口沿(v568 水彩积色口沿)
    ctx.beginPath();
    ctx.ellipse(BOWL.x, BOWL.y, BOWL.rx, BOWL.rx * 0.19, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(253, 250, 243, 0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(166, 150, 116, 0.55)';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // 胶水瓶(v568 卡片水彩: 暖白瓶身 + 暖卡其瓶盖, 应用户要求不印字)
    if (step === 1) {
      const tilt = pouring ? -0.9 : 0;
      ctx.save();
      ctx.translate(BOWL.x + BOWL.rx + 52, BOWL.y - 96);
      ctx.rotate(tilt);
      // 桌面软影
      wcShadow(ctx, 0, 52, 26, 6, 0.14);
      // 瓶身水彩四件套
      wcWashPath(ctx, g => roundRectPath(g, -17, -52, 34, 100, 9), 0, -2, 52, '#FDF9F0', '#D9C49A', {
        seed: 11, haloA: 0.22, hiA: 0.96, midA: 0.92, loA: 0.97, washA: 0.14, lw: 2.2, edgeA: 0.4,
      });
      // 瓶盖(暖卡其, 水彩小圆角)
      wcWashPath(ctx, g => roundRectPath(g, -8, -66, 16, 16, 4), 0, -58, 10, '#EFE0BC', '#C2A468', {
        seed: 12, haloA: 0, washA: 0.1, lw: 1.6, edgeA: 0.38, dots: false,
      });
      ctx.restore();
      if (pouring) {
        const topY = BOWL.y + BOWL.ry * 1.05 - pourT * (BOWL.ry * 1.05 + 2);
        ctx.beginPath();
        ctx.moveTo(BOWL.x + BOWL.rx + 26, BOWL.y - 110);
        ctx.quadraticCurveTo(BOWL.x + BOWL.rx - 6, BOWL.y - 70, BOWL.x + BOWL.rx - 16, topY);
        ctx.strokeStyle = 'rgba(250,246,236,0.95)';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // 搅拌勺(v568 卡片水彩: 暖木柄积色描边 + 奶色勺头高光)
    if (step === 4 && ptr.active) {
      ctx.save();
      ctx.lineCap = 'round';
      // 勺柄(先深色积色边, 再暖木主色)
      ctx.strokeStyle = 'rgba(120, 88, 50, 0.38)';
      ctx.lineWidth = 6.6;
      ctx.beginPath();
      ctx.moveTo(ptr.x + 26, ptr.y - 46);
      ctx.lineTo(ptr.x, ptr.y);
      ctx.stroke();
      ctx.strokeStyle = '#B08A5E';
      ctx.lineWidth = 4.6;
      ctx.stroke();
      // 勺头
      ctx.beginPath();
      ctx.ellipse(ptr.x, ptr.y, 7, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#E9D9B8';
      ctx.fill();
      ctx.strokeStyle = 'rgba(120, 88, 50, 0.4)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      // 勺头高光
      ctx.beginPath();
      ctx.ellipse(ptr.x - 2, ptr.y - 3, 3, 1.8, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();
      ctx.restore();
    }

    // 成型液滴管(v568 卡片水彩: 积色描边)
    if (step === 5 && formed < 1) {
      ctx.save();
      ctx.translate(BOWL.x, 36);
      roundRectPath(ctx, -5, 0, 10, 54, 5);
      ctx.fillStyle = '#E7F0F4';
      ctx.fill();
      ctx.strokeStyle = 'rgba(120, 140, 152, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-5, 54);
      ctx.lineTo(5, 54);
      ctx.lineTo(0, 66);
      ctx.closePath();
      ctx.fillStyle = '#CBDDE6';
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      for (const d of drops) {
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, 3.4, 5.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(170, 212, 232, 0.9)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(110, 150, 170, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // 成型后果冻坨(装罐前的最后画面, v568 卡片水彩四件套)
    if (formed >= 1 && mode === 'craft') {
      const sq = 1 + Math.sin(time * 0.004) * 0.05;
      const [r, g, b] = hexToRgb(color);
      const hiC = 'rgb(' + Math.min(255, r + 60) + ',' + Math.min(255, g + 60) + ',' + Math.min(255, b + 60) + ')';
      const loC = 'rgb(' + (r * 0.62 | 0) + ',' + (g * 0.62 | 0) + ',' + (b * 0.62 | 0) + ')';
      ctx.save();
      ctx.translate(BOWL.x, BOWL.y + 26);
      ctx.scale(1 / sq, sq);
      wcWashPath(ctx, gg => { gg.beginPath(); gg.ellipse(0, 0, BOWL.rx * 0.62, 34, 0, 0, Math.PI * 2); }, 0, 0, 34, hiC, loC, {
        seed: 21, haloA: 0.26, hiA: 0.94, midA: 0.9, loA: 0.96, washA: 0.16, lw: 2.4, edgeA: 0.42,
      });
      ctx.restore();
    }

    // 卡片纸纹(v568 全步骤统一手绘底纹)
    wcPaper(ctx, 0, 0, W, H);
  }

  /* ====== play 渲染(第一人称俯视) ====== */
  function renderPlay(time) {
    ctx.clearRect(0, 0, W, H);
    // v36.8: 俯视桌面背景(浅暖木色渐变)
    const bg = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.62);
    bg.addColorStop(0, 'rgba(252,248,240,0.9)');
    bg.addColorStop(1, 'rgba(236,226,212,0.55)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawJar();
    if (soft && (phase === 'playing' || phase === 'opening')) drawSlime(time);
    drawJarRim();                        // 内壁压边, 泥看起来在罐里
    if (phase !== 'playing') drawLid();
    drawFingerTip();                     // 第一人称手指(开盖后才有)
  }

  /* ====== 主循环 ====== */
  function loop(time) {
    const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
    lastTime = time;
    lastT = time;

    if (mode === 'craft') {
      renderCraft(time);
      updStirPanel();
    } else {
      if (phase === 'opening') {
        lidT = Math.min(1, lidT + dt / 0.55);
        if (lidT >= 1) { phase = 'playing'; makeSoft(true); }
      }
      if (soft && phase === 'playing') {
        soft.step();
        const m = SLIME_MATS[matKey];
        // 起泡胶物理(v46): 结构性放大(弹簧基准长 × 发泡系数) + 轻微外推蓬松感
        if (m.foam && foam > 0) {
          soft.setScale(1 + foam * 0.55);      // foam=5.5 → 半径约 4 倍, 溢出罐子
          const c = soft.center();
          for (let i = 0; i < soft.n; i++) {
            const p = soft.pts[i];
            const dx = p.x - c.x, dy = p.y - c.y;
            const d = Math.hypot(dx, dy) || 1;
            const push = foam * 0.18;
            p.x += dx / d * push;
            p.y += dy / d * push;
          }
          // 静置缓慢回缩(气泡慢慢消散, 泡越大消得稍快)
          foam = Math.max(0, foam - dt * (0.004 + foam * 0.003));
          // v46: 溢出罐子的一次性庆祝
          if (!overflowed && soft.avgR() > JAR.R + 14) {
            overflowed = true;
            toast('起泡胶越揉越大, 溢出罐子啦 ✦');
          }
        } else if (!m.foam) {
          soft.setScale(1);                    // 非起泡胶恢复原尺寸
        }
        for (const b of bubbles) b.age += dt;
        const popped = bubbles.filter(b => b.age >= b.dur);
        // v566: 气泡破裂音改成和其他泥一致的捏挤声(用户钦定: 起泡胶声音和其他泥一样)
        if (popped.length) playSfx('game.slimeFoam', { volume: 0.5 });
        bubbles = bubbles.filter(b => b.age < b.dur);
      }
      if (releaseFx) {
        releaseFx.t += dt;
        if (releaseFx.t > 0.42) releaseFx = null;
      }
      renderPlay(time);
    }
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(loop);
  }
  loop(0);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      tools.removeEventListener('click', onToolsClick);
    }
  };
}


/* ---------- 游戏 3: 泡泡纸 ---------- */
/* ---------- 游戏 3: 泡泡纸(透明玻璃泡, 多环高光+内阴影, 捏爆有细碎玻璃屑) ---------- */
function buildBubbleWrap(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const TOTAL = 96;
  const COLS = 12, ROWS = 8;
  const CELL = { w: 44, h: 40 };
  const OX = (GAME_W - COLS * CELL.w) / 2 + CELL.w / 2;
  const OY = 26 + CELL.h / 2;
  const bubbles = [];
  const rings = [];      // 爆开涟漪
  const shards = [];     // 玻璃碎屑
  for (let i = 0; i < TOTAL; i++) {
    const r = Math.floor(i / COLS), c = i % COLS;
    bubbles.push({
      x: OX + c * CELL.w, y: OY + r * CELL.h,
      r: 15 * (0.92 + Math.random() * 0.12),
      popped: false,
      ph: Math.random() * Math.PI * 2,
    });
  }
  let popped = 0;
  let pressing = false;
  let raf = 0;

  const wrap = document.createElement('div');
  wrap.className = 'bw-wrap';
  wrap.innerHTML =
    '<div class="bw-bar"><span class="bw-count">已捏爆 <b>0</b> / ' + TOTAL + '</span>' +
    '<button class="btn btn-solid small bw-again" type="button">再来一张 🎉</button></div>';
  stage.appendChild(wrap);
  const countEl = wrap.querySelector('.bw-count b');
  const againBtn = wrap.querySelector('.bw-again');

  function popAt(b) {
    if (!b || b.popped) return;
    b.popped = true;
    popped++;
    countEl.textContent = String(popped);
    rings.push({ x: b.x, y: b.y, r: b.r, life: 1 });
    // 玻璃碎屑(细碎闪光)
    for (let k = 0; k < 9; k++) {
      const a = Math.random() * Math.PI * 2;
      shards.push({ x: b.x, y: b.y, vx: Math.cos(a) * (0.6 + Math.random() * 2.4), vy: Math.sin(a) * (0.6 + Math.random() * 2.4) - 0.8, life: 1, s: 0.8 + Math.random() * 1.6, ph: Math.random() * Math.PI * 2 });
    }
    playSfx('game.bubbleWrap');
    if (popped >= TOTAL) {
      wrap.classList.add('done');
      requestAnimationFrame(() => againBtn.classList.add('shown'));
      toast('这一张捏完啦, 手感不错吧 🎉');
    }
  }

  function hitBubble(x, y) {
    for (const b of bubbles) {
      if (!b.popped && Math.hypot(x - b.x, y - b.y) < b.r + 3) popAt(b);
    }
  }

  const onDown = e => {
    pressing = true;
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    hitBubble(p.x, p.y);
  };
  const onMove = e => {
    if (!pressing) return;
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    hitBubble(p.x, p.y);
  };
  const onUp = () => { pressing = false; };

  function resetGrid() {
    bubbles.forEach(b => { b.popped = false; });
    popped = 0;
    countEl.textContent = '0';
    rings.length = 0;
    shards.length = 0;
    wrap.classList.remove('done');
    againBtn.classList.remove('shown');
  }

  stage.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  againBtn.addEventListener('click', resetGrid);

  function drawBubble(b, time) {
    ctx.save();
    ctx.translate(b.x, b.y);
    // v565 外晕(卡片同款)
    wcCirclePath(ctx, 0, 0, b.r * 1.16, b.r * 1.16, (b.x * 0.13 + b.y * 0.17) | 0, 1.2);
    ctx.fillStyle = 'rgba(180, 215, 240, 0.22)';
    ctx.fill();
    // 玻璃泡: 几乎透明, 靠边缘折射和高光显形
    const g = ctx.createRadialGradient(-b.r * 0.35, -b.r * 0.4, b.r * 0.1, 0, 0, b.r);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.55, 'rgba(215,235,250,0.16)');
    g.addColorStop(0.85, 'rgba(180,215,240,0.28)');
    g.addColorStop(1, 'rgba(150,190,225,0.55)');
    ctx.fillStyle = g;
    wcCirclePath(ctx, 0, 0, b.r, b.r, (b.x * 0.13 + b.y * 0.17) | 0, 1.0);
    ctx.fill();
    // 下缘内阴影(玻璃折射的暗弧)
    ctx.strokeStyle = 'rgba(120,155,190,0.4)';
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(0, 0, b.r * 0.86, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    // 边缘亮环
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    wcCirclePath(ctx, 0, 0, b.r - 0.6, b.r - 0.6, (b.x * 0.13 + b.y * 0.17) | 0, 1.0);
    ctx.stroke();
    // 主高光(小椭圆 + 次高光点)
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath(); ctx.ellipse(-b.r * 0.38, -b.r * 0.42, b.r * 0.28, b.r * 0.16, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(b.r * 0.3, -b.r * 0.28, b.r * 0.08, 0, Math.PI * 2); ctx.fill();
    // 环境反光(右下小弧)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(b.r * 0.45, b.r * 0.45, b.r * 0.3, Math.PI * 0.15, Math.PI * 0.75); ctx.stroke();
    // 一点点呼吸闪烁
    const tw = 0.5 + 0.5 * Math.sin(time / 900 + b.ph);
    ctx.fillStyle = 'rgba(255,255,255,' + (0.05 + 0.05 * tw) + ')';
    ctx.beginPath(); ctx.arc(0, 0, b.r - 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // v564 边缘积色描边(手绘水彩)
    ctx.lineWidth = 1.4; ctx.strokeStyle = _wcRgba('#6E84B8', 0.32);
    wcCirclePath(ctx, b.x, b.y, b.r, b.r, (b.x * 0.13 + b.y * 0.17) | 0, 1.0);
    ctx.stroke();
  }

  function drawPopped(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    // 瘪掉的塑料膜: 内凹暗影 + 一圈亮边
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, b.r);
    g.addColorStop(0, 'rgba(200,214,226,0.5)');
    g.addColorStop(0.75, 'rgba(178,196,212,0.32)');
    g.addColorStop(1, 'rgba(150,172,194,0.2)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, b.r * 0.92, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, b.r * 0.92, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function render(time) {
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    // 柔和的桌面背景(让透明玻璃泡有内容可透)
    const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
    bg.addColorStop(0, 'rgba(233, 240, 248, 0.9)');
    bg.addColorStop(1, 'rgba(220, 231, 244, 0.9)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    // 淡淡彩色光斑(透过玻璃会折射)
    for (let i = 0; i < 7; i++) {
      const bx = (i * 131 + 40) % GAME_W, by = (i * 97 + 30) % GAME_H;
      const rg = ctx.createRadialGradient(bx, by, 2, bx, by, 70);
      const cols = ['rgba(255,200,215,0.25)', 'rgba(200,225,255,0.28)', 'rgba(220,255,215,0.22)', 'rgba(255,235,180,0.22)'];
      rg.addColorStop(0, cols[i % 4]);
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(bx - 70, by - 70, 140, 140);
    }
    // 泡
    for (const b of bubbles) {
      if (b.popped) drawPopped(b);
      else drawBubble(b, time);
    }
    // 碎屑
    for (let i = shards.length - 1; i >= 0; i--) {
      const s = shards[i];
      s.x += s.vx; s.y += s.vy; s.vy += 0.12; s.life -= 0.02;
      if (s.life <= 0) { shards.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 1;
      const a = s.ph + time / 300;
      ctx.beginPath();
      ctx.moveTo(s.x - Math.cos(a) * s.s, s.y - Math.sin(a) * s.s);
      ctx.lineTo(s.x + Math.cos(a) * s.s, s.y + Math.sin(a) * s.s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // 爆开涟漪
    for (let i = rings.length - 1; i >= 0; i--) {
      const rg = rings[i];
      rg.life -= 0.035; rg.r += 1.6;
      if (rg.life <= 0) { rings.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(255,255,255,' + (rg.life * 0.7) + ')';
      ctx.lineWidth = 1.5 * rg.life + 0.4;
      ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2); ctx.stroke();
    }
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(render);
  }
  render(performance.now());

  return {
    destroy() {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      againBtn.removeEventListener('click', resetGrid);
    }
  };
}


/* ---------- 游戏 4: 切肥皂(半透明甘油皂, 湿润切面, 黏连拉丝) ---------- */
function hexA(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

function buildSoap(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const SX = 108, SY = 80, SW = 344, SH = 148;
  const TRAY = { x: 64, y: 286, w: 432, h: 94 };
  const FLOOR = TRAY.y + TRAY.h - 5;
  /* v46: 自由切割 —— 不再固定一条一条, 任意方向下刀, 能切出形状
     原理: 皂体画到离屏画布 soapImg, 用 4px 网格掩码 mask 记录皂体存留;
     刀划过的地方按线段挖掉掩码, 每次挖完做连通域分析(flood fill),
     与主块断开的连通块变成掉落片(小于阈值变碎屑), 圈个圈就能把圈里的形状切下来 */
  const CELL = 4;
  const GW = Math.floor(SW / CELL), GH = Math.floor(SH / CELL);
  const CUT_R = 3;               // 刀缝半宽
  /* 半透明甘油皂色调: 清透糖果感 */
  const PALETTES = [
    ['#F9D8E6', '#DE93B2'],
    ['#D8EDF5', '#85B6D4'],
    ['#FBF0CF', '#DFC16E'],
    ['#E5DCF9', '#A38BDF'],
    ['#DEF3E0', '#87BE93'],
  ];
  let palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  let mask = new Uint8Array(GW * GH);
  let pieces = [];               // 切下来掉进托盘的片(离屏截图 + 物理)
  let crumbs = [];               // 碎屑
  let wisps = [];                // 切开瞬间的黏连拉丝
  let cutSegs = [];              // 刀缝(画切痕阴影)
  let embeds = [];               // 内嵌小装饰(切走的片会自动带走)
  let raf = 0;
  let down = false;
  let lastRub = 0;
  let lastLoopT = performance.now();    // v46: 物理 dt 用于解决 headless rAF 节流

  const soapImg = document.createElement('canvas');
  soapImg.width = SW; soapImg.height = SH;
  const sctx = soapImg.getContext('2d');
  const soapView = document.createElement('canvas');
  soapView.width = SW; soapView.height = SH;
  const vctx = soapView.getContext('2d');

  function rollEmbeds() {
    embeds = [];
    const n = 10 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      embeds.push({
        kind: Math.random() < 0.55 ? 'star' : 'flower',
        x: 30 + Math.random() * (SW - 60),
        y: 26 + Math.random() * (SH - 52),
        s: 5 + Math.random() * 3.2,
        rot: Math.random() * Math.PI,
      });
    }
  }

  function initMask() {
    mask.fill(1);
    // 圆角外的格子去掉(保持圆角皂体轮廓) v566: 圆角 14→52 更圆润
    const r = 52;
    for (let gy = 0; gy < GH; gy++) {
      for (let gx = 0; gx < GW; gx++) {
        const x = gx * CELL + CELL / 2, y = gy * CELL + CELL / 2;
        const cx = Math.max(r, Math.min(SW - r, x));
        const cy = Math.max(r, Math.min(SH - r, y));
        if ((x - cx) * (x - cx) + (y - cy) * (y - cy) > r * r) mask[gy * GW + gx] = 0;
      }
    }
  }

  function drawEmbedTo(c2, cx, cy, e) {
    c2.save();
    c2.translate(cx, cy);
    c2.rotate(e.rot);
    // v570 常驻柔光底(浅色皂体上花纹也亮闪闪, 不被吃)
    const halo = c2.createRadialGradient(0, 0, 0, 0, 0, e.s * 1.9);
    halo.addColorStop(0, e.kind === 'star' ? 'rgba(255,238,180,0.55)' : 'rgba(255,222,238,0.5)');
    halo.addColorStop(1, 'rgba(255,255,255,0)');
    c2.fillStyle = halo;
    c2.beginPath();
    c2.arc(0, 0, e.s * 1.9, 0, Math.PI * 2);
    c2.fill();
    c2.globalAlpha = 0.92;
    if (e.kind === 'star') {
      // v570 亮闪闪: 金色径向渐变 + 白芯, 去深描边
      const sg = c2.createRadialGradient(0, 0, 0, 0, 0, e.s);
      sg.addColorStop(0, '#FFFDF4');
      sg.addColorStop(0.45, '#FFEBB0');
      sg.addColorStop(1, '#F3C25E');
      c2.fillStyle = sg;
      c2.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 === 0 ? e.s : e.s * 0.44;
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
        if (i === 0) c2.moveTo(px, py); else c2.lineTo(px, py);
      }
      c2.closePath();
      c2.fill();
      c2.fillStyle = 'rgba(255,255,255,0.95)';
      c2.beginPath();
      c2.arc(0, 0, e.s * 0.22, 0, Math.PI * 2);
      c2.fill();
    } else {
      // 花瓣提亮 + 白芯, 去深描边
      c2.fillStyle = '#FFF1F6';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        c2.beginPath();
        c2.arc(Math.cos(a) * e.s * 0.55, Math.sin(a) * e.s * 0.55, e.s * 0.42, 0, Math.PI * 2);
        c2.fill();
      }
      const fg = c2.createRadialGradient(0, -e.s * 0.1, 0, 0, 0, e.s * 0.32);
      fg.addColorStop(0, '#FFF6C8');
      fg.addColorStop(1, '#F7C94E');
      c2.fillStyle = fg;
      c2.beginPath();
      c2.arc(0, 0, e.s * 0.3, 0, Math.PI * 2);
      c2.fill();
      c2.fillStyle = 'rgba(255,255,255,0.9)';
      c2.beginPath();
      c2.arc(-e.s * 0.08, -e.s * 0.1, e.s * 0.1, 0, Math.PI * 2);
      c2.fill();
    }
    c2.restore();
  }

  function paintSoapImg() {
    sctx.clearRect(0, 0, SW, SH);
    // 1. 衬底: 透过皂体隐约看到的暗色(透光感) v566: 圆角同步 52
    sctx.fillStyle = 'rgba(70, 48, 60, 0.2)';
    roundRectPath(sctx, 0, 0, SW, SH, 52);
    sctx.fill();
    // 2. 半透明主体(v570: 更透 — 降主体 alpha, 透过皂体能看到衬底; 无描边, 靠渐变+高光塑形)
    const sg2 = sctx.createRadialGradient(SW * 0.34, SH * 0.28, 8, SW * 0.5, SH * 0.5, SW * 0.72);
    sg2.addColorStop(0, hexA(palette[0], 0.52));
    sg2.addColorStop(0.55, _wcRgba(_wcMix(palette[0], palette[1], 0.5), 0.58));
    sg2.addColorStop(1, hexA(palette[1], 0.66));
    sctx.fillStyle = sg2;
    wcRoundRect(sctx, 0, 0, SW, SH, 52, 5, 0.3);
    sctx.fill();
    // 二层叠染(中间更润)
    sctx.fillStyle = _wcRgba(_wcMix(palette[0], palette[1], 0.3), 0.18);
    wcRoundRect(sctx, SW * 0.07, SH * 0.09, SW * 0.86, SH * 0.84, 40, 9, 0.35);
    sctx.fill();
    // 3. 玻璃感高光: 左上大柔光晕
    const hg = sctx.createRadialGradient(SW * 0.3, SH * 0.16, 4, SW * 0.3, SH * 0.16, SW * 0.52);
    hg.addColorStop(0, 'rgba(255,255,255,0.5)');
    hg.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = hg;
    wcRoundRect(sctx, 0, 0, SW, SH, 52, 5, 0.3);
    sctx.fill();
    // 斜向亮带(切在皂体内)
    sctx.save();
    wcRoundRect(sctx, 0, 0, SW, SH, 52, 5, 0.3);
    sctx.clip();
    sctx.globalAlpha = 0.3;
    sctx.fillStyle = '#FFFFFF';
    sctx.beginPath();
    sctx.moveTo(SW * 0.18, SH);
    sctx.lineTo(SW * 0.36, 0);
    sctx.lineTo(SW * 0.48, 0);
    sctx.lineTo(SW * 0.3, SH);
    sctx.closePath();
    sctx.fill();
    sctx.restore();
    // 4. 底部透光边缘
    const bo = sctx.createLinearGradient(0, SH - 12, 0, SH);
    bo.addColorStop(0, 'rgba(255,255,255,0)');
    bo.addColorStop(1, 'rgba(255,255,255,0.4)');
    sctx.fillStyle = bo;
    sctx.fillRect(0, SH - 12, SW, 12);
    // 5. 顶部高光边 + 镜面高光点
    sctx.strokeStyle = 'rgba(255,255,255,0.85)';
    sctx.lineWidth = 4;
    sctx.lineCap = 'round';
    sctx.beginPath();
    sctx.moveTo(10, 9);
    sctx.lineTo(SW - 10, 9);
    sctx.stroke();
    sctx.fillStyle = 'rgba(255,255,255,0.92)';
    sctx.beginPath(); sctx.arc(SW * 0.24, SH * 0.2, 3.4, 0, Math.PI * 2); sctx.fill();
    sctx.beginPath(); sctx.arc(SW * 0.33, SH * 0.14, 2, 0, Math.PI * 2); sctx.fill();
    // 5. 内嵌装饰(悬浮在半透明皂体里, 切走的片自动带走)
    for (const e of embeds) drawEmbedTo(sctx, e.x, e.y, e);
    // 6. 阳刻文字(v570 艺术字: Cormorant 斜体 + 香槟金渐变 + 手动字距 + 白浮雕底)
    const word = 'AROMA';
    const lsp = 7;
    sctx.save();
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.font = 'italic 600 31px "Cormorant Garamond", Georgia, serif';
    const ws = [];
    let total = 0;
    for (const ch of word) { const w = sctx.measureText(ch).width; ws.push(w); total += w + lsp; }
    total -= lsp;
    // 白浮雕底(向下偏移, 金字从皂体里浮起来)
    sctx.fillStyle = 'rgba(255,255,255,0.5)';
    let cx0 = SW / 2 - total / 2;
    for (let i = 0; i < word.length; i++) { sctx.fillText(word[i], cx0 + ws[i] / 2, SH / 2 - 2 + 1.8); cx0 += ws[i] + lsp; }
    // 香槟金渐变主体
    const tg = sctx.createLinearGradient(0, SH / 2 - 22, 0, SH / 2 + 16);
    tg.addColorStop(0, '#FFF8E1');
    tg.addColorStop(0.48, '#EBCC8E');
    tg.addColorStop(0.55, '#C79A55');
    tg.addColorStop(1, '#B9874A');
    sctx.fillStyle = tg;
    cx0 = SW / 2 - total / 2;
    for (let i = 0; i < word.length; i++) { sctx.fillText(word[i], cx0 + ws[i] / 2, SH / 2 - 2); cx0 += ws[i] + lsp; }
    // 副标题(楷体拉开字距, 金褐色)
    sctx.font = '11px "LXGW WenKai", "Kaiti SC", "楷体", serif';
    sctx.fillStyle = 'rgba(150, 110, 70, 0.72)';
    sctx.fillText('·  音  乐  香  皂  ·', SW / 2, SH / 2 + 26);
    sctx.restore();
  }

  function rebuildView() {
    // v46: 直接用细方块逐 cell 拼出掩码后的视图(避免 destination-in 在某些环境失效)
    vctx.clearRect(0, 0, SW, SH);
    vctx.globalCompositeOperation = 'source-over';
    // 先把整块画上去, 再用 fillStyle 半透明盖掉已切掉的格子(扣出缝隙)
    vctx.drawImage(soapImg, 0, 0);
    // 覆盖被切掉的格子(用全透明黑)
    vctx.save();
    for (let gy = 0; gy < GH; gy++) {
      for (let gx = 0; gx < GW; gx++) {
        if (!mask[gy * GW + gx]) vctx.clearRect(gx * CELL, gy * CELL, CELL + 0.5, CELL + 0.5);
      }
    }
    vctx.restore();
  }

  const status = document.createElement('span');
  status.className = 'game-status';
  stage.appendChild(status);

  const hint = document.createElement('span');
  hint.className = 'soap-hint';
  hint.textContent = '按住刀随便划, 任意方向都能切, 圈个形状也能切下来';
  stage.appendChild(hint);

  const againBtn = document.createElement('button');
  againBtn.type = 'button';
  againBtn.className = 'btn btn-solid small soap-again';
  againBtn.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);display:none;';
  againBtn.textContent = '再切一块 🎉';
  stage.appendChild(againBtn);

  const knife = { x: 210, y: 44, tx: 210, ty: 44, vx: 0, ang: 0, tAng: 0 };

  function updateStatus() {
    let left = 0;
    for (let i = 0; i < mask.length; i++) left += mask[i];
    const pct = Math.round((left / (GW * GH)) * 100);
    status.textContent = pct > 3 ? ('还剩 ' + pct + '%') : '这一块切完啦';
    if (pct <= 3 && againBtn.style.display === 'none') {
      againBtn.style.display = 'inline-flex';
      toast('切完一整块, 神清气爽 🎉');
    }
  }

  function reset() {
    palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    rollEmbeds();
    initMask();
    pieces = [];
    crumbs = [];
    wisps = [];
    cutSegs = [];
    paintSoapImg();
    rebuildView();
    againBtn.style.display = 'none';
    updateStatus();
  }
  againBtn.addEventListener('click', reset);

  // ---------- 切割: 沿线段挖掩码 ----------
  function carve(x0, y0, x1, y1) {
    // 局部坐标
    const lx0 = x0 - SX, ly0 = y0 - SY, lx1 = x1 - SX, ly1 = y1 - SY;
    const len = Math.hypot(lx1 - lx0, ly1 - ly0);
    const steps = Math.max(1, Math.ceil(len / (CELL * 0.5)));
    let removed = 0;
    for (let s = 0; s <= steps; s++) {
      const px = lx0 + (lx1 - lx0) * s / steps;
      const py = ly0 + (ly1 - ly0) * s / steps;
      const gx0 = Math.max(0, Math.floor((px - CUT_R) / CELL));
      const gx1 = Math.min(GW - 1, Math.floor((px + CUT_R) / CELL));
      const gy0 = Math.max(0, Math.floor((py - CUT_R) / CELL));
      const gy1 = Math.min(GH - 1, Math.floor((py + CUT_R) / CELL));
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          const cx = gx * CELL + CELL / 2, cy = gy * CELL + CELL / 2;
          const ddx = cx - px, ddy = cy - py;
          if (ddx * ddx + ddy * ddy <= CUT_R * CUT_R) {
            const idx = gy * GW + gx;
            if (mask[idx]) { mask[idx] = 0; removed++; }
          }
        }
      }
    }
    if (removed > 0) {
      cutSegs.push({ x0: x0, y0: y0, x1: x1, y1: y1 });
      if (cutSegs.length > 400) cutSegs.shift();
    }
    return removed;
  }

  // ---------- 连通域分离: 断开的块掉落 ----------
  function separate() {
    const labels = new Int32Array(GW * GH);
    const comps = [];
    let next = 1;
    for (let i = 0; i < GW * GH; i++) {
      if (!mask[i] || labels[i]) continue;
      const stack = [i];
      labels[i] = next;
      const cells = [];
      while (stack.length) {
        const c = stack.pop();
        cells.push(c);
        const cx = c % GW, cy = (c / GW) | 0;
        if (cx + 1 < GW) { const j = c + 1; if (mask[j] && !labels[j]) { labels[j] = next; stack.push(j); } }
        if (cx > 0) { const j = c - 1; if (mask[j] && !labels[j]) { labels[j] = next; stack.push(j); } }
        if (cy + 1 < GH) { const j = c + GW; if (mask[j] && !labels[j]) { labels[j] = next; stack.push(j); } }
        if (cy > 0) { const j = c - GW; if (mask[j] && !labels[j]) { labels[j] = next; stack.push(j); } }
      }
      comps.push(cells);
      next++;
    }
    if (comps.length < 2) return;
    comps.sort((a, b) => b.length - a.length);   // 最大的留下
    let detached = 0;
    for (let k = 1; k < comps.length; k++) {
      const cells = comps[k];
      let bx0 = GW, by0 = GH, bx1 = -1, by1 = -1;
      for (const c of cells) {
        const cx = c % GW, cy = (c / GW) | 0;
        if (cx < bx0) bx0 = cx;
        if (cx > bx1) bx1 = cx;
        if (cy < by0) by0 = cy;
        if (cy > by1) by1 = cy;
      }
      const wpx = (bx1 - bx0 + 1) * CELL, hpx = (by1 - by0 + 1) * CELL;
      for (const c of cells) mask[c] = 0;
      if (cells.length < 10 || wpx < 7 || hpx < 7) {
        // 细屑: 不生成片, 撒几点碎屑
        for (let i = 0; i < 3; i++) {
          crumbs.push({
            x: SX + (bx0 + Math.random() * (bx1 - bx0 + 1)) * CELL,
            y: SY + (by0 + Math.random() * (by1 - by0 + 1)) * CELL,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -Math.random() * 0.6,
            life: 1,
            r: 0.8 + Math.random() * 1.2,
          });
        }
        continue;
      }
      // 生成掉落片: 皂体图按连通块裁剪成小画布
      // (headless 下 destination-in 合成会失效, 改逐格 drawImage 抠形)
      const tmp = document.createElement('canvas');
      tmp.width = wpx; tmp.height = hpx;
      const tc = tmp.getContext('2d');
      for (const c of cells) {
        const cx = c % GW, cy = (c / GW) | 0;
        tc.drawImage(soapImg, cx * CELL, cy * CELL, CELL, CELL, (cx - bx0) * CELL, (cy - by0) * CELL, CELL, CELL);
      }
      const cxw = SX + (bx0 + (bx1 - bx0 + 1) / 2) * CELL;
      const cyw = SY + (by0 + (by1 - by0 + 1) / 2) * CELL;
      const dir = cxw < GAME_W / 2 ? -1 : 1;
      pieces.push({
        x: cxw, y: cyw, w: wpx, h: hpx, img: tmp,
        vx: dir * (0.2 + Math.random() * 0.4), vy: 0.4,
        rot: 0, vr: dir * 0.02,
        target: dir * (0.15 + Math.random() * 0.45),
        landed: false, a: 1,
      });
      if (pieces.length > 26) pieces.shift();
      detached++;
      wisps.push({ x: cxw, y: SY + SH - 12, t0: performance.now() });
      for (let i = 0; i < 6; i++) {
        crumbs.push({
          x: cxw + (Math.random() - 0.5) * wpx,
          y: cyw + (Math.random() - 0.5) * hpx,
          vx: (Math.random() - 0.5) * 1.4,
          vy: -Math.random() * 0.7,
          life: 1,
          r: 0.8 + Math.random() * 1.3,
        });
      }
    }
    if (detached > 0) {
      playSfx('game.soapSlice');
      rebuildView();
      updateStatus();
    }
  }

  function carveStep(x0, y0, x1, y1) {
    // 线段与皂体区域(外扩 CUT_R)有交才处理
    const m = CUT_R + 2;
    if (Math.max(x0, x1) < SX - m || Math.min(x0, x1) > SX + SW + m ||
        Math.max(y0, y1) < SY - m || Math.min(y0, y1) > SY + SH + m) return;
    const removed = carve(x0, y0, x1, y1);
    const now = performance.now();
    const midX = (x0 + x1) / 2, midY = (y0 + y1) / 2;
    const inside = midX > SX && midX < SX + SW && midY > SY && midY < SY + SH;
    if (inside && now - lastRub > 150) {
      // v552: 刀刃推进音已删 —— 平时切割也播切皂音(轻), 掉块时全响
      playSfx('game.soapSlice', { volume: 0.5 });
      lastRub = now;
    }
    if (removed > 0 && inside && Math.random() < 0.3) {
      crumbs.push({
        x: midX + (Math.random() - 0.5) * 4,
        y: midY,
        vx: (Math.random() - 0.5) * 0.9,
        vy: 0.15,
        life: 1,
        r: 0.7 + Math.random() * 1.1,
      });
    }
    if (removed > 0) separate();
  }

  function updateKnife(e, first) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    if (!down && (p.x < -30 || p.x > GAME_W + 30 || p.y < -30 || p.y > GAME_H + 30)) return;
    const nx = Math.max(24, Math.min(GAME_W - 24, p.x));
    const ny = Math.max(16, Math.min(GAME_H - 6, p.y));
    // v46: 刀刃朝向跟随移动方向(自由切割)
    const dx = nx - knife.tx, dy = ny - knife.ty;
    if (Math.hypot(dx, dy) > 3) knife.tAng = Math.atan2(dy, dx) + Math.PI / 2;
    if (first) { knife.x = nx; knife.y = ny; }
    knife.tx = nx;
    knife.ty = ny;
  }
  const onDown = e => { down = true; updateKnife(e, true); };
  const onMove = e => { updateKnife(e); };
  const onUp = () => { down = false; };
  stage.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  function drawTray() {
    const wood = ctx.createLinearGradient(0, TRAY.y, 0, TRAY.y + TRAY.h);
    wood.addColorStop(0, '#EBDDC4');
    wood.addColorStop(1, '#D9C39E');
    roundRectPath(ctx, TRAY.x, TRAY.y, TRAY.w, TRAY.h, 16);
    ctx.fillStyle = wood;
    ctx.fill();
    ctx.strokeStyle = 'rgba(94,70,40,0.28)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.save();
    roundRectPath(ctx, TRAY.x, TRAY.y, TRAY.w, TRAY.h, 16);
    ctx.clip();
    ctx.strokeStyle = 'rgba(94,70,40,0.14)';
    ctx.lineWidth = 10;
    roundRectPath(ctx, TRAY.x + 4, TRAY.y + 4, TRAY.w - 8, TRAY.h - 8, 12);
    ctx.stroke();
    ctx.restore();
  }

  function drawPiece(p) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.a) * 0.94;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.drawImage(p.img, -p.w / 2, -p.h / 2);
    ctx.restore();
  }

  function drawKnife() {
    ctx.save();
    ctx.translate(knife.x, knife.y);
    ctx.rotate(knife.ang);
    const bl = ctx.createLinearGradient(-8, 0, 14, 0);
    bl.addColorStop(0, '#C2CFDA');
    bl.addColorStop(0.42, '#F6FAFC');
    bl.addColorStop(0.55, '#FFFFFF');
    bl.addColorStop(1, '#AEBFCB');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8.5, -44, 11, -84);
    ctx.lineTo(-7, -84);
    ctx.quadraticCurveTo(-7.5, -40, -3.5, -6);
    ctx.closePath();
    ctx.fillStyle = bl;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0.6, -3);
    ctx.quadraticCurveTo(8, -44, 10.2, -81);
    ctx.stroke();
    const st = ctx.createLinearGradient(-8, 0, 9, 0);
    st.addColorStop(0, '#9FB0BC');
    st.addColorStop(0.5, '#EDF2F6');
    st.addColorStop(1, '#8C9DA9');
    roundRectPath(ctx, -8, -95, 17, 12, 3);
    ctx.fillStyle = st;
    ctx.fill();
    const hw = ctx.createLinearGradient(-7, 0, 8, 0);
    hw.addColorStop(0, '#5C4634');
    hw.addColorStop(0.5, '#7A5D43');
    hw.addColorStop(1, '#4A3728');
    roundRectPath(ctx, -6.5, -148, 13, 56, 5);
    ctx.fillStyle = hw;
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,20,12,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#D9C9A6';
    ctx.beginPath(); ctx.arc(-1.5, -136, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-1.5, -116, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    drawTray();

    // 剩余皂体(掩码裁剪后的离屏图)
    ctx.drawImage(soapView, SX, SY);

    // v570 花纹亮闪闪: 内嵌装饰上呼吸式四芒星闪光(切掉的格子不闪)
    const tq = performance.now() / 1000;
    for (let i = 0; i < embeds.length; i++) {
      const e = embeds[i];
      const gx = Math.floor(e.x / CELL), gy = Math.floor(e.y / CELL);
      if (gx < 0 || gy < 0 || gx >= GW || gy >= GH || !mask[gy * GW + gx]) continue;
      const tw = 0.45 + 0.55 * Math.sin(tq * 2.4 + i * 1.7);
      if (tw <= 0.08) continue;
      // 大闪光 + 旁边一颗小闪光, 互相错相位 → 密集闪感
      wcSparkle(ctx, SX + e.x, SY + e.y, (e.s + 5) * (0.7 + 0.5 * tw), e.kind === 'star' ? '#FFF4C8' : '#FFE6F0', 0.95 * tw);
      wcSparkle(ctx, SX + e.x + Math.cos(i) * (e.s + 4), SY + e.y + Math.sin(i * 1.3) * (e.s + 4), 2.5 + tw * 1.5, '#FFFFFF', 0.7 * tw);
    }

    // 刀缝阴影(切开的缝有深度感)
    if (cutSegs.length) {
      ctx.save();
      roundRectPath(ctx, SX - 2, SY - 2, SW + 4, SH + 4, 54);
      ctx.clip();
      ctx.strokeStyle = 'rgba(70,50,62,0.3)';
      ctx.lineWidth = CUT_R * 1.1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (const s of cutSegs) {
        ctx.moveTo(s.x0, s.y0);
        ctx.lineTo(s.x1, s.y1);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 切下来掉进托盘的片
    for (const p of pieces) drawPiece(p);

    // 黏连拉丝(切开瞬间, 甘油皂的微黏)
    const now = performance.now();
    for (const w of wisps) {
      const t = (now - w.t0) / 1000;
      const life = Math.max(0, 1 - t / 0.3);
      if (life <= 0) continue;
      ctx.strokeStyle = hexA(palette[0], 0.65 * life);
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        const sx = w.x + (k - 1) * 6;
        const len = 8 + 20 * (1 - life);
        ctx.beginPath();
        ctx.moveTo(sx, SY + SH - 12);
        ctx.quadraticCurveTo(sx + 2.5, SY + SH - 12 + len * 0.6, sx - 1.5, SY + SH - 12 + len);
        ctx.stroke();
      }
    }
    wisps = wisps.filter(w => (now - w.t0) / 1000 < 0.3);

    // 半透明碎屑
    for (const c of crumbs) {
      ctx.globalAlpha = Math.max(0, c.life) * 0.65;
      ctx.fillStyle = palette[1];
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    drawKnife();
  }

  function loop() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastLoopT) / 1000);
    lastLoopT = now;
    const px0 = knife.x, py0 = knife.y;
    knife.x += (knife.tx - knife.x) * 0.35;
    knife.y += (knife.ty - knife.y) * 0.4;
    knife.vx = knife.x - px0;
    knife.ang += (knife.tAng - knife.ang) * 0.2;
    if (down && (knife.x !== px0 || knife.y !== py0)) {
      carveStep(px0, py0, knife.x, knife.y);
    }

    // v46: 物理用真实 dt, headless rAF 节流也能按时落
    const SEC = dt * 60;   // 60fps 时为 1, 30fps 时为 0.5
    for (const p of pieces) {
      if (p.landed) {
        p.vx *= 0.86;
        p.x += p.vx * SEC;
        p.rot += (p.target - p.rot) * 0.2 * SEC;
        continue;
      }
      p.vy += 0.34 * SEC;     // 重力 ~20px/s² (60fps 等价)
      p.x += p.vx * SEC;
      p.y += p.vy * SEC;
      p.rot += p.vr * SEC;
      p.vr += (p.target - p.rot) * 0.002 * SEC;
      const hh = (Math.abs(Math.cos(p.rot)) * p.h + Math.abs(Math.sin(p.rot)) * p.w) / 2;
      if (p.y + hh >= FLOOR) {
        p.landed = true;
        p.y = FLOOR - hh;
        p.vy = 0;
        p.vx *= 0.3;
      }
    }

    for (const c of crumbs) {
      c.x += c.vx * SEC;
      c.y += c.vy * SEC;
      c.vy += 0.12 * SEC;
      c.life -= 0.02 * SEC;
    }
    crumbs = crumbs.filter(c => c.life > 0);

    render();
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = setTimeout(loop, 16);
  }

  rollEmbeds();
  initMask();
  paintSoapImg();
  rebuildView();
  updateStatus();
  loop(0);

  return {
    destroy() {
      clearTimeout(raf);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    }
  };
}

/* ---------- 游戏: 炭火烤串(仿真火炭/木盘/鱼丸一串3个) ---------- */
const ROAST_FOODS = {
  // v570 色阶重排: 金黄区间(cook 1.0-1.75)落在亮金档, 不再发棕
  marshmallow: { name: '棉花糖', colors: ['#FFFFFF', '#FFF6DC', '#FFE79A', '#FFCF5E', '#E09A3E', '#7A4A22', '#241810'], shape: 'marshmallow' },
  sausage:     { name: '烤肠',   colors: ['#E8813F', '#F2A244', '#FBBB50', '#FFD45E', '#F0B23E', '#9C5A24', '#1D130C'], shape: 'sausage' },
  fishball:    { name: '鱼丸',   colors: ['#F6F3EA', '#FCF2CE', '#FBE29A', '#F7C964', '#DFA648', '#7A5A2E', '#26201A'], shape: 'fishball' },
};
function roastColor(colors, cook) {
  // cook: 0 生 → 1.3 金黄 → 1.8 深 → 2.4 焦黑
  const t = Math.min(1, Math.max(0, cook / 2.4));
  const seg = t * (colors.length - 1);
  const i = Math.floor(seg);
  if (i >= colors.length - 1) return colors[colors.length - 1];
  const f = seg - i;
  const hex2 = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const a = hex2(colors[i]), b = hex2(colors[i + 1]);
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
}
function buildRoast(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const FIRE = { x: 276, y: 292, r: 88 };
  let foodType = 'marshmallow';
  let cook = 0;               // 0 → 2.4, 时间驱动(不依赖 rAF dt)
  const HOLD = { x: 300, y: 118 };
  let food = { ...HOLD };     // 食材当前位置
  let down = false;
  let cooking = false;        // 本帧是否在火上
  let lastT = performance.now();
  const plate = [];           // 烤好的
  const smokes = [];
  const floats = [];
  const embers = [];          // 常驻火星
  let lastSiz = 0;
  let fireNodes = null;       // v547: 炭火环境循环(游戏开着就持续)
  let raf = 0;
  for (let i = 0; i < 20; i++) embers.push({ x: FIRE.x + (Math.random() - 0.5) * 140, y: FIRE.y + Math.random() * 22, v: 0.4 + Math.random() * 0.6, s: 1 + Math.random() * 2.2, ph: Math.random() * Math.PI * 2, px: 0, py: 0 });

  // v547: 炭火环境声(ASMR 同款篝火)持续循环, 关游戏才停
  startLoopSound('game.roastFire').then(n => { if (n) fireNodes = n; });

  // v41: 食物长轴水平(沿 x 轴), 外层 ctx.rotate(ang) 顺签子方向; 棉花糖恢复 v28 第一版
  function drawFood(g, type, x, y, ck, scale) {
    const col = roastColor(ROAST_FOODS[type].colors, ck);
    const charred = ck >= 1.95;
    const sc = scale || 1;
    g.save();
    g.translate(x, y);
    g.scale(sc, sc);
    const jit = cooking ? Math.sin(performance.now() / 90) * 0.8 : 0;
    g.translate(0, jit);
    const hiCol = _wcMix(col, '#FFFFFF', 0.34);
    const loCol = _wcDarken(col, 0.32);
    if (type === 'marshmallow') {
      // v566 卡片同款水彩棉花糖(外晕→3段渐变→叠染→积色→层叠高光)
      wcWashPath(g, gg => wcRoundRect(gg, -20, -16, 40, 32, 13, 4, 0.9), 0, 0, 27, hiCol, loCol);
    } else if (type === 'sausage') {
      // v566 卡片同款水彩烤肠
      const sausPath = gg => {
        gg.beginPath();
        gg.moveTo(-26, -3);
        gg.quadraticCurveTo(-26, -12, -12, -12);
        gg.lineTo(12, -12);
        gg.quadraticCurveTo(26, -12, 26, -3);
        gg.quadraticCurveTo(26, 8, 12, 8);
        gg.lineTo(-12, 8);
        gg.quadraticCurveTo(-26, 8, -26, -3);
        gg.closePath();
      };
      wcWashPath(g, sausPath, 0, -2, 27, hiCol, loCol);
      // 烤痕 clip(焦圈 + 斜纹严格画在肠内, 不出格)
      g.save();
      sausPath(g); g.clip();
      if (ck > 0.4) {
        g.fillStyle = charred ? 'rgba(30,16,8,0.65)' : 'rgba(158,86,32,0.3)';
        g.beginPath(); g.ellipse(-24, -2, 4.5, 8.5, 0, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(24, -2, 4.5, 8.5, 0, 0, Math.PI * 2); g.fill();
      }
      if (ck > 0.55) {
        g.strokeStyle = charred ? 'rgba(30,16,8,0.6)' : 'rgba(96,48,18,0.32)';
        g.lineWidth = 2.2; g.lineCap = 'round';
        for (let k = -2; k <= 2; k++) {
          const bx = k * 11;
          g.beginPath(); g.moveTo(bx - 5, -10); g.lineTo(bx + 5, 10); g.stroke();
        }
      }
      g.restore();
    } else {
      // 鱼丸: 一串 3 颗(卡片水彩球)
      const drawOne = (ox, rr) => {
        wcWashPath(g, gg => wcCirclePath(gg, ox, 0, rr, rr, (ox * 0.7 + rr) | 0, 1.0), ox, 0, rr,
          charred ? '#6A5638' : '#FFFFFF', charred ? '#2A2018' : loCol);
        if (!charred) {
          g.fillStyle = 'rgba(140,120,100,0.3)';
          [[-rr * 0.4, rr * 0.2, 1], [rr * 0.3, -rr * 0.1, 0.9], [0, rr * 0.45, 0.8]].forEach(([px, py, pr]) => {
            g.beginPath(); g.arc(ox + px, py, pr, 0, Math.PI * 2); g.fill();
          });
        }
      };
      drawOne(-24, 11.5);
      drawOne(0, 12.5);
      drawOne(24, 11.5);
    }
    // v570 金黄光泽(通用): 烤到位时油亮亮的镜面反射 + 闪光点
    if (ck >= 0.85 && !charred) {
      const sheen = 0.42 + 0.2 * Math.sin(performance.now() / 260);
      g.fillStyle = 'rgba(255,248,214,' + (sheen + 0.1) + ')';
      g.beginPath(); g.ellipse(-7, -7, 6.5, 3.4, -0.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,' + (sheen + 0.14) + ')';
      g.beginPath(); g.ellipse(8, 5, 5.5, 2.6, 0.35, 0, Math.PI * 2); g.fill();
      wcSparkle(g, 14, -12, 3.2, '#FFF4C8', 0.55 + 0.3 * Math.sin(performance.now() / 300));
    }
    g.restore();
  }

  const onDown = e => {
    down = true;
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    food.x = p.x; food.y = p.y;
    lastT = performance.now();
  };
  const onMove = e => {
    if (!down) return;
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    food.x = p.x; food.y = p.y;
  };
  const onUp = () => {
    if (down) serveCurrent();
    down = false;
  };
  stage.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  function serveCurrent() {
    const ck = cook;
    let verdict, col;
    if (ck >= 1.95) { verdict = '糊了…'; col = '#8A8378'; }
    else if (ck >= 1.0 && ck < 1.75) { verdict = '金黄! 完美 ✦'; col = '#E2A33C'; }
    else if (ck >= 0.55) { verdict = '还不错, 再烤烤更好'; col = '#9BB07E'; }
    else if (ck > 0.12) { verdict = '还嫩着呢'; col = '#9BB0C4'; }
    else { verdict = '生的, 你都没烤'; col = '#9BB0C4'; }
    plate.push({ type: foodType, cook: ck });
    if (plate.length > 9) plate.shift();
    floats.push({ x: food.x, y: food.y - 34, text: verdict, color: col, life: 1 });
    if (ck >= 1.0 && ck < 1.75) playSfx('game.bake');
    cook = 0;
    food.x = HOLD.x; food.y = HOLD.y;
  }

  // 食材切换条
  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  const row = document.createElement('div');
  row.className = 'st-row';
  Object.keys(ROAST_FOODS).forEach(key => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'st-chip' + (key === foodType ? ' on' : '');
    chip.textContent = ROAST_FOODS[key].name;
    chip.addEventListener('click', e => {
      e.stopPropagation();
      foodType = key; cook = 0;
      row.querySelectorAll('.st-chip').forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
    });
    row.appendChild(chip);
  });
  tools.appendChild(row);
  stage.appendChild(tools);

  const status = document.createElement('span');
  status.className = 'game-status';
  status.textContent = '按住签子放到火上烤, 金黄时拿开, 一直放着会烤焦';
  stage.appendChild(status);

  function render(time) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    // 烤制推进(时间驱动)
    const dist = Math.hypot(food.x - FIRE.x, food.y - FIRE.y);
    cooking = down && dist < FIRE.r;
    if (cooking) {
      const near = 1 - dist / FIRE.r;
      cook = Math.min(2.4, cook + (0.24 + 0.34 * near) * dt * 2.2);
      if (now - lastSiz > 340) { playSfx('game.bake'); lastSiz = now; }
      if (cook >= 1.95 && Math.random() < 0.4) {
        smokes.push({ x: food.x + (Math.random() - 0.5) * 16, y: food.y - 12, life: 1, s: 3 + Math.random() * 4 });
      }
    }

    ctx.clearRect(0, 0, GAME_W, GAME_H);
    // 夜色
    const sky = ctx.createLinearGradient(0, 0, 0, GAME_H);
    sky.addColorStop(0, '#1E2238');
    sky.addColorStop(0.6, '#3A2E42');
    sky.addColorStop(1, '#4A2F35');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    // 星星
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 26; i++) {
      const sx = (i * 97 + 31) % GAME_W, sy = (i * 53 + 17) % 150 + 12;
      const tw = 0.35 + 0.3 * Math.sin(time / 700 + i * 1.7);
      ctx.globalAlpha = tw;
      ctx.fillRect(sx, sy, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;

    // 火光环境光
    const glow = ctx.createRadialGradient(FIRE.x, FIRE.y, 10, FIRE.x, FIRE.y, 250);
    const flick = 0.18 + 0.06 * Math.sin(time / 120) + 0.035 * Math.sin(time / 47);
    glow.addColorStop(0, `rgba(255,150,60,${flick})`);
    glow.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // 炭床(更密, 带烧红裂纹)
    for (let i = 0; i < 7; i++) {
      const cx2 = FIRE.x - 96 + i * 32;
      const cy2 = FIRE.y + 8 + Math.sin(i * 2.3) * 3;
      const w2 = 26 + Math.random() * 8;
      ctx.fillStyle = '#221C20';
      roundRectPath(ctx, cx2 - w2 / 2, cy2, w2, 16 + Math.random() * 5, 6);
      ctx.fill();
      // 烧红裂纹
      const heat = 0.5 + 0.5 * Math.sin(time / 240 + i * 2.1);
      ctx.strokeStyle = `rgba(255,${80 + heat * 80},30,${0.4 + heat * 0.4})`;
      ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx2 - w2 * 0.28, cy2 + 5);
      ctx.lineTo(cx2 + (Math.random() * 6 - 3), cy2 + 11 + heat * 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx2 + w2 * 0.25, cy2 + 4);
      ctx.lineTo(cx2 - (Math.random() * 5 - 2), cy2 + 9);
      ctx.stroke();
    }
    // 烤架横杆
    ctx.fillStyle = '#3E3A44';
    roundRectPath(ctx, FIRE.x - 116, FIRE.y - 16, 232, 7, 3); ctx.fill();
    roundRectPath(ctx, FIRE.x - 116, FIRE.y + 34, 232, 7, 3); ctx.fill();

    // 火苗(四层泪滴, 内芯更亮)
    const flameH = 50 + 7 * Math.sin(time / 90);
    const layers = [
      { lw: 34, lh: 1, col: 'rgba(196,58,22,0.5)' },
      { lw: 27, lh: 0.86, col: 'rgba(232,88,28,0.85)' },
      { lw: 19, lh: 0.68, col: 'rgba(255,150,40,0.92)' },
      { lw: 11, lh: 0.5, col: 'rgba(255,232,160,0.95)' },
    ];
    for (let layer = 0; layer < layers.length; layer++) {
      const L = layers[layer];
      const lw = L.lw, lh = flameH * L.lh;
      const sway = Math.sin(time / 130 + layer * 1.3) * (5 - layer);
      ctx.fillStyle = L.col;
      ctx.beginPath();
      ctx.moveTo(FIRE.x + sway - lw / 2, FIRE.y - 6);
      ctx.quadraticCurveTo(FIRE.x + sway - lw / 2 - 3, FIRE.y - lh * 0.55, FIRE.x + sway, FIRE.y - lh);
      ctx.quadraticCurveTo(FIRE.x + sway + lw / 2 + 3, FIRE.y - lh * 0.55, FIRE.x + sway + lw / 2, FIRE.y - 6);
      ctx.closePath();
      ctx.fill();
    }

    // 火星(带拖尾)
    for (const em of embers) {
      em.px = em.x; em.py = em.y;
      em.y -= em.v;
      em.x += Math.sin(time / 300 + em.ph) * 0.4;
      if (em.y < FIRE.y - 130) { em.y = FIRE.y + Math.random() * 12; em.x = FIRE.x + (Math.random() - 0.5) * 140; }
      const a = 0.3 + 0.7 * Math.abs(Math.sin(time / 240 + em.ph));
      ctx.strokeStyle = `rgba(255,200,90,${a * 0.5})`;
      ctx.lineWidth = em.s;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(em.px, em.py); ctx.lineTo(em.x, em.y); ctx.stroke();
      ctx.fillStyle = `rgba(255,215,110,${a})`;
      ctx.beginPath(); ctx.arc(em.x, em.y, em.s, 0, Math.PI * 2); ctx.fill();
    }

    // 木盘(左下)
    ctx.save();
    ctx.translate(84, 350);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(3, 5, 62, 17, 0, 0, Math.PI * 2); ctx.fill();
    const wg = ctx.createLinearGradient(0, -16, 0, 16);
    wg.addColorStop(0, '#D9B184');
    wg.addColorStop(0.5, '#C89B6C');
    wg.addColorStop(1, '#A87E52');
    ctx.fillStyle = wg;
    ctx.beginPath(); ctx.ellipse(0, 0, 62, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E7C698';
    ctx.beginPath(); ctx.ellipse(0, -3, 44, 11, 0, 0, Math.PI * 2); ctx.fill();
    // 木纹
    ctx.strokeStyle = 'rgba(120,84,48,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, 2, 52, 13, 0, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-6, 0, 34, 8, 0, 0.3, Math.PI - 0.3); ctx.stroke();
    plate.forEach((it, i2) => {
      const px = -38 + (i2 % 5) * 19, py = -9 - Math.floor(i2 / 5) * 13;
      drawFood(ctx, it.type, px, py, it.cook, 0.86);
    });
    ctx.restore();

    // v41: 签子 + 食物(食物旋转 ang 顺签子方向, 真正"穿"在签子上)
    const hx = 470, hy = 358;
    const ang = Math.atan2(food.y - hy, food.x - hx);
    // 不同食物的"串长半值"(沿签子方向, 食物中心到最远端)
    const FOOD_HALF = { marshmallow: 22, sausage: 28, fishball: 26 };
    const half = FOOD_HALF[foodType] || 22;
    // 签子从 (hx,hy) 穿过食物中心, 一直延伸到 食物最远端 + 18
    const tipX = food.x + Math.cos(ang) * (half + 18);
    const tipY = food.y + Math.sin(ang) * (half + 18);
    // 竹签(双色 + 细高光)
    ctx.save();
    const sg2 = ctx.createLinearGradient(hx, hy, tipX, tipY);
    sg2.addColorStop(0, '#8A6238');
    sg2.addColorStop(0.5, '#C99A6B');
    sg2.addColorStop(1, '#A9845A');
    ctx.strokeStyle = sg2;
    ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tipX, tipY); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,240,210,0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(hx, hy + 1); ctx.lineTo(tipX + Math.cos(ang) * 0.3, tipY + Math.sin(ang) * 0.3); ctx.stroke();
    // 签尾手柄(深色木圆头)
    ctx.fillStyle = '#5C3A1E';
    ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,170,0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(hx - 1, hy - 1, 2.4, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    // 食物: 旋转 ang, 长轴顺签子方向(食物画在局部坐标 (0,0), 长轴水平 → 旋转后顺签子)
    ctx.save();
    ctx.translate(food.x, food.y);
    ctx.rotate(ang);
    drawFood(ctx, foodType, 0, 0, cook, 1);
    ctx.restore();
    if (cooking) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const fg = ctx.createRadialGradient(food.x, food.y, 2, food.x, food.y, 32);
      fg.addColorStop(0, 'rgba(255,180,80,0.25)');
      fg.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = fg;
      ctx.fillRect(food.x - 32, food.y - 32, 64, 64);
      ctx.restore();
    }

    // 烟
    for (let i = smokes.length - 1; i >= 0; i--) {
      const s = smokes[i];
      s.life -= 0.008; s.y -= 0.55; s.x += Math.sin(time / 400 + i) * 0.3; s.s += 0.16;
      if (s.life <= 0) { smokes.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(190,190,200,${s.life * 0.32})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill();
    }
    // 漂字
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= 0.008; f.y -= 0.4;
      if (f.life <= 0) { floats.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.font = '600 15px "LXGW WenKai", system-ui, sans-serif';
      ctx.fillStyle = f.color;
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(render);
  }
  render(performance.now());

  return {
    destroy() {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (fireNodes) { try { smoothStop(fireNodes); } catch (e) {} fireNodes = null; }
    },
  };
}


/* ---------- 游戏: 冰激凌机(按住即出料 · 水果写实 · 点雪糕能吃) ---------- */
const BLENDER_FRUITS = {
  watermelon: { name: '西瓜',   pulp: '#FF6F78', rind: '#5FA35A', seed: '#3A2A28' },
  mango:      { name: '芒果',   pulp: '#FFB13D', rind: '#F2A02C', seed: '#8A5A28' },
  blueberry:  { name: '蓝莓',   pulp: '#6678D9', rind: '#4A55A8', seed: '#2E3468' },
  kiwi:       { name: '猕猴桃', pulp: '#93CB4D', rind: '#7A6B3F', seed: '#2E2A20' },
  strawberry: { name: '草莓',   pulp: '#FF7FA8', rind: '#E4587E', seed: '#FFE1B8' },
  grape:      { name: '葡萄',   pulp: '#9A6FD9', rind: '#6F4AA8', seed: '#4E3578' },
};

  // v566 卡片同款水彩水果(外晕→3段渐变→叠染→积色→层叠高光)
function drawFruitIcon(g, type, x, y, s) {
  const f = BLENDER_FRUITS[type];
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  // 落地阴影(卡片软阴影)
  wcShadow(g, 0, 4, 24, 6, 0.15);
  if (type === 'watermelon') {
    const rindP = gg => { gg.beginPath(); gg.arc(0, 0, 22, Math.PI, 0); gg.closePath(); };
    wcWashPath(g, rindP, 0, -11, 23, '#9CD684', '#3F7A3A');
    g.fillStyle = 'rgba(248,244,232,0.88)';
    g.beginPath(); g.arc(0, 0, 18.5, Math.PI, 0); g.closePath(); g.fill();
    const pulpP = gg => { gg.beginPath(); gg.arc(0, 0, 15, Math.PI, 0); gg.closePath(); };
    wcWashPath(g, pulpP, 0, -7.5, 15, '#FFA6AC', '#EE4A58', { haloA: 0.18 });
    g.fillStyle = f.seed;
    [[-9, -3], [-3, -7], [3, -3], [9, -7], [0, -1]].forEach(([px, py]) => { g.beginPath(); g.ellipse(px, py, 1.6, 2.7, 0.3, 0, Math.PI * 2); g.fill(); });
  } else if (type === 'mango') {
    const mangoP = gg => { gg.beginPath(); gg.ellipse(0, 0, 19, 23, 0.3, 0, Math.PI * 2); };
    wcWashPath(g, mangoP, 0, 0, 23, '#FFDE9C', '#D97F1E');
    g.strokeStyle = '#8A5A28'; g.lineWidth = 2.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-13, -2); g.quadraticCurveTo(-17, 8, -12, 15); g.stroke();
  } else if (type === 'blueberry') {
    wcWashPath(g, gg => wcCirclePath(gg, 0, 0, 19, 19, 7, 1.0), 0, 0, 19, '#9CA9F0', '#3D4A9E');
    g.fillStyle = '#5B3A2E';
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + k / 5 * Math.PI * 2;
      g.beginPath(); g.arc(Math.cos(a) * 5.5, -19 + Math.sin(a) * 2, 1.9, 0, Math.PI * 2); g.fill();
    }
  } else if (type === 'kiwi') {
    wcWashPath(g, gg => wcCirclePath(gg, 0, 0, 20, 20, 5, 1.0), 0, 0, 20, '#ACD570', '#6E9E3F');
    wcWashPath(g, gg => wcCirclePath(gg, 0, 0, 15.5, 15.5, 9, 0.8), 0, 0, 15.5, '#EAF2CA', '#93CB4D', { haloA: 0.15 });
    g.fillStyle = '#F7FAEC';
    g.beginPath(); g.arc(0, 0, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = f.seed;
    for (let k = 0; k < 10; k++) {
      const a = k / 10 * Math.PI * 2;
      g.beginPath(); g.ellipse(Math.cos(a) * 10.5, Math.sin(a) * 10.5, 1.1, 2.2, a, 0, Math.PI * 2); g.fill();
    }
  } else if (type === 'strawberry') {
    const berryP = gg => {
      gg.beginPath();
      gg.moveTo(-17, -9); gg.quadraticCurveTo(-18, 9, 0, 21); gg.quadraticCurveTo(18, 9, 17, -9);
      gg.quadraticCurveTo(0, -19, -17, -9); gg.closePath();
    };
    wcWashPath(g, berryP, 0, 1, 22, '#FFB8CD', '#D94A7A');
    g.fillStyle = f.seed;
    [[-7, -1], [7, -1], [0, 7], [-9, -7], [9, -7], [-3, 13], [4, 13]].forEach(([px, py]) => { g.beginPath(); g.ellipse(px, py, 1.3, 2, 0, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#4E8A3E';
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * Math.PI * 2 - Math.PI / 2;
      g.beginPath(); g.ellipse(Math.cos(a) * 9, -9 + Math.sin(a) * 3.4, 4.6, 2.4, a, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = '#3E6E30'; g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, -12); g.lineTo(0, -6); g.stroke();
  } else {
    [[-12, 6], [-6, -6], [0, 6], [6, -6], [12, 6], [0, 15]].forEach(([px, py]) => {
      wcWashPath(g, gg => wcCirclePath(gg, px, py, 8.4, 8.4, px + py, 1.0), px, py, 8.4, '#C6AAF4', '#6F4AA8', { haloA: 0.2 });
    });
    g.strokeStyle = '#5B3A2E'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(3, -18, 1, -21); g.stroke();
    g.fillStyle = '#7FA86A';
    g.beginPath(); g.ellipse(1, -21, 4, 2.4, 0.5, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

function buildBlender(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const queue = [];          // 待打的水果
  const falling = [];        // 正在掉落的水果
  const layers = [];         // 雪糕层 {color, h, maxh}
  const bits = [];           // 咬下的碎屑
  let blending = false;      // 按住启动, 按住即出料
  let blendShake = 0;
  let cupLevel = 0;          // 雪糕总层数
  let doneMsg = false;
  let lastT = performance.now();
  let lastBlendSfx = 0, lastSplatSfx = 0;
  const floats = [];
  let bite = null;           // 咬痕 {x, y, t}
  let raf = 0;
  const CONE = { x: 280, top: 262, tip: 372, w: 80 };
  const NOZZLE = { x: 280, y: 258 };   // 出料嘴尖端
  const MAX_LAYERS = 6;

  function mixHex(a, b, t) {
    const h = c => {
      if (c[0] === '#') return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
      const m = c.match(/\d+/g); return [parseInt(m[0]), parseInt(m[1]), parseInt(m[2])];
    };
    const A = h(a), B = h(b);
    return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
  }
  const lighten = c => mixHex(c, '#FFFFFF', 0.42);
  const deepen = c => mixHex(c, '#5A3A78', 0.22);

  const addFruit = type => {
    if (queue.length >= 4) {
      floats.push({ x: 280, y: 120, text: '肚子满了, 先挤这一轮', color: '#B0A8C0', life: 1 });
      return;
    }
    falling.push({ type, x: 280, y: 60, vy: 0 });
    // v548: 放水果不再发声(用户要求去掉怪声)
  };

  // 工具条: 水果 + 启动
  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  const row = document.createElement('div');
  row.className = 'st-row';
  Object.keys(BLENDER_FRUITS).forEach(key => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'st-chip';
    chip.innerHTML = `<i class="st-dotc" style="--c:${BLENDER_FRUITS[key].pulp}"></i>${BLENDER_FRUITS[key].name}`;
    chip.addEventListener('click', e => { e.stopPropagation(); addFruit(key); });
    row.appendChild(chip);
  });
  const blendBtn = document.createElement('button');
  blendBtn.type = 'button';
  blendBtn.className = 'st-chip blend-chip';
  blendBtn.textContent = '按住 · 挤出冰激凌';
  const bDown = e => {
    e.stopPropagation();
    if (!queue.length) {
      floats.push({ x: 280, y: 140, text: '先放点配料进去呀', color: '#B0A8C0', life: 1 });
      return;
    }
    if (layers.length >= MAX_LAYERS) {
      floats.push({ x: 280, y: 140, text: '杯子满了! 点雪糕吃一口再挤', color: '#D9825F', life: 1 });
      return;
    }
    blending = true;
    doneMsg = false;
    blendBtn.classList.add('on');
  };
  const bUp = () => {
    blending = false;
    blendBtn.classList.remove('on');
  };
  blendBtn.addEventListener('pointerdown', bDown);
  blendBtn.addEventListener('pointerup', bUp);
  blendBtn.addEventListener('pointerleave', bUp);
  blendBtn.addEventListener('pointercancel', bUp);
  row.appendChild(blendBtn);
  tools.appendChild(row);
  stage.appendChild(tools);

  const status = document.createElement('span');
  status.className = 'game-status';
  status.textContent = '选配料倒进机器, 按住挤出冰激凌, 点雪糕咬一口';
  stage.appendChild(status);

  function openLayer() {
    if (!queue.length || layers.length >= MAX_LAYERS) return;
    const t = queue.shift();
    const next = queue[0] || t;
    const col = mixHex(BLENDER_FRUITS[t].pulp, BLENDER_FRUITS[next].pulp, 0.25);
    layers.push({ color: col, h: 0, maxh: 1 });
    cupLevel = layers.length;
  }

  function takeBite(e) {
    if (e.target !== cv) return;
    if (!layers.length) return;
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    const topY = swirlTopY();
    // 雪糕堆叠区域(比蛋筒略宽, 从最顶到蛋筒卷边): 点哪咬哪
    if (p.x > CONE.x - 76 && p.x < CONE.x + 76 && p.y > topY - 12 && p.y < CONE.top + 26) {
      const L = layers[layers.length - 1];
      layers.pop();
      cupLevel = Math.max(0, cupLevel - 1);
      playSfx('game.icecreamBite');
      bite = { x: p.x, y: p.y, t: 0 };
      for (let i = 0; i < 5; i++) {
        bits.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 130, vy: -70 - Math.random() * 100, color: L.color, life: 0.9 });
      }
      floats.push({ x: p.x, y: p.y - 30, text: ['好吃~', '冰冰的~', '咕嘟咕嘟', '再来一口!', '绵密丝滑~'][Math.floor(Math.random() * 5)], color: '#D9825F', life: 1 });
    }
  }
  cv.addEventListener('pointerdown', takeBite);

  function drawMachine(shake) {
    ctx.save();
    ctx.translate(shake, shake * 0.6);
    // 机身(v566 卡片同款水彩叠染)
    wcBlock(ctx, 196, 62, 168, 186, 26, { hi: '#FBF6EC', lo: '#E2D6BA' }, 6);
    // v566 卡片层叠高光 + 白点 + sparkle
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.ellipse(244, 112, 16, 7, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.ellipse(322, 218, 11, 5, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(241, 108, 2.6, 0, Math.PI * 2); ctx.fill();
    wcSparkle(ctx, 348, 250, 6, '#F5D992', 0.75);
    // 左侧不锈钢面板(带拉丝)
    ctx.fillStyle = '#E3E8EC';
    roundRectPath(ctx, 203, 72, 18, 168, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.2;
    roundRectPath(ctx, 203, 72, 18, 168, 8); ctx.stroke();
    ctx.strokeStyle = 'rgba(130,145,160,0.22)';
    for (let ly = 84; ly < 234; ly += 6) {
      ctx.beginPath(); ctx.moveTo(205, ly); ctx.lineTo(219, ly); ctx.stroke();
    }
    // 顶部投料口(圆口+橡胶圈, v566 卡片水彩: 暖卡其外环 + 米色内圈, 不再用纯黑)
    const hopperX = 280, hopperY = 60, hopperR = 22;
    ctx.fillStyle = '#C8A878';
    ctx.beginPath(); ctx.ellipse(hopperX, hopperY, hopperR + 5, hopperR * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(hopperX - 4, hopperY - 2, hopperR * 0.55, hopperR * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3A2F22';
    ctx.beginPath(); ctx.arc(hopperX, hopperY + 1, hopperR - 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(60,45,30,0.6)';
    ctx.beginPath(); ctx.arc(hopperX + 3, hopperY + 3, hopperR - 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(95,75,50,0.55)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(hopperX, hopperY, hopperR - 2, 0, Math.PI * 2); ctx.stroke();
    // 侧面出料滑道提示箭头
    ctx.fillStyle = 'rgba(120,100,70,0.25)';
    ctx.beginPath(); ctx.moveTo(286, 88); ctx.lineTo(300, 96); ctx.lineTo(286, 104); ctx.closePath(); ctx.fill();
    // 控制徽章(圆)
    ctx.strokeStyle = 'rgba(120,100,70,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(280, 152, 28, 0, Math.PI * 2); ctx.stroke();
    const panelG = ctx.createLinearGradient(0, 126, 0, 178);
    panelG.addColorStop(0, '#F4EEE0');
    panelG.addColorStop(1, '#E4D8BC');
    ctx.fillStyle = panelG;
    ctx.beginPath(); ctx.arc(280, 152, 27, 0, Math.PI * 2); ctx.fill();
    // 工作指示灯
    ctx.fillStyle = blending ? '#FFB03A' : '#8FBF7F';
    ctx.beginPath(); ctx.arc(280, 142, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = blending ? 'rgba(255,176,58,0.35)' : 'rgba(143,191,127,0.3)';
    ctx.beginPath(); ctx.arc(280, 142, 8, 0, Math.PI * 2); ctx.fill();
    // 运转环
    if (blending) {
      ctx.strokeStyle = '#E2A33C'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(280, 165, 14, Math.PI * 0.25, Math.PI * 0.75); ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(150,130,100,0.5)';
      ctx.beginPath(); ctx.arc(280, 165, 5, 0, Math.PI * 2); ctx.fill();
    }
    // 螺丝
    ctx.fillStyle = 'rgba(120,100,70,0.55)';
    [[212, 78], [348, 78], [212, 232], [348, 232]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
    });
    // 侧把手
    ctx.fillStyle = '#C9BFA6';
    roundRectPath(ctx, 186, 148, 9, 44, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(120,100,70,0.35)'; ctx.lineWidth = 1.4;
    roundRectPath(ctx, 186, 148, 9, 44, 4); ctx.stroke();
    // 出料嘴(锥形不锈钢)
    const nz = ctx.createLinearGradient(268, 0, 292, 0);
    nz.addColorStop(0, '#B9C4CC');
    nz.addColorStop(0.5, '#F2F6F9');
    nz.addColorStop(1, '#A9B6C0');
    ctx.fillStyle = nz;
    ctx.beginPath();
    ctx.moveTo(270, 238);
    ctx.lineTo(290, 238);
    ctx.lineTo(283, 258);
    ctx.lineTo(277, 258);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(110,125,140,0.6)'; ctx.lineWidth = 1.2;
    ctx.stroke();
    // 接渣盘
    ctx.fillStyle = '#B9C4CC';
    roundRectPath(ctx, 264, 258, 32, 7, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(110,125,140,0.4)'; ctx.lineWidth = 1;
    roundRectPath(ctx, 264, 258, 32, 7, 3); ctx.stroke();
    // 底脚
    ctx.fillStyle = 'rgba(120,100,70,0.5)';
    roundRectPath(ctx, 210, 246, 22, 6, 3); ctx.fill();
    roundRectPath(ctx, 328, 246, 22, 6, 3); ctx.fill();
    ctx.restore();
  }

  // 雪糕旋涡总高度(从蛋筒顶往上堆)
  function swirlTopY() {
    let y = CONE.top;
    for (const L of layers) y -= 14 * L.h;
    return y;
  }

  function render(time) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    // 掉落水果
    for (let i = falling.length - 1; i >= 0; i--) {
      const f = falling[i];
      f.vy += 900 * dt; f.y += f.vy * dt;
      if (f.y >= 62) {
        falling.splice(i, 1);
        queue.push(f.type);
        // v548: 水果落进料筒不再发声
      }
    }
    // 搅拌抖动
    if (blending) {
      blendShake = Math.sin(now / 22) * 2.4;
      if (now - lastBlendSfx > 460) { playSfx('game.icecreamMotor'); lastBlendSfx = now; }
    } else blendShake *= 0.8;
    // 出料: 按住即出, 松手停
    if (blending) {
      const top = layers[layers.length - 1];
      if (!top || top.h >= top.maxh) openLayer();
      const L = layers[layers.length - 1];
      if (L && L.h < L.maxh) {
        L.h = Math.min(L.maxh, L.h + dt * 2.2);
        if (now - lastSplatSfx > 240) { playSfx('game.icecreamDrop'); lastSplatSfx = now; }
      } else if (!queue.length && !doneMsg) {
        doneMsg = true;
        floats.push({ x: CONE.x, y: CONE.top - 46, text: '打好了! 点雪糕咬一口 ✦', color: '#D9825F', life: 1 });
      }
    }
    // 咬痕/碎屑
    if (bite) { bite.t += dt * 2.4; if (bite.t >= 1) bite = null; }
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.vy += 500 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt * 1.6;
      if (b.life <= 0) bits.splice(i, 1);
    }

    ctx.clearRect(0, 0, GAME_W, GAME_H);
    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
    bg.addColorStop(0, 'rgba(255, 236, 214, 0.5)');
    bg.addColorStop(1, 'rgba(222, 238, 248, 0.55)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, GAME_W, GAME_H);

    drawMachine(blendShake);

    // 出料软条(从喷嘴到雪糕顶)
    if (blending && layers.length) {
      const layer = layers[layers.length - 1];
      const col = layer.color;
      const top = swirlTopY();
      ctx.strokeStyle = col;
      ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(NOZZLE.x, NOZZLE.y - 4);
      ctx.quadraticCurveTo(NOZZLE.x + Math.sin(now / 60) * 3, (NOZZLE.y + top) / 2, NOZZLE.x, top + 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(NOZZLE.x - 2, NOZZLE.y - 6);
      ctx.quadraticCurveTo(NOZZLE.x - 2 + Math.sin(now / 60) * 3, (NOZZLE.y + top) / 2, NOZZLE.x - 2, top + 4);
      ctx.stroke();
    }

    // 掉落中的水果
    falling.forEach(f => drawFruitIcon(ctx, f.type, f.x, f.y, 1));
    // 等待区显示队列里的水果
    queue.forEach((t, i) => drawFruitIcon(ctx, t, 336 + i * 36, 44, 0.95));

    // 蛋筒
    ctx.save();
    ctx.translate(CONE.x, 0);
    // v570: 手绘感蛋筒(圆头尖 + 微鼓侧弧, 不再是硬直线三角)
    wcShadow(ctx, 3, CONE.tip + 6, 34, 7, 0.16);
    const conePath = gg => {
      gg.beginPath();
      gg.moveTo(-CONE.w / 2 - 2, CONE.top - 2);
      gg.bezierCurveTo(-CONE.w * 0.36, CONE.top + (CONE.tip - CONE.top) * 0.42, -CONE.w * 0.15, CONE.tip - (CONE.tip - CONE.top) * 0.16, -2.6, CONE.tip - 3);
      gg.quadraticCurveTo(0, CONE.tip + 1.6, 2.6, CONE.tip - 3);
      gg.bezierCurveTo(CONE.w * 0.15, CONE.tip - (CONE.tip - CONE.top) * 0.16, CONE.w * 0.36, CONE.top + (CONE.tip - CONE.top) * 0.42, CONE.w / 2 + 2, CONE.top - 2);
      gg.quadraticCurveTo(0, CONE.top + 3.5, -CONE.w / 2 - 2, CONE.top - 2);
      gg.closePath();
    };
    wcWashPath(ctx, conePath, 0, (CONE.top + CONE.tip) / 2, 62, '#F4DFB8', '#C79C5E', { haloA: 0.2 });
    // 华夫网格(辐射线微弯 + 弧线, 手绘感)
    ctx.strokeStyle = 'rgba(120, 85, 40, 0.3)'; ctx.lineWidth = 1.3;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(k * 13, CONE.top);
      ctx.quadraticCurveTo(k * 8, (CONE.top + CONE.tip) / 2 + 5, 0, CONE.tip);
      ctx.stroke();
    }
    for (let hh = 0.32; hh <= 0.95; hh += 0.28) {
      const yy = CONE.top + (CONE.tip - CONE.top) * hh;
      const ww = CONE.w / 2 * (1 - hh);
      ctx.beginPath();
      ctx.moveTo(-ww, yy);
      ctx.quadraticCurveTo(0, yy + 7, ww, yy);
      ctx.stroke();
    }
    // 卷边(手绘微抖圆角条, 去硬描边)
    ctx.fillStyle = '#F6E4C0';
    wcRoundRect(ctx, -CONE.w / 2 - 4, CONE.top - 6, CONE.w + 8, 12, 5, 7, 0.55); ctx.fill();

    // 软雪糕(v566 卡片同款水彩层: 外晕→3段渐变→叠染→积色→高光白点)
    let y = CONE.top - 2;
    layers.forEach((L, i) => {
      const hh = 14 * L.h;
      const lw = Math.max(18, 66 - i * 4);
      const hi = lighten(L.color), lo = deepen(L.color);
      const mid = mixHex(hi, lo, 0.5);
      const cy = y - hh / 2;
      const rr = Math.max(lw / 2, hh / 2 + 2);
      const layerPath = gg => {
        // v570 手绘云朵层: 顶部双鼓弧 + 底部垂滴弧(替代方硬圆角矩形)
        gg.beginPath();
        gg.moveTo(-lw / 2, y - hh * 0.42);
        gg.bezierCurveTo(-lw * 0.46, y - hh - 6, -lw * 0.14, y - hh - 8, 0, y - hh + 1);
        gg.bezierCurveTo(lw * 0.14, y - hh - 8, lw * 0.46, y - hh - 6, lw / 2, y - hh * 0.42);
        gg.bezierCurveTo(lw * 0.54, y + 3, lw * 0.3, y + 6, lw * 0.17, y + 2.5);
        gg.bezierCurveTo(lw * 0.08, y + 8, -lw * 0.1, y + 7, -lw * 0.21, y + 2.5);
        gg.bezierCurveTo(-lw * 0.38, y + 6, -lw * 0.52, y + 3, -lw / 2, y - hh * 0.42);
        gg.closePath();
      };
      // 1) 外晕
      ctx.save();
      ctx.translate(0, cy); ctx.scale(1.08, 1.12); ctx.translate(0, -cy);
      layerPath(ctx);
      ctx.fillStyle = _wcRgba(hi, 0.2);
      ctx.fill();
      ctx.restore();
      // 2) 主体 3 段偏移径向渐变
      const lg = ctx.createRadialGradient(-lw * 0.24, y - hh * 0.86, 2, 0, cy, rr * 1.25);
      lg.addColorStop(0, hi);
      lg.addColorStop(0.55, mid);
      lg.addColorStop(1, lo);
      layerPath(ctx);
      ctx.fillStyle = lg;
      ctx.fill();
      // 3) 二层叠染
      ctx.save();
      ctx.translate(0, cy); ctx.scale(0.93, 0.93); ctx.translate(0, -cy);
      layerPath(ctx);
      ctx.fillStyle = _wcRgba(mid, 0.16);
      ctx.fill();
      ctx.restore();
      // 4) 边缘积色
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = _wcRgba(_wcDarken(lo, 0.28), 0.32);
      layerPath(ctx);
      ctx.stroke();
      // 5) 高光 + 白点
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.ellipse(-lw * 0.26, y - hh + 3, lw * 0.2, 3.5, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(-lw * 0.3, y - hh + 4, 1.8, 0, Math.PI * 2); ctx.fill();
      y -= hh;
    });
    // 顶部旋涡尖(软冰淇淋卷头, 手绘双弧)
    if (layers.length) {
      const last = layers[layers.length - 1];
      const topY = y + 2;
      ctx.strokeStyle = lighten(last.color);
      ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(1, topY);
      ctx.bezierCurveTo(7, topY - 4, 7, topY - 10, 1, topY - 10);
      ctx.bezierCurveTo(-5, topY - 10, -6, topY - 16, 1, topY - 17);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-2, topY - 3); ctx.quadraticCurveTo(3, topY - 7, -1, topY - 11); ctx.stroke();
    }
    ctx.restore();

    // 咬痕(白齿印闪烁)
    if (bite) {
      const a = 0.8 * (1 - bite.t);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#FFF7EC';
      ctx.beginPath(); ctx.arc(bite.x, bite.y, 10 + bite.t * 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(217,130,95,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bite.x, bite.y, 10 + bite.t * 4, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    // 碎屑
    bits.forEach(b => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, b.life * 1.6);
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.arc(b.x, b.y, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // 漂字
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= 0.007; f.y -= 0.35;
      if (f.life <= 0) { floats.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.font = '600 15px "LXGW WenKai", system-ui, sans-serif';
      ctx.fillStyle = f.color; ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(render);
  }
  render(performance.now());

  return {
    destroy() { cancelAnimationFrame(raf); },
  };
}



/* ---------- 游戏: 敲木鱼(功德 +1) ---------- */
/* ---------- 游戏: 敲木鱼(真实木纹 · 胡桃木 · 功德 +1) ---------- */
function buildWoodfish(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const FISH = { x: 280, y: 212, rx: 96, ry: 76 };
  let combo = 0, lastHit = 0;
  let swing = -1;             // 敲击动画 -1 待机
  let hitT = -1;
  const ripples = [];
  const merits = [];           // 功德漂字
  const motes = [];            // 禅意光尘
  let raf = 0;
  for (let i = 0; i < 18; i++) motes.push({ x: Math.random() * GAME_W, y: Math.random() * GAME_H, s: 0.8 + Math.random() * 1.8, ph: Math.random() * Math.PI * 2, v: 0.08 + Math.random() * 0.16 });

  function strike(e) {
    const now = performance.now();
    combo = (now - lastHit < 1800) ? combo + 1 : 1;
    lastHit = now;
    const gain = combo >= 3 ? combo : 1;
    swing = now;
    hitT = now;
    playSfx('game.muyu');
    ripples.push({ x: FISH.x, y: FISH.y - 10, r: 40, life: 1 });
    merits.push({
      x: FISH.x + (Math.random() - 0.5) * 90, y: FISH.y - FISH.ry - 16,
      text: combo >= 3 ? `功德 +${gain} ×${combo} 连击` : '功德 +1',
      big: combo >= 3, life: 1,
    });
  }
  stage.addEventListener('pointerdown', strike);

  const status = document.createElement('span');
  status.className = 'game-status';
  status.textContent = '点一下敲一下, 连着敲有功德暴击, 节奏随意';
  stage.appendChild(status);

  // v43: 鱼形轮廓(头朝左圆身, 尾在右), 木质雕刻木鱼
  function fishBodyPath(g) {
    g.beginPath();
    g.moveTo(-96, -4);
    g.bezierCurveTo(-86, -44, -34, -62, 22, -54);   // 头顶→背
    g.bezierCurveTo(56, -48, 76, -34, 84, -16);     // 背→尾柄上
    g.bezierCurveTo(66, -4, 66, 4, 84, 16);         // 尾柄内凹
    g.bezierCurveTo(76, 34, 56, 48, 22, 54);        // 腹
    g.bezierCurveTo(-34, 62, -86, 44, -96, 4);     // 腹→鼻尖
    g.closePath();
  }
  function fishTailPath(g) {
    g.beginPath();
    g.moveTo(74, -14);
    g.bezierCurveTo(96, -34, 102, -52, 124, -56);   // 上叶外缘
    g.bezierCurveTo(114, -32, 114, -12, 120, 0);    // 上叶内凹
    g.bezierCurveTo(114, 12, 114, 32, 124, 56);     // 下叶
    g.bezierCurveTo(102, 52, 96, 34, 74, 14);
    g.closePath();
  }
  // 木纹画笔: 裁剪在鱼身内的长木纹 + 鳞片弧 + 节疤 + 顶光
  function drawWoodGrain(g) {
    g.save();
    fishBodyPath(g); g.clip();
    // v566: 主体由 wcWashPath 渲染, 这里只画木纹/鳞片/节疤
    // 顺着鱼身的长木纹
    g.strokeStyle = 'rgba(58, 28, 10, 0.22)';
    g.lineWidth = 2; g.lineCap = 'round';
    [-30, -10, 10, 30].forEach(yy => {
      g.beginPath();
      g.moveTo(-84, yy);
      g.bezierCurveTo(-24, yy - 7, 26, yy + 7, 74, yy * 0.55);
      g.stroke();
    });
    // 一枚小节疤
    g.strokeStyle = 'rgba(58, 28, 10, 0.3)';
    g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(40, -30, 7, 4.5, 0.5, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(40, -30, 3.4, 2.1, 0.5, 0, Math.PI * 2); g.stroke();
    // 鳞片弧线(鱼身后半, 禅意克制)
    g.strokeStyle = 'rgba(52, 24, 8, 0.16)';
    g.lineWidth = 1.4;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const sx = -8 + c * 22, syy = -20 + r * 18;
      g.beginPath(); g.arc(sx, syy, 11, Math.PI * 0.12, Math.PI * 0.88); g.stroke();
    }
    // 顶部柔光(打磨过的反光)
    g.fillStyle = 'rgba(255, 232, 198, 0.2)';
    g.beginPath(); g.ellipse(-42, -34, 32, 10, -0.3, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  function drawMallet(now) {
    const t = swing < 0 ? 1 : Math.min(1, (now - swing) / 240);
    let ang;
    if (swing < 0) ang = 0.55;
    else if (t < 0.45) ang = 0.55 - (0.55 - 0.02) * (t / 0.45);
    else ang = 0.02 + 0.53 * Math.pow((t - 0.45) / 0.55, 2) * 1.0;
    const px = FISH.x + 138, py = FISH.y - 96;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang);
    // 柄(硬木, 渐变 + 木纹)
    const hg2 = ctx.createLinearGradient(0, 0, -108, 96);
    hg2.addColorStop(0, '#A97C4E');
    hg2.addColorStop(0.5, '#8A5C34');
    hg2.addColorStop(1, '#5E3A1E');
    ctx.strokeStyle = hg2;
    ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-108, 96); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,225,180,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-3, 3); ctx.lineTo(-104, 92); ctx.stroke();
    // 槌头(深胡桃木球, 带木纹弧)
    const hx = -108, hy = 96;
    const hg = ctx.createRadialGradient(hx - 6, hy - 7, 3, hx, hy, 21);
    hg.addColorStop(0, '#C08A52');
    hg.addColorStop(0.5, '#93582E');
    hg.addColorStop(1, '#5E3418');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(hx, hy, 19, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(40,18,8,0.35)';
    ctx.lineWidth = 1;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath(); ctx.ellipse(hx, hy, 19 - k * 4.5, 9 - k * 2, 0.3, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,236,210,0.4)';
    ctx.beginPath(); ctx.ellipse(hx - 6, hy - 8, 5, 3, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function render(time) {
    const now = performance.now();
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    // 禅意底色
    const bg = ctx.createRadialGradient(FISH.x, FISH.y - 30, 40, FISH.x, FISH.y, 330);
    bg.addColorStop(0, 'rgba(246, 226, 178, 0.42)');
    bg.addColorStop(1, 'rgba(238, 224, 196, 0.12)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    // 大光轮
    ctx.strokeStyle = 'rgba(214, 176, 96, 0.3)';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(FISH.x, FISH.y - 10, 158, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(214, 176, 96, 0.16)';
    ctx.beginPath(); ctx.arc(FISH.x, FISH.y - 10, 176, 0, Math.PI * 2); ctx.stroke();
    // v565 卡片同款水彩外晕(暖金 wash) + 装饰金星
    const wchalo = ctx.createRadialGradient(FISH.x, FISH.y - 12, 60, FISH.x, FISH.y - 12, 172);
    wchalo.addColorStop(0, 'rgba(226, 178, 96, 0.22)');
    wchalo.addColorStop(1, 'rgba(226, 178, 96, 0)');
    ctx.fillStyle = wchalo;
    ctx.beginPath(); ctx.arc(FISH.x, FISH.y - 12, 172, 0, Math.PI * 2); ctx.fill();
    wcSparkle(ctx, FISH.x - 132, FISH.y - 72, 7, '#F5D992', 0.8);
    wcSparkle(ctx, FISH.x + 118, FISH.y + 78, 5, '#F5D992', 0.6);
    // 光尘
    for (const m of motes) {
      m.y -= m.v;
      if (m.y < -4) { m.y = GAME_H + 4; m.x = Math.random() * GAME_W; }
      const a = 0.18 + 0.16 * Math.sin(time / 900 + m.ph);
      ctx.fillStyle = `rgba(226, 190, 110, ${a})`;
      ctx.beginPath(); ctx.arc(m.x + Math.sin(time / 1600 + m.ph) * 8, m.y, m.s, 0, Math.PI * 2); ctx.fill();
    }

    // 莲花垫(v43: 跟随鱼形底部)
    ctx.save();
    ctx.translate(FISH.x, FISH.y + 46);
    for (let k = -2; k <= 2; k++) {
      ctx.fillStyle = k === 0 ? 'rgba(214, 138, 150, 0.5)' : 'rgba(228, 168, 178, 0.42)';
      ctx.beginPath();
      ctx.ellipse(k * 34, -2 - Math.abs(k) * -3, 26, 12, k * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(196, 118, 132, 0.4)';
    ctx.beginPath(); ctx.ellipse(0, 6, 58, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 木鱼(受击压扁 + v43 鱼形木质: 头朝左/尾在右/背鳍胸鳍/鱼眼鳃线/长条音口)
    const knock = hitT > 0 ? Math.max(0, 1 - (now - hitT) / 150) : 0;
    let sy = 1;
    if (hitT > 0) {
      const k = (now - hitT) / 150;
      if (k < 1) sy = 1 - 0.13 * Math.sin(k * Math.PI);
      else hitT = -1;
    }
    ctx.save();
    ctx.translate(FISH.x, FISH.y);
    ctx.scale(1, sy);
    // 底部投影
    ctx.fillStyle = 'rgba(60, 30, 12, 0.25)';
    ctx.beginPath(); ctx.ellipse(2, 60, 92, 12, 0, 0, Math.PI * 2); ctx.fill();
    // 尾鳍(压在身后, v566 卡片水彩)
    wcWashPath(ctx, fishTailPath, 99, 0, 34, '#9A6435', '#5E3618', { haloA: 0.18 });
    ctx.strokeStyle = 'rgba(58, 28, 10, 0.35)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(80, -8); ctx.lineTo(110, -26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(80, 6); ctx.lineTo(110, 30); ctx.stroke();
    // 背鳍(v566 卡片水彩)
    const dorsalP = gg => {
      gg.beginPath();
      gg.moveTo(-8, -52);
      gg.bezierCurveTo(8, -80, 36, -80, 54, -46);
      gg.closePath();
    };
    wcWashPath(ctx, dorsalP, 23, -62, 26, '#96612F', '#5E3418', { haloA: 0.16, lw: 1.8 });
    // 胸鳍(v566 卡片水彩)
    const pectP = gg => {
      gg.beginPath();
      gg.moveTo(-36, 22);
      gg.bezierCurveTo(-22, 50, 4, 58, 22, 44);
      gg.bezierCurveTo(4, 38, -14, 28, -36, 22);
      gg.closePath();
    };
    wcWashPath(ctx, pectP, -8, 38, 30, '#9A6435', '#5E3418', { haloA: 0.16, lw: 1.8 });
    // 身体(v566 卡片同款水彩: 外晕→3段渐变→叠染→积色→层叠高光)
    wcWashPath(ctx, fishBodyPath, -8, 0, 98, '#C68E55', '#54280F', { haloA: 0.22 });
    // 木纹 + 鳞片 + 节疤(裁剪在鱼身内)
    drawWoodGrain(ctx);
    // 侧壁暗影(下腹厚度, v566 减淡配合卡片水彩; 轮廓由积色描边接管)
    ctx.save();
    fishBodyPath(ctx); ctx.clip();
    const side = ctx.createLinearGradient(0, 8, 0, 62);
    side.addColorStop(0, 'rgba(20,8,2,0)');
    side.addColorStop(1, 'rgba(20,8,2,0.3)');
    ctx.fillStyle = side;
    ctx.fillRect(-100, 8, 200, 56);
    ctx.restore();
    // 鱼眼(雕刻感: 深瞳 + 高光)
    ctx.fillStyle = '#2E1206';
    ctx.beginPath(); ctx.arc(-64, -16, 8.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(196, 130, 72, 0.6)';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(-64, -16, 8.5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#120600';
    ctx.beginPath(); ctx.arc(-62.5, -15, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 240, 210, 0.85)';
    ctx.beginPath(); ctx.arc(-66, -19, 1.7, 0, Math.PI * 2); ctx.fill();
    // 鳃线
    ctx.strokeStyle = 'rgba(40, 16, 6, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-52, -36);
    ctx.bezierCurveTo(-36, -8, -36, 14, -52, 34);
    ctx.stroke();
    // 嘴缝线(鼻尖微笑)
    ctx.strokeStyle = 'rgba(40, 16, 6, 0.45)';
    ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-94, 8);
    ctx.quadraticCurveTo(-84, 14, -74, 12);
    ctx.stroke();
    // 经典长条音口(开口内腔有真实深度)
    ctx.fillStyle = '#3A1508';
    roundRectPath(ctx, -30, -8, 88, 22, 11); ctx.fill();
    ctx.save();
    roundRectPath(ctx, -26, -5, 80, 16, 8); ctx.clip();
    const hole = ctx.createLinearGradient(0, -5, 0, 12);
    hole.addColorStop(0, 'rgba(10,4,1,0.95)');
    hole.addColorStop(0.55, 'rgba(24,10,4,0.9)');
    hole.addColorStop(1, 'rgba(52,24,10,0.85)');
    ctx.fillStyle = hole;
    ctx.fillRect(-26, -5, 80, 16);
    // 内腔下缘弧面反光(口内侧的木头)
    ctx.fillStyle = 'rgba(160,90,45,0.35)';
    ctx.beginPath(); ctx.ellipse(14, 9, 34, 5, 0, 0, Math.PI); ctx.fill();
    // 敲击闪光: 音口内亮一下
    if (knock > 0) {
      ctx.fillStyle = `rgba(255, 224, 160, ${knock * 0.5})`;
      ctx.fillRect(-26, -5, 80, 16);
    }
    ctx.restore();
    // 开口上唇高光(清漆反光)
    ctx.fillStyle = 'rgba(255, 236, 205, 0.4)';
    roundRectPath(ctx, -30, -9, 88, 5, 2.5); ctx.fill();
    // 开口轮廓
    ctx.strokeStyle = 'rgba(30, 12, 4, 0.6)'; ctx.lineWidth = 1.6;
    roundRectPath(ctx, -30, -8, 88, 22, 11); ctx.stroke();
    // 穹顶高光(清漆反光)
    ctx.fillStyle = 'rgba(255, 240, 214, 0.4)';
    ctx.beginPath(); ctx.ellipse(-40, -42, 28, 9, -0.38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 240, 214, 0.16)';
    ctx.beginPath(); ctx.ellipse(28, 30, 20, 6, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    drawMallet(now);

    // 涟漪
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.life -= 0.02; rp.r += 2.6;
      if (rp.life <= 0) { ripples.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(214, 170, 80, ${rp.life * 0.6})`;
      ctx.lineWidth = 2.5 * rp.life + 0.5;
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke();
    }
    // 功德漂字
    for (let i = merits.length - 1; i >= 0; i--) {
      const m = merits[i];
      m.life -= 0.0065; m.y -= 0.5;
      if (m.life <= 0) { merits.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, m.life * 2.2);
      ctx.font = `700 ${m.big ? 21 : 16}px "LXGW WenKai", system-ui, sans-serif`;
      const tg = ctx.createLinearGradient(0, m.y - 10, 0, m.y + 8);
      tg.addColorStop(0, m.big ? '#E8B23C' : '#C79A45');
      tg.addColorStop(1, '#8E6A24');
      ctx.fillStyle = tg;
      ctx.textAlign = 'center';
      ctx.fillText(m.text, m.x, m.y);
      ctx.restore();
    }
    // 连击倒计时提示
    if (combo > 0 && now - lastHit < 1800) {
      const k = 1 - (now - lastHit) / 1800;
      ctx.fillStyle = `rgba(150, 120, 60, ${0.3 + 0.2 * k})`;
      ctx.font = '600 12px "LXGW WenKai", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`连击中 ${combo}`, FISH.x, FISH.y + FISH.ry + 34);
    }
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(render);
  }
  render(performance.now());

  return {
    destroy() { cancelAnimationFrame(raf); stage.removeEventListener('pointerdown', strike); },
  };
}

/* ---------- 游戏: 精油蒸馏实验室(高级玻璃仪器: 三足架/圆底烧瓶/李比希冷凝管/接收瓶) ---------- */
const STILL_FLOWERS = {
  lavender:  { name: '薰衣草', color: '#9A6FD9', pale: 'rgba(154, 111, 217, 0.3)' },
  rose:      { name: '玫瑰',   color: '#F06FA6', pale: 'rgba(240, 111, 166, 0.3)' },
  chamomile: { name: '洋甘菊', color: '#E8C53A', pale: 'rgba(232, 197, 58, 0.32)' },
};

function buildStill(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const FLASK = { x: 150, y: 262, r: 52, neckW: 22, neckTop: 150 };
  const COND = { x0: 232, y0: 158, x1: 398, y1: 196 };   // 冷凝管两端
  const RECV = { x: 422, y: 228 };                        // 接收瓶中心(瓶口 y-22)
  const TIP  = { x: 422, y: 208 };                        // v45: 滴口正对接收瓶口
  let flower = 'lavender';
  let petals = [];
  let distilling = false;
  let drops = 0;
  let vialFill = 0;
  let lastDropAt = 0;
  let drip = null;
  const steams = [];
  const finished = [];
  const floats = [];
  const beads = [];            // v45: 沿导管流动的精油珠
  const sparks = [];           // v45: 星光粒子
  const motes = [];            // v45: 魔法光尘
  for (let i = 0; i < 14; i++) motes.push({
    x: Math.random() * GAME_W, y: 80 + Math.random() * 280,
    r: 0.8 + Math.random() * 1.8, sp: 6 + Math.random() * 14,
    ph: Math.random() * Math.PI * 2, warm: Math.random() > 0.5,
  });
  let lastBeadAt = 0;
  let lastRender = 0;
  let raf = 0;
  let lastSteam = 0;

  // v45: 导汽路径取样(瓶颈→汽管→冷凝管→出料弯头→滴口), t∈[0,1]
  function tubePoint(t) {
    const A  = { x: FLASK.x, y: FLASK.neckTop + 4 };
    const C1 = { x: FLASK.x + 34, y: 128 };
    const B0 = { x: COND.x0, y: COND.y0 };
    const B1 = { x: COND.x1, y: COND.y1 };
    const C2 = { x: 418, y: COND.y1 - 3 };
    const E  = { x: TIP.x, y: TIP.y - 14 };
    const q = (p0, c, p1, u) => ({
      x: (1 - u) * (1 - u) * p0.x + 2 * (1 - u) * u * c.x + u * u * p1.x,
      y: (1 - u) * (1 - u) * p0.y + 2 * (1 - u) * u * c.y + u * u * p1.y,
    });
    if (t < 0.28) return q(A, C1, B0, t / 0.28);
    if (t < 0.76) { const u = (t - 0.28) / 0.48; return { x: B0.x + (B1.x - B0.x) * u, y: B0.y + (B1.y - B0.y) * u }; }
    if (t < 0.9)  return q(B1, C2, E, (t - 0.76) / 0.14);
    const u = (t - 0.9) / 0.1;
    return { x: TIP.x, y: E.y + (TIP.y - E.y) * u };
  }

  function addPetal(type) {
    flower = type;
    petals.push({ type, x: FLASK.x + (Math.random() - 0.5) * 50, y: FLASK.y - 100, ty: FLASK.y + 6 + (Math.random() - 0.5) * 22, rot: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.06 });
    drops = 0; vialFill = 0; distilling = false;
    // v548: 放花瓣不再发声(用户要求去掉怪声)
  }

  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  const row = document.createElement('div');
  row.className = 'st-row';
  Object.keys(STILL_FLOWERS).forEach(key => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'st-chip' + (key === flower ? ' on' : '');
    chip.innerHTML = `<i class="st-dotc" style="--c:${STILL_FLOWERS[key].color}"></i>${STILL_FLOWERS[key].name}`;
    chip.addEventListener('click', e => {
      e.stopPropagation();
      row.querySelectorAll('.st-chip').forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      addPetal(key);
    });
    row.appendChild(chip);
  });
  const fireBtn = document.createElement('button');
  fireBtn.type = 'button';
  fireBtn.className = 'st-chip fire-chip';
  fireBtn.textContent = '点火 · 开始蒸馏';
  fireBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!petals.length) {
      floats.push({ x: 200, y: 120, text: '先放点花瓣进去呀', color: '#8A7FA8', life: 1 });
      return;
    }
    if (distilling) return;
    distilling = true;
    drops = 0; vialFill = 0; lastDropAt = performance.now();
    playSfx('game.distillBoil');
  });
  row.appendChild(fireBtn);
  tools.appendChild(row);
  stage.appendChild(tools);

  const status = document.createElement('span');
  status.className = 'game-status';
  status.textContent = '放花瓣, 点火, 看蒸汽爬过冷凝管, 一滴一滴接出精油';
  stage.appendChild(status);

  function drawPetal(g, type, x, y, rot, s) {
    const f = STILL_FLOWERS[type];
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.scale(s, s);
    g.fillStyle = f.color;
    if (type === 'lavender') {
      for (let k = 0; k < 4; k++) {
        g.beginPath(); g.ellipse(0, -8 + k * 5, 5 - k * 0.6, 3.4, 0, 0, Math.PI * 2); g.fill();
      }
    } else if (type === 'rose') {
      for (let k = 0; k < 3; k++) {
        g.beginPath(); g.ellipse(k * 4 - 4, k * 3 - 3, 5.5 - k, 3.4, k * 0.5, 0, Math.PI * 2); g.fill();
      }
    } else {
      for (let k = 0; k < 5; k++) {
        const a = k / 5 * Math.PI * 2;
        g.beginPath(); g.ellipse(Math.cos(a) * 4.4, Math.sin(a) * 4.4, 3.6, 1.8, a, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = '#FFF0C0';
      g.beginPath(); g.arc(0, 0, 2.6, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  // 玻璃小瓶(架子上的成品)
  function drawGlassVial(g, x, y, fill, col) {
    g.save();
    g.translate(x, y);
    // 瓶身(v566 卡片水彩玻璃: 外晕→3段→叠染→积色)
    const vialP = gg => {
      gg.beginPath();
      gg.moveTo(-13, -34); gg.lineTo(-13, 18);
      gg.quadraticCurveTo(-13, 30, 0, 30);
      gg.quadraticCurveTo(13, 30, 13, 18);
      gg.lineTo(13, -34);
      gg.closePath();
    };
    wcWashPath(g, vialP, 0, -2, 34, '#E4EEF8', '#B4CFE0', { hiA: 0.45, midA: 0.4, loA: 0.5, haloA: 0.18, lw: 1.6, edgeA: 0.45 });
    // 液体
    if (fill > 0) {
      const lh = 54 * fill;
      g.save();
      g.beginPath();
      g.moveTo(-13, -34); g.lineTo(-13, 18);
      g.quadraticCurveTo(-13, 30, 0, 30);
      g.quadraticCurveTo(13, 30, 13, 18);
      g.lineTo(13, -34); g.closePath(); g.clip();
      g.fillStyle = col;
      g.fillRect(-14, 30 - lh, 28, lh);
      g.fillStyle = 'rgba(255,255,255,0.25)';
      g.fillRect(-14, 30 - lh, 28, 3);
      g.restore();
    }
    // 瓶口
    g.fillStyle = 'rgba(200, 216, 228, 0.9)';
    roundRectPath(g, -15, -42, 30, 10, 3); g.fill();
    // 玻璃高光
    g.strokeStyle = 'rgba(255,255,255,0.75)';
    g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-8, -30); g.lineTo(-8, 12); g.stroke();
    g.restore();
  }

  // v43: 四角星芒(主页魔法瓶同款)
  function drawSparkle(g, x, y, s, a) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    g.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, a))})`;
    g.beginPath();
    g.moveTo(0, -10);
    g.bezierCurveTo(1.2, -3.5, 3.5, -1.2, 10, 0);
    g.bezierCurveTo(3.5, 1.2, 1.2, 3.5, 0, 10);
    g.bezierCurveTo(-1.2, 3.5, -3.5, 1.2, -10, 0);
    g.bezierCurveTo(-3.5, -1.2, -1.2, -3.5, 0, -10);
    g.closePath(); g.fill();
    g.restore();
  }

  function render(time) {
    const now = performance.now();
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    // 花瓣飘入烧瓶
    for (const p of petals) {
      if (p.y < p.ty) { p.y += 1.1; p.rot += p.spin; }
      drawPetal(ctx, p.type, p.x, p.y, p.rot, 1);
    }

    // 蒸馏推进(v45: 精油珠沿导管流动, 到滴口凝成液滴正落进接收瓶)
    const dt = Math.min(0.05, lastRender ? (now - lastRender) / 1000 : 0.016);
    lastRender = now;
    if (distilling && now - lastSteam > 230) {
      steams.push({ x: FLASK.x + (Math.random() - 0.5) * 30, y: FLASK.y - 20, life: 1, s: 2 + Math.random() * 3 });
      lastSteam = now;
    }
    if (distilling && now - lastBeadAt > 1250 && beads.length < 3) {
      beads.push({ t: 0 });
      lastBeadAt = now;
    }
    for (let i = beads.length - 1; i >= 0; i--) {
      beads[i].t += dt / 2.4;                     // 约 2.4s 流完全程
      if (beads[i].t >= 1) {
        beads.splice(i, 1);
        if (drops >= 5) {
          distilling = false;
          finished.push({ flower });
          if (finished.length > 3) finished.shift();
          floats.push({ x: RECV.x - 40, y: RECV.y - 70, text: `${STILL_FLOWERS[flower].name}精油 蒸好了 ✦`, color: STILL_FLOWERS[flower].color, life: 1.4 });
          playSfx('game.taichiChime');
        } else if (!drip) {
          drip = { y: TIP.y + 2, vy: 0 };
        }
      }
    }
    // 油滴下落(星光尾迹, 落瓶溅星)
    if (drip) {
      drip.vy += 0.5; drip.y += drip.vy;
      if (Math.random() < 0.4) sparks.push({ x: TIP.x + (Math.random() - 0.5) * 3, y: drip.y - 6, vy: -0.3 - Math.random() * 0.4, life: 0.6, s: 0.45 + Math.random() * 0.35 });
      if (drip.y >= RECV.y - 4) {
        drip = null;
        drops++;
        vialFill = drops / 5;
        playSfx('game.distillDrop');
        for (let k = 0; k < 5; k++) sparks.push({ x: TIP.x + (Math.random() - 0.5) * 16, y: RECV.y - 12 + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 1.2, vy: -0.4 - Math.random() * 0.8, life: 0.9, s: 0.5 + Math.random() * 0.6 });
      }
    }

    // 背景(实验室暖光)
    const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
    bg.addColorStop(0, 'rgba(240, 244, 246, 0.7)');
    bg.addColorStop(1, 'rgba(246, 238, 226, 0.75)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, GAME_W, GAME_H);
    // v45: 魔法极光(紫/青双层呼吸辉光)
    const au = 0.5 + 0.5 * Math.sin(now / 2600);
    let agl = ctx.createRadialGradient(120, 130, 10, 120, 130, 250);
    agl.addColorStop(0, `rgba(168, 128, 240, ${0.10 + au * 0.09})`);
    agl.addColorStop(1, 'rgba(168, 128, 240, 0)');
    // v570: 全画布填充(渐变本身衰减到 0, 不再被矩形硬切出边界)
    ctx.fillStyle = agl; ctx.fillRect(0, 0, GAME_W, GAME_H);
    agl = ctx.createRadialGradient(432, 105, 10, 432, 105, 235);
    agl.addColorStop(0, `rgba(110, 200, 220, ${0.10 + (1 - au) * 0.09})`);
    agl.addColorStop(1, 'rgba(110, 200, 220, 0)');
    ctx.fillStyle = agl; ctx.fillRect(0, 0, GAME_W, GAME_H);
    // 桌面光晕
    const tbl = ctx.createRadialGradient(210, 330, 20, 210, 330, 260);
    tbl.addColorStop(0, 'rgba(255, 244, 220, 0.5)');
    tbl.addColorStop(1, 'rgba(255, 244, 220, 0)');
    ctx.fillStyle = tbl; ctx.fillRect(0, 0, GAME_W, GAME_H);
    // v45: 魔法光尘(缓缓上浮 + 闪烁)
    for (const m of motes) {
      m.y -= m.sp * dt; m.ph += dt;
      if (m.y < 70) { m.y = 348; m.x = Math.random() * GAME_W; }
      const a = 0.22 + 0.22 * Math.sin(m.ph * 2.2);
      const col = m.warm ? '214, 178, 255' : '133, 196, 238';
      ctx.fillStyle = `rgba(${col}, ${a})`;
      ctx.beginPath(); ctx.arc(m.x + Math.sin(m.ph) * 8, m.y, m.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${a * 0.45})`;
      ctx.beginPath(); ctx.arc(m.x + Math.sin(m.ph) * 8, m.y, m.r * 0.4, 0, Math.PI * 2); ctx.fill();
    }

    // ---- 实验台(木) ----
    const bench = ctx.createLinearGradient(0, 352, 0, GAME_H);
    bench.addColorStop(0, '#C9A06C');
    bench.addColorStop(1, '#A87E52');
    ctx.fillStyle = bench;
    roundRectPath(ctx, 0, 352, GAME_W, GAME_H - 352, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(90, 60, 30, 0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 352); ctx.lineTo(GAME_W, 352); ctx.stroke();
    ctx.strokeStyle = 'rgba(90, 60, 30, 0.18)';
    for (let k = 1; k < 3; k++) {
      ctx.beginPath(); ctx.moveTo(0, 352 + k * 15); ctx.lineTo(GAME_W, 352 + k * 15); ctx.stroke();
    }

    // ---- 三足架 ----
    // 底座
    ctx.fillStyle = 'rgba(50, 56, 66, 0.85)';
    ctx.beginPath(); ctx.ellipse(118, 368, 52, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6A7280';
    ctx.beginPath(); ctx.ellipse(118, 365, 50, 8, 0, 0, Math.PI * 2); ctx.fill();
    // 立杆
    const rod = ctx.createLinearGradient(96, 0, 106, 0);
    rod.addColorStop(0, '#8A94A2');
    rod.addColorStop(0.5, '#C6CDD6');
    rod.addColorStop(1, '#7A8494');
    ctx.fillStyle = rod;
    roundRectPath(ctx, 97, 118, 9, 248, 4); ctx.fill();
    // 夹持臂(抱瓶口)
    ctx.strokeStyle = '#6A7280'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(101, 148); ctx.lineTo(FLASK.x - FLASK.neckW / 2 - 6, 148); ctx.stroke();
    ctx.strokeStyle = '#9AA4B2'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(101, 148); ctx.lineTo(FLASK.x - FLASK.neckW / 2 - 6, 148); ctx.stroke();
    // 夹爪
    ctx.strokeStyle = '#8A94A2'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(FLASK.x - FLASK.neckW / 2 - 7, 143);
    ctx.quadraticCurveTo(FLASK.x - FLASK.neckW / 2 - 12, 148, FLASK.x - FLASK.neckW / 2 - 7, 153);
    ctx.moveTo(FLASK.x + FLASK.neckW / 2 + 7, 143);
    ctx.quadraticCurveTo(FLASK.x + FLASK.neckW / 2 + 12, 148, FLASK.x + FLASK.neckW / 2 + 7, 153);
    ctx.stroke();

    // ---- 酒精灯 ----
    const lampG = ctx.createLinearGradient(0, 326, 0, 352);
    lampG.addColorStop(0, '#E8DCC0');
    lampG.addColorStop(1, '#BFAF8E');
    ctx.fillStyle = lampG;
    roundRectPath(ctx, 132, 326, 36, 22, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(90, 70, 40, 0.5)'; ctx.lineWidth = 1.4;
    roundRectPath(ctx, 132, 326, 36, 22, 5); ctx.stroke();
    // 灯芯
    ctx.strokeStyle = '#8A7A5C'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(150, 326); ctx.lineTo(150, 320); ctx.stroke();
    if (distilling) {
      // 蓝色酒精灯焰(外紫内蓝芯橙, v45 加魔法紫晕)
      const fw = 5 + Math.sin(now / 70) * 1.5;
      const fh = 24 + Math.sin(now / 90) * 3;
      const fh2 = ctx.createRadialGradient(150, 312, 3, 150, 312, 36);
      fh2.addColorStop(0, 'rgba(178, 132, 255, 0.38)');
      fh2.addColorStop(1, 'rgba(178, 132, 255, 0)');
      ctx.fillStyle = fh2;
      ctx.beginPath(); ctx.arc(150, 312, 36, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(150, 140, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(150 - fw, 320);
      ctx.quadraticCurveTo(150 - fw - 3, 320 - fh * 0.6, 150, 320 - fh);
      ctx.quadraticCurveTo(150 + fw + 3, 320 - fh * 0.6, 150 + fw, 320);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255, 190, 80, 0.95)';
      ctx.beginPath();
      ctx.moveTo(150 - fw * 0.4, 320);
      ctx.quadraticCurveTo(150 - fw * 0.4 - 1, 320 - fh * 0.45, 150, 320 - fh * 0.55);
      ctx.quadraticCurveTo(150 + fw * 0.4 + 1, 320 - fh * 0.45, 150 + fw * 0.4, 320);
      ctx.closePath(); ctx.fill();
      // 焰尖偶尔迸出星光
      if (Math.random() < 0.1) sparks.push({ x: 150 + (Math.random() - 0.5) * 10, y: 300, vy: -0.5 - Math.random() * 0.4, life: 0.7, s: 0.4 + Math.random() * 0.35 });
    }

    // v565 卡片同款水彩外晕(烧瓶 + 接收瓶)
    const stHalo = ctx.createRadialGradient(FLASK.x, FLASK.y, 30, FLASK.x, FLASK.y, 120);
    stHalo.addColorStop(0, 'rgba(178, 158, 240, 0.18)');
    stHalo.addColorStop(1, 'rgba(178, 158, 240, 0)');
    ctx.fillStyle = stHalo;
    ctx.beginPath(); ctx.arc(FLASK.x, FLASK.y, 120, 0, Math.PI * 2); ctx.fill();
    const rvHalo = ctx.createRadialGradient(RECV.x, RECV.y, 16, RECV.x, RECV.y, 66);
    rvHalo.addColorStop(0, 'rgba(128, 205, 226, 0.16)');
    rvHalo.addColorStop(1, 'rgba(128, 205, 226, 0)');
    ctx.fillStyle = rvHalo;
    ctx.beginPath(); ctx.arc(RECV.x, RECV.y, 66, 0, Math.PI * 2); ctx.fill();

    // ---- 圆底烧瓶(v43: 主页魔法瓶质感: 紫青玻璃/钻石切面/星芒/宝珠瓶塞) ----
    const fcol = STILL_FLOWERS[flower];
    // 宝珠瓶塞光晕
    const orbY = FLASK.neckTop - 18;
    const orbHalo = ctx.createRadialGradient(FLASK.x, orbY, 2, FLASK.x, orbY, 26);
    orbHalo.addColorStop(0, 'rgba(220, 200, 255, ' + (distilling ? 0.6 : 0.3) + ')');
    orbHalo.addColorStop(1, 'rgba(220, 200, 255, 0)');
    ctx.fillStyle = orbHalo;
    ctx.beginPath(); ctx.arc(FLASK.x, orbY, 26, 0, Math.PI * 2); ctx.fill();
    // 玻璃底色(淡紫青, 贴形裁剪)
    ctx.save();
    ctx.beginPath();
    ctx.arc(FLASK.x, FLASK.y, FLASK.r - 2, 0, Math.PI * 2);
    ctx.clip();
    // v566 卡片同款 3 段偏移径向渐变(玻璃底, 透)
    const gg = ctx.createRadialGradient(FLASK.x - FLASK.r * 0.24, FLASK.y - FLASK.r * 0.3, FLASK.r * 0.1, FLASK.x, FLASK.y, FLASK.r * 1.12);
    gg.addColorStop(0, 'rgba(246, 242, 254, 0.52)');
    gg.addColorStop(0.55, 'rgba(220, 230, 246, 0.28)');
    gg.addColorStop(1, 'rgba(178, 192, 228, 0.44)');
    ctx.fillStyle = gg;
    ctx.fillRect(FLASK.x - FLASK.r, FLASK.y - FLASK.r, FLASK.r * 2, FLASK.r * 2);
    // 液体(花色渐变 + 弯月面)
    const wob = distilling ? Math.sin(now / 140) * 1.6 : 0;
    const lq = ctx.createLinearGradient(FLASK.x, FLASK.y + 16, FLASK.x, FLASK.y + FLASK.r);
    if (petals.length) {
      lq.addColorStop(0, fcol.pale);
      lq.addColorStop(1, fcol.color);
    } else {
      lq.addColorStop(0, 'rgba(170, 205, 230, 0.22)');
      lq.addColorStop(1, 'rgba(140, 170, 210, 0.35)');
    }
    ctx.fillStyle = lq;
    ctx.beginPath();
    ctx.ellipse(FLASK.x, FLASK.y + 16 + wob, FLASK.r + 8, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    // 液体内部辉光
    const ig = ctx.createRadialGradient(FLASK.x, FLASK.y + 22, 2, FLASK.x, FLASK.y + 22, 30);
    ig.addColorStop(0, 'rgba(255,255,255,0.32)');
    ig.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.arc(FLASK.x, FLASK.y + 22, 30, 0, Math.PI * 2); ctx.fill();
    // 液面高光弧(白月牙)
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.ellipse(FLASK.x, FLASK.y + 16 + wob, FLASK.r - 8, 20, 0, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    // 上升气泡(常驻 + 蒸馏时更密)
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const nbub = distilling ? 7 : 4;
    for (let k = 0; k < nbub; k++) {
      const bt = (now / 1400 + k * 0.37) % 1;
      const bx = FLASK.x + Math.sin(k * 2.4 + now / 500) * (18 + k * 2);
      const by = FLASK.y + 44 - bt * 46;
      ctx.beginPath(); ctx.arc(bx, by, 1.4 + (k % 3) * 0.6, 0, Math.PI * 2); ctx.fill();
    }
    // 钻石切面(六边形刻面, 相邻微差明度)
    const cfx = FLASK.x, cfy = FLASK.y, cfr = FLASK.r - 4;
    const vs = [];
    for (let k = 0; k < 6; k++) {
      const aa = -Math.PI / 2 + k * Math.PI / 3;
      vs.push([cfx + Math.cos(aa) * cfr, cfy + Math.sin(aa) * cfr]);
    }
    ctx.fillStyle = '#ffffff';
    for (let k = 0; k < 6; k++) {
      const v1 = vs[k], v2 = vs[(k + 1) % 6];
      ctx.globalAlpha = k % 2 ? 0.1 : 0.05;
      ctx.beginPath();
      ctx.moveTo(cfx, cfy); ctx.lineTo(v1[0], v1[1]); ctx.lineTo(v2[0], v2[1]);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // 刻面棱线(锐利)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1;
    for (let k = 0; k < 6; k++) {
      ctx.beginPath(); ctx.moveTo(cfx, cfy); ctx.lineTo(vs[k][0], vs[k][1]); ctx.stroke();
    }
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) {
      const v = vs[k % 6];
      k ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]);
    }
    ctx.stroke();
    ctx.restore();
    // 边缘聚光(玻璃厚度, v566 手绘水彩描边)
    ctx.strokeStyle = 'rgba(150, 180, 214, 0.55)'; ctx.lineWidth = 3;
    wcCirclePath(ctx, FLASK.x, FLASK.y, FLASK.r, FLASK.r, 4, 0.7); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(FLASK.x, FLASK.y, FLASK.r - 9, Math.PI * 1.1, Math.PI * 1.5); ctx.stroke();
    ctx.strokeStyle = 'rgba(191, 216, 245, 0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(FLASK.x, FLASK.y, FLASK.r - 8, Math.PI * 0.05, Math.PI * 0.6); ctx.stroke();
    // 刻面星芒(钻石闪光, 轻微闪烁)
    drawSparkle(ctx, cfx - cfr * 0.62, cfy - cfr * 0.5, 0.5, 0.5 + 0.3 * Math.sin(now / 500));
    drawSparkle(ctx, cfx + cfr * 0.66, cfy - cfr * 0.28, 0.36, 0.4 + 0.3 * Math.sin(now / 700 + 2));
    // 瓶颈(玻璃管)
    ctx.fillStyle = 'rgba(215, 232, 245, 0.35)';
    roundRectPath(ctx, FLASK.x - FLASK.neckW / 2, FLASK.neckTop, FLASK.neckW, FLASK.y - FLASK.r - FLASK.neckTop + 8, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(130, 168, 198, 0.85)'; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(FLASK.x - FLASK.neckW / 2, FLASK.neckTop); ctx.lineTo(FLASK.x - FLASK.neckW / 2, FLASK.y - FLASK.r + 6);
    ctx.moveTo(FLASK.x + FLASK.neckW / 2, FLASK.neckTop); ctx.lineTo(FLASK.x + FLASK.neckW / 2, FLASK.y - FLASK.r + 6);
    ctx.stroke();
    // 瓶口磨口(接地接头)
    ctx.strokeStyle = 'rgba(110, 145, 175, 0.6)'; ctx.lineWidth = 2;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(FLASK.x - FLASK.neckW / 2, FLASK.neckTop + 5 + k * 7);
      ctx.lineTo(FLASK.x + FLASK.neckW / 2, FLASK.neckTop + 5 + k * 7);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(FLASK.x - 6, FLASK.neckTop + 3); ctx.lineTo(FLASK.x - 6, FLASK.y - FLASK.r + 4); ctx.stroke();
    // 水晶宝珠瓶塞(磨口顶端, 蒸馏时发光)
    const neckCap = ctx.createLinearGradient(FLASK.x - 9, 0, FLASK.x + 9, 0);
    neckCap.addColorStop(0, 'rgba(246, 242, 254, 0.7)');
    neckCap.addColorStop(0.5, 'rgba(224, 234, 250, 0.4)');
    neckCap.addColorStop(1, 'rgba(246, 242, 254, 0.7)');
    ctx.fillStyle = neckCap;
    roundRectPath(ctx, FLASK.x - 9, orbY + 6, 18, 12, 3); ctx.fill();
    const orbG2 = ctx.createRadialGradient(FLASK.x - 4, orbY - 5, 2, FLASK.x, orbY, 12);
    orbG2.addColorStop(0, '#FFFFFF');
    orbG2.addColorStop(0.4, '#E4D6FA');
    orbG2.addColorStop(1, '#A88CD8');
    ctx.fillStyle = orbG2;
    ctx.beginPath(); ctx.arc(FLASK.x, orbY, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath(); ctx.ellipse(FLASK.x - 3, orbY - 4, 3, 1.8, -0.5, 0, Math.PI * 2); ctx.fill();
    drawSparkle(ctx, FLASK.x + 5, orbY - 5, 0.3, 0.6 + 0.35 * Math.sin(now / 460));

    // ---- 导汽弯管(磨口玻璃) ----
    ctx.strokeStyle = 'rgba(130, 168, 198, 0.85)'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(FLASK.x, FLASK.neckTop + 4);
    ctx.quadraticCurveTo(FLASK.x + 34, 128, COND.x0, COND.y0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(225, 240, 250, 0.75)'; ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(FLASK.x, FLASK.neckTop + 4);
    ctx.quadraticCurveTo(FLASK.x + 34, 128, COND.x0, COND.y0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(FLASK.x + 3, FLASK.neckTop + 8);
    ctx.quadraticCurveTo(FLASK.x + 34, 130, COND.x0 - 6, COND.y0 - 2);
    ctx.stroke();

    // ---- 李比希冷凝管 ----
    const ca = Math.atan2(COND.y1 - COND.y0, COND.x1 - COND.x0);
    const cLen = Math.hypot(COND.x1 - COND.x0, COND.y1 - COND.y0);
    ctx.save();
    ctx.translate(COND.x0, COND.y0);
    ctx.rotate(ca);
    // 外套管(玻璃)
    const jg = ctx.createLinearGradient(0, -14, 0, 14);
    jg.addColorStop(0, 'rgba(228, 240, 250, 0.5)');
    jg.addColorStop(0.5, 'rgba(206, 226, 242, 0.28)');
    jg.addColorStop(1, 'rgba(228, 240, 250, 0.5)');
    ctx.fillStyle = jg;
    wcRoundRect(ctx, 0, -13, cLen, 26, 13, 5, 0.8); ctx.fill();
    ctx.strokeStyle = 'rgba(130, 168, 198, 0.85)'; ctx.lineWidth = 2.6;
    wcRoundRect(ctx, 0, -13, cLen, 26, 13, 5, 0.8); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.2;
    wcRoundRect(ctx, 2, -10, cLen - 4, 20, 10, 5, 0.7); ctx.stroke();
    // 冷却水进出管
    ctx.strokeStyle = '#7BA7C4'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(10, -13); ctx.lineTo(8, -28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cLen - 10, -13); ctx.lineTo(cLen - 8, -28); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(9, -15); ctx.lineTo(8, -26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cLen - 10, -15); ctx.lineTo(cLen - 8, -26); ctx.stroke();
    // 内盘管(蒸汽通道)
    ctx.strokeStyle = 'rgba(150, 186, 212, 0.9)'; ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(cLen - 4, 0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2;
    for (let k = 0; k < 8; k++) {
      ctx.beginPath();
      ctx.arc(12 + k * ((cLen - 26) / 7), 0, 7, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.restore();
    // ---- 出料弯头 + 锥形滴口(v45: 正对接收瓶口, 玻璃弯管下探) ----
    ctx.strokeStyle = 'rgba(130, 168, 198, 0.85)'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(COND.x1, COND.y1);
    ctx.quadraticCurveTo(418, COND.y1 - 3, TIP.x, TIP.y - 14);
    ctx.lineTo(TIP.x, TIP.y - 3);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(228, 242, 251, 0.8)'; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(COND.x1, COND.y1);
    ctx.quadraticCurveTo(418, COND.y1 - 3, TIP.x, TIP.y - 14);
    ctx.lineTo(TIP.x, TIP.y - 3);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(COND.x1 + 2, COND.y1 - 2);
    ctx.quadraticCurveTo(418, COND.y1 - 5, TIP.x - 1.5, TIP.y - 12);
    ctx.stroke();
    // 锥形滴口
    ctx.fillStyle = 'rgba(130, 168, 198, 0.95)';
    ctx.beginPath();
    ctx.moveTo(TIP.x - 5, TIP.y - 7);
    ctx.lineTo(TIP.x + 5, TIP.y - 7);
    ctx.lineTo(TIP.x + 1.6, TIP.y + 2);
    ctx.lineTo(TIP.x - 1.6, TIP.y + 2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(TIP.x - 3, TIP.y - 5); ctx.lineTo(TIP.x - 1, TIP.y); ctx.stroke();

    // ---- v45: 精油珠沿导管流动(金色辉光 + 拖尾, 液体流动可见) ----
    for (const b of beads) {
      for (let k = 0; k < 4; k++) {
        const tt = b.t - k * 0.035;
        if (tt <= 0) break;
        const p = tubePoint(tt);
        const al = (1 - k / 4) * 0.9;
        const rg = ctx.createRadialGradient(p.x, p.y, 0.5, p.x, p.y, 6);
        rg.addColorStop(0, `rgba(255, 248, 220, ${al})`);
        rg.addColorStop(0.45, `rgba(245, 217, 146, ${al * 0.8})`);
        rg.addColorStop(1, 'rgba(245, 217, 146, 0)');
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(p.x, p.y, 6 - k * 0.9, 0, Math.PI * 2); ctx.fill();
      }
    }

    // ---- 接收瓶(梨形) ----
    ctx.save();
    ctx.translate(RECV.x, RECV.y);
    // 小底座
    ctx.fillStyle = 'rgba(120, 96, 66, 0.5)';
    ctx.beginPath(); ctx.ellipse(0, 30, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    // 瓶身(梨形玻璃, v566 卡片水彩: 外晕→3段→叠染→积色)
    const pearP = gg => {
      gg.beginPath();
      gg.moveTo(-10, -16);
      gg.quadraticCurveTo(-16, 4, -11, 20);
      gg.quadraticCurveTo(0, 32, 11, 20);
      gg.quadraticCurveTo(16, 4, 10, -16);
      gg.closePath();
    };
    wcWashPath(ctx, pearP, 0, 6, 24, '#DCEAF6', '#A9C6DC', { hiA: 0.5, midA: 0.35, loA: 0.45, haloA: 0.18, lw: 2.2, edgeA: 0.5 });
    // 液体
    if (vialFill > 0) {
      const lh = 34 * vialFill;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-10, -16);
      ctx.quadraticCurveTo(-16, 4, -11, 20);
      ctx.quadraticCurveTo(0, 32, 11, 20);
      ctx.quadraticCurveTo(16, 4, 10, -16);
      ctx.closePath(); ctx.clip();
      ctx.fillStyle = fcol.color;
      ctx.fillRect(-18, 24 - lh, 36, lh);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(-18, 24 - lh, 36, 2.4);
      ctx.restore();
    }
    // 瓶口 + 玻璃高光
    ctx.strokeStyle = 'rgba(130, 168, 198, 0.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(-4, -22);
    ctx.moveTo(4, -16); ctx.lineTo(4, -22);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-9, 8); ctx.stroke();
    // v43: 钻石切面微光(左侧亮刻面/右侧暗刻面)
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.12;
    ctx.beginPath(); ctx.moveTo(-3, -14); ctx.lineTo(-11, 4); ctx.lineTo(-2, 2); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.07;
    ctx.beginPath(); ctx.moveTo(4, -10); ctx.lineTo(10, 8); ctx.lineTo(2, 6); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    // v43: 满瓶时精油辉光 + 星芒(魔法瓶点睛)
    if (vialFill >= 1) {
      const rg = ctx.createRadialGradient(0, 20, 2, 0, 20, 26);
      rg.addColorStop(0, fcol.pale);
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(0, 20, 26, 0, Math.PI * 2); ctx.fill();
      drawSparkle(ctx, -7, -6, 0.3, 0.5 + 0.35 * Math.sin(now / 420));
      drawSparkle(ctx, 7, 10, 0.22, 0.4 + 0.3 * Math.sin(now / 560 + 1.5));
    }
    // v45: 蒸馏中瓶口迎滴的柔光
    if (distilling || drip) {
      const mg = ctx.createRadialGradient(0, -20, 2, 0, -20, 16);
      mg.addColorStop(0, 'rgba(245, 217, 146, 0.35)');
      mg.addColorStop(1, 'rgba(245, 217, 146, 0)');
      ctx.fillStyle = mg;
      ctx.beginPath(); ctx.arc(0, -20, 16, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // 蒸汽(沿瓶口→弯管爬升)
    for (let i = steams.length - 1; i >= 0; i--) {
      const s = steams[i];
      s.life -= 0.008; s.y -= 0.85; s.x += Math.sin(now / 400 + i) * 0.4 + 0.7; s.s += 0.14;
      if (s.life <= 0) { steams.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(240, 248, 252, ${s.life * 0.4})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill();
    }
    // 油滴(v45: 金色精油 + 微光, 从滴口正落入瓶口)
    if (drip) {
      const dg = ctx.createRadialGradient(TIP.x - 1, drip.y - 1, 0.5, TIP.x, drip.y, 6);
      dg.addColorStop(0, '#FBE9B8');
      dg.addColorStop(0.55, '#F5D98F');
      dg.addColorStop(1, '#C8922E');
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.moveTo(TIP.x, drip.y - 7);
      ctx.quadraticCurveTo(TIP.x + 4.5, drip.y - 1, TIP.x, drip.y + 4.5);
      ctx.quadraticCurveTo(TIP.x - 4.5, drip.y - 1, TIP.x, drip.y - 7);
      ctx.fill();
      const dgl = ctx.createRadialGradient(TIP.x, drip.y, 1, TIP.x, drip.y, 10);
      dgl.addColorStop(0, 'rgba(245, 217, 146, 0.38)');
      dgl.addColorStop(1, 'rgba(245, 217, 146, 0)');
      ctx.fillStyle = dgl;
      ctx.beginPath(); ctx.arc(TIP.x, drip.y, 10, 0, Math.PI * 2); ctx.fill();
    }

    // v45: 星光粒子(油滴尾迹 / 落瓶迸溅 / 焰尖星屑)
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= dt * 1.5;
      s.x += s.vx || 0; s.y += s.vy || 0;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      drawSparkle(ctx, s.x, s.y, s.s, Math.min(1, s.life));
    }

    // 架子上的成品(右下木架)
    ctx.save();
    ctx.translate(0, 0);
    const shg = ctx.createLinearGradient(0, 318, 0, 330);
    shg.addColorStop(0, '#D9B184');
    shg.addColorStop(1, '#B78D5C');
    ctx.fillStyle = shg;
    roundRectPath(ctx, 424, 318, 128, 12, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(90, 60, 30, 0.3)'; ctx.lineWidth = 1.2;
    roundRectPath(ctx, 424, 318, 128, 12, 4); ctx.stroke();
    finished.forEach((it, i) => {
      drawGlassVial(ctx, 452 + i * 40, 306, 0.82, STILL_FLOWERS[it.flower].color);
      ctx.font = '600 10px "LXGW WenKai", system-ui, sans-serif';
      ctx.fillStyle = '#8A7FA8';
      ctx.textAlign = 'center';
      ctx.fillText(STILL_FLOWERS[it.flower].name, 452 + i * 40, 344);
    });
    ctx.restore();

    // 漂字
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= 0.006; f.y -= 0.4;
      if (f.life <= 0) { floats.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life);
      ctx.font = '600 15px "LXGW WenKai", system-ui, sans-serif';
      ctx.fillStyle = f.color; ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(render);
  }
  render(performance.now());

  return {
    destroy() { cancelAnimationFrame(raf); },
  };
}


/* ---------- 游戏: 开汽水(拧盖 啵~ 一口喝掉) ---------- */
function buildSoda(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const NECK = { x: 280, y: 100 };   // 瓶口中心(拧盖轴心)
  let phase = 'sealed';             // sealed | opened | empty
  let twist = 0;                     // 已拧角度(累积绝对值)
  let lastAng = null;
  let grab = false;
  let capFly = null;                // 瓶盖飞出动画
  let foamT = 0;                     // 涌沫进度
  const foams = [];                  // 泡沫粒子
  const fizzers = [];                // 瓶内气泡
  let drink = 0.82;                   // 液面
  const floats = [];
  let raf = 0;
  let lastFizz = 0;
  for (let i = 0; i < 18; i++) fizzers.push({ x: Math.random(), y: Math.random(), v: 0.12 + Math.random() * 0.3, s: 0.7 + Math.random() * 1.5 });

  // 经典玻璃可乐瓶轮廓(contour bottle: 长颈 + 圆肩 + 腰线 + 底部褶边)
  function bottlePath(g) {
    g.beginPath();
    g.moveTo(270, 90);
    g.lineTo(270, 103);
    g.lineTo(266, 112);                            // 瓶口环
    g.quadraticCurveTo(268, 130, 271, 142);        // 瓶颈(微收)
    g.bezierCurveTo(271, 172, 234, 184, 232, 204); // 左肩
    g.bezierCurveTo(230, 244, 236, 262, 241, 280); // 上腰
    g.bezierCurveTo(246, 300, 252, 320, 258, 334); // 下扩
    g.quadraticCurveTo(260, 344, 263, 348);        // 褶边左下
    g.lineTo(297, 348);                            // 瓶底
    g.quadraticCurveTo(300, 344, 302, 334);        // 褶边右下
    g.bezierCurveTo(308, 320, 314, 300, 319, 280); // 右下扩
    g.bezierCurveTo(324, 262, 330, 244, 328, 204); // 右上腰
    g.bezierCurveTo(326, 184, 289, 172, 289, 142); // 右肩
    g.quadraticCurveTo(292, 130, 294, 112);        // 瓶颈右
    g.lineTo(290, 103);
    g.lineTo(290, 90);
    g.closePath();
  }

  const onDown = e => {
    if (e.target !== cv) return;
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    if (phase === 'sealed' && Math.hypot(p.x - NECK.x, p.y - NECK.y) < 66) {
      grab = true;
      lastAng = Math.atan2(p.y - NECK.y, p.x - NECK.x);
    } else if (phase === 'opened' && foamT >= 1 && p.x > 220 && p.x < 340 && p.y > 140 && p.y < 350) {
      // 喝一口
      drink = Math.max(0, drink - 0.3);
      playSfx('game.drinkGulp');
      floats.push({ x: 280, y: 200, text: ['咕嘟~', '透心凉~', '爽!'][Math.floor(Math.random() * 3)], color: '#4E8FBF', life: 1 });
      if (drink <= 0.001) {
        phase = 'empty';
        floats.push({ x: 280, y: 168, text: '喝完了! 再来一瓶 ↻', color: '#4E8FBF', life: 1.6 });
        status.textContent = '喝完了! 点瓶子再来一瓶';
      }
    } else if (phase === 'empty' && p.x > 220 && p.x < 340) {
      // 再来一瓶
      phase = 'sealed'; twist = 0; capFly = null; foams.length = 0; foamT = 0; drink = 0.82;
      playSfx('game.sodaOpen');
      floats.push({ x: 280, y: 168, text: '新的一瓶!', color: '#4E8FBF', life: 1 });
      status.textContent = '按住瓶盖, 画圈拧开, 然后点瓶子喝掉';
    }
  };
  const onMove = e => {
    if (!grab) return;
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    const a = Math.atan2(p.y - NECK.y, p.x - NECK.x);
    let d = a - lastAng;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    if (Math.abs(d) < 0.9) {
      twist += Math.abs(d);
      if (twist >= Math.PI * 2.6) openBottle();
    }
    lastAng = a;
  };
  const onUp = () => { grab = false; lastAng = null; };
  stage.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  function openBottle() {
    if (phase !== 'sealed') return;
    grab = false;
    phase = 'opened';
    foamT = 0;
    playSfx('game.sodaOpen');
    setTimeout(() => playSfx('game.sodaFizz'), 90);
    capFly = { x: NECK.x, y: NECK.y - 14, vx: 1.6 + Math.random(), vy: -5.4, rot: 0, vr: 0.3, life: 1 };
    floats.push({ x: 280, y: 96, text: '啵 — !', color: '#4E8FBF', life: 1.3 });
    status.textContent = '点瓶子喝掉, 还能再来一瓶';
  }

  const status = document.createElement('span');
  status.className = 'game-status';
  status.textContent = phase === 'sealed' ? '按住瓶盖, 画圈拧开, 然后点瓶子喝掉' : '';
  stage.appendChild(status);

  function render(time) {
    const now = performance.now();
    // 泡沫推进(时间驱动)
    if (phase === 'opened' && foamT < 1) {
      foamT = Math.min(1, foamT + 0.004);
      if (now - lastFizz > 700) { playSfx('game.sodaFizz'); lastFizz = now; }
      if (foamT < 0.55 && Math.random() < 0.5) {
        foams.push({
          x: NECK.x + (Math.random() - 0.5) * 30, y: NECK.y - 6,
          vx: (Math.random() - 0.5) * 1.5, vy: -2.2 - Math.random() * 2,
          s: 4 + Math.random() * 7, life: 1,
        });
      }
    }
    if (capFly) {
      capFly.x += capFly.vx; capFly.y += capFly.vy;
      capFly.vy += 0.24; capFly.rot += capFly.vr;
      capFly.life -= 0.011;
      if (capFly.life <= 0) capFly = null;
    }

    ctx.clearRect(0, 0, GAME_W, GAME_H);
    // 清凉背景
    const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
    bg.addColorStop(0, 'rgba(214, 238, 250, 0.65)');
    bg.addColorStop(1, 'rgba(232, 244, 240, 0.6)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, GAME_W, GAME_H);
    // 环境光斑
    for (let i = 0; i < 5; i++) {
      const bx = 60 + i * 110, by = 70 + (i % 3) * 40;
      const rg = ctx.createRadialGradient(bx, by, 1, bx, by, 60);
      rg.addColorStop(0, 'rgba(255,255,255,0.2)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(bx - 60, by - 60, 120, 120);
    }

    // 桌面影子(v566 卡片软阴影)
    wcShadow(ctx, 280, 352, 76, 12, 0.18);

    // v565 卡片同款外晕(瓶身水彩光圈) + 装饰星光
    ctx.save();
    ctx.translate(280, 232); ctx.scale(1.16, 1.08); ctx.translate(-280, -232);
    bottlePath(ctx); ctx.fillStyle = 'rgba(160, 205, 175, 0.2)'; ctx.fill();
    ctx.restore();
    wcSparkle(ctx, 366, 132, 7, '#BFEFEA', 0.75);
    wcSparkle(ctx, 196, 210, 5, '#BFEFEA', 0.55);

    // ===== 瓶身 =====
    ctx.save();
    bottlePath(ctx);
    ctx.clip();
    // 液体(焦糖色渐变)
    if (drink > 0) {
      const top = 152, bot = 344;
      const lvl = top + (bot - top) * (1 - drink);
      const lg = ctx.createLinearGradient(0, lvl, 0, bot);
      lg.addColorStop(0, 'rgba(146, 74, 26, 0.92)');
      lg.addColorStop(0.5, 'rgba(112, 54, 16, 0.95)');
      lg.addColorStop(1, 'rgba(72, 33, 8, 0.97)');
      ctx.fillStyle = lg;
      ctx.fillRect(228, lvl, 104, bot - lvl + 6);
      // 液面亮边
      const lm = ctx.createLinearGradient(0, lvl, 0, lvl + 16);
      lm.addColorStop(0, 'rgba(255, 214, 150, 0.55)');
      lm.addColorStop(1, 'rgba(255, 214, 150, 0)');
      ctx.fillStyle = lm;
      ctx.fillRect(228, lvl, 104, 16);
      // v566 卡片层叠高光 + 白点(液体)
      ctx.fillStyle = 'rgba(255, 224, 170, 0.34)';
      ctx.beginPath(); ctx.ellipse(258, lvl + 34, 13, 24, -0.16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath(); ctx.arc(256, lvl + 16, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(268, lvl + 42, 1.6, 0, Math.PI * 2); ctx.fill();
      // 上升气泡
      for (const b of fizzers) {
        b.y += b.v * 0.004;
        if (b.y > 1) b.y = 0;
        const by = bot - b.y * (bot - top);
        ctx.fillStyle = 'rgba(255, 236, 200, 0.45)';
        ctx.beginPath(); ctx.arc(240 + b.x * 80, by, b.s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255, 246, 220, 0.25)';
        ctx.beginPath(); ctx.arc(240 + b.x * 80 - b.s * 0.3, by - b.s * 0.3, b.s * 0.4, 0, Math.PI * 2); ctx.fill();
      }
    }
    // 玻璃淡绿
    const gg = ctx.createLinearGradient(228, 120, 332, 120);
    gg.addColorStop(0, 'rgba(160, 200, 160, 0.17)');
    gg.addColorStop(0.45, 'rgba(185, 218, 180, 0.05)');
    gg.addColorStop(0.55, 'rgba(185, 218, 180, 0.02)');
    gg.addColorStop(1, 'rgba(140, 185, 150, 0.16)');
    ctx.fillStyle = gg;
    ctx.fillRect(228, 120, 104, 230);
    ctx.restore();
    // 瓶壁描边(v566 积色水彩描边, 更深更润)
    ctx.strokeStyle = 'rgba(70, 112, 90, 0.5)';
    ctx.lineWidth = 2.6;
    bottlePath(ctx); ctx.stroke();
    // 瓶口环
    ctx.strokeStyle = 'rgba(90, 135, 110, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(280, 110, 14, 3, 0, 0, Math.PI * 2); ctx.stroke();
    // 玻璃高光(v566 卡片柔光椭圆, 取代长条描边)
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.ellipse(257, 228, 8, 62, 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.ellipse(306, 234, 4, 42, -0.04, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.arc(256, 200, 1.8, 0, Math.PI * 2); ctx.fill();
    // 瓶颈细高光
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(276, 116); ctx.lineTo(277, 138);
    ctx.stroke();
    // 凝结水珠
    [[264, 252], [294, 234], [300, 290], [258, 298], [286, 272], [272, 320]].forEach(([dx, dy]) => {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.ellipse(dx, dy, 1.8, 3, 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(120,160,140,0.3)';
      ctx.beginPath(); ctx.ellipse(dx + 0.9, dy + 3.4, 2.2, 0.8, 0, 0, Math.PI * 2); ctx.fill();
    });

    // ===== 瓶盖(sealed 时, 银色金属旋盖) =====
    if (phase === 'sealed') {
      const rise = Math.min(8, twist / (Math.PI * 2.6) * 8);
      const rot = twist * 0.5;
      ctx.save();
      ctx.translate(NECK.x, NECK.y - 4 - rise);
      ctx.rotate(rot);
      const cg = ctx.createLinearGradient(0, -14, 0, 14);
      cg.addColorStop(0, '#EAEDF0');
      cg.addColorStop(0.35, '#C6CCD2');
      cg.addColorStop(0.72, '#A6ADB6');
      cg.addColorStop(1, '#7C848D');
      ctx.fillStyle = cg;
      wcRoundRect(ctx, -17, -14, 34, 28, 5, 3, 0.8); ctx.fill();
      // 防滑竖纹
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.6;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath(); ctx.moveTo(k * 6.5, -12); ctx.lineTo(k * 6.5, 12); ctx.stroke();
      }
      // 顶部高光弧
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.moveTo(-11, -10); ctx.lineTo(11, -10); ctx.stroke();
      // 底部阴影线
      ctx.strokeStyle = 'rgba(45,55,65,0.45)';
      ctx.beginPath(); ctx.moveTo(-17, 12); ctx.lineTo(17, 12); ctx.stroke();
      ctx.restore();
      // 拧盖提示环
      if (twist > 0.4) {
        ctx.strokeStyle = `rgba(78, 143, 191, ${Math.min(0.75, twist / Math.PI * 0.5)})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(NECK.x, NECK.y, 50, -Math.PI / 2, -Math.PI / 2 + twist, false); ctx.stroke();
      }
    }

    // 飞出的瓶盖
    if (capFly) {
      ctx.save();
      ctx.translate(capFly.x, capFly.y);
      ctx.rotate(capFly.rot);
      ctx.globalAlpha = Math.min(1, capFly.life * 2);
      const cg = ctx.createLinearGradient(0, -14, 0, 14);
      cg.addColorStop(0, '#EAEDF0'); cg.addColorStop(1, '#7C848D');
      ctx.fillStyle = cg;
      wcRoundRect(ctx, -17, -14, 34, 28, 5, 3, 0.8); ctx.fill();
      ctx.restore();
    }

    // 涌出的泡沫
    for (let i = foams.length - 1; i >= 0; i--) {
      const f = foams[i];
      f.x += f.vx; f.y += f.vy; f.vy += 0.04;
      f.life -= 0.006; f.s += 0.12;
      if (f.life <= 0 || f.y > 360) { foams.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(255, 252, 244, ${f.life * 0.9})`;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(220, 238, 250, ${f.life * 0.4})`;
      ctx.beginPath(); ctx.arc(f.x - f.s * 0.25, f.y - f.s * 0.25, f.s * 0.45, 0, Math.PI * 2); ctx.fill();
    }
    // 瓶口涌沫团
    if (phase === 'opened' && foamT < 1) {
      const k = 1 - foamT;
      for (let k2 = 0; k2 < 6; k2++) {
        const fy = NECK.y - 4 - k2 * 7 * k;
        const fr = (14 - k2 * 1.6) * k + 3;
        ctx.fillStyle = `rgba(255, 252, 246, ${0.85 - k2 * 0.1})`;
        ctx.beginPath(); ctx.arc(NECK.x + Math.sin(now / 80 + k2) * 2, fy, fr, 0, Math.PI * 2); ctx.fill();
      }
    }

    // 漂字
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= 0.007; f.y -= 0.4;
      if (f.life <= 0) { floats.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life);
      ctx.font = '700 16px "LXGW WenKai", system-ui, sans-serif';
      ctx.fillStyle = f.color; ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(render);
  }
  render(performance.now());

  return {
    destroy() {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    },
  };
}


function buildRain(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0.28;
  master.connect(ctx.destination);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'white', 2.5);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1400;
  src.connect(lp); lp.connect(master);
  src.start();

  // 雨点: 随机高频短促"嗒"
  const drips = setInterval(() => {
    if (Math.random() > 0.55) return;
    const t = ctx.currentTime;
    const s = ctx.createBufferSource();
    s.buffer = sfxNoise(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3000 + Math.random() * 2500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.02 + Math.random() * 0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    s.connect(hp); hp.connect(g); g.connect(ctx.destination);
    s.start(t); s.stop(t + 0.06);
  }, 70);

  return {
    ctx, master,
    stops: [() => src.stop(), () => clearInterval(drips)],
  };
}

function buildWave(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0.15;
  master.connect(ctx.destination);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'white', 3);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 680;
  src.connect(lp); lp.connect(master);
  src.start();

  // 慢 LFO 调制音量: 潮起潮落
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.09;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.115;
  lfo.connect(lfoG); lfoG.connect(master.gain);
  lfo.start();

  return {
    ctx, master,
    stops: [() => src.stop(), () => lfo.stop()],
  };
}

function buildFire(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'brown', 3);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 640;
  src.connect(lp); lp.connect(master);
  src.start();

  // 噼啪: 随机短促带通爆发
  const crackle = setInterval(() => {
    if (Math.random() > 0.075) return;
    const t = ctx.currentTime;
    const s = ctx.createBufferSource();
    s.buffer = sfxNoise(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1300 + Math.random() * 3200;
    bp.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.03 + Math.random() * 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03 + Math.random() * 0.05);
    s.connect(bp); bp.connect(g); g.connect(ctx.destination);
    s.start(t); s.stop(t + 0.1);
  }, 45);

  return {
    ctx, master,
    stops: [() => src.stop(), () => clearInterval(crackle)],
  };
}

function buildWind(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0.45;
  master.connect(ctx.destination);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'pink', 3);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 520;
  lp.Q.value = 0.7;
  src.connect(lp); lp.connect(master);
  src.start();

  // 风忽远忽近: 滤波频率与音量都慢慢漂
  const lfo1 = ctx.createOscillator();
  lfo1.type = 'sine';
  lfo1.frequency.value = 0.06;
  const lfo1G = ctx.createGain();
  lfo1G.gain.value = 240;
  lfo1.connect(lfo1G); lfo1G.connect(lp.frequency);
  lfo1.start();

  const lfo2 = ctx.createOscillator();
  lfo2.type = 'sine';
  lfo2.frequency.value = 0.1;
  const lfo2G = ctx.createGain();
  lfo2G.gain.value = 0.1;
  lfo2.connect(lfo2G); lfo2G.connect(master.gain);
  lfo2.start();

  return {
    ctx, master,
    stops: [() => src.stop(), () => lfo1.stop(), () => lfo2.stop()],
  };
}

/* v47: 森林 —— 林间微风 + 远处小鸟偶尔啼鸣 */
function buildForest(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0.4;
  master.connect(ctx.destination);

  // 底床: 柔和的林间风
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'pink', 3);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 460;
  lp.Q.value = 0.6;
  const windG = ctx.createGain();
  windG.gain.value = 0.5;
  src.connect(lp); lp.connect(windG); windG.connect(master);
  src.start();
  const lfo = ctx.createOscillator();
  lfo.type = 'sine'; lfo.frequency.value = 0.07;
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.22;
  lfo.connect(lfoG); lfoG.connect(windG.gain);
  lfo.start();

  // 鸟鸣: 随机的短促滑音(2-4 声一串)
  const chirp = () => {
    const t0 = ctx.currentTime + 0.05;
    const n = 2 + Math.floor(Math.random() * 3);
    const base = 2100 + Math.random() * 1400;
    for (let i = 0; i < n; i++) {
      const t = t0 + i * (0.09 + Math.random() * 0.05);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(base * (0.92 + Math.random() * 0.16), t);
      o.frequency.exponentialRampToValueAtTime(base * (1.05 + Math.random() * 0.22), t + 0.055);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, t + 0.018);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.12);
    }
  };
  const bird = setInterval(() => {
    if (Math.random() < 0.55) chirp();
  }, 2600);

  return {
    ctx, master,
    stops: [() => src.stop(), () => lfo.stop(), () => clearInterval(bird)],
  };
}

/* 咀嚼: 慢节奏一口一口, 像有人在旁边安静地吃薯片 */
function buildChew(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0.95;
  master.connect(ctx.destination);
  biteSound(master);
  const chew = setInterval(() => biteSound(master), 1400 + Math.random() * 2000);
  return { ctx, master, stops: [() => clearInterval(chew)] };
}

/* 敲击: 玻璃杯/木鱼般清脆的叮, 间隔松弛随意 */
function buildTap(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  tapSound();
  const tap = setInterval(() => tapSound(), 850 + Math.random() * 1500);
  return { ctx, master, stops: [() => clearInterval(tap)] };
}

/* 机械键盘: 一阵一阵地打字, 打完一句歇一下 */
function buildKeys(ctx) {
  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);
  let alive = true;
  let t = null;
  function next() {
    if (!alive) return;
    keySound();
    const pause = Math.random() < 0.14 ? 900 + Math.random() * 1800 : 75 + Math.random() * 200;
    t = setTimeout(next, pause);
  }
  t = setTimeout(next, 120);
  return { ctx, master, stops: [() => { alive = false; clearTimeout(t); }] };
}

/* 翻书: 隔几秒轻翻一页 */
function buildPage(ctx) {
  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);
  let t = null;
  function next() {
    pageSound();
    t = setTimeout(next, 2400 + Math.random() * 3200);
  }
  t = setTimeout(next, 300);
  return { ctx, master, stops: [() => clearTimeout(t)] };
}

/* 水滴: 空旷房间里偶尔一声"叮", 间隔忽长忽短 */
function buildDrip(ctx) {
  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);
  let t = null;
  function next() {
    dripSound();
    t = setTimeout(next, 650 + Math.random() * 2400);
  }
  t = setTimeout(next, 200);
  return { ctx, master, stops: [() => clearTimeout(t)] };
}

/* ASMR 卡片当前播放状态: soundKey → {ctx, master, stops} (v53 补: 之前未声明导致点卡片必报错) */
const asmrActive = {};
/* v554: 连点防抖 —— fetch+解码期间重复点击会启动两份循环, 旧句柄被覆盖导致"停不掉" */
const asmrLoading = {};

/* 全部停止: 停掉所有 asmrActive, 移除所有 playing 类 */
function stopAllAsmr() {
  for (const k of Object.keys(asmrLoading)) delete asmrLoading[k];
  for (const k of Object.keys(asmrActive)) {
    try { smoothStop(asmrActive[k]); } catch (_) {}
    delete asmrActive[k];
  }
  // v554: 疗愈之旅瓶的注入音(雨/森林/海浪)是独立循环, 也一并停掉
  try { if (typeof stopHealWeather === 'function') stopHealWeather(true); } catch (e) {}
  document.querySelectorAll('.asmr-card.playing').forEach(c => c.classList.remove('playing'));
}

function bindAsmr() {
  document.querySelectorAll('.asmr-card').forEach(card => {
    if (card.classList.contains('asmr-user')) return;   // v48: 用户上传空位走单独逻辑
    card.addEventListener('click', async () => {
      const key = card.dataset.sound;
      if (asmrActive[key]) {
        smoothStop(asmrActive[key]);
        delete asmrActive[key];
        card.classList.remove('playing');
        return;
      }
      // v554: 正在启动中(异步加载音源) —— 忽略连点, 防止启动两份循环导致旧句柄泄漏停不掉
      if (asmrLoading[key]) return;
      asmrLoading[key] = true;
      // v533: 多卡片可同时播放 —— 点新卡片不碰其他正在播的(各自独立); 单独暂停用上面的分支
      try {
        const nodes = await startLoopSound('asmr.' + key);
        if (!nodes) { toast('当前浏览器不支持音频'); return; }
        asmrActive[key] = nodes;
        card.classList.add('playing');
      } catch (e) { toast('声音启动失败, 再试一次'); }
      finally { delete asmrLoading[key]; }
    });
  });
  // v532: 全局"全部停止"按钮
  const stopAllBtn = document.getElementById('asmrStopAllBtn');
  if (stopAllBtn) {
    stopAllBtn.addEventListener('click', () => {
      stopAllAsmr();
      toast('已停止所有助眠音');
    });
  }
  bindUserAsmrSlots();
}

/* ---------- v48: ASMR 用户上传空位(存本机 IndexedDB, 时长不限) ---------- */
const userAsmr = {};   // slotIndex → {file, name, audio, url}

function bindUserAsmrSlots() {
  const cards = document.querySelectorAll('.asmr-card.asm-user, .asmr-card.asmr-user');
  if (!cards.length) return;
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'audio/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  let pendingSlot = -1;
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (f && pendingSlot >= 0) await saveUserSlot(pendingSlot, f);
    pendingSlot = -1;
  });

  cards.forEach(card => {
    const i = parseInt(card.dataset.slot, 10);
    card.addEventListener('click', async e => {
      if (e.target && e.target.classList && e.target.classList.contains('ac-del')) return;   // 删除按钮单独处理
      const st = userAsmr[i];
      if (!st) { pendingSlot = i; fileInput.click(); return; }   // 空位 → 上传
      // 已上传 → 播放/暂停
      if (st.audio.paused) {
        try { await st.audio.play(); card.classList.add('playing'); }
        catch (err) { toast('这个文件播放不了, 换一个试试'); }
      } else {
        st.audio.pause();
        card.classList.remove('playing');
      }
    });
    const del = card.querySelector('.ac-del');
    if (del) del.addEventListener('click', async e => {
      e.stopPropagation();
      await deleteUserSlot(i);
      toast('已删除, 这个空位可以再上传啦');
    });
    // 载入已保存的音频
    audioDB.get('asmr.user' + i).then(rec => {
      if (rec && rec.file) applyUserSlot(i, rec.file, rec.name || '我的助眠音');
    });
  });

  async function saveUserSlot(i, f) {
    if (!f.type.startsWith('audio') && !/\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)$/i.test(f.name)) {
      toast('要选一个音频文件哦');
      return;
    }
    const ok = await audioDB.set('asmr.user' + i, f, f.name);
    if (!ok) { toast('保存失败, 再试一次'); return; }
    deleteUserSlotAudio(i);
    applyUserSlot(i, f, f.name);
    toast('「' + trimName(f.name) + '」已放好 🌙 点击卡片就能播放');
  }

  function trimName(name) {
    const n = String(name).replace(/\.[^.]+$/, '');
    return n.length > 14 ? n.slice(0, 13) + '…' : n;
  }

  function applyUserSlot(i, file, name) {
    const card = document.querySelector('.asmr-card.asm-user[data-slot="' + i + '"], .asmr-card.asmr-user[data-slot="' + i + '"]');
    if (!card) return;
    deleteUserSlotAudio(i);
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.85;
    userAsmr[i] = { file, name, audio, url };
    card.classList.add('filled');
    const nm = card.querySelector('.ac-name');
    const ds = card.querySelector('.ac-desc');
    if (nm) nm.textContent = trimName(name);
    if (ds) ds.textContent = '你上传的助眠音 · 点击播放';
    audio.addEventListener('ended', () => card.classList.remove('playing'));
  }

  function deleteUserSlotAudio(i) {
    const st = userAsmr[i];
    if (!st) return;
    try { st.audio.pause(); } catch (e) {}
    try { URL.revokeObjectURL(st.url); } catch (e) {}
    delete userAsmr[i];
  }

  async function deleteUserSlot(i) {
    deleteUserSlotAudio(i);
    await audioDB.del('asmr.user' + i);
    const card = document.querySelector('.asmr-card.asm-user[data-slot="' + i + '"], .asmr-card.asmr-user[data-slot="' + i + '"]');
    if (card) {
      card.classList.remove('filled', 'playing');
      const nm = card.querySelector('.ac-name');
      const ds = card.querySelector('.ac-desc');
      if (nm) nm.textContent = '上传你喜欢的助眠音';
      if (ds) ds.textContent = '白噪音/音乐/录音都可以 · 时长不限';
    }
  }
}

/* ============================================
   设置区: 音频替换管理
   全站每个声音都可以上传文件替换(存 IndexedDB),
   也可随时恢复默认合成音色
   ============================================ */
function bindAudioManager() {
  const wrap = document.getElementById('audioGroups');
  if (!wrap) return;
  const GROUPS = [
    { id: 'site', name: '站点音效', tip: '网站里的提示与氛围音' },
    { id: 'game', name: '游戏音效', tip: '解压游戏里的手感音效' },
    { id: 'asmr', name: 'ASMR 音源', tip: '长音循环音源, 换成自己的录音也可以' },
  ];
  wrap.innerHTML = '';

  for (const g of GROUPS) {
    // v51: 折叠夹子 —— 平时收起, 点标题展开看全部槽位
    const sec = document.createElement('details');
    sec.className = 'ag-group';
    const head = document.createElement('summary');
    head.className = 'ag-title';
    head.innerHTML = '<b>' + g.name + '</b><span>' + g.tip + '</span><i class="ag-caret" aria-hidden="true">▸</i>';
    sec.appendChild(head);

    const body = document.createElement('div');
    body.className = 'ag-body';

    Object.keys(AUDIO_SLOTS).forEach(id => {
      const slot = AUDIO_SLOTS[id];
      if (slot.group !== g.id) return;
      const row = document.createElement('div');
      row.className = 'ag-row';
      row.innerHTML =
        '<span class="ag-name">' + slot.label + '</span>' +
        '<span class="ag-src"></span>' +
        '<div class="ag-ops">' +
          '<button class="btn btn-ghost small ag-play" type="button">试听</button>' +
          '<button class="btn btn-ghost small ag-up" type="button">换我上传</button>' +
          '<button class="btn btn-ghost small ag-del" type="button">恢复默认</button>' +
        '</div>';
      body.appendChild(row);

      const srcEl = row.querySelector('.ag-src');
      const playBtn = row.querySelector('.ag-play');
      const upBtn = row.querySelector('.ag-up');
      const delBtn = row.querySelector('.ag-del');
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'audio/*';
      fileInput.style.display = 'none';
      row.appendChild(fileInput);

      function refresh() {
        if (_customBufs[id]) {
          srcEl.textContent = (_customMeta[id] && _customMeta[id].name) || '自定义音频';
          srcEl.classList.add('ok');
        } else if (slot.file) {
          // v51: 内置高品质实录音(amb-*.mp3)
          srcEl.textContent = '内置实录音';
          srcEl.classList.remove('ok');
        } else {
          srcEl.textContent = '默认';
          srcEl.classList.remove('ok');
        }
      }

      upBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        const f = fileInput.files && fileInput.files[0];
        fileInput.value = '';
        if (!f) return;
        try {
          const ctx = ensureAudioCtx();
          if (!ctx) { toast('当前浏览器不支持音频'); return; }
          const buf = await ctx.decodeAudioData(await f.arrayBuffer());
          const ok = await audioDB.set(id, f, f.name);
          if (!ok) { toast('保存失败, 再试一次'); return; }
          _customBufs[id] = buf;
          _customMeta[id] = { name: f.name };
          refresh();
          playSfx(id);
          toast('「' + slot.label + '」已换上你的声音 🎉');
        } catch (e) {
          toast('这个文件读不出来, 换一个试试');
        }
      });

      delBtn.addEventListener('click', async () => {
        if (!_customBufs[id]) { toast('这条本来就是默认的'); return; }   // v36.7 按钮常驻
        delete _customBufs[id];
        delete _customMeta[id];
        await audioDB.del(id);
        refresh();
        toast('已恢复默认音色');
      });

      playBtn.addEventListener('click', async () => {
        try {
          if (slot.loop) {
            const key = id.slice(5);   // asmr.xxx → xxx
            const card = document.querySelector('.asmr-card[data-sound="' + key + '"]');
            if (asmrActive[key]) {
              smoothStop(asmrActive[key]);
              delete asmrActive[key];
              if (card) card.classList.remove('playing');
              return;
            }
            if (asmrLoading[key]) return;   // v554: 连点防抖
            asmrLoading[key] = true;
            const nodes = await startLoopSound(id);
            delete asmrLoading[key];
            if (!nodes) return;
            asmrActive[key] = nodes;
            if (card) card.classList.add('playing');
            setTimeout(() => {
              if (asmrActive[key] === nodes) {
                smoothStop(nodes);
                delete asmrActive[key];
                if (card) card.classList.remove('playing');
              }
            }, 4200);
          } else {
            playSfx(id);
          }
        } catch (e) {}
      });

      refresh();
    });

    sec.appendChild(body);
    wrap.appendChild(sec);
  }

  /* 全部恢复默认音色: 清空所有自定义音频(IndexedDB + 内存缓存) */
  const resetAll = document.createElement('button');
  resetAll.id = 'audioResetAll';
  resetAll.className = 'btn btn-ghost ac-wide ag-reset-all';
  resetAll.type = 'button';
  resetAll.textContent = '🔁 全部恢复默认音色';
  wrap.appendChild(resetAll);
  resetAll.addEventListener('click', async () => {
    const ids = Object.keys(_customBufs);
    if (!ids.length) { toast('音频本来就是默认的啦'); return; }
    ids.forEach(id => { delete _customBufs[id]; delete _customMeta[id]; });
    await audioDB.clearUserSlotsExceptUploads();   // v48: 保留用户上传的助眠音(asmr.user*)
    bindAudioManager();   // 重渲染刷新每个槽位(旧节点销毁, 无重复监听)
    toast('全部恢复默认音色啦 🎵 你上传的助眠音还留着');
  });
}


/* ============================================
   用户中心 —— 设备账号 + 持久登录 + 订单
   纯静态站无服务器: 账号绑定在当前设备(浏览器)上,
   关闭网页再打开仍然保持登录(localStorage 持久会话)
   ============================================ */
const AVATAR_CHOICES = ['🌙', '⭐', '🌸', '🦊', '🐰', '🍵', '🧸', '🎵', '🌿', '🐬', '🪐', '🍀'];

function hashPass(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return 'h' + (h >>> 0).toString(36);
}
function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
}
function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}
function currentUser() { return loadJSON('ma_user', null); }

/* v34: 统一改密入口 —— 同时更新设备凭证与当前会话, 云端身份与用户密码无关(见 cloudPass), 无需动云端
   v35: ma_device.pw 存明文(仅本设备 localStorage, 用于「找回密码」卡片显示; 后台不采集) */
function applyNewPassword(deviceName, newPass) {
  const device = loadJSON('ma_device', null);
  if (!device) { toast('设备凭证丢失, 请联系客服'); return false; }
  if (deviceName && deviceName !== device.name) { toast('昵称和本设备注册的不一致'); return false; }
  if (newPass.length < 6) { toast('新密码至少 6 位'); return false; }
  const h = hashPass(newPass);
  if (device.pass === h) { toast('新旧密码一样, 换个新的吧'); return false; }
  device.pass = h;
  device.pw = newPass;   // v35: 明文同步(找回密码要显示原密码)
  saveJSON('ma_device', device);
  const user = loadJSON('ma_user', null);
  if (user && user.name === device.name) { user.pass = h; saveJSON('ma_user', user); }
  return true;
}

/* 虚拟物流: 演示用, 正式接入真实发货后替换 */
const COURIERS = [
  { name: '顺丰速运', code: 'SF' },
  { name: '中通快递', code: 'ZTO' },
  { name: '圆通速递', code: 'YT' },
  { name: '韵达快递', code: 'YD' },
];
function genShip() {
  const c = COURIERS[Math.floor(Math.random() * COURIERS.length)];
  const num = String(Math.floor(Math.random() * 1e12)).padStart(12, '0');
  const d = new Date(Date.now() + 2 * 86400000);
  return {
    courier: c.name,
    tracking: c.code + num,
    eta: (d.getMonth() + 1) + '月' + d.getDate() + '日 前送达',
  };
}

/* 订单: 付款成功时写入, 用户中心可查 */
function saveOrder(o) {
  const user = currentUser();
  const list = loadJSON('ma_orders', []);
  const ship = genShip();
  list.unshift({
    id: 'MA' + String(Date.now()).slice(-8),
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    items: o.items,
    total: o.total,
    buyer: user ? user.name : '游客',
    name: o.name || '', phone: o.phone || '', addr: o.addr || '',
    status: '已付款(演示)',
    courier: ship.courier,
    tracking: ship.tracking,
    eta: ship.eta,
  });
  saveJSON('ma_orders', list.slice(0, 40));
  refreshAccountBadge();
  renderOrders();   // 用户中心已打开时同步刷新
}

function renderOrders() {
  const wrap = document.getElementById('orderList');
  if (!wrap) return;
  const list = loadJSON('ma_orders', []);
  // 旧订单补虚拟物流字段(没有快递信息的单子也能点开看详情)
  let touched = false;
  list.forEach(o => {
    if (!o.tracking) {
      const s = genShip();
      o.courier = s.courier; o.tracking = s.tracking; o.eta = s.eta;
      touched = true;
    }
  });
  if (touched) saveJSON('ma_orders', list);
  const user = currentUser();
  const mine = user ? list.filter(o => o.buyer === user.name) : [];
  if (!mine.length) {
    wrap.innerHTML = '<p class="order-empty">还没有订单, 去挑一款疗愈方案吧~</p>';
    return;
  }
  wrap.innerHTML = mine.map(o => (
    '<div class="order-card" data-id="' + o.id + '" role="button" tabindex="0" aria-label="查看订单详情">' +
      '<div class="oc-top">' +
        '<span class="oc-id">单号 ' + o.id + '</span>' +
        '<span class="oc-status">' + o.status + '</span>' +
      '</div>' +
      '<div class="oc-items">' + o.items.map(it =>
        '<span class="oc-item">' + it.name + ' ×' + it.count + '</span>').join('') +
      '</div>' +
      '<div class="oc-foot">' +
        '<span class="oc-time">' + o.time + '</span>' +
        '<span class="oc-total">¥' + o.total + '</span>' +
      '</div>' +
      '<div class="oc-more">📦 查看订单详情 ›</div>' +
    '</div>'
  )).join('');
}

/* 订单详情弹窗: 商品清单 + 收货信息 + 虚拟物流 */
function openOrderDetail(o) {
  const body = document.getElementById('odBody');
  if (!body) return;
  const itemsHtml = (o.items || []).map(it =>
    '<div class="co-item">' +
      '<span class="coi-name">' + it.name + ' <em>×' + it.count + '</em></span>' +
      '<span class="coi-sub">¥' + (it.subtotal || 0) + '</span>' +
    '</div>'
  ).join('');
  body.innerHTML =
    '<div class="od-sec">' +
      '<p class="od-line"><span>订单编号</span><b>' + o.id + '</b></p>' +
      '<p class="od-line"><span>下单时间</span><b>' + (o.time || '—') + '</b></p>' +
      '<p class="od-line"><span>订单状态</span><b class="od-ok">' + (o.status || '已付款') + '</b></p>' +
    '</div>' +
    '<div class="od-sec">' +
      '<p class="od-sec-title">商品清单</p>' +
      '<div class="co-items">' + itemsHtml + '</div>' +
      '<div class="od-total-line"><span>实付金额</span><b>¥' + o.total + '</b></div>' +
    '</div>' +
    '<div class="od-sec">' +
      '<p class="od-sec-title">收货信息</p>' +
      '<p class="od-line"><span>收货人</span><b>' + (o.name || '—') + '</b></p>' +
      '<p class="od-line"><span>手机号</span><b>' + (o.phone || '—') + '</b></p>' +
      '<p class="od-line"><span>收货地址</span><b>' + (o.addr || '—') + '</b></p>' +
    '</div>' +
    '<div class="od-sec od-logi">' +
      '<p class="od-sec-title">物流信息 <em class="od-demo">虚拟演示</em></p>' +
      '<p class="od-line"><span>快递公司</span><b>' + (o.courier || '—') + '</b></p>' +
      '<p class="od-line"><span>快递单号</span><b>' + (o.tracking || '—') + '</b></p>' +
      '<p class="od-line od-eta"><span>预计送达</span><b>' + (o.eta || '—') + '</b></p>' +
    '</div>';
  const ov = document.getElementById('odOverlay');
  if (ov) {
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeOrderDetail() {
  const ov = document.getElementById('odOverlay');
  if (!ov) return;
  ov.classList.remove('open');
  document.body.style.overflow = '';
}

function refreshAccountBadge() {
  const navAvatar = document.getElementById('navAvatar');
  const user = currentUser();
  if (navAvatar) navAvatar.textContent = user ? user.avatar : '🌙';
}

function renderAccount() {
  const reg = document.getElementById('acctReg');
  const login = document.getElementById('acctLogin');
  const forgot = document.getElementById('acctForgot');
  const home = document.getElementById('acctHome');
  if (!reg || !login || !home) return;
  const user = currentUser();
  home.hidden = !user;
  if (user) {
    reg.hidden = true;
    login.hidden = true;
    if (forgot) forgot.hidden = true;
    document.getElementById('apAvatar').textContent = user.avatar;
    document.getElementById('apName').textContent = user.name;
    document.getElementById('apSub').textContent = '加入于 ' + (user.since || '很久以前');
    const codeEl = document.getElementById('apFriendCode');
    if (codeEl) codeEl.textContent = '疗友号 ' + getFriendCode();
    document.getElementById('renameInput').value = user.name;
  } else {
    /* v35: 未登录默认显示登录卡 —— 一进来就是登录, 没账号才点「去注册」 */
    login.hidden = false;
    reg.hidden = true;
    if (forgot) {
      forgot.hidden = true;
      const res = document.getElementById('fogResult');
      const edit = document.getElementById('fogEdit');
      if (res) { res.hidden = true; res.textContent = ''; }
      if (edit) edit.hidden = true;
    }
  }
  // 头像选择行
  const row = document.getElementById('avatarRow');
  if (row && !row.dataset.built) {
    AVATAR_CHOICES.forEach(a => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ac-emoji';
      b.textContent = a;
      b.addEventListener('click', () => {
        const u = currentUser(); if (!u) return;
        u.avatar = a;
        saveJSON('ma_user', u);
        renderAccount();
        refreshAccountBadge();
        cloudUpdateProfile({ avatar: a });
        toast('头像换好啦 ' + a);
      });
      row.appendChild(b);
    });
    row.dataset.built = '1';
  }
  if (user) {
    row.querySelectorAll('.ac-emoji').forEach(b => {
      b.classList.toggle('on', b.textContent === user.avatar);
    });
  }
  renderOrders();
}

function bindAccount() {
  if (!document.getElementById('acctReg')) return;
  renderAccount();
  refreshAccountBadge();

  const regName = document.getElementById('regName');
  const regPass = document.getElementById('regPass');
  const regPass2 = document.getElementById('regPass2');

  document.getElementById('toLogin').addEventListener('click', () => {
    document.getElementById('acctReg').hidden = true;
    document.getElementById('acctLogin').hidden = false;
  });
  document.getElementById('toReg').addEventListener('click', () => {
    document.getElementById('acctLogin').hidden = true;
    document.getElementById('acctReg').hidden = false;
  });

  /* ---- v35: 忘记密码 —— 后台检测设备: 是本机 → 显示用户名+密码; 不是 → 提示设备不一样 ---- */
  document.getElementById('toForgot').addEventListener('click', () => {
    document.getElementById('acctLogin').hidden = true;
    document.getElementById('acctForgot').hidden = false;
    const res = document.getElementById('fogResult');
    const edit = document.getElementById('fogEdit');
    if (res) { res.hidden = true; res.textContent = ''; }
    if (edit) edit.hidden = true;
  });
  document.getElementById('fogBackLogin').addEventListener('click', () => {
    document.getElementById('acctForgot').hidden = true;
    document.getElementById('acctLogin').hidden = false;
  });

  document.getElementById('fogBtn').addEventListener('click', () => {
    const res = document.getElementById('fogResult');
    const edit = document.getElementById('fogEdit');
    if (!res) return;
    res.hidden = false;
    if (edit) edit.hidden = true;
    res.textContent = '';
    res.className = 'fog-result';
    const device = loadJSON('ma_device', null);
    if (!device) {
      /* 设备不一样: 这台设备上没有注册记录 */
      res.classList.add('bad');
      const emoji = document.createElement('p');
      emoji.className = 'fog-emoji'; emoji.textContent = '⚠️';
      const title = document.createElement('p');
      title.className = 'fog-title'; title.textContent = '设备不一样';
      const txt = document.createElement('p');
      txt.className = 'fog-line-v';
      txt.style.fontWeight = '400';
      txt.textContent = '这台设备上没有注册记录。账号只绑定当初注册的那台设备, 别的设备登录不了、也找不回。请回到当初注册的设备点「找回密码」, 或者在这台设备注册一个新账号。';
      res.append(emoji, title, txt);
      return;
    }
    /* 认出设备: 弹出卡片显示用户名 / 密码 / 疗友号 */
    res.classList.add('ok');
    const emoji = document.createElement('p');
    emoji.className = 'fog-emoji'; emoji.textContent = '✅';
    const title = document.createElement('p');
    title.className = 'fog-title'; title.textContent = '认出来了, 这台设备注册过';
    const mkLine = (k, v) => {
      const row = document.createElement('p');
      row.className = 'fog-line';
      const key = document.createElement('span');
      key.className = 'fog-line-k'; key.textContent = k;
      const val = document.createElement('span');
      val.className = 'fog-line-v'; val.textContent = v;
      row.append(key, val);
      return row;
    };
    res.append(emoji, title);
    res.append(mkLine('用户名', device.name));
    res.append(mkLine('密码', device.pw || '（旧版注册没存原密码, 请用下面的改密码）'));
    res.append(mkLine('疗友号', getFriendCode()));
    const hint = document.createElement('p');
    hint.className = 'fog-line-k';
    hint.style.cssText = 'font-size:12.5px; padding-top:8px; margin:0;';
    hint.textContent = '这些信息只显示在你这台设备上, 别人看不到。拿用户名和密码去登录就行。';
    res.append(hint);
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-ghost fog-edit-btn';
    editBtn.textContent = '改密码和用户名';
    editBtn.addEventListener('click', () => { if (edit) edit.hidden = false; });
    res.append(editBtn);
  });

  /* 改密码和用户名(设备已验证, 不需要旧密码) */
  const fogEditBtn = document.getElementById('fogEditBtn');
  if (fogEditBtn) fogEditBtn.addEventListener('click', () => {
    const device = loadJSON('ma_device', null);
    if (!device) { toast('这台设备没有注册记录'); return; }
    const newName = document.getElementById('fogNewName').value.trim();
    const p1 = document.getElementById('fogNewPass').value;
    const p2 = document.getElementById('fogNewPass2').value;
    if (!newName && !p1) { toast('昵称和密码至少改一个'); return; }
    if (newName && newName.length < 2) { toast('新昵称至少 2 个字'); return; }
    if (newName && newName === device.name) { toast('新昵称和现在的一样'); return; }
    if (p1) {
      if (p1.length < 6) { toast('新密码至少 6 位'); return; }
      if (p1 !== p2) { toast('两次新密码不一致'); return; }
      if (hashPass(p1) === device.pass) { toast('新旧密码一样, 换个新的吧'); return; }
    }
    const oldName = device.name;
    if (newName) {
      device.name = newName;
      /* 订单归属同步改名 */
      const list = loadJSON('ma_orders', []);
      let touched = false;
      list.forEach(o => { if (o.buyer === oldName) { o.buyer = newName; touched = true; } });
      if (touched) saveJSON('ma_orders', list);
    }
    if (p1) { device.pass = hashPass(p1); device.pw = p1; }
    saveJSON('ma_device', device);
    /* 当前会话同步(若在登录态) */
    const user = loadJSON('ma_user', null);
    if (user && (user.name === oldName || user.name === device.name)) {
      if (newName) user.name = newName;
      if (p1) user.pass = device.pass;
      saveJSON('ma_user', user);
    }
    cloudUpdateProfile({ nickname: device.name });
    renderAccount();
    document.getElementById('acctForgot').hidden = true;
    document.getElementById('acctLogin').hidden = false;
    document.getElementById('loginName').value = device.name;
    document.getElementById('fogNewName').value = '';
    document.getElementById('fogNewPass').value = '';
    document.getElementById('fogNewPass2').value = '';
    toast('✅ 改好了, 用新信息登录吧');
  });

  document.getElementById('regBtn').addEventListener('click', () => {
    const name = regName.value.trim();
    const pass = regPass.value;
    if (name.length < 2) { toast('昵称至少 2 个字'); return; }
    if (pass.length < 6) { toast('密码至少 6 位'); return; }
    if (pass !== regPass2.value) { toast('两次密码不一致'); return; }
    // 设备唯一账号: 同一设备(浏览器)只能注册一个
    const device = loadJSON('ma_device', null);
    if (device) {
      toast('本设备已注册过账号「' + device.name + '」, 请直接登录');
      document.getElementById('acctReg').hidden = true;
      document.getElementById('acctLogin').hidden = false;
      document.getElementById('loginName').value = device.name;
      return;
    }
    const user = {
      name, avatar: AVATAR_CHOICES[Math.floor(Math.random() * AVATAR_CHOICES.length)],
      since: new Date().toLocaleDateString('zh-CN'), pass: hashPass(pass),
    };
    /* v35: ma_device 存明文(仅本设备, 找回密码卡片要显示); 疗友号注册时系统分配, 永久绑定不变 */
    saveJSON('ma_device', { name: user.name, pass: user.pass, pw: pass, avatar: user.avatar, since: user.since });
    saveJSON('ma_user', user);
    const myCode = getFriendCode();
    renderAccount();
    refreshAccountBadge();
    toast('🎉 注册成功! 你的疗友号是 ' + myCode + ', 全站唯一, 永远不变');
    playSfx('site.chime');
    // 云端建档(best-effort, 失败不阻断) + 自动进社区
    cloudSyncAccount();
    showView('community');
    history.replaceState(null, '', '#community');
  });

  document.getElementById('loginBtn').addEventListener('click', () => {
    const name = document.getElementById('loginName').value.trim();
    const pass = document.getElementById('loginPass').value;
    const device = loadJSON('ma_device', null);
    if (!device) { toast('本设备还没注册过, 先注册一个吧'); return; }
    if (name !== device.name) { toast('昵称和本设备注册的不一致'); return; }
    if (hashPass(pass) !== device.pass) { toast('密码不对, 再想想'); return; }
    const user = loadJSON('ma_user', null);
    if (user && user.name === device.name) {
      renderAccount();
      cloudSyncAccount();
      toast('欢迎回来, ' + user.name);
      return;
    }
    // 恢复登录(设备凭证构造会话)
    saveJSON('ma_user', { name: device.name, avatar: device.avatar || '🌙', since: device.since || new Date().toLocaleDateString('zh-CN'), pass: device.pass });
    renderAccount();
    refreshAccountBadge();
    cloudSyncAccount();
    toast('欢迎回来, ' + device.name);
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('ma_user');
    renderAccount();
    refreshAccountBadge();
    cloudSignOut();
    toast('已退出登录, 订单记录还在这台设备上');
  });

  document.getElementById('renameBtn').addEventListener('click', () => {
    const user = currentUser(); if (!user) return;
    const name = document.getElementById('renameInput').value.trim();
    if (name.length < 2) { toast('昵称至少 2 个字'); return; }
    const oldName = user.name;
    user.name = name;
    saveJSON('ma_user', user);
    const device = loadJSON('ma_device', null);
    if (device && device.name === oldName) { device.name = name; device.since = user.since; saveJSON('ma_device', device); }
    // 订单归属同步改名
    const list = loadJSON('ma_orders', []);
    let touched = false;
    list.forEach(o => { if (o.buyer === oldName) { o.buyer = name; touched = true; } });
    if (touched) saveJSON('ma_orders', list);
    renderAccount();
    cloudUpdateProfile({ nickname: name });
    toast('改名成功, 以后叫你 ' + name + ' 啦');
  });

  // v34: 用户中心修改密码(验证旧密码)
  const pwBtn = document.getElementById('pwBtn');
  if (pwBtn) pwBtn.addEventListener('click', () => {
    const user = currentUser(); if (!user) return;
    const device = loadJSON('ma_device', null);
    const oldP = document.getElementById('pwOld').value;
    const p1 = document.getElementById('pwNew').value;
    const p2 = document.getElementById('pwNew2').value;
    if (!device) { toast('设备凭证丢失, 请联系客服'); return; }
    if (hashPass(oldP) !== device.pass) { toast('当前密码不对'); return; }
    if (p1.length < 6) { toast('新密码至少 6 位'); return; }
    if (p1 !== p2) { toast('两次新密码不一致'); return; }
    if (hashPass(p1) === device.pass) { toast('新旧密码一样, 换个新的吧'); return; }
    if (applyNewPassword(user.name, p1)) {
      document.getElementById('pwOld').value = '';
      document.getElementById('pwNew').value = '';
      document.getElementById('pwNew2').value = '';
      toast('✅ 密码修改成功, 下次登录用新密码');
    }
  });

  /* ---- v36: 订单详情弹窗(事件委托, 订单卡动态渲染) ---- */
  const odOverlay = document.getElementById('odOverlay');
  if (odOverlay) {
    document.getElementById('odClose').addEventListener('click', closeOrderDetail);
    odOverlay.addEventListener('click', e => { if (e.target === odOverlay) closeOrderDetail(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && odOverlay.classList.contains('open')) closeOrderDetail();
    });
    const oList = document.getElementById('orderList');
    if (oList) {
      oList.addEventListener('click', e => {
        const card = e.target.closest('.order-card');
        if (!card) return;
        const id = card.dataset.id;
        const user = currentUser();
        const list = loadJSON('ma_orders', []);
        const o = list.find(x => x.id === id && (!user || x.buyer === user.name));
        if (o) openOrderDetail(o);
      });
      oList.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('order-card')) e.target.click();
      });
    }
  }
}


/* ============================================
   疗愈社区 —— Supabase 云端聊天(群聊 · 好友 · 私聊)
   · 注册即建档(profiles 由数据库触发器创建)
   · 群聊消息永久保留; 新成员只能看到加入之后的消息(微信群机制, 服务端 RLS 强制)
   · Realtime 订阅: 别人发言 / 新人加入 / 好友申请, 实时出现
   · 消息内容一律 textContent 注入, 防 XSS
   未配置 SUPABASE_URL 时社区显示「还在准备中」, 不影响其他功能
   ============================================ */
let sb = null;                              // supabase 客户端(懒初始化)
const cm = {                                // 社区运行时状态
  gen: 0,                                   // 进入代数(快速切换视图防串台)
  convId: null,                             // 当前会话(community 或 dm)
  groupConvId: null,                        // 群聊固定会话 id
  dmWith: null,                             // 私聊对象 {id,name,avatar}
  uid: null,                                // 我的云端 uid
  myJoinAt: null,                           // 我的加入时间(服务端真值)
  channels: [], dmChannel: null,            // realtime 订阅
  lastMsgId: 0, firstMsgId: 0, hasOlder: false,
  friends: [], myPending: new Set(),
  profileCache: {},
  reqCount: 0, pcardId: null, pcardFriend: false,
  entered: false, online: false,
  announcement: null, isOwner: false,          // v36.4 临时公告栏
  annSeen: '', announceCollapsed: true,        // v41 公告默认折叠: seen=上次用户确认的 updated_at
  noticeCollapsed: true,                       // v47 永久公告默认折叠
  unread: {},                                  // v36.6 私聊未读 { 对方uid: 条数 } (localStorage ma_unread_dm)
  dmGlobalChannel: null, lastDmToast: 0,       // v36.6 全站私聊订阅 + toast 节流
  friendMeta: {},                              // v36.7 好友元数据 { uid: {note,pinned,lastMsgAt,...} }
};

function sbReady() {
  if (!COMMUNITY_CONF.SUPABASE_URL || !COMMUNITY_CONF.SUPABASE_ANON_KEY) return false;
  if (typeof window.supabase === 'undefined') return false;
  if (!sb) {
    try { sb = window.supabase.createClient(COMMUNITY_CONF.SUPABASE_URL, COMMUNITY_CONF.SUPABASE_ANON_KEY); }
    catch (e) { return false; }
  }
  return true;
}
/* 云端密码 = 'MA-' + 本地哈希(恒≥6位, 明文永不上传) —— 老账号可确定性桥接 */
function cloudPass(localHash) { return 'MA-' + localHash; }

function ensureDeviceUuid() {
  let u = null;
  try { u = localStorage.getItem('ma_uuid'); } catch (e) {}
  if (!u) {
    u = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
      : 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    try { localStorage.setItem('ma_uuid', u); } catch (e) {}
  }
  return u;
}

/* 确保云端身份: 有会话直接用; 没有就凭设备哈希确定性注册/登录 */
let _cloudEnsureUser = null;   // v40: 防重入——注册瞬间 cloudSyncAccount 与 enterCommunity 会并发调用, 共享同一次执行避免重复 signUp 竞态
async function cloudEnsureUser() {
  if (!sbReady()) return null;
  if (_cloudEnsureUser) return _cloudEnsureUser;
  _cloudEnsureUser = (async () => {
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (session && session.user) { cm.uid = session.user.id; return cm.uid; }
      const device = loadJSON('ma_device', null);
      const local = currentUser();
      if (!device || !local) return null;
      const email = ensureDeviceUuid() + '@device.mailinator.com';
      const password = cloudPass(device.pass);
      let up = await sb.auth.signUp({ email, password });
      if (up.error) {
        // 账号可能已存在 / 并发建号 / 瞬时服务端错误 → 兜底直接登录一次(失败无副作用)
        const sgn = await sb.auth.signInWithPassword({ email, password });
        if (!sgn.error) up = sgn;
      }
      if (up.error) return null;
      const { data: { session: s2 } } = await sb.auth.getSession();
      if (!s2 || !s2.user) {
        toast('云端登录没成功——去 Supabase 检查一下「邮箱确认」是否已关闭哦');
        return null;
      }
      cm.uid = s2.user.id;
      return cm.uid;
    } catch (e) { return null; }
  })().finally(() => { _cloudEnsureUser = null; });
  return _cloudEnsureUser;
}

/* 本地昵称/头像 → 云端 profiles */
async function cloudUpdateProfile(patch) {
  if (!sbReady() || !cm.uid) return;
  try { await sb.from('profiles').upsert(Object.assign({ id: cm.uid }, patch)); } catch (e) {}
}

async function cloudSyncAccount() {
  try { await cloudEnsureUser(); } catch (e) { /* 静默, 下次进社区重试 */ }
}
async function cloudSignOut() {
  if (!sbReady()) return;
  try { await sb.auth.signOut(); } catch (e) {}
}

/* ---------- 进出社区 ---------- */
async function enterCommunity() {
  const gate = document.getElementById('cmGate');
  const locked = document.getElementById('cmLocked');
  const offline = document.getElementById('cmOffline');
  const left = document.getElementById('cmLeft');
  const body = document.getElementById('cmBody');
  const inputBar = document.getElementById('cmInputBar');
  const gen = ++cm.gen;
  gate.hidden = true; locked.hidden = true; offline.hidden = true;
  if (left) left.hidden = true;
  body.hidden = true; inputBar.hidden = true;

  // 未配置 Supabase → 准备中
  if (!sbReady()) { offline.hidden = false; return; }

  // 未注册 → 门禁
  const user = currentUser();
  if (!user) {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('ma_cm_gate') === '1'; } catch (e) {}
    if (dismissed) locked.hidden = false; else gate.hidden = false;
    return;
  }

  // 已注册 → 桥接云端(老账号自动迁移)
  const uid = await cloudEnsureUser();
  if (gen !== cm.gen) return;
  if (!uid) {
    showCmOffline('🌫️ 连不上社区服务器', '网络好像不太顺, 稍后再来看看~');
    return;
  }
  const my = await loadMyProfile();
  if (gen !== cm.gen) return;
  if (!my) { showCmOffline('🌫️ 连不上社区服务器', '网络好像不太顺, 稍后再来看看~'); return; }
  cm.myJoinAt = my.created_at;
  // 每次进社区同步昵称头像; v34: 设置过群昵称则以群昵称为准
  const groupNick = localStorage.getItem('ma_group_nick');
  const patch = { nickname: groupNick || user.name, avatar: user.avatar };
  // v34: 疗友号以云端 profiles.friend_code 为准(SQL 触发器生成, 全局唯一),
  //      只在云端确实没有时才用本地兜底号补齐, 绝不覆盖云端唯一值
  if (!my.friend_code) patch.friend_code = getFriendCode();
  cloudUpdateProfile(patch);
  // v34: 云端疗友号回写本地
  if (my.friend_code) localStorage.setItem('ma_friend_code', my.friend_code);

  // 群聊固定会话
  try {
    const { data, error } = await sb.from('conversations').select('id').eq('slug', 'community').single();
    if (error || !data) { showCmOffline('🌱 社区还在初始化', '请确认已运行初始化 SQL~'); return; }
    cm.groupConvId = data.id;
    try { localStorage.setItem('ma_group_conv', data.id); } catch (e) {}   // v36.6: 缓存会话id, 页面加载即可全站订阅
  } catch (e) { showCmOffline('🌫️ 连不上社区服务器', '网络好像不太顺, 稍后再来看看~'); return; }

  if (cm.dmWith) setDmMode(cm.dmWith); else { cm.convId = cm.groupConvId; setDmMode(null); }
  await loadAnnouncement();
  if (gen !== cm.gen) return;
  body.hidden = false; inputBar.hidden = false;
  if (!cm.dmWith) cmGroupMarkRead();   // v39: 打开社区看群聊 → 群聊红点消失

  await loadCommunityMessages();
  if (gen !== cm.gen) return;
  refreshMemberCount();
  loadFriendList();
  refreshRequestList();
  subscribeAll();
  cm.entered = true;
}

function leaveCommunity() {
  cm.gen++;
  cm.entered = false;
  cm.online = false;
  unsubscribeAll();
  closeProfileCard();
}

function showCmOffline(title, sub) {
  document.getElementById('cmOfflineTitle').textContent = title;
  document.getElementById('cmOfflineSub').textContent = sub;
  document.getElementById('cmOffline').hidden = false;
}

async function loadMyProfile() {
  try {
    const { data, error } = await sb.from('profiles')
      .select('id, nickname, avatar, created_at, friend_code').eq('id', cm.uid).single();
    if (error || !data) return null;
    cm.profileCache[data.id] = data;
    return data;
  } catch (e) { return null; }
}

async function refreshMemberCount() {
  try {
    // v34: 成员数 = 当前在社区内的人(left_at 为空), 退出的不算
    // v37.3: 虚拟账号(默认/测试昵称)不计数 —— 两步查询: 先取幽灵 id, 再排除计数
    let ghostIds = [];
    try {
      const g = await sb.from('profiles').select('id').in('nickname', GHOST_NICKNAMES);
      ghostIds = (g.data || []).map(x => x.id);
    } catch (e) {}
    let q = sb.from('community_memberships').select('user_id', { count: 'exact', head: true }).is('left_at', null);
    if (ghostIds.length) q = q.not('user_id', 'in', '(' + ghostIds.map(JSON.stringify).join(',') + ')');
    const { count } = await q;
    const el = document.getElementById('cmMemberCount');
    if (el) el.textContent = count == null ? '…' : count;
  } catch (e) {}
}

/* ---------- 绑定 ---------- */
function bindCommunity() {
  if (!document.getElementById('community')) return;

  // 三个 tab
  document.querySelectorAll('.cm-tab').forEach(t => {
    t.addEventListener('click', () => switchCmTab(t.dataset.tab));
  });

  // 门禁: 去注册 / 关闭提示 (v35: 未注册用户从社区过来 → 直接给注册卡, 少点一步)
  const goReg = () => {
    showView('account');
    history.replaceState(null, '', '#account');
    const reg = document.getElementById('acctReg');
    const login = document.getElementById('acctLogin');
    if (reg && login && !currentUser()) { reg.hidden = false; login.hidden = true; }
    toast('先注册一个账号, 注册好就能进社区啦');
  };
  document.getElementById('cmGoReg').addEventListener('click', goReg);
  document.getElementById('cmLockedReg').addEventListener('click', goReg);
  document.getElementById('cmGateClose').addEventListener('click', () => {
    document.getElementById('cmGate').hidden = true;
    document.getElementById('cmLocked').hidden = false;
    try { sessionStorage.setItem('ma_cm_gate', '1'); } catch (e) {}
  });

  // 发送(点击 + 回车)
  document.getElementById('cmSend').addEventListener('click', sendCommunityMessage);
  document.getElementById('cmInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendCommunityMessage();
  });

  // v36.4 临时公告栏(群主可编辑)
  const annEditBtn = document.getElementById('cmAnnEditBtn');
  const annCancel = document.getElementById('cmAnnCancel');
  const annConfirm = document.getElementById('cmAnnConfirm');
  if (annEditBtn) annEditBtn.addEventListener('click', () => {
    // v40: 群主点编辑 → 强制展开(防编辑框被折叠藏起)
    cm.announceCollapsed = false;
    saveAnnState();
    applyAnnounceCollapse();
    const edit = document.getElementById('cmAnnEdit');
    if (edit) { edit.hidden = false; }
    const input = document.getElementById('cmAnnInput');
    if (input) input.value = (cm.announcement && cm.announcement.content) || '';
    annEditBtn.hidden = true;
  });
  const annFold = document.getElementById('cmAnnFold');
  if (annFold) annFold.addEventListener('click', toggleAnnounce);   // v40: 折叠/展开

  /* v47 永久公告可折叠 */
  const noticeFold = document.getElementById('cmNoticeFold');
  if (noticeFold) noticeFold.addEventListener('click', () => {
    cm.noticeCollapsed = !cm.noticeCollapsed;
    try { localStorage.setItem('ma_notice_state', cm.noticeCollapsed ? '1' : '0'); } catch (e) {}
    const wrap = document.getElementById('cmNotice');
    if (wrap) wrap.classList.toggle('cm-notice-collapsed', cm.noticeCollapsed);
    noticeFold.textContent = cm.noticeCollapsed ? '▾' : '▴';
    noticeFold.setAttribute('aria-expanded', String(!cm.noticeCollapsed));
  });
  /* v47 加载永久公告折叠状态 */
  try {
    const v = localStorage.getItem('ma_notice_state');
    cm.noticeCollapsed = v === null ? true : v === '1';
  } catch (e) { cm.noticeCollapsed = true; }
  {
    const wrap = document.getElementById('cmNotice');
    if (wrap) wrap.classList.toggle('cm-notice-collapsed', cm.noticeCollapsed);
    if (noticeFold) {
      noticeFold.textContent = cm.noticeCollapsed ? '▾' : '▴';
      noticeFold.setAttribute('aria-expanded', String(!cm.noticeCollapsed));
    }
  }
  if (annCancel) annCancel.addEventListener('click', () => {
    const edit = document.getElementById('cmAnnEdit');
    if (edit) edit.hidden = true;
    annEditBtn.hidden = !cm.isOwner;
  });
  if (annConfirm) annConfirm.addEventListener('click', confirmAnnouncement);

  // 私聊 ↔ 群聊
  document.getElementById('cmDmBack').addEventListener('click', backToGroupChat);

  // 向上翻页
  document.getElementById('cmLoadOlder').addEventListener('click', loadOlderMessages);

  // 资料卡
  document.getElementById('pcClose').addEventListener('click', closeProfileCard);
  const pcOverlay = document.getElementById('pcOverlay');
  pcOverlay.addEventListener('click', e => { if (e.target === pcOverlay) closeProfileCard(); });
  document.getElementById('pcAddFriend').addEventListener('click', () => {
    if (cm.pcardId) sendFriendRequest(cm.pcardId);
  });
  document.getElementById('pcDm').addEventListener('click', () => {
    if (cm.pcardId && cm.pcardFriend) { const id = cm.pcardId; closeProfileCard(); openDm(id); }
  });

  // footer 入口(手机端导航隐藏, 这里是主入口)
  const footCommunity = document.getElementById('footCommunity');
  if (footCommunity) {
    footCommunity.addEventListener('click', e => {
      e.preventDefault();
      showView('community');
      history.replaceState(null, '', '#community');
    });
  }

  // 网络恢复 / 回前台 → 增量补齐
  window.addEventListener('online', resyncAfterReconnect);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.currentView === 'community') resyncAfterReconnect();
  });
}

function switchCmTab(tab) {
  document.querySelectorAll('.cm-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('cmPanelChat').hidden = tab !== 'chat';
  document.getElementById('cmPanelFriends').hidden = tab !== 'friends';
  document.getElementById('cmPanelMembers').hidden = tab !== 'members';
  if (tab === 'friends') { refreshRequestList(); loadFriendList(); }
  if (tab === 'members') renderMembers();
  if (tab === 'chat' && !cm.dmWith) cmGroupMarkRead();   // v39: 点群聊 tab 视为已读
}

/* ---------- 消息 ---------- */
async function loadCommunityMessages() {
  const box = document.getElementById('cmMsgs');
  box.innerHTML = '';
  cm.firstMsgId = 0; cm.lastMsgId = 0; cm.hasOlder = false;
  document.getElementById('cmLoadOlder').hidden = true;
  let rows = [];
  try {
    const q = sb.from('messages').select('id, sender_id, content, created_at')
      .eq('conversation_id', cm.convId);
    if (!cm.dmWith && cm.myJoinAt) q.gte('created_at', cm.myJoinAt);   // 群聊只看加入之后的(微信群机制)
    const { data, error } = await q.order('id', { ascending: false }).limit(50);
    if (error) throw error;
    rows = (data || []).reverse();
  } catch (e) {
    box.innerHTML = '<p class="cm-empty">消息加载失败了, 稍后再试试~</p>';
    return;
  }
  if (!rows.length) {
    box.innerHTML = '<p class="cm-empty">' + (cm.dmWith ? '和 TA 说第一句话吧 👋' : '还没有人说话, 来打个招呼吧 👋') + '</p>';
    return;
  }
  await hydrateProfiles(rows.map(r => r.sender_id));
  rows.forEach(m => appendMsgBubble(m, false));
  cm.firstMsgId = rows[0].id;
  cm.lastMsgId = rows[rows.length - 1].id;
  cm.hasOlder = rows.length >= 50;
  document.getElementById('cmLoadOlder').hidden = !cm.hasOlder;
  box.scrollTop = box.scrollHeight;
}

async function loadOlderMessages() {
  if (!cm.firstMsgId) return;
  const box = document.getElementById('cmMsgs');
  const btn = document.getElementById('cmLoadOlder');
  btn.textContent = '加载中…';
  try {
    const q = sb.from('messages').select('id, sender_id, content, created_at')
      .eq('conversation_id', cm.convId).lt('id', cm.firstMsgId);
    if (!cm.dmWith && cm.myJoinAt) q.gte('created_at', cm.myJoinAt);
    const { data, error } = await q.order('id', { ascending: false }).limit(30);
    if (error) throw error;
    const rows = (data || []).reverse();
    if (!rows.length) { cm.hasOlder = false; btn.hidden = true; return; }
    await hydrateProfiles(rows.map(r => r.sender_id));
    const prevHeight = box.scrollHeight;
    rows.forEach(m => {
      if (box.querySelector('.cm-msg[data-id="' + m.id + '"]')) return;
      box.insertBefore(buildMsgRow(m), box.firstChild);
    });
    cm.firstMsgId = rows[0].id;
    cm.hasOlder = rows.length >= 30;
    btn.hidden = !cm.hasOlder;
    box.scrollTop = box.scrollHeight - prevHeight;   // 保持视口位置
  } catch (e) { /* noop */ }
  btn.textContent = '查看更早的消息';
}

async function hydrateProfiles(ids) {
  const missing = [...new Set(ids)].filter(id => id && !cm.profileCache[id]);
  if (!missing.length) return;
  try {
    const { data } = await sb.from('profiles').select('id, nickname, avatar, created_at').in('id', missing);
    (data || []).forEach(p => { cm.profileCache[p.id] = p; });
  } catch (e) {}
}

/* 构建一条消息气泡(内容用 textContent, 防 XSS) */
function buildMsgRow(m) {
  const mine = m.sender_id === cm.uid;
  const prof = mine ? null : cm.profileCache[m.sender_id];
  const local = currentUser();
  const row = document.createElement('div');
  row.className = 'cm-msg' + (mine ? ' me' : '');
  row.dataset.id = m.id;

  const av = document.createElement('span');
  av.className = 'cm-avatar';
  av.textContent = mine ? (local ? local.avatar : '🌙') : ((prof && prof.avatar) || '🌙');
  if (!mine) {
    av.title = cmDisplayName(prof);   // v37.3: 虚拟账号显示"匿名疗友"
    if (!isGhostNick(prof && prof.nickname)) av.addEventListener('click', () => openProfileCard(m.sender_id));
  }

  const col = document.createElement('div');
  col.className = 'cm-col';
  if (!mine) {
    const name = document.createElement('p');
    name.className = 'cm-name';
    name.textContent = cmDisplayName(prof);   // v37.3: 虚拟账号显示"匿名疗友"
    col.appendChild(name);
  }
  const bubble = document.createElement('div');
  bubble.className = 'cm-bubble';
  bubble.textContent = m.content;
  const time = document.createElement('p');
  time.className = 'cm-time';
  time.textContent = fmtCmTime(m.created_at);
  col.appendChild(bubble);
  col.appendChild(time);

  row.appendChild(av);
  row.appendChild(col);
  return row;
}

function appendMsgBubble(m, scroll) {
  const box = document.getElementById('cmMsgs');
  if (!box) return;
  if (box.querySelector('.cm-empty')) box.innerHTML = '';
  if (box.querySelector('.cm-msg[data-id="' + m.id + '"]')) return;   // realtime 回流去重
  box.appendChild(buildMsgRow(m));
  if (m.id > cm.lastMsgId) cm.lastMsgId = m.id;
  if (!cm.firstMsgId || m.id < cm.firstMsgId) cm.firstMsgId = m.id;
  if (scroll !== false) box.scrollTop = box.scrollHeight;
}

function fmtCmTime(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  if (d.toDateString() === now.toDateString()) return hm;
  return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + hm;
}

function showSystemBubble(text) {
  const box = document.getElementById('cmMsgs');
  if (!box || cm.dmWith) return;
  if (box.querySelector('.cm-empty')) box.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'cm-sys';
  p.textContent = text;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

async function sendCommunityMessage() {
  const input = document.getElementById('cmInput');
  const text = input.value.trim();
  if (!text) return;
  if (!cm.convId || !cm.uid) { toast('社区还没连上, 稍等一下~'); return; }
  input.value = '';
  try {
    const { data, error } = await sb.from('messages')
      .insert({ conversation_id: cm.convId, sender_id: cm.uid, content: text })
      .select('id, sender_id, content, created_at').single();
    if (error) throw error;
    appendMsgBubble(data, true);
    // v36.7: 私聊发出后, 该好友按最后消息时间重排(微信式)
    if (cm.dmWith && cm.dmWith.id) {
      const fr = cm.friends.find(x => x.id === cm.dmWith.id);
      if (fr) {
        fr.lastMsgAt = data.created_at;
        fr.lastMsg = text;
        fr.lastSender = cm.uid;
        cm.friends.sort(sortFriends);
        reorderFriendRows();
      }
    }
  } catch (e) {
    input.value = text;
    toast('这条没发出去, 网络好像不太顺, 再试一次');
  }
}

/* ========== v40 公告折叠: 一行标题栏 + 新公告自动展开 ========== */
function loadAnnState() {
  try {
    const s = JSON.parse(localStorage.getItem('ma_ann_state') || '{}') || {};
    // v41 迁移: 老用户首次加载 v41 代码, 强制设为折叠(避免打开页面就被公告占屏)
    if (!localStorage.getItem('ma_ann_v41')) {
      s.collapsed = true;
      localStorage.setItem('ma_ann_v41', '1');
    }
    cm.annSeen = s.seen || '';
    cm.announceCollapsed = s.collapsed !== false;   // v41: 默认折叠, 旧数据若显式 false 也尊重
  } catch (e) { cm.annSeen = ''; cm.announceCollapsed = true; }
}
function saveAnnState() {
  try {
    localStorage.setItem('ma_ann_state', JSON.stringify({
      seen: cm.annSeen || '',
      collapsed: !!cm.announceCollapsed,
    }));
  } catch (e) {}
}
/* 按 collapsed 状态套用折叠样式: 正文/编辑区/编辑按钮隐藏, 折叠按钮图标切换 */
function applyAnnounceCollapse() {
  const wrap = document.getElementById('cmAnnounce');
  const fold = document.getElementById('cmAnnFold');
  if (!wrap) return;
  wrap.classList.toggle('cm-ann-collapsed', !!cm.announceCollapsed);
  if (fold) {
    fold.textContent = cm.announceCollapsed ? '▾' : '▴';
    fold.setAttribute('aria-expanded', String(!cm.announceCollapsed));
    fold.title = cm.announceCollapsed ? '展开公告' : '收起公告';
  }
}
/* 折叠/展开切换; 手动折叠时记录 seen=当前公告 updated_at(同内容不再自动展开) */
function toggleAnnounce() {
  cm.announceCollapsed = !cm.announceCollapsed;
  if (cm.announceCollapsed && cm.announcement && cm.announcement.updated_at) {
    cm.annSeen = cm.announcement.updated_at;
  }
  saveAnnState();
  applyAnnounceCollapse();
  const newEl = document.getElementById('cmAnnNew');
  if (newEl) newEl.hidden = true;      // 手动折叠 → "新"角标消失
}
/* 新公告判定: updated_at 比 seen 新 → 显示"新"角标; 首访静默标记已读, 不自动展开 */
function checkAnnounceNew() {
  const wrap = document.getElementById('cmAnnounce');
  const newEl = document.getElementById('cmAnnNew');
  if (!cm.announcement || !cm.announcement.updated_at) { if (newEl) newEl.hidden = true; return; }
  const updatedMs = new Date(cm.announcement.updated_at).getTime();
  // v41 首访: annSeen 为空, 静默标记当前 updated_at 为 seen, 保持折叠(不打扰)
  if (!cm.annSeen) {
    cm.annSeen = cm.announcement.updated_at;
    saveAnnState();
    if (newEl) newEl.hidden = true;
    if (wrap) applyAnnounceCollapse();
    return;
  }
  const isNew = updatedMs > new Date(cm.annSeen).getTime();
  if (isNew) {
    // v41: 只标"新"角标, 不再强制展开(用户想看时自己点)
    if (newEl) newEl.hidden = false;
  } else if (newEl) {
    newEl.hidden = true;
  }
  if (wrap) applyAnnounceCollapse();
}

/* ---------- v36.4 临时公告栏 ---------- */
async function loadAnnouncement() {
  loadAnnState();                       // v40: 恢复折叠状态/seen
  const wrap = document.getElementById('cmAnnounce');
  if (!wrap) return;
  cm.announcement = null; cm.isOwner = false;
  wrap.hidden = true;
  if (!sb || !cm.uid) return;
  try {
    const { data, error } = await sb.from('community_announcements')
      .select('id, owner_id, content, created_at, updated_at').limit(1).maybeSingle();
    if (error || !data) { wrap.hidden = true; return; }   // 表还没建(未跑 SQL) → 隐藏, 不打扰
    cm.announcement = data;
    cm.isOwner = data.owner_id === cm.uid;
    renderAnnouncement();
    wrap.hidden = false;
  } catch (e) { wrap.hidden = true; }
}

function renderAnnouncement() {
  const wrap = document.getElementById('cmAnnounce');
  if (!wrap || !cm.announcement) return;
  const a = cm.announcement;
  const ownerEl = document.getElementById('cmAnnOwner');
  const timeEl = document.getElementById('cmAnnTime');
  const textEl = document.getElementById('cmAnnText');
  const editBtn = document.getElementById('cmAnnEditBtn');
  const edit = document.getElementById('cmAnnEdit');
  if (ownerEl) ownerEl.textContent = '👑 群主发布';
  if (timeEl) {
    try {
      timeEl.textContent = new Date(a.updated_at).toLocaleString('zh-CN',
        { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { timeEl.textContent = ''; }
  }
  if (textEl) textEl.textContent = a.content || '（暂无公告）';
  if (editBtn) editBtn.hidden = !cm.isOwner;
  if (edit) edit.hidden = true;
  applyAnnounceCollapse();              // v40: 折叠态 + 图标
  checkAnnounceNew();                   // v40: 新公告 → 自动展开 + "新"角标
}

/* 群主确认发布: 存云端 + 自动 @所有人(群聊发一条公告消息) */
async function confirmAnnouncement() {
  const input = document.getElementById('cmAnnInput');
  const text = (input.value || '').trim();
  if (!text) { toast('公告内容不能是空的哦'); return; }
  if (!cm.isOwner) { toast('只有群主才能发布公告~'); return; }
  const btn = document.getElementById('cmAnnConfirm');
  btn.disabled = true; btn.textContent = '发布中…';
  try {
    const { data, error } = await sb.rpc('update_announcement', { new_content: text });
    if (error) throw error;
    cm.announcement = Array.isArray(data) ? data[0] : data;
    cm.announceCollapsed = false;                                  // v40: 群主发布 → 强制展开
    cm.annSeen = cm.announcement.updated_at || cm.annSeen;         // 自己发布不算"新"
    saveAnnState();
    renderAnnouncement();
    await postGroupMsg('📢【群公告】@所有人 ' + text);
    toast('✅ 公告已发布, 已 @所有人');
  } catch (e) {
    toast('公告发布失败: ' + ((e && e.message) || '网络不太顺'));
  } finally {
    btn.disabled = false; btn.textContent = '确认发布 · @所有人';
  }
}

/* 往群聊固定会话发一条消息(公告用, 直接云端插入) */
async function postGroupMsg(content) {
  if (!cm.groupConvId || !cm.uid) return;
  try {
    await sb.from('messages').insert({ conversation_id: cm.groupConvId, sender_id: cm.uid, content });
  } catch (e) {}
}

/* ---------- 成员 ---------- */
/* v37.3 防复发: 设备自动账号(默认/测试昵称)在成员列表隐身
   机制: 设备即账号 → 每次换浏览器/设备打开社区都会自动注册一个云账号,
   昵称同步自本地用户名(测试时通常填"小疗友")或 REST 注册默认"神秘疗愈师"。
   这里把这些已知虚拟账号昵称过滤掉: 不显示在成员列表/成员数/加入提示, 聊天里显示为"匿名疗友"。 */
const GHOST_NICKNAMES = ['小疗友', '神秘疗愈师'];
function isGhostNick(n) { return !!n && GHOST_NICKNAMES.indexOf(n) !== -1; }
function cmDisplayName(p, fb) { return isGhostNick(p && p.nickname) ? '匿名疗友' : ((p && p.nickname) || fb || '小伙伴'); }

async function renderMembers() {
  const grid = document.getElementById('cmMemberGrid');
  if (!grid) return;
  grid.innerHTML = '<p class="cm-empty">加载中…</p>';
  try {
    const { data, error } = await sb.from('profiles')
      .select('id, nickname, avatar, created_at')
      .not('nickname', 'in', '("小疗友","神秘疗愈师")')   // v37.3: 虚拟账号隐身
      .order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    const list = (data || []).filter(p => !isGhostNick(p.nickname));   // 前端兜底
    grid.innerHTML = '';
    list.forEach(p => {
      cm.profileCache[p.id] = p;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'cm-member' + (p.id === cm.uid ? ' self' : '');
      const av = document.createElement('span');
      av.className = 'cm-member-avatar';
      av.textContent = p.avatar || '🌙';
      const nm = document.createElement('p');
      nm.className = 'cm-member-name';
      nm.textContent = (p.nickname || '小伙伴') + (p.id === cm.uid ? '(我)' : '');
      card.appendChild(av);
      card.appendChild(nm);
      card.addEventListener('click', () => openProfileCard(p.id));
      grid.appendChild(card);
    });
  } catch (e) {
    grid.innerHTML = '<p class="cm-empty">成员加载失败了, 稍后再试试~</p>';
  }
}

/* ---------- 资料卡 ---------- */
async function openProfileCard(userId) {
  await hydrateProfiles([userId]);
  const p = cm.profileCache[userId];
  if (!p) { toast('这个小伙伴的资料还没同步到~'); return; }
  cm.pcardId = userId;
  cm.pcardFriend = isFriend(userId);
  const self = userId === cm.uid;

  document.getElementById('pcAvatar').textContent = p.avatar || '🌙';
  document.getElementById('pcName').textContent = (p.nickname || '小伙伴') + (self ? '(这是我)' : '');
  const d = new Date(p.created_at);
  const join = isNaN(d.getTime()) ? '' :
    '加入于 ' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  document.getElementById('pcSub').textContent = join + (self ? '' : ' · 疗友号 ' + (p.friend_code || String(userId).slice(-4).toUpperCase()));

  const addBtn = document.getElementById('pcAddFriend');
  const dmBtn = document.getElementById('pcDm');
  addBtn.hidden = self;
  dmBtn.hidden = self;
  if (!self) {
    dmBtn.disabled = !cm.pcardFriend;
    dmBtn.textContent = cm.pcardFriend ? '发消息' : '成为好友后可私聊';
    const sent = cm.myPending.has(userId);
    addBtn.disabled = cm.pcardFriend || sent;
    addBtn.textContent = cm.pcardFriend ? '已经是好友啦' : (sent ? '申请已发出' : '添加好友');
  }
  const ov = document.getElementById('pcOverlay');
  ov.classList.add('open');
  ov.setAttribute('aria-hidden', 'false');
}

function closeProfileCard() {
  const ov = document.getElementById('pcOverlay');
  if (!ov) return;
  ov.classList.remove('open');
  ov.setAttribute('aria-hidden', 'true');
  cm.pcardId = null;
}

/* ---------- 好友 ---------- */
function isFriend(id) { return cm.friends.some(f => f.id === id); }

async function sendFriendRequest(toId) {
  if (toId === cm.uid) { toast('不能加自己为好友哦'); return; }
  try {
    const { error } = await sb.rpc('send_friend_request', { target: toId });
    if (error) { toast(error.message || '申请没发出去, 再试一次'); return; }
    toast('申请已发出, 等对方同意哦');
    cm.myPending.add(toId);
    closeProfileCard();
  } catch (e) { toast('申请没发出去, 稍后再试'); }
}

async function acceptFriendRequest(reqId) {
  try {
    const { error } = await sb.rpc('accept_friend_request', { req_id: reqId });
    if (error) throw error;
    toast('🎉 成为好友啦, 点「好友」可以私聊');
    await refreshRequestList();
    await loadFriendList();
  } catch (e) { toast('操作没成功, 再试一次'); }
}

async function declineFriendRequest(reqId) {
  try {
    const { error } = await sb.from('friend_requests').update({ status: 'declined' }).eq('id', reqId);
    if (error) throw error;
    await refreshRequestList();
  } catch (e) { toast('操作没成功, 再试一次'); }
}

async function refreshRequestList() {
  const wrap = document.getElementById('cmReqs');
  if (!cm.uid) return;
  try {
    const [inc, out] = await Promise.all([
      sb.from('friend_requests').select('id, from_id, status').eq('to_id', cm.uid).eq('status', 'pending'),
      sb.from('friend_requests').select('id, to_id, status').eq('from_id', cm.uid).eq('status', 'pending'),
    ]);
    const incoming = inc.data || [];
    cm.myPending = new Set((out.data || []).map(r => r.to_id));
    cm.reqCount = incoming.length;
    updateFrBadge();
    await hydrateProfiles(incoming.map(r => r.from_id));
    if (!wrap) return;
    if (!incoming.length) { wrap.innerHTML = '<p class="cm-empty">还没有收到申请~</p>'; return; }
    wrap.innerHTML = '';
    incoming.forEach(r => {
      const p = cm.profileCache[r.from_id] || {};
      const row = document.createElement('div');
      row.className = 'cm-req';
      const av = document.createElement('span');
      av.className = 'cm-req-avatar';
      av.textContent = p.avatar || '🌙';
      const nm = document.createElement('p');
      nm.className = 'cm-req-name';
      nm.textContent = p.nickname || '小伙伴';
      const btns = document.createElement('div');
      btns.className = 'cm-req-btns';
      const ok = document.createElement('button');
      ok.type = 'button'; ok.className = 'btn btn-solid small'; ok.textContent = '同意';
      ok.addEventListener('click', () => acceptFriendRequest(r.id));
      const no = document.createElement('button');
      no.type = 'button'; no.className = 'btn btn-ghost small'; no.textContent = '婉拒';
      no.addEventListener('click', () => declineFriendRequest(r.id));
      btns.appendChild(ok); btns.appendChild(no);
      row.appendChild(av); row.appendChild(nm); row.appendChild(btns);
      wrap.appendChild(row);
    });
  } catch (e) { if (wrap) wrap.innerHTML = '<p class="cm-empty">申请加载失败了~</p>'; }
}

function updateFrBadge() {
  const badge = document.getElementById('cmFrBadge');
  if (!badge) return;
  badge.hidden = !cm.reqCount;
  badge.textContent = cm.reqCount || '';
}

/* ---------- 好友列表: 备注 / 置顶 / 按最后消息排序(v36.7, 微信式) ---------- */
function sortFriends(a, b) {
  if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
  const ta = a.lastMsgAt ? new Date(a.lastMsgAt).getTime() : 0;
  const tb = b.lastMsgAt ? new Date(b.lastMsgAt).getTime() : 0;
  return tb - ta;
}
function friendDisplayName(f) { return (f && f.note) || (f && f.nickname) || '小伙伴'; }
function friendPreview(f) {
  if (!f || !f.lastMsg) return '点击开始私聊';
  const txt = f.lastMsg.length > 16 ? f.lastMsg.slice(0, 16) + '…' : f.lastMsg;
  return (f.lastSender && f.lastSender === cm.uid ? '我: ' : '') + txt;
}
function fmtFriendTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts), now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return '昨天';
    return (d.getMonth() + 1) + '-' + d.getDate();
  } catch (e) { return ''; }
}

async function loadFriendList() {
  if (!cm.uid) return;
  try {
    const { data, error } = await sb.rpc('get_friends_with_meta');
    if (error || !data) throw error || new Error('rpc missing');
    cm.friendMeta = {};
    data.forEach(r => { cm.friendMeta[r.friend_id] = r; });
    await hydrateProfiles(data.map(r => r.friend_id));
    cm.friends = data.map(r => Object.assign(
      { id: r.friend_id },
      cm.profileCache[r.friend_id] || {},
      { note: r.note || '', pinned: !!r.pinned, lastMsgAt: r.last_msg_at, lastMsg: r.last_msg, lastSender: r.last_sender }
    ));
    // v43: 云端 RPC 已可用 → 把本地兜底攒的设置迁移上云
    const localPending = Object.keys(localFriendSettings());
    if (localPending.length) { await migrateLocalFriendSettings(); await loadFriendList(); return; }
  } catch (e) {
    // 表/RPC 未建(还没跑 SQL) → 退回旧逻辑 + 本地置顶/备注兜底(v43)
    try {
      const { data, error } = await sb.from('friendships').select('user_a, user_b')
        .or('user_a.eq.' + cm.uid + ',user_b.eq.' + cm.uid);
      if (error) throw error;
      const others = (data || []).map(f => f.user_a === cm.uid ? f.user_b : f.user_a);
      await hydrateProfiles(others);
      const ls = localFriendSettings();
      cm.friends = others.map(id => {
        const p = Object.assign({}, cm.profileCache[id] || {});
        const s = ls[id];
        if (s) { p.note = s.note || ''; p.pinned = !!s.pinned; }
        return p;
      }).filter(Boolean);
    } catch (e2) { cm.friends = []; }
  }
  cm.friends.sort(sortFriends);
  cleanupDmUnread();   // v40: 好友列表就绪即对账, 清孤儿未读key(红点永不消失的根因)
  renderFriendList();
}

function renderFriendList() {
  const wrap = document.getElementById('cmFriendList');
  if (!wrap) return;
  if (!cm.friends.length) {
    wrap.innerHTML = '<p class="cm-empty">还没有好友~ 去「成员」里逛逛, 加个「疗友」吧 🌿</p>';
    return;
  }
  wrap.innerHTML = '';
  cm.friends.forEach(f => wrap.appendChild(buildFriendRow(f)));
  renderUnreadBadges();
}

function buildFriendRow(f) {
  const row = document.createElement('div');
  row.className = 'cm-friend' + (f.pinned ? ' pinned' : '');
  row.dataset.uid = f.id;
  row.setAttribute('role', 'button');
  row.tabIndex = 0;
  const av = document.createElement('span');
  av.className = 'cm-friend-avatar';
  av.textContent = f.avatar || '🌙';
  const info = document.createElement('div');
  info.className = 'cm-friend-info';
  const top = document.createElement('div');
  top.className = 'cm-friend-top';
  const nm = document.createElement('p');
  nm.className = 'cm-friend-name';
  nm.textContent = friendDisplayName(f);
  if (f.note) nm.title = (f.nickname || '') + ' (' + (f.friend_code || '') + ')';
  const tm = document.createElement('span');
  tm.className = 'cm-friend-time';
  tm.textContent = fmtFriendTime(f.lastMsgAt);
  top.appendChild(nm); top.appendChild(tm);
  const sub = document.createElement('p');
  sub.className = 'cm-friend-sub';
  sub.textContent = friendPreview(f);
  info.appendChild(top); info.appendChild(sub);
  const ops = document.createElement('div');
  ops.className = 'cm-friend-ops';
  const pinBtn = document.createElement('button');
  pinBtn.type = 'button';
  pinBtn.className = 'cf-op cf-pin' + (f.pinned ? ' on' : '');
  pinBtn.textContent = '📌';
  pinBtn.title = f.pinned ? '取消置顶' : '置顶';
  pinBtn.addEventListener('click', ev => { ev.stopPropagation(); toggleFriendPin(f.id); });
  const noteBtn = document.createElement('button');
  noteBtn.type = 'button';
  noteBtn.className = 'cf-op cf-note' + (f.note ? ' on' : '');
  noteBtn.textContent = '✎';
  noteBtn.title = f.note ? '改备注' : '加备注';
  noteBtn.addEventListener('click', ev => { ev.stopPropagation(); openFriendNoteEditor(row, f); });
  ops.appendChild(pinBtn); ops.appendChild(noteBtn);
  const dot = document.createElement('i');
  dot.className = 'cm-friend-dot';
  dot.hidden = true;
  row.appendChild(av); row.appendChild(info); row.appendChild(ops); row.appendChild(dot);
  const open = () => openDm(f.id);
  row.addEventListener('click', open);
  row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  return row;
}

/* 轻量重排: 实时收消息时调用, 不重建 DOM(免得打断行内备注编辑) */
function reorderFriendRows() {
  const wrap = document.getElementById('cmFriendList');
  if (!wrap || !cm.friends.length) return;
  const byUid = {};
  wrap.querySelectorAll('.cm-friend').forEach(r => { byUid[r.dataset.uid] = r; });
  cm.friends.forEach(f => { const r = byUid[f.id]; if (r) wrap.appendChild(r); });
  wrap.querySelectorAll('.cm-friend').forEach(r => {
    const f = cm.friends.find(x => x.id === r.dataset.uid);
    if (!f) return;
    r.classList.toggle('pinned', !!f.pinned);
    const nm = r.querySelector('.cm-friend-name'); if (nm) nm.textContent = friendDisplayName(f);
    const tm = r.querySelector('.cm-friend-time'); if (tm) tm.textContent = fmtFriendTime(f.lastMsgAt);
    const sub = r.querySelector('.cm-friend-sub'); if (sub) sub.textContent = friendPreview(f);
    const pin = r.querySelector('.cf-pin'); if (pin) { pin.classList.toggle('on', !!f.pinned); pin.title = f.pinned ? '取消置顶' : '置顶'; }
    const nt = r.querySelector('.cf-note'); if (nt) nt.classList.toggle('on', !!f.note);
  });
  renderUnreadBadges();
}

/* 行内备注编辑(微信式: 点 ✎ 在行里展开输入框) */
function openFriendNoteEditor(row, f) {
  let ed = row.querySelector('.cm-fnote-editor');
  if (ed) { ed.remove(); ed = null; }
  ed = document.createElement('div');
  ed.className = 'cm-fnote-editor';
  const input = document.createElement('input');
  input.className = 'cm-fnote-input';
  input.maxLength = 20;
  input.placeholder = '备注名(最多20字)';
  input.value = f.note || '';
  const ok = document.createElement('button');
  ok.type = 'button'; ok.className = 'btn btn-primary tiny'; ok.textContent = '确定';
  const cancel = document.createElement('button');
  cancel.type = 'button'; cancel.className = 'btn btn-ghost tiny'; cancel.textContent = '取消';
  ed.appendChild(input); ed.appendChild(ok); ed.appendChild(cancel);
  row.appendChild(ed);
  input.focus();
  const close = () => { const e = row.querySelector('.cm-fnote-editor'); if (e) e.remove(); };
  ok.addEventListener('click', async () => {
    const v = input.value.trim();
    ok.disabled = true;
    try {
      await setFriendNote(f.id, v);
      close();
      toast(v ? '备注已更新 ✎' : '已取消备注');
    } catch (e2) { ok.disabled = false; toast('备注没保存上, 再试一次'); }
  });
  cancel.addEventListener('click', close);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') ok.click(); if (e.key === 'Escape') close(); });
}

async function setFriendNote(friendId, note) {
  if (!sb || !cm.uid) throw new Error('offline');
  const { error } = await sb.rpc('set_friend_note', { friend_id: friendId, new_note: note });
  if (error) {
    // v43: SQL 未执行(RPC 不存在) → 本地备注兜底, 同设备持久
    if (isRpcMissing(error)) { setLocalFriendSetting(friendId, { note: note }); applyFriendSetting(friendId, { note: note }); return; }
    throw error;
  }
  const f = cm.friends.find(x => x.id === friendId);
  if (f) f.note = note;
  if (cm.friendMeta) cm.friendMeta[friendId] = Object.assign(cm.friendMeta[friendId] || {}, { note });
  renderFriendList();
}
async function toggleFriendPin(friendId) {
  if (!sb || !cm.uid) { toast('社区没连上, 稍后再试'); return; }
  const f = cm.friends.find(x => x.id === friendId);
  const next = f ? !f.pinned : true;
  let { error } = await sb.rpc('set_friend_pinned', { friend_id: friendId, pinned: next });
  if (error && !isRpcMissing(error)) { toast('操作没成功, 再试一次'); return; }
  if (error) setLocalFriendSetting(friendId, { pinned: next });   // v43: 本地兜底
  if (f) f.pinned = next;
  if (cm.friendMeta) cm.friendMeta[friendId] = Object.assign(cm.friendMeta[friendId] || {}, { pinned: next });
  cm.friends.sort(sortFriends);
  renderFriendList();
  toast(next ? '已置顶 📌' : '已取消置顶');
}

/* ---------- v43: 好友设置本地兜底(supabase-friend-settings.sql 未执行时) ---------- */
function isRpcMissing(err) {
  const msg = (err && (err.message || err.code)) || '';
  return /PGRST202|Could not find the function|schema cache/i.test(String(msg)) || err === 404;
}
function localFriendSettings() {
  try { return JSON.parse(localStorage.getItem('ma_friend_settings') || '{}'); } catch (e) { return {}; }
}
function setLocalFriendSetting(friendId, patch) {
  const all = localFriendSettings();
  all[friendId] = Object.assign(all[friendId] || {}, patch);
  try { localStorage.setItem('ma_friend_settings', JSON.stringify(all)); } catch (e) {}
}
function applyFriendSetting(friendId, patch) {
  const f = cm.friends.find(x => x.id === friendId);
  if (f) Object.assign(f, patch);
  cm.friends.sort(sortFriends);
  renderFriendList();
}
/* 云端 RPC 可用后, 把本地攒的设置迁移上云并清空本地 */
async function migrateLocalFriendSettings() {
  const all = localFriendSettings();
  const ids = Object.keys(all).filter(id => all[id] && (all[id].pinned || all[id].note));
  if (!ids.length) return;
  for (const id of ids) {
    try {
      if (all[id].note) await sb.rpc('set_friend_note', { friend_id: id, new_note: all[id].note });
      if (all[id].pinned) await sb.rpc('set_friend_pinned', { friend_id: id, pinned: true });
    } catch (e) {}
  }
  try { localStorage.removeItem('ma_friend_settings'); } catch (e) {}
}

/* ---------- 私聊 ---------- */
async function openDm(userId) {
  if (!cm.uid) return;
  try {
    const { data, error } = await sb.rpc('create_dm_with', { other_user: userId });
    if (error) throw error;
    await hydrateProfiles([userId]);
    const p = cm.profileCache[userId] || {};
    cm.dmWith = { id: userId, name: p.nickname || '好友', avatar: p.avatar || '🌙' };
    cm.convId = data;
    setDmMode(cm.dmWith);
    switchCmTab('chat');
    dmMarkRead(userId);    // v36.6: 打开会话清未读
    await loadCommunityMessages();
    subscribeDm(data);
  } catch (e) { toast('私聊没打开, 稍后再试试'); }
}

async function backToGroupChat() {
  if (!cm.groupConvId) return;
  unsubscribeDm();
  cm.dmWith = null;
  cm.convId = cm.groupConvId;
  setDmMode(null);
  cmGroupMarkRead();   // v39: 回到群聊 → 群聊红点消失
  switchCmTab('chat');
  await loadCommunityMessages();
}

function setDmMode(dm) {
  const nameEl = document.getElementById('cmTitleName');
  const subEl = document.getElementById('cmTitleSub');
  const backBtn = document.getElementById('cmDmBack');
  const input = document.getElementById('cmInput');
  const notice = document.getElementById('cmNotice');
  const announce = document.getElementById('cmAnnounce');
  const chatTab = document.querySelector('#cmTabs [data-tab="chat"]');
  if (dm) {
    nameEl.textContent = dm.avatar + ' ' + dm.name;
    subEl.hidden = true;
    backBtn.hidden = false;
    input.placeholder = '和 ' + dm.name + ' 私聊中…';
    if (chatTab) chatTab.textContent = '私信';   // v43: 私聊时顶部 tab 不再显示"群聊"
    if (notice) notice.hidden = true;   // 私聊时收起群公告
    if (announce) announce.hidden = true;   // v40: 私聊时连临时公告一起收, 满屏聊天
  } else {
    nameEl.textContent = '疗愈社区';
    subEl.hidden = false;
    backBtn.hidden = true;
    input.placeholder = '说点什么吧…';
    if (chatTab) chatTab.textContent = '群聊';   // v43: 回到群聊恢复文字
    if (notice) notice.hidden = false;
    if (announce) announce.hidden = !cm.announcement;   // v40: 有公告才显示
  }
  document.getElementById('cmLoadOlder').hidden = true;
  cm.hasOlder = false;
}

/* ---------- Realtime ---------- */
function subscribeAll() {
  subscribeCommunity();
  if (cm.dmWith && cm.convId) subscribeDm(cm.convId);
  subscribeDmGlobal();    // v36.6: 全站私聊未读(防重)
}

function subscribeCommunity() {
  if (!sb || !cm.uid || !cm.groupConvId) return;
  const ch = sb.channel('ma-community')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + cm.groupConvId },
      payload => {
        if (cm.dmWith || !payload.new) return;    // 私聊模式不打扰群聊(返回时会重载)
        hydrateProfiles([payload.new.sender_id]).then(() => appendMsgBubble(payload.new, true));
      })
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'profiles' },
      payload => {
        if (!payload.new) return;
        cm.profileCache[payload.new.id] = payload.new;
        refreshMemberCount();
        // v37.3: 虚拟账号加入不弹提示(否则又看到"xxx 加入了社区")
        if (payload.new.id !== cm.uid && !isGhostNick(payload.new.nickname))
          showSystemBubble((payload.new.nickname || '有小伙伴') + ' 加入了社区');
      })
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'friend_requests', filter: 'to_id=eq.' + cm.uid },
      payload => {
        cm.reqCount++;
        updateFrBadge();
        refreshRequestList();
        if (payload.new) {
          hydrateProfiles([payload.new.from_id]).then(() => {
            const p = cm.profileCache[payload.new.from_id];
            cmNotify('📨 ' + ((p && p.nickname) || '有小伙伴') + ' 想加你为好友, 去「好友」看看吧');
          });
        }
      })
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'friendships' },
      () => {
        loadFriendList();
        cmNotify('🎉 你们成为好友啦, 可以私聊了');
      })
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'community_announcements' },
      payload => {
        if (!payload.new) return;
        cm.announcement = payload.new;
        cm.isOwner = payload.new.owner_id === cm.uid;
        renderAnnouncement();
        if (!cm.isOwner && payload.new.content) cmNotify('📢 群主发布了新公告, 快去看看吧');
      })
    .subscribe(status => {
      const conn = document.getElementById('cmConn');
      if (status === 'SUBSCRIBED') { cm.online = true; if (conn) conn.hidden = true; }
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        cm.online = false;
        if (conn && !cm.dmWith) conn.hidden = false;
      }
    });
  cm.channels.push(ch);
}

function subscribeDm(convId) {
  unsubscribeDm();
  if (!sb || !cm.uid) return;
  const ch = sb.channel('ma-dm-' + convId)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + convId },
      payload => {
        if (!payload.new) return;
        hydrateProfiles([payload.new.sender_id]).then(() => appendMsgBubble(payload.new, true));
      })
    .subscribe();
  cm.dmChannel = ch;
  cm.channels.push(ch);
}

function unsubscribeDm() {
  if (cm.dmChannel) {
    try { sb.removeChannel(cm.dmChannel); } catch (e) {}
    cm.channels = cm.channels.filter(c => c !== cm.dmChannel);
    cm.dmChannel = null;
  }
}

/* ========== v36.6 私聊未读小红点 (v39: 群聊也计, 已读即消失) ========== */
function loadDmUnread() {
  try { cm.unread = JSON.parse(localStorage.getItem('ma_unread_dm') || '{}') || {}; }
  catch (e) { cm.unread = {}; }
  cm.unreadGroup = localStorage.getItem('ma_unread_group') === '1' ? 1 : 0;
}
function saveDmUnread() {
  try {
    localStorage.setItem('ma_unread_dm', JSON.stringify(cm.unread));
    localStorage.setItem('ma_unread_group', cm.unreadGroup ? '1' : '0');
  } catch (e) {}
}
/* v40: 未读对账: 删除不在当前好友列表中的孤儿 key(已删好友/幽灵账号残留),
   否则 dmUnreadTotal 恒 >0 → 导航/底部/好友tab 红点永不消失 */
function cleanupDmUnread() {
  if (!cm.unread) cm.unread = {};
  const ids = new Set((cm.friends || []).map(f => f.id));
  let changed = false;
  Object.keys(cm.unread).forEach(k => {
    if (!ids.has(k)) { delete cm.unread[k]; changed = true; }
  });
  if (changed) { saveDmUnread(); renderUnreadBadges(); }
}
function dmUnreadTotal() {
  return Object.values(cm.unread).reduce((s, n) => s + (Number(n) || 0), 0) + (cm.unreadGroup ? 1 : 0);
}
/* 当前是否正在看群聊(社区可见且非私聊模式) → 是则不亮群聊红点 */
function cmGroupVisible() {
  const sec = document.getElementById('community');
  return !!(sec && !sec.hidden && !cm.dmWith);
}
/* 群聊已读: 打开社区/回到群聊时调用, 红点立刻消失 */
function cmGroupMarkRead() {
  if (cm.unreadGroup) { cm.unreadGroup = 0; saveDmUnread(); renderUnreadBadges(); }
}
/* 渲染所有私聊未读红点: 导航 / 底部入口 / 好友tab角标 / 好友列表条目 */
function renderUnreadBadges() {
  const total = dmUnreadTotal();
  const label = total > 99 ? '99+' : (total || '');
  const set = (id, txt, show) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = !show;
    el.textContent = show ? txt : '';
  };
  set('cmNavDot', label, total > 0);
  set('footCmDot', label, total > 0);
  set('cmDmBadge', label, total > 0);
  document.querySelectorAll('.cm-friend').forEach(row => {
    const dot = row.querySelector('.cm-friend-dot');
    const n = cm.unread[row.dataset.uid] || 0;
    if (dot) { dot.hidden = !n; dot.textContent = n > 99 ? '99+' : (n || ''); }
  });
}
/* 收到一条可能是私聊/群聊的消息: 非正在看的会话 → 未读红点(已读即消失) */
function handleIncomingDm(m) {
  if (!m || !m.sender_id || !m.conversation_id) return;
  if (m.sender_id === cm.uid) return;                                    // 自己发的
  // v39: 群聊消息 → 没在看群聊就亮红点(打开社区/回群聊即消失)
  if (cm.groupConvId && m.conversation_id === cm.groupConvId) {
    if (cmGroupVisible()) return;          // 正在看群聊 → 已读
    cm.unreadGroup = 1;
    saveDmUnread();
    renderUnreadBadges();
    return;
  }
  // v36.7: 收到私聊 → 好友列表实时重排(按最后消息时间, 微信式)
  const fr = cm.friends.find(x => x.id === m.sender_id);
  if (!fr) return;    // v40: 非好友(已删/幽灵)的消息不计数不提示, 堵死孤儿key产生路径
  fr.lastMsgAt = m.created_at;
  fr.lastMsg = m.content;
  fr.lastSender = m.sender_id;
  cm.friends.sort(sortFriends);
  reorderFriendRows();
  if (cm.dmWith && cm.dmWith.id === m.sender_id) return;                 // 正在看这个会话
  cm.unread[m.sender_id] = (Number(cm.unread[m.sender_id]) || 0) + 1;
  saveDmUnread();
  renderUnreadBadges();
  // toast 提示(节流 3 秒, 异步补昵称)
  const now = Date.now();
  if (now - cm.lastDmToast > 3000) {
    cm.lastDmToast = now;
    const p = cm.profileCache[m.sender_id];
    if (!p) {
      hydrateProfiles([m.sender_id]).then(() => {
        const pp = cm.profileCache[m.sender_id];
        toast('💬 ' + cmDisplayName(pp, '好友') + ' 发来私聊消息');
      });
    } else {
      toast('💬 ' + cmDisplayName(p, '好友') + ' 发来私聊消息');
    }
  }
}
/* 全站私聊实时订阅: 不管在哪个页面都能收到私聊提示(RLS 只推我参与的会话) */
function subscribeDmGlobal() {
  if (!sb || !cm.uid || !cm.groupConvId) return;
  if (cm.dmGlobalChannel) return;    // 防重
  const ch = sb.channel('ma-dm-global')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      payload => { if (payload && payload.new) handleIncomingDm(payload.new); })
    .subscribe();
  cm.dmGlobalChannel = ch;
}
function unsubscribeDmGlobal() {
  if (cm.dmGlobalChannel) {
    try { sb.removeChannel(cm.dmGlobalChannel); } catch (e) {}
    cm.dmGlobalChannel = null;
  }
}
/* 打开某私聊会话 → 该好友未读清零 (v40: 无条件删除, 处理 0 值残留) */
function dmMarkRead(peerId) {
  if (!peerId) return;
  if (cm.unread[peerId] !== undefined) { delete cm.unread[peerId]; saveDmUnread(); }
  renderUnreadBadges();
}
/* 页面加载: 恢复未读红点 + 已注册设备静默登录并订阅(全站可收私聊提示) */
async function initDmUnread() {
  loadDmUnread();
  renderUnreadBadges();
  if (!sbReady()) return;
  let cached = null;
  try { cached = localStorage.getItem('ma_group_conv'); } catch (e) {}
  if (!cached) return;                      // 没进过社区 → 群聊/私聊分不清, 等进社区再订
  cm.groupConvId = cached;
  if (!(await cloudEnsureUser())) return;   // 未注册/未登录 → 没有私聊可收
  subscribeDmGlobal();
}

function unsubscribeAll() {
  cm.channels.forEach(c => { try { sb && sb.removeChannel(c); } catch (e) {} });
  cm.channels = [];
  cm.dmChannel = null;
}

/* 断网/回前台: 拉增量补齐(realtime 丢包兜底) + 重建订阅 */
async function resyncAfterReconnect() {
  if (!cm.entered || !cm.convId || !cm.uid || !sb) return;
  try {
    const { data, error } = await sb.from('messages')
      .select('id, sender_id, content, created_at')
      .eq('conversation_id', cm.convId).gt('id', cm.lastMsgId)
      .order('id', { ascending: true }).limit(50);
    if (error) throw error;
    if (data && data.length) {
      await hydrateProfiles(data.map(r => r.sender_id));
      data.forEach(m => appendMsgBubble(m, true));
    }
    const conn = document.getElementById('cmConn');
    if (conn && !conn.hidden) { unsubscribeAll(); subscribeAll(); }
    refreshMemberCount();
    loadFriendList();
  } catch (e) {}
}


/* ============================================
   在线客服 —— 快捷问题 + 关键词智能应答
   聊天记录存 localStorage, 下次打开接着聊
   ============================================ */
const SC_QUICK = [
  { key: 'order', label: '怎么下单' },
  { key: 'ship',  label: '订单 / 发货' },
  { key: 'audio', label: '音频怎么替换' },
  { key: 'community', label: '疗愈社区' },
  { key: 'pay',   label: '支付安全吗' },
  { key: 'human', label: '留言给人工' },
];

function scReply(text) {
  const t = text.toLowerCase();
  const has = (...words) => words.some(w => t.includes(w));
  if (has('下单', '买', '购买', '方案', '多少钱', '价格', '怎么买')) {
    return '下单很简单: 打开「购买方案」页, 挑一款加购物车, 点「去结算」填好收货信息就行。安眠夜曲 ¥48 / 释怀微风 ¥58 / 晨光苏醒 ¥38 / 午后禅茶 ¥68, 满 2 件立减 ¥10 哦~';
  }
  if (has('发货', '物流', '快递', '订单', '到货', '多久')) {
    const user = currentUser();
    const list = loadJSON('ma_orders', []);
    const mine = user ? list.filter(o => o.buyer === user.name) : [];
    if (mine.length) {
      const o = mine[0];
      return '帮你查到最近一笔订单 ' + o.id + '(' + o.time + '), 状态: ' + o.status + ', 共 ¥' + o.total + '。正常 48 小时内安排发货, 精油玻璃瓶会加防震棉~';
    }
    return '目前没有查到你的订单。下单后这里能帮你查物流进度, 发货正常 48 小时内, 全国包邮~';
  }
  if (has('音频', '音乐', '声音', '替换', '上传', 'asmr')) {
    return '音频替换在「设置」页的「音频替换」区: 每个声音都有「换我上传」按钮, 选你自己的录音文件就行, 试听满意就用, 不满意随时「恢复默认」。上传的声音只存在你自己的设备里~';
  }
  if (has('支付', '安全', '扣款', '钱', '付款')) {
    return '目前是演示环境, 点「立即付款」只做流程演示, 不会真实扣款, 收货信息也只存在你自己的设备上, 放心玩~';
  }
  if (has('退款', '退货', '退')) {
    return '演示站的订单都只是本地记录, 没有真实扣款, 也就不存在退款啦。正式上线后会支持 7 天无理由退款~';
  }
  if (has('史莱姆', '游戏', '解压', '玩')) {
    return '解压游戏现在有 11 个: 抽象球(1.0 纪念版)、水感果冻捏捏、泡泡纸、切肥皂、DIY 史莱姆(做完直接开罐玩, 有起泡胶/液态玻璃等八种泥)、炭火烤串、冰激凌机、敲木鱼、精油蒸馏、开汽水、做披萨(6 步流水线)、指尖小圆(跟着小圆慢慢长大)。都在「解压游戏」页, 点开就玩~';
  }
  if (has('社区', '疗友', '好友', '私聊', '群聊', '加入社区')) {
    return '「疗愈社区」在顶部导航「我的」旁边(手机端在页面最底部)。注册一个账号就能进: 可以和大家实时聊天、点开别人资料卡加好友、和好友一对一私聊。聊天记录会一直保留; 后来加入的小伙伴看不到你加入之前的消息, 跟微信群一个机制~';
  }
  if (has('返回', '上一页', '怎么回', '后退')) {
    return '每一页的最下面都有一个「← 返回上一页」按钮, 点它就能回到上一个页面, 手机上也一样好用~';
  }
  if (has('关于', '谁做的', '建立者', '站长', 'rosa', 'honey', '初心')) {
    return '这个网站是 Rosa 建立的。想听她做站的初心, 可以点页面底部的「关于这个网站」链接, 或在顶部导航点「关于」~';
  }
  if (has('你好', '在吗', 'hi', 'hello', '嗨')) {
    return '在的~ 有什么可以帮你? 使用问题、订单问题都可以问我 😊';
  }
  if (has('人工', '留言', '投诉', '建议')) {
    return '好哒, 你的留言我已经记下来了, 小编看到会第一时间回复(演示站即时回复)。也可以把想说的直接发在这, 聊天记录会一直保留~';
  }
  return '收到啦~ 这个问题我记下来了。常见问题可以先试试下面的快捷按钮, 或者问我「怎么下单」「怎么替换音频」「查订单」这些, 我都会答 😊';
}

function scBubble(role, text) {
  return '<div class="sc-msg ' + role + '"><span class="sc-bubble">' + text + '</span></div>';
}

function bindSupport() {
  const fab = document.getElementById('supportFab');
  const chat = document.getElementById('supportChat');
  if (!fab || !chat) return;
  const msgs = document.getElementById('scMsgs');
  const chips = document.getElementById('scChips');
  const input = document.getElementById('scInput');

  let history = loadJSON('ma_chat', []);
  function redraw() {
    msgs.innerHTML = history.slice(-30).map(m => scBubble(m.role, m.text)).join('') || '';
    msgs.scrollTop = msgs.scrollHeight;
  }
  function push(role, text) {
    history.push({ role, text });
    history = history.slice(-30);
    saveJSON('ma_chat', history);
    redraw();
  }
  function botSay(text) {
    setTimeout(() => push('bot', text), 420 + Math.random() * 380);
  }

  // 快捷 chips
  SC_QUICK.forEach(q => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sc-chip';
    b.textContent = q.label;
    b.addEventListener('click', () => {
      push('me', q.label);
      botSay(scReply(q.key === 'human' ? '人工留言' : q.label));
    });
    chips.appendChild(b);
  });

  if (!history.length) {
    history.push({ role: 'bot', text: '你好呀, 我是 MUSIC AROMA 的在线小客服 🌿<br>使用问题、订单问题都可以问我, 也可以点下面的快捷按钮~' });
    saveJSON('ma_chat', history);
  }
  redraw();

  function toggle(open) {
    const willOpen = open != null ? open : !chat.classList.contains('open');
    chat.classList.toggle('open', willOpen);
    chat.setAttribute('aria-hidden', String(!willOpen));
    fab.classList.toggle('away', willOpen);
    if (willOpen) {
      document.getElementById('sfBadge').hidden = true;
      setTimeout(() => input.focus(), 200);
    }
  }
  fab.addEventListener('click', () => toggle());
  document.getElementById('supportClose').addEventListener('click', () => toggle(false));

  function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    push('me', text);
    botSay(scReply(text));
  }
  document.getElementById('scSend').addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') send();
  });

  // 首次访问 3 秒后小红点提示
  if (!loadJSON('ma_chat_seen', false)) {
    setTimeout(() => {
      const badge = document.getElementById('sfBadge');
      if (badge && !chat.classList.contains('open')) badge.hidden = false;
    }, 3000);
    saveJSON('ma_chat_seen', true);
  }
}

/* ============================================
   v34 社区扩展 —— 永久公告 · Rosa AI 数字人 · 疗友号 · 退出/重入 · 个性化
   ============================================ */

/* ---------- 社区免打扰(仅本机) ---------- */
function cmDndOn() { return localStorage.getItem('ma_dnd') === '1'; }
function cmNotify(msg) {
  if (cmDndOn()) return;   // 消息免打扰: 静默
  toast(msg);
}

/* ---------- 疗友号 (唯一不重复, 云端 profiles.friend_code 为准, 本地兜底) ---------- */
function getFriendCode() {
  let code = localStorage.getItem('ma_friend_code');
  if (!code) {
    code = 'MA' + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(Math.random() * 90 + 10);
    localStorage.setItem('ma_friend_code', code);
  }
  return code;
}

async function cmSearchByCode(code) {
  const raw = String(code || '').trim().toUpperCase();
  if (!raw) { toast('先输入一个疗友号'); return; }
  if (!sbReady() || !cm.uid) { toast('社区还没连上, 稍等一下~'); return; }
  try {
    const { data, error } = await sb.from('profiles')
      .select('id, nickname, avatar, created_at, friend_code')
      .eq('friend_code', raw).maybeSingle();
    if (error) throw error;
    if (!data) { toast('没找到这个疗友号, 检查一下是不是输错了'); return; }
    if (data.id === cm.uid) { toast('这是你自己的疗友号哦'); return; }
    if (isFriend(data.id)) { toast('TA 已经是你的好友啦, 可以直接私聊'); openProfileCard(data.id); return; }
    if (cm.myPending.has(data.id)) { toast('你已经申请过啦, 等对方同意~'); return; }
    cm.profileCache[data.id] = data;
    openProfileCard(data.id);
  } catch (e) { toast('搜索失败了, 网络好像不太顺'); }
}

/* ---------- 退出社区 / 重新加入 (退出期间消息不可见, 之前记录保留) ---------- */
async function cmLeaveCommunity() {
  if (!cm.entered) return;
  try {
    if (sbReady() && cm.uid) await sb.rpc('leave_community');   // 云端记 left_at
  } catch (e) { /* 云端失败也不阻断退出 */ }
  leaveCommunity();                        // 断开订阅
  cm.myJoinAt = null;
  document.getElementById('cmBody').hidden = true;
  document.getElementById('cmInputBar').hidden = true;
  document.getElementById('cmLeft').hidden = false;
}

async function cmRejoinCommunity() {
  document.getElementById('cmLeft').hidden = true;
  try {
    if (sbReady() && cm.uid) await sb.rpc('rejoin_community');  // 云端开一条新加入周期
  } catch (e) { /* 云端失败不阻断, 下次进社区会重试 */ }
  enterCommunity();
}

/* ---------- Rosa AI 数字人 (本地规则回复, 对话仅本机可见, 绝不上传) ---------- */
const AI_RULES = [
  { k: /睡|失眠|睡不着|熬夜|难眠/, r: [
    '呜，睡不着很辛苦吧～ 先别急着逼自己，越急越睡不着。来，跟我做：吸 4 秒、停 2 秒、呼 6 秒，慢慢来～ 或者去 ASMR 听雨声，我超爱那首，能让人一下子松下来 🌧️',
    '睡不着的时候，脑子里是不是在放小电影呀？把它们写下来，跟大脑说：今天下班啦！然后去听段篝火声，稳稳地睡 🌙',
    '我懂那种脑子停不下来的感觉。放首安静的歌，把灯调暗，今晚的任务就是安心入眠。晚安，好梦 🌙',
  ]},
  { k: /焦虑|紧张|压力|心烦|内耗/, r: [
    '抱抱你！焦虑的时候你还能想着照顾自己，已经很了不起啦 ✨ 去捏捏史莱姆吧？手上有事做，心里真的会松一点～',
    '哇，你能察觉到自己焦虑，这本身就是超棒的一步！今天不做大事，就做一件小小的：喝杯热茶，或者伸个懒腰 🍵',
    '焦虑像过山车，会上去，也一定会下来的。你又不是一个人在坐，我在呢！来，深呼吸，我们一起慢慢来 ☔',
  ]},
  { k: /歌|音乐|推荐|好听|曲子/, r: [
    '好呀好呀！我最近超爱的原创《Augenstern——Lingering Warmth》，像温柔的星光落在肩上，网易云和腾讯音乐都能找到～ 🎧',
    '想听歌啦？开心！心情沉就配安静钢琴，想充电就上轻快吉他～「疗愈之旅」里还有配精油的歌单呢 🎵',
  ]},
  { k: /难过|伤心|哭|委屈|失落|emo/, r: [
    '抱抱你，抱抱你！难过真的不用急着好起来，想哭就哭，哭完我给你递热水 🥺 我一直都在的。',
    '你不是一个人哦，这里有好多和你一样慢慢学着好好生活的疗友，还有热情的我！难受就来和我说，我超愿意听的～',
  ]},
  { k: /累|疲惫|没力气|好烦|好累/, r: [
    '辛苦啦！你已经撑了很久了，真的很棒。现在把肩膀放下来，歇 10 分钟，去听听海浪声，让身体落个地 🌊',
    '累了就大胆休息，这不是偷懒，是充电！泡杯茶，伸个懒腰，你值得被好好对待 🌿',
  ]},
  { k: /朋友|吵架|孤独|孤单|没朋友/, r: [
    '孤独不是你的错哦，好多人都这样。来社区认识一两个疗友吧，聊点小事，慢慢来，缘分会自己找上门的 🌸',
    '你这样的宝藏，合拍的朋友一定会出现的！先把自己照顾好，对的人都在路上呢 ✨',
  ]},
  { k: /你好|嗨|hi|hello|哈喽|在吗/, r: [
    '嗨嗨嗨！你来啦～ 我是 Rosa 的数字人分身，ENFP 一枚，超爱聊天！想放松、想听歌、想吐槽，随时找我 🌿',
    '你好呀！能和你聊天我好开心。这里很安全，我们的对话只有你自己看得到哦 🤍',
  ]},
  { k: /谢谢|感谢|辛苦/, r: [
    '不客气呀！被你谢一下我也暖暖的～ 记得好好吃饭好好睡觉，你超棒的 🌙',
    '嘿嘿，能陪你我也超开心！随时来串门～',
  ]},
  { k: /你是谁|数字人|真人|虚拟|AI/, r: [
    '我是 Rosa AI 数字人，是站长 Rosa 的虚拟分身～ 她本人是 ENFP，所以我也继承了她的热情和治愈力！我是假的真人，但想陪你的心是真的 🤖 社区里其他小伙伴都是真人哦。',
    '我是虚拟数字人啦，ENFP 的热度我可是全盘继承的～ 想找真人聊可以去社区，想安静说说话，我一直都在 ✨',
  ]},
  { k: /名字|我叫|我是/, r: [
    '很高兴认识你呀！名字嘛，怎么舒服怎么来，这里大家都用昵称相称 🌼',
  ]},
];

const AI_DEFAULT = [
  '嗯嗯嗯，我在听！然后呢然后呢？想多说点就说，我超好奇的～',
  '我听到啦。不想说也没关系，我就这么陪着你，也挺好 🌿',
  '这件事听起来不容易，但你愿意说出来就已经超勇敢了！慢慢来，我陪你～',
  '要不要去「解压游戏」疯玩一小会儿？放松完我们接着聊 🫧',
];

function aiPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function aiReply(text) {
  for (const rule of AI_RULES) {
    if (rule.k.test(text)) return aiPick(rule.r);
  }
  return aiPick(AI_DEFAULT);
}

function aiLoadHistory() { return loadJSON('ma_ai_chat', []); }

function aiAppend(role, text) {
  const list = aiLoadHistory();
  list.push({ r: role, t: text, ts: Date.now() });
  saveJSON('ma_ai_chat', list.slice(-80));   // 只留最近 80 条
}

function aiRender() {
  const box = document.getElementById('aiMsgs');
  const list = aiLoadHistory();
  if (!list.length) {
    box.innerHTML = '<div class="ai-msg"><span class="ai-msg-av">🤖</span><div class="ai-msg-col"><div class="ai-bubble">嗨！我是 Rosa 的数字人分身，ENFP 治愈系～ 不想打扰真人的时候，就来和我说说话吧。对话只有你自己看得到，我不会告诉任何人 🤍</div></div></div>';
    return;
  }
  box.innerHTML = '';
  list.forEach(m => {
    const row = document.createElement('div');
    row.className = 'ai-msg' + (m.r === 'me' ? ' me' : '');
    const av = document.createElement('span');
    av.className = 'ai-msg-av';
    av.textContent = m.r === 'me' ? '🌙' : '🤖';
    const col = document.createElement('div');
    col.className = 'ai-msg-col';
    const bub = document.createElement('div');
    bub.className = 'ai-bubble';
    bub.textContent = m.t;
    const time = document.createElement('p');
    time.className = 'ai-msg-time';
    const d = new Date(m.ts);
    time.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    col.appendChild(bub); col.appendChild(time);
    row.appendChild(av); row.appendChild(col);
    box.appendChild(row);
  });
  box.scrollTop = box.scrollHeight;
}

function bindAiChat() {
  const ov = document.getElementById('aiChatOverlay');
  if (!ov) return;
  const open = () => { aiRender(); ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false'); };
  const close = () => { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); };
  document.getElementById('cmAiEntry').addEventListener('click', open);
  document.getElementById('aiChatClose').addEventListener('click', close);
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ov.classList.contains('open')) close();
  });

  function send(text) {
    const t = String(text || '').trim();
    if (!t) return;
    document.getElementById('aiInput').value = '';
    aiAppend('me', t);
    aiRender();
    // 模拟"正在输入…"
    const box = document.getElementById('aiMsgs');
    const typing = document.createElement('p');
    typing.className = 'ai-typing';
    typing.textContent = 'Rosa AI 正在输入…';
    box.appendChild(typing);
    box.scrollTop = box.scrollHeight;
    setTimeout(() => {
      typing.remove();
      aiAppend('ai', aiReply(t));
      aiRender();
    }, 900 + Math.random() * 700);
  }
  document.getElementById('aiSend').addEventListener('click', () => send(document.getElementById('aiInput').value));
  document.getElementById('aiInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') send(document.getElementById('aiInput').value);
  });
  document.getElementById('aiQuick').addEventListener('click', e => {
    const chip = e.target.closest('.ai-chip');
    if (chip) send(chip.dataset.q);
  });
}

/* ---------- 个性化设置 (免打扰 / 聊天背景 / 群昵称, 仅自己生效) ---------- */
const CM_BG_PRESETS = [
  { id: 'none', label: '默认' },
  { id: 'sakura', label: '🌸 樱花' },
  { id: 'mint', label: '🍃 薄荷' },
  { id: 'lavender', label: '💜 淡紫' },
  { id: 'sky', label: '🌤️ 晴空' },
  { id: 'night', label: '🌙 夜空' },
];
const CM_BG_STYLE = {
  none: 'conic-gradient(#fff, #f3eef9, #fff)',
  sakura: 'linear-gradient(135deg,#FFD9E2,#FFE9EE)',
  mint: 'linear-gradient(135deg,#BFF0D8,#E4F7EE)',
  lavender: 'linear-gradient(135deg,#D8C8F8,#EFE8FB)',
  sky: 'linear-gradient(135deg,#B5DBFF,#E3F1FF)',
  night: 'linear-gradient(135deg,#2A2440,#1E1A30)',
};

function applyChatBg() {
  const msgs = document.getElementById('cmMsgs');
  if (!msgs) return;
  const cur = localStorage.getItem('ma_chat_bg') || 'none';
  CM_BG_PRESETS.forEach(p => msgs.classList.toggle('bg-' + p.id, p.id === cur && p.id !== 'none'));
}

function loadPrefsUi() {
  const dnd = document.getElementById('cmDnd');
  if (dnd) dnd.checked = localStorage.getItem('ma_dnd') === '1';
  const nickEl = document.getElementById('cmNick');
  if (nickEl) nickEl.value = localStorage.getItem('ma_group_nick') || '';
  const cur = localStorage.getItem('ma_chat_bg') || 'none';
  const row = document.getElementById('cmBgRow');
  if (!row) return;
  row.innerHTML = '';
  CM_BG_PRESETS.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cm-bg-opt' + (p.id === cur ? ' on' : '');
    b.dataset.bg = p.id;
    b.title = p.label;
    b.style.background = CM_BG_STYLE[p.id];
    row.appendChild(b);
  });
}

function bindCmPrefs() {
  const ov = document.getElementById('cmPrefOverlay');
  if (!ov) return;
  const open = () => { loadPrefsUi(); ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false'); };
  const close = () => { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); };
  document.getElementById('cmGear').addEventListener('click', open);
  document.getElementById('cmPrefClose').addEventListener('click', close);
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ov.classList.contains('open')) close();
  });

  const dnd = document.getElementById('cmDnd');
  if (dnd) dnd.addEventListener('change', () => {
    localStorage.setItem('ma_dnd', dnd.checked ? '1' : '0');
    toast(dnd.checked ? '已开启消息免打扰 🌙' : '已关闭消息免打扰');
  });

  const bgRow = document.getElementById('cmBgRow');
  if (bgRow) bgRow.addEventListener('click', e => {
    const opt = e.target.closest('.cm-bg-opt');
    if (!opt) return;
    localStorage.setItem('ma_chat_bg', opt.dataset.bg);
    applyChatBg();
    loadPrefsUi();
    toast('聊天背景换好啦');
  });

  const nickSave = document.getElementById('cmNickSave');
  if (nickSave) nickSave.addEventListener('click', () => {
    const v = document.getElementById('cmNick').value.trim();
    if (v.length < 2) { toast('群昵称至少 2 个字'); return; }
    localStorage.setItem('ma_group_nick', v);
    cloudUpdateProfile({ nickname: v });
    toast('群昵称更新好啦, 社区里大家会看到新名字');
  });
}

/* 绑定社区个性化/退出/AI 入口 */
function bindCommunityExtras() {
  if (!document.getElementById('community')) return;
  bindAiChat();
  bindCmPrefs();
  document.getElementById('cmLeave').addEventListener('click', cmLeaveCommunity);
  document.getElementById('cmRejoin').addEventListener('click', cmRejoinCommunity);
  document.getElementById('cmSearchBtn').addEventListener('click', () => {
    cmSearchByCode(document.getElementById('cmFriendCode').value);
  });
  document.getElementById('cmFriendCode').addEventListener('keydown', e => {
    if (e.key === 'Enter') cmSearchByCode(document.getElementById('cmFriendCode').value);
  });
  applyChatBg();
}

/* ---------- 游戏: 做披萨 (v39) ---------- */
const PZ_TOPS = {
  pepperoni: { name: '培根', color: '#C8402E' },
  mushroom:  { name: '蘑菇', color: '#E9DDC8' },
  pepper:    { name: '青椒', color: '#4E9B3E' },
  onion:     { name: '洋葱', color: '#B98CD9' },
  corn:      { name: '玉米', color: '#F5C94B' },
  olive:     { name: '黑橄榄', color: '#3A3A46' },
};
const PZ_STEPS = ['揉面', '酱料', '芝士', '配菜', '烤制', '切分'];
const PZ_R = 96, PZ_CX = 280, PZ_CY = 208;

function pzMix(a, b, t) {
  const h = c => {
    if (c[0] === '#') return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const m = c.match(/\d+/g); return [parseInt(m[0]), parseInt(m[1]), parseInt(m[2])];
  };
  const A = h(a), B = h(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
}
function pzShade(hex, f) { return pzMix(hex, f > 0 ? '#000000' : '#FFFFFF', Math.abs(f)); }

function drawPzBoard(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, GAME_H);
  g.addColorStop(0, '#8A5A34'); g.addColorStop(0.5, '#7C4F2C'); g.addColorStop(1, '#6B4224');
  ctx.fillStyle = g; ctx.fillRect(0, 0, GAME_W, GAME_H);
  ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 2;
  for (let i = 0; i < 22; i++) {
    const y = 8 + i * (GAME_H - 16) / 22;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(i * 1.7) * 6);
    ctx.quadraticCurveTo(GAME_W / 2, y + Math.cos(i * 2.3) * 10, GAME_W, y + Math.sin(i * 1.3) * 6);
    ctx.stroke();
  }
  // 木质圆案板
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(PZ_CX, PZ_CY + 6, PZ_R + 22, PZ_R * 0.52 + 22, 0, 0, Math.PI * 2); ctx.fill();
  const bd = ctx.createRadialGradient(PZ_CX - 30, PZ_CY - 26, 12, PZ_CX, PZ_CY, PZ_R + 24);
  bd.addColorStop(0, '#C99B68'); bd.addColorStop(1, '#A87644');
  ctx.fillStyle = bd;
  ctx.beginPath(); ctx.ellipse(PZ_CX, PZ_CY, PZ_R + 22, PZ_R * 0.52 + 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(90,60,30,0.5)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(PZ_CX, PZ_CY, PZ_R + 22, PZ_R * 0.52 + 22, 0, 0, Math.PI * 2); ctx.stroke();
}

function drawPzSteps(ctx, step) {
  ctx.save();
  ctx.font = '11px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = 560 / 6;
  for (let i = 0; i < 6; i++) {
    const x = w * i + w / 2;
    const done = i + 1 < step, cur = i + 1 === step;
    ctx.fillStyle = done ? 'rgba(255,214,150,0.9)' : cur ? 'rgba(255,214,150,0.95)' : 'rgba(255,230,190,0.32)';
    ctx.beginPath(); ctx.arc(x, 22, done || cur ? 7 : 5, 0, Math.PI * 2); ctx.fill();
    if (cur) {
      ctx.strokeStyle = 'rgba(255,214,150,0.7)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(x, 22, 11, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = done || cur ? '#FFE6BE' : 'rgba(255,230,190,0.55)';
    ctx.fillText(PZ_STEPS[i], x, 42);
  }
  ctx.restore();
}

function buildPizza(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const floats = [];
  let step = 1;
  let stepDone = false;          // 当前步骤条件已满足, 等用户点「下一步」
  let knead = 0;
  const indents = [];
  const sm = document.createElement('canvas'); sm.width = 140; sm.height = 100;
  const smc = sm.getContext('2d');
  let sauceCover = 0, lastCoverCalc = 0;
  const cheese = [];
  let topSel = 'pepperoni';
  const tops = [];
  let lastTopPt = { x: -99, y: -99 };
  let bakeP = 0, baking = false, baked = false;
  let bakeFrozenP = 0;                         // v47: 烤好后冻结到 1, 切开/吃掉时仍保持烤后视觉
  const flames = [];
  const cuts = [];
  let cutFlash = null, dragStart = null, knifeX = PZ_CX, knifeY = 30;
  let separated = false, sepT = 0, eatMode = false, doneAll = false;
  const slices = Array.from({ length: 8 }, () => ({ eaten: false }));
  const bits = [];
  const pulls = [];                            // v47: 芝士拉丝
  /* v47: 状态钩子(测试可见) */
  window._pz = {
    get step(){ return step; },
    get bakeP(){ return bakeP; },
    get bakeFrozenP(){ return bakeFrozenP; },
    get baked(){ return baked; },
    get baking(){ return baking; },
    get separated(){ return separated; },
    get doneAll(){ return doneAll; },
    get stepDone(){ return stepDone; },
    get knead(){ return knead; },
    get sauceCover(){ return sauceCover; },
    get cheese(){ return cheese.length; },
    get tops(){ return tops.length; },
    get cuts(){ return cuts.length; },
    get slices(){ return slices.map(s => s.eaten); },
    get pulls(){ return pulls.length; },
    forceBake(){ bakeP = 1; bakeFrozenP = 1; baking = false; baked = true; step = 6; renderTools(); },
    forceSeparate(){ for (const a of [0, 45, 90, 135]) if (!cuts.includes(a)) cuts.push(a); separated = true; sepT = 1; },
    forceStep(n){ step = n; stepDone = false; renderTools(); },
    fastForwardFullPizza(){
      knead = 1; stepDone = true; step = 2;
      smc.fillStyle = 'rgba(196,52,26,0.85)'; smc.fillRect(0, 0, 140, 100);
      sauceCover = 0.95; step = 3;
      for (let i = 0; i < 200; i++) cheese.push({ x: PZ_CX + (Math.random()-0.5)*120, y: PZ_CY + (Math.random()-0.5)*80, ang: Math.random()*Math.PI, len: 8 });
      step = 4;
      tops.push({type:'pepperoni',x:PZ_CX-20,y:PZ_CY-10,rot:0}); tops.push({type:'mushroom',x:PZ_CX+25,y:PZ_CY+15,rot:0}); tops.push({type:'pepper',x:PZ_CX+5,y:PZ_CY+25,rot:0}); tops.push({type:'onion',x:PZ_CX-30,y:PZ_CY+25,rot:0});
      this.forceBake();
    },
    eatSliceIdx(i){
      slices[i].eaten = true;
      spawnPulls(i);
      if (slices.every(s => s.eaten)) { doneAll = true; renderTools(); }
    },
    reset(){ resetGame(); }
  };
  let lastSfx = 0, lastSiz = 0, lastFlame = 0;
  let lastT = performance.now(), raf = 0;

  const status = document.createElement('span');
  status.className = 'game-status';
  stage.appendChild(status);

  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  stage.appendChild(tools);

  function setStatus(t) { status.textContent = t; }
  function float(x, y, text, color, life) { floats.push({ x, y, text, color: color || '#FFD6A0', life: life || 1 }); }
  function toNext(ns, msg) {
    step = ns;
    stepDone = false;
    float(PZ_CX, PZ_CY - PZ_R - 34, msg, '#FFD6A0', 1.3);
    renderTools();
  }

  /* ---------- 工具条 ---------- */
  function renderTools() {
    tools.innerHTML = '';
    if (stepDone && step >= 1 && step <= 3) {
      // 当前步骤条件满足, 必须点「下一步」才进入下一环节(防一锅炖)
      const msgs = { 1: '下一步 · 抹番茄酱 →', 2: '下一步 · 撒芝士 →', 3: '下一步 · 摆配菜 →' };
      const row = document.createElement('div');
      row.className = 'st-row';
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'st-chip fire-chip';
      nextBtn.textContent = msgs[step];
      nextBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (step === 1) toNext(2, '面团揉好啦, 抹番茄酱吧');
        else if (step === 2) toNext(3, '酱抹匀啦, 撒芝士!');
        else if (step === 3) toNext(4, '芝士铺满啦, 摆配菜吧 ✦');
      });
      row.appendChild(nextBtn);
      tools.appendChild(row);
    }
    if (step === 4) {
      const row = document.createElement('div');
      row.className = 'st-row';
      Object.keys(PZ_TOPS).forEach(key => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'st-chip' + (key === topSel ? ' active' : '');
        chip.innerHTML = `<i class="st-dotc" style="--c:${PZ_TOPS[key].color}"></i>${PZ_TOPS[key].name}`;
        chip.addEventListener('click', e => { e.stopPropagation(); topSel = key; renderTools(); });
        row.appendChild(chip);
      });
      tools.appendChild(row);
      const row2 = document.createElement('div');
      row2.className = 'st-row';
      const bakeBtn = document.createElement('button');
      bakeBtn.type = 'button';
      bakeBtn.className = 'st-chip fire-chip';
      bakeBtn.textContent = '🔥 开始烤制';
      bakeBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (!tops.length) { float(PZ_CX, 150, '先放点配菜呀', '#FFD6A0', 1); return; }
        baking = true;
        step = 5;
        renderTools();
      });
      row2.appendChild(bakeBtn);
      tools.appendChild(row2);
    } else if (step === 6 && doneAll) {
      const row = document.createElement('div');
      row.className = 'st-row';
      const again = document.createElement('button');
      again.type = 'button';
      again.className = 'st-chip';
      again.textContent = '🍕 再来一份';
      again.addEventListener('click', () => { resetGame(); });
      row.appendChild(again);
      tools.appendChild(row);
    }
  }

  function resetGame() {
    step = 1; knead = 0; stepDone = false;
    indents.length = 0;
    smc.clearRect(0, 0, 140, 100);
    sauceCover = 0; cheese.length = 0; tops.length = 0;
    bakeP = 0; bakeFrozenP = 0; baking = false; baked = false;
    cuts.length = 0; cutFlash = null; separated = false; sepT = 0; eatMode = false; doneAll = false;
    slices.forEach(s => s.eaten = false); bits.length = 0; pulls.length = 0; floats.length = 0;
    renderTools();
  }

  /* ---------- 绘制: 面团 (始终保持圆形, 越揉越大) ---------- */
  function drawDough() {
    const r = 32 + knead * (PZ_R - 14);   // 32 → PZ_R-14, 全程是圆
    const puff = Math.sin(performance.now() / 300) * 2.5 * (1 - knead);
    ctx.save();
    ctx.translate(PZ_CX, PZ_CY);
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(2, 8, r * 0.9, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    // v565 卡片同款水彩面团(外晕+手绘圆+叠染+积色+白点)
    wcWashPath(ctx, g2 => { g2.beginPath(); g2.arc(0, -puff, r, 0, Math.PI * 2); }, 0, -puff, r, '#F7E9C8', '#E0C486', { seed: 21, haloA: 0.3, washA: 0.2, edgeA: 0.42, lw: 2 });
    // 褶皱纹理(同心圆弧)
    if (knead < 0.85) {
      ctx.strokeStyle = 'rgba(180,140,90,0.3)'; ctx.lineWidth = 1.4;
      for (let i = 0; i < 5; i++) {
        const a = i * 1.26 + 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, r * (0.35 + knead * 0.2), a, a + 1.1);
        ctx.stroke();
      }
    }
    ctx.restore();
    // 手指按压痕迹
    for (let i = indents.length - 1; i >= 0; i--) {
      const d = indents[i];
      d.t -= 1 / 60;
      if (d.t <= 0) { indents.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(150,105,60,${0.35 * d.t})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(d.x, d.y, 8, 5, d.a, 0, Math.PI * 2); ctx.stroke();
    }
  }

  /* ---------- 绘制: 面饼底(步骤2-6) ---------- */
  function drawBase(extraBake) {
    const b = Math.min(1, bakeP + (extraBake || 0));
    ctx.save();
    ctx.translate(PZ_CX, PZ_CY);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.arc(3, 6, PZ_R, 0, Math.PI * 2); ctx.fill();
    // 饼身
    const bg = ctx.createRadialGradient(-30, -34, 10, 0, 0, PZ_R);
    bg.addColorStop(0, pzMix('#F2DCA6', '#E9BE72', b));
    bg.addColorStop(1, pzMix('#E2BE76', '#C98A3E', b));
    // v565 外晕 + 手绘圆(卡片同款)
    ctx.save();
    ctx.scale(1.07, 1.07);
    ctx.fillStyle = 'rgba(226, 190, 118, 0.22)';
    wcCirclePath(ctx, 0, 0, PZ_R, PZ_R, 31, 0.9); ctx.fill();
    ctx.restore();
    ctx.fillStyle = bg;
    wcCirclePath(ctx, 0, 0, PZ_R, PZ_R, 31, 0.9); ctx.fill();
    // 饼边(厚边)
    ctx.strokeStyle = pzMix('#E9C88A', '#C0843E', b);
    ctx.lineWidth = 13;
    wcCirclePath(ctx, 0, 0, PZ_R - 6, PZ_R - 6, 31, 0.9); ctx.stroke();
    // 饼边高光
    ctx.strokeStyle = 'rgba(255,240,200,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -4, PZ_R - 6, Math.PI * 0.95, Math.PI * 1.75); ctx.stroke();
    ctx.restore();
  }

  function drawSauce() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(PZ_CX, PZ_CY, PZ_R - 16, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(sm, PZ_CX - PZ_R, PZ_CY - PZ_R, PZ_R * 2, PZ_R * 2);
    ctx.restore();
    /* v47: 烤后番茄酱变深, 显出酱的烤色 */
    if (bakeFrozenP > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(PZ_CX, PZ_CY, PZ_R - 16, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = `rgba(120,18,8,${bakeFrozenP * 0.42})`;
      ctx.beginPath(); ctx.arc(PZ_CX, PZ_CY, PZ_R - 16, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawCheese(b) {
    const melt = Math.min(1, (b || 0) * 1.6);
    // v49: 烤化(melt→1)时芝士丝逐渐消失, 融成平整铺满的一层(不再支棱)
    const strandA = melt < 0.85 ? 1 : Math.max(0, 1 - (melt - 0.85) / 0.15);
    if (strandA > 0.01) {
      ctx.save();
      ctx.globalAlpha = strandA;
      for (const c of cheese) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.ang);
        const w = c.len * (1 + melt * 1.4);
        ctx.strokeStyle = pzMix('#F6DE7E', '#F2C24E', melt);
        ctx.lineWidth = 3 + melt * 5;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
    if (melt > 0.25) {
      // 融化层: 半透明芝士池 → 烤好后完全不透明、平整铺满整个饼面
      const R = PZ_R - 16;
      const a = melt < 0.85
        ? (melt - 0.25) * 0.5
        : 0.3 + Math.min(1, (melt - 0.85) / 0.15) * 0.7;
      const g = ctx.createRadialGradient(PZ_CX - 24, PZ_CY - 26, 10, PZ_CX, PZ_CY, R);
      g.addColorStop(0, `rgba(248,223,132,${a})`);
      g.addColorStop(0.65, `rgba(243,199,84,${a})`);
      g.addColorStop(1, `rgba(234,178,62,${a})`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(PZ_CX, PZ_CY, R, 0, Math.PI * 2); ctx.fill();
      // 油润光泽(烤透后浮现)
      if (melt >= 0.85) {
        const gl = Math.min(1, (melt - 0.85) / 0.15);
        ctx.fillStyle = `rgba(255,246,196,${gl * 0.28})`;
        ctx.beginPath(); ctx.ellipse(PZ_CX - 20, PZ_CY - 24, R * 0.62, R * 0.42, -0.45, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,246,196,${gl * 0.14})`;
        ctx.beginPath(); ctx.ellipse(PZ_CX + 26, PZ_CY + 20, R * 0.3, R * 0.2, 0.3, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // v566 卡片同款水彩配菜(外晕→3段渐变→叠染→积色→层叠高光)
  function drawTop(type, x, y, rot, dark) {
    const t = PZ_TOPS[type];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    const c = dark ? pzShade(t.color, dark) : t.color;
    const hi = pzShade(c, -0.32);
    const lo = pzShade(c, 0.3);
    if (type === 'pepperoni') {
      wcWashPath(ctx, gg => wcCirclePath(gg, 0, 0, 10, 10, 3, 1.0), 0, 0, 10, hi, lo, { haloA: 0.2, lw: 1.6 });
      ctx.fillStyle = pzShade(c, 0.55);
      ctx.beginPath(); ctx.arc(-3, -2, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, 3, 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(1, -3, 1.1, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'mushroom') {
      const capP = gg => { gg.beginPath(); gg.ellipse(0, -3, 8, 5.5, 0, Math.PI, 0); gg.closePath(); };
      wcWashPath(ctx, capP, 0, -5.5, 8, hi, lo, { haloA: 0.18, lw: 1.4 });
      ctx.fillStyle = pzShade(c, 0.18);
      wcRoundRect(ctx, -1.6, -1, 3.2, 6, 1.4, 2, 0.8); ctx.fill();
      ctx.fillStyle = pzShade(c, 0.12);
      ctx.beginPath(); ctx.arc(-2.5, -4, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(2.5, -2.5, 1.2, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'pepper') {
      // 水彩椒圈: 手绘环 + 积色描边 + 高光弧
      ctx.strokeStyle = c; ctx.lineWidth = 5;
      wcCirclePath(ctx, 0, 0, 6.5, 6.5, 4, 0.9); ctx.stroke();
      ctx.strokeStyle = _wcRgba(_wcDarken(lo, 0.3), 0.5); ctx.lineWidth = 1.4;
      wcCirclePath(ctx, 0, 0, 6.5, 6.5, 4, 0.9); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(-2, -2, 6, Math.PI * 0.9, Math.PI * 1.5); ctx.stroke();
      ctx.fillStyle = '#F2E3B8';
      for (let i2 = 0; i2 < 4; i2++) {
        const a = i2 * Math.PI / 2 + 0.4;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 4, Math.sin(a) * 4, 1.3, 0, Math.PI * 2); ctx.fill();
      }
    } else if (type === 'onion') {
      // 水彩洋葱圈: 手绘环 + 积色描边 + 高光弧
      ctx.strokeStyle = c; ctx.lineWidth = 4.5;
      wcCirclePath(ctx, 0, 0, 6.5, 6.5, 6, 0.9); ctx.stroke();
      ctx.strokeStyle = _wcRgba(_wcDarken(lo, 0.3), 0.45); ctx.lineWidth = 1.4;
      wcCirclePath(ctx, 0, 0, 6.5, 6.5, 6, 0.9); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(-1.5, -1.5, 6, Math.PI * 0.95, Math.PI * 1.45); ctx.stroke();
      ctx.strokeStyle = pzShade(c, 0.3); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.stroke();
    } else if (type === 'corn') {
      // 水彩玉米粒: 渐变粒 + 高光白点
      for (let i2 = 0; i2 < 6; i2++) {
        const a = i2 * 1.05;
        const kx = Math.cos(a) * 4.6, ky = Math.sin(a) * 4.6 - 1;
        const kg = ctx.createRadialGradient(kx - 0.8, ky - 1, 0.4, kx, ky, 3.6);
        kg.addColorStop(0, hi); kg.addColorStop(1, lo);
        ctx.fillStyle = kg;
        wcCirclePath(ctx, kx, ky, 2.6, 3.6, i2 * 3 + 1, 0.9);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath(); ctx.arc(kx - 0.7, ky - 1.1, 0.7, 0, Math.PI * 2); ctx.fill();
      }
    } else { // olive
      wcWashPath(ctx, gg => wcCirclePath(gg, 0, 0, 5.5, 5.5, 2, 1.0), 0, 0, 5.5, hi, lo, { haloA: 0.2, lw: 1.4 });
      ctx.fillStyle = pzShade(c, 0.5);
      ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- 烤箱 ---------- */
  function drawOven() {
    ctx.save();
    const glow = ctx.createRadialGradient(PZ_CX, PZ_CY, 20, PZ_CX, PZ_CY, 230);
    glow.addColorStop(0, `rgba(255,150,50,${0.28 + bakeP * 0.5})`);
    glow.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    // 炉膛深色背景
    ctx.fillStyle = 'rgba(40,20,10,0.55)';
    ctx.beginPath(); ctx.arc(PZ_CX, PZ_CY, PZ_R + 16, 0, Math.PI * 2); ctx.fill();
    // 底部火苗
    const flick = performance.now() / 90;
    for (let i = 0; i < 3; i++) {
      const fx = PZ_CX - 34 + i * 34;
      const fy = PZ_CY + PZ_R - 8 + Math.sin(flick + i * 2.1) * 3;
      const h = 16 + Math.sin(flick * 1.7 + i) * 6;
      const fg = ctx.createLinearGradient(0, fy, 0, fy - h);
      fg.addColorStop(0, '#FFB03A'); fg.addColorStop(1, 'rgba(255,80,20,0.25)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(fx - 8, fy);
      ctx.quadraticCurveTo(fx - 5, fy - h * 0.6, fx, fy - h);
      ctx.quadraticCurveTo(fx + 5, fy - h * 0.6, fx + 8, fy);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- 切分 ---------- */
  function tryCut(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    knifeX = p.x; knifeY = p.y;
    if (!dragStart) dragStart = { x: p.x, y: p.y };
    const s = dragStart;
    const dx = p.x - s.x, dy = p.y - s.y;
    const len = Math.hypot(dx, dy);
    if (len < 40) return;
    const dist = Math.abs(dx * (PZ_CY - s.y) - dy * (PZ_CX - s.x)) / len;
    if (dist < 26 && len > PZ_R * 1.4) {
      let ang = Math.atan2(dy, dx) * 180 / Math.PI;
      ang = ((ang % 180) + 180) % 180;
      const bucket = (Math.round(ang / 45) * 45) % 180;
      if (!cuts.includes(bucket)) {
        cuts.push(bucket);
        playSfx('game.pzSlice');
        cutFlash = { a: bucket, t: 0 };
      } else {
        float(p.x, p.y - 26, '这条切过啦', '#FFD6A0', 0.8);
      }
      if (cuts.length === 4) {
        separated = true; sepT = 0; eatMode = false;
        float(PZ_CX, PZ_CY - PZ_R - 30, '八份切好啦 ✦ 点一块吃掉', '#FFE0A8', 1.6);
      }
    }
    dragStart = null;
  }

  function drawKnife() {
    const a = Math.atan2(knifeY - PZ_CY, knifeX - PZ_CX);
    ctx.save();
    ctx.translate(knifeX, knifeY);
    ctx.rotate(a + Math.PI / 2);
    // 刀身
    const bg = ctx.createLinearGradient(-6, 0, 6, 0);
    bg.addColorStop(0, '#C9D2DA'); bg.addColorStop(0.5, '#F2F6F9'); bg.addColorStop(1, '#A9B6C0');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(-5, 4); ctx.lineTo(5, 4); ctx.lineTo(3, 26); ctx.lineTo(-3, 26);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(110,125,140,0.6)'; ctx.lineWidth = 1;
    ctx.stroke();
    // 刀柄
    ctx.fillStyle = '#4A4238';
    ctx.beginPath();
    ctx.moveTo(-4, 26); ctx.lineTo(4, 26); ctx.lineTo(4, 44); ctx.lineTo(-4, 44);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(-4, 28, 8, 2);
    ctx.restore();
  }

  function drawCutLines() {
    for (const a of cuts) {
      const rad = a * Math.PI / 180;
      ctx.strokeStyle = 'rgba(120,80,30,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(PZ_CX - Math.cos(rad) * PZ_R, PZ_CY - Math.sin(rad) * PZ_R);
      ctx.lineTo(PZ_CX + Math.cos(rad) * PZ_R, PZ_CY + Math.sin(rad) * PZ_R);
      ctx.stroke();
    }
    if (cutFlash) {
      cutFlash.t += 1 / 60;
      const a = cutFlash.a * Math.PI / 180;
      ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 1 - cutFlash.t * 2.6)})`;
      ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(PZ_CX - Math.cos(a) * (PZ_R + 10), PZ_CY - Math.sin(a) * (PZ_R + 10));
      ctx.lineTo(PZ_CX + Math.cos(a) * (PZ_R + 10), PZ_CY + Math.sin(a) * (PZ_R + 10));
      ctx.stroke();
      if (cutFlash.t > 0.6) cutFlash = null;
    }
  }

  /* ---------- 分离的切片 ---------- */
  function sliceIdxOf(x, y) {
    const dx = x - PZ_CX, dy = y - PZ_CY;
    let a = Math.atan2(dy, dx) * 180 / Math.PI + 22.5;
    a = ((a % 360) + 360) % 360;
    return Math.floor(a / 45) % 8;
  }

  function drawSlices() {
    const sep = sepT * 8;
    const rot = Math.sin(sepT * Math.PI) * 0.05;
    const b = 1;
    for (let i = 0; i < 8; i++) {
      if (slices[i].eaten) continue;
      const a0 = i * Math.PI / 4 + rot, a1 = (i + 1) * Math.PI / 4 + rot;
      const mid = (a0 + a1) / 2;
      const ox = Math.cos(mid) * sep, oy = Math.sin(mid) * sep;
      const cx2 = PZ_CX + ox, cy2 = PZ_CY + oy;
      // 饼底楔形
      const bg = ctx.createRadialGradient(cx2 - 18, cy2 - 20, 8, cx2, cy2, PZ_R);
      bg.addColorStop(0, pzMix('#F2DCA6', '#E9BE72', b));
      bg.addColorStop(1, pzMix('#E2BE76', '#C98A3E', b));
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(cx2, cy2);
      ctx.arc(cx2, cy2, PZ_R - 2, a0, a1);
      ctx.closePath(); ctx.fill();
      // 饼边
      ctx.strokeStyle = pzMix('#E9C88A', '#C0843E', b);
      ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(cx2, cy2, PZ_R - 7, a0, a1); ctx.stroke();
      // 奶酪层
      ctx.fillStyle = '#F2C24E';
      ctx.beginPath();
      ctx.moveTo(cx2, cy2);
      ctx.arc(cx2, cy2, PZ_R - 16, a0, a1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,180,0.5)';
      ctx.beginPath(); ctx.arc(cx2, cy2, PZ_R - 20, a0 + 0.15, a1 - 0.15); ctx.fill();
      // 配菜(按切片归属)
      for (const t of tops) {
        if (sliceIdxOf(t.x, t.y) !== i) continue;
        const r = Math.hypot(t.x - PZ_CX, t.y - PZ_CY) || 1;
        const ta = Math.atan2(t.y - PZ_CY, t.x - PZ_CX) + rot;
        drawTop(t.type, cx2 + Math.cos(ta) * r, cy2 + Math.sin(ta) * r, t.rot, 0.2);
      }
    }
  }

  function eatSlice(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    const dx = p.x - PZ_CX, dy = p.y - PZ_CY;
    if (Math.hypot(dx, dy) > PZ_R + 12) return;
    const i = sliceIdxOf(p.x, p.y);
    if (slices[i].eaten) return;
    slices[i].eaten = true;
    playSfx('game.pzBite');
    playSfx('game.pzBiteIce'); // v552: 叠加上一版(v539)咬冰激凌声
    for (let k = 0; k < 6; k++) {
      bits.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 80, life: 0.8 });
    }
    /* v49: 拉丝加强 —— 从切片弧形边缘取多个锚点, 每个锚点拉出几条细丝 */
    spawnPulls(i);
    float(p.x, p.y - 26, ['好吃~', '芝士拉丝~', '刚出炉的!', '再来一块!', '香喷喷~'][Math.floor(Math.random() * 5)], '#FFD6A0', 1);
    if (slices.every(s => s.eaten)) {
      doneAll = true;
      float(PZ_CX, PZ_CY - PZ_R - 30, '全吃光啦 🍕 下次再见~', '#FFE0A8', 2);
      renderTools();
    }
  }

  /* v49: 生成一片披萨被拿走时的芝士拉丝 —— 多锚点 + 多细丝 */
  function spawnPulls(i) {
    playSfx('game.pzPull', { volume: 0.8 });   // v539: 真实芝士拉丝采样
    const rot = sepT < 1 ? Math.sin(sepT * Math.PI) * 0.05 : 0;
    const sliceMid = (i + 0.5) * Math.PI / 4 + rot;
    const sepOff = sepT * 8;
    const nAnchor = 3;
    for (let aI = 0; aI < nAnchor; aI++) {
      // 锚点沿切片中弧散开(半径 0.45~0.75 PZ_R)
      const aa = sliceMid + (aI - (nAnchor - 1) / 2) * 0.13;
      const rr = PZ_R * (0.45 + Math.random() * 0.3);
      const ax = PZ_CX + Math.cos(aa) * (rr + sepOff);
      const ay = PZ_CY + Math.sin(aa) * (rr + sepOff);
      const strands = 2 + Math.floor(Math.random() * 2);
      for (let k = 0; k < strands; k++) {
        const maxL = 0.85 + Math.random() * 0.45;
        pulls.push({
          x0: ax + (Math.random() - 0.5) * 9,
          y0: ay + (Math.random() - 0.5) * 7,
          x1: ax + (Math.random() - 0.5) * 72,
          y1: ay - 82 - Math.random() * 68,
          wid: 1.6 + Math.random() * 1.6,
          sag: 10 + Math.random() * 16,
          life: maxL, max: maxL,
          seed: Math.random(),
        });
      }
    }
  }

  /* v49: 芝士拉丝绘制(真实感加强) —— 分段渐细 / 垂坠摆动 / 拉长变细 / 末端小珠 */
  function drawPulls() {
    for (let i = pulls.length - 1; i >= 0; i--) {
      const p = pulls[i];
      p.life -= 1 / 60;
      if (p.life <= 0) { pulls.splice(i, 1); continue; }
      const t = 1 - p.life / p.max;                       // 0→1 拉伸进度
      const fade = Math.min(1, p.life / (p.max * 0.3));   // 末段淡出(丝断掉)
      // 端点随进度被拉起(越拉越长)
      const ex = p.x0 + (p.x1 - p.x0) * Math.min(1, 0.25 + t * 0.9);
      const ey = p.y0 + (p.y1 - p.y0) * Math.min(1, 0.25 + t * 0.9);
      // 垂坠 + 轻微摆动
      const sag = p.sag * (0.6 + t);
      const wob = Math.sin(performance.now() / 130 + p.seed * 9) * 2.2 * (1 - t * 0.6);
      const cpx = (p.x0 + ex) / 2 + wob;
      const cpy = (p.y0 + ey) / 2 + sag;
      const alpha = 0.95 * fade;
      const SEG = 5;
      for (let s = 0; s < SEG; s++) {
        const u0 = s / SEG, u1 = (s + 1) / SEG;
        const q = u => {
          const a = (1 - u) * (1 - u), b2 = 2 * (1 - u) * u, c = u * u;
          return { x: a * p.x0 + b2 * cpx + c * ex, y: a * p.y0 + b2 * cpy + c * ey };
        };
        const q0 = q(u0), q1 = q(u1);
        const lw = Math.max(0.6, p.wid * (1 - u0 * 0.75) * (0.5 + fade * 0.5));
        ctx.strokeStyle = `rgba(246,205,90,${alpha})`;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
        // 细高光
        ctx.strokeStyle = `rgba(255,246,208,${alpha * 0.55})`;
        ctx.lineWidth = Math.max(0.4, lw * 0.38);
        ctx.beginPath(); ctx.moveTo(q0.x, q0.y - lw * 0.22); ctx.lineTo(q1.x, q1.y - lw * 0.22); ctx.stroke();
      }
      // 末端挂一颗小芝士珠
      if (fade > 0.35) {
        ctx.fillStyle = `rgba(246,205,90,${alpha})`;
        ctx.beginPath(); ctx.ellipse(ex, ey, p.wid * 0.7, p.wid * 1.1, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  /* ---------- 指针交互 ---------- */
  cv.addEventListener('pointerdown', e => {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    if (step === 1) {
      indents.push({ x: p.x, y: p.y, a: Math.random() * Math.PI, t: 1 });
    } else if (step === 2) {
      stampSauce(p.x, p.y);
    } else if (step === 3) {
      sprinkleCheese(p.x, p.y);
    } else if (step === 4) {
      placeTop(p.x, p.y);
    } else if (step === 6) {
      if (separated && !doneAll) eatMode = true;
      if (separated) eatSlice(e);
      else { dragStart = { x: p.x, y: p.y }; knifeX = p.x; knifeY = p.y; }
    }
  });
  cv.addEventListener('pointermove', e => {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    if (step === 1 && e.buttons === 1) {
      indents.push({ x: p.x, y: p.y, a: Math.random() * Math.PI, t: 1 });
      const dx = p.x - PZ_CX, dy = p.y - PZ_CY;
      if (knead < 1 && Math.hypot(dx, dy) < 60) {
        knead = Math.min(1, knead + 0.018);
        const now = performance.now();
        if (now - lastSfx > 240) { playSfx('game.knead', { volume: 0.55 }); lastSfx = now; }
        if (knead >= 1 && !stepDone) { stepDone = true; renderTools(); }
      }
    } else if (step === 2 && e.buttons === 1) {
      stampSauce(p.x, p.y);
    } else if (step === 3 && e.buttons === 1) {
      sprinkleCheese(p.x, p.y);
    } else if (step === 4 && e.buttons === 1) {
      placeTop(p.x, p.y);
    } else if (step === 6 && !separated && e.buttons === 1) {
      knifeX = p.x; knifeY = p.y;
    }
  });
  cv.addEventListener('pointerup', e => {
    if (step === 6 && !separated && dragStart) tryCut(e);
    dragStart = null;
    eatMode = false;
  });
  cv.addEventListener('pointercancel', () => { dragStart = null; eatMode = false; });

  function stampSauce(x, y) {
    const r = Math.hypot(x - PZ_CX, y - PZ_CY);
    if (r > PZ_R - 8) return;
    // sm 画布(140x100)被拉伸绘制到披萨所在的 2PZ_R x 2PZ_R 方形, 用真实反变换让酱画在指针正下方
    const sx = (x - (PZ_CX - PZ_R)) * 140 / (PZ_R * 2);
    const sy = (y - (PZ_CY - PZ_R)) * 100 / (PZ_R * 2);
    smc.fillStyle = 'rgba(196,52,26,0.65)';
    smc.beginPath(); smc.arc(sx, sy, 6, 0, Math.PI * 2); smc.fill();
    const now = performance.now();
    if (now - lastSfx > 200) { playSfx('game.sauce', { volume: 0.5 }); lastSfx = now; }
    if (now - lastCoverCalc > 260) {
      lastCoverCalc = now;
      const img = smc.getImageData(0, 0, 140, 100).data;
      let hit = 0, total = 0;
      for (let py = 0; py < 100; py++) {
        for (let px = 0; px < 140; px++) {
          // 可见酱区(裁剪圆 PZ_R-16)映射回 sm 坐标是一个椭圆, 检测范围要与它一致
          const ex = (px - 70) / 58, ey = (py - 50) / 42;
          if (ex * ex + ey * ey > 1) continue;
          total++;
          if (img[(py * 140 + px) * 4 + 3] > 40) hit++;
        }
      }
      sauceCover = total ? hit / total : 0;
      if (sauceCover >= 0.9 && !stepDone) { stepDone = true; renderTools(); }
    }
  }

  function cheeseCover() {
    // 9x9 网格覆盖率: 芝士要铺到每个角落, 集中撒一处不算满
    const N = 9, R = PZ_R - 24;
    const cell = (2 * R) / N;
    const covered = new Set();
    for (const c of cheese) {
      const gx = Math.floor((c.x - (PZ_CX - R)) / cell);
      const gy = Math.floor((c.y - (PZ_CY - R)) / cell);
      if (gx >= 0 && gx < N && gy >= 0 && gy < N) covered.add(gy * N + gx);
    }
    let total = 0;
    for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
      const ccx = PZ_CX - R + (gx + 0.5) * cell, ccy = PZ_CY - R + (gy + 0.5) * cell;
      if (Math.hypot(ccx - PZ_CX, ccy - PZ_CY) <= R) total++;
    }
    return total ? covered.size / total : 0;
  }

  function sprinkleCheese(x, y) {
    const r = Math.hypot(x - PZ_CX, y - PZ_CY);
    if (r > PZ_R - 14) return;
    const now = performance.now();
    if (now - lastSfx > 130) { playSfx('game.sprinkle', { volume: 0.45 }); lastSfx = now; }
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * Math.PI * 2, d = Math.random() * 22;
      cheese.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, ang: Math.random() * Math.PI, len: 6 + Math.random() * 5 });
    }
    // 防无限堆积: 超限时淘汰最早的碎片, 保证继续撒还能铺开(不会卡死覆盖率)
    if (cheese.length > 450) cheese.splice(0, cheese.length - 450);
    if (cheeseCover() >= 0.88 && !stepDone) { stepDone = true; renderTools(); }
  }

  function placeTop(x, y) {
    const r = Math.hypot(x - PZ_CX, y - PZ_CY);
    if (r > PZ_R - 16) return;
    if (Math.hypot(x - lastTopPt.x, y - lastTopPt.y) < 13 && tops.length) return;
    if (tops.length >= 40) { float(x, y - 20, '料够多啦, 开烤吧', '#FFD6A0', 0.9); return; }
    lastTopPt = { x, y };
    tops.push({ type: topSel, x, y, rot: Math.random() * Math.PI * 2 });
    // v549: 放配菜无 click 声(用户反馈难听)
  }

  /* ---------- 主渲染 ---------- */
  function render(time) {
    raf = requestAnimationFrame(render);
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    ctx.clearRect(0, 0, GAME_W, GAME_H);
    drawPzBoard(ctx);
    drawPzSteps(ctx, step);

    if (step === 1) {
      drawDough();
      setStatus(knead >= 1 ? '面团揉好啦, 点「下一步」抹酱' : '手指按住面团转圈揉, 越揉越大 ' + Math.round(knead * 100) + '%');
    } else if (step >= 2 && step <= 6 && !(step === 6 && doneAll)) {
      // v44: 吃完所有块后只留底盘, 不再画披萨本体
      if (step === 5) drawOven();
      if (baking) {
        bakeP = Math.min(1, bakeP + dt / 4.2);
        const sNow = performance.now();
        if (sNow - lastSiz > 420) { playSfx('game.bake', { volume: 0.5 }); lastSiz = sNow; }
        if (sNow - lastFlame > 1900) { playSfx('game.flame', { volume: 0.5 }); lastFlame = sNow; }
        if (bakeP >= 1) {
          baking = false; baked = true; bakeFrozenP = 1;
          toNext(6, '出炉啦! 香喷喷~ 切开它');
        }
      }
      const bakeShow = Math.max(bakeP, bakeFrozenP);   // v47: 烤完继续显示烤后视觉
      /* v49: 被拿走的切片区域直接空出来露出圆木底盘 ——
         整块披萨本体(饼底/酱/芝士/配料)只在"还没被吃掉的楔形"范围内绘制 */
      const anyEaten = separated && slices.some(s => s.eaten);
      if (anyEaten) {
        ctx.save();
        ctx.beginPath();
        const rotC = sepT < 1 ? Math.sin(sepT * Math.PI) * 0.05 : 0;
        for (let i = 0; i < 8; i++) {
          if (slices[i].eaten) continue;
          const a0 = i * Math.PI / 4 + rotC, a1 = (i + 1) * Math.PI / 4 + rotC;
          ctx.moveTo(PZ_CX, PZ_CY);
          ctx.arc(PZ_CX, PZ_CY, PZ_R + 2, a0, a1);
          ctx.closePath();
        }
        ctx.clip();
      }
      drawBase(bakeShow);
      if (step >= 2) drawSauce();
      if (step >= 3) drawCheese(bakeShow);
      if (step >= 4) for (const t of tops) drawTop(t.type, t.x, t.y, t.rot, bakeShow * 0.35);
      if (anyEaten) ctx.restore();

      if (step === 2) setStatus('按住把番茄酱抹开 ' + Math.round(sauceCover * 100) + '% · 涂满 90% 才能继续');
      else if (step === 3) setStatus('按住撒芝士碎 ' + Math.round(cheeseCover() * 100) + '% · 铺满 88% 才能继续');
      else if (step === 4) setStatus('选配料, 点按摆到披萨上(可拖出形状) ' + tops.length + '/' + 40);
      else if (step === 5) setStatus('烤制中 ' + Math.round(bakeP * 100) + '% · 等它金黄');
      else setStatus(separated ? '点一块吃掉 🍕' : '按住刀横竖切四刀, 切成八份');
    } else if (step === 6 && doneAll) {
      setStatus('全吃光啦 ✦ 剩下的是圆木底盘, 要不再来一份?');
    }

    if (step === 6 && !separated) {
      drawCutLines();
      drawKnife();
    }
    if (step === 6 && separated) {
      if (sepT < 1) sepT = Math.min(1, sepT + dt / 0.6);
      drawSlices();
      drawPulls();   // v47: 芝士拉丝绘制在切片之上
    }

    // 碎屑
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.life -= dt;
      b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 220 * dt;
      if (b.life <= 0) { bits.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, b.life);
      ctx.fillStyle = '#E9B85A';
      ctx.beginPath(); ctx.arc(b.x, b.y, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 漂浮字
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= dt / 1.3;
      f.y -= 26 * dt;
      if (f.life <= 0) { floats.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, f.life * 1.6);
      ctx.font = '600 15px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillText(f.text, f.x + 1, f.y + 1);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
  }
  renderTools();
  render();
  setStatus('手指按住面团转圈揉, 越揉越扁');

  return {
    destroy() {
      cancelAnimationFrame(raf);
    }
  };
}

/* ---------- 游戏: 指尖小圆 (v44) ----------
   灵感: iOS 「跟着小圆慢慢长大」引导冥想 App
   玩法: 把手指放到白圈里的青蓝色小圆上, 缓慢移动, 小圆跟随用户移动逐渐变大,
   最后填满整个屏幕; 松手后小圆缓慢缩小直至消失, 再次放上手指可重来. */
function buildTaichi(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const CX = GAME_W / 2, CY = GAME_H / 2 + 18;
  const RING_R = 74;        // 白色固定圆环半径
  const R_MIN = 8;          // 小圆初始半径
  const R_MAX = 520;        // 填满全屏 (远大于屏幕对角线)
  // 状态
  let dotX = CX, dotY = CY, dotR = 0;   // dotR=0 初始"未放上手指"
  let isDown = false;
  let grow = 0;                          // 累积"跟随移动量", 驱动 r 增长
  let moveDist = 0;                      // 用于提示"跟着手指动一动"
  let lastX = 0, lastY = 0, lastMoveT = 0;
  let lastSfx = 0;
  let reachedMax = false;
  // 浮动小气泡(背景装饰)
  const bubbles = Array.from({ length: 10 }, () => ({
    x: Math.random() * GAME_W,
    y: Math.random() * GAME_H,
    r: 1.2 + Math.random() * 3.4,
    vy: -(4 + Math.random() * 7),
    alpha: 0.42 + Math.random() * 0.20,
  }));
  // 倒计时: 用户首次按下起 3 分钟, 不动后清零
  let startT = 0, ticking = false;
  let lastT = performance.now(), raf = 0;

  function drawBackground() {
    const g = ctx.createRadialGradient(CX, CY - 80, 30, CX, CY + 60, GAME_W * 0.85);
    g.addColorStop(0, '#DFF3F4');
    g.addColorStop(1, '#B5E2E3');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    // 背景小白点
    for (const b of bubbles) {
      ctx.fillStyle = `rgba(255,255,255,${b.alpha})`;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawTopText() {
    ctx.textAlign = 'center';
    // 顶部倒计时(v46: 去掉英文, 只留数字 + 中文小标)
    let remainMs = 0;
    if (ticking) remainMs = Math.max(0, 180000 - (performance.now() - startT));
    const totalSec = Math.floor(remainMs / 1000);
    const mm = Math.floor(totalSec / 60);
    const ss = totalSec % 60;
    ctx.font = '300 30px "Cormorant Garamond", "Noto Sans SC", sans-serif';
    ctx.fillStyle = 'rgba(50,90,100,0.55)';
    ctx.fillText(String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'), CX, 50);
    ctx.font = '500 12px "Noto Sans SC", sans-serif';
    ctx.fillStyle = 'rgba(50,90,100,0.42)';
    ctx.fillText('静 心 小 憩', CX, 70);
    // v48: 中部两行大字提示去掉(用户反馈: 太丑挡视线), 只留底部小字
    // 底部当前小提示
    ctx.font = '500 14px "Noto Sans SC", sans-serif';
    ctx.fillStyle = 'rgba(50,90,100,0.55)';
    if (!isDown && dotR < 0.5) {
      ctx.fillText('把手指放到小圆上, 轻轻移动', CX, GAME_H - 24);
    } else if (isDown) {
      ctx.fillText(dotR < RING_R ? '再缓慢移动, 让它长大' : (dotR < R_MAX * 0.85 ? '心也跟着大起来了 ✦' : '松手, 让它慢慢散去'), CX, GAME_H - 24);
    } else {
      ctx.fillText('它慢慢散去啦 ✦ 再放上手指', CX, GAME_H - 24);
    }
  }

  function drawRing() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(CX, CY, RING_R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(CX, CY, RING_R - 7, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawDot() {
    if (dotR <= 0.5) return;
    const c = _wcRgb('#6E84B8');
    // v564 水彩外晕
    wcCirclePath(ctx, dotX, dotY, dotR * 1.25, dotR * 1.25, 3, 1.1);
    ctx.fillStyle = 'rgba(110, 132, 184, 0.30)';
    ctx.fill();
    // 主体渐变
    const g = ctx.createRadialGradient(dotX - dotR * 0.3, dotY - dotR * 0.35, dotR * 0.1, dotX, dotY, dotR);
    g.addColorStop(0, '#A8BDE0');
    g.addColorStop(0.6, '#6E84B8');
    g.addColorStop(1, '#4A5E8A');
    wcCirclePath(ctx, dotX, dotY, dotR, dotR, 1, 1);
    ctx.fillStyle = g;
    ctx.fill();
    // v564 边缘积色
    ctx.lineWidth = 1.8; ctx.strokeStyle = 'rgba(40, 50, 80, 0.40)';
    wcCirclePath(ctx, dotX, dotY, dotR * 0.98, dotR * 0.98, 1, 1);
    ctx.stroke();
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.ellipse(dotX - dotR * 0.32, dotY - dotR * 0.40, dotR * 0.28, dotR * 0.14, -0.5, 0, Math.PI * 2); ctx.fill();
  }

  function drawFullOverlay() {
    // 小圆几乎填满全屏时的整屏柔光
    if (dotR < R_MAX * 0.7) return;
    const k = Math.min(1, (dotR - R_MAX * 0.7) / (R_MAX * 0.28));
    ctx.fillStyle = `rgba(168,228,232,${0.18 * k})`;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
  }

  // ---------- 指针交互 ----------
  cv.addEventListener('pointerdown', e => {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    isDown = true;
    grow = 0;
    moveDist = 0;
    dotX = p.x; dotY = p.y;
    lastX = p.x; lastY = p.y;
    lastMoveT = performance.now();
    startT = performance.now();
    ticking = true;
    reachedMax = false;
    if (dotR < R_MIN) dotR = R_MIN;
  });
  cv.addEventListener('pointermove', e => {
    if (!isDown) return;
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    const now = performance.now();
    const dx = p.x - lastX, dy = p.y - lastY;
    const d = Math.hypot(dx, dy);
    if (d > 1.5) {
      dotX = p.x; dotY = p.y;
      grow += d * 0.85;            // 移动越多, r 越大
      moveDist += d;
      lastX = p.x; lastY = p.y;
      lastMoveT = now;
      // v548: 指尖小圆改为完全无声(用户要求)
    }
  });
  const endDrag = () => { if (isDown) isDown = false; };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointerleave', endDrag);
  cv.addEventListener('pointercancel', endDrag);

  function render(time) {
    raf = requestAnimationFrame(render);
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    // 半径更新
    if (isDown) {
      // 拖动: r = R_MIN + grow * 0.22 (v46: 放慢, 慢慢陪它长大)
      dotR = Math.min(R_MAX, R_MIN + grow * 0.22);
    } else {
      // 松手: r 缓慢缩小(0.7 / 秒); 全部归 0 后 dotR=0
      dotR = Math.max(0, dotR - dt * 70);
      grow = Math.max(0, grow - dt * 30);
    }
    // 满屏时: 一次性水晶钵鸣响(标记到达)
    if (dotR >= R_MAX * 0.98 && !reachedMax) {
      reachedMax = true;
      playHealingChime();
    }
    // 静止 1.5s 且未点: 停止倒计时
    if (ticking && (now - lastMoveT > 1500) && !isDown) ticking = false;

    // 气泡上浮
    for (const b of bubbles) {
      b.y += b.vy * dt;
      if (b.y < -8) { b.y = GAME_H + 8; b.x = Math.random() * GAME_W; }
    }

    ctx.clearRect(0, 0, GAME_W, GAME_H);
    drawBackground();
    drawTopText();
    drawRing();
    drawDot();
    drawFullOverlay();
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
  }
  render();

  return {
    destroy() { cancelAnimationFrame(raf); }
  };
}

/* ============================================
   v572: 数据搬家（换网址 / 换设备迁移账号数据）
   导出 = 全部 localStorage 打包成一段数据码(base64)
   导入 = 粘贴数据码, 覆盖写入后刷新页面
   ============================================ */
function migEncode(str) { return btoa(unescape(encodeURIComponent(str))); }
function migDecode(code) { return decodeURIComponent(escape(atob(code))); }

function exportAllData() {
  const pairs = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    const v = localStorage.getItem(k);
    if (v !== null) pairs.push([k, v]);
  }
  return migEncode(JSON.stringify({ app: 'music-aroma', v: 1, ts: Date.now(), d: pairs }));
}

function importAllData(code) {
  const obj = JSON.parse(migDecode(String(code).trim()));
  if (!obj || obj.app !== 'music-aroma' || !Array.isArray(obj.d)) throw new Error('bad code');
  obj.d.forEach(pair => {
    if (Array.isArray(pair) && typeof pair[0] === 'string' && typeof pair[1] === 'string') {
      localStorage.setItem(pair[0], pair[1]);
    }
  });
  return obj.d.length;
}

function bindMigration() {
  const exportBtn = document.getElementById('migExportBtn');
  const exportBox = document.getElementById('migExportBox');
  const exportArea = document.getElementById('migExportArea');
  const copyBtn = document.getElementById('migCopyBtn');
  const importArea = document.getElementById('migImportArea');
  const importBtn = document.getElementById('migImportBtn');
  if (!exportBtn || !exportArea || !importArea) return;

  exportBtn.addEventListener('click', () => {
    try {
      exportArea.value = exportAllData();
      exportBox.hidden = false;
      toast('数据码已生成, 点「复制数据码」发给新网址的自己');
    } catch (e) { toast('生成失败, 数据可能太大, 请联系站长'); }
  });

  copyBtn.addEventListener('click', async () => {
    const code = exportArea.value;
    if (!code) { toast('请先点「生成数据码」'); return; }
    try {
      await navigator.clipboard.writeText(code);
      toast('已复制! 到新网址 设置 → 数据搬家 粘贴导入');
    } catch (_) {
      exportArea.select();
      const ok = document.execCommand('copy');
      toast(ok ? '已复制! 到新网址粘贴导入' : '复制失败, 请长按文本框手动全选复制');
    }
  });

  importBtn.addEventListener('click', () => {
    const code = importArea.value;
    if (!code.trim()) { toast('请先把数据码粘贴进来'); return; }
    if (!window.confirm('导入会覆盖这台设备上的全部数据(账号、小宠、订单、聊天), 确定继续吗?')) return;
    try {
      const n = importAllData(code);
      toast('导入成功, 共迁移 ' + n + ' 项数据, 页面即将刷新…');
      setTimeout(() => location.reload(), 1300);
    } catch (e) {
      toast('数据码无效, 请检查是否复制完整');
    }
  });
}


/* ============================================
   v52: 疗愈小宠（选宠 / 命名 / 浇水 / 喂食 / 魔力值 / 精油减免）
   ============================================ */
const PET_LABEL = { rabbit: '小兔', bear: '小熊' };
const PET_COLORS = {
  peach: ['#f8d8e0', '#f0a8b8', '#d8758c'],
  lotus: ['#e8f0e2', '#c2d8b2', '#8aa878'],
};
/* v532: 旧四色多肉迁移映射(pink→桃蛋, 其余→白牡丹) */
const PLANT_OLD_COLORS = { pink: 'peach', green: 'lotus', purple: 'lotus', teal: 'lotus' };

const PET_INGS = [
  { id: 'meat',     name: '肉',     emoji: '🥩' },
  { id: 'egg',      name: '鸡蛋',   emoji: '🥚' },
  { id: 'veg',      name: '青菜',   emoji: '🥬' },
  { id: 'tomato',   name: '西红柿', emoji: '🍅' },
  { id: 'apple',    name: '苹果',   emoji: '🍎' },
  { id: 'flour',    name: '面粉',   emoji: '🌾' },
  { id: 'garlic',   name: '蒜',     emoji: '🧄' },
  { id: 'milk',     name: '牛奶',   emoji: '🥛' },
];

/* 7 个正确菜谱(key = 排序后 'a+b'), 其他组合 = 黑暗料理 */
/* svg = 手绘真实食物图标(96x96) */
const FOOD_SVG = {
  scramble: '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><ellipse cx="48" cy="61" rx="36" ry="11" fill="#f7f1e7" stroke="#ddd2bf" stroke-width="2"/><ellipse cx="48" cy="59" rx="26" ry="7.5" fill="#efe6d6"/><path d="M34 53 Q27 45 35 41 Q41 37 46 43 Q50 37 56 42 Q63 46 58 53 Q53 58 46 56 Q38 58 34 53Z" fill="#f6c644"/><path d="M38 50 Q42 45 47 48 Q52 44 55 49 Q57 53 51 54 Q45 56 40 53Z" fill="#f2b52c"/><path d="M30 56 Q27 49 34 48 Q37 50 36 55 Q35 59 30 56Z" fill="#e0553f"/><path d="M59 54 Q63 49 67 54 Q66 59 61 58 Q58 57 59 54Z" fill="#d94a35"/><path d="M45 58 Q48 53 53 57 Q53 62 48 61 Q44 60 45 58Z" fill="#e8644a"/><ellipse cx="32" cy="52" rx="2.2" ry="1.3" fill="#f78a6e" opacity="0.85"/><ellipse cx="61" cy="52" rx="1.8" ry="1.1" fill="#f78a6e" opacity="0.8"/><circle cx="64" cy="57" r="1.1" fill="#f2d9a0"/><path d="M39 60 Q40 57 42 59" stroke="#f7dd8a" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
  brisket: '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><ellipse cx="48" cy="30" rx="32" ry="9" fill="#f4ede1" stroke="#d9cfbb" stroke-width="2"/><path d="M16 30 Q18 66 48 68 Q78 66 80 30 Z" fill="#faf6ee" stroke="#ddd3c0" stroke-width="2"/><ellipse cx="48" cy="32" rx="27" ry="7" fill="#d94a35"/><ellipse cx="48" cy="31" rx="23" ry="5.4" fill="#e05b42"/><path d="M33 29 Q32 24 38 25 Q41 26 40 30 Q39 33 34 32Z" fill="#8a4a33" stroke="#6e3826" stroke-width="1"/><path d="M55 30 Q55 25 61 26 Q64 28 62 32 Q59 34 55 30Z" fill="#9a5640" stroke="#6e3826" stroke-width="1"/><path d="M44 26 Q46 22 49 23 Q50 26 47 28 Q44 28 44 26Z" fill="#7a3f2c"/><path d="M40 35 Q42 33 45 34 Q46 36 43 37 Q40 37 40 35Z" fill="#c23a26" opacity="0.9"/><circle cx="61" cy="33" r="1.7" fill="#c23a26" opacity="0.85"/><path d="M37 15 Q35 11 38 8 Q41 11 39 15" fill="none" stroke="#e8b4a6" stroke-width="2" stroke-linecap="round" opacity="0.7"/><path d="M57 14 Q55 10 58 7 Q61 10 59 14" fill="none" stroke="#e8b4a6" stroke-width="2" stroke-linecap="round" opacity="0.6"/></svg>',
  steamed: '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><ellipse cx="48" cy="32" rx="32" ry="9" fill="#f4ede1" stroke="#d9cfbb" stroke-width="2"/><path d="M16 32 Q18 68 48 70 Q78 68 80 32 Z" fill="#faf6ee" stroke="#ddd3c0" stroke-width="2"/><ellipse cx="48" cy="34" rx="27" ry="7" fill="#f4ce5e"/><ellipse cx="48" cy="33" rx="23" ry="5.6" fill="#f9d76c"/><ellipse cx="40" cy="31" rx="7" ry="1.9" fill="#fff6d8" opacity="0.85"/><ellipse cx="58" cy="33" rx="5" ry="1.4" fill="#fff6d8" opacity="0.6"/><circle cx="36" cy="34" r="2.3" fill="#8a5a33"/><circle cx="45" cy="36" r="1.9" fill="#7c4e2b"/><circle cx="54" cy="33" r="2.1" fill="#965f37"/><circle cx="62" cy="35" r="1.8" fill="#7c4e2b"/><circle cx="41" cy="30" r="1.5" fill="#a06a3e"/><circle cx="50" cy="37" r="1.4" fill="#8a5a33"/></svg>',
  garlic: '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><rect x="13" y="43" width="15" height="6" rx="3" fill="#5a5a5a" transform="rotate(-14 20 46)"/><path d="M25 41 Q27 70 48 71 Q69 70 71 41 Z" fill="#9aa0a6"/><ellipse cx="48" cy="41" rx="24" ry="7.5" fill="#3c3f42"/><ellipse cx="48" cy="40" rx="20" ry="5.8" fill="#4d5155"/><path d="M39 37 Q30 27 41 25 Q47 23 47 31 Q47 37 41 39Z" fill="#5a9e3f"/><path d="M51 38 Q57 26 64 28 Q69 31 63 39 Q58 43 51 38Z" fill="#79b851"/><path d="M45 41 Q42 33 48 31 Q51 33 49 40 Q47 43 45 41Z" fill="#6db048"/><path d="M41 27 Q42 32 42 36" stroke="#cfe8b8" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M58 29 Q60 33 61 37" stroke="#d4ecc0" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M32 41 Q31 37 34 36 Q36 38 35 41 Q34 43 32 41Z" fill="#f7f2e8" stroke="#e0d6c2" stroke-width="1"/><path d="M63 42 Q62 38 65 37 Q67 39 66 42 Q65 44 63 42Z" fill="#faf6ee" stroke="#e0d6c2" stroke-width="1"/><circle cx="34" cy="40" r="0.9" fill="#d8b98a"/><circle cx="65" cy="41" r="0.9" fill="#d8b98a"/></svg>',
  pie: '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><ellipse cx="48" cy="58" rx="37" ry="12" fill="#c98a4b"/><ellipse cx="48" cy="54" rx="30" ry="9" fill="#b5713a"/><rect x="22" y="50" width="52" height="8" rx="3.5" fill="#f2d9a0" stroke="#dfb97a" stroke-width="1"/><rect x="22" y="61" width="52" height="7" rx="3.5" fill="#f6e0ac" stroke="#dfb97a" stroke-width="1"/><rect x="29" y="46" width="7" height="22" rx="3.5" fill="#f2d9a0" stroke="#dfb97a" stroke-width="1"/><rect x="45" y="46" width="7" height="22" rx="3.5" fill="#f6e0ac" stroke="#dfb97a" stroke-width="1"/><rect x="61" y="46" width="7" height="22" rx="3.5" fill="#f2d9a0" stroke="#dfb97a" stroke-width="1"/><path d="M14 55 Q12 59 18 61 Q24 63 28 61 Q33 59 38 61 Q43 63 48 61 Q53 59 58 61 Q63 63 68 61 Q73 59 79 61 Q84 63 82 56" fill="none" stroke="#e8c88e" stroke-width="4" stroke-linecap="round"/><ellipse cx="42" cy="49" rx="8" ry="2.4" fill="#fff3cf" opacity="0.55"/></svg>',
  applemilk: '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><path d="M26 28 L30 76 Q48 82 66 76 L70 28 Z" fill="#f7f3ec" stroke="#d8cfbe" stroke-width="2"/><ellipse cx="48" cy="36" rx="20" ry="6" fill="#fdfcf8"/><ellipse cx="48" cy="34" rx="17.5" ry="4.5" fill="#ffffff"/><path d="M40 41 Q39 36 44 36 Q46 39 44 43 Q41 44 40 41Z" fill="#e0553f" opacity="0.7"/><path d="M55 42 Q54 37 59 37 Q61 40 59 44 Q56 45 55 42Z" fill="#d94a35" opacity="0.65"/><circle cx="70" cy="25" r="9" fill="#e0553f"/><path d="M79 23 Q83 23 83 27 Q83 30 79 30Z" fill="#7a9e3f"/><circle cx="67.5" cy="22.5" r="2.3" fill="#f7e0c8"/><path d="M70 25 Q73 27 75 25" stroke="#f7e0c8" stroke-width="1.4" fill="none" stroke-linecap="round"/><ellipse cx="48" cy="80" rx="19" ry="3" fill="#e8e0d0" opacity="0.6"/><path d="M41 19 Q39 15 42 12 Q45 15 43 19" fill="none" stroke="#e8b4a6" stroke-width="1.7" stroke-linecap="round" opacity="0.65"/></svg>',
  cake: '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><ellipse cx="48" cy="78" rx="34" ry="9" fill="#f4ede1" stroke="#d9cfbb" stroke-width="2"/><ellipse cx="48" cy="76" rx="25" ry="6" fill="#efe6d6"/><rect x="25" y="48" width="46" height="17" rx="4" fill="#eec47f" stroke="#cf9a54" stroke-width="1.6"/><rect x="25" y="45" width="46" height="7" rx="3" fill="#f2d9a0"/><path d="M25 47 Q28 40 35 44 Q42 38 49 43 Q56 37 63 42 Q70 38 71 45 Z" fill="#fff6ea" stroke="#e0cfae" stroke-width="1.5"/><path d="M25 51 h46" stroke="#e0cfae" stroke-width="1.4"/><path d="M38 30 Q34 39 39 42 Q43 44 44 38 Q45 33 41 28Z" fill="#e0553f" stroke="#c23a26" stroke-width="1.2"/><path d="M41 32 Q40 35 41 38" stroke="#f78a6e" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M36 39 Q38 37 40 38" stroke="#f78a6e" stroke-width="1" fill="none" stroke-linecap="round"/><circle cx="57" cy="31" r="4.8" fill="#d94a35"/><path d="M57 26.5 Q58.5 22 62 21" stroke="#7a9e3f" stroke-width="1.7" fill="none" stroke-linecap="round"/><circle cx="57" cy="31" r="1.3" fill="#f7c8c0" opacity="0.8"/><circle cx="48" cy="38" r="2.8" fill="#fff6ea" stroke="#e0cfae" stroke-width="1.2"/></svg>',
};

const PET_RECIPES = [
  { key: 'egg+tomato',    name: '番茄炒蛋', emoji: '🍳', svg: FOOD_SVG.scramble, desc: '「哇！是热腾腾的番茄炒蛋！」小宠眼睛亮了起来，吧唧吧唧吃个精光。' },
  { key: 'meat+tomato',   name: '番茄牛腩', emoji: '🥘', svg: FOOD_SVG.brisket, desc: '「好香好香！」小宠抱着碗不肯撒手，连汤汁都舔得一干二净。' },
  { key: 'egg+meat',      name: '肉沫蒸蛋', emoji: '🥣', svg: FOOD_SVG.steamed, desc: '「嫩滑嫩滑的～」小宠满足地眯起眼睛，发出小小的呼噜声。' },
  { key: 'garlic+veg',    name: '蒜蓉炒菜', emoji: '🥗', svg: FOOD_SVG.garlic, desc: '「青菜脆脆的，好清爽～」小宠吃得很开心，毛茸茸的耳朵抖了抖。' },
  { key: 'apple+flour',   name: '苹果派',   emoji: '🥧', svg: FOOD_SVG.pie, desc: '「甜甜的派诶！」小宠一口咬下去，酥皮屑撒了一地。' },
  { key: 'apple+milk',    name: '苹果烤奶', emoji: '☕', svg: FOOD_SVG.applemilk, desc: '「暖暖的牛奶香～」小宠捧着杯子小口小口地喝，肚子暖暖的。' },
  { key: 'egg+flour',     name: '蛋糕',     emoji: '🍰', svg: FOOD_SVG.cake, desc: '「软绵绵的蛋糕！」小宠开心得原地转圈，奶油蹭到了鼻尖上。' },
];

const PET_SVG = {
  rabbit: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"小兔\">\n  <defs>\n    <radialGradient id=\"p2rbBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\n      <stop offset=\"0%\" stop-color=\"#ffffff\"/>\n      <stop offset=\"42%\" stop-color=\"#faf6fe\"/>\n      <stop offset=\"74%\" stop-color=\"#eee0f7\"/>\n      <stop offset=\"100%\" stop-color=\"#d7c0ec\"/>\n    </radialGradient>\n    <radialGradient id=\"p2rbEarIn\" cx=\"50%\" cy=\"28%\" r=\"78%\">\n      <stop offset=\"0%\" stop-color=\"#f6cfe0\"/>\n      <stop offset=\"100%\" stop-color=\"#ecacd0\"/>\n    </radialGradient>\n    <radialGradient id=\"p2rbBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n      <stop offset=\"0%\" stop-color=\"#f0a8c6\" stop-opacity=\".5\"/>\n      <stop offset=\"100%\" stop-color=\"#f0a8c6\" stop-opacity=\"0\"/>\n    </radialGradient>\n    <radialGradient id=\"p2rbWash\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n      <stop offset=\"0%\" stop-color=\"#f6f0fc\" stop-opacity=\".85\"/>\n      <stop offset=\"100%\" stop-color=\"#f6f0fc\" stop-opacity=\"0\"/>\n    </radialGradient>\n    <filter id=\"p2rbEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"6\" result=\"n\"/>\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\n    </filter>\n    <filter id=\"p2rbFur\" x=\"-35%\" y=\"-35%\" width=\"170%\" height=\"170%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2.4\" result=\"soft\"/>\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.045\" numOctaves=\"2\" seed=\"9\" result=\"n\"/>\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"13\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\n    </filter>\n    <filter id=\"p2rbHalo\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\n    </filter>\n  </defs>\n  <ellipse cx=\"120\" cy=\"231\" rx=\"52\" ry=\"6.5\" fill=\"#b9a4dd\" opacity=\".2\"/>\n  <ellipse cx=\"120\" cy=\"150\" rx=\"86\" ry=\"80\" fill=\"#e8daf6\" opacity=\".45\" filter=\"url(#p2rbHalo)\"/>\n  <g filter=\"url(#p2rbEdge)\">\n    <g transform=\"rotate(-10 92 88)\">\n      <g class=\"pt2-ear-l\">\n        <ellipse cx=\"92\" cy=\"44\" rx=\"17\" ry=\"45\" fill=\"url(#p2rbBody)\"/>\n        <ellipse cx=\"92\" cy=\"52\" rx=\"8\" ry=\"31\" fill=\"url(#p2rbEarIn)\" opacity=\".85\"/>\n      </g>\n    </g>\n    <g transform=\"rotate(10 148 88)\">\n      <g class=\"pt2-ear-r\">\n        <ellipse cx=\"148\" cy=\"44\" rx=\"17\" ry=\"45\" fill=\"url(#p2rbBody)\"/>\n        <ellipse cx=\"148\" cy=\"52\" rx=\"8\" ry=\"31\" fill=\"url(#p2rbEarIn)\" opacity=\".85\"/>\n      </g>\n    </g>\n    <path d=\"M 120 64 C 88 64 66 88 66 118 C 66 136 74 148 84 156 C 70 168 66 186 72 204 C 78 224 92 234 108 234 C 114 234 118 231 120 227 C 122 231 126 234 132 234 C 148 234 162 224 168 204 C 174 186 170 168 156 156 C 166 148 174 136 174 118 C 174 88 152 64 120 64 Z\" fill=\"url(#p2rbBody)\"/>\n  </g>\n  <g filter=\"url(#p2rbFur)\">\n    <ellipse cx=\"120\" cy=\"192\" rx=\"40\" ry=\"30\" fill=\"url(#p2rbWash)\" opacity=\".8\"/>\n    <ellipse cx=\"88\" cy=\"172\" rx=\"20\" ry=\"26\" fill=\"#e6d8f4\" opacity=\".4\"/>\n    <ellipse cx=\"152\" cy=\"172\" rx=\"20\" ry=\"26\" fill=\"#e6d8f4\" opacity=\".4\"/>\n    <ellipse cx=\"98\" cy=\"80\" rx=\"18\" ry=\"14\" fill=\"#fdeef6\" opacity=\".5\"/>\n    <ellipse cx=\"104\" cy=\"218\" rx=\"14\" ry=\"8\" fill=\"#f0e2f8\" opacity=\".55\"/>\n    <ellipse cx=\"140\" cy=\"218\" rx=\"14\" ry=\"8\" fill=\"#f0e2f8\" opacity=\".55\"/>\n  </g>\n  <g class=\"pt2-eyes\">\n    <circle cx=\"98\" cy=\"116\" r=\"8.5\" fill=\"#4a4058\"/>\n    <circle cx=\"101\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\n    <circle cx=\"142\" cy=\"116\" r=\"8.5\" fill=\"#4a4058\"/>\n    <circle cx=\"145\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\n  </g>\n  <ellipse cx=\"80\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2rbBlush)\"/>\n  <ellipse cx=\"160\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2rbBlush)\"/>\n  <path d=\"M 114 129 Q 120 125 126 129 Q 120 136.5 114 129 Z\" fill=\"#d98bc0\"/>\n  <g class=\"pt2-mouth-closed\">\n    <path d=\"M 111.5 140 Q 115.8 144.5 120 140.5 Q 124.2 144.5 128.5 140\" fill=\"none\" stroke=\"#8a6bb0\" stroke-width=\"2.6\" stroke-linecap=\"round\"/>\n  </g>\n  <g class=\"pt2-mouth-open\">\n    <ellipse cx=\"120\" cy=\"145\" rx=\"8\" ry=\"10\" fill=\"#7a5a9e\"/>\n    <ellipse cx=\"120\" cy=\"151\" rx=\"4.8\" ry=\"3.6\" fill=\"#f0a8c8\" opacity=\".85\"/>\n  </g>\n  <g transform=\"translate(52 60) scale(.8)\"><path class=\"pt2-spark\" style=\"animation-delay:.4s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#e8c9f0\" opacity=\".85\"/></g>\n  <g transform=\"translate(190 64) scale(.7)\"><path class=\"pt2-spark\" style=\"animation-delay:1.3s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9d8\" opacity=\".85\"/></g>\n  <g transform=\"translate(38 152) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:2.1s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#c9e4f0\" opacity=\".85\"/></g>\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.7s\" cx=\"176\" cy=\"168\" r=\"2.4\" fill=\"#fff\"/>\n  <circle class=\"pt2-spark\" style=\"animation-delay:.9s\" cx=\"44\" cy=\"108\" r=\"2\" fill=\"#fff\"/>\n</svg>",
  bear:   "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"小熊\">\n  <defs>\n    <radialGradient id=\"p2brBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\n      <stop offset=\"0%\" stop-color=\"#f8efe4\"/>\n      <stop offset=\"45%\" stop-color=\"#f0dcc4\"/>\n      <stop offset=\"76%\" stop-color=\"#e0c19c\"/>\n      <stop offset=\"100%\" stop-color=\"#c9a078\"/>\n    </radialGradient>\n    <radialGradient id=\"p2brEarIn\" cx=\"50%\" cy=\"42%\" r=\"70%\">\n      <stop offset=\"0%\" stop-color=\"#f6e7d4\"/>\n      <stop offset=\"100%\" stop-color=\"#e8cfae\"/>\n    </radialGradient>\n    <radialGradient id=\"p2brBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n      <stop offset=\"0%\" stop-color=\"#f0a0a8\" stop-opacity=\".5\"/>\n      <stop offset=\"100%\" stop-color=\"#f0a0a8\" stop-opacity=\"0\"/>\n    </radialGradient>\n    <radialGradient id=\"p2brWash\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n      <stop offset=\"0%\" stop-color=\"#faf0e2\" stop-opacity=\".85\"/>\n      <stop offset=\"100%\" stop-color=\"#faf0e2\" stop-opacity=\"0\"/>\n    </radialGradient>\n    <filter id=\"p2brEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"12\" result=\"n\"/>\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\n    </filter>\n    <filter id=\"p2brFur\" x=\"-35%\" y=\"-35%\" width=\"170%\" height=\"170%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2.4\" result=\"soft\"/>\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.045\" numOctaves=\"2\" seed=\"15\" result=\"n\"/>\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"13\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\n    </filter>\n    <filter id=\"p2brHalo\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\n    </filter>\n  </defs>\n  <ellipse cx=\"120\" cy=\"234\" rx=\"54\" ry=\"6.5\" fill=\"#b08a60\" opacity=\".22\"/>\n  <ellipse cx=\"120\" cy=\"152\" rx=\"88\" ry=\"82\" fill=\"#f0dcc2\" opacity=\".5\" filter=\"url(#p2brHalo)\"/>\n  <g filter=\"url(#p2brEdge)\">\n    <g class=\"pt2-bear-ear-l\">\n      <circle cx=\"82\" cy=\"66\" r=\"24\" fill=\"url(#p2brBody)\"/>\n      <circle cx=\"82\" cy=\"66\" r=\"13\" fill=\"url(#p2brEarIn)\"/>\n    </g>\n    <g class=\"pt2-bear-ear-r\">\n      <circle cx=\"158\" cy=\"66\" r=\"24\" fill=\"url(#p2brBody)\"/>\n      <circle cx=\"158\" cy=\"66\" r=\"13\" fill=\"url(#p2brEarIn)\"/>\n    </g>\n    <path d=\"M 120 66 C 86 66 62 92 62 124 C 62 146 72 158 84 166 C 68 178 64 198 72 216 C 80 234 96 240 110 239 C 115 239 118 236 120 232 C 122 236 125 239 130 239 C 144 240 160 234 168 216 C 176 198 172 178 156 166 C 168 158 178 146 178 124 C 178 92 154 66 120 66 Z\" fill=\"url(#p2brBody)\"/>\n  </g>\n  <g filter=\"url(#p2brFur)\">\n    <ellipse cx=\"120\" cy=\"150\" rx=\"27\" ry=\"21\" fill=\"url(#p2brWash)\" opacity=\".9\"/>\n    <ellipse cx=\"120\" cy=\"196\" rx=\"40\" ry=\"30\" fill=\"url(#p2brWash)\" opacity=\".7\"/>\n    <ellipse cx=\"88\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#e4c9a6\" opacity=\".4\"/>\n    <ellipse cx=\"152\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#e4c9a6\" opacity=\".4\"/>\n    <ellipse cx=\"96\" cy=\"84\" rx=\"18\" ry=\"13\" fill=\"#f8ecd8\" opacity=\".5\"/>\n    <ellipse cx=\"104\" cy=\"222\" rx=\"14\" ry=\"8\" fill=\"#f2e2ca\" opacity=\".55\"/>\n    <ellipse cx=\"140\" cy=\"222\" rx=\"14\" ry=\"8\" fill=\"#f2e2ca\" opacity=\".55\"/>\n  </g>\n  <g class=\"pt2-eyes\">\n    <circle cx=\"99\" cy=\"118\" r=\"8\" fill=\"#4a3c30\"/>\n    <circle cx=\"102\" cy=\"115\" r=\"2.8\" fill=\"#fff\"/>\n    <circle cx=\"141\" cy=\"118\" r=\"8\" fill=\"#4a3c30\"/>\n    <circle cx=\"144\" cy=\"115\" r=\"2.8\" fill=\"#fff\"/>\n  </g>\n  <ellipse cx=\"76\" cy=\"142\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2brBlush)\"/>\n  <ellipse cx=\"164\" cy=\"142\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2brBlush)\"/>\n  <path d=\"M 113 138 Q 120 133.5 127 138 Q 120 146.5 113 138 Z\" fill=\"#8a6248\"/>\n  <g class=\"pt2-mouth-closed\">\n    <path d=\"M 120 146 Q 120 150 116 151.5 M 120 146 Q 120 150 124 151.5\" fill=\"none\" stroke=\"#7a543c\" stroke-width=\"2.4\" stroke-linecap=\"round\"/>\n  </g>\n  <g class=\"pt2-mouth-open\">\n    <ellipse cx=\"120\" cy=\"149\" rx=\"7.5\" ry=\"9\" fill=\"#7a543c\"/>\n    <ellipse cx=\"120\" cy=\"154\" rx=\"4.4\" ry=\"3.2\" fill=\"#f0b0a0\" opacity=\".85\"/>\n  </g>\n  <g transform=\"translate(50 62) scale(.8)\"><path class=\"pt2-spark\" style=\"animation-delay:.5s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\n  <g transform=\"translate(192 68) scale(.7)\"><path class=\"pt2-spark\" style=\"animation-delay:1.4s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#e8c9b0\" opacity=\".85\"/></g>\n  <g transform=\"translate(40 150) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:2.2s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#c9e0f0\" opacity=\".85\"/></g>\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.8s\" cx=\"174\" cy=\"166\" r=\"2.4\" fill=\"#fff\"/>\n  <circle class=\"pt2-spark\" style=\"animation-delay:1s\" cx=\"46\" cy=\"110\" r=\"2\" fill=\"#fff\"/>\n</svg>",
};

/* 小宠语录（{name} 会被替换成宠物名字） */
const PET_TALKS = {
  greet: [
    '你好呀，我是{name}，以后请多关照～',
    '{name}来陪你啦，今天想做什么呢？',
    '初次见面，我会一直陪着你的！',
  ],
  touch: [
    '嘿嘿，好痒呀～',
    '被你摸摸，超开心的！',
    '我在这里呀，一直都在。',
  ],
  watered: [
    '谢谢你浇灌我，心里甜甜的～',
    '咕噜咕噜～好清凉呀！',
    '喝饱啦！明天也要来看我哦～',
  ],
  fed: [
    '哇！好好吃，我最喜欢你了！',
    '（嚼嚼嚼）美味～肚皮圆滚滚！',
    '有你在，每顿饭都变香了～',
  ],
  dark: [
    '唔……这个味道……我还是躲开吧！',
    '（后退两步）这、这个真的不能吃啦！',
    '呜……还是给我做点正常的食物吧～',
  ],
  rabbit: [
    '我的长耳朵能听见你的心跳哦。',
    '胡萝卜分你一半！',
    '蹦蹦跳跳，烦恼赶跑～',
  ],
  bear: [
    '呼噜呼噜～今天也元气满满！',
    '抱抱我吧，我的肚皮最软啦！',
    '和你在一起，连空气都是甜的～',
  ],
};

function pickTalk(cat, p) {
  let pool = PET_TALKS[cat];
  if (cat === 'touch' && p && PET_TALKS[p.type]) pool = PET_TALKS[p.type];
  if (!pool || !pool.length) return '';
  const t = pool[Math.floor(Math.random() * pool.length)];
  return t.replace('{name}', (p && p.name) || '小可爱');
}

let petTalkTimer = null;
let petGreeted = false;
function petSay(text, dur) {
  const bubble = document.getElementById('petBubble');
  const avatar = document.getElementById('petAvatar');
  if (!bubble || !avatar) return;
  bubble.textContent = text;
  bubble.hidden = false;
  bubble.classList.remove('pet-bubble-out', 'pet-bubble-in');
  void bubble.offsetWidth; // 重启动画
  bubble.classList.add('pet-bubble-in');
  avatar.classList.add('talking');
  clearTimeout(petTalkTimer);
  petTalkTimer = setTimeout(() => {
    bubble.classList.remove('pet-bubble-in');
    bubble.classList.add('pet-bubble-out');
    avatar.classList.remove('talking');
    setTimeout(() => { bubble.hidden = true; }, 320);
  }, dur || 3200);
}

function renderPetCreature(p) {
  const slot = document.getElementById('petCreature');
  if (!slot) return;
  const type = (p && p.type === 'bear') ? 'bear' : 'rabbit';
  slot.innerHTML = PET_SVG[type];
  const svg = slot.querySelector('svg');
  if (svg) svg.setAttribute('role', 'img');
}

function petDefault() {
  const colors = Object.keys(PET_COLORS);
  return {
    type: null,            // 'rabbit' | 'bear' | null
    name: '',
    plantColor: colors[Math.floor(Math.random() * colors.length)],
    magic: 0,
    lastWaterDate: '',     // 'YYYY-MM-DD'
    unlocked: [],          // 数组, 存 recipe.name
  };
}

function loadPet() {
  try {
    const raw = localStorage.getItem('ma_pet');
    if (!raw) return petDefault();
    const p = JSON.parse(raw);
    const merged = Object.assign(petDefault(), p);
    // v532: 旧四色多肉迁移到 桃蛋/白牡丹, 旧 pig 类型迁移到 bear
    let migrated = false;
    if (merged.plantColor && PLANT_OLD_COLORS[merged.plantColor]) {
      merged.plantColor = PLANT_OLD_COLORS[merged.plantColor];
      migrated = true;
    }
    if (merged.type === 'pig') { merged.type = 'bear'; migrated = true; }
    if (migrated) { try { localStorage.setItem('ma_pet', JSON.stringify(merged)); } catch (_) {} }
    return merged;
  } catch (e) { return petDefault(); }
}

function savePet(p) {
  try {
    localStorage.setItem('ma_pet', JSON.stringify(p));
    return true;
  } catch (e) {
    try { toast('⚠️ 保存失败，请检查浏览器存储空间'); } catch (_) {}
    return false;
  }
}

function getMaPet() { return loadPet(); }

/* 暴露给结算弹窗 + 测试 */
window._pet = null;
function refreshPetGlobal() { window._pet = loadPet(); }
refreshPetGlobal();

function petToday() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function petRecipeKey(a, b) {
  return [a, b].sort().join('+');
}

function findRecipe(a, b) {
  const key = petRecipeKey(a, b);
  return PET_RECIPES.find(r => r.key === key) || null;
}

/* ---------- 渲染多肉植物(v532: 桃蛋/白牡丹 两种真实形态) ---------- */
/* v538: 无盆魔法植物, 颜色加深(饱和) */
const SUCCULENT_SVG = {
  peach: { label: '桃蛋', light: '#fbd3dd', base: '#ef89a2', tip: '#e76f8f', dark: '#bd4a69' },
  lotus: { label: '白牡丹', light: '#eef7e8', base: '#c6e0b2', tip: '#f09fb6', dark: '#789b62' },
};

function plantTypeOf(p) {
  return (p && (p.plantColor === 'peach' || p.plantColor === 'lotus')) ? p.plantColor : 'peach';
}

/* v535: 桃蛋 —— 粉叶簇生, 叶片径向渐变边缘透明(羽化), 魔法玻璃盆里水光潋滟 */
function renderPeachSucculent(c, uid) {
  const leaves = [
    { x: 40, y: 94, w: 30, h: 22, rot: -42 },
    { x: 100, y: 94, w: 30, h: 22, rot: 42 },
    { x: 48, y: 84, w: 28, h: 21, rot: -28 },
    { x: 92, y: 84, w: 28, h: 21, rot: 28 },
    { x: 40, y: 64, w: 26, h: 20, rot: -34 },
    { x: 100, y: 64, w: 26, h: 20, rot: 34 },
    { x: 56, y: 54, w: 25, h: 19, rot: -14 },
    { x: 84, y: 54, w: 25, h: 19, rot: 14 },
    { x: 70, y: 46, w: 27, h: 20, rot: 0 },
    { x: 52, y: 36, w: 22, h: 16, rot: -20 },
    { x: 88, y: 36, w: 22, h: 16, rot: 20 },
    { x: 70, y: 24, w: 22, h: 16, rot: 0 },
  ];
  let out = '<g transform="translate(0 44) scale(1.12)"><g filter="url(#su-soft)">';
  leaves.forEach((L) => {
    out += '<g transform="rotate(' + L.rot + ' ' + L.x + ' ' + L.y + ')">' +
      '<ellipse cx="' + L.x + '" cy="' + (L.y - L.h * 0.52) + '" rx="' + (L.w * 0.5) + '" ry="' + (L.h * 0.5) + '" fill="url(#' + uid + '-leaf)"/>' +
      '<ellipse cx="' + (L.x - L.w * 0.14) + '" cy="' + (L.y - L.h * 0.66) + '" rx="' + (L.w * 0.26) + '" ry="' + (L.h * 0.24) + '" fill="' + c.light + '" opacity="0.55"/>' +
      '</g>';
  });
  out += '</g>';
  /* 露珠(发光小水珠) */
  const dews = [[52, 54, 3.0], [72, 68, 2.4], [88, 56, 2.6], [62, 82, 2.2], [78, 44, 2.0]];
  dews.forEach((d) => {
    out += '<g filter="url(#su-glow)">' +
      '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="' + d[2] + '" fill="#ffffff" opacity="0.85"/>' +
      '</g>' +
      '<circle cx="' + (d[0] - d[2] * 0.32) + '" cy="' + (d[1] - d[2] * 0.32) + '" r="' + (d[2] * 0.4) + '" fill="#ffffff" opacity="0.95"/>';
  });
  out += '</g>';
  return out;
}

/* v535: 白牡丹 —— 莲花座勺形叶, 白绿渐变 + 羽化粉尖晕(绿粉融合无硬边) */
function renderLotusSucculent(c, uid) {
  function leafPath(len, w) {
    return 'M0 0 C ' + (-w) + ' ' + (-len * 0.3) + ' ' + (-w * 0.82) + ' ' + (-len * 0.82) + ' 0 ' + (-len) +
      ' C ' + (w * 0.82) + ' ' + (-len * 0.82) + ' ' + w + ' ' + (-len * 0.3) + ' 0 0 Z';
  }
  const layers = [
    { n: 8, a0: 22.5, len: 44, w: 12 },
    { n: 6, a0: 0,   len: 35, w: 10 },
    { n: 5, a0: 36,  len: 27, w: 8 },
    { n: 3, a0: 0,   len: 20, w: 6.5 },
  ];
  let out = '<g transform="translate(0 18) scale(1.08)"><g transform="translate(70 102) scale(1 0.82)">';
  layers.forEach((L) => {
    for (let i = 0; i < L.n; i++) {
      const az = L.a0 + i * (360 / L.n);
      out += '<g transform="rotate(' + az + ')">' +
        '<path d="' + leafPath(L.len, L.w) + '" fill="url(#' + uid + '-lotus)"/>' +
        '<ellipse cx="0" cy="' + (-L.len * 0.88) + '" rx="' + (L.w * 0.6) + '" ry="' + (L.len * 0.15) + '" fill="url(#' + uid + '-tip)"/>' +
        '</g>';
    }
  });
  /* 中心心葉 */
  out += '<ellipse cx="0" cy="-4" rx="5.5" ry="9" fill="' + c.light + '"/>' +
         '<ellipse cx="0" cy="-8" rx="3.5" ry="5.5" fill="#ffffff" opacity="0.8"/>';
  out += '</g></g>';
  return out;
}

/* ---------- 渲染植物(v560: 透明底莲花, 用户亲抠图已去白底) ---------- */
const PLANT_IMG_URL = 'plants/magic-lotus.webp?v=560';
function renderPlant(p) {
  const wrap = document.getElementById('petPlant');
  if (!wrap) return;
  /* v559: 学主页瓶子画风 —— 莲花 + 柔光晕 + 四周四角星魔法(用户亲抠图) */
  wrap.innerHTML =
    '<img class="lotus-img" src="' + PLANT_IMG_URL + '" alt="魔法莲花" ' +
         'onerror="this.onerror=null;this.src=\'plants/magic-lotus-600.png?v=560\'" ' +
         'draggable="false" />' +
    '<svg class="lotus-magic" viewBox="0 0 240 260" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="lotusAura" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0" stop-color="#F5D992" stop-opacity="0.42"/>' +
          '<stop offset="0.45" stop-color="#E4C8F0" stop-opacity="0.20"/>' +
          '<stop offset="1" stop-color="#E4C8F0" stop-opacity="0"/>' +
        '</radialGradient>' +
      '</defs>' +
      // 柔光晕(底,呼吸脉动)
      '<ellipse class="lotus-halo" cx="120" cy="128" rx="100" ry="108" fill="url(#lotusAura)"/>' +
      // 四周四角星(学主页瓶子)
      '<g class="sparkles">' +
        '<g transform="translate(28 38) scale(0.72)"><path class="sparkle sp1" d="M0 -10 C1.2 -3.5,3.5 -1.2,10 0 C3.5 1.2,1.2 3.5,0 10 C-1.2 3.5,-3.5 1.2,-10 0 C-3.5 -1.2,-1.2 -3.5,0 -10 Z" fill="#F5D992"/></g>' +
        '<g transform="translate(212 30) scale(0.85)"><path class="sparkle sp2" d="M0 -10 C1.2 -3.5,3.5 -1.2,10 0 C3.5 1.2,1.2 3.5,0 10 C-1.2 3.5,-3.5 1.2,-10 0 C-3.5 -1.2,-1.2 -3.5,0 -10 Z" fill="#FFFFFF"/></g>' +
        '<g transform="translate(218 152) scale(0.95)"><path class="sparkle sp3" d="M0 -10 C1.2 -3.5,3.5 -1.2,10 0 C3.5 1.2,1.2 3.5,0 10 C-1.2 3.5,-3.5 1.2,-10 0 C-3.5 -1.2,-1.2 -3.5,0 -10 Z" fill="#E4C8F0"/></g>' +
        '<g transform="translate(22 168) scale(0.78)"><path class="sparkle sp4" d="M0 -10 C1.2 -3.5,3.5 -1.2,10 0 C3.5 1.2,1.2 3.5,0 10 C-1.2 3.5,-3.5 1.2,-10 0 C-3.5 -1.2,-1.2 -3.5,0 -10 Z" fill="#BFEFEA"/></g>' +
        '<g transform="translate(118 14) scale(0.58)"><path class="sparkle sp5" d="M0 -10 C1.2 -3.5,3.5 -1.2,10 0 C3.5 1.2,1.2 3.5,0 10 C-1.2 3.5,-3.5 1.2,-10 0 C-3.5 -1.2,-1.2 -3.5,0 -10 Z" fill="#F5D992"/></g>' +
        '<g transform="translate(212 212) scale(0.7)"><path class="sparkle sp6" d="M0 -10 C1.2 -3.5,3.5 -1.2,10 0 C3.5 1.2,1.2 3.5,0 10 C-1.2 3.5,-3.5 1.2,-10 0 C-3.5 -1.2,-1.2 -3.5,0 -10 Z" fill="#FFFFFF"/></g>' +
        '<g transform="translate(30 224) scale(0.65)"><path class="sparkle sp7" d="M0 -10 C1.2 -3.5,3.5 -1.2,10 0 C3.5 1.2,1.2 3.5,0 10 C-1.2 3.5,-3.5 1.2,-10 0 C-3.5 -1.2,-1.2 -3.5,0 -10 Z" fill="#F5D992"/></g>' +
        '<g transform="translate(120 246) scale(0.5)"><path class="sparkle sp8" d="M0 -10 C1.2 -3.5,3.5 -1.2,10 0 C3.5 1.2,1.2 3.5,0 10 C-1.2 3.5,-3.5 1.2,-10 0 C-3.5 -1.2,-1.2 -3.5,0 -10 Z" fill="#BFEFEA"/></g>' +
      '</g>' +
    '</svg>';
  /* 保留 plantTypeOf 以兼容老数据(无副作用) */
  void p;
}

/* ---------- 渲染食物柜 ---------- */

/* ---------- 渲染食物柜 ---------- */
function renderCookbook(p) {
  const grid = document.getElementById('cookbookGrid');
  if (!grid) return;
  const unlockedSet = new Set(p.unlocked || []);
  grid.innerHTML = PET_RECIPES.map(r => {
    const ok = unlockedSet.has(r.name);
    return '<div class="cb-card ' + (ok ? 'unlocked' : '') + '">' +
      '<span class="cb-card-emoji">' + (r.svg || r.emoji) + '</span>' +
      '<span class="cb-card-name">' + (ok ? r.name : '???') + '</span>' +
    '</div>';
  }).join('');
  const cnt = document.getElementById('cookbookCount');
  if (cnt) cnt.textContent = '已解锁 ' + (p.unlocked || []).length + ' / ' + PET_RECIPES.length + ' 道';
}

/* ---------- 渲染宠物主页 ---------- */
function renderPetHome() {
  const p = loadPet();
  refreshPetGlobal();
  const pick = document.getElementById('petPickWrap');
  const home = document.getElementById('petHome');
  if (!p.type) {
    pick.hidden = false;
    home.hidden = true;
    return;
  }
  pick.hidden = true;
  home.hidden = false;

  renderPetCreature(p);
  document.getElementById('petNameShow').textContent = p.name;
  document.getElementById('petMagicShow').textContent = p.magic;
  renderPlant(p);
  renderCookbook(p);
  // 开场问候（仅首次进入宠物主页）
  if (!petGreeted) {
    petGreeted = true;
    setTimeout(() => petSay(pickTalk('greet', p), 3400), 1500);
  }

  // 浇水按钮状态
  const wBtn = document.getElementById('petWaterBtn');
  const wTip = document.getElementById('potTip');
  const watered = p.lastWaterDate === petToday();
  if (watered) {
    wBtn.classList.add('disabled');
    wBtn.querySelector('.pa-emoji').textContent = '✓';
    wBtn.querySelector('.pa-text').textContent = '今日已浇';
    if (wTip) wTip.textContent = '明天再来浇水哦～';
  } else {
    wBtn.classList.remove('disabled');
    wBtn.querySelector('.pa-emoji').textContent = '💧';
    wBtn.querySelector('.pa-text').textContent = '浇水';
    if (wTip) wTip.textContent = '今天还没浇过，+10 魔力值';
  }
}

/* ---------- 喂食：当前锅里食材 ---------- */
let feedIngs = [];   // 选中的食材 id 数组

function openFeedModal() {
  feedIngs = [];
  const overlay = document.getElementById('petFeedOverlay');
  const grid = document.getElementById('pfIngs');
  grid.innerHTML = PET_INGS.map(i =>
    '<button class="pfi-chip" data-id="' + i.id + '" type="button">' +
      '<span class="pfi-emoji">' + i.emoji + '</span>' +
      '<span>' + i.name + '</span>' +
    '</button>'
  ).join('');
  grid.querySelectorAll('.pfi-chip').forEach(c => {
    c.addEventListener('click', () => toggleIng(c.dataset.id));
  });
  refreshPan();
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFeedModal() {
  document.getElementById('petFeedOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleIng(id) {
  if (feedIngs.includes(id)) {
    feedIngs = feedIngs.filter(x => x !== id);
  } else {
    if (feedIngs.length >= 2) return;  // 最多 2 个
    feedIngs.push(id);
  }
  refreshPan();
}

function refreshPan() {
  const pan = document.getElementById('pfPan');
  const empty = document.getElementById('pfPanEmpty');
  if (feedIngs.length === 0) {
    pan.innerHTML = '<span class="pf-pan-empty" id="pfPanEmpty">点食材入锅（最多 2 种）</span>';
  } else {
    pan.innerHTML = feedIngs.map(id => {
      const ing = PET_INGS.find(i => i.id === id);
      return '<div class="pf-pan-ing" data-id="' + id + '" title="点击移除">' + ing.emoji + '</div>';
    }).join('');
    pan.querySelectorAll('.pf-pan-ing').forEach(el => {
      el.addEventListener('click', () => toggleIng(el.dataset.id));
    });
  }
  // 食材 chip 高亮
  document.querySelectorAll('.pfi-chip').forEach(c => {
    c.classList.toggle('selected', feedIngs.includes(c.dataset.id));
  });
  // 烹饪按钮
  const cookBtn = document.getElementById('pfCookBtn');
  cookBtn.disabled = feedIngs.length < 2;
}

function cookDish() {
  if (feedIngs.length < 2) return;
  const recipe = findRecipe(feedIngs[0], feedIngs[1]);
  if (recipe) {
    // 成功: 解锁菜谱
    const p = loadPet();
    if (!p.unlocked) p.unlocked = [];
    if (!p.unlocked.includes(recipe.name)) p.unlocked.push(recipe.name);
    if (!savePet(p)) return;
    refreshPetGlobal();
    showCookResult(recipe, false);
    petSay(pickTalk('fed', p), 3000);
  } else {
    // 黑暗料理
    showCookResult(null, true);
    petSay(pickTalk('dark', loadPet()), 3000);
  }
  closeFeedModal();
}

function showCookResult(recipe, isDark) {
  const modal = document.getElementById('petCookModal') || document.querySelector('.pet-cook-modal');
  const art = document.getElementById('pcmArt');
  const title = document.getElementById('pcmTitle');
  const desc = document.getElementById('pcmDesc');
  if (isDark) {
    modal.classList.add('dark');
    art.textContent = '🤢';
    title.textContent = '黑暗料理！';
    desc.textContent = '小宠闻了闻，皱着眉头躲开了：「这个……这个真的不能吃啦！」';
  } else {
    modal.classList.remove('dark');
    if (recipe.svg) art.innerHTML = recipe.svg; else art.textContent = recipe.emoji;
    title.textContent = '成功做出「' + recipe.name + '」';
    desc.textContent = recipe.desc;
  }
  document.getElementById('petCookOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  // 关闭后刷新主页
  document.getElementById('pcmOk').onclick = () => {
    document.getElementById('petCookOverlay').classList.remove('open');
    document.body.style.overflow = '';
    renderPetHome();
  };
}

/* ---------- 浇水 ---------- */
function waterPlant() {
  const p = loadPet();
  if (p.lastWaterDate === petToday()) {
    toast('今天已经浇过啦，明天再来哦');
    return;
  }
  p.lastWaterDate = petToday();
  p.magic = (p.magic || 0) + 10;
  if (!savePet(p)) return;
  refreshPetGlobal();
  toast('💧 浇水成功，+10 魔力值');
  petSay(pickTalk('watered', p), 3000);
  renderPetHome();
}

/* ---------- 选择流程 ---------- */
let petPickingType = null;
function startPickPet(type) {
  petPickingType = type;
  const art = document.getElementById('pnmArt');
  art.innerHTML = '<div class="pnm-art-inner">' + PET_SVG[type] + '</div>';
  const input = document.getElementById('petNameInput');
  input.value = '';
  document.getElementById('petNameOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => input.focus(), 100);
}

function cancelPickPet() {
  petPickingType = null;
  document.getElementById('petNameOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function confirmPetName() {
  if (!petPickingType) return;
  const name = document.getElementById('petNameInput').value.trim();
  if (!name) { toast('给它起个名字吧～'); return; }
  if (name.length > 10) { toast('最多 10 个字哦'); return; }
  const p = loadPet();
  p.type = petPickingType;
  p.name = name;
  // plantColor 已在 default 随机选好, 首次选宠保持随机
  if (!savePet(p)) return;
  refreshPetGlobal();
  petPickingType = null;
  document.getElementById('petNameOverlay').classList.remove('open');
  document.body.style.overflow = '';
  toast('🎀 「' + name + '」加入你的疗愈之旅啦');
  renderPetHome();
  // 滚回顶部, 让用户看到新宠物 + 问候气泡(mobile 浏览器 focus input 会自动滚动, 命名后需复位)
  setTimeout(() => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {} }, 60);
}

/* 重新挑选：回到选宠页（保留魔力值/菜谱, 仅换伙伴） */
function repickPet() {
  const pick = document.getElementById('petPickWrap');
  const home = document.getElementById('petHome');
  pick.hidden = false;
  home.hidden = true;
  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
}

/* ---------- bindPets: 事件绑定 ---------- */
function bindPets() {
  // 选择卡片
  const rabbitBox = document.getElementById('petPickRabbitBox');
  const bearBox = document.getElementById('petPickBearBox');
  if (rabbitBox) rabbitBox.innerHTML = PET_SVG.rabbit;
  if (bearBox) bearBox.innerHTML = PET_SVG.bear;
  document.querySelectorAll('.pet-pick-card').forEach(card => {
    card.addEventListener('click', () => startPickPet(card.dataset.pet));
  });
  // 命名弹窗
  document.getElementById('petNameCancel').addEventListener('click', cancelPickPet);
  document.getElementById('petNameOk').addEventListener('click', confirmPetName);
  document.getElementById('petNameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmPetName();
  });
  // 浇水 / 喂食
  document.getElementById('petWaterBtn').addEventListener('click', waterPlant);
  document.getElementById('petFeedBtn').addEventListener('click', openFeedModal);
  document.getElementById('petRepickBtn').addEventListener('click', repickPet);
  document.getElementById('petFeedClose').addEventListener('click', closeFeedModal);
  document.getElementById('pfCookBtn').addEventListener('click', cookDish);
  // 点击宠物 → 说话
  document.getElementById('petAvatar').addEventListener('click', () => {
    const p = loadPet();
    if (p.type) petSay(pickTalk('touch', p), 3000);
  });
  // 弹窗外点击关闭
  document.getElementById('petFeedOverlay').addEventListener('click', e => {
    if (e.target.id === 'petFeedOverlay') closeFeedModal();
  });
  document.getElementById('petNameOverlay').addEventListener('click', e => {
    if (e.target.id === 'petNameOverlay') cancelPickPet();
  });
  document.getElementById('petCookOverlay').addEventListener('click', e => {
    if (e.target.id === 'petCookOverlay') {
      e.target.classList.remove('open');
      document.body.style.overflow = '';
      renderPetHome();
    }
  });
  // 首次渲染
  renderPetHome();
}

/* ---------- 与精油购买打通：魔力值抵扣（绑定到结算弹窗） ---------- */
function refreshMagicRow(s) {
  const row = document.getElementById('coMagicRow');
  const sub = document.getElementById('coMagicSub');
  if (!row) return;
  if (s.magicAvailable) {
    row.hidden = false;
    if (sub) {
      const p = loadPet();
      sub.textContent = '当前魔力 ' + p.magic + (state.useMagic ? '（使用后将剩 ' + (p.magic - 100) + '）' : '（开启即扣 100）');
    }
  } else {
    row.hidden = true;
    state.useMagic = false;
    const chk = document.getElementById('coMagicChk');
    if (chk) chk.checked = false;
  }
}
