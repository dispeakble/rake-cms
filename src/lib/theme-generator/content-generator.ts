/**
 * Content Generator — produces realistic, business-type-aware copy
 * for landing pages, service descriptions, about sections, and taglines.
 *
 * Uses scraped data as context and fills in smart templates so every
 * generated site reads like a real business website — not placeholder text.
 */
import type { ScrapedSite, BusinessType } from "@/lib/scraper/web-scraper";
import type { BusinessData } from "@/lib/scraper/maps-scraper";

export interface GeneratedContent {
  tagline: string;
  heroSubtitle: string;
  aboutHeading: string;
  aboutParagraphs: string[];
  services: { title: string; description: string }[];
  seoDescription: string;
}

/**
 * Industry-specific tagline templates.
 */
const TAGLINES: Record<BusinessType, string[]> = {
  restaurant: [
    "CARNE SIN FIN, SABOR SIN LÍMITE",
    "El auténtico rodizio brasileño en Tenerife",
    "Cortes premium, tradición gaucha, sabor inigualable",
    "Déjate llevar por la tradición del asado brasileño",
  ],
  retail: [
    "Discover products you'll love",
    "Your destination for quality and style",
    "Shop the best, leave the rest",
    "Find everything you need in one place",
  ],
  service: [
    "Professional service you can count on",
    "Quality work, guaranteed results",
    "We take care of it, so you don't have to",
    "Reliable service at your doorstep",
  ],
  professional: [
    "Expert advice when it matters most",
    "Strategic solutions for your success",
    "Trusted guidance every step of the way",
    "Your goals, our expertise",
  ],
  healthcare: [
    "Your health is our highest priority",
    "Caring for you and your family",
    "Compassionate care, advanced medicine",
    "Wellness starts here",
  ],
  education: [
    "Unlock your full potential",
    "Learn, grow, and thrive with us",
    "Building brighter futures together",
    "Education that inspires",
  ],
  technology: [
    "Innovation that drives results",
    "Transforming ideas into digital reality",
    "Technology built for tomorrow",
    "Smart solutions for modern business",
  ],
  "real-estate": [
    "Find your perfect place",
    "More than a home, it's a lifestyle",
    "Your dream property awaits",
    "Expert guidance in real estate",
  ],
  construction: [
    "Building your vision from the ground up",
    "Quality construction, lasting value",
    "Turning blueprints into reality",
    "Built to last, designed to impress",
  ],
  creative: [
    "Where creativity meets strategy",
    "Bringing your brand to life",
    "Design that speaks volumes",
    "Creative solutions that stand out",
  ],
  travel: [
    "DESCUBRE LAS ISLAS CANARIAS CON NOSOTROS",
    "Crea tu tipo de vacaciones",
    "Tu aventura en Canarias empieza aquí",
    "Explora, sueña, descubre — Islas Canarias",
    "Vacaciones que mereces, experiencias que recordarás",
  ],
  other: [
    "Exceptional service, every time",
    "Your trusted local partner",
    "Quality you can rely on",
    "Dedicated to your satisfaction",
  ],
};

/**
 * Service offerings by business type.
 */
