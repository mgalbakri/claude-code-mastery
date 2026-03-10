const BASE_URL = "https://agentcodeacademy.com";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * Outputs a <script type="application/ld+json"> tag with
 * schema.org/BreadcrumbList markup. This enables the clickable
 * breadcrumb trail in Google search results.
 *
 * Note: dangerouslySetInnerHTML is safe here — the JSON is generated
 * entirely from server-side static data (breadcrumb item names/paths),
 * not from user input.
 *
 * Usage:
 *   <BreadcrumbJsonLd items={[
 *     { name: "Home", href: "/" },
 *     { name: "Week 1", href: "/week/1" },
 *   ]} />
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
