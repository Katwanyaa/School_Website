'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiInfo, 
  FiBook, 
  FiUserPlus,
  FiCalendar,
  FiImage,
  FiMail,
  FiUsers,
  FiFileText,
  FiChevronDown,
  FiBriefcase,
  FiChevronRight,
  FiLock,
  FiDollarSign,
  FiGrid,
  FiStar,
  FiTrendingUp,
  FiAward,
  FiShield
} from 'react-icons/fi';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BsFillFastForwardBtnFill } from 'react-icons/bs';

export default function ModernNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAcademicDropdownOpen, setIsAcademicDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isMobileResourcesDropdownOpen, setIsMobileResourcesDropdownOpen] = useState(false);
  
  const academicDropdownRef = useRef(null);
  const resourcesDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const mobileResourcesDropdownRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
        setIsMobileDropdownOpen(false);
        setIsMobileResourcesDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (academicDropdownRef.current && !academicDropdownRef.current.contains(event.target)) {
        setIsAcademicDropdownOpen(false);
      }
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(event.target)) {
        setIsResourcesDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setIsMobileDropdownOpen(false);
      }
      if (mobileResourcesDropdownRef.current && !mobileResourcesDropdownRef.current.contains(event.target)) {
        setIsMobileResourcesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Main navigation - ORIGINAL TEXT SIZES PRESERVED
  const mainNavigation = [
    { 
      name: 'Home', 
      href: '/', 
      icon: FiHome,
      exact: true
    },
    { 
      name: 'About', 
      href: '/pages/AboutUs',
      icon: FiInfo
    },
    { 
      name: 'Academics', 
      href: '/pages/academics',
      icon: FiBook,
      hasDropdown: true
    },
    { 
      name: 'Admissions', 
      href: '/pages/admissions',
      icon: FiUserPlus
    },
    { 
      name: 'Gallery', 
      href: '/pages/gallery', 
      icon: FiImage 
    },
    { 
      name: 'News & Events', 
      href: '/pages/eventsandnews', 
      icon: FiCalendar 
    },
    { 
      name: 'Contact', 
      href: '/pages/contact', 
      icon: FiMail 
    },
    { 
      name: 'Fees', 
      href: '/pages/fees', 
      icon: FiDollarSign 
    },
  ];

  const academicDropdownItems = [
    {
      name: 'Student Portal',
      href: '/pages/StudentPortal',
      icon: FiFileText,
      description: 'Access grades, assignments & resources',
      badge: 'Active'
    },
    {
      name: 'Guidance & Counselling',
      href: '/pages/Guidance-and-Councelling',
      icon: FiUsers,
      description: 'Student support & mental wellness',
      badge: 'New'
    },
    {
      name: 'Achievements',
      href: '/pages/Achievements',
      icon: FiAward,
      description: 'Recognizing excellence',
      badge: 'Featured'
    },
    {
      name: 'Alumni Network',
      href: 'https://www.facebook.com/groups/414008468611340/',
      icon: FiUserPlus,
      description: 'Connect with former students',
      badge: 'Join'
    },
    {
      name: 'School Rules',
      href: '/pages/OurSchoolPolicies',
      icon: FiShield,
      description: 'Policies & guidelines',
      badge: 'Updated'
    }
  ];

  // Resources dropdown items - INCLUDES ADMIN LOGIN
  const resourcesDropdownItems = [
    {
      name: 'Staff Directory',
      href: '/pages/staff',
      icon: FiUsers,
      description: 'Meet our dedicated team',
      badge: '37 members'
    },
    {
      name: 'Careers',
      href: '/pages/careers',
      icon: FiBriefcase,
      description: 'Join our family',
      badge: "We're hiring"
    },
    {
      name: 'Admin Login',
      href: '/pages/adminLogin',
      icon: FiLock,
      description: 'Secure staff portal access',
      badge: 'Restricted',
      isHighlighted: true
    }
  ];

  // Function to check if a link is active
  const isActiveLink = (href, exact = false) => {
    if (!pathname) return false;
    if (href === '/') {
      return pathname === '/';
    }
    if (exact) {
      return pathname === href;
    }
    return pathname && pathname.startsWith(href);
  };

  // Navigation handlers
  const handleLogoClick = () => {
    window.location.href = '/';
  };

  const handleLogoKeyDown = (e) => {
    if (e.key === 'Enter') {
      window.location.href = '/';
    }
  };

  return (
    <>
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 backdrop-blur-lg shadow-xl border-b border-white/10' 
            : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 shadow-lg'
        }`}
      >
        <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[4.5rem] sm:min-h-[5.2rem]">
            
            {/* Logo Section - Mobile Responsive */}
            <div 
              className="flex items-center gap-2 xs:gap-3 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              onKeyDown={handleLogoKeyDown}
            >
              <div className="relative w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 
                bg-white/20 rounded-lg xs:rounded-xl flex items-center justify-center 
                shadow-lg border border-white/30 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <Image
                  src="/katz.jpeg"
                  alt="Katwanyaa Senior School Logo"
                  width={48}
                  height={48}
                  className="relative z-10 filter drop-shadow-sm group-hover:scale-100 transition-transform duration-300 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14"
                  priority
                  sizes="(max-width: 480px) 48px, (max-width: 640px) 56px, 64px"
                />
              </div>
              <div className="sm:block">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent whitespace-nowrap tracking-tight">
                   Katz
                </h1>
                <p className="text-xs sm:text-sm text-white/90 font-medium tracking-wide whitespace-nowrap">
                  Education is Light
                </p>
              </div>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center justify-center flex-1 mx-8 min-w-0">
              <div className="flex items-center justify-between w-full max-w-7xl gap-1">
                {mainNavigation.map((item) => {
                  const isActive = isActiveLink(item.href, item.exact);
                  
                  if (item.hasDropdown) {
                    return (
                      <div 
                        key={item.name} 
                        className="relative"
                        ref={academicDropdownRef}
                        onMouseEnter={() => setIsAcademicDropdownOpen(true)}
                        onMouseLeave={() => setIsAcademicDropdownOpen(false)}
                      >
                        <button
                          className={`group flex items-center gap-0.5 xs:gap-1 font-bold transition-all text-[0.78rem] xs:text-[0.85rem] uppercase tracking-wide whitespace-nowrap px-2 xs:px-2.5 py-2 relative ${
                            isActive || isAcademicDropdownOpen
                              ? 'text-white' 
                              : 'text-white/85 hover:text-white'
                          }`}
                          aria-expanded={isAcademicDropdownOpen}
                          aria-haspopup="true"
                        >
                          <item.icon className="text-xs flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                          <FiChevronDown className={`text-xs transition-transform duration-200 ${
                            isAcademicDropdownOpen ? 'rotate-180' : ''
                          }`} />
                          
                          {/* Active underline indicator */}
                          {(isActive || isAcademicDropdownOpen) && (
                            <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></span>
                          )}
                        </button>

                        {/* Academic Dropdown Menu - INCREASED HEIGHT on large screens only */}
                        {isAcademicDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 w-[500px] lg:w-[600px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                            {/* Header Section */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                              <h3 className="font-bold text-white text-[0.7rem] uppercase tracking-wider flex items-center gap-1.5">
                                <FiBook className="text-white text-xs" />
                                Academic Resources
                              </h3>
                              <p className="text-blue-100 text-[0.65rem] mt-0.5">Explore our academic resources and opportunities</p>
                            </div>
                            
                            {/* Grid Layout for Items - INCREASED HEIGHT on large screens */}
                            <div className="grid grid-cols-2 gap-2 p-3 lg:p-4 lg:min-h-[280px]">
                              {academicDropdownItems.map((dropdownItem) => (
                                <a
                                  key={dropdownItem.name}
                                  href={dropdownItem.href}
                                  className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-md bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border border-gray-100 hover:border-blue-200"
                                  onClick={() => setIsAcademicDropdownOpen(false)}
                                >
                                  <div className="p-2.5 lg:p-3">
                                    <div className="flex items-start gap-2.5">
                                      <div className="flex-shrink-0">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                                          <dropdownItem.icon className="text-xs" />
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                          <h4 className="font-semibold text-gray-800 text-xs group-hover:text-blue-700 transition-colors">
                                            {dropdownItem.name}
                                          </h4>
                                          {dropdownItem.badge && (
                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white whitespace-nowrap">
                                              {dropdownItem.badge}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-gray-500 text-[0.65rem] mt-0.5 line-clamp-2">
                                          {dropdownItem.description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/5 group-hover:to-indigo-600/5 transition-all duration-300"></div>
                                </a>
                              ))}
                              
                              {/* Zeraki Analytics Special Card */}
                              <a 
                                href="https://analytics.zeraki.app/" 
                                className="group relative col-span-2 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-md bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-300"
                                onClick={() => setIsAcademicDropdownOpen(false)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <div className="p-2.5 lg:p-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                                      <img 
                                        src="/zeraki.jpg" 
                                        alt="Zeraki Analytics" 
                                        className="w-4 h-4 rounded-md"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-800 text-xs">Zeraki Analytics</h4>
                                        <span className="text-[9px] font-bold px-1 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                          External
                                        </span>
                                      </div>
                                      <p className="text-gray-600 text-[0.65rem] mt-0.5">Advanced learning analytics and performance tracking</p>
                                    </div>
                                    <FiChevronRight className="text-purple-400 text-sm opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                                  </div>
                                </div>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center gap-0.5 xs:gap-1 font-bold transition-all text-[0.78rem] xs:text-[0.85rem] uppercase tracking-wide whitespace-nowrap px-2 xs:px-2.5 py-2 relative ${
                        isActive 
                          ? 'text-white' 
                          : 'text-white/85 hover:text-white'
                      }`}
                    >
                      <item.icon className="text-xs flex-shrink-0 group-hover:scale-100 transition-transform" />
                      <span className="truncate">{item.name}</span>
                      
                      {/* Active underline indicator */}
                      {isActive && (
                        <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-5 h-0.5 bg-white rounded-full"></span>
                      )}
                      
                      {/* Hover underline indicator */}
                      <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white/50 rounded-full group-hover:w-5 transition-all duration-300"></span>
                    </a>
                  );
                })}
                
                {/* Resources Dropdown - INCREASED HEIGHT on large screens */}
                <div 
                  className="relative"
                  ref={resourcesDropdownRef}
                  onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                  onMouseLeave={() => setIsResourcesDropdownOpen(false)}
                >
                  <button
                    className={`group flex items-center gap-0.5 xs:gap-1 font-bold transition-all text-[0.78rem] xs:text-[0.85rem] uppercase tracking-wide whitespace-nowrap px-2 xs:px-2.5 py-2 relative ${
                      isResourcesDropdownOpen || 
                      isActiveLink('/pages/staff') || 
                      isActiveLink('/pages/career') ||
                      isActiveLink('/pages/adminLogin')
                        ? 'text-white' 
                        : 'text-white/85 hover:text-white'
                    }`}
                    aria-expanded={isResourcesDropdownOpen}
                    aria-haspopup="true"
                  >
                    <FiGrid className="text-xs flex-shrink-0" />
                    <span className="truncate">Resources</span>
                    <FiChevronDown className={`text-xs transition-transform duration-200 ${
                      isResourcesDropdownOpen ? 'rotate-180' : ''
                    }`} />
                    
                    {/* Active underline indicator */}
                    {(isResourcesDropdownOpen || 
                      isActiveLink('/pages/staff') || 
                      isActiveLink('/pages/career') ||
                      isActiveLink('/pages/adminLogin')) && (
                      <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></span>
                    )}
                  </button>

                  {/* Resources Dropdown Menu - INCREASED HEIGHT on large screens */}
                  {isResourcesDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-[400px] lg:w-[500px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
                        <h3 className="font-bold text-white text-[0.7rem] uppercase tracking-wider flex items-center gap-1.5">
                          <FiGrid className="text-white text-xs" />
                          Resources & Administration
                        </h3>
                        <p className="text-purple-100 text-[0.65rem] mt-0.5">Essential tools and information for our community</p>
                      </div>
                      
                      {/* Items - INCREASED HEIGHT on large screens */}
                      <div className="p-3 lg:p-4 lg:min-h-[280px] space-y-1.5">
                        {resourcesDropdownItems.map((dropdownItem) => (
                          <a
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className={`group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-md block ${
                              dropdownItem.isHighlighted
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-300'
                                : 'bg-white border border-gray-100 hover:border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                            }`}
                            onClick={() => setIsResourcesDropdownOpen(false)}
                          >
                            <div className="p-2.5 lg:p-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`flex-shrink-0 ${
                                  dropdownItem.isHighlighted
                                    ? 'w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500'
                                    : 'w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500'
                                } flex items-center justify-center text-white shadow-md`}>
                                  <dropdownItem.icon className="text-xs" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className={`font-semibold text-xs ${
                                      dropdownItem.isHighlighted ? 'text-blue-700' : 'text-gray-800 group-hover:text-purple-700'
                                    } transition-colors`}>
                                      {dropdownItem.name}
                                    </h4>
                                    {dropdownItem.badge && (
                                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full whitespace-nowrap ${
                                        dropdownItem.isHighlighted
                                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                      }`}>
                                        {dropdownItem.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-500 text-[0.65rem] mt-0.5">
                                    {dropdownItem.description}
                                  </p>
                                </div>
                                <FiChevronRight className={`text-sm opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 ${
                                  dropdownItem.isHighlighted ? 'text-blue-400' : 'text-purple-400'
                                }`} />
                              </div>
                            </div>
                            {dropdownItem.isHighlighted && (
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            )}
                          </a>
                        ))}
                      </div>
                      
                      {/* Footer note */}
                      <div className="border-t border-gray-100 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100">
                        <p className="text-gray-500 text-[0.6rem] text-center font-medium">
                          🔒 Secure access for authorized personnel only
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu Button - Responsive */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 xs:p-3 rounded-lg xs:rounded-xl text-white 
                bg-white/15 hover:bg-white/25 transition-all active:scale-95 ml-auto"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <FiX className="text-xl xs:text-2xl sm:text-3xl" />
              ) : (
                <FiMenu className="text-xl xs:text-2xl sm:text-3xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Responsive (unchanged text sizes) */}
        {isOpen && (
          <div className="lg:hidden bg-gradient-to-b from-blue-700 to-purple-800 border-t border-white/10">
            <div className="px-3 xs:px-4 sm:px-6 py-6 xs:py-8 max-w-2xl mx-auto">
              {/* Mobile Navigation */}
              <div className="space-y-1.5 xs:space-y-2 mb-6 xs:mb-8">
                {mainNavigation.map((item) => {
                  const isActive = isActiveLink(item.href, item.exact);
                  
                  if (item.hasDropdown) {
                    return (
                      <div key={item.name} className="space-y-1.5 xs:space-y-2" ref={mobileDropdownRef}>
                        <button
                          onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                          className={`w-full flex items-center justify-between p-3 xs:p-4 rounded-lg xs:rounded-xl text-left ${
                            isActive || isMobileDropdownOpen
                              ? 'bg-white/20 text-white'
                              : 'text-white/90 hover:bg-white/10'
                          }`}
                          aria-expanded={isMobileDropdownOpen}
                        >
                          <div className="flex items-center gap-2 xs:gap-3">
                            <item.icon className="text-lg xs:text-xl" />
                            <span className="font-bold text-base xs:text-lg uppercase tracking-wide">{item.name}</span>
                          </div>
                          <FiChevronDown className={`text-lg xs:text-xl transition-transform duration-200 ${
                            isMobileDropdownOpen ? 'rotate-180' : ''
                          }`} />
                        </button>
                        
                        {/* Mobile Academic Dropdown Items */}
                        {isMobileDropdownOpen && (
                          <div className="ml-6 xs:ml-8 space-y-1.5 xs:space-y-2 pl-3 xs:pl-4 border-l-2 border-white/20">
                            {academicDropdownItems.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                href={dropdownItem.href}
                                className={`flex items-center gap-2 xs:gap-3 p-2.5 xs:p-3 rounded-lg ${
                                  isActiveLink(dropdownItem.href)
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/80 hover:bg-white/10'
                                }`}
                                onClick={() => {
                                  setIsOpen(false);
                                  setIsMobileDropdownOpen(false);
                                }}
                              >
                                <dropdownItem.icon className="text-base xs:text-lg" />
                                <div className="flex-1">
                                  <span className="font-medium text-sm xs:text-base">{dropdownItem.name}</span>
                                  <p className="text-[10px] xs:text-xs text-white/60">{dropdownItem.description}</p>
                                </div>
                                {dropdownItem.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">
                                    {dropdownItem.badge}
                                  </span>
                                )}
                              </a>
                            ))}
                            
                            {/* Zeraki Link for Mobile */}
                            <a
                              href="https://analytics.zeraki.app/"
                              className="flex items-center gap-2 xs:gap-3 p-2.5 xs:p-3 rounded-lg text-white/80 hover:bg-white/10"
                              onClick={() => {
                                setIsOpen(false);
                                setIsMobileDropdownOpen(false);
                              }}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div className="w-5 h-5 xs:w-6 xs:h-6 flex-shrink-0">
                                <img 
                                  src="/zeraki.jpg" 
                                  alt="Zeraki Analytics" 
                                  className="w-full h-full object-cover rounded-md border border-white/30"
                                />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-sm xs:text-base">Zeraki Analytics</span>
                                <p className="text-[10px] xs:text-xs text-white/60">Learning analytics platform</p>
                              </div>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 xs:gap-3 p-3 xs:p-4 rounded-lg xs:rounded-xl ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="text-lg xs:text-xl" />
                      <span className="font-bold text-base xs:text-lg uppercase tracking-wide">{item.name}</span>
                    </a>
                  );
                })}

                {/* Mobile Resources Dropdown (Staff, Careers & Admin Login) */}
                <div className="space-y-1.5 xs:space-y-2" ref={mobileResourcesDropdownRef}>
                  <button
                    onClick={() => setIsMobileResourcesDropdownOpen(!isMobileResourcesDropdownOpen)}
                    className={`w-full flex items-center justify-between p-3 xs:p-4 rounded-lg xs:rounded-xl text-left ${
                      isMobileResourcesDropdownOpen ||
                      isActiveLink('/pages/staff') ||
                      isActiveLink('/pages/career') ||
                      isActiveLink('/pages/adminLogin')
                        ? 'bg-white/20 text-white'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                    aria-expanded={isMobileResourcesDropdownOpen}
                  >
                    <div className="flex items-center gap-2 xs:gap-3">
                      <FiGrid className="text-lg xs:text-xl" />
                      <span className="font-bold text-base xs:text-lg uppercase tracking-wide">Resources</span>
                    </div>
                    <FiChevronDown className={`text-lg xs:text-xl transition-transform duration-200 ${
                      isMobileResourcesDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {/* Mobile Resources Dropdown Items */}
                  {isMobileResourcesDropdownOpen && (
                    <div className="ml-6 xs:ml-8 space-y-1.5 xs:space-y-2 pl-3 xs:pl-4 border-l-2 border-white/20">
                      {resourcesDropdownItems.map((dropdownItem) => (
                        <a
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className={`flex items-center gap-2 xs:gap-3 p-2.5 xs:p-3 rounded-lg ${
                            isActiveLink(dropdownItem.href)
                              ? dropdownItem.isHighlighted
                                ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white'
                                : 'bg-white/20 text-white'
                              : dropdownItem.isHighlighted
                                ? 'text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-indigo-500/20'
                                : 'text-white/80 hover:bg-white/10'
                          }`}
                          onClick={() => {
                            setIsOpen(false);
                            setIsMobileResourcesDropdownOpen(false);
                          }}
                        >
                          <dropdownItem.icon className="text-base xs:text-lg" />
                          <div className="flex-1">
                            <span className={`font-medium text-sm xs:text-base ${dropdownItem.isHighlighted ? 'font-bold' : ''}`}>
                              {dropdownItem.name}
                            </span>
                            <p className="text-[10px] xs:text-xs text-white/60">{dropdownItem.description}</p>
                          </div>
                          {dropdownItem.badge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              dropdownItem.isHighlighted
                                ? 'bg-blue-500 text-white'
                                : 'bg-purple-500 text-white'
                            }`}>
                              {dropdownItem.badge}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Footer - Responsive */}
              <div className="mt-6 xs:mt-8 pt-4 xs:pt-6 border-t border-white/20 text-center">
                <p className="text-white/70 text-xs xs:text-sm font-medium">
                  Education is light
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed nav - Responsive */}
      <div className="h-[4.5rem] xs:h-20 sm:h-22 lg:h-24 transition-all duration-300"></div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}