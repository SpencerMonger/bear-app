import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    // Create preview URL for immediate display
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('http://localhost:8000/classify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPrediction(res.data);
      console.log('Response:', res.data);
    } catch (err) {
      console.error('Error:', err);
      setPrediction({ error: err.response?.data?.detail || 'An error occurred' });
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h1>Bear Classifier</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          onChange={handleFileChange}
          accept="image/*"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Classifying...' : 'Classify'}
        </button>
      </form>
      
      {preview && (
        <div style={{ marginTop: '20px' }}>
          <h3>Selected Image:</h3>
          <img 
            src={prediction ? prediction.image : preview} 
            alt="Selected" 
            style={{ maxWidth: '300px', maxHeight: '300px' }}
          />
        </div>
      )}
      
      {prediction && !prediction.error && (
        <div>
          <h2>Result: {prediction.prediction}</h2>
          <p>Confidence: {(prediction.confidence * 100).toFixed(2)}%</p>
          {prediction.details && (
            <div>
              <h3>All Probabilities:</h3>
              {Object.entries(prediction.details).map(([label, prob]) => (
                <p key={label}>{label}: {(prob * 100).toFixed(2)}%</p>
              ))}
            </div>
          )}
        </div>
      )}
      
      {prediction?.error && (
        <p style={{color: 'red'}}>Error: {prediction.error}</p>
      )}
    </div>
  );
}

export default App;
