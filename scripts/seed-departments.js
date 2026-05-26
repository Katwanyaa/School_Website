const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEPARTMENTS = [
  {
    name: 'Mathematics',
    category: 'TEACHING',
    description: 'Mathematics department covering algebra, geometry, calculus, and statistical reasoning.',
    headName: 'Mathematics Department Head',
    assistantHeadName: null,
    staffCount: 0,
    image: null,
    displayOrder: 1,
    isActive: true,
    extra: { area: 'Mathematics' },
  },
  {
    name: 'Applied Sciences',
    category: 'TEACHING',
    description: 'Applied Sciences department supporting science, technology, engineering, and practical labs.',
    headName: 'Applied Sciences Department Head',
    assistantHeadName: null,
    staffCount: 0,
    image: null,
    displayOrder: 2,
    isActive: true,
    extra: { area: 'Applied Sciences' },
  },
  {
    name: 'Guidance and Counselling',
    category: 'SUPPORT',
    description: 'Guidance and counselling department providing student wellbeing, career guidance, and mentorship.',
    headName: 'Guidance and Counselling Lead',
    assistantHeadName: null,
    staffCount: 0,
    image: null,
    displayOrder: 3,
    isActive: true,
    extra: { area: 'Student Support' },
  },
  {
    name: 'Humanities',
    category: 'TEACHING',
    description: 'Humanities department teaching languages, history, geography, and social studies.',
    headName: 'Humanities Department Head',
    assistantHeadName: null,
    staffCount: 0,
    image: null,
    displayOrder: 4,
    isActive: true,
    extra: { area: 'Humanities' },
  },
  {
    name: 'Sports',
    category: 'SUPPORT',
    description: 'Sports department coordinating athletics, games, and physical education programs.',
    headName: 'Sports Department Head',
    assistantHeadName: null,
    staffCount: 0,
    image: null,
    displayOrder: 5,
    isActive: true,
    extra: { area: 'Sports' },
  },
  {
    name: 'Languages',
    category: 'TEACHING',
    description: 'Languages department teaching English, Kiswahili, and additional language studies.',
    headName: 'Languages Department Head',
    assistantHeadName: null,
    staffCount: 0,
    image: null,
    displayOrder: 6,
    isActive: true,
    extra: { area: 'Languages' },
  },
];

async function upsertDepartment(department) {
  const existing = await prisma.staffDepartment.findFirst({
    where: { name: department.name },
  });

  if (existing) {
    return prisma.staffDepartment.update({
      where: { id: existing.id },
      data: {
        category: department.category,
        description: department.description,
        headName: department.headName,
        assistantHeadName: department.assistantHeadName,
        staffCount: department.staffCount,
        image: department.image,
        displayOrder: department.displayOrder,
        isActive: department.isActive,
        extra: department.extra,
      },
    });
  }

  return prisma.staffDepartment.create({
    data: department,
  });
}

async function main() {
  console.log('Seeding Katwanyaa staff departments...');

  for (const department of DEPARTMENTS) {
    const record = await upsertDepartment(department);
    console.log(`Upserted department: ${record.name}`);
  }

  console.log('Katwanyaa departments seed completed.');
}

main()
  .catch((error) => {
    console.error('Error seeding departments:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
