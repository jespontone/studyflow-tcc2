// Servidor opcional: Node.js 18+; sem dependências adicionais.
// Configurar OPENAI_API_KEY no ambiente para habilitar IA.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const port=Number(process.env.PORT||3000),root=__dirname;
const uxDir=process.env.DATA_DIR||path.join(root,'private-data');const uxFile=path.join(uxDir,'ux-responses.jsonl');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8'};
const reply=(res,status,data,contentType='application/json; charset=utf-8')=>{res.writeHead(status,{'Content-Type':contentType,'X-Content-Type-Options':'nosniff'});res.end(Buffer.isBuffer(data)||typeof data==='string'?data:JSON.stringify(data))};
const readBody=async(req,max=1600)=>{let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>max)throw Error('Dados excedem o limite')}return JSON.parse(raw)};
const csvCell=value=>{let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
const authOk=(req)=>{const secret=process.env.RESEARCHER_TOKEN||'';const candidate=(req.headers.authorization||'').replace(/^Bearer /,'');if(secret.length<16||candidate.length!==secret.length)return false;return crypto.timingSafeEqual(Buffer.from(candidate),Buffer.from(secret))};
const aiRequests=new Map();
const stagingPassword=process.env.STAGING_PASSWORD||'';
const stagingUser=process.env.STAGING_USER||'studyflow';
const previewAuthorized=(req)=>{
 if(!stagingPassword)return true;
 const auth=String(req.headers.authorization||'');
 if(!auth.startsWith('Basic '))return false;
 let pair='';try{pair=Buffer.from(auth.slice(6),'base64').toString('utf8')}catch{return false}
 const expected=stagingUser+':'+stagingPassword;
 const a=Buffer.from(pair),b=Buffer.from(expected);
 return a.length===b.length && crypto.timingSafeEqual(a,b);
};
const server=http.createServer(async(req,res)=>{
 if(!previewAuthorized(req)){
  res.writeHead(401,{'WWW-Authenticate':'Basic realm="StudyFlow - Previa privada", charset="UTF-8"','Cache-Control':'no-store'});
  return res.end('Previa protegida. Informe o usuario e a senha configurados no Render.');
 }

 if(req.method==='GET'&&req.url==='/health')return reply(res,200,{ok:true,service:'StudyFlow'});
 if(req.url?.startsWith('/api/recommend')){
  const ip=(req.socket.remoteAddress||'unknown');const now=Date.now();
  const hits=(aiRequests.get(ip)||[]).filter(t=>now-t<3600000);
  if(hits.length>=8)return reply(res,429,{error:'Limite de demonstracoes por hora atingido. Tente mais tarde.'});
  hits.push(now);aiRequests.set(ip,hits);
  if(aiRequests.size>3000)aiRequests.clear();
 }

 if(req.method==='POST'&&req.url==='/api/ux'){
  if(!process.env.RESEARCHER_TOKEN||process.env.RESEARCHER_TOKEN.length<16)return reply(res,503,{error:'Coleta não configurada no servidor'});
  try{const x=await readBody(req);if(!['Perfil','Cronograma','Atividades','Fontes'].includes(x.task)||![x.ease,x.clarity,x.feedback].every(n=>Number.isInteger(n)&&n>=1&&n<=5)||typeof x.comment!=='string'||x.comment.length>700)return reply(res,400,{error:'Respostas inválidas'});
   const record={id:crypto.randomUUID(),task:x.task,ease:x.ease,clarity:x.clarity,feedback:x.feedback,comment:x.comment,at:new Date().toISOString()};
   await fs.promises.mkdir(uxDir,{recursive:true,mode:0o700});await fs.promises.appendFile(uxFile,JSON.stringify(record)+'\n',{encoding:'utf8',mode:0o600});return reply(res,201,{id:record.id});
  }catch{return reply(res,400,{error:'Não foi possível registrar a resposta'})}
 }
 if(req.method==='GET'&&req.url==='/api/ux/export'){
  if(!authOk(req))return reply(res,401,{error:'Acesso não autorizado'});
  try{const data=await fs.promises.readFile(uxFile,'utf8').catch(e=>e.code==='ENOENT'?'':Promise.reject(e));const records=data.split('\n').filter(Boolean).map(x=>JSON.parse(x));const csv='\ufeff'+[['id','tarefa','facilidade','clareza','feedback','comentario','data'],...records.map(x=>[x.id,x.task,x.ease,x.clarity,x.feedback,x.comment,x.at])].map(row=>row.map(csvCell).join(';')).join('\r\n');res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="studyflow-avaliacoes.csv"','Cache-Control':'no-store'});return res.end(csv)}catch{return reply(res,500,{error:'Falha ao exportar'})}
 }

 if(req.method==='POST'&&req.url==='/api/recommend'){
  if(!process.env.OPENAI_API_KEY)return reply(res,503,{error:'API não configurada'});
  try{let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>6000)return reply(res,413,{error:'Entrada muito grande'})}const {subject,goal,course='',semester=1,subjects=[]}=JSON.parse(raw);if(typeof subject!=='string'||typeof goal!=='string'||subject.length>120||goal.length>500||!subject.trim()||!goal.trim())return reply(res,400,{error:'Dados inválidos'});
   // Busca metadados reais ANTES de gerar orientações; não presume qualidade dos artigos.
   let found=[];
   try {const searchUrl=new URL('https://api.crossref.org/works');searchUrl.searchParams.set('query.bibliographic',subject);searchUrl.searchParams.set('rows','5');const lookup=await fetch(searchUrl,{signal:AbortSignal.timeout(9000),headers:{'User-Agent':'StudyFlow-TCC2/3.0'}});if(lookup.ok){const content=await lookup.json();found=(content.message?.items||[]).filter(x=>typeof x.DOI==='string'&&/^10\.\d{4,9}\//.test(x.DOI)).slice(0,5).map(x=>({title:String(x.title?.[0]||'').slice(0,220),authors:(x.author||[]).slice(0,3).map(a=>[a.given,a.family].filter(Boolean).join(' ')).join(', '),year:x.published?.['date-parts']?.[0]?.[0]||x.issued?.['date-parts']?.[0]?.[0]||null,doi:'https://doi.org/'+encodeURIComponent(x.DOI).replace('%2F','/')}));}}catch{}
   const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5.5',max_output_tokens:1200,instructions:'Você auxilia universitários em português. Gere um plano breve e realizável de estudos. Indique conceitos, revisão, exercícios e estratégias de verificação. Não invente referências, autores, links ou afirmações de validação de fontes. Sugira buscas em SciELO, CAPES e Google Acadêmico, mas declare que os resultados deverão ser conferidos. Use apenas os metadados fornecidos ao citar estudos, diferenciando metadados de comprovação da qualidade ou relevância do conteúdo. Se as publicações forem pouco relacionadas, declare isso e não as recomende. Não invente DOIs nem URLs. Não solicite dados pessoais.',input:`Disciplina: ${subject}\nObjetivo: ${goal}\nCurso: ${String(course).slice(0,90)}\nSemestre: ${Number(semester)||1}\nDisciplinas cadastradas: ${Array.isArray(subjects)?subjects.slice(0,20).map(x=>String(x).slice(0,70)).join(', '):''}\nMetadados localizados no Crossref (sem avaliação de qualidade): ${JSON.stringify(found)}`})});
   if(!response.ok){const err=await response.json().catch(()=>({}));const code=err?.error?.code||'';const type=err?.error?.type||'';console.error('Erro OpenAI',response.status,code,type);return reply(res,502,{error:response.status===429?'API com limite ou créditos indisponíveis. Verifique o faturamento.':response.status===401?'Chave da API inválida ou sem permissão.':'Não foi possível consultar a IA. Verifique a configuração do servidor.'});}const result=await response.json();const text=(result.output||[]).filter(i=>i.type==='message').flatMap(i=>i.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('\n');return reply(res,200,{text:text||'Não foi possível extrair a resposta.',sources:found});
  }catch(err){return reply(res,500,{error:'Não foi possível gerar a orientação'})}
 }
 if(req.method==='GET'&&req.url?.startsWith('/api/sources?')){
  try{
   const u=new URL(req.url,'http://localhost'),q=(u.searchParams.get('q')||'').trim();
   if(q.length<3||q.length>160)return reply(res,400,{error:'Informe um assunto com 3 a 160 caracteres'});
   const url=new URL('https://api.crossref.org/works');url.searchParams.set('query.bibliographic',q);url.searchParams.set('rows','6');url.searchParams.set('select','DOI,title,author,published,issued,publisher');
   const response=await fetch(url,{headers:{'User-Agent':'StudyFlow-AcademicPrototype/2.0 (university UX research; contact via project supervisor)'},signal:AbortSignal.timeout(12000)});
   if(!response.ok)return reply(res,502,{error:'Falha na consulta ao Crossref'});
   const json=await response.json();const items=(json.message?.items||[]).map(x=>{
    const doi=typeof x.DOI==='string'&&/^10\.\d{4,9}\//.test(x.DOI)?x.DOI:null;
    const y=x.published?.['date-parts']?.[0]?.[0]||x.issued?.['date-parts']?.[0]?.[0]||null;
    return {title:String(x.title?.[0]||'Sem título').slice(0,400),authors:(x.author||[]).slice(0,5).map(a=>[a.given,a.family].filter(Boolean).join(' ').slice(0,100)),year:y,publisher:String(x.publisher||'').slice(0,120),doiUrl:doi?'https://doi.org/'+encodeURIComponent(doi).replace('%2F','/'):null};
   });return reply(res,200,{items});
  }catch{return reply(res,502,{error:'Consulta acadêmica indisponível'})}
 }
 if(req.method!=='GET')return reply(res,405,{error:'Método não permitido'});
 // Sirva somente arquivos publicos conhecidos; nunca exponha dados, senhas ou documentos internos.
 let route;
 try {route=decodeURIComponent((req.url||'/').split('?')[0]);} catch {return reply(res,400,{error:'Caminho invalido'});}
 const publicFiles=new Set([
  'index.html','app.js','form-config.js','acessibilidade.js','v6.js',
  'style.css','playful.css','acessibilidade.css',
  'v6.css','v7.css','v8.css','v10.css','v13.css','v14.css','v15.css','v17.css','v18.css','v19.css','v21.css','v22.css',
  'gatinho-feliz.png','gatinho-pensativo.png','gatinho-comemorando.png',
  'gatinho-joinha.png','gatinho-preto.jpg','mascote-studyflow.png'
 ]);
 const file=route==='/'?'index.html':route.slice(1);
 if(!publicFiles.has(file))return reply(res,404,'Nao encontrado','text/plain; charset=utf-8');
 const mimeType=mime[path.extname(file)]||({'.png':'image/png','.jpg':'image/jpeg'}[path.extname(file)])||'application/octet-stream';
 fs.readFile(path.join(root,file),(err,buf)=>err?reply(res,404,'Nao encontrado','text/plain; charset=utf-8'):reply(res,200,buf,mimeType));
});server.listen(port,'0.0.0.0',()=>console.log(`StudyFlow disponível na porta ${port}`));
