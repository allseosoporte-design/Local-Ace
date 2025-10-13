
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";
import { Users, CreditCard, User, Settings, Wallet, BellRing, MessageSquare } from "lucide-react";
import { EditorLandingIcon } from "./icons/editor-landing";
import { PaymentIcon } from "./icons/payment";


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
    href: "/dashboard/admin/editor-landing",
    label: "Editor de Landing",
    icon: <EditorLandingIcon />,
  },
  {
    href: "/dashboard/admin/payment-settings",
    label: "Configuración de Pagos",
    icon: <PaymentIcon />,
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

    