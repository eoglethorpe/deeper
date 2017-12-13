import React from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import MultiCheckboxCollection from '../../../../public/components/Input/MultiCheckboxCollection';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class StructureSection extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    constructor(props) {
        super(props);

        this.sample = [
            {
                key: 'rzjesources',
                title: 'Resource',
                options: [
                    {
                        key: 'stapler',
                        title: 'Satappler',
                        isChecked: false,
                    },
                    {
                        key: 'scales',
                        title: 'SCALAS',
                        isChecked: true,
                    },
                    {
                        key: 'Duster',
                        title: 'Duster',
                        isChecked: false,
                    },
                    {
                        key: 'Chalk',
                        title: 'Chalked',
                        isChecked: true,
                    },
                ],
            },
            {
                key: 'Chain',
                title: 'Chainss',
                isChecked: false,
            },
            {
                key: 'Supply',
                title: 'Supplies',
                options: [
                    {
                        key: 'sapler',
                        title: 'Saler',
                        isChecked: true,
                    },
                    {
                        key: 'scals',
                        title: 'SLAS',
                        isChecked: true,
                    },
                    {
                        key: 'Duster',
                        title: 'Duster',
                        isChecked: false,
                    },
                    {
                        key: 'Chalk',
                        title: 'Chalked',
                        isChecked: false,
                    },
                ],
            },
        ];
    }
    render() {
        return (
            <div
                className={this.props.className}
                styleName="report-structure"
            >
                <h2> Report Structure</h2>
                <div styleName="multi-checkbox">
                    <MultiCheckboxCollection
                        options={this.sample}
                        onChange={() => {}}
                    />
                </div>
            </div>
        );
    }
}
