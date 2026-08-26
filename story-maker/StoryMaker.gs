/* 1 STORY MAKER — Online Runtime Bootstrap v7
 * Stable public entrypoint. Runtime base + v5 + v6 + v7 patches are pinned.
 * No secrets in GitHub; GEMINI_API_KEY stays in Apps Script Properties.
 */
const STORY_MAKER_V7_BASE_COMMIT='d2a005daec8acc1590dd5160df69c7cbbbd72094';
const STORY_MAKER_V7_PATCH_COMMIT='583183da9fd6bfe2e69d6d2ab99744a7c76a22b0';
const STORY_MAKER_V7_BASE='https://raw.githubusercontent.com/mindslash79/allstorymap/'+STORY_MAKER_V7_BASE_COMMIT+'/story-maker/StoryMaker.v4.base.gs';
const STORY_MAKER_V7_PATCH5='https://raw.githubusercontent.com/mindslash79/allstorymap/'+STORY_MAKER_V7_BASE_COMMIT+'/story-maker/StoryMaker.patch.v5.gs';
const STORY_MAKER_V7_PATCH6='https://raw.githubusercontent.com/mindslash79/allstorymap/'+STORY_MAKER_V7_BASE_COMMIT+'/story-maker/StoryMaker.patch.v6.gs';
const STORY_MAKER_V7_PATCH7='https://raw.githubusercontent.com/mindslash79/allstorymap/'+STORY_MAKER_V7_PATCH_COMMIT+'/story-maker/StoryMaker.patch.v7.gs';

function smRunAction_(action){
  const base=UrlFetchApp.fetch(STORY_MAKER_V7_BASE,{muteHttpExceptions:true});
  const p5=UrlFetchApp.fetch(STORY_MAKER_V7_PATCH5,{muteHttpExceptions:true});
  const p6=UrlFetchApp.fetch(STORY_MAKER_V7_PATCH6,{muteHttpExceptions:true});
  const p7=UrlFetchApp.fetch(STORY_MAKER_V7_PATCH7,{muteHttpExceptions:true});
  if(base.getResponseCode()!==200)throw new Error('Story Maker v7 base HTTP '+base.getResponseCode());
  if(p5.getResponseCode()!==200)throw new Error('Story Maker v7 patch5 HTTP '+p5.getResponseCode());
  if(p6.getResponseCode()!==200)throw new Error('Story Maker v7 patch6 HTTP '+p6.getResponseCode());
  if(p7.getResponseCode()!==200)throw new Error('Story Maker v7 patch7 HTTP '+p7.getResponseCode());
  const source=base.getContentText()+'\n'+p5.getContentText()+'\n'+p6.getContentText()+'\n'+p7.getContentText();
  const arg=action===undefined?'undefined':JSON.stringify(action);
  return eval('(function(){\n'+source+'\nreturn smRunAction_('+arg+');\n})()');
}
