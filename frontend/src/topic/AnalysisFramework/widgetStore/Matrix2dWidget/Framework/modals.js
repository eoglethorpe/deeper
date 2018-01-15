import React from 'react';
import {
    Button,
    PrimaryButton,
} from '../../../../../public/components/Action';

import {
    TextInput,
} from '../../../../../public/components/Input';

import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ListView,
} from '../../../../../public/components/View';

import {
    afStrings,
    iconNames,
} from '../../../../../common/constants';

const emptyList = [];

export const getEditWidgetModal = (parent) => {
    const {
        title,
        data,
        showEditWidgetModal,
    } = parent.state;

    const {
        sectors = emptyList,
    } = data;

    if (!showEditWidgetModal) {
        return null;
    }

    return (
        <Modal
            styleName="edit-widget-modal"
            onClose={parent.handler.editWidgetModalClose}
        >
            <ModalHeader
                title={`Edit ${title || afStrings.titleLabel}`}
            />
            <ModalBody styleName="modal-body">
                <TextInput
                    styleName="title-input"
                    onChange={parent.handler.widgetTitleInputChange}
                    value={title}
                    label={afStrings.titleLabel}
                    showHintAndError={false}
                />
                <section styleName="edit-sectors">
                    <header styleName="header">
                        <h4 styleName="heading">
                            {afStrings.dimensionXLabel}
                        </h4>
                        <PrimaryButton
                            onClick={parent.handler.addSectorButtonClick}
                            title={afStrings.addDimensionXButtonLabel}
                        >
                            <i className={iconNames.add} />
                        </PrimaryButton>
                    </header>
                    <ListView
                        styleName="list"
                        data={sectors}
                        modifier={parent.renderer.editSector}
                        keyExtractor={d => d.id}
                    />
                </section>
                <section styleName="edit-dimensions">
                    <header styleName="header">
                        <h4 styleName="heading">
                            {afStrings.dimensionYLabel}
                        </h4>
                        <PrimaryButton
                            tabIndex="-1"
                            onClick={parent.handler.addDimensionButtonClick}
                            title={afStrings.addDimensionYButtonLabel}
                        >
                            <i className={iconNames.add} />
                        </PrimaryButton>
                    </header>
                    <ListView
                        styleName="list"
                        data={data.dimensions || emptyList}
                        modifier={parent.renderer.editDimension}
                        keyExtractor={d => d.id}
                    />
                </section>
            </ModalBody>
            <ModalFooter>
                <Button
                    onClick={parent.handler.editWidgetModalCancelButtonClick}
                >
                    {afStrings.cancelButtonLabel}
                </Button>
                <PrimaryButton
                    onClick={parent.handler.editWidgetModalSaveButtonClick}
                >
                    {afStrings.saveButtonLabel}
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
};

export const getEditSectorsModal = (parent) => {
    const {
        data,
        showEditSectorsModal,
        selectedSectorIndex,
    } = parent.state;

    const {
        sectors = emptyList,
    } = data;

    if (!showEditSectorsModal) {
        return null;
    }

    return (
        <Modal
            styleName="edit-sectors-modal"
            onClose={parent.handler.editSectorsModalClose}
        >
            <ModalHeader
                title={afStrings.addDimensionModalTitle}
            />
            <ModalBody styleName="modal-body">
                <ListView
                    styleName="select-sector-list"
                    data={sectors || emptyList}
                    modifier={parent.renderer.selectSector}
                    keyExtractor={d => d.id}
                />
                <div styleName="edit-subsectors">
                    <header styleName="header">
                        <h4>
                            {afStrings.subDimensionsLabel}
                        </h4>
                        <PrimaryButton
                            onClick={parent.handler.addSubsectorButtonClick}
                            title={afStrings.addButtonLabel}
                        >
                            <i className={iconNames.add} />
                        </PrimaryButton>
                    </header>
                    <ListView
                        styleName="sub-sector-list"
                        data={
                            (sectors[selectedSectorIndex] || emptyList).subsectors || emptyList
                        }
                        modifier={parent.renderer.editSubsector}
                        keyExtractor={d => d.id}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button
                    onClick={parent.handler.editSectorsModalCancelButtonClick}
                >
                    {afStrings.cancelButtonLabel}
                </Button>
                <PrimaryButton
                    onClick={parent.handler.editSectorsModalSaveButtonClick}
                >
                    {afStrings.saveButtonLabel}
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
};
