import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Book, Layers, AlertCircle, Edit2, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { SearchableSelect } from '../CustomInputs'; 
import { ENDPOINTS } from '../../services/Config';

const InputGroup = ({ label, value, onChange, placeholder = "", type = "text", readOnly = false }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block ml-1">{label}</label>
    <input
      type={type} value={value} onChange={e => !readOnly && onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
      className={`w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm transition-all outline-none 
        ${readOnly ? 'bg-gray-100 text-gray-600 font-medium cursor-not-allowed' : 'bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}`}
    />
  </div>
);

// --- ADD / UPDATE BOOK MODAL ---
export const AddBookModal = ({ isOpen, onClose, onSuccess, categories, bookData = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!bookData;

  const [formData, setFormData] = useState({
    title: '', category_id: '', author: '', copyright: '', publisher: '', 
    isbn: '', acc_no: '', edition: '', copies: 1, pages: '', 
    subject: '', keyword: '', section: '', call_number: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (bookData) setFormData({ ...bookData });
      else setFormData({
        title: '', category_id: '', author: '', copyright: '', publisher: '', 
        isbn: '', acc_no: '', edition: '', copies: 1, pages: '', 
        subject: '', keyword: '', section: '', call_number: ''
      });
    }
  }, [isOpen, bookData]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const url = isEditing ? `${ENDPOINTS.BOOKS}/${bookData.id}` : ENDPOINTS.BOOKS;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(formData)
      });
      if (res.ok) { 
        onSuccess(isEditing ? "Book updated successfully!" : "New book added to catalog!");
        onClose(); 
      }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 bg-[#0e1048] border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Book className="w-5 h-5"/> {isEditing ? 'Update Book' : 'Add New Book'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="h-5 w-5 text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2"><InputGroup label="Book Title" value={formData.title} onChange={v => handleChange('title', v)} /></div>
                <div><SearchableSelect label="Category" options={categories.map(c => ({ label: c.name, value: c.id }))} value={formData.category_id} onChange={v => handleChange('category_id', v)} placeholder="Select Category..." /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                <InputGroup label="Author" value={formData.author} onChange={v => handleChange('author', v)} />
                <InputGroup label="Publisher" value={formData.publisher} onChange={v => handleChange('publisher', v)} />
                <InputGroup label="Copyright Year" value={formData.copyright} onChange={v => handleChange('copyright', v)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                <InputGroup label="ISBN" value={formData.isbn} onChange={v => handleChange('isbn', v)} />
                <InputGroup label="Accession No." value={formData.acc_no} onChange={v => handleChange('acc_no', v)} />
                <InputGroup label="Call Number" value={formData.call_number} onChange={v => handleChange('call_number', v)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                <InputGroup label="Edition" value={formData.edition} onChange={v => handleChange('edition', v)} />
                <InputGroup type="number" label="No. of Copies" value={formData.copies} onChange={v => handleChange('copies', v)} />
                <InputGroup type="number" label="No. of Pages" value={formData.pages} onChange={v => handleChange('pages', v)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                <InputGroup label="Subject" value={formData.subject} onChange={v => handleChange('subject', v)} />
                <InputGroup label="Keywords" value={formData.keyword} onChange={v => handleChange('keyword', v)} placeholder="Comma separated" />
                <InputGroup label="Section" value={formData.section} onChange={v => handleChange('section', v)} />
            </div>
          </div>
        </div>
        <div className="bg-white border-t p-4 flex justify-end gap-3 shrink-0 shadow-lg">
            <Button variant="outline" onClick={onClose} className="px-6 h-10">Cancel</Button>
            <Button className="bg-[#0e1048] hover:bg-blue-900 px-8 h-10" onClick={handleSubmit} disabled={isSubmitting || !formData.title || !formData.category_id}>
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : "Save Profile"}
            </Button>
        </div>
      </motion.div>
    </div>
  );
};

// --- VIEW DETAILS MODAL ---
export const ViewBookModal = ({ isOpen, onClose, book }) => {
  if (!isOpen || !book) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 bg-[#0e1048] flex justify-between items-start text-white shrink-0">
          <div><h2 className="text-2xl font-bold mb-1">{book.title}</h2><p className="text-gray-300 text-sm">{book.author} • {book.category?.name}</p></div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 bg-gray-50 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Accession No." value={book.acc_no || 'N/A'} readOnly />
            <InputGroup label="ISBN" value={book.isbn || 'N/A'} readOnly />
            <InputGroup label="Publisher" value={book.publisher || 'N/A'} readOnly />
            <InputGroup label="Copyright" value={book.copyright || 'N/A'} readOnly />
            <InputGroup label="Call Number" value={book.call_number || 'N/A'} readOnly />
            <InputGroup label="Section" value={book.section || 'N/A'} readOnly />
            <InputGroup label="Edition" value={book.edition || 'N/A'} readOnly />
            <InputGroup label="Copies Available" value={book.copies || '0'} readOnly />
            <InputGroup label="Subject" value={book.subject || 'N/A'} readOnly />
            <InputGroup label="Keywords" value={book.keyword || 'N/A'} readOnly />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- DELETE CONFIRMATION MODAL (UPDATED FOR REUSABILITY) ---
export const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting, 
  title = "Delete Book?", 
  message = "This action permanently removes the book from the catalog and cannot be undone." 
}) => {
  if (!isOpen) return null;
  return (
    // z-[110] ensures it appears above ALL other modals
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertCircle className="w-7 h-7 text-red-600" /></div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11 cursor-pointer">Cancel</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white h-11 cursor-pointer" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="animate-spin" /> : "Delete"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// --- ADD CATEGORY MODAL ---
export const AddCategoryModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { if (isOpen) setName(''); }, [isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(ENDPOINTS.CATEGORIES, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify({ name })
      });
      if (res.ok) { 
        onSuccess("New category successfully added!"); 
        onClose(); 
      }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-emerald-600 text-white">
          <h3 className="font-bold flex items-center gap-2"><Layers className="w-4 h-4"/> Add Category</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 bg-gray-50">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
             <InputGroup label="Category Name" value={name} onChange={setName} placeholder="e.g. Science Fiction" />
          </div>
        </div>
        <div className="p-4 bg-white flex justify-end gap-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit} disabled={!name || isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Category"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MANAGE CATEGORIES MODAL ---
export const ManageCategoriesModal = ({ isOpen, onClose, onSuccess, categories, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  
  // States for Category Deletion
  const [isProcessing, setIsProcessing] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null); // Holds ID of category to delete

  if (!isOpen) return null;

  const handleEditClick = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setCategoryToDelete(null); 
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${ENDPOINTS.CATEGORIES}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: editName })
      });
      if (res.ok) {
        onSuccess("Category updated successfully!");
        setEditingId(null);
        onRefresh();
      }
    } catch (err) { console.error(err); } finally { setIsProcessing(false); }
  };

  const executeDelete = async () => {
    if (!categoryToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${ENDPOINTS.CATEGORIES}/${categoryToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        onSuccess("Category deleted successfully!");
        setCategoryToDelete(null);
        onRefresh();
      }
    } catch (err) { console.error(err); } finally { setIsProcessing(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-5 border-b flex justify-between items-center bg-[#0e1048] text-white shrink-0">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2"><Layers className="w-5 h-5"/> Manage Categories</h3>
              <p className="text-xs text-gray-300 mt-1">Edit or remove existing categories</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X className="h-5 w-5" /></button>
          </div>
          
          <div className="p-6 bg-gray-50 overflow-y-auto flex-1">
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  
                  {/* Editing View */}
                  {editingId === cat.id ? (
                    <div className="flex-1 flex gap-2 mr-2">
                      <input 
                        type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-blue-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" autoFocus
                      />
                      <Button size="sm" onClick={() => handleSaveEdit(cat.id)} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 h-auto py-1 px-3">
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check className="w-4 h-4 text-white" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={isProcessing} className="h-auto py-1 px-3 text-gray-600 hover:bg-gray-100">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Standard View */}
                      <span className="font-bold text-gray-700 text-sm pl-2">{cat.name}</span>
                      <div className="flex gap-1.5">
                        <Button onClick={() => handleEditClick(cat)} variant="ghost" size="sm" className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md p-2 h-auto">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setCategoryToDelete(cat.id)} variant="ghost" size="sm" className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-md p-2 h-auto" disabled={isProcessing}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No categories found.</div>}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Render the identical Delete Confirmation Modal overlaid on top when a category is selected for deletion */}
      <DeleteConfirmationModal 
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={executeDelete}
        isDeleting={isProcessing}
        title="Delete Category?"
        message="This will permanently delete this category and ALL books associated with it. This action cannot be undone."
      />
    </>
  );
};