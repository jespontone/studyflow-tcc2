# StudyFlow V26 — pacote pronto para publicar e avaliar

## 1. Google Forms (primeiro)

1. Confirme com o orientador os procedimentos éticos, a autorização e o texto de consentimento. **Não envie o formulário oficial antes disso.**
2. Entre em https://script.google.com/ , crie um projeto, cole o conteúdo de `CRIAR_GOOGLE_FORMS.gs` e execute `criarFormularioStudyFlow`.
3. Autorize as permissões na sua conta Google, confira o formulário gerado e substitua o texto de consentimento de exemplo pelo texto aprovado.
4. Confira as 10 questões SUS com a versão/tradução que será citada na monografia. **Não mude a polaridade nem a ordem.**
5. Publique o formulário e copie o **link de participante** (não o link de edição).
6. Abra `form-config.js` e substitua `window.STUDYFLOW_GOOGLE_FORM_URL = "";` pelo URL entre aspas.
7. A planilha foi criada e vinculada automaticamente pelo script. Faça uma resposta de teste e exclua-a antes da pesquisa oficial.

## 2. Teste local do site com API

Requisito: Node.js 20+. Na pasta deste projeto execute `npm start` e acesse http://localhost:3000. O cronograma e o perfil salvam no navegador.

Configure a variável `OPENAI_API_KEY` **apenas em seu computador ou no painel da hospedagem**, nunca em arquivos .js/.html publicados e nunca por chat. Exemplo PowerShell (somente na sessão atual):

```powershell
$env:OPENAI_API_KEY="SUA_CHAVE_PRIVADA"
$env:OPENAI_MODEL="gpt-5.5"
npm start
```

Na aba Assistente, use assunto e objetivo. Teste também a busca por DOI. A IA tem custo de API e **o site público pode consumir sua cota**. Defina limites de gastos no painel da API, monitore o uso e restrinja o acesso ao link do protótipo aos participantes. O código inclui um limite simples de 8 chamadas por hora/IP; isso não é uma defesa completa contra abuso.

## 3. Publicar em Render (site + servidor em um endereço)

1. Crie um repositório privado no GitHub e envie **os arquivos desta pasta**, não o ZIP. Não envie sua chave da API.
2. Acesse https://dashboard.render.com e clique New > Web Service > Conectar GitHub.
3. Escolha o repositório, runtime Node, plano Free, Build Command `npm install`, Start Command `npm start`.
4. Em Environment, adicione `OPENAI_API_KEY` com a sua chave; `OPENAI_MODEL` pode ser `gpt-5.5` (sujeito a acesso/modelo da sua conta).
5. Faça Deploy. Teste `/health`, página inicial, imagens, modo claro/escuro e API. O link publicado terá domínio `.onrender.com`.
6. Após criar o Forms, atualize `form-config.js` no repositório e faça deploy novamente.

**Limitações:** Render Free entra em repouso e pode demorar para responder; instâncias gratuitas não oferecem disco persistente. As respostas do TCC devem ficar no Google Forms/Sheets, não em arquivos locais do servidor. A publicação não é feita automaticamente por este pacote.

## 4. Teste presencial/remoto com os participantes

Protocolo: (1) consentimento adequado; (2) tarefas padronizadas no StudyFlow; (3) observação de conclusão, tempo e dificuldades; (4) SUS + perguntas qualitativas do Forms. Não conduzir a coleta sem a autorização institucional necessária. Não interpretar amostra pequena como representativa.

Para organizar a monografia: exporte o CSV do Forms/Sheets; separe o índice SUS das perguntas adicionais; documente relatos pelas cinco dimensões de UX e apresente limitações.

## 5. Problema técnico corrigido nesta versão

O servidor anterior não servia vários arquivos CSS, imagens e `form-config.js`. Este servidor contém lista fechada de arquivos públicos e agora entrega os recursos utilizados pelo site. Arquivos de pesquisa e senhas não são servidos.
