import { z } from "zod";
import axios from "axios";

// Common schema properties (for reusability)
const positions = (() => {
  const pos = {};
  for (let i = 1; i <= 24; i++) {
    pos[`position${i}`] = z.string().optional();
    pos[`stop${i}`] = z.string().optional();
  }
  return pos;
})();

const baseFields = {
  carrier: z.string().min(1, "Carrier is required"),
  site: z.string().min(1, "Site is required"),
  routeNumber: z.string().min(1, "Route number is required"),
  routeName: z.string().min(1, "Route name is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  tractorStTruck: z.string().min(1, "tractorStTruck is required"),
  trailer: z.string().min(1, "Delivery date is required"),
  driver: z.string().min(1, "Delivery date is required"),
  helper: z.string().optional(),
};

// Draft Schema (Only first section is required, others optional)
export const draftSchema = z.object({
  mode: z.literal("incomplete"),
  ...baseFields,

  // Assigned Load Equipment (optional)
  handTruckNo: z.string().optional(),
  poweredPalletJackNo: z.string().optional(),
  loadBarCount: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().optional()
  ),

  // Powered Pallet Jack Inspection (optional)
  ...Object.fromEntries(
    [...Array(8).keys()].map((i) => [
      `pallet-check-${i}`,
      z.enum(["ok", "problem"]).optional(),
    ])
  ),
  palletJackNotes: z.string().optional(),

  // Load Information (optional)
  checkerName: z.string().optional(),
  mergerName: z.string().optional(),
  loaderName: z.string().optional(),
  inspectorName: z.string().optional(),
  inspectionDateTime: z.string().optional(),
  loadingDockNo: z.string().optional(),
  refrigeratorThermostat: z.string().optional(),
  refrigeratorUnitTemperature: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().optional()
  ),
  reeferTurningOnTime: z.string().optional(),
  reeferTurningOnTemperature: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().optional()
  ),
  reeferAfterLoadingTemperature: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().optional()
  ),
  startLoadingTime: z.string().optional(),
  finishedLoadingTime: z.string().optional(),

  // Trailer Inspection Checklist (optional)
  ...Object.fromEntries(
    [...Array(4).keys()].flatMap((area) =>
      [
        ...Array(area === 0 ? 2 : area === 1 ? 4 : area === 2 ? 6 : 1).keys(),
      ].map((item) => [
        `trailer-check-${area}-${item}`,
        z.enum(["yes", "no"]).optional(),
      ])
    )
  ),
  trailerInspectionComment: z.string().optional(),

  // Loading Summary (optional)
  dateRecord: z.string().optional(),
  ...positions,
  totalWeight: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().optional()
  ),
  totalPallet: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().optional()
  ),
  iceCream: z.string().optional(),
  foilCount: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().optional()
  ),
  returnDateTime: z.string().optional(),
  returnLB: z.string().optional(),
  returnPW: z.string().optional(),
  returnHT: z.string().optional(),
});

// Submit Schema (All fields are required)
export const submitSchema = draftSchema.extend({
  mode: z.literal("waiting"),
  // Assigned Load Equipment
  handTruckNo: z.string().min(1, "Hand Truck No is required"),
  poweredPalletJackNo: z.string().min(1, "Powered Pallet Jack No is required"),
  loadBarCount: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().min(1, "Load Bar Count is required")
  ),

  // Powered Pallet Jack Inspection (mandatory)
  ...Object.fromEntries(
    [...Array(8).keys()].map((i) => [
      `pallet-check-${i}`,
      z.enum(["ok", "problem"]),
    ])
  ),
  palletJackNotes: z.string().optional(),

  // Load Information
  checkerName: z.string().min(1, "Checker Name is required"),
  mergerName: z.string().min(1, "Merger Name is required"),
  loaderName: z.string().min(1, "Loader Name is required"),
  inspectorName: z.string().min(1, "Inspector Name is required"),
  inspectionDateTime: z.string().min(1, "Inspection Date & Time is required"),
  loadingDockNo: z.string().min(1, "Loading Dock No is required"),
  refrigeratorThermostat: z
    .string()
    .min(1, "Refrigerator Thermostat is required"),
  refrigeratorUnitTemperature: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().min(1, "Refrigerator Unit Temperature is required")
  ),
  reeferTurningOnTime: z.string().min(1, "Reefer Turning On Time is required"),
  reeferTurningOnTemperature: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().min(1, "Reefer Turning On Temperature is required")
  ),
  reeferAfterLoadingTemperature: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().min(1, "Reefer After Loading Temperature is required")
  ),
  startLoadingTime: z.string().min(1, "Start Loading Time is required"),
  finishedLoadingTime: z.string().min(1, "Finished Loading Time is required"),

  // Trailer Inspection Checklist (mandatory)
  ...Object.fromEntries(
    [...Array(4).keys()].flatMap((area) =>
      [
        ...Array(area === 0 ? 2 : area === 1 ? 4 : area === 2 ? 6 : 1).keys(),
      ].map((item) => [`trailer-check-${area}-${item}`, z.enum(["yes", "no"])])
    )
  ),
  trailerInspectionComment: z.string().optional(),

  // Loading Summary (mandatory)
  dateRecord: z.string().min(1, "Date Record is required"),
  //   ...Object.fromEntries(
  //     Object.keys(positions).map((key) => [
  //       key,
  //       z.string().min(1, `${key} is required`),
  //     ])
  //   ),
  totalWeight: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().min(1, "Total Weight is required")
  ),
  totalPallet: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().min(1, "Total Pallet is required")
  ),
  iceCream: z.string().min(1, "Ice Cream selection is required"),
  foilCount: z.preprocess(
    (a) => (a === "" ? undefined : Number(a)),
    z.number().min(1, "Foil Count is required")
  ),
  returnDateTime: z.string().optional(),
  returnLB: z.string().optional(),
  returnPW: z.string().optional(),
  returnHT: z.string().optional(),
});

export const submitLoadingReturnSchema = submitSchema.extend({
  mode: z.literal("completed"),
  returnDateTime: z.string().min(1, "Return Date is required"),
  returnLB: z.string().min(1, "Return LB is required"),
  returnPW: z.string().min(1, "Return PW is required"),
  returnHT: z.string().min(1, "Return HT is required"),
});

export const newSchema = submitSchema.extend({
  mode: z.literal("new"),
  routeNumber: z
    .string()
    .min(1, "Route Number is required")
    .refine(async (value) => {
      try {
        const response = await axios.get(
          `https://integration.eastlandfood.com/efc/cargo-inspection/outbound/${value}`
        );
        return response.data.length === 0; // ✅ If length > 0, routeNumber exists, so return false
      } catch (error) {
        console.error("Error checking route number:", error);
        return true; // ✅ If API fails, don't block input
      }
    }, "This Route Number already exists"),
});

export const unionSchema = z.discriminatedUnion("mode", [
  draftSchema,
  submitSchema,
  submitLoadingReturnSchema,
  newSchema,
]);
