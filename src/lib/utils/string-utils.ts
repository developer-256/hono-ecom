/**
 * String utility functions for text manipulation and transformation
 */

/**
 * Converts a string into a URL-friendly slug by:
 * - Converting to lowercase
 * - Removing special characters (keeping alphanumeric, spaces, and hyphens)
 * - Replacing spaces and consecutive whitespace with single hyphens
 * - Removing consecutive hyphens
 * - Trimming leading/trailing hyphens
 * - Supporting Unicode characters for international content
 *
 * @param str - The input string to convert to a slug
 * @param options - Optional configuration for slug generation
 * @param options.maxLength - Maximum length of the generated slug (default: unlimited)
 * @param options.separator - Character to use as separator (default: '-')
 * @returns A URL-friendly slug string
 *
 * @example
 * slugify("Hello World!") // "hello-world"
 * slugify("  Multiple   Spaces  ") // "multiple-spaces"
 * slugify("Special@#$Characters") // "specialcharacters"
 * slugify("Café & Restaurant", { maxLength: 10 }) // "cafe-resta"
 * slugify("Hello World", { separator: "_" }) // "hello_world"
 * slugify("") // ""
 * slugify("   ") // ""
 */
export const slugify = (
  str: string,
  options: { maxLength?: number; separator?: string } = {}
): string => {
  if (!str || typeof str !== "string") {
    return "";
  }

  const { maxLength, separator = "-" } = options;

  // Normalize Unicode characters and remove diacritics
  let slug = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric chars (keep spaces and hyphens)
    .replace(/\s+/g, separator) // Replace spaces with separator
    .replace(new RegExp(`${separator}+`, "g"), separator) // Remove consecutive separators
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), ""); // Remove leading/trailing separators

  // Apply length limit if specified
  if (maxLength && slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Ensure we don't cut off in the middle of a word
    const lastSeparator = slug.lastIndexOf(separator);
    if (lastSeparator > maxLength * 0.7) {
      slug = slug.substring(0, lastSeparator);
    }
  }

  return slug;
};

/**
 * Converts a slug back into a human-readable title by:
 * - Splitting on separators
 * - Capitalizing the first letter of each word
 * - Joining words with spaces
 * - Handling edge cases for empty strings and invalid input
 * - Supporting custom separator detection
 *
 * @param slug - The slug string to convert back to a title
 * @param options - Optional configuration for title generation
 * @param options.separator - Character used as separator (default: auto-detect)
 * @param options.titleCase - Whether to use title case or just capitalize first word (default: true)
 * @returns A human-readable title string
 *
 * @example
 * deSlugify("hello-world") // "Hello World"
 * deSlugify("multiple-word-title") // "Multiple Word Title"
 * deSlugify("hello_world", { separator: "_" }) // "Hello World"
 * deSlugify("hello-world", { titleCase: false }) // "Hello world"
 * deSlugify("single") // "Single"
 * deSlugify("") // ""
 * deSlugify("--empty--parts--") // ""
 */
export const deSlugify = (
  slug: string,
  options: { separator?: string; titleCase?: boolean } = {}
): string => {
  if (!slug || typeof slug !== "string") {
    return "";
  }

  const { separator, titleCase = true } = options;

  // Auto-detect separator if not provided
  const detectedSeparator = separator || (slug.includes("_") ? "_" : "-");

  const words = slug
    .split(detectedSeparator)
    .filter((part) => part.length > 0) // Remove empty parts
    .map((word, index) => {
      if (word.length === 0) return "";

      if (titleCase || index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    });

  return words.join(" ").trim();
};

/**
 * Capitalizes the first letter of a string
 *
 * @param str - The string to capitalize
 * @returns String with first letter capitalized
 *
 * @example
 * capitalize("hello world") // "Hello world"
 * capitalize("") // ""
 * capitalize("a") // "A"
 */
export const capitalize = (str: string): string => {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to title case (capitalizes first letter of each word)
 *
 * @param str - The string to convert to title case
 * @param options - Optional configuration
 * @param options.excludeWords - Words to exclude from capitalization (articles, prepositions, etc.)
 * @returns String in title case
 *
 * @example
 * toTitleCase("hello world") // "Hello World"
 * toTitleCase("the quick brown fox") // "The Quick Brown Fox"
 * toTitleCase("the quick brown fox", { excludeWords: ["the", "of", "and"] }) // "The Quick Brown Fox"
 */
export const toTitleCase = (
  str: string,
  options: { excludeWords?: string[] } = {}
): string => {
  if (!str || typeof str !== "string") {
    return "";
  }

  const { excludeWords = [] } = options;
  const excludeSet = new Set(excludeWords.map((word) => word.toLowerCase()));

  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      // Always capitalize first word, or if it's not in exclude list
      if (index === 0 || !excludeSet.has(word)) {
        return capitalize(word);
      }
      return word;
    })
    .join(" ");
};

/**
 * Truncates a string to a specified length and adds ellipsis
 *
 * @param str - The string to truncate
 * @param maxLength - Maximum length including ellipsis
 * @param ellipsis - String to append when truncated (default: "...")
 * @returns Truncated string with ellipsis if needed
 *
 * @example
 * truncate("This is a long string", 10) // "This is..."
 * truncate("Short", 10) // "Short"
 * truncate("Custom ellipsis", 10, "…") // "Custom el…"
 */
export const truncate = (
  str: string,
  maxLength: number,
  ellipsis: string = "..."
): string => {
  if (!str || typeof str !== "string") {
    return "";
  }

  if (str.length <= maxLength) {
    return str;
  }

  const truncatedLength = maxLength - ellipsis.length;
  if (truncatedLength <= 0) {
    return ellipsis.substring(0, maxLength);
  }

  return str.substring(0, truncatedLength) + ellipsis;
};

/**
 * Removes HTML tags from a string
 *
 * @param str - The string containing HTML tags
 * @returns String with HTML tags removed
 *
 * @example
 * stripHtml("<p>Hello <strong>world</strong></p>") // "Hello world"
 * stripHtml("No tags here") // "No tags here"
 */
export const stripHtml = (str: string): string => {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str.replace(/<[^>]*>/g, "").trim();
};
