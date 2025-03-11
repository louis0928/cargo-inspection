/* eslint-disable no-unused-vars */
"use client";

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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignaturePadComponent } from "./SignaturePad";

export function Validation() {
  const [selectedYear, setSelectedYear] = useState("");
  const [validationYear, setValidationYear] = useState("");
  const [signature, setSignature] = useState(null);

  // Mock data - replace with actual data fetching logic
  const monthlyOutbounds = [
    { month: "January", total: 50, status: "Completed" },
    { month: "February", total: 45, status: "Completed" },
    // Add more mock data as needed
  ];

  const handleCreateValidation = () => {
    if (!/^\d{4}$/.test(validationYear)) {
      alert("Please enter a valid year in YYYY format");
      return;
    }
    // Add logic to create validation
    console.log("Creating validation for year:", validationYear);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Outbound Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Label htmlFor="year-select">Select Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="validation-year">Create Validation (YYYY)</Label>
            <Input
              id="validation-year"
              value={validationYear}
              onChange={(e) => setValidationYear(e.target.value)}
              placeholder="YYYY"
              maxLength={4}
            />
          </div>
          <Button onClick={handleCreateValidation} className="mt-auto">
            Create
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Total Outbounds</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyOutbounds.map((monthData) => (
              <TableRow key={monthData.month}>
                <TableCell>{monthData.month}</TableCell>
                <TableCell>{monthData.total}</TableCell>
                <TableCell>{monthData.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="space-y-4">
          <div>
            <Label>Date</Label>
            <Input value={format(new Date(), "yyyy-MM-dd")} readOnly />
          </div>
          <div>
            <Label>Signature</Label>
            <SignaturePadComponent onSave={setSignature} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handlePrint}>Print Validation</Button>
      </CardFooter>
    </Card>
  );
}
