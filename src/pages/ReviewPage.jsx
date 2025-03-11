import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Verification } from "../components/Verification";
import { Validation } from "../components/Validation";

export function ReviewPage() {
  return (
    <div className="container mx-auto p-4 mt-10">
      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>
        <TabsContent value="verification">
          <Verification />
        </TabsContent>
        <TabsContent value="validation">
          <Validation />
        </TabsContent>
      </Tabs>
    </div>
  );
}
