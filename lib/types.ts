export type BookingRules = {
  enabledWeekdays: number[];
  timeSlots: string[];
  holdExpiryMinutes?: number;
};

export type WhatsappSettings = {
  phoneNumberId: string;
  accessToken: string;
  staffTo: string;
  staffTemplateName?: string;
  staffTemplateLang?: string;
  customerTemplateName?: string;
  customerTemplateLang?: string;
};
