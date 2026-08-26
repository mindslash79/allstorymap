/* 1 STORY MAKER — Online Runtime Bootstrap v5
 * Stable public entrypoint. Runtime base + patch are pinned to one Git commit.
 * No secrets in GitHub; GEMINI_API_KEY stays in Apps Script Properties.
 */
const STORY_MAKER_V5_COMMIT='183ce73fcbe33ae467140252155c1a459326ab98';
const STORY_MAKER_V5_BASE='https://raw.githubusercontent.com/mindslash79/allstorymap/'+STORY_MAKER_V5_COMMIT+'/story-maker/StoryMaker.v4.base.gs';
const STORY_MAKER_V5_PATCH='https://raw.githubusercontent.com/mindslash79/allstorymap/'+STORY_MAKER_V5_COMMIT+'/story-maker/StoryMaker.patch.v5.gs';

function smRunAction_(action){
  const base=UrlFetchApp.fetch(STORY_MAKER_V5_BASE,{muteHttpExceptions:true});
  const patch=UrlFetchApp.fetch(STORY_MAKER_V5_PATCH,{muteHttpExceptions:true});
  if(base.getResponseCode()!==200)throw new Error('Story Maker v5 base HTTP '+base.getResponseCode());
  if(patch.getResponseCode()!==200)throw new Error('Story Maker v5 patch HTTP '+patch.getResponseCode());
  const source=base.getContentText()+'\n'+patch.getContentText();
  const arg=action===undefined?'undefined':JSON.stringify(action);
  return eval('(function(){\n'+source+'\nreturn smRunAction_('+arg+');\n})()');
}
