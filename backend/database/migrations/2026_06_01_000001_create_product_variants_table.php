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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->string('id')->primary(); // Hash or unique string identifier
            $table->string('product_id');
            $table->string('color_name');
            $table->string('color_hex');
            $table->integer('price');
            $table->integer('stock')->default(0);
            $table->string('sku')->unique();
            $table->string('status')->default('available'); // available, out_of_stock, hidden
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->foreign('product_id')
                  ->references('id')
                  ->on('products')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
