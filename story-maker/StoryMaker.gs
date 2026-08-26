/* 1 STORY MAKER — Online Runtime v3
 * No secrets in this file. GEMINI_API_KEY stays in Apps Script Properties.
 */
const SM=Object.freeze({
  SPREADSHEET_ID:'1LJWMMbZudbTJUbMdaJPPRDV9FrIucv8HHMopB9n6o_Y',
  MODEL:'gemini-3.6-flash',
  ENDPOINT:'https://generativelanguage.googleapis.com/v1beta/interactions',
  Q:'COMMAND_QUEUE'
});

function smRunAction_(action){
  if(typeof action!=='string') return smProcessRemoteQueue_();
  smEnsureRemoteTrigger_();
  return smRunNamedAction_(action);
}

function smRunNamedAction_(action){
  if(action==='PING') return smPing_();
  const map={
    DEVELOP_STORY:smDevelopStory,
    REVIEW_PAYLOAD:smReviewPayload,
    BUILD_STRUCTURE:smBuildStructure,
    BUILD_LOCATIONS:smBuildLocations,
    GENERATE_SCENES:smGenerateScenes,
    COMPOSE_EXPERIENCE:smComposeExperience,
    VALIDATE_STORY:smValidateStory,
    FINALIZE_STORY:smFinalizeStory,
    EXPORT_TO_MAP:smExportToMap,
    SAVE_VERSION:smSaveVersion,
    BUILD_ALL:smBuildAll
  };
  if(!map[action]) throw new Error('Unknown Story Maker action: '+action);
  try{
    const result=map[action]();
    smLog_(action,'SUCCESS','Completed','');
    return result;
  }catch(err){
    smLog_(action,'FAILED','Failed',err&&err.message?err.message:String(err));
    throw err;
  }
}

function smPing_(){
  smSetControl_('Automation State','LIVE · ONLINE RUNTIME · REMOTE QUEUE');
  smSetControl_('Remote Heartbeat',new Date());
  return 'PONG';
}

function smEnsureRemoteTrigger_(){
  try{
    const exists=ScriptApp.getProjectTriggers().some(function(t){
      return t.getHandlerFunction()==='runStoryMakerOnline_' && String(t.getEventType())==='CLOCK';
    });
    if(!exists) ScriptApp.newTrigger('runStoryMakerOnline_').timeBased().everyMinutes(1).create();
    smSetControl_('Automation State','LIVE · ONLINE RUNTIME · REMOTE QUEUE');
  }catch(e){
    smSetControl_('Automation State','LIVE · ONLINE RUNTIME · REMOTE SETUP ERROR');
  }
}

function smProcessRemoteQueue_(){
  const sh=smSheet_(SM.Q),last=sh.getLastRow();
  if(last<2) return;
  const vals=sh.getRange(2,1,last-1,9).getValues();
  for(let i=0;i<vals.length;i++){
    if(String(vals[i][3]||'').trim()!=='PENDING') continue;
    const row=i+2,action=String(vals[i][2]||'').trim();
    sh.getRange(row,4,1,3).setValues([['RUNNING',vals[i][4]||'',new Date()]]);
    try{
      const result=smRunNamedAction_(action);
      sh.getRange(row,4).setValue('DONE');
      sh.getRange(row,7,1,3).setValues([[new Date(),result===undefined?'OK':String(result),'']]);
    }catch(err){
      sh.getRange(row,4).setValue('ERROR');
      sh.getRange(row,7,1,3).setValues([[new Date(),'',err&&err.message?err.message:String(err)]]);
    }
    return;
  }
}

function smBuildAll(){
  if(smPendingInputs_().length) smDevelopStory();
  else if(!smRows_('STORY').length) throw new Error('STORY가 없고 처리할 INPUT도 없습니다.');
  smBuildStructure();
  smBuildLocations();
  smGenerateScenes();
  smComposeExperience();
  const ok=smValidateStory();
  if(ok) smFinalizeStory();
  smSaveVersion();
  smSetControl_('Status',ok?'FINAL':'REVIEW');
  return ok?'BUILD COMPLETE':'BUILD COMPLETE WITH VALIDATION FAILURES';
}

function smPendingInputs_(){
  return smRows_('INPUT').filter(function(r){
    return String(r.RAW_INPUT||'').trim() && r.PROCESSED!==true && String(r.PROCESSED).toUpperCase()!=='TRUE';
  });
}

