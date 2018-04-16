import React from 'react';
import PropTypes from 'prop-types';

import List from '../../../../../vendor/react-store/components/View/List';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    options: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func,
};
const defaultProps = {
    className: '',
    options: {},
    value: '',
    onChange: () => {},
};

export default class ScaleInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            'scale-input',
            styles.scaleInput,
        ];

        return classNames.join(' ');
    }

    getOptionClassName = (key) => {
        const { value } = this.props;

        const classNames = [
            styles.value,
        ];

        const isActive = key === value;

        if (isActive) {
            classNames.push(styles.active);
        }

        return classNames.join(' ');
    }

    handleOptionClick = (key) => {
        const {
            value,
            onChange,
        } = this.props;

        if (value !== key) {
            onChange(key);
        }
    }

    renderOption = (k, valueKey) => {
        const { options } = this.props;
        const data = options[valueKey];

        const style = {
            backgroundColor: data.color,
        };

        const className = this.getOptionClassName(valueKey);

        return (
            <button
                onClick={() => { this.handleOptionClick(valueKey); }}
                key={valueKey}
                className={className}
                title={data.title}
                style={style}
            />
        );
    }

    render() {
        const { options } = this.props;
        const className = this.getClassName();
        const optionKeys = Object.keys(options);

        return (
            <div className={className}>
                <List
                    data={optionKeys}
                    modifier={this.renderOption}
                />
            </div>
        );
    }
}
