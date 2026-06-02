<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'pincode',
        'profile_image',
        'member_tier',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_admin'          => 'boolean',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function sendPasswordResetNotification($token)
    {
        $resetLink = config('app.frontend_url', 'http://localhost:5173') . '?reset-token=' . $token . '&reset-email=' . urlencode($this->email);
        
        $sent = \App\Helpers\MailHelper::sendEmail('forgot_password', $this->email, $this->name, [
            'reset_link' => $resetLink
        ]);

        if (!$sent) {
            throw new \Exception("Failed to send password reset email via Brevo.");
        }
    }
}
