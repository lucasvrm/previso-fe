// src/components/admin/DataManagement.jsx
// Data management component combining data generation and cleanup for admins

import React, { useRef } from 'react';
import DataGenerator from '../DataGenerator';
import DangerZone from '../Admin/DangerZone';
import ExportData from '../Admin/ExportData';
import TestPatientFlag from '../Admin/TestPatientFlag';

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
      {/* First Row: Data Generation and Danger Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataGenerator />
        <DangerZone onCleanupSuccess={handleCleanupSuccess} />
      </div>

      {/* Second Row: Export Data and Test Patient Flag */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExportData />
        <TestPatientFlag />
      </div>
    </div>
  );
};

export default DataManagement;
