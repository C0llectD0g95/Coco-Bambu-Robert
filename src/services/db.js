// C:\Users\Asus\Desktop\Coco Bambu\src\services\db.js

const DB_KEY_PREFIX = 'capybara_academy_';

// Initial Mock Data
const MOCK_COMPANIES = [
  { id: 'cb', name: 'Coco Bambu' }
];

const MOCK_UNITS = [
  { id: 'u-teresina', name: 'Coco Bambu - Teresina', company_id: 'cb' },
  { id: 'u-matriz', name: 'Coco Bambu - Matriz', company_id: 'cb' }
];

const MOCK_DEPARTMENTS = [
  { id: 'd-atendimento', name: 'Atendimento' },
  { id: 'd-cozinha', name: 'Cozinha' },
  { id: 'd-bar', name: 'Bar' },
  { id: 'd-rh', name: 'Recursos Humanos' },
  { id: 'd-gestao', name: 'Gestão' }
];

const MOCK_POSITIONS = [
  { id: 'p-gerente-geral', name: 'Gerente Geral', department_id: 'd-gestao' },
  { id: 'p-chefe', name: 'Chefe de Cozinha', department_id: 'd-cozinha' },
  { id: 'p-subchefe', name: 'Subchefe', department_id: 'd-cozinha' },
  { id: 'p-cozinheiro', name: 'Cozinheiro', department_id: 'd-cozinha' },
  { id: 'p-aux-coz', name: 'Auxiliar de Cozinha', department_id: 'd-cozinha' },
  { id: 'p-garcom', name: 'Garçom', department_id: 'd-atendimento' },
  { id: 'p-cumim', name: 'Cumim', department_id: 'd-atendimento' },
  { id: 'p-recepcionista', name: 'Recepcionista', department_id: 'd-atendimento' },
  { id: 'p-barman', name: 'Barman', department_id: 'd-bar' },
  { id: 'p-aux-bar', name: 'Auxiliar de Bar', department_id: 'd-bar' },
  { id: 'p-analista-rh', name: 'Analista de RH', department_id: 'd-rh' }
];

const MOCK_USERS = [
  // Admin
  { id: 'usr-admin', name: 'Administrador Geral', email: 'admin@cocobambu.com', role: 'admin', unit_id: '', department_id: 'd-gestao', position_id: 'p-gerente-geral', status: 'active', password: '123' },
  
  // Managers (Gestores)
  { id: 'usr-m-thiago', name: 'Thiago Silva', email: 'gerente.teresina@cocobambu.com', role: 'gestor', unit_id: 'u-teresina', department_id: 'd-gestao', position_id: 'p-gerente-geral', status: 'active', password: '123' },
  { id: 'usr-m-camila', name: 'Camila Souza', email: 'gerente.matriz@cocobambu.com', role: 'gestor', unit_id: 'u-matriz', department_id: 'd-gestao', position_id: 'p-gerente-geral', status: 'active', password: '123' },
  { id: 'usr-m-marcus', name: 'Marcus Costa', email: 'chefe.cozinha@cocobambu.com', role: 'gestor', unit_id: 'u-teresina', department_id: 'd-cozinha', position_id: 'p-chefe', status: 'active', password: '123' },
  
  // Employees (Funcionários) - Teresina
  { id: 'usr-emp-joao', name: 'João Santos', email: 'garcom1@cocobambu.com', role: 'funcionario', unit_id: 'u-teresina', department_id: 'd-atendimento', position_id: 'p-garcom', status: 'active', password: '123', manager_id: 'usr-m-thiago' },
  { id: 'usr-emp-lucas', name: 'Lucas Lima', email: 'garcom2@cocobambu.com', role: 'funcionario', unit_id: 'u-teresina', department_id: 'd-atendimento', position_id: 'p-garcom', status: 'active', password: '123', manager_id: 'usr-m-thiago' },
  { id: 'usr-emp-pedro', name: 'Pedro Rocha', email: 'cumim1@cocobambu.com', role: 'funcionario', unit_id: 'u-teresina', department_id: 'd-atendimento', position_id: 'p-cumim', status: 'active', password: '123', manager_id: 'usr-m-thiago' },
  { id: 'usr-emp-ana', name: 'Ana Oliveira', email: 'recep1@cocobambu.com', role: 'funcionario', unit_id: 'u-teresina', department_id: 'd-atendimento', position_id: 'p-recepcionista', status: 'active', password: '123', manager_id: 'usr-m-thiago' },
  
  { id: 'usr-emp-maria', name: 'Maria Silva', email: 'cozinheiro1@cocobambu.com', role: 'funcionario', unit_id: 'u-teresina', department_id: 'd-cozinha', position_id: 'p-cozinheiro', status: 'active', password: '123', manager_id: 'usr-m-marcus' },
  { id: 'usr-emp-jose', name: 'José Alves', email: 'cozinheiro2@cocobambu.com', role: 'funcionario', unit_id: 'u-teresina', department_id: 'd-cozinha', position_id: 'p-cozinheiro', status: 'active', password: '123', manager_id: 'usr-m-marcus' },
  { id: 'usr-emp-bruno', name: 'Bruno Souza', email: 'auxcoz1@cocobambu.com', role: 'funcionario', unit_id: 'u-teresina', department_id: 'd-cozinha', position_id: 'p-aux-coz', status: 'active', password: '123', manager_id: 'usr-m-marcus' },
  { id: 'usr-emp-daniel', name: 'Daniel Dias', email: 'barman1@cocobambu.com', role: 'funcionario', unit_id: 'u-teresina', department_id: 'd-bar', position_id: 'p-barman', status: 'active', password: '123', manager_id: 'usr-m-thiago' },
  
  // Employees - Matriz
  { id: 'usr-emp-felipe', name: 'Felipe Neto', email: 'garcom.matriz1@cocobambu.com', role: 'funcionario', unit_id: 'u-matriz', department_id: 'd-atendimento', position_id: 'p-garcom', status: 'active', password: '123', manager_id: 'usr-m-camila' },
  { id: 'usr-emp-mariana', name: 'Mariana Costa', email: 'garcom.matriz2@cocobambu.com', role: 'funcionario', unit_id: 'u-matriz', department_id: 'd-atendimento', position_id: 'p-garcom', status: 'active', password: '123', manager_id: 'usr-m-camila' },
  { id: 'usr-emp-roberto', name: 'Roberto Ramos', email: 'cozinheiro.matriz1@cocobambu.com', role: 'funcionario', unit_id: 'u-matriz', department_id: 'd-cozinha', position_id: 'p-cozinheiro', status: 'active', password: '123', manager_id: 'usr-m-camila' },
  { id: 'usr-emp-sofia', name: 'Sofia Lima', email: 'auxcoz.matriz1@cocobambu.com', role: 'funcionario', unit_id: 'u-matriz', department_id: 'd-cozinha', position_id: 'p-aux-coz', status: 'active', password: '123', manager_id: 'usr-m-camila' },
  { id: 'usr-emp-gabriel', name: 'Gabriel Jesus', email: 'barman.matriz1@cocobambu.com', role: 'funcionario', unit_id: 'u-matriz', department_id: 'd-bar', position_id: 'p-barman', status: 'active', password: '123', manager_id: 'usr-m-camila' }
];

