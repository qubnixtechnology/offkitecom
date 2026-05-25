<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'string|max:255',
            'phone' => 'string|max:255',
            'address' => 'string',
            'pincode' => 'string|max:20',
        ]);

        $user = $request->user();
        $user->update($request->only(['name', 'phone', 'address', 'pincode']));

        return response()->json($user);
    }
}
