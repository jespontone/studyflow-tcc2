# Correção V12 — perfil acadêmico

Causa identificada: `render()` era executado antes da inicialização de `state.profile` e `state.ux`. Isso interrompia o script e impedia o cadastro. A primeira renderização foi movida para depois de `validateProfile`, `validateUX` e da montagem dos campos de disponibilidade.

Para atualizar: extraia o ZIP e substitua os arquivos da versão anterior. Não limpe os dados do navegador. Teste perfil, salvar, atualizar a página e reabrir.