const MOCK_DOCUMENTS = [
  { id: 'doc-1', name: 'Guide de Atendimento Coco Bambu', sector_id: 'd-atendimento', unit_id: '', category: 'Padrões', version: 'v2.1', date: '2026-01-15', status: 'active', author_id: 'usr-admin', fileContent: 'Este guia estabelece o padrão de ouro para atendimento no Coco Bambu. Desde a recepção do cliente até a oferta de sobremesas. Sorria sempre, mantenha a postura profissional e utilize técnicas de vendas sugestivas como sugerir entradas e bebidas especiais.' },
  { id: 'doc-2', name: 'Manual de Higienização de Alimentos', sector_id: 'd-cozinha', unit_id: '', category: 'Procedimentos', version: 'v1.4', date: '2026-02-10', status: 'active', author_id: 'usr-admin', fileContent: 'Procedimentos de sanitização de hortifrutis, higienização das bancadas de inox de hora em hora com álcool 70%, e controle estrito da temperatura das geladeiras (máximo 4°C) e freezers (mínimo -18°C).' },
  { id: 'doc-3', name: 'Boas Práticas de Manipulação de Pescados', sector_id: 'd-cozinha', unit_id: '', category: 'Checklists', version: 'v3.0', date: '2026-03-01', status: 'active', author_id: 'usr-admin', fileContent: 'Regras para recebimento, descongelamento seguro (sempre sob refrigeração) e preparação de camarões, peixes e lagostas. O frescor e a temperatura correta no armazenamento são fundamentais para evitar contaminações.' },
  { id: 'doc-4', name: 'Manual do Barman e Coquetelaria', sector_id: 'd-bar', unit_id: '', category: 'Procedimentos', version: 'v1.0', date: '2026-03-12', status: 'active', author_id: 'usr-admin', fileContent: 'Ficha técnica para preparação de caipirinhas, coquetéis de frutas e servir chopp na temperatura ideal. Limpeza rigorosa da chopeira e dos copos.' },
  { id: 'doc-5', name: 'Manual de Integração de Novos Colaboradores', sector_id: 'd-rh', unit_id: '', category: 'Procedimentos', version: 'v2.0', date: '2026-04-05', status: 'active', author_id: 'usr-admin', fileContent: 'História do Coco Bambu, nossa missão, valores e regras de conduta interna. Escala de trabalho, uniforme e uso de canais de comunicação oficiais.' },
  { id: 'doc-6', name: 'Guia de Segurança Alimentar Geral', sector_id: 'd-cozinha', unit_id: '', category: 'Procedimentos', version: 'v2.2', date: '2026-04-20', status: 'active', author_id: 'usr-admin', fileContent: 'Princípios gerais da vigilância sanitária. Uso obrigatório de toucas, unhas cortadas e sem esmalte, proibição de adornos e uso de calçado antiderrapante na área da cozinha.' },
  { id: 'doc-7', name: 'Checklist de Abertura de Salão', sector_id: 'd-atendimento', unit_id: '', category: 'Checklists', version: 'v1.2', date: '2026-05-02', status: 'active', author_id: 'usr-admin', fileContent: 'Rotina matinal antes da abertura: alinhamento de mesas, polimento de talheres, abastecimento de galheteiros, verificação do ar condicionado e som ambiente.' },
  { id: 'doc-8', name: 'Manual de Gestão Operacional de Unidades', sector_id: 'd-gestao', unit_id: '', category: 'Procedimentos', version: 'v4.1', date: '2026-05-15', status: 'active', author_id: 'usr-admin', fileContent: 'Diretrizes exclusivas para gerentes sobre gerenciamento de escalas, controle de desperdício, análise de relatórios de satisfação e execução diária do Esquenta.' },
  { id: 'doc-9', name: 'Guia Rápido de Vendas Sugestivas', sector_id: 'd-atendimento', unit_id: '', category: 'Padrões', version: 'v1.1', date: '2026-06-01', status: 'active', author_id: 'usr-admin', fileContent: 'Como aumentar o ticket médio oferecendo camarão Coco Bambu ou as famosas cocadas assadas. Técnicas de gatilho mental de escassez e exclusividade.' },
  { id: 'doc-10', name: 'Procedimento de Recebimento de Mercadorias', sector_id: 'd-cozinha', unit_id: '', category: 'Procedimentos', version: 'v1.3', date: '2026-06-18', status: 'active', author_id: 'usr-admin', fileContent: 'Verificação da nota fiscal, conferência do peso, temperatura do caminhão refrigerado e data de validade dos produtos alimentícios no ato da entrega.' }
];

const MOCK_TRAININGS = [
  { id: 'tr-1', title: 'Boas Práticas de Higiene e Segurança', theme: 'Higiene e Manipulação', sector_id: 'd-cozinha', target_audience: 'Cozinha e Bar', date: '2026-08-28', time: '14:30', duration: '60 min', description: 'Capacitação presencial sobre higiene na cozinha, controle de pragas e lavagem correta das mãos.', material_id: 'doc-6', is_mandatory: true, unit_id: 'u-teresina', status: 'scheduled' },
  { id: 'tr-2', title: 'Excelência no Atendimento ao Cliente', theme: 'Atendimento de Mesa', sector_id: 'd-atendimento', target_audience: 'Garçons e Recepcionistas', date: '2026-08-29', time: '15:00', duration: '90 min', description: 'Dinâmica prática simulando situações de reclamação, abertura de salão e vendas sugestivas.', material_id: 'doc-1', is_mandatory: true, unit_id: 'u-teresina', status: 'scheduled' },
  { id: 'tr-3', title: 'Preparação e Serviço de Caipirinhas Coco Bambu', theme: 'Bar e Bebidas', sector_id: 'd-bar', target_audience: 'Barmans e Ajudantes de Bar', date: '2026-08-30', time: '16:00', duration: '45 min', description: 'Passo a passo das receitas clássicas da casa e técnicas de velocidade no atendimento do bar.', material_id: 'doc-4', is_mandatory: false, unit_id: 'u-teresina', status: 'scheduled' }
];

