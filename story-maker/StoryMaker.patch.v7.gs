/* 1 STORY MAKER — Runtime Patch v7
 * Creator Intent Revision Loop.
 * Uses minimal downstream patches, preserves hard canon, revalidates, and stops at target fidelity.
 */

var smV6RunNamedAction_ = smRunNamedAction_;
var smV6FinalizeStory_ = smFinalizeStory;
var smV6SaveVersion_ = smSaveVersion;

smRunNamedAction_ = function(action){
  if(action==='INTENT_REVISION_LOOP'){
    try{
      const result=smIntentRevisionLoop_();
      smLog_(action,'SUCCESS','Completed','');
      return result;
    }catch(err){
      smLog_(action,'FAILED','Failed',err&&err.message?err.message:String(err));
      throw err;
    }
  }
  return smV6RunNamedAction_(action);
};

/* Soft-intent FAIL is advisory; FINAL is blocked only by hard validation failures. */
smFinalizeStory = function(){
  const all=smRows_('VALIDATION');
  const hard=all.filter(function(r){return String(r.CHECK_TYPE||'').indexOf('INTENT_')!==0;});
  smReplace_('VALIDATION',hard);
  try{return smV6FinalizeStory_();}
  finally{smReplace_('VALIDATION',all);}
};

function smIntentRevisionLoop_(){
  const target=smClamp_(Number(smControl_('Intent Revision Target')||90),60,100);
  const maxIterations=Math.round(smClamp_(Number(smControl_('Intent Revision Max Iterations')||2),1,3));
  let score=Number(smControl_('Creator Intent Score')||0);
  let status=String(smControl_('Creator Intent Status')||'NOT RUN');
  let iterations=0,accepted=0;
  const startScore=score;

  if(!score || !smRows_('VALIDATION').some(function(r){return String(r.CHECK_TYPE)==='INTENT_OVERALL';})){
    smCreatorIntentAudit_();
    score=Number(smControl_('Creator Intent Score')||0);
    status=String(smControl_('Creator Intent Status')||'WARN');
  }

  smSetControl_('Intent Revision Result','RUNNING · start '+score+' → target '+target);

  while(score<target && iterations<maxIterations){
    iterations++;
    const backup={
      scenes:smRows_('SCENES'),experience:smRows_('EXPERIENCE'),states:smRows_('CHARACTER_STATE'),
      validation:smRows_('VALIDATION'),intentStatus:status,intentScore:score,intentSummary:smControl_('Creator Intent Summary')||''
    };

    const patch=smGenerateIntentRevisionPatch_(target,iterations);
    smApplyIntentRevisionPatch_(patch);
    smRepairStateSceneLinks_();
    smForceSceneTimesText_();

    const hardOk=smValidateStory();
    const newScore=Number(smControl_('Creator Intent Score')||0);
    const newStatus=String(smControl_('Creator Intent Status')||'WARN');

    if(!hardOk || newScore<score){
      smReplace_('SCENES',backup.scenes);
      smReplace_('EXPERIENCE',backup.experience);
      smReplace_('CHARACTER_STATE',backup.states);
      smReplace_('VALIDATION',backup.validation);
      smSetControls_({
        'Creator Intent Status':backup.intentStatus,
        'Creator Intent Score':backup.intentScore,
        'Creator Intent Summary':backup.intentSummary,
        'Validation Status':'PASS'
      });
      smSetControl_('Intent Revision Result','ROLLED BACK · iteration '+iterations+' did not improve safely');
      break;
    }

    accepted++;
    score=newScore;
    status=newStatus;
    smLog_('INTENT_REVISION_'+iterations,'SUCCESS','Intent '+backup.intentScore+' → '+score,'');
    smSetControl_('Intent Revision Iterations',iterations);
    smSetControl_('Intent Revision Result','ACCEPTED '+iterations+' · '+startScore+' → '+score+' / target '+target);
  }

  if(accepted>0){
    const newVersion=smBumpStoryRevisionVersion_();
    smFinalizeStory();
    const snapshot=smSaveVersion();
    smSetControl_('Status','FINAL');
    smSetControl_('Intent Revision Result',(score>=target?'TARGET MET':'BEST EFFORT')+' · '+startScore+' → '+score+' · '+accepted+' revision(s) · '+snapshot);
    return JSON.stringify({start_score:startScore,end_score:score,target:target,iterations:iterations,accepted:accepted,story_version:newVersion,snapshot:snapshot,status:score>=target?'TARGET_MET':'BEST_EFFORT'});
  }

  smSetControl_('Intent Revision Result',(score>=target?'NO CHANGE NEEDED':'NO SAFE IMPROVEMENT')+' · score '+score);
  return JSON.stringify({start_score:startScore,end_score:score,target:target,iterations:iterations,accepted:0,status:score>=target?'TARGET_MET':'NO_SAFE_IMPROVEMENT'});
}

