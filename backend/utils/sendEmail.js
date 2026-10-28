import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // 1. Samee qalabka iimaylka diraya (Transporter)
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Haddii aad Gmail isticmaalayso
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Isticmaal true haddii port-ku yahay 465
        auth: {
            user: process.env.EMAIL_USER, // Iimaylkaaga (ka soo qaado .env)
            pass: process.env.EMAIL_PASS, // Password-ka "App Password" ee Gmail
        },
        // KANI WAA XALKA ERROR-KA: "self-signed certificate"
        tls: {
            rejectUnauthorized: false // Waxay u ogolaanaysaa Localhost inuu diro iimaylka
        }
    });

    // 2. Diyaarso macluumaadka iimaylka
    const mailOptions = {
        from: `"Gargaar Support" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message, // Plain text version
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 15px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #2563eb; margin-bottom: 0;">Gargaar Health</h1>
                    <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Secure Doctor Portal</p>
                </div>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #2563eb;">
                    <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">
                        ${options.message.replace(/\n/g, '<br>')}
                    </p>
                </div>
                <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
                    <p>Fadlan ha ka jawaabin iimaylkan. Waa mid si otomaatig ah loo soo diray.</p>
                    <p>&copy; ${new Date().getFullYear()} Gargaar Digital Health Platform</p>
                </div>
            </div>
        `,
    };

    // 3. Dir iimaylka
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("🚀 Iimaylka si guul leh ayaa loo diray: %s", info.messageId);
    } catch (error) {
        console.error("❌ Nodemailer Error:", error);
        throw new Error("Iimaylka lama diri karin, fadlan iska hubi xogtaada.");
    }
};

export default sendEmail;