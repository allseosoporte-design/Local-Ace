"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Upload,
} from "lucide-react";
import { LocalLeap } from "@/components/icons";
import { cn } from "@/lib/utils";
import { generateLandingPageHeadline } from "@/ai/flows/generate-landing-page-headline";

const colorOptions = [
  { name: "Blue", value: "hsl(221, 89%, 60%)" },
  { name: "Green", value: "hsl(142, 71%, 45%)" },
  { name: "Red", value: "hsl(0, 84%, 60%)" },
  { name: "Orange", value: "hsl(35, 100%, 57%)" },
  { name: "Purple", value: "hsl(262, 83%, 60%)" },
];

export default function LandingPageBuilder() {
  const [headline, setHeadline] = useState("Your Catchy Headline Here");
  const [description, setDescription] = useState(
    "Describe your business in a way that excites your customers and makes them want to learn more. This is your chance to shine!"
  );
  const [primaryColor, setPrimaryColor] = useState(colorOptions[0].value);
  const [logo, setLogo] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string>(
    "https://picsum.photos/seed/15/1200/600"
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateHeadline = async () => {
    setIsGenerating(true);
    try {
      const result = await generateLandingPageHeadline({
        businessDescription: description,
        targetAudience: "local customers",
        keywords: "cafe, coffee, pastries"
      });
      if(result.headline) {
        setHeadline(result.headline);
      }
    } catch (error) {
      console.error("Failed to generate headline:", error);
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <Card className="lg:col-span-1 h-full overflow-y-auto">
        <CardHeader>
          <CardTitle>Landing Page Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Textarea
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={handleGenerateHeadline} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate with AI
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <Select
              onValueChange={setPrimaryColor}
              defaultValue={primaryColor}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((color) => (
                  <SelectItem key={color.name} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <Input id="logo" type="file" accept="image/*" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero">Hero Image</Label>
            <Input id="hero" type="file" accept="image/*" />
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-y-auto">
        <div className="w-full h-full scale-[0.9] origin-top transform transition-transform">
          {/* Preview */}
          <header className="flex justify-between items-center p-6 border-b">
            <LocalLeap style={{ color: primaryColor }} className="w-8 h-8" />
            <div className="flex items-center gap-2">
              <Button style={{ backgroundColor: primaryColor, color: 'white' }}>Contact Us</Button>
            </div>
          </header>

          <section
            className="relative h-96 flex items-center justify-center text-white text-center p-6 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{headline}</h1>
              <p className="text-lg opacity-90">{description}</p>
            </div>
          </section>

          <section className="p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <Phone className="w-10 h-10 mx-auto" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold">Call Us</h3>
                <p className="text-muted-foreground">(123) 456-7890</p>
              </div>
              <div className="space-y-2">
                <Mail className="w-10 h-10 mx-auto" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold">Email Us</h3>
                <p className="text-muted-foreground">hello@yourbusiness.com</p>
              </div>
              <div className="space-y-2">
                <MapPin className="w-10 h-10 mx-auto" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold">Visit Us</h3>
                <p className="text-muted-foreground">123 Main St, Anytown, USA</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
