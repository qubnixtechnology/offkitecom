<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DebugApiRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->is('api/admin/*') || $request->is('api/login') || $request->is('api/admin')) {
            $logData = [
                'timestamp' => date('Y-m-d H:i:s'),
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'user' => $request->user() ? $request->user()->email : 'unauthenticated',
                'request_headers' => $request->headers->all(),
                'request_payload' => $request->all(),
                'response_status' => $response->getStatusCode(),
                'response_body' => json_decode($response->getContent(), true) ?: $response->getContent(),
            ];

            file_put_contents(
                storage_path('logs/admin_api_debug.log'),
                json_encode($logData, JSON_PRETTY_PRINT) . "\n---\n",
                FILE_APPEND
            );
        }

        return $response;
    }
}
