"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface TicketFormProps {
  onSubmit: (data: { name: string; email: string }) => void
}

export function TicketForm({ onSubmit }: TicketFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDisabled, setIsDisabled] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes in seconds
  const [sessionExpired, setSessionExpired] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await fetch("/api/register-ticket")
        const data = await response.json()
        setSessionToken(data.token)
        setTimeRemaining(180)
      } catch (err) {
        console.error("[v0] Failed to initialize session:", err)
      }
    }

    initializeSession()
  }, [])

  useEffect(() => {
    if (!sessionToken) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setSessionExpired(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionToken])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDisabled && !sessionExpired) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDisabled, sessionExpired])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (sessionExpired) {
      setError("Your registration window has expired. Please refresh the page to start over.")
      return
    }

    if (!name.trim()) {
      setError("Please enter your full name")
      return
    }

    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/register-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim(),
          sessionToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError("This email address has already been registered. Please use a different email.")
        } else if (response.status === 401) {
          setError("Your registration window has expired. Please refresh the page.")
        } else {
          setError(data.error || "Failed to register ticket")
        }
        return
      }

      setIsDisabled(true)
      onSubmit({ name, email })
    } catch (err) {
      setError("Failed to register. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (sessionExpired) {
    return (
      <Card className="border-2 shadow-lg" style={{ borderColor: "#23903a" }}>
        <div className="p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#23903a" }}>
            Registration Window Expired
          </h2>
          <p className="text-lg mb-6" style={{ color: "#666" }}>
            Your 3-minute registration window has ended.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="px-6 py-2 text-white"
            style={{ backgroundColor: "#23903a" }}
          >
            Refresh Page to Start Over
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-2 shadow-lg" style={{ borderColor: "#23903a" }}>
      <div className="p-8 md:p-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: "#23903a" }}>
            Get Your Ticket
          </h1>
          <p className="text-lg" style={{ color: "#666" }}>
            Join us for an unforgettable experience
          </p>
          <p className="text-sm mt-4 font-semibold" style={{ color: timeRemaining <= 60 ? "#c0a765" : "#999" }}>
            Time remaining: {formatTime(timeRemaining)}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-6" style={{ borderColor: "#e0e0e0" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#23903a" }}>
              Your Information
            </h2>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold" style={{ color: "#23903a" }}>
                Full Name <span style={{ color: "#c0a765" }}>*</span>
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || isDisabled || sessionExpired}
                className="h-12 text-base border-2 focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: "#c0a765",
                    "--tw-ring-color": "#23903a",
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="space-y-2 mt-4">
              <label htmlFor="email" className="block text-sm font-semibold" style={{ color: "#23903a" }}>
                Email Address <span style={{ color: "#c0a765" }}>*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || isDisabled || sessionExpired}
                className="h-12 text-base border-2 focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: "#c0a765",
                    "--tw-ring-color": "#23903a",
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          {error && (
            <div
              className="p-4 rounded-lg text-sm"
              style={{ backgroundColor: "#fff3cd", borderColor: "#c0a765", border: "1px solid", color: "#856404" }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || isDisabled || sessionExpired}
            className="w-full h-12 text-base font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDisabled ? "#23903a" : "#23903a",
              hover: { backgroundColor: "#1a6b2a" },
            }}
          >
            {isDisabled ? (
              <>✓ Ticket Registered</>
            ) : loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Registering...
              </>
            ) : (
              "Register for Ticket"
            )}
          </Button>
        </form>

        {/* Footer text */}
        <p className="text-center text-sm mt-6" style={{ color: "#999" }}>
          Your ticket will be sent to your email instantly
        </p>
      </div>
    </Card>
  )
}
