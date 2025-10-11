"use client";

import Link from "next/link";
import { LocalLeap } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function HomeNav() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link href="/" className="flex items-center justify-center">
        <LocalLeap className="h-6 w-6" />
        <span className="sr-only">Local Leap</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          href="/login"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Iniciar Sesión
        </Link>
        <Link href="/register">
          <Button>Registrarse</Button>
        </Link>
      </nav>
    </header>
  );
}
