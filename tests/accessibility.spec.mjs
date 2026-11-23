import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({baseURL:process.env.BASE_URL||'http://127.0.0.1:4173'});

for(const device of [
  {name:'desktop',width:1440,height:900},
  {name:'mobile',width:390,height:844}
]){
  test('WCAG 2.1 AA audit — '+device.name, async({page})=>{
    await page.setViewportSize({width:device.width,height:device.height});
    await page.goto('/');
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    expect(scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
  });
}
