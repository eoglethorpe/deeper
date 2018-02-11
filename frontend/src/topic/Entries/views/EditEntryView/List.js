import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import GridLayout from '../../../../public/components/View/GridLayout';
import LoadingAnimation from '../../../../public/components/View/LoadingAnimation';
import Confirm from '../../../../public/components/View/Modal/Confirm';
import AccentButton from '../../../../public/components/Action/Button/AccentButton';
import WarningButton from '../../../../public/components/Action/Button/WarningButton';
import SuccessButton from '../../../../public/components/Action/Button/SuccessButton';

import { FgRestBuilder } from '../../../../public/utils/rest';

import {
    createUrlForGeoOptions,
    createParamsForGeoOptionsGET,

    transformResponseErrorToFormError,
} from '../../../../common/rest';
import {
    editEntryViewCurrentLeadSelector,
    projectIdFromRouteSelector,

    setGeoOptionsAction,
    entryStringsSelector,
    afStringsSelector,
} from '../../../../common/redux';
import { iconNames } from '../../../../common/constants';
import { entryAccessor } from '../../../../common/entities/entry';
import schema from '../../../../common/schema';
import notify from '../../../../common/notify';

import widgetStore from '../../../AnalysisFramework/widgetStore';
import styles from './styles.scss';


const propTypes = {
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onSaveAll: PropTypes.func.isRequired,
    widgetDisabled: PropTypes.bool,
    saveAllDisabled: PropTypes.bool.isRequired,
    leadDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number,
    setGeoOptions: PropTypes.func.isRequired,

    entryStrings: PropTypes.func.isRequired,
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    widgetDisabled: false,
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    leadDetails: editEntryViewCurrentLeadSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
    entryStrings: entryStringsSelector(state),
    afStrings: afStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
});

