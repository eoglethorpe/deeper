import React from 'react';

import RouteSynchronizer from '../components/RouteSynchronizer';

const importers = {
    login: () => import('./Login'),
    register: () => import('./Register'),
    passwordReset: () => import('./PasswordReset'),

    homeScreen: () => import('./HomeScreen'),
    dashboard: () => import('./Dashboard'),
    categoryEditor: () => import('./CategoryEditor'),
    arys: () => import('./Arys/'),
    editAry: () => import('./EditAry'),
    userProfile: () => import('./UserProfile'),
    userGroup: () => import('./UserGroup'),
    weeklySnapshot: () => import('./WeeklySnapshot'),
    userExports: () => import('./UserExports'),
    export: () => import('./Export'),
    countries: () => import('./Country'),
    projects: () => import('./Project'),
    analysisFramework: () => import('./AnalysisFramework'),
    entries: () => import('./Entries/'),
    editEntries: () => import('./EditEntry'),
    leads: () => import('./Leads'),
    leadsViz: () => import('./LeadsViz'),
    addLeads: () => import('./LeadAdd'),

    apiDocs: () => import('./ApiDocs'),
    fourHundredFour: () => import('./FourHundredFour'),
    browserExtension: () => import('./BrowserExtension'),
    stringManagement: () => import('./StringManagement'),
};

const views = Object.keys(importers).reduce(
    (acc, key) => {
        const importer = importers[key];
        acc[key] = props => (
            <RouteSynchronizer
                {...props}
                load={importer}
            />
        );
        return acc;
    },
    {},
);

export default views;
