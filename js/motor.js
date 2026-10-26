/* BlocoLab — motor
   Expressões, definição dos blocos, mundos (robô, tartaruga, console),
   execução passo a passo, verificação dos desafios e tradução para Python.
   Sem dependências. Funciona no navegador e no Node (para testes). */
(function (global) {
  'use strict';
  const BL = {};

  class ErroBL extends Error {
    constructor(msg, blocoId) { super(msg); this.name = 'ErroBL'; this.blocoId = blocoId || null; }
  }
  BL.ErroBL = ErroBL;

  function semAcento(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function normNome(s) { return semAcento(s).toLowerCase().trim(); }
  BL.normNome = normNome;
  BL.normSaida = s => semAcento(s).toLowerCase().replace(/\s+/g, '');

  /* ------------------------------------------------------------------ */
  /* Expressões                                                          */
  /* ------------------------------------------------------------------ */
  const LETRA = /[A-Za-z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/;
  const LETRA_DIG = /[A-Za-z0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/;
  const ASPAS_D = '"\u201C\u201D', ASPAS_S = "'\u2018\u2019";
  const OPS1 = {
    '+': '+', '-': '-', '\u2212': '-', '*': '*', '\u00D7': '*', '\u00B7': '*', '/': '/', '\u00F7': '/', ':': '/',
    '%': '%', '^': '^', '=': '=', '\u2260': '≠', '<': '<', '>': '>', '\u2264': '≤', '\u2265': '≥',
    '(': '(', ')': ')', ',': ',', ';': ','
  };
  const OPS2 = { '==': '=', '!=': '≠', '<>': '≠', '<=': '≤', '>=': '≥', '**': '^', '=<': '≤', '=>': '≥' };

  function tokenizar(src) {
    src = String(src == null ? '' : src);
    const t = [];
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let j = i;
        while (j < src.length && /[0-9.]/.test(src[j])) j++;
        const s = src.slice(i, j);
        if ((s.match(/\./g) || []).length > 1) throw new ErroBL('O número "' + s + '" está escrito de um jeito estranho. Use ponto para decimais, ex.: 2.5');
        t.push({ k: 'num', v: parseFloat(s) });
        i = j; continue;
      }
      if (ASPAS_D.includes(c) || ASPAS_S.includes(c)) {
        const fam = ASPAS_D.includes(c) ? ASPAS_D : ASPAS_S;
        let j = i + 1;
        while (j < src.length && !fam.includes(src[j])) j++;
        if (j >= src.length) throw new ErroBL('Faltou fechar as aspas do texto.');
        t.push({ k: 'str', v: src.slice(i + 1, j) });
        i = j + 1; continue;
      }
      if (LETRA.test(c)) {
        let j = i;
        while (j < src.length && LETRA_DIG.test(src[j])) j++;
        const w = normNome(src.slice(i, j));
        if (w === 'e' || w === 'and') t.push({ k: 'op', v: 'e' });
        else if (w === 'ou' || w === 'or') t.push({ k: 'op', v: 'ou' });
        else if (w === 'nao' || w === 'not') t.push({ k: 'op', v: 'nao' });
        else if (w === 'verdadeiro' || w === 'true') t.push({ k: 'bool', v: true });
        else if (w === 'falso' || w === 'false') t.push({ k: 'bool', v: false });
        else t.push({ k: 'id', v: w });
        i = j; continue;
      }
      const dois = src.substr(i, 2);
      if (OPS2[dois]) { t.push({ k: 'op', v: OPS2[dois] }); i += 2; continue; }
      if (OPS1[c]) { t.push({ k: 'op', v: OPS1[c] }); i++; continue; }
      throw new ErroBL('Não conheço o símbolo "' + c + '".');
    }
    return t;
  }

  const COMP = ['=', '≠', '<', '>', '≤', '≥'];
  function analisarTokens(t, modoLista) {
    let i = 0;
    const ehOp = v => t[i] && t[i].k === 'op' && t[i].v === v;
    function esperar(v, msg) { if (!ehOp(v)) throw new ErroBL(msg); i++; }
    function ou() { let a = e(); while (ehOp('ou')) { i++; a = { n: 'bin', op: 'ou', a, b: e() }; } return a; }
    function e() { let a = nao(); while (ehOp('e')) { i++; a = { n: 'bin', op: 'e', a, b: nao() }; } return a; }
    function nao() { if (ehOp('nao')) { i++; return { n: 'nao', a: nao() }; } return comp(); }
    function comp() {
      let a = soma();
      while (t[i] && t[i].k === 'op' && COMP.includes(t[i].v)) { const op = t[i++].v; a = { n: 'bin', op, a, b: soma() }; }
      return a;
    }
    function soma() { let a = mult(); while (ehOp('+') || ehOp('-')) { const op = t[i++].v; a = { n: 'bin', op, a, b: mult() }; } return a; }
    function mult() { let a = un(); while (ehOp('*') || ehOp('/') || ehOp('%')) { const op = t[i++].v; a = { n: 'bin', op, a, b: un() }; } return a; }
    function un() {
      if (ehOp('-')) { i++; return { n: 'neg', a: un() }; }
      if (ehOp('+')) { i++; return un(); }
      return pot();
    }
    function pot() { const b = prim(); if (ehOp('^')) { i++; return { n: 'bin', op: '^', a: b, b: un() }; } return b; }
    function prim() {
      const k = t[i];
      if (!k) throw new ErroBL('A conta terminou antes da hora. Está faltando algum número ou variável?');
      if (k.k === 'num') { i++; return { n: 'num', v: k.v }; }
      if (k.k === 'str') { i++; return { n: 'str', v: k.v }; }
      if (k.k === 'bool') { i++; return { n: 'bool', v: k.v }; }
      if (k.k === 'id') {
        i++;
        if (ehOp('(')) {
          i++;
          const args = [];
          if (!ehOp(')')) { args.push(ou()); while (ehOp(',')) { i++; args.push(ou()); } }
          esperar(')', 'Faltou fechar o parêntese de ' + k.v + '( ).');
          return { n: 'call', f: k.v, args };
        }
        return { n: 'var', v: k.v };
      }
      if (ehOp('(')) { i++; const x = ou(); esperar(')', 'Faltou fechar um parêntese.'); return x; }
      throw new ErroBL('Não entendi o "' + k.v + '" nessa posição.');
    }
    if (modoLista) {
      const r = [];
      if (!t.length) return r;
      r.push(ou());
      while (ehOp(',')) { i++; r.push(ou()); }
      if (i < t.length) throw new ErroBL('Não entendi a lista de valores. Separe os valores com vírgula.');
      return r;
    }
    if (!t.length) throw new ErroBL('Há um espaço em branco num bloco. Preencha-o.');
    const r = ou();
    if (i < t.length) {
      const sobra = t[i].k === 'str' ? '"' + t[i].v + '"' : t[i].v;
      if (t[i].k === 'op' && t[i].v === ',') throw new ErroBL('Encontrei uma vírgula. Para números decimais, use ponto: 2.5');
      if (t[i].k === 'id' && t[i].v === 'x') throw new ErroBL('Para multiplicar, use * (asterisco). Exemplo: 2 * 3');
      throw new ErroBL('Sobrou "' + sobra + '" na conta. Faltou algum operador (+, -, *, /)?');
    }
    return r;
  }
  const cache = new Map();
  function analisar(src) {
    const k = 'e' + src;
    if (cache.has(k)) return cache.get(k);
    const r = analisarTokens(tokenizar(src), false);
    cache.set(k, r);
    return r;
  }
  function analisarLista(src) {
    const k = 'l' + src;
    if (cache.has(k)) return cache.get(k);
    const r = analisarTokens(tokenizar(src), true);
    cache.set(k, r);
    return r;
  }
  BL.analisar = analisar;

  function fmt(v) {
    if (typeof v === 'number') {
      if (!isFinite(v)) return isNaN(v) ? 'indefinido' : (v > 0 ? 'infinito' : '-infinito');
      let r = Math.round(v * 1e6) / 1e6;
      if (Object.is(r, -0)) r = 0;
      if (Math.abs(r) >= 1e15) return String(r).replace('.', ',');
      return String(r).replace('.', ',');
    }
    if (typeof v === 'boolean') return v ? 'verdadeiro' : 'falso';
    return String(v);
  }
  BL.fmt = fmt;

  const FUNCS = {
    raiz: { n: [1], f: x => { if (x < 0) throw new ErroBL('Não existe raiz quadrada (real) de número negativo: raiz(' + fmt(x) + ').'); return Math.sqrt(x); }, py: 'math.sqrt', imp: 'math' },
    abs: { n: [1], f: Math.abs, py: 'abs' },
    arred: { n: [1, 2], f: (x, c) => { c = c || 0; const p = Math.pow(10, c); return Math.round(x * p) / p; }, py: 'round' },
    piso: { n: [1], f: Math.floor, py: 'math.floor', imp: 'math' },
    teto: { n: [1], f: Math.ceil, py: 'math.ceil', imp: 'math' },
    aleatorio: { n: [2], f: (a, b) => { a = Math.ceil(a); b = Math.floor(b); if (b < a) throw new ErroBL('Em aleatorio(a, b), o primeiro número deve ser menor.'); return a + Math.floor(Math.random() * (b - a + 1)); }, py: 'random.randint', imp: 'random' },
    sen: { n: [1], f: x => Math.sin(x * Math.PI / 180) },
    cos: { n: [1], f: x => Math.cos(x * Math.PI / 180) },
    max: { n: '*', f: Math.max, py: 'max' },
    min: { n: '*', f: Math.min, py: 'min' }
  };
  FUNCS.sqrt = FUNCS.raiz; FUNCS.round = FUNCS.arred; FUNCS.arredondar = FUNCS.arred;
  BL.FUNCS = FUNCS;

  const SENSORES = [
    ['caminho livre à frente', 'frente_livre'],
    ['parede à frente', 'nao frente_livre'],
    ['caminho livre à esquerda', 'esquerda_livre'],
    ['caminho livre à direita', 'direita_livre'],
    ['chegou à estrela', 'na_estrela'],
    ['não chegou à estrela', 'nao na_estrela'],
    ['tem moeda aqui', 'tem_moeda'],
    ['não tem moeda aqui', 'nao tem_moeda']
  ];
  const SENSORES_NOMES = ['frente_livre', 'esquerda_livre', 'direita_livre', 'na_estrela', 'tem_moeda'];
  BL.SENSORES = SENSORES;

  function num(v, op) {
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') throw new ErroBL('Não dá para fazer a conta "' + op + '" com verdadeiro/falso.');
    throw new ErroBL('Não dá para fazer a conta "' + op + '" com o texto "' + v + '".');
  }
  function paraBool(v) {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    return v !== '';
  }
  function iguais(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
    if (typeof a === 'string' && typeof b === 'string') return normNome(a) === normNome(b);
    return a === b;
  }
  function comparar(a, b, op) {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
    throw new ErroBL('Não dá para comparar (' + op + ') um número com um texto.');
  }

  function lerVar(nome, ctx, env) {
    if (ctx.mundo && ctx.mundo.sensor) {
      const s = ctx.mundo.sensor(nome);
      if (s !== undefined) return s;
    }
    for (let e = env; e; e = e.pai) if (nome in e.vars) return e.vars[nome];
    if (nome === 'pi') return Math.PI;
    if (SENSORES_NOMES.includes(nome)) throw new ErroBL('O sensor "' + nome + '" só funciona nos desafios do robô.');
    throw new ErroBL('A variável "' + nome + '" ainda não existe. Crie-a antes com o bloco "defina".');
  }

  function avaliar(no, ctx, env) {
    switch (no.n) {
      case 'num': case 'str': case 'bool': return no.v;
      case 'var': return lerVar(no.v, ctx, env);
      case 'neg': return -num(avaliar(no.a, ctx, env), '-');
      case 'nao': return !paraBool(avaliar(no.a, ctx, env));
      case 'call': {
        const F = FUNCS[no.f];
        if (!F) throw new ErroBL('Não conheço a função "' + no.f + '". Funções disponíveis: raiz, abs, arred, piso, teto, aleatorio, sen, cos, max, min.');
        if (F.n !== '*' && !F.n.includes(no.args.length)) throw new ErroBL('A função ' + no.f + '( ) precisa de ' + F.n.join(' ou ') + ' valor(es).');
        const args = no.args.map(a => num(avaliar(a, ctx, env), no.f));
        return F.f.apply(null, args);
      }
      case 'bin': {
        if (no.op === 'e') return paraBool(avaliar(no.a, ctx, env)) && paraBool(avaliar(no.b, ctx, env));
        if (no.op === 'ou') return paraBool(avaliar(no.a, ctx, env)) || paraBool(avaliar(no.b, ctx, env));
        const a = avaliar(no.a, ctx, env), b = avaliar(no.b, ctx, env);
        switch (no.op) {
          case '+':
            if (typeof a === 'string' || typeof b === 'string') return fmt(a) + fmt(b);
            return num(a, '+') + num(b, '+');
          case '-': return num(a, '-') - num(b, '-');
          case '*': return num(a, '*') * num(b, '*');
          case '/': if (num(b, '/') === 0) throw new ErroBL('Divisão por zero! Não existe divisão por 0.'); return num(a, '/') / b;
          case '%': {
            if (num(b, '%') === 0) throw new ErroBL('Resto da divisão por zero não existe.');
            const r = num(a, '%') % b;
            return (r !== 0 && (r < 0) !== (b < 0)) ? r + b : r;
          }
          case '^': {
            const r = Math.pow(num(a, '^'), num(b, '^'));
            if (isNaN(r)) throw new ErroBL('Essa potência não tem resultado entre os números reais.');
            return r;
          }
          case '=': return iguais(a, b);
          case '≠': return !iguais(a, b);
          case '<': return comparar(a, b, '<') < 0;
          case '>': return comparar(a, b, '>') > 0;
          case '≤': return comparar(a, b, '≤') <= 0 || iguais(a, b);
          case '≥': return comparar(a, b, '≥') >= 0 || iguais(a, b);
        }
      }
    }
    throw new ErroBL('Expressão inválida.');
  }

  /* ------------------------------------------------------------------ */
  /* Blocos                                                              */
  /* ------------------------------------------------------------------ */
  const CORES = [
    ['preto', '#1f2937'], ['vermelho', '#dc2626'], ['laranja', '#ea580c'], ['amarelo', '#ca8a04'],
    ['verde', '#16a34a'], ['azul', '#2563eb'], ['roxo', '#7c3aed'], ['rosa', '#db2777'], ['arco-íris 🌈', 'arcoiris']
  ];
  const CATS = {
    mov: 'Robô', tart: 'Tartaruga', es: 'Mostrar e perguntar', var: 'Variáveis', ctrl: 'Controle', fn: 'Meus blocos'
  };
  const DEFS = {
    avancar: { cat: 'mov', partes: ['avançar ➜'] },
    esquerda: { cat: 'mov', partes: ['virar à esquerda ↺'] },
    direita: { cat: 'mov', partes: ['virar à direita ↻'] },
    pegar: { cat: 'mov', partes: ['pegar moeda'] },
    andar: { cat: 'tart', partes: ['andar', { f: 'n', tipo: 'expr', def: '100' }, 'passos'] },
    girar_esq: { cat: 'tart', partes: ['girar ↺', { f: 'g', tipo: 'expr', def: '90' }, 'graus'] },
    girar_dir: { cat: 'tart', partes: ['girar ↻', { f: 'g', tipo: 'expr', def: '90' }, 'graus'] },
    cor: { cat: 'tart', partes: ['cor da caneta', { f: 'cor', tipo: 'sel', def: '#2563eb', ops: CORES }] },
    caneta: { cat: 'tart', partes: ['caneta', { f: 'p', tipo: 'sel', def: 'cima', ops: [['levantada', 'cima'], ['abaixada', 'baixo']] }] },
    repetir: { cat: 'ctrl', partes: ['repita', { f: 'n', tipo: 'expr', def: '4' }, 'vezes'], corpo: true },
    contar: { cat: 'ctrl', partes: ['conte', { f: 'v', tipo: 'nome', def: 'i' }, 'de', { f: 'a', tipo: 'expr', def: '1' }, 'até', { f: 'b', tipo: 'expr', def: '10' }], corpo: true },
    se: { cat: 'ctrl', partes: ['se', { f: 'c', tipo: 'cond', def: 'x > 0', defGrade: 'frente_livre' }, 'então'], corpo: true },
    se_senao: { cat: 'ctrl', partes: ['se', { f: 'c', tipo: 'cond', def: 'x > 0', defGrade: 'frente_livre' }, 'então'], corpo: true, senao: true },
    enquanto: { cat: 'ctrl', partes: ['enquanto', { f: 'c', tipo: 'cond', def: 'x < 10', defGrade: 'nao na_estrela' }, 'faça'], corpo: true },
    repita_ate: { cat: 'ctrl', partes: ['repita até', { f: 'c', tipo: 'cond', def: 'x = 10', defGrade: 'na_estrela' }], corpo: true },
    definir: { cat: 'var', partes: ['defina', { f: 'v', tipo: 'nome', def: 'x' }, '=', { f: 'x', tipo: 'expr', def: '0', w: 8 }] },
    mudar: { cat: 'var', partes: ['aumente', { f: 'v', tipo: 'nome', def: 'x' }, 'em', { f: 'x', tipo: 'expr', def: '1' }] },
    mostrar: { cat: 'es', partes: ['mostre', { f: 'x', tipo: 'expr', def: '"Olá!"', w: 14 }] },
    perguntar: { cat: 'es', partes: ['pergunte', { f: 'txt', tipo: 'texto', def: 'Digite um número', w: 14 }, 'e guarde em', { f: 'v', tipo: 'nome', def: 'n' }] },
    funcao: { cat: 'fn', partes: ['crie o bloco', { f: 'nome', tipo: 'nome', def: 'quadrado' }, 'com entradas', { f: 'p', tipo: 'texto', def: 'lado', w: 8 }], corpo: true },
    usar: { cat: 'fn', partes: ['use o bloco', { f: 'nome', tipo: 'nome', def: 'quadrado' }, 'com', { f: 'a', tipo: 'texto', def: '50', w: 8 }] }
  };
  BL.DEFS = DEFS; BL.CATS = CATS; BL.CORES = CORES;

  let seq = 0;
  function novoId() { seq++; return 'b' + seq.toString(36) + Math.random().toString(36).slice(2, 6); }
  function camposDe(t) { return DEFS[t].partes.filter(p => typeof p !== 'string'); }

  BL.novoBloco = function (t, mundo) {
    const d = DEFS[t];
    const b = { id: novoId(), t, f: {} };
    camposDe(t).forEach(p => { b.f[p.f] = (mundo === 'grade' && p.defGrade) ? p.defGrade : p.def; });
    if (d.corpo) b.c = [];
    if (d.senao) b.e = [];
    return b;
  };
  /* completa ids, campos e corpos faltantes (para programas escritos à mão ou vindos do armazenamento) */
  BL.preparar = function (lista, mundo) {
    (lista || []).forEach(b => {
      const d = DEFS[b.t];
      if (!d) return;
      b.id = novoId();
      b.f = b.f || {};
      camposDe(b.t).forEach(p => { if (b.f[p.f] == null) b.f[p.f] = (mundo === 'grade' && p.defGrade) ? p.defGrade : p.def; });
      if (d.corpo) { b.c = b.c || []; BL.preparar(b.c, mundo); }
      if (d.senao) { b.e = b.e || []; BL.preparar(b.e, mundo); }
    });
    return lista;
  };
  BL.limpo = function (lista) { // cópia sem ids, para salvar
    return lista.map(b => {
      const o = { t: b.t, f: Object.assign({}, b.f) };
      if (b.c) o.c = BL.limpo(b.c);
      if (b.e) o.e = BL.limpo(b.e);
      return o;
    });
  };
  function percorrer(lista, f) { for (const b of lista) { f(b); if (b.c) percorrer(b.c, f); if (b.e) percorrer(b.e, f); } }
  BL.percorrer = percorrer;
  BL.contarBlocos = prog => { let n = 0; percorrer(prog, () => n++); return n; };

  /* ------------------------------------------------------------------ */
  /* Mundos                                                              */
  /* ------------------------------------------------------------------ */
  function converterEntrada(r) {
    const s = String(r).trim().replace(',', '.');
    return (s !== '' && isFinite(Number(s))) ? Number(s) : String(r).trim();
  }
  class MundoBase {
    constructor() { this.saida = []; this.entradas = null; this.interativo = false; }
    mostrar(t) {
      if (this.saida.length > 3000) throw new ErroBL('Mensagens demais! Será que há um laço sem fim?');
      this.saida.push({ t: 'out', v: t });
    }
    perguntar(txt) {
      let v;
      if (this.entradas) {
        if (!this.entradas.length) throw new ErroBL('O programa fez mais perguntas do que o teste esperava.');
        v = this.entradas.shift();
      } else if (this.interativo && typeof prompt === 'function') {
        const r = prompt(String(txt));
        if (r === null) throw new ErroBL('Você cancelou a resposta. O programa parou.');
        v = converterEntrada(r);
      } else throw new ErroBL('Este desafio não usa o bloco "pergunte".');
      this.saida.push({ t: 'in', txt: String(txt), v });
      return v;
    }
    sensor() { return undefined; }
    saidas() { return this.saida.filter(s => s.t === 'out').map(s => s.v); }
  }

  const DIRS = [[1, 0], [0, -1], [-1, 0], [0, 1]]; // leste, norte, oeste, sul (índice+1 = virar à esquerda)
  const CHAR_DIR = { '>': 0, '^': 1, '<': 2, 'v': 3 };
  class MundoGrade extends MundoBase {
    constructor(mapa) {
      super();
      this.tipo = 'grade';
      this.h = mapa.length;
      this.w = Math.max.apply(null, mapa.map(l => l.length));
      this.paredes = new Set(); this.moedas = new Set(); this.estrela = null;
      this.x = 0; this.y = 0; this.d = 0;
      mapa.forEach((linha, y) => {
        for (let x = 0; x < this.w; x++) {
          const c = linha[x] || '#';
          if (c === '#') this.paredes.add(x + ',' + y);
          else if (c === 'o') this.moedas.add(x + ',' + y);
          else if (c === '*') this.estrela = { x, y };
          else if (c in CHAR_DIR) { this.x = x; this.y = y; this.d = CHAR_DIR[c]; }
        }
      });
      this.totalMoedas = this.moedas.size;
      this.rastro = [[this.x, this.y]];
      this.bateu = null;
    }
    livre(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h && !this.paredes.has(x + ',' + y); }
    frente(d) { if (d == null) d = this.d; return [this.x + DIRS[d][0], this.y + DIRS[d][1]]; }
    avancar() {
      const [nx, ny] = this.frente();
      if (!this.livre(nx, ny)) { this.bateu = [nx, ny]; throw new ErroBL('O robô bateu na parede! 💥'); }
      this.x = nx; this.y = ny; this.rastro.push([nx, ny]);
    }
    esquerda() { this.d = (this.d + 1) % 4; }
    direita() { this.d = (this.d + 3) % 4; }
    pegar() {
      const k = this.x + ',' + this.y;
      if (!this.moedas.has(k)) throw new ErroBL('Não há moeda aqui para pegar!');
      this.moedas.delete(k);
    }
    sensor(n) {
      switch (n) {
        case 'frente_livre': return this.livre.apply(this, this.frente());
        case 'esquerda_livre': return this.livre.apply(this, this.frente((this.d + 1) % 4));
        case 'direita_livre': return this.livre.apply(this, this.frente((this.d + 3) % 4));
        case 'na_estrela': return !!this.estrela && this.x === this.estrela.x && this.y === this.estrela.y;
        case 'tem_moeda': return this.moedas.has(this.x + ',' + this.y);
      }
      return undefined;
    }
    avaliar() {
      if (!this.sensor('na_estrela')) return { ok: false, msg: 'O robô não terminou na estrela ⭐.' };
      if (this.moedas.size) return { ok: false, msg: this.moedas.size === 1 ? 'Ficou 1 moeda para trás.' : 'Ficaram ' + this.moedas.size + ' moedas para trás.' };
      return { ok: true };
    }
  }

  class MundoTartaruga extends MundoBase {
    constructor(ini) {
      super();
      ini = ini || {};
      this.tipo = 'tartaruga';
      this.x = ini.x || 0; this.y = ini.y || 0; this.ang = ini.ang || 0;
      this.ini = { x: this.x, y: this.y, ang: this.ang };
      this.caneta = true; this.cor = '#1f2937'; this.arco = false; this.matiz = 0;
      this.seg = [];
    }
    andar(n) {
      if (!isFinite(n)) throw new ErroBL('Número de passos inválido.');
      const r = this.ang * Math.PI / 180;
      const nx = this.x + n * Math.cos(r), ny = this.y + n * Math.sin(r);
      if (this.caneta && n !== 0) {
        if (this.seg.length >= 8000) throw new ErroBL('Traços demais! Será que há um laço sem fim?');
        let cor = this.cor;
        if (this.arco) { cor = 'hsl(' + this.matiz + ',85%,48%)'; this.matiz = (this.matiz + 12) % 360; }
        this.seg.push([this.x, this.y, nx, ny, cor]);
      }
      this.x = nx; this.y = ny;
    }
    girar(g) { this.ang = ((this.ang + g) % 360 + 360) % 360; }
    mudarCor(c) { if (c === 'arcoiris') this.arco = true; else { this.arco = false; this.cor = c; } }
  }

  class MundoConsole extends MundoBase {
    constructor() { super(); this.tipo = 'console'; }
  }
  BL.MundoGrade = MundoGrade; BL.MundoTartaruga = MundoTartaruga; BL.MundoConsole = MundoConsole;

  /* ------------------------------------------------------------------ */
  /* Execução                                                            */
  /* ------------------------------------------------------------------ */
  const LIMITE_PASSOS = 300000, LIMITE_ACOES = 4000, LIMITE_PILHA = 60;
  const PALAVRAS = ['e', 'ou', 'nao', 'verdadeiro', 'falso', 'and', 'or', 'not', 'true', 'false'];

  function nomeValido(bruto, oque) {
    const s = normNome(bruto);
    if (!/^[a-z_][a-z0-9_]*$/.test(s) || PALAVRAS.includes(s))
      throw new ErroBL('Nome de ' + oque + ' inválido: "' + bruto + '". Use só letras, números e _ (sem espaços), começando com letra.');
    return s;
  }
  function inteiro(v, oque) {
    const n = num(v, oque);
    if (Math.abs(n - Math.round(n)) > 1e-9) throw new ErroBL('O bloco "' + oque + '" precisa de um número inteiro (recebeu ' + fmt(n) + ').');
    if (n < 0) throw new ErroBL('O bloco "' + oque + '" não aceita número negativo.');
    if (n > 100000) throw new ErroBL('Número de repetições grande demais.');
    return Math.round(n);
  }
  function atribuir(env, nome, valor) {
    for (let e = env; e; e = e.pai) if (nome in e.vars) { e.vars[nome] = valor; return; }
    env.vars[nome] = valor;
  }
  function campo(b, nomeCampo, ctx, env) {
    return avaliar(analisar(b.f[nomeCampo]), ctx, env);
  }
  function tick(ctx) {
    if (++ctx.passos > LIMITE_PASSOS) throw new ErroBL('O programa rodou passos demais. Será que há um laço que nunca termina?');
  }
  function acao(ctx) {
    if (++ctx.acoes > LIMITE_ACOES) throw new ErroBL('Movimentos demais! Será que há um laço que nunca termina?');
  }

  function* execLista(lista, ctx, env) {
    for (const b of lista) yield* execBloco(b, ctx, env);
  }
  function* execBloco(b, ctx, env) {
    tick(ctx);
    const m = ctx.mundo;
    try {
      switch (b.t) {
        case 'avancar': case 'esquerda': case 'direita': case 'pegar':
          if (m.tipo !== 'grade') throw new ErroBL('Este bloco é só para o robô.');
          acao(ctx); m[b.t](); yield { id: b.id }; break;
        case 'andar': case 'girar_esq': case 'girar_dir': case 'cor': case 'caneta':
          if (m.tipo !== 'tartaruga') throw new ErroBL('Este bloco é só para a tartaruga.');
          acao(ctx);
          if (b.t === 'andar') m.andar(num(campo(b, 'n', ctx, env), 'andar'));
          else if (b.t === 'girar_esq') m.girar(num(campo(b, 'g', ctx, env), 'girar'));
          else if (b.t === 'girar_dir') m.girar(-num(campo(b, 'g', ctx, env), 'girar'));
          else if (b.t === 'cor') m.mudarCor(b.f.cor);
          else m.caneta = b.f.p === 'baixo';
          yield { id: b.id }; break;
        case 'repetir': {
          const n = inteiro(campo(b, 'n', ctx, env), 'repita');
          for (let k = 0; k < n; k++) { tick(ctx); yield* execLista(b.c, ctx, env); }
          break;
        }
        case 'contar': {
          const nome = nomeValido(b.f.v, 'variável');
          const a = num(campo(b, 'a', ctx, env), 'conte'), z = num(campo(b, 'b', ctx, env), 'conte');
          const passo = a <= z ? 1 : -1;
          for (let k = a; passo > 0 ? k <= z + 1e-9 : k >= z - 1e-9; k += passo) {
            tick(ctx); atribuir(env, nome, k); yield* execLista(b.c, ctx, env);
          }
          break;
        }
        case 'se':
          if (paraBool(campo(b, 'c', ctx, env))) yield* execLista(b.c, ctx, env);
          break;
        case 'se_senao':
          yield* execLista(paraBool(campo(b, 'c', ctx, env)) ? b.c : b.e, ctx, env);
          break;
        case 'enquanto':
          while (paraBool(campo(b, 'c', ctx, env))) { tick(ctx); yield* execLista(b.c, ctx, env); }
          break;
        case 'repita_ate':
          while (!paraBool(campo(b, 'c', ctx, env))) { tick(ctx); yield* execLista(b.c, ctx, env); }
          break;
        case 'definir':
          atribuir(env, nomeValido(b.f.v, 'variável'), campo(b, 'x', ctx, env));
          break;
        case 'mudar': {
          const nome = nomeValido(b.f.v, 'variável');
          let atual;
          try { atual = lerVar(nome, { mundo: null }, env); }
          catch (e) { throw new ErroBL('Antes de aumentar "' + nome + '", crie a variável com o bloco "defina".'); }
          atribuir(env, nome, num(atual, 'aumente') + num(campo(b, 'x', ctx, env), 'aumente'));
          break;
        }
        case 'mostrar':
          m.mostrar(fmt(campo(b, 'x', ctx, env)));
          yield { id: b.id }; break;
        case 'perguntar': {
          const nome = nomeValido(b.f.v, 'variável');
          const v = m.perguntar(b.f.txt);
          atribuir(env, nome, v);
          yield { id: b.id }; break;
        }
        case 'funcao': break; // definido antes da execução
        case 'usar': {
          const nome = normNome(b.f.nome);
          const fn = ctx.funcs[nome];
          if (!fn) throw new ErroBL('Não existe o bloco "' + b.f.nome + '". Crie-o com "crie o bloco".');
          const params = parametros(fn.f.p);
          const args = analisarLista(b.f.a || '').map(a => avaliar(a, ctx, env));
          if (args.length !== params.length)
            throw new ErroBL('O bloco "' + b.f.nome + '" precisa de ' + params.length + ' valor(es) (' + params.join(', ') + '), mas recebeu ' + args.length + '.');
          if (ctx.pilha >= LIMITE_PILHA) throw new ErroBL('Blocos chamando blocos demais!');
          const novo = { vars: Object.create(null), pai: ctx.global };
          params.forEach((p, i) => { novo.vars[p] = args[i]; });
          ctx.pilha++;
          try { yield* execLista(fn.c, ctx, novo); } finally { ctx.pilha--; }
          break;
        }
        default: throw new ErroBL('Bloco desconhecido.');
      }
    } catch (e) {
      if (e instanceof ErroBL && !e.blocoId) e.blocoId = b.id;
      throw e;
    }
  }
  function parametros(txt) {
    return String(txt || '').split(/[,;]/).map(s => s.trim()).filter(Boolean).map(s => nomeValido(s, 'entrada'));
  }

  BL.executar = function* (prog, mundo) {
    const funcs = Object.create(null);
    percorrer(prog, b => { if (b.t === 'funcao') funcs[nomeValido(b.f.nome, 'bloco')] = b; });
    const global = { vars: Object.create(null), pai: null };
    const ctx = { mundo, funcs, passos: 0, acoes: 0, pilha: 0, global };
    yield* execLista(prog, ctx, global);
  };
  BL.rodar = function (prog, mundo) {
    try { const g = BL.executar(prog, mundo); while (!g.next().done) { /* nada */ } return null; }
    catch (e) { return e instanceof ErroBL ? e : new ErroBL('Erro inesperado: ' + e.message); }
  };

  /* ------------------------------------------------------------------ */
  /* Desafios                                                            */
  /* ------------------------------------------------------------------ */
  BL.numCasos = des => des.mapas ? des.mapas.length : (des.testes ? des.testes.length : 1);
  BL.criarMundo = function (des, k, opts) {
    opts = opts || {};
    let m;
    if (des.mundo === 'grade') m = new MundoGrade(des.mapas ? des.mapas[k] : des.mapa);
    else if (des.mundo === 'tartaruga') m = new MundoTartaruga(des.inicio);
    else m = new MundoConsole();
    if (des.testes) m.entradas = des.testes[k].slice();
    m.interativo = !!opts.interativo;
    return m;
  };
  const refs = new WeakMap();
  BL.referencia = function (des, k) {
    if (!des.solucao) return null;
    let arr = refs.get(des);
    if (!arr) { arr = []; refs.set(des, arr); }
    if (!arr[k]) {
      const sol = BL.preparar(JSON.parse(JSON.stringify(des.solucao)), des.mundo);
      const m = BL.criarMundo(des, k);
      const e = BL.rodar(sol, m);
      if (e) throw new Error('Solução de referência com erro (' + des.titulo + '): ' + e.message);
      arr[k] = m;
    }
    return arr[k];
  };

  function distPtSeg(px, py, s) {
    const dx = s[2] - s[0], dy = s[3] - s[1];
    const L = dx * dx + dy * dy;
    let t = L ? ((px - s[0]) * dx + (py - s[1]) * dy) / L : 0;
    t = Math.max(0, Math.min(1, t));
    const qx = s[0] + t * dx - px, qy = s[1] + t * dy - py;
    return Math.sqrt(qx * qx + qy * qy);
  }
  function cobre(A, B, tol) {
    for (const s of A) {
      const len = Math.hypot(s[2] - s[0], s[3] - s[1]);
      const n = Math.max(1, Math.ceil(len / 3));
      for (let i = 0; i <= n; i++) {
        const px = s[0] + (s[2] - s[0]) * i / n, py = s[1] + (s[3] - s[1]) * i / n;
        let perto = false;
        for (const t of B) if (distPtSeg(px, py, t) <= tol) { perto = true; break; }
        if (!perto) return false;
      }
    }
    return true;
  }
  BL.desenhosIguais = (A, B) => cobre(A, B, 2.5) && cobre(B, A, 2.5);

  function rotulo(t) { const p = DEFS[t].partes; return (typeof p[0] === 'string' ? p[0] : t).replace(/[➜↺↻]/g, '').trim(); }
  BL.rotulo = rotulo;
  BL.checarExige = function (des, prog) {
    if (!des.exige) return null;
    const usados = new Set();
    percorrer(prog, b => usados.add(b.t));
    for (const req of des.exige) {
      const alts = req.split('|');
      if (!alts.some(a => usados.has(a)))
        return 'Para este desafio, use o bloco "' + alts.map(rotulo).join('" ou "') + '".';
    }
    return null;
  };

  function resumoLinhas(arr) {
    if (!arr.length) return '(nada)';
    const r = arr.slice(0, 6).join(' | ');
    return arr.length > 6 ? r + ' | …' : r;
  }

  BL.verificar = function (des, prog) {
    const falta = BL.checarExige(des, prog);
    if (falta) return { ok: false, msg: falta };
    const casos = BL.numCasos(des);
    const nomeCaso = des.mundo === 'grade' ? 'mapa' : 'teste';
    for (let k = 0; k < casos; k++) {
      const pre = casos > 1 ? 'No ' + nomeCaso + ' ' + (k + 1) + ': ' : '';
      const m = BL.criarMundo(des, k);
      const e = BL.rodar(prog, m);
      if (e) return { ok: false, msg: pre + e.message, blocoId: e.blocoId, caso: k };
      if (des.mundo === 'grade') {
        const av = m.avaliar();
        if (!av.ok) return { ok: false, msg: pre + av.msg, caso: k };
      } else if (des.mundo === 'tartaruga') {
        const ref = BL.referencia(des, k);
        if (!BL.desenhosIguais(ref.seg, m.seg))
          return { ok: false, msg: 'O desenho ainda não está igual ao modelo tracejado. Compare com calma: tamanhos, ângulos e sentido do giro.', caso: k };
      } else {
        const ref = BL.referencia(des, k);
        const esp = ref.saidas(), obt = m.saidas();
        const igual = esp.length === obt.length && esp.every((s, i) => BL.normSaida(s) === BL.normSaida(obt[i]));
        if (!igual) {
          const ent = des.testes ? 'Com a(s) entrada(s) ' + des.testes[k].map(fmt).join(' e ') + ', e' : 'E';
          return { ok: false, msg: ent + 'ra esperado: ' + resumoLinhas(esp) + ' — mas apareceu: ' + resumoLinhas(obt), caso: k };
        }
      }
    }
    const n = BL.contarBlocos(prog);
    if (des.maxBlocos && n > des.maxBlocos)
      return { ok: true, estrelas: 2, msg: 'Funcionou! Desafio extra: resolva com no máximo ' + des.maxBlocos + ' blocos (você usou ' + n + ') para ganhar a 3ª estrela.' };
    return { ok: true, estrelas: 3, msg: des.maxBlocos ? 'Perfeito, e com só ' + n + ' blocos!' : 'Muito bem!' };
  };

  /* ------------------------------------------------------------------ */
  /* Tradução para Python e para texto                                   */
  /* ------------------------------------------------------------------ */
  function temTexto(no) { return no.n === 'str' || (no.n === 'bin' && no.op === '+' && (temTexto(no.a) || temTexto(no.b))); }
  const PREC = { ou: 1, e: 2, '=': 4, '≠': 4, '<': 4, '>': 4, '≤': 4, '≥': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6, '^': 8 };
  const PYOP = { ou: 'or', e: 'and', '=': '==', '≠': '!=', '≤': '<=', '≥': '>=', '^': '**' };

  BL.paraPython = function (prog, tipo) {
    const imp = new Set();
    const linhas = [];
    function pyNo(no) {
      switch (no.n) {
        case 'num': return { s: String(no.v), p: 9 };
        case 'str': return { s: JSON.stringify(no.v), p: 9 };
        case 'bool': return { s: no.v ? 'True' : 'False', p: 9 };
        case 'var':
          if (no.v === 'pi') { imp.add('math'); return { s: 'math.pi', p: 9 }; }
          if (tipo === 'grade' && SENSORES_NOMES.includes(no.v)) return { s: no.v + '()', p: 9 };
          return { s: no.v, p: 9 };
        case 'neg': { const a = pyNo(no.a); return { s: '-' + (a.p < 7 ? '(' + a.s + ')' : a.s), p: 7 }; }
        case 'nao': { const a = pyNo(no.a); return { s: 'not ' + (a.p < 3 ? '(' + a.s + ')' : a.s), p: 3 }; }
        case 'call': {
          const args = no.args.map(a => pyNo(a).s);
          if (no.f === 'sen' || no.f === 'cos') { imp.add('math'); return { s: 'math.' + (no.f === 'sen' ? 'sin' : 'cos') + '(math.radians(' + args[0] + '))', p: 9 }; }
          const F = FUNCS[no.f];
          if (F && F.py) { if (F.imp) imp.add(F.imp); return { s: F.py + '(' + args.join(', ') + ')', p: 9 }; }
          return { s: no.f + '(' + args.join(', ') + ')', p: 9 };
        }
        case 'bin': {
          const P = PREC[no.op], OP = PYOP[no.op] || no.op;
          let a = pyNo(no.a), b = pyNo(no.b);
          if (no.op === '+' && (temTexto(no.a) || temTexto(no.b))) {
            if (!temTexto(no.a)) a = { s: 'str(' + a.s + ')', p: 9 };
            if (!temTexto(no.b)) b = { s: 'str(' + b.s + ')', p: 9 };
          }
          const pa = no.op === '^' ? a.p <= P : a.p < P;
          const pb = no.op === '^' ? b.p < P : (b.p < P || (b.p === P && (['-', '/', '%'].includes(no.op) || P === 4)));
          return { s: (pa ? '(' + a.s + ')' : a.s) + ' ' + OP + ' ' + (pb ? '(' + b.s + ')' : b.s), p: P };
        }
      }
      return { s: '?', p: 9 };
    }
    function px(src) { try { return pyNo(analisar(src)).s; } catch (e) { return '???'; } }
    function inteiroLit(src) { try { const a = analisar(src); return a.n === 'num' && Number.isInteger(a.v) ? a.v : null; } catch (e) { return null; } }
    function nm(s) { return normNome(s).replace(/[^a-z0-9_]/g, '_') || 'x'; }
    function gerar(lista, ind) {
      const pad = '    '.repeat(ind);
      if (!lista.length) { linhas.push(pad + 'pass'); return; }
      for (const b of lista) {
        const f = b.f || {};
        switch (b.t) {
          case 'avancar': linhas.push(pad + 'avancar()'); break;
          case 'esquerda': linhas.push(pad + 'virar_esquerda()'); break;
          case 'direita': linhas.push(pad + 'virar_direita()'); break;
          case 'pegar': linhas.push(pad + 'pegar_moeda()'); break;
          case 'andar': linhas.push(pad + 't.forward(' + px(f.n) + ')'); break;
          case 'girar_esq': linhas.push(pad + 't.left(' + px(f.g) + ')'); break;
          case 'girar_dir': linhas.push(pad + 't.right(' + px(f.g) + ')'); break;
          case 'cor': linhas.push(pad + (f.cor === 'arcoiris' ? 't.pencolor("red")  # arco-íris: no Python, troque a cor a cada traço' : 't.pencolor("' + f.cor + '")')); break;
          case 'caneta': linhas.push(pad + (f.p === 'baixo' ? 't.pendown()' : 't.penup()')); break;
          case 'repetir': {
            const n = inteiroLit(f.n);
            linhas.push(pad + 'for _ in range(' + (n != null ? n : 'int(' + px(f.n) + ')') + '):');
            gerar(b.c, ind + 1); break;
          }
          case 'contar': {
            const z = inteiroLit(f.b);
            linhas.push(pad + 'for ' + nm(f.v) + ' in range(' + px(f.a) + ', ' + (z != null ? z + 1 : px(f.b) + ' + 1') + '):');
            gerar(b.c, ind + 1); break;
          }
          case 'se': linhas.push(pad + 'if ' + px(f.c) + ':'); gerar(b.c, ind + 1); break;
          case 'se_senao':
            linhas.push(pad + 'if ' + px(f.c) + ':'); gerar(b.c, ind + 1);
            linhas.push(pad + 'else:'); gerar(b.e, ind + 1); break;
          case 'enquanto': linhas.push(pad + 'while ' + px(f.c) + ':'); gerar(b.c, ind + 1); break;
          case 'repita_ate': linhas.push(pad + 'while not (' + px(f.c) + '):'); gerar(b.c, ind + 1); break;
          case 'definir': linhas.push(pad + nm(f.v) + ' = ' + px(f.x)); break;
          case 'mudar': linhas.push(pad + nm(f.v) + ' += ' + px(f.x)); break;
          case 'mostrar': linhas.push(pad + 'print(' + px(f.x) + ')'); break;
          case 'perguntar': linhas.push(pad + nm(f.v) + ' = float(input(' + JSON.stringify(String(f.txt) + ' ') + '))'); break;
          case 'funcao': {
            let ps; try { ps = parametros(f.p).join(', '); } catch (e) { ps = '???'; }
            linhas.push(pad + 'def ' + nm(f.nome) + '(' + ps + '):'); gerar(b.c, ind + 1);
            linhas.push(''); break;
          }
          case 'usar': {
            let as; try { as = analisarLista(f.a || '').map(a => pyNo(a).s).join(', '); } catch (e) { as = '???'; }
            linhas.push(pad + nm(f.nome) + '(' + as + ')'); break;
          }
        }
      }
    }
    if (!prog.length) return '# (programa vazio)';
    const funcs = prog.filter(b => b.t === 'funcao'), resto = prog.filter(b => b.t !== 'funcao');
    if (funcs.length) gerar(funcs, 0);
    if (resto.length) gerar(resto, 0);
    while (linhas.length && linhas[linhas.length - 1] === '') linhas.pop();
    const cab = [];
    if (tipo === 'grade') cab.push('from robo import *   # avancar(), virar_esquerda(), virar_direita(), pegar_moeda() ...');
    if (tipo === 'tartaruga') cab.push('import turtle');
    if (imp.has('math')) cab.push('import math');
    if (imp.has('random')) cab.push('import random');
    if (tipo === 'tartaruga') cab.push('t = turtle.Turtle()');
    const fim = tipo === 'tartaruga' ? ['', 'turtle.done()'] : [];
    return (cab.length ? cab.join('\n') + '\n\n' : '') + linhas.join('\n') + (fim.length ? '\n' + fim.join('\n') : '');
  };

  BL.textoCampo = function (b, p, tipo) {
    const v = b.f[p.f];
    if (p.tipo === 'sel') { const o = p.ops.find(o => o[1] === v); return o ? o[0] : v; }
    if (p.tipo === 'cond' && tipo === 'grade') { const o = SENSORES.find(o => o[1] === v); return o ? o[0] : v; }
    return v;
  };
  BL.paraTexto = function (prog, tipo) {
    const L = [];
    function g(lista, ind) {
      const pad = '    '.repeat(ind);
      for (const b of lista) {
        const d = DEFS[b.t];
        L.push(pad + d.partes.map(p => typeof p === 'string' ? p : '[' + BL.textoCampo(b, p, tipo) + ']').join(' '));
        if (d.corpo) {
          g(b.c, ind + 1);
          if (d.senao) { L.push(pad + 'senão'); g(b.e, ind + 1); }
        }
      }
    }
    g(prog, 0);
    return L.join('\n');
  };

  global.BL = BL;
  if (typeof module !== 'undefined' && module.exports) module.exports = BL;
})(typeof window !== 'undefined' ? window : globalThis);