const SERVICE_TEMPLATES: Record<BusinessType, { title: string; description: string }[]> = {
  restaurant: [
    {
      title: "Picanha Premium",
      description: "El corte estrella de nuestra casa. Picanha brasileña seleccionada, asada a la perfección en nuestros espetos verticales. Jugosa por dentro, crocante por fuera, servida en su punto exacto directamente de la parrilla a su mesa.",
    },
    {
      title: "Alcatra",
      description: "Tierno corte de contrafilet bañado en una salsa de ajo y aceite de oliva que realza su sabor natural. Una experiencia que combina la tradición gaucha con un toque de sofisticación.",
    },
    {
      title: "Costela de Res",
      description: "Nuestra costilla de res se cocina lentamente durante horas hasta que la carne se desprende del hueso. Ahumada y caramelizada de forma natural, es uno de los platos más aclamados por nuestros comensales.",
    },
    {
      title: "Medallones de Lomo",
      description: "Jugosos medallones de lomo de ternera envueltos en panceta, asados a la parrilla hasta conseguir ese punto perfecto. Una delicia que combina textura y sabor en cada bocado.",
    },
    {
      title: "Entraña y Solomillo",
      description: "Dos cortes emblemáticos de la parrilla argentina y brasileña. La entraña, tierna y sabrosa, junto al solomillo más selecto, servidos con chimichurri casero y farofa crujiente.",
    },
    {
      title: "Postres y Carta de Vinos",
      description: "Una cuidada selección de vinos españoles y sudamericanos para maridar cada corte. Nuestros postres caseros, como la tradicional delicia de maracuyá y el pudim de leche condensada, ponen el broche de oro a la experiencia.",
    },
  ],
  retail: [
    { title: "Product Selection", description: "Browse our carefully curated collection of products. We pride ourselves on offering only the highest quality items." },
    { title: "Personal Shopping", description: "Not sure what you're looking for? Our friendly staff are always on hand to help you find exactly what you need." },
    { title: "Online Store", description: "Shop from the comfort of your home. Fast delivery and easy returns on all online purchases." },
  ],
  service: [
    { title: "Expert Consultation", description: "Not sure what you need? We start every project with a thorough consultation to understand your requirements." },
    { title: "Professional Service", description: "Our experienced team delivers reliable, high-quality service every time. We stand behind our work." },
    { title: "Emergency Support", description: "Need help urgently? We offer fast-response emergency services to get you back on track quickly." },
  ],
  professional: [
    { title: "Strategic Consulting", description: "We help you navigate complex challenges with clear, actionable strategies tailored to your unique situation." },
    { title: "Ongoing Support", description: "Stay ahead with our continuous support and advisory services. We're with you every step of the way." },
    { title: "Training & Workshops", description: "Empower your team with knowledge. We offer customized training sessions designed to build real skills." },
  ],
  healthcare: [
    { title: "General Checkups", description: "Regular health checkups are the foundation of preventive care. Our comprehensive exams cover all the essentials." },
    { title: "Specialized Care", description: "From routine procedures to specialized treatments, we provide comprehensive care tailored to your needs." },
    { title: "Wellness Programs", description: "Take a proactive approach to your health. Our wellness programs help you live your best life." },
  ],
  education: [
    { title: "Courses & Programs", description: "Explore our range of courses designed for learners at every level. Flexible scheduling to fit your life." },
    { title: "One-on-One Tutoring", description: "Get personalized attention with our private tutoring sessions. Achieve your learning goals faster." },
    { title: "Workshops & Seminars", description: "Deepen your knowledge with our intensive workshops. Learn from experienced professionals." },
  ],
  technology: [
    { title: "Software Development", description: "Custom software solutions built with modern technology stacks. From web apps to mobile platforms." },
    { title: "IT Consulting", description: "Strategic technology advice to help your business grow. We evaluate, recommend, and implement." },
    { title: "Digital Transformation", description: "Future-proof your business with our digital transformation services. Modernize workflows and systems." },
  ],
  "real-estate": [
    { title: "Property Listings", description: "Access our extensive database of properties. We help you find the perfect match for your needs and budget." },
    { title: "Property Management", description: "Let us handle the day-to-day management of your property. Stress-free ownership starts here." },
    { title: "Investment Advisory", description: "Make informed real estate investment decisions with our expert market analysis and guidance." },
  ],
  construction: [
    { title: "New Construction", description: "From foundation to finishing touches, we manage every aspect of new construction projects." },
    { title: "Renovation & Remodeling", description: "Transform your space with our renovation services. Modern designs that respect your existing structure." },
    { title: "Project Management", description: "Keep your construction project on time and on budget. Our experienced managers oversee every detail." },
  ],
  creative: [
    { title: "Brand Identity", description: "Stand out with a cohesive brand identity. From logos to full brand guidelines, we craft your visual story." },
    { title: "Graphic Design", description: "Eye-catching designs for print and digital. Marketing materials that capture attention." },
    { title: "Photography & Video", description: "Professional visual content that showcases your brand in the best light." },
  ],
  travel: [
    { title: "Paquetes Vacacionales a Medida", description: "Paquetes individuales, de grupo o de vacaciones a medida, adaptados a todos los presupuestos. Desde escapadas románticas hasta aventuras familiares, diseñamos sus vacaciones soñadas." },
    { title: "Eventos MICE", description: "Organizamos eventos de MICE (Meetings, Incentives, Conferences, Exhibitions) para empresas y grupos. Gestión integral de eventos corporativos en las Islas Canarias con servicios profesionales llave en mano." },
    { title: "Asistencia Turística", description: "Asistencia turstica en varios idiomas. Nuestro equipo multilingüe est a su disposición para hacer de su estancia en Canarias una experiencia sin preocupaciones." },
    { title: "Traslados Locales", description: "Traslados locales privados o colectivos desde el aeropuerto a su alojamiento y a cualquier punto de la isla. Comodidad y puntualidad garantizadas." },
    { title: "Excursiones en Tenerife", description: "Descubra Tenerife con nuestras excursiones guiadas. Desde el Parque Nacional del Teide hasta los acantilados de Los Gigantes, le mostramos los rincones ms espectaculares de la isla de la eterna primavera." },
    { title: "Alquiler de Coches", description: "Alquiler de coches con las mejores condiciones para que se mueva con total libertad por las Islas Canarias. Amplia flota de vehículos para todos los presupuestos." },
  ],
  other: [
    { title: "Quality Service", description: "We're committed to delivering the highest standard of service to every customer, every time." },
    { title: "Customer Support", description: "Have a question? Our friendly team is always ready to help with prompt and courteous support." },
    { title: "Custom Solutions", description: "Every customer is unique. We work with you to find the solution that best fits your specific needs." },
  ],
};