function smDevelopStory(){
  const inputs=smPendingInputs_();
  if(!inputs.length) throw new Error('INPUT에 처리되지 않은 RAW_INPUT이 없습니다.');
  const prompt=[
    'You are the narrative architect for an RPG Maker MV game. Return ONLY valid JSON.',
    'Creator inputs:',JSON.stringify(inputs),
    'Existing context:',JSON.stringify(smContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS'])),
    'Creator value/payload is primary overall, approximately 60:40 versus audience adaptation, but never force that ratio scene by scene.',
    'Recommend audience from story+payload. Character bibles must be detailed including appearance.',
    'All audience tolerance fields MUST be exactly LOW, MEDIUM, or HIGH.',
    'Schema:',JSON.stringify({
      story:{premise:'',overall_story:'',beginning:'',middle:'',ending:'',chronology_notes:'',creator_notes:''},
      payload:{primary_payload:'',secondary_values:['','',''],player_before:'',player_during:'',player_after:'',value_priority:60,audience_priority:40},
      audience:{ai_recommended:'',creator_selected:'',age_range:'',psychographic:'',game_preferences:'',slow_pacing_tolerance:'MEDIUM',ambiguity_tolerance:'MEDIUM',emotional_intensity:'HIGH',mechanical_complexity:'LOW',humor_preference:'MEDIUM',reason:''},
      characters:[{character_id:'CHAR_001',name:'',role:'',age:'',personality:'',want:'',fear:'',background:'',appearance:'',speech_style:'',habits:'',relationships:'',starting_state:'',internal_conflict:'',arc_summary:'',current_state:'',visual_notes:''}]
    })
  ].join('\n');
  const out=smGemini_(prompt,'DEVELOP_STORY');
  const sv=Number(smControl_('Story Version')||0)+1,pv=Number(smControl_('Payload Version')||0)+1,av=Number(smControl_('Audience Version')||0)+1;
  smReplace_('STORY',[{STORY_VERSION:sv,STATUS:'APPROVED',PREMISE:smGet_(out,'story.premise'),OVERALL_STORY:smGet_(out,'story.overall_story'),BEGINNING:smGet_(out,'story.beginning'),MIDDLE:smGet_(out,'story.middle'),ENDING:smGet_(out,'story.ending'),CHRONOLOGY_NOTES:smGet_(out,'story.chronology_notes'),CREATOR_NOTES:smGet_(out,'story.creator_notes'),SOURCE_INPUT_IDS:inputs.map(function(x){return x.INPUT_ID;}).join(','),APPROVED_AT:new Date(),JSON_REF:''}]);
  const p=out.payload||{},sec=p.secondary_values||[];
  smReplace_('PAYLOAD',[{PAYLOAD_VERSION:pv,STATUS:'APPROVED',PRIMARY_PAYLOAD:p.primary_payload||p.primary_value||'',SECONDARY_VALUE_1:sec[0]||'',SECONDARY_VALUE_2:sec[1]||'',SECONDARY_VALUE_3:sec[2]||'',PLAYER_BEFORE:p.player_before||p.intended_before||'',PLAYER_DURING:p.player_during||p.intended_during||'',PLAYER_AFTER:p.player_after||p.intended_after||'',VALUE_PRIORITY:smNum_(p.value_priority,60,0,100),AUDIENCE_PRIORITY:smNum_(p.audience_priority,40,0,100),JSON_REF:''}]);
  const a=out.audience||{};
  smReplace_('AUDIENCE',[{AUDIENCE_VERSION:av,STATUS:'APPROVED',AI_RECOMMENDED:a.ai_recommended||'',CREATOR_SELECTED:a.creator_selected||a.ai_recommended||'',AGE_RANGE:a.age_range||a.primary_age||'',PSYCHOGRAPHIC:a.psychographic||'',GAME_PREFERENCES:a.game_preferences||'',SLOW_PACING_TOLERANCE:smLevel_(a.slow_pacing_tolerance),AMBIGUITY_TOLERANCE:smLevel_(a.ambiguity_tolerance),EMOTIONAL_INTENSITY:smLevel_(a.emotional_intensity),MECHANICAL_COMPLEXITY:smLevel_(a.mechanical_complexity),HUMOR_PREFERENCE:smLevel_(a.humor_preference),REASON:a.reason||a.rationale||'',JSON_REF:''}]);
  smReplace_('CHARACTERS',(out.characters||[]).map(function(c,i){return {CHARACTER_ID:c.character_id||('CHAR_'+smPad_(i+1,3)),NAME:c.name||'',ROLE:c.role||'',AGE:c.age||'',PERSONALITY:c.personality||'',WANT:c.want||'',FEAR:c.fear||'',BACKGROUND:c.background||'',APPEARANCE:c.appearance||'',SPEECH_STYLE:c.speech_style||'',HABITS:c.habits||'',RELATIONSHIPS:c.relationships||'',STARTING_STATE:c.starting_state||'',INTERNAL_CONFLICT:c.internal_conflict||'',ARC_SUMMARY:c.arc_summary||'',CURRENT_STATE:c.current_state||c.starting_state||'',VISUAL_NOTES:c.visual_notes||'',FIRST_SCENE_ID:'',LAST_SCENE_ID:'',STATUS:'APPROVED',VERSION:sv,JSON_REF:''};}));
  smMarkInputs_(inputs,sv);
  smSetControls_({'Story Version':sv,'Payload Version':pv,'Audience Version':av,'Primary Audience':a.creator_selected||a.ai_recommended||''});
  return sv;
}

function smReviewPayload(){
  const prompt=['Review payload and audience without changing creator intent. Return ONLY JSON.','Context:',JSON.stringify(smContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS'])),'Schema: {"payload":{"primary_payload":"","secondary_values":[],"player_before":"","player_during":"","player_after":"","value_priority":60,"audience_priority":40},"audience":{"ai_recommended":"","creator_selected":"","age_range":"","psychographic":"","game_preferences":"","slow_pacing_tolerance":"LOW|MEDIUM|HIGH","ambiguity_tolerance":"LOW|MEDIUM|HIGH","emotional_intensity":"LOW|MEDIUM|HIGH","mechanical_complexity":"LOW|MEDIUM|HIGH","humor_preference":"LOW|MEDIUM|HIGH","reason":""}}'].join('\n');
  const out=smGemini_(prompt,'REVIEW_PAYLOAD');
  if(out.payload){const p=out.payload,sec=p.secondary_values||[],pv=Number(smControl_('Payload Version')||0)+1;smReplace_('PAYLOAD',[{PAYLOAD_VERSION:pv,STATUS:'APPROVED',PRIMARY_PAYLOAD:p.primary_payload||p.primary_value||'',SECONDARY_VALUE_1:sec[0]||'',SECONDARY_VALUE_2:sec[1]||'',SECONDARY_VALUE_3:sec[2]||'',PLAYER_BEFORE:p.player_before||p.intended_before||'',PLAYER_DURING:p.player_during||p.intended_during||'',PLAYER_AFTER:p.player_after||p.intended_after||'',VALUE_PRIORITY:smNum_(p.value_priority,60,0,100),AUDIENCE_PRIORITY:smNum_(p.audience_priority,40,0,100),JSON_REF:''}]);smSetControl_('Payload Version',pv);}
  if(out.audience){const a=out.audience,av=Number(smControl_('Audience Version')||0)+1;smReplace_('AUDIENCE',[{AUDIENCE_VERSION:av,STATUS:'APPROVED',AI_RECOMMENDED:a.ai_recommended||'',CREATOR_SELECTED:a.creator_selected||a.ai_recommended||'',AGE_RANGE:a.age_range||a.primary_age||'',PSYCHOGRAPHIC:a.psychographic||'',GAME_PREFERENCES:a.game_preferences||'',SLOW_PACING_TOLERANCE:smLevel_(a.slow_pacing_tolerance),AMBIGUITY_TOLERANCE:smLevel_(a.ambiguity_tolerance),EMOTIONAL_INTENSITY:smLevel_(a.emotional_intensity),MECHANICAL_COMPLEXITY:smLevel_(a.mechanical_complexity),HUMOR_PREFERENCE:smLevel_(a.humor_preference),REASON:a.reason||a.rationale||'',JSON_REF:''}]);smSetControl_('Audience Version',av);}
  return true;
}

function smBuildStructure(){
  const prompt=['Expand the story into narrative blocks BEFORE scenes. Return ONLY JSON.','Context:',JSON.stringify(smContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS'])),'Divide BEGINNING/MIDDLE/ENDING naturally. Important locations must emerge here.','Schema: {"structure":[{"structure_id":"STRUCT_001","parent_id":"","act":"BEGINNING|MIDDLE|ENDING","section_name":"","order_in_act":1,"summary":"","story_function":"","payload_function":"","major_event":"","conflict":"","character_changes":"","important_location_ids":"LOC_001","location_needs":"","target_length":""}]}'].join('\n');
  const out=smGemini_(prompt,'BUILD_STRUCTURE');
  smReplace_('STRUCTURE',(out.structure||[]).map(function(x,i){return {STRUCTURE_ID:x.structure_id||('STRUCT_'+smPad_(i+1,3)),PARENT_ID:x.parent_id||'',ACT:smAct_(x.act),SECTION_NAME:x.section_name||'',ORDER_IN_ACT:x.order_in_act||i+1,SUMMARY:x.summary||'',STORY_FUNCTION:x.story_function||'',PAYLOAD_FUNCTION:x.payload_function||'',MAJOR_EVENT:x.major_event||'',CONFLICT:x.conflict||'',CHARACTER_CHANGES:x.character_changes||'',IMPORTANT_LOCATION_IDS:x.important_location_ids||'',LOCATION_NEEDS:x.location_needs||'',TARGET_LENGTH:x.target_length||'',STATUS:'APPROVED',JSON_REF:''};}));
  return (out.structure||[]).length;
}

function smBuildLocations(){
  const prompt=['Create narrative locations required by the story, BEFORE scenes. Return ONLY JSON.','Context:',JSON.stringify(smContext_(['STORY','PAYLOAD','CHARACTERS','STRUCTURE'])),'LOCATION_ID is narrative location, not RPG Maker Map ID. Capture changing meaning across story. Levels MUST be LOW, MEDIUM, or HIGH.','Schema: {"locations":[{"location_id":"LOC_001","name":"","parent_location_id":"","location_type":"","story_role":"","payload_role":"","meaning_beginning":"","meaning_middle":"","meaning_end":"","atmosphere":"","time_variants":"","weather_variants":"","important_objects":"","required_subareas":"","access_relationships":"","characters_associated":"","map_size_hint":"","exploration_level":"MEDIUM","privacy_level":"MEDIUM"}]}'].join('\n');
  const out=smGemini_(prompt,'BUILD_LOCATIONS'),v=Number(smControl_('Story Version')||1);
  smReplace_('LOCATIONS',(out.locations||[]).map(function(x,i){return {LOCATION_ID:x.location_id||('LOC_'+smPad_(i+1,3)),NAME:x.name||'',PARENT_LOCATION_ID:x.parent_location_id||'',LOCATION_TYPE:x.location_type||'',STORY_ROLE:x.story_role||'',PAYLOAD_ROLE:x.payload_role||'',MEANING_BEGINNING:x.meaning_beginning||'',MEANING_MIDDLE:x.meaning_middle||'',MEANING_END:x.meaning_end||'',ATMOSPHERE:x.atmosphere||'',TIME_VARIANTS:x.time_variants||'',WEATHER_VARIANTS:x.weather_variants||'',IMPORTANT_OBJECTS:x.important_objects||'',REQUIRED_SUBAREAS:x.required_subareas||'',ACCESS_RELATIONSHIPS:x.access_relationships||'',CHARACTERS_ASSOCIATED:x.characters_associated||'',MAP_SIZE_HINT:x.map_size_hint||'',EXPLORATION_LEVEL:smLevel_(x.exploration_level),PRIVACY_LEVEL:smLevel_(x.privacy_level),STATUS:'APPROVED',VERSION:v,JSON_REF:''};}));
  return (out.locations||[]).length;
}

function smGenerateScenes(){
  const prompt=['Create final scene dataset. Return ONLY JSON.','Context:',JSON.stringify(smContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS','STRUCTURE','LOCATIONS'])),'Every scene MUST use an existing LOCATION_ID. Separate chronology_order from presentation_order. Record character state changes.','Schema: {"scenes":[{"scene_id":"SCENE_001","structure_id":"STRUCT_001","chronology_order":1,"presentation_order":1,"title":"","summary":"","story_function":"","payload_function":"","payload_importance":0.8,"location_id":"LOC_001","location_area":"","time":"","weather":"","atmosphere":"","characters":"CHAR_001","entry_state_ref":"STATE_001_BEFORE","character_changes":"","exit_state_ref":"STATE_001_AFTER","experience_profile_id":"EXP_001","setup":"","payoff":"","required_objects":"","required_assets":"","music_mood":"","npc_needs":"","transition_in":"","transition_out":""}],"character_states":[{"state_id":"STATE_001","scene_id":"SCENE_001","character_id":"CHAR_001","before_state":"","change":"","after_state":"","trust":"","openness":"","fear":"","goal":"","belief":"","relationship_changes":"","emotional_state":"","change_reason":""}]}'].join('\n');
  const out=smGemini_(prompt,'GENERATE_SCENES'),v=Number(smControl_('Story Version')||1);
  const scenes=(out.scenes||[]).map(function(x,i){return {SCENE_ID:x.scene_id||('SCENE_'+smPad_(i+1,3)),STRUCTURE_ID:x.structure_id||'',CHRONOLOGY_ORDER:smNum_(x.chronology_order,i+1,0,9999),PRESENTATION_ORDER:smNum_(x.presentation_order,i+1,0,9999),TITLE:x.title||'',SUMMARY:x.summary||'',STORY_FUNCTION:x.story_function||'',PAYLOAD_FUNCTION:x.payload_function||'',PAYLOAD_IMPORTANCE:smNum_(x.payload_importance,0.5,0,1),LOCATION_ID:x.location_id||'',LOCATION_AREA:x.location_area||'',TIME:x.time||'',WEATHER:x.weather||'',ATMOSPHERE:x.atmosphere||'',CHARACTERS:x.characters||'',ENTRY_STATE_REF:x.entry_state_ref||'',CHARACTER_CHANGES:x.character_changes||'',EXIT_STATE_REF:x.exit_state_ref||'',EXPERIENCE_PROFILE_ID:x.experience_profile_id||('EXP_'+smPad_(i+1,3)),SETUP:x.setup||'',PAYOFF:x.payoff||'',REQUIRED_OBJECTS:x.required_objects||'',REQUIRED_ASSETS:x.required_assets||'',MUSIC_MOOD:x.music_mood||'',NPC_NEEDS:x.npc_needs||'',TRANSITION_IN:x.transition_in||'',TRANSITION_OUT:x.transition_out||'',STATUS:'APPROVED',VERSION:v,JSON_REF:''};});
  smReplace_('SCENES',scenes);
  smReplace_('CHARACTER_STATE',(out.character_states||[]).map(function(x,i){return {STATE_ID:x.state_id||('STATE_'+smPad_(i+1,3)),SCENE_ID:x.scene_id||'',CHARACTER_ID:x.character_id||'',BEFORE_STATE:x.before_state||'',CHANGE:x.change||'',AFTER_STATE:x.after_state||'',TRUST:x.trust||'',OPENNESS:x.openness||'',FEAR:x.fear||'',GOAL:x.goal||'',BELIEF:x.belief||'',RELATIONSHIP_CHANGES:x.relationship_changes||'',EMOTIONAL_STATE:x.emotional_state||'',CHANGE_REASON:x.change_reason||'',SOURCE:'AI_GENERATED',STATUS:'APPROVED',VERSION:v,JSON_REF:''};}));
  smUpdateCharacterSceneBounds_(scenes);
  return scenes.length;
}

function smComposeExperience(){
  const prompt=['Compose player-facing experience and presentation order. Return ONLY JSON.','Context:',JSON.stringify(smContext_(['PAYLOAD','AUDIENCE','SCENES','CHARACTER_STATE'])),'Experience scores MUST total exactly 10. Value is primary overall ~60 and audience adaptation ~40, not mechanically per scene.','Schema: {"experience":[{"experience_profile_id":"EXP_001","scene_id":"SCENE_001","audience_version":"1","value_priority":60,"audience_priority":40,"emotion":3,"curiosity":2,"humor":0,"stimulation":1,"warmth":2,"strategy":0,"achievement":1,"other_1_label":"","other_1_score":1,"curve_segment":"","ordering_technique":"","reason":"","presentation_order":1}]}'].join('\n');
  const out=smGemini_(prompt,'COMPOSE_EXPERIENCE'),exp=out.experience||[];
  exp.forEach(smNormalize10_);
  smReplace_('EXPERIENCE',exp.map(function(x,i){return {EXPERIENCE_PROFILE_ID:x.experience_profile_id||('EXP_'+smPad_(i+1,3)),SCENE_ID:x.scene_id||'',AUDIENCE_VERSION:String(x.audience_version||smControl_('Audience Version')||1),VALUE_PRIORITY:smNum_(x.value_priority,60,0,100),AUDIENCE_PRIORITY:smNum_(x.audience_priority,40,0,100),EMOTION:x.emotion||0,CURIOSITY:x.curiosity||0,HUMOR:x.humor||0,STIMULATION:x.stimulation||0,WARMTH:x.warmth||0,STRATEGY:x.strategy||0,ACHIEVEMENT:x.achievement||0,OTHER_1_LABEL:x.other_1_label||'',OTHER_1_SCORE:x.other_1_score||0,TOTAL_SCORE:10,CURVE_SEGMENT:x.curve_segment||'',ORDERING_TECHNIQUE:x.ordering_technique||'',REASON:x.reason||''};}));
  smApplyOrder_(exp);
  return exp.length;
}

function smValidateStory(){
  const issues=[],loc=smRows_('LOCATIONS'),sc=smRows_('SCENES'),ex=smRows_('EXPERIENCE'),st=smRows_('CHARACTER_STATE');
  const lids=new Set(loc.map(function(x){return String(x.LOCATION_ID||'');}).filter(Boolean)),sids=new Set(sc.map(function(x){return String(x.SCENE_ID||'');}).filter(Boolean));
  sc.forEach(function(x){if(!x.LOCATION_ID||!lids.has(String(x.LOCATION_ID)))issues.push(smIssue_('SCENE',x.SCENE_ID,'LOCATION_REFERENCE','FAIL','HIGH','Scene references missing LOCATION_ID.',String(x.LOCATION_ID||''),'Assign existing LOCATION_ID.',false));});
  ex.forEach(function(x){const total=Number(x.EMOTION||0)+Number(x.CURIOSITY||0)+Number(x.HUMOR||0)+Number(x.STIMULATION||0)+Number(x.WARMTH||0)+Number(x.STRATEGY||0)+Number(x.ACHIEVEMENT||0)+Number(x.OTHER_1_SCORE||0);if(Math.abs(total-10)>0.001)issues.push(smIssue_('EXPERIENCE',x.SCENE_ID,'EXPERIENCE_TOTAL','FAIL','MEDIUM','Experience scores must total 10.','Total='+total,'Rebalance to 10.',true));if(!sids.has(String(x.SCENE_ID||'')))issues.push(smIssue_('EXPERIENCE',x.SCENE_ID,'SCENE_REFERENCE','FAIL','HIGH','Experience references missing scene.','','Assign existing SCENE_ID.',false));});
  st.forEach(function(x){if(!sids.has(String(x.SCENE_ID||'')))issues.push(smIssue_('CHARACTER_STATE',x.SCENE_ID,'SCENE_REFERENCE','FAIL','HIGH','Character state references missing scene.','','Assign existing SCENE_ID.',false));});
  const prompt=['Strict narrative QA. Return ONLY JSON.','Context:',JSON.stringify(smContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS','STRUCTURE','LOCATIONS','SCENES','EXPERIENCE','CHARACTER_STATE'])),'Check story logic, character continuity, timeline, location continuity, setup/payoff, redundancy, motivation, payload alignment, audience fit.','Schema: {"checks":[{"scope":"STORY|SCENE|CHARACTER|LOCATION|EXPERIENCE","target_id":"","check_type":"","result":"PASS|WARN|FAIL","score":0,"severity":"INFO|LOW|MEDIUM|HIGH|CRITICAL","issue":"","evidence":"","suggested_fix":"","auto_fix_allowed":false,"payload_impact":"","audience_impact":""}]}'].join('\n');
  const ai=smGemini_(prompt,'VALIDATE_STORY');
  (ai.checks||[]).forEach(function(c){issues.push({scope:c.scope||'STORY',target_id:c.target_id||'',check_type:c.check_type||'AI_REVIEW',result:smResult_(c.result),score:c.score==null?'':c.score,severity:smSeverity_(c.severity),issue:c.issue||'',evidence:c.evidence||'',suggested_fix:c.suggested_fix||'',auto_fix_allowed:!!c.auto_fix_allowed,payload_impact:c.payload_impact||'',audience_impact:c.audience_impact||''});});
  if(!issues.length)issues.push(smIssue_('STORY','','BASELINE','PASS','INFO','No blocking issues detected.','','',false));
  smReplace_('VALIDATION',issues.map(function(x,i){return {VALIDATION_ID:'VAL_'+smPad_(i+1,3)+'_'+Date.now(),RUN_AT:new Date(),SCOPE:x.scope,TARGET_ID:x.target_id,CHECK_TYPE:x.check_type,RESULT:smResult_(x.result),SCORE:x.score,SEVERITY:smSeverity_(x.severity),ISSUE:x.issue,EVIDENCE:x.evidence,SUGGESTED_FIX:x.suggested_fix,AUTO_FIX_ALLOWED:!!x.auto_fix_allowed,PAYLOAD_IMPACT:x.payload_impact||'',AUDIENCE_IMPACT:x.audience_impact||'',STATUS:'OPEN',JSON_REF:''};}));
  return !issues.some(function(x){return smResult_(x.result)==='FAIL';});
}

function smFinalizeStory(){
  if(smRows_('VALIDATION').some(function(x){return String(x.RESULT)==='FAIL';})) throw new Error('Validation FAIL이 있어 FINALIZE를 중단합니다.');
  const v=Number(smControl_('Story Version')||1),now=new Date(),rows=[];
  smRows_('LOCATIONS').forEach(function(x,i){rows.push({TYPE:'LOCATION',ENTITY_ID:x.LOCATION_ID,VERSION:v,STATUS:'FINAL',ORDER:i+1,PARENT_ID:x.PARENT_LOCATION_ID||'',TITLE_NAME:x.NAME||'',STORY_SUMMARY:x.STORY_ROLE||'',STORY_FUNCTION:x.STORY_ROLE||'',PAYLOAD_FUNCTION:x.PAYLOAD_ROLE||'',LOCATION_ID:x.LOCATION_ID,LOCATION_ROLE:x.LOCATION_TYPE||'',CHARACTERS:x.CHARACTERS_ASSOCIATED||'',CHARACTER_STATE_REF:'',CHRONOLOGY_ORDER:'',PRESENTATION_ORDER:'',EXPERIENCE_PROFILE_ID:'',TIME:x.TIME_VARIANTS||'',WEATHER:x.WEATHER_VARIANTS||'',ATMOSPHERE:x.ATMOSPHERE||'',REQUIRED_OBJECTS:x.IMPORTANT_OBJECTS||'',MAP_REQUIREMENTS:[x.MAP_SIZE_HINT,x.REQUIRED_SUBAREAS,x.ACCESS_RELATIONSHIPS].filter(Boolean).join(' | '),ASSET_REQUIREMENTS:x.IMPORTANT_OBJECTS||'',EVENT_REQUIREMENTS:'',SOURCE_VERSION:v,APPROVED_AT:now,EXPORT_STATUS:'READY',JSON_PAYLOAD:JSON.stringify(x)});});
  smRows_('SCENES').forEach(function(x,i){rows.push({TYPE:'SCENE',ENTITY_ID:x.SCENE_ID,VERSION:v,STATUS:'FINAL',ORDER:Number(x.PRESENTATION_ORDER||i+1),PARENT_ID:x.STRUCTURE_ID||'',TITLE_NAME:x.TITLE||'',STORY_SUMMARY:x.SUMMARY||'',STORY_FUNCTION:x.STORY_FUNCTION||'',PAYLOAD_FUNCTION:x.PAYLOAD_FUNCTION||'',LOCATION_ID:x.LOCATION_ID||'',LOCATION_ROLE:x.LOCATION_AREA||'',CHARACTERS:x.CHARACTERS||'',CHARACTER_STATE_REF:[x.ENTRY_STATE_REF,x.EXIT_STATE_REF].filter(Boolean).join(' → '),CHRONOLOGY_ORDER:x.CHRONOLOGY_ORDER||'',PRESENTATION_ORDER:x.PRESENTATION_ORDER||'',EXPERIENCE_PROFILE_ID:x.EXPERIENCE_PROFILE_ID||'',TIME:x.TIME||'',WEATHER:x.WEATHER||'',ATMOSPHERE:x.ATMOSPHERE||'',REQUIRED_OBJECTS:x.REQUIRED_OBJECTS||'',MAP_REQUIREMENTS:[x.LOCATION_AREA,x.TRANSITION_IN,x.TRANSITION_OUT].filter(Boolean).join(' | '),ASSET_REQUIREMENTS:x.REQUIRED_ASSETS||'',EVENT_REQUIREMENTS:[x.NPC_NEEDS,x.SETUP,x.PAYOFF].filter(Boolean).join(' | '),SOURCE_VERSION:v,APPROVED_AT:now,EXPORT_STATUS:'READY',JSON_PAYLOAD:JSON.stringify(x)});});
  smReplace_('FINAL',rows);
  return rows.length;
}

function smExportToMap(){const s=smSheet_('FINAL'),h=smHeaders_(s),c=h.indexOf('EXPORT_STATUS')+1,last=s.getLastRow();if(c>0&&last>1)s.getRange(2,c,last-1,1).setValue('EXPORTED');return last>1?last-1:0;}

function smSaveVersion(){
  const id='V_'+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss');
  smAppend_('VERSIONS',[{VERSION_ID:id,CREATED_AT:new Date(),PROJECT_ID:smControl_('Project ID')||'GAME_001',STORY_VERSION:smControl_('Story Version')||0,PAYLOAD_VERSION:smControl_('Payload Version')||0,AUDIENCE_VERSION:smControl_('Audience Version')||0,CHARACTERS_VERSION:smRows_('CHARACTERS').length,STRUCTURE_VERSION:smRows_('STRUCTURE').length,LOCATIONS_VERSION:smRows_('LOCATIONS').length,SCENES_VERSION:smRows_('SCENES').length,EXPERIENCE_VERSION:smRows_('EXPERIENCE').length,VALIDATION_RUN_ID:'',GIT_COMMIT:'',SUPABASE_SNAPSHOT_ID:'',BUILD_ID:'',STATUS:'SNAPSHOT',NOTES:'Online runtime v3 snapshot',JSON_MANIFEST_REF:''}]);return id;
}

function smGemini_(prompt,label){
  const key=PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');if(!key)throw new Error('GEMINI_API_KEY missing');
  const r=UrlFetchApp.fetch(SM.ENDPOINT,{method:'post',contentType:'application/json',headers:{'x-goog-api-key':key},payload:JSON.stringify({model:SM.MODEL,input:[{type:'text',text:prompt}],response_format:{type:'text'}}),muteHttpExceptions:true});
  const code=r.getResponseCode(),body=r.getContentText();if(code<200||code>=300)throw new Error(label+' Gemini API '+code+': '+body.slice(0,600));
  const j=JSON.parse(body),text=smText_(j);if(!text)throw new Error(label+' returned no text');
  try{return JSON.parse(String(text).trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));}catch(e){throw new Error(label+' invalid JSON: '+String(text).slice(0,600));}
}
function smText_(j){if(j&&typeof j.output_text==='string')return j.output_text;const a=[];(function w(v){if(!v)return;if(Array.isArray(v)){v.forEach(w);return;}if(typeof v==='object'){if((v.type==='text'||v.type==='output_text')&&typeof v.text==='string')a.push(v.text);Object.keys(v).forEach(function(k){w(v[k]);});}})(j);return a.join('\n');}

function smSs_(){return SpreadsheetApp.openById(SM.SPREADSHEET_ID);}
function smSheet_(n){const s=smSs_().getSheetByName(n);if(!s)throw new Error('Missing sheet: '+n);return s;}
function smHeaders_(s){return s.getRange(1,1,1,s.getLastColumn()).getDisplayValues()[0];}
function smRows_(n){const s=smSheet_(n),h=smHeaders_(s),last=s.getLastRow();if(last<2)return[];return s.getRange(2,1,last-1,h.length).getValues().map(function(r){const o={};h.forEach(function(k,i){o[k]=r[i];});return o;}).filter(function(o){return h.some(function(k){return o[k]!==''&&o[k]!=null;});});}
function smContext_(names){const o={};names.forEach(function(n){o[n]=smRows_(n);});return o;}
function smClear_(n){const s=smSheet_(n);if(s.getLastRow()>1)s.getRange(2,1,s.getLastRow()-1,s.getLastColumn()).clearContent();}
function smReplace_(n,objs){smClear_(n);smAppend_(n,objs);}
function smAppend_(n,objs){if(!objs||!objs.length)return;const s=smSheet_(n),h=smHeaders_(s),rows=objs.map(function(o){return h.map(function(k){return Object.prototype.hasOwnProperty.call(o,k)?o[k]:'';});});s.getRange(s.getLastRow()+1,1,rows.length,h.length).setValues(rows);}
function smControlMap_(){const s=smSheet_('CONTROL'),vals=s.getRange(1,1,Math.min(40,s.getMaxRows()),2).getValues(),o={};vals.forEach(function(r,i){if(String(r[0]||''))o[String(r[0])]={row:i+1,value:r[1]};});return o;}
function smControl_(label){const m=smControlMap_();return m[label]?m[label].value:'';}
function smSetControl_(label,v){const m=smControlMap_();if(m[label])smSheet_('CONTROL').getRange(m[label].row,2).setValue(v);}
function smSetControls_(obj){const s=smSheet_('CONTROL'),vals=s.getRange(1,1,Math.min(40,s.getMaxRows()),2).getValues();let dirty=false;vals.forEach(function(r){const k=String(r[0]||'');if(Object.prototype.hasOwnProperty.call(obj,k)){r[1]=obj[k];dirty=true;}});if(dirty)s.getRange(1,1,vals.length,2).setValues(vals);}
function smMarkInputs_(inputs,v){const s=smSheet_('INPUT'),h=smHeaders_(s),last=s.getLastRow();if(last<2)return;const idc=h.indexOf('INPUT_ID'),pc=h.indexOf('PROCESSED'),vc=h.indexOf('PROCESS_VERSION');if(idc<0||pc<0)return;const vals=s.getRange(2,1,last-1,h.length).getValues(),ids=new Set(inputs.map(function(x){return String(x.INPUT_ID||'');}));vals.forEach(function(r){if(ids.has(String(r[idc]||''))){r[pc]=true;if(vc>=0)r[vc]=v;}});s.getRange(2,1,vals.length,h.length).setValues(vals);}
function smApplyOrder_(exp){const m={};exp.forEach(function(x){m[String(x.scene_id||'')]=x.presentation_order;});const s=smSheet_('SCENES'),h=smHeaders_(s),last=s.getLastRow(),ic=h.indexOf('SCENE_ID'),pc=h.indexOf('PRESENTATION_ORDER');if(last<2||ic<0||pc<0)return;const vals=s.getRange(2,1,last-1,h.length).getValues();vals.forEach(function(r){const id=String(r[ic]||'');if(m[id]!=null)r[pc]=m[id];});s.getRange(2,1,vals.length,h.length).setValues(vals);}
function smUpdateCharacterSceneBounds_(scenes){const s=smSheet_('CHARACTERS'),h=smHeaders_(s),last=s.getLastRow();if(last<2)return;const idc=h.indexOf('CHARACTER_ID'),fc=h.indexOf('FIRST_SCENE_ID'),lc=h.indexOf('LAST_SCENE_ID');if(idc<0||fc<0||lc<0)return;const vals=s.getRange(2,1,last-1,h.length).getValues();vals.forEach(function(r){const id=String(r[idc]||''),matches=scenes.filter(function(x){return String(x.CHARACTERS||'').split(',').map(function(q){return q.trim();}).indexOf(id)>=0;}).sort(function(a,b){return Number(a.CHRONOLOGY_ORDER)-Number(b.CHRONOLOGY_ORDER);});if(matches.length){r[fc]=matches[0].SCENE_ID;r[lc]=matches[matches.length-1].SCENE_ID;}});s.getRange(2,1,vals.length,h.length).setValues(vals);}
function smNormalize10_(x){const ks=['emotion','curiosity','humor','stimulation','warmth','strategy','achievement','other_1_score'];let a=ks.map(function(k){return Math.max(0,Number(x[k]||0));}),sum=a.reduce(function(p,c){return p+c;},0);if(!sum){x.curiosity=10;return;}a=a.map(function(v){return Math.round(v/sum*100)/10;});let d=Math.round((10-a.reduce(function(p,c){return p+c;},0))*10)/10;a[0]=Math.max(0,Math.round((a[0]+d)*10)/10);ks.forEach(function(k,i){x[k]=a[i];});}
function smLevel_(v){const s=String(v||'').toUpperCase();if(s.indexOf('HIGH')>=0&&s.indexOf('MEDIUM')<0)return'HIGH';if(s.indexOf('LOW')>=0&&s.indexOf('MEDIUM')<0)return'LOW';return'MEDIUM';}
function smAct_(v){const s=String(v||'').toUpperCase();if(s.indexOf('BEGIN')>=0)return'BEGINNING';if(s.indexOf('END')>=0)return'ENDING';return'MIDDLE';}
function smResult_(v){const s=String(v||'').toUpperCase();return s==='FAIL'?'FAIL':s==='WARN'?'WARN':'PASS';}
function smSeverity_(v){const s=String(v||'').toUpperCase();return ['INFO','LOW','MEDIUM','HIGH','CRITICAL'].indexOf(s)>=0?s:'INFO';}
function smNum_(v,d,min,max){let n=Number(v);if(!isFinite(n))n=d;return Math.max(min,Math.min(max,n));}
function smPad_(n,l){return String(n).padStart(l,'0');}
function smGet_(o,path){return path.split('.').reduce(function(v,k){return v&&v[k]!=null?v[k]:'';},o)||'';}
function smIssue_(scope,target,check,result,severity,issue,evidence,fix,auto){return{scope:scope,target_id:target,check_type:check,result:result,score:'',severity:severity,issue:issue,evidence:evidence,suggested_fix:fix,auto_fix_allowed:auto,payload_impact:'',audience_impact:''};}
function smLog_(op,status,msg,error){try{smAppend_('LOG',[{LOG_ID:'LOG_'+Utilities.getUuid(),CREATED_AT:new Date(),OPERATION:op,SOURCE:'APPS_SCRIPT_REMOTE',INPUT_IDS:'',INPUT_VERSION:smControl_('Story Version')||0,OUTPUT_ENTITY:'',OUTPUT_VERSION:smControl_('Story Version')||0,MODEL:SM.MODEL,PROMPT_REF:'',CONTEXT_REF:'',RESPONSE_REF:'',PARSER_RESULT:msg||'',CHANGE_SUMMARY:'',STATUS:status==='FAILED'?'FAILED':status==='WARN'?'WARN':'SUCCESS',ERROR:error||''}]);}catch(e){}}
