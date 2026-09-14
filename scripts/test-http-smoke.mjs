/**
 * HTTP Smoke Test for Meridian Production Server
 */

const BASE_URL = "http://localhost:3007";

async function runSmokeTests() {
  console.log(`\n=======================================================`);
  console.log(`RUNNING HTTP PRODUCTION SMOKE TESTS AGAINST ${BASE_URL}`);
  console.log(`=======================================================\n`);

  const tests = [
    {
      name: "Homepage (GET /)",
      url: `${BASE_URL}/`,
      expectedStatus: 200,
      validateContent: (html) => html.includes("Meridian") || html.includes("Marketplace"),
    },
    {
      name: "Search Page (GET /search)",
      url: `${BASE_URL}/search`,
      expectedStatus: 200,
      validateContent: (html) => html.includes("Search Results") || html.includes("Filter"),
    },
    {
      name: "Search Page with Condition & Page (GET /search?condition=EXCELLENT&page=1)",
      url: `${BASE_URL}/search?condition=EXCELLENT&page=1`,
      expectedStatus: 200,
      validateContent: (html) => html.includes("EXCELLENT") || html.includes("Search Results"),
    },
    {
      name: "Category Page (GET /category/vehicles-automotive)",
      url: `${BASE_URL}/category/vehicles-automotive`,
      expectedStatus: 200,
      validateContent: (html) => html.includes("Vehicles") || html.includes("Listings"),
    },
    {
      name: "Location Page (GET /location/new-york-metro)",
      url: `${BASE_URL}/location/new-york-metro`,
      expectedStatus: 200,
      validateContent: (html) => html.includes("New York") || html.includes("Classifieds"),
    },
    {
      name: "Listing Detail Page (GET /listing/2023-tesla-model-3-long-range-awd)",
      url: `${BASE_URL}/listing/2023-tesla-model-3-long-range-awd`,
      expectedStatus: 200,
      validateContent: (html) => html.includes("Tesla") && html.includes("Asking Price"),
    },
    {
      name: "Post Ad Page (GET /post-ad)",
      url: `${BASE_URL}/post-ad`,
      expectedStatus: 200,
      validateContent: (html) => html.includes("Create Your Marketplace Ad"),
    },
    {
      name: "Protected Dashboard Page Unauthenticated (GET /dashboard)",
      url: `${BASE_URL}/dashboard`,
      redirect: "manual",
      expectedStatus: [302, 307, 308],
      validateHeader: (res) => {
        const loc = res.headers.get("location");
        return loc && loc.includes("/login");
      },
    },
    {
      name: "Protected Admin Desk Unauthenticated (GET /admin)",
      url: `${BASE_URL}/admin`,
      redirect: "manual",
      expectedStatus: [302, 307, 308],
      validateHeader: (res) => {
        const loc = res.headers.get("location");
        return loc && loc.includes("/login?callbackUrl=/admin");
      },
    },
    {
      name: "Protected Edit Listing Unauthenticated (GET /dashboard/listings/sample-123/edit)",
      url: `${BASE_URL}/dashboard/listings/sample-123/edit`,
      redirect: "manual",
      expectedStatus: [302, 307, 308],
      validateHeader: (res) => {
        const loc = res.headers.get("location");
        return loc && loc.includes("/login");
      },
    },
  ];

  let passed = 0;

  for (const t of tests) {
    try {
      const res = await fetch(t.url, {
        redirect: t.redirect || "follow",
      });

      const statusMatches = Array.isArray(t.expectedStatus)
        ? t.expectedStatus.includes(res.status)
        : res.status === t.expectedStatus;

      if (!statusMatches) {
        throw new Error(`Expected status ${t.expectedStatus}, got ${res.status}`);
      }

      if (t.validateContent) {
        const text = await res.text();
        if (!t.validateContent(text)) {
          throw new Error("Content validation assertion failed");
        }
      }

      if (t.validateHeader) {
        if (!t.validateHeader(res)) {
          throw new Error(`Header validation assertion failed: location=${res.headers.get("location")}`);
        }
      }

      console.log(`  ✔ PASS: ${t.name} -> HTTP ${res.status}`);
      passed++;
    } catch (err) {
      console.error(`  ✖ FAIL: ${t.name} -> ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\n=======================================================`);
  console.log(`ALL HTTP SMOKE TESTS PASSED: ${passed}/${tests.length}`);
  console.log(`=======================================================\n`);
}

runSmokeTests().catch((err) => {
  console.error("Smoke test failure:", err);
  process.exit(1);
});
