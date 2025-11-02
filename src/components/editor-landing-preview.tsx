
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Star, Facebook, Twitter, Instagram, Linkedin, Youtube, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';
import { InteractiveReviewForm } from './interactive-review-form';
import type { SubscriptionPlan } from '@/types/subscription-plan';
import { PublicPlanCard } from './public-plan-card';


export interface NavLink {
  id: string;
  text: string;
  url: string;
  order: number;
  newTab: boolean;
}

export interface HeaderConfig {
  enabled: boolean;
  links: NavLink[];
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  fontSize: string;
  spacing: string;
  shadow: boolean;
  logoUrl: string | null;
  logoText: string;
  logoWidth: number;
  logoAlignment: 'left' | 'center' | 'right';
}

export interface FooterLink {
    id: string;
    text: string;
    url: string;
}

export interface FooterColumn {
    id: string;
    title: string;
    links: FooterLink[];
}

export interface SocialLink {
    id: string;
    network: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
    url: string;
}

export interface FooterConfig {
    enabled: boolean;
    copyrightText: string;
    columns: FooterColumn[];
    socialLinks: SocialLink[];
    address: string;
    phone: string;
    email: string;
    backgroundColor: string;
    textColor: string;
    iconColor: string;
}


export interface Subsection {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  sectionColor: string;
  subsections: Subsection[];
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  avatarUrl: string;
  rating: number;
}

export interface SeoData {
  title: string;
  description: string;
  keywords: string[];
}

export interface LandingPageData {
  title: string;
  subtitle: string;
  content: string;
  heroImageUrl: string;
  ctaText: string;
  ctaUrl: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  sections: Section[];
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  testimonials: Testimonial[];
  seo: SeoData;
  navigation: HeaderConfig;
  footer: FooterConfig;
}

interface EditorLandingPreviewProps {
  data: LandingPageData;
  formConfig?: FormConfigData;
  businessId?: string;
  isPreview?: boolean;
  plans?: SubscriptionPlan[];
}

const SocialIcon = ({ network, color }: { network: string; color: string }) => {
    const iconProps = { style: { color }, className: "h-6 w-6 transition-colors hover:opacity-75" };
    switch (network) {
        case 'facebook': return <Facebook {...iconProps} />;
        case 'twitter': return <Twitter {...iconProps} />;
        case 'instagram': return <Instagram {...iconProps} />;
        case 'linkedin': return <Linkedin {...iconProps} />;
        case 'youtube': return <Youtube {...iconProps} />;
        default: return null;
    }
}


