import { getActivePluginRegistry } from "../../plugins/runtime.js";
import { resolveBduiAction } from "../server/bdui-actions.js";
import { getBduiPage, getBduiPageRegistry } from "../server/bdui-pages.js";
import {
  ErrorCodes,
  errorShape,
  formatValidationErrors,
  validateBduiActionParams,
  validateBduiGetPageParams,
  validateBduiRegistryParams,
} from "../protocol/index.js";
import type { GatewayRequestHandlers } from "./types.js";

export const bduiHandlers: GatewayRequestHandlers = {
  "bdui.registry": ({ params, respond }) => {
    if (!validateBduiRegistryParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid bdui.registry params: ${formatValidationErrors(validateBduiRegistryParams.errors)}`,
        ),
      );
      return;
    }
    const components = (getActivePluginRegistry()?.bduiComponents ?? []).map((entry) => ({
      pluginId: entry.pluginId,
      pluginName: entry.pluginName,
      registration: entry.registration,
    }));
    respond(true, { ok: true, pages: getBduiPageRegistry(), components }, undefined);
  },
  "bdui.getPage": async ({ params, respond }) => {
    if (!validateBduiGetPageParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid bdui.getPage params: ${formatValidationErrors(validateBduiGetPageParams.errors)}`,
        ),
      );
      return;
    }
    respond(true, await getBduiPage(params.pageId), undefined);
  },
  "bdui.action": ({ params, respond }) => {
    if (!validateBduiActionParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid bdui.action params: ${formatValidationErrors(validateBduiActionParams.errors)}`,
        ),
      );
      return;
    }
    respond(true, resolveBduiAction(params), undefined);
  },
};
