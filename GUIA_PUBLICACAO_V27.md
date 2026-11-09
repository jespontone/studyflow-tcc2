# StudyFlow V27 — publicação privada para revisão

## Situação
Site e backend estão no mesmo servidor Node.js. Google Forms já configurado no arquivo `form-config.js`. Para fazer a IA funcionar de verdade é necessária uma conta de API OpenAI com faturamento configurado e modelo disponível. NÃO coloque a chave no código nem a envie a ninguém.

## 1. Teste local
Requer Node.js 20 ou superior. No terminal dentro da pasta: `npm start`. Abra http://localhost:3000. O assistente mostra erro claro enquanto a API não estiver configurada.

## 2. Criar repositório
No GitHub, crie um repositório PRIVADO, por exemplo `studyflow-tcc2`. Envie os arquivos desta pasta diretamente na raiz (o `package.json` deve aparecer na raiz). Não envie senhas ou arquivos `.env`.

## 3. Render
Acesse dashboard.render.com > New > Web Service > conecte o repositório. Escolha Runtime Node, Build Command `npm install`, Start Command `npm start`, plano apropriado (se disponível, Free). Em Environment, configure:

- `OPENAI_API_KEY`: chave da sua conta, SOMENTE no painel Render.
- `OPENAI_MODEL`: `gpt-5.5` (trocar pelo modelo disponível no seu projeto se necessário).
- `STAGING_USER`: `studyflow` (ou outro nome).
- `STAGING_PASSWORD`: senha forte que você criar.

O endereço `https://<nome>.onrender.com` será gerado pelo Render. Com `STAGING_PASSWORD` ativo, o site EXIGE usuário e senha para abrir. A URL ainda existe na internet, mas não fica aberta ao público sem credenciais. NÃO compartilhe antes de validar o protocolo da pesquisa.

## 4. Testes antes da avaliação
1. Abra o link Render e autentique-se com a senha de prévia.
2. Veja o logo, cards, fotos e configurações.
3. Cadastre um perfil de TESTE e um cronograma (os dados permanecem no navegador).
4. No Assistente, peça "Como revisar transformada Z em 3 dias?". Confira que a tela apresenta a resposta da API, sem retorno demonstrativo disfarçado.
5. Busque publicações por "digital signal processing" e confira ao menos um DOI. Metadados Crossref não asseguram confiabilidade ou relevância, que exigem verificação.
6. Abra Avaliação UX e confirme que o botão leva ao Forms preparado. Antes de coletar de participantes, revise consentimento e exigências éticas com UTFPR.
7. Em Configurações, teste tamanho A++, alto contraste e os modos claro/escuro.

## 5. Quando for coletar oficialmente
Apenas após confirmar o enquadramento ético, revise o consentimento, conclua a validação dos testes e planeje quando remover a variável `STAGING_PASSWORD` ou compartilhar credenciais de teste. A coleta fica no Forms/Sheets, enquanto cronogramas e fotos ficam localmente no navegador dos participantes.

## Segurança e custos
Não publique `OPENAI_API_KEY` em arquivos JS, HTML ou GitHub. Use uma chave própria do projeto, monitore custos e rotacione caso exponha. A limitação de requisições existente no servidor é simples (por IP e em memória) e não substitui controle de gastos robusto: não exponha a API publicamente sem supervisão de uso e orçamento. O modo privado é apropriado para ensaios internos.
