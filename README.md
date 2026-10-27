# Torre ADC — entrenador para el examen ADC de IVAO España

Material de estudio personal basado en el libro «Controlador de aeródromo (ADC)» de la wiki de IVAO España
(https://wiki.es.ivao.aero/books/controlador-de-aerodromo-adc). El texto está redactado de nuevo y reorganizado;
ante cualquier duda manda la documentación oficial y los procedimientos locales de la división.

## Estructura

```
content/                 ← fuente única de verdad (editar aquí)
  topics/NN-*.md         temario por tema (markdown con extensiones, ver abajo)
  summaries.md           "Lo esencial" de cada tema (# id-del-tema)
  flashcards.json        [{topic, front, back}]
  questions.json         banco fijo [{t, q, o[], a[], m?, e}]  (a = índices correctos; m = múltiple)
  scenarios.json         casos guiados del mini-juego (setup + steps con scene, sit, q, o, a, e, sev)
  diagrams/*.svg         diagramas propios (se usan en app y PDF)
app/
  index.html             shell + estilos (sin dependencias, sin build)
  js/rules.js            reglas: estela, salidas sucesivas, estela en llegada, TRL, VMC/SVFR/LVP, fonética…
  js/generators.js       16 generadores paramétricos de preguntas (usan rules.js)
  js/scenarios.js        15 escenarios generados de "torre en vivo": familias de situaciones paramétricas
                         (aeródromo, pista, viento, aeronaves…); cada partida saca hasta 5 al azar
  js/data.js             GENERADO desde content/ (no editar)
  js/app.js              vistas: temario, resúmenes, flashcards (Leitner), test, torre en vivo, chuleta
build/
  build_data.py          content/ → app/js/data.js
  build_pdf.py           content/ → build/Manual_ADC_IVAO_ES.pdf (reportlab + DejaVu)
  cheatsheet.md          chuleta de tablas (app y apéndice A del PDF)
```

## Comandos

```bash
python3 build/build_data.py          # regenerar datos de la app
python3 build/build_pdf.py           # regenerar el PDF (requiere reportlab; diagramas PNG en build/diagrams)
python3 -c "import cairosvg,glob,os; [cairosvg.svg2png(url=f, write_to='build/diagrams/'+os.path.basename(f)[:-4]+'.png', output_width=1520) for f in glob.glob('content/diagrams/*.svg')]"
npx serve app                        # o abrir app/index.html directamente
```

## Extensiones de markdown

- `> [!key] texto` → recuadro CLAVE · `> [!ivao] texto` → recuadro IVAO
- `> línea` (sin [!]) → bloque de diálogo radio
- `![fig:nombre|pie]` → diagrama de content/diagrams · `![wiki:URL|pie]` → enlace a imagen de la wiki

## Ideas para seguir en Claude Code

- Más situaciones en `app/js/scenarios.js` (cada función de `sits` es un tipo de situación; `node -e` con
  `require('./app/js/scenarios.js')` permite probarlas) y más generadores de preguntas.
- Modo "examen cronometrado" y estadísticas por generador.
- Guardar progreso en un backend o exportarlo.
- Tests unitarios de `rules.js` contra las tablas de la wiki (hay un script de humo en la conversación).

## Nota sobre un dato ambiguo

La wiki indica que la regla de +1 min por intersección "también afecta a pesada detrás de pesada" sin dar el valor;
los generadores excluyen ese caso a propósito.
