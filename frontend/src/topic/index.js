import React from 'react';
import {
    Bundle,
} from '../public/components/General';

const importers = {
    login: () => import('./Authentication/views/Login'),
    register: () => import('./Authentication/views/Register'),

    homeScreen: () => import('./HomeScreen/views'),
    dashboard: () => import('./Dashboard/views'),

    leads: () => import('./Leads/views/Leads'),
    addLeads: () => import('./Leads/views/LeadAdd'),

    entries: () => import('./Entries/views/'),
    editEntries: () => import('./Entries/views/EditEntryView'),

    ary: () => import('./Ary/views/'),

    export: () => import('./Export/views/'),

    projects: () => import('./Project/views'),

    userProfile: () => import('./UserProfile/views/'),

    userGroup: () => import('./UserGroup/views/'),

    weeklySnapshot: () => import('./WeeklySnapshot/views'),

    countries: () => import('./Country/views'),

    analysisFramework: () => import('./AnalysisFramework/views/'),

    categoryEditor: () => import('./CategoryEditor/views/'),

    apiDocs: () => import('./ApiDocs/views'),

    fourHundredFour: () => import('./FourHundredFour/views'),
};

const views = Object.keys(importers).reduce(
    (acc, key) => {
        const importer = importers[key];
        acc[key] = () => <Bundle load={importer} />;
        return acc;
    },
    {},
);

export default views;
