"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/dashboard/admin",
    label: "Gestión de Clientes",
  },
  // Add other admin links here
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-muted-foreground transition-colors hover:text-foreground",
            pathname.startsWith(link.href) && "text-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}
