const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const PUBLIC_IMAGE = (relativePath) => {
  const filePath = path.join(process.cwd(), 'public', relativePath.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: public image not found at ${filePath}. Using relative DB path anyway.`);
  }
  return relativePath;
};

const HUB_ITEMS = [
  {
    type: 'CLUB',
    title: 'Katwanyaa Chess Club',
    shortDescription: 'A growing student club promoting strategy, critical thinking, and competitive chess.',
    description: 'The Katwanyaa Chess Club brings together learners across all forms to develop strategic thinking, sportsmanship, and concentration through regular practice and local competitions.',
    image: PUBLIC_IMAGE('/hero/katz1.jpeg'),
    location: 'Katwanyaa Campus',
    established: '2017',
    website: 'https://www.facebook.com/groups/414008468611340/',
    socialMedia: {
      facebook: 'https://www.facebook.com/groups/414008468611340/',
      instagram: 'https://www.instagram.com/katwanyaahigh',
    },
    contactName: 'Club Coordinator',
    contactPhone: '0710 894 145',
    contactEmail: 'katzict@gmail.com',
    details: [
      { title: 'Membership', content: 'Open to all students across forms 1-4' },
      { title: 'Training', content: 'Weekly strategy sessions and local competition preparation' },
      { title: 'Achievements', content: 'County championship qualifiers and national junior participation' },
    ],
    isActive: true,
    displayOrder: 1,
    images: [
      { url: PUBLIC_IMAGE('/hero/katz1.jpeg'), altText: 'Chess Club practice', caption: 'Students learning strategy in the chess club' },
      { url: PUBLIC_IMAGE('/hero/katz2.jpeg'), altText: 'Chess board', caption: 'Competitive chess environment' },
    ],
  },
  {
    type: 'SOCIETY',
    title: 'Katwanyaa Drama Society',
    shortDescription: 'A creative society for acting, stage design, and cultural presentations.',
    description: 'The Drama Society inspires students to explore theatre, storytelling, and performance arts through annual productions, festivals, and leadership opportunities on stage.',
    image: PUBLIC_IMAGE('/hero/katz3.jpeg'),
    location: 'Drama Studio',
    established: '2019',
    website: 'https://www.facebook.com/groups/414008468611340/',
    socialMedia: {
      facebook: 'https://www.facebook.com/groups/414008468611340/',
      instagram: 'https://www.instagram.com/katwanyaahigh',
    },
    contactName: 'Drama Society Lead',
    contactPhone: '0710 894 145',
    contactEmail: 'katzict@gmail.com',
    details: [
      { title: 'Focus', content: 'Acting, script writing, stagecraft, and event production' },
      { title: 'Performances', content: 'School musicals, county drama festivals, and community showcases' },
      { title: 'Skills', content: 'Confidence, communication, creativity, and teamwork' },
    ],
    isActive: true,
    displayOrder: 2,
    images: [
      { url: PUBLIC_IMAGE('/hero/katz4.jpeg'), altText: 'Drama rehearsal', caption: 'Students rehearsing a school production' },
    ],
  },
  {
    type: 'STUDENT_COUNCIL',
    title: 'Katwanyaa Student Council',
    shortDescription: 'Student leadership body representing learners and driving campus initiatives.',
    description: 'The Student Council is elected by peers to champion student voice, coordinate school events, and support leadership development across the Katwanyaa community.',
    image: PUBLIC_IMAGE('/hero/student.jpeg'),
    location: 'Main Hall',
    established: '2015',
    website: 'https://www.facebook.com/groups/414008468611340/',
    socialMedia: {
      facebook: 'https://www.facebook.com/groups/414008468611340/',
      instagram: 'https://www.instagram.com/katwanyaahigh',
      twitter: 'https://twitter.com/katwanyaahigh',
    },
    contactName: 'Student Council Advisor',
    contactPhone: '0710 894 145',
    contactEmail: 'katzict@gmail.com',
    details: [
      { title: 'Mandate', content: 'Advocate for students, plan school events, and support wellbeing' },
      { title: 'Projects', content: 'Community service, mentorship, and student leadership training' },
      { title: 'Values', content: 'Respect, integrity, and inclusive school culture' },
    ],
    isActive: true,
    displayOrder: 3,
    images: [
      { url: PUBLIC_IMAGE('/hero/katz5.jpeg'), altText: 'Student Council meeting', caption: 'Student leaders collaborating on school initiatives' },
    ],
  },
  {
    type: 'COMPUTER_LAB',
    title: 'ICT & Computer Lab',
    shortDescription: 'A modern computer lab supporting digital learning and coding skills.',
    description: 'The ICT & Computer Lab provides students access to computers, internet research, and digital skills training for academic projects and career readiness.',
    image: PUBLIC_IMAGE('/hero/katz6.jpeg'),
    location: 'Technology Block',
    established: '2018',
    website: 'https://www.facebook.com/groups/414008468611340/',
    socialMedia: {
      facebook: 'https://www.facebook.com/groups/414008468611340/',
      instagram: 'https://www.instagram.com/katwanyaahigh',
    },
    contactName: 'ICT Coordinator',
    contactPhone: '0710 894 145',
    contactEmail: 'katzict@gmail.com',
    details: [
      { title: 'Facilities', content: 'Desktop computers, projectors, and fast internet access' },
      { title: 'Programs', content: 'MS Office, coding, web design, and digital research' },
      { title: 'Support', content: 'Teacher-led technology lessons and exam preparation' },
    ],
    isActive: true,
    displayOrder: 4,
    images: [
      { url: PUBLIC_IMAGE('/hero/katz7.jpeg'), altText: 'Computer lab', caption: 'Students learning digital skills in the computer lab' },
    ],
  },
  {
    type: 'BOARDING',
    title: 'Boarding Life',
    shortDescription: 'Comfortable and safe boarding facilities for day and boarding students.',
    description: 'Our boarding wing offers secure accommodation, nutritious meals, and supportive supervision for students who reside on campus during term time.',
    image: PUBLIC_IMAGE('/hero/katz8.jpeg'),
    location: 'Boarding Complex',
    established: '2016',
    website: 'https://www.facebook.com/groups/414008468611340/',
    socialMedia: {
      facebook: 'https://www.facebook.com/groups/414008468611340/',
      instagram: 'https://www.instagram.com/katwanyaahigh',
    },
    contactName: 'Boarding Master',
    contactPhone: '0710 894 145',
    contactEmail: 'katzict@gmail.com',
    details: [
      { title: 'Amenities', content: 'Dormitories, dining hall, study areas, and recreation spaces' },
      { title: 'Care', content: '24/7 supervision, medical support, and counselling services' },
      { title: 'Life Skills', content: 'Routine building, leadership, and community responsibility' },
    ],
    isActive: true,
    displayOrder: 5,
    images: [
      { url: PUBLIC_IMAGE('/hero/katz9.jpeg'), altText: 'Boarding facilities', caption: 'Comfortable boarding and student support' },
    ],
  },
  {
    type: 'SECURITY',
    title: 'Campus Security & Safety',
    shortDescription: 'A secure campus environment with trained security staff and safety systems.',
    description: 'Campus Security ensures the safety of all learners with reliable patrols, visitor screening, and emergency readiness across the school grounds.',
    image: PUBLIC_IMAGE('/hero/sports.jpeg'),
    location: 'Security Office',
    established: '2014',
    website: 'https://www.facebook.com/groups/414008468611340/',
    socialMedia: {
      facebook: 'https://www.facebook.com/groups/414008468611340/',
      instagram: 'https://www.instagram.com/katwanyaahigh',
    },
    contactName: 'Head of Security',
    contactPhone: '0710 894 145',
    contactEmail: 'katzict@gmail.com',
    details: [
      { title: 'Safety Focus', content: 'Secure campus gates, CCTV monitoring, and student patrols' },
      { title: 'Emergency Response', content: 'Fire drills, health support, and rapid communication systems' },
      { title: 'Community', content: 'Protecting learners while enabling a peaceful study environment' },
    ],
    isActive: true,
    displayOrder: 6,
    images: [
      { url: PUBLIC_IMAGE('/hero/katz10.jpeg'), altText: 'Security team', caption: 'Safe and secure school community' },
    ],
  },
];

const ACHIEVEMENTS = [
  {
    title: 'KCSE Academic Excellence 2024',
    description: 'Katwanyaa Senior School achieved outstanding KCSE results, ranking among the top performers in the county.',
    category: 'Academic',
    year: 2024,
    images: [
      { url: PUBLIC_IMAGE('/hero/katz.jpeg'), public_id: 'local-kcse-2024', caption: 'KCSE top performers' },
    ],
    featured: true,
    displayOrder: 1,
    awardingBody: 'National Examination Council',
    recipients: ['Form 4 class of 2024', 'Top science students', 'Best overall performers'],
    achievedDate: new Date('2024-12-15'),
  },
  {
    title: 'County Football Champions 2024',
    description: 'Our school football team won the county championship after an impressive season of teamwork and determination.',
    category: 'Sports',
    year: 2024,
    images: [
      { url: PUBLIC_IMAGE('/hero/sports.jpeg'), public_id: 'local-football-2024', caption: 'Football champions celebrating' },
    ],
    featured: true,
    displayOrder: 2,
    awardingBody: 'Kitui County Sports Association',
    recipients: ['Boys football team', 'Coaching staff'],
    achievedDate: new Date('2024-10-05'),
  },
  {
    title: 'Drama Festival Winners 2023',
    description: 'The Drama Society won the school drama festival with a powerful performance celebrating Kenyan culture and student creativity.',
    category: 'Arts',
    year: 2023,
    images: [
      { url: PUBLIC_IMAGE('/hero/katz4.jpeg'), public_id: 'local-drama-2023', caption: 'Drama society performance' },
    ],
    featured: false,
    displayOrder: 3,
    awardingBody: 'County Arts Council',
    recipients: ['Drama Society cast', 'Directing team'],
    achievedDate: new Date('2023-08-22'),
  },
  {
    title: 'Leadership & Community Service Award 2024',
    description: 'The Student Council received recognition for outstanding leadership and community service projects during the school year.',
    category: 'Leadership',
    year: 2024,
    images: [
      { url: PUBLIC_IMAGE('/hero/katz5.jpeg'), public_id: 'local-leadership-2024', caption: 'Student council community service' },
    ],
    featured: false,
    displayOrder: 4,
    awardingBody: 'Educational Leadership Forum',
    recipients: ['Student Council', 'Mentorship team'],
    achievedDate: new Date('2024-11-10'),
  },
];

const SCHOOL_STATS = {
  meanScore: 8.74,
  lastYearMean: 8.56,
  targetMean: 9.20,
  slogan: 'Excellence through character, competence, and compassion.',
  sloganDescription: 'Katwanyaa Senior School empowers learners to perform strongly in exams while building leadership and community impact.',
  sloganAuthor: 'Katwanyaa Senior School Leadership',
};

async function upsertHubItem(item) {
  const existing = await prisma.schoolHubItem.findFirst({ where: { title: item.title } });
  const imagesCreate = item.images.map((image, index) => ({
    url: image.url,
    publicId: image.public_id || null,
    altText: image.altText || item.title,
    caption: image.caption || null,
    displayOrder: index,
  }));

  if (existing) {
    return prisma.schoolHubItem.update({
      where: { id: existing.id },
      data: {
        type: item.type,
        shortDescription: item.shortDescription,
        description: item.description,
        image: item.image,
        location: item.location,
        established: item.established,
        website: item.website,
        socialMedia: item.socialMedia,
        contactName: item.contactName,
        contactPhone: item.contactPhone,
        contactEmail: item.contactEmail,
        details: item.details,
        isActive: item.isActive,
        displayOrder: item.displayOrder,
        images: {
          deleteMany: {},
          create: imagesCreate,
        },
      },
      include: { images: true },
    });
  }

  return prisma.schoolHubItem.create({
    data: {
      type: item.type,
      title: item.title,
      shortDescription: item.shortDescription,
      description: item.description,
      image: item.image,
      location: item.location,
      established: item.established,
      website: item.website,
      socialMedia: item.socialMedia,
      contactName: item.contactName,
      contactPhone: item.contactPhone,
      contactEmail: item.contactEmail,
      details: item.details,
      isActive: item.isActive,
      displayOrder: item.displayOrder,
      images: {
        create: imagesCreate,
      },
    },
    include: { images: true },
  });
}

async function upsertAchievement(item) {
  const existing = await prisma.achievement.findFirst({ where: { title: item.title } });
  const achievementData = {
    description: item.description,
    category: item.category,
    year: item.year,
    images: item.images,
    featured: item.featured,
    displayOrder: item.displayOrder,
    isActive: true,
    awardingBody: item.awardingBody,
    recipients: item.recipients,
    achievedDate: item.achievedDate,
  };

  if (existing) {
    return prisma.achievement.update({
      where: { id: existing.id },
      data: achievementData,
    });
  }

  return prisma.achievement.create({ data: { title: item.title, ...achievementData } });
}

async function upsertSchoolStats(stats) {
  const existing = await prisma.schoolStats.findFirst();
  if (existing) {
    return prisma.schoolStats.update({
      where: { id: existing.id },
      data: stats,
    });
  }
  return prisma.schoolStats.create({ data: stats });
}

async function main() {
  console.log('Starting school data seeding...');

  const createdHubItems = [];
  for (const item of HUB_ITEMS) {
    const record = await upsertHubItem(item);
    createdHubItems.push(record.title);
    console.log(`Upserted School Hub item: ${record.title}`);
  }

  const createdAchievements = [];
  for (const item of ACHIEVEMENTS) {
    const record = await upsertAchievement(item);
    createdAchievements.push(record.title);
    console.log(`Upserted Achievement: ${record.title}`);
  }

  const statsRecord = await upsertSchoolStats(SCHOOL_STATS);
  console.log('Upserted School Stats:', statsRecord.id);

  console.log('Seeding completed successfully.');
  console.log('Hub items:', createdHubItems.join(', '));
  console.log('Achievements:', createdAchievements.join(', '));
}

main()
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
