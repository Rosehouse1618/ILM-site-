import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Helper function to generate application ID
function generateApplicationId() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const last4Timestamp = timestamp.slice(-4);
  const uniqueId = last4Timestamp + random;
  return `RH-ILM-${uniqueId}`;
}

// Helper function to format email content
function formatAdminEmailContent(formData) {
  const fullName = [
    formData.firstName,
    formData.middleName,
    formData.lastName
  ].filter(Boolean).join(' ');
  return `New booking application received:

Application ID: ${formData.applicationId}
Submitted: ${new Date(formData.submissionDate).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONAL INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Date of Birth: ${formData.dateOfBirth || 'Not provided'}
Gender: ${formData.gender || 'Not specified'}
Nationality: ${formData.nationality || 'Not provided'}
Passport/ID: ${formData.passportNumber || 'Not provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACADEMIC INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
University: ${formData.university || formData.otherUniversity || 'Not specified'}
Course: ${formData.courseOfStudy || 'Not specified'}
Year of Study: ${formData.yearOfStudy || 'Not specified'}
Student ID: ${formData.studentId || 'Not provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCOMMODATION PREFERENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Room Type: ${formData.roomType || 'Not specified'}
Check-in Date: ${formData.checkInDate || 'Not specified'}
Contract Length: ${formData.contractLength || 'Not specified'}
Room Preferences: ${formData.roomPreferences || 'None specified'}
Parking Required: ${formData.parkingRequired === 'yes' ? 'Yes (+£20/week)' : 'No'}
Bike Storage: ${formData.bikeStorageRequired === 'yes' ? 'Yes' : 'No'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADDITIONAL INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Home Address: ${formData.homeAddress || 'Not provided'}
Dietary Requirements: ${formData.dietaryRequirements || 'None specified'}
Medical Conditions: ${formData.medicalConditions || 'None disclosed'}
Additional Info: ${formData.additionalInfo || 'None provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${formData.referenceName || 'Not provided'}
Relationship: ${formData.referenceRelationship || 'Not provided'}
Email: ${formData.referenceEmail || 'Not provided'}
Phone: ${formData.referenceTelephone || 'Not provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GUARANTOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formData.provideGuarantorLater ? 'To be provided later' : `Name: ${formData.guarantorName || 'Not provided'}
Relationship: ${formData.guarantorRelationship || 'Not provided'}
Email: ${formData.guarantorEmail || 'Not provided'}
Phone: ${formData.guarantorTelephone || 'Not provided'}
Address: ${formData.guarantorAddress || 'Not provided'}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMERGENCY CONTACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${formData.emergencyName || 'Not provided'}
Relationship: ${formData.emergencyRelation || 'Not provided'}
Phone: ${formData.emergencyPhone || 'Not provided'}
Email: ${formData.emergencyEmail || 'Not provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please review this application in the admin dashboard:
https://ilm-studenthalls.com/admin-dashboard.html`;
}

function formatStudentEmailContent(formData) {
  const fullName = [
    formData.firstName,
    formData.middleName,
    formData.lastName
  ].filter(Boolean).join(' ');
  return `Dear ${formData.firstName},

Thank you for your accommodation application to iLm Halal Student Halls!

We are pleased to confirm that we have received your application. Here are the details for your records:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Application ID: ${formData.applicationId}
Submitted: ${new Date(formData.submissionDate).toLocaleString()}

Personal Information:
• Name: ${fullName}
• Email: ${formData.email}
• Phone: ${formData.phone}

Academic Information:
• University: ${formData.university || formData.otherUniversity || 'Not specified'}
• Course: ${formData.courseOfStudy || 'Not specified'}
• Year of Study: ${formData.yearOfStudy || 'Not specified'}

Accommodation Details:
• Room Type: ${formData.roomType || 'Not specified'}
• Check-in Date: ${formData.checkInDate || 'Not specified'}
• Contract Length: ${formData.contractLength || 'Not specified'}
${formData.parkingRequired === 'yes' ? '• Parking: Required (+£20/week)\n' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT HAPPENS NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Your application has been received and saved securely
✅ Our team will review your application within 48 hours
✅ You will receive an email update on your application status
✅ If approved, we will send booking confirmation and payment details

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Keep this email for your records
• Your application ID is: ${formData.applicationId}
• For urgent queries, contact us at: RoseHouse.ilm@outlook.com
• Office hours: Monday-Friday, 9 AM - 5 PM

We appreciate your interest in our halal accommodation and look forward to welcoming you to our community!

Best regards,
iLm Halal Student Halls Team

Rose House
16-18 Constitution Terrace
Dundee DD3 6JE

Email: RoseHouse.ilm@outlook.com
Website: https://ilm-studenthalls.com

Follow us on social media for updates and community news.`;
}

// reCAPTCHA verification function
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const recaptchaSecretKey = Deno.env.get('RECAPTCHA_SECRET_KEY') || '6Le3cWwrAAAAAPbHM92odjGjWFrETjuAYsy-7lB-';
    
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${recaptchaSecretKey}&response=${token}`,
    });

    const result = await response.json();
    console.log('reCAPTCHA verification result:', result);
    
    return result.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Parse form data
    const formData = await req.json();
    
    // Verify reCAPTCHA token
    if (!formData.recaptchaToken) {
      throw new Error('reCAPTCHA token is required');
    }
    
    const isRecaptchaValid = await verifyRecaptcha(formData.recaptchaToken);
    if (!isRecaptchaValid) {
      throw new Error('reCAPTCHA verification failed. Please try again.');
    }
    
    console.log('reCAPTCHA verification passed for submission');
    
    // Generate application ID and submission date if not provided
    if (!formData.applicationId) {
      formData.applicationId = generateApplicationId();
    }
    if (!formData.submissionDate) {
      formData.submissionDate = new Date().toISOString();
    }
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Prepare data for Supabase (snake_case columns)
    const applicationData = {
      id: formData.applicationId,
      first_name: formData.firstName || '',
      middle_name: formData.middleName || '',
      last_name: formData.lastName || '',
      email: formData.email || '',
      phone: formData.phone || '',
      date_of_birth: formData.dateOfBirth || null,
      gender: formData.gender || '',
      nationality: formData.nationality || '',
      passport_number: formData.passportNumber || '',
      university: formData.university || formData.otherUniversity || '',
      course_of_study: formData.courseOfStudy || '',
      year_of_study: formData.yearOfStudy || '',
      student_id: formData.studentId || '',
      room_type: formData.roomType || '',
      check_in_date: formData.checkInDate || null,
      contract_length: formData.contractLength || '',
      status: 'new',
      submission_date: formData.submissionDate,
      home_address: formData.homeAddress || '',
      room_preferences: formData.roomPreferences || '',
      dietary_requirements: formData.dietaryRequirements || '',
      medical_conditions: formData.medicalConditions || '',
      reference_name: formData.referenceName || '',
      reference_relationship: formData.referenceRelationship || '',
      reference_email: formData.referenceEmail || '',
      reference_telephone: formData.referenceTelephone || '',
      guarantor_name: formData.guarantorName || '',
      guarantor_relationship: formData.guarantorRelationship || '',
      guarantor_email: formData.guarantorEmail || '',
      guarantor_telephone: formData.guarantorTelephone || '',
      guarantor_address: formData.guarantorAddress || '',
      emergency_name: formData.emergencyName || '',
      emergency_phone: formData.emergencyPhone || '',
      emergency_email: formData.emergencyEmail || '',
      emergency_relationship: formData.emergencyRelation || '',
      parking_required: formData.parkingRequired === 'yes' || formData.parkingRequired === true,
      bike_storage_required: formData.bikeStorageRequired === 'yes' || formData.bikeStorageRequired === true,
      additional_info: formData.additionalInfo || '',
      notes: '',
      last_modified: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    // Insert data into Supabase
    const { data: insertedData, error } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    // Ensure we have an application ID to return
    const returnedApplicationId = insertedData?.id || formData.applicationId;
    
    console.log('✅ Application saved successfully with ID:', returnedApplicationId);

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not found in environment variables');
    }
    const resend = new Resend(resendApiKey);
    // Send admin notification email
    const fullName = [
      formData.firstName,
      formData.middleName,
      formData.lastName
    ].filter(Boolean).join(' ');
    const adminEmailPromise = resend.emails.send({
      from: 'ILM Student Halls <noreply@ilm-studenthalls.com>',
      to: [
        'RoseHouse.ilm@outlook.com'
      ],
      subject: `New Booking Application - ${fullName} (${formData.applicationId})`,
      text: formatAdminEmailContent(formData)
    });
    // Send student confirmation email
    const studentEmailPromise = resend.emails.send({
      from: 'ILM Student Halls <noreply@ilm-studenthalls.com>',
      to: [
        formData.email
      ],
      subject: `Application Received - iLm Halal Student Halls (${formData.applicationId})`,
      text: formatStudentEmailContent(formData)
    });
    // Send both emails in parallel
    const [adminEmailResult, studentEmailResult] = await Promise.allSettled([
      adminEmailPromise,
      studentEmailPromise
    ]);
    // Log email results
    if (adminEmailResult.status === 'rejected') {
      console.error('Failed to send admin email:', adminEmailResult.reason);
    } else {
      console.log('Admin email sent successfully');
    }
    if (studentEmailResult.status === 'rejected') {
      console.error('Failed to send student email:', studentEmailResult.reason);
    } else {
      console.log('Student email sent successfully');
    }
    // Return success response with the application ID
    return new Response(
      JSON.stringify({
        message: 'Application submitted successfully!',
        applicationId: returnedApplicationId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing booking:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An error occurred while processing your application'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
}, {
  verify: false
});
