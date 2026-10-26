/* BlocoLab — guia do professor (gerado a partir das próprias aulas) */
(function () {
  'use strict';
  const BL = window.BL, AULAS = window.AULAS;
  const g = document.getElementById('guia');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const semTags = s => String(s).replace(/<[^>]+>/g, '');
  const nomeMundo = { grade: 'Robô na grade', tartaruga: 'Tartaruga (desenho)', console: 'Console (cálculos)' };

  let h = '';
  h += '<h1>Guia do professor</h1>';
  h += '<p>Sequência de <b>10 aulas</b> (≈ 45–50 min cada) de introdução à programação em blocos para o 9º ano, com forte articulação com a Matemática. ' +
    'Cada aula tem uma atividade desplugada de abertura, um <b>Exemplo</b> comentado no site e de 4 a 5 <b>desafios</b> com dificuldade crescente.</p>';
  h += '<p><b>Organização sugerida:</b> duplas por tablet, revezando quem monta e quem confere a cada desafio. ' +
    'O progresso (estrelas e programas) fica salvo <b>no navegador de cada aparelho</b>; se os tablets forem compartilhados entre turmas, use “Apagar meu progresso” na tela inicial ao trocar de turma.</p>';
  h += '<p><b>Os desafios se corrigem sozinhos:</b> no robô, o site confere se chegou à estrela com todas as moedas; na tartaruga, se o desenho coincide com o modelo tracejado; ' +
    'no console, se a saída confere com a esperada para várias entradas de teste. A 3ª estrela, quando há “meta de blocos”, premia soluções enxutas.</p>';
  h += '<div class="nao-imprimir"><button class="btn btn-pri" onclick="window.print()">🖨 Imprimir / salvar em PDF</button></div>';

  h += '<h2 style="margin-top:20px">Visão geral</h2><table class="resumo"><tr><th>Aula</th><th>Conceito de programação</th><th>Conexão com a Matemática</th></tr>';
  AULAS.forEach(a => { h += '<tr><td><b>' + a.n + '</b> ' + esc(a.titulo) + '</td><td>' + esc(a.conceito) + '</td><td>' + esc(a.professor.matematica) + '</td></tr>'; });
  h += '</table>';

  AULAS.forEach(a => {
    const p = a.professor;
    h += '<section class="aula"><h2>Aula ' + a.n + ' · ' + esc(a.titulo) + '</h2>';
    h += '<h3>Objetivos</h3><ul>' + p.objetivos.map(o => '<li>' + esc(o) + '</li>').join('') + '</ul>';
    h += '<h3>Abertura desplugada</h3><p>' + esc(p.desplugada) + '</p>';
    h += '<h3>Roteiro</h3><ul>' + p.roteiro.map(o => '<li>' + esc(o) + '</li>').join('') + '</ul>';
    h += '<h3>Conexão com a Matemática</h3><p>' + esc(p.matematica) + '</p>';
    h += '<h3>Fechamento</h3><p>' + esc(p.fechamento) + '</p>';
    h += '<h3>Desafios e uma solução possível</h3>';
    a.desafios.forEach((d, i) => {
      h += '<div class="desafio"><h4>Desafio ' + (i + 1) + ' · ' + esc(d.titulo) + ' <small style="color:var(--sut);font-weight:600">(' + nomeMundo[d.mundo] +
        (d.maxBlocos ? ' · meta: ' + d.maxBlocos + ' blocos' : '') + (d.mapas ? ' · ' + d.mapas.length + ' mapas' : '') + (d.testes ? ' · ' + d.testes.length + ' testes' : '') + ')</small></h4>';
      h += '<p>' + esc(semTags(d.texto)) + '</p>';
      const prog = d.solucao || (d.livre ? null : null);
      if (prog) {
        h += '<div class="duas"><div><div class="rotulo">Blocos</div><pre class="blocos-txt">' + esc(BL.paraTexto(prog, d.mundo)) + '</pre></div>' +
          '<div><div class="rotulo">Python</div><pre class="codigo">' + esc(BL.paraPython(prog, d.mundo)) + '</pre></div></div>';
      } else {
        h += '<p><i>Desafio aberto (projeto): qualquer programa que rode sem erros' + (d.exige ? ' e use os blocos pedidos' : '') + ' é aceito. Avalie criatividade, uso dos conceitos e a explicação do estudante.</i></p>';
      }
      if (d.dica) h += '<p style="color:var(--sut)"><b>Dica que o site oferece:</b> ' + esc(d.dica) + '</p>';
      h += '</div>';
    });
    h += '</section>';
  });

  h += '<section class="aula"><h2>Sugestões de avaliação</h2><ul>' +
    '<li>Registro no caderno de cada aula: o conceito, um desafio resolvido e a conexão matemática.</li>' +
    '<li>Observação das duplas: uso de estratégias de depuração e colaboração.</li>' +
    '<li>Projeto final (Aula 10): apresentação oral explicando os blocos criados e, se possível, comparando com a versão em Python.</li>' +
    '<li>Contagem de estrelas como indicador de percurso (não como nota única).</li></ul></section>';

  g.innerHTML = h;
})();
