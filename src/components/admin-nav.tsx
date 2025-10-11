"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Users } from "lucide-react";
import { LocalLeap } from "./icons";

const links = [
  {
    href: "/dashboard/admin",
    label: "Gestión de Clientes",
    icon: Users,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Link href="/dashboard/admin" className="flex items-center gap-2">
          <LocalLeap className="w-8 h-8 text-primary" />
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
            Local Leap
          </span>
        </Link>
        <div className="mt-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            Panel de Super Admin
        </div>
      </div>

      <SidebarMenu className="flex-1 p-2">
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <Link href={link.href} className="w-full">
              <SidebarMenuButton
                isActive={pathname.startsWith(link.href)}
                tooltip={{ children: link.label }}
              >
                <link.icon />
                <span>{link.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}