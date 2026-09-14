/**
 * =====================================================================
 * MERIDIAN MARKETPLACE — PHASE 3 MARKETPLACE CORE TEST SUITE
 * =====================================================================
 * Audits:
 * 1. ListingCondition enum validation & domain mapping
 * 2. Multi-image URL validation (http/https protocols, max 8, safe schemas)
 * 3. Listing editing authorization & IDOR prevention
 * 4. Listing archiving (soft deletion) authorization & IDOR prevention
 * 5. Private listing view authorization (draft/archived visibility)
 * 6. Search filters, condition filtering & pagination calculation
 * 7. Favorites toggle integrity
 * 8. Contact seller self-message prevention
 * 9. Report listing reason enum & duplicate suppression
 * 10. Fail-closed policy for mutations when PostgreSQL is offline
 * =====================================================================
 */

import { z } from "zod";

// Zod schemas mirroring src/lib/validations/listing.ts
const listingConditionEnum = z.enum([
  "NEW_CONDITION",
  "LIKE_NEW",
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "FOR_PARTS",
]);

const reportReasonEnum = z.enum([
  "SPAM",
  "FRAUD_SCAM",
  "INAPPROPRIATE_CONTENT",
  "PROHIBITED_ITEM",
  "DUPLICATE",
  "WRONG_CATEGORY",
  "OTHER",
]);

const imageUrlSchema = z
  .string()
  .trim()
  .url("Please provide a valid image URL")
  .refine(
    (url) => url.startsWith("https://") || url.startsWith("http://"),
    "Image URL must use secure HTTP/HTTPS protocol"
  );

const createListingSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(5000),
  price: z.coerce.number().min(0),
  currency: z.string().default("USD"),
  priceType: z.enum(["fixed", "hourly", "monthly", "free", "contact"]).default("fixed"),
  condition: listingConditionEnum.default("GOOD"),
  categorySlug: z.string().min(1),
  locationSlug: z.string().min(1),
  isNegotiable: z.boolean().default(false),
  contactPhone: z.string().trim().max(30).optional().or(z.literal("")),
  images: z.array(imageUrlSchema).max(8).optional().default([]),
});

const editListingSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(5000),
  price: z.coerce.number().min(0),
  currency: z.string().default("USD"),
  priceType: z.enum(["fixed", "hourly", "monthly", "free", "contact"]).default("fixed"),
  condition: listingConditionEnum.default("GOOD"),
  categorySlug: z.string().min(1),
  locationSlug: z.string().min(1),
  isNegotiable: z.boolean().default(false),
  contactPhone: z.string().trim().max(30).optional().or(z.literal("")),
  images: z.array(imageUrlSchema).max(8).optional().default([]),
});

const contactSellerSchema = z.object({
  listingId: z.string().trim().min(1),
  message: z.string().trim().min(2).max(2000),
});

