# introduccion

- **SNA/ANS**: ATS, CNS, MET (AEMET), AIS (ENAIRE). Relacionados: ATM (ATFCM, ASM, ATS), SAR (RCC Madrid, Palma, Canarias), FPD.
- **PSR** = solo posición, sin colaboración. **SSR** = transpondedor: modo A (código), C (altitud), S (datos).
- **ATS = control (ATC) + información (FIS) + alerta (ALRS)**. Quien da control da también información y alerta; toda dependencia ATS da alerta.
- Control de **aeródromo** (DEL/GND/TWR), **aproximación** (radar o procedimientos) y **área** (_CTR en IVAO).
- **AFIS** = personas, información, sin autorizaciones. **ATIS** = emisión automática.
- Fases de alerta: **INCERFA** (30 min sin noticias), **ALERFA** (5 min sin aterrizar tras autorización, interferencia ilícita…), **DETRESFA** (combustible agotado, aterrizaje forzoso). No se simulan en IVAO.
- **TWR nunca lleva**: IFR antes de final, IFR en ruta, salidas por encima de **1000 ft AGL**, VFR fuera del CTR o a más de **2 min**.
- **No alinear** si: IFR en final a < **5–6 NM**, alguien autorizado a aterrizar, o despegue autorizado y se cruzaría su trayectoria.
- **No despegue / no aterrizaje** con: pista ocupada o en cruce, otro despegando sin pasar el final de pista, otro autorizado a aterrizar, otro autorizado a despegar.
- Transferir salidas a **~1000 ft AGL** (DEP → APP → CTR). Máx. **3 llegadas IFR** en final en frecuencia.
- VFR: transferido **2 min** antes; desde no controlado llama **1–2 min** antes; al salir a no controlado → **7000** y **UNICOM 122.800**.
- Integración al circuito: barlovento (**+500 ft** sobre el circuito), viento en cola, base, directa a final (**< 30°**).
- Frustrada: decisión del piloto; si a **2 NM** la pista no está libre, **TWR ordena motor y al aire**.
- IVAO: transpondedor **TX al entrar en pista, STANDBY al salir**; FORCE ACT; `.WALLOP`; UNICOM al pasar **1000 ft** si no hay APP/CTR.

# plan-de-vuelo

- En IVAO el plan es **obligatorio** para todos; sin él, desconexión automática.
- Casilla **7** indicativo; **8** reglas (V, I, **Y = IFR→VFR**, **Z = VFR→IFR**) y tipo (S, N, G, M, X); **9** tipo y estela; **10** equipo; **13** salida + **EOBT**; **15** velocidad/nivel/ruta; **16** destino, EET, alternativos; **18** otros (STS/, DOF/, REG/, TYP/, RMK/…); **19** autonomía y POB.
- Estela: **L ≤ 7 t**, **M 7–136 t**, **H ≥ 136 t**, **Super** (A380). **B757 = pesado cuando va delante**.
- Sin código OACI → **ZZZZ** + TYP/, DEP/, DEST/, ALTN/ en la casilla 18.
- Velocidad **N0450** (nudos), **M081** (Mach); nivel **F080**, **A060**, **VFR**.
- **Yankee**: el piloto pide cancelar IFR; el ATC confirma **con la hora UTC**. **Zulu**: sin cancelación explícita; se coordina y se transfiere a APP.
- **Salidas de contingencia**: rumbo inicial hasta la altitud mínima de vigilancia (ATCSMAC). Algunos IFR locales requieren coordinar con APP.

# meteorologia

