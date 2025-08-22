import { Document, Packer, Paragraph, TextRun } from 'docx';

/**
 * Converts text content to a DOCX file buffer
 */
export async function textToDocx(text: string): Promise<Buffer> {
  // Split text into paragraphs
  const paragraphs = text.split('\n').filter(line => line.trim() !== '');
  
  // Convert paragraphs to DOCX format
  const docxParagraphs = paragraphs.map(line => {
    // Check if this looks like a heading (all caps, shorter line)
    const isHeading = line.length < 100 && line === line.toUpperCase() && line.trim().length > 0;
    
    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          bold: isHeading,
          size: isHeading ? 32 : 24, // Larger font for headings
        }),
      ],
      spacing: {
        after: 200, // Space after each paragraph
      },
    });
  });

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docxParagraphs,
      },
    ],
  });

  // Generate the DOCX buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
