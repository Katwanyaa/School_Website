const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

// Default avatars (placed in /images/avata)
const DEFAULT_MALE = '/images/avata/male.png';
const DEFAULT_FEMALE = '/images/avata/female.png';

// Simple gender heuristic by first name
const FEMALE_NAMES = new Set([
  'Beatrice','Francisca','Madam','Evelyn','Eunice','Zipporah','Beatrice','Linda','Rosemary','Alicia','Wendy'
]);

// Map subject to department name (best-effort)
function pickDepartment(subjects) {
  const s = subjects.toLowerCase();
  if (s.includes('kiswahili') || s.includes('english') || s.includes('literature')) return 'Languages';
  if (s.includes('math') || s.includes('mathematics')) return 'Mathematics';
  if (s.includes('physics') || s.includes('chemistry') || s.includes('biology') || s.includes('agriculture')) return 'Applied Sciences';
  if (s.includes('history') || s.includes('cre') || s.includes('geography')) return 'Humanities';
  // fallback
  return 'Humanities';
}

// Provided teacher list
const TEACHERS = [
  ['David Muange', 'English / Literature'],
  ['Beatrice A. Olum', 'Business Studies / Mathematics'],
  ['Paul N. Mwanzia', 'Physics / Mathematics'],
  ['Frazier K. Kioko', 'Biology / Geography'],
  ['Ben M. Njagi', 'English / Literature'],
  ['Francisca Muthoka', 'Business Studies / Mathematics'],
  ['Dennis K. Katela', 'Chemistry / Biology'],
  ['Madam Caren', 'Kiswahili / Geography'],
  ['Silas G. Thuranira', 'Biology / Agriculture'],
  ['Evelyn M. Nzwili', 'English / Literature'],
  ['Madan Kawira', 'Mathematics / Physics'],
  ['Mr. Kyengo', 'Mathematics / Physics'],
  ['Hillary Booker', 'English / Literature'],
  ['Eunice M. Musau', 'Biology / Agriculture'],
  ['Francis Ngovi', 'Biology / Agriculture'],
  ['Boniface Mutisya', 'Chemistry / Mathematics'],
  ['Stephen M. Makau', 'Chemistry / Mathematics'],
  ['Hillary B. Ochieng', 'Kiswahili / Geography'],
  ['Tom N. Mututu', 'Kiswahili / Geography'],
  ['Zipporah M. Mulungwa', 'English / Literature'],
  ['Robi J. William', 'History / CRE'],
  ['Beatrice M. Kanyia', 'History / CRE'],
  ['Linda Makena', 'Physics / Mathematics'],
  ['Rosemary Kola', 'CRE / Geography'],
  ['Alicia M. Kiilu', 'CRE / History'],
  ['Wendy Kananu', 'English / Literature'],
  ['Nzioka Nzomo', 'Mathematics / Physics'],
  ['Mr. Oduor', 'Kiswahili / Geography'],
  ['Mr. Mutie', 'History / CRE']
];

// Leadership / HOD mapping (best-effort from user's instructions)
// Note: Guidance & Counselling set to Evelyn M. Nzwili per user correction
const HODS = {
  'Sports': 'Frazier K. Kioko',
  'Humanities': 'Hillary Booker',
  'Mathematics & Sciences': 'Boniface Mutisya',
  'Applied Sciences': 'Francis Ngovi',
  'Languages': 'Mr. Mutie',
  'Guidance and Counselling': 'Evelyn M. Nzwili'
};

async function upsertStaff(staff) {
  const existing = await prisma.staff.findFirst({ where: { name: staff.name } });
  if (existing) {
    return prisma.staff.update({ where: { id: existing.id }, data: staff });
  }
  return prisma.staff.create({ data: staff });
}

async function main() {
  console.log('Seeding staff records...');

  // Ensure departments exist and build a lookup
  const departments = await prisma.staffDepartment.findMany();
  const deptByName = {};
  departments.forEach(d => (deptByName[d.name] = d));

  for (const [rawName, subjects] of TEACHERS) {
    let name = rawName.trim();

    // Ensure prefix
    if (!/^Mr\.? |^Mrs\.? |^Madam /i.test(name)) {
      const first = name.split(' ')[0].replace(/[^A-Za-z]/g, '');
      if (FEMALE_NAMES.has(first)) name = `Madam ${name}`;
      else name = `Mr ${name}`;
    }

    const deptName = pickDepartment(subjects);
    const department = deptByName[deptName];

    const isHod = Object.values(HODS).includes(rawName) || Object.values(HODS).includes(name.replace(/^Mr\s+/,'').replace(/^Madam\s+/,''));

    const staffData = {
      name,
      role: isHod ? 'HOD' : 'Teacher',
      position: isHod ? `HOD - ${deptName}` : 'Teacher',
      department: deptName,
      staffType: isHod ? 'Leadership' : 'Teaching',
      subjectOffered: subjects,
      email: null,
      phone: null,
      bio: null,
      quote: null,
      image: FEMALE_NAMES.has(name.split(' ')[1]) || /Madam/i.test(name) ? DEFAULT_FEMALE : DEFAULT_MALE,
      joinDate: new Date().toISOString().split('T')[0],
    };

    if (name === 'Mr Hillary Booker') {
      staffData.email = 'hillary.booker@katwanyaa.ac.ke';
      staffData.phone = '+254 700 111 222';
      staffData.bio = 'Head of Department for Humanities with a strong commitment to student excellence, literacy development, and mentorship.';
      staffData.quote = 'Education is the gateway to confident young leaders.';
    }

    // Link department id if found
    if (department) {
      staffData.staffDepartmentId = department.id;
    }

    const rec = await upsertStaff(staffData);
    console.log(`Upserted staff: ${rec.name} (${rec.position})`);
  }

  // Sync staffCount for each department
  for (const d of departments) {
    const count = await prisma.staff.count({ where: { staffDepartmentId: d.id } });
    await prisma.staffDepartment.update({ where: { id: d.id }, data: { staffCount: count } });
    console.log(`Updated ${d.name} count => ${count}`);
  }

  console.log('Staff seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
