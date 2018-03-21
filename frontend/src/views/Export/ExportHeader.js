import CSSModules from 'react-css-modules';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { reverseRoute } from '../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import Button from '../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';

import {
    urlForExportTrigger,
    createParamsForExportTrigger,
} from '../../rest';
import { pathNames } from '../../constants';
import { exportStringsSelector } from '../../redux';
import notify from '../../notify';

import styles from './styles.scss';

const emptyList = [];

const propTypes = {
    reportStructure: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeExportTypeKey: PropTypes.string.isRequired,
    decoupledEntries: PropTypes.bool.isRequired,
    projectId: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    selectedLeads: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onPreview: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired,
    exportStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    reportStructure: undefined,
    selectedLeads: {},
    entriesFilters: {},
};

const mapStateToProps = state => ({
    exportStrings: exportStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
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
                title: this.props.exportStrings('headerExport'),
                type: notify.type.SUCCESS,
                message: this.props.exportStrings('exportStartedNotifyMessage'),
                duration: 15000,
            });
        };
        this.export(exportFn, false, this.props.activeExportTypeKey === 'pdf');
    }

    handlePreview = () => {
        this.export(this.props.onPreview, true, this.props.activeExportTypeKey === 'pdf');
    }

    render() {
        const { projectId } = this.props;


        return (
            <header className={styles.header}>
                <h2>
                    {this.props.exportStrings('headerExport')}
                </h2>
                <div className={styles.actionButtons}>
                    <Link
                        to={reverseRoute(pathNames.userExports, { projectId })}
                        className={styles.link}
                    >
                        {this.props.exportStrings('viewAllExportsButtonLabel')}
                    </Link>
                    <Button
                        className={styles.button}
                        onClick={this.handlePreview}
                        disabled={this.props.pending}
                    >
                        {this.props.exportStrings('showPreviewButtonLabel')}
                    </Button>
                    <PrimaryButton
                        className={styles.button}
                        onClick={this.handleExport}
                        disabled={this.props.pending}
                    >
                        {this.props.exportStrings('startExportButtonLabel')}
                    </PrimaryButton>
                </div>
            </header>
        );
    }
}
