/* ============================================
   MUSIC AROMA — 交互脚本
   ============================================ */

/* ---------- 版本号（缓存击穿用，修改音频资源后必须递增）---------- */
const AUDIO_VERSION = '752' /* v752: 七宠宝宝版+成长系统 —— 领养即宝宝(chibi 小小一只), 浇水/成功喂饭每天记 1 天喂养, 攒满 10 天长成成体; 老档宠物视为已成年 */

/* v631: 全站清零重启 —— 每台设备第一次加载本版本时, 清掉本地旧账号与云端登录会话 */
const MA_WIPE_FLAG = 'ma_wiped_v631';
(function wipeAccountsOnce() {
  try {
    if (localStorage.getItem(MA_WIPE_FLAG) === '1') return;
    const kill = ['ma_user', 'ma_device', 'ma_orders', 'ma_uuid', 'ma_unread_dm', 'ma_unread_group',
                  'ma_group_nick', 'ma_group_conv', 'ma_friend_code', 'ma_friend_meta',
                  'ma_friend_settings', 'ma_ann_state', 'ma_notice_state', 'ma_chat'];
    Object.keys(localStorage).forEach(k => {
      if (/^sb-/.test(k) || k.indexOf('supabase') >= 0 || kill.indexOf(k) >= 0) {
        try { localStorage.removeItem(k); } catch (e) {}
      }
    });
    localStorage.setItem(MA_WIPE_FLAG, '1');
  } catch (e) {}
})();

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
      [120,  '闭眼,感受颂钵的余韵。'],
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
  initDmUnread();     // v36.6: 恢复私聊未读红点 + 已注册设备静默订阅(全站可收提示)
  bindSupport();
  bindWishJar();          // v674: 星星许愿瓶(社区新玩法)
  enableBdayTouchPicker();   // v645: 触屏生日三栏滚轮(桌面保持原生 date)
  preloadCustomAudio();   // 空闲时把上传过的音频提前解码进内存
  preloadHealAudio();     // v597: 预加载疗愈音乐/人声 → Blob URL 本地播放(根治服务器无 Range 的跳回/重播)
  preloadRealPreviews(); // v602/v605: 安眠夜曲/晨光苏醒试听用用户提供的真实文件(替换原 Web Audio 合成)
  preloadCmBgAudio();   // v616: 社区背景音整段拉成 Blob, 根治服务器无 Range 导致的流式断流截断
  loadBowlAudio();        // 预载水晶钵 wav, 开头「注入灵感」变身音效(v49 保持不变)
  loadHarpAudio();        // v49: 预载竖琴 wav, 魔法卡片「点击开启」按钮用
  applyTheme(state.prefs.theme, state.prefs.customAccent, state.prefs.customBg);
  applyFonts();           // v35: 字体自定义
  captureBottleDefaults(); // v35: 魔法瓶渐变原色快照(必须在应用自定义色之前)
  restoreBottleColors();  // v35: 应用保存过的魔法瓶颜色
  // v633: 已登录的设备打开页面 → 登记新会话(顶掉其它设备上的同账号)
  setTimeout(() => { try { cloudSyncAccount(); } catch (e) {} }, 1500);
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

/* v658: 全站登录门禁 —— 只有这三个页面游客能看; 其他功能未登录一律先跳「我的」登录 */
const LOGIN_FREE_VIEWS = ['home', 'about', 'account'];

function showView(id) {
  // v658: 未登录访问功能页 → 记住想去的地方, 跳登录, 登完自动带回去
  if (LOGIN_FREE_VIEWS.indexOf(id) === -1 && !currentUser()) {
    try { sessionStorage.setItem('ma_pending_view', id); } catch (e) {}
    toast('这个功能要先登录账号才能用哦, 登完马上带你去 ✦');
    id = 'account';
  }
  const prev = state.currentView;
  state.currentView = id;
  document.querySelectorAll('.view').forEach(v =>
    v.classList.toggle('active', v.id === id));
  document.querySelectorAll('.nav-link').forEach(l =>
    l.classList.toggle('active', l.getAttribute('href') === '#' + id));
  /* v727: 每个页面开的弹层只属于那个页面 —— 游戏卡片/许愿瓶/方案详情这类全局
     fixed 层不跟页面走, 切到别的页面自动收掉, 不再留着让用户手动关 */
  /* v731: 原来写的是 `if (prev && prev !== id)` —— 首次进入时 prev 为空串会整段跳过,
     结果"从没切过页面就打开瓶子"的场景下切页收不掉瓶子, 歌/语音继续响。
     现在只要不是同一个页面就收, 并且不只看 class, 还看 wish.open 之类的真实状态 */
  if (prev !== id) {
    const sweep = (elId, closer, alsoOpen) => {
      const el = document.getElementById(elId);
      const isOpen = (el && el.classList.contains('open')) || (alsoOpen && alsoOpen());
      if (isOpen) { try { closer(); } catch (e) {} }
    };
    sweep('gameOverlay', closeGame);                 // games: 游戏卡片
    sweep('pcOverlay', closeProfileCard);            // community: 个人名片
    sweep('cmPrefOverlay', () => {
      const ov = document.getElementById('cmPrefOverlay');
      if (ov) { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); }
    });                                              // community: 偏好设置
    sweep('pdOverlay', closePlanDetail);             // shop: 方案详情
    sweep('odOverlay', closeOrderDetail);            // account: 订单详情
    sweep('checkoutOverlay', () => {
      const ov = document.getElementById('checkoutOverlay');
      if (ov) { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); }
      document.body.style.overflow = '';
    });                                              // shop: 结算弹窗
    try { const um = document.getElementById('unlockMask'); if (um) um.remove(); } catch (e) {}   // games: 解锁弹窗(动态创建)
  }
  // 滚到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // v728: 进游戏页就把音效采样预解码(约 800KB), 玩起来第一次按也不等网络
  if (id === 'games') prewarmGameSfx();
  /* v732: 星星瓶已经是独立页面(#wish) —— 进入时初始化瓶子, 离开时把它的音频
     (幸运星歌/纸条语音/背景压低)一次性收干净, 不再靠"切页面扫弹层"兜底 */
  if (prev === 'wish' && id !== 'wish') { try { closeWish(true); } catch (e) {} }
  if (id === 'wish') { try { openWish(); } catch (e) {} }
  // 疗愈社区: 进入时连云端, 离开时断开实时订阅
  if (id === 'community') enterCommunity();
  else if (prev === 'community') leaveCommunity();
  // v612: 疗愈社区专属循环背景音 —— 像音乐播放器一样: 仅在社区页面播放, 离开暂停, 不做任何额外处理
  const cmAudio = document.getElementById('cmBgAudio');
  if (cmAudio) {
    if (id === 'community') {
      cmAudio.volume = 0.55;   // 偏背景音量, 不抢戏
      audioUnseal(cmAudio);    // v730: 重新进社区 → 解封, 允许被系统打断后续播
      cmAudio.play().catch(() => {});   // autoplay policy 静默吞掉失败
    } else {
      /* v731: 原来是 else if (prev === 'community') —— prev 为空时(首次进入/直接深层链接)
         会漏掉这个分支, 社区背景音就跟着人走到别的页面去了。只要不是社区页就停 */
      audioSeal(cmAudio);      // v730: 离开社区 = 主动停 → 打封条, 之后任何复苏都不许把它拉回来
      if (!cmAudio.paused) cmAudio.pause();
      // 不重置 currentTime —— 下次回来从原位置继续
    }
  }
  // v52.3: 进设置页时刷新群主工具显隐(登录状态可能在页面加载后才变化)
  if (id === 'settings') { try { bindAdminCleanup(); } catch (_) {} }
  if (id === 'pets') { try { renderPetHome(); } catch (_) {} }   // v637: 进宠物页刷新登录门禁
  // v47: 离开疗愈之旅页时, 停掉魔法瓶里的环境音
  // v737: 环境音之外, 疗愈音乐+人声也不许串页(用户报: 疗愈之旅串到星星瓶) —— 静默停, 不弹 toast
  if (prev === 'healing' && id !== 'healing') {
    stopHealWeather(true);
    stopHealing(true);
  }
  // v737: ASMR 循环同样只属于 ASMR 页, 离开就停(不许串到星星瓶等其它页面)
  if (prev === 'asmr' && id !== 'asmr') { try { stopAllAsmr(); } catch (e) {} }
}

/* ---------- 小目录 (v34: 悬浮左下角抽屉, 全站翻页入口) ---------- */
const PAGE_LABELS = {
  home: '首页', shop: '购买方案', healing: '疗愈之旅', games: '解压游戏',
  asmr: 'ASMR 助眠音', account: '用户中心', community: '疗愈社区',
  wish: '星星瓶', pets: '疗愈小宠', settings: '设置', about: '关于网站'
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
/* v740: 用户中心排到设置前面(与顶部导航一致) */
const PAGE_ORDER = ['home', 'shop', 'healing', 'games', 'asmr', 'community', 'wish', 'pets', 'account', 'settings', 'about'];

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
    music: { title: '禅意颂钵 + 水滴声', len: '完整版 15 分钟', desc: '偶尔一声颂钵、一滴水，房间安静得能听见自己。' },
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

let _pdPreview = null;   /* { nodes, timer, stop, audio }  window._pdPreview 供测试 */

/* v602/v605: 部分方案试听走用户提供的真实音频文件 —— 沿用 v597 Blob URL 模式,根治服务器无 Range 时 audio 流式播放问题
   key = 方案 data-plan; value = 音频文件名。没进这张表的方案继续用 Web Audio 合成 */
const REAL_PREVIEW = {
  sleep:  'heal-preview-sleep.mp3',   /* v605: 安眠夜曲 */
  release: 'heal-preview-release.mp3', /* v607: 释怀微风 */
  revive: 'heal-preview-revive.mp3',  /* v602: 晨光苏醒 */
  calm:   'heal-preview-calm.mp3',    /* v618: 午后禅茶 */
};
const _previewBlobs = {};
function preloadRealPreviews() {
  Object.keys(REAL_PREVIEW).forEach(k => {
    fetch(REAL_PREVIEW[k] + '?v=' + AUDIO_VERSION)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(b => { _previewBlobs[k] = URL.createObjectURL(b); })
      .catch(() => { /* 预加载失败不阻塞 —— 播放时回退普通 URL */ });
  });
}
function realPreviewSrc(k) {
  return _previewBlobs[k] || (REAL_PREVIEW[k] + '?v=' + AUDIO_VERSION);
}

/* v616: 社区背景音也走 fetch+Blob 预加载 —— 服务器无 Range 支持, <audio> 直连 src 流式播放时
   网络一抖缓冲断流, 声音就会半路停(用户反馈"刚才好了现在又截断"的根因)。
   开页就把整个 mp3 拉成本地 Blob, 之后播放/循环都在本地, 彻底根治。
   只换传输方式, 音频数据零处理(不裁剪/不淡入淡出/不增益)。 */
let _cmBgBlob = null;
function preloadCmBgAudio() {
  const el = document.getElementById('cmBgAudio');
  if (!el) return;
  fetch('long.mp3?v=' + AUDIO_VERSION)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
    .then(b => {
      const t = el.currentTime, wasPlaying = !el.paused && !el.ended;
      _cmBgBlob = URL.createObjectURL(b);
      el.src = _cmBgBlob;
      el.loop = true;                       // 像 music player 一样原生循环
      if (wasPlaying) { try { el.currentTime = t; } catch (e) {} el.play().catch(() => {}); }
    })
    .catch(() => { /* 预加载失败 → 继续用 html 里的直连 src 流式播放, 行为与旧版一致 */ });
}

function stopPlanPreview() {
  if (!_pdPreview) return;
  clearTimeout(_pdPreview.timer);
  try { _pdPreview.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); } catch (e) {}
  try { _pdPreview.master.gain.cancelScheduledValues(_pdPreview.master.context.currentTime);
        _pdPreview.master.gain.setValueAtTime(0.0001, _pdPreview.master.context.currentTime); } catch (e) {}
  /* v602/v605: 真实文件试听需停止 audio 元素 */
  if (_pdPreview.audio) {
    audioSeal(_pdPreview.audio);   // v730: 关掉试听就封死, 不许 audioWake 再把它接回来
    try { _pdPreview.audio.pause(); _pdPreview.audio.currentTime = 0; } catch (e) {}
  }
  _pdPreview = null;
  window._pdPreview = null;
}

function startPlanPreview(kind) {
  stopPlanPreview();

  /* v602/v605: 安眠夜曲/晨光苏醒试听改走用户提供的真实文件,其余方案仍用 Web Audio 合成 */
  if (REAL_PREVIEW[kind]) {
    const audio = new Audio(realPreviewSrc(kind));
    audio.volume = 0.9;
    audio.preload = 'auto';
    const timer = setTimeout(() => {
      stopPlanPreview();
      const btn = document.getElementById('pdPlay');
      if (btn) { btn.classList.remove('playing'); btn.textContent = '▶ 试听 30 秒'; }
      const prog = document.getElementById('pdProg');
      if (prog) { prog.style.transition = 'none'; prog.style.width = '0%'; }
    }, 30500);
    _pdPreview = { nodes: [], timer, audio, kind };
    window._pdPreview = _pdPreview;
    audio.play().catch(e => { console.warn(kind + ' preview play failed:', e); });
    return _pdPreview;
  }

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

/* ---------- v732: 幸运星 = 当天立减 ¥10 + 神秘小礼物（不再永久、不再按瓶数） ----------
   规则(用户钦定):
   · 抽中当天有效, 隔天作废;
   · 大彩虹幸运星每天只会被抽到一次;
   · v736: 满 2 件立减一直有效(独立计算); 幸运星与 100 魔力值二选一不可叠加, 幸运星优先;
   · 幸运星立减每天只能使用一次。 */
function bjDateStr(d) {   // 北京时间(UTC+8) 的 YYYY-MM-DD —— "今天"一律按北京时间算
  const u = new Date((d ? d.getTime() : Date.now()) + 8 * 3600 * 1000);
  return u.getUTCFullYear() + '-' + String(u.getUTCMonth() + 1).padStart(2, '0') + '-' + String(u.getUTCDate()).padStart(2, '0');
}
function luckyDayCached() {   // 本地记下"抽中那天", 用来判断是否还在当天
  try { return localStorage.getItem('ma_lucky_day') || ''; } catch (e) { return ''; }
}
function luckyWonToday() { return luckyDayCached() === bjDateStr(); }
function off10UsedToday() {   // 今天是否已经用过任意一次「立减 ¥10」
  try { return localStorage.getItem('ma_off10_used') === bjDateStr(); } catch (e) { return false; }
}
function luckyActive() { return luckyWonToday() && !off10UsedToday(); }
function markOff10Used() {    // 真下单成功时调用(预售阶段不会触发)
  try { localStorage.setItem('ma_off10_used', bjDateStr()); } catch (e) {}
}
function luckySetDay(day) {   // 云端确认真实中奖日期后回写本地
  try {
    if (day) localStorage.setItem('ma_lucky_day', day);
    else localStorage.removeItem('ma_lucky_day');
  } catch (e) {}
}
function luckyClearDay() { try { localStorage.removeItem('ma_lucky_day'); } catch (e) {} }

/* 购物车汇总：件数、原价合计、满2件立减10、幸运星立减、魔力值抵扣、应付金额
   v736: 规则改(用户钦定 11-10) —— 满 2 件立减一直有效(独立计算, 可与下面二选一同时生效);
   幸运星 与 100 魔力值 二选一不可叠加, 幸运星优先(星星只有当天有效, 先用星星) */
function cartSummary() {
  let count = 0, sum = 0;
  Object.entries(state.cart).forEach(([k, v]) => {
    const meta = PLAN_META[k];
    if (!meta || v <= 0) return;
    count += v;
    sum += meta.price * v;
  });
  const wonToday = luckyWonToday();
  const usedToday = off10UsedToday();
  const lucky = (wonToday && !usedToday) ? 10 : 0;                 // 当天有效, 用过即失效
  const bulk = (count >= 2) ? 10 : 0;                              // v736: 满 2 件一直在, 不被幸运星挤掉
  // v52: 魔力值抵扣 — 100 魔力可减 ¥10；v736: 与幸运星二选一(幸运星优先), 与满 2 件立减可叠加
  // v703: rosa 测试特权 —— 魔力值视为无限
  const owner = isOwnerUser();
  const pp = loadPet();
  const magicAvailable = (owner || pp.magic >= 100) && !lucky;
  const magic = (magicAvailable && state.useMagic) ? 10 : 0;
  return {
    count, sum,
    discount: bulk, lucky, magic, magicAvailable,
    wonToday, usedToday,
    total: sum - bulk - magic - lucky
  };
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

    /* v732: 幸运星 —— 下单页一眼看到标志 + 当天立减行 + 神秘小礼物行 */
    paintLuckyUI(s);
    // 云端复核"今天到底有没有抽中"(换设备 / 清缓存 / 昨天中的都会在这里纠正)
    // v732: 必须真的有云端身份(cm.uid)才信云端 —— 否则 auth.uid() 为 null 的 RPC
    //       一律返回"没中过", 会把本机刚抽中的标记误清掉
    if (sbReady() && currentUser() && cm.uid) {
      sb.rpc('ma_wish_lucky_state').then(({ data }) => {
        if (!data) return;
        const known = data.me_won_today !== undefined && data.me_won_today !== null;
        if (known) luckySetDay(data.me_won_today ? (data.today || bjDateStr()) : '');
        else if (data.me_won === false) luckyClearDay();   // 老 SQL: 从没中过 → 直接清掉
        const s2 = cartSummary();
        paintLuckyUI(s2);
        document.getElementById('coTotal').textContent = '¥' + s2.total;
        refreshMagicRow(s2);
      }).catch(() => {});
    }

    // v52: 魔力值抵扣行(仅 magicAvailable 时显示)
    const mChk = document.getElementById('coMagicChk');
    if (mChk) mChk.checked = state.useMagic;
    refreshMagicRow(s);
    document.getElementById('coTotal').textContent = '¥' + s.total;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => nameEl.focus(), 150);
  }

  /* v732: 结算页里所有跟幸运星有关的东西只在这里刷新 */
  function paintLuckyUI(s) {
    const lRow = document.getElementById('coLuckyRow');
    if (lRow) {
      lRow.hidden = s.lucky === 0;
      if (s.lucky > 0) document.getElementById('coLucky').textContent = '-¥' + s.lucky;
    }
    const gRow = document.getElementById('coGiftRow');       // 神秘小礼物跟着立减一起出现
    if (gRow) gRow.hidden = s.lucky === 0;

    const badge = document.getElementById('coLuckyBadge');
    const sub = document.getElementById('coLuckyBadgeSub');
    if (badge) {
      const won = s.wonToday, used = s.usedToday;
      badge.hidden = !(won || used);
      badge.classList.toggle('is-used', !!(used && !s.lucky));
      if (sub) {
        sub.textContent = (used && !s.lucky)
          ? '今天的幸运星立减已经用掉了 · 明天再来抽一颗吧'
          : '本单立减 ¥10 · 随单赠送神秘小礼物';
      }
    }

    const note = document.getElementById('coStackNote');
    if (note) {
      let txt = '';
      /* v736: 提示语同步新规则 —— 满 2 件一直在, 幸运星/魔力值二选一且星星优先 */
      if (s.lucky > 0) txt = '本单已使用 🌟 幸运星立减 ¥10 —— 与魔力值抵扣不可同享（星星只有当天有效，先用星星）；满 2 件立减照常生效';
      else if (s.magic > 0) txt = '本单已使用 100 魔力值抵扣 ¥10 —— 与幸运星立减不可同享；满 2 件立减照常生效';
      else if (s.usedToday) txt = '今天的幸运星立减已经用掉了，明天再来抽一颗吧（满 2 件立减不受影响）';
      note.textContent = txt;
      note.hidden = !txt;
    }
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
      // v703: rosa 测试特权 —— 魔力无限, 不做余额校验
      if (mChk2.checked && !isOwnerUser() && pp.magic < 100) {
        mChk2.checked = false;
        toast('魔力值不足 100，还差 ' + (100 - pp.magic));
        return;
      }
      state.useMagic = mChk2.checked;
      const s2 = cartSummary();
      document.getElementById('coTotal').textContent = '¥' + s2.total;
      refreshMagicRow(s2);
      paintLuckyUI(s2);   // v732: 勾了魔力值 → 叠加提示跟着更新
    });
  }

  // v688: 预售阶段 —— 点「立即付款」只提示预售, 不下单不清购物车
  // TODO 接入真实支付后, 恢复原模拟付款流程(见 raw/ 备份或 git 历史 v687)
  payBtn.addEventListener('click', () => {
    toast('🛒 预售阶段，rosa还在努力，请耐心等待产品上市～ 产品还在购物车里等你哦');
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
  // v654: 观看说明视频按钮已移除; v657: 左侧步骤卡改为自由作画画板(startHealing 按钮随之移除, 右侧舞台入口保留)
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
  initFreeDraw();
}

/* ============================================
   v657: 疗愈之旅「自由作画」—— 丝滑发光画笔
   留痕模式: 每一步都留着, 可撤回/橡皮/清空
   激光笔模式: 只看当下, 轨迹跟着手走, 松手渐隐消失
   ============================================ */
function initFreeDraw() {
  const cv = document.getElementById('freeDraw');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const wrap = cv.parentElement;
  const persist = document.createElement('canvas');     // 留痕层(成品离屏)
  const pctx = persist.getContext('2d');
  const COLORS = ['#F27BA8', '#A88BE8', '#6FB6E8', '#7FBF7A', '#E8B84B', '#FFFFFF'];
  const LASER_LIFE = 640;                               // 激光轨迹存活 ms
  let color = COLORS[0];
  let mode = 'trace';             // trace=留痕 | laser=激光笔
  let eraser = false;
  const strokes = [];             // 撤回栈: {color,width,erase,pts:[{x,y}]}
  let cur = null;                 // 正在画的留痕笔
  let trail = [];                 // 激光轨迹 {x,y,t}
  let laserDown = false;
  let dpr = 1;

  function sizeCanvas() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    persist.width = cv.width; persist.height = cv.height;
    redrawPersist();
  }
  function redrawPersist() {
    pctx.clearRect(0, 0, persist.width, persist.height);
    for (const s of strokes) strokePath(pctx, s);
  }
  // 一笔 = 外辉光 + 主体 + 白芯 三层描(中点二次贝塞尔, 丝滑无折角)
  function strokePath(c2, s) {
    const P = s.pts;
    if (!P.length) return;
    c2.save();
    c2.scale(dpr, dpr);
    c2.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
    c2.lineCap = 'round'; c2.lineJoin = 'round';
    const build = () => {
      c2.beginPath();
      if (P.length < 3) {
        c2.moveTo(P[0].x, P[0].y);
        const q = P[1] || { x: P[0].x + 0.01, y: P[0].y };
        c2.lineTo(q.x, q.y);
      } else {
        c2.moveTo(P[0].x, P[0].y);
        for (let i = 1; i < P.length - 1; i++) {
          const mx = (P[i].x + P[i + 1].x) / 2, my = (P[i].y + P[i + 1].y) / 2;
          c2.quadraticCurveTo(P[i].x, P[i].y, mx, my);
        }
        c2.lineTo(P[P.length - 1].x, P[P.length - 1].y);
      }
    };
    if (s.erase) {
      build(); c2.strokeStyle = 'rgba(0,0,0,1)'; c2.lineWidth = s.width; c2.stroke();
    } else {
      build(); c2.strokeStyle = hexA(s.color, 0.32); c2.lineWidth = s.width * 2.1; c2.stroke();   // 外辉光
      build(); c2.strokeStyle = hexA(s.color, 0.95); c2.lineWidth = s.width; c2.stroke();          // 主体
      build(); c2.strokeStyle = 'rgba(255,255,255,0.8)'; c2.lineWidth = s.width * 0.38; c2.stroke(); // 白芯
    }
    c2.restore();
  }
  // 激光轨迹: 逐段渐隐(越老越细越淡) + 辉光
  function drawTrail() {
    const now = performance.now();
    trail = trail.filter(p => now - p.t < LASER_LIFE);
    if (trail.length < 2) {
      if (trail.length === 1) {   // 单点也亮一下
        const p = trail[0], al = 1 - (now - p.t) / LASER_LIFE;
        ctx.save(); ctx.scale(dpr, dpr);
        ctx.fillStyle = hexA(color, 0.9 * al);
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.2 * al + 1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      return;
    }
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i];
      const al = Math.max(0, 1 - (now - b.t) / LASER_LIFE);
      if (al <= 0.02) continue;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(a.x, a.y, mx, my);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = hexA(color, 0.28 * al); ctx.lineWidth = 13 * al + 2; ctx.stroke();  // 辉光
      ctx.strokeStyle = hexA(color, 0.95 * al); ctx.lineWidth = 5.5 * al + 1; ctx.stroke(); // 主体
      ctx.strokeStyle = 'rgba(255,255,255,' + 0.75 * al + ')'; ctx.lineWidth = 2.2 * al + 0.5; ctx.stroke(); // 白芯
    }
    ctx.restore();
  }
  function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(persist, 0, 0);
    if (mode === 'trace' && cur) strokePath(ctx, cur);
    if (mode === 'laser' || trail.length) drawTrail();
    requestAnimationFrame(loop);
  }
  function pos(e) {
    const r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  cv.addEventListener('pointerdown', e => {
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    const p = pos(e);
    if (mode === 'laser') { laserDown = true; trail.push({ x: p.x, y: p.y, t: performance.now() }); return; }
    cur = { color, width: eraser ? 26 : 5, erase: eraser, pts: [p] };
  });
  // v657: move/up 绑 window —— 划出画布不断笔, 也和游戏模块保持一致
  /* v745: 激光顺滑 —— ①getCoalescedEvents 取回浏览器合并掉的中间采样 ②快速挥动时长段细分成 ~4px 的小段(时间戳线性插值), 轨迹不再一截一截 */
  window.addEventListener('pointermove', e => {
    let evs;
    try { evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || []; } catch (err) { evs = []; }
    if (!evs.length) evs = [e];
    for (const ev of evs) {
      const p = pos(ev);
      if (mode === 'laser') {
        if (!laserDown) return;
        const lp = trail[trail.length - 1];
        const now = performance.now();
        if (!lp) { trail.push({ x: p.x, y: p.y, t: now }); continue; }
        const d = Math.hypot(p.x - lp.x, p.y - lp.y);
        if (d < 2.2) continue;                      // 太近不加点, 轨迹更顺
        const steps = Math.min(40, Math.ceil(d / 4));
        for (let i = 1; i <= steps; i++) {
          trail.push({ x: lp.x + (p.x - lp.x) * i / steps, y: lp.y + (p.y - lp.y) * i / steps,
                       t: lp.t + (now - lp.t) * i / steps });
        }
        continue;
      }
      if (!cur) continue;
      const lp2 = cur.pts[cur.pts.length - 1];
      if (Math.hypot(p.x - lp2.x, p.y - lp2.y) < 1.5) continue;
      cur.pts.push(p);
    }
  });
  const finish = () => {
    laserDown = false;
    if (cur) { strokes.push(cur); strokePath(pctx, cur); cur = null; }
  };
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);

  /* 工具条 */
  const modeT = document.getElementById('fdModeTrace');
  const modeL = document.getElementById('fdModeLaser');
  const btnUndo = document.getElementById('fdUndo');
  const btnEraser = document.getElementById('fdEraser');
  const btnClear = document.getElementById('fdClear');
  function setMode(m) {
    mode = m;
    modeT.classList.toggle('active', m === 'trace');
    modeL.classList.toggle('active', m === 'laser');
    // 激光笔不留痕, 撤回/橡皮/清空没意义
    [btnUndo, btnEraser, btnClear].forEach(b => { b.disabled = m === 'laser'; });
    if (m === 'laser') { eraser = false; btnEraser.classList.remove('active'); cv.style.cursor = 'pointer'; }
    else cv.style.cursor = 'crosshair';
  }
  modeT.addEventListener('click', () => setMode('trace'));
  modeL.addEventListener('click', () => setMode('laser'));
  btnUndo.addEventListener('click', () => { strokes.pop(); redrawPersist(); });
  btnClear.addEventListener('click', () => { strokes.length = 0; trail.length = 0; redrawPersist(); });
  btnEraser.addEventListener('click', () => {
    eraser = !eraser;
    btnEraser.classList.toggle('active', eraser);
    cv.style.cursor = eraser ? 'cell' : 'crosshair';
  });
  // 色板
  const colorsBox = document.getElementById('fdColors');
  COLORS.forEach((c, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'fd-dot' + (i === 0 ? ' active' : '');
    d.style.background = c;
    if (c === '#FFFFFF') d.classList.add('fd-white');
    d.addEventListener('click', () => {
      color = c;
      [...colorsBox.children].forEach(x => x.classList.remove('active'));
      d.classList.add('active');
    });
    colorsBox.appendChild(d);
  });

  // v749: 保存画作 / 打开展览柜
  const btnFdSave = document.getElementById('fdSave');
  const btnFdGallery = document.getElementById('fdGallery');
  if (btnFdSave) {
    btnFdSave.addEventListener('click', () => {
      if (!strokes.length) { toast('先画点什么呀 ✧'); return; }
      const tmp = document.createElement('canvas');
      tmp.width = persist.width; tmp.height = persist.height;
      const tc = tmp.getContext('2d');
      tc.fillStyle = '#FFFDF8';
      tc.fillRect(0, 0, tmp.width, tmp.height);
      tc.drawImage(persist, 0, 0);
      openArtSaveDialog('draw', artExportURL(tmp, 640));
    });
  }
  if (btnFdGallery) btnFdGallery.addEventListener('click', () => openGallery());

  // v659 修复: 页面加载时疗愈之旅视图 display:none → wrap 尺寸 0 → sizeCanvas 早退 →
  //            画布停在默认 300×150 被 CSS 拉伸 → 笔迹/激光/橡皮坐标全部错位。
  //            画板真正可见(或变尺寸)时重建画布
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(sizeCanvas).observe(wrap);
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();
  requestAnimationFrame(loop);
  // v657 测试钩子(headless 验证用, 不影响功能)
  window._fd = {
    get mode() { return mode; },
    get trailLen() { return trail.length; },
    get strokeCount() { return strokes.length; },
  };
}

/* ============================================
   v749 作品展览柜 —— 画作/陶艺/春联 保存 · 公开/私密 · 大家互相看
   ============================================ */
const GALLERY_KINDS = { draw: '🎨 画作', pottery: '🏺 陶艺', couplet: '🧧 春联窗花' };

/* 游戏画布 → 压缩 JPEG dataURL(最长边 640, 白纸底) */
function artExportURL(cvSrc, maxW, bg) {
  try {
    const scale = Math.min(1, (maxW || 640) / cvSrc.width);
    const o = document.createElement('canvas');
    o.width = Math.max(1, Math.round(cvSrc.width * scale));
    o.height = Math.max(1, Math.round(cvSrc.height * scale));
    const oc = o.getContext('2d');
    if (bg) { oc.fillStyle = bg; oc.fillRect(0, 0, o.width, o.height); }
    oc.drawImage(cvSrc, 0, 0, o.width, o.height);
    return o.toDataURL('image/jpeg', 0.82);
  } catch (e) { return null; }
}

function galleryCloudSave(kind, img, isPublic) {
  return new Promise(res => {
    try {
      if (!sbReady() || !cm.uid) { toast('先登录才能保存作品哦'); return res(false); }
      const u = currentUser();
      sb.from('ma_gallery').insert({
        kind, img, is_public: !!isPublic,
        author_name: (u && u.name) || '疗友',
      }).then(({ error }) => {
        if (error) { toast('保存失败了, 一会儿再试试'); res(false); }
        else res(true);
      }, () => { toast('网络不太好, 保存失败'); res(false); });
    } catch (e) { res(false); }
  });
}
function galleryCloudList(onlyMine) {
  return new Promise(res => {
    try {
      if (!sbReady() || !cm.uid) return res([]);
      let q = sb.from('ma_gallery').select('id,kind,img,is_public,author_name,likes,created_at')
        .order('created_at', { ascending: false }).limit(60);
      q = onlyMine ? q.eq('uid', cm.uid) : q.eq('is_public', true);
      q.then(({ data }) => res(data || []), () => res([]));
    } catch (e) { res([]); }
  });
}
function galleryCloudDelete(id) {
  try { sb.from('ma_gallery').delete().eq('id', id).then(() => {}, () => {}); } catch (e) {}
}
function galleryLike(id) {
  const liked = loadJSON('ma_gal_liked', []);
  if (liked.indexOf(id) !== -1) return false;
  liked.push(id); saveJSON('ma_gal_liked', liked.slice(-200));
  try { sb.rpc('ma_gallery_like', { p_id: id }).then(() => {}, () => {}); } catch (e) {}
  return true;
}

/* 保存弹窗: 选公开 / 私密 */
function openArtSaveDialog(kind, dataURL, onSaved) {
  if (!cm.uid) { toast('先登录才能保存作品哦'); showView('account'); return; }
  if (!dataURL) { toast('这个作品导不出来, 换一个试试'); return; }
  const ov = document.createElement('div');
  ov.className = 'art-overlay open';
  ov.innerHTML = `
    <div class="art-panel" role="dialog" aria-label="保存作品">
      <p class="art-title">保存${GALLERY_KINDS[kind] || '作品'}</p>
      <div class="art-preview"><img alt="作品预览" src="${dataURL}" /></div>
      <p class="art-sub">想让别人看到吗?</p>
      <div class="art-choices">
        <button type="button" class="art-chc" data-pub="1"><b>🌍 公开展出</b><span>放进展览柜, 大家都能看到</span></button>
        <button type="button" class="art-chc" data-pub="0"><b>🔒 只留给自己</b><span>私密保存, 只有你能看</span></button>
      </div>
      <button type="button" class="art-cancel">先不保存</button>
    </div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.querySelector('.art-cancel').addEventListener('click', close);
  ov.querySelectorAll('.art-chc').forEach(b => {
    b.addEventListener('click', async () => {
      b.disabled = true;
      const ok = await galleryCloudSave(kind, dataURL, b.dataset.pub === '1');
      if (ok) { toast(b.dataset.pub === '1' ? '已放进展览柜, 大家都能看到啦 ✨' : '已经悄悄收好啦 🔒'); close(); if (onSaved) onSaved(); }
      else b.disabled = false;
    });
  });
}

/* 展览柜 overlay */
const _gal = { tab: 'public', kind: 'all', loading: false };
function ensureGalleryDom() {
  let ov = document.getElementById('galleryOverlay');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'galleryOverlay';
  ov.className = 'art-overlay gal-overlay';
  ov.innerHTML = `
    <div class="art-panel gal-panel" role="dialog" aria-label="作品展览柜">
      <header class="gal-head">
        <p class="art-title">🏛 作品展览柜</p>
        <button type="button" class="art-x gal-close">×</button>
      </header>
      <div class="gal-tabs">
        <button type="button" class="gal-tab on" data-tab="public">大家的作品</button>
        <button type="button" class="gal-tab" data-tab="mine">我的收藏</button>
      </div>
      <div class="gal-kinds" id="galKinds"></div>
      <div class="gal-grid" id="galGrid"><p class="gal-empty">正在打开展览柜…</p></div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('.gal-close').addEventListener('click', () => ov.classList.remove('open'));
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
  ov.querySelectorAll('.gal-tab').forEach(b => {
    b.addEventListener('click', () => {
      ov.querySelectorAll('.gal-tab').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      _gal.tab = b.dataset.tab;
      renderGallery();
    });
  });
  return ov;
}
function openGallery() {
  const ov = ensureGalleryDom();
  ov.classList.add('open');
  renderGallery();
}
async function renderGallery() {
  const ov = ensureGalleryDom();
  const kindsBox = ov.querySelector('#galKinds');
  const grid = ov.querySelector('#galGrid');
  kindsBox.innerHTML = '';
  [['all', '全部']].concat(Object.keys(GALLERY_KINDS).map(k => [k, GALLERY_KINDS[k]])).forEach(([k, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'gal-kind' + (_gal.kind === k ? ' on' : '');
    b.textContent = label;
    b.addEventListener('click', () => { _gal.kind = k; renderGallery(); });
    kindsBox.appendChild(b);
  });
  grid.innerHTML = '<p class="gal-empty">正在打开展览柜…</p>';
  const mine = _gal.tab === 'mine';
  let list = await galleryCloudList(mine);
  if (_gal.kind !== 'all') list = list.filter(it => it.kind === _gal.kind);
  if (!list.length) {
    grid.innerHTML = `<p class="gal-empty">${mine ? '还没有收藏作品 —— 画画 / 陶艺 / 剪春联 完成后可以保存进来' : '展览柜还空着, 快去做第一件作品吧 ✨'}</p>`;
    return;
  }
  grid.innerHTML = '';
  list.forEach(it => {
    const card = document.createElement('div');
    card.className = 'gal-card';
    const d = it.created_at ? new Date(it.created_at) : null;
    const ds = d ? `${d.getMonth() + 1}月${d.getDate()}日` : '';
    card.innerHTML = `
      <div class="gal-imgwrap"><img alt="${GALLERY_KINDS[it.kind] || '作品'}" src="${it.img}" loading="lazy" /></div>
      <div class="gal-meta">
        <span class="gal-kindtag">${GALLERY_KINDS[it.kind] || ''}</span>
        <span class="gal-author">${mine ? (it.is_public ? '🌍 公开' : '🔒 私密') : (it.author_name || '疗友')}</span>
        <span class="gal-date">${ds}</span>
      </div>
      <div class="gal-acts"></div>`;
    const acts = card.querySelector('.gal-acts');
    if (mine) {
      const del = document.createElement('button');
      del.type = 'button'; del.className = 'gal-del'; del.textContent = '🗑 删除';
      del.addEventListener('click', () => {
        if (!del._c) { del._c = true; del.textContent = '再点一下确认删除'; return; }
        galleryCloudDelete(it.id);
        card.remove();
        toast('已删除');
      });
      acts.appendChild(del);
    } else {
      const like = document.createElement('button');
      like.type = 'button'; like.className = 'gal-like';
      like.innerHTML = `🤍 <i>${it.likes || 0}</i>`;
      like.addEventListener('click', () => {
        if (galleryLike(it.id)) {
          like.innerHTML = `💗 <i>${(it.likes || 0) + 1}</i>`;
          like.classList.add('on');
        }
      });
      acts.appendChild(like);
    }
    card.querySelector('.gal-imgwrap img').addEventListener('click', () => openImgLightbox(it.img));
    grid.appendChild(card);
  });
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
    audioSeal(_healAudio.voice);   // v730: 人声关掉就关掉, 不许复苏
    _healAudio.voice.pause();
    _healAudio.voice = null;
  }
}

function stopHealAudio() {
  if (_healAudio.music) { audioSeal(_healAudio.music); _healAudio.music.pause(); _healAudio.music = null; }
  if (_healAudio.voice) { audioSeal(_healAudio.voice); _healAudio.voice.pause(); _healAudio.voice = null; }
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

/* v642: 群主工具 = 禁言管理 + 客服信箱(幽灵号清场已删, 幽灵号问题不存在了)
   每次进设置页都刷新显隐, 只认机主手机号 */
function bindAdminCleanup() {
  const adminCard = document.getElementById('adminCleanupCard');
  if (!adminCard) return;
  const u = currentUser();
  const isRosa = isOwnerUser(u);   // v632: 只认机主手机号, 昵称随便改
  adminCard.hidden = !isRosa;
  if (!isRosa) return;
  if (!adminCard.dataset.bound) {
    adminCard.dataset.bound = '1';
    const searchBtn = document.getElementById('muteSearchBtn');
    const mailBtn = document.getElementById('supportMailBtn');
    const trashBtn = document.getElementById('supportTrashBtn');
    const searchInput = document.getElementById('muteSearchInput');
    if (searchBtn) searchBtn.addEventListener('click', adminMuteSearch);
    if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') adminMuteSearch(); });
    if (mailBtn) mailBtn.addEventListener('click', adminSupportList);
    if (trashBtn) trashBtn.addEventListener('click', adminSupportTrash);   // v648: 垃圾站
    const unlockBtn = document.getElementById('unlockReviewBtn');           // v660: 解锁审核
    if (unlockBtn) unlockBtn.addEventListener('click', adminUnlockToggle);
    const ghostBtn = document.getElementById('ghostCleanupBtn');            // v675: 幽灵号清场(加回来了)
    if (ghostBtn) ghostBtn.addEventListener('click', adminGhostCleanup);
  }
}

/* v675: 幽灵号清场 —— 一键清掉「注册没走完/没设置昵称」的残留账号(连账号带消息云端级联删除)。
   规则云端定: 昵称还是默认值 + 注册超过 1 天 + 从没发过消息 = 幽灵号; 只认群主调用 */
async function adminGhostCleanup() {
  if (!sbReady()) { toast('社区还没连上, 稍等一下~'); return; }
  if (!confirm('幽灵号清场：会把所有「还是默认昵称、从没发过消息、注册超过 1 天」的残留账号，连同它们的消息一起永久清掉。\n\n真在用的小伙伴不受影响（有发言记录的不会被清）。确定清场吗？')) return;
  const statusEl = document.getElementById('adminStatus');
  if (statusEl) statusEl.textContent = '🧹 清场中…';
  try {
    const { data, error } = await sb.rpc('ma_ghost_cleanup');
    if (error) throw error;
    toast('🧹 清场完成：清掉 ' + (data.deleted || 0) + ' 个幽灵号' + (data.failed ? ('，' + data.failed + ' 个没清动') : ''));
    if (statusEl) statusEl.textContent = '🧹 已清掉 ' + (data.deleted || 0) + ' 个幽灵号' + (data.failed ? ('（' + data.failed + ' 个失败）') : '');
    if (typeof renderMemberList === 'function' && cm && cm.membersCache) { cm.membersCache = null; }   // 下次进成员页重拉
  } catch (e) {
    if (statusEl) statusEl.textContent = '';
    toast((e && e.message) ? e.message : '清场失败, 稍后再试');
  }
}

function mutedActive(mu) {
  if (!mu) return false;
  const t = new Date(mu).getTime();
  return !isNaN(t) && t > Date.now();
}
function mutedLabel(mu) {
  const t = new Date(mu).getTime();
  if (isNaN(t)) return '';
  return t > Date.now() + 100 * 365 * 864e5 ? '永久' : new Date(mu).toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* v642: 按昵称搜成员 → 直接禁言/解禁 */
async function adminMuteSearch() {
  const statusEl = document.getElementById('adminStatus');
  const box = document.getElementById('muteResults');
  const input = document.getElementById('muteSearchInput');
  const q = ((input && input.value) || '').trim();
  if (!q) { toast('先输入要搜的昵称'); return; }
  if (!sbReady() || !cm.uid) { toast('社区还没连上, 稍等一下~'); return; }
  if (statusEl) statusEl.textContent = '⏳ 搜索中…';
  try {
    const { data, error } = await sb.from('profiles')
      .select('id, nickname, avatar, friend_code, muted_until')
      .ilike('nickname', '%' + q + '%')
      .neq('id', cm.uid)
      .order('created_at', { ascending: false }).limit(10);
    if (error) throw error;
    const list = (data || []).filter(p => !isGhostNick(p.nickname));
    if (!box) return;
    box.innerHTML = '';
    if (!list.length) { box.innerHTML = '<p class="admin-status">没搜到叫「' + q.replace(/</g, '&lt;') + '」的成员</p>'; }
    list.forEach(p => box.appendChild(muteRow(p)));
    if (statusEl) statusEl.textContent = '';
  } catch (e) {
    if (statusEl) statusEl.textContent = '❌ ' + ((e && e.message) || e);
  }
}

function muteRow(p) {
  const row = document.createElement('div');
  row.className = 'mute-row';
  const info = document.createElement('div');
  info.className = 'mute-info';
  const nm = document.createElement('p');
  nm.className = 'mute-name';
  nm.textContent = (p.avatar || '🌙') + ' ' + (p.nickname || '小伙伴') + (p.friend_code ? ' · ' + p.friend_code : '');
  const st = document.createElement('p');
  st.className = 'mute-state';
  st.textContent = mutedActive(p.muted_until) ? '🔇 禁言至 ' + mutedLabel(p.muted_until) : '正常发言中';
  info.appendChild(nm); info.appendChild(st);
  const acts = document.createElement('div');
  acts.className = 'mute-actions';
  const rebuild = () => { const fresh = muteRow(p); row.replaceWith(fresh); };
  if (mutedActive(p.muted_until)) {
    const un = document.createElement('button');
    un.type = 'button'; un.className = 'btn btn-ghost';
    un.textContent = '解除禁言';
    un.addEventListener('click', async () => {
      un.disabled = true;
      try {
        await sb.rpc('ma_unmute_user', { p_target: p.id });
        p.muted_until = null;
        toast('✅ 已解除 ' + (p.nickname || '') + ' 的禁言');
        postGroupMsg('ma-sys|🔊 ' + (p.nickname || '小伙伴') + ' 已被群主解除禁言');   // v646: 群内广播
        rebuild();
      } catch (e) { toast('失败: ' + ((e && e.message) || e)); un.disabled = false; }
    });
    acts.appendChild(un);
  } else {
    [[1, '1天'], [7, '7天'], [30, '30天'], [0, '永久']].forEach(([d, label]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn-ghost mute-dur';
      b.textContent = '🔇 ' + label;
      b.addEventListener('click', async () => {
        b.disabled = true;
        try {
          await sb.rpc('ma_mute_user', { p_target: p.id, p_days: d });
          p.muted_until = d > 0 ? new Date(Date.now() + d * 864e5).toISOString() : '2999-01-01T00:00:00Z';
          toast('✅ 已禁言 ' + (p.nickname || '') + ' ' + label);
          postGroupMsg('ma-sys|🔇 ' + (p.nickname || '小伙伴') + ' 已被群主禁言' + (d > 0 ? ' ' + d + ' 天' : '（永久）'));   // v646: 群内广播
          rebuild();
        } catch (e) { toast('失败: ' + ((e && e.message) || e)); b.disabled = false; }
      });
      acts.appendChild(b);
    });
  }
  row.appendChild(info); row.appendChild(acts);
  return row;
}

/* v642/v648: 客服信箱 + 垃圾站 —— 群主可删(进垃圾站)/恢复/彻底清理 */
function supportBodyInto(info, content) {   // 文字或图片(data:image| 前缀)
  const tx = document.createElement('p');
  tx.className = 'mute-state';
  if (typeof content === 'string' && content.startsWith('data:image|')) {
    tx.textContent = '[图片]';
    const im = document.createElement('img');
    im.className = 'sc-img sc-mail-img';
    im.alt = '用户发的图片';
    im.src = content.slice('data:image|'.length);
    im.addEventListener('click', () => openImgLightbox(im.src));
    info.appendChild(tx); info.appendChild(im);
  } else {
    tx.textContent = content;
    info.appendChild(tx);
  }
}

function supportItemRow(m, opts) {   // opts: {mode: 'inbox'|'trash'}
  const item = document.createElement('div');
  item.className = 'mute-row';
  const info = document.createElement('div');
  info.className = 'mute-info';
  const nm = document.createElement('p');
  nm.className = 'mute-name';
  let time = '', delTime = '';
  try {
    time = new Date(m.created_at).toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    if (m.deleted_at) delTime = new Date(m.deleted_at).toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {}
  nm.textContent = '👤 ' + (m.nickname || '疗友') + ' · ' + time + (opts.mode === 'trash' && delTime ? ' · 删于 ' + delTime : '');
  info.appendChild(nm);
  supportBodyInto(info, m.content);
  item.appendChild(info);

  const acts = document.createElement('div');
  acts.className = 'mute-actions';
  const mkBtn = (label, fn, needConfirm) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn btn-ghost';
    b.textContent = label;
    b.addEventListener('click', async () => {
      if (needConfirm && !confirm(needConfirm)) return;
      b.disabled = true;
      try { await fn(); } catch (e) { toast('失败: ' + ((e && e.message) || e)); b.disabled = false; }
    });
    return b;
  };
  if (opts.mode === 'inbox') {
    acts.appendChild(mkBtn('🗑 删除', async () => {
      await sb.rpc('ma_support_delete', { p_id: m.id });
      toast('已移入垃圾站');
      adminSupportToggle('inbox', true);   // v649: 原地刷新, 不折叠
    }));
  } else {
    acts.appendChild(mkBtn('♻️ 恢复', async () => {
      await sb.rpc('ma_support_restore', { p_id: m.id });
      toast('✅ 已恢复到信箱');
      adminSupportToggle('trash', true);   // v649: 原地刷新, 不折叠
    }));
    acts.appendChild(mkBtn('❌ 彻底删除', async () => {
      await sb.rpc('ma_support_purge', { p_id: m.id });
      toast('已彻底删除');
      adminSupportToggle('trash', true);   // v649: 原地刷新, 不折叠
    }, '彻底删除后无法恢复, 确定吗?'));
  }
  item.appendChild(acts);
  return item;
}

async function adminSupportToggle(mode, force) {
  const statusEl = document.getElementById('adminStatus');
  const box = document.getElementById('supportMailList');
  if (!box) return;
  if (!sbReady() || !cm.uid) { toast('社区还没连上, 稍等一下~'); return; }
  const next = (!force && box.dataset.mode === mode && box.dataset.open === '1') ? '0' : mode;   // v649: force=内部刷新不折叠; 人工点按钮才开关
  box.dataset.mode = next;
  box.dataset.open = next === '0' ? '0' : '1';
  if (next === '0') { box.innerHTML = ''; if (statusEl) statusEl.textContent = ''; return; }
  if (statusEl) statusEl.textContent = '⏳ 拉取中…';
  box.innerHTML = '';
  const isInbox = next === 'inbox';
  if (!isInbox) {   // 垃圾站顶部: 清空按钮
    const purgeBar = document.createElement('div');
    purgeBar.style.cssText = 'display:flex;justify-content:flex-end;margin:4px 0;';
    const purgeAll = document.createElement('button');
    purgeAll.type = 'button'; purgeAll.className = 'btn btn-ghost';
    purgeAll.textContent = '🧹 清空垃圾站';
    purgeAll.addEventListener('click', async () => {
      if (!confirm('清空垃圾站? 全部彻底删除, 无法恢复!')) return;
      purgeAll.disabled = true;
      try {
        const { data, error } = await sb.rpc('ma_support_purge_all');
        if (error) throw error;
        toast('🧹 已清空 ' + (data || 0) + ' 条');
        adminSupportToggle('trash', true);   // v649: 原地刷新, 不折叠
      } catch (e) { toast('失败: ' + ((e && e.message) || e)); purgeAll.disabled = false; }
    });
    purgeBar.appendChild(purgeAll);
    box.appendChild(purgeBar);
  }
  try {
    const { data, error } = await sb.rpc(isInbox ? 'ma_support_list' : 'ma_support_trash_list', { p_limit: 100 });
    if (error) throw error;
    if (statusEl) statusEl.textContent = '';
    const list = data || [];
    if (!list.length) {
      box.appendChild(Object.assign(document.createElement('p'),
        { className: 'admin-status', textContent: isInbox ? '还没有人给客服发过留言' : '垃圾站是空的' }));
      return;
    }
    list.forEach(m => box.appendChild(supportItemRow(m, { mode: isInbox ? 'inbox' : 'trash' })));
  } catch (e) {
    /* v650: 报错不许折叠面板 —— 原地留着, 只在状态行显示错误 */
    if (statusEl) statusEl.textContent = '❌ ' + ((e && e.message) || e) + (String(e && e.message).match(/schema cache|does not exist/i) ? ' (云端函数没生效, 见下方 SQL 说明)' : '');
  }
}

function adminSupportList() { adminSupportToggle('inbox'); }
function adminSupportTrash() { adminSupportToggle('trash'); }

/* v660: 解锁审核 —— 群主核对微信到账后一键开通(通过/拒绝), approved 的账号端自动解锁 */
async function adminUnlockToggle() {
  const box = document.getElementById('unlockReviewList');
  const statusEl = document.getElementById('adminStatus');
  if (!box) return;
  if (!sbReady() || !cm.uid) { toast('社区还没连上, 稍等一下~'); return; }
  if (box.dataset.open === '1') { box.dataset.open = '0'; box.innerHTML = ''; return; }
  box.dataset.open = '1';
  if (statusEl) statusEl.textContent = '⏳ 拉取申请中…';
  box.innerHTML = '';
  try {
    const { data, error } = await sb.rpc('ma_unlock_list', { p_limit: 100 });
    if (error) throw error;
    if (statusEl) statusEl.textContent = '';
    const list = data || [];
    if (!list.length) {
      box.appendChild(Object.assign(document.createElement('p'),
        { className: 'admin-status', textContent: '还没有待审核的付款申请' }));
      return;
    }
    list.forEach(r => box.appendChild(unlockReqRow(r)));
  } catch (e) {
    if (statusEl) statusEl.textContent = '❌ ' + ((e && e.message) || e) + (String(e && e.message).match(/schema cache|does not exist/i) ? ' (需要先在 Supabase 跑 v660 SQL)' : '');
  }
}

function unlockReqRow(r) {
  const row = document.createElement('div');
  row.className = 'mute-row';
  const info = document.createElement('div');
  info.className = 'mute-info';
  const nm = document.createElement('p');
  nm.className = 'mute-name';
  let time = '';
  try { time = new Date(r.created_at).toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
  nm.textContent = '💰 ' + (r.nickname || '疗友') + ' · ' + (r.phone || '无手机号') + ' · ' + time;
  info.appendChild(nm);
  row.appendChild(info);
  const acts = document.createElement('div');
  acts.className = 'mute-actions';
  const mk = (label, approve) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn btn-ghost';
    b.textContent = label;
    b.addEventListener('click', async () => {
      b.disabled = true;
      try {
        await sb.rpc('ma_unlock_review', { p_id: r.id, p_approve: approve });
        toast(approve ? '✅ 已给 ' + (r.nickname || r.phone) + ' 开通全部游戏' : '已拒绝该申请');
        row.remove();
        const box = document.getElementById('unlockReviewList');
        if (box && !box.children.length) box.appendChild(Object.assign(document.createElement('p'), { className: 'admin-status', textContent: '都处理完啦 ✨' }));
      } catch (e) { toast('失败: ' + ((e && e.message) || e)); b.disabled = false; }
    });
    return b;
  };
  acts.appendChild(mk('✅ 通过', true));
  acts.appendChild(mk('✖ 拒绝', false));
  row.appendChild(acts);
  return row;
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
      toast('灵感注入中 ✦\n见证魔法变身');   // v739: 两行排版(原来挤一行"变身"贴在末尾很丑)
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
function toast(msg) {   // v739: 支持 \n 换行(先转义再拆行, 调用方全是站内静态文案)
  const el = document.getElementById('toast');
  el.innerHTML = String(msg)
    .replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
    .split('\n').join('<br>');
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
  /* v727: iOS 被别的 App 抢走音频会话后, ctx 状态是 'interrupted' 不止 'suspended' ——
     只认 suspended 的话永远唤不醒, 表现就是"听过别的歌回来纸条/录音全哑" */
  if (_audioCtx.state !== 'running' && _audioCtx.resume) { try { _audioCtx.resume(); } catch (e) {} }
  return _audioCtx;
}

let _sfxBuf = null;

/* v708: 游戏 BGM(生日歌/圣诞歌)专用一次性播放 ——
   原做法 <audio>+Blob 的 play() 发生在异步 fetch 完成之后, 不在用户手势里,
   老 iOS 直接拒绝(catch 静默) → "升级手机才听得到"。改走游戏音效同款 WebAudio:
   玩家点按时 ctx 已解锁(running), BufferSource 随时可播, 老手机同样可靠;
   解码失败才退回 <audio>。结尾 3s 程序淡出用 gain ramp, 音频文件保持零加工。 */
const _songBufs = {};             // 文件名 → 解码好的 AudioBuffer
let _songCtl = null;              // 当前在响的 { stop() }
let _songGen = 0;                 // v710: 代际令牌 —— 停止后再飞回来的解码/兜底一律作废(否则"关了游戏歌还在响")
function stopSongBgm() {
  _songGen++;
  if (_songCtl) {
    const c = _songCtl; _songCtl = null;
    try {
      /* v730: ctx 已经被挂起时,"0.25s 渐弱 + 0.3s 后停"根本走不动(currentTime 冻着),
         一恢复就先响 0.3s —— 所以这种状态下直接硬停, 别留尾巴 */
      const g = _audioCtx;
      if (c._hardStop && g && g.state !== 'running') c._hardStop();
      else c.stop();
    } catch (e) {}
  }
}
/* v728: 把"起播"抽出来 —— 系统抢走音频会话打断后, 回来要能从断点重开同一首歌 */
function _songStart(file, buf, volume, onEnd, offset) {
  const ctx = ensureAudioCtx();
  if (!ctx || !buf) return false;
  /* v730: 上一首必须彻底死掉再开新的 —— 否则旧 src 还挂在 destination 上,
     新的一起来就是两层歌叠着(用户报的"叠着背景音乐") */
  if (_songCtl) { const prev = _songCtl; _songCtl = null; try { if (prev._hardStop) prev._hardStop(); else prev.stop(); } catch (e) {} }
  const off = Math.max(0, Math.min(offset || 0, Math.max(0, buf.duration - 0.5)));
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = volume;
  src.connect(g); g.connect(ctx.destination);
  const left = Math.max(0.2, buf.duration - off);
  const ctl = {
    stopped: false,   // v716: 区分"自然播完"和"被 stop" —— 只有自然播完才触发 onEnd
    _live: { file, volume, onEnd, startedAt: Date.now() - off * 1000 },
    /* v730: 硬停(无渐弱/可重复调用) —— 重建、续播、切歌前一律用它, 保证不留孤儿节点 */
    _hardStop() {
      this.stopped = true;
      try { src.onended = null; } catch (e) {}
      try { src.stop(); } catch (e) {}
      try { g.disconnect(); } catch (e) {}
    },
    stop() {
      this.stopped = true;
      try {   // 0.25s 快渐弱再停, 不"啪"一下切断
        g.gain.cancelScheduledValues(ctx.currentTime);
        g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        src.stop(ctx.currentTime + 0.3);
      } catch (e) { try { src.stop(); } catch (e2) {} }
    }
  };
  _songCtl = ctl;
  try {   // 结尾 3s 线性淡出(与旧 <audio> 淡出一致)
    const t0 = ctx.currentTime;
    g.gain.setValueAtTime(volume, t0 + Math.max(0, left - 3));
    g.gain.linearRampToValueAtTime(0.0001, t0 + left);
  } catch (e) {}
  src.onended = () => {
    if (_songCtl === ctl) _songCtl = null;
    if (!ctl.stopped && onEnd) { try { onEnd(); } catch (e) {} }
  };
  src.start(ctx.currentTime, off);
  return true;
}
/* v728: 断点续播 —— audioWake 检测到 ctx 从"被打断"恢复时调用; 已经播完的直接收尾 */
function reviveSongBgm() {
  const ctl = _songCtl;
  if (!ctl || ctl.stopped || !ctl._live) return false;
  const L = ctl._live;
  const buf = _songBufs[L.file];
  if (!buf) return false;
  const off = (Date.now() - L.startedAt) / 1000;
  if (off >= buf.duration - 0.3) {   // 时间上已经该播完了 → 正常收尾, 别重头再来
    _songCtl = null;
    try { if (ctl._hardStop) ctl._hardStop(); else ctl.stopped = true; } catch (e) {}
    if (L.onEnd) { try { L.onEnd(); } catch (e) {} }
    return false;
  }
  /* v730: 先硬停旧节点再续播 —— 不然后台回来一次就多一层歌, 旧的那层还停不掉 */
  _songCtl = null;
  try { if (ctl._hardStop) ctl._hardStop(); else ctl.stop(); } catch (e) {}
  return _songStart(L.file, buf, L.volume, L.onEnd, off);
}
function playSongBgm(file, volume, onEnd) {   // v716: 加 onEnd —— 播完回调(幸运星歌播完要把背景音接回来)
  stopSongBgm();
  const gen = _songGen;
  const ctx = ensureAudioCtx();
  if (!ctx) return false;   // v717: 只在真没有 WebAudio 时放弃
  /* v717: suspended 不再直接 return false —— 抽星 celebrate 发生在 await RPC 之后,
     不在手势内, 这里 resume() 是唯一的翻盘机会(而 wishDraw/openWish 的同步前缀
     已经在手势内解锁过 ctx, 所以这里十拿九稳)。BufferSource.start() 在 suspended
     ctx 上会排队, ctx 一变 running 立刻出声, 无副作用。 */
  if (ctx.state !== 'running') { try { ctx.resume(); } catch (e) {} }
  const start = (buf, off) => _songStart(file, buf, volume, onEnd, off);
  if (_songBufs[file]) { start(_songBufs[file], 0); return true; }
  fetch(file + '?v=' + AUDIO_VERSION)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(ab => new Promise((ok, bad) => {
      try { const p = ctx.decodeAudioData(ab, ok, bad); if (p && p.then) p.then(ok, bad); } catch (e) { bad(e); }
    }))
    .then(buf => {
      if (gen !== _songGen) return;   // v710: 解码期间被停掉/换代 → 作废
      if (!buf) throw new Error('decode');
      _songBufs[file] = buf;
      if (!_songCtl) start(buf);   // 等解码期间被停掉(关游戏/再点) → 不响
    })
    .catch(() => {
      // WebAudio 路不通 → 退回 <audio>+Blob(新手机上仍可用)
      fetch(file + '?v=' + AUDIO_VERSION).then(r => r.blob()).then(b => {
        if (gen !== _songGen || _songCtl) return;   // v710: 已被停掉/已有新的在响 → 不播(防幽灵)
        const a = new Audio(); a.preload = 'auto'; a.src = URL.createObjectURL(b);
        a.loop = false; a.volume = volume;
        const ctl = {
          stopped: false,
          _el: a,   // v728: 游离 <audio>(不在 DOM 里, querySelectorAll 抓不到) → 唤醒时单独接回
          /* v730: 停 = 打封条, 之后任何快照/重试都不许把它 play() 回来 */
          _hardStop() { this.stopped = true; audioSeal(a); try { a.pause(); } catch (e) {} try { URL.revokeObjectURL(a.src); } catch (e) {} },
          stop() { this.stopped = true; audioSeal(a); try { a.pause(); } catch (e) {} }
        };
        _songCtl = ctl;
        a.onended = a.onerror = () => {   // v716: 播完/出错都恢复背景音
          if (_songCtl === ctl) _songCtl = null;
          if (!ctl.stopped && onEnd) { try { onEnd(); } catch (e) {} }
        };
        a.play().catch(() => {   // 播放被拒也不能把 duck 卡死
          if (_songCtl === ctl) _songCtl = null;
          if (onEnd) { try { onEnd(); } catch (e) {} }
        });
      }).catch(() => {   // 彻底拿不到音频 → 恢复, 别让全站音乐卡在暂停
        if (gen === _songGen && onEnd) { try { onEnd(); } catch (e) {} }
      });
    });
  return true;
}
/* v717: 手势内(开许愿瓶)预取+解码歌曲, 抽中瞬间秒响 —— 不然 fetch+decode 的
   几百毫秒正好撞上"弹窗已经出来了歌还没起"的空档感 */
function preloadSongBgm(file) {
  if (_songBufs[file]) return;
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  const gen = _songGen;
  fetch(file + '?v=' + AUDIO_VERSION)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(ab => new Promise((ok, bad) => {
      try { const p = ctx.decodeAudioData(ab, ok, bad); if (p && p.then) p.then(ok, bad); } catch (e) { bad(e); }
    }))
    .then(buf => { if (gen === _songGen && buf) _songBufs[file] = buf; })
    .catch(() => {});
}
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
    for (const id of keys) {
      // v740: 音频替换功能整体下架(用户钦定"不许换") —— 只保留 ASMR 页上传空位(asmr.user*),
      // 其余所有槽位替换记录(含旧版 asmr.* 换上传)全部清掉, 播放一律回归默认音色
      if (/^asmr\.user/.test(id)) continue;
      try { await audioDB.del(id); } catch (e) {}
      delete _customBufs[id];
      delete _customMeta[id];
    }
  } catch (e) {}
}

/* v728: 采样前导静音 = 手感延迟。实测 28 个游戏音效平均前导 132ms(最长的 620ms),
   按下后要先听一段"空气"才出声, 用户感受就是"不跟手"。这里扫出第一帧有效波形位置,
   起播直接跳过去 —— 只改播放起点, 音频文件本身零加工。 */
function _leadSilence(buf) {
  try {
    const sr = buf.sampleRate;
    const ch = buf.getChannelData(0);
    const frame = Math.max(1, Math.round(sr * 0.005));   // 5ms 一帧
    let peak = 0;
    for (let i = 0; i < ch.length; i += 4) { const v = Math.abs(ch[i]); if (v > peak) peak = v; }
    if (peak <= 0) return 0;
    const thr = peak * 0.12;
    for (let i = 0; i < ch.length; i += frame) {
      let m = 0;
      for (let k = i; k < Math.min(i + frame, ch.length); k++) { const v = Math.abs(ch[k]); if (v > m) m = v; }
      if (m > thr) return Math.max(0, i / sr - 0.02);   // 留 20ms 预卷, 不吃掉起音
    }
  } catch (e) {}
  return 0;
}

function playFileBuffer(buf, volume, rate, opts) {
  const ctx = ensureAudioCtx(); if (!ctx) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = rate || 1;
  const g = ctx.createGain();
  // v551: 真实文件音效整体降 0.55, 防止个别采样过亮吓到用户; 传入 volume 仍可叠加
  const FILE_SFX_GAIN = 0.55;
  const vol = (volume != null ? volume : 0.8) * FILE_SFX_GAIN;
  const t0 = ctx.currentTime;
  /* v728: lead = 跳过前导静音; maxDur = 只播到该时间点(泡泡"啵两声"截成一声) */
  const lead = Math.min(Math.max(0, (opts && opts.lead) || 0), Math.max(0, buf.duration - 0.05));
  const hardEnd = (opts && opts.maxDur) ? Math.min(buf.duration, opts.maxDur) : buf.duration;
  const dur = Math.max(0.05, (hardEnd - lead)) / (rate || 1);
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
  src.start(t0, lead);
  if (hardEnd < buf.duration) { try { src.stop(t0 + dur + 0.02); } catch (e) {} }
}

/* v546: 音频文件统一缓存版本(内容更新后强制刷新) */
function slotFileUrl(slot) { return slot.file + (slot.file.indexOf('?') >= 0 ? '&' : '?') + 'v=' + AUDIO_VERSION; }

/* v728: 采样加载/预热统一走这里 —— 解码完顺手算出前导静音, 播放时就能跳过 */
function _loadSfxBuffer(slotId) {
  const slot = AUDIO_SLOTS[slotId];
  if (!slot || !slot.file || slot._loading || _fileBufs[slotId]) return;
  slot._loading = true;
  fetch(slotFileUrl(slot))
    .then(r => { if (!r.ok) throw new Error('file ' + r.status); return r.arrayBuffer(); })
    .then(ab => {
      const ctx = ensureAudioCtx();
      if (!ctx) throw new Error('no ctx');
      return new Promise((ok, bad) => {
        try { const p = ctx.decodeAudioData(ab, ok, bad); if (p && typeof p.then === 'function') p.then(ok, bad); } catch (e) { bad(e); }
      });
    })
    .then(b => {
      slot._loading = false;
      _fileBufs[slotId] = b;
      if (slot.lead == null) slot.lead = _leadSilence(b);
    })
    .catch(() => { slot._loading = false; });
}

/* v728: 进游戏/首次上手时把游戏采样全部预取解码(共约 800KB) ——
   首按不再等 fetch+decode, 也不再有"第一次按没声"的体感 */
let _sfxPrewarmed = false;
function prewarmGameSfx() {
  if (_sfxPrewarmed) return;
  _sfxPrewarmed = true;
  Object.keys(AUDIO_SLOTS).forEach(id => {
    const slot = AUDIO_SLOTS[id];
    if (slot.group === 'game' && slot.file && !slot.loop) _loadSfxBuffer(id);
  });
}

/* 短音效统一入口: 优先用户自定义文件, 其次内置真实采样懒加载, 最后合成兜底 */
function playSfx(slotId, opts) {
  const slot = AUDIO_SLOTS[slotId];
  if (!slot) return;
  const now = performance.now();
  if (slot.throttle && now - (slot._last || 0) < slot.throttle) return;
  slot._last = now;
  const fopts = { lead: slot.lead || 0, maxDur: slot.maxDur || 0 };
  const buf = _customBufs[slotId];
  if (buf) {
    playFileBuffer(buf, opts && opts.volume, opts && opts.rate, fopts);
    return;
  }
  // v538: 内置真实采样懒加载(异步 fetch 一次, 失败回落合成; 播放过即缓存 _fileBufs)
  if (slot.file) {
    if (_fileBufs[slotId]) {
      playFileBuffer(_fileBufs[slotId], opts && opts.volume, opts && opts.rate, fopts);
      return;
    }
    /* v728: 采样还没解好时**立刻用合成音顶上**(手感第一), 后台继续加载;
       原来这里是直接 return 静默丢弃 —— 用户按了没声/隔一会儿才响, 就是"不跟手" */
    try { slot.synth(opts); } catch (e) {}
    _loadSfxBuffer(slotId);
    return;
  }
  try { slot.synth(opts); } catch (e) {}
}

/* ============================================================
   v730: 音频总闸 —— 「关掉了就是关掉了」, 谁都不许在后面偷偷复活
   痛点(用户反复报): 星星瓶退出后音乐还在响 / 还跟背景音叠在一起 / 关不掉。
   三道闸:
   ① _noRevive 封条: 任何被**主动停掉**的 <audio> 打上封条, 快照续播(_bgPlaying)、
      手势重试队列(_reviveLater)、duck 恢复一律不许再 play() 它 —— 以前的"幽灵复活"
      就是这些队列里躺着早就被关掉的元素。
   ② _loopDuck: 循环音源(ASMR/雨声/游戏内循环)是纯 WebAudio, 没有 <audio> 可暂停,
      duck 原先只压得住 DOM 音频 → 抽中幸运星时"歌 + 雨声"叠着响。现在 duck 直接压 master。
   ③ _hardStopNodes / ctl._hardStop: 重建或续播前**必须先把旧节点真停掉**,
      不然后台快照续播一次就多一层声音, 旧的那层引用已丢、再也停不掉(用户说的"关不上")。
   ============================================================ */
const _noRevive = new WeakSet();          // 已被人为停止/关闭的音源 → 永久不许复活
function audioSeal(a) {                    // 打封条 + 从所有"待复活"队列里摘掉
  try {
    if (!a) return;
    _noRevive.add(a);
    try { const i = _bgPlaying.indexOf(a); if (i >= 0) _bgPlaying.splice(i, 1); } catch (e) {}
    try { const j = _reviveLater.indexOf(a); if (j >= 0) _reviveLater.splice(j, 1); } catch (e) {}
  } catch (e) {}
}
function audioUnseal(a) { try { if (a) _noRevive.delete(a); } catch (e) {} }
function audioSealed(a) { try { return _noRevive.has(a); } catch (e) { return false; } }

/* 循环音源(ASMR)统一入口: 返回 {ctx, master, stops} 供 smoothStop */
/* v728: 循环音源登记表 —— 手机切去别的 App 时系统会把 AudioContext 挂起/打断,
   WebAudio 里正在循环的节点(BufferSource/合成链)瞬间全死, 而 DOM <audio> 能靠快照续播,
   循环音源却没人管 → 回来"整站没声"的死角。这里登记每个在响的循环源, ctx 恢复后重建。 */
const _loopLive = [];
async function _buildLoop(slotId) {
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
    /* v730: 重建时如果正处在 duck(抽中幸运星/放语音) 状态, 直接建到静音, 别再轰一耳朵 */
    master.gain.linearRampToValueAtTime(_loopDucked ? 0.0001 : 0.6, ctx.currentTime + (slot.fade || 0.7));
    master.connect(ctx.destination);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(master);
    src.start(0, slot.lead || 0);   // v734: 带 lead 的采样(如吹气声)首圈跳过开头静音, 松手渐弱收尾不受影响
    return { ctx, master, stops: [() => src.stop()] };
  }
  const synth = slot.synth(ctx);
  if (synth && synth.master && _loopDucked) { try { synth.master.gain.value = 0.0001; } catch (e) {} }
  return synth;
}
/* v730: 立刻掐断一个循环音源的所有节点(不留渐弱) —— 重建/去重时用, 保证旧的那层一定死透 */
function _hardStopNodes(n) {
  if (!n) return;
  try { if (Array.isArray(n.stops)) n.stops.forEach(fn => { try { if (typeof fn === 'function') fn(); } catch (e) {} }); } catch (e) {}
  try { if (typeof n.stop === 'function') n.stop(); } catch (e) {}
  try { if (n.master && n.master.disconnect) n.master.disconnect(); } catch (e) {}
}
function _loopRelease(nodes) {
  const rec = nodes && nodes._loopRec;
  if (!rec) return;
  const i = _loopLive.indexOf(rec);
  if (i >= 0) _loopLive.splice(i, 1);
  nodes._loopRec = null;
}
/* 把所有"还应该在响"的循环音源原地重建(调用方手里的 nodes 引用保持有效, 停止照样管用)
   v730: ①同一个 rec 加 busy 锁, 防止 _buildLoop 的 await 期间被并发重建两次
         ②重建前先 _hardStopNodes(旧节点) —— 旧的不掐死, 新的又建出来 = 两层叠着响,
           而且旧引用已被覆盖, 谁都停不掉(用户报的"关不上/一直响"就是这个) */
async function rebuildLiveLoops() {
  const list = _loopLive.slice();
  for (const rec of list) {
    if (_loopLive.indexOf(rec) < 0) continue;   // 期间被停掉了 → 不复活
    if (rec.busy) continue;                     // 已在重建中 → 不重复建
    rec.busy = true;
    try {
      const fresh = await _buildLoop(rec.slotId);
      if (!fresh) continue;
      if (_loopLive.indexOf(rec) < 0) { _hardStopNodes(fresh); continue; }   // 建的过程中被停了 → 新节点也别留
      const old = rec.nodes;
      _hardStopNodes(old);
      old.ctx = fresh.ctx;
      old.master = fresh.master;
      old.stops = fresh.stops;
      if (typeof fresh.stop === 'function') old.stop = fresh.stop;
    } catch (e) {
    } finally { rec.busy = false; }
  }
}
/* v730: duck —— 循环音源没有 <audio> 可以 pause, 直接压 master。
   抽中幸运星/放纸条语音时压到静音, 结束后抬回 0.6, 不再"歌和雨声一起响"。 */
let _loopDucked = false;
function _loopDuck(on) {
  _loopDucked = !!on;
  _loopLive.forEach(rec => {
    const n = rec && rec.nodes;
    const g = n && n.master && n.master.gain;
    const ctx = n && n.ctx;
    if (!g || !ctx) return;
    try {
      const t = ctx.currentTime;
      const cur = (typeof g.value === 'number' && g.value > 0) ? g.value : 0.0001;
      g.cancelScheduledValues(t);
      g.setValueAtTime(cur, t);
      g.linearRampToValueAtTime(on ? 0.0001 : 0.6, t + 0.18);
    } catch (e) {}
  });
}
async function startLoopSound(slotId) {
  /* v730: 同一个槽位只允许一层在响 —— 先把这个槽位的旧一层掐掉再建新的,
     否则切来切去会攒出三四层同源循环, 越点越响还停不掉 */
  for (let i = _loopLive.length - 1; i >= 0; i--) {
    const r = _loopLive[i];
    if (r && r.slotId === slotId) {
      _hardStopNodes(r.nodes);
      _loopLive.splice(i, 1);
      if (r.nodes) r.nodes._loopRec = null;
    }
  }
  const nodes = await _buildLoop(slotId);
  if (!nodes) return null;
  const rec = { slotId, nodes };
  nodes._loopRec = rec;
  _loopLive.push(rec);
  return nodes;
}

/* v734: 循环音源预载 —— 只取文件/解码不播放(进游戏就预取, 首次按下不等网络) */
async function preloadLoopSound(slotId) {
  try {
    const slot = AUDIO_SLOTS[slotId];
    if (!slot || !slot.file || _fileBufs[slotId] || _customBufs[slotId]) return;
    const ctx = ensureAudioCtx(); if (!ctx) return;
    const res = await fetch(slotFileUrl(slot));
    if (!res.ok) throw new Error('file ' + res.status);
    _fileBufs[slotId] = await ctx.decodeAudioData(await res.arrayBuffer());
  } catch (e) {}
}

/* 平滑停止(startLoopSound 返回的 nodes, 或任何带 ctx/master/stops/stop 的对象)
 * v51 补: 之前缺失导致 stopHealWeather / asmr 卡片停止都"点了没反应"
 *  渐弱 master gain → 400ms 后调用 stops/stop 真正停源 → 500ms 后 disconnect
 *  静默吞错(多源安全, 单个节点失败不影响其他) */
function smoothStop(nodes) {
  if (!nodes) return;
  _loopRelease(nodes);   // v728: 用户主动停掉 → 从"待复活"名单里摘掉, 回来不再自动响
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
  /* v730: 果冻改成 0.37s 的短促"捏一下"(sfx-jelly-press.mp3, 从原采样里裁第一声,
     保留真实质感, 只是不再拖着 1.4s 的长尾巴 —— 用户原话"那个声音有点长, 跟之前奶油似的") */
  'game.jellySquish':   { label: '果冻捏压',   group: 'game', file: 'sfx-jelly-press.mp3', throttle: 170, synth: () => squishSound() },
  'game.knead':         { label: '揉面',       group: 'game', file: 'sfx-knead.mp3',        throttle: 220, synth: () => squishSound() },
  'game.sauce':         { label: '抹番茄酱',   group: 'game', file: 'sfx-knead.mp3',         throttle: 180, synth: () => splatSound() },
  'game.sauceLoop':     { label: '揉面/抹酱(循环)', group: 'game', loop: true, file: 'sfx-icing-loop.mp3', throttle: 0, synth: () => splatSound() },   // v712: 披萨揉面/抹酱 与蛋糕同款循环跟随
  'game.icingLoop':     { label: '挤奶油(循环)', group: 'game', loop: true, file: 'sfx-icing-loop.mp3', throttle: 0, synth: () => splatSound() },   // v701: 落笔循环/离笔即停
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
  /* v734: 吹气声秒进 —— fade 0.7→0.12s + 采样开头 117ms 静音首圈跳过 + 进游戏预解码(见下) */
  'game.blow':          { label: '吹泡泡(吹气)', group: 'game', loop: true, file: 'sfx-blow.mp3', fade: 0.12, lead: 0.117, synth: ctx => blowLoopSynth(ctx) },
  /* v730: 采样 sfx-bubble-pop.mp3 已裁成**只有一声**(0.30s, 原文件的第二声"啵"整段切掉),
     所以不再需要 maxDur 兜 —— 不管哪条播放路径都只会响一下 */
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
  status.textContent = '戳我换颜色 · 拽我冒星星 · 软乎乎圆滚滚';
  stage.appendChild(status);

  // v687: 一键复原 —— 被拽变形/拽远了, 点一下回到初始的圆滚滚状态
  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  const rst = document.createElement('button');
  rst.type = 'button';
  rst.className = 'st-chip';
  rst.textContent = '↩ 复原';
  rst.addEventListener('click', e => {
    e.stopPropagation();
    soft.reset();
    stars.length = 0;
    face = 'joy'; faceT = performance.now();
    playSfx('game.ballSquish', { volume: 0.5 });
  });
  tools.appendChild(rst);
  stage.appendChild(tools);

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

/* ---------- 游戏: 拽拽弹力球(v651 重做: 永远正圆 —— 拽多远都跟手, 松手 duang 地弹回中央) ---------- */
function buildTugBall(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const RING = 84;
  const CX = GAME_W / 2, CY = GAME_H / 2;
  const TAU = Math.PI * 2;
  const M = RING * 0.7;                            // 墙壁内缩
  const N = 18;                                    // 环上质点数
  const EDGE = 2 * RING * Math.sin(Math.PI / N);   // 邻边静息长度

  /* v653 软体果冻球(恢复软体手感) + 三重防走形保护:
     ① 邻边最长 1.9 倍硬钳制  ② 每点离球心 0.42R~1.55R 硬钳制
     ③ 形状记忆柔拉(松手必然回正圆) —— 无论怎么拽都不可能变成条状回不来 */
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU;
    const x = CX + Math.cos(a) * RING, y = CY + Math.sin(a) * RING;
    pts.push({ x, y, px: x, py: y, dx: Math.cos(a), dy: Math.sin(a) });
  }
  let grab = false, grabIdx = -1;
  const sparkles = [];          // 甩飞时的拖尾星光
  let raf = 0;
  const ptr = { down: false, x: CX, y: CY };

  function centroid() {
    let x = 0, y = 0;
    for (const p of pts) { x += p.x; y += p.y; }
    return { x: x / N, y: y / N };
  }

  function onDown(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    ptr.down = true; ptr.x = p.x; ptr.y = p.y;
    const c = centroid();
    if (Math.hypot(p.x - c.x, p.y - c.y) < RING * 1.5) {
      grab = true;
      let bi = 0, bd = 1e9;
      for (let i = 0; i < N; i++) {
        const d = Math.hypot(p.x - pts[i].x, p.y - pts[i].y);
        if (d < bd) { bd = d; bi = i; }
      }
      grabIdx = bi;
      playSfx('game.ballSquish', { volume: 0.5 });   // 抓住即捏挤
    }
  }
  function onMove(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    const mv = Math.hypot(p.x - ptr.x, p.y - ptr.y);
    ptr.x = p.x; ptr.y = p.y;
    // 拽球时的捏挤音(拖得越快声音越大, 槽位 200ms 节流)
    if (grab && ptr.down && mv > 3.5) playSfx('game.ballSquish', { volume: Math.min(0.9, 0.4 + mv / 28) });
  }
  function onUp() { ptr.down = false; grab = false; grabIdx = -1; }
  cv.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  function physics() {
    const c0 = centroid();
    // 拖拽: 抓住的点限速跟手(像拽一块软糖, 越拽越长, 球心被顺势带过去)
    if (grab && grabIdx >= 0 && ptr.down) {
      const g = pts[grabIdx];
      const tx = Math.max(M, Math.min(GAME_W - M, ptr.x));
      const ty = Math.max(M, Math.min(GAME_H - M, ptr.y));
      const mdx = tx - g.x, mdy = ty - g.y;
      const md = Math.hypot(mdx, mdy);
      if (md > 0.001) {
        const step = Math.min(md, 26);
        g.x += mdx / md * step; g.y += mdy / md * step;
      }
    }
    // verlet 积分 + 极弱回中弹簧(拽多远都会 duangduang 荡回来)
    for (const p of pts) {
      const vx = (p.x - p.px) * 0.985, vy = (p.y - p.py) * 0.985;
      p.px = p.x; p.py = p.y;
      p.x += vx + (CX - c0.x) * 0.012;
      p.y += vy + (CY - c0.y) * 0.012;
    }
    // 约束迭代 ×3
    for (let it = 0; it < 3; it++) {
      const c = centroid();
      // 邻边弹簧(柔) + 超过 1.9 倍静息长度的部分强拉回(硬)
      for (let i = 0; i < N; i++) {
        const a = pts[i], b = pts[(i + 1) % N];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const cap = EDGE * 1.9;
        const k = d > cap ? (d - cap) / d * 0.5 : (d - EDGE) / d * 0.5 * 0.55;
        dx *= k; dy *= k;
        a.x += dx; a.y += dy; b.x -= dx; b.y -= dy;
      }
      // 形状记忆: 往「球心+本征方向×当前平均半径」柔拉(允许整体压扁/拉伸, 但角度必回本位)
      let avg = 0;
      for (const p of pts) avg += Math.hypot(p.x - c.x, p.y - c.y);
      avg /= N;
      const sc = Math.max(0.55, Math.min(1.25, avg / RING));
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        p.x += (c.x + p.dx * RING * sc - p.x) * 0.09;
        p.y += (c.y + p.dy * RING * sc - p.y) * 0.09;
      }
      // 半径硬钳制 + 墙壁反弹 + 速度硬钳制(防爆)
      for (const p of pts) {
        const ddx = p.x - c.x, ddy = p.y - c.y;
        const dd = Math.hypot(ddx, ddy) || 0.0001;
        const cl = Math.max(RING * 0.42, Math.min(RING * 1.55, dd));
        if (Math.abs(cl - dd) > 0.001) { p.x = c.x + ddx / dd * cl; p.y = c.y + ddy / dd * cl; }
        if (p.x < M || p.x > GAME_W - M || p.y < M || p.y > GAME_H - M) {
          const vx = p.x - p.px, vy = p.y - p.py;
          if (p.x < M) { p.x = M; p.px = p.x + vx * 0.72; }
          if (p.x > GAME_W - M) { p.x = GAME_W - M; p.px = p.x + vx * 0.72; }
          if (p.y < M) { p.y = M; p.py = p.y + vy * 0.72; }
          if (p.y > GAME_H - M) { p.y = GAME_H - M; p.py = p.y + vy * 0.72; }
        }
        const svx = p.x - p.px, svy = p.y - p.py;
        const sp = Math.hypot(svx, svy);
        if (sp > 26) { p.px = p.x - svx / sp * 26; p.py = p.y - svy / sp * 26; }
      }
    }
    // 甩得快 → 拖尾星光
    let asp = 0;
    for (const p of pts) asp += Math.hypot(p.x - p.px, p.y - p.py);
    asp /= N;
    if (asp > 5.5 && sparkles.length < 60) {
      const c = centroid();
      sparkles.push({
        x: c.x + (Math.random() - 0.5) * RING * 1.6, y: c.y + (Math.random() - 0.5) * RING * 1.6,
        life: 1, r: 1.2 + Math.random() * 2.4,
      });
    }
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.life -= 0.03;
      if (s.life <= 0) sparkles.splice(i, 1);
    }
  }

  // 平滑闭合曲线(中点二次贝塞尔); k<1 时向球心收缩(叠染层用)
  function bodyPath(k) {
    const c = centroid();
    const P = pts.map(p => ({ x: c.x + (p.x - c.x) * k, y: c.y + (p.y - c.y) * k }));
    ctx.beginPath();
    const mid = (a, b) => [(a.x + b.x) / 2, (a.y + b.y) / 2];
    let m = mid(P[0], P[1]);
    ctx.moveTo(m[0], m[1]);
    for (let i = 1; i <= N; i++) {
      const cur = P[i % N], nx = P[(i + 1) % N];
      const mm = mid(cur, nx);
      ctx.quadraticCurveTo(cur.x, cur.y, mm[0], mm[1]);
    }
    ctx.closePath();
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

    const c = centroid();
    let avgR = 0;
    for (const p of pts) avgR += Math.hypot(p.x - c.x, p.y - c.y);
    avgR /= N;

    // 影子(被拉长/压扁时跟着变宽)
    const wide = Math.max(0.8, Math.min(1.5, RING / avgR));
    ctx.fillStyle = 'rgba(150,120,170,0.15)';
    ctx.beginPath();
    ctx.ellipse(c.x, GAME_H - 26, RING * 0.86 * wide, 9, 0, 0, TAU);
    ctx.fill();

    // v659: 彩虹流转回来了(用户明确要保留) + 整体做成晶莹剔透的泡泡质感
    const hue = (t * 0.018) % 360;

    // 外圈柔光晕(跟随色相)
    ctx.save();
    ctx.shadowColor = `hsla(${(hue + 300) % 360}, 75%, 78%, 0.55)`;
    ctx.shadowBlur = 26;
    bodyPath(1.06);
    ctx.fillStyle = `hsla(${(hue + 300) % 360}, 80%, 88%, 0.35)`;
    ctx.fill();
    ctx.restore();

    // 球体: 半透彩虹对角渐变(泡泡感=透出背景), 色相随时间流转
    const grad = ctx.createLinearGradient(c.x - RING, c.y - RING, c.x + RING, c.y + RING);
    grad.addColorStop(0, `hsla(${(hue + 315) % 360}, 80%, 86%, 0.82)`);
    grad.addColorStop(0.38, `hsla(${(hue + 230) % 360}, 70%, 84%, 0.72)`);
    grad.addColorStop(0.68, `hsla(${(hue + 150) % 360}, 62%, 84%, 0.72)`);
    grad.addColorStop(1, `hsla(${(hue + 70) % 360}, 78%, 82%, 0.82)`);
    bodyPath(1);
    ctx.fillStyle = grad;
    ctx.fill();

    // 内层: 高光 + 虹彩 + 底部反光(全部 clip 在球内)
    ctx.save();
    bodyPath(1); ctx.clip();

    // 虹彩薄膜: 底部一道彩虹弧(泡泡薄膜分光感) —— fillRect 覆盖整球(clip 兜住), 无截断线
    const irid = ctx.createRadialGradient(c.x, c.y + RING * 0.55, RING * 0.1, c.x, c.y + RING * 0.55, RING * 1.05);
    irid.addColorStop(0, `hsla(${(hue + 40) % 360}, 85%, 78%, 0.4)`);
    irid.addColorStop(0.35, `hsla(${(hue + 160) % 360}, 80%, 80%, 0.3)`);
    irid.addColorStop(0.7, `hsla(${(hue + 270) % 360}, 80%, 82%, 0.22)`);
    irid.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = irid;
    ctx.fillRect(c.x - RING, c.y - RING, RING * 2, RING * 2);

    // 左上大高光(水润感的核心) —— 渐变半径与椭圆长轴一致, 边缘 alpha 到 0 不出硬边
    const hg = ctx.createRadialGradient(c.x - RING * 0.34, c.y - RING * 0.42, 2, c.x - RING * 0.34, c.y - RING * 0.42, RING * 0.58);
    hg.addColorStop(0, 'rgba(255,255,255,0.95)');
    hg.addColorStop(0.72, 'rgba(255,255,255,0.34)');
    hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(c.x - RING * 0.28, c.y - RING * 0.36, RING * 0.56, RING * 0.4, -0.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(c.x - RING * 0.38, c.y - RING * 0.44, RING * 0.2, RING * 0.09, -0.5, 0, TAU);
    ctx.fill();
    // 右下透光(半透泡泡的透亮处) —— 渐变半径与椭圆长轴一致, 边缘 alpha 到 0 不出硬边
    const rg = ctx.createRadialGradient(c.x + RING * 0.4, c.y + RING * 0.44, 2, c.x + RING * 0.4, c.y + RING * 0.44, RING * 0.4);
    rg.addColorStop(0, 'rgba(255,255,255,0.45)');
    rg.addColorStop(0.7, 'rgba(255,255,255,0.16)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.ellipse(c.x + RING * 0.38, c.y + RING * 0.42, RING * 0.36, RING * 0.2, 0.6, 0, TAU);
    ctx.fill();
    ctx.restore();

    // 边缘光: 内侧一圈亮边(泡泡薄膜的边缘比中间亮)
    bodyPath(0.94);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // 一颗小星点(高光旁)
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(c.x + RING * 0.06, c.y - RING * 0.5, 2, 0, TAU); ctx.fill();

    // 轮廓(白描边 + 色相细边, 饱满圆润)
    bodyPath(1);
    ctx.strokeStyle = `hsla(${(hue + 290) % 360}, 70%, 88%, 0.9)`;
    ctx.lineWidth = 3.4;
    ctx.stroke();

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
    ctx.font = '500 13px "LXGW WenKai", sans-serif';
    ctx.fillStyle = 'rgba(90,75,120,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('拽住小球随便拉 · 松手 duang 地弹回来 · 永远不会变形走样', CX, GAME_H - 10);
  }

  function loop() {
    const now = performance.now();
    physics();
    render(now);
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(loop);
  }
  loop();

  // v51 测试钩子(保留接口: center/avgR/restR/grab/bubbles/fling)
  window._tug = {
    get center() { const c = centroid(); return { x: c.x, y: c.y }; },
    get avgR() { const c = centroid(); let s = 0; for (const p of pts) s += Math.hypot(p.x - c.x, p.y - c.y); return s / N; },
    get restR() { return RING; },
    get grab() { return grab; },
    get bubbles() { return sparkles.length; },
    fling(vx, vy) { if (!grab) for (const p of pts) { p.px -= vx; p.py -= vy; } },
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
  preloadLoopSound('game.blow');   // v734: 进游戏就预取解码, 首按不等 fetch(治"泡泡都出来了声音还没进来")
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
    ctx.font = '500 13px "LXGW WenKai", sans-serif';
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

/* ---------- 游戏: 做蛋糕(v652) 倒面糊 → 进烤箱 → 挤奶油 → 摆水果点蜡烛 ---------- */
function buildCake(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const TAU = Math.PI * 2;
  const CX = GAME_W / 2, TBL = 342;
  const R = 118, HGT = 72;
  const CTY = TBL - HGT;                 // 顶面中心 y
  const floats = [];
  let step = 1, stepDone = false;
  let batter = 0, lastPour = 0;
  let baking = false, bakeP = 0, baked = false, lastBakeSfx = 0;
  const ICINGS = [
    { name: '草莓奶油', color: '#F6B3CB' },
    { name: '香草奶油', color: '#FBF2E0' },
    { name: '抹茶奶油', color: '#B7D8A6' },
    { name: '巧克力',   color: '#8A5A3C' },
  ];
  let icingSel = 0, cover = 0, lastSauce = 0;
  /* v701 奶油声跟随: 循环音源, 落笔开/停手或滑出蛋糕 120ms 内急收(fade 0.12s), 不再靠 90ms 重复触发堆尾巴 */
  let icingLoopNodes = null, icingLoopWait = false, icingLoopStopReq = false, lastIcingAt = 0;
  function icingLoopKill(n, fade) {   // 快速渐弱 → 真停 → 断连(比全局 smoothStop 的 0.35s 更跟手)
    if (!n) return;
    _loopRelease(n);   // v728: 自定义停止路径也要从"待复活"名单摘除, 否则切后台回来会自己响
    try {
      const t = n.ctx.currentTime, g = n.master && n.master.gain;
      if (g) { const cur = (typeof g.value === 'number') ? g.value : 0.32; g.cancelScheduledValues(t); g.setValueAtTime(cur, t); g.linearRampToValueAtTime(0.0001, t + fade); }
    } catch (e) {}
    setTimeout(() => {
      try { (n.stops || []).forEach(f => f()); if (n.stop) n.stop(); } catch (e) {}
      try { if (n.master) n.master.disconnect(); } catch (e) {}
    }, fade * 1000 + 40);
  }
  function icingLoopStart() {
    lastIcingAt = performance.now();
    if (icingLoopNodes || icingLoopWait) return;
    icingLoopWait = true; icingLoopStopReq = false;
    startLoopSound('game.icingLoop').then(n => {
      icingLoopWait = false;
      if (!n) return;   // 没音源(懒加载失败) → 静默
      if (icingLoopStopReq || performance.now() - lastIcingAt > 120) { icingLoopKill(n, 0.05); return; }
      try {   // 循环槽默认 ramp 到 0.6, 奶油声压到 0.32(与原 game.sauce 同响度)
        const t = n.ctx.currentTime, g = n.master.gain;
        g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0.32, t + 0.08);
      } catch (e) {}
      icingLoopNodes = n;
    });
  }
  function icingLoopStop() {
    const n = icingLoopNodes; icingLoopNodes = null;
    if (n) icingLoopKill(n, 0.12);
    else if (icingLoopWait) icingLoopStopReq = true;   // 还在加载就先记停, 到手即杀
  }
  const icing = [];
  const icingGrid = new Set();
  let icingTarget = 0;
  let icingRun = 0, icingRunLast = null;   // v654: 画笔连续涂抹(同一笔的 run)
  // v679: 奶油离屏增量渲染 —— 暗边/主体/高光各一张层图, 新笔画增量画上去, 每帧只 drawImage。
  // 之前每帧把所有历史笔画全部重建路径重描 3 遍, 笔画越多越卡=不丝滑的元凶; 增量后与剪纸/画画同款手感
  const IBOX = { x: CX - 156, y: 184, w: 312, h: 188 };   // 蛋糕奶油包围盒(省内存, 不用整块画布) — v680: 下缘扩到 372, 装下底缘外凸弧上的笔画(之前 348 截掉底部笔画)
  let icL = null;
  let skirtCol = null;                                     // v679: 裙边颜色定格, 换奶油色不再跟着变
  function icingLayers(tier) {
    if (!icL) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      icL = {};
      [1, 2].forEach(t => {
        icL[t] = {};
        ['d', 'b', 'h'].forEach(k => {
          const c = document.createElement('canvas');
          c.width = IBOX.w * dpr; c.height = IBOX.h * dpr;
          const g = c.getContext('2d');
          g.scale(dpr, dpr); g.translate(-IBOX.x, -IBOX.y);
          icL[t][k] = { cv: c, g };
        });
      });
    }
    return icL[tier];
  }
  function icingPaint(tier, prev, p, col) {   // 一小段(≤3px)增量画进三层
    const L = icingLayers(tier);
    const passes = [
      { o: L.d, w: 24, oy: 2, col: _wcDarken(col, 0.14), dot: 12 },
      { o: L.b, w: 21, oy: 0, col, dot: 10.5 },
      { o: L.h, w: 8, oy: -4.5, col: _wcRgba(_wcMix(col, '#FFFFFF', 0.5), 0.85), dot: 0 },
    ];
    for (const ps of passes) {
      if (!prev) {
        if (!ps.dot) continue;   // 起笔圆点: 只有暗边+主体, 高光留给后续笔画
        ps.o.g.fillStyle = ps.col;
        ps.o.g.beginPath(); ps.o.g.arc(p.x, p.y + ps.oy, ps.dot, 0, Math.PI * 2); ps.o.g.fill();
      } else {
        ps.o.g.strokeStyle = ps.col; ps.o.g.lineWidth = ps.w;
        ps.o.g.lineCap = 'round'; ps.o.g.lineJoin = 'round';
        ps.o.g.beginPath();
        ps.o.g.moveTo(prev.x, prev.y + ps.oy);
        ps.o.g.lineTo(p.x, p.y + ps.oy);
        ps.o.g.stroke();
      }
    }
  }
  let tier2 = false;                       // v674: 双层蛋糕
  let wish = 0, wishT0 = 0, dim = 0;       // v654: 关灯许愿 0=未开始 1=许愿中 2=生日快乐
  // v691: 全部蜡烛点亮 → 播生日快乐歌(用户原曲, 仅转码零加工); v708 改走 WebAudio(老 iOS 可靠), 结尾 3s 淡出
  function playBdaySong() { playSongBgm('birthday-bounce.mp3', 0.9); }
  function stopBdaySong() { stopSongBgm(); }
  const confetti = [];
  const DECOS = [
    { key: 'strawberry', name: '🍓 草莓' },
    { key: 'blueberry',  name: '🫐 蓝莓' },
    { key: 'cherry',     name: '🍒 樱桃' },
    { key: 'sprinkle',   name: '✨ 糖珠' },
  ];
  let decoSel = 'strawberry';
  const decos = [];
  // v656: 蜡烛 —— 淡色随机配色(每局都不同), 加粗+斜纹质感; 点装饰完成后自动插入
  const CANDLE_PASTELS = [
    { name: '樱粉', body: '#F7E3EA', stripe: '#F0C3D3' },
    { name: '薄荷', body: '#EAF3E3', stripe: '#C4DEB6' },
    { name: '奶黄', body: '#FBF2DA', stripe: '#F0DDA9' },
    { name: '雾蓝', body: '#E8EEF7', stripe: '#C2D4EA' },
    { name: '香芋', body: '#F2EBF8', stripe: '#DAC6EC' },
    { name: '奶杏', body: '#FBF1E7', stripe: '#EFDCC6' },
  ];
  const CW = 14, CH = 48, CINS = 16;       // v658: 蜡烛再粗一截; CINS=插进蛋糕里的深度(真插进去, 不是浮在表面)
  const LIGHT_START = 900, LSEG = 470;     // 关灯后点火时序: 先暗下来, 再逐根点亮
  const flames = [];
  let lastT = performance.now(), raf = 0;
  const ptr = { down: false, x: CX, y: CTY };

  // 奶油覆盖目标格数(顶面椭圆 + 上侧带) — v676: 与椭圆落点判定同步, 后缘月牙也算进度
  (function calcTarget() {
    const CELL = 10;
    const ry = R * 0.24, top = TBL - HGT;
    for (let gy = -ry - 4; gy < 46; gy += CELL) {
      for (let gx = -R; gx <= R; gx += CELL) {
        const dy = gy;
        const inTop = (gx * gx) / (R * R) + (dy * dy) / (ry * ry) <= 1.15;   // 顶面(含后缘)
        const k = Math.abs(gy) < 30 ? 1 : 0.45;                              // 侧面带算半宽
        const inSide = dy > 0 && Math.abs(gx) <= R * k;
        if (inTop || inSide) icingTarget++;
      }
    }
  })();

  const status = document.createElement('span');
  status.className = 'game-status';
  stage.appendChild(status);
  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  stage.appendChild(tools);
  function setStatus(t) { status.textContent = t; }
  function float(x, y, text, color, life) { floats.push({ x, y, text, color: color || '#E58FAD', life: life || 1.2 }); }
  function toNext(ns, msg) { step = ns; stepDone = false; float(CX, CTY - 70, msg, '#E58FAD', 1.4); renderTools(); }

  /* v674: 双层蛋糕几何 —— 烤的时候胚体微微膨胀(ex), 上层坐在下层顶面上 */
  function tier1Geom() {
    const ex = 1 + 0.08 * bakeP;
    const bh = HGT * Math.min(1, Math.max(batter, 0)) * ex;   // v675b: 修复 Math.max(batter,1) 导致倒面糊过程消失(面糊>0 就满杯)
    return { R: R * ex, top: TBL - bh, base: TBL };
  }
  function tier2Geom() {
    const t1 = tier1Geom();
    const R2 = t1.R * 0.62, H2 = 34;
    const base = t1.top - 7;
    return { R: R2, top: base - H2, base };
  }
  /* v674: 奶油/装饰落点 → 0=没落在蛋糕上 1=下层 2=上层(双层时)
     v676: 顶面按椭圆精确判定 —— 之前是矩形判定, 顶面后缘月牙形区域点了也不显示(涂不满的真凶) */
  function icingHit(x, y) {
    if (tier2) {
      const t2 = tier2Geom();
      const ry2 = t2.R * 0.24, dy2 = y - t2.top;
      if (dy2 >= -ry2 - 2 && dy2 <= ry2 && ((x - CX) * (x - CX)) / (t2.R * t2.R) + (dy2 * dy2) / (ry2 * ry2) <= 1.08) return 2;
      // v680: 侧面+底缘外凸弧(胚体底缘比 base 再往下鼓 14px, 之前只认到 base+2 → 那一圈永远涂不上=「下面一块涂不上」真凶)
      if (Math.abs(x - CX) <= t2.R * 0.98 && y > t2.top && y <= t2.base + 15) return 2;
    }
    const t1 = tier1Geom();
    const ry1 = t1.R * 0.24, dy1 = y - t1.top;
    if (dy1 >= -ry1 - 2 && dy1 <= ry1 && ((x - CX) * (x - CX)) / (t1.R * t1.R) + (dy1 * dy1) / (ry1 * ry1) <= 1.08) return 1;
    if (Math.abs(x - CX) <= t1.R * 0.96 && y > t1.top && y <= TBL + 15) return 1;   // v680: 下层底缘外凸弧也能涂
    return 0;
  }

  /* ---------- 工具条 ---------- */
  function renderTools() {
    tools.innerHTML = '';
    const mkRow = () => { const r = document.createElement('div'); r.className = 'st-row'; tools.appendChild(r); return r; };
    if (stepDone && step <= 4) {
      const msgs = { 1: '下一步 · 进烤箱 →', 2: '下一步 · 挤奶油 →', 3: '下一步 · 摆水果 →' };
      const row = mkRow();
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = msgs[step];
      b.addEventListener('click', e => {
        e.stopPropagation();
        if (step === 1) toNext(2, '面糊倒好啦, 送进烤箱!');
        else if (step === 2) toNext(3, '烤得金黄喷香, 挤奶油吧');
        else if (step === 3) toNext(4, '奶油铺好啦, 装饰起来 ✦');
      });
      row.appendChild(b);
    }
    if (step === 2 && !baking && !baked) {
      const row = mkRow();
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '🔥 进烤箱';
      b.addEventListener('click', e => { e.stopPropagation(); baking = true; renderTools(); });
      row.appendChild(b);
    }
    if (step === 3) {
      const row = mkRow();
      ICINGS.forEach((ic, i2) => {
        const chip = document.createElement('button');
        chip.type = 'button'; chip.className = 'st-chip' + (i2 === icingSel ? ' active' : '');
        chip.innerHTML = '<i class="st-dotc" style="--c:' + ic.color + '"></i>' + ic.name;
        chip.addEventListener('click', e => { e.stopPropagation(); icingSel = i2; icingRun++; icingRunLast = null; renderTools(); });
        row.appendChild(chip);
      });
      // v674: 双层蛋糕 —— 加一层, 上面也能涂奶油/摆装饰
      if (!tier2) {
        const rowAdd = mkRow();
        const add2 = document.createElement('button');
        add2.type = 'button'; add2.className = 'st-chip fire-chip'; add2.textContent = '🎂 加一层';
        add2.addEventListener('click', e => {
          e.stopPropagation();
          tier2 = true;
          float(CX, CTY - 70, '双层蛋糕! 上面也能涂奶油 ✦', '#E58FAD', 1.4);
          renderTools();
        });
        rowAdd.appendChild(add2);
      }
    }
    if (step === 4) {
      const row = mkRow();
      DECOS.forEach(d => {
        const chip = document.createElement('button');
        chip.type = 'button'; chip.className = 'st-chip' + (d.key === decoSel ? ' active' : '');
        chip.textContent = d.name;
        chip.addEventListener('click', e => { e.stopPropagation(); decoSel = d.key; renderTools(); });
        row.appendChild(chip);
      });
      // v654: 自由装饰 —— 玩家觉得 OK 就点完成; v656: 点完自动插蜡烛
      const row2 = mkRow();
      const fin = document.createElement('button');
      fin.type = 'button'; fin.className = 'st-chip fire-chip'; fin.textContent = '✅ 装饰完成';
      fin.addEventListener('click', e => { e.stopPropagation(); startCandles(); });
      row2.appendChild(fin);
    }
    if (step === 5) {
      if (wish === 0) {
        const row = mkRow();
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '🌙 关灯许愿';
        b.addEventListener('click', e => { e.stopPropagation(); wish = 1; wishT0 = performance.now(); renderTools(); });   // v691: 去掉 chime 音效, 只留生日歌
        row.appendChild(b);
      }
      if (wish === 2) {
        const row = mkRow();
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '🔄 重新做一个';
        b.addEventListener('click', e => { e.stopPropagation(); resetGame(); });
        row.appendChild(b);
      }
    }
  }

  /* ---------- 指针 ---------- */
  function onDown(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    ptr.down = true; ptr.x = p.x; ptr.y = p.y;
    if (step === 1 && p.x > CX - R && p.x < CX + R && p.y > CTY - 80 && p.y < TBL) return;   // 倒面糊区
    const hit = (step === 3 || step === 4) ? icingHit(p.x, p.y) : 0;
    if (hit) {
      if (step === 3) { icingRun++; icingRunLast = null; addIcing(p.x, p.y, hit); }
      else addDeco(p.x, p.y, hit);
    }
  }
  function onMove(e) {
    // v678: 触屏采样合并事件(iOS/Safari pointermove 稀疏, 用 getCoalescedEvents 补齐中间点=丝滑)
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    for (const ev of evs) {
      const p = canvasPos(cv, ev, GAME_W, GAME_H);
      ptr.x = p.x; ptr.y = p.y;
      if (ptr.down && step === 3) {
        const hit = icingHit(p.x, p.y);
        if (hit) addIcing(p.x, p.y, hit);
      }
      if (ptr.down && step === 4) {   // v749: 水果滑动放置(跟披萨一样)
        const hit = icingHit(p.x, p.y);
        if (hit) addDeco(p.x, p.y, hit);
      }
    }
  }
  function onUp() { ptr.down = false; icingRunLast = null; addDeco._last = null; icingLoopStop(); }
  cv.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  function addIcing(x, y, tier) {
    tier = tier || 1;
    // 大跳变(划出蛋糕又划回来) → 断开重开一笔, 根治"一条直线"横穿
    if (icingRunLast && Math.hypot(x - icingRunLast.x, y - icingRunLast.y) > 80) {
      icingRun++; icingRunLast = null;
    }
    const col = ICINGS[icingSel].color;
    // v679: 3px 插值 + 极微抖动; 不再限时节流 —— 每个触摸采样点(含合并事件)都画, 连贯不断线
    const pts = [];
    if (icingRunLast) {
      const d = Math.hypot(x - icingRunLast.x, y - icingRunLast.y);
      const n = Math.max(1, Math.round(d / 3));
      for (let i = 1; i <= n; i++) {
        pts.push({
          x: icingRunLast.x + (x - icingRunLast.x) * i / n + (Math.random() - 0.5) * 0.8,
          y: icingRunLast.y + (y - icingRunLast.y) * i / n + (Math.random() - 0.5) * 0.8,
        });
      }
    } else pts.push({ x, y });
    for (const p of pts) {
      icing.push({ x: p.x, y: p.y, c: col, run: icingRun, tier });
      icingPaint(tier, icingRunLast, p, col);   // 增量上屏(离屏三层)
      icingRunLast = { x: p.x, y: p.y };
      const gk = Math.round((p.x - CX) / 10) + ':' + Math.round((p.y - CTY) / 10);
      if (!icingGrid.has(gk)) { icingGrid.add(gk); cover = Math.min(1, icingGrid.size / icingTarget); }
    }
    if (cover >= 0.62 && !stepDone && step === 3) { stepDone = true; float(CX, CTY - 70, '奶油铺满啦!', '#E58FAD', 1.3); renderTools(); }
    const now = performance.now();
    lastIcingAt = now;   // v701: 只要有新笔画就喂"活着"时间戳
    icingLoopStart();    // v701: 落笔/继续涂 → 循环音(已在响则跳过)
  }
  function addDeco(x, y, hit) {
    const now = performance.now();
    if (now - (addDeco._t || 0) < 120) return;
    addDeco._t = now;
    // v749: 滑动放置时按距离去重(拖太快也不会挤成一坨)
    if (addDeco._last && Math.hypot(x - addDeco._last.x, y - addDeco._last.y) < 24) return;
    addDeco._last = { x, y };
    // v674: 装饰顶面/侧面都随便摆(一直摆到桌沿); 双层时按落点自动分上/下层
    let yy;
    if (hit === 2) {
      const t2 = tier2Geom();
      yy = Math.min(Math.max(y, t2.top - 12), t2.base + 12);   // v680: 底缘外凸弧上也能摆
    } else {
      yy = Math.min(Math.max(y, CTY - 24), TBL - 12);
    }
    decos.push({ key: decoSel, x, y: yy, tier: hit || 1, rot: (Math.random() - 0.5) * 0.5, s: 0.9 + Math.random() * 0.25, born: now });
    playSfx('game.sprinkle', { volume: 0.7 });
  }
  // v656: 装饰完成 → 自动插蜡烛(掉落插入动画, 每局随机淡色); v658: 只插一根, 居中
  function startCandles() {
    step = 5; stepDone = false;
    const col = CANDLE_PASTELS[(Math.random() * CANDLE_PASTELS.length) | 0];   // 每次做蛋糕颜色都不同
    const now = performance.now();
    const t2 = tier2 ? tier2Geom() : null;
    decos.push({
      key: 'candle',
      x: CX + (Math.random() - 0.5) * (t2 ? 8 : 10),
      y: t2 ? t2.top + CINS : CTY + CINS,   // v674: 双层时插在上层顶面
      rot: (Math.random() - 0.5) * 0.07,
      s: 1,
      born: now,
      col: col.body, stripe: col.stripe,
      drop: true, dropDelay: 0,
      lit: false,
    });
    float(CX, CTY - 70, '蜡烛来啦, 马上插上 🕯️', '#E58FAD', 1.5);
    renderTools();
  }
  function resetGame() {
    stopBdaySong();   // v691: 重做时停生日歌
    step = 1; stepDone = false; batter = 0; baking = false; bakeP = 0; baked = false;
    icing.length = 0; icingGrid.clear(); cover = 0; decos.length = 0; flames.length = 0;
    icingRun++; icingRunLast = null; wish = 0; dim = 0; confetti.length = 0;
    tier2 = false;
    icL = null; skirtCol = null;   // v679: 清奶油离屏层 + 裙边颜色解冻
    renderTools();
  }

  /* ---------- 更新 ---------- */
  function update(dt) {
    if (step === 1 && ptr.down && batter < 1) {
      batter = Math.min(1, batter + dt * 0.28);
      const now = performance.now();
      if (now - lastPour > 300) { playSfx('game.slimePour', { volume: 0.5 }); lastPour = now; }
      if (batter >= 1 && !stepDone) { stepDone = true; float(CX, CTY - 70, '面糊满啦!', '#E58FAD', 1.2); renderTools(); }
    }
    if (baking && !baked) {
      bakeP = Math.min(1, bakeP + dt / 3.4);   // v674: 烤制提速(约 3.4 秒, 之前 8 秒太久)
      const now = performance.now();
      if (now - lastBakeSfx > 900) { playSfx('game.bake', { volume: 0.55 }); lastBakeSfx = now; }
      if (Math.random() < dt * 6) flames.push({ x: CX + (Math.random() - 0.5) * 220, y: TBL + 6, vy: -(30 + Math.random() * 40), life: 1, r: 2 + Math.random() * 3 });
      if (bakeP >= 1) { baking = false; baked = true; stepDone = true; float(CX, CTY - 70, '烤好啦, 好香!', '#E58FAD', 1.4); renderTools(); }
    }
    for (let i = flames.length - 1; i >= 0; i--) {
      const f = flames[i];
      f.y += f.vy * dt; f.life -= dt * 1.4;
      if (f.life <= 0) flames.splice(i, 1);
    }
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= dt; f.y -= dt * 26;
      if (f.life <= 0) floats.splice(i, 1);
    }
    // v654: 关灯许愿流程 + 生日彩屑
    // v656: 关灯后有人依次点燃蜡烛(火种飞行) → 全亮后进生日快乐
    const nowU = performance.now();
    const candlesU = decos.filter(d => d.key === 'candle');
    for (const d of candlesU) {
      if (d.drop && !d.landed) {
        const p = (nowU - d.born - d.dropDelay) / 420;
        if (p >= 1) { d.landed = true; playSfx('game.sprinkle', { volume: 0.5 }); }
      }
    }
    if (wish === 1) {
      const tU = nowU - wishT0;
      candlesU.forEach((d, i) => {
        const arrive = LIGHT_START + i * LSEG + LSEG * 0.55;
        if (!d.lit && tU >= arrive) { d.lit = true; playSfx('game.sprinkle', { volume: 0.6 }); float(d.x, d.y - CH - 26, '✨', '#F6B33C', 0.8); }
      });
      if (candlesU.length && tU > LIGHT_START + candlesU.length * LSEG + 1100) { wish = 2; wishT0 = nowU; playBdaySong(); renderTools(); }
    }
    dim += ((wish ? 0.58 : 0) - dim) * Math.min(1, dt * 2.6);
    if (wish === 2 && confetti.length < 90 && Math.random() < dt * 46) {
      const cols = ['#F6B3CB', '#F6B33C', '#7FBF7A', '#6E8FC9', '#F2EFAF', '#C9B7E8'];
      confetti.push({ x: Math.random() * GAME_W, y: -8, vy: 46 + Math.random() * 66, vx: (Math.random() - 0.5) * 26, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 5, c: cols[(Math.random() * 6) | 0], w: 5 + Math.random() * 4, h: 3 + Math.random() * 3, sw: Math.random() * TAU });
    }
    for (let i = confetti.length - 1; i >= 0; i--) {
      const f = confetti[i];
      f.sw += dt * 3;
      f.x += (f.vx + Math.sin(f.sw) * 18) * dt;
      f.y += f.vy * dt;
      f.rot += f.vr * dt;
      if (f.y > GAME_H + 16) { if (wish === 2) { f.y = -8; f.x = Math.random() * GAME_W; } else confetti.splice(i, 1); }
    }
  }

  /* ---------- 绘制 ---------- */
  function cakeColor(top) {   // 面糊/烤色 — v674: 烤成金黄喷香, 不再发棕发深
    if (!baked) return top ? '#F3DCBC' : '#EED2AC';
    const t = bakeP;
    return top ? 'rgb(' + Math.round(243 - 6 * t) + ',' + Math.round(220 - 30 * t) + ',' + Math.round(188 - 72 * t) + ')'
               : 'rgb(' + Math.round(238 - 12 * t) + ',' + Math.round(210 - 34 * t) + ',' + Math.round(172 - 72 * t) + ')';
  }
  function drawStrawberry(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-11, 3, -9, -8, 0, -8);
    ctx.bezierCurveTo(9, -8, 11, 3, 0, 9);
    ctx.fillStyle = '#E4586B'; ctx.fill();
    ctx.strokeStyle = 'rgba(140,40,55,0.5)'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = '#5F8F63'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(-3, -13); ctx.moveTo(0, -8); ctx.lineTo(3, -13); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    [[-3, -2], [3, 0], [0, 4]].forEach(q => { ctx.beginPath(); ctx.arc(q[0], q[1], 0.9, 0, TAU); ctx.fill(); });
    ctx.restore();
  }
  function drawBlueberry(x, y, s) {
    ctx.beginPath(); ctx.arc(x, y, 6 * s, 0, TAU);
    ctx.fillStyle = '#4C6BB2'; ctx.fill();
    ctx.strokeStyle = 'rgba(30,45,90,0.55)'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.strokeStyle = '#22355F'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * TAU / 5;
      ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 2.6 * s, y + Math.sin(a) * 2.6 * s);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(x - 2 * s, y - 2 * s, 1.4 * s, 0, TAU); ctx.fill();
  }
  function drawCherry(x, y, s) {
    ctx.strokeStyle = '#7A4A32'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y - 5 * s); ctx.quadraticCurveTo(x + 3 * s, y - 13 * s, x + 6 * s, y - 14 * s); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 6 * s, 0, TAU);
    ctx.fillStyle = '#C93A50'; ctx.fill();
    ctx.strokeStyle = 'rgba(120,25,40,0.55)'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.arc(x - 2 * s, y - 2 * s, 1.6 * s, 0, TAU); ctx.fill();
  }
  function drawDeco(d) {
    const pop = Math.min(1, (performance.now() - d.born) / 180);
    const s = d.s * (0.6 + 0.4 * pop);
    if (d.key === 'strawberry') drawStrawberry(d.x, d.y, s);
    else if (d.key === 'blueberry') drawBlueberry(d.x, d.y, s);
    else if (d.key === 'cherry') drawCherry(d.x, d.y, s);
    else if (d.key === 'sprinkle') {
      const cols = ['#F6B33C', '#E4586B', '#7FBF7A', '#6E8FC9', '#F2EFAF'];
      ctx.fillStyle = cols[(d.x | 0) % 5];
      ctx.beginPath(); ctx.arc(d.x, d.y, 2.4 * s, 0, TAU); ctx.fill();
    } else if (d.key === 'candle') {
      // v656: 加粗蜡烛 —— 淡色随机+斜纹质感, 掉落插入动画
      const now2 = performance.now();
      const pop = Math.min(1, (now2 - d.born) / 180);
      let yOff = 0, alpha = 0.35 + 0.65 * pop;
      if (d.drop) {
        const p = Math.min(1, Math.max(0, (now2 - d.born - d.dropDelay) / 420));
        yOff = -90 * (1 - p * p);          // 加速落下
        alpha = Math.min(1, 0.2 + p * 3);
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      // v658: 表面插入口 —— 先画个深色小洞, 蜡烛从洞里长出来(真插进去, 不是浮在表面); v674: 跟随蜡烛实际位置(双层时在上层)
      const ey = d.y - 6;
      ctx.fillStyle = 'rgba(94,64,46,0.38)';
      ctx.beginPath(); ctx.ellipse(d.x, ey, CW / 2 + 4, 4.6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(58,36,26,0.55)';
      ctx.beginPath(); ctx.ellipse(d.x, ey, CW / 2 + 0.8, 2.8, 0, 0, TAU); ctx.fill();
      ctx.translate(d.x, d.y + yOff);
      ctx.rotate(d.rot);
      // 只画露出蛋糕表面以上的部分 —— 底部 16px 埋在蛋糕体内
      ctx.beginPath();
      ctx.rect(-CW - 10, -CH - 40, CW * 2 + 20, CH + 34);
      ctx.clip();
      const cbg = ctx.createLinearGradient(-CW / 2, 0, CW / 2, 0);
      cbg.addColorStop(0, _wcDarken(d.col, 0.14));
      cbg.addColorStop(0.34, _wcMix(d.col, '#FFFFFF', 0.4));
      cbg.addColorStop(0.72, d.col);
      cbg.addColorStop(1, _wcDarken(d.col, 0.2));
      ctx.fillStyle = cbg;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-CW / 2, -CH, CW, CH, 3.4) : ctx.rect(-CW / 2, -CH, CW, CH);
      ctx.fill();
      ctx.strokeStyle = 'rgba(150,120,110,0.35)'; ctx.lineWidth = 1; ctx.stroke();
      // 斜纹质感(螺纹蜡烛)
      ctx.save();
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-CW / 2, -CH, CW, CH, 3.4) : ctx.rect(-CW / 2, -CH, CW, CH);
      ctx.clip();
      ctx.strokeStyle = d.stripe; ctx.lineWidth = 3.6; ctx.lineCap = 'round';
      ctx.globalAlpha = alpha * 0.75;
      ctx.beginPath();
      for (let sy = -CH + 3; sy < 4; sy += 7) {
        ctx.moveTo(-CW / 2 - 1, sy);
        ctx.lineTo(CW / 2 + 1, sy - 3.4);
      }
      ctx.stroke();
      ctx.restore();
      // 竖向光泽(奶油感)
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-CW / 2 + 2.2, -CH + 4); ctx.lineTo(-CW / 2 + 2.2, -5); ctx.stroke();
      // 顶部蜡面
      ctx.fillStyle = _wcMix(d.col, '#FFFFFF', 0.55);
      ctx.beginPath(); ctx.ellipse(0, -CH, CW / 2 - 0.4, 2.3, 0, 0, TAU); ctx.fill();
      // 烛芯
      ctx.strokeStyle = '#5A4638'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -CH); ctx.lineTo(0, -CH - 4.5); ctx.stroke();
      // 火苗
      if (d.lit) {
        const fl = Math.sin(now2 / 90 + d.born) * 1.4;
        const fy = -CH - 10;
        const g = ctx.createRadialGradient(0, fy, 1, 0, fy, 13 + dim * 20);
        g.addColorStop(0, 'rgba(255,220,130,0.9)');
        g.addColorStop(1, 'rgba(255,180,60,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, fy, 13, 0, TAU); ctx.fill();
        ctx.fillStyle = '#F6A93C';
        ctx.beginPath(); ctx.ellipse(fl * 0.4, fy, 2.8, 5.6 + fl, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#FDE9B8';
        ctx.beginPath(); ctx.ellipse(fl * 0.4, fy + 1, 1.2, 2.7, 0, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  function render(t) {
    // 背景: 奶油粉厨房
    const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
    bg.addColorStop(0, '#FDF6F0'); bg.addColorStop(1, '#F6E3E8');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(90, 80, 40, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(470, 60, 26, 0, TAU); ctx.fill();
    // v654: 圆点墙纸 + 顶部奶油色小彩旗串
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    for (let ry = 30; ry < TBL - 30; ry += 46) {
      for (let rx = (ry / 46) % 2 ? 24 : 48; rx < GAME_W; rx += 48) {
        ctx.beginPath(); ctx.arc(rx, ry, 3.2, 0, TAU); ctx.fill();
      }
    }
    const flagCols = ['#F6B3CB', '#FBF2E0', '#B7D8A6', '#F3D9A6', '#C9B7E8'];
    ctx.strokeStyle = 'rgba(180,140,150,0.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-4, 30); ctx.quadraticCurveTo(CX, 56, GAME_W + 4, 30); ctx.stroke();
    for (let i = 0; i < 10; i++) {
      const fx = 18 + i * 60;
      const fy = 30 + Math.sin(Math.PI * fx / GAME_W) * 24;
      ctx.fillStyle = flagCols[i % 5];
      ctx.beginPath();
      ctx.moveTo(fx - 9, fy); ctx.lineTo(fx + 9, fy); ctx.lineTo(fx, fy + 17);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(170,120,130,0.28)'; ctx.lineWidth = 1; ctx.stroke();
    }
    // 桌面(v654: 木纹渐变)
    const woodG = ctx.createLinearGradient(0, TBL + 12, 0, GAME_H);
    woodG.addColorStop(0, '#ECD2B0');
    woodG.addColorStop(1, '#DEBA92');
    ctx.fillStyle = woodG;
    ctx.fillRect(0, TBL + 12, GAME_W, GAME_H - TBL + 20);
    ctx.fillStyle = 'rgba(120,80,50,0.18)';
    ctx.fillRect(0, TBL + 12, GAME_W, 4);
    // 倒面糊的碗影
    ctx.fillStyle = 'rgba(120,80,60,0.12)';
    ctx.beginPath(); ctx.ellipse(CX, TBL + 10, R + 14, 10, 0, 0, TAU); ctx.fill();

    // 烤箱背板(烤的时候); OVEN/WIN 存给前面板用
    const OVEN = { x: CX - 170, y: 96, w: 340, h: 268, r: 18 };
    const WIN = { x: CX - 104, y: 236, w: 208, h: 124, r: 14 };
    if (baking) {
      ctx.fillStyle = 'rgba(60,45,50,0.86)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(OVEN.x, OVEN.y, OVEN.w, OVEN.h, OVEN.r); else ctx.rect(OVEN.x, OVEN.y, OVEN.w, OVEN.h);
      ctx.fill();
      ctx.strokeStyle = '#8A6470'; ctx.lineWidth = 5; ctx.stroke();
    }

    // v654: 白瓷盘托底
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath(); ctx.ellipse(CX, TBL + 9, R + 34, 18, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(150,120,140,0.28)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = 'rgba(210,190,200,0.35)';
    ctx.beginPath(); ctx.ellipse(CX, TBL + 9, R + 20, 12, 0, 0, TAU); ctx.fill();

    // 模具(未烤好时) / 纸托
    if (step <= 2) {
      ctx.fillStyle = '#C9CBD4';
      ctx.beginPath();
      ctx.moveTo(CX - R - 10, CTY - 4);
      ctx.lineTo(CX - R - 4, TBL + 6);
      ctx.lineTo(CX + R + 4, TBL + 6);
      ctx.lineTo(CX + R + 10, CTY - 4);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(90,95,110,0.5)'; ctx.lineWidth = 2; ctx.stroke();
    } else {
      // 烤好脱模: 纸托裙边(v675: 跟随胚体膨胀半径, 蛋糕不再溢出纸托)
      const sR = Math.max(R, tier1Geom().R) + 6;
      ctx.fillStyle = '#F2E3CE';
      ctx.beginPath();
      ctx.moveTo(CX - sR, CTY + 30);
      for (let i = 0; i <= 22; i++) {
        const a = Math.PI * i / 22;
        ctx.lineTo(CX + Math.cos(a) * sR, TBL + 4 + Math.sin(a * 3) * 2);
      }
      for (let i = 22; i >= 0; i--) {
        const a = Math.PI * i / 22;
        ctx.lineTo(CX + Math.cos(a) * sR, CTY + 30);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(160,120,80,0.4)'; ctx.lineWidth = 1.6; ctx.stroke();
    }

    // 蛋糕体(面糊从底部涨起) — v674: 烤时胚体微膨胀 + 可选双层, 抽出 drawTierBody
    function drawTierBody(topY, RR, baseY) {
      const sideG = ctx.createLinearGradient(CX - RR, 0, CX + RR, 0);
      sideG.addColorStop(0, _wcDarken(cakeColor(false), 0.16));
      sideG.addColorStop(0.5, cakeColor(false));
      sideG.addColorStop(1, _wcDarken(cakeColor(false), 0.22));
      ctx.fillStyle = sideG;
      ctx.beginPath();
      ctx.moveTo(CX - RR, topY);
      ctx.lineTo(CX - RR, baseY);
      ctx.ellipse(CX, baseY, RR, 14, 0, Math.PI, 0, true);
      ctx.lineTo(CX + RR, topY);
      ctx.ellipse(CX, topY, RR, RR * 0.22, 0, 0, Math.PI, false);
      ctx.fill();
      ctx.beginPath(); ctx.ellipse(CX, topY, RR, RR * 0.22, 0, 0, TAU);
      ctx.fillStyle = cakeColor(true); ctx.fill();
      ctx.strokeStyle = 'rgba(150,100,60,0.3)'; ctx.lineWidth = 1.6; ctx.stroke();
    }
    if (batter > 0.02) {
      const t1 = tier1Geom();
      drawTierBody(t1.top, t1.R, TBL);
      // 顶面中心记录给奶油/装饰
      render._topY = t1.top;
    }

    const topY = render._topY || CTY;

    // v675: 烤箱前面板(玻璃窗洞) —— 蛋糕在窗里烤: 火光映色 + 颜色渐变 + 胚体膨胀全程可见
    if (baking) {
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(WIN.x, WIN.y, WIN.w, WIN.h, WIN.r); else ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h);
      ctx.clip();
      const gg = ctx.createRadialGradient(CX, TBL - 20, 20, CX, TBL - 20, 190);
      gg.addColorStop(0, 'rgba(255,170,70,0.4)');
      gg.addColorStop(1, 'rgba(255,120,40,0.04)');
      ctx.fillStyle = gg;
      ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
      for (const f of flames) {
        ctx.fillStyle = 'rgba(255,' + Math.round(140 + f.life * 80) + ',60,' + f.life * 0.8 + ')';
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * f.life, 0, TAU); ctx.fill();
      }
      ctx.restore();
      // 前面板: 外框挖出窗洞(even-odd), 蛋糕只从玻璃窗里露出来
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(OVEN.x, OVEN.y, OVEN.w, OVEN.h, OVEN.r);
        ctx.roundRect(WIN.x, WIN.y, WIN.w, WIN.h, WIN.r);
      } else {
        ctx.rect(OVEN.x, OVEN.y, OVEN.w, OVEN.h);
        ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h);
      }
      ctx.fillStyle = 'rgba(60,45,50,0.88)';
      ctx.fill('evenodd');
      ctx.strokeStyle = '#8A6470'; ctx.lineWidth = 5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(OVEN.x, OVEN.y, OVEN.w, OVEN.h, OVEN.r); else ctx.rect(OVEN.x, OVEN.y, OVEN.w, OVEN.h);
      ctx.stroke();
      // 窗框 + 玻璃斜高光
      ctx.strokeStyle = '#A87F8C'; ctx.lineWidth = 4;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(WIN.x, WIN.y, WIN.w, WIN.h, WIN.r); else ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(WIN.x + 8, WIN.y + 30); ctx.lineTo(WIN.x + 26, WIN.y + 8); ctx.stroke();
    }

    // 奶油(烤好后) — v679: 离屏增量三层(暗边/主体/高光)合成, 每帧只 drawImage
    function drawIcingTier(iTopY, iRR, baseY, iTier) {
      const L = icL && icL[iTier];
      if (!L) return;
      ctx.save();
      // v681: 裁剪=单条闭合轮廓(左缘→底缘外凸弧→右缘→顶面后缘弧), 与 drawTierBody 的胚体剪影完全同构。
      // v680 的写法(整椭圆+rect+底弧三个子路径混在一条 path)踩了 nonzero 环绕坑: rect(逆时针)与底弧闭合区(顺时针)
      // 环绕数抵消 → 重叠区被当洞挖掉 = 侧面出现一道斜楔形永远涂不上奶油(用户截图实锤)。单子路径无此问题。
      ctx.beginPath();
      ctx.moveTo(CX - iRR, iTopY);
      ctx.lineTo(CX - iRR, baseY);
      ctx.ellipse(CX, baseY, iRR, 14, 0, Math.PI, 0, true);            // 底缘外凸弧(经过下方) → (CX+iRR, baseY)
      ctx.lineTo(CX + iRR, iTopY);
      ctx.ellipse(CX, iTopY, iRR * 1.04, iRR * 0.24 * 1.04, 0, 0, Math.PI, true);   // 顶面后缘弧(经过上方, 放大4%=压过 rim)
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(L.d.cv, IBOX.x, IBOX.y, IBOX.w, IBOX.h);
      ctx.drawImage(L.b.cv, IBOX.x, IBOX.y, IBOX.w, IBOX.h);
      ctx.drawImage(L.h.cv, IBOX.x, IBOX.y, IBOX.w, IBOX.h);
      ctx.restore();
    }
    if (baked && icing.length) {
      const t1 = tier1Geom();
      drawIcingTier(t1.top, t1.R, TBL, 1);
      // 裙边(铺满后) v654: 双层波浪更立体; v679: 颜色第一次出现时定格, 换选奶油色不再跟着变
      if (cover >= 0.62) {
        skirtCol = skirtCol || ICINGS[icingSel].color;
        const sc = (lw, col, oy) => {
          ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
          ctx.beginPath();
          for (let i = 0; i <= 26; i++) {
            const a = Math.PI * i / 26;
            const px = CX - Math.cos(a) * (t1.R - 3);
            const py = t1.top + 34 + Math.sin(a) * 6 + Math.sin(i * 1.7) * 3 + oy;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        };
        sc(12, _wcDarken(skirtCol, 0.12), 2);
        sc(10, skirtCol, 0);
        sc(3.5, _wcRgba(_wcMix(skirtCol, '#FFFFFF', 0.55), 0.9), -3);
      }
    }
    // v674: 双层蛋糕 —— 上层坐在下层顶面, 奶油分层裁剪互不串层
    if (tier2 && baked) {
      const t2 = tier2Geom();
      // v682: 上层底部的接触阴影 —— 投在下层顶面/侧面(奶油上)。椭圆中心下移+加大 ry:
      // 上层胚体(含底缘外凸弧)会盖住阴影上半段, 中心不够低的话整圈阴影都被藏住=看不见分层
      const shg = ctx.createRadialGradient(CX, t2.base + 13, t2.R * 0.12, CX, t2.base + 13, t2.R + 30);
      shg.addColorStop(0, 'rgba(110, 66, 52, 0.42)');
      shg.addColorStop(0.45, 'rgba(110, 66, 52, 0.18)');
      shg.addColorStop(1, 'rgba(110, 66, 52, 0)');
      ctx.fillStyle = shg;
      ctx.beginPath();
      ctx.ellipse(CX, t2.base + 13, t2.R + 30, 20, 0, 0, TAU);
      ctx.fill();
      // 紧贴层缝的一道细影(只画前半段弧更自然)
      ctx.strokeStyle = 'rgba(110, 66, 52, 0.34)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(CX, t2.base + 3, t2.R + 4, 8, 0, Math.PI * 0.06, Math.PI * 0.94);
      ctx.stroke();
      drawTierBody(t2.top, t2.R, t2.base);
      if (icing.length) drawIcingTier(t2.top, t2.R, t2.base, 2);
    }

    // 装饰
    for (const d of decos) drawDeco(d);

    // v654: 关灯许愿 → 生日快乐
    if (dim > 0.01) {
      ctx.fillStyle = 'rgba(26,20,48,' + dim + ')';
      ctx.fillRect(0, 0, GAME_W, GAME_H);
      for (const d of decos) if (d.key === 'candle') drawDeco(d);   // 烛光画在暗层上面
      // v656: 有人点蜡烛 —— 火种从旁边飞过来逐根点亮
      if (wish === 1) {
        const cds = decos.filter(d2 => d2.key === 'candle');
        const tS = performance.now() - wishT0;
        for (let i = 0; i < cds.length; i++) {
          const st = LIGHT_START + i * LSEG;
          const p = (tS - st) / (LSEG * 0.55);
          if (p <= 0 || p >= 1) continue;
          const from = i === 0 ? { x: CX - R - 78, y: CTY - 6 } : { x: cds[i - 1].x, y: cds[i - 1].y - CH - 10 };
          const to = { x: cds[i].x, y: cds[i].y - CH - 10 };
          const e2 = 1 - (1 - p) * (1 - p);
          const sx = from.x + (to.x - from.x) * e2;
          const sy = from.y + (to.y - from.y) * e2 - Math.sin(Math.PI * p) * 16;
          const gS = ctx.createRadialGradient(sx, sy, 0.5, sx, sy, 9);
          gS.addColorStop(0, 'rgba(255,235,160,0.95)');
          gS.addColorStop(1, 'rgba(255,170,60,0)');
          ctx.fillStyle = gS;
          ctx.beginPath(); ctx.arc(sx, sy, 9, 0, TAU); ctx.fill();
          ctx.fillStyle = '#FFE9B8';
          ctx.beginPath(); ctx.arc(sx, sy, 2.4, 0, TAU); ctx.fill();
        }
      }
      if (wish === 2) {
        const tt = Math.min(1, (performance.now() - wishT0) / 700);
        const sc = 0.7 + 0.3 * (1 - Math.pow(1 - tt, 3));
        ctx.save();
        ctx.translate(CX, 90);
        ctx.scale(sc, sc);
        ctx.globalAlpha = tt;
        ctx.font = '700 36px "LXGW WenKai", "LXGW WenKai", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFE9B8';
        ctx.shadowColor = 'rgba(255,200,90,0.85)';
        ctx.shadowBlur = 20;
        ctx.fillText('🎂 生日快乐 🎂', 0, 0);
        ctx.restore();
        ctx.font = '500 14px "LXGW WenKai", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,236,200,' + 0.9 * tt + ')';
        ctx.fillText('闭上眼睛, 许个愿吧 ✨', CX, 124);
        for (const f of confetti) {
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(f.rot);
          ctx.globalAlpha = 0.92;
          ctx.fillStyle = f.c;
          ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      } else if (wish === 1) {
        ctx.font = '600 16px "LXGW WenKai", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,236,200,0.92)';
        ctx.fillText('🕯️ 有人来点蜡烛咯… 闭上眼睛许个愿', CX, 108);
      }
    }

    // 浮字
    for (const f of floats) {
      ctx.font = '600 15px "LXGW WenKai", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = f.color;
      ctx.globalAlpha = Math.min(1, f.life);
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
    // 底部提示
    const tips = { 1: '按住蛋糕模具, 把面糊倒进去', 2: '点「进烤箱」, 烤到金黄喷香', 3: '选颜色随意涂抹 · 彩虹笔能画渐变 · 「加一层」变双层蛋糕', 4: '选好装饰, 蛋糕顶上或侧面随意摆 · 觉得 OK 就点「装饰完成」', 5: '点「关灯许愿」, 会有人来帮你点亮蜡烛 ✨' };
    ctx.font = '500 13px "LXGW WenKai", sans-serif';
    ctx.fillStyle = 'rgba(150,100,120,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText(wish ? '' : (tips[step] || ''), CX, GAME_H - 10);
  }

  function loop() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    if (icingLoopNodes && now - lastIcingAt > 120) icingLoopStop();   // v701: 停笔/滑出蛋糕 120ms → 立刻收声(跟手)
    update(dt);
    render(now);
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(loop);
  }
  renderTools();
  loop();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      icingLoopStop();   // v701: 关游戏奶油声必须收干净
      stopBdaySong();   // v691: 关掉游戏停生日歌
      cv.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    }
  };
}

/* ---------- 游戏: 装饰圣诞树(v652) 挂彩球星星糖 · 点亮彩灯飘雪 ---------- */
function buildXmas(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const TAU = Math.PI * 2;
  const CX = GAME_W / 2;
  const TREE_TOP = 46, TREE_BOT = 318;   // 树冠范围
  const GROUND = 352;
  // 三层树冠: [顶y, 底y, 底半宽]
  const LAYERS = [
    { top: TREE_TOP, bot: 172, hw: 78 },
    { top: 128, bot: 242, hw: 112 },
    { top: 196, bot: TREE_BOT, hw: 148 },
  ];
  const floats = [];
  const DECOS_X = [
    { key: 'ballR', name: '🔴 红彩球' },
    { key: 'ballG', name: '🟡 金彩球' },
    { key: 'ballB', name: '🔵 蓝彩球' },
    { key: 'star',  name: '⭐ 星星' },
    { key: 'candy', name: '🍬 拐杖糖' },
    { key: 'light', name: '💡 彩灯' },
    { key: 'gift',  name: '🎁 礼物盒' },
  ];
  const LIGHT_COLS = ['#FFD97A', '#FF9AA2', '#A2D5FF', '#C3F584', '#F6B3CB'];
  let decoSel = 'ballR';
  const items = [];          // 摆放的装饰
  let lit = false, dim = 0;
  const snow = [];
  let lastT = performance.now(), raf = 0, lastPlace = 0;
  // v682: 点亮彩灯配乐 —— 圣诞节.wav(用户原曲 26s, 仅转码零加工), 每次点亮播一遍不循环
  // v683: 去掉原本的点灯音效(只留这首曲子) + 结尾 3s 淡出; v708 改走 WebAudio(老 iOS 可靠)
  function playXmasSong() { playSongBgm('xmas-bounce.mp3', 0.9); }
  function stopXmasSong() { stopSongBgm(); }

  const status = document.createElement('span');
  status.className = 'game-status';
  stage.appendChild(status);
  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  stage.appendChild(tools);
  function setStatus(t) { status.textContent = t; }
  function float(x, y, text, color, life) { floats.push({ x, y, text, color: color || '#DDE9C8', life: life || 1.2 }); }

  /* ---------- 工具条 ---------- */
  function renderTools() {
    tools.innerHTML = '';
    const mkRow = () => { const r = document.createElement('div'); r.className = 'st-row'; tools.appendChild(r); return r; };
    const row = mkRow();
    DECOS_X.forEach(d => {
      const chip = document.createElement('button');
      chip.type = 'button'; chip.className = 'st-chip' + (d.key === decoSel ? ' active' : '');
      chip.textContent = d.name;
      chip.addEventListener('click', e => { e.stopPropagation(); decoSel = d.key; renderTools(); });
      row.appendChild(chip);
    });
    const row2 = mkRow();
    const litBtn = document.createElement('button');
    litBtn.type = 'button'; litBtn.className = 'st-chip fire-chip';
    litBtn.textContent = lit ? '☀ 白天模式' : '✨ 点亮彩灯';
    litBtn.addEventListener('click', e => {
      e.stopPropagation();
      lit = !lit;
      if (lit) playXmasSong(); else stopXmasSong();   // v682: 点亮播一遍圣诞曲, 切白天/重装饰就停; v683: 原本点灯的竖琴音效已去掉, 只留这首曲子
      float(CX, 110, lit ? '✨ 圣诞快乐!' : '☀ 天亮啦', lit ? '#FFE9A8' : '#DDE9C8', 1.5);
      renderTools();
    });
    row2.appendChild(litBtn);
    const rb = document.createElement('button');
    rb.type = 'button'; rb.className = 'st-chip'; rb.textContent = '🔄 重新装饰';
    rb.addEventListener('click', e => { e.stopPropagation(); items.length = 0; snow.length = 0; lit = false; stopXmasSong(); renderTools(); });
    row2.appendChild(rb);
  }

  /* ---------- 树冠命中 ---------- */
  function inTree(x, y) {
    for (const L of LAYERS) {
      if (y >= L.top && y <= L.bot) {
        const k = (y - L.top) / (L.bot - L.top);          // 0顶→1底
        if (Math.abs(x - CX) <= L.hw * (0.16 + 0.84 * k)) return true;
      }
    }
    return false;
  }
  function onDown(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    const now = performance.now();
    if (now - lastPlace < 130) return;
    lastPlace = now;
    if (decoSel === 'gift') {
      /* v734: 礼物盒可放地面任意位置 —— 之前只许点树下(y≥330)且 x 被夹在中间, 用户要的是整条地面随便摆 */
      if (p.y < 322) { float(p.x, p.y - 20, '礼物盒放在地上吧', '#DDE9C8', 1); return; }
      items.push({ key: 'gift', x: Math.max(24, Math.min(GAME_W - 24, p.x)), y: Math.max(GROUND + 4, Math.min(GAME_H - 16, p.y)), s: 0.85 + Math.random() * 0.35, col: (items.length % 3), born: now });
    } else if (decoSel === 'star') {
      if (!inTree(p.x, p.y) && Math.hypot(p.x - CX, p.y - (TREE_TOP + 14)) > 60) { float(p.x, p.y - 18, '星星要挂在树上哦', '#DDE9C8', 1); return; }
      const onTop = Math.hypot(p.x - CX, p.y - TREE_TOP) < 70;
      items.push({ key: 'star', x: onTop ? CX : p.x, y: onTop ? TREE_TOP + 8 : p.y, s: onTop ? 1.5 : 0.9 + Math.random() * 0.3, born: now, top: onTop });
    } else {
      if (!inTree(p.x, p.y)) { float(p.x, p.y - 18, '要挂在树上才行呀', '#DDE9C8', 1); return; }
      items.push({ key: decoSel, x: p.x, y: p.y, s: 0.9 + Math.random() * 0.3, col: (Math.random() * 5) | 0, born: now });
    }
    playSfx('game.sprinkle', { volume: 0.7 });
  }
  cv.addEventListener('pointerdown', onDown);

  /* ---------- 更新 ---------- */
  function update(dt) {
    dim += ((lit ? 0.52 : 0) - dim) * Math.min(1, dt * 3);
    if (lit && snow.length < 90 && Math.random() < dt * 22) {
      snow.push({ x: Math.random() * GAME_W, y: -8, vy: 26 + Math.random() * 34, drift: (Math.random() - 0.5) * 20, r: 1.2 + Math.random() * 2.4, life: 1 });
    }
    for (let i = snow.length - 1; i >= 0; i--) {
      const f = snow[i];
      f.y += f.vy * dt; f.x += f.drift * dt;
      if (f.y > GAME_H - 6) { if (lit) { f.y = -8; f.x = Math.random() * GAME_W; } else { snow.splice(i, 1); } }
    }
    if (!lit) for (let i = snow.length - 1; i >= 0; i--) { snow[i].life -= dt * 0.8; if (snow[i].life <= 0) snow.splice(i, 1); }
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= dt; f.y -= dt * 24;
      if (f.life <= 0) floats.splice(i, 1);
    }
  }

  /* ---------- 装饰物绘制 ---------- */
  function wobPath(pts, seed, wob) {
    let sd = seed >>> 0;
    const rnd = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296 - 0.5; };
    const pj = pts.map(p => [p[0] + rnd() * wob * 8, p[1] + rnd() * wob * 8]);
    ctx.beginPath();
    ctx.moveTo((pj[0][0] + pj[pj.length - 1][0]) / 2, (pj[0][1] + pj[pj.length - 1][1]) / 2);
    for (let i = 0; i < pj.length; i++) {
      const a = pj[i], b = pj[(i + 1) % pj.length];
      ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    ctx.closePath();
  }
  /* v734: 星星瓶同款「胖纸星星」画法 —— 水彩渐变+夜光晕+白芯+折痕高光, 圆角无棱角(复用 wishLuckyPath/wishShade) */
  function paperStar(x, y, r, hex, glow) {
    if (glow) {
      const halo = ctx.createRadialGradient(x, y, 1, x, y, r * 2.6);
      halo.addColorStop(0, wishRgba(hex, 0.5));
      halo.addColorStop(0.5, wishRgba(hex, 0.2));
      halo.addColorStop(1, wishRgba(hex, 0));
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, TAU); ctx.fill();
    }
    const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, 1, x, y, r * 1.15);
    g.addColorStop(0, wishShade(hex, 0.55));
    g.addColorStop(0.55, wishShade(hex, 0.1));
    g.addColorStop(1, wishShade(hex, -0.18));
    wishLuckyPath(ctx, x, y, r, 0);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = wishShade(hex, -0.3); ctx.lineWidth = 1.4; ctx.globalAlpha = 0.75; ctx.stroke();
    ctx.globalAlpha = 1;
    const core = ctx.createRadialGradient(x + r * 0.1, y + r * 0.12, 1, x + r * 0.12, y + r * 0.16, r * 0.6);
    core.addColorStop(0, 'rgba(255,255,240,0.75)');
    core.addColorStop(1, 'rgba(255,255,240,0)');
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(x + r * 0.12, y + r * 0.16, r * 0.6, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.ellipse(x - r * 0.36, y - r * 0.4, r * 0.2, r * 0.12, -0.4, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
    ctx.globalAlpha = 1;
  }
  function drawItem(d, t) {
    const pop = Math.min(1, (t - d.born) / 180);
    const s = d.s * (0.5 + 0.5 * pop);
    ctx.save(); ctx.translate(d.x, d.y); ctx.scale(s, s);
    if (d.key === 'ballR' || d.key === 'ballG' || d.key === 'ballB') {
      /* v734: 彩球改水彩纸感 —— wobble 轮廓+径向渐变+白芯+折痕高光, 同星星瓶画风 */
      const hex = { ballR: '#E07A7A', ballG: '#F0C060', ballB: '#7E9CD6' }[d.key];
      ctx.strokeStyle = 'rgba(120,90,60,0.55)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, -16); ctx.stroke();
      wobPath([[9, 0], [6.4, 6.4], [0, 9], [-6.4, 6.4], [-9, 0], [-6.4, -6.4], [0, -9], [6.4, -6.4]], (d.x * 7 + d.y) | 0, 0.22);
      const g = ctx.createRadialGradient(-3, -4, 1, 0, 0, 11);
      g.addColorStop(0, wishShade(hex, 0.5));
      g.addColorStop(0.6, wishShade(hex, 0.05));
      g.addColorStop(1, wishShade(hex, -0.22));
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = wishShade(hex, -0.3); ctx.lineWidth = 1.3; ctx.globalAlpha = 0.75; ctx.stroke();
      ctx.globalAlpha = 1;
      const core = ctx.createRadialGradient(-2, -3, 1, -2, -3, 6);
      core.addColorStop(0, 'rgba(255,255,240,0.7)');
      core.addColorStop(1, 'rgba(255,255,240,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(-2, -3, 6, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.ellipse(-3.4, -4.2, 2.4, 1.5, -0.5, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
      ctx.globalAlpha = 1;
    } else if (d.key === 'star') {
      paperStar(0, 0, 13, '#F6C94A', lit && d.top);
    } else if (d.key === 'candy') {
      ctx.save();
      ctx.rotate(-0.5);
      ctx.lineWidth = 6.5; ctx.lineCap = 'round';
      ctx.strokeStyle = '#FDF7F0';
      ctx.beginPath();
      ctx.moveTo(0, 10); ctx.lineTo(0, -4);
      ctx.arc(4.5, -4, 4.5, Math.PI, 0, false);
      ctx.stroke();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 10); ctx.lineTo(0, -4);
      ctx.arc(4.5, -4, 4.5, Math.PI, 0, false);
      ctx.clip();
      ctx.strokeStyle = 'rgba(233,150,165,0.8)'; ctx.lineWidth = 6.5;   // v734: 条纹改柔粉水彩, 不再硬邦邦
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 5 - 3, 12); ctx.lineTo(i * 5 + 3, -10);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(190,110,125,0.45)'; ctx.lineWidth = 1.2;  // v734: 纸感描边
      ctx.beginPath();
      ctx.moveTo(0, 10); ctx.lineTo(0, -4);
      ctx.arc(4.5, -4, 4.5, Math.PI, 0, false);
      ctx.stroke();
      ctx.restore();
    } else if (d.key === 'light') {
      const col = LIGHT_COLS[d.col % 5];
      ctx.strokeStyle = 'rgba(90,110,80,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, -4); ctx.stroke();
      const blink = lit ? (0.55 + 0.45 * Math.sin(t / 260 + d.x * 0.7)) : 0.85;
      if (lit) {
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 12);
        g.addColorStop(0, col);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.5 * blink;
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.beginPath(); ctx.ellipse(0, 0, 3.4, 5, 0, 0, TAU);
      ctx.fillStyle = col; ctx.fill();
      ctx.globalAlpha = 0.4 + 0.6 * blink;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(-1, -1.6, 1, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (d.key === 'gift') {
      /* v734: 礼物盒改水彩纸感 —— 圆角纸盒+渐变+缎带, 盒顶一颗星星瓶同款小纸星星 */
      const hex = ['#E28A96', '#7FA8D9', '#9BC28E'][d.col % 3];
      const g = ctx.createRadialGradient(-4, -5, 2, 0, 0, 18);
      g.addColorStop(0, wishShade(hex, 0.42));
      g.addColorStop(0.6, wishShade(hex, 0.05));
      g.addColorStop(1, wishShade(hex, -0.2));
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-13, -11, 26, 22, 5) : ctx.rect(-13, -11, 26, 22);
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = wishShade(hex, -0.3); ctx.lineWidth = 1.3; ctx.globalAlpha = 0.75; ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,252,246,0.92)';
      ctx.fillRect(-2.6, -11, 5.2, 22);
      ctx.fillRect(-13, -2.6, 26, 5.2);
      paperStar(0, -13, 5.2, '#F6C94A', false);
    }
    ctx.restore();
  }

  /* ---------- 主渲染 ---------- */
  function render(t) {
    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
    if (dim > 0.05) { bg.addColorStop(0, '#2A3350'); bg.addColorStop(1, '#3D4A6B'); }
    else { bg.addColorStop(0, '#EFF5F7'); bg.addColorStop(1, '#E2ECDF'); }
    ctx.fillStyle = bg; ctx.fillRect(0, 0, GAME_W, GAME_H);
    if (dim > 0.05) {   // 夜空小星
      let sd = 77;
      const rnd = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.5 * rnd()) * dim + ')';
        ctx.beginPath(); ctx.arc(rnd() * GAME_W, rnd() * 200, 1 + rnd(), 0, TAU); ctx.fill();
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.arc(80, 70, 34, 0, TAU); ctx.fill();
    }
    // 雪地
    ctx.fillStyle = dim > 0.05 ? '#5C6B8E' : '#F6FAFB';
    ctx.beginPath(); ctx.ellipse(CX, GROUND + 26, 260, 34, 0, 0, TAU); ctx.fill();
    // 树干
    ctx.fillStyle = '#7A5638';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(CX - 13, TREE_BOT - 6, 26, 40, 4) : ctx.rect(CX - 13, TREE_BOT - 6, 26, 40);
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,50,30,0.5)'; ctx.lineWidth = 1.6; ctx.stroke();
    // 三层树冠(水彩)
    const greens = [['#5C8A64', '#3E6B4A'], ['#4F7E5A', '#35603F'], ['#456F50', '#2C5337']];
    LAYERS.forEach((L, i) => {
      const hw = L.hw, ty = L.top, by = L.bot;
      wobPath([
        [CX, ty], [CX + hw * 0.55, ty + (by - ty) * 0.55], [CX + hw, by],
        [CX + hw * 0.3, by - 8], [CX - hw * 0.3, by - 8], [CX - hw, by],
        [CX - hw * 0.55, ty + (by - ty) * 0.55],
      ], 1234 + i * 77, 0.8);
      const g = ctx.createLinearGradient(CX - hw, ty, CX + hw, by);
      g.addColorStop(0, greens[i][1]); g.addColorStop(0.55, greens[i][0]); g.addColorStop(1, greens[i][1]);
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(30,60,40,0.4)'; ctx.lineWidth = 2; ctx.stroke();
      // 积雪边
      ctx.strokeStyle = dim > 0.05 ? 'rgba(220,230,255,0.25)' : 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(CX - hw * 0.8, by - 3);
      ctx.quadraticCurveTo(CX - hw * 0.3, by - 12, CX, by - 6);
      ctx.quadraticCurveTo(CX + hw * 0.3, by - 12, CX + hw * 0.8, by - 3);
      ctx.stroke();
    });
    // 装饰
    for (const d of items) drawItem(d, t);
    // 雪花
    for (const f of snow) {
      ctx.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.4 * f.life) + ')';
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill();
    }
    // 浮字
    for (const f of floats) {
      ctx.font = '600 15px "LXGW WenKai", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = f.color;
      ctx.globalAlpha = Math.min(1, f.life);
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
    // 提示
    const tips = { ballR: '点树上挂彩球 · gift 可放地面任意位置 · star 靠近树顶会吸附', ballG: '点树上挂彩球', ballB: '点树上挂彩球', star: '点树顶附近, 星星会吸到树尖 ✨', candy: '点树上挂拐杖糖', light: '多点几盏彩灯, 再点「点亮彩灯」看效果', gift: '点地面任意位置放礼物盒' };
    ctx.font = '500 13px "LXGW WenKai", sans-serif';
    ctx.fillStyle = dim > 0.05 ? 'rgba(230,235,255,0.55)' : 'rgba(90,110,95,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText(tips[decoSel] || '', CX, GAME_H - 10);
  }

  function loop() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    update(dt);
    render(now);
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(loop);
  }
  renderTools();
  loop();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', onDown);
      stopXmasSong();   // v682: 关掉游戏停音乐
    }
  };
}

/* ---------- 游戏: 卷寿司(v661) ----------
   铺饭(按住涂抹) → 放馅 → 卷起(立起来, 竖着的) → 切段 → 蘸酱油/芥末 → 啊呜吃掉 */
function buildSushi(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const TAU = Math.PI * 2;
  const NX = 90, NY = 70, NW = 380, NH = 150;            // 海苔
  const NCX = NX + NW / 2, NCY = NY + NH / 2;
  const TBL = 300;
  const CELL = 12;
  let riceTarget = 0;
  (function () {
    for (let gy = 8; gy < NH - 8; gy += CELL) for (let gx = 8; gx < NW - 8; gx += CELL) riceTarget++;
  })();
  // 立卷几何: 底部压在竹帘上, 竖着立起来
  const ROLL_R = 46, ROLL_BOT = 248, ROLL_H = 188;
  const SEG_H = ROLL_H / 5;

  let step = 1, stepDone = false;
  const rice = [], riceGrid = new Set();
  let rollP = 0;
  const FILLS = [
    { key: 'salmon', name: '三文鱼', c: '#F2937E', d: '#D96B55' },
    { key: 'cuke',   name: '黄瓜',   c: '#9CCB86', d: '#6F9E5C' },
    { key: 'egg',    name: '玉子',   c: '#F6D06F', d: '#DFAF45' },
    { key: 'crab',   name: '蟹柳',   c: '#F5C7C2', d: '#E05A55' },
  ];
  let fillSel = 0;
  const fillings = [];
  let cutYs = [], done = false;
  const cutFx = [];   // v668: 切断白光刀痕动画
  // 手动卷动: 按住往右/往左拖竹帘, 位移映射卷动进度
  let rollDrag = false, rollStartX = 0, rollStartP = 0, lastRollX = 0;
  // 吃环节
  const slices = [];            // {x,y,hx,hy,dip,eat,t0,born} hx/hy=盘子上的家
  let eaten = 0, drag = -1;
  const floats = [];
  let raf = 0, lastT = 0;
  const knife = { x: NCX, y: ROLL_BOT - SEG_H };
  const ptr = { down: false, x: 0, y: 0 };
  /* v749: 双蘸料碟 —— 左边纯酱油, 右边酱油加芥末(按口味自己选) */
  const DISH_L = { x: 452, y: 318, rx: 36, ry: 15 };
  const DISH_R = { x: 522, y: 318, rx: 36, ry: 15 };
  /* v670: 测试钩子(仅 URL 带 sushidbg 时存在, 生产零影响) —— headless 逐帧读切片状态验证动画连续性 */
  if (/sushidbg/.test(location.search)) {
    window.__sushiState = () => ({ step, drag, slices: slices.map(s => ({ x: s.x, y: s.y, dip: !!s.dip, eat: !!s.eat })) });
  }

  // v664/v665 渲染缓存: 静态元素画进离屏画布, 每帧只 drawImage(解决水彩每帧多重渐变填充的小卡顿)
  // v665 进一步: 背景烘焙纸纹+并入竹帘; 海苔/立卷/摆盘缓存裁剪到小区域(避免全画布 blit); 循环里去掉每帧 wcPaper
  // v672: 缓存全部按 DPR 高清化(之前 1x 位图放大进 2x 画布 = 立卷/切片发虚"看起来假")
  //       + 立卷缓存顶部留白 14→34(断面椭圆高 ~33px, 之前顶部被削平)
  const DPR = cv.width / GAME_W;
  const NORI_OX = NX - 20, NORI_OY = NY - 20;
  const ROLL_OX = NCX - ROLL_R - 12, ROLL_OY = ROLL_BOT - ROLL_H - 34;
  const PLT_OX = 52, PLT_OY = 296;
  const bgCv = document.createElement('canvas'); bgCv.width = GAME_W * DPR; bgCv.height = GAME_H * DPR;
  const noriCv = document.createElement('canvas'); noriCv.width = (NW + 40) * DPR; noriCv.height = (NH + 40) * DPR;
  const rollCv = document.createElement('canvas'); rollCv.width = (ROLL_R * 2 + 24) * DPR; rollCv.height = (ROLL_H + 68) * DPR;
  const plateCv = document.createElement('canvas'); plateCv.width = 510 * DPR; plateCv.height = 104 * DPR;
  const sliceCv = document.createElement('canvas'); sliceCv.width = 84 * DPR; sliceCv.height = 76 * DPR;
  let rollKey = null, sliceReady = false;
  let dctx = ctx;   // 当前绘制目标(画离屏缓存时临时改指向)
  (function paintStatics() {
    const b = bgCv.getContext('2d');
    b.scale(DPR, DPR);   // v672: 高清缓存
    const bg = b.createLinearGradient(0, 0, 0, GAME_H);
    bg.addColorStop(0, '#FBF5EA'); bg.addColorStop(1, '#F3E7D3');
    b.fillStyle = bg; b.fillRect(0, 0, GAME_W, GAME_H);
    const wood = b.createLinearGradient(0, TBL, 0, GAME_H);
    wood.addColorStop(0, '#E8CBA4'); wood.addColorStop(1, '#D9B488');
    b.fillStyle = wood; b.fillRect(0, TBL, GAME_W, GAME_H - TBL);
    // 竹帘直接画进背景
    b.save(); b.translate(NX - 14, NY - 12);
    b.fillStyle = '#DCE4C4';
    b.beginPath();
    if (b.roundRect) b.roundRect(0, 0, NW + 28, NH + 34, 10);
    else b.rect(0, 0, NW + 28, NH + 34);
    b.fill();
    b.strokeStyle = 'rgba(140,150,100,0.4)'; b.lineWidth = 2;
    for (let i = 0; i < 16; i++) {
      b.beginPath();
      b.moveTo(4 + i * (NW + 20) / 16, 3);
      b.lineTo(4 + i * (NW + 20) / 16, NH + 31);
      b.stroke();
    }
    b.restore();
    // 纸感颗粒烘焙进背景(替代每帧 wcPaper 全画布 multiply)
    const pat = b.createPattern(WC_TILE, 'repeat');
    b.globalCompositeOperation = 'multiply';
    b.globalAlpha = 0.22;
    b.fillStyle = pat;
    b.fillRect(0, 0, GAME_W, GAME_H);
    b.globalAlpha = 1;
    b.globalCompositeOperation = 'source-over';
    // 摆盘缓存(大盘+酱油碟+芥末), 裁剪到小区域
    const p = plateCv.getContext('2d');
    p.setTransform(DPR, 0, 0, DPR, -PLT_OX * DPR, -PLT_OY * DPR);   // v672: 高清缓存
    wcShadow(p, 280, 362, 205, 30, 0.14);
    wcEllipse(p, 280, 352, 196, 27, '#FFFDF6', '#E9DECA', 8);
    wcEllipse(p, 280, 352, 168, 21, '#F7F0E0', '#EAE0C9', 9);
    // v749: 左碟纯酱油
    wcEllipse(p, DISH_L.x, DISH_L.y, DISH_L.rx + 7, DISH_L.ry + 5, '#F4F8FA', '#D6E1E8', 10);
    wcEllipse(p, DISH_L.x, DISH_L.y, DISH_L.rx - 14, DISH_L.ry - 4, '#7A4A28', '#593318', 11);
    p.fillStyle = 'rgba(255,255,255,0.18)';
    p.beginPath(); p.ellipse(DISH_L.x - 8, DISH_L.y - 2, 7, 2.6, -0.2, 0, TAU); p.fill();
    // v749: 右碟酱油加芥末
    wcEllipse(p, DISH_R.x, DISH_R.y, DISH_R.rx + 7, DISH_R.ry + 5, '#F4F8FA', '#D6E1E8', 10);
    wcEllipse(p, DISH_R.x - 4, DISH_R.y, DISH_R.rx - 16, DISH_R.ry - 4, '#7A4A28', '#593318', 11);
    p.fillStyle = 'rgba(255,255,255,0.18)';
    p.beginPath(); p.ellipse(DISH_R.x - 12, DISH_R.y - 2, 6, 2.2, -0.2, 0, TAU); p.fill();
    p.fillStyle = '#8CB84E';
    p.beginPath(); p.ellipse(DISH_R.x + 14, DISH_R.y - 2, 8, 5.5, 0.3, 0, TAU); p.fill();
    p.fillStyle = '#7BA53F';
    p.beginPath(); p.ellipse(DISH_R.x + 16, DISH_R.y - 4, 4, 2.6, 0.3, 0, TAU); p.fill();
    // 碟子小标签
    p.font = '600 11px "LXGW WenKai", sans-serif';
    p.textAlign = 'center';
    p.fillStyle = 'rgba(110,85,60,0.75)';
    p.fillText('酱油', DISH_L.x, DISH_L.y + 30);
    p.fillText('芥末酱油', DISH_R.x, DISH_R.y + 30);
    paintNori();
  })();
  function paintNori() {
    const n = noriCv.getContext('2d');
    n.setTransform(1, 0, 0, 1, 0, 0);
    n.clearRect(0, 0, noriCv.width, noriCv.height);
    n.setTransform(DPR, 0, 0, DPR, -NORI_OX * DPR, -NORI_OY * DPR);   // v672: 高清缓存
    wcBlock(n, NX, NY, NW, NH, 12, { hi: '#41543E', lo: '#242E1E' }, 7);
    n.setTransform(1, 0, 0, 1, 0, 0);
  }

  const status = document.createElement('span');
  status.className = 'game-status';
  stage.appendChild(status);
  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  stage.appendChild(tools);
  function float(x, y, text, color, life) { floats.push({ x, y, text, color: color || '#D98A4A', life: life || 1.2 }); }

  function renderTools() {
    tools.innerHTML = '';
    const mkRow = () => { const r = document.createElement('div'); r.className = 'st-row'; tools.appendChild(r); return r; };
    if (step === 2) {
      const row = mkRow();
      FILLS.forEach((f, i2) => {
        const chip = document.createElement('button');
        chip.type = 'button'; chip.className = 'st-chip' + (i2 === fillSel ? ' active' : '');
        chip.innerHTML = '<i class="st-dotc" style="--c:' + f.c + '"></i>' + f.name;
        chip.addEventListener('click', e => { e.stopPropagation(); fillSel = i2; renderTools(); });
        row.appendChild(chip);
      });
    }
    if (step === 1 && stepDone) {
      const row = mkRow();
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '放馅料 →';
      b.addEventListener('click', e => { e.stopPropagation(); step = 2; stepDone = false; renderTools(); });
      row.appendChild(b);
    }
    if (step === 2 && fillings.length) {
      const row = mkRow();
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '🌀 卷起来';
      b.addEventListener('click', e => { e.stopPropagation(); step = 3; renderTools(); });
      row.appendChild(b);
    }
    if (done && eaten >= 5) {
      const row = mkRow();
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '🍣 再做一盘';
      b.addEventListener('click', e => { e.stopPropagation(); resetGame(); });
      row.appendChild(b);
    }
  }

  function resetGame() {
    step = 1; stepDone = false;
    rice.length = 0; riceGrid.clear();
    paintNori();
    rollP = 0; rollDrag = false;
    rollKey = null; sliceReady = false;
    fillings.length = 0;
    cutYs = []; done = false;
    cutFx.length = 0;
    slices.length = 0; eaten = 0; drag = -1;
    renderTools();
  }

  function onDown(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    ptr.down = true; ptr.x = p.x; ptr.y = p.y;
    if (step === 1 && inNori(p.x, p.y)) addRice(p.x, p.y);
    if (step === 2 && inNori(p.x, p.y) && p.y > NY + 30 && p.y < NY + NH - 14) addFilling(p.x, p.y);
    if (step === 3 && rollP < 1) { rollDrag = true; rollStartX = p.x; rollStartP = rollP; lastRollX = p.x; }
    if (step === 5 && eaten < 5) {
      for (let i = 0; i < slices.length; i++) {
        const s = slices[i];
        if (s.eat || s.dip) continue;
        if (Math.hypot(p.x - s.x, p.y - s.y) < 32) { drag = i; break; }
      }
    }
  }
  function onMove(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    ptr.x = p.x; ptr.y = p.y;
    if (ptr.down && step === 1 && inNori(p.x, p.y)) addRice(p.x, p.y);
    // 手动卷: 拖动位移一点点推进, 可以来回卷
    if (ptr.down && step === 3 && rollDrag && rollP < 1) {
      rollP = Math.max(0, Math.min(1, rollStartP + (p.x - rollStartX) / 300));
      if (Math.abs(p.x - lastRollX) > 14 && Math.random() < 0.5) { playSfx('game.slimePour', { volume: 0.3 }); lastRollX = p.x; }
    }
    // 拖动寿司段
    if (ptr.down && step === 5 && drag >= 0) {
      const s = slices[drag];
      if (s && !s.dip && !s.eat) { s.x = Math.max(30, Math.min(GAME_W - 30, p.x)); s.y = Math.max(60, Math.min(GAME_H - 26, p.y)); }
    }
  }
  function onUp() {
    ptr.down = false;
    rollDrag = false;
    if (step === 5 && drag >= 0) {
      const s = slices[drag];
      if (s && !s.eat && !s.dip) {
        /* v749: 双碟选择 —— 左纯酱油 / 右芥末酱油 */
        if (Math.hypot(ptr.x - DISH_L.x, ptr.y - DISH_L.y) < DISH_L.rx + 20) {
          s.dip = 'soy'; s.t0 = performance.now();
          playSfx('game.bubblePop', { volume: 0.6 });
        } else if (Math.hypot(ptr.x - DISH_R.x, ptr.y - DISH_R.y) < DISH_R.rx + 20) {
          s.dip = 'wasabi'; s.t0 = performance.now();
          playSfx('game.bubblePop', { volume: 0.6 });
        } else { s.fx = s.x; s.fy = s.y; s.rt = performance.now(); }
      }
      drag = -1;
    }
  }
  cv.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  function inNori(x, y) { return x > NX && x < NX + NW && y > NY && y < NY + NH; }

  function addRice(x, y) {
    const gk = Math.round((x - NX) / CELL) + ':' + Math.round((y - NY) / CELL);
    const isNew = !riceGrid.has(gk);
    const n2 = noriCv.getContext('2d');
    n2.setTransform(DPR, 0, 0, DPR, -NORI_OX * DPR, -NORI_OY * DPR);   // v672: 高清缓存
    for (let i = 0; i < 6; i++) {
      const rx = x + (Math.random() - 0.5) * 26, ry = y + (Math.random() - 0.5) * 17;
      const rr = 4.4 + Math.random() * 3, rot = (Math.random() - 0.5) * 1.2;
      rice.push({ x: rx, y: ry, r: rr, rot: rot });
      n2.fillStyle = '#FBF6EA';
      n2.save();
      n2.translate(rx, ry); n2.rotate(rot);
      n2.beginPath(); n2.ellipse(0, 0, rr, rr * 0.55, 0, 0, TAU); n2.fill();
      n2.restore();
    }
    n2.setTransform(1, 0, 0, 1, 0, 0);
    if (isNew) {
      riceGrid.add(gk);
      if (riceGrid.size / riceTarget >= 0.35 && !stepDone) {
        stepDone = true;
        float(NCX, NY - 16, '饭铺满啦!', '#D98A4A', 1.3);
        renderTools();
      }
    }
    if (Math.random() < 0.3) playSfx('game.slimePour', { volume: 0.22 });
  }
  function addFilling(x, y) {
    const f = FILLS[fillSel];
    // v749: 竖放的长条要完整躺在海苔里, 上下留出余量
    y = Math.max(NY + 48, Math.min(NY + NH - 48, y));
    x = Math.max(NX + 10, Math.min(NX + NW - 10, x));
    fillings.push({ x: x, y: y, w: 84, key: f.key });
    playSfx('game.sprinkle', { volume: 0.7 });
    float(x, y - 14, f.name + ' ✓', f.d, 0.9);
    renderTools();
  }

  function update(dt, now) {
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= dt; f.y -= dt * 26;
      if (f.life <= 0) floats.splice(i, 1);
    }
    if (step === 3 && rollP >= 1) {
      rollDrag = false;
      step = 4;
      buildSliceSprite();   // v668: 提前画好切片精灵, 切完瞬间不再卡一帧
      float(NCX, 130, '立好啦! 拿刀切成 5 段 ✨', '#D98A4A', 1.5);
      playSfx('site.chime', { volume: 0.6 });
    }
    if (step === 4) {
      // v668: 扫过判定——按住时只要刀从切线上掠过(帧间线段跨过)就切, 划多快都不会漏
      const kyPrev = knife.y;
      knife.x += (ptr.x - knife.x) * 0.55;
      knife.y += (ptr.y - knife.y) * 0.55;
      if (ptr.down) {
        const yLo = Math.min(kyPrev, knife.y), yHi = Math.max(kyPrev, knife.y);
        for (let k = 1; k <= 4; k++) {
          const cy = ROLL_BOT - SEG_H * k;
          if (cutYs.indexOf(cy) !== -1) continue;
          const crossed = cy >= yLo - 6 && cy <= yHi + 6;   // 掠过即切(±6px 容差兜住抖动)
          const near = Math.abs(knife.y - cy) < 8;
          if ((crossed || near) && Math.abs(knife.x - NCX) < ROLL_R + 16) {
            cutYs.push(cy);
            cutFx.push({ y: cy, t: now });   // 白光刀痕
            playSfx('game.soapSlice', { volume: 0.8 });
            if (cutYs.length >= 4) {
              step = 5;
              done = true;   // v687: 之前 done 永远是 false → 吃完后「再做一盘」按钮永不出现(没下文的真凶)
              float(NCX, 110, '切好! 摆盘开饭 🍣', '#D98A4A', 1.6);
              playSfx('site.chime', { volume: 0.85 });
              // v672: 生成盘子上的 5 段——直接在盘位原地 pop 出现(不再从卷上飞落)
              const t0 = performance.now() + 150;
              for (let i = 0; i < 5; i++) {
                slices.push({ hx: 244 + i * 60, hy: 350, x: 244 + i * 60, y: 350, dip: false, eat: false, t0: 0, born: t0 + i * 90 });
              }
              buildSliceSprite();
              setTimeout(renderTools, 500);
            }
          }
        }
      }
    }
    // 蘸/吃动画
    for (let i = slices.length - 1; i >= 0; i--) {
      const s = slices[i];
      if (s.dip && !s.eat && performance.now() - s.t0 > 450) {
        s.eat = true; s.t0 = performance.now();
        /* v670: 蘸完把碟心位置写回切片——否则"吃"动画从松手点起飞,
           画面上切片会从碟心瞬间跳回松手点 = 装盘一闪一闪的残留根因之一 */
        const dhome = s.dip === 'wasabi' ? DISH_R : DISH_L;
        s.x = dhome.x; s.y = dhome.y - 6;
        float(dhome.x, dhome.y - 40, s.dip === 'wasabi' ? '蘸好芥末酱油, 啊呜!' : '蘸好酱油, 啊呜!', '#7BA053', 1.3);
        playSfx('game.slimePour', { volume: 0.5 });
      }
      if (s.eat && performance.now() - s.t0 > 900) {
        slices.splice(i, 1);
        eaten++;
        if (eaten >= 5) {
          float(280, 300, '吃得干干净净, 满足 ~ 🍽️', '#D98A4A', 2);
          playSfx('site.chime', { volume: 0.9 });
          renderTools();
        }
      }
    }
  }

  // ---------- 馅料纹理(v662): 三文鱼白脂纹 / 蟹柳白底红裂纹 / 黄瓜皮+籽 / 玉子(v664 恢复旧样式) ----------
  // v749: 馅料竖着放(用户指认原来横放方向错了) —— 整体旋转 90°, 纹理跟着转
  function drawFillStrip(x, y, w, key, alpha) {
    const half = w / 2;
    const fd = FILLS.find(q => q.key === key) || FILLS[0];
    dctx.save();
    if (alpha != null) dctx.globalAlpha = alpha;
    dctx.translate(x, y);
    dctx.rotate(Math.PI / 2);
    x = 0; y = 0;
    dctx.fillStyle = key === 'crab' ? '#F7F1EA' : fd.c;
    dctx.beginPath();
    if (dctx.roundRect) dctx.roundRect(x - half, y - 7, w, 14, 7);
    else dctx.rect(x - half, y - 7, w, 14);
    dctx.fill();
    if (key === 'salmon') {
      dctx.strokeStyle = 'rgba(255,255,255,0.85)';
      dctx.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) {
        const yy = y - 3.4 + i * 3.4;
        dctx.beginPath();
        dctx.moveTo(x - half + 5, yy);
        dctx.bezierCurveTo(x - half + w * 0.3, yy - 2.2, x + w * 0.2, yy + 2.2, x + half - 5, yy);
        dctx.stroke();
      }
    } else if (key === 'crab') {
      dctx.strokeStyle = fd.d;
      dctx.lineWidth = 2.4;
      for (let i = 0; i < 3; i++) {
        const xx = x - half + 8 + i * (w - 16) / 2;
        dctx.beginPath();
        dctx.moveTo(xx + (i % 2 ? -2.5 : 2.5), y - 5.5);
        dctx.quadraticCurveTo(xx + (i % 2 ? 2 : -2), y, xx + (i % 2 ? -3 : 3), y + 5.5);
        dctx.stroke();
      }
      dctx.strokeStyle = 'rgba(224,90,85,0.45)';
      dctx.lineWidth = 1;
      dctx.beginPath(); dctx.moveTo(x - half + 3, y - 4.6); dctx.lineTo(x + half - 3, y - 4.6); dctx.stroke();
      dctx.beginPath(); dctx.moveTo(x - half + 3, y + 4.6); dctx.lineTo(x + half - 3, y + 4.6); dctx.stroke();
    } else if (key === 'cuke') {
      dctx.fillStyle = fd.d;
      dctx.beginPath();
      if (dctx.roundRect) dctx.roundRect(x - half, y - 7, w, 3.4, 2);
      else dctx.rect(x - half, y - 7, w, 3.4);
      dctx.fill();
      dctx.beginPath();
      if (dctx.roundRect) dctx.roundRect(x - half, y + 3.6, w, 3.4, 2);
      else dctx.rect(x - half, y + 3.6, w, 3.4);
      dctx.fill();
      dctx.fillStyle = 'rgba(238,250,224,0.95)';
      const nSeeds = Math.max(2, Math.floor(w / 22));
      for (let i = 0; i < nSeeds; i++) {
        dctx.beginPath();
        dctx.ellipse(x - half + w / (nSeeds * 2) + i * (w / nSeeds), y, 3.2, 1.5, 0, 0, TAU);
        dctx.fill();
      }
    } else {
      // 玉子: 恢复 v661 旧样式(纯黄 + 深黄底边), 去掉层纹
      dctx.fillStyle = fd.d;
      dctx.beginPath();
      if (dctx.roundRect) dctx.roundRect(x - half, y + 1, w, 6, 3);
      else dctx.rect(x - half, y + 1, w, 6);
      dctx.fill();
    }
    dctx.restore();
  }
  function drawFillDot(px, py, r2, key) {
    const fd = FILLS.find(q => q.key === key) || FILLS[0];
    dctx.fillStyle = key === 'crab' ? '#F7F1EA' : fd.c;
    dctx.beginPath(); dctx.ellipse(px, py, r2, r2 * 0.72, 0, 0, TAU); dctx.fill();
    if (key === 'salmon') {
      dctx.strokeStyle = 'rgba(255,255,255,0.9)';
      dctx.lineWidth = 1.1;
      for (let i = -1; i <= 1; i++) {
        dctx.beginPath();
        dctx.moveTo(px - r2 * 0.7, py + i * r2 * 0.42);
        dctx.quadraticCurveTo(px, py + i * r2 * 0.42 - r2 * 0.3, px + r2 * 0.7, py + i * r2 * 0.42);
        dctx.stroke();
      }
    } else if (key === 'crab') {
      dctx.strokeStyle = fd.d;
      dctx.lineWidth = 1.3;
      for (let i = -1; i <= 1; i++) {
        dctx.beginPath();
        dctx.moveTo(px + i * r2 * 0.45, py - r2 * 0.55);
        dctx.quadraticCurveTo(px + i * r2 * 0.45 + (i ? 1.5 : -1.5), py, px + i * r2 * 0.45, py + r2 * 0.55);
        dctx.stroke();
      }
    } else if (key === 'cuke') {
      dctx.strokeStyle = 'rgba(95,143,78,0.95)';
      dctx.lineWidth = 1.4;
      dctx.beginPath(); dctx.ellipse(px, py, r2 * 0.82, r2 * 0.55, 0, 0, TAU); dctx.stroke();
      dctx.fillStyle = 'rgba(238,250,224,0.95)';
      for (let i = 0; i < 3; i++) {
        const aa = i * 2.1;
        dctx.beginPath(); dctx.ellipse(px + Math.cos(aa) * r2 * 0.35, py + Math.sin(aa) * r2 * 0.26, 1.3, 0.8, aa, 0, TAU); dctx.fill();
      }
    }
    // 玉子(v664): 恢复旧样式, 纯色椭圆不加纹
  }

  // 立着的卷: 按 cutYs 分段绘制, 顶部是断面
  // v664: 整卷画进离屏缓存, 切缝没变就只 drawImage
  function drawStandingRoll(now) {
    const key = cutYs.slice().sort((a, b) => a - b).join(',');
    if (key !== rollKey) {
      rollKey = key;
      const g2 = rollCv.getContext('2d');
      g2.setTransform(1, 0, 0, 1, 0, 0);
      g2.clearRect(0, 0, rollCv.width, rollCv.height);
      const keep = dctx; dctx = g2;
      g2.setTransform(DPR, 0, 0, DPR, -ROLL_OX * DPR, -ROLL_OY * DPR);   // v672: 高清缓存
      paintStandingRoll();
      g2.setTransform(1, 0, 0, 1, 0, 0);
      dctx = keep;
    }
    ctx.drawImage(rollCv, ROLL_OX, ROLL_OY, ROLL_R * 2 + 24, ROLL_H + 68);
  }
  function paintStandingRoll() {
    const cuts = cutYs.slice().sort((a, b) => a - b);
    const rr = ROLL_R;
    const yTop = ROLL_BOT - ROLL_H, yBot = ROLL_BOT;
    const segs = [];
    let a0 = yTop;
    for (const cy of cuts) { segs.push([a0, cy]); a0 = cy; }
    segs.push([a0, yBot]);
    segs.forEach((sg, si) => {
      const off = cuts.indexOf(sg[0]) >= 0 ? (si % 2 ? 4 : -4) : 0;
      const y0 = sg[0] + (si > 0 ? 2.5 : 0), y1 = sg[1] - (si < segs.length - 1 ? 2.5 : 0);
      if (y1 <= y0) return;
      dctx.save();
      dctx.translate(off, 0);
      if (si === 0) {
        dctx.fillStyle = 'rgba(120,90,60,0.13)';
        dctx.beginPath(); dctx.ellipse(NCX + 6, yBot + 9, rr * 1.02, 8, 0, 0, TAU); dctx.fill();
      }
      const pathSeg = (c) => {
        if (c.roundRect) c.roundRect(NCX - rr, y0, rr * 2, y1 - y0, 9);
        else c.rect(NCX - rr, y0, rr * 2, y1 - y0);
      };
      wcWashPath(dctx, pathSeg, NCX, (y0 + y1) / 2, rr, '#4E624A', '#242F1F', { hl: false, lw: 1.6, haloA: 0.18, edgeA: 0.3 });
      dctx.fillStyle = 'rgba(255,255,255,0.1)';
      dctx.beginPath();
      if (dctx.roundRect) dctx.roundRect(NCX - rr + 7, y0 + 4, 10, y1 - y0 - 8, 5);
      else dctx.rect(NCX - rr + 7, y0 + 4, 10, y1 - y0 - 8);
      dctx.fill();
      dctx.restore();
    });
    drawCrossTop(NCX, yTop + 2, rr);
  }
  function drawCrossTop(x, y, rr) {
    dctx.save();
    dctx.translate(x, y);
    wcEllipse(dctx, 0, 0, rr, rr * 0.62, '#4E624A', '#26301F', 5);
    wcEllipse(dctx, 0, 0, rr - 7, rr * 0.62 - 5, '#FFFDF2', '#EBDFC8', 6);
    dctx.fillStyle = 'rgba(210,195,170,0.4)';
    for (let i = 0; i < 12; i++) {
      const aa = i * 2.39, rrx = (rr - 14) * (0.3 + (i * 0.37) % 0.7);
      dctx.beginPath(); dctx.ellipse(Math.cos(aa) * rrx, Math.sin(aa) * rrx * 0.62, 2.6, 1.5, aa, 0, TAU); dctx.fill();
    }
    if (fillings.length) {
      const n = Math.min(fillings.length, 8);
      for (let i = 0; i < n; i++) {
        const aa = (i / n) * TAU + 0.5;
        const rrx = (rr - 17) * (n <= 4 ? 0.52 : 0.62);
        drawFillDot(Math.cos(aa) * rrx, Math.sin(aa) * rrx * 0.6, n > 5 ? 5.6 : 6.4, fillings[i].key);
      }
      drawFillDot(0, 2, 5.4, fillings[0].key);
    } else {
      drawFillDot(-12, -5, 6.5, 'salmon'); drawFillDot(12, 3, 6, 'cuke'); drawFillDot(0, 8, 6, 'egg');
    }
    dctx.restore();
  }

  // v664: 单块切片画一次进精灵图, 之后每帧只 drawImage
  function buildSliceSprite() {
    const g2 = sliceCv.getContext('2d');
    g2.setTransform(1, 0, 0, 1, 0, 0);
    g2.clearRect(0, 0, sliceCv.width, sliceCv.height);
    g2.scale(DPR, DPR);   // v672: 高清缓存
    g2.save();
    g2.translate(42, 38);
    const keep = dctx; dctx = g2;
    wcShadow(g2, 0, 12, 28, 9, 0.14);
    wcEllipse(g2, 0, 0, 28, 24, '#4E624A', '#26301F', 12);
    wcEllipse(g2, 0, 0, 23, 19.5, '#FFFDF2', '#EBDFC8', 13);
    g2.fillStyle = 'rgba(210,195,170,0.4)';
    for (let i2 = 0; i2 < 9; i2++) {
      const aa = i2 * 2.39, rrx = 15 * (0.3 + (i2 * 0.41) % 0.7);
      g2.beginPath(); g2.ellipse(Math.cos(aa) * rrx, Math.sin(aa) * rrx * 0.8, 2.4, 1.4, aa, 0, TAU); g2.fill();
    }
    if (fillings.length) {
      const n = Math.min(fillings.length, 8);
      for (let i2 = 0; i2 < n; i2++) {
        const aa = (i2 / n) * TAU + 0.7;
        drawFillDot(Math.cos(aa) * 10.5, Math.sin(aa) * 7.5, n > 5 ? 4.4 : 5, fillings[i2].key);
      }
      drawFillDot(0, 1, 4.4, fillings[0].key);
    } else {
      drawFillDot(-9, -5, 5.5, 'salmon'); drawFillDot(10, 2, 5, 'cuke'); drawFillDot(-1, 8, 4.6, 'egg');
    }
    dctx = keep;
    g2.restore();
    sliceReady = true;
  }

  function drawPlateScene(now) {
    ctx.drawImage(plateCv, PLT_OX, PLT_OY, 510, 104);
    if (!sliceReady) buildSliceSprite();
    // 寿司段
    for (let si = 0; si < slices.length; si++) {
      const s = slices[si];
      const nowMs = performance.now();
      if (nowMs < s.born) continue;
      let x = s.x, y = s.y, sc2 = 1, alpha = 1, rot = 0;
      // v672: 出生——在盘位原地 pop 出现(短促缩放+淡入+轻微上浮落定), 不再飞落
      const sp = Math.min(1, (nowMs - s.born) / 260);
      if (sp < 1 && !s.dip && !s.eat && !s.rt) {
        const es = 1 - Math.pow(1 - sp, 2);
        alpha = Math.min(1, sp / 0.5);
        sc2 = 0.55 + 0.45 * es;
        y = s.hy + (1 - es) * 8;
      } else if (s.rt) {
        // v666: 没蘸成放回 → 平滑滑回家(之前瞬移, 看着像闪一下)
        const t = Math.min(1, (nowMs - s.rt) / 280);
        const es = 1 - Math.pow(1 - t, 2);
        x = s.fx + (s.hx - s.fx) * es;
        y = s.fy + (s.hy - s.fy) * es;
        sc2 = 1 + (1 - es) * 0.08;
        if (t >= 1) { s.rt = 0; s.x = s.hx; s.y = s.hy; }
      } else if (!s.dip && !s.eat && (s.x !== s.hx || s.y !== s.hy)) {
        /* v670: 关键修复——正在被拖拽的切片不许吸回原位!
           v666-v668 加的这行"离家就吸回"每帧都把拖拽中的切片拍回家, 导致拖动完全不跟手,
           松手才突然滑向碟子或滑回原地 = 装盘一闪一闪/怪怪的真正残留根因(前几轮都修错了地方) */
        if (!(drag >= 0 && slices[drag] === s)) { s.x = s.hx; s.y = s.hy; }
      }
      if (s.dip && !s.eat) {
        const t = Math.min(1, (performance.now() - s.t0) / 450);
        const dhome = s.dip === 'wasabi' ? DISH_R : DISH_L;
        x += (dhome.x - x) * t; y += (dhome.y - 6 - y) * t; rot = t * 0.6;
      }
      if (s.eat) {
        const t = Math.min(1, (performance.now() - s.t0) / 900);
        x += (508 - x) * t; y += (200 - y) * t;
        sc2 = 1 - t * 0.9; alpha = 1 - Math.max(0, t - 0.75) * 4;
        rot = 0.6 + t * 2.2;   // v670: 从蘸好的 0.6 继续转, 不再瞬间跳回 0
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(sc2, sc2);
      ctx.drawImage(sliceCv, -42, -38, 84, 76);
      if (s.dip || s.eat) {
        const sg = ctx.createLinearGradient(0, 6, 0, 24);
        sg.addColorStop(0, 'rgba(107,63,34,0)');
        sg.addColorStop(1, 'rgba(90,50,26,0.55)');
        ctx.save();
        ctx.beginPath(); ctx.ellipse(0, 0, 28, 24, 0, 0, TAU); ctx.clip();
        ctx.fillStyle = sg;
        ctx.fillRect(-30, 4, 60, 24);
        if (s.dip === 'wasabi') {   // v749: 只有蘸了芥末酱油才有绿芥末
          ctx.fillStyle = 'rgba(140,184,78,0.8)';
          ctx.beginPath(); ctx.ellipse(6, 15, 6, 3.4, 0.3, 0, TAU); ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
      // v668: 只有第一块待取的切片提示, 且呼吸更柔(之前 5 个一起不同相位脉动 = 一闪一闪)
      if (!s.dip && !s.eat && drag === -1) {
        const firstIdle = slices.find(q => !q.dip && !q.eat);
        if (firstIdle === s) {
          ctx.globalAlpha = 0.3 + 0.12 * Math.sin(now * 0.0022);
          ctx.font = '600 12px "LXGW WenKai", sans-serif';
          ctx.fillStyle = 'rgba(110,85,60,0.8)';
          ctx.textAlign = 'center';
          ctx.fillText('拖我', s.hx, s.hy - 34);
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  function render(now) {
    ctx.drawImage(bgCv, 0, 0, GAME_W, GAME_H);

    if (step >= 5) {
      drawPlateScene(now);
      /* v672: 立卷切完直接消失, 切片在盘子里原地出现(用户方案)——
         之前立卷渐隐+切片飞落的转场怎么调都有闪烁感 */
    } else {
      if (step < 3) {
        // 海苔+米饭(离屏缓存, 已带纸纹背景)
        ctx.drawImage(noriCv, NORI_OX, NORI_OY, NW + 40, NH + 40);
        for (const f of fillings) {
          drawFillStrip(f.x, f.y, f.w, f.key);
        }
      } else {
        // 卷阶段: 平铺的纸收拢 + 立卷升起
        if (rollP < 1) {
          const wLeft = NW * (1 - rollP * 0.94), hLeft = NH * (1 - rollP * 0.42);
          ctx.save();
          ctx.globalAlpha = 1 - rollP * 0.5;
          const cx0 = NCX - wLeft / 2, cy0 = NY + (NH - hLeft) / 2;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(cx0, cy0, wLeft, hLeft, 12);
          else ctx.rect(cx0, cy0, wLeft, hLeft);
          ctx.clip();
          ctx.drawImage(noriCv, NORI_OX, NORI_OY, NW + 40, NH + 40);
          // 馅料跟着海苔一起收拢, 卷的过程中一直看得见
          const sx = wLeft / NW, sy2 = hLeft / NH;
          for (const f of fillings) {
            const nx = NCX + (f.x - NCX) * sx;
            const ny = cy0 + (f.y - cy0) * sy2;
            drawFillStrip(nx, ny, f.w, f.key);   // v749: 竖条长度不随横向收拢变短
          }
          ctx.restore();
        }
        const gh = ROLL_H * Math.max(0, (rollP - 0.15) / 0.85);
        const gr = ROLL_R * (0.55 + 0.45 * rollP);
        if (gh > 4) {
          ctx.save();
          ctx.translate(NCX, ROLL_BOT);
          ctx.scale(gr / ROLL_R, 1);
          ctx.translate(-NCX, -ROLL_BOT);
          ctx.globalAlpha = Math.min(1, rollP * 2);
          /* v672: 卷动中立卷只露出已升起的部分(从帘面长出来), 不再一开始就是整根;
             底部阴影也被裁掉——之前半卷时下面就挂着一坨分离的深色影子 = "底部多了一块" */
          if (gh < ROLL_H - 2) { ctx.beginPath(); ctx.rect(ROLL_OX - 8, ROLL_BOT - gh, ROLL_R * 2 + 40, gh); ctx.clip(); }
          drawStandingRoll(now);
          ctx.restore();
        }
        if (rollP < 1) {
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.font = '600 15px "LXGW WenKai", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(rollDrag ? '卷卷卷, 继续拖… 🌀' : '按住往右拖, 把寿司卷起来 →', NCX, 42);
          if (!rollDrag) {
            const hx = NCX - 60 + (Math.sin(now * 0.003) + 1) * 55;
            ctx.globalAlpha = 0.8;
            ctx.font = '700 22px "LXGW WenKai", sans-serif';
            ctx.fillStyle = '#D98A4A';
            ctx.fillText('👉', hx, NY + NH / 2 + 8);
            ctx.globalAlpha = 1;
          }
        }
      }
      if (step === 4) drawSushiKnife();
    }

    const tips = { 1: '按住海苔, 像铺被子一样把米饭铺满', 2: '选馅料, 点在海苔中间竖着摆好', 3: '按住往右拖竹帘, 一点点把寿司卷起来', 4: '按住拖刀, 想切多快多慢都可以', 5: '捏起一段, 左碟纯酱油 / 右碟芥末酱油, 随你选' };
    ctx.font = '500 13px "LXGW WenKai", sans-serif';
    ctx.fillStyle = 'rgba(110,85,60,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText(tips[step] || (eaten >= 5 ? '开动吧 🍽️' : ''), GAME_W / 2, GAME_H - 8);

    for (const f of floats) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      ctx.font = '700 17px "LXGW WenKai", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
  }
  function drawSushiKnife() {
    // v668: 切断瞬间的白光刀痕(160ms 淡出)
    for (let i = cutFx.length - 1; i >= 0; i--) {
      const fx = cutFx[i];
      const a = 1 - (performance.now() - fx.t) / 160;
      if (a <= 0) { cutFx.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = a * 0.9;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(NCX - ROLL_R + 2, fx.y); ctx.lineTo(NCX + ROLL_R - 2, fx.y); ctx.stroke();
      ctx.globalAlpha = a * 0.35;
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(knife.x, knife.y);
    const bl = ctx.createLinearGradient(0, -10, 0, 4);
    bl.addColorStop(0, '#F7FBFD');
    bl.addColorStop(1, '#C9D6E0');
    ctx.fillStyle = bl;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-44, -5, 88, 9, 4);
    else ctx.rect(-44, -5, 88, 9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,140,155,0.6)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#8A6440';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(44, -8, 30, 15, 6);
    else ctx.rect(44, -8, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#75522F';
    ctx.beginPath(); ctx.arc(66, -0.5, 3, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function loop(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    update(dt, t);
    render(t);
    // v665: 纸感颗粒已烘焙进背景缓存, 不再每帧全画布 multiply(卡顿大头)
    raf = requestAnimationFrame(loop);
  }
  status.textContent = '铺米饭 → 竖着放馅 → 卷起立好 → 切段 → 选碟子蘸酱油吃';
  renderTools();
  raf = requestAnimationFrame(loop);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    }
  };
}

/* ---------- 游戏: 剪纸窗花(v663) ----------
   圆形红纸 → 对折两次成扇形 → 拿剪刀随便剪 → 展开, 圆形窗花 */
function buildPapercut(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const TAU = Math.PI * 2;
  const CX = 280, CY = 188;                  // 圆心(折线交点)
  const R = 138;                             // 纸半径
  const COLORS = [
    { hi: '#E04B3C', lo: '#B93024' },
    { hi: '#D94A62', lo: '#AD2F49' },
    { hi: '#E06A38', lo: '#B44A22' },
    { hi: '#C64E7E', lo: '#9C3560' },
    { hi: '#D08A3A', lo: '#A56520' },
  ];
  let round = 0;
  let step = 'flat';                         // flat → fold1 → fold2 → cut → open → done
  let foldT = 0, openT = 0;
  const strokes = [];                        // 剪切线: 扇形局部坐标 {u,v}(u=x-CX, v=y-CY)
  let cur = null, cutLen = 0;
  let openBtn = null;   // v673: 「展开」按钮引用(剪够长度只翻 disabled, 不重建 DOM)
  const golds = [], floats = [];
  const sc = { x: CX + R / 2, y: CY + R / 2 };
  let scA = Math.PI * 0.25, scPT = null;   // v667: 剪刀朝向(跟随剪切方向)
  const ptr = { down: false, x: 0, y: 0 };
  let raf = 0, lastT = 0, lastSnip = 0;

  // 折好那层(右下 1/4 圆)的离屏画布(镂空=真透明)
  // v673: ×DPR 高清化(此前 1x 放进高清画布发虚) + 背景渐变烘焙(每帧新建渐变省掉)
  const QDPR = Math.min(2, window.devicePixelRatio || 1);
  const qcv = document.createElement('canvas');
  qcv.width = R * QDPR; qcv.height = R * QDPR;
  const qctx = qcv.getContext('2d');
  qctx.setTransform(QDPR, 0, 0, QDPR, 0, 0);
  const bgCv = document.createElement('canvas');
  bgCv.width = GAME_W * QDPR; bgCv.height = GAME_H * QDPR;
  (function bakeBg() {
    const b = bgCv.getContext('2d');
    b.setTransform(QDPR, 0, 0, QDPR, 0, 0);
    const bg = b.createLinearGradient(0, 0, 0, GAME_H);
    bg.addColorStop(0, '#F7F1E4');
    bg.addColorStop(1, '#EFE4CE');
    b.fillStyle = bg;
    b.fillRect(0, 0, GAME_W, GAME_H);
    wcPaper(b, 0, 0, GAME_W, GAME_H);   // v673: 纸纹一并烘焙(此前每帧全画布 multiply = 卡顿主因之三, 同寿司 v665)
  })();

  const status = document.createElement('span');
  status.className = 'game-status';
  stage.appendChild(status);
  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  stage.appendChild(tools);
  function float(x, y, text, color, life) { floats.push({ x, y, text, color: color || '#B8452F', life: life || 1.3 }); }

  function wedgePath(c) {
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(R, 0);
    c.arc(0, 0, R, 0, Math.PI / 2);
    c.closePath();
  }

  function redrawQuarter() {
    const col = COLORS[round];
    qctx.clearRect(0, 0, R, R);
    qctx.save();
    wedgePath(qctx);
    const g = qctx.createRadialGradient(R * 0.32, R * 0.28, R * 0.12, R * 0.5, R * 0.5, R * 1.25);
    g.addColorStop(0, col.hi);
    g.addColorStop(1, col.lo);
    qctx.fillStyle = g;
    qctx.fill();
    // 纸面淡淡折痕
    qctx.strokeStyle = 'rgba(255,255,255,0.10)';
    qctx.lineWidth = 1.5;
    for (let i = 1; i <= 2; i++) {
      qctx.beginPath();
      qctx.moveTo(R * 0.16 * i + 8, R * 0.12);
      qctx.quadraticCurveTo(R * 0.3 * i, R * 0.4 * i, R * 0.1, R * 0.55 * i);
      qctx.stroke();
    }
    // 弧边积色
    qctx.strokeStyle = 'rgba(95,22,16,0.4)';
    qctx.lineWidth = 2;
    qctx.beginPath();
    qctx.arc(0, 0, R - 1, 0, Math.PI / 2);
    qctx.stroke();
    qctx.restore();
    if (strokes.length || cur) {
      qctx.save();
      wedgePath(qctx);
      qctx.clip();
      qctx.globalCompositeOperation = 'destination-out';
      qctx.strokeStyle = '#000';
      qctx.lineWidth = 11;
      qctx.lineCap = 'round';
      qctx.lineJoin = 'round';
      const draw = (st) => {
        if (st.length < 2) {
          if (st.length === 1) { qctx.beginPath(); qctx.arc(st[0].u, st[0].v, 5.5, 0, TAU); qctx.fill(); }
          return;
        }
        qctx.beginPath();
        qctx.moveTo(st[0].u, st[0].v);
        for (let i = 1; i < st.length; i++) qctx.lineTo(st[i].u, st[i].v);
        qctx.stroke();
      };
      for (const st of strokes) draw(st);
      if (cur) draw(cur);
      qctx.restore();
    }
  }

  function renderTools() {
    tools.innerHTML = '';
    openBtn = null;
    const mkRow = () => { const r = document.createElement('div'); r.className = 'st-row'; tools.appendChild(r); return r; };
    if (step === 'flat') {
      const row = mkRow();
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '📄 对折';
      b.addEventListener('click', e => { e.stopPropagation(); step = 'fold1'; foldT = performance.now(); playSfx('game.bubblePop', { volume: 0.5 }); renderTools(); });
      row.appendChild(b);
    }
    if (step === 'fold1') {
      const row = mkRow();
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '📄 再对折';
      b.addEventListener('click', e => { e.stopPropagation(); step = 'fold2'; foldT = performance.now(); playSfx('game.bubblePop', { volume: 0.5 }); setTimeout(() => { step = 'cut'; renderTools(); }, 360); });
      row.appendChild(b);
    }
    if (step === 'cut') {
      const row = mkRow();
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '✨ 展开';
      openBtn = b;
      b.disabled = cutLen < 240 && strokes.length < 4;
      b.addEventListener('click', e => {
        e.stopPropagation();
        if (b.disabled) return;
        if (cur) { strokes.push(cur); cur = null; }
        step = 'open'; openT = performance.now();
        playSfx('site.chime', { volume: 0.7 });
        renderTools();
      });
      row.appendChild(b);
    }
    if (step === 'done') {
      /* v749: 窗花也能保存收藏了 */
      const row = mkRow();
      const bSave = document.createElement('button');
      bSave.type = 'button'; bSave.className = 'st-chip fire-chip'; bSave.textContent = '💾 收藏这幅窗花';
      bSave.addEventListener('click', e => { e.stopPropagation(); openArtSaveDialog('couplet', artExportURL(cv, 640)); });
      row.appendChild(bSave);
      const rowB = mkRow();
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '✂️ 再剪一张';
      b.addEventListener('click', e => { e.stopPropagation(); resetGame(); });
      rowB.appendChild(b);
      const bSee = document.createElement('button');
      bSee.type = 'button'; bSee.className = 'st-chip'; bSee.textContent = '🖼 看展览柜';
      bSee.addEventListener('click', e => { e.stopPropagation(); openGallery(); });
      rowB.appendChild(bSee);
    }
  }
  function resetGame() {
    round = (round + 1) % COLORS.length;
    bakePaper();
    strokes.length = 0; cur = null; cutLen = 0;
    golds.length = 0;
    step = 'flat';
    redrawQuarter();
    renderTools();
  }

  /* v673: 下刀位置解放——手指可以落在纸外/滑出纸边, 点一律投影回扇形纸面:
     超出半径→收回弧边, 越过两条折边→贴在折边上。一笔横跨边界不再被切断 */
  function clampPt(x, y) {
    let u = x - CX, v = y - CY;
    const r = Math.hypot(u, v);
    if (r > R - 1) { u = u * (R - 1) / r; v = v * (R - 1) / r; }
    if (u < 0) u = 0;
    if (v < 0) v = 0;
    return { u, v };
  }
  /* v673: 增量剪切——新剪口直接 destination-out 到离屏纸面上,
     不再每移动一点就全量重画渐变+折痕+全部历史剪口(卡顿主因之一) */
  function cutSeg(a, b) {
    qctx.save();
    wedgePath(qctx);
    qctx.clip();
    qctx.globalCompositeOperation = 'destination-out';
    qctx.strokeStyle = '#000';
    qctx.lineWidth = 11;
    qctx.lineCap = 'round';
    qctx.lineJoin = 'round';
    qctx.beginPath();
    qctx.moveTo(a.u, a.v);
    qctx.lineTo(b.u, b.v);
    qctx.stroke();
    qctx.restore();
  }
  function cutDot(a) {
    qctx.save();
    wedgePath(qctx);
    qctx.clip();
    qctx.globalCompositeOperation = 'destination-out';
    qctx.fillStyle = '#000';
    qctx.beginPath(); qctx.arc(a.u, a.v, 5.5, 0, TAU); qctx.fill();
    qctx.restore();
  }

  function onDown(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    ptr.down = true; ptr.x = p.x; ptr.y = p.y;
    /* v673: 纸面附近(R+50 内)任意位置都能落剪, 落在纸外的点投影到纸面 */
    if (step === 'cut' && Math.hypot(p.x - CX, p.y - CY) <= R + 50) {
      cur = [clampPt(p.x, p.y)];
      cutDot(cur[0]);
    }
  }
  function onMove(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    ptr.x = p.x; ptr.y = p.y;
    if (ptr.down && step === 'cut' && cur) {
      const q = clampPt(p.x, p.y);   // v673: 滑出纸面也不断笔, 贴边/贴折边继续剪
      const lp = cur[cur.length - 1];
      const d = Math.hypot(q.u - lp.u, q.v - lp.v);
      if (d < 3) return;
      cur.push(q);
      cutSeg(lp, q);
      cutLen += d;
      const now = performance.now();
      if (now - lastSnip > 260) { playSfx('game.soapSlice', { volume: 0.28 }); lastSnip = now; }
      if (openBtn) openBtn.disabled = cutLen < 240 && strokes.length < 4;   // v673: 不再每个移动点重建工具栏 DOM(卡顿主因之二)
    }
  }
  function onUp() {
    ptr.down = false;
    if (cur) { strokes.push(cur); cur = null; }
  }
  cv.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  function inQ(x, y) {
    if (x < CX || x > CX + R || y < CY || y > CY + R) return false;
    return (x - CX) * (x - CX) + (y - CY) * (y - CY) <= R * R;
  }

  // 一整张圆纸(水彩感) —— v673: 烘焙进离屏(对折阶段每帧画两次+各建一个径向渐变, 也在白烧性能)
  const paperCv = document.createElement('canvas');
  paperCv.width = (R * 2 + 8) * QDPR; paperCv.height = (R * 2 + 8) * QDPR;
  function bakePaper() {
    const c = paperCv.getContext('2d');
    const col = COLORS[round];
    c.setTransform(QDPR, 0, 0, QDPR, 0, 0);
    c.clearRect(0, 0, R * 2 + 8, R * 2 + 8);
    const g = c.createRadialGradient(R - R * 0.3, R - R * 0.35, R * 0.15, R, R, R * 1.15);
    g.addColorStop(0, col.hi);
    g.addColorStop(1, col.lo);
    c.save();
    c.translate(R, R);
    c.beginPath(); c.arc(0, 0, R, 0, TAU);
    c.fillStyle = g; c.fill();
    c.lineWidth = 2.5;
    c.strokeStyle = 'rgba(100,25,18,0.35)';
    c.beginPath(); c.arc(0, 0, R - 1.2, 0, TAU); c.stroke();
    c.restore();
  }
  function drawPaperFull() {
    ctx.drawImage(paperCv, CX - R - 4, CY - R - 4, R * 2 + 8, R * 2 + 8);
  }
  function drawFoldLines() {
    ctx.strokeStyle = 'rgba(255,235,180,0.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(CX + R, CY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(CX, CY + R); ctx.stroke();
    ctx.setLineDash([]);
  }
  function drawQuarterLayer() {
    ctx.drawImage(qcv, CX, CY, R, R);
    drawFoldLines();
  }
  function drawScissors(x, y, ang) {
    ctx.save();
    ctx.translate(x, y);
    // v667: 刀刃指向移动方向(原形状刀刃朝 -y, 故旋转 ang+90°)
    ctx.rotate((ang == null ? Math.PI / 4 : ang) + Math.PI / 2);
    ctx.strokeStyle = '#9FB4C4';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-3, -16); ctx.lineTo(-7, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, -16); ctx.lineTo(7, 6); ctx.stroke();
    ctx.strokeStyle = '#D98A4A';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(-6, 12, 5, Math.PI * 0.15, Math.PI * 1.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, 12, 5, -Math.PI * 0.2, Math.PI * 0.85); ctx.stroke();
    ctx.restore();
  }

  function update(dt, now) {
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= dt; f.y -= dt * 26;
      if (f.life <= 0) floats.splice(i, 1);
    }
    for (const g of golds) { g.x += g.vx * dt; g.y += g.vy * dt; g.rot += dt * 3; g.life -= dt * 0.5; }
    for (let i = golds.length - 1; i >= 0; i--) if (golds[i].life <= 0) golds.splice(i, 1);
    sc.x += (ptr.x - sc.x) * 0.55;
    sc.y += (ptr.y - sc.y) * 0.55;
    // v667: 剪刀朝向跟随移动方向(全方位可剪, 刀刃始终指向前进方向)
    if (step === 'cut') {
      if (!scPT) scPT = { x: sc.x, y: sc.y };
      const dx = sc.x - scPT.x, dy = sc.y - scPT.y;
      if (dx * dx + dy * dy > 4) {
        const target = Math.atan2(dy, dx);
        let da = target - scA;
        while (da > Math.PI) da -= TAU;
        while (da < -Math.PI) da += TAU;
        scA += da * 0.3;
        scPT = { x: sc.x, y: sc.y };
      }
    } else scPT = null;
    if (step === 'open' && now - openT > 1150) {
      step = 'done';
      float(CX, CY - R - 18, '展开! 好漂亮的圆形窗花 ✨', '#B8452F', 1.8);
      playSfx('site.chime', { volume: 0.85 });
      for (let i = 0; i < 30; i++) {
        golds.push({ x: CX + (Math.random() - 0.5) * R * 2.2, y: CY + (Math.random() - 0.5) * R * 2.2, vy: 26 + Math.random() * 40, vx: (Math.random() - 0.5) * 20, life: 1.8, r: 1.2 + Math.random() * 1.8, rot: Math.random() * TAU });
      }
      renderTools();
    }
    status.textContent = step === 'flat' ? '先把圆纸对折' : step === 'fold1' ? '再对折一次' : step === 'cut' ? '想剪什么剪什么, 剪完展开看惊喜' : step === 'open' ? '展开咯…' : '窗花完成 ✨';
  }

  function render(now) {
    ctx.drawImage(bgCv, 0, 0, GAME_W, GAME_H);   // v673: 背景烘焙, 不再每帧新建渐变

    if (step === 'flat' || step === 'fold1') {
      const t = step === 'fold1' ? Math.min(1, (now - foldT) / 300) : 0;
      const e = 1 - Math.pow(1 - t, 3);
      // 下半(折过去后留着的那半)
      ctx.save();
      ctx.beginPath(); ctx.rect(0, CY, GAME_W, GAME_H - CY); ctx.clip();
      drawPaperFull();
      ctx.restore();
      // 上半(往中线合拢)
      if (e < 1) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, GAME_W, CY); ctx.clip();
        ctx.globalAlpha = 1 - e * 0.85;
        ctx.translate(0, CY); ctx.scale(1, 1 - e * 0.96); ctx.translate(0, -CY);
        drawPaperFull();
        ctx.restore();
      } else if (step === 'fold1') {
        ctx.strokeStyle = 'rgba(255,235,180,0.9)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.moveTo(CX - R, CY); ctx.lineTo(CX + R, CY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '600 14px "LXGW WenKai", sans-serif';
        ctx.fillStyle = 'rgba(150,70,50,0.75)';
        ctx.textAlign = 'center';
        ctx.fillText('对折成半圆啦, 再折一次 →', CX, CY - R - 14);
      }
    } else if (step === 'fold2') {
      const t = Math.min(1, (now - foldT) / 320);
      const e = 1 - Math.pow(1 - t, 3);
      // 右下 1/4(留着)
      ctx.save();
      ctx.beginPath(); ctx.rect(CX, CY, GAME_W - CX, GAME_H - CY); ctx.clip();
      drawPaperFull();
      ctx.restore();
      // 左下 1/4(往中线合)
      if (e < 1) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, CY, CX, GAME_H - CY); ctx.clip();
        ctx.globalAlpha = 1 - e * 0.85;
        ctx.translate(CX, 0); ctx.scale(1 - e * 0.96, 1); ctx.translate(-CX, 0);
        drawPaperFull();
        ctx.restore();
      }
    } else if (step === 'cut') {
      drawQuarterLayer();
      drawScissors(sc.x, sc.y, scA);
      if (!strokes.length) {
        ctx.font = '600 13px "LXGW WenKai", sans-serif';
        ctx.fillStyle = 'rgba(150,70,50,0.75)';
        ctx.textAlign = 'center';
        ctx.fillText('按住在扇形上剪花样 · 想往哪剪往哪剪 · 折边剪口展开变大镂空', CX + R / 2, CY - 16);
      }
    } else {
      // open / done: 展开动画 → 圆形四折对称窗花
      const t = step === 'open' ? Math.min(1, (now - openT) / 1150) : 1;
      const p1 = Math.min(1, t / 0.5);
      const p2 = Math.max(0, Math.min(1, (t - 0.5) / 0.5));
      const e1 = 1 - Math.pow(1 - p1, 3), e2 = 1 - Math.pow(1 - p2, 3);
      const drawMirror = (mx, my) => {
        ctx.save();
        ctx.translate(mx ? 2 * CX : 0, my ? 2 * CY : 0);
        ctx.scale(mx ? -1 : 1, my ? -1 : 1);
        ctx.drawImage(qcv, CX, CY, R, R);
        ctx.restore();
      };
      drawMirror(false, false);                                   // 右下
      if (e1 > 0) {                                               // 左下(向左展开)
        ctx.save();
        ctx.beginPath();
        ctx.rect(CX - R * e1, CY, R * e1 + 1, R);
        ctx.clip();
        drawMirror(true, false);
        ctx.restore();
      }
      if (e2 > 0) {                                               // 上排(向上展开)
        ctx.save();
        ctx.beginPath();
        ctx.rect(CX - R * e1, CY - R * e2, R * (1 + e1) + 1, R * e2 + 1);
        ctx.clip();
        drawMirror(false, true);
        if (e1 > 0) drawMirror(true, true);
        ctx.restore();
      }
      // 完成落定: 轻微呼吸放大
      if (step === 'done') {
        const pop = 1 + Math.sin(Math.min(1, (now - openT - 1150) / 500) * Math.PI) * 0.015;
        ctx.save();
        ctx.translate(CX, CY);
        ctx.scale(pop, pop);
        ctx.translate(-CX, -CY);
        ctx.globalAlpha = 0.35;
        drawMirror(false, false); drawMirror(true, false); drawMirror(false, true); drawMirror(true, true);
        ctx.restore();
      }
      for (const g of golds) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, g.life));
        ctx.translate(g.x, g.y);
        ctx.rotate(g.rot);
        ctx.fillStyle = '#F2CE6B';
        ctx.fillRect(-g.r, -g.r * 0.5, g.r * 2, g.r);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (step === 'done') {
        ctx.font = '600 14px "LXGW WenKai", sans-serif';
        ctx.fillStyle = 'rgba(150,70,50,0.75)';
        ctx.textAlign = 'center';
        ctx.fillText('贴到窗户上, 就是最特别的圆形窗花 🧧', CX, CY + R + 30);
      }
    }

    ctx.font = '500 13px "LXGW WenKai", sans-serif';
    ctx.fillStyle = 'rgba(120,70,50,0.55)';
    ctx.textAlign = 'center';
    const tip = { flat: '一张圆形红纸, 先对折', fold1: '沿着中线再对折一次', cut: '剪刀跟手, 想往哪剪往哪剪', open: '', done: '' }[step] || '';
    ctx.fillText(tip, GAME_W / 2, GAME_H - 8);

    for (const f of floats) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      ctx.font = '700 17px "LXGW WenKai", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
  }

  function loop(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    update(dt, t);
    render(t);
    raf = requestAnimationFrame(loop);
  }
  bakePaper();
  redrawQuarter();
  renderTools();
  raf = requestAnimationFrame(loop);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    }
  };
}

/* ---------- 游戏: 陶艺拉坯(v663) ----------
   转盘上一整块平滑泥坯(拖动捏轮廓, 表面张力自动顺滑) → 自由上色(多色画笔+渐变) → 出窑 */
function buildPottery(stage) {
  const { cv, ctx } = makeGameCanvas(stage, GAME_W, GAME_H);
  const TAU = Math.PI * 2;
  const CXp = 280, TBL = 312;
  const WY = 296;
  const S0 = 288, SH = 7.2, NS = 30;         // 泥料底部y / 每层高 / 最大层数
  const PAINTS = [
    { name: '青瓷', c: '#7FB69B' },
    { name: '柿釉', c: '#DE8F58' },
    { name: '天青', c: '#A3BCD8' },
    { name: '奶白', c: '#F2E7D6' },
    { name: '胭脂', c: '#C75B5B' },
    { name: '藤黄', c: '#E8C458' },
    { name: '黛蓝', c: '#5E7FA8' },
    { name: '酱棕', c: '#8A5A3B' },
  ];
  let prof = [], rowPainted = [], height = 5;
  const strokes = [];                        // 上色笔迹 {pts:[{x,y}], c}
  let curStroke = null;
  let paintSel = 0, potGrad = null, gradT0 = 0;
  function initClay() {
    prof = []; rowPainted = [];
    strokes.length = 0; curStroke = null; potGrad = null;
    height = 5;
    for (let i = 0; i < NS; i++) {
      prof.push(i < height ? Math.max(10, 40 - i * 6) : 0);
      rowPainted.push(0);
    }
  }
  initClay();
  let step = 1;                              // 1 塑形 2 上色 3 完成
  let water = false;
  const spin = { ang: 0, v: 1.1 };
  const specks = [], sparks = [], floats = [];
  const ptr = { down: false, x: 0, y: 0 };
  let raf = 0, lastT = 0, lastSquish = 0, doneT = 0;

  const status = document.createElement('span');
  status.className = 'game-status';
  stage.appendChild(status);
  const tools = document.createElement('div');
  tools.className = 'slime-tools';
  tools.style.marginTop = '10px';
  stage.appendChild(tools);
  function float(x, y, text, color, life) { floats.push({ x, y, text, color: color || '#A8642F', life: life || 1.3 }); }

  function paintedRows() {
    let cnt = 0;
    for (let i = 0; i < height; i++) if (rowPainted[i]) cnt++;
    return cnt;
  }

  function renderTools() {
    tools.innerHTML = '';
    const mkRow = () => { const r = document.createElement('div'); r.className = 'st-row'; tools.appendChild(r); return r; };
    if (step === 1) {
      const row = mkRow();
      const w = document.createElement('button');
      w.type = 'button'; w.className = 'st-chip' + (water ? ' active' : ''); w.textContent = '💧 加水修坯';
      w.addEventListener('click', e => { e.stopPropagation(); water = !water; renderTools(); });
      row.appendChild(w);
      if (height >= 14) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '下一步 · 上色 →';
        b.addEventListener('click', e => { e.stopPropagation(); step = 2; water = false; float(CXp, 150, '选颜色, 想怎么画就怎么画 🎨', '#A8642F', 1.5); playSfx('site.chime', { volume: 0.6 }); renderTools(); });
        row.appendChild(b);
      }
    }
    if (step === 2) {
      const row = mkRow();
      PAINTS.forEach((g, i2) => {
        const chip = document.createElement('button');
        chip.type = 'button'; chip.className = 'st-chip' + (i2 === paintSel ? ' active' : '');
        chip.innerHTML = '<i class="st-dotc" style="--c:' + g.c + '"></i>' + g.name;
        chip.addEventListener('click', e => { e.stopPropagation(); paintSel = i2; renderTools(); });
        row.appendChild(chip);
      });
      const rowG = mkRow();
      const gch = document.createElement('button');
      gch.type = 'button'; gch.className = 'st-chip'; gch.textContent = '🌈 渐变上釉';
      gch.addEventListener('click', e => {
        e.stopPropagation();
        potGrad = PAINTS[paintSel].c; gradT0 = performance.now();
        for (let i = 0; i < height; i++) rowPainted[i] = 1;
        playSfx('site.chime', { volume: 0.6 });
        float(CXp, 160, '渐变釉淋上啦 ✨', '#A8642F', 1.4);
        renderTools();
      });
      rowG.appendChild(gch);
      if (paintedRows() / height >= 0.9) {
        const row2 = mkRow();
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '✅ 出窑';
        b.addEventListener('click', e => {
          e.stopPropagation(); step = 3; doneT = performance.now();
          curStroke = null;
          float(CXp, 140, '出窑! 你的小陶器 🏺', '#A86A2F', 2);
          playSfx('site.chime', { volume: 0.9 });
          for (let i = 0; i < 26; i++) sparks.push({ x: CXp + (Math.random() - 0.5) * 160, y: 240 + (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 40, vx: (Math.random() - 0.5) * 26, life: 1.8, r: 1.4 + Math.random() * 2 });
          renderTools();
        });
        row2.appendChild(b);
      }
    }
    if (step === 3) {
      /* v749: 满意的放进展览柜, 不满意扔掉重来 */
      const row = mkRow();
      const bKeep = document.createElement('button');
      bKeep.type = 'button'; bKeep.className = 'st-chip fire-chip'; bKeep.textContent = '🏛 放入展览柜';
      bKeep.addEventListener('click', e => {
        e.stopPropagation();
        openArtSaveDialog('pottery', artExportURL(cv, 640));
      });
      row.appendChild(bKeep);
      const rowB = mkRow();
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'st-chip fire-chip'; b.textContent = '🗑 扔掉重来';
      b.addEventListener('click', e => { e.stopPropagation(); initClay(); step = 1; water = false; sparks.length = 0; renderTools(); });
      rowB.appendChild(b);
      const bSee = document.createElement('button');
      bSee.type = 'button'; bSee.className = 'st-chip'; bSee.textContent = '🖼 看展览柜';
      bSee.addEventListener('click', e => { e.stopPropagation(); openGallery(); });
      rowB.appendChild(bSee);
    }
  }

  function inPot(x, y) {
    const i = Math.round((S0 - y) / SH);
    if (i < 0 || i >= height) return false;
    return Math.abs(x - CXp) <= prof[i] + 6;
  }
  function markRow(y) {
    const i = Math.round((S0 - y) / SH);
    for (let k = Math.max(0, i - 1); k <= Math.min(height - 1, i + 1); k++) rowPainted[k] = 1;
  }

  function onDown(e) {
    const p = canvasPos(cv, e, GAME_W, GAME_H);
    ptr.down = true; ptr.x = p.x; ptr.y = p.y;
    if (step === 2 && inPot(p.x, p.y)) {
      curStroke = { pts: [{ x: p.x, y: p.y }], c: PAINTS[paintSel].c };
      markRow(p.y);
    }
  }
  function onMove(e) {
    // v749: 合并采样 + 细分插值 —— 上色丝滑不断线(同 v745 激光笔方案), 消除"延迟/割裂"
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    for (const ev of evs) {
      const p = canvasPos(cv, ev, GAME_W, GAME_H);
      ptr.x = p.x; ptr.y = p.y;
      if (ptr.down && step === 2 && curStroke) {
        if (!inPot(p.x, p.y)) continue;
        const lp = curStroke.pts[curStroke.pts.length - 1];
        const d = Math.hypot(p.x - lp.x, p.y - lp.y);
        if (d < 1.5) continue;
        const n = Math.max(1, Math.round(d / 1.5));
        for (let i = 1; i <= n; i++) {
          curStroke.pts.push({ x: lp.x + (p.x - lp.x) * i / n, y: lp.y + (p.y - lp.y) * i / n });
        }
        markRow(p.y);
        if (Math.random() < 0.12) playSfx('game.sprinkle', { volume: 0.1 });
      }
    }
  }
  function onUp() {
    ptr.down = false;
    if (curStroke) { strokes.push(curStroke); curStroke = null; renderTools(); }
  }
  cv.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  function update(dt, now) {
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= dt; f.y -= dt * 26;
      if (f.life <= 0) floats.splice(i, 1);
    }
    for (const s of specks) { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 90 * dt; s.life -= dt * 1.6; }
    for (let i = specks.length - 1; i >= 0; i--) if (specks[i].life <= 0) specks.splice(i, 1);
    for (const s of sparks) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * 0.7; }
    for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].life <= 0) sparks.splice(i, 1);

    spin.v += ((step === 3 ? 0.8 : (ptr.down ? 3.4 : 1.2)) - spin.v) * Math.min(1, dt * 2.5);
    spin.ang += spin.v * dt;

    if (ptr.down && step === 1) {
      const i = Math.round((S0 - ptr.y) / SH);
      if (i >= 0 && i < NS && Math.abs(ptr.x - CXp) < 120) {
        if (i < height) {
          const target = Math.max(6, Math.min(92, Math.abs(ptr.x - CXp)));
          prof[i] += (target - prof[i]) * 0.45;
          if (i > 0) prof[i - 1] += (prof[i] - prof[i - 1]) * 0.3;
          if (i < height - 1) prof[i + 1] += (prof[i] - prof[i + 1]) * 0.3;
          const now2 = performance.now();
          if (now2 - lastSquish > 300) { playSfx('game.slimePour', { volume: 0.16 }); lastSquish = now2; }
          if (Math.random() < dt * 5) specks.push({ x: CXp + (Math.random() - 0.5) * prof[i], y: S0 - i * SH, vx: (Math.random() - 0.5) * 60, vy: -40 - Math.random() * 40, life: 0.9, r: 1.6 + Math.random() * 1.6 });
        } else if (i === height && Math.abs(ptr.x - CXp) > 10 && height < NS) {
          // 向上提拉, 壁变高
          height += 1;
          prof[height - 1] = Math.max(6, prof[height - 2] * 0.88);
          playSfx('game.slimePour', { volume: 0.3 });
        }
        if (water) {
          for (let k = Math.max(1, i - 2); k <= Math.min(height - 2, i + 2); k++) {
            prof[k] = prof[k] * 0.82 + (prof[k - 1] + prof[k + 1]) / 2 * 0.18;
          }
        }
        renderTools();
      }
    }
    // 泥的表面张力: 整条轮廓每一帧都轻微顺滑
    if (step === 1) {
      for (let k = 1; k < height - 1; k++) {
        const avg = (prof[k - 1] + prof[k + 1]) / 2;
        prof[k] += (avg - prof[k]) * 0.07;
      }
    }
    status.textContent = step === 1 ? ('拉坯中 · 高度 ' + Math.round(height / NS * 100) + '%' + (water ? ' · 修坯光滑中' : '')) : step === 2 ? '选颜色, 按住往坯上画, 画完出窑' : '完成 ✨';
  }

  // 整块泥坯的平滑轮廓路径(二次曲线过中点, 绝无堆砌感)
  function potPath(c) {
    const n = height;
    const topY = S0 - (n - 1) * SH;
    c.beginPath();
    c.moveTo(CXp + prof[0], S0);
    let px = CXp + prof[0], py = S0;
    for (let i = 1; i < n; i++) {
      const x = CXp + prof[i], y = S0 - i * SH;
      c.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
      px = x; py = y;
    }
    c.lineTo(px, py);
    // 口沿前缘(微微下垂的弧)
    c.quadraticCurveTo(CXp, topY + SH * 0.9, CXp - prof[n - 1], topY);
    // 左侧自顶向下
    px = CXp - prof[n - 1]; py = topY;
    for (let i = n - 2; i >= 0; i--) {
      const x = CXp - prof[i], y = S0 - i * SH;
      c.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
      px = x; py = y;
    }
    c.lineTo(px, py);
    // 底
    c.quadraticCurveTo(CXp, S0 + 8, CXp + prof[0], S0);
    c.closePath();
  }

  function render(now) {
    const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
    bg.addColorStop(0, '#FBF3E6');
    bg.addColorStop(1, '#F1E2CC');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    // 墙上的置物架与小罐(氛围)
    ctx.fillStyle = 'rgba(170,130,90,0.22)';
    ctx.fillRect(48, 60, 150, 8);
    ctx.fillRect(372, 92, 140, 8);
    ctx.fillStyle = '#C98B62';
    ctx.fillRect(70, 40, 20, 14);
    ctx.beginPath(); ctx.ellipse(80, 52, 13, 10, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#9FB8C8';
    ctx.fillRect(153, 38, 14, 13);
    ctx.beginPath(); ctx.ellipse(160, 50, 9, 8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#D8A87A';
    ctx.fillRect(420, 72, 20, 13);
    ctx.beginPath(); ctx.ellipse(430, 84, 12, 9, 0, 0, TAU); ctx.fill();
    // 桌面
    const wood = ctx.createLinearGradient(0, TBL, 0, GAME_H);
    wood.addColorStop(0, '#E2C096');
    wood.addColorStop(1, '#D2A87A');
    ctx.fillStyle = wood;
    ctx.fillRect(0, TBL, GAME_W, GAME_H - TBL);

    // 转盘
    ctx.fillStyle = '#5A5550';
    ctx.beginPath(); ctx.ellipse(CXp, TBL + 6, 128, 26, 0, 0, TAU); ctx.fill();
    wcEllipse(ctx, CXp, WY + 8, 118, 22, '#78726C', '#54504A', 21);
    wcEllipse(ctx, CXp, WY, 112, 20, '#6E6862', '#3E3A36', 22);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    for (let k = 0; k < 8; k++) {
      const a = spin.ang + k * TAU / 8;
      ctx.beginPath();
      ctx.moveTo(CXp + Math.cos(a) * 46, WY + Math.sin(a) * 8.4);
      ctx.lineTo(CXp + Math.cos(a) * 100, WY + Math.sin(a) * 18);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(CXp + Math.cos(spin.ang * 1.3) * 108, WY + Math.sin(spin.ang * 1.3) * 19, 2.2, 0, TAU); ctx.fill();

    const topY = S0 - (height - 1) * SH;
    // 整块泥坯: 阴影 + 渐变主体 + 受光 + 上色层 + 边缘积色
    wcShadow(ctx, CXp, S0 + 7, Math.max(60, prof[0] * 1.15), 12, 0.2);
    potPath(ctx);
    const cg = ctx.createLinearGradient(0, topY - 20, 0, S0);
    cg.addColorStop(0, '#DCA47F');
    cg.addColorStop(1, '#B06B49');
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.save();
    potPath(ctx);
    ctx.clip();
    // 左侧受光 / 右侧背光
    const hg = ctx.createLinearGradient(CXp - 95, 0, CXp + 60, 0);
    hg.addColorStop(0, 'rgba(255,255,255,0.30)');
    hg.addColorStop(0.42, 'rgba(255,255,255,0.04)');
    hg.addColorStop(1, 'rgba(88,48,28,0.16)');
    ctx.fillStyle = hg;
    ctx.fillRect(CXp - 120, topY - 30, 240, height * SH + 70);
    // 渐变釉(淋上去的动画)
    if (potGrad) {
      const t = Math.min(1, (now - gradT0) / 900);
      const gg = ctx.createLinearGradient(0, topY - 16, 0, S0 + 6);
      gg.addColorStop(0, _wcMix('#FFFFFF', potGrad, 0.38));
      gg.addColorStop(0.5, potGrad);
      gg.addColorStop(1, _wcMix('#402616', potGrad, 0.35));
      ctx.globalAlpha = 0.92 * t;
      ctx.fillStyle = gg;
      ctx.fillRect(CXp - 120, topY - 16, 240, height * SH + 52);
      ctx.globalAlpha = 1;
    }
    // 自由上色的笔迹 —— v749: 软边笔刷, 外晕/过渡/内芯三层叠出羽化边缘, 相邻颜色自然融合
    // (curStroke 也实时上屏 —— 之前要松手才出现, 也是"延迟感"来源之一)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const allStrokes = curStroke ? strokes.concat([curStroke]) : strokes;
    for (const st of allStrokes) {
      if (st.pts.length < 2) {
        const g0 = ctx.createRadialGradient(st.pts[0].x, st.pts[0].y, 0, st.pts[0].x, st.pts[0].y, 7);
        g0.addColorStop(0, _wcRgba(st.c, 0.9));
        g0.addColorStop(0.55, _wcRgba(st.c, 0.45));
        g0.addColorStop(1, _wcRgba(st.c, 0));
        ctx.fillStyle = g0;
        ctx.beginPath(); ctx.arc(st.pts[0].x, st.pts[0].y, 7, 0, TAU); ctx.fill();
        continue;
      }
      const paintPath = () => {
        ctx.beginPath();
        ctx.moveTo(st.pts[0].x, st.pts[0].y);
        for (let i = 1; i < st.pts.length - 1; i++) {
          const mx = (st.pts[i].x + st.pts[i + 1].x) / 2, my = (st.pts[i].y + st.pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(st.pts[i].x, st.pts[i].y, mx, my);
        }
        const le = st.pts[st.pts.length - 1];
        ctx.lineTo(le.x, le.y);
      };
      ctx.strokeStyle = st.c;
      ctx.lineWidth = 13; ctx.globalAlpha = 0.14; paintPath(); ctx.stroke();   // 羽化外晕
      ctx.lineWidth = 9; ctx.globalAlpha = 0.34; paintPath(); ctx.stroke();    // 中层过渡
      ctx.lineWidth = 5.5; ctx.globalAlpha = 0.85; paintPath(); ctx.stroke();  // 饱和内芯
      ctx.globalAlpha = 1;
    }
    // 转动的柔光(跟着转盘转, 立体感)
    const shx = CXp + Math.sin(spin.ang) * prof[0] * 0.4;
    const sg2 = ctx.createLinearGradient(shx - 30, 0, shx + 30, 0);
    sg2.addColorStop(0, 'rgba(255,255,255,0)');
    sg2.addColorStop(0.5, 'rgba(255,255,255,0.10)');
    sg2.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg2;
    ctx.fillRect(CXp - 120, topY - 20, 240, height * SH + 50);
    ctx.restore();
    // 边缘积色
    potPath(ctx);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(110,60,35,0.42)';
    ctx.stroke();
    // 口沿: 内口 + 沿圈
    if (height > 0) {
      ctx.fillStyle = potGrad ? _wcMix('#402616', potGrad, 0.3) : '#8A5138';
      ctx.beginPath(); ctx.ellipse(CXp, topY - 1, Math.max(4, prof[height - 1] * 0.9), SH * 0.52, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = potGrad ? _wcMix('#FFFFFF', potGrad, 0.45) : '#D9A47E';
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(CXp, topY - 1, Math.max(4, prof[height - 1] * 0.9), SH * 0.52, 0, 0, TAU); ctx.stroke();
    }
    // 出窑光泽
    if (step === 3) {
      const t = Math.min(1, (now - doneT) / 900);
      ctx.save();
      potPath(ctx);
      ctx.clip();
      const sh = ctx.createLinearGradient(CXp - 60, topY - 20, CXp + 40, S0 - 40);
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(0.5, 'rgba(255,255,255,' + 0.32 * t + ')');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sh;
      ctx.fillRect(CXp - 110, topY - 30, 220, height * SH + 80);
      ctx.restore();
      for (const s of sparks) {
        ctx.globalAlpha = Math.max(0, Math.min(1, s.life));
        wcSparkle(ctx, s.x, s.y, s.r * 2.4, '#F2CE6B', 0.9);
      }
      ctx.globalAlpha = 1;
    }
    // 泥点
    for (const s of specks) {
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = '#B06A48';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (ptr.down && step === 1) {
      ctx.font = '600 14px "LXGW WenKai", sans-serif';
      ctx.fillStyle = 'rgba(120,80,50,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('👆 拖动捏轮廓 · 往上拖提拉变高', CXp, 44);
    }

    ctx.font = '500 13px "LXGW WenKai", sans-serif';
    ctx.fillStyle = 'rgba(120,80,40,0.55)';
    ctx.textAlign = 'center';
    const tip = { 1: '按住泥坯拖动捏形状, 往上拖提拉变高', 2: '选颜色在坯上画图案, 或点渐变上釉', 3: '晾晾, 你的小陶器出炉啦' }[step] || '';
    ctx.fillText(tip, CXp, GAME_H - 8);

    for (const f of floats) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      ctx.font = '700 17px "LXGW WenKai", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
  }

  function loop(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    update(dt, t);
    render(t);
    wcPaper(ctx, 0, 0, GAME_W, GAME_H);
    raf = requestAnimationFrame(loop);
  }
  renderTools();
  raf = requestAnimationFrame(loop);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    }
  };
}

/* ---------- v655: 游戏免费/付费分区 + 1元解锁全部 ----------
   v665: GAMES_PAID_OFF = 收款账户办好前的总开关(false = 全部游戏免费, 解锁机制保留待恢复) */
const GAMES_PAID_OFF = true;
const FREE_GAMES = { abstract: 1, tugball: 1, jelly: 1, bubble: 1, soap: 1, woodfish: 1, still: 1, soda: 1, blow: 1 };
const UNLOCK_PHONE_WHITELIST = ['18810300207', '18515363122'];   // 已买断的账号, 永远全解锁
const UNLOCK_KEY = 'ma_games_unlocked';
const UNLOCK_QR_DATA = '';   // 收款码图片(dataURL/URL), 用户提供后填进来展示在解锁弹窗
function isGameUnlocked() {
  if (GAMES_PAID_OFF) return true;   // v665: 付费暂时下线, 全部开放
  try { if (localStorage.getItem(UNLOCK_KEY) === '1') return true; } catch (e) {}
  const u = (typeof currentUser === 'function') && currentUser();
  return !!(u && u.phone && UNLOCK_PHONE_WHITELIST.indexOf(u.phone) !== -1);
}
function showUnlockModal() {
  const old = document.getElementById('unlockMask');
  if (old) old.remove();
  const mask = document.createElement('div');
  mask.id = 'unlockMask';
  mask.innerHTML =
    '<div class="unlock-card">' +
      '<button class="unlock-x" type="button">✕</button>' +
      '<div class="unlock-emoji">🔒</div>' +
      '<h3>1元解锁全部游戏</h3>' +
      '<p class="unlock-sub">一次付费 · 永久有效 · 全部小游戏随便玩<br>包括做蛋糕、圣诞树、卷寿司、剪纸窗花、陶艺拉坯等</p>' +
      '<div class="unlock-qr">' + (UNLOCK_QR_DATA
        ? '<img src="' + UNLOCK_QR_DATA + '" alt="收款码">'
        : '<div class="unlock-qr-empty">📱 扫这里<br>收款码即将上线<br>可先在群里联系 rosa</div>') + '</div>' +
      '<p class="unlock-tip">扫码转账 1 元后, 点下方按钮提交开通申请<br>Rosa 核对到账后马上帮你开通 🌿</p>' +
      '<button class="btn btn-solid unlock-btn" type="button">✅ 我已付款, 申请开通</button>' +
      '<button class="btn btn-ghost unlock-later" type="button">暂不, 先玩免费游戏</button>' +
    '</div>';
  document.body.appendChild(mask);
  requestAnimationFrame(() => mask.classList.add('show'));
  const close = () => { mask.classList.remove('show'); setTimeout(() => mask.remove(), 260); };
  mask.querySelector('.unlock-x').addEventListener('click', close);
  mask.querySelector('.unlock-later').addEventListener('click', close);
  mask.addEventListener('click', e => { if (e.target === mask) close(); });
  mask.querySelector('.unlock-btn').addEventListener('click', async e => {
    // v658: 付费认账号 —— 未登录先去登录, 解锁记录会同步进云端账号(换设备登录依然解锁)
    if (!currentUser()) {
      close();
      try { sessionStorage.setItem('ma_pending_view', 'games'); } catch (err) {}
      toast('付费要跟着账号走哦, 先登录, 登完回来开通 ✦');
      showView('account');
      return;
    }
    // v660: 人工审核制 —— 提交申请, 群主核对到账后通过, 不再信任制直开
    const btn = e.currentTarget;
    btn.disabled = true; btn.textContent = '⏳ 提交中…';
    const ok = await submitUnlockRequest();
    btn.disabled = false; btn.textContent = '✅ 我已付款, 申请开通';
    if (ok) {
      close();
      toast('申请已提交! Rosa 核对到账后就开通, 通常很快 🌿');
    }
  });
}

/* v660: 提交解锁申请(云端 unlock_reqs, 同一账号同时只有一条待审) */
async function submitUnlockRequest() {
  const u = currentUser();
  if (!u) return false;
  if (!sbReady() || !cm.uid) { toast('网络还没连上, 稍等几秒再试~'); return false; }
  try {
    const { error } = await sb.from('unlock_reqs')
      .insert({ uid: cm.uid, phone: u.phone || '', nickname: u.name || '疗友' });
    if (error) {
      if (String(error.code) === '23505' || /duplicate|unique/i.test(error.message || '')) {
        toast('你已经有待核对的申请啦, Rosa 看到就马上处理 🌿');
        return true;
      }
      throw error;
    }
    return true;
  } catch (e) {
    toast('提交失败: ' + ((e && e.message) || e) + ' (如果提示函数不存在, 需要先跑 v660 SQL)');
    return false;
  }
}

/* v660: 登录后/启动时静默查一次云端 —— 有已通过的申请就本地+云端解锁 */
let _unlockChecked = false;
async function checkUnlockRemote(force) {
  try {
    if (!force && _unlockChecked) return;
    const u = currentUser();
    if (!u || !sbReady() || !cm.uid) return;
    _unlockChecked = true;
    if (isGameUnlocked()) return;
    const { data, error } = await sb.from('unlock_reqs')
      .select('id').eq('status', 'approved').limit(1);
    if (error || !data || !data.length) return;
    try { localStorage.setItem(UNLOCK_KEY, '1'); } catch (e) {}
    refreshGameLocks();
    toast('🎁 你的 1 元解锁已生效, 全部游戏开放啦!');
  } catch (e) {}
}
function refreshGameLocks() {
  const unlocked = isGameUnlocked();
  document.querySelectorAll('.game-card[data-game]').forEach(card => {
    const key = card.dataset.game;
    const paid = !GAMES_PAID_OFF && !FREE_GAMES[key];   // v665: 付费下线时一律不算付费卡
    card.classList.toggle('locked', paid && !unlocked);
    card.classList.toggle('paid', paid);
    let tag = card.querySelector('.gc-lock');
    if (paid && !unlocked) {
      if (!tag) {
        tag = document.createElement('span');
        tag.className = 'gc-lock';
        tag.textContent = '🔒 1元';
        card.appendChild(tag);
      }
    } else if (tag) tag.remove();
  });
  // v665: 付费下线时隐藏群主设置页的解锁审核入口
  const rb = document.getElementById('unlockReviewBtn');
  if (rb) rb.hidden = GAMES_PAID_OFF;
}

const GAMES = {
  abstract: { title: '抽象球',       tip: '1.0 版的它回来了: 戳我换颜色 · 拽我冒星星 · 软乎乎圆滚滚', build: buildAbstract },
  tugball: { title: '拽拽弹力球',   tip: '晶莹剔透 · 饱满Q弹: 捏我拽我甩飞我, 都会 duang~ 地弹回来', build: buildTugBall },
  jelly:  { title: '水感果冻捏捏', tip: '水感果冻块, 按下去凹陷回弹, 表面还有会滑的小水珠', build: buildJelly },
  bubble: { title: '泡泡纸',       tip: '点一下, 或按住滑过去一口气捏爆一整排', build: buildBubbleWrap },
  soap:   { title: '切肥皂',       tip: '握着刀随便划, 任意方向都能切, 圈个形状也能切下来', build: buildSoap },
  cake:   { title: '做蛋糕',       tip: '倒面糊 → 进烤箱 → 挤奶油 → 摆水果点蜡烛, 做一个自己的小蛋糕', build: buildCake },
  xmas:   { title: '装饰圣诞树',   tip: '彩球星星糖拐杖糖挂满树, 最后点亮彩灯, 飘起小雪 ❄', build: buildXmas },
  roast:  { title: '炭火烤串',     tip: '按住屏幕任意位置, 串就会架到火上烤, 金黄时松手, 一直烤会焦(纯凭颜色判断)', build: buildRoast },
  blend:  { title: '冰激凌机',   tip: '选配料倒进机器, 按住打出来, 渐变色的软雪糕丝滑又绵密', build: buildBlender },
  woodfish: { title: '敲木鱼',     tip: '点一下敲一下, 连着敲有功德暴击, 节奏随意', build: buildWoodfish },
  still:  { title: '精油蒸馏',     tip: '放花瓣, 点火, 看蒸汽爬过冷凝管, 一滴一滴接出精油', build: buildStill },
  soda:   { title: '开汽水',       tip: '按住瓶盖画圈拧开, 听那声"啵", 然后点瓶子喝掉', build: buildSoda },
  pizza:  { title: '做披萨',       tip: '揉面 → 抹酱 → 撒芝士 → 摆配菜 → 烤 → 切八份, 全程自己来', build: buildPizza },
  taichi: { title: '指尖小圆',     tip: '把手放到白圈里的小蓝点上, 缓慢移动, 看着它慢慢长大, 松手它会缩回消失', build: buildTaichi },
  blow:   { title: '吹泡泡',       tip: '按住泡泡圈吹出一串晶莹的泡泡, 再戳一下, 啵~ 就破啦', build: buildBlow },
  sushi:  { title: '卷寿司',       tip: '铺饭 → 竖着放馅 → 卷起立好 → 切段 → 两种蘸碟随便选, 啊呜一口吃掉', build: buildSushi },
  couplet: { title: '剪纸窗花',    tip: '圆形红纸对折两次成扇形, 想剪什么剪什么, 展开! 对称镂空超好看 ✂️', build: buildPapercut },
  pottery: { title: '陶艺拉坯',    tip: '转盘上捏一整块泥坯, 加水修坯, 8 种颜色随便画还能上渐变 🏺', build: buildPottery },
};
if (typeof window !== 'undefined') window._games = GAMES;   // v51 测试可见

let activeGame = null;
let overlayOpenedAt = 0;   // v548: 游戏弹窗打开时间戳(防误触关闭)

function bindGames() {
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => openGame(card.dataset.game));
  });
  refreshGameLocks();   // v655: 卡片锁角标
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshGameLocks(); });

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
  if (!currentUser()) { toast('先登录账号才能玩游戏哦 ✦'); showView('account'); return; }   // v658: 全站登录门禁
  if (!FREE_GAMES[key] && !isGameUnlocked()) { showUnlockModal(); return; }   // v655: 付费游戏未解锁
  closeGame();
  const stage = document.getElementById('gameStage');
  stage.innerHTML = '';
  document.getElementById('gameTitle').textContent = g.title;
  document.getElementById('gameTip').textContent = g.tip;
  document.getElementById('gameOverlay').classList.add('open');
  overlayOpenedAt = performance.now();
  document.body.style.overflow = 'hidden';
  prewarmGameSfx();   // v728: 进游戏先把音效采样解码好 → 第一次按就立刻出声, 不等网络
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
  // 高光裁剪进主体轮廓内(v666: 之前没裁剪, 扁椭圆盘子上白色高光会溢出手绘边外)
  ctx.save();
  wcCirclePath(ctx, x, y, rx * 0.97, ry * 0.97, seed, 1.0);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.ellipse(x - rx * 0.32, y - ry * 0.42, rx * 0.32, ry * 0.18, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
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
    pts.push({ x, y, px: x, py: y, ix: x, iy: y });
  }
  pts.push({ x: opt.cx, y: opt.cy, px: opt.cx, py: opt.cy, ix: opt.cx, iy: opt.cy }); // 中心质点, index = n

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

  // v687: 一键复原 —— 质点回初始位形 + 清零速度(弹簧 rest 不动, 兼容 setScale 过的泥)
  function reset() {
    for (const p of pts) { p.x = p.ix; p.y = p.iy; p.px = p.ix; p.py = p.iy; }
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

  return { pts, step, center, avgR, n, ringRest: springs[0].rest, setScale, reset };
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

  const onDown = e => {
    ptr.active = true; const p = canvasPos(cv, e, GAME_W, GAME_H); ptr.x = p.x; ptr.y = p.y; downAt = performance.now();
    /* v730: 手指一落就响**真实采样**(0.37s 的短促捏压, 前导静音自动跳过) ——
       不再用合成音(那是"怪声", 用户否掉了), 也不再等到松手才响 */
    playSfx('game.jellySquish', { volume: 0.5 });
  };
  const onMove = e => { if (!ptr.active) return; const p = canvasPos(cv, e, GAME_W, GAME_H); ptr.x = p.x; ptr.y = p.y; };
  const onUp = () => {
    /* v730: 松手不再补一声 —— 按下已经响了, 再来一次就是"捏一下两声", 手感反而毛躁 */
    ptr.active = false; downAt = 0;
  };
  stage.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  const status = document.createElement('span');
  status.className = 'game-status';
  status.textContent = '按住捏出凹陷, 正面也能按出小坑, 松手后慢慢回弹';
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

    // v749: 正面按压的凹陷阴影(按在体内时, 指尖处一团渐深凹坑 + 下缘受光亮边)
    if (press && Math.hypot(ptr.x - c.x, ptr.y - c.y) < S * 0.85) {
      const dg = ctx.createRadialGradient(ptr.x, ptr.y, 1, ptr.x, ptr.y, 38);
      dg.addColorStop(0, _wcRgba(_wcDarken(jc.c2, 0.45), 0.42));
      dg.addColorStop(0.62, _wcRgba(_wcDarken(jc.c2, 0.35), 0.16));
      dg.addColorStop(1, _wcRgba(_wcDarken(jc.c2, 0.35), 0));
      ctx.fillStyle = dg;
      ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 38, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(ptr.x, ptr.y + 15, 24, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.26)';
      ctx.fill();
    }

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
      // v749: 正面也可以捏 —— 手指按在果冻体内时, 附近轮廓点被吸向按点(正面凹坑)
      const c0 = soft.center();
      if (Math.hypot(ptr.x - c0.x, ptr.y - c0.y) < soft.avgR() * 0.85) {
        const GR2 = 105;
        for (const p of pts) {
          const dx = ptr.x - p.x, dy = ptr.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d > 0.5 && d < GR2) {
            const pull = (1 - d / GR2) * 2.6;
            p.x += (dx / d) * pull;
            p.y += (dy / d) * pull;
          }
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
  let baseMask = new Uint8Array(GW * GH);   // v659: 初始轮廓快照(圆角外格子), 挖除时区分「本来就在皂外」和「被切掉的」
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

  /* v653 修复: v651 重写时探针声明丢失 → 一进游戏 ReferenceError 白屏。
     探针: destination-out + evenodd 矢量抠图是否可用(部分老 webview 不支持), 不可用回退逐格 */
  let PATH_CUT_OK = false;
  try {
    const pc = document.createElement('canvas');
    pc.width = pc.height = 8;
    const pctx = pc.getContext('2d');
    pctx.globalCompositeOperation = 'destination-out';
    pctx.beginPath();
    pctx.rect(0, 0, 8, 8);
    pctx.rect(2, 2, 4, 4);
    pctx.fill('evenodd');
    PATH_CUT_OK = pctx.getImageData(4, 4, 1, 1).data[3] === 0;
  } catch (e) { PATH_CUT_OK = false; }

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
    baseMask.set(mask);   // v659: 记住初始轮廓
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
    // v651: 矢量抠挖 —— 整条刀缝路径 destination-out 抠出光滑切缝, 圆角也矢量抠边(无锯齿);
    //       PATH_CUT_OK=false 的环境(部分 headless)回退 v46 逐格方案
    vctx.globalCompositeOperation = 'source-over';
    vctx.clearRect(0, 0, SW, SH);
    vctx.drawImage(soapImg, 0, 0);
    if (PATH_CUT_OK) {
      vctx.globalCompositeOperation = 'destination-out';
      // 圆角外矢量抠掉(evenodd: 大矩形挖去圆角矩形)
      // v653 修复: roundRectPath 内部有 beginPath 会清掉上面 rect 的路径 → 整个皂体被抠光!
      //            这里手写圆角矩形路径(不重开 beginPath), 保证外框+圆角两圈共存
      vctx.beginPath();
      vctx.rect(-2, -2, SW + 4, SH + 4);
      {
        const rr = 52, x0 = 0, y0 = 0, x1 = SW, y1 = SH;
        vctx.moveTo(x0 + rr, y0);
        vctx.lineTo(x1 - rr, y0);
        vctx.arcTo(x1, y0, x1, y0 + rr, rr);
        vctx.lineTo(x1, y1 - rr);
        vctx.arcTo(x1, y1, x1 - rr, y1, rr);
        vctx.lineTo(x0 + rr, y1);
        vctx.arcTo(x0, y1, x0, y1 - rr, rr);
        vctx.lineTo(x0, y0 + rr);
        vctx.arcTo(x0, y0, x0 + rr, y0, rr);
        vctx.closePath();
      }
      vctx.fill('evenodd');
      // v659 修复: 分离块挖除改「平滑 alpha 图」—— v658 的逐格 clearRect 在分离边界留 4px 台阶(用户看到锯齿)。
      //            做法: 小 canvas(GW×GH, 每格 1px) 把被切掉区域填进 alpha, 再双线性放大铺回 SW×SH
      //            destination-out → 边界 ~1 格渐变过渡, 完全无锯齿。
      //            baseMask=0 的格子(圆角外)不进 alpha 图 —— 外轮廓仍由上面 evenodd 矢量抠, 保持锐利
      {
        const mcv = rebuildView._m || (rebuildView._m = document.createElement('canvas'));
        mcv.width = GW; mcv.height = GH;
        const mx = mcv.getContext('2d');
        const mimg = mx.createImageData(GW, GH);
        let anyCut = false;
        for (let i = 0; i < mask.length; i++) {
          if (!mask[i] && baseMask[i]) { mimg.data[i * 4 + 3] = 255; anyCut = true; }
        }
        if (anyCut) {
          mx.putImageData(mimg, 0, 0);
          vctx.globalCompositeOperation = 'destination-out';
          vctx.imageSmoothingEnabled = true;
          vctx.imageSmoothingQuality = 'high';
          vctx.drawImage(mcv, 0, 0, GW, GH, 0, 0, SW, SH);
        }
      }
      // 刀缝: 全部历史缝线一次描掉(宽度=刀缝直径)
      if (cutSegs.length) {
        vctx.lineWidth = CUT_R * 2 + 0.6;
        vctx.lineCap = 'round';
        vctx.lineJoin = 'round';
        vctx.beginPath();
        for (const sg of cutSegs) {
          vctx.moveTo(sg.x0 - SX, sg.y0 - SY);
          vctx.lineTo(sg.x1 - SX, sg.y1 - SY);
        }
        vctx.stroke();
      }
      vctx.globalCompositeOperation = 'source-over';
      return;
    }
    // 回退: 逐格抠(有轻微锯齿, 仅兼容环境用)
    for (let gy = 0; gy < GH; gy++) {
      for (let gx = 0; gx < GW; gx++) {
        if (!mask[gy * GW + gx]) vctx.clearRect(gx * CELL, gy * CELL, CELL + 0.5, CELL + 0.5);
      }
    }
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
      cutSegs.push({ x0: x0, y0: y0, x1: x1, y1: y1 });   // v651: 不再 cap —— 矢量重绘需要全部历史缝
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
      // 生成掉落片: v651 矢量抠形 —— 裁 bbox + destination-out 刀缝(边缘光滑), 再清掉非本块的格
      const tmp = document.createElement('canvas');
      tmp.width = wpx; tmp.height = hpx;
      const tc = tmp.getContext('2d');
      tc.drawImage(soapImg, bx0 * CELL, by0 * CELL, wpx, hpx, 0, 0, wpx, hpx);
      if (PATH_CUT_OK) {
        tc.globalCompositeOperation = 'destination-out';
        if (cutSegs.length) {
          tc.lineWidth = CUT_R * 2 + 0.6;
          tc.lineCap = 'round';
          tc.lineJoin = 'round';
          tc.beginPath();
          for (const sg of cutSegs) {
            tc.moveTo(sg.x0 - SX - bx0 * CELL, sg.y0 - SY - by0 * CELL);
            tc.lineTo(sg.x1 - SX - bx0 * CELL, sg.y1 - SY - by0 * CELL);
          }
          tc.stroke();
        }
        tc.globalCompositeOperation = 'source-over';
        // 掉落片里的皂体圆角也矢量抠掉(evenodd)
        // v653 修复: 同 rebuildView —— 手写圆角路径, 不能用内部带 beginPath 的 roundRectPath
        tc.beginPath();
        tc.rect(-2, -2, wpx + 4, hpx + 4);
        {
          const rr = 52, x0 = -bx0 * CELL, y0 = -by0 * CELL, x1 = x0 + SW, y1 = y0 + SH;
          tc.moveTo(x0 + rr, y0);
          tc.lineTo(x1 - rr, y0);
          tc.arcTo(x1, y0, x1, y0 + rr, rr);
          tc.lineTo(x1, y1 - rr);
          tc.arcTo(x1, y1, x1 - rr, y1, rr);
          tc.lineTo(x0 + rr, y1);
          tc.arcTo(x0, y1, x0, y1 - rr, rr);
          tc.lineTo(x0, y0 + rr);
          tc.arcTo(x0, y0, x0 + rr, y0, rr);
          tc.closePath();
        }
        tc.fill('evenodd');
      }
      const cellSet = new Set(cells);
      for (let gy = by0; gy <= by1; gy++) {
        for (let gx = bx0; gx <= bx1; gx++) {
          if (!cellSet.has(gy * GW + gx)) tc.clearRect((gx - bx0) * CELL, (gy - by0) * CELL, CELL + 0.5, CELL + 0.5);
        }
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
        // v655: 落到托盘后短暂停留 → 继续下沉 + 淡出消失(用户要求切完的块掉下去别堆着)
        p.vx *= 0.86;
        p.x += p.vx * SEC;
        p.rot += (p.target - p.rot) * 0.2 * SEC;
        if (!p.landT) p.landT = now;
        if (now - p.landT > 700) {
          p.vy += 0.5 * SEC;
          p.y += p.vy * SEC;
          p.a -= 0.022 * SEC;
        }
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
        p.landT = now;
        p.y = FLOOR - hh;
        p.vy = 0;
        p.vx *= 0.3;
      }
    }
    for (let i = pieces.length - 1; i >= 0; i--) if (pieces[i].a <= 0) pieces.splice(i, 1);

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
  const ROAST_POS = { x: FIRE.x, y: FIRE.y - 46 };   // v674: 架到火上的固定位置
  let food = { ...HOLD };     // 食材当前位置(按住时自动滑向火上方)
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
  /* v730: 加的 dead 标记 —— startLoopSound 是异步的(要 fetch+decode), 如果用户在解码回来
     之前就关了游戏, 旧代码会把节点存进 fireNodes 然后再没人停它 = 出游戏后篝火一直响,
     而且切后台回来还会被"复活"重建。现在晚到的一律当场掐掉 */
  let fireDead = false;
  startLoopSound('game.roastFire').then(n => {
    if (!n) return;
    if (fireDead) { try { smoothStop(n); } catch (e) {} return; }
    fireNodes = n;
  });

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

  // v674: 触屏友好 —— 按住屏幕任意位置就架到火上烤, 不再跟手拖动(手指不会盖住食材)
  const onDown = () => {
    down = true;
    lastT = performance.now();
  };
  const onUp = () => {
    if (down) serveCurrent();
    down = false;
  };
  stage.addEventListener('pointerdown', onDown);
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
  status.textContent = '按住屏幕任意位置就架到火上烤 · 金黄了松手 · 烤过头会焦';
  stage.appendChild(status);

  function render(time) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    // 烤制推进(时间驱动) — v674: 按住时食材自动滑到火上方固定烤位, 松手滑回待放点
    const tgt = down ? ROAST_POS : HOLD;
    food.x += (tgt.x - food.x) * Math.min(1, dt * 9);
    food.y += (tgt.y - food.y) * Math.min(1, dt * 9);
    cooking = down && Math.hypot(food.x - ROAST_POS.x, food.y - ROAST_POS.y) < 34;
    if (cooking) {
      cook = Math.min(2.4, cook + 0.58 * dt * 2.2);
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
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      fireDead = true;   // v730: 之后再解码回来的循环音源一律作废(见上面 startLoopSound)
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
  /* v749: 冰激凌无限制 —— 想挤多高挤多高(通天塔); 塔越高越晃, 歪过头顶端会斜着塌下来 */
  const tumbles = [];        // 塌落的雪糕段(翻滚掉落动画)

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
  status.textContent = '选配料倒进机器, 按住挤出冰激凌, 点雪糕咬一口 · 堆太高会斜着倒哦';
  stage.appendChild(status);

  function openLayer() {
    if (!queue.length) return;
    const t = queue.shift();
    const next = queue[0] || t;
    const col = mixHex(BLENDER_FRUITS[t].pulp, BLENDER_FRUITS[next].pulp, 0.25);
    // v749: 塔越高晃得越厉害 —— 每层落点随机外漂, 歪过头顶端就斜着塌
    const prev = layers[layers.length - 1];
    const drift = (Math.random() - 0.5) * (3 + layers.length * 0.5);
    layers.push({ color: col, h: 0, maxh: 1, dx: prev ? prev.dx + drift : 0 });
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

  // 雪糕旋涡总高度(从蛋筒顶往上堆); v749: 塔越高整体越压缩, 通天塔也留在画面里
  function swirlK() {
    const Htot = layers.reduce((s2, L) => s2 + 14 * L.h, 0);
    return layers.length ? Math.min(1, 170 / Math.max(60, Htot)) : 1;
  }
  function swirlTopY() {
    let y = CONE.top;
    const kF = swirlK();
    for (const L of layers) y -= 14 * L.h * kF;
    return y;
  }
  /* v749: 顶层渲染横向偏移(落点外漂 + 越高越晃的摇摆) */
  function layerOff(i, now) {
    const L = layers[i];
    return (L.dx || 0) + (now ? Math.sin(now / 420 + i * 0.4) * Math.min(7, i * 0.45) : 0);
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
    // v749: 塔歪过头 → 顶端几层斜着塌下来(趣味)
    if (layers.length > 4) {
      const t2 = layers[layers.length - 1];
      if (Math.abs(t2.dx || 0) > 42) {
        const dir = t2.dx > 0 ? 1 : -1;
        const n = Math.min(layers.length - 3, 2 + (Math.random() * 2 | 0));
        const kF = swirlK();
        let yy = swirlTopY();
        for (let i = 0; i < n; i++) {
          const L = layers.pop();
          tumbles.push({
            x: CONE.x + (L.dx || 0) * 0.6, y: yy,
            vx: dir * (70 + Math.random() * 90), vy: -30 - Math.random() * 70,
            rot: 0, vrot: dir * (1.6 + Math.random() * 2.4),
            color: L.color, h: 14 * L.h * kF, life: 1,
          });
          yy += 14 * L.h * kF;
        }
        cupLevel = layers.length;
        playSfx('game.icecreamDrop', { volume: 0.75 });
        floats.push({ x: CONE.x, y: 150, text: '哗啦——斜倒啦!', color: '#D9825F', life: 1.4 });
      }
    }
    // 塌落段翻滚掉落
    for (let i = tumbles.length - 1; i >= 0; i--) {
      const b = tumbles[i];
      b.vy += 700 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vrot * dt; b.life -= dt * 0.5;
      if (b.y > GAME_H + 60 || b.life <= 0) { tumbles.splice(i, 1); continue; }
    }
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

    // 出料软条(从喷嘴到雪糕顶; v749: 塔歪了软条也跟着弯)
    if (blending && layers.length) {
      const layer = layers[layers.length - 1];
      const col = layer.color;
      const top = swirlTopY();
      const tOff = layerOff(layers.length - 1, now);
      ctx.strokeStyle = col;
      ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(NOZZLE.x, NOZZLE.y - 4);
      ctx.quadraticCurveTo(NOZZLE.x + tOff * 0.5 + Math.sin(now / 60) * 3, (NOZZLE.y + top) / 2, NOZZLE.x + tOff, top + 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(NOZZLE.x - 2, NOZZLE.y - 6);
      ctx.quadraticCurveTo(NOZZLE.x - 2 + tOff * 0.5 + Math.sin(now / 60) * 3, (NOZZLE.y + top) / 2, NOZZLE.x - 2 + tOff, top + 4);
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
    const kF = swirlK();
    layers.forEach((L, i) => {
      const hh = 14 * L.h * kF;
      const lw = Math.max(16, 66 - i * 4);
      const off = layerOff(i, now);
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
      ctx.save();
      ctx.translate(off, 0);
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
      ctx.restore();   // v749: 收掉本层横移
    });
    // 顶部旋涡尖(软冰淇淋卷头, 手绘双弧)
    if (layers.length) {
      const last = layers[layers.length - 1];
      const topY = y + 2;
      const tOff = layerOff(layers.length - 1, now);
      ctx.strokeStyle = lighten(last.color);
      ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tOff + 1, topY);
      ctx.bezierCurveTo(tOff + 7, topY - 4, tOff + 7, topY - 10, tOff + 1, topY - 10);
      ctx.bezierCurveTo(tOff - 5, topY - 10, tOff - 6, topY - 16, tOff + 1, topY - 17);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tOff - 2, topY - 3); ctx.quadraticCurveTo(tOff + 3, topY - 7, tOff - 1, topY - 11); ctx.stroke();
    }
    ctx.restore();

    // v749: 塌落的雪糕段(翻滚着掉下画面)
    for (const b of tumbles) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, b.life * 2);
      ctx.translate(b.x, b.y); ctx.rotate(b.rot);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-16, -b.h / 2, 32, b.h, 9); else ctx.rect(-16, -b.h / 2, 32, b.h);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.ellipse(-6, -b.h / 2 + 3, 7, 2.4, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

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
  let combo = 0, lastHit = 0, idleJoked = false;   // v749: 连敲100下彩蛋
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
    if (combo === 1) idleJoked = false;
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
    /* v749: 连敲 100 下彩蛋 */
    if (combo >= 100 && !idleJoked) {
      idleJoked = true;
      merits.push({ x: FISH.x, y: FISH.y - FISH.ry - 52, text: '你真闲啊哈哈哈', big: true, life: 2.4 });
    }
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
  asmrStopAllVisual(false);   // v738: 按钮变「已停止」
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
        asmrStopAllVisual(Object.keys(asmrActive).length > 0);   // v738
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
        asmrStopAllVisual(true);   // v738: 有声在播 → 按钮恢复「全部停止」
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
/* v738: 全部停止按钮状态反馈 —— 点停后按钮变「已停止」灰显, 有声音再响时恢复「全部停止」 */
function asmrStopAllVisual(playing) {
  const btn = document.getElementById('asmrStopAllBtn');
  if (!btn) return;
  const span = btn.querySelector('span');
  if (span) span.textContent = playing ? '全部停止' : '已停止';
  btn.classList.toggle('stopped', !playing);
}

/* ---------- v48: ASMR 用户上传空位(存本机 IndexedDB, 时长不限) ---------- */
const userAsmr = {};   // slotIndex → {file, name, audio, url}

function bindUserAsmrSlots() {
  const cards = document.querySelectorAll('.asmr-card.asm-user, .asmr-card.asmr-user');
  if (!cards.length) return;
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  /* v740: 只写 audio/* 在部分安卓/iOS WebView 里文件选择器只剩视频、音频灰显 ——
     补具体扩展名后走文件 App, 音频正常可选 */
  fileInput.accept = 'audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.opus';
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
        audioUnseal(st.audio);   // v730: 用户主动播放 → 解封
        try { await st.audio.play(); card.classList.add('playing'); asmrStopAllVisual(true); }   // v738
        catch (err) { toast('这个文件播放不了, 换一个试试'); }
      } else {
        audioSeal(st.audio);     // v730: 用户主动暂停 → 封死, 别隔一会儿自动响回来
        st.audio.pause();
        card.classList.remove('playing');
        asmrStopAllVisual(Object.keys(asmrActive).length > 0 || document.querySelector('.asmr-card.playing'));   // v738
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
    try { audioSeal(st.audio); } catch (e) {}
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
   v740: 「音频替换」功能整体下架(用户钦定"不许换") ——
   设置页替换区 DOM 已删, 本函数保留空壳防外部调用报错
   ============================================ */
function bindAudioManager() {
  /* v740: no-op —— 全站声音一律使用默认音源, 不再提供替换 */ }


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

/* v627: 手机号 = 账号 —— 一人一号(占坑制), 不发短信(免费静态站发不了真验证码)
   云端身份 email 由手机号哈希确定性派生: 同一手机号在任何设备都得到同一云端账号,
   Supabase auth 的邮箱唯一约束天然保证"一号一账号"; 换设备凭手机号+密码即可登录
   v628: 号段校验加强 —— 必须符合国内运营商真实号段(13x/14[5-9]/15x(除154)/16[2-7]/17[0-8]/18x/19x),
        乱输的数字(如 12345678901 / 11111111111 / 10000000000)一律拒绝注册 */
const PHONE_RE = /^1(?:3\d|4[5-9]|5[0-35-9]|6[2-7]|7[0-8]|8\d|9[0-35-9])\d{8}$/;
function phoneEmail(phone) { return 'ph-' + hashPass('MA|' + phone) + '@device.mailinator.com'; }

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
    const apB = document.getElementById('apBday');
    if (apB && document.activeElement !== apB) apB.value = user.bday || (loadJSON('ma_device', null) || {}).bday || '';
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

  /* ---- v631: 找回密码 —— 只认手机号, 不再关联设备 ---- */
  let fogVerifiedPhone = '';
  const fogShowMsg = (cls, emoji, title, text) => {
    const res = document.getElementById('fogResult');
    if (!res) return;
    res.hidden = false;
    res.className = 'fog-result ' + cls;
    res.textContent = '';
    const e = document.createElement('p');
    e.className = 'fog-emoji'; e.textContent = emoji;
    const t = document.createElement('p');
    t.className = 'fog-title'; t.textContent = title;
    const p = document.createElement('p');
    p.className = 'fog-line-v';
    p.style.cssText = 'font-weight:400; display:block;';
    p.textContent = text;
    res.append(e, t, p);
  };

  document.getElementById('toForgot').addEventListener('click', () => {
    document.getElementById('acctLogin').hidden = true;
    document.getElementById('acctForgot').hidden = false;
    fogVerifiedPhone = '';
    const res = document.getElementById('fogResult');
    const edit = document.getElementById('fogEdit');
    if (res) { res.hidden = true; res.textContent = ''; }
    if (edit) edit.hidden = true;
    const fp = document.getElementById('fogPhone');
    if (fp) { fp.value = ''; setTimeout(() => { try { fp.focus(); } catch (e) {} }, 80); }
    const fb = document.getElementById('fogBday');
    if (fb) fb.value = '';
  });
  document.getElementById('fogBackLogin').addEventListener('click', () => {
    document.getElementById('acctForgot').hidden = true;
    document.getElementById('acctLogin').hidden = false;
  });

  document.getElementById('fogBtn').addEventListener('click', async () => {
    const edit = document.getElementById('fogEdit');
    if (edit) edit.hidden = true;
    fogVerifiedPhone = '';
    const phone = (document.getElementById('fogPhone').value || '').replace(/\D/g, '');
    if (!PHONE_RE.test(phone)) {
      fogShowMsg('bad', '⚠️', '手机号不太对', '请输入注册时用的 11 位手机号。');
      return;
    }
    const fogBdayVal = (document.getElementById('fogBday').value || '').trim();
    if (!fogBdayVal) {
      fogShowMsg('bad', '🎂', '先选一下生日', '选注册时填的那个生日, 用来确认是你本人。');
      return;
    }
    if (!sbReady()) {
      fogShowMsg('bad', '📡', '云端没连上', '现在连不上服务器, 过一会儿再试一次。');
      return;
    }
    fogShowMsg('ok', '⏳', '正在查这个手机号…', '稍等一两秒。');
    let exists = null, fnMissing = false;
    try {
      const { data, error } = await sb.rpc('ma_phone_exists', { p_email: phoneEmail(phone) });
      if (error) {
        if (/PGRST202|does not exist|could not find/i.test(JSON.stringify(error))) fnMissing = true;
        else exists = false;
      } else exists = !!data;
    } catch (e) { exists = false; }
    if (fnMissing) {
      fogShowMsg('bad', '🛠️', '找回功能正在升级', '后台的新开关还没装好, 装好后输入手机号就能直接设新密码啦。');
      return;
    }
    if (!exists) {
      fogShowMsg('bad', '🤔', '这个手机号还没注册过', '检查一下号码有没有输错; 确实是新号的话, 回去点「去注册」就行。');
      return;
    }
    /* v636: 生日验证 —— 后台比对注册时登记的生日; 没登记过(=2)或后台没装(降级)则不拦 */
    let bdayState = 2;
    try {
      const { data, error } = await sb.rpc('ma_check_bday', { p_email: phoneEmail(phone), p_bday: fogBdayVal });
      if (error) {
        if (!/PGRST202|does not exist|could not find/i.test(JSON.stringify(error))) bdayState = 2;
      } else bdayState = (data == null) ? 2 : Number(data);
    } catch (e) { bdayState = 2; }
    if (bdayState === 0) {
      fogShowMsg('bad', '🎂', '生日对不上', '这个生日和注册时填的不一样, 再想想; 实在想不起来就联系右下角的客服帮忙核对。');
      return;
    }
    fogVerifiedPhone = phone;
    fogShowMsg('ok', '✅', '找到了',
      '手机号 ' + phone.slice(0, 3) + '****' + phone.slice(-4) + ' 注册过账号, ' +
      (bdayState === 2 ? '这个账号还没登记生日, 这次先不验证。' : '生日验证通过, ') +
      '在下面设个新密码就行, 不需要旧密码。');
    if (edit) {
      edit.hidden = false;
      const np = document.getElementById('fogNewPass');
      const np2 = document.getElementById('fogNewPass2');
      if (np) np.value = '';
      if (np2) np2.value = '';
      if (np) setTimeout(() => { try { np.focus(); } catch (e) {} }, 80);
    }
  });

  /* 保存新密码: 后台直接改云端密码 → 登录 → 本地建档(全程不需要旧密码/设备) */
  const fogEditBtn = document.getElementById('fogEditBtn');
  if (fogEditBtn) fogEditBtn.addEventListener('click', async () => {
    if (!fogVerifiedPhone) { toast('先在上面输入手机号查一查'); return; }
    const p1 = document.getElementById('fogNewPass').value;
    const p2 = document.getElementById('fogNewPass2').value;
    if (p1.length < 6) { toast('新密码至少 6 位'); return; }
    if (p1 !== p2) { toast('两次新密码不一致'); return; }
    if (!sbReady()) {
      fogShowMsg('bad', '📡', '云端没连上', '现在连不上服务器, 过一会儿再试一次。');
      return;
    }
    const phone = fogVerifiedPhone;
    const newHash = hashPass(p1);
    const oldTxt = fogEditBtn.textContent;
    fogEditBtn.disabled = true;
    fogEditBtn.textContent = '正在保存…';
    try {
      const email = phoneEmail(phone);
      const { data: okReset, error: rpcErr } = await sb.rpc('ma_reset_pass', { p_email: email, p_password: cloudPass(newHash) });
      if (rpcErr || okReset !== true) {
        fogShowMsg('bad', '🛠️', '云端没保存成功', '后台开关可能还没装好, 或者网络不太顺, 过一会儿再试一次。');
        return;
      }
      const { error: sgnErr } = await sb.auth.signInWithPassword({ email, password: cloudPass(newHash) });
      let uid = null, prof = null;
      try {
        const { data } = await sb.auth.getSession();
        uid = data.session && data.session.user && data.session.user.id;
      } catch (e) {}
      if (uid) {
        try { const r = await sb.from('profiles').select('nickname,avatar,bday').eq('id', uid).maybeSingle(); prof = r.data; } catch (e) {}
      }
      const name = (prof && prof.nickname) || '疗友' + phone.slice(-4);
      const user = {
        name, phone,
        bday: (prof && prof.bday) || '',
        avatar: (prof && prof.avatar) || '🌙',
        since: new Date().toLocaleDateString('zh-CN'), pass: newHash,
      };
      saveJSON('ma_user', user);
      saveJSON('ma_device', { name, phone, pass: newHash, pw: p1, avatar: user.avatar, since: user.since, bday: user.bday });
      if (uid) { cm.uid = uid; claimSession(uid, true); }
      document.getElementById('fogPhone').value = '';
      document.getElementById('fogNewPass').value = '';
      document.getElementById('fogNewPass2').value = '';
      fogVerifiedPhone = '';
      renderAccount();
      refreshAccountBadge();
      playSfx('site.chime');
      toast('✅ 新密码设好了, 已经帮你登录');
      goPendingView();
    } catch (e) {
      fogShowMsg('bad', '🌐', '网络不太顺', '过一会儿再试一次就好。');
    } finally {
      fogEditBtn.disabled = false;
      fogEditBtn.textContent = oldTxt;
    }
  });

  document.getElementById('regBtn').addEventListener('click', async () => {
    /* v627: 注册必须手机号 —— 一人一号(占坑), 云端唯一; 旧"昵称+密码"注册不再开放 */
    const phone = document.getElementById('regPhone').value.trim();
    const name = regName.value.trim();
    const pass = regPass.value;
    if (!PHONE_RE.test(phone)) { toast('请输入真实有效的 11 位手机号'); return; }
    const regBday = (document.getElementById('regBday').value || '').trim();
    const _n = new Date();
    const _today = _n.getFullYear() + '-' + String(_n.getMonth() + 1).padStart(2, '0') + '-' + String(_n.getDate()).padStart(2, '0');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(regBday)) { toast('请选择你的生日(找回密码时要验证)'); return; }
    if (regBday < '1900-01-01' || regBday > _today) { toast('生日不太对, 重新选一下'); return; }
    if (name.length < 2) { toast('昵称至少 2 个字'); return; }
    if (pass.length < 6) { toast('密码至少 6 位'); return; }
    if (pass !== regPass2.value) { toast('两次密码不一致'); return; }
    // 设备唯一账号: 同一设备(浏览器)只能注册一个
    const device = loadJSON('ma_device', null);
    if (device) {
      toast('本设备已注册过账号「' + device.name + '」, 请直接登录');
      document.getElementById('acctReg').hidden = true;
      document.getElementById('acctLogin').hidden = false;
      document.getElementById('loginName').value = device.phone || device.name;
      return;
    }
    /* v628: 先在云端占号 —— 手机号已被注册(含站长/wjw已关联的号)立即拒绝,
       防止乱填别人的手机号占用; 云端不通时退化为本地注册(下次进站自动补建) */
    if (sbReady()) {
      try {
        const { error } = await sb.auth.signUp({ email: phoneEmail(phone), password: cloudPass(hashPass(pass)) });
        if (error) {
          const m = String(error.message || '');
          if (/already|registered|exists|duplicate/i.test(m)) {
            toast('这个手机号已经注册过了, 请直接用手机号登录');
            document.getElementById('acctReg').hidden = true;
            document.getElementById('acctLogin').hidden = false;
            document.getElementById('loginName').value = phone;
            return;
          }
        }
      } catch (e) { /* 网络异常 → 继续本地注册, 稍后自动同步 */ }
    }
    const user = {
      name, phone, bday: regBday, avatar: AVATAR_CHOICES[Math.floor(Math.random() * AVATAR_CHOICES.length)],
      since: new Date().toLocaleDateString('zh-CN'), pass: hashPass(pass),
    };
    /* v35: ma_device 存明文(仅本设备, 找回密码卡片要显示); 疗友号注册时系统分配, 永久绑定不变
       v627: 多存 phone —— 云端身份 email 由手机号派生, 跨设备登录/一号一账号都靠它 */
    saveJSON('ma_device', { name: user.name, phone, pass: user.pass, pw: pass, avatar: user.avatar, since: user.since, bday: regBday });
    saveJSON('ma_user', user);
    const myCode = getFriendCode();
    renderAccount();
    refreshAccountBadge();
    toast('🎉 注册成功! 你的疗友号是 ' + myCode + ', 全站唯一, 永远不变');
    playSfx('site.chime');
    // 云端建档(best-effort, 失败不阻断) + 自动进社区
    cloudSyncAccount();
    try { sessionStorage.removeItem('ma_pending_view'); } catch (e) {}   // v658: 注册直接进社区, 清掉残留跳转
    showView('community');
    history.replaceState(null, '', '#community');
  });

  /* v658: 登录成功后 —— 如果是被门禁拦下来先去登录的, 自动回到刚才想用的那个功能 */
  function goPendingView() {
    let pv = null;
    try { pv = sessionStorage.getItem('ma_pending_view'); sessionStorage.removeItem('ma_pending_view'); } catch (e) {}
    if (pv && document.getElementById(pv)) { showView(pv); history.replaceState(null, '', '#' + pv); return true; }
    return false;
  }

  document.getElementById('loginBtn').addEventListener('click', () => {
    const id = document.getElementById('loginName').value.trim();
    const pass = document.getElementById('loginPass').value;
    /* v627: 输入手机号 → 走云端登录(换设备也能登); 输入旧昵称 → 兼容老账号本设备登录 */
    if (PHONE_RE.test(id)) { loginByPhone(id, pass); return; }
    const device = loadJSON('ma_device', null);
    if (!device) { toast('本设备还没注册过, 先注册一个吧'); return; }
    if (id !== device.name) { toast('昵称和本设备注册的不一致'); return; }
    if (hashPass(pass) !== device.pass) { toast('密码不对, 再想想'); return; }
    const user = loadJSON('ma_user', null);
    if (user && user.name === device.name) {
      renderAccount();
      cloudSyncAccount();
      toast('欢迎回来, ' + user.name);
      goPendingView();
      return;
    }
    // 恢复登录(设备凭证构造会话)
    saveJSON('ma_user', { name: device.name, phone: device.phone, avatar: device.avatar || '🌙', since: device.since || new Date().toLocaleDateString('zh-CN'), pass: device.pass });
    renderAccount();
    refreshAccountBadge();
    cloudSyncAccount();
    toast('欢迎回来, ' + device.name);
    goPendingView();
  });

  /* v627: 手机号+密码 → 云端登录(Supabase auth), 任意设备可用
     成功后从 profiles 拉昵称/头像, 在本机建会话凭证 */
  async function loginByPhone(phone, pass) {
    if (!sbReady()) { toast('云端服务没连上, 请稍后再试'); return; }
    if (pass.length < 6) { toast('密码不对, 再想想'); return; }
    const h = hashPass(pass);
    try {
      const { error } = await sb.auth.signInWithPassword({ email: phoneEmail(phone), password: cloudPass(h) });
      if (error) {
        toast('手机号还没注册过, 或密码不对');
        return;
      }
      const { data: { session } } = await sb.auth.getSession();
      const uid = session && session.user && session.user.id;
      let prof = null;
      if (uid) {
        try { const r = await sb.from('profiles').select('nickname,avatar,bday').eq('id', uid).maybeSingle(); prof = r.data; } catch (e) {}
      }
      const name = (prof && prof.nickname) || '疗友' + phone.slice(-4);
      const user = {
        name, phone, bday: (prof && prof.bday) || '', avatar: (prof && prof.avatar) || '🌙',
        since: new Date().toLocaleDateString('zh-CN'), pass: h,
      };
      saveJSON('ma_user', user);
      saveJSON('ma_device', { name, phone, pass: h, pw: pass, avatar: user.avatar, since: user.since, bday: user.bday });
      cm.uid = uid || null;
      claimSession(uid, true);   // v668: 真正输密码登录才换新会话戳
      renderAccount();
      refreshAccountBadge();
      toast('欢迎回来, ' + name);
      cloudSyncAccount();   // v641: 登录后立刻拉云端偏好/宠物(此前漏调 → 偏好没跟进+宠物要刷新才有, 且首次改设置会用默认值覆盖云端)
      goPendingView();   // v658: 被门禁拦来登录的, 登完自动送回想用的功能
    } catch (e) {
      toast('登录出了点小问题, 请稍后再试');
    }
  }

  /* v636: 保存生日(找回密码验证用) —— 本地+云端一起存 */
  const apBdayBtn = document.getElementById('apBdayBtn');
  if (apBdayBtn) apBdayBtn.addEventListener('click', () => {
    const u = currentUser(); if (!u) return;
    const v = (document.getElementById('apBday').value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { toast('先选好生日再保存'); return; }
    const dev = loadJSON('ma_device', null) || {};
    dev.bday = v; saveJSON('ma_device', dev);
    u.bday = v; saveJSON('ma_user', u);
    cloudUpdateProfile({ bday: v });
    toast('生日存好啦 🎂 忘记密码时它会帮你证明"是你本人"');
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try { await pushLocalData(); } catch (e) {}   // v639: 退出前先把偏好/宠物完整推云端
    try { await cloudSignOut(); } catch (e) {}
    try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}   // 清掉的只是本机副本, 正本在云端账号里
    cm.uid = null; cm.gen++;
    toast('已退出登录, 数据已存进你的账号, 下次登录都还在~');
    setTimeout(() => { location.href = location.pathname; }, 600);   // 回到第一页
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
  myMutedUntil: null,                          // v642 我的禁言截止(进社区时拉一次)
  myGroupNick: '',                             // v643 我的群内显示名(= profiles.nickname)
  mentionList: [], mentionCandidates: [], mentionIdx: 0, lastMentionId: 0,   // v643 @功能
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
/* v671: 记录云端身份桥接最后一次失败的原因, 进社区报错时给出针对性提示
   'net'=网络不通(到不了 Supabase) / 'auth'=账号凭证异常 / 'no-session'=云端会话没建立 */
let _cloudAuthErr = null;
function _classifyAuthErr(e) {
  const msg = ((e && (e.message || e.msg)) || '') + '';
  if (/fetch|network|timeout|timed out|Failed to fetch|NetworkError|ERR_/i.test(msg)) return 'net';
  if (/Invalid login|invalid credentials|Email not confirmed|signups not allowed/i.test(msg)) return 'auth';
  return 'auth';
}
async function cloudEnsureUser() {
  if (!sbReady()) return null;
  if (_cloudEnsureUser) return _cloudEnsureUser;
  _cloudEnsureUser = (async () => {
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (session && session.user) { cm.uid = session.user.id; claimSession(cm.uid); _cloudAuthErr = null; return cm.uid; }
      const device = loadJSON('ma_device', null);
      const local = currentUser();
      if (!device || !local) return null;
      /* v627: 手机号注册的账号 → 云端 email 由手机号确定性派生(一号一账号, 跨设备同一身份);
         旧昵称账号维持设备 UUID 身份不变 */
      const email = device.phone ? phoneEmail(device.phone) : ensureDeviceUuid() + '@device.mailinator.com';
      const password = cloudPass(device.pass);
      let up = null;
      try { up = await sb.auth.signUp({ email, password }); } catch (e) { up = { error: e }; }
      if (up.error) {
        // 账号可能已存在 / 并发建号 / 瞬时服务端错误 → 兜底直接登录一次(失败无副作用)
        let sgn = null;
        try { sgn = await sb.auth.signInWithPassword({ email, password }); } catch (e) { sgn = { error: e }; }
        if (!sgn.error) up = sgn;
        else {
          /* v671: 两条路都失败 → 分类原因, 重试一次(免费版冷启动/瞬时抖动很常见) */
          const kind = _classifyAuthErr(sgn.error);
          await new Promise(res => setTimeout(res, 1200));
          try { sgn = await sb.auth.signInWithPassword({ email, password }); } catch (e) { sgn = { error: e }; }
          if (sgn && !sgn.error) up = sgn; else { _cloudAuthErr = kind; return null; }
        }
      }
      const { data: { session: s2 } } = await sb.auth.getSession();
      if (!s2 || !s2.user) { _cloudAuthErr = 'no-session'; return null; }
      _cloudAuthErr = null;
      cm.uid = s2.user.id;
      claimSession(cm.uid, true);   // v668: 这里是真·新登录(顶掉旧设备), 生成新戳
      return cm.uid;
    } catch (e) { _cloudAuthErr = 'net'; return null; }
  })().finally(() => { _cloudEnsureUser = null; });
  return _cloudEnsureUser;
}

/* 本地昵称/头像 → 云端 profiles */
async function cloudUpdateProfile(patch) {
  if (!sbReady() || !cm.uid) return;
  try { await sb.from('profiles').upsert(Object.assign({ id: cm.uid }, patch)); } catch (e) {}
}

/* ---------- v638: 偏好/小宠云同步(数据跟账号走) ----------
   这些本地键会随账号存到云端 profiles.prefs / profiles.pet:
   换设备登录自动拉回来, 退出登录本地全清也不怕丢。 */
const SYNC_KEYS = ['ma_ai_mode', 'ma_dnd', 'ma_chat_bg', 'ma_group_nick', 'ma_font_brand', 'ma_font_body', 'musicAromaPrefs', 'musicAromaSlimes', 'ma_games_unlocked'];

function collectLocalData() {
  const prefs = {};
  for (const k of SYNC_KEYS) { const v = localStorage.getItem(k); if (v !== null) prefs[k] = v; }
  const out = { prefs };
  try { const pet = JSON.parse(localStorage.getItem('ma_pet') || 'null'); if (pet) out.pet = pet; } catch (e) {}
  return out;
}

function applyCloudData(row) {
  try {
    const p = row.prefs || {};
    const prefKeys = Object.keys(p);
    if (prefKeys.length) for (const k of prefKeys) {
      if (p[k] === null) localStorage.removeItem(k); else localStorage.setItem(k, p[k]);
    }
    if (row.pet) localStorage.setItem('ma_pet', JSON.stringify(row.pet));
    return prefKeys.length > 0 || !!row.pet;
  } catch (e) { return false; }
}

const WATCH_KEYS = SYNC_KEYS.concat(['ma_pet']);   // v639: 宠物任何变化也要推云端

let _prefPushTimer = null;
async function pushLocalData() {
  try { await cloudUpdateProfile(collectLocalData()); } catch (e) {}
}

/* v641: 云端数据拉回 localStorage 后, 不用关网页重开, 立刻生效 ——
   主题/自定义色/字体重新应用, 宠物全局状态刷新, 正在宠物页就重渲染 */
function applySyncedDataLive() {
  try { loadPrefs(); } catch (e) {}
  try { applyTheme(state.prefs.theme, state.prefs.customAccent, state.prefs.customBg); } catch (e) {}
  try { applyFonts(); } catch (e) {}
  try { refreshPetGlobal(); } catch (e) {}
  try { if (state.currentView === 'pets') renderPetHome(); } catch (e) {}
  try { if (typeof refreshGameLocks === 'function') refreshGameLocks(); } catch (e) {}
}

async function syncAccountData() {
  if (!sbReady() || !cm.uid) return;
  try {
    const { data } = await sb.from('profiles').select('prefs, pet').eq('id', cm.uid).single();
    if (!data) return;
    const hasCloudPrefs = data.prefs && Object.keys(data.prefs).length > 0;
    if (hasCloudPrefs || data.pet) {
      applyCloudData(data);          // 云端有 → 拉回来盖本地
      applySyncedDataLive();         // v641: 拉完立刻生效(不等刷新)
    } else {
      const local = collectLocalData();
      if (local.prefs && Object.keys(local.prefs).length) pushLocalData();  // 云端还没有 → 首次上传
    }
  } catch (e) {}
}

/* 偏好键被改写 → 1.5s 防抖后自动推云端 (换设备前先同步过就基本不掉) */
const _origSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function (k, v) {
  _origSetItem.call(this, k, v);
  try {
    if (WATCH_KEYS.indexOf(k) !== -1 && typeof currentUser === 'function' && currentUser()) {
      clearTimeout(_prefPushTimer);
      _prefPushTimer = setTimeout(() => { try { pushLocalData(); } catch (e) {} }, 1500);
    }
  } catch (e) {}
};

/* v632: 身份只认手机号 —— 机主 = OWNER_PHONE, 昵称随时可改, 不作身份依据。
   (v628 的昵称→手机号绑定表已删: 全站清零重启后, 所有账号注册时就自带手机号) */
const OWNER_PHONE = '18810300207';
function isOwnerUser(u) {
  u = u || currentUser();
  return !!u && u.phone === OWNER_PHONE;
}

/* ---------- v633: 单设备在线(会话互踢) / v668 修复互踢死循环 ----------
   v668 之前: cloudEnsureUser 每次发现已有云端会话都 claimSession 生成新戳 →
   刷新页面/开第二个标签页/进社区都会重置 profiles.sess, 另一台设备(或另一个标签页,
   同 localStorage 也各自跑心跳) 30s 一比对就互踢 → 「账号一直闪退」「新人进社区就被登出」。
   现在: 会话戳只在**真正输密码登录/找回重置**时生成新戳(fresh=true);
   其余场景(进社区/页面刷新/多标签页)一律复用本地已有戳, 且复用前先查云端——
   云端已是别人的新戳 = 本机确实被顶了 → 老实退出; 云端没记 → 补写; 一致 → 什么都不做。 */
function _newSessStamp() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
/* v673: 真·登录换戳后, 云端写入是异步的——这段时间内任何"读云端戳比对"都会读到旧值,
   把刚登录成功的人误踢出去(= 登录反复失败/提示在别处登录过, 登好几遍才上来)。
   换戳后 10 秒内禁止一切踢出判定, 且换戳上行带"写后复查+补写"自愈 */
let _sessClaimTs = 0;
function _sessJustClaimed() { return Date.now() - _sessClaimTs < 10000; }
function claimSession(uid, fresh) {
  if (!uid) return;
  try {
    if (!fresh) {
      const cur = loadJSON('ma_sess', null);
      if (cur && cur.s) {
        // 复用: 先看云端归属, 防止把别的设备刚写的新戳覆盖回去(踢回去战争)
        /* v748: 恢复单设备互踢(用户钦定) + 根治"幽灵顶号":
           以前云端读不到就无条件把自己的旧戳补写上去 —— 网络抖一下读到空, 一台早就该退出的旧设备
           就会把自己"复活"成最新会话, 把刚登录的手机顶掉(= 电脑没登也莫名被踢)。
           现在: ①云端有别人的新戳 → 本机老实退出(旧规则) ②只有"行确实存在且 sess 为空"才补写 ③读失败绝不写 */
        if (sbReady() && !_sessJustClaimed()) {
          sb.from('profiles').select('id, sess').eq('id', uid).maybeSingle().then(({ data }) => {
            try {
              if (_sessJustClaimed()) return;
              const cs = data && data.sess;
              if (cs && cs !== cur.s) { kickOut(); return; }   // 本机已被新登录接管 → 老实退出, 绝不回写
              if (data && !cs) sb.from('profiles').upsert({ id: uid, sess: cur.s }).then(() => {}, () => {});   // 行在但没记戳 → 补写
            } catch (e) {}
          }, () => {});   // 读失败/超时 → 什么都不做, 静默等下一轮
        }
        return;
      }
    }
    _sessClaimTs = Date.now();
    const stamp = _newSessStamp();
    saveJSON('ma_sess', { s: stamp });
    if (sbReady()) {
      /* v673: 换戳上行自愈——写完 1.5s 复查云端是不是新戳, 不对就补写一次;
         上行本身失败也 1.5s 后补一次。否则 30s 心跳读到旧戳会踢刚登录的人 */
      const put = () => sb.from('profiles').upsert({ id: uid, sess: stamp }).then(() => {}, () => {});
      put();
      setTimeout(() => {
        sb.from('profiles').select('sess').eq('id', uid).maybeSingle().then(({ data }) => {
          if (!data || data.sess !== stamp) put();
        }, () => {}).catch(() => {});
      }, 1500);
    }
  } catch (e) {}
}

async function kickOut() {
  try { await pushLocalData(); } catch (e) {}   // v639: 清本机前先把数据推云端
  try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}   // 清掉的只是本机副本, 正本在云端账号里
  cm.uid = null;
  cm.gen++;
  if (sbReady()) { try { sb.auth.signOut(); } catch (e) {} }
  toast('你的账号刚在别的设备登录, 这台设备已退出登录');
  setTimeout(() => { location.href = location.pathname; }, 900);   // 回到第一页
}

async function checkSessionKicked() {
  if (_sessJustClaimed()) return false;   // v673: 刚登录换戳, 云端旧值在飞, 不许判踢
  const local = loadJSON('ma_sess', null);
  if (!local || !local.s || !cm.uid || !sbReady()) return false;
  try {
    const { data } = await sb.from('profiles').select('sess').eq('id', cm.uid).maybeSingle();
    if (data && data.sess && data.sess !== local.s) { kickOut(); return true; }
  } catch (e) {}
  return false;
}
setInterval(() => { try { if (document.hidden) return; if (currentUser() && cm.uid) checkSessionKicked(); } catch (e) {} }, 30000);

async function cloudSyncAccount() {
  try { await cloudEnsureUser(); } catch (e) { /* 静默, 下次进社区重试 */ }
  try { await syncAccountData(); } catch (e) {}   // v638: 登录态下拉偏好/小宠
  /* v745: 后台预热星星瓶清单 —— 登录/启动时就把 ma_wish_state 拉好写进缓存,
     手机上之后点开星星瓶秒显星星(不用再干等免费版 2-3s 冷启动 RPC) */
  try { if (cm.uid) refreshWishState(true); } catch (e) {}
  checkUnlockRemote();                            // v660: 顺带查一次解锁审核结果
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
    /* v671: 不再笼统说"连不上", 按真实原因给可操作的提示 */
    if (_cloudAuthErr === 'net') showCmOffline('🌫️ 暂时连不上社区服务器', '你的网络到不了社区服务器, 试试切换 WiFi 和手机流量再点重新连接', true);
    else if (_cloudAuthErr === 'auth') showCmOffline('🔑 账号登录状态有点问题', '退出账号重新登录一次, 或用「找回密码」重置后再进社区', true);
    else showCmOffline('🌫️ 连不上社区服务器', '网络好像不太顺, 稍后再来看看~');
    return;
  }
  const my = await loadMyProfile();
  if (gen !== cm.gen) return;
  if (!my) {
    if (_cloudProfileErr === 'net') showCmOffline('🌫️ 暂时连不上社区服务器', '你的网络到不了社区服务器, 试试切换 WiFi 和手机流量再点重新连接', true);
    else showCmOffline('🌫️ 连不上社区服务器', '网络好像不太顺, 稍后再来看看~');
    return;
  }
  cm.myJoinAt = my.created_at;
  /* v670: 之前 禁言/会话/公告/消息/成员数/好友/申请 全是串行 await, 一条网络往返慢后面全排队,
     界面迟迟不亮 = "进社区卡"。现在只串行拉必需的"我的资料", 其余两两并行; 会话id一到手就亮出聊天框,
     公告/消息/成员/好友在后台并行加载, 哪个先回来哪个先显示 */
  const mrP = sb.from('profiles').select('muted_until, nickname').eq('id', cm.uid).maybeSingle()
    .then(r => {
      cm.myMutedUntil = (r && r.data && r.data.muted_until) || null;
      cm.myGroupNick = (r && r.data && r.data.nickname) || cm.myGroupNick;
    })
    .catch(() => { cm.myMutedUntil = null; });
  const convP = sb.from('conversations').select('id').eq('slug', 'community').single()
    .then(({ data, error }) => {
      if (error || !data) {
        /* v671: 网络错误原样穿透, 只有"确实没有 community 会话行"才算初始化问题 */
        if (error && /fetch|network|timeout|Failed to fetch/i.test(error.message || '')) throw error;
        throw new Error('conv-init');
      }
      cm.groupConvId = data.id;
      try { localStorage.setItem('ma_group_conv', data.id); } catch (e) {}   // v36.6: 缓存会话id, 页面加载即可全站订阅
    });
  try { await Promise.all([mrP, convP]); } catch (e) {
    /* v671: 网络断和会话行缺失分开提示, 不再一律让用户背"还在初始化"的锅 */
    if (_classifyAuthErr(e) === 'net') showCmOffline('🌫️ 暂时连不上社区服务器', '你的网络到不了社区服务器, 试试切换 WiFi 和手机流量再点重新连接', true);
    else showCmOffline('🌱 社区还在初始化', '请确认已运行初始化 SQL~');
    return;
  }
  if (gen !== cm.gen) return;
  refreshMentionList();   // v643: @ 选择列表(异步不阻塞)
  checkSessionKicked();   // v633: 进社区先看有没有被别的设备顶掉(异步不阻塞)
  // 每次进社区同步昵称头像; v34: 设置过群昵称则以群昵称为准
  const groupNick = localStorage.getItem('ma_group_nick');
  const patch = { nickname: groupNick || user.name, avatar: user.avatar };
  // v34: 疗友号以云端 profiles.friend_code 为准(SQL 触发器生成, 全局唯一),
  //      只在云端确实没有时才用本地兜底号补齐, 绝不覆盖云端唯一值
  if (!my.friend_code) patch.friend_code = getFriendCode();
  if (!my.bday && user.bday) patch.bday = user.bday;   // v636: 老账号首次补传生日
  cloudUpdateProfile(patch);   // 异步不阻塞
  // v34: 云端疗友号回写本地
  if (my.friend_code) localStorage.setItem('ma_friend_code', my.friend_code);

  if (cm.dmWith) setDmMode(cm.dmWith); else { cm.convId = cm.groupConvId; setDmMode(null); }
  body.hidden = false; inputBar.hidden = false;   // v670: 界面先亮, 数据并行补
  if (!cm.dmWith) cmGroupMarkRead();   // v39: 打开社区看群聊 → 群聊红点消失

  loadAnnouncement();   // 异步并行
  const tail = () => {   // v670: 消息回来后其余全并行; 离开了就不再订阅
    if (gen !== cm.gen) return;
    refreshMemberCount();
    loadFriendList();
    refreshRequestList();
    subscribeAll();
    cm.entered = true;
  };
  loadCommunityMessages().then(tail, tail);
}

function leaveCommunity() {
  cm.gen++;
  cm.entered = false;
  cm.online = false;
  unsubscribeAll();
  closeProfileCard();
}

function showCmOffline(title, sub, retry) {
  document.getElementById('cmOfflineTitle').textContent = title;
  document.getElementById('cmOfflineSub').textContent = sub;
  // v671: 网络/账号类错误 → 显示「重新连接」按钮, 一键重试不用刷新页面
  const btn = document.getElementById('cmOfflineRetry');
  if (btn) btn.hidden = !retry;
  // v623: 站长自己看到时补一条排查提示 —— Supabase 免费版 7 天无活动会自动暂停
  try {
    const u = currentUser();
    if (isOwnerUser(u)) {   // v632: 只认机主手机号
      document.getElementById('cmOfflineSub').textContent =
        sub + ' ｜ 站长排查: 登录 supabase.com 打开项目, 若显示 Paused 就点 Resume project';
    }
  } catch (e) {}
  document.getElementById('cmOffline').hidden = false;
}

/* v671: 记录个人资料加载失败原因 'net'=网络 / 'no-row'=云端没有资料行(自动补建后不该再出现) */
let _cloudProfileErr = null;
async function loadMyProfile() {
  try {
    /* single() 在没有行时直接报错 → 老代码把它当"连不上服务器", 其实是资料行丢了
       (比如建号时触发器没跑/表被清过)。改 maybeSingle + 自动补建一行再读 = 自愈 */
    const { data, error } = await sb.from('profiles')
      .select('id, nickname, avatar, created_at, friend_code, bday').eq('id', cm.uid).maybeSingle();
    if (error) { _cloudProfileErr = 'net'; return null; }
    if (!data) {
      const user = currentUser();
      try {
        await sb.from('profiles').upsert({
          id: cm.uid,
          nickname: (localStorage.getItem('ma_group_nick') || (user && user.name) || '小伙伴'),
          avatar: (user && user.avatar) || '🌙'
        });
        const again = await sb.from('profiles')
          .select('id, nickname, avatar, created_at, friend_code, bday').eq('id', cm.uid).maybeSingle();
        if (again && again.data) { _cloudProfileErr = null; cm.profileCache[again.data.id] = again.data; return again.data; }
      } catch (e) {}
      _cloudProfileErr = 'no-row';
      return null;
    }
    _cloudProfileErr = null;
    cm.profileCache[data.id] = data;
    return data;
  } catch (e) { _cloudProfileErr = 'net'; return null; }
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

  // v671: 离线卡「重新连接」按钮 → 重跑 enterCommunity(防抖避免连点)
  const retryBtn = document.getElementById('cmOfflineRetry');
  if (retryBtn && !retryBtn.dataset.bound) {
    retryBtn.dataset.bound = '1';
    retryBtn.addEventListener('click', () => {
      if (retryBtn.dataset.busy) return;
      retryBtn.dataset.busy = '1';
      setTimeout(() => { delete retryBtn.dataset.busy; }, 1200);
      enterCommunity();
    });
  }

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

  // 发送(点击 + 回车); v643: @ 选择框打开时, 回车=选人、上下键=移动高亮
  document.getElementById('cmSend').addEventListener('click', sendCommunityMessage);
  document.getElementById('cmInput').addEventListener('keydown', e => {
    if (mentionPopOpen()) {
      const list = cm.mentionCandidates || [];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        cm.mentionIdx = (cm.mentionIdx + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length;
        updateMentionHl();
        return;
      }
      if (e.key === 'Enter') { e.preventDefault(); if (list[cm.mentionIdx]) pickMention(list[cm.mentionIdx]); return; }
      if (e.key === 'Escape') { closeMentionPop(); return; }
    }
    if (e.key === 'Enter') sendCommunityMessage();
  });
  cmMentionInputHook();   // v643: 输入 @ 弹成员选择

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
  const annRevoke = document.getElementById('cmAnnRevokeBtn');
  if (annRevoke) annRevoke.addEventListener('click', revokeAnnouncement);   // v640

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
  /* v646: 系统广播(禁言/解禁等, ma-sys| 前缀) → 居中灰色系统条, 不带头像昵称 */
  if (typeof m.content === 'string' && m.content.startsWith('ma-sys|')) {
    const sys = document.createElement('p');
    sys.className = 'cm-sys';
    sys.dataset.id = m.id;
    sys.textContent = m.content.slice(7);
    return sys;
  }
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
  bubble.className = 'cm-bubble' + (!mine && contentMentionsMe(m.content) ? ' cm-mentioned' : '');   // v643: @ 我的高亮
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
  if (box.querySelector('.cm-msg[data-id="' + m.id + '"], .cm-sys[data-id="' + m.id + '"]')) return;   // realtime 回流去重(含系统条)
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

/* ========== v643 群聊 @ 功能(微信式): 输入 @ 弹成员选择, 被 @ 的人收到提示 ========== */
function cmMyNick() { return cm.myGroupNick || (currentUser() && currentUser().name) || ''; }

/* 消息内容是否 @ 了我(昵称后必须是空白或结尾, 防 "@张三" 误中 "@张三四") */
function contentMentionsMe(content) {
  const myNick = cmMyNick();
  if (!myNick || typeof content !== 'string') return false;
  const esc = myNick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('@' + esc + '(?=\\s|$)').test(content);
}

/* 被谁的哪条消息 @ 了(全站生效, 按消息 id 去重; 群聊 INSERT 会同时被两个订阅收到) */
function handleIncomingMention(nd) {
  if (!nd || nd.sender_id === cm.uid) return;
  if (nd.conversation_id !== cm.groupConvId) return;   // 只管群聊
  if (nd.id <= cm.lastMentionId) return;
  if (!contentMentionsMe(nd.content)) return;
  cm.lastMentionId = nd.id;
  hydrateProfiles([nd.sender_id]).then(() => {
    const who = cmDisplayName(cm.profileCache[nd.sender_id], '小伙伴');
    cmNotify('💬 ' + who + ' 在群里 @了你, 快去看看吧');
  });
}

function refreshMentionList() {
  if (!sbReady() || !cm.uid) return;
  sb.from('profiles').select('id, nickname, avatar')
    .not('nickname', 'in', '("小疗友","神秘疗愈师")')
    .order('created_at', { ascending: false }).limit(200)
    .then(({ data }) => {
      cm.mentionList = (data || []).filter(p => !isGhostNick(p.nickname) && p.id !== cm.uid);
    }, () => {});
}

function mentionPopOpen() {
  const pop = document.getElementById('cmMentionPop');
  return !!(pop && !pop.hidden && (cm.mentionCandidates || []).length);
}

function closeMentionPop() {
  const pop = document.getElementById('cmMentionPop');
  if (pop) pop.hidden = true;
  cm.mentionCandidates = [];
}

/* v647: @ 弹窗带搜索框(微信式选人) —— 打 @ 弹搜索框, 输入昵称过滤, 点选插入; 搜不到显示提示 */
function renderMentionList(listBox, needle) {
  const list = (cm.mentionList || []).filter(p =>
    (p.nickname || '').toLowerCase().indexOf(needle) !== -1).slice(0, 20);
  cm.mentionCandidates = list;
  cm.mentionIdx = 0;
  listBox.innerHTML = '';
  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'cm-mention-empty';
    empty.textContent = '没找到这个成员…';
    listBox.appendChild(empty);
    return;
  }
  list.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'cm-mention-item' + (i === 0 ? ' hl' : '');
    item.textContent = (p.avatar || '🌙') + ' ' + (p.nickname || '小伙伴');
    item.title = p.nickname || '';   // 悬停可见完整昵称
    item.addEventListener('mousedown', e => { e.preventDefault(); pickMention(p); });   // mousedown 防搜索框先失焦
    listBox.appendChild(item);
  });
}

function openMentionPop(q, focusSearch) {
  const pop = document.getElementById('cmMentionPop');
  if (!pop) return;
  pop.innerHTML = '';
  const search = document.createElement('input');
  search.type = 'text';
  search.className = 'cm-mention-search';
  search.placeholder = '🔍 搜索成员昵称…';
  search.value = String(q || '');
  search.addEventListener('input', () => renderMentionList(listBox, search.value.toLowerCase()));
  search.addEventListener('keydown', e => {   // 焦点在搜索框时也能 ↑↓/回车/Esc
    const list2 = cm.mentionCandidates || [];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list2.length) {
        cm.mentionIdx = (cm.mentionIdx + (e.key === 'ArrowDown' ? 1 : list2.length - 1)) % list2.length;
        updateMentionHl();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (list2[cm.mentionIdx]) pickMention(list2[cm.mentionIdx]);
    } else if (e.key === 'Escape') {
      e.preventDefault(); closeMentionPop();
    }
  });
  const listBox = document.createElement('div');
  listBox.className = 'cm-mention-list';
  pop.appendChild(search);
  pop.appendChild(listBox);
  renderMentionList(listBox, String(q || '').toLowerCase());
  pop.hidden = false;
  if (focusSearch) { try { search.focus(); } catch (e) {} }
}

function updateMentionHl() {
  const pop = document.getElementById('cmMentionPop');
  if (!pop) return;
  const items = pop.querySelectorAll('.cm-mention-item');
  items.forEach((el, i) => el.classList.toggle('hl', i === cm.mentionIdx));
  if (items[cm.mentionIdx] && items[cm.mentionIdx].scrollIntoView) {
    try { items[cm.mentionIdx].scrollIntoView({ block: 'nearest' }); } catch (e) {}
  }
}

/* 选中成员: 把输入框里光标前的 "@xxx" 换成 "@昵称 " */
function pickMention(p) {
  const input = document.getElementById('cmInput');
  if (!input) return;
  const pos = input.selectionStart == null ? input.value.length : input.selectionStart;
  const before = input.value.slice(0, pos);
  const after = input.value.slice(pos);
  const m = before.match(/@([^\s@]*)$/);
  if (m) {
    const replaced = before.slice(0, m.index) + '@' + p.nickname + ' ';
    input.value = replaced + after;
    const np = replaced.length;
    try { input.setSelectionRange(np, np); } catch (e) {}
  }
  closeMentionPop();
  input.focus();
}

/* 输入时检测: 光标前是 "@xxx" 就弹选择框(仅群聊) */
function cmMentionInputHook() {
  const input = document.getElementById('cmInput');
  if (!input) return;
  input.addEventListener('input', () => {
    if (cm.dmWith) { closeMentionPop(); return; }
    const pos = input.selectionStart == null ? input.value.length : input.selectionStart;
    const m = input.value.slice(0, pos).match(/@([^\s@]*)$/);
    if (m) openMentionPop(m[1], false); else closeMentionPop();   // v647: 不抢焦点, 打字照常过滤
  });
  /* v645: 触屏设备长按输入框 = 微信式弹 @ 成员列表(自动在光标处插入 @, 继续打字即可过滤) */
  if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) {
    let lpTimer = null, lpStart = null;
    input.addEventListener('touchstart', e => {
      lpStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lpTimer = setTimeout(() => {
        lpTimer = null;
        if (cm.dmWith) return;
        const pos = input.selectionStart == null ? input.value.length : input.selectionStart;
        const before = input.value.slice(0, pos);
        if (!/@([^\s@]*)$/.test(before)) {   // 光标前没有 @ 才补一个, 避免出现 @@xxx
          input.value = before + '@' + input.value.slice(pos);
          const np = before.length + 1;
          try { input.setSelectionRange(np, np); } catch (e2) {}
        }
        openMentionPop('', true);   // v647: 长按 → 聚焦搜索框直接搜人
      }, 550);
    }, { passive: true });
    input.addEventListener('touchmove', e => {   // 滚动/移动超过 12px 视为滑动, 取消长按
      if (!lpTimer || !lpStart) return;
      const t = e.touches[0];
      if (Math.abs(t.clientX - lpStart.x) > 12 || Math.abs(t.clientY - lpStart.y) > 12) {
        clearTimeout(lpTimer); lpTimer = null;
      }
    }, { passive: true });
    input.addEventListener('touchend', () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } }, { passive: true });
    input.addEventListener('touchcancel', () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } }, { passive: true });
  }
}

/* ============================================
   v645 触屏生日滚轮选择器 —— 年/月/日 三栏上下滑动
   (仅触屏设备接管; 桌面保持原生 <input type="date"> 不变)
   ============================================ */
function bdayIsTouch() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
}

function enableBdayTouchPicker() {
  if (!bdayIsTouch()) return;
  ['regBday', 'fogBday', 'apBday'].forEach(id => {
    const el = document.getElementById(id);
    if (!el || el.dataset.pickerBound) return;
    el.dataset.pickerBound = '1';
    el.readOnly = true;            // 防手机键盘弹出
    el.type = 'text';
    el.placeholder = '点这里选生日 🎂';
    el.addEventListener('click', () => openBdayWheel(el));
    el.addEventListener('focus', () => openBdayWheel(el));   // 首次点按可能只触发 focus
  });
}

function openBdayWheel(input) {
  if (document.getElementById('bdayWheelMask')) return;   // 已开着就不重复开
  const today = new Date();
  const Y_MIN = 1900, Y_MAX = today.getFullYear(), ITEM_H = 40, PAD = 80;
  let y0 = Y_MIN + 50, m0 = 1, d0 = 1;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input.value || '')) {
    const parts = input.value.split('-').map(Number);
    y0 = Math.min(Y_MAX, Math.max(Y_MIN, parts[0]));
    m0 = Math.min(12, Math.max(1, parts[1]));
    d0 = Math.min(31, Math.max(1, parts[2]));
  }

  const mask = document.createElement('div');
  mask.id = 'bdayWheelMask';
  mask.className = 'bday-wheel-mask';
  const sheet = document.createElement('div');
  sheet.className = 'bday-wheel-sheet';
  sheet.innerHTML =
    '<div class="bday-wheel-head">' +
      '<button type="button" class="bday-wheel-cancel">取消</button>' +
      '<p class="bday-wheel-title">🎂 选择你的生日</p>' +
      '<button type="button" class="bday-wheel-ok">确定</button>' +
    '</div>' +
    '<div class="bday-wheel-cols"></div>';
  const cols = sheet.querySelector('.bday-wheel-cols');
  mask.appendChild(sheet);

  function makeCol(label, items, sel) {
    const col = document.createElement('div');
    col.className = 'bday-wheel-col';
    const padTop = document.createElement('div');
    padTop.className = 'bday-wheel-pad';
    const padBottom = padTop.cloneNode(false);
    col.appendChild(padTop);
    items.forEach(t => {
      const it = document.createElement('div');
      it.className = 'bday-wheel-item';
      it.textContent = t;
      // v686: 点一下直接滚到中间选中 —— 年份不用一格一格搓了
      it.addEventListener('click', () => {
        const i = items.indexOf(t);
        if (i >= 0) col.scrollTo({ top: i * ITEM_H, behavior: 'smooth' });
      });
      col.appendChild(it);
    });
    col.appendChild(padBottom);
    col._items = items;   // v669: 之前漏存, settle 读 col._items.length 抛错 → _sel 永远停在初始值(1950-01-01)
    col.addEventListener('scroll', () => {
      clearTimeout(col._tmr);
      col._tmr = setTimeout(() => settle(col), 120);
    });
    col._sel = Math.max(0, Math.min(items.length - 1, sel));
    col._label = label;
    return col;
  }

  function daysIn(y, m) { return new Date(y, m, 0).getDate(); }

  let colY, colM, colD;
  function buildDayCol(y, m, keepDay) {
    const n = daysIn(y, m);
    const items = [];
    for (let i = 1; i <= n; i++) items.push(i + ' 日');
    const oldSel = colD ? (typeof colD._sel === 'number' ? colD._sel : Math.round((colD.scrollTop || 0) / ITEM_H)) : 0;   // v669: 用 _sel 而非 scrollTop——rAF 还没滚到位时 scrollTop=0 会把已选日子重置成 1 日
    let sel = colD ? Math.min(n - 1, Math.max(0, isNaN(oldSel) ? 0 : oldSel)) : d0 - 1;
    if (!keepDay) sel = Math.min(n - 1, d0 - 1);
    const fresh = makeCol('', items, sel);
    if (colD && colD.parentNode) colD.parentNode.replaceChild(fresh, colD);
    else cols.appendChild(fresh);
    colD = fresh;
    requestAnimationFrame(() => { colD.scrollTop = colD._sel * ITEM_H; });
  }

  function settle(col) {
    if (!col._items || !col._items.length) return;   // v669: 防御
    let idx = Math.round((col.scrollTop || 0) / ITEM_H);
    if (isNaN(idx)) idx = col._sel || 0;
    idx = Math.max(0, Math.min(col._items.length - 1, idx));
    col._sel = idx;
    col.scrollTop = idx * ITEM_H;   // 吸附到正中
    if (col === colY || col === colM) {
      const y = Y_MIN + colY._sel, m = colM._sel + 1;   // v669: 之前传 yItems[colY._sel]="2003 年" 字符串 → daysIn 算 NaN → 日列被清空
      buildDayCol(y, m, true);
    }
  }

  const yItems = [];
  for (let y = Y_MIN; y <= Y_MAX; y++) yItems.push(y + ' 年');
  const mItems = [];
  for (let m = 1; m <= 12; m++) mItems.push(m + ' 月');

  colY = makeCol('', yItems, y0 - Y_MIN);
  colM = makeCol('', mItems, m0 - 1);
  cols.appendChild(colY); cols.appendChild(colM);
  buildDayCol(y0, m0, false);
  // v686: 选中行高亮带(横杠) —— 加在最后, pointer-events:none 不挡滚动
  const band = document.createElement('div');
  band.className = 'bday-wheel-band';
  cols.appendChild(band);

  function close() {
    mask.classList.remove('show');
    setTimeout(() => mask.remove(), 200);
    if (document.activeElement === input) input.blur();
  }

  sheet.querySelector('.bday-wheel-cancel').addEventListener('click', close);
  mask.addEventListener('click', e => { if (e.target === mask) close(); });
  sheet.querySelector('.bday-wheel-ok').addEventListener('click', () => {
    const y = Y_MIN + colY._sel;
    const m = colM._sel + 1;
    const d = Math.min(daysIn(y, m), colD._sel + 1);
    const v = y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    input.value = v;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    close();
  });

  document.body.appendChild(mask);
  requestAnimationFrame(() => {
    mask.classList.add('show');
    colY.scrollTop = colY._sel * ITEM_H;
    colM.scrollTop = colM._sel * ITEM_H;
  });
}

/* v670: 自己发的消息先乐观上屏(不等云端往返), 云端/realtime 确认后给气泡盖上真实 id+时间。
   两边谁先到都能对上: 内容相同的第一条 pending 气泡被盖戳, 之后的按 id 去重, 不会出双份 */
function settleOwnMsg(m) {
  if (!m || typeof m.content !== 'string') return;
  const box = document.getElementById('cmMsgs');
  if (!box) return;
  const pend = box.querySelector('.cm-msg.me[data-pending="1"]');
  if (pend && pend.textContent.indexOf(m.content) !== -1) {
    pend.dataset.id = m.id;
    pend.dataset.pending = '';
    const time = pend.querySelector('.cm-time');
    if (time) time.textContent = fmtCmTime(m.created_at);
    if (m.id > cm.lastMsgId) cm.lastMsgId = m.id;
    if (!cm.firstMsgId || m.id < cm.firstMsgId) cm.firstMsgId = m.id;
    return;
  }
  appendMsgBubble(m, true);   // 没有pending气泡(异常路径) → 正常上屏, id 去重兜底
}

function appendOptimisticBubble(text) {
  const box = document.getElementById('cmMsgs');
  if (!box) return null;
  if (box.querySelector('.cm-empty')) box.innerHTML = '';
  const local = currentUser();
  const row = document.createElement('div');
  row.className = 'cm-msg me';
  row.dataset.pending = '1';   // 无 data-id: realtime 回流先到时靠 settleOwnMsg 盖戳而非重复上屏
  const av = document.createElement('span');
  av.className = 'cm-avatar';
  av.textContent = local ? local.avatar : '🌙';
  const col = document.createElement('div');
  col.className = 'cm-col';
  const bubble = document.createElement('div');
  bubble.className = 'cm-bubble';
  bubble.textContent = text;
  const time = document.createElement('p');
  time.className = 'cm-time';
  time.textContent = '刚刚';
  col.appendChild(bubble);
  col.appendChild(time);
  row.appendChild(av);
  row.appendChild(col);
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
  return row;
}

async function sendCommunityMessage() {
  const input = document.getElementById('cmInput');
  const text = input.value.trim();
  if (!text) return;
  if (!cm.convId || !cm.uid) { toast('社区还没连上, 稍等一下~'); return; }
  /* v642: 被禁言 → 前端拦截(云端 RLS 也会拒, 双保险) */
  if (mutedActive(cm.myMutedUntil)) {
    toast('🔇 你已被禁言至 ' + mutedLabel(cm.myMutedUntil) + ', 这段时间不能发言');
    return;
  }
  input.value = '';
  closeMentionPop();   // v643: 发送后收起 @ 选择框
  /* v670: 乐观上屏——之前要等云端 insert 完整往返气泡才出现, 网络一慢就"发文字卡";
     现在点了立刻显示, 云端确认后补上真实时间, 失败再撤回还原输入框 */
  const tempEl = appendOptimisticBubble(text);
  try {
    const { data, error } = await sb.from('messages')
      .insert({ conversation_id: cm.convId, sender_id: cm.uid, content: text })
      .select('id, sender_id, content, created_at').single();
    if (error) throw error;
    settleOwnMsg(data);
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
    if (tempEl) tempEl.remove();
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
    if (error || !data) {
      // v642 修复"群主看不到编辑按钮": 公告表还没有任何行时整卡被隐藏,
      // 群主连第一条都发不了(鸡生蛋) → 群主直接见到空卡片可发布
      if (!error && isOwnerUser()) {
        cm.announcement = { id: 1, owner_id: cm.uid, content: '', updated_at: null };
        cm.isOwner = true;
        renderAnnouncement();
        wrap.hidden = false;
      }
      return;
    }
    cm.announcement = data;
    cm.isOwner = data.owner_id === cm.uid || isOwnerUser();   // v632: 机主手机号兜底
    if (!data.content && !cm.isOwner) { wrap.hidden = true; return; }   // v640: 已撤销的公告, 成员看不到, 群主可见以便重新发布
    renderAnnouncement();
    wrap.hidden = false;
  } catch (e) { wrap.hidden = true; }
}

function renderAnnouncement() {
  const wrap = document.getElementById('cmAnnounce');
  if (!wrap || !cm.announcement) return;
  const a = cm.announcement;
  if (!a.content && !cm.isOwner) { wrap.hidden = true; return; }   // v640: 已撤销 → 成员整栏隐藏
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
  const revokeBtn = document.getElementById('cmAnnRevokeBtn');
  if (revokeBtn) revokeBtn.hidden = !cm.isOwner || !a.content;   // v640: 只有群主且有公告时才显示撤销
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

/* v640 群主撤销公告: 云端内容清空(软撤销), Realtime 自动通知所有人 */
async function revokeAnnouncement() {
  if (!cm.isOwner) { toast('只有群主才能撤销公告~'); return; }
  if (!cm.announcement || !cm.announcement.content) { toast('现在没有公告哦'); return; }
  const btn = document.getElementById('cmAnnRevokeBtn');
  btn.disabled = true; btn.textContent = '撤销中…';
  try {
    const { data, error } = await sb.rpc('revoke_announcement');
    if (error) throw error;
    cm.announcement = Array.isArray(data) ? data[0] : (data || Object.assign({}, cm.announcement, { content: '' }));
    renderAnnouncement();
    try { await postGroupMsg('📢 临时公告已撤销'); } catch (e) {}
    toast('✅ 公告已撤销, 大家都看不到了');
  } catch (e) {
    toast('公告撤销失败: ' + ((e && e.message) || '网络不太顺'));
  } finally {
    btn.disabled = false; btn.textContent = '🗑️ 撤销公告';
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

/* v670: 成员列表 60s 缓存 —— 之前每次切 tab 都等一个完整云端往返才显示 = "成员会卡";
   有缓存先秒出, 再后台刷新, 内容有变化才重画(不闪不加跳) */
function renderMemberList(list) {
  const grid = document.getElementById('cmMemberGrid');
  if (!grid) return;
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
    nm.textContent = (mutedActive(p.muted_until) ? '🔇 ' : '') + (p.nickname || '小伙伴') + (p.id === cm.uid ? '(我)' : '');   // v642: 禁言标记
    card.appendChild(av);
    card.appendChild(nm);
    card.addEventListener('click', () => openProfileCard(p.id));
    grid.appendChild(card);
  });
}
function membersSig(list) {
  return list.map(p => p.id + ':' + (p.nickname || '') + ':' + (p.avatar || '') + ':' + (mutedActive(p.muted_until) ? 1 : 0)).join('|');
}
async function renderMembers() {
  const grid = document.getElementById('cmMemberGrid');
  if (!grid) return;
  const hasCache = !!(cm.membersCache && cm.membersCache.length) && Date.now() - (cm.membersCacheT || 0) < 60000;
  if (!hasCache) grid.innerHTML = '<p class="cm-empty">加载中…</p>';
  else renderMemberList(cm.membersCache);
  try {
    const { data, error } = await sb.from('profiles')
      .select('id, nickname, avatar, created_at, muted_until')
      .not('nickname', 'in', '("小疗友","神秘疗愈师")')   // v37.3: 虚拟账号隐身
      .order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    const list = (data || []).filter(p => !isGhostNick(p.nickname));   // 前端兜底
    cm.membersCache = list;
    cm.membersCacheT = Date.now();
    if (!list.length && !hasCache) { grid.innerHTML = '<p class="cm-empty">还没有其他小伙伴~</p>'; return; }
    if (membersSig(list) !== (cm.membersSig || '')) {   // v670: 内容没变就不重画, 防止浏览时闪一下
      cm.membersSig = membersSig(list);
      renderMemberList(list);
    }
  } catch (e) {
    if (!hasCache) grid.innerHTML = '<p class="cm-empty">成员加载失败了, 稍后再试试~</p>';
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
/* v671: 频道名带代际号 —— sb.channel('同名') 会返回已存在的频道实例,
   断网时 removeChannel 清不掉, 离开社区再进来就拿到"已 subscribe"的旧频道,
   .on() 直接抛错 → 实时消息订阅死掉。每次退订换代, 频道名永不重复 */
let _chGen = 0;
function subscribeAll() {
  subscribeCommunity();
  if (cm.dmWith && cm.convId) subscribeDm(cm.convId);
  subscribeDmGlobal();    // v36.6: 全站私聊未读(防重)
}

function _chExists(name) {
  try { return sb.getChannels().some(c => c.topic === 'realtime:' + name); } catch (e) { return false; }
}
function subscribeCommunity() {
  if (!sb || !cm.uid || !cm.groupConvId) return;
  const nm = 'ma-community-' + _chGen;
  if (_chExists(nm)) return;   // v671: 同名频道已在客户端池里(哪怕处于异常态) → 绝不再 .on() 防抛错
  const ch = sb.channel(nm)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + cm.groupConvId },
      payload => {
        if (!payload.new) return;    // v643: 被 @ 也提示(私聊模式下同样弹)
        handleIncomingMention(payload.new);
        if (payload.new.sender_id === cm.uid) { settleOwnMsg(payload.new); return; }   // v670: 自己消息给乐观气泡盖戳, 防双份
        if (cm.dmWith) return;       // 私聊模式不打扰群聊(返回时会重载)
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
        cm.isOwner = payload.new.owner_id === cm.uid || isOwnerUser();   // v632: 机主手机号兜底
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
  const nm = 'ma-dm-' + convId + '-' + _chGen;
  if (_chExists(nm)) return;   // v671: 同上防重
  const ch = sb.channel(nm)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + convId },
      payload => {
        if (!payload.new) return;
        if (payload.new.sender_id === cm.uid) { settleOwnMsg(payload.new); return; }   // v670: 自己消息盖戳防双份
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
  const nm = 'ma-dm-global-' + _chGen;
  if (_chExists(nm)) return;   // v671: 同上防重(退出登录重进等场景客户端池可能还留着旧实例)
  const ch = sb.channel(nm)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      payload => {
        if (payload && payload.new) {
          handleIncomingDm(payload.new);
          handleIncomingMention(payload.new);   // v643: 全站任何页面被群友 @ 都有提示(按消息 id 去重)
        }
      })
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
  _chGen++;   // v671: 退订换代, 下次订阅用全新频道名(防拿到已 subscribe 的旧频道)
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
  { key: 'audio', label: '怎么上传助眠音' },
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
    return '想上传自己的助眠音, 去「ASMR」页最下面的「上传你喜欢的助眠音」空位: 点卡片选一个音频文件(mp3/wav/m4a 都行), 放好后点卡片就能循环播放, 长按删除随时换。上传的声音只存在你自己的设备里~';
  }
  if (has('支付', '安全', '扣款', '钱', '付款')) {
    return '产品还在预售阶段哦, 点「立即付款」会提示耐心等待, 产品会好好躺在购物车里不会被清掉~ 等 rosa 上架后就能正式下单啦~';
  }
  if (has('退款', '退货', '退')) {
    return '演示站的订单都只是本地记录, 没有真实扣款, 也就不存在退款啦。正式上线后会支持 7 天无理由退款~';
  }
  if (has('史莱姆', '游戏', '解压', '玩')) {
    return '解压游戏现在有 11 个: 抽象球(1.0 纪念版)、水感果冻捏捏、泡泡纸、切肥皂、DIY 史莱姆(做完直接开罐玩, 有起泡胶/液态玻璃等八种泥)、炭火烤串、冰激凌机、敲木鱼、精油蒸馏、开汽水、做披萨(6 步流水线)、指尖小圆(跟着小圆慢慢长大)。都在「解压游戏」页, 点开就玩~';
  }
  if (has('社区', '疗友', '好友', '私聊', '群聊', '加入社区')) {
    return '「疗愈社区」在顶部导航里(手机端在小目录/页面最底部)。注册一个账号就能进: 可以和大家实时聊天、点开别人资料卡加好友、和好友一对一私聊。聊天记录会一直保留; 后来加入的小伙伴看不到你加入之前的消息, 跟微信群一个机制~';
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

function scBubble(role, text, img) {
  if (img) {
    return '<div class="sc-msg ' + role + '"><span class="sc-bubble sc-bubble-img"><img class="sc-img" src="' + img + '" alt="图片" /></span></div>';
  }
  return '<div class="sc-msg ' + role + '"><span class="sc-bubble">' + text + '</span></div>';
}

/* v644: 图片点开看大图(全站共用灯箱, Esc/点背景关闭) */
function openImgLightbox(src) {
  let box = document.getElementById('imgLightbox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'imgLightbox';
    box.className = 'img-lightbox';
    const im = document.createElement('img');
    im.alt = '大图预览';
    box.appendChild(im);
    box.addEventListener('click', () => { box.classList.remove('show'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') box.classList.remove('show'); });
    document.body.appendChild(box);
  }
  box.querySelector('img').src = src;
  box.classList.add('show');
}

function bindSupport() {
  const fab = document.getElementById('supportFab');
  const chat = document.getElementById('supportChat');
  if (!fab || !chat) return;
  const msgs = document.getElementById('scMsgs');
  const chips = document.getElementById('scChips');
  const input = document.getElementById('scInput');

  let history = loadJSON('ma_chat', []);
  /* v642: 登录用户发的客服留言上云(support_msgs), 群主可在设置页客服信箱看到 */
  function scCloudSend(text) {
    try {
      if (!sbReady() || !cm.uid) return;
      const u = currentUser();
      sb.from('support_msgs').insert({ sender: cm.uid, nickname: (u && u.name) || '疗友', content: text }).then(() => {}, () => {});
    } catch (e) {}
  }
  function redraw() {
    msgs.innerHTML = history.slice(-30).map(m => scBubble(m.role, m.text, m.img)).join('') || '';
    msgs.querySelectorAll('img.sc-img').forEach(im => {
      im.addEventListener('click', () => openImgLightbox(im.src));
    });
    msgs.scrollTop = msgs.scrollHeight;
  }
  const MAX_HISTORY_IMGS = 8;   // 本地存 30 条, 图片太多会撑爆 localStorage → 只留最近 8 张, 更早的降级成文字
  function push(role, text, img) {
    history.push({ role, text: img ? '[图片]' : text, img: img || undefined });
    history = history.slice(-30);
    let imgSeen = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].img) { imgSeen++; if (imgSeen > MAX_HISTORY_IMGS) { history[i].img = undefined; } }
    }
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
      scCloudSend(q.label);
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
    /* v749: 未登录锁定 —— 消息弹窗盖一层「先要登录才能发」 */
    const lock = document.getElementById('scLock');
    if (lock) {
      const locked = !cm.uid;
      lock.hidden = !locked;
      if (locked) {
        const lb = document.getElementById('scLockLogin');
        if (lb && !lb._bound) {
          lb._bound = true;
          lb.addEventListener('click', () => { toggle(false); showView('account'); });
        }
      }
    }
    chat.classList.toggle('open', willOpen);
    chat.setAttribute('aria-hidden', String(!willOpen));
    fab.classList.toggle('away', willOpen);
    if (willOpen) {
      document.getElementById('sfBadge').hidden = true;
      if (!cm.uid) return;   // 锁着时不聚焦输入框
      setTimeout(() => input.focus(), 200);
    }
  }
  fab.addEventListener('click', () => toggle());
  document.getElementById('supportClose').addEventListener('click', () => toggle(false));

  function send() {
    if (!cm.uid) { toggle(true); return; }   // v749: 双保险
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    push('me', text);
    scCloudSend(text);
    botSay(scReply(text));
  }
  document.getElementById('scSend').addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') send();
  });

  /* v644: 发图片 —— 选图 → 压到最长边 800px JPEG → 本地气泡 + 云端信箱(群主可见原图压缩版) */
  const imgFile = document.getElementById('scImgFile');
  const imgBtn = document.getElementById('scImgBtn');
  if (imgBtn && imgFile) {
    imgBtn.addEventListener('click', () => imgFile.click());
    imgFile.addEventListener('change', () => {
      const f = imgFile.files && imgFile.files[0];
      imgFile.value = '';   // 允许连选同一张
      if (!f) return;
      if (!cm.uid) { toast('先要登录才能发消息哦'); return; }   // v749
      if (!/^image\//.test(f.type)) { toast('只能发图片哦'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const im = new Image();
        im.onload = () => {
          try {
            const MAX = 800;
            const scale = Math.min(1, MAX / Math.max(im.width, im.height));
            const cv = document.createElement('canvas');
            cv.width = Math.max(1, Math.round(im.width * scale));
            cv.height = Math.max(1, Math.round(im.height * scale));
            cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
            const dataURL = cv.toDataURL('image/jpeg', 0.72);
            push('me', '[图片]', dataURL);
            scCloudSend('data:image|' + dataURL);   // 信箱里带 data:image| 前缀, 群主端渲染成图
            botSay('图片收到啦~ 我已经转给 Rosa 看了, 她会在客服信箱里看到 🌿');
          } catch (e) {
            toast('图片处理失败了, 换一张试试?');
          }
        };
        im.onerror = () => toast('这张图片读不出来, 换一张试试?');
        im.src = reader.result;
      };
      reader.onerror = () => toast('图片读取失败, 再试一次?');
      reader.readAsDataURL(f);
    });
  }

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
  ctx.font = '11px "LXGW WenKai", sans-serif';
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
  /* v712: 揉面/抹酱声改循环跟随(与蛋糕挤奶油同款素材) —— 落笔开循环,
     停手或滑出饼面 120ms 内急收(fade 0.12s), 不再靠 200~240ms 重复触发堆尾巴 */
  let pzLoopNodes = null, pzLoopWait = false, pzLoopStopReq = false, lastPzAt = 0;
  function pzLoopKill(n, fade) {
    if (!n) return;
    _loopRelease(n);   // v728: 同上, 自定义停止也要摘登记
    try {
      const t = n.ctx.currentTime, g = n.master && n.master.gain;
      if (g) { const cur = (typeof g.value === 'number') ? g.value : 0.45; g.cancelScheduledValues(t); g.setValueAtTime(cur, t); g.linearRampToValueAtTime(0.0001, t + fade); }
    } catch (e) {}
    setTimeout(() => {
      try { (n.stops || []).forEach(f => f()); if (n.stop) n.stop(); } catch (e) {}
      try { if (n.master) n.master.disconnect(); } catch (e) {}
    }, fade * 1000 + 40);
  }
  function pzLoopStart() {
    lastPzAt = performance.now();
    if (pzLoopNodes || pzLoopWait) return;
    pzLoopWait = true; pzLoopStopReq = false;
    startLoopSound('game.sauceLoop').then(n => {
      pzLoopWait = false;
      if (!n) return;   // 没音源(懒加载失败) → 静默
      if (pzLoopStopReq || performance.now() - lastPzAt > 120) { pzLoopKill(n, 0.05); return; }
      try {   // 循环槽默认 ramp 到 0.6, 压到 0.45(与原 game.knead/game.sauce 同响度档)
        const t = n.ctx.currentTime, g = n.master.gain;
        g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0.45, t + 0.08);
      } catch (e) {}
      pzLoopNodes = n;
    });
  }
  function pzLoopStop() {
    const n = pzLoopNodes; pzLoopNodes = null;
    if (n) pzLoopKill(n, 0.12);
    else if (pzLoopWait) pzLoopStopReq = true;   // 还在加载就先记停, 到手即杀
  }
  const pzWinUp = () => pzLoopStop();   // 手指滑出画布松开也要收声
  window.addEventListener('pointerup', pzWinUp);
  window.addEventListener('pointercancel', pzWinUp);
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
      pzLoopStart();   // v712
    } else if (step === 2) {
      pzLoopStart();   // v712
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
        pzLoopStart();   // v712: 循环跟随(顺手把 lastPzAt 顶新, 停手 120ms 自动急收)
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
    pzLoopStop();   // v712
  });
  cv.addEventListener('pointercancel', () => { dragStart = null; eatMode = false; pzLoopStop(); });   // v712

  function stampSauce(x, y) {
    const now = performance.now();   // v718c: 原代码引用了不存在的 now(只在 render 作用域里声明)
                                     // → 每笔涂酱抛 ReferenceError, 覆盖率永远 0% = 卡死在涂酱步
    const r = Math.hypot(x - PZ_CX, y - PZ_CY);
    if (r > PZ_R - 8) return;
    // sm 画布(140x100)被拉伸绘制到披萨所在的 2PZ_R x 2PZ_R 方形, 用真实反变换让酱画在指针正下方
    const sx = (x - (PZ_CX - PZ_R)) * 140 / (PZ_R * 2);
    const sy = (y - (PZ_CY - PZ_R)) * 100 / (PZ_R * 2);
    smc.fillStyle = 'rgba(196,52,26,0.65)';
    smc.beginPath(); smc.arc(sx, sy, 6, 0, Math.PI * 2); smc.fill();
    pzLoopStart();   // v712: 循环跟随(顺手把 lastPzAt 顶新, 滑出饼面 120ms 自动急收)
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
    /* v749: 配菜无限制, 想放多少放多少 */
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
      else if (step === 4) setStatus('选配料, 点按摆到披萨上(可拖出形状) 已放 ' + tops.length);
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
      ctx.font = '600 15px "LXGW WenKai", sans-serif';
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
      pzLoopStop();   // v712: 关游戏循环声必须收干净
      window.removeEventListener('pointerup', pzWinUp);
      window.removeEventListener('pointercancel', pzWinUp);
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
    ctx.font = '300 30px "Cormorant Garamond", "LXGW WenKai", sans-serif';
    ctx.fillStyle = 'rgba(50,90,100,0.55)';
    ctx.fillText(String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'), CX, 50);
    ctx.font = '500 12px "LXGW WenKai", sans-serif';
    ctx.fillStyle = 'rgba(50,90,100,0.42)';
    ctx.fillText('静 心 小 憩', CX, 70);
    // v48: 中部两行大字提示去掉(用户反馈: 太丑挡视线), 只留底部小字
    // 底部当前小提示
    ctx.font = '500 14px "LXGW WenKai", sans-serif';
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
  rabbit: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"小兔\">\n  <defs>\n    <radialGradient id=\"p2rbBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\n      <stop offset=\"0%\" stop-color=\"#ffffff\"/>\n      <stop offset=\"42%\" stop-color=\"#faf6fe\"/>\n      <stop offset=\"74%\" stop-color=\"#f0e6f9\"/>\n      <stop offset=\"100%\" stop-color=\"#e3d3f3\"/>\n    </radialGradient>\n    <radialGradient id=\"p2rbEarIn\" cx=\"50%\" cy=\"28%\" r=\"78%\">\n      <stop offset=\"0%\" stop-color=\"#f6cfe0\"/>\n      <stop offset=\"100%\" stop-color=\"#ecacd0\"/>\n    </radialGradient>\n    <radialGradient id=\"p2rbBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n      <stop offset=\"0%\" stop-color=\"#f0a8c6\" stop-opacity=\".5\"/>\n      <stop offset=\"100%\" stop-color=\"#f0a8c6\" stop-opacity=\"0\"/>\n    </radialGradient>\n    <radialGradient id=\"p2rbWash\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n      <stop offset=\"0%\" stop-color=\"#f6f0fc\" stop-opacity=\".85\"/>\n      <stop offset=\"100%\" stop-color=\"#f6f0fc\" stop-opacity=\"0\"/>\n    </radialGradient>\n    <filter id=\"p2rbEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"6\" result=\"n\"/>\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\n    </filter>\n    <filter id=\"p2rbFur\" x=\"-35%\" y=\"-35%\" width=\"170%\" height=\"170%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2.4\" result=\"soft\"/>\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.045\" numOctaves=\"2\" seed=\"9\" result=\"n\"/>\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"13\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\n    </filter>\n    <filter id=\"p2rbHalo\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\n    </filter>\n  </defs>\n  <ellipse cx=\"120\" cy=\"231\" rx=\"52\" ry=\"6.5\" fill=\"#b9a4dd\" opacity=\".2\"/>\n  <ellipse cx=\"120\" cy=\"150\" rx=\"86\" ry=\"80\" fill=\"#e8daf6\" opacity=\".28\" filter=\"url(#p2rbHalo)\"/>\n  <g filter=\"url(#p2rbEdge)\">\n    <g transform=\"rotate(-10 92 88)\">\n      <g class=\"pt2-ear-l\">\n        <ellipse cx=\"92\" cy=\"44\" rx=\"17\" ry=\"45\" fill=\"url(#p2rbBody)\"/>\n        <ellipse cx=\"92\" cy=\"52\" rx=\"8\" ry=\"31\" fill=\"url(#p2rbEarIn)\" opacity=\".85\"/>\n      </g>\n    </g>\n    <g transform=\"rotate(10 148 88)\">\n      <g class=\"pt2-ear-r\">\n        <ellipse cx=\"148\" cy=\"44\" rx=\"17\" ry=\"45\" fill=\"url(#p2rbBody)\"/>\n        <ellipse cx=\"148\" cy=\"52\" rx=\"8\" ry=\"31\" fill=\"url(#p2rbEarIn)\" opacity=\".85\"/>\n      </g>\n    </g>\n    <path d=\"M 120 64 C 88 64 66 88 66 118 C 66 136 74 148 84 156 C 70 168 66 186 72 204 C 78 224 92 234 108 234 C 114 234 118 231 120 227 C 122 231 126 234 132 234 C 148 234 162 224 168 204 C 174 186 170 168 156 156 C 166 148 174 136 174 118 C 174 88 152 64 120 64 Z\" fill=\"url(#p2rbBody)\"/>\n    <path d=\"M 112 62 Q 117 50 124 61 Q 128 54 131 62\" stroke=\"#dcc8ee\" stroke-width=\"2.6\" fill=\"none\" stroke-linecap=\"round\" opacity=\".9\"/>\n  </g>\n  <g filter=\"url(#p2rbFur)\">\n    <ellipse cx=\"120\" cy=\"192\" rx=\"40\" ry=\"30\" fill=\"url(#p2rbWash)\" opacity=\".8\"/>\n    <ellipse cx=\"90\" cy=\"174\" rx=\"20\" ry=\"26\" fill=\"#e6d8f4\" opacity=\".22\"/>\n    <ellipse cx=\"150\" cy=\"174\" rx=\"20\" ry=\"26\" fill=\"#e6d8f4\" opacity=\".22\"/>\n    <ellipse cx=\"98\" cy=\"80\" rx=\"18\" ry=\"14\" fill=\"#fdeef6\" opacity=\".5\"/>\n    <ellipse cx=\"104\" cy=\"219\" rx=\"14\" ry=\"8\" fill=\"#fbf7fe\" opacity=\".9\"/>\n    <ellipse cx=\"140\" cy=\"219\" rx=\"14\" ry=\"8\" fill=\"#fbf7fe\" opacity=\".9\"/>\n  </g>\n  <g filter=\"url(#p2rbEdge)\">\n    <ellipse cx=\"74\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2rbBody)\" transform=\"rotate(6 74 177)\"/>\n    <ellipse cx=\"166\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2rbBody)\" transform=\"rotate(-6 166 177)\"/>\n  </g>\n  <g class=\"pt2-eyes\">\n    <circle cx=\"98\" cy=\"116\" r=\"8.5\" fill=\"#4a4058\"/>\n    <circle cx=\"101\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\n    <circle cx=\"142\" cy=\"116\" r=\"8.5\" fill=\"#4a4058\"/>\n    <circle cx=\"145\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\n  </g>\n  <ellipse cx=\"80\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2rbBlush)\"/>\n  <ellipse cx=\"160\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2rbBlush)\"/>\n  <path d=\"M 114 129 Q 120 125 126 129 Q 120 136.5 114 129 Z\" fill=\"#d98bc0\"/>\n  <g class=\"pt2-mouth-closed\">\n    <path d=\"M 111.5 140 Q 115.8 144.5 120 140.5 Q 124.2 144.5 128.5 140\" fill=\"none\" stroke=\"#8a6bb0\" stroke-width=\"2.6\" stroke-linecap=\"round\"/>\n  </g>\n  <g class=\"pt2-mouth-open\">\n    <ellipse cx=\"120\" cy=\"145\" rx=\"8\" ry=\"10\" fill=\"#7a5a9e\"/>\n    <ellipse cx=\"120\" cy=\"151\" rx=\"4.8\" ry=\"3.6\" fill=\"#f0a8c8\" opacity=\".85\"/>\n  </g>\n  <g transform=\"translate(52 60) scale(.8)\"><path class=\"pt2-spark\" style=\"animation-delay:.4s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#e8c9f0\" opacity=\".85\"/></g>\n  <g transform=\"translate(190 64) scale(.7)\"><path class=\"pt2-spark\" style=\"animation-delay:1.3s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9d8\" opacity=\".85\"/></g>\n  <g transform=\"translate(38 152) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:2.1s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#c9e4f0\" opacity=\".85\"/></g>\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.7s\" cx=\"176\" cy=\"168\" r=\"2.4\" fill=\"#fff\"/>\n  <circle class=\"pt2-spark\" style=\"animation-delay:.9s\" cx=\"44\" cy=\"108\" r=\"2\" fill=\"#fff\"/>\n</svg>",
  bear: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"小熊\">\n  <defs>\n    <radialGradient id=\"p2brBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\n      <stop offset=\"0%\" stop-color=\"#f8efe4\"/>\n      <stop offset=\"45%\" stop-color=\"#f0dcc4\"/>\n      <stop offset=\"76%\" stop-color=\"#e8d2b4\"/>\n      <stop offset=\"100%\" stop-color=\"#d9bd97\"/>\n    </radialGradient>\n    <radialGradient id=\"p2brEarIn\" cx=\"50%\" cy=\"42%\" r=\"70%\">\n      <stop offset=\"0%\" stop-color=\"#f6e7d4\"/>\n      <stop offset=\"100%\" stop-color=\"#e8cfae\"/>\n    </radialGradient>\n    <radialGradient id=\"p2brBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n      <stop offset=\"0%\" stop-color=\"#f0a0a8\" stop-opacity=\".5\"/>\n      <stop offset=\"100%\" stop-color=\"#f0a0a8\" stop-opacity=\"0\"/>\n    </radialGradient>\n    <radialGradient id=\"p2brWash\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n      <stop offset=\"0%\" stop-color=\"#faf0e2\" stop-opacity=\".85\"/>\n      <stop offset=\"100%\" stop-color=\"#faf0e2\" stop-opacity=\"0\"/>\n    </radialGradient>\n    <filter id=\"p2brEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"12\" result=\"n\"/>\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\n    </filter>\n    <filter id=\"p2brFur\" x=\"-35%\" y=\"-35%\" width=\"170%\" height=\"170%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2.4\" result=\"soft\"/>\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.045\" numOctaves=\"2\" seed=\"15\" result=\"n\"/>\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"13\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\n    </filter>\n    <filter id=\"p2brHalo\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\n    </filter>\n  </defs>\n  <ellipse cx=\"120\" cy=\"234\" rx=\"54\" ry=\"6.5\" fill=\"#b08a60\" opacity=\".22\"/>\n  <ellipse cx=\"120\" cy=\"152\" rx=\"88\" ry=\"82\" fill=\"#f0dcc2\" opacity=\".3\" filter=\"url(#p2brHalo)\"/>\n  <g filter=\"url(#p2brEdge)\">\n    <g class=\"pt2-bear-ear-l\">\n      <circle cx=\"82\" cy=\"66\" r=\"24\" fill=\"url(#p2brBody)\"/>\n      <circle cx=\"82\" cy=\"66\" r=\"13\" fill=\"url(#p2brEarIn)\"/>\n    </g>\n    <g class=\"pt2-bear-ear-r\">\n      <circle cx=\"158\" cy=\"66\" r=\"24\" fill=\"url(#p2brBody)\"/>\n      <circle cx=\"158\" cy=\"66\" r=\"13\" fill=\"url(#p2brEarIn)\"/>\n    </g>\n    <path d=\"M 120 66 C 86 66 62 92 62 124 C 62 146 72 158 84 166 C 68 178 64 198 72 216 C 80 234 96 240 110 239 C 115 239 118 236 120 232 C 122 236 125 239 130 239 C 144 240 160 234 168 216 C 176 198 172 178 156 166 C 168 158 178 146 178 124 C 178 92 154 66 120 66 Z\" fill=\"url(#p2brBody)\"/>\n  </g>\n  <g filter=\"url(#p2brFur)\">\n    <ellipse cx=\"120\" cy=\"150\" rx=\"27\" ry=\"21\" fill=\"url(#p2brWash)\" opacity=\".9\"/>\n    <ellipse cx=\"120\" cy=\"196\" rx=\"40\" ry=\"30\" fill=\"url(#p2brWash)\" opacity=\".7\"/>\n    <ellipse cx=\"90\" cy=\"178\" rx=\"20\" ry=\"26\" fill=\"#e4c9a6\" opacity=\".22\"/>\n    <ellipse cx=\"150\" cy=\"178\" rx=\"20\" ry=\"26\" fill=\"#e4c9a6\" opacity=\".22\"/>\n    <ellipse cx=\"96\" cy=\"84\" rx=\"18\" ry=\"13\" fill=\"#f8ecd8\" opacity=\".5\"/>\n    <ellipse cx=\"104\" cy=\"223\" rx=\"14\" ry=\"8\" fill=\"#faeed8\" opacity=\".9\"/>\n    <ellipse cx=\"140\" cy=\"223\" rx=\"14\" ry=\"8\" fill=\"#faeed8\" opacity=\".9\"/>\n  </g>\n  <g filter=\"url(#p2brEdge)\">\n    <ellipse cx=\"74\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2brBody)\" transform=\"rotate(6 74 177)\"/>\n    <ellipse cx=\"166\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2brBody)\" transform=\"rotate(-6 166 177)\"/>\n  </g>\n  <g class=\"pt2-eyes\">\n    <circle cx=\"99\" cy=\"118\" r=\"8\" fill=\"#4a3c30\"/>\n    <circle cx=\"102\" cy=\"115\" r=\"2.8\" fill=\"#fff\"/>\n    <circle cx=\"141\" cy=\"118\" r=\"8\" fill=\"#4a3c30\"/>\n    <circle cx=\"144\" cy=\"115\" r=\"2.8\" fill=\"#fff\"/>\n  </g>\n  <ellipse cx=\"76\" cy=\"142\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2brBlush)\"/>\n  <ellipse cx=\"164\" cy=\"142\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2brBlush)\"/>\n  <path d=\"M 113 138 Q 120 133.5 127 138 Q 120 146.5 113 138 Z\" fill=\"#8a6248\"/>\n  <g class=\"pt2-mouth-closed\">\n    <path d=\"M 120 146 Q 120 150 116 151.5 M 120 146 Q 120 150 124 151.5\" fill=\"none\" stroke=\"#7a543c\" stroke-width=\"2.4\" stroke-linecap=\"round\"/>\n  </g>\n  <g class=\"pt2-mouth-open\">\n    <ellipse cx=\"120\" cy=\"149\" rx=\"7.5\" ry=\"9\" fill=\"#7a543c\"/>\n    <ellipse cx=\"120\" cy=\"154\" rx=\"4.4\" ry=\"3.2\" fill=\"#f0b0a0\" opacity=\".85\"/>\n  </g>\n  <g transform=\"translate(50 62) scale(.8)\"><path class=\"pt2-spark\" style=\"animation-delay:.5s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\n  <g transform=\"translate(192 68) scale(.7)\"><path class=\"pt2-spark\" style=\"animation-delay:1.4s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#e8c9b0\" opacity=\".85\"/></g>\n  <g transform=\"translate(40 150) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:2.2s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#c9e0f0\" opacity=\".85\"/></g>\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.8s\" cx=\"174\" cy=\"166\" r=\"2.4\" fill=\"#fff\"/>\n  <circle class=\"pt2-spark\" style=\"animation-delay:1s\" cx=\"46\" cy=\"110\" r=\"2\" fill=\"#fff\"/>\n</svg>",
  hamster: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"仓鼠\">\\n  <defs>\\n    <radialGradient id=\"p2hmBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#fdf6e8\"/>\\n      <stop offset=\"42%\" stop-color=\"#f8ecca\"/>\\n      <stop offset=\"74%\" stop-color=\"#f0dcae\"/>\\n      <stop offset=\"100%\" stop-color=\"#e2c68e\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2hmEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#f8d8c8\"/>\\n      <stop offset=\"100%\" stop-color=\"#eeb8a4\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2hmBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f4a888\" stop-opacity=\".5\"/>\\n      <stop offset=\"100%\" stop-color=\"#f4a888\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2hmCheek\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#fdf8ec\" stop-opacity=\".95\"/>\\n      <stop offset=\"55%\" stop-color=\"#fdf8ec\" stop-opacity=\".5\"/>\\n      <stop offset=\"100%\" stop-color=\"#fdf8ec\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2hmWash\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#faf0dc\" stop-opacity=\".85\"/>\\n      <stop offset=\"100%\" stop-color=\"#faf0dc\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2hmEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"21\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2hmFur\" x=\"-35%\" y=\"-35%\" width=\"170%\" height=\"170%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2.4\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.045\" numOctaves=\"2\" seed=\"24\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"13\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2hmHalo\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"232\" rx=\"54\" ry=\"6.5\" fill=\"#d8bc8a\" opacity=\".2\"/>\\n  <ellipse cx=\"120\" cy=\"151\" rx=\"87\" ry=\"81\" fill=\"#f0dcba\" opacity=\".28\" filter=\"url(#p2hmHalo)\"/>\\n  <g filter=\"url(#p2hmEdge)\">\\n    <g class=\"pt2-bear-ear-l\"><path d=\"M 86 44 C 76 47 69 55 69 66 C 69 77 77 84 86 84 C 95 84 103 77 103 66 C 103 56 96 48 86 44 Z\" fill=\"url(#p2hmBody)\"/><path d=\"M 86 56 C 92 57 96 61 96 66 C 96 71 91 75 86 75 C 81 75 76 71 76 66 C 76 61 80 57 86 56 Z\" fill=\"url(#p2hmEarIn)\"/></g>\\n    <g class=\"pt2-bear-ear-r\"><path d=\"M 154 44 C 164 47 171 55 171 66 C 171 77 163 84 154 84 C 145 84 137 77 137 66 C 137 56 144 48 154 44 Z\" fill=\"url(#p2hmBody)\"/><path d=\"M 154 56 C 160 57 164 61 164 66 C 164 71 159 75 154 75 C 149 75 144 71 144 66 C 144 61 148 57 154 56 Z\" fill=\"url(#p2hmEarIn)\"/></g>\\n    <path d=\"M 120 64 C 88 64 66 88 66 118 C 66 136 74 148 84 156 C 70 168 66 186 72 204 C 78 224 92 234 108 234 C 114 234 118 231 120 227 C 122 231 126 234 132 234 C 148 234 162 224 168 204 C 174 186 170 168 156 156 C 166 148 174 136 174 118 C 174 88 152 64 120 64 Z\" fill=\"url(#p2hmBody)\"/>\\n  </g>\\n  <g filter=\"url(#p2hmFur)\">\\n    <ellipse cx=\"120\" cy=\"192\" rx=\"40\" ry=\"30\" fill=\"url(#p2hmWash)\" opacity=\".8\"/>\\n    <ellipse cx=\"90\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#eed8ac\" opacity=\".22\"/>\\n    <ellipse cx=\"150\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#eed8ac\" opacity=\".22\"/>\\n    <ellipse cx=\"98\" cy=\"82\" rx=\"18\" ry=\"14\" fill=\"#fdf8ec\" opacity=\".5\"/>\\n    <ellipse cx=\"104\" cy=\"220\" rx=\"14\" ry=\"8\" fill=\"#f8efd8\" opacity=\".9\"/>\\n    <ellipse cx=\"140\" cy=\"220\" rx=\"14\" ry=\"8\" fill=\"#f8efd8\" opacity=\".9\"/>\\n  </g>\\n  <g filter=\"url(#p2hmEdge)\">\\n    <ellipse cx=\"74\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2hmBody)\" transform=\"rotate(6 74 177)\"/>\\n    <ellipse cx=\"166\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2hmBody)\" transform=\"rotate(-6 166 177)\"/>\\n  </g>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"116\" r=\"8.5\" fill=\"#4a3c30\"/>\\n    <circle cx=\"101\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\\n    <circle cx=\"142\" cy=\"116\" r=\"8.5\" fill=\"#4a3c30\"/>\\n    <circle cx=\"145\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\\n  </g>\\n  <ellipse cx=\"80\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2hmBlush)\"/>\\n  <ellipse cx=\"160\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2hmBlush)\"/>\\n  <ellipse cx=\"85\" cy=\"133\" rx=\"15\" ry=\"12\" fill=\"url(#p2hmCheek)\"/>\\n  <ellipse cx=\"155\" cy=\"133\" rx=\"15\" ry=\"12\" fill=\"url(#p2hmCheek)\"/>\\n  <path d=\"M 116.5 129 Q 120 126 123.5 129 Q 120 133.5 116.5 129 Z\" fill=\"#d89078\"/>\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 115 136.5 Q 117.5 140 120 137 Q 122.5 140 125 136.5\" fill=\"none\" stroke=\"#a87858\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>\\n    <rect x=\"116.8\" y=\"137.5\" width=\"3\" height=\"4.2\" rx=\"1.3\" fill=\"#fff\" stroke=\"#e8c8a8\" stroke-width=\".5\"/>\\n    <rect x=\"120.2\" y=\"137.5\" width=\"3\" height=\"4.2\" rx=\"1.3\" fill=\"#fff\" stroke=\"#e8c8a8\" stroke-width=\".5\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"143\" rx=\"6.8\" ry=\"8.2\" fill=\"#9a6850\"/>\\n    <rect x=\"116.6\" y=\"142\" width=\"3.2\" height=\"4.4\" rx=\"1.4\" fill=\"#fff\"/>\\n    <rect x=\"120.2\" y=\"142\" width=\"3.2\" height=\"4.4\" rx=\"1.4\" fill=\"#fff\"/>\\n  </g>\\n  <g transform=\"translate(50 62) scale(.8)\"><path class=\"pt2-spark\" style=\"animation-delay:.5s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(192 68) scale(.7)\"><path class=\"pt2-spark\" style=\"animation-delay:1.4s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9b0\" opacity=\".85\"/></g>\\n  <g transform=\"translate(40 150) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:2.2s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#c9e4f0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.8s\" cx=\"176\" cy=\"166\" r=\"2.4\" fill=\"#fff\"/>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1s\" cx=\"44\" cy=\"110\" r=\"2\" fill=\"#fff\"/>\\n</svg>",
  squirrel: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"松鼠\">\\n  <defs>\\n    <radialGradient id=\"p2sqBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#f0e0c6\"/>\\n      <stop offset=\"42%\" stop-color=\"#e2c69e\"/>\\n      <stop offset=\"74%\" stop-color=\"#d2ae7e\"/>\\n      <stop offset=\"100%\" stop-color=\"#b88f5c\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2sqEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#ecc9ae\"/>\\n      <stop offset=\"100%\" stop-color=\"#d99f7c\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2sqTail\" cx=\"60%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#f0d8b4\"/>\\n      <stop offset=\"100%\" stop-color=\"#c89a66\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2sqBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f0a888\" stop-opacity=\".5\"/>\\n      <stop offset=\"100%\" stop-color=\"#f0a888\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2sqWash\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f8ecd8\" stop-opacity=\".85\"/>\\n      <stop offset=\"100%\" stop-color=\"#f8ecd8\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2sqEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"27\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2sqFur\" x=\"-35%\" y=\"-35%\" width=\"170%\" height=\"170%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2.4\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.045\" numOctaves=\"2\" seed=\"30\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"13\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2sqHalo\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"232\" rx=\"54\" ry=\"6.5\" fill=\"#c8a074\" opacity=\".2\"/>\\n  <ellipse cx=\"120\" cy=\"151\" rx=\"87\" ry=\"81\" fill=\"#ecd4b4\" opacity=\".28\" filter=\"url(#p2sqHalo)\"/>\\n  <g filter=\"url(#p2sqEdge)\">\\n  <g filter=\"url(#p2sqEdge)\">\\n    <path d=\"M 150 208 C 206 206 232 158 216 110 C 206 82 184 68 168 76 C 192 90 200 122 190 150 C 180 180 162 194 138 196 Z\" fill=\"url(#p2sqTail)\"/>\\n    <path d=\"M 156 198 C 194 190 208 158 200 126 C 194 146 182 168 150 182 Z\" fill=\"#fbf2e0\" opacity=\".5\"/>\\n  </g>\\n    <g transform=\"rotate(-6 94 86)\"><g class=\"pt2-ear-l\"><path d=\"M 80 84 L 89 36 L 112 66 Z\" fill=\"url(#p2sqBody)\"/><path d=\"M 85 73 L 90 46 L 104 65 Z\" fill=\"url(#p2sqEarIn)\" opacity=\".85\"/></g></g>\\n    <g transform=\"rotate(6 146 86)\"><g class=\"pt2-ear-r\"><path d=\"M 160 84 L 151 36 L 128 66 Z\" fill=\"url(#p2sqBody)\"/><path d=\"M 155 73 L 150 46 L 136 65 Z\" fill=\"url(#p2sqEarIn)\" opacity=\".85\"/></g></g>\\n    <path d=\"M 120 64 C 88 64 66 88 66 118 C 66 136 74 148 84 156 C 70 168 66 186 72 204 C 78 224 92 234 108 234 C 114 234 118 231 120 227 C 122 231 126 234 132 234 C 148 234 162 224 168 204 C 174 186 170 168 156 156 C 166 148 174 136 174 118 C 174 88 152 64 120 64 Z\" fill=\"url(#p2sqBody)\"/>\\n  </g>\\n  <g filter=\"url(#p2sqFur)\">\\n    <ellipse cx=\"120\" cy=\"192\" rx=\"40\" ry=\"30\" fill=\"url(#p2sqWash)\" opacity=\".8\"/>\\n    <ellipse cx=\"90\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#e2c49c\" opacity=\".22\"/>\\n    <ellipse cx=\"150\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#e2c49c\" opacity=\".22\"/>\\n    <ellipse cx=\"98\" cy=\"82\" rx=\"18\" ry=\"14\" fill=\"#fbf2e0\" opacity=\".5\"/>\\n    <ellipse cx=\"104\" cy=\"220\" rx=\"14\" ry=\"8\" fill=\"#f8ecd4\" opacity=\".9\"/>\\n    <ellipse cx=\"140\" cy=\"220\" rx=\"14\" ry=\"8\" fill=\"#f8ecd4\" opacity=\".9\"/>\\n  </g>\\n  <g filter=\"url(#p2sqEdge)\">\\n    <ellipse cx=\"74\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2sqBody)\" transform=\"rotate(6 74 177)\"/>\\n    <ellipse cx=\"166\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2sqBody)\" transform=\"rotate(-6 166 177)\"/>\\n  </g>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"116\" r=\"8.5\" fill=\"#4a3c30\"/>\\n    <circle cx=\"101\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\\n    <circle cx=\"142\" cy=\"116\" r=\"8.5\" fill=\"#4a3c30\"/>\\n    <circle cx=\"145\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\\n  </g>\\n  <ellipse cx=\"80\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2sqBlush)\"/>\\n  <ellipse cx=\"160\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2sqBlush)\"/>\\n  <path d=\"M 116 128 Q 120 124.5 124 128 Q 120 133.5 116 128 Z\" fill=\"#c87858\"/>\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 114.5 136.5 Q 118 140.5 120 137.5 Q 122 140.5 125.5 136.5\" fill=\"none\" stroke=\"#8a6848\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>\\n    <rect x=\"117.4\" y=\"137.5\" width=\"2.6\" height=\"4.4\" rx=\"1.2\" fill=\"#fff\" stroke=\"#dcc09c\" stroke-width=\".5\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"143\" rx=\"6.6\" ry=\"8\" fill=\"#8a6048\"/>\\n    <ellipse cx=\"120\" cy=\"147.6\" rx=\"3.8\" ry=\"2.8\" fill=\"#f0b0a0\" opacity=\".85\"/>\\n  </g>\\n  <g transform=\"translate(50 62) scale(.8)\"><path class=\"pt2-spark\" style=\"animation-delay:.5s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(192 68) scale(.7)\"><path class=\"pt2-spark\" style=\"animation-delay:1.4s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#e8c9b0\" opacity=\".85\"/></g>\\n  <g transform=\"translate(40 150) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:2.2s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#c9e4f0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.8s\" cx=\"176\" cy=\"166\" r=\"2.4\" fill=\"#fff\"/>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1s\" cx=\"44\" cy=\"110\" r=\"2\" fill=\"#fff\"/>\\n</svg>",
  cat: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"小猫\">\\n  <defs>\\n    <radialGradient id=\"p2ctBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#fbfaff\"/>\\n      <stop offset=\"42%\" stop-color=\"#f2f0f8\"/>\\n      <stop offset=\"74%\" stop-color=\"#e4e0ee\"/>\\n      <stop offset=\"100%\" stop-color=\"#cfc8e0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2ctEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#f8d0e0\"/>\\n      <stop offset=\"100%\" stop-color=\"#eeaac8\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2ctBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f0a8c0\" stop-opacity=\".5\"/>\\n      <stop offset=\"100%\" stop-color=\"#f0a8c0\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2ctWash\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f6f4fa\" stop-opacity=\".85\"/>\\n      <stop offset=\"100%\" stop-color=\"#f6f4fa\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2ctEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"33\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2ctFur\" x=\"-35%\" y=\"-35%\" width=\"170%\" height=\"170%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2.4\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.045\" numOctaves=\"2\" seed=\"36\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"13\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2ctSoft\" x=\"-40%\" y=\"-40%\" width=\"180%\" height=\"180%\">\\n      <feGaussianBlur stdDeviation=\"2.2\"/>\\n    </filter>\\n    <filter id=\"p2ctHalo\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"232\" rx=\"54\" ry=\"6.5\" fill=\"#b0a4cc\" opacity=\".2\"/>\\n  <ellipse cx=\"120\" cy=\"151\" rx=\"87\" ry=\"81\" fill=\"#e6def4\" opacity=\".28\" filter=\"url(#p2ctHalo)\"/>\\n  <g filter=\"url(#p2ctEdge)\">\\n    <g class=\"pt2-ear-l\"><path d=\"M 70 86 L 76 36 L 106 64 Z\" fill=\"url(#p2ctBody)\"/><path d=\"M 77 76 L 80 48 L 98 63 Z\" fill=\"url(#p2ctEarIn)\" opacity=\".9\"/></g>\\n    <g class=\"pt2-ear-r\"><path d=\"M 170 86 L 164 36 L 134 64 Z\" fill=\"url(#p2ctBody)\"/><path d=\"M 163 76 L 160 48 L 142 63 Z\" fill=\"url(#p2ctEarIn)\" opacity=\".9\"/></g>\\n    <path d=\"M 120 64 C 88 64 66 88 66 118 C 66 136 74 148 84 156 C 70 168 66 186 72 204 C 78 224 92 234 108 234 C 114 234 118 231 120 227 C 122 231 126 234 132 234 C 148 234 162 224 168 204 C 174 186 170 168 156 156 C 166 148 174 136 174 118 C 174 88 152 64 120 64 Z\" fill=\"url(#p2ctBody)\"/>\\n  </g>\\n  <g filter=\"url(#p2ctFur)\">\\n    <ellipse cx=\"120\" cy=\"192\" rx=\"40\" ry=\"30\" fill=\"url(#p2ctWash)\" opacity=\".8\"/>\\n    <ellipse cx=\"90\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#ddd6ea\" opacity=\".22\"/>\\n    <ellipse cx=\"150\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#ddd6ea\" opacity=\".22\"/>\\n    <ellipse cx=\"98\" cy=\"82\" rx=\"18\" ry=\"14\" fill=\"#fcfbfe\" opacity=\".5\"/>\\n    <ellipse cx=\"104\" cy=\"220\" rx=\"14\" ry=\"8\" fill=\"#f4f2fa\" opacity=\".9\"/>\\n    <ellipse cx=\"140\" cy=\"220\" rx=\"14\" ry=\"8\" fill=\"#f4f2fa\" opacity=\".9\"/>\\n  </g>\\n  <g filter=\"url(#p2ctEdge)\">\\n    <ellipse cx=\"74\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2ctBody)\" transform=\"rotate(6 74 177)\"/>\\n    <ellipse cx=\"166\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2ctBody)\" transform=\"rotate(-6 166 177)\"/>\\n  </g>\\n  <path d=\"M 104 76 Q 108 84 104 90 M 120 72 Q 124 80 120 88 M 136 76 Q 132 84 136 90\" stroke=\"#d4cee0\" stroke-width=\"3.4\" fill=\"none\" stroke-linecap=\"round\" opacity=\".65\" filter=\"url(#p2ctSoft)\"/>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"116\" r=\"8.5\" fill=\"#4a4458\"/>\\n    <circle cx=\"101\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\\n    <circle cx=\"142\" cy=\"116\" r=\"8.5\" fill=\"#4a4458\"/>\\n    <circle cx=\"145\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\\n  </g>\\n  <ellipse cx=\"80\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2ctBlush)\"/>\\n  <ellipse cx=\"160\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2ctBlush)\"/>\\n  <path d=\"M 66 122 L 44 116 M 66 130 L 42 130 M 66 138 L 45 146\" stroke=\"#b8b0c8\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" opacity=\".85\"/>\\n  <path d=\"M 174 122 L 196 116 M 174 130 L 198 130 M 174 138 L 195 146\" stroke=\"#b8b0c8\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" opacity=\".85\"/>\\n  <path d=\"M 116 131 Q 120 128 124 131 Q 120 135.5 116 131 Z\" fill=\"#e898b4\"/>\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 111.5 138.5 Q 115.8 143 120 139 Q 124.2 143 128.5 138.5\" fill=\"none\" stroke=\"#8a80a0\" stroke-width=\"2.4\" stroke-linecap=\"round\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"144\" rx=\"7.5\" ry=\"9\" fill=\"#7a6a92\"/>\\n    <ellipse cx=\"120\" cy=\"149.6\" rx=\"4.4\" ry=\"3.2\" fill=\"#f0a8c0\" opacity=\".85\"/>\\n  </g>\\n  <g transform=\"translate(50 62) scale(.8)\"><path class=\"pt2-spark\" style=\"animation-delay:.5s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#e8d0f0\" opacity=\".85\"/></g>\\n  <g transform=\"translate(192 68) scale(.7)\"><path class=\"pt2-spark\" style=\"animation-delay:1.4s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9d8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(40 150) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:2.2s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#c9e4f0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.8s\" cx=\"176\" cy=\"166\" r=\"2.4\" fill=\"#fff\"/>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1s\" cx=\"44\" cy=\"110\" r=\"2\" fill=\"#fff\"/>\\n</svg>",
  dog: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"小狗\">\\n  <defs>\\n    <radialGradient id=\"p2dgBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#f9e9d4\"/>\\n      <stop offset=\"42%\" stop-color=\"#f2d8b8\"/>\\n      <stop offset=\"74%\" stop-color=\"#e8c49c\"/>\\n      <stop offset=\"100%\" stop-color=\"#d6a878\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2dgEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#e0b888\"/>\\n      <stop offset=\"100%\" stop-color=\"#c89868\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2dgEar\" cx=\"50%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#d8ac7c\"/>\\n      <stop offset=\"100%\" stop-color=\"#b08050\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2dgBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f0a898\" stop-opacity=\".5\"/>\\n      <stop offset=\"100%\" stop-color=\"#f0a898\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2dgWash\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f6e8d2\" stop-opacity=\".85\"/>\\n      <stop offset=\"100%\" stop-color=\"#f6e8d2\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2dgEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"39\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2dgFur\" x=\"-35%\" y=\"-35%\" width=\"170%\" height=\"170%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2.4\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.045\" numOctaves=\"2\" seed=\"42\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"13\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2dgHalo\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"232\" rx=\"54\" ry=\"6.5\" fill=\"#c09868\" opacity=\".2\"/>\\n  <ellipse cx=\"120\" cy=\"151\" rx=\"87\" ry=\"81\" fill=\"#eed6b6\" opacity=\".28\" filter=\"url(#p2dgHalo)\"/>\\n  <g filter=\"url(#p2dgEdge)\">\\n    <g class=\"pt2-bear-ear-l\"><path d=\"M 82 72 C 68 70 57 78 54 96 C 51 114 56 136 65 149 C 70 156 78 156 80 148 C 83 133 85 108 86 80 C 86 75 84 72 82 72 Z\" fill=\"url(#p2dgEar)\"/><path d=\"M 73 78 C 66 80 60 88 58 100 C 56 114 59 129 65 139 C 68 145 74 145 76 138 C 78 126 79 106 79 86 C 79 81 76 78 73 78 Z\" fill=\"url(#p2dgEarIn)\" opacity=\".9\"/></g>\\n    <g class=\"pt2-bear-ear-r\"><path d=\"M 158 72 C 172 70 183 78 186 96 C 189 114 184 136 175 149 C 170 156 162 156 160 148 C 157 133 155 108 154 80 C 154 75 156 72 158 72 Z\" fill=\"url(#p2dgEar)\"/><path d=\"M 167 78 C 174 80 180 88 182 100 C 184 114 181 129 175 139 C 172 145 166 145 164 138 C 162 126 161 106 161 86 C 161 81 164 78 167 78 Z\" fill=\"url(#p2dgEarIn)\" opacity=\".9\"/></g>\\n    <path d=\"M 120 64 C 88 64 66 88 66 118 C 66 136 74 148 84 156 C 70 168 66 186 72 204 C 78 224 92 234 108 234 C 114 234 118 231 120 227 C 122 231 126 234 132 234 C 148 234 162 224 168 204 C 174 186 170 168 156 156 C 166 148 174 136 174 118 C 174 88 152 64 120 64 Z\" fill=\"url(#p2dgBody)\"/>\\n  </g>\\n  <g filter=\"url(#p2dgFur)\">\\n    <ellipse cx=\"120\" cy=\"192\" rx=\"40\" ry=\"30\" fill=\"url(#p2dgWash)\" opacity=\".8\"/>\\n    <ellipse cx=\"90\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#e0c098\" opacity=\".22\"/>\\n    <ellipse cx=\"150\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#e0c098\" opacity=\".22\"/>\\n    <ellipse cx=\"98\" cy=\"82\" rx=\"18\" ry=\"14\" fill=\"#faf0dc\" opacity=\".5\"/>\\n    <ellipse cx=\"104\" cy=\"220\" rx=\"14\" ry=\"8\" fill=\"#f4e4c8\" opacity=\".9\"/>\\n    <ellipse cx=\"140\" cy=\"220\" rx=\"14\" ry=\"8\" fill=\"#f4e4c8\" opacity=\".9\"/>\\n  </g>\\n  <g filter=\"url(#p2dgEdge)\">\\n    <ellipse cx=\"74\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2dgBody)\" transform=\"rotate(6 74 177)\"/>\\n    <ellipse cx=\"166\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2dgBody)\" transform=\"rotate(-6 166 177)\"/>\\n  </g>\\n  <path d=\"M 88 166 Q 120 181 152 166\" stroke=\"#e06858\" stroke-width=\"8\" fill=\"none\" stroke-linecap=\"round\"/>\\n  <circle cx=\"120\" cy=\"180\" r=\"5.2\" fill=\"#f8d048\" stroke=\"#d8a830\" stroke-width=\"1.4\"/>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"116\" r=\"8.5\" fill=\"#4a3c30\"/>\\n    <circle cx=\"101\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\\n    <circle cx=\"142\" cy=\"116\" r=\"8.5\" fill=\"#4a3c30\"/>\\n    <circle cx=\"145\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\\n  </g>\\n  <ellipse cx=\"80\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2dgBlush)\"/>\\n  <ellipse cx=\"160\" cy=\"138\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2dgBlush)\"/>\\n  <ellipse cx=\"120\" cy=\"131\" rx=\"7.4\" ry=\"5.6\" fill=\"#4a3c30\"/>\\n  <ellipse cx=\"117.6\" cy=\"129.2\" rx=\"2.2\" ry=\"1.5\" fill=\"#fff\" opacity=\".7\"/>\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 120 137 Q 120 142 115 143.5 M 120 137 Q 120 142 125 143.5\" fill=\"none\" stroke=\"#6a5038\" stroke-width=\"2.4\" stroke-linecap=\"round\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"146\" rx=\"7\" ry=\"8.5\" fill=\"#6a5038\"/>\\n    <ellipse cx=\"120\" cy=\"151\" rx=\"4.4\" ry=\"3.4\" fill=\"#f0a0a8\" opacity=\".9\"/>\\n  </g>\\n  <g transform=\"translate(50 62) scale(.8)\"><path class=\"pt2-spark\" style=\"animation-delay:.5s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(192 68) scale(.7)\"><path class=\"pt2-spark\" style=\"animation-delay:1.4s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#e8c9b0\" opacity=\".85\"/></g>\\n  <g transform=\"translate(40 150) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:2.2s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9d8\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.8s\" cx=\"176\" cy=\"166\" r=\"2.4\" fill=\"#fff\"/>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1s\" cx=\"44\" cy=\"110\" r=\"2\" fill=\"#fff\"/>\\n</svg>",
  pig: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"小猪\">\\n  <defs>\\n    <radialGradient id=\"p2pgBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#fdeef2\"/>\\n      <stop offset=\"42%\" stop-color=\"#fbdce6\"/>\\n      <stop offset=\"74%\" stop-color=\"#f4c2d4\"/>\\n      <stop offset=\"100%\" stop-color=\"#e8a2c0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2pgEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#f4c0d2\"/>\\n      <stop offset=\"100%\" stop-color=\"#e89cb8\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2pgSnout\" cx=\"50%\" cy=\"40%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#f8c8d8\"/>\\n      <stop offset=\"100%\" stop-color=\"#e898b8\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2pgBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f098b4\" stop-opacity=\".5\"/>\\n      <stop offset=\"100%\" stop-color=\"#f098b4\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2pgWash\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#fce8f0\" stop-opacity=\".85\"/>\\n      <stop offset=\"100%\" stop-color=\"#fce8f0\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2pgEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"45\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2pgFur\" x=\"-35%\" y=\"-35%\" width=\"170%\" height=\"170%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2.4\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.045\" numOctaves=\"2\" seed=\"48\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"13\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2pgHalo\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"232\" rx=\"54\" ry=\"6.5\" fill=\"#d898b4\" opacity=\".2\"/>\\n  <ellipse cx=\"120\" cy=\"151\" rx=\"87\" ry=\"81\" fill=\"#f8d4e4\" opacity=\".28\" filter=\"url(#p2pgHalo)\"/>\\n  <g filter=\"url(#p2pgEdge)\">\\n    <g class=\"pt2-ear-l\"><path d=\"M 72 76 L 80 44 L 102 66 Z\" fill=\"url(#p2pgBody)\"/><path d=\"M 77 69 L 81 51 L 94 63 Z\" fill=\"url(#p2pgEarIn)\" opacity=\".85\"/></g>\\n    <g class=\"pt2-ear-r\"><path d=\"M 168 76 L 160 44 L 138 66 Z\" fill=\"url(#p2pgBody)\"/><path d=\"M 163 69 L 159 51 L 146 63 Z\" fill=\"url(#p2pgEarIn)\" opacity=\".85\"/></g>\\n    <path d=\"M 120 64 C 88 64 66 88 66 118 C 66 136 74 148 84 156 C 70 168 66 186 72 204 C 78 224 92 234 108 234 C 114 234 118 231 120 227 C 122 231 126 234 132 234 C 148 234 162 224 168 204 C 174 186 170 168 156 156 C 166 148 174 136 174 118 C 174 88 152 64 120 64 Z\" fill=\"url(#p2pgBody)\"/>\\n  </g>\\n  <g filter=\"url(#p2pgFur)\">\\n    <ellipse cx=\"120\" cy=\"192\" rx=\"40\" ry=\"30\" fill=\"url(#p2pgWash)\" opacity=\".8\"/>\\n    <ellipse cx=\"90\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#f0bcd0\" opacity=\".22\"/>\\n    <ellipse cx=\"150\" cy=\"176\" rx=\"20\" ry=\"26\" fill=\"#f0bcd0\" opacity=\".22\"/>\\n    <ellipse cx=\"98\" cy=\"82\" rx=\"18\" ry=\"14\" fill=\"#fef4f8\" opacity=\".5\"/>\\n    <ellipse cx=\"104\" cy=\"220\" rx=\"14\" ry=\"8\" fill=\"#fbe4ee\" opacity=\".9\"/>\\n    <ellipse cx=\"140\" cy=\"220\" rx=\"14\" ry=\"8\" fill=\"#fbe4ee\" opacity=\".9\"/>\\n  </g>\\n  <g filter=\"url(#p2pgEdge)\">\\n    <ellipse cx=\"74\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2pgBody)\" transform=\"rotate(6 74 177)\"/>\\n    <ellipse cx=\"166\" cy=\"177\" rx=\"11\" ry=\"19\" fill=\"url(#p2pgBody)\" transform=\"rotate(-6 166 177)\"/>\\n  </g>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"116\" r=\"8.5\" fill=\"#4a4058\"/>\\n    <circle cx=\"101\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\\n    <circle cx=\"142\" cy=\"116\" r=\"8.5\" fill=\"#4a4058\"/>\\n    <circle cx=\"145\" cy=\"113\" r=\"3\" fill=\"#fff\"/>\\n  </g>\\n  <ellipse cx=\"80\" cy=\"144\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2pgBlush)\"/>\\n  <ellipse cx=\"160\" cy=\"144\" rx=\"15\" ry=\"9.5\" fill=\"url(#p2pgBlush)\"/>\\n  <ellipse cx=\"120\" cy=\"135\" rx=\"14\" ry=\"10\" fill=\"url(#p2pgSnout)\"/>\\n  <ellipse cx=\"120\" cy=\"135\" rx=\"14\" ry=\"10\" fill=\"none\" stroke=\"rgba(200,110,150,.45)\" stroke-width=\"1.6\"/>\\n  <ellipse cx=\"114.5\" cy=\"135\" rx=\"2.2\" ry=\"3.4\" fill=\"#c8688e\"/>\\n  <ellipse cx=\"125.5\" cy=\"135\" rx=\"2.2\" ry=\"3.4\" fill=\"#c8688e\"/>\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 114 152 Q 117 155.5 120 152.5 Q 123 155.5 126 152\" fill=\"none\" stroke=\"#c87898\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"155\" rx=\"6.5\" ry=\"8\" fill=\"#c86a92\"/>\\n    <ellipse cx=\"120\" cy=\"160\" rx=\"3.8\" ry=\"3\" fill=\"#f4bcd0\" opacity=\".9\"/>\\n  </g>\\n  <g transform=\"translate(50 62) scale(.8)\"><path class=\"pt2-spark\" style=\"animation-delay:.5s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c0d8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(192 68) scale(.7)\"><path class=\"pt2-spark\" style=\"animation-delay:1.4s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#e8c0f0\" opacity=\".85\"/></g>\\n  <g transform=\"translate(40 150) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:2.2s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#c9e4f0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.8s\" cx=\"176\" cy=\"166\" r=\"2.4\" fill=\"#fff\"/>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1s\" cx=\"44\" cy=\"110\" r=\"2\" fill=\"#fff\"/>\\n</svg>",
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
  hamster: [
    '腮帮子里还藏着瓜子要不要呀？',
    '跑轮今晚就开动啦，为我加油！',
    '塞进脸颊的零食，都是爱心的形状～',
  ],
  squirrel: [
    '今天的松果特别甜，分你一颗！',
    '我的尾巴蓬蓬的，冬天抱着正好～',
    '蹦上树梢啦，记得抬头看我呀！',
  ],
  cat: [
    '呼噜呼噜……这是开心震动的声音。',
    '晒太阳的角落，留了一半给你。',
    '今天心情好，允许你多摸两下～',
  ],
  dog: [
    '汪！我一整天都在等你回来！',
    '摇尾巴是我最开心的语言～',
    '接飞盘吗？我可是很厉害的！',
  ],
  pig: [
    '哼哼～吃饱了晒太阳，幸福呀。',
    '我的小鼻子可以找藏起来的宝贝哦！',
    '圆滚滚的身体里，装满了喜欢你～',
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

/* v752: 宝宝版七只 —— chibi 小小一只(大头圆身/小短耳/大眼睛), 与成体形态明显不同;
   领养即宝宝, 浇水或成功喂饭每天记 1 天喂养, 攒满 10 天长成成体; 老档宠物直接视为已成年 */
const PET_SVG_BABY = {
  rabbit: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"宝宝\">\\n  <defs>\\n    <radialGradient id=\"p2rbBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#ffffff\"/>\\n      <stop offset=\"42%\" stop-color=\"#faf6fe\"/>\\n      <stop offset=\"74%\" stop-color=\"#f0e6f9\"/>\\n      <stop offset=\"100%\" stop-color=\"#e3d3f3\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2rbEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#f8d0e4\"/>\\n      <stop offset=\"100%\" stop-color=\"#eeb0cc\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2rbBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f0a0c0\" stop-opacity=\".55\"/>\\n      <stop offset=\"100%\" stop-color=\"#f0a0c0\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2rbHalo\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#faf6fe\" stop-opacity=\".6\"/>\\n      <stop offset=\"100%\" stop-color=\"#faf6fe\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2rbEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"21\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2rbSoft\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"212\" rx=\"34\" ry=\"6\" fill=\"#d8c8e8\" opacity=\".22\"/>\\n  <circle cx=\"120\" cy=\"148\" r=\"76\" fill=\"url(#p2rbHalo)\" opacity=\".55\" filter=\"url(#p2rbSoft)\"/>\\n  <g filter=\"url(#p2rbEdge)\">\\n    <g class=\"pt2-ear-l\"><ellipse cx=\"94\" cy=\"80\" rx=\"11\" ry=\"24\" fill=\"url(#p2rbBody)\" transform=\"rotate(-8 94 80)\"/><ellipse cx=\"94\" cy=\"84\" rx=\"5\" ry=\"14\" fill=\"url(#p2rbEarIn)\" opacity=\".9\" transform=\"rotate(-8 94 84)\"/></g>\\n  <g class=\"pt2-ear-r\"><ellipse cx=\"146\" cy=\"80\" rx=\"11\" ry=\"24\" fill=\"url(#p2rbBody)\" transform=\"rotate(8 146 80)\"/><ellipse cx=\"146\" cy=\"84\" rx=\"5\" ry=\"14\" fill=\"url(#p2rbEarIn)\" opacity=\".9\" transform=\"rotate(8 146 84)\"/></g>\\n    <circle cx=\"120\" cy=\"150\" r=\"56\" fill=\"url(#p2rbBody)\"/>\\n    <ellipse cx=\"120\" cy=\"180\" rx=\"27\" ry=\"19\" fill=\"#ffffff\" opacity=\".38\"/>\\n    <ellipse cx=\"72\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2rbBody)\" transform=\"rotate(12 72 168)\"/>\\n    <ellipse cx=\"168\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2rbBody)\" transform=\"rotate(-12 168 168)\"/>\\n  </g>\\n  <g filter=\"url(#p2rbEdge)\">\\n    <ellipse cx=\"100\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#faf6fe\"/>\\n    <ellipse cx=\"140\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#faf6fe\"/>\\n  </g>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"140\" r=\"10\" fill=\"#5a4a66\"/>\\n    <circle cx=\"101.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"95\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n    <circle cx=\"142\" cy=\"140\" r=\"10\" fill=\"#5a4a66\"/>\\n    <circle cx=\"145.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"139\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n  </g>\\n  <ellipse cx=\"76\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2rbBlush)\"/>\\n  <ellipse cx=\"164\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2rbBlush)\"/>\\n  <path d=\"M 116 96 Q 113 86 121 85 Q 128 85 126 92\" fill=\"none\" stroke=\"#8a7498\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\".7\"/>\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 115 156 Q 117.5 159.5 120 156 Q 122.5 159.5 125 156\" fill=\"none\" stroke=\"#8a7498\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\".8\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"163\" rx=\"5.5\" ry=\"7\" fill=\"#8a7498\" opacity=\".85\"/>\\n  </g>\\n  <g transform=\"translate(178 104) scale(.75)\"><path class=\"pt2-spark\" style=\"animation-delay:.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(56 112) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:1.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9b0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.1s\" cx=\"170\" cy=\"196\" r=\"2.2\" fill=\"#fff\"/>\\n</svg>",
  bear: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"宝宝\">\\n  <defs>\\n    <radialGradient id=\"p2brBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#f8efe4\"/>\\n      <stop offset=\"42%\" stop-color=\"#f0dcc4\"/>\\n      <stop offset=\"74%\" stop-color=\"#e8d2b4\"/>\\n      <stop offset=\"100%\" stop-color=\"#d9bd97\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2brEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#e8c8a8\"/>\\n      <stop offset=\"100%\" stop-color=\"#d8b088\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2brBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#e8a888\" stop-opacity=\".55\"/>\\n      <stop offset=\"100%\" stop-color=\"#e8a888\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2brHalo\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f0dcc4\" stop-opacity=\".6\"/>\\n      <stop offset=\"100%\" stop-color=\"#f0dcc4\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2brEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"21\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2brSoft\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"212\" rx=\"34\" ry=\"6\" fill=\"#c8a888\" opacity=\".22\"/>\\n  <circle cx=\"120\" cy=\"148\" r=\"76\" fill=\"url(#p2brHalo)\" opacity=\".55\" filter=\"url(#p2brSoft)\"/>\\n  <g filter=\"url(#p2brEdge)\">\\n    <g class=\"pt2-bear-ear-l\"><circle cx=\"88\" cy=\"104\" r=\"15\" fill=\"url(#p2brBody)\"/><circle cx=\"88\" cy=\"104\" r=\"7.5\" fill=\"url(#p2brEarIn)\"/></g>\\n  <g class=\"pt2-bear-ear-r\"><circle cx=\"152\" cy=\"104\" r=\"15\" fill=\"url(#p2brBody)\"/><circle cx=\"152\" cy=\"104\" r=\"7.5\" fill=\"url(#p2brEarIn)\"/></g>\\n    <circle cx=\"120\" cy=\"150\" r=\"56\" fill=\"url(#p2brBody)\"/>\\n    <ellipse cx=\"120\" cy=\"180\" rx=\"27\" ry=\"19\" fill=\"#f8efe4\" opacity=\".38\"/>\\n    <ellipse cx=\"72\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2brBody)\" transform=\"rotate(12 72 168)\"/>\\n    <ellipse cx=\"168\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2brBody)\" transform=\"rotate(-12 168 168)\"/>\\n  </g>\\n  <g filter=\"url(#p2brEdge)\">\\n    <ellipse cx=\"100\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#f0dcc4\"/>\\n    <ellipse cx=\"140\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#f0dcc4\"/>\\n  </g>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"140\" r=\"10\" fill=\"#4a3c30\"/>\\n    <circle cx=\"101.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"95\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n    <circle cx=\"142\" cy=\"140\" r=\"10\" fill=\"#4a3c30\"/>\\n    <circle cx=\"145.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"139\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n  </g>\\n  <ellipse cx=\"76\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2brBlush)\"/>\\n  <ellipse cx=\"164\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2brBlush)\"/>\\nundefined\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 115 156 Q 117.5 159.5 120 156 Q 122.5 159.5 125 156\" fill=\"none\" stroke=\"#9a7858\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\".8\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"163\" rx=\"5.5\" ry=\"7\" fill=\"#9a7858\" opacity=\".85\"/>\\n  </g>\\n  <g transform=\"translate(178 104) scale(.75)\"><path class=\"pt2-spark\" style=\"animation-delay:.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(56 112) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:1.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9b0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.1s\" cx=\"170\" cy=\"196\" r=\"2.2\" fill=\"#fff\"/>\\n</svg>",
  hamster: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"宝宝\">\\n  <defs>\\n    <radialGradient id=\"p2hmBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#fdf6e8\"/>\\n      <stop offset=\"42%\" stop-color=\"#f8ecca\"/>\\n      <stop offset=\"74%\" stop-color=\"#f0dcae\"/>\\n      <stop offset=\"100%\" stop-color=\"#e2c68e\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2hmEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#f8d8c8\"/>\\n      <stop offset=\"100%\" stop-color=\"#eeb8a4\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2hmBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f4a888\" stop-opacity=\".55\"/>\\n      <stop offset=\"100%\" stop-color=\"#f4a888\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2hmHalo\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f8ecca\" stop-opacity=\".6\"/>\\n      <stop offset=\"100%\" stop-color=\"#f8ecca\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2hmEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"21\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2hmSoft\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"212\" rx=\"34\" ry=\"6\" fill=\"#d8bc8a\" opacity=\".22\"/>\\n  <circle cx=\"120\" cy=\"148\" r=\"76\" fill=\"url(#p2hmHalo)\" opacity=\".55\" filter=\"url(#p2hmSoft)\"/>\\n  <g filter=\"url(#p2hmEdge)\">\\n    <g class=\"pt2-bear-ear-l\"><path d=\"M 88 86 Q 99 98 98 114 Q 88 120 78 114 Q 77 98 88 86 Z\" fill=\"url(#p2hmBody)\"/><path d=\"M 88 96 Q 93 103 93 111 Q 88 114 83 111 Q 83 103 88 96 Z\" fill=\"url(#p2hmEarIn)\" opacity=\".9\"/></g>\\n  <g class=\"pt2-bear-ear-r\"><path d=\"M 152 86 Q 141 98 142 114 Q 152 120 162 114 Q 163 98 152 86 Z\" fill=\"url(#p2hmBody)\"/><path d=\"M 152 96 Q 147 103 147 111 Q 152 114 157 111 Q 157 103 152 96 Z\" fill=\"url(#p2hmEarIn)\" opacity=\".9\"/></g>\\n    <circle cx=\"120\" cy=\"150\" r=\"56\" fill=\"url(#p2hmBody)\"/>\\n    <ellipse cx=\"120\" cy=\"180\" rx=\"27\" ry=\"19\" fill=\"#fdf6e8\" opacity=\".38\"/>\\n    <ellipse cx=\"72\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2hmBody)\" transform=\"rotate(12 72 168)\"/>\\n    <ellipse cx=\"168\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2hmBody)\" transform=\"rotate(-12 168 168)\"/>\\n  </g>\\n  <g filter=\"url(#p2hmEdge)\">\\n    <ellipse cx=\"100\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#f8ecca\"/>\\n    <ellipse cx=\"140\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#f8ecca\"/>\\n  </g>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"140\" r=\"10\" fill=\"#4a3c30\"/>\\n    <circle cx=\"101.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"95\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n    <circle cx=\"142\" cy=\"140\" r=\"10\" fill=\"#4a3c30\"/>\\n    <circle cx=\"145.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"139\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n  </g>\\n  <ellipse cx=\"76\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2hmBlush)\"/>\\n  <ellipse cx=\"164\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2hmBlush)\"/>\\n  <ellipse cx=\"80\" cy=\"160\" rx=\"16\" ry=\"11\" fill=\"url(#p2hmBlush)\"/>\\n  <ellipse cx=\"160\" cy=\"160\" rx=\"16\" ry=\"11\" fill=\"url(#p2hmBlush)\"/>\\n  <rect x=\"116.6\" y=\"159\" width=\"3\" height=\"4\" rx=\"1.3\" fill=\"#fff\" stroke=\"#e8c8a8\" stroke-width=\".5\"/>\\n  <rect x=\"120.4\" y=\"159\" width=\"3\" height=\"4\" rx=\"1.3\" fill=\"#fff\" stroke=\"#e8c8a8\" stroke-width=\".5\"/>\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 115 156 Q 117.5 159.5 120 156 Q 122.5 159.5 125 156\" fill=\"none\" stroke=\"#a87858\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\".8\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"163\" rx=\"5.5\" ry=\"7\" fill=\"#a87858\" opacity=\".85\"/>\\n  </g>\\n  <g transform=\"translate(178 104) scale(.75)\"><path class=\"pt2-spark\" style=\"animation-delay:.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(56 112) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:1.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9b0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.1s\" cx=\"170\" cy=\"196\" r=\"2.2\" fill=\"#fff\"/>\\n</svg>",
  squirrel: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"宝宝\">\\n  <defs>\\n    <radialGradient id=\"p2sqBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#f0e0c6\"/>\\n      <stop offset=\"42%\" stop-color=\"#e2c69e\"/>\\n      <stop offset=\"74%\" stop-color=\"#d2ae7e\"/>\\n      <stop offset=\"100%\" stop-color=\"#b88f5c\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2sqEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#ecc9ae\"/>\\n      <stop offset=\"100%\" stop-color=\"#dda888\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2sqBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f0a888\" stop-opacity=\".55\"/>\\n      <stop offset=\"100%\" stop-color=\"#f0a888\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2sqHalo\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#e2c69e\" stop-opacity=\".6\"/>\\n      <stop offset=\"100%\" stop-color=\"#e2c69e\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2sqEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"21\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2sqSoft\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"212\" rx=\"34\" ry=\"6\" fill=\"#b89868\" opacity=\".22\"/>\\n  <circle cx=\"120\" cy=\"148\" r=\"76\" fill=\"url(#p2sqHalo)\" opacity=\".55\" filter=\"url(#p2sqSoft)\"/>\\n  <g filter=\"url(#p2sqEdge)\">\\n    <path d=\"M 148 128 Q 184 110 195 140 Q 204 170 176 186 Q 156 192 149 172 Q 145 150 148 128 Z\" fill=\"#d2ae7e\" opacity=\".9\"/>\\n  <path d=\"M 158 136 Q 180 124 186 144 Q 189 164 170 174 Q 159 166 158 136 Z\" fill=\"#e2c69e\" opacity=\".85\"/>\\n  <g class=\"pt2-ear-l\"><path d=\"M 88 92 Q 91 74 100 71 Q 103 87 97 101 Q 89 103 88 92 Z\" fill=\"url(#p2sqBody)\"/><path d=\"M 91 90 Q 93 80 98 78 Q 99 88 95 96 Q 92 96 91 90 Z\" fill=\"url(#p2sqEarIn)\" opacity=\".9\"/></g>\\n  <g class=\"pt2-ear-r\"><path d=\"M 152 92 Q 149 74 140 71 Q 137 87 143 101 Q 151 103 152 92 Z\" fill=\"url(#p2sqBody)\"/><path d=\"M 149 90 Q 147 80 142 78 Q 141 88 145 96 Q 148 96 149 90 Z\" fill=\"url(#p2sqEarIn)\" opacity=\".9\"/></g>\\n    <circle cx=\"120\" cy=\"150\" r=\"56\" fill=\"url(#p2sqBody)\"/>\\n    <ellipse cx=\"120\" cy=\"180\" rx=\"27\" ry=\"19\" fill=\"#f0e0c6\" opacity=\".38\"/>\\n    <ellipse cx=\"72\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2sqBody)\" transform=\"rotate(12 72 168)\"/>\\n    <ellipse cx=\"168\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2sqBody)\" transform=\"rotate(-12 168 168)\"/>\\n  </g>\\n  <g filter=\"url(#p2sqEdge)\">\\n    <ellipse cx=\"100\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#e2c69e\"/>\\n    <ellipse cx=\"140\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#e2c69e\"/>\\n  </g>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"140\" r=\"10\" fill=\"#4a3828\"/>\\n    <circle cx=\"101.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"95\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n    <circle cx=\"142\" cy=\"140\" r=\"10\" fill=\"#4a3828\"/>\\n    <circle cx=\"145.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"139\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n  </g>\\n  <ellipse cx=\"76\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2sqBlush)\"/>\\n  <ellipse cx=\"164\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2sqBlush)\"/>\\n\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 115 156 Q 117.5 159.5 120 156 Q 122.5 159.5 125 156\" fill=\"none\" stroke=\"#8a6840\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\".8\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"163\" rx=\"5.5\" ry=\"7\" fill=\"#8a6840\" opacity=\".85\"/>\\n  </g>\\n  <g transform=\"translate(178 104) scale(.75)\"><path class=\"pt2-spark\" style=\"animation-delay:.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(56 112) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:1.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9b0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.1s\" cx=\"170\" cy=\"196\" r=\"2.2\" fill=\"#fff\"/>\\n</svg>",
  cat: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"宝宝\">\\n  <defs>\\n    <radialGradient id=\"p2ctBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#fbfaff\"/>\\n      <stop offset=\"42%\" stop-color=\"#f2f0f8\"/>\\n      <stop offset=\"74%\" stop-color=\"#e4e0ee\"/>\\n      <stop offset=\"100%\" stop-color=\"#cfc8e0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2ctEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#f8d0e0\"/>\\n      <stop offset=\"100%\" stop-color=\"#f0a8c0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2ctBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f0a8c0\" stop-opacity=\".55\"/>\\n      <stop offset=\"100%\" stop-color=\"#f0a8c0\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2ctHalo\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f2f0f8\" stop-opacity=\".6\"/>\\n      <stop offset=\"100%\" stop-color=\"#f2f0f8\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2ctEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"21\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2ctSoft\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"212\" rx=\"34\" ry=\"6\" fill=\"#c0b8d4\" opacity=\".22\"/>\\n  <circle cx=\"120\" cy=\"148\" r=\"76\" fill=\"url(#p2ctHalo)\" opacity=\".55\" filter=\"url(#p2ctSoft)\"/>\\n  <g filter=\"url(#p2ctEdge)\">\\n    <g class=\"pt2-ear-l\"><path d=\"M 90 98 Q 91 76 102 70 Q 111 82 110 100 Q 100 106 90 98 Z\" fill=\"url(#p2ctBody)\"/><path d=\"M 94 94 Q 95 81 101 77 Q 106 85 105 96 Q 100 99 94 94 Z\" fill=\"url(#p2ctEarIn)\" opacity=\".9\"/></g>\\n  <g class=\"pt2-ear-r\"><path d=\"M 150 98 Q 149 76 138 70 Q 129 82 130 100 Q 140 106 150 98 Z\" fill=\"url(#p2ctBody)\"/><path d=\"M 146 94 Q 145 81 139 77 Q 134 85 135 96 Q 140 99 146 94 Z\" fill=\"url(#p2ctEarIn)\" opacity=\".9\"/></g>\\n    <circle cx=\"120\" cy=\"150\" r=\"56\" fill=\"url(#p2ctBody)\"/>\\n    <ellipse cx=\"120\" cy=\"180\" rx=\"27\" ry=\"19\" fill=\"#fbfaff\" opacity=\".38\"/>\\n    <ellipse cx=\"72\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2ctBody)\" transform=\"rotate(12 72 168)\"/>\\n    <ellipse cx=\"168\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2ctBody)\" transform=\"rotate(-12 168 168)\"/>\\n  </g>\\n  <g filter=\"url(#p2ctEdge)\">\\n    <ellipse cx=\"100\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#f2f0f8\"/>\\n    <ellipse cx=\"140\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#f2f0f8\"/>\\n  </g>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"140\" r=\"10\" fill=\"#5a5470\"/>\\n    <circle cx=\"101.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"95\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n    <circle cx=\"142\" cy=\"140\" r=\"10\" fill=\"#5a5470\"/>\\n    <circle cx=\"145.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"139\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n  </g>\\n  <ellipse cx=\"76\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2ctBlush)\"/>\\n  <ellipse cx=\"164\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2ctBlush)\"/>\\n  <g stroke=\"#cfc8e0\" stroke-width=\"1.6\" stroke-linecap=\"round\" opacity=\".8\">\\n    <path d=\"M 66 144 L 48 140\"/><path d=\"M 67 152 L 49 154\"/><path d=\"M 70 159 L 54 166\"/>\\n    <path d=\"M 174 144 L 192 140\"/><path d=\"M 173 152 L 191 154\"/><path d=\"M 170 159 L 186 166\"/>\\n  </g>\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 115 156 Q 117.5 159.5 120 156 Q 122.5 159.5 125 156\" fill=\"none\" stroke=\"#8a84a0\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\".8\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"163\" rx=\"5.5\" ry=\"7\" fill=\"#8a84a0\" opacity=\".85\"/>\\n  </g>\\n  <g transform=\"translate(178 104) scale(.75)\"><path class=\"pt2-spark\" style=\"animation-delay:.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(56 112) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:1.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9b0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.1s\" cx=\"170\" cy=\"196\" r=\"2.2\" fill=\"#fff\"/>\\n</svg>",
  dog: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"宝宝\">\\n  <defs>\\n    <radialGradient id=\"p2dgBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#f9e9d4\"/>\\n      <stop offset=\"42%\" stop-color=\"#f2d8b8\"/>\\n      <stop offset=\"74%\" stop-color=\"#e8c49c\"/>\\n      <stop offset=\"100%\" stop-color=\"#d6a878\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2dgEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#e0b888\"/>\\n      <stop offset=\"100%\" stop-color=\"#c89868\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2dgBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f0a898\" stop-opacity=\".55\"/>\\n      <stop offset=\"100%\" stop-color=\"#f0a898\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2dgHalo\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f2d8b8\" stop-opacity=\".6\"/>\\n      <stop offset=\"100%\" stop-color=\"#f2d8b8\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2dgEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"21\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2dgSoft\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"212\" rx=\"34\" ry=\"6\" fill=\"#c8a078\" opacity=\".22\"/>\\n  <circle cx=\"120\" cy=\"148\" r=\"76\" fill=\"url(#p2dgHalo)\" opacity=\".55\" filter=\"url(#p2dgSoft)\"/>\\n  <g filter=\"url(#p2dgEdge)\">\\n    <g class=\"pt2-ear-l\"><path d=\"M 86 96 C 76 96 71 108 72 128 C 73 146 79 156 86 152 C 91 148 92 120 91 102 C 90.5 98 89 96 86 96 Z\" fill=\"url(#p2dgEarIn)\"/></g>\\n  <g class=\"pt2-ear-r\"><path d=\"M 154 96 C 164 96 169 108 168 128 C 167 146 161 156 154 152 C 149 148 148 120 149 102 C 149.5 98 151 96 154 96 Z\" fill=\"url(#p2dgEarIn)\"/></g>\\n    <circle cx=\"120\" cy=\"150\" r=\"56\" fill=\"url(#p2dgBody)\"/>\\n    <ellipse cx=\"120\" cy=\"180\" rx=\"27\" ry=\"19\" fill=\"#f9e9d4\" opacity=\".38\"/>\\n    <ellipse cx=\"72\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2dgBody)\" transform=\"rotate(12 72 168)\"/>\\n    <ellipse cx=\"168\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2dgBody)\" transform=\"rotate(-12 168 168)\"/>\\n  </g>\\n  <g filter=\"url(#p2dgEdge)\">\\n    <ellipse cx=\"100\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#f2d8b8\"/>\\n    <ellipse cx=\"140\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#f2d8b8\"/>\\n  </g>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"140\" r=\"10\" fill=\"#4a3c30\"/>\\n    <circle cx=\"101.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"95\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n    <circle cx=\"142\" cy=\"140\" r=\"10\" fill=\"#4a3c30\"/>\\n    <circle cx=\"145.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"139\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n  </g>\\n  <ellipse cx=\"76\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2dgBlush)\"/>\\n  <ellipse cx=\"164\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2dgBlush)\"/>\\n  <path d=\"M 100 196 Q 120 206 140 196\" fill=\"none\" stroke=\"#e07868\" stroke-width=\"5\" stroke-linecap=\"round\" opacity=\".85\"/>\\n  <circle cx=\"120\" cy=\"203\" r=\"4.5\" fill=\"#f2c84e\" stroke=\"#d8a838\" stroke-width=\"1\"/>\\n  <g class=\"pt2-mouth-closed\">\\n    <path d=\"M 115 156 Q 117.5 159.5 120 156 Q 122.5 159.5 125 156\" fill=\"none\" stroke=\"#a87850\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\".8\"/>\\n  </g>\\n  <g class=\"pt2-mouth-open\">\\n    <ellipse cx=\"120\" cy=\"163\" rx=\"5.5\" ry=\"7\" fill=\"#a87850\" opacity=\".85\"/>\\n  </g>\\n  <g transform=\"translate(178 104) scale(.75)\"><path class=\"pt2-spark\" style=\"animation-delay:.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(56 112) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:1.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9b0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.1s\" cx=\"170\" cy=\"196\" r=\"2.2\" fill=\"#fff\"/>\\n</svg>",
  pig: "<svg class=\"pet-creature\" viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"宝宝\">\\n  <defs>\\n    <radialGradient id=\"p2pgBody\" cx=\"42%\" cy=\"30%\" r=\"80%\">\\n      <stop offset=\"0%\" stop-color=\"#fdeef2\"/>\\n      <stop offset=\"42%\" stop-color=\"#fbdce6\"/>\\n      <stop offset=\"74%\" stop-color=\"#f4c2d4\"/>\\n      <stop offset=\"100%\" stop-color=\"#e8a2c0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2pgEarIn\" cx=\"50%\" cy=\"35%\" r=\"75%\">\\n      <stop offset=\"0%\" stop-color=\"#f8c0d4\"/>\\n      <stop offset=\"100%\" stop-color=\"#f0a0c0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2pgBlush\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#f098b4\" stop-opacity=\".55\"/>\\n      <stop offset=\"100%\" stop-color=\"#f098b4\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <radialGradient id=\"p2pgHalo\" cx=\"50%\" cy=\"50%\" r=\"50%\">\\n      <stop offset=\"0%\" stop-color=\"#fbdce6\" stop-opacity=\".6\"/>\\n      <stop offset=\"100%\" stop-color=\"#fbdce6\" stop-opacity=\"0\"/>\\n    </radialGradient>\\n    <filter id=\"p2pgEdge\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"soft\"/>\\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.024\" numOctaves=\"3\" seed=\"21\" result=\"n\"/>\\n      <feDisplacementMap in=\"soft\" in2=\"n\" scale=\"10\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\\n    </filter>\\n    <filter id=\"p2pgSoft\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">\\n      <feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"9\"/>\\n    </filter>\\n  </defs>\\n  <ellipse cx=\"120\" cy=\"212\" rx=\"34\" ry=\"6\" fill=\"#e8a8c4\" opacity=\".22\"/>\\n  <circle cx=\"120\" cy=\"148\" r=\"76\" fill=\"url(#p2pgHalo)\" opacity=\".55\" filter=\"url(#p2pgSoft)\"/>\\n  <g filter=\"url(#p2pgEdge)\">\\n    <g class=\"pt2-ear-l\"><path d=\"M 92 98 Q 84 82 95 77 Q 105 82 103 99 Z\" fill=\"url(#p2pgBody)\"/><path d=\"M 94 94 Q 90 85 96 82 Q 100 87 99 95 Z\" fill=\"url(#p2pgEarIn)\" opacity=\".85\"/></g>\\n  <g class=\"pt2-ear-r\"><path d=\"M 148 98 Q 156 82 145 77 Q 135 82 137 99 Z\" fill=\"url(#p2pgBody)\"/><path d=\"M 146 94 Q 150 85 144 82 Q 140 87 141 95 Z\" fill=\"url(#p2pgEarIn)\" opacity=\".85\"/></g>\\n    <circle cx=\"120\" cy=\"150\" r=\"56\" fill=\"url(#p2pgBody)\"/>\\n    <ellipse cx=\"120\" cy=\"180\" rx=\"27\" ry=\"19\" fill=\"#fdeef2\" opacity=\".38\"/>\\n    <ellipse cx=\"72\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2pgBody)\" transform=\"rotate(12 72 168)\"/>\\n    <ellipse cx=\"168\" cy=\"168\" rx=\"9\" ry=\"13\" fill=\"url(#p2pgBody)\" transform=\"rotate(-12 168 168)\"/>\\n  </g>\\n  <g filter=\"url(#p2pgEdge)\">\\n    <ellipse cx=\"100\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#fbdce6\"/>\\n    <ellipse cx=\"140\" cy=\"205\" rx=\"12\" ry=\"6.5\" fill=\"#fbdce6\"/>\\n  </g>\\n  <g class=\"pt2-eyes\">\\n    <circle cx=\"98\" cy=\"140\" r=\"10\" fill=\"#7a4a62\"/>\\n    <circle cx=\"101.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"95\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n    <circle cx=\"142\" cy=\"140\" r=\"10\" fill=\"#7a4a62\"/>\\n    <circle cx=\"145.5\" cy=\"136.5\" r=\"3.6\" fill=\"#fff\"/>\\n    <circle cx=\"139\" cy=\"143\" r=\"1.6\" fill=\"#fff\" opacity=\".8\"/>\\n  </g>\\n  <ellipse cx=\"76\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2pgBlush)\"/>\\n  <ellipse cx=\"164\" cy=\"156\" rx=\"12\" ry=\"7.5\" fill=\"url(#p2pgBlush)\"/>\\n  <ellipse cx=\"120\" cy=\"162\" rx=\"13\" ry=\"9\" fill=\"url(#p2pgEarIn)\"/>\\n  <ellipse cx=\"120\" cy=\"162\" rx=\"13\" ry=\"9\" fill=\"none\" stroke=\"rgba(200,110,150,.4)\" stroke-width=\"1.4\"/>\\n  <ellipse cx=\"115.5\" cy=\"162\" rx=\"2\" ry=\"2.8\" fill=\"#c8688e\"/>\\n  <ellipse cx=\"124.5\" cy=\"162\" rx=\"2\" ry=\"2.8\" fill=\"#c8688e\"/>\\n  <g transform=\"translate(178 104) scale(.75)\"><path class=\"pt2-spark\" style=\"animation-delay:.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f5d9a8\" opacity=\".85\"/></g>\\n  <g transform=\"translate(56 112) scale(.65)\"><path class=\"pt2-spark\" style=\"animation-delay:1.6s\" d=\"M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z\" fill=\"#f0c9b0\" opacity=\".85\"/></g>\\n  <circle class=\"pt2-spark\" style=\"animation-delay:1.1s\" cx=\"170\" cy=\"196\" r=\"2.2\" fill=\"#fff\"/>\\n</svg>"
};

/* v637: PET_SVG 在页面里会注入多份(选宠卡/命名弹窗/宠物主页), ID 相同会互相串引用 ——
   领养后选宠区 display:none, 主页 SVG 的滤镜引用落到隐藏 defs 上 → 耳朵身体整组消失。
   这里给每份实例的 p2rb、p2br 渐变与滤镜 ID 加独立后缀 (类名 pt2 开头的动画类不动) */
/* v749: 7 只小伙伴 —— 每份实例的渐变/滤镜 ID 加独立后缀(类名 pt2 开头的动画类不动) */
const PET_ID_PX = ['p2rb', 'p2br', 'p2hm', 'p2sq', 'p2ct', 'p2dg', 'p2pg'];
function petSvgNs(type, ns, stage) {
  let s = (stage === 'baby' && PET_SVG_BABY[type]) ? PET_SVG_BABY[type] : (PET_SVG[type] || PET_SVG.rabbit);
  for (const px of PET_ID_PX) s = s.split(px).join(px + ns);
  return s;
}
/* v752: 当前成长阶段 —— baby | adult(含老档迁移) */
function petStageOf(p) {
  return (p && p.type && !p.adult) ? 'baby' : 'adult';
}

function renderPetCreature(p) {
  const slot = document.getElementById('petCreature');
  if (!slot) return;
  const type = (p && PET_SVG[p.type]) ? p.type : 'rabbit';
  slot.innerHTML = petSvgNs(type, '_hm', petStageOf(p));
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
    adult: false,          // v752: false=宝宝期, true=已长大
    fedDates: [],          // v752: 喂养过的日期('YYYY-MM-DD'), 攒满 10 天长大
  };
}

function loadPet() {
  try {
    const raw = localStorage.getItem('ma_pet');
    if (!raw) return petDefault();
    const p = JSON.parse(raw);
    const merged = Object.assign(petDefault(), p);
    // v532: 旧四色多肉迁移到 桃蛋/白牡丹; v749: 未知宠物类型统一兜底到 bear(旧 pig 造型退役, pig 现在是正经新宠物)
    let migrated = false;
    if (merged.plantColor && PLANT_OLD_COLORS[merged.plantColor]) {
      merged.plantColor = PLANT_OLD_COLORS[merged.plantColor];
      migrated = true;
    }
    if (merged.type && !PET_SVG[merged.type]) { merged.type = 'bear'; migrated = true; }
    // v752: 老档宠物(没有成长字段)直接视为已成年, 不回退宝宝
    // 注意: merged 经 petDefault 合并后 adult 恒有值(false), 必须看原始解析对象 p
    if (merged.type && p.adult === undefined) { merged.adult = true; migrated = true; }
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
  /* v637: 领养/养宠需先登录 —— 未登录只显示门禁卡 */
  const gate = document.getElementById('petGate');
  if (!currentUser()) {
    if (gate) gate.hidden = false;
    pick.hidden = true;
    home.hidden = true;
    return;
  }
  if (gate) gate.hidden = true;
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
  // v752: 成长徽章
  const gb = document.getElementById('petGrowBadge');
  if (gb) {
    gb.hidden = false;
    if (p.adult) {
      gb.classList.add('grown');
      gb.innerHTML = '<span class="pgb-ico">🎓</span><span>已经长大啦, 一直陪着你</span>';
    } else {
      const n = Math.min((p.fedDates || []).length, 10);
      gb.classList.remove('grown');
      gb.innerHTML = '<span class="pgb-ico">🍼</span><span>宝宝期 · 喂养 <b>' + n + '</b>/10 天（浇水或喂饭, 每天记 1 天）</span>';
    }
  }
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
    const fed = markPetFed();
    if (fed && fed.grown) {
      setTimeout(() => celebrateGrown(p), 600);
    } else {
      petSay(pickTalk('fed', p), 3000);
    }
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

/* ---------- v752: 喂养打卡 —— 浇水或成功喂饭各记 1 天, 攒满 10 天长大 ---------- */
function markPetFed() {
  const p = loadPet();
  if (!p.type || p.adult) return null;
  if (!Array.isArray(p.fedDates)) p.fedDates = [];
  const today = petToday();
  if (p.fedDates.includes(today)) return { grown: false, count: p.fedDates.length };
  p.fedDates.push(today);
  const grown = p.fedDates.length >= 10;
  if (grown) p.adult = true;
  if (!savePet(p)) return null;
  refreshPetGlobal();
  return { grown, count: p.fedDates.length };
}
function celebrateGrown(p) {
  toast('🎉 「' + p.name + '」吃饱喝足, 长大啦！');
  setTimeout(() => { try { petSay('我长大啦～以后也请多多关照 ♡', 3600); } catch (_) {} }, 800);
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
  const fed = markPetFed();
  if (fed && fed.grown) {
    celebrateGrown(p);
  } else {
    toast('💧 浇水成功，+10 魔力值');
    petSay(pickTalk('watered', p), 3000);
  }
  renderPetHome();
}

/* ---------- 选择流程 ---------- */
let petPickingType = null;
let petRenaming = false;   // v690: true = 改名模式(只改名字不换宠)
function startPickPet(type) {
  /* v690: 宠物只能选一次 —— 已有小伙伴就不再进选宠 */
  const cur = loadPet();
  if (cur.type) { toast('已经有「' + cur.name + '」陪你啦, 小宠是一辈子的哦 🎀'); return; }
  petRenaming = false;
  petPickingType = type;
  document.getElementById('pnmTitle').textContent = '给你的小宠起个名字';
  document.getElementById('pnmTip').textContent = '名字一旦确定，与它终身相伴';
  const art = document.getElementById('pnmArt');
  art.innerHTML = '<div class="pnm-art-inner">' + petSvgNs(type, '_md', 'baby') + '</div>';
  const input = document.getElementById('petNameInput');
  input.value = '';
  document.getElementById('petNameOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => input.focus(), 100);
}

/* v690: 给小宠改名字(点名字牌) —— 不限次数, 只改名字不换宠 */
function startRenamePet() {
  const p = loadPet();
  if (!p.type) return;
  petRenaming = true;
  petPickingType = p.type;
  document.getElementById('pnmTitle').textContent = '给「' + p.name + '」改个名字';
  document.getElementById('pnmTip').textContent = '改名不限次数，小宠还是原来的小宠';
  const art = document.getElementById('pnmArt');
  art.innerHTML = '<div class="pnm-art-inner">' + petSvgNs(p.type, '_md', petStageOf(p)) + '</div>';
  const input = document.getElementById('petNameInput');
  input.value = p.name;
  document.getElementById('petNameOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { input.focus(); input.select(); }, 100);
}

function cancelPickPet() {
  petPickingType = null;
  petRenaming = false;
  document.getElementById('petNameOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function confirmPetName() {
  if (!petPickingType) return;
  const name = document.getElementById('petNameInput').value.trim();
  if (!name) { toast('给它起个名字吧～'); return; }
  if (name.length > 10) { toast('最多 10 个字哦'); return; }
  const p = loadPet();
  if (petRenaming) {
    /* v690: 改名 —— 只动名字 */
    if (name === p.name) { cancelPickPet(); return; }
    const old = p.name;
    p.name = name;
    if (!savePet(p)) return;
    refreshPetGlobal();
    petPickingType = null; petRenaming = false;
    document.getElementById('petNameOverlay').classList.remove('open');
    document.body.style.overflow = '';
    toast('✏️ 「' + old + '」改名成功, 现在叫「' + name + '」啦');
    renderPetHome();
    return;
  }
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

/* ---------- bindPets: 事件绑定 ---------- */
function bindPets() {
  // 选择卡片 (v749: 7 只小伙伴, 卡片驱动注入)
  document.querySelectorAll('.pet-pick-card').forEach(card => {
    const box = card.querySelector('.pet-pick-imgbox');
    if (box) box.innerHTML = petSvgNs(card.dataset.pet, '_pk_' + card.dataset.pet, 'baby');
    card.addEventListener('click', () => startPickPet(card.dataset.pet));
  });
  // v637: 门禁"去登录"
  const petGateLogin = document.getElementById('petGateLogin');
  if (petGateLogin) petGateLogin.addEventListener('click', () => {
    showView('account');
    history.replaceState(null, '', '#account');
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
  // v690: 「重新挑选」按钮已移除(宠物一次定终身); 名字牌点击 = 改名
  document.getElementById('petNameTag').addEventListener('click', startRenamePet);
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
      // v703: rosa 测试特权 —— 魔力无限显示
      sub.textContent = isOwnerUser() ? '当前魔力 ∞（测试特权, 不扣减）'
        : '当前魔力 ' + p.magic + (state.useMagic ? '（使用后将剩 ' + (p.magic - 100) + '）' : '（开启即扣 100）');
    }
  } else {
    row.hidden = true;
    state.useMagic = false;
    const chk = document.getElementById('coMagicChk');
    if (chk) chk.checked = false;
  }
}

/* ============================================================
   v674: 星星许愿瓶 —— 把愿望折成纸星星放进瓶子里
   规则: 投放过才能抽 · 每天一颗 · 不重复不抽自己 · 看完写回话再放回
   保密: 内容只有作者和抽到的人能看到(云端 RPC 强制), 作者能在
         「我的纸条」里看到有缘人留下的回话
   ============================================================ */
const WISH_COLORS = [
  { key: 'blue',   name: '星屑蓝',   hex: '#7FA8C9' },
  { key: 'pink',   name: '桃桃粉',   hex: '#E8A0B4' },
  { key: 'mint',   name: '薄荷绿',   hex: '#8FC9A8' },
  { key: 'gold',   name: '奶油黄',   hex: '#E9C46A' },
  { key: 'lav',    name: '薰衣草紫', hex: '#A48FC9' },
  { key: 'coral',  name: '珊瑚橙',   hex: '#E8907A' },
  { key: 'moon',   name: '月光白',   hex: '#EDE6D8' },
  { key: 'lake',   name: '湖水青',   hex: '#6FB5B0' },
  { key: 'sakura', name: '樱贝粉',   hex: '#F2C9CE' },
  { key: 'dusk',   name: '暮霭紫',   hex: '#9B8FA8' },
];
const WISH_VISUAL_MAX = 46;   // v679: 瓶里星星视觉上限 —— 满瓶后数量不再变, 但数据照常投放/抽取
const wish = {
  open: false, raf: 0, t0: 0, busy: false,
  stars: [], sprites: {}, sparks: [], state: null,
  loading: false,   // v736: state RPC 在途标志 —— 我的纸条先给加载态不误显"没有纸条"
  drawn: null, chosenColor: null, lotteryTimer: 0,
  rise: null, drop: null,
  bg: null, fg: null, DPR: 1, cw: 0, ch: 0, jar: null, dropColor: null,
};

/* ---------- v693: 语音纸条 —— MediaRecorder 录音(≤60s), data URL 随纸条上云 ----------
   编码选择: Chrome/Android 录 webm/opus, Safari 录 mp4/AAC —— 现代浏览器(iOS 14.1+)
   两边都能互相解码播放, 无需引入转码库; 32kbps 对说话足够, 60s ≈ 240KB → base64 ≈ 320KB,
   在云端 RPC 600000 字符上限内 */
const WISH_VOICE_MAX = 60;        // 秒
/* v710: 录音链路重写 —— MediaRecorder(webm/opus) 方案整个退役。
   原链路 = 麦克风 → opus 96k(webm) → 解码回 PCM → lamejs MP3, 两代有损编码叠加,
   opus 的瞬态伪影 + 重采样伪影就是"刺啦/扎耳朵"的主因。
   新链路 = 麦克风 → ScriptProcessor 直采 PCM → lamejs 一次编码, 只有一代有损,
   所有设备通用 MP3(老手机可听), 音质干净得多。 */
const wishVoice = { sp: null, pcm: [], spSR: 0, stream: null, blob: null, url: '', dataP: null, t0: 0, timer: 0, gen: 0, ducked: [], duckDepth: 0 };

/* v725: 去别的 App 放音乐 → 系统抢走音频会话(ctx 挂起/正在播的 <audio> 被暂停),
   回来后整站哑掉。audioWake() 统一复苏 —— 只恢复「状态说应该在响但实际哑了」的音源
   (页面隐藏瞬间先快照谁在播), 绝不重启用户手动暂停的东西。
   v726: 「回来就有声」全自动 —— 唤醒挂满一切自然触碰(触摸/滑动/点击都算, iOS 手势
   规矩内能挂的都挂), 回页面 0.7s 后自动补一次(部分机型刚 visible 那一拍还不让醒),
   真接回声音时给一句提示让疗友安心。 */
let _reviveLater = [];   // duck(false)/复苏时 play() 被拒(不在手势内) → 攒着等下一次触碰重试
let _bgPlaying = [];     // 页面隐藏瞬间的「正在播」快照
let _lastWakeToast = 0;
function _wakeToast() {   // 真接回声音才提示, 4s 内不刷屏
  const now = Date.now();
  if (now - _lastWakeToast > 4000) {
    _lastWakeToast = now;
    try { if (document.visibilityState === 'visible') toast('回来啦, 声音帮你接回来了 🎵'); } catch (e) {}
  }
}
function _reviveTry(a) {
  try {
    /* v730: 被打过封条的一律不许复活 —— 用户已经关掉/停掉的东西, 任何"复苏"都是幽灵 */
    if (!a || audioSealed(a)) return;
    const p = a.play();
    if (p && p.then) p.then(() => { if (!a.muted && a.volume > 0) _wakeToast(); }, () => { if (!audioSealed(a) && _reviveLater.indexOf(a) < 0 && !a.ended) _reviveLater.push(a); });
    else if (p && p.catch) p.catch(() => { if (!audioSealed(a) && _reviveLater.indexOf(a) < 0 && !a.ended) _reviveLater.push(a); });
  } catch (e) {}
}
let _wakeRetryT = 0;
let _voiceSnap = null;   // v727: 页面隐藏瞬间, 正在播的纸条语音(BufferSource)的断点位置
/* v728: ctx 刚刚从"被打断/挂起"回到 running —— WebAudio 里所有活着的节点在这期间都死了,
   必须把所有"还应该在响"的 WebAudio 音源重建一次(循环音源 / 游戏歌 / 抽中幸运星歌) */
let _waRebuildT = 0;
let _ctxDirty = false;   // v728: 音频会话被打断过 → 回来需要重建 WebAudio 音源
function _onCtxRecovered() {
  if (_waRebuildT) return;   // 600ms 内只重建一次, 多个事件连发不重复建节点
  _waRebuildT = setTimeout(() => { _waRebuildT = 0; }, 600);
  try { rebuildLiveLoops(); } catch (e) {}
  try { reviveSongBgm(); } catch (e) {}
}
function audioWake() {
  let wasDown = false;
  try {
    const g = ensureAudioCtx();
    /* v728: 记下唤醒前的状态 —— 'interrupted'(iOS 被别的 App 抢会话) 也算 down,
       不只是 suspended。之前只认 suspended → 那种情况整个复苏链路都不触发 */
    wasDown = !!g && g.state !== 'running';
    if (wasDown) {
      _ctxDirty = true;
      if (g.resume) {
        const pr = g.resume();
        /* v728: 唤醒成功就把脏标记清掉并立刻重建 —— 否则标记留在那儿, 下一次正常点击
           会再重建一遍(循环音源被无谓重启, 听起来就是"音效断一下") */
        if (pr && pr.then) pr.then(() => { if (g.state === 'running') { _ctxDirty = false; _onCtxRecovered(); } }, () => {});
        else if (pr && pr.catch) pr.catch(() => {});
      }
    }
  } catch (e) {}
  // ① 后台快照里被系统暂停的音源 → 续播(失败攒入手势重试队列)
  if (_bgPlaying.length) {
    const snap = _bgPlaying; _bgPlaying = [];
    snap.forEach(a => { if (a && a.paused && !a.ended) _reviveTry(a); });
  }
  // ② duck(false) 恢复时被拒过的音源 → 重试
  if (_reviveLater.length) {
    const list = _reviveLater; _reviveLater = [];
    list.forEach(a => { if (a && a.paused && !a.ended) _reviveTry(a); });
  }
  // ③ 疗愈会话进行中(时钟在走/未暂停/未完成)但音乐被系统暂停 → 续播(人声跟着续)
  if (typeof healingState !== 'undefined' && healingState && healingState.timer && !healingState.paused && !healingState.done &&
      _healAudio.music && _healAudio.music.paused && !_healAudio.music.ended) {
    _reviveTry(_healAudio.music);
    if (_healAudio.voice && _healAudio.voice.paused && !_healAudio.voice.ended) _reviveTry(_healAudio.voice);
  }
  // ④ 用户 ASMR 卡片 UI 显示播放中但音频哑了 → 续播
  try {
    Object.keys(userAsmr).forEach(k => {
      const st = userAsmr[k]; if (!st || !st.audio) return;
      const card = document.querySelector('.asmr-card[data-slot="' + k + '"]');
      if (card && card.classList.contains('playing') && st.audio.paused && !st.audio.ended) _reviveTry(st.audio);
    });
  } catch (e) {}
  // ⑤ v727: 纸条语音是纯 WebAudio BufferSource(一次性节点, 系统打断即死),
  //    DOM 快照抓不到它 → 按 hidden 瞬间记下的位置从断点续播
  try {
    if (_voiceSnap && wishVoiceAudio && wishVoiceCur && !wishVoiceAudio.killed) {
      if (wishVoiceRevive(_voiceSnap.off)) _voiceSnap = null;
    } else {
      _voiceSnap = null;
    }
  } catch (e) {}
  // ⑥ v727: 录音进行中但录音 ctx 被系统挂起 → 顺手唤醒(唤不醒有看门狗兜底收尾)
  try {
    if (wishVoice.sp && wishVoice.actx && wishVoice.actx.state !== 'running' && wishVoice.actx.resume) wishVoice.actx.resume();
  } catch (e) {}
  // ⑦ v728: ctx 刚从 down 恢复 → 把循环音源/游戏歌全部接回来。
  //   _ctxDirty = "这期间音频会话被打断过, WebAudio 节点已经作废"; 只有真被打断过才重建,
  //   正常听歌时的普通点击绝不重建(否则会莫名重启循环音源)
  //   v730: **不在这里同步重建** —— resume() 是异步的, 同步重建等于在 ctx 还没起来时
  //   又建一层节点, 等真恢复就两层叠着响(而且旧引用已丢, 停不掉)。改成 400ms 后看真实状态。
  if (wasDown) {
    setTimeout(() => {
      const g2 = _audioCtx;
      if (g2 && g2.state === 'running') { _ctxDirty = false; _onCtxRecovered(); }
    }, 400);
  } else if (_ctxDirty && document.visibilityState === 'visible' && _audioCtx && _audioCtx.state === 'running') {
    _ctxDirty = false;
    _onCtxRecovered();
  }
  // ⑧ v728: 游戏歌的 <audio> 兜底 / 方案试听的真实文件音频(游离在 DOM 外) → 被系统暂停就接回
  try {
    if (_songCtl && _songCtl._el && _songCtl._el.paused && !_songCtl._el.ended && !_songCtl.stopped) _reviveTry(_songCtl._el);
  } catch (e) {}
  try {
    if (typeof _pdPreview !== 'undefined' && _pdPreview) {
      if (_pdPreview.audio && _pdPreview.audio.paused && !_pdPreview.audio.ended) {
        _reviveTry(_pdPreview.audio);            // 真实文件试听: 接回断点
      } else if (!_pdPreview.audio && _pdPreview.kind && wasDown) {
        /* 合成试听(v602 那套 30s 节点)被打断就全死了, 无法续播 → 重新起一遍,
           总比"界面显示在播其实没声"好 */
        const k = _pdPreview.kind;
        try { stopPlanPreview(); startPlanPreview(k); } catch (e) {}
      }
    }
  } catch (e) {}
}
/* v726: 唤醒挂满一切自然触碰 —— 手指碰上屏幕就算(iOS 手势规矩内最宽的网),
   滑动/滚动/点击全都触发; pointerdown 兜住接了鼠标的老设备 */
['touchstart', 'touchend', 'pointerdown'].forEach(ev => document.addEventListener(ev, () => { audioWake(); }, { passive: true, capture: true }));
window.addEventListener('pageshow', () => { audioWake(); _armWakeRetry(); });
/* v726: 回页面后自动补试 —— 刚 visible 那一拍 iOS 有时还不放行, 隔几拍连补三次。
   v728: 单次 700ms 常常仍然被拒(iOS 要等系统真正放开音频会话), 改成 250/700/1600ms 三连 */
function _armWakeRetry() {
  [250, 700, 1600].forEach(ms => setTimeout(() => { if (document.visibilityState === 'visible') audioWake(); }, ms));
}

/* v694: 录音时把正在放的音乐全部暂停(社区背景音/疗愈音乐等), 停止录音后原位接回来
   v695: 回放语音也走 duck; duck(true) 改为**追加式**(可嵌套, 二次调用不清空先暂停的), duck(false) 全部接回
   v725: duck(false) 恢复改走 _reviveTry —— 页面正被隐藏时 play() 会被拒, 被拒的攒进
         _reviveLater, 回到页面/下一次点击由 audioWake() 补上, 不再"停完录音音乐永远不接回" */
function wishVoiceDuck(on) {
  if (on) {
    /* v730: 引用计数 —— 幸运星歌和纸条语音会同时压住背景音。
       以前 duck(false) 一律"全部接回", 于是听语音时抽中幸运星: 语音一播完就把
       背景音放回来, 而幸运星歌还在响 = 两首叠着。现在只有最后一层退出才真正恢复。 */
    wishVoice.duckDepth = (wishVoice.duckDepth || 0) + 1;
    if (wishVoice.duckDepth > 1) return;
    if (!wishVoice.ducked) wishVoice.ducked = [];
    const grab = a => {
      if (a && !a.paused && !a.ended && wishVoice.ducked.indexOf(a) < 0) {
        wishVoice.ducked.push(a);
        try { a.pause(); } catch (e) {}
      }
    };
    document.querySelectorAll('audio').forEach(grab);          // DOM 里的 <audio>(社区背景音等)
    try { grab(_healAudio.music); grab(_healAudio.voice); } catch (e) {}   // JS 持有的疗愈音乐/人声
    try {   // v711: ASMR 自定义音轨是游离在 DOM 外的 Audio 元素, querySelectorAll 抓不到 → 单独收
      Object.keys(userAsmr).forEach(k => { const s = userAsmr[k]; if (s) grab(s.audio); });
    } catch (e) {}
    /* v730: 内置 ASMR/雨声/游戏内循环是纯 WebAudio, 上面所有 grab 都碰不到它们
       —— 抽中幸运星时"歌 + 雨声"叠着响就是这么来的。这里把循环源一起压下去 */
    try { _loopDuck(true); } catch (e) {}
  } else {
    wishVoice.duckDepth = Math.max(0, (wishVoice.duckDepth || 0) - 1);
    if (wishVoice.duckDepth > 0) return;   // 还有别的音源占着 → 先别放背景音回来
    (wishVoice.ducked || []).forEach(_reviveTry);
    wishVoice.ducked = [];
    try { _loopDuck(false); } catch (e) {}   // 循环源抬回原音量
  }
}

function wishVoiceFmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

function wishVoiceReset() {
  wishVoice.gen++;   // v693: 代际守卫 —— 重置后, 还在飞行中的 getUserMedia/录音回调全部作废
  wishVoiceStopAudio();   // v710: 删掉/重录时, 试听要是还在响, 先停干净 —— "删了就是删了"
  wishVoiceDuck(false);   // v694: 恢复录音时被暂停的音乐(删掉重录/关瓶)
  if (wishVoice.sp) {   // v710: 直采录音停止
    try { wishVoice.sp.onaudioprocess = null; wishVoice.sp.disconnect(); } catch (e) {}
    wishVoice.sp = null;
  }
  wishVoice.pcm = []; wishVoice.spSR = 0;
  if (wishVoice.stream) { wishVoice.stream.getTracks().forEach(t => t.stop()); wishVoice.stream = null; }
  if (wishVoice.actx) { try { wishVoice.actx.close(); } catch (e) {} wishVoice.actx = null; }   // 录音专用 ctx 用完即关, 别占输出路由
  clearInterval(wishVoice.timer); wishVoice.timer = 0;
  if (wishVoice.url) { try { URL.revokeObjectURL(wishVoice.url); } catch (e) {} }
  wishVoice.rec = null; wishVoice.chunks = []; wishVoice.blob = null; wishVoice.url = ''; wishVoice.dataP = null;
  const btn = document.getElementById('wishVoiceBtn');
  const st = document.getElementById('wishVoiceStatus');
  const acts = document.getElementById('wishVoiceActions');
  if (btn) { btn.hidden = false; btn.classList.remove('rec'); btn.textContent = '🎙️ 说句话 (可选)'; }
  if (st) { st.hidden = true; st.textContent = ''; }
  if (acts) acts.hidden = true;
}

/* v705: 录音就地转码 MP3 —— 兼容性根治。
   Chrome 系只能录 webm/opus, iOS 17 以下的 Safari 解不了 webm = 老手机听不到语音纸条;
   MP3 则所有设备通吃。录完后用 lamejs(本地 lame.min.js 懒加载) 解码原始录音 →
   重编码 96kbps 单声道 MP3。转码失败(库没加载/解码失败) → 保留原始录音, 功能不回退 */
let _lameLoading = null;
function wishLameReady() {
  if (window.lamejs && window.lamejs.Mp3Encoder) return Promise.resolve();
  if (_lameLoading) return _lameLoading;
  _lameLoading = new Promise(res => {
    const s = document.createElement('script');
    s.src = 'lame.min.js';
    s.onload = () => res();
    s.onerror = () => res();
    document.head.appendChild(s);
  });
  return _lameLoading;
}
/* v706: 智能混单 —— (L+R)/2 对"只有左路进声"的麦克风会把电平砍半(-6dB), 就是用户反馈
   "录音变小声"的真凶。先算各声道能量: 各路都响(真立体声内容)→平均; 某路明显偏空
   (L-only 麦克风)→直接取最响的一路, 电平分毫不丢。 */
function wishMonoRms(d) {
  let s = 0;
  for (let i = 0; i < d.length; i += 7) s += d[i] * d[i];   // 抽样 1/7 足够判能量
  return Math.sqrt(s / Math.max(1, Math.ceil(d.length / 7)));
}
function wishMonoPick(buf) {
  const nCh = buf.numberOfChannels || 1;
  if (nCh === 1) return buf.getChannelData(0);
  const chans = [];
  for (let c = 0; c < nCh; c++) chans.push(buf.getChannelData(c));
  const rms = chans.map(wishMonoRms);
  let loud = 0;
  for (let c = 1; c < nCh; c++) if (rms[c] > rms[loud]) loud = c;
  const others = rms.some((r, c) => c !== loud && r > rms[loud] * 0.4);   // 别的声道也在响 → 真立体声
  if (!others) return chans[loud];   // L-only 麦克风 → 取有声的那路, 不再 /2
  const out = new Float32Array(buf.length);
  for (let c = 0; c < nCh; c++) {
    const d = chans[c];
    for (let i = 0; i < out.length; i++) out[i] += d[i] / nCh;
  }
  return out;
}

/* v710: 单声道 Float32 PCM → MP3 一次编码(直采直编, 无 opus 二次有损)。
   归一封顶 +6dB(v708), 码率动态(v706): ≤40s 128k / 更长 96k(60s≈720KB<800KB 上限)。 */
async function wishMp3Encode(mono, sr, secs) {
  try {
    await wishLameReady();
    if (!window.lamejs || !window.lamejs.Mp3Encoder) return null;
    let pk = 0;
    for (let i = 0; i < mono.length; i++) { const a = Math.abs(mono[i]); if (a > pk) pk = a; }
    const gain = (pk > 1e-4 && pk < 0.85) ? Math.min(2, 0.85 / pk) : 1;
    const kbps = secs <= 40 ? 128 : 96;
    const enc = new lamejs.Mp3Encoder(1, sr, kbps);
    const out = [];
    const N = 1152;
    for (let i = 0; i < mono.length; i += N) {
      const seg = mono.subarray(i, Math.min(i + N, mono.length));
      const pcm = new Int16Array(seg.length);
      for (let k = 0; k < seg.length; k++) pcm[k] = Math.max(-32768, Math.min(32767, Math.round(seg[k] * gain * 32767)));
      const d = enc.encodeBuffer(pcm);
      if (d.length) out.push(new Uint8Array(d));
    }
    const end = enc.flush();
    if (end.length) out.push(new Uint8Array(end));
    if (!out.length) return null;
    return new Blob(out, { type: 'audio/mpeg' });
  } catch (e) { return null; }
}

/* v710: 停止直采录音 → 拼 PCM → 智能混单 → 编码 → 存为待发语音。
   麦克风/录音 ctx 第一时间全部释放(录音 ctx 用完即关, 不占系统输出路由 ——
   手机上麦克风链路挂着不放, 所有声音都会变得又小又"飘")。 */
function wishVoiceRecStop() {
  const sp = wishVoice.sp;
  if (!sp) return;
  wishVoice.sp = null;
  clearInterval(wishVoice.timer); wishVoice.timer = 0;
  const parts = wishVoice.pcm; wishVoice.pcm = [];
  const sr = wishVoice.spSR || 44100;
  try { sp.onaudioprocess = null; sp.disconnect(); } catch (e) {}
  if (wishVoice.stream) { wishVoice.stream.getTracks().forEach(t => t.stop()); wishVoice.stream = null; }
  if (wishVoice.actx) { try { wishVoice.actx.close(); } catch (e) {} wishVoice.actx = null; }
  wishVoiceDuck(false);   // 停止录音 → 音乐接回来
  try { const g = ensureAudioCtx(); if (g && g.state === 'suspended' && g.resume) g.resume(); } catch (e) {}   // v710: 全局路由兜底唤醒
  const gen = wishVoice.gen;
  (async () => {
    const nL = parts.reduce((s, p) => s + p[0].length, 0);
    if (gen !== wishVoice.gen) return;   // 录完瞬间被删/关瓶 → 作废
    if (!nL) { toast('好像没录到声音, 再试一次吧'); wishVoiceReset(); return; }
    const secs = Math.max(1, Math.round(nL / sr));
    const L = new Float32Array(nL);
    let off = 0;
    for (const p of parts) { L.set(p[0], off); off += p[0].length; }
    let mono = L;
    if (parts.some(p => p[1])) {   // 双路输入 → 智能混单(L-only 麦克风不再 -6dB, v706 规则)
      const R = new Float32Array(nL); off = 0;
      for (const p of parts) { if (p[1]) R.set(p[1], off); off += p[0].length; }
      mono = wishMonoPick({ numberOfChannels: 2, length: nL, sampleRate: sr, getChannelData: c => (c ? R : L) });
    }
    const btn0 = document.getElementById('wishVoiceBtn');
    const st0 = document.getElementById('wishVoiceStatus');
    const acts0 = document.getElementById('wishVoiceActions');
    if (btn0) { btn0.hidden = true; btn0.classList.remove('rec'); }
    if (st0) { st0.hidden = false; st0.textContent = '⏳ 处理中…'; }
    if (acts0) acts0.hidden = true;
    const mp3 = await wishMp3Encode(mono, sr, nL / sr);
    if (gen !== wishVoice.gen) return;
    if (!mp3) { toast('这段录音处理失败了, 再试一次吧'); wishVoiceReset(); return; }
    if (mp3.size > 800000) { toast('录音太长啦, 请录 60 秒以内的'); wishVoiceReset(); return; }
    wishVoice.blob = mp3;
    wishVoice.url = URL.createObjectURL(mp3);
    wishVoice.dataP = new Promise(res => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => res(null);
      fr.readAsDataURL(mp3);
    });
    const btn = document.getElementById('wishVoiceBtn');
    const st = document.getElementById('wishVoiceStatus');
    const acts = document.getElementById('wishVoiceActions');
    if (btn) btn.hidden = true;
    if (st) { st.hidden = false; st.textContent = '🎙️ ' + wishVoiceFmt(secs); }
    if (acts) acts.hidden = false;
  })();
}

async function wishVoiceToggle() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toast('这个设备/浏览器不支持录音哦'); return;
  }
  if (wishVoice.sp) { wishVoiceRecStop(); return; }   // 再点一下=停止
  if (wishVoice.blob) { wishVoiceReset(); return; }   // 已有录音再点按钮=重新录
  if (wishVoice.starting) return;   // v710: 麦克风申请中再点=忽略(防双开录音链路)
  wishVoice.starting = true;
  const gen = wishVoice.gen;
  /* v727: 录音 ctx 在手势内同步创建并解锁 —— 之前是等 getUserMedia 回来再建,
     手势早被 await 作废; iOS 音频会话被别的 App 抢过一次之后, 非手势的 resume
     一律被拒 → "听过别的歌回来, 录音全是哑的"。现在点下按钮这一拍就建好唤醒好。 */
  const AC0 = window.AudioContext || window.webkitAudioContext;
  let actx0 = null;
  if (AC0) {
    try {
      actx0 = new AC0();
      if (actx0.state !== 'running' && actx0.resume) { const rp = actx0.resume(); if (rp && rp.catch) rp.catch(() => {}); }
    } catch (e) {}
  }
  /* v696: 显式关掉浏览器为"打电话"设计的回声消除/噪声抑制/自动增益 ——
     它们会激进切割人声, 造成用户反馈的"突然糊/卡bug/出怪声";
     录音笔记要的是原声, 关掉后录到什么就是什么。老设备不支持约束时退回默认。 */
  const constraints = { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } };
  let micStream;
  try { micStream = await navigator.mediaDevices.getUserMedia(constraints); }
  catch (e) {
    try { micStream = await navigator.mediaDevices.getUserMedia({ audio: true }); }   // 老设备不支持这些约束 → 退回默认
    catch (e2) { wishVoice.starting = false; if (actx0) { try { actx0.close(); } catch (e3) {} } toast('麦克风没打开, 检查一下权限再试试 🎙️'); return; }
  }
  if (gen !== wishVoice.gen) { micStream.getTracks().forEach(t => t.stop()); wishVoice.starting = false; if (actx0) { try { actx0.close(); } catch (e3) {} } return; }
  wishVoice.stream = micStream;   // 原始流: 停它才会真正释放麦克风
  /* v720: 系统打断(来电/切后台)会让麦克风轨道 mute/end —— 轨道一死立刻收尾,
     别让 UI 继续显示"录音中"、录出一整段死寂 */
  micStream.getTracks().forEach(t => {
    t.onended = t.onmute = () => { if (wishVoice.sp) { wishVoice.bgStop = true; wishVoiceRecStop(); } };
  });
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { wishVoice.starting = false; if (actx0) { try { actx0.close(); } catch (e3) {} } toast('这个设备录不了音哦'); wishVoiceReset(); return; }
  let actx, sp;
  try {
    actx = actx0 || new AC();   // v727: 复用手势内创建好的 ctx
    if (actx.state !== 'running' && actx.resume) { try { actx.resume(); } catch (e) {} }
    wishVoice.actx = actx;
    /* v710: ScriptProcessor 直采 PCM。请求 2 路输入: 立体声麦保真; 单声道麦会被
       'speakers' 规则复制成两路(两路能量相等 → 混单时取单路, 不会 -6dB)。 */
    sp = actx.createScriptProcessor(4096, 2, 2);
    wishVoice.pcm = []; wishVoice.spSR = actx.sampleRate;
    sp.onaudioprocess = ev => {
      if (wishVoice.gen !== gen || !wishVoice.sp) return;
      const ib = ev.inputBuffer;
      const part = [new Float32Array(ib.getChannelData(0))];
      if (ib.numberOfChannels > 1) part.push(new Float32Array(ib.getChannelData(1)));
      wishVoice.pcm.push(part);
      wishVoice.lastTick = performance.now();   // v720: 采集心跳 —— 断流看门狗用
    };
    const srcNode = actx.createMediaStreamSource(micStream);
    srcNode.connect(sp);
    const mute = actx.createGain(); mute.gain.value = 0;   // 静音出口: 只为让采集持续跑, 不出声
    sp.connect(mute); mute.connect(actx.destination);
  } catch (e) { wishVoice.starting = false; toast('这个设备录不了音哦'); wishVoiceReset(); return; }
  wishVoice.starting = false;
  if (gen !== wishVoice.gen) return;   // 建链间隙被重置 → 作废(reset 已停流)
  wishVoice.sp = sp;
  wishVoice.t0 = wishVoice.lastTick = wishVoice.resumeT = performance.now();
  wishVoiceDuck(true);   // v694: 录音开始 → 暂停所有正在播的音乐
  const btn = document.getElementById('wishVoiceBtn');
  const st = document.getElementById('wishVoiceStatus');
  const acts = document.getElementById('wishVoiceActions');
  if (btn) { btn.classList.add('rec'); btn.textContent = '⏹ 停止'; }
  if (st) { st.hidden = false; st.textContent = '● 0:00'; }
  if (acts) acts.hidden = true;
  wishVoice.timer = setInterval(() => {
    const s = Math.round((performance.now() - wishVoice.t0) / 1000);
    if (st) st.textContent = '● ' + wishVoiceFmt(s);
    /* v720: 后台切换看门狗 —— 切走后浏览器挂起录音 ctx/断麦克风, 回来后采到的全是死寂。
       ①ctx 被挂起 → 尝试唤醒, 但 2.5s 还唤不醒就收尾(保留已录到的部分);
       ②ctx 正常但 2.2s 没有新采集数据(心跳停了=轨道死了/链路断了) → 收尾 */
    if (wishVoice.actx && wishVoice.actx.state !== 'running') {
      try { wishVoice.actx.resume(); } catch (e) {}
      wishVoice.resumeT = wishVoice.resumeT || performance.now();
      if (performance.now() - wishVoice.resumeT > 2500) { wishVoice.bgStop = true; wishVoiceRecStop(); return; }
    } else {
      wishVoice.resumeT = 0;
      if (wishVoice.sp && performance.now() - (wishVoice.lastTick || wishVoice.t0) > 2200) {
        wishVoice.bgStop = true; wishVoiceRecStop(); return;
      }
    }
    if (s >= WISH_VOICE_MAX && wishVoice.sp) wishVoiceRecStop();
  }, 250);
}

/* v727: 页面隐藏瞬间快照"谁在真正出声" —— v725 的快照只抓 DOM/JS 持有的 <audio>,
   v727 补上纸条语音: 它是游离在 DOM 外的纯 WebAudio BufferSource, 系统一打断就死,
   记下此刻播放位置, 回来由 audioWake() 从断点续播 */
function _bgSnapshot() {
  _bgPlaying = [];
  try { document.querySelectorAll('audio').forEach(a => { if (!a.paused && !a.ended && !audioSealed(a)) _bgPlaying.push(a); }); } catch (e) {}
  try { if (_healAudio.music && !_healAudio.music.paused && !_healAudio.music.ended && !audioSealed(_healAudio.music)) _bgPlaying.push(_healAudio.music); } catch (e) {}
  try { if (_healAudio.voice && !_healAudio.voice.paused && !_healAudio.voice.ended && !audioSealed(_healAudio.voice)) _bgPlaying.push(_healAudio.voice); } catch (e) {}
  try { Object.keys(userAsmr).forEach(k => { const s = userAsmr[k]; if (s && s.audio && !s.audio.paused && !s.audio.ended && !audioSealed(s.audio)) _bgPlaying.push(s.audio); }); } catch (e) {}
  _voiceSnap = null;
  try {
    if (wishVoiceAudio && wishVoiceCur && wishVoiceCur.pending !== true && !wishVoiceAudio.killed) {
      const off = (Date.now() - (wishVoiceAudio.tStart || Date.now())) / 1000;
      if (wishVoiceAudio.el) {   // 兜底 <audio> 路是游离元素, querySelectorAll 抓不到 → 手动收进快照
        if (!wishVoiceAudio.el.paused && !wishVoiceAudio.el.ended) _bgPlaying.push(wishVoiceAudio.el);
      } else if (wishVoiceAudio.sbuf && wishVoiceAudio.dur && off >= 0 && off < wishVoiceAudio.dur - 0.3) {
        _voiceSnap = { off: off };
      }
    }
  } catch (e) {}
}

/* v720: 切后台/去别的 App 再回来, 录音就没声了 —— 手机浏览器在页面隐藏瞬间挂起
   AudioContext、切断麦克风流, 而录音 UI 还显示"录音中", 用户回来按停止 = 一段死寂。
   修法: 离开页面时立刻自动收尾(已录到的内容保留); 回到页面时唤醒全站 ctx 并提示。 */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    /* v725/727: 先快照此刻谁在真正出声(DOM audio/疗愈/ASMR/纸条语音), 回来按快照续播 */
    _bgSnapshot();
    if (wishVoice.sp) { wishVoice.bgStop = true; wishVoiceRecStop(); }   // 录音中切走 → 停在这里, 内容不丢
    else if (wishVoice.starting) wishVoiceReset();                        // 麦克风还没申请到手 → 干脆作废重来
  } else {
    if (wishVoice.bgStop) { wishVoice.bgStop = false; toast('刚才切出去了一下, 录音已经帮你停在这里啦'); }
    else if (wishVoice.sp) {
      /* v723: hidden 分支没拦住(部分机型切后台不派发 hidden 事件)但录音还活着 →
         回到页面这一刻立刻收尾, 杜绝"回来继续录出一段死寂" */
      wishVoice.bgStop = true; wishVoiceRecStop();
      toast('刚才切出去了一下, 录音已经帮你停在这里啦');
    }
    audioWake(); _armWakeRetry();   // v725/726: 全站音频复苏 + 0.7s 自动补试
  }
});

/* v723: "有时候好有时候坏"根治 —— visibilitychange 在部分机型(尤其 iOS 快速划走/锁屏)
   不保证派发, 漏发的那次录音链路就悄悄断掉。补两道更可靠的事件:
   ①pagehide: 离开页面的可靠信号(iOS 上比 visibilitychange 稳) → 同样自动收尾
   ②blur/focus 对: blur 记下"曾失焦"; focus 时若录音还活着 = hidden 漏网 → 立刻收尾;
     没失焦过也顺手查一下轨道健康(iOS 有时 mute 不派发事件, 主动轮询轨道状态) */
let wishVoiceBlurSeen = false;
window.addEventListener('pagehide', () => {
  wishVoiceBlurSeen = false;
  _bgSnapshot();   // v727: bfcache 回退时 pageshow→audioWake 还能按快照续播
  if (wishVoice.sp) { wishVoice.bgStop = true; wishVoiceRecStop(); }
  else if (wishVoice.starting) wishVoiceReset();
});
/* v730: blur 不再无条件拍快照 —— 手机上 blur 会在很多"其实还在用"的场景触发
   (键盘弹出/系统弹窗/地址栏), 拍出来的是**过期名单**, 之后用户手动关掉的东西
   会被 audioWake 按这份旧名单复活 = 关了还在响。只有录音场景才需要它。 */
window.addEventListener('blur', () => { wishVoiceBlurSeen = !!wishVoice.sp; if (wishVoiceBlurSeen) _bgSnapshot(); });
window.addEventListener('focus', () => {
  if (!wishVoice.sp) { wishVoiceBlurSeen = false; return; }
  if (wishVoiceBlurSeen) {   // 曾失焦 + 录音还活着 = 系统级切走没派发 hidden → 兜底停
    wishVoiceBlurSeen = false;
    wishVoice.bgStop = true; wishVoiceRecStop();
    toast('刚才切出去了一下, 录音已经帮你停在这里啦');
    return;
  }
  try {   // 没失焦也查轨道: 被系统打断有时不派发 mute 事件, 直接看轨道状态
    const t = wishVoice.stream && wishVoice.stream.getTracks()[0];
    if (t && (t.muted || t.readyState !== 'live')) { wishVoice.bgStop = true; wishVoiceRecStop(); }
  } catch (e) {}
  audioWake(); _armWakeRetry();   // v725/726: 回到页面(哪怕 hidden 漏发)也复苏 + 自动补试
});

/* 共享播放器: 同一时间只播一段, 按钮文字随播放状态切换
   v695: 回放语音期间同样暂停背景音乐(wishVoiceDuck), 停止/暂停/播完/失败都接回
   v698: 首次尝试播放侧 MediaElementSource 下混 —— iOS Safari 对媒体元素接 WebAudio 有
         历史 bug(不改道/静音), 挂失败会被 catch 静默吞掉 → iPhone 上依旧只有左耳
   v700: 改为纯数据下混 —— 播放前 decodeAudioData 解成采样数据, 手动把所有声道平均成
         一条单声道 buffer 再用 AudioBufferSource 播, 不依赖任何平台节点行为;
         解码失败(格式不支持)才退回 <audio> + v698 挂线 */
let wishVoiceAudio = null;        // 播放控制器 { stop(), paused }
let wishVoicePlayGen = 0;         // 代际: 每次停止/新播 +1, 解码回来的旧代次作废
/* v708: 按钮归属追踪 —— 谁启动的播放谁显示「⏸ 暂停」, 点暂停=停+按钮复位成「▶ 播放」;
   换听另一条时自动停掉上一条并复位它的按钮; 关瓶/关弹窗/播完都走同一收尾, 不再有
   「按了 A 的暂停却复位了 B」「关了窗口又莫名其妙响起来」 */
let wishVoiceCur = null;          // { btn, idle, pending } 当前播放(或加载中)归属的按钮
function wishVoiceResetBtn() {
  if (wishVoiceCur && wishVoiceCur.btn) { try { wishVoiceCur.btn.textContent = wishVoiceCur.idle; } catch (e) {} }
  wishVoiceCur = null;
}
function wishVoiceDone(gen) {     // 播完/出错/被停的统一收尾(仅当还是当前代次)
  if (gen === wishVoicePlayGen) {
    wishVoiceResetBtn();
    wishVoiceAudio = null;
    wishVoiceDuck(false);
  }
}
/* v710: 回放统一走全站唯一的 ensureAudioCtx() —— 不再为语音单开 AudioContext。
   手机上多个 AudioContext 并存时, 系统可能把输出路由拆到不同通道/会话,
   表现就是"所有声音变得又小又飘还诡异"; 全站一个 ctx, 一条输出路由, 干净利落。
   新录音全部是单声道 MP3(单声道天然两耳都响), 播放前 wishMonoPick 混单即可,
   也不再需要 createMediaElementSource 挂线兜底(那玩意 iOS 上本来就不可靠)。 */
function wishVoiceStopAudio() {
  wishVoicePlayGen++;
  wishVoiceResetBtn();   // v708: 复位的是"正在响的那条"的按钮, 不是按的这条
  if (wishVoiceAudio) {
    wishVoiceAudio.paused = true;
    try { if (wishVoiceAudio.el) audioSeal(wishVoiceAudio.el); } catch (e) {}   // v730: 兜底 <audio> 也封死
    try { wishVoiceAudio.stop(); } catch (e) {}
    wishVoiceAudio = null;
  }
  wishVoiceDuck(false);
}
function wishVoiceAudioFallback(src, btn, idleText, gen) {   // 解码不出来 → 老路
  try {
    const el = new Audio(src);
    const ctrl = { stop: () => { ctrl.killed = true; audioSeal(el); try { el.pause(); } catch (e) {} }, paused: false, el: el };
    wishVoiceAudio = ctrl;
    wishVoiceCur = { btn, idle: idleText };   // v708: 按钮归属
    if (btn) btn.textContent = '⏸ 暂停';
    el.onended = el.onerror = () => {
      if (gen !== wishVoicePlayGen) return;
      if (btn) btn.textContent = idleText;
      wishVoiceDone(gen);
    };
    el.play().catch(() => {
      if (gen !== wishVoicePlayGen) return;
      wishVoiceDone(gen);
      toast('这段语音播不出来 😢');
    });
  } catch (e) { wishVoiceDone(gen); }
}
function wishVoicePlaySrc(src, btn, idleText) {
  if (!src || !btn) return;
  /* v708: 统一开关 —— 自己这条在响(或在加载) → 再点=停; 否则停掉别的再播自己 */
  if (wishVoiceCur && wishVoiceCur.btn === btn) { wishVoiceStopAudio(); return; }
  wishVoiceStopAudio();
  wishVoiceDuck(true);   // 回放期间音乐闭嘴
  wishVoiceCur = { btn, idle: idleText, pending: true };
  btn.textContent = '… 加载中';
  const gen = wishVoicePlayGen;   // 当前代次(上面 stop 已 ++)
  const ctx = ensureAudioCtx();
  if (!ctx) { wishVoiceAudioFallback(src, btn, idleText, gen); return; }
  fetch(src).then(r => r.arrayBuffer()).then(ab => new Promise((ok, bad) => {
    try {
      const p = ctx.decodeAudioData(ab, ok, bad);   // 回调式全平台兼容
      if (p && typeof p.then === 'function') p.then(ok, bad);
    } catch (e) { bad(e); }
  })).then(async buf => {
    if (gen !== wishVoicePlayGen) return;   // 加载期间被停掉/换播 → 作废(按钮已被复位)
    if (!buf) { wishVoiceAudioFallback(src, btn, idleText, gen); return; }
    /* v727: 系统抢过音频会话后 ctx 可能还没醒过来(fetch/decode 这几秒 resume 早被
       消化掉了) —— 排节点前确保 running, 不然 BufferSource 排进冻结的时间轴 = 全程哑 */
    if (ctx.state !== 'running') { try { await ctx.resume(); } catch (e) {} }
    const mono = ctx.createBuffer(1, buf.length, buf.sampleRate);
    mono.getChannelData(0).set(wishMonoPick(buf));   // v706: 智能混单, L-only 老录音回放不再 -6dB
    const snode = ctx.createBufferSource();
    snode.buffer = mono;
    snode.connect(ctx.destination);
    /* v727: 记下起点/时长/采样数据 —— 被系统打断后 wishVoiceRevive() 按断点重建节点续播 */
    const ctrl = { paused: false, snode: snode, sbuf: mono, tStart: Date.now(), dur: buf.duration, killed: false };
    ctrl.stop = () => { ctrl.killed = true; try { snode.stop(); } catch (e) {} };
    wishVoiceAudio = ctrl;
    wishVoiceCur = { btn, idle: idleText };
    btn.textContent = '⏸ 暂停';   // v708: 真正开始响了才叫"暂停"
    snode.onended = () => { if (gen === wishVoicePlayGen) { wishVoiceDone(gen); } };
    snode.start();
  }).catch(() => {
    if (gen !== wishVoicePlayGen) return;
    wishVoiceAudioFallback(src, btn, idleText, gen);   // 解码不了(webm on 老 iOS 等) → 退回 <audio>
  });
}

/* v727: 纸条语音被系统打断(去别的 App 听歌)后的断点续播 —— BufferSource 是一次性节点,
   打断即死; hidden 瞬间 _bgSnapshot() 记下了播放位置, 回到这里重建节点接着播。
   返回 true=续上了, false=唤不醒/已播完(快照留着等下次触碰再试或直接收尾) */
function wishVoiceRevive(off) {
  const ctl = wishVoiceAudio;
  if (!ctl || ctl.killed || !ctl.sbuf) return false;
  const remain = (ctl.dur || 0) - off;
  if (remain <= 0.3) { wishVoiceDone(wishVoicePlayGen); return true; }   // 其实已经播完了 → 正常收尾
  try {
    const ctx = ensureAudioCtx();
    if (!ctx || ctx.state !== 'running') return false;   // 刚回来那一拍唤不醒 → 留着, 0.7s 补试/下次触碰
    try { ctl.snode.onended = null; ctl.snode.stop(); } catch (e) {}
    const snode = ctx.createBufferSource();
    snode.buffer = ctl.sbuf;
    snode.connect(ctx.destination);
    ctl.snode = snode;
    ctl.tStart = Date.now();
    ctl.dur = remain;
    snode.onended = () => { wishVoiceDone(wishVoicePlayGen); };
    snode.start(0, off);
    _wakeToast();
    return true;
  } catch (e) { return false; }
}

function wishShade(hex, f) {   // f<0 变深, f>0 变浅
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255, p = Math.abs(f);
  r = Math.round((t - r) * p) + r; g = Math.round((t - g) * p) + g; b = Math.round((t - b) * p) + b;
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
function wishColorOf(key) { return WISH_COLORS.find(c => c.key === key) || WISH_COLORS[0]; }

function wishRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

/* v679: 胖纸星星顶点(外五角 + 内五角), 中点二次曲线闭合 = 圆角没有棱角(用户: 圆润一点) */
function wishLuckyPts(cx, cy, r, rot) {
  const pts = [], inn = r * 0.52;
  for (let i = 0; i < 5; i++) {
    const a = rot - Math.PI / 2 + i * (Math.PI * 2 / 5);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    const a2 = a + Math.PI / 5;
    pts.push([cx + Math.cos(a2) * inn, cy + Math.sin(a2) * inn]);
  }
  return pts;
}
function wishLuckyPath(ctx, cx, cy, r, rot) {
  const pts = wishLuckyPts(cx, cy, r, rot), n = pts.length;
  ctx.beginPath();
  ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  ctx.closePath();
}
function wishLuckyPathStr(cx, cy, r, rot) {   // SVG 版(弹窗里用)
  const pts = wishLuckyPts(cx, cy, r, rot), n = pts.length;
  const f = v => (Math.round(v * 10) / 10);
  let d = 'M' + f((pts[n - 1][0] + pts[0][0]) / 2) + ' ' + f((pts[n - 1][1] + pts[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    d += ' Q' + f(p[0]) + ' ' + f(p[1]) + ' ' + f((p[0] + q[0]) / 2) + ' ' + f((p[1] + q[1]) / 2);
  }
  return d + ' Z';
}

/* 胖纸星星 SVG(弹窗里用) */
function wishStarSvg(color, size) {
  const c = wishColorOf(color), deep = wishShade(c.hex, -0.3);
  const gid = 'wsg' + c.key + size;
  return '<svg viewBox="0 0 64 64" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">'
    + '<defs><radialGradient id="' + gid + '" cx="38%" cy="32%" r="75%">'
    + '<stop offset="0%" stop-color="' + wishShade(c.hex, 0.45) + '"/>'
    + '<stop offset="62%" stop-color="' + c.hex + '"/>'
    + '<stop offset="100%" stop-color="' + wishShade(c.hex, -0.22) + '"/>'
    + '</radialGradient></defs>'
    + '<path d="' + wishLuckyPathStr(32, 32, 26, 0) + '" '
    + 'fill="url(#' + gid + ')" stroke="' + deep + '" stroke-width="2" stroke-linejoin="round"/>'
    + '<ellipse cx="26" cy="22" rx="5" ry="3" fill="rgba(255,255,255,0.55)" transform="rotate(-24 26 22)"/></svg>';
}

/* ---------- 罐子 canvas ---------- */
function wishResize() {
  const cv = document.getElementById('wishJar');
  const box = cv.parentNode.getBoundingClientRect();
  wish.DPR = Math.min(window.devicePixelRatio || 1, 2);
  wish.cw = Math.max(280, box.width);
  wish.ch = Math.max(220, box.height);
  cv.width = wish.cw * wish.DPR;
  cv.height = wish.ch * wish.DPR;
  wishBakeBg();
}
function wishBakeStars() {   // v679: 每颗夜光纸星星预烘焙成精灵图(自发光晕+胖圆角星体), 每帧只 drawImage
  wish.sprites = {};
  WISH_COLORS.forEach(c => {
    const S = 96, off = document.createElement('canvas');
    off.width = S * wish.DPR; off.height = S * wish.DPR;
    const g = off.getContext('2d');
    g.scale(wish.DPR, wish.DPR);
    // 夜光晕(纸星星自己会发光)
    const glow = g.createRadialGradient(S / 2, S / 2, 3, S / 2, S / 2, S * 0.47);
    glow.addColorStop(0, wishRgba(c.hex, 0.5));
    glow.addColorStop(0.5, wishRgba(c.hex, 0.2));
    glow.addColorStop(1, wishRgba(c.hex, 0));
    g.fillStyle = glow;
    g.beginPath(); g.arc(S / 2, S / 2, S * 0.47, 0, Math.PI * 2); g.fill();
    // 胖纸星星本体(水彩渐变, 圆角无棱角)
    const grad = g.createRadialGradient(S * 0.4, S * 0.34, 2, S / 2, S / 2, S * 0.26);
    grad.addColorStop(0, wishShade(c.hex, 0.55));
    grad.addColorStop(0.55, wishShade(c.hex, 0.1));
    grad.addColorStop(1, wishShade(c.hex, -0.18));
    wishLuckyPath(g, S / 2, S / 2, S * 0.24, 0);
    g.fillStyle = grad; g.fill();
    g.strokeStyle = wishShade(c.hex, -0.3); g.lineWidth = 1.4; g.globalAlpha = 0.75; g.stroke();
    g.globalAlpha = 1;
    // 夜光白芯(中心透亮) + 折痕高光
    const core = g.createRadialGradient(S * 0.44, S * 0.4, 1, S * 0.46, S * 0.42, S * 0.14);
    core.addColorStop(0, 'rgba(255,255,240,0.75)');
    core.addColorStop(1, 'rgba(255,255,240,0)');
    g.fillStyle = core;
    g.beginPath(); g.arc(S * 0.46, S * 0.42, S * 0.14, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.7;
    g.beginPath(); g.ellipse(S * 0.4, S * 0.32, 4.5, 2.6, -0.4, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.fill();
    g.globalAlpha = 1;
    wish.sprites[c.key] = off;
  });
}
function wishBakeBg() {   // 背景(水彩色晕) + 圆形魔法瓶一次性烘焙(v675: 同主页魔法瓶 圆瓶身+细颈+宝珠塞)
  const cw = wish.cw, ch = wish.ch, DPR = wish.DPR;
  const off = document.createElement('canvas');
  off.width = cw * DPR; off.height = ch * DPR;
  const g = off.getContext('2d');
  g.scale(DPR, DPR);
  const base = g.createLinearGradient(0, 0, 0, ch);
  base.addColorStop(0, '#FDF8EC'); base.addColorStop(0.7, '#F6ECF4'); base.addColorStop(1, '#EFE3F2');
  g.fillStyle = base; g.fillRect(0, 0, cw, ch);
  const blobs = [
    [0.18, 0.22, '#F2C9CE', 0.20], [0.82, 0.18, '#B8D4EC', 0.20],
    [0.12, 0.78, '#D9E8D2', 0.18], [0.88, 0.8, '#E2D4F0', 0.18], [0.5, 0.5, '#FBF0D8', 0.14],
  ];
  blobs.forEach(b => {
    const rg = g.createRadialGradient(cw * b[0], ch * b[1], 0, cw * b[0], ch * b[1], cw * 0.34);
    rg.addColorStop(0, b[2]); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.globalAlpha = b[3]; g.fillStyle = rg; g.fillRect(0, 0, cw, ch);
  });
  g.globalAlpha = 0.05;
  for (let i = 0; i < 220; i++) {
    g.fillStyle = Math.random() > 0.5 ? '#8A7A6A' : '#FFFFFF';
    g.fillRect(Math.random() * cw, Math.random() * ch, 1.2, 1.2);
  }
  g.globalAlpha = 1;

  // —— 纸星星罐(v679): 圆润玻璃罐 + 短颈 + 木塞 —— 大圆角, 水彩不要棱角 ——
  const jarW = Math.min(cw * 0.44, 208);
  const jarH = Math.min(ch * 0.55, 178);
  const jcx = cw / 2;
  const jbottom = ch * 0.88;
  const jtop = jbottom - jarH;
  const hw = jarW / 2;
  const neckW = jarW * 0.34;
  const neckH = 22;
  const neckTopY = jtop - neckH;
  const corkW = neckW + 12, corkH = 15;
  wish.geom = { cx: jcx, top: jtop, bottom: jbottom, hw, neckW, neckTopY, corkH, rimY: jtop };
  function jarBodyPath(gg2, g2, inset) {
    const r = Math.min(36, gg2.hw * 0.42);
    g2.beginPath();
    g2.roundRect(gg2.cx - gg2.hw + (inset || 0), gg2.top + (inset || 0),
      gg2.hw * 2 - (inset || 0) * 2, gg2.bottom - gg2.top - (inset || 0) * 2, r);
  }
  // 地面落影 + 罐后柔光
  g.globalAlpha = 0.32;
  g.beginPath(); g.ellipse(jcx, jbottom + 10, jarW * 0.52, 9, 0, 0, Math.PI * 2);
  g.fillStyle = '#B8A892'; g.fill();
  g.globalAlpha = 1;
  const bsh = g.createRadialGradient(jcx, (jtop + jbottom) / 2, jarW * 0.3, jcx, (jtop + jbottom) / 2, jarW * 0.85);
  bsh.addColorStop(0, 'rgba(200,180,220,0.25)');
  bsh.addColorStop(1, 'rgba(200,180,220,0)');
  g.fillStyle = bsh;
  g.beginPath(); g.arc(jcx, (jtop + jbottom) / 2, jarW * 0.85, 0, Math.PI * 2); g.fill();
  // 木塞(圆角, 木纹)
  const cork = g.createLinearGradient(0, neckTopY - corkH - 2, 0, neckTopY + 2);
  cork.addColorStop(0, '#E2C28C'); cork.addColorStop(1, '#C89E62');
  g.beginPath();
  g.roundRect(jcx - corkW / 2, neckTopY - corkH - 2, corkW, corkH + 6, 7);
  g.fillStyle = cork; g.fill();
  g.strokeStyle = 'rgba(150,110,60,0.5)'; g.lineWidth = 1.6; g.stroke();
  g.strokeStyle = 'rgba(150,110,60,0.3)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(jcx - corkW * 0.28, neckTopY - corkH + 1); g.lineTo(jcx + corkW * 0.1, neckTopY - corkH + 1); g.stroke();
  g.beginPath(); g.moveTo(jcx - corkW * 0.1, neckTopY - 2); g.lineTo(jcx + corkW * 0.3, neckTopY - 2); g.stroke();
  // 罐颈玻璃(先画, 罐身盖住交界)
  g.beginPath();
  g.roundRect(jcx - neckW / 2, neckTopY, neckW, neckH + 8, [8, 8, 0, 0]);
  g.fillStyle = 'rgba(226, 238, 248, 0.5)'; g.fill();
  g.strokeStyle = 'rgba(110, 135, 160, 0.4)'; g.lineWidth = 2; g.stroke();
  // 罐身玻璃(大圆角)
  const glass = g.createRadialGradient(jcx - hw * 0.35, jtop + jarH * 0.25, jarW * 0.12, jcx, (jtop + jbottom) / 2, jarW * 0.95);
  glass.addColorStop(0, 'rgba(242, 249, 255, 0.75)');
  glass.addColorStop(0.55, 'rgba(255, 255, 255, 0.28)');
  glass.addColorStop(1, 'rgba(214, 226, 240, 0.62)');
  jarBodyPath(wish.geom, g, 0);
  g.fillStyle = glass; g.fill();
  // 罐底一点水彩晕(星星躺在里面)
  jarBodyPath(wish.geom, g, 0); g.save(); g.clip();
  const bed = g.createRadialGradient(jcx, jbottom - 22, 8, jcx, jbottom - 22, jarW * 0.72);
  bed.addColorStop(0, 'rgba(207, 190, 240, 0.30)');
  bed.addColorStop(1, 'rgba(207, 190, 240, 0)');
  g.fillStyle = bed;
  g.fillRect(jcx - hw, jbottom - jarH, jarW, jarH);
  g.restore();
  jarBodyPath(wish.geom, g, 0);
  g.strokeStyle = 'rgba(110, 135, 160, 0.5)'; g.lineWidth = 2.6; g.stroke();
  wish.bg = off;

  // —— 玻璃前片(画在星星上面: 内缘阴影 + 高光条, 让星星看起来"装在罐子里") ——
  const fg = document.createElement('canvas');
  fg.width = cw * DPR; fg.height = ch * DPR;
  const gf = fg.getContext('2d');
  gf.scale(DPR, DPR);
  jarBodyPath(wish.geom, gf, 0); gf.save(); gf.clip();
  gf.strokeStyle = 'rgba(110, 135, 160, 0.16)'; gf.lineWidth = 9;
  jarBodyPath(wish.geom, gf, 3.5); gf.stroke();   // 内缘柔和阴影
  gf.globalAlpha = 0.5;
  gf.beginPath();
  gf.ellipse(jcx - hw * 0.58, (jtop + jbottom) / 2 - 6, hw * 0.09, jarH * 0.3, 0.5, 0, Math.PI * 2);
  gf.fillStyle = '#FFFFFF'; gf.fill();
  gf.globalAlpha = 0.26;
  gf.beginPath();
  gf.ellipse(jcx + hw * 0.6, (jtop + jbottom) / 2 + 4, hw * 0.055, jarH * 0.22, -0.4, 0, Math.PI * 2);
  gf.fillStyle = '#FFFFFF'; gf.fill();
  gf.globalAlpha = 0.12;
  gf.beginPath(); gf.ellipse(jcx, jbottom - 8, hw * 0.55, 9, 0, 0, Math.PI * 2);
  gf.fillStyle = '#7A8BA0'; gf.fill();
  gf.globalAlpha = 1;
  gf.restore();
  wish.fg = fg;
}

/* v679: 罐内星星布局 —— 每投一颗多一颗, 堆向罐底; 视觉最多 WISH_VISUAL_MAX 颗(满瓶后数量不变, 数据照常投/抽)
   v689: 颜色不再随机 —— ma_wish_state 返回全部纸条的颜色清单(colors, 按 created_at),
         瓶里第 i 颗星星 = 第 i 颗纸条的真实颜色(金星真的金); 数量/颜色集变化时整体重排(撤回减星也对) */
function wishLayoutStars() {
  const st = wish.state;
  const gg = wish.geom;
  if (!gg) return;
  const n = Math.min(st ? (st.total || 0) : 0, WISH_VISUAL_MAX);
  const cols = (st && st.colors) || [];
  const sig = n + '|' + cols.join(',');
  if (sig !== wish.layoutSig) {
    wish.layoutSig = sig;
    wish.stars.length = 0;
  }
  while (wish.stars.length < n) {
    const key = cols[wish.stars.length]
      || WISH_COLORS[Math.floor(Math.random() * WISH_COLORS.length)].key;   // 旧版 SQL 没跑时的兜底
    const x = gg.cx + (Math.random() * 2 - 1) * (gg.hw - 22);
    const span = gg.bottom - gg.top - 38;
    const y = gg.top + 24 + span * Math.pow(Math.random(), 0.72);   // 偏向罐底, 越堆越满
    wish.stars.push({
      x, y, r: 8 + Math.random() * 3.5, rot: (Math.random() - 0.5) * 0.9, color: wishColorOf(key).key,
      ph: Math.random() * Math.PI * 2, amp: 0.5 + Math.random() * 0.5,
    });
  }
}
function wishSeedSparkles(n) {
  const gg = wish.geom;
  if (!gg) return;
  while (wish.sparks.length < n) {
    wish.sparks.push({
      x: gg.cx + (Math.random() * 2 - 1) * (gg.hw - 26),
      y: gg.top + 26 + Math.random() * (gg.bottom - gg.top - 44),
      v: 0.12 + Math.random() * 0.3, s: 1 + Math.random() * 1.8, ph: Math.random() * Math.PI * 2,
      c: WISH_COLORS[Math.floor(Math.random() * WISH_COLORS.length)].hex,
    });
  }
}

function wishFrame(ts) {
  if (!wish.open) return;
  const cv = document.getElementById('wishJar');
  const ctx = cv.getContext('2d');
  const cw = wish.cw, ch = wish.ch, DPR = wish.DPR;
  const gg = wish.geom || { cx: cw / 2, top: ch * 0.31, bottom: ch * 0.88, hw: cw * 0.22, neckW: 60, neckTopY: ch * 0.31 - 22, corkH: 15, rimY: ch * 0.31 };
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  if (wish.bg) ctx.drawImage(wish.bg, 0, 0, cw, ch);
  const t = (ts - wish.t0) / 1000;

  // 罐身柔光呼吸(夜光感, 中心=罐身中心)
  const glowA = 0.10 + 0.07 * Math.sin(t * 1.1);
  const rg = ctx.createRadialGradient(gg.cx, (gg.top + gg.bottom) / 2, gg.hw * 0.15, gg.cx, (gg.top + gg.bottom) / 2, gg.hw * 1.6);
  rg.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
  rg.addColorStop(1, 'rgba(255, 240, 200, 0)');
  ctx.globalAlpha = glowA;
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalAlpha = 1;

  // —— 罐内(裁剪进罐身): 夜光星星 + 光尘 ——
  ctx.save();
  const jr = Math.min(36, gg.hw * 0.42);
  ctx.beginPath();
  ctx.roundRect(gg.cx - gg.hw, gg.top, gg.hw * 2, gg.bottom - gg.top, jr);
  ctx.clip();
  wish.stars.forEach(s => {
    const bob = Math.sin(t * 1.4 + s.ph) * 1.6;
    const tw = 0.78 + 0.22 * Math.sin(t * (1.6 + s.amp) + s.ph * 2);
    const sz = s.r * 4.4;   // 精灵图 96px, 星体占 48% → 星宽≈2.1r
    ctx.globalAlpha = tw;
    ctx.drawImage(wish.sprites[s.color], s.x - sz / 2, s.y - sz / 2 + bob, sz, sz);
  });
  // v699: 大号彩虹幸运星(今天的还没被抽走才出现; 群主点 TA 可强制触发)
  if (wish.luckyStar) {
    const L = wish.luckyStar;
    const bob = Math.sin(t * 1.2 + L.ph) * 2.2;
    const ly = L.y + bob;
    const rot = Math.sin(t * 0.8) * 0.16;
    const R = 15;
    const halo = ctx.createRadialGradient(L.x, ly, 2, L.x, ly, R * 3.2);
    halo.addColorStop(0, 'hsla(' + ((t * 60) % 360) + ', 90%, 70%, 0.5)');
    halo.addColorStop(1, 'hsla(' + ((t * 60) % 360) + ', 90%, 70%, 0)');
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(t * 2.1);
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(L.x, ly, R * 3.2, 0, Math.PI * 2); ctx.fill();
    const rg2 = ctx.createLinearGradient(L.x - R, ly - R, L.x + R, ly + R);
    for (let i = 0; i <= 4; i++) rg2.addColorStop(i / 4, 'hsl(' + ((t * 45 + i * 72) % 360) + ', 85%, 62%)');
    wishLuckyPath(ctx, L.x, ly, R, rot);
    ctx.fillStyle = rg2; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // 夜光呼吸: lighter 叠一层星星光(错开相位, 一闪一闪)
  ctx.globalCompositeOperation = 'lighter';
  wish.stars.forEach(s => {
    const bob = Math.sin(t * 1.4 + s.ph) * 1.6;
    const tw = 0.5 + 0.5 * Math.sin(t * (1.1 + s.amp * 0.6) + s.ph * 2.3);
    const sz = s.r * 4.4;
    ctx.globalAlpha = 0.22 * tw;
    ctx.drawImage(wish.sprites[s.color], s.x - sz / 2, s.y - sz / 2 + bob, sz, sz);
  });
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  wish.sparks.forEach(p => {
    p.y -= p.v;
    p.ph += 0.05;
    if (p.y < gg.top + 22) { p.y = gg.bottom - 26; p.x = gg.cx + (Math.random() * 2 - 1) * (gg.hw - 30); }
    ctx.globalAlpha = Math.max(0, 0.35 + 0.3 * Math.sin(p.ph));
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.restore();

  // 玻璃前片(内缘阴影+高光, 星星"装在罐子里"的关键)
  if (wish.fg) ctx.drawImage(wish.fg, 0, 0, cw, ch);

  if (wish.rise) {   // 抽星星: 从罐里升起, 穿过瓶颈飞到木塞上方
    const k = Math.min(1, (ts - wish.rise.t0) / 1000);
    const y0 = gg.bottom - 46, y1 = gg.neckTopY - gg.corkH - 34;
    const y = y0 + (y1 - y0) * (1 - Math.pow(1 - k, 2));
    const sc = 1 + k * 0.7;
    ctx.globalAlpha = k < 0.85 ? 1 : (1 - k) / 0.15;
    const sz = 46 * sc;
    ctx.drawImage(wish.sprites[wish.rise.color], gg.cx - sz / 2, y - sz / 2, sz, sz);
    ctx.globalAlpha = 1;
    if (k >= 1) { const done = wish.rise; wish.rise = null; wishShowDrawn(done.data); }
  }
  if (wish.drop) {   // 投星星: 从木塞上方落进罐口
    if (wish.drop.ty == null) wish.drop.ty = gg.top + 26 + (gg.bottom - gg.top - 44) * (0.55 + Math.random() * 0.45);
    const k = Math.min(1, (ts - wish.drop.t0) / 900);
    const ease = 1 - Math.pow(1 - k, 3);
    const sz = 34 + 14 * Math.sin(Math.min(k * 2, 1) * Math.PI);
    const x = gg.cx + Math.sin(k * 6) * 8;
    const y0 = gg.neckTopY - gg.corkH - 26;
    const y = y0 + ease * (wish.drop.ty - y0);
    ctx.drawImage(wish.sprites[wish.drop.color], x - sz / 2, y - sz / 2, sz, sz);
    if (k >= 1) {
      if (wish.stars.length < WISH_VISUAL_MAX) {
        wish.stars.push({
          x, y: wish.drop.ty, r: 9 + Math.random() * 3,
          rot: (Math.random() - 0.5) * 0.9, color: wish.drop.color, ph: 0, amp: 1,
        });
      }
      wish.drop = null;
    }
  }

  wish.raf = requestAnimationFrame(wishFrame);
}
function wishStartLoop() {
  wish.t0 = performance.now();
  if (wish.raf) cancelAnimationFrame(wish.raf);
  wish.raf = requestAnimationFrame(wishFrame);
}
function wishStopLoop() {
  if (wish.raf) cancelAnimationFrame(wish.raf);
  wish.raf = 0;
}

/* ---------- 状态加载 ---------- */
function wishRpcMissing(e) {   // v674: SQL 还没跑时优雅提示(不吓人)
  const msg = (e && e.message) || '';
  return e && (e.code === 'PGRST202' || /Could not find the function|schema cache/i.test(msg));
}
async function refreshWishState(quiet) {
  if (!sbReady() || !cm.uid) return;
  refreshLuckyState(true);   // v721: 与 state 并行加载, 不再串行排队(手机上两个 RPC 排队=空瓶翻倍)
  wish.loading = true;
  try {
    const { data, error } = await sb.rpc('ma_wish_state');
    if (error) throw error;
    wish.state = data;
    wish.loading = false;
    /* v721: 缓存星星清单 —— 下次开瓶先用缓存秒渲染, 云端只做后台校准
       v736: 连 my_notes 一起缓存 —— 「我的纸条」不再干等 RPC, 打开就是上次的内容 */
    try { localStorage.setItem('ma_wish_cache', JSON.stringify({
      total: data.total, colors: data.colors, ids: data.ids,
      mine_count: data.mine_count, has_contributed: data.has_contributed,
      drew_today: data.drew_today, replies_count: data.replies_count,
      my_notes: data.my_notes,
    })); } catch (e) {}
    const total = document.getElementById('wishTotal');
    const n = data.total || 0;
    total.textContent = n ? '瓶子里躺着 ' + n + ' 颗纸星星 ✨' : '瓶子里还空着… 折第一颗星星放进来吧';
    wishLayoutStars();
    wishUpdateButtons();
    refreshLuckyState(true);   // v699: 彩虹幸运星在不在
    /* v736: 「我的纸条」弹窗正开着的话, 数据到了立刻重渲染(替换加载态/旧内容) */
    const mm = document.getElementById('wishMineModal');
    if (mm && !mm.hidden) wishShowMine();
  } catch (e) {
    wish.loading = false;
    if (wishRpcMissing(e)) {
      document.getElementById('wishTotal').textContent = '⭐ 许愿瓶马上就来, 群主正在开瓶…';
    } else if (!quiet) {
      toast('瓶子暂时够不着, 稍后再试~');
    }
  }
}
function wishUpdateButtons() {
  const st = wish.state;
  if (!st) return;
  const d = document.getElementById('wishDrawBtn');
  const mine = document.getElementById('wishMineBtn');
  const owner = isOwnerUser();   // v699: 群主不限每天一颗
  if (!st.has_contributed && !owner) {
    d.disabled = false;
    d.textContent = '🌙 抽一颗星星';
    d.dataset.tip = 'no_note';
  } else if (st.drew_today && !owner) {
    d.disabled = true;
    d.textContent = '🌙 今天抽过了 · 明天再来';
    d.dataset.tip = '';
  } else {
    d.disabled = false;
    d.textContent = '🌙 抽一颗星星';
    d.dataset.tip = '';
  }
  mine.textContent = st.mine_count ? '我的纸条(' + st.mine_count + ')' : '我的纸条';
}

/* ---------- v699 幸运星 ----------
   大号彩虹幸运星永远住在罐子里(v711: 不再"今天被抽走就消失" —— 每天第一位
   抽中 TA 的疗友成为当天的幸运星, 星星本身不拿走, 第二天照常有机会)。
   抽中 → 全屏弹窗「你就是今天的幸运星!」+ 专属音乐(背景音乐全停) + 进入公开名单
        + v732: 当天有效 —— 当天下单立减 ¥10 + 随单赠送一份神秘小礼物(不再永久、不按瓶数)。
   rosa 特权: 点罐里任意星星直接抽那颗; 点彩虹星强制触发幸运星(测试用)。 */
async function refreshLuckyState(quiet) {
  if (!sbReady() || !cm.uid) return;
  try {
    const { data, error } = await sb.rpc('ma_wish_lucky_state');
    if (error) throw error;
    wish.lucky = data;
    /* v732: 结算用的"今天中没中"标记 —— 新 SQL 会返回 me_won_today / today;
       老 SQL 没这两个字段时保持本地标记不动(中奖那一刻已经写过日期) */
    if (data && data.me_won_today !== undefined && data.me_won_today !== null) {
      luckySetDay(data.me_won_today ? (data.today || bjDateStr()) : '');
    } else if (data && data.me_won === false) {
      luckyClearDay();
    }
    wishLayoutLucky();
  } catch (e) { /* SQL 未跑时安静失败 */ }
}
function wishLayoutLucky() {   // 彩虹幸运星的位置(不与纸星星重叠逻辑, 固定偏上层)
  const gg = wish.geom;
  if (!gg) return;
  const show = !!wish.lucky;   // v711: 幸运星常驻瓶中, 不再因"今天被抽中"而消失
  if (!show) { wish.luckyStar = null; return; }
  if (!wish.luckyStar) {
    wish.luckyStar = {
      x: gg.cx + (Math.random() * 2 - 1) * (gg.hw - 44),
      y: gg.top + (gg.bottom - gg.top) * 0.3,
      ph: 0,
    };
  }
}
let wishLuckyAudio = null;
function wishLuckyPopSvg() {   // v699: 庆祝弹窗的大彩虹星(五段渐变)
  const gid = 'luckyPopGrad';
  return '<svg viewBox="0 0 64 64" width="88" height="88" xmlns="http://www.w3.org/2000/svg">'
    + '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">'
    + '<stop offset="0%" stop-color="#FF6FA5"/><stop offset="25%" stop-color="#FFB347"/>'
    + '<stop offset="50%" stop-color="#7ED47F"/><stop offset="75%" stop-color="#5B9BD5"/>'
    + '<stop offset="100%" stop-color="#B07BD5"/></linearGradient></defs>'
    + '<path d="' + wishLuckyPathStr(32, 32, 26, 0) + '" fill="url(#' + gid + ')" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round"/>'
    + '<ellipse cx="26" cy="22" rx="5" ry="3" fill="rgba(255,255,255,0.55)" transform="rotate(-24 26 22)"/></svg>';
}
function wishLuckyCelebrate() {
  const pop = document.getElementById('luckyPop');
  if (pop) {
    pop.hidden = false;
    const starBox = document.getElementById('luckyPopStar');
    if (starBox && !starBox.innerHTML) starBox.innerHTML = wishLuckyPopSvg();
  }
  /* v715: 群主抽中是测试态 —— 不进名单也不占名额, 弹窗里说清楚, 免得以为真发了奖励 */
  const testNote = document.getElementById('luckyPopTest');
  const noteMain = pop ? pop.querySelector('.lucky-pop-note') : null;
  const ownerNow = isOwnerUser();
  if (testNote) testNote.hidden = !ownerNow;
  if (noteMain) noteMain.hidden = ownerNow;
  try {   // v716: 专属音乐改走 playSongBgm(WebAudio) —— 原先 <audio>+Blob 的 play() 发生在
          // 异步 fetch 之后, 不在用户手势里, 手机浏览器静默拒绝 → "弹窗出来了歌没响";
          // 而且 v711 先把背景音全停了再播失败 = 全程一点声都没有。
          // WebAudio ctx 在点抽星的那一刻已解锁, BufferSource 随时可播, 全设备可靠。
          // stopSongBgm 停游戏歌, duck 停社区背景音/疗愈音乐/ASMR, 播完自动接回。
    stopSongBgm();
    wishVoiceDuck(true);
    const ok = playSongBgm('lucky-star.mp3', 0.9, () => wishVoiceDuck(false));
    if (!ok) {   // v717: 没有 WebAudio 的老浏览器 → 退回 <audio>(老设备可能仍被静音, 新设备可用)
      try {
        const a = new Audio('lucky-star.mp3?v=' + AUDIO_VERSION);
        a.volume = 0.9; a.loop = false;
        a.onended = a.onerror = () => wishVoiceDuck(false);
        wishLuckyAudio = a;
        const p = a.play(); if (p && p.catch) p.catch(() => wishVoiceDuck(false));
      } catch (e2) { wishVoiceDuck(false); }
    }
  } catch (e) { wishVoiceDuck(false); }
}
/* v730: 星星瓶里所有会响的东西, 一次性收干净 —— 关瓶 / 关庆祝弹窗 / 切页面都走这里。
   顺序: 歌 → 兜底 <audio> → 纸条语音 → 把被压低的循环源抬回 → 清空复苏名单。
   全部独立 try: 任何一环抛错都不许拖住"关闭"这个动作本身。 */
function stopAllWishAudio() {
  try { stopSongBgm(); } catch (e) {}
  try { if (wishLuckyAudio) { audioSeal(wishLuckyAudio); wishLuckyAudio.pause(); wishLuckyAudio = null; } } catch (e) {}
  try { wishVoiceStopAudio(); } catch (e) {}
  try { wishVoice.duckDepth = 0; } catch (e) {}   // 强制归零, 后面一定把背景音放回来
  try { _loopDuck(false); } catch (e) {}
  try { _bgPlaying = []; } catch (e) {}      // 过期复苏名单必须清 —— 否则关了还被它拉回来
  try { _reviveLater = []; } catch (e) {}
}
function wishLuckyClose() {
  const pop = document.getElementById('luckyPop');
  if (pop) pop.hidden = true;
  stopAllWishAudio();   // v730: 幸运星歌/兜底音频/语音 + 复苏名单, 一次收干净(原来只停歌)
  try { refreshLuckyState(true); } catch (e) {}   // 名单更新 + 今天的彩虹星消失
}
function wishShowLuckyList() {
  const list = document.getElementById('wishLuckyList');
  list.innerHTML = '';
  /* v739: 名单只显示 用户 + 抽中次数, 按次数由高到低(SQL 排好序), 不再显示日期;
     rosa(群主)不参与公开排名 —— SQL 不把她的行放进 list, 只回 my_row,
     她自己打开名单时在末尾追加一行"只有你能看到", 别人完全看不到 */
  const rows = (wish.lucky && wish.lucky.list) || [];
  if (!rows.length) {
    const p = document.createElement('p');
    p.className = 'wish-lucky-empty';
    p.innerHTML = '还没有人抽中过幸运星<br>会是今天的第一个吗？🌟';
    list.appendChild(p);
  }
  rows.forEach(r => {
    const it = document.createElement('div');
    it.className = 'wish-lucky-item';
    const star = document.createElement('span');
    star.className = 'wish-lucky-star-ic';
    star.textContent = '🌟';
    const nm = document.createElement('span');
    nm.className = 'wish-lucky-name';
    nm.textContent = (r.nickname || '匿名疗友') + (r.friend_code ? ' · 疗友号 ' + r.friend_code : '');
    const cnt = document.createElement('span');
    cnt.className = 'wish-lucky-date';
    cnt.textContent = '抽中 ' + (r.cnt || 1) + ' 次';
    it.appendChild(star); it.appendChild(nm); it.appendChild(cnt);
    list.appendChild(it);
  });
  const myRow = wish.lucky && wish.lucky.my_row;
  if (isOwnerUser() && myRow && myRow.cnt > 0) {
    const it = document.createElement('div');
    it.className = 'wish-lucky-item wish-lucky-me-row';
    const star = document.createElement('span');
    star.className = 'wish-lucky-star-ic';
    star.textContent = '🌟';
    const nm = document.createElement('span');
    nm.className = 'wish-lucky-name';
    nm.textContent = (myRow.nickname || '匿名疗友') + (myRow.friend_code ? ' · 疗友号 ' + myRow.friend_code : '');
    const cnt = document.createElement('span');
    cnt.className = 'wish-lucky-date';
    cnt.textContent = '抽中 ' + myRow.cnt + ' 次 · 只有你能看到';
    it.appendChild(star); it.appendChild(nm); it.appendChild(cnt);
    list.appendChild(it);
  }
  const me = document.getElementById('wishLuckyMe');
  if (me) me.hidden = !(wish.lucky && (wish.lucky.me_won_today !== undefined ? wish.lucky.me_won_today : wish.lucky.me_won));
  wishShowModal('wishLuckyModal');
}

/* ---------- 弹窗开关 ---------- */
function wishShowModal(id) {
  ['wishWriteModal', 'wishViewModal', 'wishMineModal', 'wishLuckyModal', 'wishCleanModal'].forEach(m => {
    document.getElementById(m).hidden = m !== id;
  });
}
function wishHideModals() {
  wishVoiceStopAudio();   // v710: 关掉弹窗=语音停干净 —— "关了就是关了"
  wishShowModal(null);
}

/* ---------- v710: 不写回话, 把星星放回瓶子 ----------
   抽到星星后如果不想回话(或只想看看), 之前没有任何办法还回去 —— 星星被
   drawn_by 锁在手里 30 分钟, 别人抽不到, 自己重开瓶子还会弹出来。
   ma_wish_release 只允许释放"自己拿着的"星星, 云端强制。 */
async function wishReleaseBack() {
  if (!wish.drawn) return;
  const id = wish.drawn.id;
  wish.drawn = null;
  try { sessionStorage.removeItem('ma_wish_holding'); } catch (e) {}
  try { await sb.rpc('ma_wish_release', { p_id: id }); } catch (e) {}   // SQL 未跑时静默(30 分钟后云端自动释放)
  wishHideModals();
  toast('星星已经放回瓶子里啦 ✨');
  refreshWishState(true);
}
function wishReleaseHoldingQuiet(oldId) {   // v710: 抽新的之前, 把手里旧的悄悄放回去(群主连抽不再锁死一片)
  try { sessionStorage.removeItem('ma_wish_holding'); } catch (e) {}
  try { const p = sb.rpc('ma_wish_release', { p_id: oldId }); if (p && p.catch) p.catch(() => {}); } catch (e) {}
}

/* ---------- v713/v714: 群主清理台 ----------
   v711 的「只删 🤍 白头像星星」抓不全, v713 靠昵称猜也猜不准。
   v714 换成精确判据: **profiles.bday 为空 = 不是从 App 注册的号**
   (App 注册表单把生日当硬性必填, 不填根本注册不了) → 那就是我自动化脚本造的测试号。
   服务端 ma_wish_cleanup 还会二次把关: 填过生日的真人号一律跳过, 误勾也删不掉。 */
let wishCleanRows = [];

function wishCleanAge(iso) {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  const h = Math.floor((Date.now() - t) / 3600000);
  if (h < 1) return '刚刚';
  if (h < 24) return h + ' 小时前';
  return Math.floor(h / 24) + ' 天前';
}

function wishCleanRender() {
  const list = document.getElementById('wishCleanList');
  list.innerHTML = '';
  if (!wishCleanRows.length) {
    list.innerHTML = '<p class="wish-mine-empty">瓶子里没有任何星星, 很干净 ✨</p>';
    return;
  }
  wishCleanRows.forEach(r => {
    const row = document.createElement('label');
    row.className = 'wish-clean-row';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!r.bot;   // v714: 只有"没填生日=我造的测试号"默认勾上, 真人绝不预勾
    cb.addEventListener('change', () => row.classList.toggle('on', cb.checked));
    row.classList.toggle('on', cb.checked);
    const body = document.createElement('div');
    body.className = 'wish-clean-body';

    const name = document.createElement('p');
    name.className = 'wish-clean-name';
    name.textContent = (r.avatar ? r.avatar + ' ' : '') + (r.nickname || '(未设置)') + (r.friend_code ? ' · ' + r.friend_code : '');
    body.appendChild(name);

    const tags = document.createElement('div');
    tags.className = 'wish-clean-tags';
    const mkTag = (cls, txt) => {
      const s = document.createElement('span');
      s.className = 'wish-clean-tag ' + cls;
      s.textContent = txt;
      tags.appendChild(s);
    };
    if (r.bot) mkTag('bot', '🤖 我造的测试号');
    else mkTag('human', '👤 正常注册');
    if (r.test_star) mkTag('ghost', '含测试星星');
    if (r.msgs > 0) mkTag('real', '有发言 ' + r.msgs + ' 条');
    body.appendChild(tags);

    const meta = document.createElement('p');
    meta.className = 'wish-clean-meta';
    meta.textContent = (r.notes || 0) + ' 颗星 · 抽过 ' + (r.draws || 0) + ' 次'
      + (r.holding ? ' · 手里正拿着 ' + r.holding + ' 颗' : '')
      + (r.lucky ? ' · 幸运星 ' + r.lucky + ' 次' : '')
      + (r.created_at ? ' · ' + wishCleanAge(r.created_at) + '注册' : '');
    body.appendChild(meta);

    if (r.sample) {          // v714: 星星内容样本 —— 一眼看出是不是测试脚本写的
      const sm = document.createElement('p');
      sm.className = 'wish-clean-sample';
      sm.textContent = '「' + r.sample + '」';
      body.appendChild(sm);
    }

    row.appendChild(cb);
    row.appendChild(body);
    list.appendChild(row);
  });
}

async function wishCleanOpen() {
  if (!isOwnerUser() || !sbReady()) return;
  const list = document.getElementById('wishCleanList');
  list.innerHTML = '<p class="wish-mine-empty">正在清点…</p>';
  wishShowModal('wishCleanModal');
  try {
    const { data, error } = await sb.rpc('ma_wish_cleanup_preview');
    if (error) throw error;
    wishCleanRows = (data && data.authors) || [];
    wishCleanRender();
  } catch (e) {
    if (wishRpcMissing(e)) {
      list.innerHTML = '<p class="wish-mine-empty">清理台还没装好 — 去 Supabase 跑一下<br>supabase-v714-bday.sql 就好 ✨</p>';
    } else {
      list.innerHTML = '<p class="wish-mine-empty">清点失败, 稍后再试</p>';
    }
  }
}

async function wishCleanRun(kill) {
  if (!isOwnerUser() || !sbReady()) return;
  const list = document.getElementById('wishCleanList');
  const boxes = list.querySelectorAll('.wish-clean-row input');
  const ids = [];
  boxes.forEach((cb, i) => { if (cb.checked && wishCleanRows[i]) ids.push(wishCleanRows[i].id); });
  if (!ids.length) { toast('先勾一下要清掉的账号 🧹'); return; }
  const starTotal = wishCleanRows.filter(r => ids.indexOf(r.id) !== -1).reduce((a, r) => a + (r.notes || 0), 0);
  const msg = kill
    ? '要永久删掉这 ' + ids.length + ' 个账号 + 他们的 ' + starTotal + ' 颗星星(连消息/好友一起), 无法恢复。确认?'
    : '要清掉这 ' + ids.length + ' 个账号的 ' + starTotal + ' 颗星星(账号保留), 确认?';
  if (!confirm(msg)) return;
  try {
    const { data, error } = await sb.rpc('ma_wish_cleanup', { p_ids: ids, p_kill: !!kill });
    if (error) throw error;
    const d = data || {};
    const parts = ['清掉 ' + (d.deleted || 0) + ' 颗星星'];
    if (d.unlocked) parts.push('解锁 ' + d.unlocked + ' 颗');
    if (d.draws_cleaned) parts.push('清掉 ' + d.draws_cleaned + ' 条抽签记录');
    if (d.accounts) parts.push('删掉 ' + d.accounts + ' 个账号');
    if (d.failed) parts.push(d.failed + ' 个没删动');
    toast('🧹 ' + parts.join(' · '));
    const skipped = Array.isArray(d.skipped) ? d.skipped : [];
    if (skipped.length) {   // v714: 服务端把正常注册的真人号挡下来了
      setTimeout(() => toast('👤 ' + skipped.slice(0, 3).join('、') + (skipped.length > 3 ? ' 等' : '') + ' 是正常注册的真人, 没动它们'), 1400);
    }
    refreshWishState(true);
    wishCleanOpen();   // 重开清单, 看还剩谁
  } catch (e) {
    if (wishRpcMissing(e)) toast('清理台还没装好 — 去 Supabase 跑 supabase-v714-bday.sql');
    else toast((e && e.message) ? e.message : '清理没成功, 稍后再试');
  }
}

/* v732: 星星瓶从"社区里的全屏弹层"变成独立页面(#wish) —— openWish 现在由
   showView('wish') 调用, 只负责把瓶子初始化好; 视觉显隐交给 .view.active */
async function openWish() {
  if (!currentUser()) { toast('先登录, 再来许愿哦 🌙'); return; }
  wish.open = true;
  ensureAudioCtx();   // v717: 进瓶子是真实手势, 在这里解锁全站 WebAudio —— 抽星的 RPC 回来后已不在手势内
  preloadSongBgm('lucky-star.mp3');   // v717: 预载幸运星歌, 抽中秒响
  wishHideModals();
  const gb2 = document.getElementById('wishGhostBtn');   // v711: 登录态在绑定时可能还没就绪, 进瓶时再同步一次
  if (gb2) gb2.hidden = !isOwnerUser();
  wishResize();
  wishBakeStars();
  wishLayoutStars();
  wishSeedSparkles(14);
  wishStartLoop();
  /* v721: 秒开 —— 上次的星星清单直接从缓存渲染, 云端 RPC 只做后台校准
     (Supabase 免费实例冷启动 2-3s, 之前必须干等 RPC 回来瓶子才是空的) */
  if (!wish.state) {
    try {
      const c = JSON.parse(localStorage.getItem('ma_wish_cache') || 'null');
      if (c && typeof c.total === 'number') {
        wish.state = c; wishLayoutStars(); wishUpdateButtons();
        const tt = document.getElementById('wishTotal');
        if (tt) tt.textContent = c.total ? '瓶子里躺着 ' + c.total + ' 颗纸星星 ✨' : '瓶子里还空着… 折第一颗星星放进来吧';
      }
    } catch (e) {}
  }
  /* v732: 瓶子独立成页后, 用户可能从没进过社区 —— 那时 cm.uid 还是空的,
     云端 RPC 全部会静默 return。这里主动把云端身份捞一次 */
  if (sbReady() && !cm.uid) {
    try { await cloudEnsureUser(); } catch (e) {}
  }
  refreshWishState();
  try {
    const hold = JSON.parse(sessionStorage.getItem('ma_wish_holding') || 'null');
    if (hold && wish.state && wish.state.drew_today) {
      wish.drawn = hold;
      wishShowDrawn(hold, true);
    }
  } catch (e) {}
}
/* silent=true → 只收音频/动画(切页面时用, 不要回首页), 否则回首页 */
function closeWish(silent) {
  /* v730: 「关不上」彻底根治 —— 先收状态, 再逐步收音频;
     每一步各自 try/catch, 任何一环抛错都不许把"关闭"卡住 */
  wish.open = false;
  try { stopAllWishAudio(); } catch (e) {}          // 歌 / 语音 / duck / 复苏名单
  try { wishStopLoop(); } catch (e) {}
  try { wishVoiceReset(); } catch (e) {}            // 录到一半就关 = 作废
  try { wishLuckyClose(); } catch (e) {}            // 幸运星庆祝跟着收尾(隐藏 + 名单刷新)
  try { if (wish.lotteryTimer) { clearInterval(wish.lotteryTimer); wish.lotteryTimer = 0; } } catch (e) {}
  /* v732: 独立页面没有"关闭"这个概念了 —— ✕ / Esc 就是回首页 */
  if (!silent) { try { if (state.currentView === 'wish') showView('home'); } catch (e) {} }
}

/* ---------- 写星星 ---------- */
function openWishWrite() {
  document.getElementById('wishWriteText').value = '';
  document.getElementById('wishWriteCount').textContent = '0 / 150';
  wishVoiceStopAudio();
  wishVoiceReset();          // v693: 每次开写都从无录音开始
  document.getElementById('wishLottery').hidden = false;
  document.getElementById('wishLotteryBtn').disabled = false;
  document.getElementById('wishLotteryBtn').textContent = '🎲 去抽一张星星纸';
  document.getElementById('wishLotteryHint').textContent = '要先抽纸才能投哦 ✨ 星星的颜色是抽签决定的, 看看缘分给你哪张纸';
  document.getElementById('wishChosen').hidden = true;
  document.getElementById('wishSubmitBtn').disabled = false;   // v711: 不再置灰 —— 直接点投放会弹提示引导先抽纸
  wish.chosenColor = null;
  wishShowModal('wishWriteModal');
}
function wishLottery() {   // 抽星星纸: 快速换色 ~1.4s 后定色
  const btn = document.getElementById('wishLotteryBtn');
  const chosen = document.getElementById('wishChosen');
  const starEl = document.getElementById('wishChosenStar');
  const nameEl = document.getElementById('wishChosenName');
  const hint = document.getElementById('wishLotteryHint');
  btn.disabled = true;
  btn.textContent = '抽纸中…';
  chosen.hidden = false;
  let tick = 0;
  if (wish.lotteryTimer) clearInterval(wish.lotteryTimer);
  wish.lotteryTimer = setInterval(() => {
    tick++;
    const c = WISH_COLORS[Math.floor(Math.random() * WISH_COLORS.length)];
    starEl.innerHTML = wishStarSvg(c.key, 34);
    if (tick >= 14) {
      clearInterval(wish.lotteryTimer);
      wish.lotteryTimer = 0;
      wish.chosenColor = c;
      nameEl.textContent = '「' + c.name + '」的星星纸';
      hint.textContent = '就用这张纸折啦 ✨';
      /* v724: 抽纸动画结束后按钮必须离开「抽纸中…」—— 颜色都拿到了还显示抽纸中,
         疗友以为还在抽。改成完成态文案(保持置灰: 颜色是抽签定的, 不换重抽) */
      btn.textContent = '📄 已抽到「' + c.name + '」纸';
      document.getElementById('wishSubmitBtn').disabled = false;
    } else {
      nameEl.textContent = '…';
    }
  }, 90);
}
async function wishSubmit() {
  if (wish.busy) return;
  const text = document.getElementById('wishWriteText').value.trim();
  if (wishVoice.rec && wishVoice.rec.state === 'recording') { toast('先把这段话说完, 点 ⏹ 停止'); return; }
  if (!text && !wishVoice.blob) { toast('写点文字或录一段语音呀 ✍️🎙️'); return; }
  if (!wish.chosenColor) { toast('要先抽纸才能投哦 ✨ 点上面「🎲 去抽一张星星纸」'); return; }   // v711: 文案统一
  wish.busy = true;
  const btn = document.getElementById('wishSubmitBtn');
  btn.disabled = true;
  btn.textContent = '放进去…';
  try {
    let voice = null;
    if (wishVoice.blob) {
      voice = wishVoice.dataP ? await wishVoice.dataP : null;
      if (!voice || !/^data:audio\//.test(voice)) voice = null;
    }
    const { data, error } = await sb.rpc('ma_wish_submit', { p_content: text, p_color: wish.chosenColor.key, p_voice: voice });
    if (error) throw error;
    wishVoiceStopAudio();
    wishVoiceReset();
    wishHideModals();
    wish.dropColor = wish.chosenColor.key;
    wish.drop = { t0: performance.now(), color: wish.chosenColor.key };
    toast('⭐ 星星已经折好, 飞进瓶子里啦');
    await refreshWishState(true);
  } catch (e) {
    if (wishRpcMissing(e)) toast('⭐ 许愿瓶马上就来, 群主正在开瓶…');
    else if (e && (e.code === 'PGRST203' || /could not choose/i.test(e.message || ''))) toast('页面版本有点旧啦, 刷新一下再试就好 ✨');   // v705
    else toast((e && e.message) ? e.message : '没放进去, 再试一次');
    btn.disabled = false;
  }
  btn.textContent = '把星星放进瓶子里';
  wish.busy = false;
}

/* ---------- 抽星星 ----------
   v699: 群主特权 —— wishDraw(p_force_note, p_force_lucky) 指定抽哪颗/强制触发幸运星(云端校验群主);
         点罐子里的星星直接抽那颗, 点大彩虹幸运星强制触发幸运星 */
async function wishDraw(forceNote, forceLucky) {
  if (wish.busy || !wish.open) return;
  ensureAudioCtx();   // v717: 抽星点击的同步栈内解锁 ctx —— RPC await 之后已不在手势里, 只能靠这里提前解锁
  const owner = isOwnerUser();
  const st = wish.state;
  if (!forceLucky) {
    if (st && st.drew_today && !owner) { toast('今天已经抽过啦, 明天再来 🌙'); return; }
    if (st && !st.has_contributed && !owner) {
      toast('先折一颗自己的星星放进瓶子, 才能抽哦 ✨');
      openWishWrite();
      return;
    }
  }
  wish.busy = true;
  const btn = document.getElementById('wishDrawBtn');
  btn.disabled = true;
  btn.textContent = '闭眼抽签中…';
  try {
    // v710: 手里还握着上一颗(重开瓶子/群主连抽) → 先悄悄放回去, 不然旧的被锁死"收不回来"
    if (wish.drawn) { const oldId = wish.drawn.id; wish.drawn = null; wishReleaseHoldingQuiet(oldId); }
    // v703: 固定传两个具名参数 —— 库里旧版无参 ma_wish_draw() 重载还在时,
    // 空参调用会撞 PostgREST PGRST203「无法选择函数」; 具名参数能锁定新版函数
    const args = { p_force_note: forceNote != null ? forceNote : null, p_force_lucky: forceLucky ? true : null };
    const { data, error } = await sb.rpc('ma_wish_draw', args);
    if (error) throw error;
    if (data && data.err) {
      const msgs = {
        no_note: '先折一颗自己的星星放进瓶子, 才能抽哦 ✨',
        already: '今天已经抽过啦, 明天再来 🌙',
        empty: '瓶子里的星星都被抽过了, 折一颗新的放进来吧 ✨',
        busy: '大家都在抽, 再试一次~',
      };
      toast(msgs[data.err] || '再试一次~');
      wishUpdateButtons();
      return;
    }
    wish.drawn = data;
    try { sessionStorage.setItem('ma_wish_holding', JSON.stringify(data)); } catch (e) {}
    /* v722: 抽完立刻把 drew_today 置真(内存+缓存) —— v721 缓存的旧状态让普通疗友
       抽完后按钮还写着「抽一颗星星」, 再点才被云端拒绝, 很迷惑 */
    if (wish.state) wish.state.drew_today = true;
    try {
      const c = JSON.parse(localStorage.getItem('ma_wish_cache') || 'null');
      if (c) { c.drew_today = true; localStorage.setItem('ma_wish_cache', JSON.stringify(c)); }
    } catch (e) {}
    btn.textContent = '🌙 抽一颗星星';
    wish.rise = { t0: performance.now(), color: data.color, data };
    if (data.lucky) {                     // v699: 抽中幸运星 → 弹窗 + 专属音乐
      /* v732: 记下"中奖的是哪一天" —— 结算时只有当天才算数(隔天自动失效),
         群主测试模式也要记, 否则测试时看不到结算页徽章 */
      try { luckySetDay(bjDateStr()); } catch (e) {}
      wishLuckyCelebrate();
    }
  } catch (e) {
    if (wishRpcMissing(e)) toast('⭐ 许愿瓶马上就来, 群主正在开瓶…');
    else if (e && (e.code === 'PGRST203' || /could not choose/i.test(e.message || ''))) toast('页面版本有点旧啦, 刷新一下再抽就好 ✨');   // v705
    else toast((e && e.message) ? e.message : '没抽出来, 再试一次');
    btn.textContent = '🌙 抽一颗星星';
  }
  wish.busy = false;
  wishUpdateButtons();
}
function wishShowDrawn(d, silent) {
  d = d || wish.drawn;
  if (!d) return;
  document.getElementById('wishViewStar').innerHTML = wishStarSvg(d.color, 64);
  const vEl = document.getElementById('wishViewVoice');
  wishVoiceStopAudio();
  if (d.voice) { vEl.hidden = false; vEl.dataset.src = d.voice; vEl.textContent = '▶ 听 TA 的声音'; }
  else { vEl.hidden = true; vEl.dataset.src = ''; }
  document.getElementById('wishViewContent').textContent = d.content || (d.voice ? '💌 这颗星星里装着一段声音' : '');
  document.getElementById('wishViewFrom').textContent = '来自 ' + (d.author_name || '匿名疗友') + ' · 疗友号 ' + (d.friend_code || '----');
  document.getElementById('wishReplyText').value = '';
  document.getElementById('wishReplyCount').textContent = '0 / 150';
  document.getElementById('wishReplySendBtn').disabled = false;
  document.getElementById('wishReplySendBtn').textContent = '写回话 · 送回瓶子';
  wishShowModal('wishViewModal');
}

/* ---------- 回话放回 ---------- */
async function wishReplySend() {
  if (wish.busy || !wish.drawn) return;
  const text = document.getElementById('wishReplyText').value.trim();
  if (!text) { toast('写一句回话再送回去吧 💌'); return; }
  wish.busy = true;
  const btn = document.getElementById('wishReplySendBtn');
  btn.disabled = true;
  btn.textContent = '送回瓶子里…';
  try {
    const { error } = await sb.rpc('ma_wish_reply', { p_id: wish.drawn.id, p_reply: text });
    if (error) throw error;
    try { sessionStorage.removeItem('ma_wish_holding'); } catch (e) {}
    wish.drawn = null;
    wishHideModals();
    toast('💌 回话已经随纸星星送回瓶子里啦');
    refreshWishState(true);
  } catch (e) {
    toast((e && e.message) ? e.message : '没送回去, 再试一次');
    btn.disabled = false;
  }
  btn.textContent = '写回话 · 送回瓶子';
  wish.busy = false;
}
function wishGoFind() {
  if (!wish.drawn || !wish.drawn.author_id) return;
  const id = wish.drawn.author_id;
  closeWish();
  openProfileCard(id);
}

/* ---------- 我的纸条 ---------- */
/* v736: 打开时数据还没回来(冷启动 RPC 慢)不再误显"还没放过纸星星" ——
   先给加载态, refreshWishState 回来后自动重渲染; 本地缓存里有 my_notes 则秒开 */
async function wishShowMine() {
  const st = wish.state;
  const list = document.getElementById('wishMineList');
  const cached = (st && st.my_notes) || [];
  if (!cached.length && (wish.loading || !st)) {
    list.innerHTML = '<p class="wish-mine-empty">正在翻小纸条… ✨</p>';
    wishShowModal('wishMineModal');
    await refreshWishState(true);
    if (document.getElementById('wishMineModal').hidden) return;   // 等待期间被关掉了, 别再弹回来
  }
  const notes = (wish.state && wish.state.my_notes) || [];
  list.innerHTML = '';
  if (!notes.length) {
    list.innerHTML = '<p class="wish-mine-empty">你还没放过纸星星<br>折一颗愿望或祝福, 放进瓶子里吧 ✨</p>';
  }
  notes.forEach(n => {
    const item = document.createElement('div');
    item.className = 'wish-mine-item';
    const star = document.createElement('span');
    star.className = 'wish-mine-star';
    star.innerHTML = wishStarSvg(n.color, 30);
    const body = document.createElement('div');
    body.className = 'wish-mine-body';
    const p = document.createElement('p');
    p.className = 'wish-mine-content';
    p.textContent = n.content || (n.voice ? '💌 这颗星星里装着一段声音' : '');
    body.appendChild(p);
    if (n.voice) {          // v693: 重听自己录的语音
      const pv = document.createElement('button');
      pv.type = 'button';
      pv.className = 'wish-voice-play mine';
      pv.textContent = '▶ 听我的声音';
      pv.addEventListener('click', function () {
        wishVoicePlaySrc(n.voice, this, '▶ 听我的声音');   // v708
      });
      body.appendChild(pv);
    }
    if (n.reply) {
      const r = document.createElement('div');
      r.className = 'wish-mine-reply';
      const head = document.createElement('span');
      head.className = 'wish-mine-reply-head';
      head.textContent = '💌 有缘人的回话 · 来自 ' + (n.reply_by_name || '匿名疗友') + (n.reply_by_code ? '(疗友号 ' + n.reply_by_code + ')' : '');
      const rt = document.createElement('span');
      rt.textContent = n.reply;
      r.appendChild(head);
      r.appendChild(rt);
      body.appendChild(r);
    } else if (n.drawn) {
      const r = document.createElement('p');
      r.className = 'wish-mine-date';
      r.textContent = '有缘人正拿着这颗星星读…';
      body.appendChild(r);
    } else {
      const r = document.createElement('p');
      r.className = 'wish-mine-date';
      r.textContent = '还在瓶子里等一位有缘人…';
      body.appendChild(r);
    }
    /* v713: 撤回入口。
       · 普通疗友: 只在这颗还没被抽走过时出现(被读过就留作纪念, 云端也拦)
       · 群主: 一直出现 —— 走 ma_wish_owner_revoke, 被抽过也能强制撤(测试号抽过的烂账清掉) */
    const owner = isOwnerUser();
    if (owner || !n.drawn) {
      const rv = document.createElement('button');
      rv.type = 'button';
      rv.className = 'wish-revoke';
      rv.textContent = '↩ 撤回这颗星星';
      rv.addEventListener('click', async () => {
        if (rv.dataset.arm !== '1') {
          rv.dataset.arm = '1';
          rv.textContent = '再点一次确认撤回';
          setTimeout(() => { if (rv.isConnected) { rv.dataset.arm = ''; rv.textContent = '↩ 撤回这颗星星'; } }, 3000);
          return;
        }
        rv.disabled = true;
        rv.textContent = '撤回中…';
        try {
          const fn = owner ? 'ma_wish_owner_revoke' : 'ma_wish_revoke';
          const { data, error } = await sb.rpc(fn, { p_note_id: n.id });
          if (error) throw error;
          if (data && data.err === 'not_mine') throw new Error('这颗星星不在你名下');
          // 瓶里同步减一颗(优先减同色, 没有就减最后一颗)
          let idx = wish.stars.findIndex(s => s.color === n.color);
          if (idx < 0) idx = wish.stars.length - 1;
          if (idx >= 0) wish.stars.splice(idx, 1);
          toast('纸星星收回来啦 ✨');
          wishShowMine();          // 重渲染清单
          refreshWishState(true);  // 总数/按钮刷新
        } catch (e) {
          if (wishRpcMissing(e)) toast('群主正在开瓶, 马上就好…');
          else {
            const msg = (e && e.message) || '';
            toast(/drawn/i.test(msg) ? '这颗星星已经被抽走, 撤不回啦 🌙' : '撤回没成功, 稍后再试~');
          }
          rv.disabled = false;
          rv.dataset.arm = '';
          rv.textContent = '↩ 撤回这颗星星';
        }
      });
      body.appendChild(rv);
    }
    const d = document.createElement('p');
    d.className = 'wish-mine-date';
    const dd = new Date(n.created_at);
    if (!isNaN(dd.getTime())) {
      d.textContent = '投于 ' + dd.getFullYear() + '-' + String(dd.getMonth() + 1).padStart(2, '0') + '-' + String(dd.getDate()).padStart(2, '0');
      body.appendChild(d);
    }
    item.appendChild(star);
    item.appendChild(body);
    list.appendChild(item);
  });
  wishShowModal('wishMineModal');
}

/* ---------- 绑定 ---------- */
/* v699: 群主测试特权 —— 点罐里任意一颗纸星星直接抽那颗; 点大彩虹星强制触发幸运星 */
function wishJarTap(ev) {
  if (!isOwnerUser() || !wish.open || wish.busy) return;
  if (document.querySelector('.wish-modal:not([hidden])')) return;   // 弹窗开着不响应
  const rect = ev.currentTarget.getBoundingClientRect();
  const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
  if (wish.luckyStar) {
    const L = wish.luckyStar;
    if ((x - L.x) * (x - L.x) + (y - L.y) * (y - L.y) <= 30 * 30) {
      toast('🎯 强制触发幸运星…');
      wishDraw(null, true);
      return;
    }
  }
  let best = -1, bd = 24 * 24;
  wish.stars.forEach((s, i) => {
    const d = (x - s.x) * (x - s.x) + (y - s.y) * (y - s.y);
    if (d < bd) { bd = d; best = i; }
  });
  if (best < 0) return;
  const ids = (wish.state && wish.state.ids) || [];
  const nid = ids[best];
  if (nid == null) { toast('云端还没升级, 跑完 supabase-v699 SQL 就能指定抽啦'); return; }
  toast('🎯 指定抽第 ' + (best + 1) + ' 颗…');
  wishDraw(nid, false);
}

function bindWishJar() {
  /* v732: 星星瓶入口改成顶部导航「星星瓶」(独立页面 #wish), 社区里那个按钮已经删掉,
     所以这里不再有 cmWishEntry, 只做页面内部按钮的绑定 */
  const wishRoot = document.getElementById('wishOverlay');
  if (!wishRoot) return;   // 页面结构没加载完 → 安全退出
  /* v730: ✕ 同时挂 pointerdown —— 手机上有时候 click 会被外层手势/滚动吞掉,
     而 pointerdown 一定先到; closeWish 本身幂等, 两次调用无副作用 */
  const wishCloseBtn = document.getElementById('wishClose');
  wishCloseBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); closeWish(); });
  wishCloseBtn.addEventListener('click', e => { e.stopPropagation(); closeWish(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && wish.open) closeWish();
  });
  /* v709: 不能把 click 事件对象直接传给 wishDraw —— 它的第一个参数是 forceNote(bigint),
     事件对象序列化成 {"isTrusted":false} 会让 RPC 报 invalid input syntax for type bigint */
  document.getElementById('wishDrawBtn').addEventListener('click', () => wishDraw());
  const wishGhostBtn = document.getElementById('wishGhostBtn');
  if (wishGhostBtn) {
    wishGhostBtn.addEventListener('click', wishCleanOpen);   // v713: 群主清理台(先看清单再勾)
    wishGhostBtn.hidden = !isOwnerUser();
  }
  const wcCancel = document.getElementById('wishCleanCancel');
  if (wcCancel) wcCancel.addEventListener('click', wishHideModals);
  const wcStars = document.getElementById('wishCleanStars');
  if (wcStars) wcStars.addEventListener('click', () => wishCleanRun(false));
  const wcAll = document.getElementById('wishCleanAll');
  if (wcAll) wcAll.addEventListener('click', () => wishCleanRun(true));
  document.getElementById('wishWriteBtn').addEventListener('click', openWishWrite);
  document.getElementById('wishMineBtn').addEventListener('click', wishShowMine);
  document.getElementById('wishJar').addEventListener('click', wishJarTap);          // v699: 群主点星星抽指定
  document.getElementById('wishLuckyBtn').addEventListener('click', wishShowLuckyList);   // v699
  document.getElementById('wishLuckyClose').addEventListener('click', wishHideModals);    // v699
  document.getElementById('luckyPopClose').addEventListener('click', wishLuckyClose);     // v699
  /* v730: 庆祝层是全屏的, 会把底下的 ✕ 盖住 —— 用户点"✕ 的位置"其实点在庆祝层背景上,
     结果只关了庆祝层、瓶子还开着, 体感就是"关不上"。现在点庆祝层任意空白处 = 整瓶关掉 */
  document.getElementById('luckyPop').addEventListener('click', e => {                    // v699
    if (e.target === e.currentTarget) closeWish();
  });
  document.getElementById('wishLotteryBtn').addEventListener('click', wishLottery);
  document.getElementById('wishSubmitBtn').addEventListener('click', wishSubmit);
  document.getElementById('wishVoiceBtn').addEventListener('click', wishVoiceToggle);   // v693
  document.getElementById('wishVoicePlay').addEventListener('click', function () {      // v693: 试听刚录的
    wishVoicePlaySrc(wishVoice.url, this, '▶ 试听');   // v708: 开关/互斥/按钮复位都在播放器里
  });
  document.getElementById('wishVoiceDel').addEventListener('click', wishVoiceReset);    // v693: 删掉重录
  document.getElementById('wishViewVoice').addEventListener('click', function () {      // v693: 听抽到的语音
    wishVoicePlaySrc(this.dataset.src, this, '▶ 听 TA 的声音');   // v708
  });
  document.getElementById('wishWriteCancel').addEventListener('click', wishHideModals);
  document.getElementById('wishWriteText').addEventListener('input', e => {
    document.getElementById('wishWriteCount').textContent = e.target.value.length + ' / 150';
  });
  document.getElementById('wishReplySendBtn').addEventListener('click', wishReplySend);
  /* v736: 「先放着」按钮已删(用户钦定 —— 只留"放回去/写完回话送回"两条路) */
  document.getElementById('wishReleaseBtn').addEventListener('click', wishReleaseBack);   // v710: 不回话直接放回瓶子
  document.getElementById('wishReplyText').addEventListener('input', e => {
    document.getElementById('wishReplyCount').textContent = e.target.value.length + ' / 150';
  });
  document.getElementById('wishViewFind').addEventListener('click', wishGoFind);
  document.getElementById('wishMineClose').addEventListener('click', wishHideModals);
  window.addEventListener('resize', () => {
    if (!wish.open) return;
    wish.stars = []; wish.sparks = [];
    wishResize();
    wishLayoutStars();
    wishSeedSparkles(14);
  });
}

