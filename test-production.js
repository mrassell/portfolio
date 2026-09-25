const puppeteer = require('puppeteer');
const fs = require('fs');

async function waitForStylesLoaded(page) {
  // Wait for stylesheet to load and any element to have computed styles
  await page.waitForFunction(() => {
    const divs = document.querySelectorAll('div');
    for (let div of divs) {
      const bgColor = getComputedStyle(div).backgroundColor;
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        return true; // Found a div with background color
      }
    }
    return false;
  }, { timeout: 15000 });
  
  // Return the background color of the main element
  const bgColor = await page.evaluate(() => {
    const main = document.querySelector('main') || document.querySelector('div');
    return getComputedStyle(main).backgroundColor;
  });
  console.log(`  Styles loaded - main element background: ${bgColor}`);
  return bgColor;
}

async function countVisibleH1s(page) {
  return await page.evaluate(() => {
    const h1s = document.querySelectorAll('h1');
    let visible = 0;
    h1s.forEach(h1 => {
      if (h1.offsetParent !== null) {
        visible++;
      }
    });
    return visible;
  });
}

async function captureConfettiWithVerification(page, outputPath) {
  console.log(`  Attempting to score and capture confetti...`);
  
  // First check if game elements exist
  const gameExists = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    const ball = svg?.querySelector('circle');
    return {
      hasSvg: !!svg,
      hasBall: !!ball,
      ballRadius: ball?.getAttribute('r'),
      svgVisible: svg ? (svg.getBoundingClientRect().width > 0) : false
    };
  });
  
  console.log(`  Game elements:`, gameExists);
  
  if (!gameExists.hasSvg || !gameExists.hasBall) {
    console.log(`  ✗ Game elements not found`);
    return { scored: false, pixelCount: 0 };
  }
  
  // Script a shot with better targeting
  const scored = await page.evaluate(async () => {
    const svg = document.querySelector('svg');
    // Find the draggable ball (the one with pointer events)
    const circles = svg.querySelectorAll('circle');
    let ball = null;
    for (let c of circles) {
      if (c.getAttribute('r') === '20' && c.style.cursor) {
        ball = c;
        break;
      }
    }
    
    if (!ball) {
      // Fallback: find any circle with r=20
      ball = svg.querySelector('circle[r="20"]');
    }
    
    if (!ball) return false;

    const svgRect = svg.getBoundingClientRect();
    const ballCx = parseFloat(ball.getAttribute('cx'));
    const ballCy = parseFloat(ball.getAttribute('cy'));
    const scaleX = svgRect.width / 480;
    const scaleY = svgRect.height / 500;
    
    const startX = svgRect.left + (ballCx * scaleX);
    const startY = svgRect.top + (ballCy * scaleY);
    
    // Target closer to the hoop center for better chance
    const targetX = svgRect.left + (340 * scaleX);
    const targetY = svgRect.top + (155 * scaleY); // Aim right at rim
    
    ball.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true, cancelable: true, view: window,
      clientX: startX, clientY: startY,
      pointerId: 1, pointerType: 'mouse', isPrimary: true
    }));
    
    await new Promise(r => setTimeout(r, 150));
    
    // Faster swipe for more velocity
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      const x = startX + (targetX - startX) * t;
      const y = startY + (targetY - startY) * t - 30 * Math.sin(t * Math.PI);
      ball.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true, cancelable: true, view: window,
        clientX: x, clientY: y,
        pointerId: 1, pointerType: 'mouse', isPrimary: true
      }));
      await new Promise(r => setTimeout(r, 10));
    }
    
    ball.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true, cancelable: true, view: window,
      clientX: targetX, clientY: targetY - 15,
      pointerId: 1, pointerType: 'mouse', isPrimary: true
    }));
    
    // Wait longer for physics
    await new Promise(r => setTimeout(r, 1500));
    
    const scoreElements = document.querySelectorAll('div');
    let score = 0;
    for (let el of scoreElements) {
      const text = el.textContent;
      if (text && text.includes('Score:')) {
        const match = text.match(/Score:\s*(\d+)/);
        if (match) score = parseInt(match[1]);
        break;
      }
    }
    
    return score > 0;
  });
  
  if (!scored) {
    console.log(`  ✗ Did not score - cannot verify confetti`);
    await page.screenshot({ path: outputPath }); // Save anyway for debugging
    return { scored: false, pixelCount: 0 };
  }
  
  console.log(`  ✓ Scored! Now checking for confetti pixels...`);
  
  // Check for confetti pixels in multiple frames
  let maxPixels = 0;
  let bestFrameNum = 0;
  
  for (let frame = 0; frame < 15; frame++) {
    await new Promise(r => setTimeout(r, 40));
    
    const result = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { pixels: 0, canvasInfo: 'no canvas found' };
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return { pixels: 0, canvasInfo: 'no context' };
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let nonTransparent = 0;
        
        for (let i = 3; i < imageData.data.length; i += 4) {
          if (imageData.data[i] > 0) {
            nonTransparent++;
          }
        }
        
        return {
          pixels: nonTransparent,
          canvasInfo: `${canvas.width}x${canvas.height}, style: ${canvas.style.zIndex || 'no z-index'}`
        };
      } catch (e) {
        return { pixels: 0, canvasInfo: `error: ${e.message}` };
      }
    });
    
    if (frame === 0) {
      console.log(`  Canvas: ${result.canvasInfo}`);
    }
    
    if (result.pixels > maxPixels) {
      maxPixels = result.pixels;
      bestFrameNum = frame;
      await page.screenshot({ path: outputPath });
    }
  }
  
  console.log(`  Best frame: ${bestFrameNum} with ${maxPixels} non-transparent pixels`);
  
  if (maxPixels === 0) {
    console.log(`  ⚠️  WARNING: No confetti pixels detected in canvas`);
  } else {
    console.log(`  ✓ Saved ${outputPath} with visible confetti`);
  }
  
  return { scored: true, pixelCount: maxPixels };
}

