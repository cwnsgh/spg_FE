/**
 * src 이하 .ts/.tsx 중
 * - Next 앱 라우트 엔트리(page/layout/...)가 아니고
 * - middleware 등 루트 엔트리가 아니며
 * - 다른 파일의 import(상대, @/)로 해석되지 않는 파일 목록
 *
 * 한계: require(), 동적 문자열 조합 import, CSS만 import하는 경우 등은 미검출 가능.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

const ENTRY_NAMES = new Set([
  "middleware.ts",
  "instrumentation.ts",
  "instrumentation.node.ts",
  "instrumentation.edge.ts",
]);

function isNextAppEntryName(base) {
  return (
    base === "page.tsx" ||
    base === "page.ts" ||
    base === "layout.tsx" ||
    base === "layout.ts" ||
    base === "loading.tsx" ||
    base === "loading.ts" ||
    base === "error.tsx" ||
    base === "error.ts" ||
    base === "not-found.tsx" ||
    base === "not-found.ts" ||
    base === "template.tsx" ||
    base === "template.ts" ||
    base === "default.tsx" ||
    base === "default.ts" ||
    base === "route.ts" ||
    base === "route.tsx" ||
    base === "opengraph-image.tsx" ||
    base === "opengraph-image.ts" ||
    base === "twitter-image.tsx" ||
    base === "twitter-image.ts" ||
    base === "icon.tsx" ||
    base === "icon.ts" ||
    base === "apple-icon.tsx" ||
    base === "apple-icon.ts" ||
    base === "sitemap.ts" ||
    base === "robots.ts" ||
    base === "manifest.ts"
  );
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(tsx?)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function toPosixRel(fromRoot, abs) {
  return path.relative(fromRoot, abs).split(path.sep).join("/");
}

function stripExt(p) {
  return p.replace(/\.tsx?$/, "");
}

function collectSpecs(text) {
  const out = new Set();
  const re =
    /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?from\s+)?["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text)) !== null) out.add(m[1]);
  const dyn = /import\s*\(\s*["']([^"']+)["']\s*\)/g;
  while ((m = dyn.exec(text)) !== null) out.add(m[1]);
  return out;
}

function resolveSpecToAbs(spec, fromFileAbs) {
  if (!spec || spec.startsWith("next") || spec === "react" || spec === "react-dom")
    return [];
  if (spec.startsWith("@/")) {
    const rel = spec.slice(2);
    const base = path.join(SRC, rel);
    const hits = [];
    const tryFile = (cand) => {
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) hits.push(path.resolve(cand));
    };
    tryFile(base);
    for (const ext of [".ts", ".tsx"]) tryFile(base + ext);
    if (!hits.length) {
      for (const ext of [".ts", ".tsx"]) {
        tryFile(path.join(base, "index" + ext));
      }
    }
    return hits;
  }
  if (spec.startsWith(".")) {
    const dir = path.dirname(fromFileAbs);
    const raw = path.resolve(dir, spec);
    const hits = [];
    if (fs.existsSync(raw) && fs.statSync(raw).isFile()) hits.push(raw);
    const noExt = stripExt(raw);
    for (const ext of [".ts", ".tsx"]) {
      const cand = noExt + ext;
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) hits.push(cand);
    }
    if (!hits.length && fs.existsSync(noExt) && fs.statSync(noExt).isDirectory()) {
      for (const ext of [".ts", ".tsx"]) {
        const idx = path.join(noExt, "index" + ext);
        if (fs.existsSync(idx) && fs.statSync(idx).isFile()) hits.push(idx);
      }
    }
    return hits;
  }
  return [];
}

const allAbs = walk(SRC);
const relByAbs = new Map(allAbs.map((a) => [a, toPosixRel(SRC, a)]));

const referencedAbs = new Set();

for (const fromAbs of allAbs) {
  const text = fs.readFileSync(fromAbs, "utf8");
  for (const spec of collectSpecs(text)) {
    for (const hit of resolveSpecToAbs(spec, fromAbs)) {
      referencedAbs.add(path.normalize(hit));
    }
  }
}

const unused = [];

for (const abs of allAbs) {
  const rel = relByAbs.get(abs);
  const base = path.basename(rel);
  const parts = rel.split("/");

  if (ENTRY_NAMES.has(base)) continue;

  if (parts[0] === "app" && parts.some((seg) => isNextAppEntryName(seg))) continue;

  const norm = path.normalize(abs);
  if (!referencedAbs.has(norm)) {
    unused.push(rel);
  }
}

unused.sort();
const payload = {
  generated: new Date().toISOString(),
  note: "Next route entries and middleware are excluded. Heuristic; verify before delete.",
  count: unused.length,
  files: unused,
};
console.log(JSON.stringify(payload, null, 2));
