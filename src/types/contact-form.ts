
export interface FormField {
    id: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'number' | 'checkbox' | 'radio' | 'select';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select, radio
}
