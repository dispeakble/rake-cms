/**
 * Review/testimonial data for the theme generator.
 * Returns curated reviews based on business type.
 */

export interface Review {
  author: string;
  text: string;
  rating: number; // 1-5
  source: string; // "Tripadvisor" | "Google" | "Restaurant Guru"
  date?: string;
}

/**
 * Get curated reviews for a specific business type.
 * @param businessName - The business name for use in review text
 * @param businessType - The type of business (restaurant, travel, etc.)
 */
export function getReviews(businessName: string, businessType?: string): Review[] {
  if (businessType === "travel") {
    return getTravelReviews(businessName);
  }
  return getRestaurantReviews(businessName);
}

function getTravelReviews(name: string): Review[] {
  return [
    {
      author: "María G.",
      text: `Contratamos una excursión a Tenerife con ${name} y fue una experiencia increíble. El guía conocía todos los rincones del Teide y nos llevó a sitios espectaculares que nunca habríamos encontrado solos. Muy recomendable.`,
      rating: 5,
      source: "Google",
    },
    {
      author: "Carlos R.",
      text: `Excelente servicio para organizar nuestro viaje a Gran Canaria. Los traslados fueron puntuales, el alojamiento perfecto y las excursiones muy bien organizadas. Repetiremos sin duda.`,
      rating: 5,
      source: "Tripadvisor",
    },
    {
      author: "Ana & Pedro",
      text: "Hicimos la ruta interinsular de 10 días y fue perfecta. Todo estaba coordinado al detalle, los hoteles excelentes y las excursiones muy variadas. Una forma maravillosa de conocer Canarias.",
      rating: 5,
      source: "Google",
    },
    {
      author: "James T.",
      text: `Booked the Tenerife and La Gomera tour package with ${name}. Absolutely stunning! The guide was knowledgeable and passionate about the islands. The boat trip to La Gomera was unforgettable.`,
      rating: 5,
      source: "Tripadvisor",
    },
    {
      author: "Laura S.",
      text: "Fuimos en familia con dos niños y todo fue genial. El alquiler de coches nos permitió movernos con libertad y las recomendaciones de restaurantes y playas fueron excelentes. Volveremos el año que viene.",
      rating: 4,
      source: "Restaurant Guru",
    },
    {
      author: "David M.",
      text: "Increíble variedad de excursiones para elegir. Desde rutas de senderismo por el Teide hasta paseos en barco avistando delfines. La atención al cliente es excepcional, siempre dispuestos a ayudar.",
      rating: 5,
      source: "Google",
    },
  ];
}

function getRestaurantReviews(name: string): Review[] {
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
