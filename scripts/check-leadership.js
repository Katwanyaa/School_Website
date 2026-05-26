const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Listing staff records that look like leadership...');

  const leaders = await prisma.staff.findMany({
    where: {
      OR: [
        { staffType: { contains: 'Leadership' } },
        { role: { contains: 'principal' } },
        { position: { contains: 'principal' } },
        { position: { contains: 'HOD' } },
        { role: { contains: 'deputy' } },
        { role: { contains: 'senior' } },
      ]
    },
    orderBy: { id: 'asc' }
  });

  if (!leaders.length) {
    console.log('No leadership-like staff found');
  } else {
    leaders.forEach(s => {
      console.log(`- id=${s.id} name="${s.name}" role="${s.role}" position="${s.position}" dept="${s.department}" staffDepartmentId=${s.staffDepartmentId} staffType=${s.staffType}`);
    });
  }

  console.log('\nListing staff departments and their heads:');
  const depts = await prisma.staffDepartment.findMany({ orderBy: { id: 'asc' } });
  depts.forEach(d => {
    console.log(`- id=${d.id} name="${d.name}" headName="${d.headName || ''}" staffCount=${d.staffCount}`);
  });

  // Check for principal specifically
  console.log('\nSearching for "principal" in staff records...');
  const principals = await prisma.staff.findMany({ where: { OR: [{ role: { contains: 'principal' } }, { position: { contains: 'principal' } }, { name: { contains: 'David Muange' } }] } });
  if (!principals.length) console.log('No principal record found matching criteria.');
  else principals.forEach(p => console.log(`PRINCIPAL: id=${p.id} name="${p.name}" position="${p.position}" dept="${p.department}"`));

}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
