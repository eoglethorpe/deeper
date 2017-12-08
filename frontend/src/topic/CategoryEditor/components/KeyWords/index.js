import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import { connect } from 'react-redux';
import styles from './styles.scss';

import {
    keywordsForSelectedSubSubCategorySelector,
} from '../../../../common/redux';

const propTypes = {
    className: PropTypes.string,
    keywords: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    keywords: keywordsForSelectedSubSubCategorySelector(state),
});

@connect(mapStateToProps, undefined)
@CSSModules(styles, { allowMultiple: true })
export default class KeyWords extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    tabStyle = { none: 'none' };

    render() {
        const {
            className,
            keywords,
        } = this.props;

        return (
            <div styleName={className}>
                <Tabs
                    activeLinkStyle={this.tabStyle}
                    styleName="tabs-container"
                >
                    <div styleName="tabs-header-container">
                        <TabLink
                            styleName="tab-header"
                            to="keywords"
                        >
                            KeyWords
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="n-gram-2"
                        >
                            N-Gram (2)
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="n-gram-3"
                        >
                            N-Gram (3)
                        </TabLink>
                        {/* Essential for border bottom, for more info contact AdityaKhatri */}
                        <div styleName="empty-tab" />
                    </div>
                    <TabContent
                        for="keywords"
                        styleName="tab"
                    >
                        {
                            keywords.map(keyword => (
                                <div key={keyword.id}>
                                    <p
                                        draggable
                                        readOnly
                                        styleName={
                                            keyword.type ? `keywords-words-${keyword.type}`
                                                : 'keywords-words-grey'
                                        }
                                    >
                                        {keyword.label}
                                        <span> ({keyword.count}) </span>
                                    </p>
                                </div>
                            ))
                        }
                        <p
                            draggable
                            readOnly
                            styleName="keywords-words-green"
                        >
                            Sickness
                            <span> (331) </span>
                        </p>
                        <br />
                        <span
                            styleName="keywords-words-green"
                            readOnly
                            draggable
                        >
                            Cholera
                            <span> (298) </span>
                        </span>
                        <br />
                        <span
                            styleName="keywords-words-grey"
                            draggable
                            readOnly
                        >
                            Pump
                            <span> (210) </span>
                        </span>
                        <br />
                        <span
                            styleName="keywords-words-green"
                            draggable
                            readOnly
                        >
                            Latrines
                            <span> (125) </span>
                        </span>
                        <br />
                        <span
                            styleName="keywords-words-grey"
                            draggable
                            readOnly
                        >
                            Saniatation
                            <span> (45) </span>
                        </span>
                    </TabContent>
                    <TabContent
                        for="n-gram-2"
                        styleName="tab"
                    >
                        n-gram-2
                    </TabContent>
                    <TabContent
                        for="n-gram-3"
                        styleName="tab"
                    >
                        n-gram-3
                    </TabContent>
                </Tabs>
            </div>
        );
    }
}
