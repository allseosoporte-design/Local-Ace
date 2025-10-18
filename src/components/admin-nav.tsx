
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";
import { Users, CreditCard, User, Settings, Wallet, BellRing, MessageSquare, ShieldCheck, Wrench, Database, Archive } from "lucide-react";
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
    href: "/dashboard/admin/pending-payments",
    label: "Pagos Pendientes",
    icon: <Wallet />,
  },
  {
    href: "/dashboard/admin/reminders",
    label: "Recordatorios",
    icon: <BellRing />,
  },
  {
    href: "/dashboard/admin/support",
    label: "Soporte",
    icon: <MessageSquare />,
  },
  {
    href: "/dashboard/admin/audit",
    label: "Auditoría",
    icon: <ShieldCheck />,
  },
  {
    href: "/dashboard/admin/maintenance",
    label: "Mantenimiento",
    icon: <Wrench />,
  },
  {
    href: "/dashboard/admin/database",
    label: "Base de datos",
    icon: <Database />,
  },
  {
    href: "/dashboard/admin/backup",
    label: "Respaldo",
    icon: <Archive />,
  },
  {
    href: "/dashboard/admin/editor-landing",
    label: "Editor de Landing",
    icon: <EditorLandingIcon />,
  },
  {
    href: "/dashboard/admin/profile",
    label: "Perfil",
    icon: <User />,
  },
  {
    href: "/dashboard/admin/settings",
    label: "Configuración",
    icon: <Settings />,
  }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(link.href) && (link.href !== '/dashboard/admin' || pathname === '/dashboard/admin')}
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

    