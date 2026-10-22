import {
  ArrowUpRight,
  Bell,
  BookOpen,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  FilePenLine,
  FileText,
  Files,
  Info,
  LayoutDashboard,
  ListChecks,
  Menu,
  Plus,
  Settings2,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

const icons = {
  "arrow-up-right": ArrowUpRight,
  bell: Bell,
  "book-open": BookOpen,
  "chevron-right": ChevronRight,
  "chevrons-up-down": ChevronsUpDown,
  "circle-help": CircleHelp,
  "clipboard-list": ClipboardList,
  "file-pen-line": FilePenLine,
  "file-text": FileText,
  files: Files,
  info: Info,
  "layout-dashboard": LayoutDashboard,
  "list-checks": ListChecks,
  menu: Menu,
  plus: Plus,
  "settings-2": Settings2,
  "shield-check": ShieldCheck,
  "user-check": UserCheck,
  x: X,
};

export default function Icon({ name, size = 18 }) {
  const Glyph = icons[name];

  if (!Glyph) {
    return null;
  }

  return <Glyph size={size} strokeWidth={1.75} aria-hidden="true" />;
}
