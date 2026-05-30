import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

export default function MarkdownRenderer({ text }: MarkdownRendererProps) {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-3 font-sans text-sm md:text-base leading-relaxed text-slate-300">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Headings: ### Title
        if (trimmed.startsWith('###')) {
          const content = trimmed.replace(/^###\s*/, '');
          return (
            <h4 key={idx} className="text-lg font-bold text-emerald-400 font-display mt-4 tracking-tight border-b border-slate-800 pb-1">
              {renderBoldText(content)}
            </h4>
          );
        }

        // Headings: ## Title
        if (trimmed.startsWith('##')) {
          const content = trimmed.replace(/^##\s*/, '');
          return (
            <h3 key={idx} className="text-xl font-extrabold text-emerald-300 font-display mt-5 border-b border-emerald-500/20 pb-2">
              {renderBoldText(content)}
            </h3>
          );
        }

        // Headings: # Title
        if (trimmed.startsWith('#')) {
          const content = trimmed.replace(/^#\s*/, '');
          return (
            <h2 key={idx} className="text-2xl font-black text-emerald-200 font-display mt-6 mb-2">
              {renderBoldText(content)}
            </h2>
          );
        }

        // Item lists: * or -
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const content = trimmed.replace(/^[*|-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-3">
              <span className="text-emerald-500 font-bold mt-1 select-none">▪</span>
              <p className="flex-1 text-slate-300">{renderBoldText(content)}</p>
            </div>
          );
        }

        // Check list item standard numbers: 1. or 2.
        if (/^\d+\.\s*/.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s*/, '');
          const num = trimmed.match(/^\d+/)?.[0] || '1';
          return (
            <div key={idx} className="flex items-start gap-2 pl-3">
              <span className="text-emerald-400 font-mono font-bold">{num}.</span>
              <p className="flex-1 text-slate-300">{renderBoldText(content)}</p>
            </div>
          );
        }

        // Simple text
        return (
          <p key={idx} className="text-slate-300 text-sm md:text-base">
            {renderBoldText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Inline parser for **bold text**
function renderBoldText(str: string): React.ReactNode[] {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const cleaned = part.slice(2, -2);
      return <strong key={index} className="font-semibold text-white bg-slate-800/40 px-1 rounded">{cleaned}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}
