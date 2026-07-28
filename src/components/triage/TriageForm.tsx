"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { mockUser } from "@/mock/data";

const steps = [
  { id: 1, name: "Patient Info" },
  { id: 2, name: "Symptoms" },
  { id: 3, name: "Vitals" },
  { id: 4, name: "Duration" },
  { id: 5, name: "Review" },
  { id: 6, name: "Result" },
];

export function TriageForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: mockUser.name,
    age: mockUser.age.toString(),
    symptoms: "",
    severity: "3",
    systolic: "",
    diastolic: "",
    temperature: "",
    duration: "1-3 days",
    additionalNotes: ""
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateProgress = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium mb-2 text-on-surface-variant">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{steps[currentStep - 1].name}</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
        <CardTitle className="text-2xl">{steps[currentStep - 1].name}</CardTitle>
        <CardDescription>
          {currentStep === 1 && "Confirm your basic information"}
          {currentStep === 2 && "Describe what you are experiencing"}
          {currentStep === 3 && "Enter your latest vital signs if available"}
          {currentStep === 4 && "How long have you had these symptoms?"}
          {currentStep === 5 && "Review your information before submitting"}
          {currentStep === 6 && "AI Assessment Result"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Primary Symptoms</Label>
              <Textarea 
                id="symptoms" 
                name="symptoms" 
                placeholder="E.g., headache, fever, cough..." 
                className="h-32"
                value={formData.symptoms} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity (1-10)</Label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  id="severity" 
                  name="severity" 
                  min="1" max="10" 
                  className="w-full accent-primary" 
                  value={formData.severity} 
                  onChange={handleChange} 
                />
                <span className="font-bold text-lg w-8 text-center">{formData.severity}</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systolic">Systolic (mmHg)</Label>
                <Input id="systolic" name="systolic" placeholder="120" value={formData.systolic} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                <Input id="diastolic" name="diastolic" placeholder="80" value={formData.diastolic} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°F)</Label>
                <Input id="temperature" name="temperature" placeholder="98.6" value={formData.temperature} onChange={handleChange} />
              </div>
            </div>
            <p className="text-sm text-on-surface-variant italic mt-4">Leave blank if you don&apos;t know.</p>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>How long have you had these symptoms?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {['Less than 24 hours', '1-3 days', '3-7 days', 'More than a week'].map((option) => (
                  <div 
                    key={option}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.duration === option 
                        ? 'border-primary bg-accent text-primary-foreground/90 font-medium' 
                        : 'border-border hover:bg-surface-container'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, duration: option }))}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea 
                id="additionalNotes" 
                name="additionalNotes" 
                placeholder="Anything else we should know?" 
                value={formData.additionalNotes} 
                onChange={handleChange} 
              />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="bg-surface-container rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Assessment Summary</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-on-surface-variant">Patient:</div>
                <div className="font-medium">{formData.name}, {formData.age} yrs</div>
                
                <div className="text-on-surface-variant">Symptoms:</div>
                <div className="font-medium">{formData.symptoms || 'None reported'} (Severity: {formData.severity}/10)</div>
                
                <div className="text-on-surface-variant">Duration:</div>
                <div className="font-medium">{formData.duration}</div>
                
                <div className="text-on-surface-variant">Vitals:</div>
                <div className="font-medium">
                  {formData.systolic && formData.diastolic ? `${formData.systolic}/${formData.diastolic} BP` : 'BP not provided'}
                  {formData.temperature && `, ${formData.temperature}°F`}
                </div>
              </div>
            </div>
            <div className="bg-accent/50 text-primary p-4 rounded-lg flex gap-3 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>By submitting this form, you understand that this tool provides AI-assisted guidance, not a medical diagnosis.</p>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="text-center py-8 space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface">Assessment Complete</h3>
            <div className="max-w-md mx-auto bg-surface-container rounded-xl p-6 text-left border">
              <h4 className="font-semibold text-lg text-primary mb-2">Recommendation: Monitor & Rest</h4>
              <p className="text-on-surface-variant mb-4">Based on your symptoms, it appears you may be experiencing a mild viral infection. Rest and stay hydrated.</p>
              <ul className="list-disc pl-5 text-sm space-y-1 text-on-surface-variant">
                <li>Drink plenty of fluids</li>
                <li>Rest for 1-2 days</li>
                <li>Monitor temperature</li>
              </ul>
              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <span className="text-sm font-medium">Need more help?</span>
                <Button variant="outline" size="sm">Schedule Telehealth</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {currentStep < 6 && (
        <CardFooter className="flex justify-between border-t p-6">
          <Button 
            variant="outline" 
            onClick={handlePrev} 
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Button onClick={handleNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {currentStep === 5 ? "Submit Assessment" : "Next Step"} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
      
      {currentStep === 6 && (
        <CardFooter className="flex justify-center border-t p-6">
          <Button onClick={() => setCurrentStep(1)} variant="outline">Start New Assessment</Button>
        </CardFooter>
      )}
    </Card>
  );
}
