import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  {
    rules: {
      "semi": "error",
      "no-console": "warn",
      "prefer-destructuring": [
        "error",
        {
          "object": true,
          "array": false
        }
      ],
      "no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "req|res|next|val"
        }
      ]
    }
  }

];