- METAR cada **30/60 min**; viento respecto al **norte geográfico**; `G` rachas; `V` variable; **9999 = ≥ 10 km**.
- **FEW 1–2, SCT 3–4, BKN 5–7, OVC 8 octas**. **Techo = primera capa BKN/OVC**.
- **CAVOK**: vis ≥ 10 km, sin nubes < 5 000 ft (o MSA), sin CB/TCU, sin tiempo significativo.
- TREND (2 h): **BECMG**, **TEMPO** (< 1 h cada vez, < mitad del periodo), **NOSIG**.
- TAF: emisión, **validez**, TX/TN, PROB30/40, TEMPO, BECMG.
- **VMC en aeródromo: 5 000 m y techo 1 500 ft**.
- VMC en vuelo: **8 km** en/por encima de **FL100**; **5 km** por debajo; 1 500 m / 1 000 ft de nubes; en F/G a baja altura: **libre de nubes y superficie a la vista**.
- **SVFR**: solo de **día**, en **CTR**; piloto: vis **1 500 m** (800 helis), **≤ 140 kt**; ATC: vis en superficie **1 500 m** y techo **600 ft**. Lo autoriza **APP**; el ATC **nunca lo sugiere**; el ATC **separa** al SVFR.
- **LVP**: empiezan con RVR **≤ 800 m**, techo **≤ 250 ft** o vis **≤ 500 m**; acaban con RVR **≥ 1 500 m**, techo **≥ 500 ft** y tendencia de mejora. CAT II/III: autorización de aterrizaje antes de **2 NM**, LSA libre, **una** aeronave en aproximación; en tierra, **una aeronave en movimiento**.
- RVR: `R32L/0800V1200U` → U mejora, D empeora, N sin cambios, P por encima del máximo.

# comunicaciones

- Primera llamada: **a quién – quién – mensaje**. "Adelante / go ahead" ya no se usa.
- **Colación**: no hecha = instrucción no dada. Corregir con **"negativo, repito…"**.
- Siempre se colaciona: autorizaciones de ruta, **instrucciones de pista** (entrar, aterrizar, despegar, mantener fuera, cruzar, backtrack), pista en uso, **QNH**, **transpondedor**, **frecuencias**, nivel/rumbo/velocidad, TL.
- Prioridad: **socorro > urgencia > seguridad > meteorológicos > regularidad**.
- Abreviar indicativos solo **a iniciativa del ATC** y sin confusión; al cambiar de frecuencia, completo. **Certified 14LT no se abrevia**.
- Pistas con dos cifras y **izquierda/centro/derecha** (no fonético). Rumbos con cero ("cero tres cinco"). Niveles sin cero delante (FL80 "ocho cero"); centenas: "cien", "doscientos". Altitudes: miles y cientos ("uno uno mil quinientos"). QNH 1000 = "mil". Squawk 2000 = "dos mil". "Coma"/"decimal".
- Inteligibilidad **1–5** (no hay 0).
- **MAYDAY** (ayuda inmediata) / **PAN PAN** (sin ayuda inmediata).
- "Autorizado" solo para **operaciones de pista**; retroceso "aprobado"; "ruede"; "entre en viento en cola". En la autorización IFR: "**A** (destino) vía…".
- Viento en **toda** autorización de despegue/aterrizaje.
- Cancelar despegue: sin carrera "**mantenga posición, cancele despegue**"; en carrera "**aborte despegue**" ×2.
- Condicional: **condición + instrucción + "detrás"**.
- **Monitor** = escuchar sin llamar. **Hold short** = parar antes sin entrar.
- Errores: muletillas, "ascienda", "afirmativo", "copiado", "tráfico"; priorizar el **aire** sobre la tierra.

# espacios-aereos

- **A** solo IFR · **B** separa todos · **C** separa IFR de todos (VFR↔VFR info; 250 kt solo VFR) · **D** separa IFR↔IFR · **E** controla solo IFR, **no en CTR** · **F** asesoramiento · **G** información. A–E controlados.
- **D** = la más común en **ATZ/CTR** en España.
- 250 kt IAS bajo **FL100** en C (VFR), D, E, F, G.
- FIR España: **LECM, LECB, GCCC**; UIR desde **FL195**.
- **CTA/TMA**: base ≥ 700 ft sobre el terreno. **CTR**: desde la **superficie**, protege IFR (radio ≥ 5 km). **ATZ**: desde la superficie, techo el menor entre publicado y techo de nubes. **FIZ**: no controlada, AFIS (**_FIS_TWR**).
- _CTR en IVAO = posición de área, no zona de control.
- Especiales: **P** (prohibida, permanente), **D** (peligrosa), **R** (restringida), **TSA** (solo participantes), **TRA** (otros con autorización), **F** (fauna, prohibida), **RMZ** (radio; VFR en E/F/G, IFR en F/G), **TMZ** (transpondedor modo C/S), **FPMZ** (plan de vuelo).

