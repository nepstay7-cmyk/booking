const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send booking confirmation email
exports.sendBookingConfirmation = async (booking, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Booking Confirmation - Nepal Hotel Booking',
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Dear ${user.name},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <ul>
          <li><strong>Property:</strong> ${booking.property.name}</li>
          <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</li>
          <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</li>
          <li><strong>Guests:</strong> ${booking.guests}</li>
          <li><strong>Total Amount:</strong> NPR ${booking.totalAmount}</li>
          <li><strong>Payment Status:</strong> ${booking.paymentStatus}</li>
        </ul>
        <p>Thank you for choosing Nepal Hotel Booking!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send booking cancellation email
exports.sendBookingCancellation = async (booking, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Booking Cancelled - Nepal Hotel Booking',
      html: `
        <h2>Booking Cancelled</h2>
        <p>Dear ${user.name},</p>
        <p>Your booking has been cancelled. Here are the details:</p>
        <ul>
          <li><strong>Property:</strong> ${booking.property.name}</li>
          <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</li>
          <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</li>
          <li><strong>Reason:</strong> ${booking.cancellationReason || 'Cancelled by user'}</li>
        </ul>
        <p>If you have any questions, please contact our support team.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking cancellation email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send owner verification email
exports.sendOwnerVerification = async (user, status) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Property Owner Verification ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      html: `
        <h2>Verification ${status === 'approved' ? 'Approved' : 'Rejected'}</h2>
        <p>Dear ${user.name},</p>
        <p>Your property owner account verification has been ${status}.</p>
        ${status === 'approved' 
          ? '<p>You can now start listing your properties on our platform.</p>'
          : '<p>Please contact support if you have any questions.</p>'
        }
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Owner verification email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


