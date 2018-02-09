import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Link,
} from 'react-router-dom';

import { FgRestBuilder } from '../../../public/utils/rest';
import { reverseRoute } from '../../../public/utils/common';
import Table from '../../../public/components/View/Table';
import FormattedDate from '../../../public/components/View/FormattedDate';
import LoadingAnimation from '../../../public/components/View/LoadingAnimation';

import {
    createUrlForExport,
    createParamsForUserExportsGET,
    createUrlForExportsOfProject,

    transformResponseErrorToFormError,
} from '../../../common/rest';
import {
    userExportsListSelector,
    setUserExportsAction,
    setUserExportAction,

    projectIdFromRouteSelector,
    exportStringsSelector,
} from '../../../common/redux';
import {
    pathNames,
    iconNames,
} from '../../../common/constants';
import { leadTypeIconMap } from '../../../common/entities/lead';
import schema from '../../../common/schema';
import notify from '../../../common/notify';
import ExportPreview from '../../../common/components/ExportPreview';

import styles from './styles.scss';

const propTypes = {
    userExports: PropTypes.array.isRequired, //eslint-disable-line
    setUserExports: PropTypes.func.isRequired,
    setUserExport: PropTypes.func.isRequired,
    projectId: PropTypes.number,
    exportStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    userExports: [],
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    userExports: userExportsListSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
    exportStrings: exportStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserExports: params => dispatch(setUserExportsAction(params)),
    setUserExport: params => dispatch(setUserExportAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserExports extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static tableKeyExtractor = d => d.id;

    constructor(props) {
        super(props);

        this.state = {
            selectedExport: 0,
            pendingExports: true,
        };

        this.exportsTableHeader = [
            {
                key: 'mime-type',
                label: this.props.exportStrings('documentTypeHeaderLabel'),
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
                label: this.props.exportStrings('exportedAtHeaderLabel'),
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
                label: this.props.exportStrings('exportTitleHeaderLabel'),
                order: 3,
                sortable: true,
                comparator: (a, b) => a.title.localeCompare(b.title),
            },
            {
                key: 'pending',
                label: this.props.exportStrings('statusHeaderLabel'),
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
                        return this.props.exportStrings('pendingStatusLabel');
                    } else if (!row.file) {
                        return this.props.exportStrings('errorStatusLabel');
                    }
                    return this.props.exportStrings('completedStatusLabel');
                },
            },
            {
                key: 'type',
                label: this.props.exportStrings('exportTypeHeaderLabel'),
                order: 5,
                sortable: true,
                comparator: (a, b) => a.type.localeCompare(b.type),
            },
            {
                key: 'file',
                label: this.props.exportStrings('exportDownloadHeaderLabel'),
                order: 6,
                modifier: (row) => {
                    if (row.pending) {
                        return (
                            <LoadingAnimation className="loading" />
                        );
                    } else if (!row.pending && !row.file) {
                        return (
                            <div className="file-error">
                                <span className={iconNames.error} />
                            </div>
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
        const { projectId } = this.props;
        this.userExportsRequest = this.createUserExportsRequest(projectId);
        this.userExportsRequest.start();

        const { userExports } = this.props;
        this.exportPollRequests = [];
        userExports.forEach((e) => {
            if (e.pending) {
                const userPollRequest = this.createExportPollRequest(e.id);
                userPollRequest.start();
                this.exportPollRequests.push(userPollRequest);
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        const { userExports: oldExports, projectId: oldProjectId } = this.props;
        const { userExports: newExports, projectId: newProjectId } = nextProps;

        // TODO: handle project change?

        if (oldExports !== newExports) {
            if (this.exportPollRequests) {
                this.exportPollRequests.forEach((p) => {
                    p.stop();
                });
            }

            this.exportPollRequests = [];
            newExports.forEach((e) => {
                if (e.pending) {
                    const userPollRequest = this.createExportPollRequest(e.id);
                    userPollRequest.start();
                    this.exportPollRequests.push(userPollRequest);
                }
            });
        }

        if (oldProjectId !== newProjectId) {
            if (this.userExportsRequest) {
                this.userExportsRequest.stop();
            }
            this.userExportsRequest = this.createUserExportsRequest(newProjectId);
            this.userExportsRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.userExportsRequest) {
            this.userExportsRequest.stop();
        }

        if (this.exportPollRequests) {
            this.exportPollRequests.forEach((p) => {
                p.stop();
            });
        }
    }

    createUserExportsRequest = (projectId) => {
        const userExportsRequest = new FgRestBuilder()
            .url(createUrlForExportsOfProject(projectId))
            .params(() => createParamsForUserExportsGET())
            .preLoad(() => {
                this.setState({ pendingExports: true });
            })
            .postLoad(() => {
                this.setState({ pendingExports: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userExportsGetResponse');
                    this.props.setUserExports({
                        exports: response.results,
                        projectId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: this.props.exportStrings('userExportsTitle'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.exportStrings('userExportsTitle'),
                    type: notify.type.ERROR,
                    message: this.props.exportStrings('userExportsFataMessage'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return userExportsRequest;
    };

    createExportPollRequest = (exportId) => {
        const userExportsRequest = new FgRestBuilder()
            .url(createUrlForExport(exportId))
            .params(() => createParamsForUserExportsGET())
            .pollTime(2000)
            .maxPollAttempts(200)
            .shouldPoll(response => response.pending === true)
            .success((response) => {
                try {
                    schema.validate(response, 'export');
                    if (!response.pending) {
                        this.props.setUserExport({
                            userExport: response,
                        });
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: this.props.exportStrings('userExportsTitle'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.exportStrings('userExportsTitle'),
                    type: notify.type.ERROR,
                    message: this.props.exportStrings('userExportsFataMessage'),
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
        const { userExports, projectId } = this.props;
        const { selectedExport } = this.state;

        return (
            <div styleName="user-exports">
                <header styleName="header">
                    <h2>
                        {this.props.exportStrings('userExportsHeader')}
                    </h2>
                    <Link
                        styleName="export-link"
                        to={reverseRoute(pathNames.export, { projectId })}
                    >
                        {this.props.exportStrings('goBackToExportLabel')}
                    </Link>
                </header>
                <div styleName="main-container">
                    { this.state.pendingExports && <LoadingAnimation /> }
                    <div styleName="table-container">
                        <Table
                            data={userExports || emptyList}
                            headers={this.exportsTableHeader}
                            keyExtractor={UserExports.tableKeyExtractor}
                            highlightRowKey={selectedExport}
                            onBodyClick={this.handleRowClick}
                            // TODO: move this default sort in constructor
                            defaultSort={{ key: 'exportedAt', order: 'dsc' }}
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
