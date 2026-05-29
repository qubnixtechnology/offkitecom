<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ─── Public Auth Routes ──────────────────────────────────────────────────────
Route::post('/register',       [AuthController::class, 'register']);
Route::post('/login',          [AuthController::class, 'login']);
Route::post('/forgot-password',[AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// ─── Public Product Routes ───────────────────────────────────────────────────
Route::get('/products',       [ProductController::class, 'index']);
Route::get('/products/{id}',  [ProductController::class, 'show']);

// ─── Public Order Tracking ───────────────────────────────────────────────────
Route::get('/orders/track/{id}', [OrderController::class, 'track']);

// ─── Protected Routes (any authenticated user) ───────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Profile
    Route::get('/profile',  [ProfileController::class, 'show']);
    Route::put('/profile',  [ProfileController::class, 'update']);

    // Orders
    Route::post('/orders',        [OrderController::class, 'create']);
    Route::get('/orders',         [OrderController::class, 'index']);
    Route::get('/orders/{id}',    [OrderController::class, 'show']);
});

// ─── Admin Routes (authenticated + is_admin) ─────────────────────────────────
Route::middleware(['auth:sanctum', 'is_admin'])->prefix('admin')->group(function () {

    // Dashboard
    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    // Products
    Route::get('/products',                  [ProductController::class, 'adminIndex']);
    Route::post('/products',                 [ProductController::class, 'store']);
    Route::put('/products/{id}',             [ProductController::class, 'update']);
    Route::patch('/products/{id}/toggle',    [ProductController::class, 'toggleActive']);
    Route::delete('/products/{id}',          [ProductController::class, 'destroy']);

    // Orders
    Route::get('/orders',                    [OrderController::class, 'adminIndex']);
    Route::patch('/orders/{id}/status',      [OrderController::class, 'updateStatus']);
    Route::delete('/orders/{id}',            [OrderController::class, 'destroy']);
});
