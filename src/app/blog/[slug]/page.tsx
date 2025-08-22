import { getBlogPostBySlug, getAllBlogPosts } from '@/utils/blog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back to blog link */}
          <div className="mb-8">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-mfr-primary hover:mfr-primary/80 transition-colors duration-200"
            >
              <svg 
                className="mr-2 w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Back to blog
            </Link>
          </div>

          {/* Article */}
          <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              {post.date && (
                <time className="text-lg text-gray-500">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              )}
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
              />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/**
 * Simple markdown to HTML converter
 * This is a basic implementation - in production you might want to use a proper markdown library
 */
function renderMarkdown(content: string): string {
  // Remove date lines from content before processing
  let html = content
    .replace(/^date:.*$/gm, '') // Remove date lines
    .trim();
  
  html = html
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle lists properly
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${line.substring(2)}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (line) {
        processedLines.push(`<p>${line}</p>`);
      }
    }
  }
  
  if (inList) {
    processedLines.push('</ul>');
  }
  
  return processedLines.join('\n');
}
