---
id: plan-de-vuelo
num: 2
title: Plan de vuelo (FPL)
icon: clipboard
wiki: https://wiki.es.ivao.aero/books/controlador-de-aerodromo-adc/chapter/plan-de-vuelo-presentado-fpl
---

## El plan de vuelo ATC

El plan de vuelo comunica a las dependencias ATS los datos del vuelo para que puedan prestarle servicio. En IVAO se presenta en **fpl.ivao.aero** ("File a flight plan") y queda asociado a la conexión cuando el piloto se conecta con **el mismo indicativo** que figura en el plan.

> [!ivao] A diferencia de la realidad, en IVAO **todos los vuelos necesitan plan de vuelo**. Si alguien despega sin él, el servidor lo desconecta a los pocos minutos.

Como controlador, antes de dar una autorización hay que revisar el plan, sobre todo las casillas clave.

![wiki:https://wiki.es.ivao.aero/uploads/images/gallery/2024-09/scaled-1680-/U1himage.png|Formulario de plan de vuelo de IVAO]

## Casillas del plan de vuelo

### Casilla 7 – Identificación de la aeronave

Debe coincidir con el indicativo de conexión. Puede ser:

- **Designador OACI del operador + número de vuelo**: IBE123, VLG23QV, RYR63LV…
- **Matrícula** (sin guion): ECMMT, GBKKM, N2567GA…
- **Vuelos militares nacionales**: distintivo táctico (LINCE51, ANGEL32…).

### Casilla 8 – Reglas y tipo de vuelo

| Reglas | Significado |
|---|---|
| **V** | Todo el vuelo VFR |
| **I** | Todo el vuelo IFR |
| **Y** | Empieza **IFR** y cambia a VFR |
| **Z** | Empieza **VFR** y cambia a IFR |

| Tipo | Significado |
|---|---|
| **S** | Servicio aéreo regular |
| **N** | Transporte aéreo no regular |
| **G** | Aviación general |
| **M** | Militar |
| **X** | Otros |

### Casilla 9 – Número, tipo y estela turbulenta

- **Número de aeronaves**: en blanco si es una; si son varias, el número.
- **Tipo**: designador OACI (C172, P28A, B738, A320…). Si no existe: **ZZZZ** y en casilla 18 **TYP/** seguido del tipo.
- **Categoría de estela turbulenta** (por masa máxima certificada al despegue, MTOW):

| Cat. | Nombre | MTOW |
|---|---|---|
| **L** | Ligera | hasta **7 000 kg** |
| **M** | Media | más de 7 000 y menos de **136 000 kg** |
| **H** | Pesada | **136 000 kg** o más |
| **J** | Super | caso especial: A380 (y An-225) |

> [!key] El **B757** se trata como **pesado cuando va delante** (genera estela de pesado) aunque su categoría sea media.

### Casilla 10 – Equipo

Dos campos donde se marcan tantas letras como equipos lleve: (a) radiocomunicaciones, navegación y aproximación; (b) vigilancia (transpondedor, ADS…). Algunas letras exigen detallar en la casilla 18: **G → NAV/**, **R → PBN/**, **X o W → REG/** (según el formulario), **Z → COM/ NAV/ DAT/**.

### Casilla 13 – Aeródromo y hora de salida

- Código OACI del aeródromo. Si no tiene: **ZZZZ** y en casilla 18 **DEP/** con el nombre.
- Hora: **EOBT** (hora prevista de fuera calzos) en UTC, HHMM, 24 h. 1225 = 12:25 UTC.

### Casilla 15 – Velocidad, nivel y ruta

| Velocidad | Formato |
|---|---|
| **N** + 4 cifras | TAS en nudos (N0090 = 90 kt, N0450 = 450 kt) |
| **M** + 3 cifras | Número de Mach sin coma (M081 = Mach 0,81) |
| **K** + 4 cifras | TAS en km/h (no se usa en España) |

| Nivel | Formato |
|---|---|
| **A** + 3 cifras | Altitud en cientos de pies (A060 = 6 000 ft) |
| **F** + 3 cifras | Nivel de vuelo (F080 = FL80) |
| **M** / **S** + 4 cifras | Altitud / nivel en metros (no en España) |
| **VFR** | Vuelos VFR no controlados |

Ruta: en blanco para VFR; para I, Y o Z se detalla la ruta.

### Casilla 16 – Destino, EET y alternativos

Destino (o ZZZZ + **DEST/**), duración total estimada **EET** en HHMM (0255 = 2 h 55 min) y uno o dos alternativos (o ZZZZ + **ALTN/**).

### Casilla 18 – Otros datos

Designadores más usados: **COM/**, **SUR/**, **DEP/**, **DEST/**, **DOF/** (fecha, AAMMDD: 211005 = 5-oct-2021), **REG/** (matrícula), **TYP/**, **ALTN/**, **RMK/** (observaciones). Otros: STS/, PBN/, DAT/, EET/, SEL/, CODE/, DLE/, OPR/, PER/, RALT/, TALT/.

> [!key] **STS/HOSP** o **STS/MEDEVAC** en la casilla 18 identifican un vuelo sanitario urgente: sus mensajes son de categoría **urgencia** y tienen prioridad.

### Casilla 19 – Información suplementaria

Autonomía en HHMM, personas a bordo (3 cifras) y piloto al mando (IVAO lo rellena solo).

## Planes Yankee y Zulu

### Plan Yankee (IFR → VFR)

Empieza IFR y en un punto se cancela el IFR. El piloto debe **pedir la cancelación** en el momento adecuado y el controlador la confirma **con la hora UTC**; desde ahí se le dan instrucciones VFR. Ejemplo:

> ATC: SCP13, plan de vuelo IFR cancelado a las 15:50 UTC, proceda a S1 manteniendo mil pies y notifique alcanzando.

### Plan Zulu (VFR → IFR)

Empieza VFR y pasa a IFR. **No hace falta una cancelación explícita**: previa coordinación, TWR simplemente transfiere el tránsito a aproximación.

> P: SCP16 alcanzando S1, requerimos cambio a IFR.
> ATC: SCP16, recibido, orbite en S1 y contacte con aproximación en 134.825.

### Salidas de contingencia

Las SID españolas se basan en radioayudas del aeródromo o cercanas. Para poder seguir operando si fallan, en entornos radar se publican **salidas de contingencia**: un rumbo inicial tras el despegue que protege de obstáculos hasta la **altitud mínima de vigilancia** (carta **ATCSMAC** del AIP).

Algunos IFR locales (IFR o Yankee) pueden necesitar **coordinación previa con APP** para su autorización, por ejemplo si el primer punto de su ruta no tiene SID publicada: TWR pide a APP una autorización inicial (que puede ser una salida de contingencia u otra que decida APP).
