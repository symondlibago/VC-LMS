<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BorrowingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::options('{any}', function () {
    return response()->json([], 200);
})->where('any', '.*');

// Public routes
Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"]);
Route::post("/reset-password-pin", [AuthController::class, "resetPasswordWithPin"]);

// Protected Auth routes
Route::middleware("auth:sanctum")->group(function () {
    Route::get("/user", [AuthController::class, "user"]);
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::post("/settings/update", [AuthController::class, "updateSettings"]);
});

// Library Routes
Route::middleware("api")->group(function () {
    Route::apiResource("categories", CategoryController::class);
    Route::apiResource("books", BookController::class);
    Route::apiResource("borrowings", App\Http\Controllers\BorrowingController::class);
    Route::patch("borrowings/{id}/return", [App\Http\Controllers\BorrowingController::class, 'markAsReturned']);
});