import update from '../../../public/utils/immutable-update';

// TYPE

export const SET_LEAD_VISUALIZATION = 'domain-data/VISUALIZATION/LEAD';

// ACTION-CREATOR

export const setLeadVisualizationAction = ({ data }) => ({
    type: SET_LEAD_VISUALIZATION,
    data,
});

// UTILS
const getHierarchialData = (data) => {
    const keywords = data.keywords;

    if (keywords) {
        const topic = keywords.reduce((acc, keyword) => {
            if (keyword[1] > acc.size && isNaN(parseInt(keyword[0], 10))) {
                acc.name = keyword[0];
                acc.size = Math.round(keyword[1] * 100);
            }
            return acc;
        }, { name: '', size: 0, subtopics: [] });

        const subtopics = data.subtopics;
        if (subtopics) {
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

    const hierarchialData = getHierarchialData(data);
    console.warn(hierarchialData);

    const settings = {
        visualization: { $auto: {
            hierarchialData: { $auto: {
                children: { $autoArray: {
                    $set: hierarchialData,
                } },
            } },
        } },
    };
    return update(state, settings);
};


// REDUCER MAP

const reducers = {
    [SET_LEAD_VISUALIZATION]: setLeadVisualization,
};
export default reducers;
