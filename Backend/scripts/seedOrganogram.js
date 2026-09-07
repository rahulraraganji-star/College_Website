import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../database/connect.js";
import OrganogramNode from "../models/OrganogramNode.js";
import Page from "../models/page.js";

dotenv.config();

const seedOrganogram = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for Organogram Seeding...");

    // Check if nodes already exist
    const count = await OrganogramNode.countDocuments();
    if (count > 0) {
      console.log(`Organogram already contains ${count} positions. Skipping node re-creation.`);
    } else {
      console.log("Seeding initial institutional governance hierarchy...");

      // Level 0: Apex Body
      const governingBoard = await OrganogramNode.create({
        name: "Governing Board & Trust",
        designation: "Apex Institutional Governing Body",
        department: "Governance & Leadership",
        parent: null,
        order: 1,
        isActive: true,
        email: "governance@agnel.edu",
        phone: "+91 (0832) 2777000",
        bio: "The apex body responsible for policy formulation, institutional mission, and strategic resource allocation.",
        level: 0,
      });

      // Level 1: Principal
      const principal = await OrganogramNode.create({
        name: "Rev. Dr. Father Agnelo",
        designation: "Principal & Chief Academic Officer",
        department: "Executive Leadership",
        parent: governingBoard._id,
        order: 1,
        isActive: true,
        email: "principal@agnel.edu",
        phone: "+91 (0832) 2777001",
        bio: "Oversees daily academic administration, accreditation compliance, institutional vision, and university coordination.",
        level: 1,
      });

      // Level 2: Vice Principal & IQAC Director & Registrar
      const vicePrincipal = await OrganogramNode.create({
        name: "Dr. Maria D'Souza",
        designation: "Vice Principal (Academics & Administration)",
        department: "Academic Administration",
        parent: principal._id,
        order: 1,
        isActive: true,
        email: "viceprincipal@agnel.edu",
        phone: "+91 (0832) 2777002",
        bio: "Coordinates academic delivery, faculty workload, student mentoring, and exam management.",
        level: 2,
      });

      const iqacCoordinator = await OrganogramNode.create({
        name: "Dr. Rajesh K. Vernekar",
        designation: "Director / Coordinator, IQAC",
        department: "Quality Assurance & NAAC",
        parent: principal._id,
        order: 2,
        isActive: true,
        email: "iqac@agnel.edu",
        phone: "+91 (0832) 2777003",
        bio: "Ensures institutional quality benchmarks, AQAR/SSR submissions, feedback analysis, and best practices.",
        level: 2,
      });

      const registrar = await OrganogramNode.create({
        name: "Mr. Anthony Fernandes",
        designation: "Registrar / Administrative Officer",
        department: "General Administration & Finance",
        parent: principal._id,
        order: 3,
        isActive: true,
        email: "registrar@agnel.edu",
        phone: "+91 (0832) 2777004",
        bio: "Leads administrative staff, student records, admissions facilitation, and estate management.",
        level: 2,
      });

      // Level 3: Department Heads under Vice Principal
      const hodCS = await OrganogramNode.create({
        name: "Dr. Sneha Naik",
        designation: "Head, Department of Computer Applications",
        department: "Computer Applications (BCA)",
        parent: vicePrincipal._id,
        order: 1,
        isActive: true,
        email: "hod.bca@agnel.edu",
        phone: "+91 (0832) 2777010",
        bio: "Manages computer laboratories, IT curriculum delivery, student internships, and Hack-Agnel hackathons.",
        level: 3,
      });

      const hodCommerce = await OrganogramNode.create({
        name: "Dr. Rohan Pai",
        designation: "Head, Department of Commerce",
        department: "Commerce & Management (B.Com)",
        parent: vicePrincipal._id,
        order: 2,
        isActive: true,
        email: "hod.commerce@agnel.edu",
        phone: "+91 (0832) 2777020",
        bio: "Leads Commerce faculty, CBCS curriculum planning, industry internships, and financial literacy workshops.",
        level: 3,
      });

      const hodArts = await OrganogramNode.create({
        name: "Dr. Sunita Gaonkar",
        designation: "Head, Department of Humanities",
        department: "Humanities & Social Sciences (BA)",
        parent: vicePrincipal._id,
        order: 3,
        isActive: true,
        email: "hod.arts@agnel.edu",
        phone: "+91 (0832) 2777030",
        bio: "Coordinates Economics, Psychology, and English literature disciplines, research publications, and field study.",
        level: 3,
      });

      console.log("✅ Seeded 8 core organizational hierarchy nodes successfully.");
    }

    // Update `/about/organogram` dynamic page with organogram section if present
    const organogramPage = await Page.findOne({ slug: "organogram" });
    if (organogramPage) {
      organogramPage.sections = [
        {
          id: "hero_organogram",
          type: "hero",
          heading: "Administrative & Academic Organogram",
          subheading: "Hierarchical governance, operational reporting lines, and leadership framework of the college.",
          height: "medium",
        },
        {
          id: "sec_organogram_tree",
          type: "organogram",
          title: "Institutional Governance Hierarchy",
          subheading: "Dynamic organizational chart detailing leadership offices and reporting relationships.",
        },
      ];
      await organogramPage.save();
      console.log("✅ Updated /about/organogram page with live organogram section.");
    }

    console.log("Organogram seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed organogram failed:", error);
    process.exit(1);
  }
};

seedOrganogram();
