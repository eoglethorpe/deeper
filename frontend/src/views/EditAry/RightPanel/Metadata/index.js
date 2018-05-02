import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import ListView from '../../../../vendor/react-store/components/View/List/ListView';

import {
    aryTemplateMetadataSelector,
    assessmentMetadataStringsSelector,
} from '../../../../redux';
import Baksa from '../../../../components/Baksa';

import { renderWidget } from '../widgetUtils';
import Header from '../Header';
import styles from './styles.scss';

const propTypes = {
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool.isRequired,
    assessmentMetadataStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    aryTemplateMetadata: [],
};

const mapStateToProps = state => ({
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
    assessmentMetadataStrings: assessmentMetadataStringsSelector(state),
});

@connect(mapStateToProps)
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderMetadata = (k, data) => {
        const {
            fields,
            id,
            title,
        } = data;

        const fieldValues = Object.values(fields);
        return (
            <div
                key={id}
                className={styles.widgetGroup}
            >
                <h4 className={styles.heading}>
                    {title}
                </h4>
                <ListView
                    className={styles.content}
                    data={fieldValues}
                    modifier={renderWidget}
                />
            </div>
        );
    }

    render() {
        const {
            aryTemplateMetadata: metadataGroups,
            pending,
            assessmentMetadataStrings,
        } = this.props;

        const basicInformationTitle = assessmentMetadataStrings('basicInformationTitle');
        const additionalDocumentsTitle = assessmentMetadataStrings('additionalDocumentsTitle');

        const metadataGroupValues = Object.values(metadataGroups);

        return (
            <div className={styles.metadata}>
                <FaramGroup faramElementName="metadata">
                    {pending && <LoadingAnimation large />}
                    <FaramGroup faramElementName="basicInformation">
                        <div className={styles.basicInformation}>
                            <Header
                                title={basicInformationTitle}
                                className={styles.header}
                            />
                            <ListView
                                className={styles.content}
                                data={metadataGroupValues}
                                modifier={this.renderMetadata}
                            />
                        </div>
                    </FaramGroup>
                    <FaramGroup faramElementName="additionalDocuments">
                        <div className={styles.additionalDocuments}>
                            <Header
                                title={additionalDocumentsTitle}
                                className={styles.header}
                            />
                            <div className={styles.content}>
                                <Baksa
                                    label={assessmentMetadataStrings('executiveSummaryTitle')}
                                    className={styles.baksa}
                                    faramElementName="executiveSummary"
                                    showPageRange
                                />
                                <Baksa
                                    label={assessmentMetadataStrings('assessmentDatabaseTitle')}
                                    className={styles.baksa}
                                    faramElementName="assessmentData"
                                    acceptUrl
                                />
                                <Baksa
                                    label={assessmentMetadataStrings('questionnaireTitle')}
                                    className={styles.baksa}
                                    faramElementName="questionnaire"
                                    showPageRange
                                />
                            </div>
                        </div>
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }
}
