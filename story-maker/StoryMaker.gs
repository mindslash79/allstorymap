/*
 * 1 STORY MAKER — Narrative Design Automation Runtime
 * Public runtime source. Contains no API keys or secrets.
 * Target spreadsheet: 1. Story Maker
 */

const SM = Object.freeze({
  SPREADSHEET_ID: '1LJWMMbZudbTJUbMdaJPPRDV9FrIucv8HHMopB9n6o_Y',
  MODEL: 'gemini-3.6-flash',
  ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/interactions',
  DEFAULT_PROJECT_ID: 'GAME_001',
  SHEETS: Object.freeze({
    CONTROL: 'CONTROL', INPUT: 'INPUT', STORY: 'STORY', PAYLOAD: 'PAYLOAD',
    AUDIENCE: 'AUDIENCE', CHARACTERS: 'CHARACTERS', STRUCTURE: 'STRUCTURE',
    LOCATIONS: 'LOCATIONS', SCENES: 'SCENES', EXPERIENCE: 'EXPERIENCE',
    CHARACTER_STATE: 'CHARACTER_STATE', VALIDATION: 'VALIDATION',
    FINAL: 'FINAL', LOG: 'LOG', VERSIONS: 'VERSIONS'
  })
});

function smRunAction_(action) {
  const map = {
    DEVELOP_STORY: smDevelopStory,
    REVIEW_PAYLOAD: smReviewPayload,
    BUILD_STRUCTURE: smBuildStructure,
    BUILD_LOCATIONS: smBuildLocations,
    GENERATE_SCENES: smGenerateScenes,
    COMPOSE_EXPERIENCE: smComposeExperience,
    VALIDATE_STORY: smValidateStory,
    FINALIZE_STORY: smFinalizeStory,
    EXPORT_TO_MAP: smExportToMap,
    SAVE_VERSION: smSaveVersion,
    BUILD_ALL: smBuildAll
  };
  if (!map[action]) throw new Error('Unknown Story Maker action: ' + action);
  return map[action]();
}

function smBuildAll() {
  smLog_('BUILD_ALL', 'START', 'Full Story pipeline started.', '');
  smDevelopStory();
  smBuildStructure();
  smBuildLocations();
  smGenerateScenes();
  smComposeExperience();
  smValidateStory();
  smFinalizeStory();
  smSaveVersion();
  smLog_('BUILD_ALL', 'DONE', 'Full Story pipeline completed.', '');
  smSetControlValue_('Status', 'FINAL');
  return true;
}

function smDevelopStory() {
  const inputs = smGetPendingInputs_();
  if (!inputs.length) throw new Error('INPUT에 처리되지 않은 RAW_INPUT이 없습니다.');
  const existing = smProjectContext_(['STORY', 'PAYLOAD', 'AUDIENCE', 'CHARACTERS']);
  const prompt = [
    'You are the narrative architect for an RPG Maker MV game.',
    'Return ONLY valid JSON. Do not use markdown fences.',
    'Creator raw inputs:', JSON.stringify(inputs),
    'Existing project context (may be empty):', JSON.stringify(existing),
    '',
    'Create or update the canonical story. The creator value/payload has higher priority than audience fit overall, approximately 60:40, but NOT mechanically scene by scene.',
    'Infer and recommend the best target audience from story+payload, while keeping creator intent primary.',
    'Produce detailed character bibles including appearance because later asset generation depends on them.',
    '',
    'JSON schema:',
    JSON.stringify({
      story: {title:'', premise:'', overall_story:'', beginning:'', middle:'', ending:'', theme:'', tone:'', creator_intent:'', source:'AI_GENERATED'},
      payload: {primary_value:'', secondary_values:[], intended_before:'', intended_during:'', intended_after:'', why_story_supports:'', contradictions:[], value_priority:60, audience_priority:40},
      audience: {ai_recommended:'', creator_selected:'', primary_age:'', psychographic:'', game_preferences:'', slow_pacing_tolerance:'', ambiguity_tolerance:'', emotional_intensity:'', mechanical_complexity:'', humor_preference:'', rationale:''},
      characters: [{character_id:'CHAR_001', name:'', role:'', age:'', personality:'', want:'', fear:'', background:'', appearance:'', speech_style:'', habits:'', relationships:'', starting_state:'', internal_conflict:'', arc_summary:'', current_state:'', visual_notes:''}]
    })
  ].join('\n');
  const out = smGeminiJson_(prompt, 'DEVELOP_STORY');
  smWriteStory_(out.story || {});
  smWritePayload_(out.payload || {});
  smWriteAudience_(out.audience || {});
  smReplaceObjects_(SM.SHEETS.CHARACTERS, out.characters || [], smCharacterRow_);
  smMarkInputsProcessed_(inputs);
  smBumpControlVersion_('Story Version');
  smBumpControlVersion_('Payload Version');
  smBumpControlVersion_('Audience Version');
  smSetControlValue_('Primary Audience', (out.audience || {}).creator_selected || (out.audience || {}).ai_recommended || '');
  smLog_('DEVELOP_STORY', 'DONE', 'Story, payload, audience and character bible updated.', '');
}

