<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    // ─── Dashboard stats ──────────────────────────────────────────────────────

    public function dashboard()
    {
        return response()->json([
            'total_products'        => Product::count(),
            'active_products'       => Product::where('is_active', true)->count(),
            'inactive_products'     => Product::where('is_active', false)->count(),
            'total_orders'          => Order::count(),
            'confirmed_orders'      => Order::where('status', 'confirmed')->count(),
            'production_orders'     => Order::where('status', 'production')->count(),
            'dispatched_orders'     => Order::where('status', 'dispatched')->count(),
            'transit_orders'        => Order::where('status', 'transit')->count(),
            'delivered_orders'      => Order::where('status', 'delivered')->count(),
            'total_revenue'         => Order::sum('total'),
            'total_users'           => User::count(),
        ]);
    }

    // ─── CMS Media Upload ─────────────────────────────────────────────────────
    // Uploads image/video files to public/cms-uploads/ and returns a permanent URL.
    // Files stored here are served directly (no storage:link needed) and visible to all users.

    public function uploadMedia(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:204800', // 200MB max
        ]);

        $file      = $request->file('file');
        $ext       = strtolower($file->getClientOriginalExtension());
        $name      = time() . '_' . Str::random(10) . '.' . $ext;

        // Save directly under public/ so it is accessible at /cms-uploads/<name>
        $uploadDir = public_path('cms-uploads');
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $file->move($uploadDir, $name);

        return response()->json([
            'url'  => '/cms-uploads/' . $name,
            'name' => $name,
        ]);
    }

    // ─── Email Settings ───────────────────────────────────────────────────────

    public function getEmailSettings()
    {
        $path = storage_path('app/email_settings.json');
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            if ($data) {
                return response()->json($data);
            }
        }

        // Default settings
        return response()->json([
            'emailProvider' => [
                'provider'    => 'Brevo',
                'senderName'  => 'Off-Kilt Production',
                'senderEmail' => 'offkiltfashion@gmail.com',
                'apiKey'      => config('services.brevo.api_key')
            ],
            'emailToggles' => [
                'welcome'         => true,
                'forgot_password' => true,
                'order_confirm'   => true,
                'order_shipped'   => true,
                'order_delivered' => true,
                'contact_form'    => true,
                'newsletter'      => true
            ],
            'templates' => [
                'forgot_password' => [
                    'subject' => 'Reset Your Password - Off-Kilt',
                    'body'    => "Hello {{customer_name}},\n\nClick the button below to reset your password.\n\n[ Reset Password ]\n\nThis link expires in 15 minutes.\n\n— Off-Kilt Team"
                ],
                'welcome' => [
                    'subject' => 'Welcome to Off-Kilt!',
                    'body'    => "Hello {{customer_name}},\n\nWelcome to the rebellion. Your account is now active.\n\n— Off-Kilt Team"
                ],
                'order_confirm' => [
                    'subject' => 'Order Confirmed - Off-Kilt',
                    'body'    => "Hello {{customer_name}},\n\nYour order {{order_id}} has been confirmed for ₹{{total_amount}}.\n\nThank you for shopping with us!\n\n— Off-Kilt Team"
                ],
                'order_shipped' => [
                    'subject' => 'Order Shipped - Off-Kilt',
                    'body'    => "Hello {{customer_name}},\n\nYour order {{order_id}} has been shipped via courier.\n\nTracking AWB: {{awb_number}}\n\n— Off-Kilt Team"
                ],
                'order_delivered' => [
                    'subject' => 'Order Delivered - Off-Kilt',
                    'body'    => "Hello {{customer_name}},\n\nYour order {{order_id}} has been successfully delivered.\n\nEnjoy your new style!\n\n— Off-Kilt Team"
                ],
                'newsletter' => [
                    'subject' => 'Subscribed to Off-Kilt Newsletter!',
                    'body'    => "Hello,\n\nYou have successfully joined our newsletter. Use code WELCOME20 for 20% off your first order.\n\n— Off-Kilt Team"
                ]
            ]
        ]);
    }

    public function saveEmailSettings(Request $request)
    {
        $path     = storage_path('app/email_settings.json');
        $existing = [];
        if (file_exists($path)) {
            $existing = json_decode(file_get_contents($path), true) ?: [];
        }
        $newSettings = array_merge($existing, $request->all());
        file_put_contents($path, json_encode($newSettings, JSON_PRETTY_PRINT));
        return response()->json(['message' => 'Settings saved successfully.']);
    }

    // ─── Global CMS Settings ──────────────────────────────────────────────────

    public function getGlobalSettings()
    {
        $path = storage_path('app/global_settings.json');
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            if ($data) {
                return response()->json($data);
            }
        }
        return response()->json([]);
    }

    public function saveGlobalSettings(Request $request)
    {
        $path     = storage_path('app/global_settings.json');
        $existing = [];
        if (file_exists($path)) {
            $existing = json_decode(file_get_contents($path), true) ?: [];
        }
        $newSettings = array_merge($existing, $request->all());
        file_put_contents($path, json_encode($newSettings, JSON_PRETTY_PRINT));
        return response()->json(['message' => 'Global settings saved successfully.']);
    }

    // ─── Test Email ───────────────────────────────────────────────────────────

    public function testEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $email   = $request->input('email');
        $success = \App\Helpers\MailHelper::sendEmail('welcome', $email, 'Test User', []);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => "Test email successfully sent to {$email} via Brevo SMTP."
            ]);
        } else {
            return response()->json([
                'success' => false,
                'error'   => \App\Helpers\MailHelper::$lastError ?: 'Unknown error occurred while sending email.'
            ], 400);
        }
    }
}
