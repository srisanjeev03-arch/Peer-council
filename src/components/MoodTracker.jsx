import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './MoodTracker.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MOODS = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: '#4caf50' },
  { value: 'calm', label: 'Calm', emoji: '😌', color: '#2196f3' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: '#ff9800' },
  { value: 'stressed', label: 'Stressed', emoji: '😫', color: '#f44336' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: '#9e9e9e' },
  { value: 'confused', label: 'Confused', emoji: '😕', color: '#795548' },
  { value: 'overwhelmed', label: 'Overwhelmed', emoji: '😵', color: '#e91e63' },
  { value: 'hopeful', label: 'Hopeful', emoji: '🌟', color: '#ffd700' },
];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState('');
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadMoodEntries();
  }, []);

  const loadMoodEntries = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMoodEntries(data || []);
    } catch (error) {
      console.error('Error loading mood entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('mood_entries')
        .insert([
          {
            user_id: user.id,
            mood: selectedMood,
            intensity,
            notes: notes.trim(),
          },
        ]);

      if (error) throw error;

      setSelectedMood('');
      setIntensity(3);
      setNotes('');
      loadMoodEntries();
    } catch (error) {
      console.error('Error saving mood entry:', error);
      alert('Failed to save mood entry');
    } finally {
      setLoading(false);
    }
  };

  const getMoodData = () => {
    const last7Days = moodEntries.slice(-7);

    return {
      labels: last7Days.map((entry) =>
        new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Mood Intensity',
          data: last7Days.map((entry) => entry.intensity),
          borderColor: '#d81b60',
          backgroundColor: 'rgba(216, 27, 96, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const entry = moodEntries.slice(-7)[context.dataIndex];
            return `${entry.mood}: ${entry.intensity}/5`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const getMoodDistribution = () => {
    const distribution = {};
    moodEntries.forEach((entry) => {
      distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
    });
    return distribution;
  };

  const moodDistribution = getMoodDistribution();
  const mostCommonMood = Object.keys(moodDistribution).reduce((a, b) =>
    moodDistribution[a] > moodDistribution[b] ? a : b
  , '');

  return (
    <div className="mood-tracker">
      <div className="mood-tracker-header">
        <h2>Mood Tracker</h2>
        <p>Track your emotional patterns over time</p>
      </div>

      <form onSubmit={handleSubmit} className="mood-form">
        <h3>How are you feeling today?</h3>
        <div className="mood-grid">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              className={`mood-button ${selectedMood === mood.value ? 'active' : ''}`}
              onClick={() => setSelectedMood(mood.value)}
              style={{
                borderColor: selectedMood === mood.value ? mood.color : '#f0f0f0',
              }}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <>
            <div className="intensity-selector">
              <label>Intensity: {intensity}/5</label>
              <input
                type="range"
                min="1"
                max="5"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
              />
              <div className="intensity-labels">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Intense</span>
              </div>
            </div>

            <div className="notes-section">
              <label htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's contributing to this mood?"
                rows="3"
              />
            </div>

            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Mood Entry'}
            </button>
          </>
        )}
      </form>

      {moodEntries.length > 0 && (
        <>
          <div className="mood-stats">
            <div className="stat-card">
              <h4>Total Entries</h4>
              <p className="stat-value">{moodEntries.length}</p>
            </div>
            <div className="stat-card">
              <h4>Most Common</h4>
              <p className="stat-value">
                {MOODS.find((m) => m.value === mostCommonMood)?.emoji || ''}{' '}
                {mostCommonMood}
              </p>
            </div>
            <div className="stat-card">
              <h4>This Week</h4>
              <p className="stat-value">{moodEntries.slice(-7).length}</p>
            </div>
          </div>

          <div className="mood-chart">
            <h3>Last 7 Days</h3>
            <div className="chart-container">
              <Line data={getMoodData()} options={chartOptions} />
            </div>
          </div>

          <div className="mood-history">
            <h3>Recent Entries</h3>
            <div className="history-list">
              {moodEntries
                .slice()
                .reverse()
                .slice(0, 10)
                .map((entry) => {
                  const mood = MOODS.find((m) => m.value === entry.mood);
                  return (
                    <div key={entry.id} className="history-item">
                      <div className="history-icon" style={{ color: mood?.color }}>
                        {mood?.emoji}
                      </div>
                      <div className="history-details">
                        <div className="history-mood">
                          {mood?.label} - Intensity {entry.intensity}/5
                        </div>
                        {entry.notes && (
                          <div className="history-notes">{entry.notes}</div>
                        )}
                        <div className="history-date">
                          {new Date(entry.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
