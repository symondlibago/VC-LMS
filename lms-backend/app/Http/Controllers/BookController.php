<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

class BookController extends Controller
{
    private function bookRules(bool $required = true): array
    {
        $req = $required ? 'required|' : 'nullable|';

        return [
            'category_id' => $req . 'exists:categories,id',
            'title'       => $req . 'string|max:255',
            'author'      => $req . 'string|max:255',
            'copyright'   => 'nullable|string|max:20',
            'publisher'   => 'nullable|string|max:255',
            'isbn'        => 'nullable|string|max:30',
            'acc_no'      => 'nullable|string|max:50',
            'edition'     => 'nullable|string|max:50',
            'copies'      => $req . 'integer|min:0',
            'pages'       => 'nullable|integer|min:1',
            'subject'     => 'nullable|string|max:255',
            'keyword'     => 'nullable|string|max:255',
            'section'     => 'nullable|string|max:100',
            'call_number' => 'nullable|string|max:100',
        ];
    }

    private function imageRule(bool $required = false): array
    {
        $rule = File::image()
            ->types(['jpeg', 'png', 'webp', 'avif'])
            ->max(5 * 1024); // 5 120 KB = 5 MB

        return [
            'cover_image' => $required ? ['required', $rule] : ['nullable', $rule],
        ];
    }


    public function index(): JsonResponse
    {
        $books = Book::with('category:id,name')
            ->select([
                'id', 'category_id', 'acc_no', 'title', 'author',
                'cover_image', 'copies', 'isbn', 'subject', 'keyword',
                'section', 'copyright',
            ])
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $books]);
    }

    public function show(int $id): JsonResponse
    {
        $book = Book::with('category:id,name')->findOrFail($id);

        return response()->json(['success' => true, 'data' => $book]);
    }


    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(
            array_merge($this->bookRules(required: true), $this->imageRule(required: false))
        );

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $this->storeCover($request);
        }

        $book = Book::create($validated);

        // Re-fetch with category so the frontend gets a complete object
        $book->load('category:id,name');

        return response()->json(['success' => true, 'data' => $book], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate(
            array_merge($this->bookRules(required: false), $this->imageRule(required: false))
        );

        if ($request->hasFile('cover_image')) {
            $this->deleteOldCover($book);
            $validated['cover_image'] = $this->storeCover($request);
        }

        $book->update($validated);
        $book->load('category:id,name');

        return response()->json(['success' => true, 'data' => $book]);
    }


    public function destroy(int $id): JsonResponse
    {
        $book = Book::findOrFail($id);

        $this->deleteOldCover($book);
        $book->delete();

        return response()->json(['success' => true]);
    }

    private function storeCover(Request $request): string
    {
        return $request->file('cover_image')->store('book-covers', 'public');
    }

    private function deleteOldCover(Book $book): void
    {
        if ($book->cover_image && Storage::disk('public')->exists($book->cover_image)) {
            Storage::disk('public')->delete($book->cover_image);
        }
    }
}