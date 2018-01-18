import CSSModules from 'react-css-modules';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import { reverseRoute } from '../../../../public/utils/common';
import { FgRestBuilder } from '../../../../public/utils/rest';
import {
    Button,
    PrimaryButton,
} from '../../../../public/components/Action';

import {
    pathNames,
    exportStrings,
} from '../../../../common/constants';
import {
    urlForExportTrigger,
    createParamsForExportTrigger,
} from '../../../../common/rest';


import styles from '../styles.scss';

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
};

const defaultProps = {
    reportStructure: undefined,
    selectedLeads: {},
    entriesFilters: {},
};

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

    export = (onSuccess, isPreview = false) => {
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
            lead: Object.keys(selectedLeads).filter(l => selectedLeads[l]).join(','),
            report_structure: this.createReportStructureForExport(reportStructure || emptyList),
            is_preview: isPreview,
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
            console.log('Exporting', exportId);
        };
        this.export(exportFn, false);
    }

    handlePreview = () => {
        this.export(this.props.onPreview, true);
    }

    render() {
        const { projectId } = this.props;


        return (
            <header styleName="header">
                <h2>
                    {exportStrings.headerExport}
                </h2>
                <div styleName="action-buttons">
                    <Link
                        to={reverseRoute(pathNames.userExports, { projectId })}
                        styleName="link"
                    >
                        {exportStrings.viewAllExportsButtonLabel}
                    </Link>
                    <Button
                        styleName="button"
                        onClick={this.handlePreview}
                        disabled={this.props.pending}
                    >
                        {exportStrings.showPreviewButtonLabel}
                    </Button>
                    <PrimaryButton
                        styleName="button"
                        onClick={this.handleExport}
                        disabled={this.props.pending}
                    >
                        {exportStrings.startExportButtonLabel}
                    </PrimaryButton>
                </div>
            </header>
        );
    }
}
