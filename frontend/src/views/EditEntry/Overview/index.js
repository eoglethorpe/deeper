import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import ResizableH from '../../../vendor/react-store/components/View/Resizable/ResizableH';
import SelectInput from '../../../vendor/react-store/components/Input/SelectInput';
import GridLayout from '../../../vendor/react-store/components/View/GridLayout';

import {
    setActiveEntryAction,
    editEntryCurrentLeadSelector,
    entryStringsSelector,
    afStringsSelector,
} from '../../../redux';
import { iconNames } from '../../../constants';

import widgetStore from '../../../widgets';
import { entryAccessor } from '../../../entities/entry';

import LeftPanel from './LeftPanel';
import styles from '../styles.scss';

const propTypes = {

    leadId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    entryStrings: PropTypes.func.isRequired,
    afStrings: PropTypes.func.isRequired,
    setActiveEntry: PropTypes.func.isRequired,

    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    choices: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    filteredEntries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onEntryAdd: PropTypes.func.isRequired,
    onEntryDelete: PropTypes.func.isRequired,
    onSaveAll: PropTypes.func.isRequired,
    saveAllDisabled: PropTypes.bool.isRequired,
    saveAllPending: PropTypes.bool.isRequired,
    selectedEntryId: PropTypes.string,
    widgetDisabled: PropTypes.bool,
};

const defaultProps = {
    selectedEntryId: undefined,
    widgetDisabled: false,
};

const mapStateToProps = (state, props) => ({
    lead: editEntryCurrentLeadSelector(state, props),
    entryStrings: entryStringsSelector(state),
    afStrings: afStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveEntry: params => dispatch(setActiveEntryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.items = [];
        this.gridItems = [];

        this.updateAnalysisFramework(props.analysisFramework);
        this.updateGridItems(props.entries);

        this.state = {
            currentEntryId: undefined,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.updateAnalysisFramework(nextProps.analysisFramework);
            this.updateGridItems(nextProps.entries);
        }

        if (
            this.props.entries !== nextProps.entries ||
            this.props.selectedEntryId !== nextProps.selectedEntryId
        ) {
            this.updateGridItems();
        }
    }

    updateAnalysisFramework(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.tagging.overviewComponent)
            .map(widget => ({
                id: widget.id,
                title: this.props.afStrings(widget.title),
                overviewComponent: widget.tagging.overviewComponent,
            }));

        if (analysisFramework.widgets) {
            this.items = analysisFramework.widgets.filter(
                w => this.widgets.find(w1 => w1.id === w.widgetId),
            ).map((item) => {
                const filters = analysisFramework.filters.filter(f => f.widgetKey === item.key);
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

    updateGridItems() {
        this.gridItems = this.items.map(item => ({
            id: item.id,
            key: item.key,
            widgetId: item.widgetId,
            filters: item.filters,
            exportable: item.exportable,
            title: item.title,
            layout: item.properties.overviewGridLayout,
            data: item.properties.data,
            attribute: this.props.api.getEntryAttribute(item.id),
        }));
    }

    handleEntrySelectChange = (value) => {
        this.props.setActiveEntry({
            leadId: this.props.leadId,
            entryId: value,
        });
    }

    calcEntryKey = entry => entryAccessor.getKey(entry);

    calcEntryLabelLimited = (entry) => {
        const values = entryAccessor.getValues(entry);
        const text = values.excerpt;
        return text || `Excerpt ${values.order}`;
    }

    renderItemView = (item) => {
        const widget = this.widgets.find(
            w => w.id === item.widgetId,
        );
        const OverviewComponent = widget.overviewComponent;

        return (
            <OverviewComponent
                entryId={this.props.selectedEntryId}
                id={item.id}
                filters={item.filters}
                exportable={item.exportable}
                api={this.props.api}
                attribute={item.attribute}
                data={item.data}
            />
        );
    }

    render() {
        console.log('Rendering EditEntry:Overview');

        const {
            api,
            choices,
            entries,
            entryStrings,
            filteredEntries,
            lead,
            leadId,
            onEntryAdd,
            onEntryDelete,
            onSaveAll,
            saveAllDisabled,
            saveAllPending,
            selectedEntryId,
            setActiveEntry,
            widgetDisabled,
        } = this.props;

        const selectedEntry = entries.find(
            e => entryAccessor.getKey(e) === selectedEntryId,
        );
        const isMarkedForDelete = selectedEntryId && entryAccessor.isMarkedForDelete(selectedEntry);

        return (
            <ResizableH
                styleName="overview"
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
                leftChild={
                    <LeftPanel
                        api={api}
                        lead={lead}
                        leadId={leadId}
                        setActiveEntry={setActiveEntry}
                        selectedEntryId={selectedEntryId}
                        entries={entries}
                        choices={choices}
                        onEntryDelete={onEntryDelete}
                        saveAllPending={saveAllPending}
                    />
                }
                rightChild={[
                    <header
                        key="header"
                        styleName="header"
                    >
                        <div styleName="entry-actions">
                            <SelectInput
                                styleName="select-input"
                                placeholder={entryStrings('selectExcerptPlaceholder')}
                                showHintAndError={false}
                                showLabel={false}
                                hideClearButton
                                keySelector={this.calcEntryKey}
                                labelSelector={this.calcEntryLabelLimited}
                                options={filteredEntries}
                                value={selectedEntryId}
                                onChange={this.handleEntrySelectChange}
                            />
                            <PrimaryButton
                                title={entryStrings('addEntryButtonTitle')}
                                onClick={onEntryAdd}
                            >
                                <i className={iconNames.add} />
                            </PrimaryButton>
                            { selectedEntry && !isMarkedForDelete &&
                                <DangerButton
                                    title={entryStrings('removeEntryButtonTitle')}
                                    onClick={() => onEntryDelete(true)}
                                >
                                    <i className={iconNames.delete} />
                                </DangerButton>
                            }
                        </div>
                        <div styleName="action-buttons">
                            <Link
                                styleName="goto-link"
                                to="/list"
                                replace
                            >
                                {entryStrings('gotoListButtonLabel')}
                            </Link>
                            <SuccessButton
                                styleName="save-button"
                                onClick={onSaveAll}
                                disabled={saveAllDisabled}
                            >
                                {entryStrings('saveButtonLabel')}
                            </SuccessButton>
                        </div>
                    </header>,
                    <div
                        key="container"
                        ref={(el) => { this.gridLayoutContainer = el; }}
                        styleName="container"
                    >
                        { widgetDisabled && <LoadingAnimation /> }
                        <GridLayout
                            styleName="grid-layout"
                            modifier={this.renderItemView}
                            items={this.gridItems}
                            viewOnly
                        />
                    </div>,
                ]}
            />
        );
    }
}
