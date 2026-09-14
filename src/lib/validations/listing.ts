import { z } from "zod";

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
  categorySlug: z.string().min(1, "Please select a category"),
  locationSlug: z.string().min(1, "Please select a metro region"),
  isNegotiable: z.boolean().default(false),
  contactPhone: z
    .string()
    .trim()
    .max(30, "Contact phone cannot exceed 30 characters")
    .optional()
    .or(z.literal("")),
});

export const searchFilterSchema = z.object({
  query: z.string().trim().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["newest", "price_asc", "price_desc", "popular"]).optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
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

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type SearchFilterInput = z.infer<typeof searchFilterSchema>;
export type ModerateListingInput = z.infer<typeof moderateListingSchema>;
export type DeleteListingInput = z.infer<typeof deleteListingSchema>;
