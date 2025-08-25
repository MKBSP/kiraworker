import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import * as Vibrant from 'node-vibrant';
import { prisma } from './database';

export interface BrandData {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamilies: string[];
  logoUrl?: string;
  faviconUrl?: string;
  languageDetected?: string;
  styleNotes?: any;
}

export async function scrapeBrandData(url: string): Promise<BrandData> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Get page content
    const content = await page.content();
    const $ = cheerio.load(content);
    
    // Extract colors from CSS
    const colors = await extractColors(page, url);
    
    // Extract fonts
    const fonts = await extractFonts(page);
    
    // Find logo
    const logoUrl = await findLogo($, url);
    
    // Find favicon
    const faviconUrl = findFavicon($, url);
    
    // Detect language and style
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 1000);
    const languageDetected = detectLanguage(textContent);
    const styleNotes = analyzeWritingStyle(textContent);
    
    return {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent,
      fontFamilies: fonts,
      logoUrl,
      faviconUrl,
      languageDetected,
      styleNotes
    };
    
  } catch (error) {
    console.error('Brand scraping failed:', error);
    return {
      fontFamilies: ['Inter', 'system-ui'],
      languageDetected: 'en'
    };
  } finally {
    await browser.close();
  }
}

async function extractColors(page: any, url: string): Promise<{ primary?: string; secondary?: string; accent?: string }> {
  try {
    // Get computed styles of key elements
    const colors = await page.evaluate(() => {
      const getComputedColor = (selector: string) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const style = window.getComputedStyle(el);
        return style.backgroundColor !== 'rgba(0, 0, 0, 0)' ? style.backgroundColor : style.color;
      };
      
      return {
        header: getComputedColor('header, .header, nav'),
        primary: getComputedColor('button, .btn, .button, [class*="primary"]'),
        accent: getComputedColor('.cta, [class*="accent"], [class*="highlight"]'),
        body: getComputedColor('body')
      };
    });
    
    // Convert rgba to hex and filter valid colors
    const validColors = Object.values(colors)
      .filter(color => color && color !== 'rgba(0, 0, 0, 0)')
      .map(color => rgbaToHex(color as string))
      .filter(Boolean);
    
    return {
      primary: validColors[0] ?? undefined,
      secondary: validColors[1] ?? undefined,
      accent: validColors[2] ?? undefined
    };
  } catch (error) {
    console.error('Color extraction failed:', error);
    return {};
  }
}

async function extractFonts(page: any): Promise<string[]> {
  try {
    const fonts = await page.evaluate(() => {
      const getFontFamily = (selector: string) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        return window.getComputedStyle(el).fontFamily;
      };
      
      const fontSources = [
        getFontFamily('body'),
        getFontFamily('h1, h2, h3'),
        getFontFamily('header, .header'),
        getFontFamily('.logo, [class*="logo"]')
      ];
      
      return fontSources.filter(font => font && font !== 'serif' && font !== 'sans-serif');
    });
    
    // Extract Google Fonts from link tags
    const googleFonts = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[href*="fonts.googleapis"]'));
      return links.map((link: any) => {
        const url = new URL(link.href);
        const family = url.searchParams.get('family');
        return family ? family.split(':')[0].replace(/\+/g, ' ') : null;
      }).filter(Boolean);
    });
    
    const allFonts = [...fonts, ...googleFonts]
      .flatMap(font => font.split(','))
      .map(font => font.trim().replace(/['"]/g, ''))
      .filter((font, index, arr) => arr.indexOf(font) === index)
      .slice(0, 3);
    
    return allFonts.length > 0 ? allFonts : ['Inter', 'system-ui'];
  } catch (error) {
    console.error('Font extraction failed:', error);
    return ['Inter', 'system-ui'];
  }
}

async function findLogo($: cheerio.CheerioAPI, baseUrl: string): Promise<string | undefined> {
  const logoSelectors = [
    'img[alt*="logo" i]',
    '.logo img',
    '[class*="logo"] img',
    'header img:first-child',
    '.header img:first-child'
  ];
  
  for (const selector of logoSelectors) {
    const img = $(selector).first();
    if (img.length) {
      const src = img.attr('src');
      if (src) {
        return new URL(src, baseUrl).href;
      }
    }
  }
  
  return undefined;
}

function findFavicon($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
  const faviconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]'
  ];
  
  for (const selector of faviconSelectors) {
    const link = $(selector).first();
    if (link.length) {
      const href = link.attr('href');
      if (href) {
        return new URL(href, baseUrl).href;
      }
    }
  }
  
  return undefined;
}

function detectLanguage(text: string): string {
  // Simple language detection based on common words
  const spanishWords = /\b(el|la|de|que|y|a|en|un|es|se|no|te|lo|le|da|su|por|son|con|para|una|sus|al|como|del|tu|él|si|yo|más|pero|ser|ha|me|mi)\b/gi;
  const portugueseWords = /\b(o|a|de|que|e|do|da|em|um|para|é|com|não|uma|os|no|se|na|por|mais|as|dos|como|mas|foi|ao|ele|das|tem|à|seu|sua|ou|ser|quando|muito|há|nos|já|está)\b/gi;
  
  const spanishMatches = (text.match(spanishWords) || []).length;
  const portugueseMatches = (text.match(portugueseWords) || []).length;
  
  if (spanishMatches > 5) return 'es';
  if (portugueseMatches > 5) return 'pt';
  return 'en';
}

function analyzeWritingStyle(text: string): any {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  
  const formalWords = /\b(therefore|furthermore|moreover|consequently|nevertheless|however)\b/gi;
  const casualWords = /\b(awesome|great|cool|amazing|fantastic|wonderful)\b/gi;
  
  const formalCount = (text.match(formalWords) || []).length;
  const casualCount = (text.match(casualWords) || []).length;
  
  return {
    avgSentenceLength: Math.round(avgLength),
    formality: formalCount > casualCount ? 'formal' : 'casual',
    tone: casualCount > 2 ? 'friendly' : formalCount > 2 ? 'corporate' : 'neutral'
  };
}

function rgbaToHex(rgba: string): string | null {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (!match) return null;
  
  const [, r, g, b] = match;
  return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}

export async function createBrandStyle(projectId: string, brandData: BrandData) {
  const brandStyle = await prisma.brandStyle.create({
    data: brandData
  });
  
  await prisma.project.update({
    where: { id: projectId },
    data: { brandStyleId: brandStyle.id }
  });
  
  return brandStyle;
}