const MOCK_WARMUPS = [
  { id: 'wp-1', title: 'Esquenta Alinhamento Atendimento Cozinha', theme: 'Comunicação e Velocidade', sector_id: 'd-atendimento', date: '2026-08-24', shift: 'Almoço', duration: '10 min', content: 'Conversamos sobre o alinhamento de comunicação entre o garçom e o cumim no envio de comandas. Foco em reduzir o tempo de espera no salão.', guide_id: 'doc-1', notes: 'Equipe motivada e focada nos tempos de pratos de frutos do mar.', manager_id: 'usr-m-thiago', status: 'completed', unit_id: 'u-teresina', date_created: '2026-08-24T11:00:00Z' },
  { id: 'wp-2', title: 'Esquenta Higienização Noturna', theme: 'Limpeza e Sanitização', sector_id: 'd-cozinha', date: '2026-08-24', shift: 'Jantar', duration: '15 min', content: 'Reforço nas práticas de limpeza das chapas e guarda de pescados etiquetados com data.', guide_id: 'doc-2', notes: 'Revisado termômetro da geladeira principal.', manager_id: 'usr-m-marcus', status: 'completed', unit_id: 'u-teresina', date_created: '2026-08-24T22:30:00Z' }
];

// Seed activities and questions
const MOCK_ACTIVITIES = [
  { id: 'act-1', title: 'Padrão de Atendimento Especial', theme: 'Excelência em Atendimento', sector_id: 'd-atendimento', target_audience: 'Atendimento', date: '2026-08-25', deadline: '2026-08-28', description: 'Avaliação teórica com base no Guide de Atendimento do Coco Bambu para testar sua abordagem comercial.', material_id: 'doc-1', status: 'published', manager_id: 'usr-m-thiago', unit_id: 'u-teresina' },
  { id: 'act-2', title: 'Higiene e Manipulação de Alimentos', theme: 'Segurança Alimentar', sector_id: 'd-cozinha', target_audience: 'Cozinha', date: '2026-08-25', deadline: '2026-08-28', description: 'Quiz rápido sobre as normas de controle sanitário exigidas na cozinha do Coco Bambu.', material_id: 'doc-2', status: 'published', manager_id: 'usr-m-marcus', unit_id: 'u-teresina' }
];

