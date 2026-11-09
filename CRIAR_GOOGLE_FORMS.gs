/**
 * StudyFlow: gera um Google Forms de avaliacao piloto com SUS e perguntas de UX.
 * Execute criarFormularioStudyFlow() em https://script.google.com com sua conta.
 * O formulario NAO e publicado automaticamente. Confira consentimento/CEP
 * com o orientador antes de convidar participantes.
 */
function criarFormularioStudyFlow() {
  const form = FormApp.create('Avaliação de Usabilidade — StudyFlow (TCC2)');
  form.setDescription(
    'Pesquisa exploratória sobre usabilidade de uma plataforma de organização de estudos universitários. ' +
    'Responda SOMENTE depois de realizar as tarefas de teste. Participação voluntária. ' +
    'Não informe nomes, e-mails, número de matrícula ou dados sensíveis nas respostas abertas. ' +
    'Leia as informações e o termo de consentimento aprovados pelo orientador antes de participar.'
  );
  form.setConfirmationMessage('Obrigado pela colaboração! Suas respostas ajudarão a avaliar o StudyFlow.');
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.addSectionHeaderItem().setTitle('1. Informações e consentimento')
    .setHelpText('ATENÇÃO: Antes de publicar, substituir este texto pelas informações completas de pesquisa e consentimento aprovadas: responsável, contato, finalidade, procedimentos, riscos, benefícios, voluntariedade, uso e guarda dos dados. Não iniciar coleta oficial sem verificar exigências éticas com o orientador.');
  form.addCheckboxItem().setTitle('Li as informações da pesquisa e concordo voluntariamente em participar.')
    .setChoiceValues(['Li e concordo em participar']).setRequired(true);
  form.addSectionHeaderItem().setTitle('2. Experiência no teste');
  form.addMultipleChoiceItem().setTitle('Qual dispositivo você utilizou?')
    .setChoiceValues(['Computador/notebook','Celular','Tablet']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('Você já utiliza ferramentas digitais para organizar seus estudos?')
    .setChoiceValues(['Frequentemente','Às vezes','Nunca']).setRequired(true);
  [
    'Cadastrar ou atualizar seu perfil acadêmico',
    'Criar uma atividade com prazo e prioridade',
    'Definir disponibilidade e gerar um plano de estudos',
    'Localizar a sessão criada no calendário',
    'Solicitar uma orientação à IA e conferir a identificação de uma fonte acadêmica'
  ].forEach((task,i)=>{
    form.addMultipleChoiceItem().setTitle('Tarefa '+(i+1)+' — '+task)
      .setChoiceValues(['Consegui sem ajuda','Consegui com dificuldade ou ajuda','Não consegui','Não estava disponível no sistema']).setRequired(true);
  });
  form.addSectionHeaderItem().setTitle('3. Escala SUS — System Usability Scale')
    .setHelpText('Marque de 1 (discordo totalmente) a 5 (concordo totalmente). As 10 afirmações devem ser mantidas na mesma ordem para calcular a pontuação SUS. Texto em português de trabalho: conferir a tradução validada adotada na monografia.');
  const sus=[
    'Eu gostaria de usar este sistema frequentemente.',
    'Eu achei o sistema desnecessariamente complexo.',
    'Eu achei o sistema fácil de usar.',
    'Eu acho que precisaria de ajuda de uma pessoa com conhecimentos técnicos para usar este sistema.',
    'Eu achei que as várias funções do sistema estavam bem integradas.',
    'Eu achei que havia muita inconsistência neste sistema.',
    'Eu imagino que a maioria das pessoas aprenderia a usar este sistema rapidamente.',
    'Eu achei o sistema muito complicado de usar.',
    'Eu me senti confiante ao usar o sistema.',
    'Eu precisei aprender muitas coisas antes de conseguir usar o sistema.'
  ];
  sus.forEach((q,i)=>form.addScaleItem().setTitle('SUS '+(i+1)+' — '+q)
    .setBounds(1,5).setLabels('Discordo totalmente','Concordo totalmente').setRequired(true));
  form.addSectionHeaderItem().setTitle('4. As cinco dimensões de UX do StudyFlow')
    .setHelpText('Itens complementares exploratórios; não entram no cálculo SUS.');
  const extras=[
    'Usabilidade — Foi fácil encontrar as funções e concluir as tarefas.',
    'Feedback — As mensagens após salvar ou concluir ações foram claras.',
    'Personalização — As sugestões do cronograma pareceram adequadas à minha disponibilidade.',
    'Acessibilidade — Consegui ler os textos e utilizar os controles com conforto.',
    'Engajamento — O sistema me motivou a organizar melhor meus estudos.',
    'Transparência da IA — Foi possível identificar o que era orientação gerada por IA e quais eram as fontes apresentadas.'
  ];
  extras.forEach(q=>form.addScaleItem().setTitle(q).setBounds(1,5)
    .setLabels('Discordo totalmente','Concordo totalmente').setRequired(true));
  form.addParagraphTextItem().setTitle('Qual foi a maior dificuldade encontrada?').setRequired(false);
  form.addParagraphTextItem().setTitle('O que você mais gostou no StudyFlow?').setRequired(false);
  form.addParagraphTextItem().setTitle('Que melhoria você recomenda?').setRequired(false);
  const sheet=SpreadsheetApp.create('StudyFlow — Respostas de usabilidade (TCC2)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET,sheet.getId());
  Logger.log('EDITOR: '+form.getEditUrl());
  Logger.log('LINK PARA RESPONDER (publique antes): '+form.getPublishedUrl());
  Logger.log('PLANILHA: '+sheet.getUrl());
}