function smReviewPayload() {
  const context = smProjectContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS']);
  const prompt = [
    'Review the following game story and payload. Return ONLY valid JSON.',
    JSON.stringify(context),
    'The creator value/payload must remain the higher-order objective. Audience adaptation is delivery, not the reason for existence. Overall design priority is about 60 value : 40 audience.',
    'Recommend corrections only when they improve coherence between story, intended player experience, and target audience.',
    'Schema: {"payload":{...full payload...},"audience":{...full audience...},"story_adjustments":{"needed":true,"reason":"","revised_overall_story":""}}'
  ].join('\n');
  const out = smGeminiJson_(prompt, 'REVIEW_PAYLOAD');
  if (out.payload) smWritePayload_(out.payload);
  if (out.audience) smWriteAudience_(out.audience);
  if (out.story_adjustments && out.story_adjustments.needed && out.story_adjustments.revised_overall_story) {
    smUpsertKeyValue_(SM.SHEETS.STORY, 'OVERALL_STORY', out.story_adjustments.revised_overall_story);
  }
  smBumpControlVersion_('Payload Version');
  smLog_('REVIEW_PAYLOAD', 'DONE', 'Payload/audience review completed.', '');
}

function smBuildStructure() {
  const context = smProjectContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS']);
  smRequireContext_(context, 'STORY');
  const prompt = [
    'Expand this canonical story into narrative blocks before scenes. Return ONLY valid JSON.',
    JSON.stringify(context),
    'Divide BEGINNING/MIDDLE/ENDING further according to the payload and the natural needs of the story; do not force equal sizes.',
    'Each block must state story function, payload function, major event, conflict, character changes, and location needs. Important locations should emerge here, BEFORE scene decomposition.',
    'Schema: {"structure":[{"structure_id":"STRUCT_001","parent_id":"","act":"BEGINNING|MIDDLE|ENDING","section_name":"","order_in_act":1,"summary":"","story_function":"","payload_function":"","major_event":"","conflict":"","character_changes":"","important_location_ids":"","location_needs":"","target_length":""}]}'
  ].join('\n');
  const out = smGeminiJson_(prompt, 'BUILD_STRUCTURE');
  smReplaceObjects_(SM.SHEETS.STRUCTURE, out.structure || [], smStructureRow_);
  smLog_('BUILD_STRUCTURE', 'DONE', 'Narrative structure expanded.', '');
}

function smBuildLocations() {
  const context = smProjectContext_(['STORY','PAYLOAD','CHARACTERS','STRUCTURE']);
  smRequireContext_(context, 'STRUCTURE');
  const prompt = [
    'Design the narrative LOCATION dataset required by this story, before creating scenes. Return ONLY valid JSON.',
    JSON.stringify(context),
    'LOCATION_ID is a narrative place, NOT an RPG Maker Map ID. A later Map Maker may map one location to several maps or reuse one map.',
    'Capture how the meaning of a place can change from beginning to middle to ending. Include parent relationships, subareas, important objects, access relationships and map hints. Do not create characters or events here.',
    'Schema: {"locations":[{"location_id":"LOC_001","name":"","parent_location_id":"","location_type":"","story_role":"","payload_role":"","meaning_beginning":"","meaning_middle":"","meaning_end":"","atmosphere":"","time_variants":"","weather_variants":"","important_objects":"","required_subareas":"","access_relationships":"","characters_associated":"","map_size_hint":"","exploration_level":"LOW|MEDIUM|HIGH","privacy_level":"LOW|MEDIUM|HIGH"}]}'
  ].join('\n');
  const out = smGeminiJson_(prompt, 'BUILD_LOCATIONS');
  smReplaceObjects_(SM.SHEETS.LOCATIONS, out.locations || [], smLocationRow_);
  smLog_('BUILD_LOCATIONS', 'DONE', 'Important locations built before scenes.', '');
}

function smGenerateScenes() {
  const context = smProjectContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS','STRUCTURE','LOCATIONS']);
  smRequireContext_(context, 'LOCATIONS');
  const prompt = [
    'Decompose this story into the final scene dataset. Return ONLY valid JSON.',
    JSON.stringify(context),
    'Scenes are the primary final output of Story Maker. Every scene must be assigned to an existing LOCATION_ID.',
    'Separate chronological order (what actually happened) from presentation order (what player sees); presentation can be changed later.',
    'Record character entry state, change, and exit state. Keep character progression logically continuous. Describe map/asset/event REQUIREMENTS only; do not implement RPG Maker maps, images, characters or events.',
    'Schema: {"scenes":[{"scene_id":"SCENE_001","structure_id":"STRUCT_001","chronology_order":1,"presentation_order":1,"title":"","summary":"","story_function":"","payload_function":"","payload_importance":0.0,"location_id":"LOC_001","location_area":"","time":"","weather":"","atmosphere":"","characters":"CHAR_001,CHAR_002","entry_state_ref":"","character_changes":"","exit_state_ref":"","experience_profile_id":"EXP_001","setup":"","payoff":"","required_objects":"","required_assets":"","music_mood":"","npc_needs":"","transition_in":"","transition_out":""}],"character_states":[{"state_id":"STATE_001","scene_id":"SCENE_001","character_id":"CHAR_001","chronology_order":1,"presentation_order":1,"before_state":"","change":"","after_state":"","change_reason":"","trust_state":"","fear_state":"","goal_state":"","relationship_state":"","knowledge_state":"","emotional_state":"","continuity_notes":""}]}'
  ].join('\n');
  const out = smGeminiJson_(prompt, 'GENERATE_SCENES');
  smReplaceObjects_(SM.SHEETS.SCENES, out.scenes || [], smSceneRow_);
  smReplaceObjects_(SM.SHEETS.CHARACTER_STATE, out.character_states || [], smCharacterStateRow_);
  smLog_('GENERATE_SCENES', 'DONE', 'Scenes and character state history generated.', '');
}

