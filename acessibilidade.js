/* Configurações de leitura e navegação do StudyFlow. Sem dependência de API. */
(()=>{
 'use strict';
 const root=document.documentElement;
 const panel=document.getElementById('accessibilityPanel');
 const open=document.getElementById('openAccessibility');
 const close=document.getElementById('closeAccessibility');
 const contrast=document.getElementById('a11yContrast');
 const motion=document.getElementById('a11yMotion');
 const choices=[...document.querySelectorAll('[data-font]')];
 const key='studyflow-a11y-v23'; // Mantém preferências existentes da V23
 const defaults={font:'100',contrast:false,motion:false};
 let settings={...defaults};
 try{settings={...settings,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{}
 function persist(){try{localStorage.setItem(key,JSON.stringify(settings))}catch{}}
 function apply(){
  settings.font=['100','125','150'].includes(String(settings.font))?String(settings.font):'100';
  root.dataset.a11yFont=settings.font;
  root.dataset.a11yContrast=String(Boolean(settings.contrast));
  root.dataset.a11yMotion=settings.motion?'reduce':'normal';
  contrast.checked=Boolean(settings.contrast);motion.checked=Boolean(settings.motion);
  choices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.font===settings.font)));
 }
 function toggle(show){panel.hidden=!show;open.setAttribute('aria-expanded',String(show));if(show){panel.scrollTop=0;close.focus();}else open.focus();}
 open.addEventListener('click',()=>toggle(panel.hidden));close.addEventListener('click',()=>toggle(false));
 choices.forEach(b=>b.addEventListener('click',()=>{settings.font=b.dataset.font;apply();persist();}));
 contrast.addEventListener('change',()=>{settings.contrast=contrast.checked;apply();persist()});
 motion.addEventListener('change',()=>{settings.motion=motion.checked;apply();persist()});
 document.getElementById('resetAccessibility').addEventListener('click',()=>{settings={...defaults};apply();persist();const mode=document.getElementById('colorMode');if(mode){mode.value='auto';mode.dispatchEvent(new Event('change',{bubbles:true}));}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();toggle(false)}});
 document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!open.contains(e.target)){panel.hidden=true;open.setAttribute('aria-expanded','false')}});
 // Leitor de tela: identifica o item atual do menu.
 function currentPage(){document.querySelectorAll('.nav').forEach(b=>{if(b.classList.contains('active'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
 const nav=document.querySelector('nav');nav.addEventListener('click',()=>queueMicrotask(currentPage));currentPage();
 // O foco retorna ao comando que abriu a janela nativa, quando possível.
 for(const dialog of document.querySelectorAll('dialog')){
   dialog.addEventListener('close',()=>{const trigger=dialog._origin;if(trigger?.isConnected)trigger.focus({preventScroll:true})});
 }
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;for(const dialog of document.querySelectorAll('dialog')){if(dialog.open)continue;/* A origem é capturada na abertura, abaixo. */}},{capture:true});
 const original=HTMLDialogElement.prototype.showModal;
 HTMLDialogElement.prototype.showModal=function(...args){this._origin=document.activeElement;return original.apply(this,args)};
 apply();
})();
