---
id: meteorologia
num: 3
title: Meteorología y LVP
icon: cloud
wiki: https://wiki.es.ivao.aero/books/controlador-de-aerodromo-adc/chapter/meteorologia-y-lvp
---

## El METAR

Es el informe de observación meteorológica de un aeródromo, emitido periódicamente (cada **30 o 60 minutos**). Convenciones: rumbos referidos al **norte geográfico**, visibilidad en **metros**, alturas de nubes en **pies sobre el aeródromo**, y viento en nudos (KT) o en metros por segundo (**MPS**, habitual en China y Rusia).

Ejemplo de referencia:

`LEVX 131430Z 22010G25KT 170V250 9999 FEW015 BKN020TCU 02/M01 Q1001`

| Grupo | Significado |
|---|---|
| `LEVX` | Indicador OACI del aeródromo (Vigo). |
| `131430Z` | Día 13, a las 14:30 UTC. |
| `22010G25KT` | Viento de **220°** a **10 kt** con rachas (**G**) de **25 kt**. |
| `170V250` | Dirección variable entre 170° y 250°. |
| `9999` | Visibilidad de **10 km o más**. |
| `FEW015` | Nubes escasas a 1 500 ft. |
| `BKN020TCU` | Muy nuboso a 2 000 ft, con torrecúmulos. |
| `02/M01` | Temperatura 2 °C, punto de rocío −1 °C (M = menos). |
| `Q1001` | QNH 1001 hPa. |

### Nubosidad

| Código | Significado | Octas |
|---|---|---|
| **FEW** | Escasas | 1–2 |
| **SCT** | Dispersas | 3–4 |
| **BKN** | Muy nuboso | 5–7 |
| **OVC** | Cubierto | 8 |

Nubes de desarrollo vertical: **TCU** (torrecúmulos, cumulus congestus) y **CB** (cumulonimbos).

> [!key] **Techo de nubes** = base de la capa **más baja BKN u OVC**. FEW y SCT no cuentan como techo. En el ejemplo de Vigo, el techo es 2 000 ft.

### Punto de rocío

Es la temperatura a la que habría que enfriar el aire, sin cambiar su humedad, para que se sature (humedad relativa del 100 %) y condense. Cuanto **más cerca** están temperatura y punto de rocío, más probable es la formación de **neblina o niebla** y la reducción de visibilidad.

### Tiempo significativo

Cuando hay fenómenos, aparece un grupo formado por intensidad (`-` débil, sin signo moderado, `+` fuerte, `VC` en las proximidades), descriptor (`MI` baja, `BC` bancos, `PR` parcial, `DR` ventisca baja, `BL` ventisca alta, `SH` chubascos, `TS` tormenta, `FZ` engelante) y fenómeno: precipitación (`DZ` llovizna, `RA` lluvia, `SN` nieve, `SG` cinarra, `PL` hielo granulado, `GR` granizo, `GS` granizo pequeño, `UP` desconocida), oscurecimiento (`BR` neblina, `FG` niebla, `FU` humo, `VA` ceniza volcánica, `DU` polvo, `SA` arena, `HZ` calima) y otros (`PO` remolinos, `SQ` turbonada, `FC` nube embudo, `SS`/`DS` tempestad de arena/polvo).

