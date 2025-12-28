"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	CheckCircle2,
	GripVertical,
	Loader2,
	MoreVertical,
	Plus,
	TrendingUp,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const shipmentSchema = z.object({
	id: z.number(),
	shipment_ref: z.string(),
	customer_name: z.string(),
	origin: z.string(),
	destination: z.string(),
	status: z.enum(["pending", "in_transit", "delivered", "cancelled"]),
	weight: z.number(),
	created_at: z.string(),
});

type Shipment = z.infer<typeof shipmentSchema>;

// Drag handle component
function DragHandle({ id }: { id: number }) {
	const { attributes, listeners } = useSortable({ id });

	return (
		<Button
			{...attributes}
			{...listeners}
			variant="ghost"
			size="icon"
			className="text-muted-foreground size-7 hover:bg-transparent cursor-grab"
		>
			<GripVertical className="size-3" />
			<span className="sr-only">Drag to reorder</span>
		</Button>
	);
}

// Status badge component
function StatusBadge({ status }: { status: Shipment["status"] }) {
	const config = {
		pending: { icon: Loader2, className: "text-chart-3" },
		in_transit: { icon: Loader2, className: "text-primary animate-spin" },
		delivered: { icon: CheckCircle2, className: "text-chart-2" },
		cancelled: { icon: CheckCircle2, className: "text-destructive" },
	};

	const { icon: Icon, className } = config[status];

	return (
		<Badge variant="outline" className="gap-1 capitalize">
			<Icon className={`size-3 ${className}`} />
			{status.replace("_", " ")}
		</Badge>
	);
}

// Drawer for shipment details
function ShipmentDrawer({ shipment }: { shipment: Shipment }) {
	return (
		<Drawer direction="right">
			<DrawerTrigger asChild>
				<Button variant="link" className="text-foreground w-fit px-0 text-left font-mono">
					{shipment.shipment_ref}
				</Button>
			</DrawerTrigger>
			<DrawerContent className="h-full w-[400px] right-0 left-auto">
				<DrawerHeader>
					<DrawerTitle className="font-heading text-2xl">{shipment.shipment_ref}</DrawerTitle>
					<DrawerDescription>
						Shipment details and tracking information
					</DrawerDescription>
				</DrawerHeader>
				<div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
					<div className="rounded-lg border p-4 bg-muted/50">
						<div className="flex items-center gap-2 font-medium mb-2">
							<TrendingUp className="size-4" />
							Shipment Progress
						</div>
						<div className="h-2 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-primary transition-all"
								style={{
									width:
										shipment.status === "delivered"
											? "100%"
											: shipment.status === "in_transit"
												? "60%"
												: shipment.status === "pending"
													? "20%"
													: "0%",
								}}
							/>
						</div>
					</div>
					<Separator />
					<form className="flex flex-col gap-4">
						<div className="flex flex-col gap-3">
							<Label htmlFor="customer">Customer</Label>
							<Input
								id="customer"
								defaultValue={shipment.customer_name}
								readOnly
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-3">
								<Label htmlFor="origin">Origin</Label>
								<Input id="origin" defaultValue={shipment.origin} />
							</div>
							<div className="flex flex-col gap-3">
								<Label htmlFor="destination">Destination</Label>
								<Input id="destination" defaultValue={shipment.destination} />
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-3">
								<Label htmlFor="weight">Weight (kg)</Label>
								<Input
									id="weight"
									type="number"
									defaultValue={shipment.weight}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<Label htmlFor="status">Status</Label>
								<Select defaultValue={shipment.status}>
									<SelectTrigger id="status">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="in_transit">In Transit</SelectItem>
										<SelectItem value="delivered">Delivered</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</form>
				</div>
				<DrawerFooter>
					<Button onClick={() => toast.success("Shipment updated")}>
						Save Changes
					</Button>
					<DrawerClose asChild>
						<Button variant="outline">Close</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

// Column definitions
const columns: ColumnDef<Shipment>[] = [
	{
		id: "drag",
		header: () => null,
		cell: ({ row }) => <DragHandle id={row.original.id} />,
	},
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value: boolean) =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "shipment_ref",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
		cell: ({ row }) => <ShipmentDrawer shipment={row.original} />,
		enableHiding: false,
	},
	{
		accessorKey: "customer_name",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
		cell: ({ row }) => (
			<span className="font-medium text-foreground">{row.original.customer_name}</span>
		),
	},
	{
		accessorKey: "origin",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
	},
	{
		accessorKey: "destination",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Destination" />,
	},
	{
		accessorKey: "status",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
		cell: ({ row }) => <StatusBadge status={row.original.status} />,
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "weight",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Weight" />,
		cell: ({ row }) => (
			<div className="font-mono">{row.original.weight} kg</div>
		),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="size-8">
						<MoreVertical className="size-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-32">
					<DropdownMenuItem
						onClick={() => toast.info(`Editing ${row.original.shipment_ref}`)}
					>
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem>Duplicate</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive"
						onClick={() => toast.error(`Deleted ${row.original.shipment_ref}`)}
					>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];

// Draggable row component
function DraggableRow({ row }: { row: Row<Shipment> }) {
	const { transform, transition, setNodeRef, isDragging } = useSortable({
		id: row.original.id,
	});

	return (
		<TableRow
			data-state={row.getIsSelected() && "selected"}
			data-dragging={isDragging}
			ref={setNodeRef}
			className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
			}}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);
}

