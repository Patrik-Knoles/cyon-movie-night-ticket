"use client";

import { useState } from "react";
import Image from "next/image";
import { TicketForm } from "@/components/ticket-form";
import { SuccessMessage } from "@/components/success-message";
import { CopyrightFooter } from "@/components/copyright-footer";

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const handleSubmit = (data: { name: string; email: string }) => {
    setTicketData(data);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl flex-1 flex items-center justify-center">
        <div className="w-full">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <Image
                src="/images/design-mode/CYON-Logo.png"
                alt="CYON Logo"
                width={120}
                height={120}
              />
            </div>
            <p className="text-muted-foreground text-lg mt-2">
              Catholic Youth Organization of Nigeria
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              St. Cyprian Catholic Church, Oko-Oba Agege
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold mt-2 "
              style={{ color: "#23903a" }}
            >
              Movie Night
            </h1>
          </div>

          {!submitted ? (
            <TicketForm onSubmit={handleSubmit} />
          ) : (
            <SuccessMessage data={ticketData} />
          )}
        </div>
      </div>

      <CopyrightFooter />
    </main>
  );
}
