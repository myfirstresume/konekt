import { readFileSync } from 'fs';
import { join } from 'path';
import mammoth from 'mammoth';

interface DocxTextExtraction {
  text: string;
  error?: string;
}

/**
 * Extracts text content from a DOCX file using mammoth library
 * This provides much better parsing than the basic regex approach
 */
export async function parseDocx(filePath: string): Promise<DocxTextExtraction> {
  try {
    // Read the DOCX file as a buffer
    const fileBuffer = readFileSync(filePath);
    
    // Use mammoth to extract text from the DOCX
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    
    if (result.messages.length > 0) {
      console.warn('Mammoth parsing warnings:', result.messages);
    }
    
    return { text: result.value };
  } catch (error) {
    console.error('Error parsing DOCX file:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Unknown error parsing DOCX file' 
    };
  }
}

/**
 * Gets the sample resume text from the public directory
 * Falls back to a default sample if the file can't be parsed
 */
export async function getSampleResumeText(): Promise<string> {
  try {
    const publicDir = join(process.cwd(), 'public');
    const sampleResumePath = join(publicDir, 'data', 'sample_resume.docx');
    
    const result = await parseDocx(sampleResumePath);
    
    if (result.error || !result.text) {
      console.warn('Failed to parse sample resume, using fallback text');
      return getFallbackResumeText();
    }
    
    return result.text;
  } catch (error) {
    console.warn('Error reading sample resume file, using fallback text:', error);
    return getFallbackResumeText();
  }
}

/**
 * Fallback resume text if DOCX parsing fails
 */
function getFallbackResumeText(): string {
  return `John Doe
Software Engineer
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and Python. Proven track record of delivering high-quality software solutions and leading technical teams.

WORK EXPERIENCE
Senior Software Engineer | Tech Corp | 2021-Present
• Led development of customer-facing dashboard that improved user engagement by 25%
• Managed team of 4 developers and mentored junior engineers
• Implemented CI/CD pipeline reducing deployment time by 60%

Software Engineer | Startup Inc | 2019-2021
• Developed RESTful APIs using Node.js and Express
• Collaborated with product team to define requirements and deliver features
• Participated in code reviews and maintained code quality standards

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2019

SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java
Frameworks: React, Node.js, Express, Django
Tools: Git, Docker, AWS, Jenkins`;
}