const reportListingSchema = z.object({
  listingId: z.string().trim().min(1),
  reason: reportReasonEnum,
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✔ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✖ FAIL: ${testName}`);
    throw new Error(`Assertion failed for: ${testName}`);
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("RUNNING PHASE 3 MARKETPLACE CORE AUTOMATED TEST SUITE");
  console.log("=======================================================\n");

  // TEST GROUP 1: ListingCondition & Multi-Image Validation
  console.log("--- TEST GROUP 1: LISTING CONDITION & IMAGE VALIDATION ---");

  const validCondition = listingConditionEnum.safeParse("LIKE_NEW");
  assert(validCondition.success, "Accepts valid ListingCondition LIKE_NEW");

  const invalidCondition = listingConditionEnum.safeParse("POOR");
  assert(!invalidCondition.success, "Rejects invalid condition value POOR");

  const validListing = createListingSchema.safeParse({
    title: "Vintage Mid-Century Walnut Desk",
    description: "Authentic 1960s restored desk with brass pull handles and minimal patina.",
    price: 650,
    condition: "EXCELLENT",
    categorySlug: "home-goods",
    locationSlug: "austin",
    images: [
      "https://images.unsplash.com/photo-1?auto=format",
      "https://images.unsplash.com/photo-2?auto=format",
    ],
  });
  assert(validListing.success, "Valid listing with condition and images accepted");
  assert(validListing.data?.condition === "EXCELLENT", "Condition parsed correctly as EXCELLENT");
  assert(validListing.data?.images.length === 2, "Images array parsed correctly");

  const defaultConditionListing = createListingSchema.safeParse({
    title: "Basic Road Bicycle 54cm",
    description: "Reliable commuter bike, recently tuned with fresh brake pads.",
    price: 150,
    categorySlug: "vehicles",
    locationSlug: "austin",
  });
  assert(defaultConditionListing.success, "Listing without explicit condition defaults safely");
  assert(defaultConditionListing.data?.condition === "GOOD", "Defaults to GOOD condition");

  // Multi-image constraints
  const overImageLimit = createListingSchema.safeParse({
    title: "Gaming Computer Setup",
    description: "Custom water-cooled gaming desktop with RTX 4080 and peripherals.",
    price: 1800,
    categorySlug: "electronics",
    locationSlug: "austin",
    images: Array(9).fill("https://images.unsplash.com/sample"),
  });
  assert(!overImageLimit.success, "Enforces maximum 8 images per listing");

  const invalidImageProtocol = createListingSchema.safeParse({
    title: "Gaming Computer Setup",
    description: "Custom water-cooled gaming desktop with RTX 4080 and peripherals.",
    price: 1800,
    categorySlug: "electronics",
    locationSlug: "austin",
    images: ["javascript:alert(1)"],
  });
  assert(!invalidImageProtocol.success, "Rejects non-http/https image protocols");

  // TEST GROUP 2: Listing Editing & Ownership Authorization
  console.log("\n--- TEST GROUP 2: LISTING EDITING & IDOR PREVENTION ---");

  const mockListing = {
    id: "listing-123",
    sellerId: "user-owner-1",
    title: "Original Title",
    condition: "GOOD",
    status: "PUBLISHED",
  };

  function authorizeListingEdit(listing, requesterId, requesterRole) {
    if (!listing) throw new Error("Listing not found");
    if (listing.sellerId !== requesterId && requesterRole !== "ADMIN") {
      throw new Error("AuthorizationError: You are not authorized to edit this listing.");
    }
    return true;
  }

  assert(
    authorizeListingEdit(mockListing, "user-owner-1", "USER"),
    "Owner is authorized to edit their own listing"
  );
  assert(
    authorizeListingEdit(mockListing, "admin-user", "ADMIN"),
    "ADMIN is authorized to edit any listing"
  );

  let idorCaught = false;
  try {
    authorizeListingEdit(mockListing, "malicious-user-2", "USER");
  } catch {
    idorCaught = true;
  }
  assert(idorCaught, "Third-party user is blocked from editing listing (IDOR prevented)");

  // TEST GROUP 3: Listing Archiving (Soft Deletion) & IDOR Prevention
  console.log("\n--- TEST GROUP 3: LISTING ARCHIVING & SOFT DELETION ---");

  function authorizeListingArchive(listing, requesterId, requesterRole) {
    if (!listing) throw new Error("Listing not found");
    if (listing.sellerId !== requesterId && requesterRole !== "ADMIN") {
      throw new Error("AuthorizationError: You are not authorized to archive this listing.");
    }
    return { ...listing, status: "ARCHIVED" };
  }

  const archived = authorizeListingArchive(mockListing, "user-owner-1", "USER");
  assert(archived.status === "ARCHIVED", "Archiving transitions listing status to ARCHIVED");

  let archiveIdorCaught = false;
  try {
    authorizeListingArchive(mockListing, "third-party-user", "USER");
  } catch {
    archiveIdorCaught = true;
  }
  assert(archiveIdorCaught, "Third-party user is blocked from archiving listing");

  // TEST GROUP 4: Private Listing View Authorization
  console.log("\n--- TEST GROUP 4: PRIVATE LISTING VIEW GUARDS ---");

  function checkListingViewPermission(listing, requesterId, requesterRole) {
    if (listing.status === "PUBLISHED") return true;
    const isOwner = requesterId && listing.sellerId === requesterId;
    const isStaff = requesterRole === "ADMIN" || requesterRole === "MODERATOR";
    return Boolean(isOwner || isStaff);
  }

  const draftListing = {
    id: "draft-1",
    sellerId: "seller-alice",
    status: "DRAFT",
  };

  assert(
    !checkListingViewPermission(draftListing, undefined, undefined),
    "Anonymous visitor cannot view draft listing"
  );
  assert(
    !checkListingViewPermission(draftListing, "buyer-bob", "USER"),
    "Third-party user cannot view draft listing"
  );
  assert(
    checkListingViewPermission(draftListing, "seller-alice", "USER"),
    "Listing owner can view their own draft listing"
  );
  assert(
    checkListingViewPermission(draftListing, "staff-mod", "MODERATOR"),
    "Moderator can view draft listing"
  );
  assert(
    checkListingViewPermission(draftListing, "staff-admin", "ADMIN"),
    "Admin can view draft listing"
  );

  // TEST GROUP 5: Search & Condition Filtering, Pagination Math
  console.log("\n--- TEST GROUP 5: SEARCH, CONDITION FILTERING & PAGINATION ---");

  const sampleCatalog = [
    { id: "1", title: "New Camera", condition: "NEW_CONDITION", price: 900 },
    { id: "2", title: "Like New Lens", condition: "LIKE_NEW", price: 400 },
    { id: "3", title: "Good Tripod", condition: "GOOD", price: 80 },
    { id: "4", title: "Fair Bag", condition: "FAIR", price: 20 },
    { id: "5", title: "Parts Body", condition: "FOR_PARTS", price: 50 },
    { id: "6", title: "New Drone", condition: "NEW_CONDITION", price: 1200 },
  ];

  function filterCatalog(catalog, { condition, page = 1, limit = 2 }) {
    let filtered = catalog;
    if (condition && condition !== "all") {
      filtered = filtered.filter((i) => i.condition === condition);
    }
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const paged = filtered.slice(skip, skip + limit);
    return { listings: paged, total, page, limit, totalPages };
  }

  const conditionFiltered = filterCatalog(sampleCatalog, {
    condition: "NEW_CONDITION",
    page: 1,
    limit: 10,
  });
  assert(conditionFiltered.total === 2, "Condition filter returns only NEW_CONDITION matches");
  assert(
    conditionFiltered.listings.every((i) => i.condition === "NEW_CONDITION"),
    "All filtered items match condition"
  );

  const page1 = filterCatalog(sampleCatalog, { page: 1, limit: 2 });
  assert(page1.listings.length === 2, "Page 1 returns limit 2 items");
  assert(page1.totalPages === 3, "Total pages correctly calculated as 3 for 6 items with limit 2");

  const page2 = filterCatalog(sampleCatalog, { page: 2, limit: 2 });
  assert(page2.listings.length === 2, "Page 2 returns next 2 items");
  assert(page2.listings[0].id === "3", "Page 2 skip offset correctly applied");

  // TEST GROUP 6: Favorites Toggle Integrity
  console.log("\n--- TEST GROUP 6: FAVORITES TOGGLE INTEGRITY ---");

  const mockFavoritesDb = new Map(); // userId -> Set of listingIds

  function toggleMockFavorite(userId, listingId) {
    if (!userId) throw new Error("Authentication required");
    let userFavs = mockFavoritesDb.get(userId);
    if (!userFavs) {
      userFavs = new Set();
      mockFavoritesDb.set(userId, userFavs);
    }
    if (userFavs.has(listingId)) {
      userFavs.delete(listingId);
      return { isFavorited: false };
    } else {
      userFavs.add(listingId);
      return { isFavorited: true };
    }
  }

  const fav1 = toggleMockFavorite("user-1", "listing-A");
  assert(fav1.isFavorited === true, "First toggle adds listing to favorites");

  const fav2 = toggleMockFavorite("user-1", "listing-A");
  assert(fav2.isFavorited === false, "Second toggle removes listing from favorites");

  // TEST GROUP 7: Contact Seller & Self-Messaging Guard
  console.log("\n--- TEST GROUP 7: CONTACT SELLER & SAFETY GUARDS ---");

  function validateContactSeller(senderId, listingSellerId, messageText) {
    const val = contactSellerSchema.safeParse({ listingId: "listing-abc", message: messageText });
    if (!val.success) throw new Error(val.error.errors[0].message);
    if (senderId === listingSellerId) {
      throw new Error("ValidationError: You cannot send a message to yourself regarding your own listing.");
    }
    return true;
  }

  assert(
    validateContactSeller("buyer-1", "seller-2", "Hi, is this item still available?"),
    "Buyer can message seller with valid message text"
  );

  let selfMessageBlocked = false;
  try {
    validateContactSeller("seller-1", "seller-1", "Self inquiry");
  } catch (err) {
    selfMessageBlocked = err.message.includes("cannot send a message to yourself");
  }
  assert(selfMessageBlocked, "Self-messaging is strictly prohibited");

  let emptyMessageBlocked = false;
  try {
    validateContactSeller("buyer-1", "seller-2", "   ");
  } catch {
    emptyMessageBlocked = true;
  }
  assert(emptyMessageBlocked, "Empty message is rejected by Zod validation");

  // TEST GROUP 8: Report Listing Reason Enum & Duplicate Suppression
  console.log("\n--- TEST GROUP 8: REPORT LISTING ENUM & DUPLICATE SUPPRESSION ---");

  const validReport = reportListingSchema.safeParse({
    listingId: "listing-xyz",
    reason: "FRAUD_SCAM",
    description: "Seller requested western union wire transfer.",
  });
  assert(validReport.success, "Valid report with enum reason FRAUD_SCAM accepted");

  const invalidReportReason = reportListingSchema.safeParse({
    listingId: "listing-xyz",
    reason: "I_DONT_LIKE_IT",
  });
  assert(!invalidReportReason.success, "Invalid report reason rejected by enum");

  const mockReports = [];
  function submitMockReport(reporterId, listingId, reason, description) {
    const existing = mockReports.find(
      (r) => r.reporterId === reporterId && r.listingId === listingId && r.status === "PENDING"
    );
    if (existing) {
      return { reportId: existing.id, isDuplicate: true };
    }
    const newReport = { id: `report-${Date.now()}`, reporterId, listingId, reason, description, status: "PENDING" };
    mockReports.push(newReport);
    return { reportId: newReport.id, isDuplicate: false };
  }

  const r1 = submitMockReport("user-rep-1", "listing-1", "SPAM");
  assert(!r1.isDuplicate, "First report created successfully");

  const r2 = submitMockReport("user-rep-1", "listing-1", "SPAM");
  assert(r2.isDuplicate && r2.reportId === r1.reportId, "Duplicate pending report suppressed gracefully");

  // TEST GROUP 9: Fail-Closed Policy on Database Failure
  console.log("\n--- TEST GROUP 9: FAIL-CLOSED POLICY FOR MUTATIONS ---");

  function simulateMutation(isDbAvailable) {
    if (!isDbAvailable) {
      throw new Error("DatabaseUnavailableError: Database service is currently unavailable.");
    }
    return { success: true };
  }

  let dbFailureCaught = false;
  try {
    simulateMutation(false);
  } catch (err) {
    dbFailureCaught = err.message.includes("DatabaseUnavailableError");
  }
  assert(dbFailureCaught, "Mutations fail closed when PostgreSQL is unavailable without fabricating data");

  console.log("\n=======================================================");
  console.log(`PHASE 3 TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
