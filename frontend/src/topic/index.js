import React from 'react';
import {
    Bundle,
} from '../public/components/General';

const views = {
    login: () => (
        <Bundle load={() => import('./Authentication/views/Login')} />
    ),
    register: () => (
        <Bundle load={() => import('./Authentication/views/Register')} />
    ),

    homeScreen: () => (
        <Bundle load={() => import('./HomeScreen/views')} />
    ),
    dashboard: () => (
        <Bundle load={() => import('./Dashboard/views')} />
    ),

    leads: () => (
        <Bundle load={() => import('./Leads/views/Leads')} />
    ),
    addLeads: () => (
        <Bundle load={() => import('./Leads/views/LeadAdd')} />
    ),

    entries: () => (
        <Bundle load={() => import('./Entries/views/')} />
    ),
    editEntries: () => (
        <Bundle load={() => import('./Entries/views/EditEntryView')} />
    ),

    ary: () => (
        <Bundle load={() => import('./Ary/views/')} />
    ),

    export: () => (
        <Bundle load={() => import('./Export/views/')} />
    ),

    projects: () => (
        <Bundle load={() => import('./Project/views')} />
    ),

    userProfile: () => (
        <Bundle load={() => import('./UserProfile/views/')} />
    ),

    userGroup: () => (
        <Bundle load={() => import('./UserGroup/views/')} />
    ),

    weeklySnapshot: () => (
        <Bundle load={() => import('./WeeklySnapshot/views')} />
    ),

    countries: () => (
        <Bundle load={() => import('./Country/views')} />
    ),

    analysisFramework: () => (
        <Bundle load={() => import('./AnalysisFramework/views/')} />
    ),

    categoryEditor: () => (
        <Bundle load={() => import('./CategoryEditor/views/')} />
    ),

    apiDocs: () => (
        <Bundle load={() => import('./ApiDocs/views')} />
    ),

    fourHundredFour: () => (
        <Bundle load={() => import('./FourHundredFour/views')} />
    ),
};

export default views;
