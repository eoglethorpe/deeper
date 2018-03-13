import {
    POST,
    commonHeaderForPostExternal,
    p,
} from '../config/rest';

const deeplEndPoint = 'https://deepl.togglecorp.com';
export const urlForNer = `${deeplEndPoint}/api/ner/`;
export const urlForFeedback = `${deeplEndPoint}/api/v2/recommendation/`;

export const createParamsForNer = text => ({
    method: POST,
    headers: commonHeaderForPostExternal,
    body: JSON.stringify({
        text,
    }),
});

const isProjectTest = (project) => {
    if (project.title === 'Board Demo') {
        return true;
    }
    return false;
};

export const urlForLeadClassify = `${deeplEndPoint}/api/v2/classify/`;

// export const urlForLeadTopicModeling = `${deeplEndPoint}/api/topic-modeling/`;
// export const urlForLeadTopicCorrelation = `${deeplEndPoint}/api/subtopics/correlation/`;
// export const urlForLeadNerDocsId = `${deeplEndPoint}/api/ner-docs/`;
// export const urlForLeadKeywordCorrelation = `${deeplEndPoint}/api/keywords/correlation/`;

export const createUrlForLeadTopicModeling = (project, isFilter) =>
    `${deeplEndPoint}/api/topic-modeling/?test=${isProjectTest(project)}&filter=${isFilter}`;
export const createUrlForLeadTopicCorrelation = (project, isFilter) =>
    `${deeplEndPoint}/api/subtopics/correlation/?test=${isProjectTest(project)}&filter=${isFilter}`;
export const createUrlForLeadNerDocsId = (project, isFilter) =>
    `${deeplEndPoint}/api/ner-docs/?test=${isProjectTest(project)}&filter=${isFilter}`;
export const createUrlForLeadKeywordCorrelation = (project, isFilter) =>
    `${deeplEndPoint}/api/keywords/correlation/?test=${isProjectTest(project)}&filter=${isFilter}`;

export const createParamsForLeadClassify = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createParamsForFeedback = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createParamsForLeadTopicModeling = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createParamsForLeadTopicCorrelation = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createParamsForLeadNer = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createParamsForLeadKeywordCorrelation = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createUrlForGoogleViewer = docUrl =>
    `https://drive.google.com/viewerng/viewer?${p({
        url: docUrl,
        pid: 'explorer',
        efh: false,
        a: 'v',
        chrome: false,
        embedded: true,
    })}`;
