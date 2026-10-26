/* BlocoLab — as 10 aulas
   Cada aula tem: teoria, um exemplo comentado, desafios (com solução de referência)
   e orientações para o professor. */
(function (global) {
  'use strict';

  /* Atalhos para escrever programas de blocos */
  const B = {
    av: () => ({ t: 'avancar' }), esq: () => ({ t: 'esquerda' }), dir: () => ({ t: 'direita' }), pegar: () => ({ t: 'pegar' }),
    andar: n => ({ t: 'andar', f: { n: String(n) } }),
    ge: g => ({ t: 'girar_esq', f: { g: String(g) } }),
    gd: g => ({ t: 'girar_dir', f: { g: String(g) } }),
    cor: c => ({ t: 'cor', f: { cor: c } }),
    caneta: p => ({ t: 'caneta', f: { p } }),
    rep: (n, c) => ({ t: 'repetir', f: { n: String(n) }, c }),
    conte: (v, a, b, c) => ({ t: 'contar', f: { v, a: String(a), b: String(b) }, c }),
    se: (cond, c) => ({ t: 'se', f: { c: cond }, c }),
    sese: (cond, c, e) => ({ t: 'se_senao', f: { c: cond }, c, e }),
    enq: (cond, c) => ({ t: 'enquanto', f: { c: cond }, c }),
    ate: (cond, c) => ({ t: 'repita_ate', f: { c: cond }, c }),
    def: (v, x) => ({ t: 'definir', f: { v, x: String(x) } }),
    mud: (v, x) => ({ t: 'mudar', f: { v, x: String(x) } }),
    mos: x => ({ t: 'mostrar', f: { x: String(x) } }),
    perg: (txt, v) => ({ t: 'perguntar', f: { txt, v } }),
    fn: (nome, p, c) => ({ t: 'funcao', f: { nome, p }, c }),
    usar: (nome, a) => ({ t: 'usar', f: { nome, a: String(a) } })
  };
  /* repete uma sequência de blocos n vezes (para soluções "sem laço") */
  function x(n, ...bs) { const r = []; for (let i = 0; i < n; i++) bs.forEach(b => r.push(JSON.parse(JSON.stringify(b)))); return r; }
  const { av, esq, dir, pegar } = B;

  const ROBO = ['avancar', 'esquerda', 'direita', 'pegar'];
  const TART = ['andar', 'girar_esq', 'girar_dir', 'repetir', 'cor'];
  const AZUL = '#2563eb', VERDE = '#16a34a', ROXO = '#7c3aed', VERM = '#dc2626', LARANJA = '#ea580c';

  const AULAS = [
    /* =================================================================== */
    {
      n: 1, icone: '🤖', titulo: 'Algoritmos: uma instrução de cada vez', conceito: 'Sequência',
      mundo: 'grade', blocos: ROBO,
      teoria: `
<p>Um <b>algoritmo</b> é uma sequência de instruções, numa ordem definida, para resolver um problema. A receita de um bolo, o caminho de casa até a escola e as regras de um jogo são algoritmos.</p>
<p>O computador não adivinha o que queremos: ele executa <b>exatamente</b> o que está escrito, <b>na ordem</b> em que está escrito. Escrever essas instruções numa linguagem que a máquina entende é <b>programar</b>.</p>
<p>Aqui, a linguagem é feita de <b>blocos</b>. Cada bloco é uma instrução para o robô:</p>
<ul>
<li><b>avançar</b> — anda uma casa para a frente;</li>
<li><b>virar à esquerda / à direita</b> — gira no lugar, sem sair da casa;</li>
<li><b>pegar moeda</b> — recolhe a moeda da casa onde o robô está.</li>
</ul>
<p class="atencao">⚠️ Esquerda e direita são do ponto de vista do <b>robô</b> (para onde o nariz dele aponta), e não de quem olha a tela!</p>
<p><b>Como montar:</b> toque num bloco da paleta para colocá-lo no programa. A faixa verde mostra <b>onde o próximo bloco vai entrar</b>; toque entre dois blocos (ou em cima de um bloco) para mudar esse lugar. Use ↑ ↓ para mover e ✕ para apagar.</p>`,
      exemplo: {
        titulo: 'Primeiros passos',
        texto: 'Este programa já está montado. Toque em <b>▶ Executar</b> e acompanhe: o bloco que está sendo executado fica destacado. Depois, troque a ordem de dois blocos e execute de novo. O que acontece?',
        mapa: ['>..#', '##.*'],
        inicial: [av(), av(), dir(), av(), esq(), av()],
        solucao: [av(), av(), dir(), av(), esq(), av()]
      },
      desafios: [
        {
          titulo: 'Em linha reta',
          texto: 'Leve o robô até a estrela ⭐.',
          mapa: ['......', '>....*', '......'],
          solucao: x(5, av()),
          dica: 'Conte quantas casas existem entre o robô e a estrela.'
        },
        {
          titulo: 'Fazendo a curva',
          texto: 'Agora o caminho tem curvas. Lembre: a esquerda e a direita são as <b>do robô</b>.',
          mapa: ['>..#', '##.#', '##.#', '##.*'],
          solucao: [av(), av(), dir(), av(), av(), av(), esq(), av()],
          dica: 'Quando o robô está andando para baixo, a esquerda dele fica à direita da tela! Gire o tablet ou use a mão para imaginar.'
        },
        {
          titulo: 'Pegue a moeda',
          texto: 'Recolha a moeda 🪙 e depois vá até a estrela. Todas as moedas precisam ser recolhidas!',
          mapa: ['#####', '>.o.#', '###.#', '*...#'],
          solucao: [av(), av(), pegar(), av(), dir(), av(), av(), dir(), av(), av(), av()],
          dica: 'O bloco "pegar moeda" só funciona quando o robô está em cima da moeda.'
        },
        {
          titulo: 'Duas moedas',
          texto: 'Recolha as duas moedas e termine na estrela.',
          mapa: ['>.o..', '####.', '*.o..'],
          solucao: [av(), av(), pegar(), av(), av(), dir(), av(), av(), dir(), av(), av(), pegar(), av(), av()],
          dica: 'Planeje antes de montar: passe o dedo pelo caminho e diga em voz alta cada instrução.'
        }
      ],
      professor: {
        objetivos: ['Compreender algoritmo como sequência finita e ordenada de instruções.', 'Perceber que a ordem das instruções altera o resultado.', 'Distinguir referencial do robô e referencial do observador (lateralidade).'],
        desplugada: '“Robô humano”: um estudante de olhos vendados é o robô; a turma dá comandos apenas com “avance 1 passo”, “vire à esquerda”, “vire à direita” para levá-lo até um objeto na sala. Discuta: o que aconteceu quando um comando foi ambíguo ou fora de ordem?',
        roteiro: ['10 min — atividade desplugada do robô humano.', '5 min — explorar o Exemplo no tablet (executar, trocar a ordem dos blocos).', '25 min — desafios 1 a 4 em duplas (um monta, o outro confere o caminho com o dedo; trocar a cada desafio).', '5 min — socialização: “o que é um algoritmo?”'],
        matematica: 'Orientação e deslocamento no plano, giros de 90° (quarto de volta), lateralidade e mudança de referencial.',
        fechamento: 'Peça exemplos de algoritmos do cotidiano e pergunte: o computador “entende” o que queremos ou apenas segue instruções?'
      }
    },

    /* =================================================================== */
    {
      n: 2, icone: '🐞', titulo: 'Depuração: caçando bugs', conceito: 'Testar e corrigir',
      mundo: 'grade', blocos: ROBO,
      teoria: `
<p>Quase nenhum programa funciona de primeira. Um erro num programa é chamado de <b>bug</b> (inseto, em inglês), e procurar e corrigir esses erros é <b>depurar</b>.</p>
<p>O nome ficou famoso em 1947, quando a equipe da cientista <b>Grace Hopper</b> encontrou uma mariposa presa dentro de um computador e a colou no caderno de registros como “o primeiro bug de verdade”.</p>
<p><b>Estratégias de quem programa:</b></p>
<ul>
<li><b>Execute devagar</b> (use a velocidade 🐢) e observe qual bloco estava destacado quando deu errado — o bloco com erro fica <span class="tag-erro">vermelho</span>;</li>
<li><b>Simule com o dedo</b>, bloco por bloco, antes de executar;</li>
<li><b>Mude uma coisa de cada vez</b> e teste de novo;</li>
<li>Leia a mensagem de erro: ela dá pistas!</li>
</ul>`,
      exemplo: {
        titulo: 'Como caçar um bug',
        texto: 'Este programa tem um bug: execute e veja o robô bater. Diminua a velocidade, descubra qual bloco está errado e conserte. Às vezes basta trocar um único bloco!',
        mapa: ['>.#', '#.*'],
        inicial: [av(), dir(), av(), dir(), av()],
        solucao: [av(), dir(), av(), esq(), av()]
      },
      desafios: [
        {
          titulo: 'Bug na curva',
          texto: 'Este programa tem um <b>bug</b>: o robô bate na parede. Encontre o bloco errado e conserte.',
          mapa: ['>.#', '#..', '##*'],
          inicial: [av(), esq(), av(), esq(), av(), dir(), av()],
          solucao: [av(), dir(), av(), esq(), av(), dir(), av()],
          dica: 'Execute bem devagar e olhe para onde o robô fica virado depois de cada giro.'
        },
        {
          titulo: 'Faltou um passo',
          texto: 'Quem montou este programa esqueceu um bloco. Descubra qual está faltando e onde ele deve entrar.',
          mapa: ['>...#', '###.#', '*...#'],
          inicial: [av(), av(), dir(), av(), av(), dir(), av(), av(), av()],
          solucao: [av(), av(), av(), dir(), av(), av(), dir(), av(), av(), av()],
          dica: 'O robô virou cedo demais. Para colocar um bloco no meio do programa, toque no espaço entre dois blocos.'
        },
        {
          titulo: 'Fora de ordem',
          texto: 'Os blocos certos estão aqui, mas um deles está no lugar errado.',
          mapa: ['>.o.*'],
          inicial: [av(), pegar(), av(), av(), av()],
          solucao: [av(), av(), pegar(), av(), av()],
          dica: 'Leia a mensagem de erro. Use ↑ e ↓ para mover um bloco.'
        },
        {
          titulo: 'Dois bugs!',
          texto: 'Este programa tem <b>dois</b> erros. Corrija um, execute, e veja o que ainda falta.',
          mapa: ['>.o#', '##..', '###*'],
          inicial: [av(), av(), dir(), av(), esq(), av(), esq(), av()],
          solucao: [av(), av(), pegar(), dir(), av(), esq(), av(), dir(), av()],
          dica: 'Um bug faz o robô bater; o outro faz uma moeda ficar para trás.'
        },
        {
          titulo: 'Escadaria',
          texto: 'Sem bugs desta vez: monte o programa inteiro. Conte quantos blocos você precisou usar… E se a escada tivesse 100 degraus? 🤔 Guarde essa pergunta para a próxima aula.',
          mapa: ['>.####', '#..###', '##..##', '###..#', '####.*'],
          solucao: [av(), ...x(4, dir(), av(), esq(), av())],
          dica: 'Cada degrau é: virar à direita, avançar, virar à esquerda, avançar.'
        }
      ],
      professor: {
        objetivos: ['Desenvolver estratégias de depuração: ler, simular, testar e corrigir.', 'Interpretar mensagens de erro.', 'Valorizar o erro como parte do processo de aprendizagem.'],
        desplugada: 'Escreva no quadro um “algoritmo de escovar os dentes” com dois erros escondidos (passo fora de ordem e passo faltando). A turma encontra os bugs.',
        roteiro: ['8 min — algoritmo com bugs no quadro + história da Grace Hopper.', '5 min — Exemplo no tablet: usar a velocidade lenta para achar o bloco errado.', '27 min — desafios 1 a 5.', '5 min — socialização: qual estratégia de depuração cada dupla usou?'],
        matematica: 'Verificação de procedimentos, contagem, raciocínio passo a passo (semelhante a conferir a resolução de uma equação linha por linha).',
        fechamento: 'O desafio 5 exige muitos blocos repetidos. Pergunte: “existe um jeito mais curto?” — gancho para a Aula 3.'
      }
    },

    /* =================================================================== */
    {
      n: 3, icone: '🔁', titulo: 'Repetição: laços', conceito: 'Repita N vezes',
      mundo: 'grade', blocos: ROBO.concat(['repetir']),
      teoria: `
<p>Na escadaria da aula passada, o mesmo grupo de blocos apareceu 4 vezes. Quando algo se repete, podemos usar um <b>laço</b> (ou <i>loop</i>).</p>
<p>O bloco <b>repita N vezes</b> executa os blocos que estão <b>dentro</b> dele N vezes seguidas. Depois, o programa continua com o bloco que vem embaixo.</p>
<p>Para usar laços, a habilidade mais importante é <b>encontrar o padrão</b>: o que exatamente se repete? Quantas vezes?</p>
<p>Um laço pode ficar dentro de outro laço — isso se chama <b>laço aninhado</b>.</p>
<p class="atencao">💡 Programadores valorizam programas curtos e claros. Em alguns desafios há uma <b>meta de blocos</b>: alcance-a para ganhar a 3ª estrela.</p>
<p>Curiosidade: toque em <b>🐍 Python</b> para ver como o seu programa fica numa linguagem de texto, usada por programadores profissionais.</p>`,
      exemplo: {
        titulo: '8 blocos ou 2?',
        texto: 'Compare: para avançar 8 casas, poderíamos usar 8 blocos “avançar”. Com o laço, bastam 2 blocos. Execute e depois mude o número de repetições para 5. O que acontece?',
        mapa: ['>.......*'],
        inicial: [B.rep(8, [av()])],
        solucao: [B.rep(8, [av()])]
      },
      desafios: [
        {
          titulo: 'Corredor comprido',
          texto: 'Leve o robô até a estrela usando no máximo 2 blocos.',
          mapa: ['>..........*'],
          solucao: [B.rep(11, [av()])], exige: ['repetir'], maxBlocos: 2,
          dica: 'Coloque o bloco “avançar” dentro do “repita”. A faixa verde aparece dentro do repita assim que você o coloca.'
        },
        {
          titulo: 'Escadaria de novo',
          texto: 'A mesma escadaria da aula 2, agora com laço. Meta: 6 blocos.',
          mapa: ['>.####', '#..###', '##..##', '###..#', '####.*'],
          solucao: [av(), B.rep(4, [dir(), av(), esq(), av()])], exige: ['repetir'], maxBlocos: 6,
          dica: 'O primeiro “avançar” fica fora do laço. Os outros 4 blocos de cada degrau ficam dentro.'
        },
        {
          titulo: 'Fila de moedas',
          texto: 'Recolha todas as moedas e chegue à estrela. Meta: 4 blocos.',
          mapa: ['>o.o.o.o*'],
          solucao: [B.rep(4, [av(), pegar(), av()])], exige: ['repetir'], maxBlocos: 4,
          dica: 'Qual é o pedaço do caminho que se repete? “Avançar, pegar, avançar”…'
        },
        {
          titulo: 'Volta no quarteirão',
          texto: 'Recolha as 3 moedas dos cantos e termine na estrela. Meta: 7 blocos. Este desafio pede um laço <b>dentro</b> de outro laço!',
          mapa: ['o...o', '.###.', '.###.', '.###.', '^*..o'],
          solucao: [B.rep(3, [B.rep(4, [av()]), pegar(), dir()]), B.rep(3, [av()])], exige: ['repetir'], maxBlocos: 7,
          dica: '“Andar 4 casas, pegar a moeda e virar à direita” se repete 3 vezes. E “andar 4 casas” já é um repita!'
        }
      ],
      professor: {
        objetivos: ['Reconhecer padrões de repetição em uma sequência de ações.', 'Usar a estrutura de repetição com número fixo de vezes.', 'Iniciar a ideia de laços aninhados.'],
        desplugada: 'Coreografia: escreva uma sequência de palmas e passos longa (ex.: “palma, palma, pé, palma, palma, pé…”). A turma reescreve usando “repita 4 vezes: palma, palma, pé”.',
        roteiro: ['8 min — coreografia com repetição.', '5 min — Exemplo: mudar o número de repetições.', '27 min — desafios 1 a 4 (o 4 é o mais difícil; incentive desenhar o caminho no caderno).', '5 min — mostrar o botão 🐍 Python e comparar com os blocos.'],
        matematica: 'Multiplicação como adição repetida (4 × “4 blocos” = 16 ações); padrões e regularidades; economia de representação.',
        fechamento: 'Quantas ações o robô fez no desafio 4? E quantos blocos foram usados? Relacione com multiplicação.'
      }
    },

    /* =================================================================== */
    {
      n: 4, icone: '🐢', titulo: 'A tartaruga e os ângulos', conceito: 'Polígonos regulares',
      mundo: 'tartaruga', blocos: TART,
      teoria: `
<p>Agora o personagem é uma <b>tartaruga com uma caneta</b>: por onde ela anda, deixa um traço. Essa ideia vem da linguagem <b>Logo</b>, criada em 1967 pelo matemático Seymour Papert e colegas para crianças aprenderem matemática programando.</p>
<ul>
<li><b>andar N passos</b> — anda N unidades para a frente (cada quadradinho da malha mede 50);</li>
<li><b>girar ↺ / ↻ G graus</b> — gira no lugar, para a esquerda (anti-horário) ou para a direita (horário).</li>
</ul>
<p><b>O segredo dos polígonos:</b> ao contornar um polígono e voltar à direção inicial, a tartaruga dá exatamente <b>uma volta completa: 360°</b>. Em um polígono regular de <b>n</b> lados, ela gira o mesmo tanto em cada canto, então cada giro é:</p>
<p class="formula">giro = 360° ÷ n</p>
<p>Esse giro é o <b>ângulo externo</b> do polígono. O ângulo interno é 180° − giro.</p>
<p class="atencao">Seu desenho precisa ficar <b>em cima do modelo tracejado</b>. O centro da tela é a origem (0, 0) do plano cartesiano.</p>`,
      exemplo: {
        titulo: 'Primeiro traço',
        texto: 'Execute e observe a tartaruga: ela anda 100 passos, gira 90° para a esquerda e anda mais 100. Tente completar o quadrado!',
        inicio: { x: -50, y: -50 },
        livre: true,
        inicial: [B.cor(AZUL), B.andar(100), B.ge(90), B.andar(100)]
      },
      desafios: [
        {
          titulo: 'Quadrado',
          texto: 'Desenhe o quadrado de lado 100 sobre o modelo tracejado. Pode usar só blocos de andar e girar.',
          inicio: { x: -50, y: -50 },
          solucao: x(4, B.andar(100), B.ge(90)),
          dica: 'Quanto a tartaruga precisa girar em cada canto de um quadrado?'
        },
        {
          titulo: 'Quadrado com repita',
          texto: 'Um quadrado maior (lado 150), agora com o laço. Meta: 3 blocos.',
          inicio: { x: -75, y: -75 },
          solucao: [B.rep(4, [B.andar(150), B.ge(90)])], exige: ['repetir'], maxBlocos: 3,
          dica: 'Repita 4 vezes: andar 150, girar 90.'
        },
        {
          titulo: 'Triângulo equilátero',
          texto: 'Desenhe o triângulo equilátero de lado 160. Meta: 3 blocos.',
          inicio: { x: -80, y: -69 },
          solucao: [B.rep(3, [B.andar(160), B.ge(120)])], exige: ['repetir'], maxBlocos: 3,
          dica: 'Cuidado! O ângulo interno do triângulo equilátero é 60°, mas a tartaruga gira o ângulo EXTERNO: 360° ÷ 3.'
        },
        {
          titulo: 'Hexágono regular',
          texto: 'Desenhe o hexágono regular de lado 80. Meta: 3 blocos.',
          inicio: { x: -40, y: -69.28 },
          solucao: [B.rep(6, [B.andar(80), B.ge(60)])], exige: ['repetir'], maxBlocos: 3,
          dica: 'Hexágono tem 6 lados. Use a fórmula giro = 360° ÷ n.'
        },
        {
          titulo: 'Estrela de 5 pontas',
          texto: 'Desenhe a estrela com lados de 200. Desta vez a tartaruga gira para a <b>direita</b> ↻. Meta: 3 blocos.',
          inicio: { x: -100, y: 22 },
          solucao: [B.rep(5, [B.andar(200), B.gd(144)])], exige: ['repetir'], maxBlocos: 3,
          dica: 'Para desenhar a estrela, a tartaruga dá DUAS voltas completas em 5 giros. Quanto é 720° ÷ 5?'
        }
      ],
      professor: {
        objetivos: ['Relacionar giros da tartaruga com ângulos externos de polígonos regulares.', 'Generalizar: giro = 360° ÷ n.', 'Usar repetição para construir figuras geométricas.'],
        desplugada: 'Em pé, cada estudante “é a tartaruga”: anda 3 passos e gira um quarto de volta, 4 vezes. Pergunte quanto girou no total. Repita para o triângulo (sem dizer o ângulo) e deixe a turma descobrir 120°.',
        roteiro: ['8 min — tartaruga humana e a volta completa de 360°.', '5 min — Exemplo: completar o quadrado.', '27 min — desafios 1 a 5 (registrar no caderno uma tabela n × giro × ângulo interno).', '5 min — socialização da tabela e da fórmula.'],
        matematica: 'Ângulos externo e interno de polígonos regulares (soma dos ângulos externos = 360°; soma dos internos = (n − 2)·180°); plano cartesiano; estrela regular {5/2}.',
        fechamento: 'Por que o giro do triângulo é 120° e não 60°? Construa coletivamente a tabela com quadrado, triângulo, pentágono, hexágono, octógono.'
      }
    },

    /* =================================================================== */
    {
      n: 5, icone: '🌸', titulo: 'Laços dentro de laços: padrões', conceito: 'Laços aninhados',
      mundo: 'tartaruga', blocos: TART.concat(['caneta']),
      teoria: `
<p>Se um bloco “repita” desenha um quadrado, o que acontece quando colocamos esse laço <b>dentro de outro laço</b>? Surgem padrões: fileiras, rosáceas, flores.</p>
<p>No laço aninhado, o laço de <b>dentro</b> roda todas as suas vezes para <b>cada</b> volta do laço de <b>fora</b>. Se o de fora repete 12 vezes e o de dentro 4, os blocos mais internos rodam 12 × 4 = <b>48</b> vezes.</p>
<p>Novo bloco: <b>caneta levantada / abaixada</b>. Com a caneta levantada, a tartaruga anda sem desenhar — ótimo para mudar de lugar ou fazer tracejados.</p>
<p class="atencao">💡 Monte primeiro o laço de dentro (por exemplo, o quadrado), teste, e só depois coloque-o dentro do laço de fora.</p>`,
      exemplo: {
        titulo: 'Dois quadrados',
        texto: 'O laço de dentro desenha um quadrado; depois, “andar 60” leva a tartaruga ao ponto de partida do próximo quadrado. Troque o 2 por 3 e veja o que acontece.',
        inicio: { x: -60, y: -30 },
        inicial: [B.rep(2, [B.rep(4, [B.andar(60), B.ge(90)]), B.andar(60)])],
        solucao: [B.rep(2, [B.rep(4, [B.andar(60), B.ge(90)]), B.andar(60)])]
      },
      desafios: [
        {
          titulo: 'Fileira de quadrados',
          texto: 'Desenhe 4 quadrados de lado 50, um ao lado do outro. Meta: 5 blocos.',
          inicio: { x: -100, y: -25 },
          solucao: [B.rep(4, [B.rep(4, [B.andar(50), B.ge(90)]), B.andar(50)])], exige: ['repetir'], maxBlocos: 5,
          dica: 'É o exemplo, com outro tamanho e outro número de quadrados.'
        },
        {
          titulo: 'Rosácea',
          texto: 'Desenhe 12 quadrados de lado 80, girando 30° depois de cada quadrado. Use cores se quiser! Meta: 6 blocos (contando uma cor).',
          inicio: { x: 0, y: 0 },
          solucao: [B.rep(12, [B.rep(4, [B.andar(80), B.ge(90)]), B.ge(30)])], exige: ['repetir'], maxBlocos: 6,
          dica: 'Por que 12 quadrados e 30°? Porque 12 × 30° = 360°: uma volta completa!'
        },
        {
          titulo: 'Flor de triângulos',
          texto: 'Desenhe 6 triângulos equiláteros de lado 100 com um vértice em comum, formando um hexágono. Meta: 6 blocos (contando uma cor, se quiser).',
          inicio: { x: 0, y: 0 },
          solucao: [B.rep(6, [B.rep(3, [B.andar(100), B.ge(120)]), B.ge(60)])], exige: ['repetir'], maxBlocos: 6,
          dica: 'Depois de cada triângulo, gire o suficiente para que 6 triângulos completem uma volta: 360° ÷ 6.'
        },
        {
          titulo: 'Quadrado tracejado',
          texto: 'Desenhe um quadrado de lado 100 com o contorno tracejado: traços de 10 e espaços de 10. Meta: 7 blocos.',
          inicio: { x: -50, y: -50 },
          solucao: [B.rep(4, [B.rep(5, [B.andar(10), B.caneta('cima'), B.andar(10), B.caneta('baixo')]), B.ge(90)])],
          exige: ['repetir', 'caneta'], maxBlocos: 7,
          dica: 'Cada lado tem 5 pares de “traço + espaço”. A caneta começa abaixada.'
        },
        {
          titulo: 'Sua arte',
          texto: 'Crie um padrão bonito usando laços dentro de laços e cores. Que tal uma rosácea de hexágonos ou de estrelas? Depois mostre para a turma!',
          inicio: { x: 0, y: 0 }, livre: true, exige: ['repetir'],
          inicial: [B.cor('arcoiris')],
          dica: 'Experimente: repita 18 vezes [ repita 6 vezes (andar 50, girar 60), girar 20 ].'
        }
      ],
      professor: {
        objetivos: ['Compreender a execução de laços aninhados.', 'Usar a multiplicação para prever o número de execuções.', 'Explorar simetria de rotação.'],
        desplugada: 'Mostre imagens de rosáceas, mandalas e azulejos. Pergunte: qual é a figura básica? Quantas vezes ela aparece? De quantos graus é a rotação?',
        roteiro: ['8 min — imagens de padrões e simetria de rotação.', '5 min — Exemplo (mudar 2 para 3 e para 5).', '27 min — desafios 1 a 4.', '5 min — desafio 5 (arte) e galeria: alguns estudantes mostram suas criações.'],
        matematica: 'Simetria de rotação (ângulo = 360° ÷ número de cópias), princípio multiplicativo, polígonos regulares.',
        fechamento: 'Quantas vezes o bloco “andar” foi executado na rosácea? (12 × 4 = 48.) E se fossem 36 quadrados girando 10°?'
      }
    },

    /* =================================================================== */
    {
      n: 6, icone: '📦', titulo: 'Variáveis: a memória do programa', conceito: 'Variáveis',
      mundo: 'tartaruga', blocos: ['definir', 'mudar', 'andar', 'girar_esq', 'girar_dir', 'repetir', 'cor'],
      teoria: `
<p>Uma <b>variável</b> é como uma caixinha com um nome, onde o programa guarda um valor para usar depois.</p>
<ul>
<li><b>defina x = 10</b> — cria a caixinha <code>x</code> (ou troca o que estava nela) e guarda 10;</li>
<li><b>aumente x em 5</b> — soma 5 ao valor atual de <code>x</code>;</li>
<li>Em qualquer campo de um bloco você pode escrever o <b>nome</b> da variável ou uma <b>conta</b> com ela: <code>lado * 2</code>, <code>360 / n</code>.</li>
</ul>
<p>Operações: <code>+</code> soma, <code>-</code> subtração, <code>*</code> multiplicação, <code>/</code> divisão, <code>^</code> potência. Decimais com <b>ponto</b>: <code>2.5</code>.</p>
<p>Textos ficam entre aspas: <code>"Olá"</code>. Com <code>+</code> você junta textos e números: <code>"Tenho " + idade + " anos"</code>.</p>
<p>Novo bloco: <b>conte i de 1 até 10</b> — repete, e a cada volta a variável <code>i</code> vale 1, depois 2, 3… até 10.</p>
<p class="atencao">💡 Na matemática, x = x + 1 seria impossível. Na programação, <b>“aumente x em 1”</b> quer dizer: pegue o valor de x, some 1 e guarde de volta em x.</p>`,
      exemplo: {
        titulo: 'Guardando valores',
        mundo: 'console', livre: true,
        blocos: ['definir', 'mudar', 'mostrar'],
        texto: 'As variáveis <code>nome</code> e <code>idade</code> guardam valores, e o bloco “mostre” exibe resultados. Execute; depois troque o nome e a idade pelos seus.',
        inicial: [B.def('nome', '"Ana"'), B.def('idade', 14), B.mos('"Olá, " + nome + "!"'), B.mos('"Daqui a 5 anos você terá " + (idade + 5) + " anos."'), B.mud('idade', 1), B.mos('"No ano que vem: " + idade')]
      },
      desafios: [
        {
          titulo: 'Área do retângulo',
          mundo: 'console', blocos: ['definir', 'mudar', 'mostrar'],
          texto: 'Crie as variáveis <code>base</code> = 8 e <code>altura</code> = 5 e mostre a área do retângulo calculada <b>com as variáveis</b>.',
          solucao: [B.def('base', 8), B.def('altura', 5), B.mos('base * altura')], exige: ['definir', 'mostrar'],
          dica: 'No bloco “mostre”, escreva a conta: base * altura'
        },
        {
          titulo: 'Espiral quadrada',
          texto: 'Comece com <code>lado</code> = 10. Repita 20 vezes: ande <code>lado</code> passos, gire 90° à esquerda e aumente <code>lado</code> em 10. Meta: 6 blocos (contando uma cor, se quiser).',
          inicio: { x: 0, y: 0 },
          solucao: [B.def('lado', 10), B.rep(20, [B.andar('lado'), B.ge(90), B.mud('lado', 10)])], exige: ['definir', 'mudar'], maxBlocos: 6,
          dica: 'No bloco “andar”, escreva o nome da variável (lado) no lugar do número.'
        },
        {
          titulo: 'Polígono de n lados',
          texto: 'Crie a variável <code>n</code> = 9 e desenhe um polígono regular de <b>n lados</b> com lado 40, usando <code>n</code> no repita e no giro. Depois experimente n = 5, 12, 36… O que acontece quando n fica bem grande?',
          inicio: { x: -20, y: -55 },
          solucao: [B.def('n', 9), B.rep('n', [B.andar(40), B.ge('360 / n')])], exige: ['definir'],
          dica: 'Repita n vezes: andar 40, girar 360 / n.'
        },
        {
          titulo: 'O desafio de Gauss',
          mundo: 'console', blocos: ['definir', 'mudar', 'mostrar', 'repetir', 'contar'],
          texto: 'Conta-se que o professor do pequeno Gauss mandou a turma somar 1 + 2 + 3 + … + 100. Faça o computador calcular essa soma e mostrar o resultado. (Mostrar o número direto não vale! 😉)',
          solucao: [B.def('soma', 0), B.conte('i', 1, 100, [B.mud('soma', 'i')]), B.mos('soma')], exige: ['mudar'],
          dica: 'Comece com soma = 0. Use “conte i de 1 até 100” e, dentro dele, “aumente soma em i”. Mostre a soma DEPOIS do laço.'
        }
      ],
      professor: {
        objetivos: ['Compreender variável como espaço nomeado de memória.', 'Diferenciar a igualdade matemática da atribuição.', 'Usar variáveis como contador e acumulador.'],
        desplugada: 'Caixas (ou envelopes) com etiquetas “lado” e “n”. Um estudante executa um “programa” lido pelo professor: “coloque 10 em lado; some 5 ao que está em lado; …”. A turma acompanha o valor no quadro.',
        roteiro: ['8 min — caixas/envelopes e a diferença entre “=” na matemática e “defina”.', '5 min — Exemplo no console.', '27 min — desafios 1 a 4.', '5 min — discutir a soma de Gauss: 50 pares que somam 101 → 50 × 101 = 5050.'],
        matematica: 'Expressões algébricas, valor numérico, sequências (a espiral é uma progressão aritmética de razão 10), soma de PA (Gauss), polígonos com n → ∞ aproximando a circunferência.',
        fechamento: 'Compare a solução por computador com o raciocínio de Gauss. Qual é mais rápido para 1 a 1.000.000?'
      }
    },

    /* =================================================================== */
    {
      n: 7, icone: '🔀', titulo: 'Condicionais: tomando decisões', conceito: 'Se… então… senão',
      mundo: 'console', blocos: ['perguntar', 'mostrar', 'definir', 'se', 'se_senao'],
      teoria: `
<p>Programas tomam decisões. O bloco <b>se … então</b> só executa os blocos de dentro <b>se a condição for verdadeira</b>. O bloco <b>se … então … senão</b> escolhe um de dois caminhos.</p>
<p><b>Comparações:</b> <code>=</code> igual, <code>≠</code> (ou <code>!=</code>) diferente, <code>&lt;</code> menor, <code>&gt;</code> maior, <code>&lt;=</code> menor ou igual, <code>&gt;=</code> maior ou igual. Combine condições com <code>e</code>, <code>ou</code>, <code>nao</code>.</p>
<p>O operador <code>%</code> dá o <b>resto da divisão</b>: <code>17 % 5</code> vale 2. Um número é par quando <code>n % 2 = 0</code>.</p>
<p>Novo bloco: <b>pergunte … e guarde em</b> — o programa pede um valor a quem está usando.</p>
<p class="atencao">🧪 Nestes desafios, o computador <b>testa seu programa com várias entradas diferentes</b>. Ele precisa acertar todas! É assim que programadores verificam se um programa funciona “em geral” e não só num caso.</p>`,
      exemplo: {
        titulo: 'Pode votar?',
        livre: true,
        texto: 'Execute: o programa vai perguntar sua idade e decidir o que mostrar. Teste com 15, 16 e 70. Depois acrescente: se a idade for 18 anos ou mais, o voto é obrigatório (e até 70 anos).',
        inicial: [B.perg('Quantos anos você tem?', 'idade'), B.sese('idade >= 16', [B.mos('"Você já pode votar!"')], [B.mos('"Ainda não pode votar."')])]
      },
      desafios: [
        {
          titulo: 'Par ou ímpar?',
          texto: 'Pergunte um número inteiro e mostre <b>par</b> ou <b>ímpar</b>.',
          testes: [[4], [7], [0], [15]],
          solucao: [B.perg('Digite um número inteiro', 'n'), B.sese('n % 2 = 0', [B.mos('"par"')], [B.mos('"ímpar"')])],
          exige: ['se|se_senao'],
          dica: 'Condição: n % 2 = 0 (o resto da divisão por 2 é zero). Textos vão entre aspas: "par".'
        },
        {
          titulo: 'Aprovado?',
          texto: 'Pergunte a nota (de 0 a 10). Se for 5 ou mais, mostre <b>aprovado</b>; senão, mostre <b>recuperação</b>.',
          testes: [[7], [5], [4.5], [10]],
          solucao: [B.perg('Nota', 'nota'), B.sese('nota >= 5', [B.mos('"aprovado"')], [B.mos('"recuperação"')])],
          exige: ['se|se_senao'],
          dica: 'Atenção ao caso nota = 5: use >= (maior ou igual).'
        },
        {
          titulo: 'Esquerda ou direita?',
          mundo: 'grade', blocos: ['avancar', 'esquerda', 'direita', 'repetir', 'se', 'se_senao'],
          texto: 'Agora há <b>2 mapas</b>, e o <b>mesmo programa</b> precisa funcionar nos dois! No fim do corredor, a estrela pode estar à esquerda ou à direita.',
          mapas: [['###*#', '>...#', '#####'], ['#####', '>...#', '###*#']],
          solucao: [B.rep(3, [av()]), B.sese('esquerda_livre', [esq(), av()], [dir(), av()])],
          exige: ['se|se_senao'],
          dica: 'Use “se caminho livre à esquerda então … senão …”. As condições do robô aparecem numa lista.'
        },
        {
          titulo: 'Moedas espalhadas',
          mundo: 'grade', blocos: ['avancar', 'esquerda', 'direita', 'pegar', 'repetir', 'se'],
          texto: 'São 3 mapas, cada um com moedas em lugares diferentes. Pegue todas e chegue à estrela com um só programa. Meta: 4 blocos.',
          mapas: [['>o..o.o*'], ['>.oo...*'], ['>....oo*']],
          solucao: [B.rep(7, [av(), B.se('tem_moeda', [pegar()])])], exige: ['se'], maxBlocos: 4,
          dica: 'A cada passo, verifique: “se tem moeda aqui, então pegar moeda”.'
        },
        {
          titulo: 'O maior de dois',
          texto: 'Pergunte dois números e mostre o <b>maior</b> deles (se forem iguais, mostre qualquer um).',
          testes: [[3, 8], [10, 2], [5, 5], [-4, -9]],
          solucao: [B.perg('Primeiro número', 'a'), B.perg('Segundo número', 'b'), B.sese('a > b', [B.mos('a')], [B.mos('b')])],
          exige: ['se|se_senao'],
          dica: 'Guarde os números em a e b. Se a > b, mostre a; senão, mostre b.'
        }
      ],
      professor: {
        objetivos: ['Usar estruturas condicionais simples e compostas.', 'Escrever condições com operadores relacionais e lógicos.', 'Compreender teste de software com múltiplas entradas.'],
        desplugada: '“Seu mestre mandou” condicional: “SE você usa óculos, levante a mão; SENÃO, bata palma”; “SE nasceu em março E gosta de futebol, fique em pé”.',
        roteiro: ['8 min — brincadeira condicional.', '5 min — Exemplo do voto (e a extensão para voto obrigatório).', '27 min — desafios 1 a 5.', '5 min — discutir por que o desafio 4 tem 3 mapas.'],
        matematica: 'Paridade e resto da divisão (divisibilidade), desigualdades, comparação de números inteiros e racionais (inclusive negativos no desafio 5), conectivos lógicos.',
        fechamento: 'Por que um programa que funciona para um teste pode falhar em outro? Relacione com “verificar a solução de uma equação”.'
      }
    },

    /* =================================================================== */
    {
      n: 8, icone: '🌀', titulo: 'Laços com condição: enquanto e repita até', conceito: 'Enquanto / até',
      mundo: 'grade', blocos: ['avancar', 'esquerda', 'direita', 'repetir', 'repita_ate', 'enquanto', 'se', 'se_senao'],
      teoria: `
<p>O “repita N vezes” exige saber <b>quantas</b> vezes repetir. E quando não sabemos? Usamos um laço com <b>condição</b>:</p>
<ul>
<li><b>repita até</b> <i>condição</i> — repete os blocos de dentro até a condição ficar verdadeira;</li>
<li><b>enquanto</b> <i>condição</i> <b>faça</b> — repete enquanto a condição for verdadeira.</li>
</ul>
<p>“Repita até chegar à estrela” é o mesmo que “enquanto não chegou à estrela, faça”.</p>
<p>A combinação de <b>laços</b> e <b>condicionais</b> deixa o programa “esperto”: ele reage ao que encontra pelo caminho, como um aspirador-robô ou um personagem de videogame.</p>
<p class="atencao">⚠️ Cuidado com o <b>laço infinito</b>: se a condição nunca mudar, o laço nunca termina. (Aqui, o programa é interrompido automaticamente se demorar demais.)</p>`,
      exemplo: {
        titulo: 'Até chegar',
        texto: 'Um único “avançar” dentro de “repita até chegar à estrela” funciona para corredores de qualquer tamanho. Execute e depois troque a condição para ver o que acontece.',
        mapa: ['>.....*'],
        inicial: [B.ate('na_estrela', [av()])],
        solucao: [B.ate('na_estrela', [av()])]
      },
      desafios: [
        {
          titulo: 'Corredores de vários tamanhos',
          texto: 'Três mapas, três corredores de tamanhos diferentes. Um só programa. Meta: 2 blocos.',
          mapas: [['>..*'], ['>.........*'], ['>*']],
          solucao: [B.ate('na_estrela', [av()])], exige: ['repita_ate|enquanto'], maxBlocos: 2,
          dica: 'O “repita N vezes” não serve aqui, porque N muda de mapa para mapa.'
        },
        {
          titulo: 'Siga o caminho',
          texto: 'Nos dois mapas, sempre que há uma parede à frente, o caminho continua à esquerda. Meta: 4 blocos.',
          mapas: [['*...', '###.', '>...'], ['....#', '.##.#', '.#>.#', '*####']],
          solucao: [B.ate('na_estrela', [B.sese('frente_livre', [av()], [esq()])])], exige: ['repita_ate|enquanto'], maxBlocos: 4,
          dica: 'Repita até chegar à estrela: se o caminho à frente está livre, avance; senão, vire à esquerda.'
        },
        {
          titulo: 'Labirinto',
          texto: 'Dois labirintos, um só programa! Use a estratégia da <b>mão na parede</b>.',
          mapas: [['>..#..*', '##.#.##', '#.....#', '#.####.', '#......'], ['>.....#', '#####.#', '*...#.#', '###.#..', '###...#']],
          solucao: [B.ate('na_estrela', [B.sese('direita_livre', [dir(), av()], [B.sese('frente_livre', [av()], [esq()])])])],
          exige: ['repita_ate|enquanto'],
          dica: 'Imagine o robô andando com a mão direita sempre encostada na parede: se puder virar à direita, vire e avance; senão, se a frente estiver livre, avance; senão, vire à esquerda.'
        },
        {
          titulo: 'Potências de 2',
          mundo: 'console', blocos: ['definir', 'mudar', 'mostrar', 'enquanto', 'repita_ate', 'se'],
          texto: 'Mostre todas as potências de 2 (1, 2, 4, 8, …) <b>menores que 1000</b>, uma por linha.',
          solucao: [B.def('p', 1), B.enq('p < 1000', [B.mos('p'), B.def('p', 'p * 2')])], exige: ['enquanto|repita_ate'],
          dica: 'Comece com p = 1. Enquanto p < 1000: mostre p e depois defina p = p * 2.'
        },
        {
          titulo: 'Juros compostos',
          mundo: 'console', blocos: ['definir', 'mudar', 'mostrar', 'enquanto', 'repita_ate', 'se'],
          texto: 'R$ 100 aplicados rendem 10% ao ano (juros compostos: a cada ano, o valor é multiplicado por 1.1). Quantos anos são necessários para o valor <b>passar de R$ 200</b>? Mostre só o número de anos.',
          solucao: [B.def('valor', 100), B.def('anos', 0), B.enq('valor <= 200', [B.def('valor', 'valor * 1.1'), B.mud('anos', 1)]), B.mos('anos')],
          exige: ['enquanto|repita_ate'],
          dica: 'Use duas variáveis: valor (começa em 100) e anos (começa em 0). Enquanto valor <= 200: valor = valor * 1.1 e aumente anos em 1.'
        }
      ],
      professor: {
        objetivos: ['Usar laços controlados por condição.', 'Combinar laços e condicionais em algoritmos que reagem ao ambiente.', 'Identificar e evitar laços infinitos.'],
        desplugada: 'Labirinto no chão com fita crepe (ou desenhado no quadro): um estudante percorre com a mão direita “na parede” enquanto a turma narra a regra.',
        roteiro: ['8 min — labirinto e regra da mão direita.', '5 min — Exemplo: trocar a condição.', '27 min — desafios 1 a 5.', '5 min — discutir o juros compostos e o crescimento exponencial.'],
        matematica: 'Potências, crescimento exponencial, juros compostos (100·1,1ⁿ > 200 ⇒ n = 8), comparação com crescimento linear; desigualdades.',
        fechamento: 'Compare: juros simples de 10% ao ano dobrariam R$ 100 em 10 anos. Por que os compostos dobram antes?'
      }
    },

    /* =================================================================== */
    {
      n: 9, icone: '🧮', titulo: 'Matemática com código', conceito: 'Algoritmos matemáticos',
      mundo: 'console', blocos: ['perguntar', 'definir', 'mudar', 'mostrar', 'se', 'se_senao', 'repetir', 'contar', 'enquanto'],
      teoria: `
<p>Agora você já conhece as principais estruturas da programação: <b>sequência</b>, <b>repetição</b>, <b>decisão</b> e <b>variáveis</b>. Com elas, dá para automatizar muitos cálculos da matemática do 9º ano.</p>
<p><b>Funções matemáticas disponíveis:</b></p>
<ul>
<li><code>raiz(x)</code> — raiz quadrada;</li>
<li><code>x ^ 2</code> — potência;</li>
<li><code>arred(x, 2)</code> — arredonda com 2 casas decimais;</li>
<li><code>abs(x)</code> — valor absoluto (módulo);</li>
<li><code>pi</code> — o número π;</li>
<li><code>aleatorio(1, 6)</code> — sorteia um inteiro de 1 a 6.</li>
</ul>
<p class="atencao">💡 Prioridade das operações igual à da matemática: primeiro potências, depois multiplicações e divisões, depois somas e subtrações. Use parênteses! <code>(-b + raiz(delta)) / (2 * a)</code></p>`,
      exemplo: {
        titulo: 'Área do círculo',
        livre: true,
        texto: 'Execute e informe um raio. Observe o uso de <code>pi</code>, da potência e de <code>arred</code>. Modifique para mostrar também o comprimento da circunferência (2πr).',
        inicial: [B.perg('Raio do círculo', 'r'), B.def('area', 'pi * r ^ 2'), B.mos('"Área = " + arred(area, 2)')]
      },
      desafios: [
        {
          titulo: 'Teorema de Pitágoras',
          texto: 'Pergunte os dois catetos de um triângulo retângulo e mostre a <b>hipotenusa</b>.',
          testes: [[3, 4], [5, 12], [8, 15], [1, 1]],
          solucao: [B.perg('Cateto a', 'a'), B.perg('Cateto b', 'b'), B.mos('raiz(a ^ 2 + b ^ 2)')],
          dica: 'hipotenusa = raiz(a ^ 2 + b ^ 2)'
        },
        {
          titulo: 'Tabuada',
          texto: 'Pergunte um número e mostre a tabuada dele de 1 a 10, no formato <code>7 x 1 = 7</code>.',
          testes: [[7], [12]],
          solucao: [B.perg('Qual tabuada?', 'n'), B.conte('i', 1, 10, [B.mos('n + " x " + i + " = " + n * i')])],
          exige: ['contar|repetir|enquanto'],
          dica: 'Use “conte i de 1 até 10” e mostre: n + " x " + i + " = " + n * i'
        },
        {
          titulo: 'Fórmula de Bhaskara',
          texto: 'Pergunte os coeficientes a, b e c de ax² + bx + c = 0. Se Δ &lt; 0, mostre <b>não tem raízes reais</b>; senão, mostre x₁ (com +√Δ) e depois x₂ (com −√Δ), uma em cada linha.',
          testes: [[1, -5, 6], [1, 2, 5], [2, -8, 8], [1, 0, -9]],
          solucao: [B.perg('a', 'a'), B.perg('b', 'b'), B.perg('c', 'c'), B.def('delta', 'b ^ 2 - 4 * a * c'),
            B.sese('delta < 0', [B.mos('"não tem raízes reais"')], [B.mos('(-b + raiz(delta)) / (2 * a)'), B.mos('(-b - raiz(delta)) / (2 * a)')])],
          dica: 'Calcule primeiro delta = b ^ 2 - 4 * a * c. Quando Δ = 0, as duas raízes são iguais: mostre o mesmo valor duas vezes.'
        },
        {
          titulo: 'É primo?',
          texto: 'Pergunte um número inteiro positivo e mostre <b>primo</b> ou <b>não é primo</b>. Lembre: um número primo tem exatamente 2 divisores.',
          testes: [[7], [12], [1], [29], [2]],
          solucao: [B.perg('Digite um número', 'n'), B.def('divisores', 0), B.conte('d', 1, 'n', [B.se('n % d = 0', [B.mud('divisores', 1)])]),
            B.sese('divisores = 2', [B.mos('"primo"')], [B.mos('"não é primo"')])],
          dica: 'Conte os divisores: para d de 1 até n, se n % d = 0, aumente divisores em 1. No final, verifique se divisores = 2.'
        },
        {
          titulo: 'Fibonacci',
          texto: 'Mostre os 15 primeiros termos da sequência de Fibonacci (1, 1, 2, 3, 5, 8, …), um por linha. Cada termo é a soma dos dois anteriores.',
          solucao: [B.def('a', 1), B.def('b', 1), B.rep(15, [B.mos('a'), B.def('c', 'a + b'), B.def('a', 'b'), B.def('b', 'c')])],
          dica: 'Use três variáveis: a e b guardam os dois últimos termos; c = a + b. Depois “ande uma casa”: a = b e b = c.'
        }
      ],
      professor: {
        objetivos: ['Traduzir fórmulas matemáticas em algoritmos.', 'Combinar entrada, processamento e saída.', 'Generalizar soluções testando vários casos.'],
        desplugada: 'Fluxograma no quadro da fórmula de Bhaskara: entrada (a, b, c) → calcular Δ → decisão (Δ < 0?) → saídas. Compare com o programa em blocos.',
        roteiro: ['8 min — fluxograma da Bhaskara.', '5 min — Exemplo da área do círculo.', '27 min — desafios 1 a 5 (os desafios 3 e 4 são os mais exigentes).', '5 min — Fibonacci e a razão áurea: dividir um termo pelo anterior.'],
        matematica: 'Teorema de Pitágoras, equações do 2º grau (discriminante e raízes), números primos e divisores, sequências recursivas (Fibonacci), números irracionais (√2, π).',
        fechamento: 'Extensão: modificar o Fibonacci para mostrar b / a. Os valores se aproximam de 1,618… (razão áurea).'
      }
    },

    /* =================================================================== */
    {
      n: 10, icone: '🧩', titulo: 'Meus próprios blocos e projeto final', conceito: 'Funções',
      mundo: 'tartaruga', blocos: ['funcao', 'usar', 'andar', 'girar_esq', 'girar_dir', 'repetir', 'contar', 'cor', 'caneta', 'definir', 'mudar'],
      teoria: `
<p>Programadores não escrevem tudo do zero toda vez: eles criam <b>funções</b> (também chamadas de procedimentos), ou seja, <b>blocos novos</b> feitos de outros blocos.</p>
<ul>
<li><b>crie o bloco</b> <i>quadrado</i> <b>com entradas</b> <i>lado</i> — ensina ao computador um bloco novo. Os blocos de dentro descrevem o que ele faz, usando a entrada <code>lado</code> como variável;</li>
<li><b>use o bloco</b> <i>quadrado</i> <b>com</b> <i>50</i> — executa o bloco criado, com <code>lado</code> valendo 50.</li>
</ul>
<p>Um bloco pode ter várias entradas, separadas por vírgula: <code>n, lado</code>. Ao usar: <code>6, 40</code>.</p>
<p><b>Dividir para conquistar:</b> problemas grandes ficam fáceis quando os quebramos em partes menores, cada uma com seu bloco.</p>
<p class="atencao">🐍 Toque em <b>Python</b>: todas as ideias que você aprendeu (sequência, repetição, decisão, variáveis e funções) existem em praticamente todas as linguagens de programação. Muda a escrita, a lógica é a mesma!</p>`,
      exemplo: {
        titulo: 'Criando o bloco “quadrado”',
        texto: 'O bloco rosa ensina o computador a desenhar um quadrado de qualquer tamanho. Depois, ele é usado duas vezes. Acrescente um terceiro quadrado de lado 30.',
        inicio: { x: -60, y: -25 },
        inicial: [B.fn('quadrado', 'lado', [B.rep(4, [B.andar('lado'), B.ge(90)])]), B.usar('quadrado', 50), B.andar(70), B.usar('quadrado', 50)],
        solucao: [B.fn('quadrado', 'lado', [B.rep(4, [B.andar('lado'), B.ge(90)])]), B.usar('quadrado', 50), B.andar(70), B.usar('quadrado', 50)]
      },
      desafios: [
        {
          titulo: 'Quadrados encaixados',
          texto: 'Crie o bloco <b>quadrado</b> com a entrada <b>lado</b> e use-o para desenhar quadrados de lados 40, 80, 120 e 160, todos a partir do mesmo canto.',
          inicio: { x: -80, y: -80 },
          solucao: [B.fn('quadrado', 'lado', [B.rep(4, [B.andar('lado'), B.ge(90)])]), B.usar('quadrado', 40), B.usar('quadrado', 80), B.usar('quadrado', 120), B.usar('quadrado', 160)],
          exige: ['funcao', 'usar'],
          dica: 'Copie a ideia do exemplo. Desafio extra: use “conte k de 1 até 4” e “use o bloco quadrado com 40 * k”.'
        },
        {
          titulo: 'Família de polígonos',
          texto: 'Crie o bloco <b>poligono</b> com as entradas <b>n, lado</b>. Depois use-o para desenhar, a partir do mesmo ponto, os polígonos regulares de 3 a 8 lados com lado 60.',
          inicio: { x: -30, y: -72 },
          solucao: [B.fn('poligono', 'n, lado', [B.rep('n', [B.andar('lado'), B.ge('360 / n')])]), B.conte('n', 3, 8, [B.usar('poligono', 'n, 60')])],
          exige: ['funcao', 'usar'],
          dica: 'Dentro do bloco: repita n vezes (andar lado, girar 360 / n). Para usar: conte n de 3 até 8 → use o bloco poligono com n, 60.'
        },
        {
          titulo: 'Bloco Pitágoras',
          mundo: 'console', blocos: ['funcao', 'usar', 'mostrar', 'definir', 'perguntar', 'se_senao', 'contar'],
          texto: 'Crie o bloco <b>hipotenusa</b> com as entradas <b>a, b</b>, que mostra a hipotenusa. Use-o com os catetos 3 e 4, depois 6 e 8, depois 5 e 12.',
          solucao: [B.fn('hipotenusa', 'a, b', [B.mos('raiz(a ^ 2 + b ^ 2)')]), B.usar('hipotenusa', '3, 4'), B.usar('hipotenusa', '6, 8'), B.usar('hipotenusa', '5, 12')],
          exige: ['funcao', 'usar'],
          dica: 'No bloco rosa: nome hipotenusa, entradas a, b. Dentro: mostre raiz(a ^ 2 + b ^ 2). Para usar: use o bloco hipotenusa com 3, 4.'
        },
        {
          titulo: 'Projeto: adivinhe o número',
          mundo: 'console', livre: true,
          blocos: ['funcao', 'usar', 'mostrar', 'definir', 'mudar', 'perguntar', 'se', 'se_senao', 'enquanto', 'repita_ate'],
          texto: 'O computador sorteia um número de 1 a 100 e você tenta adivinhar. O jogo já funciona, mas está difícil! Melhore: depois de cada palpite, mostre <b>“É maior!”</b> ou <b>“É menor!”</b>. Extra: conte as tentativas e mostre no final.',
          inicial: [B.def('segredo', 'aleatorio(1, 100)'), B.def('palpite', 0), B.enq('palpite ≠ segredo', [B.perg('Seu palpite (1 a 100)', 'palpite')]), B.mos('"Acertou! O número era " + segredo')],
          dica: 'Dentro do “enquanto”, depois do “pergunte”: se palpite < segredo → mostre "É maior!"; se palpite > segredo → mostre "É menor!". Para contar: defina tentativas = 0 antes e aumente em 1 dentro do laço.'
        },
        {
          titulo: 'Projeto: sua obra',
          livre: true, inicio: { x: 0, y: 0 },
          texto: 'Projeto final! Crie <b>pelo menos um bloco seu</b> (com entradas) e use-o para fazer um desenho: uma casa, uma flor, um floco de neve, uma cidade… Apresente para a turma e explique seus blocos.',
          exige: ['funcao', 'usar'],
          inicial: [],
          dica: 'Ideia: um bloco “flor” com entrada “tamanho” que usa um bloco “petala”. Use a caneta levantada para mudar de lugar sem riscar.'
        }
      ],
      professor: {
        objetivos: ['Criar e usar funções com parâmetros.', 'Decompor problemas em partes (abstração).', 'Reconhecer as estruturas de programação em uma linguagem textual (Python).'],
        desplugada: 'Receita de sanduíche “com funções”: definir “passar manteiga(pão)” e “montar(recheio)” e reescrever a receita usando essas instruções. Discuta reaproveitamento.',
        roteiro: ['5 min — receita com funções.', '5 min — Exemplo: acrescentar um quadrado.', '20 min — desafios 1 a 3.', '15 min — projeto (4 ou 5) e apresentação de alguns trabalhos. Se possível, use mais uma aula para o projeto.'],
        matematica: 'Funções como “máquinas” de entrada e saída (preparação para o estudo de funções), polígonos regulares, Pitágoras, probabilidade (sorteio) e busca binária (estratégia ótima no jogo: até 7 palpites).',
        fechamento: 'No jogo da adivinhação, qual é a melhor estratégia? Chutar sempre o meio do intervalo garante acertar em no máximo 7 tentativas (2⁷ = 128 > 100).'
      }
    }
  ];

  /* Herdar o mundo e a paleta da aula e dar ids aos desafios */
  AULAS.forEach(a => {
    const todos = [a.exemplo].concat(a.desafios);
    a.exemplo.ehExemplo = true;
    todos.forEach((d, i) => {
      d.mundo = d.mundo || a.mundo;
      d.blocos = d.blocos || a.blocos;
      d.id = 'a' + a.n + '-' + i;
    });
  });

  const EXEMPLOS_LAB = [
    {
      nome: 'Espiral arco-íris',
      prog: [B.cor('arcoiris'), B.def('lado', 2), B.rep(90, [B.andar('lado'), B.ge(91), B.mud('lado', 2)])]
    },
    {
      nome: 'Estrela de n pontas',
      prog: [B.cor(ROXO), B.def('n', 7), B.caneta('cima'), B.andar(-80), B.caneta('baixo'), B.rep('n', [B.andar(160), B.gd('180 - 180 / n')])]
    },
    {
      nome: 'Flor com blocos próprios',
      prog: [
        B.fn('petala', 'tam', [B.rep(2, [B.rep(9, [B.andar('tam'), B.gd(10)]), B.gd(90)])]),
        B.fn('flor', 'tam', [B.rep(12, [B.usar('petala', 'tam'), B.gd(30)])]),
        B.cor(VERM), B.usar('flor', 12)
      ]
    },
    {
      nome: 'Tabela de quadrados',
      prog: [B.conte('i', 1, 10, [B.mos('i + " ao quadrado = " + i ^ 2')])]
    },
    {
      nome: 'Adivinhe o número (completo)',
      prog: [B.def('segredo', 'aleatorio(1, 100)'), B.def('tentativas', 0), B.def('palpite', 0),
        B.enq('palpite ≠ segredo', [B.perg('Seu palpite (1 a 100)', 'palpite'), B.mud('tentativas', 1),
          B.se('palpite < segredo', [B.mos('"É maior!"')]), B.se('palpite > segredo', [B.mos('"É menor!"')])]),
        B.mos('"Acertou em " + tentativas + " tentativas!"')]
    }
  ];

  const LAB = {
    id: 'lab', titulo: 'Laboratório livre', mundo: 'tartaruga', livre: true, inicio: { x: 0, y: 0 },
    blocos: ['andar', 'girar_esq', 'girar_dir', 'cor', 'caneta', 'repetir', 'contar', 'se', 'se_senao', 'enquanto', 'repita_ate',
      'definir', 'mudar', 'mostrar', 'perguntar', 'funcao', 'usar'],
    texto: 'Espaço livre para criar com todos os blocos da tartaruga, variáveis, perguntas e seus próprios blocos. Carregue um exemplo pronto para se inspirar.'
  };

  global.AULAS = AULAS;
  global.LAB = LAB;
  global.EXEMPLOS_LAB = EXEMPLOS_LAB;
  if (typeof module !== 'undefined' && module.exports) module.exports = { AULAS, LAB, EXEMPLOS_LAB };
})(typeof window !== 'undefined' ? window : globalThis);
