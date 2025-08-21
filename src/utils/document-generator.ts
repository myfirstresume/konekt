import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { readFileSync } from 'fs';
import { join } from 'path';
import mammoth from 'mammoth';
import OpenAI from 'openai';

export interface DocumentFormat {
  type: 'docx' | 'pdf';
  mimeType: string;
  extension: string;
}

export const DOCUMENT_FORMATS: Record<string, DocumentFormat> = {
  docx: {
    type: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: 'docx'
  },
  pdf: {
    type: 'pdf',
    mimeType: 'application/pdf',
    extension: 'pdf'
  }
};

/**
 * Converts resume text to DOCX format using the template
 */
export async function generateDocx(resumeText: string): Promise<Buffer> {
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Read the template file and extract its content
    const templatePath = join(process.cwd(), 'public', 'template', 'sample_resume.docx');
    const templateBuffer = readFileSync(templatePath);
    
    // Extract text from the template to understand its structure
    const templateResult = await mammoth.extractRawText({ buffer: templateBuffer });
    const templateText = templateResult.value;
    
    // Create a prompt for the LLM to fill in the template
    const fillTemplatePrompt = `
You are a professional resume writer. I have a resume template and the actual resume content. Please fill in the template with the resume content while maintaining the template's formatting and structure.

TEMPLATE STRUCTURE:
${templateText}

ACTUAL RESUME CONTENT:
${resumeText}

INSTRUCTIONS:
- Fill in the template with the actual resume content
- Maintain the template's formatting, structure, and layout
- Keep the same sections and headings as the template
- Replace placeholder content with the actual resume information
- Ensure the content flows naturally and professionally
- IMPORTANT: If you see "S" characters in the template, these represent minimal spacing between sections - keep them as "S" in your output
- Return the complete filled-in resume as plain text
- Do not add any markdown formatting or explanations

FILLED-IN RESUME:
`;

    // Call OpenAI to fill in the template
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer who fills in templates with actual content while maintaining formatting and structure.',
        },
        {
          role: 'user',
          content: fillTemplatePrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const filledResumeText = completion.choices[0]?.message?.content;
    
    if (!filledResumeText) {
      throw new Error('No response from OpenAI');
    }

    // Clean up the response
    let cleanResumeText = filledResumeText.trim();
    
    // Remove markdown code blocks if present
    if (cleanResumeText.startsWith('```')) {
      cleanResumeText = cleanResumeText.replace(/^```\w*\s*/, '');
    }
    if (cleanResumeText.endsWith('```')) {
      cleanResumeText = cleanResumeText.replace(/\s*```$/, '');
    }
    
    // Replace standalone "S" characters (preceded and followed by newline) with minimal spacing
    cleanResumeText = cleanResumeText.replace(/\nS\n/g, '\n');

    // Generate DOCX from the filled-in content
    return generateBasicDocx(cleanResumeText);
    
  } catch (error) {
    console.error('Error generating DOCX from template:', error);
    
    // Fallback to the original generation method
    console.log('Falling back to basic DOCX generation...');
    return generateBasicDocx(resumeText);
  }
}

/**
 * Fallback method: Converts resume text to DOCX format from scratch
 */
async function generateBasicDocx(resumeText: string): Promise<Buffer> {
  // Parse the resume text into sections
  const lines = resumeText.split('\n').filter(line => line.trim());
  const children: Paragraph[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      // Empty line - add minimal spacing
      children.push(new Paragraph({ spacing: { after: 120 } }));
      continue;
    }
    
    // Determine if this is a heading (all caps, short line)
    const isHeading = trimmedLine === trimmedLine.toUpperCase() && 
                     trimmedLine.length < 50 && 
                     !trimmedLine.includes('•') &&
                     !trimmedLine.includes('@') &&
                     !trimmedLine.includes('+');
    
    if (isHeading) {
      // This is a section heading
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              size: 20, // 10pt equivalent (20 * 0.5)
              bold: true
            })
          ],
          spacing: { before: 240, after: 120 }, // Reduced spacing
          alignment: AlignmentType.LEFT
        })
      );
    } else if (trimmedLine.startsWith('•')) {
      // This is a bullet point
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              size: 20 // 10pt equivalent
            })
          ],
          spacing: { before: 60, after: 60 }, // Reduced spacing
          alignment: AlignmentType.LEFT,
          indent: { left: 720 } // 0.5 inch indent
        })
      );
    } else if (trimmedLine.includes('@') || trimmedLine.includes('+')) {
      // This is contact information
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              size: 20 // 10pt equivalent
            })
          ],
          spacing: { before: 60, after: 60 }, // Reduced spacing
          alignment: AlignmentType.CENTER
        })
      );
    } else {
      // Regular text
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              size: 20 // 10pt equivalent
            })
          ],
          spacing: { before: 60, after: 60 }, // Reduced spacing
          alignment: AlignmentType.LEFT
        })
      );
    }
  }
  
  // Create the document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 720, // 0.5 inch
            right: 720,
            bottom: 720,
            left: 720
          }
        }
      },
      children
    }]
  });
  
  // Generate the buffer
  return await Packer.toBuffer(doc);
}

/**
 * Converts resume text to PDF format using HTML conversion
 */
export async function generatePdf(resumeText: string): Promise<Buffer> {
  // For now, we'll use a simple HTML conversion
  // In a production environment, you might want to use a more sophisticated PDF library
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.4;
          margin: 1in;
          color: #000;
        }
        .heading {
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-top: 20pt;
          margin-bottom: 10pt;
          border-bottom: 1pt solid #000;
          padding-bottom: 5pt;
        }
        .contact {
          text-align: center;
          margin-bottom: 20pt;
        }
        .bullet {
          margin-left: 0.5in;
          margin-bottom: 6pt;
        }
        .section {
          margin-bottom: 15pt;
        }
      </style>
    </head>
    <body>
      ${resumeText.split('\n').map(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return '<br>';
        
        const isHeading = trimmedLine === trimmedLine.toUpperCase() && 
                         trimmedLine.length < 50 && 
                         !trimmedLine.includes('•') &&
                         !trimmedLine.includes('@') &&
                         !trimmedLine.includes('+');
        
        if (isHeading) {
          return `<div class="heading">${trimmedLine}</div>`;
        } else if (trimmedLine.startsWith('•')) {
          return `<div class="bullet">${trimmedLine}</div>`;
        } else if (trimmedLine.includes('@') || trimmedLine.includes('+')) {
          return `<div class="contact">${trimmedLine}</div>`;
        } else {
          return `<div>${trimmedLine}</div>`;
        }
      }).join('')}
    </body>
    </html>
  `;
  
  // For now, return a simple text-based PDF
  // In a real implementation, you'd use puppeteer or another PDF library
  // This is a placeholder that would need to be implemented with proper PDF generation
  throw new Error('PDF generation not yet implemented. Please use DOCX format.');
}
