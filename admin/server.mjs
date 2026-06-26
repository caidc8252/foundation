import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize, sep } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const UI = join(HERE, "ui");
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".svg":"image/svg+xml" };
const json = (res, obj, status=200) => { res.writeHead(status, {"content-type":"application/json"}); res.end(JSON.stringify(obj)); };
function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch(e) { reject(e); } });
    req.on("error", reject);
  });
}

export function createHandler() {
  return async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;
    try {
      if (path === "/api/health") return json(res, { ok: true });
      if (path === "/api/components") {
        const { listComponents } = await import("./lib/catalog.mjs");
        return json(res, listComponents());
      }
      if (path === "/api/tokens") {
        const { recipeFor, tokenDict } = await import("./lib/recipe.mjs");
        const layer = url.searchParams.get("layer"), name = url.searchParams.get("name");
        if (layer && name) {
          const recipe = recipeFor(layer, name);
          return recipe ? json(res, recipe) : json(res, { error: "unknown component" }, 404);
        }
        return json(res, tokenDict());
      }
      if (path === "/api/render") {
        const { renderComponent } = await import("./lib/render.mjs");
        res.writeHead(200, {"content-type":"text/html"});
        return res.end(renderComponent(url.searchParams.get("layer"), url.searchParams.get("name")));
      }
      if (path === "/api/value" && req.method === "POST") {
        const { setTokenValue } = await import("./lib/edit.mjs");
        try {
          const { name, value } = await readJson(req);
          if (typeof name !== "string" || !name || typeof value !== "string" || !value) {
            return json(res, { error: "missing required fields name+value" }, 400);
          }
          const result = setTokenValue(name, value);
          return json(res, { ok: true, ...result });
        } catch (e) {
          return json(res, { error: e.message }, 400);
        }
      }
      if (path === "/api/reference" && req.method === "POST") {
        const { repointAlias, setReference } = await import("./lib/edit.mjs");
        try {
          const body = await readJson(req);
          // Alias repoint: { alias, toToken }
          if (body.alias) {
            if (typeof body.alias !== "string" || !body.alias || typeof body.toToken !== "string" || !body.toToken) {
              return json(res, { error: "missing required fields alias+toToken" }, 400);
            }
            const result = repointAlias(body.alias, body.toToken);
            return json(res, { ok: true, ...result });
          }
          // Component reference swap: { layer, selector, prop, fromToken, toToken, pseudo? }
          const { layer, selector, prop, fromToken, toToken, pseudo } = body;
          if (!layer || !selector || !prop || !fromToken || !toToken) {
            return json(res, { error: "missing required fields layer+selector+prop+fromToken+toToken" }, 400);
          }
          const result = setReference({ layer, selector, prop, pseudo, fromToken, toToken });
          return json(res, { ok: true, ...result });
        } catch (e) {
          return json(res, { error: e.message }, 400);
        }
      }
      if (path === "/api/draft/status" && req.method === "GET") {
        const { draftStatus } = await import("./lib/draft.mjs");
        return json(res, draftStatus());
      }
      if (path === "/api/draft/discard" && req.method === "POST") {
        const { discardDraft } = await import("./lib/draft.mjs");
        discardDraft();
        return json(res, { ok: true });
      }
      if (path === "/api/element-recipe") {
        const { recipeForClasses, loadSourcesForRecipe } = await import("./lib/recipe.mjs");
        const classes = (url.searchParams.get("classes") || "").split(",").map(s => s.trim()).filter(Boolean);
        return json(res, { classes, ...recipeForClasses(classes, loadSourcesForRecipe()) });
      }
      // 静态:/ → index.html;/foo.js → ui/foo.js
      // 防目录穿越:new URL(...) 已折叠 `..`(rel 不会逃出 UI);下面 normalize().replace
      // 去前导 `..` 是冗余的纵深防御;真正的边界检查是 `file === UI || startsWith(UI + sep)`。
      const rel = path === "/" ? "index.html" : normalize(path).replace(/^(\.\.[/\\])+/, "").replace(/^\//, "");
      const file = join(UI, rel);
      if ((file === UI || file.startsWith(UI + sep)) && existsSync(file)) {
        res.writeHead(200, {"content-type": MIME[extname(file)] || "application/octet-stream"});
        return res.end(readFileSync(file));
      }
      res.writeHead(404, {"content-type":"text/plain"}); res.end("404");
    } catch (e) {
      res.writeHead(500, {"content-type":"text/plain"}); res.end("500 " + e.message);
    }
  };
}
function start(port = 4100) { createServer(createHandler()).listen(port, () => console.log(`admin → http://localhost:${port}`)); }
if (process.argv[1] && process.argv[1].endsWith("server.mjs")) start(Number(process.env.PORT) || 4100);
