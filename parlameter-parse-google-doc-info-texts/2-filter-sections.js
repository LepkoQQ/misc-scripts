import fs from "node:fs";
import path from "node:path";

const inputGlob = fs.globSync("out/sections/section_*.md");
const inputFiles = inputGlob.map((filePath) => {
  const content = fs.readFileSync(path.resolve(filePath), "utf-8");
  return { filePath, content };
});

inputFiles.forEach((file, index) => {
  const inputFile = file.content;

  let lines = inputFile.split("\n");

  function removeEmptyLinesAtStart(lines) {
    let startIndex = 0;
    while (startIndex < lines.length && lines[startIndex].trim() === "") {
      startIndex++;
    }
    return lines.slice(startIndex);
  }

  lines = removeEmptyLinesAtStart(lines);

  function removeFirstLineIfParlameterLink(lines) {
    if (lines.length === 0) return lines;
    const firstLine = lines[0].trim();
    if (firstLine.startsWith("**") && firstLine.endsWith("**")) {
      if (firstLine.includes("https://parlameter.si")) {
        return lines.slice(1);
      }
    }
    return lines;
  }

  lines = removeFirstLineIfParlameterLink(lines);
  lines = removeEmptyLinesAtStart(lines);

  // function removeLinesStartingWithEscapedAsterisk(lines) {
  //   return lines.filter((line) => !line.startsWith("\\*"));
  // }

  // lines = removeLinesStartingWithEscapedAsterisk(lines);
  // lines = removeEmptyLinesAtStart(lines);

  fs.mkdirSync(path.resolve("out/sections-filtered"), { recursive: true });
  const outputFilePath = `out/sections-filtered/section_${index + 1}.md`;
  const outputContent = lines.join("\n").trim();
  fs.writeFileSync(path.resolve(outputFilePath), outputContent, "utf-8");
  console.log(`File written: ${outputFilePath}`);
});
