"""
Email Service using SendGrid
Handles all email notifications for the tourism website
"""
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from flask import current_app, url_for
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# SendGrid configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")
FROM_NAME = os.getenv("FROM_NAME")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Initialize SendGrid client
sg = None
if SENDGRID_API_KEY:
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        print(f"✅ SendGrid initialized successfully")
        print(f"   FROM_EMAIL: {FROM_EMAIL or 'NOT SET'}")
        print(f"   FROM_NAME: {FROM_NAME or 'NOT SET'}")
    except Exception as e:
        logger.error(f"Failed to initialize SendGrid: {e}")
        print(f"❌ Failed to initialize SendGrid: {e}")
else:
    logger.warning("SENDGRID_API_KEY not found. Email sending will be disabled.")
    print("⚠️  WARNING: SENDGRID_API_KEY not found in environment variables.")
    print("   Email sending will be disabled.")


def send_email(to_email, subject, html_content, text_content=None):
    """
    Send an email using SendGrid
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML email content
        text_content: Plain text email content (optional)
    
    Returns:
        bool: True if sent successfully, False otherwise
    """
    if not sg:
        logger.error("SendGrid not configured. Email not sent.")
        return False
    
    if not to_email:
        logger.error("No recipient email provided.")
        return False
    
    if not FROM_EMAIL:
        logger.error("FROM_EMAIL not configured in environment variables.")
        print("❌ ERROR: FROM_EMAIL is not set in your .env file")
        return False
    
    try:
        message = Mail(
            from_email=Email(FROM_EMAIL, FROM_NAME),
            to_emails=To(to_email),
            subject=subject,
            html_content=html_content,
            plain_text_content=text_content or html_content
        )
        
        response = sg.send(message)
        
        if response.status_code in [200, 201, 202]:
            logger.info(f"Email sent successfully to {to_email}: {subject}")
            return True
        else:
            error_body = response.body.decode('utf-8') if response.body else "No error details"
            logger.error(f"Failed to send email. Status: {response.status_code}, Body: {error_body}")
            
            # Provide helpful error messages
            if response.status_code == 403:
                print("\n" + "="*60)
                print("❌ SendGrid 403 Forbidden Error")
                print("="*60)
                print("Common causes:")
                print("1. Sender email is not verified in SendGrid")
                print(f"   → Verify '{FROM_EMAIL}' in SendGrid Dashboard")
                print("   → Go to: Settings → Sender Authentication")
                print("2. API Key doesn't have 'Mail Send' permissions")
                print("   → Check API Key permissions in SendGrid")
                print("3. Account restrictions (free tier limits)")
                print("="*60 + "\n")
            elif response.status_code == 401:
                print("\n" + "="*60)
                print("❌ SendGrid 401 Unauthorized Error")
                print("="*60)
                print("Your API key is invalid or expired.")
                print("→ Generate a new API key in SendGrid Dashboard")
                print("→ Update SENDGRID_API_KEY in your .env file")
                print("="*60 + "\n")
            
            return False
            
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error sending email to {to_email}: {error_msg}")
        
        # Check for specific error types
        if "403" in error_msg or "Forbidden" in error_msg:
            print("\n" + "="*60)
            print("❌ SendGrid 403 Forbidden Error")
            print("="*60)
            print(f"FROM_EMAIL: {FROM_EMAIL}")
            print(f"FROM_NAME: {FROM_NAME}")
            print("\nTroubleshooting steps:")
            print("1. Verify sender email in SendGrid:")
            print("   → Go to https://app.sendgrid.com/")
            print("   → Settings → Sender Authentication")
            print(f"   → Verify '{FROM_EMAIL}' (Single Sender Verification)")
            print("\n2. Check API Key permissions:")
            print("   → Settings → API Keys")
            print("   → Ensure key has 'Mail Send' permission")
            print("\n3. For free tier accounts:")
            print("   → You can only send to verified emails initially")
            print("   → Verify recipient email or upgrade account")
            print("="*60 + "\n")
        elif "401" in error_msg or "Unauthorized" in error_msg:
            print("\n" + "="*60)
            print("❌ SendGrid Authentication Error")
            print("="*60)
            print("Your API key is invalid.")
            print("→ Check SENDGRID_API_KEY in your .env file")
            print("→ Generate a new API key if needed")
            print("="*60 + "\n")
        
        return False


