---
id: comunicaciones
num: 4
title: Comunicaciones y fraseología
icon: mic
wiki: https://wiki.es.ivao.aero/books/controlador-de-aerodromo-adc/chapter/comunicaciones
---

## Técnica de transmisión

La fraseología estándar existe porque la aviación es internacional: un conjunto cerrado de frases en el que **cada mensaje significa una sola cosa**, pensado para eliminar barreras de idioma, funcionar bien por radio y cubrir las **situaciones normales**. Cuando no existe frase estándar, se usa lenguaje claro, **lo más breve y preciso posible**.

Buenas prácticas al transmitir:

- Pronunciar con claridad y evitar acentos difíciles.
- Entonación, volumen y velocidad constantes; distancia fija al micrófono (ni lejos, que entra ruido, ni pegado, que satura).
- Velocidad máxima recomendada: **100 palabras por minuto**.
- Configurar micro y auriculares antes de conectarse.
- Pensar antes de pulsar el PTT; si no se puede atender, decir **"ESPERE / STANDBY"**.

Convenciones de notación en la fraseología: `*` = transmisión del piloto; `(xxx)` = sustituir por el dato; `[xxx]` = opcional; `|` = separa español e inglés.

## Estructura de los mensajes

### Primera llamada

1. Indicativo de la estación **a la que se llama**.
2. Indicativo de la estación **que llama**.
3. Mensaje.

> P: Cuatro Vientos Torre, ECABC, solicito rodaje.
> A: ECABC, Cuatro Vientos Torre, ruede a punto de espera pista 27.

El ATC también se identifica al contestar a una primera llamada. A partir de ahí basta con el indicativo de la aeronave.

> [!key] El término **"ADELANTE / GO AHEAD"** ya **no se usa**. Para indicar "le escucho, transmita" basta con llamar a la estación.

### Quién – dónde – qué

Regla útil para el piloto: **quién** soy (indicativo), **dónde** estoy (y altitud si procede) y **qué** quiero.

> Valencia Torre, ECFSD, en plataforma sur, solicito rodaje para salida por punto visual S1.

### La colación (readback)

Es la repetición por parte del piloto para comprobar que ha recibido y entendido exactamente. El controlador debe **escucharla (hearback)** y **corregirla en el acto** si es errónea.

> [!key] Una colación **no realizada** equivale a una instrucción **no dada**. Una colación **incorrecta no corregida** puede acabar en incidente. Corregir con: **"NEGATIVO, REPITO (mensaje correcto) | NEGATIVE, I SAY AGAIN (…)"**.

Colacionado el mensaje, el piloto debe cumplirlo: no se colaciona lo que no se va a poder cumplir, y si surge el problema, se avisa cuanto antes.

**Siempre se colacionan:**

- Autorizaciones de ruta, límites de autorización, órbitas, circuitos…
- Autorizaciones e instrucciones de pista: **entrar, aterrizar, despegar, mantener fuera, cruzar y backtrack**.
- Pista en uso.
- Reglajes de altímetro (QNH).
- Códigos de transpondedor.
- Frecuencias.
- Instrucciones de nivel, rumbo y velocidad; niveles de transición.
- Cualquier otra autorización o instrucción importante.

## Categorías de mensajes (prioridad)

| Prioridad | Categoría | Ejemplos |
|---|---|---|
| 1 | **Socorro** | MAYDAY |
| 2 | **Urgencia** | PAN PAN; vuelos sanitarios (STS/HOSP, STS/MEDEVAC) |
| 3 | **Seguridad de los vuelos** | Autorizaciones e instrucciones de control; avisos MET de interés inmediato |
| 4 | **Meteorológicos** | Información MET a/de aeronaves |
| 5 | **Regularidad de los vuelos** | Servicios a la aeronave y otros que no afectan a la seguridad |

Dentro de la misma categoría, se atienden por orden de recepción.

