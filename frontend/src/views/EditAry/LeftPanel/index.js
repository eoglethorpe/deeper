import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import MultiViewContainer from '../../../vendor/react-store/components/View/MultiViewContainer';
import FixedTabs from '../../../vendor/react-store/components/View/FixedTabs';

import {
    LEAD_TYPE,
    LEAD_PANE_TYPE,
    leadPaneTypeMap,
} from '../../../entities/lead';
import SimplifiedLeadPreview from '../../../components/SimplifiedLeadPreview';
import LeadPreview from '../../../components/LeadPreview';

import AssistedTagging from '../../../components/AssistedTagging';
import ImagesGrid from '../../../components/ImagesGrid';
import {
    entryStringsSelector,
    leadIdFromRouteSelector,
    projectIdFromRouteSelector,
} from '../../../redux';

import EntriesListing from './EntriesListing';
import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,

    entryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    selectedEntryId: undefined,
    widgetDisabled: false,
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
    leadId: leadIdFromRouteSelector(state),
    projectId: projectIdFromRouteSelector(state),
});

@connect(mapStateToProps, undefined)
export default class LeftPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getPaneType = (lead) => {
        if (!lead) {
            return undefined;
        }
        const type = lead.sourceType;
        if (type === LEAD_TYPE.text) {
            return LEAD_PANE_TYPE.text;
        } else if (type === LEAD_TYPE.website) {
            return LEAD_PANE_TYPE.website;
        }
        if (!lead.attachment) {
            return undefined;
        }
        const mimeType = lead.attachment.mimeType;
        return leadPaneTypeMap[mimeType];
    }

    constructor(props) {
        super(props);

        this.state = {
            images: [],
            currentTab: undefined,
        };

        this.views = this.calculateTabComponents();
    }

    /*
    componentWillReceiveProps(nextProps) {
        const { entries: oldEntries } = this.props;
        const { entries: newEntries } = nextProps;

        if (oldEntries !== newEntries) {
            this.highlights = nextProps.api.getEntryHighlights();
        }
    }
    */

    calculateTabComponents = () => ({
        'simplified-preview': {
            component: () => (
                <SimplifiedLeadPreview
                    className={styles.simplifiedPreview}
                    leadId={this.props.leadId}
                    onLoad={this.handleLoadImages}
                />
            ),
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'assisted-tagging': {
            component: () => (
                <AssistedTagging
                    onEntryAdd={() => { /* FIXME: add real function */ }}
                    className={styles.assistedTagging}
                    leadId={this.props.leadId}
                    projectId={this.props.projectId}
                />
            ),
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'original-preview': {
            component: () => (
                <div className={styles.originalPreview}>
                    <LeadPreview
                        lead={this.props.lead}
                        handleScreenshot={this.handleScreenshot}
                    />
                </div>
            ),
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'images-preview': {
            component: () => (
                <ImagesGrid
                    className={styles.imagesPreview}
                    images={this.state.images}
                />
            ),
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'entries-listing': {
            component: () => (
                <div className={styles.entriesListContainer}>
                    <EntriesListing
                        leadId={this.props.leadId}
                    />
                </div>
            ),
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
    })

    calculateTabsForLead = (lead, images) => {
        const leadPaneType = LeftPanel.getPaneType(lead);

        let tabs;
        switch (leadPaneType) {
            case LEAD_PANE_TYPE.spreadsheet:
                tabs = {
                    'original-preview': this.props.entryStrings('tabularTabLabel'),
                    'images-preview': this.props.entryStrings('imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.image:
                tabs = {
                    'original-preview': this.props.entryStrings('imagesTabLabel'),
                    'images-preview': this.props.entryStrings('imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.text:
                tabs = {
                    'simplified-preview': this.props.entryStrings('simplifiedTabLabel'),
                    'assisted-tagging': this.props.entryStrings('assistedTabLabel'),
                    'images-preview': this.props.entryStrings('imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.word:
            case LEAD_PANE_TYPE.pdf:
            case LEAD_PANE_TYPE.presentation:
            case LEAD_PANE_TYPE.website:
                tabs = {
                    'simplified-preview': this.props.entryStrings('simplifiedTabLabel'),
                    'assisted-tagging': this.props.entryStrings('assistedTabLabel'),
                    'original-preview': this.props.entryStrings('originalTabLabel'),
                    'images-preview': this.props.entryStrings('imagesTabLabel'),
                };
                break;
            default:
                return undefined;
        }
        if (!images || images.length <= 0) {
            tabs['images-preview'] = undefined;
        }
        tabs['entries-listing'] = this.props.entryStrings('entriesTabLabel');
        return tabs;
    }

    handleTabClick = (key) => {
        if (key === this.state.currentTab) {
            return;
        }
        this.setState({ currentTab: key });
    }

    // Simplified Lead Preview

    handleLoadImages = (response) => {
        if (response.images) {
            this.setState({ images: response.images });
        }
    }

    // Assisted Tagging

    // Lead Preview

    handleScreenshot = (/* image */) => {
        console.warn('Screenshot was taken');
        /*
        this.props.api.getEntryBuilder()
            .setImage(image)
            .apply();
        */
    }

    // Entries

    render() {
        const { lead } = this.props;
        const { images } = this.state;
        let { currentTab } = this.state;

        // FIXME: move this to componentWillUpdate
        const tabs = this.calculateTabsForLead(lead, images);

        // If there is no tabs, the lead must have unrecognized type
        if (!tabs) {
            return (
                <p>
                    {this.props.entryStrings('unrecognizedLeadMessage')}
                </p>
            );
        }

        // If there is no currentTab, get first visible tab
        if (!currentTab) {
            const tabKeys = Object.keys(tabs).filter(a => !!tabs[a]);
            currentTab = tabKeys.length > 0 ? Object.keys(tabs)[0] : undefined;
        }

        return (
            <Fragment>
                <FixedTabs
                    className={styles.tabs}
                    active={currentTab}
                    tabs={tabs}
                    onClick={this.handleTabClick}
                />
                <MultiViewContainer
                    active={currentTab}
                    views={this.views}
                />
            </Fragment>
        );
    }
}
