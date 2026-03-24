import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"

type EmptyStateCardProps = {
  composer: ReactNode
}

export const EmptyStateCard = ({ composer }: EmptyStateCardProps) => (
  <Card>
    <CardHeader className="items-center space-y-2 text-center">
      <CardTitle className="text-xl font-semibold tracking-tight">
        Welcome to SMAI
      </CardTitle>
      <div className="text-sm text-muted-foreground">
        Ask anything or pick a chat from the sidebar to continue.
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="mx-auto flex w-full max-w-xl justify-center">
        {composer}
      </div>
    </CardContent>
  </Card>
)
