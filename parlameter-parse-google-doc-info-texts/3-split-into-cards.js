import fs from "node:fs";
import path from "node:path";

const inputGlob = fs.globSync("out/sections-filtered/section_*.md");
const inputFiles = inputGlob.map((filePath) => {
  const content = fs.readFileSync(path.resolve(filePath), "utf-8");
  return { filePath, content };
});

inputFiles.forEach((file, index) => {
  const inputFile = file.content;
  const sections = [];
  let nextIsTitle = false;
  let lastTitle = null;

  let lines = inputFile.split("\n");
  lines.forEach((line) => {
    if (nextIsTitle) {
      if (line.trim() === "") {
        return;
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        lastTitle = line.slice(2, -2).trim();
      } else if (line.startsWith("[")) {
        if (line.includes("https://parlacards-slovenija.lb.djnd.si")) {
          const cardName = /https:\/\/.*?\/([a-z0-9-]+\/[a-z0-9-]+)\//.exec(
            line
          );
          sections.push({
            cardName: cardName ? cardName[1] : null,
            lines: [],
            title: lastTitle,
          });
          nextIsTitle = false;
        } else {
          throw new Error(`Unexpected link in line: ${line}`);
        }
      } else {
        if (sections.length === 0) {
          console.log(
            `**Expected link line after asterisk comment, got: ${line}`
          );
        } else {
          throw new Error(
            `Expected link line after asterisk comment, got: ${line}`
          );
        }
      }
      return;
    }

    if (line.startsWith("\\*")) {
      nextIsTitle = true;
      lastTitle = null;
    } else if (line.startsWith("[")) {
      throw new Error(`Unexpected link in line: ${line}`);
    } else {
      sections.at(-1)?.lines.push(line);
    }
  });

  sections.forEach((section) => {
    const outputFilePath = `out/cards/${section.cardName}.md`;
    const outputDir = path.dirname(outputFilePath);
    fs.mkdirSync(path.resolve(outputDir), { recursive: true });
    let outputContent = section.lines.join("\n").trim();
    if (section.title) {
      outputContent = `-- title: ${section.title}\n\n${outputContent}`;
    }
    fs.writeFileSync(path.resolve(outputFilePath), outputContent, "utf-8");
    console.log(`File written: ${outputFilePath}`);
  });
});
