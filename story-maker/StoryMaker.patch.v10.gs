/* 1 STORY MAKER — Runtime Patch v10
 * RPG Maker-ready scene scripts: dialogue, action, blocking, environment,
 * audiovisual direction, player input, event commands, and validation.
 */

var smV9RunNamedAction_ = smRunNamedAction_;
var smV9GenerateScenes_ = smGenerateScenes;
var smV9ValidateStory_ = smValidateStory;
var smV9FinalizeStory_ = smFinalizeStory;
var smV9ExportConfigs_ = smExportConfigs_;
var smV9EditableSheetOrder_ = smEditableSheetOrder_;
var smV9ExportSectionTitle_ = smExportSectionTitle_;
var smV9ExportRowTitle_ = smExportRowTitle_;

smRunNamedAction_ = function(action){
  if(action==='GENERATE_SCENE_SCRIPTS'){
    try{
      var count=smGenerateSceneScripts_();
      smLog_(action,'SUCCESS',count+' script beats generated','');
      return count;
    }catch(err){
      smLog_(action,'FAILED','Scene script generation failed',err&&err.message?err.message:String(err));
      throw err;
    }
  }
  return smV9RunNamedAction_(action);
};

smGenerateScenes = function(){
  var count=smV9GenerateScenes_();
  smGenerateSceneScripts_();
  return count;
};

function smSceneScriptHeaders_(){
  return ['SCRIPT_ID','SCENE_ID','BEAT_ORDER','BEAT_TYPE','SPEAKER_ID','SPEAKER_NAME','PORTRAIT_EXPRESSION','DIALOGUE','ACTION','BLOCKING','ENVIRONMENT','CAMERA','SOUND_EFFECT','MUSIC_CUE','LIGHTING_WEATHER','PLAYER_INPUT','RPG_MAKER_EVENT','CONDITION','SWITCH_VARIABLE','NEXT_BEAT','NOTES','STATUS','VERSION','JSON_REF'];
}

function smEnsureSceneScriptSheet_(){
  var ss=smSs_(),sh=ss.getSheetByName('SCENE_SCRIPT'),headers=smSceneScriptHeaders_();
  if(!sh){
    sh=ss.insertSheet('SCENE_SCRIPT');
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,headers.length).setBackground('#16324F').setFontColor('#FFFFFF').setFontWeight('bold').setWrap(true);
    sh.getRange('A:X').setVerticalAlignment('top').setWrap(true);
    sh.setColumnWidth(1,150);sh.setColumnWidth(2,110);sh.setColumnWidth(3,80);sh.setColumnWidth(4,130);
    sh.setColumnWidth(6,120);sh.setColumnWidth(8,360);sh.setColumnWidth(9,280);sh.setColumnWidth(10,220);
    sh.setColumnWidth(11,300);sh.setColumnWidth(12,180);sh.setColumnWidth(16,200);sh.setColumnWidth(17,300);
    sh.setColumnWidth(18,180);sh.setColumnWidth(19,180);sh.setColumnWidth(21,220);
    sh.getRange('C:C').setNumberFormat('0');sh.getRange('W:W').setNumberFormat('0');
  }
  return sh;
}

