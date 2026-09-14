import { Category, Listing, Location } from "../types";
import { CATEGORIES } from "./categories";
import { LOCATIONS } from "./locations";
import { LISTINGS } from "./listings";

/**
 * EXPLICIT PUBLIC DEMO DATA SET
 * Used ONLY as a graceful visual fallback for public read-only pages (Home, Explore)
 * when PostgreSQL is not yet provisioned in a local development environment.
 *
 * NOT used for authentication, user dashboards, or listing mutations.
 */
export const IS_DEMO_DATA = true;

export const DEMO_CATEGORIES: Category[] = CATEGORIES;
export const DEMO_LOCATIONS: Location[] = LOCATIONS;
export const DEMO_LISTINGS: Listing[] = LISTINGS;
