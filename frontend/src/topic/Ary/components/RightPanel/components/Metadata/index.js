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
    NumberInput,
} from '../../../../../../public/components/Input';

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
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div className={styles['meta-data']}>
                <div className={styles.overview}>
                    <div className={styles.background}>
                        <h3 className={styles.heading}>
                            Background
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            label="Crisis Type"
                            className={styles['background-child']}
                        />
                        <DateInput
                            label="Crisis Start Date"
                        />
                        <SelectInput
                            showHintAndError={false}
                            label="Preparedness"
                            className={styles['background-child']}
                        />
                        <SelectInput
                            showHintAndError={false}
                            label="External Support"
                            className={styles['background-child']}
                        />
                        <SelectInput
                            showHintAndError={false}
                            label="Coordination"
                            className={styles['background-child']}
                        />
                        <NumberInput
                            showHintAndError={false}
                            label="Cost"
                            className={styles['background-child']}
                        />
                    </div>
                    <div className={styles.stakeholders}>
                        <h3 className={styles.heading}>
                            Stakeholders
                        </h3>
                        <TextInput
                            showHintAndError={false}
                            label="Lead"
                            className={styles['stakeholders-child']}
                        />
                        <TextInput
                            showHintAndError={false}
                            label="Partners"
                            className={styles['stakeholders-child']}
                        />
                        <TextInput
                            showHintAndError={false}
                            label="Government"
                            className={styles['stakeholders-child']}
                        />
                        <TextInput
                            showHintAndError={false}
                            label="Donors"
                            className={styles['stateholders-child']}
                        />
                    </div>
                    <div className={styles.dates}>
                        <h3 className={styles.heading}>
                            Dates
                        </h3>
                        <DateInput
                            showHintAndError={false}
                            label="Start Date"
                            className={styles['dates-child']}
                        />
                        <DateInput
                            showHintAndError={false}
                            label="End Date"
                            className={styles['dates-child']}
                        />
                        <DateInput
                            showHintAndError={false}
                            label="Publication Date"
                            className={styles['dates-child']}
                        />
                    </div>
                    <div className={styles.status}>
                        <h3 className={styles.heading}>
                            Status
                        </h3>
                        <SelectInput
                            showHintAndError={false}
                            label="Status"
                            className={styles['status-child']}
                        />
                        <SelectInput
                            showHintAndError={false}
                            label="Frequency"
                            className={styles['status-child']}
                        />
                        <SelectInput
                            showHintAndError={false}
                            label="Confidentiality"
                            className={styles['status-child']}
                        />
                    </div>
                </div>
                <div className={styles.structure}>
                    <h3 className={styles.heading}>
                        Structure Section
                    </h3>
                    <div
                        className={styles.kobo}
                    >
                        Drag and Drop data here or use KOBO link
                    </div>
                    <div
                        className={styles.questionnaire}
                    >
                        Drag and Drop Questionnaire here or select page to cut
                    </div>
                    <div
                        className={styles.documents}
                    >
                        Drag and Drop other documents here
                    </div>
                </div>
            </div>
        );
    }
}
