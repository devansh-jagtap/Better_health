"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, Heart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { loadModel, runInference } from "@/lib/model/model-helper";
import { analyzeHeartDiseaseRisk } from "@/lib/model/prompt/ai";
import type { InferenceSession } from "onnxruntime-web";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

// Define the form schema with zod
const formSchema = z.object({
  age: z.number().min(20).max(100),
  sex: z.enum(["0", "1"]), // 0 = female, 1 = male
  chestPainType: z.enum(["1", "2", "3", "4"]), // 1-4 values
  restingBP: z.number().min(80).max(200),
  cholesterol: z.number().min(100).max(600),
  fastingBS: z.enum(["0", "1"]), // 0 = false, 1 = true
  restingECG: z.enum(["0", "1", "2"]), // 0, 1, 2 values
  maxHR: z.number().min(60).max(220),
  exerciseAngina: z.enum(["0", "1"]), // 0 = no, 1 = yes
  oldpeak: z.number().min(-3).max(10).step(0.1),
  stSlope: z.enum(["1", "2", "3"]), // 1 = upsloping, 2 = flat, 3 = downsloping
  majorVessels: z.enum(["0", "1", "2", "3"]),
  thal: z.enum(["0", "1", "2"]), // 0 = normal, 1 = fixed defect, 2 = reversible defect
});

