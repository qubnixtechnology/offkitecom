<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::where('is_active', true);
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        return response()->json($query->get());
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:products,id',
            'name' => 'required|string',
            'tagline' => 'nullable|string',
            'price' => 'required|numeric',
            'category' => 'required|string',
            'image' => 'nullable|string',
            'hover_image' => 'nullable|string',
            'badge' => 'nullable|string',
            'description' => 'nullable|string',
            'details' => 'nullable|json',
            'materials' => 'nullable|string',
            'shipping' => 'nullable|string',
            'sizes' => 'nullable|json',
            'images' => 'nullable|json',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'tagline' => 'nullable|string',
            'price' => 'sometimes|required|numeric',
            'category' => 'sometimes|required|string',
            'image' => 'nullable|string',
            'hover_image' => 'nullable|string',
            'badge' => 'nullable|string',
            'description' => 'nullable|string',
            'details' => 'nullable|json',
            'materials' => 'nullable|string',
            'shipping' => 'nullable|string',
            'sizes' => 'nullable|json',
            'images' => 'nullable|json',
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}
