import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export interface DashboardStats {
    totalShipments: number;
    activeShipments?: number;
    activeCustomers: number;
    pendingInvoices: number;
    warehouseCapacity: number;
    exceptionsThisWeek: number;
    shipmentsTrend: number;
    customersTrend: number;
    invoicesTrend: number;
    capacityTrend: number;
    exceptionsTrend: number;
}

export function SectionCards({ stats }: { stats: DashboardStats }) {
    // Default values to prevent crash if stats is undefined
    const data = stats || {
        totalShipments: 0,
        activeShipments: 0,
        activeCustomers: 0,
        pendingInvoices: 0,
        warehouseCapacity: 0,
        exceptionsThisWeek: 0,
        shipmentsTrend: 0,
        customersTrend: 0,
        invoicesTrend: 0,
        capacityTrend: 0,
        exceptionsTrend: 0,
    };

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

            {/* Total Shipments */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Total Shipments</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {data.totalShipments.toLocaleString()}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            {data.shipmentsTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                            {data.shipmentsTrend > 0 && "+"}{data.shipmentsTrend}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {data.activeShipments} Active <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Volume for the last 30 days
                    </div>
                </CardFooter>
            </Card>

            {/* Warehouse Capacity */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Warehouse Capacity</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {data.warehouseCapacity}%
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className={data.warehouseCapacity > 85 ? "bg-destructive/10 text-destructive" : ""}>
                            {data.capacityTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                            {data.capacityTrend > 0 && "+"}{data.capacityTrend}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Utilization <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Capacity needs optimization
                    </div>
                </CardFooter>
            </Card>

            {/* Pending Invoices */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Pending Invoices</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {data.pendingInvoices}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconTrendingDown />
                            {data.invoicesTrend > 0 && "+"}{data.invoicesTrend}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Awaiting Payment <IconTrendingDown className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Financial health check</div>
                </CardFooter>
            </Card>

            {/* Exceptions */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Exceptions</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {data.exceptionsThisWeek}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className={data.exceptionsThisWeek > 0 ? "bg-red-500/10 text-red-500" : ""}>
                            <IconTrendingUp />
                            {data.exceptionsTrend > 0 && "+"}{data.exceptionsTrend}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Critical Alerts <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Requires immediate attention</div>
                </CardFooter>
            </Card>

        </div>
    )
}
