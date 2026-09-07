import mongoose from "mongoose";
import dotenv from "dotenv";
import Page from "../models/Page.js";
import NavigationItem from "../models/NavigationItem.js";
import NavigationMenu from "../models/NavigationMenu.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/college_cms";

const sampleCourses = [
  {
    title: "Bachelor of Computer Applications",
    slug: "bca",
    parentSlug: "academics",
    template: "courses",
    isPublished: true,
    courseData: {
      general: {
        courseName: "Bachelor of Computer Applications",
        courseCode: "BCA",
        slug: "bca",
        level: "Undergraduate",
        duration: "3 Years",
        semesters: "6",
        eligibility: "12th Pass (Mathematics / Computer Science preferred)",
        shortDescription: "A comprehensive programme designed to build strong foundations in computer applications, programming, algorithms, and modern software technology.",
        degree: "Bachelor of Computer Applications (BCA)",
        department: "Department of Computer Science & Applications",
        intake: "60 Seats",
      },
      overview: {
        description: "The Bachelor of Computer Applications (BCA) is an undergraduate academic programme that equips students with advanced skills in software development, database administration, web technologies, and computational systems. The curriculum adheres to the Choice Based Credit System (CBCS), providing both rigorous theoretical foundations and experiential laboratory learning.",
        learningOutcomes: [
          "Demonstrate proficiency in modern programming languages (C, C++, Java, Python, JavaScript) and software development methodologies.",
          "Design, normalize, and manage scalable relational and NoSQL database management systems.",
          "Apply mathematical reasoning and algorithmic problem-solving to complex computational tasks.",
          "Build responsive full-stack web and cloud applications following industry design patterns.",
          "Collaborate effectively in multidisciplinary agile teams with high ethical and professional standards."
        ],
        careerOpportunities: [
          "Full-Stack Software Developer",
          "Database Administrator / Data Analyst",
          "Cloud & Systems Engineer",
          "Cybersecurity Associate",
          "Mobile App Developer",
          "Technical Product Consultant"
        ]
      },
      highlights: [
        {
          title: "3 Years",
          description: "Full-time undergraduate degree",
          icon: "Clock",
        },
        {
          title: "6 Semesters",
          description: "CBCS structured modular curriculum",
          icon: "BookOpen",
        },
        {
          title: "140+ Credits",
          description: "Comprehensive theory & lab distribution",
          icon: "Award",
        },
        {
          title: "Industry Capstone",
          description: "Live final year software project & internship",
          icon: "CheckCircle",
        },
      ],
      curriculum: [
        {
          id: "year-1",
          yearName: "First Year",
          yearNumber: 1,
          semesters: [
            {
              id: "sem-1",
              semesterName: "Semester I",
              semesterNumber: 1,
              subjects: [
                {
                  id: "sub-101",
                  code: "BCA-101",
                  name: "Programming Fundamentals",
                  credits: 4,
                  type: "Theory + Practical",
                  description: "Introduction to structured programming, computational thinking, and algorithm development.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Introduction to Programming",
                      topics: [
                        "Introduction to programming paradigms & problem solving",
                        "Algorithms, flowcharts and pseudocode representations",
                        "Structure of a C program, compilation and execution stages",
                        "Tokens, keywords, identifiers and basic I/O operations"
                      ]
                    },
                    {
                      id: "unit-2",
                      unitNumber: 2,
                      title: "Variables, Data Types & Operators",
                      topics: [
                        "Primary and user-defined data types, qualifiers",
                        "Arithmetic, relational, logical, and bitwise operators",
                        "Operator precedence, associativity, and type casting",
                        "Standard library functions and input/output formatting"
                      ]
                    },
                    {
                      id: "unit-3",
                      unitNumber: 3,
                      title: "Control Structures & Loops",
                      topics: [
                        "Decision making: if, if-else, nested if, and switch-case",
                        "Looping constructs: for, while, and do-while loops",
                        "Break, continue, goto statements, and infinite loop traps",
                        "Nested loops and pattern generation problems"
                      ]
                    },
                    {
                      id: "unit-4",
                      unitNumber: 4,
                      title: "Functions & Storage Classes",
                      topics: [
                        "Function declaration, definition, and invocation",
                        "Pass-by-value vs pass-by-reference mechanisms",
                        "Recursive functions and recursion tree analysis",
                        "Automatic, static, external, and register storage classes"
                      ]
                    }
                  ]
                },
                {
                  id: "sub-102",
                  code: "BCA-102",
                  name: "Mathematics for Computer Science",
                  credits: 4,
                  type: "Theory",
                  description: "Discrete mathematical structures, propositional logic, and set theory.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Set Theory & Relations",
                      topics: [
                        "Sets, subsets, power sets, and Cartesian products",
                        "Venn diagrams, set identities, and De Morgan's Laws",
                        "Equivalence relations, partial orderings, and Hasse diagrams",
                        "Injective, surjective, and bijective functions"
                      ]
                    },
                    {
                      id: "unit-2",
                      unitNumber: 2,
                      title: "Propositional Logic & Proofs",
                      topics: [
                        "Propositions, truth tables, and logical connectives",
                        "Tautology, contradiction, and logical equivalences",
                        "Universal and existential quantifiers",
                        "Methods of proof: Direct, Contrapositive, and Mathematical Induction"
                      ]
                    }
                  ]
                },
                {
                  id: "sub-103",
                  code: "BCA-103",
                  name: "Web Technology",
                  credits: 3,
                  type: "Theory + Practical",
                  description: "Modern web architecture, HTML5 markup, CSS3 layouts, and DOM manipulation.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "HTML5 & Semantic Structure",
                      topics: [
                        "HTTP protocol basics, client-server web architecture",
                        "Semantic elements: header, nav, section, article, footer",
                        "Forms, inputs, client-side validation attributes",
                        "Embedding media: audio, video, SVG, and canvas"
                      ]
                    },
                    {
                      id: "unit-2",
                      unitNumber: 2,
                      title: "CSS3 & Modern Layouts",
                      topics: [
                        "CSS box model, specificity, and cascading rules",
                        "Flexbox layout system: axis, alignment, and responsiveness",
                        "CSS Grid layout: tracks, areas, and template definitions",
                        "Transitions, keyframe animations, and media queries"
                      ]
                    }
                  ]
                },
                {
                  id: "sub-104",
                  code: "BCA-104",
                  name: "Communication Skills",
                  credits: 2,
                  type: "Theory",
                  description: "Professional workplace communication, presentation skills, and technical writing.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Professional Communication",
                      topics: [
                        "Channels of communication and overcoming barriers",
                        "Technical report writing, executive summaries, and formal emails",
                        "Group discussions, interview etiquette, and public speaking",
                        "Resume formulation and portfolio presentation"
                      ]
                    }
                  ]
                },
                {
                  id: "sub-105",
                  code: "BCA-105",
                  name: "Computer Fundamentals & Architecture",
                  credits: 3,
                  type: "Theory",
                  description: "Digital logic, CPU organization, memory hierarchy, and I/O subsystems.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Digital Logic & Computer Organization",
                      topics: [
                        "Number systems: Binary, Octal, Hexadecimal, and Conversions",
                        "Logic gates, Boolean algebra, and Karnaugh maps",
                        "Instruction cycle, ALU, register transfer language",
                        "Cache memory, RAM, ROM, and secondary storage devices"
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: "sem-2",
              semesterName: "Semester II",
              semesterNumber: 2,
              subjects: [
                {
                  id: "sub-201",
                  code: "BCA-201",
                  name: "Data Structures & Algorithms",
                  credits: 4,
                  type: "Theory + Practical",
                  description: "Linear and hierarchical data structures, search algorithms, and computational complexity.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Linear Data Structures",
                      topics: [
                        "Array implementations, pointer arithmetic, memory layout",
                        "Singly, doubly, and circular linked list operations",
                        "Stack implementations, infix to postfix conversions",
                        "Linear queues, circular queues, and priority queues"
                      ]
                    },
                    {
                      id: "unit-2",
                      unitNumber: 2,
                      title: "Trees, Graphs & Searching",
                      topics: [
                        "Binary trees, Binary Search Tree (BST) traversal and balancing",
                        "Graph representation (adjacency matrix/list), BFS and DFS",
                        "Sorting algorithms: Quick Sort, Merge Sort, Heap Sort",
                        "Big-O asymptotic notation and worst/average case analysis"
                      ]
                    }
                  ]
                },
                {
                  id: "sub-202",
                  code: "BCA-202",
                  name: "Database Management Systems",
                  credits: 4,
                  type: "Theory + Practical",
                  description: "Relational data modeling, SQL queries, normalization, and transaction processing.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Relational Modeling & SQL",
                      topics: [
                        "Entity-Relationship (ER) diagrams and relational mapping",
                        "DDL, DML, DCL, and TCL commands in SQL",
                        "Complex queries, joins, subqueries, and aggregation",
                        "Views, indexes, stored procedures, and triggers"
                      ]
                    },
                    {
                      id: "unit-2",
                      unitNumber: 2,
                      title: "Normalization & Transaction Control",
                      topics: [
                        "Functional dependencies and inference rules (Armstrong's axioms)",
                        "Normal forms: 1NF, 2NF, 3NF, and BCNF",
                        "ACID properties and transaction states",
                        "Concurrency control and lock-based protocols"
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: "year-2",
          yearName: "Second Year",
          yearNumber: 2,
          semesters: [
            {
              id: "sem-3",
              semesterName: "Semester III",
              semesterNumber: 3,
              subjects: [
                {
                  id: "sub-301",
                  code: "BCA-301",
                  name: "Object-Oriented Programming with Java",
                  credits: 4,
                  type: "Theory + Practical",
                  description: "Java virtual machine, OOP pillars, collections framework, and multithreading.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Core Java & OOP Principles",
                      topics: [
                        "JVM architecture, byte code, garbage collection",
                        "Classes, objects, constructors, and method overloading",
                        "Inheritance, polymorphism, abstract classes, and interfaces",
                        "Packages, access modifiers, and Java standard library"
                      ]
                    },
                    {
                      id: "unit-2",
                      unitNumber: 2,
                      title: "Exception Handling & Collections",
                      topics: [
                        "Try, catch, finally blocks, and custom exception classes",
                        "Collections framework: List, Set, Map, and Iterator",
                        "Multithreading lifecycle, synchronization, and inter-thread comms",
                        "File I/O streams and serialization"
                      ]
                    }
                  ]
                },
                {
                  id: "sub-302",
                  code: "BCA-302",
                  name: "Computer Networks",
                  credits: 4,
                  type: "Theory",
                  description: "OSI & TCP/IP models, routing protocols, transport layer, and network security.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Network Architectures & Protocols",
                      topics: [
                        "OSI 7-layer model vs TCP/IP protocol suite",
                        "Physical layer transmission media and multiplexing",
                        "Data link layer: framing, error detection, CRC, and sliding window",
                        "Network layer: IPv4/IPv6 addressing, subnetting, and routing algorithms"
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: "sem-4",
              semesterName: "Semester IV",
              semesterNumber: 4,
              subjects: [
                {
                  id: "sub-401",
                  code: "BCA-401",
                  name: "Operating Systems",
                  credits: 4,
                  type: "Theory + Practical",
                  description: "Kernel architecture, process synchronization, memory virtualization, and file systems.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Process Management & Synchronization",
                      topics: [
                        "Process control block, state transitions, and context switching",
                        "CPU scheduling algorithms: FCFS, SJF, Priority, and Round Robin",
                        "Critical section problem, semaphores, and mutexes",
                        "Deadlock conditions, prevention, avoidance (Banker's algorithm)"
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: "year-3",
          yearName: "Third Year",
          yearNumber: 3,
          semesters: [
            {
              id: "sem-5",
              semesterName: "Semester V",
              semesterNumber: 5,
              subjects: [
                {
                  id: "sub-501",
                  code: "BCA-501",
                  name: "Software Engineering & Agile Methodologies",
                  credits: 4,
                  type: "Theory",
                  description: "Software lifecycle models, SRS documentation, UML design, and Agile Scrum framework.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Software Process & Agile",
                      topics: [
                        "Waterfall, Spiral, and Agile software development lifecycles",
                        "SRS specifications and IEEE requirements standards",
                        "UML modeling: Use case, Class, and Sequence diagrams",
                        "Software testing: Unit, Integration, System, and Black/White box tests"
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: "sem-6",
              semesterName: "Semester VI",
              semesterNumber: 6,
              subjects: [
                {
                  id: "sub-601",
                  code: "BCA-601",
                  name: "Major Capstone Project & Internship",
                  credits: 6,
                  type: "Practical",
                  description: "Full lifecycle software project implementation, industry internship, and technical viva.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Capstone Project & Viva",
                      topics: [
                        "Project proposal, feasibility study, and tech stack selection",
                        "Architecture design, implementation, and API integration",
                        "Deployment on cloud infrastructure and testing documentation",
                        "Formal viva voce defense and project report submission"
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      admission: {
        eligibilityCriteria: "Candidates must have passed 10+2 / Higher Secondary Examination from a recognized central or state board with Mathematics or Computer Science as one of the subjects, securing at least 50% aggregate marks (45% for reserved categories).",
        admissionProcess: "Admissions are processed through centralized merit-based university counseling and direct aptitude evaluation.",
        feeStructure: "Annual tuition fee: ₹45,000 / year (flexible semester installment options available with merit scholarships).",
      }
    }
  },
  {
    title: "Bachelor of Commerce",
    slug: "bcom",
    parentSlug: "academics",
    template: "courses",
    isPublished: true,
    courseData: {
      general: {
        courseName: "Bachelor of Commerce",
        courseCode: "B.Com",
        slug: "bcom",
        level: "Undergraduate",
        duration: "3 Years",
        semesters: "6",
        eligibility: "12th Pass in Commerce / Arts / Science stream",
        shortDescription: "A prestigious programme focused on financial accounting, corporate taxation, auditing, banking, and strategic business management.",
        degree: "Bachelor of Commerce (B.Com)",
        department: "Department of Commerce & Financial Studies",
        intake: "120 Seats",
      },
      overview: {
        description: "The Bachelor of Commerce (B.Com) programme is tailored to cultivate financial acumen, corporate legal understanding, taxation expertise, and managerial proficiency for the modern business world.",
        learningOutcomes: [
          "Master financial, cost, and management accounting principles.",
          "Understand direct and indirect tax laws (GST, Income Tax Act).",
          "Analyze financial markets, instruments, and corporate valuations.",
          "Apply corporate auditing principles and legal compliance guidelines."
        ],
        careerOpportunities: [
          "Chartered Accountant (CA Aspirant)",
          "Financial Analyst / Investment Consultant",
          "Taxation & Audit Specialist",
          "Banking & Insurance Executive"
        ]
      },
      highlights: [
        { title: "3 Years", description: "Comprehensive commerce degree", icon: "Clock" },
        { title: "6 Semesters", description: "CBCS curriculum", icon: "BookOpen" },
        { title: "Tax & GST Labs", description: "Hands-on Tally & ERP accounting", icon: "Award" },
        { title: "Corporate Tie-ups", description: "Internships with audit firms", icon: "CheckCircle" },
      ],
      curriculum: [
        {
          id: "year-1",
          yearName: "First Year",
          yearNumber: 1,
          semesters: [
            {
              id: "sem-1",
              semesterName: "Semester I",
              semesterNumber: 1,
              subjects: [
                {
                  id: "bcom-101",
                  code: "BCOM-101",
                  name: "Financial Accounting",
                  credits: 4,
                  type: "Theory + Practical",
                  description: "Accounting principles, ledger posting, trial balance, and final accounts.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Accounting Framework",
                      topics: [
                        "GAAP principles and accounting standards",
                        "Journal, ledger, trial balance, and reconciliation",
                        "Preparation of profit & loss statements and balance sheets"
                      ]
                    }
                  ]
                },
                {
                  id: "bcom-102",
                  code: "BCOM-102",
                  name: "Business Organization & Management",
                  credits: 4,
                  type: "Theory",
                  description: "Principles of management, organizational structures, and business environment.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Management Fundamentals",
                      topics: [
                        "Evolution of management thoughts (Taylor, Fayol)",
                        "Planning, organizing, staffing, and controlling",
                        "Leadership theories and decision making processes"
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      admission: {
        eligibilityCriteria: "Candidates must have passed 10+2 Examination with at least 45% aggregate marks from a recognized board.",
        admissionProcess: "Direct merit listing based on 10+2 marks.",
        feeStructure: "Annual tuition fee: ₹35,000 / year."
      }
    }
  },
  {
    title: "Bachelor of Business Administration",
    slug: "bba",
    parentSlug: "academics",
    template: "courses",
    isPublished: true,
    courseData: {
      general: {
        courseName: "Bachelor of Business Administration",
        courseCode: "BBA",
        slug: "bba",
        level: "Undergraduate",
        duration: "3 Years",
        semesters: "6",
        eligibility: "12th Pass with minimum 50% aggregate",
        shortDescription: "An industry-aligned professional degree focusing on marketing, human resources, organizational leadership, and entrepreneurship.",
        degree: "Bachelor of Business Administration (BBA)",
        department: "Department of Management Studies",
        intake: "60 Seats",
      },
      overview: {
        description: "The Bachelor of Business Administration (BBA) provides an intensive foundation in managerial sciences, marketing strategies, human resource leadership, and business analytics.",
        learningOutcomes: [
          "Develop executive leadership, team collaboration, and analytical decision-making skills.",
          "Formulate marketing campaigns, consumer research, and digital branding strategies.",
          "Understand supply chain dynamics, business operations, and organizational behavior."
        ],
        careerOpportunities: [
          "Business Development Manager",
          "Marketing & Brand Executive",
          "HR Operations Specialist",
          "Startup Founder / Entrepreneur"
        ]
      },
      highlights: [
        { title: "3 Years", description: "Professional leadership degree", icon: "Clock" },
        { title: "6 Semesters", description: "Case-study driven curriculum", icon: "BookOpen" },
        { title: "Incubation Cell", description: "Startup mentorship & funding guidance", icon: "Award" },
        { title: "Case Studies", description: "Harvard & IIM real-world business cases", icon: "CheckCircle" },
      ],
      curriculum: [
        {
          id: "year-1",
          yearName: "First Year",
          yearNumber: 1,
          semesters: [
            {
              id: "sem-1",
              semesterName: "Semester I",
              semesterNumber: 1,
              subjects: [
                {
                  id: "bba-101",
                  code: "BBA-101",
                  name: "Principles of Management",
                  credits: 4,
                  type: "Theory",
                  description: "Classical and modern management theories and executive decision-making.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Foundations of Management",
                      topics: [
                        "Management concepts, levels, and administrative roles",
                        "Strategic planning, MBO, and SWOT analysis",
                        "Organizational culture, ethics, and corporate governance"
                      ]
                    }
                  ]
                },
                {
                  id: "bba-102",
                  code: "BBA-102",
                  name: "Marketing Management",
                  credits: 4,
                  type: "Theory + Practical",
                  description: "Consumer behavior, market segmentation, 4Ps marketing mix, and digital branding.",
                  syllabus: [
                    {
                      id: "unit-1",
                      unitNumber: 1,
                      title: "Marketing Concepts & Strategy",
                      topics: [
                        "Marketing philosophies and consumer value propositions",
                        "Segmentation, Targeting, and Positioning (STP)",
                        "Product lifecycle management, pricing, and distribution strategies"
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      admission: {
        eligibilityCriteria: "Candidates must have passed 10+2 Examination with at least 50% aggregate marks.",
        admissionProcess: "Merit listing and interview evaluation.",
        feeStructure: "Annual tuition fee: ₹50,000 / year."
      }
    }
  }
];

const seedCourses = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.\n");

    for (const course of sampleCourses) {
      const existing = await Page.findOne({ slug: course.slug });
      if (existing) {
        existing.template = "courses";
        existing.courseData = course.courseData;
        existing.title = course.title;
        existing.isPublished = true;
        await existing.save();
        console.log(`✅ Updated existing course page: ${course.title} (/page/${course.slug})`);
      } else {
        const newPage = await Page.create(course);
        console.log(`✅ Created new course page: ${course.title} (/page/${course.slug})`);

        // Check if navigation item exists
        if (course.parentSlug) {
          const navExists = await NavigationItem.findOne({ slug: `/${course.parentSlug}/${course.slug}` });
          if (!navExists) {
            const lastItem = await NavigationItem.find({ menuKey: course.parentSlug }).sort({ order: -1 }).limit(1);
            const nextOrder = lastItem.length > 0 ? lastItem[0].order + 1 : 1;
            await NavigationItem.create({
              pageId: newPage._id,
              menuKey: course.parentSlug,
              label: course.title,
              slug: `/${course.parentSlug}/${course.slug}`,
              icon: "GraduationCap",
              order: nextOrder,
              isActive: true,
            });
            console.log(`   Added navigation item under '${course.parentSlug}'`);
          }
        }
      }
    }

    console.log("\nCourses seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedCourses();
