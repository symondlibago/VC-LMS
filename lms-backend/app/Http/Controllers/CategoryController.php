<?php

namespace App\Http\Controllers;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index() {
        return response()->json([
            'success' => true, 
            'data' => Category::latest()->get()
        ]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name'
        ]);

        $category = Category::create($validated);
        
        return response()->json([
            'success' => true, 
            'data' => $category
        ], 201);
    }

    public function update(Request $request, $id) {
        // Notice we ignore the current category's ID for the unique check
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name,' . $id
        ]);

        $category = Category::findOrFail($id);
        $category->update($validated);
        
        return response()->json([
            'success' => true, 
            'data' => $category
        ]);
    }

    public function destroy($id) {
        Category::destroy($id);
        return response()->json(['success' => true]);
    }
}