import { useEffect } from 'react';

/**
 * Dynamically updates <head> meta tags for SEO.
 * Works in React SPA — Google/Bing crawlers execute JS and read these.
 */
export function useSEO({
  title,
  description,
  image,
  url,
  type = 'website',
  jsonLd = null,
}) {
  const siteName = 'Maeva Kenya Real Estate';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Buy, Rent & Sell Property in Kenya`;
  const defaultDesc = 'Browse 1,200+ verified properties across Kenya. Houses, apartments, land and commercial spaces for sale and rent. Find your dream home today.';
  const finalDesc = description || defaultDesc;
  const finalImage = image || 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1200&h=630&fit=crop';
  const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    // ── Title ──────────────────────────────────────────────
    document.title = fullTitle;

    // ── Standard meta ──────────────────────────────────────
    setTag('name', 'description', finalDesc);
    setTag('name', 'robots', 'index, follow');
    setTag('name', 'author', siteName);
    setTag('name', 'keywords', 'Kenya real estate, property for sale Kenya, houses for rent Nairobi, apartments Mombasa, land for sale Kenya, buy house Kenya');

    // ── Open Graph ─────────────────────────────────────────
    setTag('property', 'og:type', type);
    setTag('property', 'og:site_name', siteName);
    setTag('property', 'og:title', fullTitle);
    setTag('property', 'og:description', finalDesc);
    setTag('property', 'og:image', finalImage);
    setTag('property', 'og:image:width', '1200');
    setTag('property', 'og:image:height', '630');
    setTag('property', 'og:url', finalUrl);
    setTag('property', 'og:locale', 'en_KE');

    // ── Twitter Card ───────────────────────────────────────
    setTag('name', 'twitter:card', 'summary_large_image');
    setTag('name', 'twitter:title', fullTitle);
    setTag('name', 'twitter:description', finalDesc);
    setTag('name', 'twitter:image', finalImage);

    // ── Canonical ──────────────────────────────────────────
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = finalUrl;

    // ── JSON-LD structured data ────────────────────────────
    let ldScript = document.getElementById('ld-json');
    if (jsonLd) {
      if (!ldScript) { ldScript = document.createElement('script'); ldScript.id = 'ld-json'; ldScript.type = 'application/ld+json'; document.head.appendChild(ldScript); }
      ldScript.textContent = JSON.stringify(jsonLd);
    } else if (ldScript) {
      ldScript.remove();
    }

    return () => {
      document.title = `${siteName} — Buy, Rent & Sell Property in Kenya`;
    };
  }, [fullTitle, finalDesc, finalImage, finalUrl, type, jsonLd]);
}

function setTag(attr, name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
