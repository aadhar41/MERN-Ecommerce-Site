# Email Template System Walkthrough

I have implemented a responsive email templating system using `handlebars` and `marked`.

## Features

- **HTML Layouts**: A `base.html` layout ensures consistent styling and responsiveness across all emails.
- **Markdown Support**: Write email content in simple Markdown (`.md`), which is automatically converted to HTML.
- **Dynamic Content**: Use Handlebars syntax (e.g., `{{name}}`) to inject dynamic data into templates.
- **Responsive Design**: The base layout includes CSS media queries to ensure emails look great on mobile devices.

## Files Created/Modified

### [base.html](file:///d:/wamp64_2/www/shopit/backend/templates/emails/base.html)

The master template containing the HTML structure and responsive CSS.

### [passwordReset.md](file:///d:/wamp64_2/www/shopit/backend/templates/emails/passwordReset.md)

The content for the password reset email, written in Markdown.

### [sendEmail.js](file:///d:/wamp64_2/www/shopit/backend/utils/sendEmail.js)

Updated to handle template rendering.

### [authController.js](file:///d:/wamp64_2/www/shopit/backend/controllers/authController.js)

Updated `forgotPassword` to use the new template system.

## Usage Example

```javascript
await sendEmail({
    email: user.email,
    subject: "Welcome!",
    template: "welcome.md", // Create this file in templates/emails
    context: {
        name: user.name,
        loginUrl: "https://shopit.com/login"
    }
});
```
