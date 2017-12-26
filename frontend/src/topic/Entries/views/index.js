import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    GridLayout,
    LoadingAnimation,
} from '../../../public/components/View';
import {
    SelectInput,
} from '../../../public/components/Input';
import { FgRestBuilder } from '../../../public/utils/rest';
import { groupList } from '../../../public/utils/common';

import schema from '../../../common/schema';

import { pageTitles } from '../../../common/constants';
import {
    projectIdFromRoute,
    setEntriesAction,
    setProjectAction,
    entriesForProjectSelector,
    setAnalysisFrameworkAction,
    analysisFrameworkForProjectSelector,
} from '../../../common/redux';
import {
    createParamsForUser,
    createUrlForEntries,
    createUrlForAnalysisFramework,
    createUrlForProject,
} from '../../../common/rest';

import widgetStore from '../../AnalysisFramework/widgetStore';
import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    projectId: projectIdFromRoute(state, props),
    entries: entriesForProjectSelector(state, props),
    analysisFramework: analysisFrameworkForProjectSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setEntries: params => dispatch(setEntriesAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
});

const propTypes = {
    setProject: PropTypes.func.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.string.isRequired,
    setEntries: PropTypes.func.isRequired,
};

const defaultProps = { };

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Entries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {};

        this.items = [];
        this.leadGroupedEntries = groupList(props.entries, e => e.lead);
    }

    componentWillMount() {
        const { projectId } = this.props;

        this.entriesRequest = this.createRequestForEntries(projectId);
        this.entriesRequest.start();

        this.projectRequest = this.createRequestForProject(projectId);
        this.projectRequest.start();

        this.setState({ pendingEntries: true, pendingProjectAndAf: true });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.projectId !== nextProps.projectId) {
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }
            if (this.projectRequest) {
                this.projectRequest.stop();
            }
            if (this.analysisFrameworkRequest) {
                this.analysisFrameworkRequest.stop();
            }

            this.entriesRequest = this.createRequestForEntries(nextProps.projectId);
            this.entriesRequest.start();

            this.projectRequest = this.createRequestForProject(nextProps.projectId);
            this.projectRequest.start();

            this.setState({ pendingEntries: true, pendingProjectAndAf: true });
            return;
        }

        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.update(nextProps.analysisFramework);
        }
        if (this.props.entries !== nextProps.entries) {
            this.leadGroupedEntries = groupList(nextProps.entries, e => e.lead);
        }
    }

    componentWillUnmount() {
        if (this.entriesRequest) {
            this.entriesRequest.stop();
        }
        if (this.projectRequest) {
            this.projectRequest.stop();
        }
        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }
    }

    getAttribute = (entryId, widgetId) => {
        const entry = this.props.entries.find(e => e.id === entryId);
        const attribute = (
            entry &&
            entry.attributes &&
            entry.attributes.find(attr => attr.widget === widgetId)
        );

        return attribute && attribute.data;
    }

    getGridItems = entryId => this.items.map(
        item => ({
            key: item.key,
            widgetId: item.widgetId,
            title: item.title,
            layout: item.properties.listGridLayout,
            attribute: this.getAttribute(entryId, item.id),
            data: item.properties.data,
        }),
    )

    getMaxHeight = () => this.items.reduce(
        (acc, item) => {
            const { height, top } = item.properties.listGridLayout;
            return Math.max(acc, height + top);
        },
        0,
    );

    getItemView = (item) => {
        const Component = this.widgets.find(
            w => w.id === item.widgetId,
        ).listComponent;

        return (
            <Component
                data={item.data}
                attribute={item.attribute}
            />
        );
    }

    createRequestForEntries = (projectId) => {
        const entryRequest = new FgRestBuilder()
            .url(createUrlForEntries(projectId))
            .params(() => createParamsForUser())
            .success((response) => {
                try {
                    schema.validate(response, 'entriesGetResponse');
                    this.props.setEntries({
                        projectId,
                        entries: response.results.entries,
                    });
                    this.setState({ pendingEntries: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return entryRequest;
    }

    createRequestForProject = (projectId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForUser())
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.props.setProject({
                        project: response,
                    });

                    this.analysisFramework = this.createRequestForAnalysisFramework(
                        response.analysisFramework,
                    );
                    this.analysisFramework.start();
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectRequest;
    };

    createRequestForAnalysisFramework = (analysisFrameworkId) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFrameworkId,
        );
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(() => createParamsForUser())
            .delay(0)
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({
                        analysisFramework: response,
                    });

                    this.setState({ pendingProjectAndAf: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return analysisFrameworkRequest;
    }

    update(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.view.listComponent)
            .map(widget => ({
                id: widget.id,
                title: widget.title,
                listComponent: widget.view.listComponent,
            }));

        if (analysisFramework.widgets) {
            this.items = analysisFramework.widgets.filter(
                w => this.widgets.find(w1 => w1.id === w.widgetId),
            );
        } else {
            this.items = [];
        }

        if (analysisFramework.filters) {
            this.filters = analysisFramework.filters.filter(
                f => this.items.find(item => item.key === f.key),
            );
        } else {
            this.filters = [];
        }
    }

    renderFilter = ({ id, properties: filter }) => {
        if (!filter.type) {
            return null;
        }

        if (filter.type === 'multiselect') {
            return (
                <SelectInput
                    key={id}
                    options={filter.options}
                    showHintAndError={false}
                    multiple
                />
            );
        }

        return null;
    }

    render() {
        const leadIds = Object.keys(this.leadGroupedEntries);

        return (
            <div styleName="entries">
                {
                    (this.state.pendingEntries || this.state.pendingProjectAndAf) &&
                    <LoadingAnimation />
                }
                <div styleName="filters">
                    {
                        this.filters && this.filters.map(filter => this.renderFilter(filter))
                    }
                </div>
                <div styleName="lead-entries-list">
                    {
                        leadIds.map(leadId => (
                            <div
                                key={leadId}
                                styleName="lead-entries"
                            >
                                {
                                    this.leadGroupedEntries[leadId].map(entry => (
                                        <div
                                            key={entry.id}
                                            style={{ height: this.getMaxHeight() }}
                                        >
                                            <GridLayout
                                                styleName="grid-layout"
                                                modifier={this.getItemView}
                                                items={this.getGridItems(entry.id)}
                                                viewOnly
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}