export function EditorLandingPreview({ data, formConfig, businessId, isPreview, plans }: EditorLandingPreviewProps) {
  
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };
  
  return (
    <div
      className={cn("w-full h-full p-2", isPreview && "scale-[0.95] origin-top transform transition-transform")}
    >
      {isPreview && (
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 text-center">
          Vista Previa en Tiempo Real
        </h3>
      )}
      <div
        className={cn("overflow-hidden flex flex-col min-h-full", isPreview && "rounded-lg border bg-background shadow-md")}
        style={{ backgroundColor: data.backgroundColor, color: data.textColor }}
      >
        {/* Header */}
        {data.navigation?.enabled && (
             <header 
                className={cn("w-full sticky top-0 z-40 transition-shadow", { 'shadow-md': data.navigation.shadow })}
                style={{ backgroundColor: data.navigation.backgroundColor, fontSize: `${data.navigation.fontSize}px` }}
             >
                <nav className={cn("container mx-auto px-6 py-3 flex items-center", alignmentClasses[data.navigation.logoAlignment])}>
                   <div style={{width: `${data.navigation.logoWidth}px`}}>
                    {data.navigation.logoUrl ? (
                      <Image src={data.navigation.logoUrl} alt={data.navigation.logoText} width={data.navigation.logoWidth} height={50} style={{objectFit: 'contain', height: 'auto'}}/>
                    ) : (
                      <div className="text-lg font-bold" style={{ color: data.navigation.textColor }}>{data.navigation.logoText}</div>
                    )}
                   </div>
                    <div className="flex-grow flex items-center" style={{ gap: `${data.navigation.spacing}px`, justifyContent: alignmentClasses[data.navigation.logoAlignment] === 'justify-center' ? 'center' : 'flex-end' }}>
                        {[...(data.navigation.links || [])].sort((a, b) => a.order - b.order).map(link => (
                            <Link key={link.id} href={link.url} target={link.newTab ? '_blank' : '_self'} rel={link.newTab ? 'noopener noreferrer' : ''}>
                                <span 
                                  className="hover:opacity-75 transition-opacity"
                                  style={{ color: data.navigation.textColor, '--hover-color': data.navigation.hoverColor } as React.CSSProperties}
                                  onMouseOver={(e) => e.currentTarget.style.color = data.navigation.hoverColor}
                                  onMouseOut={(e) => e.currentTarget.style.color = data.navigation.textColor}
                                >
                                    {link.text}
                                </span>
                            </Link>
                        ))}
                    </div>
                </nav>
            </header>
        )}

        <main className="flex-grow">
            {/* Hero Section */}
            <section className="text-center p-8 md:p-12 space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl" style={{ color: data.textColor }}>
                {data.title}
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl" style={{ color: data.textColor, opacity: 0.8 }}>
                {data.subtitle}
            </p>
            </section>

            {/* Content Section */}
            <section className="px-8 md:px-12 pb-8">
                <div 
                className="prose prose-sm lg:prose-base max-w-4xl mx-auto ql-editor"
                style={{ color: data.textColor, opacity: 0.9 }}
                dangerouslySetInnerHTML={{ __html: data.content }}
                />
                {data.heroImageUrl && (
                    <div className="relative aspect-video max-w-4xl mx-auto mt-8 rounded-lg overflow-hidden shadow-lg">
                    <Image
                        src={data.heroImageUrl}
                        alt="Hero Image"
                        fill
                        className="object-cover"
                    />
                    </div>
                )}
            </section>

            {/* Subscription Plans Section */}
            {plans && plans.length > 0 && (
                <section id="plans" className="py-12 px-6 bg-muted/30">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-2" style={{color: data.textColor}}>Nuestros Planes</h2>
                        <p className="text-xl text-center text-muted-foreground mb-12" style={{color: data.textColor, opacity: 0.8}}>Elige el plan que mejor se adapte a tu negocio.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {plans.map(plan => (
                                <PublicPlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.sections.map((section) => (
            <section key={section.id} style={{ backgroundColor: section.backgroundColor, color: section.textColor, borderTop: `4px solid ${section.sectionColor}` }} className="py-12 px-6">
                <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-2" style={{color: section.textColor}}>{section.title}</h2>
                <p className="text-xl text-center text-muted-foreground mb-8" style={{color: section.textColor, opacity: 0.8}}>{section.subtitle}</p>
                <div 
                    className="text-center mb-12 prose prose-sm lg:prose-base max-w-4xl mx-auto ql-editor" 
                    style={{color: section.textColor, opacity: 0.9}}
                    dangerouslySetInnerHTML={{ __html: section.content }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {section.subsections.map((subsection) => (
                    <div key={subsection.id} className="bg-card/80 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                        {subsection.imageUrl && (
                        <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden">
                            <Image src={subsection.imageUrl} alt={subsection.title} fill objectFit="cover" />
                        </div>
                        )}
                        <h3 className="text-xl font-semibold mb-2" style={{color: section.textColor}}>{subsection.title}</h3>
                        <div 
                        className="text-sm prose prose-sm max-w-full ql-editor" 
                        style={{color: section.textColor, opacity: 0.9}}
                        dangerouslySetInnerHTML={{ __html: subsection.description }}
                        />
                    </div>
                    ))}
                </div>
                </div>
            </section>
            ))}

            {data.testimonials && data.testimonials.length > 0 && (
            <section className="py-12 px-6 bg-muted/30">
                <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-2">{data.testimonialsTitle}</h2>
                <p className="text-xl text-muted-foreground mb-12">{data.testimonialsSubtitle}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data.testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-card p-6 rounded-lg shadow-md text-left flex flex-col">
                        <div className="flex items-center mb-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                            <Image src={testimonial.avatarUrl} alt={testimonial.authorName} fill objectFit="cover" />
                        </div>
                        <div>
                            <h4 className="font-bold">{testimonial.authorName}</h4>
                            <p className="text-sm text-muted-foreground">{testimonial.authorRole}</p>
                        </div>
                        </div>
                        <div 
                        className="text-muted-foreground italic mb-4 flex-grow prose prose-sm max-w-full ql-editor"
                        dangerouslySetInnerHTML={{ __html: `"${testimonial.text}"`}}
                        />
                        <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("h-5 w-5", i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                        ))}
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </section>
            )}


            {/* Call to Action Section */}
            {data.ctaText && data.ctaUrl && (
            <section className="p-8 md:p-12 text-center">
                <Link href={data.ctaUrl}>
                <Button
                    size="lg"
                    style={{
                    backgroundColor: data.buttonColor,
                    color: '#FFFFFF'
                    }}
                    className="shadow-md hover:opacity-90 transition-opacity"
                >
                    {data.ctaText}
                </Button>
                </Link>
            </section>
            )}

            {formConfig && businessId && (
                <section className="p-8 md:p-12 bg-muted/30">
                    {isPreview && (
                        <h3 className="text-lg font-semibold text-center mb-4 text-foreground/80">Vista Previa del Formulario</h3>
                    )}
                    <InteractiveReviewForm businessId={businessId} formConfig={formConfig} />
                </section>
            )}
        </main>

        {/* Footer */}
        {data.footer?.enabled && (
            <footer style={{ backgroundColor: data.footer.backgroundColor, color: data.footer.textColor }} className="py-8 px-6">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-bold mb-4">{data.navigation.logoText}</h3>
                        <p className="text-sm">{data.footer.address}</p>
                        <p className="text-sm">{data.footer.phone}</p>
                        <p className="text-sm">{data.footer.email}</p>
                    </div>

                    {data.footer.columns.map(column => (
                        <div key={column.id}>
                            <h4 className="font-semibold mb-3">{column.title}</h4>
                            <ul className="space-y-2">
                                {column.links.map(link => (
                                    <li key={link.id}>
                                        <Link href={link.url}><span className="text-sm hover:opacity-75 transition-opacity">{link.text}</span></Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="container mx-auto mt-8 pt-6 border-t" style={{ borderColor: `${data.footer.textColor}33`}}>
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-sm text-center sm:text-left">{data.footer.copyrightText}</p>
                        <div className="flex gap-4 mt-4 sm:mt-0">
                            {data.footer.socialLinks.map(social => (
                                <Link key={social.id} href={social.url} target="_blank" rel="noopener noreferrer">
                                   <SocialIcon network={social.network} color={data.footer.iconColor} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        )}
      </div>
    </div>
  );
}
