import { Role, Status } from '@/generated/prisma/client';
import { prisma } from '../src/lib/prisma';
import { fakerES as faker } from '@faker-js/faker';

// Lista de Especialidades
const SPECIALTIES_DATA = [
  'Cardiología', 'Clínica Médica', 'Dermatología', 'Ginecología', 
  'Neurología', 'Oftalmología', 'Pediatría', 'Traumatología', 
  'Psiquiatría', 'Gastroenterología'
];

async function main() {
  console.log('🌱 Iniciando Seed...');

  // 1. LIMPIEZA TOTAL
  // El orden es importante para no romper Foreign Keys
  await prisma.doctorSchedule.deleteMany().catch(() => {});
  await prisma.doctorAbsence.deleteMany().catch(() => {});
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Base de datos limpia.');

  // 2. CREAR ESPECIALIDADES
  console.log('🏥 Creando especialidades...');
  await prisma.specialty.createMany({
    data: SPECIALTIES_DATA.map(name => ({ name }))
  });
  const allSpecialties = await prisma.specialty.findMany();

  // 3. CREAR MÉDICOS CON LOGIN
  console.log('👨‍⚕️ Creando médicos con usuario...');
  const allDoctors = [];

  for (let i = 0; i < 5; i++) { 
    const randomSpecialty = faker.helpers.arrayElement(allSpecialties);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `medico${i + 1}@medturnos.com`; // Emails: medico1@medturnos.com, etc.

    // A. Crear Usuario (Login)
    const user = await prisma.user.create({
      data: {
        name: `Dr. ${firstName} ${lastName}`,
        email: email,
        emailVerified: true,
        role: Role.DOCTOR, // 👈 Rol Clave
        image: faker.image.avatar(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // B. Crear Perfil Médico (Datos Profesionales) vinculado al Usuario
    const doctor = await prisma.doctor.create({
      data: {
        name: user.name!, 
        specialtyId: randomSpecialty.id,
        licenseNumber: faker.string.numeric(5),
        userId: user.id, // 🔗 EL VÍNCULO MÁGICO
        
        // Agenda Lunes a Viernes 09-13 (Para pruebas rápidas)
        schedules: {
          create: [1, 2, 3, 4, 5].map(day => ({
             dayOfWeek: day,
             startTime: "09:00",
             endTime: "13:00"
          }))
        }
      }
    });
    
    allDoctors.push(doctor);
    console.log(`   ✅ Usuario: ${email} -> Dr. ${randomSpecialty.name}`);
  }

  // 4. CREAR ADMIN Y PACIENTES
  console.log('👥 Creando Admin y Pacientes...');
  
  // Admin
  await prisma.user.create({
    data: {
      name: 'Admin Principal',
      email: 'admin@medturnos.com',
      emailVerified: true,
      role: Role.ADMIN,
      image: faker.image.avatar(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  // Pacientes
  const patientIds = [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        emailVerified: true,
        role: Role.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    patientIds.push(user.id);
  }

  // 5. GENERAR TURNOS DE PRUEBA
  for (const patientId of patientIds) {
    const doctor = faker.helpers.arrayElement(allDoctors);
    await prisma.appointment.create({
      data: {
        userId: patientId,
        doctorId: doctor.id,
        date: faker.date.soon({ days: 15 }),
        status: Status.PENDING
      }
    });
  }

  console.log('🚀 Seed finalizado.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });