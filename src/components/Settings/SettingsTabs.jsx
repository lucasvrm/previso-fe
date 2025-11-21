// src/components/Settings/SettingsTabs.jsx
// Tab navigation component for settings page

import React from 'react';

const SettingsTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <nav className="flex gap-2 border-b border-border overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap
              ${activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground'
              }
            `}
            data-testid={`settings-tab-${tab.id}`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

export default SettingsTabs;
