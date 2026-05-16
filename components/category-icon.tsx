import {
  Apple,
  Milk,
  Croissant,
  ShoppingBasket,
  Fish,
  Flower2,
  Cookie,
  Pill,
  SprayCan,
  Sparkles,
  UtensilsCrossed,
  Wrench,
  PlugZap,
  Hammer,
  Refrigerator,
  Scissors,
  GraduationCap,
  PawPrint,
  ShieldCheck,
  Package,
  type LucideProps,
} from "lucide-react";

const MAP: Record<string, React.ComponentType<LucideProps>> = {
  apple: Apple,
  milk: Milk,
  croissant: Croissant,
  "shopping-basket": ShoppingBasket,
  fish: Fish,
  flower: Flower2,
  cookie: Cookie,
  pill: Pill,
  "spray-can": SprayCan,
  sparkles: Sparkles,
  "utensils-crossed": UtensilsCrossed,
  wrench: Wrench,
  "plug-zap": PlugZap,
  hammer: Hammer,
  refrigerator: Refrigerator,
  scissors: Scissors,
  "graduation-cap": GraduationCap,
  "paw-print": PawPrint,
  "shield-check": ShieldCheck,
};

export function CategoryIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && MAP[name]) || Package;
  return <Icon className={className} strokeWidth={1.5} />;
}
