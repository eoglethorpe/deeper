import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    NumberInput,
} from '../../../../../public/components/Input';
import { afStrings } from '../../../../../common/constants';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
};

@CSSModules(styles)
export default class NumberFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        const { onChange } = this.props;

        onChange(
            undefined,
            this.createFilters(),
            this.createExportable(),
        );
    }

    createFilters = () => {
        const { title, widgetKey } = this.props;

        return [{
            title,
            widgetKey,
            key: widgetKey,
            filterType: 'number',
            properties: {
                type: 'number',
            },
        }];
    }

    createExportable = () => {
        const excel = {
            title: this.props.title,
        };

        return {
            widgetKey: this.props.widgetKey,
            data: {
                excel,
            },
        };
    }

    render() {
        return (
            <div styleName="number-list">
                <NumberInput
                    styleName="number-input"
                    placeholder={afStrings.numberPlaceholder}
                    showLabel={false}
                    showHintAndError={false}
                    separator=" "
                    disabled
                />
            </div>
        );
    }
}
