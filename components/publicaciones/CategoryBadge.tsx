import Link from "next/link";
import { getCategoryBySlug } from "@/lib/publicaciones/categories";
import { Badge } from "@/components/ui/Badge";
import type { CategorySlug } from "@/lib/publicaciones/types";

type Props = {
  category: CategorySlug;
  asLink?: boolean;
  className?: string;
};

export function CategoryBadge({ category, asLink = true, className }: Props) {
  const cat = getCategoryBySlug(category);
  if (!cat) return null;

  if (!asLink) {
    return (
      <Badge variant="primary" className={className}>
        {cat.label}
      </Badge>
    );
  }

  return (
    <Link
      href={`/publicaciones/categoria/${cat.slug}`}
      className="inline-flex transition-opacity hover:opacity-80"
    >
      <Badge variant="primary" className={className}>
        {cat.label}
      </Badge>
    </Link>
  );
}
