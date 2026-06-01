<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = Storage::get('products.json');
        if (!$json) {
            echo "products.json not found in storage/app\n";
            return;
        }

        $products = json_decode($json, true);

        foreach ($products as $product) {
            DB::table('products')->updateOrInsert(
                ['id' => $product['id']],
                [
                    'name' => $product['name'],
                    'category' => $product['category'] ?? 'jeans',
                    'price' => $product['price'],
                    'tagline' => $product['tagline'] ?? '',
                    'description' => $product['description'] ?? '',
                    'details' => json_encode($product['details'] ?? []),
                    'sizes' => json_encode($product['sizes'] ?? []),
                    'materials' => $product['materials'] ?? null,
                    'shipping' => $product['shipping'] ?? null,
                    'image' => $product['image'] ?? null,
                    'hover_image' => $product['hoverImage'] ?? null,
                    'images' => json_encode($product['images'] ?? []),
                    'badge' => $product['badge'] ?? null,
                    'is_active' => true,
                    'stock' => $product['stock'] ?? 50,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
