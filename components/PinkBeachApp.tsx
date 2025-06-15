typescript
  'use client'

// @ts-ignore
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, User, Bell, Plus, Settings, ArrowLeft, Camera, MessageCircle, ChevronLeft, ChevronRight, UserCog } from 'lucide-react';

const PinkBeachApp = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  
  const [users, setUsers] = useState([
    { id: 1, username: 'Utente', role: 'user', defaultUmbrella: null, sportsNotifications: [], profileImage: null },
    { id: 2, username: 'Marco', role: 'user', defaultUmbrella: 114, sportsNotifications: ['Beach volley'], profileImage: null },
    { id: 3, username: 'Lisa', role: 'user', defaultUmbrella: 115, sportsNotifications: ['Tennis'], profileImage: null },
    { id: 4, username: 'Sene', role: 'admin', defaultUmbrella: null, sportsNotifications: [], profileImage: null }
  ]);

  const [userPresences, setUserPresences] = useState({});
  const [events, setEvents] = useState([]);
  const [sportsActivities, setSportsActivities] = useState([]);
  const [frankieMessages, setFrankieMessages] = useState([]);
  const [umbrellaAssignments, setUmbrellaAssignments] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [weatherData, setWeatherData] = useState({
    temperature: 28,
    windSpeed: 12,
    condition: 'sunny',
    humidity: 65,
    uvIndex: 8,
    seaTemp: 25,
    location: 'Senigallia, Adriatico',
    coordinates: '43.7257°N, 13.2088°E',
    lastUpdated: new Date().toLocaleTimeString(),
    isRealTime: false,
    error: null
  });

  // ⚠️ SOSTITUISCI CON LA TUA API KEY di OpenWeatherMap
  const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'e9739da93374cd20f92e6e883f396817';
  const SENIGALLIA_LAT = 43.7257;
  const SENIGALLIA_LON = 13.2088;

  const [umbrellaConfig, setUmbrellaConfig] = useState({
    114: { maxCapacity: 4, name: 'Ombrellone Premium', color: '#FF6B9D' },
    115: { maxCapacity: 4, name: 'Ombrellone Standard', color: '#4ECDC4' },
    116: { maxCapacity: 3, name: 'Ombrellone Comfort', color: '#45B7D1' },
    117: { maxCapacity: 4, name: 'Ombrellone Family', color: '#96CEB4' },
    131: { maxCapacity: 4, name: 'Ombrellone VIP', color: '#FECA57' },
    132: { maxCapacity: 3, name: 'Ombrellone Relax', color: '#FF9FF3' },
    133: { maxCapacity: 4, name: 'Ombrellone Sport', color: '#54A0FF' }
  });

  // Modali
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddSport, setShowAddSport] = useState(false);
  const [showFrankieForm, setShowFrankieForm] = useState(false);
  const [showSportsSettings, setShowSportsSettings] = useState(false);
  const [showFrankieReply, setShowFrankieReply] = useState(null);
  const [showGuestModal, setShowGuestModal] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const sports = ["Beach volley", "Bocce", "Carte", "Calcio", "Tennis", "Basket"];
  const today = new Date().toISOString().split('T')[0];

  // Meteo real-time con OpenWeatherMap
  useEffect(() => {
    const fetchRealWeather = async () => {
      if (WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        // Fallback ai dati simulati se non c'è API key
        updateSimulatedWeather();
        return;
      }

      try {
        // Chiamata API OpenWeatherMap
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${SENIGALLIA_LAT}&lon=${SENIGALLIA_LON}&appid=${WEATHER_API_KEY}&units=metric&lang=it`
        );
        
        if (!response.ok) {
          throw new Error('API non disponibile');
        }
        
        const data = await response.json();
        
        // Chiamata per UV Index
        const uvResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/uvi?lat=${SENIGALLIA_LAT}&lon=${SENIGALLIA_LON}&appid=${WEATHER_API_KEY}`
        );
        
        let uvIndex = 5; // Default se UV API fallisce
        if (uvResponse.ok) {
          const uvData = await uvResponse.json();
          uvIndex = Math.round(uvData.value);
        }
        
        // Mappa condizioni meteo
          const getConditionFromAPI = (weatherMain: string) => {
          const conditionMap = {
            'Clear': 'sunny',
            'Clouds': 'cloudy',
            'Rain': 'rainy',
            'Drizzle': 'rainy',
            'Thunderstorm': 'rainy',
            'Snow': 'cloudy',
            'Mist': 'cloudy',
            'Fog': 'cloudy',
            'Haze': 'partly-cloudy'
          };
          return conditionMap[weatherMain] || 'partly-cloudy';
        };

        // Stima temperatura mare (formula approssimativa)
        const estimateSeaTemp = (airTemp) => {
          const month = new Date().getMonth() + 1;
          let seaOffset;
          if (month >= 6 && month <= 8) seaOffset = -2; // Estate: mare più fresco
          else if (month >= 9 && month <= 11) seaOffset = 1; // Autunno: mare più caldo
          else if (month >= 12 || month <= 2) seaOffset = 3; // Inverno: mare più caldo
          else seaOffset = 0; // Primavera: simile
          
          return Math.round(airTemp + seaOffset);
        };

        setWeatherData({
          temperature: Math.round(data.main.temp),
          windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
          condition: getConditionFromAPI(data.weather[0].main),
          humidity: data.main.humidity,
          uvIndex: uvIndex,
          seaTemp: estimateSeaTemp(data.main.temp),
          location: 'Senigallia, Adriatico',
          coordinates: '43.7257°N, 13.2088°E',
          lastUpdated: new Date().toLocaleTimeString(),
          isRealTime: true,
          error: null
        });

        console.log('✅ Meteo aggiornato da OpenWeatherMap');

      } catch (error) {
        console.error('❌ Errore meteo API:', error);
        setWeatherData(prev => ({
          ...prev,
          error: 'Meteo non disponibile',
          isRealTime: false,
          lastUpdated: new Date().toLocaleTimeString()
        }));
      }
    };

    const updateSimulatedWeather = () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const hour = now.getHours();
      
      let baseTemp, seaTempBase, humidityBase;
      
      if (month >= 6 && month <= 8) {
        baseTemp = 28 + Math.random() * 8;
        seaTempBase = 24 + Math.random() * 4;
        humidityBase = 60 + Math.random() * 20;
      } else if (month >= 4 && month <= 5 || month >= 9 && month <= 10) {
        baseTemp = 20 + Math.random() * 8;
        seaTempBase = 18 + Math.random() * 6;
        humidityBase = 55 + Math.random() * 25;
      } else {
        baseTemp = 8 + Math.random() * 10;
        seaTempBase = 12 + Math.random() * 6;
        humidityBase = 65 + Math.random() * 20;
      }
      
      const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 5;
      const finalTemp = Math.round(baseTemp + tempVariation);
      
      const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'windy'];
      let weatherCondition;
      
      if (month >= 6 && month <= 8) {
        weatherCondition = Math.random() > 0.8 ? conditions[Math.floor(Math.random() * conditions.length)] : 'sunny';
      } else {
        weatherCondition = conditions[Math.floor(Math.random() * conditions.length)];
      }
      
      const windSpeed = Math.round(8 + Math.random() * 15);
      const uvIndex = month >= 6 && month <= 8 ? 
        Math.round(7 + Math.random() * 3) : 
        Math.round(3 + Math.random() * 4);
      
      setWeatherData(prev => ({
        ...prev,
        temperature: finalTemp,
        windSpeed: windSpeed,
        condition: weatherCondition,
        humidity: Math.round(humidityBase),
        uvIndex: uvIndex,
        seaTemp: Math.round(seaTempBase),
        lastUpdated: new Date().toLocaleTimeString(),
        isRealTime: false,
        error: null
      }));
    };

    // Aggiorna meteo immediatamente
    fetchRealWeather();
    
    // Poi ogni 10 minuti (600000 ms)
    const interval = setInterval(fetchRealWeather, 600000);
    
    return () => clearInterval(interval);
  }, [WEATHER_API_KEY]);

  const getWeatherIcon = (condition) => {
    const icons = {
      'sunny': '☀️',
      'partly-cloudy': '⛅',
      'cloudy': '☁️',
      'windy': '💨',
      'rainy': '🌧️'
    };
    return icons[condition] || '☀️';
  };

  const getWeatherDescription = (condition) => {
    const descriptions = {
      'sunny': 'Soleggiato',
      'partly-cloudy': 'Parzialmente nuvoloso',
      'cloudy': 'Nuvoloso',
      'windy': 'Ventoso',
      'rainy': 'Piovoso'
    };
    return descriptions[condition] || 'Soleggiato';
  };

  const getUVLevel = (uvIndex) => {
    if (uvIndex <= 2) return { level: 'Basso', color: 'green', advice: 'Protezione minima' };
    if (uvIndex <= 5) return { level: 'Moderato', color: 'yellow', advice: 'Protezione consigliata' };
    if (uvIndex <= 7) return { level: 'Alto', color: 'orange', advice: 'Protezione necessaria' };
    if (uvIndex <= 10) return { level: 'Molto Alto', color: 'red', advice: 'Protezione extra' };
    return { level: 'Estremo', color: 'purple', advice: 'Evitare esposizione' };
  };

  const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
      if (password !== 'FrankieTour') {
        alert('Password non corretta');
        return;
      }
      
      const foundUser = users.find(u => u.username === username);
      if (foundUser) {
        setUser(foundUser);
        setCurrentScreen('home');
      } else {
        alert('Utente non trovato');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-rose-300 to-orange-300 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-6xl">🐷</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent mb-3">
              Pink Beach
            </h1>
            <p className="text-pink-500 text-lg font-medium">Powered by Frankie Tour</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome utente"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-400 outline-none text-lg bg-white/80"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-400 outline-none text-lg bg-white/80"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white p-4 rounded-xl font-semibold hover:from-pink-600 hover:to-orange-500 transition-all duration-300 text-lg shadow-lg"
            >
              Accedi al Beach
            </button>
          </div>
        </div>
      </div>
    );
  };

  const HomeScreen = () => {
    const todayEvents = events.filter(e => e.date === today).length;
    const myPresenceToday = userPresences[user.id] && userPresences[user.id][today];
    const unreadNotifications = notifications.filter(n => n.userId === user.id && !n.read).length;
    
    const presentToday = Object.entries(userPresences)
      .filter(([userId, dates]) => dates[today])
      .map(([userId]) => users.find(u => u.id === parseInt(userId))?.username)
      .filter(Boolean);

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-orange-200 flex items-center justify-center shadow-lg">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <p className="font-bold text-gray-800">{user.username}</p>
            <p className="text-sm text-gray-600">Benvenuto al Pink Beach</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-400 via-rose-400 to-orange-400 rounded-2xl p-6 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Ciao {user.username}! 🏖️</h2>
          <p className="opacity-90 text-lg">Benvenuto al Pink Beach</p>
          <p className="opacity-75 text-sm mt-1">📅 Oggi: {new Date().toLocaleDateString('it-IT')}</p>
          
          {/* Widget Meteo */}
          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg flex items-center">
                <span className="text-2xl mr-2">{getWeatherIcon(weatherData.condition)}</span>
                Meteo Senigallia
              </h3>
              <span className="text-xs opacity-75">Agg. {weatherData.lastUpdated}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{weatherData.temperature}°</div>
                <div className="text-xs opacity-80">Aria</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{weatherData.seaTemp}°</div>
                <div className="text-xs opacity-80">Mare</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{weatherData.windSpeed}</div>
                <div className="text-xs opacity-80">km/h vento</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">UV {weatherData.uvIndex}</div>
                <div className="text-xs opacity-80">{getUVLevel(weatherData.uvIndex).level}</div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <p className="text-sm opacity-90">{getWeatherDescription(weatherData.condition)}</p>
              <p className="text-xs opacity-75 mt-1">{getUVLevel(weatherData.uvIndex).advice}</p>
            </div>
          </div>
          
          {myPresenceToday && (
            <div className="mt-3 bg-white/20 rounded-lg p-3">
              <p className="font-semibold">✅ Presenza confermata ore {myPresenceToday}</p>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-4 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-sm opacity-80">Al mare</p>
              <p className="font-bold text-xl">{presentToday.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-sm opacity-80">Sport oggi</p>
              <p className="font-bold text-xl">{sportsActivities.filter(s => s.date === today).length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-sm opacity-80">Eventi oggi</p>
              <p className="font-bold text-xl">{todayEvents}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-sm opacity-80">Notifiche</p>
              <p className="font-bold text-xl">{unreadNotifications}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentScreen('calendar')}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Calendar className="w-8 h-8 text-pink-500 mb-3" />
            <h3 className="font-bold text-gray-800">Calendario</h3>
            <p className="text-sm text-gray-500 mt-1">Gestisci presenze</p>
          </button>

          <button
            onClick={() => setCurrentScreen('events')}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Users className="w-8 h-8 text-pink-500 mb-3" />
            <h3 className="font-bold text-gray-800">Eventi</h3>
            <p className="text-sm text-gray-500 mt-1">Cene e feste</p>
          </button>

          <button
            onClick={() => setCurrentScreen('frankie')}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <User className="w-8 h-8 text-pink-500 mb-3" />
            <h3 className="font-bold text-gray-800">Frankie</h3>
            <p className="text-sm text-gray-500 mt-1">Segnalazioni</p>
          </button>

          <button
            onClick={() => setCurrentScreen('sports')}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Trophy className="w-8 h-8 text-pink-500 mb-3" />
            <h3 className="font-bold text-gray-800">Sport</h3>
            <p className="text-sm text-gray-500 mt-1">Attività sportive</p>
          </button>
        </div>

        <button
          onClick={() => setCurrentScreen('weather')}
          className="w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-center space-x-4">
            <span className="text-4xl">{getWeatherIcon(weatherData.condition)}</span>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Meteo Dettagliato</h3>
              <p className="text-sm text-gray-500">{weatherData.temperature}° - {getWeatherDescription(weatherData.condition)}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setCurrentScreen('umbrellas')}
          className="w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🏖️</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Mappa Ombrelloni</h3>
              <p className="text-sm text-gray-500">Visualizza occupazione</p>
            </div>
          </div>
        </button>

        {user?.username === 'Sene' && (
          <button
            onClick={() => setCurrentScreen('admin')}
            className="w-full bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-3">
              <UserCog className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-bold text-orange-800">Gestione Admin</h3>
                <p className="text-sm text-orange-600">Pannello di controllo</p>
              </div>
            </div>
          </button>
        )}
      </div>
    );
  };

  const FrankieScreen = () => {
    const [newMessage, setNewMessage] = useState({
      type: 'segnalazione',
      message: '',
      urgent: false
    });
    const [replyText, setReplyText] = useState('');

    const addFrankieMessage = () => {
      if (newMessage.message.trim()) {
        const message = {
          ...newMessage,
          id: Date.now(),
          sender: user.username,
          timestamp: new Date().toLocaleString(),
          status: 'pending',
          replies: []
        };
        setFrankieMessages([...frankieMessages, message]);
        setNewMessage({ type: 'segnalazione', message: '', urgent: false });
        setShowFrankieForm(false);
        alert('Messaggio inviato a Frankie!');
      }
    };

    const addFrankieReply = (messageId) => {
      if (replyText.trim()) {
        setFrankieMessages(frankieMessages.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              status: 'replied',
              replies: [...(msg.replies || []), {
                id: Date.now(),
                text: replyText,
                sender: 'Frankie',
                timestamp: new Date().toLocaleString()
              }]
            };
          }
          return msg;
        }));
        setReplyText('');
        setShowFrankieReply(null);
        alert('Risposta di Frankie inviata!');
      }
    };

    const messageTypeLabels = {
      'segnalazione': '🚨 Segnalazione',
      'richiesta': '🙋 Richiesta',
      'complimento': '👏 Complimento',
      'suggerimento': '💡 Suggerimento'
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">🐷 Frankie</h2>
          <button onClick={() => setShowFrankieForm(true)} className="bg-pink-500 text-white p-2 rounded-lg">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-pink-400 to-orange-300 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Ciao! Sono Frankie 🐷</h3>
          <p className="text-sm opacity-90">
            Hai qualcosa da segnalarmi? Un problema, una richiesta o un complimento? 
            Scrivimi qui e ti risponderò al più presto!
          </p>
        </div>

        {frankieMessages.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="font-bold text-gray-800 mb-2">Nessun messaggio</h3>
            <p className="text-gray-600 mb-4">Non hai ancora inviato messaggi a Frankie</p>
            <button
              onClick={() => setShowFrankieForm(true)}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Scrivi a Frankie
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">Conversazione con Frankie</h3>
            {frankieMessages.map(msg => (
              <div key={msg.id} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                    {messageTypeLabels[msg.type]}
                  </span>
                  <div className="flex items-center space-x-2">
                    {msg.urgent && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        URGENTE
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <p className="text-gray-700 font-medium">{msg.sender}:</p>
                  <p className="text-gray-800">{msg.message}</p>
                </div>
                
                {msg.replies && msg.replies.map(reply => (
                  <div key={reply.id} className="bg-pink-50 rounded-lg p-3 mb-2 ml-4">
                    <p className="text-pink-700 font-medium flex items-center">
                      🐷 Frankie:
                      <span className="text-xs text-gray-500 ml-2">{reply.timestamp}</span>
                    </p>
                    <p className="text-gray-800">{reply.text}</p>
                  </div>
                ))}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Da: {msg.sender}</span>
                  <div className="flex items-center space-x-2">
                    {(user.username === 'Sene' || user.username === 'Frankie') && (
                      <button
                        onClick={() => setShowFrankieReply(msg.id)}
                        className="bg-pink-500 text-white px-3 py-1 rounded text-sm flex items-center"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Rispondi
                      </button>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      msg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      msg.status === 'replied' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {msg.status === 'pending' ? 'In attesa' : 
                       msg.status === 'replied' ? 'Risposto' : 'Visto'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showFrankieForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">Scrivi a Frankie</h3>
              <div className="space-y-4">
                <select
                  value={newMessage.type}
                  onChange={(e) => setNewMessage({...newMessage, type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="segnalazione">🚨 Segnalazione</option>
                  <option value="richiesta">🙋 Richiesta</option>
                  <option value="complimento">👏 Complimento</option>
                  <option value="suggerimento">💡 Suggerimento</option>
                </select>
                <textarea
                  placeholder="Scrivi il tuo messaggio..."
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newMessage.urgent}
                    onChange={(e) => setNewMessage({...newMessage, urgent: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Messaggio urgente</span>
                </label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowFrankieForm(false)}
                    className="flex-1 bg-gray-500 text-white p-3 rounded-lg"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={addFrankieMessage}
                    className="flex-1 bg-pink-500 text-white p-3 rounded-lg"
                  >
                    Invia
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showFrankieReply && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">🐷 Risposta di Frankie</h3>
              <textarea
                placeholder="Scrivi la risposta di Frankie..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowFrankieReply(null);
                    setReplyText('');
                  }}
                  className="flex-1 bg-gray-500 text-white p-3 rounded-lg"
                >
                  Annulla
                </button>
                <button
                  onClick={() => addFrankieReply(showFrankieReply)}
                  className="flex-1 bg-pink-500 text-white p-3 rounded-lg"
                >
                  Invia Risposta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CalendarScreen = () => {
    const [arrivalTime, setArrivalTime] = useState('09:00');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('day');
    const [selectedDate, setSelectedDate] = useState(today);

    const myPresence = userPresences[user.id] && userPresences[user.id][selectedDate];

    const addPresence = () => {
      const newPresences = { ...userPresences };
      if (!newPresences[user.id]) newPresences[user.id] = {};
      newPresences[user.id][selectedDate] = arrivalTime;
      setUserPresences(newPresences);
      alert('Presenza confermata!');
    };

    const removePresence = () => {
      const newPresences = { ...userPresences };
      if (newPresences[user.id]) {
        delete newPresences[user.id][selectedDate];
      }
      setUserPresences(newPresences);
    };

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDay = firstDay.getDay();
      
      const days = [];
      
      for (let i = startDay - 1; i >= 0; i--) {
        const prevDate = new Date(year, month, -i);
        days.push({ date: prevDate, isCurrentMonth: false });
      }
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        days.push({ date, isCurrentMonth: true });
      }
      
      while (days.length < 42) {
        const nextDate = new Date(year, month + 1, days.length - daysInMonth - startDay + 1);
        days.push({ date: nextDate, isCurrentMonth: false });
      }
      
      return days;
    };

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const hasPresence = (date) => {
      const dateStr = formatDate(date);
      return userPresences[user.id] && userPresences[user.id][dateStr];
    };

    const hasEvent = (date) => {
      const dateStr = formatDate(date);
      return events.some(e => e.date === dateStr);
    };

    const getPresentUsers = (date) => {
      const dateStr = formatDate(date);
      return Object.entries(userPresences)
        .filter(([userId, dates]) => dates[dateStr])
        .map(([userId]) => users.find(u => u.id === parseInt(userId))?.username)
        .filter(Boolean);
    };

    const navigateMonth = (direction) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + direction);
      setCurrentDate(newDate);
    };

    const monthNames = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">📅 Calendario</h2>
            <button
              onClick={() => setViewMode(viewMode === 'day' ? 'month' : 'day')}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              {viewMode === 'day' ? 'Vista Mese' : 'Vista Giorno'}
            </button>
          </div>

          {viewMode === 'month' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((dayObj, index) => {
                  const isToday = formatDate(dayObj.date) === today;
                  const isSelected = formatDate(dayObj.date) === selectedDate;
                  const hasMyPresence = hasPresence(dayObj.date);
                  const hasEventToday = hasEvent(dayObj.date);
                  const presentUsers = getPresentUsers(dayObj.date);

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(formatDate(dayObj.date))}
                      className={`
                        p-2 text-sm rounded-lg relative transition-colors min-h-12
                        ${!dayObj.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                        ${isToday ? 'bg-blue-100 font-bold border-2 border-blue-400' : ''}
                        ${isSelected ? 'bg-pink-500 text-white' : ''}
                        ${hasMyPresence ? 'border-2 border-green-500' : ''}
                        hover:bg-pink-100
                      `}
                    >
                      <div>{dayObj.date.getDate()}</div>
                      {presentUsers.length > 0 && (
                        <div className="absolute bottom-1 left-1 text-xs bg-green-500 text-white rounded px-1">
                          {presentUsers.length}
                        </div>
                      )}
                      {hasMyPresence && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      {hasEventToday && (
                        <div className="absolute top-1 left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>La mia presenza</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Eventi</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded px-1 text-white text-xs">N</div>
                  <span>Presenti</span>
                </div>
              </div>

              {getPresentUsers(new Date(selectedDate + 'T12:00:00')).length > 0 && (
                <div className="mt-4 bg-green-50 rounded-lg p-3">
                  <h4 className="font-semibold text-green-700 mb-2">
                    Presenti il {new Date(selectedDate + 'T12:00:00').toLocaleDateString('it-IT')}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getPresentUsers(new Date(selectedDate + 'T12:00:00')).map(name => (
                      <span key={name} className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const dayEvents = events.filter(e => e.date === selectedDate);
                return dayEvents.length > 0 && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-700 mb-2">
                      Eventi del {new Date(selectedDate + 'T12:00:00').toLocaleDateString('it-IT')}:
                    </h4>
                    <div className="space-y-2">
                      {dayEvents.map(event => (
                        <div key={event.id} className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-gray-800">{event.title}</h5>
                            <span className="text-sm text-blue-600 font-medium">{event.time}</span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              👥 {(event.participants?.length || 0) + (event.guests?.length || 0)} partecipanti
                            </span>
                            <span className="text-xs text-gray-500">
                              Organizzato da {event.organizer}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border-2 border-pink-200 rounded-xl mb-4"
              />

              <div className="bg-pink-50 rounded-xl p-4">
                <h3 className="font-semibold text-pink-700 mb-2">La mia presenza</h3>
                {myPresence ? (
                  <div className="space-y-2">
                    <p className="text-green-600 font-medium">
                      ✅ Confermato arrivo ore {myPresence}
                    </p>
                    <button 
                      onClick={removePresence}
                      className="w-full bg-red-500 text-white p-2 rounded-lg"
                    >
                      Rimuovi presenza
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <input 
                        type="time" 
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="border border-pink-200 rounded-lg p-2" 
                      />
                      <span className="text-sm text-gray-600">Arrivo previsto</span>
                    </div>
                    <button 
                      onClick={addPresence}
                      className="w-full bg-pink-500 text-white p-2 rounded-lg"
                    >
                      Conferma presenza
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
                  <span className="text-xl mr-2">{getWeatherIcon(weatherData.condition)}</span>
                  Meteo {selectedDate === today ? 'Oggi' : new Date(selectedDate + 'T12:00:00').toLocaleDateString('it-IT')}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold">{weatherData.temperature}°C</div>
                    <div className="text-xs text-gray-600">Aria</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{weatherData.seaTemp}°C</div>
                    <div className="text-xs text-gray-600">Mare</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">UV {weatherData.uvIndex}</div>
                    <div className="text-xs text-gray-600">{getUVLevel(weatherData.uvIndex).level}</div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {getWeatherDescription(weatherData.condition)} - {getUVLevel(weatherData.uvIndex).advice}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const EventsScreen = () => {
    const [newEvent, setNewEvent] = useState({
      title: '', date: today, time: '20:00', description: '', image: null
    });
    const [editingEvent, setEditingEvent] = useState(null);
    const [editEventData, setEditEventData] = useState({
      title: '', date: '', time: '20:00', description: '', image: null
    });
    const [showManageParticipants, setShowManageParticipants] = useState(null);
    const [localGuestName, setLocalGuestName] = useState('');

    const handleImageUpload = (event, isEdit = false) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (isEdit) {
            setEditEventData({...editEventData, image: e.target.result});
          } else {
            setNewEvent({...newEvent, image: e.target.result});
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const addEvent = () => {
      if (newEvent.title.trim()) {
        const event = { 
          ...newEvent, 
          id: Date.now(), 
          participants: [],
          organizer: user.username,
          guests: []
        };
        setEvents([...events, event]);
        setNewEvent({ title: '', date: today, time: '20:00', description: '', image: null });
        setShowAddEvent(false);
        alert('Evento creato!');
      }
    };

    const startEditEvent = (event) => {
      setEditingEvent(event.id);
      setEditEventData({
        title: event.title,
        date: event.date,
        time: event.time,
        description: event.description,
        image: event.image || null
      });
    };

    const updateEvent = () => {
      if (editEventData.title.trim()) {
        setEvents(events.map(event => {
          if (event.id === editingEvent) {
            return {
              ...event,
              title: editEventData.title,
              date: editEventData.date,
              time: editEventData.time,
              description: editEventData.description,
              image: editEventData.image
            };
          }
          return event;
        }));
        setEditingEvent(null);
        alert('Evento aggiornato!');
      }
    };

    const addGuestToEvent = (eventId) => {
      if (localGuestName.trim()) {
        setEvents(events.map(event => {
          if (event.id === eventId) {
            const newGuest = {
              name: localGuestName.trim(),
              addedBy: user.username,
              id: Date.now()
            };
            return {
              ...event,
              guests: [...(event.guests || []), newGuest]
            };
          }
          return event;
        }));
        setLocalGuestName('');
        alert(`${localGuestName.trim()} aggiunto all'evento!`);
      }
    };

    const removeParticipant = (eventId, participantName) => {
      setEvents(events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            participants: event.participants.filter(p => p !== participantName)
          };
        }
        return event;
      }));
    };

    const removeGuest = (eventId, guestId) => {
      setEvents(events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            guests: (event.guests || []).filter(g => g.id !== guestId)
          };
        }
        return event;
      }));
    };

    const leaveEvent = (eventId) => {
      setEvents(events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            participants: event.participants.filter(p => p !== user.username),
            guests: (event.guests || []).filter(g => g.addedBy !== user.username)
          };
        }
        return event;
      }));
      alert('Hai lasciato l\'evento e rimosso i tuoi ospiti!');
    };

    const joinEvent = (eventId) => {
      setEvents(events.map(event => {
        if (event.id === eventId && !event.participants.includes(user.username)) {
          return { ...event, participants: [...event.participants, user.username] };
        }
        return event;
      }));
      setShowGuestModal(eventId);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">🎉 Eventi</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowPastEvents(!showPastEvents)}
              className={`px-3 py-2 rounded-lg text-sm ${
                showPastEvents 
                  ? 'bg-gray-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {showPastEvents ? 'Nascondi Passati' : 'Mostra Passati'}
            </button>
            <button onClick={() => setShowAddEvent(true)} className="bg-pink-500 text-white p-2 rounded-lg">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-6xl mb-4">🎪</div>
            <h3 className="font-bold text-gray-800 mb-2">Nessun evento in programma</h3>
            <p className="text-gray-600 mb-4">Crea il primo evento per tutti gli ospiti del Pink Beach!</p>
            <button
              onClick={() => setShowAddEvent(true)}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Crea Evento
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events
              .filter(event => showPastEvents || new Date(event.date) >= new Date(today))
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(event => {
                const isPastEvent = new Date(event.date) < new Date(today);
                return (
                  <div key={event.id} className={`bg-white rounded-2xl p-6 shadow-lg ${isPastEvent ? 'opacity-70 border-l-4 border-gray-400' : ''}`}>
                    {event.image && (
                      <div className="mb-4">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-xl cursor-pointer hover:brightness-110 transition-all"
                          onClick={() => setZoomedImage(event.image)}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-lg">{event.title}</h4>
                        {isPastEvent && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            Terminato
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          isPastEvent 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {event.date} - {event.time}
                        </span>
                        {event.organizer === user.username && !isPastEvent && (
                          <button
                            onClick={() => startEditEvent(event)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Modifica
                          </button>
                        )}
                      </div>
                    </div>
                
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">
                        👥 {event.participants.length + (event.guests || []).length} presenti
                      </span>
                      <span className="text-sm text-gray-600">
                        Organizzato da {event.organizer}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Partecipanti:</p>
                      <div className="flex flex-wrap gap-1">
                        {event.participants.map((participant, index) => (
                          <span key={index} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                            {participant}
                          </span>
                        ))}
                        {(event.guests || []).map((guest) => (
                          <span key={guest.id} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {guest.name} <span className="text-xs opacity-70">(da {guest.addedBy})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {!isPastEvent && (
                      <div className="flex space-x-2">
                        {!event.participants.includes(user.username) && (
                          <button
                            onClick={() => joinEvent(event.id)}
                            className="flex-1 bg-green-500 text-white p-2 rounded-lg"
                          >
                            Partecipa
                          </button>
                        )}

                        {event.participants.includes(user.username) && (
                          <>
                            <button
                              onClick={() => setShowGuestModal(event.id)}
                              className="flex-1 bg-blue-500 text-white p-2 rounded-lg"
                            >
                              Aggiungi Ospiti
                            </button>
                            <button
                              onClick={() => setShowManageParticipants(event.id)}
                              className="flex-1 bg-purple-500 text-white p-2 rounded-lg"
                            >
                              Gestisci
                            </button>
                          </>
                        )}

                        {(user.username === 'Sene' || event.organizer === user.username) && event.participants.length > 0 && (
                          <button
                            onClick={() => setShowManageParticipants(event.id)}
                            className="flex-1 bg-purple-500 text-white p-2 rounded-lg"
                          >
                            Gestisci Partecipazioni
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Modal Zoom Immagine */}
        {zoomedImage && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-full max-h-full">
              <img 
                src={zoomedImage} 
                alt="Immagine ingrandita"
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Modal Gestione Partecipazioni */}
        {showManageParticipants && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">👥 Gestisci Partecipazioni</h3>
              
              {(() => {
                const event = events.find(e => e.id === showManageParticipants);
                return (
                  <div className="space-y-4">
                    {/* Partecipanti registrati */}
                    <div>
                      <h4 className="font-medium mb-2">Partecipanti Registrati:</h4>
                      <div className="space-y-2">
                        {event.participants.map((participant, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                            <span className="font-medium">{participant}</span>
                            <div className="flex space-x-2">
                              {participant === user.username && (
                                <button
                                  onClick={() => {
                                    leaveEvent(event.id);
                                    setShowManageParticipants(null);
                                  }}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  Abbandona
                                </button>
                              )}
                              {(user.username === 'Sene' && participant !== user.username) && (
                                <button
                                  onClick={() => removeParticipant(event.id, participant)}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  Rimuovi
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ospiti */}
                    {event.guests && event.guests.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Ospiti:</h4>
                        <div className="space-y-2">
                          {event.guests.map((guest) => (
                            <div key={guest.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium">{guest.name}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  (aggiunto da {guest.addedBy})
                                </span>
                              </div>
                              {(guest.addedBy === user.username || user.username === 'Sene') && (
                                <button
                                  onClick={() => removeGuest(event.id, guest.id)}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  Rimuovi
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setShowManageParticipants(null)}
                      className="w-full bg-gray-500 text-white p-3 rounded-lg"
                    >
                      Chiudi
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Modal Aggiungi Ospiti dopo partecipazione */}
        {showGuestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">🎉 Partecipazione confermata!</h3>
              <p className="text-gray-600 mb-4">Vuoi aggiungere degli ospiti a questo evento?</p>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Nome ospite"
                    value={localGuestName}
                    onChange={(e) => setLocalGuestName(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => addGuestToEvent(showGuestModal)}
                    className="bg-green-500 text-white px-4 py-3 rounded-lg"
                  >
                    Aggiungi
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    setShowGuestModal(null);
                    setLocalGuestName('');
                  }}
                  className="w-full bg-gray-500 text-white p-3 rounded-lg"
                >
                  Finito
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nuovo Evento */}
        {showAddEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Nuovo Evento</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Titolo evento"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Immagine Evento</h4>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                  />
                  {newEvent.image && (
                    <div className="mt-2">
                      <img src={newEvent.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <button 
                        onClick={() => setNewEvent({...newEvent, image: null})}
                        className="mt-1 text-red-500 text-sm"
                      >
                        Rimuovi immagine
                      </button>
                    </div>
                  )}
                </div>
                
                <textarea
                  placeholder="Descrizione (opzionale)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowAddEvent(false);
                      setNewEvent({ title: '', date: today, time: '20:00', description: '', image: null });
                    }}
                    className="flex-1 bg-gray-500 text-white p-3 rounded-lg"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={addEvent}
                    className="flex-1 bg-pink-500 text-white p-3 rounded-lg"
                  >
                    Crea Evento
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Modifica Evento */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Modifica Evento</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Titolo evento"
                  value={editEventData.title}
                  onChange={(e) => setEditEventData({...editEventData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  value={editEventData.date}
                  onChange={(e) => setEditEventData({...editEventData, date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="time"
                  value={editEventData.time}
                  onChange={(e) => setEditEventData({...editEventData, time: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Immagine Evento</h4>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                  />
                  {editEventData.image && (
                    <div className="mt-2">
                      <img src={editEventData.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <button 
                        onClick={() => setEditEventData({...editEventData, image: null})}
                        className="mt-1 text-red-500 text-sm"
                      >
                        Rimuovi immagine
                      </button>
                    </div>
                  )}
                </div>
                
                <textarea
                  placeholder="Descrizione (opzionale)"
                  value={editEventData.description}
                  onChange={(e) => setEditEventData({...editEventData, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => setEditingEvent(null)}
                    className="flex-1 bg-gray-500 text-white p-3 rounded-lg"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={updateEvent}
                    className="flex-1 bg-blue-500 text-white p-3 rounded-lg"
                  >
                    Salva Modifiche
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SportsScreen = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Sport</h2>
          <p className="text-gray-600">Sezione Sport funzionante</p>
        </div>
      </div>
    );
  };

  const WeatherScreen = () => {
    const uvLevel = getUVLevel(weatherData.uvIndex);

    const manualWeatherRefresh = async () => {
      if (WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        alert('Configura prima la API Key di OpenWeatherMap');
        return;
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${SENIGALLIA_LAT}&lon=${SENIGALLIA_LON}&appid=${WEATHER_API_KEY}&units=metric&lang=it`
        );
        
        if (!response.ok) throw new Error('API non disponibile');
        
        const data = await response.json();
        
        const uvResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/uvi?lat=${SENIGALLIA_LAT}&lon=${SENIGALLIA_LON}&appid=${WEATHER_API_KEY}`
        );
        
        let uvIndex = 5;
        if (uvResponse.ok) {
          const uvData = await uvResponse.json();
          uvIndex = Math.round(uvData.value);
        }
        
        const getConditionFromAPI = (weatherMain) => {
          const conditionMap = {
            'Clear': 'sunny', 'Clouds': 'cloudy', 'Rain': 'rainy',
            'Drizzle': 'rainy', 'Thunderstorm': 'rainy', 'Snow': 'cloudy',
            'Mist': 'cloudy', 'Fog': 'cloudy', 'Haze': 'partly-cloudy'
          };
          return conditionMap[weatherMain] || 'partly-cloudy';
        };

        const estimateSeaTemp = (airTemp) => {
          const month = new Date().getMonth() + 1;
          let seaOffset;
          if (month >= 6 && month <= 8) seaOffset = -2;
          else if (month >= 9 && month <= 11) seaOffset = 1;
          else if (month >= 12 || month <= 2) seaOffset = 3;
          else seaOffset = 0;
          return Math.round(airTemp + seaOffset);
        };

        setWeatherData({
          temperature: Math.round(data.main.temp),
          windSpeed: Math.round(data.wind.speed * 3.6),
          condition: getConditionFromAPI(data.weather[0].main),
          humidity: data.main.humidity,
          uvIndex: uvIndex,
          seaTemp: estimateSeaTemp(data.main.temp),
          location: 'Senigallia, Adriatico',
          coordinates: '43.7257°N, 13.2088°E',
          lastUpdated: new Date().toLocaleTimeString(),
          isRealTime: true,
          error: null
        });

        alert('✅ Meteo aggiornato manualmente!');

      } catch (error) {
        setWeatherData(prev => ({
          ...prev,
          error: 'Meteo non disponibile',
          isRealTime: false,
          lastUpdated: new Date().toLocaleTimeString()
        }));
        alert('❌ Errore nell\'aggiornamento meteo');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">🌤️ Meteo Senigallia</h2>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <div>
                <span className="text-sm text-gray-600 block">Agg. {weatherData.lastUpdated}</span>
                <span className="text-xs text-gray-500">{weatherData.coordinates}</span>
              </div>
              {weatherData.error && (
                <button
                  onClick={manualWeatherRefresh}
                  className="bg-orange-500 text-white p-2 rounded-lg text-xs hover:bg-orange-600"
                >
                  🔄 Riprova
                </button>
              )}
            </div>
          </div>
        </div>

        {weatherData.error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="font-bold text-red-800 mb-2">Meteo non disponibile</h3>
            <p className="text-red-600 mb-4">Impossibile recuperare i dati meteo in tempo reale</p>
            <button
              onClick={manualWeatherRefresh}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600"
            >
              🔄 Riprova Aggiornamento
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-400 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-center">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-6xl">{getWeatherIcon(weatherData.condition)}</div>
                  <div className="text-right">
                    {weatherData.isRealTime ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">🟢 LIVE</span>
                    ) : (
                      <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">📊 SIMULATO</span>
                    )}
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-2">{weatherData.temperature}°C</h3>
                <p className="text-xl opacity-90 mb-2">{getWeatherDescription(weatherData.condition)}</p>
                <p className="text-sm opacity-75 mb-4">📍 {weatherData.location}</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">{weatherData.seaTemp}°C</div>
                    <div className="text-sm opacity-80">Mare Adriatico</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">{weatherData.humidity}%</div>
                    <div className="text-sm opacity-80">Umidità</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">{weatherData.windSpeed}</div>
                    <div className="text-sm opacity-80">km/h vento</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <span className="text-2xl mr-2">☀️</span>
                Protezione Solare
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Indice UV:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xl">{weatherData.uvIndex}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium text-${uvLevel.color}-700 bg-${uvLevel.color}-100`}>
                      {uvLevel.level}
                    </span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="font-medium text-yellow-800 mb-2">Raccomandazioni:</div>
                  <div className="text-sm text-yellow-700">
                    {uvLevel.advice}
                    {weatherData.uvIndex > 7 && (
                      <div className="mt-2">
                        • Usa crema solare SPF 30+<br/>
                        • Cerca l'ombra 11:00-15:00<br/>
                        • Indossa cappello e occhiali
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const UmbrellasScreen = () => {
    const [selectedUmbrella, setSelectedUmbrella] = useState(null);
    const [editingUmbrella, setEditingUmbrella] = useState(null);
    const [newUmbrellaData, setNewUmbrellaData] = useState({ name: '', maxCapacity: 4, color: '#FF6B9D' });
    const [selectedDate, setSelectedDate] = useState(today);
    
    const getUmbrellaOccupants = (umbrellaNumber) => {
      const dateAssignments = umbrellaAssignments[selectedDate] || {};
      const occupantIds = dateAssignments[umbrellaNumber] || [];
      return occupantIds.map(id => users.find(u => u.id === id)?.username).filter(Boolean);
    };

    const assignToUmbrella = (umbrellaNumber) => {
      const currentOccupants = getUmbrellaOccupants(umbrellaNumber);
      const maxCapacity = umbrellaConfig[umbrellaNumber].maxCapacity;
      
      if (currentOccupants.length >= maxCapacity) {
        alert('Ombrellone al completo!');
        return;
      }
      
      if (currentOccupants.includes(user.username)) {
        alert('Sei già assegnato a questo ombrellone!');
        return;
      }
      
      const newAssignments = { ...umbrellaAssignments };
      if (!newAssignments[selectedDate]) newAssignments[selectedDate] = {};
      if (!newAssignments[selectedDate][umbrellaNumber]) newAssignments[selectedDate][umbrellaNumber] = [];
      
      newAssignments[selectedDate][umbrellaNumber].push(user.id);
      setUmbrellaAssignments(newAssignments);
      alert('Assegnazione completata!');
    };

    const updateUmbrella = () => {
      if (editingUmbrella && newUmbrellaData.name.trim()) {
        setUmbrellaConfig({
          ...umbrellaConfig,
          [editingUmbrella]: {
            ...umbrellaConfig[editingUmbrella],
            name: newUmbrellaData.name,
            maxCapacity: newUmbrellaData.maxCapacity,
            color: newUmbrellaData.color
          }
        });
        setEditingUmbrella(null);
        alert('Ombrellone aggiornato!');
      }
    };

    const deleteUmbrella = (umbrellaNumber) => {
      if (confirm('Sei sicuro di voler eliminare questo ombrellone?')) {
        const newConfig = { ...umbrellaConfig };
        delete newConfig[umbrellaNumber];
        setUmbrellaConfig(newConfig);
        
        // Rimuovi anche le assegnazioni
        const newAssignments = { ...umbrellaAssignments };
        Object.keys(newAssignments).forEach(date => {
          if (newAssignments[date][umbrellaNumber]) {
            delete newAssignments[date][umbrellaNumber];
          }
        });
        setUmbrellaAssignments(newAssignments);
        
        setSelectedUmbrella(null);
        setEditingUmbrella(null);
        alert('Ombrellone eliminato!');
      }
    };

    const addNewUmbrella = () => {
      const newNumber = Math.max(...Object.keys(umbrellaConfig).map(Number)) + 1;
      setUmbrellaConfig({
        ...umbrellaConfig,
        [newNumber]: {
          name: `Nuovo Ombrellone ${newNumber}`,
          maxCapacity: 4,
          color: '#FF6B9D'
        }
      });
      alert('Nuovo ombrellone aggiunto!');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">🏖️ Mappa Ombrelloni</h2>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            />
            {user.username === 'Sene' && (
              <button
                onClick={addNewUmbrella}
                className="bg-green-500 text-white p-2 rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-b from-sky-200 via-blue-200 to-yellow-200 rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-lg">🌊 MARE ADRIATICO 🌊</h3>
            <div className="w-full h-6 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 rounded-full mb-4 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-10 h-6 flex items-center justify-center">
                <div className="text-base" style={{
                  animation: 'moveSwimmer 8s linear infinite'
                }}>
                  🏊🏻‍♂️
                </div>
              </div>
              <div className="absolute top-0 left-0 w-10 h-6 flex items-center justify-center">
                <div className="text-2xl" style={{
                  animation: 'moveShark 8s linear infinite 1s',
                  transform: 'scaleX(-1)'
                }}>
                  🦈
                </div>
              </div>
              <style jsx>{`
                @keyframes moveSwimmer {
                  0% { transform: translateX(-40px) scaleX(1); }
                  100% { transform: translateX(calc(100vw - 60px)) scaleX(1); }
                }
                @keyframes moveShark {
                  0% { transform: translateX(-60px) scaleX(-1); }
                  100% { transform: translateX(calc(100vw - 80px)) scaleX(-1); }
                }
              `}</style>
            </div>
            <div className="flex justify-center space-x-4 text-sm text-gray-600 mb-4">
              <span>🏊‍♂️ Zona Nuoto</span>
              <span>🚤 Barche</span>
              <span>🐟 Pesca</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
            {Object.entries(umbrellaConfig).map(([number, config]) => {
              const occupants = getUmbrellaOccupants(parseInt(number));
              const isOccupied = occupants.length > 0;
              const isFull = occupants.length >= config.maxCapacity;
              const isMyUmbrella = occupants.includes(user.username);
              
              return (
                <div key={number} className="relative">
                  <button
                    onClick={() => setSelectedUmbrella(parseInt(number))}
                    className={`
                      w-full p-4 rounded-xl border-3 transition-all relative shadow-lg hover:shadow-xl
                      ${isMyUmbrella ? 'border-green-500 bg-green-50 scale-105' :
                        isFull ? 'border-red-500 bg-red-50' :
                        isOccupied ? 'border-orange-500 bg-orange-50' :
                        'border-gray-300 bg-white hover:border-pink-400'}
                    `}
                    style={{ backgroundColor: isOccupied ? undefined : `${config.color}80` }}
                  >
                    <div className="text-3xl mb-2">🏖️</div>
                    <div className="flex justify-center space-x-1 mb-1">
                      <span className="text-xs">🛏️</span>
                      <span className="text-xs">🛏️</span>
                    </div>
                    <div className="text-sm font-bold text-gray-800">{number}</div>
                    <div className="text-xs text-gray-600 truncate">{config.name}</div>
                    <div className="text-xs mt-1 font-semibold">
                      {occupants.length}/{config.maxCapacity}
                    </div>
                    {isMyUmbrella && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                    {user.username === 'Sene' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUmbrella(parseInt(number));
                          setNewUmbrellaData(config);
                        }}
                        className="absolute top-1 right-1 bg-blue-500 text-white rounded p-1"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {selectedUmbrella && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                Ombrellone {selectedUmbrella} - {umbrellaConfig[selectedUmbrella].name}
              </h3>
              {user.username === 'Sene' && (
                <button
                  onClick={() => deleteUmbrella(selectedUmbrella)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Elimina
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Capacità massima:</span>
                <span className="font-bold">{umbrellaConfig[selectedUmbrella].maxCapacity} persone</span>
              </div>
              
              <div>
                <span className="block mb-2">Occupanti ({selectedDate}):</span>
                <div className="flex flex-wrap gap-2">
                  {getUmbrellaOccupants(selectedUmbrella).map(name => (
                    <span key={name} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {name}
                    </span>
                  ))}
                  {getUmbrellaOccupants(selectedUmbrella).length === 0 && (
                    <span className="text-gray-500 text-sm">Nessun occupante</span>
                  )}
                </div>
              </div>
              
              {!getUmbrellaOccupants(selectedUmbrella).includes(user.username) && (
                <button
                  onClick={() => assignToUmbrella(selectedUmbrella)}
                  disabled={getUmbrellaOccupants(selectedUmbrella).length >= umbrellaConfig[selectedUmbrella].maxCapacity}
                  className="w-full bg-pink-500 text-white p-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {getUmbrellaOccupants(selectedUmbrella).length >= umbrellaConfig[selectedUmbrella].maxCapacity 
                    ? 'Ombrellone al completo' 
                    : 'Assegnami questo ombrellone'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Modifica Ombrellone */}
        {editingUmbrella && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">Modifica Ombrellone {editingUmbrella}</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome ombrellone"
                  value={newUmbrellaData.name}
                  onChange={(e) => setNewUmbrellaData({...newUmbrellaData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Capacità massima"
                  value={newUmbrellaData.maxCapacity}
                  onChange={(e) => setNewUmbrellaData({...newUmbrellaData, maxCapacity: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min="1"
                  max="10"
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Colore tema:</label>
                  <input
                    type="color"
                    value={newUmbrellaData.color}
                    onChange={(e) => setNewUmbrellaData({...newUmbrellaData, color: e.target.value})}
                    className="w-full h-12 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setEditingUmbrella(null)}
                    className="flex-1 bg-gray-500 text-white p-3 rounded-lg"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Sei sicuro di voler eliminare questo ombrellone?')) {
                        const newConfig = { ...umbrellaConfig };
                        delete newConfig[editingUmbrella];
                        setUmbrellaConfig(newConfig);
                        
                        const newAssignments = { ...umbrellaAssignments };
                        Object.keys(newAssignments).forEach(date => {
                          if (newAssignments[date][editingUmbrella]) {
                            delete newAssignments[date][editingUmbrella];
                          }
                        });
                        setUmbrellaAssignments(newAssignments);
                        
                        setSelectedUmbrella(null);
                        setEditingUmbrella(null);
                        alert('Ombrellone eliminato!');
                      }
                    }}
                    className="flex-1 bg-red-500 text-white p-3 rounded-lg"
                  >
                    Elimina
                  </button>
                  <button
                    onClick={updateUmbrella}
                    className="flex-1 bg-pink-500 text-white p-3 rounded-lg"
                  >
                    Salva
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AdminScreen = () => {
    const [newUser, setNewUser] = useState({ username: '', role: 'user', defaultUmbrella: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [editUserData, setEditUserData] = useState({ username: '', role: 'user', defaultUmbrella: '' });
    
    const addUser = () => {
      if (newUser.username.trim()) {
        const userToAdd = {
          id: Date.now(),
          username: newUser.username,
          role: newUser.role,
          defaultUmbrella: newUser.defaultUmbrella ? parseInt(newUser.defaultUmbrella) : null,
          sportsNotifications: [],
          profileImage: null
        };
        setUsers([...users, userToAdd]);
        setNewUser({ username: '', role: 'user', defaultUmbrella: '' });
        alert('Utente aggiunto!');
      }
    };

    const editUser = (userData) => {
      setEditingUser(userData.id);
      setEditUserData({
        username: userData.username,
        role: userData.role,
        defaultUmbrella: userData.defaultUmbrella || ''
      });
    };

    const saveUserChanges = () => {
      if (editUserData.username.trim()) {
        setUsers(users.map(u => {
          if (u.id === editingUser) {
            return {
              ...u,
              username: editUserData.username,
              role: editUserData.role,
              defaultUmbrella: editUserData.defaultUmbrella ? parseInt(editUserData.defaultUmbrella) : null
            };
          }
          return u;
        }));
        
        if (editingUser === user.id) {
          setUser(prev => ({
            ...prev,
            username: editUserData.username,
            role: editUserData.role,
            defaultUmbrella: editUserData.defaultUmbrella ? parseInt(editUserData.defaultUmbrella) : null
          }));
        }
        
        setEditingUser(null);
        alert('Utente aggiornato!');
      }
    };

    const deleteUser = (userId) => {
      if (userId === user.id) {
        alert('Non puoi eliminare te stesso!');
        return;
      }
      setUsers(users.filter(u => u.id !== userId));
      alert('Utente eliminato!');
    };

    const resetAllData = () => {
      if (confirm('Sei sicuro di voler resettare tutti i dati? Questa azione non può essere annullata.')) {
        setUserPresences({});
        setEvents([]);
        setSportsActivities([]);
        setFrankieMessages([]);
        setUmbrellaAssignments({});
        setNotifications([]);
        alert('Tutti i dati sono stati resettati!');
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800">👑 Pannello Admin</h2>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-lg mb-4">Aggiungi Nuovo Utente</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome utente"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="user">Utente</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={newUser.defaultUmbrella}
              onChange={(e) => setNewUser({...newUser, defaultUmbrella: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Nessun ombrellone di default</option>
              {Object.entries(umbrellaConfig).map(([number, config]) => (
                <option key={number} value={number}>
                  Ombrellone {number} - {config.name}
                </option>
              ))}
            </select>
            <button
              onClick={addUser}
              className="w-full bg-green-500 text-white p-3 rounded-lg"
            >
              Aggiungi Utente
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-lg mb-4">Utenti Registrati</h3>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                    {u.profileImage ? (
                      <img src={u.profileImage} alt="Profilo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-bold">{u.username}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      u.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                    {u.defaultUmbrella && (
                      <span className="ml-2 text-sm text-gray-600">
                        Ombrellone {u.defaultUmbrella}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => editUser(u)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Modifica
                  </button>
                  {u.id !== user.id && (
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Elimina
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4">Statistiche</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-blue-600">Utenti totali</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{events.length}</div>
                <div className="text-sm text-green-600">Eventi creati</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{sportsActivities.length}</div>
                <div className="text-sm text-orange-600">Partite sportive</div>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-pink-600">{frankieMessages.length}</div>
                <div className="text-sm text-pink-600">Messaggi Frankie</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4">Azioni Admin</h3>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentScreen('umbrellas')}
                className="w-full bg-blue-500 text-white p-3 rounded-lg"
              >
                Gestisci Ombrelloni
              </button>
              <button
                onClick={resetAllData}
                className="w-full bg-red-500 text-white p-3 rounded-lg"
              >
                Reset Tutti i Dati
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-lg mb-4">Messaggi Frankie da Gestire</h3>
          {frankieMessages.filter(msg => msg.status === 'pending').length === 0 ? (
            <p className="text-gray-600">Nessun messaggio in attesa di risposta</p>
          ) : (
            <div className="space-y-3">
              {frankieMessages.filter(msg => msg.status === 'pending').map(msg => (
                <div key={msg.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{msg.sender}</span>
                    <span className="text-sm text-gray-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{msg.message}</p>
                  <button
                    onClick={() => setShowFrankieReply(msg.id)}
                    className="bg-pink-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Rispondi come Frankie
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Modifica Utente */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">Modifica Utente</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome utente"
                  value={editUserData.username}
                  onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <select
                  value={editUserData.role}
                  onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="user">Utente</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={editUserData.defaultUmbrella}
                  onChange={(e) => setEditUserData({...editUserData, defaultUmbrella: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Nessun ombrellone di default</option>
                  {Object.entries(umbrellaConfig).map(([number, config]) => (
                    <option key={number} value={number}>
                      Ombrellone {number} - {config.name}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 bg-gray-500 text-white p-3 rounded-lg"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={saveUserChanges}
                    className="flex-1 bg-blue-500 text-white p-3 rounded-lg"
                  >
                    Salva Modifiche
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const NavigationBar = () => {
    if (currentScreen === 'login') return null;

    return (
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">🐷</span>
            </div>
            <span className="font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
              Pink Beach
            </span>
          </button>
          
          {currentScreen !== 'home' && (
            <button
              onClick={() => setCurrentScreen('home')}
              className="flex items-center space-x-1 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Home</span>
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Ciao {user?.username}!</span>
            <button
              onClick={() => {
                setUser(null);
                setCurrentScreen('login');
              }}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Esci
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen />;
      case 'home':
        return <HomeScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'events':
        return <EventsScreen />;
      case 'sports':
        return <SportsScreen />;
      case 'frankie':
        return <FrankieScreen />;
      case 'umbrellas':
        return <UmbrellasScreen />;
      case 'weather':
        return <WeatherScreen />;
      case 'admin':
        return user?.username === 'Sene' ? <AdminScreen /> : <HomeScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <NavigationBar />
      <div className={`${currentScreen !== 'login' ? 'pt-20' : ''} pb-6 px-4`}>
        {renderCurrentScreen()}
      </div>
    </div>
  );
};

export default PinkBeachApp;
