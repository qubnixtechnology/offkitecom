<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'email',
        'phone',
        'shipping_address',
        'payment_method',
        'subtotal',
        'shipping_fee',
        'total',
        'status',
        'payment_verified',
        'placed_at',
        'awb_number',
        'tracking_number',
    ];

    protected $casts = [
        'payment_verified' => 'boolean',
        'placed_at'        => 'datetime',
        'subtotal'         => 'integer',
        'shipping_fee'     => 'integer',
        'total'            => 'integer',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
