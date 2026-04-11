
import type { QRFormData } from "@/components/qr-form";

export interface StripeData {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
}

export interface MercadoPagoData {
    enabled: boolean;
    accessToken: string;
    publicKey: string;
    mode: 'production' | 'sandbox';
    instructions: string;
}

export interface PayPalData {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    mode: 'production' | 'sandbox';
}

export interface WompiData {
    enabled: boolean;
    publicKey: string;
    privateKey: string;
    mode: 'production' | 'sandbox';
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
