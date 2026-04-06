const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const NOTIFY_EMAIL = 'ballarat@littlewonderselc.com.au';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@littlewonderselc.com.au';

async function sendEnrolmentEmail(data) {
  const { childName, childDob, program, startDate, parentName, parentPhone, parentEmail, message } = data;
  console.log(`[Mailer] Sending enrolment email for ${childName}`);
  try {
    const { data: result, error } = await resend.emails.send({
      from: `Little Wonders Website <${FROM_EMAIL}>`,
      to: NOTIFY_EMAIL,
      subject: `New Enrolment Enquiry - ${childName}`,
      html: `
        <h2 style="color:#F7B733;">New Enrolment Enquiry</h2>
        <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
          <tr><td style="padding:8px;font-weight:bold;">Child Name</td><td style="padding:8px;">${childName}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Date of Birth</td><td style="padding:8px;">${childDob}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Program</td><td style="padding:8px;">${program}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Preferred Start Date</td><td style="padding:8px;">${startDate}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Parent/Guardian</td><td style="padding:8px;">${parentName}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Phone</td><td style="padding:8px;">${parentPhone}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${parentEmail}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Additional Info</td><td style="padding:8px;">${message || '-'}</td></tr>
        </table>
      `,
    });
    if (error) throw new Error(error.message);
    console.log(`[Mailer] Enrolment email sent: ${result.id}`);
  } catch (err) {
    console.error(`[Mailer] Enrolment email FAILED:`, err.message);
    throw err;
  }
}

async function sendContactEmail(data) {
  const { name, phone, email, subject, message } = data;
  console.log(`[Mailer] Sending contact email from ${name}`);
  try {
    const { data: result, error } = await resend.emails.send({
      from: `Little Wonders Website <${FROM_EMAIL}>`,
      to: NOTIFY_EMAIL,
      subject: `New Contact Message - ${subject || 'General Enquiry'}`,
      html: `
        <h2 style="color:#8ED16F;">New Contact Message</h2>
        <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
          <tr><td style="padding:8px;font-weight:bold;">Name</td><td style="padding:8px;">${name}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Phone</td><td style="padding:8px;">${phone}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${email}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Subject</td><td style="padding:8px;">${subject || '-'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Message</td><td style="padding:8px;">${message}</td></tr>
        </table>
      `,
    });
    if (error) throw new Error(error.message);
    console.log(`[Mailer] Contact email sent: ${result.id}`);
  } catch (err) {
    console.error(`[Mailer] Contact email FAILED:`, err.message);
    throw err;
  }
}

module.exports = { sendEnrolmentEmail, sendContactEmail };
