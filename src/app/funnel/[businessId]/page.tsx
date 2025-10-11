"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./star-rating";
import { CheckCircle, MessageSquare, Star } from "lucide-react";

export default function ReviewFunnelPage({ params }: { params: { businessId: string } }) {
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState(1); // 1: rating, 2: form/redirect, 3: thank you
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleRating = (rate: number) => {
    setRating(rate);
    setStep(2);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, email, message, rating });
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        {step === 1 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">¿Cómo fue tu experiencia?</CardTitle>
              <CardDescription>Tus comentarios nos ayudan a mejorar.</CardDescription>
            </CardHeader>
            <CardContent>
              <StarRating onRating={handleRating} />
            </CardContent>
          </>
        )}

        {step === 2 && rating > 0 && rating < 5 && (
          <form onSubmit={handleSubmitFeedback}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="text-primary"/> Déjanos tus comentarios</CardTitle>
              <CardDescription>Lamentamos que tu experiencia no haya sido perfecta. Por favor, dinos cómo podemos mejorar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@ejemplo.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tus comentarios..." required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Enviar Comentarios</Button>
            </CardFooter>
          </form>
        )}
        
        {step === 2 && rating === 5 && (
            <>
                <CardHeader className="text-center">
                    <Star className="w-16 h-16 text-yellow-400 mx-auto" fill="currentColor" />
                    <CardTitle className="text-2xl font-bold">¡Gracias!</CardTitle>
                    <CardDescription>Nos alegra que hayas tenido una gran experiencia. Por favor, comparte tu reseña en Google para ayudar a otros.</CardDescription>
                </CardHeader>
                <CardContent>
                    <a href="#" onClick={(e) => { e.preventDefault(); setStep(3); }} className="w-full">
                        <Button className="w-full">
                            Continuar a Google
                        </Button>
                    </a>
                </CardContent>
                 <CardFooter>
                    <Button variant="link" className="w-full text-muted-foreground" onClick={() => setStep(3)}>Quizás más tarde</Button>
                </CardFooter>
            </>
        )}

        {step === 3 && (
            <CardHeader className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <CardTitle className="text-2xl font-bold">¡Gracias!</CardTitle>
                <CardDescription>Tus comentarios son muy valiosos para nosotros.</CardDescription>
            </CardHeader>
        )}
      </Card>
    </div>
  );
}
