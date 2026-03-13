"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  h4: ({ children }) => (
    <h4 className="text-lg font-semibold mt-8 mb-3 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-base font-semibold mt-6 mb-2 text-slate-800 dark:text-slate-200">
      {children}
    </h5>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 space-y-1.5 list-disc pl-6 text-slate-700 dark:text-slate-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 space-y-1.5 list-decimal pl-6 text-slate-700 dark:text-slate-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sm font-mono text-orange-600 dark:text-orange-400">
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 p-4 rounded-lg bg-slate-900 dark:bg-slate-950 text-sm overflow-x-auto border border-slate-200 dark:border-slate-700">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
      {children}
    </td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 pl-4 border-l-4 border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30 py-2 px-3 rounded-r-lg text-slate-700 dark:text-slate-300">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-slate-200 dark:border-slate-700" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900 dark:text-slate-100">
      {children}
    </strong>
  ),
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
