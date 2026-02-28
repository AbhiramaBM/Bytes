import React, { useState } from 'react';
import { AlertTriangle, Sparkles, Stethoscope } from 'lucide-react';
import { Button, Card } from '../components/UI';
import apiClient from '../utils/apiClient';

const SymptomCheckerPage = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const symptoms = input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (symptoms.length === 0) {
      setError('Enter at least one symptom (comma separated).');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/ai/symptom-check', { symptoms });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Symptom Checker</h1>
      <p className="text-gray-500 mb-8">Describe symptoms to get likely conditions and next-step guidance.</p>

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Symptoms (comma separated)
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[120px] border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="fever, cough, sore throat"
          />
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </Button>
        </form>
      </Card>

      {error && (
        <Card className="border border-red-200 bg-red-50 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </Card>
      )}

      {result && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600" size={18} />
            <h2 className="text-xl font-bold text-gray-800">Analysis Result</h2>
          </div>

          {result.emergency && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={18} />
              <p className="text-red-700 font-semibold">Emergency signal detected. Seek immediate medical care.</p>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Likely Conditions</p>
            <ul className="list-disc pl-5 text-gray-800">
              {(result.likelyConditions || []).map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Precautions</p>
            <ul className="list-disc pl-5 text-gray-800">
              {(result.precautions || []).map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Stethoscope size={16} />
            <span className="font-medium">Risk Level: {result.riskLevel || 'low'}</span>
          </div>

          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-lg">
            {result.disclaimer}
          </p>
        </Card>
      )}
    </div>
  );
};

export default SymptomCheckerPage;
