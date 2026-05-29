<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // ─── Dashboard stats ──────────────────────────────────────────────────────

    public function dashboard()
    {
        return response()->json([
            'total_products'        => Product::count(),
            'active_products'       => Product::where('is_active', true)->count(),
            'inactive_products'     => Product::where('is_active', false)->count(),
            'total_orders'          => Order::count(),
            'confirmed_orders'      => Order::where('status', 'confirmed')->count(),
            'production_orders'     => Order::where('status', 'production')->count(),
            'dispatched_orders'     => Order::where('status', 'dispatched')->count(),
            'transit_orders'        => Order::where('status', 'transit')->count(),
            'delivered_orders'      => Order::where('status', 'delivered')->count(),
            'total_revenue'         => Order::sum('total'),
            'total_users'           => User::count(),
        ]);
    }
}
