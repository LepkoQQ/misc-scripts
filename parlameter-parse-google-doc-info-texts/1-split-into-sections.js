import fs from "node:fs";
import path from "node:path";

const inputFilePath = "in/novi_teksti.md";
const inputFile = fs.readFileSync(path.resolve(inputFilePath), "utf-8");

const sections = inputFile.split("—");

fs.mkdirSync(path.resolve("out/sections"), { recursive: true });
sections.forEach((section, index) => {
  const outputFilePath = `out/sections/section_${index + 1}.md`;
  fs.writeFileSync(path.resolve(outputFilePath), section.trim(), "utf-8");
  console.log(`File written: ${outputFilePath}`);
});