const APPLY_MODE = {
    all: 'all',
    allBelow: 'allBelow',
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class List extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.items = [];
        this.gridItems = {};

        this.updateAnalysisFramework(props.analysisFramework);
        this.updateGridItems(props.entries);

        this.state = {
            showApplyModal: false,
            applyMode: undefined, // all or below
            applyItemId: undefined,
            applyEntryId: undefined,
        };
    }

    componentWillMount() {
        const { projectId } = this.props;
        this.geoOptionsRequest = this.createGeoOptionsRequest(projectId);
        this.geoOptionsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.updateAnalysisFramework(nextProps.analysisFramework);
        } else if (this.props.entries !== nextProps.entries) {
            this.updateGridItems(nextProps.entries);
            this.updateGridItems(nextProps.entries);
        }
    }

    componentWillUnmount() {
        if (this.geoOptionsRequest) {
            this.geoOptionsRequest.stop();
        }
    }

    getMaxHeight = () => this.items.reduce(
        (acc, item) => {
            const { height, top } = item.properties.listGridLayout;
            return Math.max(acc, height + top);
        },
        0,
    );

    getItemView = (item) => {
        const Component = this.widgets
            .find(w => w.id === item.widgetId).listComponent;
        return (
            <Component
                id={item.id}
                entryId={item.entryId}
                filters={item.filters}
                exportable={item.exportable}
                api={this.props.api}
                attribute={item.attribute}
                data={item.data}
            />
        );
    }

    handleApplyAllClick = (itemId, entryId) => {
        this.setState({
            showApplyModal: true,
            applyMode: APPLY_MODE.all,
            applyItemId: itemId,
            applyEntryId: entryId,
        });
    }

    handleApplyAllBelowClick = (itemId, entryId) => {
        this.setState({
            showApplyModal: true,
            applyMode: APPLY_MODE.allBelow,
            applyItemId: itemId,
            applyEntryId: entryId,
        });
    }

    handleApplyModal = (confirm) => {
        if (confirm) {
            const {
                applyItemId,
                applyEntryId,
                applyMode,
            } = this.state;
            if (applyMode === APPLY_MODE.all) {
                this.props.api.setAttributeToAll(applyItemId, applyEntryId);
            } else if (applyMode === APPLY_MODE.allBelow) {
                this.props.api.setAttributeToBelow(applyItemId, applyEntryId);
            }
        }
        this.setState({
            showApplyModal: false,
            applyMode: undefined,
            applyItemId: undefined,
            applyEntryId: undefined,
        });
    }

    // REST
    createGeoOptionsRequest = (projectId) => {
        const geoOptionsRequest = new FgRestBuilder()
            .url(createUrlForGeoOptions(projectId))
            .params(() => createParamsForGeoOptionsGET())
            .success((response) => {
                try {
                    schema.validate(response, 'geoOptions');
                    this.props.setGeoOptions({
                        projectId,
                        locations: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: this.props.entryStrings('entriesTabLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.entryStrings('entriesTabLabel'),
                    type: notify.type.ERROR,
                    message: this.props.entryStrings('geoOptionsFatalMessage'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return geoOptionsRequest;
    };

    updateAnalysisFramework(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.tagging.listComponent)
            .map(widget => ({
                id: widget.id,
                title: this.props.afStrings(widget.title),
                listComponent: widget.tagging.listComponent,
            }));

        if (analysisFramework.widgets) {
            this.items = analysisFramework.widgets.filter(
                w => this.widgets.find(w1 => w1.id === w.widgetId),
            ).map((item) => {
                const filters = analysisFramework.filters
                    .filter(f => f.widgetKey === item.key);
                const exportable = analysisFramework.exportables.find(
                    e => e.widgetKey === item.key,
                );

                return {
                    ...item,
                    filters,
                    exportable,
                };
            });
        } else {
            this.items = [];
        }
    }

    updateGridItems(entries) {
        this.gridItems = {};
        entries.forEach((entry) => {
            const entryId = entryAccessor.getKey(entry);
            this.gridItems[entryId] = this.items.map(item => ({
                id: item.id,
                key: item.key,
                widgetId: item.widgetId,
                filters: item.filters,
                exportable: item.exportable,
                title: item.title,
                layout: item.properties.listGridLayout,
                data: item.properties.data,
                attribute: this.props.api.getEntryAttribute(item.id, entryId),
                entryId,
                headerRightComponent: this.renderActionButtons(item, entryId),
            }));
        });
    }

    renderActionButtons = (item, entryId) => (
        <div className="action-buttons">
            <AccentButton
                className={styles['apply-button']}
                type="button"
                title={this.props.entryStrings('applyAllButtonTitle')}
                onClick={() =>
                    this.setState({
                        showApplyModal: true,
                        applyMode: APPLY_MODE.all,
                        applyItemId: item.id,
                        applyEntryId: entryId,
                    })
                }
                tabIndex="-1"
                transparent
            >
                <span className={iconNames.applyAll} />
            </AccentButton>
            <WarningButton
                className={styles['apply-button']}
                type="button"
                title={this.props.entryStrings('applyAllBelowButtonTitle')}
                onClick={() =>
                    this.setState({
                        showApplyModal: true,
                        applyMode: APPLY_MODE.allBelow,
                        applyItemId: item.id,
                        applyEntryId: entryId,
                    })}
                tabIndex="-1"
                transparent
            >
                <span className={iconNames.applyAllBelow} />
            </WarningButton>
        </div>
    )

    render() {
        const {
            entries,
            onSaveAll,
            saveAllDisabled,
            widgetDisabled,
            leadDetails,
        } = this.props;
        const {
            showApplyModal,
            applyMode,
        } = this.state;

        const entryStyle = { height: this.getMaxHeight() + 16 };

        return (
            <div styleName="list">
                { widgetDisabled && <LoadingAnimation /> }
                <header styleName="header">
                    <h3>
                        {leadDetails.title}
                    </h3>
                    <div styleName="action-buttons">
                        <Link
                            styleName="primary-link-button"
                            to="/overview"
                            replace
                        >
                            {this.props.entryStrings('gotoOverviewButtonLabel')}
                        </Link>
                        <SuccessButton
                            onClick={onSaveAll}
                            disabled={saveAllDisabled}
                            styleName="save-button"
                        >
                            {this.props.entryStrings('saveButtonLabel')}
                        </SuccessButton>
                    </div>
                </header>
                {
                    (!entries || entries.length <= 0) ? (
                        <div styleName="no-entry-wrapper">
                            <h2>
                                {this.props.entryStrings('noEntryFound')}
                            </h2>
                        </div>
                    ) : (
                        <div styleName="entry-list">
                            {
                                entries.map(entry => (
                                    <div
                                        key={entryAccessor.getKey(entry)}
                                        styleName="entry"
                                        style={entryStyle}
                                    >
                                        <GridLayout
                                            styleName="grid-layout"
                                            modifier={this.getItemView}
                                            items={this.gridItems[entryAccessor.getKey(entry)]}
                                            viewOnly
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
                <Confirm
                    show={showApplyModal}
                    closeOnEscape
                    onClose={this.handleApplyModal}
                >
                    <p>
                        {
                            applyMode === APPLY_MODE.all ? (
                                this.props.entryStrings('applyToAll')
                            ) : (
                                this.props.entryStrings('applyToAllBelow')
                            )
                        }
                    </p>
                </Confirm>
            </div>
        );
    }
}
