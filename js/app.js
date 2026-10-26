/* BlocoLab — interface */
(function () {
  'use strict';
  const BL = window.BL, AULAS = window.AULAS, LAB = window.LAB, EXEMPLOS_LAB = window.EXEMPLOS_LAB;
  const app = document.getElementById('app');

  /* ---------------- armazenamento (por aparelho) ---------------- */
  const CHAVE = 'blocolab_v1';
  let dados = { estrelas: {}, progs: {}, vel: 2, ultimo: '' };
  try {
    const s = localStorage.getItem(CHAVE);
    if (s) { const d = JSON.parse(s); Object.assign(dados, d); dados.estrelas = d.estrelas || {}; dados.progs = d.progs || {}; }
  } catch (e) { /* sem armazenamento: segue sem salvar */ }
  let tSalvar = null;
  function salvarDados() {
    clearTimeout(tSalvar);
    tSalvar = setTimeout(() => { try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch (e) { } }, 250);
  }

  /* ---------------- utilidades ---------------- */
  function el(tag, attrs) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (let i = 2; i < arguments.length; i++) adicionar(e, arguments[i]);
    return e;
  }
  function adicionar(e, f) {
    if (f == null || f === false) return;
    if (Array.isArray(f)) { f.forEach(x => adicionar(e, x)); return; }
    e.append(f instanceof Node ? f : String(f));
  }
  const $ = (s, r) => (r || document).querySelector(s);
  const clone = o => JSON.parse(JSON.stringify(o));
  const espera = ms => new Promise(r => ms > 0 ? setTimeout(r, ms) : (window.requestAnimationFrame ? requestAnimationFrame(() => r()) : setTimeout(r, 16)));
  const estrelasTxt = n => n ? '★'.repeat(n) + '☆'.repeat(3 - n) : '';
  function totalEstrelas() {
    let t = 0, m = 0;
    AULAS.forEach(a => a.desafios.forEach(d => { m += 3; t += dados.estrelas[d.id] || 0; }));
    return { t, m };
  }

  /* ---------------- rotas ---------------- */
  let S = null; // estado da tela de desafio
  function rota() {
    if (S) { S.parar = true; S = null; }
    fecharModal();
    const p = location.hash.replace(/^#\/?/, '').split('/');
    if (p[0] === 'aula') {
      const a = AULAS.find(x => x.n === +p[1]);
      const idx = Math.max(0, Math.min(+(p[2] || 0), a ? a.desafios.length : 0));
      if (a) { dados.ultimo = location.hash; salvarDados(); return telaDesafio(a, idx); }
    }
    if (p[0] === 'lab') return telaDesafio(null, 0);
    telaInicio();
  }
  window.addEventListener('hashchange', rota);

  /* ---------------- tela inicial ---------------- */
  function telaInicio() {
    const tot = totalEstrelas();
    app.innerHTML = '';
    app.className = 'pag-inicio';
    app.appendChild(el('header', { class: 'topo' },
      el('div', { class: 'marca' }, el('span', { class: 'logo' }, '🧩'), ' BlocoLab'),
      el('div', { class: 'total', title: 'Estrelas conquistadas neste aparelho' }, '★ ' + tot.t + ' / ' + tot.m)
    ));
    const main = el('main', { class: 'inicio' });
    main.appendChild(el('section', { class: 'boas-vindas' },
      el('h1', null, 'Programação em blocos'),
      el('p', null, '10 aulas para aprender a pensar como quem programa: do primeiro passo de um robô até criar os seus próprios blocos — com muita matemática no caminho.'),
      dados.ultimo ? el('a', { class: 'btn btn-pri', href: dados.ultimo }, '▶ Continuar de onde parei') : el('a', { class: 'btn btn-pri', href: '#/aula/1/0' }, '▶ Começar pela Aula 1'),
      el('details', { class: 'como' },
        el('summary', null, 'Como funciona?'),
        el('ul', null,
          el('li', null, 'Toque num bloco da paleta para colocá-lo no programa. A faixa verde mostra onde ele vai entrar.'),
          el('li', null, 'Toque ▶ Executar e veja o resultado. Se der errado, conserte e tente de novo: errar faz parte!'),
          el('li', null, 'Cada desafio vale até 3 estrelas. Algumas pedem uma meta de poucos blocos.'),
          el('li', null, 'Seu progresso fica salvo neste aparelho e neste navegador.')
        ))
    ));
    const grade = el('div', { class: 'cards' });
    AULAS.forEach(a => {
      let t = 0; const m = a.desafios.length * 3;
      a.desafios.forEach(d => { t += dados.estrelas[d.id] || 0; });
      grade.appendChild(el('a', { class: 'card' + (t === m ? ' completo' : ''), href: '#/aula/' + a.n + '/0' },
        el('div', { class: 'card-topo' }, el('span', { class: 'card-num' }, 'Aula ' + a.n), el('span', { class: 'card-ic' }, a.icone)),
        el('h3', null, a.titulo),
        el('p', null, a.conceito + ' · ' + a.desafios.length + ' desafios'),
        el('div', { class: 'barra' }, el('i', { style: 'width:' + Math.round(100 * t / m) + '%' })),
        el('div', { class: 'card-est' }, '★ ' + t + ' / ' + m)
      ));
    });
    grade.appendChild(el('a', { class: 'card card-lab', href: '#/lab' },
      el('div', { class: 'card-topo' }, el('span', { class: 'card-num' }, 'Livre'), el('span', { class: 'card-ic' }, '🧪')),
      el('h3', null, 'Laboratório livre'),
      el('p', null, 'Todos os blocos liberados para criar o que quiser.')
    ));
    main.appendChild(grade);
    main.appendChild(el('footer', { class: 'rodape' },
      el('a', { href: 'professor.html' }, '📋 Guia do professor'),
      el('button', {
        class: 'link', onclick: () => {
          if (confirm('Apagar todo o progresso (estrelas e programas) deste aparelho?')) {
            dados = { estrelas: {}, progs: {}, vel: dados.vel, ultimo: '' };
            try { localStorage.removeItem(CHAVE); } catch (e) { }
            telaInicio();
          }
        }
      }, 'Apagar meu progresso')
    ));
    app.appendChild(main);
    window.scrollTo(0, 0);
  }

  /* ---------------- tela de desafio ---------------- */
  function telaDesafio(aula, idx) {
    const des = aula ? (idx === 0 ? aula.exemplo : aula.desafios[idx - 1]) : LAB;
    const salvo = dados.progs[des.id];
    const prog = BL.preparar(clone(salvo || des.inicial || []), des.mundo);
    S = { aula, idx, des, prog, cursor: { lista: prog, pos: prog.length }, undo: [], rodando: false, parar: false, mundo: null, ultimoAtivo: null };

    app.innerHTML = '';
    app.className = 'pag-desafio mundo-' + des.mundo;

    // topo
    const titulo = aula ? 'Aula ' + aula.n + ' · ' + aula.titulo : '🧪 Laboratório livre';
    app.appendChild(el('header', { class: 'topo' },
      el('a', { class: 'voltar', href: '#/' }, '← Aulas'),
      el('div', { class: 'topo-titulo' }, titulo),
      el('div', { class: 'total' }, '★ ' + totalEstrelas().t)
    ));

    // abas
    if (aula) {
      const abas = el('nav', { class: 'abas' });
      [aula.exemplo].concat(aula.desafios).forEach((d, i) => {
        const est = dados.estrelas[d.id] || 0;
        abas.appendChild(el('a', {
          class: 'aba' + (i === idx ? ' atual' : '') + (est ? ' feita' : ''), href: '#/aula/' + aula.n + '/' + i
        }, i === 0 ? '📖 Exemplo' : el('span', null, 'Desafio ' + i, est ? el('small', null, ' ' + estrelasTxt(est)) : '')));
      });
      const prox = AULAS.find(a => a.n === aula.n + 1);
      if (prox) abas.appendChild(el('a', { class: 'aba aba-prox', href: '#/aula/' + prox.n + '/0' }, 'Aula ' + prox.n + ' →'));
      app.appendChild(abas);
    }

    // enunciado
    const enun = el('section', { class: 'enunciado' });
    const cab = idx === 0 ? (aula ? 'Exemplo · ' + des.titulo : des.titulo) : 'Desafio ' + idx + ' · ' + des.titulo;
    enun.appendChild(el('h2', null, cab));
    enun.appendChild(el('p', { class: 'texto', html: des.texto }));
    const linhaAj = el('div', { class: 'enun-linha' });
    if (aula && idx === 0) {
      const det = el('details', { class: 'teoria', open: true }, el('summary', null, '📘 Entenda o conceito'),
        el('div', { class: 'teoria-corpo', html: aula.teoria }));
      enun.appendChild(det);
    }
    if (aula && idx > 0) {
      linhaAj.appendChild(el('button', { class: 'btn btn-sec', onclick: () => abrirModal('📘 ' + aula.conceito, el('div', { class: 'teoria-corpo', html: aula.teoria })) }, '📘 Conceito'));
    }
    if (des.dica) {
      const pd = el('p', { class: 'dica', hidden: true }, '💡 ' + des.dica);
      linhaAj.appendChild(el('button', { class: 'btn btn-sec', onclick: () => { pd.hidden = !pd.hidden; } }, '💡 Dica'));
      enun.appendChild(pd);
    }
    if (!aula) {
      const sel = el('select', {
        class: 'sel-ex', onchange: e => {
          const ex = EXEMPLOS_LAB[+e.target.value];
          if (!ex) return;
          if (S.prog.length && !confirm('Substituir o programa atual pelo exemplo "' + ex.nome + '"?')) { e.target.value = ''; return; }
          pushUndo(); S.prog = BL.preparar(clone(ex.prog), des.mundo); S.cursor = { lista: S.prog, pos: S.prog.length };
          renderProg(); salvarProg(); e.target.value = '';
        }
      }, el('option', { value: '' }, '📂 Carregar um exemplo…'), EXEMPLOS_LAB.map((x, i) => el('option', { value: i }, x.nome)));
      linhaAj.appendChild(sel);
    }
    linhaAj.appendChild(el('span', { class: 'meta', id: 'meta' }));
    enun.appendChild(linhaAj);
    const pdica = enun.querySelector('.dica');
    if (pdica) enun.appendChild(pdica);
    app.appendChild(enun);

    // área de trabalho
    const area = el('main', { class: 'area' });
    area.appendChild(el('aside', { class: 'paleta', id: 'paleta' }));
    area.appendChild(el('section', { class: 'programa' },
      el('div', { class: 'barra-prog' },
        el('strong', null, 'Programa'),
        el('span', { class: 'esp' }),
        el('button', { class: 'btn btn-mini', onclick: desfazer, title: 'Desfazer' }, '↶ Desfazer'),
        des.inicial && des.inicial.length ? el('button', { class: 'btn btn-mini', onclick: recomecar, title: 'Voltar ao programa inicial' }, '⟲ Recomeçar') : null,
        el('button', { class: 'btn btn-mini', onclick: limpar, title: 'Apagar todos os blocos' }, '🗑 Limpar'),
        el('button', { class: 'btn btn-mini btn-py', onclick: abrirPython, title: 'Ver em Python' }, '🐍 Python')
      ),
      el('div', { class: 'prog', id: 'prog' })
    ));
    const palco = el('section', { class: 'palco' });
    palco.appendChild(el('div', { class: 'tela-wrap' }, el('canvas', { id: 'tela', width: 400, height: 400 })));
    palco.appendChild(el('div', { class: 'controles' },
      el('button', { class: 'btn btn-exec', id: 'bExec', onclick: executar }, '▶ Executar'),
      el('button', { class: 'btn btn-parar', id: 'bParar', onclick: () => { if (S) S.parar = true; }, disabled: true }, '■ Parar'),
      el('label', { class: 'vel', title: 'Velocidade' }, '🐢',
        el('input', { type: 'range', min: 0, max: 4, step: 1, value: dados.vel, oninput: e => { dados.vel = +e.target.value; salvarDados(); } }), '🐇')
    ));
    palco.appendChild(el('div', { id: 'resultado', 'aria-live': 'polite' }));
    palco.appendChild(el('div', { class: 'saida-cab' }, 'Saída do programa'));
    palco.appendChild(el('div', { class: 'saida', id: 'saida' }));
    area.appendChild(palco);
    app.appendChild(area);

    prepararCanvas();
    renderPaleta();
    renderProg();
    limparSaida();
    const m0 = BL.criarMundo(des, 0);
    desenhar(m0);
    window.scrollTo(0, 0);
  }

  /* ---------------- paleta ---------------- */
  function textoPadrao(t, p) {
    const fake = BL.novoBloco(t, S.des.mundo);
    return BL.textoCampo(fake, p, S.des.mundo);
  }
  function renderPaleta() {
    const box = $('#paleta');
    box.innerHTML = '';
    const porCat = {};
    S.des.blocos.forEach(t => { const c = BL.DEFS[t].cat; (porCat[c] = porCat[c] || []).push(t); });
    Object.keys(BL.CATS).forEach(c => {
      if (!porCat[c]) return;
      box.appendChild(el('div', { class: 'cat-titulo' }, BL.CATS[c]));
      porCat[c].forEach(t => {
        const d = BL.DEFS[t];
        box.appendChild(el('button', { class: 'bloco proto cat-' + d.cat + (d.corpo ? ' c' : ''), onclick: () => inserir(t), title: 'Toque para colocar no programa' },
          d.partes.map(p => typeof p === 'string' ? el('span', null, p) : el('span', { class: 'falso' }, textoPadrao(t, p))),
          d.senao ? el('span', { class: 'proto-senao' }, 'senão') : null));
      });
    });
  }

  /* ---------------- programa ---------------- */
  function listaExiste(lista) {
    if (lista === S.prog) return true;
    let achou = false;
    BL.percorrer(S.prog, b => { if (b.c === lista || b.e === lista) achou = true; });
    return achou;
  }
  function renderProg() {
    if (!listaExiste(S.cursor.lista)) S.cursor = { lista: S.prog, pos: S.prog.length };
    S.cursor.pos = Math.max(0, Math.min(S.cursor.pos, S.cursor.lista.length));
    const box = $('#prog');
    box.innerHTML = '';
    box.appendChild(renderLista(S.prog, true));
    atualizarMeta();
    const at = box.querySelector('.slot.ativo');
    if (at && at.scrollIntoView) {
      const r = at.getBoundingClientRect(), rb = box.getBoundingClientRect();
      if (r.bottom > rb.bottom || r.top < rb.top) at.scrollIntoView({ block: 'nearest' });
    }
  }
  function renderLista(lista, raiz) {
    const box = el('div', { class: 'lista' + (raiz ? ' raiz' : '') });
    for (let i = 0; i <= lista.length; i++) {
      box.appendChild(slot(lista, i, raiz));
      if (i < lista.length) box.appendChild(elBloco(lista[i], lista, i));
    }
    return box;
  }
  function slot(lista, i, raiz) {
    const ativo = S.cursor.lista === lista && S.cursor.pos === i;
    const vazio = lista.length === 0;
    let txt = null;
    if (ativo) txt = '▶ o próximo bloco entra aqui';
    else if (vazio) txt = raiz ? 'Toque aqui e depois num bloco da paleta' : 'vazio — toque aqui';
    return el('div', {
      class: 'slot' + (ativo ? ' ativo' : '') + (vazio ? ' vazio' : ''),
      onclick: () => { if (S.rodando) return; S.cursor = { lista, pos: i }; renderProg(); }
    }, txt);
  }
  function elBloco(b, lista, idx) {
    const d = BL.DEFS[b.t];
    const w = el('div', { class: 'bloco cat-' + d.cat + (d.corpo ? ' c' : ''), 'data-id': b.id });
    const linha = el('div', {
      class: 'linha', onclick: e => {
        if (S.rodando || e.target.closest('input,select,button')) return;
        S.cursor = d.corpo ? { lista: b.c, pos: b.c.length } : { lista, pos: idx + 1 };
        renderProg();
      }
    });
    d.partes.forEach(p => linha.appendChild(typeof p === 'string' ? el('span', { class: 'txt' }, p) : campoEl(b, p)));
    linha.appendChild(el('span', { class: 'acoes' },
      el('button', { class: 'ac', title: 'Subir', onclick: () => mover(lista, idx, -1), disabled: idx === 0 }, '↑'),
      el('button', { class: 'ac', title: 'Descer', onclick: () => mover(lista, idx, 1), disabled: idx === lista.length - 1 }, '↓'),
      el('button', { class: 'ac ac-x', title: 'Apagar', onclick: () => apagar(lista, idx) }, '✕')
    ));
    w.appendChild(linha);
    if (d.corpo) {
      w.appendChild(el('div', { class: 'corpo' }, renderLista(b.c, false)));
      if (d.senao) {
        w.appendChild(el('div', { class: 'linha senao' }, el('span', { class: 'txt' }, 'senão')));
        w.appendChild(el('div', { class: 'corpo' }, renderLista(b.e, false)));
      }
      w.appendChild(el('div', {
        class: 'pe', onclick: () => { if (S.rodando) return; S.cursor = { lista, pos: idx + 1 }; renderProg(); }
      }));
    }
    return w;
  }
  function campoEl(b, p) {
    const v = b.f[p.f];
    const grade = S.des.mundo === 'grade';
    if (p.tipo === 'sel' || (p.tipo === 'cond' && grade)) {
      const ops = p.tipo === 'sel' ? p.ops : BL.SENSORES;
      return el('select', {
        class: 'campo', onchange: e => { pushUndo(); b.f[p.f] = e.target.value; salvarProg(); }
      }, ops.map(o => el('option', { value: o[1], selected: o[1] === v }, o[0])));
    }
    const w = p.w || (p.tipo === 'cond' ? 10 : p.tipo === 'nome' ? 5 : 4);
    const inp = el('input', {
      class: 'campo campo-' + p.tipo, type: 'text', value: v, size: Math.max(w, String(v).length + 1),
      autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'done'
    });
    inp.addEventListener('focus', () => pushUndo());
    inp.addEventListener('input', () => { b.f[p.f] = inp.value; inp.size = Math.max(w, inp.value.length + 1); salvarProg(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); });
    return inp;
  }
  function inserir(t) {
    if (S.rodando) return;
    pushUndo();
    const b = BL.novoBloco(t, S.des.mundo);
    S.cursor.lista.splice(S.cursor.pos, 0, b);
    if (BL.DEFS[t].corpo) S.cursor = { lista: b.c, pos: 0 };
    else S.cursor.pos++;
    renderProg(); salvarProg(); limparResultado();
    const novo = document.querySelector('[data-id="' + b.id + '"]');
    if (novo) { novo.classList.add('novo'); setTimeout(() => novo.classList.remove('novo'), 500); }
  }
  function apagar(lista, idx) {
    if (S.rodando) return;
    pushUndo();
    lista.splice(idx, 1);
    if (S.cursor.lista === lista && S.cursor.pos > idx) S.cursor.pos--;
    renderProg(); salvarProg(); limparResultado();
  }
  function mover(lista, idx, dir) {
    if (S.rodando) return;
    const j = idx + dir;
    if (j < 0 || j >= lista.length) return;
    pushUndo();
    const t = lista[idx]; lista[idx] = lista[j]; lista[j] = t;
    renderProg(); salvarProg();
  }
  function pushUndo() {
    const snap = JSON.stringify(BL.limpo(S.prog));
    if (S.undo[S.undo.length - 1] === snap) return;
    S.undo.push(snap);
    if (S.undo.length > 40) S.undo.shift();
  }
  function desfazer() {
    if (S.rodando || !S.undo.length) return;
    S.prog = BL.preparar(JSON.parse(S.undo.pop()), S.des.mundo);
    S.cursor = { lista: S.prog, pos: S.prog.length };
    renderProg(); salvarProg(); limparResultado();
  }
  function limpar() {
    if (S.rodando || !S.prog.length) return;
    if (!confirm('Apagar todos os blocos do programa?')) return;
    pushUndo();
    S.prog = []; S.cursor = { lista: S.prog, pos: 0 };
    renderProg(); salvarProg(); limparResultado();
  }
  function recomecar() {
    if (S.rodando) return;
    if (!confirm('Voltar ao programa inicial deste desafio? (Dá para desfazer.)')) return;
    pushUndo();
    S.prog = BL.preparar(clone(S.des.inicial || []), S.des.mundo);
    S.cursor = { lista: S.prog, pos: S.prog.length };
    renderProg(); salvarProg(); limparResultado();
  }
  function salvarProg() {
    dados.progs[S.des.id] = BL.limpo(S.prog);
    salvarDados();
    atualizarMeta();
  }
  function atualizarMeta() {
    const m = $('#meta');
    if (!m) return;
    const n = BL.contarBlocos(S.prog);
    m.textContent = 'Blocos: ' + n + (S.des.maxBlocos ? ' · meta: até ' + S.des.maxBlocos : '');
    m.className = 'meta' + (S.des.maxBlocos && n > S.des.maxBlocos ? ' acima' : '');
  }

  /* ---------------- desenho ---------------- */
  let ctx = null;
  function prepararCanvas() {
    const cv = $('#tela');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = 400 * dpr; cv.height = 400 * dpr;
    ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function desenhar(m) {
    if (!ctx || !m) return;
    if (m.tipo === 'grade') desenharGrade(m);
    else if (m.tipo === 'tartaruga') desenharTartaruga(m);
  }
  function estrelaPath(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }
  function retRed(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function desenharGrade(m) {
    const c = Math.floor(Math.min(384 / m.w, 384 / m.h, 72));
    const ox = (400 - c * m.w) / 2, oy = (400 - c * m.h) / 2;
    ctx.fillStyle = '#e8eef7'; ctx.fillRect(0, 0, 400, 400);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const px = ox + x * c, py = oy + y * c;
      if (m.paredes.has(x + ',' + y)) {
        ctx.fillStyle = '#475569'; retRed(px + 1, py + 1, c - 2, c - 2, 5); ctx.fill();
        ctx.fillStyle = '#64748b'; ctx.fillRect(px + 4, py + c / 2 - 1, c - 8, 2);
      } else {
        ctx.fillStyle = (x + y) % 2 ? '#ffffff' : '#f8fafc'; ctx.fillRect(px, py, c, c);
        ctx.strokeStyle = '#dbe3ef'; ctx.lineWidth = 1; ctx.strokeRect(px + .5, py + .5, c - 1, c - 1);
      }
    }
    // rastro
    ctx.fillStyle = 'rgba(59,130,246,.18)';
    m.rastro.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(ox + x * c + c / 2, oy + y * c + c / 2, c * 0.12, 0, 7); ctx.fill(); });
    // estrela
    if (m.estrela) {
      estrelaPath(ox + m.estrela.x * c + c / 2, oy + m.estrela.y * c + c / 2, c * 0.36);
      ctx.fillStyle = '#facc15'; ctx.fill(); ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 2; ctx.stroke();
    }
    // moedas
    m.moedas.forEach(k => {
      const [x, y] = k.split(',').map(Number);
      const cx = ox + x * c + c / 2, cy = oy + y * c + c / 2;
      ctx.beginPath(); ctx.arc(cx, cy, c * 0.24, 0, 7); ctx.fillStyle = '#fbbf24'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#b45309'; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, c * 0.13, 0, 7); ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5; ctx.stroke();
    });
    // robô
    const cx = ox + m.x * c + c / 2, cy = oy + m.y * c + c / 2, r = c * 0.36;
    const ang = [0, -Math.PI / 2, Math.PI, Math.PI / 2][m.d];
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.fillStyle = '#1d4ed8'; ctx.beginPath(); ctx.moveTo(r * 1.25, 0); ctx.lineTo(r * 0.55, -r * 0.5); ctx.lineTo(r * 0.55, r * 0.5); ctx.closePath(); ctx.fill();
    retRed(-r, -r, r * 1.7, r * 2, r * 0.45); ctx.fillStyle = '#3b82f6'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#1e3a8a'; ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.42, r * 0.24, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.25, r * 0.42, r * 0.24, 0, 7); ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.42, r * 0.11, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.35, r * 0.42, r * 0.11, 0, 7); ctx.fill();
    ctx.restore();
    if (m.bateu) {
      const bx = ox + m.bateu[0] * c + c / 2, by = oy + m.bateu[1] * c + c / 2, s = c * 0.25;
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx - s, by - s); ctx.lineTo(bx + s, by + s); ctx.moveTo(bx + s, by - s); ctx.lineTo(bx - s, by + s); ctx.stroke();
      ctx.lineCap = 'butt';
    }
  }
  function desenharTartaruga(m) {
    const X = x => 200 + x, Y = y => 200 - y;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 400, 400);
    ctx.lineWidth = 1;
    for (let v = -200; v <= 200; v += 50) {
      ctx.strokeStyle = v === 0 ? '#94a3b8' : '#e5e9f0';
      ctx.beginPath(); ctx.moveTo(X(v) + .5, 0); ctx.lineTo(X(v) + .5, 400); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, Y(v) + .5); ctx.lineTo(400, Y(v) + .5); ctx.stroke();
    }
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px system-ui, sans-serif';
    [-150, -100, -50, 50, 100, 150].forEach(v => { ctx.fillText(String(v), X(v) + 2, Y(0) + 11); ctx.fillText(String(v), X(0) + 3, Y(v) - 2); });
    // modelo
    if (S && !S.des.livre && S.des.solucao) {
      let ref = null;
      try { ref = BL.referencia(S.des, 0); } catch (e) { ref = null; }
      if (ref) {
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 7; ctx.lineCap = 'round';
        if (ctx.setLineDash) ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ref.seg.forEach(s => { ctx.moveTo(X(s[0]), Y(s[1])); ctx.lineTo(X(s[2]), Y(s[3])); });
        ctx.stroke();
        if (ctx.setLineDash) ctx.setLineDash([]);
      }
    }
    // traços
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    let corAtual = null;
    m.seg.forEach(s => {
      if (s[4] !== corAtual) { if (corAtual) ctx.stroke(); corAtual = s[4]; ctx.strokeStyle = corAtual; ctx.beginPath(); }
      ctx.moveTo(X(s[0]), Y(s[1])); ctx.lineTo(X(s[2]), Y(s[3]));
    });
    if (corAtual) ctx.stroke();
    ctx.lineCap = 'butt';
    // tartaruga
    ctx.save();
    ctx.translate(X(m.x), Y(m.y));
    ctx.rotate(-m.ang * Math.PI / 180);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#65a30d';
    [[6, -8], [6, 8], [-6, -8], [-6, 8]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 3.5, 0, 7); ctx.fill(); });
    ctx.beginPath(); ctx.arc(12, 0, 4.5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse ? ctx.ellipse(0, 0, 10, 8, 0, 0, 7) : ctx.arc(0, 0, 9, 0, 7);
    ctx.fillStyle = '#15803d'; ctx.fill(); ctx.strokeStyle = '#14532d'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = m.caneta ? (m.arco ? 'hsl(' + m.matiz + ',85%,48%)' : m.cor) : '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, 7); ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /* ---------------- saída e resultado ---------------- */
  function limparSaida() {
    const s = $('#saida');
    if (!s) return;
    s.innerHTML = '';
    s.appendChild(el('div', { class: 'saida-vazia' }, S.des.mundo === 'console' ? 'O que o programa mostrar aparece aqui.' : 'Mensagens do bloco “mostre” aparecem aqui.'));
  }
  function addSaida(cls, txt) {
    const s = $('#saida');
    if (!s) return;
    const v = s.querySelector('.saida-vazia');
    if (v) v.remove();
    s.appendChild(el('div', { class: 'ln ' + cls }, txt));
    if (s.childNodes.length > 600) s.removeChild(s.firstChild);
    s.scrollTop = s.scrollHeight;
  }
  function syncSaida(m, visto) {
    for (; visto < m.saida.length; visto++) {
      const it = m.saida[visto];
      if (it.t === 'out') addSaida('out', it.v);
      else addSaida('in', '❓ ' + it.txt + ' → ' + BL.fmt(it.v));
    }
    return visto;
  }
  function limparResultado() { const r = $('#resultado'); if (r) { r.innerHTML = ''; r.className = ''; } limparMarcas(); }
  function limparMarcas() {
    document.querySelectorAll('.bloco.ativo, .bloco.erro').forEach(b => b.classList.remove('ativo', 'erro'));
  }
  function mostrarResultado(tipo, titulo, msg, extra) {
    const r = $('#resultado');
    if (!r) return;
    r.innerHTML = '';
    r.className = 'res res-' + tipo;
    r.appendChild(el('div', { class: 'res-tit' }, titulo));
    if (msg) r.appendChild(el('div', { class: 'res-msg' }, msg));
    if (extra) r.appendChild(extra);
    if (r.scrollIntoView) r.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function destacar(id) {
    if (S.ultimoAtivo) S.ultimoAtivo.classList.remove('ativo');
    const b = id ? document.querySelector('.prog [data-id="' + id + '"]') : null;
    if (b) b.classList.add('ativo');
    S.ultimoAtivo = b;
  }
  function marcarErro(id) {
    if (!id) return;
    const b = document.querySelector('.prog [data-id="' + id + '"]');
    if (b) { b.classList.add('erro'); if (b.scrollIntoView) b.scrollIntoView({ block: 'nearest' }); }
  }
  function botoesRodando(r) {
    const e = $('#bExec'), p = $('#bParar'), pg = $('#prog'), pal = $('#paleta');
    if (e) e.disabled = r;
    if (p) p.disabled = !r;
    if (pg) pg.classList.toggle('travado', r);
    if (pal) pal.classList.toggle('travado', r);
  }

  /* ---------------- execução ---------------- */
  const VEL = [700, 380, 170, 50, 0];
  async function executar() {
    if (!S || S.rodando) return;
    const s = S, des = s.des;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    s.rodando = true; s.parar = false;
    botoesRodando(true); limparResultado();
    const sv = $('#saida'); if (sv) sv.innerHTML = '';
    const casos = BL.numCasos(des);
    const nomeCaso = des.mundo === 'grade' ? 'Mapa' : 'Teste';
    let erro = null, casoErro = -1;
    for (let k = 0; k < casos; k++) {
      if (s.parar || S !== s) break;
      const m = BL.criarMundo(des, k, { interativo: !des.testes });
      s.mundo = m;
      if (casos > 1) addSaida('info', '— ' + nomeCaso + ' ' + (k + 1) + ' de ' + casos + (des.testes ? ' (entradas: ' + des.testes[k].map(BL.fmt).join(', ') + ')' : '') + ' —');
      desenhar(m);
      if (casos > 1 && VEL[dados.vel] > 0) await espera(350);
      let visto = 0, lote = 0;
      const g = BL.executar(s.prog, m);
      try {
        while (true) {
          if (s.parar || S !== s) break;
          const r = g.next();
          if (r.done) break;
          visto = syncSaida(m, visto);
          const d = VEL[dados.vel];
          lote++;
          if (d > 0 || lote >= 40) {
            destacar(r.value && r.value.id); desenhar(m);
            await espera(d); lote = 0;
          }
        }
      } catch (e) {
        erro = e instanceof BL.ErroBL ? e : new BL.ErroBL('Erro inesperado: ' + e.message);
        casoErro = k;
      }
      if (S !== s) return;
      syncSaida(m, visto); desenhar(m);
      if (erro || s.parar) break;
      if (k < casos - 1) await espera(VEL[dados.vel] > 0 ? 500 : 60);
    }
    if (S !== s) return;
    s.rodando = false;
    botoesRodando(false);
    destacar(null);
    if (s.parar) { mostrarResultado('info', 'Execução interrompida.'); return; }
    if (erro) {
      marcarErro(erro.blocoId);
      mostrarResultado('erro', '🐞 Algo deu errado' + (casos > 1 ? ' (' + nomeCaso.toLowerCase() + ' ' + (casoErro + 1) + ')' : ''), erro.message);
      return;
    }
    if (des.livre) {
      const falta = BL.checarExige(des, s.prog);
      if (falta) { mostrarResultado('erro', 'Quase lá!', falta); return; }
      if (!s.prog.length) { mostrarResultado('info', 'O programa está vazio.', 'Toque nos blocos da paleta para montar seu programa.'); return; }
      if (des.ehExemplo || !s.aula) { mostrarResultado('ok', '✅ Programa executado!', des.ehExemplo ? 'Experimente fazer mudanças e executar de novo. Quando estiver pronto, vá para o Desafio 1.' : null, s.aula ? botaoProximo() : null); return; }
      registrar(3);
      mostrarResultado('ok', '🎨 Projeto executado! ' + estrelasTxt(3), 'Continue melhorando quanto quiser — e mostre para a turma.', botaoProximo());
      return;
    }
    const v = BL.verificar(des, s.prog);
    if (v.ok) {
      if (des.ehExemplo) { mostrarResultado('ok', '✅ Funcionou!', 'Agora é com você: vá para o Desafio 1.', botaoProximo()); return; }
      registrar(v.estrelas);
      mostrarResultado('ok', '🎉 Desafio concluído! ' + estrelasTxt(v.estrelas), v.msg, botaoProximo());
    } else {
      if (v.blocoId) marcarErro(v.blocoId);
      mostrarResultado('erro', 'Ainda não…', v.msg);
    }
  }
  function registrar(n) {
    const d = S.des;
    if ((dados.estrelas[d.id] || 0) < n) {
      dados.estrelas[d.id] = n; salvarDados();
      const abaAtual = document.querySelector('.aba.atual');
      if (abaAtual && S.idx > 0) { abaAtual.classList.add('feita'); abaAtual.innerHTML = ''; abaAtual.appendChild(el('span', null, 'Desafio ' + S.idx, el('small', null, ' ' + estrelasTxt(n)))); }
      const tot = document.querySelector('.topo .total'); if (tot) tot.textContent = '★ ' + totalEstrelas().t;
    }
  }
  function botaoProximo() {
    if (!S.aula) return null;
    const a = S.aula;
    if (S.idx < a.desafios.length) return el('a', { class: 'btn btn-pri', href: '#/aula/' + a.n + '/' + (S.idx + 1) }, S.idx === 0 ? 'Ir para o Desafio 1 ▶' : 'Próximo desafio ▶');
    const prox = AULAS.find(x => x.n === a.n + 1);
    if (prox) return el('a', { class: 'btn btn-pri', href: '#/aula/' + prox.n + '/0' }, 'Aula ' + prox.n + ': ' + prox.titulo + ' ▶');
    return el('a', { class: 'btn btn-pri', href: '#/lab' }, '🧪 Ir para o Laboratório livre');
  }

  /* ---------------- janela do Python ---------------- */
  function fecharModal() { const m = $('.modal-fundo'); if (m) m.remove(); }
  function abrirModal(titulo, conteudo) {
    fecharModal();
    const fundo = el('div', { class: 'modal-fundo', onclick: e => { if (e.target === fundo) fecharModal(); } },
      el('div', { class: 'modal', role: 'dialog', 'aria-label': titulo },
        el('h3', null, titulo),
        el('div', { class: 'modal-rolagem' }, conteudo),
        el('div', { class: 'modal-bts' }, el('button', { class: 'btn btn-pri', onclick: fecharModal }, 'Fechar'))));
    document.body.appendChild(fundo);
  }
  function abrirPython() {
    const cod = BL.paraPython(S.prog, S.des.mundo);
    const pre = el('pre', { class: 'codigo' }, cod);
    const nota = S.des.mundo === 'grade'
      ? 'Os comandos do robô viriam de uma biblioteca (aqui chamada de “robo”). '
      : S.des.mundo === 'tartaruga' ? 'Em Python também existe a tartaruga: a biblioteca turtle. ' : '';
    const fundo = el('div', { class: 'modal-fundo', onclick: e => { if (e.target === fundo) fecharModal(); } },
      el('div', { class: 'modal', role: 'dialog', 'aria-label': 'Programa em Python' },
        el('h3', null, '🐍 Seu programa em Python'),
        el('p', { class: 'sut' }, 'É assim que o seu programa ficaria escrito em Python, uma linguagem de texto usada por profissionais. ' + nota + 'Compare cada linha com os blocos: o recuo (espaço à esquerda) mostra o que está “dentro” de cada laço ou condição.'),
        pre,
        el('div', { class: 'modal-bts' },
          el('button', {
            class: 'btn btn-sec', onclick: e => {
              const b = e.target;
              const ok = () => { b.textContent = '✔ Copiado'; setTimeout(() => { b.textContent = 'Copiar'; }, 1500); };
              if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cod).then(ok, () => { });
              else { const r = document.createRange(); r.selectNodeContents(pre); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); try { document.execCommand('copy'); ok(); } catch (er) { } }
            }
          }, 'Copiar'),
          el('button', { class: 'btn btn-pri', onclick: fecharModal }, 'Fechar')
        )));
    document.body.appendChild(fundo);
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });

  rota();
})();
