import type { IncomingMessage, ServerResponse } from "node:http";
import { getActivePluginRegistry } from "../../plugins/runtime.js";
import { resolveBduiAction } from "./bdui-actions.js";
import { getBduiPage, getBduiPageRegistry } from "./bdui-pages.js";

function sendJson(res: ServerResponse, status: number, body: unknown) {
  const data = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json" });
  res.end(data);
}

export function isBduiPath(path: string): boolean {
  return path.startsWith("/ui/");
}

export async function handleBduiHttpRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.pathname;

  const registry = getActivePluginRegistry();
  if (!registry) return false;

  if (path === "/ui/registry" && req.method === "GET") {
    const components = (registry.bduiComponents ?? []).map((entry) => ({
      pluginId: entry.pluginId,
      pluginName: entry.pluginName,
      registration: entry.registration,
    }));
    sendJson(res, 200, { ok: true, pages: getBduiPageRegistry(), components });
    return true;
  }

  if (path === "/ui/action" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    const parsed = JSON.parse(body);
    sendJson(res, 200, resolveBduiAction({ pageId: parsed.pageId, action: parsed.action ?? {}, state: parsed.state ?? {} }));
    return true;
  }

  if (path.startsWith("/ui/page/") && req.method === "GET") {
    const pageId = path.slice("/ui/page/".length).split("/")[0];
    sendJson(res, 200, await getBduiPage(decodeURIComponent(pageId)));
    return true;
  }

  return false;
}
