<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    // ─── Get authenticated user's profile ────────────────────────────────────

    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    // ─── Update profile ───────────────────────────────────────────────────────

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'email'         => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'phone'         => 'nullable|string|max:20',
            'address'       => 'nullable|string',
            'pincode'       => 'nullable|string|max:20',
            'profile_image' => 'nullable|string', // base64 or URL
        ]);

        $user->update($request->only([
            'name',
            'email',
            'phone',
            'address',
            'pincode',
            'profile_image',
        ]));

        return response()->json($user->fresh());
    }
}