function smComposeExperience() {
  const context = smProjectContext_(['PAYLOAD','AUDIENCE','SCENES','CHARACTER_STATE']);
  smRequireContext_(context, 'SCENES');
  const prompt = [
    'Compose player-facing experience and scene order. Return ONLY valid JSON.',
    JSON.stringify(context),
    'The payload/value remains primary overall (~60%) and audience adaptation secondary (~40%). This is an aggregate flow principle, NOT a required ratio for each scene.',
    'Experience scores per scene MUST total exactly 10 across emotion, curiosity, humor, stimulation, warmth, strategy, achievement, and optional other_1_score.',
    'Use chronology and presentation separately. You may use flashback, flash-forward, cold open, parallel story, POV switch, delayed explanation, foreshadowing, recontextualization, cliffhanger, breathing scene, or chronological order when appropriate.',
    'Do not make every scene intense; design an experience curve appropriate to the target audience.',
    'Schema: {"experience":[{"experience_profile_id":"EXP_001","scene_id":"SCENE_001","audience_version":"1","value_priority":60,"audience_priority":40,"emotion":0,"curiosity":0,"humor":0,"stimulation":0,"warmth":0,"strategy":0,"achievement":0,"other_1_label":"","other_1_score":0,"curve_segment":"","ordering_technique":"","reason":"","presentation_order":1}]}'
  ].join('\n');
  const out = smGeminiJson_(prompt, 'COMPOSE_EXPERIENCE');
  const exp = out.experience || [];
  exp.forEach(smNormalizeExperience10_);
  smReplaceObjects_(SM.SHEETS.EXPERIENCE, exp, smExperienceRow_);
  smApplyPresentationOrders_(exp);
  smLog_('COMPOSE_EXPERIENCE', 'DONE', 'Experience mix and presentation order composed.', '');
}

function smValidateStory() {
  smClearData_(SM.SHEETS.VALIDATION);
  const issues = [];
  const locations = smRows_(SM.SHEETS.LOCATIONS);
  const scenes = smRows_(SM.SHEETS.SCENES);
  const experience = smRows_(SM.SHEETS.EXPERIENCE);
  const states = smRows_(SM.SHEETS.CHARACTER_STATE);
  const locationIds = new Set(locations.map(function(r){ return String(r.LOCATION_ID || ''); }).filter(Boolean));
  const sceneIds = new Set(scenes.map(function(r){ return String(r.SCENE_ID || ''); }).filter(Boolean));
  scenes.forEach(function(s) {
    if (!s.LOCATION_ID || !locationIds.has(String(s.LOCATION_ID))) issues.push(smIssue_('SCENE', s.SCENE_ID, 'LOCATION_REFERENCE', 'FAIL', 'HIGH', 'Scene references a missing LOCATION_ID.', String(s.LOCATION_ID || ''), 'Assign an existing narrative location.', false));
  });
  experience.forEach(function(x) {
    const total = Number(x.EMOTION||0)+Number(x.CURIOSITY||0)+Number(x.HUMOR||0)+Number(x.STIMULATION||0)+Number(x.WARMTH||0)+Number(x.STRATEGY||0)+Number(x.ACHIEVEMENT||0)+Number(x.OTHER_1_SCORE||0);
    if (Math.abs(total - 10) > 0.001) issues.push(smIssue_('EXPERIENCE', x.SCENE_ID, 'EXPERIENCE_TOTAL', 'FAIL', 'MEDIUM', 'Experience scores must total 10.', 'Total=' + total, 'Rebalance scores to 10.', true));
    if (!sceneIds.has(String(x.SCENE_ID || ''))) issues.push(smIssue_('EXPERIENCE', x.SCENE_ID, 'SCENE_REFERENCE', 'FAIL', 'HIGH', 'Experience references missing scene.', '', 'Assign an existing SCENE_ID.', false));
  });
  states.forEach(function(st) {
    if (!sceneIds.has(String(st.SCENE_ID || ''))) issues.push(smIssue_('CHARACTER_STATE', st.SCENE_ID, 'SCENE_REFERENCE', 'FAIL', 'HIGH', 'Character state references missing scene.', '', 'Assign an existing SCENE_ID.', false));
  });
  const aiPrompt = [
    'Act as a strict narrative QA reviewer. Return ONLY valid JSON.',
    JSON.stringify(smProjectContext_(['STORY','PAYLOAD','AUDIENCE','CHARACTERS','STRUCTURE','LOCATIONS','SCENES','EXPERIENCE','CHARACTER_STATE'])),
    'Check story logic, character continuity, timeline, location continuity, unresolved setup/payoff, redundant scenes, motivation, payload alignment, audience fit, and whether overall value remains primary while audience fit serves delivery.',
    'Schema: {"checks":[{"scope":"STORY|SCENE|CHARACTER|LOCATION|EXPERIENCE","target_id":"","check_type":"","result":"PASS|WARN|FAIL","score":0,"severity":"INFO|LOW|MEDIUM|HIGH|CRITICAL","issue":"","evidence":"","suggested_fix":"","auto_fix_allowed":false,"payload_impact":"","audience_impact":""}]}'
  ].join('\n');
  const ai = smGeminiJson_(aiPrompt, 'VALIDATE_STORY');
  (ai.checks || []).forEach(function(c) {
    issues.push({scope:c.scope||'STORY',target_id:c.target_id||'',check_type:c.check_type||'AI_REVIEW',result:c.result||'WARN',score:c.score||'',severity:c.severity||'INFO',issue:c.issue||'',evidence:c.evidence||'',suggested_fix:c.suggested_fix||'',auto_fix_allowed:!!c.auto_fix_allowed,payload_impact:c.payload_impact||'',audience_impact:c.audience_impact||''});
  });
  const rows = issues.length ? issues : [smIssue_('STORY','', 'BASELINE', 'PASS','INFO','No blocking issues detected.','','',false)];
  smAppendObjects_(SM.SHEETS.VALIDATION, rows, smValidationRow_);
  const failCount = rows.filter(function(x){return x.result === 'FAIL';}).length;
  smSetControlValue_('Validation Status', failCount ? 'FAIL' : 'PASS');
  smLog_('VALIDATE_STORY', failCount ? 'WARN' : 'DONE', 'Validation completed. Failures: ' + failCount, '');
  return failCount === 0;
}

