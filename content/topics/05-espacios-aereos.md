---
id: espacios-aereos
num: 5
title: Espacios aéreos
icon: layers
wiki: https://wiki.es.ivao.aero/books/controlador-de-aerodromo-adc/chapter/espacios-aereos
---

## Conceptos básicos

Un **espacio aéreo** es un volumen de atmósfera delimitado lateral y verticalmente, gestionado por una dependencia ATS (ATSU). Se clasifica de tres maneras:

- **Por clase** (A–G): qué servicios ATS se prestan y qué requisitos hay.
- **Por tipo**: FIR, UIR, CTA, TMA, AWY, OCA, CTR, ATZ, FIZ…
- **Por uso**: los espacios **especiales** (P, D, R, TSA, TRA, F, RMZ, TMZ, FPMZ).

### Servicios ATS por prioridad

1. **ATC – control**: objetivos de **separar, ordenar y acelerar** (en ese orden). Se divide en control de aeródromo (TWR), de aproximación (APP) y de área (ACC).
2. **FIS – información de vuelo**: meteorología (METAR, TAF, SIGMET, AIRMET…), tránsito, estado de aeródromos y radioayudas.
3. **ALRS – alerta**: generalmente no aplicable en IVAO.

Quien presta ATC presta también FIS y alerta; quien presta FIS presta también alerta. En España se añaden el **servicio radar** (FIR/UIR de Madrid, Barcelona y Canarias; AIP ENR 1.6) y el **AFIS**, que da información y alerta en aeródromos AFIS y su FIZ: los pilotos se separan por sí mismos y el AFIS **no autoriza ni instruye** a aeronaves en vuelo.

El **servicio de asesoramiento** (dentro del FIS) busca separar a las aeronaves "en lo posible" solo con información de tránsito, cuando la separación **no** es responsabilidad del controlador.

## Clases de espacio aéreo

| Clase | IFR | VFR | Separación que da el ATC | Información de tránsito | Radio continua | Límite 250 kt bajo FL100 | Autorización ATC |
|---|---|---|---|---|---|---|---|
| **A** | Sí | **No** | Todos con todos | — | Todos | No aplica | Todos |
| **B** | Sí | Sí | **Todos con todos** | — | Todos | No aplica | Todos |
| **C** | Sí | Sí | IFR↔IFR, **IFR↔VFR** | VFR sobre VFR (+ asesoramiento anticolisión a petición) | Todos | **Solo VFR** | Todos |
| **D** | Sí | Sí | **Solo IFR↔IFR** | IFR sobre VFR; VFR sobre todos | Todos | Todos | Todos |
| **E** | Sí | Sí | Solo IFR↔IFR | Todos, en lo posible | **Solo IFR** | Todos | **Solo IFR** |
| **F** | Sí | Sí | Asesoramiento a IFR | FIS a petición | IFR en asesoramiento | Todos | **No** |
| **G** | Sí | Sí | Ninguna | FIS a petición | IFR en condiciones de comunicar | Todos | **No** |

> [!key] Regla de memoria: **A** solo IFR · **B** separa a todos · **C** separa IFR de todos · **D** separa solo IFR entre sí · **E** controla solo IFR (y **no puede usarse para un CTR**) · **F** asesoramiento · **G** solo información. **A, B, C, D, E = controlados**; F y G no controlados.

Uso típico y ejemplos en España:

- **A**: aerovías y TMA; también ATZ donde se prohíbe el VFR. Algunas capas de los TMA de Madrid, Barcelona y Palma.
- **B**: aerovías y capas altas de CTA/TMA. Prácticamente inexistente en España.
- **C**: aerovías y capas superiores de CTA y TMA (Madrid, Barcelona, Palma…).
- **D**: **la más extendida en ATZ, CTR** y capas inferiores de CTA.
- **E**: capas inferiores de CTA y TMA.
- **F**: casi inexistente (alguna aerovía).
- **G**: FIZ y la capa de libre circulación VFR; capas inferiores de las FIR.

