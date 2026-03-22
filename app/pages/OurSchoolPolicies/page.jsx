"use client";

import React, { useState } from "react";

// Updated rules for Katwanyaa High School
const allTerms = [
  { 
    id: 1,
    title: "1. Registration and Admission",
    intro: "Katwanyaa High School maintains high admission standards to ensure quality education and student success.",
    subSections: [
      { subTitle: "1.1. Entry Requirements:", content: "Admission to Form 1 requires a minimum KCPE score of 250 marks. Transfer students must present original leaving certificate and report from previous school." },
      { subTitle: "1.2. Registration Documents:", content: "Original birth certificate, KCPE result slip, transfer letter, baptism card (optional), and 4 passport photos must be submitted on reporting day." },
      { subTitle: "1.3. Reporting Day:", content: "Form 1 students report on the date specified in admission letter. Reporting time: 8:00 AM - 12:00 PM. Late reporting requires prior approval." }
    ]
  },
  { 
    id: 2,
    title: "2. Academics and Class Attendance",
    intro: "Academic excellence is the core mandate of Katwanyaa High School, and students must demonstrate commitment to their studies.",
    subSections: [
      { subTitle: "2.1. Attendance:", content: "Minimum class attendance: 90%. Any absence requires a written explanation from parent/guardian. Absence exceeding 3 days needs a doctor's note." },
      { subTitle: "2.2. Academic Performance:", content: "Students must maintain a mean grade of C plain and above. Those scoring below D+ in two subjects attend mandatory holiday tuition." },
      { subTitle: "2.3. Study Hours:", content: "Preps: Morning 5:30 AM - 6:30 AM, Evening 7:00 PM - 9:30 PM. No loitering during prep time. Silence must be observed in classrooms." }
    ]
  },
  { 
    id: 3,
    title: "3. Fee Structure and Payments",
    intro: "School fees must be paid promptly to facilitate smooth school operations and resource availability. Below is the official fee structure for 2026.",
    subSections: [
      { 
        subTitle: "3.1. Payment Methods:", 
        content: "Bank payments to A.I.C KATWANYAA HIGH SCHOOL, Cooperative Bank, Account No: 0112876543210. MPESA Paybill: 894145 (Account: Student Name + Admission No). Crossed bankers cheque payable to KATWANYAA SECONDARY SCHOOL or Postal money order payable to KATWANYAA SECONDARY SCHOOL." 
      },
      { 
        subTitle: "3.2. Payment Deadlines:", 
        content: "Fees payable in full by the second week of each term. Term 1: By 31st January, Term 2: By 30th April, Term 3: By 31st August." 
      },
      { 
        subTitle: "3.3. Penalties:", 
        content: "Late payment attracts a penalty of KES 500 per week. Students with fee balances will not receive end-term reports or be allowed to sit for exams." 
      },
      { 
        subTitle: "3.4. Official Contact:", 
        content: "For fee queries, contact Accounts Clerk at P.O.Box 363-90131, TALA or call 0710 894 145. Email: katwanyaaschool@yahoo.com" 
      }
    ]
  },
  { 
    id: 4,
    title: "4. Code of Conduct and Discipline",
    intro: "Katwanyaa High School upholds strict discipline to create a conducive learning environment.",
    subSections: [
      { subTitle: "4.1. School Uniform:", content: "Full school uniform must be worn at all times: blue checked shirt, navy blue sweater, grey shorts/trousers, white socks, and black shoes. School tie and badge compulsory." },
      { subTitle: "4.2. Prohibited Items:", content: "STRICTLY PROHIBITED: Mobile phones, smartphones, smartwatches, alcohol, cigarettes, bhang, weapons, playing cards, and inappropriate magazines." },
      { subTitle: "4.3. Discipline Structure:", content: "Minor offenses: Manual work/counseling. Serious offenses: Suspension. Gross offenses: Expulsion (drugs, fighting, theft, vandalism)." }
    ]
  },
  { 
    id: 5,
    title: "5. Boarding and Accommodation",
    intro: "As a fully boarding school, Katwanyaa provides structured residential facilities with clear guidelines.",
    subSections: [
      { subTitle: "5.1. Daily Routine:", content: "Wake up: 5:00 AM. Breakfast: 6:30 AM. Lunch: 1:00 PM. Supper: 6:30 PM. Lights out: 10:00 PM (Form 3-4), 9:30 PM (Form 1-2)." },
      { subTitle: "5.2. Dormitory Rules:", content: "Beds made by 6:00 AM. Personal belongings locked in boxes. No food in dormitories. Cleaning roster strictly followed." },
      { subTitle: "5.3. Visiting Days:", content: "Last Sunday of each term, 10:00 AM - 4:00 PM. Parents must sign visitor's book. No visiting on examination days." }
    ]
  },
  { 
    id: 6,
    title: "6. Movement and School Boundaries",
    intro: "Student movement within and outside school is controlled for safety and accountability.",
    subSections: [
      { subTitle: "6.1. School Compound:", content: "Students must remain within school bounds at all times. Leaving school requires written parental permission approved by Principal." },
      { subTitle: "6.2. Half-Term Breaks:", content: "Half-term break: Thursday to Sunday. Students must sign out and indicate destination. Return by Sunday 5:00 PM." },
      { subTitle: "6.3. Day Scholars:", content: "Day scholars (if any) must arrive by 7:30 AM and leave by 5:00 PM. No day scholars in dormitories." }
    ]
  },
  { 
    id: 7,
    title: "7. Health and Medical Care",
    intro: "Student health and wellness are prioritized with comprehensive medical support systems.",
    subSections: [
      { subTitle: "7.1. School Dispensary:", content: "School nurse on duty 24/7. Minor ailments treated at school dispensary. Serious cases referred to Katwanyaa Health Centre." },
      { subTitle: "7.2. Medical Checkups:", content: "Routine medical checkups conducted every term. Parents must provide updated medical history and allergy information." },
      { subTitle: "7.3. Emergency Contacts:", content: "Parents notified immediately of serious illness/accident. Emergency contacts must be kept updated: Principal: 0710 894 145, Nurse: 0722 123 456." }
    ]
  },
  { 
    id: 8,
    title: "8. Co-Curricular Activities",
    intro: "Participation in co-curricular activities is mandatory for holistic student development.",
    subSections: [
      { subTitle: "8.1. Sports:", content: "Every student must join at least one sport: football, volleyball, rugby, athletics, or handball. Sports days: Tuesday and Thursday 4:00-6:00 PM." },
      { subTitle: "8.2. Clubs and Societies:", content: "Students choose minimum one club: Debate, Journalism, Science, Drama, Red Cross, or Christian Union. Meetings: Wednesday 4:00-5:30 PM." },
      { subTitle: "8.3. Music and Drama:", content: "Music and drama festivals participation encouraged. Practice sessions: Saturday 9:00 AM - 12:00 PM." }
    ]
  },
  { 
    id: 9,
    title: "9. Examinations and Assessment",
    intro: "Regular assessment ensures academic progress and KCSE readiness.",
    subSections: [
      { subTitle: "9.1. Continuous Assessment:", content: "2 CATs per term. End-term examinations in Week 14. Form 3 and 4 have monthly mock examinations starting Term 2." },
      { subTitle: "9.2. Examination Rules:", content: "NO cheating. Latecomers not admitted. Mobile phones strictly forbidden in exam rooms. KCSE rules apply to all internal exams." },
      { subTitle: "9.3. KCSE Preparation:", content: "Form 4: Saturday morning tuition 8:00 AM - 12:00 PM. Holiday coaching for candidates: April and August holidays." }
    ]
  },
  { 
    id: 10,
    title: "10. Dress Code and Grooming",
    intro: "Proper grooming reflects the discipline and identity of Katwanyaa High School.",
    subSections: [
      { subTitle: "10.1. Hair Rules:", content: "Boys: Short, neat, above collar, no shaved lines. Girls: Natural hair, neatly combed, no extensions, no coloring. Dreadlocks not allowed." },
      { subTitle: "10.2. Personal Effects:", content: "NO jewelry except simple watches. No makeup, nail polish, or cosmetics. No visible tattoos or piercings." },
      { subTitle: "10.3. General Grooming:", content: "Nails short and clean. Uniforms clean and ironed. Shirts tucked in. Shoes polished daily." }
    ]
  },
  { 
    id: 11,
    title: "11. Library and Resource Center",
    intro: "The school library provides essential resources to support academic work.",
    subSections: [
      { subTitle: "11.1. Library Hours:", content: "Monday-Friday: 7:30 AM - 6:00 PM, Saturday: 8:00 AM - 1:00 PM. Closed on Sundays and public holidays." },
      { subTitle: "11.2. Borrowing Rules:", content: "Maximum 2 books for 2 weeks. Late return fine: KES 20 per day. Lost books: Replace or pay full cost." },
      { subTitle: "11.3. Library Conduct:", content: "Absolute silence. NO eating or drinking. Bags not allowed inside. Reference books NOT for borrowing." }
    ]
  },
  { 
    id: 12,
    title: "12. Chapel and Religious Activities",
    intro: "Spiritual growth is encouraged through organized religious activities.",
    subSections: [
      { subTitle: "12.1. Chapel Services:", content: "Sunday service: 8:00 AM - 10:00 AM (compulsory). Thursday Afternoon fellowship: 12:00 PM - 2:00 PM (compulsory)." },
      { subTitle: "12.2. Religious Groups:", content: "Christian Union, Catholic Action, and Muslim students provided with facilities for worship. Respect for all faiths mandatory." },
      { subTitle: "12.3. Conduct in Chapel:", content: "Proper attire required. Phones NOT allowed. Active participation encouraged. Offerings voluntary." }
    ]
  },
  { 
    id: 13,
    title: "13. Dining Hall and Meals",
    intro: "Proper conduct in the dining hall ensures orderly and hygienic meal times.",
    subSections: [
      { subTitle: "13.1. Meal Times:", content: "Breakfast: 6:30 AM, Lunch: 1:00 PM, Supper: 6:30 PM. Students must be punctual. Grace said before meals." },
      { subTitle: "13.2. Dining Rules:", content: "Queue orderly. NO food wastage. Use own plates and cutlery. Return utensils after meals. NO food out of dining hall." },
      { subTitle: "13.3. Special Diets:", content: "Medical cases provided special diet upon doctor's recommendation. Written parental request required." }
    ]
  },
  { 
    id: 14,
    title: "14. Communication and Parent-School Partnership",
    intro: "Strong communication between school and parents enhances student success.",
    subSections: [
      { subTitle: "14.1. Parent Meetings:", content: "Annual general meeting: First Saturday of Term 1. PTA meetings: Second Saturday of Term 2 and 3. Class-specific meetings as called." },
      { subTitle: "14.2. Reporting:", content: "Progress reports issued end of each term. Mid-term reports for students with performance issues. Principal's report in school newsletter." },
      { subTitle: "14.3. Parent Queries:", content: "Contact class teacher for academic issues. Contact housemaster for boarding issues. Principal's office: katzihigh@gmail.com." }
    ]
  },
  { 
    id: 15,
    title: "15. Environmental and Property Care",
    intro: "Students are responsible for maintaining a clean environment and caring for school property.",
    subSections: [
      { subTitle: "15.1. Cleanliness:", content: "Daily cleaning of classes and compound. Friday general cleaning: 4:00-6:00 PM. NO littering - dustbins provided." },
      { subTitle: "15.2. Property Care:", content: "Vandalism attracts heavy penalties (repair cost plus disciplinary action). Report any damage immediately." },
      { subTitle: "15.3. Environmental Projects:", content: "Tree planting every term. School farm participation for Agriculture students. Water conservation practices." }
    ]
  }
];

