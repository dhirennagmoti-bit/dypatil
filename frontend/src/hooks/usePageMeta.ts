import { useEffect } from 'react';

interface MetaProps {
  title: string;
  description?: string;
  ogImage?: string;
}

export function usePageMeta({ title, description, ogImage }: MetaProps) {
  useEffect(() => {
    // Set document title
    const fullTitle = title.includes('InsureChain') ? title : `${title} | InsureChain Bharat`;
    document.title = fullTitle;

    // Set meta description
    if (description) {
      let descTag = document.querySelector('meta[name="description"]');
      if (!descTag) {
        descTag = document.createElement('meta');
        descTag.setAttribute('name', 'description');
        document.head.appendChild(descTag);
      }
      descTag.setAttribute('content', description);
    }

    // Set OG Image
    if (ogImage) {
      let ogTag = document.querySelector('meta[property="og:image"]');
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', 'og:image');
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', ogImage);
    }

    // Track pageview with analytics provider
    if ((window as any).insureAnalytics?.page) {
      (window as any).insureAnalytics.page();
    }
  }, [title, description, ogImage]);
}
