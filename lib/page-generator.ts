import { prisma } from './database';
import { DEFAULT_SECTIONS } from './constants';

export async function createPage(projectId: string, clientName: string) {
  // Replace {Bank} placeholder with actual client name in default sections
  const sections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
  const replaceBankPlaceholder = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/\{Bank\}/g, clientName);
    }
    if (Array.isArray(obj)) {
      return obj.map(replaceBankPlaceholder);
    }
    if (obj && typeof obj === 'object') {
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = replaceBankPlaceholder(value);
      }
      return newObj;
    }
    return obj;
  };
  
  const customizedSections = replaceBankPlaceholder(sections);
  
  const page = await prisma.page.create({
    data: {
      projectId,
      sections: customizedSections
    }
  });
  
  await prisma.project.update({
    where: { id: projectId },
    data: { pageId: page.id }
  });
  
  return page;
}

export function generateSlug(clientName: string, existingSlugs: string[]): string {
  const baseSlug = clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  let counter = 2;
  let slug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  return slug;
}

export function selectTemplate(brandStyle: any, templateKey: string): string {
  if (templateKey !== 'auto') {
    return templateKey;
  }
  
  // Auto-select based on brand characteristics
  const { styleNotes, primaryColor } = brandStyle || {};
  
  if (styleNotes?.formality === 'formal') {
    return 'tpl-1'; // Classic Professional
  }
  
  if (styleNotes?.tone === 'friendly') {
    return 'tpl-4'; // Friendly Approachable
  }
  
  if (primaryColor && isVibrantColor(primaryColor)) {
    return 'tpl-3'; // Bold Dynamic
  }
  
  if (styleNotes?.formality === 'casual') {
    return 'tpl-2'; // Modern Minimalist
  }
  
  return 'tpl-5'; // Premium Sophisticated (fallback)
}

function isVibrantColor(hex: string): boolean {
  // Convert hex to HSL and check saturation
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  
  return s > 0.4; // Consider vibrant if saturation > 40%
}