import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import VerticalTabs from '../../../../vendor/react-store/components/View/VerticalTabs/';
import styles from './styles.scss';
import { listToMap } from '../../../../vendor/react-store/utils/common';

import FaramGroup from '../../../../vendor/react-store/components/Input/Faram/FaramGroup';

import {
    editArySelectedSectorsSelector,
    assessmentSectorsSelector,
    assessmentSummaryStringsSelector,
} from '../../../../redux';

import CrossSector from './CrossSector';
import HumanitarianAccess from './HumanitarianAccess';
import Sector from './Sector';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    selectedSectors: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    sectors: PropTypes.array.isRequired,
    pending: PropTypes.bool.isRequired,
    assessmentSummaryStrings: PropTypes.func.isRequired,
    onActiveSectorChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    onActiveSectorChange: undefined,
};

const mapStateToProps = state => ({
    selectedSectors: editArySelectedSectorsSelector(state),
    sectors: assessmentSectorsSelector(state),
    assessmentSummaryStrings: assessmentSummaryStringsSelector(state),
});

const sectorIdentifier = 'sector';

@connect(mapStateToProps)
export default class Summary extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'crossSector',
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

    handleTabClick = (key) => {
        this.setState({ activeTab: key }, () => {
            if (!this.props.onActiveSectorChange) {
                return;
            }

            let activeSector;
            if (key.startsWith(sectorIdentifier)) {
                activeSector = this.selectedSectors[key];
            }
            this.props.onActiveSectorChange(activeSector);
        });
    }

    renderTabs = () => {
        const {
            sectors,
            selectedSectors: selectedSectorsList,
        } = this.props;

        const { activeTab } = this.state;

        const s = sectors.filter(
            d => selectedSectorsList.indexOf(String(d.id)) !== -1,
        );
        const selectedSectors = listToMap(
            s,
            d => `${sectorIdentifier}-${d.id}`,
            d => d.title,
        );
        this.selectedSectors = selectedSectors;

        const { assessmentSummaryStrings } = this.props;
        const tabs = {
            crossSector: assessmentSummaryStrings('crossSectorTitle'),
            humanitarianAccess: assessmentSummaryStrings('humanitarianAccessTitle'),
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
                    <CrossSector className={styles.view} />
                );
            case 'humanitarianAccess':
                return (
                    <HumanitarianAccess className={styles.view} />
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
            <div className={className}>
                {this.props.pending && <LoadingAnimation />}
                <FaramGroup faramElementName="summary">
                    <View />
                </FaramGroup>
                <Tabs />
            </div>
        );
    }
}
