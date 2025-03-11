/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";
import { Button } from "@/components/ui/button";

export function SignaturePadComponent({ onSave }) {
  const sigPad = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigPad.current?.clear();
    setIsEmpty(true);
    onSave(null);
  };

  const handleEnd = () => {
    if (sigPad.current.isEmpty()) return; // Avoid saving empty signature
    setIsEmpty(false);
    onSave(sigPad.current.toDataURL()); // Auto-save signature
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md h-[200px] flex items-center justify-center bg-white">
        <SignaturePad
          ref={sigPad}
          onBegin={() => setIsEmpty(false)}
          onEnd={handleEnd} // Auto-save when user stops drawing
          canvasProps={{
            className: "w-full h-full",
          }}
        />
      </div>

      {/* Keep only the Clear button since Save is now automatic */}
      <div className="flex justify-end gap-2">
        <Button onClick={clear} variant="outline" disabled={isEmpty}>
          Clear Signature
        </Button>
      </div>
    </div>
  );
}
