<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'category',
        'price',
        'tagline',
        'description',
        'details',
        'sizes',
        'materials',
        'shipping',
        'image',
        'hover_image',
        'images',
        'badge',
        'is_active',
        'slug',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'details' => 'array',
        'sizes'   => 'array',
        'images'  => 'array',
        'is_active' => 'boolean',
        'price'   => 'integer',
    ];

    protected $with = ['variants'];

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
