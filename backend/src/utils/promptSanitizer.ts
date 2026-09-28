/**
 * Repository content (README, issues, comments, source files) is untrusted input.
 * Strip patterns that look like attempts to override system instructions before
 * the text is interpolated into a Groq prompt.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /you\s+are\s+now\s+[a-z0-9 _-]+/gi,
  /system\s*:\s*/gi,
  /\bnew\s+instructions?\s*:/gi,
  /forget\s+(everything|all)\s+(you\s+)?(know|were\s+told)/gi,
  /<\|.*?\|>/g,
  /```(system|assistant)/gi,
];

const MAX_FIELD_LENGTH = 20_000;

export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';

  let sanitized = input;
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[redacted]');
  }

  if (sanitized.length > MAX_FIELD_LENGTH) {
    sanitized = `${sanitized.slice(0, MAX_FIELD_LENGTH)}\n...[truncated]`;
  }

  return sanitized;
}

export function sanitizeRepoContext(context: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => (typeof item === 'string' ? sanitizeText(item) : item));
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
