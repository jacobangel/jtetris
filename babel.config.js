module.exports = {
    "presets": [["@babel/env", {"modules": false}], "@babel/react"],
    "env": {
      "test": {
        "presets": [["@babel/env"], "@babel/react"]
      }
    }
  }