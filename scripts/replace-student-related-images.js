const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const publicImage = (relativePath) => {
  const normalized = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  const filePath = path.join(process.cwd(), 'public', normalized.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing public image ${normalized}; keeping path in DB anyway.`);
  }
  return normalized;
};

const SCHOOL_NARRATIVE_IMAGES = [
  {
    url: publicImage('/academics.jpg'),
    caption: 'Academic excellence and learning resources',
    altText: 'Academic books and graduation cap illustration',
  },
  {
    url: publicImage('/katz.jpeg'),
    caption: 'A.I.C Katwanyaa Senior School identity',
    altText: 'A.I.C Katwanyaa Senior School emblem',
  },
  {
    url: publicImage('/cops.png'),
    caption: 'Campus safety and security',
    altText: 'Computer lab and safe learning environment',
  },
  {
    url: publicImage('/displine.jpg'),
    caption: 'Discipline, focus, and student support',
    altText: 'Discipline and focused study illustration',
  },
  {
    url: publicImage('/worship.jpg'),
    caption: 'Faith, values, and community life',
    altText: 'Faith and worship illustration',
  },
  {
    url: publicImage('/zeraki.jpg'),
    caption: 'Digital learning and analytics',
    altText: 'Zeraki digital learning logo',
  },
  {
    url: publicImage('/drugs.png'),
    caption: 'Health, safety, and responsible choices',
    altText: 'Drug awareness and safety icon',
  },
  {
    url: publicImage('/cumpus.jpg'),
    caption: 'School facilities and tuition block',
    altText: 'School tuition block',
  },
];

const pick = (index) => SCHOOL_NARRATIVE_IMAGES[index % SCHOOL_NARRATIVE_IMAGES.length];

const withRetry = async (label, action, attempts = 5) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      const message = error?.message || '';
      const isConnectionError = message.includes("Can't reach database server") ||
        message.includes('ECONN') ||
        message.includes('connect');

      if (!isConnectionError || attempt === attempts) break;

      const delay = attempt * 4000;
      console.warn(`${label} failed to reach database. Retry ${attempt}/${attempts - 1} in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

const galleryFiles = (startIndex, count = 3) => {
  return Array.from({ length: count }, (_, offset) => pick(startIndex + offset).url);
};

const achievementImages = (startIndex, count = 2) => {
  return Array.from({ length: count }, (_, offset) => {
    const image = pick(startIndex + offset);
    return {
      url: image.url,
      public_id: `local-narrative-${startIndex + offset}`,
      caption: image.caption,
    };
  });
};

async function updateGalleryImages() {
  const galleries = await withRetry('Gallery read', () => prisma.galleryImage.findMany({ orderBy: { id: 'asc' } }));

  for (const [index, gallery] of galleries.entries()) {
    await withRetry(`Gallery update ${gallery.id}`, () => prisma.galleryImage.update({
      where: { id: gallery.id },
      data: {
        files: galleryFiles(index, Math.max(1, Math.min(3, Array.isArray(gallery.files) ? gallery.files.length : 3))),
      },
    }));
  }

  console.log(`Updated ${galleries.length} gallery record(s).`);
}

async function updateSchoolHubImages() {
  const items = await withRetry('School hub read', () => prisma.schoolHubItem.findMany({
    orderBy: { id: 'asc' },
    include: { images: true },
  }));

  for (const [index, item] of items.entries()) {
    const primary = pick(index);
    const gallery = [pick(index), pick(index + 1), pick(index + 2)];

    await withRetry(`School hub image reset ${item.id}`, () => prisma.schoolHubImage.deleteMany({
      where: { schoolHubItemId: item.id },
    }));

    await withRetry(`School hub update ${item.id}`, () => prisma.schoolHubItem.update({
      where: { id: item.id },
      data: {
        image: primary.url,
        images: {
          create: gallery.map((image, displayOrder) => ({
            url: image.url,
            altText: image.altText,
            caption: image.caption,
            displayOrder,
          })),
        },
      },
    }));
  }

  console.log(`Updated ${items.length} school hub item(s).`);
}

async function updateNewsImages() {
  const news = await withRetry('News read', () => prisma.news.findMany({ orderBy: { id: 'asc' } }));

  for (const [index, item] of news.entries()) {
    await withRetry(`News update ${item.id}`, () => prisma.news.update({
      where: { id: item.id },
      data: { image: pick(index).url },
    }));
  }

  console.log(`Updated ${news.length} news record(s).`);
}

async function updateEventImages() {
  const events = await withRetry('Event read', () => prisma.event.findMany({ orderBy: { id: 'asc' } }));

  for (const [index, event] of events.entries()) {
    await withRetry(`Event update ${event.id}`, () => prisma.event.update({
      where: { id: event.id },
      data: { image: pick(index + 2).url },
    }));
  }

  console.log(`Updated ${events.length} event record(s).`);
}

async function updateAchievementImages() {
  const achievements = await withRetry('Achievement read', () => prisma.achievement.findMany({ orderBy: { id: 'asc' } }));

  for (const [index, achievement] of achievements.entries()) {
    await withRetry(`Achievement update ${achievement.id}`, () => prisma.achievement.update({
      where: { id: achievement.id },
      data: { images: achievementImages(index, 2) },
    }));
  }

  console.log(`Updated ${achievements.length} achievement record(s).`);
}

async function main() {
  console.log('Replacing student-related public images with school narrative assets...');

  await updateGalleryImages();
  await updateSchoolHubImages();
  await updateNewsImages();
  await updateEventImages();
  await updateAchievementImages();

  console.log('Image replacement seed completed without deleting records.');
}

main()
  .catch((error) => {
    console.error('Image replacement seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
