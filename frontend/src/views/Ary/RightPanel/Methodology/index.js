import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    aryStringsSelector,
} from '../../../../redux';

import SelectInput from '../../../../vendor/react-store/components/Input/SelectInput';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button';

import RegionMap from '../../../../components/RegionMap';

import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    aryStrings: PropTypes.func.isRequired,
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
                            {this.props.aryStrings('collectionTechniqueLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['technique-child']}
                        />
                    </div>
                    <div className={styles.sampling}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('samplingLabel')}
                        </h3>
                        <TextInput
                            showHintAndError={false}
                            label={this.props.aryStrings('approachLabel')}
                            className={styles['sampling-child']}
                        />
                        <TextInput
                            showHintAndError={false}
                            label={this.props.aryStrings('sizeLabel')}
                            className={styles['sampling-child']}
                        />
                    </div>
                    <div className={styles.proximity}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('proximityLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['proximity-child']}
                        />
                    </div>
                    <div className={styles.unit}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('unitOfAnalysisLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['unit-child']}
                        />
                    </div>
                    <div className={styles.disaggregation}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('disaggregationLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            className={styles['disaggregation-child']}
                        />
                    </div>
                    <div className={styles.questions}>
                        <div className={styles.heading}>
                            <h3>
                                {this.props.aryStrings('questionsLabel')}
                            </h3>
                            <PrimaryButton
                                iconName={iconNames.add}
                                onClick={this.handleAddQuestionButtonClick}
                                transparent
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
                            {this.props.aryStrings('topicAssessedLabel')}
                        </h3>
                    </div>
                    <div className={styles['affected-groups']}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('affectedGroupsLabel')}
                        </h3>
                    </div>
                    <div className={styles.location}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('locationLabel')}
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
                        {this.props.aryStrings('structureSectionLabel')}
                    </h3>
                    <div
                        className={styles['collection-technique']}
                    >
                        {this.props.aryStrings('dragDataCollectionlabel')}
                    </div>
                    <div
                        className={styles['sampling-data']}
                    >
                        {this.props.aryStrings('dragSamplingLabel')}
                    </div>
                    <div
                        className={styles.limitations}
                    >
                        {this.props.aryStrings('dragLimitationsLabel')}
                    </div>
                </div>
            </div>
        );
    }
}
