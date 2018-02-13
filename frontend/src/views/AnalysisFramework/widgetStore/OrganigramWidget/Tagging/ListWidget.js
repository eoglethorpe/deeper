import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import OrgChart from '../../../../../vendor/react-store/components/Visualization/OrgChart';
import Button from '../../../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../../../../vendor/react-store/components/Action/Button/AccentButton';
import Modal from '../../../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../../../vendor/react-store/components/View/Modal/Footer';

import { iconNames } from '../../../../../constants';
import { afStringsSelector } from '../../../../../redux';
import BoundError from '../../../../../components/BoundError';

import styles from './styles.scss';
import { updateAttribute } from './utils';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    data: undefined,
    attribute: {},
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
@CSSModules(styles)
export default class OrganigramTaggingList extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { attribute: { values = [] } = {} } = props;
        this.state = {
            showEditModal: false,
            values,
        };

        updateAttribute(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.attribute !== nextProps.attribute) {
            const { attribute: { values = [] } = {} } = nextProps;
            this.setState({
                values,
            });

            updateAttribute(nextProps);
        }
    }

    handleShowModal = () => {
        this.setState({ showEditModal: true });
    }

    handleCancelClick = () => {
        this.setState({ showEditModal: false });

        const { attribute: { values = [] } = {} } = this.props;
        this.setState({ values });
    }

    handleSaveClick = () => {
        this.setState({ showEditModal: false });

        const { api, id, entryId } = this.props;
        const attribute = { values: this.state.values };

        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .apply();
    }

    handleSelection = (values) => {
        this.setState({ values });
    };

    idAccessor = organ => organ.key;
    labelAccessor = organ => organ.title;
    childAccessor = organ => organ.organs;

    render() {
        return (
            <div styleName="organigram-list">
                <ul>
                    {
                        this.state.values.map(value => (
                            <li key={value.id}>
                                {value.name}
                            </li>
                        ))
                    }
                </ul>
                <AccentButton
                    styleName="show-organigram-button"
                    onClick={this.handleShowModal}
                    iconName={iconNames.chart}
                    transparent
                />
                { this.state.showEditModal &&
                    <Modal styleName="edit-value-modal">
                        <ModalHeader title={this.props.afStrings('organigramWidgetLabel')} />
                        <ModalBody>
                            <OrgChart
                                data={this.props.data}
                                labelAccessor={this.labelAccessor}
                                idAccessor={this.idAccessor}
                                childAccessor={this.childAccessor}
                                onSelection={this.handleSelection}
                                value={this.state.values}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={this.handleCancelClick} >
                                {this.props.afStrings('cancelButtonLabel')}
                            </Button>
                            <PrimaryButton onClick={this.handleSaveClick} >
                                {this.props.afStrings('applyButtonLabel')}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                }
            </div>
        );
    }
}
