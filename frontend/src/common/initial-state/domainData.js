const initialDomainDataState = {

    // index is project id
    projects: {
        1: {
        },
    },

    // index is project id
    leads: {
        1: [
        ],
    },
    leadFilterOptions: {
        1: {
        },
    },
    totalLeadsCount: {
    },

    // index is project id
    entries: {
        /*
        1: [
            entryGroup1,
            entryGroup2,
            {
                leadName: 'blah blah',
                entries: [],
            },
        ],

        2: {

        },
    */
    },

    users: {
        1: {
            information: {
                id: 14,
                username: 'hari@hari.com',
                email: 'hari@hari.com',
                firstName: 'hari',
                lastName: 'hari',
                displayName: 'hari',
                displayPicture: null,
                organization: 'hari',
            },
            projects: [
            ],
            userGroups: [
                {
                    id: 1,
                    title: 'Togglecorp',
                    rights: 'Admin',
                    createdAt: '2017-10-26T04:47:12.381611Z',
                    joinedAt: '2017-10-26T04:47:12.381611Z',
                    memberships: [],
                },
                {
                    id: 2,
                    title: 'ACAPS',
                    rights: 'Admin',
                    createdAt: '2016-12-26T04:47:12.381611Z',
                    joinedAt: '2017-10-26T04:47:12.381611Z',
                    memberships: [],
                },
            ],
        },
    },
    countries: [
        /*
        { id: 1, title: 'Afghanistan', code: 'AFG' },
        { id: 2, title: 'Aland Islands', code: 'ALA' },
        { id: 3, title: 'Albania', code: 'ALB' },
        { id: 4, title: 'Algeria', code: 'DZA' },
        { id: 5, title: 'Nepal', code: 'NLP' },
        { fullName: 'American Samoa', iso: 'ASM', countryId: 'ASM' },
        { fullName: 'Andorra', iso: 'AND', countryId: 'AND' },
        { fullName: 'Angola', iso: 'AGO', countryId: 'AGO' },
        { fullName: 'Anguilla', iso: 'AIA', countryId: 'AIA' },
        { fullName: 'Antarctica', iso: 'ATA', countryId: 'ATA' },
        { fullName: 'Antigua and Barbuda', iso: 'ATG', countryId: 'ATG' },
        { fullName: 'Argentina', iso: 'ARG', countryId: 'ARG' },
        { fullName: 'Armenia', iso: 'ARM', countryId: 'ARM' },
        { fullName: 'Aruba', iso: 'ABW', countryId: 'ABW' },
        { fullName: 'Australia', iso: 'AUS', countryId: 'AUS' },
        { fullName: 'Austria', iso: 'AUT', countryId: 'AUT' },
        { fullName: 'Azerbaijan', iso: 'AZE', countryId: 'AZE' },
        { fullName: 'Bahamas', iso: 'BHS', countryId: 'BHS' },
        { fullName: 'Bahrain', iso: 'BHR', countryId: 'BHR' },
        { fullName: 'Bangladesh', iso: 'BGD', countryId: 'BGD' },
        { fullName: 'Barbados', iso: 'BRB', countryId: 'BRB' },
        { fullName: 'Belarus', iso: 'BLR', countryId: 'BLR' },
        { fullName: 'Belgium', iso: 'BEL', countryId: 'BEL' },
        { fullName: 'Belize', iso: 'BLZ', countryId: 'BLZ' },
        { fullName: 'Benin', iso: 'BEN', countryId: 'BEN' },
        { fullName: 'Bermuda', iso: 'BMU', countryId: 'BMU' },
        { fullName: 'Bhutan', iso: 'BTN', countryId: 'BTN' },
        { fullName: 'Bolivia', iso: 'BOL', countryId: 'BOL' },
        { fullName: 'Bosnia and Herzegovina', iso: 'BIH', countryId: 'BIH' },
        { fullName: 'Botswana', iso: 'BWA', countryId: 'BWA' },
        { fullName: 'Bouvet Island', iso: 'BVT', countryId: 'BVT' },
        { fullName: 'Brazil', iso: 'BRA', countryId: 'BRA' },
        { fullName: 'British Virgin Islands', iso: 'VGB', countryId: 'VGB' },
        { fullName: 'British Indian Ocean Territory', iso: 'IOT', countryId: 'IOT' },
        { fullName: 'Brunei Darussalam', iso: 'BRN', countryId: 'BRN' },
        { fullName: 'Bulgaria', iso: 'BGR', countryId: 'BGR' },
        { fullName: 'Burkina Faso', iso: 'BFA', countryId: 'BFA' },
        { fullName: 'Burundi', iso: 'BDI', countryId: 'BDI' },
        { fullName: 'Cambodia', iso: 'KHM', countryId: 'KHM' },
        { fullName: 'Cameroon', iso: 'CMR', countryId: 'CMR' },
        { fullName: 'Canada', iso: 'CAN', countryId: 'CAN' },
        { fullName: 'Cape Verde', iso: 'CPV', countryId: 'CPV' },
        { fullName: 'Cayman Islands', iso: 'CYM', countryId: 'CYM' },
        { fullName: 'Central African Republic', iso: 'CAF', countryId: 'CAF' },
        { fullName: 'Chad', iso: 'TCD', countryId: 'TCD' },
        { fullName: 'Chile', iso: 'CHL', countryId: 'CHL' },
        { fullName: 'China', iso: 'CHN', countryId: 'CHN' },
        { fullName: 'Hong Kong', iso: ' SAR China,HKG', countryId: 'HKG' },
        { fullName: 'Macao', iso: ' SAR China,MAC', countryId: 'MAC' },
        { fullName: 'Christmas Island', iso: 'CXR', countryId: 'CXR' },
        { fullName: 'Cocos (Keeling) Islands', iso: 'CCK', countryId: 'CCK' },
        { fullName: 'Colombia', iso: 'COL', countryId: 'COL' },
        { fullName: 'Comoros', iso: 'COM', countryId: 'COM' },
        { fullName: 'Congo (Brazzaville)', iso: 'COG', countryId: 'COG' },
        { fullName: 'Congo', iso: ' (Kinshasa),COD', countryId: 'COD' },
        { fullName: 'Cook Islands', iso: 'COK', countryId: 'COK' },
        { fullName: 'Costa Rica', iso: 'CRI', countryId: 'CRI' },
        { fullName: 'Côte d\'Ivoire', iso: 'CIV', countryId: 'CIV' },
        { fullName: 'Croatia', iso: 'HRV', countryId: 'HRV' },
        { fullName: 'Cuba', iso: 'CUB', countryId: 'CUB' },
        { fullName: 'Cyprus', iso: 'CYP', countryId: 'CYP' },
        { fullName: 'Czech Republic', iso: 'CZE', countryId: 'CZE' },
        { fullName: 'Denmark', iso: 'DNK', countryId: 'DNK' },
        { fullName: 'Djibouti', iso: 'DJI', countryId: 'DJI' },
        { fullName: 'Dominica', iso: 'DMA', countryId: 'DMA' },
        { fullName: 'Dominican Republic', iso: 'DOM', countryId: 'DOM' },
        { fullName: 'Ecuador', iso: 'ECU', countryId: 'ECU' },
        { fullName: 'Egypt', iso: 'EGY', countryId: 'EGY' },
        { fullName: 'El Salvador', iso: 'SLV', countryId: 'SLV' },
        { fullName: 'Equatorial Guinea', iso: 'GNQ', countryId: 'GNQ' },
        { fullName: 'Eritrea', iso: 'ERI', countryId: 'ERI' },
        { fullName: 'Estonia', iso: 'EST', countryId: 'EST' },
        { fullName: 'Ethiopia', iso: 'ETH', countryId: 'ETH' },
        { fullName: 'Falkland Islands (Malvinas)', iso: 'FLK', countryId: 'FLK' },
        { fullName: 'Faroe Islands', iso: 'FRO', countryId: 'FRO' },
        { fullName: 'Fiji', iso: 'FJI', countryId: 'FJI' },
        { fullName: 'Finland', iso: 'FIN', countryId: 'FIN' },
        { fullName: 'France', iso: 'FRA', countryId: 'FRA' },
        { fullName: 'French Guiana', iso: 'GUF', countryId: 'GUF' },
        { fullName: 'French Polynesia', iso: 'PYF', countryId: 'PYF' },
        { fullName: 'French Southern Territories', iso: 'ATF', countryId: 'ATF' },
        { fullName: 'Gabon', iso: 'GAB', countryId: 'GAB' },
        { fullName: 'Gambia', iso: 'GMB', countryId: 'GMB' },
        { fullName: 'Georgia', iso: 'GEO', countryId: 'GEO' },
        { fullName: 'Germany', iso: 'DEU', countryId: 'DEU' },
        { fullName: 'Ghana', iso: 'GHA', countryId: 'GHA' },
        { fullName: 'Gibraltar', iso: 'GIB', countryId: 'GIB' },
        { fullName: 'Greece', iso: 'GRC', countryId: 'GRC' },
        { fullName: 'Greenland', iso: 'GRL', countryId: 'GRL' },
        { fullName: 'Grenada', iso: 'GRD', countryId: 'GRD' },
        { fullName: 'Guadeloupe', iso: 'GLP', countryId: 'GLP' },
        { fullName: 'Guam', iso: 'GUM', countryId: 'GUM' },
        { fullName: 'Guatemala', iso: 'GTM', countryId: 'GTM' },
        { fullName: 'Guernsey', iso: 'GGY', countryId: 'GGY' },
        { fullName: 'Guinea', iso: 'GIN', countryId: 'GIN' },
        { fullName: 'Guinea-Bissau', iso: 'GNB', countryId: 'GNB' },
        { fullName: 'Guyana', iso: 'GUY', countryId: 'GUY' },
        { fullName: 'Haiti', iso: 'HTI', countryId: 'HTI' },
        { fullName: 'Heard and Mcdonald Islands', iso: 'HMD', countryId: 'HMD' },
        { fullName: 'Holy See (Vatican City State)', iso: 'VAT', countryId: 'VAT' },
        { fullName: 'Honduras', iso: 'HND', countryId: 'HND' },
        { fullName: 'Hungary', iso: 'HUN', countryId: 'HUN' },
        { fullName: 'Iceland', iso: 'ISL', countryId: 'ISL' },
        { fullName: 'India', iso: 'IND', countryId: 'IND' },
        { fullName: 'Indonesia', iso: 'IDN', countryId: 'IDN' },
        { fullName: 'Iran', iso: ' Islamic Republic of,IRN', countryId: 'IRN' },
        { fullName: 'Iraq', iso: 'IRQ', countryId: 'IRQ' },
        { fullName: 'Ireland', iso: 'IRL', countryId: 'IRL' },
        { fullName: 'Isle of Man', iso: 'IMN', countryId: 'IMN' },
        { fullName: 'Israel', iso: 'ISR', countryId: 'ISR' },
        { fullName: 'Italy', iso: 'ITA', countryId: 'ITA' },
        { fullName: 'Jamaica', iso: 'JAM', countryId: 'JAM' },
        { fullName: 'Japan', iso: 'JPN', countryId: 'JPN' },
        { fullName: 'Jersey', iso: 'JEY', countryId: 'JEY' },
        { fullName: 'Jordan', iso: 'JOR', countryId: 'JOR' },
        { fullName: 'Kazakhstan', iso: 'KAZ', countryId: 'KAZ' },
        { fullName: 'Kenya', iso: 'KEN', countryId: 'KEN' },
        { fullName: 'Kiribati', iso: 'KIR', countryId: 'KIR' },
        { fullName: 'Korea (North)', iso: 'PRK', countryId: 'PRK' },
        { fullName: 'Korea (South)', iso: 'KOR', countryId: 'KOR' },
        { fullName: 'Kuwait', iso: 'KWT', countryId: 'KWT' },
        { fullName: 'Kyrgyzstan', iso: 'KGZ', countryId: 'KGZ' },
        { fullName: 'Lao PDR', iso: 'LAO', countryId: 'LAO' },
        { fullName: 'Latvia', iso: 'LVA', countryId: 'LVA' },
        { fullName: 'Lebanon', iso: 'LBN', countryId: 'LBN' },
        { fullName: 'Lesotho', iso: 'LSO', countryId: 'LSO' },
        { fullName: 'Liberia', iso: 'LBR', countryId: 'LBR' },
        { fullName: 'Libya', iso: 'LBY', countryId: 'LBY' },
        { fullName: 'Liechtenstein', iso: 'LIE', countryId: 'LIE' },
        { fullName: 'Lithuania', iso: 'LTU', countryId: 'LTU' },
        { fullName: 'Luxembourg', iso: 'LUX', countryId: 'LUX' },
        { fullName: 'Macedonia', iso: ' Republic of,MKD', countryId: 'MKD' },
        { fullName: 'Madagascar', iso: 'MDG', countryId: 'MDG' },
        { fullName: 'Malawi', iso: 'MWI', countryId: 'MWI' },
        { fullName: 'Malaysia', iso: 'MYS', countryId: 'MYS' },
        { fullName: 'Maldives', iso: 'MDV', countryId: 'MDV' },
        { fullName: 'Mali', iso: 'MLI', countryId: 'MLI' },
        { fullName: 'Malta', iso: 'MLT', countryId: 'MLT' },
        { fullName: 'Marshall Islands', iso: 'MHL', countryId: 'MHL' },
        { fullName: 'Martinique', iso: 'MTQ', countryId: 'MTQ' },
        { fullName: 'Mauritania', iso: 'MRT', countryId: 'MRT' },
        { fullName: 'Mauritius', iso: 'MUS', countryId: 'MUS' },
        { fullName: 'Mayotte', iso: 'MYT', countryId: 'MYT' },
        { fullName: 'Mexico', iso: 'MEX', countryId: 'MEX' },
        { fullName: 'Micronesia', iso: ' Federated States of,FSM', countryId: 'FSM' },
        { fullName: 'Moldova', iso: 'MDA', countryId: 'MDA' },
        { fullName: 'Monaco', iso: 'MCO', countryId: 'MCO' },
        { fullName: 'Mongolia', iso: 'MNG', countryId: 'MNG' },
        { fullName: 'Montenegro', iso: 'MNE', countryId: 'MNE' },
        { fullName: 'Montserrat', iso: 'MSR', countryId: 'MSR' },
        { fullName: 'Morocco', iso: 'MAR', countryId: 'MAR' },
        { fullName: 'Mozambique', iso: 'MOZ', countryId: 'MOZ' },
        { fullName: 'Myanmar', iso: 'MMR', countryId: 'MMR' },
        { fullName: 'Namibia', iso: 'NAM', countryId: 'NAM' },
        { fullName: 'Nauru', iso: 'NRU', countryId: 'NRU' },
        { fullName: 'Nepal', iso: 'NPL', countryId: 'NPL' },
        { fullName: 'Netherlands', iso: 'NLD', countryId: 'NLD' },
        { fullName: 'Netherlands Antilles', iso: 'ANT', countryId: 'ANT' },
        { fullName: 'New Caledonia', iso: 'NCL', countryId: 'NCL' },
        { fullName: 'New Zealand', iso: 'NZL', countryId: 'NZL' },
        { fullName: 'Nicaragua', iso: 'NIC', countryId: 'NIC' },
        { fullName: 'Niger', iso: 'NER', countryId: 'NER' },
        { fullName: 'Nigeria', iso: 'NGA', countryId: 'NGA' },
        { fullName: 'Niue', iso: 'NIU', countryId: 'NIU' },
        { fullName: 'Norfolk Island', iso: 'NFK', countryId: 'NFK' },
        { fullName: 'Northern Mariana Islands', iso: 'MNP', countryId: 'MNP' },
        { fullName: 'Norway', iso: 'NOR', countryId: 'NOR' },
        { fullName: 'Oman', iso: 'OMN', countryId: 'OMN' },
        { fullName: 'Pakistan', iso: 'PAK', countryId: 'PAK' },
        { fullName: 'Palau', iso: 'PLW', countryId: 'PLW' },
        { fullName: 'Palestinian Territory', iso: 'PSE', countryId: 'PSE' },
        { fullName: 'Panama', iso: 'PAN', countryId: 'PAN' },
        { fullName: 'Papua New Guinea', iso: 'PNG', countryId: 'PNG' },
        { fullName: 'Paraguay', iso: 'PRY', countryId: 'PRY' },
        { fullName: 'Peru', iso: 'PER', countryId: 'PER' },
        { fullName: 'Philippines', iso: 'PHL', countryId: 'PHL' },
        { fullName: 'Pitcairn', iso: 'PCN', countryId: 'PCN' },
        { fullName: 'Poland', iso: 'POL', countryId: 'POL' },
        { fullName: 'Portugal', iso: 'PRT', countryId: 'PRT' },
        { fullName: 'Puerto Rico', iso: 'PRI', countryId: 'PRI' },
        { fullName: 'Qatar', iso: 'QAT', countryId: 'QAT' },
        { fullName: 'Réunion', iso: 'REU', countryId: 'REU' },
        { fullName: 'Romania', iso: 'ROU', countryId: 'ROU' },
        { fullName: 'Russian Federation', iso: 'RUS', countryId: 'RUS' },
        { fullName: 'Rwanda', iso: 'RWA', countryId: 'RWA' },
        { fullName: 'Saint-Barthélemy', iso: 'BLM', countryId: 'BLM' },
        { fullName: 'Saint Helena', iso: 'SHN', countryId: 'SHN' },
        { fullName: 'Saint Kitts and Nevis', iso: 'KNA', countryId: 'KNA' },
        { fullName: 'Saint Lucia', iso: 'LCA', countryId: 'LCA' },
        { fullName: 'Saint-Martin (French part)', iso: 'MAF', countryId: 'MAF' },
        { fullName: 'Saint Pierre and Miquelon', iso: 'SPM', countryId: 'SPM' },
        { fullName: 'Saint Vincent and Grenadines', iso: 'VCT', countryId: 'VCT' },
        { fullName: 'Samoa', iso: 'WSM', countryId: 'WSM' },
        { fullName: 'San Marino', iso: 'SMR', countryId: 'SMR' },
        { fullName: 'Sao Tome and Principe', iso: 'STP', countryId: 'STP' },
        { fullName: 'Saudi Arabia', iso: 'SAU', countryId: 'SAU' },
        { fullName: 'Senegal', iso: 'SEN', countryId: 'SEN' },
        { fullName: 'Serbia', iso: 'SRB', countryId: 'SRB' },
        { fullName: 'Seychelles', iso: 'SYC', countryId: 'SYC' },
        { fullName: 'Sierra Leone', iso: 'SLE', countryId: 'SLE' },
        { fullName: 'Singapore', iso: 'SGP', countryId: 'SGP' },
        { fullName: 'Slovakia', iso: 'SVK', countryId: 'SVK' },
        { fullName: 'Slovenia', iso: 'SVN', countryId: 'SVN' },
        { fullName: 'Solomon Islands', iso: 'SLB', countryId: 'SLB' },
        { fullName: 'Somalia', iso: 'SOM', countryId: 'SOM' },
        { fullName: 'South Africa', iso: 'ZAF', countryId: 'ZAF' },
        { fullName: 'South Georgia and the South Sandwich Islands', iso: 'SGS', countryId: 'SGS' },
        { fullName: 'South Sudan', iso: 'SSD', countryId: 'SSD' },
        { fullName: 'Spain', iso: 'ESP', countryId: 'ESP' },
        { fullName: 'Sri Lanka', iso: 'LKA', countryId: 'LKA' },
        { fullName: 'Sudan', iso: 'SDN', countryId: 'SDN' },
        { fullName: 'Suriname', iso: 'SUR', countryId: 'SUR' },
        { fullName: 'Svalbard and Jan Mayen Islands', iso: 'SJM', countryId: 'SJM' },
        { fullName: 'Swaziland', iso: 'SWZ', countryId: 'SWZ' },
        { fullName: 'Sweden', iso: 'SWE', countryId: 'SWE' },
        { fullName: 'Switzerland', iso: 'CHE', countryId: 'CHE' },
        { fullName: 'Syrian Arab Republic (Syria)', iso: 'SYR', countryId: 'SYR' },
        { fullName: 'Taiwan', iso: ' Republic of China,TWN', countryId: 'TWN' },
        { fullName: 'Tajikistan', iso: 'TJK', countryId: 'TJK' },
        { fullName: 'Tanzania', iso: ' United Republic of,TZA', countryId: 'TZA' },
        { fullName: 'Thailand', iso: 'THA', countryId: 'THA' },
        { fullName: 'Timor-Leste', iso: 'TLS', countryId: 'TLS' },
        { fullName: 'Togo', iso: 'TGO', countryId: 'TGO' },
        { fullName: 'Tokelau', iso: 'TKL', countryId: 'TKL' },
        { fullName: 'Tonga', iso: 'TON', countryId: 'TON' },
        { fullName: 'Trinidad and Tobago', iso: 'TTO', countryId: 'TTO' },
        { fullName: 'Tunisia', iso: 'TUN', countryId: 'TUN' },
        { fullName: 'Turkey', iso: 'TUR', countryId: 'TUR' },
        { fullName: 'Turkmenistan', iso: 'TKM', countryId: 'TKM' },
        { fullName: 'Turks and Caicos Islands', iso: 'TCA', countryId: 'TCA' },
        { fullName: 'Tuvalu', iso: 'TUV', countryId: 'TUV' },
        { fullName: 'Uganda', iso: 'UGA', countryId: 'UGA' },
        { fullName: 'Ukraine', iso: 'UKR', countryId: 'UKR' },
        { fullName: 'United Arab Emirates', iso: 'ARE', countryId: 'ARE' },
        { fullName: 'United Kingdom', iso: 'GBR', countryId: 'GBR' },
        { fullName: 'United States of America', iso: 'USA', countryId: 'USA' },
        { fullName: 'US Minor Outlying Islands', iso: 'UMI', countryId: 'UMI' },
        { fullName: 'Uruguay', iso: 'URY', countryId: 'URY' },
        { fullName: 'Uzbekistan', iso: 'UZB', countryId: 'UZB' },
        { fullName: 'Vanuatu', iso: 'VUT', countryId: 'VUT' },
        { fullName: 'Venezuela (Bolivarian Republic)', iso: 'VEN', countryId: 'VEN' },
        { fullName: 'Viet Nam', iso: 'VNM', countryId: 'VNM' },
        { fullName: 'Virgin Islands', iso: ' US,VIR', countryId: 'VIR' },
        { fullName: 'Wallis and Futuna Islands', iso: 'WLF', countryId: 'WLF' },
        { fullName: 'Western Sahara', iso: 'ESH', countryId: 'ESH' },
        { fullName: 'Yemen', iso: 'YEM', countryId: 'YEM' },
        { fullName: 'Zambia', iso: 'ZMB', countryId: 'ZMB' },
        { fullName: 'Zimbabwe', iso: 'ZWE', countryId: 'ZWE' },
        */
    ],

    adminLevels: {
        1: [
            {
                adminLevelId: 1,
                level: 1,
                name: 'Country',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 2,
                level: 2,
                name: 'Zone',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 3,
                level: 3,
                name: 'District',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 4,
                level: 4,
                name: 'GABISA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 5,
                level: 5,
                name: 'HABUSA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 6,
                level: 6,
                name: 'ABUSA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 7,
                level: 7,
                name: 'HABUSA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
        ],
        2: [
            {
                adminLevelId: 1,
                level: 1,
                name: 'Country',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 2,
                level: 2,
                name: 'Zone',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 3,
                level: 3,
                name: 'District',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 4,
                level: 4,
                name: 'GABISA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
        ],
    },

    activeProject: 1,

    activeCountry: undefined,
};
export default initialDomainDataState;
