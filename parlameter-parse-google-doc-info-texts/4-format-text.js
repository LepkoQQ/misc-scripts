import fs from "node:fs";
import path from "node:path";
import wrap from "word-wrap";

const inputGlob = fs.globSync("out/cards/**/*.md");
const inputFiles = inputGlob.map((filePath) => {
  const content = fs.readFileSync(path.resolve(filePath), "utf-8");
  return { filePath, content };
});

inputFiles.forEach((file) => {
  const inputFile = file.content;

  let lines = inputFile.split("\n");
  if (lines.length === 0) {
    return;
  }
  if (
    lines.length === 1 &&
    (lines[0].trim() === "*/*" || lines[0].trim() === "/")
  ) {
    return;
  }

  const numBoldedLines = lines.filter((line) => line.startsWith("**")).length;
  if (numBoldedLines === 0) {
    // noop
  } else {
    let firstLineIndex = 0;
    while (
      firstLineIndex < lines.length &&
      (lines[firstLineIndex].trim() === "" ||
        lines[firstLineIndex].startsWith("-- title:"))
    ) {
      firstLineIndex++;
    }

    let firstLine = lines[firstLineIndex].trim();
    if (firstLine.startsWith("**") && firstLine.endsWith("**")) {
      firstLine = firstLine.slice(2, -2).trim();
      lines[firstLineIndex] = `# ${firstLine}`;
    }

    if (numBoldedLines > 1) {
      if (lines.at(-1).startsWith("**")) {
        throw new Error(`File has bolded line at end: ${file.filePath}`);
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.replaceAll("...", "…");
    lines[i] = line;
  }

  let outputContent = lines.join("\n").trim();
  // NOTE: not needed: wrapping is handled by yaml in next step
  // outputContent = wrap(outputContent, {
  //   width: 80 - 4,
  //   indent: "    ",
  //   trim: true,
  // });

  const outputFilePath = file.filePath.replace(
    "out/cards/",
    "out/cards-formatted/"
  );
  const outputDir = path.dirname(outputFilePath);
  fs.mkdirSync(path.resolve(outputDir), { recursive: true });
  fs.writeFileSync(path.resolve(outputFilePath), outputContent, "utf-8");
  console.log(`File written: ${outputFilePath}`);
});
