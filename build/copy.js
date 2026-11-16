/*
 * Domia Stays website: every word that is not part of a listing, in English and Spanish.
 * Edit the text between the quotes, then rebuild (Property Manager > Save, or `node build/cli.mjs`).
 * {curly} words are filled in automatically. Keep them as they are.
 */
(function (g) {
  'use strict';

  var en = {
    skip: "Skip to content",
    nav: { homes: "Homes", benidorm: "Benidorm", owners: "For owners", about: "About", contact: "Contact", guest: "Guest information", calc: "Earnings calculator", main: "Main", menu: "Menu", close: "Close", language: "Language" },
    wa: {
      cta: "WhatsApp us", short: "WhatsApp",
      general: "Hi Domia Stays, I'd like to ask about a stay in Benidorm.",
      home: "Hi Domia Stays, I'm interested in \"{name}\" ({area}). Could you share availability and rates?",
      owner: "Hi Domia Stays, I own a property in Benidorm and would like an estimate of what it could earn.",
      evaluation: "Hi Domia Stays, I'd like a free evaluation of my property in Benidorm. Here are the details:",
      calc: "Hi Domia Stays, I used your earnings calculator and I'd like a free evaluation of my property."
    },
    facts: { studio: "Studio", bed1: "{n} bedroom", bedN: "{n} bedrooms", bath1: "{n} bathroom", bathN: "{n} bathrooms", sleeps: "Sleeps {n}", size: "{n} m²" },
    price: { from: "from", night: "/ night" },
    footer: {
      blurb: "Holiday homes in Benidorm and along the Costa Blanca, managed by a local team.",
      stay: "Stay", owners: "Owners", company: "Domia Stays", contact: "Contact",
      management: "Property management", rights: "All rights reserved"
    },
    cta: {
      title: "Let's find your place on the bay",
      text: "Tell us your dates and who's coming. We reply personally, usually within the hour.",
      contact: "Send us a message"
    },

    home: {
      title: "Holiday apartments in Benidorm | Domia Stays",
      desc: "Holiday apartments in Benidorm, managed by a local team. See the homes, check the details and ask about your dates on WhatsApp.",
      browse: "See the homes",
      cine: {
        eyebrow: "Curated holiday homes",
        pre: "Your", gold: "stay", post: "on the", line2: "Costa Blanca",
        lead: "Apartments looked after by people who live here. The keys, the cleaning and the help on WhatsApp all come from one local team.",
        scroll: "Scroll",
        introTitle: "Not a listings site. A curated collection.",
        introText: "Domia Stays is a boutique rental agency in Benidorm. We look after a deliberately small number of homes, each one visited, styled and maintained by our own team, so when you arrive, everything simply works.",
        introAlt: "Benidorm bay seen from the pine hills above Levante"
      },
      videoLabel: "Benidorm seen from the water",
      finder: { title: "Looking for something specific?", lead: "Choose the area, how many you are and the bedrooms you need.", area: "Area", anyArea: "Any area", guests: "Guests", anyGuests: "Any number", guestsN: "{n} or more", beds: "Bedrooms", anyBeds: "Any", bedsN: "{n} or more", go: "Show homes" },
      homesTitle: "The homes",
      homesAll: "See all {n} homes",
      includes: [
        ["An easy arrival", "Check-in is from {from} to {until}, by smart lock, lockbox or with one of us at the door. Arriving outside those hours? Tell us and we will do our best to arrange it."],
        ["A home that is ready", "Cleaned to a hotel standard before every arrival, with fresh linen and towels waiting."],
        ["Local help, day or night", "A real person in Benidorm answers on WhatsApp, whatever the hour."],
        ["Extras on request", "Airport transfers, groceries and experiences, arranged before you land."]
      ],
      includesMore: "Read the guest information",
      benidormTitle: "Benidorm, beyond the postcard",
      benidormText: "Two great beaches, a mountain backdrop, an old town of narrow streets, and a skyline unlike anywhere else on the Mediterranean.",
      benidormLink: "Read the Benidorm guide",
      benidormAlt: "Poniente beach and the Benidorm skyline at dusk",
      stats: [["5 km", "of sandy beaches"], ["300+", "days of sun a year"], ["2", "bays, one old town between them"], ["45 min", "from Alicante airport"]],
      ownersTitle: "Own an apartment in Benidorm?",
      ownersText: "We manage it end to end: pricing, guests, cleaning, licences and a statement every month. You keep the income without the day-to-day.",
      ownersFigure: "20%", ownersFigureLabel: "of net revenue, after platform fees. That is our whole commission.",
      ownersCta: "How management works", ownersCalc: "Calculate your earnings",
      reviewsTitle: "What guests say"
    },

    homes: {
      title: "Holiday homes in Benidorm: the collection | Domia Stays",
      desc: "Browse Domia Stays apartments in Benidorm and the Costa Blanca. Filter by area, guests and bedrooms, then ask about your dates.",
      h1: "The collection",
      lead: "Homes across Benidorm and the Costa Blanca, each one managed by our team. Open any of them for photos, details and prices.",
      filters: "Filter the homes",
      area: "Area", allAreas: "All areas", guests: "Guests", anyGuests: "Any", guestsN: "{n}+", beds: "Bedrooms", anyBeds: "Any", bedsN: "{n}+",
      sort: "Sort", sortRec: "Recommended", sortLow: "Price, low to high", sortHigh: "Price, high to low",
      count1: "1 home", countN: "{n} homes",
      empty: "No homes match those filters.", clear: "Clear filters", emptyHelp: "Tell us what you need and we will suggest a home.",
      none: "New homes are being prepared. Message us and we will tell you what is coming."
    },

    homePage: {
      title: "{name} in {area} | Domia Stays",
      crumb: "The collection",
      photos: "Photos of {name}", showAll: "Show all {n} photos", photoN: "Photo {i} of {n}", prev: "Previous photo", next: "Next photo", closeGallery: "Close photos",
      about: "About this home",
      inside: "What's inside",
      know: "Good to know",
      checkIn: "Check-in", checkInVal: "{from} to {until}", checkOut: "Check-out", checkOutVal: "by {out}",
      minStay: "Minimum stay", nights1: "{n} night", nightsN: "{n} nights",
      licence: "Tourist licence",
      rules: "House rules", rulesVal: "No parties, and quiet hours as set by the building.",
      where: "Where it is", map: "See {area} on Google Maps",
      enquire: "Ask about your dates",
      arrive: "Arrival", depart: "Departure", guests: "Guests", guest1: "1 guest", guestN: "{n} guests",
      ask: "Ask about these dates", askShort: "Ask about dates",
      note: "Opens WhatsApp with your message ready to send. We reply personally, usually within the hour.",
      rate: "Rates change with the season. We confirm the exact price for your dates.",
      email: "Email us instead", emailSubject: "Enquiry: {name}",
      book: "Book online", bookShort: "Book or ask", orAsk: "or ask us first", onAirbnb: "See it on Airbnb", onBooking: "See it on Booking.com",
      msg: "Hi Domia Stays, I'm interested in \"{name}\" ({area}).",
      msgDates: "Arrival {in}, departure {out}.", msgGuests: "We are {n}.", msgEnd: "Could you confirm availability and the rate?",
      dateError: "Departure has to be after arrival.",
      more: "More homes", back: "Back to the collection",
      reviews: "Guests on this home"
    },

    owners: {
      title: "Holiday rental management in Benidorm | Domia Stays",
      desc: "Full management for your Benidorm apartment: pricing, guests, cleaning, licences and monthly statements. 20% of net revenue.",
      h1: "Your Benidorm apartment, managed from first photo to monthly payout.",
      lead: "Hand your apartment to a local team and watch it earn, without the day-to-day.",
      cta: "Get a free evaluation", calc: "Calculate your earnings",
      figure: "20%", figureLabel: "of net revenue",
      figureNote: "Our commission is charged after platform fees, so we only earn when your home earns.",
      realityTitle: "Running it yourself",
      reality: ["Time-consuming", "Operationally complex", "Inconsistent income", "Dependent on platforms like Airbnb"],
      realityNote: "Most properties underperform through a simple lack of optimization.",
      oppTitle: "With Domia Stays",
      opp: ["Higher nightly rates", "Increased occupancy", "Better-quality guests"],
      oppNote: "The Costa Blanca short-term market is growing fast. Your property can earn significantly more than traditional renting.",
      earnTitle: "What your property could earn",
      earnLong: "Traditional long-term rent", earnLongVal: "€800–1,000", earnDomia: "With Domia Stays management", earnDomiaVal: "€1,500–2,200+",
      perMonth: "/ month", earnUp: "Up to double your income",
      earnNote: "Benidorm market estimates. Actual results depend on the property, season and occupancy.",
      priceTitle: "Simple, aligned pricing",
      priceText: "One clear commission. We only earn when your home earns, so filling your calendar at the best rate is our job, not your worry.",
      pricePoints: ["One clear commission: we only earn when you earn", "No hidden fees, ever", "Full transparency: monthly reports, booking visibility, revenue tracking"],
      priceNote: "Commission is charged on net revenue, after platform fees. No setup fee, and a transparent statement every month.",
      talk: "Talk to us about your property",
      doTitle: "Everything, handled",
      doLead: "Everything below is included in one single management commission. No hidden extras, no surprises.",
      groups: [
        ["Revenue", [
          ["Dynamic pricing", "AI-driven rates updated daily via PriceLabs, based on live demand, local events and competitor analysis."],
          ["Reservation management", "All bookings managed across Airbnb, Booking.com, VRBO, direct and 50+ channels. Zero double bookings."],
          ["Monthly owner statements", "A detailed PDF: gross revenue, OTA fees, commission and net payout. Sent on the 5th each month."],
          ["Owner portal access", "Live calendar, bookings and an earnings dashboard, accessible 24/7 from any device."]
        ]],
        ["Guests", [
          ["Guest check-in and check-out", "Smart lock or local team, seven days a week. Automated arrival instructions sent 24h in advance."],
          ["24/7 guest support", "Response under one hour in three languages. AI-assisted out-of-hours queries, five-star standard."],
          ["Key management", "Smart locks with auto-changing codes per booking. Secure 24/7 access, no physical handover."]
        ]],
        ["The home", [
          ["Professional cleaning", "Hotel-standard protocol after every checkout. Photo-verified before each new guest arrival."],
          ["Linen and laundry", "Professional laundry included every rotation. Fresh, hotel-quality linen and towels always ready."],
          ["Maintenance and repairs", "Local technician network. Emergency response within two hours, coordinated fully by Domia."]
        ]],
        ["Paperwork", [
          ["Tourist registration (NRUA)", "We register your property with Turisme Comunitat Valenciana. The mandatory licence on all listings."],
          ["SES.Hospedajes reporting", "Guest data sent automatically to Spain's Ministry of the Interior within 24h of every check-in."]
        ]]
      ],
      legalTitle: "Legal and fiscal compliance",
      legalLead: "We keep your property fully compliant with Spanish legal and fiscal requirements.",
      legalChips: ["NRUA", "SES.Hospedajes", "IEAT", "Modelo 303", "Modelo 179", "GDPR"],
      legal: [
        ["Tourist licence registration (NRUA)", "For each property."],
        ["Guest registration via SES.Hospedajes", "Within 24h of check-in."],
        ["Quarterly tourist tax reporting (IEAT)", "Filed on your behalf."],
        ["VAT declarations (Modelo 303)", "Handled every quarter."],
        ["Annual rental income reporting (Modelo 179)", "Reported annually."]
      ],
      legalEnd: "Fully compliant. Fully managed. Zero stress.",
      stepsTitle: "How onboarding works",
      steps: [
        ["Property evaluation", "We assess your home and its real earning potential."],
        ["Setup and preparation", "Styling, essentials, a smart lock and a full readiness check."],
        ["Listing creation", "Professional photos, copy and pricing across every platform."],
        ["Go live", "Live on Airbnb, Booking.com, VRBO and the direct site."],
        ["Continuous optimization", "Ongoing pricing, reviews and performance tuning."]
      ],
      fitTitle: "Properties we work best with",
      fit: ["Well-located apartments", "Modern or renovated spaces", "Strong brand positioning", "In Benidorm and the Costa Blanca"],
      endTitle: "Thinking of listing your property?",
      endText: "Send us the address and a few photos on WhatsApp. We'll come back with an honest estimate of what it could earn.",
      endCta: "List your property"
    },

    calc: {
      title: "Owner earnings calculator | Domia Stays",
      desc: "See what you would receive from a booking on Airbnb, Booking.com, VRBO or direct. Domia's commission is 20% of net revenue.",
      crumb: "For owners",
      h1: "Owner earnings calculator",
      lead: "See exactly what you would receive from a booking, and how it changes by channel. Domia's commission is 20% of net, after platform fees.",
      price: "Booking price", channel: "Booking channel", direct: "Direct",
      flowPrice: "Booking price", flowFee: "{channel} platform fee ({pct}%)", flowNet: "Net (after platform)", flowDomia: "Domia 20%", flowYou: "You receive",
      split: "Where the money goes", splitYou: "You (owner)", splitDomia: "Domia Stays",
      byChannel: "Your payout by channel",
      year: "Estimate your year", nights: "Booked nights per month", nightsUnit: "nights", rate: "Average nightly rate", rateUnit: "/ night",
      annual: "Your estimated annual payout", perYear: "/ yr",
      note: "Estimate only. Actual results depend on the property, season, occupancy and channel mix.",
      cta: "Get a free evaluation", back: "Back to For owners"
    },

    benidorm: {
      title: "Benidorm guide: beaches, areas and what to do | Domia Stays",
      desc: "Where to stay in Benidorm: Levante, Poniente, the old town and Rincón de Loix, plus the things worth doing nearby.",
      h1: "Benidorm",
      lead: "Two sweeping bays, 300+ days of sun and a skyline like nowhere else. Here's where our homes are, and what to do around them.",
      heroAlt: "Levante beach seen from the Balcón del Mediterráneo",
      areasTitle: "The neighbourhoods",
      areas: [
        { key: "Playa de Levante", img: "levante-summer", text: "The lively golden crescent, sun all day, promenade cafés, and the buzz of the resort at its best.", good: "Beach life, nightlife, restaurants" },
        { key: "Playa de Poniente", img: "poniente-aerial", text: "The calmer, wider bay, family sands, the Intempo skyline and long sunset walks.", good: "Families, sunsets, space" },
        { key: "Casco Antiguo", img: "old-town-balcon", text: "Whitewashed lanes, tapas bars and the Balcón del Mediterráneo between the two beaches.", good: "Tapas, character, views" },
        { key: "Rincón de Loix", img: "bay-from-hills", text: "Quieter resort complexes with pools, a short stroll to the far end of Levante beach.", good: "Pools, quiet, value" },
        { key: "Cala de Finestrat", img: "", text: "A sheltered sandy cove just west of Poniente, with its own promenade of cafés and a slower pace.", good: "Calm water, families, evenings by the sea" },
        { key: "Sierra Cortina", img: "", text: "A residential hillside between Benidorm and Finestrat, beside the golf courses and close to Terra Mítica, with long views down to the bay.", good: "Golf, space, views" }
      ],
      goodFor: "Good for",
      homesIn1: "1 home in {area}", homesInN: "{n} homes in {area}",
      doTitle: "Things worth doing",
      todo: [
        ["The Balcón del Mediterráneo", "The white viewpoint between the two beaches, the classic Benidorm postcard at sunset."],
        ["Old-town tapas", "Wind through the casco antiguo for tascas, vermút and the freshest seafood."],
        ["Sierra Helada trails", "Walk the cliffs above Levante for views across the whole bay to the island."],
        ["Isla de Benidorm", "Hop the little ferry to the island for snorkelling and a slower afternoon."],
        ["Theme parks", "Terra Mítica, Aqualandia and Terra Natura, a short drive, big day out."],
        ["Poniente sunsets", "The wide western beach is the place to be as the sun drops into the sea."]
      ],
      picsTitle: "Benidorm in pictures",
      pics: [["bay-aerial", "The bay from above"], ["cove", "A hidden cove"], ["palms", "Palm-lined shores"], ["golden-hour", "Golden hour on the beach"], ["sailboats", "Sailing boats by the port"], ["towers", "An unmistakable skyline"]],
      endTitle: "Find your home base in Benidorm"
    },

    about: {
      title: "About Domia Stays | Holiday rentals in Benidorm",
      desc: "Domia Stays Group is a local holiday rental team in Benidorm. Every home is visited, prepared and maintained by people who live here.",
      h1: "About Domia Stays",
      lead: "A local agency with an international outlook, built on one idea: make every stay feel effortless.",
      storyTitle: "Feel at home, anywhere",
      story: [
        "Domia Stays Group was born on the Costa Blanca out of a simple belief: a holiday home should feel effortless, for the guest who books it and for the owner who trusts us with it. We are a local team in Benidorm, and we treat every home as our own.",
        "We deliberately stay small enough to care. Every property is visited, styled, photographed and maintained by people who live here, so what a guest sees online is exactly what they walk into. Hospitality standards, real-estate expertise and a revenue-driven mindset, all in service of one promise: feel at home, anywhere."
      ],
      imgAlt: "The Balcón del Mediterráneo in Benidorm's old town",
      valuesTitle: "What we believe",
      values: [
        ["Local and on-call", "Real people in Benidorm, one WhatsApp away, day or night."],
        ["Handpicked and honest", "Homes we'd happily stay in ourselves. No surprises on arrival."],
        ["Effortless, end to end", "Booking, arrival, the stay, the goodbye, every step smoothed."]
      ],
      endTitle: "Come and stay with us"
    },

    guest: {
      title: "Guest information: check-in, keys and FAQ | Domia Stays",
      desc: "Check-in and check-out times, keys, deposit, Wi-Fi, pets and how to reach the Domia Stays team during your stay in Benidorm.",
      h1: "Guest information",
      lead: "Everything you need for a smooth stay: arrival, the essentials, and how to reach us.",
      everyTitle: "In every stay",
      every: [
        ["Welcome kit included", "Curated essentials from premium brands, spare supplies and a personal Costa Blanca guide."],
        ["Premium guest standards", "Hotel-quality linens, branded amenities and a fully prepared home before every arrival."]
      ],
      faqTitle: "Frequently asked",
      faq: [
        ["What are check-in and check-out times?", "Check-in is between {from} and {until}, and check-out is by {out}. Arriving outside those hours? Message us on WhatsApp and we'll do our best to arrange it."],
        ["How do I collect the keys?", "Most homes have a smart lock or a lockbox with a code we send before arrival; for some we meet you in person. You'll get clear directions and everything you need the day before check-in."],
        ["Is a deposit required?", "A refundable security deposit and ID are required at check-in under Spanish law. The deposit is returned after check-out, once the home is confirmed in good order (usually within a few days)."],
        ["Do you register guests with the police?", "Yes. Spanish law requires guest registration; we handle it digitally before or at arrival, so you're fully compliant with nothing to worry about."],
        ["Is there Wi-Fi and air conditioning?", "Every home has fast Wi-Fi and air conditioning. The network name and password are in your welcome guide and displayed in the apartment."],
        ["Are pets allowed?", "Some homes are pet-friendly under the owner's rules. Ask before booking and we'll match you with the right apartment."],
        ["How do I get support during my stay?", "WhatsApp is fastest: a real, local person answers day or night at {phone}. You can also email {email}."]
      ],
      knowTitle: "Good to know",
      know: [
        ["Getting here", "Alicante-Elche airport (ALC) is about 45 minutes away. We can arrange a transfer on request."],
        ["House rules", "Respect community quiet hours, no parties, and leave the home as you found it. Full rules are in each apartment."],
        ["Emergencies", "112 for all emergencies. Non-urgent issue with the apartment? Message us and we'll sort it quickly."]
      ],
      endTitle: "Still have a question?"
    },

    contact: {
      title: "Contact Domia Stays | Benidorm holiday rentals",
      desc: "Message Domia Stays on WhatsApp, by email or with the form. We reply personally, usually within the hour.",
      h1: "Contact",
      lead: "Tell us your dates and who's coming. We reply personally, usually within the hour.",
      waLabel: "WhatsApp, fastest", emailLabel: "Email", phoneLabel: "Phone", based: "Based in",
      owner: "Are you a property owner?", ownerLink: "See how management works",
      formTitle: "Send an enquiry",
      name: "Your name", namePh: "e.g. Emma Roberts", dates: "Dates", datesPh: "e.g. 12 to 19 Aug",
      guests: "Guests", guestOpts: ["1 adult", "2 adults", "2 adults + children", "Family / group (4+)"],
      message: "What are you looking for?", messagePh: "Sea view, near the old town, a quiet cove…",
      send: "Send on WhatsApp", sendEmail: "Send by email",
      note: "Opens WhatsApp or your email app with your details ready to send. No account needed.",
      msgIntro: "Hi Domia Stays, I'd like to enquire about a stay.", msgName: "Name", msgDates: "Dates", msgGuests: "Guests", msgLooking: "Looking for",
      subject: "Stay enquiry"
    },

    notFound: {
      title: "Page not found | Domia Stays",
      h1: "This page isn't here.",
      text: "It may have moved, or the link may be out of date.",
      home: "Go to the home page", homes: "See the homes"
    },

    reviews: { via: "via {source}", stars: "{n} out of 5" }
  };

  var es = {
    skip: "Saltar al contenido",
    nav: { homes: "Alojamientos", benidorm: "Benidorm", owners: "Propietarios", about: "Nosotros", contact: "Contacto", guest: "Información para huéspedes", calc: "Calculadora de ingresos", main: "Principal", menu: "Menú", close: "Cerrar", language: "Idioma" },
    wa: {
      cta: "Escríbenos por WhatsApp", short: "WhatsApp",
      general: "Hola Domia Stays, me gustaría consultar una estancia en Benidorm.",
      home: "Hola Domia Stays, me interesa \"{name}\" ({area}). ¿Podéis indicarme disponibilidad y tarifas?",
      owner: "Hola Domia Stays, tengo una propiedad en Benidorm y me gustaría una estimación de lo que podría rentar.",
      evaluation: "Hola Domia Stays, me gustaría una evaluación gratuita de mi propiedad en Benidorm. Estos son los datos:",
      calc: "Hola Domia Stays, he usado vuestra calculadora de ingresos y me gustaría una evaluación gratuita de mi propiedad."
    },
    facts: { studio: "Estudio", bed1: "{n} dormitorio", bedN: "{n} dormitorios", bath1: "{n} baño", bathN: "{n} baños", sleeps: "Hasta {n} huéspedes", size: "{n} m²" },
    price: { from: "desde", night: "/ noche" },
    footer: {
      blurb: "Alojamientos vacacionales en Benidorm y la Costa Blanca, gestionados por un equipo local.",
      stay: "Alojarse", owners: "Propietarios", company: "Domia Stays", contact: "Contacto",
      management: "Gestión de propiedades", rights: "Todos los derechos reservados"
    },
    cta: {
      title: "Encontremos tu lugar en la bahía",
      text: "Cuéntanos tus fechas y quiénes venís. Respondemos personalmente, normalmente en menos de una hora.",
      contact: "Envíanos un mensaje"
    },

    home: {
      title: "Apartamentos vacacionales en Benidorm | Domia Stays",
      desc: "Apartamentos vacacionales en Benidorm gestionados por un equipo local. Mira los alojamientos y consulta tus fechas por WhatsApp.",
      browse: "Ver los alojamientos",
      cine: {
        eyebrow: "Alojamientos seleccionados",
        pre: "Tu", gold: "estancia", post: "en la", line2: "Costa Blanca",
        lead: "Apartamentos cuidados por gente que vive aquí. Las llaves, la limpieza y la ayuda por WhatsApp vienen de un mismo equipo local.",
        scroll: "Desliza",
        introTitle: "No es un portal de anuncios. Una colección cuidada.",
        introText: "Domia Stays es una agencia boutique de alquiler en Benidorm. Cuidamos un número deliberadamente pequeño de alojamientos, cada uno visitado, decorado y mantenido por nuestro propio equipo, para que al llegar todo simplemente funcione.",
        introAlt: "La bahía de Benidorm vista desde los pinares sobre Levante"
      },
      videoLabel: "Benidorm visto desde el mar",
      finder: { title: "¿Buscas algo concreto?", lead: "Elige la zona, cuántos sois y los dormitorios que necesitáis.", area: "Zona", anyArea: "Cualquier zona", guests: "Huéspedes", anyGuests: "Cualquier número", guestsN: "{n} o más", beds: "Dormitorios", anyBeds: "Cualquiera", bedsN: "{n} o más", go: "Ver alojamientos" },
      homesTitle: "Los alojamientos",
      homesAll: "Ver los {n} alojamientos",
      includes: [
        ["Una llegada sencilla", "La entrada es de {from} a {until}, con cerradura inteligente, caja de seguridad o uno de nosotros en la puerta. ¿Llegas fuera de ese horario? Dínoslo y haremos lo posible por organizarlo."],
        ["Un alojamiento listo", "Limpieza de nivel hotel antes de cada llegada, con ropa de cama y toallas recién puestas."],
        ["Ayuda local, de día o de noche", "Una persona real en Benidorm responde por WhatsApp, a cualquier hora."],
        ["Extras si los pides", "Traslados al aeropuerto, compra y experiencias, organizados antes de que aterrices."]
      ],
      includesMore: "Leer la información para huéspedes",
      benidormTitle: "Benidorm, más allá de la postal",
      benidormText: "Dos grandes playas, montañas de fondo, un casco antiguo de calles estrechas y un skyline único en todo el Mediterráneo.",
      benidormLink: "Leer la guía de Benidorm",
      benidormAlt: "La playa de Poniente y el skyline de Benidorm al atardecer",
      stats: [["5 km", "de playas de arena"], ["300+", "días de sol al año"], ["2", "bahías y un casco antiguo entre ellas"], ["45 min", "desde el aeropuerto de Alicante"]],
      ownersTitle: "¿Tienes un apartamento en Benidorm?",
      ownersText: "Lo gestionamos de principio a fin: precios, huéspedes, limpieza, licencias y un informe cada mes. Tú recibes los ingresos sin el día a día.",
      ownersFigure: "20%", ownersFigureLabel: "de los ingresos netos, tras las comisiones de plataforma. Esa es toda nuestra comisión.",
      ownersCta: "Cómo funciona la gestión", ownersCalc: "Calcula tus ingresos",
      reviewsTitle: "Lo que dicen los huéspedes"
    },

    homes: {
      title: "Alojamientos en Benidorm: la colección | Domia Stays",
      desc: "Explora los apartamentos de Domia Stays en Benidorm y la Costa Blanca. Filtra por zona, huéspedes y dormitorios, y consulta tus fechas.",
      h1: "La colección",
      lead: "Alojamientos en Benidorm y la Costa Blanca, cada uno gestionado por nuestro equipo. Abre cualquiera para ver fotos, detalles y precios.",
      filters: "Filtrar alojamientos",
      area: "Zona", allAreas: "Todas las zonas", guests: "Huéspedes", anyGuests: "Cualquiera", guestsN: "{n}+", beds: "Dormitorios", anyBeds: "Cualquiera", bedsN: "{n}+",
      sort: "Ordenar", sortRec: "Recomendados", sortLow: "Precio, de menor a mayor", sortHigh: "Precio, de mayor a menor",
      count1: "1 alojamiento", countN: "{n} alojamientos",
      empty: "Ningún alojamiento coincide con esos filtros.", clear: "Quitar filtros", emptyHelp: "Cuéntanos qué necesitas y te sugerimos un alojamiento.",
      none: "Estamos preparando nuevos alojamientos. Escríbenos y te contamos lo que viene."
    },

    homePage: {
      title: "{name} en {area} | Domia Stays",
      crumb: "La colección",
      photos: "Fotos de {name}", showAll: "Ver las {n} fotos", photoN: "Foto {i} de {n}", prev: "Foto anterior", next: "Foto siguiente", closeGallery: "Cerrar fotos",
      about: "Sobre el alojamiento",
      inside: "Qué incluye",
      know: "Conviene saber",
      checkIn: "Entrada", checkInVal: "de {from} a {until}", checkOut: "Salida", checkOutVal: "hasta las {out}",
      minStay: "Estancia mínima", nights1: "{n} noche", nightsN: "{n} noches",
      licence: "Licencia turística",
      rules: "Normas", rulesVal: "Sin fiestas y respetando el horario de descanso del edificio.",
      where: "Dónde está", map: "Ver {area} en Google Maps",
      enquire: "Consulta tus fechas",
      arrive: "Llegada", depart: "Salida", guests: "Huéspedes", guest1: "1 huésped", guestN: "{n} huéspedes",
      ask: "Consultar estas fechas", askShort: "Consultar fechas",
      note: "Abre WhatsApp con tu mensaje listo para enviar. Respondemos personalmente, normalmente en menos de una hora.",
      rate: "Las tarifas cambian según la temporada. Te confirmamos el precio exacto para tus fechas.",
      email: "Prefiero escribir por email", emailSubject: "Consulta: {name}",
      book: "Reservar online", bookShort: "Reservar o consultar", orAsk: "o consúltanos antes", onAirbnb: "Verlo en Airbnb", onBooking: "Verlo en Booking.com",
      msg: "Hola Domia Stays, me interesa \"{name}\" ({area}).",
      msgDates: "Llegada {in}, salida {out}.", msgGuests: "Somos {n}.", msgEnd: "¿Podéis confirmarme disponibilidad y tarifa?",
      dateError: "La salida tiene que ser posterior a la llegada.",
      more: "Más alojamientos", back: "Volver a la colección",
      reviews: "Opiniones sobre este alojamiento"
    },

    owners: {
      title: "Gestión de alquiler vacacional en Benidorm | Domia Stays",
      desc: "Gestión integral de tu apartamento en Benidorm: precios, huéspedes, limpieza, licencias e informes mensuales. 20% de los ingresos netos.",
      h1: "Tu apartamento en Benidorm, gestionado desde la primera foto hasta el pago mensual.",
      lead: "Confía tu apartamento a un equipo local y déjalo rentar, sin el día a día.",
      cta: "Solicitar evaluación gratis", calc: "Calcula tus ingresos",
      figure: "20%", figureLabel: "de los ingresos netos",
      figureNote: "Nuestra comisión se aplica tras las comisiones de plataforma, así que solo ganamos cuando tu alojamiento gana.",
      realityTitle: "Gestionarlo tú mismo",
      reality: ["Consume mucho tiempo", "Operativamente complejo", "Ingresos irregulares", "Dependiente de plataformas como Airbnb"],
      realityNote: "La mayoría rinde por debajo de su potencial por falta de optimización.",
      oppTitle: "Con Domia Stays",
      opp: ["Tarifas por noche más altas", "Mayor ocupación", "Huéspedes de mejor calidad"],
      oppNote: "El mercado de corta estancia en la Costa Blanca crece rápido. Tu propiedad puede rentar mucho más que con el alquiler tradicional.",
      earnTitle: "Lo que tu propiedad podría rentar",
      earnLong: "Alquiler tradicional de larga estancia", earnLongVal: "€800–1,000", earnDomia: "Con gestión de Domia Stays", earnDomiaVal: "€1,500–2,200+",
      perMonth: "/ mes", earnUp: "Hasta el doble de ingresos",
      earnNote: "Estimaciones del mercado de Benidorm. Los resultados reales dependen de la propiedad, la temporada y la ocupación.",
      priceTitle: "Precios simples y alineados",
      priceText: "Una comisión clara. Solo ganamos cuando tu alojamiento gana, así que llenar tu calendario a la mejor tarifa es nuestro trabajo, no tu preocupación.",
      pricePoints: ["Una comisión clara: solo ganamos cuando tú ganas", "Sin comisiones ocultas, nunca", "Transparencia total: informes mensuales, visibilidad de reservas y seguimiento de ingresos"],
      priceNote: "La comisión se aplica sobre los ingresos netos, tras las comisiones de plataforma. Sin cuota de alta y con un informe transparente cada mes.",
      talk: "Háblanos de tu propiedad",
      doTitle: "Todo, gestionado",
      doLead: "Todo lo siguiente está incluido en una única comisión de gestión. Sin extras ocultos, sin sorpresas.",
      groups: [
        ["Ingresos", [
          ["Precios dinámicos", "Tarifas ajustadas a diario con IA (PriceLabs), según la demanda, los eventos locales y la competencia."],
          ["Gestión de reservas", "Todas las reservas en Airbnb, Booking.com, VRBO, directo y más de 50 canales. Cero solapamientos."],
          ["Informes mensuales", "Un PDF detallado: ingresos brutos, comisiones OTA, comisión y pago neto. El día 5 de cada mes."],
          ["Portal del propietario", "Calendario, reservas y panel de ingresos en vivo, 24/7 desde cualquier dispositivo."]
        ]],
        ["Huéspedes", [
          ["Entrada y salida de huéspedes", "Cerradura inteligente o equipo local, siete días a la semana. Instrucciones de llegada automáticas 24h antes."],
          ["Soporte 24/7", "Respuesta en menos de una hora en tres idiomas. Consultas fuera de horario asistidas por IA."],
          ["Gestión de llaves", "Cerraduras inteligentes con códigos que cambian por reserva. Acceso seguro 24/7, sin entrega de llaves."]
        ]],
        ["La vivienda", [
          ["Limpieza profesional", "Protocolo de nivel hotel tras cada salida. Verificada con fotos antes de cada llegada."],
          ["Lencería y lavandería", "Lavandería profesional en cada rotación. Ropa de cama y toallas de calidad hotelera siempre listas."],
          ["Mantenimiento y reparaciones", "Red de técnicos locales. Respuesta de emergencia en dos horas, coordinada por Domia."]
        ]],
        ["Trámites", [
          ["Registro turístico (NRUA)", "Registramos tu propiedad en Turisme Comunitat Valenciana. La licencia obligatoria en todos los anuncios."],
          ["Registro SES.Hospedajes", "Datos de huéspedes enviados automáticamente al Ministerio del Interior en 24h desde cada entrada."]
        ]]
      ],
      legalTitle: "Cumplimiento legal y fiscal",
      legalLead: "Mantenemos tu propiedad totalmente al día con la normativa legal y fiscal española.",
      legalChips: ["NRUA", "SES.Hospedajes", "IEAT", "Modelo 303", "Modelo 179", "GDPR"],
      legal: [
        ["Registro de licencia turística (NRUA)", "Para cada propiedad."],
        ["Registro de huéspedes vía SES.Hospedajes", "En menos de 24h desde la entrada."],
        ["Impuesto turístico trimestral (IEAT)", "Presentado en tu nombre."],
        ["Declaraciones de IVA (Modelo 303)", "Cada trimestre."],
        ["Ingresos por alquiler (Modelo 179)", "Declarado anualmente."]
      ],
      legalEnd: "Totalmente en regla. Totalmente gestionado. Cero preocupaciones.",
      stepsTitle: "Cómo es el alta",
      steps: [
        ["Evaluación de la propiedad", "Analizamos tu vivienda y su potencial real de ingresos."],
        ["Preparación", "Decoración, básicos, cerradura inteligente y puesta a punto."],
        ["Creación del anuncio", "Fotos profesionales, textos y precios en cada plataforma."],
        ["Publicación", "En Airbnb, Booking.com, VRBO y la web directa."],
        ["Optimización continua", "Ajuste continuo de precios, reseñas y rendimiento."]
      ],
      fitTitle: "Propiedades con las que mejor trabajamos",
      fit: ["Apartamentos bien ubicados", "Espacios modernos o reformados", "Buen posicionamiento de marca", "En Benidorm y la Costa Blanca"],
      endTitle: "¿Pensando en publicar tu propiedad?",
      endText: "Envíanos la dirección y unas fotos por WhatsApp. Te responderemos con una estimación honesta de lo que podría rentar.",
      endCta: "Publica tu propiedad"
    },

    calc: {
      title: "Calculadora de ingresos para propietarios | Domia Stays",
      desc: "Mira lo que recibirías por una reserva en Airbnb, Booking.com, VRBO o directa. La comisión de Domia es el 20% de los ingresos netos.",
      crumb: "Propietarios",
      h1: "Calculadora de ingresos",
      lead: "Mira exactamente lo que recibirías por una reserva y cómo cambia según el canal. La comisión de Domia es el 20% del neto, tras las comisiones de plataforma.",
      price: "Precio de la reserva", channel: "Canal de reserva", direct: "Directo",
      flowPrice: "Precio de la reserva", flowFee: "Comisión de {channel} ({pct}%)", flowNet: "Neto (tras plataforma)", flowDomia: "Domia 20%", flowYou: "Recibes",
      split: "A dónde va el dinero", splitYou: "Tú (propietario)", splitDomia: "Domia Stays",
      byChannel: "Tu pago según el canal",
      year: "Estima tu año", nights: "Noches reservadas al mes", nightsUnit: "noches", rate: "Tarifa media por noche", rateUnit: "/ noche",
      annual: "Tu pago anual estimado", perYear: "/ año",
      note: "Solo una estimación. Los resultados reales dependen de la propiedad, la temporada, la ocupación y el mix de canales.",
      cta: "Solicitar evaluación gratis", back: "Volver a Propietarios"
    },

    benidorm: {
      title: "Guía de Benidorm: playas, zonas y qué hacer | Domia Stays",
      desc: "Dónde alojarse en Benidorm: Levante, Poniente, el casco antiguo y Rincón de Loix, y lo que merece la pena hacer cerca.",
      h1: "Benidorm",
      lead: "Dos grandes bahías, más de 300 días de sol y un skyline único. Aquí están nuestros alojamientos, y qué hacer a su alrededor.",
      heroAlt: "La playa de Levante vista desde el Balcón del Mediterráneo",
      areasTitle: "Los barrios",
      areas: [
        { key: "Playa de Levante", img: "levante-summer", text: "La animada media luna dorada: sol todo el día, cafés en el paseo y el mejor ambiente de la ciudad.", good: "Playa, ocio nocturno, restaurantes" },
        { key: "Playa de Poniente", img: "poniente-aerial", text: "La bahía más tranquila y amplia: arena familiar, el skyline de Intempo y largos paseos al atardecer.", good: "Familias, atardeceres, amplitud" },
        { key: "Casco Antiguo", img: "old-town-balcon", text: "Calles encaladas, bares de tapas y el Balcón del Mediterráneo entre las dos playas.", good: "Tapas, encanto, vistas" },
        { key: "Rincón de Loix", img: "bay-from-hills", text: "Complejos residenciales más tranquilos con piscinas, a un paseo del extremo de la playa de Levante.", good: "Piscinas, tranquilidad, precio" },
        { key: "Cala de Finestrat", img: "", text: "Una cala de arena resguardada justo al oeste de Poniente, con su propio paseo de cafés y un ritmo más pausado.", good: "Aguas tranquilas, familias, tardes junto al mar" },
        { key: "Sierra Cortina", img: "", text: "Una ladera residencial entre Benidorm y Finestrat, junto a los campos de golf y cerca de Terra Mítica, con vistas amplias hasta la bahía.", good: "Golf, espacio, vistas" }
      ],
      goodFor: "Ideal para",
      homesIn1: "1 alojamiento en {area}", homesInN: "{n} alojamientos en {area}",
      doTitle: "Cosas que merecen la pena",
      todo: [
        ["El Balcón del Mediterráneo", "El mirador blanco entre las dos playas: la postal clásica de Benidorm al atardecer."],
        ["Tapas en el casco antiguo", "Piérdete por el casco antiguo entre tascas, vermút y el marisco más fresco."],
        ["Sendas de la Sierra Helada", "Camina por los acantilados sobre Levante para ver toda la bahía hasta la isla."],
        ["Isla de Benidorm", "Cruza en el pequeño ferry a la isla para hacer snorkel y una tarde más tranquila."],
        ["Parques temáticos", "Terra Mítica, Aqualandia y Terra Natura: a un corto trayecto, un gran día."],
        ["Atardeceres en Poniente", "La amplia playa de poniente es el lugar ideal cuando el sol cae al mar."]
      ],
      picsTitle: "Benidorm en imágenes",
      pics: [["bay-aerial", "La bahía desde el aire"], ["cove", "Una cala escondida"], ["palms", "Orillas entre palmeras"], ["golden-hour", "Atardecer en la playa"], ["sailboats", "Veleros junto al puerto"], ["towers", "Un skyline inconfundible"]],
      endTitle: "Encuentra tu base en Benidorm"
    },

    about: {
      title: "Sobre Domia Stays | Alquiler vacacional en Benidorm",
      desc: "Domia Stays Group es un equipo local de alquiler vacacional en Benidorm. Cada alojamiento lo visita, prepara y mantiene gente que vive aquí.",
      h1: "Sobre Domia Stays",
      lead: "Una agencia local con mirada internacional, construida sobre una idea: que cada estancia sea sencilla.",
      storyTitle: "Feel at home, anywhere",
      story: [
        "Domia Stays Group nació en la Costa Blanca con una idea sencilla: una vivienda vacacional debe sentirse fácil, tanto para el huésped que la reserva como para el propietario que nos la confía. Somos un equipo local en Benidorm y cuidamos cada alojamiento como si fuera nuestro.",
        "Nos mantenemos deliberadamente pequeños para poder cuidar. Cada propiedad es visitada, decorada, fotografiada y mantenida por personas que viven aquí, para que lo que el huésped ve online sea exactamente lo que encuentra al llegar. Estándares de hospitalidad, experiencia inmobiliaria y una mentalidad orientada a los ingresos, al servicio de una promesa: sentirse como en casa, en cualquier lugar."
      ],
      imgAlt: "El Balcón del Mediterráneo en el casco antiguo de Benidorm",
      valuesTitle: "En qué creemos",
      values: [
        ["Locales y disponibles", "Personas reales en Benidorm, a un WhatsApp de distancia, de día o de noche."],
        ["Seleccionados y honestos", "Alojamientos en los que nos quedaríamos nosotros mismos. Sin sorpresas al llegar."],
        ["Sencillo, de principio a fin", "Reserva, llegada, estancia y despedida: cada paso, cuidado."]
      ],
      endTitle: "Ven a alojarte con nosotros"
    },

    guest: {
      title: "Información para huéspedes: entrada y llaves | Domia Stays",
      desc: "Horarios de entrada y salida, llaves, fianza, Wi-Fi, mascotas y cómo contactar con el equipo de Domia Stays durante tu estancia.",
      h1: "Información para huéspedes",
      lead: "Todo lo necesario para una estancia sin complicaciones: llegada, lo esencial y cómo contactarnos.",
      everyTitle: "En cada estancia",
      every: [
        ["Kit de bienvenida incluido", "Básicos seleccionados de marcas premium, suministros y una guía personal de la Costa Blanca."],
        ["Estándares premium", "Ropa de cama de calidad hotelera, amenities de marca y una vivienda lista antes de cada llegada."]
      ],
      faqTitle: "Preguntas frecuentes",
      faq: [
        ["¿Cuáles son los horarios de entrada y salida?", "La entrada es entre las {from} y las {until}, y la salida hasta las {out}. ¿Llegas fuera de ese horario? Escríbenos por WhatsApp y haremos lo posible por organizarlo."],
        ["¿Cómo recojo las llaves?", "La mayoría de los alojamientos tienen cerradura inteligente o caja de seguridad con un código que enviamos antes de la llegada; en algunos te recibimos en persona. Recibirás instrucciones claras el día antes de la entrada."],
        ["¿Se requiere una fianza?", "Se requiere una fianza reembolsable y un documento de identidad en la entrada, conforme a la ley española. La fianza se devuelve tras la salida, una vez comprobado que el alojamiento queda en buen estado (normalmente en pocos días)."],
        ["¿Registráis a los huéspedes ante la policía?", "Sí. La ley española exige el registro de huéspedes; lo hacemos digitalmente antes o al llegar, para que cumplas la normativa sin preocuparte de nada."],
        ["¿Hay Wi-Fi y aire acondicionado?", "Todos los alojamientos tienen Wi-Fi rápido y aire acondicionado. El nombre de la red y la contraseña están en tu guía de bienvenida y en el apartamento."],
        ["¿Se admiten mascotas?", "Algunos alojamientos admiten mascotas según las normas del propietario. Pregúntanos antes de reservar y te asignaremos el apartamento adecuado."],
        ["¿Cómo recibo soporte durante la estancia?", "WhatsApp es lo más rápido: una persona real y local responde de día o de noche en el {phone}. También puedes escribir a {email}."]
      ],
      knowTitle: "Conviene saber",
      know: [
        ["Cómo llegar", "El aeropuerto de Alicante-Elche (ALC) está a unos 45 minutos. Podemos organizar un traslado si lo solicitas."],
        ["Normas del alojamiento", "Respeta el horario de descanso de la comunidad, sin fiestas, y deja el alojamiento como lo encontraste. Las normas completas están en cada apartamento."],
        ["Emergencias", "112 para cualquier emergencia. ¿Algo no urgente con el apartamento? Escríbenos y lo resolvemos rápido."]
      ],
      endTitle: "¿Aún tienes una duda?"
    },

    contact: {
      title: "Contacto | Domia Stays, alquiler vacacional en Benidorm",
      desc: "Escribe a Domia Stays por WhatsApp, email o con el formulario. Respondemos personalmente, normalmente en menos de una hora.",
      h1: "Contacto",
      lead: "Cuéntanos tus fechas y quiénes venís. Respondemos personalmente, normalmente en menos de una hora.",
      waLabel: "WhatsApp, lo más rápido", emailLabel: "Email", phoneLabel: "Teléfono", based: "Ubicados en",
      owner: "¿Eres propietario?", ownerLink: "Descubre cómo funciona la gestión",
      formTitle: "Envía una consulta",
      name: "Tu nombre", namePh: "p. ej. Emma Roberts", dates: "Fechas", datesPh: "p. ej. del 12 al 19 de agosto",
      guests: "Huéspedes", guestOpts: ["1 adulto", "2 adultos", "2 adultos + niños", "Familia / grupo (4+)"],
      message: "¿Qué estás buscando?", messagePh: "Vistas al mar, cerca del casco antiguo, una cala tranquila…",
      send: "Enviar por WhatsApp", sendEmail: "Enviar por email",
      note: "Abre WhatsApp o tu correo con tus datos listos para enviar. No hace falta cuenta.",
      msgIntro: "Hola Domia Stays, me gustaría consultar una estancia.", msgName: "Nombre", msgDates: "Fechas", msgGuests: "Huéspedes", msgLooking: "Busco",
      subject: "Consulta de estancia"
    },

    notFound: {
      title: "Página no encontrada | Domia Stays",
      h1: "Esta página no está aquí.",
      text: "Puede que se haya movido o que el enlace esté desactualizado.",
      home: "Ir a la página de inicio", homes: "Ver los alojamientos"
    },

    reviews: { via: "vía {source}", stars: "{n} de 5" }
  };

  var api = { en: en, es: es };
  g.DomiaCopy = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
