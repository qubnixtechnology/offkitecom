<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'product_id',
        'color_name',
        'color_hex',
        'price',
        'stock',
        'sku',
        'status',
        'display_order',
    ];

    protected $appends = ['color', 'hex', 'images'];
    protected $hidden = ['color_name', 'color_hex'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getImagesRelation()
    {
        return $this->hasMany(VariantImage::class, 'variant_id')->orderBy('sort_order', 'asc');
    }

    // Accessors to match the frontend shape
    public function getColorAttribute()
    {
        return $this->color_name;
    }

    public function getHexAttribute()
    {
        return $this->color_hex;
    }

    public function getImagesAttribute()
    {
        return $this->getImagesRelation()->pluck('image_url')->toArray();
    }
}
