import { z } from 'zod';
import type { Fefco, CardboardType, CardboardGrade, Print, SlaType, QuoteFormPayload } from './types';

// Опции FEFCO
export const fefcoFoldingOptions: Fefco[] = ["0200", "0201", "0203", "0205", "0210", "0211", "0215"];
export const fefcoWrappingOptions: Fefco[] = ["0426", "0427"];
export const fefcoAuxiliaryOptions: Fefco[] = ["501"];
export const fefcoOptions: Fefco[] = [...fefcoFoldingOptions, ...fefcoWrappingOptions, ...fefcoAuxiliaryOptions];

// Опции типов картона
export const cardboardTypeOptions: CardboardType[] = ["3-х слойный гофрокартон", "3-х слойный микрогофрокартон"];

// Опции марок картона
export const cardboardGradeOptions: CardboardGrade[] = ["Т21 крафт", "Т22 крафт", "Т22 бел", "Т23 крафт", "Т23 бел", "Т24 крафт", "Т24 бел"];

export const printOptions: Print[] = ["Да", "Нет"];
export const slaOptions: SlaType[] = ["стандарт", "срочно", "эконом"];

export const quoteSchema = z.object({
  fefco: z.string().min(1, 'Выберите код FEFCO'),
  cardboard_type: z.string().min(1, 'Выберите тип картона'),
  cardboard_grade: z.string().optional(),
  x_mm: z.number().int().min(20, 'Минимум 20').max(1200, 'Максимум 1200'),
  y_mm: z.number().int().min(20, 'Минимум 20').max(1200, 'Максимум 1200'),
  z_mm: z.number().int().min(20, 'Минимум 20').max(1200, 'Максимум 1200'),
  print: z.string().optional(),
  qty: z.number().int().min(1, 'Минимум 1').max(100000, 'Максимум 100000'),
  sla_type: z.string().min(1, 'Выберите срок'),
  batch_cost: z.number().int().min(0, 'Минимум 0').max(10000000, 'Максимум 10,000,000').optional(),
  selected_tariff: z.string().optional(),
  final_price: z.number().min(0).optional(),
  company: z.string().max(200).optional(),
  contact_name: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Неверный email')
    .optional()
    .or(z.literal('')),
  tg_username: z.string().max(50).optional(),
  consent_given: z.boolean().optional(),
}).refine((data) => {
  // Если выбран 3-х слойный гофрокартон, то марка обязательна
  if (data.cardboard_type === "3-х слойный гофрокартон" && !data.cardboard_grade) {
    return false;
  }
  return true;
}, {
  message: "Марка картона обязательна для 3-х слойного гофрокартона",
  path: ["cardboard_grade"],
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

export function toPayload(data: QuoteFormData): QuoteFormPayload {
  return data as QuoteFormPayload;
}

