// worker/brand-scrape-worker.ts
import { Queue, Worker, Job } from 'bullmq';
import { scrapeBrandData, createBrandStyle } from '../lib/brand-scraper';
import { prisma } from '../lib/database';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

export const brandScrapeQueue = new Queue('brandScrape', { connection });

interface BrandScrapeJobData {
  projectId: string;
  sourceUrl: string;
  clientName: string;
  templateKey: string;
}

const worker = new Worker<BrandScrapeJobData>(
  'brandScrape',
  async (job: Job<BrandScrapeJobData>) => {
    const { projectId, sourceUrl, clientName, templateKey } = job.data;
    try {
      // Scrape brand data
      const brandData = await scrapeBrandData(sourceUrl);

      // Create brand style in DB
      const brandStyle = await createBrandStyle(projectId, brandData);

      // TODO: Select template and create page (call your page generator here)

      // Update project status
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'ready',
          templateKey: templateKey,
        },
      });

      return { success: true };
    } catch (error) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'error' },
      });
      throw error;
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Brand scrape completed for project ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`Brand scrape failed for project ${job?.id}:`, err);
});