// @ts-ignore
'use client'

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

  // API key per meteo real-time
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
        updateSimulatedWeather();
        return;
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${SENIGALLIA_LAT}&lon=${SENIGALLIA_LON}&appid=${WEATHER_API_KEY}&units=metric&lang=it`
        );
        
        if (!response.ok) {
          throw new Error('API non disponibile');
        }
        
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

    fetchRealWeather();
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
