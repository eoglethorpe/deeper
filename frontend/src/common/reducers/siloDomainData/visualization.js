import update from '../../../public/utils/immutable-update';
// import { randomString } from '../../../public/utils/common';

// TYPE

export const SET_LEAD_VISUALIZATION = 'domain-data/VISUALIZATION/LEAD';
// export const SET_LEAD_VISUALIZATION_STALE = 'domain-data/VISUALIZATION/LEAD/STALE';

// ACTION-CREATOR

export const setLeadVisualizationAction = ({ projectId, hierarchial, correlation, geoPoints }) => ({
    type: SET_LEAD_VISUALIZATION,
    projectId,
    hierarchial,
    correlation,
    geoPoints,
});

/*
export const setLeadVisualizationStaleAction = () => ({
    type: SET_LEAD_VISUALIZATION_STALE,
});
*/

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

const getHierarchialData = (hierarchial = {}) => {
    const keywords = hierarchial.keywords;

    if (!keywords) {
        return Object.values(hierarchial).map(d => (
            getHierarchialData(d)
        )).filter(f => f.size === undefined || f.size > 0);
    }

    const subtopics = hierarchial.subtopics;
    const topic = getHierarchialTopic(keywords, subtopics);
    const children = getHierarchialData(subtopics);

    if (children && children.length > 0) {
        topic.size = undefined;
        topic.children = children;
    }

    return topic;
};

const getCorrelationData = (correlation, scale = 1) => {
    const labels = Object.keys(correlation);
    const values = [];

    labels.forEach(label => (
        values.push(labels.map(l => scale * correlation[label][l]))
    ));

    return {
        labels,
        values,
    };
};

const getForceDirectedData = (correlation) => {
    const labels = Object.keys(correlation);
    const links = [];

    const nodes = labels.map(c => ({
        id: c, group: 0,
    }));

    labels.forEach(label => (
        links.push(...labels.map(l => ({
            source: label,
            target: l,
            value: correlation[label][l],
        })).filter(l => l.value > 0.8)) // TODO: threshold
    ));

    return { nodes, links };
};

const getGeoPointsData = (geoPoints) => {
    const points = [];
    geoPoints.forEach((p) => {
        const { info } = p;
        const geometry = info.geometry;
        if (geometry) {
            const { lat, lng } = geometry.location;
            points.push({
                title: info.formatted_address || p.name,
                coordinates: [lng, lat],
            });
        }
    });
    return points;
};

// REDUCER

const setLeadVisualization = (state, action) => {
    const {
        hierarchial,
        correlation,
        geoPoints,
        projectId,
    } = action;

    const settings = {
        visualization: {
            [projectId]: { $auto: {
                stale: {
                    $set: false,
                },
            } },
        },
    };

    if (hierarchial) {
        settings.visualization[projectId].$auto.hierarchialData = {
            $auto: {
                children: { $autoArray: {
                    $set: getHierarchialData(hierarchial),
                } },
            },
        };
    }

    if (correlation) {
        settings.visualization[projectId].$auto = {
            ...settings.visualization[projectId].$auto,
            correlationData: {
                $auto: { $set: getCorrelationData(correlation) },
            },
            chordData: {
                $auto: { $set: getCorrelationData(correlation, 100) },
            },
            forceDirectedData: {
                $auto: { $set: getForceDirectedData(correlation) },
            },
            /*
            barData: {
                $auto: getCorrelationData(correlation),
            },
            */
        };
    }

    if (geoPoints) {
        settings.visualization[projectId].$auto.geoPointsData = { $auto: {
            points: { $autoArray: {
                $set: getGeoPointsData(geoPoints),
            } },
        } };
    }

    return update(state, settings);
};

/*
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
*/


// REDUCER MAP

const reducers = {
    [SET_LEAD_VISUALIZATION]: setLeadVisualization,
    // [SET_LEAD_VISUALIZATION_STALE]: setLeadVisualizationStale,
};
export default reducers;
