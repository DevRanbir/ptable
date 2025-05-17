import React, { useState, useEffect, useRef } from 'react';
import './ElementChatbot.css';

const ElementChatbot = ({ selectedElements, onClose }) => {
  // State for managing tabs and chat functionality
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'combine'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [combinationResult, setCombinationResult] = useState(null);
  const [selectedForCombination, setSelectedForCombination] = useState([]);
  const messagesEndRef = useRef(null);
  // State to track if the user has sent a message
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);

  // API key for Groq (in a real application, this should be stored securely on a backend)
  const GROQ_API_KEY = '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';
  
  // Function to call Groq API using fetch
  const callGroqApi = async (messages) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gemma2-9b-it',
          messages: messages
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('Error calling Groq API:', error);
      return "I'm sorry, there was an error processing your request. Please try again later.";
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Generate initial message and suggested prompts when selected elements change
    if (selectedElements && selectedElements.length > 0) {
      const initialMessage = generateInitialMessage(selectedElements);
      setMessages([{ role: 'assistant', content: initialMessage }]);
      generateSuggestedPrompts(selectedElements);
      // Reset user message state when elements change
      setHasUserSentMessage(false);
      // Clear combination selections when elements change
      setSelectedForCombination([]);
      setCombinationResult(null);
    }
  }, [selectedElements]);

  // Generate initial message based on selected elements
  const generateInitialMessage = (elements) => {
    if (elements.length === 1) {
      return `Hello! I'm your chemistry teacher assistant. You've selected ${elements[0].name} (${elements[0].symbol}). What would you like to know about it?`;
    } else {
      const elementNames = elements.map(el => `${el.name} (${el.symbol})`).join(', ');
      return `Hello! I'm your chemistry teacher assistant. You've selected multiple elements: ${elementNames}. What would you like to know about these elements?`;
    }
  };

  // Generate suggested prompts based on selected elements
  const generateSuggestedPrompts = (elements) => {
    const prompts = [];
    
    if (elements.length === 1) {
      const element = elements[0];
      prompts.push(
        `Tell me about the properties of ${element.name}`,
        `What are the main uses of ${element.name}?`,
        `Explain the electron configuration of ${element.name}`,
        `What makes ${element.name} unique?`
      );
      
      // Add specific prompts based on element properties
      if (element.series) {
        prompts.push(`Why is ${element.name} classified as a ${element.series}?`);
      }
      
      if (element.discovered) {
        prompts.push(`Tell me about the discovery of ${element.name}`);
      }
    } else {
      // Multiple elements selected
      prompts.push(
        'Compare the properties of these elements',
        'What do these elements have in common?',
        'Explain the trends across these elements',
        'How do these elements interact with each other?'
      );
      
      // Check if elements are in the same group/period/block
      const categories = elements.map(el => el.series);
      const uniqueCategories = [...new Set(categories)];
      
      if (uniqueCategories.length === 1) {
        prompts.push(`Why are all these elements classified as ${uniqueCategories[0]}?`);
      } else if (uniqueCategories.length < elements.length) {
        prompts.push('Explain the different categories these elements belong to');
      }
      
      // Check for anomalies
      prompts.push('Are there any anomalies or exceptions among these elements?');
    }
    
    setSuggestedPrompts(prompts);
  };

  // Handle sending a message
  const handleSendMessage = async (content) => {
    if (!content.trim() && !isLoading) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    // Set state to indicate user has sent a message
    setHasUserSentMessage(true);

    try {
      // Prepare context about the selected elements
      let elementContext = '';
      selectedElements.forEach(element => {
        elementContext += `\nElement: ${element.name} (${element.symbol})\n`;
        elementContext += `Atomic Number: ${element.atomic_number}\n`;
        elementContext += `Atomic Mass: ${element.atomic_mass}\n`;
        elementContext += `Category: ${element.series || 'Unknown'}\n`;
        elementContext += `Phase at Room Temperature: ${element.phase || 'Unknown'}\n`;
        elementContext += `Electron Configuration: ${element.electron_configuration || 'Unknown'}\n`;
        elementContext += `Electronegativity: ${element.electronegativity_pauling || 'Unknown'}\n`;
        elementContext += `Discovered: ${element.discovered ? `${element.discovered.year} by ${element.discovered.by}` : 'Unknown'}\n`;
        elementContext += `Melting Point: ${element.melting_point || 'Unknown'} K\n`;
        elementContext += `Boiling Point: ${element.boiling_point || 'Unknown'} K\n`;
        if (element.abundance) {
          elementContext += `Abundance in Earth's crust: ${element.abundance.crust || 'Unknown'}%\n`;
        }
        elementContext += '---\n';
      });
      
      // Prepare messages for API call
      const apiMessages = [
        {
          role: 'system',
          content: `You are a knowledgeable and enthusiastic chemistry teacher explaining elements to a student. \n\nHere is information about the element(s) the student has selected:\n${elementContext}\n\nRespond in a friendly, educational manner. Explain concepts clearly as if teaching a student. Include interesting facts and real-world applications when relevant. If there are any anomalies or special properties worth noting, mention them. Keep your responses concise (under 250 words) but informative.`
        },
        ...messages.filter(msg => msg.role !== 'system'),
        userMessage
      ];
      
      // Call Groq API with fetch
      const responseContent = await callGroqApi(apiMessages);
      
      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: responseContent
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, there was an error processing your request. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clicking a suggested prompt
  const handlePromptClick = (prompt) => {
    handleSendMessage(prompt);
  };

  // Handle element selection for combination
  const toggleElementForCombination = (element) => {
    if (activeTab !== 'combine') return;
    
    setSelectedForCombination(prev => {
      const isAlreadySelected = prev.some(el => el.symbol === element.symbol);
      
      if (isAlreadySelected) {
        return prev.filter(el => el.symbol !== element.symbol);
      } else {
        return [...prev, element];
      }
    });
  };

  // Handle combining elements
  const handleCombineElements = async () => {
    if (selectedForCombination.length < 2) {
      setCombinationResult("Please select at least two elements to combine.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare context about the selected elements for combination
      let elementContext = '';
      selectedForCombination.forEach(element => {
        elementContext += `\nElement: ${element.name} (${element.symbol})\n`;
        elementContext += `Atomic Number: ${element.atomic_number}\n`;
        elementContext += `Atomic Mass: ${element.atomic_mass}\n`;
        elementContext += `Category: ${element.series || 'Unknown'}\n`;
        elementContext += `Phase at Room Temperature: ${element.phase || 'Unknown'}\n`;
        elementContext += `Electron Configuration: ${element.electron_configuration || 'Unknown'}\n`;
        elementContext += `Electronegativity: ${element.electronegativity_pauling || 'Unknown'}\n`;
        elementContext += '---\n';
      });
      
      // Prepare messages for API call
      const elementSymbols = selectedForCombination.map(el => el.symbol).join(' + ');
      const elementNames = selectedForCombination.map(el => el.name).join(' and ');
      
      const apiMessages = [
        {
          role: 'system',
          content: `You are a knowledgeable chemistry teacher explaining how elements interact and combine. The student wants to know about combining these elements:\n${elementContext}\n\nExplain how these elements would interact or combine in various scenarios. Include:
          1. The most common compounds they form together (if any)
          2. The chemical reaction(s) that would occur, with balanced equations
          3. Properties of the resulting compound(s)
          4. Real-world applications or examples of these combinations
          5. Any safety considerations or interesting facts`
        },
        {
          role: 'user',
          content: `What happens when I combine ${elementNames}? How would ${elementSymbols} interact?`
        }
      ];
      
      // Call Groq API
      const responseContent = await callGroqApi(apiMessages);
      setCombinationResult(responseContent);
    } catch (error) {
      console.error('Error in handleCombineElements:', error);
      setCombinationResult("I'm sorry, there was an error processing your combination request. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add new state for speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Function to handle text-to-speech
  const speak = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  
  return (
    <div className="element-chatbot-fullscreen">
      <div className="chatbot-header">
        <h3>Interactive Chemistry Lab</h3>
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Element Chat
          </button>
          <button 
            className={`tab-btn ${activeTab === 'combine' ? 'active' : ''}`}
            onClick={() => setActiveTab('combine')}
          >
            Element Combinations
          </button>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="chatbot-content">
        {/* Left sidebar - Elements list */}
        <div className="elements-sidebar">
          <h4>Selected Elements</h4>
          <div className="elements-list">
            {selectedElements.map((element, index) => (
              <div 
                key={index} 
                className={`element-item ${
                  activeTab === 'combine' && 
                  selectedForCombination.some(el => el.symbol === element.symbol) 
                    ? 'selected-for-combination' 
                    : ''
                }`}
                onClick={() => toggleElementForCombination(element)}
              >
                <div className="element-symbol">{element.symbol}</div>
                <div className="element-name">{element.name}</div>
                <div className="element-number">{element.atomic_number}</div>
              </div>
            ))}
          </div>
          {activeTab === 'combine' && (
            <div className="combination-controls">
              <div className="selected-for-combo-count">
                {selectedForCombination.length} elements selected for combination
              </div>
              <button 
                className="combine-btn"
                onClick={handleCombineElements}
                disabled={selectedForCombination.length < 2 || isLoading}
              >
                Combine Elements
              </button>
            </div>
          )}
        </div>
        
        {/* Right content area - Tabbed interface */}
        <div className="chatbot-main">
          {activeTab === 'chat' ? (
            // Chat Tab Content
            <>
              <div className="chatbot-messages">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                  >
                    {message.content}
                    {message.role === 'assistant' && (
                      <button 
                        className={`speak-button ${isSpeaking ? 'speaking' : ''}`}
                        onClick={() => speak(message.content)}
                        title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                      >
                        <i className={`fas fa-${isSpeaking ? 'stop' : 'volume-up'}`}></i>
                      </button>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant-message loading">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Conditionally render suggested prompts */}
              {suggestedPrompts.length > 0 && !hasUserSentMessage && (
                <div className="suggested-prompts">
                  <h4>Suggested Questions:</h4>
                  <div className="prompt-buttons">
                    {suggestedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        className="prompt-btn"
                        onClick={() => handlePromptClick(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="chatbot-input">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask something about the element(s)..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  disabled={isLoading}
                />
                <button 
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={isLoading || !inputValue.trim()}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            // Combination Tab Content
            <div className="combination-container">
              <div className="combination-instructions">
                <h3>Element Combination Lab</h3>
                <p>Select elements from the sidebar to see how they would interact or combine.</p>
                <p>Select at least two elements, then click "Combine Elements" to see the results.</p>
              </div>
              
              {selectedForCombination.length > 0 && (
                <div className="selected-elements-display">
                  <h4>Selected for Combination:</h4>
                  <div className="selected-elements-badges">
                    {selectedForCombination.map((element, index) => (
                      <div key={index} className="element-badge">
                        {element.symbol} <span className="element-badge-name">({element.name})</span>
                        {index < selectedForCombination.length - 1 && <span className="plus-sign">+</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="combination-loading">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>Analyzing chemical interaction...</p>
                </div>
              ) : combinationResult && (
                <div className="combination-result">
                  <h4>Combination Analysis:</h4>
                  <div className="result-content">
                    {combinationResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElementChatbot;