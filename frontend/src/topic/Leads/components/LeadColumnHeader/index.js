import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    sortOrder: PropTypes.string,
    sortable: PropTypes.bool,
};

const defaultProps = {
    className: '',
    label: '',
    sortOrder: undefined,
    sortable: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class LeadColumnHeader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const styleName = this.getStyleName(props);
        this.state = {
            styleName,
        };
    }

    componentWillReceiveProps(nextProps) {
        const styleName = this.getStyleName(nextProps);
        this.setState({
            styleName,
        });
    }

    getStyleName = (props) => {
        const styleNames = [];
        const {
            sortOrder,
            sortable,
        } = props;

        styleNames.push('lead-column-header');

        if (sortable) {
            styleNames.push('sortable');

            if (sortOrder) {
                styleNames.push('active');
                styleNames.push(sortOrder);
            }
        }

        return styleNames.join(' ');
    }

    render() {
        const {
            className,
            label,
        } = this.props;

        return (
            <div
                className={className}
                styleName={this.state.styleName}
            >
                {label}
            </div>
        );
    }
}
