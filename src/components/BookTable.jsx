import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

function BookTable({ books, onEdit, modifiedRows, sortConfig, onSort, filter, page, setPage, pageSize }) {
    // Filtering
    const filteredBooks = useMemo(() => {
        if (!filter) return books;
        return books.filter(book =>
            Object.values(book).some(val => val.toLowerCase().includes(filter.toLowerCase()))
        );
    }, [books, filter]);

    // Sorting
    const sortedBooks = useMemo(() => {
        if (!sortConfig.key) return filteredBooks;
        return [...filteredBooks].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredBooks, sortConfig]);

    // Pagination
    const totalRows = sortedBooks.length;
    const totalPages = Math.ceil(totalRows / pageSize);
    const paginatedBooks = sortedBooks.slice(page * pageSize, (page + 1) * pageSize);

    // Table rendering
    return (
        <div>
            <div style={{ marginBottom: 8 }}>
                <span>Rows: {totalRows} | Page: {page + 1} / {totalPages}</span>
            </div>
            <table className="book-table">
                <thead>
                    <tr>
                        {['Title', 'Author', 'Genre', 'PublishedYear', 'ISBN'].map(col => (
                            <th key={col} onClick={() => onSort(col)} style={{ cursor: 'pointer' }}>
                                {col}
                                {sortConfig.key === col && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                        ))}
                        <th>Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedBooks.map((book, idx) => {
                        const globalIdx = page * pageSize + idx;
                        const isModified = modifiedRows.has(globalIdx);
                        return (
                            <tr key={globalIdx} style={isModified ? { background: '#ffeeba' } : {}}>
                                {['Title', 'Author', 'Genre', 'PublishedYear', 'ISBN'].map(col => (
                                    <td key={col}>
                                        <input
                                            value={book[col]}
                                            onChange={e => onEdit(globalIdx, col, e.target.value)}
                                            style={isModified ? { fontWeight: 'bold' } : {}}
                                        />
                                    </td>
                                ))}
                                <td>{isModified ? '✏️' : ''}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div style={{ marginTop: 8 }}>
                <button disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
                <button disabled={page === totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
            </div>
        </div>
    );
}

BookTable.propTypes = {
    books: PropTypes.array.isRequired,
    onEdit: PropTypes.func.isRequired,
    modifiedRows: PropTypes.instanceOf(Set).isRequired,
    sortConfig: PropTypes.object.isRequired,
    onSort: PropTypes.func.isRequired,
    filter: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
    pageSize: PropTypes.number.isRequired,
};

export default BookTable;
