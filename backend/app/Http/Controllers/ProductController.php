<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // ─── Public: list active products ────────────────────────────────────────

    public function index(Request $request)
    {
        $query = Product::where('is_active', true);

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('tagline', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    // ─── Public: get single product ──────────────────────────────────────────

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    // ─── Admin: list ALL products (including inactive) ────────────────────────

    public function adminIndex(Request $request)
    {
        $query = Product::query();

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    // ─── Admin: create product ────────────────────────────────────────────────

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'tagline'          => 'nullable|string|max:500',
            'price'            => 'required|numeric|min:0',
            'discountPrice'    => 'nullable|numeric|min:0',
            'category'         => 'required|string|max:100',
            'image'            => 'nullable|string',       // URL or base64
            'hover_image'      => 'nullable|string',
            'stock'            => 'nullable|integer|min:0',
            'badge'            => 'nullable|string|max:50',
            'description'      => 'nullable|string',
            'details'          => 'nullable|array',
            'materials'        => 'nullable|string',
            'shipping'         => 'nullable|string',
            'sizes'            => 'nullable|array',
            'images'           => 'nullable|array',
            'is_active'        => 'nullable|boolean',
            'slug'             => 'nullable|string|max:255',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:1000',
            'meta_keywords'    => 'nullable|string|max:500',
            'size_guide'       => 'nullable|string',
            'gender'           => 'nullable|string|max:100',
        ]);

        $validated['image'] = $this->saveBase64Image($validated['image'] ?? null, 'prod_main');
        $validated['hover_image'] = $this->saveBase64Image($validated['hover_image'] ?? null, 'prod_hover');
        $validated['size_guide'] = $this->saveBase64Image($validated['size_guide'] ?? null, 'size_guide');

        if (isset($validated['images']) && is_array($validated['images'])) {
            $savedImages = [];
            foreach ($validated['images'] as $img) {
                $savedImages[] = $this->saveBase64Image($img, 'prod_extra');
            }
            $validated['images'] = $savedImages;
        }

        // Auto-generate a unique product ID like OKJ-001234
        $validated['id'] = 'OKJ' . strtoupper(Str::random(2)) . rand(10000, 99999);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $product = Product::create($validated);

        if ($request->has('variants') && is_array($request->variants)) {
            foreach ($request->variants as $index => $v) {
                $variant = $product->variants()->create([
                    'id'            => $v['id'] ?? ('v-' . Str::random(8)),
                    'color_name'    => $v['color'] ?? 'Unnamed',
                    'color_hex'     => $v['hex'] ?? '#000000',
                    'price'         => $v['price'] ?? $product->price,
                    'stock'         => $v['stock'] ?? 0,
                    'sku'           => $v['sku'] ?? ($product->id . '-' . strtoupper(Str::random(4))),
                    'status'        => $v['status'] ?? 'available',
                    'display_order' => $v['display_order'] ?? $index,
                    'sizes'         => $v['sizes'] ?? null,
                ]);

                if (isset($v['images']) && is_array($v['images'])) {
                    foreach ($v['images'] as $imgIdx => $imgUrl) {
                        $savedUrl = $this->saveBase64Image($imgUrl, 'variant');
                        $variant->getImagesRelation()->create([
                            'image_url'  => $savedUrl,
                            'sort_order' => $imgIdx,
                        ]);
                    }
                }
            }
        }

        return response()->json($product->fresh(), 201);
    }

    // ─── Admin: update product ────────────────────────────────────────────────

    public function update(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);

            $validated = $request->validate([
                'name'             => 'sometimes|required|string|max:255',
                'tagline'          => 'nullable|string|max:500',
                'price'            => 'sometimes|required|numeric|min:0',
                'discountPrice'    => 'nullable|numeric|min:0',
                'category'         => 'sometimes|required|string|max:100',
                'image'            => 'nullable|string',
                'hover_image'      => 'nullable|string',
                'stock'            => 'nullable|integer|min:0',
                'badge'            => 'nullable|string|max:50',
                'description'      => 'nullable|string',
                'details'          => 'nullable|array',
                'materials'        => 'nullable|string',
                'shipping'         => 'nullable|string',
                'sizes'            => 'nullable|array',
                'images'           => 'nullable|array',
                'is_active'        => 'nullable|boolean',
                'slug'             => 'nullable|string|max:255',
                'meta_title'       => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:1000',
                'meta_keywords'    => 'nullable|string|max:500',
                'size_guide'       => 'nullable|string',
                'gender'           => 'nullable|string|max:100',
            ]);

            if (array_key_exists('image', $validated)) {
                $validated['image'] = $this->saveBase64Image($validated['image'], 'prod_main');
            }
            if (array_key_exists('hover_image', $validated)) {
                $validated['hover_image'] = $this->saveBase64Image($validated['hover_image'], 'prod_hover');
            }
            if (array_key_exists('size_guide', $validated)) {
                $validated['size_guide'] = $this->saveBase64Image($validated['size_guide'], 'size_guide');
            }
            if (isset($validated['images']) && is_array($validated['images'])) {
                $savedImages = [];
                foreach ($validated['images'] as $img) {
                    $savedImages[] = $this->saveBase64Image($img, 'prod_extra');
                }
                $validated['images'] = $savedImages;
            }

            $product->update($validated);

            if ($request->has('variants') && is_array($request->variants)) {
                // Delete existing variants (cascades to variant_images)
                $product->variants()->delete();

                foreach ($request->variants as $index => $v) {
                    $variant = $product->variants()->create([
                        'id'            => $v['id'] ?? ('v-' . Str::random(8)),
                        'color_name'    => $v['color'] ?? 'Unnamed',
                        'color_hex'     => $v['hex'] ?? '#000000',
                        'price'         => $v['price'] ?? $product->price,
                        'stock'         => $v['stock'] ?? 0,
                        'sku'           => $v['sku'] ?? ($product->id . '-' . strtoupper(Str::random(4))),
                        'status'        => $v['status'] ?? 'available',
                        'display_order' => $v['display_order'] ?? $index,
                        'sizes'         => $v['sizes'] ?? null,
                    ]);

                    if (isset($v['images']) && is_array($v['images'])) {
                        foreach ($v['images'] as $imgIdx => $imgUrl) {
                            $savedUrl = $this->saveBase64Image($imgUrl, 'variant');
                            $variant->getImagesRelation()->create([
                                'image_url'  => $savedUrl,
                                'sort_order' => $imgIdx,
                            ]);
                        }
                    }
                }
            }

            return response()->json($product->fresh());
        } catch (\Illuminate\Validation\ValidationException $e) {
            file_put_contents(storage_path('logs/product_update_debug.json'), json_encode([
                'type' => 'validation',
                'errors' => $e->errors(),
                'payload' => $request->all(),
            ], JSON_PRETTY_PRINT));
            throw $e;
        } catch (\Throwable $e) {
            file_put_contents(storage_path('logs/product_update_debug.json'), json_encode([
                'type' => 'exception',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all(),
            ], JSON_PRETTY_PRINT));
            throw $e;
        }
    }

    // ─── Admin: toggle active/inactive ───────────────────────────────────────

    public function toggleActive($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => ! $product->is_active]);

        return response()->json([
            'message'   => 'Product ' . ($product->is_active ? 'activated' : 'deactivated') . '.',
            'is_active' => $product->is_active,
            'product'   => $product,
        ]);
    }

    // ─── Admin: delete product ────────────────────────────────────────────────

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    private function saveBase64Image($base64String, $prefix = 'product')
    {
        if (empty($base64String) || !is_string($base64String)) {
            return $base64String;
        }

        // Check if it's a valid data URI base64 image
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
            // Take the part after the comma
            $data = substr($base64String, strpos($base64String, ',') + 1);
            // Decode the base64 string
            $data = base64_decode($data);

            if ($data === false) {
                return $base64String; // Return original if decoding fails
            }

            // Get extension (jpeg, png, gif, webp, etc.)
            $ext = strtolower($type[1]); // jpg, png, etc.
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])) {
                $ext = 'png'; // default fallback
            }

            // Define the directory path: public/images/products
            $dirPath = public_path('images/products');
            if (!file_exists($dirPath)) {
                mkdir($dirPath, 0755, true);
            }

            // Try to convert to WebP using GD library if available and not SVG
            if (function_exists('imagecreatefromstring') && function_exists('imagewebp') && $ext !== 'svg') {
                try {
                    $im = @imagecreatefromstring($data);
                    if ($im !== false) {
                        $fileName = $prefix . '_' . uniqid() . '.webp';
                        $filePath = $dirPath . '/' . $fileName;
                        if (@imagewebp($im, $filePath, 80)) {
                            unset($im);
                            return '/images/products/' . $fileName;
                        }
                        unset($im);
                    }
                } catch (\Throwable $t) {
                    // Fall back to original saving on failure
                }
            }

            // Fallback: Save original format
            $fileName = $prefix . '_' . uniqid() . '.' . $ext;
            $filePath = $dirPath . '/' . $fileName;
            file_put_contents($filePath, $data);

            // Return the relative path to be stored in the DB
            return '/images/products/' . $fileName;
        }

        return $base64String; // Return original if not base64
    }
}
