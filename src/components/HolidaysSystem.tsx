import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Holidays System Component
 * Step 323 - Add holidays support with themed content and celebrations
 */

export type Holiday = {
  id: string;
  name: string;
  date: { month: number; day: number };
  description: string;
  traditions: string[];
  vocabulary: string[];
  exercises: HolidayExercise[];
  theme: { colors: string[]; icon: string };
  celebrated: boolean;
};

export type HolidayExercise = {
  id: string;
  holidayId: string;
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export const holidays: Holiday[] = [
  {
    id: 'new-year',
    name: "New Year's Day",
    date: { month: 0, day: 1 },
    description: 'Celebrating the start of a new year',
    traditions: ['countdown', 'fireworks', 'resolutions', 'celebration'],
    vocabulary: ['countdown', 'celebration', 'midnight', 'fireworks', 'resolution', 'party', 'cheers', 'toast'],
    exercises: [],
    theme: { colors: ['#FFD700', '#FF6B6B'], icon: '🎉' },
    celebrated: false,
  },
  {
    id: 'valentines',
    name: "Valentine's Day",
    date: { month: 1, day: 14 },
    description: 'Day of love and friendship',
    traditions: ['cards', 'flowers', 'chocolates', 'hearts'],
    vocabulary: ['love', 'heart', 'friendship', 'kindness', 'caring', 'valentine', 'roses', 'chocolate'],
    exercises: [],
    theme: { colors: ['#FF1744', '#FF4081'], icon: '💝' },
    celebrated: false,
  },
  {
    id: 'earth-day',
    name: 'Earth Day',
    date: { month: 3, day: 22 },
    description: 'Celebrating and protecting our planet',
    traditions: ['planting trees', 'recycling', 'conservation'],
    vocabulary: ['earth', 'environment', 'recycle', 'nature', 'planet', 'trees', 'conservation', 'green'],
    exercises: [],
    theme: { colors: ['#4CAF50', '#8BC34A'], icon: '🌍' },
    celebrated: false,
  },
  {
    id: 'halloween',
    name: 'Halloween',
    date: { month: 9, day: 31 },
    description: 'Spooky fun and costumes',
    traditions: ['costumes', 'candy', 'trick-or-treat', 'pumpkins'],
    vocabulary: ['costume', 'candy', 'pumpkin', 'spooky', 'Halloween', 'trick-or-treat', 'autumn', 'October'],
    exercises: [],
    theme: { colors: ['#FF6B00', '#6A1B9A'], icon: '🎃' },
    celebrated: false,
  },
  {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    date: { month: 10, day: 23 },
    description: 'Giving thanks and sharing',
    traditions: ['feast', 'turkey', 'gratitude', 'family gathering'],
    vocabulary: ['thankful', 'gratitude', 'feast', 'turkey', 'family', 'harvest', 'November', 'blessing'],
    exercises: [],
    theme: { colors: ['#FF9800', '#8D6E63'], icon: '🦃' },
    celebrated: false,
  },
  {
    id: 'christmas',
    name: 'Christmas',
    date: { month: 11, day: 25 },
    description: 'Season of giving and joy',
    traditions: ['gifts', 'tree', 'decorations', 'Santa'],
    vocabulary: ['gift', 'joy', 'tree', 'Santa', 'holiday', 'decorations', 'December', 'celebration'],
    exercises: [],
    theme: { colors: ['#F44336', '#4CAF50'], icon: '🎄' },
    celebrated: false,
  },
];

const HolidaysSystem: React.FC = () => {
  
  const [upcomingHolidays, setUpcomingHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    // Find upcoming holidays
    const now = new Date();
    const upcoming = holidays
      .map((holiday) => {
        const holidayDate = new Date(now.getFullYear(), holiday.date.month, holiday.date.day);
        if (holidayDate < now) {
          holidayDate.setFullYear(now.getFullYear() + 1);
        }
        const daysUntil = Math.floor((holidayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { ...holiday, daysUntil };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    setUpcomingHolidays(upcoming as Holiday[]);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🎊 Holiday Celebrations</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Learn typing with holiday-themed content</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {upcomingHolidays.map((holiday: any) => (
          <motion.div
            key={holiday.id}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '2px solid #e0e0e0',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>
              {holiday.theme.icon}
            </div>
            <h3 style={{ margin: '0 0 8px 0', textAlign: 'center' }}>{holiday.name}</h3>
            <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '15px' }}>
              {holiday.description}
            </p>
            {holiday.daysUntil !== undefined && (
              <div style={{ 
                padding: '8px', 
                backgroundColor: '#E3F2FD', 
                borderRadius: '8px', 
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#1976D2'
              }}>
                {holiday.daysUntil === 0 ? 'Today!' : `In ${holiday.daysUntil} days`}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HolidaysSystem;
