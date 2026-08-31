/* v46: 起泡胶越揉越大溢出罐子 + 指尖小圆变慢去英文 + 切肥皂任意方向自由切割 */
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:8765/index.html?v=v46';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  let pass = 0, fail = 0;
  const check = (cond, name, extra) => {
    if (cond) { console.log('  OK   ' + name + (extra ? ' (' + extra + ')' : '')); pass++; }
    else { console.log('  FAIL ' + name + (extra ? ' (' + extra + ')' : '')); fail++; }
  };
  // 画布逻辑坐标 → 页面坐标
  const toPage = (bbox) => (x, y) => ({
    x: bbox.x + (x / 560) * bbox.width,
    y: bbox.y + (y / 400) * bbox.height,
  });

  /* === 1) 指尖小圆: 变慢 + 去英文 === */
  console.log('[1] 指尖小圆');
  const code = await page.evaluate(async () => {
    const r = await fetch('script.js?v=v46');
    const s = await r.text();
    return {
      slow: s.includes('grow * 0.22'),
      noEn1: !s.includes('minutes pause'),
      noEn2: !s.includes('Follow the circle'),
      zh: s.includes('静 心 小 憩') && s.includes('把手指放到白圈里的小圆上'),
    };
  });
  check(code.slow, '源码: 变大速度放慢(0.22)');
  check(code.noEn1 && code.noEn2, '源码: 英文文案已移除');
  check(code.zh, '源码: 中文提示已就位');

  await page.click('a[href="#games"]');
  await page.waitForTimeout(400);
  await page.click('.game-card[data-game="taichi"]');
  await page.waitForTimeout(500);
  const tcTitle = await page.textContent('#gameTitle');
  check(tcTitle && tcTitle.includes('指尖小圆'), '打开指尖小圆', tcTitle);

  let bbox = await page.locator('#gameStage canvas').boundingBox();
  let P = toPage(bbox);
  // 从 (200,218) 横拖 300px → 手指停在 (500,218)
  await page.mouse.move(P(200, 218).x, P(200, 218).y);
  await page.mouse.down();
  for (let i = 1; i <= 30; i++) {
    const x = 200 + (300 / 30) * i;
    await page.mouse.move(P(x, 218).x, P(x, 218).y);
    await page.waitForTimeout(8);
  }
  await page.waitForTimeout(300);
  const dotPx = await page.evaluate(() => {
    const c = document.querySelector('#gameStage canvas');
    const g = c.getContext('2d');
    const d = g.getImageData(Math.round(500 * c.width / 560), Math.round(218 * c.height / 400), 1, 1).data;
    return [d[0], d[1], d[2]];
  });
  check(dotPx[2] - dotPx[0] > 40 && dotPx[1] > 140, '小圆跟到指尖(青蓝)', 'rgb=' + dotPx.join(','));
  const abovePx = await page.evaluate(() => {
    const c = document.querySelector('#gameStage canvas');
    const g = c.getContext('2d');
    const d = g.getImageData(Math.round(500 * c.width / 560), Math.round(143 * c.height / 400), 1, 1).data;
    return [d[0], d[1], d[2]];
  });
  // 300px 后 dotR≈64: 距指尖 75px 处仍是背景(旧公式会是 148 → 青蓝)
  check(abovePx[0] > 170, '变大速度放慢(75px 外还是背景)', 'rgb=' + abovePx.join(','));
  await page.screenshot({ path: 'shots-v46/01-taichi.png' });
  await page.mouse.up();
  await page.waitForTimeout(900);
  await page.click('#gameClose');
  await page.waitForTimeout(300);

  /* === 2) 切肥皂: 任意方向自由切割 === */
  console.log('[2] 切肥皂自由切割');
  await page.click('.game-card[data-game="soap"]');
  await page.waitForTimeout(500);
  const soapTitle = await page.textContent('#gameTitle');
  check(soapTitle && soapTitle.includes('切肥皂'), '打开切肥皂', soapTitle);

  bbox = await page.locator('#gameStage canvas').boundingBox();
  P = toPage(bbox);
  const st0 = await page.textContent('#gameStage .game-status');
  check(/还剩 \d+%/.test(st0.trim()), '初始状态显示剩余百分比', st0.trim());

  const prePx = await page.evaluate(() => {
    const c = document.querySelector('#gameStage canvas');
    const g = c.getContext('2d');
    const d = g.getImageData(Math.round(275 * c.width / 560), Math.round(154 * c.height / 400), 1, 1).data;
    return [d[0], d[1], d[2]];
  });

  // 斜切一刀: (250,55) → (300,255), 穿透整块皂(非垂直方向, 证明自由切割)
  await page.mouse.move(P(250, 55).x, P(250, 55).y);
  await page.mouse.down();
  for (let i = 1; i <= 40; i++) {
    const x = 250 + (50 / 40) * i;
    const y = 55 + (200 / 40) * i;
    await page.mouse.move(P(x, y).x, P(x, y).y);
    await page.waitForTimeout(8);
  }
  await page.mouse.up();
  await page.waitForTimeout(1200);

  const postPx = await page.evaluate(() => {
    const c = document.querySelector('#gameStage canvas');
    const g = c.getContext('2d');
    const d = g.getImageData(Math.round(275 * c.width / 560), Math.round(154 * c.height / 400), 1, 1).data;
    return [d[0], d[1], d[2]];
  });
  const dCut = Math.hypot(prePx[0] - postPx[0], prePx[1] - postPx[1], prePx[2] - postPx[2]);
  check(dCut > 60, '斜切一刀切开(切缝处不再是皂体)', '色差=' + dCut.toFixed(0) + ' pre=' + prePx.join(',') + ' post=' + postPx.join(','));

  const st1 = (await page.textContent('#gameStage .game-status')).trim();
  const n1 = parseInt((st1.match(/还剩 (\d+)%/) || [0, 100])[1], 10);
  check(n1 < 90, '切下大片(剩余明显下降)', st1);

  // 圈一个圆: 圈内形状脱离掉落
  const cx = 350, cy = 150, rr = 22;
  await page.mouse.move(P(cx + rr, cy).x, P(cx + rr, cy).y);
  await page.mouse.down();
  for (let loop = 0; loop < 2; loop++) {
    for (let i = 1; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      await page.mouse.move(P(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr).x, P(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr).y);
      await page.waitForTimeout(6);
    }
  }
  await page.mouse.up();
  await page.waitForTimeout(4000);   // 等片自由下落(headless rAF 节流时物理跑得慢)

  const st2 = (await page.textContent('#gameStage .game-status')).trim();
  const n2 = parseInt((st2.match(/还剩 (\d+)%/) || [0, 100])[1], 10);
  check(n2 < n1, '圈出的形状也切下来了(剩余再降)', st1 + ' → ' + st2);
  await page.screenshot({ path: 'shots-v46/02-soap-freecut.png' });

  // 掉落的片落进托盘: 沿托盘区域扫一遍, 找非木盘色
  const trayCheck = await page.evaluate(() => {
    const c = document.querySelector('#gameStage canvas');
    const g = c.getContext('2d');
    const wood = g.getImageData(Math.round(90 * c.width / 560), Math.round(330 * c.height / 400), 1, 1).data;
    let best = 0, bestXY = null;
    for (let y = 295; y <= 372; y += 3) {
      for (let x = 100; x <= 460; x += 4) {
        const d = g.getImageData(Math.round(x * c.width / 560), Math.round(y * c.height / 400), 1, 1).data;
        const dist = Math.hypot(d[0] - wood[0], d[1] - wood[1], d[2] - wood[2]);
        if (dist > best) { best = dist; bestXY = [x, y]; }
      }
    }
    return { best: best, bestXY: bestXY, wood: [wood[0], wood[1], wood[2]] };
  });
  check(trayCheck.best > 40, '切下的片掉进托盘', '最大色差=' + trayCheck.best.toFixed(0) + '@(' + (trayCheck.bestXY||[]).join(',') + ') vs 木盘 ' + trayCheck.wood.join(','));
  await page.click('#gameClose');
  await page.waitForTimeout(300);

  /* === 3) 起泡胶: 越揉越大, 溢出罐子 === */
  console.log('[3] 起泡胶膨胀溢出');
  await page.click('.game-card[data-game="maker"]');
  await page.waitForTimeout(500);
  const mkTitle = await page.textContent('#gameTitle');
  check(mkTitle && mkTitle.includes('史莱姆'), '打开 DIY 史莱姆', mkTitle);

  // 制作流程: 倒胶水 → 挑颜色(绿色, 好和背景区分) → 选起泡胶 → 搅拌 → 成型
  await page.click('#mkPour');
  await page.waitForTimeout(1800);
  await page.click('#mkPour');
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    document.querySelectorAll('#gameStage .st-dotc').forEach(b => { if (b.dataset.color === '#A8E6CF') b.click(); });
  });
  await page.waitForTimeout(200);
  await page.click('#mkNext');
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    document.querySelectorAll('#gameStage .mk-type').forEach(b => { if (b.dataset.mat === 'foam') b.click(); });
  });
  await page.waitForTimeout(200);
  await page.click('#mkNext');
  await page.waitForTimeout(400);

  // 搅拌: BOWL(280,216) 转圈
  bbox = await page.locator('#gameStage canvas').boundingBox();
  P = toPage(bbox);
  await page.mouse.move(P(280 + 40, 216).x, P(280 + 40, 216).y);
  await page.mouse.down();
  for (let i = 1; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 6;
    await page.mouse.move(P(280 + Math.cos(a) * 42, 216 + Math.sin(a) * 42).x, P(280 + Math.cos(a) * 42, 216 + Math.sin(a) * 42).y);
    await page.waitForTimeout(6);
  }
  await page.mouse.up();
  await page.waitForTimeout(2600);   // 成型 2.3s 自动进 play

  // 开盖
  await page.mouse.click(P(280, 200).x, P(280, 200).y);
  await page.waitForTimeout(900);

  // 揉捏起泡胶: 罐心 (280,200) 疯狂转圈
  await page.mouse.move(P(280 + 45, 200).x, P(280 + 45, 200).y);
  await page.mouse.down();
  for (let i = 1; i <= 560; i++) {
    const a = (i / 560) * Math.PI * 28;    // 14 圈
    await page.mouse.move(P(280 + Math.cos(a) * 46, 200 + Math.sin(a) * 46).x, P(280 + Math.cos(a) * 46, 200 + Math.sin(a) * 46).y);
    await page.waitForTimeout(6);
  }
  await page.mouse.up();
  await page.waitForTimeout(2800);   // 等弹簧撑开到位

  const foamPx = await page.evaluate(() => {
    const c = document.querySelector('#gameStage canvas');
    const g = c.getContext('2d');
    const px = (x, y) => {
      const d = g.getImageData(Math.round(x * c.width / 560), Math.round(y * c.height / 400), 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    return { mid: px(280, 30), out: px(280, 2), far: px(60, 40) };
  });
  // 揉大后: (280,30) 离罐心 170px(初始半径仅~66) 被绿色泡沫盖住: g 是最大通道
  check(foamPx.mid[1] - foamPx.mid[0] >= 4 && foamPx.mid[1] - foamPx.mid[2] >= 3, '起泡胶越揉越大(罐内 170px 处已是泡沫)', 'rgb=' + foamPx.mid.join(','));
  // (280,2) 在罐口外(距罐心 198 > 罐半径 194) → 溢出罐子
  check(foamPx.out[1] - foamPx.out[0] >= 4 && foamPx.out[1] - foamPx.out[2] >= 3, '泡沫溢出罐子(罐口外也是泡沫)', 'rgb=' + foamPx.out.join(','));
  // 角落 (60,40) 距罐心 317 → 还是背景(没糊满整屏)
  check(foamPx.far[0] > 200 && foamPx.far[1] > 190, '没糊满整屏(角落仍是桌面)', 'rgb=' + foamPx.far.join(','));
  await page.screenshot({ path: 'shots-v46/03-foam-overflow.png' });
  await page.click('#gameClose');
  await page.waitForTimeout(300);

  /* === 4) 整体错误 === */
  console.log('[4] 错误统计');
  check(errors.length === 0, '无 JS 错误', errors.length ? errors[0] : '');

  console.log('======== v46 测试: ' + pass + ' 通过, ' + fail + ' 失败 ========');
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
