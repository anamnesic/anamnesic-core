import { useParams } from "@solidjs/router"
import { useServer } from "@/context/server"
import { BduiPage } from "@/bdui/page"

export default function ManagementBduiPage() {
  const params = useParams()
  const server = useServer()

  return (
    <div style={{ "max-width": "900px" }}>
      <BduiPage basePath={server.current?.http.url ?? ""} pageId={params.pageId} />
    </div>
  )
}
