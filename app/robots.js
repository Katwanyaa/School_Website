// app/robots.js - BUT THIS IS A DOWNGRADE from your current setup
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/MainDashboard', '/pages/adminLogin', '/api/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/pages/', '/images/'],
        disallow: ['/MainDashboard', '/pages/adminLogin'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/*.jpg$', '/*.jpeg$', '/*.png$'],
      },
      {
        userAgent: 'Bingbot',
        disallow: ['/MainDashboard', '/pages/adminLogin'],
      },
    ],
    sitemap: 'https://katwanyaasenior.school/sitemap.xml',
    host: 'https://katwanyaasenior.school',
  }
}