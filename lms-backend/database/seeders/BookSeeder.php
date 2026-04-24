<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Book;
use App\Models\Category;
use Faker\Factory as Faker;

class BookSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $categories = Category::pluck('id')->toArray();

        if (empty($categories)) return; // Ensure categories exist

        for ($i = 0; $i < 50; $i++) {
            Book::create([
                'category_id' => $faker->randomElement($categories),
                'title' => ucwords($faker->catchPhrase),
                'author' => $faker->name,
                'copyright' => $faker->year,
                'publisher' => $faker->company,
                'isbn' => $faker->isbn13,
                'acc_no' => 'ACC-' . $faker->unique()->numerify('#####'),
                'edition' => $faker->randomElement(['1st', '2nd', '3rd', 'Revised']),
                'copies' => $faker->numberBetween(1, 10),
                'pages' => $faker->numberBetween(100, 800),
                'subject' => $faker->word,
                'keyword' => $faker->words(3, true),
                'section' => $faker->randomElement(['A1', 'B2', 'C3', 'D4']),
                'call_number' => $faker->bothify('???-###'),
            ]);
        }
    }
}