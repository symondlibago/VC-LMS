<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Borrowing extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'borrowed_at' => 'date',
        'due_date' => 'date',
        'returned_at' => 'date',
    ];

    public function book() {
        return $this->belongsTo(Book::class);
    }
}