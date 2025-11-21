// src/components/admin/DataManagement.jsx
// Data management component combining data generation and cleanup for admins

import React, { useRef } from 'react';
import DataGenerator from '../DataGenerator';
import DataCleanup from '../Admin/DataCleanup';
import DataStats from '../Admin/DataStats';

const DataManagement = () => {
  const dataStatsRef = useRef(null);

  const handleCleanupSuccess = () => {
    // Trigger refresh of DataStats component if needed
    if (dataStatsRef.current && typeof dataStatsRef.current.refresh === 'function') {
      dataStatsRef.current.refresh();
    }
  };

  return (
    <div className="w-full space-y-4" data-testid="data-management-page">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data Generator Tool */}
        <DataGenerator />

        {/* Data Cleanup Tool - Spans full width on desktop */}
        <div className="md:col-span-2">
          <DataCleanup onCleanupSuccess={handleCleanupSuccess} />
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
