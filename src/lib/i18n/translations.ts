// ============================================================
//  translations.ts — Comprehensive i18n dictionary for Mario Viajes
//  Languages: es (Spanish), en (English), ro (Romanian), hu (Hungarian)
//  RO and HU are auto-translated from ES using Google Translate style.
// ============================================================

export type Lang = 'es' | 'en' | 'ro' | 'hu';

export const translations: Record<string, Record<Lang, string>> = {
  // ─── Nav Links ───
  "nav.home": {
    es: "Inicio",
    en: "Home",
    ro: "Acasă",
    hu: "Kezdőlap",
  },
  "nav.about": {
    es: "Sobre nosotros",
    en: "About us",
    ro: "Despre noi",
    hu: "Rólunk",
  },
  "nav.services": {
    es: "Qué ofrecemos",
    en: "What we offer",
    ro: "Ce oferim",
    hu: "Amit kínálunk",
  },
  "nav.excursions": {
    es: "Excursiones",
    en: "Excursions",
    ro: "Excursii",
    hu: "Kirándulások",
  },
  "nav.contact": {
    es: "Contacto",
    en: "Contact",
    ro: "Contact",
    hu: "Kapcsolat",
  },
  "nav.b2b": {
    es: "B2B",
    en: "B2B",
    ro: "B2B",
    hu: "B2B",
  },

  // ─── Brand ───
  "brand.mario_viajes": {
    es: "Mario Viajes",
    en: "Mario Viajes",
    ro: "Mario Viajes",
    hu: "Mario Viajes",
  },
  "brand.tagline": {
    es: "Explora, sueña, descubre — Islas Canarias",
    en: "Explore, dream, discover — Canary Islands",
    ro: "Explorează, visează, descoperă — Insulele Canare",
    hu: "Fedezz fel, álmodj, fedezz fel — Kanári-szigetek",
  },

  // ─── Hero / Carousel ───
  "hero.carousel_1": {
    es: "Mario Viajes. Crea tu tipo de vacaciones.",
    en: "Mario Viajes. Create your kind of vacation.",
    ro: "Mario Viajes. Creează-ți propriul tip de vacanță.",
    hu: "Mario Viajes. Teremtsd meg a saját nyaralásodat.",
  },
  "hero.carousel_2": {
    es: "Destinos maravillosos están a solo una sonrisa de distancia!",
    en: "Wonderful destinations are just a smile away!",
    ro: "Destinații minunate sunt la doar un zâmbet distanță!",
    hu: "Csodálatos úticélok csak egy mosolyra vannak!",
  },
  "hero.carousel_3": {
    es: "Relájate ... ¡Estás con nosotros! Lo hacemos sencillo.",
    en: "Relax ... You are with us! We make it simple.",
    ro: "Relaxează-te ... Ești cu noi! Facem totul simplu.",
    hu: "Pihenj ... Velünk vagy! Mi egyszerűvé tesszük.",
  },
  "hero.h1": {
    es: "Explora, sueña, descubre — Islas Canarias",
    en: "Explore, dream, discover — Canary Islands",
    ro: "Explorează, visează, descoperă — Insulele Canare",
    hu: "Fedezz fel, álmodj, fedezz fel — Kanári-szigetek",
  },
  "hero.cta_services": {
    es: "Explora nuestros servicios",
    en: "Explore our services",
    ro: "Explorează serviciile noastre",
    hu: "Fedezze fel szolgáltatásainkat",
  },
  "hero.cta_contact": {
    es: "Contacta con nosotros",
    en: "Contact us",
    ro: "Contactați-ne",
    hu: "Vegye fel velünk a kapcsolatot",
  },
  "hero.scroll": {
    es: "Scroll",
    en: "Scroll",
    ro: "Derulează",
    hu: "Görgess",
  },

  // ─── About Section ───
  "about.subtitle": {
    es: "MARIO VIAJES",
    en: "MARIO VIAJES",
    ro: "MARIO VIAJES",
    hu: "MARIO VIAJES",
  },
  "about.title": {
    es: "Sobre nosotros",
    en: "About us",
    ro: "Despre noi",
    hu: "Rólunk",
  },
  "about.lead": {
    es: "Unas vacaciones perfectas son las que usted desea no terminar!",
    en: "Perfect vacations are the ones you never want to end!",
    ro: "Vacanțele perfecte sunt cele pe care nu doriți să se termine!",
    hu: "A tökéletes nyaralás az, amit nem akarsz, hogy véget érjen!",
  },
  "about.p1": {
    es: "Con la ayuda de nuestra competencia en turismo de calidad y también, de los años pasados en Canarias, podemos garantizarle unas vacaciones inolvidables.",
    en: "With the help of our expertise in quality tourism and our years spent in the Canary Islands, we can guarantee you an unforgettable vacation.",
    ro: "Cu ajutorul competenței noastre în turism de calitate și al anilor petrecuți în Insulele Canare, vă putem garanta o vacanță de neuitat.",
    hu: "Szaktudásunknak a minőségi turizmusban és a Kanári-szigeteken eltöltött éveinknek köszönhetően felejthetetlen nyaralást garantálunk Önnek.",
  },
  "about.p2": {
    es: "Mario Viajes SLU es una empresa joven, desarrollado a partir de nuestro deseo para proporcionar a los turistas con la ayuda responsable y la información exacta. La disposición, la sobriedad y la dedicación que ponemos en nuestro servicio, nos permiten garantizar a nuestros clientes unas vacaciones inolvidables.",
    en: "Mario Viajes SLU is a young company, developed from our desire to provide tourists with responsible assistance and accurate information. The willingness, sobriety and dedication we put into our service allow us to guarantee our clients an unforgettable vacation.",
    ro: "Mario Viajes SLU este o companie tânără, dezvoltată din dorința noastră de a oferi turiștilor asistență responsabilă și informații exacte. Dispoziția, sobrietatea și dedicarea pe care le punem în serviciul nostru ne permit să garantăm clienților noștri o vacanță de neuitat.",
    hu: "A Mario Viajes SLU egy fiatal vállalat, amely abból a vágyunkból fejlődött ki, hogy felelősségteljes segítséget és pontos információkat nyújtsunk a turistáknak. A készség, a mértékletesség és az elhivatottság, amit szolgáltatásunkba fektetünk, lehetővé teszi számunkra, hogy felejthetetlen nyaralást garantáljunk ügyfeleinknek.",
  },
  "about.p3": {
    es: "Estamos aquí para escuchar sus deseos y organizar sus vacaciones tan soñadas. Ofrecemos servicios turísticos individuales y de grupo para cualquiera de las 7 islas del Archipiélago Canario. Le estamos esperando para escribir juntos la historia de unas vacaciones ideales.",
    en: "We are here to listen to your wishes and organize your dream vacation. We offer individual and group tourism services for any of the 7 islands of the Canary Archipelago. We are waiting for you to write together the story of an ideal vacation.",
    ro: "Suntem aici pentru a vă asculta dorințele și a vă organiza vacanța de vis. Oferim servicii turistice individuale și de grup pentru oricare dintre cele 7 insule ale Arhipelagului Canare. Vă așteptăm să scriem împreună povestea unei vacanțe ideale.",
    hu: "Azért vagyunk itt, hogy meghallgassuk kívánságait és megszervezzük álmai nyaralását. Egyéni és csoportos turisztikai szolgáltatásokat kínálunk a Kanári-szigetcsoport bármelyik 7 szigetére. Várjuk Önt, hogy együtt írjuk meg az ideális nyaralás történetét.",
  },
  "about.stats.clients": {
    es: "Happy Clients",
    en: "Happy Clients",
    ro: "Clienți mulțumiți",
    hu: "Elégedett ügyfelek",
  },
  "about.stats.experience": {
    es: "Years Experience",
    en: "Years Experience",
    ro: "Ani de experiență",
    hu: "Évek tapasztalata",
  },
  "about.stats.satisfaction": {
    es: "Satisfaction",
    en: "Satisfaction",
    ro: "Satisfacție",
    hu: "Elégedettség",
  },

  // ─── Services Section ───
  "services.subtitle": {
    es: "MARIO VIAJES",
    en: "MARIO VIAJES",
    ro: "MARIO VIAJES",
    hu: "MARIO VIAJES",
  },
  "services.title": {
    es: "Qué ofrecemos",
    en: "What we offer",
    ro: "Ce oferim",
    hu: "Amit kínálunk",
  },
  "services.tagline": {
    es: "Estamos aquí para convertir sus vacaciones en una experiencia memorable!",
    en: "We are here to turn your vacation into a memorable experience!",
    ro: "Suntem aici pentru a transforma vacanța dvs. într-o experiență memorabilă!",
    hu: "Azért vagyunk itt, hogy felejthetetlen élménnyé varázsoljuk a nyaralását!",
  },

  // 6 Service Titles
  "service_1.title": {
    es: "Paquetes Vacacionales a Medida",
    en: "Custom Vacation Packages",
    ro: "Pachete Vacanță Personalizate",
    hu: "Egyedi nyaralási csomagok",
  },
  "service_1.desc": {
    es: "Paquetes individuales, de grupo o de vacaciones a medida, adaptados a todos los presupuestos. Desde escapadas románticas hasta aventuras familiares, diseñamos sus vacaciones soñadas.",
    en: "Individual, group or custom vacation packages adapted to all budgets. From romantic getaways to family adventures, we design your dream vacation.",
    ro: "Pachete individuale, de grup sau de vacanță personalizate, adaptate tuturor bugetelor. De la escapade romantice la aventuri de familie, vă proiectăm vacanța de vis.",
    hu: "Egyéni, csoportos vagy testreszabott nyaralási csomagok, amelyek minden költségvetéshez igazodnak. A romantikus kikapcsolódástól a családi kalandokig, megtervezzük álmai nyaralását.",
  },

  "service_2.title": {
    es: "Eventos MICE",
    en: "MICE Events",
    ro: "Evenimente MICE",
    hu: "MICE események",
  },
  "service_2.desc": {
    es: "Organizamos eventos de MICE (Meetings, Incentives, Conferences, Exhibitions) para empresas y grupos. Gestión integral de eventos corporativos en las Islas Canarias con servicios profesionales llave en mano.",
    en: "We organize MICE events (Meetings, Incentives, Conferences, Exhibitions) for companies and groups. Comprehensive management of corporate events in the Canary Islands with professional turnkey services.",
    ro: "Organizăm evenimente MICE (Întâlniri, Incentive, Conferințe, Expoziții) pentru companii și grupuri. Gestionare completă a evenimentelor corporative în Insulele Canare cu servicii profesionale la cheie.",
    hu: "MICE rendezvényeket (Meetingek, Incentivek, Konferenciák, Kiállítások) szervezünk vállalatok és csoportok számára. Vállalati események teljes körű menedzsmentje a Kanári-szigeteken professzionális, kulcsrakész szolgáltatásokkal.",
  },

  "service_3.title": {
    es: "Asistencia Turística",
    en: "Tourist Assistance",
    ro: "Asistență Turistică",
    hu: "Turisztikai segítségnyújtás",
  },
  "service_3.desc": {
    es: "Asistencia turística en varios idiomas. Nuestro equipo multilingüe está a su disposición para hacer de su estancia en Canarias una experiencia sin preocupaciones.",
    en: "Tourist assistance in several languages. Our multilingual team is at your disposal to make your stay in the Canary Islands a worry-free experience.",
    ro: "Asistență turistică în mai multe limbi. Echipa noastră multilingvă este la dispoziția dvs. pentru a face sejurul dvs. în Insulele Canare o experiență fără griji.",
    hu: "Többnyelvű turisztikai segítségnyújtás. Többnyelvű csapatunk a rendelkezésére áll, hogy a Kanári-szigeteken töltött tartózkodását gondtalan élménnyé tegye.",
  },

  "service_4.title": {
    es: "Traslados Locales",
    en: "Local Transfers",
    ro: "Transferuri Locale",
    hu: "Helyi transzferek",
  },
  "service_4.desc": {
    es: "Traslados locales privados o colectivos desde el aeropuerto a su alojamiento y a cualquier punto de la isla. Comodidad y puntualidad garantizadas.",
    en: "Private or shared local transfers from the airport to your accommodation and to any point on the island. Comfort and punctuality guaranteed.",
    ro: "Transferuri locale private sau colective de la aeroport la cazare și în orice punct al insulei. Confort și punctualitate garantate.",
    hu: "Privát vagy megosztott helyi transzferek a repülőtérről a szállására és a sziget bármely pontjára. Kényelem és pontosság garantált.",
  },

  "service_5.title": {
    es: "Excursiones en Tenerife",
    en: "Excursions in Tenerife",
    ro: "Excursii în Tenerife",
    hu: "Kirándulások Tenerifén",
  },
  "service_5.desc": {
    es: "Descubra Tenerife con nuestras excursiones guiadas. Desde el Parque Nacional del Teide hasta los acantilados de Los Gigantes, le mostramos los rincones más espectaculares de la isla de la eterna primavera.",
    en: "Discover Tenerife with our guided excursions. From Teide National Park to the cliffs of Los Gigantes, we show you the most spectacular corners of the island of eternal spring.",
    ro: "Descoperiți Tenerife cu excursiile noastre ghidate. De la Parcul Național Teide până la stâncile Los Gigantes, vă arătăm cele mai spectaculoase colțuri ale insulei primăverii eterne.",
    hu: "Fedezze fel Tenerifét vezetett kirándulásainkkal. A Teide Nemzeti Parktól Los Gigantes szikláiig megmutatjuk az örök tavasz szigetének leglátványosabb zugait.",
  },

  "service_6.title": {
    es: "Alquiler de Coches",
    en: "Car Rental",
    ro: "Închirieri Auto",
    hu: "Autókölcsönzés",
  },
  "service_6.desc": {
    es: "Alquiler de coches con las mejores condiciones para que se mueva con total libertad por las Islas Canarias. Amplia flota de vehículos para todos los presupuestos.",
    en: "Car rental with the best conditions so you can move freely around the Canary Islands. Wide fleet of vehicles for all budgets.",
    ro: "Închirieri auto cu cele mai bune condiții pentru a vă deplasa în deplină libertate prin Insulele Canare. Flotă largă de vehicule pentru toate bugetele.",
    hu: "Autókölcsönzés a legjobb feltételekkel, hogy teljes szabadsággal közlekedhessen a Kanári-szigeteken. Széles járműflotta minden költségvetéshez.",
  },

  // ─── Services / "Todo lo que ofrecemos" section ───
  "services_all.explore": {
    es: "Explora",
    en: "Explore",
    ro: "Explorează",
    hu: "Fedezze fel",
  },
  "services_all.title": {
    es: "Todo lo que ofrecemos",
    en: "Everything we offer",
    ro: "Tot ceea ce oferim",
    hu: "Minden, amit kínálunk",
  },

  // ─── Islands Section ───
  "islands.title": {
    es: "Descubre las Islas Canarias",
    en: "Discover the Canary Islands",
    ro: "Descoperiți Insulele Canare",
    hu: "Fedezze fel a Kanári-szigeteket",
  },
  "islands.subtitle": {
    es: "Explora la diversidad y belleza única de cada una de las islas del Archipiélago Canario.",
    en: "Explore the diversity and unique beauty of each of the islands of the Canary Archipelago.",
    ro: "Explorați diversitatea și frumusețea unică a fiecăreia dintre insulele Arhipelagului Canare.",
    hu: "Fedezze fel a Kanári-szigetcsoport minden egyes szigetének sokszínűségét és egyedi szépségét.",
  },

  // Tenerife
  "island_tenerife.title": {
    es: "Sobre Tenerife",
    en: "About Tenerife",
    ro: "Despre Tenerife",
    hu: "Teneriféről",
  },
  "island_tenerife.text": {
    es: 'Tenerife es considerada como la isla de la "primavera eterna" con un clima suave durante todo el año. Es la isla más alta de las siete Islas Canarias debido al volcán Teide, que es 3718 metros de altura, siendo el pico más alto de España.',
    en: 'Tenerife is considered the island of "eternal spring" with a mild climate all year round. It is the highest of the seven Canary Islands due to the Teide volcano, which is 3,718 meters high, making it the highest peak in Spain.',
    ro: 'Tenerife este considerată insula "primăverii eterne" cu un climat blând pe tot parcursul anului. Este cea mai înaltă dintre cele șapte Insule Canare datorită vulcanului Teide, care are 3.718 metri înălțime, fiind cel mai înalt vârf din Spania.',
    hu: 'Tenerifét az "örök tavasz" szigetének tartják, egész évben enyhe éghajlattal. Ez a hét Kanári-sziget közül a legmagasabb a Teide vulkánnak köszönhetően, amely 3718 méter magas, így Spanyolország legmagasabb csúcsa.',
  },
  "island_tenerife.extra": {
    es: "Tenerife es el lugar donde se puede estar en la altura más alta de España rodeado de nieve y dos horas más tarde para broncearse a la playa.",
    en: "Tenerife is the place where you can be at the highest altitude in Spain surrounded by snow and two hours later tanning at the beach.",
    ro: "Tenerife este locul unde poți fi la cea mai mare altitudine din Spania înconjurat de zăpadă și două ore mai târziu să te bronzezi la plajă.",
    hu: "Tenerife az a hely, ahol Spanyolország legmagasabb pontján lehet hóval körülvéve, majd két órával később a tengerparton napozni.",
  },

  // Gran Canaria
  "island_grancanaria.title": {
    es: "Sobre Gran Canaria",
    en: "About Gran Canaria",
    ro: "Despre Gran Canaria",
    hu: "Gran Canariáról",
  },
  "island_grancanaria.text": {
    es: "Si usted deja ir su imaginación durante su visita a Gran Canaria, tendrá la sensación de que en lugar de una isla, en realidad visitará tres continentes: África, Europa y América. Es la tercera isla más grande del archipiélago canario.",
    en: "If you let your imagination run wild during your visit to Gran Canaria, you will feel that instead of one island, you will actually visit three continents: Africa, Europe and America. It is the third largest island of the Canary archipelago.",
    ro: "Dacă vă lăsați imaginația să zboare în timpul vizitei la Gran Canaria, veți avea senzația că, în loc de o insulă, veți vizita de fapt trei continente: Africa, Europa și America. Este a treia insulă ca mărime a arhipelagului canarian.",
    hu: "Ha szabadjára engedi a képzeletét Gran Canaria látogatása során, úgy érezheti, hogy egy sziget helyett valójában három kontinenst látogat meg: Afrikát, Európát és Amerikát. Ez a Kanári-szigetcsoport harmadik legnagyobb szigete.",
  },
  "island_grancanaria.extra": {
    es: "Uno de los principales atractivos de la isla de Gran Canaria son las dunas de Maspalomas.",
    en: "One of the main attractions of the island of Gran Canaria are the Maspalomas dunes.",
    ro: "Una dintre principalele atracții ale insulei Gran Canaria sunt dunele de la Maspalomas.",
    hu: "Gran Canaria szigetének egyik fő látványossága a Maspalomas-i dűnék.",
  },

  // Otras Islas
  "island_other.title": {
    es: "Otras Islas Canarias",
    en: "Other Canary Islands",
    ro: "Alte Insule Canare",
    hu: "További Kanári-szigetek",
  },
  "island_other.text": {
    es: "La Gomera, Lanzarote, Fuerteventura, La Palma y El Hierro no son sólo nombres. Son 5 islas hermosas y vale la pena visitar. Cada uno tiene características diferentes: La Gomera es considerada como la última selva en Europa.",
    en: "La Gomera, Lanzarote, Fuerteventura, La Palma and El Hierro are not just names. They are 5 beautiful islands worth visiting. Each has different characteristics: La Gomera is considered the last jungle in Europe.",
    ro: "La Gomera, Lanzarote, Fuerteventura, La Palma și El Hierro nu sunt doar nume. Sunt 5 insule frumoase care merită vizitate. Fiecare are caracteristici diferite: La Gomera este considerată ultima pădure tropicală din Europa.",
    hu: "La Gomera, Lanzarote, Fuerteventura, La Palma és El Hierro nem csupán nevek. 5 gyönyörű sziget, amelyet érdemes meglátogatni. Mindegyik más jellemzőkkel bír: La Gomera számít Európa utolsó dzsungelének.",
  },
  "island_other.extra": {
    es: "La Palma es la más verde. Hierro es el más pequeño. Lanzarote es preferido por los amantes de los deportes acuáticos y Fuerteventura está a sólo 100 kilómetros de la costa africana y es famosa por sus hermosas playas de arena blanca.",
    en: "La Palma is the greenest. El Hierro is the smallest. Lanzarote is preferred by water sports lovers and Fuerteventura is just 100 kilometers from the African coast and is famous for its beautiful white sand beaches.",
    ro: "La Palma este cea mai verde. El Hierro este cea mai mică. Lanzarote este preferată de iubitorii de sporturi nautice, iar Fuerteventura se află la doar 100 de kilometri de coasta africană și este renumită pentru plajele sale frumoase cu nisip alb.",
    hu: "La Palma a legzöldebb. El Hierro a legkisebb. Lanzarote-ot a vízi sportok kedvelői részesítik előnyben, Fuerteventura pedig mindössze 100 kilométerre van az afrikai partoktól, és híres gyönyörű fehér homokos strandjairól.",
  },

  // ─── B2B / Excursions Links Section ───
  "b2b.text": {
    es: "Para las agencias de viajes asociadas, hemos desarrollado un sistema de reservas en línea para viajes a las Islas Canarias, y para registrarse, visite nuestro enlace:",
    en: "For partner travel agencies, we have developed an online booking system for trips to the Canary Islands. To register, please visit our link:",
    ro: "Pentru agențiile de turism partenere, am dezvoltat un sistem de rezervări online pentru călătorii în Insulele Canare. Pentru a vă înregistra, vizitați linkul nostru:",
    hu: "Partnert utazási irodák számára kifejlesztettünk egy online foglalási rendszert a Kanári-szigetekre történő utazásokhoz. Regisztrációhoz látogassa meg linkünket:",
  },
  "b2b.button": {
    es: "B2B — Sistema de Reservas",
    en: "B2B — Booking System",
    ro: "B2B — Sistem de Rezervări",
    hu: "B2B — Foglalási Rendszer",
  },
  "excursions.button": {
    es: "excursiones.marioviajes.com",
    en: "excursiones.marioviajes.com",
    ro: "excursiones.marioviajes.com",
    hu: "excursiones.marioviajes.com",
  },

  // ─── Reviews Section ───
  "reviews.subtitle": {
    es: "Testimonios",
    en: "Testimonials",
    ro: "Testimoniale",
    hu: "Vélemények",
  },
  "reviews.title": {
    es: "Lo que dicen nuestros clientes",
    en: "What our clients say",
    ro: "Ce spun clienții noștri",
    hu: "Mit mondanak ügyfeleink",
  },
  "reviews.tagline": {
    es: "Opiniones reales de clientes reales.",
    en: "Real reviews from real clients.",
    ro: "Opinii reale de la clienți reali.",
    hu: "Valódi vélemények valódi ügyfelektől.",
  },

  // ─── Contact Section ───
  "contact.subtitle": {
    es: "Contacto",
    en: "Contact",
    ro: "Contact",
    hu: "Kapcsolat",
  },
  "contact.title": {
    es: "Contacto",
    en: "Contact",
    ro: "Contact",
    hu: "Kapcsolat",
  },
  "contact.tagline": {
    es: "Para más información, rellene el siguiente formulario.",
    en: "For more information, please fill out the following form.",
    ro: "Pentru mai multe informații, completați următorul formular.",
    hu: "További információért töltse ki az alábbi űrlapot.",
  },
  "contact.location_title": {
    es: "Mario Viajes, Tenerife",
    en: "Mario Viajes, Tenerife",
    ro: "Mario Viajes, Tenerife",
    hu: "Mario Viajes, Tenerife",
  },
  "contact.address_label": {
    es: "Dirección:",
    en: "Address:",
    ro: "Adresă:",
    hu: "Cím:",
  },
  "contact.address_value": {
    es: "Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife",
    en: "Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife",
    ro: "Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife",
    hu: "Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife",
  },
  "contact.phone_label": {
    es: "Teléfono:",
    en: "Phone:",
    ro: "Telefon:",
    hu: "Telefon:",
  },
  "contact.phone_value": {
    es: "0034-922724642",
    en: "0034-922724642",
    ro: "0034-922724642",
    hu: "0034-922724642",
  },
  "contact.email_label": {
    es: "Correo:",
    en: "Email:",
    ro: "Email:",
    hu: "Email:",
  },
  "contact.email_value": {
    es: "office@marioviajes.com",
    en: "office@marioviajes.com",
    ro: "office@marioviajes.com",
    hu: "office@marioviajes.com",
  },
  "contact.info_title": {
    es: "Información",
    en: "Information",
    ro: "Informații",
    hu: "Információ",
  },
  "contact.info_text": {
    es: "Estaremos encantados de atenderle. Si tiene alguna pregunta sobre nuestros servicios, no dude en contactarnos.",
    en: "We will be happy to assist you. If you have any questions about our services, please do not hesitate to contact us.",
    ro: "Vom fi încântați să vă asistăm. Dacă aveți întrebări despre serviciile noastre, nu ezitați să ne contactați.",
    hu: "Örömmel állunk rendelkezésére. Ha bármilyen kérdése van szolgáltatásainkkal kapcsolatban, ne habozzon kapcsolatba lépni velünk.",
  },
  "contact.response_time": {
    es: "Le responderemos en un plazo de 24 horas.",
    en: "We will respond within 24 hours.",
    ro: "Vă vom răspunde în termen de 24 de ore.",
    hu: "24 órán belül válaszolunk.",
  },
  "contact.badge": {
    es: "Contacto",
    en: "Contact",
    ro: "Contact",
    hu: "Kapcsolat",
  },
  "contact.info_response": {
    es: "Le responderemos en un plazo de 24 horas.",
    en: "We will respond within 24 hours.",
    ro: "Vă vom răspunde în termen de 24 de ore.",
    hu: "24 órán belül válaszolunk.",
  },
  "contact.form_title": {
    es: "Envíanos un mensaje",
    en: "Send us a message",
    ro: "Trimiteți-ne un mesaj",
    hu: "Küldjön üzenetet",
  },
  "contact.form_name_label": {
    es: "Nombre",
    en: "First Name",
    ro: "Prenume",
    hu: "Keresztnév",
  },
  "contact.form_name_placeholder": {
    es: "Su nombre",
    en: "Your first name",
    ro: "Prenumele dvs.",
    hu: "Az Ön keresztneve",
  },
  "contact.form_surname_label": {
    es: "Apellido",
    en: "Last Name",
    ro: "Nume",
    hu: "Vezetéknév",
  },
  "contact.form_surname_placeholder": {
    es: "Su apellido",
    en: "Your last name",
    ro: "Numele dvs.",
    hu: "Az Ön vezetékneve",
  },
  "contact.form_email_label": {
    es: "Correo electrónico",
    en: "Email",
    ro: "Email",
    hu: "Email",
  },
  "contact.form_email_placeholder": {
    es: "email@ejemplo.com",
    en: "email@example.com",
    ro: "email@exemplu.com",
    hu: "email@példa.com",
  },
  "contact.form_phone_label": {
    es: "Teléfono",
    en: "Phone",
    ro: "Telefon",
    hu: "Telefon",
  },
  "contact.form_phone_placeholder": {
    es: "+34 123 456 789",
    en: "+34 123 456 789",
    ro: "+34 123 456 789",
    hu: "+34 123 456 789",
  },
  "contact.form_message_label": {
    es: "Mensaje",
    en: "Message",
    ro: "Mesaj",
    hu: "Üzenet",
  },
  "contact.form_message_placeholder": {
    es: "Escriba su mensaje...",
    en: "Write your message...",
    ro: "Scrieți mesajul dvs....",
    hu: "Írja meg üzenetét...",
  },
  "contact.form_submit": {
    es: "Enviar mensaje",
    en: "Send message",
    ro: "Trimite mesaj",
    hu: "Üzenet küldése",
  },

  // ─── Footer ───
  "footer.brand": {
    es: "Mario Viajes",
    en: "Mario Viajes",
    ro: "Mario Viajes",
    hu: "Mario Viajes",
  },
  "footer.tagline": {
    es: "Explora, sueña, descubre — Islas Canarias",
    en: "Explore, dream, discover — Canary Islands",
    ro: "Explorează, visează, descoperă — Insulele Canare",
    hu: "Fedezz fel, álmodj, fedezz fel — Kanári-szigetek",
  },
  "footer.address": {
    es: "Mario Viajes, Calle Principal, 38001 Santa Cruz de Tenerife, España",
    en: "Mario Viajes, Main Street, 38001 Santa Cruz de Tenerife, Spain",
    ro: "Mario Viajes, Strada Principală, 38001 Santa Cruz de Tenerife, Spania",
    hu: "Mario Viajes, Fő utca, 38001 Santa Cruz de Tenerife, Spanyolország",
  },
  "footer.links_title": {
    es: "Enlaces",
    en: "Links",
    ro: "Linkuri",
    hu: "Linkek",
  },
  "footer.legal_title": {
    es: "Legal",
    en: "Legal",
    ro: "Legal",
    hu: "Jogi",
  },
  "footer.legal_notice_pdf": {
    es: "NOTA LEGAL Y CONDICIONES DE USO",
    en: "LEGAL NOTICE AND TERMS OF USE",
    ro: "AVIZ LEGAL ȘI CONDIȚII DE UTILIZARE",
    hu: "JOGI NYILATKOZAT ÉS HASZNÁLATI FELTÉTELEK",
  },
  "footer.transparency_pdf": {
    es: "MEMORIA TRANSPARENCIA",
    en: "TRANSPARENCY REPORT",
    ro: "RAPORT DE TRANSPARENȚĂ",
    hu: "ÁTLÁTHATÓSÁGI JELENTÉS",
  },
  "footer.legal_notice": {
    es: "Aviso Legal",
    en: "Legal Notice",
    ro: "Aviz Legal",
    hu: "Jogi nyilatkozat",
  },
  "footer.privacy": {
    es: "Política de Privacidad",
    en: "Privacy Policy",
    ro: "Politica de Confidențialitate",
    hu: "Adatvédelmi irányelvek",
  },

  // Footer — Full Legal Text
  "footer.legal_heading": {
    es: "NOTA LEGAL Y CONDICIONES DE USO DE LA PÁGINA WEB",
    en: "LEGAL NOTICE AND TERMS OF USE OF THE WEBSITE",
    ro: "AVIZ LEGAL ȘI CONDIȚII DE UTILIZARE A SITULUI WEB",
    hu: "JOGI NYILATKOZAT ÉS A WEBOLDAL HASZNÁLATI FELTÉTELEI",
  },
  "footer.legal_p1": {
    es: 'De conformidad con lo dispuesto en el artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico, se informa al usuario que el titular del presente sitio web es MARIO VIAJES S.L.U., con domicilio Calle Montana Clara 6, Ed Laurisilva, Local 6 I, Adeje, 38679, Santa Cruz de Tenerife, España, con CIF: B-76675081, Agencia de Viajes legalmente constituida con código de Identificación I-AV-0003355.2, teléfono (+34) 922724642 y correo electrónico de contacto office@marioviajes.com.',
    en: 'In accordance with the provisions of Article 10 of Law 34/2002, of July 11, on information society services and electronic commerce, the user is informed that the owner of this website is MARIO VIAJES S.L.U., with registered address at Calle Montana Clara 6, Ed Laurisilva, Local 6 I, Adeje, 38679, Santa Cruz de Tenerife, Spain, with tax ID: B-76675081, Travel Agency legally constituted with Identification code I-AV-0003355.2, telephone (+34) 922724642 and contact email office@marioviajes.com.',
    ro: 'În conformitate cu prevederile articolului 10 din Legea 34/2002, din 11 iulie, privind serviciile societății informaționale și comerțul electronic, utilizatorul este informat că deținătorul acestui site web este MARIO VIAJES S.L.U., cu sediul în Calle Montana Clara 6, Ed Laurisilva, Local 6 I, Adeje, 38679, Santa Cruz de Tenerife, Spania, cu CIF: B-76675081, Agenție de Turism constituită legal cu codul de identificare I-AV-0003355.2, telefon (+34) 922724642 și email de contact office@marioviajes.com.',
    hu: 'A 34/2002. sz., július 11-i törvény 10. cikkének rendelkezéseivel összhangban, amely az információs társadalom szolgáltatásairól és az elektronikus kereskedelemről szól, a felhasználó tájékoztatást kap arról, hogy a jelen weboldal tulajdonosa a MARIO VIAJES S.L.U., székhelye: Calle Montana Clara 6, Ed Laurisilva, Local 6 I, Adeje, 38679, Santa Cruz de Tenerife, Spanyolország, adószám: B-76675081, jogilag bejegyzett Utazási Iroda, azonosító kód: I-AV-0003355.2, telefon: (+34) 922724642, kapcsolattartási email: office@marioviajes.com.',
  },
  "footer.legal_p2": {
    es: "La actividad de MARIO VIAJES S.L.U. comprende la organización/comercialización de viajes combinados. Así mismo se informa que se encuentra a disposición de nuestros clientes las correspondientes hojas de reclamaciones debidamente autorizadas por la Dirección General de Ordenación y Promoción Turística del Gobierno de Canarias por si fuera de su interés en la dirección: Calle Montana Clara 6, Ed. Laurisilva, Local 6 I, Adeje, 38679, Santa Cruz de Tenerife, España en horario 10:00 hasta 15:00 en días laborables.",
    en: "The activity of MARIO VIAJES S.L.U. includes the organization/marketing of package tours. It is also reported that the corresponding complaint forms, duly authorized by the General Directorate of Tourism Planning and Promotion of the Government of the Canary Islands, are available to our customers at the address: Calle Montana Clara 6, Ed. Laurisilva, Local 6 I, Adeje, 38679, Santa Cruz de Tenerife, Spain, from 10:00 to 15:00 on business days.",
    ro: "Activitatea MARIO VIAJES S.L.U. include organizarea/comercializarea pachetelor de călătorie. De asemenea, se informează că formularele de reclamații corespunzătoare, autorizate de Direcția Generală de Planificare și Promovare Turistică a Guvernului Insulelor Canare, sunt puse la dispoziția clienților noștri la adresa: Calle Montana Clara 6, Ed. Laurisilva, Local 6 I, Adeje, 38679, Santa Cruz de Tenerife, Spania, între orele 10:00 și 15:00 în zilele lucrătoare.",
    hu: "A MARIO VIAJES S.L.U. tevékenysége magában foglalja az utazási csomagok szervezését/értékesítését. Továbbá tájékoztatjuk, hogy a Kanári-szigetek Kormányának Turisztikai Tervezési és Promóciós Főigazgatósága által jóváhagyott panaszbejelentő lapok rendelkezésre állnak ügyfeleink számára a következő címen: Calle Montana Clara 6, Ed. Laurisilva, Local 6 I, Adeje, 38679, Santa Cruz de Tenerife, Spanyolország, munkanapokon 10:00 és 15:00 óra között.",
  },

  // Footer — Bottom Bar
  "footer.copyright": {
    es: "© 2026 Mario Viajes, Tenerife. Todos los derechos reservados.",
    en: "© 2026 Mario Viajes, Tenerife. All rights reserved.",
    ro: "© 2026 Mario Viajes, Tenerife. Toate drepturile rezervate.",
    hu: "© 2026 Mario Viajes, Tenerife. Minden jog fenntartva.",
  },
  "footer.cif": {
    es: "CIF: B-76675081 | I-AV: I-AV-0003355.2",
    en: "CIF: B-76675081 | I-AV: I-AV-0003355.2",
    ro: "CIF: B-76675081 | I-AV: I-AV-0003355.2",
    hu: "CIF: B-76675081 | I-AV: I-AV-0003355.2",
  },
  "footer.full_address": {
    es: "Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife",
    en: "Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife",
    ro: "Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife",
    hu: "Calle Montana Clara nr.6, C.C. Laurisilva Local 6 I, 38679, Adeje, Tenerife",
  },
  "footer.made_with": {
    es: "Made with ❤️ by alexawebservers.com",
    en: "Made with ❤️ by alexawebservers.com",
    ro: "Făcut cu ❤️ de alexawebservers.com",
    hu: "Készült ❤️-vel a alexawebservers.com által",
  },

  // ─── Language Names (for the language switcher) ───
  "lang.es": {
    es: "Español",
    en: "Spanish",
    ro: "Spaniolă",
    hu: "Spanyol",
  },
  "lang.en": {
    es: "Inglés",
    en: "English",
    ro: "Engleză",
    hu: "Angol",
  },
  "lang.ro": {
    es: "Rumano",
    en: "Romanian",
    ro: "Română",
    hu: "Román",
  },
  "lang.hu": {
    es: "Húngaro",
    en: "Hungarian",
    ro: "Maghiară",
    hu: "Magyar",
  },
  "lang.switcher_title": {
    es: "Idioma",
    en: "Language",
    ro: "Limbă",
    hu: "Nyelv",
  },
};
