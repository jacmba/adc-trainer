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
  js/voice.js            voz: transcripción → orden (alfabeto, números, designadores telefónicos), PTT con la
                         Web Speech API y pronunciación de indicativos para la síntesis
  js/sim.js              simulador de torre en tiempo real: radar + vista de plataforma, etiquetas
                         arrastrables, fichas de progresión, línea de comandos con fraseología y puntuación
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

## Simulador de torre

Escenario continuo (salidas, tráfico mixto, circuito VFR, emergencias, "todas sujetas" y sesión libre) sobre un
aeródromo al azar. Se transmite escribiendo: el parser busca el indicativo (completo, o abreviado al principio) y
la intención por palabras clave (`ruede`, `alinee`, `autorizado a despegar`, `aterrizar`, `continúe`, `motor y al
aire`, `contacte`, `viento en cola`, `siga a` / `ajuste detrás de`, `orbite`, `negativo`, `recibido`, `suelta`) o alias
cortos al estilo openscope (`taxi`, `lu`, `to`, `cl`, `ca`, `ga`, `hp`, `dw`, `fl`, `orb`, `ack`). Con "siga a" (indicativo o
tipo: "siga al A320") el VFR alarga el viento en cola hasta tener hueco detrás del tránsito.

La tabla `COMMANDS` de `sim.js` define a la vez el parser y la ayuda del juego (botón «Comandos»). Además:
- **Información de tránsito** (`tránsito …`, alias `ti`): a cada VFR del circuito hay que informarle del tránsito
  que le precede y de los IFR en final (75 s de margen; «siga a» cuenta como información). Si el mensaje lleva otra
  orden antes de «tránsito», se ejecuta y la información se cuenta igualmente.
- **Alineación condicional** detrás de una salida en carrera o de una llegada en final: `IBE123 detrás del B738
  despegando, alinee y mantenga pista 27, detrás`.
- **Cronómetro** en la barra (tiempo del simulador, respeta pausa y velocidad): cada clic inicia, para y pone a cero.
- **Voz (PTT)**: mantener pulsado **Ctrl derecho** (o el botón 🎙) para hablar; al soltar se transmite (o queda en la
  línea para revisarlo, según ⚙). `voice.js` convierte «Iberia tres siete uno dos ruede a punto de espera pista dos
  siete» en `IBE3712 ruede a punto de espera pista 27`, ajusta indicativos mal reconocidos al más parecido en
  frecuencia y elige, entre las alternativas del reconocedor, la que deja indicativos conocidos. Usa la Web Speech
  API: Chrome, Edge y Safari (Chrome necesita conexión); si el micrófono no funciona abriendo el archivo
  directamente, sirve la app con `npx serve app`.
- En escritorio la interfaz se ajusta al alto de la ventana; por debajo de 1100 px se apila. La tabla `PTS` de `sim.js` fija los puntos de
cada acierto y error; la separación entre salidas se calcula con `rules.js`.

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
