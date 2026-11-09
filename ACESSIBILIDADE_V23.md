# StudyFlow V23 — Revisão inicial de acessibilidade

Melhorias implementadas na V22: botão de acessibilidade no cabeçalho; opções de tamanho de texto (100%, 125%, 150%); alto contraste; redução de animações; preferências locais; atalho para pular ao conteúdo; indicação do foco pelo teclado; rótulos acessíveis para alguns campos; identificação do diálogo e dos avisos; foco devolvido após fechamento de diálogos; identificação do item atual do menu; opção Esc para fechar o painel.

## Como testar
1. Abrir `index.html`, selecionar **Acessibilidade** e mudar as opções. Atualizar a página para conferir a persistência.
2. Usar **Tab**, **Shift+Tab**, **Enter** e **Esc** para navegar e fechar janelas.
3. Inspecionar temas claro/escuro e alto contraste; conferir textos e o calendário.
4. Usar o zoom do navegador em 200% e verificar se conteúdo essencial permanece utilizável.
5. Conferir com leitor de tela (NVDA/VoiceOver) os rótulos dos formulários e avisos de confirmação.

**Limites:** não há certificação de conformidade WCAG 2.2 AA. O projeto ainda necessita auditoria de contraste de TODOS os elementos e verificação manual em telas pequenas, com zoom de 200%, leitores de tela e teclado. Os testes de acessibilidade não substituem avaliação ética e de UX com participantes.

Referência: https://www.w3.org/TR/WCAG22/
