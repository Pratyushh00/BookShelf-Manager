// Simple CSV parser and generator
export function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i] || ''; });
        return obj;
    });
}

export function toCSV(data) {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const lines = [headers.join(',')];
    data.forEach(row => {
        lines.push(headers.map(h => row[h]).join(','));
    });
    return lines.join('\n');
}
