/* v45: 水晶钵完整播放 + 注入灵感一次性 + 魔法刷子卡片 + CTA 醒目 + 蒸馏瓶滴口对准/液体流动 */
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:8765/index.html?v=v45';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });

  // 预埋探针: 记录 AudioBufferSourceNode 的 start/stop 调度(验证整段播放)
  await page.addInitScript(() => {
    window.__srcCalls = [];
    const os = AudioBufferSourceNode.prototype.start;
    const op = AudioBufferSourceNode.prototype.stop;
    AudioBufferSourceNode.prototype.start = function (t) {
      window.__srcCalls.push({ dur: this.buffer ? this.buffer.duration : 0, t0: t || 0 });
      return os.apply(this, arguments);
    };
    AudioBufferSourceNode.prototype.stop = function (t) {
      const c = window.__srcCalls[window.__srcCalls.length - 1];
      if (c) c.t1 = t;
      return op.apply(this, arguments);
    };
  });

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  let pass = 0, fail = 0;
  const check = (cond, name, extra) => {
    if (cond) { console.log('  OK   ' + name + (extra ? ' (' + extra + ')' : '')); pass++; }
    else { console.log('  FAIL ' + name + (extra ? ' (' + extra + ')' : '')); fail++; }
  };

  /* === 1) CTA 醒目 === */
  console.log('[1] 注入灵感按钮醒目度');
  const cta = await page.evaluate(() => {
    const el = document.querySelector('.brand-sub');
    const cs = getComputedStyle(el);
    return {
      radius: cs.borderRadius,
      bg: cs.backgroundImage,
      fs: cs.fontSize,
      shadow: cs.boxShadow,
    };
  });
  check(cta.radius === '999px', 'CTA 是药丸按钮', 'radius=' + cta.radius);
  check(cta.bg.includes('linear-gradient'), 'CTA 有渐变底色', cta.bg.slice(0, 60) + '...');
  check(parseFloat(cta.fs) >= 15, 'CTA 字号 ≥15px', 'fs=' + cta.fs);
  check(cta.shadow.includes('rgba'), 'CTA 有投影辉光', 'shadow ok');

  /* === 2) 水晶钵完整播放 + 一次性按钮 + 魔法卡片 === */
  console.log('[2] 注入灵感: 整段音效 + 卡片');
  await page.evaluate(() => new Promise(r => setTimeout(r, 4000)));   // 等预载
  const bowlReady = await page.evaluate(() => !!(window._bowl && window._bowl.buf));
  check(bowlReady, 'bowl.wav 已预载');

  await page.click('.logo-trigger');
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  const chime = await page.evaluate(() => {
    const calls = window.__srcCalls.filter(c => c.dur > 4);
    return calls.length ? calls[calls.length - 1] : null;
  });
  check(!!chime, '水晶钵已开始播放', 'dur=' + (chime ? chime.dur.toFixed(2) + 's' : 'null'));
  // 完整播放: stop - start >= buffer.duration (不再 0.96 截断)
  check(chime && chime.t1 != null && (chime.t1 - chime.t0) >= chime.dur,
    '音效调度为整段播放(无截断)',
    chime ? (chime.t1 - chime.t0).toFixed(2) + 's ≥ ' + chime.dur.toFixed(2) + 's' : '');
  const chimeCount = await page.evaluate(() => window.__srcCalls.filter(c => c.dur > 4).length);

  // 动画 ~4.6s + 卡片 4.7s 弹出, 文字 1.6s 后浮现, 按钮 2.25s 后才出现 → 等卡片完全展开(8.0s)
  await page.evaluate(() => new Promise(r => setTimeout(r, 8000)));
  const cardState = await page.evaluate(() => {
    const ov = document.getElementById('magicCardOverlay');
    const btn = ov ? ov.querySelector('.mc-btn') : null;
    return {
      open: !!ov && ov.classList.contains('open'),
      visible: !!ov && getComputedStyle(ov).opacity === '1',
      text: ov ? (ov.querySelector('.mc-text') || {}).textContent || '' : '',
      hasBrush: !!ov && !!ov.querySelector('.mc-brush'),
      btn: !!ov && !!ov.querySelector('.mc-btn'),
      btnOpacity: btn ? parseFloat(getComputedStyle(btn).opacity) : 0,
      btnText: btn ? (btn.textContent || '').replace(/\s+/g, ' ').trim() : '',
    };
  });
  check(cardState.open, '动画后弹出魔法卡片');
  check(cardState.visible, '卡片可见');
  check(cardState.hasBrush, '卡片上有魔法刷子');
  check(cardState.text.includes('亲爱的小疗友') && cardState.text.includes('神秘旅行'), '卡片文案正确', cardState.text.slice(0, 24) + '...');
  check(cardState.btn, '卡片有「点击开启」按钮');
  check(cardState.btnOpacity > 0.9, '「点击开启」按钮完全可见', 'opacity=' + cardState.btnOpacity);
  check(cardState.btnText.replace(/\s|\u00a0/g, '').includes('点击开启'), '按钮文案是「点击开启」', cardState.btnText);
  await page.screenshot({ path: 'shots-v45/01-magic-card.png' });

  // 点「点击开启」→ 卡片消失(按钮有呼吸动画, 用 force 跳过稳定等待)
  await page.locator('.mc-btn').click({ force: true });
  await page.evaluate(() => new Promise(r => setTimeout(r, 700)));
  const cardClosed = await page.evaluate(() => {
    const ov = document.getElementById('magicCardOverlay');
    return !!ov && !ov.classList.contains('open');
  });
  check(cardClosed, '点开启后卡片消失');

  // 再次点击注入灵感: 无反应(不再播放/不跳转)
  await page.click('.logo-trigger');
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  const reState = await page.evaluate(() => ({
    chimeCount: window.__srcCalls.filter(c => c.dur > 4).length,
    used: document.querySelector('.logo-trigger').classList.contains('is-used'),
    shopActive: document.querySelector('#shop').classList.contains('active'),
  }));
  check(reState.used, '按钮进入已使用状态(is-used)');
  check(reState.chimeCount === chimeCount, '重复点击不再播放音效', chimeCount + ' 次');
  check(!reState.shopActive, '重复点击不跳转购买页');

  /* === 3) 蒸馏瓶: 滴口对准 + 液体沿导管流动 === */
  console.log('[3] 蒸馏瓶升级');
  await page.click('a[href="#games"]');
  await page.waitForTimeout(400);
  await page.click('.game-card[data-game="still"]');
  await page.waitForTimeout(500);

  const stillTitle = await page.textContent('#gameTitle');
  check(stillTitle && stillTitle.includes('精油蒸馏'), '打开精油蒸馏', stillTitle);

  // 放薰衣草花瓣 + 点火
  await page.evaluate(() => {
    const chips = document.querySelectorAll('#gameStage .st-chip');
    chips[0].click();                                    // 薰衣草
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const chips = document.querySelectorAll('#gameStage .st-chip');
    for (const c of chips) if (c.textContent.includes('点火')) c.click();
  });
  await page.waitForTimeout(300);

  // 滴口玻璃弯管存在: (422,193) 管芯高亮比旁边 (408,193) 亮
  const elbow = await page.evaluate(() => {
    const c = document.querySelector('#gameStage canvas');
    const g = c.getContext('2d');
    const px = (x, y) => {
      const d = g.getImageData(Math.round(x * c.width / 560), Math.round(y * c.height / 392), 1, 1).data;
      return (d[0] + d[1] + d[2]) / 3;
    };
    return { tube: px(422, 193), side: px(406, 193), tip: px(422, 203) };
  });
  check(elbow.tube > elbow.side + 12, '滴口弯管正对接收瓶上方', 'tube=' + elbow.tube.toFixed(0) + ' vs side=' + elbow.side.toFixed(0));

  // 轮询 5s: ①精油珠流过冷凝管(金色辉光) ②油滴从滴口正落入瓶口(x≈422)
  const flow = await page.evaluate(() => new Promise(resolve => {
    const c = document.querySelector('#gameStage canvas');
    const g = c.getContext('2d');
    const isGold = (d) => d[0] > 210 && d[1] > 175 && d[2] < 200 && d[0] - d[2] > 40;
    let beadSeen = false, dropSeen = false;
    const t0 = performance.now();
    (function poll() {
      const done = () => resolve({ beadSeen, dropSeen });
      if (performance.now() - t0 > 5200) return done();
      // 冷凝管段找流动精油珠
      for (let x = 250; x <= 396 && !beadSeen; x += 4) {
        const y = 158 + (x - 232) * (196 - 158) / (398 - 232);
        const d = g.getImageData(Math.round(x * c.width / 560), Math.round(y * c.height / 392), 1, 1).data;
        if (isGold(d)) beadSeen = true;
      }
      // 滴口正下方找下落油滴(x=422±4, y 208-226)
      for (let y = 208; y <= 226 && !dropSeen; y += 2) {
        for (let dx = -4; dx <= 4; dx += 2) {
          const d = g.getImageData(Math.round((422 + dx) * c.width / 560), Math.round(y * c.height / 392), 1, 1).data;
          if (isGold(d)) { dropSeen = true; break; }
        }
      }
      if (beadSeen && dropSeen) return done();
      setTimeout(poll, 45);
    })();
  }));
  check(flow.beadSeen, '液体沿冷凝管流动可见(金色精油珠)');
  check(flow.dropSeen, '油滴从滴口正落入接收瓶口');
  await page.screenshot({ path: 'shots-v45/02-still-flow.png' });

  // 等全程蒸馏完成(5 滴 + 收尾 ~10s) → 架上出现成品小瓶(紫色液体 b>r)
  await page.evaluate(() => new Promise(r => setTimeout(r, 6500)));
  const shelf = await page.evaluate(() => {
    const c = document.querySelector('#gameStage canvas');
    const g = c.getContext('2d');
    const px = (x, y) => {
      const d = g.getImageData(Math.round(x * c.width / 560), Math.round(y * c.height / 392), 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    return { p: px(452, 312), q: px(452, 320) };
  });
  check((shelf.p[2] > shelf.p[0] || shelf.q[2] > shelf.q[0]), '蒸好后架上出现精油成品瓶', 'rgb=' + shelf.p.join(',') + ' / ' + shelf.q.join(','));
  await page.screenshot({ path: 'shots-v45/03-still-finished.png' });

  // 源码级验证(v45 关键标记)
  const code = await page.evaluate(async () => {
    const r = await fetch('script.js?v=v45');
    const s = await r.text();
    return {
      fullPlay: s.includes('linearRampToValueAtTime(0.85, t + 0.03)') && !s.includes('_bowl.buf.duration * 0.96'),
      tip: s.includes('const TIP  = { x: 422'),
      tubePoint: s.includes('function tubePoint'),
      onceOnly: s.includes("trigger.dataset.charged = '1'"),
    };
  });
  check(code.fullPlay, '源码: 整段播放包络(30ms 防爆音)');
  check(code.tip && code.tubePoint, '源码: TIP 常量 + tubePoint 路径');
  check(code.onceOnly, '源码: 注入灵感一次性守卫');

  await page.click('#gameClose');
  await page.waitForTimeout(300);

  /* === 4) 整体错误 === */
  console.log('[4] 错误统计');
  check(errors.length === 0, '无 JS 错误', errors.length ? errors[0] : '');

  console.log('======== v45 测试: ' + pass + ' 通过, ' + fail + ' 失败 ========');
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
