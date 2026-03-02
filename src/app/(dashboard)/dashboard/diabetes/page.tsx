"use client";

import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DynamicForm from "@/components/ui/dynamic-form";
import { useState } from "react";
import { ResultCard } from "@/components/ui/result-card";

// Define the form schema for diabetes prediction
const formSchema = z.object({
  pregnancies: z.number().min(0).max(20),
  glucose: z.number().min(0).max(300),
  bloodPressure: z.number().min(0).max(200),
  skinThickness: z.number().min(0).max(100),
  insulin: z.number().min(0).max(1000),
  bmi: z.number().min(10).max(80),
  diabetesPedigree: z.number().min(0).max(2.5),
  age: z.number().min(18).max(120),
  gender: z.enum(["0", "1"]), // Adding gender as the potential 9th feature
});

// Type for the form data
type FormData = z.infer<typeof formSchema>;

export default function DiabetesPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Handle form submission
  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      // Here you would call your API endpoint or prediction service
      // For now, let's simulate a response
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            probability: Math.random().toFixed(2),
            key_factors: [
              "High glucose level",
              "Elevated BMI",
              "Family history of diabetes",
            ],
            analysis:
              "Based on the provided data, this patient shows several risk factors for diabetes. Further testing is recommended.",
          });
        }, 1500);
      });

      setResult(response);
      return response;
    } catch (err: any) {
      setError(err.message || "Failed to process prediction");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] pt-28 p-4">
      <div className="w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Card */}
          <Card className="shadow-md border rounded-xl h-fit">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicForm
                schema={formSchema}
                onSubmit={handleSubmit}
                submitLabel="Calculate Risk"
              />
            </CardContent>
          </Card>

          {/* Results Card */}
          <div className="h-fit sticky top-20">
            <ResultCard
              result={result}
              loading={loading}
              error={error}
              title="Risk Assessment"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
