const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const NOTIFY_EMAIL = 'ballarat@littlewonderselc.com.au';

async function sendEnrolmentEmail(data) {
  const { childName, childDob, program, startDate, parentName, parentPhone, parentEmail, message } = data;
  await transporter.sendMail({
    from: `"Little Wonders Website" <${process.env.SMTP_USER}>`,
    to: NOTIFY_EMAIL,
    subject: `New Enrolment Enquiry – ${childName}`,
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
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Additional Info</td><td style="padding:8px;">${message || '—'}</td></tr>
      </table>
    `,
  });
}

async function sendContactEmail(data) {
  const { name, phone, email, subject, message } = data;
  await transporter.sendMail({
    from: `"Little Wonders Website" <${process.env.SMTP_USER}>`,
    to: NOTIFY_EMAIL,
    subject: `New Contact Message – ${subject || 'General Enquiry'}`,
    html: `
      <h2 style="color:#8ED16F;">New Contact Message</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;">Name</td><td style="padding:8px;">${name}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Phone</td><td style="padding:8px;">${phone}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${email}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Subject</td><td style="padding:8px;">${subject || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Message</td><td style="padding:8px;">${message}</td></tr>
      </table>
    `,
  });
}

module.exports = { sendEnrolmentEmail, sendContactEmail };
