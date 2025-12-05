const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const { marked } = require("marked");
const fs = require("fs");
const path = require("path");

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    let htmlToSend = options.message;

    if (options.template) {
        const templatePath = path.join(__dirname, "../templates/emails", options.template);
        const templateSource = fs.readFileSync(templatePath, "utf8");

        // Compile template with Handlebars
        const template = handlebars.compile(templateSource);
        const compiledContent = template(options.context);

        // If markdown, convert to HTML
        let bodyContent = compiledContent;
        if (options.template.endsWith(".md")) {
            bodyContent = marked(compiledContent);
        }

        // Load base layout
        const layoutPath = path.join(__dirname, "../templates/emails/base.html");
        const layoutSource = fs.readFileSync(layoutPath, "utf8");
        const layoutTemplate = handlebars.compile(layoutSource);

        // Inject content into layout
        htmlToSend = layoutTemplate({ body: bodyContent });
    }

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: htmlToSend,
        text: options.message, // Fallback plain text
    };

    await transporter.sendMail(message);
};

module.exports = sendEmail;
