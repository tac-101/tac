"use client"

import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface QuickAction {
  title: string
  description?: string
  icon: LucideIcon
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: boolean
  badge?: string
}

interface QuickActionsProps {
  actions: QuickAction[]
  title?: string
  description?: string
  className?: string
  layout?: 'grid' | 'list'
  columns?: 2 | 3 | 4
}

export function QuickActions({ 
  actions, 
  title = "Quick Actions",
  description = "Common tasks and shortcuts",
  className,
  layout = 'grid',
  columns = 3
}: QuickActionsProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {layout === 'grid' ? (
          <div className={cn("grid gap-4", gridCols[columns])}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                <div className="relative">
                  <action.icon className="h-6 w-6" />
                  {action.badge && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {action.badge}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  {action.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'ghost'}
                className="w-full justify-start h-auto p-3"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <action.icon className="h-5 w-5" />
                    {action.badge && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    {action.description && (
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
        {actions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No actions available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
