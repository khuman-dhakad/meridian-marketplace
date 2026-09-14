import { z } from "zod";

export const listingConditionEnum = z.enum([
  "NEW_CONDITION",
  "LIKE_NEW",
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "FOR_PARTS",
]);

export const reportReasonEnum = z.enum([
  "SPAM",
  "FRAUD_SCAM",
  "INAPPROPRIATE_CONTENT",
  "PROHIBITED_ITEM",
  "DUPLICATE",
  "WRONG_CATEGORY",
  "OTHER",
]);

// Helper validator for image URLs (valid http/https protocol, safe image formats)
export const imageUrlSchema = z
  .string()
  .trim()
  .url("Please provide a valid image URL")
  .refine(
    (url) => url.startsWith("https://") || url.startsWith("http://"),
    "Image URL must use secure HTTP/HTTPS protocol"
  );

export const createListingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Listing title must be at least 5 characters")
    .max(120, "Listing title cannot exceed 120 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description cannot exceed 5000 characters"),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a valid number" })
    .min(0, "Price cannot be negative"),
  currency: z.string().default("USD"),
  priceType: z
    .enum(["fixed", "hourly", "monthly", "free", "contact"])
    .default("fixed"),
  condition: listingConditionEnum.default("GOOD"),
  categorySlug: z.string().min(1, "Please select a category"),
  locationSlug: z.string().min(1, "Please select a metro region"),
  isNegotiable: z.boolean().default(false),
  contactPhone: z
    .string()
    .trim()
    .max(30, "Contact phone cannot exceed 30 characters")
    .optional()
    .or(z.literal("")),
  images: z
    .array(imageUrlSchema)
    .max(8, "You may attach up to 8 images per listing")
    .optional()
    .default([]),
});

export const editListingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Listing title must be at least 5 characters")
    .max(120, "Listing title cannot exceed 120 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description cannot exceed 5000 characters"),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a valid number" })
    .min(0, "Price cannot be negative"),
  currency: z.string().default("USD"),
  priceType: z
    .enum(["fixed", "hourly", "monthly", "free", "contact"])
    .default("fixed"),
  condition: listingConditionEnum.default("GOOD"),
  categorySlug: z.string().min(1, "Please select a category"),
  locationSlug: z.string().min(1, "Please select a metro region"),
  isNegotiable: z.boolean().default(false),
  contactPhone: z
    .string()
    .trim()
    .max(30, "Contact phone cannot exceed 30 characters")
    .optional()
    .or(z.literal("")),
  images: z
    .array(imageUrlSchema)
    .max(8, "You may attach up to 8 images per listing")
    .optional()
    .default([]),
});

export const searchFilterSchema = z.object({
  query: z.string().trim().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["newest", "price_asc", "price_desc", "popular"]).optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export const moderateListingSchema = z.object({
  listingId: z.string().trim().min(1, "Listing ID is required"),
  decision: z.enum(["APPROVE", "REJECT"], {
    errorMap: () => ({ message: "Decision must be APPROVE or REJECT" }),
  }),
  reason: z.string().trim().max(500, "Reason cannot exceed 500 characters").optional(),
});

export const deleteListingSchema = z.object({
  listingId: z.string().trim().min(1, "Listing ID is required"),
});

export const favoriteSchema = z.object({
  listingId: z.string().trim().min(1, "Listing ID is required"),
});

export const reportListingSchema = z.object({
  listingId: z.string().trim().min(1, "Listing ID is required"),
  reason: reportReasonEnum,
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

export const contactSellerSchema = z.object({
  listingId: z.string().trim().min(1, "Listing ID is required"),
  message: z
    .string()
    .trim()
    .min(2, "Message must be at least 2 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
});
export const archiveListingSchema = deleteListingSchema;

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type EditListingInput = z.infer<typeof editListingSchema>;
export type SearchFilterInput = z.infer<typeof searchFilterSchema>;
export type ModerateListingInput = z.infer<typeof moderateListingSchema>;
export type DeleteListingInput = z.infer<typeof deleteListingSchema>;
export type ArchiveListingInput = z.infer<typeof archiveListingSchema>;
export type FavoriteInput = z.infer<typeof favoriteSchema>;
export type ReportListingInput = z.infer<typeof reportListingSchema>;
export type ContactSellerInput = z.infer<typeof contactSellerSchema>;
