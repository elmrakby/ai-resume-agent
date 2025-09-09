import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  pgEnum,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const planEnum = pgEnum('plan', ['BASIC', 'STANDARD', 'PREMIUM']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PAID', 'FAILED', 'CANCELED']);
export const gatewayEnum = pgEnum('gateway', ['STRIPE', 'PAYMOB']);
export const currencyEnum = pgEnum('currency', ['USD', 'EGP']);
export const languageEnum = pgEnum('language', ['EN', 'AR', 'BOTH']);
export const submissionStatusEnum = pgEnum('submission_status', ['NEW', 'IN_PROGRESS', 'QA', 'DELIVERED']);

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  plan: planEnum("plan").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: currencyEnum("currency").notNull(),
  gateway: gatewayEnum("gateway").notNull(),
  status: orderStatusEnum("status").notNull().default('PENDING'),
  externalId: varchar("external_id"), // Stripe session ID or Paymob order ID
  countryCode: varchar("country_code", { length: 2 }),
  ip: varchar("ip"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Submissions table
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  roleTarget: text("role_target").notNull(),
  industry: text("industry"),
  language: languageEnum("language").notNull().default('EN'),
  jobAdUrl: text("job_ad_url"),
  jobAdText: text("job_ad_text"),
  notes: text("notes"),
  cvFileUrl: text("cv_file_url"),
  coverLetterFileUrl: text("cover_letter_file_url"),
  status: submissionStatusEnum("status").notNull().default('NEW'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  submissions: many(submissions),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [submissions.orderId],
    references: [orders.id],
  }),
}));

// Zod schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  jobAdUrl: z.string().url().optional().or(z.literal('')),
  jobAdText: z.string().optional(),
}).refine(
  (data) => data.jobAdUrl || data.jobAdText,
  {
    message: "Either job URL or job description text must be provided",
    path: ["jobAdUrl"],
  }
);

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

// Package pricing configuration
export const PACKAGE_CONFIG = {
  BASIC: {
    name: 'Basic',
    priceUSD: 49,
    priceEGP: 2450, // ~50x rate
    features: [
      'ATS-optimized resume',
      '48-hour delivery',
      'PDF & Word formats'
    ]
  },
  STANDARD: {
    name: 'Standard',
    priceUSD: 99,
    priceEGP: 4950,
    features: [
      'Everything in Basic',
      'LinkedIn profile rewrite',
      '1 tailored cover letter',
      '1 revision round'
    ],
    popular: true
  },
  PREMIUM: {
    name: 'Premium',
    priceUSD: 199,
    priceEGP: 9950,
    features: [
      'Everything in Standard',
      '2 resume variations',
      'Multiple cover letters',
      'Mock interview Q&A',
      '1-week priority support'
    ]
  }
} as const;
