import React, { useState, useCallback, useMemo } from 'react';
import { Upload, Download, RotateCcw, Search, ChevronUp, ChevronDown, Edit, Save, X } from 'lucide-react';
import _ from 'lodash';

const App = () => {
  const [originalData, setOriginalData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const itemsPerPage = 50;

  // Generate sample data
  const generateSampleData = useCallback(() => {
    setLoading(true);

    const genres = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Thriller', 'Biography', 'History', 'Self-Help'];
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Mary', 'Christopher', 'Jessica', 'William', 'Ashley', 'Daniel', 'Amanda', 'Matthew', 'Jennifer', 'Anthony', 'Michelle'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

    const bookTitleWords = ['The', 'Dark', 'Silent', 'Golden', 'Secret', 'Lost', 'Hidden', 'Ancient', 'Forgotten', 'Last', 'First', 'Shadow', 'Light', 'Blood', 'Fire', 'Water', 'Storm', 'Night', 'Day', 'Dream', 'Hope', 'Love', 'Death', 'Life', 'Heart', 'Soul', 'Mind', 'Time', 'World', 'Journey', 'Quest', 'Kingdom', 'Empire', 'City', 'Forest', 'Mountain', 'Ocean', 'River', 'Star', 'Moon', 'Sun'];

    const generateTitle = () => {
      const numWords = Math.floor(Math.random() * 4) + 1;
      const words = [];
      for (let i = 0; i < numWords; i++) {
        words.push(bookTitleWords[Math.floor(Math.random() * bookTitleWords.length)]);
      }
      return words.join(' ');
    };

    const generateISBN = () => {
      return '978-' + Math.floor(Math.random() * 10) + '-' +
        Math.floor(Math.random() * 900 + 100) + '-' +
        Math.floor(Math.random() * 90000 + 10000) + '-' +
        Math.floor(Math.random() * 10);
    };

    const sampleData = [];
    for (let i = 0; i < 10000; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      sampleData.push({
        id: i + 1,
        Title: generateTitle(),
        Author: `${firstName} ${lastName}`,
        Genre: genres[Math.floor(Math.random() * genres.length)],
        PublishedYear: Math.floor(Math.random() * (2023 - 1950) + 1950),
        ISBN: generateISBN(),
        isModified: false
      });
    }

    setTimeout(() => {
      setData(sampleData);
      setOriginalData(JSON.parse(JSON.stringify(sampleData)));
      setLoading(false);
    }, 1000);
  }, []);

  // File upload handler
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        const parsedData = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = { id: index + 1, isModified: false };

          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });

          return row;
        });

        setData(parsedData);
        setOriginalData(JSON.parse(JSON.stringify(parsedData)));
        setLoading(false);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setLoading(false);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  }, []);

  // Download CSV
  const downloadCSV = useCallback(() => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).filter(key => key !== 'id' && key !== 'isModified');
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `edited_books_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [data]);

  // Reset to original data
  const resetAllEdits = useCallback(() => {
    setData(JSON.parse(JSON.stringify(originalData)));
  }, [originalData]);

  // Handle sorting
  const handleSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedData = _.orderBy(data, [key], [direction]);
    setData(sortedData);
    setSortConfig({ key, direction });
    setCurrentPage(1);
  }, [data, sortConfig]);

  // Handle cell editing
  const startEditing = useCallback((rowIndex, column, value) => {
    setEditingCell({ rowIndex, column });
    setEditValue(value);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingCell) return;

    const { rowIndex, column } = editingCell;
    const newData = [...data];
    const actualIndex = (currentPage - 1) * itemsPerPage + rowIndex;

    if (newData[actualIndex][column] !== editValue) {
      newData[actualIndex][column] = editValue;
      newData[actualIndex].isModified = true;
      setData(newData);
    }

    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, data, currentPage, itemsPerPage]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Filter and paginate data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const modifiedCount = data.filter(row => row.isModified).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Book CSV Manager</h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-4">
            <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors">
              <Upload size={18} />
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={generateSampleData}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              Generate Sample Data
            </button>

            <button
              onClick={downloadCSV}
              disabled={data.length === 0}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download size={18} />
              Download CSV
            </button>

            <button
              onClick={resetAllEdits}
              disabled={modifiedCount === 0}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={18} />
              Reset All Edits
            </button>
          </div>

          {/* Search and Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>Total: {data.length} books</span>
              <span>Filtered: {filteredData.length} books</span>
              <span>Modified: {modifiedCount} books</span>
              <span>Page: {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading book data...</p>
          </div>
        )}

        {/* Data Table */}
        {!loading && data.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Title', 'Author', 'Genre', 'PublishedYear', 'ISBN'].map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center gap-2">
                          {column}
                          {sortConfig.key === column && (
                            sortConfig.direction === 'asc' ?
                              <ChevronUp size={14} /> :
                              <ChevronDown size={14} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50 ${row.isModified ? 'bg-yellow-50' : ''}`}
                    >
                      {['Title', 'Author', 'Genre', 'PublishedYear', 'ISBN'].map((column) => (
                        <td
                          key={column}
                          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:bg-gray-100 ${row.isModified && originalData[row.id - 1] &&
                            originalData[row.id - 1][column] !== row[column] ? 'bg-yellow-200' : ''
                            }`}
                          onClick={() => startEditing(index, column, row[column])}
                        >
                          {editingCell &&
                            editingCell.rowIndex === index &&
                            editingCell.column === column ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                              />
                              <button
                                onClick={saveEdit}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Save size={14} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {row[column]}
                              <Edit size={12} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)} of{' '}
                    {filteredData.length} results
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    {(() => {
                      const pages = [];
                      const startPage = Math.max(1, currentPage - 2);
                      const endPage = Math.min(totalPages, startPage + 4);

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={`page-${i}`}
                            onClick={() => setCurrentPage(i)}
                            className={`px-3 py-1 border rounded ${currentPage === i
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      return pages;
                    })()}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Upload size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data loaded</h3>
            <p className="text-gray-600 mb-6">Upload a CSV file or generate sample data to get started</p>
            <div className="flex justify-center gap-4">
              <label className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors">
                Upload CSV File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={generateSampleData}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Generate Sample Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;