from datetime import datetime
from .utils import set_filter_data, set_export_data


ONE_DAY = 24 * 60 * 60


def update_attribute(entry, widget, data, widget_data):
    value = data.get('value')

    date = value and datetime.strptime(value, '%Y-%m-%d')
    number = date and int(date.timestamp() / ONE_DAY)
    set_filter_data(
        entry,
        widget,
        number=number,
    )

    set_export_data(
        entry,
        widget,
        {
            'excel': {
                'value': date and date.strftime('%d-%m-%Y'),
            },
        },
    )
