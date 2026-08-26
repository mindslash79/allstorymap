/* 1 STORY MAKER — Online Runtime v2
 * No secrets in this file. GEMINI_API_KEY stays in Apps Script Properties.
 */
const SM=Object.freeze({
  SPREADSHEET_ID:'1LJWMMbZudbTJUbMdaJPPRDV9FrIucv8HHMopB9n6o_Y',
  MODEL:'gemini-3.6-flash',
  ENDPOINT:'https://generativelanguage.googleapis.com/v1beta/interactions',
  Q:'COMMAND_QUEUE'
});

function smRunAction_(action){
  // Time-driven triggers pass an event object. Treat any non-string as queue polling.
  if(typeof action!=='string') return smProcessRemoteQueue_();
  smEnsureRemoteTrigger_();
  return smRunNamedAction_(action);
}

function smRunNamedAction_(action){
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
    smLog_(action,'FAILED','Failed',err && err.message ? err.message : String(err));
    throw err;
  }
}

function smEnsureRemoteTrigger_(){
  try{
    const exists=ScriptApp.getProjectTriggers().some(function(t){
      return t.getHandlerFunction()==='runStoryMakerOnline_' && String(t.getEventType())==='CLOCK';
    });
    if(!exists){
      ScriptApp.newTrigger('runStoryMakerOnline_').timeBased().everyMinutes(1).create();
    }
    smSetControl_('Automation State','LIVE · ONLINE RUNTIME · REMOTE QUEUE');
  }catch(e){
    // Main action should still work even if trigger creation is temporarily blocked.
    smSetControl_('Automation State','LIVE · ONLINE RUNTIME · REMOTE SETUP ERROR');
  }
}

function smProcessRemoteQueue_(){
  const sh=smSheet_(SM.Q);
  const last=sh.getLastRow();
  if(last<2) return;
  const vals=sh.getRange(2,1,last-1,9).getValues();
  for(let i=0;i<vals.length;i++){
    const row=i+2;
    const id=String(vals[i][0]||'');
    const action=String(vals[i][2]||'').trim();
    const status=String(vals[i][3]||'').trim();
    if(status!=='PENDING') continue;
    sh.getRange(row,4).setValue('RUNNING');
    sh.getRange(row,6).setValue(new Date());
    try{
      const result=smRunNamedAction_(action);
      sh.getRange(row,4).setValue('DONE');
      sh.getRange(row,7).setValue(new Date());
      sh.getRange(row,8).setValue(result===undefined?'OK':String(result));
      sh.getRange(row,9).clearContent();
    }catch(err){
      sh.getRange(row,4).setValue('ERROR');
      sh.getRange(row,7).setValue(new Date());
      sh.getRange(row,9).setValue(err && err.message ? err.message : String(err));
    }
    return; // one command per minute to avoid overlapping long runs
  }
}

