import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Button, { DangerButton } from '../../../../public/components/Button';
import TextInput from '../../../../public/components/TextInput';
import styles from './styles.scss';

const propTypes = {
    iso: PropTypes.string.isRequired,
};

@CSSModules(styles, { allowMultiple: true })
export default class CountryGeneral extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.adminLevelList = [
            {
                id: 1,
                level: 1,
                name: 'Country',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                id: 2,
                level: 2,
                name: 'Zone',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                id: 3,
                level: 3,
                name: 'District',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                id: 4,
                level: 4,
                name: 'GABISA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
        ];

        this.state = {
            displayAdminLevelList: this.adminLevelList,
        };
    }

    addAdminLevel = () => {
        const len = this.state.displayAdminLevelList.length;
        const displayAdminLevelList = [...this.state.displayAdminLevelList];
        displayAdminLevelList.push({
            level: len + 1,
        });

        this.setState({
            displayAdminLevelList,
        });

        const parent = this.addAdminButton.parentNode.parentNode;
        setTimeout(
            () => {
                parent.scrollTop = this.addAdminButton.scrollHeight;
            },
            0);
    };

    deleteAdminLevel = (adminLevel) => {
        const displayAdminLevelList = this.state.displayAdminLevelList.filter(
            level => level.id !== adminLevel.id,
        );

        this.setState({
            displayAdminLevelList,
        });
    }

    render() {
        const { iso } = this.props;
        const { displayAdminLevelList } = this.state;

        return (
            <div
                ref={(el) => { this.addAdminButton = el; }}
                styleName="country-general"
            >
                <div styleName="form-map-container">
                    <form styleName="details-form">
                        {
                            iso &&
                            <TextInput
                                disabled
                                initialValue={iso}
                                label="Country code"
                                placeholder="NPL"
                                styleName="text-input"
                            />
                        }
                        {
                            !iso &&
                            <TextInput
                                label="Country code"
                                placeholder="NPL"
                                styleName="text-input"
                            />
                        }
                        <TextInput
                            label="Name"
                            placeholder="Nepal"
                            styleName="text-input"
                        />
                        <TextInput
                            label="WB Region"
                            placeholder="Enter WB Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="WB Income Region"
                            placeholder="Enter WB Income Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="OCHA Region"
                            placeholder="Enter OCHA Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="ECHO Region"
                            placeholder="Enter ECHO Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="UN Geographical Region"
                            placeholder="Enter UN Geographical Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="UN Geographical Sub Region"
                            placeholder="Enter UN Geographical Sub Region"
                            styleName="text-input"
                        />
                    </form>
                    <div styleName="map-container">
                        The map
                    </div>
                </div>
                <div styleName="admin-levels">
                    <div styleName="header">
                        Admin Levels
                    </div>
                    <div styleName="admin-levels-list">
                        {
                            displayAdminLevelList.map(adminLevel => (
                                <div
                                    key={adminLevel.id}
                                    styleName="admin-level-details"
                                >
                                    <TextInput
                                        initialValue={adminLevel.name}
                                        label="Admin level name"
                                        placeholder="Country"
                                        styleName="text-input"
                                    />
                                    <TextInput
                                        initialValue={adminLevel.nameProperty}
                                        label="Name property"
                                        placeholder="NAME_ENGL"
                                        styleName="text-input"
                                    />
                                    <TextInput
                                        initialValue={adminLevel.pcodeProperty}
                                        label="Pcode property"
                                        placeholder="NAME_PCODE"
                                        styleName="text-input"
                                    />
                                    <TextInput
                                        initialValue={adminLevel.parentNameProperty}
                                        label="Parent name property"
                                        placeholder="NAME_ENFG"
                                        styleName="text-input"
                                    />
                                    <TextInput
                                        initialValue={adminLevel.parentPcodeProperty}
                                        label="Parent pcode property"
                                        placeholder="NAME_PPCODE"
                                        styleName="text-input"
                                    />
                                    <div styleName="action-btns">
                                        <DangerButton
                                            onClick={() => this.deleteAdminLevel(adminLevel)}
                                        >
                                            Delete
                                        </DangerButton>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div styleName="footer">
                        <Button onClick={this.addAdminLevel}>Add admin level</Button>
                    </div>
                </div>
            </div>
        );
    }
}
