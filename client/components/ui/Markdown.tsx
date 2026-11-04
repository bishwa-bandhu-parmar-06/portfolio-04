import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders admin-written Markdown. Raw HTML is never rendered (react-markdown
 * ignores it without rehype-raw), and links are limited to http(s)/mailto.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 text-base leading-relaxed text-muted [&_a]:text-primary-text [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-card [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-text [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-text [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-secondary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // http(s), mailto, in-page anchors and site-relative paths only (not protocol-relative "//host").
        urlTransform={(url) => (/^(https?:|mailto:|#|\/(?!\/))/i.test(url) ? url : '')}
        components={{
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
              {children}
            </a>
          ),
          h1: ({ children }) => <h3>{children}</h3>,
          h2: ({ children }) => <h3>{children}</h3>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
