export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    const fromEmail = process.env.MAILGUN_FROM;
    const toEmail = process.env.MAILGUN_TO;

    if (!apiKey || !domain || !fromEmail || !toEmail) {
        res.status(500).json({ error: 'Email service is not configured.' });
        return;
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { name, email, phone, vehicle, location, message } = body || {};

        if (!name || !email || !location) {
            res.status(400).json({ error: 'Missing required fields.' });
            return;
        }

        const textBody = [
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone || 'Not provided'}`,
            `Vehicle: ${vehicle || 'Not provided'}`,
            `Location: ${location}`,
            '',
            'Message:',
            message || 'No additional details provided.'
        ].join('\n');

        const form = new URLSearchParams();
        form.append('from', fromEmail);
        form.append('to', toEmail);
        form.append('subject', `Quote Request from ${name}`);
        form.append('text', textBody);

        const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: form
        });

        if (!response.ok) {
            const errorText = await response.text();
            res.status(502).json({ error: 'Email send failed.', details: errorText });
            return;
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Unexpected server error.' });
    }
}
