const path = require("path");
const fs = require("fs");

/** @type {(filename: string, updater: (content: string) => string) => void} */
const cleanDeclaration = (filename, updater) => {
  const file = path.resolve(__dirname, "..", "dist", `${filename}.d.ts`);
  const content = fs.readFileSync(file, "utf-8");
  fs.writeFileSync(file, updater(content), "utf-8");
};

// Delete _state property declaration (internal usage only)
cleanDeclaration("Future", (content) => {
  return content.replace(/ *_state: {.*[^};]};/gs, "");
});
