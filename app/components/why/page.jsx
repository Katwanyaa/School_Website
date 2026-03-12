"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  FiAward, 
  FiBook, 
  FiHeart, 
  FiMapPin, 
  FiUsers, 
  FiCalendar,
  FiShield,
  FiStar,
  FiGlobe,
  FiMail,
  FiPhone,
  FiArrowRight,
  FiBookOpen,
  FiMonitor,
  FiDollarSign,
  FiCpu,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const ModernSchoolLayout = () => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // School images array for carousel
  const schoolImages = [
    { src: "/bg/14.jpeg", alt: "Katwanyaa Senior School - Main Building" },
    { src: "/bg/9.jpeg", alt: "Katwanyaa Senior School - Students" },
    { src: "/hero/katz3.jpeg", alt: "Katwanyaa Senior School - Classroom" },
    { src: "hero/katz8.jpeg", alt: "Katwanyaa Senior School - Sports" }
  ];

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % schoolImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [schoolImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % schoolImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + schoolImages.length) % schoolImages.length);
  };

  const handleExplorePathways = () => {
    router.push("/pages/admissions");
  };

  const handleExplorePathways2 = () => {
    router.push("/pages/apply-for-admissions");
  };

const whyChooseUs = [
  {
    title: "3rd Best School in Matungulu",
    gradient: "from-blue-600 to-indigo-600",
    description: "Ranked third-best public school in Matungulu Sub-county (2019) after Matungulu Girls and Tala High, producing an A- candidate.",
    metrics: "Top Performer 2019",
    icon: <FiAward className="w-4 h-4" />
  },
  {
    title: "KShs 7.2M Infrastructure Boost",
    gradient: "from-blue-600 to-indigo-600",
    description: "KShs 6M ICT donation (50+ laptops from Angaza Centre, 2023) + KShs 1.2M KCB LPG funding (2022) transforming learning and kitchen operations.",
    metrics: "KShs 7.2M Total",
    icon: <FiCpu className="w-4 h-4" />
  },
  {
    title: "County Rugby Champions",
    gradient: "from-blue-600 to-indigo-600",
    description: "Boys' rugby team won Machakos County games (2023), beating St. Augustine 14-0. Two-time national qualifiers under coach Mr. Simiyu.",
    metrics: "14-0 Victory",
    icon: <FiActivity className="w-4 h-4" />
  },
  {
    title: "Environmental Conservation",
    gradient: "from-blue-600 to-indigo-600",
    description: "LPG adoption reduced kitchen expenses by 40% (KShs 700K to KShs 420K per term) and firewood consumption, conserving local trees.",
    metrics: "Trees Conserved",
    icon: <FiTree className="w-4 h-4" />
  }
];
  const schoolFeatures = [
    {
      title: "Academic Excellence Recognition",
      gradient: "from-blue-600 to-indigo-600",
      description: "Named among top improving schools in Matungulu Sub-county (2024) with commendable KCSE results. Produced A- candidate in 2019.",
      highlight: "3rd Best 2019",
      details: ["A- Candidate", "Top Improver 2024", "University Placement", "Merit Awards"],
      metrics: ["A- Grade", "Top 3", "Univ Bound"],
      icon: <FiAward />
    },
    {
      title: "975 Students Enrolled",
      gradient: "from-blue-600 to-indigo-600",
      description: "Currently serving 975 students as a mixed day and boarding school in Matungulu, Machakos County with consistent enrollment growth.",
      highlight: "Growing Enrollment",
      details: ["Mixed Day", "Boarding", "Co-curricular", "Guidance"],
      metrics: ["800+ Std", "Mixed", "Day/Board"],
      icon: <FiUsers />
    },
    {
      title: "ICT Integration Leadership",
      gradient: "from-blue-600 to-indigo-600",
      description: "Received 50+ laptop donation (2023) from Angaza ICT Literacy Centre - the only school in Machakos County selected for this KShs 6M program.",
      highlight: "KShs 6M Donation",
      details: ["50+ Laptops", "1:1 Learning", "Digital Literacy", "ICT Labs"],
      metrics: ["6M KShs", "50+ Devices", "Only School"],
      icon: <FiMonitor />
    },
    {
      title: "KCB LPG Transformation",
      gradient: "from-blue-600 to-indigo-600",
      description: "Beneficiary of KShs 1.2M KCB LPG financing (Sept 2022). Acquired 1,000kg LPG cylinder, reducing kitchen staff from 6 to 4.",
      highlight: "KShs 1.2M Funding",
      details: ["1,000kg Cylinder", "6 to 4 Cooks", "Faster Cooking", "Smoke-Free"],
      metrics: ["1.2M KShs", "40% Less", "4 Cooks"],
      icon: <FiGlobe />
    },
    {
      title: "Spiritual & Moral Formation",
      gradient: "from-blue-600 to-indigo-600",
     description: "Christian values education with weekly worship, annual retreats, and Thursday devotions. Building character through a faith-based approach with our school chaplain, Pastor Samuel Mutie.",    
     highlight: "Values Education",
      details: ["Christian Teachings", "Character Building", "Thursday Devotion", "Retreats"],
      metrics: ["Weekly Worship", "Retreats", "Devotion"],
      icon: <FiHeart />
    },
    {
      title: "University & Career Pathways",
      gradient: "from-blue-700 to-indigo-700",
      description: "Comprehensive career guidance and university preparation programs. Consistent placement of students to Kenyan universities with alumni success.",
      highlight: "University Bound",
      details: ["Career Counseling", "University Placement", "Alumni Network", "Guidance"],
      metrics: ["Univ Bound", "Alumni", "Career"],
      isPremium: true,
      icon: <FiCalendar />
    }
  ];

  return (
    <div className="bg-white py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-8 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
          <section className="mb-16 sm:mb-20 md:mb-24">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[9px] font-black tracking-[0.2em] text-blue-700 uppercase">
                  Katwanyaa Senior School
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Excellence in Education, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Character in Action.
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
                Located in the heart of Matungulu, Machakos County, we are dedicated to nurturing 
                students into confident, compassionate, and accomplished leaders.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-blue-600" size={16} />
                  <span className="text-xs text-slate-600">Matungulu, Machakos County</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-blue-600" size={16} />
                  <span className="text-xs text-slate-600">0710894145</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMail className="text-blue-600" size={16} />
                  <span className="text-xs text-slate-600">katzict@gmail.com</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                {[
                  { label: 'Students', value: '975' },
                  { label: 'Teachers', value: '40+' },
                  { label: 'KShs 6M', value: 'ICT Grant' },
                  { label: 'Motto', value: 'Education is Light' }
                ].map((stat, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-lg font-black text-blue-600">{stat.value}</p>
                    <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Carousel */}
            <div className="relative h-[400px] rounded-[2rem] overflow-hidden shadow-2xl group">
              {/* Images */}
              {schoolImages.map((image, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
              ))}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10"
                aria-label="Previous image"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10"
                aria-label="Next image"
              >
                <FiChevronRight size={24} />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {schoolImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentImageIndex 
                        ? 'w-6 bg-white' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
              
              {/* Caption */}
              <div className="absolute bottom-20 left-6 right-6 z-10">
                <div className="backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20">
                  <p className="text-white text-lg font-black tracking-tight">Katwanyaa Senior School</p>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Education is Light</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- WHY CHOOSE US SECTION - REAL ACHIEVEMENTS --- */}
        <section className="mb-16 sm:mb-20 md:mb-24">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Katz's Senior School Achievements
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
Our school accomplishments from 2019-{new Date().getFullYear()} at Katwanyaa Senior School, Matungulu            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {item.icon}
                </div>
                <h4 className="font-black text-slate-900 text-sm mb-2">{item.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">
                  {item.description}
                </p>
                <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {item.metrics}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* --- SCHOOL FEATURES: BENTO GRID WITH REAL DATA --- */}
        <section>
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Our Educational Pillars
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              Building on real achievements at Katwanyaa Senior School
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {schoolFeatures.map((feature, index) => {
              const spans = ["md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-6"];
              const isDark = feature.isPremium;
              
              return (
                <div 
                  key={index} 
                  className={`${spans[index] || "md:col-span-2"} relative overflow-hidden ${
                    isDark ? 'bg-blue-900 text-white' : 'bg-white text-slate-900'
                  } border ${isDark ? 'border-blue-800' : 'border-slate-200'} rounded-2xl p-5 shadow-sm`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-[0.03] rounded-bl-full`}></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
                      {feature.icon && React.cloneElement(feature.icon, { className: "w-5 h-5" })}
                    </div>

                    <div className="mb-3">
                      <span className={`text-[8px] font-black ${
                        isDark ? 'text-blue-300' : 'text-blue-600'
                      } uppercase tracking-widest mb-1 block`}>
                        {feature.highlight}
                      </span>
                      <h4 className="text-base font-black tracking-tight leading-tight mb-2">
                        {feature.title}
                      </h4>
                      <p className={`${
                        isDark ? 'text-blue-100' : 'text-slate-600'
                      } text-xs leading-relaxed line-clamp-3`}>
                        {feature.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-auto pt-3">
                      {feature.details.map((detail, dIdx) => (
                        <span key={dIdx} className={`px-2 py-0.5 ${
                          isDark ? 'bg-blue-800 text-blue-100' : 'bg-slate-50 text-slate-600'
                        } border ${isDark ? 'border-blue-700' : 'border-slate-100'} rounded-full text-[8px] font-bold uppercase`}>
                          {detail}
                        </span>
                      ))}
                    </div>

                    {isDark && (
                      <div className="mt-4 flex items-center justify-between border-t border-blue-800 pt-4">
                        <button 
                          onClick={handleExplorePathways2} 
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-lg active:scale-95"
                        >
                          Apply Now
                          <FiArrowRight size={12} />
                        </button>
                        <div className="text-blue-300 text-[10px] font-bold">
                          Form 1 2025
                        </div>
                      </div>
                    )}

                    <div className={`mt-4 flex items-center justify-between border-t ${
                      isDark ? 'border-blue-800' : 'border-slate-100'
                    } pt-3`}>
                      {feature.metrics.map((metric, mIdx) => (
                        <div key={mIdx} className="text-center">
                          <p className={`text-xs font-black ${
                            isDark ? 'text-white' : 'text-slate-800'
                          }`}>
                            {metric.split(' ')[0]}
                          </p>
                          <p className={`text-[7px] ${
                            isDark ? 'text-blue-300' : 'text-slate-400'
                          } font-bold uppercase tracking-tight`}>
                            {metric.split(' ').slice(1).join(' ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <button
              onClick={handleExplorePathways}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              Apply for Admissions
              <FiArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* Achievements Summary */}
        <section className="mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="text-sm font-black text-blue-800 mb-3">Our School  Achievements (2019-Present):</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <p className="text-xs font-bold">3rd Best Public School in Matungulu Sub-county (2019) - A- candidate</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <p className="text-xs font-bold">KShs 6M ICT Donation - 50+ laptops from Angaza Centre (2023) - Only school in Machakos</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <p className="text-xs font-bold">KShs 1.2M KCB LPG Funding (2022) - 40% cost reduction (700K → 420K per term)</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <p className="text-xs font-bold">800+ Students enrolled - Mixed day & boarding</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <p className="text-xs font-bold">Environmental Conservation - Reduced firewood usage, staff from 6 to 4 cooks</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <p className="text-xs font-bold">Top Improving School in KCSE (2024) - Matungulu Sub-county</p>
              </div>
            </div>
          </div>
        </section>

        {/* School Info Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-[10px] font-medium">
              © {new Date().getFullYear()} Katwanyaa Senior School. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Education is Light
              </span>
              <span className="text-[9px] text-slate-400">Matungulu, Machakos</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ModernSchoolLayout;