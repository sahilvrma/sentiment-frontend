import React, { useState } from 'react';
import { MessageCircle, RefreshCw, Copy, CheckCircle, AlertCircle, Meh, Ticket, Send } from 'lucide-react';
import { API_ENDPOINTS } from './config/api';

interface SentimentResult {
  final_sentiment: string;
  confidence: number;
}

interface ExplanationResult {
  sentiment: string;
  explanation: string;
}

interface RephraseResult {
  rephrased: string;
}

interface TicketData {
  id: string;
  title: string;
  description: string;
  sentiment: string;
  confidence: number;
  originalText: string;
  createdAt: string;
  status: 'open' | 'in-progress' | 'resolved';
}
function App() {
  const [reviewText, setReviewText] = useState('');
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [rephrasedText, setRephrasedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const analyzeSentiment = async () => {
    if (!reviewText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Call predict API
      const predictResponse = await fetch(API_ENDPOINTS.predict, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reviewText })
      });
      
      if (!predictResponse.ok) {
        console.error('Predict API error:', predictResponse.status, await predictResponse.text());
        return;
      }
      
      const sentimentData = await predictResponse.json();
      setSentiment(sentimentData);

      // Call explain API
      const explainResponse = await fetch(API_ENDPOINTS.explain, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reviewText })
      });
      
      if (!explainResponse.ok) {
        console.error('Explain API error:', explainResponse.status, await explainResponse.text());
        return;
      }
      
      const explanationData = await explainResponse.json();
      setExplanation(explanationData);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const rephraseReview = async () => {
    if (!reviewText.trim()) return;
    
    setIsRephrasing(true);
    try {
      const response = await fetch(API_ENDPOINTS.rephrase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reviewText })
      });
      const data: RephraseResult = await response.json();
      setRephrasedText(data.rephrased);
    } catch (error) {
      console.error('Error rephrasing text:', error);
    } finally {
      setIsRephrasing(false);
    }
  };

  const createTicket = async () => {
    if (!sentiment || !explanation) return;
    
    setIsCreatingTicket(true);
    try {
      // Simulate API call to internal ticketing system
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newTicket: TicketData = {
        id: `TICK-${Date.now()}`,
        title: `Review Analysis - ${sentiment.final_sentiment.toUpperCase()} Sentiment`,
        description: rephrasedText || reviewText,
        sentiment: sentiment.final_sentiment,
        confidence: sentiment.confidence,
        originalText: reviewText,
        createdAt: new Date().toISOString(),
        status: 'open'
      };
      
      setTickets(prev => [newTicket, ...prev]);
      setTicketSuccess(true);
      setTimeout(() => setTicketSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsCreatingTicket(false);
    }
  };
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getSentimentColor = (sentimentType: string) => {
    switch (sentimentType.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentIcon = (sentimentType: string) => {
    switch (sentimentType.toLowerCase()) {
      case 'positive':
        return <CheckCircle className="w-4 h-4" />;
      case 'negative':
        return <AlertCircle className="w-4 h-4" />;
      case 'neutral':
        return <Meh className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-cyan-500/10"></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Review Analysis Tool
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Analyze sentiment, get insights, and rephrase your reviews with AI-powered precision
            </p>
            
            {/* Ticket Counter */}
            {tickets.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full px-4 py-2 text-white transition-all duration-200"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{tickets.length} Ticket{tickets.length !== 1 ? 's' : ''} Created</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-semibold text-white mb-6">Enter Your Review</h2>
                
                <div className="space-y-4">
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Type your review here..."
                    className="w-full h-32 p-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    onKeyUp={analyzeSentiment}
                  />
                  
                  <button
                    onClick={analyzeSentiment}
                    disabled={!reviewText.trim() || isAnalyzing}
                    className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      'Analyze Sentiment'
                    )}
                  </button>
                </div>
              </div>

              {/* Sentiment Results */}
              {(sentiment || explanation) && (
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-semibold text-white mb-6">Analysis Results</h3>
                  
                  {sentiment && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium ${getSentimentColor(sentiment.final_sentiment)}`}>
                          {getSentimentIcon(sentiment.final_sentiment)}
                          <span className="ml-2 capitalize">{sentiment.final_sentiment}</span>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                          {Math.round(sentiment.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  )}

                  {explanation && (
                    <div className="bg-white/10 p-4 rounded-xl">
                      <h4 className="text-white font-medium mb-2">Explanation:</h4>
                      <p className="text-blue-100 text-sm leading-relaxed">{explanation.explanation}</p>
                    </div>
                  )}
                  
                  {/* Create Ticket Button */}
                  <div className="mt-6">
                    <button
                      onClick={createTicket}
                      disabled={isCreatingTicket}
                      className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                    >
                      {isCreatingTicket ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Ticket...</span>
                        </div>
                      ) : ticketSuccess ? (
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Ticket Created!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Ticket className="w-4 h-4" />
                          <span>Export to Ticketing System</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Rephrase Section */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-semibold text-white mb-6">Rephrase Review</h2>
                
                <div className="space-y-4">
                  <button
                    onClick={rephraseReview}
                    disabled={!reviewText.trim() || isRephrasing}
                    className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {isRephrasing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rephrasing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>Rephrase Text</span>
                      </div>
                    )}
                  </button>

                  {rephrasedText && (
                    <div className="space-y-3">
                      <label className="block text-white text-sm font-medium mb-2">
                        Edit rephrased text before creating ticket:
                      </label>
                      <textarea
                        value={rephrasedText}
                        onChange={(e) => setRephrasedText(e.target.value)}
                        className="w-full h-32 p-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                      />
                      
                      <button
                        onClick={() => copyToClipboard(rephrasedText)}
                        className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-105"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {copySuccess ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy to Clipboard</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Export Options */}
              {(sentiment || rephrasedText) && (
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-semibold text-white mb-6">Export Options</h3>
                  
                  <div className="space-y-3">
                    {reviewText && (
                      <button
                        onClick={() => copyToClipboard(reviewText)}
                        className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span>Original Review</span>
                          <Copy className="w-4 h-4" />
                        </div>
                      </button>
                    )}
                    
                    {rephrasedText && (
                      <button
                        onClick={() => copyToClipboard(rephrasedText)}
                        className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span>Rephrased Review</span>
                          <Copy className="w-4 h-4" />
                        </div>
                      </button>
                    )}
                    
                    {sentiment && explanation && (
                      <button
                        onClick={() => copyToClipboard(`Sentiment: ${sentiment.final_sentiment} (${Math.round(sentiment.confidence * 100)}% confidence)\nExplanation: ${explanation.explanation}`)}
                        className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span>Analysis Summary</span>
                          <Copy className="w-4 h-4" />
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Demo Ticketing System</h2>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white/10 p-6 rounded-xl border border-white/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{ticket.title}</h3>
                      <p className="text-blue-200 text-sm">ID: {ticket.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${getSentimentColor(ticket.sentiment)}`}>
                        {getSentimentIcon(ticket.sentiment)}
                        <span className="ml-1 capitalize">{ticket.sentiment}</span>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {ticket.status.replace('-', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-white text-sm font-medium mb-1">Description:</h4>
                      <p className="text-blue-100 text-sm bg-white/10 p-3 rounded-lg">{ticket.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-white text-sm font-medium mb-1">Original Text:</h4>
                      <p className="text-blue-100 text-sm bg-white/10 p-3 rounded-lg">{ticket.originalText}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-blue-200">
                      <span>Confidence: {Math.round(ticket.confidence * 100)}%</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;