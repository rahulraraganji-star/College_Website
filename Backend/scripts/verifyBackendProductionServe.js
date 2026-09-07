async function runVerification() {
  console.log("Starting backend verification tests...");

  const BASE_URL = "http://localhost:5000";

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Helper fetch
  async function testRoute(urlPath, options = {}) {
    try {
      const res = await fetch(`${BASE_URL}${urlPath}`, options);
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {}
      return { status: res.status, headers: res.headers, text, json };
    } catch (err) {
      return { error: err.message };
    }
  }

  // 1. Health check & Public API routes
  const apiRoot = await testRoute("/api");
  assert(apiRoot.status === 200 && apiRoot.json?.success === true, "GET /api returns 200 JSON with College CMS message");

  const apiHome = await testRoute("/api/home");
  assert(apiHome.status === 200 && (apiHome.json?.sections || apiHome.json?.pageType === "home"), "GET /api/home returns 200 JSON (Home data)");

  const apiNav = await testRoute("/api/navigation");
  assert(apiNav.status === 200 && Array.isArray(apiNav.json), "GET /api/navigation returns 200 JSON (Navigation array)");

  const apiSidebar = await testRoute("/api/pages/sidebar/academics");
  assert(apiSidebar.status === 200 && Array.isArray(apiSidebar.json), "GET /api/pages/sidebar/academics returns 200 JSON (Sidebar array)");

  // 2. Auth protection & RBAC
  const apiAdminPages = await testRoute("/api/pages");
  assert(apiAdminPages.status === 401 && apiAdminPages.json?.success === false, "GET /api/pages correctly blocks unauthorized requests with 401 JSON");

  const authLogin = await testRoute("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid@test.com", password: "wrong" }),
  });
  assert([400, 401].includes(authLogin.status) && authLogin.json?.success === false, "POST /api/auth/login processes authentication and returns expected rejection JSON");

  // 3. API 404 protection (Must NEVER return HTML)
  const api404Get = await testRoute("/api/nonexistent-endpoint-test");
  assert(api404Get.status === 404 && api404Get.json?.success === false, "GET /api/nonexistent returns 404 JSON (NOT HTML)");

  const api404Post = await testRoute("/api/nonexistent-endpoint-test", { method: "POST" });
  assert(api404Post.status === 404 && api404Post.json?.success === false, "POST /api/nonexistent returns 404 JSON (NOT HTML)");

  // 4. React Frontend Root (GET /)
  const root = await testRoute("/");
  assert(root.status === 200 && (root.text.includes('<div id="root">') || root.text.includes("<!doctype html>")), "GET / returns 200 HTML with React root");

  // 5. React Router Direct Navigation (SPA fallback)
  const admin = await testRoute("/admin");
  assert(admin.status === 200 && (admin.text.includes('<div id="root">') || admin.text.includes("<!doctype html>")), "GET /admin returns 200 HTML (React Router fallback)");

  const courses = await testRoute("/courses");
  assert(courses.status === 200 && (courses.text.includes('<div id="root">') || courses.text.includes("<!doctype html>")), "GET /courses returns 200 HTML (React Router fallback)");

  const courseSlug = await testRoute("/courses/bachelor-of-computer-applications");
  assert(courseSlug.status === 200 && (courseSlug.text.includes('<div id="root">') || courseSlug.text.includes("<!doctype html>")), "GET /courses/:slug returns 200 HTML (React Router fallback)");

  const pageSlug = await testRoute("/page/about-us");
  assert(pageSlug.status === 200 && (pageSlug.text.includes('<div id="root">') || pageSlug.text.includes("<!doctype html>")), "GET /page/:slug returns 200 HTML (React Router fallback)");

  const sectionRoute = await testRoute("/academics/departments");
  assert(sectionRoute.status === 200 && (sectionRoute.text.includes('<div id="root">') || sectionRoute.text.includes("<!doctype html>")), "GET dynamic section route returns 200 HTML (React Router fallback)");

  // 6. Static Assets (JS, CSS, SVGs)
  const viteSvg = await testRoute("/vite.svg");
  assert([200, 304].includes(viteSvg.status), "GET /vite.svg returns static asset");

  // 7. Uploads directory protection (404 without HTML)
  const missingUpload = await testRoute("/uploads/nonexistent-test-file.jpg");
  assert(missingUpload.status === 404 && !missingUpload.text.includes('<div id="root">'), "GET /uploads/nonexistent returns 404 (NOT HTML)");

  // 8. Legacy resolver protection (404 without HTML)
  const legacyResolve = await testRoute("/legacy-resolve?path=/test-nonexistent-path");
  assert(legacyResolve.status === 404 && !legacyResolve.text.includes('<div id="root">'), "GET /legacy-resolve returns 404 (NOT swallowed by React HTML)");

  console.log(`\n==========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==========================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification();
