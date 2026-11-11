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
  // Check the actual story reader with the bundled Reuben narrator, not only the Settings button.
  const fixture={
    id:'ci-example',title:'CI Bedtime Test',description:'A quiet test',
    settings:{language:'en',minutes:1,narrMode:'single'},characters:[],
    voiceMap:{narrator:'Reuben'},currentPage:0,pages:[{
      id:'page_1',state:'Ready',beat:'A peaceful evening',
      sceneHint:'moonlit_forest',scene:{environment:'moonlit_forest',objects:[]},
      text:'The stars are bright. Good night, little fox.',
      segments:[{id:'segment_1',speaker:'narrator',text:'The stars are bright. Good night, little fox.'}]
    }]
  };
  await page.locator('#importInput').setInputFiles({
    name:'bedtime-smoke.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))
  });
  await page.locator('#books [data-open]').first().click();
  await page.locator('#playBtn').click();
  await page.waitForFunction(() =>
    (document.querySelector('#log')?.textContent||'').includes('Audio ready page 1:'),
    null,{timeout:120000,polling:500}
  );
  const log=await page.locator('#log').textContent();
  if(/Play failed:|Phonon audio page 1:/.test(log))throw Error('Narration failed in story reader: '+log.slice(-2000));
  console.log('PASS: DreamWorld story reader synthesized narration using bundled Reuben/default voice.');

}catch(error){
  console.error('FAIL:',error.stack||error);
  console.error('Browser errors:',messages.slice(-20).join('\n'));
  process.exitCode=1;
}finally{await browser.close()}
