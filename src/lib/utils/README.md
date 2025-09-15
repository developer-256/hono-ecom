# Utility Functions

This directory contains organized utility functions split into specialized modules for better maintainability and discoverability.

## 📁 File Structure

```
utils/
├── index.ts              # Main export file - import everything from here
├── string-utils.ts       # String manipulation utilities
├── async-utils.ts        # Promise handling and async utilities
├── response-utils.ts     # HTTP response standardization
└── README.md            # This documentation
```

## 🚀 Usage

### Recommended Import Method

```typescript
// Import specific utilities you need
import { slugify, HONO_RESPONSE, tryCatch } from "@/lib/utils";

// Or import from specific modules
import { slugify, deSlugify } from "@/lib/utils/string-utils";
import { HONO_ERROR, HONO_RESPONSE } from "@/lib/utils/response-utils";
```

### Backward Compatibility

```typescript
// Still works but deprecated
import { slugify, HONO_ERROR } from "@/lib/utils.ts";
```

## 📚 Available Utilities

### 🔤 String Utilities (`string-utils.ts`)

| Function      | Description                         | Example                                        |
| ------------- | ----------------------------------- | ---------------------------------------------- |
| `slugify`     | Convert string to URL-friendly slug | `slugify("Hello World!")` → `"hello-world"`    |
| `deSlugify`   | Convert slug back to readable title | `deSlugify("hello-world")` → `"Hello World"`   |
| `capitalize`  | Capitalize first letter             | `capitalize("hello")` → `"Hello"`              |
| `toTitleCase` | Convert to title case               | `toTitleCase("hello world")` → `"Hello World"` |
| `truncate`    | Truncate with ellipsis              | `truncate("Long text", 8)` → `"Long..."`       |
| `stripHtml`   | Remove HTML tags                    | `stripHtml("<p>Text</p>")` → `"Text"`          |

### ⏱️ Async Utilities (`async-utils.ts`)

| Function        | Description                                | Example                                               |
| --------------- | ------------------------------------------ | ----------------------------------------------------- |
| `tryCatch`      | Safe promise execution with Result pattern | `await tryCatch(fetch('/api'))`                       |
| `tryCatchSync`  | Safe synchronous execution                 | `tryCatchSync(() => JSON.parse(str))`                 |
| `delay`         | Simple delay function                      | `await delay(1000)`                                   |
| `withTimeout`   | Race promise against timeout               | `await withTimeout(fetch('/api'), 5000)`              |
| `retry`         | Retry with exponential backoff             | `await retry(() => fetch('/api'), { maxRetries: 3 })` |
| `parallelLimit` | Execute with concurrency limit             | `await parallelLimit(urls, fetch, 3)`                 |

### 🌐 Response Utilities (`response-utils.ts`)

| Function                  | Description                           | Example                                      |
| ------------------------- | ------------------------------------- | -------------------------------------------- |
| `HONO_ERROR`              | Create standardized error responses   | `HONO_ERROR("BAD_REQUEST", "Invalid input")` |
| `HONO_RESPONSE`           | Create standardized success responses | `HONO_RESPONSE({ data: user })`              |
| `HONO_PAGINATED_RESPONSE` | Create paginated responses            | `HONO_PAGINATED_RESPONSE(items, pagination)` |
| `isErrorResponse`         | Type guard for error responses        | `if (isErrorResponse(response)) { ... }`     |
| `isSuccessResponse`       | Type guard for success responses      | `if (isSuccessResponse(response)) { ... }`   |

## 🎯 Key Improvements

### Enhanced Error Handling

```typescript
// Old way
try {
  const result = await fetch("/api");
  return result;
} catch (error) {
  console.error(error);
}

// New way with Result pattern
const result = await tryCatch(fetch("/api"));
if (result.success) {
  console.log("Data:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### Better Response Standardization

```typescript
// Enhanced error responses
HONO_ERROR("UNPROCESSABLE_ENTITY", "Validation failed", {
  issues: [
    { message: "Email is required", path: "email", code: "required" },
    { message: "Password too short", path: "password", code: "min_length" },
  ],
  requestId: "req_123456",
});

// Rich success responses
HONO_RESPONSE({
  data: { users, meta: { total: 100 } },
  message: "Users retrieved successfully",
  requestId: "req_123456",
});
```

### Advanced String Processing

```typescript
// Enhanced slugify with options
slugify("Café & Restaurant", {
  maxLength: 15,
  separator: "_",
}); // "cafe_restaurant"

// Smart deSlugify with options
deSlugify("hello-world-title", {
  titleCase: false,
}); // "Hello world title"
```

## 🔧 TypeScript Support

All utilities are fully typed with:

- Proper generic type support
- Comprehensive JSDoc documentation
- Type guards for runtime type checking
- Interface definitions for response structures

## 📖 Migration Guide

If you're migrating from the old `utils.ts` file:

1. **No breaking changes** - existing imports will continue to work
2. **Update imports gradually** to use the new modular structure
3. **Leverage new features** like enhanced error handling and response utilities
4. **Use TypeScript benefits** with improved type safety

## 🤝 Contributing

When adding new utilities:

1. Choose the appropriate module or create a new one
2. Add comprehensive JSDoc documentation
3. Include usage examples
4. Add TypeScript types
5. Update the main `index.ts` export
6. Update this README

---

For more examples and detailed API documentation, check the JSDoc comments in each module file.
