import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { SearchableSelect, CustomDatePicker } from '../CustomInputs'; 
import { ENDPOINTS } from '../../services/Config';

const InputGroup = ({ label, value, onChange, placeholder = "", type = "text" }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block ml-1">{label}</label>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
    />
  </div>
);

export const BorrowBookModal = ({ isOpen, onClose, onSuccess, books }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    student_id_number: '', student_name: '', course: '', book_id: '',
    borrowed_at: '', due_date: ''
  });

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(threeDaysLater.getDate() + 3); // Default 3 days to return

      setFormData({
        student_id_number: '', student_name: '', course: '', book_id: '', 
        borrowed_at: today.toISOString().split('T')[0],
        due_date: threeDaysLater.toISOString().split('T')[0]
      });
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(ENDPOINTS.BORROWINGS, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) { onSuccess("Book successfully borrowed!"); onClose(); } 
      else { alert(data.message || "Failed to borrow book."); }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  const availableBooks = books.filter(b => b.copies > 0).map(b => ({
    label: `${b.title} (Acc No: ${b.acc_no || 'N/A'})`, value: b.id
  }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 bg-[#0e1048] flex justify-between items-center text-white shrink-0">
          <div>
             <h2 className="text-xl font-bold flex items-center gap-2"><BookmarkPlus className="w-5 h-5"/> Issue Book to Student</h2>
             <p className="text-gray-300 text-xs mt-1">Record a new borrowing transaction.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 bg-gray-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block ml-1">Search & Select Book</label>
               <SearchableSelect options={availableBooks} value={formData.book_id} onChange={v => setFormData({...formData, book_id: v})} placeholder="Type to search available books..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
               <InputGroup label="Student ID Number" value={formData.student_id_number} onChange={v => setFormData({...formData, student_id_number: v})} placeholder="e.g. 2021-0001" />
               <InputGroup label="Student Name" value={formData.student_name} onChange={v => setFormData({...formData, student_name: v})} placeholder="Full Name" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
               <InputGroup label="Course & Year" value={formData.course} onChange={v => setFormData({...formData, course: v})} placeholder="e.g. BSIT 3rd Year" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block ml-1">Date Borrowed</label>
                 <CustomDatePicker value={formData.borrowed_at} onChange={v => setFormData({...formData, borrowed_at: v})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider block ml-1">Due Date</label>
                 <CustomDatePicker value={formData.due_date} onChange={v => setFormData({...formData, due_date: v})} />
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-t p-4 flex justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={onClose} className="px-6 h-10">Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-10" onClick={handleSubmit} disabled={isSubmitting || !formData.book_id || !formData.student_name}>
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : "Confirm Issuance"}
            </Button>
        </div>
      </motion.div>
    </div>
  );
};