# ==================== EMAIL TEMPLATES ====================

def get_base_template(content, footer_text="Tourism Website"):
    """Base HTML template for all emails"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }}
            .container {{
                background-color: #ffffff;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                margin: -30px -30px 20px -30px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .content {{
                margin: 20px 0;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                background-color: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 0;
            }}
            .button:hover {{
                background-color: #5568d3;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                color: #666;
                font-size: 12px;
            }}
            .info-box {{
                background-color: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 15px 0;
            }}
            .success-box {{
                background-color: #d4edda;
                border-left: 4px solid #28a745;
                padding: 15px;
                margin: 15px 0;
            }}
            .warning-box {{
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 15px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌴 Tourism Website</h1>
            </div>
            <div class="content">
                {content}
            </div>
            <div class="footer">
                <p>{footer_text}</p>
                <p>© {datetime.now().year} Tourism Website. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """


# ==================== USER ACCOUNT EMAILS ====================

def send_welcome_email(user_email, username):
    """Send welcome email to new user"""
    content = f"""
        <h2>Welcome to Tourism Website! 🎉</h2>
        <p>Hi {username},</p>
        <p>Thank you for joining our community! We're excited to help you discover amazing travel experiences.</p>
        <div class="info-box">
            <strong>Getting Started:</strong>
            <ul>
                <li>Browse our collection of tours and destinations</li>
                <li>Book your dream vacation</li>
                <li>Share your travel experiences with reviews</li>
            </ul>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy travels!</p>
    """
    html = get_base_template(content)
    return send_email(user_email, "Welcome to Tourism Website!", html)


def send_password_reset_email(user_email, reset_code):
    """Send password reset code"""
    content = f"""
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Use the code below to reset it:</p>
        <div class="info-box" style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            {reset_code}
        </div>
        <p><strong>This code will expire in 15 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
    """
    html = get_base_template(content)
    return send_email(user_email, "Password Reset Code", html)


def send_password_changed_email(user_email, username):
    """Send confirmation when password is changed"""
    content = f"""
        <h2>Password Changed Successfully</h2>
        <p>Hi {username},</p>
        <div class="success-box">
            <p>Your password has been successfully changed.</p>
        </div>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>For security reasons, we recommend using a strong, unique password.</p>
    """
    html = get_base_template(content)
    return send_email(user_email, "Password Changed Successfully", html)


def send_account_status_changed_email(user_email, username, status, reason=None):
    """Send notification when account status changes"""
    status_messages = {
        'banned': 'Your account has been banned',
        'suspended': 'Your account has been suspended',
        'active': 'Your account has been activated'
    }
    
    status_box_class = 'warning-box' if status in ['banned', 'suspended'] else 'success-box'
    
    content = f"""
        <h2>Account Status Update</h2>
        <p>Hi {username},</p>
        <div class="{status_box_class}">
            <p><strong>{status_messages.get(status, 'Your account status has been changed')}</strong></p>
            <p>Status: <strong>{status.upper()}</strong></p>
            {f'<p>Reason: {reason}</p>' if reason else ''}
        </div>
        {f'<p>If you believe this is an error, you can appeal by contacting our support team.</p>' if status in ['banned', 'suspended'] else ''}
    """
    html = get_base_template(content)
    return send_email(user_email, "Account Status Update", html)


# ==================== BOOKING EMAILS ====================

