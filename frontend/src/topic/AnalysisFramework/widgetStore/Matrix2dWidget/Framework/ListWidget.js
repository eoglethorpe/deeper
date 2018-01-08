import React from 'react';
import { afStrings } from '../../../../../common/constants';

// eslint-disable-next-line react/prefer-stateless-function
export default class Matrix2dList extends React.PureComponent {
    render() {
        return (
            <div>
                {afStrings.matrix2DWidgetLabel}
            </div>
        );
    }
}
