import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    selectedSubcategorySelector,
} from '../../../common/redux';

import {
    PrimaryButton,
} from '../../../public/components/Action';

import {
    TextInput,
    TextArea,
} from '../../../public/components/Input';

import styles from './styles.scss';

const propTypes = {
    subcategory: PropTypes.shape({
        id: PropTypes.string,
    }),
};

const defaultProps = {
    subcategory: {},
};

const mapStateToProps = state => ({
    subcategory: selectedSubcategorySelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class SubcategoryPropertyPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            subcategory,
        } = this.props;

        return (
            <div
                styleName="property-panel"
            >
                <header
                    styleName="header"
                >
                    <h3
                        styleName="heading"
                    >
                        Subcategory details
                    </h3>
                    <div styleName="action-buttons">
                        <PrimaryButton>
                            Apply
                        </PrimaryButton>
                    </div>
                </header>
                <section
                    styleName="properties"
                >
                    <TextInput
                        label="Title"
                        placeholder="eg: Wash"
                        value={subcategory.title}
                    />
                    <TextArea
                        label="Description"
                        placeholder="Description of the subcategory"
                        value={subcategory.description}
                    />
                </section>
                <section
                    styleName="ngrams"
                >
                    N-grams
                </section>
            </div>
        );
    }
}
