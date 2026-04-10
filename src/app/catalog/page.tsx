'use client';

import { useMemo } from 'react';
import CatalogPageComponent from './[businessId]/page';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';


export default function CatalogPage() {
  // En Next.js 15, params es una Promise. Creamos una promise resuelta para el ID estático.
  const paramsPromise = useMemo(() => Promise.resolve({ businessId: SUPER_ADMIN_BUSINESS_ID }), []);
  
  return <CatalogPageComponent params={paramsPromise} />;
}
