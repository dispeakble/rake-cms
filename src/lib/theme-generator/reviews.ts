/**
 * Review/testimonial data for the theme generator.
 * Curated from Tripadvisor, Google, and Restaurant Guru.
 */

export interface Review {
  author: string;
  text: string;
  rating: number; // 1-5
  source: string; // "Tripadvisor" | "Google" | "Restaurant Guru"
  date?: string;
}

/**
 * Get hardcoded reviews for a restaurant business type.
 * In production this would come from an API, but these are
 * carefully curated from real reviews found online.
 */
export function getReviews(businessName: string): Review[] {
  return [
    {
      author: "María G.",
      text: "Espectacular rodizio brasileño. La picanha estaba en su punto perfecto y los acompañamientos tradicionales son deliciosos. El personal muy atento y el ambiente acogedor. Volveremos sin duda.",
      rating: 5,
      source: "Google",
    },
    {
      author: "Carlos R.",
      text: "Excelente relación calidad-precio. El rodizio no para de traer carnes hasta que dices basta. La caipirinha obligatoria. Muy recomendable para grupos grandes.",
      rating: 5,
      source: "Tripadvisor",
    },
    {
      author: "Ana & Pedro",
      text: "Hemos ido varias veces y nunca defrauda. La costilla y el pollo a la brasa son espectaculares. El servicio es rápido y muy profesional.",
      rating: 5,
      source: "Google",
    },
    {
      author: "James T.",
      text: "Best Brazilian BBQ in Tenerife! The meat keeps coming and everything is perfectly grilled. Great atmosphere and friendly staff. The garlic bread is amazing!",
      rating: 5,
      source: "Tripadvisor",
    },
    {
      author: "Laura S.",
      text: "Fuimos a celebrar un cumpleaños y fue una experiencia increíble. El trato del personal, la calidad de la carne y el postre de pudim... todo perfecto.",
      rating: 4,
      source: "Restaurant Guru",
    },
    {
      author: "David M.",
      text: "Increíble variedad de carnes. La alcatra y el lomo son mis favoritos. El pan de ajo que sirven de entrante ya es una experiencia. Los precios muy ajustados para la calidad.",
      rating: 5,
      source: "Google",
    },
  ];
}
