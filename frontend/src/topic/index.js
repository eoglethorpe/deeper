import React from 'react';

import RouteSynchronizer from '../common/components/RouteSynchronizer';

const importers = {
    login: () => import('./Authentication/views/Login'),
    register: () => import('./Authentication/views/Register'),
    passwordReset: () => import('./Authentication/views/PasswordReset'),

    homeScreen: () => import('./HomeScreen/views'),
    dashboard: () => import('./Dashboard/views'),

    leads: () => import('./Leads/views/Leads'),
    addLeads: () => import('./Leads/views/LeadAdd'),

    entries: () => import('./Entries/views/'),
    editEntries: () => import('./Entries/views/EditEntryView'),

    ary: () => import('./Ary/views/'),
    // editAry: () => import(''),

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