## Alfabeto, indicativos y números

### Alfabeto fonético OACI

Alfa, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel, India, Juliett, Kilo, Lima, Mike, November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform, Victor, Whiskey, X-ray, Yankee, Zulu.

![wiki:https://wiki.es.ivao.aero/uploads/images/gallery/2025-08/alfabeto.jpg|Alfabeto fonético OACI]

### Indicativos de llamada (callsigns)

Se transmiten tal como figuran en el plan de vuelo. Tres formas:

1. **Matrícula** completa (o marca + matrícula): ECIUD → "Eco Charlie India Uniform Delta"; "Cessna ECIUD".
2. **Designador telefónico del operador + identificación del vuelo** (hasta 4 caracteres): SCP14LT → "Certified uno cuatro lima tango". Lo habitual en comercial.
3. Designador del operador + **últimos 4 caracteres de la matrícula** (poco usado en Europa).

**Abreviación**: solo **a iniciativa del controlador**, cuando no haya riesgo de confusión. Desde ese momento el piloto puede usar la forma abreviada en esa frecuencia; **al cambiar de frecuencia vuelve al completo**.

| Caso | Indicativo | Abreviado |
|---|---|---|
| 1 | ECXYZ | EYZ o EXYZ (1.ª letra + al menos las 2 últimas) |
| 1 | Cessna ECXYZ | Cessna YZ o Cessna ECYZ |
| 2 | Certified 14LT | **No se puede abreviar** |
| 3 | American BCDE | American DE o American BDE |

> [!key] Si hay **ECAZT** y **ECYZT** a la vez, **ninguno** puede abreviarse a "EZT". Ojo siempre con indicativos parecidos en frecuencia; si hace falta: **CAMBIE DISTINTIVO DE LLAMADA A… | CHANGE YOUR CALL SIGN TO…** y después **REANUDE DISTINTIVO DE LLAMADA DEL PLAN DE VUELO | REVERT TO FLIGHT PLAN CALL SIGN**.

Prefijos especiales: **RE** (salvamento), **CO** (policía), **CI** (tráfico), **ME** (sanitario), **EX** (extinción de incendios), **NA** (aduanas)… Los militares usan nombres (DUMBO01, LINCE02…).

### Letras, pistas y puntos

- Calles de rodaje y radioayudas se deletrean: "ruede vía **Delta Tres** y **Tango**".
- Puntos significativos (VOR, NDB, RNAV) se dicen en **lenguaje claro** y se deletrean solo en caso de duda: MARIO, "VOR de Pamplona", "NDB de Reus"; MD031 → "Mike Delta cero tres uno".
- **Pistas**: siempre dos cifras, con **cero delante** si hace falta (06 → "cero seis"). Las letras de paralelas **no** van en fonético: **izquierda / centro / derecha** (36L → "tres seis izquierda").

### Números

Regla general: **cifra a cifra**.

| Dato | Cómo se dice |
|---|---|
| Indicativos | VLG422 → "Vueling cuatro dos dos" |
| Rumbos | 035 → "**cero** tres cinco" (nunca "rumbo norte") |
| Viento | "viento cero tres cero grados, cinco nudos" |
| Velocidades | "dos tres cero nudos"; "Mach **coma** siete seis" |
| Niveles de vuelo | FL110 → "nivel de vuelo uno uno cero"; FL80 → "nivel de vuelo ocho cero" (sin cero delante); centenas enteras: FL100 → "nivel de vuelo **cien**", FL200 → "**doscientos**" |
| QNH | 1012 → "QNH uno cero uno dos"; 1000 → "QNH **mil**"; 993 → "QNH nueve nueve tres" (QNH se dice "cu-ene-ache") |
| Transpondedor | 7232 → "siete dos tres dos"; 0242 → "cero dos cuatro dos"; millares enteros: 2000 → "**dos mil**" |
| Frecuencias | 118,375 → "uno uno ocho **coma** tres siete cinco" (inglés "**decimal**") |

**Excepciones** — altitudes, alturas y elevaciones: se dicen **miles y cientos**: 6 000 ft → "seis mil pies"; 6 300 → "seis mil trescientos"; 10 000 → "**uno cero mil**"; 11 500 → "**uno uno mil** quinientos". Posición relativa horaria: "a sus **once**", "a las **doce**".

### Pruebas de radio

Escala de **inteligibilidad** de **1 a 5** (no existe el 0): 5 perfectamente inteligible, 4 inteligible, 3 inteligible con dificultad, 2 inteligible a ratos, 1 ininteligible. Mide comprensión, **no volumen**.

> P: Pamplona Torre, ECIUD, verificación radio 118,200.
> A: ECIUD, Pamplona Torre, le recibo cinco.

### Socorro y urgencia

| | **Socorro** | **Urgencia** |
|---|---|---|
| Situación | Amenaza grave y/o inminente; **necesita ayuda inmediata** | Afecta a la seguridad, pero **no necesita ayuda inmediata** |
| Llamada | **MAYDAY** ×3 | **PAN PAN** ×3 |

El mensaje incluye, en lo posible: dependencia llamada, identificación, naturaleza del problema, intenciones, posición/nivel/rumbo, y datos como personas a bordo, combustible/autonomía y mercancías peligrosas.

> MAYDAY, MAYDAY, MAYDAY, Sabadell Torre, ECABC, fallo de motor, intenciones de proceder a pista 31 para aterrizar, actualmente en viento en cola izquierda pista 31.

## Fraseología estándar

### Palabras y frases genéricas

| Español | Inglés | Significado |
|---|---|---|
| ACUSE DE RECIBO | ACKNOWLEDGE | Confirme que ha recibido y entendido |
| AFIRMO | AFFIRM | Sí |
| APROBADO | APPROVED | Se concede lo pedido (cuando no procede "autorizado") |
| SEPARACIÓN | BREAK | Separa partes de un mensaje |
| SEPARACIÓN, SEPARACIÓN | BREAK BREAK | Separa mensajes a distintas aeronaves con mucha carga |
| CANCELE | CANCEL | Anule la autorización anterior |
| COMPRUEBE | CHECK | Examine un sistema o procedimiento |
| AUTORIZADO | CLEARED | Permiso para proceder en las condiciones dadas |
| CONFIRME | CONFIRM | Solicito verificación de… |
| LLAME | CONTACT | Establezca comunicación con… |
| CORRECTO | CORRECT | Lo dicho es correcto |
| CORRECCIÓN | CORRECTION | Error en esta transmisión; lo correcto es… |
| ANULE | DISREGARD | Ignore esta transmisión |
| CÓMO ME RECIBE | HOW DO YOU READ | ¿Calidad de mi transmisión? |
| REPITO | I SAY AGAIN | Repito para aclarar o recalcar |
| MANTENGA | MAINTAIN | Continúe según lo indicado |
| MANTENGA ESCUCHA | MONITOR | Escuche en (frecuencia) **sin llamar** |
| NEGATIVO | NEGATIVE | No / no concedido / incorrecto |
| TERMINADO | OUT | Fin del intercambio, no se espera respuesta |
| COLACIONE | READ BACK | Repítame el mensaje tal cual |
| NUEVA AUTORIZACIÓN | RECLEARED | Se modifica la última autorización |
| NOTIFIQUE | REPORT | Páseme la información |
| *SOLICITO | REQUEST | Petición de la tripulación |
| RECIBIDO | ROGER | He recibido toda su transmisión |
| REPITA | SAY AGAIN | Repita todo o parte |
| HABLE MÁS LENTO | SPEAK SLOWER | Reduzca la velocidad |
| ESPERE | STANDBY | Espere, le llamaré |
| IMPOSIBLE | UNABLE | No puedo cumplir / no se puede aprobar |
| COMPRENDIDO | WILCO | Entendido y cumpliré |
| DOS VECES CADA PALABRA | WORDS TWICE | Comunicación difícil, repetir cada palabra |
| A DISCRECIÓN | AT OWN DISCRETION | Cuando y como estime |
| AL TRAVÉS | ABEAM | A ~90° de la derrota respecto a una referencia |

Otras: CUANDO LISTO | WHEN READY; HASTA NUEVO AVISO | UNTIL FURTHER ADVISED; PREVEA | EXPECT; PREVEA (n) MINUTOS DE DEMORA DEBIDO A… | EXPECT (n) MINUTES DELAY DUE…; ACELERE | EXPEDITE; A TODAS LAS ESTACIONES | ALL STATIONS.

> [!key] **ROGER** no es una respuesta a una pregunta ni sustituye a la colación: solo dice "recibido".

### Niveles

SUBA PARA | CLIMB TO; DESCIENDA PARA | DESCEND TO; NOTIFIQUE ABANDONANDO / ALCANZANDO / PASANDO (nivel) | REPORT LEAVING / REACHING / PASSING; INTERRUMPA SUBIDA/DESCENSO A | STOP CLIMB/DESCENT AT; CONTINÚE SUBIDA/DESCENSO PARA | CONTINUE CLIMB/DESCENT TO; ACELERE SUBIDA/DESCENSO | EXPEDITE CLIMB/DESCENT; SUBA VÍA SID A | CLIMB VIA SID TO; SI NO ES POSIBLE (alternativa) Y AVISE | IF UNABLE (…) AND ADVISE.

> [!key] En inglés conviene omitir "TO" o decir siempre "FLIGHT LEVEL"/"ALTITUDE" detrás, para no confundirlo con "TWO".

### Transferencias, tránsito, posición y transpondedor

- **LLAME (dependencia) (frecuencia) | CONTACT**; **MANTENGA ESCUCHA | MONITOR**; **MANTENGA ESTA FRECUENCIA | REMAIN THIS FREQUENCY**.
- Tránsito: NINGÚN TRÁNSITO NOTIFICADO | NO REPORTED TRAFFIC; TRÁNSITO (información) | TRAFFIC; PRECAUCIÓN ESTELA TURBULENTA | CAUTION WAKE TURBULENCE. Piloto: BUSCANDO | LOOKING OUT; TRÁNSITO A LA VISTA | TRAFFIC IN SIGHT; CONTACTO NEGATIVO | NEGATIVE CONTACT.
- Posición: NOTIFIQUE EN/PASANDO (punto) | REPORT AT/PASSING; distancias DME; *POSICIÓN SOBRE / AL TRAVÉS DE…
- Transpondedor: RESPONDA (código) | SQUAWK; RECICLE TRANSPONDER | RESET SQUAWK; TRANSPONDER (código) E IDENTIFICACIÓN | SQUAWK AND IDENT; TRANSPONDER ESPERA | SQUAWK STANDBY; TRANSMITA MODO | SQUAWK (mode).

### Meteorología y pista

VIENTO [EN SUPERFICIE] (n) GRADOS (n) NUDOS; VISIBILIDAD (n) METROS; RVR (n) METROS; TIEMPO PRESENTE; NUBES (cantidad, tipo, base) PIES; CIELO DESPEJADO; CAVOK; TEMPERATURA/PUNTO DE ROCÍO [MENOS]; QNH; (tipo) NOTIFICÓ (fenómeno); TORRE OBSERVA…; PILOTO INFORMA…; CONDICIÓN DE LA SUPERFICIE DE LA PISTA…; EFICACIA DE FRENADO NOTIFICADA POR (tipo) A LAS (hora) BUENA / MEDIANA A BUENA / MEDIANA / MEDIANA A ESCASA / ESCASA.

### Puesta en marcha y retroceso

- *SOLICITO PUESTA EN MARCHA | REQUEST START UP → PUESTA EN MARCHA APROBADA | START UP APPROVED; PUESTA EN MARCHA A LAS (hora); PUESTA EN MARCHA A DISCRECIÓN.
- *SOLICITO RETROCESO | REQUEST PUSHBACK → RETROCESO APROBADO [ENCARANDO/APROANDO AL (punto cardinal)] | PUSHBACK APPROVED [FACING …]; RETROCESO A DISCRECIÓN.

### Autorización IFR

AUTORIZADO HASTA (lugar) VÍA (ruta/SID) | CLEARED TO… VIA…; SUBA PARA (nivel); RESPONDA (código).

> [!key] En aeródromo se recomienda reservar **"AUTORIZADO"** para las **autorizaciones de pista** (despegar, aterrizar, toma y despegue…). En la autorización IFR se usa la preposición: "**A** Madrid-Barajas **vía** salida AMTOS4C".

Instrucciones de salida: SALIDA (SID); [DESPUÉS DE LA SALIDA] VIRE DERECHA/IZQUIERDA RUMBO (…) / CONTINÚE RUMBO DE PISTA / DERROTA PROLONGACIÓN DE EJE HASTA (nivel o punto); DESPUÉS DE ALCANZAR/PASAR (…) (instrucciones).

### Rodaje

- RUEDE A PUNTO DE ESPERA [(n)] [PISTA (n)] [VÍA (ruta)] | TAXI TO HOLDING POINT…; RUEDE A PUNTO DE ESPERA PISTA (n), INTERSECCIÓN (…).
- TOME/VIRE PRIMERA/SEGUNDA A IZQUIERDA/DERECHA; RUEDE VÍA (calle); RUEDE VÍA PISTA (n); RUEDE A PUESTO (n).
- *SOLICITO REGRESAR POR PISTA | REQUEST BACKTRACK → REGRESO POR PISTA APROBADO | BACKTRACK APPROVED.
- RUEDE DE FRENTE; RUEDE CON PRECAUCIÓN; CEDA PASO A…; RUEDE A ZONA DE ESPERA | TAXI INTO HOLDING BAY; SIGA A…; ABANDONE PISTA; ACELERE RODAJE; RUEDE MÁS LENTO; PRECAUCIÓN CHORRO DE REACTOR | CAUTION JET BLAST.
- **MANTENGA POSICIÓN | HOLD POSITION**; **MANTENGA CORTO DE (…) | HOLD SHORT OF**: rodar hasta cerca del punto **sin entrar ni obstaculizarlo**.
- Helicópteros: RODAJE AÉREO A/VÍA | AIR-TAXI TO/VIA.

### Cruce y abandono de pista

CRUCE PISTA (n) | CROSS RUNWAY; *SOLICITO CRUZAR PISTA; *PISTA LIBRE | RUNWAY VACATED; ACELERE ABANDONO DE PISTA; TOME LA PRIMERA/SEGUNDA/CONVENIENTE A LA IZQUIERDA/DERECHA.

### Antes del despegue

NOTIFIQUE LISTO [PARA SALIDA]; ¿LISTO [PARA SALIDA INMEDIATA]?; *LISTO | READY; **ALINEE [Y MANTENGA] PISTA (n) | LINE UP [AND WAIT]**; ALINEE PISTA (n), **PREPARADO PARA SALIDA INMEDIATA**.

**Autorización condicional** (condición + instrucción + **reiteración** de la condición):

> A: ECABC, **detrás** de la C172 en final, entre y mantenga pista 24, **detrás**.
> P: Detrás de la C172 en final, entro y mantengo pista 24, detrás, ECABC.

### Despegue

**PISTA (n) AUTORIZADO A DESPEGAR | RUNWAY (n) CLEARED FOR TAKE-OFF**; DESPEGUE INMEDIATO O ABANDONE PISTA; DESPEGUE INMEDIATO O MANTENGA FUERA DE PISTA.

> [!key] En autorizaciones de **despegue, aterrizaje, toma y despegue, pasada baja**… se da **siempre el viento en superficie**.

Cancelar un despegue:

- **Sin iniciar la carrera**: MANTENGA POSICIÓN, CANCELE DESPEGUE, REPITO, CANCELE DESPEGUE (motivo) | HOLD POSITION, CANCEL TAKE-OFF, I SAY AGAIN, CANCEL TAKE-OFF.
- **Ya en carrera**: (indicativo) **ABORTE DESPEGUE** (indicativo) **ABORTE DESPEGUE** | **STOP IMMEDIATELY** ×2.

### Después de la salida

*SOLICITO INSTRUCCIONES DE SALIDA; DESPUÉS DE LA SALIDA VIRE…/SUBA…; *SOLICITO VIRAJE DERECHA/IZQUIERDA → APROBADO VIRAJE…; ESPERE AUTORIZACIÓN DE VIRAJE | WILL ADVISE LATER FOR…; MANTENGA RUMBO | CONTINUE RUNWAY HEADING; MANTENGA TRAYECTORIA DE PISTA | TRACK EXTENDED CENTRE LINE; SUBA DIRECTO | CLIMB STRAIGHT AHEAD.

### Aterrizaje, frustrada y circuito

- **PISTA (n) AUTORIZADO PARA ATERRIZAR | CLEARED TO LAND**; AUTORIZADO TOMA Y DESPEGUE | CLEARED TOUCH AND GO; EFECTÚE ATERRIZAJE COMPLETO | MAKE FULL STOP; AUTORIZADO APROXIMACIÓN BAJA | CLEARED LOW APPROACH; AUTORIZADO PASADA BAJA | CLEARED LOW PASS.
- Autorización anticipada (solo donde el RCA lo permite): DETRÁS DEL (tipo) ATERRIZANDO/DESPEGANDO EN PISTA (n) AUTORIZADO A ATERRIZAR.
- **MOTOR Y AL AIRE | GO AROUND**; piloto: *MOTOR Y AL AIRE | GOING AROUND.
- Circuito: *(tipo) (posición) (nivel) INSTRUCCIONES PARA ATERRIZAR | FOR LANDING; ENTRE EN (tramo) (pista) | JOIN…; EFECTÚE APROXIMACIÓN DIRECTA | STRAIGHT-IN; NÚMERO (n), SIGA A (…) | NUMBER…, FOLLOW…; APROXIMACIÓN CORTA/LARGA; NOTIFIQUE EN (tramo); CONTINÚE APROXIMACIÓN [PREPARE POSIBLE MOTOR Y AL AIRE / ESPERE AUTORIZACIÓN TARDÍA] (si se prevé autorización tardía, dar el **viento**).
- Demoras VFR: **ORBITE** (derecha/izquierda) [DESDE SU POSICIÓN] | ORBIT; CIRCULE ALREDEDOR DEL AERÓDROMO; EFECTÚE OTRO CIRCUITO. (El RD 1180/2018 traduce "orbit" como "vuele en círculos" en aeródromo, pero se recomienda **"orbite"**.)

## Ejemplos de comunicaciones

### Salida VFR (Reus)

> P: Reus Torre, ECABC.
> A: ECABC, Reus Torre.
> P: En plataforma de aviación general, con información Charlie, solicito rodaje para abandonar el CTR por Echo.
> A: ECABC, tras la salida prevea viraje izquierda a Echo a 2 000 pies o inferior. Ruede a punto de espera DR pista 25, responda 3662, QNH 1020.
> P: (colación completa) ECABC.
> P: ECABC, en punto de espera DR, listo salida.
> A: ECABC, tras la salida viraje izquierda a Echo. Viento 230 grados 10 nudos, pista 25 autorizado a despegar.
> P: Tras la salida viro izquierda a Echo, pista 25 autorizado a despegar, ECABC.
> A: ECABC, notifique en Echo a 2 000 pies o inferior, ningún tránsito notificado.
> P: En Echo, 1 500 pies, ECABC.
> A: ECABC, mantenga escucha Barcelona Aproximación 121,125.

### Llegada VFR (Sabadell) con corrección de colación

> P: A 3 minutos de Whiskey, instrucciones para aterrizar.
> A: ECABC, pista 13, viento calma, QNH **1014**. Orbite en Whiskey, número cuatro.
> P: Pista 13, QNH **1004**, orbito en Whiskey, ECABC.
> A: ECABC, **negativo, repito QNH 1014**.
> P: QNH 1014, ECABC.
> A: ECABC, entre en viento en cola derecha pista 13.
> A: ECABC, tránsito, Cessna 172 en base derecha pista 13, notifique a la vista.
> P: Tránsito a la vista, ECABC.
> A: ECABC, número dos, siga a la Cessna 172.
> P: En final pista 13, ECABC.
> A: ECABC, viento calma, pista 13 autorizado para aterrizar.

### Información de tránsito

> A: ECABC, número 2, tránsito precedente A320 en final pista 25, notifique a la vista.
> P: Tránsito a la vista, ECABC.
> A: ECABC, siga al A320 en final pista 25. **Precaución estela turbulenta** media.

Si el piloto responde "contacto negativo", se le da más información (posición horaria, distancia, altura relativa) o se le hace esperar (órbita).

### Salida IFR (Lanzarote)

> P: Lanzarote Torre, SCP12 **pesado**.
> P: En stand T1, B787, con información Charlie, solicito autorización IFR a Sevilla.
> A: SCP12, información actual Charlie. **A** Sevilla vía KORAL7M, suba para nivel de vuelo uno dos cero, responda 2501.
> P: (colación) → A: SCP12, **colación correcta**.
> P: Solicito puesta en marcha y retroceso. → A: Puesta en marcha y retroceso aprobado, encarando al norte.
> A: SCP12, ruede a punto de espera E4, pista 03, vía C y R, QNH 1014.
> A: SCP12, detrás del B738 en final pista 03, entre y mantenga pista 03, detrás.
> A: SCP12, viento 090 grados 6 nudos, pista 03 autorizado a despegar.
> A: SCP12, llame a Canarias Aproximación 129,3.

## Errores típicos y recomendaciones

- **Muletillas y relajación**: "eeeh", QNH dicho como "mil veinticuatro", "baje a" en vez de "descienda", indicativos incompletos ("Iberia mil tres" en vez de "Iberia uno cero cero tres").
- **Comunicaciones innecesarias**: "¿listo para copiar?" cuando acaban de pedir la autorización; abusar de "notifique listo…"; repetir QNH o datos ya colacionados; información irrelevante del piloto ("calzos puestos y motores apagados"). Saturan y bloquean mensajes importantes.
- **Colación y hearback**: colacionar solo una parte; no escuchar las colaciones con carga alta. Corregir y pedir repetición.
- **Disciplina de radio**: "**escuchar antes de hablar**"; en frecuencias saturadas, pedir turno con solo el indicativo y evitar peticiones prescindibles.
- **Priorización**: el tráfico en el **aire** suele ir antes que el de tierra (y más si está parado). Clásico error: atender un rodaje y olvidar la autorización de aterrizaje de un tráfico en final. El abuso de "break break" suele indicar mala priorización.
- **Palabras incorrectas**: "autorizado" fuera de las autorizaciones de pista (es **RUEDE**, retroceso **APROBADO**, **ENTRE** en viento en cola); sinónimos no estándar: *ascienda* (→ **suba**), *afirmativo* (→ **afirmo**), *copiado* (→ **recibido**), *tráfico* en información (→ **tránsito**).