/**
 * Generate all content for a business based on type + scraped data.
 */
export function generateContent(
  site: ScrapedSite | null,
  business: BusinessData | null,
  businessType: BusinessType
): GeneratedContent {
  const name = business?.name || site?.businessName || "My Business";
  const location = business?.city || business?.address?.split(",")[0]?.trim() || "";
  const rawDescription = business?.description || site?.pages[0]?.metaDescription || "";
  const rawParagraphs = site?.pages.flatMap((p) => p.paragraphs) || [];

  // For travel type (Mario Viajes), use curated Spanish content from original site
  if (businessType === "travel" && rawParagraphs.length < 3) {
    const tagline = "Mario Viajes. Crea tu tipo de vacaciones.";
    const heroSubtitle = "Crea tu tipo de vacaciones. Descubra las Islas Canarias con nosotros.";
    const aboutHeading = "Sobre nosotros";
    const aboutParagraphs = [
      "Con la ayuda de nuestra competencia en turismo de calidad y también, de los aos pasados en Canarias, podemos garantizarle unas vacaciones inolvidables.",
      "Mario Viajes SLU es una empresa joven, desarrollado a partir de nuestro deseo para proporcionar a los turistas con la ayuda responsable y la información exacta. La disposición, la sobriedad y la dedicación que ponemos en nuestro servicio, nos permiten garantizar a nuestros clientes unas vacaciones inolvidables.",
      "Estamos aquí para escuchar sus deseos y organizar sus vacaciones tan soñadas. Ofrecemos servicios turísticos individuales y de grupo para cualquiera de las 7 islas del Archipiélago Canario. Le estamos esperando para escribir juntos la historia de unas vacaciones ideales",
    ];
    const services = getServices(site, businessType);
    const seoDescription = `Mario Viajes — Crea tu tipo de vacaciones. ${generateSeoDescription(name, businessType, location)}`;

    return {
      tagline,
      heroSubtitle,
      aboutHeading,
      aboutParagraphs,
      services,
      seoDescription,
    };
  }

  // For restaurant type, use curated Spanish churrascaria content
  if (businessType === "restaurant") {
    const tagline = "CARNE SIN FIN, SABOR SIN LÍMITE";
    const heroSubtitle = "Bienvenido a Churrasquería Rodeo Grill, donde el auténtico rodizio brasileño cobra vida en Costa Adeje. Déjese llevar por el incesante desfile de carnes premium asadas a la perfección por nuestros gauchos.";
    const aboutHeading = "La Experiencia Rodizio";
    const aboutParagraphs = [
      "En Churrasquería Rodeo Grill hemos traído la esencia más pura del rodizio brasileño hasta el sur de Tenerife. Nuestra parrilla trabaja sin descanso para ofrecerle un festín de carnes seleccionadas, asadas lentamente sobre brasas naturales. Cada corte es preparado con el respeto y la maestría que la tradición gaucha exige, garantizando una experiencia que despierta todos los sentidos.",
      "El servicio continuo es el alma de nuestra propuesta: nuestros passadores recorren las mesas con espetos humeantes de picanha, alcatra, costela de res, medallones de lomo y mucho más. Usted decide el ritmo, el corte y la cantidad. Cada pieza se sirve en su punto óptimo, recién salida del fuego, con ese sabor ahumado e intenso que solo el asado tradicional puede ofrecer.",
      "Maridamos cada bocado con una cuidada selección de vinos, cervezas artesanales y cócteles tropicales que complementan la riqueza de la carne. Nuestra guarnición incluye clásicos brasileños como la farofa crujiente, la vinagreta fresca, el arroz con frijoles negros y el plátano frito caramelizado, creando un equilibrio perfecto de sabores y texturas.",
      "El ambiente de Rodeo Grill evoca la calidez de las churrascuerías de São Paulo y Porto Alegre, con una decoración rústica y acogedora que invita a compartir. Ya sea para una cena en pareja, una reunión familiar o una celebración especial, nuestro equipo está dedicado a hacer de cada visita un momento inolvidable. Ven y descubre por qué somos el destino favorito de los amantes de la carne en Tenerife.",
    ];
    const services = getServices(site, businessType);
    const seoDescription = `Churrasquería Rodeo Grill — CARNE SIN FIN, SABOR SIN LÍMITE. ${generateSeoDescription(name, businessType, location)}`;

    return {
      tagline,
      heroSubtitle,
      aboutHeading,
      aboutParagraphs,
      services,
      seoDescription,
    };
  }

  // Pick tagline — use scraped or random from industry templates
  const industryTaglines = TAGLINES[businessType] || TAGLINES.other;
  const tagline = rawDescription || industryTaglines[Math.floor(Math.random() * industryTaglines.length)];

  // Hero subtitle — short, punchy
  const heroSubtitle = tagline;

  // About heading — location-aware if available
  const aboutHeading = location
    ? `About ${name} in ${location}`
    : `About ${name}`;

  // About paragraphs — blend scraped content with generated copy
  const aboutParagraphs: string[] = [];

  if (rawParagraphs.length >= 2) {
    aboutParagraphs.push(rawParagraphs[0]);
    aboutParagraphs.push(rawParagraphs[1]);
    if (rawParagraphs[2]) aboutParagraphs.push(rawParagraphs[2]);
  } else if (rawParagraphs.length === 1) {
    aboutParagraphs.push(rawParagraphs[0]);
    aboutParagraphs.push(generateAboutParagraph(name, businessType, location));
  } else {
    aboutParagraphs.push(generateAboutParagraph(name, businessType, location));
    aboutParagraphs.push(generateSecondParagraph(name, businessType, location));
  }

  // Services — try to extract from scraped page, fall back to templates
  const services = getServices(site, businessType);

  // SEO description
  const seoDescription = business?.description
    ? `${name} — ${business.description.substring(0, 160)}`
    : `${name} — ${tagline}. ${generateSeoDescription(name, businessType, location)}`;

  return {
    tagline,
    heroSubtitle,
    aboutHeading,
    aboutParagraphs,
    services,
    seoDescription,
  };
}