// Hardcoded fee data from your PDF (exact figures as provided)
const PDF_FEE_DATA = {
  boarding: {
    term1: 22244,
    term2: 20268,
    term3: 12160,
    annual: 40535,
    breakdown: [
      { voteHead: "TUITION", term1: 4144, term2: 7615, term3: 5077, total: 25385 },
      { voteHead: "BOARDING", term1: 12693, term2: 7615, term3: 5077, total: 25385 },
      { voteHead: "M&I", term1: 5000, term2: 1000, term3: 600, total: 2000 },
      { voteHead: "LT&T, EWC, ADM, P,E", term1: 9400, term2: 6450, term3: 3870, total: 12900 },
      { voteHead: "ACTIVITY", term1: 1500, term2: 125, term3: 75, total: 250 },
      { voteHead: "MEDICAL & INSURANCE", term1: 2000, term2: 0, term3: 0, total: 2000 },
      { voteHead: "SMASSE", term1: 200, term2: 0, term3: 0, total: 200 }
    ]
  },
  day: {
    term1: 6000,
    term2: 6000,
    term3: 6000,
    annual: 18000,
    breakdown: [
      { voteHead: "TUITION", term1: 4144, term2: 6000, term3: 6000, total: 18000 },
      { voteHead: "LUNCH/BREAKFAST", term1: 6000, term2: 6000, term3: 6000, total: 18000 }
    ]
  }
};