def send_booking_confirmation_email(customer_email, booking_data):
    """Send booking confirmation email"""
    content = f"""
        <h2>Booking Confirmation ✅</h2>
        <p>Dear {booking_data.get('full_name', 'Customer')},</p>
        <p>Your booking has been confirmed! We're excited to have you join us.</p>
        
        <div class="info-box">
            <h3>Booking Details</h3>
            <p><strong>Booking Reference:</strong> #{booking_data.get('booking_id', 'N/A')}</p>
            <p><strong>Tour:</strong> {booking_data.get('tour_name', 'N/A')}</p>
            <p><strong>Departure Date:</strong> {booking_data.get('departure_date', 'N/A')}</p>
            {f"<p><strong>Return Date:</strong> {booking_data.get('return_date', 'N/A')}</p>" if booking_data.get('return_date') else ''}
            <p><strong>Number of Guests:</strong> {booking_data.get('number_of_guests', 1)}</p>
            <p><strong>Total Price:</strong> ${booking_data.get('total_price', 0):,.2f}</p>
            <p><strong>Payment Method:</strong> {booking_data.get('payment_method', 'N/A').upper()}</p>
        </div>
        
        <div class="success-box">
            <p><strong>Payment Status:</strong> Confirmed</p>
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ul>
            <li>You will receive a reminder email before your departure date</li>
            <li>Please arrive at the meeting point 15 minutes early</li>
            <li>Bring a valid ID and any required documents</li>
        </ul>
        
        <p>If you have any questions, please contact us at {booking_data.get('contact_email', 'support@tourism-website.com')}</p>
    """
    html = get_base_template(content)
    return send_email(customer_email, f"Booking Confirmation - {booking_data.get('tour_name', 'Tour')}", html)


def send_booking_cancellation_email(customer_email, booking_data, reason=None):
    """Send booking cancellation email"""
    content = f"""
        <h2>Booking Cancellation Notice</h2>
        <p>Dear {booking_data.get('full_name', 'Customer')},</p>
        <div class="warning-box">
            <p><strong>Your booking has been cancelled.</strong></p>
            {f'<p>Reason: {reason}</p>' if reason else ''}
        </div>
        
        <div class="info-box">
            <h3>Cancelled Booking Details</h3>
            <p><strong>Booking Reference:</strong> #{booking_data.get('booking_id', 'N/A')}</p>
            <p><strong>Tour:</strong> {booking_data.get('tour_name', 'N/A')}</p>
            <p><strong>Departure Date:</strong> {booking_data.get('departure_date', 'N/A')}</p>
            <p><strong>Total Amount:</strong> ${booking_data.get('total_price', 0):,.2f}</p>
        </div>
        
        <p><strong>Refund Information:</strong></p>
        <p>If applicable, your refund will be processed within 5-10 business days to your original payment method.</p>
        
        <p>We're sorry for any inconvenience. If you have questions, please contact our support team.</p>
    """
    html = get_base_template(content)
    return send_email(customer_email, f"Booking Cancelled - {booking_data.get('tour_name', 'Tour')}", html)


def send_tour_schedule_cancelled_email(customer_email, booking_data, alternative_tours=None):
    """Send email when tour schedule is cancelled"""
    content = f"""
        <h2>Tour Schedule Cancelled</h2>
        <p>Dear {booking_data.get('full_name', 'Customer')},</p>
        <div class="warning-box">
            <p><strong>We regret to inform you that your scheduled tour has been cancelled.</strong></p>
        </div>
        
        <div class="info-box">
            <h3>Affected Booking</h3>
            <p><strong>Booking Reference:</strong> #{booking_data.get('booking_id', 'N/A')}</p>
            <p><strong>Tour:</strong> {booking_data.get('tour_name', 'N/A')}</p>
            <p><strong>Scheduled Date:</strong> {booking_data.get('departure_date', 'N/A')}</p>
        </div>
        
        <p><strong>Your Options:</strong></p>
        <ul>
            <li><strong>Full Refund:</strong> We will process a full refund within 5-10 business days</li>
            <li><strong>Credit:</strong> Receive a credit voucher for future bookings</li>
            {f'<li><strong>Alternative Tours:</strong> Consider these similar tours: {", ".join(alternative_tours) if alternative_tours else "Contact us for recommendations"}</li>' if alternative_tours else ''}
        </ul>
        
        <p>We sincerely apologize for any inconvenience. Please contact us to discuss your preferred option.</p>
    """
    html = get_base_template(content)
    return send_email(customer_email, f"Tour Schedule Cancelled - {booking_data.get('tour_name', 'Tour')}", html)


