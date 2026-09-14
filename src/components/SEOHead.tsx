import React, { useEffect } from 'react';
import { Language } from '../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  language?: Language;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Amader Job Online - Trusted Microjob & Task Marketplace in Bangladesh',
  description = 'Earn money by completing simple social media tasks or post microjobs to promote your brand. Trusted task marketplace in Bangladesh with instant bKash, Nagad & Rocket payouts.',
  image = 'https://microjob.bahubal.com/assets/og-image.jpg',
  url = 'https://microjob.bahubal.com',
  type = 'website',
  language = 'en',
  jsonLd
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tag
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);

    // Open Graph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:locale', language === 'bn' ? 'bn_BD' : 'en_US');
    setMetaTag('property', 'og:site_name', 'Amader Job Online');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // JSON-LD Structured Data
    const existingScript = document.getElementById('seo-json-ld');
    if (existingScript) {
      existingScript.remove();
    }

    const defaultJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Amader Job Online",
      "alternateName": ["Amader Job", "Microjob Bangladesh"],
      "url": "https://microjob.bahubal.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://microjob.bahubal.com/?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const scriptTag = document.createElement('script');
    scriptTag.id = 'seo-json-ld';
    scriptTag.type = 'application/ld+json';
    scriptTag.text = JSON.stringify(jsonLd || defaultJsonLd);
    document.head.appendChild(scriptTag);

  }, [title, description, image, url, type, language, jsonLd]);

  return null;
};
