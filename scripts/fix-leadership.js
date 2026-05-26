const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertDepartment(name, options = {}) {
  let dept = await prisma.staffDepartment.findFirst({ where: { name } });
  if (!dept) {
    dept = await prisma.staffDepartment.create({ data: { name, category: options.category || 'academic', headName: options.headName || null } });
    console.log(`Created department: ${name} (id=${dept.id})`);
  }
  return dept;
}

async function main() {
  console.log('Fixing leadership records...');

  // Ensure Administration department exists
  const adminDept = await upsertDepartment('Administration', { category: 'administration', headName: 'School Principal' });
  const guidanceDept = await upsertDepartment('Guidance and Counselling', { category: 'support', headName: 'Guidance Lead' });
  const sportsDept = await upsertDepartment('Sports', { category: 'activities', headName: 'Sports Head' });

  // Set Principal: David Muange
  const principal = await prisma.staff.findFirst({ where: { name: { contains: 'David Muange' } } });
  if (principal) {
    await prisma.staff.update({ where: { id: principal.id }, data: { position: 'Principal', role: 'Principal', staffType: 'Leadership', department: 'Administration', staffDepartmentId: adminDept.id } });
    console.log(`Set Principal: ${principal.name} (id=${principal.id}) -> Administration`);
  } else {
    console.log('Principal (David Muange) not found');
  }

  // Link deputies to Administration
  const deputies = await prisma.staff.findMany({ where: { role: { contains: 'Deputy' } } });
  for (const d of deputies) {
    await prisma.staff.update({ where: { id: d.id }, data: { staffType: 'Leadership', staffDepartmentId: adminDept.id, department: 'Administration' } });
    console.log(`Linked deputy: ${d.name} -> Administration`);
  }

  // Ensure Evelyn is in Guidance
  const evelyn = await prisma.staff.findFirst({ where: { name: { contains: 'Evelyn M. Nzwili' } } });
  if (evelyn) {
    await prisma.staff.update({ where: { id: evelyn.id }, data: { staffDepartmentId: guidanceDept.id, department: 'Guidance and Counselling', position: 'HOD - Guidance', staffType: 'Leadership' } });
    console.log(`Linked Evelyn to Guidance and set HOD (id=${evelyn.id})`);
  } else {
    console.log('Evelyn M. Nzwili not found');
  }

  // Link Sports staff to Sports department where department field equals 'Sports'
  const sportsStaff = await prisma.staff.findMany({ where: { department: { contains: 'Sports' } } });
  for (const s of sportsStaff) {
    await prisma.staff.update({ where: { id: s.id }, data: { staffDepartmentId: sportsDept.id } });
    console.log(`Linked sports staff: ${s.name} -> Sports (id=${s.id})`);
  }

  // Sync counts
  const depts = await prisma.staffDepartment.findMany();
  for (const d of depts) {
    const count = await prisma.staff.count({ where: { staffDepartmentId: d.id } });
    await prisma.staffDepartment.update({ where: { id: d.id }, data: { staffCount: count } });
    console.log(`Updated ${d.name} count => ${count}`);
  }

  console.log('Leadership fix complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
