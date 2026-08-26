/* 1 STORY MAKER — Runtime Patch v5
 * Applied after archived v4 base.
 * Fixes: CONTROL formula preservation, state/scene alignment, time-as-text,
 * explicit negative-canon validation, and validation state reporting.
 */

var smV4GenerateScenes_ = smGenerateScenes;
var smV4ValidateStory_ = smValidateStory;
var smV4SaveVersion_ = smSaveVersion;

smSetControls_ = function(obj){
  const s=smSheet_('CONTROL');
  const rows=Math.min(40,s.getMaxRows());
  const labels=s.getRange(1,1,rows,1).getValues();
  labels.forEach(function(r,i){
    const k=String(r[0]||'');
    if(Object.prototype.hasOwnProperty.call(obj,k)) s.getRange(i+1,2).setValue(obj[k]);
  });
};

smGenerateScenes = function(){
  const n=smV4GenerateScenes_();
  smRepairStateSceneLinks_();
  smForceSceneTimesText_();
  return n;
};

function smRepairStateSceneLinks_(){
  const scenes=smRows_('SCENES'), link={};
  scenes.forEach(function(s){
    const sid=String(s.SCENE_ID||'');
    if(s.ENTRY_STATE_REF) link[String(s.ENTRY_STATE_REF)]=sid;
    if(s.EXIT_STATE_REF) link[String(s.EXIT_STATE_REF)]=sid;
  });
  const sh=smSheet_('CHARACTER_STATE'),h=smHeaders_(sh),last=sh.getLastRow();
  const idc=h.indexOf('STATE_ID'),sc=h.indexOf('SCENE_ID');
  if(last<2||idc<0||sc<0)return;
  const vals=sh.getRange(2,1,last-1,h.length).getValues();
  let dirty=false;
  vals.forEach(function(r){
    const target=link[String(r[idc]||'')];
    if(target&&String(r[sc]||'')!==target){r[sc]=target;dirty=true;}
  });
  if(dirty)sh.getRange(2,1,vals.length,h.length).setValues(vals);
}

function smForceSceneTimesText_(){
  const sh=smSheet_('SCENES'),h=smHeaders_(sh),last=sh.getLastRow(),tc=h.indexOf('TIME')+1;
  if(last<2||tc<1)return;
  const rg=sh.getRange(2,tc,last-1,1),display=rg.getDisplayValues();
  rg.setNumberFormat('@');
  rg.setValues(display);
}

function smCanonicalConstraintAudit_(){
  const context=smContext_(['INPUT','STORY','CHARACTERS','STRUCTURE','LOCATIONS','SCENES','CHARACTER_STATE']);
  const prompt=[
    'You are a strict creator-constraint QA system. Return ONLY JSON.',
    'Extract explicit prohibitions, negative constraints, must-not rules, required ending conditions, and presence/absence constraints from creator INPUT.',
    'Then inspect DOWNSTREAM generated content only: STORY narrative claims, CHARACTERS, STRUCTURE, LOCATIONS, SCENES, and CHARACTER_STATE.',
    'A sentence in INPUT or creator notes that merely states a prohibition is NOT itself a violation.',
    'Distinguish ordinary memory/flashback staging from supernatural phenomena. If creator forbids supernatural content, a real-memory overlay is allowed, but an actual ghost, apparition, hallucination presented as real, magic, or paranormal mechanism is a violation.',
    'If a prohibited event/entity/mechanic is implemented downstream, emit CANON_CONSTRAINT_VIOLATION with FAIL and HIGH or CRITICAL severity.',
    'Also verify every explicit required ending condition is actually present and no explicitly forbidden resolution is added.',
    'If there are no violations, return an empty checks array.',
    'Context:',JSON.stringify(context),
    'Schema: {"checks":[{"scope":"STORY|SCENE|CHARACTER|LOCATION","target_id":"","check_type":"CANON_CONSTRAINT_VIOLATION|REQUIRED_CONDITION_MISSING","result":"FAIL|WARN","score":0,"severity":"LOW|MEDIUM|HIGH|CRITICAL","issue":"","evidence":"","suggested_fix":"","auto_fix_allowed":false,"payload_impact":"","audience_impact":""}]}'
  ].join('\n');
  const ai=smGemini_(prompt,'CANON_CONSTRAINT_AUDIT');
  const checks=ai.checks||[];
  if(!checks.length)return 0;
  const now=Date.now();
  smAppend_('VALIDATION',checks.map(function(c,i){return {
    VALIDATION_ID:'CANON_'+smPad_(i+1,3)+'_'+now,
    RUN_AT:new Date(),SCOPE:c.scope||'STORY',TARGET_ID:c.target_id||'',
    CHECK_TYPE:c.check_type||'CANON_CONSTRAINT_VIOLATION',RESULT:smResult_(c.result),
    SCORE:c.score==null?'':c.score,SEVERITY:smSeverity_(c.severity),ISSUE:c.issue||'',
    EVIDENCE:c.evidence||'',SUGGESTED_FIX:c.suggested_fix||'',AUTO_FIX_ALLOWED:!!c.auto_fix_allowed,
    PAYLOAD_IMPACT:c.payload_impact||'',AUDIENCE_IMPACT:c.audience_impact||'',STATUS:'OPEN',JSON_REF:''
  };}));
  return checks.length;
}

smValidateStory = function(){
  smRepairStateSceneLinks_();
  smForceSceneTimesText_();
  smV4ValidateStory_();
  smCanonicalConstraintAudit_();
  const failed=smRows_('VALIDATION').some(function(x){return String(x.RESULT||'').toUpperCase()==='FAIL';});
  smSetControl_('Validation Status',failed?'FAIL':'PASS');
  return !failed;
};

smSaveVersion = function(){
  const id='V_'+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss');
  smAppend_('VERSIONS',[{VERSION_ID:id,CREATED_AT:new Date(),PROJECT_ID:smControl_('Project ID')||'GAME_001',STORY_VERSION:smControl_('Story Version')||0,PAYLOAD_VERSION:smControl_('Payload Version')||0,AUDIENCE_VERSION:smControl_('Audience Version')||0,CHARACTERS_VERSION:smRows_('CHARACTERS').length,STRUCTURE_VERSION:smRows_('STRUCTURE').length,LOCATIONS_VERSION:smRows_('LOCATIONS').length,SCENES_VERSION:smRows_('SCENES').length,EXPERIENCE_VERSION:smRows_('EXPERIENCE').length,VALIDATION_RUN_ID:'',GIT_COMMIT:'',SUPABASE_SNAPSHOT_ID:'',BUILD_ID:'',STATUS:'SNAPSHOT',NOTES:'Online runtime v5 fidelity snapshot',JSON_MANIFEST_REF:''}]);
  return id;
};
