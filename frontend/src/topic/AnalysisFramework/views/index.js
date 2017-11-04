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
    activeProjectSelector,
    currentUserProjectsSelector,
} from '../../../common/selectors/domainData';

import styles from './styles.scss';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
    activeProject: PropTypes.number.isRequired, // eslint-disable-line
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    currentUserProjects: currentUserProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;

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

    render() {
        const layout = [
            { i: 'a', x: 0, y: 0, w: 1, h: 2, static: true },
            { i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
            { i: 'c', x: 4, y: 0, w: 1, h: 2 },
        ];

        return (
            <div styleName="analysis-framework">
                <Helmet>
                    <title>{ pageTitles.analysisFramework }</title>
                </Helmet>
                <ReactGridLayout
                    styleName="grid-layout"
                    layout={layout}
                    cols={12}
                    rows={20}
                    rowHeight={100}
                    width={1200}
                >
                    <div
                        key="a"
                        styleName="a"
                    >
                        A
                    </div>
                    <div
                        key="b"
                        styleName="b"
                    >
                        B
                    </div>
                    <div
                        key="c"
                        styleName="c"
                    >
                        C
                    </div>
                </ReactGridLayout>
            </div>
        );
    }
}
