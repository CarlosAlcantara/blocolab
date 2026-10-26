# BlocoLab — Programação em Blocos (9º ano)

Site de 10 aulas de introdução à programação em blocos, do primeiro passo de um robô até a criação de funções, com conexões diretas com a Matemática do 9º ano (ângulos e polígonos, potências, juros compostos, Pitágoras, Bhaskara, números primos, Fibonacci).

- **index.html** — o site para os estudantes
- **professor.html** — guia do professor (objetivos, atividade desplugada, roteiro, conexão matemática e uma solução de cada desafio em blocos e em Python), pronto para imprimir

## As 10 aulas

| Aula | Tema | Ambiente |
|---|---|---|
| 1 | Algoritmos: uma instrução de cada vez (sequência) | Robô |
| 2 | Depuração: caçando bugs | Robô |
| 3 | Repetição: laços | Robô |
| 4 | A tartaruga e os ângulos (polígonos regulares) | Tartaruga |
| 5 | Laços dentro de laços: padrões | Tartaruga |
| 6 | Variáveis | Tartaruga e console |
| 7 | Condicionais (se / senão) | Console e robô |
| 8 | Laços com condição (enquanto / repita até) | Robô e console |
| 9 | Matemática com código | Console |
| 10 | Meus próprios blocos (funções) e projeto final | Tartaruga e console |

Cada aula tem um **Exemplo** comentado e 4–5 **desafios** que se corrigem sozinhos (até 3 estrelas). Todo programa pode ser visto também em **Python**.

## Feito para tablets simples

- Sem bibliotecas externas e sem fontes da internet: o site inteiro tem cerca de 100 KB.
- Os blocos são colocados **por toque** (não é preciso arrastar).
- O progresso fica salvo no navegador de cada aparelho (localStorage). Para limpar entre turmas: botão “Apagar meu progresso” na tela inicial.

## Publicar no GitHub Pages

1. Crie um repositório (ex.: `blocolab`) e envie **todo o conteúdo desta pasta**, mantendo as pastas `css/` e `js/`.
2. Em **Settings → Pages**, escolha *Deploy from a branch*, branch `main`, pasta `/ (root)`.
3. O endereço ficará assim: `https://SEU-USUARIO.github.io/blocolab/`

## Editar ou criar desafios

As aulas estão em `js/licoes.js`. Cada desafio tem um texto, os blocos disponíveis, o mapa (robô), o ponto de partida (tartaruga) ou as entradas de teste (console), e uma **solução de referência** — é ela que gera o modelo tracejado e as respostas esperadas.

Mapas do robô: `#` parede, `.` caminho, `*` estrela, `o` moeda, e o robô é `>` `<` `^` `v` (indicando para onde está virado).
