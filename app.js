(function () {
  var findings = [
    { cat: "orden", date: "2026-09-16", nota: "Nota", hus: "HU5, HU18, HU24, HU25, HU41",
      title: "Auditoría acoplada a un dominio que aún no existe",
      take: "5 HU de auditoría (carga, templates, cotejo, login) piden campos que solo su dominio produce; se reubicaron justo después de su HU de dominio en vez de agruparlas con las genéricas.",
      body: "<p>Sus criterios piden campos que solo ese dominio puede producir: nombre de archivo, NUIP, dedo cotejado, usuario que intentó loguearse. En cambio HU74–HU77 sí se pueden implementar y verificar de forma independiente porque hablan del mecanismo de auditoría en sí, no de un dominio concreto.</p>" },

    { cat: "orden", date: "2026-09-16", nota: "Nota 2", hus: "HU48→HU47, HU78/79→HU67",
      title: "Auditoría de dependencias sobre las 99 HU",
      take: "Revisión completa del backlog: HU48 depende de un resultado que produce HU47; HU78/79 dependen de dos archivos que genera HU67. Ambas familias se reubicaron.",
      body: "<p><b>HU48</b> (\"Despliegue de datos alfanuméricos tras resultado hit\") depende de que exista un \"hit\" de cotejo biométrico — eso lo produce HU47. Estaba mal ubicada en el grupo de consultas alfanuméricas; se movió justo después de HU47.</p><p><b>HU78</b> (exige <code class=\"mono\">ConcurrenciaCXBiometrica.txt</code> y <code class=\"mono\">Concurrencia_biometrica_servidor.txt</code>) depende de que HU67 ya pueda generar esos archivos. HU79 depende de HU78. Ambas se movieron a justo después de HU67.</p><div class=\"callout\">Abierto: HU78 también exige dos archivos alfanuméricos que ninguna de las 99 HU genera explícitamente — posible vacío real del backlog, a resolver al llegar ahí.</div>" },

    { cat: "orden", date: "2026-09-17", nota: "Nota 3", hus: "HU12, HU13",
      title: "HU12 depende de HU13 en su totalidad",
      take: "El criterio 1 de HU12 (\"detectar el SO y aplicar la ruta estándar\") es exactamente el mecanismo que define HU13. Se invirtió el orden: HU13 primero, HU12 después.",
      body: "<p>HU13 es la utilidad base de detección de sistema operativo y ruta base; HU12 es el gate de validación que la usa antes de cargar o procesar archivos. Implementar HU12 sin HU13 habría significado construir la misma lógica dos veces.</p>" },

    { cat: "dup", date: "2026-09-17", nota: "Nota 4", hus: "HU95≈HU90 · HU20/HU87 · HU14/HU15",
      title: "Tres pares de HU casi idénticas en el Word",
      take: "Revisión completa buscando requisitos duplicados, no solo orden. HU95 repite HU90 sin declararse HU integradora; HU20/HU87 comparten núcleo pero HU87 agrega alcance real; HU14/HU15 solo se parecen en el título.",
      body: "<p><b>HU95 ≈ HU90</b> — criterios casi calcados (SHA-256, 64 caracteres hex, verificación posterior). A diferencia de HU91, que sí declara explícitamente que consolida varios requerimientos, HU95 no tiene esa aclaración: parece repetición real. Decisión: se implementa una sola vez en HU90; HU95 se marca ✅ automáticamente verificando sus criterios contra lo ya construido.</p><p><b>HU20 / HU87</b> — comparten \"todo debe guardarse en JPG, se rechaza o convierte cualquier otro formato\" casi palabra por palabra, pero HU87 agrega alcance real (ubicación centralizada, metadatos, confirmación). Decisión: reusar el helper de validación/conversión JPG de HU20, no reimplementar la regla.</p><p><b>HU14 / HU15</b> — títulos casi idénticos pero criterios complementarios (mecánica de iteración vs. validación de formato/timeout/auditoría). Solo una nota para no confundirlas en la planeación.</p>" },

    { cat: "adapt", date: "2026-09-18", nota: "Nota 5", hus: "HU1 (aplica a HU29, HU40, HU42, HU43)",
      title: "HU1 asume una arquitectura cliente-servidor que este proyecto no tiene",
      take: "Los criterios mencionan HTTP 401/403 y tokens JWT, pero sa_certification_app es una app de escritorio sin servidor. Se acordó una interpretación explícita, aplicada a todo el grupo de identidad.",
      body: "<p>Interpretación acordada: \"servicios alojados en el servidor\" = servicios/operaciones internas de la aplicación; \"autorización\" = una <code class=\"mono\">Sesion</code> vigente sostenida en el proceso (activa y no expirada), no un token HTTP. El criterio de 401/403 se traduce a <code class=\"mono\">AccesoNoAutorizadoException</code>, documentada explícitamente como equivalente — mismo criterio aplicado después en HU29, HU40, HU42 y HU43.</p>" },

    { cat: "reuso", date: "2026-09-18", nota: "Nota 6", hus: "HU40 extiende HU29",
      title: "HU40 se solapa fuertemente con HU29",
      take: "Mismo formulario, misma validación contra la BD, mismo mensaje genérico. En vez de otra pantalla, se extendió AutenticacionServicio/LoginViewModel con las 2 piezas realmente nuevas.",
      body: "<p>HU40 C1 = HU29 C1 (formulario), HU40 C6 = HU29 C2 (validación contra BD), HU40 C5/C7 = HU29 C4 (mensaje genérico). Lo genuinamente nuevo: (a) longitud mínima de 8 caracteres en frontend y backend — nueva clase <code class=\"mono\">PoliticaContrasena</code>, dejada como punto de extensión para HU42; (b) límite de 3 segundos para el redirect, verificado con test de tiempo real.</p>" },

    { cat: "reuso", date: "2026-09-21", nota: "Nota 7", hus: "HU42 extiende HU40",
      title: "HU42 amplía PoliticaContrasena en vez de crear otra validación",
      take: "Frontend y backend comparten la misma función de validación y el mismo mensaje. Nueva excepción es la única que sí detalla los requisitos incumplidos, sin revelar si la cuenta existe.",
      body: "<p><code class=\"mono\">PoliticaContrasena</code> ganó mayúscula, minúscula, número y carácter especial, sumados a la longitud mínima de HU40. El backend lanza <code class=\"mono\">ContrasenaNoCumplePoliticaException</code> (hereda de <code class=\"mono\">CredencialesInvalidasException</code>): es la única excepción al mensaje genérico de HU29, y es segura porque describe la política pública — no la cuenta — y se evalúa antes de consultar al usuario. Los caracteres especiales son fijos a propósito: es una regla de seguridad, no configurable por entorno.</p><div class=\"callout\">Limitación conocida: contraseñas ya guardadas que no cumplan la política quedan bloqueadas al autenticar.</div>" },

    { cat: "reuso", date: "2026-09-21", nota: "Nota 8", hus: "HU43 reutiliza HU1, HU29, HU40, HU42",
      title: "HU43 es una HU integradora: 6 de 8 criterios ya existían",
      take: "Solo 2 piezas genuinamente nuevas: el gate de rol de administrador y el bloqueo temporal tras N intentos fallidos consecutivos, ambos configurables por entorno.",
      body: "<p>Nuevo: (a) <code class=\"mono\">VerificarAccesoAdministradorAsync</code> — además de sesión vigente, exige rol Administrador y estado Activo, sin copiar el rol a la sesión; (b) bloqueo temporal en <code class=\"mono\">AutenticacionServicio</code> por nombre de usuario (exista o no, sin enumeración), defaults 5 intentos / 15 min vía <code class=\"mono\">CERTBIOMETRICA_LOGIN_MAX_INTENTOS</code> / <code class=\"mono\">_BLOQUEO_MINUTOS</code>.</p><div class=\"callout\">Justificado: HTTPS/TLS no aplica (app de escritorio sin servidor, la contraseña nunca viaja). El contador de fallos vive en memoria del proceso.</div>" },

    { cat: "reuso", date: "2026-09-21", nota: "Nota 9", hus: "HU41 reutiliza el motor de HU74-77",
      title: "HU41 conecta el login al motor de auditoría existente",
      take: "No se construyó ningún mecanismo de auditoría nuevo. Se eliminaron 4 llamadas de log dispersas y se consolidaron 2 fakes de test casi idénticos.",
      body: "<p><code class=\"mono\">AutenticacionServicio.RegistrarIntentoAsync</code> es el único punto de salida de <code class=\"mono\">AutenticarAsync</code>: escribe cada intento (éxito o fallo) con actor, IP, fecha/hora con zona y el motivo real del fallo — que nunca se le revela al usuario. Nuevo: <code class=\"mono\">IIdentidadTerminalProvider</code>, porque nadie proveía identificador de terminal ni MAC para el registro de auditoría.</p><div class=\"callout\">Pendiente: la futura UI de consulta de auditoría debe aplicar VerificarAccesoAdministradorAsync (HU43).</div>" },

    { cat: "reuso", date: "2026-09-21", nota: "Nota 10", hus: "HU96 — base de HU97, HU98, HU99",
      title: "HU96 construye el ciclo de vida de usuarios y automatiza el primer administrador",
      take: "La tabla de historial ya existía pero nada la escribía. Se construyó GestionUsuariosServicio con trigger de solo lectura, y se automatizó por completo la creación del primer administrador.",
      body: "<p><code class=\"mono\">GestionUsuariosServicio</code> reemplaza el stub vacío <code class=\"mono\">GestiónDelCicloDe</code>: crear, habilitar, deshabilitar y consultar historial, todas exigen sesión de administrador y ninguna elimina (HU97). <code class=\"mono\">GuardarConHistorialAsync</code> guarda usuario + historial en una sola transacción. Migración con trigger de Postgres que rechaza UPDATE/DELETE/TRUNCATE sobre el historial.</p><p>El primer administrador se crea solo con <code class=\"mono\">CERTBIOMETRICA_ADMIN_INICIAL_USUARIO</code>/<code class=\"mono\">_CONTRASENA</code> en un archivo <code class=\"mono\">.env</code> que la app carga sola al arrancar — sin script, sin pasos manuales. Idempotente, valida configuración a medias, y dos instancias arrancando a la vez no se pisan.</p>" },

    { cat: "reuso", date: "2026-09-22", nota: "Nota 11", hus: "HU97 reutiliza HU96",
      title: "HU97 ya estaba resuelta en gran parte por las decisiones de HU96",
      take: "Los contratos nunca expusieron eliminación. Se agregó una tercera capa de defensa — trigger de Postgres y análisis estático del código — más un método que audita y rechaza cualquier intento.",
      body: "<p><code class=\"mono\">IUsuarioRepository</code> e <code class=\"mono\">IGestionUsuariosServicio</code> nunca tuvieron un método de eliminación. Nuevo: <code class=\"mono\">EliminarAsync</code> — el punto único que cualquier canal futuro debería invocar para \"eliminar\"; siempre audita (actor, fecha, canal) y siempre rechaza, incluso sin sesión válida, porque la prohibición es absoluta. Trigger de Postgres bloquea DELETE/TRUNCATE sobre Usuario sin afectar UPDATE. Test de análisis estático vigila que nadie agregue un <code class=\"mono\">Usuario.Remove</code> en el futuro.</p>" },

    { cat: "dup", date: "2026-09-22", nota: "Nota 12", hus: "Auditoría transversal (HU2, HU29, HU43, HU96, HU97)",
      title: "El usuario pidió confirmar que no hubiera duplicidad/hardcode — no estaba todo bien",
      take: "Auditoría exhaustiva de TODO lo implementado (no solo lo tocado en la sesión): 5 hallazgos reales, incluida una recaída del mismo tipo de duplicado de test que ya se había corregido antes.",
      body: "<p>Un bug real: el timeout de sesión (HU29) no validaba que el valor fuera positivo — un <code class=\"mono\">0</code> generaba sesiones que expiraban al instante, sin aviso; se compartió con el bloqueo de HU43 en <code class=\"mono\">EntornoNumerico.LeerEnteroPositivo</code>. Dos duplicaciones: la cadena de conexión por defecto copiada en producción y en tests, y un <code class=\"mono\">new Usuario{...}</code> a mano en vez del builder compartido (recaída del mismo error de un incidente anterior). Una pieza de código huérfano: <code class=\"mono\">GuardarAsync</code> sin llamadores de producción desde HU96 — eliminada, con riesgo real de saltarse el historial obligatorio si alguien la hubiera reusado. Una inconsistencia: el <code class=\"mono\">CancellationToken</code> de la auditoría de HU97 no seguía el mismo criterio ya aplicado en HU41.</p><div class=\"callout\">Cambio de proceso: se agregaron 4 chequeos obligatorios al cierre de cada HU (patrones sin nombre, código huérfano, consistencia entre módulos, bypass de builders), en vez de depender de que se pida una auditoría puntual.</div>" },

    { cat: "reuso", date: "2026-09-22", nota: "Nota 13", hus: "HU98 reutiliza HU96/HU97",
      title: "HU98 es casi enteramente consecuencia de HU96/HU97",
      take: "5 de 6 criterios ya estaban cubiertos por el historial y la restricción de eliminación. La única pieza nueva es una consulta de administrador sobre usuarios deshabilitados.",
      body: "<p>Nuevo: <code class=\"mono\">GestionUsuariosServicio.ObtenerAsync</code> — hasta ahora no existía forma de consultar los datos completos de un usuario (solo su historial de cambios); exige sesión de administrador y no depende del estado del usuario consultado. El resto de los criterios ya estaban probados: datos intactos tras deshabilitar (HU96), historial íntegro (HU96), cambio de estado lógico (HU96), registro de la deshabilitación (HU96).</p><div class=\"callout\">Se detectó y corrigió un test flaky real al correr la suite: comparar una fecha por igualdad exacta tras un viaje por Postgres (que redondea a microsegundos) contra un <code class=\"mono\">DateTimeOffset</code> de .NET (ticks de 100ns). No era un bug de datos, era la aserción del test.</div>" },

    { cat: "reuso", date: "2026-09-22", nota: "Nota 14", hus: "HU99 reutiliza HU29/HU41/HU43",
      title: "HU99 no necesitó ni una línea de código de producción nueva",
      take: "Los 7 criterios ya estaban resueltos por decisiones anteriores, o se cerraron con 2 decisiones de seguridad consultadas explícitamente: qué mensaje mostrar y si invalidar sesiones activas ya.",
      body: "<p><b>Mensaje de error (criterio 3):</b> el escenario de HU99 pide el texto literal \"Su cuenta se encuentra deshabilitada...\", pero sus propias notas técnicas advierten que eso revela que la cuenta existe (enumeración de usuarios). Se decidió mantener el mensaje genérico de HU29 en vez del literal — test extendido en vez de duplicado, ahora compara 3 casos (inexistente / contraseña incorrecta / deshabilitado) con el mismo mensaje exacto.</p><p><b>Invalidación de sesión activa (criterio 6):</b> hoy solo <code class=\"mono\">VerificarAccesoAdministradorAsync</code> (HU43) revisa el estado del usuario en vivo; el gate básico <code class=\"mono\">VerificarAcceso</code> (HU1) no, y no tiene ningún llamador de producción todavía. Se decidió NO extenderlo ahora, para no arriesgar los 8 tests ya cerrados de HU1 sin necesidad real — queda documentado para cuando exista la primera operación no-administrativa protegida.</p><div class=\"callout\">Nuevo test que comparte una sola instancia de repositorio entre AutenticacionServicio y GestionUsuariosServicio (misma BD en producción) para probar que el bloqueo es inmediato, sin reiniciar el proceso (criterio 5).</div>" },

    { cat: "reuso", date: "2026-09-23", nota: "Nota 15", hus: "HU44 reutiliza el motor de HU74-77 (mismo patrón que HU41)",
      title: "HU44 — primera HU del módulo Documents — vuelve a conectar al motor existente",
      take: "El escenario alternativo de HU44 es el mismo texto genérico que ya resuelve el motor de auditoría transversal. Se reemplazó el stub Consentimiento por un servicio real, sin reinventar la resiliencia.",
      body: "<p>Nuevo: <code class=\"mono\">IConsentimientoServicio</code> / <code class=\"mono\">ConsentimientoServicio</code> — un único punto de entrada para registrar la aceptación o el rechazo del ciudadano sobre el aviso de tratamiento de datos. ID de ciudadano y tipo de decisión (\"ACEPTACIÓN\"/\"RECHAZO\") van en campos dedicados del evento de auditoría; canal y versión del aviso van en el campo de contexto, porque el contrato genérico no tiene campos propios para eso.</p><p>El escenario alternativo (\"reintentar hasta 3 veces... alerta crítica... log de contingencia local\") es el mismo texto calcado que ya aparece en otras HU del backlog — se resuelve con el motor de HU74-77, mismo razonamiento que HU41 (Nota 9): la alerta queda como <code class=\"mono\">LogWarning</code>, no <code class=\"mono\">LogCritical</code>, porque así quedó resuelto el motor compartido, consistente en todas las HU que lo usan.</p><div class=\"callout\">HU45 (documento ATDP tras la aceptación) extenderá este mismo servicio, no creará uno nuevo — mismo patrón de extensión que HU29→HU40→HU42.</div>" },

    { cat: "reuso", date: "2026-09-23", nota: "Nota 16", hus: "HU45 extiende ConsentimientoServicio (HU44)",
      title: "HU45 encontró y corrigió un bug real de precisión en el hash de auditoría",
      take: "El documento ATDP es una proyección del mismo registro de auditoría de HU44, sin TSA externa. Al probar honestamente \"verificar después\" (con una instancia nueva, no la que generó el documento), apareció un fallo intermitente real, no un test mal calibrado.",
      body: "<p>Nuevo: <code class=\"mono\">DocumentoAtdp</code> — sin tabla ni verificador propios; comparte Id y hash con el <code class=\"mono\">RegistroAuditoria</code> subyacente, así que \"verificarlo después\" es literalmente <code class=\"mono\">VerificarIntegridadAsync</code>. <code class=\"mono\">IAuditoriaService.RegistrarAsync</code> pasó de devolver <code class=\"mono\">Task</code> a <code class=\"mono\">Task&lt;ResultadoRegistroAuditoria&gt;</code> (Id + hash), cambio compatible con todos los llamadores existentes (HU41, HU96, HU97, HU44) porque ninguno capturaba el valor de retorno.</p><div class=\"callout\"><b>Bug real encontrado:</b> <code class=\"mono\">HashCanonico</code> calculaba el hash con precisión de 100ns, pero Postgres \"timestamp with time zone\" solo guarda microsegundos — un <code class=\"mono\">DateTimeOffset.UtcNow</code> con ticks por debajo del microsegundo producía un hash que ya NO coincidía tras el primer viaje de ida y vuelta por la base. Los tests existentes de HU74-77 nunca lo detectaron porque siempre releían con el mismo repositorio que escribió (identity map de EF, sin round-trip real). Corregido truncando la precisión antes de calcular el hash; verificado con 8 corridas adicionales del test que antes fallaba, todas en verde. No aplica ni PKI/X.509 ni una TSA externa (RFC 3161): se justifica documentando el mecanismo equivalente ya existente (registro append-only + hash verificable), mismo patrón que Nota 5.</div>" },

    { cat: "reuso", date: "2026-09-23", nota: "Nota 17", hus: "HU3 — primera HU de BiographicData; conecta el gate de HU12",
      title: "HU3: carga del archivo alfanumérico, todo o nada, con el gate de ruta de HU12 por fin en uso",
      take: "Validación completa del archivo antes de tocar la base, persistencia en una sola transacción por lotes, límite de 30 minutos que se hace cumplir y auditoría de cada carga. 100.000 registros en ~9,5 s contra Postgres real.",
      body: "<p>Nuevo: entidad <code class=\"mono\">CandidatoBiografico</code> (Pin como clave) + migración, <code class=\"mono\">ArchivoBiografico</code> (lectura y validación pura: nueve campos en orden exacto, coma sin espacios — JEC1; ExpFecha de 8 dígitos y fecha de calendario válida — JEC2), <code class=\"mono\">CargaBiograficaServicio</code> y la primera pantalla después del login. Cada carga, exitosa o fallida, queda en el motor de auditoría de HU74-77 con <code class=\"mono\">CancellationToken.None</code>, mismo criterio que HU41/HU97.</p><p><b>Decisiones con el usuario:</b> (1) un Pin repetido en el archivo o ya existente en la base rechaza el archivo completo — nunca se pisa un candidato en silencio; (2) HU3 es el primer cargue real, así que se conectó el gate de ruta de HU12: su contrato (<code class=\"mono\">IVerificacionRutaCargue</code> + excepción) pasó de Infrastructure a Core porque BiographicData solo referencia Core.</p><p><b>Limpieza en el cierre:</b> el helper de tests para variables de entorno estaba copiado en 6 clases → <code class=\"mono\">EntornoTemporal</code>; <code class=\"mono\">Program</code> armaba <code class=\"mono\">AuditoriaService</code> a mano en cada punto de composición → <code class=\"mono\">CrearAuditoria</code>; una copia suelta del nombre <code class=\"mono\">CERTBIOMETRICA_RUTA_BASE</code> en tests pasó a reusar la constante.</p><div class=\"callout\">HU4 y HU5 van a quedar en gran parte cubiertas: los criterios de HU3 ya exigen los mensajes descriptivos y sus notas técnicas piden los mismos campos de auditoría que HU5. Se verifican criterio por criterio al llegar.</div>" },

    { cat: "fix", date: "2026-09-23", nota: "Nota 18", hus: "HU29 C6, HU43 C5, HU12 C7 (en producción)",
      title: "Dos HU ya cerradas no se cumplían en la app real: sesión por inactividad y logs",
      take: "La sesión vencía a los 15 minutos aunque el administrador estuviera trabajando y no había forma de volver al login; y todos los loggers de producción eran NullLogger. Los tests pasaban porque probaban las piezas aisladas, no la app armada.",
      body: "<p><b>Sesión:</b> <code class=\"mono\">RegistrarActividad</code> existía y estaba testeado, pero nadie lo llamaba. Además extendía cualquier sesión, incluso una vencida: conectarlo tal cual habría permitido revivirla con un clic. Ahora no revive sesiones vencidas; cada tecla o clic extiende la sesión; un timer se programa para el instante exacto del vencimiento y, al cumplirse, la app vuelve al login con el aviso de cierre por inactividad. Cada ventana libera su DbContext al cerrarse.</p><p><b>Logs:</b> nuevo <code class=\"mono\">RegistroDeLogs</code> (Serilog): un archivo por día, timestamps UTC con el mismo patrón normativo de la auditoría (JC46), carpeta y nivel configurables, sin borrado automático. También quedan en el log los mensajes de arranque y cualquier error no controlado, que antes iban a una consola invisible en una app de ventanas. Verificado arrancando la app real.</p><div class=\"callout\"><b>Bug real encontrado por el test nuevo:</b> durante una carga (hasta 30 minutos sin tocar nada) la sesión se verificaba justo al vencer, cuando ya no se podía extender — una carga larga le habría cerrado la sesión al administrador a mitad de camino. Ahora, mientras hay una carga en curso, la verificación se adelanta a la mitad del plazo restante y la sesión se renueva siempre antes de vencer.</div>" },

    { cat: "fix", date: "2026-09-24", nota: "Nota 19", hus: "HU13 C6 (encontrado en la prueba manual de HU3)",
      title: "La app arrancaba con una ruta estándar que no existía",
      take: "En la prueba manual, la carga respondió \"Ruta estándar esperada: unidad:\". La verificación de que la ruta base exista y tenga permisos (HU13 C6) estaba escrita y testeada, pero nadie la llamaba: mismo patrón que RegistrarActividad.",
      body: "<p><b>Causa inmediata:</b> <code class=\"mono\">CERTBIOMETRICA_RUTA_BASE</code> no estaba en el <code class=\"mono\">.env</code>, así que en Windows se usó el default <code class=\"mono\">unidad:</code>, un marcador y no una carpeta real (el Word dice <code class=\"mono\">Unidad:\\RNEC</code>, pero no qué letra de disco). <b>Causa de fondo:</b> <code class=\"mono\">VerificarAccesible</code> no tenía llamador de producción, así que el error recién aparecía al cargar un archivo.</p><p><b>Corrección:</b> la app verifica la ruta al arrancar y, si no existe o no tiene permisos de lectura/escritura, se detiene con un mensaje que indica qué hacer (consola + log); también registra en el log la ruta en uso. Verificado arrancando con <code class=\"mono\">unidad:</code>. En Linux el default <code class=\"mono\">/home/RNEC</code> es una ruta completa y no requiere configuración, pero la carpeta debe pertenecer al usuario que ejecuta la app.</p><div class=\"callout\">Probado de punta a punta con la forma real de la ruta: <code class=\"mono\">C:\\RNEC</code> en Windows (todos los casos de carga, incluido el rechazo de subcarpetas y de la carpeta de desarrollo anterior) y <code class=\"mono\">/home/RNEC</code> en una VM Linux, donde apareció y se resolvió un caso de permisos.</div>" },

    { cat: "reuso", date: "2026-09-24", nota: "Nota 20", hus: "HU4 verificada contra HU3",
      title: "HU4: casi toda cubierta por HU3; lo nuevo es decir qué tipo de error tiene la fecha",
      take: "C1, C2 y la validación de C3/C4 ya existían. El escenario alternativo pide indicar \"el tipo de error de formato\": antes 20/03/2015 y 20230230 daban el mismo mensaje. Al cerrar apareció además un problema real en la infraestructura de tests.",
      body: "<p><b>Nuevo:</b> la validación de ExpFecha distingue un error de <b>formato</b> (no son exactamente 8 dígitos YYYYMMDD) de una fecha con formato correcto que <b>no existe en el calendario</b>, y nombra la parte que falla: mes fuera de 01-12, o día que no existe en ese mes y año, con la cantidad de días del mes (bisiestos incluidos: 20240229 es válido, 19000229 no). Tests explícitos de C6: con un archivo inválido no se llega ni a consultar la base. C7 probado con varios errores a la vez, cada uno con su línea.</p><p><b>Justificado:</b> cuando un registro tiene más o menos de nueve valores se informa la línea y la cantidad, pero no cuál campo falta — el formato no tiene nombres por columna (JEC1).</p><div class=\"callout\"><b>Hallazgo en el cierre:</b> una de 9 corridas falló en 24 tests de Postgres. No se dio por \"flaky\": el log del servidor mostró que la base de tests compartida se borró a la fuerza (<code class=\"mono\">DROP DATABASE ... WITH (FORCE)</code>, 46 conexiones cortadas) mientras la corrida la usaba. Todas las corridas usaban la misma base de nombre fijo, así que dos a la vez (terminal y Test Explorer de Visual Studio) se la borraban entre sí. Ahora cada corrida usa su propia base; verificado con dos suites en paralelo, ambas 322/322.</div>" }
  ];

  var doneList = [
    { code: "HU2", title: "Persistencia y resiliencia sin degradación", impl: "Infrastructure/ — persistencia, concurrencia, reintentos" },
    { code: "HU74", title: "Generación automática de registros de auditoría", impl: "AuditoriaService.RegistrarAsync" },
    { code: "HU75", title: "Campos obligatorios en cada registro de auditoría", impl: "RegistroAuditoria, FormatoFechaHora" },
    { code: "HU76", title: "Vinculación por identificador de transacción", impl: "AuditoriaRepository.ConsultarAsync(transaccionOrigen:)" },
    { code: "HU77", title: "Almacenamiento y consulta de auditoría", impl: "IAuditoriaRepository append-only + hash" },
    { code: "HU13", title: "Rutas estándar según sistema operativo", impl: "RutaEstandarProvider / RutaEstandarSelector; C6 verificado al arrancar", nota: "Nota 19" },
    { code: "HU12", title: "Verificación de ruta antes de cargue", impl: "VerificacionRutaCargue", nota: "Nota 3" },
    { code: "HU1", title: "Control de acceso a servicios internos", impl: "AutorizacionServicio.VerificarAcceso", nota: "Nota 5" },
    { code: "HU29", title: "Autenticación del administrador", impl: "AutenticacionServicio, LoginWindow/LoginViewModel; C6 corregido (inactividad)", nota: "Nota 18" },
    { code: "HU40", title: "Credenciales válidas e inválidas", impl: "extiende AutenticacionServicio", nota: "Nota 6" },
    { code: "HU42", title: "Política de seguridad en contraseña", impl: "PoliticaContrasena", nota: "Nota 7" },
    { code: "HU43", title: "Acceso a funcionalidades de administración", impl: "VerificarAccesoAdministradorAsync + bloqueo", nota: "Nota 8" },
    { code: "HU41", title: "Auditoría de intentos de autenticación", impl: "conecta con el motor de HU74-77", nota: "Nota 9" },
    { code: "HU96", title: "Historial de estados del usuario", impl: "GestionUsuariosServicio + bootstrap admin", nota: "Nota 10" },
    { code: "HU97", title: "Restricción absoluta de eliminación", impl: "EliminarAsync + trigger Postgres", nota: "Nota 11" },
    { code: "HU98", title: "Preservación de datos de usuarios deshabilitados", impl: "GestionUsuariosServicio.ObtenerAsync", nota: "Nota 13" },
    { code: "HU99", title: "Bloqueo de autenticación para deshabilitados", impl: "sin código nuevo -- 2 decisiones de seguridad", nota: "Nota 14" },
    { code: "HU44", title: "Auditoría de la decisión del ciudadano (ATDP)", impl: "ConsentimientoServicio", nota: "Nota 15" },
    { code: "HU45", title: "Documento ATDP con estampa cronológica", impl: "DocumentoAtdp + fix de precisión en HashCanonico", nota: "Nota 16" },
    { code: "HU3", title: "Carga de archivo alfanumérico", impl: "ArchivoBiografico + CargaBiograficaServicio, gate HU12", nota: "Nota 17" },
    { code: "HU4", title: "Validación estructural del archivo alfanumérico", impl: "tipo de error de ExpFecha: formato vs. calendario", nota: "Nota 20" }
  ];

  var backlog = [
    { name: "Carga alfanumérica inicial", items: [["HU5","Log de auditoría de la carga"],["HU80","Fecha/hora de inicio y fin"],["HU81","Auditoría de usuario e IP"],["HU82","Métricas de registros y NUIT"],["HU83","Templates encontrados en carpetas"],["HU84","Archivo cargue_inicial.txt"],["HU85","Log disponible para consulta"],["HU86","Trazabilidad operativa del cargue"]] },
    { name: "Consulta alfanumérica", items: [["HU30","Ingreso de criterios de búsqueda"],["HU31","Visualización de resultados"],["HU32","Notificación sin resultados"],["HU34","Integridad de datos mostrados"],["HU36","Registro de consultas"],["HU37","Persistencia en consulta.txt"],["HU38","Estructura uniforme del registro"],["HU39","Evidencia trazable para entrega"],["HU33","Exportación a PDF"]] },
    { name: "Templates biométricos", items: [["HU6","Estructura de carpetas de templates"],["HU7","Rango de numeración de dedos"],["HU8","Formatos soportados en importación"],["HU16","Recepción y validación de templates"],["HU18","Auditoría de recepción/procesamiento"]] },
    { name: "Descifrado y llaves", items: [["HU9","Registro seguro de llaves"],["HU10","Integridad de llaves como prerequisito"],["HU11","Motor de descifrado sobre 'appl'"],["HU14","Descifrado previo al cotejo 1 a 1"],["HU15","Validación/timeout del descifrado"],["HU17","Procesamiento para matching"]] },
    { name: "Cotejo biométrico", items: [["HU19","Umbral de calidad de decisión"],["HU21","Estructura APPL para el cotejo"],["HU22","Minucia de referencia desde CAND"],["HU23","Cotejo integral con evidencias"],["HU47","Validación biométrica contra NUIP"],["HU48","Despliegue de datos tras hit"],["HU24","Registro automático por cotejo"],["HU25","Integridad de logs del cotejo"],["HU46","Enmascaramiento visual de huella"]] },
    { name: "Evidencias JPG", items: [["HU20","Evidencias de ejecución en JPG"],["HU56","Captura JPG + log TXT al finalizar"],["HU87","Capturas JPEG para auditoría"]] },
    { name: "Trazabilidad por captor", items: [["HU51","Trazabilidad por cotejo"],["HU52","Archivo de trazabilidad"],["HU53","Protección contra modificación"],["HU54","Integridad de la trazabilidad"]] },
    { name: "SDK y certificación MINETS", items: [["HU26","Homologación NIST MINETS"],["HU27","Gestión documental de evidencia"],["HU28","Documentación de cambios de versión"]] },
    { name: "Empaquetado de evidencias ZIP", items: [["HU88","Recopilación automática de evidencias"],["HU89","Archivo ZIP de evidencias"],["HU90","Hash SHA-256 del paquete ZIP"],["HU91","Flujo completo de empaquetado"],["HU92","Consulta del hash SHA-256"],["HU93","Disponibilidad del ZIP y su hash"],["HU94","Empaquetado con registro de novedades"],["HU95","Hash SHA-256 obligatorio (= HU90)"]] },
    { name: "Rendimiento y concurrencia", items: [["HU35","Rendimiento sostenido"],["HU49","Tiempo de respuesta del cotejo"],["HU50","Validación mínima por sesión"],["HU55","100.000 cotejos appl/cand"],["HU57","Límite de tiempo del proceso"],["HU58","Cargue previo a cotejos"],["HU59","Disponibilidad de appl/cand"],["HU60","Flujo integral en ventana de tiempo"],["HU68","Carga de archivos de concurrencia"],["HU69","Validación estructural del archivo"],["HU70","Distribución entre terminales"],["HU71","Visualización de distribución"],["HU72","Notificación de errores"],["HU73","Auditoría de carga y distribución"],["HU64","Rendimiento bajo concurrencia real"],["HU65","5 conexiones simultáneas"],["HU66","Puntuación por conexión"],["HU67","Logs individuales y consolidado"],["HU78","Archivos de resultados del sistema"],["HU79","Bloqueo por inconsistencias"],["HU61","Tiempo total de desempeño"],["HU62","Puntaje por tabla de puntuación"],["HU63","Prueba integral de desempeño"]] }
  ];

  var catLabel = { orden: "Orden", dup: "Duplicado", adapt: "Adaptación", reuso: "Reuso", fix: "Corrección" };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function renderFindings() {
    var host = document.getElementById("findings");
    findings.forEach(function (f, i) {
      var d = el("details", "finding");
      d.setAttribute("data-cat", f.cat);
      var summary = el("summary");
      summary.innerHTML =
        '<span class="finding-num">' + String(i + 1).padStart(2, "0") + '</span>' +
        '<div class="finding-head">' +
          '<div class="finding-top-row">' +
            '<span class="badge ' + f.cat + '">' + catLabel[f.cat] + '</span>' +
            '<span class="finding-date">' + f.date + ' · ' + f.nota + '</span>' +
            '<span class="finding-hus">' + f.hus + '</span>' +
          '</div>' +
          '<div class="finding-title">' + f.title + '</div>' +
          '<div class="finding-takeaway">' + f.take + '</div>' +
        '</div>' +
        '<span class="finding-chevron">▸</span>';
      var body = el("div", "finding-body", f.body);
      d.appendChild(summary);
      d.appendChild(body);
      host.appendChild(d);
    });
  }

  function renderDone() {
    var host = document.getElementById("doneList");
    doneList.forEach(function (h) {
      var row = el("div", "done-row");
      row.innerHTML =
        '<span class="check-icon">✓</span>' +
        '<div><div class="hu-title"><span class="hu-code">' + h.code + '</span> — ' + h.title + '</div>' +
        '<div class="hu-impl">' + h.impl + '</div></div>' +
        '<span class="hu-nota">' + (h.nota || "") + '</span>';
      host.appendChild(row);
    });
  }

  function renderBacklog() {
    var host = document.getElementById("backlog");
    backlog.forEach(function (group, gi) {
      var d = el("details", "phase");
      if (gi === 0) d.open = true;
      var summary = el("summary", null,
        '<span>' + group.name + '</span><span class="count">' + group.items.length + ' HU</span>');
      var itemsWrap = el("div", "phase-items");
      group.items.forEach(function (it) {
        var row = el("div", "phase-item", '<span class="hu-code">' + it[0] + '</span><span>' + it[1] + '</span>');
        itemsWrap.appendChild(row);
      });
      d.appendChild(summary);
      d.appendChild(itemsWrap);
      host.appendChild(d);
    });
  }

  function setupFilter() {
    var chips = document.querySelectorAll(".chip[data-cat]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.removeAttribute("data-active"); });
        chip.setAttribute("data-active", "true");
        var cat = chip.getAttribute("data-cat");
        document.querySelectorAll(".finding").forEach(function (f) {
          f.hidden = !(cat === "all" || f.getAttribute("data-cat") === cat);
        });
      });
    });
  }

  function setupToggleAll() {
    var btn = document.getElementById("toggleAll");
    var expanded = false;
    btn.addEventListener("click", function () {
      expanded = !expanded;
      document.querySelectorAll(".finding").forEach(function (f) { f.open = expanded; });
      btn.textContent = expanded ? "Contraer todos" : "Expandir todos";
    });
  }

  renderFindings();
  renderDone();
  renderBacklog();
  setupFilter();
  setupToggleAll();
})();
