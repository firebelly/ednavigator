<?php

return [
    'fields' => [
        'ideasContentBlocks' => [
            'types' => [
                'generalContent' => [
                    'tabs' => [[
                        'label' => 'Content',
                        'fields' => ['contentBlock'],
                    ], [
                        'label' => 'Family Narrative',
                        'fields' => ['familyNarrativeImage', 'familyNarrativeHeadline', 'familyNarrativeCopy'],
                    ], [
                        'label' => 'Aside Quote',
                        'fields' => ['asideQuote', 'asideQuoteAttribution'],
                    ], [
                        'label' => 'Aside Stat',
                        'fields' => ['asideStatFigure', 'asideStatAttribution'],
                    ]],
                ],
            ],
        ],
    ],
];