function smFinalizeStory() {
  const failures = smRows_(SM.SHEETS.VALIDATION).filter(function(r){ return String(r.RESULT) === 'FAIL'; });
  if (failures.length) throw new Error('VALIDATION에 FAIL이 있어 Finalize할 수 없습니다.');
  const scenes = smRows_(SM.SHEETS.SCENES);
  const locations = smRows_(SM.SHEETS.LOCATIONS);
  smClearData_(SM.SHEETS.FINAL);
  const finalSheet = smSheet_(SM.SHEETS.FINAL);
  const headers = smHeaders_(finalSheet);
  const out = [];
  locations.forEach(function(l) {
    out.push(smObjectToHeaderRow_(headers, {TYPE:'LOCATION',ENTITY_ID:l.LOCATION_ID,VERSION:l.VERSION||1,STATUS:'FINAL',ORDER:'',PARENT_ID:l.PARENT_LOCATION_ID,TITLE_NAME:l.NAME,STORY_SUMMARY:l.STORY_ROLE,STORY_FUNCTION:l.STORY_ROLE,PAYLOAD_FUNCTION:l.PAYLOAD_ROLE,LOCATION_ID:l.LOCATION_ID,LOCATION_ROLE:l.STORY_ROLE,CHARACTERS:l.CHARACTERS_ASSOCIATED,TIME:l.TIME_VARIANTS,WEATHER:l.WEATHER_VARIANTS,ATMOSPHERE:l.ATMOSPHERE,REQUIRED_OBJECTS:l.IMPORTANT_OBJECTS,MAP_REQUIREMENTS:JSON.stringify({location_type:l.LOCATION_TYPE,required_subareas:l.REQUIRED_SUBAREAS,access_relationships:l.ACCESS_RELATIONSHIPS,map_size_hint:l.MAP_SIZE_HINT,exploration_level:l.EXPLORATION_LEVEL,privacy_level:l.PRIVACY_LEVEL}),SOURCE_VERSION:smCurrentVersion_(),EXPORT_STATUS:'READY',JSON_PAYLOAD:JSON.stringify(l)}));
  });
  scenes.sort(function(a,b){ return Number(a.PRESENTATION_ORDER||0)-Number(b.PRESENTATION_ORDER||0); }).forEach(function(s) {
    out.push(smObjectToHeaderRow_(headers, {TYPE:'SCENE',ENTITY_ID:s.SCENE_ID,VERSION:s.VERSION||1,STATUS:'FINAL',ORDER:s.PRESENTATION_ORDER,PARENT_ID:s.STRUCTURE_ID,TITLE_NAME:s.TITLE,STORY_SUMMARY:s.SUMMARY,STORY_FUNCTION:s.STORY_FUNCTION,PAYLOAD_FUNCTION:s.PAYLOAD_FUNCTION,LOCATION_ID:s.LOCATION_ID,LOCATION_ROLE:s.LOCATION_AREA,CHARACTERS:s.CHARACTERS,CHARACTER_STATE_REF:s.EXIT_STATE_REF,CHRONOLOGY_ORDER:s.CHRONOLOGY_ORDER,PRESENTATION_ORDER:s.PRESENTATION_ORDER,EXPERIENCE_PROFILE_ID:s.EXPERIENCE_PROFILE_ID,TIME:s.TIME,WEATHER:s.WEATHER,ATMOSPHERE:s.ATMOSPHERE,REQUIRED_OBJECTS:s.REQUIRED_OBJECTS,MAP_REQUIREMENTS:JSON.stringify({location_id:s.LOCATION_ID,area:s.LOCATION_AREA,time:s.TIME,weather:s.WEATHER,atmosphere:s.ATMOSPHERE,objects:s.REQUIRED_OBJECTS}),ASSET_REQUIREMENTS:s.REQUIRED_ASSETS,EVENT_REQUIREMENTS:JSON.stringify({npc_needs:s.NPC_NEEDS,transition_in:s.TRANSITION_IN,transition_out:s.TRANSITION_OUT}),SOURCE_VERSION:smCurrentVersion_(),EXPORT_STATUS:'READY',JSON_PAYLOAD:JSON.stringify(s)}));
  });
  if (out.length) finalSheet.getRange(2,1,out.length,headers.length).setValues(out);
  smSetControlValue_('Status', 'FINAL');
  smLog_('FINALIZE_STORY', 'DONE', 'FINAL SCENE + LOCATION dataset compiled.', '');
}

