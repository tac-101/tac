"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  user: {
    name: string
    avatar?: string
    initials: string
  }
  action: string
  target?: string
  timestamp: string
  type?: 'info' | 'success' | 'warning' | 'error'
  metadata?: Record<string, any>
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  title?: string
  description?: string
  className?: string
  maxItems?: number
}

export function ActivityFeed({ 
  activities, 
  title = "Recent Activity",
  description = "Latest updates and changes",
  className,
  maxItems = 10 
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems)
  
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity, index) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback className="text-xs">
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>
                    {" "}{activity.action}
                    {activity.target && (
                      <span className="font-medium"> {activity.target}</span>
                    )}
                  </p>
                  {activity.type && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getTypeColor(activity.type))}
                    >
                      {activity.type}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <span key={key} className="mr-2">
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
