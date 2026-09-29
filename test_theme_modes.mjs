import puppeteer from 'puppeteer-core';

const ARTIFACT_DIR = '/home/jesus/.gemini/antigravity-ide/brain/60743d3c-8847-4a45-90dc-a50bf8bed124';

async function testThemes() {
  console.log('🚀 Probando Modo Oscuro y Modo Claro de Navira...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true });

  // 1. Probar Login en Modo Oscuro (por defecto)
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${ARTIFACT_DIR}/val_navira_login_dark.png` });

  // 2. Iniciar sesión como tester
  await page.type('input[type="email"]', 'tester.vortex@navira.app');
  await page.type('input[type="password"]', 'MarioChata1998.');
  
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Ingresar')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 3000));

  // Screenshot de Home en Modo Oscuro
  await page.screenshot({ path: `${ARTIFACT_DIR}/val_navira_home_dark.png` });

  // 3. Ir a Perfil y cambiar a Modo Claro
  await page.goto('http://localhost:5173/perfil', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/val_navira_perfil_dark.png` });

  // Cambiar a Modo Claro usando la función global
  await page.evaluate(() => {
    localStorage.setItem('navira_theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    window.dispatchEvent(new CustomEvent('navira-theme-change', { detail: 'light' }));
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${ARTIFACT_DIR}/val_navira_perfil_light.png` });

  // 4. Ir a Home en Modo Claro
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/val_navira_home_light.png` });

  // 5. Ir a Configuración en Modo Claro
  await page.goto('http://localhost:5173/configuracion', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/val_navira_configuracion_light.png` });

  // 6. Ir a Calculadora en Modo Claro
  await page.goto('http://localhost:5173/calculadora', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${ARTIFACT_DIR}/val_navira_calculadora_light.png` });

  await browser.close();
  console.log('🎉 Validación de Modo Oscuro y Modo Claro completada exitosamente.');
}

testThemes().catch(console.error);
