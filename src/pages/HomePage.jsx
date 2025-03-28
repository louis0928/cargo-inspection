import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import axios from "axios";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// UI Components (cards, buttons, tables, charts, etc.)
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Calendar, ChevronDown } from "lucide-react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

// Example sites array
const sites = [
    { id: "all", name: "All Sites" },
    { id: "MD", name: "MD" },
    { id: "SC", name: "SC" },
    { id: "IL", name: "IL" },
    // add other sites as needed
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

// Helper function to group inspection trend data (aggregated by time period)
const groupInspectionTrendData = (data, timeView) => {
    let keys = [];
    if (timeView === "daily") {
        for (let hour = 6; hour <= 20; hour++) {
            keys.push(`${hour}:00`);
        }
    } else if (timeView === "weekly") {
        keys = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    } else if (timeView === "monthly") {
        keys = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
    } else if (timeView === "yearly") {
        keys = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
    }
    const grouped = {};
    keys.forEach((k) => (grouped[k] = 0));
    data.forEach((record) => {
        if (!record.inspectionDateTime) return;
        const dt = new Date(record.inspectionDateTime);
        let key = "";
        if (timeView === "daily") {
            const hour = dt.getHours();
            if (hour >= 6 && hour <= 20) {
                key = `${hour}:00`;
            } else return;
        } else if (timeView === "weekly") {
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            key = days[dt.getDay()];
        } else if (timeView === "monthly") {
            const week = Math.floor((dt.getDate() - 1) / 7) + 1;
            key = `Week ${week}`;
        } else if (timeView === "yearly") {
            const months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            key = months[dt.getMonth()];
        }
        if (key in grouped) {
            grouped[key] += 1;
        }
    });
    return keys.map((key) => ({
        period: key,
        count: grouped[key],
    }));
};

export default function HomePage() {
    // State declarations
    const { auth } = useAuth();
    const [selectedSite, setSelectedSite] = useState(() => {
        if (auth && auth.accessToken && auth.roles?.includes("INSPECTOR")) {
            try {
                const decoded = jwtDecode(auth.accessToken);
                const inspectorSites = {
                    "md_warehouse@eastlandfood.com": { id: "MD", name: "MD" },
                    "sc_warehouse@eastlandfood.com": { id: "SC", name: "SC" },
                    "il_warehouse@eastlandfood.com": { id: "IL", name: "IL" },
                };
                return inspectorSites[decoded.email] || sites[0];
            } catch (error) {
                console.error("Error decoding token:", error);
                return sites[0];
            }
        }
        return sites[0];
    });
    const [timeView, setTimeView] = useState("daily");
    const [date, setDate] = useState(new Date());
    // week is declared with a default value "1"
    const [week, setWeek] = useState("1");

    const navigate = useNavigate();

    // In case auth changes later, update selectedSite accordingly.
    useEffect(() => {
        if (auth && auth.accessToken && auth.roles?.includes("INSPECTOR")) {
            try {
                const decoded = jwtDecode(auth.accessToken);
                const inspectorSites = {
                    "md_warehouse@eastlandfood.com": { id: "MD", name: "MD" },
                    "sc_warehouse@eastlandfood.com": { id: "SC", name: "SC" },
                    "il_warehouse@eastlandfood.com": { id: "IL", name: "IL" },
                };
                const newSite = inspectorSites[decoded.email];
                if (newSite && selectedSite.id !== newSite.id) {
                    setSelectedSite(newSite);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, [auth, selectedSite]);


    // State for API responses:
    const [sapData, setSapData] = useState([]);
    const [sqlData, setSqlData] = useState([]);
    const [routesNeedingInspection, setRoutesNeedingInspection] = useState([]);

    // Function to interpolate between red and green based on percentage
    function getCompletionColor(percentage) {
        const pct = Math.max(0, Math.min(percentage, 100));
        const hue = (120 * pct) / 100;
        return `hsl(${hue}, 100%, 50%)`;
    }

    function DynamicProgressBar({ completionRate }) {
        const fillColor = getCompletionColor(completionRate);
        return (
            <div className="relative w-full h-2 bg-white rounded-full border border-black">
                <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-200 ease-in-out"
                    style={{
                        width: `${completionRate}%`,
                        backgroundColor: fillColor,
                    }}
                />
            </div>
        );
    }

    // --- Fetch SAP data ---
    useEffect(() => {
        const getSAPRouteInfo = async () => {
            try {
                const site = selectedSite.id;
                const formattedDate = format(date, "yyyy-MM-dd");
                const response = await axios.get(
                    `https://integration.eastlandfood.com/efc/cargo-inspection/sap/all/${site}/${timeView}/${formattedDate}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${auth.accessToken}`,
                        },
                        withCredentials: true,
                    }
                );
                setSapData(response.data);
            } catch (err) {
                console.error("Error fetching SAP data:", err);
            }
        };
        getSAPRouteInfo();
    }, [selectedSite, timeView, date, auth]);

    // --- Fetch SQL data ---
    useEffect(() => {
        const getSQLData = async () => {
            try {
                const site = selectedSite.id;
                const formattedDate = format(date, "yyyy-MM-dd");
                const response = await axios.get(
                    `https://integration.eastlandfood.com/efc/cargo-inspection/sql/all/${site}/${timeView}/${formattedDate}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${auth.accessToken}`,
                        },
                        withCredentials: true,
                    }
                );
                setSqlData(response.data);
            } catch (err) {
                console.error("Error fetching SQL data:", err);
            }
        };
        getSQLData();
    }, [selectedSite, timeView, date, auth]);

    // Process routes needing inspection.
    useEffect(() => {
        const processedRouteNumbers = new Set(sqlData.map((route) => route.route_number));
        const filteredRoutes = sapData.filter((route) => !processedRouteNumbers.has(String(route.DocEntry)));
        setRoutesNeedingInspection(filteredRoutes);
    }, [sapData, sqlData]);

    const dataForTrend = sqlData || { completed: 0, total: 0 };
    const completionRate = sapData.length > 0 ? (sqlData.length / sapData.length) * 100 : 0;
    const groupedInspectionTrendData = groupInspectionTrendData(sqlData, timeView);

    const getXAxisLabel = () => {
        switch (timeView) {
            case "daily":
                return "Hour";
            case "weekly":
                return "Day";
            case "monthly":
                return "Week";
            case "yearly":
                return "Month";
            default:
                return "Time";
        }
    };

    // Render a date selector.
    const renderDateSelector = () => {
        let displayText = "";
        if (timeView === "daily" || timeView === "weekly") {
            displayText = date.toLocaleDateString();
        } else if (timeView === "monthly") {
            displayText = date.toLocaleDateString("default", { month: "long", year: "numeric" });
        } else if (timeView === "yearly") {
            displayText = date.getFullYear().toString();
        }
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        {displayText}
                        <Calendar className="ml-2 h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        );
    };

    const processedRoutes = sapData.map((route) => {
        const dueDate = new Date(route.U_DocDueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let status = "Upcoming";
        if (dueDate < today) status = "Overdue";
        else if (dueDate.getTime() === today.getTime()) status = "Due Today";
        return {
            route: route.DocEntry,
            dueDate: dueDate,
            status: status,
            priority: "Medium",
        };
    });

    const siteDistributionData =
        selectedSite.id === "all" && sapData.length > 0
            ? Object.values(
                sapData.reduce((acc, route) => {
                    const site = route["LEFT(U_OriWhse,2)"];
                    acc[site] = acc[site] || { name: site, value: 0 };
                    acc[site].value += 1;
                    return acc;
                }, {})
            )
            : [];

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

    // Updated getTimePeriodText using week (which is defined in state)
    const getTimePeriodText = () => {
        switch (timeView) {
            case "daily":
                return `${date.toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" })}`;
            case "weekly":
                return `Week ${week}, ${date.toLocaleDateString("default", { month: "long", year: "numeric" })}`;
            case "monthly":
                return `${date.toLocaleDateString("default", { month: "long", year: "numeric" })}`;
            case "yearly":
                return `Year ${date.getFullYear()}`;
            default:
                return "Current Period";
        }
    };

    return (
        <div className="flex min-h-screen flex-col mt-10">
            <div className="flex flex-1">
                <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
                    {/* Dashboard Header */}
                    <div className="mb-8">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Cargo Inspection Dashboard</h1>
                            <p className="text-muted-foreground">
                                Monitoring inspection progress for {selectedSite.id === "all" ? "all sites" : selectedSite.name} during {getTimePeriodText()}.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Site Selection Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Site Selection</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                            disabled={auth?.roles?.includes("INSPECTOR")}
                                        >
                                            {selectedSite.name}
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    {!auth?.roles?.includes("INSPECTOR") && (
                                        <DropdownMenuContent align="end" className="w-[200px]">
                                            {sites.map((site) => (
                                                <DropdownMenuItem key={site.id} onClick={() => setSelectedSite(site)}>
                                                    {site.name}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    )}
                                </DropdownMenu>
                            </CardContent>
                        </Card>

                        {/* Time Period Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Time Period</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-4">
                                <Tabs
                                    defaultValue="daily"
                                    value={timeView}
                                    onValueChange={setTimeView}
                                    className="w-full"
                                >
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="daily">D</TabsTrigger>
                                        <TabsTrigger value="weekly">W</TabsTrigger>
                                        <TabsTrigger value="monthly">M</TabsTrigger>
                                        <TabsTrigger value="yearly">Y</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Date Selection Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Date Selection</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-4">{renderDateSelector()}</CardContent>
                        </Card>

                        {/* Inspection Rate Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Inspection Rate</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-4 text-left">
                                <div className="text-2xl font-bold">{completionRate.toFixed(2)}%</div>
                                <DynamicProgressBar completionRate={completionRate} />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {sqlData.length} of {sapData.length} inspections performed
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        {/* Inspection Trend Chart */}
                        <Card className="lg:col-span-4">
                            <CardHeader>
                                <CardTitle>Inspection Trend</CardTitle>
                                <CardDescription>
                                    {timeView.charAt(0).toUpperCase() + timeView.slice(1)} inspection completion trend
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-4">
                                <div className="h-[350px]">
                                    <ChartContainer config={{ completed: { label: "Inspections", color: "var(--color-completed)" } }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={groupedInspectionTrendData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="period"
                                                    label={{ value: getXAxisLabel(), position: "insideBottomRight", offset: -10 }}
                                                />
                                                <YAxis label={{ value: "Inspections", angle: -90, position: "insideLeft" }} />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Routes or Site Distribution Card */}
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                {selectedSite.id === "all" ? (
                                    <>
                                        <CardTitle>Site Distribution</CardTitle>
                                        <CardDescription>Inspection distribution by site</CardDescription>
                                    </>
                                ) : (
                                    <>
                                        <CardTitle>Routes Needing Inspection</CardTitle>
                                        <CardDescription>
                                            Routes in {selectedSite.name} that need inspection
                                        </CardDescription>
                                    </>
                                )}
                            </CardHeader>
                            <CardContent className="px-6 py-4">
                                {selectedSite.id === "all" ? (
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={siteDistributionData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {siteDistributionData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[350px] overflow-auto">
                                        <Card>
                                            <CardContent>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Route Number</TableHead>
                                                            <TableHead>Route Name</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {routesNeedingInspection.map((route) => (
                                                            <TableRow
                                                                key={route.DocEntry}
                                                                className="cursor-pointer hover:bg-gray-50 transition-colors text-left"
                                                                onClick={() => navigate(`/outbound/${route.DocEntry}`)}
                                                            >
                                                                <TableCell className="font-semibold">{route.DocEntry}</TableCell>
                                                                <TableCell>{route.U_Title}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
