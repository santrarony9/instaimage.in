"use client";

import React, { useState, useEffect } from 'react';


import { fetchApi } from '@/lib/api';
import { useToast } from '@/components/ui/toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState(`You are an expert SEO copywriter and marketer for a professional photography and videography platform called InstaImage.
Write a highly professional, engaging, and SEO-friendly description.
Focus on the value proposition, the experience, and why the customer should book this.
Incorporate any provided tags naturally for SEO.
If rough notes are provided, flesh them out into professional sentences.
Do NOT include formatting like "Paragraph 1:". Keep it punchy and conversion-focused.
CRITICAL: Output the response as a bulleted list of the main features/benefits, as customers prefer easily scannable bullet points over long paragraphs.`);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await fetchApi('/settings');
      
      const promptData = allSettings['aiPrompt'];
      if (promptData && typeof promptData === 'string') {
        setAiPrompt(promptData);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveAiPrompt = async () => {
    try {
      setSaving(true);
      await fetchApi('/settings/aiPrompt', {
        method: 'PUT',
        body: JSON.stringify({ value: aiPrompt })
      });
      toast.success('AI Prompt saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save AI prompt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Settings</h1>
        <p className="text-gray-500">Configure global platform settings, travel charges, and office locations.</p>
      </div>

      {/* AI System Prompt */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">âœ¨</span> AI System Prompt
            </h2>
            <p className="text-sm text-gray-600 mt-1">Train the AI how to write descriptions (tone, style, formatting).</p>
          </div>
          <button 
            onClick={handleSaveAiPrompt} 
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save AI Rules'}
          </button>
        </div>
        <div className="p-4 bg-gray-50">
          <label className="block text-sm font-semibold text-gray-700 mb-2">System Instructions</label>
          <textarea 
            rows={10} 
            value={aiPrompt} 
            onChange={e => setAiPrompt(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            placeholder="Enter instructions for the AI..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Tip: Tell the AI exactly how you want it to format the output. For example: "Always use bullet points", or "Keep it under 3 sentences".
          </p>
        </div>
      </div>

          </div>
  );
}



