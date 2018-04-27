import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import FaramList from '../../../../vendor/react-store/components/Input/Faram/FaramList';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import List from '../../../../vendor/react-store/components/View/List';
import ListView from '../../../../vendor/react-store/components/View/List/ListView';
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
    assessmentMethodologyStringsSelector,
} from '../../../../redux';

import OrganigramWithList from '../../../../components/OrganigramWithList/';
import GeoListInput from '../../../../components/GeoListInput/';

import Header from '../Header';
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
    assessmentMethodologyStrings: PropTypes.func.isRequired,
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
    assessmentMethodologyStrings: assessmentMethodologyStringsSelector(state),
});

const idSelector = d => d.id;
const titleSelector = d => d.title;

@connect(mapStateToProps)
export default class Methodology extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderAttributeHeader = (k, key) => {
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

    renderAttribute = (key, index) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const methodologyGroup = attributesTemplate[key];

        return (
            <FaramGroup
                key={key}
                faramElementName={String(index)}
            >
                <ListView
                    className={styles.cell}
                    data={methodologyGroup.fields}
                    modifier={renderWidget}
                />
            </FaramGroup>
        );
    }

    renderAttributeRow = (dummy, attribute, index) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const attributesTemplateKeys = Object.keys(attributesTemplate);
        const renderAttribute = (k, key) => this.renderAttribute(key, index);

        return (
            <div
                key={index}
                className={styles.row}
            >
                <List
                    data={attributesTemplateKeys}
                    modifier={renderAttribute}
                />
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
            pending,
            assessmentMethodologyStrings,
        } = this.props;

        const focusesTitle = assessmentMethodologyStrings('focusesTitle');
        const sectorsTitle = assessmentMethodologyStrings('sectorsTitle');
        const affectedGroupsTitle = assessmentMethodologyStrings('affectedGroupsTitle');
        const locationsTitle = assessmentMethodologyStrings('locationsTitle');
        const methodologyContentTitle = assessmentMethodologyStrings('methodologyContentTitle');
        const objectivesTitle = assessmentMethodologyStrings('objectivesTitle');
        const dataCollectionTechniquesTitle = assessmentMethodologyStrings('dataCollectionTechniquesTitle');
        const samplingTitle = assessmentMethodologyStrings('samplingTitle');
        const limitationsTitle = assessmentMethodologyStrings('limitationsTitle');
        const attributesTitle = assessmentMethodologyStrings('attributesTitle');

        const attributesTemplateKeys = Object.keys(attributesTemplate);

        return (
            <div className={styles.methodology}>
                <FaramGroup faramElementName="methodology">
                    {pending && <LoadingAnimation large />}

                    <FaramList faramElementName="attributes">
                        <div className={styles.attributesSection}>
                            <Header
                                className={styles.header}
                                title={attributesTitle}
                            />
                            <div className={styles.scrollWrap}>
                                <div className={styles.attributes}>
                                    <div className={styles.header}>
                                        <List
                                            data={attributesTemplateKeys}
                                            modifier={this.renderAttributeHeader}
                                        />
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
                        </div>
                    </FaramList>

                    <section className={styles.middleSection}>
                        <CheckGroup
                            className={styles.focuses}
                            faramElementName="focuses"
                            title={focusesTitle}
                            options={focuses}
                            keySelector={idSelector}
                            labelSelector={titleSelector}
                        />
                        <CheckGroup
                            faramElementName="sectors"
                            title={sectorsTitle}
                            options={sectors}
                            className={styles.sectors}
                            keySelector={idSelector}
                            labelSelector={titleSelector}
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
                    </section>

                    <div className={styles.methodologyContent}>
                        <Header
                            className={styles.header}
                            title={methodologyContentTitle}
                        />
                        <div className={styles.content}>
                            <TextArea
                                faramElementName="objectives"
                                className={styles.input}
                                placeholder="Drag and drop objectives here"
                                label={objectivesTitle}
                            />
                            <TextArea
                                faramElementName="dataCollectionTechniques"
                                className={styles.input}
                                placeholder="Drag and drop data collection techniques here"
                                label={dataCollectionTechniquesTitle}
                            />
                            <TextArea
                                faramElementName="sampling"
                                className={styles.input}
                                placeholder="Drag and drop sampling (site and respondent selection) here"
                                label={samplingTitle}
                            />
                            <TextArea
                                faramElementName="limitations"
                                className={styles.input}
                                placeholder="Drag and drop limitations here"
                                label={limitationsTitle}
                            />
                        </div>
                    </div>
                </FaramGroup>
            </div>
        );
    }
}
