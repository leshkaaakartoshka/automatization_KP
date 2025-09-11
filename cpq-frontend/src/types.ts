export type SlaType = "стандарт" | "срочно" | "эконом";

// Расширенные типы FEFCO
export type FefcoFolding = "0200" | "0201" | "0203" | "0205" | "0210" | "0211" | "0215";
export type FefcoWrapping = "0426" | "0427";
export type FefcoAuxiliary = "501";
export type Fefco = FefcoFolding | FefcoWrapping | FefcoAuxiliary;

// Типы картона
export type CardboardType = "3-х слойный гофрокартон" | "3-х слойный микрогофрокартон";

// Марки для 3-х слойного гофрокартона
export type CardboardGrade = "Т21 крафт" | "Т22 крафт" | "Т22 бел" | "Т23 крафт" | "Т23 бел" | "Т24 крафт" | "Т24 бел";

export type Print = "Да" | "Нет";

export type TariffType = 'standard' | 'urgent' | 'strategic';

export interface QuoteFormPayload {
  fefco: Fefco;
  cardboard_type: CardboardType;
  cardboard_grade?: CardboardGrade; // Опциональное поле, только для 3-х слойного гофрокартона
  x_mm: number; 
  y_mm: number; 
  z_mm: number;
  print?: Print;
  qty: number;
  sla_type: SlaType;
  batch_cost?: number; // Базовая стоимость партии
  selected_tariff?: TariffType; // Выбранный тариф
  final_price?: number; // Итоговая цена с учетом тарифа
  company?: string;
  contact_name?: string;
  city?: string;
  phone?: string;
  email?: string;
  tg_username?: string; // Telegram username
  consent_given?: boolean; // Согласие на обработку данных
}

