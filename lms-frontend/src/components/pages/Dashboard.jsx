import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Layers, Library, Clock, Loader2, RefreshCw, Bookmark, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { ENDPOINTS } from '../../services/Config';

function Dashboard() {
  const [stats, setStats] = useState({ books: 0, copies: 0, categories: 0 })
  const [recentBooks, setRecentBooks] = useState([])
  const [recentBorrowings, setRecentBorrowings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [booksRes, catRes, borrowRes] = await Promise.all([ 
        fetch(ENDPOINTS.BOOKS), 
        fetch(ENDPOINTS.CATEGORIES),
        fetch(ENDPOINTS.BORROWINGS)
      ])
      
      const booksData = await booksRes.json()
      const catData = await catRes.json()
      const borrowData = await borrowRes.json()

      const booksList = booksData.data || [];
      const borrowList = borrowData.data || [];
      
      // Calculate total physical copies available
      const totalCopies = booksList.reduce((acc, book) => acc + (parseInt(book.copies) || 0), 0);

      setStats({
        books: booksList.length,
        copies: totalCopies,
        categories: catData.data?.length || 0
      })

      // Get 5 most recently added books
      setRecentBooks(booksList.slice(0, 5));

      // Filter active borrowings and get the 5 most recent
      const activeBorrowings = borrowList.filter(b => b.status === 'Borrowed')
      activeBorrowings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setRecentBorrowings(activeBorrowings.slice(0, 5));

    } catch (error) { 
      console.error('Error fetching dashboard:', error) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchDashboardData() }, [])

  const statsCards = [
    { title: 'Unique Titles', value: stats.books, icon: BookOpen, bgColor: 'bg-[#7f1d1d]' },
    { title: 'Total Copies', value: stats.copies, icon: Library, bgColor: 'bg-emerald-600' },
    { title: 'Categories', value: stats.categories, icon: Layers, bgColor: 'bg-[#991b1b]' },
  ]

  // Helper to calculate due status to perfectly match the copy badge styling
  const getDueDateStatus = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: `Overdue by ${Math.abs(diffDays)}d`, styles: 'bg-red-50 text-red-700', isOverdue: true };
    } else if (diffDays === 0) {
        return { text: 'Due Today', styles: 'bg-amber-50 text-amber-700', isOverdue: false };
    } else {
        return { text: `${diffDays} days left`, styles: 'bg-emerald-50 text-emerald-700', isOverdue: false };
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Library Overview</h1>
          <p className="text-gray-500 mt-2">Manage your catalog and monitor collections.</p>
        </div>
        <Button onClick={fetchDashboardData} disabled={loading} variant="outline" className="border-gray-300 h-10 cursor-pointer hover:bg-gray-100 hover:text-black">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh Data
        </Button>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="bg-white border-none shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.title}</CardTitle>
                  <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-gray-900">
                    {loading ? <Loader2 className="h-8 w-8 animate-spin text-gray-300" /> : stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* 50/50 Split View for Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* Left Column: Recently Added Books */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-none shadow-md h-full">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" /> Recently Added Books
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                  <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-300 h-8 w-8" /></div>
              ) : (
                  <div className="divide-y divide-gray-100">
                    {recentBooks.map((book) => (
                      <div key={book.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col pr-4 overflow-hidden">
                            <span className="font-bold text-gray-900 truncate">{book.title}</span>
                            <span className="text-sm text-gray-500 truncate">{book.author} • {book.category?.name || 'Uncategorized'}</span>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-bold text-gray-400 block mb-1 tracking-wider">ACC: {book.acc_no || 'N/A'}</span>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">+{book.copies} Copies</span>
                        </div>
                      </div>
                    ))}
                    {recentBooks.length === 0 && <div className="p-8 text-center text-gray-500 text-sm">No books in catalog yet.</div>}
                  </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Recent Borrowings & Deadlines */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-none shadow-md h-full">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-[#b91c1c]" /> Recent Active Borrowings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                  <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-300 h-8 w-8" /></div>
              ) : (
                  <div className="divide-y divide-gray-100">
                    {recentBorrowings.map((record) => {
                      const status = getDueDateStatus(record.due_date);
                      return (
                      <div key={record.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        
                        {/* Styled perfectly to match the left column */}
                        <div className="flex flex-col pr-4 overflow-hidden">
                            <span className="font-bold text-gray-900 truncate">{record.book?.title || 'Unknown Book'}</span>
                            <span className="text-sm text-gray-500 truncate">{record.student_name} • {record.course}</span>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-bold text-gray-400 block mb-1 tracking-wider">
                              ACC: {record.book?.acc_no || 'N/A'}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${status.styles}`}>
                              {status.isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                              {status.text}
                            </span>
                        </div>

                      </div>
                    )})}
                    {recentBorrowings.length === 0 && <div className="p-8 text-center text-gray-500 text-sm">No active borrowings right now.</div>}
                  </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}
export default Dashboard