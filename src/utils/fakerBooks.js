// Simple random book data generator
const genres = ['Fiction', 'Non-Fiction', 'Mystery', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Romance'];
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomString(len) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let str = '';
    for (let i = 0; i < len; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
    return str;
}
export function generateBooks(count = 10000) {
    const books = [];
    for (let i = 0; i < count; i++) {
        books.push({
            Title: `Book ${randomString(8)}`,
            Author: `Author ${randomString(6)}`,
            Genre: genres[randomInt(0, genres.length - 1)],
            PublishedYear: String(randomInt(1900, 2025)),
            ISBN: String(randomInt(1000000000000, 9999999999999)),
        });
    }
    return books;
}
