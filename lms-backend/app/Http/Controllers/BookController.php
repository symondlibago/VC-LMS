<?php

namespace App\Http\Controllers;
use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index() {
        // Eager load category for the frontend
        return response()->json(['success' => true, 'data' => Book::with('category')->latest()->get()]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string',
            'author' => 'required|string',
            'copyright' => 'nullable|string',
            'publisher' => 'nullable|string',
            'isbn' => 'nullable|string',
            'acc_no' => 'nullable|string',
            'edition' => 'nullable|string',
            'copies' => 'required|integer',
            'pages' => 'nullable|integer',
            'subject' => 'nullable|string',
            'keyword' => 'nullable|string',
            'section' => 'nullable|string',
            'call_number' => 'nullable|string',
        ]);

        $book = Book::create($validated);
        return response()->json(['success' => true, 'data' => $book]);
    }

    public function update(Request $request, $id) {
        $book = Book::findOrFail($id);
        $book->update($request->all());
        return response()->json(['success' => true, 'data' => $book]);
    }

    public function destroy($id) {
        Book::destroy($id);
        return response()->json(['success' => true]);
    }
}