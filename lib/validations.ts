import { z } from 'zod'

export const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  message: z.string().min(1).max(5000),
})

export const ArticleSchema = z.object({
  title: z.string().min(1).max(500),
  journalName: z.string().max(500).optional().nullable(),
  authors: z.string().max(1000).optional().nullable(),
  abstract: z.string().max(10000).optional().nullable(),
  doi: z.string().max(200).optional().nullable(),
  externalUrl: z.string().url().optional().or(z.literal('')).nullable(),
  pdfUrl: z.string().url().optional().or(z.literal('')).nullable(),
  publishedDate: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(true),
})

export const BillingSchema = z.object({
  leadId: z.string().min(1),
  surgeonFee: z.number().min(0).optional().default(0),
  hospitalCharges: z.number().min(0).optional().default(0),
  implantCost: z.number().min(0).optional().default(0),
  anaesthesiaFee: z.number().min(0).optional().default(0),
  otherCharges: z.number().min(0).optional().default(0),
  amountPaid: z.number().min(0).optional().default(0),
  paymentMode: z.string().optional().default(''),
  tpaName: z.string().optional().default(''),
  tpaClaimNumber: z.string().optional().default(''),
  tpaStatus: z.string().optional().default('PENDING'),
  insuranceAmount: z.number().min(0).optional().default(0),
  notes: z.string().optional().default(''),
})

export const FollowUpSchema = z.object({
  leadId: z.string().min(1),
  dueDate: z.string().min(1),
  type: z.string().min(1),
  notes: z.string().optional().default(''),
})