![wiki:https://wiki.es.ivao.aero/uploads/images/gallery/2024-09/scaled-1680-/Y7Uimage.png|Códigos de tiempo significativo (1)]
![wiki:https://wiki.es.ivao.aero/uploads/images/gallery/2024-09/scaled-1680-/xBtimage.png|Códigos de tiempo significativo (2)]

### Otros indicadores

- **RE**: fenómeno reciente (p. ej. `RERA`).
- **NSW**: fin del tiempo significativo.
- **NSC**: sin nubes significativas (cuando no procede CAVOK ni SKC).
- **CAVOK**: sustituye a visibilidad, nubes y tiempo presente cuando se cumplen **todas** estas condiciones:

> [!key] **CAVOK** = visibilidad **≥ 10 km** + ninguna nube por debajo de **5 000 ft** o de la MSA (la mayor) + **ningún CB ni TCU** + ningún fenómeno significativo.

### TREND (pronóstico de tendencia)

Se añade al METAR/SPECI y cubre las **2 horas** siguientes:

- **BECMG**: cambio que se espera en una franja concreta.
- **TEMPO**: fluctuaciones temporales de menos de 1 hora cada una que en total cubren menos de la mitad del periodo.
- **NOSIG**: sin cambios significativos en las próximas 2 horas.

### Lectura completa de un METAR

`LEAS 052000Z 33007G30KT 300V360 5000 BR SCT015 SCT030 BKN050 07/04 Q1015`

Asturias, día 5 a las 20:00 UTC; viento de 330° a 7 kt con rachas de 30, variable entre 300° y 360°; visibilidad 5 km con neblina; nubes dispersas a 1 500 y 3 000 ft y muy nuboso a 5 000 ft (techo 5 000 ft); 7 °C, rocío 4 °C; QNH 1015.

## El TAF

Es el **pronóstico** del aeródromo para un periodo concreto (con más de un 50 % de probabilidad). Usa los mismos códigos que el METAR, con algunos añadidos:

`LEBB 031700Z 0318/0418 35010KT 9999 SCT020 BKN040 TX16/0414Z TN04/0405Z PROB30 TEMPO 0318/0320 02012G22KT BECMG 0320/0322 VRB03KT`

| Grupo | Significado |
|---|---|
| `031700Z` | **Emitido** el día 3 a las 17:00 UTC. |
| `0318/0418` | **Válido** del día 3 a las 18 al día 4 a las 18 UTC. |
| `TX16/0414Z` | Temperatura **máxima** 16 °C el día 4 a las 14 UTC. |
| `TN04/0405Z` | Temperatura **mínima** 4 °C el día 4 a las 05 UTC. |
| `PROB30` / `PROB40` | Probabilidad del 30 % (media-baja) / 40 % (media-alta). |
| `TEMPO 0318/0320` | Temporalmente entre las 18 y las 20 del día 3. |
| `BECMG 0320/0322` | Evolucionando entre las 20 y las 22; desde las 22 queda así. |

Lectura de otro ejemplo: `TAF LEBL 071700Z 0718/0818 33011KT 9999 SCT040 SCT066 BKN080 TX16/0719Z TN04/0809Z BECMG 0801/0804 2000 -RA BKN008 BECMG 0807/0809 3000 BKN016 TEMPO 0809/0812 9999 SCT015 SCT030` → Barcelona, emitido el 7 a las 17 Z, válido de 07/18 a 08/18. Viento 330/11, ≥10 km, nubes a 4 000, 6 600 y techo a 8 000 ft. Máx. 16 °C (7 a las 19 Z), mín. 4 °C (8 a las 09 Z). Entre 01 y 04 Z del día 8 evoluciona a 2 000 m con lluvia débil y techo a 800 ft; entre 07 y 09 Z a 3 000 m y techo a 1 600 ft; temporalmente de 09 a 12 Z, ≥10 km con nubes dispersas a 1 500 y 3 000 ft.

## Condiciones VMC y VFR especial

### VMC en el aeródromo

> [!key] Para operar VFR en un **ATZ/CTR** hacen falta, a la vez: visibilidad en superficie de al menos **5 000 m** y techo de nubes de al menos **1 500 ft**. (Techo = desde BKN incluido.)

### Mínimas VMC en vuelo

| Altitud | Clases | Visibilidad | Distancia a nubes |
|---|---|---|---|
| En o por encima de **FL100 / 10 000 ft AMSL** | A–G | **8 km** | **1 500 m** horizontal, **1 000 ft** vertical |
| Por debajo de 10 000 ft y por encima de 3 000 ft AMSL o 1 000 ft sobre el terreno (lo más alto) | A–G | **5 km** | 1 500 m horizontal, 1 000 ft vertical |
| En o por debajo de 3 000 ft AMSL o 1 000 ft sobre el terreno (lo más alto) | A, B, C, D, E | **5 km** | 1 500 m horizontal, 1 000 ft vertical |
| Ídem | **F, G** | **5 km** | **Libre de nubes y con la superficie a la vista** |

Notas: en F y G a baja altura la visibilidad puede reducirse hasta **1 500 m** a velocidades que permitan ver y evitar a tiempo (según normativa nacional); los helicópteros pueden operar por debajo de 1 500 m en esas condiciones. Las mínimas en clase A son orientativas y no implican que el VFR esté permitido allí.

### VFR especial (SVFR)

Puede autorizarse dentro de una **zona de control (CTR)**, con autorización ATC, si:

| Condición | Valor |
|---|---|
| Horario | **Solo de día** |
| Piloto | Libre de nubes, con el terreno a la vista; visibilidad en vuelo ≥ **1 500 m** (**800 m** helicópteros); velocidad **≤ 140 kt IAS** |
| ATC | Visibilidad en superficie ≥ **1 500 m** (800 m helicópteros) y techo ≥ **600 ft** |

> [!key] El SVFR lo **autoriza APP** (la dependencia responsable del CTR): TWR lo solicita y transmite la autorización; TWR sí puede denegarlo por sí misma. El ATC **nunca sugiere** un SVFR: informa de las condiciones y **pregunta intenciones**. En clase C, D o E, con SVFR la **separación pasa a ser responsabilidad del controlador**.

## Nubes e instrumentos

![wiki:https://wiki.es.ivao.aero/uploads/images/gallery/2024-09/scaled-1680-/koEimage.png|Principales tipos de nubes]

Instrumentos que alimentan el METAR:

- **Transmisómetro**: mide el **RVR** (alcance visual en pista).
- **Anemómetro**: dirección e intensidad del viento.
- **Ceilómetro**: altura de la base de las nubes.
- **Sondas** de temperatura y humedad, y estaciones automáticas.

## ATIS

Mensaje pregrabado, **automático y continuo**, con la información operativa del aeródromo: hora de la observación, viento, visibilidad y fenómenos, nubes y techo, temperatura y rocío, QNH, aproximación y pista en uso, y, si procede, instrucciones para que los VFR contacten con aproximación. Libera la frecuencia y reduce la carga del controlador.

- Se actualiza con cada nuevo informe oficial (normalmente cada hora) o cuando cambia algo importante (pista, aproximación en uso…).
- Cada versión lleva una **letra**; el piloto debe escucharlo y confirmar la letra en el primer contacto: "Jerez Torre, EC-ABC, Cessna 172, información **Sierra**, solicito…".

> [!ivao] En IVAO cada controlador escribe su propio ATIS y se transmite por **texto**: aparece al seleccionar la dependencia en el cliente o al teclear `.atis LEMD_APP` (por ejemplo) en Aurora/Altitude.

## Procedimientos de visibilidad reducida (LVP)

Sirven para operar con seguridad con poca visibilidad. Lo que sigue es el **esquema genérico**; siempre manda lo publicado en el AIP de cada aeródromo.

> [!key] **Se activan** si se cumple **alguna**: RVR **≤ 800 m** en cualquier transmisómetro; techo **≤ 250 ft (75 m)**; visibilidad **≤ 500 m**.
> **Se cancelan** con: RVR **≥ 1 500 m** en todos los transmisómetros, techo **≥ 500 ft** y tendencia firme de mejora.

- Se informa a los pilotos; el ATIS emite **"LVP in progress"**. Cualquier incidencia que afecte a las LVP se comunica de inmediato.
- En aproximaciones **ILS CAT II/III**, la autorización de aterrizaje **no se da más tarde de 2 NM** de la TDZ y solo con las **áreas sensibles del ILS (LSA) libres**. Solo puede haber **una aeronave establecida** en la aproximación. Si a 2 NM no está autorizada → **aproximación frustrada**.
- **En tierra**: criterio de **"una sola aeronave en movimiento en el área de maniobras"** salvo autorización distinta. Si un piloto duda de su posición, se detiene y pide guiado o un "Sígame".
- **Retrocesos**: nunca simultáneos desde puestos contiguos.
- **Rodaje**: el ATC asegura que las áreas sensibles estén libres antes de autorizar despegues o aterrizajes. Algunos aeropuertos tienen rutas de rodaje LVP específicas.
- **Llegadas**: abandonan la pista solo por salidas con **luces de eje (TCLL)** encendidas; notifican **pista libre**, **LSA libre** y la salida usada; esperan al "Sígame" en plataforma.
- **Salidas**: no se pide puesta en marcha, retroceso ni rodaje si el RVR/visibilidad está por debajo de los mínimos del aeródromo. Con RVR/visibilidad **< 500 m**, normalmente **un solo rodaje a la vez** en el área de movimiento.

![wiki:https://wiki.es.ivao.aero/uploads/images/gallery/2024-09/scaled-1680-/S7uimage.png|Rodaje LVP de LEBL, configuración oeste]

### El RVR en el METAR

Va justo detrás de la visibilidad: `R` + pista (con L/C/R) + `/` + metros, y opcionalmente variación y tendencia.

| Ejemplo | Lectura |
|---|---|
| `R32L/0800` | RVR de la pista 32L, 800 m |
| `R32L/0800V1200` | Variable entre 800 y 1 200 m |
| `R32L/0800U` | 800 m con tendencia a **mejorar** (U) |
| `D` / `N` | Empeorando / sin cambios |
| `P` (p. ej. `R32L/P2000`) | Por encima del máximo que mide el sistema: mirar la visibilidad |
