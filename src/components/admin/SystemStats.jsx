// src/components/admin/SystemStats.jsx
// System statistics dashboard component for admins

import React, { useRef } from 'react';
import DataStats from '../Admin/DataStats';
import EnhancedStats from '../Admin/EnhancedStats';

const SystemStats = () => {
  const dataStatsRef = useRef(null);

  return (
    <div className="w-full space-y-6" data-testid="system-stats-page">
      {/* Enhanced Statistics Grid */}
      <EnhancedStats />
      
      {/* Original Basic Stats */}
      <DataStats ref={dataStatsRef} />
    </div>
  );
};

export default SystemStats;
