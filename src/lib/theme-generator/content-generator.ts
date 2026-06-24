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
 * Detect if the business is likely Spanish-speaking based on name + location.
 */
export function isSpanish(name: string, location?: string): boolean {
  const combined = `${name} ${location || ""}`.toLowerCase();
  // Spanish-specific accented characters
  if (/[ñáéíóúü]/.test(combined)) return true;
  // Spanish common stop words
  const spanishWords = [
    " de ", " del ", " la ", " las ", " los ", " el ", " en ", " un ", " una ",
    " por ", " para ", " con ", " sin ", " entre ", " sobre ", " tras ",
    " calle ", " avenida ", " plaza ", " barrio ", " municipio ",
  ];
  for (const word of spanishWords) {
    if (combined.includes(word)) return true;
  }
  // Spanish-speaking locations
  const spanishLocations = [
    "tenerife", "canaria", "españa", "spain", "madrid", "barcelona",
    "valencia", "sevilla", "málaga", "bilbao", "alicante", "granada",
    "murcia", "palma", "ibiza", "menorca", "costa", "adeje",
    "argentina", "méxico", "colombia", "chile", "perú", "uruguay",
    "santiago", "buenos aires", "ciudad de méxico", "lima", "bogotá",
  ];
  for (const loc of spanishLocations) {
    if (combined.includes(loc)) return true;
  }
  return false;
}

/**
 * Spanish tagline templates for all business types.
 */
const ES_TAGLINES: Record<BusinessType, string[]> = {
  restaurant: [
    "CARNE SIN FIN, SABOR SIN LÍMITE",
    "El auténtico rodizio brasileño en Tenerife",
    "Cortes premium, tradición gaucha, sabor inigualable",
    "Déjate llevar por la tradición del asado brasileño",
  ],
  retail: [
    "Descubre productos que amarás",
    "Tu destino para calidad y estilo",
    "Compra lo mejor, olvida el resto",
    "Encuentra todo lo que necesitas en un solo lugar",
  ],
  service: [
    "Servicio profesional en el que puedes confiar",
    "Trabajo de calidad, resultados garantizados",
    "Nosotros lo cuidamos, tú disfruta",
    "Servicio confiable a tu alcance",
  ],
  professional: [
    "Asesoría experta cuando más importa",
    "Soluciones estratégicas para tu éxito",
    "Guía de confianza en cada paso del camino",
    "Tus metas, nuestra experiencia",
  ],
  healthcare: [
    "Tu salud es nuestra máxima prioridad",
    "Cuidando de ti y tu familia",
    "Atención compasiva, medicina avanzada",
    "Tu bienestar empieza aquí",
  ],
  education: [
    "Desarrolla tu máximo potencial",
    "Aprende, crece y prospera con nosotros",
    "Construyendo futuros brillantes juntos",
    "Educación que inspira",
  ],
  technology: [
    "Innovación que impulsa resultados",
    "Transformando ideas en realidad digital",
    "Tecnología construida para el mañana",
    "Soluciones inteligentes para negocios modernos",
  ],
  "real-estate": [
    "Encuentra tu lugar perfecto",
    "Más que un hogar, es un estilo de vida",
    "Tu propiedad soñada te espera",
    "Asesoría experta en bienes raíces",
  ],
  construction: [
    "Construyendo tu visión desde cero",
    "Construcción de calidad, valor duradero",
    "Convirtiendo planos en realidad",
    "Construido para durar, diseñado para impresionar",
  ],
  creative: [
    "Donde la creatividad se encuentra con la estrategia",
    "Dando vida a tu marca",
    "Diseño que habla por sí solo",
    "Soluciones creativas que destacan",
  ],
  travel: [
    "DESCUBRE LAS ISLAS CANARIAS CON NOSOTROS",
    "Crea tu tipo de vacaciones",
    "Tu aventura en Canarias empieza aquí",
    "Explora, sueña, descubre — Islas Canarias",
  ],
  other: [
    "Servicio excepcional, siempre",
    "Tu socio local de confianza",
    "Calidad en la que puedes confiar",
    "Dedicados a tu satisfacción",
  ],
};

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
 * Spanish service offerings by business type.
 */
