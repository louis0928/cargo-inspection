/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePadComponent } from "../components/SignaturePad";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import useAuth from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";

export default function ValidationPage() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { validationYear, validationSite } = useParams();
  // Local state for filter dropdowns (URL remains unchanged)
  const [selectedYear, setSelectedYear] = useState(
    validationYear || new Date().getFullYear().toString()
  );
  const [selectedSite, setSelectedSite] = useState(validationSite || "MD");

  // State for API data
  const [verificationData, setVerificationData] = useState([]);
  const [validationData, setValidationData] = useState([]);
  const [signature, setSignature] = useState(null);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");


  const siteArr = ["MD", "SC", "IL"];

  // Status mapping for validation status: 0 and 1 defined; any other value becomes "Pending"
  const getStatusLabel = (status) => {
    if (status === 0) {
      return { label: "Completed", style: "bg-green-50 text-green-700" };
    } else if (status === 1) {
      return {
        label: "Waiting for Approval",
        style: "bg-blue-50 text-blue-700",
      };
    } else {
      return { label: "Pending", style: "bg-yellow-50 text-yellow-700" };
    }
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

  // Fetch validation data (if needed for additional details)
  useEffect(() => {
    const fetchValidationData = async () => {
      try {
        const response = await axios.get(
          `https://integration.eastlandfood.com/efc/cargo-inspection/validation/${selectedYear}/${selectedSite}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            withCredentials: true,
          }
        );
        setValidationData(response.data[0]);
        setSignature(response.data[0].signature);
      } catch (error) {
        console.error("Failed to get validation data: ", error);
      }
    };
    fetchValidationData();
  }, [selectedYear, selectedSite]);

  // Fetch verification data and update signature (if no record exists, reset the signature)
  useEffect(() => {
    const fetchVerificationData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://integration.eastlandfood.com/efc/cargo-inspection/verifications/${selectedYear}/${selectedSite}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            withCredentials: true,
          }
        );
        setVerificationData(response.data);
        if (response.data && response.data.length > 0) {
          // Use the first record's signature, validation date, and status
          setSignature(response.data[0].signature);
        } else {
          setSignature(null);
        }
      } catch (error) {
        console.error("Error fetching verification data:", error);
        setVerificationData([]);
        setSignature(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVerificationData();
  }, [selectedYear, selectedSite]);

  // Whenever a dropdown changes, update the URL (the URL becomes the source of truth)
  useEffect(() => {
    navigate(`/validation/${selectedYear}/${selectedSite}`, {
      replace: true,
    });
  }, [selectedYear, selectedSite, navigate]);

  // Function to send a PATCH request to update the validation record.
  const handleValidation = async () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const selectedYearNum = parseInt(selectedYear, 10);

    if (!signature) {
      alert("Please sign before validating outbound!");
      return;
    }

    if (selectedYearNum >= currentYear) {
      setModalMessage("Validation can only be done for years that have passed.");
      setOpenModal(true);
      return;
    }

    const verificationNotAllCompleted = verificationData.some((verification) => verification.verification_status === 1);

    if (verificationNotAllCompleted) {
      setModalMessage("All verifications need to be completed!");
      setOpenModal(true);
      return;
    }

    const validationDataPayload = {
      validationDate: format(new Date(), "yyyy-MM-dd"),
      validatedBy: jwtDecode(auth?.accessToken)?.username,
      signature,
      year: selectedYear,
      site: selectedSite,
      validationStatus: 0,
    };
    try {
      setIsSubmitting(true);
      await axios.patch(
        "https://integration.eastlandfood.com/efc/cargo-inspection/validation",
        validationDataPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          withCredentials: true,
        }
      );
      alert("Validation successful! Generating PDF...");

      await handlePrint();
    } catch (error) {
      console.error("Error validating outbound:", error);
      alert("Failed to validate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to send a print PDF request.
  const handlePrint = async () => {
    setIsSubmitting(true);
    const pdfData = {
      year: selectedYear,
      data: verificationData,
      email: jwtDecode(auth?.accessToken)?.email,
      validatedBy: jwtDecode(auth?.accessToken)?.username,
      validationDate: format(new Date(), "yyyy-MM-dd"),
      signature: signature,
      site: selectedSite,
    };
    try {
      await axios.post(
        "https://integration.eastlandfood.com/efc/cargo-inspection/pdfValidation",
        pdfData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error printing pdf:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 mt-10">
      {isSubmitting && (
        <LoadingOverlay message="Saving validation data to database and saving pdf to Google drive" />
      )}
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Outbound Validation{" "}
              {validationData?.validation_status === 0 ? (
                <span className="text-green-600 font-bold ml-2">Approved</span>
              ) : validationData?.validation_status === 1 ? (
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
                <Select value={selectedYear} onValueChange={setSelectedYear}>
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
                <Label htmlFor="site-select">Select Site</Label>
                <Select value={selectedSite} onValueChange={setSelectedSite}>
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

            {/* Validation Data Table */}
            <div className="rounded-md border overflow-hidden">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </TableHead>
                    <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Outbounds
                    </TableHead>
                    <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified On
                    </TableHead>
                    <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified By
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan="5" className="px-4 py-2 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : verificationData.length > 0 ? (
                    verificationData.map((data) => {
                      const statusInfo = getStatusLabel(
                        data.verification_status
                      );
                      return (
                        <TableRow
                          key={data.month_name}
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() =>
                            navigate(
                              `/verification/${data.name.substring(0, 4)}/${data.name.substring(4)}/${data.site}`
                            )
                          }
                        >
                          <TableCell className="px-4 py-2 whitespace-nowrap text-left">
                            {data.month_name}
                          </TableCell>
                          <TableCell className="px-4 py-2 whitespace-nowrap text-center">
                            {data.total_outbounds}
                          </TableCell>
                          <TableCell className="px-4 py-2 whitespace-nowrap text-center">
                            {data.verification_date
                              ? format(
                                new Date(data.verification_date),
                                "yyyy-MM-dd"
                              )
                              : ""}
                          </TableCell>
                          <TableCell className="px-4 py-2 whitespace-nowrap text-center">
                            {data.verified_by}
                          </TableCell>
                          <TableCell className="px-4 py-2 whitespace-nowrap text-right">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${statusInfo.style}`}
                            >
                              {statusInfo.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan="5" className="px-4 py-2 text-center">
                        No Data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Signature & Date */}
            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <Label>Date of Validation</Label>
                <Input
                  value={
                    validationData?.validation_date
                      ? format(
                        new Date(validationData.validation_date),
                        "yyyy-MM-dd"
                      )
                      : format(new Date(), "yyyy-MM-dd")
                  }
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Signature</Label>
                {validationData?.signature ? (
                  <img
                    src={validationData.signature}
                    alt="Stored Signature"
                    className="border rounded-md w-full h-[200px] object-contain"
                  />
                ) : (
                  <SignaturePadComponent onSave={setSignature} />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button onClick={handleValidation} className="bg-blue-600 text-white">
                Validate Outbound
              </Button>
              {/* <Button onClick={handlePrint} className="bg-gray-900 text-white">
                Print Validation
              </Button> */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal for validation issues */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validation Error</DialogTitle>
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
