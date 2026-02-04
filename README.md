URL:
Repositorio: https://github.com/Adalberto-JAB/turno-medico
Usuario administrador:
Usuario médico:

El objetivo de este proyecto es generar un orden administrativo para clínicas o centros médicos, solucionando problemas como: turnos duplicados, historias clínicas en papel que se pierden y falta de control sobre la agenda médica; desarrollando una Plataforma Integral de Gestión Médica. Pretendo que no sea solo un turnero, si no un sistema que conecta a Pacientes, Médicos y Administradores en un flujo de trabajo 100% digital.
A nivel técnico, la aplicación es robusta y moderna. Utilizamos Next.js 15 con App Router para el frontend y backend. La base de datos es PostgreSQL gestionada con Prisma ORM, **el sistema es hibrido ya que traja con apis y server actions**. Para la seguridad, se implementa un sistema de autenticación basado en Roles (RBAC) y Middleware de protección.

## El Flujo del Paciente
Al ingresar, el sistema le permite iniciar sesión o crear una nueva cuenta y una vez iniciada la sesión puede reservar una cita. 
En este caso un desafío interesante fue crear el Motor de Disponibilidad. El sistema calcula en tiempo real qué horarios están libres basándose en la configuración del médico y los turnos ya ocupados.
Voy a reservar para el Martes a las 10:00. Al confirmar, el turno queda en estado PENDIENTE, esperando aprobación."

## El Rol del Administrador
En el panel de Gestión de Turnos, el sistema alerta que turnos están pendientes. El administrador tiene la potestad de confirmar la cita o cancelarla. Al confirmarla, el turno pasa a ser oficial y se bloquea definitivamente en la agenda del médico.
También desde aquí gestiona el Staff. Una funcionalidad clave es la Identidad Híbrida: puedo tener médicos que son usuarios del sistema (digitales) y otros que no (analógicos), y administrar sus horarios laborales con este gestor de agenda flexible.

## La Experiencia del Médico
Finalmente, entramos como el Doctor.
En mi inicio veo 'Pacientes de Hoy'. Aquí está el turno que acaba de confirmar el administrador. Cuando llega el paciente, el medico hace clic en Atender y se muestra la pantalla de consulta con la línea de tiempo a la izquierda.
Esta es la Sala de Consulta Digital. A la izquierda, tengo acceso inmediato al Historial Clínico completo del paciente. Puedo ver diagnósticos previos y tratamientos de otros colegas. Esto mejora la calidad de la atención médica.
Luego el médico llena el formulario (Diagnóstico: "Gripe", Receta: "Té con miel…") y al guardar la evolución, el sistema registra la ficha médica de forma permanente y marca el turno como COMPLETADO automáticamente, limpiando la lista de pendientes."

## Historiales
Si el médico necesita consultar sobre un paciente, tiene accedo al buscador global de historiales, que funciona como un archivo digital indexado."


## NOTA IMPORTANTE 
El sistema funciona en todo su aspecto basico, faltan pulir detalles de UX y UI, además a medida que iba generando el código me daba cuenta de detalles o funcionalidades que podrían ser mejoradas o agregadas, por lo que aún queda mucha tarea por hacer, pero como dije, el sistema es funcional y seguro.
