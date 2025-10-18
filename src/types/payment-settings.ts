
import type { QRFormData } from "@/components/qr-form";

interface StripeData {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
}

interface MercadoPagoData {
    enabled: boolean;
    accessToken: string;
    publicKey: string;
    mode: 'production' | 'sandbox';
    instructions: string;
}

export interface PlanPaymentSettings {
    cashOnDelivery: boolean;
    nequi: QRFormData;
    daviplata: QRFormData;
    bancolombia: QRFormData;
    stripe: StripeData;
    mercadoPago: MercadoPagoData;
}
