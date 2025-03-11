/* eslint-disable no-unused-vars */
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePadComponent } from "./components/SignaturePad";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function VerificationPage() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [verificationName, setVerificationName] = useState("");
  const [signature, setSignature] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const outbounds = [
    {
      routeNumber: "001",
      date: "2023-05-01",
      inspectorName: "John Doe",
      status: "Completed",
    },
    {
      routeNumber: "002",
      date: "2023-05-02",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "003",
      date: "2023-05-03",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "004",
      date: "2023-05-04",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "005",
      date: "2023-05-05",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "006",
      date: "2023-05-06",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "007",
      date: "2023-05-07",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "008",
      date: "2023-05-08",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "009",
      date: "2023-05-09",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "010",
      date: "2023-05-10",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "011",
      date: "2023-05-11",
      inspectorName: "John Doe",
      status: "Completed",
    },
    {
      routeNumber: "012",
      date: "2023-05-12",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "013",
      date: "2023-05-13",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "014",
      date: "2023-05-14",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "015",
      date: "2023-05-15",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "016",
      date: "2023-05-16",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "017",
      date: "2023-05-17",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "018",
      date: "2023-05-18",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "019",
      date: "2023-05-19",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
    {
      routeNumber: "020",
      date: "2023-05-20",
      inspectorName: "Jane Smith",
      status: "Pending",
    },
  ];

  const handleCreateVerification = () => {
    if (!/^\d{6}$/.test(verificationName)) {
      alert("Please enter a valid verification name in YYYYMM format");
      return;
    }
    console.log("Creating verification:", verificationName);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 mt-10">
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Outbound Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 text-left">
                <Label htmlFor="month-select">Select Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month-select" className="bg-white">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <SelectItem
                          key={month}
                          value={month.toString().padStart(2, "0")}
                        >
                          {format(new Date(2023, month - 1), "MMMM")}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2 text-left">
                <Label htmlFor="verification-name">
                  Create Verification (YYYYMM)
                </Label>
                <Input
                  id="verification-name"
                  value={verificationName}
                  onChange={(e) => setVerificationName(e.target.value)}
                  placeholder="YYYYMM"
                  maxLength={6}
                  className="bg-white"
                />
              </div>
              <Button
                onClick={handleCreateVerification}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                Create
              </Button>
            </div>

            <div className="rounded-md border">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold sticky top-0 bg-gray-50">
                        Route Number
                      </TableHead>
                      <TableHead className="font-semibold sticky top-0 bg-gray-50">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold sticky top-0 bg-gray-50">
                        Inspector Name
                      </TableHead>
                      <TableHead className="font-semibold text-right sticky top-0 bg-gray-50">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outbounds
                      .slice(
                        (currentPage - 1) * rowsPerPage,
                        currentPage * rowsPerPage
                      )
                      .map((outbound) => (
                        <TableRow key={outbound.routeNumber}>
                          <TableCell className="text-left">
                            {outbound.routeNumber}
                          </TableCell>
                          <TableCell className="text-left">
                            {outbound.date}
                          </TableCell>
                          <TableCell className="text-left">
                            {outbound.inspectorName}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                                outbound.status === "Completed"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-yellow-50 text-yellow-700"
                              }`}
                            >
                              {outbound.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              <div className="py-4 bg-white border-t">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: Math.ceil(outbounds.length / rowsPerPage) },
                      (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              prev + 1,
                              Math.ceil(outbounds.length / rowsPerPage)
                            )
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(outbounds.length / rowsPerPage)
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <Label>Date of Verification</Label>
                <Input
                  value={format(new Date(), "yyyy-MM-dd")}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label>Signature</Label>
                <SignaturePadComponent onSave={setSignature} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handlePrint}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8"
              >
                Print Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