![wiki:https://wiki.es.ivao.aero/uploads/images/gallery/2024-09/scaled-1680-/si6image.png|Resumen de la clase D]

### Gestión del VFR según la clase (visto desde la torre)

- **D y E**: los VFR se separan de los IFR gracias a la **información de tránsito**; los **SVFR** sí se separan de los IFR mediante autorizaciones ATC. Con información de tránsito no se aplican mínimos de separación IFR.
- **C**: VFR y SVFR separados de los IFR por el ATC; VFR entre sí, con información de tránsito.
- **B**: todos separados por el ATC.
- **A**: VFR prohibido (salvo excepciones publicadas con autorización especial).

## Tipos de espacio aéreo

| Tipo | Qué es | Límites verticales | Notas |
|---|---|---|---|
| **FIR** | Región de información de vuelo. El tipo más básico. | Normalmente SFC–UNL | Servicios FIS + alerta (prestados por un FIC; en España, por los ACC). España: **LECM** (Madrid), **LECB** (Barcelona), **GCCC** (Canarias). |
| **UIR** | Parte superior de la FIR | En España a partir de **FL195** | LECM, LECB y GCCC UIR mantienen los límites horizontales de su FIR. |
| **CTA** | Área de control para IFR | Inferior al menos **700 ft** sobre el terreno (deja capa VFR debajo); superior según AIP | Controlado. |
| **TMA** | CTA que agrupa varios aeropuertos IFR o rutas complejas | Como la CTA, techo más alto | Ej.: TMA Galicia, 1000 ft AGL–FL145, clases D y C. |
| **AWY** | Aerovía: CTA en forma de corredor | Según la ruta ATS | Protege rutas IFR en espacio no controlado; en España la FIR es G hasta ~FL145 y C por encima. |
| **OCA** | Área de control oceánica | Suele empezar en FL55 | Shanwick, Santa María, Gander; en IVAO-ES, **GCCO_CTR**. |
| **CTR** | Zona de control alrededor de aeropuertos IFR | **Siempre desde la superficie**; techo según AIP (o base de la CTA superior) | Protege salidas iniciales y aproximaciones finales IFR. Radio mínimo **5 km**, ampliado hacia las finales. Ej.: CTR Pamplona SFC–1000 ft AGL, clase D. |
| **ATZ** | Zona de tránsito de aeródromo | **Desde la superficie**; techo según AIP **o el techo de nubes, el menor** | Protege el tránsito de aeródromo. Radio publicado o visibilidad, el menor. No todos los controlados tienen ATZ (LEVX, LECO no) y hay no controlados con ATZ (LETL). |
| **FIZ** | Zona de información de vuelo | Desde la superficie; techo según AIP o techo de nubes, el menor | **No controlada**: aeródromo AFIS. No se dan instrucciones ni autorizaciones salvo en rodaje. En IVAO: posiciones **_FIS_TWR** (LEBG_FIS_TWR, GCGM_FIS_TWR). |

> [!key] No confundir **CTR** (zona de control, espacio aéreo) con el sufijo **_CTR** de IVAO (posición de control de área, p. ej. GCCC_CTR).

Ejemplo de estructura (TMA de Barcelona, dentro de la FIR LECB): contiene los CTR de Barcelona, Reus, Lleida y Girona (con sus ATZ), la FIZ de Andorra-La Seu y el ATZ de Sabadell. Según nivel y zona, el TMA es clase A, C, D o G. Límites en AIP **ENR 2.1**.

![fig:espacio|Estructura vertical típica del espacio aéreo alrededor de un aeropuerto]

## Espacios aéreos especiales

| Zona | Identificación | Vuelo | Horario | Límites |
|---|---|---|---|---|
| **P** Prohibida | (OACI 2 letras) **P** (n): LEP142 | **Prohibido** sin permiso del Estado | **Permanente** | Desde la **superficie** |
| **D** Peligrosa | **D**: LED1, GCD3 | Pueden darse actividades peligrosas; informarse antes de entrar | Según AIP | Superficie o nivel, según AIP |
| **R** Restringida | **R**: LER12, GER11 | Solo si se cumplen las condiciones de la zona | Según AIP | Según AIP |
| **TSA** Temporalmente segregada | **TS**: LETS22 | **Solo** las aeronaves participantes | Temporal, AIP/NOTAM | Publicados |
| **TRA** Temporalmente reservada | **TR**: LETR3 | Participantes y **otras con autorización ATC** | Temporal, AIP/NOTAM | Publicados |
| **F** Fauna | **F** (n): F1 | **Prohibido** a todas | **Permanente** | Desde la superficie (AIP ENR 5.6) |
| **RMZ** Radio obligatoria | — | Escucha obligatoria y llamada inicial antes de entrar | — | En E, F o G |
| **TMZ** Transpondedor obligatorio | — | Transpondedor con altitud (modo C o S) | — | Pensada para VFR; sin transpondedor, con autorización ATC |
| **FPMZ** Plan de vuelo obligatorio | — | Plan de vuelo obligatorio | — | Sin valor añadido en IVAO (siempre hay plan) |

P, D, R, TSA y TRA se consultan en AIP **ENR 5.1**.

**RMZ** en detalle: se aplica a **VFR en E, F o G** y a **IFR en F o G**. En España hay RMZ dentro de las FIZ y en pasillos y sectores VFR.

![wiki:https://wiki.es.ivao.aero/uploads/images/gallery/2024-09/scaled-1680-/TMnimage.png|Zona prohibida en carta]
