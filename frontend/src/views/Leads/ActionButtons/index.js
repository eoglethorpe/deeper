import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { reverseRoute } from '../../../vendor/react-store/utils/common';
import Button from '../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';
import WarningButton from '../../../vendor/react-store/components/Action/Button/WarningButton';

import {
    iconNames,
    pathNames,
} from '../../../constants/';
import Cloak from '../../../components/Cloak';
import _ts from '../../../ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    row: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeProject: PropTypes.number.isRequired,
    onSearchSimilarLead: PropTypes.func.isRequired,
    onRemoveLead: PropTypes.func.isRequired,
    onMarkProcessed: PropTypes.func.isRequired,
    onMarkPending: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
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
                faramValues: {
                    title: row.title,
                    sourceType: row.sourceType,
                    project: row.project,
                    source: row.source,
                    confidentiality: row.confidentiality,
                    assignee: row.assignee,
                    publishedOn: row.publishedOn,
                    attachment: row.attachment,
                    website: row.website,
                    leadGroup: row.leadGroup,
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
            className,
        } = this.props;

        const containerClassName = [
            className,
            styles.actionButtons,
            'action-buttons',
        ].join(' ');

        return (
            <div className={containerClassName}>
                <div className={styles.actionGroup}>
                    <SuccessButton
                        tabIndex="-1"
                        title={_ts('leads', 'markAsProcessedTitle')}
                        iconName={iconNames.check}
                        onClick={() => onMarkProcessed(row)}
                        transparent
                        disabled={row.status !== 'pending'}
                    />
                    <WarningButton
                        tabIndex="-1"
                        title={_ts('leads', 'markAsPendingTitle')}
                        iconName={iconNames.undo}
                        onClick={() => onMarkPending(row)}
                        transparent
                        disabled={row.status !== 'processed'}
                    />
                </div>
                <div className={styles.actionGroup}>
                    <Button
                        tabIndex="-1"
                        title={_ts('leads', 'searchSimilarLeadButtonTitle')}
                        onClick={() => onSearchSimilarLead(row)}
                        transparent
                        iconName={iconNames.search}
                    />
                    <DangerButton
                        tabIndex="-1"
                        title={_ts('leads', 'removeLeadLeadButtonTitle')}
                        onClick={() => onRemoveLead(row)}
                        transparent
                        iconName={iconNames.delete}
                    />
                    <Link
                        className={styles.editLink}
                        tabIndex="-1"
                        title={_ts('leads', 'editLeadButtonTitle')}
                        to={links.editLead}
                    >
                        <i className={iconNames.edit} />
                    </Link>
                </div>
                <div className={styles.actionGroup}>
                    <Cloak
                        requireAssessmentTemplate
                        render={
                            () => (
                                <Link
                                    className={styles.addAssessmentLink}
                                    tabIndex="-1"
                                    title={_ts('leads', 'addAssessmentFromLeadButtonTitle')}
                                    to={links.addAssessment}
                                >
                                    <i className={iconNames.forward} />
                                </Link>
                            )
                        }
                    />
                    <Link
                        className={styles.addEntryLink}
                        tabIndex="-1"
                        title={_ts('leads', 'addEntryFromLeadButtonTitle')}
                        to={links.editEntries}
                    >
                        <i className={iconNames.forward} />
                    </Link>
                </div>
            </div>
        );
    }
}
