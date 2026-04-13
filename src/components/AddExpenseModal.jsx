import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddExpenseModal = ({ isOpen, onClose, expenseToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        title: expenseToEdit.title || '',
        amount: expenseToEdit.amount || '',
        category: expenseToEdit.category || 'Food',
        date: expenseToEdit.date ? new Date(expenseToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: expenseToEdit.description || ''
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (expenseToEdit) {
        await axios.put(`/api/expenses/${expenseToEdit.id}`, formData);
        toast.success('Expense updated successfully!');
      } else {
        await axios.post('/api/expenses', formData);
        toast.success('Expense added successfully!');
      }
      
      onClose();

      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      toast.error(expenseToEdit ? 'Failed to update expense' : 'Failed to add expense');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-card p-6 rounded-xl w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full input-field"
              placeholder="e.g., Dinner at Italian Resto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="mt-1 block w-full input-field"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full input-field"
            >
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Utilities">Utilities</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full input-field"
              placeholder="Extra details..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button 
              type="button" 
              className="btn btn-secondary px-4 py-2" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary px-4 py-2"
              disabled={loading}
            >
              {loading ? 'Saving...' : (expenseToEdit ? 'Update Expense' : 'Save Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