const MOCK_QUESTIONS = [
  // Questions for Activity 1 (Padrão de Atendimento Especial)
  { id: 'q-1-1', activity_id: 'act-1', question_index: 0, question_text: 'Qual deve ser a primeira atitude do garçom ao receber os clientes na mesa?', option_a: 'Perguntar imediatamente qual prato principal desejam pedir.', option_b: 'Cumprimentar com sorriso, apresentar-se pelo nome e sugerir as bebidas e entradas especiais da casa.', option_c: 'Entregar o cardápio e afastar-se sem falar nada para não incomodar.', option_d: 'Trazer um copo de água sem gás imediatamente.', correct_option: 'B', explanation: 'O padrão Coco Bambu exige recepção calorosa, apresentação pessoal e incentivo ao aumento do ticket médio inicial sugerindo bebidas e entradas de imediato.', guide_id: 'doc-1' },
  { id: 'q-1-2', activity_id: 'act-1', question_index: 1, question_text: 'Ao oferecer uma entrada, qual a melhor estratégia de vendas sugestiva?', option_a: 'Perguntar se querem alguma entrada genérica.', option_b: 'Sugerir uma opção específica descrevendo os ingredientes deliciosos (ex: Pastel de Camarão com catupiry cremoso).', option_c: 'Apontar para o cardápio e mandar eles escolherem sozinhos.', option_d: 'Dizer que as entradas demoram muito para sair.', correct_option: 'B', explanation: 'Uma venda sugestiva eficaz descreve os detalhes do prato para despertar o apetite do cliente, agregando valor.', guide_id: 'doc-9' },
  { id: 'q-1-3', activity_id: 'act-1', question_index: 2, question_text: 'Se o cliente informar que tem alergia severa a camarão, o que o atendente deve fazer?', option_a: 'Ignorar, pois todos os pratos levam um pouco de camarão.', option_b: 'Indicar um prato de peixe comum e garantir verbalmente sem consultar a cozinha.', option_c: 'Registrar a alergia em destaque na comanda eletrônica, alertar pessoalmente o chefe de cozinha e sugerir pratos estritamente seguros (sem frutos do mar ou contaminação cruzada).', option_d: 'Pedir para o cliente comer em outro restaurante.', correct_option: 'C', explanation: 'Alergias alimentares são graves. O protocolo exige registro formal no pedido, comunicação direta com a cozinha e garantia de zero contaminação cruzada.', guide_id: 'doc-1' },
  { id: 'q-1-4', activity_id: 'act-1', question_index: 3, question_text: 'Como proceder em caso de reclamação do cliente sobre o ponto do prato?', option_a: 'Discutir com o cliente tentando provar que ele está errado.', option_b: 'Pedir desculpas cordialmente, retirar o prato da mesa e levar imediatamente de volta à cozinha para correção, avisando o gerente.', option_c: 'Deixar o prato na mesa e cobrar o valor integral mesmo assim.', option_d: 'Ignorar o cliente até ele ir embora.', correct_option: 'B', explanation: 'A satisfação do cliente é prioridade absoluta. O prato deve ser refeito ou corrigido com agilidade e o gerente de salão deve ser notificado.', guide_id: 'doc-1' },
  { id: 'q-1-5', activity_id: 'act-1', question_index: 4, question_text: 'Qual o tempo máximo recomendado para servir as bebidas após o pedido?', option_a: '15 minutos.', option_b: '2 minutos.', option_c: '5 minutos.', option_d: '10 minutos.', correct_option: 'C', explanation: 'O padrão de serviço determina que as bebidas cheguem frescas e geladas à mesa em no máximo 5 minutos.', guide_id: 'doc-1' },
  { id: 'q-1-6', activity_id: 'act-1', question_index: 5, question_text: 'Como deve ser feito o polimento dos talheres?', option_a: 'Com pano de prato seco comum e sabão de pia.', option_b: 'Com pano de microfibra limpo e álcool 70% adequado para salão de restaurante.', option_c: 'Não há necessidade de polimento.', option_d: 'Lavando apenas em água corrente quente.', correct_option: 'B', explanation: 'O polimento com álcool 70% remove manchas de água e dedadas, garantindo brilho e higiene impecáveis.', guide_id: 'doc-7' },
  { id: 'q-1-7', activity_id: 'act-1', question_index: 6, question_text: 'Qual a técnica correta para servir uma garrafa de vinho à mesa?', option_a: 'Abrir a garrafa longe da mesa e derramar rapidamente.', option_b: 'Apresentar o rótulo ao cliente que pediu, abrir na mesa com cuidado, servir uma pequena dose para degustação e, após aprovação, servir as taças no sentido horário.', option_c: 'Mandar o próprio cliente abrir o vinho.', option_d: 'Encher todas as taças até a boca sem pedir autorização.', correct_option: 'B', explanation: 'O ritual do vinho demonstra sofisticação e profissionalismo do serviço Coco Bambu.', guide_id: 'doc-1' },
  { id: 'q-1-8', activity_id: 'act-1', question_index: 7, question_text: 'Qual a postura física ideal para o garçom no salão durante o plantão?', option_a: 'Braços cruzados, apoiado na parede ou mexendo no celular.', option_b: 'Postura ereta, ombros relaxados, braços ao lado do corpo ou atrás, atento aos sinais de contato visual de qualquer cliente da sua praça.', option_c: 'Sentar-se nas mesas vazias para descansar.', option_d: 'Correr o tempo todo para mostrar serviço.', correct_option: 'B', explanation: 'A postura corporal reflete a prontidão e respeito do colaborador com o cliente. Aparelhos celulares são proibidos no salão.', guide_id: 'doc-1' },
  { id: 'q-1-9', activity_id: 'act-1', question_index: 8, question_text: 'Como devemos proceder no fechamento da conta de uma mesa dividida?', option_a: 'Exigir que paguem tudo em uma única transação obrigatoriamente.', option_b: 'Dividir o valor total igualmente pelo número de pagantes conforme solicitado, operando as máquinas de cartão com cordialidade e precisão.', option_c: 'Cobrar uma taxa extra por dividir a conta.', option_d: 'Recusar a divisão de contas aos fins de semana.', correct_option: 'B', explanation: 'Facilitar a forma de pagamento é um diferencial de serviço. Dividir a conta faz parte do atendimento padrão de mesas.', guide_id: 'doc-1' },
  { id: 'q-1-10', activity_id: 'act-1', question_index: 9, question_text: 'Ao fechar o atendimento, o que o garçom deve falar para os clientes ao se despedir?', option_a: 'Dizer apenas: "Obrigado, tchau".', option_b: 'Agradecer a preferência, perguntar se a experiência foi satisfatória e convidá-los a retornar em breve mencionando novidades.', option_c: 'Pedir gorjeta adicional constrangedoramente.', option_d: 'Apenas retirar os pratos e deixar que saiam sós.', correct_option: 'B', explanation: 'A despedida positiva fecha a experiência do cliente com chave de ouro, estimulando a fidelização.', guide_id: 'doc-1' },

  // Questions for Activity 2 (Higiene e Manipulação de Alimentos)
  { id: 'q-2-1', activity_id: 'act-2', question_index: 0, question_text: 'Qual a temperatura limite recomendada para conservação de pescados resfriados?', option_a: 'Até 10°C.', option_b: 'Entre 0°C e 4°C.', option_c: 'Congelados a 0°C.', option_d: 'Temperatura ambiente até 2 horas.', correct_option: 'B', explanation: 'Os peixes e camarões devem ser armazenados sob refrigeração entre 0°C e no máximo 4°C para retardar o crescimento bacteriano.', guide_id: 'doc-3' },
  { id: 'q-2-2', activity_id: 'act-2', question_index: 1, question_text: 'Qual a forma adequada de realizar o descongelamento de camarões na cozinha?', option_a: 'Colocar na pia sob água corrente quente.', option_b: 'Deixar na bancada da cozinha em temperatura ambiente da noite para o dia.', option_c: 'Sempre dentro da geladeira (sob refrigeração lenta a no máximo 4°C) ou no microondas se for preparar imediatamente.', option_d: 'Descongelar diretamente na chapa quente.', correct_option: 'C', explanation: 'O descongelamento em temperatura ambiente ativa a proliferação bacteriana acelerada nas partes externas do alimento antes que o centro descongela.', guide_id: 'doc-3' },
  { id: 'q-2-3', activity_id: 'act-2', question_index: 2, question_text: 'Com que frequência os manipuladores de alimentos devem lavar as mãos?', option_a: 'Apenas ao chegar no trabalho e após usar o banheiro.', option_b: 'A cada 2 horas ou sempre que trocar de tarefa, tocar em lixo, em utensílios sujos ou em alimentos crus.', option_c: 'Uma vez por turno é o suficiente.', option_d: 'Somente se as mãos estiverem visivelmente sujas.', correct_option: 'B', explanation: 'A lavagem frequente das mãos com sabonete antisséptico previne a contaminação cruzada física e microbiológica.', guide_id: 'doc-6' },
  { id: 'q-2-4', activity_id: 'act-2', question_index: 3, question_text: 'Qual produto químico é obrigatório para sanitização de verduras que serão consumidas cruas?', option_a: 'Detergente neutro comum.', option_b: 'Cloro ou solução clorada própria para alimentos de grau alimentício por 15 minutos.', option_c: 'Apenas água morna corrente.', option_d: 'Vinagre de álcool.', correct_option: 'B', explanation: 'A solução clorada elimina micro-organismos patogênicos presentes em hortaliças que não passarão por processo de cocção.', guide_id: 'doc-2' },
  { id: 'q-2-5', activity_id: 'act-2', question_index: 4, question_text: 'O que caracteriza a contaminação cruzada na cozinha?', option_a: 'Usar facas limpas em tábuas diferentes.', option_b: 'A transferência de micróbios de um alimento cru ou superfície suja para um alimento cozido ou pronto para consumo (ex: cortar frango cru e depois tomate na mesma tábua sem higienizar).', option_c: 'Misturar temperos diferentes no mesmo prato.', option_d: 'Armazenar arroz e feijão cozidos juntos.', correct_option: 'B', explanation: 'Contaminação cruzada é o principal risco em cozinhas profissionais, e tábuas coloridas de corte devem ser respeitadas rigorosamente.', guide_id: 'doc-2' },
  { id: 'q-2-6', activity_id: 'act-2', question_index: 5, question_text: 'Qual o calçado de uso obrigatório na cozinha?', option_a: 'Tênis esportivo confortável.', option_b: 'Sapato fechado, impermeável e com solado antiderrapante certificado (ex: Soft Works).', option_c: 'Qualquer sandália de borracha.', option_d: 'Sapatênis casual.', correct_option: 'B', explanation: 'Sapatos impermeáveis antiderrapantes protegem contra queimaduras de óleo/água quente e previnem quedas em pisos úmidos.', guide_id: 'doc-6' },
  { id: 'q-2-7', activity_id: 'act-2', question_index: 6, question_text: 'Pessoas com adornos (anéis, relógios, pulseiras) podem manipular alimentos diretamente?', option_a: 'Sim, se usarem luvas por cima.', option_b: 'Não. É expressamente proibido o uso de qualquer adorno na área de manipulação devido ao risco de contaminação física e abrigo de bactérias.', option_c: 'Somente se for aliança de casamento lisa.', option_d: 'Apenas o chefe de cozinha está liberado.', correct_option: 'B', explanation: 'Segundo a RDC 216 da ANVISA, adornos acumulam sujidades e podem cair acidentalmente nos pratos, sendo proibidos para todos.', guide_id: 'doc-6' },
  { id: 'q-2-8', activity_id: 'act-2', question_index: 7, question_text: 'Qual o procedimento adequado ao manusear a lixeira da cozinha?', option_a: 'A lixeira deve possuir pedal para abertura sem toque das mãos, saco plástico resistente e deve-se lavar as mãos imediatamente após descartar o lixo.', option_b: 'Abrir a lixeira com as mãos e continuar manipulando alimentos normalmente.', option_c: 'Deixar a lixeira sempre aberta para facilitar o descarte.', option_d: 'Lavar a lixeira com sabão de pia uma vez por mês.', correct_option: 'A', explanation: 'Lixeiras de acionamento por pedal reduzem contatos manuais, e higienizar as mãos após descartar o lixo é regra primária.', guide_id: 'doc-6' },
  { id: 'q-2-9', activity_id: 'act-2', question_index: 8, question_text: 'Onde devem ser guardados produtos químicos de limpeza na unidade?', option_a: 'Embaixo da bancada de preparação de pratos.', option_b: 'Em armário ou depósito específico separado, trancado e identificado, longe da estocagem de insumos alimentares.', option_c: 'Na prateleira superior da despensa seca.', option_d: 'Próximo às caixas de legumes.', correct_option: 'B', explanation: 'O isolamento químico previne contaminações acidentais graves nos alimentos por respingos ou confusão de frascos.', guide_id: 'doc-2' },
  { id: 'q-2-10', activity_id: 'act-2', question_index: 9, question_text: 'Qual a validade de um produto que foi aberto e transferido para um recipiente organizador?', option_a: 'A mesma validade da embalagem original mesmo aberta.', option_b: 'Máximo 3 dias sob refrigeração com etiqueta constando nome do produto, data de abertura, validade de uso e lote.', option_c: 'Não precisa de etiqueta se o cozinheiro souber o que é.', option_d: 'Validade indefinida se guardado no freezer.', correct_option: 'B', explanation: 'Todo alimento fracionado ou aberto deve ser etiquetado conforme as regras sanitárias, limitando-se ao prazo do fabricante para produto aberto ou limite da vigilância local.', guide_id: 'doc-2' }
];