function smExportToMap() {
  const rows = smRows_(SM.SHEETS.FINAL);
  if (!rows.length) throw new Error('FINAL 데이터가 없습니다. 먼저 FINALIZE_STORY를 실행하세요.');
  const invalid = rows.filter(function(r){ return String(r.STATUS) === 'INVALID'; });
  if (invalid.length) throw new Error('FINAL에 INVALID 데이터가 있습니다.');
  const sheet = smSheet_(SM.SHEETS.FINAL);
  const headers = smHeaders_(sheet);
  const idx = headers.indexOf('EXPORT_STATUS') + 1;
  if (idx > 0 && sheet.getLastRow() >= 2) sheet.getRange(2,idx,sheet.getLastRow()-1,1).setValue('EXPORTED');
  smLog_('EXPORT_TO_MAP', 'DONE', 'FINAL Scene/Location handoff marked EXPORTED. Map Maker destination not configured yet.', '');
}

function smSaveVersion() {
  const versionId = 'V_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const obj = {version_id:versionId,created_at:new Date(),project_id:smControlValue_('Project ID')||SM.DEFAULT_PROJECT_ID,story_version:smControlValue_('Story Version')||0,payload_version:smControlValue_('Payload Version')||0,audience_version:smControlValue_('Audience Version')||0,characters_version:smCount_(SM.SHEETS.CHARACTERS),structure_version:smCount_(SM.SHEETS.STRUCTURE),locations_version:smCount_(SM.SHEETS.LOCATIONS),scenes_version:smCount_(SM.SHEETS.SCENES),experience_version:smCount_(SM.SHEETS.EXPERIENCE),validation_run_id:'VAL_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss'),git_commit:'',supabase_snapshot_id:'',build_id:'',status:'SNAPSHOT',notes:'Google Sheet snapshot. Git/Supabase hooks reserved.',json_manifest_ref:''};
  smAppendObjects_(SM.SHEETS.VERSIONS, [obj], smVersionRow_);
  smLog_('SAVE_VERSION', 'DONE', 'Version snapshot saved: ' + versionId, '');
  return versionId;
}

function smGeminiJson_(prompt, label) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing from Script Properties.');
  const payload = { model: SM.MODEL, input: [{type:'text', text:prompt}], response_format: {type:'text'} };
  const response = UrlFetchApp.fetch(SM.ENDPOINT, {method:'post',contentType:'application/json',headers:{'x-goog-api-key':apiKey},payload:JSON.stringify(payload),muteHttpExceptions:true});
  const code = response.getResponseCode();
  const body = response.getContentText();
  if (code < 200 || code >= 300) throw new Error(label + ' Gemini API error ' + code + ': ' + body.slice(0,800));
  const json = JSON.parse(body);
  const text = smExtractText_(json);
  if (!text) throw new Error(label + ': Gemini returned no text.');
  try { return JSON.parse(smStripJsonFence_(text)); } catch (err) { throw new Error(label + ': invalid JSON from Gemini: ' + text.slice(0,800)); }
}
function smExtractText_(json) {
  if (!json) return '';
  if (typeof json.output_text === 'string') return json.output_text;
  const found = [];
  (function walk(v) { if (v == null) return; if (typeof v === 'string') return; if (Array.isArray(v)) return v.forEach(walk); if (typeof v === 'object') { if ((v.type === 'text' || v.type === 'output_text') && typeof v.text === 'string') found.push(v.text); Object.keys(v).forEach(function(k){ walk(v[k]); }); } })(json);
  return found.join('\n').trim();
}
function smStripJsonFence_(text) { return String(text).trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim(); }

