import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import { reverseRoute } from '../../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';

import {
    urlForExportTrigger,
    createParamsForExportTrigger,
} from '../../../rest';
import { pathNames } from '../../../constants';
import _ts from '../../../ts';
import notify from '../../../notify';

import styles from './styles.scss';

const emptyList = [];

const propTypes = {
    className: PropTypes.string,
    reportStructure: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeExportTypeKey: PropTypes.string.isRequired,
    decoupledEntries: PropTypes.bool.isRequired,
    projectId: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    selectedLeads: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onPreview: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
    reportStructure: undefined,
    selectedLeads: {},
    entriesFilters: {},
};

export default class ExportHeader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillUnmount() {
        if (this.exportRequest) {
            this.exportRequest.stop();
        }
    }

    createReportStructureForExport = nodes => nodes
        .filter(node => node.selected)
        .map(node => (
            node.nodes ? {
                id: node.key,
                levels: this.createReportStructureForExport(node.nodes),
            } : {
                id: node.key,
            }
        ));

    export = (onSuccess, isPreview = false, pdf = false) => {
        // Let's start by collecting the filters
        const {
            projectId,
            entriesFilters,
            activeExportTypeKey,
            selectedLeads,
            reportStructure,
            decoupledEntries,
        } = this.props;

        let exportType;
        if (activeExportTypeKey === 'word' || activeExportTypeKey === 'pdf') {
            exportType = 'report';
        } else {
            exportType = activeExportTypeKey;
        }

        const filters = {
            project: projectId,
            export_type: exportType,
            ...entriesFilters,
            decoupled: decoupledEntries,
            lead: Object.keys(selectedLeads).filter(l => selectedLeads[l]),
            report_structure: this.createReportStructureForExport(reportStructure || emptyList),
            is_preview: isPreview,
            pdf,
        };

        if (this.exportRequest) {
            this.exportRequest.stop();
        }
        this.exportRequest = this.createRequestForExport({ filters }, onSuccess);
        this.exportRequest.start();
    }

    createRequestForExport = ({ filters }, onSuccess) => {
        const exportRequest = new FgRestBuilder()
            .url(urlForExportTrigger)
            .params(() => createParamsForExportTrigger(filters))
            .success((response) => {
                // FIXME: write schema
                onSuccess(response.exportTriggered);
            })
            .build();
        return exportRequest;
    }

    handleExport = () => {
        const exportFn = (exportId) => {
            console.log('Exporting to ', exportId);
            notify.send({
                title: _ts('export', 'headerExport'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'exportStartedNotifyMessage'),
                duration: 15000,
            });
        };
        this.export(exportFn, false, this.props.activeExportTypeKey === 'pdf');
    }

    handlePreview = () => {
        this.export(this.props.onPreview, true, this.props.activeExportTypeKey === 'pdf');
    }

    render() {
        const {
            projectId,
            className,
        } = this.props;

        const classNames = `${styles.header} ${className}`;

        return (
            <header className={classNames}>
                <h2>
                    {_ts('export', 'headerExport')}
                </h2>
                <div className={styles.actionButtons}>
                    <Link
                        to={reverseRoute(pathNames.userExports, { projectId })}
                        className={styles.link}
                    >
                        {_ts('export', 'viewAllExportsButtonLabel')}
                    </Link>
                    <Button
                        className={styles.button}
                        onClick={this.handlePreview}
                        disabled={this.props.pending}
                    >
                        {_ts('export', 'showPreviewButtonLabel')}
                    </Button>
                    <PrimaryButton
                        className={styles.button}
                        onClick={this.handleExport}
                        disabled={this.props.pending}
                    >
                        {_ts('export', 'startExportButtonLabel')}
                    </PrimaryButton>
                </div>
            </header>
        );
    }
}
