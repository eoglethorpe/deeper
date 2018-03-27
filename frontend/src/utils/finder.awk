#!/usr/bin/gawk -f
function alphabetical_sort(i1, v1, i2, v2) {
    v1 = v1 ""
    v2 = v2 ""
    if (v1 < v2)
        return -1
    return (v1 != v2)
}
BEGIN {
    labels[""] = 0
    filenameLens[""] = 0

    # To store values from match
    capture[""] = 0
}
{
    while (match($0, /(\w+)Strings\('(\w+)'/, capture)) {
        file = FILENAME
        linenumber = FNR
        class = capture[1]
        label = capture[2]

        # classes[label] = class
        uniqueClasses[class] = "true"

        labelsLen = labelsLens[class]++
        labels[class][labelsLen] = label

        filenameLen = filenameLens[label]++
        filenames[label][filenameLen] = file " " linenumber

        $0 = substr($0, RSTART+RLENGTH)
    }
}
END {
    PROCINFO["sorted_in"] = "alphabetical_sort"

    SP = "    "
    print "/* eslint-disable quote-props */"
    print "const usage = {"

    for (class in uniqueClasses) {
        print SP "'" class "': {"

        lastVal = ""
        for (labelId in labels[class]) {
            label = labels[class][labelId]
            if (label == lastVal) {
                # print "\t", labels[class][label] "*"
            } else {
                print SP SP "'" label "': ["
                lastVal = label
                for (filenameId in filenames[label]) {
                    filename = filenames[label][filenameId]
                    print SP SP SP "'" filename "',"
                }
                print SP SP "],"
            }
        }
        print SP "},"
    }
    print "};"
    print "/* eslint-enable quote-props */"
    print "export default usage;"
}