const TERMS_PER_PAGE = 5;

// Improved SummaryCard Component with better design and responsiveness
function SummaryCard({ title, amount, bgColor, icon, description }) {
  const formattedAmount = amount.toLocaleString();
  
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgColor} p-5 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2z"/>
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <span className="text-xl sm:text-2xl">{icon}</span>
          </div>
          {description && (
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              {description}
            </span>
          )}
        </div>
        
        <h3 className="text-xs sm:text-sm font-medium text-white/80 mb-1 uppercase tracking-wider">
          {title}
        </h3>
        
        <div className="flex items-baseline gap-1">
          <span className="text-lg sm:text-xl font-bold">KES</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            {formattedAmount}
          </span>
        </div>
        
        <div className="mt-3 h-1 w-full bg-white/20 rounded-full overflow-hidden">
          <div className="h-full w-full bg-white/40 rounded-full transform origin-left animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// New Card Grid Component for better organization
function FeeCardGrid({ title, amount, subtitle, bgColor, icon, onClick }) {
  const formattedAmount = amount.toLocaleString();
  
  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgColor} p-4 sm:p-5 text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2z"/>
        </svg>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <span className="text-lg sm:text-xl">{icon}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-xs font-medium text-white/80 mb-1 uppercase tracking-wider">
          {title}
        </h3>
        
        <p className="text-2xl sm:text-3xl font-black mb-1">
          KES {formattedAmount}
        </p>
        
        {subtitle && (
          <p className="text-xs text-white/70">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function TermsAndConditions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('boarding');
  const feeData = PDF_FEE_DATA;
  
  const startIndex = (currentPage - 1) * TERMS_PER_PAGE;
  const endIndex = startIndex + TERMS_PER_PAGE;
  
  // Filter terms based on search
  const filteredTerms = allTerms.filter(term => 
    term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.intro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.subSections.some(sub => 
      sub.subTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const currentTerms = filteredTerms.slice(startIndex, endIndex);
  const filteredPages = Math.ceil(filteredTerms.length / TERMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="mb-6 sm:mb-8 md:mb-12 lg:mb-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="text-center lg:text-left w-full lg:w-auto">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border border-blue-200 mb-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">KH</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-blue-900 uppercase tracking-wider">
                  A.I.C Katwanyaa High School
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 mb-2 leading-tight">
                School Rules & Fee Structure
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0">
                Official policies, guidelines, and fee structure for {new Date().getFullYear()} academic year
              </p>
            </div>
            
            {/* Stats - Improved responsive design */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full lg:w-auto">
              <div className="bg-white rounded-xl p-2 sm:p-3 border border-slate-200 shadow-sm text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700">{allTerms.length}</div>
                <div className="text-[10px] sm:text-xs font-medium text-slate-500">Total Sections</div>
              </div>
              <div className="bg-white rounded-xl p-2 sm:p-3 border border-slate-200 shadow-sm text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-700">2026</div>
                <div className="text-[10px] sm:text-xs font-medium text-slate-500">Fee Structure</div>
              </div>
            </div>
          </div>

          {/* Fee Structure Section - Improved Cards */}
          <div className="mb-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">School Fees Structure 2026</h2>
                  <p className="text-blue-100 text-xs sm:text-sm">A.I.C Katwanyaa High School - Mixed Day & Boarding</p>
                </div>
              </div>
              
              {/* Tabs - Responsive */}
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => setActiveTab('boarding')}
                  className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                    activeTab === 'boarding'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Boarding Students
                </button>
                <button
                  onClick={() => setActiveTab('day')}
                  className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                    activeTab === 'day'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Day Scholars
                </button>
              </div>
            </div>

            {/* Fee Content - Improved Cards Grid */}
            <div className="p-4 sm:p-6">
              <>
                  {activeTab === 'boarding' && (
                    <div className="space-y-6">
                      {/* Enhanced Summary Cards - Fully Responsive Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                        <SummaryCard 
                          title="Term 1" 
                          amount={feeData.boarding.term1}
                          bgColor="from-blue-500 via-blue-600 to-blue-700"
                          icon="📚"
                          description="Opening Term"
                        />
                        <SummaryCard 
                          title="Term 2" 
                          amount={feeData.boarding.term2}
                          bgColor="from-indigo-500 via-indigo-600 to-indigo-700"
                          icon="✏️"
                          description="Mid Year"
                        />
                        <SummaryCard 
                          title="Term 3" 
                          amount={feeData.boarding.term3}
                          bgColor="from-purple-500 via-purple-600 to-purple-700"
                          icon="🎓"
                          description="Final Term"
                        />
                        <SummaryCard 
                          title="Annual Total" 
                          amount={feeData.boarding.annual}
                          bgColor="from-green-500 via-green-600 to-green-700"
                          icon="💰"
                          description="Full Year"
                        />
                      </div>

                      {/* Detailed Breakdown Table - Responsive */}
                      <div className="mt-6 sm:mt-8">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
                          Detailed Fee Breakdown - Boarding Students
                        </h3>
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                          <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                              <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="py-2 sm:py-3 pl-3 sm:pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Vote Head</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-700">Term 1</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-700">Term 2</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-700">Term 3</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-700">Total</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                  {feeData.boarding.breakdown.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50">
                                      <td className="whitespace-nowrap py-2 sm:py-3 pl-3 sm:pl-4 pr-3 text-xs sm:text-sm font-medium text-slate-900">{item.voteHead}</td>
                                      <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">{item.term1.toLocaleString()}</td>
                                      <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">{item.term2.toLocaleString()}</td>
                                      <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">{item.term3.toLocaleString()}</td>
                                      <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-900">{item.total.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                  <tr className="bg-blue-50 font-bold">
                                    <td className="whitespace-nowrap py-2 sm:py-3 pl-3 sm:pl-4 pr-3 text-xs sm:text-sm text-blue-900">TOTAL</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-blue-900">{feeData.boarding.term1.toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-blue-900">{feeData.boarding.term2.toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-blue-900">{feeData.boarding.term3.toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-blue-900">{feeData.boarding.annual.toLocaleString()}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'day' && (
                    <div className="space-y-6">
                      {/* Summary Cards for Day Scholars */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                        <SummaryCard 
                          title="Term 1" 
                          amount={feeData.day.term1}
                          bgColor="from-blue-500 via-blue-600 to-blue-700"
                          icon="🌅"
                          description="Opening Term"
                        />
                        <SummaryCard 
                          title="Term 2" 
                          amount={feeData.day.term2}
                          bgColor="from-indigo-500 via-indigo-600 to-indigo-700"
                          icon="☀️"
                          description="Mid Year"
                        />
                        <SummaryCard 
                          title="Term 3" 
                          amount={feeData.day.term3}
                          bgColor="from-purple-500 via-purple-600 to-purple-700"
                          icon="🌙"
                          description="Final Term"
                        />
                        <SummaryCard 
                          title="Annual Total" 
                          amount={feeData.day.annual}
                          bgColor="from-green-500 via-green-600 to-green-700"
                          icon="💳"
                          description="Full Year"
                        />
                      </div>

                      {/* Day Scholars Breakdown */}
                      <div className="mt-6 sm:mt-8">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
                          Day Scholars Fee Breakdown
                        </h3>
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                          <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                              <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="py-2 sm:py-3 pl-3 sm:pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Vote Head</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-700">Term 1</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-700">Term 2</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-700">Term 3</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-700">Total</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                  <tr className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap py-2 sm:py-3 pl-3 sm:pl-4 pr-3 text-xs sm:text-sm font-medium text-slate-900">TUITION</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">4,144</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">6,000</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">6,000</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-900">18,000</td>
                                   </tr>
                                  <tr className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap py-2 sm:py-3 pl-3 sm:pl-4 pr-3 text-xs sm:text-sm font-medium text-slate-900">LUNCH/BREAKFAST</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">6,000</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">6,000</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-700">6,000</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-slate-900">18,000</td>
                                   </tr>
                                  <tr className="bg-blue-50 font-bold">
                                    <td className="whitespace-nowrap py-2 sm:py-3 pl-3 sm:pl-4 pr-3 text-xs sm:text-sm text-blue-900">TOTAL</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-blue-900">6,000</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-blue-900">6,000</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-blue-900">6,000</td>
                                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm text-blue-900">18,000</td>
                                   </tr>
                                </tbody>
                               </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Day Scholars Notice */}
                      <div className="mt-4 p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-amber-800 text-xs sm:text-sm">
                          <strong>Note:</strong> Day scholars fee covers tuition, lunch, and breakfast. 
                          Other vote heads (M&I, LT&T, EWC, Activity, Medical Insurance, SMASSE) are included in the tuition fee for day scholars.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payment Instructions - Improved Layout */}
                  <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-3 text-sm sm:text-base">💳 Payment Instructions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-blue-800 mb-2">🏦 Bank Transfer:</p>
                        <ul className="space-y-1 text-xs sm:text-sm text-slate-700">
                          <li>• Account Name: A.I.C KATWANYAA HIGH SCHOOL</li>
                          <li>• Bank: Cooperative Bank</li>
                          <li>• Account No: 0112876543210</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-blue-800 mb-2">📱 MPESA:</p>
                        <ul className="space-y-1 text-xs sm:text-sm text-slate-700">
                          <li>• Paybill: <strong className="text-blue-600">894145</strong></li>
                          <li>• Account: Student Name + Admission No.</li>
                        </ul>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-semibold text-xs sm:text-sm text-blue-800 mb-2">📝 Other Methods:</p>
                        <ul className="space-y-1 text-xs sm:text-sm text-slate-700">
                          <li>• Crossed bankers cheque payable to KATWANYAA SECONDARY SCHOOL</li>
                          <li>• Postal money order payable to KATWANYAA SECONDARY SCHOOL</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 text-center text-xs sm:text-sm text-slate-600">
                    <p>📞 For queries, contact Accounts Clerk: P.O.Box 363-90131, TALA | Tel: 0710 894 145 | Email: katwanyaaschool@yahoo.com</p>
                  </div>
              </>
            </div>
          </div>

          {/* Search Bar - Improved */}
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="🔍 Search rules and regulations..."
                className="w-full px-4 py-3 sm:py-4 pl-11 sm:pl-12 text-sm sm:text-base border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white shadow-sm"
              />
              <svg className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6 px-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] sm:text-xs font-medium text-slate-600">
                  Showing {currentTerms.length} of {filteredTerms.length} rules
                </span>
              </div>
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full">
                  Search: "{searchTerm}"
                </span>
              )}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-medium">
              Page {currentPage} of {filteredPages}
            </div>
          </div>
        </div>

        {/* Terms Grid - Improved Responsive */}
        <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
          {currentTerms.length > 0 ? (
            currentTerms.map((term) => (
              <div 
                key={term.id} 
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Term Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5 md:p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-xs sm:text-sm md:text-lg font-bold">{term.id}</span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80 bg-white/10 px-2 py-1 rounded-full">
                          Section {term.id}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight">
                        {term.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Term Content */}
                <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <p className="text-slate-700 leading-relaxed text-sm sm:text-base">{term.intro}</p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {term.subSections.map((sub, index) => (
                      <div 
                        key={index} 
                        className="p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-xl sm:rounded-2xl"
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                              <span className="text-[10px] sm:text-xs font-bold">{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">{sub.subTitle}</h4>
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{sub.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-8 sm:p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-2">No Rules Found</h3>
                <p className="text-slate-600 text-sm mb-4">Try searching with different keywords or browse all sections</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
                >
                  Show All Rules
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination - Improved Responsive */}
        {filteredPages > 1 && (
          <div className="sticky bottom-2 sm:bottom-4 z-10">
            <div className="bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 shadow-xl p-3 sm:p-4 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <div className="text-xs sm:text-sm font-medium text-slate-700">Page {currentPage} of {filteredPages}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500">{filteredTerms.length} total rules found</div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex flex-wrap items-center gap-1">
                    {Array.from({ length: Math.min(5, filteredPages) }, (_, i) => {
                      let pageNum;
                      if (filteredPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= filteredPages - 2) {
                        pageNum = filteredPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg font-bold transition-all text-xs sm:text-sm ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(filteredPages, currentPage + 1))}
                    disabled={currentPage === filteredPages}
                    className="p-1.5 sm:p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-medium text-slate-600">Go to:</span>
                  <select
                    value={currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white"
                  >
                    {Array.from({ length: filteredPages }, (_, i) => i + 1).map(page => (
                      <option key={page} value={page}>Page {page}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Improved */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2 text-sm sm:text-base">⚠️ Important Notice</h4>
              <p className="text-xs sm:text-sm text-slate-700">These rules are binding for all students. Parents/guardians must ensure students understand and comply.</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-4 border border-emerald-100">
              <h4 className="font-bold text-emerald-900 mb-2 text-sm sm:text-base">💰 Fee Payment</h4>
              <p className="text-xs sm:text-sm text-slate-700">Fees must be paid in full by the second week of each term. Late payment attracts a penalty of KES 500 per week.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl sm:rounded-2xl p-4 border border-purple-100">
              <h4 className="font-bold text-purple-900 mb-2 text-sm sm:text-base">⚖️ Enforcement</h4>
              <p className="text-xs sm:text-sm text-slate-700">Rules enforced by school administration. Appeals to be made in writing to Principal's office.</p>
            </div>
          </div>
          
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-[10px] sm:text-xs text-slate-500">
              © 2024 A.I.C Katwanyaa High School. All rights reserved. 
              <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">For queries, contact: katwanyaaschool@yahoo.com | Tel: 0710 894 145</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}