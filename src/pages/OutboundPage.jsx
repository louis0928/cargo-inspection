/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unionSchema } from "@/validationSchemas/outboundSchema";
import useAuth from "@/hooks/useAuth";

// UI components (assumed to be pre‑built)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingOverlay } from "@/components/LoadingOverlay";

// ─── MAIN FORM COMPONENT ───────────────────────────────────────────────

export function OutboundLoadingSummaryForm() {
  const [formStatus, setFormStatus] = useState(3);
  const { routeNum } = useParams();
  const [outboundData, setOutboundData] = useState([]);
  const [requireAttention, setRequireAttention] = useState(false);
  const [tempExc, setTempExc] = useState(false);
  //const [schema, setSchema] = useState(newSchema); // Default to new
  const [isLoadReturnOK, setIsLoadReturnOK] = useState(false);
  const [checkers, setCheckers] = useState([]);
  const [mergers, setMergers] = useState([]);
  const [loaders, setLoaders] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
    trigger,
    getValues,
  } = useForm({
    resolver: zodResolver(unionSchema),
    mode: "onChange",
    defaultValues: {
      mode: "new",
    },
  });

  const routeNumber = watch("routeNumber");

  const onSubmit = async (data) => {
    // Reassemble the flat data into your nested JSON structure.
    setIsLoading(true);
    try {
      const payload = {
        outboundStatus: data.outboundStatus,
        lastModifiedBy: "Louis",
        email: "lightjan2005@gmail.com",
        carrier: data.carrier,
        site: data.site,
        routeNumber: data.routeNumber,
        routeName: data.routeName,
        deliveryDate: data.deliveryDate,
        tractor: data.tractorStTruck,
        trailer: data.trailer,
        driver: data.driver,
        helper: data.helper,
        assignedLoadEquipment: {
          handTruckNo: data.handTruckNo,
          poweredPalletJackNo: data.poweredPalletJackNo,
          loadBarCount: data.loadBarCount,
        },
        poweredPalletJackInspection: {
          checklist: [
            data["pallet-check-0"],
            data["pallet-check-1"],
            data["pallet-check-2"],
            data["pallet-check-3"],
            data["pallet-check-4"],
            data["pallet-check-5"],
            data["pallet-check-6"],
            data["pallet-check-7"],
          ],
          notes: data.palletJackNotes,
        },
        loadInformation: {
          checkerName: data.checkerName,
          mergerName: data.mergerName,
          loaderName: data.loaderName,
          inspectorName: data.inspectorName,
          inspectionDateTime: data.inspectionDateTime,
          loadingDockNo: data.loadingDockNo,
          refrigeratorThermostat: data.refrigeratorThermostat,
          refrigeratorUnitTemperature: data.refrigeratorUnitTemperature,
          reeferTurningOnTime: data.reeferTurningOnTime,
          reeferTurningOnTemperature: data.reeferTurningOnTemperature,
          reeferAfterLoadingTemperature: data.reeferAfterLoadingTemperature,
          startLoadingTime: data.startLoadingTime,
          finishedLoadingTime: data.finishedLoadingTime,
        },
        trailerInspectionChecklist: {
          checklist: [
            {
              area: "Refrigeration Unit",
              items: [
                {
                  description: "Refrigerator Unit Operational",
                  value: data["trailer-check-0-0"],
                },
                {
                  description: "Vents Closed",
                  value: data["trailer-check-0-1"],
                },
              ],
            },
            {
              area: "Cleanliness",
              items: [
                {
                  description:
                    "Floors Free of Rubbish, Product Residue or Insects",
                  value: data["trailer-check-1-0"],
                },
                {
                  description: "Walls Free of Product Residue and Tape",
                  value: data["trailer-check-1-1"],
                },
                {
                  description: "Drains Open & Unobstructed (Free Flowing)",
                  value: data["trailer-check-1-2"],
                },
                {
                  description: "Absence of Odor(S)",
                  value: data["trailer-check-1-3"],
                },
              ],
            },
            {
              area: "Condition",
              items: [
                {
                  description: "Ceiling Undamaged",
                  value: data["trailer-check-2-0"],
                },
                {
                  description: "Air Delivery Chute Intact & Functional",
                  value: data["trailer-check-2-1"],
                },
                {
                  description: "Door Seals Intact & in Good Repair",
                  value: data["trailer-check-2-2"],
                },
                {
                  description: "Door Undamaged",
                  value: data["trailer-check-2-3"],
                },
                {
                  description: "Walls & Wall Insulation Undamaged",
                  value: data["trailer-check-2-4"],
                },
                {
                  description: "Floors in Good Repair",
                  value: data["trailer-check-2-5"],
                },
              ],
            },
            {
              area: "Final Result",
              items: [
                {
                  description: "Satisfactory for loading",
                  value: data["trailer-check-3-0"],
                },
              ],
            },
          ],
          comment: data.trailerInspectionComment,
        },
        loadingSummary: {
          dateRecord: data.dateRecord,
          positions: Array.from({ length: 24 }, (_, i) => ({
            weight: data[`position${i + 1}`],
            stop: data[`stop${i + 1}`],
          })),
          totalWeight: data.totalWeight,
          totalPallet: data.totalPallet,
          iceCream: data.iceCream,
          foilCount: data.foilCount,
        },
        loadingReturn: {
          returnDateTime: data.returnDateTime,
          returnLB: data.returnLB,
          returnPW: data.returnPW,
          returnHT: data.returnHT,
        },
        requireAttention: requireAttention,
        tempExc: tempExc,
      };

      const response = await axios.get(
        `https://integration.eastlandfood.com/efc/cargo-inspection/outbound/${data.routeNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          withCredentials: true,
        }
      );

      const existingOutbound = response.data;
      // check if the outbound already exists. If exists update else create
      if (existingOutbound) {
        // If record exists, PATCH request with outbound_id
        await axios.patch(
          `https://integration.eastlandfood.com/efc/cargo-inspection/outbound`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            withCredentials: true,
          }
        );

        alert("Successfully updated outbound record.");
      } else {
        // If record does not exist, POST request
        await axios.post(
          "https://integration.eastlandfood.com/efc/cargo-inspection/outbound",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            withCredentials: true,
          }
        );

        alert("Successfully created a new outbound record.");
      }
    } catch (error) {
      console.error("Error processing outbound data:", error);
      alert("Error processing outbound data.");
    } finally {
      setIsLoading(false);
      navigate("/dashboard")
    }
  };

  const watchPalletJackChecklist = watch([
    "pallet-check-0",
    "pallet-check-1",
    "pallet-check-2",
    "pallet-check-3",
    "pallet-check-4",
    "pallet-check-5",
    "pallet-check-6",
    "pallet-check-7",
  ]);

  const watchLoadReturn = watch([
    "returnDateTime",
    "returnLB",
    "returnPW",
    "returnHT",
  ]);

  const watchTrailerChecklist = watch([
    "trailer-check-0-0",
    "trailer-check-0-1",
    "trailer-check-1-0",
    "trailer-check-1-1",
    "trailer-check-1-2",
    "trailer-check-1-3",
    "trailer-check-2-0",
    "trailer-check-2-1",
    "trailer-check-2-2",
    "trailer-check-2-3",
    "trailer-check-2-4",
    "trailer-check-2-5",
    "trailer-check-3-0",
  ]);

  const watchLoadInformation = watch(["refrigeratorUnitTemperature"]);
  const siteData = watch("site");

  // 🔹 Dynamically update `requireAttention` and `tempExc` when form fields change
  useEffect(() => {
    // ✅ Check if any powered pallet jack inspection field is "problem"
    const hasPalletJackProblem = watchPalletJackChecklist.includes("problem");

    // ✅ Check if any trailer inspection checklist has a "no" value
    const hasTrailerIssue = watchTrailerChecklist.includes("no");
    setRequireAttention(hasPalletJackProblem || hasTrailerIssue);
  }, [watchPalletJackChecklist, watchTrailerChecklist]);

  useEffect(() => {
    const [refrigeratorUnitTemperature] = watchLoadInformation;

    // ✅ Check if tempExc should be true
    const exceedsTempLimit = parseFloat(refrigeratorUnitTemperature) > 32;
    setTempExc(exceedsTempLimit);
  }, [watchLoadInformation]);

  useEffect(() => {
    const [returnDateTime, returnLB, returnPW, returnHT] = watchLoadReturn;

    // Check if all fields are filled and have no validation errors
    const isComplete =
      returnDateTime?.trim() !== "" &&
      returnLB?.trim() !== "" &&
      returnPW?.trim() !== "" &&
      returnHT?.trim() !== "" &&
      !errors.returnDateTime &&
      !errors.returnLB &&
      !errors.returnPW &&
      !errors.returnHT;

    setIsLoadReturnOK(isComplete);
  }, [watchLoadReturn, errors]); // Re-run when any field changes or an error occurs

  // This is an useEffect to populate the Logistics Information by routeNumber
  useEffect(() => {
    if (!routeNumber) {
      // If routeNumber is empty, reset the relevant fields
      reset((prev) => ({
        ...prev,
        routeName: "",
        deliveryDate: "",
        driver: "",
        helper: "",
      }));
      return;
    }

    const getRouteInfo = async () => {
      try {
        const response = await axios.get(
          `https://integration.eastlandfood.com/efc/cargo-inspection/routeInfo/${routeNumber}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.accessToken}`,
            },
            withCredentials: true,
          }
        );

        if (!response.data) return;

        const data = response.data;
        // Map API response fields to form fields
        const updatedData = {
          routeName: data.U_Title || "", // Route Name
          site: data.Site || "",
          deliveryDate: data.U_DocDueDate
            ? new Date(data.U_DocDueDate).toISOString().split("T")[0]
            : "", // Delivery Date formatted as YYYY-MM-DD
          driver: data.Name || "", // Driver Name
          helper: data["Name:2"] || "", // Helper Name
        };

        reset((prev) => ({
          ...prev,
          ...updatedData, // Update only relevant fields
        }));
      } catch (error) {
        console.error("Error fetching route info:", error);
      }
    };

    getRouteInfo();
  }, [routeNumber, reset]);

  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstErrorField = errorKeys[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [errors]);

  useEffect(() => {
    if (!siteData || siteData.trim() === "") return;
    // Run these fetches only once on mount
    const fetchDropdowns = async () => {
      try {
        const [checkerRes, mergerRes, loaderRes, inspectorRes] =
          await Promise.all([
            axios.get(
              `https://integration.eastlandfood.com/efc/cargo-inspection/user_dropdown/checker/${siteData}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.accessToken}`,
                },
                withCredentials: true,
              }
            ),
            axios.get(
              `https://integration.eastlandfood.com/efc/cargo-inspection/user_dropdown/merger/${siteData}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.accessToken}`,
                },
                withCredentials: true,
              }
            ),
            axios.get(
              `https://integration.eastlandfood.com/efc/cargo-inspection/user_dropdown/loader/${siteData}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.accessToken}`,
                },
                withCredentials: true,
              }
            ),
            axios.get(
              `https://integration.eastlandfood.com/efc/cargo-inspection/user_dropdown/inspector/${siteData}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.accessToken}`,
                },
                withCredentials: true,
              }
            ),
          ]);
        setCheckers(checkerRes.data || []);
        setMergers(mergerRes.data || []);
        setLoaders(loaderRes.data || []);
        setInspectors(inspectorRes.data || []);
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
        setCheckers([]);
        setMergers([]);
        setLoaders([]);
        setInspectors([]);
      }
    };

    fetchDropdowns();
    // You might use an empty dependency array if siteData is fixed once loaded,
    // or include [siteData] if it can change manually.
  }, [siteData]);

  const statusMapping = {
    0: "Completed",
    1: "Incomplete",
    2: "Waiting",
    3: "New",
  };

  useEffect(() => {
    if (!routeNum) return;

    const getData = async () => {
      try {
        // Fetch dropdown options first.
        // (If the site value is part of the record data, you might fetch dropdowns using that value.)
        const siteForDropdown =
          siteData && siteData.trim() !== "" ? siteData : "defaultSite"; // adjust as needed
        const [checkerRes, mergerRes, loaderRes, inspectorRes] =
          await Promise.all([
            axios.get(
              `https://integration.eastlandfood.com/efc/cargo-inspection/user_dropdown/checker/${siteForDropdown}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.accessToken}`,
                },
                withCredentials: true,
              }
            ),
            axios.get(
              `https://integration.eastlandfood.com/efc/cargo-inspection/user_dropdown/merger/${siteForDropdown}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.accessToken}`,
                },
                withCredentials: true,
              }
            ),
            axios.get(
              `https://integration.eastlandfood.com/efc/cargo-inspection/user_dropdown/loader/${siteForDropdown}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.accessToken}`,
                },
                withCredentials: true,
              }
            ),
            axios.get(
              `https://integration.eastlandfood.com/efc/cargo-inspection/user_dropdown/inspector/${siteForDropdown}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.accessToken}`,
                },
                withCredentials: true,
              }
            ),
          ]);
        setCheckers(checkerRes.data || []);
        setMergers(mergerRes.data || []);
        setLoaders(loaderRes.data || []);
        setInspectors(inspectorRes.data || []);

        // Now fetch the outbound data.
        const response = await axios.get(
          `https://integration.eastlandfood.com/efc/cargo-inspection/outbound/${routeNum}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          withCredentials: true,
        }
        );
        if (!response.data) return;
        const data = response.data;

        // Parse data – ensure that the fields for your dropdowns (e.g. checkerName, mergerName, loaderName)
        // exactly match one of the values in your fetched options.
        const parsedData = {
          carrier: data.carrier || "",
          outboundStatus: data.outboundStatus,
          site: data.site || "",
          routeNumber: data.route_number || "",
          routeName: data.route_name || "",
          deliveryDate: data.delivery_date
            ? new Date(data.delivery_date).toISOString().split("T")[0]
            : "",
          tractorStTruck: data.tractor || "",
          trailer: data.trailer || "",
          driver: data.driver || "",
          helper: data.helper || "",
          // For fields that are stored as JSON strings:
          handTruckNo: data.assigned_load_equipment
            ? JSON.parse(data.assigned_load_equipment).handTruckNo || ""
            : "",
          poweredPalletJackNo: data.assigned_load_equipment
            ? JSON.parse(data.assigned_load_equipment).poweredPalletJackNo || ""
            : "",
          loadBarCount: data.assigned_load_equipment
            ? JSON.parse(data.assigned_load_equipment).loadBarCount || ""
            : "",
          palletJackNotes: data.powered_plt_jack_inspection
            ? JSON.parse(data.powered_plt_jack_inspection).notes || ""
            : "",
          ...(data.powered_plt_jack_inspection
            ? JSON.parse(data.powered_plt_jack_inspection).checklist.reduce(
              (acc, item, index) => ({
                ...acc,
                [`pallet-check-${index}`]: item || "",
              }),
              {}
            )
            : {}),
          ...(data.load_info
            ? {
              checkerName: JSON.parse(data.load_info).checkerName || "",
              mergerName: JSON.parse(data.load_info).mergerName || "",
              loaderName: JSON.parse(data.load_info).loaderName || "",
              inspectorName: JSON.parse(data.load_info).inspectorName || "",
              inspectionDateTime:
                JSON.parse(data.load_info).inspectionDateTime || "",
              loadingDockNo: JSON.parse(data.load_info).loadingDockNo || "",
              refrigeratorThermostat:
                JSON.parse(data.load_info).refrigeratorThermostat || "",
              refrigeratorUnitTemperature:
                JSON.parse(data.load_info).refrigeratorUnitTemperature || "",
              reeferTurningOnTime:
                JSON.parse(data.load_info).reeferTurningOnTime || "",
              reeferTurningOnTemperature:
                JSON.parse(data.load_info).reeferTurningOnTemperature || "",
              reeferAfterLoadingTemperature:
                JSON.parse(data.load_info).reeferAfterLoadingTemperature ||
                "",
              startLoadingTime:
                JSON.parse(data.load_info).startLoadingTime || "",
              finishedLoadingTime:
                JSON.parse(data.load_info).finishedLoadingTime || "",
            }
            : {}),
          trailerInspectionComment: data.trailer_inspection
            ? JSON.parse(data.trailer_inspection).comment || ""
            : "",
          ...(data.trailer_inspection
            ? JSON.parse(data.trailer_inspection).checklist.reduce(
              (acc, area, areaIndex) =>
                area.items.reduce(
                  (itemAcc, item, itemIndex) => ({
                    ...itemAcc,
                    [`trailer-check-${areaIndex}-${itemIndex}`]:
                      item.value || "",
                  }),
                  acc
                ),
              {}
            )
            : {}),
          ...(data.loading_summary
            ? {
              dateRecord: JSON.parse(data.loading_summary).dateRecord || "",
              totalWeight: JSON.parse(data.loading_summary).totalWeight || "",
              totalPallet: JSON.parse(data.loading_summary).totalPallet || "",
              iceCream: JSON.parse(data.loading_summary).iceCream || "",
              foilCount: JSON.parse(data.loading_summary).foilCount || "",
              ...JSON.parse(data.loading_summary).positions.reduce(
                (acc, pos, index) => ({
                  ...acc,
                  [`position${index + 1}`]: pos.weight || "",
                  [`stop${index + 1}`]: pos.stop || "",
                }),
                {}
              ),
            }
            : {}),
          ...(data.loading_return
            ? {
              returnDateTime:
                JSON.parse(data.loading_return).returnDateTime || "",
              returnLB: JSON.parse(data.loading_return).returnLB || "",
              returnPW: JSON.parse(data.loading_return).returnPW || "",
              returnHT: JSON.parse(data.loading_return).returnHT || "",
            }
            : {}),
        };

        // Now that dropdown options are loaded, call reset with the parsed data.
        reset(parsedData);
        setOutboundData(data);
        setFormStatus(data.outbound_status);
      } catch (error) {
        console.error("Error fetching outbound data: ", error);
      }
    };

    getData();
  }, [routeNum, reset, siteData]);

  return (
    <div className="min-h-screen bg-[#f9fafb] py-8 mt-[3rem]">
      {isLoading && <LoadingOverlay message="Saving pdf to Google drive" />}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
      >
        <div className="p-6 space-y-8">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Outbound: Loading Summary{" "}
            <span className="text-green-600">{statusMapping[formStatus]} </span>
          </h1>
          <LogisticsInformation
            register={register}
            control={control}
            errors={errors}
          />
          <AssignedLoadEquipment register={register} errors={errors} />
          <PoweredPalletJackInspection
            register={register}
            control={control}
            errors={errors}
          />
          <LoadInformation
            register={register}
            control={control}
            errors={errors}
            checkers={checkers}
            mergers={mergers}
            loaders={loaders}
            inspectors={inspectors}
          />
          <TrailerInspectionChecklist
            register={register}
            control={control}
            errors={errors}
          />
          <LoadingSummary
            register={register}
            control={control}
            errors={errors}
          />
          {formStatus === 0 || formStatus === 2 ? (
            <LoadingReturn register={register} errors={errors} />
          ) : (
            <></>
          )}

          <div className="flex justify-end space-x-4">
            {/* Save as Draft */}
            {formStatus === 1 || formStatus === 3 ? (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    // console.log(`formStatus on click: ${formStatus}`);
                    // console.log(`load return: ${isLoadReturnOK}`);
                    setFormStatus(1);
                    setValue("mode", "incomplete", { shouldValidate: true });
                    const submitData = await getValues();
                    handleSubmit(
                      onSubmit({ ...submitData, outboundStatus: 1 })
                    )();
                  } catch (error) {
                    console.error("Couldn't submit outbound draft: ", error);
                  }
                }}
              >
                Save
              </Button>
            ) : (
              <></>
            )}

            {/* Submit as Completed */}
            <Button
              type="button"
              onClick={async () => {
                try {
                  // console.log(`formStatus on click: ${formStatus}`);
                  // console.log(`load return: ${isLoadReturnOK}`);
                  if (formStatus === 0) {
                    setValue("mode", "completed", { shouldValidate: true });
                    const isValid = await trigger();
                    if (!isValid) {
                      return;
                    } else {
                      const submitData = await getValues();
                      onSubmit({ ...submitData, outboundStatus: 0 });
                    }
                  } else if (formStatus === 1) {
                    setValue("mode", "waiting", { shouldValidate: true });
                    const isValid = await trigger();
                    if (!isValid) return;
                    else {
                      const submitData = await getValues();
                      setFormStatus(2);
                      onSubmit({ ...submitData, outboundStatus: 2 });
                    }
                  } else if (formStatus === 2) {
                    setValue("mode", "completed", { shouldValidate: true });
                    const isValid = await trigger();
                    if (!isValid) return;
                    else {
                      const submitData = await getValues();
                      setFormStatus(0);
                      onSubmit({ ...submitData, outboundStatus: 0 });
                    }
                  } else if (formStatus === 3) {
                    setValue("mode", "waiting", { shouldValidate: true });
                    const isValid = await trigger();
                    if (!isValid) return;
                    else {
                      const submitData = await getValues();
                      setFormStatus(2);
                      onSubmit({ ...submitData, outboundStatus: 2 });
                    }
                  }
                } catch (error) {
                  console.error("Form submission failed:", error);
                }
              }}
            >
              Submit
            </Button>
            {formStatus === 0 || formStatus === 2 ? (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const formData = getValues();
                  const pdfData = {
                    ...formData,
                    email: "louis@eastlandfood.com",
                  };
                  try {
                    setIsLoading(true);
                    const response = await axios.post(
                      `https://integration.eastlandfood.com/efc/cargo-inspection/pdfOutbound`,
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
                    console.error("Couldn't print outbound pdf: ", error);
                  } finally {
                    setIsLoading(false);

                  }
                }}
              >
                Outbound Pdf
              </Button>
            ) : (
              <></>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── CHILD COMPONENTS ───────────────────────────────────────────────

// 1. Logistics Information
function LogisticsInformation({ register, control, errors }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-left">
          Logistics Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6">
        <div>
          <Label
            htmlFor="carrier"
            className="mb-2 block text-left"
            id="carrier"
          >
            Carrier
          </Label>
          <Controller
            control={control}
            name="carrier"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efc">EFC</SelectItem>
                  <SelectItem value="3pl">3PL</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.carrier && (
            <p className="text-red-500">{errors.carrier.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="routeNumber" className="mb-2 block text-left">
            Route Number
          </Label>
          <Input id="routeNumber" {...register("routeNumber")} />
          {errors.routeNumber && (
            <p className="text-red-500">{errors.routeNumber.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="routeName" className="mb-2 block text-left">
            Route Name
          </Label>
          <Input id="routeName" {...register("routeName")} />
          {errors.routeName && (
            <p className="text-red-500">{errors.routeName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="site" className="mb-2 block text-left" id="site">
            Site
          </Label>
          <Controller
            control={control}
            name="site"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MD">MD</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="IL">IL</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.site && <p className="text-red-500">{errors.site.message}</p>}
        </div>

        <div>
          <Label htmlFor="deliveryDate" className="mb-2 block text-left">
            Delivery Date
          </Label>
          <Input id="deliveryDate" type="date" {...register("deliveryDate")} />
          {errors.deliveryDate && (
            <p className="text-red-500">{errors.deliveryDate.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="tractorStTruck" className="mb-2 block text-left">
            Tractor/St Truck
          </Label>
          <Input id="tractorStTruck" {...register("tractorStTruck")} />
          {errors.tractorStTruck && (
            <p className="text-red-500">{errors.tractorStTruck.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="trailer" className="mb-2 block text-left">
            Trailer
          </Label>
          <Input id="trailer" {...register("trailer")} />
          {errors.trailer && (
            <p className="text-red-500">{errors.trailer.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="driver" className="mb-2 block text-left">
            Driver
          </Label>
          <Input id="driver" {...register("driver")} />
          {errors.driver && (
            <p className="text-red-500">{errors.driver.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="helper" className="mb-2 block text-left">
            Helper
          </Label>
          <Input id="helper" {...register("helper")} />
          {errors.helper && (
            <p className="text-red-500">{errors.helper.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 2. Assigned Load Equipment
function AssignedLoadEquipment({ register, errors }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-left">
          Assigned Load Equipment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead>Out</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-left">
                Hand Truck No.
              </TableCell>
              <TableCell>
                <Input id="handTruckNo" {...register("handTruckNo")} />
                {errors.handTruckNo && (
                  <p className="text-red-500">{errors.handTruckNo.message}</p>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-left">
                Powered Pallet Jack No.
              </TableCell>
              <TableCell>
                <Input
                  id="poweredPalletJackNo"
                  {...register("poweredPalletJackNo")}
                />
                {errors.poweredPalletJackNo && (
                  <p className="text-red-500">
                    {errors.poweredPalletJackNo.message}
                  </p>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-left">
                How many load bars?
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  id="loadBarCount"
                  {...register("loadBarCount")}
                />
                {errors.loadBarCount && (
                  <p className="text-red-500">{errors.loadBarCount.message}</p>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// 3. Powered Pallet Jack Inspection
function PoweredPalletJackInspection({ register, control, errors }) {
  const checklistItems = [
    "No physical damage & leak",
    "Tires and Load Wheels",
    "Fully charged battery",
    "Steering",
    "Drive: forward & reverse",
    "Load handling: up & down",
    "Plugging, cables & hoses",
    "Horn",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-left">
          Powered Pallet Jack Inspection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead className="text-left" colSpan={2}>
                Out
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checklistItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell
                  className="font-medium text-left"
                  id={`pallet-check-${index}`}
                >
                  {item}
                </TableCell>
                <TableCell className="text-center" colSpan={2}>
                  <Controller
                    control={control}
                    name={`pallet-check-${index}`}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <div className="flex items-center space-x-20">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ok" id={`ok-${index}`} />
                            <Label htmlFor={`ok-${index}`}>OK</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="problem"
                              id={`problem-${index}`}
                            />
                            <Label htmlFor={`problem-${index}`}>Problem</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors[`pallet-check-${index}`] && (
                    <p className="text-red-500">
                      {errors[`pallet-check-${index}`].message}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 text-left">
          <Label htmlFor="palletJackNotes">Notes</Label>
          <Textarea id="palletJackNotes" {...register("palletJackNotes")} />
          {errors.palletJackNotes && (
            <p className="text-red-500">{errors.palletJackNotes.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 4. Load Information
function LoadInformation({
  register,
  control,
  errors,
  checkers = [],
  mergers = [],
  loaders = [],
  inspectors = [],
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-left">
          Load Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="checkerName"
            id="checkerName"
            className="mb-2 block text-left"
          >
            Checker
          </Label>
          <Controller
            control={control}
            name="checkerName"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {checkers.map((checker) => (
                    <SelectItem key={checker.user_id} value={checker.name}>
                      {checker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.checkerName && (
            <p className="text-red-500">{errors.checkerName.message}</p>
          )}
        </div>
        <div>
          <Label
            htmlFor="mergerName"
            id="mergerName"
            className="mb-2 block text-left"
          >
            Merger
          </Label>
          <Controller
            control={control}
            name="mergerName"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {mergers.map((merger) => (
                    <SelectItem key={merger.user_id} value={merger.name}>
                      {merger.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.mergerName && (
            <p className="text-red-500">{errors.mergerName.message}</p>
          )}
        </div>
        <div>
          <Label
            htmlFor="loaderName"
            id="loaderName"
            className="mb-2 block text-left"
          >
            Loader
          </Label>
          <Controller
            control={control}
            name="loaderName"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {loaders.map((loader) => (
                    <SelectItem key={loader.user_id} value={loader.name}>
                      {loader.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.loaderName && (
            <p className="text-red-500">{errors.loaderName.message}</p>
          )}
        </div>
        <div>
          <Label
            htmlFor="inspectorName"
            id="inspectorName"
            className="mb-2 block text-left"
          >
            Inspector
          </Label>
          <Controller
            control={control}
            name="inspectorName"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {inspectors.map((inspector) => (
                    <SelectItem key={inspector.user_id} value={inspector.name}>
                      {inspector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.inspectorName && (
            <p className="text-red-500">{errors.inspectorName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="inspectionDateTime" className="mb-2 block text-left">
            Inspection Date & Time
          </Label>
          <Input
            id="inspectionDateTime"
            type="datetime-local"
            {...register("inspectionDateTime")}
          />
          {errors.inspectionDateTime && (
            <p className="text-red-500">{errors.inspectionDateTime.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="loadingDockNo" className="mb-2 block text-left">
            Loading Dock No#
          </Label>
          <Input id="loadingDockNo" {...register("loadingDockNo")} />
          {errors.loadingDockNo && (
            <p className="text-red-500">{errors.loadingDockNo.message}</p>
          )}
        </div>
        <div>
          <Label
            htmlFor="refrigeratorThermostat"
            id="refrigeratorThermostat"
            className="mb-2 block text-left"
          >
            Refrigerator Thermostat Set at 32 °F / 0 °C
          </Label>
          <Controller
            control={control}
            name="refrigeratorThermostat"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.refrigeratorThermostat && (
            <p className="text-red-500">
              {errors.refrigeratorThermostat.message}
            </p>
          )}
        </div>
        <div>
          <Label
            htmlFor="refrigeratorUnitTemperature"
            className="mb-2 block text-left"
          >
            Refrigerator Unit Temperature Setting (°F)
          </Label>
          <Input
            id="refrigeratorUnitTemperature"
            type="number"
            {...register("refrigeratorUnitTemperature")}
          />
          {errors.refrigeratorUnitTemperature && (
            <p className="text-red-500">
              {errors.refrigeratorUnitTemperature.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="reeferTurningOnTime" className="mb-2 block text-left">
            Reefer Turning On Time Start
          </Label>
          <Input
            id="reeferTurningOnTime"
            type="time"
            {...register("reeferTurningOnTime")}
          />
          {errors.reeferTurningOnTime && (
            <p className="text-red-500">{errors.reeferTurningOnTime.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="startLoadingTime" className="mb-2 block text-left">
            Start Loading Time
          </Label>
          <Input
            id="startLoadingTime"
            type="time"
            {...register("startLoadingTime")}
          />
          {errors.startLoadingTime && (
            <p className="text-red-500">{errors.startLoadingTime.message}</p>
          )}
        </div>
        <div>
          <Label
            htmlFor="reeferTurningOnTemperature"
            className="mb-2 block text-left"
          >
            Reefer Temperature at Start Loading Time (°F)
          </Label>
          <Input
            id="reeferTurningOnTemperature"
            type="number"
            {...register("reeferTurningOnTemperature")}
          />
          {errors.reeferTurningOnTemperature && (
            <p className="text-red-500">
              {errors.reeferTurningOnTemperature.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="finishedLoadingTime" className="mb-2 block text-left">
            Finished Loading Time
          </Label>
          <Input
            id="finishedLoadingTime"
            type="time"
            {...register("finishedLoadingTime")}
          />
          {errors.finishedLoadingTime && (
            <p className="text-red-500">{errors.finishedLoadingTime.message}</p>
          )}
        </div>
        <div>
          <Label
            htmlFor="reeferAfterLoadingTemperature"
            className="mb-2 block text-left"
          >
            Reefer after Loading Temperature (°F)
          </Label>
          <Input
            id="reeferAfterLoadingTemperature"
            type="number"
            {...register("reeferAfterLoadingTemperature")}
          />
          {errors.reeferAfterLoadingTemperature && (
            <p className="text-red-500">
              {errors.reeferAfterLoadingTemperature.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 5. Trailer Inspection Checklist
function TrailerInspectionChecklist({ register, control, errors }) {
  const checklistItems = [
    {
      area: "Refrigeration Unit",
      items: ["Refrigerator Unit Operational", "Vents Closed"],
    },
    {
      area: "Cleanliness",
      items: [
        "Floors Free of Rubbish, Product Residue or Insects",
        "Walls Free of Product Residue and Tape",
        "Drains Open & Unobstructed (Free Flowing)",
        "Absence of Odor(S)",
      ],
    },
    {
      area: "Condition",
      items: [
        "Ceiling Undamaged",
        "Air Delivery Chute Intact & Functional",
        "Door Seals Intact & in Good Repair",
        "Door Undamaged",
        "Walls & Wall Insulation Undamaged",
        "Floors in Good Repair",
      ],
    },
    { area: "Final Result", items: ["Satisfactory for loading"] },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-left">
          Trailer Inspection Checklist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Area</th>
              <th className="text-left">Item</th>
              <th className="text-center" colSpan={2}>
                Satisfactory Condition
              </th>
            </tr>
          </thead>
          <tbody>
            {checklistItems.map((area, areaIndex) => (
              <React.Fragment key={areaIndex}>
                {area.items.map((item, itemIndex) => (
                  <tr
                    key={`${areaIndex}-${itemIndex}`}
                    className="border-t"
                    id={`trailer-check-${areaIndex}-${itemIndex}`}
                  >
                    {itemIndex === 0 && (
                      <td
                        rowSpan={area.items.length}
                        className="align-top py-2 text-left"
                      >
                        {area.area}
                      </td>
                    )}
                    <td className="py-2 text-left">{item}</td>
                    <td className="py-2 text-center" colSpan={2}>
                      <Controller
                        control={control}
                        name={`trailer-check-${areaIndex}-${itemIndex}`}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <div className="flex items-center space-x-20">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="yes"
                                  id={`yes-${areaIndex}-${itemIndex}`}
                                />
                                <Label
                                  htmlFor={`yes-${areaIndex}-${itemIndex}`}
                                >
                                  Yes
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="no"
                                  id={`no-${areaIndex}-${itemIndex}`}
                                />
                                <Label htmlFor={`no-${areaIndex}-${itemIndex}`}>
                                  No
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {errors[`trailer-check-${areaIndex}-${itemIndex}`] && (
                        <p className="text-red-500">
                          {
                            errors[`trailer-check-${areaIndex}-${itemIndex}`]
                              .message
                          }
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <div className="mt-4">
          <Label
            htmlFor="trailerInspectionComment"
            className="mb-2 block text-left"
          >
            Comment
          </Label>
          <Textarea
            id="trailerInspectionComment"
            {...register("trailerInspectionComment")}
          />
          {errors.trailerInspectionComment && (
            <p className="text-red-500">
              {errors.trailerInspectionComment.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 6. Loading Summary
function LoadingSummary({ register, control, errors }) {
  const positions = Array.from({ length: 24 }, (_, i) => 24 - i);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-left">
          Loading Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 mb-4 text-left">
          <div>
            <Label htmlFor="dateRecord">Date Record</Label>
            <Input id="dateRecord" type="date" {...register("dateRecord")} />
            {errors.dateRecord && (
              <p className="text-red-500">{errors.dateRecord.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4 text-left">
          {positions.map((position) => (
            <div key={position} className="space-y-2">
              <Label htmlFor={`position${position}`}>Position {position}</Label>
              <Input
                id={`position${position}`}
                placeholder="Weight"
                {...register(`position${position}`)}
              />
              <Input
                id={`stop${position}`}
                placeholder="Stop"
                {...register(`stop${position}`)}
              />
              {/* Add a horizontal bar after position 14 */}
              {position === 13 && (
                <div className="col-span-2 h-8 bg-gray-400 opacity-50 my-2"></div>
              )}
              {position === 14 && (
                <div className="col-span-2 h-8 bg-gray-400 opacity-50 my-2"></div>
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="totalWeight" className="mb-2 block text-left">
              Total Weight (LBS)
            </Label>
            <Input
              id="totalWeight"
              type="number"
              {...register("totalWeight")}
            />
            {errors.totalWeight && (
              <p className="text-red-500">{errors.totalWeight.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="totalPallet" className="mb-2 block text-left">
              Total Pallet
            </Label>
            <Input
              id="totalPallet"
              type="number"
              {...register("totalPallet")}
            />
            {errors.totalPallet && (
              <p className="text-red-500">{errors.totalPallet.message}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Label className="mb-2 block text-left">Ice Cream</Label>
          <Controller
            control={control}
            name="iceCream"
            render={({ field }) => (
              <RadioGroup {...field}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="have" id="iceCreamHave" />
                  <Label htmlFor="iceCreamHave">Have</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="iceCreamNo" />
                  <Label htmlFor="iceCreamNo">No</Label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.iceCream && (
            <p className="text-red-500">{errors.iceCream.message}</p>
          )}
        </div>
        <div className="mt-4">
          <Label htmlFor="foilCount" className="mb-2 block text-left">
            Number of FOIL
          </Label>
          <Input id="foilCount" type="number" {...register("foilCount")} />
          {errors.foilCount && (
            <p className="text-red-500">{errors.foilCount.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingReturn({ register, errors }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-left">
          LOADING (RETURN)
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="returnDateTime" className="mb-2 block text-left">
            Date and Time Return
          </Label>
          <Input
            id="returnDateTime"
            type="datetime-local"
            {...register("returnDateTime")}
          />
          {errors.returnDateTime && (
            <p className="text-red-500">{errors.returnDateTime.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="returnLB" className="mb-2 block text-left">
            LB
          </Label>
          <Input id="returnLB" {...register("returnLB")} />
          {errors.returnLB && (
            <p className="text-red-500">{errors.returnLB.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="returnPW" className="mb-2 block text-left">
            PW
          </Label>
          <Input id="returnPW" {...register("returnPW")} />
          {errors.returnPW && (
            <p className="text-red-500">{errors.returnPW.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="returnHT" className="mb-2 block text-left">
            H-T
          </Label>
          <Input id="returnHT" {...register("returnHT")} />
          {errors.returnHT && (
            <p className="text-red-500">{errors.returnHT.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
