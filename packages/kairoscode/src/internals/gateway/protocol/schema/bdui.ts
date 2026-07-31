import { Type } from "typebox";

const BduiSchemaVersion = Type.Literal("bdui/v1");

const BduiDataExpressionSchema = Type.Object(
  {
    source: Type.Union([Type.Literal("state"), Type.Literal("data"), Type.Literal("context"), Type.Literal("response")]),
    path: Type.String({ minLength: 1 }),
    transform: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

const BduiActionSchema = Type.Union(
  [
    Type.Object({ type: Type.Literal("navigate"), route: Type.String({ minLength: 1 }), params: Type.Optional(Type.Record(Type.String(), Type.Unknown())) }, { additionalProperties: false }),
    Type.Object({ type: Type.Literal("api"), method: Type.String({ minLength: 1 }), path: Type.String({ minLength: 1 }), body: Type.Optional(Type.Unknown()), headers: Type.Optional(Type.Record(Type.String(), Type.String())) }, { additionalProperties: false }),
    Type.Object({ type: Type.Literal("command"), command: Type.String({ minLength: 1 }), args: Type.Optional(Type.String()) }, { additionalProperties: false }),
    Type.Object({ type: Type.Literal("dispatch"), event: Type.String({ minLength: 1 }), payload: Type.Optional(Type.Record(Type.String(), Type.Unknown())) }, { additionalProperties: false }),
    Type.Object({ type: Type.Literal("link"), url: Type.String({ minLength: 1 }), external: Type.Optional(Type.Boolean()) }, { additionalProperties: false }),
    Type.Object({ type: Type.Literal("callback"), name: Type.String({ minLength: 1 }), args: Type.Optional(Type.Record(Type.String(), Type.Unknown())) }, { additionalProperties: false }),
  ],
);

const BduiConditionSchema = Type.Object(
  {
    show: Type.Optional(BduiDataExpressionSchema),
    disabled: Type.Optional(BduiDataExpressionSchema),
    required: Type.Optional(BduiDataExpressionSchema),
  },
  { additionalProperties: false },
);

const BduiDataBindingSchema = Type.Object(
  {
    source: Type.String({ minLength: 1 }),
    items: Type.Optional(Type.String()),
    filter: Type.Optional(Type.String()),
    sort: Type.Optional(Type.String()),
    refetchInterval: Type.Optional(Type.Integer({ minimum: 0 })),
  },
  { additionalProperties: false },
);

const BduiStyleSchema = Type.Object(
  {
    flex: Type.Optional(Type.Union([Type.Integer(), Type.String()])),
    width: Type.Optional(Type.String()),
    height: Type.Optional(Type.String()),
    minWidth: Type.Optional(Type.String()),
    minHeight: Type.Optional(Type.String()),
    maxWidth: Type.Optional(Type.String()),
    maxHeight: Type.Optional(Type.String()),
    padding: Type.Optional(Type.String()),
    margin: Type.Optional(Type.String()),
    gap: Type.Optional(Type.String()),
    align: Type.Optional(Type.Union([Type.Literal("start"), Type.Literal("center"), Type.Literal("end"), Type.Literal("stretch")])),
    justify: Type.Optional(Type.Union([Type.Literal("start"), Type.Literal("center"), Type.Literal("end"), Type.Literal("between"), Type.Literal("around")])),
    wrap: Type.Optional(Type.Boolean()),
    grow: Type.Optional(Type.Boolean()),
    shrink: Type.Optional(Type.Boolean()),
    basis: Type.Optional(Type.String()),
    class: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const BduiComponentSchema = Type.Cyclic(
  {
    BduiComponent: Type.Object(
      {
        key: Type.String({ minLength: 1 }),
        type: Type.String({ minLength: 1 }),
        props: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
        children: Type.Optional(Type.Array(Type.Ref("BduiComponent"))),
        actions: Type.Optional(
          Type.Object(
            {
              onClick: Type.Optional(BduiActionSchema),
              onChange: Type.Optional(BduiActionSchema),
              onSubmit: Type.Optional(BduiActionSchema),
              onFocus: Type.Optional(BduiActionSchema),
              onBlur: Type.Optional(BduiActionSchema),
            },
            { additionalProperties: false },
          ),
        ),
        conditions: Type.Optional(BduiConditionSchema),
        data: Type.Optional(BduiDataBindingSchema),
        style: Type.Optional(BduiStyleSchema),
      },
      { additionalProperties: false },
    ),
  },
  "BduiComponent",
);

export const BduiLayoutSchema = Type.Object(
  {
    type: Type.Union([Type.Literal("page"), Type.Literal("section"), Type.Literal("dialog"), Type.Literal("panel")]),
    title: Type.Optional(Type.String()),
    subtitle: Type.Optional(Type.String()),
    icon: Type.Optional(Type.String()),
    children: Type.Array(BduiComponentSchema),
    navigation: Type.Optional(
      Type.Object(
        {
          parent: Type.Optional(Type.String()),
          breadcrumbs: Type.Optional(
            Type.Array(
              Type.Object({ label: Type.String(), route: Type.Optional(Type.String()) }, { additionalProperties: false }),
            ),
          ),
        },
        { additionalProperties: false },
      ),
    ),
    data: Type.Optional(BduiDataBindingSchema),
    actions: Type.Optional(
      Type.Object(
        {
          onClick: Type.Optional(BduiActionSchema),
          onChange: Type.Optional(BduiActionSchema),
          onSubmit: Type.Optional(BduiActionSchema),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const BduiPageSchema = Type.Object(
  {
    schema: BduiSchemaVersion,
    layout: BduiLayoutSchema,
    context: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    state: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  },
  { additionalProperties: false },
);

export const BduiComponentRegistrationSchema = Type.Object(
  {
    type: Type.String({ minLength: 1 }),
    schema: Type.Record(Type.String(), Type.Unknown()),
    defaultProps: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    category: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const BduiRegistrySchema = Type.Object(
  {
    pages: Type.Optional(
      Type.Array(
        Type.Object(
          {
            id: Type.String({ minLength: 1 }),
            label: Type.String({ minLength: 1 }),
            icon: Type.Optional(Type.String()),
          },
          { additionalProperties: false },
        ),
      ),
    ),
    components: Type.Array(BduiComponentRegistrationSchema),
  },
  { additionalProperties: false },
);

export const BduiGetPageParamsSchema = Type.Object(
  {
    pageId: Type.String({ minLength: 1 }),
    params: Type.Optional(Type.Record(Type.String(), Type.String())),
  },
  { additionalProperties: false },
);

export const BduiGetPageResultSchema = Type.Union([BduiPageSchema, Type.Object({ error: Type.String() }, { additionalProperties: false })]);

export const BduiActionResponseSchema = Type.Object(
  {
    schema: BduiSchemaVersion,
    action: Type.String({ minLength: 1 }),
    state: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    toast: Type.Optional(
      Type.Object(
        {
          message: Type.String(),
          severity: Type.Optional(Type.Union([Type.Literal("info"), Type.Literal("success"), Type.Literal("warning"), Type.Literal("error")])),
        },
        { additionalProperties: false },
      ),
    ),
    navigate: Type.Optional(Type.String()),
    patch: Type.Optional(
      Type.Array(
        Type.Union(
          [
            Type.Object({ op: Type.Literal("replace"), path: Type.String(), value: Type.Unknown() }, { additionalProperties: false }),
            Type.Object({ op: Type.Literal("remove"), path: Type.String() }, { additionalProperties: false }),
            Type.Object({ op: Type.Literal("add"), path: Type.String(), value: Type.Unknown() }, { additionalProperties: false }),
          ],
        ),
      ),
    ),
  },
  { additionalProperties: false },
);

export const BduiRegistryParamsSchema = Type.Object({}, { additionalProperties: false });

export const BduiActionParamsSchema = Type.Object(
  {
    pageId: Type.String({ minLength: 1 }),
    action: BduiActionSchema,
    state: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  },
  { additionalProperties: false },
);
