import { readFile } from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

export interface ParsedResume {
  filename: string;
  content: string;
  sections: {
    [key: string]: string;
  };
}

/**
 * Parse a PDF file using GPT-4o vision API
 */
async function parsePDF(filePath: string): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const fileBuffer = await readFile(filePath);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract all the text content from this resume PDF. Return only the raw text content without any formatting or additional commentary. Preserve the structure and sections as they appear in the document."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${fileBuffer.toString('base64')}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return content;
  } catch (error) {
    console.error(`Error parsing PDF ${filePath}:`, error);
    throw new Error(`Failed to parse PDF: ${filePath}`);
  }
}

/**
 * Parse a DOCX file and extract text content
 */
async function parseDOCX(filePath: string): Promise<string> {
  try {
    // Import the existing DOCX parser
    const { parseDocx } = await import('./parse-docx');
    const result = await parseDocx(filePath);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.text;
  } catch (error) {
    console.error(`Error parsing DOCX ${filePath}:`, error);
    throw new Error(`Failed to parse DOCX: ${filePath}`);
  }
}

/**
 * Extract sections from resume text
 */
function extractSections(content: string): { [key: string]: string } {
  const sections: { [key: string]: string } = {};
  
  // Common section headers to look for
  const sectionHeaders = [
    'education',
    'experience',
    'employment',
    'work experience',
    'leadership',
    'extracurriculars',
    'activities',
    'projects',
    'skills',
    'interests',
    'certifications',
    'awards',
    'publications',
    'volunteer'
  ];

  const lines = content.split('\n').map(line => line.trim());
  let currentSection = 'header';
  let currentContent: string[] = [];

  for (const line of lines) {
    if (!line) continue;

    // Check if this line is a section header
    const isSectionHeader = sectionHeaders.some(header => 
      line.toLowerCase().includes(header) && line.length < 50
    );

    if (isSectionHeader) {
      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      
      // Start new section
      currentSection = line.toLowerCase().replace(/[^a-z\s]/g, '').trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Save the last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * Parse a resume file (PDF or DOCX) and extract structured content
 */
export async function parseResumeFile(filePath: string): Promise<ParsedResume> {
  const filename = path.basename(filePath);
  const extension = path.extname(filePath).toLowerCase();
  
  let content: string;
  
  if (extension === '.pdf') {
    content = await parsePDF(filePath);
  } else if (extension === '.docx') {
    content = await parseDOCX(filePath);
  } else {
    throw new Error(`Unsupported file type: ${extension}`);
  }

  const sections = extractSections(content);

  return {
    filename,
    content: content.trim(),
    sections
  };
}

/**
 * Parse multiple resume files and return structured data
 */
export async function parseResumeFiles(filePaths: string[]): Promise<ParsedResume[]> {
  const results: ParsedResume[] = [];
  
  for (const filePath of filePaths) {
    try {
      const parsed = await parseResumeFile(filePath);
      results.push(parsed);
    } catch (error) {
      console.error(`Failed to parse ${filePath}:`, error);
      // Continue with other files
    }
  }
  
  return results;
}