/**
 * Generate a realistic "about" paragraph based on business type.
 */
function generateAboutParagraph(name: string, type: BusinessType, location: string): string {
  const loc = location ? ` in the ${location} area` : "";
  const templates: Record<BusinessType, string> = {
    restaurant: `${name} is a beloved dining destination${loc}. We take pride in serving fresh, flavorful dishes made with locally sourced ingredients. Our welcoming atmosphere and friendly staff make every visit special.`,
    retail: `${name} is your premier shopping destination${loc}. We carefully curate our selection to bring you the best products at competitive prices. Customer satisfaction is at the heart of everything we do.`,
    service: `${name} has been providing top-quality service${loc} for years. Our experienced team is dedicated to delivering reliable, professional results every time. We treat every job with the care and attention it deserves.`,
    professional: `${name} offers expert professional services${loc}. Our team brings years of experience and deep industry knowledge to every engagement. We're committed to helping our clients succeed.`,
    healthcare: `${name} is dedicated to providing compassionate, high-quality healthcare${loc}. Our modern facility and experienced staff ensure you receive the best possible care in a comfortable environment.`,
    education: `${name} is committed to educational excellence${loc}. We provide a supportive learning environment where students can thrive and reach their full potential.`,
    technology: `${name} delivers innovative technology solutions${loc}. We combine technical expertise with creative thinking to solve complex challenges and drive digital transformation.`,
    "real-estate": `${name} is your trusted real estate partner${loc}. With deep local knowledge and a commitment to exceptional service, we help you find the perfect property.`,
    construction: `${name} brings decades of construction expertise${loc}. We're known for quality craftsmanship, attention to detail, and completing projects on time and on budget.`,
    creative: `${name} is a creative studio${loc} dedicated to bringing bold ideas to life. We blend artistic vision with strategic thinking to create work that resonates.`,
    travel: `${name} es su agencia de viajes de confianza en el sur de Tenerife${loc}. Con años de experiencia en el sector turístico de Canarias, le ofrecemos el conocimiento local y la dedicación necesaria para hacer de sus vacaciones una experiencia inolvidable. Nuestra pasión por las Islas Canarias se refleja en cada excursión y paquete que diseñamos.`,
    other: `${name} has been proudly serving our community${loc}. We're committed to quality, reliability, and building lasting relationships with every customer.`,
  };
  return templates[type] || templates.other;
}