# ==================== PAYMENT EMAILS ====================

def send_payment_success_email(customer_email, payment_data):
    """Send payment success confirmation"""
    content = f"""
        <h2>Payment Successful ✅</h2>
        <p>Dear {payment_data.get('customer_name', 'Customer')},</p>
        <div class="success-box">
            <p><strong>Your payment has been processed successfully!</strong></p>
        </div>
        
        <div class="info-box">
            <h3>Payment Details</h3>
            <p><strong>Transaction ID:</strong> {payment_data.get('transaction_id', 'N/A')}</p>
            <p><strong>Amount:</strong> ${payment_data.get('amount', 0):,.2f}</p>
            <p><strong>Payment Method:</strong> {payment_data.get('payment_method', 'N/A').upper()}</p>
            <p><strong>Date:</strong> {payment_data.get('payment_date', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))}</p>
        </div>
        
        <p>Your booking is now confirmed. You will receive a separate booking confirmation email with all the details.</p>
        <p>Thank you for choosing us!</p>
    """
    html = get_base_template(content)
    return send_email(customer_email, "Payment Successful", html)


# ==================== PARTNER EMAILS ====================

def send_partner_registration_submitted_email(partner_email, business_name, registration_id):
    """Send confirmation when partner registration is submitted"""
    content = f"""
        <h2>Partner Registration Submitted</h2>
        <p>Dear {business_name},</p>
        <div class="success-box">
            <p><strong>Your partner registration has been submitted successfully!</strong></p>
        </div>
        
        <div class="info-box">
            <h3>Application Details</h3>
            <p><strong>Application ID:</strong> #{registration_id}</p>
            <p><strong>Business Name:</strong> {business_name}</p>
            <p><strong>Status:</strong> Pending Review</p>
        </div>
        
        <p><strong>What happens next?</strong></p>
        <ul>
            <li>Our team will review your application</li>
            <li>Review typically takes 3-5 business days</li>
            <li>You will receive an email notification once a decision is made</li>
        </ul>
        
        <p>We'll be in touch soon. Thank you for your interest in partnering with us!</p>
    """
    html = get_base_template(content)
    return send_email(partner_email, "Partner Registration Submitted", html)


def send_partner_registration_approved_email(partner_email, business_name, username, password):
    """Send approval email with account credentials"""
    content = f"""
        <h2>Partner Registration Approved! 🎉</h2>
        <p>Dear {business_name},</p>
        <div class="success-box">
            <p><strong>Congratulations! Your partner registration has been approved.</strong></p>
        </div>
        
        <div class="info-box">
            <h3>Your Account Credentials</h3>
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Password:</strong> {password}</p>
            <p><em>Please change your password after first login for security.</em></p>
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ul>
            <li>Log in to your partner dashboard</li>
            <li>Complete your business profile</li>
            <li>Start listing your services (accommodation, restaurant, or transportation)</li>
            <li>Manage bookings and respond to customer reviews</li>
        </ul>
        
        <p><a href="{FRONTEND_URL}/partner/manage" class="button">Access Partner Dashboard</a></p>
        
        <p>Welcome to our partner community! If you need assistance, our support team is here to help.</p>
    """
    html = get_base_template(content)
    return send_email(partner_email, "Partner Registration Approved", html)


