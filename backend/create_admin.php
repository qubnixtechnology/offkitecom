<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$admin = User::where('email', 'admin@offkite.com')->first();

if ($admin) {
    $admin->update([
        'is_admin' => true,
        'password' => Hash::make('Admin@123'),
    ]);
    echo "Admin already exists. Updated is_admin = true and reset password to Admin@123.\n";
    echo "Email: " . $admin->email . "\n";
} else {
    $admin = User::create([
        'name'     => 'Admin',
        'email'    => 'admin@offkite.com',
        'password' => Hash::make('Admin@123'),
        'is_admin' => true,
    ]);
    echo "Admin created successfully!\n";
    echo "Email:    admin@offkite.com\n";
    echo "Password: Admin@123\n";
}

echo "is_admin: " . ($admin->is_admin ? 'YES' : 'NO') . "\n";
