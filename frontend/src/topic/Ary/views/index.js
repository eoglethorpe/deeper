import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import { connect } from 'react-redux';

import {
    entryStringsSelector,
    afStringsSelector,
} from '../../../common/redux';

import {
    ResizableH,
} from '../../../public/components/View';
import styles from './styles.scss';

const propTypes = {
    entryStrings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Ary extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            currentTabLeft: 'simplified-preview',
            currentTabRight: 'metadata',
        };
    }

    handleLeftTabSelect = (selectedTab) => {
        if (selectedTab === this.state.currentTabLeft) {
            return;
        }
        let oldTab;
        this.setState({
            oldTab,
            currentTabLeft: selectedTab,
        });
    }

    handleRightTabSelect = (selectedTab) => {
        if (selectedTab === this.state.currentTabRight) {
            return;
        }
        let oldTab;
        this.setState({
            oldTab,
            currentTabRight: selectedTab,
        });
    }

    renderLeftPanel = () => {
        const {
            currentTabLeft,
        } = this.state;

        return (
            <Tabs
                name="leftPaneTabs"
                selectedTab={currentTabLeft}
                handleSelect={this.handleLeftTabSelect}
                activeLinkStyle={{ none: 'none' }}
                styleName="tabs-container"
            >
                <div styleName="tabs-header-container">
                    <TabLink
                        styleName="tab-header"
                        to="simplified-preview"
                    >
                        {this.props.entryStrings('simplifiedTabLabel')}
                    </TabLink>
                    <TabLink
                        styleName="tab-header"
                        to="assisted-tagging"
                    >
                        {this.props.entryStrings('assistedTabLabel')}
                    </TabLink>
                    <TabLink
                        styleName="tab-header"
                        to="original-preview"
                    >
                        {this.props.entryStrings('originalTabLabel')}
                    </TabLink>
                    <TabLink
                        styleName="tab-header"
                        to="images-preview"
                    >
                        {this.props.entryStrings('imagesTabLabel')}
                    </TabLink>
                    <TabLink
                        styleName="tab-header"
                        to="highlights"
                    >
                        Highlights
                    </TabLink>
                    <div styleName="empty-tab" />
                </div>
                <div styleName="tabs-content">
                    <TabContent
                        styleName="tab"
                        for="simplified-preview"
                    >
                        Simplified View
                    </TabContent>
                    <TabContent
                        styleName="tab"
                        for="assisted-tagging"
                    >
                        Assisted Tagging
                    </TabContent>
                    <TabContent
                        styleName="tab"
                        for="original-preview"
                    >
                        Original Lead
                    </TabContent>
                    <TabContent
                        styleName="tab"
                        for="images-preview"
                    >
                        Image
                    </TabContent>
                    <TabContent
                        styleName="tab"
                        for="highlights"
                    >
                        <div styleName="highlights-container">
                            Highlights
                        </div>
                    </TabContent>
                </div>
            </Tabs>
        );
    }

    renderRightPanel = () => {
        const {
            currentTabRight,
        } = this.state;

        return (
            <Tabs
                name="rightPaneTabs"
                selectedTab={currentTabRight}
                handleSelect={this.handleRightTabSelect}
                activeLinkStyle={{ none: 'none' }}
                styleName="tabs-container"
            >
                <div styleName="tabs-header-container">
                    <TabLink
                        styleName="tab-header"
                        to="metadata"
                    >
                        Metadata
                    </TabLink>
                    <TabLink
                        styleName="tab-header"
                        to="methodology"
                    >
                        Methodology
                    </TabLink>
                    <TabLink
                        styleName="tab-header"
                        to="entries"
                    >
                        Entries
                    </TabLink>
                    <TabLink
                        styleName="tab-header"
                        to="summary"
                    >
                        Summary
                    </TabLink>
                    <TabLink
                        styleName="tab-header"
                        to="score"
                    >
                        Score
                    </TabLink>
                    <div styleName="empty-tab" />
                </div>
                <div styleName="tabs-content">
                    <TabContent
                        styleName="tab"
                        for="metadata"
                    >
                        Metadata
                    </TabContent>
                    <TabContent
                        styleName="tab"
                        for="methodology"
                    >
                        Methodology
                    </TabContent>
                    <TabContent
                        styleName="tab"
                        for="entries"
                    >
                        Entries
                    </TabContent>
                    <TabContent
                        styleName="tab"
                        for="summary"
                    >
                        Summary
                    </TabContent>
                    <TabContent
                        styleName="tab"
                        for="score"
                    >
                        Score
                    </TabContent>
                </div>
            </Tabs>
        );
    }

    render() {
        return (
            <ResizableH
                styleName="ary"
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
                leftChild={this.renderLeftPanel()}
                rightChild={this.renderRightPanel()}
            />
        );
    }
}