def send_partner_registration_rejected_email(partner_email, business_name, reason=None):
    """Send rejection email"""
    content = f"""
        <h2>Partner Registration Update</h2>
        <p>Dear {business_name},</p>
        <p>Thank you for your interest in partnering with us.</p>
        
        <div class="warning-box">
            <p><strong>Unfortunately, your partner registration application has not been approved at this time.</strong></p>
            {f'<p><strong>Reason:</strong> {reason}</p>' if reason else ''}
        </div>
        
        <p><strong>What you can do:</strong></p>
        <ul>
            <li>Review the feedback provided above</li>
            <li>Address any concerns and resubmit your application</li>
            <li>Contact our support team if you have questions</li>
        </ul>
        
        <p>We appreciate your understanding and hope to work with you in the future.</p>
    """
    html = get_base_template(content)
    return send_email(partner_email, "Partner Registration Update", html)


def send_new_booking_for_partner_email(partner_email, booking_data):
    """Send notification to partner when their service is booked"""
    content = f"""
        <h2>New Booking Received 📅</h2>
        <p>You have received a new booking for your service!</p>
        
        <div class="info-box">
            <h3>Booking Details</h3>
            <p><strong>Booking Reference:</strong> #{booking_data.get('booking_id', 'N/A')}</p>
            <p><strong>Service Type:</strong> {booking_data.get('service_type', 'N/A')}</p>
            <p><strong>Customer Name:</strong> {booking_data.get('customer_name', 'N/A')}</p>
            <p><strong>Customer Email:</strong> {booking_data.get('customer_email', 'N/A')}</p>
            <p><strong>Customer Phone:</strong> {booking_data.get('customer_phone', 'N/A')}</p>
            <p><strong>Date:</strong> {booking_data.get('booking_date', 'N/A')}</p>
            <p><strong>Number of Guests:</strong> {booking_data.get('number_of_guests', 1)}</p>
            {f"<p><strong>Special Requirements:</strong> {booking_data.get('notes', 'None')}</p>" if booking_data.get('notes') else ''}
        </div>
        
        <p><strong>Action Required:</strong></p>
        <ul>
            <li>Review the booking details in your partner dashboard</li>
            <li>Confirm availability and prepare for the booking</li>
            <li>Contact the customer if you need additional information</li>
        </ul>
        
        <p><a href="{FRONTEND_URL}/partner/manage" class="button">View Booking in Dashboard</a></p>
    """
    html = get_base_template(content)
    return send_email(partner_email, f"New Booking - {booking_data.get('service_type', 'Service')}", html)


# ==================== REVIEW EMAILS ====================

def send_review_submitted_email(user_email, username, review_type):
    """Send confirmation when review is submitted"""
    content = f"""
        <h2>Thank You for Your Review! ⭐</h2>
        <p>Hi {username},</p>
        <div class="success-box">
            <p><strong>Your {review_type} review has been submitted successfully!</strong></p>
        </div>
        <p>Your feedback helps other travelers make informed decisions and helps us improve our services.</p>
        <p>We truly appreciate you taking the time to share your experience.</p>
    """
    html = get_base_template(content)
    return send_email(user_email, "Review Submitted - Thank You!", html)


def send_review_deleted_email(user_email, username, reason=None):
    """Send notification when review is deleted/moderated"""
    content = f"""
        <h2>Review Moderation Notice</h2>
        <p>Hi {username},</p>
        <p>Your review has been removed by our moderation team.</p>
        {f'<div class="info-box"><p><strong>Reason:</strong> {reason}</p></div>' if reason else ''}
        <p>If you believe this was done in error, please contact our support team.</p>
    """
    html = get_base_template(content)
    return send_email(user_email, "Review Moderation Notice", html)


# ==================== MARKETING EMAILS ====================

