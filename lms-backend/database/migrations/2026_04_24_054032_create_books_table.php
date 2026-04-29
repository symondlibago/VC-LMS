<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('author');
            $table->string('cover_image')->nullable(); // Stores relative path: book-covers/filename.webp
            $table->string('copyright')->nullable();
            $table->string('publisher')->nullable();
            $table->string('isbn')->nullable();
            $table->string('acc_no')->nullable();
            $table->string('edition')->nullable();
            $table->integer('copies')->default(1);
            $table->integer('pages')->nullable();
            $table->string('subject')->nullable();
            $table->string('keyword')->nullable();
            $table->string('section')->nullable();
            $table->string('call_number')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};