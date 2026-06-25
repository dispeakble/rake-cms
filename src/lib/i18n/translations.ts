// ============================================================
//  translations.ts — Generic UI i18n dictionary for generated sites
//  Only generic UI labels that apply to ALL sites.
//  Site-specific content (hero, about, services, reviews, etc.)
//  is embedded directly by the theme generator from scraped data.
// ============================================================

export type Lang = 'es' | 'en' | 'ro' | 'hu';

export const translations: Record<string, Record<Lang, string>> = {
  // ─── Nav Links (generic labels) ───
  "nav.home": { es: "Inicio", en: "Home", ro: "Acasa", hu: "Főoldal" },
  "nav.about": { es: "Sobre nosotros", en: "About us", ro: "Despre noi", hu: "Rólunk" },
  "nav.services": { es: "Qué ofrecemos", en: "What we offer", ro: "Ce oferim", hu: "Szolgáltatásaink" },
  "nav.excursions": { es: "Excursiones", en: "Excursions", ro: "Excursii", hu: "Kirándulások" },
  "nav.contact": { es: "Contacto", en: "Contact", ro: "Contact", hu: "Kapcsolat" },
  "nav.b2b": { es: "B2B", en: "B2B", ro: "B2B", hu: "B2B" },
  "nav.menu": { es: "Nuestra Carta", en: "Our Menu", ro: "Meniul Nostru", hu: "Étlapunk" },
  "nav.products": { es: "Productos", en: "Products", ro: "Produse", hu: "Termékek" },
  "nav.blog": { es: "Blog", en: "Blog", ro: "Blog", hu: "Blog" },

  // ─── Reviews section badge (generic) ───
  "reviews.title": { es: "Lo que dicen nuestros clientes", en: "What our clients say", ro: "Ce spun clienții noștri", hu: "Mit mondanak ügyfeleink" },
  "reviews.subtitle": { es: "Testimonios", en: "Testimonials", ro: "Testimoniale", hu: "Vélemények" },
  "reviews.tagline": { es: "Opiniones reales de clientes reales.", en: "Real reviews from real clients.", ro: "Opinii reale de la clienți reali.", hu: "Valódi vélemények valódi ügyfelektől" },

  // ─── Hero generic labels ───
  "hero.scroll": { es: "Scroll", en: "Scroll", ro: "Derulează", hu: "Görgess" },
  "hero.cta_services": { es: "Explora nuestros servicios", en: "Explore our services", ro: "Explorează serviciile noastre", hu: "Fedezze fel szolgáltatásainkat" },
  "hero.cta_contact": { es: "Contacta con nosotros", en: "Contact us", ro: "Contactați-ne", hu: "Vegye fel velünk a kapcsolatot" },

  // ─── Contact section labels (generic form fields) ───
  "contact.title": { es: "Contacto", en: "Contact", ro: "Contact", hu: "Kapcsolat" },
  "contact.badge": { es: "Contacto", en: "Contact", ro: "Contact", hu: "Kapcsolat" },
  "contact.info_title": { es: "Información", en: "Information", ro: "Informații", hu: "Információ" },
  "contact.info_text": { es: "Estaremos encantados de atenderle. Si tiene alguna pregunta sobre nuestros servicios, no dude en contactarnos.", en: "We will be happy to assist you. If you have any questions about our services, please do not hesitate to contact us.", ro: "Vom fi încântați să vă asistăm. Dacă aveți întrebări despre serviciile noastre, nu ezitați să ne contactați.", hu: "Örömmel állunk rendelkezésére. Ha bármilyen kérdése van szolgáltatásainkkal kapcsolatban, ne habozzon kapcsolatba lépni velünk." },
  "contact.response_time": { es: "Le responderemos en un plazo de 24 horas.", en: "We will respond within 24 hours.", ro: "Vă vom răspunde în termen de 24 de ore.", hu: "24 órán belül válaszolunk." },
  "contact.form_title": { es: "Envíanos un mensaje", en: "Send us a message", ro: "Trimiteți-ne un mesaj", hu: "Küldjön üzenetet" },
  "contact.form_name_label": { es: "Nombre", en: "First Name", ro: "Prenume", hu: "Keresztnév" },
  "contact.form_name_placeholder": { es: "Su nombre", en: "Your first name", ro: "Prenumele dvs.", hu: "Az Ön keresztneve" },
  "contact.form_surname_label": { es: "Apellido", en: "Last Name", ro: "Nume", hu: "Vezetéknév" },
  "contact.form_surname_placeholder": { es: "Su apellido", en: "Your last name", ro: "Numele dvs.", hu: "Az Ön vezetékneve" },
  "contact.form_email_label": { es: "Correo electrónico", en: "Email", ro: "Adresa de email", hu: "E-mail" },
  "contact.form_email_placeholder": { es: "Su correo electrónico", en: "Your email address", ro: "Adresa dvs. de email", hu: "Az Ön e-mail címe" },
  "contact.form_phone_label": { es: "Teléfono", en: "Phone number", ro: "Numar de telefon", hu: "Telefonszám" },
  "contact.form_phone_placeholder": { es: "Su teléfono", en: "Your phone number", ro: "Numărul dvs. de telefon", hu: "Az Ön telefonszáma" },
  "contact.form_message_label": { es: "Mensaje", en: "Message", ro: "Mesaj", hu: "Üzenet" },
  "contact.form_message_placeholder": { es: "Por favor, deje su mensaje aquí ...", en: "Please leave your message here...", ro: "Va rugam sa scrieti mesajul aici...", hu: "Kérjük üzenetét ide írja..." },
  "contact.form_submit": { es: "Enviar", en: "Send", ro: "Trimite", hu: "KÜLDÉS" },
  "contact.form_all_fields": { es: "Todos los campos son obligatorios", en: "All fields are mandatory", ro: "Toate câmpurile sunt obligatorii", hu: "Minden mező kitöltése kötelező!" },
  "contact.form_error": { es: "Se ha producido un error. Por favor, inténtelo de nuevo.", en: "An error occurred. Please try again.", ro: "A apărut o eroare. Vă rugăm să încercați din nou.", hu: "Hiba történt. Kérjük, próbálja újra." },
  "contact.form_success": { es: "¡Mensaje enviado con éxito!", en: "Message sent successfully!", ro: "Mesaj trimis cu succes!", hu: "Üzenet sikeresen elküldve!" },

  // ─── Footer (generic) ───
  "footer.legal": { es: "NOTA LEGAL Y CONDICIONES DE USO DE LA PÁGINA WEB", en: "LEGAL NOTES AND THE USAGE CONDITIONS OF THE WEB PAGE", ro: "NOTA LEGALA SI CONDITII DE FOLOSIRE A PAGINII WEB", hu: "JOGI MEGJEGYZÉSEK ÉS A WEBOLDAL FELHASZNÁLÁSI FELTÉTELEI" },
  "footer.transparency": { es: "MEMORIA TRANSPARENCIA", en: "MEMORIA TRANSPARENCIA", ro: "MEMORIA TRANSPARENCIA", hu: "MEMORIA TRANSPARENCIA" },
  "footer.made_with": { es: "Hecho con ❤️ por", en: "Made with ❤️ by", ro: "Făcut cu ❤️ de", hu: "Készült ❤️-vel" },
  "footer.links": { es: "Enlaces", en: "Links", ro: "Linkuri", hu: "Linkek" },
  "footer.legal_heading": { es: "Legal", en: "Legal", ro: "Legal", hu: "Jogi" },
  "footer.legal_notice": { es: "Aviso Legal", en: "Legal Notice", ro: "Notă Legală", hu: "Jogi nyilatkozat" },
  "footer.privacy": { es: "Política de Privacidad", en: "Privacy Policy", ro: "Politica de Confidențialitate", hu: "Adatvédelmi irányelvek" },
  "footer.complete_info": { es: "Información Completa", en: "Complete Information", ro: "Informații Complete", hu: "Teljes információ" },
  "footer.copyright": { es: "Todos los derechos reservados.", en: "All rights reserved.", ro: "Toate drepturile rezervate.", hu: "Minden jog fenntartva." },

  // ─── Section slugs (generic routing) ───
  "section.hero": { es: "hero", en: "hero", ro: "hero", hu: "hero" },
  "section.about": { es: "sobre-nosotros", en: "about-us", ro: "despre-noi", hu: "rolunk" },
  "section.services": { es: "que-ofrecemos", en: "what-we-offer", ro: "ce-oferim", hu: "szolgaltatasaink" },
  "section.excursions": { es: "excursiones", en: "excursions", ro: "excursii", hu: "kirandulasok" },
  "section.contact": { es: "contacto", en: "contact", ro: "contact", hu: "kapcsolat" },
};
