import localFont from "next/font/local";
import "./globals.css";
import ClientLayoutWrapper from "./-app";
import { SessionProvider } from "./session/sessiowrapper";

/* -------------------------------------------------------------------------- */
/* FONTS                                    */
/* -------------------------------------------------------------------------- */
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

/* -------------------------------------------------------------------------- */
/* VIEWPORT                                  */
/* -------------------------------------------------------------------------- */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ea580c", // Matches your orange-600 brand color
};

/* -------------------------------------------------------------------------- */
/* METADATA                                  */
/* -------------------------------------------------------------------------- */
export const metadata = {
  metadataBase: new URL("https://katwanyaasenior.school"),

  title: {
    default: "A.I.C Katwanyaa Senior School",
    template: "%s | Katwanyaa Senior School",
  },

  description:
    "The official website of A.I.C Katwanyaa Senior School.",
  
"keywords": [
    // Core Names & Official Identity
    "AIC Katwanyaa sec School",
    "AIC katz High School",
    "AIC Katz High School",
    "Katwanyaa High School",
    "Katwanyaa day and boarding School",
    "AIC Katwanyaa High School",
    "Katwanyaa Senior High School",
    "Katwanyaa Secondary School",
    "AIC Katwanyaa Secondary School",
    "AIC Katwanyaa Senior High",
    "AIC Katz",
    "AIC Katwanyaa",
    "A.I.C Katwanyaa",
    "Katz High School",
    "Katz Senior High School",
    "Katwanyaa School",
    "Katwanyaa Senior School",
    "Katz School",
    "Katz",

    // Institutional Specifics (New & Essential)
    "Katwanyaa Mixed Day and Boarding School",
    "AIC Sponsored Schools Machakos",
    "Katwanyaa County Secondary School",
    "Katwanyaa 6-stream enrollment school",
    "God-fearing citizens Katwanyaa", // From school mission
    "Empowered students Katwanyaa",

    // Location-Specific & Regional
    "Katwanyaa Senior School Matungulu",
    "Secondary schools in Matungulu East",
    "High schools in Machakos County",
    "Best secondary schools in Machakos",
    "Public schools in Kenya",
    "Schools near Matungulu",
    "Best day schools in Matungulu",
    "Katwanyaa school location",
    "Katwanyaa school map",
    "Kangundo sub-region schools",
    "Tala-Matungulu area schools",

    // Functional & API Specific (For your integration)
    "Katwanyaa high school results",
    "Katwanyaa high school admissions",
    "Katwanyaa high school events",
    "Katwanyaa high  school news",
    "Katwanyaa school contact",
    "Katwanyaa school history",
    "Katwanyaa school achievements",
    "Katwanyaa school curriculum",
    "Katwanyaa school fees",
    "Katwanyaa school uniform",
    "Katwanyaa school alumni",
    "Katwanyaa school principal",
    "Katwanyaa school staff",
    "Katwanyaa student portal",
    "Katwanyaa assignment uploads",
    "Katwanyaa exam schedule",
    "Katwanyaa video tour",
    "Katwanyaa resources and downloads",

    // Katwanyaa High School + Official Extensions
    "Katwanyaa High School KCSE Results",
    "Katwanyaa High School KNEC Code 12345507",
    "Katwanyaa High School County Mixed Day and Boarding",
    "Katwanyaa High School Matungulu Sub-county",
    "Katwanyaa High School Machakos Area",
    "Katwanyaa High School Angaza Technology Literacy Center",
    "Katwanyaa High School God-fearing Citizens",
    "Katwanyaa High School Fully Empowered Learners",
    "Katwanyaa High School Since 1976",

    // Technical & Partners (SEO & Verification)
    "Angaza Technology Literacy Center Katwanyaa",
    "Katwanyaa school computer lab",
    "Katwanyaa digital learning portal",

    // SEO Misspellings & Slang
    "Katwanya school",
    "Katanyaa school",
    "Katz senior school",
    "Katwanya high",
    "Katwanyaa sec",
    "Katwanyaa boys and girls"
  ],

  authors: [{ name: "A.I.C Katwanyaa Senior School" }],
  
  alternates: {
    canonical: "/",
  },

  /* Open Graph (Social Media Sharing) */
  openGraph: {
    title: "A.I.C Katwanyaa School",
    description: "Official school website.",
    url: "https://katwanyaasenior.school",
    siteName: "Katwanyaa Senior School",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "/seo/katz.png",
        width: 1200,
        height: 630,
        alt: "A.I.C Katwanyaa Senior School",
      },
    ],
  },

  /* Twitter Card */
  twitter: {
    card: "summary_large_image",
    title: "A.I.C Katwanyaa Senior School",
    description: "Empowering students through education and faith in Machakos County.",
    images: ["/seo/katz.png"],
  },

  /* Search Engine Bot Instructions */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/seo/katz.png",
    apple: "/seo/katz.png",
  },

  verification: {
    google: "google16e979b115c09244",
    
  },
};

/* -------------------------------------------------------------------------- */
/* ROOT LAYOUT                                 */
/* -------------------------------------------------------------------------- */
export default function RootLayout({ children }) {
  // Structured Data (JSON-LD) for Local Business/School SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "School",
    "name": "A.I.C Katwanyaa Senior School",
    "alternateName": "Katwanyaa Senior School",
    "url": "https://katwanyaasenior.school",
    "logo": "https://katwanyaasenior.school/seo/katz.png",
    "image": "https://katwanyaasenior.school/seo/katz.png",
    "description": "A public Senior school in Matungulu, Machakos County, Kenya.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Matungulu",
      "addressRegion": "Machakos County",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-1.2825", // Optional: replace with your actual GPS coordinates
      "longitude": "37.2618"
    },
    "hasMap": "https://www.google.com/maps?q=Katwanyaa+Secondary+School", 
    "telephone": "+254 710 894 145", // Update with official school phone
    "priceRange": "N/A"
  };

  return (
    <html lang="en">
      <head>
        {/* Injecting Structured Data into the Head */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-orange-50 via-white to-amber-50 text-gray-900`}
      >
        <SessionProvider>
          <ClientLayoutWrapper>
            {/* Semantic <main> tag should wrap content in page.jsx files for SEO */}
            {children}
          </ClientLayoutWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}