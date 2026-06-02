
import type { QRFormData } from "@/components/qr-form";

export interface PaymentLink {
    id: string;
    name: string;
    amount: number;
    currency: string;
    url: string;
    isActive: boolean;
}

export interface StripeData {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
    paymentLinks?: PaymentLink[];
}

export interface MercadoPagoData {
    enabled: boolean;
    accessToken: string;
    publicKey: string;
    mode: 'production' | 'sandbox';
    instructions: string;
    paymentLinks?: PaymentLink[];
}

export interface PayPalData {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    mode: 'production' | 'sandbox';
    paymentLinks?: PaymentLink[];
}

export interface WompiData {
    enabled: boolean;
    publicKey: string;
    privateKey: string;
    mode: 'production' | 'sandbox';
    paymentLinks?: PaymentLink[];
}

export interface PlanPaymentSettings {
    cashOnDelivery: boolean;
    nequi: QRFormData;
    daviplata: QRFormData;
    bancolombia: QRFormData;
    stripe: StripeData;
    mercadoPago: MercadoPagoData;
    paypal: PayPalData;
    wompi: WompiData;
}
