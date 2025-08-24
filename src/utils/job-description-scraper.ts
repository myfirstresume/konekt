/**
 * Job Description Scraper
 * Supports Workday job posting URLs. LinkedIn and Ashby to be added.
 */

interface ScrapedJobDescription {
  title: string;
  company: string;
  description: string;
  url: string;
  scrapedAt: Date;
}

/**
 * Determines the platform type from a URL
 */
function getPlatformType(url: string): 'linkedin' | 'ashby' | 'workday' | 'unknown' {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('linkedin.com/jobs')) {
    return 'linkedin';
  } else if (urlLower.includes('jobs.ashbyhq.com') || urlLower.includes('ashbyhq.com')) {
    return 'ashby';
  } else if (urlLower.includes('workday.com') || urlLower.includes('myworkdayjobs.com')) {
    return 'workday';
  }
  
  return 'unknown';
}

/**
 * Extracts job description from LinkedIn
 */
async function scrapeLinkedIn(url: string): Promise<ScrapedJobDescription> {
  try {
    // LinkedIn job descriptions are typically in the page content
    // We'll need to use a server-side approach since LinkedIn blocks client-side scraping
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn page: ${response.status}`);
    }
    
    const html = await response.text();
    
    // First try to extract from JSON-LD structured data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData['@type'] === 'JobPosting') {
          console.log(`Successfully extracted LinkedIn job data from JSON-LD: ${jsonData.title} at ${jsonData.hiringOrganization?.name}`);
          return {
            title: jsonData.title || 'Job Title Not Found',
            company: jsonData.hiringOrganization?.name || 'Company Not Found',
            description: jsonData.description || 'Job description not found',
            url,
            scrapedAt: new Date()
          };
        }
      } catch (parseError) {
        console.log('Failed to parse LinkedIn JSON-LD, falling back to HTML parsing:', parseError);
      }
    } else {
      console.log('No LinkedIn JSON-LD found, using HTML parsing');
    }
    
    // Fallback to HTML parsing
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(' | LinkedIn', '').trim() : 'Job Title Not Found';
    
    // Extract company name (this is a simplified approach)
    const companyMatch = html.match(/at\s+([^|]+)/i);
    const company = companyMatch ? companyMatch[1].trim() : 'Company Not Found';
    
    // Extract job description - try multiple patterns
    let description = 'Job description not found';
    
    // Try various description selectors
    const descriptionPatterns = [
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
      /<div[^>]*data-testid="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i
    ];
    
    for (const pattern of descriptionPatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim().length > 100) { // Ensure we have substantial content
        description = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        break;
      }
    }
    
    return {
      title,
      company,
      description,
      url,
      scrapedAt: new Date()
    };
  } catch (error) {
    throw new Error(`LinkedIn scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts job description from Ashby
 */
async function scrapeAshby(url: string): Promise<ScrapedJobDescription> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Ashby page: ${response.status}`);
    }
    
    const html = await response.text();
    
    // First try to extract from JSON-LD structured data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData['@type'] === 'JobPosting') {
          console.log(`Successfully extracted Ashby job data from JSON-LD: ${jsonData.title} at ${jsonData.hiringOrganization?.name}`);
          return {
            title: jsonData.title || 'Job Title Not Found',
            company: jsonData.hiringOrganization?.name || 'Company Not Found',
            description: jsonData.description || 'Job description not found',
            url,
            scrapedAt: new Date()
          };
        }
      } catch (parseError) {
        console.log('Failed to parse Ashby JSON-LD, falling back to HTML parsing:', parseError);
      }
    } else {
      console.log('No Ashby JSON-LD found, using HTML parsing');
    }
    
    // Fallback to HTML parsing
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Job Title Not Found';
    
    // Extract company name
    const companyMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const company = companyMatch ? 
      companyMatch[1].replace(/\s*-\s*.*$/, '').trim() : 'Company Not Found';
    
    // Extract job description - try multiple patterns
    let description = 'Job description not found';
    
    // Try various description selectors
    const descriptionPatterns = [
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
      /<div[^>]*data-testid="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i
    ];
    
    for (const pattern of descriptionPatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim().length > 100) { // Ensure we have substantial content
        description = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        break;
      }
    }
    
    return {
      title,
      company,
      description,
      url,
      scrapedAt: new Date()
    };
  } catch (error) {
    throw new Error(`Ashby scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts job description from Workday
 */
async function scrapeWorkday(url: string): Promise<ScrapedJobDescription> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Workday page: ${response.status}`);
    }
    
    const html = await response.text();
    
    // First try to extract from JSON-LD structured data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData['@type'] === 'JobPosting') {
          console.log(`Successfully extracted Workday job data from JSON-LD: ${jsonData.title} at ${jsonData.hiringOrganization?.name}`);
          return {
            title: jsonData.title || 'Job Title Not Found',
            company: jsonData.hiringOrganization?.name || 'Company Not Found',
            description: jsonData.description || 'Job description not found',
            url,
            scrapedAt: new Date()
          };
        }
      } catch (parseError) {
        console.log('Failed to parse Workday JSON-LD, falling back to HTML parsing:', parseError);
      }
    } else {
      console.log('No Workday JSON-LD found, using HTML parsing');
    }
    
    // Fallback to HTML parsing if JSON-LD is not available
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Job Title Not Found';
    
    // Extract company name
    const companyMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const company = companyMatch ? 
      companyMatch[1].replace(/\s*-\s*.*$/, '').trim() : 'Company Not Found';
    
    // Extract job description - try multiple patterns
    let description = 'Job description not found';
    
    // Try various description selectors
    const descriptionPatterns = [
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
      /<div[^>]*data-testid="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i
    ];
    
    for (const pattern of descriptionPatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim().length > 100) { // Ensure we have substantial content
        description = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        break;
      }
    }
    
    return {
      title,
      company,
      description,
      url,
      scrapedAt: new Date()
    };
  } catch (error) {
    throw new Error(`Workday scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main function to scrape job description from a URL
 */
export async function scrapeJobDescription(url: string): Promise<ScrapedJobDescription> {
  if (!url) {
    throw new Error('URL is required');
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }
  
  const platform = getPlatformType(url);
  console.log(`Scraping job description from ${platform} platform: ${url}`);
  
  try {
    switch (platform) {
      case 'linkedin':
        return await scrapeLinkedIn(url);
      case 'ashby':
        return await scrapeAshby(url);
      case 'workday':
        return await scrapeWorkday(url);
      default:
        throw new Error('Unsupported platform. Currently supports LinkedIn, Ashby, and Workday job postings.');
    }
  } catch (error) {
    console.error(`Error scraping from ${platform}:`, error);
    throw error;
  }
}

/**
 * Formats job description for use in resume review context
 */
export function formatJobDescriptionForContext(scrapedData: ScrapedJobDescription): string {
  return `
Job Title: ${scrapedData.title}
Company: ${scrapedData.company}
URL: ${scrapedData.url}

Job Description:
${scrapedData.description}
`.trim();
}
