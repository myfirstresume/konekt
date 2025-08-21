import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date?: string;
}

/**
 * Reads all blog posts from the posts directory
 */
export function getAllBlogPosts(): BlogPost[] {
  const postsDirectory = join(process.cwd(), 'src/app/blog/posts');
  const fileNames = readdirSync(postsDirectory);
  
  const posts = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = join(postsDirectory, fileName);
      const fileContents = readFileSync(fullPath, 'utf8');
      
      return parseBlogPost(fileContents, slug);
    })
    .sort((a, b) => {
      // Sort by date if available, otherwise by title
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  
  return posts;
}

/**
 * Reads a specific blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const postsDirectory = join(process.cwd(), 'src/app/blog/posts');
    const fullPath = join(postsDirectory, `${slug}.md`);
    const fileContents = readFileSync(fullPath, 'utf8');
    
    return parseBlogPost(fileContents, slug);
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

/**
 * Parses markdown content into a BlogPost object
 */
function parseBlogPost(content: string, slug: string): BlogPost {
  // Extract title from first line (should be # Title)
  const lines = content.split('\n');
  let title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  let excerpt = '';
  let date: string | undefined;
  
  // Look for title in first line
  if (lines[0] && lines[0].startsWith('# ')) {
    title = lines[0].substring(2).trim();
    lines.shift(); // Remove title line
  }
  
  // Look for date in frontmatter or first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.startsWith('date:')) {
      date = line.substring(5).trim();
      break;
    }
  }
  
  // Create excerpt from content, excluding the date line
  const contentWithoutTitle = lines.join('\n').trim();
  const contentWithoutDate = contentWithoutTitle
    .replace(/^date:.*$/gm, '') // Remove date lines
    .replace(/^#.*$/gm, '') // Remove any remaining headers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
  
  excerpt = contentWithoutDate.substring(0, 150);
  
  if (excerpt.length === 150) {
    excerpt += '...';
  }
  
  return {
    slug,
    title,
    content: contentWithoutTitle,
    excerpt,
    date
  };
}
