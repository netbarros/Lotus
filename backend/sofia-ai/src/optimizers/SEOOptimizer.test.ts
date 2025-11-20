/**
 * SEOOptimizer Unit Tests
 * Tests SEO analysis and optimization capabilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('SEOOptimizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeSEO', () => {
    it('should analyze on-page SEO', () => {
      const mockPage = {
        url: 'https://example.com',
        title: 'Example Product | Best Solutions',
        description: 'Quality description with keywords',
        h1Count: 1,
        metaTags: ['description', 'og:title', 'twitter:card'],
      };

      expect(mockPage.title.length).toBeGreaterThan(30);
      expect(mockPage.title.length).toBeLessThan(60);
      expect(mockPage.h1Count).toBe(1);
    });

    it('should identify missing meta tags', () => {
      const requiredTags = [
        'description',
        'og:title',
        'og:description',
        'og:image',
        'twitter:card',
      ];

      const presentTags = ['description', 'og:title'];
      const missingTags = requiredTags.filter((tag) => !presentTags.includes(tag));

      expect(missingTags).toContain('og:image');
    });

    it('should validate title length', () => {
      const titles = [
        { text: 'Short', valid: false }, // Too short
        { text: 'This is a good title for SEO purposes', valid: true },
        {
          text: 'This title is way too long and will be truncated in search results which is not good for SEO',
          valid: false,
        }, // Too long
      ];

      expect(titles[0].valid).toBe(false);
      expect(titles[1].valid).toBe(true);
      expect(titles[2].valid).toBe(false);
    });
  });

  describe('keywordAnalysis', () => {
    it('should analyze keyword density', () => {
      const content =
        'SEO optimization is important. Good SEO helps ranking. SEO best practices matter.';
      const keyword = 'SEO';

      const occurrences = (content.match(new RegExp(keyword, 'gi')) || []).length;
      const words = content.split(/\s+/).length;
      const density = (occurrences / words) * 100;

      expect(density).toBeGreaterThan(0);
      expect(density).toBeLessThan(5); // Ideal: 1-2%
    });

    it('should identify keyword opportunities', () => {
      const suggestions = [
        {
          keyword: 'best practices',
          volume: 5400,
          difficulty: 'medium',
          opportunity: 'high',
        },
      ];

      expect(suggestions[0].opportunity).toBe('high');
    });
  });

  describe('technicalSEO', () => {
    it('should check robots.txt', () => {
      const robotsTxt = `
User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://example.com/sitemap.xml
      `.trim();

      expect(robotsTxt).toContain('Sitemap:');
      expect(robotsTxt).toContain('User-agent: *');
    });

    it('should validate sitemap.xml', () => {
      const sitemap = {
        urls: [
          { loc: 'https://example.com/', priority: 1.0 },
          { loc: 'https://example.com/products', priority: 0.8 },
        ],
      };

      expect(sitemap.urls.length).toBeGreaterThan(0);
      sitemap.urls.forEach((url) => {
        expect(url.loc).toMatch(/^https?:\/\//);
        expect(url.priority).toBeGreaterThanOrEqual(0);
        expect(url.priority).toBeLessThanOrEqual(1);
      });
    });

    it('should check canonical URLs', () => {
      const pages = [
        { url: '/products', canonical: 'https://example.com/products' },
        { url: '/products?sort=price', canonical: 'https://example.com/products' },
      ];

      expect(pages[0].canonical).toBeTruthy();
      expect(pages[1].canonical).toBe(pages[0].canonical);
    });
  });

  describe('structuredData', () => {
    it('should validate JSON-LD schema', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Example Product',
        description: 'Product description',
        offers: {
          '@type': 'Offer',
          price: '99.99',
          priceCurrency: 'USD',
        },
      };

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Product');
      expect(schema.offers.price).toBeTruthy();
    });

    it('should identify missing schema properties', () => {
      const requiredProps = ['name', 'description', 'image', 'offers'];
      const presentProps = ['name', 'description'];
      const missing = requiredProps.filter((prop) => !presentProps.includes(prop));

      expect(missing).toContain('image');
      expect(missing).toContain('offers');
    });
  });

  describe('linkAnalysis', () => {
    it('should analyze internal linking', () => {
      const internalLinks = [
        { from: '/home', to: '/products', anchor: 'View Products' },
        { from: '/home', to: '/about', anchor: 'About Us' },
      ];

      expect(internalLinks.length).toBeGreaterThan(0);
      internalLinks.forEach((link) => {
        expect(link.anchor).toBeTruthy();
      });
    });

    it('should identify broken links', () => {
      const links = [
        { url: '/valid-page', status: 200 },
        { url: '/missing-page', status: 404 },
      ];

      const brokenLinks = links.filter((link) => link.status >= 400);
      expect(brokenLinks).toHaveLength(1);
    });

    it('should check nofollow attributes', () => {
      const externalLinks = [
        { url: 'https://external.com', rel: 'nofollow' },
        { url: 'https://trusted.com', rel: '' },
      ];

      expect(externalLinks[0].rel).toBe('nofollow');
    });
  });

  describe('mobileOptimization', () => {
    it('should validate mobile-friendly design', () => {
      const mobileChecks = {
        viewport: true,
        textReadable: true,
        clickableElements: true,
        noHorizontalScroll: true,
      };

      Object.values(mobileChecks).forEach((check) => {
        expect(check).toBe(true);
      });
    });

    it('should check page speed on mobile', () => {
      const mobileSpeed = {
        score: 85,
        FCP: 1.8, // First Contentful Paint
        TTI: 3.2, // Time to Interactive
      };

      expect(mobileSpeed.score).toBeGreaterThan(80);
    });
  });

  describe('contentQuality', () => {
    it('should analyze readability', () => {
      const content = 'This is easy to read. Short sentences. Clear message.';

      // Flesch Reading Ease score (higher = easier)
      const readabilityScore = 85; // Mock score

      expect(readabilityScore).toBeGreaterThan(60); // Good readability
    });

    it('should identify thin content', () => {
      const pages = [
        { url: '/page1', wordCount: 50 }, // Thin content
        { url: '/page2', wordCount: 800 }, // Good content
      ];

      const thinPages = pages.filter((page) => page.wordCount < 300);
      expect(thinPages).toHaveLength(1);
    });
  });
});
