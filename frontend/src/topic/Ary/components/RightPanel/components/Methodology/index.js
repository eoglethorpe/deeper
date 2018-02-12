import CSSModules from 'react-css-modules';
import React from 'react';
import { connect } from 'react-redux';

import {
    aryStringsSelector,
} from '../../../../../../common/redux';


import {
    SelectInput,
    DateInput,
    TextInput,
} from '../../../../../../public/components/Input';
import {
    TransparentPrimaryButton,
} from '../../../../../../public/components/Action';

import RegionMap from '../../../../../../common/components/RegionMap';

import { iconNames } from '../../../../../../common/constants';

import styles from './styles.scss';

const propTypes = {
    // entryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    aryStrings: aryStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Methodology extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            defaultScaleUnit: [],
        };
    }

    handleAddQuestionButtonClick = () => {
        // this.addQuestion();
    }
    render() {
        return (
            <div className={styles.methodology}>
                <div className={styles.overview}>
                    <div className={styles.technique}>
                        <h3 className={styles.heading}>
                            Collection Technique
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['technique-child']}
                        />
                    </div>
                    <div className={styles.sampling}>
                        <h3 className={styles.heading}>
                            Sampling
                        </h3>
                        <TextInput
                            showHintAndError={false}
                            label="Approach"
                            className={styles['sampling-child']}
                        />
                        <TextInput
                            showHintAndError={false}
                            label="Size"
                            className={styles['sampling-child']}
                        />
                    </div>
                    <div className={styles.proximity}>
                        <h3 className={styles.heading}>
                            Proximity
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['proximity-child']}
                        />
                    </div>
                    <div className={styles.unit}>
                        <h3 className={styles.heading}>
                            Unit of Analysis
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['unit-child']}
                        />
                    </div>
                    <div className={styles.disaggregation}>
                        <h3 className={styles.heading}>
                            Disaggregation
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['disaggregation-child']}
                        />
                    </div>
                    <div className={styles.questions}>
                        <div className={styles.heading}>
                            <h3>
                                Questions
                            </h3>
                            <TransparentPrimaryButton
                                iconName={iconNames.add}
                                onClick={this.handleAddQuestionButtonClick}
                            />
                        </div>
                        <div className={styles['questions-list']}>
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles['questions-child']}
                            />
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles['questions-child']}
                            />
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles['questions-child']}
                            />
                            <TextInput
                                showHintAndError={false}
                                label="Question #1"
                                className={styles['questions-child']}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.middle}>
                    <div className={styles['topics-assessed']}>
                        <h3 className={styles.heading}>
                            Topics Assessed
                        </h3>
                    </div>
                    <div className={styles['affected-groups']}>
                        <h3 className={styles.heading}>
                            Affected Groups
                        </h3>
                    </div>
                    <div className={styles.location}>
                        <h3 className={styles.heading}>
                            Location
                        </h3>
                        <div
                            className={styles['map-container']}
                        >
                            <RegionMap regionId={155} />
                        </div>
                    </div>
                </div>
                <div className={styles.structure}>
                    <h3 className={styles.heading}>
                        Structure Section
                    </h3>
                    <div
                        className={styles['collection-technique']}
                    >
                        Drag and Drop data collection techniques here
                    </div>
                    <div
                        className={styles['sampling-data']}
                    >
                        Drag and Drop Sampling (site and respondent selection) here
                    </div>
                    <div
                        className={styles.limitations}
                    >
                        Drag and Drop limitations here
                    </div>
                </div>
            </div>
        );
    }
}
