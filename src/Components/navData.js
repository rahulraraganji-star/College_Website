import {
  History,
  Target,
  MessageSquare,
  Users,
  Award,
  Layers,
  BookOpen,
  Building2,
  Network,
  Calendar,
  FileText,
  GraduationCap,
  Trophy,
  HeartHandshake,
  Briefcase,
  School,
  Library,
  Map,
  BarChart3,
  Database,
  Newspaper,
  ClipboardCheck,
  ListChecks,
  Bell,
  RotateCcw,
} from "lucide-react";

export const navData = [
  {
    title: "About Us",
    children: [
      { label: "History", href: "/about/history", icon: History },
      { label: "Vision & Mission", href: "/about/vision-mission", icon: Target },
      { label: "Principal’s Message", href: "/about/principal-message", icon: MessageSquare },
      { label: "Management", href: "/about/management", icon: Users },
      { label: "Accreditation & Certification", href: "/about/accreditation", icon: Award },
      { label: "Best Practices", href: "/about/best-practices", icon: Layers },
      { label: "Institutional Distinctiveness", href: "/about/distinctiveness", icon: BookOpen },
      { label: "Institutional Development Plan", href: "/about/development-plan", icon: Building2 },
    ],
  },

  {
    title: "Administration",
    children: [
      { label: "Organogram", href: "/administration/organogram", icon: Network },
      { label: "College Committees", href: "/administration/committees", icon: Users },
      { label: "Notices & Announcements", href: "/administration/notices", icon: FileText },
    ],
  },

  {
    title: "Student Life",
    children: [
      { label: "Student Support Services", href: "/student-life/support", icon: HeartHandshake },
      { label: "Clubs & Cells", href: "/student-life/clubs", icon: Users },
      { label: "Student Council", href: "/student-life/council", icon: Users },
      { label: "NCC", href: "/student-life/ncc", icon: GraduationCap },
      { label: "NSS", href: "/student-life/nss", icon: HeartHandshake },
      { label: "Sports Facilities", href: "/student-life/sports", icon: Trophy },
      { label: "Placements & Internships", href: "/student-life/placements", icon: Briefcase },
      { label: "Counselling", href: "/student-life/counselling", icon: MessageSquare },
      { label: "Awards & Scholarships", href: "/student-life/awards", icon: Award },
    ],
  },

 {
  title: "Academics",
  children: [
    {
      label: "Programmes & Courses",
      href: "/academics/programmes",
      icon: GraduationCap,
    },
    { label: "Certificate Courses", href: "/academics/certificate-courses", icon: Award },
    { label: "Skill Development Courses", href: "/academics/skill-courses", icon: Layers },
    { label: "Timetable", href: "/academics/timetable", icon: Calendar },
    { label: "Academic Calendar", href: "/academics/calendar", icon: Calendar },
    { label: "Research & Publications", href: "/academics/research", icon: BookOpen },
  ],
},


  {
    title: "Staff",
    children: [
      { label: "Teaching Faculty", href: "/staff/faculty", icon: Users },
      { label: "Non-Teaching Staff", href: "/staff/non-teaching", icon: Users },
    ],
  },

  {
  title: "Admissions",
  children: [
    { label: "e-Prospectus", href: "/admissions/prospectus", icon: FileText },
    { label: "Documents Required", href: "/admissions/documents", icon: ClipboardCheck },
    { label: "Merit Lists", href: "/admissions/merit-list", icon: ListChecks },
    { label: "Admission Notices", href: "/admissions/notices", icon: Bell },
    { label: "Fee Refund Policy", href: "/admissions/refund-policy", icon: RotateCcw },
  ],
},


  {
    title: "Examination",
    children: [
      { label: "Examination Committee", href: "/examination/committee", icon: Users },
      { label: "Ordinances", href: "/examination/ordinances", icon: FileText },
      { label: "Exam Schedule", href: "/examination/schedule", icon: Calendar },
      { label: "Exam Notices", href: "/examination/notices", icon: FileText },
    ],
  },

 {
  title: "IQAC",
  href: "/iqac",
  icon: Award,
},

  {
  title: "Accreditation & Rankings",
  children: [
    { label: "NAAC", href: "/accreditation/naac", icon: Award },
    { label: "NIRF", href: "/accreditation/nirf", icon: BarChart3 },
    { label: "AISHE", href: "/accreditation/aishe", icon: Database },
    { label: "India Today Ranking", href: "/accreditation/india-today", icon: Newspaper },
  ],
},

{
  title: "RTI",
  children: [
    {
      label: "Reservation in Admission and Recruitment – Circulars",
      href: "/rti/reservation-admission-recruitment",
      icon: FileText,
    },
    {
      label: "Divyangjan Policy",
      href: "/rti/divyangjan-policy",
      icon: HeartHandshake,
    },
    {
      label: "University Statutes",
      href: "/rti/university-statutes",
      icon: BookOpen,
    },
    {
      label: "Institutional Information",
      href: "/rti/institutional-information",
      icon: Building2,
    },
    {
      label: "Other Disclosure",
      href: "/rti/other-disclosure",
      icon: Newspaper,
    },
  ],
},



  

  {
    title: "Alumni",
    children: [
      { label: "About Alumni", href: "/alumni/about", icon: Users },
      { label: "Registration", href: "/alumni/registration", icon: FileText },
      { label: "Executive Council", href: "/alumni/executive-council", icon: Users },
      { label: "Activities", href: "/alumni/activities", icon: Calendar },
    ],
  },

  {
    title: "Infrastructure",
    children: [
      { label: "Infrastructure Facilities", href: "/infrastructure/facilities", icon: Building2 },
      { label: "Library", href: "/infrastructure/library", icon: Library },
      { label: "Virtual Tour", href: "/infrastructure/virtual-tour", icon: Map },
    ],
  },

  { title: "Policies", href: "/policies" },
  { title: "Events", href: "/events" },

];
