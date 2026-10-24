import {
  ArrowUpRight,
  Bell,
  Bold,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleCheck,
  CircleHelp,
  ClipboardList,
  Ellipsis,
  FilePenLine,
  FileText,
  Files,
  Info,
  Italic,
  LayoutDashboard,
  Link,
  List,
  ListChecks,
  Menu,
  Plus,
  ScanText,
  Search,
  Settings2,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

const icons = {
  "arrow-up-right": ArrowUpRight,
  bell: Bell,
  bold: Bold,
  "book-open": BookOpen,
  check: Check,
  "circle-check": CircleCheck,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevrons-up-down": ChevronsUpDown,
  ellipsis: Ellipsis,
  "circle-help": CircleHelp,
  "clipboard-list": ClipboardList,
  "file-pen-line": FilePenLine,
  "file-text": FileText,
  files: Files,
  info: Info,
  italic: Italic,
  "layout-dashboard": LayoutDashboard,
  link: Link,
  list: List,
  "list-checks": ListChecks,
  menu: Menu,
  plus: Plus,
  "scan-text": ScanText,
  search: Search,
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
