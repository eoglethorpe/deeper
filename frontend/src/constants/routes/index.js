import React from 'react';
import RouteSynchronizer from '../../components/RouteSynchronizer';
import {
    allLinksWithProjectDisabled,
    noLinks,
    allLinks,
    mapObjectToObject,
    mapObjectToArray,
} from './links';

export const ROUTE = {
    exclusivelyPublic: 'exclusively-public',
    public: 'public',
    private: 'private',
};

export const routes = {
    // NOTE: Do not remove the immediate line
    // 'adminPanel': {}, pageTitleStrings('adminPanel');

    browserExtension: {
        order: 0,
        type: ROUTE.private,
        path: '/browser-extension/',
        loader: () => import('../../views/BrowserExtension'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('browserExtension');

    login: {
        order: 10,
        type: ROUTE.exclusivelyPublic,
        redirectTo: '/',
        path: '/login/',
        hideNavbar: true,
        loader: () => import('../../views/Login'),
        links: noLinks,
    }, // pageTitleStrings('login');

    register: {
        order: 11,
        type: ROUTE.exclusivelyPublic,
        redirectTo: '/',
        path: '/register/',
        loader: () => import('../../views/Register'),
        hideNavbar: true,
        links: noLinks,
    }, // pageTitleStrings('register');

    passwordReset: {
        order: 12,
        type: ROUTE.exclusivelyPublic,
        redirectTo: '/',
        path: '/password-reset/',
        loader: () => import('../../views/PasswordReset'),
        hideNavbar: true,
        links: noLinks,
    }, // pageTitleStrings('passwordReset');

    projects: {
        order: 20,
        type: ROUTE.private,
        path: '/projects/:projectId?/',
        loader: () => import('../../views/Project'),
        links: allLinks,
    }, // pageTitleStrings('projects');

    dashboard: {
        order: 21,
        type: ROUTE.private,
        path: '/projects/:projectId/dashboard/',
        loader: () => import('../../views/Dashboard'),
        links: allLinks,
    }, // pageTitleStrings('dashboard');

    connectors: {
        order: 22,
        type: ROUTE.private,
        path: '/connectors/:connectorId?/',
        loader: () => import('../../views/Connector'),
        links: allLinks,
    }, // pageTitleStrings('connectors');

    leads: {
        order: 30,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/',
        loader: () => import('../../views/Leads'),
        links: allLinks,
    }, // pageTitleStrings('leads');

    leadsViz: {
        order: 31,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/viz',
        loader: () => import('../../views/LeadsViz'),
        links: allLinks,
    }, // pageTitleStrings('leadsViz');

    addLeads: {
        order: 32,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/add/',
        loader: () => import('../../views/LeadAdd'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('addLeads');

    entries: {
        order: 40,
        type: ROUTE.private,
        path: '/projects/:projectId/entries/',
        loader: () => import('../../views/Entries/'),
        links: allLinks,
    }, // pageTitleStrings('entries');

    editEntries: {
        order: 41,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/:leadId/edit-entries/',
        loader: () => import('../../views/EditEntry'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('editEntries');

    arys: {
        order: 50,
        type: ROUTE.private,
        path: '/projects/:projectId/arys/',
        loader: () => import('../../views/Arys/'),
        links: allLinks,
    }, // pageTitleStrings('arys');

    editAry: {
        order: 51,
        type: ROUTE.private,
        path: '/projects/:projectId/leads/:leadId/edit-ary/',
        loader: () => import('../../views/EditAry'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('editAry');

    export: {
        order: 60,
        type: ROUTE.private,
        path: '/projects/:projectId/export/',
        loader: () => import('../../views/Export'),
        links: allLinks,
    }, // pageTitleStrings('export');

    userExports: {
        order: 61,
        type: ROUTE.private,
        path: '/projects/:projectId/exports/',
        loader: () => import('../../views/UserExports'),
        links: allLinks,
    }, // pageTitleStrings('userExports');

    countries: {
        order: 70,
        type: ROUTE.private,
        path: '/countries/:countryId?/',
        loader: () => import('../../views/Country'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('countries');

    userProfile: {
        order: 80,
        type: ROUTE.private,
        path: '/user/:userId/',
        loader: () => import('../../views/UserProfile'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('userProfile');

    userGroup: {
        order: 90,
        type: ROUTE.private,
        path: '/user-group/:userGroupId/',
        loader: () => import('../../views/UserGroup'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('userGroup');

    analysisFramework: {
        order: 100,
        type: ROUTE.private,
        path: '/analysis-framework/:analysisFrameworkId/',
        loader: () => import('../../views/AnalysisFramework'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('analysisFramework');

    categoryEditor: {
        order: 110,
        type: ROUTE.private,
        path: '/category-editor/:categoryEditorId/',
        loader: () => import('../../views/CategoryEditor'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('categoryEditor');

    weeklySnapshot: {
        order: 120,
        type: ROUTE.private,
        path: '/weekly-snapshot/',
        loader: () => import('../../views/WeeklySnapshot'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('weeklySnapshot');

    apiDocs: {
        order: 130,
        type: ROUTE.private,
        path: '/api-docs/',
        loader: () => import('../../views/ApiDocs'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('apiDocs');

    homeScreen: {
        order: 140,
        type: ROUTE.private,
        path: '/',
        loader: () => import('../../views/HomeScreen'),
        links: allLinks,
    }, // pageTitleStrings('homeScreen');

    stringManagement: {
        order: 150,
        type: ROUTE.private,
        path: '/string-management/',
        loader: () => import('../../views/StringManagement'),
        links: allLinksWithProjectDisabled,
    }, // pageTitleStrings('stringManagement');

    fourHundredFour: {
        order: 990,
        type: ROUTE.public,
        path: undefined,
        loader: () => import('../../views/FourHundredFour'),
        hideNavbar: true,
        links: noLinks,
    }, // pageTitleStrings('fourHundredFour');
};

export const pathNames = mapObjectToObject(routes, route => route.path);
export const validLinks = mapObjectToObject(routes, route => route.links);
export const hideNavbar = mapObjectToObject(routes, route => !!route.hideNavbar);
export const routesOrder = mapObjectToArray(routes, (route, key) => ({ key, order: route.order }))
    .sort((a, b) => a.order - b.order)
    .map(row => row.key);
export const views = mapObjectToObject(
    routes,
    (route, name) => props => (
        <RouteSynchronizer {...props} load={route.loader} name={name} />
    ),
);
