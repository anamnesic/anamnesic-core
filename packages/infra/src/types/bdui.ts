export type BduiSchemaVersion = "bdui/v1"

export type BduiDataExpression = {
  source: "state" | "data" | "context" | "response"
  path: string
  transform?: string
}

export type BduiAction =
  | { type: "navigate"; route: string; params?: Record<string, unknown> }
  | { type: "api"; method: string; path: string; body?: unknown; headers?: Record<string, string> }
  | { type: "command"; command: string; args?: string }
  | { type: "dispatch"; event: string; payload?: Record<string, unknown> }
  | { type: "link"; url: string; external?: boolean }
  | { type: "callback"; name: string; args?: Record<string, unknown> }

export type BduiEventHandlers = {
  onClick?: BduiAction
  onChange?: BduiAction
  onSubmit?: BduiAction
  onFocus?: BduiAction
  onBlur?: BduiAction
  [key: string]: BduiAction | undefined
}

export type BduiCondition = {
  show?: BduiDataExpression
  disabled?: BduiDataExpression
  required?: BduiDataExpression
}

export type BduiDataBinding = {
  source: string
  items?: string
  filter?: string
  sort?: string
  refetchInterval?: number
}

export type BduiStyle = {
  flex?: number | string
  width?: string
  height?: string
  minWidth?: string
  minHeight?: string
  maxWidth?: string
  maxHeight?: string
  padding?: string
  margin?: string
  gap?: string
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "between" | "around"
  wrap?: boolean
  grow?: boolean
  shrink?: boolean
  basis?: string
  class?: string
}

export type BduiComponent = {
  key: string
  type: string
  props?: Record<string, unknown>
  children?: BduiComponent[]
  actions?: BduiEventHandlers
  conditions?: BduiCondition
  data?: BduiDataBinding
  style?: BduiStyle
}

export type BduiLayout = {
  type: "page" | "section" | "dialog" | "panel"
  title?: string
  subtitle?: string
  icon?: string
  children: BduiComponent[]
  navigation?: {
    parent?: string
    breadcrumbs?: { label: string; route?: string }[]
  }
  data?: BduiDataBinding
  actions?: BduiEventHandlers
}

export type BduiPage = {
  schema: BduiSchemaVersion
  layout: BduiLayout
  context?: Record<string, unknown>
  state?: Record<string, unknown>
}

export type BduiComponentRegistration = {
  type: string
  schema: Record<string, unknown>
  defaultProps?: Record<string, unknown>
  category?: string
  description?: string
}

export type BduiGetPageParams = {
  pageId: string
  params?: Record<string, string>
}

export type BduiPageEntry = {
  id: string
  label: string
  icon?: string
}

export type BduiRegistryEntry = {
  pages?: BduiPageEntry[]
  components: BduiComponentRegistration[]
}

export type BduiActionResponse = {
  schema: BduiSchemaVersion
  action: string
  state?: Record<string, unknown>
  toast?: { message: string; severity?: "info" | "success" | "warning" | "error" }
  navigate?: string
  patch?: BduiPatchAction[]
}

export type BduiPatchAction =
  | { op: "replace"; path: string; value: unknown }
  | { op: "remove"; path: string }
  | { op: "add"; path: string; value: unknown }
