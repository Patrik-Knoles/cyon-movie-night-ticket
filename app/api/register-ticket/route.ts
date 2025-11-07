import { type NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

// In-memory store for registered emails and tokens (in production, use a database)
const registeredEmails = new Set<string>();
const sessionTokens = new Map<string, { email: string; expiresAt: number }>();

// Generate a unique ticket ID
function generateTicketId(): string {
  return "CYON-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Generate a unique session token
function generateSessionToken(): string {
  return Math.random().toString(36).substr(2, 16);
}

async function generateQRCodeDataUrl(
  ticketId: string,
  attendeeName: string,
  attendeeEmail: string
): Promise<string> {
  try {
    const registrationData = `Ticket ID: ${ticketId}\nName: ${attendeeName}\nEmail: ${attendeeEmail}`;
    const qrCodeDataUrl = await QRCode.toDataURL(registrationData, {
      width: 150,
      margin: 1,
      color: {
        dark: "#23903a",
        light: "#ffffff",
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error("[v0] Error generating QR code:", error);
    return "";
  }
}

function generateTicketHTML(
  name: string,
  ticketId: string,
  eventTheme: string,
  eventDate: string,
  eventTime: string,
  eventVenue: string,
  qrCodeDataUrl: string
): string {
  const parsedDate = new Date(eventDate);
  const formattedDate = isNaN(parsedDate.getTime())
    ? eventDate
    : parsedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .ticket-header {
            background: linear-gradient(135deg, #23903a 0%, #1a6b2a 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .ticket-header img {
            width: 100px;
            height: auto;
            margin-bottom: 15px;
          }
          .ticket-header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
          }
          .ticket-header p {
            font-size: 14px;
            opacity: 0.95;
            margin: 0;
          }
          .ticket-main {
            background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
            padding: 40px 30px;
            text-align: center;
            border: 3px dashed #c0a765;
            margin: 30px;
            border-radius: 8px;
          }
          .online-ticket-badge {
            display: inline-block;
            background: #c0a765;
            color: #23903a;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
          }
          .admit-text {
            color: #23903a;
            font-size: 16px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
          }
          .admit-number {
            color: #c0a765;
            font-size: 56px;
            font-weight: 900;
            letter-spacing: 3px;
            font-family: Georgia, serif;
            margin: 15px 0;
          }
          .ticket-id-section {
            background: white;
            border: 2px solid #c0a765;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .ticket-id-label {
            color: #23903a;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .ticket-id {
            color: #c0a765;
            font-size: 24px;
            font-weight: 700;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
          }
          .attendee-name {
            color: #333;
            font-size: 18px;
            margin: 20px 0 5px 0;
            word-break: break-all;
            font-weight: 600;
          }
          .qr-code-section {
            margin: 25px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }
          .qr-code-label {
            color: #23903a;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .qr-code-section img {
            width: 150px;
            height: 150px;
            margin: 0 auto;
            display: block;
          }
          .ticket-price {
            background: #23903a;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
          }
          .price-label {
            font-size: 12px;
            opacity: 0.95;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .price-amount {
            font-size: 32px;
            font-weight: 700;
            margin-top: 8px;
          }
          .ticket-details {
            background: white;
            padding: 0 30px 30px 30px;
          }
          .detail-row {
            padding: 14px 0;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #23903a;
            font-weight: 700;
          }
          .detail-value {
            color: #555;
            font-weight: 500;
            text-align: right;
          }
          .footer-section {
            background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
            padding: 25px;
            text-align: center;
            font-size: 13px;
            color: #666;
            border-top: 1px solid #e0e0e0;
            margin: 0 30px 30px 30px;
            border-radius: 8px;
          }
          .instructions {
            margin-bottom: 15px;
            color: #333;
            font-weight: 500;
          }
          .status-badge {
            display: inline-block;
            background: #e8f5e9;
            color: #23903a;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            margin-top: 10px;
          }
          .copyright {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 20px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          .copyright a {
            color: #23903a;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="ticket-header">
            <img src="https://cyon-movie-night.vercel.app/images/design-mode/CYON-Logo.png" alt="CYON Logo">
            <h1>MOVIE NIGHT</h1>
            <p>Catholic Youth Organization of Nigeria</p>
          </div>
          
          <div class="ticket-main">
            <div class="online-ticket-badge">📱 Online Ticket</div>
            <div class="admit-text">ADMIT ONE</div>
            <div class="admit-number">1</div>
            <div class="ticket-id-section">
              <div class="ticket-id-label">Your Ticket ID</div>
              <div class="ticket-id">${ticketId}</div>
            </div>
            <p class="attendee-name">Attendee: ${name}</p>
          </div>
          
          <div class="ticket-details">
            <div class="ticket-price">
              <div class="price-label">Price</div>
              <div class="price-amount">₦1,500</div>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">&nbsp;${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">&nbsp;${eventTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Venue:</span>
              <span class="detail-value">&nbsp;${eventVenue}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value" style="color: #23903a; font-weight: 700;">&nbsp; ✓ Confirmed</span>
            </div>
          </div>
          
          <div class="footer-section">
            <p class="instructions">Please present this ticket at the entrance.</p>
            <div class="status-badge">✓ Registration Complete</div>
            <div class="copyright">
              Made by <a href="https://patricktheassistant.com/">patricktheassistant</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function sendEmailWithFallback(
  to: string,
  subject: string,
  html: string,
  resendApiKey: string,
  primarySender: string,
  fallbackSender: string
): Promise<boolean> {
  // Try with primary sender first
  let response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: primarySender,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    if (
      response.status === 403 &&
      errorData.message?.includes("domain is not verified")
    ) {
      console.log(
        `[v0] Domain not verified, falling back to ${fallbackSender}`
      );

      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fallbackSender,
          to,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const fallbackError = await response.json();
        console.error("[v0] Failed to send email (fallback):", fallbackError);
        return false;
      }
    } else {
      console.error("[v0] Failed to send email:", errorData);
      return false;
    }
  }

  return true;
}

async function sendTicketEmail(
  attendeeEmail: string,
  name: string,
  ticketId: string,
  eventTheme: string,
  eventDate: string,
  eventTime: string,
  eventVenue: string
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "tinnievisuals@gmail.com";
  const primarySender = "email@patricktheassistant.com";
  const fallbackSender = "onboarding@resend.dev";

  // If Resend is not configured, log a message (for demo purposes)
  if (!resendApiKey) {
    console.log("[DEMO] Email would be sent to attendee:", attendeeEmail);
    console.log("[DEMO] Email would be sent to admin:", adminEmail);
    console.log("[DEMO] Attendee name:", name);
    console.log("[DEMO] Ticket ID:", ticketId);
    return true;
  }

  try {
    const qrCodeDataUrl = await generateQRCodeDataUrl(
      ticketId,
      name,
      attendeeEmail
    );

    const htmlContent = generateTicketHTML(
      name,
      ticketId,
      eventTheme,
      eventDate,
      eventTime,
      eventVenue,
      qrCodeDataUrl
    );

    const success = await sendEmailWithFallback(
      attendeeEmail,
      `Your Ticket for ${eventTheme} - ${ticketId}`,
      htmlContent,
      resendApiKey,
      primarySender,
      fallbackSender
    );

    if (!success) {
      return false;
    }

    console.log("[v0] Ticket email sent successfully");

    const adminSuccess = await sendEmailWithFallback(
      adminEmail,
      `New Registration - ${name} (${ticketId})`,
      `
        <h2>New Ticket Registration</h2>
        <p><strong>Event:</strong> ${eventTheme}</p>
        <p><strong>Attendee Name:</strong> ${name}</p>
        <p><strong>Attendee Email:</strong> ${attendeeEmail}</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <h3>Event Details</h3>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Time:</strong> ${eventTime}</p>
        <p><strong>Venue:</strong> ${eventVenue}</p>
      `,
      resendApiKey,
      primarySender,
      fallbackSender
    );

    if (!adminSuccess) {
      return false;
    }

    console.log("[v0] Admin notification sent successfully");
    return true;
  } catch (error) {
    console.error("[v0] Error sending email:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, sessionToken } = await request.json();

    if (registeredEmails.has(email.toLowerCase())) {
      return NextResponse.json(
        { error: "This email has already been registered" },
        { status: 409 }
      );
    }

    if (sessionToken) {
      const tokenData = sessionTokens.get(sessionToken);
      if (!tokenData || tokenData.expiresAt < Date.now()) {
        return NextResponse.json(
          {
            error:
              "Registration window has expired. Please refresh to start over.",
          },
          { status: 401 }
        );
      }
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const eventTheme = process.env.EVENT_THEME || "CYON Movie Night";
    const eventDate = process.env.EVENT_DATE || "2025-11-21";
    const eventTime = process.env.EVENT_TIME || "18:00";
    const eventVenue =
      process.env.EVENT_VENUE ||
      "New Church Hall, St. Cyprian Catholic Church, Oko-Oba Agege";

    // Generate ticket ID
    const ticketId = generateTicketId();

    // Send emails with ticket
    const emailSent = await sendTicketEmail(
      email,
      name,
      ticketId,
      eventTheme,
      eventDate,
      eventTime,
      eventVenue
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send ticket email" },
        { status: 500 }
      );
    }

    registeredEmails.add(email.toLowerCase());

    return NextResponse.json(
      {
        success: true,
        message: "Ticket registered and email sent",
        ticketId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Error in register-ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = generateSessionToken();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes

    sessionTokens.set(token, { email: "", expiresAt });

    // Clean up expired tokens
    for (const [key, value] of sessionTokens.entries()) {
      if (value.expiresAt < Date.now()) {
        sessionTokens.delete(key);
      }
    }

    return NextResponse.json({ token, expiresAt });
  } catch (error) {
    console.error("[v0] Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