// Activity Assignments (Pre-seeding responses for statistics)
const MOCK_ASSIGNMENTS = [
  // Assignments for act-1 (Thiago's team)
  { id: 'asg-1', activity_id: 'act-1', user_id: 'usr-emp-joao', status: 'completed', completion_date: '2026-08-25T11:20:00Z', score: 9, max_score: 10 },
  { id: 'asg-2', activity_id: 'act-1', user_id: 'usr-emp-lucas', status: 'completed', completion_date: '2026-08-25T12:05:00Z', score: 8, max_score: 10 },
  { id: 'asg-3', activity_id: 'act-1', user_id: 'usr-emp-pedro', status: 'completed', completion_date: '2026-08-25T12:40:00Z', score: 6, max_score: 10 },
  { id: 'asg-4', activity_id: 'act-1', user_id: 'usr-emp-ana', status: 'pending', completion_date: null, score: null, max_score: 10 },
  
  // Assignments for act-2 (Marcus's team)
  { id: 'asg-5', activity_id: 'act-2', user_id: 'usr-emp-maria', status: 'completed', completion_date: '2026-08-25T10:15:00Z', score: 8, max_score: 10 },
  { id: 'asg-6', activity_id: 'act-2', user_id: 'usr-emp-jose', status: 'completed', completion_date: '2026-08-25T10:50:00Z', score: 10, max_score: 10 },
  { id: 'asg-7', activity_id: 'act-2', user_id: 'usr-emp-bruno', status: 'pending', completion_date: null, score: null, max_score: 10 }
];

