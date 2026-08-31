const nodemailer = require("nodemailer");

// =====================================================
// GMAIL EMAIL TRANSPORTER
// =====================================================

function getEmailTransporter() {

    const emailUser =
        String(
            process.env.EMAIL_USER ||
            process.env.SMTP_USER ||
            ""
        ).trim();

    const emailPass =
        String(
            process.env.EMAIL_PASS ||
            process.env.SMTP_PASS ||
            ""
        ).trim();


    if (!emailUser || !emailPass) {

        throw new Error(
            "Email service is not configured"
        );

    }


    return {
        transporter: nodemailer.createTransport({
            service: "gmail",

            auth: {
                user: emailUser,
                pass: emailPass
            }
        }),

        emailUser
    };
}


// =====================================================
// SEND STUDENT LOGIN CREDENTIALS
// =====================================================

async function sendStudentCredentials(
    studentEmail,
    studentName,
    username,
    temporaryPassword
) {

    const recipientEmail =
        String(studentEmail || "").trim().toLowerCase();

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(recipientEmail)) {

        throw new Error(
            "Invalid student email address"
        );

    }


    const {
        transporter,
        emailUser
    } =
        getEmailTransporter();


    const mailOptions = {

        from: `"GCE Erode Counselling" <${emailUser}>`,

        to: recipientEmail,

        subject: "GCE Erode Counselling - Student Login Credentials",

        html: `
        <!DOCTYPE html>

        <html>

        <body style="
            font-family: Arial, sans-serif;
            background-color: #f4f6f8;
            padding: 30px;
        ">

            <div style="
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
            ">

                <h2>
                    GCE Erode Counselling
                </h2>

                <p>
                    Dear <strong>${studentName}</strong>,
                </p>

                <p>
                    Your student account has been created successfully
                    by the counselling administration.
                </p>

                <h3>
                    Your Login Credentials
                </h3>

                <table style="
                    width: 100%;
                    border-collapse: collapse;
                ">

                    <tr>
                        <td style="padding: 10px;">
                            <strong>Username</strong>
                        </td>

                        <td style="padding: 10px;">
                            ${username}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 10px;">
                            <strong>Temporary Password</strong>
                        </td>

                        <td style="padding: 10px;">
                            ${temporaryPassword}
                        </td>
                    </tr>

                </table>

                <p>
                    Please use these credentials to log in to
                    the GCE Erode Counselling portal.
                </p>

                <p>
                    For security, please change your password
                    after your first login.
                </p>

                <br>

                <p>
                    Regards,<br>
                    <strong>GCE Erode Counselling Administration</strong>
                </p>

            </div>

        </body>

        </html>
        `
    };


    return transporter.sendMail(mailOptions);
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    sendStudentCredentials
};
