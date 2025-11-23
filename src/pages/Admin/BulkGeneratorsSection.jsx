// src/pages/Admin/BulkGeneratorsSection.jsx
// Bulk Generators section for Admin Console

import React from 'react';
import BulkUsersGenerator from '../../components/Admin/BulkGenerators/BulkUsersGenerator';
import BulkCheckinsGenerator from '../../components/Admin/BulkGenerators/BulkCheckinsGenerator';

const BulkGeneratorsSection = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk Users Generator */}
        <BulkUsersGenerator />

        {/* Bulk Check-ins Generator */}
        <BulkCheckinsGenerator />
      </div>
    </div>
  );
};

export default BulkGeneratorsSection;
