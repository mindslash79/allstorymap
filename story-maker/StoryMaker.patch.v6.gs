/* 1 STORY MAKER — Runtime Patch v6
 * Creator Intent Fidelity layer.
 * Soft-intent drift is scored separately from hard-canon validity.
 */

var smV5RunNamedAction_ = smRunNamedAction_;
var smV5ValidateStory_ = smValidateStory;
var smV5SaveVersion_ = smSaveVersion;

smRunNamedAction_ = function(action){
  if(action==='CREATOR_INTENT_AUDIT'){
    try{
      const result=smCreatorIntentAudit_();
      smLog_(action,'SUCCESS','Completed','');
      return result;
    }catch(err){
      smLog_(action,'FAILED','Failed',err&&err.message?err.message:String(err));
      throw err;
    }
  }
  return smV5RunNamedAction_(action);
};

function smIntentResultFromScore_(score){
  const n=Number(score);
  if(!isFinite(n))return 'WARN';
  if(n>=90)return 'PASS';
  if(n>=60)return 'WARN';
  return 'FAIL';
}

function smClearPriorIntentRows_(){
  const existing=smRows_('VALIDATION').filter(function(r){
    return String(r.CHECK_TYPE||'').indexOf('INTENT_')!==0;
  });
  smReplace_('VALIDATION',existing);
}

function smCreatorIntentAudit_(){
  const context=smContext_(['INPUT','STORY','PAYLOAD','AUDIENCE','CHARACTERS','STRUCTURE','LOCATIONS','SCENES','EXPERIENCE','CHARACTER_STATE','FINAL']);
  const prompt=[
    'You are a Creator Intent Fidelity QA system for a narrative RPG. Return ONLY valid JSON.',
    'This is NOT a hard-fact audit. Hard canon is checked elsewhere. Your job is to compare the creator INPUT with the generated downstream work and measure preservation of SOFT INTENT.',
    'Soft intent includes relational stance, thematic emphasis, emotional palette, tone, everyday lived-in texture, warmth/humor balance, pacing, moral framing, ambiguity, intended after-feeling, and the creator\'s desired degree of catharsis.',
    'Do not invent creator intent. Only score intentions explicitly stated or very strongly implied in INPUT.',
    'Do not punish useful elaboration merely because it was not literally in INPUT, provided it supports the stated intent.',
    'Distinguish protagonist responsibility from moral simplification. If the creator says both people were imperfect and genuinely cared for each other, flag downstream framing that turns one into a nearly flawless moral ideal and the other into the sole selfish wrongdoer.',
    'If the creator explicitly asks for small funny memories or warmth and EXPERIENCE assigns HUMOR=0 everywhere with no comparable light comic beats in scenes, flag meaningful intent loss.',
    'Check whether sadness is balanced by ordinary life, warmth, affection, and lightness when requested, rather than becoming uniformly solemn or emotionally coercive.',
    'Check whether the ending creates the requested embodied after-feeling, not merely the correct plot event.',
    'Check whether setting details create the requested lived-in everyday atmosphere rather than only symbolic melancholy.',
    'Use these required dimensions exactly: RELATIONSHIP_BALANCE, TONE_FIDELITY, HUMOR_WARMTH, MORAL_FRAMING, EMOTIONAL_CURVE, ENDING_AFTERFEEL, LIVED_IN_TEXTURE.',
    'Score each 0-100. 90-100 = strong fidelity; 75-89 = minor drift; 60-74 = meaningful drift; below 60 = major drift.',
    'Use PASS for >=90, WARN for 60-89, FAIL for <60. A soft-intent FAIL is advisory and does not automatically invalidate hard canon.',
    'Provide precise evidence from creator INPUT and generated outputs, and a minimal suggested fix that preserves existing strong material.',
    'Then provide overall_score and overall_result using the same thresholds. Weight relationship stance, explicit tone requirements, and intended player after-feeling more heavily than decorative details.',
    'Context:',JSON.stringify(context),
    'Schema:',JSON.stringify({
      overall_score:0,
      overall_result:'PASS|WARN|FAIL',
      summary:'',
      checks:[{
        dimension:'RELATIONSHIP_BALANCE|TONE_FIDELITY|HUMOR_WARMTH|MORAL_FRAMING|EMOTIONAL_CURVE|ENDING_AFTERFEEL|LIVED_IN_TEXTURE',
        score:0,
        result:'PASS|WARN|FAIL',
        severity:'INFO|LOW|MEDIUM|HIGH',
        issue:'',
        evidence:'',
        suggested_fix:''
      }]
    })
  ].join('\n');
  const out=smGemini_(prompt,'CREATOR_INTENT_AUDIT');
  const score=Math.max(0,Math.min(100,Number(out.overall_score)||0));
  const overallResult=smIntentResultFromScore_(score);
  const now=Date.now();
  const rows=[{
    VALIDATION_ID:'INTENT_OVERALL_'+now,RUN_AT:new Date(),SCOPE:'STORY',TARGET_ID:smControl_('Project ID')||'',
    CHECK_TYPE:'INTENT_OVERALL',RESULT:overallResult,SCORE:score,
    SEVERITY:overallResult==='PASS'?'INFO':overallResult==='WARN'?'MEDIUM':'HIGH',
    ISSUE:out.summary||'',EVIDENCE:'Creator INPUT vs complete generated narrative/experience dataset',
    SUGGESTED_FIX:'See INTENT_* dimension rows.',AUTO_FIX_ALLOWED:false,
    PAYLOAD_IMPACT:'Measures preservation of creator meaning beyond factual correctness.',
    AUDIENCE_IMPACT:'Measures intended player experience and tone fidelity.',STATUS:'OPEN',JSON_REF:''
  }];
  (out.checks||[]).forEach(function(c,i){
    const dim=String(c.dimension||'OTHER').toUpperCase();
    const s=Math.max(0,Math.min(100,Number(c.score)||0));
    const result=smIntentResultFromScore_(s);
    rows.push({
      VALIDATION_ID:'INTENT_'+smPad_(i+1,3)+'_'+now,RUN_AT:new Date(),SCOPE:'STORY',TARGET_ID:dim,
      CHECK_TYPE:'INTENT_'+dim,RESULT:result,SCORE:s,SEVERITY:smSeverity_(c.severity|| (result==='PASS'?'INFO':result==='WARN'?'MEDIUM':'HIGH')),
      ISSUE:c.issue||'',EVIDENCE:c.evidence||'',SUGGESTED_FIX:c.suggested_fix||'',AUTO_FIX_ALLOWED:false,
      PAYLOAD_IMPACT:'Creator-intent fidelity dimension: '+dim,AUDIENCE_IMPACT:'Player experience may drift if unresolved.',STATUS:'OPEN',JSON_REF:''
    });
  });
  smClearPriorIntentRows_();
  smAppend_('VALIDATION',rows);
  smSetControl_('Creator Intent Status',overallResult);
  smSetControl_('Creator Intent Score',score);
  smSetControl_('Creator Intent Summary',out.summary||'');
  return 'INTENT '+overallResult+' '+score;
}

