import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { serviceDetails } from './service-content';

const SITE_NAME = 'EON Group';
const SITE_URL = 'https://eon-group.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/assets/elites.jpg`;
const CONTACT_EMAIL = 'eongroupgr@gmail.com';
const CONTACT_PHONE = '+306946934533';

type SeoConfig = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'service';
};

type JsonLd = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  init(): void {
    this.applyCurrentRoute();

    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.applyCurrentRoute();
    });
  }

  private applyCurrentRoute(): void {
    const snapshot = this.deepestRoute(this.router.routerState.snapshot.root);
    const seo = this.resolveSeo(snapshot);
    const canonicalUrl = `${SITE_URL}${seo.path}`;
    const imageUrl = seo.image ?? DEFAULT_IMAGE;

    this.title.setTitle(seo.title);
    this.setTag('name', 'description', seo.description);
    this.setTag('name', 'robots', 'index, follow, max-image-preview:large');
    this.setTag('name', 'author', SITE_NAME);
    this.setTag('name', 'application-name', SITE_NAME);
    this.setTag('name', 'keywords', (seo.keywords ?? this.defaultKeywords()).join(', '));
    this.setTag('name', 'theme-color', '#bfff00');

    this.setTag('property', 'og:site_name', SITE_NAME);
    this.setTag('property', 'og:type', seo.type === 'article' ? 'article' : 'website');
    this.setTag('property', 'og:locale', 'el_GR');
    this.setTag('property', 'og:title', seo.title);
    this.setTag('property', 'og:description', seo.description);
    this.setTag('property', 'og:url', canonicalUrl);
    this.setTag('property', 'og:image', imageUrl);

    this.setTag('name', 'twitter:card', 'summary_large_image');
    this.setTag('name', 'twitter:title', seo.title);
    this.setTag('name', 'twitter:description', seo.description);
    this.setTag('name', 'twitter:image', imageUrl);

    this.setCanonical(canonicalUrl);
    this.setJsonLd(this.buildJsonLd(seo, canonicalUrl, imageUrl));
  }

  private deepestRoute(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let route = snapshot;

    while (route.firstChild) {
      route = route.firstChild;
    }

    return route;
  }

  private resolveSeo(snapshot: ActivatedRouteSnapshot): SeoConfig {
    const routePath = snapshot.routeConfig?.path;

    if (routePath === 'ypiresies/:slug') {
      const slug = snapshot.paramMap.get('slug') ?? '';
      const service = serviceDetails.find((item) => item.slug === slug) ?? serviceDetails[0];

      return {
        title: `${service.name} | EON Group`,
        description: this.trimDescription(service.lead),
        path: `/ypiresies/${service.slug}`,
        type: 'service',
        keywords: [
          service.name,
          'υπηρεσίες ιστοσελίδων',
          'κατασκευή ιστοσελίδων Ελλάδα',
          'EON Group'
        ]
      };
    }

    return (snapshot.data['seo'] as SeoConfig | undefined) ?? this.homeSeo();
  }

  private buildJsonLd(seo: SeoConfig, canonicalUrl: string, imageUrl: string): JsonLd {
    const organizationId = `${SITE_URL}/#organization`;
    const websiteId = `${SITE_URL}/#website`;
    const pageId = `${canonicalUrl}#webpage`;
    const graph: JsonLd[] = [
      {
        '@type': 'ProfessionalService',
        '@id': organizationId,
        name: SITE_NAME,
        url: SITE_URL,
        email: CONTACT_EMAIL,
        telephone: CONTACT_PHONE,
        image: DEFAULT_IMAGE,
        priceRange: '€€',
        areaServed: [
          {
            '@type': 'Country',
            name: 'Greece'
          }
        ],
        knowsAbout: [
          'Website design',
          'Responsive web development',
          'SEO structure',
          'Google Ads',
          'Social media campaigns',
          'Website support'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: CONTACT_EMAIL,
          telephone: CONTACT_PHONE,
          contactType: 'customer support',
          availableLanguage: ['el', 'en']
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'EON Group website and digital marketing services',
          itemListElement: serviceDetails.map((service) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: service.name,
              description: service.description,
              url: `${SITE_URL}/ypiresies/${service.slug}`
            }
          }))
        }
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: 'el-GR',
        publisher: {
          '@id': organizationId
        }
      },
      {
        '@type': seo.type === 'service' ? 'Service' : 'WebPage',
        '@id': pageId,
        name: seo.title,
        headline: seo.title,
        description: seo.description,
        url: canonicalUrl,
        image: imageUrl,
        inLanguage: 'el-GR',
        isPartOf: {
          '@id': websiteId
        },
        provider: {
          '@id': organizationId
        },
        about: this.pageTopics(seo),
        mainEntityOfPage: canonicalUrl
      },
      this.breadcrumbJsonLd(seo.path, canonicalUrl)
    ];

    return {
      '@context': 'https://schema.org',
      '@graph': graph
    };
  }

  private breadcrumbJsonLd(path: string, canonicalUrl: string): JsonLd {
    const parts = path.split('/').filter(Boolean);
    const items = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Αρχική',
        item: SITE_URL
      }
    ];

    let currentPath = '';
    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      items.push({
        '@type': 'ListItem',
        position: index + 2,
        name: this.breadcrumbName(part),
        item: `${SITE_URL}${currentPath}`
      });
    });

    if (items.length === 1) {
      items[0].item = canonicalUrl;
    }

    return {
      '@type': 'BreadcrumbList',
      itemListElement: items
    };
  }

  private breadcrumbName(part: string): string {
    if (part === 'about') {
      return 'Σχετικά';
    }

    if (part === 'work') {
      return 'Έργα';
    }

    if (part === 'contact') {
      return 'Επικοινωνία';
    }

    if (part === 'ypiresies') {
      return 'Υπηρεσίες';
    }

    return serviceDetails.find((service) => service.slug === part)?.name ?? part;
  }

  private pageTopics(seo: SeoConfig): JsonLd[] {
    return (seo.keywords ?? this.defaultKeywords()).slice(0, 8).map((keyword) => ({
      '@type': 'Thing',
      name: keyword
    }));
  }

  private setTag(attribute: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attribute]: key, content }, `${attribute}="${key}"`);
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private setJsonLd(data: JsonLd): void {
    const scriptId = 'eon-structured-data';
    let script = this.document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.text = JSON.stringify(data);
  }

  private homeSeo(): SeoConfig {
    return {
      title: 'EON Group | Κατασκευή ιστοσελίδων από 300€ στην Ελλάδα',
      description: 'Η EON Group δημιουργεί οικονομικά, μοντέρνα και responsive websites για επιχειρήσεις στην Ελλάδα, με SEO-friendly δομή, web support και digital marketing.',
      path: '/',
      type: 'website',
      keywords: this.defaultKeywords()
    };
  }

  private defaultKeywords(): string[] {
    return [
      'κατασκευή ιστοσελίδων',
      'σχεδιασμός ιστοσελίδων',
      'web design Ελλάδα',
      'responsive websites',
      'SEO δομή',
      'digital marketing',
      'Google Ads',
      'web support',
      'EON Group'
    ];
  }

  private trimDescription(value: string): string {
    return value.length <= 158 ? value : `${value.slice(0, 155).trim()}...`;
  }
}