function smSs_() { return SpreadsheetApp.openById(SM.SPREADSHEET_ID); }
function smSheet_(name) { const s=smSs_().getSheetByName(name); if(!s) throw new Error('Missing sheet: '+name); return s; }
function smHeaders_(sheet) { const n=sheet.getLastColumn(); return sheet.getRange(1,1,1,n).getDisplayValues()[0].map(String); }
function smTimestamp_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'); }
function smRows_(sheetName) { const sh=smSheet_(sheetName),last=sh.getLastRow(),headers=smHeaders_(sh); if(last<2)return[]; return sh.getRange(2,1,last-1,headers.length).getValues().map(function(row){const o={};headers.forEach(function(h,i){if(h)o[h]=row[i];});return o;}).filter(function(o){return Object.keys(o).some(function(k){return o[k]!==''&&o[k]!=null;});}); }
function smProjectContext_(names) { const out={}; names.forEach(function(n){out[n]=smRows_(SM.SHEETS[n]||n);}); return out; }
function smRequireContext_(ctx,name){if(!ctx[name]||!ctx[name].length)throw new Error(name+' 데이터가 없습니다.');}
function smClearData_(sheetName){const sh=smSheet_(sheetName);if(sh.getLastRow()>1)sh.getRange(2,1,sh.getLastRow()-1,sh.getLastColumn()).clearContent();}
function smCount_(sheetName){return Math.max(0,smSheet_(sheetName).getLastRow()-1);}
function smReplaceObjects_(sheetName,objects,mapper){smClearData_(sheetName);smAppendObjects_(sheetName,objects,mapper);}
function smAppendObjects_(sheetName,objects,mapper){if(!objects||!objects.length)return;const sh=smSheet_(sheetName),headers=smHeaders_(sh);const rows=objects.map(function(o,i){return smObjectToHeaderRow_(headers,mapper(o,i));});sh.getRange(sh.getLastRow()+1,1,rows.length,headers.length).setValues(rows);}
function smObjectToHeaderRow_(headers,obj){return headers.map(function(h){return Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:'';});}
function smGetPendingInputs_(){return smRows_(SM.SHEETS.INPUT).filter(function(r){return String(r.RAW_INPUT||'').trim()&&r.PROCESSED!==true&&String(r.PROCESSED).toUpperCase()!=='TRUE';});}
function smMarkInputsProcessed_(inputs){const sh=smSheet_(SM.SHEETS.INPUT),headers=smHeaders_(sh),idCol=headers.indexOf('INPUT_ID')+1,pCol=headers.indexOf('PROCESSED')+1,vCol=headers.indexOf('PROCESS_VERSION')+1;if(idCol<1||pCol<1)return;const wanted=new Set(inputs.map(function(x){return String(x.INPUT_ID||'');}));for(let r=2;r<=sh.getLastRow();r++)if(wanted.has(String(sh.getRange(r,idCol).getValue()||''))){sh.getRange(r,pCol).setValue(true);if(vCol>0)sh.getRange(r,vCol).setValue(smCurrentVersion_());}}
function smControlValue_(label){const sh=smSheet_(SM.SHEETS.CONTROL);for(let r=1;r<=Math.min(sh.getLastRow(),30);r++)if(String(sh.getRange(r,1).getValue())===label)return sh.getRange(r,2).getValue();return'';}
function smSetControlValue_(label,value){const sh=smSheet_(SM.SHEETS.CONTROL);for(let r=1;r<=Math.min(sh.getMaxRows(),40);r++)if(String(sh.getRange(r,1).getValue())===label){sh.getRange(r,2).setValue(value);return;}}
function smBumpControlVersion_(label){const n=Number(smControlValue_(label)||0)+1;smSetControlValue_(label,n);return n;}
function smCurrentVersion_(){return Number(smControlValue_('Story Version')||0);}
function smUpsertKeyValue_(sheetName,key,value){const sh=smSheet_(sheetName),last=Math.max(1,sh.getLastRow());for(let r=2;r<=last;r++)if(String(sh.getRange(r,1).getValue())===key){sh.getRange(r,2).setValue(value);return;}sh.appendRow([key,value,smCurrentVersion_(),'AI_GENERATED','APPROVED','']);}
function smWriteStory_(s){const rows=[['TITLE',s.title],['PREMISE',s.premise],['OVERALL_STORY',s.overall_story],['BEGINNING',s.beginning],['MIDDLE',s.middle],['ENDING',s.ending],['THEME',s.theme],['TONE',s.tone],['CREATOR_INTENT',s.creator_intent]];smClearData_(SM.SHEETS.STORY);const sh=smSheet_(SM.SHEETS.STORY),headers=smHeaders_(sh),version=Number(smControlValue_('Story Version')||0)+1;const out=rows.map(function(x){return smObjectToHeaderRow_(headers,{SECTION:x[0],CONTENT:x[1]||'',VERSION:version,SOURCE:s.source||'AI_GENERATED',STATUS:'APPROVED',JSON_REF:''});});sh.getRange(2,1,out.length,headers.length).setValues(out);}
function smWritePayload_(p){const items={PRIMARY_VALUE:p.primary_value,SECONDARY_VALUES:Array.isArray(p.secondary_values)?p.secondary_values.join(' | '):p.secondary_values,INTENDED_BEFORE:p.intended_before,INTENDED_DURING:p.intended_during,INTENDED_AFTER:p.intended_after,WHY_STORY_SUPPORTS:p.why_story_supports,CONTRADICTIONS:Array.isArray(p.contradictions)?p.contradictions.join(' | '):p.contradictions,VALUE_PRIORITY:Number(p.value_priority||60),AUDIENCE_PRIORITY:Number(p.audience_priority||40)};smClearData_(SM.SHEETS.PAYLOAD);const sh=smSheet_(SM.SHEETS.PAYLOAD),headers=smHeaders_(sh),version=Number(smControlValue_('Payload Version')||0)+1;const rows=Object.keys(items).map(function(k){return smObjectToHeaderRow_(headers,{PAYLOAD_ID:'PAYLOAD_001',FIELD:k,VALUE:items[k]||'',PRIORITY:(k==='PRIMARY_VALUE'?'PRIMARY':'SUPPORT'),RATIONALE:'',VERSION:version,SOURCE:'AI_GENERATED',STATUS:'APPROVED',JSON_REF:''});});sh.getRange(2,1,rows.length,headers.length).setValues(rows);}
function smWriteAudience_(a){smClearData_(SM.SHEETS.AUDIENCE);const sh=smSheet_(SM.SHEETS.AUDIENCE),headers=smHeaders_(sh),version=Number(smControlValue_('Audience Version')||0)+1;const row=smObjectToHeaderRow_(headers,{AUDIENCE_ID:'AUD_001',AI_RECOMMENDED:a.ai_recommended||'',CREATOR_SELECTED:a.creator_selected||a.ai_recommended||'',PRIMARY_AGE:a.primary_age||'',PSYCHOGRAPHIC:a.psychographic||'',GAME_PREFERENCES:a.game_preferences||'',SLOW_PACING_TOLERANCE:a.slow_pacing_tolerance||'',AMBIGUITY_TOLERANCE:a.ambiguity_tolerance||'',EMOTIONAL_INTENSITY:a.emotional_intensity||'',MECHANICAL_COMPLEXITY:a.mechanical_complexity||'',HUMOR_PREFERENCE:a.humor_preference||'',RATIONALE:a.rationale||'',VERSION:version,STATUS:'APPROVED',JSON_REF:''});sh.getRange(2,1,1,headers.length).setValues([row]);}
function smCharacterRow_(o,i){return {CHARACTER_ID:o.character_id||('CHAR_'+smPad_(i+1,3)),NAME:o.name||'',ROLE:o.role||'',AGE:o.age||'',PERSONALITY:o.personality||'',WANT:o.want||'',FEAR:o.fear||'',BACKGROUND:o.background||'',APPEARANCE:o.appearance||'',SPEECH_STYLE:o.speech_style||'',HABITS:o.habits||'',RELATIONSHIPS:o.relationships||'',STARTING_STATE:o.starting_state||'',INTERNAL_CONFLICT:o.internal_conflict||'',ARC_SUMMARY:o.arc_summary||'',CURRENT_STATE:o.current_state||o.starting_state||'',VISUAL_NOTES:o.visual_notes||'',FIRST_SCENE_ID:'',LAST_SCENE_ID:'',STATUS:'APPROVED',VERSION:smCurrentVersion_()+1,JSON_REF:''};}
function smStructureRow_(o,i){return {STRUCTURE_ID:o.structure_id||('STRUCT_'+smPad_(i+1,3)),PARENT_ID:o.parent_id||'',ACT:o.act||'',SECTION_NAME:o.section_name||'',ORDER_IN_ACT:o.order_in_act||'',SUMMARY:o.summary||'',STORY_FUNCTION:o.story_function||'',PAYLOAD_FUNCTION:o.payload_function||'',MAJOR_EVENT:o.major_event||'',CONFLICT:o.conflict||'',CHARACTER_CHANGES:o.character_changes||'',IMPORTANT_LOCATION_IDS:o.important_location_ids||'',LOCATION_NEEDS:o.location_needs||'',TARGET_LENGTH:o.target_length||'',STATUS:'APPROVED',JSON_REF:''};}
function smLocationRow_(o,i){return {LOCATION_ID:o.location_id||('LOC_'+smPad_(i+1,3)),NAME:o.name||'',PARENT_LOCATION_ID:o.parent_location_id||'',LOCATION_TYPE:o.location_type||'',STORY_ROLE:o.story_role||'',PAYLOAD_ROLE:o.payload_role||'',MEANING_BEGINNING:o.meaning_beginning||'',MEANING_MIDDLE:o.meaning_middle||'',MEANING_END:o.meaning_end||'',ATMOSPHERE:o.atmosphere||'',TIME_VARIANTS:o.time_variants||'',WEATHER_VARIANTS:o.weather_variants||'',IMPORTANT_OBJECTS:o.important_objects||'',REQUIRED_SUBAREAS:o.required_subareas||'',ACCESS_RELATIONSHIPS:o.access_relationships||'',CHARACTERS_ASSOCIATED:o.characters_associated||'',MAP_SIZE_HINT:o.map_size_hint||'',EXPLORATION_LEVEL:o.exploration_level||'MEDIUM',PRIVACY_LEVEL:o.privacy_level||'MEDIUM',STATUS:'APPROVED',VERSION:smCurrentVersion_(),JSON_REF:''};}
function smSceneRow_(o,i){return {SCENE_ID:o.scene_id||('SCENE_'+smPad_(i+1,3)),STRUCTURE_ID:o.structure_id||'',CHRONOLOGY_ORDER:o.chronology_order||i+1,PRESENTATION_ORDER:o.presentation_order||i+1,TITLE:o.title||'',SUMMARY:o.summary||'',STORY_FUNCTION:o.story_function||'',PAYLOAD_FUNCTION:o.payload_function||'',PAYLOAD_IMPORTANCE:o.payload_importance||'',LOCATION_ID:o.location_id||'',LOCATION_AREA:o.location_area||'',TIME:o.time||'',WEATHER:o.weather||'',ATMOSPHERE:o.atmosphere||'',CHARACTERS:o.characters||'',ENTRY_STATE_REF:o.entry_state_ref||'',CHARACTER_CHANGES:o.character_changes||'',EXIT_STATE_REF:o.exit_state_ref||'',EXPERIENCE_PROFILE_ID:o.experience_profile_id||('EXP_'+smPad_(i+1,3)),SETUP:o.setup||'',PAYOFF:o.payoff||'',REQUIRED_OBJECTS:o.required_objects||'',REQUIRED_ASSETS:o.required_assets||'',MUSIC_MOOD:o.music_mood||'',NPC_NEEDS:o.npc_needs||'',TRANSITION_IN:o.transition_in||'',TRANSITION_OUT:o.transition_out||'',STATUS:'APPROVED',VERSION:smCurrentVersion_(),JSON_REF:''};}
function smCharacterStateRow_(o,i){return {STATE_ID:o.state_id||('STATE_'+smPad_(i+1,4)),SCENE_ID:o.scene_id||'',CHARACTER_ID:o.character_id||'',CHRONOLOGY_ORDER:o.chronology_order||'',PRESENTATION_ORDER:o.presentation_order||'',BEFORE_STATE:o.before_state||'',CHANGE:o.change||'',AFTER_STATE:o.after_state||'',CHANGE_REASON:o.change_reason||'',TRUST_STATE:o.trust_state||'',FEAR_STATE:o.fear_state||'',GOAL_STATE:o.goal_state||'',RELATIONSHIP_STATE:o.relationship_state||'',KNOWLEDGE_STATE:o.knowledge_state||'',EMOTIONAL_STATE:o.emotional_state||'',CONTINUITY_NOTES:o.continuity_notes||'',VERSION:smCurrentVersion_(),JSON_REF:''};}
function smExperienceRow_(o,i){return {EXPERIENCE_PROFILE_ID:o.experience_profile_id||('EXP_'+smPad_(i+1,3)),SCENE_ID:o.scene_id||'',AUDIENCE_VERSION:o.audience_version||smControlValue_('Audience Version'),VALUE_PRIORITY:o.value_priority==null?60:o.value_priority,AUDIENCE_PRIORITY:o.audience_priority==null?40:o.audience_priority,EMOTION:o.emotion||0,CURIOSITY:o.curiosity||0,HUMOR:o.humor||0,STIMULATION:o.stimulation||0,WARMTH:o.warmth||0,STRATEGY:o.strategy||0,ACHIEVEMENT:o.achievement||0,OTHER_1_LABEL:o.other_1_label||'',OTHER_1_SCORE:o.other_1_score||0,TOTAL_SCORE:10,CURVE_SEGMENT:o.curve_segment||'',ORDERING_TECHNIQUE:o.ordering_technique||'',REASON:o.reason||''};}
function smValidationRow_(o,i){return {VALIDATION_ID:'VAL_'+smTimestamp_().replace(/[- :]/g,'')+'_'+smPad_(i+1,3),RUN_AT:new Date(),SCOPE:o.scope||'',TARGET_ID:o.target_id||'',CHECK_TYPE:o.check_type||'',RESULT:o.result||'',SCORE:o.score||'',SEVERITY:o.severity||'',ISSUE:o.issue||'',EVIDENCE:o.evidence||'',SUGGESTED_FIX:o.suggested_fix||'',AUTO_FIX_ALLOWED:!!o.auto_fix_allowed,PAYLOAD_IMPACT:o.payload_impact||'',AUDIENCE_IMPACT:o.audience_impact||'',STATUS:'OPEN',JSON_REF:''};}
function smVersionRow_(o){return {VERSION_ID:o.version_id,CREATED_AT:o.created_at,PROJECT_ID:o.project_id,STORY_VERSION:o.story_version,PAYLOAD_VERSION:o.payload_version,AUDIENCE_VERSION:o.audience_version,CHARACTERS_VERSION:o.characters_version,STRUCTURE_VERSION:o.structure_version,LOCATIONS_VERSION:o.locations_version,SCENES_VERSION:o.scenes_version,EXPERIENCE_VERSION:o.experience_version,VALIDATION_RUN_ID:o.validation_run_id,GIT_COMMIT:o.git_commit,SUPABASE_SNAPSHOT_ID:o.supabase_snapshot_id,BUILD_ID:o.build_id,STATUS:o.status,NOTES:o.notes,JSON_MANIFEST_REF:o.json_manifest_ref};}
function smNormalizeExperience10_(o){const keys=['emotion','curiosity','humor','stimulation','warmth','strategy','achievement','other_1_score'];let vals=keys.map(function(k){return Math.max(0,Number(o[k]||0));});let sum=vals.reduce(function(a,b){return a+b;},0);if(sum===0){o.curiosity=10;return o;}const scaled=vals.map(function(v){return Math.round(v/sum*100)/10;});let diff=Math.round((10-scaled.reduce(function(a,b){return a+b;},0))*10)/10;scaled[0]=Math.max(0,Math.round((scaled[0]+diff)*10)/10);keys.forEach(function(k,i){o[k]=scaled[i];});return o;}
function smApplyPresentationOrders_(exp){const orders={};exp.forEach(function(x){if(x.scene_id)orders[String(x.scene_id)]=x.presentation_order;});const sh=smSheet_(SM.SHEETS.SCENES),headers=smHeaders_(sh),idc=headers.indexOf('SCENE_ID')+1,pc=headers.indexOf('PRESENTATION_ORDER')+1;if(idc<1||pc<1)return;for(let r=2;r<=sh.getLastRow();r++){const id=String(sh.getRange(r,idc).getValue()||'');if(orders[id]!=null)sh.getRange(r,pc).setValue(orders[id]);}}
function smIssue_(scope,target,check,result,severity,issue,evidence,fix,autoFix){return {scope:scope,target_id:target,check_type:check,result:result,score:'',severity:severity,issue:issue,evidence:evidence,suggested_fix:fix,auto_fix_allowed:autoFix,payload_impact:'',audience_impact:''};}
function smPad_(n,len){return String(n).padStart(len,'0');}
function smLog_(operation,result,message,details){try{const obj={LOG_ID:'LOG_'+Utilities.getUuid(),RUN_AT:new Date(),PROJECT_ID:smControlValue_('Project ID')||SM.DEFAULT_PROJECT_ID,OPERATION:operation,INPUT_VERSION:smCurrentVersion_(),OUTPUT_VERSION:smCurrentVersion_(),MODEL:SM.MODEL,PROMPT_HASH:'',RESULT:result,MESSAGE:message,DETAILS:details||'',DURATION_MS:'',SOURCE:'APPS_SCRIPT_REMOTE',USER_EMAIL:Session.getActiveUser().getEmail()||'',JSON_REF:'',GIT_COMMIT:'',SUPABASE_REF:''};smAppendObjects_(SM.SHEETS.LOG,[obj],function(x){return x;});}catch(ignored){}}
