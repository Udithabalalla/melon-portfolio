// ─────────────────────────────────────────────────────────────
//  Single source of truth for all site content.
//  Update copy, links, and images here — no component edits needed.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Uditha Balalla",
  owner: "Uditha Balalla",
  role: "AI Product Designer",
  email: "balallauditha@gmail.com", // TODO: confirm — inferred from CV (@ was missing)
  location: "Sri Lanka · Available worldwide",
  available: true,
};

export const nav = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

export const hero = {
  // rendered word-by-word for the staggered reveal
  headline: ["Designing", "AI", "products", "people", "actually", "understand."],
  intro:
    "I'm an AI Product Designer blending UX research, interface design, and front-end engineering to turn complex enterprise problems into experiences that feel effortless.",
};

export const about = {
  label: "About",
  body: "I'm an AI Product Designer and research engineer with 5+ years of experience turning complex problems into usable digital products. I currently design AI-driven experiences at IFS, an industry-leading enterprise software company, and hold a First Class BSc (Hons) in Software Engineering. My work lives where user research, interface design, and front-end engineering meet.",
  capabilities: [
    "UX Research",
    "AI Product Design",
    "Interface Design",
    "Prototyping",
    "Front-End Development",
    "Design Systems",
  ],
  stats: [
    { value: "5+", label: "Years of experience" },
    { value: "1st", label: "Class BSc (Hons)" },
    { value: "4+", label: "R&D projects shipped" },
  ],
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    category: "AI",
    items: [
      "Prompt Engineering",
      "AI-Assisted UI/UX Design",
      "Generative AI & LLMs",
      "NLP & ML Fundamentals",
      "AI API & MCP Integration",
    ],
  },
  {
    category: "Design",
    items: [
      "User Experience (UX) Design",
      "Visual Design",
      "Information Architecture",
      "Accessibility",
      "Prototyping",
    ],
  },
  {
    category: "Research",
    items: [
      "User Research",
      "Journey Mapping",
      "Proto Personas",
      "Workshop Synthesis",
      "FullStory",
    ],
  },
  {
    category: "Development",
    items: ["JavaScript", "HTML", "CSS", "React", "Front-End Development"],
  },
  {
    category: "Tools",
    items: ["Figma", "FigJam", "Behance", "PowerPoint", "Canva"],
  },
  {
    category: "Soft Skills",
    items: [
      "Leadership",
      "Communication",
      "Collaboration",
      "Adaptability",
      "Attention to Detail",
    ],
  },
];

export type ExperienceEntry = {
  role: string;
  org: string;
  period?: string;
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "AI Product Designer",
    org: "IFS R&D International (Pvt) Ltd",
    period: "2026 – Present",
    bullets: [
      "Design AI-driven product experiences for enterprise field-service and asset-management platforms",
      "Lead UX research synthesis — turning customer workshops into proto personas and journey maps",
      "Integrate generative AI and LLM capabilities into product workflows",
      "Prototype and validate concepts in Figma with product and engineering teams",
    ],
  },
  {
    role: "UI/UX Designer (Intern)",
    org: "IFS R&D International (Pvt) Ltd",
    period: "2025 – 2026",
    bullets: [
      "Supported research and design across enterprise asset and service management domains",
      "Produced wireframes, prototypes, and journey maps from requirements and workshops",
      "Contributed to the design system and accessibility improvements",
    ],
  },
  {
    role: "Senior UI/UX Designer",
    org: "Mooverly · Anuradhapura",
    period: "2023 – 2024",
    bullets: [
      "Owned product design end-to-end across web and mobile experiences",
      "Ran user research and translated findings into interface improvements",
      "Built and maintained reusable UI components and style guides",
    ],
  },
  {
    role: "Freelance UI/UX Designer",
    org: "Upwork & Freelancer",
    period: "2022 – 2024",
    bullets: [
      "Delivered UI/UX design and front-end work for international clients",
      "Handled the full cycle from discovery and wireframing to high-fidelity prototypes",
      "Managed client communication, scope, and delivery independently",
    ],
  },
];

export type EducationEntry = {
  title: string;
  subtitle?: string;
};