function generateSecondParagraph(name: string, type: BusinessType, location: string): string {
  const loc = location ? ` in ${location}` : "";
  const templates: Record<BusinessType, string> = {
    restaurant: `Whether you're joining us for a casual lunch, romantic dinner, or special celebration,${loc} our team is here to make your experience unforgettable.`,
    retail: `Our knowledgeable staff${loc} are always on hand to help you find exactly what you need. We believe in creating a shopping experience that's enjoyable and hassle-free.`,
    service: `Customer satisfaction is our top priority${loc}. We go the extra mile to ensure every project is completed to the highest standards.`,
    professional: `We believe in building lasting relationships with our clients${loc}. Your success is our success, and we're dedicated to helping you achieve your goals.`,
    healthcare: `Your health and well-being are our top priorities. We strive to create a positive, stress-free experience for every patient who walks through our doors.`,
    education: `Our passionate educators create engaging, effective learning experiences that prepare students for success in their academic and professional journeys.`,
    technology: `We stay at the forefront of emerging technologies to deliver solutions that give our clients a competitive edge. Innovation isn't just what we do — it's who we are.`,
    "real-estate": `Whether you're buying, selling, or renting, our experienced team provides expert guidance and personalized service throughout the entire process.`,
    construction: `From initial concept through final walkthrough, we work closely with clients to ensure every detail meets their vision and expectations.`,
    creative: `We believe great design tells a story. Every project is an opportunity to create something meaningful that connects with audiences and drives results.`,
    travel: `Estamos aquí para escuchar sus deseos y organizar sus vacaciones tan soñadas${loc}. Ofrecemos servicios turísticos individuales y de grupo para cualquiera de las 7 islas del Archipiélago Canario. Le esperamos para escribir juntos la historia de unas vacaciones ideales.`,
    other: `We believe in doing things right. Quality, integrity, and customer satisfaction guide every decision we make.`,
  };
  return templates[type] || templates.other;
}

/**
 * Generate SEO description.
 */
function generateSeoDescription(name: string, type: BusinessType, location: string): string {
  const loc = location ? ` in ${location}` : "";
  const intros: Record<BusinessType, string> = {
    restaurant: `Visite ${name}${loc} para disfrutar del mejor rodizio brasileño. Cortes premium como picanha, alcatra y costela asados a la perfección. Disfrute de nuestra experiencia gastronómica en Costa Adeje, Tenerife. Reserve su mesa y déjese conquistar por el sabor sin límite de nuestras parrillas.`,
    retail: `Shop at ${name}${loc} for quality products at great prices. Visit our store or browse our online catalog.`,
    service: `Need reliable service${loc}? Trust ${name} for professional results. Contact us today for a free quote.`,
    professional: `${name} provides expert professional services${loc}. Schedule a consultation and let us help you succeed.`,
    healthcare: `${name} offers quality healthcare services${loc}. Book your appointment today and experience compassionate care.`,
    education: `Discover programs and courses at ${name}${loc}. Start your learning journey with us today.`,
    technology: `${name} delivers innovative technology solutions${loc}. Let's build something great together.`,
    "real-estate": `Find your dream property with ${name}${loc}. Browse listings or contact our expert agents today.`,
    construction: `${name} provides quality construction services${loc}. Get a free estimate for your project.`,
    creative: `${name} offers creative design services${loc}. Let's bring your vision to life.`,
    travel: `Visite ${name}${loc} y descubra las Islas Canarias como nunca antes. Excursiones guiadas por Tenerife, Gran Canaria, La Gomera y ms. Paquetes vacacionales personalizados, traslados, alquiler de coches y asistencia turística en varios idiomas. Reserve su aventura canaria hoy mismo.`,
    other: `${name} provides quality service${loc}. Contact us today to learn more about what we offer.`,
  };
  return intros[type] || intros.other;
}

/**
 * Extract services from scraped content or use business-type templates.
 */
