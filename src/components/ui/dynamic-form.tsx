import React, { useState } from "react";
import { z, ZodTypeAny, ZodObject, ZodEnum, ZodNumber, ZodString } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./form";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Button } from "./button";

interface DynamicFormProps {
  schema: ZodObject<any>;
  onSubmit: (values: any) => Promise<any>;
  submitLabel?: string;
}

export default function DynamicForm({
  schema,
  onSubmit,
  submitLabel = "Submit",
}: DynamicFormProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate default values based on Zod schema
  const generateDefaultValues = () => {
    const defaults: Record<string, any> = {
      // Sensible defaults based on the schema
      pregnancies: 0,
      glucose: 110, // Normal is 70-140, using middle ground
      bloodPressure: 80, // Normal is around 120/80
      skinThickness: 20, // Middle value for skin fold thickness
      insulin: 79, // Middle range for normal insulin
      bmi: 24.9, // Normal BMI range 18.5-24.9
      diabetesPedigree: 0.5, // Middle of range
      age: 35, // Middle-aged adult
      gender: "0", // Default to female
    };

    // Only include fields that exist in the schema
    return Object.entries(schema.shape).reduce((acc, [key]) => {
      if (key in defaults) {
        acc[key] = defaults[key];
      }
      return acc;
    }, {} as Record<string, any>);
  };

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: generateDefaultValues(),
  });

  const fields = Object.entries(schema.shape) as [string, ZodTypeAny][];

  async function handleSubmit(values: any) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await onSubmit(values);
      setResult(res);
    } catch (e: any) {
      setError(e?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {fields.map(([name, field]) => {
          // Hide pregnancies if gender is not female
          if (
            name === "pregnancies" &&
            form.watch("gender") !== undefined &&
            form.watch("gender") !== "0"
          ) {
            return null;
          }
          // Enum (select)
          if (field instanceof ZodEnum) {
            return (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>{field.description || name}</FormLabel>
                    <Select onValueChange={f.onChange} value={f.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${name}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={String(opt)} value={String(opt)}>
                            {opt === "0"
                              ? "Female"
                              : opt === "1"
                              ? "Male"
                              : String(opt)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }
          // Number or string (input)
          if (field instanceof ZodNumber || field instanceof ZodString) {
            return (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>{field.description || name}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...f}
                        value={f.value ?? ""}
                        step={field instanceof ZodNumber ? "any" : undefined}
                        inputMode="decimal"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }
          // Fallback: string input
          return (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>{field.description || name}</FormLabel>
                  <FormControl>
                    <Input {...f} value={f.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : submitLabel}
        </Button>
      </form>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {result && (
        <div className="mt-6 p-4 border rounded ">
          {result.probability !== undefined && (
            <div className="font-semibold">
              Probability: {result.probability}
            </div>
          )}
          <div className="mt-2 whitespace-pre-line">
            {result.analysis || JSON.stringify(result)}
          </div>
        </div>
      )}
    </Form>
  );
}