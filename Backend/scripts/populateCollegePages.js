import dotenv from "dotenv";
import connectDB from "../database/connect.js";
import Page from "../models/page.js";
import NavigationItem from "../models/NavigationItem.js";
import NavigationMenu from "../models/NavigationMenu.js";

dotenv.config();

// Helper to generate unique section IDs
const generateSectionId = () => `sec_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;

// Master List of Consolidated Navigation Menus (9 Menus)
const navigationMenusData = [
  { key: "about", title: "About Us", order: 1, isActive: true, showInNavbar: true },
  { key: "academics", title: "Academics", order: 2, isActive: true, showInNavbar: true },
  { key: "admissions", title: "Admissions", order: 3, isActive: true, showInNavbar: true },
  { key: "staff", title: "Staff", order: 4, isActive: true, showInNavbar: true },
  { key: "examination", title: "Examination", order: 5, isActive: true, showInNavbar: true },
  { key: "iqac", title: "IQAC & Accreditation", order: 6, isActive: true, showInNavbar: true },
  { key: "research", title: "Research & Innovation", order: 7, isActive: true, showInNavbar: true },
  { key: "student-life", title: "Student Life", order: 8, isActive: true, showInNavbar: true },
  { key: "campus-alumni", title: "Campus & Alumni", order: 9, isActive: true, showInNavbar: true }
];

// Helper to construct BA/BCOM/BCA course data
const getBcaCourseData = () => ({
  general: {
    courseName: "Bachelor of Computer Applications (B.C.A.)",
    courseCode: "BCA",
    degree: "Bachelor of Computer Applications",
    level: "Undergraduate",
    duration: "3 Years",
    semesters: "6",
    department: "Department of Computer Science & Applications",
    intake: "60 Seats",
    eligibility: "10+2 with Mathematics / Computer Science / Statistics (Min 45% aggregate)",
    shortDescription: "A comprehensive undergraduate programme providing in-depth software development skills, database architecture, cloud systems, and modern computing paradigms."
  },
  overview: {
    description: "The Bachelor of Computer Applications (BCA) programme is designed to bridge the gap between academic theory and practical software engineering. Adhering to the Choice Based Credit System (CBCS), it covers structured programming, web architecture, mobile applications, and enterprise database systems.",
    learningOutcomes: [
      "Demonstrate competency in modern programming languages (C++, Java, Python, JavaScript).",
      "Architect and normalize relational and NoSQL databases for scalable systems.",
      "Design responsive full-stack applications following clean architecture principles.",
      "Apply algorithmic problem solving and quantitative reasoning to real-world software development."
    ],
    careerOpportunities: [
      "Full-Stack Web Developer",
      "Software Applications Engineer",
      "Database Administrator / Data Analyst",
      "Cloud Operations Associate",
      "Quality Assurance & Test Automation Specialist"
    ]
  },
  highlights: [
    { title: "3 Years", description: "Full-time 6 semester degree programme" },
    { title: "140 Credits", description: "Choice Based Credit System (CBCS) aligned" },
    { title: "Hands-on Labs", description: "1:1 computer ratio in modern high-spec laboratories" },
    { title: "Capstone Project", description: "Industry-sponsored final year software development project" }
  ],
  curriculum: [
    {
      id: "year-1",
      yearNumber: 1,
      yearName: "First Year",
      subtitle: "Foundations of Computing & Programming",
      semesters: [
        {
          id: "sem-1",
          semesterNumber: 1,
          semesterName: "Semester I",
          subjects: [
            {
              id: "sub-101",
              name: "Problem Solving & C Programming",
              type: "Theory + Practical",
              credits: 4,
              syllabus: [
                { unitNumber: 1, title: "Algorithms & Flowcharts", topics: ["Pseudocode", "Flowcharting symbols", "Complexity basics"] },
                { unitNumber: 2, title: "C Fundamentals", topics: ["Data types", "Control statements", "Loops", "Functions"] },
                { unitNumber: 3, title: "Pointers & Arrays", topics: ["1D/2D Arrays", "Dynamic memory allocation", "Pointer arithmetic"] }
              ]
            },
            {
              id: "sub-102",
              name: "Digital Logic & Computer Architecture",
              type: "Theory",
              credits: 4,
              syllabus: [
                { unitNumber: 1, title: "Number Systems & Boolean Algebra", topics: ["Binary/Hex arithmetic", "Karnaugh maps", "Logic gates"] },
                { unitNumber: 2, title: "Combinational & Sequential Circuits", topics: ["Multiplexers", "Decoders", "Flip-flops", "Registers"] }
              ]
            }
          ]
        },
        {
          id: "sem-2",
          semesterNumber: 2,
          semesterName: "Semester II",
          subjects: [
            {
              id: "sub-201",
              name: "Data Structures & Algorithms",
              type: "Theory + Practical",
              credits: 4,
              syllabus: [
                { unitNumber: 1, title: "Linear Data Structures", topics: ["Arrays", "Stacks", "Queues", "Linked lists"] },
                { unitNumber: 2, title: "Non-Linear Structures & Sorting", topics: ["Binary Trees", "Graphs", "Quick sort", "Merge sort"] }
              ]
            },
            {
              id: "sub-202",
              name: "Database Management Systems",
              type: "Theory + Practical",
              credits: 4,
              syllabus: [
                { unitNumber: 1, title: "Relational Data Model & SQL", topics: ["DDL/DML", "Joins", "ER diagrams", "Normalization (1NF-3NF)"] },
                { unitNumber: 2, title: "Transaction Management", topics: ["ACID properties", "Concurrency control", "Indexing"] }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "year-2",
      yearNumber: 2,
      yearName: "Second Year",
      subtitle: "Web Technologies & Object-Oriented Paradigms",
      semesters: [
        {
          id: "sem-3",
          semesterNumber: 3,
          semesterName: "Semester III",
          subjects: [
            {
              id: "sub-301",
              name: "Object-Oriented Programming with Java",
              type: "Theory + Practical",
              credits: 4,
              syllabus: [
                { unitNumber: 1, title: "Java OOP Core", topics: ["Classes", "Inheritance", "Polymorphism", "Interfaces"] },
                { unitNumber: 2, title: "Exception Handling & Collections", topics: ["Try-Catch", "Generics", "ArrayList", "HashMap"] }
              ]
            },
            {
              id: "sub-302",
              name: "Web Development Technologies",
              type: "Theory + Practical",
              credits: 4,
              syllabus: [
                { unitNumber: 1, title: "Frontend Stack", topics: ["HTML5", "CSS3 Grid/Flexbox", "JavaScript ES6+"] },
                { unitNumber: 2, title: "Responsive Design & DOM", topics: ["Event handling", "DOM manipulation", "Async Fetch API"] }
              ]
            }
          ]
        },
        {
          id: "sem-4",
          semesterNumber: 4,
          semesterName: "Semester IV",
          subjects: [
            {
              id: "sub-401",
              name: "Python Programming & Data Analysis",
              type: "Theory + Practical",
              credits: 4,
              syllabus: [
                { unitNumber: 1, title: "Python Basics & Modules", topics: ["Data structures", "List comprehensions", "Functions"] },
                { unitNumber: 2, title: "Data Libraries", topics: ["NumPy arrays", "Pandas dataframes", "Matplotlib visualization"] }
              ]
            },
            {
              id: "sub-402",
              name: "Computer Networks & Security",
              type: "Theory",
              credits: 4,
              syllabus: [
                { unitNumber: 1, title: "Network Models & Protocols", topics: ["OSI 7 Layers", "TCP/IP suite", "Subnetting", "Routing"] },
                { unitNumber: 2, title: "Cybersecurity Essentials", topics: ["Cryptography", "Firewalls", "TLS/SSL", "Web security"] }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "year-3",
      yearNumber: 3,
      yearName: "Third Year",
      subtitle: "Advanced Technologies & Capstone Project",
      semesters: [
        {
          id: "sem-5",
          semesterNumber: 5,
          semesterName: "Semester V",
          subjects: [
            {
              id: "sub-501",
              name: "Cloud Computing & DevOps",
              type: "Theory + Practical",
              credits: 4,
              syllabus: [
                { unitNumber: 1, title: "Cloud Architectures", topics: ["IaaS/PaaS/SaaS", "AWS/Azure fundamentals", "Virtualization"] },
                { unitNumber: 2, title: "Containerization & CI/CD", topics: ["Docker containers", "Git workflows", "Build pipelines"] }
              ]
            },
            {
              id: "sub-502",
              name: "Mobile Application Development",
              type: "Theory + Practical",
              credits: 4,
              syllabus: [
                { unitNumber: 1, title: "Mobile Frameworks", topics: ["React Native / Flutter basics", "Component state lifecycle"] },
                { unitNumber: 2, title: "Device APIs & Storage", topics: ["AsyncStorage", "REST API integration", "Deployment"] }
              ]
            }
          ]
        },
        {
          id: "sem-6",
          semesterNumber: 6,
          semesterName: "Semester VI",
          subjects: [
            {
              id: "sub-601",
              name: "Major Capstone Project & Viva",
              type: "Practical / Project",
              credits: 6,
              syllabus: [
                { unitNumber: 1, title: "System Analysis & Specification", topics: ["Requirement engineering", "System architecture", "ER & Class diagrams"] },
                { unitNumber: 2, title: "Implementation & Defense", topics: ["Full-stack code deployment", "Testing & Documentation", "Viva examination"] }
              ]
            }
          ]
        }
      ]
    }
  ]
});

const getBcomCourseData = () => ({
  general: {
    courseName: "Bachelor of Commerce (B.Com)",
    courseCode: "BCOM",
    degree: "Bachelor of Commerce",
    level: "Undergraduate",
    duration: "3 Years",
    semesters: "6",
    department: "Department of Commerce & Management Studies",
    intake: "120 Seats",
    eligibility: "10+2 Commerce / Arts / Science with min 45% aggregate",
    shortDescription: "A comprehensive commerce degree designed to equip students with accounting mastery, corporate law, taxation, investment banking, and business analytics."
  },
  overview: {
    description: "The B.Com programme offers rigorous academic preparation in financial accounting, cost accounting, corporate taxation, auditing, and organizational management. The curriculum incorporates contemporary FinTech modules and GST compliance.",
    learningOutcomes: [
      "Prepare and analyze consolidated financial statements in compliance with GAAP and Ind-AS standards.",
      "Calculate direct and indirect tax liabilities, including GST and corporate income tax.",
      "Evaluate capital budgeting, investment portfolios, and corporate finance strategies.",
      "Understand the legal and regulatory frameworks governing Indian businesses."
    ],
    careerOpportunities: [
      "Financial Analyst / Auditor",
      "Tax Consultant (GST & Direct Tax)",
      "Accountant / Financial Controller",
      "Banking & Insurance Executive",
      "Corporate Investment Trainee"
    ]
  },
  highlights: [
    { title: "3 Years", description: "6 Semesters with industry internship options" },
    { title: "GST & Tally", description: "Hands-on computerised accounting training" },
    { title: "CA/CMA Aligned", description: "Curriculum designed to facilitate professional exam prep" },
    { title: "Placement Track", description: "Regular recruitment drives by top financial firms" }
  ],
  curriculum: [
    {
      id: "year-1",
      yearNumber: 1,
      yearName: "First Year",
      subtitle: "Financial & Business Basics",
      semesters: [
        {
          id: "sem-1",
          semesterNumber: 1,
          semesterName: "Semester I",
          subjects: [
            { id: "sub-bc101", name: "Financial Accounting I", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Accounting Standards", topics: ["Concepts", "Conventions", "Trial balance", "Final accounts"] }] },
            { id: "sub-bc102", name: "Business Economics (Micro)", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Consumer Behavior", topics: ["Demand analysis", "Elasticity", "Cost & Production"] }] }
          ]
        },
        {
          id: "sem-2",
          semesterNumber: 2,
          semesterName: "Semester II",
          subjects: [
            { id: "sub-bc201", name: "Financial Accounting II", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Special Accounting", topics: ["Hire purchase", "Branch accounts", "Partnership accounts"] }] },
            { id: "sub-bc202", name: "Business Law & Contracts", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Indian Contract Act 1872", topics: ["Offer", "Acceptance", "Discharge of contract"] }] }
          ]
        }
      ]
    },
    {
      id: "year-2",
      yearNumber: 2,
      yearName: "Second Year",
      subtitle: "Corporate Accounts, Costing & Taxation",
      semesters: [
        {
          id: "sem-3",
          semesterNumber: 3,
          semesterName: "Semester III",
          subjects: [
            { id: "sub-bc301", name: "Corporate Accounting", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Company Accounts", topics: ["Issue of shares", "Debentures", "Valuation of goodwill"] }] },
            { id: "sub-bc302", name: "Income Tax Law & Practice", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Heads of Income", topics: ["Salaries", "House property", "PGBP deductions"] }] }
          ]
        },
        {
          id: "sem-4",
          semesterNumber: 4,
          semesterName: "Semester IV",
          subjects: [
            { id: "sub-bc401", name: "Cost Accounting Principles", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Cost Elements", topics: ["Material", "Labor", "Overheads", "Cost sheets"] }] },
            { id: "sub-bc402", name: "Goods and Services Tax (GST)", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Indirect Tax Regime", topics: ["CGST/SGST/IGST", "Input tax credit", "Returns"] }] }
          ]
        }
      ]
    },
    {
      id: "year-3",
      yearNumber: 3,
      yearName: "Third Year",
      subtitle: "Financial Management & Auditing",
      semesters: [
        {
          id: "sem-5",
          semesterNumber: 5,
          semesterName: "Semester V",
          subjects: [
            { id: "sub-bc501", name: "Financial Management", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Capital Structure", topics: ["Working capital", "Cost of capital", "Dividend policy"] }] },
            { id: "sub-bc502", name: "Principles of Auditing", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Audit Process", topics: ["Internal check", "Vouching", "Audit report"] }] }
          ]
        },
        {
          id: "sem-6",
          semesterNumber: 6,
          semesterName: "Semester VI",
          subjects: [
            { id: "sub-bc601", name: "Business Analytics & FinTech", type: "Theory + Practical", credits: 4, syllabus: [{ unitNumber: 1, title: "Financial Modeling", topics: ["Excel modeling", "Financial ratios", "Digital payments"] }] }
          ]
        }
      ]
    }
  ]
});

const getBaCourseData = () => ({
  general: {
    courseName: "Bachelor of Arts (B.A.)",
    courseCode: "BA",
    degree: "Bachelor of Arts",
    level: "Undergraduate",
    duration: "3 Years",
    semesters: "6",
    department: "Department of Humanities & Social Sciences",
    intake: "100 Seats",
    eligibility: "10+2 in any stream (Arts / Science / Commerce) with min 45% aggregate",
    shortDescription: "A multidisciplinary liberal arts programme offering majors in English Literature, Economics, Psychology, and Sociology."
  },
  overview: {
    description: "The Bachelor of Arts (B.A.) programme fosters critical inquiry, linguistic fluency, social awareness, and research capabilities across literature, economics, psychology, and public policy.",
    learningOutcomes: [
      "Synthesize critical arguments and write cohesive analytical essays.",
      "Analyze socioeconomic trends and macroeconomic policy impacts.",
      "Understand psychological principles and behavioural dynamics.",
      "Examine societal structures, cultural phenomena, and historical developments."
    ],
    careerOpportunities: [
      "Civil Services & Public Administration",
      "Content Strategist / Journalist / Editor",
      "Corporate Communications & PR Specialist",
      "Human Resource Executive / NGO Coordinator",
      "Higher Studies in M.A. / M.S.W. / M.B.A."
    ]
  },
  highlights: [
    { title: "3 Years", description: "Choice Based Credit System (CBCS)" },
    { title: "4 Specializations", description: "English, Economics, Psychology, Sociology" },
    { title: "Creative Labs", description: "Language lab, psychology observation room" },
    { title: "Research Seminar", description: "Annual student humanities symposium & paper presentation" }
  ],
  curriculum: [
    {
      id: "year-1",
      yearNumber: 1,
      yearName: "First Year",
      subtitle: "Core Humanities Foundations",
      semesters: [
        {
          id: "sem-1",
          semesterNumber: 1,
          semesterName: "Semester I",
          subjects: [
            { id: "sub-ba101", name: "English Literature & Critical Thought", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Poetry & Prose", topics: ["Renaissance to Romantic poetry", "Short story analysis"] }] },
            { id: "sub-ba102", name: "Principles of Microeconomics", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Economic Models", topics: ["Supply & Demand", "Consumer utility", "Market structures"] }] }
          ]
        },
        {
          id: "sem-2",
          semesterNumber: 2,
          semesterName: "Semester II",
          subjects: [
            { id: "sub-ba201", name: "Foundations of Psychology", type: "Theory + Practical", credits: 4, syllabus: [{ unitNumber: 1, title: "Cognitive Processes", topics: ["Perception", "Memory", "Learning theories"] }] },
            { id: "sub-ba202", name: "Introduction to Sociology", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Social Institutions", topics: ["Family", "Culture", "Social stratification"] }] }
          ]
        }
      ]
    },
    {
      id: "year-2",
      yearNumber: 2,
      yearName: "Second Year",
      subtitle: "Specialized Discipline Studies",
      semesters: [
        {
          id: "sem-3",
          semesterNumber: 3,
          semesterName: "Semester III",
          subjects: [
            { id: "sub-ba301", name: "Indian Writing in English", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Modern Indian Literature", topics: ["Tagore", "R.K. Narayan", "Contemporary Indian poetry"] }] },
            { id: "sub-ba302", name: "Macroeconomics & Monetary Policy", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "National Income", topics: ["GDP metrics", "Inflation", "Fiscal policy"] }] }
          ]
        },
        {
          id: "sem-4",
          semesterNumber: 4,
          semesterName: "Semester IV",
          subjects: [
            { id: "sub-ba401", name: "Developmental Psychology", type: "Theory + Practical", credits: 4, syllabus: [{ unitNumber: 1, title: "Lifespan Development", topics: ["Childhood", "Adolescence", "Social development"] }] }
          ]
        }
      ]
    },
    {
      id: "year-3",
      yearNumber: 3,
      yearName: "Third Year",
      subtitle: "Advanced Seminar & Dissertation",
      semesters: [
        {
          id: "sem-5",
          semesterNumber: 5,
          semesterName: "Semester V",
          subjects: [
            { id: "sub-ba501", name: "Literary Theory & Criticism", type: "Theory", credits: 4, syllabus: [{ unitNumber: 1, title: "Modern Theories", topics: ["Formalism", "Post-colonialism", "Feminism"] }] }
          ]
        },
        {
          id: "sem-6",
          semesterNumber: 6,
          semesterName: "Semester VI",
          subjects: [
            { id: "sub-ba601", name: "Undergraduate Dissertation", type: "Research Project", credits: 6, syllabus: [{ unitNumber: 1, title: "Independent Inquiry", topics: ["Literature review", "Qualitative research", "Thesis presentation"] }] }
          ]
        }
      ]
    }
  ]
});

// Master Directory Data for the Programmes page (Courses Directory template)
const getCoursesDirectoryData = () => ({
  courses: [
    {
      id: "bca",
      slug: "bca",
      courseName: "Bachelor of Computer Applications (B.C.A.)",
      courseCode: "BCA",
      level: "Undergraduate",
      duration: "3 Years",
      semesters: "6",
      mode: "Full Time",
      shortDescription: "Master full-stack software development, cloud computing, database engineering, and modern web architectures.",
      overview: {
        description: "The BCA programme provides industry-aligned software engineering education, practical lab masterclasses, and capstone project experience."
      },
      highlights: [
        { title: "3 Years", description: "6 Semesters Full-time" },
        { title: "140 Credits", description: "CBCS Compliant" }
      ],
      curriculum: getBcaCourseData().curriculum
    },
    {
      id: "bcom",
      slug: "bcom",
      courseName: "Bachelor of Commerce (B.Com)",
      courseCode: "B.Com",
      level: "Undergraduate",
      duration: "3 Years",
      semesters: "6",
      mode: "Full Time",
      shortDescription: "Specialized training in financial accounting, corporate taxation, auditing, FinTech, and investment analysis.",
      overview: {
        description: "The B.Com programme prepares students for successful careers in chartered accountancy, corporate finance, and banking."
      },
      highlights: [
        { title: "3 Years", description: "6 Semesters Full-time" },
        { title: "CA Aligned", description: "Facilitates professional exam prep" }
      ],
      curriculum: getBcomCourseData().curriculum
    },
    {
      id: "ba",
      slug: "ba",
      courseName: "Bachelor of Arts (B.A.)",
      courseCode: "B.A.",
      level: "Undergraduate",
      duration: "3 Years",
      semesters: "6",
      mode: "Full Time",
      shortDescription: "Multidisciplinary degree with majors in English Literature, Economics, Psychology, and Sociology.",
      overview: {
        description: "The B.A. programme nurtures critical thinking, creative writing, socioeconomic analysis, and research methodologies."
      },
      highlights: [
        { title: "3 Years", description: "6 Semesters Full-time" },
        { title: "4 Majors", description: "English, Economics, Psychology, Sociology" }
      ],
      curriculum: getBaCourseData().curriculum
    }
  ]
});

// Master Pages Data Definition with Rich Variety of Section Editors
const pagesData = [
  // =========================================================================
  // 1. ABOUT US (parentSlug: "about")
  // =========================================================================
  {
    title: "History & Heritage",
    slug: "history",
    parentSlug: "about",
    template: "default",
    icon: "Landmark",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "History & Heritage",
        subheading: "A legacy of educational excellence, holistic character formation, and community service since 1985.",
        height: "medium",
        alignment: "center",
        overlay: 40
      },
      {
        id: generateSectionId(),
        type: "heading",
        text: "Founding & Institutional Journey",
        level: "h2",
        alignment: "left"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Four Decades of Academic Distinction",
        content: "<p>Established with a profound commitment to providing transformative higher education, Fr. Agnel College has grown from humble beginnings into a premier centre of learning. Rooted in values of integrity, compassion, and academic rigour, the institution empowers students from diverse socioeconomic backgrounds to achieve intellectual distinction and ethical leadership.</p><p>Over the decades, the college has expanded its infrastructure, introduced multidisciplinary undergraduate and postgraduate programmes, and cultivated vibrant industry and research collaborations while retaining its core ethos of inclusive, student-centric education.</p>"
      },
      {
        id: generateSectionId(),
        type: "timeline",
        title: "Key Institutional Milestones",
        events: [
          { year: "1985", title: "Foundation Established", description: "College founded with initial faculties in Arts and Commerce." },
          { year: "1995", title: "Permanent Affiliation & Expansion", description: "Received permanent university affiliation and expanded laboratory facilities." },
          { year: "2005", title: "Computer Science & IT Launch", description: "Introduced the BCA and Information Technology departments." },
          { year: "2015", title: "First Cycle NAAC Accreditation", description: "Accredited with an 'A' grade in recognition of quality education and infrastructure." },
          { year: "2023", title: "Innovation & Incubation Hub", description: "Established Institution's Innovation Council and state-of-the-art multimedia centre." }
        ]
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Enduring Institutional Values",
        items: [
          { label: "Truth & Integrity", description: "Uncompromising ethical standards in academic inquiry, governance, and student life." },
          { label: "Excellence & Innovation", description: "Pursuit of highest standards in pedagogy, scientific research, and artistic expression." },
          { label: "Compassion & Social Justice", description: "Dedication to community service, environmental stewardship, and uplifting the underprivileged." }
        ]
      }
    ]
  },
  {
    title: "Vision and Mission",
    slug: "vision-mission",
    parentSlug: "about",
    template: "default",
    icon: "Compass",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Vision & Mission",
        subheading: "Guiding principles that define our educational philosophy and institutional commitments.",
        height: "medium",
        alignment: "center"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Institutional Vision Statement",
        content: "<p>To be an exemplary institution of higher education dedicated to nurturing intellectually enlightened, ethically upright, and socially responsible citizens who contribute meaningfully to sustainable global progress.</p>"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Core Mission Pillars",
        items: [
          { label: "Academic Excellence", description: "Provide high-quality education through innovative teaching, research, and industry-aligned experiential learning." },
          { label: "Holistic Development", description: "Foster intellectual curiosity, ethical consciousness, emotional resilience, and aesthetic sensibility in every learner." },
          { label: "Inclusivity & Access", description: "Ensure equitable access to modern education regardless of gender, social standing, or economic background." },
          { label: "Community Engagement", description: "Inculcate civic responsibility through proactive outreach, environmental stewardship, and social service." }
        ]
      }
    ]
  },
  {
    title: "Principal's Message",
    slug: "principals-message",
    parentSlug: "about",
    template: "default",
    icon: "User",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Principal's Message",
        subheading: "Welcoming students, faculty, and stakeholders to our dynamic academic community.",
        height: "medium",
        alignment: "center"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Inspiring Excellence, Igniting Potential",
        content: "<p>Dear Students, Parents, and Well-Wishers,</p><p>It is my privilege to welcome you to Fr. Agnel College — an institution synonymous with academic vigour, character development, and inclusive growth. In an era characterised by swift technological transformation and evolving societal needs, our college stands steadfast in providing an education that harmonises foundational knowledge with futuristic skills.</p><p>We believe that higher education is not merely a pathway to employment, but a transformative journey of self-discovery, critical inquiry, and civic contribution. Our distinguished faculty, state-of-the-art laboratories, expansive library, and rich co-curricular ecosystem are designed to ignite your passions and hone your talents.</p><p>I encourage every student to embrace opportunities, engage enthusiastically in research and extracurriculars, and uphold the timeless values of integrity and empathy.</p><p><strong>Dr. Francis Fernandes, Ph.D.</strong><br>Principal & Professor</p>"
      }
    ]
  },
  {
    title: "Management & Governance",
    slug: "management",
    parentSlug: "about",
    template: "default",
    icon: "Building2",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Management & Governance",
        subheading: "Visionary leadership and administrative stewardship steering our educational mission.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "faculty-grid",
        title: "Board of Trustees & Executive Leadership",
        departments: [
          {
            name: "Governing Board of Trustees",
            faculty: [
              {
                name: "Rev. Fr. Superior General",
                designation: "President & Patron",
                qualification: "Ph.D. in Educational Leadership",
                experience: "25+ Years",
                email: "president@college.edu",
                phone: "+91 832 2740001",
                specialization: "Institutional Vision & Ethics"
              },
              {
                name: "Rev. Fr. Local Manager",
                designation: "Managing Trustee & Local Superior",
                qualification: "M.A., M.Ed",
                experience: "20 Years",
                email: "manager@college.edu",
                phone: "+91 832 2740002",
                specialization: "Campus Administration & Welfare"
              },
              {
                name: "Dr. Francis Fernandes",
                designation: "Principal & Member Secretary",
                qualification: "Ph.D., M.Sc.",
                experience: "22 Years",
                email: "principal@college.edu",
                phone: "+91 832 2740003",
                specialization: "Academic Governance & Research"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: "Organogram",
    slug: "organogram",
    parentSlug: "about",
    template: "default",
    icon: "Network",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Administrative Organogram",
        subheading: "Hierarchical governance and decision-making framework of the college.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Administrative Hierarchy",
        items: [
          { label: "1. Governing Board / Management Trust", description: "Apex governing body responsible for policy formulation and institutional vision." },
          { label: "2. Principal & Vice Principal", description: "Chief Executive and Academic Officers overseeing daily academic and administrative operations." },
          { label: "3. IQAC & Academic Council", description: "Quality assurance cell ensuring compliance with accreditation parameters and curriculum delivery." },
          { label: "4. Heads of Departments (HoDs)", description: "Academic coordinators leading faculty teams, curriculum planning, and student evaluations." },
          { label: "5. Registrar & Office Administration", description: "Head of administrative services managing admissions, accounts, records, and student facilitation." }
        ]
      }
    ]
  },
  {
    title: "College Committees",
    slug: "committees",
    parentSlug: "about",
    template: "default",
    icon: "Users",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Statutory & Functional Committees",
        subheading: "Dedicated bodies ensuring transparent, student-centric, and disciplined campus governance.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Key Administrative Committees",
        headers: ["Committee Name", "Convenor / In-Charge", "Frequency of Meetings", "Primary Role"],
        rows: [
          ["Internal Quality Assurance Cell (IQAC)", "Dr. Anita Rao", "Quarterly", "Overall academic quality enhancement"],
          ["Anti-Ragging Committee", "Prof. Rajesh Sharma", "As needed / Term start", "Zero tolerance campus safety"],
          ["Internal Complaints Committee (ICC)", "Dr. Meenakshi Verma", "Bi-annual / On demand", "Prevention of sexual harassment & gender parity"],
          ["Grievance Redressal Cell", "Prof. Kevin D'Souza", "Monthly", "Addressing student and staff grievances"],
          ["Examination Committee", "Dr. Sunil Patil", "Continuous / Exam cycle", "Conduct of fair end-semester exams"],
          ["Library Advisory Committee", "Mr. Pradeep Joshi", "Bi-annual", "Procurement of books, journals & e-resources"]
        ]
      }
    ]
  },
  {
    title: "Institutional Policies",
    slug: "college-policies",
    parentSlug: "about",
    template: "default",
    icon: "ShieldAlert",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Institutional Policies & Code of Ethics",
        subheading: "Statutory policies establishing ethical, transparent, and sustainable institutional practices.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Core Governance Policies",
        items: [
          { label: "Green Campus & Environmental Sustainability", description: "Zero single-use plastics, 100kW solar energy generation, and comprehensive rainwater harvesting." },
          { label: "IT & Acceptable Cyber Usage", description: "Guidelines safeguarding digital access, campus Wi-Fi integrity, and student data privacy." },
          { label: "Gender Sensitization & Prevention of Sexual Harassment", description: "Zero tolerance framework following POSH Act norms with an active Internal Complaints Committee." },
          { label: "Research Ethics, Plagiarism & IPR", description: "Ensuring academic honesty, Turnitin similarity checks, and institutional patent facilitation." }
        ]
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Policy Documents (PDF)",
        documents: [
          { title: "Green Campus & Environmental Sustainability Policy", date: "2023-08-10", type: "PDF" },
          { title: "Information Technology & Acceptable Cyber Usage Policy", date: "2023-08-15", type: "PDF" },
          { title: "Gender Sensitization & POSH Policy Dossier", date: "2023-08-20", type: "PDF" },
          { title: "Research Ethics & Plagiarism Code", date: "2023-09-01", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "Best Practices",
    slug: "best-practices",
    parentSlug: "about",
    template: "default",
    icon: "Sparkles",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Institutional Best Practices",
        subheading: "Innovative methodologies and sustainable models embedded into our daily academic life.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Best Practice 1: Experiential Learning & Skill Augmentation",
        content: "<p><strong>Title:</strong> Multidisciplinary Skill Matrix & Experiential Internships</p><p><strong>Objectives:</strong> To equip undergraduate students with practical technical and interpersonal skills beyond prescribed university curricula, ensuring career readiness and entrepreneurial confidence.</p><p><strong>Implementation:</strong> The college mandates a modular 30-hour certificate course in each academic year, offers industry-guided live capstone projects, and facilitates summer internships through our dedicated Industry-Academia Cell.</p>"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Best Practice 2: Green Campus & Community Outreach",
        content: "<p><strong>Title:</strong> Eco-Conscious Campus Operations & Village Empowerment</p><p><strong>Objectives:</strong> To foster ecological responsibility and community upliftment through active student participation.</p><p><strong>Implementation:</strong> Solar power generation covering 40% of campus electricity, rainwater harvesting, zero single-use plastic policy, and regular village literacy and health camps conducted by NSS and NCC units.</p>"
      }
    ]
  },
  {
    title: "Institutional Distinctiveness",
    slug: "institutional-distinctiveness",
    parentSlug: "about",
    template: "default",
    icon: "Target",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Institutional Distinctiveness",
        subheading: "The unique ethos that sets our educational experience apart.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Empowerment Through Value-Based Inclusive Mentorship",
        content: "<p>Fr. Agnel College is distinct in its holistic <strong>Mentor-Mentee System</strong>, where every faculty member actively mentors a cohort of 20 students throughout their degree tenure. This personal care encompasses academic advising, emotional counselling, financial aid guidance, and career planning.</p><p>By intentionally bridging academic excellence with empathetic human values, the institution empowers first-generation learners and high achievers alike to realize their fullest human potential.</p>"
      }
    ]
  },
  {
    title: "Institutional Development Plan",
    slug: "institutional-development-plan",
    parentSlug: "about",
    template: "default",
    icon: "FileText",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Institutional Development Plan (IDP)",
        subheading: "Strategic roadmap for infrastructural, pedagogical, and research expansion (2024–2029).",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "timeline",
        title: "Strategic IDP Roadmap (2024–2029)",
        events: [
          { year: "Phase I (2024–25)", title: "Smart Classroom 2.0 & AI Lab", description: "Upgrading all lecture theatres with interactive hybrid screens and establishing an AI/ML research hub." },
          { year: "Phase II (2025–26)", title: "Interdisciplinary Research Complex", description: "Setting up central computing clusters and multi-departmental data analytics centres." },
          { year: "Phase III (2026–28)", title: "International University MoUs", description: "Launching dual-credit student exchange programs with premier foreign institutions." },
          { year: "Phase IV (2028–29)", title: "Autonomous College Status", description: "Applying for full academic autonomy under UGC guidelines to design tailored industry curricula." }
        ]
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Download Strategic Plans",
        documents: [
          { title: "Institutional Development Plan Document (2024–2029)", date: "2024-02-15", type: "PDF" }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. ACADEMICS (parentSlug: "academics")
  // =========================================================================
  {
    title: "Programmes and Courses",
    slug: "programmes",
    parentSlug: "academics",
    template: "courses",
    icon: "GraduationCap",
    courseData: getCoursesDirectoryData()
  },
  {
    title: "Bachelor of Computer Applications (BCA)",
    slug: "bca",
    parentSlug: "academics",
    template: "courses",
    icon: "Code",
    courseData: getBcaCourseData()
  },
  {
    title: "Bachelor of Commerce (B.Com)",
    slug: "bcom",
    parentSlug: "academics",
    template: "courses",
    icon: "TrendingUp",
    courseData: getBcomCourseData()
  },
  {
    title: "Bachelor of Arts (BA)",
    slug: "ba",
    parentSlug: "academics",
    template: "courses",
    icon: "BookOpen",
    courseData: getBaCourseData()
  },
  {
    title: "Certificate Courses",
    slug: "certificate-courses",
    parentSlug: "academics",
    template: "default",
    icon: "CheckCircle",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Add-On Certificate Courses",
        subheading: "Short-term value-added courses designed for skill enhancement and industry readiness.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Current Value-Added Certificate Offerings",
        headers: ["Course Name", "Department", "Duration (Hours)", "Eligibility", "Certification By"],
        rows: [
          ["Digital Marketing & SEO", "Computer Science", "30 Hours", "All Students", "College + Industry Partner"],
          ["Applied Data Analytics with Power BI", "Computer Science", "36 Hours", "BCA / B.Com", "College & Tech Cell"],
          ["GST Filing & Corporate Accounting", "Commerce", "30 Hours", "B.Com / Arts", "Commerce Department"],
          ["Business Communication & Soft Skills", "Humanities", "30 Hours", "All Students", "Language Lab"],
          ["Web Development with React & Node", "Computer Science", "40 Hours", "BCA / CS", "IT Department"]
        ]
      }
    ]
  },
  {
    title: "Skill Development Courses",
    slug: "skill-courses",
    parentSlug: "academics",
    template: "default",
    icon: "Wrench",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Skill Development Courses",
        subheading: "Hands-on vocational and employability workshops empowering future professionals.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Specialized Skill Tracks",
        items: [
          { label: "Cybersecurity & Ethical Hacking Essentials", description: "Hands-on threat analysis, packet inspection, and web vulnerability mitigation." },
          { label: "Financial Modeling & Algorithmic Trading", description: "Excel macros, portfolio simulation, and financial ratio evaluation." },
          { label: "Content Creation & Multimedia Editing", description: "Video editing, podcast production, and graphic design fundamentals." }
        ]
      }
    ]
  },
  {
    title: "Academic Timetable",
    slug: "timetable",
    parentSlug: "academics",
    template: "default",
    icon: "Calendar",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Class Timetables",
        subheading: "Access semester-wise lecture, practical, and tutorial schedules for all streams.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Semester Timetable Downloads (PDF)",
        documents: [
          { title: "BCA Semester I, III, V Timetable (Odd Sem 2024-25)", date: "2024-07-01", type: "PDF" },
          { title: "B.Com Semester I, III, V Timetable (Odd Sem 2024-25)", date: "2024-07-01", type: "PDF" },
          { title: "B.A. Semester I, III, V Timetable (Odd Sem 2024-25)", date: "2024-07-01", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "Academic Calendar",
    slug: "academic-calendar",
    parentSlug: "academics",
    template: "default",
    icon: "Clock",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Academic Calendar",
        subheading: "Important dates for term commencement, examinations, vacations, and cultural festivals.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Academic Term Schedule 2024–2025",
        headers: ["Event / Activity", "Commencement Date", "Conclusion Date", "Remarks"],
        rows: [
          ["Odd Semester Commencement", "15 June 2024", "15 June 2024", "Orientation & Induction Week"],
          ["First Mid-Term Tests", "12 August 2024", "18 August 2024", "Continuous Internal Assessment"],
          ["Annual Sports Gala", "20 September 2024", "22 September 2024", "Inter-Department Competitions"],
          ["Odd Semester End Exams", "15 October 2024", "10 November 2024", "University End Semester Exams"],
          ["Winter Break", "11 November 2024", "30 November 2024", "Vacation period"],
          ["Even Semester Commencement", "02 December 2024", "02 December 2024", "Lectures resume"]
        ]
      }
    ]
  },

  // =========================================================================
  // 3. ADMISSIONS (parentSlug: "admissions")
  // =========================================================================
  {
    title: "e-Prospectus",
    slug: "prospectus",
    parentSlug: "admissions",
    template: "default",
    icon: "BookOpen",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Admission e-Prospectus",
        subheading: "Everything you need to know regarding admissions, scholarships, fees, and code of conduct.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Welcome Prospective Students",
        content: "<p>The annual college e-Prospectus provides comprehensive insights into programme offerings, credit distribution, fee structures, eligibility criteria, and college rules. We welcome students from all backgrounds into our vibrant learning family.</p>"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Admission Highlights",
        items: [
          { label: "Transparent Merit-Based Counselling", description: "Online seat allotment complying with state reservation quotas and university merit guidelines." },
          { label: "Merit & Need Scholarships", description: "Endowment funds and tuition waivers available for academic toppers and financially weak students." },
          { label: "Dedicated Help Desk", description: "On-campus and virtual admission support to assist candidates throughout the application process." }
        ]
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Download Official Prospectus",
        documents: [
          { title: "Academic Prospectus & Student Guidebook (2024–2025)", date: "2024-05-10", type: "PDF" },
          { title: "Fee Structure Handbook & Scholarship Catalog", date: "2024-05-12", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "List of Documents Required",
    slug: "documents",
    parentSlug: "admissions",
    template: "default",
    icon: "FileCheck",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Documents Required for Admission",
        subheading: "Checklist of verified certificates and paperwork needed during admission counselling.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Mandatory Document Checklist",
        items: [
          { label: "1. 10th (SSC) Marksheet & Passing Certificate", description: "Original + 3 attested photocopies for age proof." },
          { label: "2. 12th (HSSC) Marksheet & Leaving Certificate", description: "Original + 3 attested photocopies." },
          { label: "3. Transfer Certificate (TC) / Migration Certificate", description: "Mandatory for students from other boards/universities." },
          { label: "4. Domicile & Caste Certificate (If applicable)", description: "Issued by competent government revenue authority." },
          { label: "5. Recent Passport Size Photographs", description: "4 recent color photographs with white background." }
        ]
      }
    ]
  },
  {
    title: "Merit Lists",
    slug: "merit-lists",
    parentSlug: "admissions",
    template: "default",
    icon: "ListOrdered",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Admission Merit Lists",
        subheading: "Round-wise merit cutoff lists and seat allotment notifications.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Merit List Announcements (2024-25)",
        documents: [
          { title: "BCA First Merit List & Fee Payment Notice", date: "2024-06-20", type: "PDF" },
          { title: "B.Com First Merit List & Document Verification Schedule", date: "2024-06-20", type: "PDF" },
          { title: "B.A. First Merit List (All Categories)", date: "2024-06-21", type: "PDF" },
          { title: "BCA Second Round Merit List (Vacant Seats)", date: "2024-06-28", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "Admissions Notices",
    slug: "admission-notices",
    parentSlug: "admissions",
    template: "default",
    icon: "Bell",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Admission Circulars & Notices",
        subheading: "Latest updates regarding application deadlines, counselling, and spot admissions.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Active Admission Circulars",
        items: [
          { label: "Extension of Online Application Window", description: "Online registration portal extended till 30 June 2024 for remaining seats." },
          { label: "Spot Admission Round for BCA & B.Com", description: "In-person spot counselling scheduled for eligible waitlisted candidates on 5 July 2024." }
        ]
      }
    ]
  },
  {
    title: "Fee Refund Policy",
    slug: "fee-refund-policy",
    parentSlug: "admissions",
    template: "default",
    icon: "Receipt",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Fee Refund Policy",
        subheading: "Transparent fee deduction and refund guidelines in adherence to UGC regulations.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "UGC Norms Refund Slab Matrix",
        headers: ["Time of Withdrawal Notice", "Percentage Refund of Aggregate Fees", "Deduction Amount"],
        rows: [
          ["15 days or more before admission last date", "100%", "Max ₹1,000 processing fee"],
          ["Less than 15 days before admission last date", "90%", "10% deduction"],
          ["Within 15 days after admission last date", "80%", "20% deduction"],
          ["Between 16 and 30 days after last date", "50%", "50% deduction"],
          ["More than 30 days after admission last date", "0% (Caution deposit only)", "100% deduction"]
        ]
      }
    ]
  },

  // =========================================================================
  // 4. STAFF (parentSlug: "staff")
  // =========================================================================
  {
    title: "Faculty Profiles — Department Wise",
    slug: "faculty-profiles",
    parentSlug: "staff",
    template: "default",
    icon: "Users",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Faculty Profiles",
        subheading: "Meet our dedicated educators, researchers, and mentors committed to student success.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "faculty-grid",
        title: "Teaching Faculty Directory",
        departments: [
          {
            name: "Department of Computer Science & Applications",
            faculty: [
              {
                name: "Dr. Anita Rao",
                designation: "Associate Professor & Head of Department",
                qualification: "Ph.D. in Computer Science, M.Tech (IT)",
                experience: "16 Years",
                email: "anita.rao@college.edu",
                phone: "+91 98230 00001",
                specialization: "Artificial Intelligence, Cloud Computing & DBMS"
              },
              {
                name: "Prof. Rajesh Sharma",
                designation: "Assistant Professor",
                qualification: "M.C.A., UGC-NET",
                experience: "9 Years",
                email: "rajesh.sharma@college.edu",
                phone: "+91 98230 00002",
                specialization: "Full-Stack Web Development, Data Structures"
              },
              {
                name: "Prof. Neha Deshmukh",
                designation: "Assistant Professor",
                qualification: "M.Sc. (Computer Science), SET",
                experience: "7 Years",
                email: "neha.deshmukh@college.edu",
                phone: "+91 98230 00003",
                specialization: "Cybersecurity, Python Programming & Machine Learning"
              },
              {
                name: "Prof. Amit Vaze",
                designation: "Assistant Professor",
                qualification: "M.Tech (CS), B.E.",
                experience: "5 Years",
                email: "amit.vaze@college.edu",
                phone: "+91 98230 00008",
                specialization: "Mobile Application Dev & IoT"
              }
            ]
          },
          {
            name: "Department of Commerce & Management",
            faculty: [
              {
                name: "Dr. Sunil Patil",
                designation: "Associate Professor & HoD",
                qualification: "Ph.D. in Commerce, M.Com, M.Phil",
                experience: "18 Years",
                email: "sunil.patil@college.edu",
                phone: "+91 98230 00004",
                specialization: "Corporate Accounting, Financial Management"
              },
              {
                name: "Dr. Meenakshi Verma",
                designation: "Assistant Professor",
                qualification: "Ph.D., M.Com, CMA Inter",
                experience: "11 Years",
                email: "meenakshi.verma@college.edu",
                phone: "+91 98230 00005",
                specialization: "Direct & Indirect Taxation, Auditing"
              },
              {
                name: "Prof. Rohan Kulkarni",
                designation: "Assistant Professor",
                qualification: "M.Com, UGC-NET",
                experience: "6 Years",
                email: "rohan.kulkarni@college.edu",
                phone: "+91 98230 00009",
                specialization: "Banking, Insurance & Business Economics"
              }
            ]
          },
          {
            name: "Department of Humanities & Social Sciences",
            faculty: [
              {
                name: "Dr. Kevin D'Souza",
                designation: "Associate Professor & HoD",
                qualification: "Ph.D. in English Literature, M.A.",
                experience: "20 Years",
                email: "kevin.dsouza@college.edu",
                phone: "+91 98230 00006",
                specialization: "Post-Colonial Literature, Linguistics"
              },
              {
                name: "Prof. Priya Nair",
                designation: "Assistant Professor",
                qualification: "M.A. in Economics, UGC-NET",
                experience: "8 Years",
                email: "priya.nair@college.edu",
                phone: "+91 98230 00007",
                specialization: "Macroeconomics, Public Finance & Statistics"
              },
              {
                name: "Dr. Aruna Gaonkar",
                designation: "Assistant Professor",
                qualification: "Ph.D. in Sociology, M.A.",
                experience: "12 Years",
                email: "aruna.gaonkar@college.edu",
                phone: "+91 98230 00010",
                specialization: "Gender Studies & Rural Sociology"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: "Non-Teaching Staff Profile",
    slug: "non-teaching-staff",
    parentSlug: "staff",
    template: "default",
    icon: "UserCheck",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Non-Teaching & Support Staff",
        subheading: "The administrative and technical pillars ensuring seamless campus functionality.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Administrative & Technical Roster",
        headers: ["Name", "Designation", "Department / Section", "Contact"],
        rows: [
          ["Mr. Ramesh Naik", "Registrar / Office Superintendent", "Central Administration", "registrar@college.edu"],
          ["Mr. Pradeep Joshi", "Chief Librarian", "Knowledge Resource Centre", "library@college.edu"],
          ["Ms. Sunita Kamat", "Head Accountant", "Accounts & Finance Section", "accounts@college.edu"],
          ["Mr. Vikas Shinde", "System Administrator", "IT Infrastructure & Server Cell", "admin.it@college.edu"],
          ["Mr. Santosh Patil", "Senior Laboratory Assistant", "Computer Laboratories", "lab.support@college.edu"]
        ]
      }
    ]
  },

  // =========================================================================
  // 5. EXAMINATION (parentSlug: "examination")
  // =========================================================================
  {
    title: "Examination Committee",
    slug: "exam-committee",
    parentSlug: "examination",
    template: "default",
    icon: "ClipboardCheck",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Examination Committee",
        subheading: "Managing internal assessment schedules, term tests, and university exam evaluations.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Examination Committee Members",
        headers: ["Designation in Committee", "Name", "Department", "Role"],
        rows: [
          ["Chief Conductor / Controller", "Dr. Francis Fernandes", "Principal", "Overall exam oversight"],
          ["Convenor", "Dr. Sunil Patil", "Commerce", "Exam logistics & schedule administration"],
          ["Joint Convenor", "Prof. Rajesh Sharma", "Computer Science", "IT systems & question paper management"],
          ["Member", "Dr. Meenakshi Verma", "Commerce", "Internal assessment verification"]
        ]
      }
    ]
  },
  {
    title: "Ordinances & Regulations",
    slug: "ordinances",
    parentSlug: "examination",
    template: "default",
    icon: "Scale",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Examination Ordinances",
        subheading: "Statutory rules governing CBCS grading, passing criteria, ATKT, and revaluation.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Key CBCS Grading Provisions",
        items: [
          { label: "75% Attendance Requirement", description: "Students must maintain minimum 75% attendance in theory and practicals to appear for term-end exams." },
          { label: "Internal vs External Weightage", description: "Courses carry 40% Continuous Internal Assessment (ISA) and 60% Semester End Examination (SEE)." },
          { label: "Passing Standard", description: "Minimum 40% combined score in ISA + SEE is required to clear each course." }
        ]
      }
    ]
  },
  {
    title: "Exam Schedule",
    slug: "exam-schedule",
    parentSlug: "examination",
    template: "default",
    icon: "CalendarDays",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Exam Schedule & Timetables",
        subheading: "Semester-end examination datesheets and seating arrangements.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Upcoming Examination Schedule",
        headers: ["Programme", "Semester", "Start Date", "End Date", "Session Time"],
        rows: [
          ["B.C.A.", "Sem I & III", "18 October 2024", "04 November 2024", "10:00 AM – 1:00 PM"],
          ["B.Com", "Sem I, III & V", "20 October 2024", "08 November 2024", "10:00 AM – 1:00 PM"],
          ["B.A.", "Sem I, III & V", "21 October 2024", "07 November 2024", "2:00 PM – 5:00 PM"]
        ]
      }
    ]
  },
  {
    title: "Examination Notices",
    slug: "exam-notices",
    parentSlug: "examination",
    template: "default",
    icon: "Megaphone",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Examination Circulars",
        subheading: "Hall ticket release dates, grade card issuance, and revaluation submission guidelines.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Recent Examination Announcements",
        items: [
          { label: "Hall Ticket Generation for Odd Semester 2024", description: "Admit cards are available for download via student ERP portal from 10 October 2024." },
          { label: "Application for Photocopy & Revaluation (Even Sem 2024)", description: "Last date to apply for revaluation of answer scripts is 15 September 2024." }
        ]
      }
    ]
  },

  // =========================================================================
  // 6. IQAC & ACCREDITATION (parentSlug: "iqac")
  // =========================================================================
  {
    title: "Composition of IQAC",
    slug: "composition",
    parentSlug: "iqac",
    template: "default",
    icon: "ShieldCheck",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Internal Quality Assurance Cell (IQAC)",
        subheading: "Catalysing continuous academic quality enhancement and institutional benchmarking.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "IQAC Committee Composition",
        headers: ["Role / Capacity", "Name", "Designation", "Affiliation"],
        rows: [
          ["Chairperson", "Dr. Francis Fernandes", "Principal", "Fr. Agnel College"],
          ["IQAC Coordinator / Director", "Dr. Anita Rao", "Associate Professor (CS)", "Fr. Agnel College"],
          ["Management Representative", "Rev. Fr. Superior", "Manager", "Trust Management"],
          ["Senior Administrative Officer", "Mr. Ramesh Naik", "Registrar", "Fr. Agnel College"],
          ["Teacher Member", "Dr. Sunil Patil", "Associate Professor (Commerce)", "Fr. Agnel College"],
          ["Industry Nominee", "Mr. Sandeep Hegde", "VP (Engineering)", "TechCorp India Ltd."],
          ["Student Representative", "Ms. Riya Sharma", "General Secretary", "Student Council"]
        ]
      }
    ]
  },
  {
    title: "Minutes of Meetings & Action Taken Reports",
    slug: "minutes-atr",
    parentSlug: "iqac",
    template: "default",
    icon: "FileSpreadsheet",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "IQAC Minutes & Action Taken Reports",
        subheading: "Record of quarterly strategic quality reviews and documented implementation outcomes.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "IQAC Meeting Minutes & ATR Downloads",
        documents: [
          { title: "IQAC Meeting Minutes & ATR — Q1 (2024-25)", date: "2024-07-25", type: "PDF" },
          { title: "IQAC Meeting Minutes & ATR — Q4 (2023-24)", date: "2024-04-18", type: "PDF" },
          { title: "IQAC Meeting Minutes & ATR — Q3 (2023-24)", date: "2024-01-22", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "NAAC Archives — Reports and Certificates",
    slug: "archives",
    parentSlug: "iqac",
    template: "default",
    icon: "Archive",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "NAAC Archives & Certificates",
        subheading: "Historical accreditation records, peer team reports, and institutional certificates.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Accreditation Documents",
        documents: [
          { title: "NAAC Certificate of Accreditation (Cycle 2 - Grade 'A')", date: "2022-09-15", type: "PDF" },
          { title: "NAAC Peer Team Report (Cycle 2)", date: "2022-09-15", type: "PDF" },
          { title: "NAAC Certificate of Accreditation (Cycle 1)", date: "2015-05-10", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "AQAR — Annual Quality Assurance Report",
    slug: "aqar",
    parentSlug: "iqac",
    template: "default",
    icon: "FileBarChart",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Annual Quality Assurance Reports (AQAR)",
        subheading: "Comprehensive yearly institutional performance reports submitted to NAAC.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "AQAR Reports by Academic Year",
        documents: [
          { title: "Annual Quality Assurance Report (AQAR 2022–2023)", date: "2023-12-20", type: "PDF" },
          { title: "Annual Quality Assurance Report (AQAR 2021–2022)", date: "2022-12-15", type: "PDF" },
          { title: "Annual Quality Assurance Report (AQAR 2020–2021)", date: "2021-12-18", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "SSR — Self Study Report",
    slug: "ssr",
    parentSlug: "iqac",
    template: "default",
    icon: "Layers",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Self Study Report (SSR)",
        subheading: "Criteria-wise self-evaluation submitted for NAAC assessment.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "SSR Documentation (Cycle 2)",
        documents: [
          { title: "Institutional Self Study Report (SSR) — Full Executive Report", date: "2022-07-10", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "SSS — Student Satisfaction Survey",
    slug: "sss",
    parentSlug: "iqac",
    template: "default",
    icon: "Smile",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Student Satisfaction Survey (SSS)",
        subheading: "Comprehensive feedback and satisfaction analysis on teaching, learning, and campus infrastructure.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Student Survey Reports",
        documents: [
          { title: "Student Satisfaction Survey Analysis & Outcome Report (2023–24)", date: "2024-03-25", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "DVV — Data Verification and Validation",
    slug: "dvv",
    parentSlug: "iqac",
    template: "default",
    icon: "CheckSquare",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Data Verification and Validation (DVV)",
        subheading: "Metric-wise validation responses and supporting compliance documentation.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "DVV Clarification Dossiers",
        documents: [
          { title: "DVV Metric Clarifications & Supporting Evidences (Cycle 2)", date: "2022-08-14", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "Stakeholder Feedback",
    slug: "feedback",
    parentSlug: "iqac",
    template: "default",
    icon: "MessageSquare",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Stakeholder Feedback & Analysis",
        subheading: "Systematic 360-degree feedback collected from Students, Alumni, Parents, and Employers.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Feedback Feedback Portals",
        items: [
          { label: "Student Curriculum Feedback", description: "Online questionnaire assessing syllabus relevance, practical delivery, and mentoring." },
          { label: "Alumni & Employer Surveys", description: "Industry evaluations on graduates' technical aptitude, communication, and work ethics." }
        ]
      }
    ]
  },
  {
    title: "Relevant Documents — Criterion Wise",
    slug: "criterion-documents",
    parentSlug: "iqac",
    template: "default",
    icon: "FolderCheck",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Criterion-Wise Documentation",
        subheading: "Supporting records catalogued across NAAC Criteria I through VII.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Criteria Records",
        documents: [
          { title: "Criterion I: Curricular Aspects Compliance Dossier", date: "2023-11-10", type: "PDF" },
          { title: "Criterion II: Teaching-Learning & Evaluation Data", date: "2023-11-12", type: "PDF" },
          { title: "Criterion III: Research, Innovations & Extension Portfolio", date: "2023-11-15", type: "PDF" },
          { title: "Criterion IV: Infrastructure & Learning Resources Record", date: "2023-11-18", type: "PDF" },
          { title: "Criterion V: Student Support & Progression Records", date: "2023-11-20", type: "PDF" },
          { title: "Criterion VI: Governance, Leadership & Management Evidence", date: "2023-11-22", type: "PDF" },
          { title: "Criterion VII: Institutional Values & Best Practices", date: "2023-11-25", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "National Institutional Ranking Framework (NIRF)",
    slug: "nirf-report",
    parentSlug: "iqac",
    template: "default",
    icon: "BarChart3",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "National Institutional Ranking Framework (NIRF)",
        subheading: "Annual national ranking disclosures and Data Capturing System (DCS) reports.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "NIRF Submission Summary",
        headers: ["Year", "Category", "DCS Upload Status", "Sanctioned Intake", "Graduation Outcomes"],
        rows: [
          ["2024", "College Category", "Submitted & Verified", "280 Students", "94% Passed"],
          ["2023", "College Category", "Submitted & Verified", "280 Students", "92% Passed"],
          ["2022", "College Category", "Submitted & Verified", "260 Students", "91% Passed"]
        ]
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "NIRF Data Capturing System (DCS) Reports",
        documents: [
          { title: "NIRF College Category DCS Submission 2024", date: "2024-01-15", type: "PDF" },
          { title: "NIRF College Category DCS Submission 2023", date: "2023-01-18", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "All India Survey on Higher Education (AISHE)",
    slug: "aishe-report",
    parentSlug: "iqac",
    template: "default",
    icon: "Landmark",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "All India Survey on Higher Education (AISHE)",
        subheading: "Ministry of Education institutional survey reports and compliance certificates.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "AISHE Certificate & Survey Reports",
        documents: [
          { title: "AISHE Certificate of Survey Completion (2023–2024)", date: "2024-02-28", type: "PDF" },
          { title: "AISHE Data Capturing Format (DCF-II) 2023–2024", date: "2024-02-28", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "India Today MDRA Ranking Survey",
    slug: "india-today-survey",
    parentSlug: "iqac",
    template: "default",
    icon: "Newspaper",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "India Today MDRA Best Colleges Survey",
        subheading: "Independent national rankings highlighting our academic standing in Arts, Commerce, and BCA.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "India Today Survey Standings",
        headers: ["Stream / Programme", "State Rank", "Zonal Standing", "Key Parameter Score"],
        rows: [
          ["BCA (Computer Applications)", "Top 3 in State", "Top 25 West Zone", "High in Infrastructure & Career Readiness"],
          ["B.Com (Commerce)", "Top 5 in State", "Top 35 West Zone", "High in Faculty Quality & Value for Money"],
          ["B.A. (Humanities)", "Top 5 in State", "Top 40 West Zone", "High in Student Diversity & Social Impact"]
        ]
      }
    ]
  },

  // =========================================================================
  // 7. RESEARCH & INNOVATION (parentSlug: "research")
  // =========================================================================
  {
    title: "Faculty Research Publications",
    slug: "faculty-publications",
    parentSlug: "research",
    template: "default",
    icon: "FileText",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Faculty Research & Publications",
        subheading: "Scholarly journal papers, peer-reviewed articles, and authored book chapters.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Recent Faculty Publications (Sample Roster)",
        headers: ["Title of Paper", "Author(s)", "Journal / Conference", "Indexing", "Year"],
        rows: [
          ["Deep Learning Models for Early Anomaly Detection in Cloud Infrastructures", "Dr. Anita Rao", "IEEE Trans. on Cloud Computing", "Scopus / SCI", "2024"],
          ["Impact of Digital Financial Literacy on Rural Entrepreneurship", "Dr. Sunil Patil", "Intl. Journal of Commerce & Management", "UGC-CARE", "2023"],
          ["Post-Colonial Identities in Contemporary Indian Anglophone Fiction", "Dr. Kevin D'Souza", "Journal of Literary & Cultural Studies", "UGC-CARE", "2023"],
          ["Comparative Performance of NoSQL Databases for Real-Time Sensor Telemetry", "Prof. Neha Deshmukh", "Intl. Conf. on Computational Intelligence", "Scopus", "2024"]
        ]
      }
    ]
  },
  {
    title: "Student Research Publications",
    slug: "student-publications",
    parentSlug: "research",
    template: "default",
    icon: "GraduationCap",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Student Research & Publications",
        subheading: "Encouraging undergraduate research through conference presentations and mentorship.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Selected Student Conference Papers",
        items: [
          { label: "IoT-Based Automated Smart Campus Energy Monitoring", description: "Presented at State Level TechSymposium 2024 by BCA final year student team." },
          { label: "Consumer Sentiment Analysis During Festive E-Commerce Sales", description: "Presented at All India Commerce Student Colloquium 2023 by B.Com scholars." }
        ]
      }
    ]
  },
  {
    title: "College Publications",
    slug: "college-publications",
    parentSlug: "research",
    template: "default",
    icon: "BookOpen",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "College Publications Overview",
        subheading: "Periodic journals, newsletters, and creative writing volumes published by the institution.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Editorial Publications",
        items: [
          { label: "Anchor — Multidisciplinary Peer-Reviewed Journal", description: "Bi-annual research journal publishing original scholarly papers." },
          { label: "Happenings — Campus Newsletter", description: "Quarterly chronicle of academic, sports, and cultural milestones." },
          { label: "Full Circle & Annual College Magazine", description: "Showcase of student literary essays, poetry, and institutional annual reports." }
        ]
      }
    ]
  },
  {
    title: "College Magazine",
    slug: "magazine",
    parentSlug: "research",
    template: "default",
    icon: "Image",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Annual College Magazine",
        subheading: "A reflection of creative expression, student literature, and campus milestones.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Annual Magazine Editions (PDF)",
        documents: [
          { title: "Agnelite Annual Magazine — Edition 2023–24 (The Horizon)", date: "2024-04-10", type: "PDF" },
          { title: "Agnelite Annual Magazine — Edition 2022–23 (Resilience)", date: "2023-04-12", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "Journal — Anchor",
    slug: "journal-anchor",
    parentSlug: "research",
    template: "default",
    icon: "Bookmark",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Anchor — Peer-Reviewed Journal",
        subheading: "Bi-annual interdisciplinary research publication (ISSN: 2348-XXXX).",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Anchor Journal Issues",
        documents: [
          { title: "Anchor Journal Volume 10 Issue 1 (Jan–Jun 2024)", date: "2024-06-30", type: "PDF" },
          { title: "Anchor Journal Volume 9 Issue 2 (Jul–Dec 2023)", date: "2023-12-31", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "Happenings — College Newsletter",
    slug: "happenings",
    parentSlug: "research",
    template: "default",
    icon: "Newspaper",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Happenings — College Newsletter",
        subheading: "Quarterly snapshots of academic events, student triumphs, and campus life.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Newsletter Issues",
        documents: [
          { title: "Happenings — Vol 18 Issue 2 (April–June 2024)", date: "2024-06-30", type: "PDF" },
          { title: "Happenings — Vol 18 Issue 1 (Jan–March 2024)", date: "2024-03-31", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "Full Circle",
    slug: "full-circle",
    parentSlug: "research",
    template: "default",
    icon: "Feather",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Full Circle — Creative Writing Collection",
        subheading: "Curated anthology of multilingual poems, short stories, and artworks by students.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "documentList",
        title: "Full Circle Editions",
        documents: [
          { title: "Full Circle Anthology — Edition 2024", date: "2024-03-15", type: "PDF" }
        ]
      }
    ]
  },
  {
    title: "Minor & Major Research Projects",
    slug: "research-projects",
    parentSlug: "research",
    template: "default",
    icon: "Briefcase",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Funded Research Projects",
        subheading: "Government and industry-funded investigations undertaken by faculty researchers.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Recent Research Grants",
        headers: ["Project Title", "Principal Investigator", "Funding Agency", "Grant (INR)", "Status"],
        rows: [
          ["IoT Based Water Quality Monitoring for Estuarine Eco-systems", "Dr. Anita Rao", "State Science & Tech Council", "₹ 3,50,000", "Completed"],
          ["Socio-Economic Impact of Microfinance on Coastal Self-Help Groups", "Dr. Sunil Patil", "ICSSR", "₹ 4,20,000", "Ongoing"],
          ["Digitization of Regional Folk Narratives & Oral Histories", "Dr. Kevin D'Souza", "UGC Minor Research Grant", "₹ 2,00,000", "Completed"]
        ]
      }
    ]
  },
  {
    title: "Student Projects",
    slug: "student-projects",
    parentSlug: "research",
    template: "default",
    icon: "FolderGit2",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Student Capstone Projects",
        subheading: "Innovative final-year problem solving solutions designed and deployed by undergraduate students.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Highlighted Capstone Solutions (2024)",
        items: [
          { label: "CampusNav — AR Based Indoor Campus Navigation System", description: "Developed by BCA students using WebXR and beacon technology." },
          { label: "FinTrack — Budget Management and Automated GST Invoicing Tool", description: "Created by B.Com & BCA collaborative team for local retail businesses." }
        ]
      }
    ]
  },
  {
    title: "Institution's Innovation Council & Incubation",
    slug: "innovation-incubation",
    parentSlug: "research",
    template: "default",
    icon: "Lightbulb",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Institution's Innovation Council (IIC)",
        subheading: "Fostering entrepreneurial mindsets, design thinking, and start-up incubation on campus.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "IIC Activities & Incubation Facilities",
        items: [
          { label: "Maker Lab & Prototyping Space", description: "Equipped with 3D printers, IoT microcontrollers, and high-performance computing units." },
          { label: "Idea Pitching & Hackathon Series", description: "Annual Hack-Agnel hackathon offering seed grants for viable student enterprise concepts." },
          { label: "IPR & Patent Mentorship Cell", description: "Legal and technical guidance on patent filings, trademark registrations, and copyrights." }
        ]
      },
      {
        id: generateSectionId(),
        type: "timeline",
        title: "Incubation Milestones",
        events: [
          { year: "2021", title: "IIC Established", description: "Approved by Ministry of Education (MoE) Innovation Cell." },
          { year: "2022", title: "First Student Startup Registered", description: "Campus delivery and stationery logistics startup incubated." },
          { year: "2024", title: "4-Star MoE Rating Awarded", description: "Recognized as top performing innovation council in the region." }
        ]
      }
    ]
  },

  // =========================================================================
  // 8. STUDENT LIFE (parentSlug: "student-life")
  // =========================================================================
  {
    title: "Student Support Services",
    slug: "support-services",
    parentSlug: "student-life",
    template: "default",
    icon: "HeartHandshake",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Student Support Services",
        subheading: "Comprehensive academic, mental wellness, financial, and residential student care.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Support Facilities",
        items: [
          { label: "Mentor-Mentee System", description: "Personalized faculty guidance for academic progress, emotional wellbeing, and career growth." },
          { label: "Scholarship & Fee Concession Desk", description: "Facilitating government scholarships, merit prizes, and institutional fee waivers for needy scholars." },
          { label: "Remedial Coaching & Peer Tutoring", description: "Special after-hours tutorial sessions for students needing extra academic assistance." }
        ]
      }
    ]
  },
  {
    title: "Student Facilities",
    slug: "student-facilities",
    parentSlug: "student-life",
    template: "default",
    icon: "Coffee",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Student Campus Facilities",
        subheading: "Spaces designed for collaboration, dining, recreation, and personal growth.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Campus Amenities",
        items: [
          { label: "Hygienic Multi-Cuisine Canteen", description: "Nutritious, affordable breakfast, lunch, and beverages in a spacious open-air cafeteria." },
          { label: "Common Rooms & Recreation Lounges", description: "Separate lounges for boys and girls with indoor board games and relaxation areas." },
          { label: "Stationery & Reprography Centre", description: "Photocopying, printing, document binding, and academic supplies at subsidized student rates." }
        ]
      }
    ]
  },
  {
    title: "Clubs & Cultural Societies",
    slug: "clubs",
    parentSlug: "student-life",
    template: "default",
    icon: "Sparkles",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Clubs & Cultural Societies",
        subheading: "Unleash your creative passions across drama, music, literature, environment, and code.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Active Student Clubs",
        headers: ["Club Name", "Faculty In-Charge", "Key Activities", "Meeting Schedule"],
        rows: [
          ["ByteCrafters (Tech Club)", "Prof. Rajesh Sharma", "Hackathons, Web Dev Bootcamps, Coding Contests", "Every Friday"],
          ["Symphony (Music & Dance)", "Dr. Meenakshi Verma", "Inter-college choir, instrumental & dance performances", "Twice a week"],
          ["Eco-Warriors (Nature Club)", "Dr. Sunil Patil", "Tree plantation, bird watching, beach cleanups", "Bi-weekly"],
          ["Debate & Literary Circle", "Dr. Kevin D'Souza", "Model UN, parliamentary debates, creative workshops", "Every Wednesday"]
        ]
      },
      {
        id: generateSectionId(),
        type: "eventList",
        title: "Upcoming Club Showcases",
        events: [
          {
            title: "ByteQuest Tech Fest 2024",
            date: "2024-10-15",
            location: "Computer Labs 1 & 2",
            description: "Coding relays, bug hunting, UI design sprints, and tech trivia competitions."
          },
          {
            title: "Symphony Annual Musical Evening",
            date: "2024-11-20",
            location: "College Main Auditorium",
            description: "Inter-collegiate acoustic battles, classical choral pieces, and contemporary dance."
          }
        ]
      }
    ]
  },
  {
    title: "Statutory & Special Cells",
    slug: "cells",
    parentSlug: "student-life",
    template: "default",
    icon: "ShieldAlert",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Statutory & Special Purpose Cells",
        subheading: "Ensuring an equitable, secure, and supportive campus environment for all.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Mandated Institutional Cells",
        items: [
          { label: "Anti-Ragging Squad & Cell", description: "Strict monitoring and 24x7 helpline ensuring zero tolerance to any form of ragging or bullying." },
          { label: "Internal Complaints Committee (ICC)", description: "Gender sensitization, awareness seminars, and redressal of workplace/campus harassment complaints." },
          { label: "SC/ST/OBC & Minority Cell", description: "Promoting social justice, tracking scholarship disbursements, and resolving grievances." },
          { label: "Equal Opportunity Cell (Divyangjan)", description: "Accessible ramps, assistive technologies, and customized exam assistance for specially-abled students." }
        ]
      }
    ]
  },
  {
    title: "Student Council",
    slug: "student-council",
    parentSlug: "student-life",
    template: "default",
    icon: "Crown",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Student Council",
        subheading: "Democratically elected student leadership voicing student interests and organizing campus life.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Student Council Executive Roster (2024-25)",
        headers: ["Position", "Student Name", "Class / Stream", "Key Responsibility"],
        rows: [
          ["General Secretary (GS)", "Aarav Naik", "TY BCA", "Overall student representation & fest coordination"],
          ["Cultural Secretary", "Ananya Kamat", "TY B.Com", "College Annual Day & Inter-College Fests"],
          ["Sports Secretary", "Rohan Fernandes", "TY B.A.", "Inter-Collegiate athletic events & tournaments"],
          ["Ladies Representative (LR)", "Siddhi Prabhu", "SY B.Com", "Women student welfare & grievance liaison"]
        ]
      }
    ]
  },
  {
    title: "National Cadet Corps (NCC)",
    slug: "ncc",
    parentSlug: "student-life",
    template: "default",
    icon: "Shield",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "National Cadet Corps (NCC)",
        subheading: "Developing discipline, leadership, secular outlook, and ideals of selfless service.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Army & Naval Wings",
        content: "<p>The college hosts active NCC Army and Naval units affiliated with the State NCC Directorate. Cadets participate in annual training camps, Republic Day parades (RDC), weapon drills, trekking expeditions, and disaster response drills.</p><p>NCC 'B' and 'C' Certificate holders benefit from direct entry quotas into the Indian Armed Forces and paramilitary services.</p>"
      },
      {
        id: generateSectionId(),
        type: "timeline",
        title: "NCC Annual Training Camps & Parades",
        events: [
          { year: "July", title: "Annual Combined Cadre Camp (ATC)", description: "10-day intensive weapon firing, obstacle training, and map reading camp." },
          { year: "August", title: "Independence Day Guard of Honour", description: "Ceremonial flag hoisting and platoon parade in the campus main grounds." },
          { year: "November", title: "National Integration Camp (NIC)", description: "Cadets representing the state at the all-India national integration camp." },
          { year: "January", title: "Republic Day Parade (RDC)", description: "Participation in the state capital Republic Day march past." }
        ]
      }
    ]
  },
  {
    title: "National Service Scheme (NSS)",
    slug: "nss",
    parentSlug: "student-life",
    template: "default",
    icon: "Heart",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "National Service Scheme (NSS)",
        subheading: "'Not Me, But You' — Inculcating social consciousness and grassroots community development.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "NSS Outreach Programmes",
        items: [
          { label: "Annual 7-Day Rural Immersion Camp", description: "Community development, check-dam construction, and health awareness in adopted villages." },
          { label: "Voluntary Blood Donation Drives", description: "Annual drives in collaboration with the District Blood Bank collecting 100+ units per session." },
          { label: "Swachh Bharat & Coastal Cleanups", description: "Regular beach cleaning drives and waste segregation campaigns in local municipalities." }
        ]
      },
      {
        id: generateSectionId(),
        type: "eventList",
        title: "Recent NSS Community Drives",
        events: [
          {
            title: "Mega Blood Donation Camp 2024",
            date: "2024-08-20",
            location: "College Multi-Purpose Hall",
            description: "Over 120 students and faculty voluntarily donated blood in partnership with Goa Medical College."
          },
          {
            title: "Coastal Ecosystem Cleanup & Tree Plantation",
            date: "2024-09-08",
            location: "Miramar Coastal Stretch",
            description: "Planted 250 native saplings and cleared 400 kg of non-biodegradable waste."
          }
        ]
      }
    ]
  },
  {
    title: "Sports & Gymnasium",
    slug: "sports",
    parentSlug: "student-life",
    template: "default",
    icon: "Trophy",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Sports & Physical Education",
        subheading: "State-of-the-art sports facilities promoting athletic excellence, team spirit, and physical wellness.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Sports Infrastructure & Coaching",
        headers: ["Facility / Ground", "Specifications", "Coaching / Tournaments", "Timings"],
        rows: [
          ["Football Ground", "Standard Natural Grass Field", "Inter-University Football Championship", "6:00 AM – 6:30 PM"],
          ["Basketball & Volleyball Court", "Synthetic All-Weather Floodlit Court", "Inter-College Tournament series", "6:00 AM – 7:00 PM"],
          ["Indoor Badminton & Table Tennis", "Wooden Flooring Multipurpose Hall", "University Zonal Tournaments", "7:00 AM – 6:00 PM"],
          ["Modern Fitness Gymnasium", "Equipped with cardio & strength machines", "Dedicated fitness trainer guidance", "6:30 AM – 8:30 PM"]
        ]
      }
    ]
  },
  {
    title: "Student Discipline & Code of Conduct",
    slug: "discipline",
    parentSlug: "student-life",
    template: "default",
    icon: "AlertCircle",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Student Discipline & Code of Conduct",
        subheading: "Guidelines ensuring a respectful, safe, and academically conducive environment.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Key Campus Rules",
        items: [
          { label: "Identity Cards Mandatory", description: "Students must wear their valid institutional smart ID badge while on campus premises." },
          { label: "Mobile Phone Etiquette", description: "Mobile devices must be kept on silent mode inside lecture halls, laboratories, and the library." },
          { label: "Substance-Free Campus", description: "Possession, consumption, or distribution of tobacco, alcohol, or narcotic substances is strictly prohibited and attracts expulsion." }
        ]
      }
    ]
  },
  {
    title: "Placement and Internship Cell",
    slug: "placements",
    parentSlug: "student-life",
    template: "default",
    icon: "Briefcase",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Placement & Career Guidance Cell",
        subheading: "Connecting student talent with leading corporate enterprises, tech firms, and financial institutions.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Recent Placement Statistics (Overview)",
        headers: ["Academic Year", "Registered Students", "Job Offers Received", "Highest CTC", "Average CTC"],
        rows: [
          ["2023–2024", "145", "128", "₹ 7.5 LPA", "₹ 3.8 LPA"],
          ["2022–2023", "138", "119", "₹ 6.8 LPA", "₹ 3.5 LPA"],
          ["2021–2022", "120", "102", "₹ 6.0 LPA", "₹ 3.2 LPA"]
        ]
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Major Recruiting Partners (Sample)",
        items: [
          { label: "Information Technology", description: "TCS, Infosys, Wipro, Cognizant, Tech Mahindra, Persistent Systems" },
          { label: "Banking & Financial Services", description: "HDFC Bank, ICICI Bank, Axis Bank, Ernst & Young (EY GDS)" }
        ]
      },
      {
        id: generateSectionId(),
        type: "timeline",
        title: "Annual Placement & Career Training Cycle",
        events: [
          { year: "Semester IV", title: "Soft Skills & Aptitude Bootcamp", description: "Resume writing, GD simulations, and numerical aptitude coaching." },
          { year: "Semester V", title: "Technical Mock Interviews", description: "Coding challenge drills and technical panel evaluations with corporate alumni." },
          { year: "Semester VI", title: "On-Campus Recruitment Drives", description: "Campus placement visits, online assessments, and offer letter rollouts." }
        ]
      }
    ]
  },
  {
    title: "Mentoring & Counselling Cell",
    slug: "counselling",
    parentSlug: "student-life",
    template: "default",
    icon: "Sparkle",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Mentoring & Counselling Cell",
        subheading: "Confidential psychological counselling, stress management, and emotional support services.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Professional Wellness Support",
        content: "<p>The college provides free, confidential counselling sessions with a qualified in-house clinical psychologist. Whether navigating academic pressure, relationship anxiety, transition stress, or personal dilemmas, students find a compassionate, safe space to heal and grow.</p><p><strong>Counsellor Room:</strong> Block B, Room 204<br><strong>Helpline / Booking:</strong> counsellor@college.edu | Mon–Fri (9:00 AM – 4:00 PM)</p>"
      }
    ]
  },
  {
    title: "Awards & Scholarships",
    slug: "scholarships",
    parentSlug: "student-life",
    template: "default",
    icon: "Award",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Awards & Scholarships",
        subheading: "Honouring academic toppers, sports champions, and providing financial aid to deserving students.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Institutional & Endowment Scholarships",
        headers: ["Scholarship / Award Title", "Eligibility Criteria", "Award / Amount", "Sponsored By"],
        rows: [
          ["Fr. Agnel Merit Gold Medal", "Overall College Topper in University Exams", "Gold Medal + ₹ 25,000", "College Management Trust"],
          ["Late S.K. Rao Memorial Award", "Top Scorer in Final Year BCA", "Cash Award ₹ 15,000", "Alumni Endowment Fund"],
          ["Need-Cum-Merit Tuition Waiver", "Family income < ₹ 2 LPA + min 60% marks", "Up to 50% Tuition Waiver", "Student Welfare Fund"],
          ["Best Sportsman / Sportswoman Trophy", "Outstanding performance at National / State level", "Trophy + ₹ 10,000", "Physical Education Dept."]
        ]
      }
    ]
  },

  // =========================================================================
  // 9. CAMPUS & ALUMNI (parentSlug: "campus-alumni")
  // =========================================================================
  {
    title: "Campus Infrastructure Facilities",
    slug: "campus-facilities",
    parentSlug: "campus-alumni",
    template: "default",
    icon: "Building",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Campus Infrastructure & Facilities",
        subheading: "Modern, sustainable campus architecture built to foster collaborative, world-class education.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Key Infrastructure Assets",
        items: [
          { label: "Smart ICT-Enabled Classrooms", description: "Acoustically treated lecture halls equipped with short-throw projectors and gigabit internet." },
          { label: "High-Tech Computer Laboratories", description: "5 specialized air-conditioned computer labs with 250+ high-end workstations and dedicated servers." },
          { label: "Central Auditorium & Open-Air Amphitheatre", description: "600-seater air-conditioned auditorium with surround sound and modern stage lighting." },
          { label: "Solar & Green Energy Infrastructure", description: "100 kW rooftop solar plant, rainwater harvesting reservoirs, and botanical garden." }
        ]
      },
      {
        id: generateSectionId(),
        type: "timeline",
        title: "Campus Expansion & Upgrades",
        events: [
          { year: "2018", title: "New Computing Wing Inaugurated", description: "Added 2 new state-of-the-art computer labs with 100 high-spec terminals." },
          { year: "2020", title: "Smart Hybrid Classrooms", description: "Equipped lecture halls with digital interactive touch panels and live streaming." },
          { year: "2022", title: "Solar Rooftop Grid", description: "Commissioned 100 kW solar energy generation plant." },
          { year: "2024", title: "Multimedia Studio & IIC Maker Lab", description: "Established audio-visual recording room and 3D printing maker lab." }
        ]
      }
    ]
  },
  {
    title: "Knowledge Resource Centre (Library)",
    slug: "central-library",
    parentSlug: "campus-alumni",
    template: "default",
    icon: "BookOpen",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Central Library & Knowledge Resource Centre",
        subheading: "An expansive repository of over 35,000 volumes, international e-journals, and digital databases.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Library Holdings & Resources",
        headers: ["Resource Type", "Holdings / Subscriptions", "Access Mode", "Platform"],
        rows: [
          ["Printed Books & Reference Volumes", "35,000+ Titles", "Physical Stacks & OPAC", "KOHA Library Software"],
          ["E-Books & Digital Manuscripts", "1,50,000+ Titles", "Digital / Remote Access", "INFLIBNET N-LIST / DELNET"],
          ["Peer-Reviewed E-Journals", "6,000+ Journals", "Full-Text Digital", "N-LIST, JSTOR, IEEE Xplore"],
          ["National & Regional Newspapers", "12 Dailies", "Reading Room", "Print & E-Paper"],
          ["Audio-Visual Educational Media", "500+ CD/DVDs & NPTEL", "Multimedia Kiosks", "Institutional Repository"]
        ]
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Library Timings & Facilities",
        items: [
          { label: "Working Hours", description: "Monday to Friday: 8:00 AM – 6:00 PM | Saturday: 8:30 AM – 1:30 PM (Extended till 8:00 PM during exam season)." },
          { label: "Digital E-Resource Section", description: "30 dedicated high-speed desktop terminals for research paper searches and thesis browsing." }
        ]
      }
    ]
  },
  {
    title: "Virtual Campus Tour",
    slug: "virtual-tour",
    parentSlug: "campus-alumni",
    template: "default",
    icon: "Eye",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Virtual Campus Tour",
        subheading: "Explore our lush, state-of-the-art campus buildings, laboratories, and sports grounds.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Experience Fr. Agnel College Online",
        content: "<p>Take a 360-degree interactive walk-through of our academic blocks, computer laboratories, central library, sports complex, and prayer chapel. Experience the inspiring atmosphere where your collegiate journey begins.</p>"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Virtual Tour Highlights",
        items: [
          { label: "Academic Block A & B", description: "Spacious, well-ventilated classrooms, administrative offices, and conference seminar halls." },
          { label: "Computer Science Laboratories", description: "State-of-the-art workstations, high-speed fiber internet, and dedicated server rack facilities." },
          { label: "Central Library & Reading Hall", description: "Two-floor library housing vast collections of physical and digital scholarly literature." },
          { label: "Sports Complex & Cafeteria", description: "Full-size football ground, floodlit basketball court, fitness gym, and hygienic multi-cuisine canteen." }
        ]
      }
    ]
  },
  {
    title: "About Alumni Association",
    slug: "about-alumni",
    parentSlug: "campus-alumni",
    template: "default",
    icon: "Users",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Alumni Association",
        subheading: "A lifelong bond connecting thousands of accomplished graduates worldwide.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Empowering the Next Generation",
        content: "<p>The Fr. Agnel College Alumni Association serves as a vibrant bridge between former students, current scholars, and the alma mater. Our global alumni network actively supports mentoring sessions, guest lectures, student internships, and infrastructural endowment funds.</p>"
      }
    ]
  },
  {
    title: "Alumni Registration",
    slug: "alumni-registration",
    parentSlug: "campus-alumni",
    template: "default",
    icon: "UserPlus",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Alumni Registration",
        subheading: "Stay connected with your alma mater, batchmates, and campus developments.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "richText",
        heading: "Join the Global Alumni Registry",
        content: "<p>Graduates from all batches of B.A., B.Com, and BCA are invited to update their contact details, current organizations, and achievements. Registered members receive the alumni e-newsletter, invitations to annual reunions, and career networking access.</p><p><strong>Email Registration Desk:</strong> alumni@college.edu</p>"
      }
    ]
  },
  {
    title: "Alumni Executive Council",
    slug: "alumni-council",
    parentSlug: "campus-alumni",
    template: "default",
    icon: "Shield",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Alumni Executive Council",
        subheading: "Leadership team steering alumni initiatives, scholarship funds, and reunion meets.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "table",
        title: "Alumni Office Bearers (2023–2025)",
        headers: ["Position", "Alumnus Name", "Passout Batch & Stream", "Current Designation"],
        rows: [
          ["President", "Adv. Sandeep Naik", "Batch of 1998 (B.Com)", "Senior Advocate, High Court"],
          ["Vice President", "Mr. Rahul Kamat", "Batch of 2008 (BCA)", "Director, CloudTech Solutions"],
          ["General Secretary", "Ms. Fatima Sheikh", "Batch of 2012 (B.A.)", "Assistant Professor & Author"],
          ["Treasurer", "Mr. Neil D'Souza", "Batch of 2015 (B.Com)", "Partner, D'Souza & Associates CA"]
        ]
      }
    ]
  },
  {
    title: "Alumni Activities & Meets",
    slug: "alumni-activities",
    parentSlug: "campus-alumni",
    template: "default",
    icon: "Calendar",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Alumni Activities & Meets",
        subheading: "Annual homecoming celebrations, corporate masterclasses, and student mentorship circles.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "eventList",
        title: "Annual Alumni Flagship Gatherings",
        events: [
          {
            title: "Grand Alumni Homecoming & Silver Jubilee Gala",
            date: "2025-01-11",
            location: "College Main Grounds & Amphitheatre",
            description: "Annual evening celebration uniting alumni across batches from 1985 to 2024 with music, networking, and nostalgic reunions."
          },
          {
            title: "Alumni Corporate Mentorship Conclave",
            date: "2024-11-16",
            location: "Central Auditorium",
            description: "One-on-one career clinics where senior alumni in software, banking, and civil services mentor graduating students."
          }
        ]
      },
      {
        id: generateSectionId(),
        type: "timeline",
        title: "Alumni Chapters Worldwide",
        events: [
          { year: "Goa Chapter", title: "Main Campus Chapter", description: "Quarterly networking meetings and student endowment scholarship administration." },
          { year: "Mumbai & Pune Chapter", title: "Corporate Linkages Hub", description: "Facilitating corporate internships and tech recruitment for fresh graduates." },
          { year: "Middle East / UAE Chapter", title: "International Agnelite Circle", description: "Global networking forum supporting overseas job opportunities and institutional projects." }
        ]
      }
    ]
  },
  {
    title: "Official Notices & Announcements",
    slug: "general-announcements",
    parentSlug: "campus-alumni",
    template: "default",
    icon: "Bell",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Notices & Announcements",
        subheading: "Live circulars, official notifications, and general announcements for students and staff.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "list",
        title: "Latest Official Circulars",
        items: [
          { label: "Submission of Examination Forms for Odd Semester 2024", description: "All eligible students must submit their regular and ATKT examination forms online before 25 September 2024." },
          { label: "National Science Day Celebration & Project Expo", description: "Inter-departmental project exhibition scheduled on 28 February 2025 in the Central Auditorium." },
          { label: "Hostel Fee Remittance Notification for Academic Year 2024–25", description: "Hostellers are requested to pay second term dues through the college fee portal by 15 October 2024." }
        ]
      }
    ]
  },
  {
    title: "Campus Events & Activities",
    slug: "campus-activities",
    parentSlug: "campus-alumni",
    template: "default",
    icon: "Sparkles",
    sections: [
      {
        id: generateSectionId(),
        type: "hero",
        heading: "Events & Campus Activities",
        subheading: "Celebrate collegiate life through academic symposiums, cultural galas, and athletic championships.",
        height: "medium"
      },
      {
        id: generateSectionId(),
        type: "eventList",
        title: "Upcoming & Past Major Events",
        events: [
          {
            title: "Agnel Quest — Annual Inter-Collegiate Cultural Festival",
            date: "2024-12-18",
            location: "College Main Grounds & Auditorium",
            description: "A 3-day cultural extravaganza featuring music concerts, street plays, dance face-offs, and fine arts exhibitions."
          },
          {
            title: "Hack-Agnel 2024: 24-Hour National Hackathon",
            date: "2024-09-14",
            location: "Computer Labs 1 & 2",
            description: "Over 50 teams building cutting-edge web, mobile, and AI solutions for smart city and education challenges."
          },
          {
            title: "Annual Sports Meet & Inter-Department Championship",
            date: "2024-11-25",
            location: "College Sports Pavilion",
            description: "Track and field athletics, football, basketball, and volleyball finals with trophy distribution."
          }
        ]
      }
    ]
  }
];

// Execute Population
const populatePages = async () => {
  try {
    console.log("\n=======================================================");
    console.log("COLLEGE CMS — CONSOLIDATED PAGES WITH RICH SECTION EDITORS");
    console.log("=======================================================\n");

    await connectDB();

    // 1. Clean existing menus that are no longer part of the consolidated list
    const activeKeys = navigationMenusData.map(m => m.key);
    await NavigationMenu.deleteMany({ key: { $nin: activeKeys } });

    // Sync Consolidated Navigation Menus
    console.log("1. Synchronizing 9 Consolidated Navigation Menus...");
    for (const menuData of navigationMenusData) {
      await NavigationMenu.findOneAndUpdate(
        { key: menuData.key },
        { ...menuData },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ ${navigationMenusData.length} Navigation Menus updated/verified.`);

    // 2. Clean up any existing demo pages (leaving "home" completely untouched)
    console.log("\n2. Removing existing demo pages to avoid slug collisions...");
    const existingDemoPages = await Page.find({ slug: { $ne: "home" } });
    const existingDemoIds = existingDemoPages.map(p => p._id);

    await NavigationItem.deleteMany({
      $or: [
        { pageId: { $in: existingDemoIds } },
        { menuKey: { $in: activeKeys } }
      ]
    });

    await Page.deleteMany({ slug: { $ne: "home" } });
    console.log(`✅ Cleaned up old demo records while preserving Home.`);

    // 3. Create all pages and their corresponding NavigationItem records
    console.log("\n3. Populating Dynamic Pages and Consolidated Navigation Items...");
    let createdCount = 0;

    // Track order per parent menu
    const menuOrderTracker = {};

    for (const pageDef of pagesData) {
      const parentKey = pageDef.parentSlug;
      if (!menuOrderTracker[parentKey]) {
        menuOrderTracker[parentKey] = 1;
      } else {
        menuOrderTracker[parentKey] += 1;
      }
      const order = menuOrderTracker[parentKey];

      // Create Page
      const pageRecord = await Page.create({
        slug: pageDef.slug,
        title: pageDef.title,
        parentSlug: pageDef.parentSlug,
        template: pageDef.template || "default",
        sections: pageDef.sections || [],
        courseData: pageDef.courseData || null,
        isPublished: true,
        isDemoContent: true
      });

      // Create Navigation Item
      await NavigationItem.create({
        pageId: pageRecord._id,
        menuKey: pageDef.parentSlug,
        label: pageDef.title,
        slug: `/${pageDef.parentSlug}/${pageDef.slug}`,
        icon: pageDef.icon || "FileText",
        order: order,
        isActive: true
      });

      createdCount++;
      console.log(`  + Created [${pageDef.parentSlug}] /${pageDef.slug} — "${pageDef.title}" (${pageDef.template || "default"})`);
    }

    console.log(`\n✅ Successfully created ${createdCount} dynamic pages with consolidated navigation items!`);

    // 4. Verify Home Page is untouched
    const homePage = await Page.findOne({ slug: "home" });
    console.log(`\nHome Page Status: ${homePage ? "INTACT (ID: " + homePage._id + ")" : "NOT FOUND (Warning!)"}`);

    const totalPages = await Page.countDocuments();
    const totalItems = await NavigationItem.countDocuments();
    const totalMenus = await NavigationMenu.countDocuments();

    console.log("\n=======================================================");
    console.log("POPULATION SUMMARY:");
    console.log(`Total Pages in Database:       ${totalPages}`);
    console.log(`Total Navigation Items:        ${totalItems}`);
    console.log(`Total Navigation Menus:        ${totalMenus}`);
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Population failed:", error);
    process.exit(1);
  }
};

populatePages();
