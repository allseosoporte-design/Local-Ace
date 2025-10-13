
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";
import { Users, CreditCard } from "lucide-react";
import { EditorLandingIcon } from "./icons/editor-landing";


const links = [
  {
    href: "/dashboard/admin",
    label: "Gestión de Clientes",
    icon: <Users />,
  },
  {
    href: "/dashboard/admin/subscription-plans",
    label: "Gestión de Planes",
    icon: <CreditCard />,
  },
  {
    href: "/dashboard/admin/editor-landing",
    label: "Editor de Landing",
    icon: <EditorLandingIcon />,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(link.href)}
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
