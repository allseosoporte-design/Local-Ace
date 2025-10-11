"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/dashboard",
    label: "Panel",
  },
  {
    href: "/dashboard/reviews",
    label: "Reseñas",
  },
  {
    href: "/dashboard/profile",
    label: "Perfil",
  },
  {
    href: "/dashboard/posts",
    label: "Publicaciones",
  },
  {
    href: "/dashboard/landing-page",
    label: "Landing Page",
  },
  {
    href: "/dashboard/settings",
    label: "Configuración",
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-muted-foreground transition-colors hover:text-foreground",
            pathname === link.href && "text-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}
