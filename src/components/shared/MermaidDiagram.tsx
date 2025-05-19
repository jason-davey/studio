
'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  idSuffix?: string; // Optional suffix for unique IDs if multiple diagrams are rendered close in time
}

// Generate a somewhat unique ID for mermaid rendering
let diagramIdCounter = 0;
const generateId = (suffix?: string) => `mermaid-diagram-${diagramIdCounter++}${suffix ? `-${suffix}` : ''}`;

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, idSuffix }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [diagramId] = useState(() => generateId(idSuffix));

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false, // We will render manually
      theme: 'neutral', // Or 'base', 'forest', 'dark', 'default'
      // You can add more theme variables here if needed
      // e.g., themeVariables: { primaryColor: '#yourColor' }
      securityLevel: 'loose', // Allow HTML in nodes if needed, use with caution
      // logLevel: 'debug', // For debugging mermaid issues
    });
  }, []);

  useEffect(() => {
    if (mermaidRef.current && chart && !hasRendered) {
      // Clear previous content in case of re-renders, though with unique ID this might be less critical
      mermaidRef.current.innerHTML = '';
      try {
        mermaid.render(diagramId, chart, (svgCode, bindFunctions) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svgCode;
            if (bindFunctions) {
              bindFunctions(mermaidRef.current);
            }
            setHasRendered(true); // Prevent re-rendering attempts unless chart changes
          }
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<pre class="text-destructive">Error rendering diagram:\n${(error as Error).message}\n\nEnsure your Mermaid syntax is correct.</pre>`;
        }
      }
    }
  }, [chart, diagramId, hasRendered]);

  // Effect to re-render if chart content changes
  useEffect(() => {
    setHasRendered(false); // Allow re-render if chart prop changes
  }, [chart]);


  // The div needs an ID for mermaid.render, but mermaid.render replaces the content
  // so we use a key on the div for React to replace the whole div if the ID changes
  // or simply rely on hasRendered to control re-execution.
  return (
    <div
      ref={mermaidRef}
      className="mermaid-diagram-container w-full flex justify-center my-4 p-4 border rounded-md bg-muted/20 overflow-auto"
      aria-label="Mermaid diagram"
    >
      {/* Content will be injected by Mermaid */}
      {!hasRendered && <p className="text-muted-foreground">Loading diagram...</p>}
    </div>
  );
};

export default MermaidDiagram;
