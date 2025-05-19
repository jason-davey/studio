
'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

interface MermaidDiagramProps {
  chart: string;
  idSuffix?: string; // Optional suffix for unique IDs if multiple diagrams are rendered close in time
}

let diagramIdCounter = 0;
const generateId = (suffix?: string) => `mermaid-diagram-${diagramIdCounter++}${suffix ? `-${suffix}` : ''}`;

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, idSuffix }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const diagramId = useMemo(() => generateId(idSuffix), [idSuffix]);

  useEffect(() => {
    if (!chart || !containerRef.current) {
      // If no chart content, or container not ready, do nothing or clear
      if (containerRef.current) {
        containerRef.current.innerHTML = !chart ? '<p class="text-muted-foreground text-sm">No diagram content provided.</p>' : '';
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    // Ensure the container is clean before trying to render a new diagram
    containerRef.current.innerHTML = ''; 

    const renderDiagram = async () => {
      try {
        // Dynamically import Mermaid
        const mermaidModule = await import('mermaid');
        const mermaidAPI = mermaidModule.default; // Access the default export

        if (!mermaidAPI || typeof mermaidAPI.initialize !== 'function' || typeof mermaidAPI.render !== 'function') {
          throw new Error('Mermaid API not found or is invalid after dynamic import.');
        }
        
        mermaidAPI.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
          // logLevel: 'debug', // For debugging
        });

        // Use a unique ID for each diagram render to avoid conflicts
        // const uniqueSvgId = `mermaid-svg-${diagramId}-${Date.now()}`;
        
        const { svg, bindFunctions } = await mermaidAPI.render(diagramId, chart);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          if (bindFunctions) {
            bindFunctions(containerRef.current);
          }
        }
        setIsLoading(false);
      } catch (e: any) {
        console.error('Mermaid rendering error:', e);
        setError(`Failed to render diagram: ${e.message}. Please check Mermaid syntax.`);
        if (containerRef.current) {
            containerRef.current.innerHTML = `<pre class="text-destructive text-xs p-2 bg-destructive/10 rounded-md">Error rendering diagram:\n${e.message}\n\nEnsure your Mermaid syntax is correct in TECHNICAL_SPEC.md.</pre>`;
        }
        setIsLoading(false);
      }
    };

    renderDiagram();

  }, [chart, diagramId]); // Re-run effect if chart content or diagramId changes

  return (
    <div
      className="mermaid-diagram-container w-full flex justify-center my-4 p-4 border rounded-md bg-muted/20 overflow-auto min-h-[100px]"
      aria-label="Mermaid diagram"
    >
      {isLoading && <p className="text-muted-foreground text-sm">Loading diagram...</p>}
      {/* Error is now rendered directly into containerRef by the effect */}
      {/* The ref div is where Mermaid will render */}
      <div ref={containerRef}></div>
    </div>
  );
};

export default MermaidDiagram;
