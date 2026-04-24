'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiAward, FiBook, FiHeart, FiMapPin, FiUsers, FiCalendar,
  FiShield, FiTree, FiStar, FiGlobe, FiMail, FiPhone,
  FiArrowRight, FiBookOpen, FiMonitor, FiDollarSign, FiCpu,
  FiChevronLeft, FiChevronRight, FiChevronDown, FiTarget,
  FiTrendingUp, FiBox, FiThumbsUp, FiCheckCircle, FiBriefcase,
  FiSun, FiCloudRain, FiHome, FiKey, FiInfo, FiCompass,
  FiLayers, FiPenTool, FiActivity, FiDroplet, FiEye, FiX
} from 'react-icons/fi';
import { IoSparkles } from 'react-icons/io5';

const KatwanyaaSeniorSchoolPage = () => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedCards, setExpandedCards] = useState({});
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [pathwayModalOpen, setPathwayModalOpen] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState(null);

  // School images for carousel
  const schoolImages = [
    { src: "/bg/14.jpeg", alt: "Katwanyaa Senior School - Main Campus" },
    { src: "/bg/9.jpeg", alt: "Katwanyaa Senior School - Students in Session" },
    { src: "/hero/st.jpeg", alt: "Katwanyaa Senior School - Classroom Learning" },
    { src: "/hero/student.jpeg", alt: "Katwanyaa Senior School - Student Life" },
    { src: "/hero/env.jpeg", alt: "Katwanyaa Senior School - Environmental Initiatives" },
    { src: "/hero/sports.jpeg", alt: "Katwanyaa Senior School - Sports Activities" },
    { src: "hero/katz8.jpeg", alt: "Katwanyaa Senior School - Achievements Celebration" },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % schoolImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [schoolImages.length]);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % schoolImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + schoolImages.length) % schoolImages.length);

  const toggleReadMore = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExplorePathways = () => router.push("/pages/admissions");
  const handleApplyNow = () => router.push("/pages/apply-for-admissions");

  // Key achievements based on provided data
  const achievementsList = [
    {
      id: 1,
      year: "2019",
      title: "3rd Best School in Matungulu",
      description: "Ranked third-best public school in Matungulu Sub-county (2019) after Katwanyaa senior and Tala High, producing an A- candidate. This achievement marked a significant milestone in our academic journey, demonstrating our commitment to excellence in education and student development.",
      shortDescription: "Ranked third-best public school in Matungulu Sub-county producing an A- candidate.",
      impact: "Top 3 Ranking | A- Candidate | County Recognition",
      stats: "3rd Best | 2019",
      icon: <FiAward className="w-5 h-5" />,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
      image: "/hero/st.jpeg",
      highlights: [
        "Ranked 3rd among public schools in Matungulu Sub-county",
        "Produced an A- candidate",
        "Recognized for academic excellence",
        "Only behind Katwanyaa senior and Tala High"
      ]
    },
    {
      id: 2,
      year: "2022",
      title: "KShs 1.2M KCB LPG Funding",
      description: "KShs 1.2M KCB LPG funding (2022) transforming kitchen operations. This investment has improved kitchen efficiency, reduced costs, and minimized environmental impact through reduced firewood consumption.",
      shortDescription: "KShs 1.2M KCB LPG funding transforming kitchen operations and reducing firewood usage.",
      impact: "40% Cost Reduction | Kitchen Modernization",
      stats: "KShs 1.2M | 2022",
      icon: <FiDollarSign className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
      border: "border-blue-100",
      image: "/hero/env.jpeg",
      highlights: [
        "KShs 1.2 million funding from KCB",
        "LPG adoption for kitchen operations",
        "Reduced kitchen expenses from KShs 700K to KShs 420K per term",
        "Lowered firewood consumption significantly"
      ]
    },
    {
      id: 3,
      year: "2023",
      title: "KShs 6M ICT Donation",
      description: "The school received a KShs 6M ICT donation, including 50+ laptops from Angaza Centre (2023). Katwanyaa is the only school in Machakos County selected for this transformative program, revolutionizing our digital learning capabilities.",
      shortDescription: "KShs 6M ICT donation with 50+ laptops from Angaza Centre - the only school in Machakos County selected.",
      impact: "Digital Transformation | 1:1 Learning Initiative",
      stats: "KShs 6M | 50+ Laptops",
      icon: <FiCpu className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
      border: "border-purple-100",
      image: "/hero/student.jpeg",
      highlights: [
        "KShs 6 million ICT equipment donation",
        "50+ laptops for student use",
        "Only school in Machakos County selected",
        "From Angaza ICT Literacy Centre (2023)"
      ]
    },
    {
      id: 4,
      year: "2024",
      title: "Athletic Excellence",
      description: "A powerhouse in Machakos County sports: Championship-winning Rugby 7s program led by Mr. Simiyu, and elite Basketball squad under Mr. Kioko (Mr. Kim). Both programs are consistent KSSSA regional contenders recognized for discipline and technical skill.",
      shortDescription: "Championship-winning Rugby 7s and elite Basketball squad, consistent KSSSA regional contenders.",
      impact: "County Champions | KSSSA Contenders",
      stats: "Multi-Sport Excellence",
      icon: <FiStar className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      border: "border-green-100",
      image: "/hero/sports.jpeg",
      highlights: [
        "Championship-winning Rugby 7s program led by Mr. Simiyu",
        "Elite Basketball squad under Mr. Kioko (Mr. Kim)",
        "Consistent KSSSA regional contenders",
        "Multiple county championships won"
      ]
    },
    {
      id: 5,
      year: "2024",
      title: "Top Improving School",
      description: "Named among top improving schools in Matungulu Sub-county (2024) with commendable KCSE results. This recognition highlights our commitment to academic growth and excellence.",
      shortDescription: "Recognized as top improving school in Matungulu Sub-county with commendable KCSE results.",
      impact: "Academic Growth | County Recognition",
      stats: "Top Improver 2024",
      icon: <FiTrendingUp className="w-5 h-5" />,
      color: "from-teal-500 to-cyan-500",
      bg: "bg-teal-50",
      border: "border-teal-100",
      image: "/bg/9.jpeg",
      highlights: [
        "Named among top improving schools in Matungulu Sub-county",
        "Commendable KCSE results",
        "Recognized by County Education Office"
      ]
    }
  ];

  // School pillars / features
  const schoolPillars = [
    {
      title: "Academic Excellence",
      description: "Consistently ranked among top schools in Matungulu Sub-county with students achieving university placement. Our academic programs focus on critical thinking and holistic learning.",
      details: ["A- Candidate", "University Placement", "Merit Awards", "Top Improver 2024"],
      icon: <FiBook className="w-5 h-5" />,
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "800+ Students Enrolled",
      description: "Currently serving 800+ students as a mixed day and boarding school in Matungulu, Machakos County with consistent enrollment growth and diverse student body.",
      details: ["Mixed Day", "Boarding", "Co-curricular", "Guidance & Counseling"],
      icon: <FiUsers className="w-5 h-5" />,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "ICT Integration",
      description: "Received 50+ laptop donation (2023) from Angaza ICT Literacy Centre - the only school in Machakos County selected for this KShs 6M program, revolutionizing digital learning.",
      details: ["50+ Laptops", "1:1 Learning", "Digital Literacy", "ICT Labs"],
      icon: <FiMonitor className="w-5 h-5" />,
      gradient: "from-sky-500 to-blue-600"
    },
    {
      title: "Spiritual Formation",
      description: "Christian values education with weekly worship, annual retreats, and Thursday devotions. Building character through a faith-based approach with our school chaplain, Pastor Samuel Mutie.",
      details: ["Christian Teachings", "Character Building", "Thursday Devotion", "Annual Retreats"],
      icon: <FiHeart className="w-5 h-5" />,
      gradient: "from-rose-500 to-pink-500"
    },
    {
      title: "Career Pathways",
      description: "Comprehensive career guidance and university preparation programs. Consistent placement of students to Kenyan universities with an active alumni network supporting current students.",
      details: ["Career Counseling", "University Placement", "Alumni Network", "Guidance"],
      icon: <FiBriefcase className="w-5 h-5" />,
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "Environmental Conservation",
      description: "LPG adoption reduced kitchen expenses by 40% (KShs 700K to KShs 420K per term) and firewood consumption, conserving local trees and promoting eco-friendly practices.",
      details: ["LPG Adoption", "40% Cost Reduction", "Tree Conservation", "Eco-friendly"],
      icon: <FiTree className="w-5 h-5" />,
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  // CBC Pathways Data
  const pathways = [
    {
      id: "stem",
      name: "STEM Pathway",
      icon: FiCpu,
      color: "from-blue-600 to-cyan-500",
      description: "Science, Technology, Engineering & Mathematics",
      subjects: ["Mathematics", "Integrated Science", "Computer Science", "Pre-Technical", "Health Education"],
      careers: [
        "Medical Doctor", "Engineer (Civil, Mechanical, Electrical)", "Software Developer",
        "Data Scientist", "Pharmacist", "Nurse", "Laboratory Technician", "Architect",
        "Surveyor", "ICT Specialist", "Biotechnologist", "Environmental Scientist"
      ]
    },
    {
      id: "arts",
      name: "Arts & Sports",
      icon: FiPenTool,
      color: "from-purple-600 to-pink-500",
      description: "Creative Arts, Performing Arts & Athletic Excellence",
      subjects: ["Visual Arts", "Music", "Physical Education", "Creative Design", "Performing Arts"],
      careers: [
        "Professional Athlete", "Sports Coach", "Music Producer", "Graphic Designer",
        "Fitness Trainer", "Choreographer", "Film Director", "Fashion Designer",
        "Sports Journalist", "Physical Education Teacher", "Artist", "Theatre Manager"
      ]
    },
    {
      id: "social",
      name: "Social Sciences",
      icon: FiGlobe,
      color: "from-amber-600 to-orange-500",
      description: "Humanities, Languages & Civic Education",
      subjects: ["Social Studies", "Religious Education", "Business Studies", "Languages", "Life Skills"],
      careers: [
        "Lawyer", "Teacher", "Journalist", "Psychologist", "Social Worker",
        "Economist", "Human Resource Manager", "Diplomat", "Accountant",
        "Public Administrator", "Counselor", "Business Manager"
      ]
    },
  ];

  const openAchievementModal = (achievement) => {
    setSelectedAchievement(achievement);
    setAchievementModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeAchievementModal = () => {
    setAchievementModalOpen(false);
    setSelectedAchievement(null);
    document.body.style.overflow = "auto";
  };

  const openPathwayModal = (pathway) => {
    setSelectedPathway(pathway);
    setPathwayModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closePathwayModal = () => {
    setPathwayModalOpen(false);
    setSelectedPathway(null);
    document.body.style.overflow = "auto";
  };

  // Quick facts
  const quickFacts = [
    { label: "Location", value: "Matungulu, Machakos County", icon: <FiMapPin className="w-4 h-4" /> },
    { label: "Contact", value: "0710894145", icon: <FiPhone className="w-4 h-4" /> },
    { label: "Email", value: "katzict@gmail.com", icon: <FiMail className="w-4 h-4" /> },
    { label: "Motto", value: "Education is Light", icon: <FiSun className="w-4 h-4" /> },
    { label: "Type", value: "Mixed Day & Boarding", icon: <FiHome className="w-4 h-4" /> },
    { label: "Enrollment", value: "800+ Students", icon: <FiUsers className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-white text-slate-800 min-h-screen">
      {/* ===== HERO SECTION WITH CAROUSEL ===== */}
      <div className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/60" />
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevImage}
          className="absolute left-4 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all"
          aria-label="Previous image"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all"
          aria-label="Next image"
        >
          <FiChevronRight size={24} />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {schoolImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-bold tracking-wider text-white uppercase">Katwanyaa Senior School</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight">
              Excellence in <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Education, Character
              </span>
              <br />in Action.
            </h1>
            <p className="text-base sm:text-lg text-white/80 max-w-xl mt-6 leading-relaxed">
              Located in the heart of Matungulu, Machakos County, we are dedicated to nurturing 
              students into confident, compassionate, and accomplished leaders.
            </p>

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-4 border-t border-white/20">
              {quickFacts.map((fact, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white/80">
                  <div className="p-1.5 bg-white/10 rounded-lg">{fact.icon}</div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">{fact.label}</p>
                    <p className="text-[10px] sm:text-xs font-semibold leading-tight">{fact.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={handleExplorePathways}
                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2"
              >
                Admissions <FiArrowRight size={16} />
              </button>
              <button
                onClick={handleApplyNow}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== VISION & MISSION SECTION ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vision Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <div className="relative bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <FiEye className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Our Vision</h3>
                <p className="text-slate-600 leading-relaxed">
                  To be a center of excellence in nurturing holistic, God-fearing, and academically empowered 
                  students for global leadership and community transformation.
                </p>
              </div>
            </div>

            {/* Mission Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <div className="relative bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <FiTarget className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed">
                  To provide quality education that fosters academic excellence, moral integrity, and personal 
                  growth in a supportive environment, preparing students for lifelong success and service.
                </p>
              </div>
            </div>
          </div>

          {/* Motto Banner */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 mb-2">Our Motto</p>
            <p className="text-2xl md:text-3xl font-black text-slate-800">"Education is Light"</p>
          </div>
        </div>
      </section>

      {/* ===== ACHIEVEMENTS TIMELINE SECTION ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full mb-4">
              <FiAward className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Our Legacy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              School Achievements <span className="text-blue-600">(2019-Present)</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto mt-3">
              Recognized accomplishments that define our commitment to excellence
            </p>
          </div>

          {/* Timeline Grid */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 transform md:-translate-x-1/2" />
            
            <div className="space-y-8">
              {achievementsList.map((item, idx) => (
                <div key={item.id} className={`relative flex flex-col md:flex-row ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-md z-10" />
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div 
                      className={`${item.bg} border ${item.border} rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                      onClick={() => openAchievementModal(item)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[9px] font-black bg-slate-800 text-white px-2 py-0.5 rounded">
                              {item.year}
                            </span>
                            <span className="text-[9px] font-bold text-blue-600 uppercase">{item.stats}</span>
                          </div>
                          <h3 className="font-black text-slate-800 text-base mb-2">{item.title}</h3>
                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{item.shortDescription}</p>
                          <div className="mt-3 text-blue-600 text-[10px] font-bold uppercase flex items-center gap-1">
                            Read More <FiArrowRight size={10} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SCHOOL PILLARS SECTION ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full mb-4">
              <FiShield className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Our Foundation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Educational Pillars
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto mt-3">
              Building on real achievements at Katwanyaa Senior School
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schoolPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-md hover:border-blue-200 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-110 transition-transform`}>
                  {pillar.icon}
                </div>
                <h3 className="font-black text-slate-800 text-lg mb-2">{pillar.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{pillar.description}</p>
                <div className="flex flex-wrap gap-2">
                  {pillar.details.map((detail, didx) => (
                    <span key={didx} className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INFRASTRUCTURE & INVESTMENTS SECTION ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full mb-4">
              <FiTrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Growth & Development</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Significant Investments
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto mt-3">
              Transforming our school through strategic partnerships and infrastructure development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ICT Donation Card */}
            <div className="bg-white rounded-2xl border border-blue-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiMonitor className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/80 uppercase">ICT Transformation</p>
                    <h3 className="text-lg font-black text-white">KShs 6M Donation (2023)</h3>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Received 50+ laptop donation from Angaza ICT Literacy Centre - the only school in Machakos County 
                  selected for this transformative program. This investment has revolutionized our digital learning 
                  capabilities and improved student access to technology.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">50+ Laptops</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">1:1 Learning</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Only School in Machakos</span>
                </div>
              </div>
            </div>

            {/* LPG Funding Card */}
            <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiDollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/80 uppercase">Kitchen Modernization</p>
                    <h3 className="text-lg font-black text-white">KShs 1.2M KCB Funding (2022)</h3>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  KCB LPG funding transformed our kitchen operations, reducing expenses by 40% (from KShs 700K to 
                  KShs 420K per term) and significantly lowering firewood consumption, contributing to environmental 
                  conservation.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">40% Cost Reduction</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Reduced Firewood</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">6→4 Cooks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Impact Note */}
          <div className="mt-6 bg-teal-50 border border-teal-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <FiTree className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-teal-800 text-sm mb-1">Environmental Conservation Impact</h4>
                <p className="text-teal-700 text-sm">
                  LPG adoption has significantly reduced our carbon footprint, conserved local trees previously used for firewood, 
                  and improved kitchen efficiency with reduced cooking staff from 6 to 4.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SPORTS EXCELLENCE SECTION ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full mb-4">
                <FiStar className="w-4 h-4 text-green-600" />
                <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">Athletic Excellence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                Champions in <span className="text-green-600">Sports</span>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Katwanyaa Senior School is a powerhouse in Machakos County sports, featuring our championship-winning 
                Rugby 7s program led by Mr. Simiyu, and our elite Basketball squad under the tactical leadership of 
                Mr. Kioko (Mr. Kim). Both programs are consistent KSSSA regional contenders recognized for discipline 
                and technical skill. Our athletes have won multiple county championships and produced several regional 
                representatives.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex-1">
                  <p className="font-black text-green-700 text-sm">Rugby 7s</p>
                  <p className="text-[10px] text-green-600">Led by Mr. Simiyu • County Champions</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex-1">
                  <p className="font-black text-green-700 text-sm">Basketball</p>
                  <p className="text-[10px] text-green-600">Led by Mr. Kioko • KSSSA Contenders</p>
                </div>
              </div>
            </div>
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/hero/sports.jpeg"
                alt="Katwanyaa Senior School Sports"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-sm">🏆 Multi-Sport Champions</p>
                <p className="text-white/80 text-[10px]">KSSSA Regional Contenders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CBC PATHWAYS SECTION ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full mb-4">
              <FiBookOpen className="w-4 h-4 text-purple-600" />
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">CBC Framework</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Learning <span className="text-purple-600">Pathways</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto mt-3">
              The Competency Based Curriculum organizes learning around three main pathways
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pathways.map((path, idx) => {
              const PathIcon = path.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  onClick={() => openPathwayModal(path)}
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${path.color}`} />
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center text-white shadow-md mb-4`}>
                      <PathIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-slate-800 text-lg mb-2">{path.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">{path.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {path.subjects.slice(0, 3).map((subj, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] font-bold uppercase">
                          {subj}
                        </span>
                      ))}
                      {path.subjects.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] font-bold">
                          +{path.subjects.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-purple-600 text-[10px] font-bold uppercase">
                      Explore Careers <FiArrowRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Core Subjects */}
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
            <h4 className="font-bold text-slate-800 text-md mb-4 flex items-center gap-2">
              <FiLayers className="text-blue-600" />
              Mandatory Core Subjects
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {["Mathematics", "English", "Kiswahili", "Integrated Science", "Social Studies", "Religious Education", "Creative Arts", "Agriculture", "Life Skills", "Physical Education"].map((subject, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <FiBook className="text-blue-500 text-xs" />
                  <span className="text-[11px] font-medium text-slate-700">{subject}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Join Katwanyaa Senior School?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Take the first step towards academic excellence and character development.
            Applications for Form One 2025 are now open.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleApplyNow}
              className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:bg-slate-100 transition-all active:scale-95"
            >
              Apply for Admission
            </button>
            <button
              onClick={handleExplorePathways}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-xl font-bold text-sm tracking-wide hover:bg-white/10 transition-all"
            >
              Request Info
            </button>
          </div>
        </div>
      </section>

      {/* ===== ACHIEVEMENT MODAL ===== */}
      {achievementModalOpen && selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeAchievementModal}>
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${selectedAchievement.color} p-5 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {selectedAchievement.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">{selectedAchievement.year}</span>
                      <h3 className="font-bold text-lg">{selectedAchievement.title}</h3>
                    </div>
                  </div>
                </div>
                <button onClick={closeAchievementModal} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[70vh] p-6">
              {selectedAchievement.image && (
                <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4">
                  <Image src={selectedAchievement.image} alt={selectedAchievement.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{selectedAchievement.stats}</span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{selectedAchievement.impact}</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">{selectedAchievement.description}</p>
              {selectedAchievement.highlights && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" /> Key Highlights
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedAchievement.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="text-green-500">✓</span> {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== PATHWAY MODAL ===== */}
      {pathwayModalOpen && selectedPathway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closePathwayModal}>
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${selectedPathway.color} p-5 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {React.createElement(selectedPathway.icon, { className: "w-5 h-5" })}
                  </div>
                  <h3 className="font-bold text-lg">{selectedPathway.name}</h3>
                </div>
                <button onClick={closePathwayModal} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[70vh] p-6">
              <p className="text-slate-600 text-sm mb-4">{selectedPathway.description}</p>
              <div className="mb-4">
                <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                  <FiBook className="text-blue-500" /> Core Subjects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPathway.subjects.map((subject, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium">{subject}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                  <FiBriefcase className="text-green-500" /> Career Paths
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedPathway.careers.map((career, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5">
                      <div className="w-1 h-1 rounded-full bg-green-500" />
                      <span className="text-xs text-slate-600">{career}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Katwanyaa Senior School</p>
          <p className="text-xs text-slate-400">Matungulu, Machakos County | Tel: 0710894145 | Email: katzict@gmail.com</p>
          <p className="text-[9px] text-slate-500 mt-3">© {new Date().getFullYear()} Katwanyaa Senior School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default KatwanyaaSeniorSchoolPage;