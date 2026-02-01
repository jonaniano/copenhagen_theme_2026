import DOMPurify from "dompurify";

/**
 * Allowed HTML tags for sanitizing content from APIs.
 * This list is intentionally restrictive to prevent XSS attacks.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "pre",
  "code",
  "h2",
  "h3",
  "h4",
];

/**
 * Allowed HTML attributes for sanitized content.
 * href is needed for links, target and rel for opening in new tabs safely.
 */
const ALLOWED_ATTR = ["href", "target", "rel"];

/**
 * DOMPurify configuration for sanitizing HTML content from external sources.
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: true,
  RETURN_TRUSTED_TYPE: false,
};

// Add rel="noopener noreferrer" to all links that open in new tabs
// This prevents the new page from accessing window.opener
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    // Add noopener noreferrer to all external links for security
    if (node.hasAttribute("target")) {
      node.setAttribute("rel", "noopener noreferrer");
    }
    // Ensure href only uses safe protocols
    const href = node.getAttribute("href");
    if (href && !/^(https?:|mailto:|tel:|\/)/i.test(href)) {
      node.removeAttribute("href");
    }
  }
});

/**
 * Sanitizes HTML content from external sources (APIs, user input) to prevent XSS attacks.
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for use with dangerouslySetInnerHTML
 *
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} />
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, SANITIZE_CONFIG) as string;
}
