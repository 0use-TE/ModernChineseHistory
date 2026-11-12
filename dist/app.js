const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let persisted = {};
try { persisted = JSON.parse(localStorage.getItem('history-timeline-progress-v1') || '{}') || {}; } catch {}
const validIds = new Set(EVENTS.map(e=>e.id));
const state = {era:-1,view:'outline',filter:'all',search:'',traps:true,
  saved:new Set((Array.isArray(persisted.saved)?persisted.saved:[]).filter(id=>validIds.has(id))),
  learned:new Set((Array.isArray(persisted.learned)?persisted.learned:[]).filter(id=>validIds.has(id)))};
let quiz = null;
const OUTLINE = [
  [['鸦片战争','鸦片战争'],['洋务运动','洋务运动'],['辛亥革命','辛亥革命']],
  [['五四运动','五四运动'],['中国共产党成立','中国共产党成立'],['第一次国共合作','第一次国共合作']],
  [['秋收起义','井冈山道路'],['遵义会议','遵义会议'],['西安事变','西安事变']],
  [['七七事变','全民族抗战'],['抗日战争胜利','抗战胜利'],['政治协商会议第一届','筹建新中国']],
  [['中华人民共和国成立','新中国成立'],['社会主义改造基本完成','社会主义制度确立'],['“文化大革命”','建设曲折']],
  [['十一届三中全会','改革开放'],['南方谈话','市场经济改革目标'],['加入世界贸易组织','加入世贸组织']],
  [['中共十八大','十八大'],['中共十九大','十九大'],['中共二十大','二十大']]
];
function renderOutline(){return `<div class="outline-intro"><p>先看全貌，再逐段复习。</p><button class="quiet-button" data-all-events>查看全部事件 →</button></div><div class="outline-axis">${ERAS.map((era,i)=>`<section class="outline-stage"><div class="outline-period"><span>${esc(era.range)}</span><button data-outline-era="${i}">${esc(era.name)} <span aria-hidden="true">↗</span></button></div><div class="outline-body"><p>${esc(era.subtitle)}</p><div class="outline-events">${OUTLINE[i].map(([match,label])=>{const event=EVENTS.find(e=>e.era===i&&e.title.includes(match));return event?`<button class="outline-event" data-outline-event="${event.id}"><time>${esc(event.date)}</time><span>${esc(label)}</span></button>`:'';}).join('')}</div></div></section>`).join('')}</div>`;}
let toastTimer;
function toast(message){ $('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2000); }
function persist(){try{localStorage.setItem('history-timeline-progress-v1',JSON.stringify({saved:[...state.saved],learned:[...state.learned]}));}catch{toast('当前浏览器无法保存进度，标记在本次会话内有效。');}updateProgress();}
function updateProgress(){const n=state.learned.size,p=Math.round(n/EVENTS.length*100);$('#learnCount').textContent=n;$('#totalCount').textContent=EVENTS.length;$('#learnPercent').textContent=p+'%';$('#progressBar').style.width=p+'%';}
function sourceFor(e){return e.id===EVENTS.length-1?4:e.id===EVENTS.length-2?3:e.era===0?2:1;}
function sourceLink(e){const s=SOURCES[sourceFor(e)];return `<a class="event-source" href="${s[2]}" target="_blank" rel="noopener noreferrer" title="${esc(s[0])}">参考资料 ↗</a>`;}
function filtered(){const q=state.search.trim().toLocaleLowerCase();return EVENTS.filter(e=>(state.era===-1||e.era===state.era)&&(state.filter!=='key'||e.key)&&(state.filter!=='saved'||state.saved.has(e.id))&&(state.filter!=='unlearned'||!state.learned.has(e.id))&&(!q||[e.date,e.title,e.meaning,e.wrong,e.correct,...e.tags].join(' ').toLocaleLowerCase().includes(q)));}
function actions(e){return `<div class="event-actions"><button class="icon-button ${state.saved.has(e.id)?'active':''}" data-save="${e.id}" aria-label="${state.saved.has(e.id)?'移出待复习':'加入待复习'}：${esc(e.title)}" aria-pressed="${state.saved.has(e.id)}" title="${state.saved.has(e.id)?'移出待复习':'加入待复习'}">${state.saved.has(e.id)?'★':'☆'}</button><button class="icon-button ${state.learned.has(e.id)?'active':''}" data-learn="${e.id}" aria-label="${state.learned.has(e.id)?'取消已掌握':'标记已掌握'}：${esc(e.title)}" aria-pressed="${state.learned.has(e.id)}" title="${state.learned.has(e.id)?'已掌握，点击取消':'标记已掌握'}">${state.learned.has(e.id)?'●':'○'}</button></div>`;}
function eventCard(e){return `<article class="event ${e.key?'key':''}" id="event-${e.id}"><div class="event-top"><time class="date">${esc(e.date)}</time>${actions(e)}</div><h4>${esc(e.title)}</h4><p class="meaning">${esc(e.meaning)}</p>${state.traps?`<div class="trap-block"><p class="wrong"><strong>易错</strong>${esc(e.wrong)}</p><p class="correct"><strong>辨析</strong>${esc(e.correct)}</p></div>`:''}</article>`;}
function trapCard(e){return `<article class="trap-card"><div class="card-meta"><span>${esc(e.date)}</span><span>·</span><span>${ERAS[e.era].name}</span>${actions(e)}</div><h3>${esc(e.title)}</h3><div class="wrong-box"><b>× 易错说法</b>${esc(e.wrong)}</div><details><summary>展开正确辨析</summary><p>${esc(e.correct)}</p><p>${sourceLink(e)}</p></details></article>`;}
function empty(){return `<div class="empty"><h3>${state.filter==='saved'?'把想再看一遍的节点，留在这里。':'没有符合条件的节点'}</h3><p>${state.filter==='saved'?'点击事件卡片右上角的 ☆，加入你的待复习清单。':'试试其他关键词，或调整阶段和筛选条件。'}</p><button data-reset>查看全部节点</button></div>`;}
function updateNav(){const nav=[{name:'首页大纲'},...ERAS];$('#eraNav').innerHTML=nav.map((e,i)=>`<button class="era-button ${(i===0?state.view==='outline':state.view!=='outline'&&state.era===i-1)?'active':''}" data-era="${i-1}" ${(i===0?state.view==='outline':state.view!=='outline'&&state.era===i-1)?'aria-current="true"':''}>${e.name}</button>`).join('');}
function render(){updateNav();updateProgress();const list=filtered();$('#resultCount').textContent=`${list.length} 个事件`;
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===state.view);b.setAttribute('aria-selected',String(b.dataset.view===state.view));});
  for(const [id,name] of [['filterAll','all'],['filterKey','key'],['filterSaved','saved'],['filterUnlearned','unlearned']])$('#'+id).classList.toggle('active',state.filter===name);
  $('.filter-row').hidden=state.view==='outline';
  $('.trap-toggle').style.visibility=state.view==='timeline'?'visible':'hidden';
  $('#sectionTitle').textContent=state.view==='outline'?'历史脉络':state.era===-1?({timeline:'全部阶段',traps:'易错辨析',quiz:'判断自测'}[state.view]):ERAS[state.era].name;
  if(state.view==='outline'){$('#resultCount').textContent='1840 — 至今';$('#content').innerHTML=renderOutline();return;}
  if(!list.length){$('#content').innerHTML=empty();return;}
  if(state.view==='quiz'){if(!quiz)startQuiz(list);renderQuiz();return;}
  if(state.view==='traps'){$('#content').innerHTML=list.map(trapCard).join('');return;}
  $('#content').innerHTML=ERAS.map((era,i)=>{const group=list.filter(e=>e.era===i);return group.length?`<section class="era-section"><div class="era-heading"><h3>${era.name}</h3><span>${era.range}</span></div><div class="timeline">${group.map(eventCard).join('')}</div></section>`:'';}).join('');
}
function startQuiz(list){const pool=[...list];for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}quiz={items:pool.slice(0,10).map(e=>({event:e,truth:Math.random()>.5})),index:0,answers:[]};}
function renderQuiz(){const {items,index,answers}=quiz;const hits=answers.filter(a=>a.correct).length;
  if(index>=items.length){$('#content').innerHTML=`<div class="quiz-end"><h2>本轮完成</h2><strong>${hits}<span style="font-size:24px;color:#657761"> / ${items.length}</span></strong><p>错题已加入待复习。</p><button class="next-button" data-restart>再练一轮</button><button class="quiz-reset" data-review>查看待复习 →</button></div>`;return;}
  const q=items[index],e=q.event,a=answers[index];$('#content').innerHTML=`<div class="quiz-intro"><h3>先判断，再看解释。</h3><p>按当前阶段和筛选结果随机抽取最多10题。本站编写的判断练习，答错自动加入待复习。</p><div class="quiz-stats"><span>进度 ${index+1} / ${items.length}</span><span>已答 ${answers.length} 题</span><span>答对 ${hits} 题</span></div></div><article class="question"><small>${ERAS[e.era].name} · ${esc(e.title)}</small><h3>${esc(q.truth?e.meaning:e.wrong)}</h3><div class="answer-options"><button data-answer="true" ${a?'disabled':''} class="${a&&a.value===true?(a.correct?'chosen':'incorrect'):''}">✓ 正确</button><button data-answer="false" ${a?'disabled':''} class="${a&&a.value===false?(a.correct?'chosen':'incorrect'):''}">× 错误</button></div>${a?`<div class="feedback ${a.correct?'':'bad'}" role="status"><b>${a.correct?'判断正确':'再辨析一次'} · 本题说法${q.truth?'正确':'错误'}</b>${esc(q.truth?e.meaning:e.correct)}<br><span style="font-size:10px">时间定位：${esc(e.date)}</span></div><button class="next-button" data-next>${index===items.length-1?'查看本轮结果':'下一题 →'}</button>`:''}<button class="quiz-reset" data-restart>重新抽题</button></article>`;
}
function openStage(era,eventId){state.era=era;state.view='timeline';state.filter='all';state.search='';$('#searchInput').value='';quiz=null;render();const target=eventId===undefined?$('.workspace'):$('#event-'+eventId);target?.scrollIntoView({behavior:'smooth',block:'start'});if(eventId!==undefined){target.classList.add('event-highlight');target.tabIndex=-1;target.focus({preventScroll:true});}}
$('#eraNav').addEventListener('click',e=>{const b=e.target.closest('[data-era]');if(!b)return;const era=Number(b.dataset.era);if(era===-1){state.era=-1;state.view='outline';state.search='';$('#searchInput').value='';quiz=null;render();window.scrollTo({top:0,behavior:'smooth'});}else openStage(era);});
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;state.view=b.dataset.view;quiz=null;render();});
for(const [id,name] of [['filterAll','all'],['filterKey','key'],['filterSaved','saved'],['filterUnlearned','unlearned']])$('#'+id).addEventListener('click',()=>{state.filter=name;quiz=null;render();});
$('#searchInput').addEventListener('input',e=>{state.search=e.target.value;if(state.view==='outline'&&state.search.trim()){state.view='timeline';state.era=-1;state.filter='all';}quiz=null;render();});
$('#showTraps').addEventListener('change',e=>{state.traps=e.target.checked;render();});
$('#content').addEventListener('click',e=>{const stage=e.target.closest('[data-outline-era]'),node=e.target.closest('[data-outline-event]');if(stage){openStage(Number(stage.dataset.outlineEra));return;}if(node){const event=EVENTS.find(item=>item.id===Number(node.dataset.outlineEvent));if(event)openStage(event.era,event.id);return;}if(e.target.closest('[data-all-events]')){openStage(-1);return;}const save=e.target.closest('[data-save]'),learn=e.target.closest('[data-learn]');if(save||learn){const id=Number((save||learn).dataset[save?'save':'learn']),set=save?state.saved:state.learned;const had=set.has(id);had?set.delete(id):set.add(id);persist();render();toast(save?(had?'已移出待复习':'已加入待复习'):(had?'已取消掌握标记':'已标记为掌握'));return;}
 if(e.target.closest('[data-reset]')){state.era=-1;state.filter='all';state.search='';$('#searchInput').value='';quiz=null;render();return;}
 const answer=e.target.closest('[data-answer]');if(answer&&quiz&&!quiz.answers[quiz.index]){const value=answer.dataset.answer==='true',q=quiz.items[quiz.index],correct=value===q.truth;quiz.answers.push({value,correct});if(!correct){state.saved.add(q.event.id);persist();}renderQuiz();return;}
 if(e.target.closest('[data-next]')&&quiz){quiz.index++;renderQuiz();return;}
 if(e.target.closest('[data-restart]')){quiz=null;render();return;}
 if(e.target.closest('[data-review]')){state.view='timeline';state.filter='saved';state.era=-1;state.search='';$('#searchInput').value='';quiz=null;render();}
});
$('#sourceList').innerHTML=SOURCES.map((s,i)=>`<div class="source-item"><a href="${s[2]}" target="_blank" rel="noopener noreferrer">0${i+1} · ${esc(s[0])} ↗</a><p>${esc(s[1])}</p></div>`).join('');
$('#sourcesButton').addEventListener('click',()=>$('#sourceDialog').showModal());
$('#closeSources').addEventListener('click',()=>$('#sourceDialog').close());
$('#sourceDialog').addEventListener('click',e=>{if(e.target===$('#sourceDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('.brand').addEventListener('click',e=>{e.preventDefault();state.era=-1;state.view='outline';state.search='';$('#searchInput').value='';quiz=null;render();window.scrollTo({top:0,behavior:'smooth'});});
$('#printButton').addEventListener('click',()=>{if(!['timeline','outline'].includes(state.view)){state.view='timeline';render();}window.print();});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!$('#sourceDialog').open){e.preventDefault();$('#searchInput').focus();}});
render();
