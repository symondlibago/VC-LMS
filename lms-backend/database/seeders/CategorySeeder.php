<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance',
            'Historical Fiction', 'Horror', 'Biography', 'Self-Help', 'Business',
            'Philosophy', 'Science', 'Technology', 'Art & Photography', 'Children'
        ];

        foreach ($categories as $category) {
            Category::create(['name' => $category]);
        }
    }
}