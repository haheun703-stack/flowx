import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // fetch()는 HTTP 에러에서 throw하지 않음 → fetchJson() 사용 강제
      // 2026-03-26: bare fetch 사용으로 프로덕션 장애 발생하여 추가
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='json'][callee.object.callee.name='fetch']",
          message: "fetch().json() 직접 사용 금지. shared/lib/fetchJson 의 fetchJson()을 사용하세요. (fetch는 HTTP 에러에서 throw하지 않음)",
        },
        {
          selector: "MemberExpression[property.name='json'][object.callee.name='fetch']",
          message: "fetch().json() 직접 사용 금지. shared/lib/fetchJson 의 fetchJson()을 사용하세요.",
        },
      ],
    },
  },
]);

export default eslintConfig;
