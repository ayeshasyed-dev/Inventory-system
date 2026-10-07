import React from 'react';

const StatsCard = ({ title, value, subtext, icon: Icon, color = '#3b82f6', trend }) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: color,
          opacity: 0.12,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            {value}
          </div>
        </div>

        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: `rgba(${color.startsWith('#') ? parseInt(color.slice(1,3), 16) + ',' + parseInt(color.slice(3,5), 16) + ',' + parseInt(color.slice(5,7), 16) : '59, 130, 246'}, 0.15)`,
            border: `1px solid ${color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>

      {subtext && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {trend && (
            <span style={{ color: trend > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
