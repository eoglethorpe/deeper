import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Table,
    FormattedDate,
    LoadingAnimation,
} from '../../../public/components/View';
import {
    urlForExports,
    createUrlForExport,
    createParamsForUserExportsGET,

    transformResponseErrorToFormError,
} from '../../../common/rest';

import {
    userExportsListSelector,
    setUserExportsAction,
} from '../../../common/redux';

import schema from '../../../common/schema';
import notify from '../../../common/notify';
import ExportPreview from '../../../common/components/ExportPreview';
import {
    exportStrings,
    iconNames,
} from '../../../common/constants';

import { leadTypeIconMap } from '../../../common/entities/lead';
import { FgRestBuilder } from '../../../public/utils/rest';

import styles from './styles.scss';

const propTypes = {
    userExports: PropTypes.array.isRequired, //eslint-disable-line
    setUserExports: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => ({
    userExports: userExportsListSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setUserExports: params => dispatch(setUserExportsAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserExports extends React.PureComponent {
    static propTypes = propTypes;
    static tableKeyExtractor = d => d.id;

    constructor(props) {
        super(props);

        this.state = {
            selectedExport: 0,
        };

        this.exportsTableHeader = [
            {
                key: 'mime-type',
                label: exportStrings.documentTypeHeaderLabel,
                order: 1,
                sortable: true,
                comparator: (a, b) => (a.mimeType || '').localeCompare(b.mimeType || ''),
                modifier: (row) => {
                    const icon = leadTypeIconMap[row.mimeType] || iconNames.documentText;
                    const url = row.file;
                    return (
                        <div className="icon-wrapper">
                            <a href={url} target="_blank">
                                <i className={icon} />
                            </a>
                        </div>
                    );
                },
            },
            {
                key: 'exportedAt',
                label: exportStrings.exportedAtHeaderLabel,
                order: 2,
                sortable: true,
                comparator: (a, b) => a.exportedAt.localeCompare(b.exportedAt),
                modifier: row => (
                    <FormattedDate
                        date={row.exportedAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'title',
                label: exportStrings.exportTitleHeaderLabel,
                order: 3,
                sortable: true,
                comparator: (a, b) => a.title.localeCompare(b.title),
            },
            {
                key: 'pending',
                label: exportStrings.statusHeaderLabel,
                order: 4,
                sortable: true,
                comparator: (a, b) => {
                    if (a.pending !== b.pending) {
                        return a.pending - b.pending;
                    }
                    return a.exportedAt.localeCompare(b.exportedAt);
                },
                modifier: (row) => {
                    if (row.pending) {
                        return exportStrings.pendingStatusLabel;
                    } else if (!row.file) {
                        return exportStrings.errorStatusLabel;
                    }
                    return exportStrings.completedStatusLabel;
                },
            },
            {
                key: 'type',
                label: exportStrings.exportTitleHeaderLabel,
                order: 5,
                sortable: true,
                comparator: (a, b) => a.type.localeCompare(b.type),
            },
            {
                key: 'file',
                label: exportStrings.exportDownloadHeaderLabel,
                order: 6,
                modifier: (row) => {
                    if (row.pending) {
                        return (
                            <LoadingAnimation className="loading" />
                        );
                    } else if (!row.pending && !row.file) {
                        return (
                            <span className={iconNames.error} />
                        );
                    }
                    return (
                        <a
                            href={row.file}
                            target="_blank"
                            className="file-download"
                        >
                            <span className={iconNames.download} />
                        </a>
                    );
                },
            },
        ];
    }

    componentWillMount() {
        this.userExportsRequest = this.createUserExportsRequest();
        this.userExportsRequest.start();
    }

    componentWillUnmount() {
        if (this.userExportsRequest) {
            this.userExportsRequest.stop();
        }
    }

    createUserExportsRequest = () => {
        const userExportsRequest = new FgRestBuilder()
            .url(urlForExports)
            .params(() => createParamsForUserExportsGET())
            .success((response) => {
                try {
                    schema.validate(response, 'userExportsGetResponse');
                    this.props.setUserExports({
                        exports: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: exportStrings.userExportsTitle,
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: exportStrings.userExportsTitle,
                    type: notify.type.ERROR,
                    message: exportStrings.userExportsFataMessage,
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return userExportsRequest;
    };

    handleRowClick = (rowKey) => {
        this.setState({ selectedExport: rowKey });
    }

    render() {
        const { userExports } = this.props;
        const { selectedExport } = this.state;

        return (
            <div styleName="user-exports">
                <header styleName="header">
                    <h2>
                        {exportStrings.userExportsHeader}
                    </h2>
                </header>
                <div styleName="main-container">
                    <div styleName="table-container">
                        <Table
                            data={userExports || emptyList}
                            headers={this.exportsTableHeader}
                            keyExtractor={UserExports.tableKeyExtractor}
                            highlightRowKey={selectedExport}
                            onBodyClick={this.handleRowClick}
                        />
                    </div>
                    <ExportPreview
                        styleName="preview"
                        exportId={selectedExport}
                    />
                </div>
            </div>
        );
    }
}
