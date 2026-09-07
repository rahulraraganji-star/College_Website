import mongoose from "mongoose";
import dotenv from "dotenv";
import Redirect from "../models/Redirect.js";
import FileMapping from "../models/FileMapping.js";
import Media from "../models/Media.js";
import {
  normalizePath,
  validateSourcePath,
  validateDestination,
  isSameDomainOrLocal,
} from "../utils/urlNormalizer.js";
import {
  resolveLegacyPath,
  checkCrossConflict,
  detectRedirectLoop,
} from "../services/linkResolver.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/college_cms";

const runTests = async () => {
  console.log("==================================================");
  console.log("  LINK MANAGER VERIFICATION TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = "") => {
    if (condition) {
      console.log(`✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title}`);
      if (details) console.error(`   Details: ${details}`);
      failed++;
    }
  };

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for testing.\n");

    // Clean up test records
    await Redirect.deleteMany({ sourcePath: { $regex: /^\/test-/ } });
    await FileMapping.deleteMany({ legacyPath: { $regex: /^\/wp-content\/uploads\/test-/ } });
    await Media.deleteMany({ filename: { $regex: /^test-/ } });

    // Mock media item
    const testMedia = await Media.create({
      filename: "test-aqar-2023.pdf",
      originalName: "AQAR-2023.pdf",
      url: "/uploads/media/documents/test-aqar-2023.pdf",
      type: "pdf",
      mimeType: "application/pdf",
      size: 1048576,
    });

    /* ==========================================================
       TEST 1 — Internal redirect
       Mapping: /academics/courses -> /about-us/history
       Expected: 301, Location: /about-us/history
    ========================================================== */
    const redirect1 = await Redirect.create({
      sourcePath: "/test-academics-courses",
      destination: "/about-us/history",
      statusCode: 301,
      active: true,
      description: "Old courses redirect",
    });

    const res1 = await resolveLegacyPath("/test-academics-courses", { trackHit: true });
    assert(
      res1.found &&
        res1.type === "redirect" &&
        res1.statusCode === 301 &&
        res1.destination === "/about-us/history",
      "TEST 1: Internal redirect returns HTTP 301 Location /about-us/history",
      JSON.stringify(res1)
    );

    /* ==========================================================
       TEST 2 — Absolute legacy URL normalization
       Input: https://www.fragnelcollege.edu.in/toplinks/iqac/
       Expected stored source: /toplinks/iqac
       Input: http://localhost:5173/academics/courses
       Expected stored source: /academics/courses
       Input internal destination: http://localhost:5173/about-us/history
       Expected stored destination: /about-us/history
    ========================================================== */
    const normSource1 = validateSourcePath("https://www.fragnelcollege.edu.in/toplinks/iqac/");
    const normSource2 = validateSourcePath("http://localhost:5173/academics/courses");
    const normDest1 = validateDestination("http://localhost:5173/about-us/history");
    const normDest2 = validateDestination("https://www.fragnelcollege.edu.in/about-us/history");

    assert(
      normSource1.valid &&
        normSource1.normalized === "/toplinks/iqac" &&
        normSource2.valid &&
        normSource2.normalized === "/academics/courses" &&
        normDest1.valid &&
        normDest1.normalized === "/about-us/history" &&
        normDest2.valid &&
        normDest2.normalized === "/about-us/history",
      "TEST 2: Absolute same-domain & localhost URLs normalized to relative paths",
      `normSource1: ${normSource1.normalized}, normSource2: ${normSource2.normalized}, normDest1: ${normDest1.normalized}, normDest2: ${normDest2.normalized}`
    );

    /* ==========================================================
       TEST 3 — External redirect
       Mapping: /old-page -> https://example.com/page
       Expected: 301, Location: https://example.com/page
    ========================================================== */
    const extValidation = validateDestination("https://example.com/page", { isExplicitExternal: true });
    const redirectExt = await Redirect.create({
      sourcePath: "/test-old-page",
      destination: extValidation.normalized,
      statusCode: 301,
      active: true,
    });

    const res3 = await resolveLegacyPath("/test-old-page");
    assert(
      res3.found && res3.destination === "https://example.com/page",
      "TEST 3: External redirect preserves full external destination",
      JSON.stringify(res3)
    );

    /* ==========================================================
       TEST 4 — File mapping
       Mapping: /wp-content/uploads/2023/11/AQAR-2023.pdf -> Media Library document ID
       Expected: Requesting old path resolves to the selected PDF
    ========================================================== */
    const normFileSource = validateSourcePath(
      "https://www.fragnelcollege.edu.in/wp-content/uploads/test-2023/11/AQAR-2023.pdf"
    );

    const fileMapping1 = await FileMapping.create({
      legacyPath: normFileSource.normalized,
      documentId: testMedia._id,
      active: true,
      description: "AQAR 2023 Report mapping",
    });

    const res4 = await resolveLegacyPath("/wp-content/uploads/test-2023/11/AQAR-2023.pdf", {
      trackHit: true,
    });
    assert(
      res4.found &&
        res4.type === "file" &&
        res4.document.originalName === "AQAR-2023.pdf" &&
        res4.fileUrl === testMedia.url,
      "TEST 4: Legacy File mapping resolves to existing Media Library document",
      JSON.stringify(res4)
    );

    /* ==========================================================
       TEST 5 — No mapping
       Request: /some-real-react-page
       Expected: Not found in Link Manager, allowing normal React routing
    ========================================================== */
    const res5 = await resolveLegacyPath("/some-real-react-page");
    assert(
      res5.found === false && res5.type === "not_found",
      "TEST 5: Unmapped paths return not_found without interfering with React routes",
      JSON.stringify(res5)
    );

    /* ==========================================================
       TEST 6 — Disabled mapping
       Mapping exists but is inactive
       Expected: It must NOT resolve through the Link Manager
    ========================================================== */
    const redirectInactive = await Redirect.create({
      sourcePath: "/test-disabled-link",
      destination: "/somewhere",
      active: false,
    });

    const res6 = await resolveLegacyPath("/test-disabled-link");
    assert(
      res6.found === false && res6.inactiveMatch === true,
      "TEST 6: Inactive mapping does NOT resolve through Link Manager",
      JSON.stringify(res6)
    );

    /* ==========================================================
       TEST 7 — PDF link with params & Redirect Loop Prevention
    ========================================================== */
    // A) PDF Link with query params/hashes (e.g. Acrobat reader appending params)
    const res7a = await resolveLegacyPath(
      "/wp-content/uploads/test-2023/11/AQAR-2023.pdf?download=true#page=2"
    );
    assert(
      res7a.found && res7a.type === "file" && res7a.document._id.toString() === testMedia._id.toString(),
      "TEST 7A: PDF link with query params/hash resolves correctly via FileMapping",
      JSON.stringify(res7a)
    );

    // B) Self-redirect prevention
    const selfLoop = await detectRedirectLoop("/test-loop-page", "/test-loop-page");
    assert(
      selfLoop.hasLoop === true,
      "TEST 7B: Self-redirect loop (A -> A) detected and rejected",
      selfLoop.error
    );

    // C) Circular chain redirect prevention (A -> B -> A)
    const redirectAtoB = await Redirect.create({
      sourcePath: "/test-chain-a",
      destination: "/test-chain-b",
      statusCode: 301,
      active: true,
    });

    const chainLoop = await detectRedirectLoop("/test-chain-b", "/test-chain-a");
    assert(
      chainLoop.hasLoop === true,
      "TEST 7C: Circular chain redirect loop (A -> B -> A) detected and rejected",
      chainLoop.error
    );

    // Clean up test data
    await Redirect.deleteMany({ sourcePath: { $regex: /^\/test-/ } });
    await FileMapping.deleteMany({ legacyPath: { $regex: /^\/wp-content\/uploads\/test-/ } });
    await Media.deleteMany({ _id: testMedia._id });

    console.log("\n==================================================");
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
