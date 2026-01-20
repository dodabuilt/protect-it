<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$apiKey = getenv('MAILGUN_API_KEY');
$domain = getenv('MAILGUN_DOMAIN');
$fromEmail = getenv('MAILGUN_FROM');
$toEmail = getenv('MAILGUN_TO');

if (!$apiKey || !$domain || !$fromEmail || !$toEmail) {
    http_response_code(500);
    echo json_encode(['error' => 'Email service is not configured.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request body.']);
    exit;
}

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');
$vehicle = trim($input['vehicle'] ?? '');
$rustLevel = trim($input['rustLevel'] ?? '');
$location = trim($input['location'] ?? '');
$message = trim($input['message'] ?? '');

if ($name === '' || $email === '' || $location === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields.']);
    exit;
}

$textBody = "Name: {$name}\n"
    . "Email: {$email}\n"
    . "Phone: " . ($phone !== '' ? $phone : 'Not provided') . "\n"
    . "Vehicle: " . ($vehicle !== '' ? $vehicle : 'Not provided') . "\n"
    . "Rust Level: " . ($rustLevel !== '' ? $rustLevel : 'Not provided') . "\n"
    . "Location: {$location}\n\n"
    . "Message:\n" . ($message !== '' ? $message : 'No additional details provided.');

$postFields = http_build_query([
    'from' => $fromEmail,
    'to' => $toEmail,
    'subject' => "Quote Request from {$name}",
    'text' => $textBody
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.mailgun.net/v3/{$domain}/messages");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_USERPWD, "api:{$apiKey}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Email send failed.', 'details' => $error]);
    exit;
}

if ($status < 200 || $status >= 300) {
    http_response_code(502);
    echo json_encode(['error' => 'Email send failed.', 'details' => $response]);
    exit;
}

echo json_encode(['ok' => true]);
