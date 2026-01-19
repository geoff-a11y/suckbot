/**
 * Generate PDF files from simulation sample sessions
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";
import { generatePDF } from "../src/lib/generatePDF";

const outputDir = join(process.cwd(), "simulation-output");
const pdfDir = join(outputDir, "pdfs");

// Create PDF directory
try {
  mkdirSync(pdfDir, { recursive: true });
} catch (e) {
  // Directory might exist
}

// Find all sample session files
const files = readdirSync(outputDir).filter(f => f.startsWith("sample-") && f.endsWith(".json"));

console.log(`Found ${files.length} sample session files\n`);

files.forEach((file, index) => {
  console.log(`Generating PDF ${index + 1}/${files.length}: ${file}`);

  const sessionPath = join(outputDir, file);
  const sessionData = JSON.parse(readFileSync(sessionPath, "utf-8"));

  // Generate PDF
  const pdfBase64 = generatePDF(sessionData);

  // Convert base64 to buffer and save
  const pdfBuffer = Buffer.from(pdfBase64, "base64");
  const pdfFilename = file.replace(".json", ".pdf");
  const pdfPath = join(pdfDir, pdfFilename);

  writeFileSync(pdfPath, pdfBuffer);
  console.log(`  Saved: ${pdfFilename}`);
});

console.log(`\nAll PDFs generated in: ${pdfDir}`);