smValidateStory = function(){
  const hardOk=smV5ValidateStory_();
  smCreatorIntentAudit_();
  const hardFailed=smRows_('VALIDATION').some(function(x){
    return String(x.CHECK_TYPE||'').indexOf('INTENT_')!==0 && String(x.RESULT||'').toUpperCase()==='FAIL';
  });
  smSetControl_('Validation Status',hardFailed?'FAIL':'PASS');
  return !hardFailed;
};

smSaveVersion = function(){
  const id='V_'+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss');
  smAppend_('VERSIONS',[{VERSION_ID:id,CREATED_AT:new Date(),PROJECT_ID:smControl_('Project ID')||'GAME_001',STORY_VERSION:smControl_('Story Version')||0,PAYLOAD_VERSION:smControl_('Payload Version')||0,AUDIENCE_VERSION:smControl_('Audience Version')||0,CHARACTERS_VERSION:smRows_('CHARACTERS').length,STRUCTURE_VERSION:smRows_('STRUCTURE').length,LOCATIONS_VERSION:smRows_('LOCATIONS').length,SCENES_VERSION:smRows_('SCENES').length,EXPERIENCE_VERSION:smRows_('EXPERIENCE').length,VALIDATION_RUN_ID:'',GIT_COMMIT:'',SUPABASE_SNAPSHOT_ID:'',BUILD_ID:'',STATUS:'SNAPSHOT',NOTES:'Online runtime v6 creator-intent fidelity snapshot',JSON_MANIFEST_REF:''}]);
  return id;
};