export const education: EducationEntry[] = [
  {
    title: "BSc (Hons) Software Engineering — First Class",
    subtitle: "University of Bedfordshire · 2025–2026",
  },
  {
    title: "Higher National Diploma in Software Engineering",
    subtitle: "National Institute of Business Management · 2023–2024",
  },
  {
    title: "Diploma in Software Engineering",
    subtitle: "National Institute of Business Management · 2023–2024",
  },
  {
    title: "Enterprise Design Thinking Practitioner",
    subtitle: "IBM · Certification",
  },
  {
    title: "UI/UX Specialization",
    subtitle: "California Institute of the Arts · Certification",
  },
  {
    title: "Foundations of User Experience (UX) Design",
    subtitle: "Google · Certification",
  },
  {
    title: "UX Design Process: Empathize, Define & Ideate",
    subtitle: "Google · Certification",
  },
  {
    title: "Build Wireframes & Low-Fidelity Prototypes",
    subtitle: "Google · Certification",
  },
];

export const careerInterests = [
  "AI Product Design",
  "UX Research",
  "Human-AI Interaction",
  "Design Systems",
  "Enterprise UX",
];

export type ProjectSection = {
  heading: string;
  body: string;
  // Optional illustration for this section (path under /public, e.g. "/work/.../x.png").
  image?: string;
  imageAlt?: string;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  description: string;
  role: string;
  tools: string[];
  // Placeholder gradient used until a real cover image is added.
  cover: { from: string; to: string; text: string };
  // Optional real cover image (path under /public). Overrides the gradient when set.
  coverImage?: string;

  // ── Case-study page fields (see /work/:slug) ──────────────
  tags: string[];
  client: string;
  timeline: string;
  overview: string;
  challenge: string;
  approach: string;
  results: string;
  sections: ProjectSection[];
};

