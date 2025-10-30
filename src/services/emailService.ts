import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Get these values from https://www.emailjs.com/
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

interface SendCredentialsEmailParams {
  toEmail: string;
  employeeName: string;
  password: string;
  fromEmail?: string;
}

export const sendCredentialsEmail = async ({
  toEmail,
  employeeName,
  password,
}: SendCredentialsEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Initialize EmailJS (only needs to be done once)
    if (EMAILJS_PUBLIC_KEY) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    // Template parameters - these will be used in your EmailJS template
    const templateParams = {
      to_email: toEmail,
      to_name: employeeName,
      employee_name: employeeName,
      employee_email: toEmail,
      employee_password: password,
      company_name: 'Nimbus HR',
      login_url: window.location.origin,
      current_year: new Date().getFullYear(),
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    return {
      success: true,
      messageId: response.text,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

