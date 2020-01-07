export default {
    name: 'game',
    type: 'document',
    title: 'Spill',
    fields: [
        {
            name: 'name',
            type: 'string',
            title: 'Navn på spill',
            validation: Rule => Rule.required(),
        },
        {
            name: 'id',
            type: 'string',
            title: 'Identifikator for spill',
            validation: Rule => Rule.required(),
        },
        {
            name: 'level',
            type: 'string',
            title: 'Nivå',
            validation: Rule => Rule.required(),
            options: {
                list: [
                    { title: 'Lett', value: 'lett' },
                    { title: 'Medium', value: 'medium' },
                    { title: 'Vanskelig', value: 'vanskelig' },
                ],
            },
        },
        {
            name: 'result_html',
            type: 'text',
            title: 'Resultat html',
        },
        {
            name: 'asset_texts',
            type: 'array',
            title: 'Hjelpetekster',
            validation: Rule => Rule.required(),
            of: [{ type: 'string' }],
        },
    ],
};
