import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Search, CheckCircle, AlertCircle, BookmarkPlus, ArrowDownToLine, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { BorrowBookModal } from '../modals/BorrowModals';
import { ENDPOINTS } from '../../services/Config';

export default function Borrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingId, setIsProcessingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [borrowRes, booksRes] = await Promise.all([ fetch(ENDPOINTS.BORROWINGS), fetch(ENDPOINTS.BOOKS) ]);
      const borrowData = await borrowRes.json();
      const booksData = await booksRes.json();
      if (borrowData.success) setBorrowings(borrowData.data);
      if (booksData.success) setBooks(booksData.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const showAlert = (message, type = 'success') => { setAlert({ message, type }); setTimeout(() => setAlert(null), 3000); };
  const handleSuccess = (message) => { fetchData(); showAlert(message); };

  const handleReturnBook = async (id) => {
    setIsProcessingId(id);
    try {
      const res = await fetch(`${ENDPOINTS.BORROWINGS}/${id}/return`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
      if (res.ok) { fetchData(); showAlert("Book successfully marked as returned!"); }
    } catch (err) { showAlert("Failed to return book.", "error"); } finally { setIsProcessingId(null); }
  };

  const activeBorrowings = useMemo(() => {
    // Only keep ACTIVE borrowings (Not Returned)
    let filtered = borrowings.filter(r => r.status === 'Borrowed');
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.student_name || '').toLowerCase().includes(term) || 
        (r.student_id_number || '').toLowerCase().includes(term) ||
        (r.book?.title || '').toLowerCase().includes(term)
      );
    }
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [borrowings, searchTerm]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to check if due date has passed
  const isOverdue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    const due = new Date(dueDate);
    return today > due;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6 relative">
      <AnimatePresence>
        {alert && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className={`fixed top-8 left-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-3 ${alert.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />} {alert.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Active Borrowings</h1>
           <p className="text-gray-500 mt-1">Books currently in possession of students.</p>
        </div>
        <Button onClick={() => setIsBorrowModalOpen(true)} className="bg-[#991b1b] hover:bg-[#7f1d1d] text-white h-11 rounded-xl px-6">
          <BookmarkPlus className="mr-2 h-4 w-4" /> Issue Book
        </Button>
      </div>

      <div className="w-full md:w-1/2 space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Search Records</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm outline-none focus:border-[#991b1b]" placeholder="Search Student Name, ID, or Book Title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
      </div>

      <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-[#7f1d1d] h-8 w-8" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#7f1d1d] text-white">
                  <tr>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Student</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Book Details</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Date Borrowed</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Due Date</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {activeBorrowings.map(record => {
                    const overdue = isOverdue(record.due_date);
                    return (
                    <tr key={record.id} className={`hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50/30' : ''}`}>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{record.student_name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{record.student_id_number} • {record.course}</div>
                      </td>
                      <td className="p-4">
                         <div className="font-bold text-[#7f1d1d] whitespace-normal break-words max-w-[300px]">{record.book?.title || 'Unknown Book'}</div>
                         <div className="text-xs text-gray-500 mt-0.5">Acc No: {record.book?.acc_no || 'N/A'}</div>
                      </td>
                      <td className="p-4 font-medium text-gray-600">{formatDate(record.borrowed_at)}</td>
                      <td className="p-4 relative">
                        <span className={`font-bold ${overdue ? 'text-red-600' : 'text-gray-900'}`}>{formatDate(record.due_date)}</span>
                        
                        {/* THE MOVING EXCLAMATION MARK FOR OVERDUE */}
                        {overdue && (
                           <motion.div 
                              animate={{ y: [0, -5, 0] }} 
                              transition={{ repeat: Infinity, duration: 1 }} 
                              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-red-500"
                              title="OVERDUE!"
                           >
                             <AlertCircle className="w-5 h-5 fill-red-100" />
                           </motion.div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                         <Button onClick={() => handleReturnBook(record.id)} disabled={isProcessingId === record.id} size="sm" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 shadow-none font-bold rounded-lg h-9 w-full">
                           {isProcessingId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowDownToLine className="h-4 w-4 mr-2"/> Mark Returned</>}
                         </Button>
                      </td>
                    </tr>
                  )})}
                  {activeBorrowings.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500 text-sm font-medium">No active borrowings right now.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <BorrowBookModal isOpen={isBorrowModalOpen} onClose={() => setIsBorrowModalOpen(false)} onSuccess={handleSuccess} books={books} />
    </div>
  );
}