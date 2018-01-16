import update from '../../../public/utils/immutable-update';
import { randomString } from '../../../public/utils/common';

// TYPE

export const SET_LEAD_VISUALIZATION = 'domain-data/VISUALIZATION/LEAD';
export const SET_LEAD_VISUALIZATION_STALE = 'domain-data/VISUALIZATION/LEAD/STALE';

// ACTION-CREATOR

export const setLeadVisualizationAction = ({ data }) => ({
    type: SET_LEAD_VISUALIZATION,
    data,
});

export const setLeadVisualizationStaleAction = () => ({
    type: SET_LEAD_VISUALIZATION_STALE,
});

// UTILS
const getHierarchialTopic = (keywords) => {
    const topic = keywords.reduce((acc, keyword) => {
        if (keyword[1] > acc.size && isNaN(parseInt(keyword[0], 10))) {
            acc.name = keyword[0];
            acc.size = Math.round(keyword[1] * 100);
        }
        return acc;
    }, { name: '', size: 0, subtopics: [] });
    return topic;
};

const getHierarchialData = (data) => {
    const keywords = data.keywords;

    if (keywords) {
        const subtopics = data.subtopics;
        const topic = getHierarchialTopic(keywords, subtopics);

        if (subtopics && subtopics.length > 0) {
            topic.size = undefined;

            topic.children = Object.values(subtopics).map(subtopic => (
                getHierarchialData(subtopic)
            )).filter(f => f.size > 0);
        }
        return topic;
    }

    return Object.values(data).map(d => (
        getHierarchialData(d)
    )).filter(f => f.size > 0);
};

// REDUCER

const setLeadVisualization = (state, action) => {
    const {
        data,
    } = action;

    const settings = {
        visualization: { $auto: {
            stale: {
                $set: false,
            },
            hierarchialData: { $auto: {
                children: { $autoArray: {
                    $set: getHierarchialData(data),
                } },
            } },
        } },
    };
    return update(state, settings);
};

const setLeadVisualizationStale = (state) => {
    const settings = {
        visualization: { $auto: {
            stale: {
                $set: randomString(4),
            },
        } },
    };
    return update(state, settings);
};


// REDUCER MAP

const reducers = {
    [SET_LEAD_VISUALIZATION]: setLeadVisualization,
    [SET_LEAD_VISUALIZATION_STALE]: setLeadVisualizationStale,
};
export default reducers;
