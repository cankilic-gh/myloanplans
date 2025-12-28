import { Resend } from "resend";

// Lazy initialization - check environment variables on each call
// This ensures .env.local is loaded before checking
function getResendClient() {
  const resendApiKey = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return null;
  }
  return new Resend(resendApiKey);
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationCode: string
) {
  // Check for Resend API key on each call (lazy initialization)
  const resendApiKey = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY;
  console.log("📧 [EMAIL DEBUG] AUTH_RESEND_KEY:", process.env.AUTH_RESEND_KEY ? `present (${process.env.AUTH_RESEND_KEY.substring(0, 10)}...)` : "missing");
  console.log("📧 [EMAIL DEBUG] RESEND_API_KEY:", process.env.RESEND_API_KEY ? `present (${process.env.RESEND_API_KEY.substring(0, 10)}...)` : "missing");
  console.log("📧 [EMAIL DEBUG] Combined key:", resendApiKey ? `present (${resendApiKey.substring(0, 10)}...)` : "missing");
  
  const resend = getResendClient();
  
  // If no Resend API key, skip sending email (development mode)
  if (!resend) {
    console.log("📧 [DEV MODE] Verification email would be sent to:", email);
    console.log("📧 [DEV MODE] Verification code:", verificationCode);
    console.log("📧 [DEV MODE] Resend client is null - email will not be sent");
    // Return success: false to indicate email was not sent
    return { success: false, data: null, error: "Resend API key not configured" };
  }

  try {
    console.log(`[EMAIL] ✅ Resend client initialized, attempting to send email to: ${email}`);
    console.log(`[EMAIL] NODE_ENV: ${process.env.NODE_ENV}`);
    
    const fromEmail = process.env.AUTH_RESEND_FROM || process.env.RESEND_FROM_EMAIL || "My Loan Plans <onboarding@resend.dev>";
    console.log(`[EMAIL] From email: ${fromEmail}`);
    
    // Generate plain text version for better deliverability
    const plainText = `
Hi ${name},

Thank you for signing up for My Loan Plans!

Your verification code is: ${verificationCode}

This code will expire in 10 minutes.

If you didn't create an account, you can safely ignore this email.

Best regards,
My Loan Plans Team
    `.trim();

    // Set reply-to if domain is verified
    const replyToEmail = fromEmail.includes("@myloanplans.com") 
      ? "support@myloanplans.com" 
      : undefined;

    const emailOptions: any = {
      from: fromEmail,
      to: [email],
      subject: "Verify Your Email - My Loan Plans",
      text: plainText,
    };

    // Add reply-to only if domain is verified
    if (replyToEmail) {
      emailOptions.replyTo = replyToEmail;
    }

    const { data, error } = await resend.emails.send({
      ...emailOptions,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="x-apple-disable-message-reformatting">
            <title>Verify Your Email - My Loan Plans</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #10B981 100%); border-radius: 12px 12px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">My Loan Plans</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: bold;">Verify Your Email Address</h2>
                        <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                          Hi ${name},
                        </p>
                        <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                          Thank you for signing up for My Loan Plans! Please use the verification code below to complete your registration:
                        </p>
                        <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                          <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b; font-family: 'Courier New', monospace;">
                            ${verificationCode}
                          </p>
                        </div>
                        <p style="margin: 30px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                          This code will expire in 10 minutes. If you didn't create an account with My Loan Plans, you can safely ignore this email.
                        </p>
                        <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                          This is an automated message. Please do not reply to this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 30px; background-color: #f8fafc; border-radius: 0 0 12px 12px; text-align: center;">
                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                          © ${new Date().getFullYear()} My Loan Plans. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("[EMAIL] Resend API error:", error);
      throw error;
    }

    console.log(`[EMAIL] Email sent successfully to ${email}, ID: ${data?.id}`);
    return { success: true, data };
  } catch (error) {
    console.error("[EMAIL] Failed to send verification email:", error);
    console.error("[EMAIL] Error details:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}



