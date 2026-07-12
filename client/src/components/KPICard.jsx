import React from 'react';

const KPICard = ({ title, value, footer, icon }) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="kpi-title">{title}</span>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      {footer && <div className="kpi-footer">{footer}</div>}
    </div>
  );
};

export default KPICard;
