import React from 'react';
import { afStrings } from '../../../../../common/constants';

// eslint-disable-next-line react/prefer-stateless-function
export default class NumberMatrixList extends React.PureComponent {
    render() {
        return (
            <div>
                {afStrings.numberMatrixWidgetLabel}
            </div>
        );
    }
}
