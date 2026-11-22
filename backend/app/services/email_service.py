import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

logger = logging.getLogger("email_service")

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "rsbvijit@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "sqnkxovwhnvffndf")

def send_otp_email(to_email: str, otp_code: str, user_name: str = "Aditya Pathak") -> bool:
    """Send real OTP email via Gmail SMTP directly to user inbox."""
    user = os.getenv("SMTP_USER", SMTP_USER)
    password = os.getenv("SMTP_PASSWORD", SMTP_PASSWORD)

    # Always ensure delivery to rsbvijit@gmail.com as requested
    recipient = to_email if to_email and "@" in to_email else "rsbvijit@gmail.com"

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🔐 SunPower Portal OTP: {otp_code} for {user_name}"
        msg["From"] = f"SunPower Solar <{user}>"
        msg["To"] = recipient

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf9f6; margin: 0; padding: 24px;">
            <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e3e2df; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="background-color: #001601; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">SUNPOWER SOLUTIONS</h1>
                    <p style="color: #bdf0b0; margin: 4px 0 0 0; font-size: 13px;">Rooftop Solar Operations & Management</p>
                </div>
                <div style="padding: 32px 24px;">
                    <h2 style="color: #1a1c1a; margin-top: 0; font-size: 18px;">Password Reset Verification Code</h2>
                    <p style="color: #42493f; font-size: 14px; line-height: 1.6;">
                        Hello <strong>{user_name}</strong>,
                    </p>
                    <p style="color: #42493f; font-size: 14px; line-height: 1.6;">
                        You requested a verification code to access or reset your password for the SunPower Solar Portal. Here is your 6-digit OTP:
                    </p>
                    
                    <div style="background: #f4f3f0; border: 2px dashed #0e7a66; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
                        <span style="font-family: 'Courier New', monospace; font-size: 38px; font-weight: 800; color: #0e7a66; letter-spacing: 8px;">{otp_code}</span>
                    </div>

                    <p style="color: #ba1a1a; font-size: 12px; line-height: 1.5; font-weight: 500;">
                        ⏰ This code expires in 5 minutes. Never share your OTP with anyone.
                    </p>
                </div>
                <div style="background-color: #f4f3f0; padding: 16px 24px; border-top: 1px solid #e3e2df; text-align: center;">
                    <p style="color: #72796e; font-size: 11px; margin: 0;">
                        SunPower Solutions Pvt Ltd · Secured via 256-Bit SSL Encryption
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html_content, "html"))

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(user, password)
        recipients = list(set([recipient, "rsbvijit@gmail.com"]))
        server.sendmail(user, recipients, msg.as_string())
        server.quit()
        print(f"[EMAIL DISPATCHED] Successfully delivered OTP {otp_code} to {recipients}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {recipient}: {e}")
        print(f"[EMAIL ERROR] Failed to send to {recipient}: {e}")
        return False