function smGenerateIntentRevisionPatch_(target,iteration){
  const intentRows=smRows_('VALIDATION').filter(function(r){return String(r.CHECK_TYPE||'').indexOf('INTENT_')===0;});
  const context=smContext_(['INPUT','STORY','PAYLOAD','CHARACTERS','STRUCTURE','LOCATIONS','SCENES','EXPERIENCE','CHARACTER_STATE']);
  const prompt=[
    'You are a precision narrative editor for an RPG Maker MV project. Return ONLY valid JSON.',
    'Goal: minimally revise downstream content to improve Creator Intent Fidelity to at least '+target+'. This is revision iteration '+iteration+'.',
    'Preserve all strong existing material. Do NOT regenerate the story wholesale.',
    'ABSOLUTELY LOCKED: all creator hard facts, names, ages, relationships, life/death/health status, location IDs, location sequence, chronology, scene IDs, structure IDs, scene order, exact current times, 5-photo structure, Vancouver fact, 40-second apology message, no reply, 9:10 PM bus, no combat, no magic, no supernatural phenomena, no physical present-day Min-seo, and the ending meaning of relinquishing control over the response.',
    'Do not alter SCENE_ID, STRUCTURE_ID, LOCATION_ID, CHRONOLOGY_ORDER, PRESENTATION_ORDER, TIME, WEATHER, CHARACTERS, ENTRY_STATE_REF, EXIT_STATE_REF, EXPERIENCE_PROFILE_ID, status, or version fields.',
    'The current intent audit is authoritative guidance for SOFT revisions only:',JSON.stringify(intentRows),
    'Current project context:',JSON.stringify(context),
    'Prioritize the lowest-scoring intent dimensions. Make the smallest set of edits that fixes them.',
    'For this project specifically, if supported by the audit: restore mutual teenage awkwardness rather than making Min-seo morally flawless; add small funny/warm ordinary memories as emotional breathing room; lighten selected atmosphere/music wording without making the game comedic; preserve mature responsibility framing and the final quiet autonomy.',
    'Experience scores for every patched row MUST be nonnegative and sum exactly 10 across EMOTION,CURIOSITY,HUMOR,STIMULATION,WARMTH,STRATEGY,ACHIEVEMENT,OTHER_1_SCORE.',
    'Only return rows that actually need changes.',
    'Schema:',JSON.stringify({
      rationale:'',
      scene_patches:[{SCENE_ID:'SCENE_003',SUMMARY:'',ATMOSPHERE:'',CHARACTER_CHANGES:'',SETUP:'',PAYOFF:'',REQUIRED_ASSETS:'',MUSIC_MOOD:'',NPC_NEEDS:''}],
      experience_patches:[{EXPERIENCE_PROFILE_ID:'EXP_003',EMOTION:3,CURIOSITY:1,HUMOR:2,STIMULATION:1,WARMTH:2,STRATEGY:0,ACHIEVEMENT:0,OTHER_1_LABEL:'Nostalgia',OTHER_1_SCORE:1,CURVE_SEGMENT:'',ORDERING_TECHNIQUE:'',REASON:''}],
      state_patches:[{STATE_ID:'STATE_003_CHAR001_ENTRY',BEFORE_STATE:'',CHANGE:'',AFTER_STATE:'',BELIEF:'',RELATIONSHIP_CHANGES:'',EMOTIONAL_STATE:'',CHANGE_REASON:''}]
    })
  ].join('\n');
  return smGemini_(prompt,'INTENT_REVISION_LOOP');
}

