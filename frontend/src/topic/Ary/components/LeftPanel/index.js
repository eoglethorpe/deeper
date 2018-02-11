import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import { connect } from 'react-redux';

import {
    entryStringsSelector,
    afStringsSelector,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    entryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class LeftPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            currentTabLeft: 'simplified-preview',
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

    render() {
        const {
            currentTabLeft,
        } = this.state;

        return (
            <Tabs
                name="leftPaneTabs"
                selectedTab={currentTabLeft}
                handleSelect={this.handleLeftTabSelect}
                activeLinkStyle={{ none: 'none' }}
                className={`${styles['tabs-container']}`}
            >
                <div className={styles['tabs-header-container']}>
                    <TabLink
                        className={styles['tab-header']}
                        to="simplified-preview"
                    >
                        {this.props.entryStrings('simplifiedTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="assisted-tagging"
                    >
                        {this.props.entryStrings('assistedTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="original-preview"
                    >
                        {this.props.entryStrings('originalTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="images-preview"
                    >
                        {this.props.entryStrings('imagesTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="highlights"
                    >
                        Highlights
                    </TabLink>
                    <div styleName="empty-tab" />
                </div>
                <div className={styles['tabs-content']}>
                    <TabContent
                        className={styles.tab}
                        for="simplified-preview"
                    >
                        Simplified View
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="assisted-tagging"
                    >
                        Assisted Tagging
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="original-preview"
                    >
                        Original Lead
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="images-preview"
                    >
                        Image
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="highlights"
                    >
                        <div className={styles['highlights-container']}>
                            Highlights
                        </div>
                    </TabContent>
                </div>
            </Tabs>
        );
    }
}