# altimetria

- ISA: **1013,25 hPa**, **15 °C**, **1 hPa ≈ 27 ft**, −1,98 °C/1 000 ft.
- **Altitud** (MSL), **altura** (referencia), **elevación** (terreno), **FL** (1013), **nivel** (genérico).
- **QFE** → altura (0 en tierra, no se usa en España). **QNH** → altitud (elevación en tierra). **1013/QNE** → FL.
- **TA** fija (≥ 3 000 ft). España **6 000 ft**; **TMA Madrid y Málaga 13 000**; **Granada 7 000**; **La Seu 8 000**.
- **TL** varía con el QNH; capa de transición **≥ 1 000 ft**. QNH bajo → TL más alto.
- TL con TA 6 000: **942–959 FL90 · 960–977 FL85 · 978–995 FL80 · 996–1013 FL75 · 1014–1031 FL70 · 1032–1050 FL65**. TA 8 000 = +20; TA 13 000 = +70.
- Subiendo: a 1013 en la **TA**; bajando: a QNH en el **TL**. Cruzando la capa: subiendo en FL, bajando en altitud.
- Europa: 1013 antes de la TA si > **3 000 ft AAL** y autorizado a un FL; QNH antes del TL si autorizado a una altitud.

# separaciones

- Clase D: **IFR↔IFR el ATC**; IFR↔VFR y VFR↔VFR los pilotos con información de tránsito.
- La separación básica es **la pista**. Despegue tras: aterrizaje **fuera de pista**, salida que **cruzó el final** o **inició viraje**.
- "Grado razonable de seguridad" de que existirá la separación.
- Paralelas: salidas independientes **≥ 760 m** y **≥ 15°**; segregadas **≥ 760 m**, **30°** con la frustrada, solo **ILS o visual**.
- **TWR** separa salidas: **estela (todas, también VFR)** + **sucesivas (solo IFR)**.
- Estela salida: segunda menor que la primera → **2 min**; tras **Super** 3 min (pesada tras Super 2); **intersección +1 min** (según la wiki, también afecta a pesada tras pesada). Toma y despegue = intersección.
- Paralelas < 760 m = pista única. Cruzadas/paralelas ≥ 760 m si se cruzan a < 1 000 ft por debajo.
- Sucesivas IFR: lenta (pistón/heli), media (turbohélice), rápida (reactor), muy rápida (caza). R→R **2 min/4 NM**; R→M 1,5/3; R→L 1,5/2; M→M 2/3; M→L 1,5/2; tras muy rápida 2/4; **más rápida detrás, tras lenta o muy rápida detrás → SUJETA**.
- Tiempo desde el inicio de la carrera; distancia desde el umbral opuesto. Procedimiento local > tabla genérica.
- **Sujeta** (necesita APP) / **suelta** (aprobada). Tras **frustrada → sujeta**. Sin APP, sujeta → suelta a los **5 min**.
- **Siempre la más restrictiva.**
- Llegadas: las separa **APP**. Estela llegada: L tras M 3 min/5 NM; L tras H 3/6; L tras J 4/8; M tras H 2/5; M tras J 3/7; H tras H —/4; H tras J —/6. Radar → NM; convencional → minutos.
- Sin estela: **VFR** tras M/H y **visual con separación propia** → "precaución estela turbulenta".

# emergencias