function getServices(
  site: ScrapedSite | null,
  businessType: BusinessType
): { title: string; description: string }[] {
  // Prefer scraped headings as service names
  if (site) {
    const servicePage = site.pages.find((p) =>
      p.url.toLowerCase().includes("service")
    );
    if (servicePage) {
      const headings = servicePage.headings
        .filter((h) => h.level >= 2)
        .slice(0, 6);
      if (headings.length >= 2) {
        return headings.map((h) => ({
          title: h.text,
          description: generateServiceDescription(h.text, businessType),
        }));
      }
    }
  }

  // Fall back to industry templates
  return SERVICE_TEMPLATES[businessType] || SERVICE_TEMPLATES.other;
}

/**
 * Generate a description for a scraped service heading.
 */
function generateServiceDescription(serviceName: string, businessType: BusinessType): string {
  const templates: Record<BusinessType, string[]> = {
    restaurant: [
      `Nuestro servicio de ${serviceName.toLowerCase()} ofrece una experiencia única que captura la esencia de la parrilla tradicional brasileña, preparada con cortes seleccionados y el toque auténtico de nuestros gauchos.`,
      `Descubra nuestro ${serviceName.toLowerCase()} — una especialidad de la casa elaborada con los mejores ingredientes y asada a la perfección sobre brasas naturales.`,
      `Nos enorgullecemos de nuestro ${serviceName.toLowerCase()}. Cada detalle está cuidado al máximo para ofrecerle un sabor inigualable y una textura perfecta.`,
      `Disfrute de nuestro ${serviceName.toLowerCase()}, servido directamente del espeto a su plato en el punto exacto que usted prefiera.`,
    ],
    retail: [
      `Explore our ${serviceName.toLowerCase()} collection. Quality products, fair prices, expert advice.`,
      `${serviceName} — just one of the many ways we serve our customers.`,
    ],
    service: [
      `Our ${serviceName.toLowerCase()} service is delivered by experienced professionals who care about quality.`,
      `Need ${serviceName.toLowerCase()}? We've got you covered with reliable, professional service.`,
    ],
    professional: [
      `Our ${serviceName.toLowerCase()} services are tailored to your unique needs and goals.`,
      `Expert ${serviceName.toLowerCase()} guidance from professionals who understand your industry.`,
    ],
    healthcare: [
      `Comprehensive ${serviceName.toLowerCase()} services in a comfortable, caring environment.`,
      `Your health matters. Our ${serviceName.toLowerCase()} services are designed with your well-being in mind.`,
    ],
    education: [
      `Our ${serviceName.toLowerCase()} programs are designed for effective, engaging learning.`,
      `Achieve more with our ${serviceName.toLowerCase()} offerings. Expert guidance every step.`,
    ],
    technology: [
      `Cutting-edge ${serviceName.toLowerCase()} solutions tailored to your business needs.`,
      `Transform your operations with our ${serviceName.toLowerCase()} expertise.`,
    ],
    "real-estate": [
      `Expert ${serviceName.toLowerCase()} services to help you make the right decision.`,
      `Navigate the ${serviceName.toLowerCase()} market with confidence. We're here to help.`,
    ],
    construction: [
      `Professional ${serviceName.toLowerCase()} services backed by years of experience.`,
      `Quality ${serviceName.toLowerCase()} that meets the highest standards of craftsmanship.`,
    ],
    creative: [
      `Our ${serviceName.toLowerCase()} services combine creativity with strategic thinking.`,
      `Stand out with our ${serviceName.toLowerCase()} expertise. Creative solutions that work.`,
    ],
    travel: [
      `Nuestro servicio de ${serviceName.toLowerCase()} le ofrece una experiencia nica en las Islas Canarias. Guas locales, transporte cmodo y rutas seleccionadas para que disfrute al mximo.`,
      `Descubra las Islas Canarias con nuestro ${serviceName.toLowerCase()}. Le garantizamos una experiencia autntica, segura y llena de momentos inolvidables.`,
      `Reserve su ${serviceName.toLowerCase()} con nosotros y djese llevar por la magia de las Islas Canarias. Profesionales locales a su servicio.`,
    ],
    other: [
      `Our ${serviceName.toLowerCase()} service is designed to meet your needs with quality and care.`,
      `We deliver exceptional ${serviceName.toLowerCase()} service every time.`,
    ],
  };
  const options = templates[businessType] || templates.other;
  return options[Math.floor(Math.random() * options.length)];
}
