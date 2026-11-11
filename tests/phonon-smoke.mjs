import { chromium } from 'playwright';

const url = process.env.DREAMWORLD_URL || 'https://tbenitz.github.io/DreamWorld-Bedtime-Stories/';
const browser = await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page = await browser.newPage({viewport:{width:1365,height:900}});
const messages = [];
page.on('console', msg => { if(msg.type()==='error')messages.push('console: '+msg.text()) });
page.on('pageerror', error => messages.push('page: '+error.message));
page.on('requestfailed', request => messages.push('request: '+request.url()+' '+request.failure()?.errorText));
try{
  await page.goto(url+'?speechtest='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('[data-tab="settings"]').click();
  await page.waitForFunction(() => document.querySelector('#voiceCount')?.textContent?.includes('102'),null,{timeout:40000});
  const voiceCount = await page.locator('#voiceCount').textContent();
  console.log('Voice catalog:',voiceCount);
  await page.locator('#testTtsBtn').click();
  await page.waitForFunction(() => {
    const status=document.querySelector('#ttsStatus')?.textContent||'';
    return /Verified actual Phonon waveform|Phonon test failed:|Phonon unavailable:/i.test(status);
  },null,{timeout:240000,polling:500});
  const status=await page.locator('#ttsStatus').textContent();
  console.log('Narration status:',status);
  if(!status.includes('Verified actual Phonon waveform')){
    const detail=(await page.locator('#log').textContent())||'';
    throw new Error('Actual synthesis test did not pass. Diagnostics:\n'+detail.slice(-4000));
  }
  console.log('PASS: Real in-browser Phonon synthesized audible PCM from public checkpoint.');
}catch(error){
  console.error('FAIL:',error.stack||error);
  console.error('Browser errors:',messages.slice(-20).join('\n'));
  process.exitCode=1;
}finally{await browser.close()}
