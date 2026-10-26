import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');

async function run() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920, deviceScaleFactor: 2 });

  // 1. Clear session and open Role Login Page
  console.log('1. Capturing Role Login Portal...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_login_portal.png') });

  // 2. Student & Parent Live Tracker
  console.log('2. Capturing Parent Live Tracker...');
  await page.evaluate(() => {
    localStorage.setItem(
      'schoolroute_tn_active_role_clean_v7',
      JSON.stringify({
        role: 'student_parent',
        name: 'Student 1',
        id: 'STU-101',
        title: 'Student 1 • 10th Standard A',
        busId: 'BUS-14A',
        schoolName: 'Government Higher Secondary School',
        routeNumber: '14A (School Route)',
        stopName: 'Morappur Bus Stand',
        phone: '73059 40480',
        district: 'Tamil Nadu',
      })
    );
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_parent_live_tracker.png') });

  // 3. AIS-140 Panic SOS Modal
  console.log('3. Capturing AIS-140 Panic SOS Modal...');
  try {
    const sosButton = await page.$('button:has-text("SOS"), button:has-text("Report Concern"), button:has-text("EMERGENCY")');
    if (sosButton) {
      await sosButton.click();
    } else {
      // Find button by text content
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find((b) => b.innerText.includes('Report Transit Concern') || b.innerText.includes('SOS') || b.innerText.includes('Panic'));
        if (target) target.click();
      });
    }
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03_ais140_panic_modal.png') });

    // Close the modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[title="Close Modal"], button:has-text("✕")') ||
        Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('✕') || b.innerText.includes('Cancel'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));
  } catch (e) {
    console.warn('Modal capture warning:', e.message);
  }

  // 4. Digital Student Bus Pass
  console.log('4. Capturing Digital Student Bus Pass...');
  await page.evaluate(() => {
    const navButtons = Array.from(document.querySelectorAll('header button, nav button, div[role="tab"]'));
    const passBtn = navButtons.find((b) => b.innerText.includes('Digital Bus Pass') || b.innerText.includes('Bus Pass'));
    if (passBtn) passBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_student_bus_pass.png') });

  // 5. Interactive GPS Map
  console.log('5. Capturing Interactive GPS Map...');
  await page.evaluate(() => {
    const navButtons = Array.from(document.querySelectorAll('header button, nav button'));
    const mapBtn = navButtons.find((b) => b.innerText.includes('Interactive GPS Map') || b.innerText.includes('Route GPS Map'));
    if (mapBtn) mapBtn.click();
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_live_bus_map.png') });

  // 6. Bus Timetable
  console.log('6. Capturing Feeder Bus Timetable...');
  await page.evaluate(() => {
    const navButtons = Array.from(document.querySelectorAll('header button, nav button'));
    const ttBtn = navButtons.find((b) => b.innerText.includes('Timetable'));
    if (ttBtn) ttBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_bus_timetable.png') });

  // 7. Driver Console
  console.log('7. Capturing Driver Cabin Console...');
  await page.evaluate(() => {
    localStorage.setItem(
      'schoolroute_tn_active_role_clean_v7',
      JSON.stringify({
        role: 'driver',
        name: 'Driver 1',
        id: 'DRV-101',
        title: 'Driver (14A (School Route))',
        busId: 'BUS-14A',
        phone: '94432 10987',
        district: 'Central Feeder Depot',
      })
    );
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_driver_console.png') });

  // 8. Driver QR Pass Scanner Modal
  console.log('8. Capturing Driver QR Scanner Modal...');
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const scanBtn = btns.find((b) => b.innerText.includes('Scan Student Pass QR') || b.innerText.includes('Pass QR'));
      if (scanBtn) scanBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_driver_qr_scanner_modal.png') });

    // Close scanner modal
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('✕') || b.innerText.includes('Close'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));
  } catch (e) {
    console.warn('QR scanner modal capture warning:', e.message);
  }

  // 9. Arrival at School Gate & Real-time SMS Notification Banner
  console.log('9. Capturing School Arrival & SMS Push Notification...');
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const arriveBtn = btns.find((b) => b.innerText.includes('Mark Bus Arrived at School Gate') || b.innerText.includes('Arrived at School'));
      if (arriveBtn) arriveBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09_school_arrival_and_sms_banner.png') });
  } catch (e) {
    console.warn('Arrival capture warning:', e.message);
  }

  // 10. Admin Console (Student Management Desk)
  console.log('10. Capturing Admin Console - Students...');
  await page.evaluate(() => {
    localStorage.setItem(
      'schoolroute_tn_active_role_clean_v7',
      JSON.stringify({
        role: 'admin',
        name: 'District Transport Officer (DTO)',
        id: 'ADMIN-TNSTC-HQ',
        title: 'State Educational Transport Nodal Officer',
        department: 'Tamil Nadu State Transport Corporation (TNSTC) & School Education Dept',
        phone: '04342-260100',
        district: 'Statewide Oversight (Dharmapuri, Salem, Dindigul)',
      })
    );
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_admin_console_students.png') });

  // 11. Admin Console - Driver Assignments
  console.log('11. Capturing Admin Console - Driver Duty Assignments...');
  try {
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const assignTab = tabBtns.find((b) => b.innerText.includes('Duty Assignments') || b.innerText.includes('Assignments'));
      if (assignTab) assignTab.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '11_admin_driver_assignments.png') });
  } catch (e) {
    console.warn('Admin assignments capture warning:', e.message);
  }

  // 12. Admin Console - Grievance Redressal Desk
  console.log('12. Capturing Admin Console - Grievances & Petitions...');
  try {
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const grievTab = tabBtns.find((b) => b.innerText.includes('Grievances') || b.innerText.includes('Petitions'));
      if (grievTab) grievTab.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '12_admin_grievances_desk.png') });
  } catch (e) {
    console.warn('Admin grievances capture warning:', e.message);
  }

  await browser.close();
  console.log('All screenshots captured successfully in:', OUTPUT_DIR);
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
