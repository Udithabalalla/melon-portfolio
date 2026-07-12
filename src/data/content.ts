// ─────────────────────────────────────────────────────────────
//  Single source of truth for all site content.
//  Update copy, links, and images here — no component edits needed.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Portfolio",
  owner: "Romaine H",
  role: "Project Manager · Business Analyst",
  email: "hello@example.com", // TODO: replace with real email
  location: "Available worldwide",
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
  headline: ["Turning", "ideas", "into", "digital", "products", "that", "work."],
  intro:
    "I bridge technology and business — project coordination, QA, WordPress development, Agile delivery, and UI/UX design, all in service of well-planned digital products.",
};

export const about = {
  label: "About",
  body: "I'm a software engineering graduate with hands-on experience in website development, project coordination, and quality assurance. My goal is to grow into a Project Manager or Business Analyst role where I can combine technical knowledge with strategic thinking to deliver impactful digital solutions.",
  capabilities: [
    "Project Management",
    "Business Analysis",
    "Agile & Scrum",
    "UI/UX Design",
    "Stakeholder Management",
    "Website QA",
  ],
  stats: [
    { value: "1", label: "PM internship" },
    { value: "4+", label: "Delivered projects" },
    { value: "6", label: "Skill domains" },
  ],
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    category: "Project Management",
    items: [
      "Agile & Scrum",
      "Sprint Planning",
      "Product Roadmaps",
      "Stakeholder Management",
      "Requirement Gathering",
      "Risk Management",
    ],
  },
  {
    category: "Business Analysis",
    items: [
      "User Stories",
      "Business Requirements",
      "Process Mapping",
      "Functional Documentation",
      "Wireframing",
    ],
  },
  {
    category: "Design",
    items: ["Figma", "FigJam", "Canva", "UI/UX Design", "Prototyping"],
  },
  {
    category: "Development",
    items: [
      "Java",
      "Python",
      "HTML",
      "CSS",
      "JavaScript",
      "React (Learning)",
      "REST APIs",
      "Spring Boot",
    ],
  },
  {
    category: "CMS & Web",
    items: [
      "WordPress",
      "Elementor Pro",
      "Responsive Design",
      "SEO Basics",
      "Website QA",
    ],
  },
  {
    category: "Productivity",
    items: ["Jira", "ClickUp", "Trello", "Notion", "GitHub", "Google Workspace"],
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
    role: "Project Manager Intern",
    org: "Weblook International",
    bullets: [
      "Assisted in project planning and coordination",
      "Conducted website quality assurance",
      "Managed website content updates",
      "Worked closely with developers and designers",
      "Tracked project progress",
      "Supported website launches",
    ],
  },
];

export type EducationEntry = {
  title: string;
  subtitle?: string;
};

export const education: EducationEntry[] = [
  { title: "Higher National Diploma in Software Engineering" },
  { title: "Diploma in Software Engineering" },
];

export const careerInterests = [
  "Project Management",
  "Business Analysis",
  "Product Management",
  "UI/UX Design",
  "Digital Transformation",
];

