"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Star,
  User,
  FileText,
  Palette,
  Settings,
} from "lucide-react";
import { LocalLeap } from "./icons";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/reviews",
    label: "Reviews",
    icon: Star,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/dashboard/posts",
    label: "Posts",
    icon: FileText,
  },
  {
    href: "/dashboard/landing-page",
    label: "Landing Page",
    icon: Palette,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <LocalLeap className="w-8 h-8 text-primary" />
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
            Local Leap
          </span>
        </Link>
      </div>

      <SidebarMenu className="flex-1 p-2">
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <Link href={link.href} className="w-full">
              <SidebarMenuButton
                isActive={pathname === link.href}
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
