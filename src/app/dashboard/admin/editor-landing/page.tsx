
import { EditorLandingForm } from "@/components/editor-landing-form";
import { EditorLandingPreview } from "@/components/editor-landing-preview";

export default function EditorLandingPage() {
  return (
    <div className="container mx-auto p-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Editor de Landing Page</h1>
        <p className="text-muted-foreground">
          Edita el contenido de la página principal de tu aplicación y visualiza los cambios en tiempo real.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-1 h-full">
          <EditorLandingForm />
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-y-auto">
          <EditorLandingPreview />
        </div>
      </div>
    </div>
  );
}
