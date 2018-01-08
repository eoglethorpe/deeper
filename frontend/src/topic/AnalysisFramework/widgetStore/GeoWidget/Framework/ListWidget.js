import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    iconNames,
    afStrings,
} from '../../../../../common/constants';

import styles from './styles.scss';
import {
    TransparentButton,
} from '../../../../../public/components/Action';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired, //eslint-disable-line
};

@CSSModules(styles)
export default class GeoFrameworkList extends React.PureComponent {
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
            filterType: 'list',
            properties: {
                type: 'geo',
            },
        }];
    }

    createExportable = () => {
        const excel = {
            type: 'geo',
        };

        return {
            widgetKey: this.props.widgetKey,
            data: {
                excel,
            },
        };
    }

    handleEdit = () => {
        console.log('Edit Geographic Location (List)');
    }

    render() {
        return (
            <div styleName="geo-list">
                <TransparentButton>
                    {afStrings.geoAreaButtonLabel} <i className={iconNames.globe} />
                </TransparentButton>
            </div>
        );
    }
}
