import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    ListView,
} from '../../../public/components/View';

import styles from './styles.scss';

const propTypes = {
    level: PropTypes.number.isRequired,
    selectedSubcategoryId: PropTypes.string,

    subcategories: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            title: PropTypes.string,
        }),
    ),

    onNewSubcategory: PropTypes.func.isRequired,
    onSubcategoryClick: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
};

const defaultProps = {
    subcategories: [],
    selectedSubcategoryId: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class SubcategoryColumn extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keyExtractor = d => d.id;

    getSubcategoryStyleName = (id) => {
        const {
            selectedSubcategoryId,
        } = this.props;

        const styleNames = [];

        styleNames.push(styles['sub-category']);

        if (id === selectedSubcategoryId) {
            styleNames.push(styles.active);
        }

        return styleNames.join(' ');
    }

    getSubcategory = (key, data) => (
        <button
            key={key}
            onClick={() => this.handleSubcategoryClick(key)}
            className={this.getSubcategoryStyleName(key)}
            onDragOver={this.handleSubcategoryDragOver}
            onDrop={(e) => { this.handleSubcategoryDrop(key, e); }}
        >
            <span className={styles.title}>
                { data.title }
            </span>
            {
                data.subcategories.length >= 0 && (
                    <span className={styles.number}>
                        { data.subcategories.length }
                    </span>
                )
            }
        </button>
    )

    handleSubcategoryDragOver = (e) => {
        e.preventDefault();
    }

    handleSubcategoryDrop = (key, e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text');

        const {
            level,
            onDrop,
        } = this.props;

        onDrop(level, key, data);
    }

    handleNewSubcategoryButtonClick = () => {
        const {
            level,
            onNewSubcategory,
        } = this.props;

        onNewSubcategory(level);
    }

    handleSubcategoryClick = (id) => {
        const {
            level,
            onSubcategoryClick,
        } = this.props;

        onSubcategoryClick(level, id);
    }

    render() {
        const {
            subcategories,
            level,
        } = this.props;

        return (
            <div
                styleName="column"
            >
                <header styleName="header">
                    <h4
                        styleName="heading"
                    >
                        Level: {level}
                    </h4>
                    <button
                        onClick={this.handleNewSubcategoryButtonClick}
                    >
                        Add subcategory
                    </button>
                </header>
                <ListView
                    styleName="sub-category-list"
                    data={subcategories}
                    modifier={this.getSubcategory}
                    keyExtractor={SubcategoryColumn.keyExtractor}
                />
            </div>
        );
    }
}
