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
    "Where every meal tells a story",
    "Authentic flavors, unforgettable moments",
    "Taste the difference freshness makes",
    "Serving happiness since day one",
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
    { title: "Dine-In Experience", description: "Enjoy our carefully crafted menu in a warm and inviting atmosphere. Every dish is prepared fresh using locally sourced ingredients." },
    { title: "Takeaway & Delivery", description: "Can't make it to us? Order online and enjoy our delicious food in the comfort of your own home." },
    { title: "Private Events & Catering", description: "Let us make your special occasion unforgettable. We offer customized menus and full-service catering for events of all sizes." },
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
  const rawParagraphs = site?.pages[0]?.paragraphs || [];

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
    restaurant: `Visit ${name}${loc} for delicious food and great service. Browse our menu, make a reservation, or order online.`,
    retail: `Shop at ${name}${loc} for quality products at great prices. Visit our store or browse our online catalog.`,
    service: `Need reliable service${loc}? Trust ${name} for professional results. Contact us today for a free quote.`,
    professional: `${name} provides expert professional services${loc}. Schedule a consultation and let us help you succeed.`,
    healthcare: `${name} offers quality healthcare services${loc}. Book your appointment today and experience compassionate care.`,
    education: `Discover programs and courses at ${name}${loc}. Start your learning journey with us today.`,
    technology: `${name} delivers innovative technology solutions${loc}. Let's build something great together.`,
    "real-estate": `Find your dream property with ${name}${loc}. Browse listings or contact our expert agents today.`,
    construction: `${name} provides quality construction services${loc}. Get a free estimate for your project.`,
    creative: `${name} offers creative design services${loc}. Let's bring your vision to life.`,
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
        .slice(0, 3);
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
      `Our ${serviceName.toLowerCase()} service offers a curated experience that showcases the best of our culinary expertise.`,
      `Experience our ${serviceName.toLowerCase()} — crafted with care and served with a smile.`,
      `We pride ourselves on our ${serviceName.toLowerCase()}. Every detail is designed to delight.`,
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
    other: [
      `Our ${serviceName.toLowerCase()} service is designed to meet your needs with quality and care.`,
      `We deliver exceptional ${serviceName.toLowerCase()} service every time.`,
    ],
  };
  const options = templates[businessType] || templates.other;
  return options[Math.floor(Math.random() * options.length)];
}
