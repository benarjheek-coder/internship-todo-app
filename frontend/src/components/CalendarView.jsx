import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameDay, isToday,
  isSameMonth, format, isPast
} from 'date-fns';

const PRIORITY_DOT = { High: '#FF5500', Medium: '#CAFF00', Low: '#60a5fa' };

export default function CalendarView({ tasks }) {
  const [current, setCurrent] = useState(new Date());

  const monthStart  = startOfMonth(current);
  const monthEnd    = endOfMonth(current);
  const calStart    = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd      = endOfWeek(monthEnd,    { weekStartsOn: 1 });

  const weeks = [];
  let day = calStart;
  while (day <= calEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const tasksOnDay = (d) =>
    tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), d));

  const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div className="glass-panel p-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrent(subMonths(current, 1))}
          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black uppercase tracking-wider">
          {format(current, 'MMMM yyyy')}
        </h2>
        <button onClick={() => setCurrent(addMonths(current, 1))}
          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-black uppercase tracking-widest text-white/25 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((d, di) => {
              const dayTasks = tasksOnDay(d);
              const inMonth  = isSameMonth(d, current);
              const today    = isToday(d);
              return (
                <div key={di}
                  className={`min-h-[76px] p-1.5 rounded-xl transition-all ${inMonth ? 'hover:bg-white/[0.04]' : 'opacity-30'}`}
                  style={{ border: today ? '1px solid #CAFF00' : '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span className={`block text-xs font-black mb-1 text-center w-6 h-6 rounded-full leading-6 mx-auto ${today ? 'bg-[#CAFF00] text-black' : 'text-white/50'}`}>
                    {format(d, 'd')}
                  </span>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 2).map(t => {
                      const overdue = isPast(new Date(t.dueDate)) && t.status !== 'Completed';
                      return (
                        <div key={t._id}
                          className="w-full text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate"
                          style={{
                            background: t.status === 'Completed' ? 'rgba(202,255,0,0.15)' : overdue ? 'rgba(255,85,0,0.2)' : 'rgba(255,255,255,0.08)',
                            color: t.status === 'Completed' ? '#CAFF00' : overdue ? '#FF5500' : 'rgba(255,255,255,0.8)',
                            borderLeft: `2px solid ${PRIORITY_DOT[t.priority] || '#CAFF00'}`
                          }}
                        >
                          {t.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <div className="text-[10px] text-white/30 font-bold text-center">+{dayTasks.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
