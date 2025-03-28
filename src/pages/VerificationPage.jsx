/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuth from "@/hooks/useAuth";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/LoadingOverlay";
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
import { SignaturePadComponent } from "../components/SignaturePad";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
// Import icons from lucide-react
import { Thermometer, Info } from "lucide-react";
// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { jwtDecode } from "jwt-decode";

export default function VerificationPage() {
  const navigate = useNavigate();
  const { verificationYear, verificationMonth, verificationSite } = useParams();

  // Initialize state from params if available, otherwise default to current values.
  const [selectedYear, setSelectedYear] = useState(
    verificationYear || new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    verificationMonth || (new Date().getMonth() + 1).toString().padStart(2, "0")
  );
  const [selectedSite, setSelectedSite] = useState(verificationSite || "MD");
  const [signature, setSignature] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [outbounds, setOutbounds] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noRecords, setNoRecords] = useState(false);
  const [verificationData, setVericationData] = useState(null);
  // States for modal handling
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const siteArr = ["MD", "SC", "IL"];
  const { auth } = useAuth();

  // Mapping of status values
  const statusMapping = {
    0: "Completed",
    1: "Incomplete",
    2: "Waiting",
    3: "New",
  };

  // Fetch available years for dropdown
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(
          "https://integration.eastlandfood.com/efc/cargo-inspection/validationDropdown",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            withCredentials: true,
          }
        );
        const availableYears = [
          ...new Set(response.data.map((item) => item.year.toString())),
        ];
        setYears(availableYears);
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    fetchYears();
  }, []);

  // Whenever a dropdown changes, update the URL (the URL becomes the source of truth)
  useEffect(() => {
    navigate(`/verification/${selectedYear}/${selectedMonth}/${selectedSite}`, {
      replace: true,
    });
  }, [selectedYear, selectedMonth, selectedSite, navigate]);

  // Fetch outbound data based on selected filters
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedSite) {
      const fetchOutbounds = async () => {
        setLoading(true);
        setNoRecords(false);
        try {
          const response = await axios.get(
            `https://integration.eastlandfood.com/efc/cargo-inspection/outbounds/${selectedYear}${selectedMonth}/${selectedSite}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.accessToken}`,
              },
              withCredentials: true,
            }
          );
          if (response.data.length === 0) {
            setNoRecords(true);
          } else {
            setOutbounds(response.data);
          }
        } catch (error) {
          console.error("Error fetching outbounds:", error);
          setNoRecords(true);
        } finally {
          setLoading(false);
        }
      };

      fetchOutbounds();
    }
  }, [selectedYear, selectedMonth, selectedSite]);

  // Fetch verification data and reset signature if no record
  useEffect(() => {
    const getVerificationData = async () => {
      try {
        const response = await axios.get(
          `https://integration.eastlandfood.com/efc/cargo-inspection/verification/${selectedYear}${selectedMonth}/${selectedSite}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            withCredentials: true,
          }
        );
        if (response.data && response.data.length > 0) {
          setVericationData(response.data[0]);
          setSignature(response.data[0].signature);
        } else {
          setVericationData(null);
          setSignature(null);
        }
      } catch (error) {
        console.error("Error fetching verification data:", error);
        setVericationData(null);
        setSignature(null);
      }
    };

    getVerificationData();
  }, [selectedYear, selectedMonth, selectedSite]);

  const totalPages = Math.ceil(outbounds.length / rowsPerPage);

  const handlePrint = async () => {
    const name = selectedYear + selectedMonth;
    const data = outbounds;
    const email = jwtDecode(auth?.accessToken)?.email;

    const pdfData = {
      name: name,
      data: data,
      email: email,
      verifiedBy: jwtDecode(auth?.accessToken)?.username,
      signature: signature,
      site: selectedSite,
    };

    try {
      await axios.post(
        `https://integration.eastlandfood.com/efc/cargo-inspection/pdfVerification`,
        pdfData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          withCredentials: true,
        }
      );
      alert("Pdf has been sent to google drive");
    } catch (error) {
      console.error("Error printing pdf:", error);
    }
  };

  const handleVerify = async () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based

    const selectedYearNum = parseInt(selectedYear, 10);
    const selectedMonthNum = parseInt(selectedMonth, 10);

    if (!signature) {
      setModalMessage("Please sign before verifying outbound!");
      setOpenModal(true);
      return;
    }

    if (
      selectedYearNum > currentYear ||
      (selectedYearNum === currentYear && selectedMonthNum >= currentMonth)
    ) {
      setModalMessage("Verification can only be done for months that have passed.");
      setOpenModal(true);
      return;
    }

    // Abnormal condition: if require_attention or temp_exc are truthy (indicating a problem)
    const hasAbnormal = outbounds.some(
      (outbound) => outbound.require_attention || outbound.temp_exc
    );
    const hasInvalidStatus = outbounds.some(
      (outbound) => outbound.outbound_status !== 0
    );

    if (hasAbnormal || hasInvalidStatus) {
      let errorMessage = "";
      if (hasAbnormal) {
        errorMessage += "Some outbounds don't meet the requirements.";
      }
      if (hasInvalidStatus) {
        errorMessage += "Some outbounds do not have status 'Completed'.";
      }
      setModalMessage(errorMessage);
      setOpenModal(true);
      return;
    }
    const verificationDataPayload = {
      verificationDate: format(new Date(), "yyyy-MM-dd"),
      verifiedBy: jwtDecode(auth?.accessToken)?.username,
      signature,
      name: selectedYear + selectedMonth,
      site: selectedSite,
    };
    try {
      setIsSubmitting(true);
      await axios.patch(
        "https://integration.eastlandfood.com/efc/cargo-inspection/verification",
        verificationDataPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          withCredentials: true,
        }
      );
      alert("Verification successful! Generating PDF...");

      await handlePrint();
    } catch (error) {
      console.error("Error verifying outbounds:", error);
      alert("Failed to verify. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 mt-10">
      {isSubmitting && <LoadingOverlay message="Processing Verification..." />}
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Outbound Verification{" "}
              {verificationData?.verification_status === 0 ? (
                <span className="text-green-600 font-bold ml-2">Approved</span>
              ) : verificationData?.verification_status === 1 ? (
                <span className="text-orange-400 font-bold ml-2">
                  Waiting for Approval
                </span>
              ) : (
                ""
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 text-left">
                <Label htmlFor="year-select">Select Year</Label>
                <Select
                  value={selectedYear}
                  onValueChange={(value) => setSelectedYear(value)}
                >
                  <SelectTrigger id="year-select" className="bg-white">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2 text-left">
                <Label htmlFor="month-select">Select Month</Label>
                <Select
                  value={selectedMonth}
                  onValueChange={(value) => setSelectedMonth(value)}
                >
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
                <Label htmlFor="site-select">Select Site</Label>
                <Select
                  value={selectedSite}
                  onValueChange={(value) => setSelectedSite(value)}
                >
                  <SelectTrigger id="site-select" className="bg-white">
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {siteArr.map((site) => (
                      <SelectItem key={site} value={site}>
                        {site}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-md border">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route Number
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inspected On
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inspected By
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Abnormal
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan="5"
                          className="px-4 py-2 text-center"
                        >
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : noRecords ? (
                      <TableRow>
                        <TableCell
                          colSpan="5"
                          className="px-4 py-4 text-center"
                        >
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      outbounds
                        .slice(
                          (currentPage - 1) * rowsPerPage,
                          currentPage * rowsPerPage
                        )
                        .map((outbound) => (
                          <TableRow
                            key={outbound.outbound_id}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              navigate(`/outbound/${outbound.route_number}`)
                            }
                          >
                            <TableCell className="px-4 py-2 whitespace-nowrap text-left">
                              {outbound.route_number}
                            </TableCell>
                            <TableCell className="px-4 py-2 whitespace-nowrap text-left">
                              {format(
                                new Date(outbound.created_on),
                                "yyyy-MM-dd"
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-2 whitespace-nowrap text-left">
                              {JSON.parse(outbound.load_info).inspectorName}
                            </TableCell>
                            <TableCell className="px-4 py-2 whitespace-nowrap text-left">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${outbound.outbound_status === 0
                                  ? "bg-green-50 text-green-700"
                                  : outbound.outbound_status === 1
                                    ? "bg-yellow-50 text-yellow-700"
                                    : outbound.outbound_status === 2
                                      ? "bg-blue-50 text-blue-700"
                                      : outbound.outbound_status === 3
                                        ? "bg-red-50 text-red-700"
                                        : outbound.outbound_status === 4
                                          ? "bg-gray-200 text-gray-900"
                                          : "bg-purple-50 text-purple-700"
                                  }`}
                              >
                                {statusMapping[outbound.outbound_status] ||
                                  "Unknown"}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-2 whitespace-nowrap text-left">
                              {outbound.require_attention ? (
                                <Info
                                  className="w-5 h-5 inline-block"
                                  title="Require Attention"
                                  color="orange"
                                />
                              ) : null}
                              {outbound.temp_exc ? (
                                <Thermometer
                                  className="w-5 h-5 inline-block ml-1"
                                  title="Temperature Exception"
                                  color="red"
                                />
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
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
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage >= totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>

            {/* Signature & Date */}
            <div className="space-y-4 text-left">
              <Label>Date of Verification</Label>
              <Input
                value={
                  verificationData?.verification_date
                    ? format(
                      new Date(verificationData.verification_date),
                      "yyyy-MM-dd"
                    )
                    : format(new Date(), "yyyy-MM-dd")
                }
                readOnly
                className="bg-gray-50"
              />
              <div>
                <Label>Signature</Label>
              </div>
              {verificationData?.signature && !noRecords ? (
                <img
                  src={verificationData.signature}
                  alt="Stored Signature"
                  className="border rounded-md w-full h-[200px] object-contain"
                />
              ) : (
                <SignaturePadComponent onSave={setSignature} />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={handleVerify} className="bg-blue-600 text-white">
                Verify Outbound
              </Button>
              {/* <Button onClick={handlePrint} className="bg-gray-900 text-white">
                Print Verification
              </Button> */}
            </div>
            <div className="flex justify-end pt-4"></div>
          </CardContent>
        </Card>
      </div>

      {/* Modal for verification issues */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verification Error</DialogTitle>
          </DialogHeader>
          <p className="py-4">{modalMessage}</p>
          <DialogFooter>
            <Button onClick={() => setOpenModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
