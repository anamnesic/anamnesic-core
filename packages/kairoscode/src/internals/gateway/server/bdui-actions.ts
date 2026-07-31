import { type Static } from "typebox";
import { BduiActionParamsSchema, BduiActionResponseSchema } from "../protocol/schema/bdui.js";

type BduiActionParams = Static<typeof BduiActionParamsSchema>;
type BduiActionResponse = Static<typeof BduiActionResponseSchema>;
type BduiAction = BduiActionParams["action"];
type PageDispatchHandlers = Record<string, (state: Record<string, unknown>) => BduiActionResponse>;

const pageDispatchHandlers: Record<string, PageDispatchHandlers> = {
  overview: {
    reload: () => ({
      schema: "bdui/v1",
      action: "reload",
      toast: { message: "Overview reloaded", severity: "info" },
    }),
  },
};

export function resolveBduiAction(params: BduiActionParams): BduiActionResponse {
  const action: BduiAction = params.action;
  const state = params.state ?? {};

  if (action.type === "navigate") {
    return { schema: "bdui/v1", action: "navigate", navigate: action.route };
  }

  if (action.type === "dispatch") {
    const handler = pageDispatchHandlers[params.pageId]?.[action.event];
    if (handler) return handler(state);
    return {
      schema: "bdui/v1",
      action: action.event,
      toast: { message: `No handler for ${params.pageId}:${action.event}`, severity: "warning" },
    };
  }

  return { schema: "bdui/v1", action: action.type };
}