def send_welcome_series_day1_email(user_email, username, popular_tours=None):
    """Day 1 of welcome series"""
    tours_list = ""
    if popular_tours:
        tours_list = "<ul>"
        for tour in popular_tours[:3]:
            tours_list += f"<li>{tour.get('name', 'Tour')}</li>"
        tours_list += "</ul>"
    
    content = f"""
        <h2>Welcome! Let's Start Your Journey 🌴</h2>
        <p>Hi {username},</p>
        <p>We're thrilled to have you join our travel community!</p>
        <p><strong>Popular Tours You Might Like:</strong></p>
        {tours_list if tours_list else '<p>Explore our amazing collection of tours and destinations!</p>'}
        <p><a href="{FRONTEND_URL}/tour" class="button">Browse Tours</a></p>
    """
    html = get_base_template(content)
    return send_email(user_email, "Welcome to Tourism Website!", html)


def send_welcome_series_day3_email(user_email, username):
    """Day 3 of welcome series"""
    content = f"""
        <h2>How to Book Your Dream Vacation 📖</h2>
        <p>Hi {username},</p>
        <p>Ready to book your first tour? Here's a quick guide:</p>
        <div class="info-box">
            <ol>
                <li><strong>Browse Tours:</strong> Explore our collection of amazing destinations</li>
                <li><strong>Select Dates:</strong> Choose your preferred departure date</li>
                <li><strong>Customize:</strong> Add room upgrades, meals, or transportation</li>
                <li><strong>Book & Pay:</strong> Secure checkout with multiple payment options</li>
                <li><strong>Confirmation:</strong> Receive instant booking confirmation</li>
            </ol>
        </div>
        <p><a href="{FRONTEND_URL}/tour" class="button">Start Booking Now</a></p>
    """
    html = get_base_template(content)
    return send_email(user_email, "How to Book Your Tour", html)


def send_welcome_series_day7_email(user_email, username, special_offers=None):
    """Day 7 of welcome series"""
    offers_text = ""
    if special_offers:
        offers_text = "<ul>"
        for offer in special_offers[:3]:
            offers_text += f"<li>{offer.get('title', 'Special Offer')} - {offer.get('discount', '')}% off</li>"
        offers_text += "</ul>"
    
    content = f"""
        <h2>Special Offers Just for You! 🎁</h2>
        <p>Hi {username},</p>
        <p>As a thank you for joining us, here are some exclusive offers:</p>
        {offers_text if offers_text else '<p>Check out our latest promotions and discounts!</p>'}
        <p><a href="{FRONTEND_URL}" class="button">View All Offers</a></p>
        <p><em>These offers are valid for a limited time. Don't miss out!</em></p>
    """
    html = get_base_template(content)
    return send_email(user_email, "Special Offers for You", html)


def send_post_tour_followup_email(customer_email, customer_name, tour_name, review_link=None):
    """Send follow-up email after tour completion"""
    # Link to account page where user can write reviews
    account_page_link = f"{FRONTEND_URL}/account"
    review_button = f'<p><a href="{account_page_link}" class="button">Write a Review</a></p>'
    
    content = f"""
        <h2>How Was Your Tour? ⭐</h2>
        <p>Dear {customer_name},</p>
        <p>We hope you had an amazing experience on your <strong>{tour_name}</strong> tour!</p>
        
        <p><strong>We'd love to hear from you:</strong></p>
        <ul>
            <li>Share your experience with a review</li>
            <li>Upload photos from your trip</li>
            <li>Help other travelers discover great tours</li>
        </ul>
        
        {review_button}
        
        <p><strong>Looking for your next adventure?</strong></p>
        <p>Check out our other amazing tours and destinations!</p>
        <p><a href="{FRONTEND_URL}/tour" class="button">Explore More Tours</a></p>
        
        <p>Thank you for choosing us. We hope to see you again soon!</p>
    """
    html = get_base_template(content)
    return send_email(customer_email, f"How Was Your {tour_name} Tour?", html)

