# StudyFlow: publicar e coletar avaliações no Google Forms

## 1. Google Forms
1. Crie um formulário em https://forms.google.com.
2. Inclua informações sobre a pesquisa e consentimento voluntário; valide os procedimentos éticos com o orientador antes de iniciar a coleta oficial.
3. Crie perguntas para as tarefas realizadas, sucesso ao concluir, facilidade, clareza, feedback e comentários.
4. No Google Forms, use **Publicar/Enviar** para obter o **link de resposta**, não o de edição.
5. Abra `form-config.js`, cole o link de resposta entre as aspas de `window.STUDYFLOW_GOOGLE_FORM_URL = "";` e salve.
6. Vá a **Respostas → Vincular ao Planilhas Google** para reunir os dados. Faça um teste você mesmo.

## 2. Publicar o protótipo
1. Abra https://app.netlify.com/drop e faça login, se necessário.
2. Envie a pasta `StudyFlow_TCC2` (com `index.html` na raiz).
3. Copie o endereço https gerado pelo Netlify e compartilhe com seus participantes.
4. Se alterar o formulário ou código, publique novamente a pasta modificada.

## 3. Limitações
- O cronograma e perfil são salvos no navegador de **cada pessoa** (localStorage), não na sua conta.
- O Google Forms reúne apenas as respostas que os participantes enviarem explicitamente.
- No Netlify Drop, a parte estática funciona; as APIs de IA, Crossref e o envio alternativo de avaliações via servidor Node não funcionam sem hospedar/configurar também o backend.
- A interface atual ainda exibe um **formulário interno alternativo**, que só envia para o servidor Node configurado. Para avaliação remota com Netlify, oriente os participantes a usar o botão Google Forms.
- Não compartilhe senhas ou chaves de API no HTML/JS publicado.
- Evite coletar nome, e-mail, foto e dados identificadores sem necessidade.
