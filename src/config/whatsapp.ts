export const WHATSAPP_CONFIG = {
  phoneNumber: '+880 1893-383187',
  rawPhone: '8801893383187',
  defaultMessage: 'Hello DARKVENCE, I would like to discuss a project.',
  getChatUrl: (customMessage?: string) => {
    const text = customMessage || 'Hello DARKVENCE, I would like to discuss a project.';
    return `https://wa.me/8801893383187?text=${encodeURIComponent(text)}`;
  }
};
