import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    DateInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';


const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired, //eslint-disable-line
};

@CSSModules(styles)
export default class DateFrameworkList extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.props.editAction(this.handleEdit);
    }

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
                type: 'date',
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

    handleEdit = () => {
        console.log('Edit Date (List)');
    }

    render() {
        return (
            <div styleName="date-list">
                <DateInput
                    styleName="date-input"
                    showHintAndError={false}
                    disabled
                />
            </div>
        );
    }
}
