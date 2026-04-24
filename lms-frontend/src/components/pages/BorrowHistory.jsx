import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Search, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { ENDPOINTS } from '../../services/Config';

export default function BorrowHistory() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.BORROWINGS);
      const data = await res.json();
      if (data.success) setBorrowings(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const historyRecords = useMemo(() => {
    // Only keep RETURNED borrowings
    let filtered = borrowings.filter(r => r.status === 'Returned');
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.student_name || '').toLowerCase().includes(term) || 
        (r.student_id_number || '').toLowerCase().includes(term) ||
        (r.book?.title || '').toLowerCase().includes(term)
      );
    }
    // Sort by most recently returned
    return filtered.sort((a, b) => new Date(b.returned_at) - new Date(a.returned_at));
  }, [borrowings, searchTerm]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
               <History className="w-8 h-8 text-gray-400" /> Borrow History
           </h1>
           <p className="text-gray-500 mt-1">Log of all successfully returned books.</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Search History</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Search Student Name, ID, or Book Title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
      </div>

      <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-gray-400 h-8 w-8" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-100 text-gray-600 border-b">
                  <tr>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Student</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Book Details</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Date Borrowed</th>
                    <th className="p-4 text-[11px] font-bold uppercase tracking-wider">Date Returned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {historyRecords.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 align-top">
                        <div className="font-bold text-gray-900">{record.student_name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{record.student_id_number} • {record.course}</div>
                      </td>
                      {/* Changed this TD to allow text wrapping for long book titles */}
                      <td className="p-4 align-top whitespace-normal break-words max-w-[300px]">
                         <div className="font-bold text-gray-700">{record.book?.title || 'Unknown Book'}</div>
                         <div className="text-xs text-gray-500 mt-0.5">Acc No: {record.book?.acc_no || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-500 align-top">{formatDate(record.borrowed_at)}</td>
                      <td className="p-4 text-sm font-bold text-emerald-600 align-top">
                        {formatDate(record.returned_at)}
                      </td>
                    </tr>
                  ))}
                  {historyRecords.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500 text-sm font-medium">No returned history found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}