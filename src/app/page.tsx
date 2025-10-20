
'use client';

import { EditorLandingPreview, type LandingPageData } from '@/components/editor-landing-preview';
import { HomeNav } from '@/components/home-nav';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/catalog');
  }, [router]);

  // Render nothing or a loading state while redirecting
  return null; 
}
