<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BorrowingController extends Controller
{
    public function index() {
        return response()->json([
            'success' => true, 
            'data' => Borrowing::with('book.category')->latest()->get()
        ]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'student_id_number' => 'required|string',
            'student_name' => 'required|string',
            'course' => 'required|string',
            'borrowed_at' => 'required|date',
            'due_date' => 'required|date|after_or_equal:borrowed_at', // <-- NEW VALIDATION
        ]);

        try {
            DB::beginTransaction();

            $book = Book::findOrFail($request->book_id);
            
            if ($book->copies <= 0) {
                return response()->json(['success' => false, 'message' => 'No copies available for this book.'], 400);
            }

            $borrowing = Borrowing::create(array_merge($validated, ['status' => 'Borrowed']));
            
            $book->decrement('copies');

            DB::commit();
            return response()->json(['success' => true, 'data' => $borrowing], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function markAsReturned($id) {
        try {
            DB::beginTransaction();

            $borrowing = Borrowing::findOrFail($id);
            
            if ($borrowing->status === 'Returned') {
                return response()->json(['success' => false, 'message' => 'Book already returned.'], 400);
            }

            $borrowing->update([
                'status' => 'Returned',
                'returned_at' => now()
            ]);

            Book::findOrFail($borrowing->book_id)->increment('copies');

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Book marked as returned.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}