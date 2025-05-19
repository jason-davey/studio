
import fs from 'fs';
import path from 'path';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { TOP_BAR_HEIGHT_PX } from '@/components/layout/TopBar';

// This page is a Server Component by default in Next.js App Router

interface ParsedLine {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'empty';
  content: string;
}

function parseMarkdown(markdown: string): ParsedLine[] {
  const lines = markdown.split('\n');
  return lines.map(line => {
    if (line.startsWith('### ')) {
      return { type: 'h3', content: line.substring(4) };
    } else if (line.startsWith('## ')) {
      return { type: 'h2', content: line.substring(3) };
    } else if (line.startsWith('# ')) {
      return { type: 'h1', content: line.substring(2) };
    } else if (line.trim() === '') {
      // Keep empty lines to preserve some spacing, or they can be filtered out
      return { type: 'empty', content: '' };
    } else {
      return { type: 'p', content: line };
    }
  });
}

export default async function AdminTechSpecPage() {
  let specContent: string | null = null;
  let errorMessage: string | null = null;
  let parsedLines: ParsedLine[] = [];

  try {
    const filePath = path.join(process.cwd(), 'TECHNICAL_SPEC.md');
    if (fs.existsSync(filePath)) {
      specContent = fs.readFileSync(filePath, 'utf8');
      parsedLines = parseMarkdown(specContent);
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Loading Specification</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          {parsedLines.length > 0 && !errorMessage && (
            <ScrollArea className="h-[calc(100vh-20rem)] w-full rounded-md border p-4 bg-muted/50">
              {parsedLines.map((line, index) => {
                if (line.type === 'h1') {
                  return <h1 key={index} className="text-3xl font-bold my-6 text-primary">{line.content}</h1>;
                } else if (line.type === 'h2') {
                  return <h2 key={index} className="text-2xl font-semibold my-4 text-foreground">{line.content}</h2>;
                } else if (line.type === 'h3') {
                  return <h3 key={index} className="text-xl font-medium my-3 text-foreground">{line.content}</h3>;
                } else if (line.type === 'p') {
                  // Using whitespace-pre-wrap to respect indentation and line breaks from MD
                  // which is useful for code blocks or pre-formatted text in the MD.
                  return <p key={index} className="text-base leading-relaxed mb-3 whitespace-pre-wrap">{line.content}</p>;
                } else if (line.type === 'empty') {
                  // Render a small break for empty lines, or skip if preferred
                  return <div key={index} className="h-3"></div>; 
                }
                return null;
              })}
            </ScrollArea>
          )}
          {!specContent && !errorMessage && !parsedLines.length && (
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
