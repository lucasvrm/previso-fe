// src/components/Settings/SettingsSection.jsx
// Reusable settings section component with optional icon

import React from 'react';

const SettingsSection = ({ icon: Icon, title, description, children }) => {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;