export type ProjectSection = {
  heading: string;
  body: string;
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
    slug: "website-qa",
    title: "Website QA",
    category: "Quality Assurance",
    year: "2024",
    description:
      "Performed end-to-end testing for business websites, identifying UI, responsiveness, and functionality issues before deployment.",
    role: "QA Lead",
    tools: ["Manual Testing", "Responsive QA", "Bug Tracking", "Cross-browser"],
    cover: { from: "#4f8ef7", to: "#28c2a8", text: "Website QA" },
    tags: ["QUALITY ASSURANCE", "TESTING", "WEB"],
    client: "Weblook International (agency client sites)",
    timeline: "2024",
    overview:
      "Before any client site went live, it passed through my desk. I owned the QA pass across a portfolio of business websites — checking layout, responsiveness, and functionality against the original brief before sign-off.",
    challenge:
      "Sites were being handed off to clients with visual and functional bugs that only surfaced after launch — broken breakpoints, dead links, inconsistent spacing — because there was no structured testing step between development and delivery.",
    approach:
      "I built a repeatable QA checklist covering cross-browser rendering, responsive breakpoints, form validation, and link integrity, then ran it against every site before handoff — logging issues with screenshots and reproduction steps so developers could fix them without back-and-forth.",
    results:
      "Pre-launch bug counts dropped noticeably and client-reported issues after launch became rare. The checklist became a standard step in the team's delivery process.",
    sections: [
      {
        heading: "BUILDING THE CHECKLIST",
        body: "I started by cataloguing the recurring issues from past launches — broken mobile menus, overflowing text, unstyled form states — and turned them into a structured pass covering layout, content, interaction, and performance. Every site got the same rigor, regardless of how small the build.",
      },
      {
        heading: "CROSS-BROWSER & RESPONSIVE TESTING",
        body: "Each site was tested across major breakpoints and browsers, with particular attention to the handoff points designers rarely check by default: tablet portrait, long-form content overflow, and touch-target sizing on mobile navigation.",
      },
      {
        heading: "WORKING WITH DEVELOPERS",
        body: "Bugs were logged with annotated screenshots, exact reproduction steps, and expected vs. actual behaviour — written so a developer could action them without needing a follow-up conversation. This turned QA from a bottleneck into a fast, predictable step in the pipeline.",
      },
      {
        heading: "IMPACT",
        body: "The checklist became the team's default pre-launch gate. Client-reported post-launch issues dropped sharply, and the structured log gave the team a track record they could point to when scoping future QA effort.",
      },
    ],
  },
  {
    slug: "wordpress-development",
    title: "WordPress Development",
    category: "CMS & Web",
    year: "2024",
    description:
      "Developed and customized responsive websites using Elementor Pro and custom CSS, tailored to client requirements.",
    role: "WordPress Developer",
    tools: ["WordPress", "Elementor Pro", "CSS", "Responsive Design"],
    cover: { from: "#f6c445", to: "#f08a3c", text: "WordPress" },
    tags: ["WORDPRESS", "ELEMENTOR", "CSS"],
    client: "Small business & agency clients",
    timeline: "2024",
    overview:
      "I built and customized WordPress sites end-to-end — translating client briefs and brand guidelines into responsive, editable pages using Elementor Pro, with custom CSS wherever the page builder hit its limits.",
    challenge:
      "Clients needed sites that looked custom-built but that their own non-technical staff could still update afterwards — a tension between design flexibility and long-term maintainability.",
    approach:
      "I structured every build around reusable Elementor templates and global styles, so brand colours, typography, and spacing stayed consistent site-wide. Custom CSS filled the gaps — off-canvas menus, hover states, section transitions — without breaking the editability of the underlying page builder.",
    results:
      "Clients received sites that matched their brief pixel-for-pixel while remaining fully editable in-house, cutting down on ongoing support requests for minor content changes.",
    sections: [
      {
        heading: "TEMPLATE SYSTEM",
        body: "Rather than building each page from scratch, I set up global templates and a shared style kit in Elementor — headers, footers, CTA blocks, and section layouts that stayed consistent across the site and could be reused on future pages.",
      },
      {
        heading: "RESPONSIVE POLISH",
        body: "Elementor's default responsive behaviour rarely holds up on real content. I went breakpoint-by-breakpoint tightening spacing, typography scale, and image cropping so the site felt intentionally designed at every screen size, not just resized.",
      },
      {
        heading: "CUSTOM CSS WHERE IT MATTERED",
        body: "For details Elementor couldn't express natively — subtle hover animations, sticky navigation behaviour, custom form styling — I wrote targeted CSS that layered cleanly on top of the page builder without locking the client out of future edits.",
      },
    ],
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    category: "Design",
    year: "2024",
    description:
      "Created wireframes, prototypes, and user flows using Figma — translating requirements into clear, testable interfaces.",
    role: "UI/UX Designer",
    tools: ["Figma", "Wireframing", "Prototyping", "User Flows"],
    cover: { from: "#b98cf0", to: "#e05a9c", text: "UI / UX" },
    tags: ["UI/UX", "FIGMA", "PROTOTYPING"],
    client: "Internal & coursework projects",
    timeline: "2024",
    overview:
      "Working from written requirements and stakeholder conversations, I designed wireframes, interactive prototypes, and end-to-end user flows in Figma — turning ambiguous asks into interfaces that could actually be tested and built.",
    challenge:
      "Requirements often arrived as a list of features rather than a coherent flow, leaving gaps around edge cases, error states, and how screens connected to one another.",
    approach:
      "I mapped each feature back to a full user flow before touching visuals — identifying entry points, decision branches, and failure states — then moved into low-fidelity wireframes for structure, and high-fidelity Figma prototypes for stakeholder review and usability walkthroughs.",
    results:
      "Prototypes surfaced flow gaps and edge cases before a single line of code was written, saving rework and giving developers a clickable reference instead of a static spec.",
    sections: [
      {
        heading: "FROM REQUIREMENTS TO FLOWS",
        body: "Every feature request was mapped as a flow diagram first — happy path, edge cases, and error states — before any screen was drawn. This caught gaps early: missing empty states, unclear permission logic, flows that dead-ended.",
      },
      {
        heading: "WIREFRAMES → PROTOTYPES",
        body: "Low-fidelity wireframes let stakeholders react to structure and hierarchy without getting distracted by colour. Once the layout held up, I moved into interactive Figma prototypes with real copy and states, ready for usability walkthroughs.",
      },
      {
        heading: "TESTING THE FLOW, NOT JUST THE SCREEN",
        body: "Prototypes were walked through end-to-end with stakeholders rather than reviewed screen-by-screen, which repeatedly surfaced friction points a static mockup would have hidden — confusing labels, missing confirmation steps, unclear next actions.",
      },
    ],
  },
  {
    slug: "agile-project-planning",
    title: "Agile Project Planning",
    category: "Project Management",
    year: "2024",
    description:
      "Designed Agile workflows, backlogs, sprint plans, and project boards using Jira and ClickUp to keep delivery predictable.",
    role: "Project Coordinator",
    tools: ["Jira", "ClickUp", "Sprint Planning", "Backlog Grooming"],
    cover: { from: "#6366f1", to: "#22d3ee", text: "Agile" },
    tags: ["AGILE", "SCRUM", "DELIVERY"],
    client: "Weblook International (internal delivery)",
    timeline: "2024",
    overview:
      "I set up and ran the Agile scaffolding behind the team's delivery work — backlogs, sprint plans, and boards in Jira and ClickUp — so that project status was always visible and priorities were never a guessing game.",
    challenge:
      "Work was being tracked informally across chats and documents, which made it hard to see what was in progress, what was blocked, and what was actually next — especially once more than one project was running at once.",
    approach:
      "I restructured the backlog around clearly scoped user stories with acceptance criteria, set up a consistent sprint cadence with planning and review sessions, and built boards that gave stakeholders a single place to check status without asking for an update.",
    results:
      "The team moved from ad-hoc tracking to a predictable sprint rhythm, with clearer ownership per task and far fewer status-check interruptions during the week.",
    sections: [
      {
        heading: "BACKLOG STRUCTURE",
        body: "I rewrote the backlog as properly scoped user stories with acceptance criteria instead of vague task titles, and grouped them by epic so priority conversations happened at the right altitude instead of item-by-item.",
      },
      {
        heading: "SPRINT CADENCE",
        body: "I introduced a consistent two-week sprint cycle — planning, a mid-sprint check-in, and a review — giving the team a predictable rhythm and a natural point to re-prioritise as new requests came in.",
      },
      {
        heading: "VISIBILITY WITHOUT MEETINGS",
        body: "Boards in Jira and ClickUp were set up so any stakeholder could see current status, blockers, and what was next without pinging the team — cutting down on ad-hoc status-check interruptions during the sprint.",
      },
    ],
  },
];

export const contact = {
  label: "Contact",
  heading: "Let's build something worth using.",
  body: "Open to Project Management, Business Analysis, and Product roles — and always glad to talk digital transformation.",
  quote:
    "Turning ideas into successful digital products through technology, collaboration, and strategic planning.",
  socials: [
    { label: "Email", href: "mailto:hello@example.com", handle: "hello@example.com" }, // TODO: real email
    { label: "LinkedIn", href: "#", handle: "linkedin.com/in/romaine-h" }, // TODO: real URL
    { label: "GitHub", href: "#", handle: "github.com/romaine-h" }, // TODO: real URL
    { label: "Portfolio", href: "#", handle: "romaineh.dev" }, // TODO: real URL
  ],
};