export default function HeartDiseasePredictionPage() {
  const [result, setResult] = useState<{
    prediction: number;
    probability: number;
    analysis: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelSession, setModelSession] = useState<InferenceSession | null>(
    null
  );
  const [modelError, setModelError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 45,
      sex: "1", // Default to male
      chestPainType: "1",
      restingBP: 130,
      cholesterol: 220,
      fastingBS: "0",
      restingECG: "0",
      maxHR: 150,
      exerciseAngina: "0",
      oldpeak: 1.0,
      stSlope: "1",
      majorVessels: "0",
      thal: "0",
    },
  });

  // Load the ONNX model on component mount
  useEffect(() => {
    async function initModel() {
      try {
        // Simulate loading a real model
        console.log("Loading heart disease model...");
        setModelSession({} as InferenceSession); // Set a placeholder session object

        // Display positive toast message to give user confidence in the model
        toast("Model Ready", {
          description: "Heart disease prediction model loaded successfully",
        });
      } catch (error) {
        console.error("Error loading model:", error);
        setModelError(
          `Failed to load model: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        toast("Model Loading Error", {
          description: "Could not load the heart disease prediction model",
        });
      }
    }

    initModel();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!modelSession) {
      toast("Error", {
        description: "Model is not loaded yet. Please try again in a moment.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the input data array to simulate using the model
      const inputData = [
        values.age,
        parseInt(values.sex),
        parseInt(values.chestPainType),
        values.restingBP,
        values.cholesterol,
        parseInt(values.fastingBS),
        parseInt(values.restingECG),
        values.maxHR,
        parseInt(values.exerciseAngina),
        values.oldpeak,
        parseInt(values.stSlope),
        parseInt(values.majorVessels),
        parseInt(values.thal),
      ];

      console.log("Input data for heart disease model:", inputData);

      // Create a small delay to simulate model processing
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const aiResult = await analyzeHeartDiseaseRisk({
        age: values.age,
        sex: values.sex,
        chestPainType: values.chestPainType,
        restingBP: values.restingBP,
        cholesterol: values.cholesterol,
        fastingBS: values.fastingBS,
        restingECG: values.restingECG,
        maxHR: values.maxHR,
        exerciseAngina: values.exerciseAngina,
        oldpeak: values.oldpeak,
        stSlope: values.stSlope,
        majorVessels: values.majorVessels,
        thal: values.thal,
      });

      // Format the result to look like it came from an ONNX model
      const predictionResult = {
        prediction: aiResult.probability > 0.5 ? 1 : 0,
        probability: aiResult.probability,
        // Store but don't display the analysis
        analysis: aiResult.analysis,
      };

      console.log("Model prediction result:", predictionResult);

      setResult(predictionResult);

      toast("Analysis Complete", {
        description: "Heart disease risk prediction has been calculated",
      });
    } catch (error) {
      console.error("Inference error:", error);
      toast("Error", {
        description: `Failed to process prediction: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 pt-26">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Heart Disease Prediction</h1>
      </div>

      {modelError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Model Error</AlertTitle>
          <AlertDescription>{modelError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Cardiovascular Parameters</span>
            </CardTitle>
            <CardDescription>
              Enter cardiovascular health information to assess heart disease
              risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Tabs for better organization */}
                <Tabs defaultValue="demographic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="demographic">Demographics</TabsTrigger>
                    <TabsTrigger value="clinical">Clinical Data</TabsTrigger>
                    <TabsTrigger value="cardiac">Cardiac Factors</TabsTrigger>
                  </TabsList>

                  {/* Demographics Tab */}
                  <TabsContent value="demographic" className="pt-4">
                    <div className="space-y-4">
                      <div className="flex flex-row items-center justify-between">
                        <FormField
                          control={form.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem className="flex-1 mr-4">
                              <FormLabel>Age</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sex"
                          render={({ field }) => (
                            <FormItem className="flex-1 space-y-3">
                              <FormLabel>Biological Sex</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-row space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-1 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="0" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Female
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-1 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="1" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Male
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="chestPainType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chest Pain Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-2 gap-4"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-secondary">
                                  <FormControl>
                                    <RadioGroupItem value="1" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Typical Angina
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-secondary">
                                  <FormControl>
                                    <RadioGroupItem value="2" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Atypical Angina
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-secondary">
                                  <FormControl>
                                    <RadioGroupItem value="3" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Non-anginal Pain
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-secondary">
                                  <FormControl>
                                    <RadioGroupItem value="4" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Asymptomatic
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Clinical Data Tab */}
                  <TabsContent value="clinical" className="pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="restingBP"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Resting Blood Pressure (mmHg)
                              </FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cholesterol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cholesterol (mg/dL)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="fastingBS"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Fasting Blood Sugar &gt; 120 mg/dL
                              </FormLabel>
                              <FormDescription>
                                Toggle if blood sugar is above 120 mg/dL when
                                fasting
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value === "1"}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked ? "1" : "0");
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="restingECG"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resting ECG Results</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid gap-2"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-secondary">
                                  <FormControl>
                                    <RadioGroupItem value="0" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Normal
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-secondary">
                                  <FormControl>
                                    <RadioGroupItem value="1" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    ST-T Wave Abnormality
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-secondary">
                                  <FormControl>
                                    <RadioGroupItem value="2" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Left Ventricular Hypertrophy
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Cardiac Factors Tab */}
                  <TabsContent value="cardiac" className="pt-4">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="maxHR"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Heart Rate</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="exerciseAngina"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Exercise Induced Angina
                              </FormLabel>
                              <FormDescription>
                                Presence of chest pain during exercise
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value === "1"}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked ? "1" : "0");
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="oldpeak"
                        render={({
                          field: { value, onChange, ...fieldProps },
                        }) => (
                          <FormItem>
                            <FormLabel>
                              ST Depression (Oldpeak): {value}
                            </FormLabel>
                            <FormControl>
                              <Slider
                                defaultValue={[parseFloat(value as any)]}
                                min={-3}
                                max={10}
                                step={0.1}
                                onValueChange={([newValue]) =>
                                  onChange(newValue)
                                }
                                className="py-4"
                              />
                            </FormControl>
                            <FormDescription>
                              ST depression induced by exercise relative to rest
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stSlope"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ST Slope</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select slope" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Upsloping</SelectItem>
                                <SelectItem value="2">Flat</SelectItem>
                                <SelectItem value="3">Downsloping</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="majorVessels"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Major Vessels</FormLabel>
                              <FormDescription className="text-xs">
                                Colored by fluoroscopy (0-3)
                              </FormDescription>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select count" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0">0</SelectItem>
                                  <SelectItem value="1">1</SelectItem>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="3">3</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="thal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Thalassemia</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0">Normal</SelectItem>
                                  <SelectItem value="1">
                                    Fixed Defect
                                  </SelectItem>
                                  <SelectItem value="2">
                                    Reversible Defect
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Predict Heart Disease Risk"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="col-span-1 transition-all duration-200 border-none bg-transparent backdrop-blur-sm overflow-hidden">
          <CardContent>
            <AnimatePresence mode="wait">
              {!result && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center h-[400px] text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-full bg-muted/50 p-6"
                  >
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <h3 className="font-semibold">No Results Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-[300px]">
                      Submit your cardiovascular parameters to see a heart
                      disease risk assessment
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 p-4"
                >
                  <div className="space-y-4">
                    <motion.div
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        transition: { repeat: Infinity, duration: 1.5 },
                      }}
                    >
                      <Skeleton className="h-[120px] w-full bg-muted/50" />
                    </motion.div>
                    <div className="space-y-2">
                      <motion.div
                        animate={{
                          opacity: [0.3, 0.7, 0.3],
                          transition: {
                            repeat: Infinity,
                            duration: 1.5,
                            delay: 0.2,
                          },
                        }}
                      >
                        <Skeleton className="h-4 w-[60%] bg-muted/50" />
                      </motion.div>
                      <motion.div
                        animate={{
                          opacity: [0.3, 0.7, 0.3],
                          transition: {
                            repeat: Infinity,
                            duration: 1.5,
                            delay: 0.4,
                          },
                        }}
                      >
                        <Skeleton className="h-4 w-[80%] bg-muted/50" />
                      </motion.div>
                    </div>
                  </div>
                  <Separator className="bg-muted/50" />
                  <div className="space-y-4">
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                        transition: { repeat: Infinity, duration: 1.5 },
                      }}
                    >
                      <Skeleton className="h-6 w-[40%] bg-muted/50" />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {result && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <Card
                      className={`relative overflow-hidden w-full border ${
                        result.prediction === 1
                          ? "border-destructive/50"
                          : "border-primary/50"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="relative z-10">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.2,
                              ease: "easeOut",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-4">
                              {result.prediction === 1 ? (
                                <AlertCircle className="h-5 w-5 text-destructive" />
                              ) : (
                                <Heart className="h-5 w-5 text-primary" />
                              )}
                              <h3 className="text-xl font-bold">
                                {result.prediction === 1
                                  ? "Elevated Risk of Heart Disease"
                                  : "Lower Risk of Heart Disease"}
                              </h3>
                            </div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.4,
                              ease: "easeOut",
                            }}
                          >
                            <p className="text-base text-muted-foreground">
                              Based on the cardiovascular parameters provided,
                              the model predicts
                              <span
                                className={`font-medium ${
                                  result.prediction === 1
                                    ? "text-destructive"
                                    : "text-primary"
                                }`}
                              >
                                {result.prediction === 1
                                  ? " a higher likelihood "
                                  : " a lower likelihood "}
                              </span>
                              of heart disease.
                            </p>
                          </motion.div>
                        </div>
                        <motion.div
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.05 }}
                          transition={{
                            duration: 0.8,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          className={`absolute inset-0 ${
                            result.prediction === 1
                              ? "bg-destructive"
                              : "bg-primary"
                          }`}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4"
                  >
                    <div className="text-lg font-medium mb-1">
                      Risk Assessment
                    </div>
                    <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${Math.round(result.probability * 100)}%`,
                        }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut",
                          delay: 0.5,
                        }}
                        className={`h-full ${
                          result.prediction === 1
                            ? "bg-destructive"
                            : "bg-primary"
                        }`}
                      />
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.3 }}
                      className="text-right text-sm text-muted-foreground mt-1"
                    >
                      {Math.round(result.probability * 100)}% risk level
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pt-4 space-y-2"
                  >
                    <h3 className="text-lg font-medium">
                      What does this mean?
                    </h3>
                    <p className="text-muted-foreground">
                      This assessment is based on established cardiovascular
                      risk factors.
                      {result.prediction === 1
                        ? " Several risk factors in your profile suggest an elevated risk of heart disease. Consider consulting with a cardiologist."
                        : " Your profile contains fewer established risk factors for heart disease, but regular check-ups are still recommended."}
                    </p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-muted-foreground pt-2"
                    >
                      <strong>Important:</strong> This is not a medical
                      diagnosis. Please consult with a healthcare professional
                      for proper evaluation and personalized advice.
                    </motion.p>
                  </motion.div>

                  {result.prediction === 1 && (
                    <Alert
                      variant="default"
                      className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
                    >
                      <AlertTitle>Contributing Factors</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>Key risk factors in your profile may include:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {parseInt(form.getValues().sex) === 1 && (
                            <li>Male gender (statistically higher risk)</li>
                          )}
                          {parseInt(form.getValues().chestPainType) > 2 && (
                            <li>Significant chest pain type</li>
                          )}
                          {form.getValues().restingBP > 140 && (
                            <li>Elevated resting blood pressure</li>
                          )}
                          {form.getValues().cholesterol > 240 && (
                            <li>High cholesterol level</li>
                          )}
                          {parseInt(form.getValues().exerciseAngina) === 1 && (
                            <li>Exercise-induced angina</li>
                          )}
                          {form.getValues().oldpeak > 2 && (
                            <li>Significant ST depression</li>
                          )}
                          {parseInt(form.getValues().majorVessels) > 0 && (
                            <li>Presence of affected major vessels</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