function smGenerateSceneScripts_(){
  smEnsureSceneScriptSheet_();
  var scenes=smRows_('SCENES');
  if(!scenes.length)throw new Error('SCENES 데이터가 없습니다. 먼저 GENERATE_SCENES를 실행하세요.');
  var context=smContext_(['INPUT','STORY','PAYLOAD','AUDIENCE','CHARACTERS','STRUCTURE','LOCATIONS','SCENES','CHARACTER_STATE']);
  var prompt=[
    'You are a theatre playwright and RPG Maker event designer. Return ONLY valid JSON.',
    'Expand EVERY supplied scene into a production-ready sequence of beats. Write in the same primary language as the project.',
    'Each beat must be directly implementable as an RPG Maker event. Include spoken dialogue verbatim, visible character action, stage blocking, and the surrounding situation/environment.',
    'Also specify camera, sound/music, lighting/weather, player control or choice, event command suggestion, conditions, and switches/variables whenever relevant.',
    'Use only existing SCENE_ID and CHARACTER_ID values. Preserve creator INPUT and all canonical facts, chronology, location, time, character state, setup/payoff, and transition continuity.',
    'Do not summarize conversations: write every dialogue line as its own DIALOGUE beat. Split simultaneous action and dialogue when implementation needs separate event commands.',
    'Start each scene with enough STAGE_DIRECTION/ENVIRONMENT information to establish who is present, positions, ambient motion, light, weather, sound, and interactable objects.',
    'End each scene with an explicit TRANSITION or PLAYER_CONTROL handoff. Prefer concrete RPG Maker commands such as Show Text, Set Movement Route, Show Choices, Control Switches, Control Variables, Play BGM/BGS/SE, Tint Screen, Wait, Transfer Player, or Common Event.',
    'BEAT_TYPE must be one of STAGE_DIRECTION, DIALOGUE, ACTION, PLAYER_CONTROL, CHOICE, SYSTEM, TRANSITION.',
    'Context:',JSON.stringify(context),
    'Schema: {"scene_scripts":[{"scene_id":"SCENE_001","beats":[{"beat_order":1,"beat_type":"STAGE_DIRECTION","speaker_id":"","speaker_name":"","portrait_expression":"","dialogue":"","action":"","blocking":"","environment":"","camera":"","sound_effect":"","music_cue":"","lighting_weather":"","player_input":"","rpg_maker_event":"","condition":"","switch_variable":"","next_beat":"","notes":""}]}]}'
  ].join('\n');
  var out=smGemini_(prompt,'GENERATE_SCENE_SCRIPTS'),version=Number(smControl_('Story Version')||1),rows=[];
  (out.scene_scripts||[]).forEach(function(group){
    var sceneId=String(group.scene_id||'');
    (group.beats||[]).forEach(function(x,index){
      var order=smNum_(x.beat_order,index+1,1,9999);
      var row={
        SCRIPT_ID:sceneId+'_B'+smPad_(order,3),SCENE_ID:sceneId,BEAT_ORDER:order,
        BEAT_TYPE:smSceneBeatType_(x.beat_type),SPEAKER_ID:x.speaker_id||'',SPEAKER_NAME:x.speaker_name||'',
        PORTRAIT_EXPRESSION:x.portrait_expression||'',DIALOGUE:x.dialogue||'',ACTION:x.action||'',
        BLOCKING:x.blocking||'',ENVIRONMENT:x.environment||'',CAMERA:x.camera||'',SOUND_EFFECT:x.sound_effect||'',
        MUSIC_CUE:x.music_cue||'',LIGHTING_WEATHER:x.lighting_weather||'',PLAYER_INPUT:x.player_input||'',
        RPG_MAKER_EVENT:x.rpg_maker_event||'',CONDITION:x.condition||'',SWITCH_VARIABLE:x.switch_variable||'',
        NEXT_BEAT:x.next_beat||'',NOTES:x.notes||'',STATUS:'APPROVED',VERSION:version,JSON_REF:''
      };
      row.JSON_REF=JSON.stringify(row);rows.push(row);
    });
  });
  rows.sort(function(a,b){
    var ai=scenes.findIndex(function(s){return String(s.SCENE_ID)===String(a.SCENE_ID);});
    var bi=scenes.findIndex(function(s){return String(s.SCENE_ID)===String(b.SCENE_ID);});
    return ai-bi||Number(a.BEAT_ORDER)-Number(b.BEAT_ORDER);
  });
  smReplace_('SCENE_SCRIPT',rows);
  smStyleSceneScriptRows_();
  return rows.length;
}

function smSceneBeatType_(value){
  var type=String(value||'ACTION').toUpperCase();
  return ['STAGE_DIRECTION','DIALOGUE','ACTION','PLAYER_CONTROL','CHOICE','SYSTEM','TRANSITION'].indexOf(type)>=0?type:'ACTION';
}

function smStyleSceneScriptRows_(){
  var sh=smEnsureSceneScriptSheet_(),last=sh.getLastRow();if(last<2)return;
  sh.getRange(2,1,last-1,sh.getLastColumn()).setVerticalAlignment('top').setWrap(true);
  var types=sh.getRange(2,4,last-1,1).getValues();
  var colors=types.map(function(r){var t=String(r[0]);return [t==='DIALOGUE'?'#E8F0FE':t==='ACTION'?'#E6F4EA':t==='STAGE_DIRECTION'?'#FFF4E5':t==='CHOICE'?'#FCE8E6':t==='TRANSITION'?'#EDE7F6':'#F8F9FA'];});
  sh.getRange(2,4,last-1,1).setBackgrounds(colors);
}

smValidateStory = function(){
  smEnsureSceneScriptSheet_();
  smV9ValidateStory_();
  var issues=smValidateSceneScripts_();
  if(issues.length)smAppend_('VALIDATION',issues);
  var failed=smRows_('VALIDATION').some(function(x){return String(x.RESULT||'').toUpperCase()==='FAIL';});
  smSetControl_('Validation Status',failed?'FAIL':'PASS');
  return !failed;
};