- Situaciones inusuales: **conciencia situacional, anticipa, informa, coordina**.
- Cerca de IMC: avisar, VFR a tierra o fuera; **nunca sugerir SVFR**.
- Fallo de comunicaciones: **7600**, squawk ident, maniobra de confirmación, texto en IVAO.
- Visual de un IFR: vis **≥ 5 km** y techo suficiente (o la tripulación lo asegura); la autoriza **APP**.
- Frustrada: avisar a APP; siguiente salida IFR **sujeta**.
- **Emergencia** (MAYDAY, aterrizar ya) vs **urgencia** (PAN PAN).
- **ASSIST**: Acknowledge, Separate, Silence, Inform, Support, Time. "**A todas las estaciones, cesen de transmitir, MAYDAY**".
- Frenos: pista más larga, nada corto detrás. Ave: ¿controla la aeronave? Despegue abortado: **retener pista**. Fuego: pista libre a **20 NM**, mercancías peligrosas y POB. Tren: **pasada baja**. Combustible: **MAYDAY FUEL = emergencia**, **minimum fuel = solo informar demora**; mantener alta.
- Prioridad para aterrizar: **emergencias > sanitarios > SAR > operacionales > resto**. Llegadas antes que salidas.

# gestion-transito

- **Área de maniobras** = pistas + rodaduras; **de movimiento** = + plataformas.
- Puesta en marcha aprobada para quien afecta al área de movimiento y **todos los helicópteros**; exentos VFR ligeros de pistón. Cuidado **jet blast**.
- Retroceso **aprobado**; cruzar pista **siempre** con autorización, aunque no esté en uso.
- Pista libre cuando **toda la aeronave rebasa el punto de espera**. Turn pad = pista.
- Intersección: piloto la pide o la acepta; controlador **no la impone** y debe conocer la **TORA**.
- GND: rodaje con **pista** y **máx. 3 calles**; información de tránsito **obligatoria**; cruce de pista activa en frecuencia de **TWR**. Transferencia a TWR al acercarse al punto de espera; a GND al librar pista.
- CTR: VFR en tránsito por encima del circuito (**500–1 000 ft**), información mutua, prever frustradas del IFR.
- Integración: viento en cola (defecto), base, directa (±30°). **Circuito lleno con 4**. Los del circuito tienen prioridad. Órbitas sobre punto VFR.
- Pista en uso: viento de cara; la **seguridad prevalece sobre el ruido**; ruido no cuenta con cruzado **> 15 kt** o cola **> 5 kt**, contaminación, IMC… Cambio → avisar y **ATIS**.
- Despegue inmediato: sin detenerse. **Pesados nunca aterrizan más allá de la TDZ.**
- Separación reducida en pista: solo si publicada; **nunca salida-llegada**; cat. 1/2/3 → **600 / 1 500 / 2 400 m**; vis ≥ 5 km, techo ≥ 1 000 ft, cola ≤ 5 kt.
- Suspensión VFR sin VMC: retener salidas, recoger VFR o SVFR, avisar APP.
- Circuito complicado: alargar viento en cola, 360°, órbita en punto VFR, retener tomas y despegues, desvío.

# examen

- Requisitos: **AS3** con **2 meses**, **50 h** totales, **15 h** en la dependencia en los **3 meses** previos (conexiones < 30 min no cuentan). Repetir: **+10 h** (≥ 51) o **+15 h** (≤ 50).
- Tránsito mínimo: **2 VFR** simultáneos (o 1 VFR + 1 VFR/2 IFR), **4 salidas IFR** (1 no estándar), **4 llegadas IFR**, **1 emergencia**, **1 frustrada del piloto**, **1 tránsito solo texto**.
- ATIS con **"Exam in progress – no unauthorised Emergencies."**
- Sin **GND**; no abrir posiciones inactivas ni desdobladas; buscar a los adyacentes obligatorios.
- Suspenso automático: teoría muy pobre, no saber llevar VFR de un ATZ, sin cartas, sin adyacentes; pérdida de separación, autorizar con pista ocupada, aterrizajes/despegues que no permitan frustrada/ascenso seguro, fraseología pobre.