// Main DataTable component
interface ShipmentsDataTableProps {
	data: Shipment[];
	initialFilter?: string;
	initialStatus?: Shipment["status"];
}

export function ShipmentsDataTable({
	data: initialData,
	initialFilter,
	initialStatus,
}: ShipmentsDataTableProps) {
	const [data, setData] = React.useState(() => initialData);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {}),
	);

	const dataIds = React.useMemo<UniqueIdentifier[]>(
		() => data?.map(({ id }) => id) || [],
		[data],
	);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	React.useEffect(() => {
		if (initialFilter) {
			table.getColumn("shipment_ref")?.setFilterValue(initialFilter);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialFilter, table.getColumn]);

	React.useEffect(() => {
		if (initialStatus) {
			table.getColumn("status")?.setFilterValue(initialStatus);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialStatus, table.getColumn]);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			setData((data) => {
				const oldIndex = dataIds.indexOf(active.id);
				const newIndex = dataIds.indexOf(over.id);
				return arrayMove(data, oldIndex, newIndex);
			});
		}
	}

	return (
		<div className="w-full flex flex-col gap-4">
			{/* Toolbar */}
			<div className="flex flex-col gap-4 px-4 lg:px-6">
				<div className="flex items-center justify-between">
					<Tabs
						defaultValue="all"
						className="w-full max-w-xl"
						onValueChange={(value) => {
							if (value === "all") {
								table.getColumn("status")?.setFilterValue(undefined);
							} else {
								table.getColumn("status")?.setFilterValue([value]);
							}
						}}
					>
						<TabsList className="grid w-full grid-cols-5">
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="pending">Pending</TabsTrigger>
							<TabsTrigger value="in_transit">Transit</TabsTrigger>
							<TabsTrigger value="delivered">Delivered</TabsTrigger>
							<TabsTrigger value="cancelled">Cancelled</TabsTrigger>
						</TabsList>
					</Tabs>
					<div className="flex items-center gap-2">
						<DataTableViewOptions table={table} />
						<Button variant="default" size="sm">
							<Plus className="size-4 mr-2" />
							Add Shipment
						</Button>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Input
						placeholder="Filter shipments..."
						value={
							(table.getColumn("shipment_ref")?.getFilterValue() as string) ?? ""
						}
						onChange={(e) =>
							table.getColumn("shipment_ref")?.setFilterValue(e.target.value)
						}
						className="max-w-sm bg-background/50 backdrop-blur-sm"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-lg border mx-4 lg:mx-6 shadow-sm bg-card/50 backdrop-blur-sm">
				<DndContext
					collisionDetection={closestCenter}
					modifiers={[restrictToVerticalAxis]}
					onDragEnd={handleDragEnd}
					sensors={sensors}
				>
					<Table>
						<TableHeader className="bg-muted/50">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								<SortableContext
									items={dataIds}
									strategy={verticalListSortingStrategy}
								>
									{table.getRowModel().rows.map((row) => (
										<DraggableRow key={row.id} row={row} />
									))}
								</SortableContext>
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										<div className="flex flex-col items-center justify-center gap-2 py-8">
											<div className="rounded-full bg-muted p-2">
												<TrendingUp className="size-6 text-muted-foreground" />
											</div>
											<h3 className="font-heading font-medium text-lg">No Results Found</h3>
											<p className="text-muted-foreground text-sm max-w-sm text-center">
												We couldn't find any shipments matching your filters. Try adjusting your search query.
											</p>
											<Button
												variant="outline"
												size="sm"
												className="mt-4"
												onClick={() => table.resetColumnFilters()}
											>
												Reset Filters
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</DndContext>
			</div>

			{/* Pagination */}
			<div className="px-4 lg:px-6">
				<DataTablePagination table={table} />
			</div>
		</div>
	);
}

export default ShipmentsDataTable;