export const projects: Project[] = [
  {
    slug: "dispatcher-console-settings-and-map",
    title: "Designing the Control Layer of a Next-Gen Dispatcher Console",
    category: "Product Design · Discovery to Build",
    year: "2026",
    description:
      "Led discovery and design for the settings, filtering, and map experiences of a new dispatcher console for utility field-service operations. I took the work from framing workshops through to hi-fi designs and a coded prototype.",
    role: "Product Designer — Discovery Lead, Settings & Map",
    tools: ["Figma", "FigJam", "Workshop Facilitation", "Design System", "React (AI-assisted)", "Claude Code", "Playwright MCP"],
    cover: { from: "#0f2a44", to: "#2fb5a3", text: "Dispatcher Console" },
    coverImage: "/work/dispatcher-console/console-orders.png",
    tags: ["PRODUCT DESIGN", "DISCOVERY", "ENTERPRISE UX", "MAP UX", "DESIGN SYSTEMS", "AI PROTOTYPING"],
    client: "Enterprise field-service software (utilities: electric, gas & water)",
    timeline: "2026 · Discovery → Design → Prototype",
    overview:
      "Dispatchers in utility control centres coordinate thousands of work orders, workers, and vehicles across large regions, often during storms and emergencies. Our team was designing a new dispatcher console from the ground up. I owned two areas that shape how dispatchers see their world: the settings and filtering layer, which decides what each person sees, and the map, where most dispatch decisions are made spatially.",
    challenge:
      "Dispatchers need very flexible views: different regions, order types, columns, sorts, and saved setups for different shifts. But every work type can carry hundreds of fields, and unrestricted filtering on large datasets can produce slow, expensive queries that hurt the whole system. On the map, hundreds of orders, workers, vehicles, and landmarks compete for attention, and an urgent job must never get lost among routine ones. The challenge was to give power users full control without overwhelming everyday dispatchers or compromising performance.",
    approach:
      "I ran a structured discovery process before designing anything. I wrote a pre-read so stakeholders arrived with shared vocabulary and context, then facilitated a cross-functional framing workshop with product management, engineering, service design, and UX. We sorted what we knew to be true, what we were assuming, and what the open challenges were, then turned them into prioritised 'How Might We' questions. Those findings shaped a drawer-based settings model and a new map visual language. I designed both in Figma, iterated through feedback with product and engineering leads, then built the settings and filtering flows into a working coded prototype using AI-assisted development.",
    results:
      "The team agreed on a clear settings model: contextual per-panel settings, clearly separated filter scopes, and a lean MVP with complex saved views deferred until real usage could justify them. The filtering drawer and the columns-and-sorting modal were designed, merged into the shared design branch, and implemented as a working prototype for engineering review. On the map, a redesigned cluster and icon system was well received by the engineering lead. The team also gained a documented map behaviour baseline for the next round of ideation.",
    sections: [
      {
        heading: "PHASE 1 — SETTING THE STAGE WITH A PRE-READ",
        body: "Settings is a topic where everyone has a different mental model. Before the workshop I wrote a short pre-read that defined what we meant by panel settings, explained why the area mattered, mapped the configuration landscape neutrally, and listed what the workshop would and would not decide. It was deliberately non-prescriptive, so the workshop stayed a place to frame the problem together rather than react to a solution.",
        // IMAGE: 2–3 slides from the pre-read deck (definitions slide + "what this workshop will decide" slide).
      },
      {
        heading: "PHASE 2 — FACILITATING THE FRAMING WORKSHOP",
        body: "I facilitated a cross-functional session with product, engineering, service design, and UX. Participants added sticky notes for known truths about the product vision, then assumptions and challenges, and finally turned them into How Might We questions and voted on them. The top-voted question was how we might offer flexible filtering while setting limits that protect system performance.",
        image: "/work/dispatcher-console/framing-workshop.png",
        imageAlt: "FigJam framing workshop board with product-vision, assumptions, and prioritised How Might We clusters.",
      },
      {
        heading: "KEY DISCOVERY FINDINGS",
        body: "Five findings shaped the design. (1) Filtering flexibility and performance pull against each other: dispatchers rely heavily on advanced field queries, but unrestricted queries over millions of orders can time out, so the interface needs guardrails and should show when a filter is likely to be expensive. (2) Filter scope is confusing: global, basic, advanced, and saved filters and workspaces each work at a different level, and users need to tell them apart at a glance. (3) Column relabelling only changes the display, so users need to see clearly what they can edit and save and what is fixed by admins. (4) Deep multi-level sorting adds complexity without much value, so we capped it at three levels. (5) Named saved views are powerful but unproven, so we deferred them from the MVP and planned to validate them with customers rather than build on assumption.",
        // IMAGE: A clean findings card grid (5 cards: icon + one-line insight) — redraw in your own style rather than screenshotting the board.
      },
      {
        heading: "DESIGNING THE SETTINGS MODEL",
        body: "I split settings into focused, contextual surfaces instead of one large dialog. A filtering drawer sits next to the data so dispatchers can refine work without losing their place. A columns-and-sorting modal lets them pick, reorder, and relabel columns and set up to three sort levels. Changes only apply when the user clicks Apply, so dispatchers can experiment safely without the live grid moving under them. Everything is limited to fields that admins have configured, which keeps the console flexible but controlled. Options and View drawers follow the same pattern to complete the system.",
        image: "/work/dispatcher-console/settings-designs.png",
        imageAlt: "Hi-fi Figma screens of the settings and configuration surfaces: columns & sort, filter query, and saved views.",
      },
      {
        heading: "FROM FIGMA TO A WORKING PROTOTYPE",
        body: "Instead of handing over static screens, I built the settings and filtering flows into a coded prototype on a dedicated branch, using AI-assisted development on top of the team's design system components. Engineers and product managers could click through real interactions such as drawer behaviour, Apply/Reset/Cancel states, and column reordering, and give feedback on behaviour, not just visuals.",
        // IMAGE: Short GIF/video of the prototype: open filter drawer → add filter → Apply → grid updates. Side-by-side Figma vs coded version also works well.
      },
      {
        heading: "REDESIGNING THE MAP'S VISUAL LANGUAGE",
        body: "The map is where dispatching happens, so readability under load matters. I created a clear icon set with a distinct shape for each entity type: job-code orders, vehicles, landmarks or depots, and workers, with worker icons showing either status or capacity. I changed clusters from squares to hexagons so they stand apart from single orders, and capped cluster counts at two digits ('99+') to keep them readable. I also explored colouring clusters by severity, with red when a critical emergency is inside and orange for high priority, so urgent work shows up even when zoomed out. Icons change colour against status backgrounds to keep contrast, which led to a decision with engineering to build icons as SVGs so colour can be applied dynamically.",
        image: "/work/dispatcher-console/map-icons.png",
        imageAlt: "Map icon system mapping each field entity type — assets, infrastructure, and system elements — to a distinct icon.",
      },
      {
        heading: "TESTING THE SEVERITY IDEA HONESTLY",
        body: "Severity-coloured clusters raised a real concern from engineering: a coloured cluster can look like a single urgent order and pull attention in the wrong direction. Instead of defending the idea, we agreed to test it on a populated map. It reminded me that on an operational map, the attention signals you add can become noise themselves.",
        // IMAGE: Before/after comparison of the same map area with neutral vs severity-coloured clusters.
      },
      {
        heading: "MAPPING MAP BEHAVIOUR WITH AI",
        body: "To prepare for the next round of map interaction design, I used an AI agent connected to a browser automation tool to explore a working map prototype. It systematically documented every control, layer, panel, and state change. This gave the team a complete, shared reference of map behaviour to ideate from, instead of relying on memory or scattered notes.",
        image: "/work/dispatcher-console/map-console.png",
        imageAlt: "Dispatcher console map view with clustered orders, basemap controls, and an order detail panel open.",
      },
      {
        heading: "IMPACT & WHAT I LEARNED",
        body: "The discovery work gave a cross-functional team a shared language for settings, a prioritised problem to solve, and a lean, evidence-based MVP scope. The settings designs moved from workshop to working prototype in a matter of weeks. My biggest lesson was that in enterprise tools, a large part of good design is deciding what not to build yet and being clear about which choices still need customer validation.",
        // IMAGE: Simple timeline graphic: Pre-read → Framing workshop → Findings → Designs → Prototype → Map iteration.
      },
    ],
  },
  {
    slug: "service-projects",
    title: "Service Projects: Bridging Service Requests and Project Management",
    category: "Product Design · Enterprise ERP",
    year: "2025",
    description:
      "Designed a new Service Projects capability for IFS Cloud. It groups related service work into one plannable, trackable work package, shaped through research, customer validation sessions, and iterative design.",
    role: "UX Designer",
    tools: ["Figma", "FigJam", "IFS Design System", "PowerPoint", "Customer Validation Sessions", "User Journey Mapping"],
    cover: { from: "#2b1d5c", to: "#e0607e", text: "Service Projects" },
    // IMAGE (cover): Hero mockup of the Service Project overview page with the work package structure and Gantt visible.
    tags: ["PRODUCT DESIGN", "ENTERPRISE ERP", "CUSTOMER VALIDATION", "WORKFLOW DESIGN", "SERVICE MANAGEMENT"],
    client: "IFS Cloud — Service Management (validated with a large European facilities-services customer)",
    timeline: "2025 – 2026 · Research → Validation → Design → Release",
    overview:
      "Service organisations often get work that is too big for a single service request but too small and fast-moving for a full project. Examples include installing a new HVAC system together with its configuration changes, or a bundle of related jobs for one customer site. I was part of the experience design team that created Service Projects, a new way to group multiple service scopes into one work package with shared planning, execution, and financial tracking.",
    challenge:
      "Service teams handled every request on its own. They had no structured way to group related work, little visibility of resource capacity, and no real way to plan ahead. A heavyweight project module existed, but it was built for long-term governance and complex financial control, which was too slow to set up for everyday service work. We needed something in between that stayed lightweight and fit how service teams already think, without being confused with standard projects.",
    approach:
      "We worked in a loop of research, design, and validation with real customers. The team mapped the end-to-end flow from quotation to service project, capacity planning, and dispatch. We ran recurring customer check-ins where we walked through journeys and concepts and captured feedback, and fed every finding into the next round of design. I designed key parts of the experience, including the work package creation flow. I deliberately designed it as one reusable flow that works both from the quotation and from the project details view, so the pattern could be used elsewhere in the product.",
    results:
      "Service Projects became a defined new capability in IFS Cloud, with an agreed concept, naming, and demand model. A quotation can now flow straight into a scheduled service project, with each scope linked back to its source and resources, materials, and totals tracked in one place, ready for capacity planning. The work was later shown in product demos and guided tours of the new service management experience.",
    sections: [
      {
        heading: "UNDERSTANDING THE GAP",
        body: "We started from a clear problem: larger service packages were hard to manage because every request lived on its own. Through stakeholder sessions and reviews with product management, we defined where Service Projects should sit. They are built on top of request management for short- to medium-length work, unlike full projects, which handle long lifecycles and complex financial control. Putting this difference into words early guided every later design decision.",
        // IMAGE: A positioning diagram: Service Request ← Service Project → Full Project, with duration / complexity axes.
      },
      {
        heading: "MAPPING THE END-TO-END FLOW",
        body: "Together with product and technical leads, we mapped the high-level flow from quotation through acceptance and release, into a service project, then capacity planning, then dispatch. Reviews showed where the flow needed to be clearer, for example separating long-term planning from day-to-day dispatching and clarifying when a quotation counts as accepted and released.",
        // IMAGE: High-level flow diagram (Quotation → Service Project → Capacity Planning → Dispatch), redrawn cleanly.
      },
      {
        heading: "CUSTOMER VALIDATION SESSIONS",
        body: "Throughout the project we held structured check-ins with a customer who runs large-scale service operations. Each session walked through user journeys and design concepts, tested our assumptions about how work gets grouped and planned, and collected feedback on terminology and flow. Turning customer feedback straight into design changes kept the feature grounded in how service teams actually work rather than how we assumed they work.",
        // IMAGE: 1–2 anonymised slides from a customer check-in deck (journey slide + feedback summary). Remove customer logos/names.
      },
      {
        heading: "DESIGNING THE WORK PACKAGE FLOW",
        body: "I explored several options for how users create and build a work package. We chose one unified flow that works from both the quotation and the service project details view, rather than separate flows for each place. This kept the experience consistent and gave the product a reusable pattern. We also identified a future enhancement: suggesting similar existing work, matched by customer, location, and object, to help users avoid duplicate packages.",
        // IMAGE: Option comparison (Option 1 vs Option 2) with the chosen one highlighted, then the final hi-fi work package flow screens.
      },
      {
        heading: "NAMING & MENTAL MODELS",
        body: "Clear names mattered as much as the screens. Early reviews raised the risk of confusing the new entity with standard projects and with recurring reactive work. After discussions across product and design, the team settled on 'Service Project' for the entity and 'Tentative' and 'Confirmed' for demand states, matching the roadmap, what had been shared with customers, and the language customers already used.",
        // IMAGE: A small terminology card: Service Project · Tentative demand · Confirmed demand, with one-line definitions.
      },
      {
        heading: "PLANNING & VISIBILITY",
        body: "Once work is packaged, teams need to see it over time. The service project experience brings scopes, resources, and materials into one place, and a Gantt-style view shows the work's hierarchy and timeline. Planners can check capacity before committing to a date.",
        // IMAGE: Service Project Gantt view and the project overview with scopes, resources and totals.
      },
      {
        heading: "IMPACT & LEARNINGS",
        body: "Service Projects filled a real gap in the service management offering: service teams can now go from a quoted job to a planned, trackable work package without leaving the platform. For me, the biggest lesson was the value of regular customer validation. Each check-in either confirmed a direction or saved us from building the wrong thing.",
        // IMAGE: Simple process timeline: Problem framing → Flow mapping → Customer check-ins → Design iterations → Release & demo.
      },
    ],
  },
  {
    slug: "workforce-planning-research",
    title: "Research-Driven Redesign of Workforce Planning Experiences",
    category: "UX Research & Service Design",
    year: "2026",
    description:
      "Led research synthesis for a large energy utility's planning and scheduling operations: building proto personas, journey maps, and opportunity areas that set the direction for the next generation of planning tools.",
    role: "UX Designer — Research & Synthesis",
    tools: ["FigJam", "Figma", "Workshop Synthesis", "AI-Assisted Analysis", "Journey Mapping", "PowerPoint"],
    cover: { from: "#1e3a5f", to: "#3fa7d6", text: "Workforce Planning" },
    tags: ["UX RESEARCH", "PERSONAS", "JOURNEY MAPPING", "SERVICE DESIGN", "ENTERPRISE"],
    client: "Large North American energy utility (enterprise platform customer)",
    timeline: "2026 · Discovery phase",
    overview:
      "Utility field operations run on plans that span years, quarters, weeks, and single days, and each time horizon is owned by a different person. I was part of a UX team asked to understand how these planners actually work before any new capability was designed. My focus was turning hours of customer workshop transcripts into proto personas and journey maps the product team could build on.",
    challenge:
      "The existing product handled site-based maintenance well, but it didn't support how field-based utilities plan and schedule work. Planning knowledge was spread across workshops with domain experts, budget structures, and unwritten practices. Nobody had a shared picture of who the users were, where one role handed work to the next, or why plans kept falling apart on the way from the quarterly plan to the day of execution.",
    approach:
      "I analysed transcripts from several long-cycle and mid-cycle planning workshops and used AI-assisted analysis to find recurring roles, decisions, and pain points, then checked every insight against what was actually said in the sessions. From this I identified the key planning roles, built a proto persona for each, and created matching journey maps with goals, actions, pain points, emotions, and opportunities at every stage. We reviewed the personas with an internal domain expert, refined them after each feedback round, and used them to write the interview scripts for one-on-one customer interviews.",
    results:
      "The team now had one shared picture of how the planning process works, from long-term capacity planning down to day-of crew decisions. The personas and journeys became the foundation for the user interview programme and research findings deck. They also pointed to concrete product opportunities, such as change-impact previews, plan-vs-schedule comparison, and early overload warnings. When the customer later shared its own internal personas, our assumption-based set lined up closely with them. That confirmed the synthesis and let the team move straight to validation interviews.",
    sections: [
      {
        heading: "MAKING SENSE OF A COMPLEX DOMAIN",
        body: "Utility planning works on several time horizons at once: annual and quarterly plans are driven by budgets and investment categories, while weekly schedules have to absorb permit delays, material shortages, and storms. Before designing anything, I mapped how work moves between these horizons and where it gets reshaped along the way.",
      },
      {
        heading: "FROM TRANSCRIPTS TO PROTO PERSONAS",
        body: "Starting from long brainstormed lists of possible roles, I narrowed things down to the personas that carry real decisions: a capacity planner who sets realistic limits, a work planner who gets jobs ready, a weekly scheduler who keeps the commitment executable, a work control coordinator who owns the quarterly plan, and a field supervisor who makes trade-offs on the day. Each persona states the role's goals, frustrations, and who they hand work to.",
      },
      {
        heading: "JOURNEY MAPS AT DECISION POINTS",
        body: "Rather than mapping everything from start to finish, we focused on the moments where decisions get made: turning budgets into an executable quarterly plan, comparing the plan with the actual schedule, re-planning when something goes wrong, and forming crews when staffing changes on the day. Every journey followed the same grid of goals, actions, pain points, emotions, and ideas, so the roles could be read side by side.",
      },
      {
        heading: "SURFACING THE HANDOFF GAPS",
        body: "Lining the personas up from capacity planning to readiness, the weekly commitment, and day-of execution showed that most of the pain came from the handoffs between roles. Plans were reasonable on their own, but each change rippled downstream without anyone seeing the impact. This reframed the problem from building better individual screens to keeping the time horizons connected.",
      },
      {
        heading: "AI-ASSISTED SYNTHESIS, HUMAN-VALIDATED",
        body: "I used AI tools to speed up analysis of a large volume of transcripts. Every persona trait and journey step was traced back to source material, then checked with a domain expert before stakeholders saw it. This kept synthesis fast without losing the rigour the research needed.",
      },
      {
        heading: "IMPACT",
        body: "The work set the research agenda for a new planning and scheduling capability: interview scripts, a findings framework that mapped research to jobs-to-be-done, and a set of opportunity areas for the product team. It also set up a repeatable persona and journey template the UX team could reuse in later research.",
      },
    ],
  },
  {
    slug: "lumora-caregiver-companion",
    title: "Lumora Caregiver Companion",
    category: "AI Research & Product",
    year: "2024",
    description:
      "An NLP-powered caregiver companion that ranks and recommends the right caregiver for each family based on needs, preferences, and context.",
    role: "Research & Development — NLP & UX",
    tools: ["NLP", "Machine Learning", "Python", "UX Design", "Figma"],
    cover: { from: "#6d28d9", to: "#ec4899", text: "Lumora" },
    tags: ["AI", "NLP", "HEALTHCARE", "R&D"],
    client: "Research & development project",
    timeline: "2024",
    overview:
      "Lumora set out to make finding the right caregiver less of a guessing game. Families describe what they need in their own words, and the system reads that free text to surface the caregivers who actually fit — not just the ones who match a checkbox. I worked across the research, the NLP ranking model, and the experience that wraps around it.",
    challenge:
      "Matching caregivers to families is rarely a clean filter. The things that matter most — tone, temperament, the specific kind of care a loved one needs — live in messy, natural-language descriptions, not tidy dropdowns. A rules-based match kept returning technically-eligible but poorly-fitting caregivers, and families had no way to tell why anyone was recommended.",
    approach:
      "I built an NLP pipeline that reads both the family's description and each caregiver's profile, extracts the needs and attributes that matter, and ranks caregivers by how well they fit rather than by keyword overlap. On the experience side, I designed a flow that lets families describe their situation conversationally and shows, in plain language, why each recommended caregiver surfaced — so the ranking felt trustworthy instead of opaque.",
    results:
      "The NLP ranking produced noticeably better-fitting shortlists than the original rules-based match, and the explain-why layer gave families a reason to trust the results. The project became a working demonstration of how language models can turn soft, human requirements into a usable ranking without hiding the reasoning behind it.",
    sections: [
      {
        heading: "READING NEEDS, NOT JUST KEYWORDS",
        body: "The core of Lumora is an NLP model that interprets what families actually write — the type of care, the hours, the personality fit — and compares it against caregiver profiles. Instead of matching on shared keywords, it scores how well each caregiver meets the described need, which surfaces good fits that a keyword filter would have missed.",
      },
      {
        heading: "RANKING YOU CAN TRUST",
        body: "A recommendation nobody understands gets ignored. I designed the results so each caregiver comes with a plain-language reason for why they ranked where they did, turning a black-box score into something a family can actually weigh.",
      },
      {
        heading: "FROM RESEARCH TO EXPERIENCE",
        body: "The model only mattered if people could use it, so I designed the flow around it — a conversational intake that gathers the right signal without feeling like a form, and a results view that makes the ranking legible. Research, model, and interface were developed together rather than handed off in sequence.",
      },
    ],
  },
  {
    slug: "cse-analyzer",
    title: "CSE Analyzer",
    category: "AI Research & Fintech",
    year: "2024",
    description:
      "An AI-driven analysis tool that builds market indices and generates stock predictions for the Colombo Stock Exchange.",
    role: "Research & Development — AI / ML",
    tools: ["Machine Learning", "Python", "Data Analysis", "Predictive Modelling"],
    cover: { from: "#065f46", to: "#34d399", text: "CSE Analyzer" },
    tags: ["AI", "FINTECH", "PREDICTION", "R&D"],
    client: "Research & development project",
    timeline: "2024",
    overview:
      "CSE Analyzer applies machine learning to Colombo Stock Exchange data to compute custom market indices and forecast stock movement. The goal was to give an individual investor the kind of analytical signal that usually sits behind institutional tooling.",
    challenge:
      "Market data for the CSE is noisy, uneven, and hard to reason about by eye. Raw price history alone tells you little about momentum or relative strength, and off-the-shelf indices don't always reflect the local market's behaviour — so an investor is left making decisions on incomplete signal.",
    approach:
      "I built a pipeline that ingests historical market data, engineers features from it, and trains predictive models to forecast movement, alongside custom indices that summarise the market's state at a glance. The work covered the full research loop — cleaning and framing the data, modelling, and evaluating predictions against real outcomes to see where the models held up and where they didn't.",
    results:
      "The tool produced indices and predictions from live CSE data and became a practical study in applying ML to a thin, volatile market — surfacing both the promise and the hard limits of forecasting in that setting, and sharpening how I frame data problems before reaching for a model.",
    sections: [
      {
        heading: "TAMING NOISY MARKET DATA",
        body: "Before any prediction, the data had to be made trustworthy — cleaned, aligned, and turned into features that actually carry signal. A large share of the work lived here, because the quality of everything downstream depends on it.",
      },
      {
        heading: "INDICES & PREDICTIONS",
        body: "I built custom indices to summarise market state and trained models to forecast stock movement, then evaluated them against real outcomes rather than trusting training-set accuracy — which is where the honest limits of forecasting a thin market showed up.",
      },
      {
        heading: "WHAT IT TAUGHT",
        body: "CSE Analyzer was as much about judgement as code: knowing when a model's confidence is real and when it's an artifact of the data. That framing — interrogate the data before trusting the output — carries straight into how I approach AI product work now.",
      },
    ],
  },
  {
    slug: "vision-optical-erp",
    title: "Vision Optical — Eye Care ERP",
    category: "Enterprise / ERP",
    year: "2023",
    description:
      "A full ERP system for an eye-care institute covering appointments, patient records, inventory, and billing — my diploma final project.",
    role: "Full-Stack Developer & Designer",
    tools: ["ERP Design", "Full-Stack Development", "Database Design", "UI/UX"],
    cover: { from: "#0ea5e9", to: "#6366f1", text: "Vision Optical" },
    tags: ["ERP", "FULL-STACK", "HEALTHCARE"],
    client: "Diploma final project · eye-care institute",
    timeline: "2023 (Oct)",
    overview:
      "Vision Optical is an end-to-end ERP built for an eye-care institute, bringing appointments, patient records, optical inventory, and billing into one system. As the final project of my diploma, I owned it from data model to interface.",
    challenge:
      "The institute's operations were split across disconnected tools and paper — appointments in one place, patient history in another, stock and billing somewhere else. Nothing talked to each other, so staff re-keyed the same information repeatedly and had no single view of a patient or the business.",
    approach:
      "I designed a relational data model that tied patients, appointments, prescriptions, inventory, and invoices together, then built the application on top of it with role-appropriate screens for each part of the clinic's workflow. I paid particular attention to the flows staff use every day — booking, consultation, and checkout — so the system fit how the clinic actually runs rather than forcing a new process.",
    results:
      "The result was a single system covering the clinic's core operations, removing duplicate data entry and giving staff one place to manage patients and stock. As a final project it tied together everything from the diploma — database design, full-stack development, and UX — into one working product.",
    sections: [
      {
        heading: "ONE DATA MODEL, MANY WORKFLOWS",
        body: "The foundation was a relational schema connecting patients, appointments, prescriptions, inventory, and billing, so a single piece of information entered once flowed everywhere it was needed instead of being re-typed per module.",
      },
      {
        heading: "DESIGNED AROUND THE CLINIC DAY",
        body: "I built the screens around the clinic's real workflow — booking an appointment, running the consultation and prescription, then billing and dispensing — so each role saw exactly what it needed at each step.",
      },
      {
        heading: "FULL-STACK OWNERSHIP",
        body: "From database to interface, I built the whole system, which meant making every layer agree — data design, application logic, and UX — and seeing first-hand how decisions at the schema level shape what the experience can be.",
      },
    ],
  },
];

export const contact = {
  label: "Contact",
  heading: "Let's design something people love to use.",
  body: "Open to AI Product Design, UX Research, and Product Design roles — and always up for a conversation about human-AI interaction.",
  quote:
    "Great design turns complex technology into experiences that feel effortless.",
  socials: [
    { label: "Email", href: "mailto:balallauditha@gmail.com", handle: "balallauditha@gmail.com" }, // TODO: confirm email
    { label: "LinkedIn", href: "#", handle: "linkedin.com/in/uditha-balalla" }, // TODO: real URL
    { label: "Behance", href: "#", handle: "behance.net/udithabalalla" }, // TODO: real URL
    { label: "GitHub", href: "#", handle: "github.com/udithabalalla" }, // TODO: real URL
  ],
};
