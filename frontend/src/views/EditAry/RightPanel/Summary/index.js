import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import VerticalTabs from '../../../../vendor/react-store/components/View/VerticalTabs/';
import styles from './styles.scss';
import { listToMap } from '../../../../vendor/react-store/utils/common';

import Form from '../../../../vendor/react-store/components/Input/Form';
import InputGroup from '../../../../vendor/react-store/components/Input/InputGroup';

import {
    leadIdFromRouteSelector,
    editArySelectedSectorsSelector,
    assessmentSectorsSelector,
    changeArySummaryForEditAryAction,
} from '../../../../redux';

import CrossSector from './CrossSector';
import HumanitarianAccess from './HumanitarianAccess';
import Sector from './Sector';

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    selectedSectors: PropTypes.array.isRequired,
    //
    // eslint-disable-next-line react/forbid-prop-types
    sectors: PropTypes.array.isRequired,

    activeLeadId: PropTypes.number.isRequired,
    formValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    fieldErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    formErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    changeArySummary: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
    formValues: {},
    fieldErrors: {},
    formErrors: {},
};

const mapStateToProps = state => ({
    selectedSectors: editArySelectedSectorsSelector(state),
    sectors: assessmentSectorsSelector(state),
    activeLeadId: leadIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    changeArySummary: params => dispatch(changeArySummaryForEditAryAction(params)),
});

const sectorIdentifier = 'sector';

@connect(mapStateToProps, mapDispatchToProps)
export default class Summary extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'crossSector',
            summary: undefined,
        };
    }

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'summary',
            styles.summary,
        ];

        return classNames.join(' ');
    }

    changeCallback = (values, formFieldErrors, formErrors) => {
        this.props.changeArySummary({
            lead: this.props.activeLeadId,
            formValues: values,
            fieldErrors: formFieldErrors,
            formErrors,
        });
    }

    handleTabClick = (key) => {
        this.setState({
            activeTab: key,
        });
    }

    handleSummaryChange = (v) => {
        this.setState({ summary: v });
    }

    renderTabs = () => {
        const {
            sectors,
            selectedSectors: selectedSectorsList,
        } = this.props;

        const { activeTab } = this.state;

        const s = [...sectors].filter(d => selectedSectorsList.indexOf(String(d.id)) !== -1);
        const selectedSectors = listToMap(s, d => `${sectorIdentifier}-${d.id}`, d => d.title);

        const tabs = {
            crossSector: 'Cross sector',
            humanitarianAccess: 'Humanitarian access',
            ...selectedSectors,
        };

        return (
            <VerticalTabs
                className={styles.tabs}
                tabs={tabs}
                onClick={this.handleTabClick}
                active={activeTab}
            />
        );
    }

    renderView = () => {
        const { activeTab } = this.state;

        switch (activeTab) {
            case 'crossSector':
                return (
                    <CrossSector
                        className={styles.view}
                    />
                );
            case 'humanitarianAccess':
                return (
                    <HumanitarianAccess
                        className={styles.view}
                    />
                );
            default:
                if (activeTab.includes('sector')) {
                    const startIndex = sectorIdentifier.length + 1;
                    const sectorId = activeTab.substr(startIndex);

                    return (
                        <Sector
                            className={styles.view}
                            sectorId={sectorId}
                        />
                    );
                }
                return null;
        }
    }

    render() {
        const className = this.getClassName();
        const Tabs = this.renderTabs;
        const View = this.renderView;

        return (
            <Form
                className={className}
                schema={this.props.schema}
                changeCallback={this.changeCallback}
                value={this.props.formValues}
                fieldErrors={this.props.fieldErrors}
                formErrors={this.props.formErrors}
                disabled={this.props.pending}
            >
                <InputGroup formname="summaryTable">
                    <View />
                </InputGroup>
                <Tabs />
            </Form>
        );
    }
}
