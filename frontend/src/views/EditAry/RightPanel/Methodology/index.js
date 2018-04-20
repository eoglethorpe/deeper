import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import FaramList from '../../../../vendor/react-store/components/Input/Faram/FaramList';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import List from '../../../../vendor/react-store/components/View/List';
import TextArea from '../../../../vendor/react-store/components/Input/TextArea';
import CheckGroup from '../../../../vendor/react-store/components/Input/CheckGroup';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';

import { iconNames } from '../../../../constants';

import {
    aryTemplateMethodologySelector,
    assessmentSectorsSelector,
    focusesSelector,
    affectedGroupsSelector,

    projectDetailsSelector,
    geoOptionsForProjectSelector,
} from '../../../../redux';

import OrganigramWithList from '../../../../components/OrganigramWithList/';
import GeoListInput from '../../../../components/GeoListInput/';

import { renderWidget } from '../widgetUtils';
import styles from './styles.scss';

const propTypes = {
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    aryTemplateMethodology: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    focuses: PropTypes.arrayOf(PropTypes.object).isRequired,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.arrayOf(PropTypes.object).isRequired,
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
    aryTemplateMethodology: [],
    geoOptions: {},
};

const mapStateToProps = (state, props) => ({
    affectedGroups: affectedGroupsSelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
    focuses: focusesSelector(state),
    geoOptions: geoOptionsForProjectSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
    sectors: assessmentSectorsSelector(state),
});

@connect(mapStateToProps)
export default class Methodology extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderAttributeHeader = (key) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const methodologyGroup = attributesTemplate[key];

        return (
            <div
                className={styles.title}
                key={methodologyGroup.id}
            >
                {methodologyGroup.title}
            </div>
        );
    };

    renderAttribute = (index, key) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const methodologyGroup = attributesTemplate[key];

        return (
            <div
                key={key}
                className={styles.cell}
            >
                <FaramGroup faramElementName={String(index)}>
                    {methodologyGroup.fields.map(renderWidget)}
                </FaramGroup>
            </div>
        );
    }

    renderAttributeRow = (key, attribute, index) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;

        return (
            <div
                key={index}
                className={styles.row}
            >
                {
                    Object.keys(attributesTemplate)
                        .map(k => this.renderAttribute(index, k))
                }
                <div className={styles.actionButtons}>
                    <DangerButton
                        iconName={iconNames.delete}
                        faramAction="remove"
                        faramElementIndex={index}
                    />
                </div>
            </div>
        );
    }

    render() {
        const {
            aryTemplateMethodology: attributesTemplate,
            sectors,
            focuses,
            affectedGroups,
            projectDetails,
            geoOptions,
        } = this.props;

        // FIXME: use strings
        const focusesTitle = 'Focuses';
        const sectorsTitle = 'Sectors';
        const affectedGroupsTitle = 'Affected groups';
        const locationsTitle = 'Locations';

        return (
            <div className={styles.methodology}>
                <FaramGroup faramElementName="methodology">
                    {this.props.pending && <LoadingAnimation large />}
                    <FaramList faramElementName="attributes">
                        <div className={styles.header}>
                            <NonFieldErrors
                                className={styles.nonFieldErrors}
                                faramElement
                            />
                        </div>
                        <div className={styles.scrollWrap}>
                            <div className={styles.attributes}>
                                <div className={styles.header}>
                                    {
                                        Object.keys(attributesTemplate)
                                            .map(this.renderAttributeHeader)
                                    }
                                    <div className={styles.actionButtons}>
                                        <PrimaryButton
                                            faramAction="add"
                                            iconName={iconNames.add}
                                        />
                                    </div>
                                </div>
                                <List
                                    faramElement
                                    modifier={this.renderAttributeRow}
                                />
                            </div>
                        </div>
                    </FaramList>
                    <div className={styles.center}>
                        <CheckGroup
                            className={styles.focuses}
                            faramElementName="focuses"
                            title={focusesTitle}
                            options={focuses}
                            keySelector={d => d.id}
                            labelSelector={d => d.title}
                        />
                        <CheckGroup
                            faramElementName="sectors"
                            title={sectorsTitle}
                            options={sectors}
                            className={styles.sectors}
                            keySelector={d => d.id}
                            labelSelector={d => d.title}
                        />
                        <OrganigramWithList
                            faramElementName="affectedGroups"
                            title={affectedGroupsTitle}
                            className={styles.affectedGroups}
                            data={affectedGroups}
                        />
                        <GeoListInput
                            faramElementName="locations"
                            title={locationsTitle}
                            className={styles.locationSelection}
                            geoOptionsByRegion={geoOptions}
                            regions={projectDetails.regions}
                        />
                    </div>
                    <div className={styles.bottom}>
                        <div className={styles.title}>
                            {/* FIXME: use strings */}
                            Methodology content
                        </div>
                        <div className={styles.body}>
                            <TextArea
                                // FIXME: use strings
                                faramElementName="objectives"
                                className={styles.methodologyContent}
                                placeholder="Drag and drop objectives here"
                                label="Objectives"
                            />
                            <TextArea
                                // FIXME: use strings
                                faramElementName="dataCollectionTechniques"
                                className={styles.methodologyContent}
                                placeholder="Drag and drop data collection techniques here"
                                label="Data collection techniques"
                            />
                            <TextArea
                                // FIXME: use strings
                                faramElementName="sampling"
                                className={styles.methodologyContent}
                                placeholder="Drag and drop sampling (site and respondent selection) here"
                                label="Sampling"
                            />
                            <TextArea
                                // FIXME: use strings
                                faramElementName="limitations"
                                className={styles.methodologyContent}
                                placeholder="Drag and drop limitations here"
                                label="Limitations"
                            />
                        </div>
                    </div>
                </FaramGroup>
            </div>
        );
    }
}
