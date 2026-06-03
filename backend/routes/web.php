<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/{any}', function (Request $request) {
    $path = public_path('build/index.html');
    if (!file_exists($path)) {
        return view('welcome');
    }
    
    $html = file_get_contents($path);
    
    if ($request->has('product')) {
        $productId = $request->query('product');
        $product = Product::find($productId);
        
        if ($product) {
            $name = e($product->name);
            $tagline = e($product->tagline ?: $product->name);
            $desc = e(Str::limit(strip_tags($product->description), 150));
            
            $image = $product->image;
            if ($image && !Str::startsWith($image, ['http://', 'https://'])) {
                // If running in development or relative path, construct absolute URL
                $image = url($image);
            }
            
            // Replace generic title
            $html = preg_replace('/<title>.*?<\/title>/i', "<title>{$name} | Off-Kilt</title>", $html);
            
            // Inject OG/Twitter meta tags
            $meta = "
    <!-- Product Dynamic Meta Tags -->
    <meta name=\"description\" content=\"{$desc}\" />
    <meta property=\"og:title\" content=\"{$name} — {$tagline}\" />
    <meta property=\"og:description\" content=\"{$desc}\" />
    <meta property=\"og:image\" content=\"{$image}\" />
    <meta property=\"og:url\" content=\"" . e($request->fullUrl()) . "\" />
    <meta property=\"og:type\" content=\"product\" />
    <meta name=\"twitter:card\" content=\"summary_large_image\" />
    <meta name=\"twitter:title\" content=\"{$name} — {$tagline}\" />
    <meta name=\"twitter:description\" content=\"{$desc}\" />
    <meta name=\"twitter:image\" content=\"{$image}\" />
            ";
            
            $html = str_replace('<head>', "<head>{$meta}", $html);
        }
    }
    
    return response($html);
})->where('any', '.*');
