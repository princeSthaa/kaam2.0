const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  let dialogMessage = '';
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('dialog', async dialog => {
    dialogMessage = dialog.message();
    console.log('DIALOG RECEIVED:', dialogMessage);
    await dialog.accept();
  });

  try {
    console.log('--- Testing CreateInHouse E2E Variant & Routing Stages Flow ---');
    await page.goto('http://localhost:3000/Production/InHouse/CreateInHouse');
    await new Promise(r => setTimeout(r, 2500));

    // Verify Title
    const headerTitle = await page.evaluate(() => document.querySelector('h1')?.innerText);
    console.log('Page Header Title:', headerTitle);

    // 1. Search and add product using page.type for React input compatibility
    console.log('1. Searching and adding product Men Casual Shirt...');
    await page.focus('input[placeholder*="Search catalog garments"]');
    await page.type('input[placeholder*="Search catalog garments"]', 'Casual Shirt');
    await new Promise(r => setTimeout(r, 1000));

    // Click dropdown item
    await page.evaluate(() => {
      // Find the parent div containing "Men Casual Shirt" inside the dropdown list
      const items = Array.from(document.querySelectorAll('.absolute.left-0.right-0.z-40 > div'));
      const match = items.find(d => d.textContent.includes('Men Casual Shirt'));
      if (match) match.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Print all buttons text
    const buttonsText = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim().replace(/\s+/g, ' '));
    });
    console.log('All buttons on page after add:', buttonsText);

    // 2. Open Fabric Selector Modal
    console.log('2. Opening Fabric/Color Selector Modal...');
    const opened = await page.evaluate(() => {
      const selectFabricBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Select Fabric'));
      if (selectFabricBtn) {
        selectFabricBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Select Fabric button:', opened);
    await new Promise(r => setTimeout(r, 1500));

    const isModalOpen = await page.evaluate(() => {
      return !!document.querySelector('.fixed.inset-0.z-50.flex.items-center');
    });
    console.log('Fabric Modal Open:', isModalOpen);

    // Click Category tab Fleece
    console.log('   Selecting category Fleece...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.fixed.inset-0.z-50 button'));
      const fleeceTab = tabs.find(t => t.textContent.includes('Fleece'));
      if (fleeceTab) fleeceTab.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Click Swatch to select Heather Grey
    console.log('   Clicking Fleece Knit (Heather Grey) swatch...');
    await page.evaluate(() => {
      const swatches = Array.from(document.querySelectorAll('.fixed.inset-0.z-50 .cursor-pointer'));
      const greySwatch = swatches.find(s => s.textContent.includes('Heather Grey'));
      if (greySwatch) greySwatch.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const updatedFabricName = await page.evaluate(() => {
      return document.querySelector('.bg-kaam-surface.border.rounded-kaam-lg')?.textContent;
    });
    console.log('Selected Fabric registered in Variant row:', updatedFabricName?.includes('Heather Grey'));

    // 3. Edit routing stages for the product
    console.log('3. Modifying first routing stage name...');
    await page.evaluate(() => {
      const firstStageInput = document.querySelector('.group\\/stage input[type="text"]');
      if (firstStageInput) {
        firstStageInput.value = 'Material Intake E2E';
        firstStageInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // 4. Verify materials calculated
    console.log('4. Verifying BOM Raw Materials Calculated...');
    const hasMaterials = await page.evaluate(() => {
      const tableRows = Array.from(document.querySelectorAll('table tbody tr'));
      return tableRows.length > 0 && !tableRows[0].textContent.includes('No raw materials');
    });
    console.log('Materials list populated:', hasMaterials);

    // 5. Submit Plan
    console.log('5. Submitting Plan...');
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save Production Plan'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    console.log('Redirected URL:', page.url());

    // Verify saved to localStorage
    const savedPlans = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('productionPlans') || '[]');
    });
    console.log('Plan saved to localStorage:', savedPlans.length > 0);
    if (savedPlans.length > 0) {
      console.log('Saved Plan Details:', {
        planNo: savedPlans[0].planNo,
        productName: savedPlans[0].productName,
        variant: savedPlans[0].products[0]?.variant,
        firstStage: savedPlans[0].stages[0]?.stageName
      });
    }

  } catch (err) {
    console.error('Error occurred:', err.message);
  } finally {
    await browser.close();
  }
})();
