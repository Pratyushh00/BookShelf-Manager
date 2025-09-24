import React from 'react';
import PropTypes from 'prop-types';

function CSVUpload({ onCSVLoaded }) {
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        onCSVLoaded(text);
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <input type="file" accept=".csv" onChange={handleFileChange} />
        </div>
    );
}

CSVUpload.propTypes = {
    onCSVLoaded: PropTypes.func.isRequired,
};

export default CSVUpload;
