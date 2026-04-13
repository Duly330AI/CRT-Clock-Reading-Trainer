import React from 'react';
import { TimeState } from '../utils/timeLogic';

interface ClockProps {
  time: TimeState;
  size?: number;
}

export const Clock: React.FC<ClockProps> = ({ time, size = 240 }) => {
  const { hour, minute } = time;
  
  // Calculate angles
  const minuteAngle = minute * 6;
  const hourAngle = (hour % 12) * 30 + (minute / 60) * 30;

  const center = size / 2;
  const radius = size * 0.45;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Clock Face */}
        <circle cx={center} cy={center} r={radius} fill="white" stroke="#e5e7eb" strokeWidth="8" />
        
        {/* Clock Numbers */}
        {[...Array(12)].map((_, i) => {
          const num = i + 1;
          const angle = (num * 30 - 90) * (Math.PI / 180);
          const x = center + radius * 0.75 * Math.cos(angle);
          const y = center + radius * 0.75 * Math.sin(angle);
          
          return (
            <text
              key={num}
              x={x}
              y={y}
              fill="#374151"
              fontSize={size * 0.1}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {num}
            </text>
          );
        })}

        {/* Minute Ticks */}
        {[...Array(60)].map((_, i) => {
          if (i % 5 === 0) return null; // Skip hour marks
          const angle = (i * 6 - 90) * (Math.PI / 180);
          const x1 = center + radius * 0.9 * Math.cos(angle);
          const y1 = center + radius * 0.9 * Math.sin(angle);
          const x2 = center + radius * 0.95 * Math.cos(angle);
          const y2 = center + radius * 0.95 * Math.sin(angle);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#d1d5db"
              strokeWidth="2"
            />
          );
        })}

        {/* Hour Hand */}
        <line
          x1={center}
          y1={center}
          x2={center + radius * 0.5 * Math.cos((hourAngle - 90) * (Math.PI / 180))}
          y2={center + radius * 0.5 * Math.sin((hourAngle - 90) * (Math.PI / 180))}
          stroke="#1f2937"
          strokeWidth="6"
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />

        {/* Minute Hand */}
        <line
          x1={center}
          y1={center}
          x2={center + radius * 0.7 * Math.cos((minuteAngle - 90) * (Math.PI / 180))}
          y2={center + radius * 0.7 * Math.sin((minuteAngle - 90) * (Math.PI / 180))}
          stroke="#3b82f6"
          strokeWidth="4"
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />

        {/* Center Dot */}
        <circle cx={center} cy={center} r="6" fill="#1f2937" />
        <circle cx={center} cy={center} r="2" fill="#3b82f6" />
      </svg>
    </div>
  );
};
