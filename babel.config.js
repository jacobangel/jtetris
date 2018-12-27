module.exports = {
    "presets": [
      ["@babel/env", {"modules": false}], 
      "@babel/react",
      "@babel/typescript"
    ],
    "env": {
      "test": {
        "presets": [["@babel/env"], "@babel/react"]
      }
    }
  }