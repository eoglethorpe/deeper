import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    aryStringsSelector,
} from '../../../../redux';


import SelectInput from '../../../../vendor/react-store/components/Input/SelectInput';
import DateInput from '../../../../vendor/react-store/components/Input/DateInput';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import NumberInput from '../../../../vendor/react-store/components/Input/NumberInput';

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
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div className={styles['meta-data']}>
                <div className={styles.overview}>
                    <div className={styles.background}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('backgroundLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            label={this.props.aryStrings('crisisTypeLabel')}
                            className={styles['background-child']}
                        />
                        <DateInput
                            label={this.props.aryStrings('crisisStartDateLabel')}
                        />
                        <SelectInput
                            showHintAndError={false}
                            label={this.props.aryStrings('preparednessLabel')}
                            className={styles['background-child']}
                        />
                        <SelectInput
                            showHintAndError={false}
                            label={this.props.aryStrings('externalSupportLabel')}
                            className={styles['background-child']}
                        />
                        <SelectInput
                            showHintAndError={false}
                            label={this.props.aryStrings('coordinationLabel')}
                            className={styles['background-child']}
                        />
                        <NumberInput
                            showHintAndError={false}
                            label={this.props.aryStrings('costLabel')}
                            className={styles['background-child']}
                        />
                    </div>
                    <div className={styles.stakeholders}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('stakeholdersLabel')}
                        </h3>
                        <TextInput
                            showHintAndError={false}
                            label={this.props.aryStrings('leadLabel')}
                            className={styles['stakeholders-child']}
                        />
                        <TextInput
                            showHintAndError={false}
                            label={this.props.aryStrings('partnersLabel')}
                            className={styles['stakeholders-child']}
                        />
                        <TextInput
                            showHintAndError={false}
                            label={this.props.aryStrings('governmentLabel')}
                            className={styles['stakeholders-child']}
                        />
                        <TextInput
                            showHintAndError={false}
                            label={this.props.aryStrings('donorsLabel')}
                            className={styles['stateholders-child']}
                        />
                    </div>
                    <div className={styles.dates}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('datesLabel')}
                        </h3>
                        <DateInput
                            showHintAndError={false}
                            label={this.props.aryStrings('startDateLabel')}
                            className={styles['dates-child']}
                        />
                        <DateInput
                            showHintAndError={false}
                            label={this.props.aryStrings('endDateLabel')}
                            className={styles['dates-child']}
                        />
                        <DateInput
                            showHintAndError={false}
                            label={this.props.aryStrings('publicationDateLabel')}
                            className={styles['dates-child']}
                        />
                    </div>
                    <div className={styles.status}>
                        <h3 className={styles.heading}>
                            {this.props.aryStrings('statusLabel')}
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            label={this.props.aryStrings('statusLabel')}
                            className={styles['status-child']}
                        />
                        <SelectInput
                            showHintAndError={false}
                            label={this.props.aryStrings('frequencyLabel')}
                            className={styles['status-child']}
                        />
                        <SelectInput
                            showHintAndError={false}
                            label={this.props.aryStrings('confidentialityLabel')}
                            className={styles['status-child']}
                        />
                    </div>
                </div>
                <div className={styles.structure}>
                    <h3 className={styles.heading}>
                        {this.props.aryStrings('structureSectionLabel')}
                    </h3>
                    <div
                        className={styles.kobo}
                    >
                        {this.props.aryStrings('dragKoboLabel')}
                    </div>
                    <div
                        className={styles.questionnaire}
                    >
                        {this.props.aryStrings('dragQuestionLabel')}
                    </div>
                    <div
                        className={styles.documents}
                    >
                        {this.props.aryStrings('dragDocumentLabel')}
                    </div>
                </div>
            </div>
        );
    }
}
