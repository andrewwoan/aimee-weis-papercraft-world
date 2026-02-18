import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// --- CONFIGURATION ---
const INPUT_DIR = process.argv[2] || "./raw_assets";
const OUTPUT_JSX_DIR = process.argv[3] || "./Experience/models";
const OUTPUT_GLB_DIR = process.argv[4] || "./public/models";

const TEXTURE_PATH_PREFIX = "/textures/";
const MODEL_PATH_PREFIX = "/models/";
const UTILS_IMPORT_PATH = "../utils/ktxLoader";

if (!fs.existsSync(OUTPUT_JSX_DIR))
  fs.mkdirSync(OUTPUT_JSX_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_GLB_DIR))
  fs.mkdirSync(OUTPUT_GLB_DIR, { recursive: true });

const files = fs
  .readdirSync(INPUT_DIR)
  .filter(
    (file) => path.extname(file) === ".glb" && !file.includes("-transformed"),
  );

files.forEach((file) => {
  const fileNameNoExt = path.parse(file).name;
  const inputFile = path.join(INPUT_DIR, file);
  const tempJsxFile = `${fileNameNoExt}.jsx`;
  const tempGlbFile = `${fileNameNoExt}-transformed.glb`;
  const finalJsxPath = path.join(OUTPUT_JSX_DIR, tempJsxFile);
  const finalGlbPath = path.join(OUTPUT_GLB_DIR, tempGlbFile);

  try {
    console.log(`\n📦 Processing: ${file}`);
    // Using -T (transform), -j (instance objects), -M (minify)
    execSync(`npx gltfjsx "${inputFile}" -T -j -M`, { stdio: "inherit" });

    if (fs.existsSync(tempGlbFile)) {
      fs.renameSync(tempGlbFile, finalGlbPath);
    }

    let content = fs.readFileSync(tempJsxFile, "utf-8");
    let lines = content.split("\n");
    let newLines = [];

    let importsAdded = false;
    let hooksAdded = false;
    let currentActiveTextureNum = "1";
    let activeMeshName = null; // Track the current node across multiple lines

    // Prepare Texture Hooks
    const textureHooks = [];
    for (let i = 1; i <= 4; i++) {
      textureHooks.push(
        `  const texture_${i} = useTexture("${TEXTURE_PATH_PREFIX}${fileNameNoExt}_${i}.webp");`,
      );
    }

    for (let line of lines) {
      // A. Import Fix
      if (
        !importsAdded &&
        (line.includes("import React") || line.includes("import {"))
      ) {
        newLines.push(`import { useTexture } from "${UTILS_IMPORT_PATH}";`);
        importsAdded = true;
      }

      // B. Export Default Fix
      if (line.includes("export function Model")) {
        line = line.replace(
          "export function Model",
          "export default function Model",
        );
      }

      // C. Model Path Fix
      if (line.includes(`/${fileNameNoExt}-transformed.glb`)) {
        line = line.replace(
          `/${fileNameNoExt}-transformed.glb`,
          `${MODEL_PATH_PREFIX}${fileNameNoExt}-transformed.glb`,
        );
      }

      // D. Inject Hooks
      if (!hooksAdded && line.includes("const { nodes, materials }")) {
        newLines.push(line);
        newLines.push("", ...textureHooks, "");
        hooksAdded = true;
        continue;
      }

      // E. MESH DETECTION (Multi-line safe)
      // Look for the node name in the geometry line
      const geoMatch = line.match(/geometry=\{nodes\.(.+?)\.geometry\}/);
      if (geoMatch) {
        activeMeshName = geoMatch[1];

        // Handle your specific Texture Number Logic
        const escapedName = fileNameNoExt.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        const precisionRegex = new RegExp(`${escapedName}_([1-4])`);
        const numMatch = activeMeshName.match(precisionRegex);

        if (numMatch) {
          currentActiveTextureNum = numMatch[1];
        }
      }

      // F. TRANSFORMATION REPLACEMENT
      // Only run if we've identified which node this mesh belongs to
      if (activeMeshName) {
        if (line.includes("position={")) {
          line = line.replace(
            /position=\{[^}]+\}/,
            `position={nodes.${activeMeshName}.position}`,
          );
        }
        if (line.includes("rotation={")) {
          line = line.replace(
            /rotation=\{[^}]+\}/,
            `rotation={nodes.${activeMeshName}.rotation}`,
          );
        }
        if (line.includes("scale={")) {
          line = line.replace(
            /scale=\{[^}]+\}/,
            `scale={nodes.${activeMeshName}.scale}`,
          );
        }
      }

      // G. Material Replacement
      if (line.includes("material={")) {
        line = line.replace(
          /material=\{[^}]+\}/,
          `material={texture_${currentActiveTextureNum}}`,
        );
      }

      // H. RESET STATE
      // Once we hit the end of a mesh tag, stop applying the activeMeshName
      if (line.includes("/>")) {
        activeMeshName = null;
      }

      newLines.push(line);
    }

    fs.writeFileSync(finalJsxPath, newLines.join("\n"));
    if (fs.existsSync(tempJsxFile)) fs.unlinkSync(tempJsxFile);
    console.log(`🚀 Generated: ${finalJsxPath}`);
  } catch (err) {
    console.error(`❌ Error in ${file}:`, err.message);
  }
});
