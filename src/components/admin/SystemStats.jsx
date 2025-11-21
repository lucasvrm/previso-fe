// src/components/admin/SystemStats.jsx
// System statistics dashboard component for admins

import React, { useRef } from 'react';
import DataStats from '../Admin/DataStats';

const SystemStats = () => {
  const dataStatsRef = useRef(null);

  return (
    <div className="w-full" data-testid="system-stats-page">
      <DataStats ref={dataStatsRef} />
    </div>
  );
};

export default SystemStats;
