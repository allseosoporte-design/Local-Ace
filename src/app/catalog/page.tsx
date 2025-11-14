
'use client';

import CatalogPageComponent from './[businessId]/page';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';


export default function CatalogPage() {
  return <CatalogPageComponent params={{ businessId: SUPER_ADMIN_BUSINESS_ID }} />;
}