const ES_SERVICE_TEMPLATES: Record<BusinessType, { title: string; description: string }[]> = {
  restaurant: [
    { title: "Pescados y Mariscos", description: "Los mejores pescados frescos del Atlántico, seleccionados diariamente. Nuestra lubina salvaje, el rodaballo y el pulpo a la brasa son los favoritos de nuestros comensales." },
    { title: "Arroces y Paellas", description: "Arroces mediterráneos cocinados a fuego lento con caldos naturales. Nuestra paella de mariscos y el arroz meloso de bogavante son auténticas obras maestras." },
    { title: "Carnes Seleccionadas", description: "Cortes de carne de primera calidad, desde nuestro solomillo de ternera gallega hasta el cochinillo confitado." },
    { title: "Ensaladas y Entrantes", description: "Entrantes mediterráneos que despiertan el apetito: tartar de atún rojo, burrata con tomates heirloom y carpaccio de calabacín." },
    { title: "Postres Caseros", description: "Nuestra repostería casera incluye tiramisú tradicional, tarta de queso y el exquisito coulant de chocolate belga." },
    { title: "Vinos y Cócteles", description: "Carta de vinos con más de 50 referencias nacionales e internacionales, con especial atención a los caldos canarios." },
  ],
  retail: [
    { title: "Selección de Productos", description: "Explore nuestra colección cuidadosamente seleccionada. Nos enorgullecemos de ofrecer solo artículos de la más alta calidad." },
    { title: "Compra Personalizada", description: "¿No sabe lo que busca? Nuestro equipo está siempre dispuesto a ayudarle a encontrar exactamente lo que necesita." },
    { title: "Tienda Online", description: "Compre desde la comodidad de su hogar. Entrega rápida y devoluciones sencillas en todas las compras online." },
  ],
  service: [
    { title: "Consulta Profesional", description: "¿No está seguro de lo que necesita? Empezamos cada proyecto con una consulta exhaustiva para entender sus requisitos." },
    { title: "Servicio Profesional", description: "Nuestro equipo experimentado ofrece un servicio fiable y de alta calidad en cada ocasión." },
    { title: "Soporte de Emergencia", description: "¿Necesita ayuda urgente? Ofrecemos servicios de respuesta rápida para solucionar cualquier imprevisto." },
  ],
  professional: [
    { title: "Consultoría Estratégica", description: "Le ayudamos a superar desafíos complejos con estrategias claras y adaptadas a su situación única." },
    { title: "Soporte Continuo", description: "Manténgase a la vanguardia con nuestros servicios continuos de asesoría y apoyo." },
    { title: "Formación y Talleres", description: "Capacite a su equipo con conocimientos. Ofrecemos sesiones de formación personalizadas." },
  ],
  healthcare: [
    { title: "Revisiones Generales", description: "Los chequeos regulares son la base de la medicina preventiva. Nuestros exámenes completos cubren todo lo esencial." },
    { title: "Atención Especializada", description: "Desde procedimientos rutinarios hasta tratamientos especializados, ofrecemos una atención integral." },
    { title: "Programas de Bienestar", description: "Adopte un enfoque proactivo para su salud. Nuestros programas de bienestar le ayudan a vivir mejor." },
  ],
  education: [
    { title: "Cursos y Programas", description: "Explore nuestra gama de cursos diseñados para estudiantes de todos los niveles. Horarios flexibles." },
    { title: "Tutoría Personalizada", description: "Reciba atención personalizada con nuestras sesiones de tutoría privada. Alcance sus metas más rápido." },
    { title: "Talleres y Seminarios", description: "Profundice sus conocimientos con nuestros talleres intensivos. Aprenda de profesionales experimentados." },
  ],
  technology: [
    { title: "Desarrollo de Software", description: "Soluciones de software personalizadas construidas con tecnologías modernas. Desde aplicaciones web hasta plataformas móviles." },
    { title: "Consultoría TI", description: "Asesoramiento tecnológico estratégico para ayudar a su negocio a crecer. Evaluamos, recomendamos e implementamos." },
    { title: "Transformación Digital", description: "Prepare su negocio para el futuro con nuestros servicios de transformación digital. Modernice sus flujos de trabajo." },
  ],
  "real-estate": [
    { title: "Listados de Propiedades", description: "Acceda a nuestra extensa base de datos de propiedades. Le ayudamos a encontrar la opción perfecta." },
    { title: "Gestión de Propiedades", description: "Deje que nosotros nos encarguemos de la gestión diaria de su propiedad. Tranquilidad desde el primer día." },
    { title: "Asesoría de Inversión", description: "Tome decisiones informadas con nuestro análisis experto del mercado inmobiliario." },
  ],
  construction: [
    { title: "Nueva Construcción", description: "Desde los cimientos hasta los acabados, gestionamos cada aspecto de los proyectos de nueva construcción." },
    { title: "Reformas y Remodelaciones", description: "Transforme su espacio con nuestros servicios de renovación. Diseños modernos que respetan su estructura actual." },
    { title: "Gestión de Proyectos", description: "Mantenga su proyecto de construcción dentro del plazo y presupuesto. Nuestros gestores supervisan cada detalle." },
  ],
  creative: [
    { title: "Identidad de Marca", description: "Destaque con una identidad de marca coherente. Desde logotipos hasta guías de marca completas." },
    { title: "Diseño Gráfico", description: "Diseños impactantes para medios impresos y digitales. Materiales de marketing que captan la atención." },
    { title: "Fotografía y Video", description: "Contenido visual profesional que muestra su marca bajo la mejor luz." },
  ],
  travel: [
    { title: "Paquetes Vacacionales a Medida", description: "Paquetes individuales, de grupo o de vacaciones a medida, adaptados a todos los presupuestos." },
    { title: "Eventos MICE", description: "Organizamos eventos corporativos en las Islas Canarias con servicios profesionales llave en mano." },
    { title: "Asistencia Turística", description: "Asistencia turística en varios idiomas. Nuestro equipo multilingüe está a su disposición." },
    { title: "Excursiones en Tenerife", description: "Descubra Tenerife con nuestras excursiones guiadas. Desde el Teide hasta Los Gigantes." },
  ],
  other: [
    { title: "Servicio de Calidad", description: "Nos comprometemos a ofrecer el más alto nivel de servicio a cada cliente, en cada visita." },
    { title: "Atención al Cliente", description: "¿Tiene una pregunta? Nuestro equipo está siempre dispuesto a ayudarle con atención rápida y cortés." },
    { title: "Soluciones Personalizadas", description: "Cada cliente es único. Trabajamos con usted para encontrar la solución que mejor se adapte a sus necesidades." },
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

  // Detect language from business name + location
  const spanish = isSpanish(name, location);

  // For travel type (Mario Viajes) with no scraped paragraphs, use curated content
  if (businessType === "travel" && rawParagraphs.length < 3 && spanish) {
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
  const industryTaglines = spanish ? (ES_TAGLINES[businessType] || ES_TAGLINES.other) : (TAGLINES[businessType] || TAGLINES.other);
  const tagline = rawDescription || industryTaglines[Math.floor(Math.random() * industryTaglines.length)];

  // Hero subtitle — short, punchy
  const heroSubtitle = tagline;

  // About heading — Spanish-aware
  const aboutHeading = spanish
    ? `Sobre ${name}`
    : (location
      ? `About ${name} in ${location}`
      : `About ${name}`);

  // About paragraphs — blend scraped content with generated copy
  const aboutParagraphs: string[] = [];

  if (rawParagraphs.length >= 2) {
    aboutParagraphs.push(rawParagraphs[0]);
    aboutParagraphs.push(rawParagraphs[1]);
    if (rawParagraphs[2]) aboutParagraphs.push(rawParagraphs[2]);
  } else if (rawParagraphs.length === 1) {
    aboutParagraphs.push(rawParagraphs[0]);
    aboutParagraphs.push(generateAboutParagraph(name, businessType, location, spanish));
  } else {
    aboutParagraphs.push(generateAboutParagraph(name, businessType, location, spanish));
    aboutParagraphs.push(generateSecondParagraph(name, businessType, location, spanish));
  }

  // Services — try to extract from scraped page, fall back to templates
  const services = getServices(site, businessType, spanish);

  // SEO description
  const seoDescription = business?.description
    ? `${name} — ${business.description.substring(0, 160)}`
    : `${name} — ${tagline}. ${generateSeoDescription(name, businessType, location, spanish)}`;

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
function generateAboutParagraph(name: string, type: BusinessType, location: string, spanish: boolean = false): string {
  if (spanish) {
    const loc = location ? ` en ${location}` : "";
    const esTemplates: Record<BusinessType, string> = {
      restaurant: `${name} es un destino gastronómico de referencia${loc}. Nos enorgullecemos de servir platos frescos y llenos de sabor elaborados con ingredientes de origen local. Nuestro ambiente acogedor y nuestro equipo hacen que cada visita sea especial.`,
      retail: `${name} es su destino comercial de referencia${loc}. Seleccionamos cuidadosamente nuestros productos para ofrecerle la mejor calidad a precios competitivos.`,
      service: `${name} lleva años ofreciendo un servicio de primera calidad${loc}. Nuestro equipo experimentado se dedica a ofrecer resultados fiables y profesionales.`,
      professional: `${name} ofrece servicios profesionales expertos${loc}. Nuestro equipo aporta años de experiencia y un profundo conocimiento del sector.`,
      healthcare: `${name} se dedica a ofrecer una atención sanitaria compasiva y de alta calidad${loc}. Nuestras instalaciones modernas garantizan la mejor atención.`,
      education: `${name} está comprometido con la excelencia educativa${loc}. Proporcionamos un entorno de aprendizaje donde los estudiantes pueden desarrollar todo su potencial.`,
      technology: `${name} ofrece soluciones tecnológicas innovadoras${loc}. Combinamos experiencia técnica con pensamiento creativo.`,
      "real-estate": `${name} es su socio inmobiliario de confianza${loc}. Con conocimiento local y compromiso con el servicio excepcional.`,
      construction: `${name} aporta décadas de experiencia en construcción${loc}. Somos conocidos por la calidad artesanal y la atención al detalle.`,
      creative: `${name} es un estudio creativo${loc} dedicado a dar vida a ideas audaces. Combinamos visión artística con pensamiento estratégico.`,
      travel: `${name} es su agencia de viajes de confianza en el sur de Tenerife${loc}. Con años de experiencia en el sector turístico de Canarias.`,
      other: `${name} se dedica a servir a nuestra comunidad${loc} con calidad y compromiso. La satisfacción del cliente guía cada decisión que tomamos.`,
    };
    return esTemplates[type] || esTemplates.other;
  }
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

function generateSecondParagraph(name: string, type: BusinessType, location: string, spanish: boolean = false): string {
  if (spanish) {
    const loc = location ? ` en ${location}` : "";
    const esTemplates: Record<BusinessType, string> = {
      restaurant: `Ya sea para una comida informal, una cena romántica o una celebración especial${loc}, nuestro equipo está aquí para hacer de su visita una experiencia inolvidable.`,
      retail: `Nuestro equipo${loc} está siempre dispuesto a ayudarle a encontrar exactamente lo que busca. Creemos en crear una experiencia de compra agradable.`,
      service: `La satisfacción del cliente es nuestra prioridad${loc}. Nos esforzamos al máximo para garantizar los más altos estándares de calidad.`,
      professional: `Creemos en construir relaciones duraderas con nuestros clientes${loc}. Su éxito es nuestro éxito.`,
      healthcare: `Su salud y bienestar son nuestras máximas prioridades. Nos esforzamos por crear una experiencia positiva para cada paciente.`,
      education: `Nuestros educadores apasionados crean experiencias de aprendizaje efectivas que preparan a los estudiantes para el éxito.`,
      technology: `Nos mantenemos a la vanguardia de las tecnologías emergentes para ofrecer soluciones que dan ventaja a nuestros clientes.`,
      "real-estate": `Ya sea comprando, vendiendo o alquilando, nuestro equipo experimentado le guía en todo el proceso.`,
      construction: `Desde el concepto inicial hasta la inspección final, trabajamos estrechamente con los clientes para garantizar que cada detalle cumpla sus expectativas.`,
      creative: `Creemos que un buen diseño cuenta una historia. Cada proyecto es una oportunidad para crear algo significativo.`,
      travel: `Estamos aquí para escuchar sus deseos y organizar sus vacaciones soñadas${loc}. Le esperamos para escribir juntos la historia de unas vacaciones ideales.`,
      other: `Creemos en hacer las cosas bien. La calidad, la integridad y la satisfacción del cliente guían cada decisión.`,
    };
    return esTemplates[type] || esTemplates.other;
  }
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
function generateSeoDescription(name: string, type: BusinessType, location: string, spanish: boolean = false): string {
  if (spanish) {
    const loc = location ? ` en ${location}` : "";
    const esIntros: Record<BusinessType, string> = {
      restaurant: `Visite ${name}${loc} para disfrutar de la mejor experiencia gastronómica. Deliciosos platos preparados con ingredientes frescos y un servicio excepcional.`,
      retail: `Compre en ${name}${loc} productos de calidad a precios excelentes. Visite nuestra tienda o explore nuestro catálogo online.`,
      service: `¿Necesita un servicio fiable${loc}? Confíe en ${name} para obtener resultados profesionales. Contáctenos hoy.`,
      professional: `${name} ofrece servicios profesionales expertos${loc}. Solicite una consulta y permítanos ayudarle a tener éxito.`,
      healthcare: `${name} ofrece servicios sanitarios de calidad${loc}. Reserve su cita hoy y reciba una atención compasiva.`,
      education: `Descubra programas y cursos en ${name}${loc}. Comience hoy su viaje de aprendizaje.`,
      technology: `${name} ofrece soluciones tecnológicas innovadoras${loc}. Construyamos algo grande juntos.`,
      "real-estate": `Encuentre su propiedad soñada con ${name}${loc}. Explore listados o contacte a nuestros agentes expertos.`,
      construction: `${name} ofrece servicios de construcción de calidad${loc}. Solicite un presupuesto gratuito.`,
      creative: `${name} ofrece servicios creativos de diseño${loc}. Démos vida a su visión.`,
      travel: `Visite ${name}${loc} y descubra las Islas Canarias como nunca antes. Excursiones guiadas y paquetes vacacionales personalizados.`,
      other: `${name} ofrece un servicio de calidad${loc}. Contáctenos hoy para obtener más información.`,
    };
    return esIntros[type] || esIntros.other;
  }
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
  businessType: BusinessType,
  spanish: boolean = false
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
  return spanish
    ? (ES_SERVICE_TEMPLATES[businessType] || ES_SERVICE_TEMPLATES.other)
    : (SERVICE_TEMPLATES[businessType] || SERVICE_TEMPLATES.other);
}

/**
 * Generate a description for a scraped service heading.
 */
function generateServiceDescription(serviceName: string, businessType: BusinessType, spanish: boolean = false): string {
  if (spanish) {
    const esTemplates: Record<BusinessType, string[]> = {
      restaurant: [`Nuestro servicio de ${serviceName.toLowerCase()} le ofrece una experiencia única con ingredientes frescos y preparación artesanal.`, `Descubra nuestro ${serviceName.toLowerCase()} — una especialidad elaborada con los mejores ingredientes.`],
      retail: [`Explore nuestra colección de ${serviceName.toLowerCase()}. Productos de calidad, precios justos.`, `${serviceName} — una de las muchas formas en que servimos a nuestros clientes.`],
      service: [`Nuestro servicio de ${serviceName.toLowerCase()} es realizado por profesionales experimentados.`, `¿Necesita ${serviceName.toLowerCase()}? Le tenemos cubierto.`],
      professional: [`Nuestros servicios de ${serviceName.toLowerCase()} se adaptan a sus necesidades únicas.`, `Asesoría experta en ${serviceName.toLowerCase()} de profesionales que entienden su sector.`],
      healthcare: [`Servicios completos de ${serviceName.toLowerCase()} en un entorno cómodo y acogedor.`, `Su salud es importante. Nuestros servicios están diseñados pensando en su bienestar.`],
      education: [`Nuestros programas de ${serviceName.toLowerCase()} están diseñados para un aprendizaje efectivo.`, `Logre más con nuestra oferta de ${serviceName.toLowerCase()}.`],
      technology: [`Soluciones innovadoras de ${serviceName.toLowerCase()} adaptadas a su negocio.`, `Transforme sus operaciones con nuestra experiencia en ${serviceName.toLowerCase()}.`],
      "real-estate": [`Servicios expertos de ${serviceName.toLowerCase()} para ayudarle a tomar la decisión correcta.`, `Navegue el mercado de ${serviceName.toLowerCase()} con confianza.`],
      construction: [`Servicios profesionales de ${serviceName.toLowerCase()} respaldados por años de experiencia.`, `${serviceName.toLowerCase()} de calidad que cumple con los más altos estándares.`],
      creative: [`Nuestros servicios de ${serviceName.toLowerCase()} combinan creatividad con pensamiento estratégico.`, `Destaque con nuestra experiencia en ${serviceName.toLowerCase()}.`],
      travel: [`Nuestro servicio de ${serviceName.toLowerCase()} le ofrece una experiencia única en las Islas Canarias.`, `Descubra las Islas Canarias con nuestro ${serviceName.toLowerCase()}.`],
      other: [`Nuestro servicio de ${serviceName.toLowerCase()} está diseñado para satisfacer sus necesidades con calidad y cuidado.`, `Ofrecemos un servicio excepcional de ${serviceName.toLowerCase()} en cada visita.`],
    };
    const esOptions = esTemplates[businessType] || esTemplates.other;
    return esOptions[Math.floor(Math.random() * esOptions.length)];
  }
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
