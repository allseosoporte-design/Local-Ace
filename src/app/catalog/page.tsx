
'use client';

import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';
import CatalogPageComponent from './[businessId]/page';


export default function CatalogPage() {
  return <CatalogPageComponent params={{ businessId: SUPER_ADMIN_BUSINESS_ID }} />;
}
