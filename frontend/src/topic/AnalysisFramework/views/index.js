import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import { connect } from 'react-redux';

import { pageTitles } from '../../../common/utils/labels';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';
import {
    currentUserProjectsSelector,
} from '../../../common/selectors/domainData';

import {
    activeProjectSelector,
} from '../../../common/selectors/siloDomainData';

import {
    Responsive,
} from '../../../public/components/General';

import {
    TextInput,
} from '../../../public/components/Input';

import {
    TransparentButton,
} from '../../../public/components/Action';

import styles from './styles.scss';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
    activeProject: PropTypes.number.isRequired, // eslint-disable-line
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    currentUserProjects: currentUserProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@Responsive
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            items: [
                {
                    key: 'a',
                    gridData: { x: 2, y: 2, w: 30, h: 20 },
                },
            ],
        };
    }

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
                pageTitles.projectPanel,
            ],
        });
    }

    getGridItems = () => {
        const {
            items,
        } = this.state;

        return items.map(item => (
            <div
                key={item.key}
                data-grid={item.gridData}
                styleName="grid-item"
            >
                <header
                    styleName="header"
                >
                    <h2>Grid item</h2>
                    <div styleName="actions">
                        <span
                            styleName="drag-handle"
                            className="ion-arrow-move drag-handle"
                        />
                        <TransparentButton
                            styleName="close-button"
                        >
                            <span className="ion-android-close" />
                        </TransparentButton>
                    </div>
                </header>
                <div styleName="content">
                    <TextInput
                        label="Wow"
                    />
                </div>
            </div>
        ));
    }

    handleItemResize = (layout, oldItem, newItem) => {
        console.log(layout, oldItem, newItem);
    }

    handleItemDragStop = (e, node) => {
        console.log(e, node);
    }

    render() {
        const {
            width,
            height,
        } = this.props.boundingClientRect;

        const numOfRows = 100;
        const numOfColumns = 100;
        const margin = [0, 0];
        const rowHeight = parseInt((height || 0) / numOfRows, 10);

        return (
            <div styleName="analysis-framework">
                <Helmet>
                    <title>{ pageTitles.analysisFramework }</title>
                </Helmet>
                <div
                    styleName="left"
                >
                    Widgets
                </div>
                <div
                    styleName="right"
                >
                    <ReactGridLayout
                        styleName="grid-layout"
                        cols={numOfColumns}
                        margin={margin}
                        width={width || 0}
                        rowHeight={rowHeight}
                        compactType={null}
                        onDragStop={this.handleItemDragStop}
                        onResizeStop={this.handleItemResize}
                        draggableHandle=".drag-handle"
                    >
                        { this.getGridItems() }
                    </ReactGridLayout>
                </div>
            </div>
        );
    }
}
