<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'phone' => 'required|string',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|string',
            'items' => 'required|array',
            'subtotal' => 'required|numeric',
            'shipping_fee' => 'required|numeric',
            'total' => 'required|numeric',
        ]);

        $orderId = 'OK-' . rand(100000, 999999);

        $order = Order::create([
            'id' => $orderId,
            'user_id' => $request->user()?->id,
            'email' => $request->email,
            'phone' => $request->phone,
            'shipping_address' => $request->shipping_address,
            'payment_method' => $request->payment_method,
            'subtotal' => $request->subtotal,
            'shipping_fee' => $request->shipping_fee,
            'total' => $request->total,
            'status' => 'confirmed',
            'payment_verified' => true,
            'placed_at' => now(),
        ]);

        foreach ($request->items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['id'],
                'product_name' => $item['name'],
                'selected_size' => $item['selectedSize'],
                'price' => $item['price'],
                'quantity' => $item['quantity'],
                'image_path' => $item['image'],
            ]);
        }

        return response()->json($order->load('items'));
    }

    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)->with('items')->orderBy('placed_at', 'desc')->get();
        return response()->json($orders);
    }

    public function show($id, Request $request)
    {
        $order = Order::where('id', $id)->where('user_id', $request->user()->id)->with('items')->firstOrFail();
        return response()->json($order);
    }

    public function track($id)
    {
        $order = Order::where('id', $id)->with('items')->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        return response()->json($order);
    }
}
