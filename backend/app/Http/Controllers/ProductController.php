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

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    // ─── Admin: create product ────────────────────────────────────────────────

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'tagline'          => 'nullable|string|max:500',
            'price'            => 'required|numeric|min:0',
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
        ]);

        // Auto-generate a unique product ID like OKJ-001234
        $validated['id'] = 'OKJ' . strtoupper(Str::random(2)) . rand(10000, 99999);

        // Encode arrays to JSON for storage
        if (isset($validated['details'])) {
            $validated['details'] = json_encode($validated['details']);
        }
        if (isset($validated['sizes'])) {
            $validated['sizes'] = json_encode($validated['sizes']);
        }
        if (isset($validated['images'])) {
            $validated['images'] = json_encode($validated['images']);
        }

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
                ]);

                if (isset($v['images']) && is_array($v['images'])) {
                    foreach ($v['images'] as $imgIdx => $imgUrl) {
                        $variant->getImagesRelation()->create([
                            'image_url'  => $imgUrl,
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
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'             => 'sometimes|required|string|max:255',
            'tagline'          => 'nullable|string|max:500',
            'price'            => 'sometimes|required|numeric|min:0',
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
        ]);

        // Encode arrays for JSON columns
        if (isset($validated['details'])) {
            $validated['details'] = json_encode($validated['details']);
        }
        if (isset($validated['sizes'])) {
            $validated['sizes'] = json_encode($validated['sizes']);
        }
        if (isset($validated['images'])) {
            $validated['images'] = json_encode($validated['images']);
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
                ]);

                if (isset($v['images']) && is_array($v['images'])) {
                    foreach ($v['images'] as $imgIdx => $imgUrl) {
                        $variant->getImagesRelation()->create([
                            'image_url'  => $imgUrl,
                            'sort_order' => $imgIdx,
                        ]);
                    }
                }
            }
        }

        return response()->json($product->fresh());
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
}