const MOCK_ANSWERS = [
  // Joao got 9/10: missed Q7 (ritual do vinho)
  { id: 'ans-1-1', assignment_id: 'asg-1', question_id: 'q-1-1', chosen_option: 'B', is_correct: true },
  { id: 'ans-1-2', assignment_id: 'asg-1', question_id: 'q-1-2', chosen_option: 'B', is_correct: true },
  { id: 'ans-1-3', assignment_id: 'asg-1', question_id: 'q-1-3', chosen_option: 'C', is_correct: true },
  { id: 'ans-1-4', assignment_id: 'asg-1', question_id: 'q-1-4', chosen_option: 'B', is_correct: true },
  { id: 'ans-1-5', assignment_id: 'asg-1', question_id: 'q-1-5', chosen_option: 'C', is_correct: true },
  { id: 'ans-1-6', assignment_id: 'asg-1', question_id: 'q-1-6', chosen_option: 'B', is_correct: true },
  { id: 'ans-1-7', assignment_id: 'asg-1', question_id: 'q-1-7', chosen_option: 'D', is_correct: false }, // WRONG
  { id: 'ans-1-8', assignment_id: 'asg-1', question_id: 'q-1-8', chosen_option: 'B', is_correct: true },
  { id: 'ans-1-9', assignment_id: 'asg-1', question_id: 'q-1-9', chosen_option: 'B', is_correct: true },
  { id: 'ans-1-10', assignment_id: 'asg-1', question_id: 'q-1-10', chosen_option: 'B', is_correct: true },

  // Lucas got 8/10: missed Q7 and Q8 (postura física)
  { id: 'ans-2-1', assignment_id: 'asg-2', question_id: 'q-1-1', chosen_option: 'B', is_correct: true },
  { id: 'ans-2-2', assignment_id: 'asg-2', question_id: 'q-1-2', chosen_option: 'B', is_correct: true },
  { id: 'ans-2-3', assignment_id: 'asg-2', question_id: 'q-1-3', chosen_option: 'C', is_correct: true },
  { id: 'ans-2-4', assignment_id: 'asg-2', question_id: 'q-1-4', chosen_option: 'B', is_correct: true },
  { id: 'ans-2-5', assignment_id: 'asg-2', question_id: 'q-1-5', chosen_option: 'C', is_correct: true },
  { id: 'ans-2-6', assignment_id: 'asg-2', question_id: 'q-1-6', chosen_option: 'B', is_correct: true },
  { id: 'ans-2-7', assignment_id: 'asg-2', question_id: 'q-1-7', chosen_option: 'A', is_correct: false }, // WRONG
  { id: 'ans-2-8', assignment_id: 'asg-2', question_id: 'q-1-8', chosen_option: 'A', is_correct: false }, // WRONG
  { id: 'ans-2-9', assignment_id: 'asg-2', question_id: 'q-1-9', chosen_option: 'B', is_correct: true },
  { id: 'ans-2-10', assignment_id: 'asg-2', question_id: 'q-1-10', chosen_option: 'B', is_correct: true },

  // Pedro got 6/10: missed Q3 (alergia), Q5 (tempo de bebida), Q7 (ritual do vinho), Q8 (postura física)
  { id: 'ans-3-1', assignment_id: 'asg-3', question_id: 'q-1-1', chosen_option: 'B', is_correct: true },
  { id: 'ans-3-2', assignment_id: 'asg-3', question_id: 'q-1-2', chosen_option: 'B', is_correct: true },
  { id: 'ans-3-3', assignment_id: 'asg-3', question_id: 'q-1-3', chosen_option: 'B', is_correct: false }, // WRONG
  { id: 'ans-3-4', assignment_id: 'asg-3', question_id: 'q-1-4', chosen_option: 'B', is_correct: true },
  { id: 'ans-3-5', assignment_id: 'asg-3', question_id: 'q-1-5', chosen_option: 'A', is_correct: false }, // WRONG
  { id: 'ans-3-6', assignment_id: 'asg-3', question_id: 'q-1-6', chosen_option: 'B', is_correct: true },
  { id: 'ans-3-7', assignment_id: 'asg-3', question_id: 'q-1-7', chosen_option: 'A', is_correct: false }, // WRONG
  { id: 'ans-3-8', assignment_id: 'asg-3', question_id: 'q-1-8', chosen_option: 'C', is_correct: false }, // WRONG
  { id: 'ans-3-9', assignment_id: 'asg-3', question_id: 'q-1-9', chosen_option: 'B', is_correct: true },
  { id: 'ans-3-10', assignment_id: 'asg-3', question_id: 'q-1-10', chosen_option: 'B', is_correct: true },

  // Cozinha: Maria got 8/10: missed Q2 (descongelamento) and Q5 (contaminação cruzada)
  { id: 'ans-5-1', assignment_id: 'asg-5', question_id: 'q-2-1', chosen_option: 'B', is_correct: true },
  { id: 'ans-5-2', assignment_id: 'asg-5', question_id: 'q-2-2', chosen_option: 'B', is_correct: false }, // WRONG
  { id: 'ans-5-3', assignment_id: 'asg-5', question_id: 'q-2-3', chosen_option: 'B', is_correct: true },
  { id: 'ans-5-4', assignment_id: 'asg-5', question_id: 'q-2-4', chosen_option: 'B', is_correct: true },
  { id: 'ans-5-5', assignment_id: 'asg-5', question_id: 'q-2-5', chosen_option: 'A', is_correct: false }, // WRONG
  { id: 'ans-5-6', assignment_id: 'asg-5', question_id: 'q-2-6', chosen_option: 'B', is_correct: true },
  { id: 'ans-5-7', assignment_id: 'asg-5', question_id: 'q-2-7', chosen_option: 'B', is_correct: true },
  { id: 'ans-5-8', assignment_id: 'asg-5', question_id: 'q-2-8', chosen_option: 'A', is_correct: true },
  { id: 'ans-5-9', assignment_id: 'asg-5', question_id: 'q-2-9', chosen_option: 'B', is_correct: true },
  { id: 'ans-5-10', assignment_id: 'asg-5', question_id: 'q-2-10', chosen_option: 'B', is_correct: true }
];

// Seed Work Schedules
// Generates weekly schedules for 24-Aug-2026 to 30-Aug-2026
const MOCK_SCHEDULES = [];
const days = ['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28', '2026-08-29', '2026-08-30'];
MOCK_USERS.forEach((usr, uIdx) => {
  if (usr.role === 'funcionario') {
    days.forEach((day, dIdx) => {
      const isOff = (uIdx + dIdx) % 7 === 0;
      const shift = uIdx % 2 === 0 ? 'Almoço' : 'Jantar';
      const hours = shift === 'Almoço' ? '08:00 - 16:00' : '15:00 - 23:00';
      MOCK_SCHEDULES.push({
        id: `sch-${usr.id}-${day}`,
        user_id: usr.id,
        date: day,
        shift: isOff ? 'Folga' : shift,
        hours: isOff ? 'Folga' : hours,
        off_day: isOff
      });
    });
  }
});

// Seed Performance Evaluations
const MOCK_EVALUATIONS = [
  { id: 'ev-1', employee_id: 'usr-emp-joao', manager_id: 'usr-m-thiago', period: 'Agosto 2026', positives: 'Ótima simpatia com os clientes, excelente assiduidade e facilidade em vender vinhos.', improvements: 'Precisamos atentar para o ritual do vinho na mesa, por vezes esquece de oferecer a dose de prova.', remarks: 'Colaborador de grande valor no salão.', training_needed: 'Ritual de Serviço de Vinhos e Bebidas Especiais', feedback: 'O feedback foi passado individualmente no alinhamento semanal.', date: '2026-08-22' },
  { id: 'ev-2', employee_id: 'usr-emp-maria', manager_id: 'usr-m-marcus', period: 'Agosto 2026', positives: 'Cozinheira extremamente veloz, caprichosa e mantém os pratos no padrão visual de empratamento.', improvements: 'Precisa redobrar a atenção nas regras de etiquetagem de pescados abertos e controle de contaminação cruzada nas bancadas de legumes.', remarks: 'Demonstra muito interesse em crescer na empresa.', training_needed: 'Higiene e Manipulação de Alimentos Nível Avançado', feedback: 'Muito aberta a aprender novas técnicas e aplicar os guias.', date: '2026-08-23' }
];

