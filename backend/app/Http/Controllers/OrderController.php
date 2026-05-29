<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // ─── Create Order (authenticated OR guest) ────────────────────────────────

    public function create(Request $request)
    {
        $request->validate([
            'email'           => 'required|email',
            'phone'           => 'required|string|max:20',
            'shipping_address'=> 'required|string',
            'payment_method'  => 'required|string',
            'items'           => 'required|array|min:1',
            'items.*.id'      => 'required|string',
            'items.*.name'    => 'required|string',
            'items.*.price'   => 'required|numeric',
            'items.*.quantity'=> 'required|integer|min:1',
            'subtotal'        => 'required|numeric',
            'shipping_fee'    => 'required|numeric',
            'total'           => 'required|numeric',
        ]);

        // Generate unique order ID like OK-123456
        do {
            $orderId = 'OK-' . rand(100000, 999999);
        } while (Order::find($orderId));

        $order = Order::create([
            'id'               => $orderId,
            'user_id'          => $request->user()?->id,
            'email'            => $request->email,
            'phone'            => $request->phone,
            'shipping_address' => $request->shipping_address,
            'payment_method'   => $request->payment_method,
            'subtotal'         => (int) $request->subtotal,
            'shipping_fee'     => (int) $request->shipping_fee,
            'total'            => (int) $request->total,
            'status'           => 'confirmed',
            'payment_verified' => true,
            'placed_at'        => now(),
        ]);

        foreach ($request->items as $item) {
            OrderItem::create([
                'order_id'     => $order->id,
                'product_id'   => $item['id'] ?? null,
                'product_name' => $item['name'],
                'selected_size'=> $item['selectedSize'] ?? $item['selected_size'] ?? 'N/A',
                'price'        => (int) $item['price'],
                'quantity'     => (int) $item['quantity'],
                'image_path'   => $item['image'] ?? $item['image_path'] ?? '',
            ]);
        }

        return response()->json($order->load('items'), 201);
    }

    // ─── List user's own orders ───────────────────────────────────────────────

    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items')
            ->orderBy('placed_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    // ─── Get single user order ────────────────────────────────────────────────

    public function show($id, Request $request)
    {
        $order = Order::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->firstOrFail();

        return response()->json($order);
    }

    // ─── Public: track any order by ID ────────────────────────────────────────

    public function track($id)
    {
        $order = Order::where('id', $id)->with('items')->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        // Return only safe public fields for tracking
        return response()->json([
            'id'               => $order->id,
            'status'           => $order->status,
            'placed_at'        => $order->placed_at,
            'total'            => $order->total,
            'shipping_address' => $order->shipping_address,
            'items'            => $order->items->map(fn($i) => [
                'product_name'  => $i->product_name,
                'selected_size' => $i->selected_size,
                'quantity'      => $i->quantity,
                'price'         => $i->price,
                'image_path'    => $i->image_path,
            ]),
        ]);
    }

    // ─── Admin: list ALL orders ───────────────────────────────────────────────

    public function adminIndex(Request $request)
    {
        $query = Order::with('items', 'user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('id', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        $orders = $query->orderBy('placed_at', 'desc')->get();

        return response()->json($orders);
    }

    // ─── Admin: update order status ───────────────────────────────────────────

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:confirmed,production,dispatched,transit,delivered',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Order status updated.',
            'order'   => $order->load('items'),
        ]);
    }

    // ─── Admin: cancel / delete order ────────────────────────────────────────

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete(); // cascade deletes order_items

        return response()->json(['message' => 'Order deleted successfully.']);
    }
}
