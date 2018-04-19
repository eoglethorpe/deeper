import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import iconNames from '../../../../constants/iconNames';
import List from '../../../../vendor/react-store/components/View/List';

import ScaleInput from './ScaleInput';
import ScaleMatrixInput from './ScaleMatrixInput';
import styles from './styles.scss';

const propTypes = {
};
const defaultProps = {
};

export default class Score extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.scores = {
            fitForPurpose: {
                title: 'Fit for purpose',
                fields: {
                    relivance: {
                        title: 'Relivance',
                        detail: 'Results answers the original research questions or objectives, bring new or additional information and fill previous information gaps',
                    },
                    comprehensiveness: {
                        title: 'Comprehensiveness',
                        detail: 'Results cover all affected geographical areas, groups and sectors',
                    },
                    timeliness: {
                        title: 'Timeliness',
                        detail: 'Results were available on time to inform decision-making',
                    },
                    granularity: {
                        title: 'Granularity',
                        detail: 'Results are available at least for two levels of breakdown (sector/sub sector, Admin2/3, Affected groups level 2/3, etc.) and are broken down by relevant categories of analysis (sex, age, urban/rural, Conflict/no conflict, etc.)',
                    },
                    comparability: {
                        title: 'Comparability',
                        detail: 'Results uses or contributes to Common Operational Datasets',
                    },
                },
            },
            trustworthiness: {
                title: 'Trustworthiness',
                fields: {
                    sourceReliability: {
                        title: 'Source reliability',
                        detail: 'Authors of the reports are reliable (Track record for accuracy, technical expertise, motive for bias)',
                    },
                    methods: {
                        title: 'Methods',
                        detail: 'Methodology used is following golden standards/official guidelines and uses an analysis framework and plan',
                    },
                    triangulation: {
                        title: 'Triangulation',
                        detail: 'Efforts were made to use different methods and independent sources and triangulate results',
                    },
                    inclusiveness: {
                        title: 'Inclusiveness',
                        detail: 'Opinions from population and assessment teams were captured and contrasted',
                    },
                },
            },
            analyticalRigor: {
                title: 'Analytical rigor',
                fields: {
                    assumption: {
                        title: 'Assumptions',
                        detail: 'Key assumptions, information gaps and alternative explanations or inconsistencies are identified, clearly communicated and caveated',
                    },
                    corroboration: {
                        title: 'Corroboration',
                        detail: 'Results are corroborated and convergent across different independent sources',
                    },
                    structuredAnalyticalTechniques: {
                        title: 'Structured analytical techniques',
                        detail: 'At least one structured analytical technique was used for each analytical level',
                    },
                },
            },
            analyticalWriting: {
                title: 'Analytical writing',
                fields: {
                    bluf: {
                        title: 'BLUF',
                        detail: 'Results are articulated using a clear line of analysis and “Bottom Line Up Front”',
                    },
                    uncertainityCommunicatoin: {
                        title: 'Uncertainity communicatoin',
                        detail: 'Levels of confidence in estimates are available as well as reasons for uncertainty',
                    },
                    graphicalAdequity: {
                        title: 'Graphical adequity',
                        detail: 'Charts, tables and maps are used to illustrate results in a compelling and efficient way',
                    },
                    documentedDataAndMethod: {
                        title: 'Documented data and method',
                        detail: 'Data, evidence and tools supporting judgments are available, documented and clearly sourced',
                    },
                },
            },
        };

        this.options = {
            0: {
                title: 'Not reliable',
                color: 'rgba(0, 0, 255, .4)',
            },
            1: {
                title: 'Maybe',
                color: 'rgba(0, 0, 255, .5)',
            },
            2: {
                title: 'Fairly',
                color: 'rgba(0, 0, 255, .66)',
            },
            3: {
                title: 'Reliable',
                color: 'rgba(0, 0, 255, .79',
            },
            4: {
                title: 'Completely',
                color: 'rgba(0, 0, 255, .9)',
            },
        };

        this.matrixRows = [
            { id: 1, title: 'Whoa' },
            { id: 2, title: 'lol' },
            { id: 3, title: 'xD' },
        ];

        this.matrixColumns = [
            { id: 1, title: 'Nice' },
            { id: 2, title: 'No idea' },
        ];

        this.matrixOptions = {
            1: {
                1: {
                    id: 1,
                    score: 1,
                    color: 'rgba(0, 0, 255, .9)',
                },
                2: {
                    id: 2,
                    score: 1,
                    color: 'rgba(0, 0, 255, .9)',
                },
            },
            2: {
                1: {
                    id: 3,
                    score: 1,
                    color: 'rgba(0, 0, 255, .9)',
                },
                2: {
                    id: 4,
                    score: 2,
                    color: 'rgba(128, 0, 255, .6)',
                },
            },
            3: {
                1: {
                    id: 5,
                    score: 2,
                    color: 'rgba(128, 0, 255, .6)',
                },
                2: {
                    id: 6,
                    score: 3,
                    color: 'rgba(255, 0, 255, .9)',
                },
            },
        };
    }

    getClassName = () => {
        const className = styles.score;
        return className;
    }

    renderHeader = (k, data) => (
        <th
            className={styles.heading}
            key={data}
        >
            {data}
        </th>
    )

    renderSubRows = (key, data) => {
        const {
            title,
            detail,
        } = data;

        const iconClassName = [
            styles.infoIcon,
            iconNames.info,
        ].join(' ');

        return (
            <tr
                key={key}
                className={styles.row}
            >
                <td className={styles.cell}>
                    <div className={styles.content}>
                        <div className={styles.title}>
                            { title }
                        </div>
                        {
                            detail && (
                                <span
                                    title={detail}
                                    className={iconClassName}
                                />
                            )
                        }
                    </div>
                </td>
                <td className={styles.cell}>
                    <ScaleInput
                        options={this.options}
                    />
                </td>
            </tr>
        );
    }

    renderRow = (k, rowKey) => {
        const {
            fields,
            title,
        } = this.scores[rowKey];

        const subRows = Object.values(fields);
        const keys = Object.keys(fields);

        return (
            <React.Fragment key={rowKey}>
                <tr className={styles.headerRow}>
                    <td
                        className={styles.pillarTitle}
                        colSpan="2"
                    >
                        { title }
                    </td>
                </tr>
                <List
                    data={subRows}
                    modifier={this.renderSubRows}
                    keyExtractor={(d, i) => keys[i]}
                />
            </React.Fragment>
        );
    }

    renderSummaryItem = (k, key) => (
        <div
            className={styles.item}
            key={key}
        >
            { this.scores[key].title }
        </div>
    )

    render() {
        const className = this.getClassName();
        // const columns = ['', 'Score'];
        const scoreList = Object.keys(this.scores);

        return (
            <div className={className}>
                <div className={styles.summary}>
                    <List
                        data={scoreList}
                        modifier={this.renderSummaryItem}
                    />
                </div>
                <div className={styles.content}>
                    <div className={styles.left}>
                        <table className={styles.table}>
                            <tbody className={styles.body}>
                                {
                                    <List
                                        data={scoreList}
                                        modifier={this.renderRow}
                                    />
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className={styles.right}>
                        <ScaleMatrixInput
                            rows={this.matrixRows}
                            columns={this.matrixColumns}
                            options={this.matrixOptions}
                            value={3}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

