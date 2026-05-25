<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary(); // OK-123456
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email');
            $table->string('phone');
            $table->text('shipping_address');
            $table->string('payment_method');
            $table->integer('subtotal');
            $table->integer('shipping_fee');
            $table->integer('total');
            $table->enum('status', ['confirmed', 'production', 'dispatched', 'transit', 'delivered'])->default('confirmed');
            $table->boolean('payment_verified')->default(false);
            $table->timestamp('placed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