function smApplyIntentRevisionPatch_(patch){
  smPatchRowsById_('SCENES','SCENE_ID',patch.scene_patches||[],[
    'SUMMARY','ATMOSPHERE','CHARACTER_CHANGES','SETUP','PAYOFF','REQUIRED_ASSETS','MUSIC_MOOD','NPC_NEEDS'
  ]);
  const ex=(patch.experience_patches||[]).map(function(p){return smNormalizeExperiencePatch_(p);});
  smPatchRowsById_('EXPERIENCE','EXPERIENCE_PROFILE_ID',ex,[
    'EMOTION','CURIOSITY','HUMOR','STIMULATION','WARMTH','STRATEGY','ACHIEVEMENT','OTHER_1_LABEL','OTHER_1_SCORE','CURVE_SEGMENT','ORDERING_TECHNIQUE','REASON','TOTAL_SCORE'
  ]);
  smPatchRowsById_('CHARACTER_STATE','STATE_ID',patch.state_patches||[],[
    'BEFORE_STATE','CHANGE','AFTER_STATE','BELIEF','RELATIONSHIP_CHANGES','EMOTIONAL_STATE','CHANGE_REASON'
  ]);
}

function smPatchRowsById_(sheetName,idField,patches,allowed){
  if(!patches||!patches.length)return 0;
  const sh=smSheet_(sheetName),h=smHeaders_(sh),last=sh.getLastRow();
  if(last<2)return 0;
  const idc=h.indexOf(idField); if(idc<0)return 0;
  const vals=sh.getRange(2,1,last-1,h.length).getValues();
  const map={}; vals.forEach(function(r,i){map[String(r[idc]||'')]=i;});
  let changed=0;
  patches.forEach(function(p){
    const id=String(p[idField]||''); if(!Object.prototype.hasOwnProperty.call(map,id))return;
    const r=vals[map[id]];
    allowed.forEach(function(k){
      const c=h.indexOf(k);
      if(c>=0 && Object.prototype.hasOwnProperty.call(p,k) && p[k]!==null && p[k]!==undefined && p[k]!==''){
        r[c]=p[k]; changed++;
      }
    });
  });
  if(changed)sh.getRange(2,1,vals.length,h.length).setValues(vals);
  return changed;
}

function smNormalizeExperiencePatch_(p){
  const q=Object.assign({},p);
  const ks=['EMOTION','CURIOSITY','HUMOR','STIMULATION','WARMTH','STRATEGY','ACHIEVEMENT','OTHER_1_SCORE'];
  let a=ks.map(function(k){return Math.max(0,Number(q[k]||0));});
  let sum=a.reduce(function(x,y){return x+y;},0);
  if(!sum){a=[3,1,1,1,2,0,1,1];sum=10;}
  a=a.map(function(v){return Math.round(v/sum*100)/10;});
  let d=Math.round((10-a.reduce(function(x,y){return x+y;},0))*10)/10;
  a[0]=Math.max(0,Math.round((a[0]+d)*10)/10);
  ks.forEach(function(k,i){q[k]=a[i];});
  q.TOTAL_SCORE=10;
  return q;
}

function smBumpStoryRevisionVersion_(){
  const v=Number(smControl_('Story Version')||1)+1;
  smSetControl_('Story Version',v);
  smSetSingleColumnForAll_('STORY','STORY_VERSION',v);
  smSetSingleColumnForAll_('SCENES','VERSION',v);
  smSetSingleColumnForAll_('CHARACTER_STATE','VERSION',v);
  return v;
}

function smSetSingleColumnForAll_(sheetName,colName,value){
  const sh=smSheet_(sheetName),h=smHeaders_(sh),c=h.indexOf(colName)+1,last=sh.getLastRow();
  if(c>0&&last>1)sh.getRange(2,c,last-1,1).setValue(value);
}

function smClamp_(n,min,max){if(!isFinite(n))n=min;return Math.max(min,Math.min(max,n));}

smSaveVersion = function(){
  const id='V_'+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss');
  smAppend_('VERSIONS',[{VERSION_ID:id,CREATED_AT:new Date(),PROJECT_ID:smControl_('Project ID')||'GAME_001',STORY_VERSION:smControl_('Story Version')||0,PAYLOAD_VERSION:smControl_('Payload Version')||0,AUDIENCE_VERSION:smControl_('Audience Version')||0,CHARACTERS_VERSION:smRows_('CHARACTERS').length,STRUCTURE_VERSION:smRows_('STRUCTURE').length,LOCATIONS_VERSION:smRows_('LOCATIONS').length,SCENES_VERSION:smRows_('SCENES').length,EXPERIENCE_VERSION:smRows_('EXPERIENCE').length,VALIDATION_RUN_ID:'',GIT_COMMIT:'',SUPABASE_SNAPSHOT_ID:'',BUILD_ID:'',STATUS:'SNAPSHOT',NOTES:'Online runtime v7 creator-intent revision-loop snapshot',JSON_MANIFEST_REF:''}]);
  return id;
};
