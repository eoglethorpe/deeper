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

    isLastColumn: PropTypes.bool,
    title: PropTypes.string,
};

const defaultProps = {
    subcategories: [],
    title: 'Title',
    selectedSubcategoryId: undefined,
    isLastColumn: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class SubcategoryColumn extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keyExtractor = d => d.id;

    getSubcategoryStyleName = (id) => {
        const {
            selectedSubcategoryId,
            isLastColumn,
        } = this.props;

        const styleNames = [];

        styleNames.push(styles['sub-category']);

        if (id === selectedSubcategoryId) {
            styleNames.push(isLastColumn ? styles.active : styles.selected);
        }

        return styleNames.join(' ');
    }

    getSubcategory = (key, data) => (
        <button
            key={key}
            onClick={() => this.handleSubcategoryClick(key)}
            className={this.getSubcategoryStyleName(key)}
            onDragEnter={this.handleSubcategoryDragEnter}
            onDragLeave={this.handleSubcategoryDragLeave}
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

    addDragStyleName = (e) => {
        const { target } = e;

        const classNames = target.className.split(' ');
        const dragStyleName = styles['drag-enter'];

        if (classNames.findIndex(d => d === dragStyleName) === -1) {
            classNames.push(styles['drag-enter']);
        }

        target.className = classNames.join(' ');
    }

    removeDragStyleName = (e) => {
        const { target } = e;

        const classNames = target.className.split(' ');
        const dragStyleName = styles['drag-enter'];

        const styleIndex = classNames.findIndex(d => d === dragStyleName);
        if (styleIndex !== -1) {
            classNames.splice(styleIndex, 1);
        }

        target.className = classNames.join(' ');
    }

    handleSubcategoryDragEnter = (e) => {
        this.addDragStyleName(e);
    }

    handleSubcategoryDragLeave = (e) => {
        this.removeDragStyleName(e);
    }

    handleSubcategoryDragOver = (e) => {
        e.preventDefault();
    }

    handleSubcategoryDrop = (key, e) => {
        e.preventDefault();
        this.removeDragStyleName(e);

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
        } = this.props;

        return (
            <div
                styleName="column"
            >
                <header styleName="header">
                    <h4
                        styleName="heading"
                    >
                        {this.props.title}
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
