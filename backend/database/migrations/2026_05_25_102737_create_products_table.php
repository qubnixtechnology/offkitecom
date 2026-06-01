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
        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g., OKJ24201
            $table->string('name');
            $table->string('category');
            $table->integer('price');
            $table->string('tagline');
            $table->text('description');
            $table->json('details')->nullable();
            $table->json('sizes')->nullable();
            $table->string('materials')->nullable();
            $table->string('shipping')->nullable();
            $table->string('image');
            $table->string('hover_image')->nullable();
            $table->json('images')->nullable();
            $table->string('badge')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('slug')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
