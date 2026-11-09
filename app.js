'use strict';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const dateFrom=s=>new Date(`${s}T12:00:00`);
const today=iso(new Date());
const plusDays=(d,n)=>{const x=dateFrom(d);x.setDate(x.getDate()+n);return iso(x)};
const escapeHTML=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate=s=>dateFrom(s).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});
const weekday=s=>dateFrom(s).toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const example={tasks:[{id:'t1',name:'Revisar limites e derivadas',course:'Cálculo I',due:plusDays(today,1),priority:'Alta',done:false},{id:'t2',name:'Finalizar lista de algoritmos',course:'Algoritmos',due:plusDays(today,3),priority:'Média',done:false},{id:'t3',name:'Ler capítulo de banco de dados',course:'Banco de Dados',due:plusDays(today,4),priority:'Baixa',done:false},{id:'t4',name:'Separar materiais da semana',course:'Organização',due:plusDays(today,-1),priority:'Média',done:true}],sessions:[{id:'s1',subject:'Cálculo I',date:today,start:'19:00',end:'20:30'},{id:'s2',subject:'Algoritmos',date:plusDays(today,1),start:'18:30',end:'20:00'},{id:'s3',subject:'Banco de Dados',date:plusDays(today,3),start:'14:00',end:'15:00'}]};
let state;
try{const raw=JSON.parse(localStorage.getItem('studyflow-v1'));state=raw&&Array.isArray(raw.tasks)&&Array.isArray(raw.sessions)?raw:structuredClone(example)}catch{state=structuredClone(example)}
let weekOffset=0;
const save=()=>{try{localStorage.setItem('studyflow-v1',JSON.stringify(state));return true}catch(err){console.error('Falha ao salvar dados:',err);toast('Não foi possível salvar: verifique o espaço do navegador');return false}};
// Feedback visual: o mascote aparece em confirmações, nunca em mensagens de erro.
const toast=(msg,kind)=>{
  const el=$('#toast'); if(!el)return;
  const message=String(msg);
  const isError=/não foi|erro|inválid|indisponível|precisa|cadastre pelo menos|revise|nenhum|selecione|tente|fim precisa/i.test(message);
  const isSuccess=kind==='celebrate'||kind==='success'||(kind!=='error'&&!isError&&/salv|cadastrad|adicionad|concluíd|atualizad|excluíd|recebid|gerad|foto|sessões propostas/i.test(message));
  el.classList.toggle('toast-success',isSuccess);
  el.classList.toggle('toast-error',!isSuccess);
  el.replaceChildren();
  if(isSuccess){const img=document.createElement('img');const celebrating=kind==='celebrate';const isProfile=/perfil|foto/i.test(message);img.src=celebrating?'gatinho-comemorando.png':isProfile?'gatinho-joinha.png':'gatinho-feliz.png';img.alt=celebrating?'Gatinho comemorando':isProfile?'Gatinho dando joinha':'Gatinho feliz';img.className='toast-mascot';el.append(img)}
  const body=document.createElement('span');body.className='toast-text';body.textContent=message;el.append(body);
  const close=document.createElement('button');close.type='button';close.className='toast-close';close.textContent='×';close.setAttribute('aria-label','Fechar aviso');close.onclick=()=>{el.style.display='none'};el.append(close);
  el.style.display='flex';clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.style.display='none',4200);
};
function navigate(page){$$('.page').forEach(el=>el.classList.toggle('active',el.id===page));$$('.nav').forEach(el=>el.classList.toggle('active',el.dataset.page===page));$('#heading').textContent={dashboard:'Seu espaço de estudos',planner:'Planejamento semanal',tasks:'Atividades e entregas',advisor:'Aprenda com orientação',settings:'Personalize o StudyFlow',profile:'Seu perfil acadêmico',assessment:'Avaliação de usabilidade'}[page];$('#newTaskTop').hidden=true;if(page==='profile'){try{loadProfile();showProfileScreen()}catch(err){console.error('Erro ao abrir perfil:',err);toast('Não foi possível carregar todos os campos do perfil')}}render();}
$$('.nav').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
$('#openMyProfile').addEventListener('click',()=>navigate('profile'));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
$('#todayLabel').textContent=new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'});
function render(){renderDashboard();renderTasks();renderCalendar()}
function renderDashboard(){const done=state.tasks.filter(t=>t.done).length,pending=state.tasks.length-done,minutes=state.sessions.reduce((sum,s)=>sum+duration(s),0);const values=[['◷','Horas planejadas',(minutes/60).toLocaleString('pt-BR',{maximumFractionDigits:1})+'h','Sessões registradas'],['☑','Atividades pendentes',pending,'Para organizar'],['✧','Progresso',state.tasks.length?Math.round(done/state.tasks.length*100)+'%':'0%','Atividades concluídas']];$('#stats').innerHTML=values.map(a=>`<div class="stat"><span class="symbol">${a[0]}</span><div class="metric">${a[2]}</div><strong style="font-size:12px">${a[1]}</strong><div class="minor">${a[3]}</div></div>`).join('');const upcoming=state.tasks.filter(t=>!t.done).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4);$('#nextTasks').innerHTML=upcoming.length?upcoming.map(t=>`<div class="task-line"><input class="tick" type="checkbox" data-check="${escapeHTML(t.id)}" aria-label="Concluir ${escapeHTML(t.name)}"><div class="task-info"><strong>${escapeHTML(t.name)}</strong><small>${escapeHTML(t.course)} · ${formatDate(t.due)}</small></div><span class="tag ${escapeHTML(t.priority)}">${escapeHTML(t.priority)}</span></div>`).join(''):'<div class="noitems cat-empty"><img src="gatinho-pensativo.png" alt="Gatinho pensativo"><span>Nenhuma atividade pendente. Aproveite para planejar seus próximos estudos!</span></div>';const days=Array.from({length:7},(_,i)=>plusDays(today,i));const hours=days.map(d=>state.sessions.filter(s=>s.date===d).reduce((x,s)=>x+duration(s),0)/60);const max=Math.max(...hours,1);$('#weekBars').innerHTML=days.map((d,i)=>`<div class="bar-wrap"><div class="bar"><span style="height:${Math.max(3,hours[i]/max*100)}%"></span></div>${weekday(d)}</div>`).join('');$('#weeklyHours').textContent=`${hours.reduce((a,b)=>a+b,0).toLocaleString('pt-BR',{maximumFractionDigits:1})} horas planejadas nos próximos 7 dias`;}
function duration(s){const [h,m]=s.start.split(':').map(Number),[eh,em]=s.end.split(':').map(Number);return Math.max(0,(eh*60+em)-(h*60+m))}
function renderTasks(){const filter=$('#taskFilter').value;const data=state.tasks.filter(t=>filter==='all'||(filter==='done'?t.done:!t.done)).sort((a,b)=>Number(a.done)-Number(b.done)||a.due.localeCompare(b.due));$('#taskCounter').textContent=`${data.length} registro(s)`;$('#taskList').innerHTML=data.length?data.map(t=>`<div class="task-line ${t.done?'done':''}"><input type="checkbox" class="tick" ${t.done?'checked':''} data-check="${escapeHTML(t.id)}" aria-label="Marcar ${escapeHTML(t.name)}"><div class="task-info"><strong>${escapeHTML(t.name)}</strong><small>${escapeHTML(t.course)} · Entrega ${formatDate(t.due)}</small></div><span class="tag ${escapeHTML(t.priority)}">${escapeHTML(t.priority)}</span><div class="task-tools"><button aria-label="Editar" data-edit-task="${escapeHTML(t.id)}">Editar</button><button aria-label="Excluir" data-delete-task="${escapeHTML(t.id)}">Excluir</button></div></div>`).join(''):'<div class="noitems cat-empty"><img src="gatinho-pensativo.png" alt="Gatinho pensativo"><span>Nenhuma atividade para este filtro.</span></div>'}
function monday(d){const x=dateFrom(d);x.setDate(x.getDate()-(x.getDay()+6)%7);return iso(x)}
function renderManagedSessions(){const container=$('#managedSessions');if(!container)return;const data=[...state.sessions].sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start));container.innerHTML=data.length?data.map(s=>`<div class="managed-session"><div><strong>${escapeHTML(s.subject)}</strong><small>${formatDate(s.date)} · ${escapeHTML(s.start)}–${escapeHTML(s.end)}</small></div><div class="managed-actions"><button type="button" class="btn ghost" data-edit-session="${escapeHTML(s.id)}">Editar</button><button type="button" class="btn ghost" data-delete-session="${escapeHTML(s.id)}">Excluir</button></div></div>`).join(''):'<p class="minor">Nenhuma sessão agendada. Use o planejamento abaixo ou clique em “Agendar estudo”.</p>'}
function renderCalendar(){const start=plusDays(monday(today),weekOffset*7),end=plusDays(start,6);$('#weekTitle').textContent=`${formatDate(start)} — ${formatDate(end)}`;$('#calendar').innerHTML=Array.from({length:7},(_,i)=>{const date=plusDays(start,i),sessions=state.sessions.filter(s=>s.date===date).sort((a,b)=>a.start.localeCompare(b.start)),tasks=state.tasks.filter(t=>t.due===date&&!t.done);return `<div class="calday ${date===today?'today':''}"><div class="caldate">${weekday(date)}<span>${formatDate(date)}</span></div>${sessions.map(s=>`<div class="event"><b>${escapeHTML(s.subject)}</b><small>${escapeHTML(s.start)}–${escapeHTML(s.end)}</small></div>`).join('')}${tasks.map(t=>`<div class="event due"><b>${escapeHTML(t.name)}</b><small>Entrega · ${escapeHTML(t.course)}</small></div>`).join('')}</div>`}).join('');renderManagedSessions()}
function openTask(id){$('#taskForm').reset();$('#taskId').value='';$('#taskDue').value=today;$('#taskDialogTitle').textContent='Nova atividade';if(id){const t=state.tasks.find(x=>x.id===id);if(!t)return;$('#taskId').value=t.id;$('#taskName').value=t.name;$('#taskCourse').value=t.course;$('#taskDue').value=t.due;$('#taskPriority').value=t.priority;$('#taskDialogTitle').textContent='Editar atividade'}$('#taskDialog').showModal()}
function openSession(id){$('#sessionForm').reset();$('#sessionId').value='';$('#sessionDate').value=today;$('#sessionStart').value='19:00';$('#sessionEnd').value='20:30';$('#sessionDialogTitle').textContent='Agendar estudo';if(id){const s=state.sessions.find(x=>x.id===id);if(!s)return;$('#sessionId').value=s.id;$('#sessionSubject').value=s.subject;$('#sessionDate').value=s.date;$('#sessionStart').value=s.start;$('#sessionEnd').value=s.end;$('#sessionDialogTitle').textContent='Editar sessão'}$('#sessionDialog').showModal()}
$('#newTaskTop').onclick=()=>openTask();$('#addTask').onclick=()=>openTask();$('#addSession').onclick=()=>openSession();$('#addSessionFromTasks').onclick=()=>openSession();$('#addSessionQuick').onclick=()=>openSession();$('#manageSessionsShortcut').onclick=()=>{navigate('tasks');requestAnimationFrame(()=>$('#sessionsManagement').scrollIntoView({behavior:'smooth',block:'start'}));};$$('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());$('#taskFilter').onchange=renderTasks;$('#prevWeek').onclick=()=>{weekOffset--;renderCalendar()};$('#nextWeek').onclick=()=>{weekOffset++;renderCalendar()};$('#currentWeek').onclick=()=>{weekOffset=0;renderCalendar()};
// A confirmação é feita somente uma vez por abertura da janela.
// A janela fecha ANTES da renderização para que erros de UI não deixem o botão ativo.
const submissionLock = {task:false,session:false};
function finishDialog(kind, dialogId, formId, label){
  submissionLock[kind]=true;
  const form=$(formId), button=form.querySelector('button[type="submit"]');
  if(button)button.disabled=true;
  const dialog=$(dialogId);
  if(dialog.open)dialog.close();
  form.reset();
  try{save();render();toast(label)}catch(err){console.error('Falha ao atualizar interface:',err);toast('Registro salvo; atualize a página se necessário')}
}
$('#taskDialog').addEventListener('close',()=>{submissionLock.task=false;const b=$('#taskForm button[type="submit"]');if(b)b.disabled=false});
$('#sessionDialog').addEventListener('close',()=>{submissionLock.session=false;const b=$('#sessionForm button[type="submit"]');if(b)b.disabled=false});
$('#taskForm').onsubmit=e=>{
  e.preventDefault();
  if(submissionLock.task||!$('#taskDialog').open)return;
  const id=$('#taskId').value,old=state.tasks.find(t=>t.id===id);
  const item={id:id||uid(),name:$('#taskName').value.trim(),course:$('#taskCourse').value.trim(),due:$('#taskDue').value,priority:$('#taskPriority').value,done:old?.done||false};
  if(!item.name||!item.course||!item.due)return;
  submissionLock.task=true;
  if(old)Object.assign(old,item);else state.tasks.push(item);
  finishDialog('task','#taskDialog','#taskForm',id?'Atividade atualizada':'Atividade cadastrada');
};
$('#sessionForm').onsubmit=e=>{
  e.preventDefault();
  if(submissionLock.session||!$('#sessionDialog').open)return;
  const id=$('#sessionId').value,old=state.sessions.find(s=>s.id===id);
  const item={id:id||uid(),subject:$('#sessionSubject').value.trim(),date:$('#sessionDate').value,start:$('#sessionStart').value,end:$('#sessionEnd').value};
  if(!item.subject||!item.date||!item.start||!item.end)return;
  if(item.end<=item.start)return toast('O fim precisa ser depois do início');
  submissionLock.session=true;
  if(old)Object.assign(old,item);else state.sessions.push(item);
  finishDialog('session','#sessionDialog','#sessionForm',id?'Sessão atualizada':'Sessão cadastrada');
};
document.addEventListener('change',e=>{if(e.target.matches('[data-check]')){const t=state.tasks.find(x=>x.id===e.target.dataset.check);if(t){const wasDone=t.done;t.done=e.target.checked;if(save()){render();if(t.done&&!wasDone)toast(state.tasks.length>0&&state.tasks.every(x=>x.done)?'Parabéns! Todas as atividades foram concluídas! 🎉':'Muito bem! Atividade concluída! 💙',state.tasks.length>0&&state.tasks.every(x=>x.done)?'celebrate':'success');else if(wasDone&&!t.done)toast('Atividade voltou para pendentes.')}else{t.done=wasDone;render()}}}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.editTask)openTask(b.dataset.editTask);if(b.dataset.editSession)openSession(b.dataset.editSession);if(b.dataset.deleteTask&&confirm('Excluir esta atividade?')){state.tasks=state.tasks.filter(t=>t.id!==b.dataset.deleteTask);save();render();toast('Atividade excluída')}if(b.dataset.deleteSession&&confirm('Excluir esta sessão?')){state.sessions=state.sessions.filter(s=>s.id!==b.dataset.deleteSession);save();render();toast('Sessão excluída')}});
function demoPlan(subject,goal){const q=encodeURIComponent(subject);return `<p><b>Plano demonstrativo para:</b> ${escapeHTML(subject)}</p><p><b>Objetivo:</b> ${escapeHTML(goal)}</p><ol><li>Identifique conceitos fundamentais e requisitos prévios do assunto.</li><li>Reserve 25 minutos para leitura e anotações, seguidos de 5 minutos de pausa.</li><li>Resolva exercícios e registre dúvidas específicas.</li><li>Revise os erros e faça uma síntese de 5 linhas.</li></ol><p><b>Onde buscar materiais:</b></p><ul><li><a href="https://scholar.google.com.br/scholar?q=${q}" target="_blank" rel="noopener noreferrer">Pesquisar o tema no Google Acadêmico ↗</a></li><li><a href="https://www.scielo.br/" target="_blank" rel="noopener noreferrer">Consultar artigos na SciELO ↗</a></li><li><a href="https://educapes.capes.gov.br/" target="_blank" rel="noopener noreferrer">Consultar recursos no eduCAPES ↗</a></li></ul><p class="minor">Estes são links de busca e portais, não artigos verificados ou recomendações personalizadas por IA.</p>`}
$('#advisorForm').onsubmit=async e=>{e.preventDefault();const subject=$('#subject').value.trim(),goal=$('#goal').value.trim();if(!subject||!goal)return;const btn=$('#adviceBtn');btn.disabled=true;btn.textContent='Preparando orientação...';try{const res=await fetch('/api/recommend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject,goal,course:state.profile?.course||'',semester:state.profile?.semester||1,subjects:state.profile?.subjects||[]})});if(!res.ok){const detail=await res.json().catch(()=>({}));throw Error(detail.error||'Não foi possível contatar o assistente.');}const data=await res.json();$('#adviceResult').innerHTML=`<p style="white-space:pre-wrap">${escapeHTML(data.text)}</p><p class="minor">A IA não verifica automaticamente os artigos citados. Confira as fontes nos portais abaixo.</p>`;if(Array.isArray(data.sources)&&data.sources.length){$('#adviceResult').innerHTML+='<h4>Publicações localizadas no Crossref (verifique antes de usar)</h4>'+data.sources.map(x=>`<p><strong>${escapeHTML(x.title)}</strong> (${escapeHTML(x.year||'s.d.')}) — <a href="${escapeHTML(x.doi)}" target="_blank" rel="noopener noreferrer">Abrir DOI ↗</a></p>`).join('')}$('#adviceStatus').textContent='Orientação gerada via API';$('#aiBadge').textContent='IA conectada'}catch(err){$('#adviceResult').innerHTML='<p role="alert">'+escapeHTML(err.message||'Falha na conexão com a IA.')+'</p><p class="minor">A orientação não foi gerada. Confira a conexão e tente novamente.</p>';$('#adviceStatus').textContent='Não foi possível gerar orientação';$('#aiBadge').textContent='IA indisponível'}finally{btn.disabled=false;btn.textContent='✧ Gerar orientação'}};
// A primeira renderização ocorre após inicializar perfil e avaliações.

// Aparência fixa para manter consistência da avaliação de UX.
const design={theme:'violet'};
// V3: cadastro de perfil e planejamento semanal com disponibilidade explícita.
const weekdays=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const blankAvail=()=>Array.from({length:7},(_,i)=>({start:i<5?'19:00':'',end:i<5?'21:00':''}));
function validateProfile(p){if(!p||typeof p!=='object'||Array.isArray(p))p={};const arr=Array.isArray(p.availability)?p.availability.slice(0,7):blankAvail();return {name:String(p.name||'').slice(0,70),institution:String(p.institution||'').slice(0,120),photo:typeof p.photo==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(p.photo)&&p.photo.length<230000?p.photo:'',course:String(p.course||'').slice(0,90),semester:Math.max(1,Math.min(20,Number(p.semester)||1)),subjects:(Array.isArray(p.subjects)?p.subjects:[]).slice(0,30).map(x=>String(x).slice(0,70)),availability:Array.from({length:7},(_,i)=>({start:/^\d{2}:\d{2}$/.test(arr[i]?.start||'')?arr[i].start:'',end:/^\d{2}:\d{2}$/.test(arr[i]?.end||'')?arr[i].end:''})),slot:[30,60,90,120].includes(Number(p.slot))?Number(p.slot):60,weeks:[1,2,4].includes(Number(p.weeks))?Number(p.weeks):2}}
function validateUX(u){return Array.isArray(u)?u.slice(0,500).map(x=>({task:String(x.task||'').slice(0,50),ease:Number(x.ease)||1,clarity:Number(x.clarity)||1,feedback:Number(x.feedback)||1,comment:String(x.comment||'').slice(0,700),at:String(x.at||'').slice(0,40)})):[]}
state.profile=validateProfile(state.profile);state.ux=validateUX(state.ux);
// Planejamento pertence à página Cronograma, não ao formulário do perfil.
const planHost=$('#studyPlanArea');
const availabilityPanel=$('#availabilityFields').closest('.panel');
const proposalPanel=$('#proposedSessions').closest('.panel');
planHost.append(availabilityPanel,proposalPanel);
$('#availabilityFields').innerHTML=weekdays.map((d,i)=>`<div class="availability-line"><strong>${d}</strong><div><label for="avstart${i}">De</label><input type="time" id="avstart${i}"></div><div><label for="avend${i}">Até</label><input type="time" id="avend${i}"></div></div>`).join('');
function loadProfile(){const p=validateProfile(state.profile);$('#studentName').value=p.name;$('#studentInstitution').value=p.institution;updatePhotoPreview(p.photo);$('#studentCourse').value=p.course;$('#studentSemester').value=p.semester;$('#studentSubjects').value=p.subjects.join('\n');$('#slotMinutes').value=p.slot;$('#planningWeeks').value=p.weeks;p.availability.forEach((v,i)=>{$('#avstart'+i).value=v.start;$('#avend'+i).value=v.end});setProfileBadge()}
function setProfileBadge(){const name=state.profile?.name||'Estudante';$('.profile strong').textContent=name;$('.profile .avatar').textContent='';if(state.profile?.photo){const img=document.createElement('img');img.src=state.profile.photo;img.alt='Foto de perfil';img.className='profile-avatar-img';$('.profile .avatar').append(img)}else{$('.profile .avatar').textContent=name.charAt(0).toUpperCase()}$('.profile small').textContent=state.profile?.institution||state.profile?.course||'Universitário(a)';const box=$('#savedProfileSummary');if(box){const p=state.profile||{};box.innerHTML=p.name||p.course||p.institution?`<strong>Perfil registrado neste navegador</strong><p><b>Nome:</b> ${escapeHTML(p.name||'Não informado')}</p><p><b>Instituição:</b> ${escapeHTML(p.institution||'Não informada')}</p><p><b>Curso:</b> ${escapeHTML(p.course||'Não informado')} · <b>Semestre:</b> ${escapeHTML(p.semester||'—')}</p><p><b>Disciplinas:</b> ${escapeHTML((p.subjects||[]).join(', ')||'Nenhuma cadastrada')}</p>`:'<p>Preencha os campos e clique em Salvar meu perfil.</p>'}}
function hasAcademicProfile(){const p=validateProfile(state.profile);return Boolean(p.name||p.institution||p.course||p.subjects.length)}
function renderProfileDisplay(){
 const p=validateProfile(state.profile);
 $('#profileDisplayName').textContent=p.name||'Estudante';
 $('#profileDisplayInstitution').textContent=p.institution||'Universidade / faculdade não informada';
 $('#profileDisplayCourse').textContent=p.course||'Não informado';
 $('#profileDisplaySemester').textContent=p.semester+'º semestre';
 $('#profileDisplaySlot').textContent=p.slot+' minutos';
 $('#profileDisplayWeeks').textContent=p.weeks+' semana(s)';
 const avatar=$('#profileDisplayAvatar');avatar.textContent='';if(p.photo){const img=document.createElement('img');img.alt='';img.src=p.photo;avatar.append(img)}else avatar.textContent=(p.name||'U').charAt(0).toUpperCase();
 $('#profileDisplaySubjects').innerHTML=p.subjects.length?p.subjects.map(s=>'<span class="profile-subject-chip">'+escapeHTML(s)+'</span>').join(''):'<p class="minor">Nenhuma disciplina cadastrada.</p>';
 const days=p.availability.map((v,i)=>v.start?'<div class="profile-availability-row"><strong>'+weekdays[i]+'</strong><span>'+escapeHTML(v.start)+' – '+escapeHTML(v.end)+'</span></div>':'').filter(Boolean);
 $('#profileDisplayAvailability').innerHTML=days.length?days.join(''):'<p class="minor">Nenhum horário cadastrado.</p>';
}
function showProfileScreen(forceEdit=false){const edit=forceEdit||!hasAcademicProfile();$('#profileView').hidden=edit;$('#profileEditor').hidden=!edit;if(!edit)renderProfileDisplay();}
$('#editMyProfile').addEventListener('click',()=>{loadProfile();showProfileScreen(true)});
$('#backToProfile').addEventListener('click',()=>showProfileScreen());
$('#deleteMyProfile').addEventListener('click',()=>{
 if(!hasAcademicProfile()){toast('Nenhum perfil cadastrado para excluir.');return;}
 const ok=confirm('Excluir o perfil acadêmico e a foto salvos neste navegador?\n\nSuas atividades, sessões de estudo e avaliações serão mantidas. Esta ação não pode ser desfeita.');
 if(!ok)return;
 const previous=state.profile;
 state.profile=validateProfile(null);
 if(!save()){state.profile=previous;toast('Não foi possível excluir o perfil.');return;}
 proposed=[];
 $('#studentPhoto').value='';
 $('#profileSaveStatus').textContent='';
 $('#generationStatus').textContent='';
 $('#confirmSchedule').disabled=true;
 renderProposed();
 loadProfile();showProfileScreen(true);
 toast('Perfil excluído. Você pode cadastrar um novo perfil.');
});
function collectProfile(){const subjects=[...new Set($('#studentSubjects').value.split('\n').map(s=>s.trim()).filter(Boolean))].slice(0,30);const availability=weekdays.map((_,i)=>({start:$('#avstart'+i).value,end:$('#avend'+i).value}));for(const a of availability){if(Boolean(a.start)!==Boolean(a.end))throw Error('Preencha início e fim em cada dia escolhido.');if(a.start&&a.end<=a.start)throw Error('O horário final deve ser posterior ao inicial.')}return validateProfile({name:$('#studentName').value.trim(),institution:$('#studentInstitution').value.trim(),photo:state.profile?.photo||'',course:$('#studentCourse').value.trim(),semester:$('#studentSemester').value,subjects,availability,slot:$('#slotMinutes').value,weeks:$('#planningWeeks').value})}
function updatePhotoPreview(photo){const holder=$('#photoPreview');holder.textContent='';if(photo){const img=document.createElement('img');img.src=photo;img.alt='Prévia da foto';img.className='photo-preview-img';holder.append(img)}else holder.textContent='Nenhuma foto selecionada'}
$('#studentPhoto').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4*1024*1024){toast('Use JPG, PNG ou WebP até 4 MB');e.target.value='';return}try{const img=await createImageBitmap(file);const can=document.createElement('canvas');can.width=160;can.height=160;const ctx=can.getContext('2d');const ratio=Math.max(160/img.width,160/img.height);ctx.drawImage(img,(160-img.width*ratio)/2,(160-img.height*ratio)/2,img.width*ratio,img.height*ratio);const previousPhoto=state.profile.photo;state.profile.photo=can.toDataURL('image/jpeg',0.65);img.close();if(!save()){state.profile.photo=previousPhoto;throw Error('Sem espaço para salvar a foto')}updatePhotoPreview(state.profile.photo);setProfileBadge();toast('Foto salva neste navegador')}catch{toast('Não foi possível ler esta imagem')}});
$('#removePhoto').onclick=()=>{state.profile.photo='';$('#studentPhoto').value='';save();updatePhotoPreview('');setProfileBadge()};
$('#profileForm').onsubmit=e=>{e.preventDefault();try{const previous=state.profile;state.profile=collectProfile();if(!save()){state.profile=previous;throw Error('Armazenamento indisponível. Tente abrir o site em uma aba normal do navegador.')}setProfileBadge();showProfileScreen();$('#profileSaveStatus').textContent='✓ Perfil salvo neste navegador. Seus dados permanecerão após atualizar a página.';toast('Perfil salvo com sucesso!')}catch(err){$('#profileSaveStatus').textContent='Não foi possível salvar: '+err.message;toast(err.message)}};
let proposed=[];
function minTime(t){const [h,m]=t.split(':').map(Number);return h*60+m}
function timeString(n){return pad(Math.floor(n/60))+':'+pad(n%60)}
function overlaps(start,end,otherStart,otherEnd){return start<otherEnd&&end>otherStart}
$('#generateSchedule').onclick=()=>{try{const oldProfile=state.profile;state.profile=collectProfile();if(!save()){state.profile=oldProfile;throw Error('Não foi possível salvar os horários.')}setProfileBadge();const p=state.profile;if(!p.subjects.length)throw Error('Cadastre pelo menos uma disciplina.');proposed=[];const start=monday(today);let k=0;for(let day=0;day<p.weeks*7;day++){const date=plusDays(start,day);if(date<today)continue;const wd=day%7,a=p.availability[wd];if(!a.start)continue;let cursor=minTime(a.start),finish=minTime(a.end),tries=0;while(cursor+p.slot<=finish&&tries<6){tries++;let subject=p.subjects[k%p.subjects.length];const urgent=state.tasks.filter(t=>!t.done&&t.due>=date&&t.due<=plusDays(date,3)&&p.subjects.some(s=>s.toLowerCase()===t.course.toLowerCase())).sort((x,y)=>x.due.localeCompare(y.due));if(urgent.length&&k%2===0)subject=urgent[0].course;const end=cursor+p.slot;const busy=[...state.sessions,...proposed].some(s=>s.date===date&&overlaps(cursor,end,minTime(s.start),minTime(s.end)));if(!busy){proposed.push({id:uid(),subject,date,start:timeString(cursor),end:timeString(end)});k++}cursor=end+10;if(proposed.length>=80)break}if(proposed.length>=80)break}$('#generationStatus').textContent=proposed.length?`${proposed.length} sessões propostas, respeitando horários disponíveis e sessões existentes.`:'Nenhuma sessão disponível; revise os horários cadastrados.';$('#confirmSchedule').disabled=!proposed.length;renderProposed();if(proposed.length){$('#proposedSessions').scrollIntoView({behavior:'smooth',block:'center'});toast('Sugestões criadas. Confirme para salvar no calendário.','info')}}catch(err){toast(err.message)}};
function renderProposed(){$('#proposedSessions').innerHTML=proposed.length?proposed.map(s=>`<div class="proposal-line"><strong>${escapeHTML(s.subject)}</strong><span>${formatDate(s.date)} · ${s.start}–${s.end}</span></div>`).join(''):'<p class="minor">Nenhuma sessão sugerida.</p>'}
$('#confirmSchedule').onclick=()=>{
 if(!proposed.length)return;
 const pending=[...proposed];
 // Não permite confirmação repetida nem mensagens falsas de salvamento.
 $('#confirmSchedule').disabled=true;
 state.sessions.push(...pending);
 if(!save()){
   state.sessions.splice(state.sessions.length-pending.length,pending.length);
   $('#confirmSchedule').disabled=false;
   toast('Não foi possível salvar as sessões. Verifique o armazenamento.','error');
   return;
 }
 proposed=[];
 renderProposed();render();
 $('#generationStatus').textContent=`✓ ${pending.length} sessões salvas! Veja-as no calendário e na lista de sessões agendadas.`;
 // Vai para a semana da primeira sugestão salva.
 const first=pending.map(x=>x.date).sort()[0];
 weekOffset=Math.round((dateFrom(monday(first))-dateFrom(monday(today)))/(7*24*60*60*1000));
 renderCalendar();
 $('#calendar').scrollIntoView({behavior:'smooth',block:'start'});
 toast(`${pending.length} sessões salvas no cronograma!`,'success');
};
$('#discardSchedule').onclick=()=>{proposed=[];renderProposed();$('#confirmSchedule').disabled=true;$('#generationStatus').textContent='Prévia descartada'};
loadProfile();render();
