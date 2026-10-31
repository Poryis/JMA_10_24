"""Summarize executed frontend review evidence; backend/account/payment work is paused."""
import json
from pathlib import Path
root=Path('/app/test_reports')
matrix=json.loads((root/'ntn_review_results.json').read_text())
final=json.loads((root/'review_final_results.json').read_text())
plays=[r for r in matrix if r['tag'].startswith('play:')]
outside=[r for r in plays if r.get('outside')]
print('Gameplay matrix',len(plays),'outside failures',len(outside))
print('Page errors',[r for r in matrix if r['tag']=='page-errors'])
print('WebKit',[r for r in matrix if r['tag']=='webkit'])
report={
 'summary':'Frontend-only public-preview review: 198 Name That Note gameplay observations across 18 mode/difficulty/label combinations and 11 viewports, compact/portrait menus, tours, utilities, two complete 10-question rounds, real pointer dragging and visible-viewport resize. Rhythm fixes retested at 568x260 for all difficulties; automatic/manual Copy and Trail sessions investigated. Three confirmed functional/layout bugs remain. No application code modified.',
 'backend_issues':{'critical':[],'minor':[]},
 'frontend_issues':{
  'ui_bugs':[
   {'component':'Name It / Both labels compact answers','issue':'Pro/master Both labels force the 44px answer row to 62px. At 568x260 every answer spans y206..268; the viewport-fixed overflow-hidden room clips the bottom 8px, including High Do/C. Reproduced independently after settling. Matrix also detects clipping at 844x390,844x300,812x290. Other requested sizes/labels pass outer bounds.','selector':'[data-testid="ntn-answer-High-C"]','priority':'HIGH'},
   {'component':'Name That Note Restart during feedback','issue':'Answer a question then immediately click Restart. After 1.3s the fresh opening tour shows Note 2 / 10 rather than Note 1 / 10. The prior answer-advance callback survives clearTimers and writes old progress/target into the restarted round.','selector':'[data-testid="ntn-restart-btn"]','priority':'HIGH'},
   {'component':'Rhythm Run / Trail automatic session completion','issue':'Without manually advancing the last round, Trail never displays its session summary. Independent retest completed seven rounds: headers 1/5,2/5,3/5,4/5,5/5,5/5,5/5 with score increasing 123→876. Earlier run also timed out awaiting the summary. Manual Trail completes five rounds and final score 655 equals live 655.','selector':'[data-testid="boom-session-summary"]','priority':'HIGH'}
  ],
  'integration_issues':[],
  'design_issues':[
   {'screen':'Rhythm instructions at 320x568 portrait','issues':['Previously reported partial Start clipping persists: Copy Start y539.9..583.9; Trail y529.1..573.2. Cards internally scroll (Copy612/528px; Trail601/528px). Actual Start clicks succeeded through Playwright auto-scroll, so not blocked, but instructions do not fit without scrolling.','Portrait picker remains scrollable:1263px content at320x568 and1197px at390x844. This is fallback behavior, not a new compact regression.']},
   {'screen':'Name That Note answer readability','issues':['Yellow Mi/E on white has visibly weak contrast, especially narrow Both-label answer buttons. Staff remains large/readable and Finn is substantially larger than the old64px presentation.']}
  ]
 },
 'test_report_links':[str(root/p) for p in ['test_ntn_review.py','test_review_followup.py','test_review_final_checks.py','ntn_review_results.json','ntn_followup_results.json','review_followup_results.json','review_final_results.json']],
 'action_items':[
  'Budget the compact answer row for the longest Both label without pushing its buttons past the visible viewport; retest at568x260,812x290,844x300 and844x390.',
  'Store/cancel the answer-advance timeout (or guard it with a round-generation token) on Restart, Change Mode and unmount.',
  'Fix stale currentRound/finish callback capture in Trail automatic recursion; ensure exactly five rounds lead to summary and score matches. Also inspect the analogous natural-timeout Copy path, whose tested early-tap automatic completion passed.',
  'Optionally fit portrait Copy/Trail instructions and improve yellow answer-label contrast.',
  'Perform real iPhone Safari/address-bar and safe-area testing; WebKit is unavailable here.'
 ],
 'critical_code_review_comments':[
  'NameThatNotePage.css fixes compact ntn-answer-actions flex-basis/min-height at44px but grid child min-content grows to62px when High Do/C wraps to3 lines. Overflow-hidden room masks it rather than fitting it.',
  'NameThatNotePage.js answer() lines471-474 uses a bare setTimeout not held by any ref handled in clearTimers(). Restart is always enabled during feedback, so old-round continuation mutates fresh state.',
  'BoomGardenPage.js finishCopyRound captures currentRound and mode; automatic callback invokes captured startTrail, which schedules captured finishCopyRound in its natural finish timeout. That recursive callback chain can retain an old round even though setCurrentRound increments the visible counter (display capped at5). scoreRef fixes the score value but not this round-control capture.',
  'NameThatNotePage.js946 lines and BoomGardenPage.js1879 lines exceed the700-line review guideline; extract gameplay/session logic when refactoring.',
  'The rhythm live header score still lacks data-testid; score assertions use scoped header.game-card fallback.'
 ],
 'updated_files':[str(root/p) for p in ['test_ntn_review.py','test_review_followup.py','test_review_final_checks.py','write_iteration_61.py','iteration_61.json']],
 'success_rate':{'backend':'N/A — skipped as requested','frontend':'190/198 gameplay outer-bound observations passed (96%); all11 menu bounds passed; no detected page/internal gameplay scrolling or HUD/fullscreen overlaps. 2/2 full note rounds,16/16 settled real note drops passed. Rhythm3/3 compact difficulty readability and fullscreen checks pass;3/4 session variants complete with matching scores (Copy auto706/706,Copy manual703/703,Trail manual655/655;Trail auto fails completion).'},
 'test_credentials':'None required; no auth tested.',
 'seed_data_creation':'Browser-local TEST context only: jma_unlock_all_v1,jma_player_name_skipped_v1,jma_reveal_seen_v1=1 and earned local gameplay progress. Progression/backend linkage remains MOCKED (localStorage only); backend/accounts/payments strictly paused.',
 'retest_needed':True,
 'should_main_agent_self_test':False,
 'context_for_next_testing_agent':'Public URL from frontend/.env. Chromium touch-enabled context. Exit fullscreen after audio unlock before viewport tests. Wait for delayed orientation overlay and dismiss it. Initial matrix menu320 screenshot caught orientation overlay; final settled-menu reproduction is clean. Check pulses indefinitely, so force=True avoids Playwright stability timeout; actual pointer activation succeeds. Initial drag measurements at~220ms showed spring interpolation (14/16 pass); final600ms settled reproduction confirms16/16 exact NOTE_Y. Range check flagged intentional wrong-answer X badge and Drag me chip outside their inner parent boxes; these are not separate page-clipping bugs. Finn assets both tightly cropped (danger523x700,disco533x700); mood frames keep field geometry and visible character bounds. Party,cheer,idle sampled during actual rounds; no shrink/layout jump confirmed. Opening/replay full tour and skip work. Both complete rounds had9correct/1wrong,120points with summary and play-again verified. Trail auto score cannot be compared because summary never appears. No actual audio listening/Safari device verification. Preserve scripts/logs/results; no app changes made.',
 'rca of the issue':'Label failure: fixed44px flex row plus min-content62px grid items, hidden by fixed260px root. Restart failure: uncancelled1s/2.3s answer timeout crosses round boundaries. Trail auto failure: recursive startTrail/natural finishCopyRound uses captured round state; seven executed rounds never finish while manual branch uses fresh currentRound and succeeds.'
}
(root/'iteration_61.json').write_text(json.dumps(report,indent=2))