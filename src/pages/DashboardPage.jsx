/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import useAuth from "@/hooks/useAuth";
import axios from "axios";
import {
  Clock,
  TruckIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  PlusCircle,
  Search,
  FileText,
  Info,
  Thermometer,
} from "lucide-react";
import { MaterialReactTable } from "material-react-table";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusMapping = {
  0: "Completed",
  1: "Incomplete",
  2: "Waiting",
  3: "New",
};

const statusStyles = {
  0: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  1: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  2: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  3: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
};

const statusIcons = {
  0: CheckCircle2,
  1: AlertTriangle,
  2: Clock3,
  3: PlusCircle,
};

export default function DashboardPage() {
  const [outboundData, setOutboundData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { auth } = useAuth();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://integration.eastlandfood.com/efc/cargo-inspection/outbounds", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        withCredentials: true,
      }
      );
      setOutboundData(response.data);
    } catch (error) {
      console.error("Error fetching outbounds: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on active tab and search term.
  const filteredData = useMemo(() => {
    let filtered = [...outboundData];

    if (activeTab !== "all") {
      if (activeTab === "require_attention") {
        // Abnormal when require_attention equals 0
        filtered = filtered.filter((item) => item.require_attention === 1);
      } else if (activeTab === "temp_exc") {
        // Abnormal when temp_exc equals 0
        filtered = filtered.filter((item) => item.temp_exc === 1);
      } else {
        const statusNumber = Object.keys(statusMapping).find(
          (key) => statusMapping[key].toLowerCase() === activeTab.toLowerCase()
        );
        if (statusNumber) {
          filtered = filtered.filter(
            (item) => item.outbound_status === parseInt(statusNumber, 10)
          );
        }
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.route_number.toLowerCase().includes(term) ||
          item.route_name.toLowerCase().includes(term) ||
          item.driver.toLowerCase().includes(term) ||
          item.site.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [outboundData, activeTab, searchTerm]);

  // Calculate statistics including abnormal statuses.
  const stats = useMemo(() => {
    return {
      total: outboundData.length,
      completed: outboundData.filter((item) => item.outbound_status === 0)
        .length,
      incomplete: outboundData.filter((item) => item.outbound_status === 1)
        .length,
      waiting: outboundData.filter((item) => item.outbound_status === 2).length,
      new: outboundData.filter((item) => item.outbound_status === 3).length,
      requireAttention: outboundData.filter(
        (item) => item.require_attention === 1
      ).length,
      tempExc: outboundData.filter((item) => item.temp_exc === 1).length,
    };
  }, [outboundData]);

  // Define columns for Material React Table.
  const columns = useMemo(
    () => [
      {
        accessorKey: "route_number",
        header: "Route #",
        Cell: ({ row }) => (
          <div className="font-medium">{row.original.route_number}</div>
        ),
        size: 100,
      },
      {
        accessorKey: "route_name",
        header: "Route Name",
        size: 150,
      },
      {
        accessorKey: "site",
        header: "Site",
        size: 80,
        filterVariant: "select",
        filterSelectOptions: ["MD", "SC", "IL"],
        muiFilterTextFieldProps: { style: { minWidth: "120px" } },
        Cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{row.original.site}</span>
          </div>
        ),
      },
      {
        accessorKey: "delivery_date",
        header: "Delivery Date",
        Cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            {format(new Date(row.original.delivery_date), "MMM d, yyyy")}
          </div>
        ),
        size: 130,
      },
      {
        accessorKey: "driver",
        header: "Driver",
        Cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <TruckIcon className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.driver}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "load_info",
        id: "inspector",
        header: "Inspector",
        Cell: ({ row }) => {
          const loadInfo = JSON.parse(row.original.load_info);
          return <div>{loadInfo.inspectorName || "—"}</div>;
        },
        size: 120,
      },
      {
        accessorKey: "load_info",
        id: "inspectionDate",
        header: "Inspection Date",
        Cell: ({ row }) => {
          const loadInfo = JSON.parse(row.original.load_info);
          return loadInfo.inspectionDateTime ? (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {format(new Date(loadInfo.inspectionDateTime), "yyyy/MM/dd")}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
        size: 130,
      },
      {
        accessorKey: "outbound_status",
        header: "Status",
        Cell: ({ row }) => {
          const status = row.original.outbound_status;
          const StatusIcon = statusIcons[status];
          return (
            <Badge
              variant="secondary"
              className={`${statusStyles[status]} flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium`}
            >
              {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
              {statusMapping[status]}
            </Badge>
          );
        },
        size: 120,
      },
      {
        header: "Abnormal",
        id: "abnormal",
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.require_attention ? (
              <Info className="h-4 w-4 text-red-500" />
            ) : null}
            {row.original.temp_exc ? (
              <Thermometer className="h-4 w-4 text-orange-500" />
            ) : null}
          </div>
        ),
        size: 80,
      },
    ],
    []
  );

  // Create a theme matching your design.
  const theme = createTheme({
    palette: { mode: "light" },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.75rem",
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: "hsl(var(--muted))",
            "& .MuiTableCell-root": {
              color: "hsl(var(--muted-foreground))",
              fontWeight: 600,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: "hsl(var(--muted)/0.3)",
            },
          },
        },
      },
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 mt-10">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-center gap-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Outbound Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage all outbound shipments
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Outbounds"
            value={stats.total}
            icon={FileText}
            description="All records require action"
            onClick={() => setActiveTab("all")}
            isActive={activeTab === "all"}
          />

          <StatsCard
            title="Incomplete"
            value={stats.incomplete}
            icon={AlertTriangle}
            description="Pending completion"
            color="yellow"
            onClick={() => setActiveTab("incomplete")}
            isActive={activeTab === "incomplete"}
          />
          <StatsCard
            title="Waiting"
            value={stats.waiting}
            icon={Clock3}
            description="Awaiting action"
            color="blue"
            onClick={() => setActiveTab("waiting")}
            isActive={activeTab === "waiting"}
          />
          <StatsCard
            title="Require Attention"
            value={stats.requireAttention}
            icon={Info}
            description="Needs review"
            color="red"
            onClick={() => setActiveTab("require_attention")}
            isActive={activeTab === "require_attention"}
          />
          <StatsCard
            title="Temp Exc"
            value={stats.tempExc}
            icon={Thermometer}
            description="Temporature exceed 32 °F"
            color="orange"
            onClick={() => setActiveTab("temp_exc")}
            isActive={activeTab === "temp_exc"}
          />
        </div>

        {/* Table Card */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-2 w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
                  <TabsTrigger value="waiting">Waiting</TabsTrigger>
                  <TabsTrigger value="require_attention">
                    Require Attention
                  </TabsTrigger>
                  <TabsTrigger value="temp_exc">Temp Exc</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search routes, site..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ThemeProvider theme={theme}>
              <MaterialReactTable
                columns={columns}
                data={filteredData}
                state={{ isLoading }}
                enableColumnActions={false}
                enableColumnFilters={false}
                enableGlobalFilter={false}
                enableTopToolbar={false}
                enablePagination={true}
                enableSorting={true}
                muiTableBodyRowProps={({ row }) => ({
                  onClick: () =>
                    navigate(`/outbound/${row.original.route_number}`),
                  style: { cursor: "pointer" },
                  className: "hover:bg-muted/50 transition-colors",
                })}
                initialState={{
                  density: "compact",
                  pagination: { pageSize: 10, pageIndex: 0 },
                }}
                muiTablePaperProps={{
                  elevation: 0,
                  sx: { border: "none" },
                }}
                muiTableContainerProps={{
                  sx: { border: "none" },
                }}
              />
            </ThemeProvider>
          </CardContent>
          <CardFooter className="border-t py-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {outboundData.length} outbound
            records
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  color = "default",
  onClick,
  isActive = false,
}) {
  // Extend the color mappings to include red and orange.
  const colorStyles = {
    default: "bg-card text-card-foreground",
    green: "bg-green-50 border-green-100",
    yellow: "bg-yellow-50 border-yellow-100",
    blue: "bg-blue-50 border-blue-100",
    purple: "bg-purple-50 border-purple-100",
    red: "bg-red-50 border-red-100",
    orange: "bg-orange-50 border-orange-100",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    green: "text-green-500",
    yellow: "text-yellow-500",
    blue: "text-blue-500",
    purple: "text-purple-500",
    red: "text-red-500",
    orange: "text-orange-500",
  };

  return (
    <Card
      className={`${colorStyles[color]} ${isActive ? "ring-2 ring-primary ring-offset-2" : ""
        } transition-all hover:shadow-md cursor-pointer`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <Icon className={`h-5 w-5 ${iconStyles[color]}`} />
        </div>
      </CardContent>
    </Card>
  );
}
