import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import {
    iconNames,
    pathNames,
} from '../../../constants/';

import {
    reverseRoute,
} from '../../../vendor/react-store/utils/common';

import Button from '../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';
import WarningButton from '../../../vendor/react-store/components/Action/Button/WarningButton';

import styles from './styles.scss';

const propTypes = {
    row: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadsStrings: PropTypes.func.isRequired,
    activeProject: PropTypes.number.isRequired,
    onSearchSimilarLead: PropTypes.func.isRequired,
    onRemoveLead: PropTypes.func.isRequired,
    onMarkProcessed: PropTypes.func.isRequired,
    onMarkPending: PropTypes.func.isRequired,
};

const defaultProps = {
};


export default class ActionButtons extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getLinks = () => {
        const {
            activeProject,
            row,
        } = this.props;

        const editEntries = reverseRoute(
            pathNames.editEntries,
            {
                projectId: activeProject,
                leadId: row.id,
            },
        );

        const addAssessment = reverseRoute(
            pathNames.editAry,
            {
                projectId: activeProject,
                leadId: row.id,
            },
        );

        const editLead = {
            pathname: reverseRoute(
                pathNames.addLeads,
                {
                    projectId: activeProject,
                },
            ),
            state: {
                serverId: row.id,
                values: {
                    title: row.title,
                    sourceType: row.sourceType,
                    project: row.project,
                    source: row.source,
                    confidentiality: row.confidentiality,
                    assignee: row.assignee,
                    publishedOn: row.publishedOn,
                    attachment: row.attachment,
                    website: row.website,
                    url: row.url,
                    text: row.text,
                },
            },
        };

        return {
            editLead,
            addAssessment,
            editEntries,
        };
    }

    render() {
        const links = this.getLinks();
        const {
            onSearchSimilarLead,
            onRemoveLead,
            onMarkProcessed,
            onMarkPending,
            row,
            leadsStrings,
        } = this.props;

        return (
            <Fragment>
                {
                    row.status === 'pending' &&
                    <SuccessButton
                        tabIndex="-1"
                        // FIXME: Use strings
                        title="Mark as processed"
                        iconName={iconNames.check}
                        onClick={() => onMarkProcessed(row)}
                        smallVerticalPadding
                        transparent
                    />
                }
                {
                    row.status === 'processed' &&
                    <WarningButton
                        tabIndex="-1"
                        // FIXME: Use strings
                        title="Mark as pending"
                        iconName={iconNames.undo}
                        onClick={() => onMarkPending(row)}
                        smallVerticalPadding
                        transparent
                    />
                }
                <Button
                    tabIndex="-1"
                    title={leadsStrings('searchSimilarLeadButtonTitle')}
                    onClick={() => onSearchSimilarLead(row)}
                    smallVerticalPadding
                    transparent
                >
                    <i className={iconNames.search} />
                </Button>
                <DangerButton
                    tabIndex="-1"
                    title={leadsStrings('removeLeadLeadButtonTitle')}
                    onClick={() => onRemoveLead(row)}
                    smallVerticalPadding
                    transparent
                >
                    <i className={iconNames.delete} />
                </DangerButton>
                <Link
                    className={styles.editLink}
                    tabIndex="-1"
                    title={leadsStrings('editLeadButtonTitle')}
                    to={links.editLead}
                >
                    <i className={iconNames.edit} />
                </Link>
                {
                    process.env.NODE_ENV === 'development' &&
                    <Link
                        className={styles.addAssessmentLink}
                        tabIndex="-1"
                        title={leadsStrings('addAssessmentFromLeadButtonTitle')}
                        to={links.addAssessment}
                    >
                        <i className={iconNames.forward} />
                    </Link>
                }
                <Link
                    className={styles.addEntryLink}
                    tabIndex="-1"
                    title={leadsStrings('addEntryFromLeadButtonTitle')}
                    to={links.editEntries}
                >
                    <i className={iconNames.forward} />
                </Link>
            </Fragment>
        );
    }
}
