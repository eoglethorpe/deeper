import CSSModules from 'react-css-modules';
import React from 'react';
import { connect } from 'react-redux';

import {
    entryStringsSelector,
    afStringsSelector,
} from '../../common/redux';

import ResizableH from '../../public/components/View/Resizable/ResizableH';

import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';

import styles from './styles.scss';


const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Ary extends React.PureComponent {
    render() {
        return (
            <ResizableH
                styleName="ary"
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
                leftChild={<LeftPanel />}
                rightChild={<RightPanel />}
            />
        );
    }
}
