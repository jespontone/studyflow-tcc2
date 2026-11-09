# StudyFlow V5 — pesquisa UX com coleta centralizada

## Iniciar no computador (Node.js 18+)

No terminal dentro da pasta do projeto, configure uma senha longa e inicie:

**Windows PowerShell**
```powershell
$env:RESEARCHER_TOKEN="substitua-por-uma-senha-aleatoria-de-mais-de-16-caracteres"
node server.js
```
**Linux/macOS**
```bash
RESEARCHER_TOKEN="substitua-por-uma-senha-aleatoria-de-mais-de-16-caracteres" node server.js
```
Abra http://localhost:3000. Sem o servidor, cronograma e perfil continuam locais, mas avaliações não são enviadas.

## Enviar a amigos

`localhost` funciona somente no seu computador. Para coletar respostas de amigos em outros locais, hospede **esta pasta inteira** em serviço com Node.js, endereço HTTPS e **disco persistente**, configure RESEARCHER_TOKEN e DATA_DIR em diretório privado persistente. Não use hospedagem estática (GitHub Pages, Netlify estático) para essa coleta. Se o serviço usa sistema de arquivos efêmero, as respostas serão perdidas em reinicializações/implantações. Faça backups frequentes do CSV e do diretório de dados.

## Dados da avaliação

A pesquisa envia somente tarefa, três notas, comentário opcional e data. Não envia nome, foto, curso ou universidade. Não há garantia de anonimato se o participante se identificar no comentário ou se o provedor de hospedagem registrar endereço IP em logs. O botão de envio só mostra sucesso após confirmação do servidor. Respostas são guardadas em `private-data/ux-responses.jsonl` (ou DATA_DIR), não acessíveis pelo servidor de arquivos estáticos.

A área do pesquisador na página Avaliação de UX permite baixar respostas em CSV após inserir a senha de RESEARCHER_TOKEN. **Não compartilhe essa senha.** Não se trata de sistema pronto para pesquisas públicas em escala: faltam controle de abuso/rate limiting, política de retenção, transparência completa sobre hospedagem e procedimentos institucionais. Avalie TCLE, LGPD e necessidade de apreciação ética/CEP com o orientador antes de iniciar coleta formal.

## Mudanças de interface

A aba de aparência foi retirada para manter consistência visual nos testes. O perfil aceita foto JPG/PNG/WebP, convertida localmente para 160×160 pixels, e campo de universidade/faculdade. Perfil, cronograma e foto continuam apenas no navegador, salvo exportação manual.

## Teste demonstrativo

Após iniciar o servidor, preencha uma avaliação com consentimento. Uma resposta confirmada aparece no arquivo privado e no CSV de pesquisador. Use dados simulados para testes internos, separando-os de resultados reais do TCC.


## V6: modo claro / escuro e mascote
No cabeçalho, escolha Automático (segue preferência do dispositivo), Claro ou Escuro. A preferência é salva no navegador. O gatinho preto foi incorporado como foto de referência do usuário em `gatinho-preto.jpg`. A coleta por Google Forms continua configurada em `form-config.js`.
