import React, { useState, useEffect, useRef } from 'react';
import './ElementChatbot.css';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis,Cell, Tooltip, ResponsiveContainer} from 'recharts';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function CombinationResultView({ result }) {
  // If result is a string (from the initial condition check), render it directly
  if (typeof result === 'string') {
    return <div className="notification">{result}</div>;
  }
  
  // Handle loading state
  if (!result) {
    return null;
  }
  
  // Display different UI based on status
  const renderContent = () => {
    switch (result.status) {
      case "error":
        return (
          <div className="error-container">
            <h3>Error</h3>
            <p>{result.summary}</p>
            <p>{result.description}</p>
          </div>
        );
        
      case "parse_error":
        return (
          <div className="parse-error-container">
            <h3>{result.title}</h3>
            <p>{result.summary}</p>
            <pre className="raw-response">{result.description}</pre>
          </div>
        );
        
      case "complex_combination":
        return (
          <div className="complex-combination-container">
            <h3>{result.title}</h3>
            <div className="complex-explanation">
              <pre className="formatted-response">{result.description}</pre>
            </div>
            <div className="elements-combined">
              <h4>Elements Attempted</h4>
              <p>{result.elements}</p>
            </div>
          </div>
        );
        
      case "success":
      default:
        return (
          <>
            <div className="compound-header">
              <h2>{result.title}</h2>
              <h3 className="formula">{result.formula}</h3>
            </div>
            
            <div className="compound-summary">
              <p>{result.summary}</p>
            </div>
            
            <div className="compound-details">
              <h4>Type</h4>
              <p>{result.type}</p>
              
              <h4>Description</h4>
              <p>{result.description}</p>
              
              <h4>Properties</h4>
              <ul>
                <li><strong>Category:</strong> {result.category}</li>
                <li><strong>Structure:</strong> {result.structure}</li>
                <li><strong>Conductivity:</strong> {result.conductivity}</li>
              </ul>
              
              {result.applications && result.applications.length > 0 && (
                <>
                  <h4>Applications</h4>
                  <ul className="applications-list">
                    {result.applications.map((app, index) => (
                      <li key={index}>{app}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            
            <div className="elements-combined">
              <h4>Elements Combined</h4>
              <p>{result.elements}</p>
            </div>
          </>
        );
    }
  };
  
  return (
    <div className="combination-result">
      {renderContent()}
    </div>
  );
}

const ElementChatbot = ({ selectedElements, onClose, activeFilters }) => {
  // State for managing tabs and chat functionality
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'combine'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [combinationResult, setCombinationResult] = useState(null);
  const [selectedForCombination, setSelectedForCombination] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('properties'); // 'properties' or 'trends'
  const messagesEndRef = useRef(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [hoveredElementSymbol ] = useState(null);
  const [groqApiKey, setGroqApiKey] = useState('');

  // Function to fetch API key from Firebase
  const fetchApiKey = async () => {
    try {
      const docRef = doc(db, 'api-keys', 'REACT_APP_GROQ_API_KEY_1');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGroqApiKey(data.value);
        console.log('API key fetched successfully');
      } else {
        console.error('No API key document found! Make sure the document exists in Firestore.');
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
      console.error('Please check your Firestore security rules and ensure the document exists.');
      // You could also set a fallback or show a user-friendly error message
    }
  };

  // Fetch API key on component mount
  useEffect(() => {
    fetchApiKey();
  }, []);
  
  // Function to call Groq API using fetch
  const callGroqApi = async (messages) => {
    if (!groqApiKey) {
      return "API key not loaded yet. Please try again in a moment.";
    }
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
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

  // Function to format AI response text
  const formatAIResponse = (text) => {
    // Handle bold text (**text**)
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text (*text*)
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Handle bullet points
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Handle numbered lists
    text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
    
    // Handle code blocks
    text = text.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Split by newlines and wrap each line
    return text.split('\n').map((item, key) => (
      <React.Fragment key={key}>
        <span dangerouslySetInnerHTML={{ __html: item }} />
        <br />
      </React.Fragment>
    ));
  };

   // Function to prepare data for charts
   const prepareChartData = (property, subProperty = null) => {
    return selectedElements.map(element => ({
      name: element.symbol,
      value: subProperty ? element[property]?.[subProperty] : element[property],
      fullName: element.name
    })).filter(item => item.value !== undefined)
      .sort((a, b) => a.value - b.value);
  };

  // Update useEffect to handle loading state
  useEffect(() => {
    if (activeTab === 'compare') {
      setIsDataLoading(true);
      // Simulate data loading delay
      const timer = setTimeout(() => {
        setIsDataLoading(false);
      }, 3600);
      return () => clearTimeout(timer);
    }
  }, [activeTab, activeSubTab, selectedElements]);

   // Function to prepare trend data (properties vs atomic number)
   const prepareTrendData = () => {
    return selectedElements.map(element => ({
      name: element.symbol,
      fullName: element.name,
      atomic_number: element.atomic_number,
      atomic_radius: element.radius?.calculated,
      ionization_energy: element.ionization_energies?.[0],
      electronegativity: element.electronegativity_pauling,
      electron_affinity: element.electron_affinity,
      melting_point: element.melting_point,
      boiling_point: element.boiling_point
    })).sort((a, b) => a.atomic_number - b.atomic_number);
  };

  // Function to render trend charts
  const renderTrendCharts = () => {
    const data = prepareTrendData();
    
    return (
      <div className="trend-charts">
        {/* Atomic Radius vs Atomic Number */}
        <div className="chart-container">
          <h4>Atomic Radius vs Atomic Number</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="atomic_number" label={{ value: 'Atomic Number', position: 'insideBottom' , offset: -5}} />
              <YAxis label={{ value: 'Atomic Radius(pm)  ', angle: -90, position: 'insideLeft', offset: 10 }} />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${element.name})`}</p>
                        <p>{`Atomic Number: ${label}`}</p>
                        <p>{`Atomic Radius: ${payload[0].value} pm`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="atomic_radius"
                stroke="#9c27b0"
                dot={(props) => {
                  const { cx, cy, stroke, key, payload } = props;
                  const isHovered = payload.name === hoveredElementSymbol;
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 8 : 4} // Larger radius when hovered
                      stroke={stroke}
                      strokeWidth={isHovered ? 3 : 1} // Thicker stroke when hovered
                      fill={isHovered ? '#fff' : stroke} // White fill when hovered
                      className={isHovered ? 'highlighted-dot' : ''} // Add class for CSS animation/style
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ionization Energy vs Atomic Number */}
        <div className="chart-container">
          <h4>First Ionization Energy vs Atomic Number</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="atomic_number" label={{ value: 'Atomic Number', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Ionization Energy', angle: -90,position: 'insideLeft', offset: 0 }} />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${element.name})`}</p>
                        <p>{`Atomic Number: ${label}`}</p>
                        <p>{`Ionization Energy: ${payload[0].value} kJ/mol`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="ionization_energy"
                stroke="#673ab7"
                 dot={(props) => {
                  const { cx, cy, stroke, key, payload } = props;
                  const isHovered = payload.name === hoveredElementSymbol;
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 8 : 4}
                      stroke={stroke}
                      strokeWidth={isHovered ? 3 : 1}
                      fill={isHovered ? '#fff' : stroke}
                      className={isHovered ? 'highlighted-dot' : ''}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Electronegativity vs Atomic Number */}
        <div className="chart-container">
          <h4>Electronegativity vs Atomic Number</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="atomic_number" label={{ value: 'Atomic Number', position: 'insideBottom' , offset: -5 }} />
              <YAxis label={{ value: 'Electronegativity', angle: -90,position: 'insideLeft', offset: 10 }} />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${element.name})`}</p>
                        <p>{`Atomic Number: ${label}`}</p>
                        <p>{`Electronegativity: ${payload[0].value}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="electronegativity"
                stroke="#ff4081"
                 dot={(props) => {
                  const { cx, cy, stroke, key, payload } = props;
                  const isHovered = payload.name === hoveredElementSymbol;
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 8 : 4}
                      stroke={stroke}
                      strokeWidth={isHovered ? 3 : 1}
                      fill={isHovered ? '#fff' : stroke}
                      className={isHovered ? 'highlighted-dot' : ''}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Electron Affinity vs Atomic Number */}
        <div className="chart-container">
          <h4>Electron Affinity vs Atomic Number</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="atomic_number" label={{ value: 'Atomic Number', position: 'insideBottom' , offset: -5 }} />
              <YAxis label={{ value: 'Electron Affinity', angle: -90,position: 'insideLeft', offset: 10}} />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${element.name})`}</p>
                        <p>{`Atomic Number: ${label}`}</p>
                        <p>{`Electron Affinity: ${payload[0].value} kJ/mol`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="electron_affinity"
                stroke="#009688"
                 dot={(props) => {
                  const { cx, cy, stroke, key, payload } = props;
                  const isHovered = payload.name === hoveredElementSymbol;
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 8 : 4}
                      stroke={stroke}
                      strokeWidth={isHovered ? 3 : 1}
                      fill={isHovered ? '#fff' : stroke}
                      className={isHovered ? 'highlighted-dot' : ''}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Melting Point vs Atomic Number */}
        <div className="chart-container">
          <h4>Melting Point vs Atomic Number</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="atomic_number" label={{ value: 'Atomic Number', position: 'insideBottom' , offset: -5}} />
              <YAxis label={{ value: 'Melting Point (K)', angle: -90, position: 'insideLeft', offset: 10 }} />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${element.name})`}</p>
                        <p>{`Atomic Number: ${label}`}</p>
                        <p>{`Melting Point: ${payload[0].value} K`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="melting_point"
                stroke="#ff9800"
                 dot={(props) => {
                  const { cx, cy, stroke, key, payload } = props;
                  const isHovered = payload.name === hoveredElementSymbol;
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 8 : 4}
                      stroke={stroke}
                      strokeWidth={isHovered ? 3 : 1}
                      fill={isHovered ? '#fff' : stroke}
                      className={isHovered ? 'highlighted-dot' : ''}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Boiling Point vs Atomic Number */}
        <div className="chart-container">
          <h4>Boiling Point vs Atomic Number</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="atomic_number" label={{ value: 'Atomic Number', position: 'insideBottom' , offset: -5 }} />
              <YAxis label={{ value: 'Boiling Point (K)', angle: -90, position: 'insideLeft', offset: 10 }} />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${element.name})`}</p>
                        <p>{`Atomic Number: ${label}`}</p>
                        <p>{`Boiling Point: ${payload[0].value} K`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="boiling_point"
                stroke="#00bcd4"
                 dot={(props) => {
                  const { cx, cy, stroke, key, payload } = props;
                  const isHovered = payload.name === hoveredElementSymbol;
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 8 : 4}
                      stroke={stroke}
                      strokeWidth={isHovered ? 3 : 1}
                      fill={isHovered ? '#fff' : stroke}
                      className={isHovered ? 'highlighted-dot' : ''}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Function to prepare abundance average data
  const prepareAbundanceData = () => {
    return selectedElements.map(element => {
      const abundanceValues = element.abundance ? Object.values(element.abundance) : [];
      const avgAbundance = abundanceValues.length > 0
        ? abundanceValues.reduce((a, b) => a + b, 0) / abundanceValues.length
        : undefined;
      return {
        name: element.symbol,
        value: avgAbundance,
        fullName: element.name,
        details: element.abundance
      };
    }).filter(item => item.value !== undefined)
      .sort((a, b) => a.value - b.value);
  };

  // Function to prepare discovery timeline data
  const prepareDiscoveryData = () => {
    return selectedElements
      .filter(element => element.discovered)
      .map(element => ({
        name: element.symbol,
        value: parseInt(element.discovered.year),
        fullName: element.name,
        discoveredBy: element.discovered.by
      }))
      .sort((a, b) => a.value - b.value);
  };

  // Function to prepare ionization energies data
  const prepareIonizationData = () => {
    return selectedElements.map(element => ({
      name: element.symbol,
      value: element.ionization_energies?.[0],
      fullName: element.name
    })).filter(item => item.value !== undefined)
      .sort((a, b) => a.value - b.value);
  };

  // Update the comparison tab render function
  const renderComparisonContent = () => {
    if (selectedElements.length < 2) {
      return (
        <div className="comparison-message">
          Please select at least two elements to compare.
        </div>
      );
    }

    return (
      <div className="comparison-content">
        <div className="subtab-buttons">
          <button
            className={`subtab-button ${activeSubTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('properties')}
          >
            Property Comparison
          </button>
          <button
            className={`subtab-button ${activeSubTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('trends')}
          >
            Periodic Trends
          </button>
        </div>
        {isDataLoading ? (
          <div className="loading-container">
            <DotLottieReact
              src="https://lottie.host/e10c5f1c-f839-4956-98e3-f7930330be80/csiU7096au.lottie"
              loop
              autoplay
            />
          </div>
        ) : (
          activeSubTab === 'properties' ? renderComparisonCharts() : renderTrendCharts()
        )}
      </div>
    );
  };

  // Function to render comparison charts
  const renderComparisonCharts = () => {
    return (
      <div className="comparison-charts">
        {/* Atomic Mass Chart */}
        <div className="chart-container">
          <h4>Atomic Mass Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('atomic_mass')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                     const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${label})`}</p>
                        <p>{`Atomic Mass: ${payload[0].value}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#2196f3" className={hoveredElementSymbol ? 'bar-transition' : ''}>
                 {prepareChartData('atomic_mass').map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === hoveredElementSymbol ? '#fff' : '#2196f3'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Electronegativity Chart */}
        <div className="chart-container">
          <h4>Electronegativity Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('electronegativity_pauling')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                     const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${label})`}</p>
                        <p>{`Electronegativity: ${payload[0].value}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#ff4081" className={hoveredElementSymbol ? 'bar-transition' : ''}>
                 {prepareChartData('electronegativity_pauling').map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === hoveredElementSymbol ? '#fff' : '#ff4081'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Discovery Timeline */}
        <div className="chart-container">
          <h4>Discovery Timeline</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareDiscoveryData()}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${label})`}</p>
                        <p>{`Discovered: ${payload[0].value}`}</p>
                        <p>{`By: ${payload[0].payload.discoveredBy}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4caf50"
                 dot={(props) => {
                  const { cx, cy, stroke, key, payload } = props;
                  const isHovered = payload.name === hoveredElementSymbol;
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 8 : 4}
                      stroke={stroke}
                      strokeWidth={isHovered ? 3 : 1}
                      fill={isHovered ? '#fff' : stroke}
                      className={isHovered ? 'highlighted-dot' : ''}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

       {/* Boiling Point Chart */}
       <div className="chart-container">
          <h4>Boiling Point Comparison (K)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('boiling_point')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                     const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${label})`}</p>
                        <p>{`Boiling Point: ${payload[0].value} K`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#00bcd4" className={hoveredElementSymbol ? 'bar-transition' : ''}>
                 {prepareChartData('boiling_point').map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === hoveredElementSymbol ? '#fff' : '#00bcd4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Melting Point Chart */}
        <div className="chart-container">
          <h4>Melting Point Comparison (K)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('melting_point')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                     const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${label})`}</p>
                        <p>{`Melting Point: ${payload[0].value} K`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#ff9800" className={hoveredElementSymbol ? 'bar-transition' : ''}>
                 {prepareChartData('melting_point').map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === hoveredElementSymbol ? '#fff' : '#ff9800'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Thermal Conductivity Chart */}
        <div className="chart-container">
          <h4>Thermal Conductivity Comparison (W/mK)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('conductivity', 'thermal')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                     const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${label})`}</p>
                        <p>{`Thermal Conductivity: ${payload[0].value} W/mK`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#795548" className={hoveredElementSymbol ? 'bar-transition' : ''}>
                 {prepareChartData('conductivity', 'thermal').map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === hoveredElementSymbol ? '#fff' : '#795548'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* First Ionization Energy Chart */}
        <div className="chart-container">
          <h4>First Ionization Energy (kJ/mol)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareIonizationData()}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                     const element = payload[0].payload;
                    return (
                      <div className={`custom-tooltip ${element.name === hoveredElementSymbol ? 'highlighted-tooltip' : ''}`}>
                        <p>{`${element.fullName} (${label})`}</p>
                        <p>{`Ionization Energy: ${payload[0].value} kJ/mol`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#673ab7" className={hoveredElementSymbol ? 'bar-transition' : ''}>
                 {prepareIonizationData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === hoveredElementSymbol ? '#fff' : '#673ab7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Refractive Index Chart */}
        <div className="chart-container">
          <h4>Refractive Index Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('refractive_index')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`${payload[0].payload.fullName} (${label})`}</p>
                        <p>{`Refractive Index: ${payload[0].value}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#3f51b5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Valence Electrons Chart */}
        <div className="chart-container">
          <h4>Valence Electrons Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('valence_electrons')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`${payload[0].payload.fullName} (${label})`}</p>
                        <p>{`Valence Electrons: ${payload[0].value}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#e91e63" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Atomic Radius Chart (Updated) */}
        <div className="chart-container">
          <h4>Atomic Radius Comparison (pm)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('radius', 'calculated')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`${payload[0].payload.fullName} (${label})`}</p>
                        <p>{`Calculated Atomic Radius: ${payload[0].value} pm`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#9c27b0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      {/* Density Chart */}
      <div className="chart-container">
          <h4>Density Comparison (g/cm³)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('density', 'stp')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`${payload[0].payload.fullName} (${label})`}</p>
                        <p>{`Density: ${payload[0].value} g/cm³`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#607d8b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Electron Affinity Chart */}
        <div className="chart-container">
          <h4>Electron Affinity (kJ/mol)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('electron_affinity')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`${payload[0].payload.fullName} (${label})`}</p>
                        <p>{`Electron Affinity: ${payload[0].value} kJ/mol`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#009688" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resistivity Chart */}
        <div className="chart-container">
          <h4>Resistivity (μΩ·cm)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareChartData('resistivity')}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`${payload[0].payload.fullName} (${label})`}</p>
                        <p>{`Resistivity: ${payload[0].value} μΩ·cm`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#8bc34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Abundance Chart */}
        <div className="chart-container">
          <h4>Average Abundance (%)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareAbundanceData()}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    const details = payload[0].payload.details;
                    return (
                      <div className="custom-tooltip">
                        <p>{`${payload[0].payload.fullName} (${label})`}</p>
                        <p>{`Average Abundance: ${payload[0].value.toFixed(6)}%`}</p>
                        <p>Breakdown:</p>
                        <p>{`Universe: ${details.universe}%`}</p>
                        <p>{`Solar: ${details.solar}%`}</p>
                        <p>{`Meteor: ${details.meteor}%`}</p>
                        <p>{`Crust: ${details.crust}%`}</p>
                        <p>{`Ocean: ${details.ocean}%`}</p>
                        <p>{`Human: ${details.human}%`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#ffc107" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
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
      // Pass activeFilters to the message and prompt generation functions
      const initialMessage = generateInitialMessage(selectedElements, activeFilters);
      setMessages([{ role: 'assistant', content: initialMessage }]);
      generateSuggestedPrompts(selectedElements, activeFilters);
      // Reset user message state when elements change
      setHasUserSentMessage(false);
      // Clear combination selections when elements change
      setSelectedForCombination([]);
      setCombinationResult(null);
    }
  }, [selectedElements, activeFilters]); // Add activeFilters to dependency array

  // Generate initial message based on selected elements and active filters
  const generateInitialMessage = (elements, filters) => {
    let message = `Hello! I'm your chemistry teacher assistant. `;
  
    if (filters && filters.length > 0) {
      message += `You're currently looking at elements filtered by: ${filters.join(', ')}. `;
    }
  
    if (elements.length === 1) {
      message += `You've selected ${elements[0].name} (${elements[0].symbol}). What would you like to know about it?`;
    } else if (elements.length === 118) {
      message += `You've selected all Modern Periodic Elements. What would you like to know about the periodic table?`;
    } else {
      const elementCount = elements.length;
      const elementNames = elements.length <= 8 
        ? elements.map(el => `${el.name} (${el.symbol})`).join(', ')
        : `${elementCount} elements`;
      message += `You've selected ${elementNames}. What would you like to know about these elements?`;
    }
    return message;
  };

  // Generate suggested prompts based on selected elements and active filters
  const generateSuggestedPrompts = (elements, filters) => {
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

    // Add prompts related to active filters if any
    if (filters && filters.length > 0) {
        prompts.push(`How do these elements relate to the "${filters.join(', ')}" filter?`);
        if (elements.length > 1) {
             prompts.push(`Compare these elements based on the "${filters.join(', ')}" filter criteria.`);
        } else {
             prompts.push(`Explain how ${elements[0].name} fits the "${filters.join(', ')}" filter criteria.`);
        }
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
      if (selectedElements.length <= 8) {
        selectedElements.forEach(element => {
        elementContext += `\nElement: ${element.name} (${element.symbol})\n`;
        elementContext += `Atomic Number: ${element.atomic_number}\n`;
        elementContext += `Atomic Mass: ${element.atomic_mass}\n`;
        elementContext += `Discovered: ${element.discovered ? `${element.discovered.year} by ${element.discovered.by}` : 'Unknown'}\n`;
        elementContext += `Melting Point: ${element.melting_point || 'Unknown'} K\n`;
        elementContext += `Boiling Point: ${element.boiling_point || 'Unknown'} K\n`;
        elementContext += '---\n';
      });
    } else {
      elementContext = `Selected elements (${selectedElements.length}): `;
      elementContext += selectedElements.map(el => el.symbol).join(', ');
      if (selectedElements.length === 118) {
        elementContext += '\n(All elements from the Modern Periodic Table)';
      }
    }
      
      // Add active filters to the context if any are applied
      let filterContext = '';
      if (activeFilters && activeFilters.length > 0) {
        filterContext = `\nNote: The user is currently viewing elements filtered by the following criteria: ${activeFilters.join(', ')}. Keep this in mind when discussing the selected elements.\n\n`;
      }

      // Prepare messages for API call
      const apiMessages = [
        {
          role: 'system',
          content: `You are a knowledgeable and enthusiastic chemistry teacher explaining elements to a student. ${filterContext}\nHere is information about the element(s) the student has selected:\n${elementContext}\n\nRespond in a friendly, educational manner. Explain concepts clearly as if teaching a student. Include interesting facts and real-world applications when relevant. If there are any anomalies or special properties worth noting, mention them. Keep your responses concise (under 250 words) but informative.`
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
      // Prepare input data structure
      const inputElements = {};
      selectedForCombination.forEach((element, index) => {
        inputElements[`element${index + 1}`] = {
          symbol: element.symbol,
          name: element.name,
          atomic_number: element.atomic_number,
          category: element.series || 'Unknown',
          electronegativity: element.electronegativity_pauling || 'Unknown'
        };
      });
  
      const requestData = {
        input: inputElements,
        count: selectedForCombination.length
      };
  
      // Prepare messages for API call
      const elementSymbols = selectedForCombination.map(el => el.symbol).join(' + ');
      const elementNames = selectedForCombination.map(el => el.name).join(' and ');
      
      const apiMessages = [
        {
          role: 'system',
          content: `You are a chemistry expert. Given the following elements: ${JSON.stringify(requestData, null, 2)}\n\nProvide a detailed analysis of their combination in this exact JSON format:\n{\n  "input": {elements},\n  "output": {\n    "compound": {\n      "name": "Full compound name",\n      "formula": "Chemical formula",\n      "type": "Type of compound (ionic, covalent, etc.)",\n      "description": "Detailed formation process",\n      "properties": {\n        "category": "Compound category",\n        "applications": ["List of applications"],\n        "structure": "Crystal/molecular structure",\n        "conductivity": "Electrical/thermal properties"\n      }\n    },\n    "summary": "Brief one-line summary"\n  }\n}`
        },
        {
          role: 'user',
          content: `What compound is formed when combining ${elementNames} (${elementSymbols})? Provide the result in the specified JSON format, DO NOT ADD/WRITE ANY OTHER TEXT,IMP NOTES, COMMENTS ETC other than JSON.`
        }
      ];
      
      // Call Groq API
      const responseContent = await callGroqApi(apiMessages);
      
      // Process the API response
      try {
        // Extract JSON from the response
        // This handles both clean JSON responses and responses where JSON might be embedded in markdown or text
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : responseContent;
        
        let formattedResult;
        try {
          formattedResult = JSON.parse(jsonString);
        } catch (innerParseError) {
          // If we can't parse the JSON, check if it's a textual explanation about complex combinations
          if (responseContent.includes("impossible to determine") || 
              responseContent.includes("complex mixture") || 
              responseContent.includes("can't form a stable compound")) {
            
            // Handle the complex explanation case
            return setCombinationResult({
              title: "Complex Combination",
              summary: "The combination analysis produced an unexpected format",
              description: responseContent,
              elements: selectedForCombination.map(el => `${el.name} (${el.symbol})`).join(", "),
              status: "complex_combination"
            });
          }
          
          // Otherwise treat as a general parse error
          throw innerParseError;
        }
        
        // Extract the relevant display data as simple strings and arrays
        // Avoid nested objects for direct display
        const resultData = {
          title: formattedResult.output?.compound?.name || "Compound Analysis",
          formula: formattedResult.output?.compound?.formula || "Unknown",
          summary: formattedResult.output?.summary || "Combination analysis complete",
          description: formattedResult.output?.compound?.description || "",
          type: formattedResult.output?.compound?.type || "Unknown",
          category: formattedResult.output?.compound?.properties?.category || "Unknown",
          applications: formattedResult.output?.compound?.properties?.applications || [],
          structure: formattedResult.output?.compound?.properties?.structure || "Unknown",
          conductivity: formattedResult.output?.compound?.properties?.conductivity || "Unknown",
          elements: selectedForCombination.map(el => `${el.name} (${el.symbol})`).join(", "),
          status: "success",
          rawData: formattedResult // Store the complete data for advanced usage
        };
        
        setCombinationResult(resultData);
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        
        // Fallback handling for non-JSON responses - only using primitive values
        const fallbackResult = {
          title: "Analysis Result",
          summary: "The combination analysis produced an unexpected format",
          description: responseContent, // Store the raw response as a string
          elements: selectedForCombination.map(el => `${el.name} (${el.symbol})`).join(", "),
          status: "parse_error"
        };
        
        setCombinationResult(fallbackResult);
      }
    } catch (error) {
      console.error('Error in handleCombineElements:', error);
      
      // Structured error response with primitive values only
      const errorResult = {
        title: "Combination Error",
        summary: "There was an error processing your combination request",
        description: error.message || "Unknown error",
        elements: selectedForCombination.map(el => `${el.name} (${el.symbol})`).join(", "),
        status: "error"
      };
      
      setCombinationResult(errorResult);
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
          <button 
            className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            Compare Elements
          </button>
        </div>
        <button className="close-btn" onClick={onClose}>x</button>
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
                  {message.role === 'user' ? message.content : formatAIResponse(message.content)}
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
          ) : activeTab === 'combine' ? (
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
                <div className="combination-result-container">
                  <h4>Combination Analysis:</h4>
                  <div className="result-content">
                    {/* Replace direct rendering with CombinationResultView component */}
                    <CombinationResultView result={combinationResult} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            // New comparison tab content
            <div className="comparison-container">
              {renderComparisonContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElementChatbot;