// app/pages/gallery/page.jsx - This is a SERVER COMPONENT (no 'use client')
import ClientGallery from '../../components/gg/page';
import { Metadata } from 'next';

export const metadata = {
  title: 'A.I.C Katwanyaa Senior School Gallery',
  description: 'Explore the official gallery of Katwanyaa Senior School in Matungulu, Machakos County. View photos of classrooms, laboratories, sports day, graduation ceremonies, teaching moments, and school events.',
  keywords: [
    "Katwanyaa Senior School photos",
    "Katwanyaa High School pictures",
    "AIC Katwanyaa images",
    "Katz High School gallery",
    "Katwanyaa school grounds photos",
    "Katwanyaa classrooms photos",
    "Katwanyaa teaching moments",
    "Katwanyaa laboratories pictures",
    "Katwanyaa sports day images",
    "Katwanyaa graduation ceremony photos",
    "Katwanyaa general school activities",
    "Schools in Matungulu East photos",
    "Machakos County school pictures",
    "Kenya secondary school images",
    "Eastern province education photos",
    "Katwanyaa prize giving day photos",
    "Katwanyaa academic day pictures",
    "Katwanyaa music festival images",
    "Katwanyaa drama festival photos",
    "Katwanyaa school compound images",
    "Katwanyaa dormitories photos",
    "Katwanyaa dining hall pictures",
    "Katwanyaa library images",
    "Katwanyaa computer lab photos",
    "Katwanyaa teachers photos",
    "Katwanyaa students pictures",
    "Katwanyaa alumni images",
    "Katwanyaa staff gallery",
    "Katwanyaa class of 2024 photos",
    "Katwanyaa old school photos",
    "Katwanyaa historical images",
    "Katwanya school pictures",
    "Katanyaa high school images",
    "Katz school gallery",
    "AIC Katwanya photos"
  ].join(', '),
  
  openGraph: {
    title: 'A.I.C Katwanyaa Senior School - Photo Gallery',
    description: 'Browse through our collection of school photos, events, and memorable moments.',
    url: 'https://katwanyaasenior.school/pages/gallery',
    siteName: 'Katwanyaa Senior School',
    images: [
      {
        url: '/seo/katz.png',
        width: 1200,
        height: 630,
        alt: 'A.I.C Katwanyaa Senior School Gallery',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'A.I.C Katwanyaa Senior School Gallery',
    description: 'Browse through our collection of school photos, events, and memorable moments.',
    images: ['/seo/katz.png'],
  },
  
  alternates: {
    canonical: 'https://katwanyaasenior.school/pages/gallery',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function GalleryPage() {
  return <ClientGallery />;
}