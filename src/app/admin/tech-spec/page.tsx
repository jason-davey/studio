
import fs from 'fs';
import path from 'path';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, List } from "lucide-react";
import { TOP_BAR_HEIGHT_PX } from '@/components/layout/TopBar';

interface ParsedLine {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'empty'; // h1 for '## section' & '# title', h2 for '### subsection'
  content: string;
  id?: string;
}

interface TocEntry {
  id: string;
  text: string;
  level: 1 | 2; // Level 1 for '## section', Level 2 for '### subsection'
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-');      // Replace multiple - with single -
}

interface ParseMarkdownResult {
  parsedLines: ParsedLine[];
  tocEntries: TocEntry[];
}

function parseMarkdown(markdown: string): ParseMarkdownResult {
  const lines = markdown.split('\n');
  const parsedLines: ParsedLine[] = [];
  const tocEntries: TocEntry[] = [];
  let headingCounter = 0; // For unique IDs

  for (const line of lines) {
    const trimmedLine = line.trim();
    let content = trimmedLine;
    let type: ParsedLine['type'] | null = null;
    let tocLevel: TocEntry['level'] | null = null;
    let id: string | undefined;

    // Check for ### (user's intended H2 for ToC and styling)
    if (trimmedLine.startsWith('### ')) {
      content = trimmedLine.substring(4);
      type = 'h2'; // Render as H2 style
      tocLevel = 2; // This is a level 2 item in the ToC
    } 
    // Else, check for ## (user's intended H1 for ToC and styling)
    else if (trimmedLine.startsWith('## ')) {
      content = trimmedLine.substring(3);
      type = 'h1'; // Render as H1 style
      tocLevel = 1; // This is a level 1 item in the ToC
    } 
    // Else, check for # (a main document title, not part of the ##/### ToC sections)
    else if (trimmedLine.startsWith('# ')) {
      content = trimmedLine.substring(2);
      type = 'h1'; // Render as H1 style
      // Not added to tocEntries for this specific user request
    } 
    // Else, handle paragraphs and empty lines
    else if (trimmedLine === '') {
      type = 'empty';
      content = '';
    } else {
      type = 'p';
      content = line; // Use original line for paragraphs to preserve leading spaces for pre-wrap
    }

    // Generate ID if it's any kind of heading that will be rendered with an ID
    if (type === 'h1' || type === 'h2' || type === 'h3') { // h3 added in case of future use or direct # parsing
      id = slugify(content) + `-${headingCounter++}`;
    }
    
    // Add to parsedLines and tocEntries based on detected type and tocLevel
    if (tocLevel === 1 || tocLevel === 2) {
      // For lines that go into ToC (## and ###)
      parsedLines.push({ type: type as 'h1' | 'h2', content, id: id! });
      tocEntries.push({ id: id!, text: content, level: tocLevel as 1 | 2 });
    } else if (type === 'h1' && !tocLevel) { 
      // For lines that are just '#' (main document title, styled as H1 but not in this ToC)
      parsedLines.push({ type: 'h1', content, id: id! });
    } else if (type === 'h3' && !tocLevel) {
      // For lines that are '###' but somehow not caught as tocLevel 2 (should not happen with current logic but defensive)
      // or if we decide to style raw '###' not part of ToC differently
      parsedLines.push({ type: 'h3', content, id: id! });
    }
     else if (type === 'p' || type === 'empty') {
      parsedLines.push({ type, content });
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
            A Table of Contents is generated from H2 (##) and H3 (###) headings.
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
            <ScrollArea className="h-[calc(100vh-30rem)] w-full rounded-md border p-4 bg-muted/50">
              {parseResult.parsedLines.map((line, index) => {
                const key = `${line.type}-${index}-${line.id || 'no-id'}`;
                // Note: line.type 'h1' now corresponds to '##' markdown, and 'h2' to '###' markdown for styling
                if (line.type === 'h1') { 
                  return <h1 key={key} id={line.id} className="text-3xl font-bold my-6 pt-2 text-primary scroll-mt-20">{line.content}</h1>;
                } else if (line.type === 'h2') {
                  return <h2 key={key} id={line.id} className="text-2xl font-semibold my-4 pt-2 text-foreground scroll-mt-20">{line.content}</h2>;
                } else if (line.type === 'h3') { // This style is for any raw '###' not caught by the ToC mapping to h2, or if we decide to map some other Markdown to H3 style.
                  return <h3 key={key} id={line.id} className="text-xl font-medium my-3 pt-2 text-foreground scroll-mt-20">{line.content}</h3>;
                } else if (line.type === 'p') {
                  return <p key={key} className="text-base leading-relaxed mb-3 whitespace-pre-wrap">{line.content}</p>;
                } else if (line.type === 'empty') {
                  return <div key={key} className="h-3"></div>; 
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

