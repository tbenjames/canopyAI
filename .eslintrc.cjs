export default [
  {
    ignores: ["dist", "node_modules"],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
    plugins: {
      react: pluginReact,
      "react-refresh": pluginReactRefresh,
      prettier: pluginPrettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      "prettier/prettier": "error",
      "react-refresh/only-export-components": "warn",
    },
  },
];
