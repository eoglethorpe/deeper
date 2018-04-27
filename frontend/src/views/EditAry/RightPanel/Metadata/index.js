import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';

import { aryTemplateMetadataSelector } from '../../../../redux';
import Baksa from '../../../../components/Baksa';

import { renderWidget } from '../widgetUtils';
import Header from '../Header';
import styles from './styles.scss';

const propTypes = {
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    aryTemplateMetadata: [],
};

const mapStateToProps = state => ({
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
});

@connect(mapStateToProps)
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderMetadata = (data) => {
        const {
            fields,
            id,
            title,
        } = data;

        return (
            <div
                key={id}
                className={styles.widgetGroup}
            >
                <h4 className={styles.heading}>
                    {title}
                </h4>
                <div className={styles.content}>
                    {Object.values(fields).map(renderWidget)}
                </div>
            </div>
        );
    }

    render() {
        const { aryTemplateMetadata: metadataGroups } = this.props;

        // FIXME: use strings
        const topHeader = 'Basic Information';
        const bottomHeader = 'Additional Documents';

        const {
            pending,
        } = this.props;

        return (
            <div className={styles.metadata}>
                {pending && <LoadingAnimation large />}
                <FaramGroup faramElementName="metadata">
                    <div className={styles.basicInformation}>
                        <Header
                            title={topHeader}
                            className={styles.header}
                        />
                        <div className={styles.content}>
                            {Object.values(metadataGroups).map(this.renderMetadata)}
                        </div>
                    </div>
                </FaramGroup>
                <FaramGroup faramElementName="additionalDocuments">
                    <div className={styles.additionalDocuments}>
                        <Header
                            title={bottomHeader}
                            className={styles.header}
                        />
                        <div className={styles.content}>
                            <Baksa
                                // FIXME: use strings
                                label="Executive Summary"
                                className={styles.baksa}
                                faramElementName="executiveSummary"
                                showPageRange
                            />
                            <Baksa
                                // FIXME: use strings
                                label="Assessment Database"
                                className={styles.baksa}
                                faramElementName="assessmentData"
                                acceptUrl
                            />
                            <Baksa
                                // FIXME: use strings
                                label="Questionnaire"
                                className={styles.baksa}
                                faramElementName="questionnaire"
                                showPageRange
                            />
                        </div>
                    </div>
                </FaramGroup>
            </div>
        );
    }
}
