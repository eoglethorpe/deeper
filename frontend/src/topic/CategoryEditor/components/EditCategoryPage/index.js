import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import {
    TextInput,
    TextArea,
} from '../../../../public/components/Input';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class EditCategoryPage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    tabStyle = { none: 'none' };

    render() {
        const {
            className,
        } = this.props;
        return (
            <div styleName={className}>
                <div styleName="header">
                    <div styleName="title-children-parent">
                        <TextInput
                            label="title"
                            styleName="header-input"
                            showHintAndError={false}
                        />
                        <TextInput
                            label="Parent"
                            styleName="header-input"
                            showHintAndError={false}
                        />
                        <TextInput
                            label="Children"
                            styleName="header-input"
                            showHintAndError={false}
                        />
                    </div>
                    <TextArea
                        label="Description"
                        styleName="textarea-content"
                    />
                </div>
                <Tabs
                    activeLinkStyle={this.tabStyle}
                    styleName="tabs-container"
                >
                    <div styleName="tabs-header-container">
                        <TabLink
                            styleName="tab-header"
                            to="English"
                        >
                            English
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="French"
                        >
                            French
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="Spanish"
                        >
                            Spanish
                        </TabLink>
                        {/* Essential for border bottom, for more info contact AdityaKhatri */}
                        <div styleName="empty-tab" />
                    </div>
                    <TabContent
                        for="English"
                        styleName="tab"
                    >
                        n-gram-1
                    </TabContent>
                    <TabContent
                        for="French"
                        styleName="tab"
                    >
                        n-gram-2
                    </TabContent>
                    <TabContent
                        for="Spanish"
                        styleName="tab"
                    >
                        n-gram-3
                    </TabContent>
                </Tabs>
            </div>
        );
    }
}
