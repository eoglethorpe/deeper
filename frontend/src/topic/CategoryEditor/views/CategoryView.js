import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import {
    SelectInput,
} from '../../../public/components/Input';
import {
    PrimaryButton,
} from '../../../public/components/Action';
import styles from './styles.scss';
import Categories from '../components/Categories';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class CategoryView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    render() {
        return (
            <div styleName={this.props.className}>
                <div styleName="header">
                    <div styleName="search-category">
                        <SelectInput
                            placeholder="Select a Category"
                            showLabel={false}
                            showHintAndError={false}
                        />
                    </div>
                    <div styleName="pusher" />
                    <div styleName="add-category-btn">
                        <PrimaryButton>
                            Add New Category
                        </PrimaryButton>
                    </div>
                </div>
                <Categories />
            </div>
        );
    }
}