async function testProductionBuild() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log('Testing PRODUCTION build at http://localhost:3002\n');

  // Test 1: Mobile 390px
  console.log('=== Test 1: Mobile 390px ===');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await mobilePage.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
  
  const mobileBgColor = await waitForStylesLoaded(mobilePage);
  const mobileH1Count = await countVisibleH1s(mobilePage);
  const mobileScrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
  
  console.log(`  scrollWidth: ${mobileScrollWidth}px`);
  console.log(`  Visible h1 count: ${mobileH1Count} (expected: 1)`);
  
  await mobilePage.screenshot({ 
    path: '/opt/cursor/artifacts/mobile-390-real.png',
    fullPage: false 
  });
  console.log(`  ✓ Saved mobile-390-real.png\n`);
  
  // Mobile confetti
  console.log('=== Test 2: Mobile 390px Confetti ===');
  const mobileConfetti = await captureConfettiWithVerification(
    mobilePage,
    '/opt/cursor/artifacts/mobile-390-confetti.png'
  );
  console.log();
  
  await mobilePage.close();

  // Test 2: Desktop 1280x800
  console.log('=== Test 3: Desktop 1280x800 ===');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await desktopPage.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
  
  const desktopBgColor = await waitForStylesLoaded(desktopPage);
  const desktopH1Count = await countVisibleH1s(desktopPage);
  const desktopScrollWidth = await desktopPage.evaluate(() => document.documentElement.scrollWidth);
  
  console.log(`  scrollWidth: ${desktopScrollWidth}px`);
  console.log(`  Visible h1 count: ${desktopH1Count} (expected: 1)`);
  
  await desktopPage.screenshot({ 
    path: '/opt/cursor/artifacts/desktop-1280.png',
    fullPage: false 
  });
  console.log(`  ✓ Saved desktop-1280.png\n`);
  
  // Desktop confetti
  console.log('=== Test 4: Desktop 1280x800 Confetti ===');
  const desktopConfetti = await captureConfettiWithVerification(
    desktopPage,
    '/opt/cursor/artifacts/desktop-confetti-real.png'
  );
  console.log();
  
  await desktopPage.close();
  await browser.close();

  // Summary
  console.log('=== SUMMARY ===');
  console.log(`\nMobile (390px):`);
  console.log(`  Background color: ${mobileBgColor}`);
  console.log(`  scrollWidth: ${mobileScrollWidth}px (expected: 390)`);
  console.log(`  Visible h1s: ${mobileH1Count} (expected: 1)`);
  console.log(`  Scored: ${mobileConfetti.scored}`);
  console.log(`  Confetti pixels: ${mobileConfetti.pixelCount}`);
  
  console.log(`\nDesktop (1280x800):`);
  console.log(`  Background color: ${desktopBgColor}`);
  console.log(`  scrollWidth: ${desktopScrollWidth}px`);
  console.log(`  Visible h1s: ${desktopH1Count} (expected: 1)`);
  console.log(`  Scored: ${desktopConfetti.scored}`);
  console.log(`  Confetti pixels: ${desktopConfetti.pixelCount}`);
  
  // Check for failures
  const failures = [];
  if (mobileScrollWidth !== 390) failures.push('Mobile scrollWidth mismatch');
  if (mobileH1Count !== 1) failures.push(`Mobile has ${mobileH1Count} visible h1s, expected 1`);
  if (desktopH1Count !== 1) failures.push(`Desktop has ${desktopH1Count} visible h1s, expected 1`);
  if (mobileConfetti.pixelCount === 0 && mobileConfetti.scored) failures.push('Mobile confetti has no pixels');
  if (desktopConfetti.pixelCount === 0 && desktopConfetti.scored) failures.push('Desktop confetti has no pixels');
  
  if (failures.length > 0) {
    console.log(`\n❌ FAILURES:`);
    failures.forEach(f => console.log(`  - ${f}`));
    process.exit(1);
  } else {
    console.log(`\n✅ ALL CHECKS PASSED`);
  }
}

testProductionBuild().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
