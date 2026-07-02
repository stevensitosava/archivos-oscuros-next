/**
 * Serialize a value for injection into a <script type="application/ld+json">
 * block. JSON.stringify escapes quotes/backslashes but NOT `<`, `>` or `&`, so a
 * DB-sourced string containing `</script>` would break out of the tag and run as
 * HTML. Escaping those three to their \uXXXX form keeps the JSON valid for
 * JSON-LD parsers while making a script breakout impossible.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
