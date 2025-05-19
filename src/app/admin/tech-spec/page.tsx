
import fs from 'fs';
import path from 'path';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, List } from "lucide-react";
import { TOP_BAR_HEIGHT_PX } from '@/components/layout/TopBar';

// This page is a Server Component by default in Next.js App Router

interface ParsedLine {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'empty' | 'pre'; // Added 'pre' for potential future use
  content: string;
  id?: string; // For ToC linking
}

interface TocEntry {
  id: string;
  text: string;
  level: 1 | 2; // 1 for H1, 2 for H2
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

interface ParseMarkdownResult {
  parsedLines: ParsedLine[];
  tocEntries: TocEntry[];
}

function parseMarkdown(markdown: string): ParseMarkdownResult {
  const lines = markdown.split('\n');
  const parsedLines: ParsedLine[] = [];
  const tocEntries: TocEntry[] = [];
  let headingCounter = 0; // Shared counter for unique IDs

  for (const line of lines) {
    let id: string | undefined;
    // Check for H2: starts with '## ' and not '### '
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      const content = line.substring(3); // Get content after '## '
      id = slugify(content) + `-${headingCounter++}`;
      parsedLines.push({ type: 'h2', content, id });
      tocEntries.push({ id, text: content, level: 2 });
    // Check for H1: starts with '# ' and not '## '
    } else if (line.startsWith('# ') && !line.startsWith('## ')) {
      const content = line.substring(2); // Get content after '# '
      id = slugify(content) + `-${headingCounter++}`;
      parsedLines.push({ type: 'h1', content, id });
      tocEntries.push({ id, text: content, level: 1 });
    // Check for H3: starts with '### '
    } else if (line.startsWith('### ')) {
      const content = line.substring(4); // Get content after '### '
      // H3s are not included in ToC for now, but parsed for rendering
      parsedLines.push({ type: 'h3', content });
    } else if (line.trim() === '') {
      parsedLines.push({ type: 'empty', content: '' });
    } else {
      // Default to paragraph
      parsedLines.push({ type: 'p', content: line });
    }
  }
  return { parsedLines, tocEntries };
}

export default async function AdminTechSpecPage() {
  let specContent: string | null = null;
  let errorMessage: string | null = null;
  let parseResult: ParseMarkdownResult = { parsedLines: [], tocEntries: [] };

  try {
    const filePath = path.join(process.cwd(), 'TECHNICAL_SPEC.md');
    if (fs.existsSync(filePath)) {
      specContent = fs.readFileSync(filePath, 'utf8');
      parseResult = parseMarkdown(specContent);
    } else {
      errorMessage = "TECHNICAL_SPEC.md file not found in the project root. Please ensure it exists.";
      console.error(errorMessage);
    }
  } catch (error: any) {
    console.error("Failed to read or parse TECHNICAL_SPEC.md:", error);
    errorMessage = `Error reading/parsing TECHNICAL_SPEC.md: ${error.message}`;
  }

  const marginTopStyle = {
    marginTop: `${TOP_BAR_HEIGHT_PX}px`,
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8" style={marginTopStyle}>
      <Card className="w-full shadow-lg rounded-lg">
        <CardHeader className="px-6 pt-14 pb-6">
          <CardTitle className="text-2xl font-bold text-primary">Application Technical Specification</CardTitle>
          <CardDescription>
            This document outlines the technical details, architecture, and features of the application.
            It is dynamically read and formatted from <code>TECHNICAL_SPEC.md</code> in the project root.
            A Table of Contents is generated from H1 and H2 headings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Loading Specification</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {parseResult.tocEntries.length > 0 && !errorMessage && (
            <Card className="mb-8 bg-muted/30 p-4 rounded-md">
              <CardHeader className="p-2 pb-3">
                <CardTitle className="text-xl font-semibold text-primary flex items-center">
                  <List className="mr-2 h-5 w-5" />
                  Table of Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ul className="space-y-1 list-none">
                  {parseResult.tocEntries.map((entry) => (
                    <li key={entry.id} className={entry.level === 2 ? 'ml-4' : ''}>
                      <a
                        href={`#${entry.id}`}
                        className="text-sm text-foreground hover:text-primary hover:underline transition-colors"
                      >
                        {entry.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {parseResult.parsedLines.length > 0 && !errorMessage && (
            <ScrollArea className="h-[calc(100vh-30rem)] w-full rounded-md border p-4 bg-muted/50"> {/* Adjusted height for ToC */}
              {parseResult.parsedLines.map((line, index) => {
                if (line.type === 'h1') {
                  return <h1 key={index} id={line.id} className="text-3xl font-bold my-6 pt-2 text-primary scroll-mt-20">{line.content}</h1>;
                } else if (line.type === 'h2') {
                  return <h2 key={index} id={line.id} className="text-2xl font-semibold my-4 pt-2 text-foreground scroll-mt-20">{line.content}</h2>;
                } else if (line.type === 'h3') {
                  return <h3 key={index} className="text-xl font-medium my-3 pt-2 text-foreground scroll-mt-20">{line.content}</h3>;
                } else if (line.type === 'p') {
                  return <p key={index} className="text-base leading-relaxed mb-3 whitespace-pre-wrap">{line.content}</p>;
                } else if (line.type === 'empty') {
                  return <div key={index} className="h-3"></div>; 
                }
                return null;
              })}
            </ScrollArea>
          )}

          {!specContent && !errorMessage && !parseResult.parsedLines.length && (
             <Alert className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>No Content</AlertTitle>
              <AlertDescription>The TECHNICAL_SPEC.md file was found but appears to be empty or could not be parsed and displayed.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

