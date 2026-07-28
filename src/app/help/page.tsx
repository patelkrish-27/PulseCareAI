"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Book, MessageCircle, Phone } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-on-surface">Help & Support</h2>
        <p className="text-on-surface-variant mt-2">Find answers or get in touch with our support team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Book className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Learn how to use PulseCareAI effectively</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-on-surface-variant mb-4">Browse our guides on logging vitals, chatting with the AI, and generating reports.</p>
            <Button variant="outline" className="w-full">View Guides</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>FAQs</CardTitle>
            <CardDescription>Frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-on-surface-variant mb-4">Find quick answers to common issues and questions about the platform.</p>
            <Button variant="outline" className="w-full">Read FAQs</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Reach out to our technical team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-on-surface-variant mb-4">Having technical difficulties? Send us a message and we&apos;ll help you out.</p>
            <Button variant="outline" className="w-full">Send Message</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-accent/20 border-primary/20">
          <CardHeader>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center mb-2">
              <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle>Medical Emergency</CardTitle>
            <CardDescription>If you are experiencing a medical emergency</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-on-surface-variant mb-4">Please do not use this app for medical emergencies. Call your local emergency number immediately.</p>
            <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Call Emergency Services</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
