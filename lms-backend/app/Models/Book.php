<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Book extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['cover_image_url'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        if (!$this->cover_image) {
            return null;
        }
        return asset('storage/' . $this->cover_image);
    }
}