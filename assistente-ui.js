// StudyFlow V30: apresentação segura e legível de respostas e referências.
// Não interpreta HTML fornecido pelo modelo ou pelo Crossref.
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const create = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };
  const readableMath = (text) => String(text || '')
    .replace(/\\delta/g, 'δ').replace(/\\pi/g, 'π').replace(/\\omega/g, 'ω')
    .replace(/\\Sigma/g, 'Σ').replace(/\\sum/g, '∑').replace(/\\infty/g, '∞')
    .replace(/\\left|\\right/g, '').replace(/\\cdot/g, '·')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    .replace(/\\\(/g, '').replace(/\\\)/g, '')
    .replace(/\\\[/g, '').replace(/\\\]/g, '')
    .replace(/\$([^$\n]+)\$/g, '$1');

  function inline(parent, value) {
    const chunks = readableMath(value).split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g);
    for (const part of chunks) {
      if (!part) continue;
      if (/^\*\*[^*]+\*\*$/.test(part)) parent.append(create('strong', '', part.slice(2,-2)));
      else if (/^\*[^*]+\*$/.test(part)) parent.append(create('em', '', part.slice(1,-1)));
      else if (/^`[^`]+`$/.test(part)) parent.append(create('code', '', part.slice(1,-1)));
      else parent.append(document.createTextNode(part));
    }
  }

  function renderMarkdown(raw) {
    const root = create('div', 'sf-ai-prose');
    const lines = String(raw || '').replace(/\r\n?/g, '\n').split('\n');
    let list = null;
    for (const line of lines) {
      const s = line.trim();
      if (!s) { list = null; continue; }
      if (/^-{3,}$/.test(s)) { list = null; root.append(create('hr')); continue; }
      const head = s.match(/^#{1,6}\s+(.+)$/);
      if (head) { list=null; const h=create('h4','sf-ai-heading'); inline(h,head[1]);root.append(h);continue; }
      const bullet = s.match(/^[-*•]\s+(.+)$/);
      const numbered = s.match(/^\d+[.)]\s+(.+)$/);
      const kind = numbered ? 'ol' : bullet ? 'ul' : null;
      if(kind){
        if(!list || list.tagName.toLowerCase()!==kind){list=create(kind,'sf-ai-list');root.append(list)}
        const li=create('li');inline(li,(numbered||bullet)[1]);list.append(li);continue;
      }
      list=null;
      const p=create('p','sf-ai-paragraph');inline(p,s);root.append(p);
    }
    return root;
  }

  function validDoiLink(url) {
    try {
      const parsed=new URL(String(url));
      return parsed.protocol==='https:' && parsed.hostname==='doi.org' && /^\/10\.\d{4,9}\//.test(decodeURIComponent(parsed.pathname)) ? parsed.href : null;
    } catch { return null; }
  }
  function sourceCard(record) {
    const card=create('article','sf-paper');
    const main=create('div','sf-paper-copy');
    main.append(create('h5','sf-paper-title',record.title||'Publicação sem título'));
    let meta=[];
    if(record.authors) meta.push(Array.isArray(record.authors)?record.authors.join(', '):record.authors);
    if(record.year) meta.push(String(record.year));
    if(record.publisher) meta.push(String(record.publisher));
    main.append(create('p','sf-paper-meta',meta.join(' · ')||'Dados bibliográficos incompletos'));
    card.append(main);
    const url=validDoiLink(record.doiUrl||record.doi);
    if(url){const link=create('a','sf-paper-link','Abrir DOI ↗');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Abrir DOI de '+(record.title||'publicação'));card.append(link)}
    else card.append(create('span','sf-paper-meta','DOI indisponível'));
    return card;
  }
  function sourcesBlock(sources) {
    const wrap=create('section','sf-ai-sources');
    wrap.append(create('h4','sf-sources-heading','Publicações encontradas no Crossref'));
    wrap.append(create('p','sf-paper-disclaimer','Metadados recuperados automaticamente. Confira a pertinência e a qualidade de cada publicação antes de citá-la.'));
    const list=create('div','sf-paper-list');
    sources.forEach(item => list.append(sourceCard(item)));
    wrap.append(list);
    return wrap;
  }
  const form=$('#advisorForm'), result=$('#adviceResult'), status=$('#adviceStatus'), badge=$('#aiBadge');
  if(form && result) {
    form.onsubmit=async (event) => {
      event.preventDefault();
      const subject=$('#subject').value.trim(),goal=$('#goal').value.trim();
      if(!subject || !goal) return;
      const btn=$('#adviceBtn');btn.disabled=true;btn.textContent='Preparando orientação...';
      result.className='sf-ai-response';result.replaceChildren(create('p','sf-ai-loading','Gerando seu plano de estudos…'));
      try {
        const profile=typeof state!=='undefined'?state.profile:null;
        const response=await fetch('/api/recommend',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({subject,goal,course:profile?.course||'',semester:profile?.semester||1,subjects:profile?.subjects||[]})
        });
        if(!response.ok){const d=await response.json().catch(()=>({}));throw new Error(d.error||'Não foi possível contatar o assistente.');}
        const data=await response.json();
        const output=renderMarkdown(data.text||'');
        output.append(create('p','sf-ai-disclaimer','Orientação gerada por IA. Verifique os conteúdos e as referências antes de utilizá-los.'));
        if(Array.isArray(data.sources)&&data.sources.length)output.append(sourcesBlock(data.sources));
        result.replaceChildren(output);
        status.textContent='Orientação gerada via Gemini';badge.textContent='IA conectada';
      }catch(error){
        const msg=create('p','sf-ai-error',error.message||'Falha ao gerar orientação');msg.setAttribute('role','alert');
        result.replaceChildren(msg,create('p','sf-ai-disclaimer','A orientação não foi gerada. Confira a conexão e tente novamente.'));
        status.textContent='Não foi possível gerar orientação';badge.textContent='IA indisponível';
      }finally{btn.disabled=false;btn.textContent='✧ Gerar orientação';}
    };
  }
  const sourceForm=$('#sourceForm'), sourceResults=$('#sourceResults');
  if(sourceForm && sourceResults){
    sourceForm.onsubmit=async event=>{
      event.preventDefault();
      const q=$('#sourceQuery').value.trim();if(q.length<3)return;
      const btn=$('#sourceBtn');btn.disabled=true;btn.textContent='Buscando...';
      sourceResults.replaceChildren(create('p','sf-ai-loading','Pesquisando publicações no Crossref…'));
      try{
        const response=await fetch('/api/sources?q='+encodeURIComponent(q));
        if(!response.ok){const err=await response.json().catch(()=>({}));throw new Error(err.error||'Não foi possível buscar publicações.')}
        const data=await response.json();
        if(!Array.isArray(data.items)||!data.items.length)sourceResults.replaceChildren(create('p','sf-paper-meta','Nenhuma publicação localizada. Tente outros termos.'));
        else sourceResults.replaceChildren(sourcesBlock(data.items));
      }catch(error){sourceResults.replaceChildren(create('p','sf-ai-error',error.message||'Busca indisponível.'))}
      finally{btn.disabled=false;btn.textContent='Buscar publicações'}
    };
  }
})();