// Seed Notifications
const MOCK_NOTIFICATIONS = [
  { id: 'nt-1', user_id: 'usr-emp-joao', message: 'Nova atividade de atendimento publicada!', is_read: false, date: '2026-08-25T09:00:00Z', type: 'activity' },
  { id: 'nt-2', user_id: 'usr-emp-maria', message: 'Treinamento de Higiene e Segurança agendado para 28/Ago.', is_read: false, date: '2026-08-25T09:10:00Z', type: 'training' },
  { id: 'nt-3', user_id: 'usr-emp-bruno', message: 'Você possui uma atividade pendente.', is_read: false, date: '2026-08-25T09:15:00Z', type: 'activity' }
];

// Database operations class/helper
class LocalSupabaseMock {
  constructor() {
    this.init();
  }

  init() {
    this.checkAndSeed('companies', MOCK_COMPANIES);
    this.checkAndSeed('units', MOCK_UNITS);
    this.checkAndSeed('departments', MOCK_DEPARTMENTS);
    this.checkAndSeed('positions', MOCK_POSITIONS);
    this.checkAndSeed('users', MOCK_USERS);
    this.checkAndSeed('documents', MOCK_DOCUMENTS);
    this.checkAndSeed('trainings', MOCK_TRAININGS);
    this.checkAndSeed('warmups', MOCK_WARMUPS);
    this.checkAndSeed('activities', MOCK_ACTIVITIES);
    this.checkAndSeed('questions', MOCK_QUESTIONS);
    this.checkAndSeed('activity_assignments', MOCK_ASSIGNMENTS);
    this.checkAndSeed('answers', MOCK_ANSWERS);
    this.checkAndSeed('work_schedules', MOCK_SCHEDULES);
    this.checkAndSeed('evaluations', MOCK_EVALUATIONS);
    this.checkAndSeed('notifications', MOCK_NOTIFICATIONS);

    // Initial Active User
    if (!localStorage.getItem(DB_KEY_PREFIX + 'current_user')) {
      localStorage.setItem(DB_KEY_PREFIX + 'current_user', null);
    }
  }

  checkAndSeed(key, defaultData) {
    const fullKey = DB_KEY_PREFIX + key;
    const existing = localStorage.getItem(fullKey);
    if (!existing || (key === 'units' && existing.includes('u-anhembi')) || (key === 'users' && existing.includes('u-anhembi'))) {
      localStorage.setItem(fullKey, JSON.stringify(defaultData));
    }
  }

  getTable(key) {
    const fullKey = DB_KEY_PREFIX + key;
    try {
      return JSON.parse(localStorage.getItem(fullKey)) || [];
    } catch (e) {
      console.error(`Error loading table ${key}:`, e);
      return [];
    }
  }

  saveTable(key, data) {
    const fullKey = DB_KEY_PREFIX + key;
    localStorage.setItem(fullKey, JSON.stringify(data));
  }

