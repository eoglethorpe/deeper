import CSSModules from 'react-css-modules';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import {
    TextInput,
} from '../../../../public/components/Input';
import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class KeyWords extends React.PureComponent {
    render() {
        return (
            <div styleName="keywords-content">
                <Tabs
                    activeLinkStyle={{ none: 'none' }}
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
                        <TextInput
                            styleName="keywords-words"
                            value="Cholera"
                            readOnly
                            showLabel={false}
                            showHintAndError={false}
                        />
                        <TextInput
                            styleName="keywords-words"
                            value="Pump"
                            readOnly
                            showLabel={false}
                            showHintAndError={false}
                        />
                        <TextInput
                            styleName="keywords-words"
                            value="Latrines"
                            readOnly
                            showLabel={false}
                            showHintAndError={false}
                        />
                        <TextInput
                            styleName="keywords-words"
                            value="Sanitation"
                            readOnly
                            showLabel={false}
                            showHintAndError={false}
                        />
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
