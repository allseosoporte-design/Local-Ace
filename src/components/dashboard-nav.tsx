"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";
import { Home, Star, User, Settings, FileText, Image as ImageIcon, ShoppingCart } from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "Panel",
    icon: <Home />,
  },
  {
    href: "/dashboard/reviews",
    label: "Reseñas",
    icon: <Star />,
  },
  {
    href: "/dashboard/profile",
    label: "Perfil",
    icon: <User />,
  },
  {
    href: "/dashboard/posts",
    label: "Publicaciones",
    icon: <FileText />,
  },
  {
    href: "/dashboard/landing-page",
    label: "Landing Page",
    icon: <ImageIcon />,
  },
  {
    href: "/dashboard/catalog",
    label: "Catalogo",
    icon: <ShoppingCart />,
  },
  {
    href: "/dashboard/settings",
    label: "Configuración",
    icon: <Settings />,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            tooltip={link.label}
          >
            <Link href={link.href}>
              {link.icon}
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