function smBuildAll(){
  smDevelopStory();
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

function smDevelopStory(){
  const inputs=smRows_('INPUT').filter(function(r){return String(r.RAW_INPUT||'').trim() && r.PROCESSED!==true && String(r.PROCESSED).toUpperCase()!=='TRUE';});
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
  const sv=Number(smControl_('Story Version')||0)+1;
  const pv=Number(smControl_('Payload Version')||0)+1;
  const av=Number(smControl_('Audience Version')||0)+1;
  smReplace_('STORY',[{
    STORY_VERSION:sv,STATUS:'APPROVED',PREMISE:out.story&&out.story.premise||'',OVERALL_STORY:out.story&&out.story.overall_story||'',BEGINNING:out.story&&out.story.beginning||'',MIDDLE:out.story&&out.story.middle||'',ENDING:out.story&&out.story.ending||'',CHRONOLOGY_NOTES:out.story&&out.story.chronology_notes||'',CREATOR_NOTES:out.story&&out.story.creator_notes||'',SOURCE_INPUT_IDS:inputs.map(function(x){return x.INPUT_ID;}).join(','),APPROVED_AT:new Date(),JSON_REF:''
  }]);
  const sec=(out.payload&&out.payload.secondary_values)||[];
  smReplace_('PAYLOAD',[{
    PAYLOAD_VERSION:pv,STATUS:'APPROVED',PRIMARY_PAYLOAD:out.payload&&out.payload.primary_payload||'',SECONDARY_VALUE_1:sec[0]||'',SECONDARY_VALUE_2:sec[1]||'',SECONDARY_VALUE_3:sec[2]||'',PLAYER_BEFORE:out.payload&&out.payload.player_before||'',PLAYER_DURING:out.payload&&out.payload.player_during||'',PLAYER_AFTER:out.payload&&out.payload.player_after||'',VALUE_PRIORITY:smNum_(out.payload&&out.payload.value_priority,60,0,100),AUDIENCE_PRIORITY:smNum_(out.payload&&out.payload.audience_priority,40,0,100),JSON_REF:''
  }]);
  const a=out.audience||{};
  smReplace_('AUDIENCE',[{
    AUDIENCE_VERSION:av,STATUS:'APPROVED',AI_RECOMMENDED:a.ai_recommended||'',CREATOR_SELECTED:a.creator_selected||a.ai_recommended||'',AGE_RANGE:a.age_range||'',PSYCHOGRAPHIC:a.psychographic||'',GAME_PREFERENCES:a.game_preferences||'',SLOW_PACING_TOLERANCE:smLevel_(a.slow_pacing_tolerance),AMBIGUITY_TOLERANCE:smLevel_(a.ambiguity_tolerance),EMOTIONAL_INTENSITY:smLevel_(a.emotional_intensity),MECHANICAL_COMPLEXITY:smLevel_(a.mechanical_complexity),HUMOR_PREFERENCE:smLevel_(a.humor_preference),REASON:a.reason||'',JSON_REF:''
  }]);
  smReplace_('CHARACTERS',(out.characters||[]).map(function(c,i){return {
    CHARACTER_ID:c.character_id||('CHAR_'+smPad_(i+1,3)),NAME:c.name||'',ROLE:c.role||'',AGE:c.age||'',PERSONALITY:c.personality||'',WANT:c.want||'',FEAR:c.fear||'',BACKGROUND:c.background||'',APPEARANCE:c.appearance||'',SPEECH_STYLE:c.speech_style||'',HABITS:c.habits||'',RELATIONSHIPS:c.relationships||'',STARTING_STATE:c.starting_state||'',INTERNAL_CONFLICT:c.internal_conflict||'',ARC_SUMMARY:c.arc_summary||'',CURRENT_STATE:c.current_state||c.starting_state||'',VISUAL_NOTES:c.visual_notes||'',FIRST_SCENE_ID:'',LAST_SCENE_ID:'',STATUS:'APPROVED',VERSION:sv,JSON_REF:''
  };}));
  smMarkInputs_(inputs,sv);
  smSetControl_('Story Version',sv);smSetControl_('Payload Version',pv);smSetControl_('Audience Version',av);
  smSetControl_('Primary Audience',a.creator_selected||a.ai_recommended||'');
}

function smReviewPayload(){
  const prompt='Review and improve payload/audience alignment without changing creator intent. Return ONLY JSON with keys payload and audience. Context: '+JSON.stringify(smContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS']));
  const out=smGemini_(prompt,'REVIEW_PAYLOAD');
  if(out.payload){const p=out.payload;const sec=p.secondary_values||[];smReplace_('PAYLOAD',[{PAYLOAD_VERSION:Number(smControl_('Payload Version')||0)+1,STATUS:'APPROVED',PRIMARY_PAYLOAD:p.primary_payload||p.primary_value||'',SECONDARY_VALUE_1:sec[0]||'',SECONDARY_VALUE_2:sec[1]||'',SECONDARY_VALUE_3:sec[2]||'',PLAYER_BEFORE:p.player_before||p.intended_before||'',PLAYER_DURING:p.player_during||p.intended_during||'',PLAYER_AFTER:p.player_after||p.intended_after||'',VALUE_PRIORITY:smNum_(p.value_priority,60,0,100),AUDIENCE_PRIORITY:smNum_(p.audience_priority,40,0,100),JSON_REF:''}]);smSetControl_('Payload Version',Number(smControl_('Payload Version')||0)+1);}
  if(out.audience){const a=out.audience;smReplace_('AUDIENCE',[{AUDIENCE_VERSION:Number(smControl_('Audience Version')||0)+1,STATUS:'APPROVED',AI_RECOMMENDED:a.ai_recommended||'',CREATOR_SELECTED:a.creator_selected||a.ai_recommended||'',AGE_RANGE:a.age_range||a.primary_age||'',PSYCHOGRAPHIC:a.psychographic||'',GAME_PREFERENCES:a.game_preferences||'',SLOW_PACING_TOLERANCE:smLevel_(a.slow_pacing_tolerance),AMBIGUITY_TOLERANCE:smLevel_(a.ambiguity_tolerance),EMOTIONAL_INTENSITY:smLevel_(a.emotional_intensity),MECHANICAL_COMPLEXITY:smLevel_(a.mechanical_complexity),HUMOR_PREFERENCE:smLevel_(a.humor_preference),REASON:a.reason||a.rationale||'',JSON_REF:''}]);smSetControl_('Audience Version',Number(smControl_('Audience Version')||0)+1);}
}

function smBuildStructure(){
  const prompt=['Expand the story into narrative blocks BEFORE scenes. Return ONLY JSON.','Context:',JSON.stringify(smContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS'])),'Divide BEGINNING/MIDDLE/ENDING naturally; do not force equal size. Important locations must emerge here.','Schema: {"structure":[{"structure_id":"STRUCT_001","parent_id":"","act":"BEGINNING|MIDDLE|ENDING","section_name":"","order_in_act":1,"summary":"","story_function":"","payload_function":"","major_event":"","conflict":"","character_changes":"","important_location_ids":"LOC_001","location_needs":"","target_length":""}]}'].join('\n');
  const out=smGemini_(prompt,'BUILD_STRUCTURE');
  smReplace_('STRUCTURE',(out.structure||[]).map(function(x,i){return {STRUCTURE_ID:x.structure_id||('STRUCT_'+smPad_(i+1,3)),PARENT_ID:x.parent_id||'',ACT:smAct_(x.act),SECTION_NAME:x.section_name||'',ORDER_IN_ACT:x.order_in_act||i+1,SUMMARY:x.summary||'',STORY_FUNCTION:x.story_function||'',PAYLOAD_FUNCTION:x.payload_function||'',MAJOR_EVENT:x.major_event||'',CONFLICT:x.conflict||'',CHARACTER_CHANGES:x.character_changes||'',IMPORTANT_LOCATION_IDS:x.important_location_ids||'',LOCATION_NEEDS:x.location_needs||'',TARGET_LENGTH:x.target_length||'',STATUS:'APPROVED',JSON_REF:''};}));
}

function smBuildLocations(){
  const prompt=['Create narrative locations required by the story, BEFORE scenes. Return ONLY JSON.','Context:',JSON.stringify(smContext_(['STORY','PAYLOAD','CHARACTERS','STRUCTURE'])),'LOCATION_ID is narrative location, not RPG Maker Map ID. Preserve suggested location IDs from STRUCTURE when practical. Capture changing meaning across story. exploration_level/privacy_level MUST be LOW, MEDIUM, or HIGH.','Schema: {"locations":[{"location_id":"LOC_001","name":"","parent_location_id":"","location_type":"","story_role":"","payload_role":"","meaning_beginning":"","meaning_middle":"","meaning_end":"","atmosphere":"","time_variants":"","weather_variants":"","important_objects":"","required_subareas":"","access_relationships":"","characters_associated":"","map_size_hint":"","exploration_level":"MEDIUM","privacy_level":"MEDIUM"}]}'].join('\n');
  const out=smGemini_(prompt,'BUILD_LOCATIONS');
  const v=Number(smControl_('Story Version')||1);
  smReplace_('LOCATIONS',(out.locations||[]).map(function(x,i){return {LOCATION_ID:x.location_id||('LOC_'+smPad_(i+1,3)),NAME:x.name||'',PARENT_LOCATION_ID:x.parent_location_id||'',LOCATION_TYPE:x.location_type||'',STORY_ROLE:x.story_role||'',PAYLOAD_ROLE:x.payload_role||'',MEANING_BEGINNING:x.meaning_beginning||'',MEANING_MIDDLE:x.meaning_middle||'',MEANING_END:x.meaning_end||'',ATMOSPHERE:x.atmosphere||'',TIME_VARIANTS:x.time_variants||'',WEATHER_VARIANTS:x.weather_variants||'',IMPORTANT_OBJECTS:x.important_objects||'',REQUIRED_SUBAREAS:x.required_subareas||'',ACCESS_RELATIONSHIPS:x.access_relationships||'',CHARACTERS_ASSOCIATED:x.characters_associated||'',MAP_SIZE_HINT:x.map_size_hint||'',EXPLORATION_LEVEL:smLevel_(x.exploration_level),PRIVACY_LEVEL:smLevel_(x.privacy_level),STATUS:'APPROVED',VERSION:v,JSON_REF:''};}));
}

function smGenerateScenes(){
  const prompt=['Create the final SCENE dataset. Return ONLY JSON.','Context:',JSON.stringify(smContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS','STRUCTURE','LOCATIONS'])),'Every scene MUST use an existing LOCATION_ID. Separate chronology_order from presentation_order. Record character state changes. Requirements describe needs only; do not implement maps/assets/events.','Schema: {"scenes":[{"scene_id":"SCENE_001","structure_id":"STRUCT_001","chronology_order":1,"presentation_order":1,"title":"","summary":"","story_function":"","payload_function":"","payload_importance":0.8,"location_id":"LOC_001","location_area":"","time":"","weather":"","atmosphere":"","characters":"CHAR_001","entry_state_ref":"STATE_001_BEFORE","character_changes":"","exit_state_ref":"STATE_001_AFTER","experience_profile_id":"EXP_001","setup":"","payoff":"","required_objects":"","required_assets":"","music_mood":"","npc_needs":"","transition_in":"","transition_out":""}],"character_states":[{"state_id":"STATE_001","scene_id":"SCENE_001","character_id":"CHAR_001","before_state":"","change":"","after_state":"","trust":"","openness":"","fear":"","goal":"","belief":"","relationship_changes":"","emotional_state":"","change_reason":""}]}'].join('\n');
  const out=smGemini_(prompt,'GENERATE_SCENES');
  const v=Number(smControl_('Story Version')||1);
  smReplace_('SCENES',(out.scenes||[]).map(function(x,i){return {SCENE_ID:x.scene_id||('SCENE_'+smPad_(i+1,3)),STRUCTURE_ID:x.structure_id||'',CHRONOLOGY_ORDER:x.chronology_order||i+1,PRESENTATION_ORDER:x.presentation_order||i+1,TITLE:x.title||'',SUMMARY:x.summary||'',STORY_FUNCTION:x.story_function||'',PAYLOAD_FUNCTION:x.payload_function||'',PAYLOAD_IMPORTANCE:smNum_(x.payload_importance,0.5,0,1),LOCATION_ID:x.location_id||'',LOCATION_AREA:x.location_area||'',TIME:x.time||'',WEATHER:x.weather||'',ATMOSPHERE:x.atmosphere||'',CHARACTERS:x.characters||'',ENTRY_STATE_REF:x.entry_state_ref||'',CHARACTER_CHANGES:x.character_changes||'',EXIT_STATE_REF:x.exit_state_ref||'',EXPERIENCE_PROFILE_ID:x.experience_profile_id||('EXP_'+smPad_(i+1,3)),SETUP:x.setup||'',PAYOFF:x.payoff||'',REQUIRED_OBJECTS:x.required_objects||'',REQUIRED_ASSETS:x.required_assets||'',MUSIC_MOOD:x.music_mood||'',NPC_NEEDS:x.npc_needs||'',TRANSITION_IN:x.transition_in||'',TRANSITION_OUT:x.transition_out||'',STATUS:'APPROVED',VERSION:v,JSON_REF:''};}));
  smReplace_('CHARACTER_STATE',(out.character_states||[]).map(function(x,i){return {STATE_ID:x.state_id||('STATE_'+smPad_(i+1,4)),SCENE_ID:x.scene_id||'',CHARACTER_ID:x.character_id||'',BEFORE_STATE:x.before_state||'',CHANGE:x.change||'',AFTER_STATE:x.after_state||'',TRUST:x.trust||'',OPENNESS:x.openness||'',FEAR:x.fear||'',GOAL:x.goal||'',BELIEF:x.belief||'',RELATIONSHIP_CHANGES:x.relationship_changes||'',EMOTIONAL_STATE:x.emotional_state||'',CHANGE_REASON:x.change_reason||'',SOURCE:'AI_GENERATED',STATUS:'APPROVED',VERSION:v,JSON_REF:''};}));
}

function smComposeExperience(){
  const prompt=['Compose player-facing experience and presentation order. Return ONLY JSON.','Context:',JSON.stringify(smContext_(['PAYLOAD','AUDIENCE','SCENES','CHARACTER_STATE'])),'Value is primary overall (~60) and audience fit secondary (~40), but not scene by scene. Per scene, emotion+curiosity+humor+stimulation+warmth+strategy+achievement+other_1_score MUST total 10. Design a varied experience curve.','Schema: {"experience":[{"experience_profile_id":"EXP_001","scene_id":"SCENE_001","value_priority":60,"audience_priority":40,"emotion":3,"curiosity":2,"humor":0,"stimulation":1,"warmth":3,"strategy":0,"achievement":1,"other_1_label":"","other_1_score":0,"curve_segment":"OPENING","ordering_technique":"chronological","reason":"","presentation_order":1}]}'].join('\n');
  const out=smGemini_(prompt,'COMPOSE_EXPERIENCE');
  const exp=(out.experience||[]);exp.forEach(smNormalize10_);
  smClear_('EXPERIENCE');
  smAppend_('EXPERIENCE',exp.map(function(x,i){return {EXPERIENCE_PROFILE_ID:x.experience_profile_id||('EXP_'+smPad_(i+1,3)),SCENE_ID:x.scene_id||'',AUDIENCE_VERSION:Number(smControl_('Audience Version')||1),VALUE_PRIORITY:smNum_(x.value_priority,60,0,100),AUDIENCE_PRIORITY:smNum_(x.audience_priority,40,0,100),EMOTION:x.emotion||0,CURIOSITY:x.curiosity||0,HUMOR:x.humor||0,STIMULATION:x.stimulation||0,WARMTH:x.warmth||0,STRATEGY:x.strategy||0,ACHIEVEMENT:x.achievement||0,OTHER_1_LABEL:x.other_1_label||'',OTHER_1_SCORE:x.other_1_score||0,TOTAL_SCORE:10,CURVE_SEGMENT:x.curve_segment||'',ORDERING_TECHNIQUE:x.ordering_technique||'',REASON:x.reason||''};}));
  smApplyOrder_(exp);
}

function smValidateStory(){
  smClear_('VALIDATION');
  const issues=[];const loc=smRows_('LOCATIONS');const sc=smRows_('SCENES');const ex=smRows_('EXPERIENCE');const st=smRows_('CHARACTER_STATE');
  const locIds=new Set(loc.map(x=>String(x.LOCATION_ID||'')));const scIds=new Set(sc.map(x=>String(x.SCENE_ID||'')));
  sc.forEach(function(x){if(!locIds.has(String(x.LOCATION_ID||''))) issues.push(smIssue_('SCENE',x.SCENE_ID,'LOCATION_REFERENCE','FAIL','HIGH','Missing LOCATION_ID',String(x.LOCATION_ID||''),'Assign existing location',false));});
  ex.forEach(function(x){const total=['EMOTION','CURIOSITY','HUMOR','STIMULATION','WARMTH','STRATEGY','ACHIEVEMENT','OTHER_1_SCORE'].reduce((a,k)=>a+Number(x[k]||0),0);if(Math.abs(total-10)>.01) issues.push(smIssue_('EXPERIENCE',x.SCENE_ID,'TOTAL_10','FAIL','MEDIUM','Experience total is '+total,'','Normalize to 10',true));if(!scIds.has(String(x.SCENE_ID||''))) issues.push(smIssue_('EXPERIENCE',x.SCENE_ID,'SCENE_REFERENCE','FAIL','HIGH','Missing scene','','Use existing scene',false));});
  st.forEach(function(x){if(!scIds.has(String(x.SCENE_ID||''))) issues.push(smIssue_('CHARACTER_STATE',x.SCENE_ID,'SCENE_REFERENCE','FAIL','HIGH','Missing scene','','Use existing scene',false));});
  const prompt=['Strict narrative QA. Return ONLY JSON. Use WARN for non-blocking craft concerns; FAIL only for true logical/continuity contradictions that prevent coherent play.','Context:',JSON.stringify(smContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS','STRUCTURE','LOCATIONS','SCENES','EXPERIENCE','CHARACTER_STATE'])),'Check story logic, character continuity, timeline, location continuity, setup/payoff, redundancy, motivation, payload alignment, audience fit, and value-over-audience principle.','Schema: {"checks":[{"scope":"STORY","target_id":"","check_type":"","result":"PASS|WARN|FAIL","score":90,"severity":"INFO|LOW|MEDIUM|HIGH|CRITICAL","issue":"","evidence":"","suggested_fix":"","auto_fix_allowed":false,"payload_impact":"","audience_impact":""}]}'].join('\n');
  const ai=smGemini_(prompt,'VALIDATE_STORY');(ai.checks||[]).forEach(c=>issues.push(c));
  if(!issues.length) issues.push(smIssue_('STORY','','BASELINE','PASS','INFO','No blocking issues','','',false));
  const runAt=new Date();
  smAppend_('VALIDATION',issues.map(function(x,i){return {VALIDATION_ID:'VAL_'+Date.now()+'_'+smPad_(i+1,3),RUN_AT:runAt,SCOPE:x.scope||'',TARGET_ID:x.target_id||'',CHECK_TYPE:x.check_type||'',RESULT:smResult_(x.result),SCORE:x.score==null?'':x.score,SEVERITY:smSeverity_(x.severity),ISSUE:x.issue||'',EVIDENCE:x.evidence||'',SUGGESTED_FIX:x.suggested_fix||'',AUTO_FIX_ALLOWED:!!x.auto_fix_allowed,PAYLOAD_IMPACT:x.payload_impact||'',AUDIENCE_IMPACT:x.audience_impact||'',STATUS:'OPEN',JSON_REF:''};}));
  const fail=issues.some(x=>String(x.result||'').toUpperCase()==='FAIL');
  smSetControl_('Validation Status',fail?'FAIL':'PASS');return !fail;
}

function smFinalizeStory(){
  if(smRows_('VALIDATION').some(x=>String(x.RESULT)==='FAIL')) throw new Error('VALIDATION에 FAIL이 있습니다.');
  const v=Number(smControl_('Story Version')||1), now=new Date(); const rows=[];
  smRows_('LOCATIONS').forEach(function(l){rows.push({TYPE:'LOCATION',ENTITY_ID:l.LOCATION_ID,VERSION:l.VERSION||v,STATUS:'FINAL',ORDER:'',PARENT_ID:l.PARENT_LOCATION_ID,TITLE_NAME:l.NAME,STORY_SUMMARY:l.STORY_ROLE,STORY_FUNCTION:l.STORY_ROLE,PAYLOAD_FUNCTION:l.PAYLOAD_ROLE,LOCATION_ID:l.LOCATION_ID,LOCATION_ROLE:l.STORY_ROLE,CHARACTERS:l.CHARACTERS_ASSOCIATED,CHARACTER_STATE_REF:'',CHRONOLOGY_ORDER:'',PRESENTATION_ORDER:'',EXPERIENCE_PROFILE_ID:'',TIME:l.TIME_VARIANTS,WEATHER:l.WEATHER_VARIANTS,ATMOSPHERE:l.ATMOSPHERE,REQUIRED_OBJECTS:l.IMPORTANT_OBJECTS,MAP_REQUIREMENTS:JSON.stringify({type:l.LOCATION_TYPE,subareas:l.REQUIRED_SUBAREAS,access:l.ACCESS_RELATIONSHIPS,size:l.MAP_SIZE_HINT,exploration:l.EXPLORATION_LEVEL,privacy:l.PRIVACY_LEVEL}),ASSET_REQUIREMENTS:'',EVENT_REQUIREMENTS:'',SOURCE_VERSION:v,APPROVED_AT:now,EXPORT_STATUS:'READY',JSON_PAYLOAD:JSON.stringify(l)});});
  smRows_('SCENES').sort((a,b)=>Number(a.PRESENTATION_ORDER||0)-Number(b.PRESENTATION_ORDER||0)).forEach(function(s){rows.push({TYPE:'SCENE',ENTITY_ID:s.SCENE_ID,VERSION:s.VERSION||v,STATUS:'FINAL',ORDER:s.PRESENTATION_ORDER,PARENT_ID:s.STRUCTURE_ID,TITLE_NAME:s.TITLE,STORY_SUMMARY:s.SUMMARY,STORY_FUNCTION:s.STORY_FUNCTION,PAYLOAD_FUNCTION:s.PAYLOAD_FUNCTION,LOCATION_ID:s.LOCATION_ID,LOCATION_ROLE:s.LOCATION_AREA,CHARACTERS:s.CHARACTERS,CHARACTER_STATE_REF:s.EXIT_STATE_REF,CHRONOLOGY_ORDER:s.CHRONOLOGY_ORDER,PRESENTATION_ORDER:s.PRESENTATION_ORDER,EXPERIENCE_PROFILE_ID:s.EXPERIENCE_PROFILE_ID,TIME:s.TIME,WEATHER:s.WEATHER,ATMOSPHERE:s.ATMOSPHERE,REQUIRED_OBJECTS:s.REQUIRED_OBJECTS,MAP_REQUIREMENTS:JSON.stringify({location:s.LOCATION_ID,area:s.LOCATION_AREA,time:s.TIME,weather:s.WEATHER,atmosphere:s.ATMOSPHERE,objects:s.REQUIRED_OBJECTS}),ASSET_REQUIREMENTS:s.REQUIRED_ASSETS,EVENT_REQUIREMENTS:JSON.stringify({npc:s.NPC_NEEDS,in:s.TRANSITION_IN,out:s.TRANSITION_OUT}),SOURCE_VERSION:v,APPROVED_AT:now,EXPORT_STATUS:'READY',JSON_PAYLOAD:JSON.stringify(s)});});
  smReplace_('FINAL',rows);smSetControl_('Status','FINAL');
}

function smExportToMap(){
  const sh=smSheet_('FINAL'), h=smHeaders_(sh), c=h.indexOf('EXPORT_STATUS')+1;if(c<1||sh.getLastRow()<2) throw new Error('FINAL 데이터가 없습니다.');sh.getRange(2,c,sh.getLastRow()-1,1).setValue('EXPORTED');return 'Marked EXPORTED; Map Maker destination pending';
}

function smSaveVersion(){
  const id='V_'+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss');
  smAppend_('VERSIONS',[{VERSION_ID:id,CREATED_AT:new Date(),PROJECT_ID:smControl_('Project ID')||'GAME_001',STORY_VERSION:smControl_('Story Version')||0,PAYLOAD_VERSION:smControl_('Payload Version')||0,AUDIENCE_VERSION:smControl_('Audience Version')||0,CHARACTERS_VERSION:smRows_('CHARACTERS').length,STRUCTURE_VERSION:smRows_('STRUCTURE').length,LOCATIONS_VERSION:smRows_('LOCATIONS').length,SCENES_VERSION:smRows_('SCENES').length,EXPERIENCE_VERSION:smRows_('EXPERIENCE').length,VALIDATION_RUN_ID:'',GIT_COMMIT:'',SUPABASE_SNAPSHOT_ID:'',BUILD_ID:'',STATUS:'SNAPSHOT',NOTES:'Online runtime snapshot',JSON_MANIFEST_REF:''}]);return id;
}

function smGemini_(prompt,label){
  const key=PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');if(!key) throw new Error('GEMINI_API_KEY missing');
  const r=UrlFetchApp.fetch(SM.ENDPOINT,{method:'post',contentType:'application/json',headers:{'x-goog-api-key':key},payload:JSON.stringify({model:SM.MODEL,input:[{type:'text',text:prompt}],response_format:{type:'text'}}),muteHttpExceptions:true});
  const code=r.getResponseCode(),body=r.getContentText();if(code<200||code>=300) throw new Error(label+' Gemini API '+code+': '+body.slice(0,600));
  const j=JSON.parse(body),text=smText_(j);if(!text) throw new Error(label+' returned no text');
  try{return JSON.parse(String(text).trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));}catch(e){throw new Error(label+' invalid JSON: '+String(text).slice(0,600));}
}
function smText_(j){if(j&&typeof j.output_text==='string')return j.output_text;let a=[];(function w(v){if(!v)return;if(Array.isArray(v)){v.forEach(w);return;}if(typeof v==='object'){if((v.type==='text'||v.type==='output_text')&&typeof v.text==='string')a.push(v.text);Object.keys(v).forEach(k=>w(v[k]));}})(j);return a.join('\n');}

function smSs_(){return SpreadsheetApp.openById(SM.SPREADSHEET_ID);}function smSheet_(n){const s=smSs_().getSheetByName(n);if(!s)throw new Error('Missing sheet: '+n);return s;}function smHeaders_(s){return s.getRange(1,1,1,s.getLastColumn()).getDisplayValues()[0];}
function smRows_(n){const s=smSheet_(n),h=smHeaders_(s),last=s.getLastRow();if(last<2)return[];return s.getRange(2,1,last-1,h.length).getValues().map(r=>{let o={};h.forEach((k,i)=>o[k]=r[i]);return o;}).filter(o=>h.some(k=>o[k]!==''&&o[k]!=null));}
function smContext_(names){let o={};names.forEach(n=>o[n]=smRows_(n));return o;}
function smClear_(n){const s=smSheet_(n);if(s.getLastRow()>1)s.getRange(2,1,s.getLastRow()-1,s.getLastColumn()).clearContent();}
function smReplace_(n,objs){smClear_(n);smAppend_(n,objs);}function smAppend_(n,objs){if(!objs||!objs.length)return;const s=smSheet_(n),h=smHeaders_(s),rows=objs.map(o=>h.map(k=>Object.prototype.hasOwnProperty.call(o,k)?o[k]:''));s.getRange(s.getLastRow()+1,1,rows.length,h.length).setValues(rows);}
function smControl_(label){const s=smSheet_('CONTROL');for(let r=1;r<=30;r++)if(String(s.getRange(r,1).getValue())===label)return s.getRange(r,2).getValue();return'';}function smSetControl_(label,v){const s=smSheet_('CONTROL');for(let r=1;r<=30;r++)if(String(s.getRange(r,1).getValue())===label){s.getRange(r,2).setValue(v);return;}}
function smMarkInputs_(inputs,v){const s=smSheet_('INPUT'),h=smHeaders_(s),idc=h.indexOf('INPUT_ID')+1,pc=h.indexOf('PROCESSED')+1,vc=h.indexOf('PROCESS_VERSION')+1,set=new Set(inputs.map(x=>String(x.INPUT_ID||'')));for(let r=2;r<=s.getLastRow();r++)if(set.has(String(s.getRange(r,idc).getValue()||''))){s.getRange(r,pc).setValue(true);if(vc>0)s.getRange(r,vc).setValue(v);}}
function smApplyOrder_(exp){const m={};exp.forEach(x=>m[String(x.scene_id||'')]=x.presentation_order);const s=smSheet_('SCENES'),h=smHeaders_(s),ic=h.indexOf('SCENE_ID')+1,pc=h.indexOf('PRESENTATION_ORDER')+1;for(let r=2;r<=s.getLastRow();r++){const id=String(s.getRange(r,ic).getValue()||'');if(m[id]!=null)s.getRange(r,pc).setValue(m[id]);}}
function smNormalize10_(x){const ks=['emotion','curiosity','humor','stimulation','warmth','strategy','achievement','other_1_score'];let a=ks.map(k=>Math.max(0,Number(x[k]||0))),sum=a.reduce((p,c)=>p+c,0);if(!sum){x.curiosity=10;return;}a=a.map(v=>Math.round(v/sum*100)/10);let d=Math.round((10-a.reduce((p,c)=>p+c,0))*10)/10;a[0]=Math.max(0,Math.round((a[0]+d)*10)/10);ks.forEach((k,i)=>x[k]=a[i]);}
function smLevel_(v){const s=String(v||'').toUpperCase();if(s.includes('HIGH')&&!s.includes('MEDIUM'))return'HIGH';if(s.includes('LOW')&&!s.includes('MEDIUM'))return'LOW';return'MEDIUM';}function smAct_(v){const s=String(v||'').toUpperCase();if(s.includes('BEGIN'))return'BEGINNING';if(s.includes('END'))return'ENDING';return'MIDDLE';}function smResult_(v){const s=String(v||'').toUpperCase();return s==='FAIL'?'FAIL':s==='WARN'?'WARN':'PASS';}function smSeverity_(v){const s=String(v||'').toUpperCase();return ['INFO','LOW','MEDIUM','HIGH','CRITICAL'].includes(s)?s:'INFO';}function smNum_(v,d,min,max){let n=Number(v);if(!isFinite(n))n=d;return Math.max(min,Math.min(max,n));}function smPad_(n,l){return String(n).padStart(l,'0');}
function smIssue_(scope,target,check,result,severity,issue,evidence,fix,auto){return{scope:scope,target_id:target,check_type:check,result:result,score:'',severity:severity,issue:issue,evidence:evidence,suggested_fix:fix,auto_fix_allowed:auto,payload_impact:'',audience_impact:''};}
function smLog_(op,status,msg,error){try{smAppend_('LOG',[{LOG_ID:'LOG_'+Utilities.getUuid(),CREATED_AT:new Date(),OPERATION:op,SOURCE:'APPS_SCRIPT_REMOTE',INPUT_IDS:'',INPUT_VERSION:smControl_('Story Version')||0,OUTPUT_ENTITY:'',OUTPUT_VERSION:smControl_('Story Version')||0,MODEL:SM.MODEL,PROMPT_REF:'',CONTEXT_REF:'',RESPONSE_REF:'',PARSER_RESULT:msg||'',CHANGE_SUMMARY:'',STATUS:status==='FAILED'?'FAILED':status==='WARN'?'WARN':'SUCCESS',ERROR:error||''}]);}catch(e){}}
