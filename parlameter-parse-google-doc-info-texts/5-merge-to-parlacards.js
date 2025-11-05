import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const inputGlob = fs.globSync("out/cards-formatted/**/*.md");
const inputFiles = inputGlob.map((filePath) => {
  const content = fs.readFileSync(path.resolve(filePath), "utf-8");
  return { filePath, content };
});

inputFiles.forEach((file) => {
  const parlacardsFilePath = file.filePath
    .replace(
      "out/cards-formatted/",
      "/home/miha/Projects/djnd/parlanode/parlacards/cards/_i18n/sl/"
    )
    .replace(".md", ".yaml");
  const parlacardsExists = fs.existsSync(parlacardsFilePath);
  if (!parlacardsExists) {
    throw new Error(`Missing file: ${file.filePath}`);
  }
  const yamlContent = fs.readFileSync(parlacardsFilePath, "utf-8");
  const yamlData = yaml.load(yamlContent);

  assert.strictEqual(typeof yamlData, "object");
  assert.strictEqual(Object.keys(yamlData).length, 1);
  assert.strictEqual(Object.keys(yamlData)[0], "card");
  assert.strictEqual(typeof yamlData.card, "object");

  const lines = file.content.split("\n");
  if (lines.length === 0) {
    return;
  }
  let title = "";
  let firstLineIndex = 0;
  while (
    firstLineIndex < lines.length &&
    (lines[firstLineIndex].trim() === "" ||
      lines[firstLineIndex].startsWith("-- title:"))
  ) {
    if (lines[firstLineIndex].startsWith("-- title:")) {
      title = lines[firstLineIndex].replace("-- title:", "").trim();
    }
    firstLineIndex++;
  }

  // console.log(Object.keys(yamlData.card));
  yamlData.card.info = lines.slice(firstLineIndex).join("\n").trim();
  if (title) {
    yamlData.card.title = title;
  }
  const newYamlContent = yaml.dump(yamlData);
  // console.log(newYamlContent);

  fs.writeFileSync(parlacardsFilePath, newYamlContent, "utf-8");
  console.log(`Updated file: ${parlacardsFilePath}`);
});
