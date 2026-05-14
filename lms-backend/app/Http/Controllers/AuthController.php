<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\ForgotPasswordOtpMail;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|in:admin,designer,user',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token
        ], 201);
    }

   public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
            'second_password' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation errors'], 422);
        }

        // Step 1: Check standard email and password
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // Step 2: If they have a 2nd password set, and didn't provide it yet, ask for it
        if ($user->second_password && !$request->has('second_password')) {
            return response()->json([
                'success' => true, 
                'requires_second_password' => true,
                'message' => 'Please enter your 6-digit 2nd password.'
            ], 200);
        }

        // Step 3: Verify the 2nd password if it was provided
        if ($user->second_password && $request->has('second_password')) {
            if (!Hash::check($request->second_password, $user->second_password)) {
                return response()->json(['success' => false, 'message' => 'Invalid 2nd password'], 401);
            }
        }

        // Success! Issue Token
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ], 200);
    }

    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ], 200);
    }

   public function sendResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        // Generate a 6-digit random code
        $code = rand(100000, 999999);

        // Store the code in Laravel's cache for 15 minutes
        Cache::put('reset_code_' . $request->email, $code, now()->addMinutes(15));

        // Use YOUR custom Mailable class instead of Mail::raw
        Mail::to($request->email)->send(new ForgotPasswordOtpMail($code));

        return response()->json([
            'success' => true,
            'message' => 'Reset code sent to your email.'
        ]);
    }

    public function resetPasswordWithPin(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'second_password' => 'required|string',
            'new_password' => 'required|string|min:8'
        ]);

        $user = User::where('email', $request->email)->first();

        // Check if user has a 2nd password set, and if it matches
        if (!$user->second_password || !Hash::check($request->second_password, $user->second_password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or 2nd password.'
            ], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['success' => true, 'message' => 'Password successfully updated. You can now login.']);
    }

    public function updateSettings(Request $request)
    {
        $user = $request->user();

        // 1. Initial 2nd Password Setup (if they don't have one yet)
        if ($request->has('setup_second_password')) {
            $request->validate(['setup_second_password' => 'required|string|size:6']);
            $user->second_password = Hash::make($request->setup_second_password);
            $user->save();
            return response()->json(['success' => true, 'message' => '2nd password configured successfully.', 'user' => $user]);
        }

        // 2. Normal Settings Update (Name, Passwords)
        $request->validate([
            'name' => 'nullable|string|max:255',
            'current_password' => 'required|string',
            'current_second_password' => 'required|string',
            'new_password' => 'nullable|string|min:8',
            'new_second_password' => 'nullable|string|size:6',
        ]);

        // Verify both current passwords before allowing any changes
        if (!Hash::check($request->current_password, $user->password) || !Hash::check($request->current_second_password, $user->second_password)) {
            return response()->json(['success' => false, 'message' => 'Authentication failed. Please check your current passwords.'], 403);
        }

        // Apply changes
        if ($request->filled('name')) $user->name = $request->name;
        if ($request->filled('new_password')) $user->password = Hash::make($request->new_password);
        if ($request->filled('new_second_password')) $user->second_password = Hash::make($request->new_second_password);

        $user->save();
        return response()->json(['success' => true, 'message' => 'Settings updated successfully.', 'user' => $user]);
    }
}

