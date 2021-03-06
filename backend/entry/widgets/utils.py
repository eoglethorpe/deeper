from analysis_framework.models import Filter, Exportable
from entry.models import FilterData, ExportData


def set_filter_data(entry, widget, key=None,
                    number=None, values=None):
    key = key or widget.key
    filter = Filter.objects.filter(
        widget_key=widget.key,
        analysis_framework=widget.analysis_framework,
        key=key,
    ).first()
    f, _ = FilterData.objects.update_or_create(
        entry=entry,
        filter=filter,
        defaults={
            'number': number,
            'values': values,
        },
    )
    return f


def set_export_data(entry, widget, data):
    exportable = Exportable.objects.get(
        widget_key=widget.key,
        analysis_framework=widget.analysis_framework,
    )
    e, _ = ExportData.objects.update_or_create(
        entry=entry,
        exportable=exportable,
        defaults={
            'data': data,
        },
    )
    return e
