import simpleImportSort from "eslint-plugin-import";
import tsEslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import react from "eslint-plugin-react";

export default tsEslint.config(
  tsEslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      simpleImportSort,
      react,
    },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/comma-dangle": "off",
      "@typescript-eslint/naming-convention": "off",

      "react/jsx-props-no-spreading": "off",
      "react/require-default-props": "off",
      "react/no-array-index-key": "off",
      "react/react-in-jsx-scope": "off",

      "react/jsx-no-useless-fragment": [
        "error",
        {
          allowExpressions: true,
        },
      ],

      "react/function-component-definition": [
        "error",
        {
          namedComponents: ["function-declaration", "arrow-function"],
          unnamedComponents: "function-expression",
        },
      ],

      "react/no-unstable-nested-components": [
        "error",
        {
          allowAsProps: true,
        },
      ],

      "import/prefer-default-export": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "no-underscore-dangle": "off",
      "no-param-reassign": "off",
      "default-case": "off",
      "no-console": "off",
      "consistent-return": "off",

      "no-restricted-exports": [
        "error",
        {
          restrictedNamedExports: ["then"],
        },
      ],
    },
  },
  prettier,
);
