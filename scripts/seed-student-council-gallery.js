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

// Chunk 1: First 5 images
const CHUNK_1 = [
  { url: PUBLIC_IMAGE('/st/1.jpeg'), caption: 'Student Council Members Gathering', alt: 'Student Council Members' },
  { url: PUBLIC_IMAGE('/st/2.jpeg'), caption: 'Leadership Team Meeting', alt: 'Leadership Meeting' },
  { url: PUBLIC_IMAGE('/st/3.jpeg'), caption: 'Council Project Planning', alt: 'Project Planning' },
  { url: PUBLIC_IMAGE('/st/4.jpeg'), caption: 'Student Representatives', alt: 'Student Representatives' },
  { url: PUBLIC_IMAGE('/st/7.jpeg'), caption: 'Council Activities and Events', alt: 'Council Activities' },
];

// Chunk 2: Second 5 images
const CHUNK_2 = [
  { url: PUBLIC_IMAGE('/st/9.jpeg'), caption: 'Student Leadership Portrait', alt: 'Leadership Portrait' },
  { url: PUBLIC_IMAGE('/st/10.jpeg'), caption: 'Council Members in Session', alt: 'Council Session' },
  { url: PUBLIC_IMAGE('/st/11.jpeg'), caption: 'Student Council Team', alt: 'Council Team' },
  { url: PUBLIC_IMAGE('/st/12.jpeg'), caption: 'Leadership Development', alt: 'Leadership Development' },
  { url: PUBLIC_IMAGE('/st/13.jpeg'), caption: 'Council Participation', alt: 'Council Participation' },
];

// Chunk 3: Remaining 6 images
const CHUNK_3 = [
  { url: PUBLIC_IMAGE('/st/14.jpeg'), caption: 'Student Governance Structure', alt: 'Governance Structure' },
  { url: PUBLIC_IMAGE('/st/15.jpeg'), caption: 'Council Awards and Recognition', alt: 'Awards Recognition' },
  { url: PUBLIC_IMAGE('/st/16.jpeg'), caption: 'Student Leaders Group Photo', alt: 'Group Photo' },
  { url: PUBLIC_IMAGE('/st/17.jpeg'), caption: 'Council Initiatives', alt: 'Council Initiatives' },
  { url: PUBLIC_IMAGE('/st/WhatsApp Image 2026-05-26 at 5.35.21 PM (2).jpeg'), caption: 'Student Council Event', alt: 'Council Event' },
];

async function createStudentCouncilGallery() {
  try {
    // Check if student council gallery already exists
    const existing = await prisma.schoolHubItem.findFirst({
      where: { 
        type: 'STUDENT_COUNCIL',
        title: 'Student Council Gallery'
      }
    });

    if (existing) {
      console.log('✅ Student Council Gallery already exists. Updating with new images...');
      
      // Delete existing images to reset
      await prisma.schoolHubImage.deleteMany({
        where: { schoolHubItemId: existing.id }
      });

      // Combine all chunks
      const allImages = [...CHUNK_1, ...CHUNK_2, ...CHUNK_3];

      // Create new images
      const imagesCreate = allImages.map((image, index) => ({
        url: image.url,
        altText: image.alt || 'Student Council Image',
        caption: image.caption || null,
        displayOrder: index,
      }));

      const updated = await prisma.schoolHubItem.update({
        where: { id: existing.id },
        data: {
          images: {
            create: imagesCreate,
          },
        },
        include: { images: true },
      });

      console.log(`✅ Updated Student Council Gallery with ${updated.images.length} images`);
      return updated;
    } else {
      console.log('📝 Creating new Student Council Gallery...');
      
      // Combine all chunks
      const allImages = [...CHUNK_1, ...CHUNK_2, ...CHUNK_3];

      const imagesCreate = allImages.map((image, index) => ({
        url: image.url,
        altText: image.alt || 'Student Council Image',
        caption: image.caption || null,
        displayOrder: index,
      }));

      const gallery = await prisma.schoolHubItem.create({
        data: {
          type: 'STUDENT_COUNCIL',
          title: 'Student Council Gallery',
          shortDescription: 'Explore our vibrant student council leadership and initiatives.',
          description: 'The Student Council Gallery showcases the dedicated student leaders who serve Katwanyaa Senior School. Meet the elected representatives, view their leadership activities, and learn about student governance initiatives that drive positive change in our school community.',
          location: 'Student Affairs Office',
          established: new Date().getFullYear().toString(),
          website: 'https://katwanyaasenior.school',
          isActive: true,
          displayOrder: 1,
          images: {
            create: imagesCreate,
          },
        },
        include: { images: true },
      });

      console.log(`✅ Created Student Council Gallery with ${gallery.images.length} images`);
      console.log(`   Chunk 1: 5 images (displayOrder 0-4)`);
      console.log(`   Chunk 2: 5 images (displayOrder 5-9)`);
      console.log(`   Chunk 3: 6 images (displayOrder 10-15)`);
      return gallery;
    }
  } catch (error) {
    console.error('❌ Error creating/updating Student Council Gallery:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🎓 Starting Student Council Gallery Seeding...\n');
    
    const gallery = await createStudentCouncilGallery();
    
    console.log('\n✨ Student Council Gallery Setup Complete!');
    console.log(`📊 Total Images: ${gallery.images.length}`);
    console.log(`📍 Location: Student Council Hub`);
    console.log(`🌐 Public Path: /pages/student-council`);
    console.log(`\n📸 Image Distribution:`);
    console.log(`   • Chunk 1 (0-4): 1.jpeg, 2.jpeg, 3.jpeg, 4.jpeg, 7.jpeg`);
    console.log(`   • Chunk 2 (5-9): 9.jpeg, 10.jpeg, 11.jpeg, 12.jpeg, 13.jpeg`);
    console.log(`   • Chunk 3 (10-15): 14.jpeg, 15.jpeg, 16.jpeg, 17.jpeg, WhatsApp Image...`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
