import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Loader2, Search, Edit2, Trash2, Layers, Eye, CheckCircle, AlertCircle, Settings2, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';

import { 
  AddBookModal, 
  AddCategoryModal, 
  ViewBookModal, 
  DeleteConfirmationModal, 
  ManageCategoriesModal 
} from '../modals/BookModals';
import { SearchableSelect } from '../CustomInputs';
import { ENDPOINTS } from '../../services/Config';

// 20 Distinct Solid Background Colors for Category Badges
const badgeColors = [
  'bg-[#ef4444] text-white', 'bg-[#f97316] text-white', 'bg-[#f59e0b] text-white', 'bg-[#84cc16] text-white',
  'bg-[#22c55e] text-white', 'bg-[#10b981] text-white', 'bg-[#14b8a6] text-white', 'bg-[#06b6d4] text-white',
  'bg-[#0ea5e9] text-white', 'bg-[#3b82f6] text-white', 'bg-[#6366f1] text-white', 'bg-[#8b5cf6] text-white',
  'bg-[#a855f7] text-white', 'bg-[#d946ef] text-white', 'bg-[#ec4899] text-white', 'bg-[#f43f5e] text-white',
  'bg-[#64748b] text-white', 'bg-[#71717a] text-white', 'bg-[#737373] text-white', 'bg-[#78716c] text-white'
];

export default function Books() {
  const [books, setBooks]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [alert, setAlert]           = useState(null);

  // Modal visibility
  const [isBookModalOpen, setIsBookModalOpen]           = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen]   = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen]           = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen]       = useState(false);

  // Action states
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // Filters & pagination
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [visibleCount, setVisibleCount]   = useState(20);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, catRes] = await Promise.all([
        fetch(ENDPOINTS.BOOKS),
        fetch(ENDPOINTS.CATEGORIES)
      ]);
      const [booksData, catData] = await Promise.all([booksRes.json(), catRes.json()]);
      if (booksData.success) setBooks(booksData.data);
      if (catData.success)   setCategories(catData.data);
    } catch (error) {
      console.error(error);
      showAlert('Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Alert helper ───────────────────────────────────────────────────────────

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSuccess = (message) => { fetchData(); showAlert(message); };

  // ── Derived data ───────────────────────────────────────────────────────────

  const categoryOptions = [
    { label: 'All Categories', value: 'All' },
    ...categories.map(c => ({ label: c.name, value: c.id }))
  ];

  const processedBooks = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return books
      .filter(book => {
        const matchesSearch =
          (book.title      || '').toLowerCase().includes(term) ||
          (book.acc_no     || '').toLowerCase().includes(term) ||
          (book.keyword    || '').toLowerCase().includes(term) ||
          (book.subject    || '').toLowerCase().includes(term) ||
          (book.isbn       || '').toLowerCase().includes(term) ||
          (book.copyright  || '').toLowerCase().includes(term) ||
          (book.section    || '').toLowerCase().includes(term);
        const matchesCat = filterCategory === 'All' || book.category_id === filterCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => (a.category?.name || 'Z').localeCompare(b.category?.name || 'Z'));
  }, [books, searchTerm, filterCategory]);

  const displayedBooks = processedBooks.slice(0, visibleCount);
  const hasMore        = visibleCount < processedBooks.length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleOpenAdd    = ()     => { setSelectedBook(null);  setIsBookModalOpen(true); };
  const handleOpenEdit   = (book) => { setSelectedBook(book);  setIsBookModalOpen(true); };
  const handleOpenView   = (book) => { setSelectedBook(book);  setIsViewModalOpen(true); };
  const handleOpenDelete = (book) => { setSelectedBook(book);  setIsDeleteModalOpen(true); };

  const executeDelete = async () => {
    if (!selectedBook) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${ENDPOINTS.BOOKS}/${selectedBook.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        setIsDeleteModalOpen(false);
        showAlert('Book deleted successfully!');
      } else {
        showAlert('Failed to delete book.', 'error');
      }
    } catch (e) {
      console.error(e);
      showAlert('An error occurred.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getBadgeColor = (id) => badgeColors[(id || 0) % badgeColors.length];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen space-y-6 relative">

      {/* Floating Alert */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0,  x: '-50%' }}
            exit={{   opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-8 left-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-3 ${
              alert.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {alert.type === 'success'
              ? <CheckCircle className="w-5 h-5" />
              : <AlertCircle className="w-5 h-5" />}
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Book Catalog</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button onClick={() => setIsManageCategoriesOpen(true)} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black h-11 rounded-xl px-4 cursor-pointer w-full sm:w-auto">
            <Settings2 className="mr-2 h-4 w-4" /> Manage Categories
          </Button>
          <Button onClick={() => setIsCategoryModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-xl px-4 cursor-pointer w-full sm:w-auto">
            <Layers className="mr-2 h-4 w-4" /> Add Category
          </Button>
          <Button onClick={handleOpenAdd} className="bg-[#7f1d1d] hover:bg-[#991b1b] text-white h-11 rounded-xl px-4 cursor-pointer w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Book
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Search Catalog</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#991b1b]/20 focus:border-[#991b1b] transition-all"
              placeholder="Search by Title, Acc No, ISBN, Subject, Keywords, Section, or Copyright..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setVisibleCount(20); }}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Filter Category</label>
          <SearchableSelect
            options={categoryOptions}
            value={filterCategory}
            onChange={(val) => { setFilterCategory(val); setVisibleCount(20); }}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="animate-spin text-[#7f1d1d] h-8 w-8" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-[#7f1d1d] text-white">
                  <tr>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider w-16">Cover</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Acc. No</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Title</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Author</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Category</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-center">Copies</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {displayedBooks.map(book => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">

                      {/* Cover thumbnail */}
                      <td className="p-3">
                        {book.cover_image_url ? (
                          <img
                            src={book.cover_image_url}
                            alt={`Cover of ${book.title}`}
                            className="w-10 h-14 object-cover rounded-md shadow-sm border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-14 flex items-center justify-center bg-gray-100 rounded-md border border-dashed border-gray-300 text-gray-300">
                            <ImageOff className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-mono text-xs font-bold text-gray-600">{book.acc_no || 'N/A'}</td>
                      <td className="p-4 font-bold text-gray-900">{book.title}</td>
                      <td className="p-4 text-sm text-gray-600">{book.author}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(book.category_id)}`}>
                          {book.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-center text-gray-700">{book.copies}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1.5">
                          <Button onClick={() => handleOpenView(book)} variant="ghost" size="sm" className="bg-white text-[#991b1b] hover:bg-[#991b1b] hover:text-white rounded-lg p-2 h-auto cursor-pointer">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleOpenEdit(book)} variant="ghost" size="sm" className="bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg p-2 h-auto cursor-pointer">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleOpenDelete(book)} variant="ghost" size="sm" className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg p-2 h-auto cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayedBooks.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 text-sm font-medium">
                        No books found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {hasMore && (
                <div className="p-4 bg-gray-50 flex justify-center border-t">
                  <Button
                    onClick={() => setVisibleCount(prev => prev + 20)}
                    variant="outline"
                    className="border-[#7f1d1d] text-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white transition-colors cursor-pointer"
                  >
                    Load 20 More Books…
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddBookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={handleSuccess}
        categories={categories}
        bookData={selectedBook}
      />
      <ViewBookModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        book={selectedBook}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        isDeleting={isDeleting}
      />
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={handleSuccess}
      />
      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        onSuccess={handleSuccess}
        categories={categories}
        onRefresh={fetchData}
      />
    </div>
  );
}