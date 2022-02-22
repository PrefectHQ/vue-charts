export default {
  "root": true,
  "env": {
    "node": true
  },
  "extends": ["@prefecthq"],
  "globals": {
    "defineProps": "readonly",
    "defineEmits": "readonly"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "tsconfigRootDir": __dirname,
    "project": ["./tsconfig.json"]
  },
  "settings": {
    "import/resolver": {
      "typescript": {
        "project": "./tsconfig.json"
      }
    }
  },
  "rules": {
    "import/no-default-export": "error"
  }
}