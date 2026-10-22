export const workspace = {
  name: "Aster Works",
  type: "Demonstration brand",
  monogram: "a.",
};

export const account = {
  name: "Morgan Chen",
  role: "Brand reviewer",
  initials: "MC",
};

export const navItems = [
  { to: "/", label: "Dashboard", icon: "layout-dashboard", end: true },
  { to: "/brand-rules", label: "Brand Rules", icon: "book-open" },
  { to: "/content-review", label: "Content Review", icon: "file-pen-line" },
  { to: "/analysis-results", label: "Analysis Results", icon: "list-checks" },
];

export const metrics = [
  {
    id: "analyses",
    label: "Content analyses",
    value: "24",
    caption: "this month",
    icon: "files",
  },
  {
    id: "awaiting",
    label: "Awaiting human review",
    value: "7",
    caption: "need a decision",
    icon: "clipboard-list",
    emphasis: true,
  },
  {
    id: "reviewed",
    label: "Reviewed by your team",
    value: "17",
    caption: "this month",
    icon: "user-check",
  },
  {
    id: "rules",
    label: "Active brand rules",
    value: "5",
    caption: "of 6 total rules",
    icon: "book-open",
  },
];

export const analyses = [
  {
    id: "DR-024",
    title: "Autumn launch email",
    owner: "Morgan Chen",
    channel: "Email campaign",
    findings: 3,
    status: "Needs review",
    created: "Oct 22, 2026",
    highlighted: true,
  },
  {
    id: "DR-023",
    title: "Homepage introduction",
    owner: "Jamie Patel",
    channel: "Website",
    findings: 1,
    status: "Reviewed",
    created: "Oct 21, 2026",
  },
  {
    id: "DR-022",
    title: "Getting started guide",
    owner: "Morgan Chen",
    channel: "Help center",
    findings: 0,
    status: "Reviewed",
    created: "Oct 21, 2026",
  },
  {
    id: "DR-021",
    title: "Team planning announcement",
    owner: "Alex Rivera",
    channel: "Social post",
    findings: 2,
    status: "Needs review",
    created: "Oct 20, 2026",
  },
  {
    id: "DR-020",
    title: "Product update newsletter",
    owner: "Jamie Patel",
    channel: "Email campaign",
    findings: 0,
    status: "Reviewed",
    created: "Oct 19, 2026",
  },
];

export const categories = [
  { name: "Brand facts", active: 2, total: 2 },
  { name: "Terminology", active: 1, total: 2 },
  { name: "Writing style", active: 2, total: 2 },
];

export const nextReview = {
  eyebrow: "Pick up the sample review",
  title: "Autumn launch email",
  body: "3 example findings are ready for your judgment. Check the facts, then decide what to change.",
  action: "Open demonstration findings →",
};