function smValidateSceneScripts_(){
  var scenes=smRows_('SCENES'),scripts=smRows_('SCENE_SCRIPT'),sceneIds={};
  scenes.forEach(function(x){sceneIds[String(x.SCENE_ID||'')]=true;});
  var issues=[],seen={},covered={},now=Date.now();
  function add(target,check,result,severity,issue,evidence,fix){issues.push({VALIDATION_ID:'SCRIPT_'+smPad_(issues.length+1,3)+'_'+now,RUN_AT:new Date(),SCOPE:'SCENE_SCRIPT',TARGET_ID:target,CHECK_TYPE:check,RESULT:result,SCORE:'',SEVERITY:severity,ISSUE:issue,EVIDENCE:evidence,SUGGESTED_FIX:fix,AUTO_FIX_ALLOWED:false,PAYLOAD_IMPACT:'',AUDIENCE_IMPACT:'',STATUS:'OPEN',JSON_REF:''});}
  scripts.forEach(function(x){
    var sid=String(x.SCENE_ID||''),key=sid+'|'+String(x.BEAT_ORDER||'');covered[sid]=true;
    if(!sceneIds[sid])add(x.SCRIPT_ID,'SCRIPT_SCENE_REFERENCE','FAIL','HIGH','대본 비트가 존재하지 않는 장면을 참조합니다.',sid,'기존 SCENE_ID를 지정하세요.');
    if(seen[key])add(x.SCRIPT_ID,'SCRIPT_BEAT_ORDER','FAIL','MEDIUM','한 장면 안에 중복된 비트 순서가 있습니다.',key,'BEAT_ORDER를 고유하게 정렬하세요.');seen[key]=true;
    if(String(x.BEAT_TYPE)==='DIALOGUE'&&(!x.DIALOGUE||(!x.SPEAKER_ID&&!x.SPEAKER_NAME)))add(x.SCRIPT_ID,'SCRIPT_DIALOGUE_COMPLETENESS','FAIL','MEDIUM','대사 비트에 화자 또는 실제 대사가 없습니다.','','화자와 DIALOGUE를 모두 작성하세요.');
    if(!x.RPG_MAKER_EVENT)add(x.SCRIPT_ID,'SCRIPT_EVENT_IMPLEMENTATION','WARN','LOW','RPG Maker 이벤트 구현 제안이 비어 있습니다.','','실행할 이벤트 명령을 추가하세요.');
  });
  scenes.forEach(function(x){if(!covered[String(x.SCENE_ID)])add(x.SCENE_ID,'SCRIPT_SCENE_COVERAGE','FAIL','HIGH','장면에 연극 대본형 비트가 없습니다.','','GENERATE_SCENE_SCRIPTS를 실행하세요.');});
  return issues;
}

smFinalizeStory = function(){
  var count=smV9FinalizeStory_(),v=Number(smControl_('Story Version')||1),now=new Date(),base=count;
  var scripts=smRows_('SCENE_SCRIPT').map(function(x,i){return {
    TYPE:'SCENE_SCRIPT',ENTITY_ID:x.SCRIPT_ID,VERSION:v,STATUS:'FINAL',ORDER:base+i+1,PARENT_ID:x.SCENE_ID,
    TITLE_NAME:[x.BEAT_TYPE,x.SPEAKER_NAME||x.SPEAKER_ID].filter(Boolean).join(' · '),
    STORY_SUMMARY:[x.DIALOGUE,x.ACTION,x.ENVIRONMENT].filter(Boolean).join(' | '),STORY_FUNCTION:'Scene implementation beat',PAYLOAD_FUNCTION:'',
    LOCATION_ID:'',LOCATION_ROLE:'',CHARACTERS:x.SPEAKER_ID||'',CHARACTER_STATE_REF:'',CHRONOLOGY_ORDER:'',PRESENTATION_ORDER:'',
    EXPERIENCE_PROFILE_ID:'',TIME:'',WEATHER:x.LIGHTING_WEATHER||'',ATMOSPHERE:x.ENVIRONMENT||'',REQUIRED_OBJECTS:'',
    MAP_REQUIREMENTS:[x.BLOCKING,x.CAMERA].filter(Boolean).join(' | '),ASSET_REQUIREMENTS:[x.PORTRAIT_EXPRESSION,x.SOUND_EFFECT,x.MUSIC_CUE].filter(Boolean).join(' | '),
    EVENT_REQUIREMENTS:[x.RPG_MAKER_EVENT,x.CONDITION,x.SWITCH_VARIABLE,x.PLAYER_INPUT].filter(Boolean).join(' | '),SOURCE_VERSION:v,APPROVED_AT:now,EXPORT_STATUS:'READY',JSON_PAYLOAD:JSON.stringify(x)
  };});
  smAppend_('FINAL',scripts);return count+scripts.length;
};

smExportConfigs_ = function(){
  var configs=smV9ExportConfigs_();
  configs.SCENES.sheets=['SCENES','SCENE_SCRIPT','EXPERIENCE','CHARACTER_STATE'];
  return configs;
};

smEditableSheetOrder_ = function(){
  var order=smV9EditableSheetOrder_(),i=order.indexOf('SCENES');
  if(order.indexOf('SCENE_SCRIPT')<0)order.splice(i+1,0,'SCENE_SCRIPT');
  return order;
};

smExportSectionTitle_ = function(sheetName){
  return sheetName==='SCENE_SCRIPT'?'RPG Maker Scene Script':smV9ExportSectionTitle_(sheetName);
};

smExportRowTitle_ = function(sheetName,row,index){
  if(sheetName==='SCENE_SCRIPT')return (index+1)+'. '+[row.SCENE_ID,'B'+smPad_(row.BEAT_ORDER||index+1,3),row.BEAT_TYPE,row.SPEAKER_NAME||row.SPEAKER_ID].filter(Boolean).join(' · ');
  return smV9ExportRowTitle_(sheetName,row,index);
};
