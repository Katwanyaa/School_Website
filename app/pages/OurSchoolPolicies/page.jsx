"use client";

import React, { useState } from "react";

// Updated rules for Katwanyaa High School (COVID-19 protocols removed)
const allTerms = [
  { 
    id: 1,
    title: "1. Registration and Admission",
    intro: "Katwanyaa High School maintains高标准 admission standards to ensure quality education and student success.",
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
    intro: "School fees must be paid promptly to facilitate smooth school operations and resource availability.",
    subSections: [
      { subTitle: "3.1. Fee Payment:", content: "Fees payable in full by the second week of each term. Bank payments to Katwanyaa High School Account No: 0112876543210, Cooperative Bank." },
      { subTitle: "3.2. Fee Breakdown:", content: "Term 1: KES 45,000, Term 2: KES 40,000, Term 3: KES 35,000. Includes tuition, boarding, meals, and examination fees." },
      { subTitle: "3.3. Penalties:", content: "Late payment attracts a penalty of KES 500 per week. Students with fee balances will not receive end-term reports or be allowed to sit for exams." }
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

const TERMS_PER_PAGE = 5;
const totalPages = Math.ceil(allTerms.length / TERMS_PER_PAGE);

export default function TermsAndConditions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
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
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 p-4 sm:p-6 md:p-8">
      {/* Modern Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 sm:mb-12 md:mb-16">
          {/* School Logo and Info */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border border-blue-200 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">KH</span>
                </div>
                <span className="text-sm font-bold text-blue-900 uppercase tracking-wider">Katwanyaa High School</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-2 leading-tight">
                School Rules & Regulations
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
                Official policies and guidelines governing student conduct, academics, and school operations at Katwanyaa High School
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-700">{allTerms.length}</div>
                <div className="text-xs font-medium text-slate-500">Total Sections</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
                <div className="text-xl sm:text-2xl font-bold text-emerald-700">{new Date().getFullYear()}</div>
                <div className="text-xs font-medium text-slate-500">Academic Year</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search rules and regulations..."
                className="w-full px-4 py-3 pl-12 text-base sm:text-lg border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white shadow-sm"
                style={{ fontSize: '16px' }}
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-medium text-slate-600">Showing {currentTerms.length} of {filteredTerms.length} rules</span>
              </div>
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Search: "{searchTerm}"
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Page {currentPage} of {filteredPages}
            </div>
          </div>
        </div>

        {/* Terms Grid - Responsive */}
        <div className="space-y-4 sm:space-y-6 mb-10">
          {currentTerms.length > 0 ? (
            currentTerms.map((term) => (
              <div 
                key={term.id} 
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Term Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-sm sm:text-lg font-bold">{term.id}</span>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-white/80 bg-white/10 px-2 py-1 rounded-full">
                          Section {term.id}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">{term.title}</h2>
                    </div>
                    <div className="hidden sm:block">
                      <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Term Content */}
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="mb-4 sm:mb-6">
                    <p className="text-slate-700 leading-relaxed text-sm sm:text-base">{term.intro}</p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {term.subSections.map((sub, index) => (
                      <div 
                        key={index} 
                        className="p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-xl sm:rounded-2xl"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                              <span className="text-xs font-bold">{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">{sub.subTitle}</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{sub.content}</p>
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
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No Rules Found</h3>
                <p className="text-slate-600 mb-4">Try searching with different keywords or browse all sections</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Show All Rules
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modern Pagination */}
        {filteredPages > 1 && (
          <div className="sticky bottom-4 z-10">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-200 shadow-xl p-4 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Info */}
                <div className="text-center sm:text-left">
                  <div className="text-sm font-medium text-slate-700">Showing page {currentPage} of {filteredPages}</div>
                  <div className="text-xs text-slate-500">{filteredTerms.length} total rules found</div>
                </div>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center gap-1">
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
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold transition-all ${
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
                    className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Quick Jump */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Go to:</span>
                  <select
                    value={currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
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

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">Important Notice</h4>
              <p className="text-sm text-slate-700">These rules are binding for all students. Parents/guardians must ensure students understand and comply.</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
              <h4 className="font-bold text-emerald-900 mb-2">Last Updated</h4>
              <p className="text-sm text-slate-700">January 6, {new Date().getFullYear()}. Rules reviewed annually and may be updated.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100">
              <h4 className="font-bold text-purple-900 mb-2">Enforcement</h4>
              <p className="text-sm text-slate-700">Rules enforced by school administration. Appeals to be made in writing to Principal's office.</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-xs text-slate-500">
              © 2024 Katwanyaa High School. All rights reserved. 
              <span className="block mt-1">For queries, contact: katzihigh@gmail.com | Tel: 0710 894 145</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}