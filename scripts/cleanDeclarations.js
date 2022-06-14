const path = require("path");
const fs = require("fs");

/** @type {(name: string, updater: (file: string) => string) => void} */
const cleanDeclaration = (filename, updater) => {
  const filePath = path.resolve(__dirname, "..", "dist", `${filename}.d.ts`);
  const content = fs.readFileSync(filePath, "utf-8");
  fs.writeFileSync(filePath, updater(content), "utf-8");
};

// Delete _state property declaration (internal usage)
cleanDeclaration("Future", (content) => {
  return content.replace(/ *_state: .+;/g, "");
});
