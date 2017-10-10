const initialDomainDataState = {
    leads: [
        {
            createdOn: 17263871623,
            createdBy: 'Frozen Helium',
            title: 'Family reunification in Greece with spouse in Syria',
            published: 1230129312,
            confidentiality: 'Confidential',
            source: 'https://facebook.com',
            numberOfEntries: 12,
            status: 'Pending',
            actions: 'GG WP',
        },
        {
            createdOn: 78923230239,
            createdBy: 'Bibek Dahal',
            title: 'Voluntary return home and coming back to the EU',
            published: 981274203420,
            confidentiality: 'Public',
            source: 'News that moves',
            numberOfEntries: 6,
            status: 'Processed',
            actions: 'GG WP',
        },
    ],

    users: {
        1: {
            information: {
                id: 1,
                username: 'hari@hari.com',
                email: 'hari@hari.com',
                firstName: 'hari',
                lastName: 'hari',
                displayPicture: null,
                organization: 'hari',
            },
            projects: [
                {
                    name: 'Toggle crisis',
                    rights: 'Admin',
                    createdOn: 1023339302,
                    status: 'Active',
                    lastModified: 2003320921,
                    members: 10,
                    actions: 'GG WP',
                },
                {
                    name: 'Bibek ko birthday',
                    rights: 'Admin',
                    createdOn: 1023339302,
                    status: 'Active',
                    lastModified: 2003320921,
                    members: 10,
                    actions: 'GG WP',
                },
            ],
        },
    },

    countries: [
        { fullName: 'Afghanistan', iso: 'AFG' },
        { fullName: 'Aland Islands', iso: 'ALA' },
        { fullName: 'Albania', iso: 'ALB' },
        { fullName: 'Algeria', iso: 'DZA' },
        { fullName: 'American Samoa', iso: 'ASM' },
        { fullName: 'Andorra', iso: 'AND' },
        { fullName: 'Angola', iso: 'AGO' },
        { fullName: 'Anguilla', iso: 'AIA' },
        { fullName: 'Antarctica', iso: 'ATA' },
        { fullName: 'Antigua and Barbuda', iso: 'ATG' },
        { fullName: 'Argentina', iso: 'ARG' },
        { fullName: 'Armenia', iso: 'ARM' },
        { fullName: 'Aruba', iso: 'ABW' },
        { fullName: 'Australia', iso: 'AUS' },
        { fullName: 'Austria', iso: 'AUT' },
        { fullName: 'Azerbaijan', iso: 'AZE' },
        { fullName: 'Bahamas', iso: 'BHS' },
        { fullName: 'Bahrain', iso: 'BHR' },
        { fullName: 'Bangladesh', iso: 'BGD' },
        { fullName: 'Barbados', iso: 'BRB' },
        { fullName: 'Belarus', iso: 'BLR' },
        { fullName: 'Belgium', iso: 'BEL' },
        { fullName: 'Belize', iso: 'BLZ' },
        { fullName: 'Benin', iso: 'BEN' },
        { fullName: 'Bermuda', iso: 'BMU' },
        { fullName: 'Bhutan', iso: 'BTN' },
        { fullName: 'Bolivia', iso: 'BOL' },
        { fullName: 'Bosnia and Herzegovina', iso: 'BIH' },
        { fullName: 'Botswana', iso: 'BWA' },
        { fullName: 'Bouvet Island', iso: 'BVT' },
        { fullName: 'Brazil', iso: 'BRA' },
        { fullName: 'British Virgin Islands', iso: 'VGB' },
        { fullName: 'British Indian Ocean Territory', iso: 'IOT' },
        { fullName: 'Brunei Darussalam', iso: 'BRN' },
        { fullName: 'Bulgaria', iso: 'BGR' },
        { fullName: 'Burkina Faso', iso: 'BFA' },
        { fullName: 'Burundi', iso: 'BDI' },
        { fullName: 'Cambodia', iso: 'KHM' },
        { fullName: 'Cameroon', iso: 'CMR' },
        { fullName: 'Canada', iso: 'CAN' },
        { fullName: 'Cape Verde', iso: 'CPV' },
        { fullName: 'Cayman Islands', iso: 'CYM' },
        { fullName: 'Central African Republic', iso: 'CAF' },
        { fullName: 'Chad', iso: 'TCD' },
        { fullName: 'Chile', iso: 'CHL' },
        { fullName: 'China', iso: 'CHN' },
        { fullName: 'Hong Kong', iso: ' SAR China,HKG' },
        { fullName: 'Macao', iso: ' SAR China,MAC' },
        { fullName: 'Christmas Island', iso: 'CXR' },
        { fullName: 'Cocos (Keeling) Islands', iso: 'CCK' },
        { fullName: 'Colombia', iso: 'COL' },
        { fullName: 'Comoros', iso: 'COM' },
        { fullName: 'Congo (Brazzaville)', iso: 'COG' },
        { fullName: 'Congo', iso: ' (Kinshasa),COD' },
        { fullName: 'Cook Islands', iso: 'COK' },
        { fullName: 'Costa Rica', iso: 'CRI' },
        { fullName: 'Côte d\'Ivoire', iso: 'CIV' },
        { fullName: 'Croatia', iso: 'HRV' },
        { fullName: 'Cuba', iso: 'CUB' },
        { fullName: 'Cyprus', iso: 'CYP' },
        { fullName: 'Czech Republic', iso: 'CZE' },
        { fullName: 'Denmark', iso: 'DNK' },
        { fullName: 'Djibouti', iso: 'DJI' },
        { fullName: 'Dominica', iso: 'DMA' },
        { fullName: 'Dominican Republic', iso: 'DOM' },
        { fullName: 'Ecuador', iso: 'ECU' },
        { fullName: 'Egypt', iso: 'EGY' },
        { fullName: 'El Salvador', iso: 'SLV' },
        { fullName: 'Equatorial Guinea', iso: 'GNQ' },
        { fullName: 'Eritrea', iso: 'ERI' },
        { fullName: 'Estonia', iso: 'EST' },
        { fullName: 'Ethiopia', iso: 'ETH' },
        { fullName: 'Falkland Islands (Malvinas)', iso: 'FLK' },
        { fullName: 'Faroe Islands', iso: 'FRO' },
        { fullName: 'Fiji', iso: 'FJI' },
        { fullName: 'Finland', iso: 'FIN' },
        { fullName: 'France', iso: 'FRA' },
        { fullName: 'French Guiana', iso: 'GUF' },
        { fullName: 'French Polynesia', iso: 'PYF' },
        { fullName: 'French Southern Territories', iso: 'ATF' },
        { fullName: 'Gabon', iso: 'GAB' },
        { fullName: 'Gambia', iso: 'GMB' },
        { fullName: 'Georgia', iso: 'GEO' },
        { fullName: 'Germany', iso: 'DEU' },
        { fullName: 'Ghana', iso: 'GHA' },
        { fullName: 'Gibraltar', iso: 'GIB' },
        { fullName: 'Greece', iso: 'GRC' },
        { fullName: 'Greenland', iso: 'GRL' },
        { fullName: 'Grenada', iso: 'GRD' },
        { fullName: 'Guadeloupe', iso: 'GLP' },
        { fullName: 'Guam', iso: 'GUM' },
        { fullName: 'Guatemala', iso: 'GTM' },
        { fullName: 'Guernsey', iso: 'GGY' },
        { fullName: 'Guinea', iso: 'GIN' },
        { fullName: 'Guinea-Bissau', iso: 'GNB' },
        { fullName: 'Guyana', iso: 'GUY' },
        { fullName: 'Haiti', iso: 'HTI' },
        { fullName: 'Heard and Mcdonald Islands', iso: 'HMD' },
        { fullName: 'Holy See (Vatican City State)', iso: 'VAT' },
        { fullName: 'Honduras', iso: 'HND' },
        { fullName: 'Hungary', iso: 'HUN' },
        { fullName: 'Iceland', iso: 'ISL' },
        { fullName: 'India', iso: 'IND' },
        { fullName: 'Indonesia', iso: 'IDN' },
        { fullName: 'Iran', iso: ' Islamic Republic of,IRN' },
        { fullName: 'Iraq', iso: 'IRQ' },
        { fullName: 'Ireland', iso: 'IRL' },
        { fullName: 'Isle of Man', iso: 'IMN' },
        { fullName: 'Israel', iso: 'ISR' },
        { fullName: 'Italy', iso: 'ITA' },
        { fullName: 'Jamaica', iso: 'JAM' },
        { fullName: 'Japan', iso: 'JPN' },
        { fullName: 'Jersey', iso: 'JEY' },
        { fullName: 'Jordan', iso: 'JOR' },
        { fullName: 'Kazakhstan', iso: 'KAZ' },
        { fullName: 'Kenya', iso: 'KEN' },
        { fullName: 'Kiribati', iso: 'KIR' },
        { fullName: 'Korea (North)', iso: 'PRK' },
        { fullName: 'Korea (South)', iso: 'KOR' },
        { fullName: 'Kuwait', iso: 'KWT' },
        { fullName: 'Kyrgyzstan', iso: 'KGZ' },
        { fullName: 'Lao PDR', iso: 'LAO' },
        { fullName: 'Latvia', iso: 'LVA' },
        { fullName: 'Lebanon', iso: 'LBN' },
        { fullName: 'Lesotho', iso: 'LSO' },
        { fullName: 'Liberia', iso: 'LBR' },
        { fullName: 'Libya', iso: 'LBY' },
        { fullName: 'Liechtenstein', iso: 'LIE' },
        { fullName: 'Lithuania', iso: 'LTU' },
        { fullName: 'Luxembourg', iso: 'LUX' },
        { fullName: 'Macedonia', iso: ' Republic of,MKD' },
        { fullName: 'Madagascar', iso: 'MDG' },
        { fullName: 'Malawi', iso: 'MWI' },
        { fullName: 'Malaysia', iso: 'MYS' },
        { fullName: 'Maldives', iso: 'MDV' },
        { fullName: 'Mali', iso: 'MLI' },
        { fullName: 'Malta', iso: 'MLT' },
        { fullName: 'Marshall Islands', iso: 'MHL' },
        { fullName: 'Martinique', iso: 'MTQ' },
        { fullName: 'Mauritania', iso: 'MRT' },
        { fullName: 'Mauritius', iso: 'MUS' },
        { fullName: 'Mayotte', iso: 'MYT' },
        { fullName: 'Mexico', iso: 'MEX' },
        { fullName: 'Micronesia', iso: ' Federated States of,FSM' },
        { fullName: 'Moldova', iso: 'MDA' },
        { fullName: 'Monaco', iso: 'MCO' },
        { fullName: 'Mongolia', iso: 'MNG' },
        { fullName: 'Montenegro', iso: 'MNE' },
        { fullName: 'Montserrat', iso: 'MSR' },
        { fullName: 'Morocco', iso: 'MAR' },
        { fullName: 'Mozambique', iso: 'MOZ' },
        { fullName: 'Myanmar', iso: 'MMR' },
        { fullName: 'Namibia', iso: 'NAM' },
        { fullName: 'Nauru', iso: 'NRU' },
        { fullName: 'Nepal', iso: 'NPL' },
        { fullName: 'Netherlands', iso: 'NLD' },
        { fullName: 'Netherlands Antilles', iso: 'ANT' },
        { fullName: 'New Caledonia', iso: 'NCL' },
        { fullName: 'New Zealand', iso: 'NZL' },
        { fullName: 'Nicaragua', iso: 'NIC' },
        { fullName: 'Niger', iso: 'NER' },
        { fullName: 'Nigeria', iso: 'NGA' },
        { fullName: 'Niue', iso: 'NIU' },
        { fullName: 'Norfolk Island', iso: 'NFK' },
        { fullName: 'Northern Mariana Islands', iso: 'MNP' },
        { fullName: 'Norway', iso: 'NOR' },
        { fullName: 'Oman', iso: 'OMN' },
        { fullName: 'Pakistan', iso: 'PAK' },
        { fullName: 'Palau', iso: 'PLW' },
        { fullName: 'Palestinian Territory', iso: 'PSE' },
        { fullName: 'Panama', iso: 'PAN' },
        { fullName: 'Papua New Guinea', iso: 'PNG' },
        { fullName: 'Paraguay', iso: 'PRY' },
        { fullName: 'Peru', iso: 'PER' },
        { fullName: 'Philippines', iso: 'PHL' },
        { fullName: 'Pitcairn', iso: 'PCN' },
        { fullName: 'Poland', iso: 'POL' },
        { fullName: 'Portugal', iso: 'PRT' },
        { fullName: 'Puerto Rico', iso: 'PRI' },
        { fullName: 'Qatar', iso: 'QAT' },
        { fullName: 'Réunion', iso: 'REU' },
        { fullName: 'Romania', iso: 'ROU' },
        { fullName: 'Russian Federation', iso: 'RUS' },
        { fullName: 'Rwanda', iso: 'RWA' },
        { fullName: 'Saint-Barthélemy', iso: 'BLM' },
        { fullName: 'Saint Helena', iso: 'SHN' },
        { fullName: 'Saint Kitts and Nevis', iso: 'KNA' },
        { fullName: 'Saint Lucia', iso: 'LCA' },
        { fullName: 'Saint-Martin (French part)', iso: 'MAF' },
        { fullName: 'Saint Pierre and Miquelon', iso: 'SPM' },
        { fullName: 'Saint Vincent and Grenadines', iso: 'VCT' },
        { fullName: 'Samoa', iso: 'WSM' },
        { fullName: 'San Marino', iso: 'SMR' },
        { fullName: 'Sao Tome and Principe', iso: 'STP' },
        { fullName: 'Saudi Arabia', iso: 'SAU' },
        { fullName: 'Senegal', iso: 'SEN' },
        { fullName: 'Serbia', iso: 'SRB' },
        { fullName: 'Seychelles', iso: 'SYC' },
        { fullName: 'Sierra Leone', iso: 'SLE' },
        { fullName: 'Singapore', iso: 'SGP' },
        { fullName: 'Slovakia', iso: 'SVK' },
        { fullName: 'Slovenia', iso: 'SVN' },
        { fullName: 'Solomon Islands', iso: 'SLB' },
        { fullName: 'Somalia', iso: 'SOM' },
        { fullName: 'South Africa', iso: 'ZAF' },
        { fullName: 'South Georgia and the South Sandwich Islands', iso: 'SGS' },
        { fullName: 'South Sudan', iso: 'SSD' },
        { fullName: 'Spain', iso: 'ESP' },
        { fullName: 'Sri Lanka', iso: 'LKA' },
        { fullName: 'Sudan', iso: 'SDN' },
        { fullName: 'Suriname', iso: 'SUR' },
        { fullName: 'Svalbard and Jan Mayen Islands', iso: 'SJM' },
        { fullName: 'Swaziland', iso: 'SWZ' },
        { fullName: 'Sweden', iso: 'SWE' },
        { fullName: 'Switzerland', iso: 'CHE' },
        { fullName: 'Syrian Arab Republic (Syria)', iso: 'SYR' },
        { fullName: 'Taiwan', iso: ' Republic of China,TWN' },
        { fullName: 'Tajikistan', iso: 'TJK' },
        { fullName: 'Tanzania', iso: ' United Republic of,TZA' },
        { fullName: 'Thailand', iso: 'THA' },
        { fullName: 'Timor-Leste', iso: 'TLS' },
        { fullName: 'Togo', iso: 'TGO' },
        { fullName: 'Tokelau', iso: 'TKL' },
        { fullName: 'Tonga', iso: 'TON' },
        { fullName: 'Trinidad and Tobago', iso: 'TTO' },
        { fullName: 'Tunisia', iso: 'TUN' },
        { fullName: 'Turkey', iso: 'TUR' },
        { fullName: 'Turkmenistan', iso: 'TKM' },
        { fullName: 'Turks and Caicos Islands', iso: 'TCA' },
        { fullName: 'Tuvalu', iso: 'TUV' },
        { fullName: 'Uganda', iso: 'UGA' },
        { fullName: 'Ukraine', iso: 'UKR' },
        { fullName: 'United Arab Emirates', iso: 'ARE' },
        { fullName: 'United Kingdom', iso: 'GBR' },
        { fullName: 'United States of America', iso: 'USA' },
        { fullName: 'US Minor Outlying Islands', iso: 'UMI' },
        { fullName: 'Uruguay', iso: 'URY' },
        { fullName: 'Uzbekistan', iso: 'UZB' },
        { fullName: 'Vanuatu', iso: 'VUT' },
        { fullName: 'Venezuela (Bolivarian Republic)', iso: 'VEN' },
        { fullName: 'Viet Nam', iso: 'VNM' },
        { fullName: 'Virgin Islands', iso: ' US,VIR' },
        { fullName: 'Wallis and Futuna Islands', iso: 'WLF' },
        { fullName: 'Western Sahara', iso: 'ESH' },
        { fullName: 'Yemen', iso: 'YEM' },
        { fullName: 'Zambia', iso: 'ZMB' },
        { fullName: 'Zimbabwe', iso: 'ZWE' },
    ],

};
export default initialDomainDataState;
