"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { useState } from "react";

interface SuccessMessageProps {
  data: { name: string; email: string } | null
}

export function SuccessMessage({ data }: SuccessMessageProps) {
  const [visible, setVisible] = useState(true);
  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <div className="p-8 md:p-12 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Ticket Registered!</h1>

        <p className="text-muted-foreground text-lg mb-6">Your ticket has been sent to</p>

        <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4 mb-8">
          <p className="text-lg font-semibold text-foreground">{data?.email || "your email"}</p>
        </div>

        <div className="space-y-4 text-left bg-muted/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-primary font-bold mt-1">✓</div>
            <div>
              <p className="font-semibold text-foreground">Check your email</p>
              <p className="text-sm text-muted-foreground">Look for your customized ticket in your inbox</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-primary font-bold mt-1">✓</div>
            <div>
              <p className="font-semibold text-foreground">Save your ticket</p>
              <p className="text-sm text-muted-foreground">Download or screenshot your ticket for easy access</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-primary font-bold mt-1">✓</div>
            <div>
              <p className="font-semibold text-foreground">You're all set!</p>
              <p className="text-sm text-muted-foreground">We look forward to seeing you at the event</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
