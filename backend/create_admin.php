<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$admin = User::where('email', 'admin@offkilt.com')->first();

if ($admin) {
    $admin->update([
        'is_admin' => true,
        'password' => Hash::make('Admin123@offkilt'),
    ]);
    echo "Admin already exists. Updated is_admin = true and reset password to Admin123@offkilt.\n";
    echo "Email: " . $admin->email . "\n";
} else {
    $admin = User::create([
        'name'     => 'Admin',
        'email'    => 'admin@offkilt.com',
        'password' => Hash::make('Admin123@offkilt'),
        'is_admin' => true,
    ]);
    echo "Admin created successfully!\n";
    echo "Email:    admin@offkilt.com\n";
    echo "Password: Admin123@offkilt\n";
}

echo "is_admin: " . ($admin->is_admin ? 'YES' : 'NO') . "\n";