  // --- AUTH ---
  login(email, password) {
    const users = this.getTable('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      if (user.status !== 'active') {
        return { success: false, message: 'Usuário inativo. Contate o administrador.' };
      }
      localStorage.setItem(DB_KEY_PREFIX + 'current_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: 'E-mail ou senha inválidos.' };
  }

  logout() {
    localStorage.setItem(DB_KEY_PREFIX + 'current_user', null);
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEY_PREFIX + 'current_user'));
    } catch (e) {
      return null;
    }
  }

  resetPassword(email) {
    const users = this.getTable('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      // In a real application this would trigger an email. Here we simulate success.
      return { success: true, message: `Um link de recuperação foi enviado para ${email}.` };
    }
    return { success: false, message: 'E-mail não cadastrado em nosso sistema.' };
  }

  // --- GENERIC CRUD HELPERS ---
  getAll(table) {
    return this.getTable(table);
  }

  getById(table, id) {
    return this.getTable(table).find(item => item.id === id);
  }

  save(table, item) {
    const list = this.getTable(table);
    if (!item.id) {
      item.id = `${table.substring(0, 3)}-${Date.now()}`;
      list.push(item);
    } else {
      const idx = list.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
      } else {
        list.push(item);
      }
    }
    this.saveTable(table, list);
    return item;
  }

  delete(table, id) {
    const list = this.getTable(table);
    const filtered = list.filter(item => item.id !== id);
    this.saveTable(table, filtered);
    return true;
  }

  // --- CUSTOM COMPLEX QUERIES & RELATIONSHIPS ---

  // Get active activities for employee, injecting employee specific assignment status
  getEmployeeActivities(userId) {
    const user = this.getById('users', userId);
    if (!user) return [];

    const activities = this.getTable('activities').filter(act => 
      act.status === 'published' &&
      (user.role === 'admin' || act.unit_id === user.unit_id || !act.unit_id) &&
      (user.role === 'admin' || act.target_audience === 'Todos' || act.sector_id === user.department_id)
    );

    const assignments = this.getTable('activity_assignments').filter(asg => asg.user_id === userId);

    return activities.map(act => {
      const asg = assignments.find(a => a.activity_id === act.id);
      return {
        ...act,
        assignment_id: asg ? asg.id : null,
        status_assignment: asg ? asg.status : 'pending',
        score: asg ? asg.score : null,
        max_score: asg ? asg.max_score : 10,
        completion_date: asg ? asg.completion_date : null
      };
    });
  }

  // Submit employee answers for an activity
  submitActivity(userId, activityId, answersList) {
    const assignments = this.getTable('activity_assignments');
    const questions = this.getTable('questions').filter(q => q.activity_id === activityId);
    
    // Find or create assignment
    let asg = assignments.find(a => a.activity_id === activityId && a.user_id === userId);
    if (!asg) {
      asg = {
        id: `asg-${Date.now()}`,
        activity_id: activityId,
        user_id: userId,
        status: 'pending',
        completion_date: null,
        score: null,
        max_score: 10
      };
      assignments.push(asg);
    }

    if (asg.status === 'completed') {
      return { success: false, message: 'Atividade já concluída.' };
    }

    // Save answers & score
    const answers = this.getTable('answers');
    let score = 0;

    answersList.forEach(ans => {
      const question = questions.find(q => q.id === ans.question_id);
      const isCorrect = question ? question.correct_option === ans.chosen_option : false;
      if (isCorrect) score++;

      answers.push({
        id: `ans-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        assignment_id: asg.id,
        question_id: ans.question_id,
        chosen_option: ans.chosen_option,
        is_correct: isCorrect
      });
    });

    asg.status = 'completed';
    asg.completion_date = new Date().toISOString();
    asg.score = score;
    asg.max_score = questions.length || 10;

    // Update assignment in storage
    const idx = assignments.findIndex(a => a.id === asg.id);
    assignments[idx] = asg;

    this.saveTable('activity_assignments', assignments);
    this.saveTable('answers', answers);

    // Create a notification for the manager
    const activity = this.getById('activities', activityId);
    const user = this.getById('users', userId);
    if (activity && user) {
      this.save('notifications', {
        user_id: activity.manager_id,
        message: `${user.name} concluiu a atividade "${activity.title}" com nota ${score}/10.`,
        is_read: false,
        date: new Date().toISOString(),
        type: 'result'
      });
    }

    return { success: true, assignment: asg, score, total: questions.length };
  }

  // Get activity details with answers for review
  getAssignmentDetails(assignmentId) {
    const asg = this.getById('activity_assignments', assignmentId);
    if (!asg) return null;

    const activity = this.getById('activities', asg.activity_id);
    const questions = this.getTable('questions').filter(q => q.activity_id === asg.activity_id);
    const answers = this.getTable('answers').filter(ans => ans.assignment_id === asg.id);

    const questionsWithAnswers = questions.map(q => {
      const ans = answers.find(a => a.question_id === q.id);
      return {
        ...q,
        chosen_option: ans ? ans.chosen_option : null,
        is_correct: ans ? ans.is_correct : false
      };
    });

    return {
      assignment: asg,
      activity,
      questions: questionsWithAnswers
    };
  }

  // Get statistics for gestor dashboard
  getManagerStats(managerId) {
    const manager = this.getById('users', managerId);
    if (!manager) return null;

    // Gestor can see users of their own unit (Coco Bambu Anhembi or Market Place)
    const teamUsers = this.getTable('users').filter(u => u.unit_id === manager.unit_id && u.role === 'funcionario');
    const teamUserIds = teamUsers.map(u => u.id);

    const warmups = this.getTable('warmups').filter(w => w.unit_id === manager.unit_id);
    const activities = this.getTable('activities').filter(a => a.manager_id === managerId || (a.unit_id === manager.unit_id && a.status === 'published'));
    
    // Calculate stats for each activity
    const assignments = this.getTable('activity_assignments').filter(asg => teamUserIds.includes(asg.user_id));
    
    const activitiesStats = activities.map(act => {
      const actAsgs = assignments.filter(asg => asg.activity_id === act.id);
      const completed = actAsgs.filter(asg => asg.status === 'completed');
      const totalGraded = completed.length;
      
      let average = 0;
      if (totalGraded > 0) {
        const sum = completed.reduce((acc, a) => acc + a.score, 0);
        average = parseFloat((sum / totalGraded).toFixed(1));
      }

      return {
        ...act,
        total_assigned: teamUsers.length,
        completed: totalGraded,
        pending: teamUsers.length - totalGraded,
        average_score: average
      };
    });

    // Calculate question error rates for attention points
    // Let's gather all answers for this manager's unit activities
    const actIds = activities.map(a => a.id);
    const activeQuestions = this.getTable('questions').filter(q => actIds.includes(q.activity_id));
    const activeAnswers = this.getTable('answers').filter(ans => {
      const assignment = this.getById('activity_assignments', ans.assignment_id);
      return assignment && actIds.includes(assignment.activity_id) && teamUserIds.includes(assignment.user_id);
    });

    const questionAttentionPoints = activeQuestions.map(q => {
      const qAnswers = activeAnswers.filter(ans => ans.question_id === q.id);
      const total = qAnswers.length;
      const wrong = qAnswers.filter(ans => !ans.is_correct).length;
      const errorRate = total > 0 ? Math.round((wrong / total) * 100) : 0;
      const activity = activities.find(a => a.id === q.activity_id);
      
      return {
        question_id: q.id,
        question_text: q.question_text,
        activity_title: activity ? activity.title : '',
        error_rate: errorRate,
        total_answers: total,
        wrong_count: wrong
      };
    }).filter(q => q.error_rate > 0).sort((a, b) => b.error_rate - a.error_rate);

    return {
      total_team: teamUsers.length,
      active_team: teamUsers.filter(u => u.status === 'active').length,
      warmups_count: warmups.length,
      activities: activitiesStats,
      attention_points: questionAttentionPoints.slice(0, 5) // Top 5 problematic questions
    };
  }

  // Get consolidated admin stats
  getAdminStats() {
    const users = this.getTable('users');
    const units = this.getTable('units');
    const departments = this.getTable('departments');
    const activities = this.getTable('activities');
    const assignments = this.getTable('activity_assignments').filter(a => a.status === 'completed');

    const totalActiveUsers = users.filter(u => u.status === 'active' && u.role === 'funcionario').length;
    const totalGestores = users.filter(u => u.role === 'gestor').length;
    const totalUnits = units.length;

    let averageScore = 0;
    if (assignments.length > 0) {
      const sum = assignments.reduce((acc, a) => acc + a.score, 0);
      averageScore = parseFloat((sum / assignments.length).toFixed(1));
    }

    return {
      active_employees: totalActiveUsers,
      gestores_count: totalGestores,
      units_count: totalUnits,
      activities_count: activities.length,
      assignments_completed: assignments.length,
      general_average: averageScore,
      by_unit: units.map(un => {
        const unitUsers = users.filter(u => u.unit_id === un.id && u.role === 'funcionario').map(u => u.id);
        const unitAsgs = assignments.filter(asg => unitUsers.includes(asg.user_id));
        let avg = 0;
        if (unitAsgs.length > 0) {
          avg = parseFloat((unitAsgs.reduce((acc, a) => acc + a.score, 0) / unitAsgs.length).toFixed(1));
        }
        return {
          unit_name: un.name,
          completions: unitAsgs.length,
          average: avg
        };
      })
    };
  }

  // Manage work schedules for entire team (Gestor)
  saveWorkSchedules(schedules) {
    const list = this.getTable('work_schedules');
    schedules.forEach(newSch => {
      const idx = list.findIndex(s => s.user_id === newSch.user_id && s.date === newSch.date);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...newSch };
      } else {
        if (!newSch.id) newSch.id = `sch-${newSch.user_id}-${newSch.date}`;
        list.push(newSch);
      }
    });
    this.saveTable('work_schedules', list);
    return true;
  }
}

// Singleton Instance
export const db = new LocalSupabaseMock();
export default db;
