import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Link,
} from 'react-router-dom';

import {
    reverseRoute,
    compareString,
    compareBoolean,
    compareDate,
} from '../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import Table from '../../vendor/react-store/components/View/Table';
import FormattedDate from '../../vendor/react-store/components/View/FormattedDate';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import BoundError from '../../components/BoundError';
import {
    createUrlForExport,
    createParamsForUserExportsGET,
    createUrlForExportsOfProject,

    transformResponseErrorToFormError,
} from '../../rest';
import {
    userExportsListSelector,
    setUserExportsAction,
    setUserExportAction,

    projectIdFromRouteSelector,
    exportStringsSelector,
} from '../../redux';
import {
    pathNames,
    iconNames,
} from '../../constants';
import { leadTypeIconMap } from '../../entities/lead';
import schema from '../../schema';
import notify from '../../notify';
import ExportPreview from '../../components/ExportPreview';

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

@BoundError
@connect(mapStateToProps, mapDispatchToProps)
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
                comparator: (a, b) => (
                    compareString(a.mimeType, b.mimeType) ||
                    compareString(a.title, b.title)
                ),
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
                comparator: (a, b) => compareDate(a.exportedAt, b.exportedAt),
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
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'pending',
                label: this.props.exportStrings('statusHeaderLabel'),
                order: 4,
                sortable: true,
                comparator: (a, b) => (
                    compareBoolean(a.pending, b.pending) ||
                    compareDate(a.exportedAt, b.exportedAt)
                ),
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
                comparator: (a, b) => (
                    compareString(a.type, b.type) || compareString(a.title, b.title)
                ),
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
        this.defaultSort = {
            key: 'exportedAt',
            order: 'dsc',
        };
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
            <div className={styles.userExports}>
                <header className={styles.header}>
                    <h2>
                        {this.props.exportStrings('userExportsHeader')}
                    </h2>
                    <Link
                        className={styles.exportLink}
                        to={reverseRoute(pathNames.export, { projectId })}
                    >
                        {this.props.exportStrings('goBackToExportLabel')}
                    </Link>
                </header>
                <div className={styles.mainContainer}>
                    { this.state.pendingExports && <LoadingAnimation /> }
                    <div className={styles.tableContainer}>
                        <Table
                            data={userExports || emptyList}
                            headers={this.exportsTableHeader}
                            keyExtractor={UserExports.tableKeyExtractor}
                            highlightRowKey={selectedExport}
                            onBodyClick={this.handleRowClick}
                            defaultSort={this.defaultSort}
                        />
                    </div>
                    <ExportPreview
                        className={styles.preview}
                        exportId={selectedExport}
                    />
                </div>
            </div>
        );
    }
}
