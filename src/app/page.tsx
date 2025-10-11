import { Button } from "@/components/ui/button";
import { HomeNav } from "@/components/home-nav";
import Link from "next/link";
import { LocalLeap } from "@/components/icons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HomeNav />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Optimiza tu Presencia en Google My Business
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Local Leap te ayuda a gestionar tu reputación online, interactuar con clientes y mejorar tu ranking local.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button>Comienza Ahora</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Iniciar Sesión</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center py-6 border-t">
          <p className="text-xs text-muted-foreground">&copy; 2024 Local Leap. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
