import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import type { Session } from 'next-auth';
import { scrapeJobDescription, formatJobDescriptionForContext } from '@/utils/job-description-scraper';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`Scraping job description from: ${url}`);

    const scrapedData = await scrapeJobDescription(url);
    
    const formattedDescription = formatJobDescriptionForContext(scrapedData);

    console.log(`Successfully scraped job description for: ${scrapedData.title} at ${scrapedData.company}`);

    return NextResponse.json({
      success: true,
      data: scrapedData,
      formattedDescription
    });

  } catch (error) {
    console.error('Error scraping job description:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to scrape job description',
        success: false
      },
      { status: 500 }
    );
  }
}
