import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import styles from './styles.scss';
import { GridLayout } from '../../../public/components/View';

import widgetStore from '../../AnalysisFramework/widgetStore';
import { pageTitles } from '../../../common/constants';

import schema from '../../../common/schema';

import { FgRestBuilder } from '../../../public/utils/rest';

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

const defaultProps = {
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Entries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,
        };

        this.items = [];
    }

    componentWillMount() {
        const {
            projectId,
        } = this.props;

        this.entriesRequest = this.createRequestForEntries(projectId);
        this.entriesRequest.start();

        this.projectRequest = this.createRequestForProject(projectId);
        this.projectRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.analysisFramework) {
            this.update(nextProps.analysisFramework);
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

    getGridItems = () => this.items.map(item => ({
        key: item.key,
        widgetId: item.widgetId,
        title: item.title,
        layout: item.properties.listGridLayout,
    }))

    getMaxHeight = () => this.items.reduce((acc, item) => (
        Math.max(acc, item.properties.listGridLayout.height + item.properties.listGridLayout.top)
    ), 0);

    getItemView = (item) => {
        const Component = this.widgets.find(w => w.id === item.widgetId).listComponent;
        return <Component />;
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
                        entries: response.results,
                    });
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
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({
                        analysisFramework: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return analysisFrameworkRequest;
    }

    update(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.analysisFramework.listComponent)
            .map(widget => ({
                id: widget.id,
                title: widget.title,
                listComponent: widget.analysisFramework.listComponent,
            }));

        if (analysisFramework.widgets) {
            this.items = analysisFramework.widgets.filter(
                w => this.widgets.find(w1 => w1.id === w.widgetId),
            );
        } else {
            this.items = [];
        }

        console.log(this.items);
    }

    render() {
        console.warn(this.props.entries, this.props.analysisFramework);

        return (
            <div styleName="entries">
                <header>
                    <h2>
                        { pageTitles.entries }
                    </h2>
                </header>
                <div
                    styleName="entry-list"
                >
                    {
                        this.props.entries.map(entry => (
                            <div
                                key={entry.id}
                                styleName="entry"
                                style={{ height: this.getMaxHeight() + 16 }}
                            >
                                <GridLayout
                                    styleName="grid-layout"
                                    modifier={this.getItemView}
                                    items={this.getGridItems()}
                                    viewOnly
                                />
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}
