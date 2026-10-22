import { z } from 'zod';
import axios from '@commons/axios';

const APIURL = import.meta.env.VITE_API_URL;
const BASE_URL = `${APIURL}/admin/broadcast-option-template`;

const reqSchema = z.object({
  name: z.string().min(1, 'Nama Template Harus Diisi'),
  templateId: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  billingStatus: z.array(z.string()),
  whatsappNode: z.array(z.string()),
  messagePerSession: z.number().optional(),
  messageDelay: z.number().optional(),
  sessionDelay: z.number().optional(),
  specialCustomer: z.boolean().optional(),
  withInvoice: z.boolean().optional(),
});

const findBroadcastOptionTemplateWhatsappNodeSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
});

const findBroadcastOptionTemplateSchema = z.object({
  _id: z.string(),
  billingStatus: z.array(z.string()),
  messagePerSession: z.number(),
  messageDelay: z.number(),
  sessionDelay: z.number(),
  message: z.null(),
  name: z.string(),
  template_id: z.string(),
  templateName: z.string(),
  createdBy: z.string(),
  whatsappNodes: z.array(findBroadcastOptionTemplateWhatsappNodeSchema),
  withInvoice: z.boolean(),
  specialCustomer: z.boolean(),
});

/**
 * @typedef {z.infer<typeof findBroadcastOptionTemplateSchema>} BroadcastOptionTemplate
 * @typedef {z.infer<typeof findBroadcastOptionTemplateWhatsappNodeSchema>} BroadcastOptionTemplateWhatsappNode
 * @typedef {z.infer<typeof reqSchema>} CreateBroadcastOptionTemplateReq
 */

/**
 * Finds all broadcast option templates.
 * @returns {Promise<z.infer<typeof findBroadcastOptionTemplateSchema>[]>}
 */
export async function findAll() {
  const { data } = await axios.get(`${BASE_URL}/`);
  return data.message;
}

/**
 * Creates a new broadcast option template.
 * @param {z.infer<typeof reqSchema>} body
 * @returns {Promise<object>}
 */
export async function create(body) {
  const reqBody = reqSchema.parse(body);
  const { data } = await axios.post(`${BASE_URL}/`, reqBody);
  return data.message;
}

/**
 * Updates an existing broadcast option template.
 * @param {string} id
 * @param {z.infer<typeof reqSchema>} body
 * @returns {Promise<object>}
 */
export async function update(id, body) {
  const reqBody = reqSchema.parse(body);
  const { data } = await axios.put(`${BASE_URL}/${id}`, reqBody);
  return data.message;
}

/**
 * Finds all broadcast option templates with optional filters.
 * @param {string} id
 * @returns {Promise<string>}
 */
export async function remove(id) {
  const { data } = await axios.delete(`${BASE_URL}/${id}`);
  return data.message;
}

/**
 * @param {string} id
 * @returns {Promise<BroadcastOptionTemplate>}
 */
export async function findDetail(id) {
  const { data } = await axios.get(`${BASE_URL}/${id}`);
  return data.message;
}
