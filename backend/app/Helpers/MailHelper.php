<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MailHelper
{
    public static function sendEmail($type, $recipientEmail, $recipientName, $data = [])
    {
        $path = storage_path('app/email_settings.json');
        $settings = null;
        if (file_exists($path)) {
            $settings = json_decode(file_get_contents($path), true);
        }

        $apiKey = !empty($settings['emailProvider']['apiKey']) ? $settings['emailProvider']['apiKey'] : config('services.brevo.api_key');
        $senderName = $settings['emailProvider']['senderName'] ?? 'Off-Kilt Production';
        $senderEmail = $settings['emailProvider']['senderEmail'] ?? 'Info@off-kilt.com';
        
        // Defaults to enabled if not found
        $enabled = true;
        if (isset($settings['emailToggles']) && is_array($settings['emailToggles'])) {
            $enabled = $settings['emailToggles'][$type] ?? true;
        }

        if (!$enabled) {
            Log::info("Email type {$type} is disabled in settings. Skipping.");
            return false;
        }

        // Get template subject and body defaults
        $subject = "Off-Kilt Notification";
        $body = "";

        if ($type === 'forgot_password') {
            $subject = $settings['templates']['forgot_password']['subject'] ?? 'Reset Your Password - Off-Kilt';
            $body = $settings['templates']['forgot_password']['body'] ?? "Hello {{customer_name}},\n\nClick the button below to reset your password.\n\n[ Reset Password ]\n\nThis link expires in 15 minutes.\n\n— Off-Kilt Team";
        } else if ($type === 'order_confirm') {
            $subject = $settings['templates']['order_confirm']['subject'] ?? 'Order Confirmed - Off-Kilt';
            $body = $settings['templates']['order_confirm']['body'] ?? "Hello {{customer_name}},\n\nYour order {{order_id}} has been confirmed for ₹{{total_amount}}.\n\nThank you for shopping with us!\n\n— Off-Kilt Team";
        } else if ($type === 'order_shipped') {
            $subject = $settings['templates']['order_shipped']['subject'] ?? 'Order Shipped - Off-Kilt';
            $body = $settings['templates']['order_shipped']['body'] ?? "Hello {{customer_name}},\n\nYour order {{order_id}} has been shipped via courier.\n\nTracking AWB: {{awb_number}}\n\n— Off-Kilt Team";
        } else if ($type === 'order_delivered') {
            $subject = $settings['templates']['order_delivered']['subject'] ?? 'Order Delivered - Off-Kilt';
            $body = $settings['templates']['order_delivered']['body'] ?? "Hello {{customer_name}},\n\nYour order {{order_id}} has been successfully delivered.\n\nEnjoy your new style!\n\n— Off-Kilt Team";
        } else if ($type === 'welcome') {
            $subject = $settings['templates']['welcome']['subject'] ?? 'Welcome to Off-Kilt!';
            $body = $settings['templates']['welcome']['body'] ?? "Hello {{customer_name}},\n\nWelcome to the rebellion. Your account is now active.\n\n— Off-Kilt Team";
        } else if ($type === 'newsletter') {
            $subject = $settings['templates']['newsletter']['subject'] ?? 'Subscribed to Off-Kilt Newsletter!';
            $body = $settings['templates']['newsletter']['body'] ?? "Hello,\n\nYou have successfully joined our newsletter. Use code WELCOME20 for 20% off your first order.\n\n— Off-Kilt Team";
        }

        // Replace placeholders
        $placeholders = [
            '{{customer_name}}' => $recipientName,
            '{{order_id}}' => $data['order_id'] ?? '',
            '{{total_amount}}' => $data['total_amount'] ?? '',
            '{{awb_number}}' => $data['awb_number'] ?? '',
            '{{reset_link}}' => $data['reset_link'] ?? ''
        ];

        foreach ($placeholders as $placeholder => $val) {
            if ($val !== null) {
                $body = str_replace($placeholder, $val, $body);
                $subject = str_replace($placeholder, $val, $subject);
            }
        }

        // Convert body plain text to HTML with links clickable
        $htmlContent = nl2br(e($body));
        
        // If there's a reset link, let's wrap it in a nice luxury button style
        if (!empty($data['reset_link'])) {
            $btnHtml = '<div style="margin: 25px 0;"><a href="' . e($data['reset_link']) . '" style="background-color: #111111; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 0.85rem; font-family: sans-serif; letter-spacing: 2px; text-transform: uppercase; border: 1px solid #333333; display: inline-block;">Reset Password</a></div>';
            $htmlContent = str_replace('[ Reset Password ]', $btnHtml, $htmlContent);
        }

        // Send via Brevo API
        try {
            $response = Http::withHeaders([
                'api-key' => $apiKey,
                'Content-Type' => 'application/json'
            ])->post('https://api.brevo.com/v3/smtp/email', [
                'sender' => ['name' => $senderName, 'email' => $senderEmail],
                'to' => [['email' => $recipientEmail, 'name' => $recipientName]],
                'subject' => $subject,
                'htmlContent' => "<html><body style=\"font-family: sans-serif; color: #111111; line-height: 1.6; padding: 20px;\"><div style=\"max-width: 600px; margin: 0 auto; border: 1px solid #eeeeee; padding: 30px; background-color: #ffffff;\"><div style=\"text-align: center; border-bottom: 2px solid #111111; padding-bottom: 20px; margin-bottom: 30px;\"><h1 style=\"font-size: 1.8rem; letter-spacing: 4px; text-transform: uppercase; margin: 0;\">off-kilt</h1><p style=\"font-size: 0.7rem; letter-spacing: 2px; color: #888888; margin: 5px 0 0 0;\">FASHION BEYOND ORDINARY</p></div><div>{$htmlContent}</div><div style=\"margin-top: 40px; border-top: 1px solid #eeeeee; padding-top: 20px; font-size: 0.7rem; color: #888888; text-align: center;\"><p>© " . date('Y') . " Off-Kilt Production. All rights reserved.</p></div></div></body></html>"
            ]);

            if ($response->successful()) {
                Log::info("Email sent successfully via Brevo to {$recipientEmail}.");
                return true;
            } else {
                Log::error("Brevo API send failed: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("MailHelper Exception: " . $e->getMessage());
            return false;
        }
    }
}
